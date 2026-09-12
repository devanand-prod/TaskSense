import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Schedules a local notification for task.reminderDate. Returns the notification id, or null. */
export async function scheduleTaskNotification(task) {
  if (!task.reminderDate) return null;
  const trigger = new Date(task.reminderDate);
  if (trigger.getTime() <= Date.now()) return null;

  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: task.title,
      body: `${task.category} · reminder`,
      sound: true,
      data: { taskId: task.id },
    },
    trigger,
  });
}

export async function cancelTaskNotification(task) {
  if (!task?.notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(task.notificationId);
  } catch {}
}
