import { useCostTracker } from "../../hooks/useCostTracker";
import { formatCost } from "../../utils/formatCost";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function BudgetAlert() {
  const { totalCost, budgetLimit, setBudgetLimit, clearHistory } = useCostTracker();
  const exceeded = totalCost > budgetLimit;

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition ${
      exceeded 
        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900" 
        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
    }`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {exceeded && <AlertTriangle className="text-red-500" size={20} />}
            Budget Management
          </h3>
          <button 
            onClick={clearHistory} 
            title="Reset Usage History"
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Monthly Budget Limit</span>
              <span className="font-bold text-gray-900 dark:text-white">${budgetLimit}.00</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Current Spend</span>
            <span className={`font-bold ${exceeded ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              {formatCost(totalCost)} / ${budgetLimit}
            </span>
          </div>
        </div>
      </div>

      {exceeded && (
        <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Warning: You have exceeded your configured monthly budget limit!</span>
        </div>
      )}
    </div>
  );
}
