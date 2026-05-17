export function computeProgress(uom: string, target: number | Date, actual: number | Date): number {
  if (!actual) return 0;
  
  switch (uom) {
    case 'numeric_min':  // Higher is better (e.g., revenue)
      return Math.min((actual as number) / (target as number), 1) * 100;

    case 'numeric_max':  // Lower is better (e.g., TAT, cost)
      return Math.min((target as number) / (actual as number), 1) * 100;

    case 'timeline': {   // Date-based completion
      const deadline = new Date(target as Date).getTime();
      const completion = new Date(actual as Date).getTime();
      return completion <= deadline ? 100 : 0;
    }

    case 'zero':         // Zero = 100% success
      return (actual as number) === 0 ? 100 : 0;
      
    default:
      return 0;
  }
}

export function getActiveQuarter(): string | null {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 7 && month <= 9)   return 'Q1';   // July-Sept
  if (month >= 10 && month <= 12) return 'Q2';   // Oct-Dec
  if (month >= 1 && month <= 3)   return 'Q3';   // Jan-Mar
  if (month >= 3 && month <= 5)   return 'Q4';   // Mar-May
  return null;
}
