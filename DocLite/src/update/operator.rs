use std::time::{SystemTime, UNIX_EPOCH};
use crate::error::{DocError, Result};
use crate::query::filter::QueryFilter;
use crate::value::types::DocValue;

pub struct UpdateEngine;

impl UpdateEngine {
    /// Apply an update specification (or full replacement) to a document.
    pub fn apply_update(doc: &mut DocValue, update_spec: &DocValue) -> Result<bool> {
        let spec_obj = update_spec.as_object().ok_or_else(|| {
            DocError::InvalidUpdate("Update specification must be an object".to_string())
        })?;

        if spec_obj.is_empty() {
            return Ok(false);
        }

        // Check if top-level contains operators ($set, $inc, etc.)
        let has_operators = spec_obj.iter().any(|(k, _)| k.starts_with('$'));

        if !has_operators {
            // Full Document Replacement (preserve _id)
            let existing_id = doc.get("_id").cloned();
            *doc = update_spec.clone();
            if let Some(id) = existing_id {
                doc.insert_field("_id", id);
            }
            return Ok(true);
        }

        let mut modified = false;

        for (op, arg) in spec_obj {
            match op.as_str() {
                "$set" => {
                    let set_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$set operand must be an object".to_string())
                    })?;
                    for (path, val) in set_fields {
                        if path == "_id" {
                            continue; // _id is immutable
                        }
                        doc.set_path(path, val.clone())?;
                        modified = true;
                    }
                }
                "$unset" => {
                    let unset_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$unset operand must be an object".to_string())
                    })?;
                    for (path, _) in unset_fields {
                        if path != "_id" {
                            if doc.remove_path(path).is_some() {
                                modified = true;
                            }
                        }
                    }
                }
                "$inc" => {
                    let inc_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$inc operand must be an object".to_string())
                    })?;
                    for (path, inc_val) in inc_fields {
                        let inc_num = inc_val.as_f64().ok_or_else(|| {
                            DocError::InvalidUpdate("$inc value must be numeric".to_string())
                        })?;
                        let current_num = doc.get_path(path).and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let sum = current_num + inc_num;
                        let new_val = if sum.fract() == 0.0 && inc_val.as_i64().is_some() {
                            DocValue::Int64(sum as i64)
                        } else {
                            DocValue::Float64(sum)
                        };
                        doc.set_path(path, new_val)?;
                        modified = true;
                    }
                }
                "$mul" => {
                    let mul_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$mul operand must be an object".to_string())
                    })?;
                    for (path, mul_val) in mul_fields {
                        let mul_num = mul_val.as_f64().ok_or_else(|| {
                            DocError::InvalidUpdate("$mul value must be numeric".to_string())
                        })?;
                        let current_num = doc.get_path(path).and_then(|v| v.as_f64()).unwrap_or(0.0);
                        let product = current_num * mul_num;
                        let new_val = if product.fract() == 0.0 && mul_val.as_i64().is_some() {
                            DocValue::Int64(product as i64)
                        } else {
                            DocValue::Float64(product)
                        };
                        doc.set_path(path, new_val)?;
                        modified = true;
                    }
                }
                "$min" => {
                    let min_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$min operand must be an object".to_string())
                    })?;
                    for (path, target_val) in min_fields {
                        let current = doc.get_path(path);
                        let should_update = match current {
                            Some(curr) => target_val < curr,
                            None => true,
                        };
                        if should_update {
                            doc.set_path(path, target_val.clone())?;
                            modified = true;
                        }
                    }
                }
                "$max" => {
                    let max_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$max operand must be an object".to_string())
                    })?;
                    for (path, target_val) in max_fields {
                        let current = doc.get_path(path);
                        let should_update = match current {
                            Some(curr) => target_val > curr,
                            None => true,
                        };
                        if should_update {
                            doc.set_path(path, target_val.clone())?;
                            modified = true;
                        }
                    }
                }
                "$rename" => {
                    let rename_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$rename operand must be an object".to_string())
                    })?;
                    for (old_path, new_name) in rename_fields {
                        if let Some(new_name_str) = new_name.as_str() {
                            if let Some(val) = doc.remove_path(old_path) {
                                doc.set_path(new_name_str, val)?;
                                modified = true;
                            }
                        }
                    }
                }
                "$push" => {
                    let push_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$push operand must be an object".to_string())
                    })?;
                    for (path, push_spec) in push_fields {
                        let to_push = if let DocValue::Object(each_spec) = push_spec {
                            if let Some((_, DocValue::Array(items))) = each_spec.iter().find(|(k, _)| k == "$each") {
                                items.clone()
                            } else {
                                vec![push_spec.clone()]
                            }
                        } else {
                            vec![push_spec.clone()]
                        };

                        let current_arr = match doc.get_path(path) {
                            Some(DocValue::Array(arr)) => {
                                let mut updated = arr.clone();
                                updated.extend(to_push);
                                DocValue::Array(updated)
                            }
                            Some(DocValue::Null) | None => DocValue::Array(to_push),
                            _ => return Err(DocError::InvalidUpdate(format!("Cannot $push to non-array field '{}'", path))),
                        };
                        doc.set_path(path, current_arr)?;
                        modified = true;
                    }
                }
                "$addToSet" => {
                    let add_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$addToSet operand must be an object".to_string())
                    })?;
                    for (path, add_spec) in add_fields {
                        let to_add = if let DocValue::Object(each_spec) = add_spec {
                            if let Some((_, DocValue::Array(items))) = each_spec.iter().find(|(k, _)| k == "$each") {
                                items.clone()
                            } else {
                                vec![add_spec.clone()]
                            }
                        } else {
                            vec![add_spec.clone()]
                        };

                        let current_arr = match doc.get_path(path) {
                            Some(DocValue::Array(arr)) => {
                                let mut updated = arr.clone();
                                for item in to_add {
                                    if !updated.contains(&item) {
                                        updated.push(item);
                                    }
                                }
                                DocValue::Array(updated)
                            }
                            Some(DocValue::Null) | None => {
                                let mut unique_items = Vec::new();
                                for item in to_add {
                                    if !unique_items.contains(&item) {
                                        unique_items.push(item);
                                    }
                                }
                                DocValue::Array(unique_items)
                            }
                            _ => return Err(DocError::InvalidUpdate(format!("Cannot $addToSet to non-array field '{}'", path))),
                        };
                        doc.set_path(path, current_arr)?;
                        modified = true;
                    }
                }
                "$pull" => {
                    let pull_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$pull operand must be an object".to_string())
                    })?;
                    for (path, condition) in pull_fields {
                        if let Some(DocValue::Array(arr)) = doc.get_path(path) {
                            let mut updated = Vec::new();
                            for item in arr {
                                let should_pull = if condition.is_object() {
                                    QueryFilter::matches(item, condition).unwrap_or(false)
                                } else {
                                    item == condition
                                };
                                if !should_pull {
                                    updated.push(item.clone());
                                }
                            }
                            doc.set_path(path, DocValue::Array(updated))?;
                            modified = true;
                        }
                    }
                }
                "$currentDate" => {
                    let date_fields = arg.as_object().ok_or_else(|| {
                        DocError::InvalidUpdate("$currentDate operand must be an object".to_string())
                    })?;
                    let now_ms = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as i64;

                    for (path, _) in date_fields {
                        doc.set_path(path, DocValue::DateTime(now_ms))?;
                        modified = true;
                    }
                }
                other => {
                    return Err(DocError::InvalidUpdate(format!(
                        "Unsupported update operator '{}'",
                        other
                    )))
                }
            }
        }

        Ok(modified)
    }
}
