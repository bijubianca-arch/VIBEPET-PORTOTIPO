export interface Task {
  id: string;
  title: string;
  completed: boolean;
  points: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'hat' | 'shirt' | 'accessory';
  image: string;
  color?: string;
}

export interface AppState {
  points: number;
  happiness: number;
  tasks: Task[];
  inventory: string[];
  petType: 'fox' | 'cat' | 'dog' | 'rabbit';
  background: string;
  equipped: {
    hat: string | null;
    shirt: string | null;
    accessory: string | null;
  };
  history: Record<string, number>;
  lastTaskUpdate: number;
  isDarkMode: boolean;
}
