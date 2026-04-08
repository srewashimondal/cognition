import { useEffect, useMemo, useRef, useState } from "react";
import "./Schedule.css";
import ActionButton from "../../../components/ActionButton/ActionButton";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthProvider";
import edit_icon from '../../../assets/icons/simulations/grey-edit-icon.svg';
import check_icon from '../../../assets/icons/simulations/grey-check-icon.svg';
import trash_icon from '../../../assets/icons/simulations/grey-trash-icon.svg';
import x_icon from '../../../assets/icons/simulations/grey-x-icon.svg';

type View = "monthly" | "weekly" | "daily";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (local)
  start?: string; 
  end?: string;   
  color?: "red" | "yellow" | "purple" | "green" | "blue";
  description?: string;
  completed?: boolean;
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

function docToEvent(id: string, data: DocumentData): CalendarEvent {
  return {
    id,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    start: data.start != null && data.start !== "" ? String(data.start) : undefined,
    end: data.end != null && data.end !== "" ? String(data.end) : undefined,
    color: (data.color as CalendarEvent["color"]) ?? "red",
    description: data.description != null ? String(data.description) : undefined,
    completed: Boolean(data.completed),
  };
}

function firestorePayloadFromEvent(ev: CalendarEvent): Record<string, unknown> {
  return {
    title: ev.title,
    date: ev.date,
    start: ev.start ?? null,
    end: ev.end ?? null,
    color: ev.color ?? "red",
    description: ev.description ?? null,
    completed: ev.completed ?? false,
    updatedAt: serverTimestamp(),
  };
}

function cleanFirestoreUpdate(updates: Partial<CalendarEvent>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (updates.title !== undefined) out.title = updates.title;
  if (updates.date !== undefined) out.date = updates.date;
  if (updates.start !== undefined) out.start = updates.start || null;
  if (updates.end !== undefined) out.end = updates.end || null;
  if (updates.color !== undefined) out.color = updates.color;
  if (updates.description !== undefined) out.description = updates.description || null;
  if (updates.completed !== undefined) out.completed = updates.completed;
  return out;
}

