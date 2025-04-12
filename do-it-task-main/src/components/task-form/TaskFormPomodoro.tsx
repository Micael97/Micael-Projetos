
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Timer } from 'lucide-react';

interface TaskFormPomodoroProps {
  pomodoroEnabled: boolean;
  setPomodoroEnabled: (enabled: boolean) => void;
  pomodoroTime: number;
  setPomodoroTime: (time: number) => void;
  pomodoroBreak: number;
  setPomodoroBreak: (breakTime: number) => void;
}

const TaskFormPomodoro: React.FC<TaskFormPomodoroProps> = ({
  pomodoroEnabled,
  setPomodoroEnabled,
  pomodoroTime,
  setPomodoroTime,
  pomodoroBreak,
  setPomodoroBreak
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="pomodoro">
        <AccordionTrigger className="py-2">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>Configurações do Pomodoro</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="pomodoro-enable-new" 
                checked={pomodoroEnabled}
                onCheckedChange={setPomodoroEnabled}
              />
              <Label htmlFor="pomodoro-enable-new">Habilitar Pomodoro</Label>
            </div>
            
            {pomodoroEnabled && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <Label className="text-sm mb-2 block">
                    Tempo de Trabalho: {pomodoroTime} minutos
                  </Label>
                  <Slider
                    value={[pomodoroTime]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => setPomodoroTime(value[0])}
                  />
                </div>
                
                <div>
                  <Label className="text-sm mb-2 block">
                    Tempo de Pausa: {pomodoroBreak} minutos
                  </Label>
                  <Slider
                    value={[pomodoroBreak]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => setPomodoroBreak(value[0])}
                  />
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TaskFormPomodoro;
