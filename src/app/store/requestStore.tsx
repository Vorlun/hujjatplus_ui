import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Request, RequestStatus } from '../types/request';
import { getDefaultStatus } from '../utils/helpers';

interface RequestContextValue {
  requests: Request[];
  addRequest: (input: Omit<Request, 'id' | 'status' | 'createdAt'> & { id?: string; status?: RequestStatus; createdAt?: string }) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
}

const RequestContext = createContext<RequestContextValue | undefined>(undefined);

const initialRequests: Request[] = [
  {
    id: 'REQ-2026-001',
    title: "10 mln so'm kontrakt to'lash",
    message: "Mijozdan kelgan so'rov: 10 mln so'mlik kontrakt to'lovi bo'yicha hujjatlarni tayyorlash kerak.",
    department: 'moliya',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'REQ-2026-002',
    title: 'Xodimni ishga qabul qilish hujjatlari',
    message: "Yangi xodimni ishga qabul qilish uchun kadrlar bo'limiga hujjatlar yuborish.",
    department: 'kadr',
    priority: 'medium',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
];

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  const addRequest: RequestContextValue['addRequest'] = (input) => {
    const now = new Date();
    const createdAt = input.createdAt ?? now.toISOString();
    const status = input.status ?? getDefaultStatus();
    const id = input.id ?? `REQ-${now.getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`;

    const request: Request = {
      id,
      title: input.title,
      message: input.message,
      department: input.department,
      priority: input.priority,
      status,
      createdAt,
    };

    setRequests((prev) => [request, ...prev]);
  };

  const updateRequestStatus: RequestContextValue['updateRequestStatus'] = (id, status) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status,
            }
          : req,
      ),
    );
  };

  const value = useMemo(
    () => ({
      requests,
      addRequest,
      updateRequestStatus,
    }),
    [requests],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequests(): RequestContextValue {
  const ctx = useContext(RequestContext);
  if (!ctx) {
    throw new Error('useRequests hook must be used inside <RequestProvider>');
  }
  return ctx;
}

