# Pull Request

<!-- Thanks! Keep PRs small — one feature or one fix per PR. -->

## Summary

<!-- What does this PR change, in one or two plain sentences. No "leverage",
"seamless", or "comprehensive". Write like a human talking to a coworker. -->

## Why

<!-- What problem does this solve? Link any issues: `Fixes #123`. -->

## What changed

<!-- Bullet list of the meaningful changes. Skip pure reformatting noise. -->

-

## Checklist

- [ ] Tests pass (`cargo test --release`)
- [ ] Clippy clean (`cargo clippy --release -- -D warnings`)
- [ ] Updated `CHANGELOG.md` (under an `## Unreleased` section)
- [ ] Doc comments on new public functions (`# Errors` / `# Panics` where
      applicable)
- [ ] No `unwrap()` / `expect()` added to library code (use `?` or
      `.unwrap_or_default()`)
- [ ] `--json` flag on any new CLI command
- [ ] No secrets, tokens, or credentials in the diff
- [ ] I read `CONTRIBUTING.md` and the style notes (no AI-ism words)

## Test plan

<!-- How did you verify this works? Commands you ran, repos you tested on,
edge cases you considered. If this touches storage or auth, say what you
did to make sure nothing broke. -->

```bash
# commands you ran to verify
```
