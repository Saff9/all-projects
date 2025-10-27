/**
 * DocLite — Embedded NoSQL Document Database Engine
 * C-ABI Header (Header File for C / C++ / FFI)
 */

#ifndef DOCLITE_H
#define DOCLITE_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stddef.h>

typedef struct DocLiteHandle doclite_db_t;

/**
 * Open or create a DocLite database at the specified file path.
 * Returns 0 on success, or -1 on failure.
 */
int doclite_open(const char* path, doclite_db_t** out_db);

/**
 * Open an in-memory ephemeral DocLite database.
 * Returns 0 on success, or -1 on failure.
 */
int doclite_open_in_memory(doclite_db_t** out_db);

/**
 * Close and release a DocLite database handle.
 */
void doclite_close(doclite_db_t* db);

/**
 * Insert a single JSON document into the specified collection.
 * The generated or existing 24-character hexadecimal ObjectId is stored in out_id.
 * The caller must free *out_id using doclite_free_string().
 */
int doclite_insert_one(
    doclite_db_t* db,
    const char* collection,
    const char* json_doc,
    char** out_id
);

/**
 * Insert an array of JSON documents into the specified collection in a single atomic batch.
 * The array of 24-character hexadecimal ObjectIds is stored in out_ids_json as a JSON string.
 * The caller must free *out_ids_json using doclite_free_string().
 */
int doclite_insert_many(
    doclite_db_t* db,
    const char* collection,
    const char* json_docs_array,
    char** out_ids_json
);

/**
 * Find a single document matching the filter.
 * Returns 0 on success (with *out_json pointing to the JSON string, or NULL if not found).
 * The caller must free *out_json using doclite_free_string().
 */
int doclite_find_one(
    doclite_db_t* db,
    const char* collection,
    const char* json_filter,
    char** out_json
);

/**
 * Query documents matching the filter.
 * Returns 0 on success (with *out_json pointing to a JSON array of documents).
 * The caller must free *out_json using doclite_free_string().
 */
int doclite_find(
    doclite_db_t* db,
    const char* collection,
    const char* json_filter,
    char** out_json
);

/**
 * Execute an aggregation pipeline on the specified collection.
 * Returns 0 on success (with *out_json pointing to a JSON array of aggregated results).
 * The caller must free *out_json using doclite_free_string().
 */
int doclite_aggregate(
    doclite_db_t* db,
    const char* collection,
    const char* json_pipeline_array,
    char** out_json
);

/**
 * Create a single or compound B+Tree index on the specified fields.
 * unique: 1 for unique constraint enforcement, 0 for regular non-unique index.
 * Returns 0 on success, or non-zero on failure.
 */
int doclite_create_index(
    doclite_db_t* db,
    const char* collection,
    const char* json_fields_array,
    int unique
);

/**
 * Count documents matching the filter.
 * Returns 0 on success (stores count in *out_count).
 */
int doclite_count_documents(
    doclite_db_t* db,
    const char* collection,
    const char* json_filter,
    uint64_t* out_count
);

/**
 * Update a single document matching the filter.
 * Returns 0 on success (stores modified count in *out_modified).
 */
int doclite_update_one(
    doclite_db_t* db,
    const char* collection,
    const char* json_filter,
    const char* json_update,
    int upsert,
    uint64_t* out_modified
);

/**
 * Delete a single document matching the filter.
 * Returns 0 on success (stores deleted count in *out_deleted).
 */
int doclite_delete_one(
    doclite_db_t* db,
    const char* collection,
    const char* json_filter,
    uint64_t* out_deleted
);

/**
 * Manually trigger a WAL checkpoint to flush all dirty pages to the main database file.
 * Returns 0 on success.
 */
int doclite_checkpoint(doclite_db_t* db);

/**
 * Free a string allocated and returned by the DocLite FFI.
 */
void doclite_free_string(char* s);

/**
 * Retrieve the last error message on the database handle.
 */
const char* doclite_last_error(doclite_db_t* db);

#ifdef __cplusplus
}
#endif

#endif /* DOCLITE_H */
