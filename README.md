# Postman Collection Viewer

一个用于查看 Postman 集合的 React 应用。

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装和运行

### 首次设置

1. 克隆项目到本地
```bash
git clone <repository-url>
cd postman-collection-viewer
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
   
   项目根目录已包含 `.env.example` 文件作为配置模板。请按以下步骤配置：
   
   ```bash
   # 复制配置模板
   cp .env.example .env
   
   # 编辑 .env 文件，填入您的 API 密钥
   # 或者手动创建 .env 文件：
   ```
   
   ```bash
   # Postman API Configuration
   REACT_APP_POSTMAN_API_KEY=your_postman_api_key_here
   ```
   
   **获取 Postman API 密钥：**
   - 登录 [Postman](https://www.postman.com/)
   - 进入 [API Keys 页面](https://go.postman.co/settings/me/api-keys)
   - 创建新的 API 密钥或使用现有的密钥
   - 将密钥复制到 `.env` 文件中

4. 启动开发服务器
```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 打开。

### 环境变量说明

⚠️ **重要：** 请确保在启动应用前正确配置 `.env` 文件中的 `REACT_APP_POSTMAN_API_KEY`。如果没有配置或配置错误，应用将无法正常工作。

### 常见问题解决

如果遇到 "react-scripts command not found" 错误：

1. 确保已安装依赖：
```bash
npm install
```

2. 检查 react-scripts 是否正确安装：
```bash
npm list react-scripts
```

3. 如果问题持续，尝试清除缓存：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

如果遇到 "Postman API key is not configured" 错误：

1. 确保已创建 `.env` 文件：
```bash
cp .env.example .env
```

2. 检查 `.env` 文件中的 API 密钥是否正确配置：
```bash
cat .env
```

3. 确保 API 密钥格式正确（以 `PMAK-` 开头）

4. 重启开发服务器：
```bash
npm start
```

## 可用的脚本

- `npm start` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm test` - 运行测试
- `npm run eject` - 弹出配置（不可逆）

## 技术栈

- React 19.1.1
- TypeScript 4.9.5
- react-scripts 5.0.1
