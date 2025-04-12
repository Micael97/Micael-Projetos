
import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { ListFilter, CheckCheck, Clock } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'oldest' | 'dueDate' | 'priority';

const TaskList: React.FC = () => {
  const { tasks, currentlyTracking } = useTaskContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (sort === 'oldest') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (sort === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (sort === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    }
    return 0;
  });
  
  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Tarefas</h2>
          {currentlyTracking && (
            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 animate-pulse-soft" />
              <span>Cronometrando</span>
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ListFilter className="h-4 w-4 mr-2" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSort('newest')}>
              Mais recentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort('oldest')}>
              Mais antigas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort('dueDate')}>
              Data de vencimento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort('priority')}>
              Prioridade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as FilterType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todas ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativas ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCheck className="h-4 w-4 mr-1" />
            Concluídas ({completedCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            <TaskForm />
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa encontrada. Adicione uma nova tarefa para começar.
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="space-y-4">
            <TaskForm />
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa ativa encontrada.
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {sortedTasks.length > 0 ? (
            <div className="space-y-3">
              {sortedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma tarefa concluída encontrada.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskList;
