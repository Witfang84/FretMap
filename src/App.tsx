import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LearnPhase1 } from './pages/LearnPhase1'
import { LearnPhase2 } from './pages/LearnPhase2'
import { LearnTips } from './pages/LearnTips'
import { QuizRunner } from './pages/QuizRunner'
import { ProgressPage } from './pages/ProgressPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/phase1" element={<LearnPhase1 />} />
        <Route path="/learn/phase2" element={<LearnPhase2 />} />
        <Route path="/learn/tips" element={<LearnTips />} />
        <Route path="/quiz/:lessonId" element={<QuizRunner />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
    </BrowserRouter>
  )
}
