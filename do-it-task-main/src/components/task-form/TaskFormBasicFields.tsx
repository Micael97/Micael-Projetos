
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskFormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const TaskFormBasicFields: React.FC<TaskFormBasicFieldsProps> = ({
  title,
  setTitle,
  description,
  setDescription
}) => {
  return (
    <>
      <div>
        <Input
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full"
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px]"
        />
      </div>
    </>
  );
};

export default TaskFormBasicFields;
