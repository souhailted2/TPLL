import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { authHeaders } from "@/hooks/use-auth";

type UpdateUserRoleRequest = z.infer<typeof api.userRoles.update.input>;

export function useUserRole() {
  return useQuery({
    queryKey: [api.userRoles.get.path],
    queryFn: async () => {
      const res = await fetch(api.userRoles.get.path, { headers: { ...authHeaders() } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("فشل تحميل الصلاحيات");
      return api.userRoles.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserRoleRequest) => {
      const res = await fetch(api.userRoles.update.path, {
        method: api.userRoles.update.method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل تحديث بيانات المستخدم");
      return api.userRoles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userRoles.get.path] });
    },
  });
}
