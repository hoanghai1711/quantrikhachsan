import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Badge, Nav, Navbar,
  Modal, Carousel, Alert, Spinner
} from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getRoomTypes, searchAvailableRooms } from '../../api/rooms';
import { createBooking, getBookings } from '../../api/booking';
import { createReview } from '../../api/review';
import { getArticleCategories, getArticles, getAttractions } from '../../api/content';
import { Article, ArticleCategory, Attraction, Booking, Room, RoomType } from '../../types';
import './GuestHome.css';

interface GuestRoom {
  id: number;
  roomTypeId: number;
  roomNumber: string;
  status: string;
  floor: number;
  typeName: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  capacity: number;
}

interface RoomTypeGroup {
  roomTypeId: number;
  typeName: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  capacity: number;
  availableCount: number;
  rooms: GuestRoom[];
}

const DEFAULT_ROOM_IMAGE = 'https://picsum.photos/400/300?random=88';

const blogPosts = [
  {
    id: 1,
    title: 'Top 10 món ăn nhất định phải thử khi đến Đà Nẵng',
    summary: 'Khám phá ẩm thực đường phố và các món hải sản tươi ngon...',
    image: 'https://picsum.photos/id/30/400/250',
    date: '2026-04-01',
  },
  {
    id: 2,
    title: 'Kinh nghiệm du lịch biển Hội An - 3 ngày 2 đêm',
    summary: 'Lịch trình chi tiết, các bãi biển đẹp và homestay giá rẻ...',
    image: 'https://picsum.photos/id/15/400/250',
    date: '2026-03-28',
  },
  {
    id: 3,
    title: 'Thư giãn tại Spa - Liệu trình đặc biệt từ thiên nhiên',
    summary: 'Trải nghiệm massage thảo dược và tắm suối khoáng nóng...',
    image: 'https://picsum.photos/id/125/400/250',
    date: '2026-03-20',
  },
];

const attractions = [
  {
    id: 1,
    name: 'Bãi biển Mỹ Khê',
    description: 'Một trong những bãi biển đẹp nhất hành tinh, cát trắng, nước trong.',
    distance: 0.5,
    image: 'https://picsum.photos/id/42/400/300',
    type: 'Biển',
  },
  {
    id: 2,
    name: 'Phố cổ Hội An',
    description: 'Di sản văn hóa thế giới, đèn lồng lung linh về đêm.',
    distance: 25,
    image: 'https://picsum.photos/id/96/400/300',
    type: 'Văn hóa',
  },
  {
    id: 3,
    name: 'Bà Nà Hills',
    description: 'Cầu Vàng, làng Pháp, công viên giải trí trên núi.',
    distance: 22,
    image: 'https://picsum.photos/id/104/400/300',
    type: 'Thiên nhiên',
  },
];

const vouchers = [
  {
    id: 1,
    code: 'HOTEL10',
    discount: '10%',
    condition: 'Tối thiểu 1 đêm',
    expiry: '31/12/2026',
  },
  {
    id: 2,
    code: 'STAY150',
    discount: '150.000 VND',
    condition: 'Tối thiểu 2 đêm',
    expiry: '31/08/2026',
  },
];

const reviews = [
  {
    id: 1,
    author: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Phòng sạch sẽ, lễ tân thân thiện, vị trí thuận tiện. Sẽ quay lại!',
    date: '2026-03-15',
  },
  {
    id: 2,
    author: 'Trần Thị B',
    rating: 4,
    comment: 'Bữa sáng ngon, nhưng hồ bơi hơi nhỏ. Nhìn chung ổn.',
    date: '2026-03-10',
  },
  {
    id: 3,
    author: 'Lê Văn C',
    rating: 5,
    comment: 'Trải nghiệm tuyệt vời, view biển đẹp, nhân viên chuyên nghiệp.',
    date: '2026-03-05',
  },
];

const GuestHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  // Search state
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<RoomTypeGroup[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const [recommendedRooms, setRecommendedRooms] = useState<RoomTypeGroup[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomLoadError, setRoomLoadError] = useState('');

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<GuestRoom | null>(null);
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ bookingId: 0, rating: 5, comment: '' });
  const [eligibleBookings, setEligibleBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingLoadError, setBookingLoadError] = useState('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [articlePage, setArticlePage] = useState(1);
  const [pageSize] = useState(4);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState('');
  const [attractionsData, setAttractionsData] = useState<Attraction[]>([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [attractionsError, setAttractionsError] = useState('');

  const normalizeRoom = (room: Room): GuestRoom => ({
    id: room.id,
    roomTypeId: room.roomTypeId,
    roomNumber: room.roomNumber ?? '---',
    status: room.status ?? 'Available',
    floor: room.floor ?? 0,
    typeName: room.roomType?.name ?? 'Phòng khách sạn',
    description: room.roomType?.description ?? 'Phòng cao cấp, tiện nghi đầy đủ.',
    price: room.roomType?.basePrice ?? 0,
    image: room.roomType?.roomImages?.find(img => img.isPrimary)?.imageUrl ?? room.roomType?.roomImages?.[0]?.imageUrl ?? DEFAULT_ROOM_IMAGE,
    amenities: room.roomType?.roomAmenities?.map(a => a.name ?? '').filter(Boolean) ?? [],
    capacity: room.roomType?.maxOccupancy ?? 2,
  });

  const loadGuestRooms = async (checkInDate: string, checkOutDate: string, adultsCount: number, childrenCount: number) => {
    setLoadingRooms(true);
    setRoomLoadError('');

    try {
      const rooms = await searchAvailableRooms({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomTypeId: selectedRoomTypeId,
        minPrice: minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
      });

      const normalizedRooms = rooms.map(normalizeRoom);

      // Filter by selected amenities
      let filteredRooms = normalizedRooms;
      if (selectedAmenities.length > 0) {
        filteredRooms = normalizedRooms.filter(room =>
          selectedAmenities.every(amenity => room.amenities.includes(amenity))
        );
      }

      // Group by roomTypeId
      const grouped = filteredRooms.reduce((acc, room) => {
        const key = room.roomTypeId;
        if (!acc[key]) {
          acc[key] = {
            roomTypeId: room.roomTypeId,
            typeName: room.typeName,
            description: room.description,
            price: room.price,
            image: room.image,
            amenities: room.amenities,
            capacity: room.capacity,
            availableCount: 0,
            rooms: []
          };
        }
        acc[key].rooms.push(room);
        acc[key].availableCount = acc[key].rooms.length;
        return acc;
      }, {} as Record<number, RoomTypeGroup>);

      const groupedResults = Object.values(grouped);
      groupedResults.sort((a, b) => b.roomTypeId - a.roomTypeId);

      setRecommendedRooms(groupedResults.slice(0, 5));
      setSearchResults(groupedResults);
    } catch (error) {
      console.error('Load guest rooms error:', error);
      setRoomLoadError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
      setRecommendedRooms([]);
      setSearchResults([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadGuestContent = async () => {
    setArticlesLoading(true);
    setArticlesError('');
    setAttractionsLoading(true);
    setAttractionsError('');
    try {
      const [fetchedArticles, fetchedCategories, fetchedAttractions] = await Promise.all([
        getArticles(),
        getArticleCategories(),
        getAttractions(),
      ]);
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
      setAttractionsData(fetchedAttractions);
    } catch (error) {
      console.error('Load guest content error:', error);
      const message = (error as Error).message || 'Không thể tải nội dung bài viết và điểm đến';
      setArticlesError(message);
      setAttractionsError(message);
    } finally {
      setArticlesLoading(false);
      setAttractionsLoading(false);
    }
  };

  const loadEligibleBookings = async () => {
    if (!user) {
      setEligibleBookings([]);
      setBookingLoadError('');
      return;
    }

    setIsLoadingBookings(true);
    setBookingLoadError('');
    try {
      const bookings = await getBookings();
      const eligible = bookings.filter(booking => booking.status === 'CheckedOut');
      setEligibleBookings(eligible);
      if (eligible.length > 0) {
        setReviewData(prev => ({ ...prev, bookingId: eligible[0].id }));
      }
    } catch (error) {
      console.error('Load eligible bookings error:', error);
      setBookingLoadError('Không thể kiểm tra trạng thái booking để gửi đánh giá.');
      setEligibleBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await getRoomTypes();
        const activeTypes = types.filter(type => type.isActive);
        setRoomTypes(activeTypes);

        // Extract unique amenities
        const allAmenities = new Set<string>();
        activeTypes.forEach(type => {
          if (type.roomAmenities) {
            type.roomAmenities.forEach(amenity => {
              if (amenity.name) {
                allAmenities.add(amenity.name);
              }
            });
          }
        });
        setAvailableAmenities(Array.from(allAmenities).sort());
      } catch (error) {
        console.error('Fetch room types error:', error);
      }
    };

    fetchRoomTypes();
    loadGuestRooms(checkIn, checkOut, adults, children);
    loadGuestContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEligibleBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = async () => {
    setIsSearched(true);
    await loadGuestRooms(checkIn, checkOut, adults, children);
  };

  const filteredArticles = selectedCategoryId
    ? articles.filter(article => article.categoryId === selectedCategoryId)
    : articles;
  const articleTotalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const articleList = filteredArticles.slice((articlePage - 1) * pageSize, articlePage * pageSize);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setArticlePage(1);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setArticlePage(prev => {
      if (direction === 'prev') return Math.max(1, prev - 1);
      return Math.min(articleTotalPages, prev + 1);
    });
  };

  const handleBookNow = (roomTypeGroup: RoomTypeGroup) => {
    if (user) {
      navigate(`/book/${roomTypeGroup.roomTypeId}`);
    } else {
      // For guest booking, we need to select a specific room
      // Since we don't have room selection, we'll use the first available room
      const selectedRoom = roomTypeGroup.rooms[0];
      setSelectedRoom(selectedRoom);
      setShowBookingModal(true);
    }
  };

  const handleGuestBooking = async () => {
    if (!selectedRoom) return;

    try {
      setLoadingRooms(true);
      await createBooking({
        guestName: guestInfo.fullName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        checkIn,
        checkOut,
        adults,
        children,
        roomTypeId: selectedRoom.roomTypeId,
        nights: Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))),
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setGuestInfo({ fullName: '', email: '', phone: '' });
      }, 2000);
    } catch (error) {
      console.error('Guest booking error:', error);
      setRoomLoadError('Không thể đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} color={i < rating ? '#ffc107' : '#e4e5e9'} className="me-1" />
    ));
  };

  return (
    <div className="guest-home">
      <Navbar sticky="top" expand="lg" className="guest-nav">
        <Container>
          <Navbar.Brand href="/" className="guest-brand">Lumea Hotel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {user ? (
                <>
                  <Nav.Link disabled className="guest-nav-user">Xin chào, {user.fullName}</Nav.Link>
                  <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2 guest-nav-btn">
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline-light" size="sm" onClick={() => navigate('/login')} className="me-2 guest-nav-btn">
                    Đăng nhập
                  </Button>
                  <Button variant="light" size="sm" className="guest-nav-cta" onClick={() => navigate('/register')}>
                    Đăng ký
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section className="hero-wrap">
      <Carousel fade interval={4500} className="hero-carousel" controls={false} indicators={false}>
        <Carousel.Item>
          <div className="hero-panel hero-panel-a text-white py-5">
            <Container>
              <Row>
                <Col lg={8} className="hero-copy">
                  <p className="hero-kicker">Không gian nghỉ dưỡng tinh tế</p>
                  <h1 className="display-4 fw-bold">Đặt phòng dễ dàng, nhận trải nghiệm xứng tầm kỳ nghỉ của bạn</h1>
                  <p className="lead">Từ chuyến đi ngắn cuối tuần đến kỳ nghỉ dài ngày, mọi lựa chọn đều rõ giá và rõ tiện nghi.</p>
                  <div className="hero-metrics">
                    <span><strong>{searchResults.length || recommendedRooms.length}</strong> loại phòng trống</span>
                    <span><strong>{nights}</strong> đêm lưu trú</span>
                    <span><strong>{adults + children}</strong> khách</span>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-panel hero-panel-b text-white py-5">
            <Container>
              <Row>
                <Col lg={8} className="hero-copy">
                  <p className="hero-kicker">Lưu trú và khám phá</p>
                  <h1 className="display-4 fw-bold">Khơi mở hành trình cùng những điểm đến đẹp nhất miền Trung</h1>
                  <p className="lead">Ở trung tâm kết nối, bạn chỉ mất vài phút để chạm tới biển, phố cổ và những trải nghiệm địa phương đáng nhớ.</p>
                </Col>
              </Row>
            </Container>
          </div>
        </Carousel.Item>
      </Carousel>
      </section>

      <Container className="guest-content py-5">
        <Card className="search-card border-0 mb-5">
          <Card.Body className="p-4 p-lg-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h4 className="mb-0 section-heading">Tìm phòng trống</h4>
              <Badge bg="light" text="dark" className="search-badge">Giá minh bạch</Badge>
            </div>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label><FaCalendarAlt /> Ngày nhận</Form.Label>
                  <Form.Control type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label><FaCalendarAlt /> Ngày trả</Form.Label>
                  <Form.Control type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={12} md={2}>
                <Form.Group>
                  <Form.Label><FaUsers /> Người lớn</Form.Label>
                  <Form.Control type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col xs={12} md={2}>
                <Form.Group>
                  <Form.Label><FaUsers /> Trẻ em</Form.Label>
                  <Form.Control type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col xs={12} md={2}>
                <Button variant="primary" onClick={handleSearch} className="w-100 py-2 fw-bold">Tìm kiếm</Button>
              </Col>
            </Row>
            <Row className="g-3 align-items-end mt-3">
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Loại phòng</Form.Label>
                  <Form.Select value={selectedRoomTypeId ?? ''} onChange={(e) => setSelectedRoomTypeId(e.target.value ? Number(e.target.value) : undefined)}>
                    <option value="">Tất cả loại phòng</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Giá thấp nhất (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Nhập giá"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Giá cao nhất (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Nhập giá"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 align-items-end mt-2">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Tiện nghi</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {availableAmenities.map(amenity => (
                      <Form.Check
                        key={amenity}
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        label={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAmenities([...selectedAmenities, amenity]);
                          } else {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <div className="search-summary mt-4">
              <span>Nhận phòng: {checkIn}</span>
              <span>Trả phòng: {checkOut}</span>
              <span>{nights} đêm</span>
            </div>
          </Card.Body>
        </Card>

        {roomLoadError && (
          <Alert variant="danger" className="text-center">{roomLoadError}</Alert>
        )}

        <Row className="content-layout g-4">
          <Col xl={8} className="main-stack">
            <section className="section-block panel-card search-results-panel">
              {loadingRooms ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" />
                  <div className="mt-3">Đang tải phòng...</div>
                </div>
              ) : (
                <>
                  {isSearched && searchResults.length === 0 && (
                    <Alert variant="warning" className="text-center mb-0">Không tìm thấy phòng nào phù hợp với yêu cầu của bạn.</Alert>
                  )}

                  {searchResults.length > 0 && (
                    <>
                      <h3 className="mb-4 section-heading">🏨 {isSearched ? `Kết quả tìm kiếm (${searchResults.length} loại phòng)` : `Phòng trống (${searchResults.length} loại)`}</h3>
                      <Row xs={1} md={2} lg={2} className="g-4 reveal-grid">
                        {searchResults.map(roomTypeGroup => (
                          <Col key={roomTypeGroup.roomTypeId}>
                            <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-effect room-card">
                              <Card.Img variant="top" src={roomTypeGroup.image} style={{ height: '220px', objectFit: 'cover' }} />
                              <Card.Body className="d-flex flex-column">
                                <Card.Title className="fs-5 fw-bold">{roomTypeGroup.typeName}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted small">
                                  <Badge bg="success" className="me-2">{roomTypeGroup.availableCount} phòng trống</Badge>
                                  Sức chứa {roomTypeGroup.capacity} người
                                </Card.Subtitle>
                                <Card.Text className="text-muted small">{roomTypeGroup.description}</Card.Text>
                                <div className="mb-3 d-flex flex-wrap gap-1">
                                  {roomTypeGroup.amenities.slice(0, 3).map((item, idx) => (
                                    <Badge key={idx} bg="light" text="dark" className="me-1">{item}</Badge>
                                  ))}
                                  {roomTypeGroup.amenities.length > 3 && <Badge bg="secondary">+{roomTypeGroup.amenities.length - 3}</Badge>}
                                </div>
                                <div className="mt-auto">
                                  <h5 className="text-primary mb-3">{roomTypeGroup.price.toLocaleString()} VNĐ/đêm</h5>
                                  <Button variant="primary" className="w-100 mb-2" onClick={() => handleBookNow(roomTypeGroup)}>Đặt ngay</Button>
                                  <Button variant="outline-dark" className="w-100" onClick={() => navigate(`/room/${roomTypeGroup.roomTypeId}`)}>Xem chi tiết</Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}
                </>
              )}
            </section>

            <section className="section-block panel-card">
              <h3 className="mb-4 section-heading">✨ Phòng được yêu thích nhất</h3>
              <Row xs={1} md={2} className="g-4 reveal-grid">
                {recommendedRooms.map(roomTypeGroup => (
                  <Col key={roomTypeGroup.roomTypeId}>
                    <Card className="h-100 shadow border-0 rounded-4 overflow-hidden hover-effect room-card room-card-highlight">
                      <Card.Img variant="top" src={roomTypeGroup.image} style={{ height: '220px', objectFit: 'cover' }} />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-5 fw-bold">{roomTypeGroup.typeName}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted small">
                          <Badge bg="success" className="me-2">{roomTypeGroup.availableCount} phòng trống</Badge>
                          Sức chứa {roomTypeGroup.capacity} người
                        </Card.Subtitle>
                        <Card.Text className="text-muted small">{roomTypeGroup.description}</Card.Text>
                        <div className="mb-3">
                          <Badge bg="warning" text="dark" className="me-1"> Hot</Badge>
                        </div>
                        <h5 className="text-primary">{roomTypeGroup.price.toLocaleString()} VNĐ/đêm</h5>
                        <Button variant="outline-primary" className="mt-3" onClick={() => handleBookNow(roomTypeGroup)}>Đặt ngay</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>

            <section className="section-block panel-card">
              <h3 className="mb-4 section-heading">📝 Bài viết mới</h3>
              {blogPosts.map(post => (
                <Card key={post.id} className="mb-3 shadow-sm border-0 blog-card hover-effect">
                  <Row className="g-0">
                    <Col md={4}>
                      <Card.Img src={post.image} style={{ height: '100%', objectFit: 'cover' }} />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title className="fs-6">{post.title}</Card.Title>
                        <Card.Text className="small text-muted">{post.summary}</Card.Text>
                        <Button variant="link" size="sm" className="p-0">Đọc tiếp →</Button>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              ))}
            </section>

            <section className="section-block panel-card">
              <h3 className="mb-4 section-heading">🗺️ Điểm đến nổi bật</h3>
              <Row xs={1} md={2} className="g-3 reveal-grid">
                {attractions.map(att => (
                  <Col key={att.id}>
                    <Card className="h-100 shadow-sm border-0 attraction-card hover-effect">
                      <Card.Img variant="top" src={att.image} style={{ height: '150px', objectFit: 'cover' }} />
                      <Card.Body>
                        <Card.Title className="fs-6"><FaMapMarkerAlt className="text-danger me-1" /> {att.name}</Card.Title>
                        <Card.Text className="small text-muted">{att.description}</Card.Text>
                        <Badge bg="secondary">Cách {att.distance} km</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          </Col>

          <Col xl={4} className="sidebar-stack">
            <section className="section-block panel-card voucher-panel">
              <h3 className="mb-4 section-heading">🎟️ Mã giảm giá hot</h3>
              <Row xs={1} className="g-3 reveal-grid">
                {vouchers.map(v => (
                  <Col key={v.id}>
                    <Card className="voucher-card border-warning bg-light h-100">
                      <Card.Body className="text-center">
                        <h5 className="text-uppercase fw-bold">{v.code}</h5>
                        <p className="display-6 text-primary">{v.discount}</p>
                        <p className="small text-muted">Điều kiện: {v.condition}<br />Hạn: {v.expiry}</p>
                        <Button variant="outline-warning" size="sm">Sao chép mã</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>

            <section className="section-block panel-card review-panel">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 section-heading">Đánh giá từ khách hàng</h3>
                <Button variant="primary" size="sm" onClick={() => setShowReviewModal(true)}>
                  Viết đánh giá
                </Button>
              </div>
              {reviews.map(rev => (
                <Card key={rev.id} className="mb-3 shadow-sm border-0 review-card hover-effect">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <strong>{rev.author}</strong>
                      <div>{renderStars(rev.rating)}</div>
                    </div>
                    <p className="mt-2 mb-1">{rev.comment}</p>
                    <small className="text-muted">Ngày {rev.date}</small>
                  </Card.Body>
                </Card>
              ))}
            </section>
          </Col>
        </Row>
      </Container>

      <footer className="guest-footer text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">&copy; 2024 Hotel Booking. All rights reserved.</p>
          <small>Trải nghiệm du lịch tuyệt vời cùng chúng tôi</small>
        </Container>
      </footer>

      {/* Modal viết đánh giá */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Viết đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Loại phòng *</Form.Label>
              <Form.Select
                value={reviewData.roomTypeId}
                onChange={(e) => setReviewData({ ...reviewData, roomTypeId: parseInt(e.target.value) })}
              >
                <option value={0}>Chọn loại phòng</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá *</Form.Label>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar
                    key={star}
                    size={24}
                    className={star <= reviewData.rating ? 'text-warning' : 'text-muted'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bình luận *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await createReview(reviewData);
                setShowReviewModal(false);
                setReviewData({ roomTypeId: 0, rating: 5, comment: '' });
                alert('Cảm ơn bạn đã đánh giá!');
              } catch (error) {
                alert('Có lỗi xảy ra khi gửi đánh giá');
              }
            }}
            disabled={!reviewData.roomTypeId || !reviewData.comment.trim()}
          >
            Gửi đánh giá
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal đặt phòng cho khách vãng lai (không cần đăng nhập) */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt phòng: {selectedRoom?.typeName} - Phòng {selectedRoom?.roomNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingSuccess ? (
            <Alert variant="success">Đặt phòng thành công! Chúng tôi sẽ liên hệ xác nhận.</Alert>
          ) : (
            <>
              <Alert variant="info">Bạn đang đặt phòng với tư cách khách vãng lai. Vui lòng nhập thông tin liên hệ.</Alert>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên *</Form.Label>
                  <Form.Control
                    required
                    value={guestInfo.fullName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại *</Form.Label>
                  <Form.Control
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="0912345678"
                  />
                </Form.Group>
                <div className="text-muted small mb-3">
                  📅 Ngày nhận: {checkIn} | Ngày trả: {checkOut}<br />
                  👥 {adults} người lớn, {children} trẻ em
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>Đóng</Button>
          {!bookingSuccess && (
            <Button variant="primary" onClick={handleGuestBooking} disabled={!guestInfo.fullName || !guestInfo.email || !guestInfo.phone}>
              Xác nhận đặt phòng
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default GuestHome;