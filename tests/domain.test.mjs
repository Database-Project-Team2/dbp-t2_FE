import test from 'node:test'
import assert from 'node:assert/strict'
import { csvContent } from '../src/shared/lib/csv.ts'
import { overlapsPeriod } from '../src/shared/lib/date.ts'

test('CSV escapes quotes, newlines, and spreadsheet formulas', () => {
  const csv = csvContent(['이름', '값'], [['=SUM(A1)', 'a"b\nc']])
  assert(csv.startsWith('\uFEFF'))
  assert(csv.includes("'="))
  assert(csv.includes('a""b\nc'))
})

test('SRH-002/003 null ends are open intervals and null starts never match a period', () => {
  assert(overlapsPeriod('2026-08-03', null, '2027-01-01', '2027-12-31'))
  assert(!overlapsPeriod(null, null, '2026-08-01', '2026-08-31'))
  assert(overlapsPeriod('2026-08-03', '2026-09-15', '2026-09-15', '2026-09-15'))
  assert(!overlapsPeriod('2026-08-03', '2026-09-15', '2026-09-16', '2026-09-20'))
  assert(!overlapsPeriod('2026-08-03', null, '2026-09-20', '2026-09-01'))
})
