import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard, PlaySquare, Radio, Users, BarChart2, DollarSign, Bell, Settings,
  HelpCircle, Crown, Heart, Star, CheckCircle2, GraduationCap, Plus, Search, Filter, Play, Radio as RadioIcon, FileText, MessageSquare, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader';

const TeacherContentPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('All');
  const [contentItems, setContentItems] = useState([]);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content', active: true },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  useEffect(() => {
    const loadContent = async () => {
      try {
        const courses = await api.getMyCourses();
        setContentItems(
          courses.map((course, index) => ({
            id: course._id || course.id,
            type: course.live ? 'Live' : 'Video',
            title: course.title,
            instructor: currentUser?.name || 'Instructor',
            lang: 'English',
            rating: course.rating ? String(course.rating) : 'New',
            price: (course.discountPrice ?? course.price ?? 0) > 0 ? String(course.discountPrice ?? course.price) : 'Free',
            oldPrice: course.discountPrice && course.price ? String(course.price) : '',
            off: course.discountPrice && course.price ? 'Offer' : '',
            color: ['bg-[#5c67f2]', 'bg-[#f5a623]', 'bg-[#2980b9]', 'bg-[#27ae60]', 'bg-[#8e44ad]'][index % 5],
            darkColor: ['dark:bg-[#4a54c4]', 'dark:bg-[#d68910]', 'dark:bg-[#1a5276]', 'dark:bg-[#196f3d]', 'dark:bg-[#5b2c6f]'][index % 5],
            img: course.thumbnail || currentUser?.avatar || 'https://i.pravatar.cc/300?img=11',
            status: String(course.status || 'published').replace(/^./, (char) => char.toUpperCase()),
          })),
        );
      } catch (_error) {
        setContentItems([]);
      }
    };

    loadContent();
  }, [currentUser?.avatar, currentUser?.name]);

  const handleCardClick = (type) => {
    if (type === 'Video') {
      navigate('/upload');
    } else if (type === 'Live') {
      navigate('/go-live');
    }
  };

  const filteredContent = contentItems.filter(item => {
    if (filter === 'All') return true;
    return item.type === filter;
  });


  return (
    <>
      <Helmet>
        <title>My Content - Eduvirse</title>
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
          <TeacherHeader title="My Content">
            <Button onClick={() => navigate('/create')} className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg h-9">
              <Plus className="w-4 h-4 mr-2" /> Create New
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          </TeacherHeader>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Your Content</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View, edit, and update your published videos and live courses.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search content..." 
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['All', 'Video', 'Live'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === f ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredContent.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleCardClick(item.type)}
                    className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md dark:hover:border-slate-700 group/card cursor-pointer"
                  >
                    <div className={`relative h-28 ${item.color} ${item.darkColor} flex items-end justify-center pt-3 transition-colors duration-300`}>
                      <div className={`absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${item.type === 'Live' ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'} shadow-sm transition-transform duration-300 group-hover/card:scale-105`}>
                        {item.type === 'Live' ? <RadioIcon className="w-3 h-3" /> : <Play className="w-3 h-3" />} {item.type}
                      </div>
                      <div className={`absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${item.status === 'Published' ? 'text-green-600' : 'text-amber-500'}`}>
                        {item.status}
                      </div>
                      <img src={item.img} alt={item.instructor} className="w-16 h-16 rounded-full object-cover object-top border-2 border-white dark:border-slate-900 translate-y-3 shadow-md bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover/card:scale-110" />
                    </div>
                    <div className="p-4 pt-6 flex-1 flex flex-col">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 transition-colors">{item.instructor}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 transition-colors">{item.lang}</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mb-4 transition-colors">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" /> {item.rating}
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-end gap-1.5 mb-3">
                          <span className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{item.price === 'Free' ? item.price : `₹${item.price}`}</span>
                          {item.oldPrice && <span className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5 transition-colors">₹{item.oldPrice}</span>}
                          {item.off && <span className="text-[10px] font-bold text-green-500 dark:text-green-400 mb-1 ml-auto transition-colors">{item.off}</span>}
                        </div>
                        <Button variant="outline" className="w-full rounded-lg border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 font-semibold h-9 text-xs transition-all duration-300 active:scale-95">
                          Edit Content
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredContent.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <PlaySquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Content Found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">You haven't uploaded any content matching this filter.</p>
                  <Button onClick={() => navigate('/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Create New Content
                  </Button>
                </div>
              )}
              
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
  );
};

export default TeacherContentPage;
