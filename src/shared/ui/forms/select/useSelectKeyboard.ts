import { useRef, type KeyboardEvent } from 'react'
import type { SelectOption } from './selectOptions'

export function useSelectKeyboard(
  options: SelectOption[],
  open: boolean,
  active: number,
  setActive: (index: number) => void,
  show: () => void,
  hide: () => void,
  choose: (index: number) => void,
) {
  const search = useRef({ text: '', time: 0 })
  return (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabled = options.map((_, index) => index).filter((index) => !options[index].disabled)
    if (event.key === 'Tab') {
      hide()
      return
    }
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        event.stopPropagation()
        hide()
      }
      return
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      show()
      const current = enabled.indexOf(active)
      let next = active
      if (event.key === 'Home') next = enabled[0]
      else if (event.key === 'End') next = enabled.at(-1)!
      else if (open)
        next =
          enabled[
            (current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
          ]
      if (next !== undefined) setActive(next)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(active)
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key !== ' '
    ) {
      event.preventDefault()
      const now = Date.now()
      search.current.text =
        now - search.current.time < 700 ? search.current.text + event.key : event.key
      search.current.time = now
      const prefix = search.current.text.toLocaleLowerCase()
      const ordered = [
        ...enabled.filter((index) => index > active),
        ...enabled.filter((index) => index <= active),
      ]
      const match = ordered.find((index) =>
        options[index].label.toLocaleLowerCase().startsWith(prefix),
      )
      if (match !== undefined) {
        show()
        setActive(match)
      }
    }
  }
}
