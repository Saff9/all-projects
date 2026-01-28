#pragma once
#include <string>
#include <vector>

struct ClipResult {
    bool success;
    std::string clip_path;
    std::string error;
};

struct CaptionSegment {
    double start;
    double end;
    std::string text;
};

class Clipper {
public:
    explicit Clipper(const std::string& output_dir);
    void set_video_ratio(const std::string& ratio) { video_ratio_ = ratio; }
    void set_caption_style(const std::string& style) { caption_style_ = style; }
    ClipResult clip(const std::string& video_path, double start, double end, const std::string& name);
    std::vector<ClipResult> clip_all(const std::string& video_path,
                                     const std::vector<std::pair<double,double>>& timestamps,
                                     const std::vector<std::string>& names);
private:
    std::string output_dir_;
    std::string video_ratio_ = "16:9";
    std::string caption_style_ = "bold";

    std::string get_scale_filter();
    std::string get_drawtext_filter(const std::string& text, double time_offset);
    std::string get_caption_style_filter();
};
