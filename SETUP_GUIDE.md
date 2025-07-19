# 🚀 **AUTOMATED SETUP GUIDE**

## 📋 **What the Setup Script Does**

The automated setup script will:

✅ **Install all required software** (Node.js, PostgreSQL)  
✅ **Create and configure the database**  
✅ **Set up environment variables securely**  
✅ **Install all app dependencies**  
✅ **Initialize the database schema**  
✅ **Create a default admin user**  
✅ **Build the application**  
✅ **Create startup scripts**  

**Total Setup Time: 5-10 minutes** (depending on downloads)

---

## 🖥️ **For Mac/Linux Users**

### **Step 1: Run the Setup Script**
```bash
# Make sure you're in the project directory
cd /path/to/your/wedding-rsvp-platform

# Run the automated setup
./setup.sh
```

### **Step 2: Follow the Prompts**
The script will ask you for:
- **Database name** (default: `rsvp_db`)
- **Database username** (default: `rsvp_user`) 
- **Database password** (you choose this)
- **Database host** (default: `localhost`)
- **Database port** (default: `5432`)

### **Step 3: Wait for Completion**
The script will automatically:
- Install Node.js and PostgreSQL (if needed)
- Create your database and user
- Install all dependencies
- Set up the schema
- Create your admin user

### **Step 4: Start Your App**
```bash
# Start the development server
./start.sh

# Your app will be available at http://localhost:5000
```

---

## 🪟 **For Windows Users**

### **Step 1: Prerequisites**
Before running the script, manually install:
1. **Node.js 18+** from https://nodejs.org/
2. **PostgreSQL** from https://www.postgresql.org/download/windows/

### **Step 2: Run the Setup Script**
```batch
REM Make sure you're in the project directory
cd C:\path\to\your\wedding-rsvp-platform

REM Run the automated setup
setup.bat
```

### **Step 3: Follow the Prompts**
Same as Mac/Linux - the script will ask for database configuration.

### **Step 4: Start Your App**
```batch
REM Start the development server
start.bat

REM Your app will be available at http://localhost:5000
```

---

## 👤 **Default Admin Account**

The setup script automatically creates an admin user:

**🔐 Login Credentials:**
- **Username**: `admin`
- **Password**: `password1234`
- **Role**: `admin` (full access)

**🔒 Security Note:**
**IMPORTANT**: Change this password immediately after first login!

1. Login to your app at `http://localhost:5000`
2. Go to **Settings** → **Security**
3. Change your password to something secure

---

## 📁 **Files Created by Setup**

After setup completes, you'll have:

### **Configuration Files:**
- **`.env`** - Environment variables (database URL, secrets)
- **`start.sh`** / **`start.bat`** - Development server startup
- **`start-production.sh`** / **`start-production.bat`** - Production startup

### **Database:**
- **Full schema** with all tables created
- **Admin user** ready to use
- **Sample data** (if any)

---

## 🔧 **Troubleshooting**

### **Database Connection Issues:**
```bash
# Test database connection manually
psql "postgresql://rsvp_user:yourpassword@localhost:5432/rsvp_db"
```

### **Port Already in Use:**
```bash
# Change port in .env file
PORT=3000
```

### **Permission Errors (Mac/Linux):**
```bash
# Make script executable
chmod +x setup.sh
chmod +x start.sh
```

### **PostgreSQL Not Starting (Mac):**
```bash
# Start PostgreSQL service
brew services start postgresql
```

### **PostgreSQL Not Starting (Linux):**
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Windows Path Issues:**
Make sure PostgreSQL `bin` folder is added to your PATH environment variable.

---

## 🚀 **After Setup is Complete**

### **Immediate Next Steps:**
1. **Start your app**: `./start.sh` (or `start.bat` on Windows)
2. **Open browser**: Go to `http://localhost:5000`
3. **Login**: Use `admin` / `password1234`
4. **Change password**: Go to Settings → Security
5. **Create your first wedding event**!

### **Optional Configuration:**
Edit the `.env` file to add:
- **Email provider** (SendGrid, Gmail, Resend)
- **WhatsApp Business API** credentials
- **Custom domain** settings

### **Production Deployment:**
```bash
# For production deployment
./start-production.sh  # or start-production.bat
```

---

## 🎯 **What You Get After Setup**

✅ **Complete Wedding RSVP Platform**  
✅ **Admin dashboard with full access**  
✅ **Database with all tables created**  
✅ **Default admin user ready to use**  
✅ **Development server configured**  
✅ **Production deployment ready**  

**Your platform will be ready to:**
- Manage multiple wedding events
- Import and manage guest lists
- Handle RSVP responses
- Send email/WhatsApp communications
- Manage hotels and accommodations
- Coordinate transportation
- Generate analytics and reports

---

## 🆘 **Need Help?**

If the automated setup fails:

1. **Check the error message** - the script provides detailed feedback
2. **Ensure prerequisites** are installed (Node.js, PostgreSQL)
3. **Check permissions** - make sure you can write to the directory
4. **Verify PostgreSQL** is running and accessible
5. **Try manual setup** using the commands from the script individually

**The setup script is designed to be foolproof, but if you encounter issues, each step can be run manually by following the commands in the script file.**

---

**🎉 Ready to transform wedding planning? Run the setup script and start building amazing weddings! 💒✨**