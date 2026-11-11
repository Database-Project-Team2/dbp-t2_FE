import { Icon } from '../actions/Icon'

export function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <div
      className="mt-4 flex items-center gap-2 rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-xs leading-relaxed text-brand-ink"
      role="alert"
    >
      <Icon name="info" size={18} />
      {error}
    </div>
  ) : null
}
