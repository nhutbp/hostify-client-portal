import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { menuService } from '../services/menuService'

export const menuQueryKey = ['admin', 'appearance', 'menus'] as const

export function useMenus(input: Parameters<typeof menuService.list>[0] = {}) {
  return useQuery({
    queryKey: [...menuQueryKey, input],
    queryFn: () => menuService.list(input),
  })
}

function useMenuMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: menuQueryKey }),
  })
}

export const useCreateMenu = () => useMenuMutation(menuService.create)
export const useUpdateMenu = () => useMenuMutation(menuService.update)
export const useDeleteMenu = () => useMenuMutation(menuService.delete)
