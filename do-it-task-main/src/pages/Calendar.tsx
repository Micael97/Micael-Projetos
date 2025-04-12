
import React, { useState } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import Sidebar from '@/components/Sidebar';
import CalendarView from '@/components/CalendarView';
import { cn } from '@/lib/utils';
import { EventProvider } from '@/contexts/EventContext';

const Calendar = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  
  return (
    <TaskProvider>
      <EventProvider>
        <div className="min-h-screen flex bg-background">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <CalendarView />
            </div>
          </main>
        </div>
      </EventProvider>
    </TaskProvider>
  );
};

export default Calendar;
