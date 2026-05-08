// User-related types
export interface RegisterRequest {
  username: string; // 3-20 字符
  email: string; // 邮箱格式
  password: string; // 6-20 字符
}

export interface LoginRequest {
  email: string; // 邮箱格式
  password: string; // 密码
}

export interface LoginResponse {
  access_token: string; // JWT 令牌，过期时间 7 天
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

// Blog-related types
export interface Blog {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO 日期字符串
  updatedAt: string; // ISO 日期字符串
  userId: number;
}

export interface BlogListResponse {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
}

export interface BlogCreateRequest {
  title: string;
  content: string;
}