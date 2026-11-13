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
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Shield,
  Eye,
  Edit3,
  Wand2,
  X
} from 'lucide-react';

// Style chuẩn đồng bộ cho tất cả Input / Select / Textarea trên trang Deck Builder
const FIELD_LABEL_STYLE = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: '0.4rem',
  letterSpacing: '0.01em'
};

const FIELD_INPUT_STYLE = {
  width: '100%',
  height: '42px',
  padding: '0 0.85rem',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
};

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

  // Tìm kiếm thẻ bài & bộ lọc loại thẻ
  const [searchQuery, setSearchQuery] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState('all'); // 'all', 'Monster', 'Spell Card', 'Trap Card'
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
  }, [user, navigate]);

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

  // Tìm kiếm thẻ bài (hoặc tải danh sách thẻ gợi ý ban đầu khi chưa gõ từ khóa)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearching(true);
      const params = { limit: 14 };
      if (searchQuery.trim()) {
        params.fname = searchQuery.trim();
      }
      if (cardTypeFilter !== 'all') {
        params.type = cardTypeFilter;
      }

      getCards(params)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setSearchResults(res.data.data);
          }
        })
        .catch((err) => console.error('Search card error:', err))
        .finally(() => setSearching(false));
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, cardTypeFilter]);

  // Thống kê số lượng thẻ & giá
  const mainCount = mainDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const extraCount = extraDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const sideCount = sideDeck.reduce((s, c) => s + (c.quantity || 1), 0);
  const totalPrice = [...mainDeck, ...extraDeck, ...sideDeck].reduce(
    (s, c) => s + (c.price || 0) * (c.quantity || 1),
    0
  );

  // Tự động nạp thẻ theo Archetype đã nhập
  const handleAutoFillArchetype = async () => {
    const arc = archetype.trim() || searchQuery.trim();
    if (!arc) {
      showToast('error', 'Hãy nhập tên Hệ bài (Archetype) trước khi nạp tự động!');
      return;
    }
    setSearching(true);
    try {
      const res = await getCards({ fname: arc, limit: 25 });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSearchResults(res.data.data);
        showToast('success', `Đã tìm thấy ${res.data.data.length} lá bài thuộc nhánh "${arc}"!`);
      } else {
        showToast('error', `Không tìm thấy lá bài nào cho "${arc}"`);
      }
    } catch (err) {
      showToast('error', 'Không thể tìm kiếm theo Archetype');
    } finally {
      setSearching(false);
    }
  };

  // Thêm thẻ bài vào section (Main, Extra, Side)
  const handleAddCard = (card, targetSection = activeSection) => {
    const isExtraCard = (() => {
      const t = (card.type || '').toLowerCase();
      return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    })();

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
      showToast('error', `Phần ${finalSection.toUpperCase()} đã đạt tối đa (${maxSectionCount} lá)!`);
      return;
    }

    const copiesInMain = mainDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const copiesInExtra = extraDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const copiesInSide = sideDeck.find((c) => String(c.card_id) === String(card.id))?.quantity || 0;
    const totalCopies = copiesInMain + copiesInExtra + copiesInSide;

    if (totalCopies >= 3) {
      showToast('error', 'Mỗi lá bài chỉ được tối đa 3 bản sao trong toàn bộ Deck!');
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
    showToast('success', `Đã thêm "${card.name}" vào ${finalSection.toUpperCase()} Deck`);
  };

  // Tăng/giảm số lượng thẻ
  const handleUpdateQty = (section, cardId, delta) => {
    let list, setList;
    if (section === 'main') {
      list = [...mainDeck];
      setList = setMainDeck;
    } else if (section === 'extra') {
      list = [...extraDeck];
      setList = setExtraDeck;
    } else {
      list = [...sideDeck];
      setList = setSideDeck;
    }

    const idx = list.findIndex((c) => String(c.card_id) === String(cardId));
    if (idx >= 0) {
      const newQty = (list[idx].quantity || 1) + delta;
      if (newQty <= 0) {
        list.splice(idx, 1);
      } else {
        const copiesInMain =
          section === 'main' ? 0 : mainDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0;
        const copiesInExtra =
          section === 'extra' ? 0 : extraDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0;
        const copiesInSide =
          section === 'side' ? 0 : sideDeck.find((c) => String(c.card_id) === String(cardId))?.quantity || 0;
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

  // Xóa trắng bộ bài đang soạn
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
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Vui lòng nhập Tên Bộ Bài trước khi lưu!');
      return;
    }
    if (mainCount < 40) {
      showToast('error', `Main Deck cần tối thiểu 40 lá bài (hiện tại mới có ${mainCount} lá)!`);
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
          showToast('success', `Đã lưu bộ bài "${name}" thành công!`);
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

  // Xóa Deck cá nhân
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
    showToast('success', 'Đã xuất file .YDK thành công!');
  };

  const currentList = activeSection === 'main' ? mainDeck : activeSection === 'extra' ? extraDeck : sideDeck;

  return (
    <div className="app-shell">
      <Navbar />

      {/* Thông báo Toast nổi */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '0.8rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="container" style={{ padding: '1.75rem 1.25rem 4rem' }}>
        {/* ============================================================
            BANNER HEADER TRANG DECK BUILDER
            ============================================================ */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.28rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <Sparkles size={13} color="#f59e0b" /> Trình Tạo Bộ Bài Cá Nhân
              </span>

              {deckId && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#2563eb',
                    padding: '0.28rem 0.75rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                    border: '1px solid rgba(59, 130, 246, 0.25)'
                  }}
                >
                  Đang chỉnh sửa Deck
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              {deckId ? `Chỉnh Sửa: ${name || 'Bộ Bài Cá Nhân'}` : 'Yu-Gi-Oh! Deck Builder'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>
              Xây dựng chiến thuật cá nhân theo chuẩn thi đấu Konami: Main Deck (40–60 lá), Extra Deck (≤ 15 lá), Side Deck (≤ 15 lá).
            </p>
          </div>

          {/* CỤM 3 NÚT HÀNH ĐỘNG ĐỒNG BỘ, BO GÓC HIỆN ĐẠI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleNewDeck}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.62rem 1.1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} /> Làm Mới Form
            </button>

            <button
              type="button"
              onClick={handleExportYDK}
              disabled={mainCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.62rem 1.1rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                backgroundColor: mainCount === 0 ? 'var(--bg-primary)' : 'rgba(139, 92, 246, 0.1)',
                color: mainCount === 0 ? 'var(--text-secondary)' : '#7c3aed',
                opacity: mainCount === 0 ? 0.55 : 1,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: mainCount === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Tải về file .ydk dùng cho EDOPro / YGOPRO / Master Duel"
            >
              <Download size={16} /> Xuất .YDK
            </button>

            <button
              type="button"
              onClick={handleSaveDeck}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.62rem 1.3rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                transition: 'all 0.15s ease'
              }}
            >
              <Save size={16} /> {saving ? 'Đang lưu...' : deckId ? 'Cập Nhật Deck' : 'Lưu Bộ Bài'}
            </button>
          </div>
        </div>

        {/* ============================================================
            4 THẺ CHỈ SỐ TIẾN ĐỘ (KPI CARDS KÈM PROGRESS BAR)
            ============================================================ */}
        <div style={{ maxWidth: '1240px', margin: '0 auto 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Main Deck KPI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Main Deck (40–60)</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: mainCount >= 40 && mainCount <= 60 ? '#10b981' : '#3b82f6' }}>
                  {mainCount} / 60 lá
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: mainCount >= 40 ? '#10b981' : '#f59e0b' }}>
                  {mainCount >= 40 ? '✓ Đạt chuẩn' : `(Cần thêm ${40 - mainCount} lá)`}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (mainCount / 40) * 100)}%`,
                    height: '100%',
                    background: mainCount >= 40 ? '#10b981' : '#3b82f6',
                    borderRadius: '999px',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>

            {/* Extra Deck KPI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Extra Deck (0–15)</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a855f7' }}>
                  {extraCount} / 15 lá
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Fusion, Synchro, Xyz, Link</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (extraCount / 15) * 100)}%`,
                    height: '100%',
                    background: '#a855f7',
                    borderRadius: '999px',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>

            {/* Side Deck KPI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Side Deck (0–15)</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(100, 116, 139, 0.12)', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#64748b' }}>
                  {sideCount} / 15 lá
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Bài dự bị chiến thuật</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (sideCount / 15) * 100)}%`,
                    height: '100%',
                    background: '#64748b',
                    borderRadius: '999px',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>

            {/* Tổng giá trị KPI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.15rem', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ước Tính Giá Thị Trường</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  ${totalPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  ({mainCount + extraCount + sideCount} lá bài)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Tính theo giá thấp nhất từ 5 chợ quốc tế
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            BỐ CỤC CHÍNH 2 CỘT: TRÁI (BUILDER) - PHẢI (TÌM THẺ & MY DECKS)
            ============================================================ */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 370px',
            gap: '1.5rem',
            alignItems: 'start'
          }}
        >
          {/* CỘT TRÁI: THÔNG TIN BỘ BÀI + LƯỚI THẺ BÀI */}
          <div>
            {/* KHUNG THÔNG TIN BỘ BÀI (ĐỒNG BỘ INPUT & SELECT) */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.35rem',
                marginBottom: '1.5rem',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}
              >
                {/* Tên Bộ Bài */}
                <div>
                  <label style={FIELD_LABEL_STYLE}>Tên Bộ Bài *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Mitsu Ryzeal, Blue-Eyes..."
                    style={FIELD_INPUT_STYLE}
                  />
                </div>

                {/* Format Thi Đấu */}
                <div>
                  <label style={FIELD_LABEL_STYLE}>Format Thi Đấu</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    style={{ ...FIELD_INPUT_STYLE, cursor: 'pointer' }}
                  >
                    <option value="TCG">TCG (Bắc Mỹ / Châu Âu)</option>
                    <option value="OCG">OCG (Nhật Bản / Châu Á)</option>
                    <option value="Master Duel">Master Duel</option>
                    <option value="GOAT">GOAT Format (2005)</option>
                    <option value="Edison">Edison Format (2010)</option>
                  </select>
                </div>

                {/* Danh Mục (Category) */}
                <div>
                  <label style={FIELD_LABEL_STYLE}>Danh Mục (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ ...FIELD_INPUT_STYLE, cursor: 'pointer' }}
                  >
                    <option value="Community">Community Deck</option>
                    <option value="Tournament Meta">Tournament Meta</option>
                    <option value="Top Archetype">Top Archetype</option>
                    <option value="Budget Deck">Budget Deck (Giá rẻ)</option>
                    <option value="Master Duel">Master Duel</option>
                    <option value="Anime Deck">Anime Deck</option>
                  </select>
                </div>

                {/* Archetype */}
                <div>
                  <label style={FIELD_LABEL_STYLE}>Archetype (Hệ bài)</label>
                  <input
                    type="text"
                    value={archetype}
                    onChange={(e) => setArchetype(e.target.value)}
                    placeholder="VD: Ryzeal, Snake-Eye..."
                    style={FIELD_INPUT_STYLE}
                  />
                </div>
              </div>

              {/* Ghi Chú Chiến Thuật */}
              <div>
                <label style={FIELD_LABEL_STYLE}>Ghi Chú / Mô Tả Chiến Thuật</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú combo mở đầu, điểm mạnh/yếu hoặc cách side deck..."
                  style={{
                    ...FIELD_INPUT_STYLE,
                    height: 'auto',
                    padding: '0.65rem 0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* THANH TAB CHỌN PHẦN DECK: MAIN | EXTRA | SIDE */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  gap: '0.35rem',
                  background: 'var(--bg-card)',
                  padding: '5px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                {[
                  { id: 'main', label: `Main Deck (${mainCount}/60)`, color: '#3b82f6' },
                  { id: 'extra', label: `Extra Deck (${extraCount}/15)`, color: '#a855f7' },
                  { id: 'side', label: `Side Deck (${sideCount}/15)`, color: '#64748b' }
                ].map((tab) => {
                  const isActive = activeSection === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSection(tab.id)}
                      style={{
                        padding: '0.5rem 1.05rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? tab.color : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {currentList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'main') setMainDeck([]);
                    else if (activeSection === 'extra') setExtraDeck([]);
                    else setSideDeck([]);
                  }}
                  style={{
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Trash2 size={14} /> Xóa hết phần {activeSection.toUpperCase()}
                </button>
              )}
            </div>

            {/* KHUNG LƯỚI THẺ BÀI TRONG SECTION ĐANG CHỌN */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.35rem',
                minHeight: '420px',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              {currentList.length === 0 ? (
                <div
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '14px',
                    padding: '4.5rem 1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-primary)'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}
                  >
                    <Layers size={28} />
                  </div>
                  <div style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Chưa có lá bài nào trong {activeSection.toUpperCase()} Deck
                  </div>
                  <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                    Hãy bấm nút <strong>&quot;+ Thêm&quot;</strong> ở danh sách thẻ bài cột bên phải để đưa lá bài vào bộ bài của bạn.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
                    gap: '0.85rem'
                  }}
                >
                  {currentList.map((card) => (
                    <div
                      key={card.card_id}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      {/* Ảnh thẻ bài + Badge số lượng */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '421/614',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          marginBottom: '0.45rem',
                          backgroundColor: '#0f172a'
                        }}
                      >
                        <img
                          src={card.image_url_small || `/images/cards/${card.card_id}_small.jpg`}
                          alt={card.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg';
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.45)'
                          }}
                        >
                          x{card.quantity || 1}
                        </span>
                      </div>

                      {/* Tên thẻ & Giá */}
                      <Link
                        to={`/card/${card.card_id}`}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '0.15rem',
                          color: 'var(--text-primary)'
                        }}
                        title={card.name}
                      >
                        {card.name}
                      </Link>
                      <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '0.45rem' }}>
                        ${Number(card.price || 0).toFixed(2)}
                      </div>

                      {/* Thanh điều khiển số lượng (- / + / Xóa) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: '0.35rem',
                          borderTop: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(activeSection, card.card_id, -1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Giảm 1 lá"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(activeSection, card.card_id, 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Thêm 1 bản sao (Tối đa 3)"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCard(activeSection, card.card_id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Xóa thẻ khỏi Deck"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              CỘT PHẢI: TÌM & THÊM THẺ BÀI + DANH SÁCH DECK CỦA TÔI
              ============================================================ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '80px' }}>
            {/* KHUNG TÌM & THÊM THẺ BÀI */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.98rem' }}>
                  <Search size={18} color="#3b82f6" />
                  <span>Tìm &amp; Thêm Thẻ Bài</span>
                </div>

                {archetype.trim() && (
                  <button
                    type="button"
                    onClick={handleAutoFillArchetype}
                    style={{
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      borderRadius: '6px',
                      padding: '0.22rem 0.55rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Wand2 size={12} /> Lọc {archetype.trim()}
                  </button>
                )}
              </div>

              {/* Ô nhập từ khóa tìm kiếm */}
              <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Gõ tên lá bài (VD: Ash Blossom, Snake-Eye...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...FIELD_INPUT_STYLE,
                    paddingLeft: '2.3rem',
                    paddingRight: searchQuery ? '2rem' : '0.85rem'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Chip lọc nhanh Monster / Spell / Trap */}
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'Effect Monster', label: 'Monster' },
                  { id: 'Spell Card', label: 'Spell' },
                  { id: 'Trap Card', label: 'Trap' }
                ].map((flt) => {
                  const active = cardTypeFilter === flt.id;
                  return (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => setCardTypeFilter(flt.id)}
                      style={{
                        padding: '0.28rem 0.65rem',
                        borderRadius: '999px',
                        border: active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        background: active ? 'rgba(59, 130, 246, 0.14)' : 'var(--bg-primary)',
                        color: active ? '#2563eb' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {flt.label}
                    </button>
                  );
                })}
              </div>

              {/* Danh sách kết quả thẻ bài */}
              <div
                style={{
                  maxHeight: '390px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingRight: '2px'
                }}
              >
                {searching ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Đang tìm kiếm lá bài...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Không tìm thấy lá bài nào phù hợp.
                  </div>
                ) : (
                  searchResults.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '10px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                        <img
                          src={c.card_images?.[0]?.image_url_small || `/images/cards/${c.id}_small.jpg`}
                          alt={c.name}
                          style={{
                            width: '32px',
                            height: '46px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.ygoprodeck.com/images/cards_small/back.jpg';
                          }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={c.name}
                          >
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <strong style={{ color: '#10b981' }}>${Number(c.min_price || 0).toFixed(2)}</strong> • {c.type}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleAddCard(c)}
                          style={{
                            padding: '0.38rem 0.7rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#3b82f6',
                            color: '#fff',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Thêm vào phần Deck đang chọn"
                        >
                          + Thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCard(c, 'side')}
                          style={{
                            padding: '0.38rem 0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Thêm vào Side Deck"
                        >
                          +Side
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* KHUNG DANH SÁCH DECK CỦA TÔI */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.98rem' }}>
                  <Layers size={18} color="#10b981" />
                  <span>Deck Của Tôi ({myDecks.length})</span>
                </div>
              </div>

              {loadingMyDecks ? (
                <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Đang tải danh sách bộ bài...
                </div>
              ) : myDecks.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1.5rem 1rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)'
                  }}
                >
                  Bạn chưa lưu bộ bài nào. Hãy thêm đủ 40 lá Main Deck và bấm <strong>&quot;Lưu Bộ Bài&quot;</strong> nhé!
                </div>
              ) : (
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {myDecks.map((d) => {
                    const isCurrent = deckId === d._id;
                    return (
                      <div
                        key={d._id}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: '10px',
                          background: isCurrent ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                          border: isCurrent ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div
                          onClick={() => navigate(`/deck-builder?id=${d._id}`)}
                          style={{ cursor: 'pointer', overflow: 'hidden', flex: 1 }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: isCurrent ? '#2563eb' : 'var(--text-primary)'
                            }}
                          >
                            {d.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#3b82f6' }}>{d.format}</span> •{' '}
                            {d.stats?.main_count || 0}M / {d.stats?.extra_count || 0}E •{' '}
                            <strong style={{ color: '#10b981' }}>${Number(d.stats?.total_price || 0).toFixed(2)}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/deck-builder?id=${d._id}`)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-card)',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Sửa bộ bài này"
                          >
                            <Edit3 size={14} />
                          </button>

                          <Link
                            to={`/deck/${d._id}`}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Xem trang chi tiết Deck"
                          >
                            <Eye size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteDeck(d._id, d.name)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Xóa bộ bài"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
