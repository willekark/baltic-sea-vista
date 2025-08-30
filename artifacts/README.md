# Navigation Validation Artifacts

This directory contains the results of the comprehensive link validation and testing performed on the Maritime Intelligence Platform.

## Generated Files

### Core Reports
- `sitemap.json` - Complete site structure with all discovered pages and their metadata
- `go-live-report.md` - Executive summary and launch readiness checklist

### Validation Reports (CSV)
- `broken-routes.csv` - Internal routes returning 4xx/5xx or pointing to non-existent pages
- `mismatched-anchors.csv` - Hash links pointing to anchors that don't exist on target pages
- `wrong-destinations.csv` - Links where label/context doesn't match destination
- `external-issues.csv` - External links missing security attributes (target="_blank", rel="noopener noreferrer")

### Inventory
- `link-inventory.csv` - Complete inventory of all discovered links with context

## How to Use

### For Development
1. Review any CSV files with content - these indicate issues to fix
2. Use `link-inventory.csv` to audit all navigation elements
3. Check `sitemap.json` for complete page structure

### For QA Testing
1. Validate that all routes in `sitemap.json` load correctly
2. Test anchor navigation by checking the anchors array for each route
3. Verify external links open in new tabs with proper security

### For Launch
1. Ensure all CSV report files show "No issues found"
2. Review `go-live-report.md` checklist
3. Run E2E tests: `npm run test:e2e`

## Automated Validation

The validation process checks:
- ✅ Internal route validity against canonical route map
- ✅ Anchor hash targets exist on destination pages  
- ✅ External links have proper security attributes
- ✅ Navigation elements have test IDs for reliable testing
- ✅ Page load performance and console error monitoring
- ✅ Mobile responsiveness and accessibility compliance

## CI Integration

Include in your CI pipeline:
```bash
# Validate navigation
npm run crawl
npm run test:navigation
npm run test:smoke

# Fail build if issues found
if [ -s artifacts/broken-routes.csv ] || [ -s artifacts/mismatched-anchors.csv ]; then
  echo "Navigation issues detected - failing build"
  exit 1
fi
```