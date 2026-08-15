import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  LayoutDashboard, Radio, Users, BarChart2, DollarSign, Settings,
  HelpCircle, CheckCircle2, GraduationCap, Bell, MessageSquare, 
  User, Shield, CreditCard, BellRing, Save, Upload, Twitter, Linkedin, Globe, FileText, BarChart3, Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header.jsx';
import TeacherHeader from '@/components/TeacherHeader.jsx';

const TeacherSettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || null);
  const [avatarData, setAvatarData] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 800 * 1024;

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image is too large. Please choose a file under 800KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
      setAvatarData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Profile State
  const [firstName, setFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [headline, setHeadline] = useState(currentUser?.headline || 'Senior Web Developer & Educator');
  const [bio, setBio] = useState(currentUser?.bio || 'Passionate about teaching modern web technologies. I have over 10 years of industry experience building scalable applications.');
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications State
  const [notifEnrollments, setNotifEnrollments] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/teacher/content' },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings', active: true },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedName = `${firstName} ${lastName}`.trim();
      await updateProfile({
        name: updatedName,
        headline,
        bio,
        ...(avatarData ? { avatar: avatarData } : {}),
      });
      // toast.success is globally imported, just call it
      toast.success('Profile settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Password updated securely.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSaving(false);
    }, 1000);
  };

  const handleToggleNotification = (setter, value) => {
    setter(!value);
    toast.success('Notification preferences updated.');
  };

  return (
    <>
      <Helmet>
        <title>Settings - Eduvirse Dashboard</title>
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
          <TeacherHeader title="Account Settings" icon={Settings} />

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
              
              {/* Settings Navigation Tabs */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm sticky top-24">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <User className="w-5 h-5" /> Public Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Shield className="w-5 h-5" /> Account Security
                  </button>
                  <button 
                    onClick={() => setActiveTab('payouts')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'payouts' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <CreditCard className="w-5 h-5" /> Payout Details
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'notifications' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <BellRing className="w-5 h-5" /> Notifications
                  </button>
                </div>
              </div>

              {/* Settings Content Area */}
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all duration-300 min-h-[500px]">
                  
                  {/* PROFILE TAB */}
                  {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Public Profile</h2>
                      
                      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <Avatar className="w-24 h-24 border-4 border-slate-50 dark:border-slate-800 shadow-md">
                          <AvatarImage src={avatarPreview || "https://i.pravatar.cc/150?img=11"} />
                          <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" size="sm" className="mb-2 border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800" type="button" onClick={handleImageUploadClick}>
                            <Upload className="w-4 h-4 mr-2" /> Upload Image
                          </Button>
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleFileChange} />
                          <p className="text-xs text-slate-500 dark:text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                            <input 
                              type="text" 
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                            <input 
                              type="text" 
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Headline</label>
                          <input 
                            type="text" 
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="e.g. Senior Web Developer & Educator"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Biography</label>
                          <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="4"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                          ></textarea>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Social Links</h3>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500">
                                <Twitter className="w-4 h-4" />
                              </div>
                              <input type="text" placeholder="Twitter URL" className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-r-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="flex items-center">
                              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500">
                                <Linkedin className="w-4 h-4" />
                              </div>
                              <input type="text" placeholder="LinkedIn URL" className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-r-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-6">
                          <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                            {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* SECURITY TAB */}
                  {activeTab === 'security' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account Security</h2>
                      
                      <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>

                        <div className="pt-4">
                          <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                            {isSaving ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      </form>

                      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">Danger Zone</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30" onClick={() => toast.error('Account deletion requested.')}>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* PAYOUTS TAB */}
                  {activeTab === 'payouts' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payout Details</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Manage how you receive your earnings.</p>
                        </div>
                        <Button onClick={() => toast.info('Add new payout method modal opened.')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all">
                          Add Method
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* PayPal Card */}
                        <div className="flex items-center justify-between p-5 border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-500 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                              <span className="font-bold text-blue-800 dark:text-blue-400 text-xl italic">P</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">PayPal</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email || 'instructor@example.com'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full hidden sm:block">Default</span>
                            <Button variant="ghost" size="sm" onClick={() => toast.success('PayPal settings updated')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Edit</Button>
                          </div>
                        </div>

                        {/* Bank Card */}
                        <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                              <Globe className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Wire Transfer</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Account ending in 4092</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toast.success('Made Default')} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold">Make Default</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NOTIFICATIONS TAB */}
                  {activeTab === 'notifications' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Notification Preferences</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Choose what you want to be notified about via email.</p>

                      <div className="space-y-6">
                        
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">New Enrollments</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a student enrolls in your course.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifEnrollments} onChange={() => handleToggleNotification(setNotifEnrollments, notifEnrollments)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Student Comments</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts for new questions or feedback.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifComments} onChange={() => handleToggleNotification(setNotifComments, notifComments)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Weekly Earnings Digest</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive a weekly summary of your sales and revenue.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifWeeklyDigest} onChange={() => handleToggleNotification(setNotifWeeklyDigest, notifWeeklyDigest)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Marketing & Promotions</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tips, news, and promotional opportunities from Eduvirse.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifMarketing} onChange={() => handleToggleNotification(setNotifMarketing, notifMarketing)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                      </div>
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

export default TeacherSettingsPage;
