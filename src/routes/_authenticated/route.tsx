import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/vault/app-shell";
import { VaultProvider } from "@/lib/vault-context";
import { VaultLoadingSkeleton } from "@/components/vault/loading-skeleton";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingMs: 0,
  pendingComponent: VaultLoadingSkeleton,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(queryOptions({
      queryKey: ["authenticated-user"],
      queryFn: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw redirect({ to: "/auth" });
        return data.user;
      },
      staleTime: 5 * 60_000,
      retry: false,
    }));
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  return (
    <VaultProvider user={user}>
      <AppShell>
        <Outlet />
      </AppShell>
    </VaultProvider>
  );
}
