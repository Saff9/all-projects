# Rift VCS — common developer commands.
#
# Run `make` (no target) to see the menu. All targets are phony except
# the ones that produce real files (build, docker).
#
# Why a Makefile when `cargo` already has subcommands?
#   - one canonical name per workflow (CI, docs, and humans all call the
#     same target),
#   - `make bench` runs the *binary's* bench command (rift bench), not
#     cargo's micro-benchmark harness — they are different things,
#   - `make docker` wraps the multi-stage Dockerfile with the right tag.
#
# Requires: rustup (stable), cargo, docker (for `make docker`).

BINARY   := rift
RELEASE  := target/release/$(BINARY)
TAG     ?= latest

# Default: print the menu so people aren't surprised by `make`.
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this menu
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} \
	     /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2 }' \
	     $(MAKEFILE_LIST)

.PHONY: build
build: ## Release build (cargo build --release)
	cargo build --release
	@echo "✔ built $(RELEASE)"

.PHONY: debug
debug: ## Debug build (cargo build) — faster compile, slower binary
	cargo build

.PHONY: test
test: ## Run the full test suite in release mode
	cargo test --release

.PHONY: test-fast
test-fast: ## Run the test suite in debug mode (faster compile)
	cargo test

.PHONY: lint
lint: ## Clippy at pedantic, warnings = errors
	cargo clippy --release -- -D warnings

.PHONY: fmt
fmt: ## Format the code (rustfmt)
	cargo fmt

.PHONY: fmt-check
fmt-check: ## Fail if any file is not rustfmt-clean
	cargo fmt --all -- --check

.PHONY: doc
doc: ## Build the API docs (cargo doc)
	cargo doc --no-deps --open

.PHONY: bench
bench: $(RELEASE) ## Run `rift bench` (rift vs git on 6 metrics)
	./$(RELEASE) bench

.PHONY: clean
clean: ## Remove target/ and other build scratch
	cargo clean
	rm -rf bench-output test-repos

.PHONY: install
install: ## Install the rift binary into ~/.cargo/bin
	cargo install --path . --locked --force

.PHONY: uninstall
uninstall: ## Remove the rift binary from ~/.cargo/bin
	cargo uninstall rift || true

.PHONY: docker
docker: ## Build the runtime Docker image (tagged rift:latest)
	docker build -t $(BINARY):$(TAG) .

.PHONY: docker-run
docker-run: ## Run the rift serve container (port 3030)
	docker run --rm -it -p 3030:3030 -v $$PWD:/repo $(BINARY):$(TAG) \
		serve --public --port 3030

.PHONY: release-dry
release-dry: ## Verify crates.io publish is clean (cargo publish --dry-run)
	cargo publish --dry-run

.PHONY: ci
ci: fmt-check lint test ## Run the full local CI gate (fmt + clippy + tests)
	@echo "✔ local CI gate passed"

# `bench` depends on the release binary so `make bench` works from a
# clean checkout. The target is only re-run when the binary is older
# than the source (make's normal dependency resolution).
$(RELEASE): $(wildcard src/**/*.rs) $(wildcard src/*.rs) Cargo.toml
	cargo build --release
