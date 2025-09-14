# 🚀 Always-On Deployment Guide for St. Xavier ERP

## Overview

This guide will help you deploy your ERP application to the cloud so it stays active 24/7, even when your laptop is turned off.

## Quick Deploy (Recommended)

### Option 1: Vercel (Fastest & Free)

```bash
npm run deploy:auto
```

Your app will be live at: `https://stxavier-erp.vercel.app`

### Option 2: One-Click Deploy Commands

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Railway
npm run deploy:railway

# Deploy with Docker
npm run deploy:docker
```

## Cloud Platforms Available

### 1. ✅ Vercel (Currently Configured)

- **Status**: Ready to deploy
- **Cost**: Free tier (sufficient for your app)
- **URL**: https://stxavier-erp.vercel.app
- **Features**: Auto-scaling, CDN, SSL certificates

### 2. 🌐 Netlify (Backup Option)

- **Cost**: Free tier available
- **Features**: Continuous deployment, forms handling

### 3. 🚂 Railway

- **Cost**: $5/month (more powerful)
- **Features**: Database hosting, auto-scaling

### 4. 🐳 Docker + Cloud VPS

- **Cost**: $5-20/month
- **Features**: Full control, custom configurations

## Monitoring & Uptime

### Automatic Monitoring

Your app includes built-in uptime monitoring:

```bash
node scripts/monitor.js
```

### Features:

- ✅ Health checks every 5 minutes
- 🔄 Automatic failover to backup URLs
- 📱 Alert notifications (optional)
- 📊 Response time tracking

## Environment Setup

### Required Environment Variables (Already Configured):

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Automatic Deployment

### GitHub Actions (CI/CD)

- Automatically deploys when you push to `main` branch
- Runs tests and builds before deployment
- Handles multiple deployment targets

### Manual Deployment

1. Build your app: `npm run build:web`
2. Deploy: `npm run deploy:auto`
3. Monitor: `node scripts/monitor.js`

## Cost Breakdown

| Platform   | Free Tier   | Paid Plans  | Best For     |
| ---------- | ----------- | ----------- | ------------ |
| Vercel     | 100GB/month | $20/month   | Static apps  |
| Netlify    | 100GB/month | $19/month   | JAMstack     |
| Railway    | $5 credit   | $5/month    | Full-stack   |
| Docker VPS | -           | $5-20/month | Custom needs |

## Security Features

✅ **Included Security Headers**:

- Content Security Policy
- XSS Protection
- Frame Options
- SSL/HTTPS Encryption

## Performance Features

✅ **Optimization Features**:

- Static file caching
- CDN distribution
- Gzip compression
- Image optimization

## Support & Troubleshooting

### Common Issues:

1. **Build fails**: Check `npm run build:web` locally
2. **Environment variables**: Verify Firebase config
3. **404 errors**: Check routing configuration

### Get Help:

- Check deployment logs in platform dashboard
- Run health check: `curl -I https://stxavier-erp.vercel.app`
- Monitor uptime: `node scripts/monitor.js`

## Next Steps

1. **Deploy Now**: Run `npm run deploy:auto`
2. **Set up monitoring**: Configure webhook alerts
3. **Test access**: Visit your live URL
4. **Share with users**: Your ERP is now accessible 24/7!

---

🎉 **Congratulations!** Your St. Xavier ERP system will now be available 24/7 in the cloud, accessible from anywhere in the world, even when your laptop is off!
