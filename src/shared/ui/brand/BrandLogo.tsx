import { cn } from '../../lib/cn'
import logoUrl from '../../../assets/promp-logo.png'

export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <a
      className={cn('inline-flex w-[165px] shrink-0 items-center leading-none', className)}
      href="#/dashboard"
      aria-label="프람트테크놀로지 워크스페이스 홈"
    >
      <img
        className="block h-auto w-full"
        src={logoUrl}
        alt="PROMPT TECHNOLOGY"
        width="929"
        height="224"
      />
    </a>
  )
}
