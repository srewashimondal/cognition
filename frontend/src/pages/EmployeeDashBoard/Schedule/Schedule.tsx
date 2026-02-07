import { useEffect, useMemo, useState } from "react";
import "./Schedule.css";

type View = "monthly" | "weekly" | "daily";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (local)
  start?: string; 
  end?: string;   
  color?: "red" | "yellow" | "purple" | "green" | "blue";
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildMonthGrid(currentMonth: Date) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay()); 

  const gridEnd = new Date(end);
  gridEnd.setDate(end.getDate() + (6 - end.getDay())); 

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // chunk into weeks of 7
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

const STORAGE_KEY = "cognition_schedule_events_v1";

export default function Schedule() {
  const [view, setView] = useState<View>("monthly");
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => toYMD(new Date()));

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [draft, setDraft] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: toYMD(new Date()),
    start: "10:00",
    end: "11:00",
    color: "red",
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CalendarEvent[];
      setEvents(parsed);
    } catch {

    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const weeks = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const arr = map.get(ev.date) ?? [];
      arr.push(ev);
      map.set(ev.date, arr);
    }

    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
      map.set(k, arr);
    }
    return map;
  }, [events]);

  function openAddEvent(date?: string) {
    const d = date ?? selectedDate ?? toYMD(new Date());
    setDraft((prev) => ({ ...prev, date: d }));
    setIsModalOpen(true);
  }

  function addEvent() {
    if (!draft.title.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...draft,
        title: draft.title.trim(),
      },
    ]);
    setIsModalOpen(false);
    setDraft((prev) => ({ ...prev, title: "" }));
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const monthLabel = currentMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="schedule-page">
      {/* Top bar */}
      <div className="schedule-top">
        <div className="schedule-title">Calendar</div>

        <div className="schedule-tabs">
          <button className={view === "monthly" ? "tab active" : "tab"} onClick={() => setView("monthly")}>
            Monthly
          </button>
          <button className={view === "weekly" ? "tab active" : "tab"} onClick={() => setView("weekly")}>
            Weekly
          </button>
          <button className={view === "daily" ? "tab active" : "tab"} onClick={() => setView("daily")}>
            Daily
          </button>
        </div>

        <div className="schedule-actions">
          <button className="ghost-btn">Filter</button>
          <button className="primary-btn" onClick={() => openAddEvent()}>
            + Add Event
          </button>
        </div>
      </div>

      {/* Month controls */}
      <div className="month-row">
        <div className="month-left">
          <div className="month-label">{monthLabel}</div>
          <div className="month-nav">
            <button className="icon-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
              ‹
            </button>
            <button className="today-btn" onClick={() => setCurrentMonth(startOfMonth(new Date()))}>
              Today
            </button>
            <button className="icon-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid (monthly) */}
      {view === "monthly" && (
        <div className="calendar">
          <div className="calendar-head">
            {weekdays.map((d) => (
              <div key={d} className="weekday">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar-body">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="week-row">
                {week.map((day) => {
                  const ymd = toYMD(day);
                  const inMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = ymd === toYMD(new Date());
                  const isSelected = ymd === selectedDate;

                  const dayEvents = eventsByDate.get(ymd) ?? [];

                  return (
                    <div
                      key={ymd}
                      className={[
                        "day-cell",
                        inMonth ? "" : "muted",
                        isSelected ? "selected" : "",
                      ].join(" ")}
                      onClick={() => setSelectedDate(ymd)}
                      onDoubleClick={() => openAddEvent(ymd)}
                    >
                      <div className="day-top">
                        <span className={["day-num", isToday ? "today" : ""].join(" ")}>
                          {day.getDate()}
                        </span>
                      </div>

                      <div className="events">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div key={ev.id} className={`event-pill ${ev.color ?? "red"}`}>
                            <span className="event-title">
                              {ev.title}
                              {ev.start && ev.end ? `  ${ev.start} - ${ev.end}` : ""}
                            </span>
                            <button
                              className="event-x"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(ev.id);
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {dayEvents.length > 3 && (
                          <div className="more">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add Event</div>

            <label className="field">
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="Design Review"
              />
            </label>

            <div className="row">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
                />
              </label>

              <label className="field">
                <span>Color</span>
                <select
                  value={draft.color}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, color: e.target.value as CalendarEvent["color"] }))
                  }
                >
                  <option value="red">Design Review</option>
                  <option value="yellow">Meeting</option>
                  <option value="purple">Discussion</option>
                  <option value="green">Research</option>
                  <option value="blue">Other</option>
                </select>
              </label>
            </div>

            <div className="row">
              <label className="field">
                <span>Start</span>
                <input
                  type="time"
                  value={draft.start ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, start: e.target.value }))}
                />
              </label>

              <label className="field">
                <span>End</span>
                <input
                  type="time"
                  value={draft.end ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, end: e.target.value }))}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={addEvent}>
                Add
              </button>
            </div>

            <div className="hint">
              Tip: double-click a day to add an event quickly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
