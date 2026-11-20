export function csvContent(headers: string[], rows: unknown[][]) {
  const cell = (value: unknown) => {
    let s = String(value ?? '')
    if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`
    return '"' + s.replaceAll('"', '""') + '"'
  }
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 서버가 만든 파일(CSV 등)을 그대로 저장합니다. */
export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
