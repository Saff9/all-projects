use std::cmp::Ordering;
use crate::query::planner::ExplainPlan;
use crate::value::types::DocValue;

pub struct Cursor {
    docs: Vec<DocValue>,
    position: usize,
    explain_plan: Option<ExplainPlan>,
}

impl Cursor {
    pub fn new(docs: Vec<DocValue>, explain_plan: Option<ExplainPlan>) -> Self {
        Self {
            docs,
            position: 0,
            explain_plan,
        }
    }

    /// Sort documents in-place by sort specification (e.g. `{"age": 1, "name": -1}`).
    pub fn sort(mut self, sort_spec: DocValue) -> Self {
        if let Some(sort_obj) = sort_spec.as_object() {
            self.docs.sort_by(|a, b| {
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
        }
        self
    }

    /// Skip the first `n` documents.
    pub fn skip(mut self, n: usize) -> Self {
        if n < self.docs.len() {
            self.docs = self.docs.split_off(n);
        } else {
            self.docs.clear();
        }
        self
    }

    /// Limit the cursor to at most `n` documents.
    pub fn limit(mut self, n: usize) -> Self {
        self.docs.truncate(n);
        self
    }

    /// Total count of documents in the cursor.
    pub fn count(&self) -> usize {
        self.docs.len()
    }

    /// Convert cursor into vector of `DocValue`s.
    pub fn to_vec(self) -> Vec<DocValue> {
        self.docs
    }

    /// Retrieve the query execution plan if recorded.
    pub fn explain(&self) -> Option<&ExplainPlan> {
        self.explain_plan.as_ref()
    }
}

impl Iterator for Cursor {
    type Item = DocValue;

    fn next(&mut self) -> Option<Self::Item> {
        if self.position < self.docs.len() {
            let item = self.docs[self.position].clone();
            self.position += 1;
            Some(item)
        } else {
            None
        }
    }
}
