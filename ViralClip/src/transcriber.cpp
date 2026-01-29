#include "transcriber.h"
#include "utils.h"
#include "json.hpp"
#include <curl/curl.h>
#include <fstream>
#include <sstream>

using json = nlohmann::json;

static size_t write_callback(void* contents, size_t size, size_t nmemb, std::string* s) {
    s->append((char*)contents, size * nmemb);
    return size * nmemb;
}

Transcriber::Transcriber(const std::string& api_key, const std::string& model)
    : api_key_(api_key), model_(model) {}

TranscriptResult Transcriber::transcribe(const std::string& audio_path) {
    TranscriptResult result{false, "", {}, ""};

    if (!utils::file_exists(audio_path)) {
        result.error = "Audio file not found: " + audio_path;
        return result;
    }

    utils::Logger::instance().info("Transcribing audio...");

    std::string response = call_groq_whisper(audio_path);
    if (response.empty()) {
        result.error = "Empty response from Groq API";
        return result;
    }

    try {
        auto j = json::parse(response);
        if (j.contains("error")) {
            result.error = j["error"].dump();
            return result;
        }

        result.full_text = j.value("text", "");
        result.segments = parse_segments(response);
        result.success = true;

        utils::Logger::instance().info("Transcription complete: " + std::to_string(result.segments.size()) + " segments");
    } catch (const std::exception& e) {
        result.error = "Failed to parse transcription: " + std::string(e.what());
    }

    return result;
}

std::string Transcriber::call_groq_whisper(const std::string& audio_path) {
    CURL* curl = curl_easy_init();
    if (!curl) return "";

    std::string response;

    curl_mime* mime = curl_mime_init(curl);
    curl_mimepart* part;

    part = curl_mime_addpart(mime);
    curl_mime_filedata(part, audio_path.c_str());
    curl_mime_name(part, "file");

    part = curl_mime_addpart(mime);
    curl_mime_data(part, model_.c_str(), CURL_ZERO_TERMINATED);
    curl_mime_name(part, "model");

    part = curl_mime_addpart(mime);
    curl_mime_data(part, "verbose_json", CURL_ZERO_TERMINATED);
    curl_mime_name(part, "response_format");

    part = curl_mime_addpart(mime);
    curl_mime_data(part, "en", CURL_ZERO_TERMINATED);
    curl_mime_name(part, "language");

    struct curl_slist* headers = NULL;
    std::string auth = "Authorization: Bearer " + api_key_;
    headers = curl_slist_append(headers, auth.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, "https://api.groq.com/openai/v1/audio/transcriptions");
    curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 300L);

    CURLcode res = curl_easy_perform(curl);

    if (res != CURLE_OK) {
        utils::Logger::instance().error("Groq Whisper error: " + std::string(curl_easy_strerror(res)));
    }

    curl_slist_free_all(headers);
    curl_mime_free(mime);
    curl_easy_cleanup(curl);

    return response;
}

std::vector<TranscriptSegment> Transcriber::parse_segments(const std::string& json_str) {
    std::vector<TranscriptSegment> segments;
    try {
        auto j = json::parse(json_str);
        if (j.contains("segments")) {
            for (auto& seg : j["segments"]) {
                TranscriptSegment s;
                s.start = seg.value("start", 0.0);
                s.end = seg.value("end", 0.0);
                s.text = seg.value("text", "");
                segments.push_back(s);
            }
        }
    } catch (...) {}
    return segments;
}
