import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, ProgressBar, Tabs, Tab, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaWrench, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import { showToast } from '../../components/common/ToastNotification';
import { getRooms } from '../../api/rooms';
import { Room } from '../../types';

interface Equipment {
  id: number;
  itemCode?: string;
  name?: string;
  category?: string;
  unit?: string;
  totalQuantity: number;
  inUseQuantity: number;
  damagedQuantity: number;
  liquidatedQuantity: number;
  inStockQuantity: number;
  basePrice: number;
  defaultPriceIfLost: number;
  supplier?: string;
  isActive: boolean;
  imageUrl?: string;
}

interface RoomInventory {
  id: number;
  roomId: number;
  equipmentId: number;
  quantity: number;
  priceIfLost: number;
  note?: string;
  isActive?: boolean;
  itemType?: string;
  equipment?: Equipment;
  room?: { id: number; roomNumber?: string };
}

const API_BASE_URL = 'http://localhost:5002/api';

const SuppliesManagement: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('equipment');

  // Equipment management
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState<Partial<Equipment>>({});

  // Damage reporting and inventory display
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [roomInventory, setRoomInventory] = useState<RoomInventory[]>([]);
  const [damageForm, setDamageForm] = useState({
    roomInventoryId: 0,
    quantity: 1,
    description: '',
    imageUrl: ''
  });

  // Room inventory management
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    roomId: 0,
    equipmentId: 0,
    quantity: 1,
    priceIfLost: 0,
    note: '',
    itemType: 'Asset'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEquipments(),
        loadRooms()
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
      });
      if (!response.ok) throw new Error('Failed to load equipments');
      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      showToast('danger', 'Không thể tải danh sách thiết bị');
    }
  };

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Load rooms error:', error);
    }
  };

  const loadRoomInventory = async (roomId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/room-inventory/room/${roomId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
      });
      if (!response.ok) throw new Error('Failed to load room inventory');
      const data = await response.json();
      setRoomInventory(data);
    } catch (error) {
      showToast('danger', 'Không thể tải inventory phòng');
    }
  };

  const handleCreateEquipment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentForm),
      });
      if (!response.ok) throw new Error('Failed to create equipment');
      await loadEquipments();
      setShowEquipmentModal(false);
      setEquipmentForm({});
      showToast('success', 'Đã tạo thiết bị mới');
    } catch (error) {
      showToast('danger', 'Không thể tạo thiết bị');
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment) return;
    try {
      const response = await fetch(`${API_BASE_URL}/equipments/${editingEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editingEquipment, ...equipmentForm }),
      });
      if (!response.ok) throw new Error('Failed to update equipment');
      await loadEquipments();
      setShowEquipmentModal(false);
      setEditingEquipment(null);
      setEquipmentForm({});
      showToast('success', 'Đã cập nhật thiết bị');
    } catch (error) {
      showToast('danger', 'Không thể cập nhật thiết bị');
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/equipments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete equipment');
      await loadEquipments();
      showToast('success', 'Đã xóa thiết bị');
    } catch (error) {
      showToast('danger', 'Không thể xóa thiết bị');
    }
  };

  const handleReportDamage = async () => {
    if (!selectedRoomId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/loss-and-damages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingDetailId: null, // Will be set by backend based on room
          roomInventoryId: damageForm.roomInventoryId,
          quantity: damageForm.quantity,
          penaltyAmount: 0, // Will be calculated by backend
          description: damageForm.description,
          imageUrl: damageForm.imageUrl,
        }),
      });
      if (!response.ok) throw new Error('Failed to report damage');
      showToast('success', 'Đã báo cáo hư hỏng');
      setDamageForm({ roomInventoryId: 0, quantity: 1, description: '', imageUrl: '' });
    } catch (error) {
      showToast('danger', 'Không thể báo cáo hư hỏng');
    }
  };

  const handleDeleteRoomInventory = async (id: number) => {
    if (!window.window.confirm('Bạn có chắc muốn xóa item inventory này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/room-inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete room inventory');
      if (selectedRoomId) await loadRoomInventory(selectedRoomId);
      showToast('success', 'Đã xóa item inventory');
    } catch (error) {
      showToast('danger', 'Không thể xóa item inventory');
    }
  };

  const handleCreateRoomInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/room-inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryForm),
      });
      if (!response.ok) throw new Error('Failed to create room inventory');
      if (selectedRoomId) await loadRoomInventory(selectedRoomId);
      setShowInventoryModal(false);
      setInventoryForm({ roomId: 0, equipmentId: 0, quantity: 1, priceIfLost: 0, note: '', itemType: 'Asset' });
      showToast('success', 'Đã tạo item inventory');
    } catch (error) {
      showToast('danger', 'Không thể tạo item inventory');
    }
  };

  const getStockStatus = (equipment: Equipment) => {
    const stockRatio = equipment.inStockQuantity / Math.max(equipment.totalQuantity * 0.1, 1);
    if (stockRatio < 0.2) return { color: 'danger', text: 'Sắp hết' };
    if (stockRatio < 0.5) return { color: 'warning', text: 'Cảnh báo' };
    return { color: 'success', text: 'Tốt' };
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></div>;
  }

  const lowStockCount = equipments.filter(e => getStockStatus(e).color === 'danger').length;

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4>Quản lý vật tư & thiết bị</h4>
              <p className="text-muted">Theo dõi tồn kho và định mức phòng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-danger text-white">
            <Card.Body>
              <FaExclamationTriangle size={30} />
              <h5>Sắp hết hàng</h5>
              <h2>{lowStockCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <FaWrench size={30} />
              <h5>Tổng thiết bị</h5>
              <h2>{equipments.length}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'equipment')} className="mb-4">
        <Tab eventKey="equipment" title="Danh sách thiết bị">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Thiết bị khách sạn</h5>
              <Button variant="primary" size="sm" onClick={() => setShowEquipmentModal(true)}>
                <FaPlus /> Thêm thiết bị
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map(e => {
                    const status = getStockStatus(e);
                    return (
                      <tr key={e.id}>
                        <td>{e.itemCode}</td>
                        <td>{e.name}</td>
                        <td>{e.category}</td>
                        <td>
                          <ProgressBar
                            now={(e.inStockQuantity / Math.max(e.totalQuantity, 1)) * 100}
                            label={`${e.inStockQuantity}/${e.totalQuantity}`}
                            variant={status.color}
                            style={{ height: '20px' }}
                          />
                        </td>
                        <td><Badge bg={status.color}>{status.text}</Badge></td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setEditingEquipment(e); setEquipmentForm(e); setShowEquipmentModal(true); }}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEquipment(e.id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="damage" title="Báo cáo hư hỏng">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Báo cáo hư hỏng/thiếu hụt</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Chọn phòng</Form.Label>
                    <Form.Select
                      value={selectedRoomId || ''}
                      onChange={(e) => {
                        const roomId = Number(e.target.value);
                        setSelectedRoomId(roomId);
                        if (roomId) loadRoomInventory(roomId);
                      }}
                    >
                      <option value="">Chọn phòng</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.roomNumber}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedRoomId && roomInventory.length > 0 && (
                <Form>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Thiết bị</Form.Label>
                        <Form.Select
                          value={damageForm.roomInventoryId}
                          onChange={(e) => setDamageForm({ ...damageForm, roomInventoryId: Number(e.target.value) })}
                        >
                          <option value={0}>Chọn thiết bị</option>
                          {roomInventory.map(ri => (
                            <option key={ri.id} value={ri.id}>
                              {ri.equipment?.name} (Số lượng: {ri.quantity})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          value={damageForm.quantity}
                          onChange={(e) => setDamageForm({ ...damageForm, quantity: Number(e.target.value) })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={damageForm.description}
                          onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                          placeholder="Mô tả chi tiết hư hỏng..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Ảnh (URL)</Form.Label>
                        <Form.Control
                          type="url"
                          value={damageForm.imageUrl}
                          onChange={(e) => setDamageForm({ ...damageForm, imageUrl: e.target.value })}
                          placeholder="Link ảnh hư hỏng"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" onClick={handleReportDamage}>
                    <FaCamera className="me-2" /> Báo cáo hư hỏng
                  </Button>
                </Form>
              )}

              {selectedRoomId && roomInventory.length === 0 && (
                <Alert variant="info">Không tìm thấy định mức cho phòng này.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="inventory" title="Inventory phòng">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inventory thực tế theo phòng</h5>
              <Button variant="primary" size="sm" onClick={() => setShowInventoryModal(true)}>
                <FaPlus /> Thêm item
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Chọn phòng</Form.Label>
                    <Form.Select
                      value={selectedRoomId || ''}
                      onChange={(e) => {
                        const roomId = Number(e.target.value);
                        setSelectedRoomId(roomId);
                        if (roomId) loadRoomInventory(roomId);
                      }}
                    >
                      <option value="">Chọn phòng</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.roomNumber}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedRoomId && (
                <Table hover>
                  <thead>
                    <tr>
                      <th>Thiết bị</th>
                      <th>Loại</th>
                      <th>Số lượng</th>
                      <th>Giá nếu mất</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomInventory.map(ri => (
                      <tr key={ri.id}>
                        <td>{ri.equipment?.name}</td>
                        <td>{ri.itemType}</td>
                        <td>{ri.quantity}</td>
                        <td>{ri.priceIfLost.toLocaleString()} VNĐ</td>
                        <td>{ri.note}</td>
                        <td>{ri.isActive ? <Badge bg="success">Hoạt động</Badge> : <Badge bg="secondary">Ngừng</Badge>}</td>
                        <td>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteRoomInventory(ri.id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {!selectedRoomId && (
                <Alert variant="info">Vui lòng chọn phòng để xem inventory.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Equipment Modal */}
      <Modal show={showEquipmentModal} onHide={() => { setShowEquipmentModal(false); setEditingEquipment(null); setEquipmentForm({}); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEquipment ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã thiết bị</Form.Label>
                  <Form.Control
                    type="text"
                    value={equipmentForm.itemCode || ''}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, itemCode: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên thiết bị</Form.Label>
                  <Form.Control
                    type="text"
                    value={equipmentForm.name || ''}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    value={equipmentForm.category || ''}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn vị</Form.Label>
                  <Form.Control
                    type="text"
                    value={equipmentForm.unit || ''}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, unit: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tổng số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    value={equipmentForm.totalQuantity || 0}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, totalQuantity: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá gốc</Form.Label>
                  <Form.Control
                    type="number"
                    value={equipmentForm.basePrice || 0}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, basePrice: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowEquipmentModal(false); setEditingEquipment(null); setEquipmentForm({}); }}>
            Hủy
          </Button>
          <Button variant="primary" onClick={editingEquipment ? handleUpdateEquipment : handleCreateEquipment}>
            {editingEquipment ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Room Inventory Modal */}
      <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm inventory phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Phòng</Form.Label>
              <Form.Select
                value={inventoryForm.roomId}
                onChange={(e) => setInventoryForm({ ...inventoryForm, roomId: Number(e.target.value) })}
              >
                <option value={0}>Chọn phòng</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.roomNumber}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thiết bị</Form.Label>
              <Form.Select
                value={inventoryForm.equipmentId}
                onChange={(e) => setInventoryForm({ ...inventoryForm, equipmentId: Number(e.target.value) })}
              >
                <option value={0}>Chọn thiết bị</option>
                {equipments.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá nếu mất (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={inventoryForm.priceIfLost}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, priceIfLost: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Loại</Form.Label>
              <Form.Control
                type="text"
                value={inventoryForm.itemType}
                onChange={(e) => setInventoryForm({ ...inventoryForm, itemType: e.target.value })}
                placeholder="Asset / Consumable / Minibar..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                type="text"
                value={inventoryForm.note}
                onChange={(e) => setInventoryForm({ ...inventoryForm, note: e.target.value })}
                placeholder="Ghi chú thêm về mặt hàng"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInventoryModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreateRoomInventory}>
            Tạo item inventory
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SuppliesManagement;