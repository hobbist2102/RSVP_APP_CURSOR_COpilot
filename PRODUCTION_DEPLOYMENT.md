# Production Deployment Guide

This guide covers deploying the RSVP app to production environments including VPS, cloud platforms, and Docker.

## 🚀 Quick Start with Docker

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd rsvp-app
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your production values:
```bash
# Required configurations
DATABASE_URL=postgresql://user:password@localhost:5432/rsvp_db
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
NODE_ENV=production

# Email provider (choose one)
SENDGRID_API_KEY=your-sendgrid-api-key
# OR
RESEND_API_KEY=your-resend-api-key
# OR
GMAIL_ACCOUNT=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

### 3. Deploy with Docker Compose
```bash
docker-compose up -d
```

The app will be available at `http://localhost:5000`

## 🔧 Manual VPS Deployment

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Nginx (recommended)
- SSL certificates

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Database Setup
```bash
sudo -u postgres createuser --interactive rsvp_user
sudo -u postgres createdb rsvp_db
sudo -u postgres psql -c "ALTER USER rsvp_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rsvp_db TO rsvp_user;"
```

### 3. Application Deployment
```bash
# Clone repository
git clone <your-repo-url> /var/www/rsvp-app
cd /var/www/rsvp-app

# Install dependencies
npm ci --production

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with your values

# Build application
npm run build

# Push database schema
npm run db:push

# Start with PM2
pm2 start dist/index.js --name "rsvp-app"
pm2 save
pm2 startup
```

### 4. Nginx Configuration
Create `/etc/nginx/sites-available/rsvp-app`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/rsvp-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ☁️ Cloud Platform Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `dist/public`

### Railway
1. Connect repository to Railway
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically

### DigitalOcean App Platform
1. Create new app from GitHub
2. Select Node.js buildpack
3. Add managed PostgreSQL database
4. Configure environment variables

## 🔒 Security Checklist

### Environment Security
- [ ] Use strong `SESSION_SECRET` (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] Use HTTPS in production
- [ ] Enable firewall (UFW/iptables)

### Database Security
- [ ] Create dedicated database user
- [ ] Use strong database password
- [ ] Enable PostgreSQL SSL
- [ ] Restrict database access by IP
- [ ] Regular database backups

### Application Security
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Configure proper CORS
- [ ] Use secure cookies

## 📊 Monitoring & Maintenance

### Process Management with PM2
```bash
# Check status
pm2 status

# View logs
pm2 logs rsvp-app

# Restart application
pm2 restart rsvp-app

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U rsvp_user rsvp_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U rsvp_user rsvp_db < backup_20250101_120000.sql
```

### Log Management
```bash
# Rotate PM2 logs
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U rsvp_user -d rsvp_db -c "SELECT 1;"
```

**Port Already in Use**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

**Permission Errors**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/rsvp-app
sudo chmod -R 755 /var/www/rsvp-app
```

**Memory Issues**
```bash
# Check system resources
free -h
df -h

# Increase Node.js memory limit
node --max-old-space-size=4096 dist/index.js
```

### Health Checks
The application provides health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database connectivity check

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session encryption key |
| `NODE_ENV` | Yes | Set to 'production' |
| `PORT` | No | Server port (default: 5000) |
| `HOSTNAME` | No | Server hostname (default: 0.0.0.0) |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed origins |
| Email providers | Choose one | SENDGRID_API_KEY, RESEND_API_KEY, etc. |

## 🔄 Update Process

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Update database if needed
npm run db:push

# Restart application
pm2 restart rsvp-app
```

## 📞 Support

For deployment issues:
1. Check application logs: `pm2 logs rsvp-app`
2. Verify environment variables
3. Test database connectivity
4. Check Nginx configuration
5. Review firewall settings

## 🔗 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)