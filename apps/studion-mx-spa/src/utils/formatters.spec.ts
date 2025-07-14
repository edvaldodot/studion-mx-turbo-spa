import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDateShort, formatDateLong } from './formatters'

describe('formatters.ts', () => {
  describe('formatCurrency', () => {
    it('formata número como moeda BRL', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
    })

    it('formata zero como moeda BRL', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })
  })

  describe('formatDateShort', () => {
    it('formata string de data válida', () => {
      expect(formatDateShort('2025-06-04T12:00:00')).toBe('04/06/2025')
    })

    it('formata objeto Date válido', () => {
      expect(formatDateShort(new Date(2025, 5, 4))).toBe('04/06/2025') // junho = mês 5
    })

    it('retorna "-" para datas inválidas ou nulas', () => {
      expect(formatDateShort(null)).toBe('-')
      expect(formatDateShort(undefined)).toBe('-')
      expect(formatDateShort('')).toBe('-')
      expect(formatDateShort('data inválida')).toBe('-')
    })
  })

  describe('formatDateLong', () => {
    it('formata string de data longa válida', () => {
      const data = formatDateLong('2024-06-10T12:00:00')
      expect(data).toMatch(/10 de junho de 2024/)
    })

    it('formata objeto Date longo válido', () => {
      const data = formatDateLong(new Date(2024, 5, 10))
      expect(data).toMatch(/10 de junho de 2024/)
    })

    it('retorna "-" para datas longas inválidas ou nulas', () => {
      expect(formatDateLong(null)).toBe('-')
      expect(formatDateLong(undefined)).toBe('-')
      expect(formatDateLong('')).toBe('-')
      expect(formatDateLong('data inválida')).toBe('-')
    })
  })
})
