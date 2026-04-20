import { useCostTracker } from "../../hooks/useCostTracker";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

export default function CostOverview() {
  const { formattedTotal, dailyCost, budgetLimit } = useCostTracker();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{formattedTotal}</p>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today's Spend</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">${dailyCost.toFixed(4)}</p>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 flex items-center justify-center">
          <Calendar size={24} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Budget</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">${budgetLimit}.00</p>
        </div>
      </div>
    </div>
  );
}
