import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationSettings } from "../types/settings";

const REMINDER_CHANNEL_ID = "daily-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

type ReminderSyncResult = "scheduled" | "disabled" | "permission_denied" | "skipped_web";

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Daily Reminder",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null
  });
}

async function ensurePermission(requestIfNeeded: boolean): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  if (!requestIfNeeded) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function syncDailyReminder(
  settings: NotificationSettings,
  requestPermissionIfNeeded: boolean
): Promise<ReminderSyncResult> {
  if (Platform.OS === "web") {
    return "skipped_web";
  }

  if (!settings.reminderEnabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return "disabled";
  }

  const parsed = parseTime(settings.reminderTime);
  if (!parsed) {
    return "permission_denied";
  }

  const permissionGranted = await ensurePermission(requestPermissionIfNeeded);
  if (!permissionGranted) {
    return "permission_denied";
  }

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ちいさな肯定",
      body: "1分だけ、今の状態を残しますか"
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined
    }
  });

  return "scheduled";
}
