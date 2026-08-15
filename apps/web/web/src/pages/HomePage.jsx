import React, { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, CheckCircle2, ChevronRight, Crown, Heart, Home, Plus, BookOpen, User, Star, ChevronLeft, Search, Users, Video, Eye, Calendar, Radio, Clock } from 'lucide-react';
import Header from '@/components/Header.jsx';
import EditProfileModal from '@/components/EditProfileModal.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const role = currentUser?.role?.toLowerCase();
  const isTeacherLike = role === 'teacher' || role === 'admin';
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const continueWatchingRef = useRef(null);
  const ongoingLiveRef = useRef(null);
  const trendingRef = useRef(null);
  const premiumRef = useRef(null);
  const topEducatorsRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      api.getMyEnrollments()
        .then(enrollments => {
          setEnrolledCourseIds(enrollments.map(e => e.courseId || e.course?.id || e.course?._id));
        })
        .catch(console.error);
    }
  }, [currentUser]);

  const handleLiveCardClick = (item) => {
    const courseId = item._id || item.id;
    if (isTeacherLike) {
      toast.success(`Starting live stream for ${item.title}...`);
      navigate(`/live-session/${courseId}`);
      return;
    }
    const isEnrolled = enrolledCourseIds.includes(courseId);

    if (isEnrolled) {
      toast.success("Joining live session...");
      navigate(`/live-session/${courseId}`);
    } else {
      toast.info("Please enroll in this course to join the live session.");
      navigate(`/course/${courseId}`);
    }
  };

  useEffect(() => {
    api.getCourses({ status: 'published' })
      .then(data => {
        const fetched = (data || []).filter(c => (c.videoUrl && c.videoUrl.trim() !== '') || (c.videos && c.videos.length > 0));
        setCourses(fetched.reverse());
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const featuredAds = [
    {
      label: "Featured Lecture",
      title: "Master Mathematics\nthe Smart Way",
      subtitle: "Complete Guide to Algebra for Beginners",
      author: "Ankit Sharma Sir",
      authorImg: "/assets/teacher_2.png",
      image: "https://img.freepik.com/premium-psd/3d-cartoon-boy-sitting-with-laptop-transparent-background_843260-3135.jpg",
      bgClass: "bg-[#f5f5ff] dark:bg-slate-900/50",
      buttonClass: "bg-[#5c67f2] hover:bg-[#4a54c4] shadow-indigo-500/30 dark:shadow-indigo-900/20",
      accent: "text-[#6366f1] dark:text-indigo-400"
    },
    {
      label: "New Course",
      title: "Advanced Physics\nCrash Course",
      subtitle: "Ace your exams with interactive physics labs",
      author: "Priya Ma'am",
      authorImg: "/assets/teacher_1.png",
      image: "https://img.freepik.com/premium-psd/3d-cartoon-boy-sitting-with-laptop-transparent-background_843260-3135.jpg",
      bgClass: "bg-orange-50 dark:bg-orange-950/20",
      buttonClass: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 dark:shadow-orange-900/20",
      accent: "text-orange-600 dark:text-orange-400"
    },
    {
      label: "Bestseller",
      title: "Complete Web\nDevelopment",
      subtitle: "From HTML to React, build real projects",
      author: "Rahul Dev",
      authorImg: "/assets/teacher_2.png",
      image: "https://img.freepik.com/premium-psd/3d-cartoon-boy-sitting-with-laptop-transparent-background_843260-3135.jpg",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
      buttonClass: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 dark:shadow-emerald-900/20",
      accent: "text-emerald-600 dark:text-emerald-400"
    },
    {
      label: "Trending Now",
      title: "Data Science\n& Machine Learning",
      subtitle: "Master Python and build predictive models",
      author: "Amit Sir",
      authorImg: "/assets/teacher_2.png",
      image: "https://img.freepik.com/premium-psd/3d-cartoon-boy-sitting-with-laptop-transparent-background_843260-3135.jpg",
      bgClass: "bg-blue-50 dark:bg-blue-950/20",
      buttonClass: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 dark:shadow-blue-900/20",
      accent: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Special Offer",
      title: "English Speaking\nFluency",
      subtitle: "Speak confidently in 30 days. 50% Off!",
      author: "Sarah Jones",
      authorImg: "/assets/teacher_3.png",
      image: "https://img.freepik.com/premium-psd/3d-cartoon-boy-sitting-with-laptop-transparent-background_843260-3135.jpg",
      bgClass: "bg-purple-50 dark:bg-purple-950/20",
      buttonClass: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/30 dark:shadow-purple-900/20",
      accent: "text-purple-600 dark:text-purple-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % featuredAds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>Eduvirse - Unlock Your Potential With Online Learning</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
        <Header />
        
        <main className="flex-1 w-full px-2 sm:px-4 lg:px-8 py-6 space-y-8 pb-28">
          
          {/* Featured Carousel */}
          <div className={`rounded-[1.5rem] p-6 md:p-10 flex flex-col-reverse md:flex-row items-center justify-between relative overflow-hidden transition-all duration-700 ease-in-out border border-transparent dark:border-slate-800 ${featuredAds[currentAdIndex].bgClass}`}>
            <div className="z-10 mt-6 md:mt-0 max-w-lg transition-all duration-500" key={`text-${currentAdIndex}`}>
              <p className={`${featuredAds[currentAdIndex].accent} text-[10px] font-bold tracking-wider mb-2 uppercase animate-in fade-in slide-in-from-bottom-2 duration-500`}>{featuredAds[currentAdIndex].label}</p>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight transition-colors whitespace-pre-line animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">{featuredAds[currentAdIndex].title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 font-medium transition-colors animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">{featuredAds[currentAdIndex].subtitle}</p>
              <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
                <Avatar className="w-6 h-6 ring-2 ring-white dark:ring-slate-800">
                  <AvatarImage src={featuredAds[currentAdIndex].authorImg} />
                  <AvatarFallback>{featuredAds[currentAdIndex].author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  By {featuredAds[currentAdIndex].author} <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-blue-600/20 dark:fill-blue-400/20" />
                </div>
              </div>
              <Button className={`${featuredAds[currentAdIndex].buttonClass} text-white rounded-xl px-5 py-5 text-sm font-semibold shadow-lg transition-all duration-300 ease-in-out active:scale-95 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-500`}>
                Watch Now <Play className="w-3 h-3 ml-2 fill-current" />
              </Button>
            </div>
            <div className="relative w-full md:w-[40%] h-[200px] md:h-[260px]" key={`img-${currentAdIndex}`}>
              <img src={featuredAds[currentAdIndex].image} alt="Student studying" className="w-full h-full object-contain absolute z-10 scale-125 md:scale-150 origin-bottom transition-all duration-700 animate-in fade-in zoom-in-95" />
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl z-0 border-2 border-white/60 dark:border-slate-700/50 shadow-lg overflow-hidden hidden md:block transition-colors animate-in fade-in duration-700">
                 <div className="absolute top-3 left-4 text-slate-500 dark:text-slate-400 text-xs opacity-60">a² + b² = c²</div>
                 <div className="absolute top-12 right-6 text-slate-500 dark:text-slate-400 text-xs opacity-60">y = mx + b</div>
                 <svg className="absolute top-1/2 left-6 w-16 h-16 opacity-40 text-slate-500 dark:text-slate-400" viewBox="0 0 100 100"><polygon points="10,90 90,90 50,10" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                 <div className="absolute bottom-8 right-8 opacity-40"><BookOpen className="w-12 h-12 text-blue-500" /></div>
                 <div className="absolute top-1/2 right-1/4 opacity-30"><Star className="w-8 h-8 text-yellow-500" /></div>
                 <div className="absolute bottom-4 left-1/3 opacity-30"><Crown className="w-10 h-10 text-amber-500" /></div>
                 <img src="https://cdn-icons-png.flaticon.com/512/1126/1126012.png" className="absolute top-4 left-1/2 w-8 h-8 opacity-40" alt="react" />
                 <img src="https://cdn-icons-png.flaticon.com/512/732/732212.png" className="absolute bottom-12 left-1/4 w-10 h-10 opacity-30" alt="html" />
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {featuredAds.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentAdIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentAdIndex ? 'bg-indigo-600 dark:bg-indigo-400 w-6' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Premieres */}
          {!isTeacherLike && courses.some(c => c.scheduleTime && new Date(c.scheduleTime) > new Date()) && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Upcoming Premieres
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {courses.filter(c => c.scheduleTime && new Date(c.scheduleTime) > new Date()).slice(0, 9).map((item, i) => (
                  <div key={i} onClick={() => navigate(`/course/${item._id || item.id}/learn`)} className="min-w-[220px] max-w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 cursor-pointer group/card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md dark:hover:border-slate-700 active:scale-95">
                    <div className="relative h-28">
                      <img src={item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                      
                      <div className="absolute top-2 left-2 z-20">
                        <Badge variant="outline" className="font-semibold shadow-sm bg-amber-500 text-white border-none flex items-center gap-1.5 px-1.5 py-0.5 text-[9px]">
                           <Clock className="w-2.5 h-2.5" />
                           <CountdownTimer targetDate={item.scheduleTime} />
                        </Badge>
                      </div>

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 truncate group-hover/card:text-[#6366f1] dark:group-hover/card:text-indigo-400 transition-colors">{item.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="truncate pr-2">{item.subject || item.classLevel || 'General'}</span>
                        <span className="flex-shrink-0 capitalize">{item.priceType === 'free' ? 'Free' : `₹${item.discountPrice || item.price || 0}`}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Watching */}
          {!isTeacherLike && (
            <div>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Continue Watching</h3>
                <a href="#" className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center hover:underline transition-all duration-300 ease-in-out active:scale-95 hover:-translate-y-0.5">View all <ChevronRight className="w-3 h-3 ml-1" /></a>
              </div>
              <div className="relative group">
                <button onClick={() => scroll(continueWatchingRef, 'left')} className="absolute left-1 top-[45%] -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div ref={continueWatchingRef} className="flex gap-3 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {loadingCourses ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="min-w-[220px] max-w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-pulse">
                        <div className="h-28 bg-slate-200 dark:bg-slate-800" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : courses.filter(c => !(c.scheduleTime && new Date(c.scheduleTime) > new Date())).slice(0, 9).map((item, i) => (
                    <div key={i} onClick={() => navigate(`/course/${item._id || item.id}/learn`)} className="min-w-[220px] max-w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 cursor-pointer group/card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md dark:hover:border-slate-700 active:scale-95">
                      <div className="relative h-28">
                        <img src={item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                        
                        {item.scheduleTime && new Date(item.scheduleTime) > new Date() && (
                          <div className="absolute top-2 left-2 z-20">
                            <Badge variant="outline" className="font-semibold shadow-sm bg-amber-500 text-white border-none flex items-center gap-1.5 px-1.5 py-0.5 text-[9px]">
                               <Clock className="w-2.5 h-2.5" />
                               <CountdownTimer targetDate={item.scheduleTime} />
                            </Badge>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 truncate group-hover/card:text-[#6366f1] dark:group-hover/card:text-indigo-400 transition-colors">{item.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="truncate pr-2">{item.subject || item.classLevel || 'General'}</span>
                          <span className="flex-shrink-0 capitalize">{item.priceType === 'free' ? 'Free' : `₹${item.discountPrice || item.price || 0}`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => scroll(continueWatchingRef, 'right')} className="absolute right-1 top-[45%] -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}



          {/* Live Classes */}
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Live Classes</h3>
              </div>
              <Button variant="link" className="text-blue-600 dark:text-blue-400 text-xs font-semibold p-0 flex items-center hover:underline" onClick={() => navigate('/live')}>
                View all <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="relative group">
              <button onClick={() => scroll(ongoingLiveRef, 'left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div ref={ongoingLiveRef} className="flex gap-4 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loadingCourses ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="min-w-[280px] max-w-[280px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-pulse">
                      <div className="h-32 bg-slate-200 dark:bg-slate-800" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : courses.filter(c => c.live).length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full py-10 text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-slate-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No live classes right now</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Check back later or view the scheduled roadmap.</p>
                  </div>
                ) : (
                  courses.filter(c => c.live).slice(0, 9).map((item, i) => {
                    const colorPairs = [
                      { color: 'bg-[#5c67f2]', darkColor: 'dark:bg-[#4a54c4]' },
                      { color: 'bg-[#f5a623]', darkColor: 'dark:bg-[#d68910]' },
                      { color: 'bg-[#2980b9]', darkColor: 'dark:bg-[#1a5276]' },
                      { color: 'bg-[#27ae60]', darkColor: 'dark:bg-[#196f3d]' },
                      { color: 'bg-[#e74c3c]', darkColor: 'dark:bg-[#922b21]' }
                    ];
                    const cPair = colorPairs[i % colorPairs.length];
                    const isLive = item.status === 'published';
                    const dateDisplay = isLive ? 'Ongoing Live Session' : 'Scheduled Stream';
                    
                    return (
                      <div 
                        key={item._id || item.id} 
                        onClick={() => handleLiveCardClick(item)}
                        className="min-w-[280px] max-w-[280px] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:border-slate-700 group/card cursor-pointer"
                      >
                        <div className={`relative h-32 ${cPair.color} ${cPair.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                          {item.priceType === 'paid' && (
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200 shadow-sm transition-transform duration-300 hover:scale-105">
                              <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" /> Premium
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold px-2 py-1 rounded flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {item.enrollmentCount || 100} Views
                          </div>
                          <img 
                            src={item.instructorImage || item.teacherAvatar || 'https://i.pravatar.cc/150?u=teacher'} 
                            alt={item.instructor?.name || item.instructor || item.teacherName} 
                            className="w-20 h-20 rounded-full object-cover object-top border-4 border-white dark:border-slate-900 translate-y-6 shadow-lg bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover/card:scale-110" 
                          />
                        </div>
                        
                        <div className="p-5 pt-8 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant={isLive ? 'destructive' : 'secondary'} className={`text-[10px] uppercase font-bold tracking-wider ${isLive ? 'animate-pulse bg-red-600' : ''}`}>
                                {isLive ? '● LIVE' : 'Upcoming'}
                              </Badge>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> {item.rating || '4.8'}
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors">
                              {item.title}
                            </h4>
                            
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                              By {item.instructor?.name || item.instructor || item.teacherName || 'Instructor'}
                            </p>
                            
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5" /> {dateDisplay}
                            </p>
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              variant={isLive ? 'default' : 'outline'}
                              className={`w-full rounded-xl font-semibold h-9 text-xs transition-all duration-300 active:scale-95 border-none ${
                                isLive 
                                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20' 
                                  : 'border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300'
                              }`}
                            >
                              {isLive ? (
                                <><Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> {isTeacherLike ? 'Start Live' : 'Join Live Class'}</>
                              ) : (
                                <><Radio className="w-3.5 h-3.5 mr-1.5" /> Remind Me</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button onClick={() => scroll(ongoingLiveRef, 'right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trending Lectures */}
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Trending Lectures</h3>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center hover:underline transition-all duration-300 ease-in-out active:scale-95 hover:-translate-y-0.5">View all <ChevronRight className="w-3 h-3 ml-1" /></a>
            </div>
            <div className="relative group">
              <button onClick={() => scroll(trendingRef, 'left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div ref={trendingRef} className="flex gap-3 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loadingCourses ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="min-w-[180px] max-w-[180px] flex-shrink-0 animate-pulse">
                      <div className="h-[100px] rounded-lg bg-slate-200 dark:bg-slate-800 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-1" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ))
                ) : courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full py-10 text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Video className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No videos yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Upload a lecture to get started.</p>
                  </div>
                ) : (
                  (() => {
                    const seenCategories = new Set();
                    const filtered = [];
                    const reversed = [...courses].reverse();
                    for (const c of reversed) {
                      const cat = c.category || c.subject || 'General';
                      if (!seenCategories.has(cat)) {
                        seenCategories.add(cat);
                        filtered.push(c);
                        if (filtered.length === 9) break;
                      }
                    }
                    return filtered;
                  })().map((item, i) => (
                    <div key={i} onClick={() => navigate(`/course/${item._id || item.id}`)} className="min-w-[180px] max-w-[180px] flex-shrink-0 group/card cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95">
                      <div className="relative h-[100px] rounded-lg overflow-hidden mb-2 shadow-sm group-hover/card:shadow-md transition-shadow">
                        <img src={item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-0.5 leading-tight group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <span className="truncate">{item.subject || item.classLevel || 'General'}</span> <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 fill-blue-600/20 dark:fill-blue-400/20 flex-shrink-0" />
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button onClick={() => scroll(trendingRef, 'right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Premium Courses */}
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-lg transition-transform duration-300 hover:scale-125 cursor-pointer drop-shadow-sm">👑</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight transition-colors">Premium Courses</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium transition-colors">Exclusive courses by top educators</p>
                </div>
              </div>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center hover:underline transition-all duration-300 ease-in-out active:scale-95 hover:-translate-y-0.5">View all <ChevronRight className="w-3 h-3 ml-1" /></a>
            </div>
            <div className="relative group">
              <button onClick={() => scroll(premiumRef, 'left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div ref={premiumRef} className="flex gap-3 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {courses.filter(c => c.priceType === 'paid').slice(0, 9).map((item, i) => {
                  return (
                    <div key={i} onClick={() => navigate(`/course/${item._id || item.id}`)} className="min-w-[200px] max-w-[200px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-md dark:hover:border-slate-700 group/card cursor-pointer">
                      <div className="relative h-32 rounded-lg overflow-hidden mb-3 shadow-sm group-hover/card:shadow-md transition-shadow">
                        <img src={item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" /> PRO
                        </div>
                        <button className="absolute top-2 right-2 text-white/70 hover:text-white transition-all duration-300 active:scale-75 hover:scale-110">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[32px] group-hover/card:text-[#6366f1] dark:group-hover/card:text-indigo-400 transition-colors">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 transition-colors">{item.subject || item.classLevel || 'General'}</p>
                        <div className="mt-auto">
                          <div className="flex items-end gap-1.5 mb-2.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white transition-colors">₹{item.discountPrice || item.price || 0}</span>
                            {item.discountPrice && item.price && <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through mb-0.5 transition-colors">₹{item.price}</span>}
                          </div>
                          <Button variant="outline" className="w-full rounded-lg border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold h-7 text-[10px] transition-all duration-300 active:scale-95">
                            View Course
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => scroll(premiumRef, 'right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Top Educators */}
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Top Educators</h3>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center hover:underline transition-all duration-300 ease-in-out active:scale-95 hover:-translate-y-0.5">View all <ChevronRight className="w-3 h-3 ml-1" /></a>
            </div>
            <div className="relative group">
              <button onClick={() => scroll(topEducatorsRef, 'left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div ref={topEducatorsRef} className="flex gap-3 overflow-x-auto pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {Array.from(new Map(courses.filter(c => c.teacherName || c.teacherId).map(c => [c.teacherId || c.teacherName, c])).values()).map((item, i) => (
                  <div key={i} className="min-w-[160px] max-w-[160px] flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center gap-2 cursor-pointer hover:border-blue-200 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 group/card">
                    <img src={item.teacherAvatar || `https://i.pravatar.cc/150?u=${item.teacherId || i}`} alt={item.teacherName} className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800 transition-transform duration-300 group-hover/card:scale-110" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-[11px] text-slate-900 dark:text-slate-100 flex items-center gap-1 truncate group-hover/card:text-blue-600 dark:group-hover/card:text-indigo-400 transition-colors">
                        <span className="truncate">{item.teacherName || 'Educator'}</span> <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 fill-blue-600/20 dark:fill-blue-400/20 flex-shrink-0" />
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium my-0.5 truncate transition-colors">{item.subject || item.classLevel || 'Educator'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => scroll(topEducatorsRef, 'right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex justify-between items-center z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] dark:shadow-none pb-safe rounded-t-2xl md:max-w-4xl lg:max-w-[90%] md:mx-auto md:mb-4 md:rounded-full md:border transition-colors duration-300">
          <button className="flex flex-col items-center gap-1 text-[#6366f1] dark:text-indigo-400 group transition-all duration-300 ease-in-out active:scale-90 hover:-translate-y-0.5">
            <Home className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold text-[#6366f1] dark:text-indigo-400 transition-colors">Home</span>
          </button>
          <button onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); setTimeout(() => document.querySelector('header input')?.focus(), 300); }} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5">
            <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">Search</span>
          </button>
          <div className="relative -top-5">
            <button onClick={() => isTeacherLike ? navigate('/create') : navigate('/categories')} className="w-12 h-12 bg-[#5c67f2] dark:bg-[#4a54c4] rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 dark:shadow-indigo-900/40 hover:scale-110 transition-all duration-300 active:scale-90 border-4 border-white dark:border-slate-900 hover:bg-[#4a54c4] dark:hover:bg-[#3d45a5]">
              <Plus className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
            </button>
          </div>
          <button onClick={() => navigate(isTeacherLike ? '/teacher/courses' : '/dashboard')} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5">
            <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">{isTeacherLike ? 'My Course' : 'My Learning'}</span>
          </button>
          <button onClick={() => setIsEditProfileOpen(true)} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5">
            <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">Profile</span>
          </button>
        </div>

        <EditProfileModal 
          isOpen={isEditProfileOpen} 
          onClose={() => setIsEditProfileOpen(false)} 
        />
      </div>
    </>
  );
};

export default HomePage;