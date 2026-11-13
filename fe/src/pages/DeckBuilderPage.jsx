import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getCards,
  getDeckById,
  createUserDeck,
  updateUserDeck,
  deleteUserDeck,
  getMyDecks
} from '../services/api';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Save,
  Download,
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Shield,
  RotateCcw
} from 'lucide-react';

export default function DeckBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editDeckId = searchParams.get('id');

  // Trạng thái bộ bài
  const [deckId, setDeckId] = useState(editDeckId || null);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('TCG');
  const [category, setCategory] = useState('Community');
  const [archetype, setArchetype] = useState('');
  const [description, setDescription] = useState('');

  // 3 phần của Deck
  const [mainDeck, setMainDeck] = useState([]);
  const [extraDeck, setExtraDeck] = useState([]);
  const [sideDeck, setSideDeck] = useState([]);
  const [activeSection, setActiveSection] = useState('main'); // 'main', 'extra', 'side'

  // Tìm kiếm thẻ bài
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Danh sách Deck của cá nhân
  const [myDecks, setMyDecks] = useState([]);
  const [loadingMyDecks, setLoadingMyDecks] = useState(false);

  // Trạng thái thao tác & thông báo
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Yêu cầu đăng nhập
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/deck-builder');
    }
  }, [user]);

  // Load danh sách deck của tôi
  const loadMyDecks = () => {
    if (!user) return;
    setLoadingMyDecks(true);
    getMyDecks()
      .then((res) => {
        if (res.data?.success) {
          setMyDecks(res.data.data || []);
        }
      })
      .catch((err) => console.error('Error load my decks:', err))
      .finally(() => setLoadingMyDecks(false));
  };

  useEffect(() => {
    loadMyDecks();
  }, [user]);

  // Nếu có ID truyền vào thì load dữ liệu deck để chỉnh sửa
  useEffect(() => {
    if (editDeckId) {
      getDeckById(editDeckId)
        .then((res) => {
          if (res.data?.success) {
            const d = res.data.data;
            setDeckId(d._id);
            setName(d.name || '');
            setFormat(d.format || 'TCG');
            setCategory(d.category || 'Community');
            setArchetype(d.archetype || '');
            setDescription(d.description || '');
            setMainDeck(d.main_deck || []);
            setExtraDeck(d.extra_deck || []);
            setSideDeck(d.side_deck || []);
          }
        })
        .catch((err) => console.error('Error load deck to edit:', err));
    }
  }, [editDeckId]);

  // Tìm kiếm thẻ bài khi người dùng gõ
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      getCards({ fname: searchQuery.trim(), limit: 12 })
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setSearchResults(res.data.data);
          }
        })
        .catch((err) => console.error('Search card error:', err))
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Thống kê số lượng thẻ & giá
  const mainCount = mainDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const extraCount = extraDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const sideCount = sideDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const totalPrice = [
    ...mainDeck,
    ...extraDeck,
    ...sideDeck
  ].reduce((s, c) => s + (c.price || 0) * (c.quantity || 1), 0);

  // Thêm thẻ bài vào section (Main, Extra, Side)
  const handleAddCard = (card, targetSection = activeSection) => {
    const isExtraCard = (() => {
      const t = (card.type || '').toLowerCase();
      return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    })();

    // Tự động chuyển Extra deck nếu thẻ là Fusion/Synchro/Xyz/Link và đang ở Main
    let finalSection = targetSection;
    if (finalSection === 'main' && isExtraCard) {
      finalSection = 'extra';
    } else if (finalSection === 'extra' && !isExtraCard) {
      finalSection = 'main';
    }

    let list = [];
    let setList = null;
    let maxSectionCount = 60;

    if (finalSection === 'main') {
      list = [...mainDeck];
      setList = setMainDeck;
      maxSectionCount = 60;
    } else if (finalSection === 'extra') {
      list = [...extraDeck];
      setList = setExtraDeck;
      maxSectionCount = 15;
    } else {
      list = [...sideDeck];
      setList = setSideDeck;
      maxSectionCount = 15;
    }

    const currentCount = list.reduce((s, c) => s + (c.quantity || 1), 0);
    if (currentCount >= maxSectionCount) {
      showToast('error', `Phần ${finalSection.toUpperCase()} đã đạt giới hạn tối đa (${maxSectionCount} lá)!`);
      return;
    }

    // Đếm tổng số lượng bản sao của lá bài này trong cả Main + Extra + Side (Tối đa 3)
    const copiesInMain = mainDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const copiesInExtra = extraDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const copiesInSide = sideDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const totalCopies = copiesInMain + copiesInExtra + copiesInSide;

    if (totalCopies >= 3) {
      showToast('error', `Mỗi lá bài chỉ được tối đa 3 bản sao trong cả bộ bài!`);
      return;
    }

    const existIndex = list.findIndex((c) => String(c.card_id) === String(card.id));
    if (existIndex >= 0) {
      list[existIndex].quantity = (list[existIndex].quantity || 1) + 1;
    } else {
      list.push({
        card_id: card.id,
        name: card.name,
        quantity: 1,
        card_type: card.type || 'Monster',
        image_url: card.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
        image_url_small: card.card_images?.[0]?.image_url_small || `/images/cards/${card.id}_small.jpg`,
        price: card.min_price || 0
      });
    }

    setList(list);
    showToast('success', `Đã thêm ${card.name} vào ${finalSection.toUpperCase()} Deck!`);
  };

  // Tăng/giảm số lượng thẻ
  const handleUpdateQty = (section, cardId, delta) => {
    let list, setList;
    if (section === 'main') { list = [...mainDeck]; setList = setMainDeck; }
    else if (section === 'extra') { list = [...extraDeck]; setList = setExtraDeck; }
    else { list = [...sideDeck]; setList = setSideDeck; }

    const idx = list.findIndex((c) => String(c.card_id) === String(cardId));
    if (idx >= 0) {
      const newQty = (list[idx].quantity || 1) + delta;
      if (newQty <= 0) {
        list.splice(idx, 1);
      } else {
        // Kiểm tra tổng không quá 3 bản sao
        const copiesInMain = section === 'main' ? 0 : (mainDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0);
        const copiesInExtra = section === 'extra' ? 0 : (extraDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0);
        const copiesInSide = section === 'side' ? 0 : (sideDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0);
        if (copiesInMain + copiesInExtra + copiesInSide + newQty > 3) {
          showToast('error', 'Tối đa 3 bản sao mỗi lá bài!');
          return;
        }
        list[idx].quantity = newQty;
      }
      setList(list);
    }
  };

  // Xóa thẻ khỏi section
  const handleRemoveCard = (section, cardId) => {
    if (section === 'main') setMainDeck(mainDeck.filter((c) => String(c.card_id) !== String(cardId)));
    else if (section === 'extra') setExtraDeck(extraDeck.filter((c) => String(c.card_id) !== String(cardId)));
    else setSideDeck(sideDeck.filter((c) => String(c.card_id) !== String(cardId)));
  };

  // Reset form deck
  const handleNewDeck = () => {
    setDeckId(null);
    setName('');
    setArchetype('');
    setDescription('');
    setCategory('Community');
    setFormat('TCG');
    setMainDeck([]);
    setExtraDeck([]);
    setSideDeck([]);
    navigate('/deck-builder');
  };

  // Lưu Deck (Tạo mới hoặc Cập nhật)
  const handleSaveDeck = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Vui lòng nhập tên bộ bài!');
      return;
    }
    if (mainCount < 40) {
      showToast('error', `Main Deck cần tối thiểu 40 lá (hiện tại: ${mainCount} lá)!`);
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      format,
      category,
      archetype: archetype.trim(),
      description: description.trim(),
      main_deck: mainDeck,
      extra_deck: extraDeck,
      side_deck: sideDeck
    };

    try {
      if (deckId) {
        const res = await updateUserDeck(deckId, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật bộ bài "${name}" thành công!`);
          loadMyDecks();
        }
      } else {
        const res = await createUserDeck(payload);
        if (res.data?.success) {
          showToast('success', `Đã tạo bộ bài mới "${name}" thành công!`);
          setDeckId(res.data.data._id);
          loadMyDecks();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu bộ bài');
    } finally {
      setSaving(false);
    }
  };

  // Xóa Deck
  const handleDeleteDeck = async (id, deckName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ bài "${deckName}"?`)) return;
    try {
      const res = await deleteUserDeck(id);
      if (res.data?.success) {
        showToast('success', `Đã xóa bộ bài "${deckName}"`);
        if (deckId === id) {
          handleNewDeck();
        }
        loadMyDecks();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa bộ bài');
    }
  };

  // Xuất file .ydk
  const handleExportYDK = () => {
    let content = '#created by YGO Card Market Deck Builder\n#main\n';
    mainDeck.forEach((c) => {
      for (let i = 0; i < (c.quantity || 1); i++) content += `${c.card_id}\n`;
    });
    content += '#extra\n';
    extraDeck.forEach((c) => {
      for (let i = 0; i < (c.quantity || 1); i++) content += `${c.card_id}\n`;
    });
    content += '!side\n';
    sideDeck.forEach((c) => {
      for (let i = 0; i < (c.quantity || 1); i++) content += `${c.card_id}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(name || 'My_Deck').replace(/[^a-zA-Z0-9_-]/g, '_')}.ydk`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Đã xuất file .ydk thành công!');
  };

  return (
    <div className="app-shell">
      <Navbar />

      {/* Thông báo Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
        {/* HEADER HERO */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="decks-badge-pill" style={{ margin: 0 }}>
                  <Sparkles size={14} color="#f59e0b" /> Trình Tạo Bộ Bài Cá Nhân
                </span>
                {deckId && (
                  <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
                    Chế độ: Đang Chỉnh Sửa
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
                {deckId ? `Chỉnh Sửa: ${name || 'Bộ bài'}` : 'Yu-Gi-Oh! Deck Builder'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>
                Tìm kiếm thẻ bài, tùy biến số lượng và xây dựng chiến thuật theo chuẩn Yu-Gi-Oh! (Main 40-60, Extra ≤ 15, Side ≤ 15).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleNewDeck}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
              >
                <Plus size={16} /> Tạo Deck Mới
              </button>
              <button
                type="button"
                onClick={handleExportYDK}
                disabled={mainCount === 0}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
                title="Tải về file định dạng .ydk cho Project Ignis / EDOPro / YGOPRO"
              >
                <Download size={16} /> Xuất .YDK
              </button>
              <button
                type="button"
                onClick={handleSaveDeck}
                disabled={saving}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
              >
                <Save size={16} /> {saving ? 'Đang lưu...' : deckId ? 'Lưu Thay Đổi' : 'Lưu Bộ Bài'}
              </button>
            </div>
          </div>
        </div>

        {/* THÔNG TIN TỔNG QUAN VÀ METRIC BANNER */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Main Deck (40-60)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mainCount >= 40 && mainCount <= 60 ? '#10b981' : '#ef4444' }}>
                  {mainCount} / 60 lá {mainCount < 40 && <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>(Cần thêm {40 - mainCount})</span>}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Extra Deck (≤ 15)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: extraCount <= 15 ? '#10b981' : '#ef4444' }}>
                  {extraCount} / 15 lá
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Side Deck (≤ 15)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: sideCount <= 15 ? '#10b981' : '#ef4444' }}>
                  {sideCount} / 15 lá
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ước Tính Giá Thị Trường</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BỐ CỤC CHÍNH 2 CỘT: TRÁI LÀ TÌM KIẾM & BỘ SƯU TẬP, PHẢI LÀ BUILDER */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          
          {/* CỘT CHÍNH: FORM VÀ DANH SÁCH LÁ BÀI TRONG DECK */}
          <div>
            {/* THÔNG TIN BỘ BÀI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Tên Bộ Bài *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: My Favorite Cyber Dragon, Kashtira Control..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Format Thi Đấu
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="filter-select"
                    style={{ width: '100%', padding: '0.55rem 0.85rem' }}
                  >
                    <option value="TCG">TCG (Bắc Mỹ / Châu Âu)</option>
                    <option value="OCG">OCG (Nhật Bản / Châu Á)</option>
                    <option value="Master Duel">Master Duel</option>
                    <option value="GOAT">GOAT Format (2005)</option>
                    <option value="Edison">Edison Format (2010)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Archetype (Hệ bài)
                  </label>
                  <input
                    type="text"
                    value={archetype}
                    onChange={(e) => setArchetype(e.target.value)}
                    placeholder="Ví dụ: Blue-Eyes, Tearlaments, Snake-Eye..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Ghi Chú / Mô Tả Chiến Thuật
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú combo mở đầu, đối thủ khắc chế hoặc lưu ý khi cầm deck..."
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* THANH TAB PHẦN BÀI: MAIN (40-60) | EXTRA (0-15) | SIDE (0-15) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setActiveSection('main')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSection === 'main' ? '#3b82f6' : 'transparent',
                    color: activeSection === 'main' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Main Deck ({mainCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('extra')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSection === 'extra' ? '#a855f7' : 'transparent',
                    color: activeSection === 'extra' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Extra Deck ({extraCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('side')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSection === 'side' ? '#64748b' : 'transparent',
                    color: activeSection === 'side' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Side Deck ({sideCount})
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeSection === 'main' && 'Yêu cầu 40 đến 60 lá bài Monster, Spell, Trap'}
                {activeSection === 'extra' && 'Tối đa 15 lá Fusion, Synchro, Xyz, Link'}
                {activeSection === 'side' && 'Tối đa 15 lá bài dự bị để xoay chuyển ván đấu'}
              </div>
            </div>

            {/* LƯỚI HIỂN THỊ CÁC THẺ TRONG PHẦN ĐANG CHỌN */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', minHeight: '380px' }}>
              {(() => {
                const currentList = activeSection === 'main' ? mainDeck : activeSection === 'extra' ? extraDeck : sideDeck;
                if (currentList.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                      <Layers size={40} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>Chưa có thẻ nào trong {activeSection.toUpperCase()} Deck</div>
                      <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0.4rem auto 0' }}>
                        Dùng thanh tìm kiếm ở cột bên phải để thêm lá bài vào phần này nhé!
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {currentList.map((card) => (
                      <div
                        key={card.card_id}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative'
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '421/614', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                          <img
                            src={card.image_url_small || `/images/cards/${card.card_id}_small.jpg`}
                            alt={card.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg'; }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                            }}
                          >
                            x{card.quantity || 1}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.35rem' }} title={card.name}>
                          {card.name}
                        </div>

                        {/* NÚT TĂNG/GIẢM VÀ XÓA */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(activeSection, card.card_id, -1)}
                              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(activeSection, card.card_id, 1)}
                              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCard(activeSection, card.card_id)}
                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            title="Xóa khỏi Deck"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* CỘT PHỤ (BÊN PHẢI): TÌM KIẾM THẺ NHANH & DANH SÁCH DECKS CỦA TÔI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KHUNG TÌM KIẾM LÁ BÀI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
                <Search size={18} color="var(--primary)" />
                <span>Tìm &amp; Thêm Thẻ Bài</span>
              </div>

              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Gõ tên lá bài..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {searching ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Đang tìm kiếm lá bài...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {searchQuery.trim().length >= 2 ? 'Không tìm thấy lá bài nào khớp' : 'Nhập ít nhất 2 ký tự để tìm kiếm'}
                  </div>
                ) : (
                  searchResults.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.5rem',
                        borderRadius: '8px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <img
                          src={c.card_images?.[0]?.image_url_small || `/images/cards/${c.id}_small.jpg`}
                          alt={c.name}
                          style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                          onError={(e) => { e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg'; }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.name}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {c.min_price > 0 ? `$${c.min_price}` : '$1.00'} • {c.type}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddCard(c)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        + Thêm
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DANH SÁCH BỘ BÀI CỦA TÔI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Layers size={18} color="#10b981" />
                  <span>Deck Của Tôi ({myDecks.length})</span>
                </div>
              </div>

              {loadingMyDecks ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Đang tải danh sách...
                </div>
              ) : myDecks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Bạn chưa có bộ bài nào. Hãy tạo ngay một deck đầu tiên nhé!
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myDecks.map((d) => (
                    <div
                      key={d._id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        background: deckId === d._id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-primary)',
                        border: deckId === d._id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div
                        onClick={() => navigate(`/deck-builder?id=${d._id}`)}
                        style={{ cursor: 'pointer', overflow: 'hidden', flex: 1 }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {d.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {d.format} • {(d.stats?.main_count || 0)} lá • ${(d.stats?.total_price || 0).toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <Link
                          to={`/deck/${d._id}`}
                          style={{ color: 'var(--text-secondary)', padding: '0.2rem', textDecoration: 'none' }}
                          title="Xem chi tiết"
                        >
                          👁️
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeck(d._id, d.name)}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                          title="Xóa deck"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
