# 用 ARG 让版本可配置（方便未来升级）
ARG NODE_VERSION=20

# ==================== 阶段1：依赖层 ====================
# 作用：安装前端项目所需的所有依赖
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

# 复制 package 文件
# 前端项目通常有 package.json 和 package-lock.json（或 yarn.lock）
COPY --chown=node:node package*.json ./

# 安装依赖（包括开发依赖，如 Vite、@vitejs/plugin-react 等）
RUN npm ci


# ==================== 阶段2：构建层 ====================
# 作用：构建生产版本的静态文件
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# 复制所有源代码
# 包括 src/、index.html、vite.config.ts 等
COPY --chown=node:node . .

# 执行构建命令
# Vite 会根据 vite.config.ts 的配置，生成 dist 目录
# dist 里包含：编译后的 JS、压缩后的 CSS、处理过的图片等静态文件
RUN npm run build


# ==================== 阶段3：生产运行层 ====================
# 作用：使用 Nginx 提供静态文件服务（最小化镜像）
FROM nginx:alpine

# 安装 curl 用于健康检查（alpine 版本默认没有 curl）
# apk 是 Alpine Linux 的包管理器（类似 apt）
# --no-cache 表示不缓存包索引，减小镜像体积
RUN apk add --no-cache curl

# 复制自定义 Nginx 配置文件
# 注意：Nginx 的默认配置目录是 /etc/nginx/conf.d/
# 我们覆盖 default.conf 文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建层复制静态文件到 Nginx 的默认网站目录
# --from=builder 从 builder 阶段复制文件
# /app/dist 是 Vite 构建产物的输出目录
# /usr/share/nginx/html 是 Nginx 默认的静态文件目录
# --chown=nginx:nginx 设置所有者为 nginx 用户（非 root 运行）
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口（HTTP 默认端口）
EXPOSE 80

# 前台运行 Nginx
# daemon off 表示 Nginx 不以后台守护进程方式运行
# 这样容器才能持续运行（容器的 PID 1 必须是前台进程）
CMD ["nginx", "-g", "daemon off;"]
