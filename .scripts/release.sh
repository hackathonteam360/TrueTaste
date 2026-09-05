#!/usr/bin/env bash
# One-command release: bump version, build APK via EAS, publish GitHub release.
# Usage: bash .scripts/release.sh v1.1.0
# Env:  PROFILE=preview (default) | production, GH_REPO=hackathonteam360/TrueTaste
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

TAG="${1:?usage: release.sh <tag>   e.g. bash .scripts/release.sh v1.1.0}"
GH_REPO="${GH_REPO:-hackathonteam360/TrueTaste}"
PROFILE="${PROFILE:-preview}"
VERS="${TAG#v}"
DIST="$ROOT/dist/TrueTaste-$TAG.apk"

# -- sanity ---------------------------------------------------------------
if [ -n "$(git status --porcelain)" ]; then echo "Working tree dirty — commit or stash first"; exit 1; fi
command -v eas >/dev/null     || { echo "eas-cli not installed"; exit 1; }
command -v gh  >/dev/null     || { echo "gh CLI not installed";    exit 1; }
command -v curl >/dev/null    || { echo "curl not installed";      exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated — run: gh auth login"; exit 1; }

# -- bump + tag -----------------------------------------------------------
VERS="$VERS" node -e 'const fs=require("fs");const p=require("./mobile/app.json");p.expo.version=process.env.VERS;fs.writeFileSync("./mobile/app.json",JSON.stringify(p,null,2)+"\n")'
git add mobile/app.json
git commit -m "chore: bump version to $TAG"
git tag "$TAG"
pushd mobile >/dev/null

# -- build via EAS ---------------------------------------------------------
echo ">> Submitting EAS android build [$PROFILE] for $TAG ..."
JSON="$(eas build --platform android --profile "$PROFILE" --non-interactive --json 2>/dev/null)"
BUILD_ID="$(printf '%s' "$JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{const o=JSON.parse(s);process.stdout.write(o.id||'')}catch(e){}})" )"
[ -n "$BUILD_ID" ] || { echo "!! build submission failed"; popd; exit 1; }
echo ">> Build $BUILD_ID"

# -- poll -------------------------------------------------------------------
URL=""
for i in $(seq 1 90); do
  sleep 30
  B="$(eas build:view "$BUILD_ID" --json 2>/dev/null)"
  STATUS="$(printf '%s' "$B" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{const o=JSON.parse(s);process.stdout.write(o.status||'')}catch(e){}})" )"
  URL="$(printf '%s' "$B" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{const o=JSON.parse(s);process.stdout.write(o.artifacts?.buildUrl||o.applicationArchiveUrl||'')}catch(e){}})" )"
  [ -n "$URL" ] && URL="${URL//\\\//\/}"
  echo "    [$i] $STATUS"
  case "$STATUS" in
    finished) break;;
    errored)  echo "!! build failed — https://expo.dev/accounts/truetaste/projects/truetaste/builds/$BUILD_ID"; popd; exit 1;;
    canceled) echo "!! build canceled"; popd; exit 1;;
  esac
done
popd >/dev/null
[ -n "$URL" ] || { echo "!! no artifact after polling window"; exit 1; }

# -- download + release -----------------------------------------------------
mkdir -p dist
curl -sL -o "$DIST" "$URL"
echo ">> APK: $DIST ($(du -m "$DIST" | cut -f1) MB)"

gh release create "$TAG" "$DIST" --repo "$GH_REPO" --title "TrueTaste $TAG" \
  --notes "**TrueTaste $TAG** — voice-first food discovery.

Install the APK on any Android device (SDK 21+). Backend: https://truetaste-api.bonto.run" >/dev/null

git push
git push --tags
echo ">> Released: https://github.com/$GH_REPO/releases/tag/$TAG"
echo ">> Note: dist/ is gitignored; the APK lives on the GitHub release only."