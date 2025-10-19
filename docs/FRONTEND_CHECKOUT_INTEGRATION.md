# Frontend Checkout & Payments Integration

This document summarizes the frontend changes and how to integrate with the Checkout, Orders, and Stripe payment APIs.

- Auth: All API calls use the access token from localStorage (`access_token`) via the centralized `useApi` composable.
- Currency: USD; Stripe amounts are handled server-side (cents).
- Order statuses: "Pending Payment", "Paid", "Failed".

## Files added/updated

- Updated: `app/pages/checkout.vue` — Uses backend cart, creates order, starts Stripe Checkout.
- Added: `app/composables/useCheckout.ts` — Typed API client for cart, orders, payments, invoice.
- Added: `app/pages/checkout/success.vue` — Polls order status after Stripe redirect.
- Added: `app/pages/checkout/cancel.vue` — Shown when payment is canceled.
- Added: `app/pages/invoice.vue` — Fetches and displays the invoice for a paid order.

## Runtime config

- Public base URL: `runtimeConfig.public.apiBase` in `nuxt.config.ts` (defaults to `http://localhost:8000`).
  - Override via env: `NUXT_PUBLIC_API_BASE`.

## API client (useCheckout.ts)

Exports a typed client following the backend contract:

- `getCart(): Promise<CartOut>` — GET `/api/cart`
- `createOrder(payload: OrderCreate): Promise<OrderOut>` — POST `/api/orders`
- `createPaymentSession(order_id, success_url, cancel_url): Promise<PaymentSessionOut>` — POST `/api/payments/create-session`
- `getOrder(order_id): Promise<OrderOut>` — GET `/api/orders/{id}`
- `getOrderStatus(order_id): Promise<OrderStatusOut>` — GET `/api/orders/{id}/status`
- `getInvoice(order_id): Promise<any>` — GET `/api/orders/{id}/invoice`

Key types used (aligned with backend):

- `ShippingAddress`: `{ full_name, phone, address1, address2?, city, state?, postal_code, country }`
- `OrderCreate`: `{ shipping: ShippingAddress, items? }` (omit items to use cart)
- `CartOut`, `OrderOut`, `PaymentSessionOut`, `OrderStatusOut` as per backend doc.

## Checkout page flow (app/pages/checkout.vue)

1. Load cart: calls `getCart()` and renders summary.
2. Collect shipping: full name, phone, address1/2, city, state, postal_code, country.
3. On submit:
   - `createOrder({ shipping })`
   - `createPaymentSession(order.id, successUrl, cancelUrl)`
   - Redirect to `session.url`

Success/cancel URLs used:
- Success: `window.location.origin + '/checkout/success?order_id={id}'`
- Cancel: `window.location.origin + '/checkout/cancel?order_id={id}'`

Error handling: shows a red inline message when cart load or checkout fails.

## Success page (app/pages/checkout/success.vue)

- Reads `order_id` from query.
- Polls `GET /api/orders/{id}/status` every 2s until `Paid` or `Failed`.
- On `Paid`, shows link to invoice page `'/invoice?order_id={id}'`.

## Cancel page (app/pages/checkout/cancel.vue)

- Informs user the payment was canceled and links back to checkout.

## Invoice page (app/pages/invoice.vue)

- Reads `order_id` from query and fetches `GET /api/orders/{id}/invoice`.
- Displays billing details, items, total items, and subtotal.

## Headers and auth

All requests automatically include `Authorization: Bearer <ACCESS_TOKEN>` when available via `useApi`.

## Example usage in a component

```ts path=null start=null
import { useCheckoutApi } from '~/app/composables/useCheckout'

const { getCart, createOrder, createPaymentSession } = useCheckoutApi()

const cart = await getCart()
const order = await createOrder({ shipping })
const { url } = await createPaymentSession(order.id, successUrl, cancelUrl)
window.location.href = url
```

## Notes

- The frontend does not call the Stripe webhook; the server updates order status via webhook events.
- If auth expires during a request, `useApi` attempts a refresh and retries once.
