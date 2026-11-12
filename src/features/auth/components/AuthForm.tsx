import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import type { Notice } from '@/app/routing/navigation'
import { AccountRoleField } from './AccountRoleField'
import { CredentialFields } from './CredentialFields'
import { RegistrationFields } from './RegistrationFields'
import { useAuthForm } from '../hooks/useAuthForm'

export function AuthForm({ signup, onNotice }: { signup: boolean; onNotice: Notice }) {
  const form = useAuthForm(signup, onNotice)
  return (
    <form onSubmit={form.handleSubmit} noValidate className="mt-8">
      <fieldset disabled={form.busy} className="min-w-0">
        {signup && <AccountRoleField form={form} />}
        {signup && <h2 className="mb-4 text-sm font-semibold">계정 정보</h2>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <CredentialFields form={form} signup={signup} />
        </div>
        {signup && (
          <section className="mt-7 border-t border-line pt-6" aria-labelledby="employee-info-title">
            <h2 id="employee-info-title" className="mb-4 text-sm font-semibold">
              직원 정보
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <RegistrationFields form={form} />
            </div>
          </section>
        )}
        <ErrorMessage error={form.error} />
        <Button className="mt-6 w-full" type="submit">
          {form.busy ? '처리 중…' : signup ? '회원가입' : '로그인'}
        </Button>
      </fieldset>
    </form>
  )
}
