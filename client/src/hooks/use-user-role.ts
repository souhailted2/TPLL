import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UpdateUserRoleRequest } from "@shared/routes";

export function useUserRole() {
  return useQuery({
    queryKey: [api.userRoles.get.path],
    queryFn: async () => {
      const res = await fetch(api.userRoles.get.path, { credentials: "include" });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل تحديث بيانات المستخدم");
      return api.userRoles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userRoles.get.path] });
    },
  });
}
