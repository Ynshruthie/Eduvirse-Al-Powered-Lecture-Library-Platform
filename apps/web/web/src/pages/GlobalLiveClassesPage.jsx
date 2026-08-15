import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Crown, Heart, Star, Eye, Calendar, Radio, Users, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const GlobalLiveClassesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role?.toLowerCase();
  const isTeacherLike = role === 'teacher' || role === 'admin';

  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    if (currentUser) {
      api.getMyEnrollments()
        .then(enrollments => {
          setEnrolledCourseIds(enrollments.map(e => e.courseId || e.course?.id || e.course?._id));
        })
        .catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchLiveClasses() {
      setIsLoading(true);
      let combined = [];
      try {
        const courses = await api.getCourses({ filter: 'live' });
        combined = [...courses];
      } catch (err) {
        console.warn("API live classes fetch failed:", err);
      }
      try {
        const colorPairs = [
          { color: 'bg-[#5c67f2]', darkColor: 'dark:bg-[#4a54c4]' },
          { color: 'bg-[#f5a623]', darkColor: 'dark:bg-[#d68910]' },
          { color: 'bg-[#2980b9]', darkColor: 'dark:bg-[#1a5276]' },
          { color: 'bg-[#27ae60]', darkColor: 'dark:bg-[#196f3d]' },
          { color: 'bg-[#e74c3c]', darkColor: 'dark:bg-[#922b21]' },
          { color: 'bg-[#16a085]', darkColor: 'dark:bg-[#0e6655]' }
        ];

        const mapped = combined.map((course, idx) => {
          const cPair = colorPairs[idx % colorPairs.length];
          const isLiveNow = course.status === 'published';
          return {
            id: course.id || course._id,
            title: course.title,
            instructor: course.instructor?.name || course.instructor || course.teacherName || 'Unknown',
            date: course.schedule ? `${new Date(course.schedule.startDate).toLocaleDateString()}, ${course.schedule.classTime}` : (isLiveNow ? 'Ongoing Live Session' : 'Scheduled Stream'),
            views: course.enrollmentCount || 0,
            type: course.priceType === 'paid' || course.premium ? 'Premium' : 'Free',
            rating: `${course.rating || '4.8'}`,
            color: cPair.color,
            darkColor: cPair.darkColor,
            img: course.thumbnailUrl || course.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || course.instructor || 'A')}&background=random`,
            status: isLiveNow ? 'Live Now' : 'Upcoming',
            isLive: isLiveNow
          };
        });
        
        setLiveClasses(mapped);
      } catch (err) {
        toast.error('Failed to parse live classes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLiveClasses();
  }, []);

  const handleAction = (item) => {
    if (item.isLive) {
      if (isTeacherLike) {
        toast.success(`Starting live stream for ${item.title}...`);
        navigate(`/live-session/${item.id}`);
      } else {
        const courseId = item.id;
        const isEnrolled = enrolledCourseIds.includes(courseId);

        if (isEnrolled) {
          toast.success("Joining live session...");
          navigate(`/live-session/${courseId}`);
        } else {
          toast.info("Please enroll in this course to join the live session.");
          navigate(`/course/${courseId}`);
        }
      }
    } else {
      toast.success(`Reminder set for ${item.title}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Explore Live Classes - Eduvirse</title>
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden">
        <Header />

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-28 max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 p-8 sm:p-12 rounded-[2rem] border border-indigo-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold tracking-wider mb-6">
                <Radio className="w-4 h-4 animate-pulse" /> LIVE NOW ON EDUVIRSE
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                Learn in Real-Time with <span className="text-indigo-600 dark:text-indigo-400">Top Educators</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8">
                Join thousands of students in interactive live sessions. Ask questions, participate in polls, and master complex topics together.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isTeacherLike && (
                  <Button 
                    onClick={() => navigate('/go-live')} 
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 rounded-xl transition-all duration-300 hover:scale-105 h-12 px-8 text-base border-none"
                  >
                    <Radio className="w-5 h-5 mr-2" /> Start Your Stream
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/schedule')}
                  size="lg"
                  variant={isTeacherLike ? 'outline' : 'default'}
                  className={`${isTeacherLike ? 'border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'} rounded-xl transition-all duration-300 hover:scale-105 h-12 px-8 text-base font-semibold`}
                >
                  Browse Schedule
                </Button>
                <Button 
                  onClick={() => navigate(isTeacherLike ? '/teacher/students' : '/enrollments')}
                  variant="outline"
                  size="lg"
                  className="border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl h-12 px-8 text-base font-semibold transition-all duration-300 hover:scale-105"
                >
                  View My Enrollments
                </Button>
              </div>
            </div>
            
            <div className="relative z-10 hidden md:flex items-center justify-center">
               <div className="w-64 h-64 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                  <Users className="w-24 h-24 text-indigo-400 dark:text-indigo-500 opacity-50" />
               </div>
            </div>
          </div>

          {/* Ongoing Live Classes */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ongoing Live Classes</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {isLoading ? (
                <div className="col-span-full py-12 flex justify-center text-slate-500">Loading live classes...</div>
              ) : liveClasses.filter(item => item.isLive).length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                  <Radio className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active live classes</h4>
                  <p className="text-slate-500 dark:text-slate-400">There are no live streams happening right now. Try checking scheduled classes below.</p>
                </div>
              ) : (
                liveClasses.filter(item => item.isLive).slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleAction(item)}
                    className="w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:border-slate-700 group/card cursor-pointer"
                  >
                    <div className={`relative h-32 ${item.color} ${item.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                      {item.type === 'Premium' && (
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200 shadow-sm transition-transform duration-300 hover:scale-105 z-10">
                          <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" /> Premium
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1 z-10">
                        <Eye className="w-3.5 h-3.5" /> {item.views || 120} Views
                      </div>
                      
                      <img 
                        src={item.img} 
                        alt={item.instructor} 
                        className="w-20 h-20 rounded-full object-cover object-top border-4 border-white dark:border-slate-900 translate-y-6 shadow-lg bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover/card:scale-110 z-0" 
                      />
                    </div>
                    
                    <div className="p-5 pt-8 flex-1 flex flex-col relative z-10 bg-white dark:bg-slate-900 justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider animate-pulse bg-red-600 border-none">
                            ● LIVE
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> {item.rating}
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors">
                          {item.title}
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          By {item.instructor}
                        </p>
                        
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> Ongoing Live Session
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                          className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold h-9 text-xs transition-all duration-300 active:scale-95 border-none shadow-md shadow-red-500/20"
                        >
                          <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> {isTeacherLike ? 'Start Live' : 'Join Live Class'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Scheduled Classes */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Scheduled Classes</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {isLoading ? (
                <div className="col-span-full py-12 flex justify-center text-slate-500">Loading live classes...</div>
              ) : liveClasses.filter(item => !item.isLive).length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                  <Calendar className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No upcoming scheduled classes</h4>
                  <p className="text-slate-500 dark:text-slate-400">There are no upcoming sessions scheduled at the moment.</p>
                </div>
              ) : (
                liveClasses.filter(item => !item.isLive).slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleAction(item)}
                    className="w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:border-slate-700 group/card cursor-pointer"
                  >
                    <div className={`relative h-32 ${item.color} ${item.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                      {item.type === 'Premium' && (
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200 shadow-sm transition-transform duration-300 hover:scale-105 z-10">
                          <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Premium
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1 z-10">
                        <Eye className="w-3.5 h-3.5" /> {item.views} Views
                      </div>
                      
                      <img 
                        src={item.img} 
                        alt={item.instructor} 
                        className="w-20 h-20 rounded-full object-cover object-top border-4 border-white dark:border-slate-900 translate-y-6 shadow-lg bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover/card:scale-110 z-0" 
                      />
                    </div>
                    
                    <div className="p-5 pt-8 flex-1 flex flex-col relative z-10 bg-white dark:bg-slate-900 justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                            Upcoming
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> {item.rating}
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors">
                          {item.title}
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          By {item.instructor}
                        </p>
                        
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {item.date}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                          variant="outline"
                          className="w-full rounded-xl border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 font-semibold h-9 text-xs transition-all duration-300 active:scale-95"
                        >
                          <Radio className="w-3.5 h-3.5 mr-1.5" /> Remind Me
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </main>
        <Footer />
      </div>
    </>
  );
};

export default GlobalLiveClassesPage;
