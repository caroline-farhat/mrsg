# Newsletter setup (Brevo, double opt-in)

The footer form posts to `POST /api/newsletter/subscribe`. The server validates the request and asks Brevo to send a
double opt-in confirmation email. The contact joins your list only after the visitor clicks the link in that email.
Until the four variables below are set, the form answers "Something went wrong" (HTTP 503). It never pretends to succeed.

## 1. Account, list and API key
1. Create or sign in to the MRS.G account at https://app.brevo.com.
2. **Contacts > Lists > Add a list** (e.g. "MRS.G Newsletter"). Open it and copy the numeric **list ID** (shown in the list URL / list details). This is `BREVO_LIST_ID`.
3. **Profile menu > SMTP & API > API Keys > Generate a new API key**. Copy it once. This is `BREVO_API_KEY`. If you enabled "Authorized IPs" in Brevo security, add your server's outbound IP (or disable the restriction), otherwise Brevo answers 401.

## 2. Sender and domain authentication
1. **Senders, Domains & Dedicated IPs > Domains > Add a domain** (the domain you send from, e.g. maisonjinda.com).
2. Add the DNS records Brevo shows (Brevo code TXT, DKIM, DMARC). Wait until the domain shows as authenticated.
3. **Senders > Add a sender** using an address on that domain and verify it.

## 3. Double opt-in template and redirect
1. **Campaigns > Templates > Create a template** (type: transactional). Sender = the verified sender. Subject, e.g. "Confirm your MRS.G subscription".
2. The template must contain the confirmation link placeholder **`{{ params.DOIurl }}`** (as the button/link target).
3. Save and activate it, then copy its numeric **template ID**. This is `BREVO_DOI_TEMPLATE_ID`.
4. Choose the page visitors land on after confirming (for example your site home page or a thank-you page). Full `https://` URL. This is `BREVO_DOI_REDIRECT_URL`.
5. Add an unsubscribe link in your marketing campaigns (Brevo adds it automatically to campaigns).

## 4. Environment variables
Local: copy `.env.example` to `.env.local`, fill in the four values, run `npm run dev`.
Production: add the same four variables in your host (Vercel: Project > Settings > Environment Variables; other hosts: their env/secrets settings) and redeploy.
They are server-only. Never prefix them with `NEXT_PUBLIC_`, never commit `.env.local`.

## 5. Test
1. Submit your own address in the footer with the consent box ticked. Expected message: "Please check your inbox to confirm your subscription."
2. Open the confirmation email, click the link. You land on `BREVO_DOI_REDIRECT_URL`.
3. In Brevo, **Contacts > Lists > (your list)**: the address appears after confirming (before that it is not in the list).
4. Submit the same address again. You get the neutral "may already be on our list" message.
5. Check the browser network tab: requests go only to `/api/newsletter/subscribe`; the API key never appears in any response or page source.

## Behaviour and limits
- Consent checkbox is required and unchecked by default; the server rejects requests without `consent: true`.
- Validation: email normalised (trim, lowercase, NFKC), max 254 chars, body max 2 KB, JSON only, same-origin only, hidden honeypot field.
- Rate limiting is in memory per server instance (6 requests / 10 min per IP, 3 / hour per email). On serverless or several instances it is only best-effort; add a shared store (e.g. Upstash Redis) or a WAF/edge rule for strict limits.
- Duplicate contacts: Brevo refuses duplicates in double opt-in; the form then shows a neutral message that does not confirm whether the address is subscribed.
- Privacy policy link: set `PRIVACY_POLICY_HREF` in `constants/site.ts` once a policy page exists. No legal text is invented.
- Not verified in this delivery: live calls to Brevo (no credentials were available). The route was tested only against a mocked Brevo response.
