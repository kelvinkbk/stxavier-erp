#!/bin/bash

# Deploy St. Xavier ERP to cloud platforms
echo "🚀 Starting deployment of St. Xavier ERP..."

# Build the application
echo "📦 Building application..."
npm run build:web

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Vercel (Primary)
echo "🌐 Deploying to Vercel..."
npx vercel --prod --token $VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to Vercel!"
    echo "🔗 Your app is live at: https://stxavier-erp.vercel.app"
else
    echo "⚠️ Vercel deployment failed, trying alternatives..."

    # Deploy to Netlify (Fallback)
    echo "🌐 Deploying to Netlify..."
    npx netlify deploy --prod --dir=dist --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID

    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to Netlify!"
    else
        echo "❌ All deployments failed!"
        exit 1
    fi
fi

# Health check
echo "🔍 Running health check..."
sleep 10
curl -f https://stxavier-erp.vercel.app || echo "⚠️ Health check failed"

echo "🎉 Deployment complete! Your ERP system is now running 24/7 in the cloud."
