
import React, { useState } from 'react';
import { Clock, ListTodo, BarChart, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    {
      icon: ListTodo,
      label: 'Tarefas',
      value: 'tasks',
      active: activeTab === 'tasks',
      onClick: () => onTabChange('tasks'),
    },
    {
      icon: Clock,
      label: 'Pomodoro',
      value: 'pomodoro',
      active: activeTab === 'pomodoro',
      onClick: () => onTabChange('pomodoro'),
    },
    {
      icon: BarChart,
      label: 'Estatísticas',
      value: 'analytics',
      active: activeTab === 'analytics',
      onClick: () => onTabChange('analytics'),
    },
    {
      icon: Settings,
      label: 'Configurações',
      value: 'settings',
      active: activeTab === 'settings',
      onClick: () => onTabChange('settings'),
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-30 bg-sidebar flex items-center justify-between px-4 py-3">
          <h1 className="text-sidebar-foreground font-bold text-xl">Tempo & Tarefas</h1>
          <button 
            onClick={toggleMobileMenu}
            className="text-sidebar-foreground p-1"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-20 bg-sidebar pt-14 animate-fade-in">
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    toggleMobileMenu();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    item.active 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
        <div className="h-14"></div> {/* Spacer for fixed header */}
      </>
    );
  }

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h1 className="font-bold text-xl">Tempo & Tarefas</h1>}
        <button 
          onClick={toggleSidebar}
          className={cn(
            "p-1 rounded-md text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "mx-auto"
          )}
        >
          <Menu size={20} />
        </button>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center rounded-lg transition-colors",
                  isCollapsed ? "justify-center py-3" : "px-4 py-3 gap-3",
                  item.active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                )}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4">
        {!isCollapsed && (
          <div className="text-xs text-sidebar-foreground/80">
            Tempo & Tarefas v1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
