import type { CompanyProspect, CompanyProspectInput } from '@/types/company'

/**
 * Almacén simulado del banco de Empresas / Prospección Estudiantil (Manual
 * de Mejoras Transversales, Mejora 2). Estado en memoria durante la sesión,
 * mismo criterio que el resto de los mocks del proyecto.
 */

let sequence = 100
function nextId(): string {
  sequence += 1
  return `company-${sequence}`
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

/** Banco sembrado para que el módulo no arranque vacío: Andrea ya confirmó y adjuntó carta; Axel apenas tiene una candidata. */
let COMPANIES: CompanyProspect[] = [
  {
    id: nextId(),
    studentId: 'usr-alumno-001',
    studentName: 'Andrea Guadalupe Mendez Guzman',
    subjectId: 'sub-001',
    name: 'Restaurante La Sazón de Mamá',
    sector: 'Restaurantero',
    contactName: 'Mamá Rosa',
    contactPhone: '55 1234 5678',
    notes: 'Permite observar el servicio de domingo, que es cuando más se satura la cocina.',
    status: 'confirmada',
    letter: { id: nextId(), name: 'carta-autorizacion-sazon-de-mama.pdf', uploadedAt: daysAgo(12) },
    createdAt: daysAgo(20),
    confirmedAt: daysAgo(14),
  },
  {
    id: nextId(),
    studentId: 'usr-alumno-001',
    studentName: 'Andrea Guadalupe Mendez Guzman',
    subjectId: 'sub-001',
    name: 'Panadería El Buen Pan',
    sector: 'Alimentos',
    contactName: 'Don Alberto',
    status: 'candidata',
    createdAt: daysAgo(3),
  },
  {
    id: nextId(),
    studentId: 'std-002',
    studentName: 'Axel Martínez Betanzos',
    subjectId: 'sub-001',
    name: 'CEMEX — sucursal Atizapán',
    sector: 'Construcción',
    contactName: 'Ing. Ramírez',
    status: 'candidata',
    createdAt: daysAgo(2),
  },
]

export function listCompaniesForStudent(subjectId: string, studentId: string): CompanyProspect[] {
  return COMPANIES.filter((item) => item.subjectId === subjectId && item.studentId === studentId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getConfirmedCompany(subjectId: string, studentId: string): CompanyProspect | null {
  return COMPANIES.find((item) => item.subjectId === subjectId && item.studentId === studentId && item.status === 'confirmada') ?? null
}

export function findCompany(companyId: string): CompanyProspect | null {
  return COMPANIES.find((item) => item.id === companyId) ?? null
}

export function insertCompany(
  subjectId: string,
  studentId: string,
  studentName: string,
  input: CompanyProspectInput,
): CompanyProspect {
  const company: CompanyProspect = {
    id: nextId(),
    studentId,
    studentName,
    subjectId,
    name: input.name,
    sector: input.sector,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    notes: input.notes,
    status: 'candidata',
    createdAt: new Date().toISOString(),
  }
  COMPANIES = [company, ...COMPANIES]
  return company
}

/** Confirma una empresa candidata como la empresa de trabajo (Semana 3). Solo puede haber una confirmada a la vez por alumno/materia. */
export function confirmCompany(companyId: string): CompanyProspect | null {
  const company = COMPANIES.find((item) => item.id === companyId)
  if (!company) return null

  COMPANIES.forEach((item) => {
    if (item.studentId === company.studentId && item.subjectId === company.subjectId && item.status === 'confirmada') {
      item.status = 'candidata'
      item.confirmedAt = undefined
    }
  })

  company.status = 'confirmada'
  company.confirmedAt = new Date().toISOString()
  return company
}

export function rejectCompany(companyId: string): CompanyProspect | null {
  const company = COMPANIES.find((item) => item.id === companyId)
  if (!company) return null
  company.status = 'rechazada'
  return company
}

export function attachCompanyLetter(companyId: string, fileName: string): CompanyProspect | null {
  const company = COMPANIES.find((item) => item.id === companyId)
  if (!company) return null
  company.letter = { id: nextId(), name: fileName, uploadedAt: new Date().toISOString() }
  return company
}

export function deleteCompany(companyId: string): boolean {
  const next = COMPANIES.filter((item) => item.id !== companyId)
  const removed = next.length !== COMPANIES.length
  COMPANIES = next
  return removed
}
