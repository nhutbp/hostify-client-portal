import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { UpdateMediaSettingsInput } from '../../../../../server/modules/media/media.schemas'
import { mediaService } from '../services/mediaService'

export const mediaSettingsKey = ['admin', 'media', 'settings'] as const
export const mediaListKey = ['admin', 'media', 'list'] as const

export function useMediaList(
  input: { uploadedById?: string; search?: string } = {},
) {
  return useInfiniteQuery({
    queryKey: [...mediaListKey, input],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      mediaService.list({
        page: pageParam,
        limit: 10,
        search: input.search ?? '',
        ...input,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  })
}

export function useCreateMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaListKey }),
  })
}

export function useCreateMediaFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.createFolder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaListKey }),
  })
}

export function useUpdateMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaListKey }),
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mediaService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaListKey }),
  })
}

export function useMediaSettings() {
  return useQuery({
    queryKey: mediaSettingsKey,
    queryFn: mediaService.getSettings,
  })
}

export function useUpdateMediaSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateMediaSettingsInput) =>
      mediaService.updateSettings(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaSettingsKey }),
  })
}
