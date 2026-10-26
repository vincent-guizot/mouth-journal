import { theme } from './theme';

export interface CategoryPinStyle {
  background: string;     // Warna badan pin (teardrop)
  borderColor: string;    // Warna garis tepi pin
  innerCircleBg: string;  // Warna lingkaran dalam pin
  textColor: string;      // Warna teks / ikon di dalam pin
  glowColor: string;      // Warna efek bayangan & aura
  emoji: string;          // Emoji default
  label: string;          // Label nama kategori
}

export const MAP_PIN_THEME = {
  // 1. PINPOINT POSISI PENGGUNA (GPS ANDA)
  userLocation: {
    dotColor: '#2563EB',                    // Titik pusat GPS (Biru)
    borderColor: '#FFFFFF',
    pulseColor: 'rgba(37, 99, 235, 0.4)',  // Gelombang radar berdenyut
    size: 20,
  },

  // 2. PINPOINT KATEGORI FOOD (MAKANAN) - Menggunakan Terracotta #D06B3F
  food: {
    background: theme.colors.terracotta,    // #D06B3F
    borderColor: '#FFFFFF',
    innerCircleBg: '#FFFFFF',
    textColor: theme.colors.terracotta,
    glowColor: 'rgba(208, 107, 63, 0.45)',
    emoji: '🍽️',
    label: 'Food',
  } as CategoryPinStyle,

  // 3. PINPOINT KATEGORI DRINKS (MINUMAN / KAFE) - Menggunakan Coffee Brown #4E2E21
  drinks: {
    background: theme.colors.coffeeBrown,   // #4E2E21
    borderColor: '#FFFFFF',
    innerCircleBg: '#FFFFFF',
    textColor: theme.colors.caramel,
    glowColor: 'rgba(78, 46, 33, 0.45)',
    emoji: '☕',
    label: 'Drinks',
  } as CategoryPinStyle,

  // 4. PINPOINT KATEGORI WISATA (SPOT REKREASI / TAMAN) - Menggunakan Caramel Gold #D9A571
  wisata: {
    background: theme.colors.caramel,       // #D9A571
    borderColor: '#FFFFFF',
    innerCircleBg: '#FFFFFF',
    textColor: theme.colors.coffeeBrown,
    glowColor: 'rgba(217, 165, 113, 0.45)',
    emoji: '🎡',
    label: 'Wisata',
  } as CategoryPinStyle,

  // 5. PINPOINT SAAT DIPILIH (ACTIVE / SELECTED STATE)
  selectedPin: {
    ringColor: theme.colors.terracotta,     // Cincin Terracotta #D06B3F bercahaya
    ringWidth: 4,
    scale: 1.25,
    shadowColor: 'rgba(78, 46, 33, 0.45)',
  },

  // 6. UKURAN FISIK PINPOINT (TEARDROP GEOMETRY)
  geometry: {
    normalWidth: 32,
    normalHeight: 42,
    selectedWidth: 40,
    selectedHeight: 52,
  },
};

export function getPinStyleForCategory(category: string): CategoryPinStyle {
  if (category === 'drinks') return MAP_PIN_THEME.drinks;
  if (category === 'wisata') return MAP_PIN_THEME.wisata;
  return MAP_PIN_THEME.food;
}
