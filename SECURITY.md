# Security Setup

## ⚠️ Important: Environment Variables

This project requires Supabase credentials to function. **NEVER commit real credentials to git.**

### Initial Setup

1. Copy the example environment file:
   ```bash
   cp ui/.env.example ui/.env
   ```

2. Edit `ui/.env` and add your actual Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Verify** that `.env` is in your `.gitignore` (it should be)

### Cloudflare Workers Setup

Each worker needs Supabase credentials configured as secrets:

```bash
# Navigate to each worker directory
cd workers/facebook-platform

# Set secrets (do this for each platform worker)
npx wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

npx wrangler secret put SUPABASE_SERVICE_KEY
# Enter: your-service-role-key (from Supabase Settings > API)
```

Repeat for all platform workers:
- `workers/facebook-platform`
- `workers/google-platform`
- `workers/tiktok-platform`
- `workers/newsbreak-platform`
- `workers/snapchat-platform`

### For Local Development

For local development, create a `.dev.vars` file in each worker directory:

```bash
# workers/facebook-platform/.dev.vars
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Note:** `.dev.vars` is already in `.gitignore` and will not be committed.

## Credential Rotation

If credentials have been exposed:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Click "Reset" on the exposed key
4. Update all `.env` and `.dev.vars` files with new keys
5. Update Wrangler secrets with new keys

## What NOT to Commit

❌ Never commit:
- `ui/.env`
- `workers/*/.dev.vars`
- Any file containing real API keys, tokens, or passwords

✅ Safe to commit:
- `ui/.env.example` (with placeholder values only)
- `.gitignore` files
- This security documentation
