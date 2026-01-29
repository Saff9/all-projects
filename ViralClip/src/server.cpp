#include "server.h"
#include "utils.h"
#include "httplib.h"
#include "json.hpp"
#include <thread>
#include <chrono>
#include <fstream>

Server::Server(int port, const std::string& static_dir, const std::string& clips_dir)
    : port_(port), static_dir_(static_dir), clips_dir_(clips_dir) {}

static std::string read_file(const std::string& path) {
    std::ifstream ifs(path, std::ios::binary);
    return std::string((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
}

static bool has_ext(const std::string& path, const std::string& ext) {
    return path.size() >= ext.size() && path.compare(path.size() - ext.size(), ext.size(), ext) == 0;
}

static std::string mime_type(const std::string& path) {
    if (has_ext(path, ".html")) return "text/html";
    if (has_ext(path, ".css")) return "text/css";
    if (has_ext(path, ".js")) return "application/javascript";
    if (has_ext(path, ".svg")) return "image/svg+xml";
    if (has_ext(path, ".json")) return "application/json";
    if (has_ext(path, ".png")) return "image/png";
    if (has_ext(path, ".jpg") || has_ext(path, ".jpeg")) return "image/jpeg";
    if (has_ext(path, ".ico")) return "image/x-icon";
    if (has_ext(path, ".woff")) return "font/woff";
    if (has_ext(path, ".woff2")) return "font/woff2";
    return "application/octet-stream";
}

void Server::start() {
    httplib::Server svr;

    // Serve frontend static files
    svr.Get("/", [this](const httplib::Request&, httplib::Response& res) {
        std::string path = static_dir_ + "/index.html";
        if (std::filesystem::exists(path)) {
            res.set_content(read_file(path), "text/html");
        } else {
            res.status = 404;
            res.set_content("Frontend not built. Run: cd webapp && npm run build", "text/plain");
        }
    });

    svr.Get("/assets/.*", [this](const httplib::Request& req, httplib::Response& res) {
        std::string path = static_dir_ + req.path;
        if (std::filesystem::exists(path) && std::filesystem::is_regular_file(path)) {
            res.set_content(read_file(path), mime_type(path));
        } else {
            res.status = 404;
        }
    });

    svr.Get("/favicon.svg", [this](const httplib::Request&, httplib::Response& res) {
        std::string path = static_dir_ + "/favicon.svg";
        if (std::filesystem::exists(path)) {
            res.set_content(read_file(path), "image/svg+xml");
        }
    });

    svr.Get("/icons.svg", [this](const httplib::Request&, httplib::Response& res) {
        std::string path = static_dir_ + "/icons.svg";
        if (std::filesystem::exists(path)) {
            res.set_content(read_file(path), "image/svg+xml");
        }
    });

    // Clips download
    svr.Get("/clips/.*", [this](const httplib::Request& req, httplib::Response& res) {
        std::string filename = req.path.substr(req.path.rfind('/') + 1);
        std::string path = clips_dir_ + "/" + filename;
        if (std::filesystem::exists(path)) {
            res.set_content(read_file(path), "video/mp4");
        } else {
            res.status = 404;
        }
    });

    svr.Post("/api/process", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            ProcessRequest preq;
            preq.id = utils::generate_id(8);
            preq.url = body.value("url", "");
            preq.api_key = body.value("api_key", "");
            preq.platform = body.value("platform", "general");
            preq.llm_model = body.value("llm_model", "llama-3.3-70b-versatile");
            preq.whisper_model = body.value("whisper_model", "whisper-large-v3");
            preq.max_clips = body.value("max_clips", 8);
            preq.video_ratio = body.value("video_ratio", "16:9");
            preq.caption_style = body.value("caption_style", "bold");

            if (preq.url.empty()) {
                res.status = 400;
                res.set_content(R"({"success":false,"error":"URL is required"})", "application/json");
                return;
            }
            if (preq.api_key.empty()) {
                res.status = 400;
                res.set_content(R"({"success":false,"error":"API key is required"})", "application/json");
                return;
            }

            utils::Logger::instance().info("[" + preq.id + "] Processing: " + preq.url);

            {
                std::lock_guard<std::mutex> lock(progress_map_mtx_);
                trackers_.emplace(preq.id, utils::ProgressTracker{});
            }

            auto tracker_it = trackers_.find(preq.id);
            auto& tracker = tracker_it->second;
            tracker.reset();

            auto* self = this;
            std::string req_id = preq.id;
            tracker.set_callback([self, req_id](const utils::ProgressTracker::Step& step) {
                json msg;
                msg["type"] = "progress";
                msg["request_id"] = req_id;
                msg["label"] = step.label;
                msg["percent"] = step.percent;
                msg["detail"] = step.detail;
                std::string data_str = "data: " + msg.dump() + "\n\n";

                std::lock_guard<std::mutex> lock(self->progress_map_mtx_);
                if (self->sse_queues_.count(req_id)) {
                    for (auto& q : self->sse_queues_[req_id]) {
                        q = data_str;
                    }
                }
            });

            // Return request_id immediately, process in background thread
            json ack;
            ack["success"] = true;
            ack["request_id"] = preq.id;
            res.set_content(ack.dump(), "application/json");

            // Spawn processing in background thread
            std::thread([self, preq, tracker_it]() mutable {
                auto& tracker = tracker_it->second;
                ProcessResponse presp = self->process_cb_(preq, tracker);

                json done_msg;
                done_msg["type"] = "complete";
                done_msg["request_id"] = preq.id;
                done_msg["success"] = presp.success;
                done_msg["data"] = presp.data;
                if (!presp.error.empty()) done_msg["error"] = presp.error;
                std::string done_str = "data: " + done_msg.dump() + "\n\n";

                {
                    std::lock_guard<std::mutex> lock(self->progress_map_mtx_);
                    if (self->sse_queues_.count(preq.id)) {
                        for (auto& q : self->sse_queues_[preq.id]) {
                            q = done_str;
                        }
                    }
                }
            }).detach();

        } catch (const std::exception& e) {
            res.status = 500;
            json err = {{"success", false}, {"error", e.what()}};
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Get("/api/stream/:id", [this](const httplib::Request& req, httplib::Response& res) {
        std::string request_id = req.path_params.at("id");
        res.set_header("Content-Type", "text/event-stream");
        res.set_header("Cache-Control", "no-cache");
        res.set_header("Connection", "keep-alive");
        res.set_header("X-Accel-Buffering", "no");

        std::string empty_queue;
        {
            std::lock_guard<std::mutex> lock(progress_map_mtx_);
            sse_queues_[request_id].push_back(empty_queue);
        }

        httplib::ContentProviderWithoutLength provider =
            [this, request_id](size_t, httplib::DataSink& sink) -> bool {
                auto last_msg_time = std::chrono::steady_clock::now();
                while (true) {
                    std::string msg;
                    {
                        std::lock_guard<std::mutex> lock(progress_map_mtx_);
                        if (!sse_queues_.count(request_id)) break;
                        auto& q = sse_queues_[request_id];
                        for (auto it = q.begin(); it != q.end(); ++it) {
                            if (!it->empty()) {
                                msg = *it;
                                it->clear();
                                break;
                            }
                        }
                    }

                    if (!msg.empty()) {
                        sink.write(msg.c_str(), msg.size());
                        last_msg_time = std::chrono::steady_clock::now();

                        if (msg.find("\"type\":\"complete\"") != std::string::npos ||
                            msg.find("\"type\": \"complete\"") != std::string::npos) {
                            break;
                        }
                    } else {
                        auto now = std::chrono::steady_clock::now();
                        if (std::chrono::duration_cast<std::chrono::seconds>(now - last_msg_time).count() > 60) {
                            json ping = {{"type", "ping"}};
                            std::string ping_str = "data: " + ping.dump() + "\n\n";
                            sink.write(ping_str.c_str(), ping_str.size());
                            last_msg_time = now;
                        }
                    }

                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                }

                {
                    std::lock_guard<std::mutex> lock(progress_map_mtx_);
                    if (sse_queues_.count(request_id)) {
                        sse_queues_.erase(request_id);
                    }
                }
                return true;
            };

        res.set_chunked_content_provider("text/event-stream", provider);
    });

    svr.Post("/api/batch", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            if (!body.contains("urls") || !body["urls"].is_array()) {
                res.status = 400;
                res.set_content(R"({"success":false,"error":"urls array is required"})", "application/json");
                return;
            }

            std::string api_key = body.value("api_key", "");
            std::string platform = body.value("platform", "general");
            if (api_key.empty()) {
                res.status = 400;
                res.set_content(R"({"success":false,"error":"api_key is required"})", "application/json");
                return;
            }

            json results = json::array();
            for (auto& url_val : body["urls"]) {
                std::string url = url_val.get<std::string>();
                std::string id = utils::generate_id(8);

                ProcessRequest preq;
                preq.id = id;
                preq.url = url;
                preq.api_key = api_key;
                preq.platform = platform;
            preq.max_clips = body.value("max_clips", 8);

                utils::ProgressTracker tracker;
                tracker.reset();
                ProcessResponse presp = process_cb_(preq, tracker);

                json item;
                item["url"] = url;
                item["request_id"] = id;
                item["success"] = presp.success;
                item["data"] = presp.data;
                if (!presp.error.empty()) item["error"] = presp.error;
                results.push_back(item);
            }

            json resp_data;
            resp_data["success"] = true;
            resp_data["results"] = results;
            resp_data["total"] = results.size();

            res.set_content(resp_data.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            json err = {{"success", false}, {"error", e.what()}};
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Post("/api/cookies", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string content = body.value("cookies", "");
            if (content.empty()) {
                res.status = 400;
                res.set_content(R"({"success":false,"error":"cookies content is required"})", "application/json");
                return;
            }
            std::string cookies_path = Config::instance().data().cookies_file;
            if (cookies_path.empty()) {
                cookies_path = "cookies.txt";
                // Update config to use this path
            }
            std::ofstream ofs(cookies_path);
            if (!ofs.is_open()) {
                res.status = 500;
                res.set_content(R"({"success":false,"error":"Failed to write cookies file"})", "application/json");
                return;
            }
            ofs << content;
            ofs.close();
            utils::Logger::instance().info("Cookies saved to " + cookies_path);

            json resp;
            resp["success"] = true;
            resp["path"] = cookies_path;
            resp["message"] = "Cookies saved. YouTube downloads should now work.";
            res.set_content(resp.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            json err = {{"success", false}, {"error", e.what()}};
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        json health;
        health["status"] = "ok";
        health["version"] = "1.0.0";
        health["engine"] = "viralclip-cpp";
        res.set_content(health.dump(), "application/json");
    });

    svr.Get("/api/config", [](const httplib::Request&, httplib::Response& res) {
        json cfg;
        cfg["whisper_model"] = Config::instance().data().whisper_model;
        cfg["llm_model"] = Config::instance().data().llm_model;
        cfg["max_clips"] = Config::instance().data().max_clips;
        cfg["default_platform"] = Config::instance().data().default_platform;
        cfg["video_ratio"] = Config::instance().data().video_ratio;
        cfg["caption_style"] = Config::instance().data().caption_style;
        cfg["platforms"] = {"general", "tiktok", "instagram", "youtube", "twitter"};
        cfg["video_ratios"] = {"16:9", "9:16", "1:1", "4:5"};
        cfg["caption_styles"] = {"bold", "modern", "neon", "classic"};
        cfg["whisper_models"] = {"whisper-large-v3", "whisper-large-v3-turbo", "whisper-medium"};
        cfg["llm_models"] = {"llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"};
        res.set_content(cfg.dump(), "application/json");
    });

    utils::Logger::instance().info("Server starting on port " + std::to_string(port_));
    svr.listen("0.0.0.0", port_);
}

void Server::stop() {
}
