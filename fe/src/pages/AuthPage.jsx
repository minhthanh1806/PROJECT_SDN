import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Dùng chung cho cả trang Đăng nhập và Đăng ký
export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const res = await loginUser({ username, password });
        login(res.data.data);
        navigate('/');
      } else {
        await registerUser({ username, password });
        setSuccess('Đăng ký thành công! Đang chuyển sang trang đăng nhập...');
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ padding: '3rem 1.25rem' }}>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2 className="auth-title">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>

          <label className="auth-label">Tên đăng nhập</label>
          <input
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            autoFocus
          />

          <label className="auth-label">Mật khẩu</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? 'Nhập mật khẩu' : 'Ít nhất 6 ký tự'}
          />

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>

          <div className="auth-switch">
            {isLogin ? (
              <>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></>
            ) : (
              <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
