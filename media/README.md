# /media — README assets

GIFs and screenshots referenced from the package's main `README.md`. **Not
shipped to npm** (excluded from `package.json` `files` array) — they live
in the GitHub repo and are pulled into the npm page via raw URLs:

```
https://raw.githubusercontent.com/reynsu/floaty/main/media/<name>.gif
```

## Expected files

| File | Demo source | Capture | Target size |
|---|---|---|---|
| `hero.gif` | https://floaty-site-livid.vercel.app/ — hero card | Wait for auto-summon; click an action | ≤ 600 KB |
| `inbox-bulk.gif` | Examples #04 (Mutate the underlying list) | Select 2 rows → click Archive | ≤ 600 KB |
| `palette.gif` | Examples #03 (Keyboard-driven toggle) | Press ⌘K (or click "click here") → click a command | ≤ 400 KB |
| `themes.gif` | Customize section spotlights | Hover/cycle through 3 variants | ≤ 600 KB |

## Recording settings

- **Tool**: [Kap](https://getkap.co/) — `brew install --cask kap`
- **Format**: GIF
- **FPS**: 20
- **Resolution**: 1× (no Retina; divides file size by ~4)

If a file exceeds the target, run:

```sh
gifsicle -O3 --lossy=80 in.gif -o out.gif   # brew install gifsicle
```

## After dropping new GIFs

```sh
git add media/*.gif
git commit -m "docs: add demo GIFs to README"
git push
npm version patch                            # 0.1.0 → 0.1.1
git push --tags
npm publish --otp=XXXXXX                     # republishes README to npm
```

The npm page rebuilds within ~30s of `npm publish`.
