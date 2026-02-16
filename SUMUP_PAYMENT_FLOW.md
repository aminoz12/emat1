# SumUp Payment Process – Step by Step

This document describes how the payment flow works with SumUp from the moment the user clicks "Procéder au paiement" until they land on the success page or dashboard.

---

## 1. User initiates payment

**Where:** Carte grise, Plaque, Dashboard, Checkout-signup, Order-form, Payment page, Commander-un-coc.

**What happens:** The app calls `createCheckoutAndRedirect(orderId, amount)` from `lib/services/orderService.ts`.

- `orderId`: UUID of the order (already created and stored in Supabase `orders`).
- `amount`: Total to charge (e.g. order price in EUR).

---

## 2. Frontend: request checkout URL

**File:** `lib/services/orderService.ts` → `createCheckoutAndRedirect()`

1. **POST** to Next.js API: `/api/payments/create-checkout`
   - Body: `{ orderId, amount, currency: 'eur' }`
   - Uses cookies/session (credentials: 'include').

2. Expects response: `{ checkoutUrl }` (and optionally `checkoutId`).

3. If the request fails (4xx/5xx or no `checkoutUrl`), an error is thrown and the flow stops.

---

## 3. Next.js API: auth + backend call

**File:** `app/api/payments/create-checkout/route.ts`

1. **Auth:** Supabase `getUser()`. If not authenticated → 401.

2. **Order check:** Load order by `orderId` from Supabase `orders`. If missing → 404.

3. **Backend call:**  
   **POST** `NEXT_PUBLIC_BACKEND_URL/payments/create-checkout`  
   - Headers: `Authorization: Bearer <Supabase access_token>`  
   - Body: `{ orderId, amount (number), currency }`

4. On success: reads `checkoutUrl` (and `checkoutId`) from backend response.

5. **Store checkout ID:** Updates `orders.payment_intent_id` with `checkoutId` in Supabase (best effort, does not fail the request if update fails).

6. Returns `{ checkoutUrl }` to the frontend.

---

## 4. Backend (NestJS): create SumUp checkout

**File:** `backend/src/payments/payments.controller.ts` → `createCheckout`  
**Service:** `backend/src/payments/payments.service.ts` → `createPaymentIntent`  
**SumUp:** `backend/src/payments/sumup.service.ts` → `createCheckout()`

1. **Auth:** `JwtAuthGuard` validates the Bearer token (Supabase JWT).

2. **Create checkout with SumUp API:**
   - `checkout_reference`: `orderId`
   - `amount`: decimal string (e.g. `amount.toFixed(2)`)
   - `currency`: e.g. `EUR`
   - `return_url`:  
     `FRONTEND_URL/payment/return?orderId=<orderId>`  
     (SumUp will redirect the user here after payment; it may append `checkout_id` and `status` in the query string.)
   - `hosted_checkout: { enabled: true }` so the link can be used without a SumUp account (guest/public payment).

3. **SumUp response:** Contains at least:
   - `id` (checkout ID)
   - `hosted_checkout_url` (or URL derived from `links`) → this is the payment page URL.

4. **Database:**
   - Row in `payments`: `order_id`, `amount`, `currency`, `sumup_checkout_id`, `status: 'pending'` (upsert on `order_id`).
   - No direct update of `orders` here; the Next.js API updates `orders.payment_intent_id` with the checkout ID.

5. **Return to Next.js:** `{ checkoutUrl, checkoutId }`.

---

## 5. Frontend: open SumUp in popup

**File:** `lib/services/orderService.ts` (same function, after receiving `checkoutUrl`)

1. **Popup:** `window.open(checkoutUrl, 'SumUpCheckout', ...)`  
   - Desktop: ~600×800, centered.  
   - Mobile: full screen (or same window if popup is blocked).

2. If popup is blocked: fallback to `window.location.href = checkoutUrl` (mobile) or `window.open(checkoutUrl, '_blank')` (desktop).

3. **Listeners:**
   - **postMessage:**  
     - `SUMPUP_PAYMENT_SUCCESS`: do not close popup; let it redirect to success page.  
     - `REDIRECT_TO_DASHBOARD`: redirect opener to `/dashboard` (or reload if already on dashboard).  
     - `SUMPUP_PAYMENT_FAILED`: close popup, alert, reload if on dashboard.  
     - `SUMPUP_POPUP_CLOSED`: reload if on dashboard.
   - **Interval (every 500 ms):** If `popup.closed` → remove listener and redirect opener to `/dashboard` (or reload if already on dashboard).

