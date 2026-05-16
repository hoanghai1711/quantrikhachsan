import { Article, ArticleCategory, Attraction } from '../types';

const ENDPOINT = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('hotel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeApiArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};

export const getArticleCategories = async (): Promise<ArticleCategory[]> => {
  const response = await fetch(`${ENDPOINT}/article-categories`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh mục bài viết');
  const data = await response.json();
  return normalizeApiArray(data);
};

export const getArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${ENDPOINT}/articles`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh sách bài viết');
  const data = await response.json();
  return normalizeApiArray(data);
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await fetch(`${ENDPOINT}/articles/slug/${encodeURIComponent(slug)}`, {
    headers: getAuthHeader(),
  });
  if (response.status === 404) {
    throw new Error('Bài viết không tồn tại');
  }
  if (!response.ok) throw new Error('Không thể tải chi tiết bài viết');
  return await response.json();
};

export const getAttractions = async (): Promise<Attraction[]> => {
  const response = await fetch(`${ENDPOINT}/attractions`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Không thể tải danh sách điểm đến');
  const data = await response.json();
  return normalizeApiArray(data);
};
