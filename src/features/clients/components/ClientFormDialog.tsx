import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Input } from '@/shared/ui/forms/Input'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useStore } from '@/store/StoreContext'
import type { Client } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'

export function ClientFormDialog({
  client,
  onClose,
  onNotice,
}: {
  client: Client
  onClose: () => void
  onNotice: Notice
}) {
  const { saveClient } = useStore()
  const [form, setForm] = useState(client)
  const [error, setError] = useState('')
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      saveClient(form)
      onClose()
      onNotice('발주처 정보를 저장했어요.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal
      title={form.client_id ? '발주처 정보 수정' : '발주처 등록'}
      subtitle="발주처마다 대표 담당자 한 명을 관리해요. 담당자 변경은 과거 고객평가 화면에도 반영돼요."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="발주처명" wide>
            <Input
              required
              maxLength={150}
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
          </Field>
          <Field label="담당자명">
            <Input
              required
              maxLength={100}
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </Field>
          <Field label="연락처 (선택)">
            <Input
              type="tel"
              maxLength={30}
              value={form.contact_phone_number || ''}
              onChange={(e) => setForm({ ...form, contact_phone_number: e.target.value || null })}
            />
          </Field>
          <Field label="담당자 이메일" wide>
            <Input
              required
              type="email"
              maxLength={254}
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </Field>
        </div>
        <ErrorMessage error={error} />
        <FormActions>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary">저장하기</Button>
        </FormActions>
      </form>
    </Modal>
  )
}
