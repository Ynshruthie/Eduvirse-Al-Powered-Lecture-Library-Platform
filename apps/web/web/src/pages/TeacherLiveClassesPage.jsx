import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LayoutDashboard, PlaySquare, Radio, Users, BarChart2, DollarSign, Bell, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Play, Crown, Heart, Star, Eye, Calendar, Plus, Video, FileText, MessageSquare, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import Header from '@/components/Header';
import TeacherHeader from '@/components/TeacherHeader';

const TeacherLiveClassesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [pastClasses, setPastClasses] = useState([]);
  
  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes', active: true },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];



  useEffect(() => {
    const loadLiveCourses = async () => {
      try {
        const courses = await api.getMyCourses();
        const liveCourses = courses.filter((course) => course.live);
        const mapped = liveCourses.map((course) => ({
          id: course._id || course.id,
          title: course.title,
          instructor: currentUser?.name || 'Instructor',
          date: `${course.schedule?.startDate || 'TBD'}, ${course.schedule?.classTime || 'TBD'}`,
          views: String(course.enrollmentCount || 0),
          type: course.premium ? 'Premium' : 'Free',
          rating: course.rating ? String(course.rating) : 'New',
          color: 'bg-[#5c67f2]',
          darkColor: 'dark:bg-[#4a54c4]',
          img: course.thumbnail || currentUser?.avatar || 'https://i.pravatar.cc/300?img=11',
          status: course.status === 'draft' ? 'Scheduled' : 'Upcoming',
        }));

        setUpcomingClasses(mapped);
        
        let allPast = [];
        liveCourses.forEach(course => {
          if (course.pastRecordings && course.pastRecordings.length > 0) {
            course.pastRecordings.forEach(pr => {
              allPast.push({
                id: pr.id,
                title: pr.title || `${course.title} - Recording`,
                instructor: currentUser?.name || 'Instructor',
                date: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : 'Recently Added',
                views: String(course.enrollmentCount || 0),
                type: course.premium ? 'Premium' : 'Free',
                rating: course.rating ? String(course.rating) : 'N/A',
                color: 'bg-slate-600',
                darkColor: 'dark:bg-slate-700',
                img: course.thumbnail || currentUser?.avatar || 'https://i.pravatar.cc/300?img=11',
                status: 'Recorded',
                url: pr.videoUrl
              });
            });
          }
        });
        setPastClasses(allPast);
      } catch (_error) {
        setUpcomingClasses([]);
        setPastClasses([]);
      }
    };

    loadLiveCourses();
  }, [currentUser?.avatar, currentUser?.name]);

  const handleStartStream = (courseId, title) => {
    toast.success(`Starting stream for: ${title}`);
    navigate(`/live-session/${courseId}`);
  };

  const renderClassCard = (item, isPast = false) => (
    <div key={item.id} className="min-w-[280px] sm:min-w-0 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:border-slate-600 group/card">
      <div className={`relative h-32 ${item.color} ${item.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
        {item.type === 'Premium' && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200 shadow-sm transition-transform duration-300 hover:scale-105">
            <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Premium
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" /> {item.views} Views
        </div>
        <img src={item.img} alt={item.instructor} className="w-20 h-20 rounded-full object-cover object-top border-4 border-white dark:border-slate-900 translate-y-6 shadow-lg bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover/card:scale-110" />
      </div>
      
      <div className="p-5 pt-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={item.status === 'Completed' ? 'secondary' : 'default'} className={`text-[10px] ${item.status === 'Upcoming' ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}>
            {item.status}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> {item.rating}
          </div>
        </div>
        
        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors">
          {item.title}
        </h4>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {item.date}
        </p>
        
        <div className="mt-auto pt-4">
          {!isPast ? (
            <Button 
              onClick={() => handleStartStream(item.id, item.title)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 text-sm transition-all duration-300 active:scale-95 shadow-md shadow-indigo-500/20"
            >
              <Video className="w-4 h-4 mr-2" /> Start Stream
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => { toast.success('Opening recording analytics...'); }}
              className="w-full rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold h-10 text-sm transition-all duration-300 active:scale-95"
            >
              <BarChart2 className="w-4 h-4 mr-2" /> View Analytics
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Manage Live Classes - Eduvirse</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
        <Header />
        
        <div className="flex flex-1 relative">
        {/* Left Sidebar (Only visible on lg screens) */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex fixed top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] z-10 overflow-y-auto transition-colors duration-300">
          <div className="p-6">


            <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={currentUser?.avatar || "https://i.pravatar.cc/150?img=11"} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || 'T'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:white truncate">{currentUser?.name || 'Aman Verma'}</h3>
                  <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.headline || 'Educator'}</p>
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
                            className={`block py-1.5 text-sm transition-colors ${sub.active ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
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
          <TeacherHeader title="Live Classes" icon={Radio}>
            <Button onClick={() => navigate('/go-live')} className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg h-9 hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" /> New Stream
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          </TeacherHeader>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-10">
              
              {/* Header & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Manage Your <span className="text-indigo-600 dark:text-indigo-400">Live Classes</span>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
                    View your upcoming schedules, start streams, and analyze past class performances including free and subscribed viewer metrics.
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate('/go-live')} 
                  size="lg"
                  className="relative z-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Radio className="w-5 h-5 mr-2 animate-pulse" /> Go Live Now
                </Button>
              </div>

              {/* Upcoming & Recent Live Classes */}
              <div>
                 <div className="flex items-center gap-2 mb-6">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming & Scheduled</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {upcomingClasses.length > 0 ? upcomingClasses.map(item => renderClassCard(item, false)) : (
                      <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <Radio className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No upcoming classes</h4>
                        <p className="text-slate-500 dark:text-slate-400">Schedule your first live class to connect with students in real-time.</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Past Live Classes */}
              <div>
                 <div className="flex items-center gap-2 mb-6">
                    <PlaySquare className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Past Classes & Recordings</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pastClasses.length > 0 ? pastClasses.map(item => renderClassCard(item, true)) : (
                      <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <PlaySquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No past classes yet</h4>
                        <p className="text-slate-500 dark:text-slate-400">Your completed live sessions will appear here.</p>
                      </div>
                    )}
                 </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
  );
};

export default TeacherLiveClassesPage;
