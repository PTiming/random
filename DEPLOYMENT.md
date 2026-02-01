# Deployment Guide

## Prerequisites
- Node.js v14+ installed
- MongoDB v4.4+ running
- Moodle instance with Web Services enabled
- Git installed

## Environment Setup

### Backend Environment Variables

Create `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/moodle-social-network
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret (IMPORTANT: Use a strong, random secret in production)
JWT_SECRET=your_very_strong_random_secret_here
JWT_EXPIRE=7d

# Moodle Configuration
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_web_service_token
MOODLE_SERVICE=moodle_mobile_app

# OAuth2 Configuration (Optional)
MOODLE_OAUTH_CLIENT_ID=your_client_id
MOODLE_OAUTH_CLIENT_SECRET=your_client_secret
MOODLE_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback

# Sync Configuration
SYNC_ENABLED=true
SYNC_FREQUENCY=hourly
SYNC_DIRECTION=bidirectional

# Socket.IO
SOCKET_CORS_ORIGIN=https://yourdomain.com
```

### Frontend Environment Variables

Create `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Install Dependencies
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Clone and Setup
```bash
git clone https://github.com/PTiming/random.git
cd random
npm run install-all
```

#### 3. Build Frontend
```bash
cd frontend
npm run build
cd ..
```

#### 4. Start Backend with PM2
```bash
cd backend
pm2 start server.js --name moodle-social-backend
pm2 save
pm2 startup
```

#### 5. Serve Frontend with Nginx
Install Nginx:
```bash
sudo apt-get install nginx
```

Configure Nginx (`/etc/nginx/sites-available/moodle-social`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/random/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/moodle-social /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Heroku

#### Backend Deployment

1. Create Heroku app:
```bash
heroku create your-app-backend
```

2. Add MongoDB addon:
```bash
heroku addons:create mongolab:sandbox
```

3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set MOODLE_URL=https://your-moodle-instance.com
heroku config:set MOODLE_TOKEN=your_token
```

4. Deploy:
```bash
cd backend
git init
heroku git:remote -a your-app-backend
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Frontend Deployment

1. Build and deploy to Netlify/Vercel:
```bash
cd frontend
npm run build
```

2. Deploy `build` folder to Netlify or Vercel

### Option 3: Docker

#### Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/moodle-social-network
      - JWT_SECRET=${JWT_SECRET}
      - MOODLE_URL=${MOODLE_URL}
      - MOODLE_TOKEN=${MOODLE_TOKEN}

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker-compose up -d
```

## Security Considerations

1. **Use HTTPS in production**
   - Install SSL certificate (Let's Encrypt recommended)
   - Configure Nginx/Apache for HTTPS

2. **Secure MongoDB**
   - Enable authentication
   - Use firewall to restrict access
   - Regular backups

3. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random JWT secrets
   - Rotate Moodle tokens regularly

4. **CORS Configuration**
   - Restrict origins to your domain only
   - Don't use wildcard (*) in production

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Health Checks
Monitor: `https://api.yourdomain.com/health`

## Backup Strategy

### Database Backup
```bash
mongodump --uri="mongodb://localhost:27017/moodle-social-network" --out=/backup/$(date +%Y%m%d)
```

### Automated Backups (Cron)
```bash
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/moodle-social-network" --out=/backup/$(date +\%Y\%m\%d)
```

## Troubleshooting

### Backend Won't Start
- Check MongoDB connection
- Verify environment variables
- Check port availability: `lsof -i :5000`

### Frontend Can't Connect to Backend
- Verify REACT_APP_API_URL in .env
- Check CORS settings in backend
- Verify Nginx proxy configuration

### Sync Not Working
- Verify Moodle token is valid
- Check Moodle Web Services are enabled
- Review sync logs in backend

## Performance Optimization

1. **Enable Caching**
   - Use Redis for session storage
   - Implement API response caching

2. **Database Optimization**
   - Create indexes on frequently queried fields
   - Use MongoDB aggregation pipelines

3. **CDN for Static Assets**
   - Serve frontend build from CDN
   - Use CDN for user-uploaded media

4. **Load Balancing**
   - Use multiple backend instances
   - Configure Nginx as load balancer
