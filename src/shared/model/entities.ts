export type SystemRole = 'MANAGEMENT' | 'EMPLOYEE'

export type Job = 'DEVELOPER' | 'MARKETING' | 'BUSINESS_ADMIN' | 'RESEARCH'

export type ProjectRole = 'PM' | 'PL' | 'ANALYST' | 'DESIGNER' | 'PROGRAMMER' | 'TESTER'

export type EvaluationType = 'CLIENT' | 'PM' | 'PEER'

export interface Employee {
  employee_id: number
  employee_no: string
  employee_name: string
  education: string
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED'
  hire_date: string
  resignation_date: string | null
  total_career_months: number
  skill_description: string | null
  job_category: Job
  login_id: string
  system_role: SystemRole
}

export interface Client {
  client_id: number
  client_name: string
  contact_name: string
  contact_email: string
  contact_phone_number: string | null
}

export interface Project {
  project_id: number
  project_name: string
  client_id: number
  actual_start_date: string
  planned_end_date: string
  actual_end_date: string | null
  evaluation_requested_date: string | null
  evaluation_received_date: string | null
  evaluation_reported_date: string | null
}

export interface Member {
  member_id: number
  project_id: number
  employee_id: number
  project_role: ProjectRole
  assignment_start_date: string | null
  assignment_end_date: string | null
}

export interface Evaluation {
  evaluation_id: number
  target_member_id: number
  evaluation_type: EvaluationType
  evaluator_member_id: number | null
  registered_by_member_id: number
  evaluated_date: string
  work_performance_score: number
  work_performance_comment: string
  communication_score: number
  communication_comment: string
}

export interface Database {
  employees: Employee[]
  clients: Client[]
  projects: Project[]
  members: Member[]
  evaluations: Evaluation[]
}
