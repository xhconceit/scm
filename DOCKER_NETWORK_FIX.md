# 🔧 Docker 网络问题解决方案

## 问题现象

```
failed to authorize: rpc error: code = Unknown desc = failed to fetch anonymous token
```

这是因为无法连接到 Docker Hub 导致的。

## ✅ 解决方案（已配置）

### 步骤 1: 配置 Docker 镜像加速器

✅ **已自动为你创建配置文件**: `~/.docker/daemon.json`

### 步骤 2: 在 Docker Desktop 中应用配置

#### 方法 A: 通过 Docker Desktop UI（推荐）

1. **打开 Docker Desktop**
   - 点击顶部菜单栏的 Docker 图标 🐳

2. **进入设置**
   - 点击 "Settings" 或 "Preferences"（设置/偏好设置）

3. **配置 Docker Engine**
   - 左侧菜单选择 "Docker Engine"
   - 在右侧的 JSON 编辑器中，找到或添加 `registry-mirrors` 配置：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "registry-mirrors": [
    "https://docker.mirrors.sjtug.sjtu.edu.cn",
    "https://mirror.baidubce.com"
  ],
  "experimental": false
}
```

4. **应用并重启**
   - 点击 "Apply & Restart" 按钮
   - 等待 Docker 重启完成（约 10-30 秒）

5. **验证配置**
   ```bash
   docker info | grep -A 5 "Registry Mirrors"
   ```

   应该看到：
   ```
   Registry Mirrors:
     https://docker.mirrors.sjtug.sjtu.edu.cn/
     https://mirror.baidubce.com/
   ```

#### 方法 B: 命令行配置（macOS）

```bash
# 1. 编辑 Docker Desktop 配置
# Docker Desktop 会自动读取 ~/.docker/daemon.json
# 无需额外操作

# 2. 重启 Docker Desktop
osascript -e 'quit app "Docker"'
sleep 2
open -a Docker

# 3. 等待 Docker 启动完成
sleep 30
```

### 步骤 3: 启动完整 Docker 环境

配置生效后，运行：

```bash
cd ~/Code/scm
make prod-up
```

## 🚀 快速验证脚本

使用以下脚本验证配置是否生效：

```bash
# 检查配置
cd ~/Code/scm
./scripts/docker-network-check.sh
```

## 📋 各镜像加速器说明

| 镜像源 | 地址 | 说明 |
|--------|------|------|
| 上海交大 | https://docker.mirrors.sjtug.sjtu.edu.cn | 稳定，推荐 |
| 百度云 | https://mirror.baidubce.com | 备用 |

## 🔍 故障排查

### 问题 1: 配置后仍然无法拉取镜像

```bash
# 检查 Docker 是否正确读取配置
docker info | grep -A 5 "Registry Mirrors"

# 如果没有显示镜像源，尝试：
1. 确认 Docker Desktop 已重启
2. 检查配置文件格式是否正确
3. 尝试手动在 Docker Desktop UI 中配置
```

### 问题 2: Docker Desktop 无法启动

```bash
# 恢复原配置
cp ~/.docker/daemon.json.bak ~/.docker/daemon.json

# 重启 Docker Desktop
```

### 问题 3: 仍然网络超时

**临时方案**：使用开发模式

```bash
# 只用 Docker 运行基础服务
make dev-up

# 应用在本地运行（不需要构建镜像）
cd apps/server && pnpm dev    # 终端 1
cd apps/admin && pnpm dev     # 终端 2
```

## ✨ 配置成功后的效果

```bash
# 启动完整环境
make prod-up

# 访问服务
✅ Admin 前端: http://localhost:8080
✅ Server API: http://localhost:3000
✅ MQTT Broker: mqtt://localhost:1883
✅ EMQX Dashboard: http://localhost:18083
```

## 📞 需要帮助？

如果配置后仍有问题：

1. 查看详细日志：`make logs`
2. 检查网络连接：`curl -I https://docker.mirrors.sjtug.sjtu.edu.cn`
3. 重新构建：`make build-no-cache && make prod-up`

---

**注意**: 镜像加速器配置完成并重启 Docker Desktop 后，就可以正常使用 `make prod-up` 启动完整的生产环境了。

