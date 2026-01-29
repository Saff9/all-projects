#include "analyzer.h"
#include "utils.h"
#include "json.hpp"
#include <curl/curl.h>
#include <sstream>

using json = nlohmann::json;

static size_t write_cb(void* contents, size_t size, size_t nmemb, std::string* s) {
    s->append(static_cast<char*>(contents), size * nmemb);
    return size * nmemb;
}

Analyzer::Analyzer(const std::string& api_key, const std::string& model)
    : api_key_(api_key), model_(model) {}

AnalysisResult Analyzer::analyze(const std::string& transcript, const std::string& title,
                                  double duration_sec, const std::string& platform, int max_clips) {
    AnalysisResult result{false, {}, {}, {}, "", "", 0};

    std::string platform_guidance;
    if (platform == "tiktok") {
        platform_guidance =
            "TikTok-SPECIFIC GUIDANCE:\n"
            "- Clips should be 15-60 seconds (TikTok sweet spot)\n"
            "- Hook must appear in first 2 seconds\n"
            "- Prefer high-energy, emotional, or surprising moments\n"
            "- Use trending sounds/music references if detectable\n"
            "- Captions: Use TikTok-native style: short, punchy, use POV, This is your sign, Wait for it\n"
            "- Tags: Mix viral TikTok hashtags with niche ones\n"
            "- Description: Under 300 chars, front-load the hook, add 3-5 hashtags";
    } else if (platform == "instagram") {
        platform_guidance =
            "Instagram-SPECIFIC GUIDANCE:\n"
            "- Clips should be 15-30 seconds for Reels\n"
            "- Focus on aesthetic, aspirational, or educational content\n"
            "- Good lighting and visual quality matters\n"
            "- Captions: Tell a story, use line breaks, end with CTA\n"
            "- Tags: 20-30 mix of broad and niche hashtags\n"
            "- Description: 2-3 sentences with a strong hook, emojis, and hashtags at end";
    } else if (platform == "youtube") {
        platform_guidance =
            "YouTube-SPECIFIC GUIDANCE:\n"
            "- Clips can be 30-90 seconds for Shorts, or longer for regular clips\n"
            "- Strong thumbnail moment is critical\n"
            "- Title should be searchable and clickable\n"
            "- Captions: SEO-friendly, include keywords naturally, use Shorts hashtag\n"
            "- Tags: Full YouTube SEO tags (10-15), mix high and low volume keywords\n"
            "- Description: 2-3 paragraphs with timestamps, keywords, and links";
    } else if (platform == "twitter") {
        platform_guidance =
            "Twitter/X-SPECIFIC GUIDANCE:\n"
            "- Clips should be 15-45 seconds (attention span is short)\n"
            "- Focus on controversial takes, hot takes, or quote-worthy moments\n"
            "- Captions: Under 280 chars ideally, use quote-worthy formatting, add context\n"
            "- Tags: 3-5 trending hashtags max\n"
            "- Description: Short, punchy, conversation-starting";
    } else {
        platform_guidance =
            "GENERAL GUIDANCE:\n"
            "- Clips should be 15-60 seconds\n"
            "- Focus on the most emotionally engaging, surprising, or valuable moments\n"
            "- Captions: Vary in style across emotional, professional, funny, educational\n"
            "- Tags: Mix trending and niche, 10-15 total\n"
            "- Description: SEO-optimized, 2-3 sentences";
    }

    std::string max_clips_str = std::to_string(max_clips);
    std::string dur_str = std::to_string(static_cast<int>(duration_sec));
    std::string dur_fmt = utils::format_duration(duration_sec);

    std::string prompt =
        "You are an expert viral content analyst and social media strategist. "
        "Analyze this video transcript and create the most viral-optimized content package possible.\n\n"
        "VIDEO TITLE: " + title + "\n"
        "DURATION: " + dur_str + " seconds ( " + dur_fmt + " )\n"
        "TARGET PLATFORM: " + platform + "\n"
        "MAX CLIPS: " + max_clips_str + "\n\n" +
        platform_guidance + "\n\n"
        "TRANSCRIPT:\n" + transcript + "\n\n"
        "ANALYSIS RULES:\n"
        "1. Identify the TOP " + max_clips_str + " viral-worthy segments from the transcript\n"
        "2. Each clip must have a clear scroll-stopping moment\n"
        "3. Virality scoring must be honest and specific - do not inflate scores\n"
        "4. Every clip needs a unique hook that works on its own\n"
        "5. Timestamps must be precise (within 1-2 seconds accuracy)\n"
        "6. Think about WHY each moment would make someone stop scrolling, watch, and share\n\n"
        "CLIP SELECTION CRITERIA (in order of priority):\n"
        "- Emotional peak (laughter, surprise, anger, awe, cringe)\n"
        "- Controversy or debate-worthy statements\n"
        "- Save for later educational value\n"
        "- Satisfying or ASMR-like moments\n"
        "- Relatable same moments\n"
        "- Plot twists or unexpected turns\n\n"
        "Return ONLY valid JSON with this exact structure (no markdown, no explanation):\n"
        "{\n"
        "  \"clips\": [\n"
        "    {\n"
        "      \"id\": 1,\n"
        "      \"start_time\": 0.0,\n"
        "      \"end_time\": 30.0,\n"
        "      \"title\": \"Catchy short title (max 60 chars)\",\n"
        "      \"hook\": \"One compelling line that makes people NEED to watch\",\n"
        "      \"virality_score\": 85,\n"
        "      \"reason\": \"Specific analytical reason this clip could go viral\",\n"
        "      \"platform_hint\": \"Best platform for this specific clip\"\n"
        "    }\n"
        "  ],\n"
        "  \"captions\": {\n"
        "    \"general\": [\"caption1\", \"caption2\", \"caption3\", \"caption4\", \"caption5\"],\n"
        "    \"tiktok\": [\"caption1\", \"caption2\", \"caption3\", \"caption4\", \"caption5\"],\n"
        "    \"instagram\": [\"caption1\", \"caption2\", \"caption3\", \"caption4\", \"caption5\"],\n"
        "    \"youtube\": [\"caption1\", \"caption2\", \"caption3\", \"caption4\", \"caption5\"],\n"
        "    \"twitter\": [\"caption1\", \"caption2\", \"caption3\", \"caption4\", \"caption5\"]\n"
        "  },\n"
        "  \"tags\": [\"tag1\", \"tag2\", \"tag3\", \"tag4\", \"tag5\", \"tag6\", \"tag7\", \"tag8\", \"tag9\", \"tag10\"],\n"
        "  \"description\": \"SEO-optimized 2-3 sentence description with natural keyword placement and relevant hashtags\"\n"
        "}\n\n"
        "IMPORTANT:\n"
        "- Generate at least 5 captions per platform (25 total minimum)\n"
        "- Tags must be specific and trending-relevant\n"
        "- Description must include natural keyword density for SEO\n"
        "- Each clip virality_score should reflect genuine viral potential\n"
        "- Clips should not overlap in content or timestamps\n"
        "- Order clips by virality_score descending\n";

    std::string response = call_groq_llm(prompt);
    if (response.empty()) {
        result.error = "Empty response from Groq API";
        return result;
    }

    result = parse_response(response);
    result.total_segments_analyzed = static_cast<int>(transcript.size() / 100);
    return result;
}

