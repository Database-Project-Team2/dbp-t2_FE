import { createContext, useContext } from 'react'

export const FieldContext = createContext<{
  label: string
  labelId: string
  inputId?: string
} | null>(null)

export function useFieldControl(props: {
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}) {
  const field = useContext(FieldContext)
  return {
    id: props.id || field?.inputId,
    'aria-labelledby':
      props['aria-labelledby'] || (props['aria-label'] ? undefined : field?.labelId),
  }
}
