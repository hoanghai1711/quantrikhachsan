import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTicketAlt, FaFileExcel } from 'react-icons/fa';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, bulkImportVouchers } from '../../api/voucher';
import { Voucher } from '../../types';
import { showToast } from '../../components/common/ToastNotification';

const VoucherManagement: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState(0);
  const [minBookingValue, setMinBookingValue] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('2026-12-31');
  const [search, setSearch] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load vouchers error:', error);
      setVouchers([]);
      showToast('danger', 'Không thể tải danh sách vouchers');
    }
  };

  const handleSave = async () => {
    if (!code || value <= 0) return showToast('warning', 'Nhập đủ thông tin');
    if (editing) {
      const updated = await updateVoucher(editing.id, { code, type, value, minBookingValue, validTo, usageLimit });
      setVouchers(prev => prev.map(v => v.id === updated.id ? updated : v));
      showToast('success', 'Cập nhật voucher');
    } else {
      const newV = await createVoucher({ code: code.toUpperCase(), type, value, minBookingValue, validFrom, validTo, usageLimit });
      setVouchers(prev => [...prev, newV]);
      showToast('success', 'Tạo voucher thành công');
    }
    setShowModal(false);
    resetForm();
  };

  const handleImport = async () => {
    if (!importFile) return showToast('warning', 'Chọn file Excel');
    setImportLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const vouchers_to_import = [];

          // Skip header row (index 0)
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim());
            if (parts.length >= 5 && parts[0]) {
              vouchers_to_import.push({
                code: parts[0].toUpperCase(),
                type: parts[1] === 'FIXED' ? 'FIXED' : 'PERCENT',
                value: parseFloat(parts[2]),
                minBookingValue: parseFloat(parts[3]) || 0,
                validFrom: parts[4] || new Date().toISOString().split('T')[0],
                validTo: parts[5] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                usageLimit: parseInt(parts[6]) || 100,
              });
            }
          }

          if (vouchers_to_import.length === 0) {
            showToast('warning', 'Không có voucher hợp lệ trong file');
            return;
          }

          const result = await bulkImportVouchers(vouchers_to_import);
          setVouchers(prev => [...prev, ...result.results]);
          showToast('success', `Nhập ${result.created} vouchers thành công`);
          if (result.errors?.length > 0) {
            showToast('warning', `${result.errors.length} lỗi: ${result.errors.slice(0, 3).join(', ')}`);
          }
          setShowImportModal(false);
          setImportFile(null);
        } catch (error: any) {
          showToast('danger', 'Lỗi khi đọc file: ' + error.message);
        } finally {
          setImportLoading(false);
        }
      };
      reader.readAsText(importFile);
    } catch (error: any) {
      showToast('danger', 'Lỗi import: ' + error.message);
      setImportLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null); 
    setCode(''); 
    setType('PERCENT'); 
    setValue(0); 
    setMinBookingValue(0); 
    setUsageLimit(100); 
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidTo('2026-12-31');
  };

  const getStatusColor = (validFrom: string, validTo: string): string => {
    const now = new Date();
    const from = new Date(validFrom);
    const to = new Date(validTo);

    if (now < from) return 'warning'; // Not yet active
    if (now > to) return 'secondary'; // Expired
    return 'success'; // Active
  };

  const getStatusLabel = (validFrom: string, validTo: string): string => {
    const now = new Date();
    const from = new Date(validFrom);
    const to = new Date(validTo);

    if (now < from) return 'Chưa kích hoạt';
    if (now > to) return 'Đã hết hạn';
    return 'Đang hoạt động';
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Xóa voucher?')) {
      await deleteVoucher(id);
      setVouchers(prev => prev.filter(v => v.id !== id));
      showToast('success', 'Đã xóa');
    }
  };

  return (
    <div>
      <Row className="mb-4">
        <Col><Card className="shadow-sm border-0"><Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Quản lý voucher</h4>
            <div className="gap-2 d-flex">
              <Button variant="success" onClick={() => setShowImportModal(true)}><FaFileExcel /> Import Excel</Button>
              <Button variant="primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}><FaPlus /> Tạo voucher</Button>
            </div>
          </div>
        </Card.Body></Card></Col>
      </Row>
      <Row className="mb-3"><Col md={6}><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control placeholder="Tìm mã voucher" value={search} onChange={e => setSearch(e.target.value)} /></InputGroup></Col></Row>
      <Card className="shadow-sm"><Card.Body className="p-0">
        <Table hover responsive><thead className="table-light"><tr><th>Mã</th><th>Giá trị</th><th>Điều kiện</th><th>Hạn</th><th>Sử dụng</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          {vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase())).map(v => (
            <tr key={v.id}>
              <td><FaTicketAlt className="me-2 text-primary" />{v.code}</td>
              <td>{v.type === 'PERCENT' ? `${v.value}%` : `${v.value.toLocaleString()} VND`}</td>
              <td>Tối thiểu {v.minBookingValue.toLocaleString()} VND</td>
              <td>
                <small>Từ: {new Date(v.validFrom).toLocaleDateString('vi-VN')}<br/>Đến: {new Date(v.validTo).toLocaleDateString('vi-VN')}</small>
              </td>
              <td>
                <small>{v.usedCount} / {v.usageLimit} lần</small>
                <div className="progress mt-1" style={{ height: '6px' }}>
                  <div className="progress-bar" style={{ width: `${(v.usedCount / v.usageLimit) * 100}%` }}/>
                </div>
              </td>
              <td><Badge bg={getStatusColor(v.validFrom, v.validTo)}>{getStatusLabel(v.validFrom, v.validTo)}</Badge></td>
              <td className="d-flex gap-2">
                <Button size="sm" variant="outline-primary" onClick={() => { setEditing(v); setCode(v.code); setType(v.type as any); setValue(v.value); setMinBookingValue(v.minBookingValue); setUsageLimit(v.usageLimit); setValidFrom(v.validFrom); setValidTo(v.validTo); setShowModal(true); }}><FaEdit /></Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(v.id)}><FaTrash /></Button>
              </td>
            </tr>
          ))}
        </tbody></Table>
      </Card.Body></Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}><Modal.Header closeButton><Modal.Title>{editing ? 'Sửa voucher' : 'Thêm voucher'}</Modal.Title></Modal.Header>
      <Modal.Body><Form>
        <Form.Group className="mb-2"><Form.Label>Mã</Form.Label><Form.Control value={code} onChange={e => setCode(e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Loại</Form.Label><Form.Select value={type} onChange={e => setType(e.target.value as any)}><option value="PERCENT">Phần trăm</option><option value="FIXED">Cố định</option></Form.Select></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Giá trị</Form.Label><Form.Control type="number" value={value} onChange={e => setValue(Number(e.target.value))} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Giá trị tối thiểu (VND)</Form.Label><Form.Control type="number" value={minBookingValue} onChange={e => setMinBookingValue(Number(e.target.value))} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Số lần sử dụng tối đa</Form.Label><Form.Control type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Bắt đầu</Form.Label><Form.Control type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Kết thúc</Form.Label><Form.Control type="date" value={validTo} onChange={e => setValidTo(e.target.value)} /></Form.Group>
      </Form></Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button><Button variant="primary" onClick={handleSave}>Lưu</Button></Modal.Footer></Modal>

      <Modal show={showImportModal} onHide={() => { setShowImportModal(false); setImportFile(null); }}><Modal.Header closeButton><Modal.Title>Import Vouchers từ Excel</Modal.Title></Modal.Header>
      <Modal.Body>
        <p className="text-muted small">File CSV với cột: Mã, Loại (PERCENT/FIXED), Giá trị, Tối thiểu, Từ ngày, Đến ngày, Giới hạn</p>
        <Form.Group>
          <Form.Label>Chọn file CSV</Form.Label>
          <Form.Control type="file" accept=".csv" onChange={e => setImportFile((e.target as HTMLInputElement).files?.[0] || null)} />
        </Form.Group>
        <div className="mt-3 p-3 bg-light rounded">
          <small><strong>Ví dụ:</strong></small>
          <pre className="small mb-0">Mã,Loại,Giá trị,Tối thiểu,Từ,Đến,Giới hạn
SALE20,PERCENT,20,1000000,2026-04-20,2026-12-31,100
FIXED500,FIXED,500000,2000000,2026-04-20,2026-12-31,50</pre>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { setShowImportModal(false); setImportFile(null); }} disabled={importLoading}>Hủy</Button>
        <Button variant="primary" onClick={handleImport} disabled={importLoading || !importFile}>{importLoading ? 'Đang xử lý...' : 'Import'}</Button>
      </Modal.Footer></Modal>
    </div>
  );
};

export default VoucherManagement;