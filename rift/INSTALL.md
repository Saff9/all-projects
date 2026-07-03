# Installing Rift

Five ways to install. Pick whichever fits your platform. When in doubt,
build from source. It takes about 30 seconds.

## Cargo

The crate name on crates.io is `rift-vcs`. (The shorter name `rift` was
taken by an unrelated crate. Sorry.)

```bash
cargo install rift-vcs
```

The crate is not published yet. For now, install from a local clone:

```bash
git clone https://github.com/Saff9/rift.git
cd rift
cargo install --path .
```

This puts the `rift` binary in `~/.cargo/bin`. Make sure that directory
is on your `PATH`. `rustup` handles this for you.

## Install script (planned)

The plan is a one-liner:

```bash
curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh
```

The script detects your platform, downloads the right binary from the
releases page, and drops it in `/usr/local/bin` (or `~/.local/bin` if
you don't have write access). It does not run as root.

The script doesn't exist yet. When we have signed release binaries, it
will. Until then, use cargo or build from source.

## Homebrew (planned)

```bash
brew install rift
```

Planned. Not in homebrew-core yet. Track progress in issue #42.

## Arch Linux AUR (planned)

```bash
yay -S rift-vcs
```

Planned. AUR package is being prepared. Track in issue #43.

## Build from source

Works on any platform with a Rust toolchain. Recommended if you want the
latest commits or you're contributing.

```bash
git clone https://github.com/Saff9/rift.git
cd rift
cargo build --release
```

The binary is at `target/release/rift`. Copy it somewhere on your
`PATH`:

```bash
# Linux / macOS
cp target/release/rift /usr/local/bin/rift

# Or, if you don't want to use sudo
cp target/release/rift ~/.local/bin/rift
```

Requirements:

- Rust 1.70 or newer (stable). Run `rustup update` if you're unsure.
- A C compiler. The `ring` crate (used for AES-256-GCM) builds C code.
  On Ubuntu: `sudo apt install build-essential`. On macOS: `xcode-select
  --install`.

## Windows

### Option 1 - MSI installer (recommended)

Pre-built `.msi` installers are on the [releases
page](https://github.com/Saff9/rift/releases). Pick the file named
`rift-vcs-<version>-x86_64.msi`.

1. Download the `.msi`.
2. Double-click it. If Windows SmartScreen warns, click **More
   info** -> **Run anyway**. We don't code-sign yet (signing certs
   cost money) so this warning is expected for now.
3. Click through the wizard. The defaults are fine:
   - **License Agreement**: accept (it's MIT).
   - **Destination Folder**: `C:\Program Files\Rift` (default).
   - Click **Install**. UAC will prompt; allow it.
4. Click **Finish**.
5. The installer:
   - Drops `rift.exe` into `C:\Program Files\Rift\bin\`.
   - Adds that folder to your system `PATH`.
   - Creates a **Start Menu** shortcut at `Rift` -> `Rift` that
     opens a terminal showing `rift --help`.

### Verify

Open a **new** terminal (PowerShell or cmd). Your existing
terminals won't see the new PATH entry until you restart them.

```powershell
rift --version
```

You should see:

```
rift 1.1.0
```

If you see `command not found`, log out and back in (Windows only
refreshes PATH on login), or open a fresh terminal.

### Uninstall the MSI

Settings -> Apps -> Rift VCS -> Uninstall. Or, from the command line:

```powershell
msiexec /x "{ProductCode}"
```

Find the `{ProductCode}` with `Get-Package rift-vcs` in PowerShell,
or just use Settings. The uninstaller removes:

- `C:\Program Files\Rift\bin\rift.exe`
- The Start Menu shortcut
- The PATH entry (only the entry the installer added; your
  pre-existing PATH entries are left alone)

### Option 2 - Build from source

If you want to build Rift yourself, you need the MSVC toolchain:

```powershell
git clone https://github.com/Saff9/rift.git
cd rift
cargo build --release
copy target\release\rift.exe C:\Windows\System32\
```

Or use Scoop:

```powershell
scoop install rift
```

Planned. Not in the Scoop directory yet.

### Option 3 - Cargo

If you have Rust installed, cargo works the same on Windows:

```powershell
cargo install rift-vcs
```

This puts `rift.exe` in `%USERPROFILE%\.cargo\bin`, which rustup
adds to PATH for you.

## Verify install

After any install method, run:

```bash
$ rift --version
rift 1.0.0
```

If you see `rift 1.0.0`, you're done. If you see `command not found`,
your `PATH` doesn't include the install directory. Try `echo $PATH` and
look for `~/.cargo/bin`, `/usr/local/bin`, or wherever you copied the
binary.

## Updating

If you installed with cargo:

```bash
cargo install rift-vcs --force
```

If you built from source:

```bash
cd rift
git pull
cargo build --release
cp target/release/rift /usr/local/bin/rift
```

We don't auto-update. You're in control.

## Uninstall

Remove the binary and your config dir:

```bash
rm $(which rift)
rm -rf ~/.config/rift
```

Repo data lives in `.rift/` inside each project you initialized. Delete
those directories too if you want a full cleanup.
