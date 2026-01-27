FROM ubuntu:24.04 AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake \
    libcurl4-openssl-dev \
    ffmpeg \
    python3-pip \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY include/ include/
COPY src/ src/
COPY CMakeLists.txt .
COPY webapp/ webapp/
COPY config.json .

RUN cd webapp && npm install && npm run build && \
    mkdir -p output/clips && \
    cmake -B build -DCMAKE_BUILD_TYPE=Release && \
    cmake --build build -j$(nproc)

EXPOSE 8080

VOLUME ["/app/output"]

CMD ["./build/viralclip", "8080"]
