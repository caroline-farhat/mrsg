# Refactoring notes

## Preservation decisions

- `app/site.css` was intentionally left unchanged. Its order controls the approved cascade, responsive design, themes, typography, and Arabic RTL behavior.
- `public/3d` was treated as read-only and remains byte-identical to the supplied project.
- Stateful section components were moved by responsibility but not split simply to reduce file size. Their state, refs, observers, animation timing, keyboard handlers, and render order remain local and easier to audit.
- Translation strings and keys were not edited. Only import paths and shared language typing changed.
- Dashboard formulas and constants remain in the original simulation module with no calculation changes.
- The newsletter route retains its response statuses, validation, limits, timeout, Brevo request, and error handling. Only the behavior-identical in-memory limiter was moved into a server utility.

## Deferred recommendations

These ideas were deliberately not implemented because they can change observable behavior or require broader product decisions:

- Splitting `app/site.css` into component stylesheets. Import order and selector specificity would require full pixel-level regression coverage.
- Replacing the server-rendered navigation string with JSX. That would change hydration and the timing of the existing behavior attachment.
- Adding a distributed newsletter rate-limit store. This requires infrastructure and deployment configuration.
- Upgrading Next.js, React, TypeScript, Tailwind, or other dependencies. Dependency versions and the lockfile were preserved.
- Adding live analytics data or changing dashboard simulation values. The dashboard remains explicitly illustrative.
- Modifying or bundling the Three.js showroom dependencies. The original iframe integration remains isolated.

## Verification limitations

The project contains no automated browser or unit-test suite. TypeScript and production-build checks validate compilation and server/client boundaries, but interactive and pixel-level regression coverage should be added before future design or behavior changes.
