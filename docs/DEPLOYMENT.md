# Deployment Guide

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 12+
- Nginx (for production reverse proxy)
- SSL certificate (recommended)
- Moodle instance with Web Services enabled

## Production Deployment Steps

### 1. Server Setup

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
```

Install PM2 for process management:
```bash
sudo npm install -g pm2
```

### 2. Database Setup

Create database and user:
```bash
sudo -u postgres psql

CREATE DATABASE lms_db;
CREATE USER lms_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

Run migrations:
```bash
psql -U lms_user -d lms_db -f src/migrations/001_initial_schema.sql
```

### 3. Application Setup

Clone repository:
```bash
cd /var/www
git clone https://github.com/PTiming/random.git lms
cd lms
```

Install dependencies:
```bash
npm ci --production
```

Build application:
```bash
npm run build
```

### 4. Environment Configuration

Create production environment file:
```bash
cp .env.example .env
```

Edit `.env` with production values:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=your_secure_password

# JWT (Generate strong random secrets)
JWT_SECRET=your_production_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_production_refresh_secret_min_32_chars

# Moodle
MOODLE_URL=https://moodle.yourdomain.com
MOODLE_TOKEN=your_moodle_webservice_token

# Application
PORT=3000
NODE_ENV=production
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=warn
```

**Security Note:** Generate strong secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Seed Database

Run the seeding script:
```bash
npm run build
node dist/utils/seed.js
```

### 6. PM2 Process Management

Create PM2 ecosystem file:
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lms-api',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
  }],
};
EOF
```

Start application:
```bash
mkdir logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### 7. Nginx Setup

Install Nginx:
```bash
sudo apt install -y nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/lms
```

Add configuration:
```nginx
upstream lms_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name lms.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lms.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/lms.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lms.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Logging
    access_log /var/log/nginx/lms_access.log;
    error_log /var/log/nginx/lms_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy settings
    location / {
        proxy_pass http://lms_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Client body size limit
    client_max_body_size 50M;
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate with Let's Encrypt

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain certificate:
```bash
sudo certbot --nginx -d lms.yourdomain.com
```

Auto-renewal is configured by default. Test it:
```bash
sudo certbot renew --dry-run
```

### 9. Firewall Configuration

Configure UFW:
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 10. Monitoring

View PM2 logs:
```bash
pm2 logs lms-api
pm2 monit
```

View application status:
```bash
pm2 status
pm2 info lms-api
```

### 11. Backup Strategy

Database backup script:
```bash
cat > /opt/backup-lms-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/lms"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U lms_user lms_db | gzip > $BACKUP_DIR/lms_db_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "lms_db_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-lms-db.sh
```

Add to crontab:
```bash
sudo crontab -e
# Add this line for daily backup at 2 AM
0 2 * * * /opt/backup-lms-db.sh
```

### 12. Updates and Maintenance

To update the application:
```bash
cd /var/www/lms
git pull origin main
npm ci --production
npm run build
pm2 restart lms-api
```

## Docker Deployment (Alternative)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lms_db
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  lms:
    build: .
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: lms_db
      DB_USER: lms_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      MOODLE_URL: ${MOODLE_URL}
      MOODLE_TOKEN: ${MOODLE_TOKEN}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

Build and run:
```bash
docker-compose up -d
```

## Health Checks

The application includes a health check endpoint:
```bash
curl https://lms.yourdomain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### Application won't start
```bash
pm2 logs lms-api --lines 100
```

### Database connection issues
```bash
psql -U lms_user -d lms_db -h localhost
```

### Nginx configuration test
```bash
sudo nginx -t
```

### View all logs
```bash
tail -f /var/log/nginx/lms_error.log
pm2 logs
```

## Security Checklist

- [ ] Strong database passwords
- [ ] Secure JWT secrets (32+ characters)
- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] PM2 auto-restart enabled
- [ ] Nginx security headers configured
- [ ] Database user has minimal privileges
- [ ] `.env` file not in version control
- [ ] Rate limiting configured
- [ ] CORS properly configured for your domain
- [ ] Regular security updates applied

## Monitoring and Logging

Consider implementing:
- Application Performance Monitoring (APM) like New Relic or DataDog
- Error tracking with Sentry
- Log aggregation with ELK Stack or similar
- Uptime monitoring with UptimeRobot or Pingdom
- Database monitoring with pgAdmin or similar tools

## Performance Optimization

- Enable PostgreSQL connection pooling (already configured)
- Consider Redis for caching (optional)
- Enable gzip compression in Nginx
- Optimize database queries with indexes
- Monitor and tune PM2 cluster instances
- Configure CDN for static assets if needed
