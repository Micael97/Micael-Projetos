
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/utils/timeUtils';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  pomodoro: 25 * 60, // 25 minutos
  shortBreak: 5 * 60, // 5 minutos
  longBreak: 15 * 60, // 15 minutos
};

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SETTINGS[mode]);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Update timeRemaining when mode changes
  useEffect(() => {
    setTimeRemaining(TIMER_SETTINGS[mode]);
    setIsActive(false);
  }, [mode]);
  
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            if (mode === 'pomodoro') {
              const newCount = completedPomodoros + 1;
              setCompletedPomodoros(newCount);
              
              toast({
                title: "Pomodoro concluído!",
                description: "Faça uma pausa antes da próxima sessão.",
              });
              
              // After 4 pomodoros, take a long break
              if (newCount % 4 === 0) {
                setMode('longBreak');
              } else {
                setMode('shortBreak');
              }
            } else {
              toast({
                title: "Pausa finalizada!",
                description: "Pronto para começar seu próximo pomodoro?",
              });
              setMode('pomodoro');
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, mode, completedPomodoros, toast]);
  
  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };
  
  const resetTimer = () => {
    if (isActive) {
      setIsActive(false);
    }
    setTimeRemaining(TIMER_SETTINGS[mode]);
  };
  
  const progressPercentage = (timeRemaining / TIMER_SETTINGS[mode]) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold mb-6 text-center">Timer Pomodoro</h2>
      
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg overflow-hidden border border-border">
          {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((timerMode) => (
            <button
              key={timerMode}
              onClick={() => !isActive && setMode(timerMode)}
              className={cn(
                "px-4 py-2 text-sm transition-colors",
                mode === timerMode 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              disabled={isActive}
            >
              {timerMode === 'pomodoro' && 'Foco'}
              {timerMode === 'shortBreak' && 'Pausa Curta'}
              {timerMode === 'longBreak' && 'Pausa Longa'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="timer-container w-48 h-48 mx-auto mb-6 flex items-center justify-center">
        <div 
          className="timer-progress h-full" 
          style={{ width: '100%', height: `${100 - progressPercentage}%` }} 
        />
        <div className="relative z-10">
          <div className="text-4xl font-mono text-foreground">
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button 
          onClick={toggleTimer}
          className="w-24"
          variant={isActive ? "outline" : "default"}
        >
          {isActive ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetTimer} 
          variant="outline"
          className="w-24"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Pomodoros concluídos hoje: {completedPomodoros}</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
