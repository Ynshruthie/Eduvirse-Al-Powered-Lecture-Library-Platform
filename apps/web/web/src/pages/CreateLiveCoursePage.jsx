import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard, PlaySquare, Radio, Users, BarChart2, DollarSign, Bell, Settings,
  HelpCircle, Crown, ChevronDown, Calendar, Clock, Edit2, Trash2, CheckCircle2,
  Video, FileText, Eye, Plus, GraduationCap, X, Lock, UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { categoryGroups } from '@/lib/categoriesData.js';

const CreateLiveCoursePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const defaultCover = 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a426?w=600&q=80';

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Basic Info', 'Schedule & Roadmap', 'Pricing', 'Preview', 'Launch'];

  // Form State
  const [title, setTitle] = useState('Complete Physics for JEE 2026');
  const [description, setDescription] = useState('A comprehensive live course covering all important topics of Physics for JEE Main & Advanced with concepts, problem solving and doubt sessions.');
  const [subject, setSubject] = useState('Class 11 - Physics');
  const [classLevel, setClassLevel] = useState('Class 11');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [priceType, setPriceType] = useState('paid');
  const [regularPrice, setRegularPrice] = useState('7999');
  const [discountPrice, setDiscountPrice] = useState('4999');
  const [includedInSubscription, setIncludedInSubscription] = useState(true);
  const [coverPreview, setCoverPreview] = useState(defaultCover);
  const [coverAsset, setCoverAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Schedule State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classTime, setClassTime] = useState('');
  const [activeDays, setActiveDays] = useState([]);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Roadmap State
  const [roadmapClasses, setRoadmapClasses] = useState([]);


  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlaySquare, label: 'Content', path: '/teacher/content' },
    { 
      icon: Radio, 
      label: 'Live Courses', 
      isGroup: true,
      subItems: [
        { label: 'My Live Courses', path: '/teacher/live-classes' },
        { label: 'Create New Course', path: '/go-live', active: true }
      ]
    },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: BarChart2, label: 'Analytics', path: '/teacher/analytics' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: Bell, label: 'Notifications', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitLiveCourse('published');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleDay = (day) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter(d => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDeleteClass = (id) => {
    setRoadmapClasses(roadmapClasses.filter(c => c.id !== id));
  };

  const handleAddClass = () => {
    const newClass = {
      id: Date.now(),
      date: startDate,
      time: classTime,
      topic: 'New Class Topic',
      type: 'Concepts',
      objective: 'New objective'
    };
    setRoadmapClasses([...roadmapClasses, newClass]);
  };

  const handleCoverSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Cover image must be 2MB or smaller.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFile = await api.uploadMedia(file, 'live-cover');
      setCoverAsset(uploadedFile);
      setCoverPreview(uploadedFile.url);
      toast.success('Cover image uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload cover image.');
    } finally {
      setIsSubmitting(false);
      event.target.value = '';
    }
  };

  const handleSubmitLiveCourse = async (status) => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedSubject = subject.replace(`${classLevel} - `, '').trim() || subject.trim();

    if (!normalizedTitle || !normalizedDescription) {
      toast.error('Please complete the live course details first.');
      return;
    }

    if (!startDate || !endDate || !classTime) {
      toast.error('Please complete the schedule before saving the course.');
      return;
    }

    setIsSubmitting(true);
    try {
      const launchedCourse = await api.createLiveCourse({
        title: normalizedTitle,
        description: normalizedDescription,
        subject: normalizedSubject,
        classLevel,
        tags,
        priceType,
        price: regularPrice,
        discountPrice,
        thumbnailUrl: coverAsset?.url || coverPreview,
        startDate,
        endDate,
        classTime,
        activeDays,
        roadmapClasses,
        includedInSubscription,
        status,
      });

      toast.success(status === 'draft' ? 'Live course draft saved successfully.' : 'Live course launched successfully.');
      
      if (status === 'draft') {
        navigate('/teacher/live-classes');
      } else {
        const courseId = launchedCourse?._id || launchedCourse?.id || 'gen-' + Math.random().toString(36).substring(2, 11);
        navigate(`/live-session/${courseId}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save the live course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP RENDERERS
  // ---------------------------------------------------------------------------

  const renderStep1BasicInfo = () => (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add basic details of your live course</p>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course Title <span className="text-red-500">*</span></label>
              </div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 text-slate-900 dark:text-white" />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Short Description <span className="text-red-500">*</span></label>
              </div>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none h-24 text-sm text-slate-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Subject <span className="text-red-500">*</span></label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(categoryGroups.find((g) => g.title === classLevel)?.items || []).map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name.replace(`${classLevel} - `, '')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Class / Level <span className="text-red-500">*</span></label>
                <select 
                  value={classLevel} 
                  onChange={(e) => {
                    const newLevel = e.target.value;
                    setClassLevel(newLevel);
                    const targetGroup = categoryGroups.find((g) => g.title === newLevel);
                    if (targetGroup && targetGroup.items.length > 0) {
                      setSubject(targetGroup.items[0].name);
                    }
                  }}
                  className="w-full h-11 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categoryGroups.map((group) => (
                    <option key={group.title} value={group.title}>
                      {group.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Tags <span className="text-red-500">*</span></label>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex flex-wrap gap-2 items-center min-h-[44px]">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                    {tag} <X onClick={() => removeTag(tag)} className="w-3 h-3 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-200" />
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type and press enter..."
                  className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white flex-1 min-w-[120px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Cover Image</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload an image that represents your live course</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 group">
              <img src={coverPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-white dark:bg-slate-800 rounded flex items-center justify-center shadow cursor-pointer text-[#6366f1] hover:text-indigo-700 dark:hover:text-indigo-400">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center aspect-video bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-4">
              <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Custom Cover</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4">Recommended size: 1280x720px<br/>Max file size: 2MB</p>
              <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleCoverSelect} />
              <Button type="button" onClick={() => coverInputRef.current?.click()} variant="outline" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Browse Files</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden transition-colors duration-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 relative z-10">What students will see</h2>
          <ul className="space-y-2.5 relative z-10">
            {[
              'Full course roadmap and schedule',
              'Class topics and objectives',
              'Instructor information',
              'Start and end dates',
              'Timely reminders and notifications'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 dark:text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-2xl opacity-60 pointer-events-none transition-colors duration-300"></div>
          <div className="absolute bottom-2 right-4 text-indigo-200 dark:text-indigo-900/40 pointer-events-none transition-colors duration-300">
            <GraduationCap className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2Schedule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Course Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Schedule</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Set the duration and timing of your live classes</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-md text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20">
            Total Classes: {roadmapClasses.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Class Time</label>
            <Input 
              type="time" 
              value={classTime} 
              onChange={(e) => setClassTime(e.target.value)} 
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Classes On</label>
            <div className="flex gap-1">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  onClick={() => toggleDay(day)}
                  className={`w-8 h-9 rounded flex items-center justify-center text-[11px] font-medium cursor-pointer transition-colors ${
                  activeDays.includes(day) ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class Roadmap</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Plan your classes and topics</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 h-9">
              <FileText className="w-4 h-4 mr-2" /> Bulk Add
            </Button>
            <Button onClick={handleAddClass} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9">
              <Plus className="w-4 h-4 mr-2" /> Add Class
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium w-16 text-center">No.</th>
                <th className="pb-3 font-medium w-36">Date & Time</th>
                <th className="pb-3 font-medium">Topic</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Objective</th>
                <th className="pb-3 font-medium w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {roadmapClasses.map((cls, idx) => (
                <tr key={cls.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 text-center">
                    <div className="w-6 h-6 mx-auto rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-slate-800 dark:text-slate-300 font-medium">{cls.date}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs">{cls.time}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <Input value={cls.topic} onChange={(e) => {
                      const newClasses = [...roadmapClasses];
                      newClasses[idx].topic = e.target.value;
                      setRoadmapClasses(newClasses);
                    }} className="h-8 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900" />
                  </td>
                  <td className="py-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell pr-4">
                    <Input value={cls.objective} onChange={(e) => {
                      const newClasses = [...roadmapClasses];
                      newClasses[idx].objective = e.target.value;
                      setRoadmapClasses(newClasses);
                    }} className="h-8 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900" />
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {roadmapClasses.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No classes scheduled yet. Click "Add Class" to start building your roadmap.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Class Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Class Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex gap-3 mb-2">
              <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Class Duration</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Duration of each live class</p>
              </div>
            </div>
            <select className="mt-3 w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500">
              <option>1.0 Hour</option>
              <option>1.5 Hours</option>
              <option>2.0 Hours</option>
            </select>
          </div>
          <div>
            <div className="flex gap-3 mb-2">
              <Video className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recording</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record live classes automatically</p>
              </div>
            </div>
            <div className="mt-4"><Switch defaultChecked /></div>
          </div>
          <div>
            <div className="flex gap-3 mb-2">
              <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Materials</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow sharing study materials</p>
              </div>
            </div>
            <div className="mt-4"><Switch defaultChecked /></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3Pricing = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-in fade-in duration-500 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Course Pricing</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Set up the pricing and access rules for this live course.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => setPriceType('free')}
          className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${priceType === 'free' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-xl">₹0</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Free Course</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Anyone can enroll in this live course for free.</p>
        </div>
        <div 
          onClick={() => setPriceType('paid')}
          className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${priceType === 'paid' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Paid Premium</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Requires purchase or subscription to enroll.</p>
        </div>
      </div>

      {priceType === 'paid' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Regular Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <Input type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} className="pl-8 h-12 text-lg font-medium" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Discounted Price (₹) - Optional</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="pl-8 h-12 text-lg font-medium" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Leave blank if no discount applies.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Included in Subscription</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow Premium Plan subscribers to access this course for free.</p>
                  </div>
                </div>
                <Switch checked={includedInSubscription} onCheckedChange={setIncludedInSubscription} />
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4Preview = () => (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Course Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Course Preview</h2>
          <Button variant="outline" size="sm" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> See Preview
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden mb-4 relative">
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">Live</div>
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Starts {startDate}
          </div>
          <img 
            src={coverPreview} 
            alt="Physics Course" 
            className="w-full aspect-[16/9] object-cover"
          />
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">{title}</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-6 h-6">
            <AvatarImage src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} />
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentUser?.name || 'Aman Verma'}</span>
            <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Physics Educator</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5"><PlaySquare className="w-3.5 h-3.5" /> {roadmapClasses.length} Classes</div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activeDays.length} Days/wk</div>
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {classTime}</div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{description}</p>

        {priceType === 'paid' ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">₹{discountPrice || regularPrice || 0}</span>
            <span className="text-sm text-slate-400 dark:text-slate-500 line-through">₹{regularPrice || 0}</span>
            <span className="text-xs font-bold text-green-500 dark:text-green-400">37% OFF</span>
          </div>
        ) : (
          <div className="text-xl font-bold text-green-600 dark:text-green-400">Free</div>
        )}
      </div>

      {/* Notifications Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Notifications Setup</h2>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Manage</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Notify students before course starts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">2 days before</span>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Daily class reminder to students</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">1 hour before</span>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Class starting reminder to creator</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">30 mins before</span>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <PlaySquare className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Post class recording available</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">1 hour after</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5Launch = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <Radio className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Launch!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Your live course is fully scheduled. Once launched, students can start enrolling.</p>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-left border border-slate-100 dark:border-slate-800 mb-8 grid md:grid-cols-2 gap-6">
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Schedule</p>
           <p className="font-medium text-slate-900 dark:text-white">{startDate} to {endDate}</p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Time & Days</p>
           <p className="font-medium text-slate-900 dark:text-white">{classTime} • {activeDays.length} days/week</p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Classes</p>
           <p className="font-medium text-slate-900 dark:text-white">{roadmapClasses.length} Scheduled Classes</p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pricing</p>
           <p className="font-medium text-slate-900 dark:text-white capitalize">{priceType === 'paid' ? `Paid Premium (₹${discountPrice || regularPrice || 0})` : 'Free Course'}</p>
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
         <Button type="button" onClick={() => handleSubmitLiveCourse('draft')} variant="outline" className="flex-1 h-12 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
           Save as Draft
         </Button>
         <Button onClick={() => handleSubmitLiveCourse('published')} disabled={isSubmitting} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-600/20">
           {isSubmitting ? 'Saving...' : 'Launch Course'}
         </Button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Create Live Course - Eduvirse</title>
      </Helmet>
      
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
        
        {/* Left Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex fixed h-full z-10 overflow-y-auto transition-colors duration-300">
          <div className="p-6">


            <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser?.name || 'Aman Verma'}</h3>
                  <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Physics Educator</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link, index) => {
                if (link.isGroup) {
                  return (
                    <div key={index} className="mb-2">
                      <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none mb-1 cursor-default">
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </div>
                      <div className="ml-9 space-y-1 mt-2 border-l border-slate-200 dark:border-slate-700 pl-4">
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
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
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

          <div className="mt-auto p-6">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Creator Pro Plan</h4>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3">Your plan is active</p>
              <Button variant="outline" size="sm" className="w-full bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs h-8">
                View Plan
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          
          {/* Top Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Create Live Course</h1>
            <div className="flex items-center gap-4">
              <Button type="button" onClick={() => handleSubmitLiveCourse('draft')} disabled={isSubmitting} variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium rounded-lg h-9">
                Save as Draft
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting} className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg h-9">
                {isSubmitting ? 'Saving...' : currentStep < steps.length - 1 ? `Next: ${steps[currentStep + 1]} →` : 'Launch Course'}
              </Button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
              </button>
              <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} />
              </Avatar>
            </div>
          </header>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24">
            
            {/* Stepper */}
            <div className="max-w-4xl mx-auto mb-10 mt-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 dark:bg-indigo-500 -z-10 transition-all duration-500"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((label, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  
                  return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-2 transition-colors duration-300">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30' : 
                      isCompleted ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 
                      'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive || isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                )})}
              </div>
            </div>

            {/* Dynamic Step Content */}
            {currentStep === 0 && renderStep1BasicInfo()}
            {currentStep === 1 && renderStep2Schedule()}
            {currentStep === 2 && renderStep3Pricing()}
            {currentStep === 3 && renderStep4Preview()}
            {currentStep === 4 && renderStep5Launch()}
          </div>
          
          {/* Progress Footer / Bottom Navigation */}
          <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-8 flex items-center justify-between z-10 transition-colors duration-300">
             <div className="flex items-center gap-4 flex-1">
               {currentStep > 0 ? (
                 <Button onClick={handlePrev} variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 h-10 w-24">
                   Previous
                 </Button>
               ) : (
                 <div className="w-24"></div> // Placeholder
               )}
               
               <div className="flex-1 max-w-sm hidden sm:block">
                 <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                   <span>Step {currentStep + 1} of {steps.length}</span>
                   <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                 </div>
                 <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2 bg-slate-200 dark:bg-slate-700" indicatorColor="bg-indigo-600" />
               </div>
             </div>

             <div className="flex items-center gap-3">
               {currentStep < steps.length - 1 && (
                 <Button type="button" onClick={() => handleSubmitLiveCourse('draft')} disabled={isSubmitting} variant="ghost" className="text-slate-500 dark:text-slate-400">
                   Save Draft
                 </Button>
               )}
               <Button onClick={handleNext} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 shadow-md shadow-indigo-600/20">
                 {isSubmitting ? 'Saving...' : currentStep < steps.length - 1 ? `Next: ${steps[currentStep + 1]} →` : 'Launch Course'}
               </Button>
             </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default CreateLiveCoursePage;
