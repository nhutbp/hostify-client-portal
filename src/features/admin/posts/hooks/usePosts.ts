import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postService } from '../services/postService'

export const postQueryKeys = {
  lists: () => ['admin', 'posts', 'list'] as const,
  detail: (id: string) => ['admin', 'posts', 'detail', id] as const,
  categories: () => ['admin', 'posts', 'categories'] as const,
  platforms: () => ['admin', 'posts', 'platforms'] as const,
}
export function usePosts(
  input: Parameters<typeof postService.list>[0] = {
    page: 1,
    limit: 10,
    search: '',
  },
) {
  return useQuery({
    queryKey: [...postQueryKeys.lists(), input] as const,
    queryFn: () => postService.list(input),
    placeholderData: (previous) => previous,
  })
}
export function usePostDetail(id?: string) {
  return useQuery({
    queryKey: postQueryKeys.detail(id ?? ''),
    queryFn: () => postService.detail(id ?? ''),
    enabled: Boolean(id),
  })
}
export function usePostCategories(
  input: Parameters<typeof postService.categories>[0] = { search: '' },
) {
  return useQuery({
    queryKey: [...postQueryKeys.categories(), input] as const,
    queryFn: () => postService.categories(input),
    placeholderData: (previous) => previous,
  })
}
export function usePostPlatforms() {
  return useQuery({
    queryKey: postQueryKeys.platforms(),
    queryFn: () => postService.platforms(),
  })
}
export function useCreatePostPlatform() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.createPlatform,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.platforms() }),
  })
}
export function useUpdatePostPlatform() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.updatePlatform,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.platforms() }),
  })
}
export function useDeletePostPlatform() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.deletePlatform,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.platforms() }),
  })
}
export function useCreatePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.createCategory,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
  })
}
export function useUpdatePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.updateCategory,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
  })
}
export function useDeletePostCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: postService.deleteCategory,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: postQueryKeys.categories() }),
  })
}
