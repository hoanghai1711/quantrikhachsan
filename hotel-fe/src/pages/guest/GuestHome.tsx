import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Badge, Nav, Navbar,
  Modal, Carousel, Alert, Spinner
} from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaArrowRight, FaGem, FaSpa, FaUtensils, FaWifi, FaChevronDown, FaCheck, FaRulerCombined, FaBed, FaEye } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getRoomTypes, getRoomTypeById, searchAvailableRooms } from '../../api/rooms';
import { createBooking, createMomoPayment } from '../../api/booking';
import { getArticleCategories, getArticles, getAttractions, getArticleBySlug } from '../../api/content';
import { Article, ArticleCategory, Attraction, RoomType, Room } from '../../types';
import { showToast } from '../../components/common/ToastNotification';
import './GuestHome.css';

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const GuestHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  // Search state
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults] = useState<number | ''>('');
  const [children, setChildren] = useState<number | ''>('');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomLoadError, setRoomLoadError] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  // Content state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [attractionsData, setAttractionsData] = useState<Attraction[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingCode, setCreatedBookingCode] = useState('');

  // Detail Modals State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<RoomType | null>(null);
  const [loadingRoomDetails, setLoadingRoomDetails] = useState(false);

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

  const [showAttractionModal, setShowAttractionModal] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null);

  const loadData = async () => {
    setLoadingRooms(true);
    setLoadingContent(true);
    try {
      // The API calls exactly matching the image shown
      const [types, fetchedArticles, fetchedCategories, fetchedAttractions] = await Promise.all([
        getRoomTypes(),
        getArticles(),
        getArticleCategories(),
        getAttractions()
      ]);

      const activeTypes = types.filter(t => t.isActive);
      setRoomTypes(activeTypes);
      setArticleCategories(fetchedCategories.filter(c => c.isActive));

      const cards = buildRoomTypeCards(activeTypes);
      setRecommendedRooms(cards.slice(0, 3));
      setSearchResults(cards);
      setArticles(fetchedArticles.slice(0, 4));
      setAttractionsData(fetchedAttractions.slice(0, 3));
    } catch (error) {
      console.error(error);
      setRoomLoadError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoadingRooms(false);
      setLoadingContent(false);
    }
  };

  const buildRoomTypeCards = (items: (RoomType | Room)[]) => {
    if (!items || items.length === 0) return [];
    
    // Check if it's Room[] (search results) or RoomType[] (initial load)
    // A room object has 'roomNumber' or 'id' while being a flatter structure than RoomType
    const isRoomArray = items.length > 0 && (items[0] as any).roomNumber !== undefined;

    if (isRoomArray) {
      const rooms = items as Room[];
      const groups: { [key: number]: any } = {};
      
      rooms.forEach(r => {
        const tid = r.roomTypeId;
        if (!tid) return;

        if (!groups[tid]) {
          const rt = r.roomType;
          groups[tid] = {
            roomTypeId: tid,
            typeName: rt?.name || `Hạng phòng ${tid}`,
            description: rt?.description || '',
            price: rt?.basePrice ?? 0,
            image: rt?.slug
              ? (rt.slug.startsWith('http://') || rt.slug.startsWith('https://')
                ? rt.slug
                : `/images/rooms/${rt.slug}.jpg`)
              : rt?.roomImages?.find(i => i.isPrimary)?.imageUrl || rt?.roomImages?.[0]?.imageUrl || DEFAULT_ROOM_IMAGE,
            amenities: rt?.roomAmenities?.map((ra: any) => ra.amenity?.name || ra.name).filter(Boolean) || [],
            capacity: rt?.maxOccupancy ?? ((rt?.capacityAdults || 2) + (rt?.capacityChildren || 0)),
            availableCount: 0
          };
        }
        groups[tid].availableCount++;
      });
      
      return Object.values(groups);
    } else {
      const types = items as RoomType[];
      return types.map(rt => ({
        roomTypeId: rt.id,
        typeName: rt.name || 'Phòng Cao Cấp',
        description: rt.description || '',
        price: rt.basePrice ?? 0,
        image: rt.slug
          ? (rt.slug.startsWith('http://') || rt.slug.startsWith('https://')
            ? rt.slug
            : `/images/rooms/${rt.slug}.jpg`)
          : rt.roomImages?.find(i => i.isPrimary)?.imageUrl || rt.roomImages?.[0]?.imageUrl || DEFAULT_ROOM_IMAGE,
        amenities: rt.roomAmenities?.map((ra: any) => ra.amenity?.name || ra.name).filter(Boolean) || [],
        capacity: rt.maxOccupancy ?? (rt.capacityAdults + rt.capacityChildren),
        availableCount: rt.rooms?.filter(r => r && r.status && r.status.toLowerCase() === 'available').length ?? 0
      }));
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = async () => {
    setIsSearched(true);
    setLoadingRooms(true);
    try {
      const cards = buildRoomTypeCards(roomTypes);
      const filtered = selectedRoomTypeId ? cards.filter(c => c.roomTypeId === selectedRoomTypeId) : cards;
      setSearchResults(filtered);
    } catch (error) {
      setRoomLoadError('Tìm kiếm thất bại.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleBookNow = (group: any) => {
    if (user) {
      setSelectedRoom(group);
      setGuestInfo({ fullName: '', email: '', phone: '' });
      setShowBookingModal(true);
    } else {
      showToast('warning', 'Vui lòng đăng nhập để đặt phòng!');
      navigate('/login');
    }
  };

  const handleGuestBooking = async () => {
    try {
      if (!guestInfo.phone) {
        showToast('warning', 'Vui lòng nhập số điện thoại');
        return;
      }
      if (adults === '' || adults < 1) {
        showToast('warning', 'Vui lòng nhập số lượng người lớn (tối thiểu 1)');
        return;
      }

      const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
      const booking = await createBooking({
        guestName: guestInfo.fullName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        checkIn,
        checkOut,
        adults: Number(adults),
        children: Number(children || 0),
        roomTypeId: selectedRoom.roomTypeId,
        nights
      });
      setCreatedBookingCode(booking.bookingCode);
      setBookingSuccess(true);
      showToast('success', `Đặt phòng thành công! Mã: ${booking.bookingCode}`);
    } catch (error: any) {
      showToast('danger', error.message || 'Đặt phòng thất bại.');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleViewRoom = async (roomId: number) => {
    setShowRoomModal(true);
    setLoadingRoomDetails(true);
    try {
      const data = await getRoomTypeById(roomId);
      setSelectedRoomDetails(data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phòng:', err);
    } finally {
      setLoadingRoomDetails(false);
    }
  };

  const handleViewArticle = async (slugOrId: string) => {
    setShowArticleModal(true);
    setLoadingArticle(true);
    try {
      const data = await getArticleBySlug(slugOrId);
      setSelectedArticle(data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết bài viết:', err);
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleViewAttraction = (attraction: any) => {
    setSelectedAttraction(attraction);
    setShowAttractionModal(true);
  };

  const getPrimaryImage = (room?: RoomType | null) => {
    if (!room) return undefined;
    // Ưu tiên lấy từ slug vì backend đang lưu URL ảnh ở trường slug
    if (room.slug && (room.slug.startsWith('http://') || room.slug.startsWith('https://'))) {
      return room.slug;
    }
    // Fallback sang roomImages
    return room.roomImages?.find(img => img.isPrimary)?.imageUrl 
      || room.roomImages?.[0]?.imageUrl;
  };

  const getAvailableCount = (room?: RoomType | null) => {
    if (!room?.rooms) return null;
    return room.rooms.filter(r => r?.status?.toLowerCase() === 'available').length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="guest-home">
      <Navbar sticky="top" className="guest-nav">
        <Container>
          <Navbar.Brand href="/" className="guest-brand">LUMEA</Navbar.Brand>
          <Nav className="ms-auto align-items-center d-none d-lg-flex">
            <Nav.Link href="#rooms">Phòng Nghỉ</Nav.Link>
            <Nav.Link href="#attractions">Khám Phá</Nav.Link>
            <Nav.Link href="#vouchers">Ưu Đãi</Nav.Link>
            <Nav.Link href="#blog">Cẩm Nang</Nav.Link>
            {user ? (
              <Button variant="link" onClick={handleLogout} className="nav-link border-0">Đăng Xuất</Button>
            ) : (
              <Button onClick={() => navigate('/login')} className="ms-3 rounded-pill px-4 btn-luxury py-2 shadow-sm" style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}>Đăng Nhập</Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <section className="hero-section">
        <Carousel fade controls={false} indicators={false} interval={5000}>
          <Carousel.Item className="hero-slide" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')` }}>
            <div className="hero-overlay">
              <Container>
                <div className="hero-content">
                  <span className="section-tag text-white">Lumea Luxury Hotel</span>
                  <h1 className="display-title mb-4">Nghệ thuật<br /> <span style={{ color: 'var(--gh-accent)' }}>Nghỉ dưỡng</span> Đỉnh cao</h1>
                  <p className="lead mb-5">Nơi sự sang trọng hội tụ cùng thiết kế tinh tế. Hãy để chúng tôi mang đến cho bạn những trải nghiệm không thể nào quên tại thành phố biển.</p>
                  <Button className="btn-luxury" onClick={() => document.getElementById('rooms')?.scrollIntoView()}>Khám phá ngay</Button>
                </div>
              </Container>
            </div>
          </Carousel.Item>
          <Carousel.Item className="hero-slide" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80')` }}>
            <div className="hero-overlay">
              <Container>
                <div className="hero-content">
                  <span className="section-tag text-white">Đặc quyền Thượng Lưu</span>
                  <h1 className="display-title mb-4">Tinh hoa<br /> <span style={{ color: 'var(--gh-accent)' }}>Ẩm thực & Spa</span></h1>
                  <p className="lead mb-5">Đánh thức mọi giác quan với những liệu pháp spa chuyên sâu và thực đơn chuẩn sao Michelin.</p>
                  <Button className="btn-luxury" onClick={() => document.getElementById('rooms')?.scrollIntoView()}>Đặt phòng ngay</Button>
                </div>
              </Container>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>

      <Container className="search-container">
        <div className="search-box-modern">
          <Row className="g-4 align-items-center">
            <Col lg={3} md={6}>
              <span className="search-field-label">Ngày nhận phòng</span>
              <div className="search-input-wrap">
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
            </Col>
            <Col lg={3} md={6}>
              <span className="search-field-label">Ngày trả phòng</span>
              <div className="search-input-wrap">
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              </div>
            </Col>
            <Col lg={2} md={4}>
              <span className="search-field-label">Số khách</span>
              <div className="search-input-wrap">
                <select value={adults} onChange={e => setAdults(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Chọn khách</option>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Người</option>)}
                </select>
                <FaChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gh-accent)' }} />
              </div>
            </Col>
            <Col lg={2} md={4}>
              <span className="search-field-label">Hạng phòng</span>
              <div className="search-input-wrap">
                <select value={selectedRoomTypeId || ''} onChange={e => setSelectedRoomTypeId(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Tất cả</option>
                  {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <FaChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gh-accent)' }} />
              </div>
            </Col>
            <Col lg={2} md={4} className="h-100">
              <Button className="btn-search h-100" onClick={handleSearch}>TÌM PHÒNG</Button>
            </Col>
          </Row>
        </div>
      </Container>

      <section id="rooms" className="section-padding">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
            <div>
              <span className="section-tag">Lựa chọn của bạn</span>
              <h2 className="display-title">{isSearched ? 'Kết Quả Tìm Kiếm' : 'Không Gian Sống'}</h2>
            </div>
            {!isSearched && (
              <Button variant="link" className="text-dark fw-bold text-decoration-none d-flex align-items-center gap-2">
                Xem tất cả phòng <FaArrowRight color="var(--gh-accent)" />
              </Button>
            )}
          </div>

          {loadingRooms ? (
            <div className="text-center py-5 my-5"><Spinner animation="border" variant="dark" /></div>
          ) : (
            <Row className="g-5">
              {(isSearched ? searchResults : recommendedRooms).map(group => (
                <Col lg={4} md={6} key={group.roomTypeId}>
                  <div className="room-card-v2">
                    <div className="room-image-wrap">
                      <img src={group.image} alt={group.typeName} />
                      <div className="room-price-tag">{group.price.toLocaleString()}đ <small className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>/ đêm</small></div>
                    </div>
                    <div className="room-card-body">
                      <h3 className="room-card-title">{group.typeName}</h3>
                      <div className="room-meta">
                        <span><FaUsers className="icon" /> {group.capacity} Khách</span>
                        <span><FaGem className="icon" /> {group.availableCount} Trống</span>
                      </div>
                      <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.8' }}>{group.description.substring(0, 120)}...</p>
                      <div className="d-flex gap-3">
                        <Button className="btn-outline-custom" onClick={() => handleBookNow(group)}>Đặt Ngay</Button>
                        <Button className="btn-circle" onClick={() => handleViewRoom(group.roomTypeId)}><FaArrowRight /></Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
              {(!loadingRooms && (isSearched ? searchResults : recommendedRooms).length === 0) && (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <h4 className="text-muted">Không tìm thấy phòng phù hợp với yêu cầu của bạn.</h4>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </Container>
      </section>

      <section className="section-padding bg-alt">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} className="order-lg-2">
              <div className="position-relative">
                <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" alt="About Lumea" className="w-100 rounded-5 shadow-lg" style={{ objectFit: 'cover', height: '600px' }} />
                <div className="position-absolute bg-white p-4 rounded-4 shadow" style={{ bottom: '-30px', left: '-30px', maxWidth: '300px' }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}><FaStar color="var(--gh-accent)" /></div>
                    <div>
                      <h4 className="mb-0 fw-bold">5 Sao</h4>
                      <small className="text-muted">Dịch vụ chuẩn quốc tế</small>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="order-lg-1">
              <span className="section-tag">Tiện ích đẳng cấp</span>
              <h2 className="display-title mb-4">Trải nghiệm <br /> Vượt kỳ vọng</h2>
              <p className="text-muted mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>Tại Lumea, chúng tôi không chỉ cung cấp nơi lưu trú, mà còn kiến tạo những khoảnh khắc đáng nhớ thông qua chuỗi dịch vụ cá nhân hóa tuyệt đỉnh.</p>

              <Row className="g-4 mb-5">
                {[
                  { icon: FaUtensils, title: 'Ẩm thực tinh hoa', desc: 'Nhà hàng sao Michelin' },
                  { icon: FaSpa, title: 'Zen Spa', desc: 'Trị liệu & Phục hồi' },
                  { icon: FaWifi, title: 'Kết nối mượt mà', desc: 'Wifi tốc độ cao miễn phí' },
                  { icon: FaGem, title: 'Butler Service', desc: 'Quản gia riêng 24/7' }
                ].map((item, i) => (
                  <Col sm={6} key={i}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                        <item.icon size={24} color="var(--gh-accent)" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{item.title}</h5>
                        <p className="text-muted small mb-0">{item.desc}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Attractions Section Added Based On API Calls */}
      <section id="attractions" className="section-padding">
        <Container>
          <div className="text-center mb-5">
            <span className="section-tag">Khám Phá Địa Phương</span>
            <h2 className="display-title">Điểm Đến Gợi Ý</h2>
            <p className="text-muted mx-auto mt-3" style={{ maxWidth: '600px' }}>Lumea có vị trí đắc địa, dễ dàng di chuyển đến các danh lam thắng cảnh và điểm vui chơi nổi tiếng nhất.</p>
          </div>

          {loadingContent ? (
            <div className="text-center py-5"><Spinner animation="border" variant="dark" /></div>
          ) : (
            <Row className="g-4">
              {attractionsData.length > 0 ? (
                attractionsData.map((attr: any) => (
                  <Col lg={4} md={6} key={attr.id}>
                    <div className="attraction-card" onClick={() => handleViewAttraction(attr)}>
                      {attr.mapLink && <img src={attr.mapLink} alt={attr.name} />}
                      <div className="attraction-overlay">
                        <div className="attraction-content">
                          {attr.distanceFromHotel !== undefined && (
                            <Badge bg="dark" className="mb-2 px-3 py-2" style={{ color: 'var(--gh-accent)' }}>
                              <FaMapMarkerAlt className="me-1" /> {attr.distanceFromHotel} km
                            </Badge>
                          )}
                          <h4>{attr.name}</h4>
                          <p className="mb-0 text-white-50 small text-truncate">{attr.description}</p>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                [1, 2, 3].map(i => (
                  <Col lg={4} md={6} key={i}>
                    <div className="attraction-card">
                      <div className="attraction-overlay">
                        <div className="attraction-content">
                          <h4>Đang cập nhật...</h4>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))
              )}
            </Row>
          )}
        </Container>
      </section>

      <section id="vouchers" className="section-padding bg-alt">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
            <div>
              <span className="section-tag">Ưu đãi</span>
              <h2 className="display-title">Đặc Quyền Hội Viên</h2>
            </div>
          </div>
          <Row className="g-4">
            {[
              { code: 'LUMEA24', off: '15%', min: '2 đêm', title: 'Ưu đãi nghỉ dưỡng dài ngày' },
              { code: 'SUMMER', off: '20%', min: '3 đêm', title: 'Chào hè rực rỡ' }
            ].map((v, i) => (
              <Col lg={6} key={i}>
                <div className="voucher-ticket">
                  <div className="text-center border-end pe-4" style={{ minWidth: '150px' }}>
                    <div className="discount-val">{v.off}</div>
                    <small className="d-block text-muted fw-bold tracking-widest mt-2">GIẢM GIÁ</small>
                  </div>
                  <div>
                    <Badge bg="dark" className="mb-3 px-3 py-2 rounded-pill" style={{ color: 'var(--gh-accent)', letterSpacing: '2px' }}>{v.code}</Badge>
                    <h4 className="mb-2 fw-bold" style={{ fontFamily: 'Playfair Display' }}>{v.title}</h4>
                    <ul className="list-unstyled mb-0 text-muted small">
                      <li className="mb-1"><FaCheck color="var(--gh-accent)" className="me-2" /> Áp dụng tối thiểu {v.min}</li>
                      <li><FaCheck color="var(--gh-accent)" className="me-2" /> Tặng kèm bữa sáng buffet</li>
                    </ul>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section id="blog" className="section-padding">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
            <div>
              <span className="section-tag">Góc cảm hứng</span>
              <h2 className="display-title">Cẩm Nang Lumea</h2>
            </div>
            <Button variant="link" className="text-dark fw-bold text-decoration-none d-flex align-items-center gap-2" onClick={() => navigate('/articles')}>
              Đọc thêm <FaArrowRight color="var(--gh-accent)" />
            </Button>
          </div>
          <div className="magazine-grid">
            {articles.slice(0, 4).map(art => (
              <div className="article-item" key={art.id} onClick={() => handleViewArticle(art.slug || art.id.toString())} style={{ cursor: 'pointer' }}>
                <img src={art.imageUrl || DEFAULT_ROOM_IMAGE} className="article-thumb" alt={art.title} />
                <div>
                  <Badge bg="light" text="dark" className="mb-2 px-3 py-2 rounded-pill border">
                    {articleCategories.find(c => c.id === art.categoryId)?.name || 'Cẩm nang'}
                  </Badge>
                  <h4 className="article-title">{art.title}</h4>
                  <p className="text-muted small mb-0 line-clamp-2">{art.content.substring(0, 100)}...</p>
                  <span className="text-muted small d-block mt-3"><FaCalendarAlt className="me-2" /> {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : today}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <footer className="footer-modern">
        <Container>
          <Row className="g-5">
            <Col lg={4}>
              <a href="#" className="guest-brand d-block mb-4">LUMEA</a>
              <p className="text-muted pe-4">Kiến tạo những chuẩn mực nghỉ dưỡng mới, nơi sự sang trọng giao thoa cùng bản sắc địa phương, đem đến những kỷ niệm vô giá.</p>
            </Col>
            <Col lg={2} md={6}>
              <h5 className="text-uppercase">Khám Phá</h5>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><a href="#rooms" className="text-decoration-none text-muted">Phòng nghỉ</a></li>
                <li><a href="#attractions" className="text-decoration-none text-muted">Điểm đến</a></li>
                <li><a href="#vouchers" className="text-decoration-none text-muted">Ưu đãi</a></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h5 className="text-uppercase">Liên Hệ</h5>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><strong className="text-white">A:</strong> 123 Beachfront, Da Nang</li>
                <li><strong className="text-white">T:</strong> +84 123 456 789</li>
                <li><strong className="text-white">E:</strong> hello@lumea.com</li>
              </ul>
            </Col>
            <Col lg={3}>
              <h5 className="text-uppercase">Bản Tin</h5>
              <p className="text-muted small mb-4">Đăng ký để nhận ưu đãi bí mật dành riêng cho bạn.</p>
              <div className="d-flex gap-2">
                <input type="email" className="footer-input w-100" placeholder="Email của bạn" />
                <Button className="btn-luxury px-4 py-0" style={{ borderRadius: '50px' }}><FaArrowRight /></Button>
              </div>
            </Col>
          </Row>
          <div className="pt-4 mt-5 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span className="text-muted small">&copy; 2026 Lumea Luxury Hotel. Tất cả quyền được bảo lưu.</span>
            <div className="d-flex gap-4 small text-muted">
              <a href="#" className="text-decoration-none text-muted">Chính sách bảo mật</a>
              <a href="#" className="text-decoration-none text-muted">Điều khoản sử dụng</a>
            </div>
          </div>
        </Container>
      </footer>

      {/* Booking Modal */}
      <Modal 
        show={showBookingModal} 
        onHide={() => setShowBookingModal(false)} 
        centered 
        size="lg"
        contentClassName="booking-modal-content border-0 shadow-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold h2 mb-0">Đặt Phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {bookingSuccess ? (
            <Alert variant="success" className="border-0 bg-success-subtle text-success rounded-4 p-4 text-center">
              <h5 className="fw-bold mb-2">Đặt phòng thành công!</h5>
              <p className="mb-3 small">Mã đặt phòng của bạn là: <strong>{createdBookingCode}</strong></p>
              <p className="mb-0 small">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            </Alert>
          ) : (
            <Form>
              <div className="bg-light p-3 rounded-4 mb-4 d-flex gap-3 align-items-center">
                {selectedRoom?.image && (
                  <img src={selectedRoom.image} alt="Room" className="rounded-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                )}
                <div>
                  <h6 className="fw-bold mb-1">{selectedRoom?.typeName}</h6>
                  {selectedRoom?.price !== undefined && (
                    <small className="text-muted d-block">{selectedRoom.price.toLocaleString()}đ / đêm</small>
                  )}
                  {selectedRoom?.capacity !== undefined && (
                    <small className="text-muted d-block">{selectedRoom.capacity} khách</small>
                  )}
                </div>
              </div>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Ngày nhận phòng</Form.Label>
                    <Form.Control type="date" className="bg-light border-0 py-3 rounded-4 px-4" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Ngày trả phòng</Form.Label>
                    <Form.Control type="date" className="bg-light border-0 py-3 rounded-4 px-4" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Người lớn</Form.Label>
                    <Form.Control type="number" min={1} className="bg-light border-0 py-3 rounded-4 px-4" value={adults} onChange={e => setAdults(e.target.value === '' ? '' : Number(e.target.value))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Trẻ em</Form.Label>
                    <Form.Control type="number" min={0} className="bg-light border-0 py-3 rounded-4 px-4" value={children} onChange={e => setChildren(e.target.value === '' ? '' : Number(e.target.value))} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Họ và tên</Form.Label>
                <Form.Control className="bg-light border-0 py-3 rounded-4 px-4" value={guestInfo.fullName} onChange={e => setGuestInfo({ ...guestInfo, fullName: e.target.value })} placeholder="Nguyễn Văn A" />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Email liên hệ</Form.Label>
                <Form.Control type="email" className="bg-light border-0 py-3 rounded-4 px-4" value={guestInfo.email} onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })} placeholder="email@example.com" />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase tracking-widest text-muted">Số điện thoại</Form.Label>
                <Form.Control className="bg-light border-0 py-3 rounded-4 px-4" value={guestInfo.phone} onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })} placeholder="0123456789" />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4 pt-0">
          {bookingSuccess ? (
            <Button className="btn-luxury w-100 py-3" onClick={() => {
              setShowBookingModal(false);
              setBookingSuccess(false);
              navigate(`/booking-success/${createdBookingCode}`);
            }}>
              Hoàn tất đặt phòng
            </Button>
          ) : (
            <Button className="btn-luxury w-100 py-3" onClick={handleGuestBooking} disabled={!guestInfo.fullName || !guestInfo.phone}>
              Tiến hành đặt phòng
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Room Detail Modal */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)} size="xl" centered contentClassName="border-0 bg-transparent">
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            className="rounded-circle position-absolute" 
            style={{top: '20px', right: '20px', zIndex: 100, width: '40px', height: '40px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}
            onClick={() => setShowRoomModal(false)}
          >
            ✕
          </Button>
          
          {loadingRoomDetails ? (
            <div className="bg-white rounded-5 d-flex justify-content-center align-items-center" style={{height: '600px'}}>
              <Spinner animation="border" style={{color: 'var(--gh-accent)'}} />
            </div>
          ) : selectedRoomDetails ? (
            <div className="bg-white rounded-5 overflow-hidden shadow-lg">
              {getPrimaryImage(selectedRoomDetails) && (
                <div style={{height: '400px', position: 'relative'}}>
                  <img src={getPrimaryImage(selectedRoomDetails)} alt={selectedRoomDetails.name} className="w-100 h-100" style={{objectFit: 'cover'}} />
                  <div className="position-absolute bottom-0 w-100 p-5" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'}}>
                    <Badge bg="dark" className="mb-3 px-3 py-2 rounded-pill" style={{letterSpacing: '1px', color: 'var(--gh-accent)'}}>
                      {(() => {
                        const availableCount = getAvailableCount(selectedRoomDetails);
                        if (availableCount === null) {
                          return selectedRoomDetails.isActive ? 'ĐANG KHẢ DỤNG' : 'HẾT PHÒNG';
                        }
                        return availableCount > 0 ? `CÒN ${availableCount} PHÒNG` : 'HẾT PHÒNG';
                      })()}
                    </Badge>
                    <h2 className="fw-bold text-white mb-2" style={{fontSize: '2rem'}}>{selectedRoomDetails.name}</h2>
                    <div className="d-flex gap-4 text-white">
                      <span className="d-flex align-items-center gap-2"><FaUsers className="text-accent" /> {selectedRoomDetails.maxOccupancy} Khách</span>
                      <span className="d-flex align-items-center gap-2"><FaRulerCombined className="text-accent" /> {selectedRoomDetails.size} m²</span>
                      <span className="d-flex align-items-center gap-2"><FaBed className="text-accent" /> {selectedRoomDetails.bedType}</span>
                      <span className="d-flex align-items-center gap-2"><FaEye className="text-accent" /> {selectedRoomDetails.viewType}</span>
                    </div>
                  </div>
                </div>
              )}
              {!getPrimaryImage(selectedRoomDetails) && (
                <div className="bg-dark p-5">
                    <Badge bg="light" text="dark" className="mb-3 px-3 py-2 rounded-pill" style={{letterSpacing: '1px'}}>
                      {selectedRoomDetails.isActive ? 'ĐANG KHẢ DỤNG' : 'HẾT PHÒNG'}
                    </Badge>
                    <h2 className="fw-bold text-white mb-2" style={{fontSize: '2rem'}}>{selectedRoomDetails.name}</h2>
                    <div className="d-flex gap-4 text-white">
                      <span className="d-flex align-items-center gap-2"><FaUsers className="text-accent" /> {selectedRoomDetails.maxOccupancy} Khách</span>
                      <span className="d-flex align-items-center gap-2"><FaRulerCombined className="text-accent" /> {selectedRoomDetails.size} m²</span>
                      <span className="d-flex align-items-center gap-2"><FaBed className="text-accent" /> {selectedRoomDetails.bedType}</span>
                      <span className="d-flex align-items-center gap-2"><FaEye className="text-accent" /> {selectedRoomDetails.viewType}</span>
                    </div>
                </div>
              )}
              <div className="p-5">
                <Row className="g-5">
                  <Col lg={8}>
                    <h4 className="font-playfair fw-bold mb-4">Tổng quan</h4>
                    <p className="text-muted mb-4" style={{lineHeight: '1.8'}}>{selectedRoomDetails.description} {selectedRoomDetails.content}</p>

                    {selectedRoomDetails.roomAmenities && selectedRoomDetails.roomAmenities.length > 0 && (
                      <>
                        <h4 className="font-playfair fw-bold mb-4 mt-5">Tiện nghi</h4>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedRoomDetails.roomAmenities.map(amenity => (
                            <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill fw-normal" key={amenity.id}>
                              <FaGem color="var(--gh-accent)" className="me-2" /> {amenity.name}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </Col>
                  <Col lg={4}>
                    <div className="p-4 bg-light rounded-4 text-center h-100 d-flex flex-column justify-content-center">
                      <small className="text-uppercase fw-bold text-muted tracking-widest d-block mb-2">Giá mỗi đêm</small>
                      <div className="fw-bold mb-4" style={{fontSize: '2.2rem', color: 'var(--gh-accent)'}}>
                        {formatCurrency(selectedRoomDetails.basePrice)}
                      </div>
                      <Button className="btn-luxury w-100 py-3" onClick={() => {
                        setShowRoomModal(false);
                        handleBookNow({
                          roomTypeId: selectedRoomDetails.id,
                          typeName: selectedRoomDetails.name,
                          image: getPrimaryImage(selectedRoomDetails)
                        });
                      }}>
                        ĐẶT PHÒNG NGAY
                      </Button>
                      <small className="text-muted d-block mt-3">* Đã bao gồm thuế và phí dịch vụ</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-5 p-5 text-center">Không tìm thấy thông tin phòng.</div>
          )}
        </Modal.Body>
      </Modal>

      {/* Article Detail Modal */}
      <Modal show={showArticleModal} onHide={() => setShowArticleModal(false)} size="xl" centered contentClassName="border-0 shadow-lg bg-transparent">
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            className="rounded-circle position-absolute" 
            style={{top: '20px', right: '20px', zIndex: 100, width: '40px', height: '40px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}
            onClick={() => setShowArticleModal(false)}
          >
            ✕
          </Button>
          
          {loadingArticle ? (
            <div className="bg-white rounded-5 d-flex justify-content-center align-items-center" style={{height: '600px'}}>
              <Spinner animation="border" style={{color: 'var(--gh-accent)'}} />
            </div>
          ) : selectedArticle ? (
            <div className="bg-white rounded-5 overflow-hidden">
              <Row className="g-0">
                {selectedArticle.imageUrl && (
                  <Col lg={5} className="d-none d-lg-block">
                    <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-100 h-100" style={{objectFit: 'cover', minHeight: '600px'}} />
                  </Col>
                )}
                <Col lg={selectedArticle.imageUrl ? 7 : 12}>
                  <div className="p-5 h-100 overflow-auto" style={{maxHeight: '80vh'}}>
                    {selectedArticle.category?.name && (
                      <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill mb-4">
                        {selectedArticle.category.name}
                      </Badge>
                    )}
                    <h2 className="fw-bold mb-3" style={{fontSize: '2rem', lineHeight: '1.2'}}>{selectedArticle.title}</h2>
                    <div className="d-flex gap-3 text-muted small mb-5 pb-4 border-bottom">
                      <span><FaCalendarAlt className="me-2" /> {selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleDateString() : today}</span>
                    </div>
                    
                    <div 
                      className="article-content" 
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p>Không có nội dung</p>' }} 
                      style={{lineHeight: '1.9', fontSize: '1.1rem', color: '#444'}}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="bg-white rounded-5 p-5 text-center">Không tìm thấy bài viết.</div>
          )}
        </Modal.Body>
      </Modal>

      {/* Attraction Detail Modal */}
      <Modal show={showAttractionModal} onHide={() => setShowAttractionModal(false)} size="xl" centered contentClassName="border-0 shadow-lg bg-transparent">
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            className="rounded-circle position-absolute" 
            style={{top: '20px', right: '20px', zIndex: 100, width: '40px', height: '40px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}
            onClick={() => setShowAttractionModal(false)}
          >
            ✕
          </Button>
          
          {selectedAttraction ? (
            <div className="bg-white rounded-5 overflow-hidden">
              <Row className="g-0">
                {selectedAttraction.mapLink && (
                  <Col lg={5} className="d-none d-lg-block">
                    <img src={selectedAttraction.mapLink} alt={selectedAttraction.name} className="w-100 h-100" style={{objectFit: 'cover', minHeight: '600px'}} />
                  </Col>
                )}
                <Col lg={selectedAttraction.mapLink ? 7 : 12}>
                  <div className="p-5 h-100 overflow-auto" style={{maxHeight: '80vh'}}>
                    <Badge bg="dark" className="mb-4 px-3 py-2 rounded-pill" style={{color: 'var(--gh-accent)', letterSpacing: '1px'}}>
                      ĐIỂM ĐẾN
                    </Badge>
                    <h2 className="fw-bold mb-3" style={{fontSize: '2rem', lineHeight: '1.2'}}>{selectedAttraction.name}</h2>
                    
                    <div className="d-flex flex-wrap gap-4 mb-5 pb-4 border-bottom text-muted small">
                      {selectedAttraction.distanceFromHotel !== undefined && (
                        <span className="d-flex align-items-center gap-2">
                          <FaMapMarkerAlt /> Cách khách sạn: {selectedAttraction.distanceFromHotel} km
                        </span>
                      )}
                      {selectedAttraction.address && (
                        <span className="d-flex align-items-center gap-2">
                          <FaMapMarkerAlt /> {selectedAttraction.address}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-playfair fw-bold mb-4">Mô tả</h4>
                    <div 
                      className="article-content" 
                      dangerouslySetInnerHTML={{ __html: selectedAttraction.description || '<p>Không có nội dung</p>' }} 
                      style={{lineHeight: '1.9', fontSize: '1.1rem', color: '#444'}}
                    />
                    
                    {(selectedAttraction.latitude && selectedAttraction.longitude) && (
                      <div className="mt-5 pt-4 border-top">
                        <h4 className="font-playfair fw-bold mb-4">Vị trí trên bản đồ</h4>
                        <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: '300px' }}>
                          <iframe 
                            src={`https://maps.google.com/maps?q=${selectedAttraction.latitude},${selectedAttraction.longitude}&hl=vi&z=15&output=embed`}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Bản đồ ${selectedAttraction.name}`}
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="bg-white rounded-5 p-5 text-center">Không tìm thấy địa điểm.</div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GuestHome;