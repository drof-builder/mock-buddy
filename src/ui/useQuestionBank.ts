import { useEffect, useMemo, useState } from 'react'
import { STARTER_QUESTIONS } from '../data/starterQuestions'
import type { Question } from '../domain/types'
import { useServices } from './services'

export interface QuestionBank {
  loading: boolean
  all: Question[]
  hiddenIds: string[]
}

/** Starter questions plus the user's own, and which starter questions are hidden. */
export function useQuestionBank(): QuestionBank {
  const { repo } = useServices()
  const [state, setState] = useState<{ loading: boolean; custom: Question[]; hiddenIds: string[] }>({
    loading: true,
    custom: [],
    hiddenIds: [],
  })

  useEffect(() => {
    let live = true
    void Promise.all([repo.listCustomQuestions(), repo.getSettings()]).then(([custom, settings]) => {
      if (live) setState({ loading: false, custom, hiddenIds: settings.hiddenStarterIds })
    })
    return () => {
      live = false
    }
  }, [repo])

  const all = useMemo(() => [...STARTER_QUESTIONS, ...state.custom], [state.custom])
  return { loading: state.loading, all, hiddenIds: state.hiddenIds }
}