So: parent window stays on the page where payment was started (e.g. dashboard, carte-grise, etc.) and only redirects to dashboard when the popup sends `REDIRECT_TO_DASHBOARD` or when the popup is closed.

---

## 6. User pays on SumUp

- The popup (or tab) shows SumUp’s hosted checkout page (`checkoutUrl`).
- User enters card (or Apple Pay / Google Pay) and completes payment.
- SumUp redirects the **browser** to the `return_url` that was sent when creating the checkout:  
  `FRONTEND_URL/payment/return?orderId=<orderId>`  
  SumUp typically adds query parameters such as `checkout_id` and `status` (e.g. `SUCCESS`, `PAID`, `FAILED`, `CANCELLED`, `EXPIRED`).

**Note:** The backend also has a default `return_url` in `sumup.service` (`FRONTEND_URL/payment-callback`), but `payments.service` overrides it with `FRONTEND_URL/payment/return?orderId=...`, so the user is sent to **payment/return**, not payment-callback. The **payment-callback** page is only used if something else (e.g. an old link or a different integration) sends the user there; it simply forwards query params to **payment/return**.

---

## 7. Payment return page (in popup/tab)

**File:** `app/payment/return/page.tsx`

1. **Read URL:** `orderId`, `checkout_id` (or `id`), `status` from query.

2. **Auth:** Supabase `getSession()`. If no session → error (user must be logged in to verify).

3. **Decide success/failure:**
   - If `status === 'SUCCESS' || 'PAID'`:  
     If `checkout_id` is present, call backend **GET** `payments/verify-payment/:checkoutId` (with Bearer). If response `status === 'PAID'` → success. If no `checkout_id`, treat as success with a warning.
   - If `status === 'FAILED' | 'CANCELLED' | 'EXPIRED'`: failure; optionally call verify so backend can mark payment failed.
   - If status unclear but `checkout_id` present: call verify and use backend’s `status === 'PAID'` for success.

4. **Notify opener (if popup):**  
   - Success → `postMessage({ type: 'SUMPUP_PAYMENT_SUCCESS', orderId })`.  
   - Failure → `postMessage({ type: 'SUMPUP_PAYMENT_FAILED', orderId, error })`.

5. **Success path:**
   - Show “Paiement réussi” and a 5-second countdown.
   - After 5 seconds: redirect **same window** to `/payment-success?orderId=<orderId>` (so the popup/tab goes to the success page).

6. **Failure path:**
   - Show error and a 10-second countdown, then close popup or redirect to dashboard.

---

## 8. Backend: verify payment (when return page calls it)

**File:** `backend/src/payments/payments.controller.ts` → **GET** `payments/verify-payment/:checkoutId`  
**Service:** `sumup.service.ts` → `verifyPayment(checkoutId)`

1. **SumUp API:** `sumup.checkouts.get(checkoutId)` to get current status.

2. **Database:**
   - If `checkout.status === 'PAID'` → update `payments` (and any linked logic) to succeeded.
   - If `FAILED` / `EXPIRED` / `CANCELLED` → update to failed.

3. Return `{ status: checkout.status }` (e.g. `PAID`, `PENDING`, `FAILED`).

---

## 9. Payment success page (in popup/tab)

**File:** `app/payment-success/page.tsx`

1. **Query:** `orderId` from URL. Optional: load order from Supabase for reference/display.

2. **UI:**  
   - “Paiement réussi”, order received, “vous serez notifié sous peu”, contact (email, phone).  
   - 15-second countdown: “Redirection vers votre espace client dans X secondes…”.  
   - Button: “Fermer et accéder à mon espace”.  
   - If in popup: X button to close.

3. **When user clicks button or countdown reaches 0:**
   - If `window.opener` exists: `postMessage({ type: 'REDIRECT_TO_DASHBOARD' })` and `window.close()`.
   - Else: `router.push('/dashboard')`.

4. **Parent window:** On `REDIRECT_TO_DASHBOARD` or when it detects the popup closed, it redirects to `/dashboard` (or reloads if already on dashboard).

---

## 10. End state

- **Popup/tab:** Either closed or on `/dashboard` (if opened in same window after blocked popup).
- **Parent window:** On `/dashboard` (or reloaded if it was already on dashboard).
- **Database:** `payments` row has been updated (via verify) to succeeded/failed; `orders.payment_intent_id` holds the SumUp checkout ID.

---

## Summary diagram

