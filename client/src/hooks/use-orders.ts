import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authHeaders } from "@/hooks/use-auth";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { headers: { ...authHeaders() } });
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ completedQuantity }),
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

export function useShipItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, shippedQuantity }: { itemId: number; shippedQuantity: number }) => {
      const res = await fetch(`/api/order-items/${itemId}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ shippedQuantity }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل شحن الصنف" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useConfirmItemReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, receivedQuantity }: { itemId: number; receivedQuantity: number }) => {
      const res = await fetch(`/api/order-items/${itemId}/receive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ receivedQuantity }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل تأكيد الاستلام" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useAdminCorrectItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, corrections }: { itemId: number; corrections: { completedQuantity?: number; shippedQuantity?: number; itemStatus?: string } }) => {
      const res = await fetch(`/api/order-items/${itemId}/admin-correct`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(corrections),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل تصحيح الصنف" }));
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ itemStatus }),
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
