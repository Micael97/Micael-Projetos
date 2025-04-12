
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateTotalTimeSpent } from '@/utils/timeUtils';

const TaskAnalytics = () => {
  const { tasks } = useTaskContext();
  
  // Get completed and pending tasks
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Calculate total tracked time
  const totalTimeSpent = tasks.reduce((total, task) => {
    return total + calculateTotalTimeSpent(task.timeEntries);
  }, 0);
  
  // Format time in hours and minutes
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Calculate completion rate
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  // Generate weekly data
  const getDayName = (dayIndex: number): string => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayIndex];
  };
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (dayOfWeek - i + (i < dayOfWeek ? 0 : -7)));
    
    const tasksOnDay = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
    
    const completedOnDay = tasksOnDay.filter(task => task.completed);
    
    const timeSpentOnDay = tasksOnDay.reduce((total, task) => {
      return total + calculateTotalTimeSpent(task.timeEntries);
    }, 0) / 3600; // Convert to hours
    
    return {
      name: getDayName(i),
      Concluídas: completedOnDay.length,
      Pendentes: tasksOnDay.length - completedOnDay.length,
      'Tempo (h)': parseFloat(timeSpentOnDay.toFixed(1)),
    };
  });
  
  // Priority distribution
  const priorityData = [
    { name: 'Alta', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Média', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Baixa', value: tasks.filter(t => t.priority === 'low').length }
  ];
  
  const chartConfig = {
    Concluídas: {
      color: '#10b981',
      label: 'Concluídas',
    },
    Pendentes: {
      color: '#f97316',
      label: 'Pendentes',
    },
    'Tempo (h)': {
      color: '#8b5cf6',
      label: 'Tempo (h)',
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Task Completion Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{completionRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {completedTasks.length}/{tasks.length} tarefas
              </div>
            </div>
            <Progress className="h-2 mt-2" value={completionRate} />
          </CardContent>
        </Card>

        {/* Time Tracked Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Total Rastreado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{formatTotalTime(totalTimeSpent)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Em {tasks.filter(t => t.timeEntries.length > 0).length} tarefas
            </p>
          </CardContent>
        </Card>

        {/* Tasks Due Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {pendingTasks.filter(t => {
                  if (!t.dueDate) return false;
                  const today = new Date();
                  const dueDate = new Date(t.dueDate);
                  return (
                    dueDate.getDate() === today.getDate() &&
                    dueDate.getMonth() === today.getMonth() &&
                    dueDate.getFullYear() === today.getFullYear()
                  );
                }).length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              De {pendingTasks.length} tarefas pendentes
            </p>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">
                {pendingTasks.filter(t => {
                  if (!t.dueDate) return false;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dueDate = new Date(t.dueDate);
                  dueDate.setHours(0, 0, 0, 0);
                  return dueDate < today;
                }).length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tarefas com prazo expirado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Semanal</CardTitle>
          <CardDescription>
            Visão geral das suas tarefas e tempo rastreado na última semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="Concluídas" fill="#10b981" />
                <Bar yAxisId="left" dataKey="Pendentes" fill="#f97316" />
                <Bar yAxisId="right" dataKey="Tempo (h)" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAnalytics;
