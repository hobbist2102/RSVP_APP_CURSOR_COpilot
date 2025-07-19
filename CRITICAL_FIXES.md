# 🚨 **CRITICAL FIXES FOR PRODUCTION DEPLOYMENT**

## **Quick Fix Commands (Run in Order)**

### **1. Install Missing Dependencies**
```bash
npm install bcrypt qrcode bcryptjs
npm install @types/bcrypt @types/qrcode --save-dev
```

### **2. Fix Package.json bcrypt Reference**
The app currently uses `bcryptjs` but imports are looking for `bcrypt`. Update imports:

**In `server/routes/auth.ts` and `server/routes/password-reset.ts`:**
```typescript
// Change this:
import bcrypt from 'bcrypt';

// To this:
import bcrypt from 'bcryptjs';
```

### **3. Fix Schema Import Issues**
**In `server/routes/auth.ts` line 10:**
```typescript
// Change this:
import { passwordResetTokens } from '../db/schema.js';

// To this:
import { passwordResetTokens } from '../../shared/schema';
```

### **4. Add Missing Environment Variables**
Create `.env` file:
```bash
cp .env.example .env
```

Add these essential variables to `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/rsvp_db
SESSION_SECRET=your-super-secure-32-character-minimum-secret-here
NODE_ENV=production
```

### **5. Quick Type Fixes**

**Fix bcrypt imports across all files:**
```bash
# Find and replace bcrypt import
find server -name "*.ts" -exec sed -i "s/import bcrypt from 'bcrypt'/import bcrypt from 'bcryptjs'/g" {} \;
```

**Fix schema imports:**
```bash
# Fix schema path references
find server -name "*.ts" -exec sed -i "s/from '..\/db\/schema.js'/from '..\/..\/shared\/schema'/g" {} \;
```

### **6. Test the Fixes**
```bash
# Check TypeScript compilation
npm run check

# If still errors, run build test
npm run build
```

---

## **Most Critical Errors (Top 10)**

1. **bcrypt dependency** - Install bcryptjs and update imports
2. **schema import paths** - Fix relative paths to shared schema
3. **qrcode dependency** - Install qrcode package
4. **Database methods** - Missing methods in storage layer
5. **Type assertions** - User type casting issues
6. **Environment variables** - SESSION_SECRET missing
7. **Schema mismatches** - Database evolution issues
8. **API endpoint types** - Frontend/backend misalignment
9. **Missing properties** - Schema properties not found
10. **Null/undefined checks** - Type safety improvements

---

## **Emergency Production Deploy (Skip TypeScript)**

If you need to deploy immediately despite TypeScript errors:

```bash
# Build without type checking
npx vite build --mode production

# Build server without TypeScript checking
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --allow-overwrite

# Start production server
NODE_ENV=production node dist/index.js
```

**⚠️ WARNING**: This bypasses type safety. Fix TypeScript errors ASAP after deployment.

---

## **Post-Fix Validation**

After applying fixes, run:
```bash
# 1. Type check
npm run check

# 2. Build test
npm run build

# 3. Start test
npm run test:build

# 4. Security audit
npm audit --audit-level=moderate
```

---

**Estimated Fix Time**: 30-60 minutes  
**Production Ready After Fixes**: ✅ YES