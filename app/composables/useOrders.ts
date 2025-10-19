// Orders API client for user and admin endpoints
import { useApi } from "~/composables/useApi";
import type { OrderOut } from "~/composables/useCheckout";

export type OrderStatus =
  | "Pending Payment"
  | "Paid"
  | "Shipped"
  | "Completed"
  | "Cancelled"
  | "Failed"; // may exist from payment failures

export interface ListParams {
  status?: OrderStatus;
  skip?: number;
  limit?: number;
}

export interface AdminListParams extends ListParams {
  user_id?: number;
}

export interface OrderStatusOut {
  order_id: number;
  status: OrderStatus;
  updated_at: string;
}

export function useOrdersApi() {
  const { request } = useApi();

  function listMyOrders(params: ListParams = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.skip != null) q.set("skip", String(params.skip));
    if (params.limit != null) q.set("limit", String(params.limit));
    const qs = q.toString();
    const url = "/api/orders" + (qs ? `?${qs}` : "");
    return request<OrderOut[]>(url, { method: "GET" });
  }

  function getOrder(order_id: number) {
    return request<OrderOut>(`/api/orders/${order_id}`, { method: "GET" });
  }

  function getOrderStatus(order_id: number) {
    return request<OrderStatusOut>(`/api/orders/${order_id}/status`, {
      method: "GET",
    });
  }

  function getInvoice(order_id: number) {
    return request<any>(`/api/orders/${order_id}/invoice`, { method: "GET" });
  }

  // Admin endpoints
  function adminListOrders(params: AdminListParams = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    console.log(params.user_id);
    if (params.user_id) q.set("user_id", String(params.user_id));
    if (params.skip != null) q.set("skip", String(params.skip));
    if (params.limit != null) q.set("limit", String(params.limit));
    const qs = q.toString();
    const url = "/api/orders/admin/orders" + (qs ? `?${qs}` : "");
    return request<OrderOut[]>(url, { method: "GET" });
  }

  function adminUpdateOrderStatus(
    order_id: number,
    status: Exclude<OrderStatus, "Failed">
  ) {
    return request<OrderStatusOut>(
      `/api/orders/admin/orders/${order_id}/status`,
      {
        method: "PATCH",
        body: { status },
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return {
    listMyOrders,
    getOrder,
    getOrderStatus,
    getInvoice,
    adminListOrders,
    adminUpdateOrderStatus,
  };
}
