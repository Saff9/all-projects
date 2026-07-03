# Rift VCS — multi-stage Docker build for self-hosting
# Build: docker build -t rift .
# Run:   docker run -d --name rift-server -p 3030:3030 -v ~/my-repo:/repo rift serve --public --port 3030

FROM rust:1.99-slim AS builder
WORKDIR /build
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates git && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/target/release/rift /usr/local/bin/rift
WORKDIR /repo
EXPOSE 3030
VOLUME ["/repo"]
ENTRYPOINT ["rift"]
CMD ["serve", "--public", "--port", "3030"]
