#pragma once
#include <string>
#include <vector>
#include <map>
#include "json.hpp"

using json = nlohmann::json;

struct ViralClip {
    int id;
    double start_time;
    double end_time;
    std::string title;
    std::string hook;
    int virality_score;
    std::string reason;
    std::string platform_hint;
};

struct CaptionSet {
    std::vector<std::string> general;
    std::vector<std::string> tiktok;
    std::vector<std::string> instagram;
    std::vector<std::string> youtube;
    std::vector<std::string> twitter;

    std::vector<std::string> get_for_platform(const std::string& platform) const {
        if (platform == "tiktok") return tiktok;
        if (platform == "instagram") return instagram;
        if (platform == "youtube") return youtube;
        if (platform == "twitter") return twitter;
        return general;
    }

    json to_json() const {
        json j;
        j["general"] = general;
        j["tiktok"] = tiktok;
        j["instagram"] = instagram;
        j["youtube"] = youtube;
        j["twitter"] = twitter;
        return j;
    }
};

struct AnalysisResult {
    bool success = false;
    std::vector<ViralClip> clips;
    CaptionSet captions;
    std::vector<std::string> tags;
    std::string description;
    std::string error;
    int total_segments_analyzed = 0;
};

class Analyzer {
public:
    Analyzer(const std::string& api_key, const std::string& model = "llama-3.3-70b-versatile");
    AnalysisResult analyze(const std::string& transcript, const std::string& title,
                           double duration_sec, const std::string& platform = "general",
                           int max_clips = 8);
private:
    std::string api_key_;
    std::string model_;
    std::string call_groq_llm(const std::string& prompt);
    AnalysisResult parse_response(const std::string& json_str);
};
