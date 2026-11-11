import { Button } from '@/shared/ui/actions/Button'
import { Field } from '@/shared/ui/forms/Field'
import { Input } from '@/shared/ui/forms/Input'
import type { AuthFormState } from '../hooks/useAuthForm'

export function CredentialFields({ form, signup }: { form: AuthFormState; signup: boolean }) {
  const { values, setField, idMessage, checkId } = form
  return (
    <>
      <Field label="로그인 ID" wide hint={idMessage}>
        <div className="flex gap-2">
          <Input
            required
            autoComplete="username"
            maxLength={100}
            value={values.loginId}
            onChange={(event) => setField('loginId', event.target.value)}
            placeholder={signup ? '영문·숫자 3자 이상' : '예: demo01'}
          />
          {signup && (
            <Button type="button" variant="secondary" onClick={checkId}>
              중복 확인
            </Button>
          )}
        </div>
      </Field>
      <Field label="비밀번호" wide={!signup}>
        <Input
          required
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          minLength={signup ? 8 : undefined}
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          placeholder="8자 이상 입력하세요"
        />
      </Field>
      {signup && (
        <Field label="비밀번호 확인">
          <Input
            required
            type="password"
            autoComplete="new-password"
            value={values.confirmation}
            onChange={(event) => setField('confirmation', event.target.value)}
          />
        </Field>
      )}
    </>
  )
}
