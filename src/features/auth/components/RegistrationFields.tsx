import { Field } from '@/shared/ui/forms/Field'
import { Input } from '@/shared/ui/forms/Input'
import { JOBS } from '@/shared/model/labels'
import { Select } from '@/shared/ui/forms/Select'
import { Textarea } from '@/shared/ui/forms/Textarea'
import type { Job } from '@/shared/model/entities'
import type { AuthFormState } from '../hooks/useAuthForm'

export function RegistrationFields({ form }: { form: AuthFormState }) {
  const { values, setField, today } = form
  return (
    <>
      <Field label="직원 이름">
        <Input
          required
          maxLength={100}
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="가상 이름"
          autoComplete="off"
        />
      </Field>
      <Field label="입사일">
        <Input
          required
          type="date"
          max={today}
          value={values.hire}
          onInput={(event) => setField('hire', event.currentTarget.value)}
        />
      </Field>
      <Field label="최종학력">
        <Input
          required
          maxLength={100}
          value={values.education}
          onChange={(event) => setField('education', event.target.value)}
        />
      </Field>
      <Field label="직군">
        <Select value={values.job} onChange={(event) => setField('job', event.target.value as Job)}>
          {Object.entries(JOBS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="총 경력 (개월)">
        <Input
          required
          type="number"
          min="0"
          step="1"
          value={values.months}
          onChange={(event) => setField('months', event.target.value)}
        />
      </Field>
      <Field label="주민등록번호" hint="실제 번호 수집 없이 화면만 시연해요.">
        <Input disabled value="******-*******" />
      </Field>
      <Field label="보유 기술과 경험 (선택)" wide>
        <Textarea
          rows={2}
          value={values.skills}
          onChange={(event) => setField('skills', event.target.value)}
          placeholder="예: Java, SQL 및 프로젝트 협업 경험"
        />
      </Field>
    </>
  )
}
