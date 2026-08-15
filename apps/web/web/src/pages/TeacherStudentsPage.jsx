import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import {
  LayoutDashboard, PlaySquare, Radio, Users, BarChart2, DollarSign, Bell, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Search, Filter, Mail, Crown, AlertTriangle, FileText, MessageSquare, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader';

const TeacherStudentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  
  // Dialog State
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students', active: true },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', badge: 6, path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  // Replaced mock students with state

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.getMyStudents();
        setStudents(res.data.students || []);
      } catch (err) {
        toast.error('Failed to fetch students.');
        console.error(err);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSendReminder = (student) => {
    setSelectedStudent(student);
    
    // Auto-generate content based on student status
    let autoMessage = '';
    if (student.premiumStatus === 'Expiring Soon') {
      autoMessage = `Hi ${student.name},\n\nWe noticed your premium subscription is expiring on ${student.subEndDate}. Please renew soon to continue enjoying uninterrupted access to all our premium courses and live classes.\n\nBest regards,\nEduvirse Team`;
    } else if (student.premiumStatus === 'Inactive') {
      autoMessage = `Hi ${student.name},\n\nWe noticed you don't have an active premium subscription. Upgrade today to unlock exclusive courses, ad-free viewing, and personalized mentorship!\n\nBest regards,\nEduvirse Team`;
    } else if (student.videosWatched < 10) {
      autoMessage = `Hi ${student.name},\n\nYou've only watched ${student.videosWatched} videos so far. Dive back into your courses to stay on top of your learning goals. Consistency is key!\n\nBest regards,\nEduvirse Team`;
    } else {
      autoMessage = `Hi ${student.name},\n\nGreat job! You have watched ${student.videosWatched} videos and are making excellent progress. Keep up the fantastic work!\n\nBest regards,\nEduvirse Team`;
    }
    
    setReminderMessage(autoMessage);
    setIsReminderDialogOpen(true);
  };

  const confirmSendReminder = () => {
    toast.success(`Reminder sent to ${selectedStudent?.name} successfully!`);
    setIsReminderDialogOpen(false);
  };

  const handleSendBulkReminder = () => {
    toast.success(`Auto-generated reminders sent to ${filteredStudents.length} students!`);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = students.length;
  const premiumCount = students.filter(s => s.premiumStatus === 'Active').length;
  const avgVideosWatched = totalStudents > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.videosWatched, 0) / totalStudents) 
    : 0;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"><Crown className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'Expiring Soon':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"><AlertTriangle className="w-3 h-3 mr-1" /> Expiring Soon</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700 dark:text-slate-400">Inactive</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>My Students - Eduvirse</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
        <Header />
        
        <div className="flex flex-1 relative">
          {/* Left Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex fixed top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] z-10 overflow-y-auto transition-colors duration-300">
          <div className="p-6">


            <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={currentUser?.avatar || "https://i.pravatar.cc/150?img=11"} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || 'T'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Aman Verma'}</h3>
                  <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Physics Educator</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link, index) => {
                if (link.isGroup) {
                  return (
                    <div key={index} className="mb-2">
                      <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-default">
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </div>
                      <div className="ml-9 space-y-1 mt-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                        {link.subItems.map((sub, sIdx) => (
                          <Link 
                            key={sIdx} 
                            to={sub.path}
                            className={`block py-1.5 text-sm ${sub.active ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    to={link.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      link.active 
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-none' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`w-5 h-5 ${link.active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      {link.label}
                    </div>
                    {link.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
          
          {/* Top Header */}
          <TeacherHeader title="My Students" />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Header & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-500" />
                    Student Management
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Track student progress, monitor premium subscriptions, and send reminders.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                  <Button onClick={handleSendBulkReminder} variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                    <Mail className="w-4 h-4 mr-2" /> Bulk Reminder
                  </Button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium Subscribers</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{premiumCount}</h3>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <PlaySquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Videos Watched</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{avgVideosWatched}</h3>
                    </div>
                 </div>
              </div>

              {/* Students Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="border-b border-slate-200 dark:border-slate-800">
                        <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-400 font-semibold">Student</TableHead>
                        <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-400 font-semibold text-center">Videos Watched</TableHead>
                        <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-400 font-semibold">Premium Status</TableHead>
                        <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-400 font-semibold">Sub Ends</TableHead>
                        <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-400 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingStudents ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                            Loading students...
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                                  <AvatarImage src={student.avatar} alt={student.name} />
                                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{student.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-center">
                              <div className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold w-10 h-10 rounded-full">
                                {student.videosWatched}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {getStatusBadge(student.premiumStatus)}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {student.subEndDate}
                              </div>
                              {student.premiumStatus === 'Expiring Soon' && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold mt-0.5">
                                  Renew soon
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <Button 
                                size="sm" 
                                onClick={() => handleSendReminder(student)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                              >
                                <Mail className="w-3.5 h-3.5 mr-1.5" /> Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                            {searchQuery ? "No students found matching your search." : "You don't have any students enrolled yet."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </div>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Review and edit the auto-generated message for {selectedStudent?.name} before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="min-h-[150px] resize-none"
                placeholder="Type your message here."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendReminder} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherStudentsPage;
