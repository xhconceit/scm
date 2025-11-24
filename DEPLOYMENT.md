# 🌐 SCM 生产环境部署指南

本文档提供完整的生产环境部署指导。

## 📋 目录

- [服务器要求](#服务器要求)
- [部署架构](#部署架构)
- [部署步骤](#部署步骤)
- [HTTPS 配置](#https-配置)
- [安全加固](#安全加固)
- [监控和维护](#监控和维护)
- [备份策略](#备份策略)

## 🖥️ 服务器要求

### 最低配置

- **CPU**: 2 核
- **内存**: 4GB RAM
- **磁盘**: 20GB SSD
- **系统**: Ubuntu 20.04 LTS / 22.04 LTS
- **网络**: 稳定的互联网连接

### 推荐配置

- **CPU**: 4 核
- **内存**: 8GB RAM
- **磁盘**: 50GB SSD
- **系统**: Ubuntu 22.04 LTS
- **网络**: 10Mbps+ 带宽

## 🏗️ 部署架构

```
Internet
    ↓
[Nginx/Caddy] (80/443)
    ↓
    ├── → [Admin Frontend] (8080)
    ├── → [Server API] (3000)
    └── → [MQTT WebSocket] (8083)
    ↓
[PostgreSQL] (5432)
[MQTT Broker] (1883)
```

## 🚀 部署步骤

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl git ufw

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install -y docker-compose-plugin

# 重新登录以应用 Docker 组权限
newgrp docker
```

### 2. 配置防火墙

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 MQTT（如果需要外部访问）
sudo ufw allow 1883/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 3. 克隆项目

```bash
# 创建部署目录
mkdir -p ~/apps
cd ~/apps

# 克隆项目
git clone https://github.com/your-username/scm.git
cd scm
```

### 4. 配置环境变量

```bash
# 查看环境变量模板
cat docker/env-template.txt

# 创建环境变量文件
vim .env

# 或使用 docker 目录下的
cd docker
vim .env
```

**重要配置项**：

```bash
# 修改数据库密码（必须）
POSTGRES_PASSWORD=your_secure_password_here

# 修改 API URL（使用实际域名）
VITE_API_URL=https://api.your-domain.com

# 日志级别
LOG_LEVEL=warn
```

### 5. 修改 Docker Compose 配置

编辑 `docker/docker-compose.yml`：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: your_secure_password  # 修改密码
  
  server:
    environment:
      DATABASE_URL: postgresql://scmuser:your_secure_password@postgres:5432/scm
      NODE_ENV: production
```

### 6. 启动服务

```bash
# 返回项目根目录
cd ~/apps/scm

# 使用 Makefile（推荐）
make prod-up

# 或使用 Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# 查看服务状态
make ps

# 查看日志
make logs
```

### 7. 验证部署

```bash
# 运行健康检查
./scripts/health-check.sh

# 测试 API
curl http://localhost:3000/health

# 测试前端
curl http://localhost:8080/health
```

## 🔐 HTTPS 配置

### 方式一：使用 Caddy（推荐）

Caddy 会自动处理 HTTPS 证书。

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# 复制配置文件
sudo cp docker/caddy.conf.example /etc/caddy/Caddyfile

# 修改域名
sudo vim /etc/caddy/Caddyfile
# 将 scm.example.com 替换为你的域名

# 验证配置
sudo caddy validate --config /etc/caddy/Caddyfile

# 启动 Caddy
sudo systemctl start caddy
sudo systemctl enable caddy

# 查看日志
sudo journalctl -u caddy -f
```

### 方式二：使用 Nginx + Let's Encrypt

```bash
# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 复制配置文件
sudo cp docker/nginx-reverse-proxy.conf.example /etc/nginx/sites-available/scm

# 修改配置
sudo vim /etc/nginx/sites-available/scm
# 将 scm.example.com 替换为你的域名

# 创建软链接
sudo ln -s /etc/nginx/sites-available/scm /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 配置自动续期

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨 2 点检查证书）
0 2 * * * certbot renew --quiet
```

## 🔒 安全加固

### 1. 修改默认密码

```yaml
# docker/docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: use_strong_password_here  # 强密码

  server:
    environment:
      DATABASE_URL: postgresql://scmuser:use_strong_password_here@postgres:5432/scm
```

### 2. 限制服务端口

```yaml
# docker/docker-compose.yml
# 只暴露必要的端口，删除或注释掉其他端口
services:
  postgres:
    # ports:
    #   - "5432:5432"  # 不对外暴露数据库端口
  
  mqtt:
    ports:
      - "1883:1883"    # 保留 MQTT
    #   - "18083:18083"  # 不暴露 Dashboard
```

### 3. 配置 Fail2Ban

```bash
# 安装 Fail2Ban
sudo apt install -y fail2ban

# 配置 SSH 保护
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo vim /etc/fail2ban/jail.local

# 启用服务
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 4. 配置 SSH 密钥认证

```bash
# 本地生成密钥对
ssh-keygen -t ed25519

# 复制公钥到服务器
ssh-copy-id user@your-server

# 禁用密码登录
sudo vim /etc/ssh/sshd_config
# 设置：PasswordAuthentication no

# 重启 SSH
sudo systemctl restart sshd
```

### 5. 定期更新

```bash
# 创建更新脚本
cat > ~/update.sh << 'EOF'
#!/bin/bash
cd ~/apps/scm
git pull
docker-compose -f docker/docker-compose.yml pull
docker-compose -f docker/docker-compose.yml up -d
docker system prune -f
EOF

chmod +x ~/update.sh

# 添加到 crontab（每周日凌晨 3 点更新）
# 0 3 * * 0 ~/update.sh >> ~/update.log 2>&1
```

## 📊 监控和维护

### 1. 日志管理

```bash
# 配置日志轮转
sudo vim /etc/logrotate.d/scm

# 添加配置
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1
    endscript
}
```

### 2. 监控脚本

```bash
# 创建监控脚本
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
cd ~/apps/scm
./scripts/health-check.sh
if [ $? -ne 0 ]; then
    echo "Health check failed!" | mail -s "SCM Alert" your@email.com
fi
EOF

chmod +x ~/monitor.sh

# 添加到 crontab（每 5 分钟检查一次）
# */5 * * * * ~/monitor.sh
```

### 3. 资源监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看实时资源使用
htop

# 查看 Docker 资源使用
docker stats
```

## 💾 备份策略

### 1. 自动备份

```bash
# 使用项目提供的备份脚本
cd ~/apps/scm
./scripts/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 0 2 * * * cd ~/apps/scm && ./scripts/backup.sh >> ~/backup.log 2>&1
```

### 2. 远程备份

```bash
# 安装 rclone（支持多种云存储）
curl https://rclone.org/install.sh | sudo bash

# 配置远程存储
rclone config

# 创建远程备份脚本
cat > ~/remote-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/apps/scm/backups
REMOTE_NAME=your-remote
REMOTE_PATH=/scm-backups

# 执行本地备份
cd ~/apps/scm && ./scripts/backup.sh

# 同步到远程
rclone sync $BACKUP_DIR $REMOTE_NAME:$REMOTE_PATH

# 清理本地旧备份（保留 3 天）
find $BACKUP_DIR -name "*.gz" -mtime +3 -delete
EOF

chmod +x ~/remote-backup.sh

# 添加到 crontab（每天凌晨 3 点）
# 0 3 * * * ~/remote-backup.sh >> ~/remote-backup.log 2>&1
```

### 3. 数据恢复

```bash
# 使用恢复脚本
cd ~/apps/scm
./scripts/restore.sh

# 或手动恢复
gunzip < backups/database_20240101_020000.sql.gz | \
    docker exec -i scm-postgres psql -U scmuser -d scm
```

## 🔄 更新部署

```bash
# 1. 拉取最新代码
cd ~/apps/scm
git pull

# 2. 备份数据
./scripts/backup.sh

# 3. 重新构建和部署
make build
make prod-up

# 4. 执行数据库迁移（如果需要）
docker exec -it scm-server sh -c "pnpm prisma migrate deploy"

# 5. 验证
./scripts/health-check.sh
```

## 🆘 故障恢复

### 服务无法启动

```bash
# 查看日志
make logs

# 检查配置
docker-compose -f docker/docker-compose.yml config

# 重新构建
make build-no-cache
make prod-up
```

### 数据库损坏

```bash
# 停止服务
make prod-down

# 恢复最新备份
./scripts/restore.sh

# 重新启动
make prod-up
```

### 磁盘空间不足

```bash
# 清理 Docker
docker system prune -a --volumes

# 清理旧日志
sudo journalctl --vacuum-time=7d

# 清理旧备份
find ~/apps/scm/backups -mtime +30 -delete
```

## 📚 相关文档

- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [DOCKER.md](./DOCKER.md) - Docker 详细文档
- [README.md](./README.md) - 项目文档

## ✅ 部署检查清单

- [ ] 修改所有默认密码
- [ ] 配置防火墙
- [ ] 设置 HTTPS
- [ ] 配置自动备份
- [ ] 配置日志轮转
- [ ] 设置监控告警
- [ ] 配置 SSH 密钥认证
- [ ] 安装 Fail2Ban
- [ ] 测试备份恢复
- [ ] 文档更新

---

**需要帮助？** 请参考其他文档或提交 Issue。

