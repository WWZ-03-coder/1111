---
title: "Docker容器化部署实践"
date: "2023-12-28"
category: "DevOps"
tags: ["Docker", "容器化", "部署", "DevOps", "CI/CD"]
excerpt: "从零开始学习Docker容器化部署，涵盖基础概念、Dockerfile编写、镜像构建和部署实战。"
image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop"
---

# Docker容器化部署实践

Docker已成为现代应用部署的标准工具。本文将从基础概念到实战部署，全面介绍Docker容器化部署的最佳实践。

## 1. Docker基础概念

### 1.1 什么是Docker？
Docker是一个开源的应用容器引擎，允许开发者将应用及其依赖打包到一个轻量级、可移植的容器中。

### 1.2 核心概念
- **镜像(Image)**：应用的只读模板
- **容器(Container)**：镜像的运行实例
- **仓库(Registry)**：存储和分发镜像的地方
- **Dockerfile**：构建镜像的配置文件

## 2. Docker安装和配置

### 2.1 安装Docker
根据操作系统选择合适的安装方式。

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# CentOS/RHEL
sudo yum install docker-ce docker-ce-cli containerd.io

# macOS (使用Homebrew)
brew install docker
```

### 2.2 配置Docker
优化Docker配置以提升性能和安全性。

```bash
# 查看Docker信息
docker info

# 配置Docker守护进程
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# 重启Docker服务
sudo systemctl restart docker
```

## 3. Dockerfile编写最佳实践

### 3.1 基础Dockerfile结构
创建一个高效的Dockerfile。

```dockerfile
# 1. 选择合适的基础镜像
FROM node:18-alpine AS builder

# 2. 设置工作目录
WORKDIR /app

# 3. 设置环境变量
ENV NODE_ENV=production

# 4. 复制包管理文件
COPY package*.json ./

# 5. 安装依赖
RUN npm ci --only=production

# 6. 复制应用代码
COPY . .

# 7. 构建应用
RUN npm run build

# 8. 多阶段构建：减小镜像大小
FROM nginx:alpine

# 9. 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 10. 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 11. 暴露端口
EXPOSE 80

# 12. 设置启动命令
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 安全最佳实践
确保Docker镜像的安全性。

```dockerfile
# 使用非root用户运行容器
FROM node:18-alpine

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制文件并设置权限
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production
COPY --chown=nodejs:nodejs . .

# 切换到非root用户
USER nodejs

# 运行应用
CMD ["node", "server.js"]
```

## 4. 镜像构建和管理

### 4.1 构建和推送镜像
使用最佳实践构建和分发镜像。

```bash
# 构建镜像
docker build -t myapp:v1.0 .

# 标签镜像
docker tag myapp:v1.0 myregistry.com/myapp:v1.0

# 登录到Docker Registry
docker login myregistry.com

# 推送镜像
docker push myregistry.com/myapp:v1.0

# 查看镜像列表
docker images

# 查看镜像历史
docker history myapp:v1.0
```

### 4.2 镜像优化技巧
减小镜像大小，提升构建速度。

```dockerfile
# 使用多阶段构建
FROM golang:1.20 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/app .
CMD ["./app"]

# 合并RUN命令减少层数
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        curl \
        git && \
    rm -rf /var/lib/apt/lists/*

# 使用.dockerignore文件
echo "node_modules
npm-debug.log
.git
.env
*.md
Dockerfile
.gitignore" > .dockerignore
```

## 5. 容器运行和管理

### 5.1 运行容器
掌握容器运行的各种选项。

```bash
# 运行简单容器
docker run -d --name myapp myapp:v1.0

# 运行容器并映射端口
docker run -d -p 8080:80 --name webapp nginx:alpine

# 运行容器并挂载卷
docker run -d \
  -v /path/on/host:/path/in/container \
  -v my_volume:/data \
  --name app_with_volume \
  myapp:v1.0

# 运行容器并设置环境变量
docker run -d \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgres://user:pass@db:5432/dbname \
  --name app_with_env \
  myapp:v1.0

# 运行容器并配置资源限制
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  --name app_with_limits \
  myapp:v1.0
```

### 5.2 容器管理
常用的容器管理命令。

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止的）
docker ps -a

# 查看容器日志
docker logs myapp
docker logs -f myapp  # 实时查看日志

# 进入容器
docker exec -it myapp /bin/sh

# 停止和启动容器
docker stop myapp
docker start myapp
docker restart myapp

# 删除容器
docker rm myapp
docker rm -f myapp  # 强制删除运行中的容器

# 查看容器资源使用情况
docker stats

# 查看容器详细信息
docker inspect myapp
```

## 6. Docker Compose实战

### 6.1 基本Docker Compose配置
使用Docker Compose管理多容器应用。

```yaml
version: '3.8'

services:
  # Web应用服务
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    networks:
      - app-network

  # 数据库服务
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis缓存服务
  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    networks:
      - app-network

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - app-network

  # 日志收集
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  app-network:
    driver: bridge
