import { QueryClient } from '@tanstack/react-query'

const STALE_TIMES = {
  publicPages: 5 * 60 * 1000,
  cmsContent: 3 * 60 * 1000,
  dashboardData: 60 * 1000,
  designSettings: 5 * 60 * 1000,
  mediaLibrary: 2 * 60 * 1000,
  websiteBuilder: 30 * 1000,
  userProfile: 5 * 60 * 1000,
  navigation: 10 * 60 * 1000,
  students: 2 * 60 * 1000,
  news: 3 * 60 * 1000,
  gallery: 3 * 60 * 1000,
  activities: 60 * 1000,
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.cmsContent,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

export const queryClient = createQueryClient()

export { STALE_TIMES }
