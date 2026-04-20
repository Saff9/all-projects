import { useCostTracker } from "../../hooks/useCostTracker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function UsageChart() {
  const { usageLog } = useCostTracker();
  
  // Aggregate costs by date
  const aggregated: Record<string, number> = {};
  usageLog.forEach((log) => {
    aggregated[log.date] = (aggregated[log.date] || 0) + log.cost;
  });

  const data = Object.keys(aggregated).map((date) => ({
    date,
    cost: Number(aggregated[date].toFixed(4)),
  }));

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2">
      <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white">Daily Spending Trend</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          No usage data available yet. Start generating AI content!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                borderColor: '#374151', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }} 
              formatter={(val: number) => [`$${val}`, 'Cost']} 
            />
            <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
