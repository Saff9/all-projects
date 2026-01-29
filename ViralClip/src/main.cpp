#include "downloader.h"
#include "transcriber.h"
#include "analyzer.h"
#include "clipper.h"
#include "server.h"
#include "config.h"
#include "utils.h"
#include "json.hpp"
#include <iostream>
#include <filesystem>
#include <fstream>
#include <thread>

using json = nlohmann::json;
namespace fs = std::filesystem;

static std::string base_dir;

std::string get_base_dir() {
    if (base_dir.empty()) {
        char* bd = getenv("VIRALCLIP_DIR");
        if (bd && fs::exists(bd)) {
            base_dir = bd;
        } else {
            base_dir = fs::current_path().string();
        }
    }
    return base_dir;
}

std::string get_output_dir() {
    return get_base_dir() + "/" + Config::instance().data().output_dir;
}

std::string get_clips_dir() {
    return get_base_dir() + "/" + Config::instance().data().clips_dir;
}

ProcessResponse handle_process(const ProcessRequest& req, utils::ProgressTracker& progress) {
    ProcessResponse resp{false, json::object(), ""};

    try {
        std::string output_dir = get_output_dir();
        std::string clips_dir = get_clips_dir();
        utils::ensure_dir(output_dir);
        utils::ensure_dir(clips_dir);

        std::string model = req.llm_model.empty() ? Config::instance().data().llm_model : req.llm_model;
        std::string wmodel = req.whisper_model.empty() ? Config::instance().data().whisper_model : req.whisper_model;
        int max_clips = req.max_clips > 0 ? req.max_clips : Config::instance().data().max_clips;
        std::string platform = req.platform.empty() ? Config::instance().data().default_platform : req.platform;

        // Step 1: Download video
        progress.update("Downloading video", 5, "Starting yt-dlp...");
        Downloader dl(output_dir);
        dl.set_progress_cb([&](const std::string& msg) {
            progress.update("Downloading video", 15, msg);
        });
        dl.set_cookies(Config::instance().data().cookies_from_browser,
                       Config::instance().data().cookies_file);
        DownloadResult dl_result = dl.download(req.url);

        if (progress.is_cancelled()) {
            resp.error = "Cancelled by user";
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        if (!dl_result.success) {
            resp.error = "Download failed: " + dl_result.error;
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        progress.update("Video downloaded", 20, dl_result.title + " (" + dl_result.duration + ")");

        // Step 2: Transcribe
        progress.update("Transcribing audio", 25, "Uploading audio to Groq Whisper...");
        Transcriber transcriber(req.api_key, wmodel);
        TranscriptResult tr_result;

        if (!dl_result.audio_path.empty()) {
            tr_result = transcriber.transcribe(dl_result.audio_path);
        } else {
            resp.error = "No audio extracted from video";
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        if (progress.is_cancelled()) {
            resp.error = "Cancelled by user";
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        if (!tr_result.success) {
            resp.error = "Transcription failed: " + tr_result.error;
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        progress.update("Transcription complete", 45, std::to_string(tr_result.segments.size()) + " segments, " +
                        std::to_string(tr_result.full_text.size()) + " chars");

        // Step 3: Analyze with AI
        progress.update("Analyzing viral potential", 50, "Sending to " + model + "...");
        Analyzer analyzer(req.api_key, model);
        double duration_sec = 0;
        {
            auto parts = utils::split(dl_result.duration, ":");
            if (parts.size() == 2) {
                duration_sec = std::stoi(parts[0]) * 60 + std::stoi(parts[1]);
            } else if (parts.size() == 3) {
                duration_sec = std::stoi(parts[0]) * 3600 + std::stoi(parts[1]) * 60 + std::stoi(parts[2]);
            }
        }
        AnalysisResult ar_result = analyzer.analyze(tr_result.full_text, dl_result.title, duration_sec, platform, max_clips);

        if (progress.is_cancelled()) {
            resp.error = "Cancelled by user";
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        if (!ar_result.success) {
            resp.error = "Analysis failed: " + ar_result.error;
            resp.data = {{"success", false}, {"error", resp.error}};
            return resp;
        }

        progress.update("Analysis complete", 70, std::to_string(ar_result.clips.size()) + " clips found, " +
                        std::to_string(ar_result.tags.size()) + " tags generated");

        // Step 4: Create clips
        std::string video_ratio = req.video_ratio.empty() ? Config::instance().data().video_ratio : req.video_ratio;
        std::string caption_style = req.caption_style.empty() ? Config::instance().data().caption_style : req.caption_style;
        progress.update("Creating clips", 75, "Cutting " + std::to_string(ar_result.clips.size()) + " clips with ffmpeg...");
        Clipper clipper(clips_dir);
        clipper.set_video_ratio(video_ratio);
        clipper.set_caption_style(caption_style);
        std::vector<std::pair<double,double>> timestamps;
        std::vector<std::string> clip_names;

        for (size_t i = 0; i < ar_result.clips.size(); i++) {
            auto& c = ar_result.clips[i];
            timestamps.push_back({c.start_time, c.end_time});
            clip_names.push_back("viral_" + std::to_string(c.id) + "_" + utils::sanitize_filename(c.title));
        }

        std::vector<ClipResult> clip_results = clipper.clip_all(dl_result.video_path, timestamps, clip_names);

        int clips_ok = 0;
        for (auto& cr : clip_results) if (cr.success) clips_ok++;

        progress.update("All done", 100, std::to_string(clips_ok) + "/" + std::to_string(ar_result.clips.size()) + " clips created");

        // Build response
        json clips_arr = json::array();
        for (size_t i = 0; i < ar_result.clips.size() && i < clip_results.size(); i++) {
            json clip_obj;
            clip_obj["id"] = ar_result.clips[i].id;
            clip_obj["start_time"] = ar_result.clips[i].start_time;
            clip_obj["end_time"] = ar_result.clips[i].end_time;
            clip_obj["title"] = ar_result.clips[i].title;
            clip_obj["hook"] = ar_result.clips[i].hook;
            clip_obj["virality_score"] = ar_result.clips[i].virality_score;
            clip_obj["reason"] = ar_result.clips[i].reason;
            clip_obj["platform_hint"] = ar_result.clips[i].platform_hint;
            clip_obj["success"] = clip_results[i].success;
            if (clip_results[i].success) {
                clip_obj["clip_file"] = fs::path(clip_results[i].clip_path).filename().string();
                clip_obj["download_url"] = "/clips/" + fs::path(clip_results[i].clip_path).filename().string();
            } else {
                clip_obj["error"] = clip_results[i].error;
            }
            clips_arr.push_back(clip_obj);
        }

        resp.success = true;
        resp.data = {
            {"success", true},
            {"request_id", req.id},
            {"title", dl_result.title},
            {"thumbnail", dl_result.thumbnail},
            {"duration", dl_result.duration},
            {"duration_sec", duration_sec},
            {"platform", platform},
            {"model_used", model},
            {"transcript", tr_result.full_text},
            {"transcript_segments", tr_result.segments.size()},
            {"clips", clips_arr},
            {"clips_count", clips_arr.size()},
            {"captions", ar_result.captions.to_json()},
            {"tags", ar_result.tags},
            {"description", ar_result.description},
            {"metadata", {
                {"engine", "viralclip-cpp"},
                {"version", "1.0.0"},
                {"whisper_model", wmodel},
                {"llm_model", model},
                {"platform", platform}
            }}
        };

        utils::Logger::instance().info("[" + req.id + "] Complete! " +
            std::to_string(ar_result.clips.size()) + " clips, " +
            std::to_string(ar_result.tags.size()) + " tags, " +
            "score range: " +
            (ar_result.clips.empty() ? "N/A" :
                std::to_string(ar_result.clips.back().virality_score) + "-" +
                std::to_string(ar_result.clips.front().virality_score)));

    } catch (const std::exception& e) {
        resp.error = "Internal error: " + std::string(e.what());
        resp.data = {{"success", false}, {"error", resp.error}};
    }

    return resp;
}

int main(int argc, char* argv[]) {
    Config::instance().load("config.json");

    int port = Config::instance().data().port;
    std::string config_file = "config.json";

    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        if ((arg == "-p" || arg == "--port") && i + 1 < argc) {
            port = std::stoi(argv[++i]);
        } else if ((arg == "-c" || arg == "--config") && i + 1 < argc) {
            config_file = argv[++i];
            Config::instance().load(config_file);
            port = Config::instance().data().port;
        } else if (arg == "--help" || arg == "-h") {
            std::cout << R"(
ViralClip Engine - AI-Powered Viral Clip Generator

Usage: viralclip [options]

Options:
  -p, --port PORT     Server port (default: 8080)
  -c, --config FILE   Config file path (default: config.json)
  -h, --help          Show this help

Config file: config.json
)" << std::endl;
            return 0;
        }
    }

    Config::instance().data().port = port;

    std::string clips_dir = get_clips_dir();
    std::string output_dir = get_output_dir();
    utils::ensure_dir(clips_dir);
    utils::ensure_dir(output_dir);

    std::string web_dir = get_base_dir() + "/webapp/dist";
    std::string clips_link = web_dir + "/clips";

    if (fs::is_symlink(clips_link) || fs::exists(clips_link)) {
        fs::remove(clips_link);
    }
    fs::create_symlink(fs::absolute(clips_dir), clips_link);

    std::cout << R"(
  _    __     __  ___           __
 | |  / /____/ /_/ _ \___  ____/ /_
 | | / / __/ __/ ___/ _ \/ __  / __/
 | |/ / /_/ /_/ /  /  __/ /_/ / /_
 |___/\__/\__/_/   \___/\__,_/\__/

 ViralClip Engine v1.0.0
 AI-Powered Viral Clip Generator
)" << std::endl;

    std::cout << "Port:       " << port << std::endl;
    std::cout << "Output:     " << output_dir << std::endl;
    std::cout << "Clips:      " << clips_dir << std::endl;
    std::cout << "Web UI:     " << web_dir << std::endl;
    std::cout << "Config:     " << config_file << std::endl;

    auto& cfg = Config::instance().data();
    std::cout << "LLM Model:  " << cfg.llm_model << std::endl;
    std::cout << "Whisper:    " << cfg.whisper_model << std::endl;
    std::cout << "Platform:   " << cfg.default_platform << std::endl;
    std::cout << "Max Clips:  " << cfg.max_clips << std::endl;

    Server server(port, web_dir, clips_dir);
    server.set_process_cb(handle_process);

    std::cout << "\n  -> Open http://localhost:" << port << " in your browser\n" << std::endl;

    server.start();

    return 0;
}
