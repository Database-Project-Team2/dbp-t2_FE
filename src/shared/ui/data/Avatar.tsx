import { cn } from '../../lib/cn'

const colors = [
  'bg-rose-50 text-rose-700',
  'bg-violet-50 text-violet-500',
  'bg-orange-50 text-orange-700',
  'bg-emerald-50 text-emerald-600',
  'bg-fuchsia-50 text-fuchsia-600',
]
interface AvatarProps {
  name: string
  id?: number
  small?: boolean
  className?: string
}
export function Avatar({ name, id = 1, small = false, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold tracking-tight',
        small ? 'size-8 rounded-[10px] text-[10px]' : 'size-10 rounded-xl text-xs',
        colors[id % colors.length],
        className,
      )}
    >
      {name.slice(-2)}
    </span>
  )
}
