import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';

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
  
  return { haptic };
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
            const reader = new FileReader();
            reader.onloadend = () => {
              onImageSelected(reader.result as string, file.name.split('.')[0]);
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
    { id: 'ai', label: 'ИИ' },
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
              onClick={() => onScreenChange(tab.id)} 
              style={navStyles.navButton}
            >
              {tab.id === 'home' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              )}
              {tab.id === 'ai' && (
                <span className="fancy-serif" style={{ color: '#FFFFFF', fontSize: '20px' }}>AI</span>
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
  const [currentScreen, setCurrentScreen] = useState<'home' | 'ai' | 'profile'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('top');
  const [newSeason, setNewSeason] = useState('summer');
  const [newColor, setNewColor] = useState('white');
  const [newMaterial, setNewMaterial] = useState('cotton');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [clothes, setClothes] = useLocalStorage<any[]>('clothes', []);
  const [outfits] = useLocalStorage<any[]>('outfits', []);

  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: 'ai', text: 'Привет! Скоро тут ИИ-стилист будет помогать собирать тебе образы!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const { haptic } = useTelegram();

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      
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
    document.head.appendChild(styleTag);

    document.body.style.backgroundColor = '#edecea';
    document.body.style.color = '#151414';
    if (document.documentElement) {
      document.documentElement.style.backgroundColor = '#edecea';
    }

    return () => {
      if (document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#edecea', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      
      {currentScreen === 'home' && (
        <div style={pageStyle}>
          
          <div style={headerStyles.headerContainer}>
            <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L15 30L26 6" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20C23.5 18 29.5 18 31.5 21.5C33 24 29 26.5 25 26.5C21 26.5 19 29.5 20.5 32C22.5 35 29.5 35 32 32.5" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 style={headerStyles.headerTitle} className="fancy-serif">ГЛАВНАЯ</h1>
            
            <button 
              onClick={() => {
                const query = prompt("Поиск вещей:", searchQuery);
                if (query !== null) setSearchQuery(query);
              }}
              style={headerStyles.searchBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="12" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div style={outfitStyles.sectionContainer}>
            <h2 style={outfitStyles.sectionTitle} className="fancy-serif">Аутфит сегодня</h2>
            
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
                            <img key={item.id || idx} src={item.img} alt="" style={outfitStyles.gridImage} />
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
                  {[
                    1, 2, 3, 4, 5, 6, 7,
                    8, 9, 10, 11, 12, 13, 14,
                    15, 16, 17, 18, 19, 20, 21,
                    22, 23, 24, 25, 26, 27, 28,
                    29, 30
                  ].map((day) => (
                    <div key={day} style={widgetStyles.dayCell}>
                      <span style={widgetStyles.dayNumber}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={homeStyles.buttonContainer}>
            <button 
              style={homeStyles.addBtn} 
              onClick={() => {
                setIsDrawerOpen(true);
                haptic('light');
              }}
            >
              <div style={homeStyles.plusCircle}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#151414" strokeWidth="1" strokeLinecap="round">
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                </svg>
              </div>
              <span style={homeStyles.btnText} className="fancy-serif">ДОБАВИТЬ ВЕЩЬ</span>
            </button>
          </div>

          {isDrawerOpen && (
            <div onClick={() => { setIsDrawerOpen(false); setNewName(''); setNewImage(null); }} style={drawerStyles.backdrop} />
          )}

          <div style={{ ...drawerStyles.drawer, display: isDrawerOpen ? 'flex' : 'none' }}>
            <div style={drawerStyles.header}>
              <div style={drawerStyles.headerLeft}>
                <span style={{ fontSize: '20px', color: '#151414', fontWeight: 'bold', marginRight: '6px' }}>+</span>
                <h3 style={drawerStyles.headerTitle}>Новая вещь</h3>
              </div>
              <button onClick={() => { setIsDrawerOpen(false); setNewName(''); setNewImage(null); }} style={drawerStyles.closeBtn}>✕</button>
            </div>

            <div style={drawerStyles.scrollContainer}>
              {!newImage ? (
                <PhotoPicker onImageSelected={(imgData: string, fileName: string) => {
                  setNewImage(imgData);
                  if (!newName) setNewName(fileName.slice(0, 20));
                }} />
              ) : (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden' }}>
                  <img src={newImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setNewImage(null)} style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(21, 20, 20, 0.8)', color: '#FFFFFF', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Заменить фото</button>
                </div>
              )}

              <input type="text" placeholder="Название вещи" value={newName} onChange={(e) => setNewName(e.target.value)} style={drawerStyles.input} />

              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={drawerStyles.select}>
                <option value="top">Верх</option>
                <option value="bottom">Низ</option>
                <option value="shoes">Обувь</option>
                <option value="accessory">Аксессуары</option>
              </select>

              <select value={newSeason} onChange={(e) => setNewSeason(e.target.value)} style={drawerStyles.select}>
                {СЕЗОНЫ.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select value={newColor} onChange={(e) => setNewColor(e.target.value)} style={drawerStyles.select}>
                {ЦВЕТА.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} style={drawerStyles.select}>
                {МАТЕРИАЛЫ.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>

              <div style={drawerStyles.actionsContainer}>
                <button 
                  onClick={() => {
                    if (!newName.trim()) { alert('Введите название вещи'); return; }
                    if (!newImage) { alert('Добавить фото вещи'); return; }
                    
                    const newItem = {
                      id: Date.now(),
                      name: newName,
                      category: newCategory,
                      season: newSeason,
                      color: newColor,
                      material: newMaterial,
                      img: newImage,
                      createdAt: new Date().toISOString(),
                      deletedAt: null,
                    };

                    setClothes([newItem, ...clothes]);
                    setIsDrawerOpen(false);
                    setNewName('');
                    setNewImage(null);
                    haptic('medium');
                  }} 
                  style={drawerStyles.saveBtn}
                >
                  Сохранить
                </button>
                <button onClick={() => { setIsDrawerOpen(false); setNewName(''); setNewImage(null); }} style={drawerStyles.cancelBtn}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'ai' && (
        <div style={pageStyle}>
          
          <div style={headerStyles.headerContainer}>
            <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L15 30L26 6" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20C23.5 18 29.5 18 31.5 21.5C33 24 29 26.5 25 26.5C21 26.5 19 29.5 20.5 32C22.5 35 29.5 35 32 32.5" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 style={headerStyles.headerTitle} className="fancy-serif">ИИ-СТИЛИСТ</h1>
            
            <button 
              onClick={() => {
                const query = prompt("Поиск по чату или вещам:", searchQuery);
                if (query !== null) setSearchQuery(query);
              }}
              style={headerStyles.searchBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="12" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div style={chatStyles.chatContainer}>
            <div style={chatStyles.messagesList}>
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={msg.id} style={{ ...chatStyles.messageRow, justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      ...chatStyles.bubble,
                      backgroundColor: isAI ? '#FFFFFF' : '#151414',
                      color: isAI ? '#151414' : '#FFFFFF',
                      borderRadius: isAI ? '20px 20px 24px 4px' : '20px 20px 4px 24px',
                      boxShadow: isAI ? '0px 4px 12px rgba(0,0,0,0.02)' : 'none'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={chatStyles.inputZone}>
              <input 
                type="text" 
                placeholder="Спроси у стилиста..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!chatInput.trim()) return;
                    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
                    setMessages(prev => [...prev, userMsg]);
                    setChatInput('');
                    haptic('light');
                  }
                }}
                style={chatStyles.chatInput}
              />
              <button 
                onClick={() => {
                  if (!chatInput.trim()) return;
                  const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
                  setMessages(prev => [...prev, userMsg]);
                  setChatInput('');
                  haptic('medium');
                }}
                style={chatStyles.sendBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'profile' && (
        <div style={pageStyle}>
          
          <div style={headerStyles.headerContainer}>
            <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L15 30L26 6" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20C23.5 18 29.5 18 31.5 21.5C33 24 29 26.5 25 26.5C21 26.5 19 29.5 20.5 32C22.5 35 29.5 35 32 32.5" stroke="#151414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 style={headerStyles.headerTitle} className="fancy-serif">ПРОФИЛЬ</h1>
            
            <button 
              onClick={() => {
                const query = prompt("Поиск по вещам в профиле:", searchQuery);
                if (query !== null) setSearchQuery(query);
              }}
              style={headerStyles.searchBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="12" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <ProfileGallery 
            clothes={clothes} 
            outfits={outfits} 
            searchQuery={searchQuery}
            haptic={haptic}
          />

        </div>
      )}

      <BottomNavBar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  padding: '16px 16px 120px 16px',
  boxSizing: 'border-box',
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
    zIndex: 9999,
    pointerEvents: 'none',
  },
  navBar: {
    display: 'flex',
    backgroundColor: '#151414',
    borderRadius: '24px', 
    padding: '12px 40px',
    alignItems: 'center',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'auto',
    width: '85%',
    maxWidth: '340px',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
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
  logoZone: {
    position: 'relative',
    width: '40px',
    height: '40px',
    userSelect: 'none',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '600',
    color: '#151414',
    textAlign: 'center',
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
    gridTemplateRows: '140px 170px', 
    gap: '12px', 
    width: '100%',
    boxSizing: 'border-box',
  },
  outfitCard: {
    gridRow: '1 / span 2', 
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
  },
  outfitName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B6A69',
    marginBottom: '12px',
    display: 'block',
  },
  itemsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    alignItems: 'center',
  },
  emptyGrid: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #D4D3D1',
  },
  gridImage: {
    width: '100%',
    aspectRatio: '1/1',
    objectFit: 'cover',
    borderRadius: '12px',
    backgroundColor: '#E6E5E3',
  },
};

const homeStyles: Record<string, React.CSSProperties> = {
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '85px',
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
    padding: '12px 14px',
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
    paddingTop: '8px',
  },
  weatherCity: {
    fontSize: '12px',
    fontWeight: '600',
    opacity: 0.9,
  },
  weatherTemp: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '6px 0',
  },
  hourItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '9px',
    gap: '1px',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '10px',
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
    fontSize: '8px',
    fontWeight: '700',
    color: '#A8A7A5',
    textAlign: 'center',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)', 
    rowGap: '4px', 
    columnGap: '2px',
  },
  dayCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '16px',
    boxSizing: 'border-box',
  },
  dayNumber: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#151414',
  },
};

const chatStyles: Record<string, React.CSSProperties> = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 210px)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '4px 4px 16px 4px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '80%',
    padding: '14px 18px',
    fontSize: '15px',
    lineHeight: '1.4',
    boxSizing: 'border-box',
  },
  inputZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'transparent',
    paddingTop: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '16px 20px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#151414',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
  },
  sendBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#151414',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    flexShrink: 0,
  },
};

