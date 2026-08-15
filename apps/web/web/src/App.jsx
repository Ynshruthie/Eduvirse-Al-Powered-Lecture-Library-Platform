import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignUpPage from '@/pages/SignUpPage.jsx';
import CourseDetailsPage from '@/pages/CourseDetailsPage.jsx';
import CourseViewerPage from '@/pages/CourseViewerPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import SearchResults from '@/pages/SearchResults.jsx';
import PlaceholderPage from '@/pages/PlaceholderPage.jsx';
import CategoriesPage from '@/pages/CategoriesPage.jsx';
import CreateLiveCoursePage from '@/pages/CreateLiveCoursePage.jsx';
import CreateContentChoicePage from '@/pages/CreateContentChoicePage.jsx';
import UploadLecturePage from '@/pages/UploadLecturePage.jsx';
import TeacherContentPage from '@/pages/TeacherContentPage.jsx';
import TeacherStudentsPage from '@/pages/TeacherStudentsPage.jsx';
import TeacherLiveClassesPage from '@/pages/TeacherLiveClassesPage.jsx';
import TeacherCoursesPage from '@/pages/TeacherCoursesPage.jsx';
import GlobalLiveClassesPage from '@/pages/GlobalLiveClassesPage.jsx';
import ExplorePage from '@/pages/ExplorePage.jsx';
import LiveSessionPage from '@/pages/LiveSessionPage.jsx';
import TeacherCommentsPage from '@/pages/TeacherCommentsPage.jsx';
import TeacherSupportPage from '@/pages/TeacherSupportPage.jsx';
import TeacherSettingsPage from '@/pages/TeacherSettingsPage.jsx';
import TeacherAnalyticsPage from '@/pages/TeacherAnalyticsPage.jsx';
import TeacherEarningsPage from '@/pages/TeacherEarningsPage.jsx';
import TeacherAnnouncementsPage from '@/pages/TeacherAnnouncementsPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route 
            path="/course/:id/learn" 
            element={
              <ProtectedRoute>
                <CourseViewerPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/explore" element={<ExplorePage />} />
          
          {/* Footer & General Pages */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/live" element={<GlobalLiveClassesPage />} />
          <Route path="/live-session/:id" element={
            <ProtectedRoute>
              <LiveSessionPage />
            </ProtectedRoute>
          } />
          <Route path="/premium" element={<PlaceholderPage title="Premium Subscription" />} />
          <Route path="/about" element={<PlaceholderPage title="About Us" />} />
          <Route path="/careers" element={<PlaceholderPage title="Careers" />} />
          <Route path="/blog" element={<PlaceholderPage title="Eduvirse Blog" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
          <Route path="/help" element={<PlaceholderPage title="Help Center" />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
          <Route path="/cookies" element={<PlaceholderPage title="Cookie Policy" />} />
          <Route path="/demo" element={<PlaceholderPage title="Platform Demo" />} />

          {/* Teacher Dashboard Pages */}
          <Route path="/teacher/content" element={<TeacherContentPage />} />
          <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          <Route path="/teacher/live-classes" element={<TeacherLiveClassesPage />} />
          <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/earnings" element={<TeacherEarningsPage />} />
          <Route path="/teacher/comments" element={<TeacherCommentsPage />} />
          <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
          <Route path="/teacher/support" element={<TeacherSupportPage />} />
          <Route path="/teacher/announcements" element={<TeacherAnnouncementsPage />} />

          {/* Quick Actions */}
          <Route path="/create" element={<CreateContentChoicePage />} />
          <Route path="/upload" element={<UploadLecturePage />} />
          <Route path="/create-course" element={<PlaceholderPage title="Create New Course" />} />
          <Route path="/go-live" element={<CreateLiveCoursePage />} />
          <Route path="/add-quiz" element={<PlaceholderPage title="Create Quiz" />} />
          <Route path="/schedule" element={<PlaceholderPage title="Schedule & Roadmap" />} />
          <Route path="/enrollments" element={<PlaceholderPage title="My Enrollments" />} />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;