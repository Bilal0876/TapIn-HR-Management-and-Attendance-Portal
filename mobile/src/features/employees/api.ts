import { apiClient } from '@/lib/axios';

export const employeeApi = {
  list: async () => {
    const res = await apiClient.get('/employees');
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/employees', data);
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  },
  deactivate: async (id: string) => {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  }
};
