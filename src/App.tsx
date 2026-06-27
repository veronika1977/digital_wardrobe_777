import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http') || url.startsWith('data:image')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
interface WardrobeItem {
  id: number;
  name: string;
  category: string;
  season: string;
  color: string;
  material: string;
  img: string;
  image_url?: string | null;
  createdAt?: string;
  deletedAt: string | null;
}
interface PositionedItem extends WardrobeItem {
  x: number;
  y: number;
  scale: number;
}

interface Outfit {
  id: number;
  name: string;
  items: PositionedItem[];
  createdAt: string;
  deletedAt: string | null;
}

const getTheme = () => {
  return {
    bg: '#E6E5E3',
    card: '#FFFFFF',
    primary: '#373635',
    primaryText: '#FFFFFF',
    secondary: '#D4D3D1',
    text: '#373635',
    textSecondary: '#6B6A69',
    accent: '#8B8A89',
    destructive: '#E57373',
    success: '#4CAF50',
    gradient: 'linear-gradient(135deg, #373635 0%, #5A5958 100%)',
  };
};

const СЕЗОНЫ = [
  { id: 'winter', name: 'Зима', color: '#6BB5E0' },
  { id: 'spring', name: 'Весна', color: '#E8A87C' },
  { id: 'summer', name: 'Лето', color: '#F3D572' },
  { id: 'autumn', name: 'Осень', color: '#D4956A' },
  { id: 'base', name: 'База', color: '#A8C8A0' },
];

const ЦВЕТА = [
  { id: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: 'black', name: 'Черный', hex: '#000000' },
  { id: 'beige', name: 'Бежевый', hex: '#D4C5B9' },
  { id: 'brown', name: 'Коричневый', hex: '#5f4f3d' },
  { id: 'navy', name: 'Темно-синий', hex: '#2C3E50' },
  { id: 'grey', name: 'Серый', hex: '#969d9d' },
  { id: 'red', name: 'Красный', hex: '#e11d1d' },
  { id: 'blue', name: 'Синий', hex: '#2d28c6' },
  { id: 'green', name: 'Зеленый', hex: '#46904a' },
  { id: 'pink', name: 'Розовый', hex: '#ef6bb4' },
  { id: 'purple', name: 'Фиолетовый', hex: '#7e11b4' },
  { id: 'orange', name: 'Оранжевый', hex: '#f37f12' },
  { id: 'yellow', name: 'Желтый', hex: '#F1C40F' },
];

const МАТЕРИАЛЫ = [
  { id: "cotton", name: "Хлопок" },
  { id: "synthetic", name: "Синтетика" },
  { id: "mixed", name: "Смешанная" },
  { id: "viscose", name: "Вискоза" },
  { id: "linen", name: "Лен" },
  { id: "wool", name: "Шерсть" },
  { id: "silk", name: "Шелк" },
];

const КАТЕГОРИИ = [
  { id: "all", name: "Все" },
  { id: "outerwear", name: "Верхняя одежда" },
  { id: "top", name: "Верх" },
  { id: "bottom", name: "Низ" },
  { id: "shoes", name: "Обувь" },
  { id: "accessory", name: "Аксессуары" },
];

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia ? window.matchMedia(query) : null;
    if (!media) return;
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [isTelegram, setIsTelegram] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webapp = (window as any).Telegram?.WebApp;
      if (webapp && webapp.initData) {
        webapp.ready();
        webapp.expand();
        webapp.enableClosingConfirmation();
        setTg(webapp);
        setInitData(webapp.initData);
        setIsTelegram(true);
      } else {
        setIsTelegram(false);
      }
    }
  }, []);

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  return { tg, initData, isTelegram, haptic };
};

