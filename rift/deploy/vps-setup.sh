#!/bin/bash
# Rift VCS — VPS deployment script
# Usage: bash deploy/vps-setup.sh
#
# Sets up rift serve as a systemd service on any Linux VPS.
# Requires: root or sudo access.

set -e

RIFT_BIN=/usr/local/bin/rift
SERVICE_FILE=/etc/systemd/system/rift-serve.service
REPO_DIR=/srv/rift
RIFT_USER=rift

echo "=== Rift VCS — VPS Setup ==="
echo ""

# Check if rift binary exists
if ! command -v rift &>/dev/null; then
    echo "rift binary not found. Install it first:"
    echo "  curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh"
    echo "  or: cargo install rift-vcs"
    exit 1
fi

# Create rift user if it doesn't exist
if ! id "$RIFT_USER" &>/dev/null; then
    echo "Creating user: $RIFT_USER"
    useradd --system --no-create-home --shell /usr/sbin/nologin "$RIFT_USER"
fi

# Create repo directory
echo "Creating repo directory: $REPO_DIR"
mkdir -p "$REPO_DIR"
chown "$RIFT_USER:$RIFT_USER" "$REPO_DIR"

# Initialize rift repo if not already
if [ ! -d "$REPO_DIR/.rift" ]; then
    echo "Initializing rift repo at $REPO_DIR..."
    cd "$REPO_DIR"
    sudo -u "$RIFT_USER" rift init
fi

# Ask for the bearer token
read -rp "Set a bearer token for /blob auth (or press Enter for no auth): " TOKEN
if [ -n "$TOKEN" ]; then
    TOKEN_ARG="--token $TOKEN"
else
    TOKEN_ARG=""
fi

# Write systemd service
echo "Writing systemd service..."
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Rift VCS Server
After=network.target

[Service]
Type=simple
User=$RIFT_USER
Group=$RIFT_USER
WorkingDirectory=$REPO_DIR
ExecStart=$RIFT_BIN serve --public --port 3030 --tls $TOKEN_ARG
Restart=on-failure
RestartSec=5

NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$REPO_DIR
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable rift-serve
systemctl restart rift-serve

echo ""
echo "=== Done ==="
echo "rift serve is running on port 3030"
echo ""
echo "  Status:   systemctl status rift-serve"
echo "  Logs:     journalctl -u rift-serve -f"
echo "  Stop:     systemctl stop rift-serve"
echo "  Restart:  systemctl restart rift-serve"
echo ""
echo "Your server URL: https://$(hostname -I | awk '{print $1}'):3030"
echo ""
echo "Others can clone with:"
echo "  rift clone https://$(hostname -I | awk '{print $1}'):3030 --accept-fingerprint <fingerprint>"
echo ""
echo "Check the fingerprint in the logs: journalctl -u rift-serve | grep Fingerprint"
