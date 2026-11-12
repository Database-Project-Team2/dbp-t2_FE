import { Field } from '@/shared/ui/forms/Field'
import { Input } from '@/shared/ui/forms/Input'
import { JOBS } from '@/shared/model/labels'
import { EDUCATIONS } from '@/shared/model/employeeOptions'
import { Select } from '@/shared/ui/forms/Select'
import { Textarea } from '@/shared/ui/forms/Textarea'
import type { Job } from '@/shared/model/entities'
import type { AuthFormState } from '../hooks/useAuthForm'
import { ResidentNumberField } from './ResidentNumberField'

export function RegistrationFields({ form }: { form: AuthFormState }) {
  const { values, setField, today, errors, fieldProps } = form
  return (
    <>
      <Field
        label="직원 이름"
        inputId="auth-name"
        error={errors.name}
        messageId="auth-name-message"
      >
        <Input
          {...fieldProps('name')}
          required
          maxLength={100}
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="이름을 입력하세요"
          autoComplete="name"
        />
      </Field>
      <Field
        label="최종학력"
        inputId="auth-education"
        error={errors.education}
        messageId="auth-education-message"
      >
        <Select
          {...fieldProps('education')}
          required
          value={values.education}
          onChange={(event) => setField('education', event.target.value)}
        >
          <option value="" disabled>
            최종학력 선택
          </option>
          {EDUCATIONS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
      </Field>
      <ResidentNumberField form={form} />
      <Field label="입사일" inputId="auth-hire" error={errors.hire} messageId="auth-hire-message">
        <Input
          {...fieldProps('hire')}
          required
          type="date"
          max={today}
          value={values.hire}
          onChange={(event) => setField('hire', event.target.value)}
        />
      </Field>
      <Field label="직군" inputId="auth-job">
        <Select
          {...fieldProps('job')}
          value={values.job}
          onChange={(event) => setField('job', event.target.value as Job)}
        >
          {Object.entries(JOBS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="총 경력 (개월)"
        inputId="auth-months"
        error={errors.months}
        messageId="auth-months-message"
      >
        <Input
          {...fieldProps('months')}
          required
          type="number"
          min="0"
          step="1"
          value={values.months}
          onChange={(event) => setField('months', event.target.value)}
        />
      </Field>
      <Field label="보유 기술과 경험 (선택)" inputId="auth-skills" wide>
        <Textarea
          {...fieldProps('skills')}
          rows={2}
          value={values.skills}
          onChange={(event) => setField('skills', event.target.value)}
          placeholder="예: Java, SQL 및 프로젝트 협업 경험"
        />
      </Field>
    </>
  )
}
