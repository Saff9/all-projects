use std::cmp::Ordering;
use crate::error::{DocError, Result};
use crate::query::filter::QueryFilter;
use crate::value::types::DocValue;

pub struct AggregationPipeline;

impl AggregationPipeline {
    /// Execute an aggregation pipeline across a collection of input documents.
    pub fn execute(docs: Vec<DocValue>, pipeline: &[DocValue]) -> Result<Vec<DocValue>> {
        let mut current_stream = docs;

        for stage in pipeline {
            let stage_obj = stage.as_object().ok_or_else(|| {
                DocError::InvalidAggregation("Pipeline stage must be an object".to_string())
            })?;

            if stage_obj.len() != 1 {
                return Err(DocError::InvalidAggregation(
                    "Each pipeline stage must have exactly one stage operator".to_string(),
                ));
            }

            let (stage_name, stage_arg) = &stage_obj[0];

            current_stream = match stage_name.as_str() {
                "$match" => Self::stage_match(current_stream, stage_arg)?,
                "$project" => Self::stage_project(current_stream, stage_arg)?,
                "$addFields" | "$set" => Self::stage_add_fields(current_stream, stage_arg)?,
                "$group" => Self::stage_group(current_stream, stage_arg)?,
                "$sort" => Self::stage_sort(current_stream, stage_arg)?,
                "$skip" => Self::stage_skip(current_stream, stage_arg)?,
                "$limit" => Self::stage_limit(current_stream, stage_arg)?,
                "$unwind" => Self::stage_unwind(current_stream, stage_arg)?,
                "$count" => Self::stage_count(current_stream, stage_arg)?,
                other => {
                    return Err(DocError::InvalidAggregation(format!(
                        "Unsupported aggregation stage '{}'",
                        other
                    )))
                }
            };
        }

        Ok(current_stream)
    }

    fn stage_match(docs: Vec<DocValue>, filter: &DocValue) -> Result<Vec<DocValue>> {
        let mut output = Vec::new();
        for doc in docs {
            if QueryFilter::matches(&doc, filter)? {
                output.push(doc);
            }
        }
        Ok(output)
    }

    fn stage_project(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let spec_obj = spec.as_object().ok_or_else(|| {
            DocError::InvalidAggregation("$project specification must be an object".to_string())
        })?;

        let mut output = Vec::with_capacity(docs.len());

        // Check if inclusion mode (1) or exclusion mode (0)
        let mut is_inclusion = false;
        for (k, v) in spec_obj {
            if k != "_id" && (v.as_i64() == Some(1) || v.as_bool() == Some(true)) {
                is_inclusion = true;
                break;
            }
        }

        let include_id = spec_obj
            .iter()
            .find(|(k, _)| k == "_id")
            .map(|(_, v)| v.as_i64() != Some(0) && v.as_bool() != Some(false))
            .unwrap_or(true);

        for doc in docs {
            let mut new_doc = DocValue::Object(Vec::new());

            if is_inclusion {
                if include_id {
                    if let Some(id_val) = doc.get("_id") {
                        new_doc.insert_field("_id", id_val.clone());
                    }
                }
                for (k, v) in spec_obj {
                    if k == "_id" {
                        continue;
                    }
                    if v.as_i64() == Some(1) || v.as_bool() == Some(true) {
                        if let Some(val) = doc.get_path(k) {
                            new_doc.set_path(k, val.clone())?;
                        }
                    } else if let DocValue::String(expr) = v {
                        if expr.starts_with('$') {
                            let path = &expr[1..];
                            if let Some(val) = doc.get_path(path) {
                                new_doc.set_path(k, val.clone())?;
                            }
                        }
                    }
                }
            } else {
                // Exclusion mode
                new_doc = doc.clone();
                for (k, v) in spec_obj {
                    if v.as_i64() == Some(0) || v.as_bool() == Some(false) {
                        new_doc.remove_path(k);
                    }
                }
            }

            output.push(new_doc);
        }

        Ok(output)
    }

