
import React, { useState } from 'react';
import { useTaskContext, Priority, RecurrencePattern, TaskCategory } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import TaskFormBasicFields from '@/components/task-form/TaskFormBasicFields';
import TaskFormPriorityAndDueDate from '@/components/task-form/TaskFormPriorityAndDueDate';
import TaskFormCategoryAndRecurrence from '@/components/task-form/TaskFormCategoryAndRecurrence';
import TaskFormPomodoro from '@/components/task-form/TaskFormPomodoro';

const TaskForm: React.FC = () => {
  const { addTask, categories, addCustomCategory } = useTaskContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [customCategory, setCustomCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  
  const handleDateTimeChange = (date: Date | undefined) => {
    if (date) {
      if (dueDate) {
        const hours = dueDate.getHours();
        const minutes = dueDate.getMinutes();
        date.setHours(hours, minutes);
      }
      setDueDate(date);
    } else {
      setDueDate(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    let finalCategory = category;
    
    if (category === 'custom' && customCategory.trim() !== '') {
      finalCategory = customCategory.trim();
      addCustomCategory(customCategory.trim());
    }
    
    addTask({
      title,
      description,
      priority,
      dueDate,
      completed: false,
      recurrence,
      category: finalCategory,
      pomodoroEnabled,
      pomodoroTime,
      pomodoroBreak,
    });
    
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
    setRecurrence('none');
    setCategory('other');
    setCustomCategory('');
    setPomodoroEnabled(false);
    setPomodoroTime(25);
    setPomodoroBreak(5);
    setShowForm(false);
  };
  
  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)}
        className="w-full"
      >
        Adicionar Nova Tarefa
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Adicionar Nova Tarefa</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowForm(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <TaskFormBasicFields 
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
        />
        
        <TaskFormPriorityAndDueDate 
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          onDateChange={handleDateTimeChange}
        />
        
        <TaskFormCategoryAndRecurrence 
          recurrence={recurrence}
          setRecurrence={setRecurrence}
          category={category}
          setCategory={setCategory}
          customCategory={customCategory}
          setCustomCategory={setCustomCategory}
          categories={categories}
        />
        
        <TaskFormPomodoro 
          pomodoroEnabled={pomodoroEnabled}
          setPomodoroEnabled={setPomodoroEnabled}
          pomodoroTime={pomodoroTime}
          setPomodoroTime={setPomodoroTime}
          pomodoroBreak={pomodoroBreak}
          setPomodoroBreak={setPomodoroBreak}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            Cancelar
          </Button>
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
