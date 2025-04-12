
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WeeklySummaryNotification: React.FC = () => {
  const { getWeeklySummary, markWeeklySummaryAsSeen } = useTaskContext();
  const [open, setOpen] = useState(false);
  
  const weeklySummary = getWeeklySummary();
  
  useEffect(() => {
    if (weeklySummary && !weeklySummary.seen) {
      setOpen(true);
    }
  }, [weeklySummary]);
  
  if (!weeklySummary) return null;
  
  const handleClose = () => {
    setOpen(false);
    markWeeklySummaryAsSeen();
  };
  
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const chartData = weeklySummary.stats.weeklyCompleted.map((value, index) => ({
    name: days[index],
    tarefas: value,
  }));
  
  const formatDate = (date: Date) => {
    return format(date, "'dia' dd 'de' MMMM", { locale: ptBR });
  };
  
  const totalTasks = weeklySummary.stats.total;
  const completedTasks = weeklySummary.stats.completed;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  const categories = Object.entries(weeklySummary.stats.byCategory)
    .map(([category, stats]) => ({
      name: category,
      total: stats.total,
      completed: stats.completed,
      percentage: stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0
    }))
    .sort((a, b) => b.total - a.total);
  
  const getCategoryLabel = (name: string): string => {
    switch (name) {
      case 'work': return 'Trabalho';
      case 'home': return 'Casa';
      case 'study': return 'Faculdade/Estudo';
      case 'personal': return 'Pessoal';
      case 'other': return 'Outro';
      default: return name;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Resumo Semanal</DialogTitle>
          <DialogDescription>
            Seu resumo de tarefas da semana até {formatDate(weeklySummary.date)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total de Tarefas</p>
              <p className="text-2xl font-semibold">{totalTasks}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Concluídas</p>
              <p className="text-2xl font-semibold">{completedTasks}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-600">Taxa de Conclusão</p>
              <p className="text-2xl font-semibold">{completionRate}%</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Tarefas Concluídas por Dia</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tarefas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Desempenho por Categoria</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.name} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{getCategoryLabel(cat.name)}</span>
                      <span>{cat.completed}/{cat.total} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklySummaryNotification;
