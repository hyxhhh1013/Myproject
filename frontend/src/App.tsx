import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PhotoProvider } from './context/PhotoContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { AdminLayout } from './components/Layout/AdminLayout'
import Login from './pages/Login'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Interests = lazy(() => import('./pages/Interests'))
const AiAssistantDemo = lazy(() => import('./pages/demos/AiAssistantDemo'))
const DashboardDemo = lazy(() => import('./pages/demos/DashboardDemo'))
const WeatherDemo = lazy(() => import('./pages/demos/WeatherDemo'))
const PomodoroDemo = lazy(() => import('./pages/demos/PomodoroDemo'))
const TodoDemo = lazy(() => import('./pages/demos/TodoDemo'))
const NotesDemo = lazy(() => import('./pages/demos/NotesDemo'))

// Admin pages
const PhotosManagement = lazy(() => import('./pages/Admin/PhotosManagement'))
const ProjectsManagement = lazy(() => import('./pages/Admin/ProjectsManagement'))
const MessagesManagement = lazy(() => import('./pages/Admin/MessagesManagement'))
const MusicManagement = lazy(() => import('./pages/Admin/MusicManagement'))
const MoviesManagement = lazy(() => import('./pages/Admin/MoviesManagement'))
const TravelManagement = lazy(() => import('./pages/Admin/TravelManagement'))
const HomePageManagement = lazy(() => import('./pages/Admin/HomePageManagement'))

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 transition-colors">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <Router>
      <ThemeProvider>
        <PhotoProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes - Wrapped in Layout */}
                <Route path="/" element={
                  <Layout>
                    <Home />
                  </Layout>
                } />
                <Route path="/interests" element={
                  <Layout>
                    <Interests />
                  </Layout>
                } />
                {/* Login Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Redirect old routes to Home */}
              <Route path="/about" element={<Navigate to="/" replace />} />
              <Route path="/experience" element={<Navigate to="/" replace />} />
              <Route path="/skills" element={<Navigate to="/" replace />} />
              <Route path="/projects" element={<Navigate to="/" replace />} />
              <Route path="/photos" element={<Navigate to="/" replace />} />
              <Route path="/contact" element={<Navigate to="/" replace />} />
              
              {/* Demo Routes - Standalone */}
              <Route path="/demo/ai-assistant" element={<AiAssistantDemo />} />
              <Route path="/demo/dashboard" element={<DashboardDemo />} />
              <Route path="/demo/weather" element={<WeatherDemo />} />
              <Route path="/demo/pomodoro" element={<PomodoroDemo />} />
              <Route path="/demo/todo" element={<TodoDemo />} />
              <Route path="/demo/notes" element={<NotesDemo />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="photos" replace />} />
                <Route path="photos" element={<PhotosManagement />} />
                <Route path="projects" element={<ProjectsManagement />} />
                <Route path="messages" element={<MessagesManagement />} />
                <Route path="music" element={<MusicManagement />} />
                <Route path="movies" element={<MoviesManagement />} />
                <Route path="travel" element={<TravelManagement />} />
                <Route path="home" element={<HomePageManagement />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </PhotoProvider>
    </ThemeProvider>
  </Router>
)
}

export default App
