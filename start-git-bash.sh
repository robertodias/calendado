#!/bin/bash
# Quick start script for Calendado development with Git Bash
# Save as: start-git-bash.sh

echo " Starting Calendado Development with Git Bash"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo " Error: Not in Calendado project directory"
    echo "Please navigate to your Calendado project folder first"
    exit 1
fi

# Load helper functions
echo " Loading helper functions..."
source git-bash-helpers.sh

# Show current directory
echo " Current directory: C:\Users\Usuario\Development\calendado"

# Show available commands
echo ""
echo " Available commands:"
echo "  build_and_deploy  - Build and deploy Firebase functions"
echo "  start_dev        - Start development server"
echo "  show_usage       - Show all available functions"
echo ""

# Check if functions directory exists
if [ -d "functions" ]; then
    echo " Functions directory found"
    echo " You can now use: build_and_deploy"
else
    echo "  Functions directory not found"
fi

# Check if package.json exists
if [ -f "package.json" ]; then
    echo " Frontend package.json found"
    echo " You can now use: start_dev"
else
    echo "  Frontend package.json not found"
fi

echo ""
echo " Git Bash setup complete!"
echo "Type 'show_usage' to see all available commands"
