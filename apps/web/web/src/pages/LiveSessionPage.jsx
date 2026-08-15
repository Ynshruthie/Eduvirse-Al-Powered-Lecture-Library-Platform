import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Play, ThumbsUp, Share2, Radio, Send, Users, 
  ArrowLeft, Heart, Award, ChevronDown, MoreVertical, X, Info,
  Mic, MicOff, Video, VideoOff
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import { api } from '@/lib/api.js';
import { getSocket } from '@/lib/socket.js';
import { useAuth } from '@/contexts/AuthContext';

const LiveSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const role = currentUser?.role?.toLowerCase();
  const isTeacher = role === 'teacher' || role === 'admin';

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await api.getCourseById(id);
        setCourse(courseData);
      } catch (err) {
        setCourse({
          title: "Advanced Interactive Live Class Session",
          instructor: "Senior Educator",
          category: "General",
          subject: "Science & Technology",
          instructorImage: "https://i.pravatar.cc/150?u=instructor",
          videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likes, setLikes] = useState(2480);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(1482);
  const [chatInput, setChatInput] = useState('');
  
  // Floating reactions array
  const [reactions, setReactions] = useState([]);
  
  // Chat list state structured like YouTube's inline name and text comments
  const [chatMessages, setChatMessages] = useState([]);

  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const socket = getSocket();
    const roomId = id;

    socket.emit('join_room', roomId);

    socket.on('viewer_count', (count) => {
      setViewerCount(count);
    });

    socket.on('chat_history', (history) => {
      setChatMessages(history);
    });

    socket.on('chat_message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('reaction', (reaction) => {
      spawnReaction(reaction);
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.off('viewer_count');
      socket.off('chat_history');
      socket.off('chat_message');
      socket.off('reaction');
    };
  }, [id]);

  useEffect(() => {
    if (isTeacher) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.error("Play failed:", e));
          }

          try {
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current.ondataavailable = (e) => {
              if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = async () => {
              if (recordedChunksRef.current.length === 0) return;
              
              const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
              const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
              
              try {
                setIsUploadingRecording(true);
                toast.info('Uploading live class recording...');
                const uploadedMedia = await api.uploadMedia(file, 'video');
                await api.addCourseRecording(id, {
                  title: `Recording - ${new Date().toLocaleDateString()}`,
                  videoUrl: uploadedMedia.url
                });
                toast.success('Live class recording saved successfully to past recordings.');
              } catch(err) {
                console.error("Upload error:", err);
                toast.error(err.message || 'Failed to save recording.');
              } finally {
                setIsUploadingRecording(false);
                recordedChunksRef.current = [];
              }
            };
            mediaRecorderRef.current.start();
          } catch(err) {
            console.error("MediaRecorder setup failed:", err);
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          toast.error("Camera access failed. Running simulator instead.");
        });
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTeacher]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getTracks().filter(t => t.kind === 'audio');
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
      toast.success(!isMicMuted ? "Microphone muted" : "Microphone unmuted");
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getTracks().filter(t => t.kind === 'video');
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCamOff(!isCamOff);
      toast.success(!isCamOff ? "Camera turned off" : "Camera turned on");
    }
  };

  const endStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    toast.success("Stream ended successfully");
    navigate('/teacher/live-classes');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const myHandle = isTeacher 
      ? `@${currentUser?.name?.toLowerCase().replace(/\s+/g, '_') || 'instructor'}`
      : `@${currentUser?.name?.toLowerCase().replace(/\s+/g, '_') || 'student_user'}`;
    const myMsg = {
      id: Date.now(),
      handle: myHandle,
      text: chatInput,
      avatarColor: isTeacher ? "bg-indigo-600" : "bg-[#5c67f2]",
      isInstructor: isTeacher
    };

    const socket = getSocket();
    socket.emit('chat_message', { roomId: id, message: myMsg });

    setChatInput('');
    toast.success("Message sent");
    
    // Spawn reaction locally, others will see it if they send reaction explicitly
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      toast.success("Liked stream");
      spawnReaction('👍');
      getSocket().emit('reaction', { roomId: id, reaction: '👍' });
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : course.instructor || 'Instructor';
    if (!isSubscribed) {
      toast.success(`Subscribed to ${instructorName}`);
    } else {
      toast.success(`Unsubscribed from ${instructorName}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Stream link copied to clipboard!");
  };

  // Spawn floating reactions animation
  const spawnReaction = (emoji) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 60 - 30, // random offset wiggle
      scale: Math.random() * 0.4 + 0.8
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`LIVE: ${course.title} - Eduvirse`}</title>
      </Helmet>
      
      {(() => {
        const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : course.instructor || 'Instructor';
        return (
          <>

      {/* Styled animation keyframes for floating emojis */}
      <style>{`
        @keyframes floatUpReaction {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-240px) translateX(var(--wiggle)) scale(0.6);
            opacity: 0;
          }
        }
        .reaction-bubble {
          animation: floatUpReaction 2s cubic-bezier(0.08, 0.82, 0.17, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] font-sans flex flex-col overflow-x-hidden">
        <Header />

        {/* Back navigation header */}
        <div className="bg-[#161616] border-b border-[#272727] px-4 py-3 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/live')}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">LIVE STREAM SESSION</span>
            </div>
            <h1 className="text-sm font-semibold text-white truncate max-w-md md:max-w-2xl">{course.title}</h1>
          </div>
        </div>

        {/* Main Body */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1700px] mx-auto w-full">
          
          {/* LEFT COLUMN: Player & Metadata */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Player Canvas */}
            <div className="aspect-video bg-black rounded-xl border border-[#272727] shadow-2xl relative overflow-hidden group">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                controls={!isTeacher}
                className="w-full h-full object-contain"
                poster={isTeacher ? undefined : (course.thumbnailUrl || course.thumbnail)}
              >
                {!isTeacher && <source src={course.videoUrl || "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>

              {/* LIVE Indicator overlay */}
              <div className="absolute top-4 left-4 flex gap-2 items-center pointer-events-none select-none z-10">
                <Badge variant="destructive" className="bg-red-600 animate-pulse text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 rounded-md shadow-lg border-none">
                  <Radio className="w-3.5 h-3.5" /> LIVE
                </Badge>
                <Badge className="bg-black/70 backdrop-blur-sm text-xs font-bold px-2.5 py-0.5 flex items-center gap-1 border border-slate-700/30">
                  <Users className="w-3.5 h-3.5 text-slate-300" /> {viewerCount} watching
                </Badge>
              </div>

              {isTeacher && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMic}
                    className={`rounded-full w-10 h-10 ${isMicMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleCam}
                    className={`rounded-full w-10 h-10 ${isCamOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={endStream}
                    className="rounded-lg h-9 px-4 font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                  >
                    End Stream
                  </Button>
                </div>
              )}
            </div>

            {/* Stream Header Details */}
            <div className="p-4 bg-[#161616] border border-[#272727] rounded-xl">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-[#272727] text-white hover:bg-[#3f3f3f] text-[10px] font-semibold border-none rounded-md">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="border-[#3f3f3f] text-slate-400 text-[10px] rounded-md">
                  {course.subject || 'Interactive Lecture'}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">
                [LIVE NOW] {course.title} | Visual Lecture Series #EduvirseLive
              </h2>

              {/* Action and Instructor Controls Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#272727]">
                
                {/* Left Side: Instructor Profile */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-[#3f3f3f]">
                    <AvatarImage src={course.instructorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=5c67f2&color=fff`} />
                    <AvatarFallback>{instructorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1">
                      {instructorName}
                      <Award className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                    </h3>
                    <p className="text-[11px] text-slate-400">{course.enrollmentCount || 0} students enrolled</p>
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    variant={isSubscribed ? 'outline' : 'default'}
                    size="sm"
                    className={`ml-4 rounded-full text-xs font-semibold h-9 px-4 transition-all ${
                      isSubscribed 
                        ? 'border-[#3f3f3f] hover:bg-[#272727] text-white bg-transparent' 
                        : 'bg-[#f1f1f1] hover:bg-[#d9d9d9] text-black border-none'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                </div>

                {/* Right Side: Interactive Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    onClick={handleLike}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border-[#272727] bg-[#272727] hover:bg-[#3f3f3f] h-9 text-xs font-medium gap-1.5 px-4 ${hasLiked ? 'text-indigo-400 border-indigo-900/50 bg-[#272727]' : 'text-[#f1f1f1]'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current text-indigo-400' : ''}`} />
                    <span>{(likes / 1000).toFixed(1)}K</span>
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[#272727] bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1] h-9 text-xs font-medium gap-1.5 px-4"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Description Tab & Details */}
            <div className="p-5 bg-[#161616] border border-[#272727] rounded-xl">
              <h4 className="font-semibold text-sm text-slate-200 mb-2">Class Details</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {course.description || "No description provided."}
              </p>
              <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                <span>Streaming live</span>
                <span>•</span>
                <span>#EduvirseLive</span>
                <span>•</span>
                <span>#EdTech</span>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Overhauled YouTube-style Live Chat */}
          <div className="w-full lg:w-[400px] h-[600px] lg:h-auto lg:min-h-[600px] flex flex-col bg-[#181818] border border-[#272727] rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-[#272727] flex items-center justify-between bg-[#181818] z-10 select-none">
              <div className="flex items-center gap-1.5 cursor-pointer hover:bg-[#272727] px-2 py-1 rounded-md transition-colors">
                <span className="font-bold text-sm text-white">Top chat</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="flex items-center gap-2">
                {/* 0XP points badge mimicking gaming streams */}
                <div className="flex items-center gap-1 bg-[#272727] text-yellow-500 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span>120 XP</span>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[#272727]">
                  <MoreVertical className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[#272727]" onClick={() => navigate('/live')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Message Scroll Log */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col bg-[#0f0f0f] relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#272727] [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex gap-2.5 items-start text-xs group/msg p-1 rounded hover:bg-white/5 transition-colors">
                  <Avatar className="w-6 h-6 flex-shrink-0 border border-transparent">
                    <AvatarImage src={msg.avatarColor.startsWith('http') ? msg.avatarColor : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.handle.replace('@', ''))}&background=random&color=fff`} />
                    <AvatarFallback className={`text-[10px] font-bold text-white ${msg.avatarColor}`}>
                      {msg.handle.charAt(1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 leading-normal">
                    {/* Inline username and text layout just like YouTube Live */}
                    <span className={`font-semibold mr-2 cursor-pointer ${msg.isInstructor ? 'text-[#5c67f2] font-bold bg-[#5c67f2]/10 px-1 rounded' : 'text-slate-400 hover:text-white'}`}>
                      {msg.handle}
                    </span>
                    <span className="text-slate-100 font-normal leading-relaxed break-words">{msg.text}</span>
                  </div>
                </div>
              ))}

              {/* Reaction Hearts absolute overlay */}
              <div className="absolute right-4 bottom-2 pointer-events-none select-none w-24 h-64 overflow-hidden z-20">
                {reactions.map(r => (
                  <div
                    key={r.id}
                    className="reaction-bubble absolute bottom-0 right-4 text-xl"
                    style={{
                      '--wiggle': `${r.x}px`,
                      left: '40%',
                      animationDelay: '0s',
                      transform: `scale(${r.scale})`
                    }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Subscribers only banner */}
            <div className="px-4 py-2 bg-[#181818] border-t border-[#272727] flex items-center justify-between text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Subscribers-only mode</span>
              </div>
              <button 
                onClick={() => {
                  const emojis = ['❤️', '👍', '🔥', '✨', '🎉'];
                  spawnReaction(emojis[Math.floor(Math.random() * emojis.length)]);
                }} 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1] hover:text-red-500 hover:scale-115 transition-all shadow-md active:scale-90 pointer-events-auto"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>
            </div>

            {/* Chat Input Footer Form */}
            <form 
              onSubmit={handleSendChat}
              className="p-3 border-t border-[#272727] bg-[#181818] flex gap-2 items-center"
            >
              <div className="flex-1 relative flex items-center">
                <Input
                  type="text"
                  placeholder="Chat publicly as enrolled student..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-[#0f0f0f] border-[#272727] text-[#f1f1f1] placeholder-slate-500 text-xs rounded-xl pr-10 focus-visible:ring-1 focus-visible:ring-[#3f3f3f] h-9"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
            
          </div>
        </main>
      </div>
        </>
        );
      })()}
    </>
  );
};

export default LiveSessionPage;
