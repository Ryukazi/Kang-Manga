# Kang Manga Suite

One GitHub repository for the **Kang+Manga website + installable web app + Android APK workflow**, alongside the upstream source projects that can power a separately hosted manga-source backend.

## Important architecture note

These three projects are not interchangeable APIs:

- `Kang-Manga/` is the React + Vite website/PWA and Capacitor Android APK shell. It currently uses the MangaDex API through Vercel serverless functions.
- `upstream/uchiyomi/` is a self-hosted server with a web reader and source/extension engine integration. It requires a persistent server and database/storage; it is **not a Vercel serverless function**.
- `upstream/mihon/` is a native Android Kotlin app and source API. It is not a web API or a deployable website.

This monorepo preserves the original projects and their licenses. It does **not** pretend that copying Mihon or Uchiyomi source code automatically turns their sources into a public API. To read from extension-backed sources, you must run/configure a compatible backend and ensure you have rights to access and display its content.

## Deploy Kang+Manga website

1. Push this repository to your own GitHub repository.
2. Import it into Vercel. Set **Root Directory** to `Kang-Manga`.
3. Framework: Vite (auto-detected). Deploy.
4. Test `https://YOUR-DOMAIN/api/health`.
5. If needed, set `CONTACT` in Vercel environment variables for the MangaDex User-Agent contact field.

The frontend is mobile responsive and includes local bookmarks, reading history, backup/restore, chapter selection, vertical/single-page reading, RTL, and data-saver page quality.

## Build Android APK

The existing GitHub Actions workflow is at `Kang-Manga/.github/workflows/android.yml`.

1. In GitHub repo Settings → Secrets and variables → Actions → Variables, add `API_BASE` = `https://YOUR-DOMAIN` (no trailing slash).
2. Open the Actions tab and run **Build Android APK**, or publish a GitHub Release to trigger it.
3. Download the `Kang-Manga-apk` artifact, or the APK attached to the release.

The workflow creates an installable **debug-signed** APK for sideloading. For Play Store release, configure a private signing key and a release build; do not publish a debug-signed APK as a production release.

## Run Uchiyomi as the optional source backend

`upstream/uchiyomi/` contains the original Uchiyomi project and documentation. Follow its own current installation guide, using Docker Compose on a VPS/home server with persistent storage. Do not deploy the whole Uchiyomi server to Vercel.

- Project guide: `upstream/uchiyomi/README.md`
- Install guide: `upstream/uchiyomi/docs/INSTALL.md`
- API reference: `upstream/uchiyomi/docs/api.md`
- Source/extension setup: `upstream/uchiyomi/docs/extensions.md`

Uchiyomi's API is authenticated and designed around its own series/library model. It cannot be safely substituted for the current MangaDex endpoints by changing one URL. A proper connector needs explicit mapping for source search, series metadata, chapter lists, and page delivery. The Kang+Manga API remains on MangaDex until that adapter is implemented and tested against a live configured server.

## Mihon source ecosystem

`upstream/mihon/` is the native Android client source. For server-side extension-backed reading, review Uchiyomi's supported extension engine / Suwayomi integration rather than trying to compile the Android app into the website. Mihon source extensions may have their own licenses, site terms, access restrictions, and content rights.

## Local development

```bash
cd Kang-Manga
npm install
npm run dev
```

The Vite development server serves the frontend; Vercel API routes need `npx vercel dev` to run locally. Use `npm run build` and `npm run typecheck` to verify the frontend and TypeScript API.

## Content and legal note

This repository contains reader software, not a licensed manga catalog. Use sources and chapter files you are authorized to access and display. Respect publisher terms, extension licenses, regional restrictions, and copyright. Do not use this project to bypass paywalls or DRM.

## Third-party projects and licenses

- Kang+Manga: see `Kang-Manga/README.md` and its repository files.
- Uchiyomi: Mozilla Public License 2.0; see `upstream/uchiyomi/LICENSE`.
- Mihon: Apache License 2.0; see `upstream/mihon/LICENSE`.

Keep the respective license and notice files when modifying or redistributing these projects. The original upstream source code is retained in its own folders rather than merged into Kang+Manga's React application.
