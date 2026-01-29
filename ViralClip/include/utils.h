#pragma once
#include <string>
#include <vector>
#include <mutex>
#include <functional>
#include <atomic>
#include <map>
#include <ctime>

namespace utils {

std::string exec_cmd(const std::string& cmd);
std::string exec_cmd_timed(const std::string& cmd, int timeout_sec);
std::string get_cwd();
std::string ensure_dir(const std::string& path);
std::string sanitize_filename(const std::string& name);
std::string file_ext(const std::string& path);
std::string base_name(const std::string& path);
std::string dir_name(const std::string& path);
std::vector<std::string> split(const std::string& s, const std::string& delim);
std::string trim(const std::string& s);
std::string to_lower(const std::string& s);
bool file_exists(const std::string& path);
uint64_t file_size(const std::string& path);
std::string read_file(const std::string& path);
void write_file(const std::string& path, const std::string& content);
std::string generate_id(size_t len = 12);
std::string timestamp_now();
std::string format_duration(double seconds);
std::string escape_json_string(const std::string& s);
std::string url_encode(const std::string& s);

class Logger {
public:
    static Logger& instance();
    void info(const std::string& msg);
    void error(const std::string& msg);
    void warn(const std::string& msg);
    void set_level(int level) { level_ = level; }
private:
    Logger() : level_(0) {}
    std::mutex mtx_;
    int level_;
};

class ProgressTracker {
public:
    struct Step {
        std::string label;
        int percent;
        std::string detail;
    };

    using Callback = std::function<void(const Step&)>;

    ProgressTracker() = default;
    ProgressTracker(const ProgressTracker&) {}
    ProgressTracker& operator=(const ProgressTracker&) { return *this; }
    ProgressTracker(ProgressTracker&&) noexcept {}
    ProgressTracker& operator=(ProgressTracker&&) noexcept { return *this; }

    void set_callback(Callback cb) { callback_ = cb; }
    void update(const std::string& label, int percent, const std::string& detail = "");
    bool is_cancelled() const { return cancelled_; }
    void cancel() { cancelled_ = true; }
    void reset() { cancelled_ = false; }
private:
    Callback callback_;
    std::atomic<bool> cancelled_{false};
    std::mutex mtx_;
};

} // namespace utils
