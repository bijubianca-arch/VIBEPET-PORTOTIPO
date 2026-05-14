import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  ShoppingBag, 
  Calendar, 
  ClipboardList, 
  Home, 
  Coins, 
  Plus,
  ArrowLeft,
  Check,
  Settings,
  Mail,
  Heart,
  LogOut,
  Camera,
  Image as ImageIcon,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { Task, ShopItem, AppState } from './types';
import { INITIAL_TASKS, SHOP_ITEMS, MASCOT_MESSAGES, PET_TYPES, BACKGROUNDS, PROMO_CODES } from './constants';

// --- Components ---

const ProgressBar = ({ value, label }: { value: number, label: string }) => (
  <div className="w-full flex flex-col gap-1 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border-2 border-stone-800/10">
    <div className="flex justify-between items-center text-xs font-bold text-stone-600 uppercase tracking-wider">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-6 w-full bg-stone-200 rounded-full border-2 border-stone-800 overflow-hidden relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className="h-full bg-green-500 transition-all duration-500"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-1/2 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  </div>
);

const NavButton = ({ active, icon: Icon, onClick, isDarkMode }: { active: boolean, icon: any, onClick: () => void, isDarkMode?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-2xl transition-all duration-300 flex items-center justify-center border-4",
      active 
        ? (isDarkMode ? "bg-stone-800 border-amber-500 text-amber-500 shadow-lg -translate-y-2 scale-110" : "bg-amber-100 border-amber-900 text-amber-900 scale-110 shadow-lg -translate-y-2")
        : (isDarkMode ? "bg-stone-900 border-stone-800 text-stone-600 hover:text-stone-400" : "bg-white border-stone-800 text-stone-400 hover:text-stone-600")
    )}
  >
    <Icon size={28} strokeWidth={2.5} />
  </button>
);

