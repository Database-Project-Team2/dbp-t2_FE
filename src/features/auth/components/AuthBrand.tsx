import { BrandLogo } from '@/shared/ui/brand/BrandLogo'
import { BrandNetwork } from '@/shared/ui/brand/BrandNetwork'

export function AuthBrand() {
  return (
    <aside className="flex min-h-screen flex-col justify-between gap-6 bg-linear-to-br from-subtle to-rose-100/60 px-14 pt-11 pb-8">
      <BrandLogo className="w-[200px]" />
      <div>
        <span className="text-[10px] font-bold tracking-widest text-brand-ink">
          A BETTER WAY TO WORK
        </span>
        <h1 className="mt-4 text-[39px] leading-normal tracking-[-1.8px]">
          사람과 프로젝트가
          <br />
          함께 성장하는 곳.
        </h1>
        <p className="mt-5 text-sm text-secondary">
          우리 팀의 경험을 연결하고,
          <br />더 나은 협업을 시작하세요.
        </p>
        <BrandNetwork className="mx-auto mt-4 w-full max-w-[360px]" />
        <div className="mt-2 flex items-center justify-center gap-5 text-xs text-brand-ink">
          <span>사람</span>
          <i className="size-1 rounded-full bg-brand-line" />
          <span>프로젝트</span>
          <i className="size-1 rounded-full bg-brand-line" />
          <span>성장</span>
        </div>
      </div>
      <small className="text-[10px] text-muted">프람트테크놀로지 · TEAM 2</small>
    </aside>
  )
}
