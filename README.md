# Kang+Manga

Manga/manhwa reader (React + TS + Vite + Tailwind) with Vercel serverless API (`/api`) and an Android APK via Capacitor. Data: MangaDex API.

## Deploy website (Vercel)
1. Push this repo to GitHub.
2. vercel.com > Add New > Project > import the repo. Framework is auto-detected (Vite). Click Deploy.
3. Test: `https://YOUR-SITE.vercel.app/api/health`
4. Every `git push` redeploys automatically.

## Android APK (built in the cloud, works from Termux)
1. GitHub repo > Settings > Secrets and variables > Actions > **Variables** > New: `API_BASE` = `https://YOUR-SITE.vercel.app`
2. GitHub > Releases > Draft a new release > publish (e.g. `v1.0.0`).
3. The workflow in `.github/workflows/android.yml` builds `Kang-Manga.apk` and attaches it to that release. You can also run it from the Actions tab and download the artifact.
The APK is a debug-signed build, installable by sideloading.

## Local dev (needs a PC)
`npm install && npm run dev` (API routes need `npx vercel dev`).

## API
`/api/health` `/api/search?q=&tag=&order=` `/api/genres` `/api/manga?id=` `/api/chapters?mangaId=&languages=en&limit=&offset=` `/api/pages?chapterId=&quality=data-saver`
Add sources by extending `api/_md.ts` pattern; check each source's terms first.
