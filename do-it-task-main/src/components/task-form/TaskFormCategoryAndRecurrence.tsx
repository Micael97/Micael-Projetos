
import React from 'react';
import { RecurrencePattern, TaskCategory } from '@/contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Repeat, Briefcase, Home, GraduationCap, User } from 'lucide-react';

interface TaskFormCategoryAndRecurrenceProps {
  recurrence: RecurrencePattern;
  setRecurrence: (recurrence: RecurrencePattern) => void;
  category: TaskCategory;
  setCategory: (category: TaskCategory) => void;
  customCategory: string;
  setCustomCategory: (customCategory: string) => void;
  categories: string[];
}

const TaskFormCategoryAndRecurrence: React.FC<TaskFormCategoryAndRecurrenceProps> = ({
  recurrence,
  setRecurrence,
  category,
  setCategory,
  customCategory,
  setCustomCategory,
  categories
}) => {
  const categoryIcons = {
    work: <Briefcase className="h-4 w-4 mr-2" />,
    home: <Home className="h-4 w-4 mr-2" />,
    study: <GraduationCap className="h-4 w-4 mr-2" />,
    personal: <User className="h-4 w-4 mr-2" />,
    other: <div className="w-4 h-4 mr-2" />,
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Recorrência</label>
        <Select 
          value={recurrence} 
          onValueChange={(value) => setRecurrence(value as RecurrencePattern)}
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
      
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
        <div className="grid grid-cols-1 gap-2">
          <Select 
            value={category} 
            onValueChange={(value) => {
              setCategory(value as TaskCategory);
              if (value !== 'custom') {
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
                  {categoryIcons.work}
                  <span>Trabalho</span>
                </span>
              </SelectItem>
              <SelectItem value="home">
                <span className="flex items-center">
                  {categoryIcons.home}
                  <span>Casa</span>
                </span>
              </SelectItem>
              <SelectItem value="study">
                <span className="flex items-center">
                  {categoryIcons.study}
                  <span>Faculdade/Estudo</span>
                </span>
              </SelectItem>
              <SelectItem value="personal">
                <span className="flex items-center">
                  {categoryIcons.personal}
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
          
          {category === 'custom' && (
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
  );
};

export default TaskFormCategoryAndRecurrence;
