
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarIcon, 
  Clock, 
  Plus, 
  Trash2,
  Briefcase,
  Home,
  GraduationCap,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEventContext, EventCategory } from '@/contexts/EventContext';

const colors = [
  { name: 'Azul', value: '#9b87f5' },
  { name: 'Verde', value: '#4CAF50' },
  { name: 'Vermelho', value: '#F44336' },
  { name: 'Amarelo', value: '#FFEB3B' },
  { name: 'Roxo', value: '#9C27B0' },
  { name: 'Laranja', value: '#FF9800' },
];

const CalendarView = () => {
  const { events, addEvent, deleteEvent } = useEventContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    color: '#9b87f5',
    category: 'other' as EventCategory
  });

  const handleAddNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      date: date || new Date(),
      startTime: '09:00',
      endTime: '10:00',
      color: '#9b87f5',
      category: 'other'
    });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (newEvent.title && newEvent.date) {
      addEvent({
        id: selectedEvent?.id || Math.random().toString(36).substring(2, 9),
        title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date,
        startTime: newEvent.startTime || '09:00',
        endTime: newEvent.endTime || '10:00',
        color: newEvent.color || '#9b87f5',
        category: newEvent.category || 'other'
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setIsDialogOpen(false);
    }
  };

  const getDayEvents = (day: Date) => {
    return events.filter(event => 
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    );
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getDayEvents(day);
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setNewEvent({
        ...dayEvents[0],
        date: dayEvents[0].date
      });
      setIsDialogOpen(true);
    } else {
      setNewEvent({
        title: '',
        description: '',
        date: day,
        startTime: '09:00',
        endTime: '10:00',
        color: '#9b87f5',
        category: 'other'
      });
      setSelectedEvent(null);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendário</h2>
        <Button onClick={handleAddNewEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-border p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="mx-auto"
          modifiers={{
            booked: events.map(event => event.date)
          }}
          modifiersStyles={{
            booked: {
              fontWeight: 'bold',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)'
            }
          }}
          components={{
            DayContent: (props) => {
              const dayEvents = getDayEvents(props.date);
              return (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => handleDayClick(props.date)}
                >
                  <div>{props.date.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="flex mt-1 gap-1">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {dayEvents.length > 3 && <div className="text-xs">+{dayEvents.length - 3}</div>}
                    </div>
                  )}
                </div>
              );
            }
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            <DialogDescription>
              {selectedEvent 
                ? 'Edite os detalhes do evento abaixo' 
                : 'Adicione os detalhes do seu novo evento'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Título do evento"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Descreva o evento"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Data
              </label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                <span>
                  {newEvent.date ? format(newEvent.date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="startTime" className="text-sm font-medium">
                  Hora de início
                </label>
                <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime || '09:00'}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    className="border-0 p-0 focus-visible:ring-0"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="endTime" className="text-sm font-medium">
                  Hora de término
                </label>
                <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime || '10:00'}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className="border-0 p-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Cor
                </label>
                <Select 
                  value={newEvent.color || '#9b87f5'} 
                  onValueChange={(value) => setNewEvent({...newEvent, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="h-4 w-4 rounded-full mr-2" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Categoria
                </label>
                <Select 
                  value={newEvent.category} 
                  onValueChange={(value) => setNewEvent({...newEvent, category: value as EventCategory})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>Trabalho</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="home">
                      <span className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <span>Casa</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="study">
                      <span className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>Faculdade/Estudo</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="personal">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Pessoal</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="other">
                      <span className="flex items-center">
                        <span>Outro</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            {selectedEvent && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteEvent}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSaveEvent}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
