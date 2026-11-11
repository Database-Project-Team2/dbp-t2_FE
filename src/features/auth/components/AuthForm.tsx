import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import type { Notice } from '@/app/routing/navigation'
import { CredentialFields } from './CredentialFields'
import { RegistrationFields } from './RegistrationFields'
import { useAuthForm } from '../hooks/useAuthForm'

export function AuthForm({ signup, onNotice }: { signup: boolean; onNotice: Notice }) {
  const form = useAuthForm(signup, onNotice)
  return (
    <form onSubmit={form.handleSubmit}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <CredentialFields form={form} signup={signup} />
        {signup && <RegistrationFields form={form} />}
      </div>
      <ErrorMessage error={form.error} />
      <Button className="mt-6 w-full" type="submit" disabled={form.busy}>
        {form.busy ? '처리 중…' : signup ? '가입하고 시작하기' : '로그인'}
      </Button>
    </form>
  )
}
