// Loads the programme once and shares it between the Calendar, Favourites and
// event detail screens, so a star tapped on one screen shows up on the others.
//
//   const { events, failed, reload, toggleFavorite } = useEvents();
//
// Favourites are updated optimistically: the star changes at once, and goes back
// if the API call fails.
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addFavorite, getEvents, removeFavorite, type Event } from "@/api/endpoints";

type EventsContextValue = {
  /** All events in chronological order, or null until the first load succeeds. */
  events: Event[] | null;
  /** True when the last load failed. */
  failed: boolean;
  /** True while a reload triggered by pull-to-refresh is running. */
  refreshing: boolean;
  reload: () => Promise<void>;
  toggleFavorite: (eventId: number) => Promise<void>;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function useEvents(): EventsContextValue {
  const value = use(EventsContext);
  if (!value) throw new Error("useEvents must be used inside <EventsProvider>");
  return value;
}

function setFavorite(events: Event[], eventId: number, isFavorite: boolean): Event[] {
  return events.map((e) => (e.id === eventId ? { ...e, isFavorite } : e));
}

/**
 * `userId` is the logged-in user (null when logged out): the programme is loaded
 * at login, and forgotten at logout, since favourites belong to one user.
 */
export function EventsProvider({ userId, children }: { userId: number | null; children: ReactNode }) {
  // Each result remembers which user it was loaded for, so after a logout or a
  // change of user the old programme (and its favourites) is ignored, never shown.
  const [loaded, setLoaded] = useState<{ userId: number; events: Event[] } | null>(null);
  const [failedFor, setFailedFor] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const events = userId !== null && loaded?.userId === userId ? loaded.events : null;
  const failed = userId !== null && failedFor === userId;

  // First load, at login.
  useEffect(() => {
    if (userId === null) return;
    let cancelled = false; // ignore the answer if the user logged out meanwhile
    getEvents().then(
      (list) => !cancelled && setLoaded({ userId, events: list }),
      () => !cancelled && setFailedFor(userId),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // "Retry" and pull-to-refresh.
  const reload = useCallback(async () => {
    if (userId === null) return;
    setRefreshing(true);
    try {
      setLoaded({ userId, events: await getEvents() });
      setFailedFor(null);
    } catch {
      setFailedFor(userId);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const toggleFavorite = useCallback(
    async (eventId: number) => {
      const wasFavorite = events?.find((e) => e.id === eventId)?.isFavorite ?? false;
      const apply = (isFavorite: boolean) =>
        setLoaded((current) => current && { ...current, events: setFavorite(current.events, eventId, isFavorite) });

      apply(!wasFavorite);
      try {
        await (wasFavorite ? removeFavorite(eventId) : addFavorite(eventId));
      } catch {
        apply(wasFavorite);
      }
    },
    [events],
  );

  const value = useMemo(
    () => ({ events, failed, refreshing, reload, toggleFavorite }),
    [events, failed, refreshing, reload, toggleFavorite],
  );
  return <EventsContext value={value}>{children}</EventsContext>;
}