std::string Analyzer::call_groq_llm(const std::string& prompt) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";

    std::string response;

    json request_body;
    request_body["model"] = model_;
    request_body["messages"] = json::array({
        {{"role", "system"}, {"content", "You are a world-class viral content analyst. You respond ONLY with valid JSON. No markdown, no code blocks, no explanation."}},
        {{"role", "user"}, {"content", prompt}}
    });
    request_body["temperature"] = 0.6;
    request_body["max_tokens"] = 8192;
    request_body["response_format"] = {{"type", "json_object"}};

    std::string body_str = request_body.dump();

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    std::string auth = "Authorization: Bearer " + api_key_;
    headers = curl_slist_append(headers, auth.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, "https://api.groq.com/openai/v1/chat/completions");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body_str.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(body_str.size()));
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 120L);
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30L);

    CURLcode res = curl_easy_perform(curl);

    if (res != CURLE_OK) {
        utils::Logger::instance().error("Groq LLM error: " + std::string(curl_easy_strerror(res)));
    } else {
        long http_code = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
        if (http_code != 200) {
            utils::Logger::instance().error("Groq API HTTP " + std::to_string(http_code) + ": " + response.substr(0, 500));
        }
    }

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    return response;
}

AnalysisResult Analyzer::parse_response(const std::string& json_str) {
    AnalysisResult result{false, {}, {}, {}, "", "", 0};

    try {
        auto outer = json::parse(json_str);

        std::string content;
        if (outer.contains("choices") && outer["choices"].is_array() && !outer["choices"].empty()) {
            content = outer["choices"][0]["message"]["content"].get<std::string>();
        } else {
            result.error = "Unexpected API response structure";
            return result;
        }

        auto data = json::parse(content);

        if (data.contains("clips")) {
            for (auto& c : data["clips"]) {
                ViralClip clip;
                clip.id = c.value("id", 0);
                clip.start_time = c.value("start_time", 0.0);
                clip.end_time = c.value("end_time", 0.0);
                clip.title = c.value("title", "");
                clip.hook = c.value("hook", "");
                clip.virality_score = c.value("virality_score", 0);
                clip.reason = c.value("reason", "");
                clip.platform_hint = c.value("platform_hint", "");

                if (clip.virality_score < 1) clip.virality_score = 1;
                if (clip.virality_score > 100) clip.virality_score = 100;
                if (clip.end_time <= clip.start_time) {
                    clip.end_time = clip.start_time + 30;
                }

                result.clips.push_back(clip);
            }
        }

        if (data.contains("captions") && data["captions"].is_object()) {
            auto& caps = data["captions"];
            auto extract = [&](const std::string& key, std::vector<std::string>& out) {
                if (caps.contains(key) && caps[key].is_array()) {
                    for (auto& c : caps[key]) {
                        out.push_back(c.get<std::string>());
                    }
                }
            };
            extract("general", result.captions.general);
            extract("tiktok", result.captions.tiktok);
            extract("instagram", result.captions.instagram);
            extract("youtube", result.captions.youtube);
            extract("twitter", result.captions.twitter);
        } else if (data.contains("captions") && data["captions"].is_array()) {
            for (auto& c : data["captions"]) {
                result.captions.general.push_back(c.get<std::string>());
            }
        }

        if (data.contains("tags")) {
            for (auto& t : data["tags"]) {
                result.tags.push_back(t.get<std::string>());
            }
        }

        result.description = data.value("description", "");
        result.success = true;

        std::sort(result.clips.begin(), result.clips.end(),
            [](const ViralClip& a, const ViralClip& b) { return a.virality_score > b.virality_score; });

    } catch (const std::exception& e) {
        result.error = "Failed to parse analysis: " + std::string(e.what());
    }

    return result;
}
