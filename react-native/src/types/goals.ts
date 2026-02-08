export type WeeklyGoal = {
  id: string;
  weekStart: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export function getWeekStartKey(date: Date): string {
  const cloned = new Date(date);
  cloned.setHours(0, 0, 0, 0);
  const day = cloned.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  cloned.setDate(cloned.getDate() + diff);

  const year = cloned.getFullYear();
  const month = String(cloned.getMonth() + 1).padStart(2, "0");
  const datePart = String(cloned.getDate()).padStart(2, "0");
  return `${year}-${month}-${datePart}`;
}
