#!/bin/bash
# Git Bash helper script for Calendado project

echo "�️  Git Bash Helpers for Calendado Project"
echo "=========================================="

# Function to safely replace text in files
replace_text() {
    local file="$1"
    local old_text="$2"
    local new_text="$3"
    
    if [ -f "$file" ]; then
        # Create backup
        cp "$file" "$file.backup"
        
        # Replace text using sed
        sed -i "s|$old_text|$new_text|g" "$file"
        
        echo "✅ Replaced text in $file"
        echo "� Backup created: $file.backup"
    else
        echo "❌ File not found: $file"
    fi
}

# Function to show file content with line numbers
show_file() {
    local file="$1"
    local start_line="${2:-1}"
    local end_line="${3:-20}"
    
    if [ -f "$file" ]; then
        echo "� Content of $file (lines $start_line-$end_line):"
        echo "----------------------------------------"
        sed -n "${start_line},${end_line}p" "$file" | nl -v$start_line
    else
        echo "❌ File not found: $file"
    fi
}

# Function to check file encoding
check_encoding() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "� Encoding of $file:"
        file -bi "$file"
    else
        echo "❌ File not found: $file"
    fi
}

# Function to build and deploy functions
build_and_deploy() {
    echo "� Building functions..."
    cd functions
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
        cd ..
        echo "� Deploying functions..."
        firebase deploy --only functions:sendWaitlistConfirmationFn
    else
        echo "❌ Build failed"
        cd ..
    fi
}

# Function to run development server
start_dev() {
    echo "� Starting development server..."
    npm run dev
}

# Show usage
show_usage() {
    echo "Usage: source git-bash-helpers.sh"
    echo ""
    echo "Available functions:"
    echo "  replace_text <file> <old_text> <new_text>"
    echo "  show_file <file> [start_line] [end_line]"
    echo "  check_encoding <file>"
    echo "  build_and_deploy"
    echo "  start_dev"
    echo ""
    echo "Examples:"
    echo "  replace_text 'functions/src/lib/email.ts' 'old text' 'new text'"
    echo "  show_file 'functions/src/lib/email.ts' 30 40"
    echo "  check_encoding 'functions/src/lib/i18n.ts'"
    echo "  build_and_deploy"
    echo "  start_dev"
}

# Export functions
export -f replace_text
export -f show_file
export -f check_encoding
export -f build_and_deploy
export -f start_dev
export -f show_usage

echo "✅ Git Bash helpers loaded!"
echo "Type 'show_usage' for available commands"
