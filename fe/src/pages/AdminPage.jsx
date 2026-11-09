import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats,
  getAdminDecks,
  createAdminDeck,
  updateAdminDeck,
  deleteAdminDeck,
  getAdminCards,
  updateCardPrice,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getCards
} from '../services/api';
import {
  ShieldCheck,
  LayoutDashboard,
  Layers,
  CreditCard,
  Users,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  Eye,
  Heart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trophy,
  Flame,
  ArrowUpRight,
  X
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'decks', 'cards', 'users'

  // Overview Data
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Decks Management
  const [decks, setDecks] = useState([]);
  const [deckPage, setDeckPage] = useState(1);
  const [deckTotalPages, setDeckTotalPages] = useState(1);
  const [deckTotalCount, setDeckTotalCount] = useState(0);
  const [deckSearch, setDeckSearch] = useState('');
  const [deckFormatFilter, setDeckFormatFilter] = useState('');
  const [decksLoading, setDecksLoading] = useState(false);

  // Deck Modal (Create / Edit)
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckFormData, setDeckFormData] = useState({
    name: '',
    format: 'TCG',
    category: 'Tournament Meta',
    archetype: '',
    author: 'Admin',
    tournament: '',
    description: '',
    is_featured: false,
    main_deck: [],
    extra_deck: [],
    side_deck: []
  });
  const [deckSubmitting, setDeckSubmitting] = useState(false);
  const [modalCardSearch, setModalCardSearch] = useState('');
  const [modalCardResults, setModalCardResults] = useState([]);
  const [modalSearchLoading, setModalSearchLoading] = useState(false);
  const [deckViewSection, setDeckViewSection] = useState('main_deck'); // 'main_deck', 'extra_deck', 'side_deck'

  // Cards Management
  const [cards, setCards] = useState([]);
  const [cardPage, setCardPage] = useState(1);
  const [cardTotalPages, setCardTotalPages] = useState(1);
  const [cardTotalCount, setCardTotalCount] = useState(0);
  const [cardSearch, setCardSearch] = useState('');
  const [cardsLoading, setCardsLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardPrice, setEditingCardPrice] = useState('');

  // Users Management
  const [usersList, setUsersList] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Notification Toast
  const [notice, setNotice] = useState(null);
  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 3500);
  };

  // 1. Tải Stats Overview
  const loadStats = () => {
    setStatsLoading(true);
    getAdminStats()
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error('Error load admin stats:', err))
      .finally(() => setStatsLoading(false));
  };

  // 2. Tải Decks
  const loadDecks = () => {
    setDecksLoading(true);
    getAdminDecks({
      q: deckSearch,
      format: deckFormatFilter,
      page: deckPage,
      limit: 10
    })
      .then((res) => {
        if (res.data?.success) {
          setDecks(res.data.data);
          setDeckTotalPages(res.data.pagination?.totalPages || 1);
          setDeckTotalCount(res.data.pagination?.totalDecks || 0);
        }
      })
      .catch((err) => console.error('Error load admin decks:', err))
      .finally(() => setDecksLoading(false));
  };

  // 3. Tải Cards
  const loadCards = () => {
    setCardsLoading(true);
    getAdminCards({
      q: cardSearch,
      page: cardPage,
      limit: 15
    })
      .then((res) => {
        if (res.data?.success) {
          setCards(res.data.data);
          setCardTotalPages(res.data.pagination?.totalPages || 1);
          setCardTotalCount(res.data.pagination?.totalCards || 0);
        }
      })
      .catch((err) => console.error('Error load admin cards:', err))
      .finally(() => setCardsLoading(false));
  };

  // 4. Tải Users
  const loadUsers = () => {
    setUsersLoading(true);
    getAdminUsers({
      q: userSearch,
      page: userPage,
      limit: 15
    })
      .then((res) => {
        if (res.data?.success) {
          setUsersList(res.data.data);
          setUserTotalPages(res.data.pagination?.totalPages || 1);
          setUserTotalCount(res.data.pagination?.totalUsers || 0);
        }
      })
      .catch((err) => console.error('Error load admin users:', err))
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'overview') loadStats();
      if (activeTab === 'decks') loadDecks();
      if (activeTab === 'cards') loadCards();
      if (activeTab === 'users') loadUsers();
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'decks') {
      loadDecks();
    }
  }, [deckPage, deckSearch, deckFormatFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'cards') {
      loadCards();
    }
  }, [cardPage, cardSearch]);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    }
  }, [userPage, userSearch]);

  // Xử lý tạo / sửa Deck
  const handleOpenDeckModal = (deck = null) => {
    if (deck) {
      setEditingDeck(deck);
      setDeckFormData({
        name: deck.name || '',
        format: deck.format || 'TCG',
        category: deck.category || 'Tournament Meta',
        archetype: deck.archetype || '',
        author: deck.author || 'Admin',
        tournament: deck.tournament || '',
        description: deck.description || '',
        is_featured: !!deck.is_featured,
        main_deck: deck.main_deck ? JSON.parse(JSON.stringify(deck.main_deck)) : [],
        extra_deck: deck.extra_deck ? JSON.parse(JSON.stringify(deck.extra_deck)) : [],
        side_deck: deck.side_deck ? JSON.parse(JSON.stringify(deck.side_deck)) : []
      });
    } else {
      setEditingDeck(null);
      setDeckFormData({
        name: '',
        format: 'TCG',
        category: 'Tournament Meta',
        archetype: '',
        author: user?.username || 'Admin',
        tournament: '',
        description: '',
        is_featured: false,
        main_deck: [],
        extra_deck: [],
        side_deck: []
      });
    }
    setModalCardSearch('');
    setModalCardResults([]);
    setDeckViewSection('main_deck');
    setDeckModalOpen(true);
  };

  // Tìm kiếm lá bài để thêm vào Deck Modal
  const handleSearchModalCards = async (term) => {
    setModalCardSearch(term);
    if (!term || term.trim().length < 2) {
      setModalCardResults([]);
      return;
    }
    setModalSearchLoading(true);
    try {
      const res = await getCards({ fname: term.trim(), limit: 8 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setModalCardResults(res.data.data);
      }
    } catch (err) {
      console.error('Error search modal cards:', err);
    } finally {
      setModalSearchLoading(false);
    }
  };

  // Thêm lá bài vào Main / Extra / Side
  const handleAddCardToDeck = (card, section = 'main_deck', qty = 1) => {
    const list = [...(deckFormData[section] || [])];
    const existingIndex = list.findIndex(c => String(c.card_id) === String(card.id));
    if (existingIndex >= 0) {
      const currentQty = list[existingIndex].quantity || 1;
      list[existingIndex].quantity = Math.min(3, currentQty + qty);
    } else {
      list.push({
        card_id: card.id,
        name: card.name,
        quantity: Math.min(3, qty),
        card_type: card.type || 'Monster',
        image_url: card.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
        image_url_small: card.card_images?.[0]?.image_url_small || `/images/cards/${card.id}_small.jpg`,
        price: card.min_price || 0
      });
    }
    setDeckFormData({ ...deckFormData, [section]: list });
    showToast('success', `Đã thêm ${card.name} vào ${section === 'main_deck' ? 'Main' : section === 'extra_deck' ? 'Extra' : 'Side'} Deck!`);
  };

  // Thay đổi số lượng thẻ (+1 / -1)
  const handleUpdateCardQty = (section, cardId, delta) => {
    let list = [...(deckFormData[section] || [])];
    const idx = list.findIndex(c => String(c.card_id) === String(cardId));
    if (idx >= 0) {
      const newQty = (list[idx].quantity || 1) + delta;
      if (newQty <= 0) {
        list.splice(idx, 1);
      } else {
        list[idx].quantity = Math.min(3, newQty);
      }
      setDeckFormData({ ...deckFormData, [section]: list });
    }
  };

  // Xóa thẻ khỏi Deck
  const handleRemoveCardFromDeck = (section, cardId) => {
    const list = (deckFormData[section] || []).filter(c => String(c.card_id) !== String(cardId));
    setDeckFormData({ ...deckFormData, [section]: list });
  };

  // Tự động tìm nạp thẻ theo Archetype
  const handleAutoFillArchetype = async () => {
    const arc = deckFormData.archetype?.trim();
    if (!arc) {
      showToast('error', 'Vui lòng nhập tên Archetype trước (ví dụ: Tearlament, Snake-Eye, Kashtira)!');
      return;
    }
    setModalSearchLoading(true);
    try {
      const res = await getCards({ fname: arc, limit: 30 });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const foundCards = res.data.data;
        const main = [...(deckFormData.main_deck || [])];
        const extra = [...(deckFormData.extra_deck || [])];

        foundCards.forEach(c => {
          const typeLower = (c.type || '').toLowerCase();
          const isExtra = typeLower.includes('fusion') || typeLower.includes('synchro') || typeLower.includes('xyz') || typeLower.includes('link');
          const targetList = isExtra ? extra : main;
          
          if (!targetList.some(item => String(item.card_id) === String(c.id))) {
            targetList.push({
              card_id: c.id,
              name: c.name,
              quantity: isExtra ? 1 : 2,
              card_type: c.type || 'Monster',
              image_url: c.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${c.id}.jpg`,
              image_url_small: c.card_images?.[0]?.image_url_small || `/images/cards/${c.id}_small.jpg`,
              price: c.min_price || 0
            });
          }
        });

        setDeckFormData({
          ...deckFormData,
          main_deck: main,
          extra_deck: extra
        });
        showToast('success', `Đã tự động nạp ${foundCards.length} lá bài thuộc hệ "${arc}"!`);
      } else {
        showToast('error', `Không tìm thấy lá bài nào khớp với Archetype "${arc}"`);
      }
    } catch (err) {
      showToast('error', 'Lỗi khi tự động nạp thẻ theo Archetype');
    } finally {
      setModalSearchLoading(false);
    }
  };

  const handleSaveDeck = async (e) => {
    e.preventDefault();
    if (!deckFormData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên bộ bài');
      return;
    }
    setDeckSubmitting(true);
    try {
      if (editingDeck) {
        const res = await updateAdminDeck(editingDeck._id, deckFormData);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật bộ bài "${deckFormData.name}"!`);
          setDeckModalOpen(false);
          loadDecks();
        }
      } else {
        const res = await createAdminDeck(deckFormData);
        if (res.data?.success) {
          showToast('success', `Đã tạo mới bộ bài "${deckFormData.name}"!`);
          setDeckModalOpen(false);
          loadDecks();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu bộ bài');
    } finally {
      setDeckSubmitting(false);
    }
  };

  const handleDeleteDeck = async (deck) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ bài "${deck.name}"?`)) return;
    try {
      const res = await deleteAdminDeck(deck._id);
      if (res.data?.success) {
        showToast('success', `Đã xóa bộ bài "${deck.name}"`);
        loadDecks();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa bộ bài');
    }
  };

  const handleToggleFeaturedDeck = async (deck) => {
    try {
      const res = await updateAdminDeck(deck._id, { is_featured: !deck.is_featured });
      if (res.data?.success) {
        showToast('success', `Đã ${!deck.is_featured ? 'ghim nổi bật' : 'bỏ ghim'} bộ bài "${deck.name}"`);
        loadDecks();
      }
    } catch (err) {
      showToast('error', 'Lỗi khi cập nhật trạng thái nổi bật');
    }
  };

  // Cập nhật giá thẻ bài
  const handleSaveCardPrice = async (cardId) => {
    const val = parseFloat(editingCardPrice);
    if (isNaN(val) || val < 0) {
      showToast('error', 'Giá không hợp lệ');
      return;
    }
    try {
      const res = await updateCardPrice(cardId, { min_price: val, cardmarket_price: val, tcgplayer_price: val });
      if (res.data?.success) {
        showToast('success', 'Đã cập nhật giá lá bài thành công!');
        setEditingCardId(null);
        loadCards();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi khi cập nhật giá');
    }
  };

  // Đổi Role người dùng
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Bạn muốn chuyển quyền của "${targetUser.username}" thành ${newRole.toUpperCase()}?`)) return;
    try {
      const res = await updateUserRole(targetUser.id, newRole);
      if (res.data?.success) {
        showToast('success', `Đã đổi quyền của ${targetUser.username} thành ${newRole}`);
        loadUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi khi đổi quyền');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${targetUser.username}"?`)) return;
    try {
      const res = await deleteUser(targetUser.id);
      if (res.data?.success) {
        showToast('success', `Đã xóa người dùng "${targetUser.username}"`);
        loadUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  // Kiểm tra quyền Admin
  if (!user) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
          <div className="admin-access-denied-card">
            <ShieldCheck size={56} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h2>Yêu cầu đăng nhập Quản trị</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Vui lòng đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang này.
            </p>
            <Link to="/login" className="btn-primary">
              Đăng nhập ngay
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
          <div className="admin-access-denied-card">
            <AlertTriangle size={56} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2>Truy cập bị từ chối</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Tài khoản <strong>{user.username}</strong> không có quyền Quản trị viên (Admin).
            </p>
            <Link to="/" className="btn-primary">
              Quay lại Trang chủ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
        {/* TOAST THÔNG BÁO */}
        {notice && (
          <div className={`admin-toast-notice notice-${notice.type}`}>
            {notice.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{notice.message}</span>
          </div>
        )}

        {/* ADMIN HEADER */}
        <div className="admin-hero-header">
          <div className="admin-hero-left">
            <div className="admin-badge-pill">
              <ShieldCheck size={16} /> Bảng Điều Khiển Quản Trị Hệ Thống
            </div>
            <h1 className="admin-hero-title">Yu-Gi-Oh! Admin Hub</h1>
            <p className="admin-hero-subtitle">
              Quản lý toàn diện cơ sở dữ liệu Decks, định giá thẻ bài thị trường và danh sách tài khoản người dùng.
            </p>
          </div>

          <div className="admin-hero-user-badge">
            <div className="admin-avatar">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{user.username}</div>
              <span className="admin-role-tag">ROLE: ADMIN</span>
            </div>
          </div>
        </div>

        {/* THANH TAB ĐIỀU HƯỚNG QUẢN TRỊ */}
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Thống Kê</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'decks' ? 'active' : ''}`}
            onClick={() => setActiveTab('decks')}
          >
            <Layers size={18} />
            <span>Quản Lý Decks</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            <CreditCard size={18} />
            <span>Quản Lý Thẻ &amp; Giá</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Quản Lý Người Dùng</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW & DASHBOARD STATS */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div>
            {statsLoading || !stats ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải số liệu hệ thống...</p>
              </div>
            ) : (
              <div>
                {/* 4 THẺ KPI CHÍNH */}
                <div className="admin-kpi-grid">
                  <div className="admin-kpi-card">
                    <div className="kpi-icon-wrap icon-blue">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <div className="kpi-label">Tổng Số Lá Bài (DB)</div>
                      <div className="kpi-value">{stats.totalCards?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="kpi-icon-wrap icon-purple">
                      <Layers size={24} />
                    </div>
                    <div>
                      <div className="kpi-label">Tổng Số Decks</div>
                      <div className="kpi-value">{stats.totalDecks || 0}</div>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="kpi-icon-wrap icon-green">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="kpi-label">Tài Khoản Đăng Ký</div>
                      <div className="kpi-value">{stats.totalUsers || 0}</div>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="kpi-icon-wrap icon-amber">
                      <Flame size={24} />
                    </div>
                    <div>
                      <div className="kpi-label">Format Thi Đấu</div>
                      <div className="kpi-value">{Object.keys(stats.formatStats || {}).length} Formats</div>
                    </div>
                  </div>
                </div>

                {/* PHÂN BỔ THEO FORMAT & CATEGORY */}
                <div className="admin-two-cols-grid" style={{ marginTop: '1.5rem' }}>
                  <div className="admin-box-card">
                    <h3 className="admin-box-title">
                      <Trophy size={18} color="#f59e0b" /> Phân Bổ Decks Theo Format
                    </h3>
                    <div className="admin-stat-badges-wrap">
                      {Object.entries(stats.formatStats || {}).map(([fmt, count]) => (
                        <div key={fmt} className="admin-stat-item">
                          <span className="stat-item-badge">{fmt}</span>
                          <span className="stat-item-count">{count} bộ bài</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-box-card">
                    <h3 className="admin-box-title">
                      <Layers size={18} color="#3b82f6" /> Phân Bổ Decks Theo Danh Mục
                    </h3>
                    <div className="admin-stat-badges-wrap">
                      {Object.entries(stats.categoryStats || {}).map(([cat, count]) => (
                        <div key={cat} className="admin-stat-item">
                          <span className="stat-item-badge category-badge">{cat}</span>
                          <span className="stat-item-count">{count} bộ bài</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TOP 5 DECKS HOT NHẤT & RECENT USERS */}
                <div className="admin-two-cols-grid" style={{ marginTop: '1.5rem' }}>
                  <div className="admin-box-card">
                    <h3 className="admin-box-title">
                      <TrendingUp size={18} color="#10b981" /> Top 5 Decks Được Yêu Thích Nhất
                    </h3>
                    <div className="admin-table-responsive">
                      <table className="admin-simple-table">
                        <thead>
                          <tr>
                            <th>Tên Bộ Bài</th>
                            <th>Format</th>
                            <th>Lượt Thích</th>
                            <th>Lượt Xem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stats.topDecks || []).map((d) => (
                            <tr key={d._id}>
                              <td>
                                <Link to={`/deck/${d._id}`} className="admin-table-link">
                                  {d.name}
                                </Link>
                              </td>
                              <td><span className="admin-format-pill">{d.format}</span></td>
                              <td>
                                <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Heart size={14} fill="#ef4444" /> {d.likes || 0}
                                </span>
                              </td>
                              <td>{d.views || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="admin-box-card">
                    <h3 className="admin-box-title">
                      <Users size={18} color="#8b5cf6" /> Người Dùng Đăng Ký Gần Đây
                    </h3>
                    <div className="admin-table-responsive">
                      <table className="admin-simple-table">
                        <thead>
                          <tr>
                            <th>Tài Khoản</th>
                            <th>Vai Trò</th>
                            <th>Bộ Sưu Tập</th>
                            <th>Ngày Tạo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stats.recentUsers || []).map((u) => (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 700 }}>{u.username}</td>
                              <td>
                                <span className={`user-role-badge role-${u.role}`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td>{u.favoritesCount} lá</td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QUẢN LÝ DECKS */}
        {/* ======================================================== */}
        {activeTab === 'decks' && (
          <div className="admin-section-wrap">
            <div className="admin-toolbar-row">
              <div className="admin-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm deck theo tên, archetype..."
                  value={deckSearch}
                  onChange={(e) => {
                    setDeckSearch(e.target.value);
                    setDeckPage(1);
                  }}
                />
              </div>

              <select
                className="admin-select"
                value={deckFormatFilter}
                onChange={(e) => {
                  setDeckFormatFilter(e.target.value);
                  setDeckPage(1);
                }}
              >
                <option value="">Tất cả Format</option>
                <option value="TCG">TCG</option>
                <option value="OCG">OCG</option>
                <option value="Master Duel">Master Duel</option>
                <option value="GOAT">GOAT</option>
                <option value="Edison">Edison</option>
              </select>

              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => handleOpenDeckModal()}
              >
                <Plus size={16} /> Thêm Bộ Bài Mới
              </button>
            </div>

            {decksLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải danh sách bộ bài...</p>
              </div>
            ) : (
              <div>
                <div className="admin-table-card">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Tên Bộ Bài</th>
                        <th>Format</th>
                        <th>Danh Mục</th>
                        <th>Tổng Lá</th>
                        <th>Giá Ước Tính</th>
                        <th>Nổi Bật</th>
                        <th>Lượt Thích</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decks.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                            Không tìm thấy bộ bài nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        decks.map((d) => (
                          <tr key={d._id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>
                                <Link to={`/deck/${d._id}`} className="admin-table-link">
                                  {d.name}
                                </Link>
                              </div>
                              {d.archetype && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  Archetype: {d.archetype}
                                </div>
                              )}
                            </td>
                            <td><span className="admin-format-pill">{d.format}</span></td>
                            <td><span className="admin-cat-pill">{d.category}</span></td>
                            <td>
                              {(d.stats?.main_count || 0) + (d.stats?.extra_count || 0) + (d.stats?.side_count || 0)} lá
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                              ${Number(d.stats?.total_price || 0).toFixed(2)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`admin-star-btn ${d.is_featured ? 'active' : ''}`}
                                onClick={() => handleToggleFeaturedDeck(d)}
                                title={d.is_featured ? 'Bỏ ghim nổi bật' : 'Ghim nổi bật'}
                              >
                                <Star size={16} fill={d.is_featured ? '#f59e0b' : 'none'} color={d.is_featured ? '#f59e0b' : '#94a3b8'} />
                              </button>
                            </td>
                            <td>{d.likes || 0}</td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  className="action-icon-btn edit"
                                  title="Chỉnh sửa thông tin"
                                  onClick={() => handleOpenDeckModal(d)}
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn delete"
                                  title="Xóa bộ bài"
                                  onClick={() => handleDeleteDeck(d)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {deckTotalPages > 1 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <Pagination
                      currentPage={deckPage}
                      totalPages={deckTotalPages}
                      onPageChange={(p) => setDeckPage(p)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: QUẢN LÝ THẺ BÀI & GIÁ */}
        {/* ======================================================== */}
        {activeTab === 'cards' && (
          <div className="admin-section-wrap">
            <div className="admin-toolbar-row">
              <div className="admin-search-box" style={{ maxWidth: '400px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo ID bài hoặc Tên lá bài..."
                  value={cardSearch}
                  onChange={(e) => {
                    setCardSearch(e.target.value);
                    setCardPage(1);
                  }}
                />
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Tổng cộng: <strong>{cardTotalCount.toLocaleString()}</strong> lá bài
              </div>
            </div>

            {cardsLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải danh sách lá bài...</p>
              </div>
            ) : (
              <div>
                <div className="admin-table-card">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Passcode ID</th>
                        <th>Tên Lá Bài</th>
                        <th>Loại Thẻ</th>
                        <th>Thuộc Tính / Cấp</th>
                        <th>Giá Thấp Nhất ($)</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((c) => (
                        <tr key={c.id}>
                          <td style={{ width: '55px' }}>
                            <img
                              src={c.card_images?.[0]?.image_url_small || `/images/cards/${c.id}_small.jpg`}
                              alt={c.name}
                              className="admin-card-thumb"
                              onError={(e) => { e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg'; }}
                            />
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{c.id}</td>
                          <td style={{ fontWeight: 700 }}>
                            <Link to={`/card/${c.id}`} target="_blank" className="admin-table-link">
                              {c.name}
                            </Link>
                          </td>
                          <td><span className="card-type-tag">{c.type}</span></td>
                          <td>
                            {c.level !== undefined && <span>⭐ {c.level} </span>}
                            {c.attribute && <strong>{c.attribute}</strong>}
                          </td>
                          <td>
                            {editingCardId === c.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="admin-price-input"
                                  value={editingCardPrice}
                                  onChange={(e) => setEditingCardPrice(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  className="btn-quick-save"
                                  onClick={() => handleSaveCardPrice(c.id)}
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  className="btn-quick-cancel"
                                  onClick={() => setEditingCardId(null)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                ${Number(c.min_price || 0).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingCardId !== c.id && (
                              <button
                                type="button"
                                className="action-icon-btn edit"
                                title="Sửa giá lá bài"
                                onClick={() => {
                                  setEditingCardId(c.id);
                                  setEditingCardPrice(c.min_price || 0);
                                }}
                              >
                                <Edit2 size={15} /> Sửa Giá
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {cardTotalPages > 1 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <Pagination
                      currentPage={cardPage}
                      totalPages={cardTotalPages}
                      onPageChange={(p) => setCardPage(p)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: QUẢN LÝ NGƯỜI DÙNG */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="admin-section-wrap">
            <div className="admin-toolbar-row">
              <div className="admin-search-box" style={{ maxWidth: '400px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo username..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Tổng cộng: <strong>{userTotalCount}</strong> tài khoản
              </div>
            </div>

            {usersLoading ? (
              <div className="loading-container" style={{ padding: '3rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải danh sách người dùng...</p>
              </div>
            ) : (
              <div>
                <div className="admin-table-card">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Tên Tài Khoản</th>
                        <th>Vai Trò (Role)</th>
                        <th>Bộ Sưu Tập (Favorites)</th>
                        <th>Ngày Tạo</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 800 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="admin-avatar-small">
                                {u.username.slice(0, 2).toUpperCase()}
                              </div>
                              <span>{u.username}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`user-role-badge role-${u.role}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                            <strong>{u.favoritesCount}</strong> lá bài
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="action-btn-role-toggle"
                                onClick={() => handleToggleRole(u)}
                                title={u.role === 'admin' ? 'Hạ xuống User' : 'Thăng cấp thành Admin'}
                              >
                                {u.role === 'admin' ? 'Hạ thành User' : 'Thăng lên Admin'}
                              </button>

                              {u.username !== 'admin' && (
                                <button
                                  type="button"
                                  className="action-icon-btn delete"
                                  title="Xóa tài khoản"
                                  onClick={() => handleDeleteUser(u)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {userTotalPages > 1 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <Pagination
                      currentPage={userPage}
                      totalPages={userTotalPages}
                      onPageChange={(p) => setUserPage(p)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL THÊM / SỬA BỘ BÀI (DECK) */}
        {/* ======================================================== */}
        {deckModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card modal-lg">
              <div className="admin-modal-header">
                <h3>{editingDeck ? 'Chỉnh Sửa Bộ Bài & Danh Sách Thẻ' : 'Tạo Bộ Bài Mới & Danh Sách Thẻ'}</h3>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setDeckModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveDeck} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="admin-modal-body" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 140px)' }}>
                  <div className="admin-form-group">
                    <label>Tên Bộ Bài *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tenpai Dragon OTK, Snake-Eye Fire King, Tearlaments..."
                      value={deckFormData.name}
                      onChange={(e) => setDeckFormData({ ...deckFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Format Thi Đấu *</label>
                      <select
                        value={deckFormData.format}
                        onChange={(e) => setDeckFormData({ ...deckFormData, format: e.target.value })}
                      >
                        <option value="TCG">TCG (Bắc Mỹ / Châu Âu)</option>
                        <option value="OCG">OCG (Nhật Bản / Châu Á)</option>
                        <option value="Master Duel">Master Duel</option>
                        <option value="GOAT">GOAT Format (2005)</option>
                        <option value="Edison">Edison Format (2010)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Danh Mục (Category) *</label>
                      <select
                        value={deckFormData.category}
                        onChange={(e) => setDeckFormData({ ...deckFormData, category: e.target.value })}
                      >
                        <option value="Tournament Meta">Tournament Meta</option>
                        <option value="Top Archetype">Top Archetype</option>
                        <option value="Budget Deck">Budget Deck</option>
                        <option value="Master Duel">Master Duel</option>
                        <option value="Anime Deck">Anime Deck</option>
                        <option value="Community">Community</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Archetype</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Tenpai, Snake-Eye, Kashtira, Tearlament..."
                        value={deckFormData.archetype}
                        onChange={(e) => setDeckFormData({ ...deckFormData, archetype: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Tác giả</label>
                      <input
                        type="text"
                        placeholder="Tên bài thủ / YGO Pro Deck"
                        value={deckFormData.author}
                        onChange={(e) => setDeckFormData({ ...deckFormData, author: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Giải Đấu Đạt Thành Tích</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: YCS Indianapolis 1st Place, WCQ Top 8..."
                      value={deckFormData.tournament}
                      onChange={(e) => setDeckFormData({ ...deckFormData, tournament: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Mô Tả Chiến Thuật</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả tóm tắt lối chơi và combo chính của bộ bài..."
                      value={deckFormData.description}
                      onChange={(e) => setDeckFormData({ ...deckFormData, description: e.target.value })}
                    />
                  </div>

                  {/* KHUNG QUẢN LÝ DANH SÁCH LÁ BÀI (CARDS MANAGEMENT) */}
                  <div className="deck-cards-manager-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          Danh Sách Lá Bài Trong Deck
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Main: <strong>{deckFormData.main_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0}</strong> lá • 
                          Extra: <strong>{deckFormData.extra_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0}</strong> lá • 
                          Side: <strong>{deckFormData.side_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0}</strong> lá
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoFillArchetype}
                        className="btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Tự động tìm kiếm các lá bài theo Archetype đã điền ở trên"
                      >
                        ⚡ Tự động nạp theo Archetype
                      </button>
                    </div>

                    {/* Ô TÌM VÀ THÊM THẺ NHANH */}
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            placeholder="Gõ tên lá bài để tìm và thêm (vd: Ash Blossom, Tearlaments, Nibiru...)"
                            value={modalCardSearch}
                            onChange={(e) => handleSearchModalCards(e.target.value)}
                            style={{ width: '100%', paddingLeft: '2.2rem' }}
                          />
                          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                      </div>

                      {/* Dropdown danh sách lá bài tìm thấy */}
                      {modalCardResults.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                          maxHeight: '260px',
                          overflowY: 'auto',
                          zIndex: 100,
                          marginTop: '4px',
                          padding: '0.4rem'
                        }}>
                          {modalCardResults.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.45rem 0.6rem',
                                borderBottom: '1px solid var(--border-color)',
                                gap: '0.5rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                                <img
                                  src={c.card_images?.[0]?.image_url_small || `/images/cards/${c.id}_small.jpg`}
                                  alt={c.name}
                                  style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => { e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg'; }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {c.type} • {c.min_price > 0 ? `$${c.min_price}` : 'Chưa có giá'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleAddCardToDeck(c, 'main_deck', 1)}
                                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  + Main
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCardToDeck(c, 'extra_deck', 1)}
                                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #a855f7', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  + Extra
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCardToDeck(c, 'side_deck', 1)}
                                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #64748b', background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  + Side
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* TABS CHUYỂN XEM MAIN / EXTRA / SIDE */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setDeckViewSection('main_deck')}
                        className={`manager-tab-btn ${deckViewSection === 'main_deck' ? 'active' : ''}`}
                      >
                        Main Deck ({deckFormData.main_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeckViewSection('extra_deck')}
                        className={`manager-tab-btn ${deckViewSection === 'extra_deck' ? 'active' : ''}`}
                      >
                        Extra Deck ({deckFormData.extra_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeckViewSection('side_deck')}
                        className={`manager-tab-btn ${deckViewSection === 'side_deck' ? 'active' : ''}`}
                      >
                        Side Deck ({deckFormData.side_deck?.reduce((s, c) => s + (c.quantity || 1), 0) || 0})
                      </button>
                    </div>

                    {/* DANH SÁCH THẺ TRONG SECTION ĐANG CHỌN */}
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem', background: 'var(--bg-primary)' }}>
                      {(deckFormData[deckViewSection] || []).length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Chưa có lá bài nào trong phần này. Hãy tìm kiếm ở trên để thêm vào.
                        </div>
                      ) : (
                        (deckFormData[deckViewSection] || []).map((c) => (
                          <div key={c.card_id} className="modal-card-item-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                              <img
                                src={c.image_url_small || `/images/cards/${c.card_id}_small.jpg`}
                                alt={c.name}
                                style={{ width: '22px', height: '32px', objectFit: 'cover', borderRadius: '3px' }}
                                onError={(e) => { e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg'; }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.name}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: '6px', padding: '0.15rem 0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCardQty(deckViewSection, c.card_id, -1)}
                                  style={{ border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
                                >
                                  -
                                </button>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                                  {c.quantity || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCardQty(deckViewSection, c.card_id, 1)}
                                  style={{ border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveCardFromDeck(deckViewSection, c.card_id)}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                                title="Xóa thẻ khỏi Deck"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="admin-form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={deckFormData.is_featured}
                        onChange={(e) => setDeckFormData({ ...deckFormData, is_featured: e.target.checked })}
                      />
                      <span> Đánh dấu là Bộ Bài Nổi Bật (Featured Deck)</span>
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setDeckModalOpen(false)}
                    disabled={deckSubmitting}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-admin-primary"
                    disabled={deckSubmitting}
                  >
                    {deckSubmitting ? 'Đang lưu...' : (editingDeck ? 'Cập Nhật Bộ Bài' : 'Tạo Mới Bộ Bài')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
