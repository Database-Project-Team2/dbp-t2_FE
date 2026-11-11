export type Page =
  'dashboard' | 'projects' | 'people' | 'history' | 'evaluations' | 'clients' | 'profile' | 'guide'

export const go = (path: string) => {
  window.location.hash = '/' + path
}

export type Notice = (message: string) => void

export const navigation: { id: Page; label: string }[] = [
  { id: 'dashboard', label: '업무 현황' },
  { id: 'projects', label: '프로젝트' },
  { id: 'people', label: '직원' },
  { id: 'history', label: '투입 이력' },
  { id: 'evaluations', label: '평가' },
  { id: 'clients', label: '발주처' },
]
