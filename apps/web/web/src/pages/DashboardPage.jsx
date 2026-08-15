import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award, Settings, Trash2, LogOut, LayoutDashboard, FileText, GraduationCap, Radio, BarChart3, Users, DollarSign, MessageSquare, HelpCircle, Upload, Plus, PlaySquare, FolderOpen, CheckCircle2, CreditCard, Heart, Calendar, Bell, Star, Crown, ChevronRight, Play, Eye, Search, Download, Send, Check, X, ChevronDown, ChevronUp, AlertCircle, Info, Wallet, Building2, Smartphone, Globe, Mail, MessageCircle, Shield, User, BellRing, Save, ArrowLeft, ArrowRight, ChevronLeft, Trash } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EditProfileModal from '@/components/EditProfileModal.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const TeacherDashboard = ({ currentUser, logout }) => {
  const navigate = useNavigate();
  const [teacherStats, setTeacherStats] = useState({ studentCount: 0, courseCount: 0 });
  const [myCourses, setMyCourses] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, courses] = await Promise.all([
          api.getTeacherStats(),
          api.getMyCourses(),
        ]);
        setTeacherStats(stats);
        setMyCourses(courses);
      } catch (err) {
        // silently fail - show empty state
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardData();
  }, []);

  const avgRating = myCourses.length > 0 
    ? (myCourses.reduce((acc, c) => acc + (c.rating || 0), 0) / myCourses.length).toFixed(1) 
    : '0.0';

  const stats = [
    { label: 'Courses Created', value: loadingStats ? '...' : String(teacherStats.courseCount), icon: '📚', color: 'bg-purple-500/10 text-purple-600' },
    { label: 'Students Enrolled', value: loadingStats ? '...' : String(teacherStats.totalEnrollments || teacherStats.studentCount), icon: '👥', color: 'bg-green-500/10 text-green-600' },
    { label: 'Total Earnings', value: 'Coming Soon', icon: '💰', color: 'bg-orange-500/10 text-orange-600' },
    { label: 'Avg. Rating', value: loadingStats ? '...' : avgRating, icon: '⭐', color: 'bg-red-500/10 text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border hidden lg:flex flex-col p-6 space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{currentUser?.name || 'Teacher'}</h2>
          <p className="text-sm text-muted-foreground">{currentUser?.headline || 'Educator'}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/dashboard' },
            { icon: FileText, label: 'Content', path: '/teacher/content' },
            { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
            { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
            { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
            { icon: Users, label: 'Students', path: '/teacher/students' },
            { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
            { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
            { icon: Settings, label: 'Settings', path: '/teacher/settings' },
            { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-border space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">

        <div className="p-8 space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground">Here's what's happening with your content today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.value === 'Coming Soon' ? 'text-muted-foreground text-lg' : ''}`}>{stat.value}</p>
                  {stat.value === 'Coming Soon' && (
                    <p className="text-xs text-muted-foreground mt-2">Analytics feature coming soon</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Courses Table */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>My Courses</CardTitle>
                    <Link to="/teacher/courses" className="text-sm text-primary hover:underline">
                      View All →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : myCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Enrolled</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myCourses.map((course) => (
                            <tr key={course._id || course.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                    {course.title?.charAt(0)}
                                  </div>
                                  <p className="font-medium line-clamp-1">{course.title}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{course.category}</td>
                              <td className="py-3 px-4 font-semibold">{course.enrollmentCount || 0}</td>
                              <td className="py-3 px-4">⭐ {course.rating || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No courses found in the catalog matching your name.</p>
                      <Button className="mt-4" onClick={() => navigate('/create-course')}>Create Your First Course</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Analytics Coming Soon */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold mb-1">Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Detailed analytics including views, watch time, and completion rates are on the way.</p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/upload')} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Upload className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-center">Upload Video</span>
                  </button>
                  <button onClick={() => navigate('/create-course')} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-center">Create Course</span>
                  </button>
                  <button onClick={() => navigate('/teacher/settings')} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Settings className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-center">Settings</span>
                  </button>
                  <button onClick={() => navigate('/teacher/students')} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Users className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-center">Students</span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// --- Student Dashboard Tab Components ---

const MyCoursesTab = ({ enrolledCourses, loading, navigate }) => {
  const [search, setSearch] = useState('');
  
  const filtered = enrolledCourses.filter(c => 
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (typeof c.instructor === 'string' ? c.instructor : (c.instructor?.name || '')).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-card text-sm rounded-xl outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Total Enrolled: {enrolledCourses.length}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border bg-card p-4 space-y-4 shadow-sm">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const courseProgressVal = course.progress || 0;
            const courseId = course.id || course._id;
            return (
              <div 
                key={courseId} 
                onClick={() => navigate(`/course/${courseId}/learn`)}
                className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border border-border cursor-pointer group/card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-28 overflow-hidden bg-muted">
                  <img 
                    src={course.thumbnailUrl || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-3 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <h4 className="font-bold text-xs text-foreground mb-1 line-clamp-2 min-h-[32px] group-hover/card:text-primary transition-colors leading-tight">
                      {course.title}
                    </h4>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium mb-1">
                      <span className="truncate pr-2">By {course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : '') || course.teacherName || 'Eduvirse Educator'}</span>
                      <span className="flex-shrink-0">Progress: {courseProgressVal}%</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-3">
                    <Progress value={courseProgressVal} className="h-1 bg-muted" />
                    
                    <div className="flex gap-2 pt-1">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${courseId}/learn`);
                        }} 
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-semibold h-7 rounded-lg"
                      >
                        {courseProgressVal === 100 ? 'Review' : courseProgressVal > 0 ? 'Resume' : 'Start'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${courseId}`);
                        }}
                        className="border-border text-[10px] font-semibold h-7 rounded-lg px-2 hover:bg-muted"
                      >
                        Info
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-2xl p-6 w-full">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-semibold">No courses found matching your query.</p>
        </div>
      )}
    </div>
  );
};

const LiveClassesTab = ({ navigate }) => {
  const [subTab, setSubTab] = useState('ongoing');
  const [reminders, setReminders] = useState({});
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveClasses = async () => {
      setIsLoading(true);
      try {
        const courses = await api.getCourses({ filter: 'live' });
        // Assume published status means it's ongoing, else upcoming
        setOngoingClasses(courses.filter(c => c.status === 'published').map(c => ({
          id: c.id || c._id,
          title: c.title,
          teacher: c.instructor?.name || c.instructor || 'Educator',
          time: 'Ongoing Live Session',
          students: c.enrollmentCount || 0,
          preview: c.thumbnailUrl || c.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.instructor?.name || 'A')}&background=random`
        })));
        
        setUpcomingClasses(courses.filter(c => c.status !== 'published').map(c => ({
          id: c.id || c._id,
          title: c.title,
          teacher: c.instructor?.name || c.instructor || 'Educator',
          date: c.schedule ? new Date(c.schedule.startDate).toLocaleDateString() : 'Scheduled',
          time: c.schedule?.classTime || 'TBD',
          preview: c.thumbnailUrl || c.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.instructor?.name || 'A')}&background=random`
        })));
      } catch (err) {
        console.error("Failed to fetch live classes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveClasses();
  }, []);

  const toggleReminder = (id, title) => {
    setReminders(prev => {
      const active = !prev[id];
      if (active) {
        toast.success(`Reminder set for: ${title}`);
      } else {
        toast.info(`Reminder cancelled for: ${title}`);
      }
      return { ...prev, [id]: active };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        <button
          onClick={() => setSubTab('ongoing')}
          className={`pb-3 px-4 font-bold text-xs transition-colors border-b-2 -mb-[2px] ${subTab === 'ongoing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Ongoing Live ({ongoingClasses.length})
        </button>
        <button
          onClick={() => setSubTab('upcoming')}
          className={`pb-3 px-4 font-bold text-xs transition-colors border-b-2 -mb-[2px] ${subTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Upcoming Live ({upcomingClasses.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading classes...</div>
      ) : subTab === 'ongoing' ? (
        ongoingClasses.length === 0 ? (
          <div className="py-12 text-center border-dashed border-2 border-border rounded-xl bg-card text-muted-foreground">
            No active live sessions right now.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoingClasses.map((cls, i) => {
            const colorPairs = [
              { color: 'bg-[#5c67f2]', darkColor: 'dark:bg-[#4a54c4]' },
              { color: 'bg-[#f5a623]', darkColor: 'dark:bg-[#d68910]' },
              { color: 'bg-[#2980b9]', darkColor: 'dark:bg-[#1a5276]' },
              { color: 'bg-[#27ae60]', darkColor: 'dark:bg-[#196f3d]' },
              { color: 'bg-[#e74c3c]', darkColor: 'dark:bg-[#922b21]' }
            ];
            const cPair = colorPairs[i % colorPairs.length];
            return (
              <div 
                key={cls.id} 
                onClick={() => navigate(`/live-session/${cls.id}`)}
                className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl group/card cursor-pointer"
              >
                <div className={`relative h-32 ${cPair.color} ${cPair.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {cls.students || 100} Watching
                  </div>
                  <img 
                    src={`https://i.pravatar.cc/150?u=${cls.teacher}`} 
                    alt={cls.teacher} 
                    className="w-20 h-20 rounded-full object-cover object-top border-4 border-card translate-y-6 shadow-lg bg-muted transition-transform duration-500 group-hover/card:scale-110" 
                  />
                </div>
                
                <div className="p-5 pt-8 flex-1 flex flex-col justify-between bg-card text-card-foreground">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant='destructive' className="text-[10px] uppercase font-bold tracking-wider animate-pulse bg-red-600 text-white">
                        ● LIVE
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> 4.8
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-sm text-foreground mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-primary transition-colors">
                      {cls.title}
                    </h4>
                    
                    <p className="text-[11px] text-muted-foreground mb-1 font-medium">
                      By {cls.teacher}
                    </p>
                    
                    <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> {cls.time}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full rounded-xl font-semibold h-9 text-xs transition-all duration-300 active:scale-95 border-none bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
                    >
                      <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Join Live Classroom
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        upcomingClasses.length === 0 ? (
          <div className="py-12 text-center border-dashed border-2 border-border rounded-xl bg-card text-muted-foreground">
            No upcoming sessions scheduled.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingClasses.map((cls, i) => {
            const colorPairs = [
              { color: 'bg-[#5c67f2]', darkColor: 'dark:bg-[#4a54c4]' },
              { color: 'bg-[#f5a623]', darkColor: 'dark:bg-[#d68910]' },
              { color: 'bg-[#2980b9]', darkColor: 'dark:bg-[#1a5276]' },
              { color: 'bg-[#27ae60]', darkColor: 'dark:bg-[#196f3d]' },
              { color: 'bg-[#e74c3c]', darkColor: 'dark:bg-[#922b21]' }
            ];
            const cPair = colorPairs[i % colorPairs.length];
            return (
              <div 
                key={cls.id} 
                onClick={() => toggleReminder(cls.id, cls.title)}
                className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl group/card cursor-pointer"
              >
                <div className={`relative h-32 ${cPair.color} ${cPair.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> UPCOMING
                  </div>
                  <img 
                    src={`https://i.pravatar.cc/150?u=${cls.teacher}`} 
                    alt={cls.teacher} 
                    className="w-20 h-20 rounded-full object-cover object-top border-4 border-card translate-y-6 shadow-lg bg-muted transition-transform duration-500 group-hover/card:scale-110" 
                  />
                </div>
                
                <div className="p-5 pt-8 flex-1 flex flex-col justify-between bg-card text-card-foreground">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant='secondary' className="text-[10px] uppercase font-bold tracking-wider">
                        Upcoming
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> 4.8
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-sm text-foreground mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-primary transition-colors">
                      {cls.title}
                    </h4>
                    
                    <p className="text-[11px] text-muted-foreground mb-1 font-medium">
                      By {cls.teacher}
                    </p>
                    
                    <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground pt-1 mb-3">
                      <span>📅 {cls.date}</span>
                      <span>⏰ {cls.time}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant={reminders[cls.id] ? "secondary" : "outline"}
                      className="w-full rounded-xl font-semibold h-9 text-xs transition-all duration-300 active:scale-95 border border-border"
                    >
                      {reminders[cls.id] ? '✓ Reminder Active' : 'Notify Me'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
    </div>
  );
};

const RecordedLessonsTab = () => {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      setIsLoading(true);
      try {
        const courses = await api.getCourses();
        let allRecordings = [];
        courses.forEach(c => {
          if (c.pastRecordings && c.pastRecordings.length > 0) {
            c.pastRecordings.forEach(pr => {
              allRecordings.push({
                id: pr.id || c.id || c._id,
                title: pr.title || `${c.title} - Recording`,
                course: c.category || "General Content",
                teacher: c.instructor?.name || c.instructor || "Educator",
                duration: "24:00",
                date: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently Added"),
                views: c.enrollmentCount || 0,
                url: pr.videoUrl,
                img: c.thumbnailUrl || c.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'
              });
            });
          } else if (c.videoUrl && c.status !== 'published') {
            allRecordings.push({
              id: c.id || c._id,
              title: c.title,
              course: c.category || "General Content",
              teacher: c.instructor?.name || c.instructor || "Educator",
              duration: "24:00",
              date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently Added",
              views: c.enrollmentCount || 0,
              url: c.videoUrl,
              img: c.thumbnailUrl || c.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'
            });
          }
        });
        setRecordings(allRecordings);
      } catch (err) {
        console.error("Failed to fetch recordings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading recordings...</div>
      ) : recordings.length === 0 ? (
        <div className="py-12 text-center border-dashed border-2 border-border rounded-xl bg-card text-muted-foreground">
          No recorded lessons available.
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recordings.map(rec => (
          <div 
            key={rec.id} 
            onClick={() => setPlayingVideo(rec)}
            className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border border-border cursor-pointer group/card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-28 overflow-hidden bg-muted">
              <img src={rec.img} alt={rec.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                ⏱️ {rec.duration}
              </div>
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-[9px] text-primary font-bold uppercase tracking-wider truncate">{rec.course}</p>
              <h4 className="font-bold text-xs text-foreground line-clamp-2 min-h-[32px] group-hover/card:text-primary transition-colors leading-tight">
                {rec.title}
              </h4>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium pt-1">
                <span className="truncate pr-2">By {rec.teacher}</span>
                <span className="flex-shrink-0">👁️ {rec.views} views</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Recorded on {rec.date}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl relative border border-border text-card-foreground">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{playingVideo.title}</h3>
              <button 
                onClick={() => setPlayingVideo(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video src={playingVideo.url} controls autoPlay className="w-full h-full" />
            </div>
            <div className="p-4 bg-muted/50 flex justify-between items-center text-xs border-t border-border">
              <span className="text-muted-foreground">Instructor: {playingVideo.teacher}</span>
              <span className="text-muted-foreground">{playingVideo.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssignmentsTab = ({ enrolledCourses }) => {
  const [assignments, setAssignments] = useState([]);

  const [submittingAsg, setSubmittingAsg] = useState(null);
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmitFile = (e) => {
    e.preventDefault();
    if (!fileName && !fileText) {
      toast.error("Please add a note or upload a file.");
      return;
    }
    
    setAssignments(prev => prev.map(item => {
      if (item.id === submittingAsg.id) {
        return { ...item, status: 'Submitted', due: 'Submitted Today', color: 'text-blue-500 bg-blue-500/10' };
      }
      return item;
    }));

    toast.success(`Successfully submitted assignment: ${submittingAsg.title}`);
    setSubmittingAsg(null);
    setFileName('');
    setFileText('');
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Assignment</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Grade</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? assignments.map(asg => (
                <tr key={asg.id} className="border-b border-slate-150/40 dark:border-slate-800/40 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6 font-semibold">{asg.title}</td>
                  <td className="py-4 px-6 text-muted-foreground">{asg.course}</td>
                  <td className="py-4 px-6">{asg.due}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${asg.color}`}>
                      {asg.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold">{asg.grade}</td>
                  <td className="py-4 px-6 text-right">
                    {asg.status === 'Pending' ? (
                      <Button 
                        onClick={() => setSubmittingAsg(asg)}
                        className="bg-primary text-white hover:bg-primary/95 text-[10px] h-7 px-3 rounded-lg"
                      >
                        Submit
                      </Button>
                    ) : asg.status === 'Graded' ? (
                      <button 
                        onClick={() => toast.info(`Feedback: "Excellent work! Accurate derivations and nicely commented diagram annotations."`)}
                        className="text-primary hover:underline font-bold text-[10px]"
                      >
                        Feedback
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">Waiting grading</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground border-dashed border-2 border-border bg-card">
                    No pending assignments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {submittingAsg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitFile} className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Submit: {submittingAsg.title}</h3>
              <button 
                type="button" 
                onClick={() => setSubmittingAsg(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attached Note</label>
              <textarea
                value={fileText}
                onChange={(e) => setFileText(e.target.value)}
                placeholder="Include a message or note for your teacher..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-3 outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upload Document</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 relative">
                <input 
                  type="file" 
                  onChange={(e) => setFileName(e.target.files[0]?.name || '')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-[10px] font-semibold text-slate-500">{fileName ? `Selected: ${fileName}` : 'Drag & drop or click to upload PDF/Word'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSubmittingAsg(null)}
                className="flex-1 text-xs font-semibold h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-white hover:bg-primary/95 text-xs font-semibold h-10 rounded-xl"
              >
                Submit Assignment
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const QuizzesTab = ({ enrolledCourses }) => {
  const [quizzes, setQuizzes] = useState([]);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const mockQuestions = [];

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
  };

  const handleAnswerSelect = (optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < mockQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      let correct = 0;
      mockQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.ans) {
          correct += 1;
        }
      });
      
      const percent = (correct / mockQuestions.length) * 100;
      const gradeStr = `${correct}/${mockQuestions.length}`;
      const status = percent >= 60 ? 'Passed' : 'Failed';
      
      setQuizzes(prev => prev.map(item => {
        if (item.id === activeQuiz.id) {
          return { ...item, status, grade: gradeStr, color: percent >= 60 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10' };
        }
        return item;
      }));

      setQuizFinished(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.length > 0 ? quizzes.map(quiz => (
          <Card key={quiz.id} className="border-0 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {quiz.course}
              </span>
              <h4 className="font-bold text-sm leading-snug pt-1">{quiz.title}</h4>
              <div className="flex gap-4 text-[10px] text-muted-foreground pt-2">
                <span>⏱️ {quiz.duration}</span>
                <span>📋 {quiz.questions} Questions</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${quiz.color}`}>
                  {quiz.status}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Score: {quiz.grade}
                </span>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-100 dark:border-slate-850 mt-4">
              {quiz.status === 'Not Taken' ? (
                <Button 
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-semibold h-9 rounded-xl"
                >
                  Start Quiz
                </Button>
              ) : (
                <Button 
                  disabled
                  className="w-full bg-muted text-muted-foreground text-xs font-semibold h-9 rounded-xl border-none cursor-default"
                >
                  Quiz Completed
                </Button>
              )}
            </div>
          </Card>
        )) : (
          <div className="col-span-1 md:col-span-3 py-12 text-center text-muted-foreground border-dashed border-2 border-border bg-card rounded-xl">
            No quizzes available at the moment.
          </div>
        )}
      </div>

      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{activeQuiz.title}</h3>
              <button 
                type="button" 
                onClick={() => setActiveQuiz(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizFinished ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                  <span>Question {currentQuestionIdx + 1} of {mockQuestions.length}</span>
                  <span className="text-primary">Interactive Mode</span>
                </div>
                
                <h4 className="font-bold text-xs leading-normal text-slate-900 dark:text-white">
                  {mockQuestions[currentQuestionIdx].q}
                </h4>

                <div className="space-y-2">
                  {mockQuestions[currentQuestionIdx].opts.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerSelect(optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <Button 
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-semibold h-10 rounded-xl"
                >
                  {currentQuestionIdx === mockQuestions.length - 1 ? 'Submit Answers' : 'Next Question'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Assessment Submitted!</h4>
                  <p className="text-xs text-muted-foreground mt-1">Your results have been processed and synced to your dashboard.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-bold text-xs">
                  Final Score: {quizzes.find(q => q.id === activeQuiz.id)?.grade} ({quizzes.find(q => q.id === activeQuiz.id)?.status})
                </div>
                <Button 
                  onClick={() => setActiveQuiz(null)}
                  className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-semibold h-10 rounded-xl"
                >
                  Close Results Window
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StudyMaterialsTab = () => {
  const materials = [
    { subject: 'Physics', items: [
      { name: 'Newton Laws Formulas & Derivations Cheat Sheet.pdf', size: '1.2 MB' },
      { name: 'Pulley Systems & Tension Diagrams.pdf', size: '2.4 MB' }
    ]},
    { subject: 'React JS Development', items: [
      { name: 'React Hooks API Cheat Sheet.pdf', size: '840 KB' },
      { name: 'Redux ToolKit Setup Blueprint.pdf', size: '1.5 MB' }
    ]},
    { subject: 'Calculus', items: [
      { name: 'Limits & Graph Continuity Equations.pdf', size: '950 KB' },
      { name: 'Derivatives & Chain Rule Review Questions.pdf', size: '1.8 MB' }
    ]}
  ];

  const handleDownload = (name) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Initializing download: ${name}...`,
        success: `Downloaded ${name} successfully!`,
        error: 'Failed to download.'
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materials.map((folder, idx) => (
          <Card key={idx} className="border-0 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{folder.subject}</h4>
            </div>
            <div className="space-y-3">
              {folder.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-xs truncate leading-normal text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{item.size}</p>
                  </div>
                  <button 
                    onClick={() => handleDownload(item.name)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProgressTab = ({ enrolledCourses }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: '128 Hours', icon: '⏱️', color: 'bg-indigo-500/10 text-indigo-600' },
          { label: 'Quizzes Passed', value: '8 of 10', icon: '📝', color: 'bg-green-500/10 text-green-600' },
          { label: 'Homework Finished', value: '14 Completed', icon: '📋', color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Avg Assessment Grade', value: '86% (A-)', icon: '⭐', color: 'bg-yellow-500/10 text-yellow-600' }
        ].map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm p-4 flex flex-col justify-between">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm p-6">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-4">Study Time Breakdown (Hours / Week)</h4>
          <div className="flex justify-between items-end h-40 gap-3 pt-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            {[
              { day: 'Mon', hrs: '1.5h', height: 'h-10' },
              { day: 'Tue', hrs: '2.0h', height: 'h-14' },
              { day: 'Wed', hrs: '3.5h', height: 'h-24' },
              { day: 'Thu', hrs: '1.0h', height: 'h-6' },
              { day: 'Fri', hrs: '4.0h', height: 'h-28' },
              { day: 'Sat', hrs: '0.5h', height: 'h-4' },
              { day: 'Sun', hrs: '1.2h', height: 'h-8' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="absolute -top-6 text-[8px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-1 py-0.5 rounded">
                  {bar.hrs}
                </span>
                <div className={`w-full bg-primary/70 hover:bg-primary rounded-t transition-all ${bar.height}`}></div>
                <span className="text-[9px] font-semibold text-slate-400 mt-1">{bar.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-0 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">Subject Progress Status</h4>
          <div className="space-y-4">
            {[
              { name: 'Newton\'s Laws of Motion - Visualized', progress: 72 },
              { name: 'Organic Chemistry - Reaction Mechanisms', progress: 45 },
              { name: 'Introduction to Calculus', progress: 100 },
              { name: 'Complete Python Bootcamp for Beginners', progress: 20 }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold truncate pr-3">{item.name}</span>
                  <span className="font-bold text-primary shrink-0">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const AnnouncementsTab = ({ enrolledCourses = [] }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.fetchWithAuth('/api/announcements');
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.data.announcements);
        }
      } catch (error) {
        console.error('Failed to fetch announcements', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const getCourseName = (courseId) => {
    const enrollment = enrolledCourses.find(e => e.courseId === courseId);
    return enrollment?.course?.title || 'Unknown Course';
  };

  const getTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading announcements...</div>;
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <p>No new announcements from your instructors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann, idx) => {
        const colors = [
          'bg-purple-500/10 text-purple-600',
          'bg-blue-500/10 text-blue-600',
          'bg-green-500/10 text-green-600',
          'bg-orange-500/10 text-orange-600'
        ];
        const color = colors[idx % colors.length];
        const icon = '📢';

        return (
          <Card key={ann.id} className="border-0 shadow-sm p-5">
            <div className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${color}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-bold text-sm text-foreground leading-tight">{ann.title}</h4>
                  <span className="text-[9px] text-muted-foreground font-semibold shrink-0">{getTimeAgo(ann.createdAt)}</span>
                </div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">{getCourseName(ann.courseId)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{ann.message}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const CertificatesTab = () => {
  const certificates = [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length > 0 ? certificates.map(cert => (
          <div key={cert.id} className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border border-border group/card">
            <div className="relative h-36 overflow-hidden bg-muted">
              <img src={cert.img} alt={cert.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-3xl mb-1">🎓</div>
                <p className="text-xs font-bold">Certificate of Completion</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-sm text-foreground leading-tight">{cert.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Issued: {cert.issueDate}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded">Grade: {cert.grade}</span>
                <Button
                  onClick={() => toast.success(`Downloading certificate: ${cert.title}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold h-7 px-3 rounded-lg"
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )) : null}
        <div className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="text-4xl">🏆</div>
          <p className="font-bold text-sm text-foreground">Complete more courses</p>
          <p className="text-xs text-muted-foreground">Finish a course to earn your certificate of completion.</p>
        </div>
      </div>
    </div>
  );
};

const PaymentsTab = ({ enrolledCourses = [] }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [addingCard, setAddingCard] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [addingUpi, setAddingUpi] = useState(false);

  const [savedCards] = useState([]);
  const [savedUpi] = useState([]);

  // Generate real-time transactions from enrolled courses
  const transactions = enrolledCourses.map((enrollment, index) => {
    const txnId = `TXN-${(enrollment.id || enrollment._id || String(index)).substring(0, 8).toUpperCase()}`;
    const price = enrollment.course?.price || 0;
    const dateObj = new Date(enrollment.enrolledAt || enrollment.createdAt || Date.now());
    return {
      id: txnId,
      course: enrollment.course?.title || 'Course Enrollment',
      date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      method: price > 0 ? 'UPI / NetBanking' : 'Free / Promo',
      amount: price > 0 ? `₹${price}` : '₹0',
      status: 'Completed',
      month: dateObj.getMonth(),
      year: dateObj.getFullYear()
    };
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalSpent = transactions.reduce((sum, txn) => {
    const amt = parseInt(txn.amount.replace('₹', '')) || 0;
    return sum + amt;
  }, 0);

  const thisMonthSpent = transactions
    .filter(txn => txn.month === currentMonth && txn.year === currentYear)
    .reduce((sum, txn) => sum + (parseInt(txn.amount.replace('₹', '')) || 0), 0);

  const thisMonthCount = transactions.filter(txn => txn.month === currentMonth && txn.year === currentYear).length;

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast.error('Please fill in all card details.');
      return;
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Securely adding your card...',
        success: 'Card added successfully!',
        error: 'Failed to add card.'
      }
    );
    setAddingCard(false);
    setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv('');
  };

  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!upiId) { toast.error('Please enter a valid UPI ID.'); return; }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1200)),
      { loading: 'Verifying UPI ID...', success: `UPI ID ${upiId} linked!`, error: 'Verification failed.' }
    );
    setAddingUpi(false);
    setUpiId('');
  };

  const paymentMethods = [
    { id: 'upi', label: 'UPI Payment', desc: 'Pay via any UPI app instantly', icon: Smartphone, color: 'bg-green-500/10 text-green-600', apps: ['GPay', 'PhonePe', 'Paytm', 'BHIM'] },
    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay accepted', icon: CreditCard, color: 'bg-blue-500/10 text-blue-600' },
    { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banks supported', icon: Building2, color: 'bg-purple-500/10 text-purple-600' },
    { id: 'wallet', label: 'Mobile Wallet', desc: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet, color: 'bg-orange-500/10 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Banner */}
      <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
            <p className="text-indigo-300 text-[10px] mt-1">{transactions.length} courses purchased</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">This Month</p>
            <p className="text-3xl font-bold">₹{thisMonthSpent.toLocaleString()}</p>
            <p className="text-indigo-300 text-[10px] mt-1">{thisMonthCount} courses enrolled</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Saved (Offers)</p>
            <p className="text-3xl font-bold">₹{totalSpent > 0 ? Math.floor(totalSpent * 0.15).toLocaleString() : '0'}</p>
            <p className="text-indigo-300 text-[10px] mt-1">Via promo codes</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: Payment Methods */}
        <div className="lg:col-span-1 space-y-6">
          {/* Saved Cards */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Saved Cards</CardTitle>
                <Button onClick={() => setAddingCard(true)} variant="ghost" size="sm" className="text-[10px] font-bold text-primary hover:bg-primary/10 h-7">
                  + Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {savedCards.map(card => (
                <div key={card.id} className={`rounded-xl p-4 bg-gradient-to-br ${card.color} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{card.type}</span>
                    {card.isDefault && <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm font-mono tracking-widest mb-3">•••• •••• •••• {card.last4}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] opacity-70">Expires {card.expiry}</p>
                    <button onClick={() => toast.success('Set as default payment')} className="text-[9px] font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors">Manage</button>
                  </div>
                </div>
              ))}

              {addingCard && (
                <form onSubmit={handleAddCard} className="space-y-3 border border-border rounded-xl p-4 bg-muted/30">
                  <h5 className="text-xs font-bold text-foreground">Add New Card</h5>
                  <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="Card Number" maxLength={19} className="w-full bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on Card" className="w-full bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                    <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="CVV" maxLength={4} type="password" className="bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddingCard(false)} className="flex-1 text-[10px] h-8 rounded-lg">Cancel</Button>
                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-[10px] h-8 rounded-lg">Save Card</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* UPI IDs */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">UPI IDs</CardTitle>
                <Button onClick={() => setAddingUpi(true)} variant="ghost" size="sm" className="text-[10px] font-bold text-primary hover:bg-primary/10 h-7">+ Add UPI</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {savedUpi.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{u.id_str}</p>
                      <p className="text-[9px] text-muted-foreground">{u.app}</p>
                    </div>
                  </div>
                  {u.isDefault && <span className="text-[9px] font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
                </div>
              ))}
              {addingUpi && (
                <form onSubmit={handleAddUpi} className="space-y-2 border border-border rounded-xl p-3 bg-muted/30">
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. name@upi)" className="w-full bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddingUpi(false)} className="flex-1 text-[10px] h-7 rounded-lg">Cancel</Button>
                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-[10px] h-7 rounded-lg">Verify & Link</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Other Methods */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Other Payment Methods</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group cursor-pointer" onClick={() => toast.info(`${pm.label} will be available at checkout.`)}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pm.color}`}>
                    <pm.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{pm.label}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{pm.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Transaction History */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Transaction History</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast.info('Downloading invoice history...')} className="text-[10px] h-7 font-semibold border-border hover:bg-muted">
                  <Download className="w-3 h-3 mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Transaction ID</th>
                      <th className="text-left py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Course</th>
                      <th className="text-left py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Date</th>
                      <th className="text-left py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Method</th>
                      <th className="text-left py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Amount</th>
                      <th className="text-right py-3 px-5 font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-5 font-mono text-[10px] text-muted-foreground">{txn.id}</td>
                        <td className="py-4 px-5 font-semibold text-foreground max-w-[160px]">
                          <span className="line-clamp-1">{txn.course}</span>
                        </td>
                        <td className="py-4 px-5 text-muted-foreground">{txn.date}</td>
                        <td className="py-4 px-5 text-muted-foreground">{txn.method}</td>
                        <td className="py-4 px-5 font-bold text-foreground">{txn.amount}</td>
                        <td className="py-4 px-5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${txn.statusColor}`}>{txn.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SupportTab = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [tickets, setTickets] = useState([
    { id: 'TKT-1042', subject: 'Calculus course video buffering issue', category: 'Technical Issue', status: 'Resolved', date: 'May 18, 2026' },
    { id: 'TKT-0871', subject: 'Unable to download study material PDF', category: 'Course Content', status: 'Open', date: 'May 24, 2026' },
  ]);

  const problemCategories = ['Technical Issue / Bug', 'Payment / Billing', 'Course Content Issue', 'Live Class Problem', 'Account / Login', 'Feature Request', 'Other'];

  const faqs = [
    { q: 'How do I enroll in a course?', a: "Go to the Explore page, select your desired course, and click 'Enroll Now'. Free courses enroll instantly. Paid courses require payment via UPI, Card, or Wallet." },
    { q: 'Where can I watch recorded classes?', a: "Recorded lectures are available under the 'Recorded Lessons' tab in your student dashboard sidebar." },
    { q: 'How do I submit homework assignments?', a: "Navigate to the 'Assignments' tab, view pending tasks, upload your solution file or add a note, and click Submit." },
    { q: 'Can I receive certificates for free courses?', a: 'Yes! Verified certificates are issued upon completing all video lectures and scoring passing grades on quizzes — even for free courses.' },
    { q: 'What is the refund policy?', a: 'Eduvirse offers a 7-day refund policy for paid courses if you have completed less than 20% of the content. Submit a request under Help & Support.' },
    { q: 'How do I join a live class?', a: "Live classes appear on your dashboard and under the 'Live Classes' tab. Click 'Join Live' to enter the classroom when the session is active." },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message || !category) { toast.error('Please fill in all fields.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setTickets(prev => [{ id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`, subject, category, status: 'Open', date: 'Today' }, ...prev]);
      toast.success('Ticket submitted! Our support team will respond within 24 hours.');
      setSubject(''); setMessage(''); setCategory('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">How can we help you?</h2>
          <p className="text-muted-foreground text-sm max-w-xl">Find answers in our FAQ, or raise a ticket to reach our student success team. We respond within 24 hours.</p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Email Support', desc: 'Avg response: 24 hours', icon: Mail, color: 'bg-blue-500/10 text-blue-600', action: 'support@eduvirse.com', onClick: () => toast.info('Opening email client...') },
          { label: 'Live Chat', desc: 'Available 9 AM – 6 PM IST', icon: MessageCircle, color: 'bg-green-500/10 text-green-600', action: 'Start Chat', onClick: () => toast.info('Connecting to live chat...') },
          { label: 'Community Forum', desc: 'Discuss with fellow students', icon: Globe, color: 'bg-purple-500/10 text-purple-600', action: 'Visit Forums', onClick: () => toast.info('Redirecting to community forums...') },
        ].map((card, idx) => (
          <div key={idx} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 shadow-sm">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">{card.label}</h3>
            <p className="text-[11px] text-muted-foreground mb-4">{card.desc}</p>
            <button onClick={card.onClick} className="text-primary font-bold text-xs hover:underline mt-auto">{card.action}</button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-semibold text-sm ${openFaq === idx ? 'text-primary' : 'text-foreground'}`}>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-primary shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Submission */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-1">Raise a Support Ticket</h3>
            <p className="text-xs text-muted-foreground mb-5">Can't find an answer? Submit a ticket and we'll assist you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Problem Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground">
                  <option value="">Select a category...</option>
                  {problemCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue" className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Please provide as much detail as possible..." rows={4} className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground resize-none" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-11 shadow-md shadow-primary/20 active:scale-95 transition-all">
                {submitting ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Support Ticket</>}
              </Button>
            </form>
          </div>

          {/* Ticket Log */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-sm text-foreground mb-4">My Tickets</h4>
            <div className="space-y-3">
              {tickets.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/50 border border-border">
                  <div>
                    <p className="font-bold text-xs text-foreground">{t.subject}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{t.id} • {t.category} • {t.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.status === 'Resolved' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarTab = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tasks, setTasks] = useState({
    [today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear()]: [
      { id: 't1', text: 'Submit React Assignment', color: 'bg-red-500', time: '11:59 PM' },
      { id: 't2', text: 'Join Live: System Design', color: 'bg-blue-500', time: '10:00 AM' },
    ],
    [(today.getDate() + 3) + '-' + today.getMonth() + '-' + today.getFullYear()]: [
      { id: 't3', text: 'Quiz: JavaScript Advanced', color: 'bg-purple-500', time: '2:00 PM' },
    ],
    [(today.getDate() + 7) + '-' + today.getMonth() + '-' + today.getFullYear()]: [
      { id: 't4', text: 'Calculus Assignment Due', color: 'bg-orange-500', time: '11:59 PM' },
    ],
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskColor, setNewTaskColor] = useState('bg-primary');
  const [showAddTask, setShowAddTask] = useState(false);

  const TASK_COLORS = [
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Red', value: 'bg-red-500' },
    { label: 'Green', value: 'bg-green-500' },
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Indigo', value: 'bg-indigo-500' },
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTaskKey = (d) => `${d}-${month}-${year}`;

  const getTasksForDay = (d) => tasks[getTaskKey(d)] || [];

  const handleDayClick = (d) => {
    setSelectedDate(d);
    setShowAddTask(false);
    setNewTaskText('');
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) { toast.error('Please enter a task description.'); return; }
    const key = getTaskKey(selectedDate);
    const newTask = { id: 't' + Date.now(), text: newTaskText.trim(), color: newTaskColor, time: newTaskTime };
    setTasks(prev => ({ ...prev, [key]: [...(prev[key] || []), newTask] }));
    toast.success('Task scheduled!');
    setNewTaskText('');
    setShowAddTask(false);
  };

  const handleDeleteTask = (day, taskId) => {
    const key = getTaskKey(day);
    setTasks(prev => ({ ...prev, [key]: (prev[key] || []).filter(t => t.id !== taskId) }));
    toast.success('Task removed.');
  };

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => d === selectedDate;

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];
  const selectedDateObj = selectedDate ? new Date(year, month, selectedDate) : null;
  const selectedDateStr = selectedDateObj ? selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h3 className="font-bold text-base text-foreground">{monthNames[month]} {year}</h3>
                <p className="text-[10px] text-muted-foreground">Click any date to view or add tasks</p>
              </div>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="h-16" />;
                  const dayTasks = getTasksForDay(day);
                  const todayDay = isToday(day);
                  const selectedDay = isSelected(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-16 rounded-xl flex flex-col items-start justify-start p-1.5 transition-all duration-200 border text-left ${
                        selectedDay
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                          : todayDay
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-transparent hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className={`text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        todayDay ? 'bg-primary text-primary-foreground' : selectedDay ? 'text-primary' : 'text-foreground'
                      }`}>{day}</span>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayTasks.slice(0, 3).map(t => (
                          <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
                        ))}
                        {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="px-5 pb-4 flex items-center gap-4 flex-wrap">
              {TASK_COLORS.map(c => (
                <div key={c.value} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${c.value}`} />
                  <span className="text-[9px] text-muted-foreground font-semibold">{c.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Day Panel */}
        <div>
          {selectedDate ? (
            <Card className="border-border bg-card shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{selectedDateStr.split(',')[0]}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{selectedDateStr.split(',').slice(1).join(',').trim()}</p>
                  </div>
                  {isToday(selectedDate) && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Today</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {selectedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/50 border border-border group">
                        <div className={`w-2 h-2 rounded-full ${task.color} shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-snug">{task.text}</p>
                          {task.time && <p className="text-[9px] text-muted-foreground mt-0.5">⏰ {task.time}</p>}
                        </div>
                        <button onClick={() => handleDeleteTask(selectedDate, task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No tasks scheduled</p>
                  </div>
                )}

                {/* Add Task */}
                {!showAddTask ? (
                  <Button onClick={() => setShowAddTask(true)} className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Schedule Task
                  </Button>
                ) : (
                  <div className="space-y-3 border border-border rounded-xl p-3 bg-muted/30">
                    <input
                      autoFocus
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                      placeholder="Task description..."
                      className="w-full bg-card border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-foreground"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Time</label>
                        <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="w-full bg-card border border-border text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary text-foreground" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Color</label>
                        <div className="flex gap-1 pt-1">
                          {TASK_COLORS.map(c => (
                            <button key={c.value} onClick={() => setNewTaskColor(c.value)} className={`w-5 h-5 rounded-full ${c.value} transition-all ${newTaskColor === c.value ? 'ring-2 ring-offset-1 ring-foreground scale-110' : 'opacity-70 hover:opacity-100'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddTask(false)} className="flex-1 text-[10px] h-8 rounded-lg border-border">Cancel</Button>
                      <Button onClick={handleAddTask} className="flex-1 bg-primary text-primary-foreground text-[10px] h-8 rounded-lg">Add Task</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card shadow-sm h-full flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-3" />
              <h4 className="font-bold text-sm text-foreground mb-1">Select a Date</h4>
              <p className="text-xs text-muted-foreground">Click on any date in the calendar to view tasks or schedule new activities.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Upcoming Tasks List */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader><CardTitle className="text-sm font-bold">All Upcoming Tasks</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {Object.entries(tasks).flatMap(([key, taskList]) => {
              const [d, m, y] = key.split('-').map(Number);
              const date = new Date(y, m, d);
              return taskList.map(task => ({ ...task, date, dateStr: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), key, d }));
            }).filter(item => item.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).sort((a, b) => a.date - b.date).slice(0, 8).map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.text}</p>
                  <p className="text-[9px] text-muted-foreground">{item.dateStr} {item.time && `• ⏰ ${item.time}`}</p>
                </div>
                <button onClick={() => handleDeleteTask(item.d, item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {Object.values(tasks).flat().length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">No tasks scheduled. Click a date to add one!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
  </label>
);

const SettingsTab = ({ currentUser }) => {
  const { updateProfile } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || null);
  const fileInputRef = useRef(null);
  const [firstName, setFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [bio, setBio] = useState(currentUser?.bio || 'Passionate learner exploring the world of technology and science.');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifLive, setNotifLive] = useState(true);
  const [notifAssign, setNotifAssign] = useState(true);
  const [notifQuiz, setNotifQuiz] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [notifDigest, setNotifDigest] = useState(true);

  const settingsTabs = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) { toast.error('Image too large. Max 800KB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name: `${firstName} ${lastName}`.trim(), bio });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Password updated securely.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Nav */}
        <div className="w-full md:w-56 flex-shrink-0">
          <Card className="border-border bg-card shadow-sm p-2 sticky top-24">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeSettingsTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <Card className="border-border bg-card shadow-sm p-7 min-h-[480px]">

            {/* PROFILE */}
            {activeSettingsTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Public Profile</h2>
                <div className="flex items-center gap-6 mb-7 pb-7 border-b border-border">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-24 h-24 border-4 border-muted shadow-md">
                      <AvatarImage src={avatarPreview || currentUser?.avatar || ''} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{currentUser?.name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div>
                    <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 mb-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-3.5 h-3.5 mr-2" /> Upload New Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 800KB.</p>
                    {avatarPreview && <p className="text-xs text-green-600 font-semibold mt-1">✓ New photo selected</p>}
                  </div>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">First Name</label>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Last Name</label>
                      <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                    <input value={currentUser?.email || ''} disabled className="w-full bg-muted/30 border border-border text-sm rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed" />
                    <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell others about yourself..." className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground resize-none transition-all" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 active:scale-95 transition-all hover:bg-primary/90">
                      {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY */}
            {activeSettingsTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Account Security</h2>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">Use a strong password with at least 8 characters. Avoid using the same password on multiple sites.</p>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min 8 characters" className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Re-enter new password" className="w-full bg-muted/50 border border-border text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all" />
                  </div>
                  <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 active:scale-95 transition-all">
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="text-base font-bold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold" onClick={() => toast.error('Account deletion requested. Our team will contact you within 48 hours.')}>
                    Delete My Account
                  </Button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeSettingsTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground mb-7">Choose what you'd like to be notified about via email and push notifications.</p>
                <div className="space-y-1">
                  {[
                    { label: 'Live Class Reminders', desc: 'Get notified 15 minutes before a live class starts.', state: notifLive, setter: setNotifLive, color: 'bg-blue-500/10 text-blue-600' },
                    { label: 'Assignment Deadlines', desc: 'Receive reminders when assignment due dates are approaching.', state: notifAssign, setter: setNotifAssign, color: 'bg-orange-500/10 text-orange-600' },
                    { label: 'Quiz & Exam Alerts', desc: 'Be notified when new quizzes are posted for your courses.', state: notifQuiz, setter: setNotifQuiz, color: 'bg-purple-500/10 text-purple-600' },
                    { label: 'Weekly Progress Digest', desc: 'A weekly summary of your learning activity and achievements.', state: notifDigest, setter: setNotifDigest, color: 'bg-green-500/10 text-green-600' },
                    { label: 'Promotions & Offers', desc: 'Deals, discount codes, and new course announcements from Eduvirse.', state: notifPromotions, setter: setNotifPromotions, color: 'bg-pink-500/10 text-pink-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/40 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-0.5">{item.label}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch checked={item.state} onChange={() => { item.setter(!item.state); toast.success(`${item.label} ${!item.state ? 'enabled' : 'disabled'}.`); }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};

const StudentDashboardPage = ({ currentUser, logout }) => {
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);

  const [learningStreak, setLearningStreak] = useState(0);
  const [studyTime, setStudyTime] = useState({ total: '0h 0m', data: [0, 0, 0, 0, 0, 0, 0] });

  const [courseProgress, setCourseProgress] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    
    if (currentUser?.id) {
      socket.emit('join_dashboard', currentUser.id);
    } else {
      socket.emit('join_dashboard', null);
    }

    socket.on('new_announcement', (announcement) => {
      toast.info(`New Announcement: ${announcement.title}`);
      setRecentAnnouncements(prev => [{
        title: announcement.title,
        course: announcement.courseTitle || 'Eduvirse Course',
        time: 'Just now',
        icon: '📢',
        color: 'bg-purple-500/10 text-purple-600'
      }, ...prev].slice(0, 5));
    });

    socket.on('live_class_status_change', (course) => {
      toast.success(`${course.title} is now LIVE!`, {
        action: { label: 'Join', onClick: () => navigate(`/live-session/${course.id}`) }
      });
      // Optionally trigger refetch of courses here
    });

    socket.on('new_assignment', (assignment) => {
      toast.info(`New Assignment: ${assignment.title}`);
      setPendingAssignments(prev => [assignment, ...prev].slice(0, 3));
    });

    socket.on('new_quiz', (quiz) => {
      toast.info(`New Quiz: ${quiz.title}`);
      setUpcomingQuizzes(prev => [quiz, ...prev].slice(0, 2));
    });

    socket.on('update_streak', (streak) => {
      setLearningStreak(streak);
    });

    socket.on('update_study_time', (timeData) => {
      setStudyTime(timeData);
    });

    socket.on('update_course_progress', (progressData) => {
      setCourseProgress(progressData);
    });

    return () => socket.disconnect();
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        setLoadingCourses(true);
        const apiEnrollments = await api.getMyEnrollments();
        const apiCourses = apiEnrollments.map(e => {
          if (!e.course) return null;
          let totalLectures = 13; // default fallback
          if (e.course.videos && e.course.videos.length > 0 && e.course.videos[0].url) {
            totalLectures = 1;
          }
          const completed = e.completedLectures ? e.completedLectures.length : 0;
          const progress = Math.round((completed / totalLectures) * 100);
          return { ...e.course, progress, completedLectures: e.completedLectures || [] };
        }).filter(Boolean);
        setEnrolledCourses(apiCourses);
        
        // Update the dashboard widget
        setCourseProgress(apiCourses.map(c => ({
          name: c.title,
          progress: c.progress
        })));
        const allPublished = await api.getCourses({ status: 'published' });
        setPublishedCourses(allPublished || []);
        
        try {
          const apiAnnouncements = await api.getAnnouncements();
          setRecentAnnouncements(apiAnnouncements.map(a => ({
            title: a.title,
            course: a.courseTitle || 'Eduvirse Course',
            time: new Date(a.createdAt).toLocaleDateString(),
            icon: '📢',
            color: 'bg-purple-500/10 text-purple-600'
          })));

          const apiAssignments = await api.getAssignments();
          setPendingAssignments(apiAssignments.map(a => ({
            title: a.title,
            date: `Due ${new Date(a.dueDate).toLocaleDateString()}`,
            color: 'text-indigo-500 bg-indigo-500/10'
          })));

          const apiQuizzes = await api.getQuizzes();
          setUpcomingQuizzes(apiQuizzes.map(q => ({
            title: q.title,
            date: new Date(q.date).toLocaleDateString()
          })));

          const apiAnalytics = await api.getAnalytics();
          if (apiAnalytics) {
            setLearningStreak(apiAnalytics.streak || 0);
            if (apiAnalytics.studyTime) {
              const totalMins = apiAnalytics.studyTime.totalMinutes || 0;
              setStudyTime({
                total: `${Math.floor(totalMins/60)}h ${totalMins%60}m`,
                data: apiAnalytics.studyTime.weeklyData || [0,0,0,0,0,0,0]
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err);
        }
      } catch (err) {
        console.error(err);
        setEnrolledCourses([]);
        setPublishedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchEnrolled();
  }, []);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: BookOpen, label: 'My Courses' },
    { icon: Radio, label: 'Live Classes' },
    { icon: PlaySquare, label: 'Recorded Lessons' },
    { icon: FileText, label: 'Assignments', badge: pendingAssignments.length > 0 ? pendingAssignments.length : undefined },
    { icon: CheckCircle2, label: 'Quizzes & Exams', badge: upcomingQuizzes.length > 0 ? upcomingQuizzes.length : undefined },
    { icon: FolderOpen, label: 'Study Materials' },
    { icon: BarChart3, label: 'Progress' },
    { icon: Bell, label: 'Announcements', badge: recentAnnouncements.length > 0 ? recentAnnouncements.length : undefined },
    { icon: Award, label: 'Certificates' },
    { icon: Calendar, label: 'Calendar' },
    { icon: CreditCard, label: 'Payments' },
    { icon: HelpCircle, label: 'Support' },
    { icon: Settings, label: 'Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'My Courses':
        return <MyCoursesTab enrolledCourses={enrolledCourses} loading={loadingCourses} navigate={navigate} />;
      case 'Live Classes':
        return <LiveClassesTab navigate={navigate} />;
      case 'Recorded Lessons':
        return <RecordedLessonsTab />;
      case 'Assignments':
        return <AssignmentsTab enrolledCourses={enrolledCourses} />;
      case 'Quizzes & Exams':
        return <QuizzesTab enrolledCourses={enrolledCourses} />;
      case 'Study Materials':
        return <StudyMaterialsTab />;
      case 'Calendar':
        return <CalendarTab />;
      case 'Progress':
        return <ProgressTab enrolledCourses={enrolledCourses} />;
      case 'Announcements':
        return <AnnouncementsTab enrolledCourses={enrolledCourses} />;
      case 'Certificates':
        return <CertificatesTab />;
      case 'Payments':
        return <PaymentsTab enrolledCourses={enrolledCourses} />;
      case 'Support':
        return <SupportTab />;
      case 'Settings':
        return <SettingsTab currentUser={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Student Dashboard - Eduvirse</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background font-sans text-foreground transition-colors duration-300">
        <Header />

        <div className="flex flex-1 relative overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-64 bg-card border-r border-border flex flex-col hidden lg:flex fixed top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] z-10 overflow-y-auto transition-colors duration-300 p-6 justify-between">
            <div className="space-y-6">
              {/* Profile short card */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/50">
                <Avatar className="w-9 h-9 border border-border">
                  <AvatarImage src={currentUser?.avatar || ''} />
                  <AvatarFallback className="font-bold text-xs">{currentUser?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate">{currentUser?.name || 'Vishruth'}</h3>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">{currentUser?.role || 'Student'}</p>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                {sidebarLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (link.label === 'Settings') {
                        setIsEditProfileOpen(true);
                      } else {
                        setActiveTab(link.label);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === link.label
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === link.label 
                          ? 'bg-primary-foreground text-primary' 
                          : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-6 pt-6 border-t border-border mt-6">
              {/* Premium upgrade card */}
              <div className="bg-gradient-to-br from-[#5c67f2] to-purple-600 text-white rounded-2xl p-4 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-xs">Upgrade to Premium</span>
                  </div>
                  <p className="text-[9px] text-indigo-100 leading-normal">Unlock all features, interactive quizzes, assignments and premium roadmap classes.</p>
                  <Button onClick={() => navigate('/premium')} className="w-full bg-white text-indigo-600 hover:bg-slate-50 font-bold text-[10px] h-8 rounded-lg shadow-sm border-none">
                    Upgrade Now
                  </Button>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log Out</span>
              </Button>
            </div>
          </aside>

          {/* Main Layout Area */}
          <main className="flex-1 lg:ml-64 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] bg-background text-foreground">
            <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
              {/* Header welcome banner */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {activeTab === 'Dashboard' ? `Welcome back, ${(currentUser?.name || 'Vishruth').split(' ')[0]}! 👋` : activeTab}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {activeTab === 'Dashboard' && "Keep learning and achieving your goals."}
                  {activeTab === 'My Courses' && "Manage and continue your active courses."}
                  {activeTab === 'Live Classes' && "Join live video lectures and chat with educators."}
                  {activeTab === 'Recorded Lessons' && "Rewatch past sessions and lecture materials."}
                  {activeTab === 'Assignments' && "Submit homework and track graded progress."}
                  {activeTab === 'Quizzes & Exams' && "Test your skills and gain certifications."}
                  {activeTab === 'Study Materials' && "Download cheatsheets, PDFs, and code resources."}
                  {activeTab === 'Progress' && "Track your study hours, course completion, and performance."}
                  {activeTab === 'Announcements' && "Latest updates and notifications from the platform."}
                  {activeTab === 'Certificates' && "Download and share your achievements."}
                  {activeTab === 'Payments' && "Manage your payment methods and view transaction history."}
                  {activeTab === 'Support' && "Get assistance, search the FAQ, or raise a support ticket."}
                  {activeTab === 'Calendar' && "Schedule tasks, set reminders, and manage your study plan."}
                  {activeTab === 'Settings' && "Manage your profile, security, and notification preferences."}
                </p>
              </div>

              {activeTab === 'Dashboard' ? (
                <div className="grid lg:grid-cols-4 gap-8">
                  {/* Left Columns (3 columns) */}
                  <div className="lg:col-span-3 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {[
                        { label: 'Enrolled Courses', value: String(enrolledCourses.length), sub: 'Currently learning', icon: '📚', grad: 'from-violet-600 to-purple-700', tab: 'My Courses' },
                        { label: 'Completed', value: '0', sub: 'No completions yet', icon: '🏆', grad: 'from-emerald-500 to-green-600', tab: null },
                        { label: 'Learning Hours', value: '0h', sub: 'Start learning today', icon: '⏱️', grad: 'from-blue-500 to-cyan-600', tab: null },
                        { label: 'Avg. Score', value: '—', sub: 'No quizzes taken', icon: '📊', grad: 'from-orange-500 to-amber-600', tab: null },
                        { label: 'Certificates', value: '0', sub: 'View all →', icon: '🎓', grad: 'from-yellow-500 to-orange-500', tab: 'Certificates' }
                      ].map((stat, idx) => (
                        <button
                          key={idx}
                          onClick={() => stat.tab && setActiveTab(stat.tab)}
                          className={`rounded-2xl p-5 text-left bg-gradient-to-br ${stat.grad} text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-100 group relative overflow-hidden ${stat.tab ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-6 -mt-6"></div>
                          <div className="text-2xl mb-3">{stat.icon}</div>
                          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest line-clamp-1">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                          <p className={`text-[10px] font-semibold mt-2 ${stat.tab ? 'text-white/80 group-hover:text-white underline-offset-2 group-hover:underline' : 'text-white/60'}`}>{stat.sub}</p>
                        </button>
                      ))}
                    </div>

                    {/* Mid Row: Continue Learning & Today's Live */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Continue Learning */}
                      <Card className="border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between p-6">
                        {enrolledCourses && enrolledCourses.length > 0 ? (
                          <>
                            <div>
                              <h4 className="font-bold text-xs text-foreground mb-4">Continue Learning</h4>
                              <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-border shrink-0">
                                  <img src={enrolledCourses[0].course?.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300"} alt="Course" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-xs truncate text-foreground">{enrolledCourses[0].course?.title || 'Course'}</h5>
                                  <p className="text-[10px] text-muted-foreground mt-1">{enrolledCourses[0].progress || 0}% Complete</p>
                                  <Progress value={enrolledCourses[0].progress || 0} className="h-1.5 mt-2 bg-muted" />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                              <Button onClick={() => navigate(`/course/${enrolledCourses[0].course?.id || enrolledCourses[0].course?._id}`)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold h-9 rounded-xl">
                                Continue
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                            <p className="text-sm font-bold text-muted-foreground">You haven't enrolled in any courses yet.</p>
                            <Button onClick={() => navigate('/explore')} variant="outline" className="text-xs">Explore Courses</Button>
                          </div>
                        )}
                      </Card>

                      {/* Today's Live Classes */}
                      <Card className="border-border bg-card shadow-sm p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-xs text-foreground">Today's Live Classes</h4>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                              <span className="text-[9px] font-bold text-red-500">Live</span>
                            </span>
                          </div>
                          <div className="space-y-3">
                            {enrolledCourses && enrolledCourses.filter(e => e.course?.live || e.course?.status === 'published').length > 0 ? (
                              enrolledCourses.filter(e => e.course?.live || e.course?.status === 'published').slice(0, 2).map((enrollment, idx) => {
                                const live = enrollment.course;
                                return (
                                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border">
                                    <div className="flex gap-3 items-center min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                        {live?.title?.charAt(0) || 'L'}
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-xs truncate leading-snug text-foreground">{live?.title}</h5>
                                        <p className="text-[9px] text-muted-foreground truncate">by {live?.instructor?.name || (typeof live?.instructor === 'string' ? live?.instructor : 'Instructor')}</p>
                                      </div>
                                    </div>
                                    <Button onClick={() => navigate(`/live-session/${live.id || live._id}`)} variant="outline" size="sm" className="h-7 rounded-lg text-[9px] font-bold border-primary/30 text-primary hover:bg-primary/10 shrink-0">
                                      Join Live
                                    </Button>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-4">No live classes today.</p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('Live Classes')} className="text-[10px] text-primary hover:underline font-bold text-center block w-full mt-4">
                          View all live classes →
                        </button>
                      </Card>
                    </div>

                    {/* Third Row: assignments, quizzes, streak, study time */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {/* Pending Assignments */}
                      <Card className="border-border bg-card shadow-sm p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-xs text-foreground">Pending Assignments</h4>
                            <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-[9px] font-bold">3</span>
                          </div>
                          <div className="space-y-3">
                            {pendingAssignments.length > 0 ? pendingAssignments.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="space-y-1">
                                <h5 className="font-semibold text-xs truncate leading-snug text-foreground">{item.title}</h5>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${item.color}`}>{item.date}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground text-center py-2">No pending assignments</p>}
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('Assignments')} className="text-[9px] text-primary hover:underline font-bold text-left mt-4 block">
                          View all assignments →
                        </button>
                      </Card>

                      {/* Upcoming Quizzes */}
                      <Card className="border-border bg-card shadow-sm p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-xs text-foreground">Upcoming Quizzes</h4>
                            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[9px] font-bold">2</span>
                          </div>
                          <div className="space-y-3">
                            {upcomingQuizzes.length > 0 ? upcomingQuizzes.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <h5 className="font-semibold text-xs truncate leading-snug text-foreground">{item.title}</h5>
                                <p className="text-[8px] text-muted-foreground">{item.date}</p>
                              </div>
                            )) : <p className="text-xs text-muted-foreground text-center py-2">No upcoming quizzes</p>}
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('Quizzes & Exams')} className="text-[9px] text-primary hover:underline font-bold text-left mt-4 block">
                          View all quizzes →
                        </button>
                      </Card>

                      {/* Learning Streak */}
                      <Card className="border-border bg-card shadow-sm p-4">
                        <h4 className="font-bold text-xs text-foreground mb-2 flex items-center gap-1">🔥 Learning Streak</h4>
                        <div className="text-center my-3">
                          <p className="text-xl font-bold text-foreground">{learningStreak} Days</p>
                          <p className="text-[8px] text-muted-foreground">Keep it up! 🔥</p>
                        </div>
                        <div className="flex justify-between items-center gap-1 mt-4">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <span className="text-[8px] font-semibold text-muted-foreground">{day}</span>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${idx < 5 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {idx < 5 ? '✓' : '•'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Study Time This Week */}
                      <Card className="border-border bg-card shadow-sm p-4">
                        <h4 className="font-bold text-xs text-foreground mb-1">Study Time This Week</h4>
                        <p className="text-lg font-bold text-foreground">{studyTime.total}</p>
                        <div className="flex justify-between items-end h-16 gap-1 mt-4">
                          {studyTime.data.map((mins, idx) => {
                            // Calculate height relative to max (capped at 120 mins = h-12)
                            const maxMins = Math.max(...studyTime.data, 1);
                            const percent = Math.min(mins / maxMins, 1);
                            // height classes from tailwind (1,2,3,4,6,8,10,12)
                            const heightClass = mins === 0 ? 'h-1' : percent > 0.8 ? 'h-12' : percent > 0.6 ? 'h-10' : percent > 0.4 ? 'h-8' : percent > 0.2 ? 'h-6' : 'h-3';
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`w-full bg-primary/20 rounded-t-sm transition-all duration-300 hover:bg-primary/40 ${heightClass} relative group`}>
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {mins}m
                                  </div>
                                </div>
                                <span className="text-[8px] text-muted-foreground font-medium uppercase">{['M','T','W','T','F','S','S'][idx]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </div>

                    {/* Bottom Row: progress overview & recommended courses */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Course Progress Overview */}
                      <Card className="border-border bg-card shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-xs text-foreground">Course Progress Overview</h4>
                          <button onClick={() => setActiveTab('My Courses')} className="text-[9px] text-primary hover:underline font-bold">View all courses →</button>
                        </div>
                        <div className="space-y-4">
                          {enrolledCourses.length > 0 ? enrolledCourses.slice(0, 4).map((enrollment, idx) => (
                             <div key={idx} className="space-y-1">
                               <div className="flex justify-between items-center text-xs">
                                 <span className="font-semibold truncate pr-2 text-foreground">{enrollment.title}</span>
                                 <span className="font-bold text-primary">{enrollment.progress || 0}%</span>
                               </div>
                               <Progress value={enrollment.progress || 0} className="h-1.5 bg-muted" />
                             </div>
                          )) : <p className="text-xs text-muted-foreground">No courses enrolled yet.</p>}
                        </div>
                      </Card>

                      {/* Recommended for You */}
                      <Card className="border-border bg-card shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-xs text-foreground">Recommended for You</h4>
                          <button onClick={() => navigate('/explore')} className="text-[9px] text-primary hover:underline font-bold">View all →</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {publishedCourses.length > 0 ? (
                            [...publishedCourses].reverse().slice(0, 3).map((course, idx) => (
                              <div key={course.id || course._id || idx} onClick={() => navigate(`/course/${course.id || course._id}`)} className="group cursor-pointer space-y-1.5">
                                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border">
                                  <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150'} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                </div>
                                <h5 className="font-bold text-[9px] line-clamp-1 group-hover:text-primary transition-colors text-foreground">{course.title}</h5>
                                <p className="text-[8px] text-muted-foreground truncate">{course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : 'Instructor')}</p>
                                <div className="flex items-center gap-0.5 text-[8px] font-bold text-yellow-500">
                                  ⭐ 4.8
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 text-center py-4">
                              <p className="text-xs text-muted-foreground">No new courses available.</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Right Column (1 column) */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Upcoming Schedule */}
                    <Card className="border-border bg-card shadow-sm p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-foreground">Upcoming Schedule</h4>
                      </div>
                      {(() => {
                        const scheduled = publishedCourses.filter(c => c.scheduleTime && new Date(c.scheduleTime) > new Date());
                        return scheduled.length > 0 ? (
                          <div className="space-y-4">
                            {scheduled.map((course, idx) => (
                              <div key={idx} className="pl-3 border-l-4 border-l-amber-500 space-y-0.5">
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Premiere
                                </span>
                                <h5 className="font-bold text-xs leading-tight text-foreground">{course.title}</h5>
                                <p className="text-[9px] text-muted-foreground">
                                  {new Date(course.scheduleTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {[
                              { time: '10:00 AM', title: 'System Design Basics', type: 'Live Class', color: 'border-l-indigo-500' },
                              { time: '12:00 PM', title: 'Submit Assignment', type: 'React Project', color: 'border-l-emerald-500' },
                              { time: '02:00 PM', title: 'Database Indexing', type: 'Live Class', color: 'border-l-indigo-500' },
                              { time: '04:00 PM', title: 'Quiz: JavaScript Basics', type: 'Due Today', color: 'border-l-red-500' }
                            ].map((sched, idx) => (
                              <div key={idx} className={`pl-3 border-l-4 ${sched.color} space-y-0.5`}>
                                <span className="text-[9px] font-bold text-muted-foreground">{sched.time}</span>
                                <h5 className="font-bold text-xs leading-tight text-foreground">{sched.title}</h5>
                                <p className="text-[9px] text-muted-foreground">{sched.type}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </Card>

                    {/* Recent Announcements */}
                    <Card className="border-border bg-card shadow-sm p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-xs text-foreground">Recent Announcements</h4>
                        <button onClick={() => setActiveTab('Announcements')} className="text-[9px] text-primary hover:underline font-semibold">View all</button>
                      </div>
                      <div className="space-y-4">
                        {recentAnnouncements.length > 0 ? (
                          recentAnnouncements.slice(0, 3).map((anno, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${anno.color}`}>
                                {anno.icon}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs truncate leading-snug text-foreground">{anno.title}</h5>
                                <p className="text-[9px] text-muted-foreground truncate">{anno.course} • {anno.time}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-2 text-center">No recent announcements.</p>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {renderTabContent()}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
};

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const [adminViewMode, setAdminViewMode] = useState('student');

  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === 'admin') {
      setAdminViewMode('student');
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const userRole = currentUser.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isTeacherLike = userRole === 'teacher' || isAdmin;

  const renderDashboard = () => {
    if (isAdmin) {
      return adminViewMode === 'teacher' ? (
        <TeacherDashboard currentUser={currentUser} logout={logout} />
      ) : (
        <StudentDashboardPage currentUser={currentUser} logout={logout} />
      );
    }

    return isTeacherLike ? (
      <TeacherDashboard currentUser={currentUser} logout={logout} />
    ) : (
      <StudentDashboardPage currentUser={currentUser} logout={logout} />
    );
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Eduvirse</title>
      </Helmet>

      {isAdmin && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Admin Mode</p>
              <h1 className="mt-2 text-2xl font-bold text-foreground">Choose Your View</h1>
              <p className="text-sm text-muted-foreground">Switch between student and teacher dashboards while remaining on the same admin account.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${adminViewMode === 'student' ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                onClick={() => setAdminViewMode('student')}
              >
                Student Dashboard
              </button>
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${adminViewMode === 'teacher' ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                onClick={() => setAdminViewMode('teacher')}
              >
                Teacher Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {renderDashboard()}
    </>
  );
};

export default DashboardPage;
