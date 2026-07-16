# TokenFence Studio v1.7.0 — one-upload package

This archive is rooted at the GitHub repository root. It contains every changed file required for the v1.7.0 product foundation, documentation and macOS workflow.

## Upload once

1. Extract the ZIP.
2. In Finder press `Command + Shift + .` once so the hidden `.github` directory is visible.
3. Open the repository root on GitHub and choose **Add file → Upload files**.
4. Select every item inside the extracted folder and drag them into the upload area in one operation.
5. Do not upload the ZIP itself; GitHub does not extract repository ZIP uploads.
6. Commit with:

```text
feat: upgrade TokenFence Studio to v1.7.0 product foundation
```

## Build the release

Open **Actions → TokenFence macOS Builds and Release → Run workflow** and use:

```text
version: v1.7.0
create_release: true
make_latest: true
```

Create a new workflow run after the commit. Do not re-run an older v1.6.1 job because it remains attached to the old commit.