    fn stage_add_fields(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let spec_obj = spec.as_object().ok_or_else(|| {
            DocError::InvalidAggregation("$addFields specification must be an object".to_string())
        })?;

        let mut output = Vec::with_capacity(docs.len());

        for mut doc in docs {
            for (k, v) in spec_obj {
                if let DocValue::String(s) = v {
                    if s.starts_with('$') {
                        let path = &s[1..];
                        let val = doc.get_path(path).cloned().unwrap_or(DocValue::Null);
                        doc.set_path(k, val)?;
                        continue;
                    }
                }
                doc.set_path(k, v.clone())?;
            }
            output.push(doc);
        }

        Ok(output)
    }

    fn stage_group(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let spec_obj = spec.as_object().ok_or_else(|| {
            DocError::InvalidAggregation("$group specification must be an object".to_string())
        })?;

        let id_expr = spec_obj
            .iter()
            .find(|(k, _)| k == "_id")
            .map(|(_, v)| v)
            .ok_or_else(|| DocError::InvalidAggregation("$group requires an '_id' field".to_string()))?;

        // Map group key -> list of documents in group
        let mut groups: Vec<(DocValue, Vec<DocValue>)> = Vec::new();

        for doc in docs {
            let group_key = match id_expr {
                DocValue::Null => DocValue::Null,
                DocValue::String(s) if s.starts_with('$') => {
                    let path = &s[1..];
                    doc.get_path(path).cloned().unwrap_or(DocValue::Null)
                }
                other => other.clone(),
            };

            let mut found = false;
            for (k, group_docs) in &mut groups {
                if k == &group_key {
                    group_docs.push(doc.clone());
                    found = true;
                    break;
                }
            }

            if !found {
                groups.push((group_key, vec![doc]));
            }
        }

        let mut output = Vec::new();

        for (group_key, group_docs) in groups {
            let mut result_doc = DocValue::Object(vec![("_id".to_string(), group_key)]);

            for (field_name, accum_spec) in spec_obj {
                if field_name == "_id" {
                    continue;
                }

                let accum_obj = accum_spec.as_object().ok_or_else(|| {
                    DocError::InvalidAggregation(format!(
                        "Accumulator for field '{}' must be an object",
                        field_name
                    ))
                })?;

                if accum_obj.is_empty() {
                    continue;
                }

                let (accum_op, accum_expr) = &accum_obj[0];

                let accum_value = Self::compute_accumulator(accum_op, accum_expr, &group_docs)?;
                result_doc.insert_field(field_name, accum_value);
            }

            output.push(result_doc);
        }

        Ok(output)
    }

