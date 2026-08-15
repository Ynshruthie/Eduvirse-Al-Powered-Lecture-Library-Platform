import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LayoutDashboard, PlaySquare, Radio, Users, BarChart2, DollarSign, Bell, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Search, Filter, Play, Star, Eye, Calendar, Plus, MoreVertical, Edit, Trash2, FileText, MessageSquare, BarChart3, Clock, Sparkles
} from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Live now');
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m ${s}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return <span>{timeLeft}</span>;
};
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';

const TeacherCoursesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [coursesList, setCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef(null);
  const [selectedCourseIdForAi, setSelectedCourseIdForAi] = useState(null);

  const handleGenerateAiSummary = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCourseIdForAi) return;

    try {
      toast.info('Generating AI Summary... This might take a minute.');
      await api.generateLectureSummary(selectedCourseIdForAi, file);
      toast.success('AI Summary generated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to generate AI summary.');
    } finally {
      setSelectedCourseIdForAi(null);
      event.target.value = '';
    }
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses', active: true },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: MessageSquare, label: 'Announcements', path: '/teacher/announcements' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await api.getMyCourses();
        setCoursesList(
          courses.map((course) => {
            const normalizedStatus = String(course.status || 'published');
            const displayStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
            const discountedPrice = course.discountPrice ?? course.price ?? 0;

            return {
              id: course._id || course.id,
              title: course.title,
              category: course.category || 'General',
              views: (course.enrollmentCount || 0).toLocaleString(),
              rating: course.rating ? String(course.rating) : 'New',
              price: discountedPrice > 0 ? `₹${discountedPrice}` : 'Free',
              status: displayStatus,
              date: new Date(course.createdAt || Date.now()).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
              thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=500&q=60',
              enrollments: course.enrollmentCount || 0,
              completionRate: course.enrollmentCount ? 'In progress' : '0%',
              scheduleTime: course.scheduleTime,
            };
          }),
        );
      } catch (error) {
        toast.error(error.message || 'Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleAction = async (action, course) => {
    switch(action) {
      case 'edit':
        toast.success(`Opening editor for ${course.title}`);
        navigate('/upload');
        break;
      case 'analytics':
        toast.success(`Loading analytics for ${course.title}`);
        navigate('/teacher/analytics');
        break;
      case 'delete':
        try {
          await api.deleteCourse(course.id);
          setCoursesList((prev) => prev.filter((item) => item.id !== course.id));
          toast.success(`${course.title} deleted successfully.`);
        } catch (error) {
          toast.error(error.message || 'Failed to delete course.');
        }
        break;
      default:
        break;
    }
  };

  const filteredCourses = coursesList.filter(course => 
    (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'All' || course.status === statusFilter)
  );
  const totalEnrollments = coursesList.reduce((total, course) => total + Number(course.enrollments || 0), 0);
  const totalViews = coursesList.reduce((total, course) => total + Number(course.views || 0), 0);
  const averageRating = coursesList.length
    ? (coursesList.reduce((total, course) => total + (Number(course.rating) || 0), 0) / coursesList.length).toFixed(1)
    : '0.0';


  return (
    <>
      <Helmet>
        <title>My Courses - Eduvirse Dashboard</title>
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
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Instructor'}</h3>
                  <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Educator</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link, index) => (
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
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
          
          {/* Top Header */}
          <TeacherHeader title="My Courses" icon={GraduationCap} />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course Management</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage your uploaded courses, track views, ratings, and student enrollments.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search courses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                        <Filter className="w-4 h-4 mr-2" /> {statusFilter === 'All' ? 'Filter' : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter('All')}>All Courses</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('Published')}>Published</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('Draft')}>Drafts</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('Under Review')}>Under Review</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                         <PlaySquare className="w-5 h-5" />
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Courses</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{coursesList.length}</h3>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                         <Eye className="w-5 h-5" />
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Views</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalViews.toLocaleString()}</h3>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                         <Star className="w-5 h-5" />
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Average Rating</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{averageRating}</h3>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <Users className="w-5 h-5" />
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Enrollments</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalEnrollments.toLocaleString()}</h3>
                 </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Loading courses...</h3>
                  </div>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 hover:-translate-y-1 group">
                      
                      {/* Thumbnail Area */}
                      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                         <img 
                           src={course.thumbnail} 
                           alt={course.title} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                         />
                         
                         {/* Status Badge */}
                         <div className="absolute top-3 left-3">
                           {course.scheduleTime && new Date(course.scheduleTime) > new Date() ? (
                             <Badge variant="outline" className="font-semibold shadow-sm bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center gap-1.5 px-2 py-1">
                               <Clock className="w-3.5 h-3.5" />
                               <CountdownTimer targetDate={course.scheduleTime} />
                             </Badge>
                           ) : (
                             <Badge variant={course.status === 'Published' ? 'default' : (course.status === 'Draft' ? 'secondary' : 'outline')} className={`font-semibold shadow-sm ${course.status === 'Published' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                               {course.status}
                             </Badge>
                           )}
                         </div>
                         
                         {/* Category Badge */}
                         <div className="absolute bottom-3 left-3">
                           <Badge className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-none font-medium text-[10px] px-2 py-0.5">
                             {course.category}
                           </Badge>
                         </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {course.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('edit', course); }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedCourseIdForAi(course.id); fileInputRef.current?.click(); }}>
                                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> Generate AI Summary
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('analytics', course); }}>
                                <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('delete', course); }} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 my-4 mt-auto border-t border-b border-slate-100 dark:border-slate-800 py-4">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Views</span>
                             <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                               <Eye className="w-4 h-4 mr-1.5 text-blue-500" /> {course.views}
                             </div>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rating</span>
                             <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                               <Star className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" /> {course.rating}
                             </div>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Enrollments</span>
                             <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                               <Users className="w-4 h-4 mr-1.5 text-indigo-500" /> {course.enrollments.toLocaleString()}
                             </div>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg Completion</span>
                             <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                               <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> {course.completionRate}
                             </div>
                           </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                           <div className="flex items-center gap-1.5">
                             <Calendar className="w-3.5 h-3.5" /> Uploaded {course.date}
                           </div>
                           <div className="text-slate-900 dark:text-white font-bold text-sm">
                             {course.price}
                           </div>
                        </div>
                        
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                      We couldn't find any courses matching your search. Try adjusting your filters.
                    </p>
                    <Button onClick={() => setSearchQuery('')} variant="outline">Clear Filters</Button>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </main>
      </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="video/mp4,video/webm,video/ogg" 
        className="hidden" 
        onChange={handleGenerateAiSummary} 
      />
    </>
  );
};

export default TeacherCoursesPage;
