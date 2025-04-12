
import React from 'react';
import { useTaskContext, Task } from '@/contexts/TaskContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatDateForDisplay } from '@/utils/timeUtils';
import { AlertCircle, Clock, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import TaskItem from './TaskItem';

interface OverdueTasksProps {
  standalone?: boolean;
}

const OverdueTasks: React.FC<OverdueTasksProps> = ({ standalone = false }) => {
  const { tasks, completeTask } = useTaskContext();
  const [expandedView, setExpandedView] = React.useState(false);
  
  // Get overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
  
  // Group by days overdue
  const getOverdueDays = (dueDate: Date): number => {
    const timeDiff = today.getTime() - dueDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };
  
  if (overdueTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tarefas Atrasadas</CardTitle>
          <CardDescription>Você não tem tarefas atrasadas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Se for autônomo (página separada), mostre a lista completa de tarefas
  if (standalone && expandedView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tarefas Atrasadas ({overdueTasks.length})</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpandedView(false)}
          >
            Visão Resumida
          </Button>
        </div>
        
        <div className="space-y-3">
          {overdueTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Tarefas Atrasadas</CardTitle>
          <CardDescription>
            Tarefas que passaram do prazo e precisam de atenção
          </CardDescription>
        </div>
        
        {standalone && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpandedView(true)}
          >
            Ver Todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {overdueTasks.slice(0, standalone ? 10 : 5).map(task => {
            const daysOverdue = task.dueDate ? getOverdueDays(new Date(task.dueDate)) : 0;
            
            return (
              <div 
                key={task.id} 
                className="flex items-start p-3 rounded-md border border-border bg-background"
              >
                <div className="flex-shrink-0 mr-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    daysOverdue <= 1 ? "bg-amber-100 text-amber-600" :
                    daysOverdue <= 3 ? "bg-orange-100 text-orange-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Venceu {daysOverdue === 1 ? 'ontem' : `há ${daysOverdue} dias`}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    task.priority === 'high' ? "bg-priority-high text-red-800" :
                    task.priority === 'medium' ? "bg-priority-medium text-yellow-800" :
                    "bg-priority-low text-green-800"
                  )}>
                    {task.priority === 'high' ? 'Alta' :
                     task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost" 
                    className="h-8 w-8 text-green-600"
                    onClick={() => completeTask(task.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {overdueTasks.length > (standalone ? 10 : 5) && (
            <Button 
              variant="link" 
              className="w-full mt-2"
              onClick={standalone ? () => setExpandedView(true) : undefined}
              asChild={!standalone}
            >
              {standalone ? (
                <span>
                  Ver Todas ({overdueTasks.length}) <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              ) : (
                <a href="/overdue-tasks">
                  Ver Todas ({overdueTasks.length}) <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueTasks;
