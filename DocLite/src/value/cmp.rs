use std::cmp::Ordering;
use crate::value::types::DocValue;

/// Returns the type rank for canonical BSON ordering.
/// Lower number means smaller in B+Tree index sorting.
pub fn bson_type_rank(v: &DocValue) -> u8 {
    match v {
        DocValue::MinKey => 1,
        DocValue::Null => 2,
        DocValue::Int32(_) | DocValue::Int64(_) | DocValue::Float64(_) => 3,
        DocValue::String(_) => 4,
        DocValue::Object(_) => 5,
        DocValue::Array(_) => 6,
        DocValue::Binary(_) => 7,
        DocValue::ObjectId(_) => 8,
        DocValue::Bool(_) => 9,
        DocValue::DateTime(_) => 10,
        DocValue::MaxKey => 11,
    }
}

/// Canonical comparison between any two `DocValue`s.
/// Follows standard BSON type ordering when types differ,
/// and value-based comparison when types match or are numbers.
pub fn compare_values(a: &DocValue, b: &DocValue) -> Ordering {
    let rank_a = bson_type_rank(a);
    let rank_b = bson_type_rank(b);

    if rank_a != rank_b {
        return rank_a.cmp(&rank_b);
    }

    match (a, b) {
        (DocValue::MinKey, DocValue::MinKey) => Ordering::Equal,
        (DocValue::MaxKey, DocValue::MaxKey) => Ordering::Equal,
        (DocValue::Null, DocValue::Null) => Ordering::Equal,
        (DocValue::Bool(x), DocValue::Bool(y)) => x.cmp(y),
        
        // Numerical cross-type comparisons
        (DocValue::Int32(x), DocValue::Int32(y)) => x.cmp(y),
        (DocValue::Int64(x), DocValue::Int64(y)) => x.cmp(y),
        (DocValue::Float64(x), DocValue::Float64(y)) => {
            x.partial_cmp(y).unwrap_or_else(|| {
                if x.is_nan() && y.is_nan() {
                    Ordering::Equal
                } else if x.is_nan() {
                    Ordering::Less
                } else {
                    Ordering::Greater
                }
            })
        }
        (DocValue::Int32(x), DocValue::Int64(y)) => (*x as i64).cmp(y),
        (DocValue::Int64(x), DocValue::Int32(y)) => x.cmp(&(*y as i64)),
        (DocValue::Int32(x), DocValue::Float64(y)) => {
            (*x as f64).partial_cmp(y).unwrap_or(Ordering::Equal)
        }
        (DocValue::Float64(x), DocValue::Int32(y)) => {
            x.partial_cmp(&(*y as f64)).unwrap_or(Ordering::Equal)
        }
        (DocValue::Int64(x), DocValue::Float64(y)) => {
            (*x as f64).partial_cmp(y).unwrap_or(Ordering::Equal)
        }
        (DocValue::Float64(x), DocValue::Int64(y)) => {
            x.partial_cmp(&(*y as f64)).unwrap_or(Ordering::Equal)
        }

        (DocValue::String(x), DocValue::String(y)) => x.cmp(y),
        (DocValue::ObjectId(x), DocValue::ObjectId(y)) => x.cmp(y),
        (DocValue::DateTime(x), DocValue::DateTime(y)) => x.cmp(y),
        (DocValue::Binary(x), DocValue::Binary(y)) => x.cmp(y),

        (DocValue::Array(arr1), DocValue::Array(arr2)) => {
            for (v1, v2) in arr1.iter().zip(arr2.iter()) {
                let cmp = compare_values(v1, v2);
                if cmp != Ordering::Equal {
                    return cmp;
                }
            }
            arr1.len().cmp(&arr2.len())
        }

        (DocValue::Object(obj1), DocValue::Object(obj2)) => {
            for ((k1, v1), (k2, v2)) in obj1.iter().zip(obj2.iter()) {
                let k_cmp = k1.cmp(k2);
                if k_cmp != Ordering::Equal {
                    return k_cmp;
                }
                let v_cmp = compare_values(v1, v2);
                if v_cmp != Ordering::Equal {
                    return v_cmp;
                }
            }
            obj1.len().cmp(&obj2.len())
        }

        _ => unreachable!("Ranks are equal but branches not matched"),
    }
}
