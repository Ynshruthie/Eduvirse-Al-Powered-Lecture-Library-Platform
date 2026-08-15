import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Users, Clock, BookOpen, CheckCircle, PlayCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EnrollmentModal from '@/components/EnrollmentModal.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { toast } from 'sonner';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, relatedCoursesData, enrollments] = await Promise.all([
        api.getCourseById(id),
        api.getRelatedCourses(id),
        currentUser ? api.getMyEnrollments() : Promise.resolve([]),
      ]);

      setCourse(courseData);
      setReviews(courseData.reviews || []);
      setRelatedCourses(relatedCoursesData);

      if (currentUser) {
        const currentEnrollment = enrollments.find((entry) => (entry.course._id || entry.course.id) === id);
        setEnrollment(currentEnrollment || null);
      } else {
        setEnrollment(null);
      }

      setCurrentVideo(courseData.videos?.[0] || null);
    } catch (fetchError) {
      setError(fetchError.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, currentUser]);

  const handleEnrollClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsEnrollModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-12" />
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{error || 'Course not found'}</h2>
            <Button onClick={fetchCourseData}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${course.title} - Eduvirse`}</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <div className="bg-primary/5 py-12 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                {course.category?.name || course.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-8">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1659301254614-8d6a9d46f26a" />
                    <AvatarFallback>{(course.instructor?.name || course.instructor)?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.instructor?.name || course.instructor}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-medium text-foreground">{course.rating || '4.8'}</span>
                  <span className="text-muted-foreground">({course.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{course.enrollmentCount || course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-6">About this course</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  <p>{course.description}</p>
                  <p>This comprehensive course is designed to take you from beginner to advanced. You will learn practical skills through hands-on projects and real-world examples.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Course Videos</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-indigo-500" />
                          Playlist
                        </h3>
                      </div>
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {course.videos && course.videos.length > 0 ? (
                          course.videos.map((video, index) => (
                            <li 
                              key={video.id || index} 
                              onClick={() => setCurrentVideo(video)}
                              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${currentVideo?.id === video.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentVideo?.id === video.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <span className={`text-sm block ${currentVideo?.id === video.id ? 'font-semibold text-indigo-700 dark:text-indigo-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                    {video.title}
                                  </span>
                                  {currentVideo?.id === video.id && <span className="text-[10px] text-indigo-500 font-medium">Now Playing</span>}
                                </div>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {video.duration}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No videos available for this course.</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar>
                            <AvatarFallback>{review.expand?.user_id?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.expand?.user_id?.name || 'Anonymous User'}</p>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                )}
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card className="shadow-lg border-primary/10">
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg bg-black mb-6 overflow-hidden relative shadow-inner">
                      {currentVideo ? (
                        <video 
                          key={currentVideo.url} // Force re-render when url changes
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                          poster={course.thumbnail}
                        >
                          <source src={currentVideo.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <>
                          <img src={course.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} alt="Course preview" className="w-full h-full object-cover opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white opacity-80 drop-shadow-lg" />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="text-3xl font-bold mb-6">
                      {course.price > 0 ? `₹${course.price}` : 'Free'}
                    </div>

                    {enrollment ? (
                      <Button className="w-full mb-4" size="lg" onClick={() => navigate(`/course/${course._id || course.id}/learn`)}>
                        Continue Learning
                      </Button>
                    ) : (
                      <Button className="w-full mb-4" size="lg" onClick={handleEnrollClick}>
                        Enroll Now
                      </Button>
                    )}

                    <div className="space-y-4 text-sm text-muted-foreground mt-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span>24 hours of on-demand video</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4" />
                        <span>12 downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <EnrollmentModal 
        isOpen={isEnrollModalOpen} 
        onClose={() => setIsEnrollModalOpen(false)} 
        course={course}
        onEnrollSuccess={fetchCourseData}
      />
    </>
  );
};

export default CourseDetailsPage;
