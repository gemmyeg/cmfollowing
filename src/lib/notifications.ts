import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import { dueInfo, itemName } from '@/lib/maintenance';
import type { Car, MaintenanceItem } from '@/lib/types';

const CHANNEL_ID = 'maintenance';
const ENABLED_KEY = 'notificationsEnabled';
/** iOS keeps at most 64 pending notifications; leave room for the weekly reminder. */
const MAX_SCHEDULED = 60;
/** Reminders go out at this time of day. */
const HOUR = 10;
/** "Due soon" heads-up this many days before the predicted date. */
const HEADS_UP_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function notificationsEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) !== 'false';
}

export async function setNotificationsEnabled(enabled: boolean) {
  await AsyncStorage.setItem(ENABLED_KEY, String(enabled));
  if (!enabled) await Notifications.cancelAllScheduledNotificationsAsync();
}

async function ensurePermission(t: TFunction): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: t('notifications.channel'),
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** The given day at HOUR o'clock, or tomorrow at HOUR if that time has already passed. */
function atReminderHour(ts: number, now: number): number {
  const d = new Date(ts);
  d.setHours(HOUR, 0, 0, 0);
  if (d.getTime() > now) return d.getTime();
  const tomorrow = new Date(now + DAY_MS);
  tomorrow.setHours(HOUR, 0, 0, 0);
  return tomorrow.getTime();
}

/** daily: repeat every morning until the reminders are rescheduled (after a service). */
type Planned = { at: number; title: string; body: string; carId: string; daily?: boolean };

/** Works out every reminder to send for these cars, soonest first. */
export function planReminders(
  cars: Car[],
  itemsByCar: Record<string, MaintenanceItem[]>,
  t: TFunction,
  now = Date.now(),
): Planned[] {
  const planned: Planned[] = [];
  for (const car of cars) {
    const carName = `${car.make} ${car.model} (${car.plate})`;
    for (const item of itemsByCar[car.id] ?? []) {
      const due = dueInfo(item, car, now);
      if (due.predictedAt == null) continue;
      const name = itemName(item, t);

      if (due.status === 'overdue') {
        planned.push({
          at: atReminderHour(now, now),
          title: t('notifications.overdueTitle', { item: name }),
          body: t('notifications.overdueBody', { car: carName }),
          carId: car.id,
          daily: true,
        });
        continue;
      }
      const headsUp = due.predictedAt - HEADS_UP_DAYS * DAY_MS;
      if (headsUp > now) {
        planned.push({
          at: atReminderHour(headsUp, now),
          title: t('notifications.soonTitle', { item: name }),
          body: t('notifications.soonBody', { car: carName, days: HEADS_UP_DAYS }),
          carId: car.id,
        });
      }
      planned.push({
        at: atReminderHour(due.predictedAt, now),
        title: t('notifications.dueTitle', { item: name }),
        body: t('notifications.dueBody', { car: carName }),
        carId: car.id,
      });
    }
  }
  return planned.sort((a, b) => a.at - b.at);
}

/**
 * Replaces every scheduled reminder with a fresh set. Called whenever the cars or
 * their items change, so the reminders always match the latest km and services.
 */
export async function rescheduleReminders(
  cars: Car[],
  itemsByCar: Record<string, MaintenanceItem[]>,
  t: TFunction,
) {
  if (!(await notificationsEnabled())) return;
  if (!(await ensurePermission(t))) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = planReminders(cars, itemsByCar, t);

  for (const r of reminders.slice(0, MAX_SCHEDULED)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body, data: { carId: r.carId } },
      trigger: r.daily
        ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: HOUR, minute: 0, channelId: CHANNEL_ID }
        : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
    });
  }

  if (cars.length > 0) {
    // Every Friday morning: a nudge to photograph the odometer so predictions stay accurate.
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications.kmTitle'), body: t('notifications.kmBody') },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 6,
        hour: HOUR,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }
}

/** Opens the car when a reminder is tapped. Returns an unsubscribe function. */
export function listenForTaps(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const carId = response.notification.request.content.data?.carId;
    if (typeof carId === 'string') router.push({ pathname: '/cars/[id]', params: { id: carId } });
  });
  return () => sub.remove();
}
