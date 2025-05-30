---
title: Installation
description: How to install and set up the ERP system
order: 1
date: 2024-05-30
---

# Installation

This guide will walk you through the installation process for the ERP system.

## System Requirements

Before installing, ensure your system meets the following requirements:

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: At least 10GB free disk space
- **Network**: Stable internet connection for initial setup

## Installation Methods

### Method 1: Quick Install (Recommended)

The quickest way to get started:

```bash
# Download the installer
curl -fsSL https://install.erp-system.com | bash

# Follow the interactive prompts
./install.sh
```

### Method 2: Manual Installation

For more control over the installation process:

1. **Download the package**
   ```bash
   wget https://releases.erp-system.com/latest/erp-system.tar.gz
   tar -xzf erp-system.tar.gz
   cd erp-system
   ```

2. **Install dependencies**
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm postgresql redis-server
   
   # On macOS
   brew install node postgresql redis
   
   # On Windows (using Chocolatey)
   choco install nodejs postgresql redis-64
   ```

3. **Configure the database**
   ```bash
   # Create database
   createdb erp_system
   
   # Run migrations
   npm run migrate
   ```

4. **Start the services**
   ```bash
   # Start Redis
   redis-server
   
   # Start PostgreSQL
   pg_ctl start
   
   # Start the application
   npm start
   ```

## Installation Flow

```mermaid
flowchart TD
    A[Download Installer] --> B[Check System Requirements]
    B --> C{Requirements Met?}
    C -->|No| D[Install Dependencies]
    C -->|Yes| E[Configure Database]
    D --> E
    E --> F[Set Environment Variables]
    F --> G[Run Initial Setup]
    G --> H[Start Services]
    H --> I[Verify Installation]
    I --> J{Installation Successful?}
    J -->|Yes| K[Complete]
    J -->|No| L[Check Logs]
    L --> M[Troubleshoot]
    M --> G
```

## Environment Configuration

Create a `.env` file in your installation directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/erp_system
REDIS_URL=redis://localhost:6379

# Application Settings
NODE_ENV=production
PORT=3000
SECRET_KEY=your-secret-key-here

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Verification

After installation, verify everything is working:

1. **Check service status**
   ```bash
   # Check if services are running
   systemctl status erp-system
   systemctl status postgresql
   systemctl status redis
   ```

2. **Access the web interface**
   - Open your browser and navigate to `http://localhost:3000`
   - You should see the login page

3. **Run health check**
   ```bash
   curl http://localhost:3000/health
   ```

## Post-Installation

### Initial Setup

1. **Create admin user**
   ```bash
   npm run create-admin
   ```

2. **Import sample data** (optional)
   ```bash
   npm run import-sample-data
   ```

3. **Configure backup**
   ```bash
   # Set up daily backups
   crontab -e
   # Add: 0 2 * * * /path/to/backup-script.sh
   ```

### Security Hardening

- Change default passwords
- Configure firewall rules
- Enable SSL/TLS certificates
- Set up monitoring and logging

## Troubleshooting

If you encounter issues during installation:

1. **Check the logs**
   ```bash
   tail -f /var/log/erp-system/install.log
   ```

2. **Common issues**
   - Port conflicts: Change the PORT in `.env`
   - Database connection: Verify PostgreSQL is running
   - Permission errors: Check file ownership and permissions

3. **Get help**
   - Check the [Troubleshooting](/troubleshooting) guide
   - Contact support at support@erp-system.com

## Next Steps

- [Configuration](/user-guide/configuration) - Configure your ERP system
- [User Management](/user-guide/users) - Set up users and permissions
- [API Documentation](/api/overview) - Integrate with external systems
