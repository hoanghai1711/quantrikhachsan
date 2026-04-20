import { Article, ArticleCategory, Attraction } from '../types';

const API_BASE_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getArticleCategories = async (): Promise<ArticleCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/article-categories`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh mục bài viết');
  return await response.json();
};

export const getArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh sách bài viết');
  return await response.json();
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await fetch(`${API_BASE_URL}/articles/slug/${encodeURIComponent(slug)}`, {
    headers: getAuthHeader(),
  });
  if (response.status === 404) {
    throw new Error('Bài viết không tồn tại');
  }
  if (!response.ok) throw new Error('Không thể tải chi tiết bài viết');
  return await response.json();
};

export const getAttractions = async (): Promise<Attraction[]> => {
  const response = await fetch(`${API_BASE_URL}/attractions`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh sách điểm đến');
  return await response.json();
};
