# Contributing to DocLite

Thank you for your interest in contributing to **DocLite**! 

DocLite is a high-performance, single-file, embedded NoSQL document database built in Rust. We welcome contributions of all kinds: bug fixes, performance optimizations, new query/aggregation operators, language bindings, and documentation improvements.

---

## 🛠 Development Setup

### 1. Prerequisites
- **Rust Toolchain**: Rust 1.75+ (`rustup default stable`)
- **C Compiler (Optional for C-ABI)**: `gcc`, `clang`, or MSVC
- **Python 3.8+ (Optional for Python SDK)**: Standard Python 3

### 2. Building the Project
```bash
# Clone repository
git clone https://github.com/saff9/DocLite.git
cd DocLite

# Build debug target
cargo build

# Build optimized release binaries & shared libraries
cargo build --release
```

---

## 🧪 Running Tests & Benchmarks

### 1. Rust Unit & Integration Tests
Ensure all tests pass before submitting a PR:
```bash
cargo test
```

### 2. Python Driver Integration Tests
```bash
python tests/test_python_binding.py
```

### 3. Running Benchmarks
```bash
# Run standalone Rust high-throughput benchmark
cargo run --release -- :memory: bench --count 50000

# Run comparative benchmark vs SQLite JSON1
python benches/compare_bench.py
```

---

## 📐 Code Style & Guidelines

- **Zero Fake / Mock Logic**: All storage, indexing, and recovery code must be genuinely backed by slotted pages, B+Tree nodes, and WAL frames.
- **Safety First**: Strive for safe Rust code wherever possible. Any `unsafe` blocks (e.g. inside FFI or low-level memory casting) must include a descriptive `// SAFETY:` comment.
- **Documentation**: Document public functions with clear Rustdoc comments and usage examples.
- **Format Code**:
  ```bash
  cargo fmt --check
  cargo clippy -- -D warnings
  ```

---

## 📋 Pull Request Process

1. Fork the repository and create your feature branch: `git checkout -b feature/awesome-feature`.
2. Commit your changes with clear, descriptive commit messages.
3. Ensure `cargo test` and `python tests/test_python_binding.py` pass cleanly.
4. Push to your fork and submit a Pull Request to `main`.

---

## 📄 License

By contributing to DocLite, you agree that your contributions will be dual-licensed under the **MIT License** and **Apache License 2.0**.
