import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  LayoutDashboard, FileText, GraduationCap, Radio, BarChart3, Users, DollarSign, 
  MessageSquare, HelpCircle, Settings, Bell, Play, CheckCircle2, UploadCloud, X, 
  Plus, GripVertical, Edit2, Trash2, Crown, ChevronRight, Video, Link as LinkIcon, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { categoryGroups } from '@/lib/categoriesData.js';

const UploadLecturePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const defaultThumbnail = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop';
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Basic Info', 'Content', 'Structure', 'Pricing', 'Publish'];

  // Form State
  const [title, setTitle] = useState('Laws of Motion - Complete Explanation');
  const [description, setDescription] = useState('In this lecture, we will understand the three laws of motion by Newton with real-life examples and numerical problems.');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isPremiere, setIsPremiere] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [subject, setSubject] = useState('Class 11 - Physics');
  const [classLevel, setClassLevel] = useState('Class 11');
  const [exam, setExam] = useState('JEE Main');
  const [priceType, setPriceType] = useState('paid');
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  const [regularPrice, setRegularPrice] = useState('499');
  const [discountPrice, setDiscountPrice] = useState('299');
  const [includedInSubscription, setIncludedInSubscription] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(defaultThumbnail);
  const [thumbnailAsset, setThumbnailAsset] = useState(null);
  const [videoAsset, setVideoAsset] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [importedVideoUrl, setImportedVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chapters Data
  const [chapters, setChapters] = useState([]);

  // ---- Chapter handlers ----
  const handleChapterChange = (idx, field, value) => {
    setChapters((prev) =>
      prev.map((chap, i) => (i === idx ? { ...chap, [field]: value } : chap))
    );
  };

  const handleDeleteChapter = (idx) => {
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddChapter = () => {
    setChapters((prev) => [...prev, { time: '00:00', title: '' }]);
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Content', path: '/upload', active: true },
    { icon: GraduationCap, label: 'Courses', path: '/teacher/courses' },
    { icon: Radio, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: DollarSign, label: 'Earnings', path: '/teacher/earnings' },
    { icon: MessageSquare, label: 'Comments', path: '/teacher/comments' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/teacher/support' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitCourse('published');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleLearningOutcomeChange = (index, value) => {
    setLearningOutcomes((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleAddLearningOutcome = () => {
    setLearningOutcomes((prev) => [...prev, '']);
  };

  const uploadFile = async (file, kind) => {
    const uploadedFile = await api.uploadMedia(file, kind);
    return uploadedFile;
  };

  const handleThumbnailSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Thumbnail must be 2MB or smaller.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFile = await uploadFile(file, 'thumbnail');
      setThumbnailAsset(uploadedFile);
      setThumbnailPreview(uploadedFile.url);
      toast.success('Thumbnail uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload thumbnail.');
    } finally {
      setIsSubmitting(false);
      event.target.value = '';
    }
  };

  const handleVideoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be 100MB or smaller for this upload flow.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFile = await uploadFile(file, 'video');
      setVideoAsset(uploadedFile);
      setImportedVideoUrl('');
      toast.success('Video uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload video.');
    } finally {
      setIsSubmitting(false);
      event.target.value = '';
    }
  };

  const handleImportVideoUrl = () => {
    const normalizedUrl = videoUrlInput.trim();

    if (!normalizedUrl) {
      toast.error('Please paste a video URL first.');
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      toast.error('Please enter a valid video URL.');
      return;
    }

    setImportedVideoUrl(normalizedUrl);
    setVideoAsset(null);
    toast.success('Video URL imported successfully.');
  };

  const handleSubmitCourse = async (status) => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedSubject = subject.replace(`${classLevel} - `, '').trim() || subject.trim();
    const resolvedVideoUrl = videoAsset?.url || importedVideoUrl;

    if (!normalizedTitle || !normalizedDescription) {
      toast.error('Please complete the basic lecture details first.');
      return;
    }

    if (!resolvedVideoUrl) {
      toast.error('Please upload a video file or import a video URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCourse({
        title: normalizedTitle,
        description: normalizedDescription,
        subject: normalizedSubject,
        classLevel,
        exam,
        tags,
        visibility,
        priceType,
        price: regularPrice,
        discountPrice,
        thumbnailUrl: thumbnailAsset?.url || thumbnailPreview,
        videoUrl: resolvedVideoUrl,
        videoSourceType: videoAsset ? 'upload' : 'url',
        status,
        chapters,
        learnings: learningOutcomes.filter(Boolean),
        includedInSubscription,
        isPremiere,
        scheduleTime,
      });

      toast.success(status === 'draft' ? 'Draft saved successfully.' : 'Course published successfully.');
      navigate('/teacher/courses');
    } catch (error) {
      toast.error(error.message || 'Failed to save your course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP RENDERERS
  // ---------------------------------------------------------------------------

  const renderStep1BasicInfo = () => (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left Column - Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add basic details of your lecture</p>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lecture Title <span className="text-red-500">*</span></label>
                <span className="text-xs text-slate-400">40/100</span>
              </div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 text-slate-900 dark:text-white" />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Short Description <span className="text-red-500">*</span></label>
                <span className="text-xs text-slate-400">120/500</span>
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
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Exam (Optional)</label>
                <select 
                  value={exam} 
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="None">None</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET">NEET</option>
                  <option value="CBSE Boards">CBSE Boards</option>
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">What students will learn (Key Takeaways)</label>
              <div className="space-y-3 mb-4">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] mt-0.5" />
                    <Input value={outcome} onChange={(e) => handleLearningOutcomeChange(index, e.target.value)} className="h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                  </div>
                ))}
              </div>
              <Button type="button" onClick={handleAddLearningOutcome} variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 h-9">
                <Plus className="w-4 h-4 mr-1.5" /> Add More
              </Button>
            </div>

          </div>
        </div>

        {/* Thumbnail Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thumbnail</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload a thumbnail that represents your lecture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 group">
              <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                 </div>
              </div>
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-white dark:bg-slate-800 rounded flex items-center justify-center shadow cursor-pointer text-[#6366f1] hover:text-indigo-700 dark:hover:text-indigo-400">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center aspect-video bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-4">
              <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Custom Thumbnail</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4">Recommended size: 1280x720px<br/>Max file size: 2MB</p>
              <input ref={thumbnailInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleThumbnailSelect} />
              <Button type="button" onClick={() => thumbnailInputRef.current?.click()} variant="outline" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Browse Files</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Preview & Settings */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Preview Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-300">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview <span className="text-slate-400 dark:text-slate-500 font-normal">(How students will see it)</span></h3>
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-4 bg-black relative aspect-video group cursor-pointer">
            <img src={thumbnailPreview} alt="Video cover" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-[#6366f1] transition-colors">
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-3">{title}</h4>
          <div className="flex items-center gap-3 text-xs">
            <Avatar className="w-6 h-6">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">{currentUser?.name || 'Ankit Sharma'} <CheckCircle2 className="w-3 h-3 text-[#6366f1] fill-[#6366f1]/20" /></span>
            <span className="text-slate-500 dark:text-slate-400">{currentUser?.headline || 'Educator'}</span>
          </div>
        </div>

        {/* Content Visibility */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-300">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Content Visibility</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="visibility" 
                value="public" 
                checked={visibility === 'public'} 
                onChange={() => setVisibility('public')} 
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Public</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Anyone can search and watch</p>
                {visibility === 'public' && (
                  <div className="mt-3 pl-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isPremiere && visibility === 'public'}
                        onChange={(e) => setIsPremiere(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Set as instant Premiere</span>
                    </label>
                  </div>
                )}
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="visibility" 
                value="unlisted" 
                checked={visibility === 'unlisted'} 
                onChange={() => setVisibility('unlisted')} 
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unlisted</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Only people with the link can watch</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="visibility" 
                value="private" 
                checked={visibility === 'private'} 
                onChange={() => setVisibility('private')} 
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Private</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Only you and selected people can view</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="visibility" 
                value="schedule" 
                checked={visibility === 'schedule'} 
                onChange={() => setVisibility('schedule')} 
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Schedule</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a date to make your video public</p>
                {visibility === 'schedule' && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date and time</label>
                      <input 
                        type="datetime-local" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:text-slate-200" 
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={isPremiere && visibility === 'schedule'}
                        onChange={(e) => setIsPremiere(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as Premiere</span>
                    </label>
                    {isPremiere && visibility === 'schedule' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        A public watch page will be created right away, and your video will premiere on the scheduled date.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );

  const renderStep2Content = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Video Content</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Drag and drop your video file here, or browse from your computer.</p>
      
      <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 rounded-2xl p-12 bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
          <Video className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select Video File</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          MP4, WebM, or OGG. Maximum file size 5GB. We recommend 1080p resolution.
        </p>
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={handleVideoSelect} />
        <Button type="button" onClick={() => videoInputRef.current?.click()} className="bg-[#6366f1] hover:bg-indigo-600 text-white px-8">
          Browse Files
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Import from URL (YouTube, Vimeo, etc.)</p>
          <div className="flex mt-2 gap-2">
            <Input value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="Paste video URL here..." className="bg-white dark:bg-slate-900" />
            <Button type="button" onClick={handleImportVideoUrl} variant="outline">Import</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3Structure = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lecture Chapters</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Break down your video into bite-sized chapters for easier navigation.</p>
        </div>
        <Button variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
          <Play className="w-4 h-4 mr-2" /> Auto-generate from Transcript
        </Button>
      </div>

      <div className="space-y-3 mb-6">
        {chapters.map((chap, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab shrink-0" />
            <div className="w-24">
              <Input 
                value={chap.time} 
                onChange={(e) => handleChapterChange(idx, 'time', e.target.value)} 
                className="bg-white dark:bg-slate-900 font-mono text-center" 
                placeholder="00:00"
              />
            </div>
            <div className="flex-1">
              <Input 
                value={chap.title} 
                onChange={(e) => handleChapterChange(idx, 'title', e.target.value)} 
                className="bg-white dark:bg-slate-900" 
                placeholder="Chapter Title"
              />
            </div>
            <div className="flex items-center gap-2 px-2">
              <button onClick={() => {}} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteChapter(idx)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      
      <Button onClick={handleAddChapter} className="w-full h-12 border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
        <Plus className="w-5 h-5 mr-2" /> Add New Chapter
      </Button>
    </div>
  );

  const renderStep4Pricing = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-in fade-in duration-500 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Course Pricing</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Set up the pricing and access rules for this content.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => setPriceType('free')}
          className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${priceType === 'free' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-xl">₹0</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Free Content</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Anyone can access this lecture for free.</p>
        </div>
        <div 
          onClick={() => setPriceType('paid')}
          className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${priceType === 'paid' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Paid Premium</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Requires purchase or subscription.</p>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow Premium Plan subscribers to access this for free.</p>
                  </div>
                </div>
                <Switch checked={includedInSubscription} onCheckedChange={setIncludedInSubscription} />
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep5Publish = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Publish!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Everything looks perfect. Your lecture is ready to go live and reach students.</p>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-left border border-slate-100 dark:border-slate-800 mb-8 grid md:grid-cols-2 gap-6">
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Title</p>
           <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Subject & Level</p>
           <p className="font-medium text-slate-900 dark:text-white">{subject.replace(`${classLevel} - `, '')} • {classLevel}</p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Visibility</p>
           <p className="font-medium text-slate-900 dark:text-white capitalize flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> {visibility}
           </p>
        </div>
        <div>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pricing</p>
           <p className="font-medium text-slate-900 dark:text-white capitalize">{priceType === 'paid' ? `Paid Premium (₹${discountPrice || regularPrice || 0})` : 'Free'}</p>
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
         <Button type="button" onClick={() => handleSubmitCourse('draft')} variant="outline" className="flex-1 h-12 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
           Save as Draft
         </Button>
         <Button onClick={() => handleSubmitCourse('published')} disabled={isSubmitting} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-600/20">
           {isSubmitting ? 'Saving...' : 'Publish Now'}
         </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex">
      <Helmet>
        <title>Upload Lecture - Eduvirse</title>
      </Helmet>

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col py-6 px-4 space-y-8 sticky top-0 h-screen overflow-y-auto transition-colors duration-300">


        <div className="flex items-center gap-3 px-2">
          <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>{currentUser?.name?.charAt(0) || 'T'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Ankit Sharma'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.headline || 'Educator'}</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {sidebarLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Premium Plan</p>
            </div>
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-3">Active</p>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mb-3 leading-relaxed">You're enjoying premium features</p>
            <Button size="sm" className="w-full bg-[#6366f1] hover:bg-indigo-600 text-white rounded-lg h-9">
              View Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Upload Lecture</h1>
          <div className="flex items-center gap-4">
            <Button type="button" onClick={() => handleSubmitCourse('draft')} disabled={isSubmitting} variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
              Save as Draft
            </Button>
            <Button onClick={handleNext} disabled={isSubmitting} className="bg-[#6366f1] hover:bg-indigo-600 text-white">
              {isSubmitting ? 'Saving...' : currentStep < steps.length - 1 ? `Next: ${steps[currentStep + 1]}` : 'Publish Course'}
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || 'T'}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser?.name || 'Ankit Sharma'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">Creator <ChevronRight className="w-3 h-3 rotate-90" /></p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            
            {/* Stepper */}
            <div className="flex items-center justify-between relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-0 before:w-full before:h-px before:bg-slate-200 dark:before:bg-slate-800 before:-z-10">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                
                return (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1 transition-colors duration-300">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-[#6366f1] text-white ring-4 ring-indigo-50 dark:ring-indigo-900/30' : isCompleted ? 'bg-[#6366f1] text-white' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${isActive || isCompleted ? 'text-[#6366f1] dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{step}</span>
                </div>
              )})}
            </div>

            {/* Dynamic Step Content */}
            {currentStep === 0 && renderStep1BasicInfo()}
            {currentStep === 1 && renderStep2Content()}
            {currentStep === 2 && renderStep3Structure()}
            {currentStep === 3 && renderStep4Pricing()}
            {currentStep === 4 && renderStep5Publish()}

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
                   <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2 bg-slate-200 dark:bg-slate-700" indicatorColor="bg-[#6366f1]" />
                 </div>
               </div>

               <div className="flex items-center gap-3">
                 {currentStep < steps.length - 1 && (
                   <Button type="button" onClick={() => handleSubmitCourse('draft')} disabled={isSubmitting} variant="ghost" className="text-slate-500 dark:text-slate-400">
                     Save Draft
                   </Button>
                 )}
                 <Button onClick={handleNext} disabled={isSubmitting} className="bg-[#6366f1] hover:bg-indigo-600 text-white h-10 px-6 shadow-md shadow-indigo-600/20">
                   {isSubmitting ? 'Saving...' : currentStep < steps.length - 1 ? `Next: ${steps[currentStep + 1]} →` : 'Publish Course ✓'}
                 </Button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadLecturePage;
