import type { Client, Employee, Job, Member, Project, ProjectRole } from '../model/entities.ts'

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'CLOSED'
export type WorkflowStatus = 'NOT_REQUESTED' | 'COLLECTING' | 'AWAITING_REPORT' | 'REPORTED'
export type AssignmentStatus = 'NOT_ASSIGNED' | 'ASSIGNED' | 'ENDED'

export interface EmployeeSummary {
  employee_id: number
  employee_no: string
  employee_name: string
  job_category: Job
  employment_status: Employee['employment_status']
}

export interface MemberView extends Member {
  assignment_status: AssignmentStatus
  employee: EmployeeSummary
}

export interface ProjectRef {
  project_id: number
  project_name: string
  status: ProjectStatus
  actual_start_date: string
  planned_end_date: string
  actual_end_date: string | null
}

export interface AssignmentView extends MemberView {
  project: ProjectRef
}

export interface ProjectListItem extends Project {
  status: ProjectStatus
  workflow_status: WorkflowStatus
  client: { client_id: number; client_name: string }
  member_count: number
  current_member_count: number
}

export interface ProjectDetail extends Project {
  status: ProjectStatus
  workflow_status: WorkflowStatus
  client: Client
  member_count: number
  current_member_count: number
  my_membership: {
    member_id: number
    project_role: ProjectRole
    assignment_start_date: string | null
    assignment_end_date: string | null
    assignment_status: AssignmentStatus
    actual_participant: boolean
  } | null
  permissions: {
    can_manage: boolean
    can_record_customer_evaluation: boolean
    can_view_evaluation_comments: boolean
    can_evaluate: boolean
  }
  customer_evaluation_progress: { participant_count: number; received_count: number }
}

export interface EmployeeListItem extends Employee {
  current_assignment_count: number
}

export interface ClientView extends Client {
  project_count: number
}

export interface DashboardProject {
  project_id: number
  project_name: string
  client_id: number
  client_name: string
  actual_start_date: string
  planned_end_date: string
  actual_end_date: string | null
  status: ProjectStatus
  current_member_count: number
  overdue: boolean
}

export interface CustomerEvaluationTask {
  project_id: number
  project_name: string
  actual_end_date: string
  workflow_status: WorkflowStatus
  participant_count: number
  received_count: number
}

export interface ManagementDashboard {
  view: 'MANAGEMENT'
  as_of: string
  server_today: string
  metrics: {
    ongoing_project_count: number
    total_project_count: number
    employees_without_projects: number
    customer_evaluation_pending: number
  }
  ongoing_projects: DashboardProject[]
  overdue_projects: DashboardProject[]
  pending_customer_evaluations: CustomerEvaluationTask[]
  timeline_projects: DashboardProject[]
  current_assignments: AssignmentView[]
}

export interface MyProject {
  project_id: number
  project_name: string
  client_id: number
  client_name: string
  actual_start_date: string
  planned_end_date: string
  my_role: ProjectRole
  my_assignment_start_date: string | null
  current_member_count: number
  overdue: boolean
}

export interface EmployeeDashboard {
  view: 'EMPLOYEE'
  as_of: string
  server_today: string
  metrics: {
    active_project_count: number
    upcoming_project_count: number
    pending_evaluation_count: number
    pending_evaluation_project_count: number
  }
  my_projects: MyProject[]
  evaluation_tasks: { project_id: number; project_name: string; count: number }[]
  customer_evaluation_tasks: CustomerEvaluationTask[]
  has_current_pm_assignment: boolean
  upcoming_pm_projects: {
    project_id: number
    project_name: string
    planned_end_date: string
    days_left: number
  }[]
}
