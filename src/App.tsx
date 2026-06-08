import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';

// Colors
const getTheme = () => {
  return {
    bg: '#FFFFF0',
    card: '#FFFFFF',
    primary: '#442F29',
    primaryText: '#FFFFFF',
    secondary: '#E8E0D5',
    text: '#442F29',
    textSecondary: '#8B7355',
    accent: '#C4A47A',
    destructive: '#E57373',
    success: '#4CAF50',
    gradient: 'linear-gradient(135deg, #442F29 0%, #6B4423 100%)',
  };
};

// filters
const СЕЗОНЫ = [
  { id: 'winter', name: 'Зима', color: '#6BB5E0' },
  { id: 'spring', name: 'Весна', color: '#E8A87C' },
  { id: 'summer', name: 'Лето', color: '#F3D572' },
  { id: 'autumn', name: 'Осень', color: '#D4956A' },
  { id: 'demiseason', name: 'Демисезон', color: '#A8C8A0' },
];

const ЦВЕТА = [
  { id: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: 'black', name: 'Черный', hex: '#000000' },
  { id: 'beige', name: 'Бежевый', hex: '#D4C5B9' },
  { id: 'brown', name: 'Коричневый', hex: '#8B6F4E' },
  { id: 'navy', name: 'Темно-синий', hex: '#2C3E50' },
  { id: 'grey', name: 'Серый', hex: '#95A5A6' },
  { id: 'red', name: 'Красный', hex: '#E57373' },
  { id: 'blue', name: 'Синий', hex: '#6BB5E0' },
  { id: 'green', name: 'Зеленый', hex: '#81C784' },
  { id: 'pink', name: 'Розовый', hex: '#F8B4B4' },
  { id: 'purple', name: 'Фиолетовый', hex: '#C4A4D4' },
  { id: 'orange', name: 'Оранжевый', hex: '#F39C12' },
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
  { id: "top", name: "Верх" },
  { id: "bottom", name: "Низ" },
  { id: "shoes", name: "Обувь" },
  { id: "accessory", name: "Аксессуары" },
];

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.ready();
      webapp.expand();
      webapp.enableClosingConfirmation();
      setTg(webapp);
    }
  }, []);
  
  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };
  
  const showAlert = (message: string) => {
    if (tg?.showAlert) tg.showAlert(message);
    else alert(message);
  };
  
  return { haptic, showAlert, isReady: !!tg };
};



const SmallSearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="#442F29" strokeWidth="1.5" fill="none"/>
    <path d="M13 13L17 17" stroke="#442F29" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#442F29" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const OnboardingSlider = ({ onComplete }: { onComplete: () => void }) => {
  const [slide, setSlide] = useState(0);
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const slides = [
    { title: 'CLOSET FLOW', description: 'Управляй гардеробом со стилем', icon: '👗' },
    { title: 'КАПСУЛЫ 8-3', description: '8 вещей = 3 образа' },
    { title: 'КАПСУЛЫ 10-5', description: '10 вещей = 5 образов' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isDesktop ? 60 : 40 }}>
      <div style={{ textAlign: 'center', maxWidth: isDesktop ? 500 : '100%' }}>
        <div style={{ fontSize: isDesktop ? 100 : 80, marginBottom: 20 }}>{slides[slide].icon}</div>
        <h1 style={{ fontSize: isDesktop ? 40 : 32, fontWeight: 700, color: theme.primary, marginBottom: 12 }}>{slides[slide].title}</h1>
        <p style={{ color: theme.textSecondary, fontSize: isDesktop ? 18 : 16, marginBottom: 40 }}>{slides[slide].description}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {slides.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i === slide ? theme.primary : theme.secondary }} />)}
        </div>
        <button onClick={() => slide === 2 ? onComplete() : setSlide(slide + 1)} style={{ padding: `${isDesktop ? '16px' : '14px'} ${isDesktop ? '40px' : '32px'}`, background: theme.primary, border: 'none', borderRadius: 30, color: theme.primaryText, fontSize: isDesktop ? 18 : 16, fontWeight: 600, cursor: 'pointer' }}>
          {slide === 2 ? 'НАЧАТЬ' : 'ДАЛЕЕ'}
        </button>
      </div>
    </div>
  );
};

