import type { IconName } from '../actions/Icon'

interface StatProps {
  label: string
  value: number | string
  unit: string
  detail: string
  icon: IconName
  tone?: string
}
export function Stat({ label, value, unit, detail }: StatProps) {
  return (
    <article className="group border-l border-line px-7 first:border-l-0">
      <p className="text-[13px] text-secondary">{label}</p>
      <strong className="mt-4 block text-[34px] leading-tight font-bold tracking-tight group-first:text-brand-ink">
        {value}
        <small className="ml-2 text-sm font-normal tracking-normal text-muted">{unit}</small>
      </strong>
      <p className="mt-3 text-[11px] text-muted">{detail}</p>
    </article>
  )
}
