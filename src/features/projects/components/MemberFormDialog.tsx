import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { DateInput } from '@/shared/ui/forms/DateInput'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { EmployeePicker } from '@/features/employees/components/EmployeePicker'
import { ROLES } from '@/shared/model/labels'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Select } from '@/shared/ui/forms/Select'
import { useSession } from '@/app/session/SessionContext'
import { membersApi, projectsApi } from '@/shared/api/resources'
import type { EmployeeSummary } from '@/shared/api/types'
import type { Member, ProjectRole } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'

export function MemberFormDialog({
  member,
  onClose,
  onNotice,
}: {
  member: Member & { employee?: EmployeeSummary }
  onClose: () => void
  onNotice: Notice
}) {
  const { today } = useSession()
  const [form, setForm] = useState(member)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const employee = member.employee

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      if (member.member_id)
        await membersApi.changeAssignment(member.member_id, {
          assignment_start_date: form.assignment_start_date,
          assignment_end_date: form.assignment_end_date,
        })
      else
        await projectsApi.addMember(member.project_id, {
          employee_id: form.employee_id,
          project_role: form.project_role,
          assignment_start_date: form.assignment_start_date,
          assignment_end_date: form.assignment_end_date,
        })
      onClose()
      onNotice('구성원의 투입 정보를 저장했어요.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      wide={!member.member_id}
      title={member.member_id ? '실제 투입기간 관리' : '프로젝트 구성원 추가'}
      subtitle={
        member.member_id
          ? '실제로 참여한 기간을 기록해 주세요.'
          : '직원을 선택하고 이 프로젝트에서 맡을 역할을 지정해 주세요.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {member.member_id ? (
          <p className="mb-5 text-sm">
            <b>{employee?.employee_name}</b>
            <span className="ml-3 text-secondary">사번 {employee?.employee_no}</span>
          </p>
        ) : (
          <EmployeePicker
            projectId={member.project_id}
            value={form.employee_id}
            onSelect={(employee_id) => {
              setForm({ ...form, employee_id })
              setError('')
            }}
          />
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field
            label="수행 역할"
            hint="PM은 이 프로젝트의 평가 업무를 담당해요. 처음 지정한 역할은 변경할 수 없어요."
          >
            <Select
              disabled={!!member.member_id}
              value={form.project_role}
              onChange={(e) => setForm({ ...form, project_role: e.target.value as ProjectRole })}
            >
              {Object.entries(ROLES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="실제 투입 시작일" hint="투입 전이면 비워 두세요.">
            <DateInput
              max={today}
              value={form.assignment_start_date || ''}
              onValueChange={(value) => setForm({ ...form, assignment_start_date: value || null })}
            />
          </Field>
          <Field label="실제 투입 종료일" hint="진행 중이면 비워 두세요.">
            <DateInput
              min={form.assignment_start_date || undefined}
              max={today}
              value={form.assignment_end_date || ''}
              onValueChange={(value) => setForm({ ...form, assignment_end_date: value || null })}
            />
          </Field>
        </div>
        <ErrorMessage error={error} />
        <FormActions>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" type="submit" disabled={busy || !form.employee_id}>
            저장하기
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
