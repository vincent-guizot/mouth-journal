export const theme = {
  colors: {
    // 🎨 Official MouthJournal Brand Palette (From Brand Guidelines)
    coffeeBrown: '#4E2E21',   // Warna teks utama & logo wordmark (#4E2E21)
    espresso: '#6B3F2E',      // Warna aksen sekunder & shadow (#6B3F2E)
    terracotta: '#D06B3F',    // Warna brand primer (Active, CTA, Highlights) (#D06B3F)
    caramel: '#D9A571',       // Warna aksen keemasan & rating (#D9A571)
    cream: '#F8EAD9',         // Warna latar lembut & badge (#F8EAD9)

    // Aliases untuk Konsistensi Aplikasi
    primary: '#D06B3F',       // Terracotta
    primaryDark: '#4E2E21',   // Coffee Brown
    primaryLight: '#F8EAD9',  // Cream
    primaryHover: '#B9572E',
    
    // Accents & Ratings
    amber: '#D9A571',         // Caramel Honey
    amberDark: '#6B3F2E',     // Espresso
    amberLight: '#FDF3E7',    // Light Caramel Tint
    coffee: '#4E2E21',

    // Neutrals
    background: '#FAF5EE',    // Soft Warm Ivory Cream
    surface: '#FFFFFF',
    surfaceSubtle: '#F8EAD9', // Cream Tint
    card: '#FFFFFF',
    cardBorder: '#EFE3D3',    // Soft Cream Border
    
    // Typography
    textPrimary: '#4E2E21',   // Coffee Brown
    textSecondary: '#6B3F2E', // Espresso
    textTertiary: '#9E8579',  // Warm Muted Tan
    textInverted: '#FFFFFF',

    // Status
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#D9A571',
    error: '#DC2626',
    border: '#EFE3D3',
  },
  fonts: {
    handwriting: 'Caveat_600SemiBold',
    handwritingBold: 'Caveat_700Bold',
    serifBold: 'PlayfairDisplay_700Bold',
    serifMedium: 'PlayfairDisplay_600SemiBold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#4E2E21',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    floating: {
      shadowColor: '#D06B3F',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export const darkTheme = {
  colors: {
    coffeeBrown: '#F8EAD9',
    espresso: '#EFE3D3',
    terracotta: '#E07D53',
    caramel: '#E5B888',
    cream: '#2D1F18',
    primary: '#E07D53',
    primaryDark: '#F8EAD9',
    primaryLight: '#3D2C24',
    primaryHover: '#D06B3F',
    amber: '#E5B888',
    amberDark: '#D9A571',
    amberLight: '#38261E',
    coffee: '#F8EAD9',
    background: '#1A120E', // Deep Espresso Night
    surface: '#271C17',
    surfaceSubtle: '#33231C',
    card: '#271C17',
    cardBorder: '#3D2C24',
    textPrimary: '#F8EAD9',
    textSecondary: '#D9A571',
    textTertiary: '#B39A8E',
    textInverted: '#1A120E',
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#3D2C24',
  },
  fonts: theme.fonts,
  spacing: theme.spacing,
  borderRadius: theme.borderRadius,
  shadows: theme.shadows,
};

export type ThemeType = typeof theme;

export function getTheme(mode: 'light' | 'dark' | 'system' = 'light', isSystemDark: boolean = false): ThemeType {
  if (mode === 'dark') return darkTheme;
  if (mode === 'system' && isSystemDark) return darkTheme;
  return theme;
}

