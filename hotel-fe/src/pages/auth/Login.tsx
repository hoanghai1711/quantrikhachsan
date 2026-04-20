import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForUser } from '../../utils/permissions';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { showToast } from '../../components/common/ToastNotification';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login, user, } = useAuth(); // lấy error từ hook nếu có
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    defaultValues: {
      email: 'receptionist@hotel.com',
      password: '123456',
    },
  });

  useEffect(() => {
    if (user) {
      navigate(getDefaultRouteForUser(user));
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      showToast('success', 'Đăng nhập thành công');
      navigate('/');
    } catch (err: any) {
      // Xử lý lỗi từ API (401, 400, 500)
      const message = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.';
      showToast('danger', message);
      // Nếu lỗi do email/password sai, set error cho từng field
      if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: 'Email không tồn tại' });
      } else if (message.toLowerCase().includes('password')) {
        setError('password', { type: 'manual', message: 'Mật khẩu không đúng' });
      } else {
        setError('root', { type: 'manual', message });
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Đăng nhập</Card.Title>
              <Card.Text className="text-muted">Sử dụng tài khoản demo để truy cập các vai trò.</Card.Text>

              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    isInvalid={!!errors.email}
                    {...register('email', {
                      required: 'Vui lòng nhập email',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email không hợp lệ',
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    isInvalid={!!errors.password}
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: { value: 6, message: 'Mật khẩu phải tối thiểu 6 ký tự' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Root error (nếu có) */}
                {errors.root && (
                  <Alert variant="danger" className="py-2">
                    {errors.root.message}
                  </Alert>
                )}

                <Button type="submit" variant="dark" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Card.Text className="text-muted">
                  Chưa có tài khoản? <a href="/register" className="text-decoration-none">Đăng ký ngay</a>
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;