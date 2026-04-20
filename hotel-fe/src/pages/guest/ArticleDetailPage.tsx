import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { getArticleBySlug } from '../../api/content';
import { Article } from '../../types';

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
        document.title = data.metaTitle || data.title || 'Bài viết';
      } catch (err) {
        setError((err as Error).message || 'Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <div className="mt-3">Đang tải bài viết...</div>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Bài viết không tồn tại'}</Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>
      <Card className="shadow-sm border-0">
        {article.imageUrl && <Card.Img variant="top" src={article.imageUrl} />}
        <Card.Body>
          <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
            {article.category?.name && <Badge bg="info">{article.category.name}</Badge>}
            {article.publishedAt && <small className="text-muted">Đăng ngày {new Date(article.publishedAt).toLocaleDateString()}</small>}
          </div>
          <Card.Title className="mb-2">{article.title}</Card.Title>
          <Card.Subtitle className="mb-3 text-muted">{article.metaTitle || 'Tiêu đề SEO'}</Card.Subtitle>
          <p className="text-secondary mb-4">{article.metaDescription || 'Mô tả meta chưa được cung cấp.'}</p>
          <div className="article-slug mb-4">
            <strong>Slug:</strong> <span>{article.slug}</span>
          </div>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || '<p>Không có nội dung</p>' }} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ArticleDetailPage;
