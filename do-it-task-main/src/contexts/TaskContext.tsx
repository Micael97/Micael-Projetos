
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Priority = 'low' | 'medium' | 'high';

export type TimeEntry = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  pausedAt: Date | null;
  totalPausedTime: number; // em milissegundos
};

export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type TaskCategory = 'work' | 'personal' | 'home' | 'study' | 'other' | string;

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate: Date | null;
  priority: Priority;
  timeEntries: TimeEntry[];
  recurrence: RecurrencePattern;
  category: TaskCategory;
  pomodoroEnabled: boolean;
  pomodoroTime: number; // tempo em minutos
  pomodoroBreak: number; // tempo em minutos
};

type TaskStatistics = {
  total: number;
  completed: number;
  overdue: number;
  byCategory: Record<string, { total: number; completed: number }>;
  weeklyCompleted: number[];
};

type WeeklySummary = {
  date: Date;
  seen: boolean;
  stats: TaskStatistics;
};

type TaskContextType = {
  tasks: Task[];
  categories: string[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeEntries'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  startTimeTracking: (id: string) => void;
  pauseTimeTracking: (id: string) => void;
  resumeTimeTracking: (id: string) => void;
  stopTimeTracking: (id: string) => void;
  currentlyTracking: string | null;
  addCustomCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  getStatistics: () => TaskStatistics;
  getWeeklySummary: () => WeeklySummary | null;
  markWeeklySummaryAsSeen: () => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          timeEntries: (task.timeEntries || []).map((entry: any) => ({
            ...entry,
            startTime: new Date(entry.startTime),
            endTime: entry.endTime ? new Date(entry.endTime) : null,
            pausedAt: entry.pausedAt ? new Date(entry.pausedAt) : null,
            totalPausedTime: entry.totalPausedTime || 0,
          })),
          recurrence: task.recurrence || 'none',
          category: task.category || 'other',
          pomodoroEnabled: task.pomodoroEnabled || false,
          pomodoroTime: task.pomodoroTime || 25,
          pomodoroBreak: task.pomodoroBreak || 5,
        }));
      } catch (error) {
        console.error('Failed to parse saved tasks:', error);
        return [];
      }
    }
    return [];
  });
  
  const [currentlyTracking, setCurrentlyTracking] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      try {
        return JSON.parse(savedCategories);
      } catch (error) {
        console.error('Failed to parse saved categories:', error);
        return [];
      }
    }
    return [];
  });
  
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(() => {
    const savedSummary = localStorage.getItem('weeklySummary');
    if (savedSummary) {
      try {
        const parsed = JSON.parse(savedSummary);
        return {
          ...parsed,
          date: new Date(parsed.date),
        };
      } catch (error) {
        console.error('Failed to parse weekly summary:', error);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('weeklySummary', JSON.stringify(weeklySummary));
  }, [weeklySummary]);
  
  // Verifica se é domingo e gera o resumo semanal
  useEffect(() => {
    const checkForWeeklySummary = () => {
      const today = new Date();
      const isWeekEnd = today.getDay() === 0; // 0 = domingo
      
      if (isWeekEnd) {
        const lastSummaryDate = weeklySummary?.date;
        const isToday = lastSummaryDate && 
          lastSummaryDate.getDate() === today.getDate() &&
          lastSummaryDate.getMonth() === today.getMonth() &&
          lastSummaryDate.getFullYear() === today.getFullYear();
        
        if (!isToday) {
          // É domingo e ainda não temos resumo para hoje
          setWeeklySummary({
            date: today,
            seen: false,
            stats: getStatistics()
          });
        }
      }
    };
    
    checkForWeeklySummary();
    
    // Verifica a cada hora
    const interval = setInterval(checkForWeeklySummary, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, weeklySummary]);
  
  const addCustomCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };
  
  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const getStatistics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats: TaskStatistics = {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      overdue: tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length,
      byCategory: {},
      weeklyCompleted: Array(7).fill(0) // [Dom, Seg, Ter, Qua, Qui, Sex, Sáb]
    };
    
    // Calcular estatísticas por categoria
    const allCategories = [...new Set([
      'work', 'personal', 'home', 'study', 'other', 
      ...categories
    ])];
    
    allCategories.forEach(category => {
      const categoryTasks = tasks.filter(task => task.category === category);
      if (categoryTasks.length > 0) {
        stats.byCategory[category] = {
          total: categoryTasks.length,
          completed: categoryTasks.filter(task => task.completed).length
        };
      }
    });
    
    // Calcular conclusões por dia da semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    tasks.forEach(task => {
      if (task.completed) {
        const lastTimeEntry = task.timeEntries[task.timeEntries.length - 1];
        if (lastTimeEntry && lastTimeEntry.endTime) {
          const completedDate = new Date(lastTimeEntry.endTime);
          if (completedDate > oneWeekAgo) {
            const dayOfWeek = completedDate.getDay();
            stats.weeklyCompleted[dayOfWeek]++;
          }
        }
      }
    });
    
    return stats;
  };
  
  const getWeeklySummary = () => {
    return weeklySummary;
  };
  
  const markWeeklySummaryAsSeen = () => {
    if (weeklySummary) {
      setWeeklySummary({
        ...weeklySummary,
        seen: true
      });
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'timeEntries'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      timeEntries: [],
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    if (currentlyTracking === id) {
      setCurrentlyTracking(null);
    }
  };

  const completeTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    if (currentlyTracking === id) {
      stopTimeTracking(id);
    }
  };

  const startTimeTracking = (id: string) => {
    if (currentlyTracking) {
      stopTimeTracking(currentlyTracking);
    }
    
    const newTimeEntry: TimeEntry = {
      id: Math.random().toString(36).substring(2, 9),
      startTime: new Date(),
      endTime: null,
      pausedAt: null,
      totalPausedTime: 0
    };
    
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, timeEntries: [...task.timeEntries, newTimeEntry] }
          : task
      )
    );
    
    setCurrentlyTracking(id);
  };
  
  const pauseTimeTracking = (id: string) => {
    if (id !== currentlyTracking) return;
    
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task;
        
        const updatedTimeEntries = [...task.timeEntries];
        const currentEntryIndex = updatedTimeEntries.findIndex(
          (entry) => entry.endTime === null
        );
        
        if (currentEntryIndex !== -1) {
          updatedTimeEntries[currentEntryIndex] = {
            ...updatedTimeEntries[currentEntryIndex],
            pausedAt: new Date(),
          };
        }
        
        return { ...task, timeEntries: updatedTimeEntries };
      })
    );
  };
  
  const resumeTimeTracking = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task;
        
        const updatedTimeEntries = [...task.timeEntries];
        const currentEntryIndex = updatedTimeEntries.findIndex(
          (entry) => entry.endTime === null && entry.pausedAt !== null
        );
        
        if (currentEntryIndex !== -1) {
          const entry = updatedTimeEntries[currentEntryIndex];
          const pausedTime = entry.pausedAt 
            ? new Date().getTime() - entry.pausedAt.getTime() 
            : 0;
            
          updatedTimeEntries[currentEntryIndex] = {
            ...entry,
            pausedAt: null,
            totalPausedTime: (entry.totalPausedTime || 0) + pausedTime
          };
        }
        
        return { ...task, timeEntries: updatedTimeEntries };
      })
    );
  };

  const stopTimeTracking = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task;
        
        const updatedTimeEntries = [...task.timeEntries];
        const currentEntryIndex = updatedTimeEntries.findIndex(
          (entry) => entry.endTime === null
        );
        
        if (currentEntryIndex !== -1) {
          const entry = updatedTimeEntries[currentEntryIndex];
          let pausedTime = entry.totalPausedTime || 0;
          
          // Se estiver pausado, adiciona o tempo pausado ao total
          if (entry.pausedAt) {
            pausedTime += new Date().getTime() - entry.pausedAt.getTime();
          }
          
          updatedTimeEntries[currentEntryIndex] = {
            ...entry,
            endTime: new Date(),
            pausedAt: null,
            totalPausedTime: pausedTime
          };
        }
        
        return { ...task, timeEntries: updatedTimeEntries };
      })
    );
    
    if (currentlyTracking === id) {
      setCurrentlyTracking(null);
    }
  };

  const value = {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    startTimeTracking,
    pauseTimeTracking,
    resumeTimeTracking,
    stopTimeTracking,
    currentlyTracking,
    addCustomCategory,
    removeCategory,
    getStatistics,
    getWeeklySummary,
    markWeeklySummaryAsSeen
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
