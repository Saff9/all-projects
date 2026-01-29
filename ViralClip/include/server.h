#pragma once
#include <string>
#include <functional>
#include <mutex>
#include <map>
#include <atomic>
#include "json.hpp"
#include "utils.h"
#include "config.h"

using json = nlohmann::json;

struct ProcessRequest {
    std::string id;
    std::string url;
    std::string api_key;
    std::string platform;
    std::string llm_model;
    std::string whisper_model;
    int max_clips = 8;
    std::string video_ratio = "16:9";
    std::string caption_style = "bold";
};

struct ProcessResponse {
    bool success = false;
    json data;
    std::string error;
};

class Server {
public:
    using ProcessCallback = std::function<ProcessResponse(const ProcessRequest&, utils::ProgressTracker&)>;

    Server(int port, const std::string& static_dir, const std::string& clips_dir);
    void set_process_cb(ProcessCallback cb) { process_cb_ = cb; }
    void start();
    void stop();
private:
    int port_;
    std::string static_dir_;
    std::string clips_dir_;
    ProcessCallback process_cb_;
    std::atomic<bool> running_{false};

    std::mutex progress_map_mtx_;
    std::map<std::string, utils::ProgressTracker> trackers_;
    std::map<std::string, std::vector<std::string>> sse_queues_;
};
