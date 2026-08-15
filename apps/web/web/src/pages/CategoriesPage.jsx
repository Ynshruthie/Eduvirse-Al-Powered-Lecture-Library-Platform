import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, Zap, Flame, Microscope, Laptop, Globe, Briefcase, BookOpen, Brain, 
  GraduationCap, ChevronRight, Home, Search, BookOpen as BookOpenIcon, User, Plus, Search as SearchIcon
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EditProfileModal from '@/components/EditProfileModal.jsx';
import { categoryGroups } from '@/lib/categoriesData.js';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role?.toLowerCase();
  const isTeacherLike = role === 'teacher' || role === 'admin';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [courses, setCourses] = useState([]);

  React.useEffect(() => {
    api.getCourses().then(data => setCourses(data || [])).catch(() => setCourses([]));
  }, []);

  // Helper to map category names to Lucide icons
  const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('mathematics') || lower.includes('calculus')) return Calculator;
    if (lower.includes('physics')) return Zap;
    if (lower.includes('chemistry') || lower.includes('reaction')) return Flame;
    if (lower.includes('science') || lower.includes('biology') || lower.includes('genetics')) return Microscope;
    if (lower.includes('computer') || lower.includes('data structures') || lower.includes('devops') || lower.includes('cloud') || lower.includes('security') || lower.includes('dbms') || lower.includes('operating systems') || lower.includes('web')) return Laptop;
    if (lower.includes('history') || lower.includes('civics') || lower.includes('geography') || lower.includes('political') || lower.includes('sociology') || lower.includes('economics')) return Globe;
    if (lower.includes('business') || lower.includes('management') || lower.includes('marketing') || lower.includes('financial') || lower.includes('accountancy')) return Briefcase;
    if (lower.includes('english') || lower.includes('literature') || lower.includes('drama')) return BookOpen;
    if (lower.includes('psychology')) return Brain;
    return GraduationCap;
  };

  // Helper to dynamically calculate mock course counts
  const getCourseCountForCategory = (catName) => {
    return courses.filter(c => (c.category || '').toLowerCase() === catName.toLowerCase()).length;
  };

  // Filter category groups and items based on search query
  const filteredGroups = categoryGroups.map(group => {
    const items = group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  return (
    <>
      <Helmet>
        <title>Course Categories - Eduvirse</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Header />
        
        <main className="flex-1 pb-28">
          {/* Hero Header */}
          <div className="bg-indigo-600 dark:bg-indigo-900/40 text-white pt-12 pb-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[120%] bg-white/20 blur-3xl rounded-full transform rotate-12"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[100%] bg-blue-400/20 blur-3xl rounded-full"></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
                <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-indigo-200" />
                Browse Course Categories
              </h1>
              <p className="text-indigo-100 max-w-2xl mx-auto text-sm md:text-base font-medium">
                Choose a category to discover learning modules. Find free and premium video lectures seeded with comprehensive curricula.
              </p>
              
              {/* Category Search Input */}
              <div className="max-w-md mx-auto relative pt-4">
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden p-1 border border-slate-200 dark:border-slate-800">
                  <div className="pl-3 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search categories..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-3 bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 text-xs md:text-sm font-medium"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categories Grid Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
            {filteredGroups.length > 0 ? (
              <div className="space-y-12">
                {filteredGroups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-md border border-slate-200 dark:border-slate-850">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b pb-3 border-slate-100 dark:border-slate-800">
                      {group.title}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.items.map((item, idx) => {
                        const IconComponent = getCategoryIcon(item.name);
                        const count = getCourseCountForCategory(item.name);
                        return (
                          <div 
                            key={idx}
                            onClick={() => navigate(`/search?category=${encodeURIComponent(item.name)}`)}
                            className="group cursor-pointer bg-slate-50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-905 border border-slate-100 dark:border-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                          >
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {item.name.replace(/^(Class \d+ - )/, '')}
                              </h4>
                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {count} {count === 1 ? 'course' : 'courses'}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-850 shadow-md">
                <SearchIcon className="w-12 h-12 mx-auto text-slate-400 mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No categories found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-450 max-w-sm mx-auto">
                  We couldn't find any category groups matching your query. Try a different search term.
                </p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex justify-between items-center z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] dark:shadow-none pb-safe rounded-t-2xl md:max-w-4xl lg:max-w-[90%] md:mx-auto md:mb-4 md:rounded-full md:border transition-colors duration-300">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-555 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5 border-0 bg-transparent cursor-pointer">
            <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">Home</span>
          </button>
          <button onClick={() => { navigate('/explore'); }} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-555 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5 border-0 bg-transparent cursor-pointer">
            <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">Search</span>
          </button>
          <div className="relative -top-5">
            <button onClick={() => isTeacherLike ? navigate('/create') : null} className="w-12 h-12 bg-[#5c67f2] dark:bg-[#4a54c4] rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 dark:shadow-indigo-900/40 scale-105 border-4 border-white dark:border-slate-900 cursor-default">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => navigate(isTeacherLike ? '/teacher/courses' : '/dashboard')} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-555 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5 border-0 bg-transparent cursor-pointer">
            <BookOpenIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-semibold transition-colors">{isTeacherLike ? 'My Course' : 'My Learning'}</span>
          </button>
          <button onClick={() => setIsEditProfileOpen(true)} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-555 hover:text-[#6366f1] dark:hover:text-indigo-400 transition-all duration-300 ease-in-out group active:scale-90 hover:-translate-y-0.5 border-0 bg-transparent cursor-pointer">
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

export default CategoriesPage;
