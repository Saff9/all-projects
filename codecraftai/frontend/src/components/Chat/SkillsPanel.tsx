import { useSkillsStore } from "../../store/skillsStore";
import { Globe, Terminal, Heart, Code, CheckCircle2, XCircle } from "lucide-react";

export default function SkillsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { skills, toggleSkill } = useSkillsStore();

  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case "Globe": return <Globe size={20} className="text-blue-500" />;
      case "Terminal": return <Terminal size={20} className="text-purple-500" />;
      case "Heart": return <Heart size={20} className="text-emerald-500" />;
      case "Code": return <Code size={20} className="text-amber-500" />;
      default: return <Terminal size={20} />;
    }
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 font-mono">
              ⚡ Agent Skills Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle autonomous agentic workflows and background tool execution.</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              className={`p-4 rounded-2xl border transition duration-200 cursor-pointer flex items-start gap-4 ${
                skill.enabled
                  ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-950/40 border-gray-200/60 dark:border-gray-800/60 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-md border border-gray-100 dark:border-gray-700">
                {getIcon(skill.iconName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{skill.name}</span>
                  {skill.enabled ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                      <XCircle size={12} /> DISABLED
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">{skill.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-center text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          💡 Active skills automatically intercept your prompts to inject rich AST, Web, and Reflection context.
        </div>
      </div>
    </div>
  );
}
