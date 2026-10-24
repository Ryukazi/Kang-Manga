# Deployment checklist

## Vercel (Kang+Manga)
- [ ] Import the GitHub monorepo.
- [ ] Set Root Directory to `Kang-Manga`.
- [ ] Set `CONTACT` if you want a contact identifier in the MangaDex User-Agent.
- [ ] Deploy and verify `/api/health`, `/api/search?q=solo`, and the chapter reader.
- [ ] Configure GitHub Actions variable `API_BASE` with the deployed domain.
- [ ] Run the Android workflow and install the APK on a test device.

## Uchiyomi (optional, separate persistent host)
- [ ] Follow `upstream/uchiyomi/docs/INSTALL.md`.
- [ ] Use HTTPS and persistent storage/database volumes.
- [ ] Create a dedicated least-privilege read API token if integrating another client.
- [ ] Keep API tokens in server-side environment variables; never put them in `VITE_*` variables or browser code.
- [ ] Verify source access and page delivery using the server's own `/api/docs` and API guide.

## Release readiness
- [ ] Review upstream licenses and source-site terms.
- [ ] Test source timeouts, unavailable chapters, image errors, and rate limits.
- [ ] Set up a private Android signing key before distributing production builds.
