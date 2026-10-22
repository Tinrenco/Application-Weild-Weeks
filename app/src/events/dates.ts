// Date helpers for the calendar. Everything is in the phone's local time.
//
// A "day key" is a "YYYY-MM-DD" string: easy to compare, sort and use as a React key.
// An event belongs to the day it starts (a party from 23h to 3h is on the first day).
import type { Event } from "@/api/endpoints";
import type { Translations } from "@/i18n/fr";

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inverse of dayKey: midnight, local time. */
export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

/** "mercredi 2 septembre" */
export function formatDayLong(t: Translations, key: string): string {
  const date = dateFromKey(key);
  return `${t.dates.weekdays[date.getDay()]} ${date.getDate()} ${t.dates.months[date.getMonth()]}`;
}

/** "16h45" */
export function formatTime(t: Translations, iso: string): string {
  const date = new Date(iso);
  return t.dates.time(date.getHours(), date.getMinutes());
}

/** "mercredi 2 septembre, 16h" */
export function formatDayAndTime(t: Translations, iso: string): string {
  return `${formatDayLong(t, dayKey(new Date(iso)))}, ${formatTime(t, iso)}`;
}

/** Groups events (already sorted) by day, keeping their order. */
export function groupByDay(events: Event[]): [string, Event[]][] {
  const groups = new Map<string, Event[]>();
  for (const event of events) {
    const key = dayKey(new Date(event.startsAt));
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups];
}

/**
 * Every day from the Monday before `first` to the Sunday after `last`,
 * so the calendar grid is made of full weeks.
 */
export function fullWeeksBetween(first: string, last: string): string[] {
  const start = dateFromKey(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // back to Monday
  const end = dateFromKey(last);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7)); // forward to Sunday

  const days: string[] = [];
  for (const d = start; d <= end; d.setDate(d.getDate() + 1)) {
    days.push(dayKey(d));
  }
  return days;
}