const PhotoPicker = ({ onImageSelected }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={drawerStyles.photoPickerZone}
      >
        <div style={drawerStyles.pickerCircle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151414" strokeWidth="1.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span style={{ fontSize: '15px', color: '#151414', fontWeight: '600' }}>Выбрать фото</span>
        <span style={{ fontSize: '12px', color: '#6B6A69' }}>Нажмите, чтобы выбрать файл</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (!file.type.startsWith('image/')) {
              alert('Ошибка: Выбранный файл не является изображением! Пожалуйста, загрузите фото (JPEG, PNG, WebP).');
              e.target.value = '';
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              onImageSelected(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </>
  );
};

const BottomNavBar = ({ currentScreen, onScreenChange }: { currentScreen: string; onScreenChange: (screen: any) => void }) => {
  const tabs = [
    { id: 'home', label: 'ГС' },
    { id: 'profile', label: 'ЛК' },
  ];

  return (
    <div style={navStyles.navBarContainer}>
      <div style={navStyles.navBar}>
        {tabs.map(tab => {
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onScreenChange(tab.id);
                if (typeof window !== 'undefined') {
                  const searchInput = document.querySelector('input[type="text"]');
                  if (searchInput) (searchInput as HTMLInputElement).value = '';
                }
              }}
              style={navStyles.navButton}
            >
              {tab.id === 'home' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              )}
              {tab.id === 'profile' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              {isActive && <div style={navStyles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function App() {
  const { initData, isTelegram, haptic } = useTelegram();
  const [token, setToken] = useLocalStorage<string | null>('jwt_token', null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'profile' | 'cart'>('home');
  const [trashClothes, setTrashClothes] = useState<any[]>([]);
  const [trashOutfits, setTrashOutfits] = useState<any[]>([]);
  const [trashCapsules, setTrashCapsules] = useState<any[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState<any | null>(null);
  const [selectedOutfitForView, setSelectedOutfitForView] = useState<any | null>(null);
  const [selectedCapsuleForView, setSelectedCapsuleForView] = useState<any | null>(null);
  const [isViewOnlyOutfit, setIsViewOnlyOutfit] = useState<boolean>(false);
  
  const [newName, setNewName] = useState('');
  const [restoreConfirm, setRestoreConfirm] = useState<{ id: number; type: 'clothes' | 'outfits' | 'capsules' } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newSeason, setNewSeason] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  
  const [showEmptyOutfitAlert, setShowEmptyOutfitAlert] = useState(false);
  const [showEmptyCapsuleAlert, setShowEmptyCapsuleAlert] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerError, setDrawerError] = useState<string | null>(null);
  
  const [clothes, setClothes] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [capsules, setCapsules] = useState<any[]>([]);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<PositionedItem[]>([]);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState('all');
  
  const [isOutfitCreatorOpen, setIsOutfitCreatorOpen] = useState(false);
  const [isCapsuleCreatorOpen, setIsCapsuleCreatorOpen] = useState(false);
  const [editingCapsuleId, setEditingCapsuleId] = useState<number | null>(null);
  const [capsuleName, setCapsuleName] = useState('');
  const [capsuleItems, setCapsuleItems] = useState<any[]>([]);
  const [capsulePickerCategory, setCapsulePickerCategory] = useState('all');
  const [capsuleStep, setCapsuleStep] = useState<'items' | 'outfits'>('items');
  const [capsuleOutfits, setCapsuleOutfits] = useState<any[]>([]);
  
  const [isCapsuleOutfitCreatorOpen, setIsCapsuleOutfitCreatorOpen] = useState(false);
  const [capsuleOutfitName, setCapsuleOutfitName] = useState('');
  const [capsuleCanvasItems, setCapsuleCanvasItems] = useState<any[]>([]);
  const [capsuleActiveDragId, setCapsuleActiveDragId] = useState<number | null>(null);
  const [capsuleDragOffset, setCapsuleDragOffset] = useState({ x: 0, y: 0 });
  const [isCapsuleOutfitItemPickerOpen, setIsCapsuleOutfitItemPickerOpen] = useState(false);
  
  const [outfitName, setOutfitName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: 'clothes' | 'outfits' | 'capsules' } | null>(null);

  const openDeleteModal = (id: number, type: 'clothes' | 'outfits' | 'capsules') => {
    setDeleteConfirm({ id, type });
  };

  const fetchCart = async () => {
    if (!token) return;
    setIsCartLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      let mappedTrashClothes: any[] = [];
      const clothesRes = await fetch(`${API_BASE_URL}/clothes/trash`, { headers });
      if (clothesRes.ok) {
        const data = await clothesRes.json();
        mappedTrashClothes = data.map((i: any) => ({ ...i, img: getFullImageUrl(i.image_url) }));
        setTrashClothes(mappedTrashClothes);
      }

      const outfitsRes = await fetch(`${API_BASE_URL}/outfits/trash`, { headers });
      if (outfitsRes.ok) {
        const data = await outfitsRes.json();
        setTrashOutfits(data.map((o: any) => ({
          ...o,
          items: (o.items || []).map((item: any) => {
            const cId = item.clothing_id || item.id;
            const cloth = [...mappedTrashClothes, ...clothes].find(c => c.id === cId);
            return { ...item, id: cId, img: getFullImageUrl(item.image_url || cloth?.img || item.img) };
          })
        })));
      }

      const capsulesRes = await fetch(`${API_BASE_URL}/capsules/trash`, { headers });
      if (capsulesRes.ok) {
        const data = await capsulesRes.json();
        setTrashCapsules(data.map((c: any) => ({
          ...c,
          items: (c.items || []).map((item: any) => {
            const cId = item.clothing_id || item.id;
            const cloth = [...mappedTrashClothes, ...clothes].find(c => c.id === cId);
            return { ...item, id: cId, img: getFullImageUrl(item.image_url || cloth?.img || item.img) };
          }),
          outfits: (c.outfits || []).map((o: any) => ({
            ...o,
            items: (o.items || []).map((item: any) => {
              const cId = item.clothing_id || item.id;
              const cloth = [...mappedTrashClothes, ...clothes].find(c => c.id === cId);
              return { ...item, id: cId, img: getFullImageUrl(item.image_url || cloth?.img || item.img) };
            })
          }))
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const uploadImageAndGetUrl = async (base64Image: string) => {
    const response = await fetch(base64Image);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg'); 
    
    const uploadRes = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error('Ошибка загрузки фото');
    const data = await uploadRes.json();
    return data.image_url || data.url; 
  };

  const requestRestore = (id: number, type: 'clothes' | 'outfits' | 'capsules') => {
    haptic('light');
    setRestoreConfirm({ id, type });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    haptic('heavy');
    const endpoints: any = { clothes: 'clothes', outfits: 'outfits', capsules: 'capsules' };
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoints[type]}/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) throw new Error('Ошибка удаления');
      const now = new Date().toISOString();
      
      if (type === 'clothes') {
        setClothes(prev => prev.map(item => item.id === id ? { ...item, deletedAt: now } : item));
        setOutfits(prev => prev.map(outfit => {
          if (outfit.deletedAt) return outfit;
          const remainingItems = (outfit.items || []).filter((i: any) => i.id !== id);
          return remainingItems.length === 0
            ? { ...outfit, deletedAt: now, items: [] }
            : { ...outfit, items: remainingItems };
        }));
        setCapsules(prev => prev.map(capsule => {
          if (capsule.deletedAt) return capsule;
          const remainingItems = (capsule.items || []).filter((i: any) => i.id !== id);
          const remainingOutfits = (capsule.outfits || []).map((o: any) => ({
            ...o,
            items: (o.items || []).filter((i: any) => i.id !== id)
          })).filter((o: any) => o.items.length > 0); 
          return remainingItems.length === 0
            ? { ...capsule, deletedAt: now, items: [], outfits: [] }
            : { ...capsule, items: remainingItems, outfits: remainingOutfits };
        }));
      } else if (type === 'outfits') {
        setOutfits(prev => prev.map(item => item.id === id ? { ...item, deletedAt: now } : item));
      } else if (type === 'capsules') {
        setCapsules(prev => prev.map(item => item.id === id ? { ...item, deletedAt: now } : item));
        if (editingCapsuleId === id) setIsCapsuleCreatorOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert('Не удалось удалить');
    }
    if (currentScreen === 'cart') {
      fetchCart();
    }
    setDeleteConfirm(null);
  };

  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isToday: false });
    }
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      days.push({ day, isToday });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    haptic('light');
    setActiveDragId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const item = canvasItems.find(i => i.id === id);
    if (item) {
      setDragOffset({
        x: clientX - item.x,
        y: clientY - item.y
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeDragId === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCanvasItems(prev => prev.map(item => {
      if (item.id === activeDragId) {
        return {
          ...item,
          x: clientX - dragOffset.x,
          y: clientY - dragOffset.y
        };
      }
      return item;
    }));
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
  };

  const handleCapsuleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    haptic('light');
    setCapsuleActiveDragId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const item = capsuleCanvasItems.find(i => i.id === id);
    if (item) {
      setCapsuleDragOffset({ x: clientX - item.x, y: clientY - item.y });
    }
  };

  const handleCapsuleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (capsuleActiveDragId === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCapsuleCanvasItems(prev => prev.map(item => {
      if (item.id === capsuleActiveDragId) {
        return { ...item, x: clientX - capsuleDragOffset.x, y: clientY - capsuleDragOffset.y };
      }
      return item;
    }));
  };

  const resetDrawerState = () => {
    setIsDrawerOpen(false);
    setNewName('');
    setNewImage(null);
    setNewCategory('');
    setNewSeason('');
    setNewColor('');
    setNewMaterial('');
    setDrawerError(null);
    setEditingItemId(null);
  };

  useEffect(() => {
  if (currentScreen === 'cart' && token) {
    fetchCart();
  }
}, [currentScreen, token]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      
      @keyframes spin {
      0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      body, button, input, select, textarea, span, div {
        font-family: 'Inter', sans-serif !important;
      }
      .fancy-serif {
        font-family: 'Playfair Display', serif !important;
        font-style: normal !important;
        font-weight: 400 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase;
      }
      h1.fancy-serif {
        letter-spacing: 1.5px !important;
      }
      [style*="dayNumber"], [style*="calendarDaysHeader"] span {
        font-family: 'Inter', sans-serif !important;
        font-style: normal !important;
        letter-spacing: normal !important;
        font-weight: 500 !important;
      }
    `;
    document.body.style.backgroundColor = '#edecea';
    document.body.style.color = '#151414';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.touchAction = 'none';
    if (document.documentElement) {
      document.documentElement.style.backgroundColor = '#edecea';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    }
    document.head.appendChild(styleTag); 
    return () => {
      if (document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, []);

    useEffect(() => {
    if (!token) return;
    
    const fetchAllData = async () => {
      let mappedClothes: WardrobeItem[] = [];
      
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${API_BASE_URL}/clothes/`, { headers });
        if (response.ok) {
          const data = await response.json();
          mappedClothes = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            color: item.color,
            season: item.season,
            material: item.material,
            img: getFullImageUrl(item.image_url),
            deletedAt: item.deleted_at ? new Date(item.deleted_at).toISOString() : null
          }));
          setClothes(mappedClothes);
        }
      } catch (error) {
        console.error('Ошибка при получении вещей:', error);
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const outfitsRes = await fetch(`${API_BASE_URL}/outfits/`, { headers });
        if (outfitsRes.ok) {
          const data = await outfitsRes.json();
          const mapped = data.map((o: any) => ({
            ...o,
            createdAt: o.created_at || o.createdAt,
            deletedAt: o.deleted_at || o.deletedAt,
            items: (o.items || []).map((item: any) => {
              const cId = item.clothing_id || item.id;
              const cloth = mappedClothes.find(c => c.id === cId);
              return {
                ...item,
                id: cId,
                img: getFullImageUrl(item.image_url || cloth?.img || item.img) // <-- Фоллбэк на массив вещей
              };
            })
          }));
          setOutfits(mapped);
        }

        const capsulesRes = await fetch(`${API_BASE_URL}/capsules/`, { headers });
        if (capsulesRes.ok) {
          const data = await capsulesRes.json();
          const mapped = data.map((c: any) => ({
            ...c,
            createdAt: c.created_at || c.createdAt,
            deletedAt: c.deleted_at || c.deletedAt,
            items: (c.items || []).map((item: any) => {
              const cId = item.clothing_id || item.id;
              const cloth = mappedClothes.find(c => c.id === cId);
              return {
                ...item,
                id: cId,
                img: getFullImageUrl(item.image_url || cloth?.img || item.img)
              };
            }),
            outfits: (c.outfits || []).map((o: any) => ({
              ...o,
              items: (o.items || []).map((item: any) => {
                const cId = item.clothing_id || item.id;
                const cloth = mappedClothes.find(c => c.id === cId);
                return {
                  ...item,
                  id: cId,
                  img: getFullImageUrl(item.image_url || cloth?.img || item.img)
                };
              })
            }))
          }));
          setCapsules(mapped);
        }
      } catch (error) {
        console.error('Ошибка загрузки образов/капсул:', error);
      }
    };

    fetchAllData();
  }, [token]);

  useEffect(() => {
    if (initData) {
      setIsAuthLoading(true);
      fetch(`${API_BASE_URL}/auth/telegram-webapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ init_data: initData }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка авторизации на бэкенде');
          return res.json();
        })
        .then((data) => {
          const receivedToken = data.token || data.access_token;
          if (receivedToken) {
            setToken(receivedToken);
            console.log('Успешная авторизация, токен получен!');
          } else {
            console.warn('Бэк ответил успешно, но поля token или access_token в ответе нет:', data);
          }
          setIsAuthLoading(false);
        })
        .catch((err) => {
          console.error('Auth error:', err);
          setIsAuthLoading(false);
        });
    }
  }, [initData, isTelegram, setToken]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#edecea', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      {!isAuthLoading && (
        <>
          {currentScreen === 'home' && (
            <div style={{
              width: '100%',
              height: '80vh',
              maxHeight: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '16px 16px 80px 16px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div style={headerStyles.headerContainer}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/Icon.png"
                    alt="VS Logo"
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                </div>
                <h1 style={headerStyles.headerTitle} className="fancy-serif">ГЛАВНАЯ</h1>
              </div>
              <div style={outfitStyles.sectionContainer}>
                <h2 style={outfitStyles.sectionTitle} className="fancy-serif">Образ сегодня</h2>
                <div style={outfitStyles.mainRow}>
                  <div style={outfitStyles.outfitCard}>
                    {outfits.length > 0 ? (
                      (() => {
                        const latestOutfit = outfits[outfits.length - 1];
                        return (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <span style={outfitStyles.outfitName}>{latestOutfit.name}</span>
                            <div style={outfitStyles.itemsGrid}>
                              {latestOutfit.items.slice(0, 4).map((item: any, idx: number) => (
                              <img
                                key={`${item.id}-${idx}`}
                                src={item.img}
                                alt=""
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            ))}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <span style={outfitStyles.outfitName}>Название</span>
                        <div style={outfitStyles.emptyGrid}>
                          <span style={{ fontSize: '11px', color: '#8B8A89', textAlign: 'center', padding: '0 4px' }}>
                            Нет образов
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={widgetStyles.weatherCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={widgetStyles.weatherCity}>Санкт-Петербург</div>
                        <div style={widgetStyles.weatherTemp}>+17°</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '500' }}>Ясно</span>
                    </div>
                    <div style={widgetStyles.hourlyRow}>
                      <div style={widgetStyles.hourItem}><div>4:00</div><div style={{ fontWeight: '600' }}>+18°</div></div>
                      <div style={widgetStyles.hourItem}><div>5:00</div><div style={{ fontWeight: '600' }}>+19°</div></div>
                      <div style={widgetStyles.hourItem}><div>6:00</div><div style={{ fontWeight: '600' }}>+20°</div></div>
                      <div style={widgetStyles.hourItem}><div>7:00</div><div style={{ fontWeight: '600' }}>+20°</div></div>
                    </div>
                  </div>
                  <div style={widgetStyles.calendarCard}>
                    <div style={widgetStyles.calendarDaysHeader}>
                      <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                    </div>
                    <div style={widgetStyles.calendarGrid}>
                      {calendarDays.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            ...widgetStyles.dayCell,
                            backgroundColor: item.isToday ? '#151414' : 'transparent',
                            borderRadius: item.isToday ? '50%' : '0',
                          }}
                        >
                          <span
                            style={{
                              ...widgetStyles.dayNumber,
                              color: item.isToday ? '#FFFFFF' : item.day ? '#151414' : 'transparent'
                            }}
                          >
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={homeStyles.buttonContainer}>
                <button
                  style={{ ...homeStyles.addBtn, fontFamily: 'Inter, sans-serif' }}
                  onClick={() => {
                    setEditingItemId(null);
                    setIsDrawerOpen(true);
                    haptic('light');
                  }}
                >
                  <div style={homeStyles.plusCircle}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#151414" strokeWidth="0.8" strokeLinecap="round">
                      <line x1="12" y1="4" x2="12" y2="20"></line>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                    </svg>
                  </div>
                  <span
                    className="fancy-serif"
                    style={{
                      ...homeStyles.btnText,
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: '430',
                      letterSpacing: '1.5px'
                    }}
                  >
                    ДОБАВИТЬ ВЕЩЬ
                  </span>
                </button>
              </div>
            </div>
          )}

          {currentScreen === 'profile' && (
            <div style={pageStyle}>
              <div style={headerStyles.headerContainer}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/Icon.png"
                    alt="VS Logo"
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                </div>
                <h1 style={{ ...headerStyles.headerTitle, marginLeft: '40px' }} className="fancy-serif">ГАРДЕРОБ</h1>
                <button
                  onClick={() => {
                    setCurrentScreen('cart');
                    haptic('light');
                  }}
                  style={headerStyles.searchBtn}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
              <ProfileGallery
                clothes={clothes}
                setClothes={setClothes}
                outfits={outfits}
                setOutfits={setOutfits}
                capsules={capsules}
                setCapsules={setCapsules}
                searchQuery={searchQuery}
                setIsSearchOpen={setIsSearchOpen}
                haptic={haptic}
                setIsOutfitCreatorOpen={setIsOutfitCreatorOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                setIsCapsuleCreatorOpen={setIsCapsuleCreatorOpen}
                onItemClick={(item: any) => {
                  setSelectedItemForView(item);
                  haptic('light');
                }}
                onOutfitClick={(outfit: any) => {
                  setSelectedOutfitForView(outfit);
                  haptic('light');
                }}
                onCapsuleClick={(capsule: any) => {
                  setSelectedCapsuleForView(capsule);
                  haptic('light');
                }}
                setEditingOutfitId={setEditingOutfitId}
                setCanvasItems={setCanvasItems}
                setOutfitName={setOutfitName}
                openDeleteModal={openDeleteModal}
              />
            </div>
          )}

          {currentScreen === 'cart' && (
          <div style={pageStyle}>
            <div style={headerStyles.headerContainer}>
              <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/Icon.png" alt="VS Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              </div>
              <h1 style={{ ...headerStyles.headerTitle, marginLeft: '40px' }} className="fancy-serif">КОРЗИНА</h1>
              <button
                onClick={() => { setCurrentScreen('profile'); haptic('light'); }}
                style={{ ...headerStyles.searchBtn, backgroundColor: '#151414' }}
                title="Назад в гардероб"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            </div>
            <div style={cartPageStyles.infoBanner}>
              Вещи хранятся в корзине 14 дней, после чего удаляются автоматически.
            </div>

            {isCartLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={drawerStyles.spinner} />
              </div>
            ) : trashClothes.length === 0 && trashOutfits.length === 0 && trashCapsules.length === 0 ? (
              <div style={cartPageStyles.container}>
                <span style={cartPageStyles.emptyText}>Корзина пуста</span>
                <p style={cartPageStyles.emptySubtext}>Здесь будут отображаться удаленные вами вещи и образы.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {trashClothes.length > 0 && (
                  <div>
                    <span style={outfitStyles.sectionTitle} className="fancy-serif">Удаленная одежда</span>
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: trashClothes.length === 1 ? '190px' : 'repeat(2, 190px)',
                      gridAutoFlow: 'column',
                      gridAutoColumns: 'calc(33.33% - 7px)',
                      gap: '10px',
                      overflowX: 'auto',
                      marginTop: '8px',
                      paddingBottom: '6px',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none'
                    }}>
                      {trashClothes.map((item: any) => (
                        <div key={item.id} style={{ ...galleryStyles.card, position: 'relative' }}>
                          <button onClick={() => requestRestore(item.id, 'clothes')} style={cartPageStyles.restoreBtn}>↩</button>
                          <div style={galleryStyles.imageWrapper}>
                            <img src={item.img} alt={item.name} style={galleryStyles.cardImage} />
                            {item.days_remaining !== undefined && item.days_remaining !== null && (
                              <div style={{
                                ...cartPageStyles.daysLeftBadge,
                                color: item.days_remaining <= 3 ? '#E57373' : '#FFFFFF'
                              }}>
                                {item.days_remaining > 0 ? `${item.days_remaining} дн.` : 'Сегодня'}
                              </div>
                            )}
                          </div>
                          <span style={galleryStyles.cardTitle}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trashOutfits.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={outfitStyles.sectionTitle} className="fancy-serif">Удаленные образы</span>
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: trashOutfits.length === 1 ? '190px' : 'repeat(2, 190px)',
                      gridAutoFlow: 'column',
                      gridAutoColumns: 'calc(33.33% - 7px)',
                      gap: '10px',
                      overflowX: 'auto',
                      marginTop: '8px',
                      paddingBottom: '6px',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none'
                    }}>
                      {trashOutfits.map((outfit: any) => (
                        <div key={outfit.id} style={{ ...galleryStyles.card, position: 'relative' }}>
                          <button onClick={() => requestRestore(outfit.id, 'outfits')} style={cartPageStyles.restoreBtn}>↩</button>
                          <div style={{ ...galleryStyles.imageWrapper, position: 'relative' }}>
                            {(outfit.items || []).map((item: any, idx: number) => {
                              const factor = 0.333;
                              return (
                                <img
                                  key={`${item.id}-${idx}`}
                                  src={item.img}
                                  alt=""
                                  style={{
                                    position: 'absolute',
                                    left: `${item.x * factor}px`,
                                    top: `${item.y * factor}px`,
                                    width: `${110 * factor * (item.scale || 1)}px`,
                                    height: `${110 * factor * (item.scale || 1)}px`,
                                    objectFit: 'contain'
                                  }}
                                />
                              );
                            })}
                            {outfit.days_remaining !== undefined && outfit.days_remaining !== null && (
                              <div style={{
                                ...cartPageStyles.daysLeftBadge,
                                color: outfit.days_remaining <= 3 ? '#E57373' : '#FFFFFF'
                              }}>
                                {outfit.days_remaining > 0 ? `${outfit.days_remaining} дн.` : 'Сегодня'}
                              </div>
                            )}
                          </div>
                          <span style={galleryStyles.cardTitle}>{outfit.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trashCapsules.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={outfitStyles.sectionTitle} className="fancy-serif">Удаленные капсулы</span>
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: trashCapsules.length === 1 ? '190px' : 'repeat(2, 190px)',
                      gridAutoFlow: 'column',
                      gridAutoColumns: 'calc(33.33% - 7px)',
                      gap: '10px',
                      overflowX: 'auto',
                      marginTop: '8px',
                      paddingBottom: '6px',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none'
                    }}>
                      {trashCapsules.map((capsule: any) => {
                        const itemsCount = capsule.items?.length || 0;
                        const columns = itemsCount > 9 ? 4 : itemsCount > 4 ? 3 : 2;
                        return (
                          <div key={capsule.id} style={{ ...galleryStyles.card, position: 'relative' }}>
                            <button onClick={() => requestRestore(capsule.id, 'capsules')} style={cartPageStyles.restoreBtn}>↩</button>
                            <div style={{
                              ...galleryStyles.imageWrapper,
                              display: 'grid',
                              gridTemplateColumns: `repeat(${columns}, 1fr)`,
                              gap: '4px',
                              padding: '4px',
                              boxSizing: 'border-box',
                              alignContent: 'center',
                              position: 'relative'
                            }}>
                              {capsule.items && capsule.items.map((item: any, idx: number) => (
                                <img
                                  key={item.id || idx}
                                  src={item.img}
                                  style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    backgroundColor: '#edecea'
                                  }}
                                  alt=""
                                />
                              ))}

                              {capsule.days_remaining !== undefined && capsule.days_remaining !== null && (
                                <div style={{
                                  ...cartPageStyles.daysLeftBadge,
                                  color: capsule.days_remaining <= 3 ? '#E57373' : '#FFFFFF'
                                }}>
                                  {capsule.days_remaining > 0 ? `${capsule.days_remaining} дн.` : 'Сегодня'}
                                </div>
                              )}
                            </div>
                            <span style={galleryStyles.cardTitle}>{capsule.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {restoreConfirm && (
                  <>
                    <div onClick={() => setRestoreConfirm(null)} style={galleryStyles.confirmBackdrop} />
                    <div style={galleryStyles.confirmBox}>
                      <span style={galleryStyles.confirmText}>Восстановить из корзины?</span>
                      <div style={galleryStyles.confirmActions}>
                        <button
                          onClick={async () => {
                            if (!restoreConfirm) return;
                            const { id, type } = restoreConfirm;
                            try {
                              const response = await fetch(`${API_BASE_URL}/${type}/${id}/restore`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (!response.ok) throw new Error('Не удалось восстановить');
                              fetchCart();
                              alert('Восстановлено!');
                            } catch (e) {
                              alert('Ошибка восстановления');
                            }
                            setRestoreConfirm(null);
                          }}
                          style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#4CAF50' }}
                        >
                          Да
                        </button>
                        <button onClick={() => setRestoreConfirm(null)} style={galleryStyles.confirmCancelBtn}>Отмена</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isSearchOpen && (
            <>
              <div
                onClick={() => setIsSearchOpen(false)}
                style={searchModalStyles.backdrop}
              />
              <div style={searchModalStyles.box}>
                <div style={searchModalStyles.header}>
                  <span className="fancy-serif" style={searchModalStyles.title}>Поиск одежды</span>
                  <button onClick={() => setIsSearchOpen(false)} style={searchModalStyles.closeBtn}>✕</button>
                </div>
                <div style={searchModalStyles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Введите название вещи..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={searchModalStyles.input}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={searchModalStyles.clearBtn}>Очистить</button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setCurrentScreen('profile');
                    haptic('medium');
                  }}
                  style={searchModalStyles.applyBtn}
                >
                  Применить
                </button>
              </div>
            </>
          )}

          {isOutfitCreatorOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#edecea',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onMouseMove={handleDragMove}
              onTouchMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(21, 20, 20, 0.05)'
              }}>
                <button
                  onClick={() => {
                    setIsOutfitCreatorOpen(false);
                    setCanvasItems([]);
                    setOutfitName('');
                    setEditingOutfitId(null);
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '500', color: '#6B6A69' }}
                >
                  Отмена
                </button>
                <input
                  placeholder="Название образа"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #151414',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    outline: 'none',
                    width: '50%'
                  }}
                />
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (canvasItems.length === 0) {
                      setShowEmptyOutfitAlert(true);
                      haptic('heavy');
                      return;
                    }
                    const payload = {
                      name: outfitName || "Мой образ",
                      items: canvasItems.map(item => ({
                        clothing_id: item.id,
                        x: item.x,
                        y: item.y,
                        scale: item.scale
                      }))
                    };
                    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                    try {
                      let response;
                      if (editingOutfitId) {
                        response = await fetch(`${API_BASE_URL}/outfits/${editingOutfitId}`, {
                          method: 'PATCH', headers, body: JSON.stringify(payload)
                        });
                      } else {
                        response = await fetch(`${API_BASE_URL}/outfits/`, {
                          method: 'POST', headers, body: JSON.stringify(payload)
                        });
                      }
                      if (!response.ok) throw new Error('Ошибка сохранения образа');
                                            const savedOutfit = await response.json();
                      
                      const mappedOutfit = {
                        ...savedOutfit,
                        createdAt: savedOutfit.created_at,
                        deletedAt: savedOutfit.deleted_at,
                        items: (savedOutfit.items || canvasItems).map((item: any) => {
                          const localItem = canvasItems.find(ci => ci.id === (item.clothing_id || item.id));
                          return {
                            ...item,
                            id: item.clothing_id || item.id,
                            img: localItem?.img || getFullImageUrl(item.image_url || item.img)
                          };
                        })
                      };

                      if (editingOutfitId) {
                        setOutfits(outfits.map(o => o.id === editingOutfitId ? mappedOutfit : o));
                      } else {
                        setOutfits([mappedOutfit, ...outfits]);
                      }
                      haptic('medium');
                      setIsOutfitCreatorOpen(false);
                      setCurrentScreen('profile');
                      setTimeout(() => {
                        setActiveDragId(null);
                        setCanvasItems([]);
                        setOutfitName('');
                        setEditingOutfitId(null);
                      }, 50);
                    } catch (e) {
                      console.error(e);
                      alert('Не удалось сохранить образ');
                    }
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', color: '#151414' }}
                >
                  Готово
                </button>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
                <div style={{ width: '315px', height: '480px', backgroundColor: '#E6E5E3', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0px 8px 32px rgba(0,0,0,0.05)', border: '1px solid rgba(21, 20, 20, 0.03)' }}>
                  {canvasItems.length === 0 && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      color: '#8B8A89', textAlign: 'center', pointerEvents: 'none', width: '80%'
                    }}>
                      <p className="fancy-serif" style={{ fontSize: '16px', margin: '0 0 6px 0' }}>Ваш будущий образ</p>
                      <p style={{ fontSize: '12px', margin: 0 }}>Нажмите «+ Добавить вещи» снизу, чтобы выложить их сюда, и двигайте пальцем</p>
                    </div>
                  )}
                  {canvasItems.map((item) => (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleDragStart(e, item.id)}
                      style={{
                        position: 'absolute',
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        transform: `scale(${item.scale})`,
                        transformOrigin: 'center center',
                        cursor: 'move',
                        touchAction: 'none',
                        userSelect: 'none',
                        zIndex: activeDragId === item.id ? 1000 : 10
                      }}
                    >
                      <button
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCanvasItems(canvasItems.filter(i => i.id !== item.id));
                          haptic('light');
                        }}
                        style={{
                          position: 'absolute', top: '-8px', right: '-8px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: '#151414', color: '#fff', border: 'none',
                          fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 15, cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                      <img
                        src={item.img}
                        alt=""
                        draggable="false"
                        style={{
                          width: '110px',
                          objectFit: 'contain', // Не обрезаем, показываем целиком
                          boxShadow: activeDragId === item.id ? '0px 12px 24px rgba(0,0,0,0.15)' : '0px 4px 12px rgba(0,0,0,0.06)',
                          transition: 'box-shadow 0.1s ease',
                          pointerEvents: 'none' // Чтобы клик и перетаскивание срабатывали на родителе, а не на самой картинке
                        }}
                      />
                      <div
                        onTouchStart={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'absolute',
                          left: '-28px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <button
                          onClick={() => setCanvasItems(prev => prev.map(i => i.id === item.id ? { ...i, scale: Math.max(0.5, i.scale - 0.15) } : i))}
                          style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          -
                        </button>
                        <button
                          onClick={() => setCanvasItems(prev => prev.map(i => i.id === item.id ? { ...i, scale: Math.min(2, i.scale + 0.15) } : i))}
                          style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {showEmptyOutfitAlert && (
                <>
                  <div onClick={() => setShowEmptyOutfitAlert(false)} style={galleryStyles.confirmBackdrop} />
                  <div style={galleryStyles.confirmBox}>
                    <span style={galleryStyles.confirmText}>Добавьте хотя бы одну вещь, чтобы сохранить образ.</span>
                    <div style={{ ...galleryStyles.confirmActions, marginTop: '8px' }}>
                      <button onClick={() => setShowEmptyOutfitAlert(false)} style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#151414', padding: '12px' }}>
                        Понятно
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div style={{ padding: '20px', backgroundColor: 'transparent', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsItemPickerOpen(true)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#151414',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                >
                  + Добавить вещи на экран
                </button>
              </div>
            </div>
          )}

          {isItemPickerOpen && (
            <div
              onClick={() => { setIsItemPickerOpen(false); setPickerCategory('all'); }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000 }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '70vh',
                  backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', padding: '20px',
                  display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>Выберите вещи</span>
                  <button
                    onClick={() => { setIsItemPickerOpen(false); setPickerCategory('all'); }}
                    style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: '600', color: '#151414', cursor: 'pointer' }}
                  >
                    Готово
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingBottom: '12px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
                  {КАТЕГОРИИ.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setPickerCategory(cat.id); haptic('light'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none',
                        backgroundColor: pickerCategory === cat.id ? '#151414' : '#E6E5E3',
                        color: pickerCategory === cat.id ? '#FFFFFF' : '#151414',
                        fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap'
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingBottom: '20px' }}>
                  {clothes
                    .filter((item: any) => !item.deletedAt && (pickerCategory === 'all' || item.category === pickerCategory))
                    .map((item: any) => {
                      const isAlreadyOnCanvas = canvasItems.some(i => i.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isAlreadyOnCanvas) {
                              setCanvasItems(canvasItems.filter(i => i.id !== item.id));
                            } else {
                              setCanvasItems([...canvasItems, {
                                ...item,
                                x: 102,
                                y: 185,
                                scale: 1
                              }]);
                              haptic('light');
                            }
                          }}
                          style={{
                            aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', position: 'relative',
                            border: isAlreadyOnCanvas ? '3px solid #151414' : '1px solid #E6E5E3',
                            opacity: isAlreadyOnCanvas ? 0.6 : 1,
                            cursor: 'pointer'
                          }}
                        >
                          <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          {isAlreadyOnCanvas && (
                            <div style={{
                              position: 'absolute', top: '4px', right: '4px', backgroundColor: '#151414',
                              color: '#fff', borderRadius: '50%', width: '18px', height: '18px',
                              fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>✓</div>
                          )}
                        </div>
                      );
                    })}
                  {clothes.filter((item: any) => !item.deletedAt && (pickerCategory === 'all' || item.category === pickerCategory)).length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8B8A89', fontSize: '13px', paddingTop: '40px' }}>
                      В этой категории пока нет вещей
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isCapsuleCreatorOpen && (
            <div
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#edecea', zIndex: 99999,
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}
            >
              {capsuleStep === 'items' && (
                <>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(21, 20, 20, 0.05)'
                  }}>
                    <button
                      onClick={() => {
                        setIsCapsuleCreatorOpen(false);
                        setCapsuleItems([]);
                        setCapsuleName('');
                        setCapsuleOutfits([]);
                        setEditingCapsuleId(null);
                      }}
                      style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '500', color: '#6B6A69' }}
                    >
                      Отмена
                    </button>
                    <input
                      placeholder="Название капсулы"
                      value={capsuleName}
                      onChange={(e) => setCapsuleName(e.target.value)}
                      style={{
                        background: 'none', border: 'none', borderBottom: '1px solid #151414',
                        textAlign: 'center', fontSize: '16px', fontWeight: '600', outline: 'none', width: '50%'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (capsuleItems.length === 0) {
                          setShowEmptyCapsuleAlert(true);
                          haptic('heavy');
                          return;
                        }
                        setCapsuleStep('outfits');
                        haptic('light');
                      }}
                      style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', color: '#151414' }}
                    >
                      Далее →
                    </button>
                  </div>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    padding: '16px 16px 0 16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', paddingBottom: '14px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
                      {КАТЕГОРИИ.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setCapsulePickerCategory(cat.id); haptic('light'); }}
                          style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            backgroundColor: capsulePickerCategory === cat.id ? '#151414' : '#FFFFFF',
                            color: capsulePickerCategory === cat.id ? '#FFFFFF' : '#151414',
                            fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                            boxShadow: '0px 2px 8px rgba(0,0,0,0.02)'
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {capsuleItems.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#8B8A89', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
                          Выбрано ({capsuleItems.length})
                        </span>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          overflowX: 'auto',
                          paddingTop: '8px', 
                          paddingLeft: '4px',
                          paddingRight: '8px',
                          paddingBottom: '4px',
                          scrollbarWidth: 'none',
                          WebkitOverflowScrolling: 'touch'
                        }}>
                          {capsuleItems.map((item) => (
                            <div
                              key={`selected-${item.id}`}
                              onClick={() => {
                                setCapsuleItems(capsuleItems.filter(i => i.id !== item.id));
                                haptic('light');
                              }}
                              style={{
                                flexShrink: 0,
                                width: '60px',
                                height: '85px',
                                backgroundColor: '#FFFFFF',
                                borderRadius: '10px',
                                padding: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                position: 'relative',
                                overflow: 'visible', 
                                boxShadow: '0px 2px 6px rgba(0,0,0,0.03)',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ width: '100%', height: '62px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#E6E5E3' }}>
                                <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: '500', color: '#151414', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingLeft: '1px' }}>
                                {item.name}
                              </span>
                              <div style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#E57373',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '16px',
                                height: '14px', 
                                paddingBottom: '2px', 
                                fontSize: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                                boxSizing: 'border-box',
                                zIndex: 10
                              }}>✕</div>
                            </div>
                          ))}
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(21, 20, 20, 0.05)', margin: '4px 0 0 0' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingBottom: '40px', scrollbarWidth: 'none' }}>
                      {(clothes || [])
                        .filter((item: any) => !item.deletedAt && (capsulePickerCategory === 'all' || item.category === capsulePickerCategory))
                        .map((item: any) => {
                          const isAlreadyInCapsule = capsuleItems.some(i => i.id === item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isAlreadyInCapsule) {
                                  setCapsuleItems(capsuleItems.filter(i => i.id !== item.id));
                                } else {
                                  setCapsuleItems([...capsuleItems, item]);
                                  haptic('light');
                                }
                              }}
                              style={{
                                ...galleryStyles.card,
                                position: 'relative',
                                cursor: 'pointer',
                                border: isAlreadyInCapsule ? '3px solid #151414' : '1px solid transparent',
                                opacity: isAlreadyInCapsule ? 0.75 : 1,
                                transition: 'all 0.1s ease'
                              }}
                            >
                              <div style={galleryStyles.imageWrapper}>
                                <img src={item.img} alt={item.name} style={galleryStyles.cardImage} />
                              </div>
                              <span style={galleryStyles.cardTitle}>{item.name}</span>
                              {isAlreadyInCapsule && (
                                <div style={{
                                  position: 'absolute', top: '10px', right: '10px', backgroundColor: '#151414',
                                  color: '#fff', borderRadius: '50%', width: '20px', height: '20px',
                                  fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                  zIndex: 5
                                }}>✓</div>
                              )}
                            </div>
                          );
                        })}
                      {(clothes || []).filter((item: any) => !item.deletedAt && (capsulePickerCategory === 'all' || item.category === capsulePickerCategory)).length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8B8A89', fontSize: '14px', paddingTop: '60px' }}>
                          В этой категории пока нет вещей
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {capsuleStep === 'outfits' && (
                <>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(21, 20, 20, 0.05)'
                  }}>
                    <button
                      onClick={() => setCapsuleStep('items')}
                      style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '500', color: '#6B6A69' }}
                    >
                      ← К вещам
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>Образы капсулы</span>
                    <button
                      onClick={async () => {
                        const payload = {
                          name: capsuleName || "Моя капсула",
                          item_ids: capsuleItems.map(i => i.id),
                          outfits: capsuleOutfits.map(o => ({
                            name: o.name,
                            items: o.items.map((i: any) => ({ clothing_id: i.id, x: i.x, y: i.y, scale: i.scale }))
                          }))
                        };
                        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                        try {
                          let response;
                          if (editingCapsuleId) {
                            response = await fetch(`${API_BASE_URL}/capsules/${editingCapsuleId}`, {
                              method: 'PATCH', headers, body: JSON.stringify(payload)
                            });
                          } else {
                            response = await fetch(`${API_BASE_URL}/capsules/`, {
                              method: 'POST', headers, body: JSON.stringify(payload)
                            });
                          }
                          if (!response.ok) throw new Error('Ошибка сохранения капсулы');
                                                const savedCapsule = await response.json();
                      
                      const mappedCapsule = {
                        ...savedCapsule,
                        createdAt: savedCapsule.created_at,
                        deletedAt: savedCapsule.deleted_at,
                        items: capsuleItems.map(ci => ({ ...ci, img: ci.img })),
                        outfits: (savedCapsule.outfits || capsuleOutfits).map((o: any) => ({
                          ...o,
                          items: (o.items || []).map((item: any) => {
                            const localItem = capsuleItems.find(ci => ci.id === (item.clothing_id || item.id));
                            return {
                              ...item,
                              id: item.clothing_id || item.id,
                              img: localItem?.img || getFullImageUrl(item.image_url || item.img)
                            };
                          })
                        }))
                      };

                      if (editingCapsuleId) {
                        setCapsules(capsules.map(c => c.id === editingCapsuleId ? mappedCapsule : c));
                      } else {
                        setCapsules([mappedCapsule, ...capsules]);
                      }
                          haptic('medium');
                          setIsCapsuleCreatorOpen(false);
                        } catch (e) {
                          console.error(e);
                          alert('Не удалось сохранить капсулу');
                        }
                        setCapsuleItems([]);
                        setCapsuleName('');
                        setCapsuleOutfits([]);
                        setCapsuleStep('items');
                        setEditingCapsuleId(null); 
                      }}
                      style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', color: '#6B6A69' }}
                    >
                      Сохранить
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <span style={outfitStyles.sectionTitle} className="fancy-serif">
                      {editingCapsuleId ? 'Изменение образов капсулы' : 'Шаг 2: Создайте образы внутри капсулы'}
                    </span>
                    {capsuleOutfits.length === 0 ? (
                      <div style={{ color: '#8B8A89', textAlign: 'center', marginTop: '30%', width: '100%' }}>
                        <p style={{ fontSize: '13px' }}>Пока нет образов. Создайте первый образ из вещей этой капсулы!</p>
                      </div>
                    ) : (
                      <div style={{ ...galleryStyles.grid, marginTop: '12px' }}>
                        {capsuleOutfits.map((outfit) => (
                          <div key={outfit.id} style={{ ...galleryStyles.card, position: 'relative' }}>
                            <button onClick={() => setCapsuleOutfits(capsuleOutfits.filter(o => o.id !== outfit.id))} style={galleryStyles.deleteBadge}>✕</button>
                            <div style={{ ...galleryStyles.imageWrapper, position: 'relative' }}>
                              {(outfit.items || []).map((item: any, idx: number) => {
                                const factor = 0.333;
                                return (
                                  <img
                                    key={`${item.id}-${idx}`}
                                    src={item.img}
                                    alt=""
                                    style={{
                                    position: 'absolute',
                                    left: `${item.x * factor}px`,
                                    top: `${item.y * factor}px`,
                                    width: `${110 * factor * (item.scale || 1)}px`,
                                    height: `${110 * factor * (item.scale || 1)}px`,
                                    objectFit: 'contain'
                                  }}
                                  />
                                );
                              })}
                            </div>
                            <span style={galleryStyles.cardTitle}>{outfit.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsCapsuleOutfitCreatorOpen(true)}
                      style={{ padding: '16px 32px', backgroundColor: '#151414', color: '#FFFFFF', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600' }}
                    >
                      + Создать образ из капсулы
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {isCapsuleOutfitCreatorOpen && (
            <div
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#edecea', zIndex: 100001, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              onMouseMove={handleCapsuleDragMove} onTouchMove={handleCapsuleDragMove}
              onMouseUp={() => setCapsuleActiveDragId(null)} onTouchEnd={() => setCapsuleActiveDragId(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                <button onClick={() => { setIsCapsuleOutfitCreatorOpen(false); setCapsuleCanvasItems([]); setCapsuleOutfitName(''); }} style={{ background: 'none', border: 'none', fontSize: '16px', color: '#6B6A69' }}>Отмена</button>
                <input placeholder="Название образа" value={capsuleOutfitName} onChange={(e) => setCapsuleOutfitName(e.target.value)} style={{ background: 'none', border: 'none', borderBottom: '1px solid #151414', textAlign: 'center', fontSize: '16px', fontWeight: '600', outline: 'none', width: '50%' }} />
                <button
                  onClick={() => {
                    if (capsuleCanvasItems.length === 0) { alert('Добавьте вещи на холст!'); return; }
                    const newCapsuleOutfit = { id: Date.now(), name: capsuleOutfitName || "Образ капсулы", items: [...capsuleCanvasItems] };
                    setCapsuleOutfits([newCapsuleOutfit, ...capsuleOutfits]);
                    setIsCapsuleOutfitCreatorOpen(false);
                    setCapsuleCanvasItems([]);
                    setCapsuleOutfitName('');
                    haptic('medium');
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', color: '#151414' }}
                >
                  Готово
                </button>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
                <div style={{ width: '280px', height: '370px', backgroundColor: '#E6E5E3', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0px 8px 32px rgba(0,0,0,0.05)', border: '1px solid rgba(21, 20, 20, 0.03)' }}>                
                  {capsuleCanvasItems.length === 0 && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#8B8A89', textAlign: 'center', width: '80%', pointerEvents: 'none' }}>
                      <p className="fancy-serif" style={{ fontSize: '16px' }}>Используются только вещи из этой капсулы</p>
                    </div>
                  )}
                  {capsuleCanvasItems.map((item) => (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleCapsuleDragStart(e, item.id)} onTouchStart={(e) => handleCapsuleDragStart(e, item.id)}
                      style={{ position: 'absolute', left: `${item.x}px`, top: `${item.y}px`, transform: `scale(${item.scale || 1})`, transformOrigin: 'center center', cursor: 'move', touchAction: 'none', zIndex: capsuleActiveDragId === item.id ? 1000 : 10 }}
                    >
                      <button onClick={(e) => { e.stopPropagation(); setCapsuleCanvasItems(capsuleCanvasItems.filter(i => i.id !== item.id)); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#151414', color: '#fff', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      <img src={item.img} draggable="false" style={{ width: '110px', objectFit: 'contain', boxShadow: '0px 4px 12px rgba(0,0,0,0.06)', pointerEvents: 'none' }} alt="" />
                      <div
                        onTouchStart={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'absolute',
                          left: '-28px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <button onClick={(e) => { e.stopPropagation(); setCapsuleCanvasItems(prev => prev.map(i => i.id === item.id ? { ...i, scale: Math.max(0.5, (i.scale || 1) - 0.15) } : i)); }} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: '#fff', fontSize: '12px', fontWeight: 'bold' }}>-</button>
                        <button onClick={(e) => { e.stopPropagation(); setCapsuleCanvasItems(prev => prev.map(i => i.id === item.id ? { ...i, scale: Math.min(2, (i.scale || 1) + 0.15) } : i)); }} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: '#fff', fontSize: '12px', fontWeight: 'bold' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setIsCapsuleOutfitItemPickerOpen(true)} style={{ padding: '16px 32px', backgroundColor: '#151414', color: '#FFFFFF', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600' }}>
                  + Добавить вещи из капсулы
                </button>
              </div>
            </div>
          )}

          {isCapsuleOutfitItemPickerOpen && (
            <div onClick={() => setIsCapsuleOutfitItemPickerOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100002 }}>
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60vh', backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>Вещи в этой капсуле</span>
                  <button
                    onClick={() => setIsCapsuleOutfitItemPickerOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: '600', color: '#151414', cursor: 'pointer' }}
                  >
                    Готово
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {capsuleItems.map((item) => {
                    const isAlreadyOnCanvas = capsuleCanvasItems.some(i => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isAlreadyOnCanvas) {
                            setCapsuleCanvasItems(capsuleCanvasItems.filter(i => i.id !== item.id));
                          } else {
                            setCapsuleCanvasItems([...capsuleCanvasItems, { ...item, x: 102, y: 185, scale: 1 }]);                        
                          }
                        }}
                        style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: isAlreadyOnCanvas ? '3px solid #151414' : '1px solid #E6E5E3', opacity: isAlreadyOnCanvas ? 0.6 : 1, cursor: 'pointer' }}
                      >
                        <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        {isAlreadyOnCanvas && <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#151414', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isDrawerOpen && (
            <div onClick={resetDrawerState} style={drawerStyles.backdrop} />
          )}
          <div style={{ ...drawerStyles.drawer, display: isDrawerOpen ? 'flex' : 'none' }}>
            <div style={drawerStyles.header}>
              <div style={drawerStyles.headerLeft}>
                <span style={{ fontSize: '20px', color: '#151414', fontWeight: 'bold', marginRight: '6px' }}>
                  {editingItemId ? '✎' : '+'}
                </span>
                <h3 style={drawerStyles.headerTitle}>
                  {editingItemId ? 'Редактировать вещь' : 'Новая вещь'}
                </h3>
              </div>
              <button onClick={resetDrawerState} style={drawerStyles.closeBtn}>✕</button>
            </div>
            <div style={drawerStyles.scrollContainer}>
              {isUploading && (
                  <div style={drawerStyles.loadingOverlay}>
                    <div style={drawerStyles.spinner} />
                    <span style={drawerStyles.loadingText}>Загружаем фото...</span>
                  </div>
                )}
              {!newImage ? (
                <>
                  <div style={{
                    backgroundColor: '#F9F8F6',
                    border: '1px solid rgba(21, 20, 20, 0.08)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    color: '#6B6A69',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    <strong>Обратите внимание:</strong> вещь должна быть сфотографирована ровно и на однотонном (однородном) фоне.
                  </div>
                  <PhotoPicker onImageSelected={(imgData: string) => {
                    setNewImage(imgData);
                  }} />
                </>
              ) : (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden' }}>
                  <img src={newImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setNewImage(null)} style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(21, 20, 20, 0.8)', color: '#FFFFFF', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Заменить фото</button>
                </div>
              )}
              <input type="text" placeholder="Название вещи" value={newName} onChange={(e) => setNewName(e.target.value)} style={drawerStyles.input} />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={drawerStyles.select}>
                <option value="" disabled hidden>Категория</option>
                <option value="outerwear">Верхняя одежда</option>
                <option value="top">Верх</option>
                <option value="bottom">Низ</option>
                <option value="shoes">Обувь</option>
                <option value="accessory">Аксессуары</option>
              </select>
              <select value={newSeason} onChange={(e) => setNewSeason(e.target.value)} style={drawerStyles.select}>
                <option value="" disabled hidden>Сезон</option>
                {СЕЗОНЫ.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} style={drawerStyles.select}>
                <option value="" disabled hidden>Материал</option>
                {МАТЕРИАЛЫ.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px', width: '100%' }}>
                <span style={{ fontSize: '12px', color: '#6B6A69', fontWeight: '500', paddingLeft: '4px' }}>Цвет вещи:</span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 2px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                  {ЦВЕТА.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setNewColor(c.id); haptic('light'); }}
                      style={{
                        flexShrink: 0,
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: c.hex,
                        border: newColor === c.id ? '2.5px solid #151414' : c.id === 'white' ? '1px solid #D4D3D1' : 'none',
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        transform: newColor === c.id ? 'scale(1.05)' : 'none',
                        transition: 'all 0.1s ease'
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              {drawerError && (
                <div style={{
                  backgroundColor: '#FFF0F0',
                  border: '1px solid #E57373',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#E57373',
                  fontSize: '13px',
                  fontWeight: '500',
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '4px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {drawerError}
                </div>
              )}
              <div style={drawerStyles.actionsContainer}>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetDrawerState();
                      haptic('light');
                    }}
                    style={drawerStyles.cancelBtn}
                  >
                    Отменить
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!newImage) { setDrawerError('Добавьте фотографию вещи'); return; }
                    if (!newName.trim()) { setDrawerError('Введите название вещи'); return; }
                    if (!newCategory) { setDrawerError('Выберите категорию вещи'); return; }
                    if (!newSeason) { setDrawerError('Выберите сезон вещи'); return; }
                    if (!newColor) { setDrawerError('Выберите цвет вещи'); return; }
                    if (!newMaterial) { setDrawerError('Выберите материал вещи'); return; }
                    setDrawerError(null);
                    try {
                      let finalImageUrl = newImage; 
                      
                      if (newImage && newImage.startsWith('data:image/')) {
                        setIsUploading(true); // <-- ВКЛЮЧАЕМ ЛОАДЕР
                        try {
                          finalImageUrl = await uploadImageAndGetUrl(newImage);
                        } finally {
                          setIsUploading(false); // <-- ВЫКЛЮЧАЕМ ЛОАДЕР (даже если ошибка)
                        }
                      }

                      const method = editingItemId ? 'PATCH' : 'POST';
                      const url = editingItemId ? `${API_BASE_URL}/clothes/${editingItemId}` : `${API_BASE_URL}/clothes/`;
                      const response = await fetch(url, {
                        method: method,
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          name: newName,
                          category: newCategory,
                          color: newColor,
                          season: newSeason,
                          material: newMaterial,
                          image_url: finalImageUrl 
                        })
                      });
                      if (!response.ok) throw new Error('Не удалось сохранить вещь');
                      const savedItem = await response.json();
                      
                      if (editingItemId) {
                        setClothes(prev => prev.map(i => i.id === editingItemId ? { ...i, ...savedItem, img: getFullImageUrl(finalImageUrl) } : i));                      } else {
                        const newItem = { ...savedItem, img: getFullImageUrl(finalImageUrl), deletedAt: null };
                        setClothes(prev => [newItem, ...prev]);
                      }
                      resetDrawerState();
                      haptic('medium');
                      setCurrentScreen('profile');
                    } catch (e) {
                      console.error("Ошибка:", e);
                      setDrawerError("Не удалось сохранить вещь. Проверьте соединение.");
                    }
                  }}
                  style={drawerStyles.saveBtn}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>

          {selectedItemForView && (
            <>
              <div
                onClick={() => setSelectedItemForView(null)}
                style={itemModalStyles.backdrop} />
              <div style={itemModalStyles.box}>
                <div style={itemModalStyles.header}>
                  <h3 style={itemModalStyles.title} className="fancy-serif">{selectedItemForView.name}</h3>
                  <button onClick={() => setSelectedItemForView(null)} style={itemModalStyles.closeBtn}>✕</button>
                </div>
                <div style={itemModalStyles.imageContainer}>
                  <img src={selectedItemForView.img} alt="" style={itemModalStyles.image} />
                </div>
                <div style={itemModalStyles.tagsContainer}>
                  <div style={itemModalStyles.tagRow}>
                    <span style={itemModalStyles.tagLabel}>Сезон:</span>
                    <span style={itemModalStyles.tagBadge}>
                      {СЕЗОНЫ.find(s => s.id === selectedItemForView.season)?.name || selectedItemForView.season}
                    </span>
                  </div>
                  <div style={itemModalStyles.tagRow}>
                    <span style={itemModalStyles.tagLabel}>Цвет:</span>
                    <div
                      style={{
                        width: '45px',
                        height: '14px',
                        borderRadius: '6px',
                        backgroundColor: ЦВЕТА.find(c => c.id === selectedItemForView.color)?.hex || '#8B8A89',
                        border: selectedItemForView.color === 'white' ? '1px solid #D4D3D1' : 'none',
                        boxShadow: '0px 1px 3px rgba(0,0,0,0.05)'
                      }}
                      title={ЦВЕТА.find(c => c.id === selectedItemForView.color)?.name || selectedItemForView.color}
                    />
                  </div>
                  <div style={itemModalStyles.tagRow}>
                    <span style={itemModalStyles.tagLabel}>Материал:</span>
                    <span style={itemModalStyles.tagBadge}>
                      {МАТЕРИАЛЫ.find(m => m.id === selectedItemForView.material)?.name || selectedItemForView.material}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#151414',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                  onClick={() => {
                    setEditingItemId(selectedItemForView.id);
                    setNewName(selectedItemForView.name);
                    setNewCategory(selectedItemForView.category);
                    setNewSeason(selectedItemForView.season);
                    setNewColor(selectedItemForView.color);
                    setNewMaterial(selectedItemForView.material);
                    setNewImage(selectedItemForView.img);
                    setSelectedItemForView(null);
                    setIsDrawerOpen(true);
                    haptic('light');
                  }}
                >
                  Редактировать
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#E57373',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    openDeleteModal(selectedItemForView.id, 'clothes');
                    setSelectedItemForView(null);
                  }}
                >
                  Удалить вещь
                </button>
              </div>
            </>
          )}

          {selectedCapsuleForView && (
            <>
              <div
                onClick={() => setSelectedCapsuleForView(null)}
                style={{ ...itemModalStyles.backdrop, zIndex: 99998 }}
              />
              <div style={{ ...itemModalStyles.box, zIndex: 99999, maxWidth: '360px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={itemModalStyles.header}>
                  <h3 style={itemModalStyles.title} className="fancy-serif">{selectedCapsuleForView.name}</h3>
                  <button onClick={() => setSelectedCapsuleForView(null)} style={itemModalStyles.closeBtn}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#151414', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Образы этой капсулы</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '410px', overflowY: 'auto', paddingRight: '2px' }}>
                    {selectedCapsuleForView.outfits && selectedCapsuleForView.outfits.length > 0 ? (
                      selectedCapsuleForView.outfits.map((outfit: any) => (
                        <div
                          key={outfit.id}
                          onClick={() => {
                            setSelectedOutfitForView(outfit);
                            setIsViewOnlyOutfit(true);
                            haptic('light');
                          }}
                          style={{ ...galleryStyles.card, cursor: 'pointer' }}
                        >
                          <div style={{ ...galleryStyles.imageWrapper, position: 'relative' }}>
                            {(outfit.items || []).map((item: any, idx: number) => {
                              const factor = 0.333;
                              return (
                                <img
                                  key={`${item.id}-${idx}`}
                                  src={item.img}
                                  alt=""
                                  style={{
                                  position: 'absolute',
                                  left: `${item.x * factor}px`,
                                  top: `${item.y * factor}px`,
                                  width: `${110 * factor * (item.scale || 1)}px`,
                                  height: `${110 * factor * (item.scale || 1)}px`,
                                  objectFit: 'contain'
                                }}
                                />
                              );
                            })}
                          </div>
                          <span style={galleryStyles.cardTitle}>{outfit.name}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8B8A89', fontSize: '13px', padding: '30px 0' }}>
                        В этой капсуле ещё нет созданных образов
                      </div>
                    )}
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(21, 20, 20, 0.08)', margin: '12px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#151414', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вещи в капсуле ({selectedCapsuleForView.items?.length || 0})</span>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {selectedCapsuleForView.items?.map((item: any) => (
                      <div key={item.id} style={{ flexShrink: 0, width: '65px', height: '65px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#E6E5E3', border: '1px solid rgba(21,20,20,0.05)' }}>
                        <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px', width: '100%' }}>
                  <button
                    style={{ width: '100%', padding: '12px', backgroundColor: '#151414', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => {
                      setEditingCapsuleId(selectedCapsuleForView.id);
                      setCapsuleName(selectedCapsuleForView.name);
                      setCapsuleItems(selectedCapsuleForView.items || []);
                      setCapsuleOutfits(selectedCapsuleForView.outfits || []);
                      setCapsuleStep('items');
                      setSelectedCapsuleForView(null);
                      setIsCapsuleCreatorOpen(true);
                      haptic('light');
                    }}
                  >
                    Редактировать капсулу
                  </button>
                  <button
                    style={{ width: '100%', padding: '12px', backgroundColor: '#E57373', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => {
                      openDeleteModal(selectedCapsuleForView.id, 'capsules');
                      setSelectedCapsuleForView(null);
                    }}
                  >
                    Удалить капсулу
                  </button>
                </div>
              </div>
            </>
          )}

          {deleteConfirm && (
            <>
              <div onClick={() => setDeleteConfirm(null)} style={galleryStyles.confirmBackdrop} />
              <div style={galleryStyles.confirmBox}>
                <span style={galleryStyles.confirmText}>
                  {deleteConfirm.type === 'clothes' && (
                    (() => {
                      const isUsed = outfits.some((o: any) => !o.deletedAt && (o.items || []).some((i: any) => i.id === deleteConfirm.id)) ||
                        capsules.some((c: any) => !c.deletedAt && ((c.items || []).some((i: any) => i.id === deleteConfirm.id) || (c.outfits || []).some((o: any) => (o.items || []).some((i: any) => i.id === deleteConfirm.id))));
                      
                      if (isUsed) {
                        return (
                          <>
                            Эта вещь используется в ваших образах или капсулах. При удалении она исчезнет из них, а пустые образы/капсулы удалятся тоже.{' '}
                            <strong style={{ fontWeight: '700', color: '#151414' }}>Переместить в корзину?</strong>
                          </>
                        );
                      }
                      return 'Переместить вещь в корзину?';
                    })()
                  )}
                  {deleteConfirm.type === 'outfits' && 'Переместить образ в корзину?'}
                  {deleteConfirm.type === 'capsules' && 'Переместить капсулу в корзину?'}
                </span>
                <div style={galleryStyles.confirmActions}>
                  <button onClick={confirmDelete} style={galleryStyles.confirmDeleteBtn}>Да</button>
                  <button onClick={() => setDeleteConfirm(null)} style={galleryStyles.confirmCancelBtn}>Отмена</button>
                </div>
              </div>
            </>
          )}

          {showEmptyCapsuleAlert && (
            <>
              <div onClick={() => setShowEmptyCapsuleAlert(false)} style={{ ...galleryStyles.confirmBackdrop, zIndex: 100002 }} />
              <div style={{ ...galleryStyles.confirmBox, zIndex: 100003 }}>
                <span style={galleryStyles.confirmText}>Добавьте хотя бы одну вещь, чтобы продолжить создание капсулы.</span>
                <div style={{ ...galleryStyles.confirmActions, marginTop: '8px' }}>
                  <button onClick={() => setShowEmptyCapsuleAlert(false)} style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#151414', padding: '12px' }}>
                    Понятно
                  </button>
                </div>
              </div>
            </>
          )}

          {selectedOutfitForView && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100000 }}>
              <div
                onClick={() => { setSelectedOutfitForView(null); setIsViewOnlyOutfit(false); }}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              />
              <div style={{ ...itemModalStyles.box, zIndex: 100001 }}>
                <div style={itemModalStyles.header}>
                  <h3 style={itemModalStyles.title} className="fancy-serif">{selectedOutfitForView.name}</h3>
                  <button onClick={() => { setSelectedOutfitForView(null); setIsViewOnlyOutfit(false); }} style={itemModalStyles.closeBtn}>✕</button>
                </div>
                <div style={{
                  width: '240px',
                  height: '365px',
                  backgroundColor: '#E6E5E3',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: '1px solid rgba(21, 20, 20, 0.05)'
                }}>
                  {(selectedOutfitForView.items || []).map((item: any, idx: number) => {
                    const factor = 0.76;
                    return (
                      <img
                        key={`${item.id}-${idx}`}
                        src={item.img}
                        alt=""
                        style={{
                        position: 'absolute',
                        left: `${item.x * factor}px`,
                        top: `${item.y * factor}px`,
                        width: `${110 * factor * (item.scale || 1)}px`,
                        height: `${110 * factor * (item.scale || 1)}px`,
                        objectFit: 'contain'
                      }}
                      />
                    );
                  })}
                </div>
                {!isViewOnlyOutfit && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <button
                      style={{ width: '100%', padding: '12px', backgroundColor: '#151414', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingOutfitId(selectedOutfitForView.id);
                        setCanvasItems(selectedOutfitForView.items);
                        setOutfitName(selectedOutfitForView.name);
                        setIsOutfitCreatorOpen(true);
                        setSelectedOutfitForView(null);
                        haptic('light');
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      style={{ width: '100%', padding: '12px', backgroundColor: '#E57373', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                      onClick={() => {
                        openDeleteModal(selectedOutfitForView.id, 'outfits');
                        setSelectedOutfitForView(null);
                      }}
                    >
                      Удалить образ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <BottomNavBar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        </>
      )}
    </div>
  );
}

const ProfileGallery = ({
  clothes = [], outfits = [], capsules = [],
  searchQuery, setIsSearchOpen, haptic,
  setIsOutfitCreatorOpen,
  setIsCapsuleCreatorOpen,
  setIsDrawerOpen,
  onItemClick,
  onOutfitClick,
  onCapsuleClick,
  }: any) => {
  const [activeTab, setActiveTab] = useState<'capsules' | 'outfits' | 'clothes'>('clothes');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');

  const clothesArray = Array.isArray(clothes) ? clothes : [];
  const filteredClothes = clothesArray.filter((item: any) =>
    item &&
    typeof item === 'object' &&
    !item.deletedAt &&
    typeof item.name === 'string' &&
    item.name.toLowerCase().includes((searchQuery || "").toLowerCase()) &&
    (selectedCategoryFilter === '' || item.category === selectedCategoryFilter) &&
    (selectedSeason === '' || item.season === selectedSeason) &&
    (selectedColor === '' || item.color === selectedColor) &&
    (selectedMaterial === '' || item.material === selectedMaterial)
  );

  const filteredOutfits = (outfits || []).filter((item: any) =>
    item &&
    !item.deletedAt &&
    (item.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const filteredCapsules = (capsules || []).filter((item: any) =>
    item &&
    !item.deletedAt &&
    (item.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div style={{ width: '100%', marginTop: '10px' }}>
      <div style={galleryStyles.tabsContainer}>
        {[ { id: 'capsules', label: 'Капсулы' }, { id: 'outfits', label: 'Образы' }, { id: 'clothes', label: 'Одежда' } ].map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); haptic('light'); }} style={{ ...galleryStyles.tabButton, color: activeTab === tab.id ? '#151414' : '#8B8A89', borderBottom: activeTab === tab.id ? '2px solid #151414' : '2px solid transparent' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'clothes' && (
        <>
          <button
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#151414',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setIsDrawerOpen(true);
              haptic('light');
            }}
          >
            + Добавить вещь
          </button>
          <div style={{ ...galleryStyles.filterRow, gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={galleryStyles.filterSelect}
            >
              <option value="" disabled hidden>Категория</option>
              <option value="">Все</option>
              <option value="outerwear">Верхняя одежда</option>
              <option value="top">Верх</option>
              <option value="bottom">Низ</option>
              <option value="shoes">Обувь</option>
              <option value="accessory">Аксессуары</option>
            </select>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              style={galleryStyles.filterSelect}
            >
              <option value="" disabled hidden>Сезон</option>
              <option value="">Все</option>
              {СЕЗОНЫ.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={galleryStyles.filterSelect}
            >
              <option value="" disabled hidden>Материал</option>
              <option value="">Все</option>
              {МАТЕРИАЛЫ.map((m: { id: string; name: string }) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <div style={{ position: 'relative', width: '100%' }}>
              <button
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                style={{
                  ...galleryStyles.filterSelect,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '20px',
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  minHeight: '31px'
                }}
              >
                {selectedColor ? (
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '3px',
                    backgroundColor: ЦВЕТА.find(c => c.id === selectedColor)?.hex,
                    border: selectedColor === 'white' ? '1px solid #D4D3D1' : 'none'
                  }} />
                ) : (
                  <span>Цвет</span>
                )}
              </button>
              {isColorDropdownOpen && (
                <>
                  <div onClick={() => setIsColorDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.12)',
                    zIndex: 999,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '4px',
                    scrollbarWidth: 'none'
                  }}>
                    <div
                      onClick={() => { setSelectedColor(''); setIsColorDropdownOpen(false); haptic('light'); }}
                      style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px', color: '#151414' }}
                    >
                      Все
                    </div>
                    {ЦВЕТА.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setSelectedColor(c.id); setIsColorDropdownOpen(false); haptic('light'); }}
                        style={{
                          padding: '6px 8px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: '10px',
                          borderRadius: '3px',
                          backgroundColor: c.hex,
                          border: c.id === 'white' ? '1px solid #D4D3D1' : 'none'
                        }} title={c.name} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button style={galleryStyles.searchCircle} onClick={() => setIsSearchOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#151414" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="12" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </>
      )}

      {activeTab === 'clothes' && (
        <div style={galleryStyles.itemCount}>
          Всего вещей: {filteredClothes.length}
        </div>
      )}

      {activeTab === 'capsules' && (
        <>
          <button
            style={{width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#151414', color: '#FFFFFF', fontWeight: '600', fontSize: '13px', cursor: 'pointer'}}
            onClick={() => { setIsCapsuleCreatorOpen(true); haptic('light'); }}
          >
            + Создать новую капсулу
          </button>
          <div style={galleryStyles.itemCount}>
            Всего капсул: {filteredCapsules.length}
          </div>
        </>
      )}

      {activeTab === 'outfits' && (
        <>
          <button
            style={{width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#151414', color: '#FFFFFF', fontWeight: '600', cursor: 'pointer'}}
            onClick={() => { setIsOutfitCreatorOpen(true); haptic('light'); }}
          >
            + Создать новый образ
          </button>
          <div style={galleryStyles.itemCount}>
            Всего образов: {filteredOutfits.length}
          </div>
        </>
      )}

      <div style={galleryStyles.grid} className="profile-grid">
        {activeTab === 'capsules' && (
          filteredCapsules.length > 0 ? (
            filteredCapsules.map((capsule: any) => {
              const itemsCount = capsule.items?.length || 0;
              const columns = itemsCount > 9 ? 4 : itemsCount > 4 ? 3 : 2;
              return (
                <div key={capsule.id} onClick={() => onCapsuleClick(capsule)} style={{ ...galleryStyles.card, cursor: 'pointer' }}>
                  <div style={{
                    ...galleryStyles.imageWrapper,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '4px',
                    padding: '4px',
                    boxSizing: 'border-box',
                    alignContent: 'center'
                  }}>
                    {capsule.items && capsule.items.map((item: any, idx: number) => (
                      <img
                        key={item.id || idx}
                        src={item.img}
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          backgroundColor: '#edecea'
                        }}
                        alt=""
                      />
                    ))}
                  </div>
                  <span style={galleryStyles.cardTitle}>{capsule.name}</span>
                </div>
              );
            })
          ) : (
            <div style={galleryStyles.emptyState}>Создайте свою первую капсулу!</div>
          )
        )}

        {activeTab === 'clothes' && (
          filteredClothes.length > 0 ? (
            filteredClothes.map((item: any) => (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                style={{ ...galleryStyles.card, position: 'relative', cursor: 'pointer' }}
              >
                <div style={galleryStyles.imageWrapper}>
                  <img src={item.img} alt={item.name} style={galleryStyles.cardImage} />
                </div>
                <span style={galleryStyles.cardTitle}>{item.name}</span>
              </div>
            ))
          ) : (
            <div style={galleryStyles.emptyState}>
              {searchQuery.trim() !== '' ? 'Ничего не найдено по этому запросу' : 'Добавьте свою первую вещь!'}
            </div>
          )
        )}

        {activeTab === 'outfits' && (
          filteredOutfits.length > 0 ? (
            filteredOutfits.map((outfit: any) => (
              <div
                key={outfit.id}
                onClick={() => onOutfitClick(outfit)}
                style={{ ...galleryStyles.card, cursor: 'pointer' }}
              >
                <div style={{ ...galleryStyles.imageWrapper, position: 'relative' }}>
                  {(outfit.items || []).map((item: any, idx: number) => {
                    const factor = 0.333;
                    return (
                      <img
                        key={`${item.id}-${idx}`}
                        src={item.img}
                        alt=""
                        style={{
                        position: 'absolute',
                        left: `${item.x * factor}px`,
                        top: `${item.y * factor}px`,
                        width: `${110 * factor * (item.scale || 1)}px`,
                        height: `${110 * factor * (item.scale || 1)}px`,
                        objectFit: 'contain'
                      }}
                      />
                    );
                  })}
                </div>
                <span style={galleryStyles.cardTitle}>{outfit.name}</span>
              </div>
            ))
          ) : (
            <div style={galleryStyles.emptyState}>Создайте свой первый образ!</div>
          )
        )}
      </div>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  padding: '16px 16px 120px 16px',
  boxSizing: 'border-box',
  overflowY: 'auto', 
  WebkitOverflowScrolling: 'touch',
};

const navStyles: Record<string, React.CSSProperties> = {
  navBarContainer: {
    position: 'fixed',
    bottom: '24px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
    pointerEvents: 'none',
  },
  navBar: {
    display: 'flex',
    backgroundColor: '#151414',
    borderRadius: '24px',
    padding: '12px 24px',
    alignItems: 'center',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'auto',
    width: 'auto',
    maxWidth: '240px',
    gap: '48px',
    justifyContent: 'center',
    boxSizing: 'border-box',
    margin: '0 auto',
  },
  navButton: {
    background: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '4px 0',
    width: '44px',
    height: '44px',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-2px',
    width: '20px',
    height: '2px',
    backgroundColor: '#FFFFFF',
    borderRadius: '1px',
  },
};

const drawerStyles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 998,
  },
  drawer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '360px',
    maxHeight: '85vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '28px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 12px 24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#333231',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: '#151414',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  photoPickerZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    backgroundColor: '#E6E5E3',
    borderRadius: '20px',
    border: '1.5px dashed #D4D3D1',
    gap: '12px',
    cursor: 'pointer',
  },
  pickerCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#E6E5E3',
    color: '#151414',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#E6E5E3',
    color: '#151414',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23151414' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 18px center',
    backgroundSize: '16px',
  },
  actionsContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  saveBtn: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#323130',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#D4D3D1',
    color: '#151414',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #E6E5E3',
    borderTop: '3px solid #151414',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B6A69',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.5px',
  },
};

const headerStyles: Record<string, React.CSSProperties> = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '8px 4px 16px 4px',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '600',
    color: '#151414',
    textAlign: 'center',
    flex: 1,
    marginRight: '35px',
  },
  logoZone: {
    position: 'relative',
    width: '40px',
    height: '40px',
    userSelect: 'none',
  },
  searchBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#151414',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
};

const outfitStyles: Record<string, React.CSSProperties> = {
  sectionContainer: {
    width: '100%',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: '#151414',
  },
  mainRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '120px 145px', 
    gap: '10px',
    width: '100%',
    boxSizing: 'border-box',
  },
  outfitCard: {
    gridRow: '1 / span 2',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px', 
    padding: '12px',      
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
  },
  outfitName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B6A69',
    marginBottom: '8px',
    display: 'block',
  },
  itemsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    alignItems: 'center',
  },
  emptyGrid: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #D4D3D1',
  },
  gridImage: {
    width: '100%',
    aspectRatio: '1/1',
    objectFit: 'cover',
    borderRadius: '10px',
    backgroundColor: '#E6E5E3',
  },
};

const homeStyles: Record<string, React.CSSProperties> = {
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
            paddingTop: '0px',
        boxSizing: 'border-box',
      },
      addBtn: {
        background: 'none',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
      },
      plusCircle: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        border: '2px solid #151414',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        transition: 'transform 0.2s ease',
      },
      btnText: {
        color: '#151414',
        fontSize: '16px',
        fontWeight: '600',
      },
    };
    const widgetStyles: Record<string, React.CSSProperties> = {
      weatherCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '10px 12px',
        color: '#151414',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        height: '100%',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
      },
      hourlyRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'auto',
        borderTop: '0.5px solid rgba(21, 20, 20, 0.12)',
        paddingTop: '6px',
      },
      weatherCity: {
        fontSize: '11px',
        fontWeight: '600',
        opacity: 0.9,
      },
      weatherTemp: {
        fontSize: '26px',
        fontWeight: '700',
        margin: '2px 0',
      },
      hourItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '8.5px',
        gap: '1px',
      },
      calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
        height: '100%',
        justifyContent: 'space-between',
      },
      calendarDaysHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '7.5px',
        fontWeight: '700',
        color: '#A8A7A5',
        textAlign: 'center',
      },
      calendarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        rowGap: '4px',
        columnGap: '2px',
        marginTop: '4px',
      },
      dayCell: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '1/1',
        width: '16px',
        height: '16px',
        margin: '0 auto',
        boxSizing: 'border-box',
      },
      dayNumber: {
        fontSize: '9px',
        fontWeight: '500',
        color: '#151414',
      },
    };
    const galleryStyles: Record<string, React.CSSProperties> = {
      tabsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(21, 20, 20, 0.08)',
        paddingBottom: '4px',
        marginBottom: '20px',
      },
      tabButton: {
        background: 'none',
        border: 'none',
        outline: 'none',
        padding: '10px 12px',
        fontSize: '15px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s ease',
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box',
      },
      card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
        position: 'relative',
        width: '100%',
        height: '190px',
        overflow: 'visible',
      },
      imageWrapper: {
        width: '100%',
        height: '160px',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#E6E5E3',
        flexShrink: 0,
      },
      cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      cardTitle: {
        fontSize: '11px',
        fontWeight: '500',
        color: '#151414',
        paddingLeft: '2px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      },
      itemCount: {
        fontSize: '11px',
        color: '#8B8A89',
        fontWeight: '500',
        marginTop: '4px',
        marginBottom: '12px',
        paddingLeft: '2px',
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      outfitPreviewGrid: {
        width: '100%',
        height: '100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '3px',
        backgroundColor: '#E6E5E3',
        borderRadius: '10px',
        padding: '3px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      },
      gridImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '6px',
      },
      emptyState: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '40px 20px',
        color: '#6B6A69',
        fontSize: '14px',
      },
      deleteBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'rgba(21, 20, 20, 0.75)',
        color: '#FFFFFF',
        border: 'none',
        outline: 'none',
        fontSize: '9px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        transition: 'background-color 0.2s ease',
      },
      confirmBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 99998,
      },
      confirmBox: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        maxWidth: '320px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.12)',
        zIndex: 99999,
        boxSizing: 'border-box',
        textAlign: 'center',
      },
      confirmText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#151414',
        lineHeight: '1.4',
        fontFamily: 'Inter, sans-serif',
      },
      confirmActions: {
        display: 'flex',
        gap: '10px',
      },
      confirmDeleteBtn: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#E57373',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      },
      confirmCancelBtn: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#E6E5E3',
        color: '#151414',
        border: 'none',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      },
      tabsAndSearch: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      },
      filterRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr auto',
        gap: '8px',
        marginBottom: '16px',
        alignItems: 'center',
      },
      filterSelect: {
        width: '100%',
        padding: '8px 24px 8px 8px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#FFFFFF',
        fontSize: '11px',
        color: '#151414',
        outline: 'none',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.03)',
        textAlign: 'left',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23151414' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      },
      searchCircle: {
        flexShrink: 0,
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      },
    };
    const searchModalStyles: Record<string, React.CSSProperties> = {
      backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 99998,
      },
      box: {
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        maxWidth: '340px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 99999,
        boxSizing: 'border-box',
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
      },
      title: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#151414',
        letterSpacing: '1px',
      },
      closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: '#8B8A89',
        cursor: 'pointer',
        padding: '4px',
      },
      inputWrapper: {
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      },
      input: {
        width: '100%',
        padding: '14px 16px',
        paddingRight: '80px',
        borderRadius: '14px',
        border: 'none',
        backgroundColor: '#E6E5E3',
        color: '#151414',
        fontSize: '15px',
        boxSizing: 'border-box',
        outline: 'none',
        fontFamily: 'Inter, sans-serif',
      },
      clearBtn: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        color: '#6B6A69',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
      },
      applyBtn: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#151414',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      },
    };
    const cartPageStyles: Record<string, React.CSSProperties> = {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        boxSizing: 'border-box',
      },
      infoBanner: {
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#6B6A69',
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: '1.4',
        border: '1px solid rgba(21, 20, 20, 0.05)',
        fontFamily: 'Inter, sans-serif',
      },
      daysLeftBadge: {
    position: 'absolute',
    bottom: '6px',
    left: '6px',
    backgroundColor: 'rgba(21, 20, 20, 0.8)',
    color: '#FFFFFF',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '600',
    zIndex: 5,
    backdropFilter: 'blur(4px)',
    letterSpacing: '0.5px',
  },
      emptyIcon: {},
      emptyText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#151414',
        marginBottom: '8px',
        fontFamily: 'Inter, sans-serif',
      },
      emptySubtext: {
        fontSize: '14px',
        color: '#6B6A69',
        lineHeight: '1.5',
        margin: '0',
        maxWidth: '260px',
        fontFamily: 'Inter, sans-serif',
      },
      restoreBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(21, 20, 20, 0.8)',
        color: '#FFFFFF',
        border: 'none',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
      },
    };
    const itemModalStyles: Record<string, React.CSSProperties> = {
      backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 99998,
      },
      box: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        maxWidth: '340px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 99999,
        boxSizing: 'border-box',
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#151414',
        textTransform: 'uppercase',
      },
      closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: '#8B8A89',
        cursor: 'pointer',
      },
      imageContainer: {
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#E6E5E3',
      },
      image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      tagsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '4px',
      },
      tagRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
        borderBottom: '0.5px solid rgba(21, 20, 20, 0.05)',
      },
      tagLabel: {
        fontSize: '13px',
        color: '#8B8A89',
        fontFamily: 'Inter, sans-serif',
      },
      tagBadge: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#151414',
        backgroundColor: '#E6E5E3',
        padding: '4px 10px',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
      },
    };
    
    export default App;
    export { getTheme, СЕЗОНЫ, ЦВЕТА, МАТЕРИАЛЫ, КАТЕГОРИИ, useMediaQuery, useTelegram };