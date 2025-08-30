#!/usr/bin/env node

/**
 * Execute the navigation validation pipeline
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Maritime Intelligence Platform - Navigation Validation');
console.log('======================================================\n');

// Import and run the crawler validation
try {
  require('./scripts/run-crawler.js');
} catch (error) {
  console.error('❌ Validation execution error:', error.message);
  process.exit(1);
}