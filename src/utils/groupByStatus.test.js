import { describe, it, expect } from 'vitest'
import { groupByStatus } from './groupByStatus'

describe('groupByStatus', () => {
  it('returns all three column keys with empty arrays when input is empty', () => {
    const result = groupByStatus([])
    expect(result).toEqual({ a_fazer: [], fazendo: [], feito: [] })
  })

  it('places a single task in the correct column', () => {
    const task = { id: 1, title: 'Buy milk', status: 'a_fazer' }
    const result = groupByStatus([task])
    expect(result.a_fazer).toEqual([task])
    expect(result.fazendo).toEqual([])
    expect(result.feito).toEqual([])
  })

  it('distributes tasks across all three columns', () => {
    const tasks = [
      { id: 1, status: 'a_fazer' },
      { id: 2, status: 'fazendo' },
      { id: 3, status: 'feito' },
      { id: 4, status: 'a_fazer' },
    ]
    const result = groupByStatus(tasks)
    expect(result.a_fazer).toHaveLength(2)
    expect(result.fazendo).toHaveLength(1)
    expect(result.feito).toHaveLength(1)
  })

  it('does not leak tasks with unknown status into any column', () => {
    const task = { id: 99, status: 'arquivado' }
    const result = groupByStatus([task])
    expect(result.a_fazer).toEqual([])
    expect(result.fazendo).toEqual([])
    expect(result.feito).toEqual([])
  })
})
