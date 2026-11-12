import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ToggleEvent,
} from 'react'

/** 최상위 레이어를 사용해 대화상자·스크롤 영역에서도 팝업이 잘리지 않게 합니다. */
export function usePopover(width?: number) {
  const id = useId()
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current!
    const panel = panelRef.current!
    function position() {
      const box = anchor.getBoundingClientRect()
      const panelWidth = Math.min(width || box.width, window.innerWidth - 24)
      const naturalHeight = panel.scrollHeight + 2
      const below = window.innerHeight - box.bottom - 20
      const above = box.top - 20
      const placeBelow = below >= naturalHeight || below >= above
      const available = Math.max(100, placeBelow ? below : above)
      const panelHeight = Math.min(naturalHeight, available)
      setStyle({
        width: panelWidth,
        left: Math.max(12, Math.min(box.left, window.innerWidth - panelWidth - 12)),
        top: Math.max(12, placeBelow ? box.bottom + 8 : box.top - panelHeight - 8),
        maxHeight: available,
      })
    }
    function focusOutside(event: FocusEvent) {
      if (
        event.target instanceof Node &&
        !anchor.contains(event.target) &&
        !panel.contains(event.target)
      )
        panel.hidePopover()
    }
    position()
    const resize = new ResizeObserver(position)
    resize.observe(anchor)
    resize.observe(panel)
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    document.addEventListener('focusin', focusOutside)
    return () => {
      resize.disconnect()
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
      document.removeEventListener('focusin', focusOutside)
    }
  }, [open, width])
  return {
    id,
    open,
    anchorRef,
    panelRef,
    show: () => panelRef.current?.showPopover(),
    hide: () => panelRef.current?.hidePopover(),
    panelProps: {
      id,
      ref: panelRef,
      popover: 'auto' as const,
      style,
      onToggle: (event: ToggleEvent<HTMLDivElement>) => setOpen(event.newState === 'open'),
      className:
        'fixed inset-auto m-0 overflow-auto rounded-2xl border border-line bg-white p-1.5 text-ink shadow-floating',
    },
  }
}
