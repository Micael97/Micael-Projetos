
import React from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import OverdueTasks from '@/components/OverdueTasks';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OverdueTasksPage: React.FC = () => {
  return (
    <TaskProvider>
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
          
          <OverdueTasks standalone />
        </div>
      </div>
    </TaskProvider>
  );
};

export default OverdueTasksPage;