    fn compute_accumulator(op: &str, expr: &DocValue, docs: &[DocValue]) -> Result<DocValue> {
        let extract_num = |doc: &DocValue| -> Option<f64> {
            match expr {
                DocValue::Int32(n) => Some(*n as f64),
                DocValue::Int64(n) => Some(*n as f64),
                DocValue::Float64(f) => Some(*f),
                DocValue::String(s) if s.starts_with('$') => {
                    let path = &s[1..];
                    doc.get_path(path).and_then(|v| v.as_f64())
                }
                _ => None,
            }
        };

        let extract_val = |doc: &DocValue| -> DocValue {
            match expr {
                DocValue::String(s) if s.starts_with('$') => {
                    let path = &s[1..];
                    doc.get_path(path).cloned().unwrap_or(DocValue::Null)
                }
                other => other.clone(),
            }
        };

        match op {
            "$sum" => {
                let mut sum = 0.0;
                for d in docs {
                    if let Some(n) = extract_num(d) {
                        sum += n;
                    }
                }
                if sum.fract() == 0.0 {
                    Ok(DocValue::Int64(sum as i64))
                } else {
                    Ok(DocValue::Float64(sum))
                }
            }
            "$avg" => {
                let mut sum = 0.0;
                let mut count = 0;
                for d in docs {
                    if let Some(n) = extract_num(d) {
                        sum += n;
                        count += 1;
                    }
                }
                if count == 0 {
                    Ok(DocValue::Null)
                } else {
                    Ok(DocValue::Float64(sum / count as f64))
                }
            }
            "$min" => {
                let mut min_val: Option<DocValue> = None;
                for d in docs {
                    let val = extract_val(d);
                    if !val.is_null() {
                        min_val = match min_val {
                            Some(curr) => Some(curr.min(val)),
                            None => Some(val),
                        };
                    }
                }
                Ok(min_val.unwrap_or(DocValue::Null))
            }
            "$max" => {
                let mut max_val: Option<DocValue> = None;
                for d in docs {
                    let val = extract_val(d);
                    if !val.is_null() {
                        max_val = match max_val {
                            Some(curr) => Some(curr.max(val)),
                            None => Some(val),
                        };
                    }
                }
                Ok(max_val.unwrap_or(DocValue::Null))
            }
            "$count" => Ok(DocValue::Int64(docs.len() as i64)),
            "$first" => {
                if let Some(first) = docs.first() {
                    Ok(extract_val(first))
                } else {
                    Ok(DocValue::Null)
                }
            }
            "$last" => {
                if let Some(last) = docs.last() {
                    Ok(extract_val(last))
                } else {
                    Ok(DocValue::Null)
                }
            }
            "$push" => {
                let items: Vec<DocValue> = docs.iter().map(extract_val).collect();
                Ok(DocValue::Array(items))
            }
            "$addToSet" => {
                let mut items: Vec<DocValue> = Vec::new();
                for d in docs {
                    let val = extract_val(d);
                    if !items.contains(&val) {
                        items.push(val);
                    }
                }
                Ok(DocValue::Array(items))
            }
            other => Err(DocError::InvalidAggregation(format!(
                "Unsupported group accumulator '{}'",
                other
            ))),
        }
    }

    fn stage_sort(mut docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let sort_obj = spec.as_object().ok_or_else(|| {
            DocError::InvalidAggregation("$sort specification must be an object".to_string())
        })?;

        docs.sort_by(|a, b| {
            for (field, dir) in sort_obj {
                let val_a = a.get_path(field).unwrap_or(&DocValue::Null);
                let val_b = b.get_path(field).unwrap_or(&DocValue::Null);
                let is_desc = dir.as_i64() == Some(-1);

                let cmp = val_a.cmp(val_b);
                if cmp != Ordering::Equal {
                    return if is_desc { cmp.reverse() } else { cmp };
                }
            }
            Ordering::Equal
        });

        Ok(docs)
    }

    fn stage_skip(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let count = spec.as_i64().ok_or_else(|| {
            DocError::InvalidAggregation("$skip requires a positive integer".to_string())
        })? as usize;

        Ok(docs.into_iter().skip(count).collect())
    }

    fn stage_limit(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let count = spec.as_i64().ok_or_else(|| {
            DocError::InvalidAggregation("$limit requires a positive integer".to_string())
        })? as usize;

        Ok(docs.into_iter().take(count).collect())
    }

    fn stage_unwind(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let path = match spec {
            DocValue::String(s) => {
                if s.starts_with('$') {
                    &s[1..]
                } else {
                    s.as_str()
                }
            }
            _ => return Err(DocError::InvalidAggregation("$unwind requires field path string".to_string())),
        };

        let mut output = Vec::new();

        for doc in docs {
            if let Some(DocValue::Array(arr)) = doc.get_path(path) {
                for item in arr {
                    let mut unwound = doc.clone();
                    unwound.set_path(path, item.clone())?;
                    output.push(unwound);
                }
            } else if let Some(val) = doc.get_path(path) {
                // If it's a single non-array value, unwind outputs the single document
                let mut unwound = doc.clone();
                unwound.set_path(path, val.clone())?;
                output.push(unwound);
            }
        }

        Ok(output)
    }

    fn stage_count(docs: Vec<DocValue>, spec: &DocValue) -> Result<Vec<DocValue>> {
        let field_name = spec.as_str().unwrap_or("count");
        let result = DocValue::Object(vec![(field_name.to_string(), DocValue::Int64(docs.len() as i64))]);
        Ok(vec![result])
    }
}
