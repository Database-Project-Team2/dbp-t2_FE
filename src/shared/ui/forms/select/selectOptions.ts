import { Children, Fragment, isValidElement, type ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled: boolean
}
function textContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      return isValidElement<{ children?: ReactNode }>(child)
        ? textContent(child.props.children)
        : ''
    })
    .join('')
}

/** 기존 option 선언을 유지하면서 커스텀 목록에 필요한 값·레이블만 꺼냅니다. */
export function selectOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)
    )
      return []
    if (child.type === Fragment) return selectOptions(child.props.children)
    if (child.type !== 'option') return []
    const label = textContent(child.props.children)
    return [{ value: String(child.props.value ?? label), label, disabled: !!child.props.disabled }]
  })
}
