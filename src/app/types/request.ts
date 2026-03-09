export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'rejected';

export type RequestPriority = 'low' | 'medium' | 'high';

export type RequestDepartment =
  | 'moliya'
  | 'kadr'
  | 'huquq'
  | 'it'
  | 'umumiy';

export interface Request {
  id: string;
  title: string;
  message: string;
  department: RequestDepartment;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
}

