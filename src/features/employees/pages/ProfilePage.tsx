import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Icon } from '@/shared/ui/actions/Icon'
import { EDUCATIONS, normalizeEducation } from '@/shared/model/employeeOptions'
import { Select } from '@/shared/ui/forms/Select'
import { SecretInput } from '@/shared/ui/forms/SecretInput'
import { Input } from '@/shared/ui/forms/Input'
import { Modal } from '@/shared/ui/overlays/Modal'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { Textarea } from '@/shared/ui/forms/Textarea'
import { useStore } from '@/store/StoreContext'
import type { Notice } from '@/app/routing/navigation'
import { EmployeeDetailDialog } from '../components/EmployeeDetailDialog'

export function ProfilePage({ onNotice }: { onNotice: Notice }) {
  const { user, updateProfile } = useStore()
  const me = user!
  const [edit, setEdit] = useState(false)
  const [education, setEducation] = useState(normalizeEducation(me.education))
  const [months, setMonths] = useState(String(me.total_career_months))
  const [skills, setSkills] = useState(me.skill_description || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const confirmationError = confirm && password !== confirm ? '비밀번호가 일치하지 않아요.' : ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('새 비밀번호가 서로 달라요.')
      return
    }
    setBusy(true)
    try {
      await updateProfile(
        {
          education,
          total_career_months: Number(months),
          skill_description: skills || null,
        },
        password || undefined,
      )
      setEdit(false)
      onNotice('내 프로필을 업데이트했어요.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="내 프로필"
        description="지금까지의 경험을 정리하고, 다음 프로젝트를 준비하세요."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEdit(true)
              setError('')
              setPassword('')
              setConfirm('')
            }}
          >
            <Icon name="edit" size={17} />
            프로필 수정
          </Button>
        }
      />
      <Card as="section" className="max-w-[900px] px-8 py-7">
        <EmployeeDetailDialog employee={me} onNotice={onNotice} />
      </Card>
      {edit && (
        <Modal
          title="내 정보 수정"
          subtitle="최종학력, 총 경력, 기술·경험과 비밀번호를 변경할 수 있어요."
          onClose={() => setEdit(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Field label="최종학력">
                <Select required value={education} onChange={(e) => setEducation(e.target.value)}>
                  <option value="" disabled>
                    최종학력 선택
                  </option>
                  {EDUCATIONS.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </Select>
              </Field>
              <Field label="총 경력 (개월)">
                <Input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                />
              </Field>
              <Field label="기술과 경험" wide>
                <Textarea
                  rows={4}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="보유 기술과 경험을 자유롭게 작성해 주세요"
                />
              </Field>
              <Field label="새 비밀번호" inputId="profile-password" hint="변경할 때만 입력하세요.">
                <SecretInput
                  label="새 비밀번호"
                  id="profile-password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field
                label="새 비밀번호 확인"
                inputId="profile-confirmation"
                error={confirmationError}
                messageId="profile-confirmation-message"
              >
                <SecretInput
                  label="새 비밀번호 확인"
                  id="profile-confirmation"
                  autoComplete="new-password"
                  aria-invalid={!!confirmationError}
                  aria-describedby={confirmationError ? 'profile-confirmation-message' : undefined}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </Field>
            </div>
            <ErrorMessage error={error} />
            <FormActions>
              <Button variant="secondary" type="button" onClick={() => setEdit(false)}>
                취소
              </Button>
              <Button variant="primary" type="submit" disabled={busy}>
                {busy ? '저장 중…' : '변경 사항 저장'}
              </Button>
            </FormActions>
          </form>
        </Modal>
      )}
    </>
  )
}
