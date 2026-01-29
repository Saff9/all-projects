#pragma once
#include <string>
#include <vector>

struct TranscriptSegment {
    double start;
    double end;
    std::string text;
};

struct TranscriptResult {
    bool success;
    std::string full_text;
    std::vector<TranscriptSegment> segments;
    std::string error;
};

class Transcriber {
public:
    Transcriber(const std::string& api_key, const std::string& model = "whisper-large-v3");
    TranscriptResult transcribe(const std::string& audio_path);
private:
    std::string api_key_;
    std::string model_;
    std::string call_groq_whisper(const std::string& audio_path);
    std::vector<TranscriptSegment> parse_segments(const std::string& json);
};
