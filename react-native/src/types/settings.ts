export type NotificationSettings = {
  reminderEnabled: boolean;
  reminderTime: string;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  reminderEnabled: true,
  reminderTime: "20:00"
};
