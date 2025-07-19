@echo off
setlocal enabledelayedexpansion

REM 🚀 Wedding RSVP Platform - Windows Automated Setup Script
REM This script will install everything needed and set up your database automatically

echo ==================================================
echo 🎉 Wedding RSVP Platform - Windows Setup
echo ==================================================
echo.

REM Check if Node.js is installed
echo 🔹 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18 or higher from https://nodejs.org/
    echo After installing Node.js, rerun this script.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js installed: !NODE_VERSION!
)

REM Check if PostgreSQL is installed
echo 🔹 Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL not found. 
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo Make sure to:
    echo   1. Remember your postgres user password
    echo   2. Add PostgreSQL to your PATH
    echo   3. Start the PostgreSQL service
    echo After installing PostgreSQL, rerun this script.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL is installed
)

REM Get database configuration
echo.
echo 📝 Database Configuration
echo Please provide the following information:
echo.

set /p DB_NAME=Database name (default: rsvp_db): 
if "!DB_NAME!"=="" set DB_NAME=rsvp_db

set /p DB_USER=Database username (default: rsvp_user): 
if "!DB_USER!"=="" set DB_USER=rsvp_user

set /p DB_PASSWORD=Database password: 

set /p DB_HOST=Database host (default: localhost): 
if "!DB_HOST!"=="" set DB_HOST=localhost

set /p DB_PORT=Database port (default: 5432): 
if "!DB_PORT!"=="" set DB_PORT=5432

REM Create database and user
echo 🔹 Creating database and user...
psql -U postgres -c "CREATE DATABASE %DB_NAME%;" 2>nul
psql -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" 2>nul
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" 2>nul
psql -U postgres -c "ALTER USER %DB_USER% CREATEDB;" 2>nul

REM Construct database URL
set DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%

REM Generate session secret
echo 🔹 Generating session secret...
for /f "tokens=*" %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(64, 0)"') do set SESSION_SECRET=%%i

REM Create .env file
echo 🔹 Creating environment configuration...
(
echo # Database Configuration
echo DATABASE_URL=%DATABASE_URL%
echo.
echo # Security
echo SESSION_SECRET=%SESSION_SECRET%
echo NODE_ENV=development
echo.
echo # Server Configuration
echo PORT=5000
echo HOSTNAME=0.0.0.0
echo.
echo # CORS Configuration
echo ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
echo.
echo # Email Configuration (Optional - configure later^)
echo # SENDGRID_API_KEY=your-sendgrid-api-key
echo # RESEND_API_KEY=your-resend-api-key
echo # GMAIL_ACCOUNT=your-email@gmail.com
echo # GMAIL_PASSWORD=your-app-specific-password
echo.
echo # WhatsApp Configuration (Optional - configure later^)
echo # WHATSAPP_PHONE_ID=your-whatsapp-phone-id
echo # WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
echo.
echo # Development
echo DEBUG=false
) > .env

echo ✅ Environment file created: .env

REM Install dependencies
echo 🔹 Installing application dependencies...
if not exist package.json (
    echo ❌ package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Test database connection
echo 🔹 Testing database connection...
psql "%DATABASE_URL%" -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Database connection failed. Please check your configuration.
    pause
    exit /b 1
)
echo ✅ Database connection successful

REM Initialize schema
echo 🔹 Initializing database schema...
npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize database schema
    pause
    exit /b 1
)
echo ✅ Database schema initialized successfully

REM Create admin user
echo 🔹 Creating default admin user...

REM Create temporary script to add admin user
(
echo const bcrypt = require('bcryptjs'^);
echo const { storage } = require('./server/storage'^);
echo.
echo async function createAdminUser(^) {
echo   try {
echo     // Check if admin already exists
echo     const existingAdmin = await storage.getUserByUsername('admin'^);
echo     if (existingAdmin^) {
echo       console.log('✅ Admin user already exists'^);
echo       return;
echo     }
echo.
echo     // Create admin user with hashed password
echo     const hashedPassword = await bcrypt.hash('password1234', 10^);
echo     await storage.createUser({
echo       username: 'admin',
echo       name: 'Administrator',
echo       email: 'admin@example.com',
echo       password: hashedPassword,
echo       role: 'admin'
echo     }^);
echo.
echo     console.log('✅ Admin user created successfully'^);
echo     console.log('   Username: admin'^);
echo     console.log('   Password: password1234'^);
echo     console.log('   Role: admin'^);
echo.
echo   } catch (error^) {
echo     console.error('❌ Failed to create admin user:', error.message^);
echo   } finally {
echo     process.exit(0^);
echo   }
echo }
echo.
echo createAdminUser(^);
) > create-admin.js

REM Run the script to create admin user
node create-admin.js

REM Clean up the temporary script
del create-admin.js

echo ✅ Default admin user created
echo    👤 Username: admin
echo    🔑 Password: password1234
echo    🛡️  Role: admin

REM Build application
echo 🔹 Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build application
    pause
    exit /b 1
)
echo ✅ Application built successfully

REM Create startup scripts
echo 🔹 Creating startup scripts...

REM Development startup script
(
echo @echo off
echo echo 🚀 Starting Wedding RSVP Platform...
echo echo 📊 Environment: development
echo echo 🌐 Server will be available at: http://localhost:5000
echo echo.
echo npm run dev
) > start.bat

REM Production startup script
(
echo @echo off
echo echo 🚀 Starting Wedding RSVP Platform (Production^)...
echo set NODE_ENV=production
echo npm run build
echo npm start
) > start-production.bat

echo ✅ Startup scripts created

REM Final instructions
echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Start the development server:
echo    start.bat
echo.
echo 2. Open your browser and go to:
echo    http://localhost:5000
echo.
echo 3. Login with the default admin account:
echo    👤 Username: admin
echo    🔑 Password: password1234
echo.
echo 4. Change the admin password from the settings page!
echo.
echo 5. Start planning weddings!
echo.
echo 📁 Important Files:
echo • .env - Environment configuration
echo • start.bat - Development server startup
echo • start-production.bat - Production server startup
echo.
echo 🔧 Optional Configuration:
echo • Edit .env to add email providers (SendGrid, Gmail, etc.)
echo • Edit .env to add WhatsApp Business API credentials
echo.
echo Your Wedding RSVP Platform is ready to use! 🎊
echo.
pause