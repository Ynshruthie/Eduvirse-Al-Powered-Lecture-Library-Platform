import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, TrendingUp, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { api } from '@/lib/api.js';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([{ icon: '🌟', name: 'All', courseCount: 0 }]);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getCourses()])
      .then(([categoriesData, coursesData]) => {
        setCategories([{ icon: '🌟', name: 'All', courseCount: 0 }, ...categoriesData.map((category) => ({ ...category, icon: '📚' }))]);
        setAllCourses((coursesData || []).filter(c => c.videoUrl && c.videoUrl.trim() !== '' || c.videos && c.videos.length > 0));
      })
      .catch(() => {
        setCategories([{ icon: '🌟', name: 'All', courseCount: 0 }]);
        setAllCourses([]);
      });
  }, []);

  // Filter courses based on search query and selected category
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Explore Courses - Eduvirse</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Header />
        
        <main className="flex-1 pb-20">
          {/* Top Banner & Search */}
          <div className="bg-indigo-600 dark:bg-indigo-900/40 text-white pt-12 pb-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
               <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[120%] bg-white/20 blur-3xl rounded-full transform rotate-12"></div>
               <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[100%] bg-blue-400/20 blur-3xl rounded-full"></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10 text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                <Compass className="w-8 h-8 md:w-12 md:h-12" />
                Explore Our Universe
              </h1>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto text-sm md:text-base">
                Discover top-rated courses across 15+ categories. Learn from the best instructors and take your skills to the next level.
              </p>
              
              <div className="max-w-2xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-300 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden p-1">
                  <div className="flex items-center justify-center pl-4 pr-2 text-slate-400 dark:text-slate-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search for courses, skills, or instructors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 px-2 bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 text-sm md:text-base"
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors active:scale-95 shadow-sm shadow-indigo-500/20 m-1">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
            
            {/* Categories Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 dark:border-slate-800 mb-12">
              <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                Browse Categories
              </h2>
              <div className="flex overflow-x-auto pb-4 gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 active:scale-95 ${
                      selectedCategory === cat.name 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <TrendingUp className="w-6 h-6 text-indigo-500" />
                   {selectedCategory === 'All' ? 'Trending Courses' : `${selectedCategory} Courses`}
                </h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {filteredCourses.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div 
                      key={course._id || course.id} 
                      onClick={() => navigate(`/course/${course._id || course.id}`)} 
                      className="group/card cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 flex flex-col"
                    >
                      {/* Exact HomePage Trending Card Design */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2.5 shadow-sm group-hover/card:shadow-md transition-shadow bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/60">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-semibold flex items-center gap-1 shadow-sm">
                          {course.videos?.[0]?.duration || '12:30'}
                        </div>
                        {course.premium && (
                          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-orange-400 px-1.5 py-0.5 rounded text-[9px] text-white font-bold shadow-sm">
                            PREMIUM
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1 leading-tight group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 transition-colors mt-auto pt-1">
                          <span className="truncate">{course.instructor?.name || course.instructor}</span> 
                          <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/20 flex-shrink-0" />
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      We couldn't find any courses matching your search or category filter. Please try a different term.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ExplorePage;
