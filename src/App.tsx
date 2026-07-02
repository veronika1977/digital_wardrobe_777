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
  { id: "outerwear", name: "Верхняя одежда" },
  { id: "top", name: "Верх" },
  { id: "bottom", name: "Низ" },
  { id: "shoes", name: "Обувь" },
  { id: "bags", name: "Сумки" },
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

const WelcomeScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: 'ЦИФРОВОЙ ГАРДЕРОБ',
      text: 'Добро пожаловать в ваш персональный стилист-ассистент. Составляйте образы, управляйте капсулами и планируйте гардероб в один клик.',
      btnText: 'Далее'
    },
    {
      title: 'УМНЫЕ КАПСУЛЫ',
      text: 'Группируйте вещи по сезонам и стилям. Наше приложение подскажет, каких элементов не хватает для идеального сезонного набора.',
      btnText: 'Далее'
    },
    {
      title: 'ГОТОВЫЕ АУТФИТЫ',
      text: 'Генерация и сохранение стильных луков на каждый день с учётом актуальной погоды за окном.',
      btnText: 'Начать работу'
    }
  ];

  const currentSlide = slides[step];
  const isLastStep = step === slides.length - 1;

  return (
    <div style={welcomeStyles.container}>
      {/* Логотип */}
      <div style={welcomeStyles.logoContainer}>
        <img src="/Icon.png" alt="VS Logo" style={welcomeStyles.logo} />
      </div>

      {/* Контент слайда */}
      <div style={welcomeStyles.content}>
        <h1 style={welcomeStyles.title} className="fancy-serif">{currentSlide.title}</h1>
        <p style={welcomeStyles.text}>{currentSlide.text}</p>
      </div>

      {/* Кнопка */}
      <button
        onClick={() => {
          if (isLastStep) {
            onFinish();
          } else {
            setStep(step + 1);
          }
        }}
        style={welcomeStyles.button}
      >
        {currentSlide.btnText}
      </button>

      {/* Индикаторы шагов (точки снизу) */}
      <div style={welcomeStyles.dotsContainer}>
        {slides.map((_, idx) => (
          <div
            key={idx}
            style={{
              ...welcomeStyles.dot,
              backgroundColor: idx === step ? '#151414' : '#D4D3D1',
              width: idx === step ? '24px' : '8px'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const welcomeStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#F2F1EF', // Светлый фон как на скринах
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '60px 32px 40px 32px',
    boxSizing: 'border-box',
    zIndex: 999999,
  },
  logoContainer: {
    marginTop: '10vh',
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '24px',
    maxWidth: '320px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '400',
    color: '#151414',
    margin: 0,
    letterSpacing: '1px',
    lineHeight: '1.2',
  },
  text: {
    fontSize: '16px',
    color: '#6B6A69',
    lineHeight: '1.6',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  },
  button: {
    width: '100%',
    maxWidth: '320px',
    padding: '18px',
    backgroundColor: '#151414',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '16px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0px 8px 24px rgba(21, 20, 20, 0.15)',
  },
  dotsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  }
};

const POPULAR_CITIES = [
  { name: 'Москва', lat: 55.7558, lon: 37.6173 },
  { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351 },
  { name: 'Казань', lat: 55.7964, lon: 49.1089 },
  { name: 'Новосибирск', lat: 55.0084, lon: 82.9357 },
  { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 },
  { name: 'Нижний Новгород', lat: 56.2965, lon: 43.9361 },
  { name: 'Краснодар', lat: 45.0355, lon: 38.9753 },
  { name: 'Сочи', lat: 43.6028, lon: 39.7342 },
  { name: 'Иннополис', lat: 55.45, lon: 48.44 },
  { name: 'Владивосток', lat: 43.1198, lon: 131.8869 },
];

function App() {
    const { initData, isTelegram, haptic } = useTelegram();
    const [outfitCreatedMessage, setOutfitCreatedMessage] = useState<string | null>(null);
    const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
    const [searchCityQuery, setSearchCityQuery] = useState('');
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [networkError, setNetworkError] = useState(false);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
    const [wearRecords, setWearRecords] = useState<any[]>([]);
    const [selectedDateForOutfit, setSelectedDateForOutfit] = useState<string | null>(null);
    const [isOutfitPickerOpen, setIsOutfitPickerOpen] = useState(false);
    const [deleteOutfitConfirm, setDeleteOutfitConfirm] = useState<{ recordId: number; date: string } | null>(null);
    const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
    const [token, setToken] = useLocalStorage<string | null>('jwt_token', null);
    const [cartItemModal, setCartItemModal] = useState<any | null>(null);
    const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage<boolean>('has_seen_welcome_v2', false);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const [permanentDeleteSuccess, setPermanentDeleteSuccess] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingOutfit, setIsSavingOutfit] = useState(false);
    const [isSavingCapsule, setIsSavingCapsule] = useState(false);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [isWeatherWidgetActive, setIsWeatherWidgetActive] = useState(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);
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
    const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState<{ id: number; type: 'clothes' | 'outfits' | 'capsules' } | null>(null);
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
                mappedTrashClothes = data.map((i: any) => ({
                    ...i,
                    img: getFullImageUrl(i.image_url),
                    deletedAt: i.deleted_at || i.deletedAt || new Date().toISOString()
                }));
                setTrashClothes(mappedTrashClothes);
            }

            const outfitsRes = await fetch(`${API_BASE_URL}/outfits/trash`, { headers });
            if (outfitsRes.ok) {
                const data = await outfitsRes.json();
                // Используем Promise.all, чтобы при необходимости дозапросить вещи
                const mappedTrashOutfits = await Promise.all(data.map(async (o: any) => {
                    let rawItems = o.items || [];
                    // Если бэк не вернул items для удаленного образа, запрашиваем их вручную
                    if (rawItems.length === 0 && o.id) {
                        try {
                            const itemsRes = await fetch(`${API_BASE_URL}/outfits/${o.id}/items`, { headers });
                            if (itemsRes.ok) rawItems = await itemsRes.json();
                        } catch (e) { console.error(e); }
                    }
                    
                    return {
                        ...o,
                        items: rawItems.map((item: any) => {
                            // ✅ ИСПРАВЛЕНО: Читаем clothing_item_id и используем String() для поиска
                            const cId = item.clothing_item_id || item.clothing_id || item.id;
                            const cloth = [...mappedTrashClothes, ...clothes].find((c: any) => String(c.id) === String(cId));
                            return { 
                                ...item, 
                                id: cId, 
                                img: getFullImageUrl(item.image_url || cloth?.img || item.img) 
                            };
                        })
                    };
                }));
                setTrashOutfits(mappedTrashOutfits);
            }

            const capsulesRes = await fetch(`${API_BASE_URL}/capsules/trash`, { headers });
            if (capsulesRes.ok) {
                const data = await capsulesRes.json();
                const mappedTrashCapsules = await Promise.all(data.map(async (c: any) => {
                    // Маппим вещи самой капсулы
                    const mappedItems = (c.items || []).map((item: any) => {
                        const cId = typeof item === 'number' || typeof item === 'string' ? item : (item.clothing_item_id || item.clothing_id || item.id);
                        let img = typeof item === 'object' && item.image_url ? getFullImageUrl(item.image_url) : null;
                        if (!img) {
                            const cloth = [...mappedTrashClothes, ...clothes].find((cl: any) => String(cl.id) === String(cId));
                            img = cloth?.img || '/placeholder.png';
                        }
                        return { id: cId, img: img, name: (typeof item === 'object' ? item.name : '') };
                    });

                    // Маппим образы внутри капсулы (с дозапросом, если нужно)
                    const mappedOutfits = await Promise.all((c.outfits || []).map(async (o: any) => {
                        let rawItems = o.items || [];
                        if (rawItems.length === 0 && o.id) {
                            try {
                                const itemsRes = await fetch(`${API_BASE_URL}/outfits/${o.id}/items`, { headers });
                                if (itemsRes.ok) rawItems = await itemsRes.json();
                            } catch (e) {}
                        }
                        return {
                            ...o,
                            items: rawItems.map((item: any) => {
                                const cId = item.clothing_item_id || item.clothing_id || item.id;
                                const cloth = [...mappedTrashClothes, ...clothes].find((cl: any) => String(cl.id) === String(cId));
                                return { 
                                    ...item, 
                                    id: cId, 
                                    img: getFullImageUrl(item.image_url || cloth?.img || '/placeholder.png'),
                                    x: item.x || 0, y: item.y || 0, scale: item.scale || 1
                                };
                            })
                        };
                    }));

                    return { ...c, items: mappedItems, outfits: mappedOutfits };
                }));
                setTrashCapsules(mappedTrashCapsules);
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            if (isNetworkError(error)) {
                setNetworkError(true);
            }
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

    const executePermanentDelete = async () => {
        if (!permanentDeleteConfirm) return;
        const { id, type } = permanentDeleteConfirm;
        try {
            const response = await fetch(`${API_BASE_URL}/${type}/${id}/permanent`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Не удалось удалить навсегда');
            await fetchCart();

            setPermanentDeleteSuccess(type);
            setPermanentDeleteConfirm(null);
            setTimeout(() => {
                setPermanentDeleteSuccess(null);
            }, 2000);
        } catch (e) {
            console.error(e);
            alert('Ошибка при безвозвратном удалении');
            setPermanentDeleteConfirm(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { id, type } = deleteConfirm;
        haptic('heavy');

        if (!token) {
            alert('Ошибка: Вы не авторизованы');
            setDeleteConfirm(null);
            return;
        }

        const endpoints: any = {
            clothes: 'clothes',
            outfits: 'outfits',
            capsules: 'capsules'
        };

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoints[type]}/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 404) {
                    console.warn('Элемент уже удален или не найден на сервере.');
                } else {
                    throw new Error(errorData.detail || `Ошибка удаления: ${response.status}`);
                }
            }

            const now = new Date().toISOString();

            let successText = '';
            if (type === 'clothes') successText = 'Вещь перенесена в корзину';
            if (type === 'outfits') successText = 'Образ перенесен в корзину';
            if (type === 'capsules') successText = 'Капсула перенесена в корзину';

            if (type === 'clothes') {
                setClothes(prev => prev.map(item =>
                    item.id === id ? { ...item, deletedAt: now } : item
                ));

                setOutfits(prev => prev.map(outfit => {
                    if (outfit.deletedAt) return outfit;
                    const remainingItems = (outfit.items || []).filter((i: any) => i.id !== id);

                    if (remainingItems.length === 0) {
                        if (selectedOutfitForView?.id === outfit.id) {
                            setSelectedOutfitForView(null);
                        }
                        return { ...outfit, deletedAt: now, items: [] };
                    }
                    return { ...outfit, items: remainingItems };
                }));

                setCapsules(prev => prev.map(capsule => {
                    if (capsule.deletedAt) return capsule;
                    const remainingItems = (capsule.items || []).filter((i: any) => i.id !== id);
                    const remainingOutfits = (capsule.outfits || []).map((o: any) => ({
                        ...o,
                        items: (o.items || []).filter((i: any) => i.id !== id)
                    })).filter((o: any) => o.items.length > 0);

                    if (remainingItems.length === 0) {
                        if (selectedCapsuleForView?.id === capsule.id) {
                            setSelectedCapsuleForView(null);
                        }
                        return { ...capsule, deletedAt: now, items: [], outfits: [] };
                    }
                    return { ...capsule, items: remainingItems, outfits: remainingOutfits };
                }));

                if (selectedOutfitForView && !selectedOutfitForView.deletedAt) {
                    const updatedItems = selectedOutfitForView.items.filter((i: any) => i.id !== id);
                    if (updatedItems.length < selectedOutfitForView.items.length) {
                        setSelectedOutfitForView({ ...selectedOutfitForView, items: updatedItems });
                    }
                }

            } else if (type === 'outfits') {
                setOutfits(prev => prev.map(item =>
                    item.id === id ? { ...item, deletedAt: now } : item
                ));
                if (selectedOutfitForView?.id === id) {
                    setSelectedOutfitForView(null);
                }
            } else if (type === 'capsules') {
                setCapsules(prev => prev.map(item =>
                    item.id === id ? { ...item, deletedAt: now } : item
                ));
                if (editingCapsuleId === id) setIsCapsuleCreatorOpen(false);
                if (selectedCapsuleForView?.id === id) {
                    setSelectedCapsuleForView(null);
                }
            }

            if (currentScreen === 'cart') {
                await fetchCart();
            }

            setDeleteSuccessMessage(successText);
            setTimeout(() => setDeleteSuccessMessage(null), 2500);

        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert(error instanceof Error ? error.message : 'Не удалось удалить элемент');
        } finally {
            setDeleteConfirm(null);
        }
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

    const isNetworkError = (error: any): boolean => {
        if (!error) return false;
        const msg = error.message || String(error);
        return (
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            msg.includes('ERR_') ||
            msg.includes('net::') ||
            msg.includes('Load failed') ||
            msg.includes('Network request failed')
        );
    };

    const getCityName = async (lat: number, lon: number): Promise<string> => {
        try {
            const API_KEY = 'bdc_517a7acc074b4c32858f1b2694c3d4fd';
            // ✅ ДОБАВЛЕН КЛЮЧ В URL
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru&key=${API_KEY}`
            );
            if (!response.ok) throw new Error('BigDataCloud error');
            const data = await response.json();
            console.log('📍 Данные геолокации:', data);
            return data.city || data.locality || data.principalSubdivision || 'Моё местоположение';
        } catch (error) {
            console.warn('Не удалось получить название города:', error);
            return 'Моё местоположение';
        }
    };

    const fetchWeather = async (forcedLocation?: { lat: number, lon: number, city: string }) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
        let LAT = 0;
        let LON = 0;
        let city = '';

        // ✅ ЕСЛИ ПЕРЕДАЛИ ПРИНУДИТЕЛЬНЫЕ КООРДИНАТЫ (ВЫБОР ГОРОДА ИЛИ ГЕОЛОКАЦИЯ) - ИСПОЛЬЗУЕМ ИХ
        if (forcedLocation) {
            LAT = forcedLocation.lat;
            LON = forcedLocation.lon;
            city = forcedLocation.city;
            console.log('✅ [Гео] Используем принудительно переданный город:', city, LAT, LON);
        } else {
            // ===== ШАГ 1: Читаем ТОЛЬКО с бэкенда =====
            try {
                const locationRes = await fetch(`${API_BASE_URL}/weather/location`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (locationRes.ok) {
                    const locData = await locationRes.json();
                    console.log('🔍 [Гео] Сырые данные с бэка:', JSON.stringify(locData));
                    
                    // Гибкий парсинг
                    const lat = locData?.latitude ?? locData?.lat ?? locData?.data?.latitude ?? locData?.data?.lat;
                    const lon = locData?.longitude ?? locData?.lon ?? locData?.lng ?? locData?.data?.longitude ?? locData?.data?.lon ?? locData?.data?.lng;
                    
                    if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
                        LAT = Number(lat);
                        LON = Number(lon);
                        city = locData?.city ?? locData?.data?.city ?? locData?.name ?? '';
                        console.log('✅ [Гео] Загружено с бэкенда:', LAT, LON, city);
                    }
                } else {
                    console.warn('⚠️ [Гео] Бэк вернул статус:', locationRes.status);
                }
            } catch (e) {
                console.warn('⚠️ [Гео] Ошибка запроса к бэку:', e);
            }

            // ===== ШАГ 2: Если на бэке пусто — показываем заглушку =====
            if (!LAT || !LON) {
                console.warn('⚠️ [Гео] На бэке нет данных о локации. Показываем заглушку.');
                setWeatherData(null);
                setIsLoadingWeather(false);
                return;
            }
        }

        // ===== ШАГ 3: Запрашиваем погоду (Open-Meteo) =====
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weathercode&timezone=auto`
        );
        if (!response.ok) throw new Error('Ошибка погоды');
        
        const data = await response.json();
        const hourly = data.hourly;
        if (!hourly || !hourly.time || hourly.time.length === 0) {
            throw new Error('Пустой ответ от API');
        }

        const now = new Date();
        const today = now.getDate();
        const todayMonth = now.getMonth();
        const todayYear = now.getFullYear();

        let currentHourIndex = hourly.time.findIndex((t: string) => {
            const timeDate = new Date(t);
            return (
                timeDate.getFullYear() === todayYear &&
                timeDate.getMonth() === todayMonth &&
                timeDate.getDate() === today &&
                timeDate.getHours() === now.getHours()
            );
        });

        if (currentHourIndex === -1) {
            for (let i = hourly.time.length - 1; i >= 0; i--) {
                if (new Date(hourly.time[i]) <= now) {
                    currentHourIndex = i;
                    break;
                }
            }
            if (currentHourIndex === -1) currentHourIndex = 0;
        }

        const currentTemp = Math.round(hourly.temperature_2m[currentHourIndex]);
        const currentWeatherCode = hourly.weathercode[currentHourIndex];

        const getAvgTempAndWeather = (startHour: number, endHour: number) => {
            const temps: number[] = [];
            const weatherCodes: number[] = [];
            for (let i = 0; i < hourly.time.length; i++) {
                const timeDate = new Date(hourly.time[i]);
                const h = timeDate.getHours();
                const day = timeDate.getDate();
                const month = timeDate.getMonth();
                const year = timeDate.getFullYear();
                if (day === today && month === todayMonth && year === todayYear && h >= startHour && h <= endHour) {
                    temps.push(hourly.temperature_2m[i]);
                    weatherCodes.push(hourly.weathercode[i]);
                }
            }
            if (temps.length === 0) return { temp: null, weatherCode: null };
            
            const freq: Record<number, number> = {};
            weatherCodes.forEach(code => { freq[code] = (freq[code] || 0) + 1; });
            let mostCommonCode = weatherCodes[0];
            let maxCount = 0;
            for (const code in freq) {
                if (freq[Number(code)] > maxCount) {
                    maxCount = freq[Number(code)];
                    mostCommonCode = Number(code);
                }
            }
            return {
                temp: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
                weatherCode: mostCommonCode
            };
        };

        setWeatherData({
            temp: currentTemp,
            weatherCode: currentWeatherCode,
            city: city,
            morning: getAvgTempAndWeather(6, 11),
            day: getAvgTempAndWeather(12, 17),
            evening: getAvgTempAndWeather(18, 23),
        });
    } catch (error) {
        console.error('❌ [Гео] Не удалось загрузить погоду:', error);
        setWeatherError('Сервис погоды недоступен');
        setWeatherData(null);
    } finally {
        setIsLoadingWeather(false);
    }
};

    const deleteWearRecord = async (recordId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/wear-records/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Ошибка удаления');
        
        setWearRecords(prev => prev.filter(r => r.id !== recordId));
        haptic('medium');
        return true;
    } catch (e) {
        console.error(e);
        alert('Не удалось удалить запись');
        return false;
    }
    };

    const getWeatherEmoji = (code: number | null): string => {
    if (code === null) return '';
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '🌤️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌦️';
    if (code >= 61 && code <= 67) return '️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌡️';
    };

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

            if (e.cancelable) {
            e.preventDefault();
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setCanvasItems(prev => prev.map(item => {
            if (item.id === activeDragId) {
                let newX = clientX - dragOffset.x;
                let newY = clientY - dragOffset.y;

                const itemWidth = 110 * (item.scale || 1);
                const itemHeight = 110 * (item.scale || 1);
                newX = Math.max(0, Math.min(315 - itemWidth, newX));
                newY = Math.max(0, Math.min(480 - itemHeight, newY));

                return { ...item, x: newX, y: newY };
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
                let newX = clientX - capsuleDragOffset.x;
                let newY = clientY - capsuleDragOffset.y;

                const itemWidth = 110 * (item.scale || 1);
                const itemHeight = 110 * (item.scale || 1);
                newX = Math.max(0, Math.min(280 - itemWidth, newX));
                newY = Math.max(0, Math.min(370 - itemHeight, newY));

                return { ...item, x: newX, y: newY };
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
        if (restoreSuccess) {
            const timer = setTimeout(() => {
                setRestoreSuccess(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [restoreSuccess]);

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

      /* ✅ НОВОЕ: Поворот стрелки у select при фокусе */
select:focus {
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23151414' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 15 12 9 18 15'></polyline></svg>") !important;
background-repeat: no-repeat !important;
background-position: right 8px center !important;
background-size: 12px !important;
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
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
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
                console.error('Ошибка загрузки данных:', error);
                if (isNetworkError(error)) {
                    setNetworkError(true);
                }
            }

            try {
                const outfitsRes = await fetch(`${API_BASE_URL}/outfits/`, { headers });
                if (outfitsRes.ok) {
                    const rawOutfits = await outfitsRes.json();
                    const outfitsWithItems = await Promise.all(
                        rawOutfits.map(async (o: any) => {
                            try {
                                const itemsRes = await fetch(`${API_BASE_URL}/outfits/${o.id}/items`, { headers });
                                let outfitItems: any[] = [];
                                if (itemsRes.ok) {
                                    const rawItems = await itemsRes.json();
                                    outfitItems = rawItems.map((item: any) => {
                                        // ✅ ИСПРАВЛЕНО: Приоритет отдаем clothing_item_id, который возвращает бэкенд
                                        const cId = item.clothing_item_id || item.clothing_id || item.id; 
                                        const cloth = mappedClothes.find((c: any) => c.id === cId);
                                        return {
                                            ...item,
                                            id: cId,
                                            outfit_item_id: item.id, // Сохраняем ID записи на всякий случай
                                            img: getFullImageUrl(item.image_url || cloth?.img || '/placeholder.png'),
                                            x: item.x || 0,
                                            y: item.y || 0,
                                            scale: item.scale || 1
                                        };
                                    });
                                }
                                return {
                                    ...o,
                                    createdAt: o.created_at || o.createdAt,
                                    deletedAt: o.deleted_at || o.deletedAt,
                                    items: outfitItems
                                };
                            } catch (e) {
                                console.error(`Не удалось загрузить вещи для образа ${o.id}:`, e);
                                return { ...o, items: [] };
                            }
                        })
                    );
                    setOutfits(outfitsWithItems);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (isNetworkError(error)) {
                    setNetworkError(true);
                }
            }

           // 3. ЗАГРУЖАЕМ КАПСУЛЫ
try {
    const capsulesRes = await fetch(`${API_BASE_URL}/capsules/`, { headers });
    if (capsulesRes.ok) {
        const rawCapsules = await capsulesRes.json();
        const mappedCapsules = rawCapsules.map((c: any) => {
            // 1. Маппим вещи самой капсулы (для превью сетки)
            const mappedItems = (c.items || []).map((item: any) => {
                const cId = typeof item === 'number' || typeof item === 'string' ? item : (item.id || item.clothing_id);
                // Бэк может вернуть полные объекты вещей с image_url
                let img = typeof item === 'object' && item.image_url ? getFullImageUrl(item.image_url) : null;
                if (!img) {
                    const cloth = mappedClothes.find(cl => String(cl.id) === String(cId));
                    img = cloth?.img || '/placeholder.png';
                }
                return {
                    id: cId,
                    img: img,
                    name: (typeof item === 'object' ? item.name : '') || (mappedClothes.find(cl => String(cl.id) === String(cId))?.name || '')
                };
            });
            
            // 2. Маппим образы внутри капсулы
            const mappedOutfits = (c.outfits || []).map((o: any) => ({
                ...o,
                items: (o.items || []).map((item: any) => {
                    const cId = item.clothing_id || item.id;
                    const cloth = mappedClothes.find(cl => String(cl.id) === String(cId));
                    return {
                        ...item,
                        id: cId,
                        // ИСПРАВЛЕНО: Используем image_url из ответа, если есть, 
                        // иначе берем из mappedClothes (там поле img, а не image_url)
                        img: getFullImageUrl(item.image_url || cloth?.img || '/placeholder.png'),
                        x: item.x || 0,
                        y: item.y || 0,
                        scale: item.scale || 1
                    };
                })
            }));

            return {
                ...c,
                createdAt: c.created_at || c.createdAt,
                deletedAt: c.is_deleted ? (c.deleted_at || new Date().toISOString()) : null,
                items: mappedItems,
                outfits: mappedOutfits
            };
        });
        setCapsules(mappedCapsules);
    }
} catch (error) {
    console.error('Ошибка загрузки данных:', error);
    if (isNetworkError(error)) {
        setNetworkError(true);
    }
}
            try {
                const wearRes = await fetch(`${API_BASE_URL}/wear-records/`, { headers });
                if (wearRes.ok) {
                    const records = await wearRes.json();
                    setWearRecords(records);
                }
                } catch (error) {
                    console.error('Ошибка загрузки данных:', error);
                    if (isNetworkError(error)) {
                        setNetworkError(true);
                    }
                }

            // 4. ЗАГРУЖАЕМ ЗАПИСИ О НАДЕТЫХ ОБРАЗАХ
            try {
                const wearRes = await fetch(`${API_BASE_URL}/wear-records/`, { headers });
                if (wearRes.ok) {
                    const records = await wearRes.json();
                    setWearRecords(records);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (isNetworkError(error)) {
                    setNetworkError(true);
                }
            }
        };

        fetchAllData();
        fetchWeather();
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
        <div 
            style={{ minHeight: '100vh', backgroundColor: '#edecea', position: 'relative', width: '100%', boxSizing: 'border-box' }}
            onClick={() => {
                // Закрываем виджет погоды при клике вне его
                if (isWeatherWidgetActive) {
                    setIsWeatherWidgetActive(false);
                }
            }}
        >
            {!isAuthLoading && !hasSeenWelcome ? (
                <WelcomeScreen onFinish={() => {
                    setHasSeenWelcome(true);
                    haptic('medium');
                }} />
            ) : !isAuthLoading ? (
                <>
                    {currentScreen === 'home' && (
                        <div style={{
    width: '100%',
    height: '100vh', // ✅ На весь экран
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '16px 16px 100px 16px', // ✅ Увеличили отступ снизу, чтобы кнопка не пряталась под навбар
    boxSizing: 'border-box',
    overflowY: 'auto', // ✅ Разрешаем скролл, если контент не влезает
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    display: 'flex', // ✅ Делаем флексом
    flexDirection: 'column', // ✅ Колонкой
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
                            <div style={{ ...outfitStyles.sectionContainer, flexShrink: 0 }}>
                                <h2 style={outfitStyles.sectionTitle} className="fancy-serif">Образ сегодня</h2>
                                <div style={outfitStyles.mainRow}>
                                    <div style={outfitStyles.outfitCard}>
                                        {(() => {
                                        const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
                                        
                                        const todayRecord = wearRecords.find(r => r.worn_date === todayStr);
                                        const todayOutfit = todayRecord ? outfits.find(o => o.id === todayRecord.outfit_id) : null;
                                        
                                        if (todayOutfit) {
                                            return (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={outfitStyles.itemsGrid}>
                                                        {todayOutfit.items.slice(0, 4).map((item: any, idx: number) => (
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
                                        }
                                        
                                        return (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={outfitStyles.emptyGrid}>
                                                    <span style={{ fontSize: '11px', color: '#8B8A89', textAlign: 'center', padding: '0 4px' }}>
                                                        Нет образа на сегодня
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                        </div>
                                    <div style={widgetStyles.weatherCard}>
    {/* 1. ШАПКА: Только город (без кнопки) */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={widgetStyles.weatherCity}>
            {weatherData?.city || 'Местоположение'}
        </div>
    </div>

    {/* 2. ОСНОВНОЙ КОНТЕНТ */}
    {isLoadingWeather ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#8B8A89' }}>Загрузка...</span>
        </div>
    ) : weatherError ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>️</span>
            <span style={{ fontSize: '12px', color: '#E57373', fontWeight: '600', textAlign: 'center' }}>
                {weatherError}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setWeatherError(null);
                    fetchWeather();
                }}
                style={{
                    marginTop: '4px',
                    padding: '6px 14px',
                    backgroundColor: '#151414',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}
            >
                Повторить
            </button>
        </div>
    ) : !weatherData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
            <span style={{ fontSize: '11px', color: '#8B8A89', textAlign: 'center', lineHeight: '1.4' }}>
                Нет данных о местоположении,<br />выберите город
            </span>
        </div>
    ) : (
        <>
            {/* ✅ ТЕМПЕРАТУРА + КНОПКА "ИЗМЕНИТЬ" В ОДНОМ РЯДУ */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px'
            }}>
                <div style={widgetStyles.weatherTemp}>
                    {getWeatherEmoji(weatherData.weatherCode)} {weatherData.temp > 0 ? '+' : ''}{weatherData.temp}°
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCityPickerOpen(true);
                        haptic('light');
                    }}
                    style={{
                        fontSize: '10px',
                        color: '#8B8A89',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: '4px 0',
                        flexShrink: 0
                    }}
                >
                    Изменить
                </button>
            </div>

            {/* ПРОГНОЗ */}
            <div style={widgetStyles.hourlyRow}>
                <div style={widgetStyles.hourItem}>
                    <div>Утро</div>
                    <div style={{ fontWeight: '600' }}>
                        {weatherData.morning?.temp !== null && weatherData.morning?.temp !== undefined
                            ? `${weatherData.morning.temp > 0 ? '+' : ''}${weatherData.morning.temp}°`
                            : '—'}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        {getWeatherEmoji(weatherData.morning?.weatherCode)}
                    </div>
                </div>
                <div style={widgetStyles.hourItem}>
                    <div>День</div>
                    <div style={{ fontWeight: '600' }}>
                        {weatherData.day?.temp !== null && weatherData.day?.temp !== undefined
                            ? `${weatherData.day.temp > 0 ? '+' : ''}${weatherData.day.temp}°`
                            : '—'}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        {getWeatherEmoji(weatherData.day?.weatherCode)}
                    </div>
                </div>
                <div style={widgetStyles.hourItem}>
                    <div>Вечер</div>
                    <div style={{ fontWeight: '600' }}>
                        {weatherData.evening?.temp !== null && weatherData.evening?.temp !== undefined
                            ? `${weatherData.evening.temp > 0 ? '+' : ''}${weatherData.evening.temp}°`
                            : '—'}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        {getWeatherEmoji(weatherData.evening?.weatherCode)}
                    </div>
                </div>
            </div>
        </>
    )}
</div>
                                    <div style={widgetStyles.calendarCard}>
                                        <div style={{ 
                                            fontSize: '11px', 
                                            fontWeight: '600', 
                                            color: '#151414', 
                                            textAlign: 'center', 
                                            marginBottom: '4px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                        </div>
                                        
                                        <div style={widgetStyles.calendarDaysHeader}>
                                            <span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span><span>ПТ</span><span>СБ</span><span>ВС</span>
                                        </div>
                                        <div style={widgetStyles.calendarGrid}>
                                            {calendarDays.map((item, idx) => {
                                            const hasOutfit = item.day && wearRecords.some(r => {
                                                if (!item.day) return false;
                                                const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                                                return r.worn_date === dateStr;
                                            });
                                            
                                            return (
                                                <div
                                                key={idx}
                                                onClick={() => {
                                                    if (item.day) {
                                                    const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                                                    setSelectedDateForOutfit(dateStr);
                                                    setIsOutfitPickerOpen(true);
                                                    haptic('light');
                                                    }
                                                }}
                                                style={{
                                                    ...widgetStyles.dayCell,
                                                    backgroundColor: item.isToday ? '#151414' : hasOutfit ? '#E8F5E9' : 'transparent',
                                                    borderRadius: item.isToday ? '50%' : '6px',
                                                    cursor: item.day ? 'pointer' : 'default',
                                                    position: 'relative'
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
                                                {hasOutfit && !item.isToday && (
                                                    <div style={{
                                                    position: 'absolute',
                                                    bottom: '1px',
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#4CAF50'
                                                    }} />
                                                )}
                                                </div>
                                            );
                                            })}
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
                                onCapsuleClick={async (capsule: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/capsules/${capsule.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            
            const localCapsule = capsules.find(c => c.id === capsule.id);
            const localOutfits = localCapsule?.outfits || [];
            
            const mappedCapsule = {
                ...data,
                id: data.id,
                name: data.name,
                createdAt: data.created_at || data.createdAt,
                deletedAt: data.is_deleted ? (data.deleted_at || new Date().toISOString()) : null,
                items: (data.items || []).map((ci: any) => {
                    const cId = ci.id;
                    let img = ci.image_url ? getFullImageUrl(ci.image_url) : null;
                    if (!img) {
                        const cloth = clothes.find(c => String(c.id) === String(cId));
                        img = cloth?.img || '/placeholder.png';
                    }
                    return { 
                        id: cId, 
                        img: img, 
                        name: ci.name || clothes.find(c => String(c.id) === String(cId))?.name || '' 
                    };
                }),
                outfits: data.outfits && data.outfits.length > 0 
                    ? data.outfits.map((o: any) => {
                        const outfitId = o.id;
                        return {
                            ...o,
                            id: outfitId,
                            items: (o.items || []).map((oi: any) => {
                                // ✅ ИСПРАВЛЕНО: Читаем clothing_item_id
                                const cId = oi.clothing_item_id || oi.clothing_id || oi.id; 
                                let img = oi.image_url ? getFullImageUrl(oi.image_url) : null;
                                if (!img) {
                                    const cloth = clothes.find((c: any) => String(c.id) === String(cId));
                                    img = cloth?.img || '/placeholder.png';
                                }
                                return {
                                    ...oi,
                                    id: cId,
                                    outfit_item_id: oi.id,
                                    img: img,
                                    x: oi.x || 0,
                                    y: oi.y || 0,
                                    scale: oi.scale || 1
                                };
                            })
                        };
                    })
                    : localOutfits
            };
            
            setSelectedCapsuleForView(mappedCapsule);
        } else {
            setSelectedCapsuleForView(capsule);
        }
    } catch (e) {
        console.error(e);
        setSelectedCapsuleForView(capsule);
    }
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
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            setSelectedItemForView({ ...item, isFromTrash: true });
                                                            haptic('light');
                                                        }}
                                                        style={{ ...galleryStyles.card, position: 'relative', cursor: 'pointer' }}
                                                    >
                                                        <div style={galleryStyles.imageWrapper}>
                                                            <img src={item.img} alt={item.name} style={galleryStyles.cardImage} />
                                                            {item.days_remaining !== undefined && item.days_remaining !== null && (
                                                                <div style={{
                                                                    ...cartPageStyles.daysLeftBadge,
                                                                    color: item.days_remaining <= 3 ? '#E57373' : '#FFFFFF'
                                                                }}>
                                                                    {`${item.days_remaining} дн.`}
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
                                                    <div
                                                        key={outfit.id}
                                                        onClick={() => {
                                                            setSelectedItemForView({ ...outfit, isDeletedOutfit: true, isFromTrash: true });
                                                            haptic('light');
                                                        }}
                                                        style={{ ...galleryStyles.card, position: 'relative', cursor: 'pointer' }}
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
                                                            {outfit.days_remaining !== undefined && outfit.days_remaining !== null && (
                                                                <div style={{
                                                                    ...cartPageStyles.daysLeftBadge,
                                                                    color: outfit.days_remaining <= 3 ? '#E57373' : '#FFFFFF'
                                                                }}>
                                                                    {`${outfit.days_remaining} дн.`}
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
                                                        <div
                                                            key={capsule.id}
                                                            onClick={() => {
                                                                setSelectedCapsuleForView({ ...capsule, isFromTrash: true });
                                                                haptic('light');
                                                            }}
                                                            style={{ ...galleryStyles.card, position: 'relative', cursor: 'pointer' }}
                                                        >
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
                                                                        {`${capsule.days_remaining} дн.`}
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
                                                                const headers = { 'Authorization': `Bearer ${token}` };
                                                                const clothesRes = await fetch(`${API_BASE_URL}/clothes/`, { headers });
                                                                if (clothesRes.ok) {
                                                                    const data = await clothesRes.json();
                                                                    setClothes(data.map((item: any) => ({
                                                                        id: item.id, name: item.name, category: item.category,
                                                                        color: item.color, season: item.season, material: item.material,
                                                                        img: getFullImageUrl(item.image_url),
                                                                        deletedAt: item.deleted_at ? new Date(item.deleted_at).toISOString() : null
                                                                    })));
                                                                }
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

                                    {cartItemModal && (
                                        <>
                                            <div onClick={() => setCartItemModal(null)} style={galleryStyles.confirmBackdrop} />
                                            <div style={galleryStyles.confirmBox}>
                                                <div style={{
                                                    width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden',
                                                    backgroundColor: '#E6E5E3', position: 'relative', marginBottom: '12px'
                                                }}>
                                                    {cartItemModal.type === 'clothes' && (
                                                        <img src={cartItemModal.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    )}
                                                    {cartItemModal.type === 'outfits' && (
                                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                            {(cartItemModal.items || []).map((item: any, idx: number) => {
                                                                const factor = 0.45;
                                                                return (
                                                                    <img key={idx} src={item.img} style={{
                                                                        position: 'absolute', left: `${item.x * factor}px`, top: `${item.y * factor}px`,
                                                                        width: `${110 * factor * (item.scale || 1)}px`, height: `${110 * factor * (item.scale || 1)}px`,
                                                                        objectFit: 'contain'
                                                                    }} alt="" />
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {cartItemModal.type === 'capsules' && (
                                                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, cartItemModal.items?.length || 1)}, 1fr)`, gap: '4px', padding: '8px', height: '100%' }}>
                                                            {cartItemModal.items?.slice(0, 8).map((item: any, idx: number) => (
                                                                <img key={idx} src={item.img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px' }} alt="" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <span style={{ fontSize: '18px', fontWeight: '600', color: '#151414', marginBottom: '4px' }}>{cartItemModal.name}</span>
                                                {cartItemModal.days_remaining !== undefined && (
                                                    <span style={{ fontSize: '13px', color: '#8B8A89', marginBottom: '16px' }}>Осталось дней: {cartItemModal.days_remaining}</span>
                                                )}

                                                <div style={galleryStyles.confirmActions}>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`${API_BASE_URL}/${cartItemModal.type}/${cartItemModal.id}/permanent`, {
                                                                    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
                                                                });
                                                                await fetchCart();
                                                                setCartItemModal(null);
                                                            } catch (e) { alert('Ошибка удаления'); }
                                                        }}
                                                        style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#E57373' }}
                                                    >
                                                        Удалить навсегда
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`${API_BASE_URL}/${cartItemModal.type}/${cartItemModal.id}/restore`, {
                                                                    method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
                                                                });

                                                                if (cartItemModal.type === 'clothes') {
                                                                    const res = await fetch(`${API_BASE_URL}/clothes/`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                                    if (res.ok) {
                                                                        const data = await res.json();
                                                                        setClothes(data.map((i: any) => ({
                                                                            ...i,
                                                                            img: getFullImageUrl(i.image_url),
                                                                            deletedAt: i.deleted_at ? new Date(i.deleted_at).toISOString() : null
                                                                        })));
                                                                    }
                                                                }

                                                                await fetchCart();
                                                                setCartItemModal(null);
                                                                setSelectedItemForView(null);
                                                                setRestoreSuccess(cartItemModal.type);
                                                                haptic('medium');
                                                            } catch (e) { alert('Ошибка восстановления'); }
                                                        }}
                                                        style={{ ...galleryStyles.confirmCancelBtn, backgroundColor: '#4CAF50', color: '#fff' }}
                                                    >
                                                        Восстановить
                                                    </button>
                                                </div>
                                                <button onClick={() => setCartItemModal(null)} style={{ background: 'none', border: 'none', color: '#8B8A89', marginTop: '8px', cursor: 'pointer' }}>Закрыть</button>
                                            </div>
                                        </>
                                    )}

                                    {permanentDeleteSuccess && (
                                        <>
                                            <div style={galleryStyles.confirmBackdrop} />
                                            <div style={galleryStyles.confirmBox}>
                                                <span style={{ ...galleryStyles.confirmText, color: '#E57373' }}>
                                                    {permanentDeleteSuccess === 'outfits'
                                                        ? 'Образ безвозвратно удален.'
                                                        : permanentDeleteSuccess === 'capsules'
                                                            ? 'Капсула безвозвратно удалена.'
                                                            : 'Вещь безвозвратно удалена.'}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {permanentDeleteConfirm && (
                                        <>
                                            <div onClick={() => setPermanentDeleteConfirm(null)} style={galleryStyles.confirmBackdrop} />
                                            <div style={galleryStyles.confirmBox}>
                                                <span style={galleryStyles.confirmText}>
                                                    <strong style={{ color: '#E57373' }}>Безвозвратно удалить?</strong>
                                                    <br />
                                                    {permanentDeleteConfirm.type === 'clothes' && 'Эта вещь будет удалена навсегда.'}
                                                    {permanentDeleteConfirm.type === 'outfits' && 'Этот образ будет удален навсегда.'}
                                                    {permanentDeleteConfirm.type === 'capsules' && 'Эта капсула будет удалена навсегда.'}
                                                    <br />
                                                </span>
                                                <div style={galleryStyles.confirmActions}>
                                                    <button
                                                        onClick={executePermanentDelete}
                                                        style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#E57373' }}
                                                    >
                                                        Удалить навсегда
                                                    </button>
                                                    <button onClick={() => setPermanentDeleteConfirm(null)} style={galleryStyles.confirmCancelBtn}>Отмена</button>
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
                                        setIsSavingOutfit(true);
                                        try {
                                            const payload = {
                                                name: outfitName || "Мой образ",
                                                items: canvasItems.map(item => ({
                                                    clothing_item_id: item.id,
                                                    x: item.x,
                                                    y: item.y,
                                                    scale: item.scale
                                                }))
                                            };

                                            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
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

                                            const outfitsRes = await fetch(`${API_BASE_URL}/outfits/`, { headers });

                                            if (outfitsRes.ok) {
                                                const rawOutfits = await outfitsRes.json();

                                                const outfitsWithItems = await Promise.all(
                                                    rawOutfits.map(async (o: any) => {
                                                        try {
                                                            const itemsRes = await fetch(`${API_BASE_URL}/outfits/${o.id}/items`, { headers });
                                                            let outfitItems: any[] = [];
                                                            if (itemsRes.ok) {
                                                                const rawItems = await itemsRes.json();
                                                                outfitItems = rawItems.map((item: any) => {
                                                                // Бэкенд возвращает clothing_item_id. Используем его в первую очередь!
                                                                const cId = item.clothing_item_id || item.clothing_id; 
                                                                const cloth = clothes.find((c: any) => c.id === cId);
                                                                return {
                                                                    ...item,
                                                                    id: cId, // Для UI используем ID вещи
                                                                    outfit_item_id: item.id, // Для бэкенда сохраняем ID записи OutfitItem
                                                                    img: getFullImageUrl(item.image_url || cloth?.img || '/placeholder.png'),
                                                                    x: item.x || 0,
                                                                    y: item.y || 0,
                                                                    scale: item.scale || 1
                                                                };
                                                            });
                                                            }
                                                            return {
                                                                ...o,
                                                                createdAt: o.created_at || o.createdAt,
                                                                deletedAt: o.deleted_at || o.deletedAt,
                                                                items: outfitItems
                                                            };
                                                        } catch (err) {
                                                            console.error(`Не удалось загрузить вещи для образа ${o.id}:`, err);
                                                            return { ...o, items: [] };
                                                        }
                                                    })
                                                );
                                                setOutfits(outfitsWithItems);
                                            }

                                            haptic('medium');
                                            setIsOutfitCreatorOpen(false);

                                            if (selectedDateForOutfit) {
                                                // ✅ Создавали образ на конкретный день — остаёмся на главном экране
                                                try {
                                                    const savedOutfitId = editingOutfitId || (await response.json()).id;
                                                    await fetch(`${API_BASE_URL}/wear-records/`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            outfit_id: savedOutfitId,
                                                            worn_date: selectedDateForOutfit
                                                        })
                                                    });
                                                    // Обновляем список записей, чтобы на главном сразу отобразился образ
                                                    const wearRes = await fetch(`${API_BASE_URL}/wear-records/`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    if (wearRes.ok) {
                                                        const records = await wearRes.json();
                                                        setWearRecords(records);
                                                    }
                                                    // ✅ Показываем уведомление
                                                    const formattedDate = new Date(selectedDateForOutfit).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long'
                                                    });
                                                    setOutfitCreatedMessage(`Образ создан на ${formattedDate}`);
                                                    setTimeout(() => setOutfitCreatedMessage(null), 2500);
                                                    setSelectedDateForOutfit(null);
                                                } catch (e) {
                                                    console.error('Не удалось записать образ в календарь:', e);
                                                }
                                                // ✅ НЕ переключаем экран — остаёмся на главном
                                            } else {
                                                // ✅ Обычное создание образа — переключаем на экран вещей
                                                setCurrentScreen('profile');
                                            }

                                            setTimeout(() => {
                                                setActiveDragId(null);
                                                setCanvasItems([]);
                                                setOutfitName('');
                                                setEditingOutfitId(null);
                                            }, 50);
                                        } catch (error) {
                                            console.error(error);
                                            const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
                                            alert('Не удалось сохранить образ: ' + errorMessage);
                                        } finally {
                                            setIsSavingOutfit(false);
                                        }
                                    }}
                                    style={{
                                        background: 'none', border: 'none', fontSize: '16px', fontWeight: '600',
                                        color: '#151414', opacity: isSavingOutfit ? 0.5 : 1, cursor: isSavingOutfit ? 'wait' : 'pointer'
                                    }}
                                >
                                    {isSavingOutfit ? 'Сохранение...' : 'Готово'}
                                </button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
                                <div style={{ width: '315px', height: '480px', backgroundColor: 'transparent', position: 'relative', overflow: 'hidden', border: '2px solid #151414', borderRadius: '24px', boxSizing: 'border-box' }}>
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
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none'
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
                                                try {
                                                    setIsSavingCapsule(true);
                                                    const headers = {
                                                        'Authorization': `Bearer ${token}`,
                                                        'Content-Type': 'application/json'
                                                    };
                                                    
                                                    const payload = {
                                                        name: capsuleName || "Моя капсула",
                                                        description: null,
                                                        season: null,
                                                        items: capsuleItems.map(i => i.id),
                                                        outfits: capsuleOutfits.map(o => ({
                                                            name: o.name,
                                                            items: o.items.map((i: any) => ({
                                                                clothing_item_id: i.id,
                                                                x: i.x,
                                                                y: i.y,
                                                                scale: i.scale
                                                            }))
                                                        }))
                                                    };

                                                    let response;
                                                    if (editingCapsuleId) {
                                                        response = await fetch(`${API_BASE_URL}/capsules/${editingCapsuleId}`, {
                                                            method: 'PATCH',
                                                            headers,
                                                            body: JSON.stringify(payload)
                                                        });
                                                    } else {
                                                        response = await fetch(`${API_BASE_URL}/capsules/`, {
                                                            method: 'POST',
                                                            headers,
                                                            body: JSON.stringify(payload)
                                                        });
                                                    }

                                                    if (!response.ok) throw new Error('Ошибка сохранения капсулы');
                                                    const savedCapsule = await response.json();

                                                    const mappedCapsule = {
                                                        ...savedCapsule,
                                                        createdAt: savedCapsule.created_at,
                                                        deletedAt: savedCapsule.is_deleted ? (savedCapsule.deleted_at || new Date().toISOString()) : null,
                                                        items: (savedCapsule.items || []).map((ci: any) => {
                                                            const cId = typeof ci === 'number' ? ci : (ci.id || ci.clothing_item_id);
                                                            const cloth = clothes.find(c => c.id === cId);
                                                            return { id: cId, img: cloth?.img || '/placeholder.png', name: cloth?.name || '' };
                                                        }),
                                                        outfits: (savedCapsule.outfits || []).map((o: any) => ({
                                                            ...o,
                                                            items: (o.items || []).map((oi: any) => {
                                                                const cId = oi.clothing_id || oi.id;
                                                                const cloth = clothes.find(c => c.id === cId);
                                                                return {
                                                                    ...oi,
                                                                    id: cId,
                                                                    img: getFullImageUrl(cloth?.img || '/placeholder.png'),
                                                                    x: oi.x || 0,
                                                                    y: oi.y || 0,
                                                                    scale: oi.scale || 1
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
                                                    const errorMessage = e instanceof Error ? e.message : 'Произошла неизвестная ошибка';
                                                    alert('Не удалось сохранить капсулу: ' + errorMessage);
                                                } finally {
                                                    setIsSavingCapsule(false);
                                                }
                                                setCapsuleItems([]);
                                                setCapsuleName('');
                                                setCapsuleOutfits([]);
                                                setCapsuleStep('items');
                                                setEditingCapsuleId(null);
                                            }}
                                            style={{
                                                background: 'none', border: 'none', fontSize: '16px', fontWeight: '600',
                                                color: '#6B6A69', opacity: isSavingCapsule ? 0.5 : 1, cursor: isSavingCapsule ? 'wait' : 'pointer'
                                            }}
                                        >
                                            {isSavingCapsule ? 'Сохранение...' : 'Сохранить'}
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
                                                        <button
                                                            onClick={() => setCapsuleOutfits(capsuleOutfits.filter(o => o.id !== outfit.id))}
                                                            style={galleryStyles.deleteBadge}
                                                        >
                                                            ✕
                                                        </button>
                                                        <div style={{
                                                            width: '105px',
                                                            height: '160px',
                                                            backgroundColor: 'transparent',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            flexShrink: 0,
                                                            margin: '0 auto'
                                                        }}>
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
                                <div style={{ width: '280px', height: '370px', backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
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
                                            <img src={item.img} draggable="false" style={{ width: '110px', objectFit: 'contain', pointerEvents: 'none' }} alt="" />
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
                                <option value="bags">Сумки</option>
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
                                                setIsUploading(true);
                                                try {
                                                    finalImageUrl = await uploadImageAndGetUrl(newImage);
                                                } finally {
                                                    setIsUploading(false);
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
                                                setClothes(prev => prev.map(i => i.id === editingItemId ? { ...i, ...savedItem, img: getFullImageUrl(finalImageUrl) } : i));
                                            } else {
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
                                    {!selectedItemForView.isDeletedOutfit && (
                                        <img src={selectedItemForView.img} alt="" style={itemModalStyles.image} />
                                    )}

                                    {selectedItemForView.isDeletedOutfit && (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            {(selectedItemForView.items || []).map((item: any, idx: number) => {
                                                const factor = 0.45;
                                                return (
                                                    <img
                                                        key={idx}
                                                        src={item.img}
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${item.x * factor}px`,
                                                            top: `${item.y * factor}px`,
                                                            width: `${110 * factor * (item.scale || 1)}px`,
                                                            height: `${110 * factor * (item.scale || 1)}px`,
                                                            objectFit: 'contain'
                                                        }}
                                                        alt=""
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {!selectedItemForView.isDeletedOutfit && (
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

                                        {selectedItemForView.deletedAt && selectedItemForView.days_remaining !== undefined && (
                                            <div style={itemModalStyles.tagRow}>
                                                <span style={itemModalStyles.tagLabel}>Осталось дней:</span>
                                                <span style={{ ...itemModalStyles.tagBadge, color: selectedItemForView.days_remaining <= 3 ? '#E57373' : '#151414' }}>
                                                    {selectedItemForView.days_remaining}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                    {(selectedItemForView.isFromTrash || selectedItemForView.deletedAt || selectedItemForView.deleted_at || selectedItemForView.isDeletedOutfit || (selectedItemForView.days_remaining !== undefined && selectedItemForView.days_remaining !== null)) ? (
                                        <>
                                            <button
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={async () => {
                                                    try {
                                                        const type = selectedItemForView.isDeletedOutfit ? 'outfits' : 'clothes';
                                                        const response = await fetch(`${API_BASE_URL}/${type}/${selectedItemForView.id}/restore`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (!response.ok) throw new Error('Не удалось восстановить');
                                                        await fetchCart();
                                                        if (type === 'clothes') {
                                                            const res = await fetch(`${API_BASE_URL}/clothes/`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                            if (res.ok) {
                                                                const data = await res.json();
                                                                setClothes(data.map((i: any) => ({ ...i, img: getFullImageUrl(i.image_url), deletedAt: i.deleted_at ? new Date(i.deleted_at).toISOString() : null })));
                                                            }
                                                        }
                                                        setSelectedItemForView(null);
                                                        setRestoreSuccess(type);
                                                        haptic('medium');
                                                    } catch (e) { alert('Ошибка восстановления'); }
                                                }}
                                            >
                                                Восстановить
                                            </button>
                                            <button
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#E57373', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={() => {
                                                    const type = selectedItemForView.isDeletedOutfit ? 'outfits' : 'clothes';
                                                    setPermanentDeleteConfirm({ id: selectedItemForView.id, type: type as any });
                                                    setSelectedItemForView(null);
                                                }}
                                            >
                                                Удалить навсегда
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#151414', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
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
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#E57373', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={() => {
                                                    openDeleteModal(selectedItemForView.id, 'clothes');
                                                    setSelectedItemForView(null);
                                                }}
                                            >
                                                Удалить вещь
                                            </button>
                                        </>
                                    )}
                                </div>
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
                                          selectedCapsuleForView.outfits.map((outfit: any, outfitIdx: number) => (
                                              <div
                                                  key={outfitIdx} // Используем индекс, так как у локальных образов может не быть ID
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
                                                                  src={item.img} // Картинка должна быть уже подтянута в mappedOutfits
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
                                    {selectedCapsuleForView.isFromTrash ? (
                                        <>
                                            <button
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(`${API_BASE_URL}/capsules/${selectedCapsuleForView.id}/restore`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (!response.ok) throw new Error('Не удалось восстановить');
                                                        await fetchCart();
                                                        setSelectedCapsuleForView(null);
                                                        setRestoreSuccess('capsules');
                                                        haptic('medium');
                                                    } catch (e) { alert('Ошибка восстановления'); }
                                                }}
                                            >
                                                Восстановить
                                            </button>
                                            <button
                                                style={{ width: '100%', padding: '12px', backgroundColor: '#E57373', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setPermanentDeleteConfirm({ id: selectedCapsuleForView.id, type: 'capsules' });
                                                    setSelectedCapsuleForView(null);
                                                }}
                                            >
                                                Удалить навсегда
                                            </button>
                                        </>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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
                                                        Эта вещь используется в ваших образах или капсулах.{' '}
                                                        <strong style={{ fontWeight: '700', color: '#E57373' }}>Переместить вещь в корзину?</strong>
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

                    {deleteSuccessMessage && (
                        <>
                            <div style={galleryStyles.confirmBackdrop} />
                            <div style={galleryStyles.confirmBox}>
                                <span style={{ ...galleryStyles.confirmText, color: '#4CAF50', fontWeight: '700' }}>
                                    {deleteSuccessMessage}
                                </span>
                            </div>
                        </>
                    )}
                    {restoreSuccess && (
                        <>
                            <div style={galleryStyles.confirmBackdrop} />
                            <div style={galleryStyles.confirmBox}>
                                <span style={{ ...galleryStyles.confirmText, color: '#4CAF50', fontWeight: '700' }}>
                                    {restoreSuccess === 'outfits'
                                        ? 'Йоу! Образ успешно восстановлен в гардероб'
                                        : restoreSuccess === 'capsules'
                                            ? 'Йоу! Капсула успешно восстановлена в гардероб'
                                            : 'Йоу! Вещь успешно восстановлена в гардероб'}
                                </span>
                            </div>
                        </>
                    )}
                    
                    {outfitCreatedMessage && (
                        <>
                        <div style={galleryStyles.confirmBackdrop} />
                        <div style={galleryStyles.confirmBox}>
                        <span style={{ ...galleryStyles.confirmText, color: '#4CAF50', fontWeight: '700' }}>
                        {outfitCreatedMessage}
                        </span>
                        </div>
                        </>
                        )}

                    {isOutfitPickerOpen && selectedDateForOutfit && (
                    <>
                        <div
                        onClick={() => { setIsOutfitPickerOpen(false); setSelectedDateForOutfit(null); }}
                        style={galleryStyles.confirmBackdrop}
                        />
                        <div 
                        style={{ 
                            ...galleryStyles.confirmBox, 
                            maxHeight: '80vh', 
                            overflowY: 'auto',
                            overscrollBehavior: 'contain', // ✅ Предотвращает "проброс" скролла за пределы модалки
                            touchAction: 'pan-y', // ✅ Разрешаем только вертикальный скролл внутри
                        }}
                        onTouchMove={(e) => e.stopPropagation()} // ✅ Останавливаем проброс touch-событий
                        onWheel={(e) => e.stopPropagation()} // ✅ Останавливаем проброс wheel-событий
                        >
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#151414' }}>
                            Выберите образ на {new Date(selectedDateForOutfit).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </span>
                        
                        {outfits.filter(o => !o.deletedAt).length === 0 ? (
                            <span style={{ fontSize: '13px', color: '#8B8A89', textAlign: 'center', padding: '20px 0' }}>
                            У вас пока нет созданных образов
                            </span>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {outfits.filter(o => !o.deletedAt).map((outfit) => (
                                <div
                                key={outfit.id}
                                onClick={async () => {
                                    try {
                                    const response = await fetch(`${API_BASE_URL}/wear-records/`, {
                                        method: 'POST',
                                        headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                        outfit_id: outfit.id,
                                        worn_date: selectedDateForOutfit
                                        })
                                    });
                                    if (!response.ok) throw new Error('Ошибка сохранения');
                                    
                                    const newRecord = await response.json();
                                    setWearRecords(prev => {
                                        // Удаляем старую запись на эту дату, если есть
                                        const filtered = prev.filter(r => r.worn_date !== selectedDateForOutfit);
                                        return [...filtered, newRecord];
                                    });
                                    
                                    haptic('medium');
                                    setIsOutfitPickerOpen(false);
                                    setSelectedDateForOutfit(null);
                                    } catch (e) {
                                    console.error(e);
                                    alert('Не удалось сохранить образ на этот день');
                                    }
                                }}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(21,20,20,0.05)'
                                }}
                                >
                                <div style={{ width: '100%', height: '120px', backgroundColor: '#E6E5E3', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                                    {(outfit.items || []).map((item: any, idx: number) => {
                                    const factor = 0.25;
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
                                <span style={{ fontSize: '11px', fontWeight: '500', color: '#151414', marginTop: '4px', display: 'block', textAlign: 'center' }}>
                                    {outfit.name}
                                </span>
                                </div>
                            ))}
                            </div>
                        )}

                        {/* Если на этот день уже есть образ — показываем кнопку удаления */}
                        {(() => {
                        const existingRecord = wearRecords.find(r => r.worn_date === selectedDateForOutfit);
                        if (!existingRecord) return null;
                        
                        return (
                            <button
                                onClick={() => {
                                    const record = wearRecords.find(r => r.worn_date === selectedDateForOutfit);
                                    if (record) {
                                    setDeleteOutfitConfirm({ recordId: record.id, date: selectedDateForOutfit });
                                    }
                                }}
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
                                >
                                Удалить образ на этот день
                                </button>
                        );
                        })()}

                        {/* ✅ НОВАЯ КНОПКА: Создать новый образ на этот день */}
                        <button
                            onClick={() => {
                                setIsOutfitPickerOpen(false);
                                setIsOutfitCreatorOpen(true);
                                setEditingOutfitId(null);
                                setCanvasItems([]);
                                setOutfitName('');
                                haptic('medium');
                            }}
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
                                boxShadow: '0px 4px 12px rgba(21, 20, 20, 0.15)'
                            }}
                        >
                            + Создать новый образ на этот день
                        </button>
                        
                        <button
                            onClick={() => { setIsOutfitPickerOpen(false); setSelectedDateForOutfit(null); }}
                            style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#E6E5E3',
                            color: '#151414',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            }}
                        >
                            Отмена
                        </button>
                        </div>
                    </>
                    )}

                    {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ОБРАЗА */}
                    {deleteOutfitConfirm && (
                        <>
                            <div
                            onClick={() => setDeleteOutfitConfirm(null)}
                            style={galleryStyles.confirmBackdrop}
                            />
                            <div style={galleryStyles.confirmBox}>
                            <span style={galleryStyles.confirmText}>
                                Удалить образ на {new Date(deleteOutfitConfirm.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}?
                            </span>
                            <div style={galleryStyles.confirmActions}>
                                <button
                                onClick={async () => {
                                    await deleteWearRecord(deleteOutfitConfirm.recordId);
                                    setDeleteOutfitConfirm(null);
                                    setIsOutfitPickerOpen(false);
                                    setSelectedDateForOutfit(null);
                                }}
                                style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#E57373' }}
                                >
                                Удалить
                                </button>
                                <button
                                onClick={() => setDeleteOutfitConfirm(null)}
                                style={galleryStyles.confirmCancelBtn}
                                >
                                Отмена
                                </button>
                            </div>
                            </div>
                        </>
                        )}

                    {networkError && (
                        <>
                            <div style={galleryStyles.confirmBackdrop} />
                            <div style={galleryStyles.confirmBox}>
                                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📡</div>
                                <span style={{ ...galleryStyles.confirmText, fontWeight: '600' }}>
                                    Нет связи с интернетом
                                </span>
                                <span style={{ fontSize: '13px', color: '#8B8A89', lineHeight: '1.4' }}>
                                    Проверьте, пожалуйста, подключение к сети и попробуйте снова
                                </span>
                                <div style={galleryStyles.confirmActions}>
                                    <button
                                        onClick={() => {
                                            setNetworkError(false);
                                            window.location.reload();
                                        }}
                                        style={{ ...galleryStyles.confirmDeleteBtn, backgroundColor: '#151414' }}
                                    >
                                        Повторить
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                      {isCityPickerOpen && (
  <>
    <div
      onClick={() => { setIsCityPickerOpen(false); setSearchCityQuery(''); }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 99998
      }}
    />
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '85%',
      maxWidth: '340px',
      maxHeight: '80vh',
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.15)',
      zIndex: 99999,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#151414' }}>Выберите город</span>
        <button
          onClick={() => { setIsCityPickerOpen(false); setSearchCityQuery(''); }}
          style={{ background: 'none', border: 'none', fontSize: '20px', color: '#8B8A89', cursor: 'pointer', padding: '4px' }}
        >
          ✕
        </button>
      </div>
      
      {/* Кнопка определения геолокации */}
      <button
        onClick={async () => {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается');
            return;
        }
        setIsUpdatingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            const newLat = position.coords.latitude;
            const newLon = position.coords.longitude;
            const newCity = await getCityName(newLat, newLon);
            
            // ✅ Сохраняем на бэк
            try {
                await fetch(`${API_BASE_URL}/weather/location`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: newLat,
                        longitude: newLon,
                        lat: newLat,
                        lon: newLon,
                        lng: newLon,
                        city: newCity
                    })
                });
                console.log('✅ [Гео] Геолокация сохранена на бэк:', newCity);
            } catch (e) {
                console.warn('⚠️ [Гео] Не удалось сохранить геолокацию на бэк:', e);
            }

            setIsCityPickerOpen(false);
            
            // ✅ Мгновенно обновляем погоду
            await fetchWeather({ lat: newLat, lon: newLon, city: newCity });
            haptic('medium');
        } catch (error) {
            console.error('Ошибка геолокации:', error);
            alert('Не удалось определить местоположение');
        } finally {
            setIsUpdatingLocation(false);
        }
    }}
    disabled={isUpdatingLocation}
    style={{
        width: '100%',
        padding: '16px',
        backgroundColor: '#151414',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '16px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: isUpdatingLocation ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: isUpdatingLocation ? 0.7 : 1,
        boxShadow: '0px 6px 16px rgba(21, 20, 20, 0.15)', // Красивая мягкая тень
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, sans-serif'
    }}
>
    {isUpdatingLocation ? (
        <>
            {/* Красивый спиннер вместо простого текста */}
            <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #FFFFFF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            Определяем...
        </>
    ) : (
        '📍 Определить автоматически'
    )}
</button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8B8A89', fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E6E5E3' }} />
        <span>или выберите из списка</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E6E5E3' }} />
      </div>
      
      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск города..."
        value={searchCityQuery}
        onChange={(e) => setSearchCityQuery(e.target.value)}
        autoFocus
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #E6E5E3',
          backgroundColor: '#F9F8F6',
          fontSize: '14px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      
      {/* Список городов */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '40vh'
      }}>
        {POPULAR_CITIES
          .filter(city => city.name.toLowerCase().includes(searchCityQuery.toLowerCase()))
          .map((city) => (
            <button
              key={city.name}
              onClick={async () => {
    // 1. Мгновенно закрываем модалку
    setIsCityPickerOpen(false);
    setSearchCityQuery('');
    
    // 2. ✅ Сохраняем на бэк
    try {
        await fetch(`${API_BASE_URL}/weather/location`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude: city.lat,
                longitude: city.lon,
                lat: city.lat,
                lon: city.lon,
                lng: city.lon,
                city: city.name
            })
        });
        console.log('✅ [Гео] Город сохранён на бэк:', city.name);
    } catch (e) {
        console.warn('⚠️ [Гео] Не удалось сохранить город на бэк:', e);
    }

    // 3. ✅ Мгновенно обновляем погоду
    await fetchWeather({ lat: city.lat, lon: city.lon, city: city.name });
    haptic('medium');
}}
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6E5E3',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#151414',
              }}
            >
              {city.name}
            </button>
          ))}
        {POPULAR_CITIES.filter(city => city.name.toLowerCase().includes(searchCityQuery.toLowerCase())).length === 0 && (
          <div style={{ textAlign: 'center', color: '#8B8A89', padding: '20px', fontSize: '13px' }}>
            Город не найден
          </div>
        )}
      </div>
    </div>
  </>
)}

                    <BottomNavBar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
                </>
            ) : null}
        </div>
    );
}

const ProfileGallery = ({
    clothes = [],
    outfits = [],
    capsules = [],
    searchQuery,
    setIsSearchOpen,
    haptic,
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
                {[{ id: 'capsules', label: 'Капсулы' }, { id: 'outfits', label: 'Образы' }, { id: 'clothes', label: 'Одежда' }].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            haptic('light');
                        }}
                        style={{
                            ...galleryStyles.tabButton,
                            color: activeTab === tab.id ? '#151414' : '#8B8A89',
                            borderBottom: activeTab === tab.id ? '2px solid #151414' : '2px solid transparent'
                        }}
                    >
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
        {КАТЕГОРИИ.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
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
        {МАТЕРИАЛЫ.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select>

    {/* Кнопка выбора цвета с выпадающим списком */}
    <div style={{ position: 'relative', width: '100%' }}>
        <button
onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
style={{
...galleryStyles.filterSelect,
textAlign: 'left',
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
paddingRight: '8px',
cursor: 'pointer',
width: '100%',
height: '100%',
minHeight: '31px',
// ✅ Убираем стандартную стрелку из background, т.к. нарисуем свою
backgroundImage: 'none',
}}
>
{selectedColor ? (
<div style={{
width: '100%', height: '8px', borderRadius: '3px',
backgroundColor: ЦВЕТА.find(c => c.id === selectedColor)?.hex
}} />
) : (
<span>Цвет</span>
)}
{/* ✅ КАСТОМНАЯ СТРЕЛКА С АНИМАЦИЕЙ */}
<svg
width="12"
height="12"
viewBox="0 0 24 24"
fill="none"
stroke={isColorDropdownOpen ? '#151414' : '#8B8A89'}
strokeWidth="2.5"
strokeLinecap="round"
strokeLinejoin="round"
style={{
transition: 'transform 0.25s ease, stroke 0.2s ease',
transform: isColorDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
flexShrink: 0,
marginLeft: '4px',
}}
>
<polyline points="6 9 12 15 18 9" />
</svg>
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
                        onClick={() => {
                            setSelectedColor('');
                            setIsColorDropdownOpen(false);
                            haptic('light');
                        }}
                        style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            color: '#151414'
                        }}
                    >
                        Все
                    </div>
                    {ЦВЕТА.map(c => (
                        <div
                            key={c.id}
                            onClick={() => {
                                setSelectedColor(c.id);
                                setIsColorDropdownOpen(false);
                                haptic('light');
                            }}
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
                            setIsCapsuleCreatorOpen(true);
                            haptic('light');
                        }}
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
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '16px',
                            borderRadius: '14px',
                            border: 'none',
                            backgroundColor: '#151414',
                            color: '#FFFFFF',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setIsOutfitCreatorOpen(true);
                            haptic('light');
                        }}
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
                                <div
                                    key={capsule.id}
                                    onClick={() => onCapsuleClick(capsule)}
                                    style={{ ...galleryStyles.card, cursor: 'pointer' }}
                                >
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
    // ✅ УВЕЛИЧИЛИ ВТОРУЮ СТРОКУ СО 145px ДО 165px, чтобы погода не вылезала
    gridTemplateRows: '120px 165px', 
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
    paddingTop: '20px', // ✅ Добавили воздух сверху
    marginTop: 'auto', // ✅ Прижимаем кнопку к самому низу экрана
    boxSizing: 'border-box',
    flexShrink: 0, // ✅ Запрещаем кнопке сжиматься
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
        // ✅ ЧУТЬ УВЕЛИЧИЛИ ВНУТРЕННИЕ ОТСТУПЫ
        padding: '12px 14px', 
        color: '#151414',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        height: '100%',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
        // ✅ УБРАЛИ overflow: 'hidden', чтобы эмодзи и текст точно не обрезались краями
    },
    hourlyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 'auto',
    borderTop: '0.5px solid rgba(21, 20, 20, 0.12)',
    paddingTop: '6px',
    gap: '4px', // ✅ Добавляем отступы
    flexShrink: 0, // ✅ Запрещаем сжиматься
},
    weatherTemp: {
    fontSize: '22px',
    fontWeight: '700',
    margin: '2px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    lineHeight: '1', // ✅ Добавляем фиксированную высоту строки
    flexShrink: 0,   // ✅ Запрещаем сжиматься
},
hourItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // ✅ Центрируем по вертикали
    fontSize: '9px',
    gap: '2px',
    lineHeight: '1.2', // ✅ Фиксируем высоту строки
    flexShrink: 0,     // ✅ Запрещаем сжиматься
    minWidth: '40px',  // ✅ Минимальная ширина
},
weatherCity: {
    fontSize: '11px',
    fontWeight: '600',
    opacity: 0.9,
    lineHeight: '1.2', // ✅ Добавляем
    flexShrink: 0,     // ✅ Добавляем
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
    // ✅ ДОБАВЛЯЕМ:
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%', // ✅ Фиксируем ширину
    flexShrink: 0, // ✅ Запрещаем сжиматься
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
    lineHeight: '1', // ✅ Фиксируем
    whiteSpace: 'nowrap', // ✅ Запрещаем перенос
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
    lineHeight: '1', // ✅ Фиксируем
    whiteSpace: 'nowrap', // ✅ Запрещаем перенос
},
  tabsAndSearch: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  filterRow: {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
  gap: '8px',
  marginBottom: '16px',
  alignItems: 'center',
},
filterSelect: {
  width: '100%',
  height: '31px',
  boxSizing: 'border-box',
  padding: '0 28px 0 8px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#FFFFFF',
  fontSize: '12px', // Тот самый размер, который делает фильтры одинаковыми
  color: '#151414',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0px 2px 8px rgba(0,0,0,0.03)',
  textAlign: 'left',
  appearance: 'none',
  // Стрелочка для select
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8A89' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
backgroundRepeat: 'no-repeat',
backgroundPosition: 'right 8px center',
backgroundSize: '12px',
transition: 'background-image 0.2s ease, transform 0.2s ease',
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
    width: '90%',
    maxWidth: '360px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.15)',
    zIndex: 99999,
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    minHeight: '200px', 
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#E6E5E3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 'auto',
    maxHeight: '60vh',
    objectFit: 'contain',
    display: 'block',
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