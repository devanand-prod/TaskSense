import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHEETS_API_URL, STORAGE_KEYS, USER_ID } from '../constants';

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeCache(tasks) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {}
}

export async function fetchTasks() {
  try {
    const res = await fetch(
      `${SHEETS_API_URL}?action=getTasks&userId=${USER_ID}`
    );
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    const tasks = data.tasks || [];
    await writeCache(tasks);
    return tasks;
  } catch {
    return readCache();
  }
}

export async function addTask(task) {
  const cached = await readCache();
  const updated = [...cached, task];
  await writeCache(updated);
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addTask', task, userId: USER_ID }),
    });
  } catch {}
  return task;
}

export async function updateTask(task) {
  const cached = await readCache();
  const updated = cached.map(t => (t.id === task.id ? task : t));
  await writeCache(updated);
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateTask', task, userId: USER_ID }),
    });
  } catch {}
  return task;
}

export async function deleteTask(id) {
  const cached = await readCache();
  const updated = cached.filter(t => t.id !== id);
  await writeCache(updated);
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteTask', id, userId: USER_ID }),
    });
  } catch {}
}

export async function toggleTaskDone(id) {
  const cached = await readCache();
  const task = cached.find(t => t.id === id);
  if (!task) return null;
  return updateTask({ ...task, done: !task.done });
}
