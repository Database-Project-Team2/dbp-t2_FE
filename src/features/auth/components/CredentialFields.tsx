import { Button } from '@/shared/ui/actions/Button'
import { Field } from '@/shared/ui/forms/Field'
import { Input } from '@/shared/ui/forms/Input'
import type { AuthFormState } from '../hooks/useAuthForm'

export function CredentialFields({ form, signup }: { form: AuthFormState; signup: boolean }) {
  const { values, setField, errors, fieldProps, checkedId, checkId } = form
  return (
    <>
      <Field
        label="로그인 ID"
        inputId="auth-loginId"
        wide
        error={errors.loginId}
        success={signup && checkedId ? '사용할 수 있는 ID예요.' : undefined}
        messageId="auth-loginId-message"
      >
        <div className="flex gap-2">
          <Input
            {...fieldProps('loginId')}
            required
            autoComplete="username"
            maxLength={100}
            value={values.loginId}
            onChange={(event) => setField('loginId', event.target.value)}
            placeholder={signup ? '영문·숫자 3자 이상' : '로그인 ID를 입력하세요'}
          />
          {signup && (
            <Button type="button" variant="secondary" onClick={checkId}>
              중복 확인
            </Button>
          )}
        </div>
      </Field>
      <Field
        label="비밀번호"
        inputId="auth-password"
        wide={!signup}
        error={errors.password}
        messageId="auth-password-message"
      >
        <Input
          {...fieldProps('password')}
          required
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          minLength={signup ? 8 : undefined}
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          placeholder={signup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'}
        />
      </Field>
      {signup && (
        <Field
          label="비밀번호 확인"
          inputId="auth-confirmation"
          error={errors.confirmation}
          messageId="auth-confirmation-message"
          success={
            values.confirmation && values.password === values.confirmation
              ? '비밀번호가 일치해요.'
              : undefined
          }
        >
          <Input
            {...fieldProps('confirmation')}
            required
            type="password"
            autoComplete="new-password"
            value={values.confirmation}
            onChange={(event) => setField('confirmation', event.target.value)}
            placeholder="비밀번호를 한 번 더 입력하세요"
          />
        </Field>
      )}
    </>
  )
}
