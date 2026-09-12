import * as chrono from 'chrono-node';
import { inferCat } from './taskUtils';

const REMINDER_PREFIXES = [
  /^remind me (to |about |that )?/i,
  /^reminder (to |about |for )?/i,
  /^set a reminder (to |about |for )?/i,
  /^don'?t forget (to |about )?/i,
];

const REMINDER_WORD = /\bremind(er)?\b/i;

function stripReminderPrefix(text) {
  for (const pattern of REMINDER_PREFIXES) {
    if (pattern.test(text)) return text.replace(pattern, '').trim();
  }
  return text;
}

function cleanTitle(text) {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.\-–]+|[\s,.\-–]+$/g, '')
    .trim();
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDateLabel(date, now = new Date()) {
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatReminderLabel(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Turns free text like "remind me about vitamins check on Wednesday next week"
 * into a structured task: a cleaned-up title, an inferred category, a resolved
 * calendar date, and whether/when a reminder notification should fire.
 */
export function parseTaskInput(rawText, now = new Date()) {
  const text = rawText.trim();
  const results = chrono.parse(text, now, { forwardDate: true });
  const match = results[0] || null;

  let withoutDate = text;
  let date = null;
  let timeCertain = false;

  if (match) {
    withoutDate = text.slice(0, match.index) + text.slice(match.index + match.text.length);
    date = match.start.date();
    timeCertain = match.start.isCertain('hour');
  }

  let title = cleanTitle(stripReminderPrefix(withoutDate));
  if (!title) title = cleanTitle(stripReminderPrefix(text)) || text;

  const dateFound = !!date;
  if (date && !timeCertain) {
    const sameDay = startOfDay(date).getTime() === startOfDay(now).getTime();
    date.setHours(sameDay ? 18 : 9, 0, 0, 0);
  }
  if (!date) {
    date = new Date(now);
    date.setHours(18, 0, 0, 0);
  }

  const when = startOfDay(date).getTime() <= startOfDay(now).getTime() ? 'today' : 'upcoming';
  const category = inferCat(title);
  const hasReminder = dateFound || REMINDER_WORD.test(text);

  return {
    title,
    category,
    date,
    dateISO: date.toISOString(),
    dateLabel: formatDateLabel(date, now),
    when,
    hasReminder,
    reminderDate: hasReminder ? date : null,
    reminderLabel: hasReminder ? formatReminderLabel(date) : null,
  };
}

const PRESET_HOURS = {
  Today: 18,
  Tomorrow: 9,
  'This week': 18,
  'Next week': 9,
  Weekend: 10,
};

/** Resolves a quick-pick date chip (Today/Tomorrow/...) to a real calendar date. */
export function resolvePresetDate(preset, now = new Date()) {
  const date = new Date(now);
  switch (preset) {
    case 'Today':
      break;
    case 'Tomorrow':
      date.setDate(date.getDate() + 1);
      break;
    case 'This week': {
      // Upcoming Friday (or today, if today already is Friday).
      const day = date.getDay();
      const add = (5 - day + 7) % 7;
      date.setDate(date.getDate() + add);
      break;
    }
    case 'Next week': {
      const day = date.getDay();
      const daysToNextMonday = ((1 - day + 7) % 7) || 7;
      date.setDate(date.getDate() + daysToNextMonday);
      break;
    }
    case 'Weekend': {
      const day = date.getDay();
      const add = ((6 - day) + 7) % 7;
      date.setDate(date.getDate() + add);
      break;
    }
    default:
      break;
  }
  date.setHours(PRESET_HOURS[preset] ?? 9, 0, 0, 0);
  const when = startOfDay(date).getTime() <= startOfDay(now).getTime() ? 'today' : 'upcoming';
  return {
    date,
    dateISO: date.toISOString(),
    dateLabel: preset === 'Today' || preset === 'Tomorrow' ? preset : formatDateLabel(date, now),
    when,
    reminderLabel: formatReminderLabel(date),
  };
}
