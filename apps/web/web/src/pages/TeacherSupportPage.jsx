import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  LayoutDashboard, Radio, Users, BarChart2, DollarSign, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Bell, MessageSquare, 
  ChevronDown, ChevronUp, Mail, MessageCircle, Globe, Send, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';

const faqData = [
  {
    id: 1,
    question: "How do I upload a new course video?",
    answer: "To upload a new video, navigate to the 'Content' tab in your dashboard, click on 'Create Course', and follow the step-by-step wizard. You can upload MP4, MOV, or AVI files up to 2GB in size."
  },
  {
    id: 2,
    question: "When do I get paid for my course sales?",
    answer: "Payouts are processed automatically on the 5th of every month for the previous month's earnings. Ensure your payment details under 'Settings' > 'Billing' are up to date."
  },
  {
    id: 3,
    question: "How can I schedule a Live Class?",
    answer: "Go to the 'Live Classes' tab and click 'Schedule Live'. Fill in the topic, date, and duration. You can launch the classroom directly from your dashboard 15 minutes before the scheduled start time."
  },
  {
    id: 4,
    question: "What happens if a student requests a refund?",
    answer: "Eduvirse offers a 30-day money-back guarantee. If a student requests a refund within this window, the amount is automatically deducted from your pending earnings. You can view refund analytics in the 'Analytics' tab."
  },
  {
    id: 5,
    question: "How do I respond to student comments?",
    answer: "Navigate to the 'Comments' tab. Here you will see a feed of all student questions and feedback. You can filter by unresolved queries and reply directly. Your responses will be highlighted as 'Instructor'."
  }
];

const problemCategories = [
  "Technical Issue / Bug Report",
  "Payment / Billing Inquiry",
  "Course Upload / Management",
  "Student Dispute / Refund",
  "Account Security / Settings",
  "Feature Request",
  "Other"
];

const TeacherSupportPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [openFaq, setOpenFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support', active: true },
  ];

  const toggleFaq = (id) => {
    if (openFaq === id) {
      setOpenFaq(null);
    } else {
      setOpenFaq(id);
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketCategory || !ticketSubject || !ticketDescription) {
      toast.error('Please fill in all fields before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      toast.success('Ticket submitted successfully! Our team will get back to you within 24 hours.');
      setTicketCategory('');
      setTicketSubject('');
      setTicketDescription('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Help & Support - Eduvirse Dashboard</title>
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
            <TeacherHeader title="Help & Support" icon={HelpCircle} />

            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Info */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">How can we help you?</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                      Find answers to common questions, or raise a support ticket to get in touch with our educator success team.
                    </p>
                  </div>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">Email Support</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Average response time: 24h</p>
                      <a href="mailto:support@eduvirse.com" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline mt-auto">support@eduvirse.com</a>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">Live Chat</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Available 9 AM - 5 PM EST</p>
                      <button onClick={() => toast.info('Connecting to live chat agent...')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline mt-auto">Start Chat</button>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">Community Forum</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Discuss with other instructors</p>
                      <button onClick={() => toast.info('Redirecting to Community Forums...')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline mt-auto">Visit Forums</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* FAQ Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        {faqData.map((faq) => (
                          <div key={faq.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-300">
                            <button 
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                            >
                              <span className={`font-semibold ${openFaq === faq.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {faq.question}
                              </span>
                              {openFaq === faq.id ? (
                                <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0 ml-2" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                              )}
                            </button>
                            
                            <div className={`px-5 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'block' : 'hidden'}`}>
                              {faq.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Submission Form */}
                  <div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Raise a Query</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Can't find the answer in the FAQs? Submit a ticket and our support team will assist you.</p>
                      
                      <form onSubmit={handleTicketSubmit} className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Problem Category</label>
                          <div className="relative">
                            <select 
                              value={ticketCategory}
                              onChange={(e) => setTicketCategory(e.target.value)}
                              className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                            >
                              <option value="" disabled>Select a category...</option>
                              {problemCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                          <input 
                            type="text" 
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                          <textarea 
                            value={ticketDescription}
                            onChange={(e) => setTicketDescription(e.target.value)}
                            placeholder="Please provide as much detail as possible..."
                            rows="5"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                          ></textarea>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                        >
                          {isSubmitting ? 'Submitting Ticket...' : (
                            <>
                              <Send className="w-4 h-4 mr-2" /> Submit Support Ticket
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
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

export default TeacherSupportPage;
