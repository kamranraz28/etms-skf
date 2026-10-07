import { usePage } from "@inertiajs/react";
import { PageSharedProps } from "@/lib/types";

/** Permission slugs granted to the signed-in user (shared by the backend). */
export function usePermissions(): string[] {
  const { props } = usePage<PageSharedProps>();
  return props.auth.user?.permissions ?? [];
}

/** Check a permission slug against an explicit list (e.g. in tests or callbacks). */
export function can(permissions: string[] | undefined, slug: string): boolean {
  return permissions?.includes(slug) ?? false;
}
