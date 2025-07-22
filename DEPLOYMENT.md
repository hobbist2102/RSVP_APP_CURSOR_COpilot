# Vercel Deployment Guide

## Prerequisites

Ensure you have:
- A Vercel account
- Vercel CLI installed globally: `npm install -g vercel`
- A GitHub repository with the v4 folder

## Step 1: Navigate to the v4 Directory

**IMPORTANT:** You must deploy from inside the `v4` directory as it contains all the application files.

```bash
cd v4
```

## Step 2: Verify the Project Structure

Ensure you're in the correct directory with all required files:

```bash
ls -la
```

You should see:
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `vercel.json`
- `src/` directory
- All other configuration files

## Step 3: Initialize Vercel Project

From within the `v4` directory, run:

```bash
vercel login
vercel init
```

When prompted:
- **Project name**: `myrsvp` (or your preferred name)
- **Framework**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## Step 4: Configure Environment Variables

Add these environment variables in your Vercel dashboard or via CLI:

```bash
# Required environment variables
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production

# Optional (for development)
vercel env add NEXTAUTH_URL development
vercel env add NEXTAUTH_SECRET development
vercel env add DATABASE_URL development
```

**Environment Variable Values:**

1. **NEXTAUTH_URL**: Your production domain (e.g., `https://your-app.vercel.app`)
2. **NEXTAUTH_SECRET**: Generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```
3. **DATABASE_URL**: Your PostgreSQL connection string

## Step 5: Deploy

From the `v4` directory, run:

```bash
vercel --prod
```

## Vercel Configuration (vercel.json)

The project includes a `vercel.json` file with optimized settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

## Troubleshooting

### Build Fails with Module Not Found

If you get module resolution errors:
1. Ensure you're deploying from the `v4` directory
2. Check that `tsconfig.json` has correct path mappings
3. Verify all imports use the `@/` alias correctly

### Environment Variables Missing

1. Check Vercel dashboard Environment Variables section
2. Ensure variables are set for the correct environment (production/development)
3. Redeploy after adding environment variables

### Database Connection Issues

1. Verify your `DATABASE_URL` is correct and accessible from Vercel
2. Check that your database allows connections from Vercel's IP ranges
3. Test the connection string locally first

## Post-Deployment

After successful deployment:

1. **Test all pages**: Navigate through the application
2. **Check authentication**: Test login/logout functionality
3. **Verify database**: Ensure data operations work
4. **Monitor logs**: Check Vercel function logs for any errors

## Continuous Deployment

To enable automatic deployments:

1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `v4` in Vercel project settings
3. Enable automatic deployments from your main branch

## Important Notes

- **Always deploy from the `v4` directory** - this is your project root
- The `v4` folder contains everything needed for the application
- Don't deploy from the parent directory as it will cause module resolution issues
- Environment variables must be set in Vercel before deployment

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify you're in the correct directory (`v4`)
3. Ensure all environment variables are set
4. Check that the build passes locally with `npm run build`