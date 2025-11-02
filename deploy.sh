#!/bin/bash

# SIXSEVENHUZZ.TECH - Quick Deploy Script
# Author: Aditya Punjani

echo "🎭 SIXSEVENHUZZ.TECH - Deployment Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Installing Frontend Dependencies..."
cd frontend
npm install

echo ""
echo "🏗️  Step 2: Building Frontend..."
npm run build

echo ""
echo "📁 Step 3: Moving build to static folder..."
cd ..
rm -rf static_new
mkdir -p static_new
cp -r frontend/dist/* static_new/

echo ""
echo "🐍 Step 4: Checking Python Dependencies..."
source emoji_env/bin/activate
pip install -q -r requirements.txt

echo ""
echo "✅ Build Complete!"
echo ""
echo "🚀 Ready to Deploy!"
echo ""
echo "Choose your deployment option:"
echo "1. Run locally: python app.py"
echo "2. Deploy to Vercel: cd frontend && vercel"
echo "3. Deploy to Railway: Connect GitHub repo"
echo "4. Deploy to Render: Connect GitHub repo"
echo ""
echo "🌐 Your domain: sixsevenhuzz.tech"
echo "📝 See SIXSEVENHUZZ_README.md for full instructions"
echo ""
echo "🎉 Built with 💜 by Aditya Punjani"
