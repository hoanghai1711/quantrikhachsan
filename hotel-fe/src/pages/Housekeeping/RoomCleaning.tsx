import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Alert, Form, Modal, Badge, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { fetchCleaningRooms, updateRoomCleaningStatus, createLossAndDamage, fetchRoomInventory } from '../../api/rooms';
import { Room, RoomInventory } from '../../types';
import { showToast } from '../../components/common/ToastNotification';
import { FaBroom, FaExclamationTriangle, FaFilter, FaSearch } from 'react-icons/fa';

const RoomCleaning: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [bookingDetailId, setBookingDetailId] = useState<number | null>(null);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedRoomForDamage, setSelectedRoomForDamage] = useState<Room | null>(null);
  const [roomInventory, setRoomInventory] = useState<RoomInventory[]>([]);
  const [damageItems, setDamageItems] = useState<{[key: number]: { quantity: number; description: string; image?: File }}>({});
  const [floorFilter, setFloorFilter] = useState<number | null>(null);
  const [roomTypeFilter, setRoomTypeFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    const data = await fetchCleaningRooms();
    setRooms(data);
    setFilteredRooms(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let filtered = rooms;

    if (floorFilter !== null) {
      filtered = filtered.filter(room => room.floor === floorFilter);
    }

    if (roomTypeFilter !== null) {
      filtered = filtered.filter(room => room.roomTypeId === roomTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  }, [rooms, floorFilter, roomTypeFilter, searchTerm]);

  const complete = async (id: number) => {
    try {
      await updateRoomCleaningStatus(id, 'Clean');
      showToast('success', 'Đã hoàn tất dọn phòng');
      load();
    } catch (error) {
      showToast('danger', 'Lỗi khi cập nhật trạng thái phòng');
    }
  };

  const openDamageModal = async (room: Room) => {
    setSelectedRoomForDamage(room);
    setBookingDetailId(room.bookingDetails?.[0]?.id ?? null);
    setDamageItems({});
    setShowDamageModal(true);

    try {
      const inventory = await fetchRoomInventory(room.id);
      setRoomInventory(inventory);
    } catch (error) {
      showToast('danger', 'Không thể tải danh sách vật tư phòng');
    }
  };

  const handleDamageItemChange = (inventoryId: number, field: string, value: any) => {
    setDamageItems(prev => ({
      ...prev,
      [inventoryId]: {
        ...prev[inventoryId],
        [field]: value
      }
    }));
  };

  const handleDamageItemFileChange = (inventoryId: number, file: File | null) => {
    setDamageItems(prev => ({
      ...prev,
      [inventoryId]: {
        ...prev[inventoryId],
        image: file || undefined,
      }
    }));
  };

  const submitDamageReport = async () => {
    if (!bookingDetailId) {
      showToast('danger', 'Không tìm thấy chi tiết đặt phòng để báo hỏng');
      return;
    }

    try {
      for (const [inventoryId, damage] of Object.entries(damageItems)) {
        if (damage.quantity > 0) {
          await createLossAndDamage({
            bookingDetailId,
            roomInventoryId: parseInt(inventoryId),
            quantity: damage.quantity,
            penaltyAmount: damage.quantity * (roomInventory.find(ri => ri.id === parseInt(inventoryId))?.priceIfLost || 0),
            description: damage.description || 'Hư hỏng vật tư phòng',
          });
        }
      }

      showToast('success', 'Báo cáo hư hỏng đã được gửi');
      setShowDamageModal(false);
      setSelectedRoomForDamage(null);
      setDamageItems({});
    } catch (error) {
      showToast('danger', 'Lỗi khi gửi báo cáo hư hỏng');
    }
  };

  const getCleaningStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'clean':
        return <Badge bg="success">Sạch</Badge>;
      case 'cleaning':
        return <Badge bg="warning">Đang dọn</Badge>;
      case 'inspecting':
        return <Badge bg="info">Đang kiểm tra</Badge>;
      default:
        return <Badge bg="secondary">Chưa dọn</Badge>;
    }
  };

  const getUniqueFloors = () => {
    const floors = Array.from(new Set(rooms.map(room => room.floor))).sort((a, b) => a - b);
    return floors;
  };

  const getUniqueRoomTypes = () => {
    const roomTypes = rooms
      .map(room => room.roomType)
      .filter((rt, index, arr) => rt && arr.findIndex(r => r?.id === rt.id) === index);
    return roomTypes;
  };

  return (
    <div>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h4><FaBroom className="me-2" />Danh sách phòng cần dọn</h4>
            <div className="d-flex gap-2">
              <InputGroup style={{ width: '250px' }}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Tìm phòng..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <DropdownButton
                variant="outline-secondary"
                title={<><FaFilter className="me-1" />Tầng {floorFilter || 'Tất cả'}</>}
                onSelect={(floor) => setFloorFilter(floor ? parseInt(floor) : null)}
              >
                <Dropdown.Item eventKey="">Tất cả tầng</Dropdown.Item>
                {getUniqueFloors().map(floor => (
                  <Dropdown.Item key={floor} eventKey={floor.toString()}>Tầng {floor}</Dropdown.Item>
                ))}
              </DropdownButton>
              <DropdownButton
                variant="outline-secondary"
                title="Loại phòng"
                onSelect={(roomTypeId) => setRoomTypeFilter(roomTypeId ? parseInt(roomTypeId) : null)}
              >
                <Dropdown.Item eventKey="">Tất cả loại</Dropdown.Item>
                {getUniqueRoomTypes().map(rt => rt && (
                  <Dropdown.Item key={rt.id} eventKey={rt.id.toString()}>{rt.name}</Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
          </div>
        </Card.Body>
      </Card>

      {filteredRooms.length === 0 ? (
        <Alert variant="info">Không có phòng cần dọn</Alert>
      ) : (
        <Row className="g-3">
          {filteredRooms.map(room => (
            <Col md={4} key={room.id}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">Phòng {room.roomNumber}</h5>
                    {getCleaningStatusBadge(room.cleaningStatus)}
                  </div>
                  <p className="text-muted mb-1">Tầng {room.floor}</p>
                  <p className="text-muted mb-1">{room.roomType?.name}</p>
                  <p className="text-muted mb-3">Trạng thái: {room.status}</p>

                  <div className="mt-auto">
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        className="flex-fill"
                        onClick={() => complete(room.id)}
                      >
                        <FaBroom className="me-1" />Hoàn tất dọn
                      </Button>
                      <Button
                        variant="outline-warning"
                        className="flex-fill"
                        onClick={() => openDamageModal(room)}
                      >
                        <FaExclamationTriangle className="me-1" />Báo hư hỏng
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Damage Report Modal */}
      <Modal show={showDamageModal} onHide={() => setShowDamageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo hư hỏng - Phòng {selectedRoomForDamage?.roomNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roomInventory.length === 0 ? (
            <Alert variant="info">Không có vật tư trong phòng này</Alert>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Vật tư</th>
                    <th>Số lượng hiện có</th>
                    <th>Số lượng thiếu/hỏng</th>
                    <th>Ảnh</th>
                    <th>Giá đền</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {roomInventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.equipment?.name || 'N/A'}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={damageItems[item.id]?.quantity || 0}
                          onChange={e => handleDamageItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDamageItemFileChange(item.id, e.target.files?.[0] || null)}
                        />
                        {damageItems[item.id]?.image && (
                          <div className="mt-1 text-truncate" style={{ maxWidth: 180 }}>
                            {damageItems[item.id]?.image?.name}
                          </div>
                        )}
                      </td>
                      <td>{(damageItems[item.id]?.quantity || 0) * item.priceIfLost} VND</td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Mô tả hư hỏng..."
                          value={damageItems[item.id]?.description || ''}
                          onChange={e => handleDamageItemChange(item.id, 'description', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDamageModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={submitDamageReport}>
            Gửi báo cáo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoomCleaning;
