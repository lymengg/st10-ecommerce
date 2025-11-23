// Checkout & Payment API client for frontend integration
import { useApi } from "~/composables/useApi";

export interface ProductList {
  id: number;
  name: string;
  brand: string;
  price: number;
  image?: string;
  description?: string;
}

export interface CartItemOut {
  product: ProductList;
  quantity: number;
  line_total: number;
}

export interface CartOut {
  items: CartItemOut[];
  total_items: number;
  subtotal: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface OrderCreate {
  shipping: ShippingAddress;
  items?: { product_id: number; quantity: number }[];
}

export interface OrderOut {
  id: number;
  items: { product: ProductList; quantity: number; line_total: number }[];
  total_items: number;
  subtotal: number;
  status: string;
  created_at: string;
}

export interface PaymentSessionOut {
  url: string;
  session_id: string;
}

export interface OrderStatusOut {
  order_id: number;
  status: string; // "Pending Payment" | "Paid" | "Failed"
  updated_at: string;
}

export function useCheckoutApi() {
  const { request } = useApi();

  function getCart() {
    return request<CartOut>("/api/cart", { method: "GET" });
  }

  // Add product listing function for paginated products
  function getProducts(params?: { q?: string; brand?: string; skip?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.q) q.set("q", params.q);
    if (params?.brand) q.set("brand", params.brand);
    if (params?.skip != null) q.set("skip", String(params.skip));
    if (params?.limit != null) q.set("limit", String(params.limit));
    const qs = q.toString();
    const url = "/api/products" + (qs ? `?${qs}` : "");
    return request<{ items: ProductList[], total: number, page: number, size: number, pages: number }>(url, { method: "GET" });
  }

  function createOrder(payload: OrderCreate) {
    return request<OrderOut>("/api/orders", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });
  }

  function createPaymentSession(order_id: number, success_url: string, cancel_url: string) {
    return request<PaymentSessionOut>("/api/payments/create-session", {
      method: "POST",
      body: { order_id, success_url, cancel_url },
      headers: { "Content-Type": "application/json" },
    });
  }

  function getOrder(order_id: number) {
    return request<OrderOut>(`/api/orders/${order_id}`, { method: "GET" });
  }

  function getOrderStatus(order_id: number) {
    return request<OrderStatusOut>(`/api/orders/${order_id}/status`, { method: "GET" });
  }

  function getInvoice(order_id: number) {
    return request<any>(`/api/orders/${order_id}/invoice`, { method: "GET" });
  }

  return {
    getCart,
    getProducts,
    createOrder,
    createPaymentSession,
    getOrder,
    getOrderStatus,
    getInvoice,
  };
}