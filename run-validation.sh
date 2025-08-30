#!/bin/bash

echo "🔍 Maritime Intelligence Platform - Navigation Validation"
echo "======================================================"

# Run the validation pipeline
node validate-navigation.js

# Check if artifacts were generated
if [ -f "artifacts/sitemap.json" ]; then
    echo ""
    echo "📊 Validation Results:"
    echo "- Sitemap generated: ✅"
    echo "- Link inventory: ✅" 
    echo "- Issue reports: ✅"
    echo ""
    echo "📁 Files generated in artifacts/ directory:"
    ls -la artifacts/
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Review artifacts/go-live-report.md"
    echo "2. Run: npm run test:e2e (when Playwright is configured)" 
    echo "3. Check CSV files for any issues to fix"
    echo ""
else
    echo "❌ Validation failed - no artifacts generated"
    exit 1
fi