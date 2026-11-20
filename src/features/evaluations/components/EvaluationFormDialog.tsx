import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { ErrorMessage } from '@/shared/ui/feedback/ErrorMessage'
import { DateInput } from '@/shared/ui/forms/DateInput'
import { Field } from '@/shared/ui/forms/Field'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { Icon } from '@/shared/ui/actions/Icon'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Select } from '@/shared/ui/forms/Select'
import { type Notice, go } from '@/app/routing/navigation'
import { useSession } from '@/app/session/SessionContext'
import { evaluationsApi, projectsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import { ROLES } from '@/shared/model/labels'
import type { EligibleProject } from '@/shared/api/types'
import type { EvaluationType } from '@/shared/model/entities'
import { ScoreField } from './ScoreField'

export function EvaluationFormDialog({
  project: p,
  onClose,
  onNotice,
}: {
  project: EligibleProject
  onClose: () => void
  onNotice: Notice
}) {
  const { today } = useSession()
  const [type, setType] = useState<EvaluationType>('PEER')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState(today)
  const [work, setWork] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [workComment, setWorkComment] = useState('')
  const [communicationComment, setCommunicationComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // 평가 대상·실제 평가자·제출 가능 여부는 서버가 로그인 정보로 계산합니다.
  const options = useApi(
    () => projectsApi.evaluationOptions(p.project_id, type),
    [p.project_id, type],
  )
  const available = options.data?.available_targets ?? []
  const blockedClient =
    type === 'CLIENT' && (p.workflow_status === 'NOT_REQUESTED' || p.workflow_status === 'REPORTED')
  const blockedReason = options.data?.blocked_reason

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!work || !communication) {
      setError('두 항목 모두 1~5점으로 선택해 주세요.')
      return
    }
    setBusy(true)
    try {
      await evaluationsApi.create({
        target_member_id: Number(target),
        evaluation_type: type,
        evaluated_date: date,
        work_performance_score: work,
        work_performance_comment: workComment,
        communication_score: communication,
        communication_comment: communicationComment,
      })
      onClose()
      onNotice('평가를 제출했어요. 소중한 피드백 감사합니다.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal wide title="프로젝트 평가 작성" subtitle={p.project_name} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <Field label="평가유형">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as EvaluationType)
                setTarget('')
                setError('')
              }}
            >
              <option value="PEER">동료평가</option>
              {p.my_role === 'PM' && (
                <>
                  <option value="PM">PM 평가</option>
                  <option value="CLIENT">고객평가</option>
                </>
              )}
            </Select>
          </Field>
          <Field label="평가일">
            <DateInput
              required
              min={options.data?.min_evaluated_date || p.actual_end_date}
              max={today}
              value={date}
              onValueChange={setDate}
            />
          </Field>
          <Field label="평가 대상" wide hint="이미 제출한 대상은 목록에서 제외돼요.">
            <Select required value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">직원을 선택하세요</option>
              {available.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.employee_name} · {ROLES[m.project_role]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {options.data && !available.length && !blockedClient && (
          <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
            {blockedReason || '이 유형에서 작성할 수 있는 평가를 모두 제출했어요.'}
          </div>
        )}
        {type === 'CLIENT' && options.data && (
          <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
            <Icon name="info" size={18} />
            <span>
              실제 평가자: {options.data.evaluator.name} ({options.data.evaluator.client_name})
              <br />
              시스템 등록자: {options.data.registered_by.employee_name} PM
            </span>
          </div>
        )}
        {blockedClient && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-xs leading-relaxed text-brand-ink">
            {p.workflow_status === 'REPORTED' ? (
              '이미 회사 보고를 완료한 프로젝트예요.'
            ) : (
              <span>
                고객평가 의뢰일을 먼저 기록해 주세요.{' '}
                <Button
                  variant="text"
                  size="plain"
                  type="button"
                  onClick={() => {
                    onClose()
                    go(`projects/${p.project_id}`)
                  }}
                >
                  프로젝트로 이동
                </Button>
              </span>
            )}
          </div>
        )}
        <ScoreField
          label="업무수행"
          description="맡은 업무의 완성도와 문제 해결 과정을 평가해 주세요."
          score={work}
          setScore={setWork}
          comment={workComment}
          setComment={setWorkComment}
        />
        <ScoreField
          label="커뮤니케이션"
          description="정보 공유와 팀원 간 협업 과정을 평가해 주세요."
          score={communication}
          setScore={setCommunication}
          comment={communicationComment}
          setComment={setCommunicationComment}
        />
        <ErrorMessage error={error} />
        <FormActions>
          <span className="text-xs text-muted">두 항목의 점수와 의견을 모두 입력해 주세요.</span>
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={busy || !available.length || blockedClient}
          >
            평가 제출
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}
