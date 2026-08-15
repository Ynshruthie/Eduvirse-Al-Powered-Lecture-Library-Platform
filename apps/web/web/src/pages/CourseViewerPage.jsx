import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft, Menu, X, PlayCircle, CheckCircle, Play, Pause, RotateCcw,
  Volume2, VolumeX, Maximize2, Minimize2, Settings, Bell, Share2, MoreVertical,
  Search, Check, ChevronDown, ChevronUp, MessageSquare, Plus, Send,
  Trophy, FileText, Info, Award, HelpCircle, Calendar, Sparkles, Sliders, ChevronRight, Download,
  Sun, Moon, GraduationCap, Clock
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Live now');
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m ${s}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return <span>{timeLeft}</span>;
};

// Define the comprehensive Udemy-style lectures list matching Section 1 in the screenshot.
const DEFAULT_LECTURES = [
  {
    id: 'l1',
    title: 'Welcome To The Course!',
    duration: '4min',
    seconds: 240,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    resources: [
      { name: 'Course Syllabus PDF', url: '#' },
      { name: 'Join Discord Community', url: '#' }
    ]
  },
  {
    id: 'l2',
    title: 'Joining The Community Chat & Groups',
    duration: '1min',
    seconds: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    resources: []
  },
  {
    id: 'l3',
    title: 'Curriculum Walkthrough',
    duration: '4min',
    seconds: 240,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    resources: [
      { name: 'Course Roadmap Image', url: '#' }
    ]
  },
  {
    id: 'l4',
    title: 'When Was The Course Last Updated?',
    duration: '2min',
    seconds: 120,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    resources: []
  },
  {
    id: 'l5',
    title: 'Course Change Log',
    duration: '1min',
    seconds: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    resources: []
  },
  {
    id: 'l6',
    title: 'Will I Get A Job?',
    duration: '6min',
    seconds: 360,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    resources: []
  },
  {
    id: 'l7',
    title: 'Accessing Course Code & Slides',
    duration: '2min',
    seconds: 120,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    resources: [
      { name: 'Section 1 Code Files.zip', url: '#' },
      { name: 'Access Slides Presentation', url: '#' }
    ]
  },
  {
    id: 'l8',
    title: 'Tips On The Interactive Coding Exercises',
    duration: '3min',
    seconds: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    resources: []
  },
  {
    id: 'l9',
    title: 'Working with Code Examples',
    duration: '4min',
    seconds: 240,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    resources: []
  },
  {
    id: 'l10',
    title: 'Asking for Help',
    duration: '4min',
    seconds: 240,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    resources: [
      { name: 'FAQ Document PDF', url: '#' }
    ]
  }
];

const SECTION_2_LECTURES = [
  {
    id: 'l11',
    title: 'HTML Core Concepts',
    duration: '10min',
    seconds: 600,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    resources: []
  },
  {
    id: 'l12',
    title: 'CSS Selectors & Layouts',
    duration: '15min',
    seconds: 900,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    resources: []
  },
  {
    id: 'l13',
    title: 'Responsive Web Design Intro',
    duration: '7min',
    seconds: 420,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    resources: []
  }
];

const LECTURE_TRANSCRIPTS = {
  'l1': [
    { time: 0, text: "Welcome to Eduvirse! Today we're kicking off our full-stack engineering masterclass." },
    { time: 4, text: "I'm Colt Steele, and I'll be guiding you through HTML, CSS, React, and Node." },
    { time: 8, text: "We will establish a solid foundation in CSS styling, layout structure, and DOM interaction." },
    { time: 13, text: "Make sure you check the course syllabus and join our community Discord server." },
    { time: 18, text: "Everything is fully interactive, and you can track your progress right here." },
    { time: 24, text: "Let's get started!" }
  ],
  'l2': [
    { time: 0, text: "Let's talk about joining the community groups." },
    { time: 5, text: "You will find links to our Discord channel in the resources folder." },
    { time: 10, text: "Our community is full of thousands of developers helping each other learn." },
    { time: 15, text: "It's highly recommended to join and post your project progress there." },
    { time: 20, text: "Let's move on to the curriculum walkthrough." }
  ],
  'l7': [
    { time: 0, text: "Welcome back! In this video, we cover accessing course code and slides." },
    { time: 4, text: "If you look at the resources dropdown below, you'll find the slide presentation." },
    { time: 8, text: "I've also attached Section 1 Code Files as a ZIP package." },
    { time: 12, text: "Simply click and extract it to follow along with the code." },
    { time: 16, text: "If you face any issues with npm packages, try --legacy-peer-deps flag." },
    { time: 21, text: "Now let's open up the project structure in VS Code." }
  ]
};

const DEFAULT_TRANSCRIPT = [
  { time: 0, text: "Welcome back to another lecture in this full-stack course." },
  { time: 5, text: "In this section, we are diving deep into the developer setups and slide resources." },
  { time: 10, text: "Make sure you download the attached package files from the resources dropdown." },
  { time: 15, text: "If you run into peer dependency warnings, simply append --legacy-peer-deps to your npm install." },
  { time: 20, text: "Let's proceed by inspecting the configuration settings together." },
  { time: 27, text: "In Section 2, we will write our stylesheet components, set up responsive grids, and design UI mockups." },
  { time: 35, text: "Notice how variables are configured under the :root root element inside index.css." },
  { time: 42, text: "Clicking on any line here will instantly seek the video to that moment in time." },
  { time: 50, text: "Let's keep progressing. Mark this lecture complete when you are ready to proceed." }
];

const CourseViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // States
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Custom video lists
  const [section1Open, setSection1Open] = useState(true);
  const [section2Open, setSection2Open] = useState(false);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [allLecturesList, setAllLecturesList] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  
  // Interactive bottom tabs
  const [activeBottomTab, setActiveBottomTab] = useState('Overview');
  const bottomTabs = ["Overview", "AI Summary", "Q&A", "Notes", "Announcements", "Reviews", "Learning tools"];

  // Sidebar controls
  const [activeSideTab, setActiveSideTab] = useState('Course content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openResourcesId, setOpenResourcesId] = useState(null);
  const [showAssessmentBanner, setShowAssessmentBanner] = useState(true);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  
  // Custom Video Player controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [showCaptions, setShowCaptions] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Q&A State
  const [searchQa, setSearchQa] = useState('');
  const [qaList, setQaList] = useState([]);
  const [newQaTitle, setNewQaTitle] = useState('');
  const [newQaContent, setNewQaContent] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [replyInputText, setReplyInputText] = useState({});

  // Notes State
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');

  // AI Assistant Chat State
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Eduvirse AI Assistant. Ask me anything about our current lecture or code structure!"
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Transcript & Theme State
  const [searchTranscript, setSearchTranscript] = useState('');
  const [theme, setTheme] = useState('light');

  // AI Summary State
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);

  useEffect(() => {
    if (activeBottomTab === 'AI Summary' && currentLecture) {
      const fetchAiSummary = async () => {
        setIsAiSummaryLoading(true);
        try {
          // lecture object uses 'id' usually, but since this might be a mockup, we'll try 'l1'
          let summaryData;
          try {
            summaryData = await api.getLectureSummary(currentLecture.id);
          } catch (err) {
            // Fallback: Check if the summary was generated for the course ID instead
            if (id) {
              summaryData = await api.getLectureSummary(id);
            } else {
              throw err;
            }
          }
          setAiSummary(summaryData);
        } catch (error) {
          console.error('Failed to fetch AI summary:', error);
          setAiSummary(null);
        } finally {
          setIsAiSummaryLoading(false);
        }
      };
      fetchAiSummary();
    }
  }, [activeBottomTab, currentLecture]);

  // Study Reminders State
  const [learningReminders, setLearningReminders] = useState([
    { id: 1, time: '8:00 AM', frequency: 'Daily', addedToCalendar: true, showMenu: false }
  ]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderFreq, setReminderFreq] = useState('Daily');

  // Reviews State
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      author: "Luis Alfredo Carrillo S.",
      initials: "LS",
      rating: 5,
      date: "3 weeks ago",
      content: "Este curso es verdaderamente muy bueno, es largo pero aprendes las distintas formas de hacer un sitio web y todos sus componentes por separado. Pero sobre todo, es increíble comprender a gran profundidad cada segmento de lo que vas a desarrollar. Muy recomendado.",
      helpfulCount: 12,
      unhelpfulCount: 2,
      voted: null
    },
    {
      id: 2,
      author: "David M.",
      initials: "DM",
      rating: 5,
      date: "3 days ago",
      content: "Incredible detail and explanations! The instructor goes at a perfect speed and code files are very helpful.",
      helpfulCount: 4,
      unhelpfulCount: 0,
      voted: null
    },
    {
      id: 3,
      author: "Sophia K.",
      initials: "SK",
      rating: 4,
      date: "1 week ago",
      content: "This is the absolute best bootcamp on the internet. Highly recommend it!",
      helpfulCount: 8,
      unhelpfulCount: 1,
      voted: null
    }
  ]);
  const [searchReviewText, setSearchReviewText] = useState('');
  const [filterRating, setFilterRating] = useState('All');

  // Assessment Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions = [
    {
      question: "Which HTML5 tag represents the primary, non-repeated core container of a page?",
      options: ["<section>", "<body>", "<main>", "<div>"],
      correct: 2
    },
    {
      question: "What does CSS stand for?",
      options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
      correct: 1
    },
    {
      question: "Which React hook is standard for executing side-effects and resource cleanups?",
      options: ["useState", "useContext", "useEffect", "useMemo"],
      correct: 2
    },
    {
      question: "Which of the following is correct arrow function syntax?",
      options: ["() => {}", "function() => {}", "() -> {}", "def() => {}"],
      correct: 0
    }
  ];

  // Fetch course metadata
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseData = await api.getCourseById(id);
        
        setCourse({
          ...courseData,
          subtitle: courseData.subtitle || `Become an expert with this detailed step-by-step masterclass course.`,
          description: courseData.description || `Master the core foundations and practical applications through real-world projects.`,
          instructor: { name: courseData.instructor || courseData.teacherName || "Eduvirse Instructor" },
          rating: parseFloat(courseData.rating || 0),
          enrollmentCount: courseData.enrollmentCount || 0,
          ratingCount: courseData.ratingCount || 0,
          totalDuration: courseData.totalDuration || '0 mins',
          thumbnail: courseData.thumbnailUrl || courseData.thumbnail
        });

        // Fetch extra data
        const [lecturesRes, qaRes, enrollmentsRes] = await Promise.all([
          api.getCourseLectures(id).catch(() => []),
          api.getCourseQa(id).catch(() => []),
          api.getMyEnrollments().catch(() => [])
        ]);

        let lectures = lecturesRes.length > 0 ? lecturesRes : [];
        if (lectures.length === 0 && courseData.videos && courseData.videos.length > 0 && courseData.videos[0].url) {
          lectures = [{
            id: 'uploaded-video',
            title: courseData.videos[0].title || courseData.title || 'Course Video',
            duration: courseData.videos[0].duration || courseData.totalDuration || '0 mins',
            videoUrl: courseData.videos[0].url,
            resources: []
          }];
        } else if (lectures.length === 0) {
          lectures = [...DEFAULT_LECTURES, ...SECTION_2_LECTURES];
        }

        setAllLecturesList(lectures);
        if (lectures.length > 0) setCurrentLecture(lectures[0]);
        
        if (qaRes.length > 0) {
          setQaList(qaRes);
        }

        const enrollment = enrollmentsRes.find(e => String(e.courseId) === String(id));
        if (enrollment) {
          setIsEnrolled(true);
          if (enrollment.completedLectures) {
            setCompletedLectures(new Set(enrollment.completedLectures));
          }
        }

      } catch (fetchError) {
        setError("Failed to load course details. It may have been removed or you don't have access.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    let wsUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    wsUrl = wsUrl.replace('/api', '');

    const newSocket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    const roomId = `course_view_${id}`;

    newSocket.on('connect', () => {
      newSocket.emit('join_room', roomId);
    });

    newSocket.on('qa_new_question', (question) => {
      setQaList(prev => {
        if (prev.find(q => String(q.id) === String(question.id))) return prev;
        return [question, ...prev];
      });
    });

    newSocket.on('qa_new_reply', ({ qaId, reply }) => {
      setQaList(prev => prev.map(qa => {
        if (String(qa.id) === String(qaId)) {
          const exists = qa.replies?.find(r => r.content === reply.content && r.author === reply.author);
          if (exists) return qa;
          return { ...qa, replies: [...(qa.replies || []), reply] };
        }
        return qa;
      }));
    });

    newSocket.on('view_count_updated', ({ courseId }) => {
      if (String(courseId) === String(id)) {
        setCourse(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
      }
    });

    // Notify others that we are viewing
    newSocket.emit('increment_view', { courseId: id });
    
    // Also notify backend to persist
    api.incrementCourseViews(id).catch(err => console.error("Failed to increment views:", err));

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_room', roomId);
      newSocket.disconnect();
    };
  }, [id]);

  // Video listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
    };
  }, [currentLecture]);

  // Sync theme with local storage and document configuration
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const progressPercent = Math.round(allLecturesList.length ? (completedLectures.size / allLecturesList.length) * 100 : 0);

  const activeTranscript = currentLecture ? LECTURE_TRANSCRIPTS[currentLecture.id] || DEFAULT_TRANSCRIPT : DEFAULT_TRANSCRIPT;
  const filteredTranscript = activeTranscript.filter(line => 
    line.text.toLowerCase().includes(searchTranscript.toLowerCase())
  );

  // Time formatter
  // Dynamic notes based on video
  useEffect(() => {
    if (!currentLecture) return;
    
    const titleOrUrl = `${currentLecture.title} ${currentLecture.videoUrl}`.toLowerCase();
    const lectureTitle = currentLecture.title || 'Current Lecture';
    
    if (titleOrUrl.includes('paramecium') || titleOrUrl.includes('nutrition')) {
      setNotes([
        { id: 1, timestamp: 4, displayTime: '00:04', lectureTitle, text: 'Holozoic nutrition means ingesting solid food.' },
        { id: 2, timestamp: 13, displayTime: '00:13', lectureTitle, text: 'Cytostome acts as the mouth where food enters the vacuole.' }
      ]);
    } else if (titleOrUrl.includes('cell cycle') || titleOrUrl.includes('m-phase') || titleOrUrl.includes('m phase')) {
      setNotes([
        { id: 1, timestamp: 9, displayTime: '00:09', lectureTitle, text: 'Remember PMAT: Prophase, Metaphase, Anaphase, Telophase.' },
        { id: 2, timestamp: 19, displayTime: '00:19', lectureTitle, text: 'Metaphase equator alignment is crucial for equal DNA split.' }
      ]);
    } else if (titleOrUrl.includes('digestive system')) {
      setNotes([
        { id: 1, timestamp: 9, displayTime: '00:09', lectureTitle, text: 'Esophagus acts as the transport tube.' },
        { id: 2, timestamp: 19, displayTime: '00:19', lectureTitle, text: 'Small intestine is where most nutrient absorption happens, NOT stomach!' }
      ]);
    } else if (titleOrUrl.includes('laws of motion') || titleOrUrl.includes('newton')) {
      setNotes([
        { id: 1, timestamp: 9, displayTime: '00:09', lectureTitle, text: '1st Law is also known as the Law of Inertia.' },
        { id: 2, timestamp: 14, displayTime: '00:14', lectureTitle, text: 'F=ma is the core equation for 2nd Law mechanics problems.' }
      ]);
    } else {
      setNotes([
        { id: 1, timestamp: 10, displayTime: '00:10', lectureTitle, text: 'Important: Always review these core fundamentals before exams.' }
      ]);
    }
  }, [currentLecture]);

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Video control triggers
  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!isEnrolled) {
        try {
          await api.enrollCourse(id);
          setIsEnrolled(true);
          toast.success("Successfully enrolled in this course!");
        } catch (e) {
          // Ignore error if already enrolled
        }
      }
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleTimeUpdate = (e) => {
    const current = e.target.currentTime;
    setCurrentTime(current);
    
    if (duration > 0 && (current / duration) >= 0.9 && currentLecture?.id) {
      if (!completedLectures.has(currentLecture.id)) {
        const nextCompleted = new Set(completedLectures);
        nextCompleted.add(currentLecture.id);
        setCompletedLectures(nextCompleted);
        toast.success("Lecture automatically marked as completed!");
        api.updateCourseProgress(id, Array.from(nextCompleted)).catch(console.error);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const skipTime = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount));
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast.error("Fullscreen not supported");
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Sync active lecture change
  const selectLecture = (lecture) => {
    setCurrentLecture(lecture);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
    // Auto-scroll context or alert resources availability
    if (lecture.resources.length > 0) {
      toast.info(`Resources available for: ${lecture.title}`);
    }
  };

  const goToNextLecture = () => {
    const currentIndex = allLecturesList.findIndex(l => l.id === currentLecture.id);
    if (currentIndex !== -1 && currentIndex < allLecturesList.length - 1) {
      selectLecture(allLecturesList[currentIndex + 1]);
    }
  };

  const goToPrevLecture = () => {
    const currentIndex = allLecturesList.findIndex(l => l.id === currentLecture.id);
    if (currentIndex > 0) {
      selectLecture(allLecturesList[currentIndex - 1]);
    }
  };

  // Checkbox toggle
  const toggleLectureCompleted = async (lectureId, e) => {
    e.stopPropagation();
    const nextCompleted = new Set(completedLectures);
    if (nextCompleted.has(lectureId)) {
      nextCompleted.delete(lectureId);
      toast.success("Marked as incomplete");
    } else {
      nextCompleted.add(lectureId);
      toast.success("Lecture completed!");
    }
    setCompletedLectures(nextCompleted);
    
    try {
      await api.updateCourseProgress(id, Array.from(nextCompleted));
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  // Add Q&A Question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQaTitle.trim() || !newQaContent.trim()) {
      toast.error("Please provide both a title and description");
      return;
    }
    const newQuestion = {
      title: newQaTitle,
      content: newQaContent,
      votes: 0,
      lecture: currentLecture?.title || 'General',
      replies: []
    };
    
    try {
      const savedQa = await api.postCourseQa(id, newQuestion);
      if (socket) {
        socket.emit('qa_new_question', { roomId: `course_view_${id}`, question: savedQa });
      } else {
        setQaList([savedQa, ...qaList]);
      }
      setNewQaTitle('');
      setNewQaContent('');
      setIsAddingQuestion(false);
      toast.success("Question posted successfully!");
    } catch (err) {
      toast.error("Failed to post question");
    }
  };

  // Submit Q&A Reply
  const handlePostReply = async (qaId) => {
    const replyText = replyInputText[qaId];
    if (!replyText || !replyText.trim()) return;

    const reply = {
      author: currentUser?.name || 'Demo Student',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      content: replyText,
      date: new Date().toISOString()
    };

    try {
      // In a real app we'd save this reply to the backend via an API endpoint.
      // Here we broadcast it via Socket.IO so other users see it immediately.
      if (socket) {
        socket.emit('qa_new_reply', { roomId: `course_view_${id}`, qaId, reply });
      } else {
        setQaList(qaList.map(qa => {
          if (String(qa.id) === String(qaId)) {
            return { ...qa, replies: [...(qa.replies || []), reply] };
          }
          return qa;
        }));
      }

      setReplyInputText({ ...replyInputText, [qaId]: '' });
      toast.success("Reply posted!");
    } catch (err) {
      toast.error("Failed to post reply");
    }
  };

  // Save Video Note
  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const newNote = {
      id: Date.now(),
      timestamp: currentTime,
      displayTime: formatTime(currentTime),
      lectureTitle: currentLecture.title,
      text: noteInput
    };
    setNotes([newNote, ...notes]);
    setNoteInput('');
    toast.success("Note saved at " + newNote.displayTime);
  };

  const jumpToNoteTime = (time) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Study Reminder Functions
  const handleAddReminder = (e) => {
    e.preventDefault();
    const [h, m] = reminderTime.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${m} ${ampm}`;

    const newReminder = {
      id: Date.now(),
      time: formattedTime,
      frequency: reminderFreq,
      addedToCalendar: true,
      showMenu: false
    };

    setLearningReminders([...learningReminders, newReminder]);
    setIsAddingReminder(false);
    toast.success(`Learning reminder scheduled at ${formattedTime} (${reminderFreq})`);
  };

  const handleDeleteReminder = (reminderId) => {
    setLearningReminders(prev => prev.filter(r => r.id !== reminderId));
    toast.success("Learning reminder removed");
  };

  const toggleReminderMenu = (reminderId) => {
    setLearningReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, showMenu: !r.showMenu } : { ...r, showMenu: false }
    ));
  };

  // Review Voting Function
  const handleVoteReview = (reviewId, type) => {
    setReviewsList(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        if (rev.voted === type) {
          // Toggle off
          return {
            ...rev,
            voted: null,
            helpfulCount: type === 'helpful' ? rev.helpfulCount - 1 : rev.helpfulCount,
            unhelpfulCount: type === 'unhelpful' ? rev.unhelpfulCount - 1 : rev.unhelpfulCount
          };
        } else {
          // Toggle on
          let helpDiff = 0;
          let unhelpDiff = 0;
          if (type === 'helpful') {
            helpDiff = 1;
            if (rev.voted === 'unhelpful') unhelpDiff = -1;
          } else {
            unhelpDiff = 1;
            if (rev.voted === 'helpful') helpDiff = -1;
          }
          return {
            ...rev,
            voted: type,
            helpfulCount: rev.helpfulCount + helpDiff,
            unhelpfulCount: rev.unhelpfulCount + unhelpDiff
          };
        }
      }
      return rev;
    }));
  };

  // Send AI Chat
  const handleSendAi = async (textToSend = aiInput) => {
    const msg = textToSend || aiInput;
    if (!msg.trim()) return;

    const userMessage = { sender: 'user', text: msg };
    const newMessages = [...aiMessages, userMessage];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages,
          lectureTitle: currentLecture?.title || course.subtitle,
          lectureSummary: aiSummary?.summary || 'NOT_GENERATED'
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setAiMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setAiMessages(prev => [...prev, { sender: 'ai', text: "I'm having a little trouble connecting to my AI brain right now." }]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setAiMessages(prev => [...prev, { sender: 'ai', text: "I'm having a little trouble connecting to my AI brain right now." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Submit Quiz Assessment
  const handleQuizAnswer = (qIdx, oIdx) => {
    setSelectedQuizAnswers({
      ...selectedQuizAnswers,
      [qIdx]: oIdx
    });
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correct) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setCurrentQuizQuestion(0);
  };

  // Smart subtitle mapping for demo videos
  const getSubtitles = () => {
    const titleOrUrl = `${currentLecture?.title} ${currentLecture?.videoUrl}`.toLowerCase();
    let transcript = [];

    if (titleOrUrl.includes('paramecium') || titleOrUrl.includes('nutrition')) {
      transcript = [
        { time: 0, text: "Paramecium is a single-celled organism found in aquatic environments." },
        { time: 4, text: "It exhibits holozoic nutrition, meaning it ingests solid food particles." },
        { time: 8, text: "Using its cilia, it sweeps food like bacteria into its oral groove." },
        { time: 13, text: "The food enters the cytostome and gets packaged into a food vacuole." },
        { time: 18, text: "Inside the vacuole, enzymes break down the food for absorption." },
        { time: 23, text: "Finally, the undigested waste is expelled through the anal pore." }
      ];
    } else if (titleOrUrl.includes('cell cycle') || titleOrUrl.includes('m-phase') || titleOrUrl.includes('m phase')) {
      transcript = [
        { time: 0, text: "Welcome to this lesson on the M-phase of the cell cycle." },
        { time: 4, text: "The M-phase, or mitosis, is where the actual cell division occurs." },
        { time: 9, text: "It is divided into prophase, metaphase, anaphase, and telophase." },
        { time: 14, text: "During prophase, the chromatin condenses into visible chromosomes." },
        { time: 19, text: "In metaphase, chromosomes align perfectly at the cell's equator." },
        { time: 24, text: "This ensures each daughter cell will receive an exact copy of the DNA." }
      ];
    } else if (titleOrUrl.includes('digestive system')) {
      transcript = [
        { time: 0, text: "Let's explore how the human digestive system works." },
        { time: 4, text: "Digestion begins in the mouth where food is chewed and mixed with saliva." },
        { time: 9, text: "The food then travels down the esophagus into the stomach." },
        { time: 14, text: "In the stomach, strong acids break the food down into a liquid mixture." },
        { time: 19, text: "Next, it enters the small intestine where nutrients are absorbed." },
        { time: 24, text: "Finally, waste passes into the large intestine and is eliminated." }
      ];
    } else if (titleOrUrl.includes('laws of motion') || titleOrUrl.includes('newton')) {
      transcript = [
        { time: 0, text: "Today we will study Newton's Three Laws of Motion." },
        { time: 4, text: "The First Law states that an object at rest stays at rest unless acted upon by a force." },
        { time: 9, text: "This property of matter resisting changes in motion is called inertia." },
        { time: 14, text: "The Second Law tells us that Force equals mass times acceleration (F=ma)." },
        { time: 19, text: "The heavier the object, the more force is required to move it." },
        { time: 24, text: "And the Third Law states: for every action, there is an equal and opposite reaction." }
      ];
    } else {
      // Fallback dynamic captions
      const title = currentLecture?.title || course?.title || 'this lesson';
      const subject = course?.subject || course?.category || 'our topic';
      transcript = [
        { time: 0, text: `Hello everyone! Welcome to this lecture on ${title}.` },
        { time: 6, text: `Today, we are going to dive deep into the core concepts of ${subject}.` },
        { time: 12, text: `Before we begin, make sure you have your study materials ready.` },
        { time: 18, text: `Let's start by looking at a fundamental example to understand how this works.` },
        { time: 24, text: `Notice how these principles apply directly to real-world scenarios.` }
      ];
    }

    // Find the current subtitle line
    let currentSubtitle = transcript[0].text;
    for (let i = 0; i < transcript.length; i++) {
      if (currentTime >= transcript[i].time) {
        currentSubtitle = transcript[i].text;
      } else {
        break;
      }
    }
    
    // Clear subtitles after 30 seconds if we run out of mock data, or repeat
    if (currentTime > 30) {
       return `Let's proceed to the next part of the explanation.`;
    }

    return currentSubtitle;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6"><Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-800" /></div>
        <div className="flex-1 flex animate-pulse">
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-32 w-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="w-96 border-l border-slate-200 dark:border-slate-800 p-4">
            <Skeleton className="h-10 w-full mb-4 bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-slate-200 dark:bg-slate-800" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course || !currentLecture) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-250">
        <h2 className="text-2xl font-bold mb-4">{error || (!currentLecture ? 'Loading lectures...' : 'Course not found')}</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Filtered QA
  const filteredQa = qaList.filter(qa => 
    qa.title.toLowerCase().includes(searchQa.toLowerCase()) || 
    qa.content.toLowerCase().includes(searchQa.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>{`${currentLecture.title} - Eduvirse Player`}</title>
      </Helmet>

      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-all duration-300">
        
        {/* Header (Branded as Eduvirse, matching top navbar from Udemy screenshot, using same theme as Home Page) */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 justify-between select-none z-20 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors flex items-center gap-2 group text-slate-850 dark:text-white">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Eduvirse
                </span>
              </div>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[200px] md:max-w-md">
              {course.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 transition-colors">
                <Trophy className="w-4 h-4 text-primary" />
                <span>Your progress</span>
                <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="text-primary">{progressPercent}%</span>
                <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              </button>
              
              {/* Dropdown panel */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-lg p-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-50 text-slate-800 dark:text-slate-200">
                <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-white">Course completion</h4>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{completedLectures.size} of {allLecturesList.length} items complete</span>
                  <span className="font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Check lectures off in the playlist sidebar to update your overall progress and certificate eligibility.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Course link copied to clipboard!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Sun className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </Button>

            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors ${sidebarOpen ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Layout Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column (Video Player + Bottom Tabs) */}
          <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
            
            {/* Custom Video Player Container (remains black for ideal viewing) */}
            <div 
              ref={playerContainerRef}
              className={`relative bg-black w-full aspect-video flex-shrink-0 group/player ${
                isTheaterMode && !isFullscreen ? 'max-h-[75vh]' : ''
              }`}
            >
              {course.scheduleTime && new Date(course.scheduleTime) > new Date() ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 text-white">
                   <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/50">
                     <Clock className="w-8 h-8 text-amber-500" />
                   </div>
                   <h2 className="text-2xl font-bold mb-2">Premiere starting in</h2>
                   <div className="text-4xl font-mono font-bold text-amber-400">
                     <CountdownTimer targetDate={course.scheduleTime} />
                   </div>
                   <p className="text-slate-400 mt-4 max-w-sm text-center">Hang tight! The video will be available to watch once the countdown ends.</p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    key={currentLecture?.id}
                    className="w-full h-full object-contain cursor-pointer"
                    autoPlay={isPlaying}
                    playsInline
                    muted={isMuted}
                    src={currentLecture?.videoUrl?.includes('commondatastorage.googleapis.com') ? currentLecture.videoUrl.replace('http://', 'https://') : currentLecture?.videoUrl}
                    onClick={togglePlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={(e) => setDuration(e.target.duration)}
                  />

                  {/* Subtitles Overlay */}
                  {showCaptions && isPlaying && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-1.5 rounded text-sm md:text-base text-white text-center pointer-events-none max-w-[80%] font-medium border border-zinc-800 shadow-md">
                      {getSubtitles()}
                    </div>
                  )}
                </>
              )}

              {/* Big Centered Play Button when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none transition-all duration-200">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                </div>
              )}

              {/* Left and Right Navigation Buttons overlay (Purple backgrounds `<` and `>`) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200">
                <button
                  onClick={goToPrevLecture}
                  disabled={allLecturesList.findIndex(l => l.id === currentLecture.id) === 0}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 active:scale-90"
                  title="Previous Lecture"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200">
                <button
                  onClick={goToNextLecture}
                  disabled={allLecturesList.findIndex(l => l.id === currentLecture.id) === allLecturesList.length - 1}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 active:scale-90"
                  title="Next Lecture"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              {/* Custom Video Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col gap-2 opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity duration-200 select-none z-10">
                
                {/* Custom Progress/Scrub Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium text-zinc-350">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-805 outline-none accent-primary hover:accent-primary/80"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / (duration || 1)) * 100}%, #27272a ${(currentTime / (duration || 1)) * 100}%, #27272a 100%)`
                    }}
                  />
                  <span className="text-xs font-mono font-medium text-zinc-350">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons Grid */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-zinc-200 hover:text-white transition-colors" title={isPlaying ? "Pause" : "Play"}>
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    {/* Rewind/FastForward 10s */}
                    <button onClick={() => skipTime(-10)} className="text-zinc-355 hover:text-white transition-colors" title="Rewind 10s">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    {/* Playback speed toggle */}
                    <div className="relative">
                      <button 
                        onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                        className="text-xs font-bold px-2 py-0.5 border border-zinc-650 rounded text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                      >
                        {playbackSpeed}x
                      </button>
                      
                      {showSpeedMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-zinc-800 rounded shadow-xl py-1 w-20 z-50">
                          {[0.5, 1, 1.5, 2].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSpeedChange(s)}
                              className={`w-full text-left px-3 py-1 text-xs hover:bg-zinc-800 font-semibold ${playbackSpeed === s ? 'text-primary' : 'text-zinc-300'}`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="text-zinc-350 hover:text-white transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 rounded bg-zinc-750 accent-primary appearance-none cursor-pointer hidden group-hover/volume:block transition-all"
                      />
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-4">
                    {/* Transcript Toggle */}
                    <button 
                      onClick={() => {
                        setSidebarOpen(true);
                        setActiveSideTab('Transcript');
                        toast.info("Opened transcript sidebar panel");
                      }}
                      className={`p-1 rounded transition-colors ${
                        activeSideTab === 'Transcript' && sidebarOpen
                          ? 'text-primary' 
                          : 'text-zinc-350 hover:text-white'
                      }`}
                      title="Interactive Transcript"
                    >
                      <FileText className="w-5 h-5" />
                    </button>

                    {/* Captions Toggle */}
                    <button 
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded border transition-colors ${
                        showCaptions 
                          ? 'border-primary text-primary bg-primary/10' 
                          : 'border-zinc-650 text-zinc-300 hover:text-white hover:border-zinc-500'
                      }`}
                      title="Toggle Captions"
                    >
                      CC
                    </button>

                    {/* Quality Gear Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                        className="text-zinc-355 hover:text-white transition-colors"
                        title="Video Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      {showQualityMenu && (
                        <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 border border-zinc-800 rounded shadow-xl py-1 w-28 z-50">
                          <div className="px-3 py-1 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Quality</div>
                          {['1080p', '720p', '480p', 'Auto'].map((q) => (
                            <button
                              key={q}
                              onClick={() => { setVideoQuality(q); setShowQualityMenu(false); toast.success(`Changed resolution to ${q}`); }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-800 font-medium ${videoQuality === q ? 'text-indigo-400' : 'text-zinc-300'}`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Theater Mode */}
                    <button 
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="text-zinc-350 hover:text-white transition-colors hidden md:block"
                      title="Theater Mode"
                    >
                      <Sliders className="w-4 h-4 transform rotate-90" />
                    </button>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-zinc-350 hover:text-white transition-colors" title="Fullscreen">
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* Bottom Tabs Switcher Bar (Matches home page theme colors) */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 sticky top-0 shrink-0 z-10 transition-colors duration-300">
              <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {bottomTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveBottomTab(tab)}
                    className={`py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors relative ${
                      activeBottomTab === tab 
                        ? 'border-indigo-500 text-slate-900 dark:text-white' 
                        : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                    {tab === 'Q&A' && qaList.length > 0 && (
                      <span className="ml-1 text-[10px] bg-slate-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded text-slate-500 dark:text-zinc-400">{qaList.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Workspace Panel (Adaptive Light/Dark Background) */}
            <div className="p-6 md:p-8 flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-250 transition-colors duration-300">
              
              {/* OVERVIEW TAB */}
              {activeBottomTab === 'Overview' && (
                <div className="max-w-4xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                      {course.subtitle || "Become a Developer With ONE course - HTML, CSS, JavaScript, React, Node, MongoDB and More!"}
                    </h2>
                    
                    {/* Course Stats Row matching the screenshot details */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 py-3 border-y border-slate-200 dark:border-zinc-850 text-sm text-slate-600 dark:text-zinc-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{course.rating || '0'}</span>
                          <div className="text-amber-400 flex items-center text-xs">⭐</div>
                          <span className="text-xs text-slate-550 dark:text-slate-500">({course.ratingCount?.toLocaleString() || '0'} ratings)</span>
                        </div>
                        <div className="h-4 w-px bg-slate-250 dark:bg-zinc-850"></div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{course.enrollmentCount?.toLocaleString() || '0'}</span> Students
                        </div>
                        <div className="h-4 w-px bg-slate-250 dark:bg-zinc-850"></div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{course.views?.toLocaleString() || '0'}</span> Views
                        </div>
                        <div className="h-4 w-px bg-slate-250 dark:bg-zinc-850"></div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{course.totalDuration || '0 mins'}</span> Total
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this course</h3>
                    <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-sm">{course.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-zinc-850">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-zinc-400">By the numbers</h4>
                      <ul className="text-sm space-y-2 text-slate-700 dark:text-zinc-350">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Skill level: All Levels
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Languages: English
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Lectures: {allLecturesList.length}
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-zinc-400">Features Included</h4>
                      <ul className="text-sm space-y-2 text-slate-700 dark:text-zinc-350">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Access on mobile and TV
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Certificate of completion from Eduvirse
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          Instructor Q&A response guarantees
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* AI SUMMARY TAB */}
              {activeBottomTab === 'AI Summary' && (
                <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-indigo-500" /> AI Generated Summary
                    </h2>
                  </div>

                  {isAiSummaryLoading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-24 w-full rounded-xl bg-slate-200 dark:bg-zinc-800" />
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3 bg-slate-200 dark:bg-zinc-800" />
                        <Skeleton className="h-4 w-full bg-slate-200 dark:bg-zinc-800" />
                        <Skeleton className="h-4 w-full bg-slate-200 dark:bg-zinc-800" />
                        <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-zinc-800" />
                      </div>
                    </div>
                  ) : !aiSummary ? (
                    <div className="bg-slate-100 dark:bg-zinc-900 rounded-xl p-8 text-center">
                      <Sparkles className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-300">No Summary Available</h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2 mb-6">
                        The AI summary for this lecture hasn't been generated yet or could not be loaded.
                      </p>
                      
                      {/* NEW GENERATE BUTTON ADDED HERE FOR EASY ACCESS */}
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <button 
                          onClick={async () => {
                            if (!currentLecture?.videoUrl) {
                              alert('No video available to summarize!');
                              return;
                            }
                            
                            setIsAiSummaryLoading(true);
                            try {
                              // We use id (course ID) or currentLecture.id to generate
                              const lectureIdToUse = id || currentLecture.id;
                              await api.generateLectureSummary(lectureIdToUse, null, currentLecture.videoUrl, currentLecture.title, course.description);
                              
                              // Refetch after successful generation
                              const newSummary = await api.getLectureSummary(lectureIdToUse);
                              setAiSummary(newSummary);
                            } catch (err) {
                              console.error('Generation failed:', err);
                              alert('Failed to generate summary: ' + (err.message || 'Unknown error'));
                            } finally {
                              setIsAiSummaryLoading(false);
                            }
                          }}
                          disabled={isAiSummaryLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          {isAiSummaryLoading ? 'Generating (Takes a min)...' : 'Generate Using Current Video'}
                        </button>
                        <p className="text-xs text-slate-400">This will securely transcribe and summarize the video above</p>
                      </div>

                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* TL;DR Summary */}
                      <section className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5" /> Summary
                        </h3>
                        <p className="text-indigo-950/80 dark:text-indigo-200/80 leading-relaxed text-[15px]">
                          {aiSummary.summary}
                        </p>
                      </section>

                      {/* Key Points */}
                      {aiSummary.key_points && aiSummary.key_points.length > 0 && (
                        <section>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-zinc-800 pb-2">
                            Key Points
                          </h3>
                          <ul className="space-y-3">
                            {aiSummary.key_points.map((point, i) => (
                              <li key={i} className="flex gap-3 text-slate-700 dark:text-zinc-300">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* Definitions */}
                      {aiSummary.definitions && aiSummary.definitions.length > 0 && (
                        <section>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-zinc-800 pb-2">
                            Definitions
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {aiSummary.definitions.map((def, i) => (
                              <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">{def.term}</h4>
                                <p className="text-sm text-slate-600 dark:text-zinc-400">{def.meaning}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                      
                      {/* Quiz Section */}
                      {aiSummary.quiz_questions && aiSummary.quiz_questions.length > 0 && (
                        <section className="bg-slate-100 dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-500" /> Check Your Understanding
                          </h3>
                          <div className="space-y-6 mt-6">
                            {aiSummary.quiz_questions.map((quiz, i) => (
                              <div key={i} className="bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-zinc-850">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{i + 1}. {quiz.question}</h4>
                                <div className="space-y-2">
                                  {quiz.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${optIdx === quiz.correct_index ? 'border-emerald-500' : 'border-slate-300 dark:border-zinc-600'}`}>
                                        {optIdx === quiz.correct_index && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                      </div>
                                      <span className="text-sm text-slate-700 dark:text-zinc-300">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-850">
                                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-1">Explanation:</span>
                                    {quiz.explanation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Q&A TAB */}
              {activeBottomTab === 'Q&A' && (
                <div className="max-w-4xl space-y-6">
                  {/* AI Assistant Banner Card */}
                  <div className="bg-[#f5f5ff] dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-violet-100 dark:bg-violet-900/40 rounded-xl text-violet-650 dark:text-violet-400 mt-1 shrink-0">
                        <Sparkles className="w-5 h-5 fill-current" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                          Get an instant answer from the assistant
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                          Our AI uses context from the course to help answer most questions immediately.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSidebarOpen(true);
                        setActiveSideTab('AI Assistant');
                        toast.success("Eduvirse AI Assistant is ready to help!");
                      }}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-2 px-5 py-5 font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 border-0 flex-shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-white fill-current" />
                      Get an instant answer
                    </Button>
                  </div>

                  {/* Search Bar Container */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Search all course questions"
                        value={searchQa}
                        onChange={(e) => setSearchQa(e.target.value)}
                        className="bg-transparent outline-none flex-1 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        toast.info(`Filtering for "${searchQa}"...`);
                      }}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white p-3 h-auto w-11 rounded-lg flex items-center justify-center shrink-0 border-0"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Ask Question trigger button */}
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-slate-500 font-medium">Or ask the community forum:</p>
                    <Button 
                      onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ask a new question
                    </Button>
                  </div>

                  {/* Ask Question Card */}
                  {isAddingQuestion && (
                    <form onSubmit={handleAddQuestion} className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Create New Forum Question</h3>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Question Title</label>
                        <input
                          type="text"
                          required
                          value={newQaTitle}
                          onChange={(e) => setNewQaTitle(e.target.value)}
                          placeholder="e.g. Why does state update asynchronously?"
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Details / Question Content</label>
                        <textarea
                          required
                          rows="4"
                          value={newQaContent}
                          onChange={(e) => setNewQaContent(e.target.value)}
                          placeholder="Explain what steps you took, any code blocks, and what errors you encountered..."
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                        ></textarea>
                      </div>
                      <div className="flex gap-2 justify-end text-xs">
                        <Button type="button" variant="ghost" onClick={() => setIsAddingQuestion(false)} className="hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400">Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white">Post Question</Button>
                      </div>
                    </form>
                  )}

                  {/* Questions Feed */}
                  <div className="space-y-4">
                    {filteredQa.length > 0 ? (
                      filteredQa.map((qa) => (
                        <div key={qa.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 space-y-4 hover:border-slate-350 dark:hover:border-zinc-800 transition-all shadow-sm">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10 border border-slate-150 dark:border-zinc-800">
                              <AvatarImage src={qa.avatar} />
                              <AvatarFallback className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-350">{qa.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{qa.author}</span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-550 bg-slate-100 dark:bg-zinc-850 px-2 py-0.5 rounded font-mono">Lecture: {qa.lecture}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{qa.title}</h4>
                              <p className="text-sm text-slate-650 dark:text-zinc-300 leading-normal">{qa.content}</p>
                            </div>
                          </div>

                          {/* Replies section */}
                          <div className="pl-6 md:pl-14 border-l-2 border-slate-200 dark:border-zinc-800 space-y-3">
                            {qa.replies.map((reply, rIdx) => (
                              <div key={rIdx} className="bg-slate-50/50 dark:bg-zinc-950 p-4 rounded-lg flex items-start gap-3 border border-slate-150 dark:border-zinc-850/50">
                                <Avatar className="w-7 h-7 border border-slate-200 dark:border-zinc-800">
                                  <AvatarImage src={reply.avatar} />
                                  <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700 dark:text-zinc-350">{reply.author}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">{reply.date}</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-zinc-350 leading-normal text-xs">{reply.content}</p>
                                </div>
                              </div>
                            ))}

                            {/* Reply Input Box */}
                            <div className="flex gap-2 mt-2">
                              <input 
                                type="text"
                                placeholder="Write a reply..."
                                value={replyInputText[qa.id] || ''}
                                onChange={(e) => setReplyInputText({ ...replyInputText, [qa.id]: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(qa.id); }}
                                className="flex-1 bg-slate-55 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:border-slate-400 dark:focus:border-zinc-700 transition-colors"
                              />
                              <Button 
                                onClick={() => handlePostReply(qa.id)}
                                className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs px-3 rounded"
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No forum questions found matching your filter.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NOTES TAB */}
              {activeBottomTab === 'Notes' && (
                <div className="max-w-4xl space-y-6">
                  {/* Notes input */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between text-xs text-indigo-500 dark:text-indigo-400 font-bold mb-1">
                      <span>Create note at current time ({formatTime(currentTime)})</span>
                    </div>
                    <textarea 
                      placeholder="Type your notes here. You can jump back to this timestamp by clicking your saved note later..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows="3"
                      className="w-full bg-slate-55 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-850 rounded-lg p-3 text-sm text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Press save to record notes aligned with course timeline.</span>
                      <Button 
                        onClick={handleSaveNote}
                        disabled={!noteInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-lg"
                      >
                        Save Note
                      </Button>
                    </div>
                  </div>

                  {/* Notes Feed list */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Saved Notes</h3>
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-850 rounded-lg p-4 flex gap-4 hover:border-slate-350 dark:hover:border-zinc-800 transition-colors">
                          <button 
                            onClick={() => jumpToNoteTime(note.timestamp)}
                            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded text-xs font-bold shrink-0 self-start font-mono transition-colors"
                            title="Jump to video time"
                          >
                            {note.displayTime}
                          </button>
                          <div className="flex-1 space-y-1">
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{note.lectureTitle}</p>
                            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-normal font-medium">{note.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 dark:text-zinc-500">
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">You haven't added any notes to this course yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS TAB */}
              {activeBottomTab === 'Announcements' && (
                <div className="max-w-3xl space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 border border-slate-200 dark:border-zinc-800">
                        <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250" />
                        <AvatarFallback>SS</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Sarah Johnson</h4>
                        <p className="text-xs text-slate-400 dark:text-zinc-550">Instructor • Posted 1 week ago</p>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Important Updates: React 19 Support Added!</h3>
                    <p className="text-sm text-slate-650 dark:text-zinc-300 leading-relaxed">
                      Hey everyone! I have updated Section 14 to include the brand new React 19 rendering features.
                      If you are checking package codes, make sure you download the updated slides in the resources list of Lecture 7.
                      Let me know if you run into any build issues in the Q&A section!
                    </p>

                    <div className="border-t border-slate-150 dark:border-zinc-850 pt-4 flex gap-4 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                      <button className="hover:text-slate-800 dark:hover:text-white transition-colors">Helpful (42)</button>
                      <button className="hover:text-slate-800 dark:hover:text-white transition-colors">Comments (8)</button>
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeBottomTab === 'Reviews' && (
                <div className="max-w-4xl space-y-6">
                  {/* Student feedback header */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student feedback</h3>

                  {/* Rating summary */}
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-850">
                    <div className="text-center md:pr-8 md:border-r border-slate-200 dark:border-slate-800 shrink-0 self-center">
                      <p className="text-6xl font-extrabold text-[#b45309] dark:text-amber-500 mb-1">4.7</p>
                      <div className="text-amber-400 flex justify-center text-sm gap-0.5 mb-1.5">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-xs text-[#b45309] dark:text-amber-400 font-extrabold uppercase tracking-wider">Course Rating</p>
                    </div>
                    
                    <div className="flex-1 w-full space-y-2.5">
                      {[
                        { stars: 5, percent: "67%", width: "67%" },
                        { stars: 4, percent: "27%", width: "27%" },
                        { stars: 3, percent: "5%", width: "5%" },
                        { stars: 2, percent: "1%", width: "1%" },
                        { stars: 1, percent: "< 1%", width: "1%" }
                      ].map((item) => (
                        <div key={item.stars} className="flex items-center gap-3 text-xs font-semibold">
                          <div className="w-full max-w-[200px] flex-1 bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full" style={{ width: item.width }}></div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-550 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < item.stars ? 'text-amber-550' : 'text-slate-200 dark:text-zinc-800'}>★</span>
                            ))}
                          </div>
                          <span className="w-10 text-blue-600 dark:text-blue-400 text-right hover:underline cursor-pointer">{item.percent}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reviews</h3>

                    {/* Search and Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
                          <input 
                            type="text"
                            placeholder="Search reviews"
                            value={searchReviewText}
                            onChange={(e) => setSearchReviewText(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                          />
                        </div>
                        <Button 
                          onClick={() => toast.info(`Searching reviews for "${searchReviewText}"`)}
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white p-3 h-auto w-11 rounded-lg flex items-center justify-center shrink-0 border-0"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col gap-1 sm:w-48">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider pl-1">Filter ratings</span>
                        <select
                          value={filterRating}
                          onChange={(e) => setFilterRating(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none font-semibold cursor-pointer"
                        >
                          <option value="All">All ratings</option>
                          <option value="5">5 stars</option>
                          <option value="4">4 stars</option>
                          <option value="3">3 stars</option>
                          <option value="2">2 stars</option>
                          <option value="1">1 star</option>
                        </select>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4 pt-2">
                      {(() => {
                        const filtered = reviewsList.filter(rev => {
                          const matchesSearch = rev.content.toLowerCase().includes(searchReviewText.toLowerCase()) ||
                                                rev.author.toLowerCase().includes(searchReviewText.toLowerCase());
                          const matchesRating = filterRating === 'All' || rev.rating === parseInt(filterRating);
                          return matchesSearch && matchesRating;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-10 text-slate-400 dark:text-zinc-550 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                              <p className="text-sm">No reviews found matching criteria.</p>
                            </div>
                          );
                        }

                        return filtered.map((rev) => (
                          <div 
                            key={rev.id} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 space-y-3.5 hover:border-slate-355 dark:hover:border-zinc-800 transition-all shadow-sm"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Black initials circle avatar */}
                              <div className="w-10 h-10 rounded-full bg-slate-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-slate-950 font-extrabold text-sm shrink-0 shadow-inner">
                                {rev.initials}
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{rev.author}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="text-amber-500 text-xs flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={i < rev.rating ? 'text-amber-500' : 'text-slate-200 dark:text-zinc-850'}>★</span>
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-semibold">{rev.date}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {rev.content}
                            </p>

                            {/* Helpful vote section */}
                            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                              <span className="text-[11px] text-slate-455 dark:text-zinc-500 font-medium">Was this review helpful?</span>
                              
                              <button 
                                onClick={() => handleVoteReview(rev.id, 'helpful')}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border-slate-200 dark:border-slate-700 bg-transparent ${
                                  rev.voted === 'helpful' ? 'border-[#7c3aed] text-[#7c3aed] bg-[#7c3aed]/10' : ''
                                }`}
                                title="Helpful"
                              >
                                <svg className={`w-4 h-4 ${rev.voted === 'helpful' ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </svg>
                              </button>
                              {rev.helpfulCount > 0 && <span className="text-slate-400 dark:text-zinc-550 font-mono text-[10px]">{rev.helpfulCount}</span>}

                              <button 
                                onClick={() => handleVoteReview(rev.id, 'unhelpful')}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border-slate-200 dark:border-slate-700 bg-transparent ${
                                  rev.voted === 'unhelpful' ? 'border-[#7c3aed] text-[#7c3aed] bg-[#7c3aed]/10' : ''
                                }`}
                                title="Not helpful"
                              >
                                <svg className={`w-4 h-4 ${rev.voted === 'unhelpful' ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                </svg>
                              </button>

                              <button 
                                onClick={() => toast.success("Review reported to moderators")}
                                className="text-blue-600 hover:text-blue-700 underline border-0 bg-transparent cursor-pointer font-bold pl-2"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                  </div>
                </div>
              )}

              {/* LEARNING TOOLS TAB */}
              {activeBottomTab === 'Learning tools' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Learning reminders
                    </h2>
                    <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                      Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.
                    </p>
                  </div>

                  {/* Reminder Card List */}
                  <div className="space-y-3">
                    {learningReminders.map((reminder) => (
                      <div 
                        key={reminder.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Learning reminder
                              </h4>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">⏰</span>
                                <span>{reminder.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">🔄</span>
                                <span>{reminder.frequency}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <div className="w-4 h-4 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm shrink-0">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.14-.1.14l4.24 3.3c2.48-2.28 3.91-5.64 3.91-9.27z"/>
                                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.24-3.3c-1.18.79-2.69 1.26-4.24 1.26-3.26 0-6.02-2.2-7-5.17l-4.38 3.4C2.56 21.8 7 24 12 24z"/>
                                  <path fill="#FBBC05" d="M5 13.88c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L.62 5.92C-.28 7.74-.8 9.8-.8 12s.52 4.26 1.42 6.08l4.38-3.4z"/>
                                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7 0 2.56 2.2.62 5.92l4.38 3.4c.98-2.97 3.74-5.17 7-5.17z"/>
                                </svg>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                                Added to Google Calendar
                              </span>
                            </div>
                          </div>

                          {/* Context Menu Dropdown */}
                          <div className="relative">
                            <button 
                              onClick={() => toggleReminderMenu(reminder.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {reminder.showMenu && (
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 w-28 z-20 text-xs">
                                <button 
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                  className="w-full text-left px-3 py-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold border-0 bg-transparent"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {learningReminders.length === 0 && !isAddingReminder && (
                      <div className="text-center py-8 text-slate-400 dark:text-zinc-550 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-semibold">No learning reminders scheduled.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Reminder Form */}
                  {isAddingReminder ? (
                    <form 
                      onSubmit={handleAddReminder} 
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add Learning Reminder</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-500 dark:text-zinc-400 font-semibold">Reminder Time</label>
                          <input 
                            type="time" 
                            required
                            value={reminderTime} 
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 dark:text-zinc-400 font-semibold">Frequency</label>
                          <select 
                            value={reminderFreq} 
                            onChange={(e) => setReminderFreq(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-slate-900 dark:text-white outline-none font-medium"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Mon - Fri">Mon - Fri</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsAddingReminder(false)}
                          className="hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold"
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button 
                      onClick={() => setIsAddingReminder(true)}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-1.5 px-4 py-4 font-bold rounded-xl text-xs transition-colors shrink-0 border-0 shadow-lg shadow-indigo-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add another
                    </Button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar (Playlist & AI Assistant - light/dark theme matching Home Page) */}
          {sidebarOpen && (
            <aside className="w-80 md:w-96 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col z-10 select-none transition-colors duration-300">
              
              {/* Take Eduvirse Assessment advertisement banner (matches homepage advertisement styling) */}
              {showAssessmentBanner && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b border-indigo-200 dark:border-indigo-950/30 p-4 relative shrink-0 text-slate-800 dark:text-zinc-200">
                  <button 
                    onClick={() => setShowAssessmentBanner(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="pr-4">
                    <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] mb-1">Eduvirse Assessment</h4>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2.5 leading-snug">
                      Take a quick assessment to test your development skills!
                    </p>
                    <Button 
                      onClick={() => setAssessmentOpen(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[10px] py-1 px-2.5 h-7 rounded shadow-md"
                    >
                      Start Assessment
                    </Button>
                  </div>
                </div>
              )}

              {/* Sidebar Tabs Switcher */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 px-2">
                <div className="flex overflow-x-auto no-scrollbar">
                  {[
                    { id: 'Course content', label: 'Content', icon: null },
                    { id: 'AI Assistant', label: 'AI Assistant', icon: Sparkles },
                    { id: 'Transcript', label: 'Transcript', icon: FileText }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSideTab(tab.id)}
                      className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 px-2.5 whitespace-nowrap relative ${
                        activeSideTab === tab.id
                          ? 'border-primary text-primary dark:text-white'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.icon && <tab.icon className="w-3.5 h-3.5 text-primary" />}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 pr-1 shrink-0">
                  <button 
                    onClick={() => {
                      setIsTheaterMode(!isTheaterMode);
                      toast.info(isTheaterMode ? "Exited wide sidebar" : "Wide sidebar mode enabled");
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Toggle wide screen mode"
                  >
                    <Sliders className="w-3.5 h-3.5 transform rotate-90" />
                  </button>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Close sidebar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Panel Content */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                
                {/* COURSE CONTENT TAB */}
                {activeSideTab === 'Course content' && (
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    
                    {/* SECTION 1: Course Orientation */}
                    <div>
                      <button 
                        onClick={() => setSection1Open(!section1Open)}
                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">Section 1: Course Orientation</h4>
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>
                            {allLecturesList.filter(l => completedLectures.has(l.id)).length} / {allLecturesList.length} | 31min
                            </span>
                          </div>
                        </div>
                        {section1Open ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                      </button>

                      {section1Open && (
                        <div className="bg-white dark:bg-slate-950/50">
                          {allLecturesList.map((lecture, idx) => {
                            const isCurrent = currentLecture?.id === lecture.id;
                            const isCompleted = completedLectures.has(lecture.id);
                            return (
                              <li 
                                key={lecture.id}
                                onClick={() => selectLecture(lecture)}
                                className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all flex items-start gap-3 select-none relative ${
                                  isCurrent ? 'bg-slate-100/70 dark:bg-slate-800/50 border-l-2 border-primary' : ''
                                }`}
                              >
                                {/* Udemy-style square checkbox input */}
                                <div className="mt-0.5 shrink-0">
                                  <button
                                    onClick={(e) => toggleLectureCompleted(lecture.id, e)}
                                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-primary border-primary text-white' 
                                        : 'border-slate-350 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 bg-transparent'
                                    }`}
                                  >
                                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-snug font-medium ${
                                    isCurrent ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {idx + 1}. {lecture.title}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 font-mono">
                                      <PlayCircle className="w-3 h-3 text-slate-400 dark:text-slate-550" />
                                      {lecture.duration}
                                    </span>

                                    {/* Resources drop-down pill */}
                                    {lecture.resources && lecture.resources.length > 0 && (
                                      <div className="relative">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenResourcesId(openResourcesId === lecture.id ? null : lecture.id);
                                          }}
                                          className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-450 dark:hover:border-slate-550 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                                        >
                                          <Download className="w-2.5 h-2.5" />
                                          <span>Resources</span>
                                          <ChevronDown className="w-2 h-2" />
                                        </button>

                                        {openResourcesId === lecture.id && (
                                          <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl p-1 z-50">
                                            {lecture.resources.map((res, rIdx) => (
                                              <a 
                                                key={rIdx}
                                                href={res.url}
                                                onClick={(e) => { e.stopPropagation(); toast.success(`Starting download: ${res.name}`); }}
                                                className="flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                                              >
                                                <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <span className="truncate">{res.name}</span>
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: Setup & Installation */}
                    <div>
                      <button 
                        onClick={() => setSection2Open(!section2Open)}
                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">Section 2: Setup & Installation</h4>
                          <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold mt-0.5">
                            {SECTION_2_LECTURES.filter(l => completedLectures.has(l.id)).length} / {SECTION_2_LECTURES.length} | 32min
                          </p>
                        </div>
                        {section2Open ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400" />}
                      </button>

                      {section2Open && (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800/30 bg-white dark:bg-slate-900">
                          {SECTION_2_LECTURES.map((lecture, idx) => {
                            const isCurrent = currentLecture.id === lecture.id;
                            const isCompleted = completedLectures.has(lecture.id);
                            return (
                              <li 
                                key={lecture.id}
                                onClick={() => selectLecture(lecture)}
                                className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all flex items-start gap-3 select-none relative ${
                                  isCurrent ? 'bg-slate-100/70 dark:bg-slate-800/50 border-l-2 border-primary' : ''
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  <button
                                    onClick={(e) => toggleLectureCompleted(lecture.id, e)}
                                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-primary border-primary text-white' 
                                        : 'border-slate-350 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 bg-transparent'
                                    }`}
                                  >
                                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-snug font-medium ${
                                    isCurrent ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {idx + 11}. {lecture.title}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 font-mono">
                                      <PlayCircle className="w-3 h-3 text-slate-400 dark:text-slate-550" />
                                      {lecture.duration}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                  </div>
                )}

                {/* AI ASSISTANT TAB */}
                {activeSideTab === 'AI Assistant' && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Eduvirse AI Assistant</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Answers synced with "{currentLecture.title}"</p>
                      </div>
                    </div>

                    {/* Chat Messages Log */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                      {aiMessages.map((msg, mIdx) => (
                        <div key={mIdx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-xl leading-normal whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-primary text-white rounded-tr-none shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                          }`}>
                            <p className="font-medium">{msg.text}</p>
                          </div>
                        </div>
                      ))}

                      {isAiTyping && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 p-3 rounded-xl rounded-tl-none flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce delay-200"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick helper prompts */}
                    <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950/30">
                      {[
                        { label: '📝 Summarize Lecture', prompt: 'Please summarize this active lecture.' },
                        { label: '❓ Give me a Quiz', prompt: 'Give me a quick quiz to test my knowledge.' },
                        { label: '💻 React Hook Code', prompt: 'Explain standard React state' }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendAi(chip.prompt)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md text-[9px] font-bold transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Input message form */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Ask Eduvirse AI..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendAi(); }}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => handleSendAi()}
                        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TRANSCRIPT TAB */}
                {activeSideTab === 'Transcript' && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Interactive Transcript</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Synced with active video timeline</p>
                        </div>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <input 
                          type="text"
                          placeholder="Search transcript..."
                          value={searchTranscript}
                          onChange={(e) => setSearchTranscript(e.target.value)}
                          className="bg-transparent outline-none flex-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        {searchTranscript && (
                          <button onClick={() => setSearchTranscript('')} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {filteredTranscript.length > 0 ? (
                        filteredTranscript.map((line, idx) => {
                          const isActive = currentTime >= line.time && (idx === filteredTranscript.length - 1 || currentTime < filteredTranscript[idx + 1].time);
                          return (
                            <div 
                              key={idx}
                              onClick={() => jumpToNoteTime(line.time)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex gap-3 text-xs leading-relaxed ${
                                isActive 
                                  ? 'bg-primary/5 dark:bg-primary/10 border-primary text-slate-905 dark:text-white font-medium shadow-sm'
                                  : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/40 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                              }`}
                            >
                              <span className={`font-mono font-bold shrink-0 self-start ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                                {formatTime(line.time)}
                              </span>
                              <p className="flex-1">{line.text}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-550">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No transcript matches found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </aside>
          )}

        </div>

        {/* ASSESSMENT MODAL DIALOG */}
        {assessmentOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/10 dark:to-purple-950/10 p-5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-sm md:text-base">Eduvirse Skills Assessment</h3>
                </div>
                <button onClick={() => setAssessmentOpen(false)} className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-slate-705 dark:text-zinc-300">
                {!quizSubmitted ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      <span>Question {currentQuizQuestion + 1} of {quizQuestions.length}</span>
                      <span className="bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10">Standard Assessment</span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                      {quizQuestions[currentQuizQuestion].question}
                    </h4>

                    <div className="grid gap-2.5 pt-2">
                      {quizQuestions[currentQuizQuestion].options.map((opt, oIdx) => {
                        const isSelected = selectedQuizAnswers[currentQuizQuestion] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizAnswer(currentQuizQuestion, oIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650 dark:text-white font-bold shadow-md'
                                : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-855 hover:border-slate-450 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-950 text-slate-705 dark:text-zinc-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-850 text-xs">
                      <Button
                        disabled={currentQuizQuestion === 0}
                        onClick={() => setCurrentQuizQuestion(currentQuizQuestion - 1)}
                        className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-750 text-slate-800 dark:text-white"
                      >
                        Back
                      </Button>
                      
                      {currentQuizQuestion < quizQuestions.length - 1 ? (
                        <Button
                          disabled={selectedQuizAnswers[currentQuizQuestion] === undefined}
                          onClick={() => setCurrentQuizQuestion(currentQuizQuestion + 1)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                          Next Question
                        </Button>
                      ) : (
                        <Button
                          disabled={selectedQuizAnswers[currentQuizQuestion] === undefined}
                          onClick={submitQuiz}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
                        >
                          Submit Assessment
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-5">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Assessment Completed!</h4>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">
                        You scored <strong className="text-slate-900 dark:text-white text-base">{quizScore} / {quizQuestions.length}</strong> correct responses.
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-4 text-xs text-slate-600 dark:text-zinc-400 leading-normal max-w-sm mx-auto">
                      {quizScore === quizQuestions.length ? (
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold">Outstanding! You have mastered the core course concepts perfectly. 🚀</span>
                      ) : quizScore >= quizQuestions.length / 2 ? (
                        <span className="text-indigo-600 dark:text-indigo-300 font-bold">Good job! Review the lectures and code slides to achieve a perfect score. 📚</span>
                      ) : (
                        <span className="text-red-500 dark:text-red-400 font-bold">Keep studying! We recommend jumping back into the course videos and resources. 💪</span>
                      )}
                    </div>

                    <div className="flex gap-2 justify-center pt-4">
                      <Button onClick={resetQuiz} className="bg-slate-200 dark:bg-zinc-805 hover:bg-slate-300 dark:hover:bg-zinc-750 text-slate-800 dark:text-white font-semibold text-xs">
                        Retake Quiz
                      </Button>
                      <Button onClick={() => setAssessmentOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs px-4">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default CourseViewerPage;
