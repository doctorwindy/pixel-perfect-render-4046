# Redesign InfoVault entry pages

## Direction
Use the selected **Liquid Glass dimensional hero** direction while keeping InfoVault’s existing iOS design language: SF Pro, the current logo, semantic light/dark colors, #007AFF accent, glass surfaces, inputs, and button behavior.

## Landing page
- Replace the sparse centered opening with a spacious two-column first view: a direct headline and sign-up actions beside a realistic InfoVault preview made from representative saved fields and copy controls.
- Extend the page with asymmetric sections for organization, one-click copying, search, privacy, and the types of information users can keep.
- Add a concise three-step explanation, privacy reassurance, final sign-up action, and a minimal footer.
- Keep claims factual and avoid invented user counts, encryption promises, or unsupported metrics.
- Use restrained depth, reveal motion, and hover feedback; preserve reduced-motion and reduced-transparency behavior.

## Login and signup
- Turn the isolated form into a balanced split composition that visually continues the landing page.
- Keep the existing email, password, Google sign-in, email-confirmation, error, loading, and dashboard-transition behavior unchanged.
- Add a clear segmented sign-in/create-account choice, stronger hierarchy, and compact privacy reassurance without adding unsupported account features.
- Keep the form immediately visible and comfortable on phone, tablet, and desktop.

## Technical details
- Update only `src/routes/index.tsx`, `src/routes/auth.tsx`, and shared semantic styles needed for these two pages.
- Reuse the existing `BrandLogo`, `Button`, `Input`, `Label`, and Liquid Glass tokens; do not alter authenticated dashboard screens.
- Keep route-specific metadata unique and current.
- Verify the landing, sign-in, sign-up, confirmation, light/dark, desktop, and mobile presentations, then confirm the latest preview build is clean.
