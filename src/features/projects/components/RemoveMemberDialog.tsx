import { useState } from 'react'
import type { Member } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'
import { membersApi } from '@/shared/api/resources'
import type { EmployeeSummary } from '@/shared/api/types'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { FormActions } from '@/shared/ui/forms/FormActions'

export function RemoveMemberDialog({
  member,
  onClose,
  onNotice,
}: {
  member: Member & { employee: EmployeeSummary }
  onClose: () => void
  onNotice: Notice
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const employee = member.employee
  async function remove() {
    if (busy) return
    setBusy(true)
    try {
      await membersApi.remove(member.member_id)
      onClose()
      onNotice('투입 전 구성원을 삭제했어요.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal title="구성원을 삭제할까요?" onClose={onClose}>
      <p className="text-sm leading-7">
        <b>{employee.employee_name}</b> · 사번 {employee.employee_no}
        <br />이 프로젝트의 구성원 목록에서 제외돼요. 직원 계정과 다른 프로젝트의 참여 기록은
        유지돼요.
      </p>
      <ErrorMessage error={error} />
      <FormActions>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button onClick={remove} disabled={busy}>
          구성원 삭제
        </Button>
      </FormActions>
    </Modal>
  )
}
