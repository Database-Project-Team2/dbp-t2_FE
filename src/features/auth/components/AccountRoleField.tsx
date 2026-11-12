import { ACCOUNT_ROLES } from '@/shared/model/employeeOptions'
import type { SystemRole } from '@/shared/model/entities'
import type { AuthFormState } from '../hooks/useAuthForm'

export function AccountRoleField({ form }: { form: AuthFormState }) {
  return (
    <fieldset
      className="mb-7"
      aria-describedby={form.errors.role ? 'auth-role-message' : undefined}
    >
      <legend className="mb-3 text-xs font-medium text-secondary">가입 유형</legend>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ACCOUNT_ROLES).map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 py-3.5 text-xs text-secondary has-checked:border-brand has-checked:bg-brand-soft has-checked:font-semibold has-checked:text-brand-ink has-focus-visible:ring-2 has-focus-visible:ring-brand"
          >
            <input
              {...form.fieldProps('role')}
              id={'auth-role-' + value}
              type="radio"
              value={value}
              required
              checked={form.values.role === value}
              className="size-3.5 accent-brand"
              onChange={() => form.setField('role', value as SystemRole)}
            />
            {label}
          </label>
        ))}
      </div>
      {form.errors.role && (
        <p id="auth-role-message" aria-live="polite" className="mt-2 text-[11px] text-brand">
          {form.errors.role}
        </p>
      )}
    </fieldset>
  )
}
