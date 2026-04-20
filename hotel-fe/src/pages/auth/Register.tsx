import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForUser } from '../../utils/permissions';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { showToast } from '../../components/common/ToastNotification';

interface RegisterForm {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

const Register = () => {
  const { register: authRegister, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate(getDefaultRouteForUser(user));
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.email, data.password, data.fullName, data.phone);
      showToast('success', 'Đăng ký thành công');
      navigate('/');
    } catch (error) {
      showToast('danger', 'Đăng ký thất bại. Vui lòng kiểm tra thông tin.');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Đăng ký tài khoản</Card.Title>
              <Card.Text className="text-muted">Tạo tài khoản để dễ dàng đặt phòng và quản lý các đặt phòng của bạn.</Card.Text>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ tên"
                    {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    {...register('email', {
                      required: 'Vui lòng nhập email',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                    })}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: { value: 6, message: 'Mật khẩu phải tối thiểu 6 ký tự' }
                    })}
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="phone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    {...register('phone', {
                      required: 'Vui lòng nhập số điện thoại',
                      pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                    })}
                  />
                </Form.Group>
                <Button type="submit" variant="dark" className="w-100 mb-3" disabled={formState.isSubmitting}>
                  Đăng ký
                </Button>
              </Form>
              <div className="text-center">
                <Card.Text className="text-muted">
                  Đã có tài khoản? <a href="/login" className="text-decoration-none">Đăng nhập</a>
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
