// 토스, 카카오뱅크 스타일 모던 테마
export const modernColors = {
  // FLUX 오렌지를 베이스로 한 절제된 컬러 팔레트
  primary: '#FF6B35',
  primaryLight: '#FF8A5B',
  primaryDark: '#E85A2B',
  
  // 중성 컬러 (미니멀 디자인)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F9FA',
  
  // 텍스트 (고대비)
  text: '#191F28',
  textSecondary: '#6B7684',
  textTertiary: '#9B9B9B',
  
  // 보더 (매우 연한)
  border: '#F2F4F6',
  borderLight: '#F8F9FA',
  
  // 상태 컬러 (절제된 톤)
  success: '#00C73C',
  error: '#FF5F56',
  warning: '#FFB800',
  
  // 카드 
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.04)',
};

export const spacing = {
  xs: 4,
  sm: 8, 
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};