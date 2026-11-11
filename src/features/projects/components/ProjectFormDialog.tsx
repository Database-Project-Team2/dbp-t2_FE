import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Icon } from '@/shared/ui/actions/Icon'
import { Input } from '@/shared/ui/forms/Input'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Select } from '@/shared/ui/forms/Select'
import { type Notice, go } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import type { Project } from '@/shared/model/entities'

export function ProjectFormDialog({
  project,
  onClose,
  onNotice,
}: {
  project: Project
  onClose: () => void
  onNotice: Notice
}) {
  const { db, today, saveProject } = useStore()
  const [form, setForm] = useState(project)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const id = saveProject(form)
      onNotice('프로젝트 정보를 저장했어요.')
      onClose()
      go(`projects/${id}`)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal
      title={project.project_id ? '프로젝트 정보 수정' : '새 프로젝트 등록'}
      subtitle="실제 착수한 프로젝트를 등록하고 예정 일정을 관리해요."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="프로젝트명" wide>
            <Input
              autoFocus
              required
              maxLength={200}
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              placeholder="프로젝트 이름을 입력하세요"
            />
          </Field>
          <Field label="발주처" wide>
            <Select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
            >
              {db.clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="실제 착수일">
            <Input
              required
              type="date"
              max={today}
              value={form.actual_start_date}
              onInput={(e) => setForm({ ...form, actual_start_date: e.currentTarget.value })}
            />
          </Field>
          <Field label="예정 종료일">
            <Input
              required
              type="date"
              min={form.actual_start_date}
              value={form.planned_end_date}
              onInput={(e) => setForm({ ...form, planned_end_date: e.currentTarget.value })}
            />
          </Field>
        </div>
        <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
          <Icon name="info" size={18} />
          프로젝트 번호는 자동으로 부여돼요. 종료는 상세 화면에서 기록할 수 있어요.
        </div>
        <ErrorMessage error={error} />
        <FormActions>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            {project.project_id ? '변경 사항 저장' : '프로젝트 등록'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
