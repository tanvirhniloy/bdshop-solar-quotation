# BDSHOP Solar & IPS Quotation Maker

Production-oriented quotation management for BDSHOP Limited's Solar & IPS sales team. The app uses Next.js, React, TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth and a reusable BDSHOP A4 letterhead template.

## What is included

- Email/password authentication with Supabase Auth.
- ADMIN / STAFF roles.
- PostgreSQL persistence with Row Level Security.
- Atomic, server-side quotation numbering: `BDSHOP-SOLAR-YYYY-0001`.
- Customer information and unlimited quotation items.
- Categories: Inverter, Battery, Solar Panel, PV, Cable, ATS, SPD, MCCB, Structure, MC4, MTS and Others.
- Server-side recalculation of subtotal, discount, tax and grand total.
- Bangladesh Taka amount-in-words conversion.
- Draft / Generated / Sent / Approved / Rejected / Cancelled status.
- Editable quotation-specific Terms & Conditions snapshots.
- Live A4 preview using the supplied official letterhead asset.
- PDF export with `@react-pdf/renderer`.
- PNG export per preview page with `html-to-image`.
- Browser printing with A4 print CSS.
- Quotation history, database-backed search, filters and pagination.
- Edit, duplicate and admin-only delete.
- Admin settings for company information, prefix, currency and default terms.
- Admin team role management.
- CSV export for administrators.
- Activity/audit records for create/edit/duplicate/download/status changes.

## Important hosting note

The code is deployable on Vercel + Supabase, but Vercel's current Hobby terms say the Hobby plan is for personal, non-commercial use. BDSHOP is a business use case, so use the Vercel Hobby tier for evaluation/internal testing only unless your organization's use is permitted under the current terms. For actual commercial production, use a paid Vercel plan or another host whose free/commercial terms permit your usage. Supabase currently has a Free plan with two free projects, 500 MB database size per project and 50,000 MAU, but free projects can pause after inactivity. Check the provider terms before launch.

## Requirements

- Node.js 20.9+ recommended for Next.js 16.
- npm 10+.
- A Supabase account/project.
- GitHub account for deployment.
- Vercel account for the preferred deployment path.

## Local installation

```bash
git clone <your-github-repository-url>
cd bdshop-solar-quotation
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```bash
npm run typecheck
npm run test
npm run build
npm start
```

## Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The application does not require the service-role key for normal runtime operations. It is intentionally included in the example only for future server-only administrative workflows. Never expose it to client code and never commit it.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/migrations/001_initial.sql`.
4. In Supabase **Authentication → Providers**, enable Email/Password.
5. Create the first user through Supabase Auth or the app's supported signup/admin workflow.
6. Promote the first administrator in SQL:

```sql
update public.profiles
set full_name = 'Your Name', role = 'ADMIN'
where email = 'your-admin-email@example.com';
```

7. Sign in through the app.
8. Create staff users in Supabase Auth. Their profile trigger creates a STAFF profile automatically.
9. Admins can change staff names/roles from **Settings → Team Accounts**.

### Email confirmation

For an internal deployment, configure Supabase Auth email settings according to your team's policy. If email confirmation is enabled, users must confirm their account before password login.

## Database architecture

Main tables:

- `profiles`
- `quotations`
- `quotation_items`
- `quotation_settings`
- `quotation_counters`
- `quotation_activity`

Quotation items are normalized rows rather than one large JSON document.

### Quotation number safety

`quotation_counters` stores a counter per calendar year. `next_quotation_number()` performs an atomic PostgreSQL upsert and is protected by a unique constraint on `quotations.quotation_number`. Concurrent users therefore cannot receive the same quotation number. A failed transaction may leave a skipped number, which is intentional and safer than reusing a reference.

## Letterhead

The supplied official BDSHOP letterhead is already included at:

`public/assets/bdshop-letterhead.png`

The supplied file is 1448 × 2048 px and has an A4-equivalent aspect ratio. The application uses it as a background instead of recreating the logo/header/footer.

To replace it later, overwrite the same filename with the new approved asset. Do not change the application's CSS unless the new asset's proportions or printable area are materially different.

The current printable content area is intentionally kept below the header and above the footer of the supplied asset. The PDF template uses the same asset as a fixed A4 background.

## Default terms

New quotations initially use:

1. Validity: Our offer will remain valid for 10 days
2. Payment: Full Payment Required Before Delivery
3. Warranty: Inverter 1 Years, Battery 5 Years (2 Years Parts + Service and 3 Years only Service), Solar Panel 12 Years, SPD and MTS 30 Days, Others 7 Days (Without Physical Damage and Burn)
4. Delivery: Within 30 days after receipt of confirmed order

Each quotation stores its own copy, so changing the admin default does not modify historical quotations.

## PDF / PNG / print

- **PDF:** generated client-side from a reusable A4 React PDF template. This avoids a browser/Chromium dependency on Vercel serverless functions.
- **PNG:** generated from each visible A4 preview page. Multi-page quotations produce one PNG per page.
- **Print:** browser print CSS targets only the quotation preview and requests A4 portrait paper with zero browser margins.

## Sample quotation

Use these values for the development test:

