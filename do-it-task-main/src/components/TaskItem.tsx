
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Trash, Play, Square, Repeat, AlertTriangle, Edit, Briefcase, Home, GraduationCap, User, Calendar as CalendarIcon, Pause, TimerOff, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateForDisplay, calculateTotalTimeSpent } from '@/utils/timeUtils';
import { Task, useTaskContext, Priority, RecurrencePattern, TaskCategory } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
}

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'low':
      return 'bg-priority-low text-green-800';
    case 'medium':
      return 'bg-priority-medium text-yellow-800';
    case 'high':
      return 'bg-priority-high text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getPriorityText = (priority: Priority): string => {
  switch (priority) {
    case 'low':
      return 'Baixa';
    case 'medium':
      return 'Média';
    case 'high':
      return 'Alta';
    default:
      return '';
  }
};

const getRecurrenceText = (recurrence: RecurrencePattern): string | null => {
  switch (recurrence) {
    case 'none':
      return null;
    case 'daily':
      return 'Diária';
    case 'weekdays':
      return 'Dias úteis';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    default:
      return null;
  }
};

const getCategoryIcon = (category: TaskCategory) => {
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

const getCategoryText = (category: TaskCategory): string => {
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
      return category;
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { 
    completeTask, 
    deleteTask, 
    startTimeTracking, 
    stopTimeTracking, 
    pauseTimeTracking,
    resumeTimeTracking,
    currentlyTracking,
    updateTask,
    categories
  } = useTaskContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({...task});
  const [customCategory, setCustomCategory] = useState('');
  const [isPomodoroDialogOpen, setIsPomodoroDialogOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  
  const isTracking = currentlyTracking === task.id;
  
  // Calcular tempo restante para o pomodoro
  useEffect(() => {
    if (isTracking && task.pomodoroEnabled) {
      const currentEntry = task.timeEntries.find(entry => !entry.endTime);
      
      if (currentEntry) {
        const timeoutId = setInterval(() => {
          if (currentEntry.pausedAt) {
            // Se estiver pausado, não atualize o tempo
            return;
          }
          
          const startTime = new Date(currentEntry.startTime).getTime();
          const now = Date.now();
          const elapsedMs = now - startTime - (currentEntry.totalPausedTime || 0);
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const totalSeconds = task.pomodoroTime * 60;
          const remaining = Math.max(0, totalSeconds - elapsedSeconds);
          
          setRemainingTime(remaining);
          
          // Se o tempo acabou, notifique o usuário
          if (remaining === 0) {
            stopTimeTracking(task.id);
            toast({
              title: "Pomodoro concluído!",
              description: `Tempo concluído para a tarefa "${task.title}". Faça uma pausa de ${task.pomodoroBreak} minutos.`,
            });
          }
        }, 1000);
        
        return () => clearInterval(timeoutId);
      }
    } else {
      setRemainingTime(null);
    }
  }, [isTracking, task, stopTimeTracking, toast]);
  
  // Gerenciar estado de pausa
  useEffect(() => {
    if (isTracking) {
      const currentEntry = task.timeEntries.find(entry => !entry.endTime);
      setIsPaused(!!currentEntry?.pausedAt);
    } else {
      setIsPaused(false);
    }
  }, [isTracking, task.timeEntries]);
  
  const totalTimeSpent = calculateTotalTimeSpent(task.timeEntries);
  const formattedTime = formatTime(totalTimeSpent);
  
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  function formatRemainingTime(seconds: number | null): string {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  const recurrenceText = getRecurrenceText(task.recurrence || 'none');
  const categoryIcon = getCategoryIcon(task.category || 'other');

  const handleEditClick = () => {
    setEditedTask({...task});
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    let finalTask = {...editedTask};
    
    // Lidar com categoria personalizada
    if (customCategory && customCategory.trim() !== '') {
      finalTask.category = customCategory.trim();
    }
    
    updateTask(task.id, finalTask);
    setIsDialogOpen(false);
    setCustomCategory('');
  };
  
  const handleToggleTracking = () => {
    if (!isTracking) {
      startTimeTracking(task.id);
    } else {
      if (isPaused) {
        resumeTimeTracking(task.id);
      } else {
        pauseTimeTracking(task.id);
      }
    }
  };
  
  const handleStopTracking = () => {
    stopTimeTracking(task.id);
  };
  
  const handlePomodoroSettings = () => {
    setIsPomodoroDialogOpen(true);
  };
  
  const savePomodoroSettings = () => {
    updateTask(task.id, {
      pomodoroEnabled: editedTask.pomodoroEnabled,
      pomodoroTime: editedTask.pomodoroTime,
      pomodoroBreak: editedTask.pomodoroBreak
    });
    setIsPomodoroDialogOpen(false);
  };

  return (
    <>
      <div className={cn(
        "task-item bg-white p-4 rounded-lg shadow-sm border border-border",
        task.completed && "bg-muted/50"
      )}>
        <div className="flex items-start gap-3">
          <button 
            onClick={() => completeTask(task.id)}
            className="mt-1 text-muted-foreground hover:text-primary transition-colors"
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium text-foreground line-clamp-2",
                task.completed && "task-completed"
              )}>
                {task.title}
              </h3>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {task.dueDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {formatDateForDisplay(task.dueDate)}
                  </span>
                )}
                
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  getPriorityColor(task.priority)
                )}>
                  {getPriorityText(task.priority)}
                </span>
              </div>
            </div>
            
            {task.description && (
              <p className={cn(
                "text-sm text-muted-foreground mt-1 line-clamp-2",
                task.completed && "task-completed"
              )}>
                {task.description}
              </p>
            )}
            
            {isTracking && task.pomodoroEnabled && remainingTime !== null && (
              <div className="mt-2 bg-primary/10 rounded-md p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Tempo restante: {formatRemainingTime(remainingTime)}
                  </span>
                </div>
                {isPaused && (
                  <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    Pausado
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{formattedTime}</span>
                </div>
                
                {recurrenceText && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span className="text-xs">{recurrenceText}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  {categoryIcon || <div className="h-4 w-4" />}
                  <span className="text-xs">{getCategoryText(task.category)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!task.completed && task.pomodoroEnabled && (
                  <button
                    onClick={handlePomodoroSettings}
                    className="p-1 rounded-md text-indigo-500 hover:text-indigo-600 transition-colors"
                    title="Configurar Pomodoro"
                  >
                    <Timer className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={handleEditClick}
                  className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                {!task.completed && (
                  <>
                    <button
                      onClick={handleToggleTracking}
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        isTracking 
                          ? (isPaused 
                            ? "text-orange-500 hover:text-orange-600" 
                            : "text-primary hover:text-primary/80")
                          : "text-primary hover:text-primary/80"
                      )}
                      title={!isTracking ? "Iniciar" : (isPaused ? "Continuar" : "Pausar")}
                    >
                      {!isTracking ? <Play className="h-4 w-4" /> : 
                        (isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />)
                      }
                    </button>
                    
                    {isTracking && (
                      <button
                        onClick={handleStopTracking}
                        className="p-1 rounded-md text-red-500 hover:text-red-600 transition-colors"
                        title="Parar"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                  title="Excluir"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diálogo de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                placeholder="Título da tarefa"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                placeholder="Descrição da tarefa"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Prioridade</label>
              <RadioGroup 
                value={editedTask.priority} 
                onValueChange={(value) => setEditedTask({...editedTask, priority: value as Priority})}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="edit-low" />
                  <Label htmlFor="edit-low" className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-priority-low mr-1.5"></span>
                    Baixa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="edit-medium" />
                  <Label htmlFor="edit-medium" className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-priority-medium mr-1.5"></span>
                    Média
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="edit-high" />
                  <Label htmlFor="edit-high" className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-priority-high mr-1.5"></span>
                    Alta
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.dueDate ? format(editedTask.dueDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedTask.dueDate || undefined}
                    onSelect={(date) => setEditedTask({...editedTask, dueDate: date})}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Recorrência</label>
                <Select 
                  value={editedTask.recurrence} 
                  onValueChange={(value) => setEditedTask({...editedTask, recurrence: value as RecurrencePattern})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o padrão de recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center">
                        <span>Sem recorrência</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="daily">
                      <span className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4" />
                        <span>Diariamente</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="weekdays">
                      <span className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4" />
                        <span>Dias úteis (Seg-Sex)</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <span className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4" />
                        <span>Semanalmente</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <span className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4" />
                        <span>Mensalmente</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Categoria</label>
                <div className="grid grid-cols-1 gap-2">
                  <Select 
                    value={editedTask.category} 
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        // Não altere a categoria ainda, espere o usuário escrever uma nova
                      } else {
                        setEditedTask({...editedTask, category: value as TaskCategory});
                        setCustomCategory('');
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
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
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center">
                            <span>{cat}</span>
                          </span>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <span className="flex items-center">
                          <span>+ Nova Categoria</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {editedTask.category === 'custom' && (
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Digite o nome da nova categoria"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="pomodoro-enable" 
                  checked={editedTask.pomodoroEnabled}
                  onCheckedChange={(checked) => setEditedTask({...editedTask, pomodoroEnabled: checked})}
                />
                <Label htmlFor="pomodoro-enable">Habilitar Pomodoro</Label>
              </div>
              
              {editedTask.pomodoroEnabled && (
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div>
                    <Label className="text-sm">
                      Tempo de Trabalho: {editedTask.pomodoroTime} minutos
                    </Label>
                    <Slider
                      value={[editedTask.pomodoroTime]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={(value) => setEditedTask({...editedTask, pomodoroTime: value[0]})}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">
                      Tempo de Pausa: {editedTask.pomodoroBreak} minutos
                    </Label>
                    <Slider
                      value={[editedTask.pomodoroBreak]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setEditedTask({...editedTask, pomodoroBreak: value[0]})}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Configurações do Pomodoro */}
      <Dialog open={isPomodoroDialogOpen} onOpenChange={setIsPomodoroDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Configurar Pomodoro</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-sm">
                Tempo de Trabalho: {editedTask.pomodoroTime} minutos
              </Label>
              <Slider
                value={[editedTask.pomodoroTime]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setEditedTask({...editedTask, pomodoroTime: value[0]})}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm">
                Tempo de Pausa: {editedTask.pomodoroBreak} minutos
              </Label>
              <Slider
                value={[editedTask.pomodoroBreak]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setEditedTask({...editedTask, pomodoroBreak: value[0]})}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPomodoroDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={savePomodoroSettings}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskItem;
