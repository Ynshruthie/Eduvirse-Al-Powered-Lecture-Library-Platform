import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LayoutDashboard, Radio, Users, BarChart2, DollarSign, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Search, Bell, MessageSquare, Reply, Trash2, CheckCircle, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';

// Replaced staticComments with backend fetch

const TeacherCommentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { api } = await import('@/lib/api');
      const res = await api.getMyComments();
      setComments(res.data.comments || []);
    } catch (err) {
      toast.error('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    
    try {
      const { api } = await import('@/lib/api');
      const res = await api.replyToComment(commentId, replyText);
      setComments(prev => prev.map(c => c.id === commentId ? res.data.comment : c));
      toast.success('Reply posted successfully!');
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleResolve = async (commentId) => {
    try {
      const { api } = await import('@/lib/api');
      const res = await api.resolveComment(commentId);
      setComments(prev => prev.map(c => c.id === commentId ? res.data.comment : c));
      toast.success('Comment marked as resolved.');
    } catch (err) {
      toast.error('Failed to resolve comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const { api } = await import('@/lib/api');
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments', active: true },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const filteredComments = comments.filter(c => filter === 'All' || c.status === filter);

  return (
    <>
      <Helmet>
        <title>Manage Comments - Eduvirse Dashboard</title>
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
          <TeacherHeader title="Manage Comments" icon={MessageSquare} />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Header & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Comments</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Reply to questions, moderate feedback, and engage with your students.
                  </p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['All', 'Unresolved', 'Resolved'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${filter === f ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading comments...</h3>
                  </div>
                ) : filteredComments.length > 0 ? (
                  filteredComments.map(comment => (
                    <div key={comment.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md">
                      
                      <div className="flex flex-col sm:flex-row gap-6">
                        
                        {/* Video Context (Left Side on Desktop) */}
                        <div className="sm:w-48 flex-shrink-0">
                          <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                             <img src={comment.videoThumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                               <Radio className="w-6 h-6 text-white opacity-80" />
                             </div>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1 line-clamp-1">{comment.courseTitle}</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">{comment.videoTitle}</p>
                        </div>
                        
                        {/* Comment Content (Right Side) */}
                        <div className="flex-1 flex flex-col">
                          
                          {/* Student Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                                <AvatarImage src={comment.studentAvatar} />
                                <AvatarFallback>{comment.studentName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{comment.studentName}</h4>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{comment.timestamp}</span>
                              </div>
                            </div>
                            <Badge variant={comment.status === 'Resolved' ? 'default' : 'destructive'} className={`${comment.status === 'Resolved' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                              {comment.status}
                            </Badge>
                          </div>
                          
                          {/* Comment Body */}
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            "{comment.text}"
                          </p>

                          {/* Existing Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-2 mb-4 space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8 ring-2 ring-indigo-100 dark:ring-indigo-900">
                                    <AvatarImage src={currentUser?.avatar || "https://i.pravatar.cc/150?img=11"} />
                                    <AvatarFallback>T</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400">You (Instructor)</h5>
                                      <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reply Input Area (Expandable) */}
                          <div className={`mt-auto transition-all duration-500 ease-in-out overflow-hidden ${replyingTo === comment.id ? 'max-h-48 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                            <div className="flex gap-3">
                               <Avatar className="w-8 h-8 hidden sm:block">
                                  <AvatarImage src={currentUser?.avatar || "https://i.pravatar.cc/150?img=11"} />
                                  <AvatarFallback>T</AvatarFallback>
                               </Avatar>
                               <div className="flex-1 flex flex-col gap-2">
                                  <textarea 
                                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl p-3 outline-none resize-none transition-all placeholder:text-slate-400"
                                    rows="3"
                                    placeholder={`Reply to ${comment.studentName}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    autoFocus={replyingTo === comment.id}
                                  ></textarea>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-8 text-xs font-semibold">Cancel</Button>
                                    <Button size="sm" onClick={() => handleReplySubmit(comment.id)} className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">Post Reply</Button>
                                  </div>
                               </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {replyingTo !== comment.id && (
                            <div className="flex items-center gap-2 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                              <Button variant="outline" size="sm" onClick={() => setReplyingTo(comment.id)} className="h-8 text-xs font-semibold border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-slate-800 transition-colors">
                                <Reply className="w-3.5 h-3.5 mr-1.5" /> Reply
                              </Button>
                              {comment.status === 'Unresolved' && (
                                <Button variant="ghost" size="sm" onClick={() => handleResolve(comment.id)} className="h-8 text-xs font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Resolve
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(comment.id)} className="h-8 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 ml-auto transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No comments found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                      You're all caught up! There are no {filter.toLowerCase()} comments to display right now.
                    </p>
                    {filter !== 'All' && <Button onClick={() => setFilter('All')} variant="outline">View All Comments</Button>}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
  );
};

export default TeacherCommentsPage;
