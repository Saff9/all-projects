#include "config.h"
#include "utils.h"
#include <fstream>

Config& Config::instance() {
    static Config inst;
    return inst;
}

bool Config::load(const std::string& path) {
    config_path_ = path;
    if (!utils::file_exists(path)) {
        set_defaults();
        return save(path);
    }

    try {
        std::string content = utils::read_file(path);
        auto j = json::parse(content);

        if (j.contains("port")) data_.port = j["port"].get<int>();
        if (j.contains("host")) data_.host = j["host"].get<std::string>();
        if (j.contains("output_dir")) data_.output_dir = j["output_dir"].get<std::string>();
        if (j.contains("clips_dir")) data_.clips_dir = j["clips_dir"].get<std::string>();
        if (j.contains("groq_api_key")) data_.groq_api_key = j["groq_api_key"].get<std::string>();
        if (j.contains("whisper_model")) data_.whisper_model = j["whisper_model"].get<std::string>();
        if (j.contains("llm_model")) data_.llm_model = j["llm_model"].get<std::string>();
        if (j.contains("max_clip_duration")) data_.max_clip_duration = j["max_clip_duration"].get<int>();
        if (j.contains("min_clip_duration")) data_.min_clip_duration = j["min_clip_duration"].get<int>();
        if (j.contains("max_clips")) data_.max_clips = j["max_clips"].get<int>();
        if (j.contains("default_platform")) data_.default_platform = j["default_platform"].get<std::string>();
        if (j.contains("clip_crf")) data_.clip_crf = j["clip_crf"].get<int>();
        if (j.contains("clip_preset")) data_.clip_preset = j["clip_preset"].get<std::string>();
        if (j.contains("cookies_from_browser")) data_.cookies_from_browser = j["cookies_from_browser"].get<std::string>();
        if (j.contains("cookies_file")) data_.cookies_file = j["cookies_file"].get<std::string>();
        if (j.contains("video_ratio")) data_.video_ratio = j["video_ratio"].get<std::string>();
        if (j.contains("caption_style")) data_.caption_style = j["caption_style"].get<std::string>();

        utils::Logger::instance().info("Config loaded from: " + path);
        return true;
    } catch (const std::exception& e) {
        utils::Logger::instance().error("Failed to parse config: " + std::string(e.what()));
        set_defaults();
        return false;
    }
}

bool Config::save(const std::string& path) {
    json j;
    j["port"] = data_.port;
    j["host"] = data_.host;
    j["output_dir"] = data_.output_dir;
    j["clips_dir"] = data_.clips_dir;
    j["groq_api_key"] = data_.groq_api_key;
    j["whisper_model"] = data_.whisper_model;
    j["llm_model"] = data_.llm_model;
    j["max_clip_duration"] = data_.max_clip_duration;
    j["min_clip_duration"] = data_.min_clip_duration;
    j["max_clips"] = data_.max_clips;
    j["default_platform"] = data_.default_platform;
    j["clip_crf"] = data_.clip_crf;
    j["clip_preset"] = data_.clip_preset;
    j["cookies_from_browser"] = data_.cookies_from_browser;
    j["cookies_file"] = data_.cookies_file;
    j["video_ratio"] = data_.video_ratio;
    j["caption_style"] = data_.caption_style;

    std::ofstream f(path);
    f << j.dump(4) << std::endl;
    return f.good();
}

void Config::set_defaults() {
    data_ = AppConfig{};
}

std::string Config::get(const std::string& key, const std::string& def) const {
    auto it = overrides_.find(key);
    if (it != overrides_.end()) return it->second;
    return def;
}

void Config::set(const std::string& key, const std::string& value) {
    overrides_[key] = value;
}
