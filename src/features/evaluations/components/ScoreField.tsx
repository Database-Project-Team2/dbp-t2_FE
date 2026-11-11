import { cn } from '@/shared/lib/cn'
import { Textarea } from '@/shared/ui/forms/Textarea'

export function ScoreField({
  label,
  description,
  score,
  setScore,
  comment,
  setComment,
}: {
  label: string
  description: string
  score: number
  setScore: (n: number) => void
  comment: string
  setComment: (s: string) => void
}) {
  return (
    <fieldset
      className={cn(
        'mt-5 border-t border-line pt-6 [&_legend]:pr-2.5 [&_legend]:text-[15px]',
        '[&_legend]:font-semibold [&>p]:-mt-2.5 [&>p]:mb-4 [&>p]:text-[11px] [&>p]:text-muted',
      )}
    >
      <legend>{label}</legend>
      <p>{description}</p>
      <div className="grid grid-cols-5 gap-2.5" role="group" aria-label={`${label} 점수`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={score === n}
            aria-label={`${label} ${n}점`}
            className={cn(
              'rounded-xl border p-3 text-lg font-semibold [&_small]:ml-1 [&_small]:text-xs [&_small]:font-normal',
              score === n
                ? 'border-brand bg-brand-soft text-brand-ink ring-1 ring-brand'
                : 'border-line bg-canvas text-muted',
            )}
            onClick={() => setScore(n)}
          >
            {n}
            <small>점</small>
          </button>
        ))}
      </div>
      <div className="mt-2 mb-5 flex justify-between text-[10px] text-muted">
        <span>개선이 필요해요</span>
        <span>매우 우수해요</span>
      </div>
      <label className="flex min-w-0 flex-col gap-2 text-xs text-secondary">
        <span className="sr-only">{label} 평가 의견</span>
        <Textarea
          required
          aria-label={`${label} 평가 의견`}
          rows={3}
          placeholder="구체적인 경험을 바탕으로 의견을 남겨 주세요."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
    </fieldset>
  )
}
