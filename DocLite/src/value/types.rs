use std::cmp::Ordering;
use std::fmt;
use serde::{Deserialize, Serialize};
use crate::error::{DocError, Result};
use crate::value::cmp::compare_values;
use crate::value::object_id::ObjectId;

/// Represents any BSON/JSON-compatible document value in DocLite.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DocValue {
    MinKey,
    Null,
    Bool(bool),
    Int32(i32),
    Int64(i64),
    Float64(f64),
    String(String),
    ObjectId(ObjectId),
    DateTime(i64), // Milliseconds since Unix epoch
    Binary(Vec<u8>),
    Array(Vec<DocValue>),
    Object(Vec<(String, DocValue)>),
    MaxKey,
}

impl DocValue {
    pub fn is_null(&self) -> bool {
        matches!(self, DocValue::Null)
    }

    pub fn is_number(&self) -> bool {
        matches!(self, DocValue::Int32(_) | DocValue::Int64(_) | DocValue::Float64(_))
    }

    pub fn is_object(&self) -> bool {
        matches!(self, DocValue::Object(_))
    }

    pub fn is_array(&self) -> bool {
        matches!(self, DocValue::Array(_))
    }

    pub fn as_bool(&self) -> Option<bool> {
        match self {
            DocValue::Bool(b) => Some(*b),
            _ => None,
        }
    }

