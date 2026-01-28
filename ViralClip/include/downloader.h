#pragma once
#include <string>
#include <functional>

struct DownloadResult {
    bool success;
    std::string video_path;
    std::string audio_path;
    std::string title;
    std::string thumbnail;
    std::string duration;
    std::string error;
};

class Downloader {
public:
    explicit Downloader(const std::string& output_dir);
    DownloadResult download(const std::string& url);
    void set_progress_cb(std::function<void(const std::string&)> cb) { progress_cb_ = cb; }
    void set_cookies(const std::string& browser, const std::string& file) {
        cookies_from_browser_ = browser;
        cookies_file_ = file;
    }
private:
    std::string output_dir_;
    std::string cookies_from_browser_;
    std::string cookies_file_;
    std::function<void(const std::string&)> progress_cb_;
};
