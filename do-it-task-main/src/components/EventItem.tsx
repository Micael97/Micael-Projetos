
import React from 'react';
import { CalendarEvent, EventCategory } from '@/contexts/EventContext';
import { Briefcase, Home, GraduationCap, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventItemProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const getCategoryIcon = (category: EventCategory) => {
  switch (category) {
    case 'work':
      return <Briefcase className="h-4 w-4" />;
    case 'home':
      return <Home className="h-4 w-4" />;
    case 'study':
      return <GraduationCap className="h-4 w-4" />;
    case 'personal':
      return <User className="h-4 w-4" />;
    default:
      return null;
  }
};

const getCategoryText = (category: EventCategory): string => {
  switch (category) {
    case 'work':
      return 'Trabalho';
    case 'home':
      return 'Casa';
    case 'study':
      return 'Faculdade/Estudo';
    case 'personal':
      return 'Pessoal';
    case 'other':
      return 'Outro';
    default:
      return 'Outro';
  }
};

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const categoryIcon = getCategoryIcon(event.category || 'other');
  
  return (
    <div 
      className="p-3 rounded-md border border-border hover:bg-accent/20 transition-colors cursor-pointer"
      onClick={onClick}
      style={{ borderLeft: `4px solid ${event.color}` }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{event.title}</h4>
      </div>
      
      {event.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {event.description}
        </p>
      )}
      
      <div className="flex items-center text-xs text-muted-foreground mt-2 gap-3">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {event.startTime} - {event.endTime}
        </div>
        
        {categoryIcon && (
          <div className="flex items-center gap-1">
            {categoryIcon}
            <span>{getCategoryText(event.category)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventItem;
