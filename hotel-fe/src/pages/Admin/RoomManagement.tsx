import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Tab, Tabs, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBed, FaBuilding } from 'react-icons/fa';
import {
  getRoomTypes,
  getRooms,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomImage,
  removeRoomImage,
  setPrimaryImage
} from '../../api/rooms';
import { RoomType, Room } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const RoomManagement: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(rooms.length / itemsPerPage));
  const paginatedRooms = rooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Room Type Modal
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    maxOccupancy: 1,
    size: 0,
    isActive: true
  });

  // Image management
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPrimaryImage, setIsPrimaryImage] = useState(false);

  // Room Modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    roomTypeId: 0,
    roomNumber: '',
    status: 'Available',
    floor: 1
  });

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RoomType | Room | null>(null);
  const [isRoomDetail, setIsRoomDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showRoomModal && !editingRoom && roomTypes.length > 0) {
      setRoomForm(prev => ({
        ...prev,
        roomTypeId: prev.roomTypeId || roomTypes[0].id,
      }));
    }
  }, [showRoomModal, editingRoom, roomTypes]);

  const loadData = async () => {
  try {
    setLoading(true);
    setError('');
    console.log(' Loading room data...');
    const [roomTypesData, roomsData] = await Promise.all([
      getRoomTypes(),
      getRooms()
    ]);
    console.log(' Room types loaded:', roomTypesData);
    console.log(' Rooms loaded:', roomsData);
    
    setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);
    
    // Gán roomType cho từng phòng
    const roomsWithType = (Array.isArray(roomsData) ? roomsData : []).map(room => ({
      ...room,
      roomType: roomTypesData.find(rt => rt.id === room.roomTypeId)
    }));
    
    // Chỉ lọc phòng có số phòng
    const validRooms = roomsWithType.filter(room => 
      room.roomNumber && room.roomNumber.trim() !== ''
    );
    
    // Sắp xếp giảm dần theo id
    validRooms.sort((a, b) => b.id - a.id);
    setRooms(validRooms);
    setCurrentPage(1);
    console.log(' Valid rooms after filter:', validRooms);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
    setError(message);
    showToast('danger', message);
    console.error(' Load data error:', err);
  } finally {
    setLoading(false);
  }
};


  const handleRoomTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingRoomType) {
        await updateRoomType(editingRoomType.id, roomTypeForm);
        showToast('success', 'Cập nhật loại phòng thành công');
      } else {
        await createRoomType(roomTypeForm);
        showToast('success', 'Tạo loại phòng thành công');
      }
      await loadData();
      handleCloseRoomTypeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu loại phòng';
      showToast('danger', message);
      console.error(' Room type submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoomType = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này?')) return;
    try {
      setLoading(true);
      await deleteRoomType(id);
      showToast('success', 'Xóa loại phòng thành công');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa loại phòng';
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  // ========== Image Handlers ==========
  const handleAddImage = async () => {
    if (!editingRoomType || !newImageUrl.trim()) return;
    try {
      setLoading(true);
      await addRoomImage(editingRoomType.id, newImageUrl.trim(), isPrimaryImage);
      showToast('success', 'Thêm ảnh thành công');
      setNewImageUrl('');
      setIsPrimaryImage(false);
      await loadData(); // Reload to show updated images
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi thêm ảnh';
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      setLoading(true);
      await removeRoomImage(imageId);
      showToast('success', 'Xóa ảnh thành công');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa ảnh';
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      setLoading(true);
      await setPrimaryImage(imageId);
      showToast('success', 'Đặt ảnh chính thành công');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi đặt ảnh chính';
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  // ========== Room Handlers ==========
  const handleRoomSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    setError('');

    if (editingRoom) {
      await updateRoom(editingRoom.id, { ...roomForm });
      showToast('success', 'Cập nhật phòng thành công');
    } else {
      const createdRoom = await createRoom({ ...roomForm });
      if (!createdRoom || !createdRoom.id) {
        throw new Error('Tạo phòng thất bại, dữ liệu trả về không hợp lệ');
      }

      const enrichedRoom = {
        ...createdRoom,
        roomType: roomTypes.find(rt => rt.id === createdRoom.roomTypeId) ?? createdRoom.roomType,
      };
      setRooms(prev => [enrichedRoom, ...prev]);
      showToast('success', `Tạo phòng ${createdRoom.roomNumber} thành công`);
    }

    handleCloseRoomModal();
    await loadData();
  } catch (err: any) {
    const message = err?.response?.data?.message || err.message || 'Lỗi khi lưu phòng';
    showToast('danger', message);
    console.error('Room submit error:', err);
  } finally {
    setLoading(false);
  }
};
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      setLoading(true);
      await deleteRoom(id);
      showToast('success', 'Xóa phòng thành công');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa phòng';
      showToast('danger', message);
    } finally {
      setLoading(false);
    }
  };

  // ========== Modal Handlers ==========
  const handleShowRoomTypeModal = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setRoomTypeForm({
        name: roomType.name || '',
        description: roomType.description || '',
        basePrice: roomType.basePrice,
        maxOccupancy: roomType.maxOccupancy,
        size: roomType.size,
        isActive: roomType.isActive
      });
    } else {
      setEditingRoomType(null);
      setRoomTypeForm({
        name: '',
        description: '',
        basePrice: 0,
        maxOccupancy: 1,
        size: 0,
        isActive: true
      });
    }
    setNewImageUrl('');
    setIsPrimaryImage(false);
    setShowRoomTypeModal(true);
  };

  const handleCloseRoomTypeModal = () => {
    setShowRoomTypeModal(false);
    setEditingRoomType(null);
  };

  const handleShowRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        roomTypeId: room.roomTypeId,
        roomNumber: room.roomNumber || '',
        status: room.status || 'Available',
        floor: room.floor
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : 0,
        roomNumber: '',
        status: 'Available',
        floor: 1
      });
    }
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleShowDetailModal = (item: RoomType | Room, isRoom: boolean) => {
    setSelectedItem(item);
    setIsRoomDetail(isRoom);
    setShowDetailModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Occupied': return 'danger';
      case 'Cleaning': return 'warning';
      case 'Maintenance': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Quản lý Phòng</h2>
          <p className="text-muted">Quản lý loại phòng và phòng trong khách sạn</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Tabs defaultActiveKey="rooms" className="mb-4">
        {/* Rooms Tab */}
        <Tab eventKey="rooms" title={<><FaBed className="me-2" />Phòng</>}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Danh sách phòng</h5>
              <Button
                variant="primary"
                onClick={() => handleShowRoomModal()}
                disabled={loading || roomTypes.length === 0}
              >
                <FaPlus className="me-2" />
                Thêm phòng
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải...</p>
                </div>
              ) : rooms.length === 0 ? (
                <Alert variant="info" className="text-center">
                  Chưa có phòng nào. {roomTypes.length === 0 ? 'Vui lòng tạo loại phòng trước.' : 'Nhấn "Thêm phòng" để tạo phòng mới.'}
                </Alert>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '70vh', overflow: 'auto' }}>
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Số phòng</th>
                        <th>Loại phòng</th>
                        <th>Tầng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRooms.map(room => (
                        <tr key={room.id}>
                          <td>{room.id}</td>
                          <td><strong>{room.roomNumber}</strong></td>
                          <td>{room.roomType?.name || 'N/A'}</td>
                          <td>{room.floor}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(room.status || 'Available')}>
                              {room.status || 'Available'}
                            </Badge>
                          </td>
                          <td className="d-flex gap-2">
                            <Button variant="outline-info" size="sm" onClick={() => handleShowDetailModal(room, true)}>
                              <FaEye />
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={() => handleShowRoomModal(room)}>
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                              <FaTrash />
                            </Button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </Table>
                  {rooms.length > itemsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted">Hiển thị {paginatedRooms.length} trên {rooms.length} phòng</div>
                      <div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                          « Trước
                        </Button>
                        {Array.from({ length: totalPages }, (_, index) => (
                          <Button
                            key={index}
                            variant={currentPage === index + 1 ? 'primary' : 'outline-secondary'}
                            size="sm"
                            className="mx-1"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                          Sau »
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Room Types Tab */}
        <Tab eventKey="roomTypes" title={<><FaBuilding className="me-2" />Loại phòng</>}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Danh sách loại phòng</h5>
              <Button variant="primary" onClick={() => handleShowRoomTypeModal()}>
                <FaPlus className="me-2" />
                Thêm loại phòng
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải...</p>
                </div>
              ) : roomTypes.length === 0 ? (
                <Alert variant="info" className="text-center">
                  Chưa có loại phòng nào. Nhấn "Thêm loại phòng" để tạo loại phòng mới.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Giá cơ bản</th>
                        <th>Sức chứa</th>
                        <th>Diện tích</th>
                        <th>Hoạt động</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomTypes.map(roomType => (
                        <tr key={roomType.id}>
                          <td>{roomType.id}</td>
                          <td><strong>{roomType.name}</strong></td>
                          <td>{formatCurrency(roomType.basePrice)}</td>
                          <td>{roomType.maxOccupancy} người</td>
                          <td>{roomType.size} m²</td>
                          <td>
                            <Badge bg={roomType.isActive ? 'success' : 'secondary'}>
                              {roomType.isActive ? 'Có' : 'Không'}
                            </Badge>
                           </td>
                          <td>
                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowDetailModal(roomType, false)}>
                              <FaEye />
                            </Button>
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowRoomTypeModal(roomType)}>
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRoomType(roomType.id)}>
                              <FaTrash />
                            </Button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Room Type Modal */}
      <Modal show={showRoomTypeModal} onHide={handleCloseRoomTypeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRoomType ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRoomTypeSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên loại phòng *</Form.Label>
                  <Form.Control
                    type="text"
                    value={roomTypeForm.name}
                    onChange={(e) => setRoomTypeForm({...roomTypeForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá cơ bản (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomTypeForm.basePrice}
                    onChange={(e) => setRoomTypeForm({...roomTypeForm, basePrice: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sức chứa tối đa *</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomTypeForm.maxOccupancy}
                    onChange={(e) => setRoomTypeForm({...roomTypeForm, maxOccupancy: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diện tích (m²) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomTypeForm.size}
                    onChange={(e) => setRoomTypeForm({...roomTypeForm, size: Number(e.target.value)})}
                    min="0"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roomTypeForm.description}
                onChange={(e) => setRoomTypeForm({...roomTypeForm, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Hoạt động"
                checked={roomTypeForm.isActive}
                onChange={(e) => setRoomTypeForm({...roomTypeForm, isActive: e.target.checked})}
              />
            </Form.Group>

            {/* Image Management */}
            {editingRoomType && editingRoomType.roomImages && editingRoomType.roomImages.length > 0 && (
              <div className="mb-3">
                <Form.Label>Ảnh hiện tại</Form.Label>
                <Row>
                  {editingRoomType.roomImages.map((image) => (
                    <Col md={4} key={image.id} className="mb-3">
                      <Card>
                        <Card.Img variant="top" src={image.imageUrl} style={{ height: '150px', objectFit: 'cover' }} />
                        <Card.Body className="p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            {image.isPrimary && <Badge bg="primary">Ảnh chính</Badge>}
                            <div>
                              {!image.isPrimary && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleSetPrimaryImage(image.id)}
                                >
                                  Đặt chính
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveImage(image.id)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <div className="mb-3">
              <Form.Label>Thêm ảnh mới</Form.Label>
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="url"
                    placeholder="Nhập URL ảnh"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Check
                    type="checkbox"
                    label="Ảnh chính"
                    checked={isPrimaryImage}
                    onChange={(e) => setIsPrimaryImage(e.target.checked)}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-success"
                    onClick={handleAddImage}
                    disabled={!newImageUrl.trim()}
                  >
                    Thêm
                  </Button>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseRoomTypeModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              {editingRoomType ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Room Modal */}
      <Modal show={showRoomModal} onHide={handleCloseRoomModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRoomSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Loại phòng *</Form.Label>
              <Form.Select
                value={roomForm.roomTypeId}
                onChange={(e) => setRoomForm({...roomForm, roomTypeId: Number(e.target.value)})}
                required
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số phòng *</Form.Label>
                  <Form.Control
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tầng *</Form.Label>
                  <Form.Control
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({...roomForm, floor: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={roomForm.status}
                onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
              >
                <option value="Available">Sẵn sàng</option>
                <option value="Occupied">Đang sử dụng</option>
                <option value="Cleaning">Đang dọn dẹp</option>
                <option value="Maintenance">Bảo trì</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseRoomModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              {editingRoom ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết {isRoomDetail ? 'phòng' : 'loại phòng'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            isRoomDetail ? (
              <div>
                <p><strong>ID:</strong> {(selectedItem as Room).id}</p>
                <p><strong>Số phòng:</strong> {(selectedItem as Room).roomNumber}</p>
                <p><strong>Loại phòng:</strong> {(selectedItem as Room).roomType?.name}</p>
                <p><strong>Tầng:</strong> {(selectedItem as Room).floor}</p>
                <p><strong>Trạng thái:</strong> <Badge bg={getStatusBadgeVariant((selectedItem as Room).status || 'Available')}>{(selectedItem as Room).status}</Badge></p>
              </div>
            ) : (
              <div>
                <p><strong>ID:</strong> {(selectedItem as RoomType).id}</p>
                <p><strong>Tên:</strong> {(selectedItem as RoomType).name}</p>
                <p><strong>Mô tả:</strong> {(selectedItem as RoomType).description}</p>
                <p><strong>Giá cơ bản:</strong> {formatCurrency((selectedItem as RoomType).basePrice)}</p>
                <p><strong>Sức chứa:</strong> {(selectedItem as RoomType).maxOccupancy} người</p>
                <p><strong>Diện tích:</strong> {(selectedItem as RoomType).size} m²</p>
                <p><strong>Hoạt động:</strong> <Badge bg={(selectedItem as RoomType).isActive ? 'success' : 'secondary'}>{(selectedItem as RoomType).isActive ? 'Có' : 'Không'}</Badge></p>
              </div>
            )
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RoomManagement;