import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  LayoutDashboard, Radio, Users, BarChart2, DollarSign, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Bell, MessageSquare, 
  Video, ArrowUpRight, ArrowDownRight, Wallet, Building, CreditCard, ChevronRight, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';
import { api } from '@/lib/api.js';

const TeacherEarningsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ studentCount: 0, courseCount: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherStats, myCourses] = await Promise.all([
          api.getTeacherStats(),
          api.getMyCourses(),
        ]);
        setStats(teacherStats);
        setCourses(myCourses);
      } catch (error) {
        toast.error('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = stats?.studentCount || 0;
  
  const dynamicVideos = (courses || []).map(course => {
    const enrolls = course.enrollmentCount || 0;
    const price = course.price || 0;
    const revenue = enrolls * price;
    return {
      id: course._id || course.id,
      title: course.title,
      enrollments: enrolls,
      price: price,
      revenue: revenue,
      status: course.status || 'Active'
    };
  });

  const totalLifetimeEarnings = dynamicVideos.reduce((acc, curr) => acc + curr.revenue, 0);
  const [availableBalance, setAvailableBalance] = useState(0);

  React.useEffect(() => {
    if (!loading) {
      setAvailableBalance(totalLifetimeEarnings);
    }
  }, [loading, totalLifetimeEarnings]);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings', active: true },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const payoutMethods = [
    { id: 'paypal', name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', bg: 'bg-white border border-slate-200 dark:border-slate-800', fee: '2% fee' },
    { id: 'bank', name: 'Bank Transfer', icon: Building, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', fee: 'Fixed ₹250 fee' },
    { id: 'stripe', name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', bg: 'bg-white border border-slate-200 dark:border-slate-800', fee: '1.5% fee' },
    { id: 'payoneer', name: 'Payoneer', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Payoneer_logo.svg', bg: 'bg-white border border-slate-200 dark:border-slate-800', fee: '1% fee' },
  ];

  const handleOpenWithdraw = (method) => {
    setSelectedMethod(method);
    setWithdrawAmount('');
    setWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    
    if (amount > availableBalance) {
      toast.error('Insufficient funds.');
      return;
    }

    setIsProcessing(true);

    // Simulate network request
    setTimeout(() => {
      setAvailableBalance(prev => prev - amount);
      toast.success(`Successfully initiated withdrawal of ₹${amount.toLocaleString()} to ${selectedMethod.name}.`);
      setIsProcessing(false);
      setWithdrawModalOpen(false);
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Earnings & Payouts - Eduvirse Dashboard</title>
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
          <TeacherHeader title="Earnings & Payouts" icon={DollarSign} />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Available Balance */}
                 <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl shadow-md text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Ready to Withdraw
                      </span>
                    </div>
                    <p className="text-indigo-100 font-medium mb-1 relative z-10">Available Balance</p>
                    <h3 className="text-4xl font-bold relative z-10">{formatCurrency(availableBalance)}</h3>
                 </div>
                 
                 {/* Total Earnings */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Lifetime Earnings</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalLifetimeEarnings)}</h3>
                 </div>

                 {/* Total Students */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Enrollments</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents.toLocaleString()}</h3>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Earnings by Video Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Revenue by Video</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Detailed breakdown of how much each lesson is earning.</p>
                  </div>
                  
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Video Title</th>
                          <th className="px-6 py-4 font-semibold">Enrollments</th>
                          <th className="px-6 py-4 font-semibold">Price</th>
                          <th className="px-6 py-4 font-semibold">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {dynamicVideos.map((video) => (
                          <tr key={video.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                  <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{video.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                              {video.enrollments.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                              ₹{video.price}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(video.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payout Options */}
                <div className="flex flex-col gap-6">
                  
                  {/* Payout Methods List */}
                  {!withdrawModalOpen ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Withdraw Funds</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Select a payment method to initiate a withdrawal.</p>
                      
                      <div className="space-y-4">
                        {payoutMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 shrink-0 ${method.bg}`}>
                                {method.logo ? (
                                  <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                ) : (
                                  <method.icon className={`w-6 h-6 ${method.color}`} />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{method.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{method.fee}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenWithdraw(method)} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 font-semibold h-8 px-3">
                              Withdraw
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Withdrawal Form
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg flex-1 border-t-4 border-t-indigo-500 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center p-1.5 shrink-0 ${selectedMethod.bg}`}>
                          {selectedMethod.logo ? (
                            <img src={selectedMethod.logo} alt={selectedMethod.name} className="w-full h-full object-contain" />
                          ) : (
                            <selectedMethod.icon className={`w-5 h-5 ${selectedMethod.color}`} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Withdraw to {selectedMethod.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Available: {formatCurrency(availableBalance)}</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amount to Withdraw (₹)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-slate-500 font-bold">₹</span>
                            </div>
                            <input 
                              type="number" 
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="0.00"
                              max={availableBalance}
                              step="0.01"
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-lg font-bold rounded-xl pl-8 pr-16 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                            <button 
                              type="button" 
                              onClick={() => setWithdrawAmount(availableBalance.toString())}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                            >
                              MAX
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                          <span>Processing Fee</span>
                          <span>{selectedMethod.fee}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setWithdrawModalOpen(false)} 
                            className="flex-1 font-semibold"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isProcessing}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
                          >
                            {isProcessing ? 'Processing...' : 'Confirm'}
                          </Button>
                        </div>
                      </form>
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

export default TeacherEarningsPage;
