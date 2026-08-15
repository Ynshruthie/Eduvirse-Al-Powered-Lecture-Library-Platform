import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, DollarSign, BarChart3, HelpCircle, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TeacherHeader = ({ title, icon: Icon, children }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 lg:px-8 sticky top-16 md:top-20 z-10 transition-colors duration-300">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {children}
      </div>
    </header>
  );
};

export default TeacherHeader;
