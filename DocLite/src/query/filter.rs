use regex::Regex;
use crate::error::{DocError, Result};
use crate::value::types::DocValue;

pub struct QueryFilter;

impl QueryFilter {
    /// Evaluates whether a document satisfies the MongoDB query filter expression.
    pub fn matches(doc: &DocValue, filter: &DocValue) -> Result<bool> {
        let filter_obj = match filter {
            DocValue::Object(obj) => obj,
            DocValue::Null => return Ok(true),
            _ => return Err(DocError::InvalidQuery("Filter must be a document object".to_string())),
        };

        if filter_obj.is_empty() {
            return Ok(true);
        }

        for (key, condition) in filter_obj {
            if key == "$and" {
                if let DocValue::Array(clauses) = condition {
                    for clause in clauses {
                        if !Self::matches(doc, clause)? {
                            return Ok(false);
                        }
                    }
                } else {
                    return Err(DocError::InvalidQuery("$and operand must be an array".to_string()));
                }
            } else if key == "$or" {
                if let DocValue::Array(clauses) = condition {
                    let mut any_matched = false;
                    for clause in clauses {
                        if Self::matches(doc, clause)? {
                            any_matched = true;
                            break;
                        }
                    }
                    if !any_matched {
                        return Ok(false);
                    }
                } else {
                    return Err(DocError::InvalidQuery("$or operand must be an array".to_string()));
                }
            } else if key == "$nor" {
                if let DocValue::Array(clauses) = condition {
                    for clause in clauses {
                        if Self::matches(doc, clause)? {
                            return Ok(false);
                        }
                    }
                } else {
                    return Err(DocError::InvalidQuery("$nor operand must be an array".to_string()));
                }
            } else if key.starts_with('$') {
                return Err(DocError::InvalidQuery(format!("Top-level operator '{}' not supported", key)));
            } else {
                // Field path evaluation (e.g. "age" or "user.profile.age")
                let field_val = doc.get_path(key);
                if !Self::matches_field(field_val, condition)? {
                    return Ok(false);
                }
            }
        }

        Ok(true)
    }

    fn matches_field(field_val: Option<&DocValue>, condition: &DocValue) -> Result<bool> {
        match condition {
            DocValue::Object(ops) if !ops.is_empty() && ops[0].0.starts_with('$') => {
                for (op, target) in ops {
                    if !Self::eval_operator(field_val, op, target)? {
                        return Ok(false);
                    }
                }
                Ok(true)
            }
            _ => {
                // Exact equality comparison
                match field_val {
                    Some(val) => {
                        if val == condition {
                            return Ok(true);
                        }
                        // If field is an array, check if any array item matches
                        if let DocValue::Array(arr) = val {
                            for item in arr {
                                if item == condition {
                                    return Ok(true);
                                }
                            }
                        }
                        Ok(false)
                    }
                    None => Ok(condition.is_null()),
                }
            }
        }
    }