```
[User] → Procéder au paiement
    → createCheckoutAndRedirect(orderId, amount)
    → POST /api/payments/create-checkout
        → Next.js: auth + GET order
        → POST backend /payments/create-checkout (Bearer)
            → Backend: SumUp create checkout (return_url = /payment/return?orderId=...)
            → DB: payments upsert (pending), return checkoutUrl + checkoutId
        → Next.js: update orders.payment_intent_id, return checkoutUrl
    → window.open(checkoutUrl) [popup]
    → User pays on SumUp
    → SumUp redirects to /payment/return?orderId=...&checkout_id=...&status=...
    → payment/return: verify GET backend /payments/verify-payment/:checkoutId
    → postMessage SUMPUP_PAYMENT_SUCCESS (or FAILED)
    → 5s → redirect same window to /payment-success?orderId=...
    → payment-success: message + contact + 15s countdown
    → User closes or 15s → postMessage REDIRECT_TO_DASHBOARD + close
    → Parent: redirect to /dashboard
```

---

## Important files

| Role | File |
|------|------|
| Start payment (frontend) | `lib/services/orderService.ts` – `createCheckoutAndRedirect` |
| Next.js API create checkout | `app/api/payments/create-checkout/route.ts` |
| **Next.js API verify payment** | `app/api/payments/verify-payment/[checkoutId]/route.ts` (calls SumUp API + updates Supabase) |
| Backend create checkout | `backend/src/payments/payments.controller.ts`, `payments.service.ts`, `sumup.service.ts` |
| SumUp redirect target | `app/payment/return/page.tsx` (primary); `app/payment-callback/page.tsx` (optional forward to return) |
| Backend verify (fallback) | `backend/src/payments/payments.controller.ts` (GET verify-payment), `sumup.service.ts` – `verifyPayment` |
| Success page | `app/payment-success/page.tsx` |

**Verify flow:** The payment return page calls **Next.js** `GET /api/payments/verify-payment/:checkoutId` first (same-origin, cookie auth). If that fails (e.g. `SUMUP_API_KEY` not set in Next.js), it falls back to the NestJS backend. To use Next.js for verify, set `SUMUP_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in your Next.js env (e.g. Vercel).

---

## Environment / config (Next.js only – no backend)

Payments run **only on Next.js API routes** (no NestJS backend required). Set in Vercel (or `.env.local`):

- **`SUMUP_API_KEY`** – SumUp API key (Bearer token for SumUp API).
- **`SUPABASE_SERVICE_ROLE_KEY`** – To create/update `payments` and for verify (server-side).
- **`NEXT_PUBLIC_APP_URL`** or **`FRONTEND_URL`** – Full app URL (e.g. `https://emat1.vercel.app`) for SumUp `return_url`. On Vercel, `VERCEL_URL` is used automatically if others are not set.
- **`SUMUP_MERCHANT_CODE`** – Optional; set if SumUp requires it for your account.

You do **not** need `NEXT_PUBLIC_BACKEND_URL` for payments anymore.

---

## Why do I sometimes get "no response from server"?

Common causes and what was done to improve it:

### 1. **Backend cold start (Render free tier)**

On Render’s free tier, the backend **spins down after ~15 minutes of inactivity**. The **first request** after that can take **30–60+ seconds** while the server starts. Before adding timeouts, the frontend and API could wait indefinitely and the user saw no response.

**What we did:**

- **Next.js API** (`app/api/payments/create-checkout/route.ts`): backend call uses an **AbortController** with a **28 s** timeout. If the backend doesn’t respond in time, the API returns a clear error instead of hanging.
- **Frontend** (`lib/services/orderService.ts`): fetch to `/api/payments/create-checkout` has a **35 s** timeout. If it times out, the user sees: *"Le serveur met trop de temps à répondre. Veuillez réessayer (le serveur peut être en cours de démarrage)."*

**What you can do:** Retry after a few seconds. For production, consider a paid Render plan (no spin-down) or a lightweight **keep-alive** (e.g. cron hitting the backend every 10–14 minutes) so it stays warm.

### 2. **Network / backend down**

- **ECONNREFUSED / fetch failed:** Backend not reachable (wrong URL, backend down, firewall). The API returns a message like *"Le service de paiement n'est pas disponible. Veuillez réessayer plus tard."*
- **ENOTFOUND:** DNS or host unreachable.

### 3. **Vercel serverless timeout**

If the Next.js API runs on Vercel (or similar), the route has a max execution time (e.g. 10 s on free, 60 s on Pro). The 28 s backend timeout is set so we usually respond before that limit; if the backend is very slow, the API may still hit the platform timeout and return a generic error.

### 4. **SumUp API slow or down**

The backend calls SumUp to create the checkout. If SumUp is slow or errors, the backend can take longer or return 5xx. The same timeouts apply: after 28 s the API will abort and return the timeout message; the user can retry.
