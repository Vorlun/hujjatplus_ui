import type {
  RequestDepartment,
  RequestPriority,
  RequestStatus,
} from '../types/request';

export function detectDepartmentFromText(message: string): RequestDepartment {
  const text = message.toLowerCase();

  if (text.includes('moliya') || text.includes("moliyaviy") || text.includes('hisobot') || text.includes("to'lov") || text.includes('tolov')) {
    return 'moliya';
  }

  if (text.includes('kadr') || text.includes('hr') || text.includes('xodim')) {
    return 'kadr';
  }

  if (text.includes('huquq') || text.includes('yuridik') || text.includes('shartnoma') || text.includes('kontrakt')) {
    return 'huquq';
  }

  if (text.includes('it') || text.includes('texnik') || text.includes('kompyuter') || text.includes('server')) {
    return 'it';
  }

  return 'umumiy';
}

export function detectPriorityFromText(message: string): RequestPriority {
  const text = message.toLowerCase();

  if (text.includes('zudlik') || text.includes('shoshilinch') || text.includes('urgent') || text.includes('bugun')) {
    return 'high';
  }

  if (text.includes('muhim') || text.includes('important')) {
    return 'medium';
  }

  return 'medium';
}

export function getDefaultStatus(): RequestStatus {
  return 'new';
}

export function createTitleFromMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return 'Yangi so‘rov';

  if (trimmed.length <= 60) return trimmed;

  return trimmed.slice(0, 57) + '...';
}

export function formatStatusToUzbek(status: RequestStatus): string {
  switch (status) {
    case 'new':
      return 'Yangi';
    case 'in_progress':
      return 'Jarayonda';
    case 'completed':
      return 'Yakunlangan';
    case 'rejected':
      return 'Rad etilgan';
    default:
      return status;
  }
}

export function formatDepartmentToUzbek(department: RequestDepartment): string {
  switch (department) {
    case 'moliya':
      return 'Moliya bo‘limi';
    case 'kadr':
      return 'Kadrlar bo‘limi';
    case 'huquq':
      return 'Huquq bo‘limi';
    case 'it':
      return 'IT bo‘limi';
    case 'umumiy':
    default:
      return 'Umumiy bo‘lim';
  }
}

export function formatPriorityToUzbek(priority: RequestPriority): string {
  switch (priority) {
    case 'high':
      return 'Yuqori';
    case 'medium':
      return 'O‘rta';
    case 'low':
      return 'Past';
    default:
      return priority;
  }
}

