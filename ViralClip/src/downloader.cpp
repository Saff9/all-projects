#include "downloader.h"
#include "utils.h"
#include <cstdlib>
#include <filesystem>
#include <regex>
#include "json.hpp"

using json = nlohmann::json;

Downloader::Downloader(const std::string& output_dir) : output_dir_(output_dir) {
    utils::ensure_dir(output_dir_);
}

static bool find_video_in_dir(const std::string& dir, std::string& out_path) {
    std::vector<std::string> exts = {".mp4", ".webm", ".mkv", ".m4a"};
    for (auto& entry : std::filesystem::directory_iterator(dir)) {
        auto ext = entry.path().extension().string();
        for (auto& vext : exts) {
            if (ext == vext) {
                out_path = entry.path().string();
                return true;
            }
        }
    }
    return false;
}

static std::string make_yt_args(const std::string& player_client) {
    if (!player_client.empty()) {
        return " --extractor-args \"youtube:player_client=" + player_client + "\"";
    }
    return "";
}

DownloadResult Downloader::download(const std::string& url) {
    DownloadResult result{false, "", "", "", "", "", ""};
    std::string id = utils::generate_id(8);
    std::string work_dir = output_dir_ + "/" + id;
    utils::ensure_dir(work_dir);

    utils::Logger::instance().info("Downloading: " + url);

    bool is_youtube = (url.find("youtube.com") != std::string::npos ||
                       url.find("youtu.be") != std::string::npos);

    // Build cookies flags
    std::string cookie_flags;
    if (!cookies_file_.empty()) {
        cookie_flags = " --cookies \"" + cookies_file_ + "\"";
    } else if (!cookies_from_browser_.empty()) {
        cookie_flags = " --cookies-from-browser " + cookies_from_browser_;
    }
    // Also try local cookies.txt as fallback
    if (cookie_flags.empty() && utils::file_exists("cookies.txt")) {
        cookie_flags = " --cookies \"cookies.txt\"";
        utils::Logger::instance().info("Using cookies.txt from working directory");
    }

    // YouTube needs --remote-components for JS challenge solving
    std::string remote_components;
    if (is_youtube) {
        remote_components = " --remote-components ejs:github";
    }

    // --- Step 1: Get video info ---
    std::string info_json;
    if (is_youtube && !cookie_flags.empty()) {
        std::string cmd = "yt-dlp --dump-json --no-download --no-warnings --no-check-certificates" +
                          cookie_flags + remote_components + " \"" + url + "\" 2>/dev/null";
        info_json = utils::exec_cmd(cmd);
    }
    if (info_json.empty()) {
        std::vector<std::string> clients = {"android_vr,web", "tv_embedded", "ios,web", "mweb", ""};
        for (auto& client : clients) {
            std::string cmd = "yt-dlp --dump-json --no-download --no-warnings --no-check-certificates" +
                              remote_components +
                              make_yt_args(client) + " \"" + url + "\" 2>/dev/null";
            info_json = utils::exec_cmd(cmd);
            if (!info_json.empty()) break;
        }
    }

    try {
        auto info = json::parse(info_json);
        result.title = info.value("title", "unknown");
        result.thumbnail = info.value("thumbnail", "");
        double dur = info.value("duration", 0.0);
        int mins = (int)(dur / 60);
        int secs = (int)(dur) % 60;
        result.duration = std::to_string(mins) + ":" + (secs < 10 ? "0" : "") + std::to_string(secs);
    } catch (...) {
        result.title = "unknown";
    }

    std::string safe_title = utils::sanitize_filename(result.title);
    if (safe_title.empty() || safe_title == "unknown") safe_title = id;
    std::string output_template = work_dir + "/" + safe_title + ".%(ext)s";

    // --- Step 2: Download with multiple strategies ---
    if (progress_cb_) progress_cb_("Downloading video...");

    std::string video_path;
    std::string dl_out;

    // Strategy 1: If cookies available, just use them (most reliable)
    if (!cookie_flags.empty()) {
        dl_out = utils::exec_cmd("yt-dlp --no-warnings --no-check-certificates" +
                                  cookie_flags + remote_components +
                                  " --merge-output-format mp4 -o \"" + output_template + "\" \"" + url + "\" 2>&1");
        find_video_in_dir(work_dir, video_path);
    }

    // Strategy 2: Try player_client variants (works for non-YouTube and sometimes YouTube)
    if (video_path.empty()) {
        std::vector<std::string> clients = {"android_vr,web", "tv_embedded", "ios,web", "mweb", ""};
        for (auto& client : clients) {
            std::string yt_args = make_yt_args(client);
            dl_out = utils::exec_cmd("yt-dlp --no-warnings --no-check-certificates" +
                                      yt_args + remote_components +
                                      " --merge-output-format mp4 -o \"" + output_template + "\" \"" + url + "\" 2>&1");
            if (find_video_in_dir(work_dir, video_path)) break;

            dl_out = utils::exec_cmd("yt-dlp --no-warnings --no-check-certificates" +
                                      yt_args + remote_components +
                                      " -o \"" + output_template + "\" \"" + url + "\" 2>&1");
            if (find_video_in_dir(work_dir, video_path)) break;
        }
    }

    // --- Step 3: Check result ---
    if (video_path.empty() || !utils::file_exists(video_path)) {
        if (is_youtube) {
            if (cookie_flags.empty()) {
                result.error = "YouTube blocked the download (bot detection). "
                               "Open Settings and paste your YouTube cookies (from the "
                               "'Get cookies.txt LOCALLY' Chrome extension).";
            } else {
                result.error = "YouTube download failed. Your cookies may be expired. "
                               "Please export fresh cookies from your browser and update them in Settings.";
            }
        } else {
            result.error = "Failed to download video: " + dl_out.substr(0, 500);
        }
        return result;
    }

    // --- Step 4: Extract audio ---
    if (progress_cb_) progress_cb_("Extracting audio...");
    std::string audio_path = work_dir + "/audio.mp3";
    std::string audio_cmd = "ffmpeg -y -i \"" + video_path + "\" -vn -acodec libmp3lame -ar 16000 -ac 1 -q:a 2 \"" + audio_path + "\" 2>/dev/null";
    utils::exec_cmd(audio_cmd);

    if (!utils::file_exists(audio_path)) {
        audio_path = work_dir + "/audio.wav";
        audio_cmd = "ffmpeg -y -i \"" + video_path + "\" -vn -ar 16000 -ac 1 \"" + audio_path + "\" 2>/dev/null";
        utils::exec_cmd(audio_cmd);
    }

    result.success = true;
    result.video_path = video_path;
    result.audio_path = utils::file_exists(audio_path) ? audio_path : "";
    result.error = "";

    utils::Logger::instance().info("Downloaded: " + result.title + " -> " + video_path);
    return result;
}
