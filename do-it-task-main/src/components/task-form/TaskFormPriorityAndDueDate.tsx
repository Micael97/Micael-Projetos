
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Priority } from '@/contexts/TaskContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface TaskFormPriorityAndDueDateProps {
  priority: Priority;
  setPriority: (priority: Priority) => void;
  dueDate: Date | null;
  setDueDate: (dueDate: Date | null) => void;
  onDateChange: (date: Date | undefined) => void;
}

const TaskFormPriorityAndDueDate: React.FC<TaskFormPriorityAndDueDateProps> = ({
  priority,
  setPriority,
  dueDate,
  setDueDate,
  onDateChange
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Prioridade</label>
        <RadioGroup 
          value={priority} 
          onValueChange={(value) => setPriority(value as Priority)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-priority-low mr-1.5"></span>
              Baixa
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-priority-medium mr-1.5"></span>
              Média
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-priority-high mr-1.5"></span>
              Alta
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Data de Vencimento</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate || undefined}
              onSelect={onDateChange}
              initialFocus
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {dueDate && (
          <div className="flex items-center mt-2">
            <Clock className="mr-2 h-4 w-4" />
            <input
              type="time"
              value={format(dueDate, "HH:mm")}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date(dueDate);
                newDate.setHours(hours, minutes);
                setDueDate(newDate);
              }}
              className="border rounded px-2 py-1"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFormPriorityAndDueDate;
