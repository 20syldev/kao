# Contributing

Pull requests are disabled on this repository. To report a bug or suggest a change, open an
issue: the maintainer handles the changes.

## Prerequisites

- Node.js 24 and npm
- Google Chrome (end-to-end tests use the installed Chrome)
- Python 3 (only for `npm run check:assets`)
- Java 21+ (only for `npm run build:swf`)

```sh
npm ci
npm run dev     # http://127.0.0.1:7711
```

## Stack

Next.js 16 (App Router, static export), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui
(new-york, Radix, Lucide), next-intl (English at `/`, French at `/fr/`), next-themes, sonner.
The editor itself is Flash code: a `MAIN.swf` loader built from `flash/MainTimeline.as`, the
`engine.swf` editor engine and the parts in `public/library/`, played by a self-hosted Ruffle build.

## Scripts

| Script                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Development server on <http://127.0.0.1:7711>                  |
| `npm run build`        | Static export into `out/`                                      |
| `npm start`            | Serves `out/` on port 7712                                     |
| `npm run check`        | `tsc`, ESLint and Prettier                                     |
| `npm run format`       | Prettier then `eslint --fix`                                   |
| `npm test`             | Playwright end-to-end tests on the build (port 7713, Chrome)   |
| `npm run check:assets` | Every part referenced by the editor menus exists               |
| `npm run build:swf`    | Rebuilds `public/MAIN.swf` from `flash/MainTimeline.as` (Java) |

## Structure

```
src/app/           Routes: (site) for English at "/", [locale] for "/fr/", global 404
src/components/    Shell, header, footer; studio/ holds the bento tiles and dialogs
src/components/ui/ shadcn/ui components (generated)
src/hooks/         useRuffle (player), useExportBridge (SWF callbacks), useHistory
src/lib/           Pixel decoding and encoding, avatar codes, history store, Ruffle loader
src/data/          Export sizes and formats
messages/          next-intl messages, one folder per locale
public/            Ruffle, MAIN.swf, engine.swf and the face parts (library/)
flash/             ActionScript source of the loader and its base container loader.swf
scripts/           swf.sh (loader build), engine.sh (read and change the engine), ffdec.sh, assets.py
tests/             Playwright tests
```

## How the export works

When **SAVE** is pressed, `engine.swf` moves the avatar off-stage and calls `outputData()` in
`MAIN.swf` through a `LocalConnection`. The loader asks the page for a scale (`kaoExportScale`),
draws the vector avatar at that size with transparency and hands the zlib-compressed pixels and the
avatar code to `kaoExport`, where the page encodes the chosen format. `BitmapData.encode()` is only a stub in Ruffle, hence the raw pixels.

## Deployment

Pushing to `master` runs the CI, then deploys `out/` to GitHub Pages (`kao.sylvain.sh`).
Pushing a version tag (`X.Y.Z`) creates a draft release, see _Releases_ below.

## Where to change what

| Goal                                       | Edit                                                  |
| ------------------------------------------ | ----------------------------------------------------- |
| Page layout, tiles, dialogs                | `src/components/`                                     |
| Colors, radius, shadows, fonts             | `src/app/globals.css` only                            |
| Texts                                      | `messages/en/*.json` first, then `messages/fr/*.json` |
| Export sizes and formats                   | `src/data/export.ts`, `src/lib/pixels.ts`             |
| What happens when SAVE is pressed in Flash | `flash/MainTimeline.as`, then `npm run build:swf`     |
| Menus and screens of the editor engine     | `public/engine.swf`, edited in place (see below)      |

`public/library/` holds the face parts: never modify them. `public/MAIN.swf` is built, never edited:
`scripts/swf.sh` compiles `flash/MainTimeline.as` into the base container `flash/loader.swf` with a
pinned ffdec, so the result is always the same file, which the CI checks. Commit the rebuilt file
together with its source change.

## Changing the editor

The editor is a Flash movie, `public/engine.swf`, written in ActionScript 2. It has no build step and
no source folder: the committed binary is the source, and you change it in place with ffdec, the free
Flash decompiler that `scripts/engine.sh` downloads (pinned by SHA-256) and wraps. Java 21+ is needed.

```sh
scripts/engine.sh scripts      # decompile every script into tools/engine/scripts/
scripts/engine.sh texts        # export the text fields into tools/engine-texts/
scripts/engine.sh xml          # dump the whole structure into tools/engine.xml
# edit a script, then put it back and commit the new public/engine.swf
scripts/engine.sh compile /frame_62/DoAction tools/engine/scripts/frame_62/DoAction.as
```

