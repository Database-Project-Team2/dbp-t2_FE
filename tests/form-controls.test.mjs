import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement, Fragment } from 'react'
import {
  addDays,
  addMonths,
  calendarDays,
  clampDate,
  dateError,
  inRange,
  isDate,
  monthAllowed,
} from '../src/shared/ui/forms/date/calendarDates.ts'
import { selectOptions } from '../src/shared/ui/forms/select/selectOptions.ts'

test('calendar validates leap years and rejects impossible or incomplete dates', () => {
  for (const value of ['2024-02-29', '2000-02-29', '0001-01-01']) assert(isDate(value))
  for (const value of ['2026-02-29', '1900-02-29', '2026-13-01', '2026-11', '0000-01-01'])
    assert(!isDate(value))
})

test('month navigation preserves the day when possible and clamps at month end', () => {
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29')
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
  assert.equal(addMonths('2026-12-31', 1), '2027-01-31')
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28')
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
})

test('calendar grid starts on Sunday and has 42 consecutive dates across year boundaries', () => {
  const days = calendarDays('2026-01-01')
  assert.equal(days.length, 42)
  assert.equal(days[0], '2025-12-28')
  assert.equal(days[41], '2026-02-07')
  assert.equal(new Set(days).size, 42)
  assert.equal(calendarDays('2024-02-01').filter((day) => day === '2024-02-29').length, 1)
})

test('date bounds include both endpoints and block out-of-range days and months', () => {
  const min = '2026-03-10',
    max = '2026-03-20'
  assert(inRange(min, min, max))
  assert(inRange(max, min, max))
  assert(!inRange('2026-03-21', min, max))
  assert(!inRange('', min, max))
  assert.equal(clampDate('2026-04-01', min, max), max)
  assert.equal(clampDate('2026-01-01', min, max), min)
  assert(monthAllowed('2026-03-01', min, max))
  assert(!monthAllowed('2026-04-01', min, max))
  assert(!monthAllowed('2026-02-01', min, max))
})

test('manual date entry reports format and range violations while allowing optional empty values', () => {
  assert.equal(dateError(''), '')
  assert.match(dateError('2026-02-30'), /올바르게/)
  assert.match(dateError('2025-12-31', '2026-01-01'), /2026-01-01/)
  assert.match(dateError('2027-01-01', '', '2026-12-31'), /2026-12-31/)
  assert.equal(dateError('2026-11-12', '2026-01-01', '2026-12-31'), '')
})

test('custom select retains numeric values, placeholders and conditional fragment options', () => {
  const options = selectOptions([
    createElement('option', { value: '', disabled: true }, '학력 선택'),
    false,
    createElement(
      Fragment,
      null,
      createElement('option', { value: 12 }, '김직원', ' · ', 'PM'),
      createElement('option', null, '석사'),
    ),
  ])
  assert.deepEqual(options, [
    { value: '', label: '학력 선택', disabled: true },
    { value: '12', label: '김직원 · PM', disabled: false },
    { value: '석사', label: '석사', disabled: false },
  ])
})
