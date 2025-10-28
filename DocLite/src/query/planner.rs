use serde::{Deserialize, Serialize};
use crate::catalog::IndexInfo;
use crate::index::key::IndexKey;
use crate::value::types::DocValue;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScanType {
    IndexScan {
        index_name: String,
        is_exact: bool,
    },
    SequentialScan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExplainPlan {
    pub collection: String,
    pub scan_type: ScanType,
    pub index_name: Option<String>,
    pub filter: serde_json::Value,
    pub total_keys_examined: usize,
    pub total_docs_examined: usize,
    pub returned_docs: usize,
    pub execution_time_ms: f64,
}

pub struct QueryPlanner;

pub struct IndexMatch {
    pub index_name: String,
    pub exact_key: Option<IndexKey>,
    pub start_key: Option<IndexKey>,
    pub end_key: Option<IndexKey>,
    pub include_start: bool,
    pub include_end: bool,
}

impl QueryPlanner {
    /// Select the most optimal index scan if applicable, otherwise SequentialScan.
    pub fn select_index(filter: &DocValue, indexes: &[IndexInfo]) -> Option<IndexMatch> {
        let obj = filter.as_object()?;

        for index in indexes {
            // For single-field indexes
            if index.fields.len() == 1 {
                let field = &index.fields[0];
                for (k, v) in obj {
                    if k == field {
                        // Check if it's an exact match
                        if !v.is_object() || (v.as_object().map(|o| !o.iter().any(|(op, _)| op.starts_with('$'))).unwrap_or(false)) {
                            return Some(IndexMatch {
                                index_name: index.name.clone(),
                                exact_key: Some(IndexKey::new_single(v.clone())),
                                start_key: None,
                                end_key: None,
                                include_start: true,
                                include_end: true,
                            });
                        }

                        // Check if it's a range query ($gte, $gt, $lte, $lt, $eq)
                        if let DocValue::Object(ops) = v {
                            let mut exact = None;
                            let mut start = None;
                            let mut end = None;
                            let mut inc_start = true;
                            let mut inc_end = true;

                            for (op, val) in ops {
                                match op.as_str() {
                                    "$eq" => exact = Some(IndexKey::new_single(val.clone())),
                                    "$gte" => {
                                        start = Some(IndexKey::new_single(val.clone()));
                                        inc_start = true;
                                    }
                                    "$gt" => {
                                        start = Some(IndexKey::new_single(val.clone()));
                                        inc_start = false;
                                    }
                                    "$lte" => {
                                        end = Some(IndexKey::new_single(val.clone()));
                                        inc_end = true;
                                    }
                                    "$lt" => {
                                        end = Some(IndexKey::new_single(val.clone()));
                                        inc_end = false;
                                    }
                                    _ => {}
                                }
                            }

                            if exact.is_some() || start.is_some() || end.is_some() {
                                return Some(IndexMatch {
                                    index_name: index.name.clone(),
                                    exact_key: exact,
                                    start_key: start,
                                    end_key: end,
                                    include_start: inc_start,
                                    include_end: inc_end,
                                });
                            }
                        }
                    }
                }
            }
        }

        None
    }
}
