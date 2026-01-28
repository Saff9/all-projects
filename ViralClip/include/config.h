#pragma once
#include <string>
#include <map>
#include "json.hpp"

using json = nlohmann::json;

struct AppConfig {
    int port = 8080;
    std::string host = "0.0.0.0";
    std::string output_dir = "./output";
    std::string clips_dir = "./output/clips";

    std::string groq_api_key;
    std::string whisper_model = "whisper-large-v3";
    std::string llm_model = "llama-3.3-70b-versatile";
    int max_clip_duration = 60;
    int min_clip_duration = 10;
    int max_clips = 8;
    std::string default_platform = "general";
    int clip_crf = 23;
    std::string clip_preset = "fast";
    std::string cookies_from_browser;
    std::string cookies_file;
    std::string video_ratio = "16:9";
    std::string caption_style = "bold";
};

class Config {
public:
    static Config& instance();

    bool load(const std::string& path);
    bool save(const std::string& path);
    void set_defaults();

    AppConfig& data() { return data_; }
    const AppConfig& data() const { return data_; }

    std::string get(const std::string& key, const std::string& def = "") const;
    void set(const std::string& key, const std::string& value);
private:
    Config() {}
    AppConfig data_;
    std::string config_path_;
    std::map<std::string, std::string> overrides_;
};
