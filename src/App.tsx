import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { LearnPhase1 } from './pages/LearnPhase1'
import { LearnPhase2 } from './pages/LearnPhase2'
import { LearnTips } from './pages/LearnTips'
import { QuizRunner } from './pages/QuizRunner'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/phase1" element={<LearnPhase1 />} />
        <Route path="/learn/phase2" element={<LearnPhase2 />} />
        <Route path="/learn/tips" element={<LearnTips />} />
        <Route path="/quiz/:lessonId" element={<QuizRunner />} />
        {/* Progress page merged into Home — redirect for any existing links */}
        <Route path="/progress" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
