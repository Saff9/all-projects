# Publishing Rift to crates.io

This is the maintainer's runbook for publishing `rift-vcs` to crates.io
and for building the Windows MSI installer. Read it once, keep it
handy, follow it in order.

## Prerequisites

You need:

- A crates.io account.
- An API token with `publish-new` and `publish-update` scopes.
- The latest stable Rust toolchain (`rustup update stable`).
- The `cargo-wix` subcommand if you're also cutting a Windows MSI:
  ```bash
  cargo install cargo-wix --locked
  ```
- Push access to the `Saff9/rift` GitHub repo.

## 1. Get a crates.io account

crates.io authenticates with GitHub. You don't make a separate
password.

1. Go to <https://crates.io>.
2. Click **Login** in the top right.
3. Authorize crates.io to read your GitHub profile. crates.io only
   uses your GitHub username and public email; it does not get write
   access to your repositories.
4. After you log in, go to **Account Settings** and verify the email
   address crates.io sent a confirmation link to. You cannot publish
   until the email is verified.
5. Set a display name and avatar if you want one. These show up on
   your publisher profile page (e.g. <https://crates.io/users/your-name>).

If you're publishing on behalf of a team, you can either publish
under your own account or create a GitHub org and have everyone log
in with the org. Either way, the crate is owned by the account that
publishes the first version, and other owners can be added later.

## 2. Create an API token

Tokens are how `cargo publish` authenticates. You need a token to
publish, but not to download (downloading is anonymous).

1. Log in to crates.io.
2. Go to **Account Settings** -> **API Tokens**.
3. Click **New Token**.
4. Name it something descriptive, e.g. `rift-vcs-publish-laptop`.
   Always scope tokens per machine. If a laptop is stolen or a CI
   runner leaks the token, you only lose that one.
5. Check these scopes:
   - `publish-new` (required for the first version of a crate)
   - `publish-update` (required for every subsequent version)
6. Click **Create**. The token is shown once. Copy it now. You will
   not see it again.

Treat the token like a password. Do not paste it into Slack, do not
commit it to a repo, do not put it in a Dockerfile. If you suspect
it leaked, revoke it from the same page and create a new one.

## 3. Log in with cargo

On the machine you'll publish from:

```bash
cargo login
```

It will prompt for the token. Paste it and press Enter. cargo stores
it in `~/.cargo/credentials.toml` (or `%USERPROFILE%\.cargo\
credentials.toml` on Windows) with mode `0600`. Don't share that
file.

You only need to run `cargo login` once per machine. Subsequent
`cargo publish` calls reuse the stored token.

To verify the login worked:

```bash
cargo owner --list rift-vcs
```

If you're not yet an owner, this fails with "could not find the
crate". That's expected until the first version is published.

## 4. Bump the version

crates.io rejects a re-publish of an existing version, even if you
deleted the crate. So you have to bump the version before every
publish.

We follow semver:

- **Patch** (1.1.0 -> 1.1.1): bug fixes only. No new features, no
  breaking changes. Safe to auto-upgrade.
- **Minor** (1.1.0 -> 1.2.0): new features, no breaking changes.
- **Major** (1.1.0 -> 2.0.0): breaking changes. New CLI flags, new
  repo format, anything that requires a user action.

Files that hold the version and must be kept in sync:

1. **`Cargo.toml`** - the `version = "x.y.z"` field in the
   `[package]` section. This is the source of truth. cargo reads
   this and it's what gets published.
2. **`Cargo.lock`** - regenerate with `cargo update -p rift-vcs
   --precise x.y.z` after bumping `Cargo.toml`. Without this, the
   lockfile and manifest disagree and CI may build the wrong
   version.
3. **`CHANGELOG.md`** - add a new `## [x.y.z] - YYYY-MM-DD` section
   above the previous one. List what changed, with PR or commit
   links. Users read this to decide whether to upgrade.
4. **`docs/PUBLISHING.md`** - no change needed. (This file.)
5. **Tag the release**: `git tag vx.y.z && git push origin vx.y.z`.
   The `v*` tag triggers the GitHub Actions release workflow, which
   builds the binaries and the MSI.

Bump all four in one commit. Don't tag the commit until `Cargo.lock`
and `CHANGELOG.md` are also updated.

## 5. Dry-run the publish

Before the real publish, sanity-check that the package is well
formed:

```bash
cargo publish --dry-run
```

This builds the package the same way crates.io would (in an isolated
directory, with only the files listed by `include`/`exclude`), runs
the tests against the packaged source, and prints a summary. It does
not upload anything. The output ends with:

```
warning: aborting upload due to dry run
```

That's success. If it errors, fix the error before going further.
Common errors:

- `error: missing field `description`` - you forgot the
  `description` in `Cargo.toml`.
- `error: the following warnings were detected` - usually a missing
  `license` or `license-file`.
- `error: failed to verify package tarball` - the packaged crate
  doesn't compile. Most often this is because `cargo publish` runs
  with `--locked` semantics, so any path outside the package (like
  `../shared`) won't be found. Either vendor the dependency or
  publish it first.

If you have uncommitted changes (e.g. the version bump you just
made), pass `--allow-dirty`:

```bash
cargo publish --dry-run --allow-dirty
```

## 6. Publish

```bash
cargo publish
```

This uploads the tarball to crates.io. crates.io runs its own build
to verify, then publishes. The whole thing takes 30 to 90 seconds.
You'll see:

```
   Uploading rift-vcs x.y.z (/path/to/rift-vcs-x.y.z.crate)
    Uploaded rift-vcs x.y.z to registry https://crates.io
```

Once it says `Uploaded`, the version is live. `cargo install
rift-vcs` will now install it.

Note: crates.io has a brief propagation delay (usually under 60
seconds) before the new version shows up in search or in
`cargo search`. Don't panic if the old version is listed for a
minute.

## 7. Tag the release and let CI build binaries

After a successful publish:

```bash
git tag vx.y.z
git push origin vx.y.z
```

The `v*` tag triggers `.github/workflows/release.yml`, which builds
the Linux/macOS binaries and the Windows MSI, and attaches them to
a GitHub release. The release is created as a draft; you'll need to
publish it from the GitHub UI.

## 8. Yank a version if something goes wrong

If a published version has a critical bug, you have two options:

### Yank (recommended for minor bugs)

Yanking hides a version from the crates.io index and from
`cargo install`. **Existing `Cargo.lock` files still pin to it.**
This means yanking does not break anyone who has already pinned
that version. It only stops new users from picking it up.

```bash
cargo yank --vers x.y.z
```

To undo a yank:

```bash
cargo yank --vers x.y.z --undo
```

Yank is reversible, publishes are not. When in doubt, yank first
and investigate second.

### Delete the version (not possible)

crates.io does not allow deleting published versions. The only way
to "remove" a broken version is to yank it and publish x.y.(z+1)
with the fix. This is intentional: cargo's reproducibility
guarantees rely on the fact that a `Cargo.lock` pointing at
version x.y.z will always resolve to the same source.

## 9. Add owners

If you're publishing on behalf of a team, add other maintainers as
owners so they can publish future versions without your laptop:

```bash
cargo owner --add their-github-username
```

Owners can publish new versions, yank, and add or remove other
owners. There's no "admin" role; every owner has full power. Pick
carefully.

To remove an owner (e.g. someone leaves the team):

```bash
cargo owner --remove their-github-username
```

You can't remove yourself if you're the last owner. Transfer
ownership first.

## 10. Publishing the Windows MSI separately

The Windows MSI is **not** published to crates.io. It's built by
GitHub Actions (in `.github/workflows/release.yml`) and attached
to the GitHub release. Users download it from
<https://github.com/Saff9/rift/releases>.

To build the MSI locally for testing:

```bash
cargo install cargo-wix --locked
cargo wix init        # only needed once, to generate wix/main.wxs from template
cargo wix             # builds target/wix/rift-vcs-x.y.z-x86_64.msi
```

We commit `wix/main.wxs` to the repo so `cargo wix init` is not
needed on CI. The CI workflow installs cargo-wix and runs `cargo
wix` directly.

See `INSTALL.md` for the end-user instructions on running the MSI.

## Quick checklist

Before each release:

- [ ] `Cargo.toml` version bumped
- [ ] `Cargo.lock` regenerated (`cargo update -p rift-vcs --precise x.y.z`)
- [ ] `CHANGELOG.md` updated with the new version section
- [ ] `cargo publish --dry-run --allow-dirty` succeeds
- [ ] `cargo build --release` succeeds with 0 warnings
- [ ] `cargo clippy --release -- -D warnings` succeeds
- [ ] `cargo test --release` passes
- [ ] Commit and push, wait for CI to pass on `main`
- [ ] `cargo publish`
- [ ] `git tag vx.y.z && git push origin vx.y.z`
- [ ] Wait for the GitHub Actions release workflow to finish
- [ ] Publish the draft release on GitHub
- [ ] Verify `cargo install rift-vcs` picks up the new version
- [ ] Verify the MSI downloads and installs (smoke test on a Windows VM)

If anything goes wrong between publish and tag:

- Yank the version: `cargo yank --vers x.y.z`
- Fix the bug, bump to x.y.(z+1), publish again.
