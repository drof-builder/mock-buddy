import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { createRepository } from './services/db'
import { createMediaRecorder } from './services/recorder'
import { browserStorage } from './services/storage'
import { AppRoutes } from './ui/AppRoutes'
import { ServicesProvider, type Services } from './ui/services'
import './ui/styles.css'

const services: Services = {
  recorder: createMediaRecorder(),
  repo: createRepository(),
  storage: browserStorage,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ServicesProvider>
  </StrictMode>,
)
