import { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import { AnswerDetail } from './screens/AnswerDetail'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { QuickPractice } from './screens/QuickPractice'
import { useServices } from './services'

function Placeholder({ title }: { title: string }) {
  return (
    <main className="page">
      <h1>{title}</h1>
    </main>
  )
}

export function AppRoutes() {
  const { storage } = useServices()

  useEffect(() => {
    void storage.persist()
  }, [storage])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/practice" element={<QuickPractice />} />
      <Route path="/mock" element={<Placeholder title="Mock Interview" />} />
      <Route path="/mock/:sessionId/review" element={<Placeholder title="Review" />} />
      <Route path="/history" element={<History />} />
      <Route path="/history/answer/:answerId" element={<AnswerDetail />} />
      <Route path="/questions" element={<Placeholder title="My Questions" />} />
    </Routes>
  )
}
