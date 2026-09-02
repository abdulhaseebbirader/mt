#!/bin/bash

# Script to set environment variables on Vercel
# Usage: ./setup-env.sh

PROJECT_NAME="mataam-restaurant-hub"

echo "Setting environment variables for $PROJECT_NAME..."

# Add environment variables for production
vercel env add LOVABLE_API_KEY production "sk_fW1LhqWEk7taMdr8lNtdPBa0OvYJuUk/IWcmEkzYJUW/FxErWQMmp5OTtG86zXqCh6RC8At7z17Qx8SZ7eXoTxR71/f+yhw4kXZORJ59w8RTWRy7apVZiiIB4Uuba/vu7+AN5riUiyd3xYqupc/7MuLMA8ICbmT15fJjhko+/yHHUIjhMAOSOsX+kGPr9qqqQJKjarIi4kDckU7dJsk739WhyiLwVJbbvNrqPODx7rs4q/0N/cqMZo8sGEUWsdk2AAATuw=="

vercel env add GOOGLE_SHEETS_API_KEY production "lovc_b383681975b6b140943b44d86839079c"

vercel env add AZAD_SPREADSHEET_ID production "1F1JAYGpaeCP3ShA9vqbteHL2PX7zAtTwIdSw6-Xut9w"

vercel env add ROSHAN_SPREADSHEET_ID production "13FRAFg1WEEXBzy8KzMsI4s9TCxn2p16TXqH-vS-u4zU"

echo "Environment variables set! Redeploying..."

# Redeploy to apply new environment variables
vercel redeploy --yes

echo "Done!"
