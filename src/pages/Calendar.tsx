import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

type SavedEvent = {
  _id?: string;
  id?: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
};
const apiBase = import.meta.env.VITE_API_URL;
const Calendar: React.FC = () => {
   
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    notAvailable: "danger",
    available: "success",
  };

  const toLocalDateString = (date: Date | null | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
const apiBase = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiBase}api/views`);
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        const eventsArray = Array.isArray(data) ? data : data.events;

        const mappedEvents: CalendarEvent[] = eventsArray.map((event: any) => ({
          id: event._id || event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: true,
          extendedProps: {
            calendar: event.calendar || "available",
          },
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedStartDate = new Date(selectInfo.startStr);
    selectedStartDate.setHours(0, 0, 0, 0);

    if (selectedStartDate < today) {
      alert("You can only select today or future dates.");
      return;
    }

    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(toLocalDateString(event.start));
    setEventEndDate(toLocalDateString(event.end));
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) {
      alert("Event title cannot be empty.");
      return;
    }

    const payload = {
      title: eventTitle,
      start: eventStartDate,
      end: eventEndDate,
      calendar: eventLevel,
    };

    try {
      let response;
      let savedEvent: SavedEvent;

      if (selectedEvent) {
        response = await fetch(`${apiBase}api/update/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to update event");

        savedEvent = await response.json();

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  title: savedEvent.title,
                  start: savedEvent.start,
                  end: savedEvent.end,
                  extendedProps: { calendar: savedEvent.calendar },
                }
              : event
          )
        );
      } else {
        response = await fetch(`${apiBase}api/cal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to send event to backend");

        savedEvent = await response.json();

        const eventExistsOnDate = events.some(
          (ev) => ev.start === savedEvent.start && ev.end === savedEvent.end
        );
        if (eventExistsOnDate) {
          alert("An event already exists on this date.");
          return;
        }

        const newEvent: CalendarEvent = {
          id: savedEvent._id || Date.now().toString(),
          title: savedEvent.title,
          start: savedEvent.start,
          end: savedEvent.end,
          allDay: true,
          extendedProps: { calendar: savedEvent.calendar },
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error adding/updating event:", error);
      alert("There was an error saving the event.");
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta title="React Calendar" description="Calendar dashboard" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              // left: "prev,next addEventButton",
              center: "title",
              // right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            // customButtons={{
            //   addEventButton: {
            //     text: "Add Event +",
            //     click: openModal,
            //   },
            // }}
          />
        </div>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on track
              </p>
            </div>

            <div className="mt-8">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key]) => (
                  <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                    <input
                      type="radio"
                      className="sr-only"
                      name="event-level"
                      value={key}
                      checked={eventLevel === key}
                      onChange={() => setEventLevel(key)}
                    />
                    <span className="w-5 h-5 mr-2 border rounded-full border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          eventLevel === key ? "bg-black dark:bg-white" : ""
                        }`}
                      ></span>
                    </span>
                    {key}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter Start Date
              </label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter End Date
              </label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div className="flex items-center gap-3 mt-6 sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const calendarColor = eventInfo.event.extendedProps.calendar;

  const colorClass =
    calendarColor === "available"
      ? "bg-green-600 text-white"
      : calendarColor === "notAvailable"
      ? "bg-red-600 text-white"
      : "";

  return (
    <div className={`event-fc-color flex fc-event-main p-1 rounded-sm ${colorClass}`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
