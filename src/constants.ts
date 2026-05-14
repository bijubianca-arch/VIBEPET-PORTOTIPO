import { ShopItem, Task } from './types';

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Beber água (Copos)', completed: false, points: 20 },
  { id: '2', title: 'Café da manhã saudável', completed: false, points: 50 },
  { id: '3', title: 'Almoço nutritivo', completed: false, points: 50 },
  { id: '4', title: 'Lanche da tarde / Fruta', completed: false, points: 30 },
  { id: '5', title: 'Jantar leve', completed: false, points: 50 },
  { id: '6', title: 'Escovar os dentes (Manhã)', completed: false, points: 20 },
  { id: '7', title: 'Escovar os dentes (Noite)', completed: false, points: 20 },
  { id: '8', title: 'Caminhada de 15 min', completed: false, points: 100 },
  { id: '9', title: 'Meditar por 5 min', completed: false, points: 60 },
];

export const MASCOT_MESSAGES = [
  "Olá! Já bebeu água hoje? 💧",
  "Você está indo muito bem! Continue assim! ✨",
  "Um pequeno passo hoje é um grande salto amanhã! 👣",
  "Que tal esticar as pernas um pouquinho? 🚶",
  "Estou tão feliz em ver você se cuidando! 😊",
  "Lembre-se de respirar fundo e relaxar. 🧘",
  "Cada tarefa concluída me deixa mais saudável também! 🦊",
  "Sua saúde é o seu maior tesouro! 💎",
  "Não esqueça de escovar os dentes, hein! 🪥",
  "Um sorriso seu ilumina meu dia! ☀️",
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'h1', name: 'Chapéu de Palha', price: 200, type: 'hat', image: '👒' },
  { id: 'h2', name: 'Boné Esportivo', price: 350, type: 'hat', image: '🧢' },
  { id: 'h3', name: 'Coroa de Ouro', price: 1000, type: 'hat', image: '👑' },
  { id: 's1', name: 'Camiseta Básica', price: 150, type: 'shirt', image: '👕' },
  { id: 's2', name: 'Capa de Super-Herói', price: 500, type: 'shirt', image: '🦸' },
  { id: 's3', name: 'Terno Elegante', price: 800, type: 'shirt', image: '👔' },
  { id: 'a1', name: 'Óculos de Sol', price: 300, type: 'accessory', image: '🕶️' },
  { id: 'a2', name: 'Cachecol de Lã', price: 250, type: 'accessory', image: '🧣' },
  { id: 'a3', name: 'Gravata Borboleta', price: 400, type: 'accessory', image: '🎀' },
];

export const PET_TYPES = [
  { id: 'fox', name: 'Raposa', emoji: '🦊', price: 0 },
  { id: 'cat', name: 'Gatinho', emoji: '🐱', price: 500 },
  { id: 'dog', name: 'Cachorrinho', emoji: '🐶', price: 500 },
  { id: 'rabbit', name: 'Coelhinho', emoji: '🐰', price: 800 },
  { id: 'eagle', name: 'Águia', emoji: '🦅', price: 1200 },
];

export const BACKGROUNDS = [
  { id: 'forest', name: 'Floresta', url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200', price: 0 },
  { id: 'beach', name: 'Praia', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', price: 1000 },
  { id: 'space', name: 'Espaço', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', price: 2000 },
  { id: 'mountain', name: 'Montanha', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', price: 1500 },
  { id: 'mountain_house', name: 'Casa nas Montanhas', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200', price: 2500 },
];

export const PROMO_CODES: Record<string, { points?: number, petId?: string, backgroundId?: string }> = {
  'yasmin666': { points: 99999 },
  'boasvindas': { points: 100 },
  'profesorAlex': { points: 400, petId: 'eagle' },
  'cenariovibe': { backgroundId: 'mountain_house' },
};
