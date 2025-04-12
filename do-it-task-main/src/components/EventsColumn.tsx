
import React from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEventContext } from '@/contexts/EventContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const EventsColumn = () => {
  const { events } = useEventContext();
  
  // Get today's events
  const today = new Date();
  const todayEvents = events.filter(event => 
    event.date.getDate() === today.getDate() &&
    event.date.getMonth() === today.getMonth() &&
    event.date.getFullYear() === today.getFullYear()
  );
  
  // Get upcoming events (next 7 days excluding today)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > today && eventDate <= nextWeek;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Eventos</h2>
        <Link to="/calendar">
          <Button variant="outline" size="sm">
            <CalendarCheck className="h-4 w-4 mr-2" />
            Calendário
          </Button>
        </Link>
      </div>
      
      {/* Today's events */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Hoje</h3>
        {todayEvents.length > 0 ? (
          <ul className="space-y-2">
            {todayEvents.map((event) => (
              <li key={event.id} className="flex items-start p-2 rounded-md hover:bg-muted/50">
                <div 
                  className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0" 
                  style={{ backgroundColor: event.color }}
                />
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum evento para hoje</p>
        )}
      </div>
      
      {/* Upcoming events */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Próximos</h3>
        {upcomingEvents.length > 0 ? (
          <ul className="space-y-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <li key={event.id} className="flex items-start p-2 rounded-md hover:bg-muted/50">
                <div 
                  className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0" 
                  style={{ backgroundColor: event.color }}
                />
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.date, "dd 'de' MMM", { locale: ptBR })} • {event.startTime}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
        )}
      </div>
      
      {/* Link to add new event */}
      <Link to="/calendar" className="block mt-4">
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar evento
        </Button>
      </Link>
    </div>
  );
};

export default EventsColumn;