export default function App() {
  const [view, setView] = useState<'home' | 'tasks' | 'shop' | 'calendar' | 'profile'>('home');
  const [messageIndex, setMessageIndex] = useState<number | null>(0);
  const [userAvatar, setUserAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('vibepet_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist
      if (!parsed.petType) parsed.petType = 'fox';
      if (!parsed.background) parsed.background = BACKGROUNDS[0].url;
      if (typeof parsed.lastTaskUpdate !== 'number') parsed.lastTaskUpdate = Date.now();
      if (parsed.isDarkMode === undefined) parsed.isDarkMode = false;
      return parsed;
    }
    return {
      points: 0,
      happiness: 0,
      tasks: INITIAL_TASKS,
      inventory: [],
      petType: 'fox',
      background: BACKGROUNDS[0].url,
      equipped: { hat: null, shirt: null, accessory: null },
      history: {},
      lastTaskUpdate: Date.now(),
      isDarkMode: false
    };
  });

  useEffect(() => {
    localStorage.setItem('vibepet_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const diffInMs = now - prev.lastTaskUpdate;
        const hoursPassed = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (hoursPassed > 0 && prev.happiness > 0) {
           const shouldBeHappiness = prev.happiness - 1;
           return {
             ...prev,
             happiness: Math.max(0, shouldBeHappiness)
           };
        }
        return prev;
      });
    }, 1000 * 60 * 12); 
    
    return () => clearInterval(decayInterval);
  }, []);

  useEffect(() => {
    const cycleMessage = () => {
      const nextIndex = Math.floor(Math.random() * MASCOT_MESSAGES.length);
      setMessageIndex(nextIndex);
      
      setTimeout(() => {
        setMessageIndex(null);
      }, 7000);
    };

    cycleMessage();
    const interval = setInterval(cycleMessage, 37000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // Actions
  const toggleTask = (id: string) => {
    setState(prev => {
      const newTasks = prev.tasks.map(t => {
        if (t.id === id) {
          const completed = !t.completed;
          return { ...t, completed };
        }
        return t;
      });

      const task = prev.tasks.find(t => t.id === id);
      const pointsChange = task?.completed ? -(task.points) : (task?.points || 0);
      const happinessChange = task?.completed ? -10 : 10;

      return {
        ...prev,
        tasks: newTasks,
        points: Math.max(0, prev.points + pointsChange),
        happiness: Math.min(100, Math.max(0, prev.happiness + happinessChange)),
        lastTaskUpdate: Date.now()
      };
    });
  };

  const buyItem = (item: ShopItem) => {
    if (state.points < item.price) return;
    if (state.inventory.includes(item.id)) return;

    setState(prev => ({
      ...prev,
      points: prev.points - item.price,
      inventory: [...prev.inventory, item.id],
      happiness: Math.min(100, prev.happiness + 5)
    }));
  };

  const equipItem = (item: ShopItem) => {
    setState(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [item.type]: prev.equipped[item.type] === item.id ? null : item.id
      }
    }));
  };

  const currentEquipped = (type: 'hat' | 'shirt' | 'accessory') => {
    const id = state.equipped[type];
    return SHOP_ITEMS.find(i => i.id === id);
  };

  const changePet = (petId: any, price: number) => {
    if (state.points < price && !state.inventory.includes(petId)) return;
    setState(prev => ({
      ...prev,
      points: prev.inventory.includes(petId) ? prev.points : prev.points - price,
      inventory: Array.from(new Set([...prev.inventory, petId])),
      petType: petId
    }));
  };

  const changeBackground = (bgUrl: string, price: number, bgId: string) => {
    if (state.points < price && !state.inventory.includes(bgId)) return;
    setState(prev => ({
      ...prev,
      points: prev.inventory.includes(bgId) ? prev.points : prev.points - price,
      inventory: Array.from(new Set([...prev.inventory, bgId])),
      background: bgUrl
    }));
  };

  const redeemCode = () => {
    const code = PROMO_CODES[promoInput.trim()];
    if (!code) {
      setPromoError('Código inválido! Tente novamente.');
      setPromoSuccess('');
      return;
    }

    setState(prev => {
      let newPoints = prev.points + (code.points || 0);
      let newInventory = [...prev.inventory];
      let newPetType = prev.petType;
      let newBackground = prev.background;

      if (code.petId) {
        newInventory = Array.from(new Set([...newInventory, code.petId]));
        newPetType = code.petId as any;
      }

      if (code.backgroundId) {
        const bg = BACKGROUNDS.find(b => b.id === code.backgroundId);
        newInventory = Array.from(new Set([...newInventory, code.backgroundId]));
        if (bg) newBackground = bg.url;
      }

      return {
        ...prev,
        points: newPoints,
        inventory: newInventory,
        petType: newPetType,
        background: newBackground
      };
    });

    setPromoSuccess('Código resgatado com sucesso! 🎉');
    setPromoError('');
    setPromoInput('');
    setTimeout(() => {
      setIsPromoModalOpen(false);
      setPromoSuccess('');
    }, 2000);
  };

  const renderHome = () => (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background with Nature */}
      <div className="absolute inset-0 z-0">
        <img 
          src={state.background} 
          className={cn(
            "w-full h-full object-cover transition-all duration-1000",
            state.isDarkMode ? "brightness-[0.4] contrast-[1.2]" : "brightness-100"
          )} 
          alt="Nature"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0",
          state.isDarkMode ? "bg-stone-900/60" : "bg-stone-900/10"
        )} />
      </div>

      {/* Header Stats */}
      <div className="relative z-10 p-6 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className={cn(
            "backdrop-blur-md px-4 py-2 rounded-full border-2 border-stone-800 flex items-center gap-2 shadow-sm",
            state.isDarkMode ? "bg-stone-900/80 text-amber-500" : "bg-white/80 text-stone-800"
          )}>
            <Coins className="text-amber-500" size={20} fill="currentColor" />
            <span className="font-bold tabular-nums">{state.points}</span>
            <button 
              onClick={() => setIsPromoModalOpen(true)}
              className="bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white border border-stone-800 active:scale-90 transition-transform"
            >
              <Plus size={12} strokeWidth={4} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={toggleDarkMode}
            className={cn(
              "w-12 h-12 backdrop-blur-md rounded-xl border-2 border-stone-800 flex items-center justify-center shadow-sm active:scale-95 transition-transform",
              state.isDarkMode ? "bg-stone-800/80 text-amber-400" : "bg-white/80 text-amber-500"
            )}
          >
            {state.isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <button 
            onClick={() => setView('profile')}
            className={cn(
              "w-12 h-12 backdrop-blur-md rounded-xl border-2 border-stone-800 flex items-center justify-center overflow-hidden shadow-sm active:scale-95 transition-transform",
              state.isDarkMode ? "bg-stone-800/80" : "bg-white/80"
            )}
          >
            <img src={userAvatar} alt="User" />
          </button>
        </div>
      </div>

      {/* Mascot Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center pb-20">
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              y: -100,
              x: Math.sin(i) * 20
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "linear"
            }}
            className="absolute text-yellow-200/40 pointer-events-none"
            style={{ 
              left: `${15 + i * 15}%`,
              bottom: '30%',
              fontSize: `${10 + i * 2}px`
            }}
          >
            ✨
          </motion.div>
        ))}

        <div className="relative group cursor-pointer active:scale-95 transition-transform">

          {/* Stump */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-stone-800/20 rounded-[100%] blur-xl" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-20 bg-stone-700 rounded-b-3xl border-b-8 border-stone-900" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-16 bg-stone-600 rounded-full border-4 border-stone-800" />
          
          {/* Mascot Rendering */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -1, 1, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="text-[120px] filter drop-shadow-2xl relative z-20">
               {PET_TYPES.find(p => p.id === state.petType)?.emoji || '🦊'}
            </div>

            {/* Clothes Overlays */}
            <AnimatePresence>
               {state.equipped.shirt && (
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-5xl z-30 pointer-events-none drop-shadow-lg"
                 >
                   {currentEquipped('shirt')?.image}
                 </motion.div>
               )}
               {state.equipped.hat && (
                 <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl z-30 pointer-events-none drop-shadow-lg"
                 >
                   {currentEquipped('hat')?.image}
                 </motion.div>
               )}
               {state.equipped.accessory && (
                 <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-10 right-0 text-4xl z-30 pointer-events-none drop-shadow-lg"
                 >
                   {currentEquipped('accessory')?.image}
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Floating Greeting */}
        <AnimatePresence>
          {messageIndex !== null && (
            <motion.div 
              key={messageIndex}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className={cn(
                "absolute top-[15%] left-1/2 -translate-x-1/2 p-4 rounded-2xl border-2 border-stone-800 shadow-xl text-sm font-bold z-30 w-[220px] text-center flex items-center justify-center min-h-[80px]",
                state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
              )}
            >
              {MASCOT_MESSAGES[messageIndex]}
              {/* Speech Bubble Arrow - Centered */}
              <div className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border-b-2 border-r-2 border-stone-800 rotate-45",
                state.isDarkMode ? "bg-stone-800" : "bg-white"
              )} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Happiness Bar Wrapper with Emoji */}
      <div className="relative z-10 px-8 pb-12 mt-auto">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 border-4 border-stone-800 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden",
            state.isDarkMode ? "bg-stone-900 shadow-inner" : "bg-green-200"
          )}>
            <span className="text-3xl">
              {state.happiness > 80 ? '😊' : state.happiness > 50 ? '🙂' : state.happiness > 20 ? '😐' : '😢'}
            </span>
          </div>
          <div className="flex-1">
            <ProgressBar value={state.happiness} label="Felicidade" />
            <div className="px-2 mt-1 flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
              <span>Última atividade: {state.lastTaskUpdate ? format(state.lastTaskUpdate, 'HH:mm') : '--:--'}</span>
              {state.lastTaskUpdate && Math.floor((Date.now() - state.lastTaskUpdate) / (1000 * 60 * 60)) > 0 && (
                <span className="text-red-400 animate-pulse">Perdendo felicidade...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className={cn(
      "flex-1 p-6 pt-12 overflow-y-auto",
      state.isDarkMode ? "bg-stone-900" : "bg-amber-50/50"
    )}>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('home')} 
          className={cn(
            "p-2 border-2 border-stone-800 rounded-xl",
            state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
          )}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={cn("text-3xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>Tasks</h2>
      </div>

      <div className="space-y-4">
        {state.tasks.map(task => (
          <motion.div 
            key={task.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTask(task.id)}
            className={cn(
              "p-5 rounded-2xl border-4 flex items-center gap-4 transition-all cursor-pointer shadow-sm",
              task.completed 
                ? (state.isDarkMode ? "bg-green-950 border-green-800 text-green-300 opacity-80" : "bg-green-100 border-green-700 text-green-900 opacity-80")
                : (state.isDarkMode ? "bg-stone-800 border-stone-700 text-stone-200" : "bg-white border-stone-800 text-stone-800")
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0",
              task.completed ? "border-green-700 bg-green-500 text-white" : "border-stone-400"
            )}>
              {task.completed ? <Check size={18} strokeWidth={4} /> : null}
            </div>
            <div className="flex-1">
              <span className={cn("font-bold text-lg", task.completed && "line-through")}>
                {task.title}
              </span>
              <div className="flex items-center gap-1 text-xs font-black opacity-60">
                <Coins size={12} fill="currentColor" />
                <span>+{task.points} pts</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white border-4 border-dashed border-stone-300 rounded-3xl flex flex-col items-center justify-center text-stone-400 gap-2">
        <Plus size={32} />
        <span className="font-bold">Adicionar Nova Tarefa</span>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className={cn(
      "flex-1 p-6 pt-12 overflow-y-auto",
      state.isDarkMode ? "bg-stone-900" : "bg-sky-50/50"
    )}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className={cn(
            "p-2 border-2 border-stone-800 rounded-xl",
            state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
          )}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={cn("text-3xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>Loja</h2>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full border-2 border-stone-800 flex items-center gap-2 shadow-sm font-bold",
          state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
        )}>
          <Coins className="text-amber-500" size={16} fill="currentColor" />
          <span>{state.points}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-20">
        {SHOP_ITEMS.map(item => {
          const isOwned = state.inventory.includes(item.id);
          const isEquipped = Object.values(state.equipped).includes(item.id);
          const canAfford = state.points >= item.price;

          return (
            <motion.div 
              key={item.id}
              className={cn(
                "p-4 rounded-3xl border-4 flex flex-col items-center gap-3 transition-all relative overflow-hidden",
                isEquipped 
                  ? (state.isDarkMode ? "border-sky-500 bg-stone-800" : "border-sky-500 bg-sky-50") 
                  : (state.isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-800")
              )}
            >
              <div className="text-5xl my-2 drop-shadow-md">{item.image}</div>
              <div className="text-center">
                <div className={cn("font-bold leading-tight", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>{item.name}</div>
                {!isOwned && (
                  <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-600 mt-1">
                    <Coins size={12} fill="currentColor" />
                    <span>{item.price}</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => isOwned ? equipItem(item) : buyItem(item)}
                disabled={!isOwned && !canAfford}
                className={cn(
                  "w-full py-2 rounded-xl border-2 font-bold text-sm shadow-sm transition-all active:scale-95",
                  isOwned 
                    ? isEquipped ? "bg-red-500 border-stone-800 text-white" : "bg-sky-500 border-stone-800 text-white"
                    : canAfford ? "bg-green-400 border-stone-800 text-stone-900" : (state.isDarkMode ? "bg-stone-700 border-stone-600 text-stone-500" : "bg-stone-200 border-stone-300 text-stone-400")
                )}
              >
                {isOwned ? (isEquipped ? 'Remover' : 'Equipar') : 'Comprar'}
              </button>

              {isOwned && !isEquipped && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full border-2 border-stone-800">
                  <Check size={8} strokeWidth={4} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
      <div className={cn(
        "flex-1 p-6 pt-12 overflow-y-auto",
        state.isDarkMode ? "bg-stone-900" : "bg-stone-50"
      )}>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('home')} className={cn(
            "p-2 border-2 border-stone-800 rounded-xl",
            state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
          )}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={cn("text-3xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>Progresso</h2>
        </div>

        <div className={cn(
          "p-6 rounded-[2.5rem] border-4 border-stone-800 shadow-xl",
          state.isDarkMode ? "bg-stone-800" : "bg-white"
        )}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl uppercase tracking-widest text-stone-400">
              {format(today, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex gap-2">
              <div className={cn("w-8 h-8 rounded-lg border-2 border-stone-800 flex items-center justify-center", state.isDarkMode ? "bg-stone-900 text-stone-100" : "bg-stone-100 text-stone-800")}>
                <ArrowLeft size={16} />
              </div>
              <div className={cn("w-8 h-8 rounded-lg border-2 border-stone-800 flex items-center justify-center rotate-180", state.isDarkMode ? "bg-stone-900 text-stone-100" : "bg-stone-100 text-stone-800")}>
                <ArrowLeft size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <div key={d} className="text-center font-black text-stone-400 text-xs mb-2">{d}</div>
            ))}
            {daysInMonth.map(d => {
              const completed = d === today.getDate() ? state.tasks.filter(t => t.completed).length : Math.floor(Math.random() * 5);
              const intensity = completed / 5;
              
              return (
                <div 
                  key={d} 
                  className={cn(
                    "aspect-square rounded-xl border-2 border-stone-800 flex items-center justify-center text-sm font-bold relative overflow-hidden",
                    d === today.getDate() ? "bg-amber-100 scale-110 shadow-md z-10" : (state.isDarkMode ? "bg-stone-900 text-stone-400" : "bg-stone-50 text-stone-800")
                  )}
                >
                  <div 
                    className="absolute inset-0 bg-green-400 opacity-60" 
                    style={{ height: `${intensity * 100}%`, top: 'auto', bottom: 0 }}
                  />
                  <span className="relative z-10">{d}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between border-t-2 border-stone-700/20 pt-6">
            <div className="text-center">
              <div className={cn("text-2xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>12</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dias Seguidos</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>84%</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Média Mensal</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>142</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Concluido</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className={cn(
      "flex-1 p-6 pt-12 overflow-y-auto",
      state.isDarkMode ? "bg-stone-900" : "bg-white"
    )}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('home')} className={cn(
          "p-2 border-2 border-stone-800 rounded-xl",
          state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-800"
        )}>
          <ArrowLeft size={20} />
        </button>
        <h2 className={cn("text-3xl font-black", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>Perfil</h2>
      </div>

      {/* User Header */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="relative">
          <div className={cn("w-24 h-24 rounded-3xl border-4 border-stone-800 overflow-hidden shadow-lg", state.isDarkMode ? "bg-stone-800" : "bg-stone-100")}>
            <img src={userAvatar} alt="Profile" />
          </div>
          <button 
            onClick={() => setUserAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
            className="absolute -bottom-2 -right-2 p-2 bg-amber-400 border-2 border-stone-800 rounded-xl shadow-md active:scale-90 transition-transform"
          >
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center">
          <h3 className={cn("text-xl font-bold", state.isDarkMode ? "text-stone-100" : "text-stone-800")}>Usuário VibePet</h3>
          <p className="text-sm text-stone-500 font-medium">Desde Abril 2024</p>
        </div>
      </div>

      {/* Grid Menu Settings */}
      <div className="space-y-6">
        {/* Pets Selection */}
        <section>
          <h4 className="font-black text-xs uppercase tracking-widest text-stone-400 mb-3 ml-1">Mudar Mascote</h4>
          <div className="grid grid-cols-4 gap-2">
            {PET_TYPES.map(pet => (
              <button 
                key={pet.id}
                onClick={() => changePet(pet.id, pet.price)}
                className={cn(
                  "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all",
                  state.petType === pet.id 
                    ? (state.isDarkMode ? "bg-amber-900/40 border-amber-500 scale-105" : "bg-amber-100 border-amber-600 scale-105") 
                    : (state.isDarkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-200")
                )}
              >
                <span className="text-2xl">{pet.emoji}</span>
                {pet.price > 0 && !state.inventory.includes(pet.id) && (
                  <div className="flex items-center gap-0.5 text-[8px] font-black mt-1 text-amber-500">
                    <Coins size={6} fill="currentColor" /> {pet.price}
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Backgrounds Selection */}
        <section>
          <h4 className="font-black text-xs uppercase tracking-widest text-stone-400 mb-3 ml-1">Ambientes</h4>
          <div className="grid grid-cols-2 gap-3 pb-10">
            {BACKGROUNDS.map(bg => (
              <button 
                key={bg.id}
                onClick={() => changeBackground(bg.url, bg.price, bg.id)}
                className={cn(
                  "p-2 rounded-2xl border-2 flex flex-col gap-2 transition-all text-left",
                  state.background === bg.url 
                    ? (state.isDarkMode ? "bg-stone-800 border-sky-600 ring-2 ring-sky-500 ring-offset-2 ring-offset-stone-900" : "bg-sky-100 border-sky-600 ring-2 ring-sky-500 ring-offset-2") 
                    : (state.isDarkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-200")
                )}
              >
                <div className="w-full h-12 rounded-lg overflow-hidden border border-stone-700/20">
                  <img src={bg.url} className="w-full h-full object-cover" alt={bg.name} />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={cn("font-bold text-xs", state.isDarkMode ? "text-stone-200" : "text-stone-800")}>{bg.name}</span>
                  {bg.price > 0 && !state.inventory.includes(bg.id) && (
                    <div className="flex items-center gap-0.5 text-[8px] font-black text-amber-500">
                      <Coins size={8} fill="currentColor" /> {bg.price}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Support & Development */}
        <div className="space-y-2">
           <button className={cn(
             "w-full p-4 rounded-2xl border-2 border-stone-800 flex items-center justify-between group active:scale-[0.98] transition-all",
             state.isDarkMode ? "bg-red-950/20 text-red-400" : "bg-red-50 text-red-900"
           )}>
             <div className="flex items-center gap-3">
               <Heart className="group-hover:scale-110 transition-transform" fill="currentColor" />
               <span className="font-bold text-sm">Apoie-nos (Doação)</span>
             </div>
             <Plus size={20} />
           </button>
        </div>

        {/* Other Options */}
        <div className={cn("rounded-3xl border-2 p-2", state.isDarkMode ? "bg-stone-950 border-stone-800" : "bg-stone-50 border-stone-800/10")}>
          <SettingsItem icon={Settings} label="Configurações do App" isDarkMode={state.isDarkMode} />
          <SettingsItem icon={Mail} label="Contatar Suporte" isDarkMode={state.isDarkMode} />
          <SettingsItem icon={User} label="Mudar de Conta" isDarkMode={state.isDarkMode} />
          <SettingsItem icon={LogOut} label="Sair" variant="danger" isDarkMode={state.isDarkMode} />
        </div>
      </div>
      
      <div className="mt-8 text-center pb-8">
        <p className="text-xs text-stone-400 font-bold">VibePet v1.0.4 - Feito com ❤️</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "mobile-container overflow-hidden transition-colors duration-500",
      state.isDarkMode ? "bg-stone-950" : "bg-white"
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={cn(
            "flex-1 flex flex-col overflow-hidden",
            state.isDarkMode ? "text-stone-100" : "text-stone-900"
          )}
        >
          {view === 'home' && renderHome()}
          {view === 'tasks' && renderTasks()}
          {view === 'shop' && renderShop()}
          {view === 'calendar' && renderCalendar()}
          {view === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className={cn(
        "p-6 border-t-4 border-stone-800 flex justify-between items-center relative z-20 transition-colors duration-500",
        state.isDarkMode ? "bg-stone-950" : "bg-white"
      )}>
        <NavButton icon={ClipboardList} active={view === 'tasks'} onClick={() => setView('tasks')} isDarkMode={state.isDarkMode} />
        <NavButton icon={Home} active={view === 'home'} onClick={() => setView('home')} isDarkMode={state.isDarkMode} />
        <NavButton icon={ShoppingBag} active={view === 'shop'} onClick={() => setView('shop')} isDarkMode={state.isDarkMode} />
        <NavButton icon={Calendar} active={view === 'calendar'} onClick={() => setView('calendar')} isDarkMode={state.isDarkMode} />
      </div>

      {/* Promo Code Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromoModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full rounded-[2.5rem] border-4 border-stone-800 p-8 shadow-2xl",
                state.isDarkMode ? "bg-stone-800 text-stone-100" : "bg-white text-stone-800"
              )}
            >
              <h3 className="text-2xl font-black mb-2">Resgatar Código</h3>
              <p className={cn("text-sm font-bold mb-6", state.isDarkMode ? "text-stone-400" : "text-stone-500")}>Insira um código promocional para ganhar prêmios exclusivos!</p>
              
              <input 
                autoFocus
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Ex: VOAMASCUTE"
                className={cn(
                  "w-full p-4 border-2 border-stone-800 rounded-2xl font-black text-center tracking-widest outline-none focus:ring-4 ring-amber-400/20 mb-2",
                  state.isDarkMode ? "bg-stone-950 text-stone-100 placeholder:text-stone-700" : "bg-stone-100 text-stone-800 placeholder:text-stone-300"
                )}
              />

              {promoError && <p className="text-red-500 text-xs font-bold mb-4 text-center">{promoError}</p>}
              {promoSuccess && <p className="text-green-600 text-xs font-bold mb-4 text-center">{promoSuccess}</p>}

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsPromoModalOpen(false)}
                  className={cn(
                    "flex-1 py-4 border-2 border-stone-800 rounded-2xl font-black active:scale-95 transition-transform",
                    state.isDarkMode ? "bg-stone-700 text-stone-100" : "bg-stone-100 text-stone-800"
                  )}
                >
                  Fechar
                </button>
                <button 
                  onClick={redeemCode}
                  className="flex-[2] py-4 bg-amber-400 border-2 border-stone-800 rounded-2xl font-black text-stone-800 shadow-[0_4px_0_0_#292524] active:translate-y-1 active:shadow-none transition-all"
                >
                  Resgatar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SettingsItem = ({ icon: Icon, label, variant = 'default', isDarkMode }: { icon: any, label: string, variant?: 'default' | 'danger', isDarkMode?: boolean }) => (
  <button className={cn(
    "w-full p-4 flex items-center justify-between rounded-2xl transition-colors",
    isDarkMode ? "hover:bg-stone-900" : "hover:bg-stone-100",
    variant === 'danger' ? "text-red-500" : (isDarkMode ? "text-stone-300" : "text-stone-700")
  )}>
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
    <ArrowLeft size={16} className="rotate-180 opacity-40 shrink-0" />
  </button>
);
