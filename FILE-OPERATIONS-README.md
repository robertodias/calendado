#  Better File Operations for Calendado

This project now includes better alternatives to PowerShell for file operations.

##  Available Tools

### 1. Node.js File Operations Script (ile-ops.js)

A safe, reliable script for file operations that preserves UTF-8 encoding.

**Usage:**
`ash
# Replace text in a file
node file-ops.js replace functions/src/lib/email.ts "old text" "new text"

# Find files matching a pattern
node file-ops.js findFiles "*.ts"

# Show file content with line numbers
node file-ops.js show functions/src/lib/email.ts 30 40
`

### 2. Git Bash Helpers (git-bash-helpers.sh)

Unix-style commands for Windows using Git Bash.

**Setup:**
`ash
# Load the helpers
source git-bash-helpers.sh

# Use the functions
replace_text "functions/src/lib/email.ts" "old text" "new text"
show_file "functions/src/lib/email.ts" 30 40
check_encoding "functions/src/lib/i18n.ts"
`

### 3. VS Code Tasks (.vscode/tasks.json)

Integrated file operations through VS Code's task runner.

**Usage:**
1. Press Ctrl+Shift+P
2. Type "Tasks: Run Task"
3. Select "Replace Text in File", "Find Files", or "Show File Content"

##  Why These Tools Are Better

-  **Preserves UTF-8 encoding** - No more character corruption
-  **Handles special characters** - Works with {{, }}, backticks, etc.
-  **Cross-platform** - Works on Windows, Mac, Linux
-  **Reliable** - No PowerShell parsing issues
-  **Safe** - Creates backups before making changes

##  Avoid PowerShell For:

- Text replacement operations
- File content manipulation
- UTF-8 encoding sensitive operations
- Complex regex patterns

##  Use These Tools For:

- File find and replace
- Content validation
- Encoding checks
- Safe text operations

##  Quick Start

1. **For simple operations:** Use VS Code's built-in Find & Replace (Ctrl+H)
2. **For automated operations:** Use 
ode file-ops.js
3. **For Unix-style commands:** Use Git Bash with git-bash-helpers.sh

##  Examples

`ash
# Fix a common issue
node file-ops.js replace functions/src/lib/email.ts "old pattern" "new pattern"

# Check file encoding
source git-bash-helpers.sh
check_encoding functions/src/lib/i18n.ts

# Show specific lines
node file-ops.js show functions/src/lib/email.ts 30 40
`

This setup ensures reliable file operations without PowerShell issues! 
