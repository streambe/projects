import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { User } from '../users.types';

export const userQueryKeys = {
  all: ['users'] as const,
  list: () => ['users', 'list'] as const,
};

interface UsersListResponse {
  data: User[];
}

export function useUsersList() {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<UsersListResponse>('/auth/users');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // users list rarely changes — cache for 5 minutes
  });
}
