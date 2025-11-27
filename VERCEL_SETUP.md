# Vercel Setup Instructions

The build failed because Vercel is using old database credentials. You must update them manually.

## 1. Go to Vercel Dashboard
Open [https://vercel.com/dashboard](https://vercel.com/dashboard) and select your project (`graky-store`).

## 2. Go to Settings > Environment Variables
Click on the **Settings** tab, then **Environment Variables** on the left.

## 3. Update These Variables
Copy and paste the exact values below to update (or add) them:

### DATABASE_URL (Crucial for "Access denied" error)
```
mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true
```

### GOOGLE_CLIENT_ID (For Google Login)
```
1031142005840-oq09mjp3ttu1t0pn07shtmqrtjbol1dp.apps.googleusercontent.com
```

### GOOGLE_CLIENT_SECRET (For Google Login)
```
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
```

### NEXTAUTH_URL
```
https://your-app-domain.vercel.app
```
*(Replace with your actual Vercel domain)*

## 4. Redeploy
After updating the variables, go to the **Deployments** tab and click **Redeploy** on the latest commit.
