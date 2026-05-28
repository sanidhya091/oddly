import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Detail from './pages/Detail'
import Profile from './pages/Profile'
import TasteMatch from './pages/TasteMatch'
import Serendipity from './pages/Serendipity'
import ChatMode from './pages/ChatMode'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/layout/PageTransition'
import { ToastProvider } from './context/ToastContext'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PageTransition><Login /></PageTransition>
        } />
        <Route path="/" element={
          <ProtectedRoute><PageTransition><Home /></PageTransition></ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute><PageTransition><Quiz /></PageTransition></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><PageTransition><Results /></PageTransition></ProtectedRoute>
        } />
        <Route path="/detail" element={
  <ProtectedRoute><PageTransition><Detail /></PageTransition></ProtectedRoute>
} />
        <Route path="/profile" element={
          <ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>
        } />
        <Route path="/taste-match" element={
          <ProtectedRoute><PageTransition><TasteMatch /></PageTransition></ProtectedRoute>
        } />
        <Route path="/serendipity" element={
          <ProtectedRoute><PageTransition><Serendipity /></PageTransition></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><PageTransition><ChatMode /></PageTransition></ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AnimatedRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App