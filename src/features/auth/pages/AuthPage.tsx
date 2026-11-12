import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { cn } from '@/shared/lib/cn'
import type { Notice } from '@/app/routing/navigation'
import { AuthBrand } from '../components/AuthBrand'
import { AuthForm } from '../components/AuthForm'

export function AuthPage({ onNotice }: { onNotice: Notice }) {
  const [signup, setSignup] = useState(false)
  return (
    <div className="grid min-h-screen grid-cols-[40%_60%] bg-white">
      <AuthBrand />
      <main className="flex items-center justify-center px-11 py-10">
        <div className={cn('w-full', signup ? 'max-w-[580px]' : 'max-w-[410px]')}>
          <span className="mb-1 block text-[10px] font-bold tracking-widest text-brand-ink">
            PROMPT WORKSPACE
          </span>
          <h1>{signup ? '우리 팀에 합류하세요' : '다시 만나서 반가워요'}</h1>
          <p className="mt-2 text-xs text-muted">
            {signup
              ? '기본 정보를 입력하면 사번이 자동으로 발급돼요.'
              : '계정으로 로그인하고 업무를 이어가세요.'}
          </p>
          <AuthForm key={signup ? 'signup' : 'login'} signup={signup} onNotice={onNotice} />
          <div className="my-6 flex items-center justify-center gap-2 text-xs text-muted">
            {signup ? '이미 계정이 있나요?' : '처음 오셨나요?'}
            <Button variant="text" size="plain" onClick={() => setSignup(!signup)}>
              {signup ? '로그인' : '직원 회원가입'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