- Customer: ABC Enterprise
- SRNE 3.3kW Hybrid Inverter — 1 × ৳40,000
- GearUP 24V 100Ah LiFePO4 Battery — 2 × ৳35,000
- 550W Solar Panel — 6 × ৳12,000
- Cable — 50 meter × ৳150

Expected subtotal: ৳189,500.

If you additionally set discount ৳9,500 and tax ৳0, expected grand total: ৳180,000.

## GitHub

```bash
git init
git add .
git commit -m "Initial BDSHOP Solar quotation maker"
git branch -M main
git remote add origin https://github.com/<organization-or-user>/bdshop-solar-quotation.git
git push -u origin main
```

Never commit `.env.local` or service-role credentials.

## Vercel deployment

1. Push the repository to GitHub.
2. Create/import a Vercel project from the GitHub repository.
3. Add these Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` only if a future server-only feature needs it.
4. Deploy.
5. In Supabase Auth URL settings, add the Vercel production URL as an allowed Site URL/redirect URL as required by your Auth configuration.
6. Test login.
7. Test quotation creation and numbering with two authenticated users.
8. Test PDF, PNG and print.

A free Vercel URL will look like:

`https://bdshop-solar-quotation.vercel.app`

A custom domain is not assumed to be free; domain registration normally costs money.

## Free-tier architecture

**Evaluation / internal testing:**

GitHub Free → Vercel Hobby → Supabase Free.

Current provider limitations should be rechecked before commercial launch. Supabase's current Free plan lists 500 MB database size, 1 GB storage, 5 GB egress, 50,000 monthly active users and two free projects; it can pause inactive free projects. Vercel's Hobby plan is currently $0 but its terms restrict use to personal/non-commercial use, so it is not the correct contractual choice for a business production deployment unless Vercel permits your specific use.

## Deployment phases

### Phase 1 — Local development

- Install Node.js.
- Configure `.env.local`.
- Run migration.
- Promote first admin.
- Run `npm run dev`.

### Phase 2 — GitHub

- Create private repository if quotation/customer data or business code should remain restricted.
- Push source code.

### Phase 3 — Supabase

- Create production project.
- Apply migration.
- Configure Auth.
- Promote production admin.

### Phase 4 — Database migration

- Verify tables, indexes, functions and RLS policies.
- Test atomic numbering with concurrent requests.

### Phase 5 — Authentication

- Create admin.
- Create staff accounts.
- Test STAFF cannot access another staff member's quotation.
- Test ADMIN can access all quotations.

### Phase 6 — Vercel

- Import GitHub repository.
- Add environment variables.
- Deploy.
- Configure Auth URLs.

### Phase 7 — Production testing

Run the full checklist below.

### Phase 8 — Team onboarding

- Create staff accounts.
- Confirm role assignment.
- Replace the letterhead only through the approved asset path.
- Give staff the production URL.
- Keep admin access limited.

## Production checklist

- [ ] Authentication works
- [ ] Database works
- [ ] RLS works
- [ ] Quotation numbers are unique
- [ ] Multiple users can create quotations
- [ ] Customer data saves
- [ ] Items save
- [ ] Calculations are correct
- [ ] Amount in words works
- [ ] Terms work
- [ ] PDF works
- [ ] PNG works
- [ ] Printing works
- [ ] History works
- [ ] Search works
- [ ] Filtering works
- [ ] Editing works
- [ ] Duplication works
- [ ] Delete permissions work
- [ ] Mobile UI works
- [ ] Environment variables work
- [ ] No secret is committed
- [ ] Production deployment works

## Security notes

- Supabase anon keys are public by design; RLS is the protection boundary.
- Never ship `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Customer/quotation access is constrained by RLS and server-side auth checks.
- Admin-only settings and deletion are checked both in the API and database policy layer.
- All financial totals are recalculated on the server/database before persistence.
- Historical quotations contain their own terms snapshot.

## Troubleshooting

### `Unauthorized`

Check Supabase URL/key variables and that the user's session is valid.

### User can log in but has no profile

Run the migration again or insert the missing profile row. Normally the `on_auth_user_created` trigger creates it automatically.

### Settings page says admin required

Promote the user:

```sql
update public.profiles set role='ADMIN' where email='your-email@example.com';
```

### PDF fails in browser

Check that `/public/assets/bdshop-letterhead.png` exists and that the deployed site can load it at `/assets/bdshop-letterhead.png`. The PDF is generated client-side, so no Chromium server is required.

### PNG has missing letterhead

Ensure the letterhead is served from the same origin. Do not load it from an external domain without proper CORS headers.

## Verification status

The source tree has been checked for missing local imports and the supplied letterhead asset is present at the expected path. The execution environment used to assemble this package did not have network/package-cache access, so `npm install`, TypeScript compilation, Vitest execution and a real Next.js production build could not be executed here. Run `npm install`, `npm run typecheck`, `npm run test` and `npm run build` locally/CI before the first production deployment.

## Project structure

```text
app/
  api/
  dashboard/
  login/
  new/
  profile/
  quotations/
  settings/
components/
lib/
public/assets/
supabase/migrations/
tests/
types/
.env.example
.gitignore
next.config.ts
package.json
README.md
```

## License / internal use

This project is structured as an internal BDSHOP business application. Add your organization's preferred license and access policy before making the repository public.
