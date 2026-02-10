import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("فشل تحميل الطلبات");
      return res.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { items: { productId: number; quantity: number; unit: string }[] }) => {
      const res = await fetch(api.orders.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل إنشاء الطلب");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل تحديث حالة الطلب" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useDismissOrderAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/orders/${orderId}/dismiss-alert`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل إبطال الإنذار");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateCompletedQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, completedQuantity }: { itemId: number; completedQuantity: number }) => {
      const res = await fetch(`/api/order-items/${itemId}/completed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedQuantity }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل تحديث الكمية المستلمة" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, itemStatus }: { itemId: number; itemStatus: string }) => {
      const res = await fetch(`/api/order-items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemStatus }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل تحديث حالة الصنف" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}
