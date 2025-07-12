import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoxIcon } from "../../icons";

interface CalendarEvent extends EventInput {
  extendedProps: {
    description: string;
  };
}

interface BookedDate {
  _id: string;
  checkin: string;
  checkout: string;
  postbook: string;
}

type SavedEvent = {
  _id?: string;
  id?: string;
  title: string;
  start: string;
  end: string;
  description: string;
};
const apiBase = import.meta.env.VITE_API_URL;
const Merano: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [showOnlyPostbook, setShowOnlyPostbook] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const toLocalDateString = (date: Date | null | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchBookedDates = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}api/chekoutview`);
      if (!response.ok) {
        throw new Error('Failed to fetch booked dates');
      }
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const formattedDates = data.data.map((booking: any) => ({
          _id: booking._id,
          checkin: new Date(booking.checkin).toISOString(),
          checkout: new Date(booking.checkout).toISOString(),
          postbook: booking.postbook || ""
        }));
        setBookedDates(formattedDates);
      }
    } catch (err) {
      console.error('Error fetching booked dates:', err);
    }
  }, []);

  useEffect(() => {
    fetchBookedDates();
    const interval = setInterval(() => {
      fetchBookedDates();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchBookedDates]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(booking => {
      const checkin = new Date(booking.checkin);
      const checkout = new Date(booking.checkout);
      const checkinDate = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
      const checkoutDate = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return currentDate >= checkinDate && currentDate <= checkoutDate;
    });
  };

  const getBookingForDate = (date: Date) => {
    return bookedDates.find(booking => {
      const checkin = new Date(booking.checkin);
      const checkout = new Date(booking.checkout);
      const checkinDate = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
      const checkoutDate = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return currentDate >= checkinDate && currentDate <= checkoutDate;
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiBase}views`);
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
            description: event.description || "",
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

    const selectedEndDate = selectInfo.end ? new Date(selectInfo.endStr) : selectedStartDate;
    
    let currentDate = new Date(selectedStartDate);
    while (currentDate <= selectedEndDate) {
      if (isDateBooked(currentDate)) {
        alert("Some selected dates are already booked. Please choose different dates.");
        return;
      }
      currentDate.setDate(currentDate.getDate() + 1);
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
    setEventDescription(event.extendedProps.description || "");
    openModal();
  };

  const handleDateClick = (arg: any) => {
    const booking = getBookingForDate(arg.date);
    if (booking?.postbook === "postbook") {
      setBookingToDelete(booking._id);
      setDeleteModalOpen(true);
    }
  };

  const handleAddOrUpdateEvent = async () => {
    const formatDateForAPI = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const payload = {
      postbook: "postbook",
      checkin: formatDateForAPI(eventStartDate),
      checkout: formatDateForAPI(eventEndDate),
      description: eventDescription || "",
    };

    try {
      let response;
      let savedEvent: SavedEvent;

      if (selectedEvent) {
        response = await fetch(`${apiBase}api/update/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: eventTitle || "Untitled Event",
            start: eventStartDate,
            end: eventEndDate,
            description: eventDescription,
          }),
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
                  extendedProps: { description: savedEvent.description },
                }
              : event
          )
        );
      } else {
        response = await fetch(`${apiBase}api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to send booking to backend");

        savedEvent = await response.json();

        const eventExistsOnDate = events.some(
          (ev) => ev.start === eventStartDate && ev.end === eventEndDate
        );
        if (eventExistsOnDate) {
          alert("A booking already exists for these dates.");
          return;
        }

        const newEvent: CalendarEvent = {
          id: savedEvent._id || Date.now().toString(),
          title: "Booking",
          start: eventStartDate,
          end: eventEndDate,
          allDay: true,
          extendedProps: { description: eventDescription },
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error adding/updating booking:", error);
      alert("There was an error saving the booking.");
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventDescription("");
    setSelectedEvent(null);
  };

  const togglePostbookFilter = () => {
    setShowOnlyPostbook(!showOnlyPostbook);
  };

  const deleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      const response = await fetch(`${apiBase}api/checkoutdelete/${bookingToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      // Refresh the events and bookings
      fetchBookedDates();
      const eventsResponse = await fetch(`${apiBase}api/views`);
      if (!eventsResponse.ok) throw new Error("Failed to fetch events");
      
      const data = await eventsResponse.json();
      const eventsArray = Array.isArray(data) ? data : data.events;

      const mappedEvents: CalendarEvent[] = eventsArray.map((event: any) => ({
        id: event._id || event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: true,
        extendedProps: {
          description: event.description || "",
        },
      }));

      setEvents(mappedEvents);
      setDeleteModalOpen(false);
      setBookingToDelete(null);
      
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const renderDayCellContent = (cellInfo: any) => {
    const booking = getBookingForDate(cellInfo.date);
    const isBooked = !!booking;
    const isPostbook = booking?.postbook === "postbook";
    
    return {
      html: `
        <div class="fc-daygrid-day-top ${isBooked ? 'has-booked-badge' : ''}">
          <span class="fc-daygrid-day-number">${cellInfo.dayNumberText}</span>
          ${isBooked ? `
          <div class="booked-container">
            <span class="booked-badge ${isPostbook ? 'green-badge' : 'red-badge'}">
              ${isPostbook ? 'Offline Pay' : 'Online Pay'}
            </span>
          </div>
          ` : ''}
        </div>
      `
    };
  };

  const dayCellClassNames = (arg: any) => {
    const booking = getBookingForDate(arg.date);
    const isBooked = !!booking;
    const isPostbook = booking?.postbook === "postbook";
    
    return [
      isBooked ? 'fc-day-booked' : '',
      isBooked ? (isPostbook ? 'green-day' : 'red-day') : ''
    ].join(' ');
  };

  return (
    <>
      <PageMeta title="Booking Calendar" description="Booking management" />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
            }}
            events={showOnlyPostbook 
              ? events.filter(event => {
                  const booking = bookedDates.find(b => 
                    b.checkin === event.start || 
                    (event.end && b.checkout === event.end)
                  );
                  return booking?.postbook === "postbook";
                })
              : events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventContent={renderEventContent}
            selectAllow={(selectInfo) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selectedDate = new Date(selectInfo.startStr);
              selectedDate.setHours(0, 0, 0, 0);
              
              const endDate = selectInfo.end ? new Date(selectInfo.endStr) : selectedDate;
              let currentDate = new Date(selectedDate);
              
              while (currentDate <= endDate) {
                if (isDateBooked(currentDate)) {
                  return false;
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }
              
              return selectedDate >= today;
            }}
            dayCellClassNames={dayCellClassNames}
            dayCellContent={renderDayCellContent}
          />
        </div>

        {/* Main Booking Modal */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Booking" : "Add Booking"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedEvent ? "Modify your booking details" : "Select dates for your booking"}
              </p>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Booking Notes
              </label>
              <input
                type="text"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Enter any notes about your booking"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Check-in Date
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
                Check-out Date
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
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Booking" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-[500px] p-6">
          <div className="flex flex-col px-2">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90">
                Delete Booking
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this booking?
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6 sm:justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={deleteBooking}
                type="button"
                className="flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <style>
        {`
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
          
          .fc-day-booked {
            pointer-events: none;
          }
          
          .fc-day-booked.green-day {
           
            background-color: #fff5f5;
            pointer-events: auto;
            cursor: pointer;
          }
          
          .fc-day-booked.green-day .fc-daygrid-day-number {
          
             color: #f87171;
          }
          
          .fc-day-booked.red-day {
            background-color: #f0fff0;
          }
          
          .fc-day-booked.red-day .fc-daygrid-day-number {
             color: #38a169;
          }
          
          .fc-daygrid-day-top.has-booked-badge {
            position: relative;
            min-height: 24px;
          }
          
          .booked-container {
            position: absolute;
            top: -8px;
            right: -8px;
            display: flex;
            align-items: center;
          }
          
          .booked-badge {
            font-size: 10px;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            z-index: 1;
            white-space: nowrap;
          }
          
          .green-badge {
           background-color: #f87171;
          }
          
          .red-badge {
            
             background-color: #38a169;
          }
          
          .fc-daygrid-day-frame {
            position: relative;
          }
          
          .fc-day-disabled {
            background-color: #f3f4f6;
          }
        `}
      </style>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  return (
    <div className="event-fc-color flex fc-event-main p-1 rounded-sm bg-blue-600 text-white">
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Merano;