`tools/` is ignored by git, so the exported files are your working copy. Then run `npm run build`
and `npm test`: the end-to-end tests drive the real editor, create an avatar, export it and reopen it.

### Where things are

| What                                                     | Where                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Everything about the menus, parts, colors, pages, export | `frame_62/DoAction.as`, the main script of about 4,700 lines               |
| Menu hover (icon scale, pill color fade)                 | `easeMainIcon`, `pillFade` and friends at the top of it                    |
| Building the menus and the part grid                     | `buildMenu`, `buildSubMenu`, `displayThumb`                                |
| Drawing the avatar from the chosen parts                 | `drawPortrait`, `colorPortrait`, `clearPortrait`                           |
| Titles "CREATE AVATAR" and "EDIT AVATAR"                 | end of `frame_62/DoAction.as`, chosen from the `vF` mode                   |
| Back, Random, Reset, Save buttons and their alerts       | `frame_23/DoAction.as`                                                     |
| Start routing: new avatar, or reopen a code              | `frame_2/DoAction.as`, frame labels `gender!` and `goedit!`                |
| Start screen: text, two buttons, the two characters      | field 323, `bt_male`, `bt_female`, sprites 313 and 320 (violet and yellow) |

The two start buttons set the avatar family to `m` or `f`: those letters are the folders of
`public/library/` and the first character of an avatar code, so they must not change. Only what the
user reads can be renamed.

### Good to know

- Two kinds of change are safe. A script edit goes through `compile`. A text of the same length can be
  swapped byte for byte in the decompressed file (that is how the internal names were changed).
- ffdec recompiles a whole script, so after a compile the script still behaves the same but is
  written with equivalent forms (`x += 1` for `x = x + 1`). This is expected.
- Drawings and bitmaps are not scripts. Edit them with the ffdec graphical interface
  (`java -jar tools/ffdec/ffdec.jar`), then save the file back to `public/engine.swf`.
- Animations are measured, not eyeballed: the browser clock can be slowed down in a Playwright
  script so that each Flash frame (30 per second) can be screenshotted.
- Keep the contract with the loader: on SAVE the engine calls `outputData` (13 parameters) of
  `flash/MainTimeline.as` through a `LocalConnection` named `myConn`, and the page passes the avatar
  family, language and avatar code in the `vF`, `vL` and `vIDA` flash vars.

README visuals (`docs/`) are generated, in light and dark, with the avatars of the test
run: `npm run build && npm run shots`.

## Conventions

- TypeScript strict, no `.js`/`.jsx` outside config files.
- Styles are Tailwind classes; `globals.css` is the only CSS file and holds every token.
  No hard-coded colors in components, no inline styles for constant values.
- shadcn/ui components are generated in `src/components/ui/` and only edited when necessary.
- File names: PascalCase or a single lowercase word for components, camelCase for hooks and
  `lib/`, no kebab-case.
- Imports: builtin, external, internal (`@/`), parent, sibling, index; one blank line between
  groups, alphabetical inside each.
- Comments in English and plain ASCII. Every top-level function or component has a multi-line
  JSDoc with its `@param` and `@returns`; no comments inside `.tsx` bodies nor in types.
- No decorative Unicode characters in code or interface (emoji, arrows, bullets...).
- Prettier: 4 spaces, double quotes, semicolons, trailing commas, 100 columns.

## Before pushing

```sh
npm run format
npm run check
npm run check:assets
npm run build
npm test
```

The CI runs the same steps, plus `shellcheck` and a rebuild of both SWF files, which must match
the committed ones.

## Commits

```
SEVERITY: scope: Description
```

- Severities: `MAJOR`, `MEDIUM`, `MINOR`, `BUILD`, `DOC`.
- One scope per commit: `app`, `components`, `hooks`, `lib`, `data`, `i18n`, `public`,
  `scripts`, `tests`.
- `BUILD` (tooling, CI, dependencies) and `DOC` take no scope.

## Releases

1. Bump `version` in `package.json` and commit (`BUILD: Release X.Y.Z`).
2. Tag and push: `git tag X.Y.Z && git push --tags`.
3. The _Release_ workflow tests the tag and creates a draft release with the bundle attached
   and the notes header `# Version X.Y.Z - Month Year`.
4. Write the notes (English narrative bullets, user perspective, each ending with `.`) and
   publish the draft.