// Bottom tab
const BottomNavBar = ({ currentScreen, onScreenChange }: any) => {
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: theme.primary,
    display: 'flex',
    padding: isDesktop ? '16px 0 24px' : '12px 0 20px',
    zIndex: 100,
  };
  
  if (isDesktop) {
    navStyle.maxWidth = 800;
    navStyle.margin = '0 auto';
    navStyle.left = '50%';
    navStyle.transform = 'translateX(-50%)';
    navStyle.borderRadius = '30px 30px 0 0';
  }

  const tabs = [
    { id: 'capsules', label: 'Капсулы', icon: '✨' },
    { id: 'wardrobe', label: 'Гардероб', icon: '👕' },
    { id: 'calendar', label: 'Календарь', icon: '📅' },
  ];

  return (
    <div style={navStyle}>
      {tabs.map(tab => {
        const isActive = currentScreen === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => onScreenChange(tab.id)} 
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: isActive ? 1 : 0.5,
              color: theme.primaryText,
            }}
          >
            <span style={{ fontSize: 24 }}>{tab.icon}</span>
            <span style={{ fontSize: isDesktop ? 13 : 11, fontWeight: 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const ItemCard = ({ item, onSelect, isSelected, theme, isDesktop }: any) => {
  const getCategoryName = (category: string) => {
    switch(category) {
      case 'top': return 'Верх';
      case 'bottom': return 'Низ';
      case 'shoes': return 'Обувь';
      case 'accessory': return 'Аксессуар';
      default: return category;
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = МАТЕРИАЛЫ.find(m => m.id === materialId);
    return material ? material.name : '';
  };

  return (
    <div onClick={() => onSelect?.(item)} style={{ 
      background: "transparent", 
      borderRadius: isDesktop ? 20 : 16, 
      padding: isDesktop ? 16 : 12, 
      cursor: onSelect ? 'pointer' : 'default', 
      border: isSelected ? `2px solid ${theme.primary}` : `1px solid ${theme.secondary}`,
      transition: 'all 0.2s ease',
    }}>
      <img src={item.img} alt={item.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: isDesktop ? 16 : 12, marginBottom: 8 }} />
      <div style={{ fontSize: isDesktop ? 16 : 14, fontWeight: 500, color: theme.text }}>{item.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: isDesktop ? 12 : 11, color: theme.textSecondary }}>
          {getCategoryName(item.category)}
        </span>
        <span style={{ fontSize: isDesktop ? 11 : 10, color: СЕЗОНЫ.find((s: any) => s.id === item.season)?.color }}>
          {СЕЗОНЫ.find((s: any) => s.id === item.season)?.name}
        </span>
      </div>
      {item.material && (
        <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>
          {getMaterialName(item.material)}
        </div>
      )}
    </div>
  );
};

const FilterPills = ({ 
  filterCategory, 
  setFilterCategory, 
  filterColor, 
  setFilterColor, 
  filterSeason, 
  setFilterSeason,
  filterMaterial,
  setFilterMaterial,
  theme,
  isDesktop
}: any) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownName: string) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  const getCategoryName = (id: string) => {
    const cat = КАТЕГОРИИ.find(c => c.id === id);
    return cat ? cat.name : 'Все';
  };

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      
      {/* list of categories*/}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => toggleDropdown('category')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 25, 
            background: filterCategory !== 'all' ? theme.primary : theme.card, 
            border: `1px solid ${theme.primary}`,
            color: filterCategory !== 'all' ? theme.primaryText : theme.text, 
            fontSize: isDesktop ? 14 : 13, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          {getCategoryName(filterCategory)} 
          <ChevronDownIcon />
        </button>
        {openDropdown === 'category' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: theme.card,
            border: `1px solid ${theme.secondary}`,
            borderRadius: 12,
            padding: 8,
            zIndex: 1000,
            minWidth: 160,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            {КАТЕГОРИИ.map(cat => (
              <button
                key={cat.id}
                onClick={() => { 
                  setFilterCategory(cat.id); 
                  closeAllDropdowns();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: filterCategory === cat.id ? theme.secondary : 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme.text,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* list of materials */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => toggleDropdown('material')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 25, 
            background: filterMaterial !== 'all' ? theme.primary : theme.card, 
            border: `1px solid ${theme.primary}`,
            color: filterMaterial !== 'all' ? theme.primaryText : theme.text, 
            fontSize: isDesktop ? 14 : 13, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          Материал {filterMaterial !== 'all' && `• ${МАТЕРИАЛЫ.find(m => m.id === filterMaterial)?.name}`}
          <ChevronDownIcon />
        </button>
        {openDropdown === 'material' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: theme.card,
            border: `1px solid ${theme.secondary}`,
            borderRadius: 12,
            padding: 8,
            zIndex: 1000,
            minWidth: 160,
            maxHeight: 300,
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <button
              onClick={() => { 
                setFilterMaterial('all'); 
                closeAllDropdowns();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: filterMaterial === 'all' ? theme.secondary : 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Все материалы
            </button>
            {МАТЕРИАЛЫ.map(material => (
              <button
                key={material.id}
                onClick={() => { 
                  setFilterMaterial(material.id); 
                  closeAllDropdowns();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: filterMaterial === material.id ? theme.secondary : 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme.text,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {material.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* list of colors */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => toggleDropdown('color')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 25, 
            background: filterColor ? theme.primary : theme.card, 
            border: `1px solid ${theme.primary}`,
            color: filterColor ? theme.primaryText : theme.text, 
            fontSize: isDesktop ? 14 : 13, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          Цвет {filterColor && `• ${ЦВЕТА.find(c => c.id === filterColor)?.name}`}
          <ChevronDownIcon />
        </button>
        {openDropdown === 'color' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: theme.card,
            border: `1px solid ${theme.secondary}`,
            borderRadius: 12,
            padding: 8,
            zIndex: 1000,
            minWidth: 180,
            maxHeight: 300,
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <button
              onClick={() => { 
                setFilterColor(null); 
                closeAllDropdowns();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Все цвета
            </button>
            {ЦВЕТА.map(color => (
              <button
                key={color.id}
                onClick={() => { 
                  setFilterColor(color.id); 
                  closeAllDropdowns();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: filterColor === color.id ? theme.secondary : 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme.text,
                  borderRadius: 8,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: 4, background: color.hex, border: '1px solid #ddd' }} />
                {color.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => toggleDropdown('season')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 25, 
            background: filterSeason ? theme.primary : theme.card, 
            border: `1px solid ${theme.primary}`,
            color: filterSeason ? theme.primaryText : theme.text, 
            fontSize: isDesktop ? 14 : 13, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          Сезон {filterSeason && `• ${СЕЗОНЫ.find(s => s.id === filterSeason)?.name}`}
          <ChevronDownIcon />
        </button>
        {openDropdown === 'season' && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: theme.card,
            border: `1px solid ${theme.secondary}`,
            borderRadius: 12,
            padding: 8,
            zIndex: 1000,
            minWidth: 160,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <button
              onClick={() => { 
                setFilterSeason(null); 
                closeAllDropdowns();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Все сезоны
            </button>
            {СЕЗОНЫ.map(season => (
              <button
                key={season.id}
                onClick={() => { 
                  setFilterSeason(season.id); 
                  closeAllDropdowns();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: filterSeason === season.id ? theme.secondary : 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme.text,
                  borderRadius: 8,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: 6, background: season.color }} />
                {season.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CapsuleBuilder = ({ clothes, capsules, setCapsules, onBack, maxItems, type, title }: any) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { haptic, showAlert } = useTelegram();

  let filteredClothes = clothes.filter((c: any) => !c.deletedAt);
  if (filterSeason) filteredClothes = filteredClothes.filter((c: any) => c.season === filterSeason);

  const itemsByCategory = {
    top: filteredClothes.filter((c: any) => c.category === 'top'),
    bottom: filteredClothes.filter((c: any) => c.category === 'bottom'),
    shoes: filteredClothes.filter((c: any) => c.category === 'shoes'),
    accessory: filteredClothes.filter((c: any) => c.category === 'accessory'),
  };

  const addToCapsule = (item: any) => {
    if (selectedItems.length < maxItems && !selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
      haptic('light');
    }
  };

  const removeFromCapsule = (itemId: number) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    haptic('light');
  };

  const saveCapsule = () => {
    if (selectedItems.length === maxItems) {
      const newCapsule = {
        id: Date.now(), type, name: `${title} #${capsules.filter((c: any) => c.type === type).length + 1}`,
        items: selectedItems, createdAt: new Date().toISOString(),
      };
      setCapsules([...capsules, newCapsule]);
      setSelectedItems([]);
      showAlert(`${title} сохранена! 🎉`);
      haptic('medium');
      onBack();
    }
  };

  const gridCols = isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
  const accessoryCols = isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)';

  return (
    <div style={{ padding: isDesktop ? 40 : 20, paddingBottom: 100, maxWidth: isDesktop ? 1200 : '100%', margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: isDesktop ? 28 : 24, cursor: 'pointer', marginBottom: 16, color: theme.text }}>← Назад</button>
      
      <div style={{ background: theme.primary, borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 32 : 24, marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: isDesktop ? 32 : 28, margin: 0, color: theme.primaryText }}>{title}</h2>
        <p style={{ color: theme.primaryText, opacity: 0.8, marginTop: 8 }}>{maxItems} вещей → {maxItems === 8 ? '3' : '5'} образов</p>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button onClick={() => setFilterSeason(null)} style={{ padding: '6px 12px', borderRadius: 20, background: !filterSeason ? theme.primary : theme.card, border: `1px solid ${theme.primary}`, color: !filterSeason ? theme.primaryText : theme.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>Все сезоны</button>
          {СЕЗОНЫ.map(s => (
            <button key={s.id} onClick={() => setFilterSeason(s.id)} style={{ padding: '6px 12px', borderRadius: 20, background: filterSeason === s.id ? s.color : theme.card, border: `1px solid ${theme.secondary}`, color: filterSeason === s.id ? '#0D0C0F' : theme.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>{s.name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: theme.textSecondary }}>Выбрано: {selectedItems.length}/{maxItems}</span>
        <div style={{ flex: 1, marginLeft: 16, height: 4, background: theme.secondary, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${(selectedItems.length / maxItems) * 100}%`, height: '100%', background: theme.primary, transition: 'width 0.3s' }} />
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: theme.text, marginBottom: 12 }}>Выбрано ({selectedItems.length}/{maxItems})</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedItems.map((item: any) => (
              <div key={item.id} style={{ position: 'relative', width: isDesktop ? 80 : 60 }}>
                <img src={item.img} style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, objectFit: 'cover' }} alt="" />
                <button onClick={() => removeFromCapsule(item.id)} style={{ position: 'absolute', top: -4, right: -4, background: theme.destructive, border: 'none', borderRadius: 10, width: 20, height: 20, color: 'white', fontSize: 12, cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ color: theme.text, marginBottom: 12 }}>Верх ({itemsByCategory.top.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isDesktop ? 20 : 12, marginBottom: 24 }}>
        {itemsByCategory.top.map((item: any) => (
          <ItemCard key={item.id} item={item} onSelect={addToCapsule} isSelected={!!selectedItems.find(i => i.id === item.id)} theme={theme} isDesktop={isDesktop} />
        ))}
      </div>

      <h3 style={{ color: theme.text, marginBottom: 12 }}>Низ ({itemsByCategory.bottom.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isDesktop ? 20 : 12, marginBottom: 24 }}>
        {itemsByCategory.bottom.map((item: any) => (
          <ItemCard key={item.id} item={item} onSelect={addToCapsule} isSelected={!!selectedItems.find(i => i.id === item.id)} theme={theme} isDesktop={isDesktop} />
        ))}
      </div>

      <h3 style={{ color: theme.text, marginBottom: 12 }}>Обувь ({itemsByCategory.shoes.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isDesktop ? 20 : 12, marginBottom: 24 }}>
        {itemsByCategory.shoes.map((item: any) => (
          <ItemCard key={item.id} item={item} onSelect={addToCapsule} isSelected={!!selectedItems.find(i => i.id === item.id)} theme={theme} isDesktop={isDesktop} />
        ))}
      </div>

      <h3 style={{ color: theme.text, marginBottom: 12 }}>Аксессуары ({itemsByCategory.accessory.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: accessoryCols, gap: isDesktop ? 20 : 12, marginBottom: 24 }}>
        {itemsByCategory.accessory.map((item: any) => (
          <ItemCard key={item.id} item={item} onSelect={addToCapsule} isSelected={!!selectedItems.find(i => i.id === item.id)} theme={theme} isDesktop={isDesktop} />
        ))}
      </div>

      {selectedItems.length === maxItems && (
        <button onClick={saveCapsule} style={{ width: '100%', padding: isDesktop ? 18 : 16, background: theme.primary, border: 'none', borderRadius: 14, fontSize: isDesktop ? 18 : 16, fontWeight: 600, cursor: 'pointer', marginTop: 20, color: theme.primaryText }}>
          💾 СОХРАНИТЬ
        </button>
      )}
    </div>
  );
};

// page with capsules
const CapsulesPage = ({ capsules, setCapsules, clothes }: any) => {
  const [activeCapsule, setActiveCapsule] = useState<string | null>(null);
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (activeCapsule === '8-3') {
    return <CapsuleBuilder clothes={clothes} capsules={capsules} setCapsules={setCapsules} onBack={() => setActiveCapsule(null)} maxItems={8} type="8-3" title="8-3 КАПСУЛА" />;
  }
  
  if (activeCapsule === '10-5') {
    return <CapsuleBuilder clothes={clothes} capsules={capsules} setCapsules={setCapsules} onBack={() => setActiveCapsule(null)} maxItems={10} type="10-5" title="10-5 КАПСУЛА" />;
  }

  const savedCapsules8 = capsules.filter((c: any) => c.type === '8-3');
  const savedCapsules10 = capsules.filter((c: any) => c.type === '10-5');

  return (
    <div style={{ padding: isDesktop ? 40 : 20, paddingBottom: 100, maxWidth: isDesktop ? 1200 : '100%', margin: '0 auto' }}>
      <div style={{ background: theme.primary, borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 32 : 24, marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: isDesktop ? 36 : 28, margin: 0, color: theme.primaryText }}>МОИ КАПСУЛЫ</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: 16, marginBottom: 32 }}>
        <div onClick={() => setActiveCapsule('8-3')} style={{ background: "transparent", borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 28 : 24, cursor: 'pointer', border: `1px solid ${theme.secondary}`, textAlign: 'center' }}>
          <h3 style={{ color: theme.text, marginBottom: 4 }}>8-3 Капсула</h3>
          <p style={{ color: theme.textSecondary }}>8 вещей = 3 образа</p>
        </div>
        <div onClick={() => setActiveCapsule('10-5')} style={{ background: "transparent", borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 28 : 24, cursor: 'pointer', border: `1px solid ${theme.secondary}`, textAlign: 'center' }}>
          <h3 style={{ color: theme.text, marginBottom: 4 }}>10-5 Капсула</h3>
          <p style={{ color: theme.textSecondary }}>10 вещей = 5 образов</p>
        </div>
      </div>

      {(savedCapsules8.length > 0 || savedCapsules10.length > 0) && (
        <div>
          <h3 style={{ color: theme.text, marginBottom: 16 }}>📦 Сохранённые капсулы</h3>
          {[...savedCapsules8, ...savedCapsules10].map((capsule: any) => (
            <div key={capsule.id} style={{ background: "transparent", borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${theme.secondary}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: theme.text }}>{capsule.name}</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {capsule.items.map((item: any) => (
                  <img key={item.id} src={item.img} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} alt="" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// choosing photo
const PhotoPicker = ({ onImageSelected, theme }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Максимальный размер файла — 10 МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string, file.name.split('.')[0]);
      };
      reader.readAsDataURL(file);
    }
    setShowOptions(false);
  };

  const handleCameraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Максимальный размер файла — 10 МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileName = `photo_${new Date().toISOString().slice(0, 19)}`;
        onImageSelected(reader.result as string, fileName);
      };
      reader.readAsDataURL(file);
    }
    setShowOptions(false);
  };

  if (!isMobile) {
    return (
      <>
        <div onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${theme.secondary}`, borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: theme.bg }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🖼️</div>
          <div style={{ color: theme.text, marginBottom: 4, fontWeight: 500 }}>Выбрать фото</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>Нажмите чтобы выбрать файл</div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
      </>
    );
  }

  return (
    <>
      <div onClick={() => setShowOptions(true)} style={{ border: `2px dashed ${theme.secondary}`, borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: theme.bg }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
        <div style={{ color: theme.text, marginBottom: 4, fontWeight: 500 }}>Добавить фото</div>
        <div style={{ fontSize: 12, color: theme.textSecondary }}>Нажмите чтобы выбрать или сфотографировать</div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
      <input id="camera-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCameraSelect} style={{ display: 'none' }} capture="environment" />

      {showOptions && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: "transparent", borderRadius: 24, padding: 24, width: '90%', maxWidth: 320, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 20, color: theme.text }}>Выберите источник</h3>
            <button onClick={() => { fileInputRef.current?.click(); setShowOptions(false); }} style={{ width: '100%', padding: 14, background: theme.primary, border: 'none', borderRadius: 12, color: theme.primaryText, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontSize: 16 }}>📁 Выбрать из галереи</button>
            <button onClick={() => { document.getElementById('camera-input')?.click(); setShowOptions(false); }} style={{ width: '100%', padding: 14, background: theme.secondary, border: 'none', borderRadius: 12, color: theme.text, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontSize: 16 }}>�� Сделать снимок</button>
            <button onClick={() => setShowOptions(false)} style={{ width: '100%', padding: 14, background: 'none', border: `1px solid ${theme.secondary}`, borderRadius: 12, color: theme.textSecondary, cursor: 'pointer', fontSize: 16 }}>Отмена</button>
          </div>
        </div>
      )}
    </>
  );
};

// main page with wardrobe
const WardrobeGrid = ({ clothes, setClothes }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('top');
  const [newSeason, setNewSeason] = useState('summer');
  const [newColor, setNewColor] = useState('white');
  const [newMaterial, setNewMaterial] = useState('cotton');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);
  const [filterMaterial, setFilterMaterial] = useState<string>('all');
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { haptic, showAlert } = useTelegram();

  const handleImageSelected = (imageDataUrl: string, fileName: string) => {
    setNewImage(imageDataUrl);
    setNewName(fileName.slice(0, 20));
    haptic('light');
  };

  const saveItem = () => {
    if (!newName) { showAlert('Введите название вещи'); return; }
    if (!newImage) { showAlert('Добавьте фото вещи'); return; }
    
    const newItem = {
      id: Date.now(), 
      name: newName, 
      category: newCategory, 
      season: newSeason,
      color: newColor,
      material: newMaterial,
      img: newImage,
      createdAt: new Date().toISOString(),
    };
    setClothes([newItem, ...clothes]);
    setShowAdd(false);
    setNewName('');
    setNewImage(null);
    haptic('medium');
    showAlert('Вещь добавлена в гардероб!');
  };

  const deleteItem = (id: number) => {
    setClothes(clothes.map((c: any) => c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c));
    haptic('light');
  };

  let visibleClothes = clothes.filter((i: any) => !i.deletedAt);
  
  // choose filters
  if (filterCategory !== 'all') {
    visibleClothes = visibleClothes.filter((c: any) => c.category === filterCategory);
  }
  if (filterSeason) {
    visibleClothes = visibleClothes.filter((c: any) => c.season === filterSeason);
  }
  if (filterColor) {
    visibleClothes = visibleClothes.filter((c: any) => c.color === filterColor);
  }
  if (filterMaterial !== 'all') {
    visibleClothes = visibleClothes.filter((c: any) => c.material === filterMaterial);
  }
  // searching by name
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    visibleClothes = visibleClothes.filter((c: any) => 
      c.name.toLowerCase().includes(query)
    );
  }

  const gridCols = isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)';

  const getCategoryName = (category: string) => {
    switch(category) {
      case 'top': return 'Верх';
      case 'bottom': return 'Низ';
      case 'shoes': return 'Обувь';
      case 'accessory': return 'Аксессуар';
      default: return category;
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = МАТЕРИАЛЫ.find(m => m.id === materialId);
    return material ? material.name : '';
  };

  return (
    <div style={{ padding: isDesktop ? 40 : 20, paddingBottom: 100, maxWidth: isDesktop ? 1400 : '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isDesktop ? 40 : 32, fontWeight: 700, color: theme.primary, margin: 0 }}>Мой гардероб</h1>
          <p style={{ color: theme.textSecondary, marginTop: 4, fontSize: 14 }}>{visibleClothes.length} вещей</p>
        </div>
        <button 
          onClick={() => setShowSearch(true)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: theme.primary, 
            padding: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SmallSearchIcon />
        </button>
      </div>

      {showSearch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          padding: isDesktop ? 40 : 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button onClick={() => setShowSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text }}>
              <CloseIcon />
            </button>
            <input
              type="text"
              placeholder="Поиск вещей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 30,
                border: `1px solid ${theme.secondary}`,
                background: "transparent",
                color: theme.text,
                fontSize: 16,
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, fontSize: 14 }}
              >
                Очистить
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {visibleClothes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery ? (
              <div style={{ textAlign: 'center', padding: 60, color: theme.textSecondary }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p>Ничего не найдено для "{searchQuery}"</p>
              </div>
            ) : searchQuery && (
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isDesktop ? 20 : 16 }}>
                {visibleClothes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
                  <div key={item.id} style={{ background: "transparent", borderRadius: 16, padding: 12, position: 'relative', border: `1px solid ${theme.secondary}` }}>
                    <img src={item.img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} alt="" />
                    <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: theme.textSecondary }}>{getCategoryName(item.category)}</span>
                      <span style={{ fontSize: 10, color: СЕЗОНЫ.find((s: any) => s.id === item.season)?.color }}>{СЕЗОНЫ.find((s: any) => s.id === item.season)?.name}</span>
                    </div>
                    <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(68, 47, 41, 0.8)', border: 'none', borderRadius: 20, padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* filters */}
      <FilterPills 
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterColor={filterColor}
        setFilterColor={setFilterColor}
        filterSeason={filterSeason}
        setFilterSeason={setFilterSeason}
        filterMaterial={filterMaterial}
        setFilterMaterial={setFilterMaterial}
        theme={theme}
        isDesktop={isDesktop}
      />

      {/* Empty or list of items */}
      {visibleClothes.length === 0 && !searchQuery ? (
        <div style={{ textAlign: 'center', padding: isDesktop ? 80 : 60, background: "transparent", borderRadius: isDesktop ? 32 : 24, border: `1px solid ${theme.secondary}` }}>
          <img 
            src="/wardrobe-icon.png" 
            alt="Wardrobe" 
            style={{ width: 350, height: 270, marginBottom: 16, opacity: 0.6 }} 
          />
          <p style={{ color: theme.textSecondary, marginBottom: 24, fontSize: 16 }}>Добавьте первую вещь в гардероб</p>
          <button onClick={() => setShowAdd(true)} style={{ padding: '14px 32px', background: theme.primary, border: 'none', borderRadius: 30, color: theme.primaryText, cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <PlusIcon /> Добавить вещь
          </button>
        </div>
      ) : visibleClothes.length === 0 && searchQuery ? (
        <div style={{ textAlign: 'center', padding: 60, color: theme.textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>Ничего не найдено для "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isDesktop ? 20 : 16 }}>
            {visibleClothes.map((item: any) => (
              <div key={item.id} style={{ background: "transparent", borderRadius: 16, padding: 12, position: 'relative', border: `1px solid ${theme.secondary}` }}>
                <img src={item.img} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} alt="" />
                <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: theme.textSecondary }}>{getCategoryName(item.category)}</span>
                  <span style={{ fontSize: 10, color: СЕЗОНЫ.find((s: any) => s.id === item.season)?.color }}>{СЕЗОНЫ.find((s: any) => s.id === item.season)?.name}</span>
                </div>
                {item.material && (
                  <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>
                    {getMaterialName(item.material)}
                  </div>
                )}
                <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(68, 47, 41, 0.8)', border: 'none', borderRadius: 20, padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} style={{ position: 'fixed', bottom: 100, right: isDesktop ? 'calc(50% - 360px)' : 20, width: 56, height: 56, borderRadius: 28, background: theme.primary, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(68, 47, 41, 0.3)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryText }}>
            <PlusIcon />
          </button>
        </>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: 20 }}>
          <div style={{ background: 'theme.card', borderRadius: 24, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: 24 }}>➕ Новая вещь</h3>
              <button onClick={() => { setShowAdd(false); setNewImage(null); setNewName(''); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.text }}>✕</button>
            </div>

            {!newImage ? (
              <PhotoPicker onImageSelected={handleImageSelected} theme={theme} />
            ) : (
              <div style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                  <img src={newImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setNewImage(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(68, 47, 41, 0.8)', border: 'none', borderRadius: 20, padding: '4px 12px', color: 'white', cursor: 'pointer', fontSize: 12 }}>Заменить фото</button>
                </div>
              </div>
            )}

            <input type="text" placeholder="Название вещи" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${theme.secondary}`, background: theme.bg, color: theme.text, marginBottom: 16, boxSizing: 'border-box', fontSize: 16 }} autoFocus />
            
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${theme.secondary}`, background: theme.bg, color: theme.text, marginBottom: 16, fontSize: 16 }}>
              <option value="top">Верх</option>
              <option value="bottom">Низ</option>
              <option value="shoes">Обувь</option>
              <option value="accessory">Аксессуар</option>
            </select>
            
            <select value={newSeason} onChange={(e) => setNewSeason(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${theme.secondary}`, background: theme.bg, color: theme.text, marginBottom: 16, fontSize: 16 }}>
              {СЕЗОНЫ.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select value={newColor} onChange={(e) => setNewColor(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${theme.secondary}`, background: theme.bg, color: theme.text, marginBottom: 16, fontSize: 16 }}>
              {ЦВЕТА.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${theme.secondary}`, background: theme.bg, color: theme.text, marginBottom: 24, fontSize: 16 }}>
              {МАТЕРИАЛЫ.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={saveItem} style={{ flex: 1, padding: 14, background: theme.primary, border: 'none', borderRadius: 12, color: theme.primaryText, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Сохранить</button>
              <button onClick={() => { setShowAdd(false); setNewImage(null); setNewName(''); }} style={{ flex: 1, padding: 14, background: theme.secondary, border: 'none', borderRadius: 12, color: theme.text, cursor: 'pointer', fontSize: 16 }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar
const WearCalendar = ({ history, clothes, setHistory }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSelector, setShowSelector] = useState(false);
  const theme = getTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const getWornItemsForDate = (date: string) => {
    return history.filter((h: any) => h.date === date).map((h: any) => h.itemId);
  };

  const toggleWearItem = (itemId: number) => {
    const wornItems = getWornItemsForDate(selectedDate);
    if (wornItems.includes(itemId)) {
      setHistory(history.filter((h: any) => !(h.date === selectedDate && h.itemId === itemId)));
    } else {
      setHistory([...history, { date: selectedDate, itemId }]);
    }
  };

  const getUniqueDates = () => {
    const dates = history.map((h: any) => h.date);
    return [...new Set(dates)].sort().reverse();
  };

  const getItemStats = (): Record<number, number> => {
    const stats: Record<number, number> = {};
    clothes.forEach((item: any) => {
      if (!item.deletedAt) {
        const count = history.filter((h: any) => h.itemId === item.id).length;
        stats[item.id] = count;
      }
    });
    return stats;
  };

  const getTopItems = () => {
    const stats = getItemStats();
    return Object.entries(stats)
      .map(([id, count]) => ({ id: parseInt(id), count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const wornItemsOnDate = clothes.filter((item: any) => 
    !item.deletedAt && getWornItemsForDate(selectedDate).includes(item.id)
  );

  const itemStats = getItemStats();
  const topItems = getTopItems();
  const uniqueDates = getUniqueDates();
  const totalWears = history.length;
  const uniqueItemsWorn = Object.keys(itemStats).filter(id => itemStats[parseInt(id)] > 0).length;

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[date.getDay()];
  };

  const getCategoryName = (category: string) => {
    switch(category) {
      case 'top': return 'Верх';
      case 'bottom': return 'Низ';
      case 'shoes': return 'Обувь';
      case 'accessory': return 'Аксессуар';
      default: return category;
    }
  };

  return (
    <div style={{ padding: isDesktop ? 40 : 20, paddingBottom: 100, maxWidth: isDesktop ? 1200 : '100%', margin: '0 auto' }}>
      <div style={{ background: theme.primary, borderRadius: isDesktop ? 24 : 20, padding: isDesktop ? 32 : 24, marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: isDesktop ? 36 : 28, margin: 0, color: theme.primaryText }}>Календарь носки</h1>
        <p style={{ color: theme.primaryText, opacity: 0.8, marginTop: 8 }}>Отслеживайте как часто носите вещи</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: "transparent", borderRadius: 16, padding: 16, textAlign: 'center', border: `1px solid ${theme.secondary}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.primary }}>{totalWears}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>всего отметок</div>
        </div>
        <div style={{ background: "transparent", borderRadius: 16, padding: 16, textAlign: 'center', border: `1px solid ${theme.secondary}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.primary }}>{uniqueItemsWorn}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>вещей в ротации</div>
        </div>
        <div style={{ background: "transparent", borderRadius: 16, padding: 16, textAlign: 'center', border: `1px solid ${theme.secondary}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.primary }}>{uniqueDates.length}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>дней с отметками</div>
        </div>
      </div>

      {topItems.length > 0 && (
        <div style={{ background: "transparent", borderRadius: 16, padding: 20, marginBottom: 24, border: `1px solid ${theme.secondary}` }}>
          <h3 style={{ marginBottom: 16, color: theme.text }}>🏆 Чаще всего носите</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topItems.map((item, index) => {
              const foundItem = clothes.find((c: any) => c.id === item.id);
              if (!foundItem) return null;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, fontSize: 20, fontWeight: 700, color: theme.primary }}>#{index + 1}</div>
                  <img src={foundItem.img} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: theme.text }}>{foundItem.name}</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary }}>{getCategoryName(foundItem.category)}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{item.count}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>раз</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, color: theme.textSecondary }}>Выберите дату</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: `1px solid ${theme.secondary}`,
            background: "transparent",
            color: theme.text,
            fontSize: 16,
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: theme.text }}>
            {getDayName(selectedDate)}, {selectedDate.split('-').reverse().join('.')}
          </h3>
          <button
            onClick={() => setShowSelector(true)}
            style={{
              padding: '10px 20px',
              background: theme.primary,
              border: 'none',
              borderRadius: 25,
              color: theme.primaryText,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            + Отметить
          </button>
        </div>

        {wornItemsOnDate.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: "transparent", borderRadius: 16, border: `1px solid ${theme.secondary}` }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>👔</div>
            <p style={{ color: theme.textSecondary }}>Ничего не отмечено на этот день</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: 12 }}>
            {wornItemsOnDate.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: "transparent", padding: 12, borderRadius: 12, border: `1px solid ${theme.secondary}` }}>
                <img src={item.img} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: theme.text }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{СЕЗОНЫ.find((s: any) => s.id === item.season)?.name}</div>
                </div>
                <button onClick={() => toggleWearItem(item.id)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: theme.textSecondary }}>❌</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <div style={{
            background: "transparent",
            width: '100%',
            maxHeight: '80vh',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: theme.text }}>Отметить вещи на {selectedDate}</h3>
              <button onClick={() => setShowSelector(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.text }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>
              {clothes.filter((item: any) => !item.deletedAt).map((item: any) => {
                const isWorn = getWornItemsForDate(selectedDate).includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleWearItem(item.id)}
                    style={{
                      background: theme.bg,
                      padding: 12,
                      borderRadius: 12,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: isWorn ? `2px solid ${theme.primary}` : `1px solid ${theme.secondary}`,
                      opacity: isWorn ? 1 : 0.7,
                    }}
                  >
                    <img src={item.img} style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} alt="" />
                    <div style={{ fontSize: 12, fontWeight: 500, color: theme.text }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>
                      {itemStats[item.id] || 0} раз всего
                    </div>
                    {isWorn && <div style={{ marginTop: 4, fontSize: 11, color: theme.primary, fontWeight: 600 }}>✅ Отмечено</div>}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowSelector(false)}
              style={{
                width: '100%',
                padding: 14,
                background: theme.primary,
                border: 'none',
                borderRadius: 12,
                color: theme.primaryText,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 20,
              }}
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<'wardrobe' | 'capsules' | 'calendar'>('wardrobe');
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage('onboardingComplete', false);
  const [clothes, setClothes] = useLocalStorage<any[]>('clothes', []);
  const [capsules, setCapsules] = useLocalStorage<any[]>('capsules', []);
  const [history, setHistory] = useLocalStorage<any[]>('history', []);

  useEffect(() => {
    const theme = getTheme();
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
  }, []);

  if (!onboardingComplete) return <OnboardingSlider onComplete={() => setOnboardingComplete(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: getTheme().bg, paddingBottom: 80 }}>
      {currentScreen === 'wardrobe' && <WardrobeGrid clothes={clothes} setClothes={setClothes} />}
      {currentScreen === 'capsules' && <CapsulesPage capsules={capsules} setCapsules={setCapsules} clothes={clothes} />}
      {currentScreen === 'calendar' && <WearCalendar history={history} clothes={clothes} setHistory={setHistory} />}
      <BottomNavBar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
    </div>
  );
}

export default App;

export { getTheme, СЕЗОНЫ, ЦВЕТА, МАТЕРИАЛЫ, КАТЕГОРИИ, useMediaQuery, useTelegram };