const ProfileGallery = ({ clothes, outfits, searchQuery, haptic }: any) => {
  const [activeTab, setActiveTab] = useState<'capsules' | 'outfits' | 'clothes'>('clothes');

  const filteredClothes = clothes.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOutfits = outfits.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%', marginTop: '10px' }}>
      
      <div style={galleryStyles.tabsContainer}>
        {[
          { id: 'capsules', label: 'Капсулы' },
          { id: 'outfits', label: 'Аутфиты' },
          { id: 'clothes', label: 'Одежда' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                haptic('light');
              }}
              style={{
                ...galleryStyles.tabButton,
                color: isSelected ? '#151414' : '#8B8A89',
                borderBottom: isSelected ? '2px solid #151414' : '2px solid transparent',
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={galleryStyles.grid} className="profile-grid">
        
        {activeTab === 'capsules' && (
          <div style={galleryStyles.emptyState}>У вас пока нет созданных капсул</div>
        )}

        {activeTab === 'outfits' && (
          filteredOutfits.length > 0 ? (
            filteredOutfits.map((outfit: any) => (
              <div key={outfit.id} style={galleryStyles.card}>
                <div style={galleryStyles.outfitPreviewGrid}>
                  {outfit.items.slice(0, 4).map((item: any, idx: number) => (
                    <img key={item.id || idx} src={item.img} alt="" style={galleryStyles.gridImage} />
                  ))}
                </div>
                <span style={galleryStyles.cardTitle}>{outfit.name}</span>
              </div>
            ))
          ) : (
            <div style={galleryStyles.emptyState}>Нет сохраненных образов</div>
          )
        )}

        {activeTab === 'clothes' && (
          filteredClothes.length > 0 ? (
            filteredClothes.map((item: any) => (
              <div key={item.id} style={galleryStyles.card}>
                <div style={galleryStyles.imageWrapper}>
                  <img src={item.img} alt={item.name} style={galleryStyles.cardImage} />
                </div>
                <span style={galleryStyles.cardTitle}>{item.name}</span>
              </div>
            ))
          ) : (
            <div style={galleryStyles.emptyState}>Гардероб пуст. Добавьте вещи на главном экране</div>
          )
        )}

      </div>
    </div>
  );
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
    borderRadius: '14px',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
    boxSizing: 'border-box',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#E6E5E3',
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
  outfitPreviewGrid: {
    width: '100%',
    aspectRatio: '1/1',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '3px',
    backgroundColor: '#E6E5E3',
    borderRadius: '10px',
    padding: '3px',
    boxSizing: 'border-box',
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
};

export default App;
export { getTheme, СЕЗОНЫ, ЦВЕТА, МАТЕРИАЛЫ, КАТЕГОРИИ, useMediaQuery, useTelegram };