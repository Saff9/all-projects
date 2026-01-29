#include "clipper.h"
#include "utils.h"
#include "config.h"
#include <filesystem>
#include <sstream>

namespace fs = std::filesystem;

Clipper::Clipper(const std::string& output_dir) : output_dir_(output_dir) {
    utils::ensure_dir(output_dir_);
}

std::string Clipper::get_scale_filter() {
    if (video_ratio_ == "9:16") {
        return "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black";
    } else if (video_ratio_ == "1:1") {
        return "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=black";
    } else if (video_ratio_ == "4:5") {
        return "scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2:color=black";
    }
    // 16:9 default
    return "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black";
}

std::string Clipper::get_caption_style_filter() {
    if (caption_style_ == "neon") {
        return "fontsize=52:fontcolor=0x00FFFF:borderw=3:bordercolor=0x0088AA";
    } else if (caption_style_ == "classic") {
        return "fontsize=42:fontcolor=white:borderw=2:bordercolor=black";
    } else if (caption_style_ == "modern") {
        return "fontsize=46:fontcolor=white:borderw=1:bordercolor=0x333333";
    }
    // bold (default) - CapCut style thick text with heavy outline
    return "fontsize=56:fontcolor=white:borderw=4:bordercolor=black";
}

std::string Clipper::get_drawtext_filter(const std::string& text, double time_offset) {
    std::string escaped;
    for (char c : text) {
        if (c == '\'' || c == '"' || c == '\\' || c == ':') {
            escaped += '\\';
        }
        escaped += c;
    }

    std::string style = get_caption_style_filter();
    std::string cmd = "drawtext=" + style +
                      ":fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" +
                      ":text='" + escaped + "'" +
                      ":x=(w-text_w)/2" +
                      ":y=h-th-80" +
                      ":enable='between(t," + std::to_string(time_offset) + "," + std::to_string(time_offset + 3.0) + ")'";

    return cmd;
}

ClipResult Clipper::clip(const std::string& video_path, double start, double end, const std::string& name) {
    ClipResult result{false, "", ""};

    if (!utils::file_exists(video_path)) {
        result.error = "Source video not found";
        return result;
    }

    std::string safe_name = utils::sanitize_filename(name);
    if (safe_name.empty()) safe_name = utils::generate_id(6);

    std::string clip_path = output_dir_ + "/" + safe_name + ".mp4";

    double duration = end - start;
    if (duration <= 0) {
        result.error = "Invalid time range";
        return result;
    }

    int min_dur = Config::instance().data().min_clip_duration;
    int max_dur = Config::instance().data().max_clip_duration;
    if (duration < min_dur) {
        end = start + min_dur;
        duration = min_dur;
    }
    if (duration > max_dur) {
        end = start + max_dur;
        duration = max_dur;
    }

    int crf = Config::instance().data().clip_crf;
    std::string preset = Config::instance().data().clip_preset;
    std::string scale = get_scale_filter();

    std::string cmd = "ffmpeg -y -ss " + std::to_string(start) +
                      " -i \"" + video_path + "\"" +
                      " -t " + std::to_string(duration) +
                      " -vf \"" + scale + "\"" +
                      " -c:v libx264 -preset " + preset + " -crf " + std::to_string(crf) +
                      " -c:a aac -b:a 128k" +
                      " -movflags +faststart" +
                      " \"" + clip_path + "\" 2>/dev/null";

    utils::Logger::instance().info("Creating clip: " + safe_name + " (" +
                                   std::to_string((int)start) + "s - " +
                                   std::to_string((int)end) + "s) ratio=" + video_ratio_ + " style=" + caption_style_);

    utils::exec_cmd(cmd);

    if (utils::file_exists(clip_path)) {
        result.success = true;
        result.clip_path = clip_path;
        utils::Logger::instance().info("Clip created: " + clip_path);
    } else {
        // Fallback: try without scaling
        cmd = "ffmpeg -y -ss " + std::to_string(start) +
              " -i \"" + video_path + "\"" +
              " -t " + std::to_string(duration) +
              " -c:v libx264 -preset ultrafast -crf 28" +
              " -c:a aac -b:a 96k" +
              " \"" + clip_path + "\" 2>/dev/null";
        utils::exec_cmd(cmd);

        if (utils::file_exists(clip_path)) {
            result.success = true;
            result.clip_path = clip_path;
        } else {
            result.error = "Failed to create clip";
        }
    }

    return result;
}

std::vector<ClipResult> Clipper::clip_all(const std::string& video_path,
                                          const std::vector<std::pair<double,double>>& timestamps,
                                          const std::vector<std::string>& names) {
    std::vector<ClipResult> results;
    for (size_t i = 0; i < timestamps.size(); i++) {
        std::string name = (i < names.size()) ? names[i] : "clip_" + std::to_string(i + 1);
        results.push_back(clip(video_path, timestamps[i].first, timestamps[i].second, name));
    }
    return results;
}
