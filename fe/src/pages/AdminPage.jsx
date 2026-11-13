import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats,
  getAdminCards,
  createAdminCard,
  updateAdminCard,
  updateCardPrice,
  deleteAdminCard,
  getAdminUsers,
  updateUserRole,
  deleteUser
} from '../services/api';
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  Users,
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trophy,
  Flame,
  TrendingUp,
  Heart,
  Star,
  X
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'cards', 'users'

  // Overview Data
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Cards Management
  const [cards, setCards] = useState([]);
  const [cardPage, setCardPage] = useState(1);
  const [cardTotalPages, setCardTotalPages] = useState(1);
  const [cardTotalCount, setCardTotalCount] = useState(0);
  const [cardSearch, setCardSearch] = useState('');
  const [cardsLoading, setCardsLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardPrice, setEditingCardPrice] = useState('');
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    id: '',
    name: '',
    type: 'Normal Monster',
    attribute: 'DARK',
    race: 'Dragon',
    level: 4,
    atk: 1500,
    def: 1000,
    archetype: '',
    min_price: 1.0,
    ban_tcg: 'Unlimited',
    image_url: '',
    desc: ''
  });
  const [cardSubmitting, setCardSubmitting] = useState(false);

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

  // 2. Tải Cards
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

  // 3. Tải Users
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
      if (activeTab === 'cards') loadCards();
      if (activeTab === 'users') loadUsers();
    }
  }, [activeTab, isAdmin]);

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

  // Mở modal Thêm / Sửa Thẻ Bài
  const handleOpenCardModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setCardFormData({
        id: card.id || '',
        name: card.name || '',
        type: card.type || 'Normal Monster',
        attribute: card.attribute || 'DARK',
        race: card.race || 'Dragon',
        level: card.level !== undefined ? card.level : 4,
        atk: card.atk !== undefined ? card.atk : 1500,
        def: card.def !== undefined ? card.def : 1000,
        archetype: card.archetype || '',
        min_price: card.min_price || 0,
        ban_tcg: card.banlist_info?.ban_tcg || 'Unlimited',
        image_url: card.card_images?.[0]?.image_url || '',
        desc: card.desc || ''
      });
    } else {
      setEditingCard(null);
      setCardFormData({
        id: '',
        name: '',
        type: 'Effect Monster',
        attribute: 'DARK',
        race: 'Dragon',
        level: 4,
        atk: 1500,
        def: 1000,
        archetype: '',
        min_price: 1.0,
        ban_tcg: 'Unlimited',
        image_url: '',
        desc: ''
      });
    }
    setCardModalOpen(true);
  };

  // Lưu Thẻ Bài (Tạo mới hoặc Cập nhật)
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardFormData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên lá bài');
      return;
    }
    setCardSubmitting(true);
    try {
      if (editingCard) {
        const res = await updateAdminCard(editingCard.id, cardFormData);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật lá bài "${cardFormData.name}"!`);
          setCardModalOpen(false);
          loadCards();
        }
      } else {
        const res = await createAdminCard(cardFormData);
        if (res.data?.success) {
          showToast('success', `Đã thêm mới lá bài "${cardFormData.name}"!`);
          setCardModalOpen(false);
          loadCards();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu lá bài');
    } finally {
      setCardSubmitting(false);
    }
  };

  // Xóa Thẻ Bài
  const handleDeleteCard = async (card) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lá bài "${card.name}" (#${card.id})? Hành động này không thể hoàn tác.`)) return;
    try {
      const res = await deleteAdminCard(card.id);
      if (res.data?.success) {
        showToast('success', `Đã xóa lá bài "${card.name}"`);
        loadCards();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa lá bài');
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

        {/* Header quản trị */}
        <div className="admin-hero-header">
          <div className="admin-hero-left">
            <h1 className="admin-hero-title">Quản Trị Hệ Thống</h1>
            <p className="admin-hero-subtitle">
              Quản lý danh mục thẻ bài, cập nhật giá thị trường và phân quyền tài khoản người dùng.
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

        {/* Tab 1: Thống kê tổng quan */}
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

        {/* Tab 2: Quản lý thẻ bài và giá */}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Tổng cộng: <strong>{cardTotalCount.toLocaleString()}</strong> lá bài
                </div>
                <button
                  type="button"
                  className="btn-admin-primary"
                  onClick={() => handleOpenCardModal()}
                >
                  <Plus size={16} /> Thêm Thẻ Bài Mới
                </button>
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
                            {c.level !== undefined && <span>Lv.{c.level} </span>}
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
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="action-icon-btn edit"
                                  title="Chỉnh sửa thông tin lá bài"
                                  onClick={() => handleOpenCardModal(c)}
                                >
                                  <Edit2 size={14} /> Sửa
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn delete"
                                  title="Xóa lá bài khỏi cơ sở dữ liệu"
                                  onClick={() => handleDeleteCard(c)}
                                >
                                  <Trash2 size={14} /> Xóa
                                </button>
                              </div>
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

        {/* Tab 3: Quản lý người dùng */}
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

        {/* Modal thêm / sửa lá bài */}
        {cardModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card modal-lg">
              <div className="admin-modal-header">
                <h3>{editingCard ? `Chỉnh Sửa Lá Bài #${editingCard.id}` : 'Thêm Lá Bài Mới Vào Cơ Sở Dữ Liệu'}</h3>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setCardModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="admin-modal-body" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 140px)' }}>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Passcode ID (Mã 8 số) {editingCard ? '(Cố định)' : ''}</label>
                      <input
                        type="number"
                        placeholder="Để trống để tự động sinh mã ID ngẫu nhiên"
                        value={cardFormData.id}
                        disabled={!!editingCard}
                        onChange={(e) => setCardFormData({ ...cardFormData, id: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Tên Lá Bài *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Blue-Eyes White Dragon, Dark Magician..."
                        value={cardFormData.name}
                        onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Loại Thẻ (Card Type) *</label>
                      <select
                        value={cardFormData.type}
                        onChange={(e) => setCardFormData({ ...cardFormData, type: e.target.value })}
                      >
                        <option value="Normal Monster">Normal Monster</option>
                        <option value="Effect Monster">Effect Monster</option>
                        <option value="Tuner Monster">Tuner Monster</option>
                        <option value="Flip Effect Monster">Flip Effect Monster</option>
                        <option value="Ritual Monster">Ritual Monster</option>
                        <option value="Ritual Effect Monster">Ritual Effect Monster</option>
                        <option value="Fusion Monster">Fusion Monster</option>
                        <option value="Synchro Monster">Synchro Monster</option>
                        <option value="Synchro Tuner Monster">Synchro Tuner Monster</option>
                        <option value="XYZ Monster">XYZ Monster</option>
                        <option value="Pendulum Effect Monster">Pendulum Effect Monster</option>
                        <option value="Link Monster">Link Monster</option>
                        <option value="Spell Card">Spell Card (Phép)</option>
                        <option value="Trap Card">Trap Card (Bẫy)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Thuộc Tính (Attribute)</label>
                      <select
                        value={cardFormData.attribute}
                        onChange={(e) => setCardFormData({ ...cardFormData, attribute: e.target.value })}
                      >
                        <option value="">Không có (Spells / Traps)</option>
                        <option value="DARK">DARK (Bóng tối)</option>
                        <option value="LIGHT">LIGHT (Ánh sáng)</option>
                        <option value="EARTH">EARTH (Đất)</option>
                        <option value="WATER">WATER (Nước)</option>
                        <option value="FIRE">FIRE (Lửa)</option>
                        <option value="WIND">WIND (Gió)</option>
                        <option value="DIVINE">DIVINE (Thần)</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Chủng Tộc / Race</label>
                      <input
                        type="text"
                        placeholder="Dragon, Spellcaster, Warrior, Cyberse, Normal, Quick-Play..."
                        value={cardFormData.race}
                        onChange={(e) => setCardFormData({ ...cardFormData, race: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Cấp Sao / Rank (1-12)</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        placeholder="1 - 12"
                        value={cardFormData.level}
                        onChange={(e) => setCardFormData({ ...cardFormData, level: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Sức Tấn Công (ATK)</label>
                      <input
                        type="number"
                        placeholder="Ví dụ: 2500, 3000..."
                        value={cardFormData.atk}
                        onChange={(e) => setCardFormData({ ...cardFormData, atk: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Sức Phòng Thủ (DEF)</label>
                      <input
                        type="number"
                        placeholder="Ví dụ: 2000, 2500..."
                        value={cardFormData.def}
                        onChange={(e) => setCardFormData({ ...cardFormData, def: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Archetype (Hệ bài)</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Blue-Eyes, Dark Magician, Tearlaments, Snake-Eye..."
                        value={cardFormData.archetype}
                        onChange={(e) => setCardFormData({ ...cardFormData, archetype: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Giá Thấp Nhất ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={cardFormData.min_price}
                        onChange={(e) => setCardFormData({ ...cardFormData, min_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Trạng Thái Banlist</label>
                      <select
                        value={cardFormData.ban_tcg}
                        onChange={(e) => setCardFormData({ ...cardFormData, ban_tcg: e.target.value })}
                      >
                        <option value="Unlimited">Không cấm (Unlimited - Tối đa 3 lá)</option>
                        <option value="Semi-Limited">Hạn chế 2 (Semi-Limited - Tối đa 2 lá)</option>
                        <option value="Limited">Hạn chế 1 (Limited - Tối đa 1 lá)</option>
                        <option value="Forbidden">Bị cấm (Forbidden - 0 lá)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Đường Dẫn Ảnh Thẻ (Image URL)</label>
                      <input
                        type="url"
                        placeholder="Để trống để tự động lấy từ CDN"
                        value={cardFormData.image_url}
                        onChange={(e) => setCardFormData({ ...cardFormData, image_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Mô Tả Hiệu Ứng Lá Bài (Card Effect / Lore)</label>
                    <textarea
                      rows={4}
                      placeholder="Nhập nội dung hiệu ứng chi tiết của lá bài..."
                      value={cardFormData.desc}
                      onChange={(e) => setCardFormData({ ...cardFormData, desc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCardModalOpen(false)}
                    disabled={cardSubmitting}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-admin-primary"
                    disabled={cardSubmitting}
                  >
                    {cardSubmitting ? 'Đang lưu...' : (editingCard ? 'Cập Nhật Lá Bài' : 'Lưu Lá Bài Mới')}
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
