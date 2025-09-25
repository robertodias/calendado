#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all environment variables used in the codebase
 * are properly defined and consistent across frontend and backend.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define expected environment variables
const EXPECTED_ENV_VARS = {
  // Frontend (VITE_ prefixed)
  frontend: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_RECAPTCHA_SITE_KEY',
    'VITE_APP_ENV',
    'VITE_APP_BASE_URL',
    'VITE_DEBUG_MODE'
  ],
  
  // Backend (Firebase Functions secrets)
  backend: [
    'APP_BASE_URL',
    'RESEND_API_KEY', 
    'FROM_EMAIL',
    'FROM_NAME',
    'RESEND_WEBHOOK_SECRET'
  ]
};

// Built-in Vite environment variables (automatically provided)
const VITE_BUILTIN_VARS = [
  'import.meta.env.DEV',
  'import.meta.env.PROD', 
  'import.meta.env.MODE',
  'import.meta.env.BASE_URL'
];

function findEnvVarUsage(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const usage = new Set();
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find import.meta.env.VITE_* usage
      const viteMatches = content.match(/import\.meta\.env\.VITE_[A-Z_]+/g);
      if (viteMatches) {
        viteMatches.forEach(match => usage.add(match));
      }
      
      // Find process.env.* usage
      const processMatches = content.match(/process\.env\.[A-Z_]+/g);
      if (processMatches) {
        processMatches.forEach(match => usage.add(match));
      }
      
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error.message);
    }
  }
  
  return Array.from(usage);
}

function validateViteConfig() {
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.error('❌ vite.config.ts not found');
    return false;
  }
  
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  const definedVars = [];
  
  // Extract defined variables from vite.config.ts
  const defineMatches = content.match(/'import\.meta\.env\.[^']+':/g);
  if (defineMatches) {
    defineMatches.forEach(match => {
      const varName = match.replace(/'import\.meta\.env\./, '').replace(/':/, '');
      definedVars.push(varName);
    });
  }
  
  console.log('📋 Variables defined in vite.config.ts:');
  definedVars.forEach(varName => {
    console.log(`  ✅ ${varName}`);
  });
  
  return definedVars;
}

function main() {
  console.log('🔍 Environment Variable Validation\n');
  
  // Find all environment variable usage
  const srcDir = path.join(__dirname, '..', 'src');
  const functionsDir = path.join(__dirname, '..', 'functions', 'src');
  
  console.log('📁 Scanning src/ directory...');
  const frontendUsage = findEnvVarUsage(srcDir);
  
  console.log('📁 Scanning functions/src/ directory...');
  const backendUsage = findEnvVarUsage(functionsDir);
  
  // Validate Vite configuration
  console.log('\n🔧 Validating Vite configuration...');
  const definedVars = validateViteConfig();
  
  // Check for missing definitions
  console.log('\n🔍 Checking for missing definitions...');
  const missingVars = [];
  
  for (const usage of frontendUsage) {
    if (usage.startsWith('import.meta.env.VITE_')) {
      const varName = usage.replace('import.meta.env.', '');
      if (!definedVars.includes(varName)) {
        missingVars.push(varName);
      }
    }
  }
  
  if (missingVars.length > 0) {
    console.log('❌ Missing variable definitions in vite.config.ts:');
    missingVars.forEach(varName => {
      console.log(`  ❌ ${varName}`);
    });
  } else {
    console.log('✅ All frontend environment variables are properly defined');
  }
  
  // Check for case sensitivity issues
  console.log('\n🔤 Checking for case sensitivity issues...');
  const caseIssues = [];
  
  const allUsage = [...frontendUsage, ...backendUsage];
  const varNames = new Map();
  
  for (const usage of allUsage) {
    let varName;
    if (usage.startsWith('import.meta.env.')) {
      varName = usage.replace('import.meta.env.', '');
    } else if (usage.startsWith('process.env.')) {
      varName = usage.replace('process.env.', '');
    }
    
    if (varName) {
      const normalized = varName.toUpperCase();
      if (varNames.has(normalized) && varNames.get(normalized) !== varName) {
        caseIssues.push({
          normalized,
          variants: [varNames.get(normalized), varName]
        });
      } else {
        varNames.set(normalized, varName);
      }
    }
  }
  
  if (caseIssues.length > 0) {
    console.log('❌ Case sensitivity issues found:');
    caseIssues.forEach(issue => {
      console.log(`  ❌ ${issue.normalized}: ${issue.variants.join(' vs ')}`);
    });
  } else {
    console.log('✅ No case sensitivity issues found');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Frontend variables found: ${frontendUsage.length}`);
  console.log(`  Backend variables found: ${backendUsage.length}`);
  console.log(`  Variables defined in Vite: ${definedVars.length}`);
  console.log(`  Missing definitions: ${missingVars.length}`);
  console.log(`  Case sensitivity issues: ${caseIssues.length}`);
  
  if (missingVars.length === 0 && caseIssues.length === 0) {
    console.log('\n✅ All environment variables are properly configured!');
    return 0;
  } else {
    console.log('\n❌ Environment variable validation failed');
    return 1;
  }
}

// Run the script if called directly
if (process.argv[1] && process.argv[1].endsWith('validate-env.js')) {
  process.exit(main());
}

export { main, findEnvVarUsage, validateViteConfig };
