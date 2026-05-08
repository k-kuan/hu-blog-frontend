import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page on unauthorized
      window.location.href = '/user/login';
    } else if (error.response?.status === 403) {
      // Forbidden error
      console.error('Forbidden: You do not have permission to access this resource');
    } else if (error.response?.status === 404) {
      // Not found error
      console.error('Not Found: The requested resource does not exist');
    } else if (error.response?.status === 409) {
      // Conflict error
      console.error('Conflict: The resource already exists');
    } else if (error.response?.status === 500) {
      // Internal server error
      console.error('Internal Server Error: Please try again later');
    }
    return Promise.reject(error);
  }
);

// Blog-related API functions
export const blogApi = {
  // Get blog list with pagination
  getBlogs: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<import('../types').BlogListResponse>('/blogs', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get single blog by ID
  getBlog: async (id: number) => {
    const response = await api.get<import('../types').Blog>(`/blogs/${id}`);
    return response.data;
  },

  // Create new blog
  createBlog: async (data: import('../types').BlogCreateRequest) => {
    const response = await api.post<import('../types').Blog>('/blogs', data);
    return response.data;
  },

  // Update blog
  updateBlog: async (id: number, data: import('../types').BlogCreateRequest) => {
    const response = await api.put<import('../types').Blog>(`/blogs/${id}`, data);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id: number) => {
    await api.delete(`/blogs/${id}`);
  }
};

export default api;