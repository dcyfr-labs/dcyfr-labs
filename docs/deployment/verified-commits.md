<!-- TLP:CLEAR -->

# Verified Commits for Protected Branches

This guide explains how commit signing works for `dcyfr-labs`, how to configure it locally, and how to resolve CI failures when a commit is not recognized as **Verified** by GitHub.

## Policy

The protected deployment branches are:

- `main`
- `preview`

Pull requests targeting these branches are expected to satisfy two controls:

1. GitHub branch protection requiring signed commits and the `Verified Commits` status check
2. Vercel deployment protection requiring verified commits before deployment

Accepted signing methods:

- **GPG** — recommended default
- **SSH signing** — supported when GitHub shows the commit as **Verified**
- **S/MIME** — supported when GitHub shows the commit as **Verified**

If GitHub marks a commit as **Unverified**, it should be treated as failing policy regardless of how it was signed locally.

## Quick Start

### Recommended path: GPG signing

1. Generate a signing key
2. Add the public key to GitHub
3. Configure Git to sign commits automatically
4. Create a test commit and confirm GitHub shows **Verified**

### Alternative: SSH signing

If you already use SSH keys with GitHub, you can configure Git commit signing with SSH instead of GPG. This is allowed as long as GitHub shows **Verified**.

## Setup — Linux

Install GPG if needed:

```bash
sudo apt-get update
sudo apt-get install -y gnupg pinentry-curses
```

Generate a key:

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
```

Export the public key:

```bash
gpg --armor --export <KEY_ID>
```

Configure Git:

```bash
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true
git config --global gpg.program gpg
```

## Setup — macOS

Install GPG if needed:

```bash
brew install gnupg pinentry-mac
```

Generate and list keys:

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
```

Configure Git:

```bash
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true
git config --global gpg.program gpg
```

If pinentry prompts do not appear, add the appropriate `pinentry-program` setting to your GPG agent configuration.

## Setup — Windows

Recommended tooling:

- [Gpg4win](https://www.gpg4win.org/)
- Git for Windows

After installing Gpg4win:

1. Generate a key with Kleopatra or `gpg --full-generate-key`
2. Export the armored public key
3. Add the public key to GitHub
4. Configure Git:

```powershell
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true
git config --global gpg.program gpg
```

## Add Your Signing Identity to GitHub

Publish your signing public key to GitHub before opening a PR that targets `main` or `preview`.

- **GPG**: Settings → SSH and GPG keys → New GPG key
- **SSH signing**: Settings → SSH and GPG keys → New SSH key, then use it for commit signing
- **S/MIME**: Ensure GitHub recognizes your verified email-backed signing identity

## VS Code and GitHub Desktop

### VS Code

VS Code respects your Git configuration. Once `commit.gpgsign=true` (or SSH signing is configured), commits created in the Source Control UI should be signed automatically.

### GitHub Desktop

GitHub Desktop can work with Git commit signing if your system Git and signing toolchain are configured correctly. If a commit from GitHub Desktop shows as unverified, retry from the terminal to isolate whether the issue is Desktop configuration or key registration.

## Verify Locally

Create a signed commit:

```bash
git commit -S -m "test: verify commit signing"
git log --show-signature -1
```

After pushing, confirm the commit shows **Verified** in GitHub.

## CI Failure Reasons

The `Verified Commit Validation` workflow produces the required `Verified Commits` status check and fails a PR when one or more commits are not verified by GitHub.

Common reasons include:

- `unsigned` — commit was never signed
- `unknown_key` — key used to sign is not registered with GitHub
- `expired_key` — signing key has expired
- `bad_email` or identity mismatch — commit identity does not match the verified signing identity
- `unverified_email` — the email on the signing identity is not verified in GitHub

## Rotated or Expired Keys

If your key was rotated or expired:

1. Generate or activate the replacement key
2. Add the new public key to GitHub
3. Update local Git config (`user.signingkey` or SSH signing config)
4. Re-sign affected commits if the open PR still contains unverified history

For a feature branch, the usual recovery is:

```bash
git rebase -i <base-branch>
# mark affected commits for edit
git commit --amend --no-edit -S
git rebase --continue
git push --force-with-lease
```

Use force-push only on your own feature branch, never on protected branches.

## Operational Notes

- `preview` should be the first branch to receive Vercel Verified Commits enforcement
- `main` should follow after preview soak validation
- Emergency deployment bypasses must be explicit, time-bound, and audited

## Related Documentation

- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- [`../operations/branch-protection-config.md`](../operations/branch-protection-config.md)
- [`../../SECURITY.md`](../../SECURITY.md)
