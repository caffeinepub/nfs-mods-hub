# Specification

## Summary
**Goal:** Add Internet Identity authentication to NFS Mod Garage, protecting uploads and adding a personal "My Mods" management page.

**Planned changes:**
- Update the backend Motoko actor to store the uploader's principal with each mod, add `getModsByOwner(principal)` query method, and enforce owner-only deletion in `deleteMod`
- Add a Login/Logout button to the navigation bar using the existing `useInternetIdentity` hook; show abbreviated principal and Logout when authenticated
- Protect the `/upload` route — unauthenticated users see a login prompt or are redirected; authenticated uploads use the authenticated actor so the caller's principal is recorded; remove or auto-fill the manual author field
- Create a `/my-mods` route that lists only the logged-in user's mods (title, game, category, upload date) with a confirmation-gated Delete button that calls `deleteMod` via the authenticated actor
- Add a "My Mods" navigation link that is only visible when the user is logged in

**User-visible outcome:** Users can log in with Internet Identity, upload mods tied to their identity, manage and delete their own mods from a dedicated My Mods page, and are prevented from accessing upload or delete actions unless authenticated.
