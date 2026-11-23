import { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import { AnswerDetail } from './screens/AnswerDetail'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { MockInterview } from './screens/MockInterview'
import { MockReview } from './screens/MockReview'
import { MyQuestions } from './screens/MyQuestions'
import { QuickPractice } from './screens/QuickPractice'
import { useServices } from './services'

export function AppRoutes() {
  const { storage } = useServices()

  useEffect(() => {
    void storage.persist()
  }, [storage])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/practice" element={<QuickPractice />} />
      <Route path="/mock" element={<MockInterview />} />
      <Route path="/mock/:sessionId/review" element={<MockReview />} />
      <Route path="/history" element={<History />} />
      <Route path="/history/answer/:answerId" element={<AnswerDetail />} />
      <Route path="/questions" element={<MyQuestions />} />
    </Routes>
  )
}
