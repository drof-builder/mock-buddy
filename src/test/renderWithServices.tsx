import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createRepository } from '../services/db'
import { AppRoutes } from '../ui/AppRoutes'
import { ServicesProvider, type Services } from '../ui/services'
import { createFakeRecorder } from './fakeRecorder'
import { createFakeStorage } from './fakeStorage'

export function renderWithServices(path: string, overrides: Partial<Services> = {}) {
  const services: Services = {
    recorder: createFakeRecorder(),
    repo: createRepository(`test-${crypto.randomUUID()}`),
    storage: createFakeStorage(),
    ...overrides,
  }
  const result = render(
    <ServicesProvider services={services}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ServicesProvider>,
  )
  return { ...result, services }
}
