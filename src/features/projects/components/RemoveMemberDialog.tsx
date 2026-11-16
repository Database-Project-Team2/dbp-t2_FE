import { useState } from 'react'
import type { Member } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { FormActions } from '@/shared/ui/forms/FormActions'

export function RemoveMemberDialog({
  member,
  onClose,
  onNotice,
}: {
  member: Member
  onClose: () => void
  onNotice: Notice
}) {
  const { db, removeMember } = useStore()
  const [error, setError] = useState('')
  const employee = db.employees.find((item) => item.employee_id === member.employee_id)!
  function remove() {
    try {
      removeMember(member.member_id)
      onClose()
      onNotice('투입 전 구성원을 삭제했어요.')
    } catch (err) {
      setError((err as Error).message)
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
        <Button onClick={remove}>구성원 삭제</Button>
      </FormActions>
    </Modal>
  )
}
