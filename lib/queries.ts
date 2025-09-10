import {
  keepPreviousData,
  useInfiniteQuery,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';


export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard');
      return response.data;
    },
  });
}

export function useProcesses(filters: { search?: string; category?: string } = {}) {
  const {
    search = '',
    category = '',
  } = filters;
  return useQuery({
    queryKey: ['processes', { search, category }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const response = await axiosInstance.get(`/processes?${params.toString()}`);
      return response.data;
    },
  });
}

export function useProcessSingle(process_id: number) {
  console.log('Fetching process with ID:', process_id);
  return useQuery({
    queryKey: ['process', { process_id }],
    queryFn: async () => {
      const pid = Number(await process_id);
      const response = await axiosInstance.get(`/processes/${pid}`);
      return response.data;
    },
    enabled: !!process_id && !isNaN(process_id)
  });
}

export function useProposals(filters: { search?: string; category?: string } = {}) {
  const {
    search = '',
    category = '',
  } = filters;
  return useQuery({
    queryKey: ['processes', { search, category }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const response = await axiosInstance.get(`/proposals?${params.toString()}`);
      return response.data;
    },
  });
}
