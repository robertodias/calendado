#!/usr/bin/env ts-node

/**
 * Firestore Rules Validation Script
 * 
 * This script validates the Firestore security rules syntax and structure
 * without requiring the Firebase emulator to be running.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateRulesSyntax(rulesContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic syntax checks
  if (!rulesContent.includes('rules_version = \'2\';')) {
    errors.push('Missing or incorrect rules_version declaration');
  }

  if (!rulesContent.includes('service cloud.firestore')) {
    errors.push('Missing service cloud.firestore declaration');
  }

  if (!rulesContent.includes('match /databases/{database}/documents')) {
    errors.push('Missing main database match statement');
  }

  // Check for required helper functions
  const requiredFunctions = [
    'isPlatformAdmin()',
    'hasAnyPlatformRole(',
    'hasOrgRole(',
    'hasAnyOrgRole(',
    'isOrgMember('
  ];

  for (const func of requiredFunctions) {
    if (!rulesContent.includes(func)) {
      errors.push(`Missing required helper function: ${func}`);
    }
  }

  // Check for required collections
  const requiredCollections = [
    'match /publicLinks/',
    'match /waitlist/',
    'match /users/',
    'match /orgs/',
    'match /orgs/{orgId}/stores/',
    'match /orgs/{orgId}/professionals/',
    'match /invites/'
  ];

  for (const collection of requiredCollections) {
    if (!rulesContent.includes(collection)) {
      errors.push(`Missing required collection rule: ${collection}`);
    }
  }

  // Check for security patterns
  if (!rulesContent.includes('allow read: if true')) {
    warnings.push('No public read access found - verify this is intentional');
  }

  if (!rulesContent.includes('allow write: if false')) {
    warnings.push('No explicit write denial found - verify security model');
  }

  // Check for proper role-based access
  if (!rulesContent.includes('platformAdmin')) {
    errors.push('Missing platform admin access control');
  }

  if (!rulesContent.includes('roles[')) {
    errors.push('Missing organization role-based access control');
  }

  // Check for proper validation
  if (!rulesContent.includes('request.resource.data')) {
    warnings.push('No request validation found - consider adding data validation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateRulesStructure(rulesContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for balanced braces
  const openBraces = (rulesContent.match(/\{/g) || []).length;
  const closeBraces = (rulesContent.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for proper indentation (basic check)
  const lines = rulesContent.split('\n');
  let indentLevel = 0;
  let hasIndentationIssues = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') continue;
    
    if (trimmedLine.includes('}')) {
      indentLevel--;
    }
    
    const expectedIndent = '  '.repeat(Math.max(0, indentLevel));
    if (!line.startsWith(expectedIndent) && !trimmedLine.startsWith('//')) {
      hasIndentationIssues = true;
    }
    
    if (trimmedLine.includes('{')) {
      indentLevel++;
    }
  }

  if (hasIndentationIssues) {
    warnings.push('Inconsistent indentation detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function main() {
  console.log('🔍 Validating Firestore Security Rules...\n');

  try {
    // Read the rules file
    const rulesPath = join(__dirname, '../../firestore.rules');
    const rulesContent = readFileSync(rulesPath, 'utf8');

    console.log(`📁 Rules file: ${rulesPath}`);
    console.log(`📏 File size: ${rulesContent.length} characters\n`);

    // Validate syntax
    const syntaxResult = validateRulesSyntax(rulesContent);
    console.log('🔧 Syntax Validation:');
    if (syntaxResult.isValid) {
      console.log('  ✅ All syntax checks passed');
    } else {
      console.log('  ❌ Syntax errors found:');
      syntaxResult.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    if (syntaxResult.warnings.length > 0) {
      console.log('  ⚠️  Warnings:');
      syntaxResult.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

    console.log('');

    // Validate structure
    const structureResult = validateRulesStructure(rulesContent);
    console.log('🏗️  Structure Validation:');
    if (structureResult.isValid) {
      console.log('  ✅ All structure checks passed');
    } else {
      console.log('  ❌ Structure errors found:');
      structureResult.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    if (structureResult.warnings.length > 0) {
      console.log('  ⚠️  Warnings:');
      structureResult.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

    console.log('');

    // Overall result
    const overallValid = syntaxResult.isValid && structureResult.isValid;
    const totalErrors = syntaxResult.errors.length + structureResult.errors.length;
    const totalWarnings = syntaxResult.warnings.length + structureResult.warnings.length;

    if (overallValid) {
      console.log('🎉 Rules validation successful!');
      console.log(`   ${totalWarnings} warning(s) found`);
    } else {
      console.log('❌ Rules validation failed!');
      console.log(`   ${totalErrors} error(s) found`);
      console.log(`   ${totalWarnings} warning(s) found`);
      process.exit(1);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Total lines: ${rulesContent.split('\n').length}`);
    console.log(`   - Helper functions: ${(rulesContent.match(/function \w+\(/g) || []).length}`);
    console.log(`   - Collection rules: ${(rulesContent.match(/match \/[^/]+/g) || []).length}`);
    console.log(`   - Allow statements: ${(rulesContent.match(/allow \w+:/g) || []).length}`);

  } catch (error) {
    console.error('❌ Error reading rules file:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
