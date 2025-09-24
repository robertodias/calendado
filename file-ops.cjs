#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function showUsage() {
  console.log('Usage: node file-ops.js <command> [args...]');
  console.log('');
  console.log('Commands:');
  console.log('  replace <file> <old_text> <new_text>  - Replace text in file');
  console.log('  findFiles <pattern>                   - Find files matching pattern');
  console.log('  show <file> [start] [end]             - Show file content with line numbers');
  console.log('');
  console.log('Examples:');
  console.log('  node file-ops.js replace file.txt "old" "new"');
  console.log('  node file-ops.js findFiles "*.ts"');
  console.log('  node file-ops.js show file.txt 10 20');
}

function replaceText(filePath, oldText, newText) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`‚ùå File not found: ${filePath}`);
      return;
    }

    // Create backup
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Ì≥Å Backup created: ${backupPath}`);

    // Read file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace text
    const newContent = content.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
    
    // Write back
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`‚úÖ Replaced text in ${filePath}`);
    
  } catch (error) {
    console.log(`‚ùå Error: ${error.message}`);
  }
}

function findFiles(pattern) {
  try {
    const { execSync } = require('child_process');
    const result = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' });
    console.log('Ì≥Å Found files:');
    console.log(result);
  } catch (error) {
    console.log(`‚ùå Error: ${error.message}`);
  }
}

function showFile(filePath, startLine = 1, endLine = 20) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`‚ùå File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine);

    console.log(`Ì≥Ñ Content of ${filePath} (lines ${startLine}-${end}):`);
    console.log('----------------------------------------');
    
    for (let i = start; i < end; i++) {
      console.log(`${(i + 1).toString().padStart(4)} | ${lines[i]}`);
    }
    
  } catch (error) {
    console.log(`‚ùå Error: ${error.message}`);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'replace':
    if (process.argv.length < 5) {
      console.log('‚ùå Usage: node file-ops.js replace <file> <old_text> <new_text>');
      process.exit(1);
    }
    replaceText(process.argv[3], process.argv[4], process.argv[5]);
    break;
    
  case 'findFiles':
    if (process.argv.length < 3) {
      console.log('‚ùå Usage: node file-ops.js findFiles <pattern>');
      process.exit(1);
    }
    findFiles(process.argv[3]);
    break;
    
  case 'show':
    if (process.argv.length < 3) {
      console.log('‚ùå Usage: node file-ops.js show <file> [start] [end]');
      process.exit(1);
    }
    const start = parseInt(process.argv[4]) || 1;
    const end = parseInt(process.argv[5]) || 20;
    showFile(process.argv[3], start, end);
    break;
    
  default:
    showUsage();
    break;
}
