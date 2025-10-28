use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int};
use std::ptr;
use std::sync::Mutex;
use crate::engine::db::Database;
use crate::value::types::DocValue;

pub struct DocLiteHandle {
    pub db: Database,
    pub last_error: Mutex<Option<CString>>,
}

impl DocLiteHandle {
    pub fn set_error(&self, err: String) {
        if let Ok(mut lock) = self.last_error.lock() {
            *lock = CString::new(err).ok();
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_open(path: *const c_char, out_db: *mut *mut DocLiteHandle) -> c_int {
    if path.is_null() || out_db.is_null() {
        return -1;
    }

    let c_str = match CStr::from_ptr(path).to_str() {
        Ok(s) => s,
        Err(_) => return -1,
    };

    match Database::open(c_str) {
        Ok(db) => {
            let handle = Box::into_raw(Box::new(DocLiteHandle {
                db,
                last_error: Mutex::new(None),
            }));
            *out_db = handle;
            0
        }
        Err(_) => -1,
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_open_in_memory(out_db: *mut *mut DocLiteHandle) -> c_int {
    if out_db.is_null() {
        return -1;
    }

    match Database::open_in_memory() {
        Ok(db) => {
            let handle = Box::into_raw(Box::new(DocLiteHandle {
                db,
                last_error: Mutex::new(None),
            }));
            *out_db = handle;
            0
        }
        Err(_) => -1,
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_close(db: *mut DocLiteHandle) {
    if !db.is_null() {
        let _ = Box::from_raw(db);
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_insert_one(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_doc: *const c_char,
    out_id: *mut *mut c_char,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_doc.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let doc_str = match CStr::from_ptr(json_doc).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let json_val: serde_json::Value = match serde_json::from_str(doc_str) {
        Ok(v) => v,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let doc = DocValue::from_json(&json_val);

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.insert_one(doc) {
        Ok(oid) => {
            if !out_id.is_null() {
                if let Ok(c_id) = CString::new(oid.to_hex()) {
                    *out_id = c_id.into_raw();
                }
            }
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_insert_many(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_docs_array: *const c_char,
    out_ids_json: *mut *mut c_char,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_docs_array.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let doc_str = match CStr::from_ptr(json_docs_array).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let json_val: serde_json::Value = match serde_json::from_str(doc_str) {
        Ok(v) => v,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let docs = match json_val {
        serde_json::Value::Array(arr) => arr.iter().map(DocValue::from_json).collect(),
        _ => {
            h.set_error("insert_many expects a JSON array of documents".to_string());
            return -1;
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.insert_many(docs) {
        Ok(oids) => {
            if !out_ids_json.is_null() {
                let id_strings: Vec<String> = oids.iter().map(|id| id.to_hex()).collect();
                let json_res = serde_json::to_string(&id_strings).unwrap_or_default();
                if let Ok(c_res) = CString::new(json_res) {
                    *out_ids_json = c_res.into_raw();
                }
            }
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_find_one(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_filter: *const c_char,
    out_json: *mut *mut c_char,
) -> c_int {
    if handle.is_null() || collection.is_null() || out_json.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter = if json_filter.is_null() {
        DocValue::Null
    } else {
        let filter_str = match CStr::from_ptr(json_filter).to_str() {
            Ok(s) => s,
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        };
        let json_val: serde_json::Value = match serde_json::from_str(filter_str) {
            Ok(v) => v,
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        };
        DocValue::from_json(&json_val)
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.find_one(filter) {
        Ok(Some(doc)) => {
            let json_str = doc.to_json_string(false);
            if let Ok(c_str) = CString::new(json_str) {
                *out_json = c_str.into_raw();
                0
            } else {
                -1
            }
        }
        Ok(None) => {
            *out_json = ptr::null_mut();
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_find(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_filter: *const c_char,
    out_json: *mut *mut c_char,
) -> c_int {
    if handle.is_null() || collection.is_null() || out_json.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter = if json_filter.is_null() {
        DocValue::Null
    } else {
        let filter_str = match CStr::from_ptr(json_filter).to_str() {
            Ok(s) => s,
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        };
        let json_val: serde_json::Value = match serde_json::from_str(filter_str) {
            Ok(v) => v,
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        };
        DocValue::from_json(&json_val)
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.find(filter) {
        Ok(cursor) => {
            let docs = cursor.to_vec();
            let json_arr: Vec<serde_json::Value> = docs.iter().map(|d| d.to_json()).collect();
            let json_str = serde_json::to_string(&serde_json::Value::Array(json_arr)).unwrap_or_default();
            if let Ok(c_str) = CString::new(json_str) {
                *out_json = c_str.into_raw();
                0
            } else {
                -1
            }
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_aggregate(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_pipeline_array: *const c_char,
    out_json: *mut *mut c_char,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_pipeline_array.is_null() || out_json.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let pipe_str = match CStr::from_ptr(json_pipeline_array).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let json_val: serde_json::Value = match serde_json::from_str(pipe_str) {
        Ok(v) => v,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let pipeline: Vec<DocValue> = match json_val {
        serde_json::Value::Array(arr) => arr.iter().map(DocValue::from_json).collect(),
        _ => {
            h.set_error("Aggregation pipeline must be a JSON array of stage objects".to_string());
            return -1;
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.aggregate(pipeline) {
        Ok(results) => {
            let json_arr: Vec<serde_json::Value> = results.iter().map(|d| d.to_json()).collect();
            let json_str = serde_json::to_string(&serde_json::Value::Array(json_arr)).unwrap_or_default();
            if let Ok(c_str) = CString::new(json_str) {
                *out_json = c_str.into_raw();
                0
            } else {
                -1
            }
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_create_index(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_fields_array: *const c_char,
    unique: c_int,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_fields_array.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let fields_str = match CStr::from_ptr(json_fields_array).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let fields: Vec<String> = match serde_json::from_str(fields_str) {
        Ok(serde_json::Value::Array(arr)) => {
            arr.into_iter().filter_map(|v| v.as_str().map(String::from)).collect()
        }
        _ => {
            h.set_error("Index fields must be a JSON array of strings".to_string());
            return -1;
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.create_index(fields, unique != 0) {
        Ok(_) => 0,
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_count_documents(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_filter: *const c_char,
    out_count: *mut u64,
) -> c_int {
    if handle.is_null() || collection.is_null() || out_count.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter = if json_filter.is_null() {
        DocValue::Null
    } else {
        let filter_str = match CStr::from_ptr(json_filter).to_str() {
            Ok(s) => s,
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        };
        match serde_json::from_str(filter_str) {
            Ok(v) => DocValue::from_json(&v),
            Err(e) => {
                h.set_error(e.to_string());
                return -1;
            }
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.count_documents(filter) {
        Ok(count) => {
            *out_count = count as u64;
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_update_one(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_filter: *const c_char,
    json_update: *const c_char,
    upsert: c_int,
    out_modified: *mut u64,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_filter.is_null() || json_update.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter_str = match CStr::from_ptr(json_filter).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };
    let update_str = match CStr::from_ptr(json_update).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter = match serde_json::from_str(filter_str) {
        Ok(v) => DocValue::from_json(&v),
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };
    let update = match serde_json::from_str(update_str) {
        Ok(v) => DocValue::from_json(&v),
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.update_one(filter, update, upsert != 0) {
        Ok(res) => {
            if !out_modified.is_null() {
                *out_modified = res.modified_count as u64;
            }
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_delete_one(
    handle: *mut DocLiteHandle,
    collection: *const c_char,
    json_filter: *const c_char,
    out_deleted: *mut u64,
) -> c_int {
    if handle.is_null() || collection.is_null() || json_filter.is_null() {
        return -1;
    }

    let h = &*handle;
    let coll_name = match CStr::from_ptr(collection).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter_str = match CStr::from_ptr(json_filter).to_str() {
        Ok(s) => s,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let filter = match serde_json::from_str(filter_str) {
        Ok(v) => DocValue::from_json(&v),
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    let coll = match h.db.collection(coll_name) {
        Ok(c) => c,
        Err(e) => {
            h.set_error(e.to_string());
            return -1;
        }
    };

    match coll.delete_one(filter) {
        Ok(res) => {
            if !out_deleted.is_null() {
                *out_deleted = res.deleted_count as u64;
            }
            0
        }
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_checkpoint(handle: *mut DocLiteHandle) -> c_int {
    if handle.is_null() {
        return -1;
    }

    let h = &*handle;
    match h.db.checkpoint() {
        Ok(_) => 0,
        Err(e) => {
            h.set_error(e.to_string());
            -1
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_free_string(s: *mut c_char) {
    if !s.is_null() {
        let _ = CString::from_raw(s);
    }
}

#[no_mangle]
pub unsafe extern "C" fn doclite_last_error(handle: *mut DocLiteHandle) -> *const c_char {
    if handle.is_null() {
        return ptr::null();
    }
    let h = &*handle;
    if let Ok(lock) = h.last_error.lock() {
        if let Some(ref c_str) = *lock {
            return c_str.as_ptr();
        }
    }
    ptr::null()
}
