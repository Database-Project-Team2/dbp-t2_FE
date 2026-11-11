import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { FormActions } from '@/shared/ui/forms/FormActions'
import { go, type Notice } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { Modal } from '@/shared/ui/overlays/Modal'
import { Select } from '@/shared/ui/forms/Select'
import { useStore } from '@/store/StoreContext'

interface DemoSettingsProps {
  onClose: () => void
  onNotice: Notice
}

export function DemoSettingsDialog({ onClose, onNotice }: DemoSettingsProps) {
  const { user, switchUser, reset } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    reset()
    onClose()
    go('dashboard')
    onNotice('처음의 샘플 데이터로 돌아왔어요.')
  }

  if (confirmReset) {
    return (
      <Modal
        key="reset"
        title="처음 상태로 돌아갈까요?"
        subtitle="이 브라우저에서 등록한 직원, 프로젝트와 평가가 초기 샘플 데이터로 바뀌어요."
        onClose={onClose}
      >
        <FormActions>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleReset}>
            초기화하기
          </Button>
        </FormActions>
      </Modal>
    )
  }

  return (
    <Modal
      key="settings"
      title="데모 설정"
      subtitle="역할별 화면을 체험하고 샘플 데이터를 관리하세요."
      onClose={onClose}
    >
      <label className="flex min-w-0 flex-col gap-2 text-xs text-secondary">
        <span>체험할 계정</span>
        <Select
          aria-label="데모 계정 전환"
          value={user!.employee_id}
          onChange={(event) => {
            switchUser(Number(event.target.value))
            onClose()
            go('dashboard')
            onNotice('선택한 계정으로 전환했어요.')
          }}
        >
          <option value={1}>경영진 · 김민준</option>
          <option value={5}>PM · 정도윤</option>
          <option value={2}>직원 · 이서연</option>
          {![1, 2, 5].includes(user!.employee_id) && (
            <option value={user!.employee_id}>{user!.employee_name}</option>
          )}
        </Select>
      </label>
      <div className="mt-6 border-t border-line pt-5 [&_p]:mb-4 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-muted">
        <p>가상 데이터로 동작하며, 변경 사항은 이 브라우저에만 저장됩니다.</p>
        <Button variant="text" size="plain" onClick={() => setConfirmReset(true)}>
          <Icon name="reset" size={15} />
          샘플 데이터 초기화
        </Button>
      </div>
    </Modal>
  )
}