```

### 6.2 Docker Compose管理命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs -f web  # 实时查看特定服务日志

# 停止服务
docker-compose stop

# 停止并删除所有容器
docker-compose down

# 停止并删除所有容器、网络和卷
docker-compose down -v

# 重新构建服务
docker-compose build
docker-compose up -d --build

# 执行命令
docker-compose exec web npm test
docker-compose exec db psql -U user myapp

# 扩展服务实例
docker-compose up -d --scale web=3
```

## 7. 生产环境部署

### 7.1 健康检查配置
确保应用的健康状态。

```yaml
# Dockerfile中的健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Docker Compose中的健康检查
services:
  web:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### 7.2 监控和日志
配置监控和日志收集。

```bash
# 使用Docker日志驱动
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --name myapp \
  myapp:v1.0

# 将日志发送到外部系统
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=udp://logserver:514 \
  --name myapp \
  myapp:v1.0
```

### 7.3 安全加固
提升容器安全性。

```bash
# 使用安全扫描工具
docker scan myapp:v1.0

# 运行容器时限制权限
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  --name secure-app \
  myapp:v1.0
```

## 8. CI/CD集成

### 8.1 GitHub Actions集成
使用GitHub Actions自动构建和部署Docker镜像。

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: myusername/myapp
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: ${{ github.event_name != 'pull_request' }}
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

### 8.2 自动化部署脚本
创建自动化部署脚本。

```bash
#!/bin/bash
# deploy.sh

set -e

# 配置变量
APP_NAME="myapp"
VERSION="v1.0"
REGISTRY="myregistry.com"
ENVIRONMENT="${1:-production}"

echo "开始部署 $APP_NAME ($VERSION) 到 $ENVIRONMENT 环境"

# 拉取最新镜像
docker pull $REGISTRY/$APP_NAME:$VERSION

# 停止并删除旧容器
docker stop $APP_NAME || true
docker rm $APP_NAME || true

# 根据环境配置
if [ "$ENVIRONMENT" = "production" ]; then
    # 生产环境配置
    docker run -d \
        --name $APP_NAME \
        --restart=always \
        -p 80:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL=$PROD_DB_URL \
        --memory="1g" \
        --cpus="2" \
        $REGISTRY/$APP_NAME:$VERSION
else
    # 开发环境配置
    docker run -d \
        --name $APP_NAME \
        -p 3000:3000 \
        -e NODE_ENV=development \
        -e DATABASE_URL=$DEV_DB_URL \
        $REGISTRY/$APP_NAME:$VERSION
fi

echo "等待应用启动..."
sleep 10

# 检查应用状态
if curl -f http://localhost:3000/health; then
    echo "部署成功！"
else
    echo "部署失败，检查应用日志"
    docker logs $APP_NAME
    exit 1
fi
```

## 9. 故障排除

### 9.1 常见问题解决
解决Docker使用中的常见问题。

```bash
# 1. 容器启动失败
# 查看容器日志
docker logs container_name

# 2. 端口冲突
# 检查端口占用
netstat -tulpn | grep :80

# 3. 磁盘空间不足
# 清理无用资源
docker system prune -a

# 4. 网络问题
# 检查网络配置
docker network ls
docker network inspect network_name

# 5. 权限问题
# 添加用户到docker组
sudo usermod -aG docker $USER

# 6. 镜像拉取失败
# 检查网络和镜像地址
docker pull alpine
docker login
```

### 9.2 调试技巧
使用调试工具定位问题。

```bash
# 进入容器进行调试
docker exec -it container_name /bin/sh

# 检查容器内部进程
docker top container_name

# 检查容器资源使用
docker stats container_name

# 导出容器文件系统
docker export container_name > container.tar

# 保存容器状态
docker commit container_name debug_image

# 使用临时容器进行网络测试
docker run --rm -it --network container:container_name alpine sh

# 使用tcpdump分析网络流量
docker run --rm -it --net=container:container_name nicolaka/netshoot tcpdump
```

## 10. 进阶话题

### 10.1 Docker Swarm
使用Docker Swarm进行集群部署。

```bash
# 初始化Swarm集群
docker swarm init

# 加入工作节点
docker swarm join --token SWMTKN-1-xxxx 192.168.1.100:2377

# 部署服务
docker stack deploy -c docker-compose.yml myapp

# 查看服务状态
docker service ls
docker service ps myapp_web

# 更新服务
docker service update --image myapp:v2.0 myapp_web

# 扩展服务
docker service scale myapp_web=5
```

### 10.2 Kubernetes集成
将Docker容器部署到Kubernetes。

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myregistry.com/myapp:v1.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

## 结论

Docker容器化部署是现代应用开发的核心技能。通过掌握本文介绍的最佳实践，你可以：

1. 编写高效的Dockerfile
2. 管理容器生命周期
3. 使用Docker Compose编排多服务应用
4. 实现自动化部署流程
5. 处理常见的部署问题

记住，容器化不仅仅是技术实现，更是一种开发哲学。它强调环境一致性、应用隔离和快速部署。随着云原生技术的发展，Docker将继续在应用部署中扮演重要角色。

持续学习和实践是掌握Docker的关键。尝试在自己的项目中应用这些技巧，并根据实际需求调整部署策略，你会发现应用部署变得更加简单和可靠。