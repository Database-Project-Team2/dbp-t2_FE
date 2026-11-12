import { AssignmentsPage } from '@/features/assignments/pages/AssignmentsPage'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { ClientsPage } from '@/features/clients/pages/ClientsPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeesPage } from '@/features/employees/pages/EmployeesPage'
import { EvaluationsPage } from '@/features/evaluations/pages/EvaluationsPage'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement } from '@/shared/domain/permissions'
import { ProfilePage } from '@/features/employees/pages/ProfilePage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { useStore } from '@/store/StoreContext'
import { go, type Notice } from './navigation'

interface AppRoutesProps {
  route: string
  onNotice: Notice
}

/** 주소와 권한에 따라 표시할 페이지를 선택합니다. */
export function AppRoutes({ route, onNotice }: AppRoutesProps) {
  const { user } = useStore()
  const [page, id] = route.split('/')
  const managementOnly = page === 'people' || page === 'clients'

  if (managementOnly && !isManagement(user!)) {
    return (
      <Card className="p-16 text-center [&>p]:my-6 [&>p]:text-muted [&>svg]:mx-auto [&>svg]:mb-5 [&>svg]:text-brand-line">
        <Icon name="shield" size={40} />
        <h1>경영진 전용 메뉴예요</h1>
        <p>내 프로필과 참여 프로젝트는 계속 확인할 수 있어요.</p>
        <Button variant="primary" onClick={() => go('dashboard')}>
          업무 현황으로
        </Button>
      </Card>
    )
  }

  switch (page) {
    case 'projects':
      return <ProjectsPage id={Number(id) || undefined} onNotice={onNotice} />
    case 'people':
      return <EmployeesPage onNotice={onNotice} />
    case 'history':
      return <AssignmentsPage onNotice={onNotice} />
    case 'evaluations':
      return <EvaluationsPage onNotice={onNotice} />
    case 'clients':
      return <ClientsPage onNotice={onNotice} />
    case 'profile':
      return <ProfilePage onNotice={onNotice} />
    default:
      return <DashboardPage />
  }
}
