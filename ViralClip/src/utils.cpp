#include "utils.h"
#include <cstdio>
#include <memory>
#include <array>
#include <stdexcept>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <random>
#include <filesystem>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <curl/curl.h>

namespace fs = std::filesystem;

namespace utils {

std::string exec_cmd(const std::string& cmd) {
    std::array<char, 8192> buffer;
    std::string result;
    std::unique_ptr<FILE, int(*)(FILE*)> pipe(popen(cmd.c_str(), "r"), pclose);
    if (!pipe) throw std::runtime_error("popen() failed");
    while (fgets(buffer.data(), static_cast<int>(buffer.size()), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    return result;
}

std::string exec_cmd_timed(const std::string& cmd, int timeout_sec) {
    std::string timed_cmd = "timeout " + std::to_string(timeout_sec) + " " + cmd + " 2>&1";
    return exec_cmd(timed_cmd);
}

std::string get_cwd() {
    return fs::current_path().string();
}

std::string ensure_dir(const std::string& path) {
    if (!fs::exists(path)) {
        fs::create_directories(path);
    }
    return path;
}

std::string sanitize_filename(const std::string& name) {
    std::string result = name;
    std::string bad = "/\\:*?\"<>|";
    for (char& c : result) {
        if (bad.find(c) != std::string::npos) c = '_';
    }
    while (result.size() > 200) result.pop_back();
    while (!result.empty() && result.back() == ' ') result.pop_back();
    while (!result.empty() && result.front() == ' ') result.erase(result.begin());
    if (result.empty()) result = "untitled";
    return result;
}

std::string file_ext(const std::string& path) {
    auto pos = path.rfind('.');
    if (pos == std::string::npos) return "";
    return path.substr(pos);
}

std::string base_name(const std::string& path) {
    auto pos = path.find_last_of("/\\");
    if (pos == std::string::npos) return path;
    return path.substr(pos + 1);
}

std::string dir_name(const std::string& path) {
    auto pos = path.find_last_of("/\\");
    if (pos == std::string::npos) return ".";
    return path.substr(0, pos);
}

std::vector<std::string> split(const std::string& s, const std::string& delim) {
    std::vector<std::string> tokens;
    size_t start = 0, end = 0;
    while ((end = s.find(delim, start)) != std::string::npos) {
        tokens.push_back(s.substr(start, end - start));
        start = end + delim.size();
    }
    tokens.push_back(s.substr(start));
    return tokens;
}

std::string trim(const std::string& s) {
    auto start = s.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    auto end = s.find_last_not_of(" \t\n\r");
    return s.substr(start, end - start + 1);
}

std::string to_lower(const std::string& s) {
    std::string result = s;
    std::transform(result.begin(), result.end(), result.begin(), ::tolower);
    return result;
}

bool file_exists(const std::string& path) {
    return fs::exists(path);
}

uint64_t file_size(const std::string& path) {
    if (!fs::exists(path)) return 0;
    return fs::file_size(path);
}

std::string read_file(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) return "";
    std::stringstream ss;
    ss << f.rdbuf();
    return ss.str();
}

void write_file(const std::string& path, const std::string& content) {
    std::ofstream f(path);
    f << content;
}

std::string generate_id(size_t len) {
    static const char alphanum[] = "0123456789abcdef";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, 15);
    std::string result;
    result.reserve(len);
    for (size_t i = 0; i < len; i++) {
        result += alphanum[dist(gen)];
    }
    return result;
}

std::string timestamp_now() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    std::tm tm_val;
    localtime_r(&time, &tm_val);
    char buf[64];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tm_val);
    return std::string(buf);
}

std::string format_duration(double seconds) {
    int h = static_cast<int>(seconds) / 3600;
    int m = (static_cast<int>(seconds) % 3600) / 60;
    int s = static_cast<int>(seconds) % 60;
    if (h > 0) {
        return std::to_string(h) + ":" + (m < 10 ? "0" : "") + std::to_string(m) +
               ":" + (s < 10 ? "0" : "") + std::to_string(s);
    }
    return std::to_string(m) + ":" + (s < 10 ? "0" : "") + std::to_string(s);
}

std::string escape_json_string(const std::string& s) {
    std::string result;
    result.reserve(s.size() + 10);
    for (char c : s) {
        switch (c) {
            case '"':  result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\n': result += "\\n"; break;
            case '\r': result += "\\r"; break;
            case '\t': result += "\\t"; break;
            default:   result += c; break;
        }
    }
    return result;
}

std::string url_encode(const std::string& s) {
    CURL* curl = curl_easy_init();
    if (!curl) return s;
    char* encoded = curl_easy_escape(curl, s.c_str(), static_cast<int>(s.size()));
    std::string result(encoded ? encoded : s);
    if (encoded) curl_free(encoded);
    curl_easy_cleanup(curl);
    return result;
}

Logger& Logger::instance() {
    static Logger inst;
    return inst;
}

void Logger::info(const std::string& msg) {
    if (level_ > 0) return;
    std::lock_guard<std::mutex> lock(mtx_);
    std::cout << "[" << timestamp_now() << "] [INFO]  " << msg << std::endl;
}

void Logger::error(const std::string& msg) {
    std::lock_guard<std::mutex> lock(mtx_);
    std::cerr << "[" << timestamp_now() << "] [ERROR] " << msg << std::endl;
}

void Logger::warn(const std::string& msg) {
    if (level_ > 1) return;
    std::lock_guard<std::mutex> lock(mtx_);
    std::cerr << "[" << timestamp_now() << "] [WARN]  " << msg << std::endl;
}

void ProgressTracker::update(const std::string& label, int percent, const std::string& detail) {
    std::lock_guard<std::mutex> lock(mtx_);
    if (callback_) {
        callback_({label, percent, detail});
    }
}

} // namespace utils
