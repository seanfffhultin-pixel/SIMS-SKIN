# SHSB Student v0.2

This version is intentionally a thin, better UI over school/MIS data.

## Product rule

SIMS is the source of truth. This app does not invent school data or claim to modify SIMS.

The one personal layer is homework completion:
- A SIMS assignment is imported.
- The student can tick it completed in this app.
- That completion state is stored separately.
- SIMS can still say "overdue"; the app can show that the student has personally marked it completed.

## Current prototype

Run:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

The dashboard loads through `/api/student`. Demo data is explicitly labelled.
Homework ticks persist in this browser, keyed by student and assignment ID. They do not update SIMS.

## Production homework state

Replace the demo `/api/homework/[id]/complete` route with a database write:

`(authenticated_user_id, sims_assignment_id, completed, completed_at)`

Never key completion solely by the assignment title because titles can repeat.

## SIMS integration

Do not scrape the SIMS website and do not collect/store a student's SIMS password.

SIMS documentation says SIMS ID supports OAuth/OIDC SSO and controlled data exchange, but SIMS ID's lightweight provisioning API does not expose all SIMS data. Richer data can require the relevant SIMS Partner/Data Exchange APIs.

The production adapter belongs in `lib/sims-adapter.ts`.

## Safari skin (no account integration required)

Open `/sims-skin/` on the local app, or `public/sims-skin/index.html` directly.
Download `shsb-sims.css` and select it in Safari → Settings → Advanced → Style sheet → Other….
Keep the file in its selected location. Safari applies it when SIMS loads; the local server can then be closed.
Select None Selected in the same setting to undo it.

The stylesheet uses the public SIMS Student dashboard and homework selectors, scoped to
`body[ng-app="studentApp"][ng-controller="IndexCtrl"]`. It does not scrape, sync or store
student data. The preview contains only example data. Live signed-in Safari verification
is still needed; SIMS template changes can require CSS updates.

## Cross-browser skin and personal homework ticks

The installer at `/sims-skin/index.html` offers a standalone userscript for Tampermonkey
(Chrome, Edge, Firefox) and Userscripts (Safari), plus the Safari CSS-only option.
No developer account or Xcode is required. Browser-manager installation is manual.

`skin/homework.js` reads stable IDs from the existing rendered Angular scopes, never
calls a SIMS service, and stores one localStorage completion flag per school/student/
assignment ID. Missing identifiers disable the control. Ticks are separate from SIMS
submission status and do not sync across browsers. Clearing SIMS site data removes them.

After editing CSS or homework logic, run `node scripts/build-sims-skin.mjs` to rebuild
`public/sims-skin/shsb-sims.user.js`. Open `tests/sims-skin.html` in a browser to exercise
persistence, identity isolation, dynamic rows, duplicate installation, navigation
preservation and storage failure handling using fixture scopes (no live account).

Mobile layout overrides live in `skin/mobile.css`. The build scopes and embeds them in both distribution files. Version 0.4.0 adds full-width panels, horizontally scrollable navigation, larger homework controls and dynamic viewport sizing. Replace the installed userscript on each device to update; completion storage keys stay unchanged.

Version 0.5.0 adds personal To do / Done sections on the homework list and dashboard
widget. Completed rows are hidden from To do without removing or cloning Angular
nodes; assignment details remain openable. Done contains the completed assignments
currently loaded by SIMS, not an independent archive. Existing completion keys are
unchanged. Undo a tick in Done to return the assignment to To do.

## Publish the setup page from this project

The `.github/workflows/publish-skin.yml` workflow builds the latest userscript and
publishes only `public/sims-skin` to GitHub Pages after relevant commits reach `main`.
It can also be run manually from the repository's Actions tab.

One-time setup: connect this folder to the intended GitHub repository, preserving
any existing remote commits. In that repository, set Settings → Pages → Source to
**GitHub Actions** (replacing the earlier "Deploy from a branch" setup).

After that, edit the source here, run `npm run build:skin`, then commit and push
through VS Code Source Control (or Git). Saving files alone does not publish them.
Check Actions → Publish SIMS setup page for deployment status and the public URL.
The local Next.js server and API routes are not deployed by this workflow.
Updating the website updates its downloads; already-installed userscripts still
need to be replaced on each device.
