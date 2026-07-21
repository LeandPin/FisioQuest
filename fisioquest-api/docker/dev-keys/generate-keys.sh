#!/usr/bin/env bash
# Generates RSA dev keys for local development (JWT RS256).
# Keys are placed in the same directory as this script.
# Usage: ./generate-keys.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIVATE_KEY="$SCRIPT_DIR/private.pem"
PUBLIC_KEY="$SCRIPT_DIR/public.pem"

if [ -f "$PRIVATE_KEY" ] && [ -f "$PUBLIC_KEY" ]; then
  echo "Keys already exist. Skipping generation."
  echo "  Private: $PRIVATE_KEY"
  echo "  Public:  $PUBLIC_KEY"
  exit 0
fi

echo "Generating RSA 2048-bit key pair for local development..."

# Generate private key in PKCS#8 format (required by Spring Security)
openssl genpkey -algorithm RSA -out "$PRIVATE_KEY" -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in "$PRIVATE_KEY" -out "$PUBLIC_KEY"

echo "Done! Keys generated:"
echo "  Private: $PRIVATE_KEY"
echo "  Public:  $PUBLIC_KEY"
