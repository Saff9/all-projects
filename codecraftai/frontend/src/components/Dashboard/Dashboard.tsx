import CostOverview from "./CostOverview";
import UsageChart from "./UsageChart";
import BudgetAlert from "./BudgetAlert";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-1 sm:p-2">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">Analytics & Cost Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-sans">Track real-time token usage, cost breakdowns, and budget alerts across all AI models.</p>
      </div>
      <CostOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <UsageChart />
        <BudgetAlert />
      </div>
    </div>
  );
}
