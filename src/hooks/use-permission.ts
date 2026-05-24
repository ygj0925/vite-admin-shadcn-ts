import { useUserStore } from '@/stores/user'

export function usePermission() {
  const permissions = useUserStore((s) => s.permissions)

  const has = (perm: string): boolean => {
    if (permissions.includes('*')) return true
    return permissions.includes(perm)
  }

  const hasAny = (perms: string[]): boolean => perms.some(has)
  const hasAll = (perms: string[]): boolean => perms.every(has)

  return { has, hasAny, hasAll }
}
