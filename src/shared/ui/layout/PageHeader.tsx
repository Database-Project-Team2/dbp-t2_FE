import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between gap-5">
      <div>
        {eyebrow && (
          <span className="mb-1 block text-[10px] font-bold tracking-widest text-brand-ink">
            {eyebrow}
          </span>
        )}
        <h1>{title}</h1>
        <p className="mt-2.5 text-[13px] text-muted">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  )
}
