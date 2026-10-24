# Kang Manga Multi-Source Starter

This is a separate project bundle assembled from the two supplied source archives:

- `uchiyomi/` — the main web reader and self-hosted backend. Uchiyomi supports multiple source engines/extensions, but sources must be configured/enabled in its own admin interface.
- `mihon-android-reference/` — the Mihon Android project and source API reference. It is native Android/Kotlin code, not a web API that can be deployed to Vercel.

## Important architecture decision

This bundle does **not** use the old Kang Manga React/MangaDex-only API as its application. The old project is not modified and remains available separately.

Uchiyomi is a self-hosted application with a web frontend and backend. It is not a static Vite app and should not be deployed to Vercel as if it were one. Use its Docker Compose deployment and persistent storage. The website can be accessed from a browser and installed as a PWA on Android. Mihon is included as a native Android reference/project; it is not automatically converted into an APK of the Uchiyomi website.

## Start Uchiyomi (Docker host required)

1. Install Docker Engine and Docker Compose on a computer/VPS that can stay online. A phone running Termux is not the recommended production host.
2. Read `uchiyomi/README.md` and `uchiyomi/docs/USAGE.md` before first launch.
3. Review `uchiyomi/docker-compose.yml` and the sample environment/configuration files. Set credentials and persistent storage before exposing it to the internet.
4. From the `uchiyomi/` directory, follow the exact upstream Compose instructions. Do not expose an unprotected admin interface publicly.
5. Open the running web app, configure a trusted extension repository/source in the admin area, and test search → series → chapters → page images. No source is enabled automatically.

## APK options

- **Fastest Android app option:** install the running Uchiyomi website as a PWA from Chrome's browser menu. This uses the same deployed web app and does not require an APK build.
- **Native APK:** build Mihon using the build instructions and Gradle files in `mihon-android-reference/`. This produces the Mihon Android application, not a Kang Manga-branded wrapper around the Uchiyomi web app.
- **A single custom APK for this web app** needs a separate Capacitor/native wrapper and configuration against the hosted Uchiyomi server. That is not prebuilt by simply combining these two repositories.

## MangaDex

The old MangaDex-only endpoints from the previous Kang Manga app are not included as the new application's API. Upstream Uchiyomi itself includes MangaDex as an optional source alongside other source methods; choose and enable the sources you want in its settings. Removing every MangaDex-related upstream code path is not recommended because it would modify upstream internals and may break upgrades; it is not required to stop relying on MangaDex.

## Licenses and upstream documentation

Keep the license and notices supplied in `uchiyomi/` and `mihon-android-reference/`. Review their respective licenses before redistributing modified builds. This bundle does not imply that the two upstream projects have been merged into one codebase; they are kept in separate folders to preserve their build systems and licenses.
