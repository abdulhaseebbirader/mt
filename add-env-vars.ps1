# PowerShell script to add environment variables to Vercel
# Run this script from the Mataam directory

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

# Store responses to avoid interactive prompts
$env:VERCEL_ENV_TYPE = "Secret"

# Add LOVABLE_API_KEY
Write-Host "Adding LOVABLE_API_KEY..." -ForegroundColor Cyan
$lovableKey = "sk_fW1LhqWEk7taMdr8lNtdPBa0OvYJuUk/IWcmEkzYJUW/FxErWQMmp5OTtG86zXqCh6RC8At7z17Qx8SZ7eXoTxR71/f+yhw4kXZORJ59w8RTWRy7apVZiiIB4Uuba/vu7+AN5riUiyd3xYqupc/7MuLMA8ICbmT15fJjhko+/yHHUIjhMAOSOsX+kGPr9qqqQJKjarIi4kDckU7dJsk739WhyiLwVJbbvNrqPODx7rs4q/0N/cqMZo8sGEUWsdk2AAATuw=="
echo "Secret" | vercel env add LOVABLE_API_KEY $lovableKey
Write-Host "✓ LOVABLE_API_KEY added" -ForegroundColor Green

# Add GOOGLE_SHEETS_API_KEY
Write-Host "Adding GOOGLE_SHEETS_API_KEY..." -ForegroundColor Cyan
$googleKey = "lovc_b383681975b6b140943b44d86839079c"
echo "Secret" | vercel env add GOOGLE_SHEETS_API_KEY $googleKey
Write-Host "✓ GOOGLE_SHEETS_API_KEY added" -ForegroundColor Green

# Add AZAD_SPREADSHEET_ID
Write-Host "Adding AZAD_SPREADSHEET_ID..." -ForegroundColor Cyan
$azadId = "1F1JAYGpaeCP3ShA9vqbteHL2PX7zAtTwIdSw6-Xut9w"
echo "Config" | vercel env add AZAD_SPREADSHEET_ID $azadId
Write-Host "✓ AZAD_SPREADSHEET_ID added" -ForegroundColor Green

# Add ROSHAN_SPREADSHEET_ID
Write-Host "Adding ROSHAN_SPREADSHEET_ID..." -ForegroundColor Cyan
$roshanId = "13FRAFg1WEEXBzy8KzMsI4s9TCxn2p16TXqH-vS-u4zU"
echo "Config" | vercel env add ROSHAN_SPREADSHEET_ID $roshanId
Write-Host "✓ ROSHAN_SPREADSHEET_ID added" -ForegroundColor Green

Write-Host "`nAll environment variables added successfully!" -ForegroundColor Green
Write-Host "Listing all environment variables..." -ForegroundColor Cyan
vercel env list

Write-Host "`nRedeploying with new environment variables..." -ForegroundColor Cyan
vercel redeploy --prod --yes

Write-Host "`nDone! Your app is now fully configured with Google Sheets integration." -ForegroundColor Green
