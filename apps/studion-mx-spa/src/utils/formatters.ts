export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// Formato: 04/06/2025
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR')
}

// Formato: 10 de junho de 2024
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}