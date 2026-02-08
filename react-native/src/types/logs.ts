export type MoodPolarity = "low" | "high" | null;

export type MoodLog = {
  id: string;
  date: string;
  moodLevel: number;
  polarity: MoodPolarity;
  note: string;
  createdAt: string;
};

export type WinLog = {
  id: string;
  date: string;
  tags: string[];
  note: string;
  createdAt: string;
};

export type SosLog = {
  id: string;
  date: string;
  hydrationDone: boolean;
  breathingDone: boolean;
  restDone: boolean;
  createdAt: string;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

export function dateKeyFromOffset(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toDateKey(date);
}

export function nowIsoString(): string {
  return new Date().toISOString();
}
