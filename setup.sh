#!/bin/bash

# 🚀 Wedding RSVP Platform - Automated Setup Script
# This script will install everything needed and set up your database automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "🎉 Wedding RSVP Platform - Automated Setup"
    echo "=================================================="
    echo -e "${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Please don't run this script as root!"
        exit 1
    fi
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command -v apt-get >/dev/null 2>&1; then
            DISTRO="ubuntu"
        elif command -v yum >/dev/null 2>&1; then
            DISTRO="centos"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    print_step "Detected OS: $OS"
}

# Install Node.js
install_nodejs() {
    print_step "Installing Node.js..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js already installed: $NODE_VERSION"
        return
    fi
    
    if [[ "$OS" == "macos" ]]; then
        # Install Homebrew if not present
        if ! command -v brew >/dev/null 2>&1; then
            print_step "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node
    elif [[ "$OS" == "linux" && "$DISTRO" == "ubuntu" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == "linux" && "$DISTRO" == "centos" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    print_success "Node.js installed successfully"
}

# Install PostgreSQL
install_postgresql() {
    print_step "Installing PostgreSQL..."
    
    if command -v psql >/dev/null 2>&1; then
        print_success "PostgreSQL already installed"
        return
    fi
    
    if [[ "$OS" == "macos" ]]; then
        brew install postgresql
        brew services start postgresql
    elif [[ "$OS" == "linux" && "$DISTRO" == "ubuntu" ]]; then
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif [[ "$OS" == "linux" && "$DISTRO" == "centos" ]]; then
        sudo yum install -y postgresql postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    print_success "PostgreSQL installed successfully"
}

# Setup database user and database
setup_database() {
    print_step "Setting up database..."
    
    echo
    echo -e "${CYAN}📝 Database Configuration${NC}"
    echo "Please provide the following information:"
    echo
    
    # Get database configuration from user
    read -p "Database name (default: rsvp_db): " DB_NAME
    DB_NAME=${DB_NAME:-rsvp_db}
    
    read -p "Database username (default: rsvp_user): " DB_USER
    DB_USER=${DB_USER:-rsvp_user}
    
    read -s -p "Database password: " DB_PASSWORD
    echo
    
    read -p "Database host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "Database port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    # Create database and user
    print_step "Creating database and user..."
    
    # Try to create database as postgres user
    if [[ "$OS" == "macos" ]]; then
        createdb "$DB_NAME" 2>/dev/null || true
        psql -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
        psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
        psql -d postgres -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || true
    else
        sudo -u postgres createdb "$DB_NAME" 2>/dev/null || true
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
        sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || true
    fi
    
    # Construct database URL
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    print_success "Database setup completed"
}

# Generate secure session secret
generate_session_secret() {
    if command -v openssl >/dev/null 2>&1; then
        SESSION_SECRET=$(openssl rand -hex 32)
    else
        # Fallback method
        SESSION_SECRET=$(date +%s | sha256sum | base64 | head -c 64)
    fi
}

# Create environment file
create_env_file() {
    print_step "Creating environment configuration..."
    
    generate_session_secret
    
    cat > .env << EOF
# Database Configuration
DATABASE_URL=$DATABASE_URL

# Security
SESSION_SECRET=$SESSION_SECRET
NODE_ENV=development

# Server Configuration
PORT=5000
HOSTNAME=0.0.0.0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Email Configuration (Optional - configure later)
# SENDGRID_API_KEY=your-sendgrid-api-key
# RESEND_API_KEY=your-resend-api-key
# GMAIL_ACCOUNT=your-email@gmail.com
# GMAIL_PASSWORD=your-app-specific-password

# WhatsApp Configuration (Optional - configure later)
# WHATSAPP_PHONE_ID=your-whatsapp-phone-id
# WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token

# Development
DEBUG=false
EOF

    print_success "Environment file created: .env"
}

# Install npm dependencies
install_dependencies() {
    print_step "Installing application dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully"
}

# Test database connection
test_database_connection() {
    print_step "Testing database connection..."
    
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed. Please check your configuration."
        return 1
    fi
}

# Initialize database schema
initialize_schema() {
    print_step "Initializing database schema..."
    
    npm run db:push
    print_success "Database schema initialized successfully"
}

# Create admin user
create_admin_user() {
    print_step "Creating default admin user..."
    
    # Create a temporary script to add admin user
    cat > create-admin.js << 'EOF'
const bcrypt = require('bcryptjs');
const { storage } = require('./server/storage');

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user with hashed password
    const hashedPassword = await bcrypt.hash('password1234', 10);
    await storage.createUser({
      username: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully');
    console.log('   Username: admin');
    console.log('   Password: password1234');
    console.log('   Role: admin');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
EOF

    # Run the script to create admin user
    node create-admin.js
    
    # Clean up the temporary script
    rm create-admin.js
    
    print_success "Default admin user created"
    echo "   👤 Username: admin"
    echo "   🔑 Password: password1234"
    echo "   🛡️  Role: admin"
}

# Build application
build_application() {
    print_step "Building application..."
    
    npm run build
    print_success "Application built successfully"
}

# Create startup script
create_startup_script() {
    print_step "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Wedding RSVP Platform..."
echo "📊 Environment: $(cat .env | grep NODE_ENV | cut -d'=' -f2)"
echo "🌐 Server will be available at: http://localhost:5000"
echo
npm run dev
EOF
    
    chmod +x start.sh
    print_success "Startup script created: ./start.sh"
}

# Create production startup script
create_production_script() {
    cat > start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Wedding RSVP Platform (Production)..."
export NODE_ENV=production
npm run build
npm start
EOF
    
    chmod +x start-production.sh
    print_success "Production script created: ./start-production.sh"
}

# Final instructions
show_final_instructions() {
    echo
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "1. Start the development server:"
    echo "   ${YELLOW}./start.sh${NC}"
    echo
    echo "2. Open your browser and go to:"
    echo "   ${YELLOW}http://localhost:5000${NC}"
    echo
    echo "3. Login with the default admin account:"
    echo "   👤 Username: ${YELLOW}admin${NC}"
    echo "   🔑 Password: ${YELLOW}password1234${NC}"
    echo
    echo "4. Change the admin password from the settings page!"
    echo
    echo "5. Start planning weddings!"
    echo
    echo -e "${CYAN}📁 Important Files:${NC}"
    echo "• ${YELLOW}.env${NC} - Environment configuration"
    echo "• ${YELLOW}start.sh${NC} - Development server startup"
    echo "• ${YELLOW}start-production.sh${NC} - Production server startup"
    echo
    echo -e "${CYAN}🔧 Optional Configuration:${NC}"
    echo "• Edit ${YELLOW}.env${NC} to add email providers (SendGrid, Gmail, etc.)"
    echo "• Edit ${YELLOW}.env${NC} to add WhatsApp Business API credentials"
    echo
    echo -e "${GREEN}Your Wedding RSVP Platform is ready to use! 🎊${NC}"
}

# Main execution
main() {
    print_header
    
    check_root
    detect_os
    
    print_step "Starting automated setup..."
    
    install_nodejs
    install_postgresql
    setup_database
    create_env_file
    install_dependencies
    test_database_connection
    initialize_schema
    create_admin_user
    build_application
    create_startup_script
    create_production_script
    
    show_final_instructions
}

# Error handling
trap 'print_error "Setup failed. Please check the error messages above."; exit 1' ERR

# Run main function
main "$@"