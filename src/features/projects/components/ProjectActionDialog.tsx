import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Input } from '@/shared/ui/forms/Input'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useStore } from '@/store/StoreContext'
import type { Notice } from '@/app/routing/navigation'
import type { Project } from '@/shared/model/entities'

export function ProjectActionDialog({
  project: p,
  closing: close,
  onClose,
  onNotice,
}: {
  project: Project
  closing: boolean
  onClose: () => void
  onNotice: Notice
}) {
  const { today, saveProject, recordWorkflow } = useStore()
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (close) saveProject({ ...p, actual_end_date: date })
      else recordWorkflow(p.project_id, date)
      onClose()
      onNotice(
        close
          ? '프로젝트 종료와 구성원 투입 종료를 함께 기록했어요.'
          : '고객평가 진행 상태를 기록했어요.',
      )
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal
      title={close ? '프로젝트를 종료할까요?' : '고객평가 처리일 기록'}
      subtitle={
        close
          ? '현재 투입 중인 구성원의 종료일도 함께 기록해요. 종료 후 평가를 작성할 수 있어요.'
          : '실제로 처리한 날짜를 기록해 주세요.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <Field label={close ? '실제 종료일' : '처리일'}>
          <Input
            required
            type="date"
            min={p.actual_start_date}
            max={today}
            value={date}
            onInput={(e) => setDate(e.currentTarget.value)}
          />
        </Field>
        <ErrorMessage error={error} />
        <FormActions>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            {close ? '종료 확정' : '기록하기'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