    pub fn as_i64(&self) -> Option<i64> {
        match self {
            DocValue::Int32(n) => Some(*n as i64),
            DocValue::Int64(n) => Some(*n),
            DocValue::Float64(n) => {
                if n.fract() == 0.0 && *n >= i64::MIN as f64 && *n <= i64::MAX as f64 {
                    Some(*n as i64)
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    pub fn as_f64(&self) -> Option<f64> {
        match self {
            DocValue::Int32(n) => Some(*n as f64),
            DocValue::Int64(n) => Some(*n as f64),
            DocValue::Float64(n) => Some(*n),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            DocValue::String(s) => Some(s.as_str()),
            _ => None,
        }
    }

    pub fn as_object_id(&self) -> Option<ObjectId> {
        match self {
            DocValue::ObjectId(id) => Some(*id),
            DocValue::String(s) => ObjectId::parse_str(s).ok(),
            _ => None,
        }
    }

    pub fn as_array(&self) -> Option<&[DocValue]> {
        match self {
            DocValue::Array(arr) => Some(arr.as_slice()),
            _ => None,
        }
    }

    pub fn as_array_mut(&mut self) -> Option<&mut Vec<DocValue>> {
        match self {
            DocValue::Array(arr) => Some(arr),
            _ => None,
        }
    }

    pub fn as_object(&self) -> Option<&[(String, DocValue)]> {
        match self {
            DocValue::Object(obj) => Some(obj.as_slice()),
            _ => None,
        }
    }

    pub fn as_object_mut(&mut self) -> Option<&mut Vec<(String, DocValue)>> {
        match self {
            DocValue::Object(obj) => Some(obj),
            _ => None,
        }
    }

    pub fn get(&self, key: &str) -> Option<&DocValue> {
        match self {
            DocValue::Object(obj) => {
                for (k, v) in obj {
                    if k == key {
                        return Some(v);
                    }
                }
                None
            }
            _ => None,
        }
    }

    pub fn get_mut(&mut self, key: &str) -> Option<&mut DocValue> {
        match self {
            DocValue::Object(obj) => {
                for (k, v) in obj {
                    if k == key {
                        return Some(v);
                    }
                }
                None
            }
            _ => None,
        }
    }

    pub fn insert_field(&mut self, key: impl Into<String>, val: DocValue) {
        let key_str = key.into();
        match self {
            DocValue::Object(obj) => {
                for (k, v) in obj.iter_mut() {
                    if *k == key_str {
                        *v = val;
                        return;
                    }
                }
                obj.push((key_str, val));
            }
            _ => {
                *self = DocValue::Object(vec![(key_str, val)]);
            }
        }
    }

    pub fn remove_field(&mut self, key: &str) -> Option<DocValue> {
        match self {
            DocValue::Object(obj) => {
                if let Some(pos) = obj.iter().position(|(k, _)| k == key) {
                    Some(obj.remove(pos).1)
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    /// Retrieve a nested value by dot notation (e.g. `"user.profile.age"` or `"items.0.sku"`).
    pub fn get_path(&self, path: &str) -> Option<&DocValue> {
        if path.is_empty() {
            return Some(self);
        }

        let parts: Vec<&str> = path.split('.').collect();
        let mut curr = self;

        for part in parts {
            match curr {
                DocValue::Object(obj) => {
                    let mut found = None;
                    for (k, v) in obj {
                        if k == part {
                            found = Some(v);
                            break;
                        }
                    }
                    curr = found?;
                }
                DocValue::Array(arr) => {
                    if let Ok(idx) = part.parse::<usize>() {
                        curr = arr.get(idx)?;
                    } else {
                        return None;
                    }
                }
                _ => return None,
            }
        }
        Some(curr)
    }

    /// Set a nested value by dot notation path, automatically creating parent objects if required.
    pub fn set_path(&mut self, path: &str, new_val: DocValue) -> Result<()> {
        if path.is_empty() {
            *self = new_val;
            return Ok(());
        }

        let parts: Vec<&str> = path.split('.').collect();
        let mut curr = self;

        for (i, part) in parts.iter().enumerate() {
            let is_last = i == parts.len() - 1;

            if is_last {
                match curr {
                    DocValue::Object(obj) => {
                        for (k, v) in obj.iter_mut() {
                            if k == *part {
                                *v = new_val;
                                return Ok(());
                            }
                        }
                        obj.push((part.to_string(), new_val));
                        return Ok(());
                    }
                    DocValue::Array(arr) => {
                        let idx = part.parse::<usize>().map_err(|_| {
                            DocError::InvalidUpdate(format!("Cannot index array with non-numeric '{}'", part))
                        })?;
                        if idx < arr.len() {
                            arr[idx] = new_val;
                        } else if idx == arr.len() {
                            arr.push(new_val);
                        } else {
                            while arr.len() < idx {
                                arr.push(DocValue::Null);
                            }
                            arr.push(new_val);
                        }
                        return Ok(());
                    }
                    _ => {
                        let mut new_obj = Vec::new();
                        new_obj.push((part.to_string(), new_val));
                        *curr = DocValue::Object(new_obj);
                        return Ok(());
                    }
                }
            } else {
                let next_is_num = parts[i + 1].parse::<usize>().is_ok();
                match curr {
                    DocValue::Object(obj) => {
                        let mut found_idx = None;
                        for (idx, (k, _)) in obj.iter().enumerate() {
                            if k == *part {
                                found_idx = Some(idx);
                                break;
                            }
                        }
                        let pos = match found_idx {
                            Some(idx) => idx,
                            None => {
                                let default_val = if next_is_num {
                                    DocValue::Array(Vec::new())
                                } else {
                                    DocValue::Object(Vec::new())
                                };
                                obj.push((part.to_string(), default_val));
                                obj.len() - 1
                            }
                        };
                        curr = &mut obj[pos].1;
                    }
                    DocValue::Array(arr) => {
                        let idx = part.parse::<usize>().map_err(|_| {
                            DocError::InvalidUpdate(format!("Cannot index array with non-numeric '{}'", part))
                        })?;
                        while arr.len() <= idx {
                            let default_val = if next_is_num {
                                DocValue::Array(Vec::new())
                            } else {
                                DocValue::Object(Vec::new())
                            };
                            arr.push(default_val);
                        }
                        curr = &mut arr[idx];
                    }
                    _ => {
                        let default_val = if next_is_num {
                            DocValue::Array(Vec::new())
                        } else {
                            DocValue::Object(Vec::new())
                        };
                        *curr = DocValue::Object(vec![(part.to_string(), default_val)]);
                        if let DocValue::Object(ref mut obj) = curr {
                            curr = &mut obj[0].1;
                        }
                    }
                }
            }
        }
        Ok(())
    }

    /// Remove a nested field by dot notation path.
    pub fn remove_path(&mut self, path: &str) -> Option<DocValue> {
        if path.is_empty() {
            return None;
        }

        let parts: Vec<&str> = path.split('.').collect();
        let last_idx = parts.len() - 1;
        let mut curr = self;

        for part in &parts[..last_idx] {
            match curr {
                DocValue::Object(obj) => {
                    let mut found = None;
                    for (k, v) in obj.iter_mut() {
                        if k == *part {
                            found = Some(v);
                            break;
                        }
                    }
                    curr = found?;
                }
                DocValue::Array(arr) => {
                    let idx = part.parse::<usize>().ok()?;
                    curr = arr.get_mut(idx)?;
                }
                _ => return None,
            }
        }

        let last_part = parts[last_idx];
        match curr {
            DocValue::Object(obj) => {
                if let Some(pos) = obj.iter().position(|(k, _)| k == last_part) {
                    Some(obj.remove(pos).1)
                } else {
                    None
                }
            }
            DocValue::Array(arr) => {
                if let Ok(idx) = last_part.parse::<usize>() {
                    if idx < arr.len() {
                        Some(arr.remove(idx))
                    } else {
                        None
                    }
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    /// Return the standard BSON type name string.
    pub fn type_name(&self) -> &'static str {
        match self {
            DocValue::MinKey => "minKey",
            DocValue::Null => "null",
            DocValue::Bool(_) => "bool",
            DocValue::Int32(_) => "int",
            DocValue::Int64(_) => "long",
            DocValue::Float64(_) => "double",
            DocValue::String(_) => "string",
            DocValue::ObjectId(_) => "objectId",
            DocValue::DateTime(_) => "date",
            DocValue::Binary(_) => "binData",
            DocValue::Array(_) => "array",
            DocValue::Object(_) => "object",
            DocValue::MaxKey => "maxKey",
        }
    }

    /// Convert from `serde_json::Value`.
    pub fn from_json(json: &serde_json::Value) -> Self {
        match json {
            serde_json::Value::Null => DocValue::Null,
            serde_json::Value::Bool(b) => DocValue::Bool(*b),
            serde_json::Value::Number(num) => {
                if let Some(i) = num.as_i64() {
                    if i >= i32::MIN as i64 && i <= i32::MAX as i64 {
                        DocValue::Int32(i as i32)
                    } else {
                        DocValue::Int64(i)
                    }
                } else if let Some(f) = num.as_f64() {
                    DocValue::Float64(f)
                } else {
                    DocValue::Float64(0.0)
                }
            }
            serde_json::Value::String(s) => {
                // If it looks like an extended JSON ObjectId "$oid": "..." or regular string
                DocValue::String(s.clone())
            }
            serde_json::Value::Array(arr) => {
                DocValue::Array(arr.iter().map(DocValue::from_json).collect())
            }
            serde_json::Value::Object(map) => {
                // Check for MongoDB Extended JSON syntax
                if map.len() == 1 {
                    if let Some(oid_val) = map.get("$oid") {
                        if let Some(oid_str) = oid_val.as_str() {
                            if let Ok(oid) = ObjectId::parse_str(oid_str) {
                                return DocValue::ObjectId(oid);
                            }
                        }
                    }
                    if let Some(date_val) = map.get("$date") {
                        if let Some(ms) = date_val.as_i64() {
                            return DocValue::DateTime(ms);
                        }
                    }
                    if let Some(bin_val) = map.get("$binary") {
                        if let Some(hex_str) = bin_val.as_str() {
                            if let Ok(bytes) = hex::decode(hex_str) {
                                return DocValue::Binary(bytes);
                            }
                        }
                    }
                    if map.contains_key("$minKey") {
                        return DocValue::MinKey;
                    }
                    if map.contains_key("$maxKey") {
                        return DocValue::MaxKey;
                    }
                }

                let mut pairs = Vec::with_capacity(map.len());
                for (k, v) in map {
                    // Check if field is "_id" and value is 24 hex char string
                    if k == "_id" {
                        if let Some(s) = v.as_str() {
                            if let Ok(oid) = ObjectId::parse_str(s) {
                                pairs.push((k.clone(), DocValue::ObjectId(oid)));
                                continue;
                            }
                        }
                    }
                    pairs.push((k.clone(), DocValue::from_json(v)));
                }
                DocValue::Object(pairs)
            }
        }
    }

    /// Convert to standard `serde_json::Value`.
    pub fn to_json(&self) -> serde_json::Value {
        match self {
            DocValue::MinKey => serde_json::json!({ "$minKey": 1 }),
            DocValue::MaxKey => serde_json::json!({ "$maxKey": 1 }),
            DocValue::Null => serde_json::Value::Null,
            DocValue::Bool(b) => serde_json::Value::Bool(*b),
            DocValue::Int32(n) => serde_json::Value::Number((*n).into()),
            DocValue::Int64(n) => serde_json::Value::Number((*n).into()),
            DocValue::Float64(n) => {
                if let Some(num) = serde_json::Number::from_f64(*n) {
                    serde_json::Value::Number(num)
                } else {
                    serde_json::Value::Null
                }
            }
            DocValue::String(s) => serde_json::Value::String(s.clone()),
            DocValue::ObjectId(id) => serde_json::Value::String(id.to_hex()),
            DocValue::DateTime(ms) => serde_json::json!({ "$date": ms }),
            DocValue::Binary(bytes) => {
                let hex_str: String = bytes.iter().map(|b| format!("{:02x}", b)).collect();
                serde_json::json!({ "$binary": hex_str })
            }
            DocValue::Array(arr) => {
                serde_json::Value::Array(arr.iter().map(|v| v.to_json()).collect())
            }
            DocValue::Object(obj) => {
                let mut map = serde_json::Map::with_capacity(obj.len());
                for (k, v) in obj {
                    map.insert(k.clone(), v.to_json());
                }
                serde_json::Value::Object(map)
            }
        }
    }

    /// Serialize to formatted JSON string.
    pub fn to_json_string(&self, pretty: bool) -> String {
        let json_val = self.to_json();
        if pretty {
            serde_json::to_string_pretty(&json_val).unwrap_or_default()
        } else {
            serde_json::to_string(&json_val).unwrap_or_default()
        }
    }
}

// Simple hex decoding helper without requiring external hex crate
mod hex {
    pub fn decode(s: &str) -> Result<Vec<u8>, ()> {
        if s.len() % 2 != 0 {
            return Err(());
        }
        (0..s.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&s[i..i + 2], 16).map_err(|_| ()))
            .collect()
    }
}

impl PartialEq for DocValue {
    fn eq(&self, other: &Self) -> bool {
        compare_values(self, other) == Ordering::Equal
    }
}

impl Eq for DocValue {}

impl PartialOrd for DocValue {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for DocValue {
    fn cmp(&self, other: &Self) -> Ordering {
        compare_values(self, other)
    }
}

impl fmt::Display for DocValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_json_string(false))
    }
}
