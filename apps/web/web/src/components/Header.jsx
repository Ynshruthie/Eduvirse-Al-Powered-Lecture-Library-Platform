import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Moon, Sun, Menu, ChevronDown, ChevronRight, GraduationCap, Bell, LayoutDashboard, FileText, DollarSign, BarChart3, BookOpen, ShoppingCart, Heart, Settings, Clock, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce.js';
import { api } from '@/lib/api.js';
import { categoryGroups } from '@/lib/categoriesData.js';

const Header = () => {
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, currentUser } = useAuth();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const role = currentUser?.role?.toLowerCase();
  const isTeacherLike = role === 'teacher' || role === 'admin';
  const isAdmin = role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Fetch real notifications from the API
  useEffect(() => {
    if (currentUser) {
      const fetchNotifications = async () => {
        try {
          const res = await api.getMyNotifications();
          setNotifications((res.data.notifications || []).filter(n => !n.read));
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      
      fetchNotifications();
      
      import('@/lib/socket').then(({ getSocket }) => {
        const socket = getSocket();
        socket.emit('join_dashboard', currentUser.id);
        
        const handleNewAnnouncement = (announcement) => {
          import('sonner').then(({ toast }) => {
            toast.info(`New Announcement: ${announcement.title}`);
          });
          
          setNotifications(prev => [{
            id: Date.now().toString(),
            title: `New Announcement in course`,
            body: announcement.title,
            read: false,
            time: 'Just now',
            type: 'announcement'
          }, ...prev]);
        };

        socket.on('new_announcement', handleNewAnnouncement);
        
        return () => {
          socket.off('new_announcement', handleNewAnnouncement);
        };
      });
      
      // We could add an interval here to poll for new notifications
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.markNotificationsRead();
      // Remove all read notifications from the UI so they vanish
      setNotifications(notifications.filter(n => !n.read && false)); // effectively clears them
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      // Optimistically remove it from UI
      setNotifications(notifications.filter(n => n.id !== id));
      await api.markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    let isMounted = true;

    setIsSearching(true);
    api.getCourses({ search: debouncedSearch, limit: 5 })
      .then((results) => {
        if (!isMounted) {
          return;
        }

        setSearchResults(results);
        setShowSearchDropdown(true);
      })
      .catch(() => {
        if (isMounted) {
          setSearchResults([]);
          setShowSearchDropdown(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [expandedMobileClass, setExpandedMobileClass] = useState(null);
  const [activeClassGroup, setActiveClassGroup] = useState('Class 7');
  const isActive = (path) => location.pathname === path;

  const handleFilterClick = (filter) => {
    setSearchQuery('');
    navigate(`/search?filter=${encodeURIComponent(filter)}`);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Eduvirse
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`font-medium transition-colors duration-200 ${isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'}`}>Home</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors duration-200">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[820px] p-5 shadow-2xl rounded-2xl bg-popover/98 backdrop-blur-md border border-border mt-1.5">
                <div className="flex w-full h-[360px] overflow-hidden">
                  {/* Left Column: Side Tabs for Each Class Standard */}
                  <div className="w-[260px] border-r border-border/50 pr-4 flex flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
                    {categoryGroups.map((group) => (
                      <button
                        key={group.title}
                        type="button"
                        onMouseEnter={() => setActiveClassGroup(group.title)}
                        onClick={() => setActiveClassGroup(group.title)}
                        className={`w-full text-left py-2 px-3.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                          activeClassGroup === group.title
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'hover:bg-muted/65 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{group.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeClassGroup === group.title ? 'translate-x-0.5 text-primary' : 'text-muted-foreground/30'
                        }`} />
                      </button>
                    ))}
                  </div>

                  {/* Right Column: Grid of Subjects for Active Class Standard */}
                  <div className="flex-1 pl-6 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div>
                        <div className="text-primary font-bold text-xs uppercase tracking-wider select-none">
                          {activeClassGroup} Stream
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Explore standard lessons, resources, and live sessions</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
                        {categoryGroups
                          .find((group) => group.title === activeClassGroup)
                          ?.items.map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => navigate(`/search?category=${encodeURIComponent(item.name)}`)}
                              className="w-full text-left text-xs text-muted-foreground hover:text-foreground py-2.5 px-3.5 rounded-xl border border-transparent transition-all hover:border-primary/15 hover:bg-muted/50 flex items-center gap-2 group/item"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 group-hover/item:bg-primary transition-colors flex-shrink-0" />
                              <span className="font-medium truncate group-hover/item:text-primary transition-colors">{item.name}</span>
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground select-none">
                      <span className="flex items-center gap-1">✨ Interactive virtual class learning</span>
                      <button
                        type="button"
                        onClick={() => navigate('/search')}
                        className="text-primary hover:underline font-semibold"
                      >
                        Explore All Subjects →
                      </button>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="rounded-full border border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleFilterClick('premium')}>
              Premium
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => navigate(isTeacherLike ? '/teacher/live-classes' : '/live')}>
              {isTeacherLike ? 'Start Live' : 'Live'}
            </Button>
            {isAuthenticated && (
              <Link to="/dashboard" className={`font-medium transition-colors duration-200 ${isActive('/dashboard') ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-10 w-64 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                />
              </form>
              {showSearchDropdown && (
                <div className="absolute top-full mt-2 w-full bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map(course => (
                        <Link key={course._id || course.id} to={`/course/${course._id || course.id}`} className="p-3 hover:bg-muted flex items-center gap-3 transition-colors">
                          <div className="w-10 h-10 bg-primary/10 rounded flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                            {course.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{course.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{course.instructor?.name || course.instructor}</p>
                          </div>
                        </Link>
                      ))}
                      <Link to={`/search?q=${encodeURIComponent(searchQuery)}`} className="p-3 text-sm text-primary text-center font-medium hover:bg-muted border-t">
                        View All Results
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">No results found</div>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <DropdownMenu open={showNotifPanel} onOpenChange={setShowNotifPanel}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <Bell className="w-5 h-5 text-foreground" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-0.5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => markSingleAsRead(n.id)} className={`flex gap-3 p-3 mx-1 my-0.5 rounded-lg cursor-pointer transition-colors ${n.read ? 'hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-full focus:outline-none ring-2 ring-transparent focus:ring-primary transition-all">
                      <Avatar className="w-8 h-8 cursor-pointer border border-border">
                        <AvatarImage src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} />
                        <AvatarFallback>{(currentUser?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 bg-background border border-border shadow-xl rounded-xl">
                    <div className="p-3 border-b border-border mb-1 bg-muted/30 rounded-t-xl">
                      <p className="font-bold text-sm text-foreground truncate">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'user@example.com'}</p>
                    </div>
                    
                    <div className="p-1">
                      <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        Dashboard
                      </DropdownMenuItem>
                      {isTeacherLike ? (
                        <>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/teacher/content')}>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            My Content
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/teacher/earnings')}>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            Earnings & Payouts
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/teacher/analytics')}>
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            Performance Analytics
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/dashboard')}>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            My Learning
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/cart')}>
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            My Cart
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/wishlist')}>
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            Wishlist
                          </DropdownMenuItem>
                        </>
                      )}
                    </div>

                    <DropdownMenuSeparator className="bg-border" />
                    
                    <div className="p-1">
                      <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate(isTeacherLike ? '/teacher/settings' : '/settings')}>
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Account Settings
                      </DropdownMenuItem>
                      {!isTeacherLike && (
                        <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate('/purchase-history')}>
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          Purchase History
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="cursor-pointer text-sm font-medium text-foreground hover:bg-muted focus:bg-muted rounded-lg flex items-center gap-2 py-2" onClick={() => navigate(isTeacherLike ? '/teacher/support' : '/support')}>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        Help Center
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="bg-border" />
                    
                    <div className="p-1">
                      <DropdownMenuItem className="cursor-pointer text-sm font-bold text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg flex items-center gap-2 py-2 transition-colors" onClick={() => { logout(); navigate('/'); }}>
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="w-6 h-6" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search courses..." className="pl-10 bg-muted/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </form>
                  <nav className="flex flex-col gap-4">
                    <Link to="/" className={`font-medium text-lg ${isActive('/') ? 'text-primary' : 'text-foreground'}`}>Home</Link>
                    
                    <div className="space-y-2">
                      <button 
                        type="button"
                        onClick={() => setShowMobileCategories(!showMobileCategories)}
                        className="w-full flex items-center justify-between font-medium text-lg text-foreground hover:text-primary py-1"
                      >
                        <span>Categories</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showMobileCategories ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showMobileCategories && (
                        <div className="pl-3 border-l border-border space-y-3.5 max-h-[300px] overflow-y-auto py-1">
                          {categoryGroups.map((group) => {
                            const isExpanded = expandedMobileClass === group.title;
                            return (
                              <div key={group.title} className="space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => setExpandedMobileClass(isExpanded ? null : group.title)}
                                  className="w-full flex items-center justify-between text-left text-xs font-bold text-foreground hover:text-primary transition-colors py-1"
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{group.title}</span>
                                  </span>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                </button>
                                
                                {isExpanded && (
                                  <div className="pl-4 border-l border-primary/20 space-y-1 ml-1.5">
                                    {group.items.map((item) => (
                                      <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => navigate(`/search?category=${encodeURIComponent(item.name)}`)}
                                        className="w-full text-left text-xs text-muted-foreground hover:text-foreground py-1.5 px-2 rounded hover:bg-muted/40 transition-colors flex items-center gap-2 group/item"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 group-hover/item:bg-primary transition-colors flex-shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {isAuthenticated && <Link to="/dashboard" className={`font-medium text-lg ${isActive('/dashboard') ? 'text-primary' : 'text-foreground'}`}>Dashboard</Link>}
                    <Button variant="outline" size="sm" className="w-full text-left" onClick={() => handleFilterClick('premium')}>Premium Courses</Button>
                    <Button variant="outline" size="sm" className="w-full text-left" onClick={() => navigate(isTeacherLike ? '/teacher/live-classes' : '/live')}>{isTeacherLike ? 'Start Live' : 'Live Classes'}</Button>
                  </nav>
                  <div className="flex flex-col gap-3 pt-6 border-t">
                    {isAuthenticated ? (
                      <>
                        <p className="text-sm text-muted-foreground">{currentUser?.name || currentUser?.email}</p>
                        <Button onClick={logout} variant="outline" className="w-full">Logout</Button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="w-full"><Button variant="outline" className="w-full">Login</Button></Link>
                        <Link to="/signup" className="w-full"><Button className="w-full">Sign Up</Button></Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
