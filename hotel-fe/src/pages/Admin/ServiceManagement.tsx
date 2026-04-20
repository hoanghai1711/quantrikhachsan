import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaCopy } from 'react-icons/fa';
import { ServiceItem, ServiceCategory } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const API_BASE_URL = 'http://localhost:5002/api';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách dịch vụ');
      }

      const data = await response.json();
      console.log('Services loaded:', data);
      // Handle both array format and { $values: array } format
      const servicesList = Array.isArray(data) ? data : (data?.$values || []);
      setServices(Array.isArray(servicesList) ? servicesList : []);
    } catch (error) {
      console.error('Load services error:', error);
      setServices([]);
      showToast('danger', 'Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách danh mục');
      }

      const data = await response.json();
      // Handle both array format and { $values: array } format
      const categoriesList = Array.isArray(data) ? data : (data?.$values || []);
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (error) {
      console.error('Load categories error:', error);
      setCategories([]);
      showToast('danger', 'Không thể tải danh sách danh mục');
    }
  };

  const handleSave = async () => {
    if (!name || price <= 0) return showToast('warning', 'Điền đủ thông tin');

    try {
      setLoading(true);
      const serviceData = { name, categoryId, price, isActive: true };

      if (editing) {
        const response = await fetch(`${API_BASE_URL}/services/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
          throw new Error('Không thể cập nhật dịch vụ');
        }

        setServices(prev => prev.map(s => s.id === editing.id ? { ...s, ...serviceData } : s));
        showToast('success', 'Cập nhật dịch vụ thành công');
      } else {
        const response = await fetch(`${API_BASE_URL}/services`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
          throw new Error('Không thể thêm dịch vụ');
        }

        const newService = await response.json();
        setServices(prev => [...prev, newService]);
        showToast('success', 'Thêm dịch vụ thành công');
      }

      setShowModal(false);
      reset();
    } catch (error) {
      console.error('Save service error:', error);
      showToast('danger', 'Có lỗi xảy ra khi lưu dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setEditing(null); setName(''); setCategoryId(undefined); setPrice(0); };

  const toggleAvailable = async (id: number) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const response = await fetch(`${API_BASE_URL}/services/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái dịch vụ');
      }

      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
      showToast('success', 'Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Toggle service error:', error);
      showToast('danger', 'Không thể cập nhật trạng thái dịch vụ');
    }
  };

  const deleteService = async (id: number) => {
    if (!window.confirm('Xóa dịch vụ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa dịch vụ');
      }

      setServices(prev => prev.filter(s => s.id !== id));
      showToast('success', 'Xóa dịch vụ thành công');
    } catch (error) {
      console.error('Delete service error:', error);
      showToast('danger', 'Không thể xóa dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const copyService = async (s: ServiceItem) => {
    try {
      const serviceData = {
        name: `${s.name} (Copy)`,
        categoryId: s.categoryId,
        price: s.price,
        isActive: true,
      };

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Không thể sao chép dịch vụ');
      }

      const newService = await response.json();
      setServices(prev => [...prev, newService]);
      showToast('success', 'Đã sao chép dịch vụ');
    } catch (error) {
      console.error('Copy service error:', error);
      showToast('danger', 'Không thể sao chép dịch vụ');
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Row><Col><Card className="shadow-sm mb-4"><Card.Body><div className="d-flex justify-content-between"><h4>Quản lý dịch vụ</h4><Button variant="primary" onClick={() => { reset(); setShowModal(true); }} disabled={loading}><FaPlus /> Thêm dịch vụ</Button></div></Card.Body></Card></Col></Row>
      <Row className="mb-3"><Col md={6}><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control placeholder="Tìm dịch vụ" value={search} onChange={e => setSearch(e.target.value)} /></InputGroup></Col></Row>
      <Card className="shadow-sm"><Card.Body className="p-0">
        <Table hover responsive><thead className="table-light"><tr><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td><td><Badge bg="secondary">{typeof s.category === 'string' ? s.category : s.category?.name || 'N/A'}</Badge></td><td>{s.price.toLocaleString()} VND</td>
              <td><Badge bg={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Có sẵn' : 'Không có sẵn'}</Badge></td>
              <td className="d-flex gap-2">
                <Button size="sm" variant="outline-primary" onClick={() => { setEditing(s); setName(s.name); setCategoryId(s.categoryId); setPrice(s.price); setShowModal(true); }} disabled={loading}><FaEdit /></Button>
                <Button size="sm" variant="outline-info" onClick={() => copyService(s)} disabled={loading}><FaCopy /></Button>
                <Button size="sm" variant={s.isActive ? 'outline-danger' : 'outline-success'} onClick={() => toggleAvailable(s.id)} disabled={loading}>{s.isActive ? <FaToggleOff /> : <FaToggleOn />}</Button>
                <Button size="sm" variant="outline-danger" onClick={() => deleteService(s.id)} disabled={loading}><FaTrash /></Button>
              </td>
            </tr>
          ))}
        </tbody></Table>
      </Card.Body></Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}><Modal.Header closeButton><Modal.Title>{editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</Modal.Title></Modal.Header>
      <Modal.Body><Form>
        <Form.Group className="mb-2"><Form.Label>Tên</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Danh mục</Form.Label><Form.Select value={categoryId || ''} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}><option value="">Chọn danh mục</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</Form.Select></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Giá</Form.Label><Form.Control type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></Form.Group>
      </Form></Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button><Button variant="primary" onClick={handleSave} disabled={loading}>Lưu</Button></Modal.Footer></Modal>
    </div>
  );
};

export default ServiceManagement;