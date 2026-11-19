export function budgetProgress(budget: number, spent: number) {
  const validBudget = Number.isFinite(budget) && budget > 0;
  const safeSpent = Number.isFinite(spent) ? Math.max(0, spent) : 0;
  const calculated = validBudget ? safeSpent / budget * 100 : 0;
  const percentage = Number.isFinite(calculated) ? calculated : 0;
  return {
    percentage,
    progress: Math.min(100, Math.max(0, percentage)),
    overspent: validBudget && safeSpent > budget,
  };
}
