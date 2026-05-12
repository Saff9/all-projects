// src/components/ImportantLinks.tsx

const LINKS = [
  {
    label: "JEE Main Official Portal",
    url: "https://jeemain.nta.ac.in",
    desc: "Download admit card, check results",
    icon: "🏛️",
    badge: "Official",
  },
  {
    label: "NTA Official Website",
    url: "https://nta.ac.in",
    desc: "National Testing Agency",
    icon: "🎓",
    badge: "Official",
  },
  {
    label: "NTA Results Portal",
    url: "https://ntaresults.nic.in",
    desc: "Check JEE scores and ranks",
    icon: "📊",
    badge: "Official",
  },
  {
    label: "NDTV Education",
    url: "https://www.ndtv.com/education",
    desc: "JEE news & exam updates",
    icon: "📰",
    badge: "News",
  },
  {
    label: "Shiksha JEE Page",
    url: "https://www.shiksha.com/engineering/jee-main",
    desc: "Counselling & college info",
    icon: "📚",
    badge: "Resource",
  },
  {
    label: "Careers360 JEE",
    url: "https://engineering.careers360.com/articles/jee-main",
    desc: "Detailed JEE preparation guide",
    icon: "🔖",
    badge: "Resource",
  },
];

const BADGE_COLORS: Record<string, string> = {
  Official: "bg-green-100 text-green-800",
  News: "bg-blue-100 text-blue-800",
  Resource: "bg-purple-100 text-purple-800",
};

export default function ImportantLinks() {
  return (
    <section id="links" className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-7 bg-[#f7941d] rounded-full" />
        <h2 className="font-heading font-bold text-xl text-[#003580]">Important Links</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINKS.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border border-nta-border p-4 card-hover flex items-start gap-3"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-semibold text-sm text-[#003580]">{link.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-heading ${BADGE_COLORS[link.badge]}`}>
                  {link.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-sans">{link.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
