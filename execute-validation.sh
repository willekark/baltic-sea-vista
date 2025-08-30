#!/bin/bash
set -e

echo "🔍 Executing Navigation Validation..."
echo "===================================="

# Run the crawler validation
node scripts/run-crawler.js

echo ""
echo "✅ Validation pipeline completed!"
echo ""
echo "📊 Check results in artifacts/ directory"