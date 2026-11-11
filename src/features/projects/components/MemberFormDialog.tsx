import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Input } from '@/shared/ui/forms/Input'
import { JOBS, ROLES } from '@/shared/model/labels'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Select } from '@/shared/ui/forms/Select'
import { useStore } from '@/store/StoreContext'
import type { Member, ProjectRole } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'

export function MemberFormDialog({
  member,
  onClose,
  onNotice,
}: {
  member: Member
  onClose: () => void
  onNotice: Notice
}) {
  const { db, today, saveMember } = useStore()
  const [form, setForm] = useState(member)
  const [error, setError] = useState('')
  const options = db.employees.filter((e) =>
    member.member_id
      ? e.employee_id === member.employee_id
      : e.employment_status === 'ACTIVE' &&
        !db.members.some(
          (m) => m.project_id === member.project_id && m.employee_id === e.employee_id,
        ),
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      saveMember(form)
      onClose()
      onNotice('구성원의 투입 정보를 저장했어요.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal
      title={member.member_id ? '실제 투입기간 관리' : '프로젝트 구성원 추가'}
      subtitle="한 프로젝트에는 한 번만 참여하며, 최초 역할은 변경할 수 없어요."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="직원">
            <Select
              required
              disabled={!!member.member_id}
              value={form.employee_id || ''}
              onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })}
            >
              <option value="">직원 선택</option>
              {options.map((e) => (
                <option value={e.employee_id} key={e.employee_id}>
                  {e.employee_name} · {JOBS[e.job_category]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="수행 역할">
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
            <Input
              type="date"
              max={today}
              value={form.assignment_start_date || ''}
              onInput={(e) =>
                setForm({ ...form, assignment_start_date: e.currentTarget.value || null })
              }
            />
          </Field>
          <Field label="실제 투입 종료일" hint="진행 중이면 비워 두세요.">
            <Input
              type="date"
              min={form.assignment_start_date || undefined}
              max={today}
              value={form.assignment_end_date || ''}
              onInput={(e) =>
                setForm({ ...form, assignment_end_date: e.currentTarget.value || null })
              }
            />
          </Field>
        </div>
        <ErrorMessage error={error} />
        <FormActions>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            저장하기
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
