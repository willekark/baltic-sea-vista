const { execSync } = require('child_process');

console.log('🚀 Starting Navigation Validation Pipeline...\n');

try {
  // Run the crawler
  console.log('📊 Step 1: Running Link Crawler...');
  execSync('node scripts/run-crawler.js', { stdio: 'inherit' });
  
  console.log('\n✅ Navigation validation complete!');
  console.log('\n📁 Check the artifacts/ directory for detailed reports');
  console.log('📋 Review artifacts/go-live-report.md for launch readiness checklist');
  
} catch (error) {
  console.error('\n❌ Navigation validation failed:', error.message);
  process.exit(1);
}