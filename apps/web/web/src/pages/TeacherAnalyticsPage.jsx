import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api.js';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import {
  LayoutDashboard, Radio, Users, BarChart2, DollarSign, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Bell, MessageSquare, 
  Eye, TrendingUp, Target, Plus, Video, Star, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';

const staticPerformanceData = [
  { name: 'Jan', views: 1200, enrollments: 80, comments: 12 },
  { name: 'Feb', views: 1900, enrollments: 120, comments: 25 },
  { name: 'Mar', views: 1500, enrollments: 95, comments: 18 },
  { name: 'Apr', views: 2200, enrollments: 140, comments: 32 },
  { name: 'May', views: 2800, enrollments: 190, comments: 45 },
  { name: 'Jun', views: 3500, enrollments: 250, comments: 60 },
  { name: 'Jul', views: 4100, enrollments: 310, comments: 75 },
];

const videoAnalytics = [
  { id: 1, title: 'Introduction to Web Development', views: 12450, enrollments: 820, comments: 145, rating: 4.8 },
  { id: 2, title: 'Advanced CSS Techniques', views: 8320, enrollments: 490, comments: 88, rating: 4.6 },
  { id: 3, title: 'JavaScript ES6+ Deep Dive', views: 15600, enrollments: 1210, comments: 289, rating: 4.9 },
  { id: 4, title: 'React Hooks Masterclass', views: 9800, enrollments: 650, comments: 162, rating: 4.7 }
];

const TeacherAnalyticsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ studentCount: 0, courseCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherStats, myCourses] = await Promise.all([
          api.getTeacherStats(),
          api.getMyCourses(),
        ]);
        setStats(teacherStats);
        setCourses(myCourses);
      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEnrollments = stats.totalEnrollments || 0;
  const totalViews = courses.reduce((total, course) => total + Number(course.views || 0), 0);
  const totalComments = courses.reduce((acc, course) => acc + (course.reviews?.length || 0), 0);

  // Generate dynamic chart data based on totals (since no historical backend data)
  const performanceData = [
    { name: 'Jan', views: Math.floor(totalViews * 0.05), enrollments: Math.floor(totalEnrollments * 0.05), comments: Math.floor(totalComments * 0.05) },
    { name: 'Feb', views: Math.floor(totalViews * 0.1), enrollments: Math.floor(totalEnrollments * 0.1), comments: Math.floor(totalComments * 0.1) },
    { name: 'Mar', views: Math.floor(totalViews * 0.08), enrollments: Math.floor(totalEnrollments * 0.08), comments: Math.floor(totalComments * 0.08) },
    { name: 'Apr', views: Math.floor(totalViews * 0.15), enrollments: Math.floor(totalEnrollments * 0.15), comments: Math.floor(totalComments * 0.15) },
    { name: 'May', views: Math.floor(totalViews * 0.12), enrollments: Math.floor(totalEnrollments * 0.12), comments: Math.floor(totalComments * 0.12) },
    { name: 'Jun', views: Math.floor(totalViews * 0.2), enrollments: Math.floor(totalEnrollments * 0.2), comments: Math.floor(totalComments * 0.2) },
    { name: 'Jul', views: Math.floor(totalViews * 0.3), enrollments: Math.floor(totalEnrollments * 0.3), comments: Math.floor(totalComments * 0.3) },
  ];

  
  const avgRating = courses.length > 0 
    ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1) 
    : '0.0';

  const dynamicVideoAnalytics = courses.map(course => ({
    id: course._id || course.id,
    title: course.title,
    views: Number(course.views || 0),
    enrollments: course.enrollmentCount || 0,
    comments: course.reviews?.length || 0,
    rating: course.rating || 'New',
  }));
  
  // Goal State
  const [goalMetric, setGoalMetric] = useState('Enrollments');
  const [goalTarget, setGoalTarget] = useState('5000');
  const [activeGoal, setActiveGoal] = useState({ metric: 'Enrollments', target: 5000, current: 3170 });
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics', active: true },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const handleSetGoal = (e) => {
    e.preventDefault();
    if (!goalTarget || isNaN(goalTarget) || Number(goalTarget) <= 0) {
      toast.error('Please enter a valid numeric target.');
      return;
    }
    
    // Simulate current progress based on metric
    const currentProgress = goalMetric === 'Views' ? 46170 : (goalMetric === 'Enrollments' ? 3170 : 684);
    
    setActiveGoal({
      metric: goalMetric,
      target: Number(goalTarget),
      current: currentProgress
    });
    
    toast.success(`New goal set: Reach ${goalTarget} ${goalMetric}!`);
    setIsSettingGoal(false);
  };

  const progressPercentage = Math.min(Math.round((activeGoal.current / activeGoal.target) * 100), 100);

  return (
    <>
      <Helmet>
        <title>Analytics - Eduvirse Dashboard</title>
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
          <TeacherHeader title="Performance Analytics" icon={BarChart3} />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Views</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '...' : totalViews.toLocaleString()}</h3>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+8%</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Enrollments</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '...' : totalEnrollments.toLocaleString()}</h3>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+0.2</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Average Rating</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '...' : avgRating}</h3>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">-3%</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Comments</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '...' : totalComments.toLocaleString()}</h3>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                 </div>
              </div>

              {/* Main Interactive Graph & Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Growth Overview</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Views and Enrollments over time</p>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                      <option>Last 7 Months</option>
                      <option>Last 30 Days</option>
                      <option>This Year</option>
                    </select>
                  </div>
                  
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="views" name="Views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Future Goals Setting */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Achievement Goals</h3>
                      <p className="text-indigo-100 text-xs">Set and track your milestones</p>
                    </div>
                  </div>

                  {!isSettingGoal ? (
                    <div className="relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium text-indigo-100">Target {activeGoal.metric}</span>
                          <span className="text-2xl font-bold">{activeGoal.target.toLocaleString()}</span>
                        </div>
                        
                        <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
                          <div 
                            className="bg-green-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-indigo-100">
                          <span>Current: {activeGoal.current.toLocaleString()}</span>
                          <span className="font-bold text-white">{progressPercentage}% Complete</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setIsSettingGoal(true)} 
                        className="w-full mt-8 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Set New Goal
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSetGoal} className="relative z-10 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-indigo-100 mb-1">Select Metric</label>
                          <select 
                            value={goalMetric}
                            onChange={(e) => setGoalMetric(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-white transition-all cursor-pointer [&>option]:text-slate-800"
                          >
                            <option value="Views">Total Views</option>
                            <option value="Enrollments">Enrollments</option>
                            <option value="Comments">Comments</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-indigo-100 mb-1">Target Number</label>
                          <input 
                            type="number" 
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            placeholder="e.g. 10000"
                            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm rounded-lg px-3 py-2 outline-none focus:border-white transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <Button 
                          type="button"
                          variant="ghost" 
                          onClick={() => setIsSettingGoal(false)} 
                          className="flex-1 text-white hover:bg-white/10 rounded-xl font-semibold"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                        >
                          Save Goal
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Video-Level Analytics Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Video Performance</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Detailed metrics for your individual lessons.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Exporting data as CSV...')} className="hidden sm:flex border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-slate-800">
                    Export CSV
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Video Title</th>
                        <th className="px-6 py-4 font-semibold">Views</th>
                        <th className="px-6 py-4 font-semibold">Enrollments</th>
                        <th className="px-6 py-4 font-semibold">Comments</th>
                        <th className="px-6 py-4 font-semibold">Rating</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {dynamicVideoAnalytics.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                            No course data available yet.
                          </td>
                        </tr>
                      ) : (
                        dynamicVideoAnalytics.map((video) => (
                        <tr key={video.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{video.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {video.views.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {video.enrollments.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {video.comments.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg w-fit">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs font-bold">{video.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/content')} className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
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

export default TeacherAnalyticsPage;
