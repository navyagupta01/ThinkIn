import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LandingPage from '@/components/auth/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NotFound from './pages/NotFound';
import StudentMeetingJoin from './components/dashboard/StudentMeetingJoin';
import StudentDiscussion from './components/dashboard/StudentDiscussion';
import StudentResources from './components/dashboard/StudentResources';
import StudentNotes from './components/dashboard/StudentNotes';
import StudentQuizzes from './components/dashboard/StudentQuizzes';
import TeacherCreateContent from './components/dashboard/TeacherCreateContent';
import TeacherMeetingManager from './components/dashboard/TeacherMeetingManager';
import TeacherAnalytics from './components/dashboard/TeacherAnalytics';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import TeacherDiscussion from './components/dashboard/TeacherDiscussion';
import TeacherChatbot from './components/dashboard/TeacherChatbot';
import LessonPlanGenerator from './components/dashboard/LessonPlanGenerator';
import EditContent from './components/dashboard/EditContent';
import CreateQuiz from './components/dashboard/CreateQuiz';
import ChatbotWrapper from './components/dashboard/ChatbotWrapper';
import SWOTAnalysis from './components/dashboard/SWOTAnalysis';
import Assignments from './components/dashboard/Assignments';
import TeacherAIGradeView from './components/dashboard/TeacherAIGradeView';

const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/assignments" element={
                    <ProtectedRoute>
                      <Assignments />
                    </ProtectedRoute>
                  } />
                  <Route path="/teacher-ai-grades" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherAIGradeView />
                    </ProtectedRoute>
                  } />
                  <Route path="/discussion" element={
                    <ProtectedRoute>
                      <StudentDiscussion />
                    </ProtectedRoute>
                  }>
                    <Route path="teacher/discussion" element={
                      <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDiscussion />
                      </ProtectedRoute>
                    } />
                  </Route>
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  {/* Student Routes */}
                  <Route path="/meetings/student" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentMeetingJoin />
                    </ProtectedRoute>
                  } />
                  <Route path="/resources" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentResources />
                    </ProtectedRoute>
                  } />
                  <Route path="/notes" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentNotes />
                    </ProtectedRoute>
                  } />
                  <Route path="/quizzes" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentQuizzes />
                    </ProtectedRoute>
                  } />
                  <Route path="/swot" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SWOTAnalysis />
                    </ProtectedRoute>
                  } />
                  {/* Teacher Routes */}
                  <Route path="/create" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherCreateContent />
                    </ProtectedRoute>
                  } />
                  <Route path="/create/lesson-plan" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <LessonPlanGenerator />
                    </ProtectedRoute>
                  } />
                  <Route path="/create/quiz" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <CreateQuiz />
                    </ProtectedRoute>
                  } />
                  <Route path="/edit/content/:id" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <EditContent />
                    </ProtectedRoute>
                  } />
                  <Route path="/meetings/teacher" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherMeetingManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherAnalytics />
                    </ProtectedRoute>
                  } />
                  {/* Shared Routes */}
                  <Route path="/chatbot" element={
                    <ProtectedRoute>
                      <ChatbotWrapper />
                    </ProtectedRoute>
                  } />
                  {/* Redirect old paths */}
                  <Route path="/dashboard/student" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard/teacher" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/schedule" element={<Navigate to="/meetings/teacher" replace />} />
                  <Route path="/live" element={<Navigate to="/meetings/student" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;