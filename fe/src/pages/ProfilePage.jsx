import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CardGrid from '../components/CardGrid';
import { getUserProfile, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Key, Star, DollarSign, Layers } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Load thông tin profile và danh sách favorites
  const loadProfile = () => {
    if (!user || !user.id) return;
    setLoading(true);
    getUserProfile(user.id)
      .then((res) => {
        if (res.data?.success) {
          setProfileData(res.data.data);
        }
      })
      .catch((err) => console.error('Error load profile:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user]);

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword) {
      setPwdMsg({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await changePassword(user.id, { oldPassword, newPassword });
      setPwdMsg({ type: 'success', text: res.data?.message || 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Không thể đổi mật khẩu' });
    } finally {
      setPwdSubmitting(false);
    }
  };

  // Callback khi xóa/bỏ favorite ngay trên trang cá nhân
  const handleFavoriteChange = (cardId, isFavorited) => {
    if (!isFavorited && profileData) {
      const updatedCards = (profileData.favoriteCards || []).filter(c => c.id !== cardId);
      const totalVal = updatedCards.reduce((sum, c) => sum + (c.min_price || 0), 0);
      setProfileData({
        ...profileData,
        favoriteCards: updatedCards,
        stats: {
          totalCards: updatedCards.length,
          totalValue: Number(totalVal.toFixed(2))
        }
      });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Mới đây';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '2rem 1.25rem 3.5rem' }}>
        {/* Khung thông tin cá nhân & Thống kê */}
        <div className="profile-layout" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Cột trái: Thông tin tài khoản & Đổi mật khẩu */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <User size={38} color="#ffffff" />
              </div>
              <h2 className="profile-username">{profileData?.username || user?.username}</h2>
              <div className="profile-meta">
                <Calendar size={14} /> Ngày tham gia: {formatDate(profileData?.createdAt || user?.createdAt)}
              </div>
            </div>

            {/* Form đổi mật khẩu */}
            <div className="profile-card" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                <Key size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Đổi mật khẩu</h3>
              </div>

              <form onSubmit={handleChangePassword}>
                <label className="auth-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Nhập mật khẩu cũ"
                />

                <label className="auth-label">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Ít nhất 6 ký tự"
                />

                <label className="auth-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Nhập lại mật khẩu mới"
                />

                {pwdMsg.text && (
                  <div className={pwdMsg.type === 'success' ? 'auth-success' : 'auth-error'}>
                    {pwdMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="auth-submit"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  {pwdSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                </button>
              </form>
            </div>
          </div>

          {/* Cột phải: Bộ sưu tập thẻ bài yêu thích & Thống kê */}
          <div className="profile-main">
            {/* Thanh thống kê giá trị bộ sưu tập */}
            <div className="collection-stats-bar">
              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Layers size={22} />
                </div>
                <div>
                  <div className="stat-label">Tổng thẻ trong bộ sưu tập</div>
                  <div className="stat-number">{profileData?.stats?.totalCards || 0} lá bài</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <DollarSign size={22} />
                </div>
                <div>
                  <div className="stat-label">Ước tính giá trị thị trường</div>
                  <div className="stat-number" style={{ color: '#10b981' }}>
                    ${profileData?.stats?.totalValue?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tiêu đề danh sách thẻ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2rem 0 1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Thẻ bài yêu thích / Bộ sưu tập cá nhân
                </h3>
              </div>
              <Link
                to="/deck-builder"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                <Layers size={16} /> Quản lý Deck của tôi
              </Link>
            </div>

            {/* Danh sách thẻ yêu thích */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải bộ sưu tập...</p>
              </div>
            ) : profileData?.favoriteCards?.length > 0 ? (
              <CardGrid
                cards={profileData.favoriteCards}
                loading={false}
                onFavoriteChange={handleFavoriteChange}
              />
            ) : (
              <div className="empty-container" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3>Chưa có thẻ nào trong bộ sưu tập</h3>
                <p>Nhấn vào biểu tượng ngôi sao trên mỗi thẻ bài tại Trang chủ để lưu vào bộ sưu tập.</p>
                <Link to="/" className="auth-submit" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem', padding: '0.6rem 1.25rem' }}>
                  Xem danh sách thẻ bài
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