export default function Schedule() {
  const { user } = useAuth();
  const migrationLock = useRef(false);

  const [view, setView] = useState<View>("monthly");
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => toYMD(new Date()));

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [draft, setDraft] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: toYMD(new Date()),
    start: "10:00",
    end: "11:00",
    color: "red",
  });

  useEffect(() => {
    if (!user?.uid) {
      setEvents([]);
      setScheduleLoading(false);
      return;
    }

    setScheduleLoading(true);
    setScheduleError(null);

    const eventsRef = collection(db, "users", user.uid, "scheduleEvents");
    const unsubscribe = onSnapshot(
      eventsRef,
      (snap) => {
        const list: CalendarEvent[] = [];
        snap.forEach((d) => list.push(docToEvent(d.id, d.data())));
        setEvents(list);
        setScheduleLoading(false);

        if (!migrationLock.current && snap.empty) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as CalendarEvent[];
            if (parsed.length === 0) return;
            migrationLock.current = true;
            const batch = writeBatch(db);
            for (const ev of parsed) {
              const ref = doc(db, "users", user.uid, "scheduleEvents", ev.id);
              batch.set(ref, firestorePayloadFromEvent(ev));
            }
            void batch
              .commit()
              .then(() => localStorage.removeItem(STORAGE_KEY))
              .catch(() => {
                migrationLock.current = false;
              });
          } catch {
            migrationLock.current = false;
          }
        }
      },
      (err) => {
        setScheduleError(err.message);
        setScheduleLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

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

  async function addEvent() {
    if (!draft.title.trim() || !user?.uid) return;
    const id = crypto.randomUUID();
    const newEvent: CalendarEvent = {
      id,
      ...draft,
      title: draft.title.trim(),
      completed: false,
    };
    await setDoc(doc(db, "users", user.uid, "scheduleEvents", id), firestorePayloadFromEvent(newEvent));
    setIsModalOpen(false);
    setDraft((prev) => ({ ...prev, title: "" }));
  }

  async function deleteEvent(id: string) {
    if (!user?.uid) return;
    await deleteDoc(doc(db, "users", user.uid, "scheduleEvents", id));
  }

  const monthLabel = currentMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventEditMode, setEventEditMode] = useState(false);

  useEffect(() => {
    setSelectedEvent((prev) => {
      if (!prev) return prev;
      const next = events.find((e) => e.id === prev.id);
      return next ?? null;
    });
  }, [events]);

  function formatDateLong(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00"); // prevents timezone bugs
  
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function formatTimeAMPM(time: string): string {
    const [hourStr, minute] = time.split(":");
    let hour = Number(hourStr);
  
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
  
    return `${hour}:${minute} ${ampm}`;
  }

  async function handleEventUpdate(eventId: string, updates: Partial<CalendarEvent>) {
    if (!user?.uid) return;
    const payload = cleanFirestoreUpdate(updates);
    if (Object.keys(payload).length === 0) return;
    await updateDoc(doc(db, "users", user.uid, "scheduleEvents", eventId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  }

  return (
    <div className="schedule-page">
      {scheduleError && (
        <div className="schedule-error" role="alert">
          Could not sync schedule: {scheduleError}
        </div>
      )}

      {/* Top bar */}
      <div className="schedule-top">
        <div className="schedule-title">Schedule</div>

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
          <ActionButton buttonType={"add"} text={"New Event"} onClick={() => openAddEvent()} />
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
      {scheduleLoading && (
        <div className="schedule-loading">Loading schedule…</div>
      )}

      {view === "monthly" && !scheduleLoading && (
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
                          <div key={ev.id} className={`event-pill ${ev.color ?? "red"}`} onClick={() => setSelectedEvent(ev)}>
                            <span className={`event-title ${ev.completed ? "completed" : ""}`}>
                              {ev.title}
                              {ev.start && ev.end ? `  ${formatTimeAMPM(ev.start)} - ${formatTimeAMPM(ev.end)}` : ""}
                            </span>
                            {/*<button
                              className="event-x"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(ev.id);
                              }}
                              title="Delete"
                            >
                              ×
                            </button>*/}
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
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
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
              <ActionButton buttonType={"add"} text={"Add"} onClick={addEvent} />
            </div>

            <div className="hint">
              Tip: double-click a day to add an event quickly.
            </div>
          </div>
        </div>
      )}

      {/*Selected Event Modal*/}
      { selectedEvent &&
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal event" onClick={(e) => e.stopPropagation()}>
            <div className="event-action-panel">
              <div className="builder-action event" onClick={() => setEventEditMode(prev => !prev)} >
                <img src={eventEditMode ? check_icon : edit_icon} />
              </div>
              <div className="builder-action event" onClick={() => {deleteEvent(selectedEvent.id); setSelectedEvent(null);}} >
                <img src={trash_icon} />
              </div>
              <div className="x-icon" onClick={() => setSelectedEvent(null)}>
                <img src={x_icon} />
              </div>
            </div>
            <div className="modal-title event">
              <div className={`event-color ${selectedEvent.color}`} />
              { eventEditMode && <img src={edit_icon} /> }
              {eventEditMode ? <input type="text" placeholder="Enter new title" value={selectedEvent.title} 
                onChange={(e) =>
                { const newTitle = e.target.value;
                  setSelectedEvent(prev => prev ? { ...prev, title: newTitle } : prev);
                  handleEventUpdate(selectedEvent.id, {
                    title: newTitle,
                  });
                }}
              /> : selectedEvent.title}
            </div>
            <div className="event-meta-wrapper">
              <div className="event-color" />
              <div className="event-meta">
                <p>{formatDateLong(selectedEvent.date)} ⋅{formatTimeAMPM(selectedEvent.start ?? "")} {selectedEvent.end? ` - ${formatTimeAMPM(selectedEvent.end)}` : ""}</p>
              </div>
            </div>
            { eventEditMode &&
                <div className="event-meta-edit-wrapper">
                  <div className="row">
                    <label className="field">
                      <span>Date</span>
                      <input
                        type="date"
                        value={selectedEvent.date}
                        onChange={(e) => 
                          { const newDate = e.target.value;
                            setSelectedEvent(prev => prev ? { ...prev, date: newDate } : prev);
                            handleEventUpdate(selectedEvent.id, {
                              date: newDate,
                            });
                          }
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Color</span>
                      <select
                        value={selectedEvent.color}
                        onChange={(e) =>
                          { if (!selectedEvent) return;

                            const newColor = e.target.value as CalendarEvent["color"];
                        
                            const updatedEvent: CalendarEvent = {
                              ...selectedEvent,
                              color: newColor,
                            };
                        
                            setSelectedEvent(updatedEvent);
                            handleEventUpdate(selectedEvent.id, { color: newColor });
                          }}
                      >
                        <option value="red">Red</option>
                        <option value="yellow">Yellow</option>
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                      </select>
                    </label>
                  </div>

                  <div className="row">
                    <label className="field">
                      <span>Start</span>
                      <input
                        type="time"
                        value={selectedEvent.start ?? ""}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setSelectedEvent(prev => prev ? { ...prev, start: newStart } : prev);
                          handleEventUpdate(selectedEvent.id, {
                            start: newStart,
                          });
                        }}
                      />
                    </label>

                    <label className="field">
                      <span>End</span>
                      <input
                        type="time"
                        value={selectedEvent.end ?? ""}
                        onChange={(e) => 
                          { const newEnd = e.target.value;
                            setSelectedEvent(prev => prev ? { ...prev, end: newEnd } : prev);
                            handleEventUpdate(selectedEvent.id, {
                              end: newEnd,
                            });
                          }
                        }
                      />
                    </label>
                  </div>
                </div>
              }
            { eventEditMode ?
              <textarea placeholder="Add event description" value={selectedEvent.description} 
              onChange={(e) => {
                const newDescription = e.target.value;
                setSelectedEvent(prev => prev ? { ...prev, description: newDescription } : prev);
                handleEventUpdate(selectedEvent.id, {
                  description: newDescription,
                });
              }} />
              : <p className="event-desc">{selectedEvent.description}</p>
            }
            <div className="final-actions">
              <button className={`builder-action-pill ${selectedEvent.completed ? "complete" : ""}`} 
              onClick={() => {
                const newCompleted = !selectedEvent.completed;
                setSelectedEvent(prev => prev ? { ...prev, completed: newCompleted } : prev);
                handleEventUpdate(selectedEvent.id, { completed: newCompleted });
              }} >
                {selectedEvent.completed && <img src={check_icon} />}
                {selectedEvent.completed ? "Complete" : "Mark as Completed"}
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  );
}
