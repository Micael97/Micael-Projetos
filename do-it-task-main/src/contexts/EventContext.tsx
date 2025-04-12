
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type EventCategory = 'work' | 'personal' | 'home' | 'study' | 'other';

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
  category: EventCategory;
};

type EventContextType = {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        return parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          category: event.category || 'other',
        }));
      } catch (error) {
        console.error('Failed to parse saved events:', error);
        return [];
      }
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: CalendarEvent) => {
    const existingEventIndex = events.findIndex(e => e.id === event.id);
    
    if (existingEventIndex >= 0) {
      // Update existing event
      setEvents(
        events.map((e, index) =>
          index === existingEventIndex ? event : e
        )
      );
    } else {
      // Add new event
      setEvents([...events, event]);
    }
  };

  const updateEvent = (id: string, updatedEvent: Partial<CalendarEvent>) => {
    setEvents(
      events.map(event =>
        event.id === id ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