    fn eval_operator(field_val: Option<&DocValue>, op: &str, target: &DocValue) -> Result<bool> {
        match op {
            "$eq" => match field_val {
                Some(val) => Ok(val == target),
                None => Ok(target.is_null()),
            },
            "$ne" => match field_val {
                Some(val) => Ok(val != target),
                None => Ok(!target.is_null()),
            },
            "$gt" => match field_val {
                Some(val) => Ok(val > target),
                None => Ok(false),
            },
            "$gte" => match field_val {
                Some(val) => Ok(val >= target),
                None => Ok(false),
            },
            "$lt" => match field_val {
                Some(val) => Ok(val < target),
                None => Ok(false),
            },
            "$lte" => match field_val {
                Some(val) => Ok(val <= target),
                None => Ok(false),
            },
            "$in" => {
                let target_arr = match target {
                    DocValue::Array(arr) => arr,
                    _ => return Err(DocError::InvalidQuery("$in requires an array".to_string())),
                };
                match field_val {
                    Some(val) => {
                        for item in target_arr {
                            if val == item {
                                return Ok(true);
                            }
                        }
                        // Check if val is array and shares any element with target_arr
                        if let DocValue::Array(val_items) = val {
                            for v in val_items {
                                for item in target_arr {
                                    if v == item {
                                        return Ok(true);
                                    }
                                }
                            }
                        }
                        Ok(false)
                    }
                    None => Ok(target_arr.iter().any(|v| v.is_null())),
                }
            }
            "$nin" => {
                let in_res = Self::eval_operator(field_val, "$in", target)?;
                Ok(!in_res)
            }
            "$exists" => {
                let should_exist = target.as_bool().unwrap_or(true);
                Ok(field_val.is_some() == should_exist)
            }
            "$type" => match field_val {
                Some(val) => {
                    if let Some(target_type) = target.as_str() {
                        let actual_type = val.type_name();
                        if target_type == "number" {
                            Ok(val.is_number())
                        } else {
                            Ok(actual_type == target_type)
                        }
                    } else {
                        Err(DocError::InvalidQuery("$type requires string type name".to_string()))
                    }
                }
                None => Ok(false),
            },
            "$size" => match field_val {
                Some(DocValue::Array(arr)) => {
                    let expected_size = target.as_i64().ok_or_else(|| {
                        DocError::InvalidQuery("$size requires non-negative integer".to_string())
                    })? as usize;
                    Ok(arr.len() == expected_size)
                }
                _ => Ok(false),
            },
            "$all" => {
                let target_arr = match target {
                    DocValue::Array(arr) => arr,
                    _ => return Err(DocError::InvalidQuery("$all requires an array".to_string())),
                };
                match field_val {
                    Some(DocValue::Array(arr)) => {
                        for required in target_arr {
                            if !arr.contains(required) {
                                return Ok(false);
                            }
                        }
                        Ok(true)
                    }
                    _ => Ok(false),
                }
            }
            "$elemMatch" => match field_val {
                Some(DocValue::Array(arr)) => {
                    for elem in arr {
                        if Self::matches(elem, target)? {
                            return Ok(true);
                        }
                    }
                    Ok(false)
                }
                _ => Ok(false),
            },
            "$regex" => match field_val {
                Some(DocValue::String(s)) => {
                    let pattern = target.as_str().ok_or_else(|| {
                        DocError::InvalidQuery("$regex requires a string pattern".to_string())
                    })?;
                    let re = Regex::new(pattern).map_err(|e| {
                        DocError::InvalidQuery(format!("Invalid regex '{}': {}", pattern, e))
                    })?;
                    Ok(re.is_match(s))
                }
                _ => Ok(false),
            },
            "$mod" => match field_val {
                Some(val) => {
                    if let DocValue::Array(arr) = target {
                        if arr.len() == 2 {
                            let divisor = arr[0].as_i64().ok_or_else(|| {
                                DocError::InvalidQuery("$mod divisor must be integer".to_string())
                            })?;
                            let remainder = arr[1].as_i64().ok_or_else(|| {
                                DocError::InvalidQuery("$mod remainder must be integer".to_string())
                            })?;
                            if let Some(v_int) = val.as_i64() {
                                if divisor != 0 {
                                    return Ok(v_int % divisor == remainder);
                                }
                            }
                        }
                    }
                    Err(DocError::InvalidQuery("$mod requires [divisor, remainder]".to_string()))
                }
                None => Ok(false),
            },
            "$not" => {
                let inner_matched = Self::matches_field(field_val, target)?;
                Ok(!inner_matched)
            }
            other => Err(DocError::InvalidQuery(format!("Unknown filter operator '{}'", other))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_query_filter_operators() {
        let doc = DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Alice".to_string())),
            ("age".to_string(), DocValue::Int32(28)),
            ("status".to_string(), DocValue::String("active".to_string())),
            ("tags".to_string(), DocValue::Array(vec![
                DocValue::String("rust".to_string()),
                DocValue::String("nosql".to_string()),
            ])),
        ]);

        // Exact match
        let filter1 = DocValue::Object(vec![("name".to_string(), DocValue::String("Alice".to_string()))]);
        assert!(QueryFilter::matches(&doc, &filter1).unwrap());

        // Range query $gte and $lt
        let filter2 = DocValue::Object(vec![
            ("age".to_string(), DocValue::Object(vec![
                ("$gte".to_string(), DocValue::Int32(20)),
                ("$lt".to_string(), DocValue::Int32(30)),
            ])),
        ]);
        assert!(QueryFilter::matches(&doc, &filter2).unwrap());

        // Array membership $in
        let filter3 = DocValue::Object(vec![
            ("tags".to_string(), DocValue::Object(vec![
                ("$in".to_string(), DocValue::Array(vec![DocValue::String("rust".to_string())])),
            ])),
        ]);
        assert!(QueryFilter::matches(&doc, &filter3).unwrap());

        // Regex
        let filter4 = DocValue::Object(vec![
            ("name".to_string(), DocValue::Object(vec![
                ("$regex".to_string(), DocValue::String("^Ali.*".to_string())),
            ])),
        ]);
        assert!(QueryFilter::matches(&doc, &filter4).unwrap());
    }
}
