import { useState } from 'react'
import { useStore } from '@/store/StoreContext'
import { visibleEvaluations } from '@/shared/domain/permissions'

export function useEvaluationSearch() {
  const { db, user } = useStore()
  const me = user!
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [project, setProject] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const mine = db.projects.filter(
    (p) =>
      p.actual_end_date &&
      db.members.some(
        (m) =>
          m.project_id === p.project_id &&
          m.employee_id === me.employee_id &&
          m.assignment_start_date,
      ),
  )
  const evaluations = visibleEvaluations(db, me)
  const results = evaluations.filter((e) => {
    const target = db.members.find((m) => m.member_id === e.target_member_id)!
    const employee = db.employees.find((p) => p.employee_id === target.employee_id)!
    return (
      employee.employee_name.includes(query) &&
      (!project || String(target.project_id) === project) &&
      (!type || e.evaluation_type === type) &&
      (!from || e.evaluated_date >= from) &&
      (!to || e.evaluated_date <= to)
    )
  })
  const resultProjects = db.projects.filter((p) =>
    evaluations.some(
      (e) =>
        db.members.find((m) => m.member_id === e.target_member_id)?.project_id === p.project_id,
    ),
  )
  return {
    query,
    setQuery,
    type,
    setType,
    project,
    setProject,
    from,
    setFrom,
    to,
    setTo,
    mine,
    evaluations,
    results,
    resultProjects,
  }
}
export type EvaluationSearch = ReturnType<typeof useEvaluationSearch>
