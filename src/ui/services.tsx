import { createContext, useContext, type ReactNode } from 'react'
import type { Repository } from '../services/db'
import type { Recorder } from '../services/recorder'
import type { StorageService } from '../services/storage'

export interface Services {
  recorder: Recorder
  repo: Repository
  storage: StorageService
}

const ServicesContext = createContext<Services | null>(null)

export function ServicesProvider({ services, children }: { services: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('useServices must be used inside ServicesProvider')
  return services
}
