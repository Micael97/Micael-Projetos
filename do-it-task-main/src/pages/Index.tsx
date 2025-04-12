
import React from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import { EventProvider } from '@/contexts/EventContext';
import Sidebar from '@/components/Sidebar';
import TaskList from '@/components/TaskList';
import PomodoroTimer from '@/components/PomodoroTimer';
import EventsColumn from '@/components/EventsColumn';
import TaskAnalytics from '@/components/TaskAnalytics';
import OverdueTasks from '@/components/OverdueTasks';
import WeeklySummaryNotification from '@/components/WeeklySummaryNotification';
import { cn } from '@/lib/utils';

// Make sure Index is properly defined as a function component
const Index: React.FC = () => {
  // React hooks must be used inside a function component body
  const [activeTab, setActiveTab] = React.useState('tasks');
  
  return (
    <TaskProvider>
      <EventProvider>
        <div className="min-h-screen flex bg-background">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              {activeTab === 'tasks' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <TaskList />
                  </div>
                  <div className="hidden lg:block lg:col-span-3">
                    <PomodoroTimer />
                  </div>
                  <div className="hidden lg:block lg:col-span-3">
                    <div className="space-y-6">
                      <EventsColumn />
                      <OverdueTasks />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'pomodoro' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <PomodoroTimer />
                  </div>
                  <div className="lg:col-span-6">
                    <TaskList />
                  </div>
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <TaskAnalytics />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <OverdueTasks />
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Configurações</h2>
                  <p className="text-muted-foreground">
                    Painel de configurações em breve...
                  </p>
                </div>
              )}
            </div>
          </main>
          <WeeklySummaryNotification />
        </div>
      </EventProvider>
    </TaskProvider>
  );
};

export default Index;
