# 🚀 Deployment Guide - MCS-CEV Optimization System

## AWS EC2 Deployment Instructions

### Prerequisites

1. **AWS Account** with EC2 access
2. **Domain name** (optional, for SSL)
3. **SSH key pair** for EC2 access

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Configure instance:**
   - **Name**: `mcs-cev-optimization-server`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: t3.medium (2 vCPU, 4GB RAM)
   - **Key pair**: Create or select existing
   - **Storage**: 20GB minimum

### Step 2: Configure Security Groups

Open these ports in Security Groups:
- **22** (SSH) - For server administration
- **80** (HTTP) - For web access
- **443** (HTTPS) - For SSL (optional)
- **3001** (Frontend) - React development server
- **3002** (Backend) - Node.js API server

### Step 3: Connect to Instance

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 4: Run Setup Script

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/d2rojas/green-construction-mcs-cev/main/scripts/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### Step 5: Configure Environment Variables

```bash
# Edit the environment file
nano optimization-interface/backend/.env
```

Add your OpenAI API key:
```
NODE_ENV=production
PORT=3002
OPENAI_API_KEY=your-actual-openai-api-key
```

### Step 6: Start Services

```bash
# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 7: Verify Deployment

Your application will be available at:
- **HTTP**: `http://your-ec2-public-ip`
- **Frontend**: `http://your-ec2-public-ip:3001`
- **Backend**: `http://your-ec2-public-ip:3002`

### Optional: SSL Setup

If you have a domain name:

```bash
# Run SSL setup script
./scripts/ssl-setup.sh your-domain.com
```

## Management Commands

### PM2 Process Management

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Monitor
pm2 monit
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Application Updates

```bash
# Pull latest changes
cd /var/www/mcs-cev-optimization
git pull origin main

# Install new dependencies
cd optimization-interface
npm install
cd backend
npm install

# Restart services
pm2 restart all
```

## Monitoring and Logs

### Log Locations

- **PM2 logs**: `pm2 logs`
- **Nginx logs**: `/var/log/nginx/`
- **Application logs**: `/var/www/mcs-cev-optimization/logs/`

### System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check service status
sudo systemctl status nginx
pm2 status
```

## Troubleshooting

### Common Issues

1. **Port not accessible**: Check Security Groups
2. **Services not starting**: Check logs with `pm2 logs`
3. **Nginx errors**: Check configuration with `sudo nginx -t`
4. **Memory issues**: Restart services with `pm2 restart all`

### Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Configure caching** for static assets
3. **Monitor memory usage** and restart if needed
4. **Use larger instance** if performance is poor

## Security Considerations

1. **Keep system updated**: `sudo apt update && sudo apt upgrade`
2. **Configure firewall**: `sudo ufw status`
3. **Use SSL**: Run SSL setup script
4. **Regular backups**: Backup application data
5. **Monitor logs**: Check for suspicious activity

## Cost Optimization

1. **Use t3.medium** for development
2. **Stop instance** when not in use
3. **Use Spot Instances** for cost savings
4. **Monitor usage** with AWS Cost Explorer

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Verify configuration: `sudo nginx -t`
3. Check system resources: `htop`
4. Review Security Groups in AWS Console
