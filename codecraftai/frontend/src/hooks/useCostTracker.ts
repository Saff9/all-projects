import { useCostStore } from "../store/costStore";
import { formatCost } from "../utils/formatCost";

export function useCostTracker() {
  const { totalCost, budgetLimit, usageLog, addCost, setBudgetLimit, clearHistory } = useCostStore();
  const formattedTotal = formatCost(totalCost);
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyCost = usageLog.reduce((acc, log) => {
    return log.date === todayStr ? acc + log.cost : acc;
  }, 0);
  
  return { 
    totalCost, 
    formattedTotal, 
    budgetLimit, 
    usageLog, 
    addCost, 
    dailyCost, 
    setBudgetLimit, 
    clearHistory 
  };
}
