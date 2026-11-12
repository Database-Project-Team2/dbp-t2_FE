import { useRef } from 'react'
import { SecretInput } from '@/shared/ui/forms/SecretInput'
import { Input } from '@/shared/ui/forms/Input'
import type { AuthFormState } from '../hooks/useAuthForm'

export function ResidentNumberField({ form }: { form: AuthFormState }) {
  const [front = '', back = ''] = form.values.residentNo.split('-')
  const backRef = useRef<HTMLInputElement>(null)
  const error = form.errors.residentNo
  function update(frontValue: string, backValue: string) {
    form.setField('residentNo', `${frontValue}-${backValue}`)
  }
  return (
    <fieldset
      className="col-span-full"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          form.fieldProps('residentNo').onBlur()
      }}
      aria-describedby={error ? 'auth-residentNo-message' : undefined}
    >
      <legend className="mb-2 text-xs font-medium text-secondary">주민등록번호</legend>
      <div className="flex items-center gap-3">
        <Input
          {...form.fieldProps('residentNo')}
          onBlur={undefined}
          aria-label="주민등록번호 앞 6자리"
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={front}
          placeholder="앞 6자리"
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text').trim()
            if (/^\d{6}-?\d{7}$/.test(pasted)) {
              event.preventDefault()
              const digits = pasted.replace('-', '')
              update(digits.slice(0, 6), digits.slice(6))
              backRef.current?.focus()
            }
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
            update(digits, back)
            if (digits.length === 6) backRef.current?.focus()
          }}
        />
        <span aria-hidden="true" className="text-muted">
          –
        </span>
        <SecretInput
          label="주민등록번호 뒷자리"
          {...form.fieldProps('residentNo')}
          onBlur={undefined}
          ref={backRef}
          id="auth-residentNo-back"
          aria-label="주민등록번호 뒤 7자리"
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={back}
          placeholder="뒤 7자리"
          onChange={(event) => update(front, event.target.value.replace(/\D/g, '').slice(0, 7))}
        />
      </div>
      {error && (
        <p id="auth-residentNo-message" aria-live="polite" className="mt-2 text-[11px] text-brand">
          {error}
        </p>
      )}
    </fieldset>
  )
}
