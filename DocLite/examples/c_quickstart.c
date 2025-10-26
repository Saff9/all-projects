/**
 * DocLite C / C++ Quickstart Example
 *
 * Compilation (Windows MinGW / GCC):
 *   gcc examples/c_quickstart.c -I include -L target/release -ldoclite -o c_demo.exe
 *
 * Compilation (Linux / macOS):
 *   gcc examples/c_quickstart.c -I include -L target/release -ldoclite -Wl,-rpath,target/release -o c_demo
 */

#include <stdio.h>
#include <stdlib.h>
#include "doclite.h"

int main() {
    printf("=== DocLite C API Quickstart ===\n");

    // 1. Open local database file (or in-memory with NULL/":memory:")
    doclite_db_t* db = NULL;
    if (doclite_open("c_quickstart.docdb", &db) != 0) {
        fprintf(stderr, "Failed to open database: %s\n", doclite_last_error(db));
        return 1;
    }
    printf("[+] Database opened: 'c_quickstart.docdb'\n");

    // 2. Insert document
    char* inserted_id = NULL;
    const char* json_sensor = "{\"sensor_id\": 101, \"temp\": 24.5, \"location\": \"datacenter-rack-A\"}";
    if (doclite_insert_one(db, "sensors", json_sensor, &inserted_id) == 0) {
        printf("[+] Inserted sensor record ID: %s\n", inserted_id);
        doclite_free_string(inserted_id);
    }

    // 3. Find one document
    char* result_json = NULL;
    const char* query_filter = "{\"sensor_id\": 101}";
    if (doclite_find_one(db, "sensors", query_filter, &result_json) == 0 && result_json != NULL) {
        printf("\n--- Queried Sensor Document ---\n");
        printf("  %s\n", result_json);
        doclite_free_string(result_json);
    }

    // 4. Count documents
    uint64_t count = 0;
    doclite_count_documents(db, "sensors", "{}", &count);
    printf("\n[+] Total sensors in collection: %llu\n", (unsigned long long)count);

    // 5. Checkpoint WAL
    doclite_checkpoint(db);
    printf("[+] Checkpoint completed.\n");

    // 6. Close database
    doclite_close(db);
    printf("[+] Database cleanly closed.\n");

    return 0;
}
