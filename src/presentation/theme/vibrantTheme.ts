// 2024-2025 트렌디한 생동감 있는 테마
export const vibrantColors = {
  // FLUX 기반 모던 컬러 팔레트
  primary: '#FF6B35', // FLUX 오렌지
  primaryLight: '#FF8A65',
  primaryDark: '#E65100',
  
  // 보조 컬러 - 생동감 있는 그라디언트 베이스
  secondary: '#6366F1', // 인디고
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  
  accent: '#06B6D4', // 시안
  accentLight: '#22D3EE',
  accentDark: '#0891B2',
  
  // 새로운 트렌드 컬러
  success: '#10B981', // 에메랄드
  warning: '#F59E0B', // 앰버 
  error: '#EF4444', // 레드
  purple: '#8B5CF6', // 바이올렛
  pink: '#EC4899', // 핑크
  
  // 배경 - 다이나믹 그라디언트
  background: '#FAFAFA',
  backgroundGradient: ['#FFFFFF', '#F8FAFC'],
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // 텍스트 - 높은 대비
  text: '#0F172A',
  textSecondary: '#475569', 
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // 보더 
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // 카드 그림자
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  coloredShadow: 'rgba(255, 107, 53, 0.15)',
};

// 트렌디한 그라디언트
export const vibrantGradients = {
  primary: ['#FF6B35', '#FF8A65'], // FLUX 오렌지
  secondary: ['#6366F1', '#8B5CF6'], // 인디고 → 퍼플
  accent: ['#06B6D4', '#22D3EE'], // 시안
  success: ['#10B981', '#34D399'], // 에메랄드
  sunset: ['#FF6B35', '#EC4899'], // 선셋 
  ocean: ['#06B6D4', '#6366F1'], // 오션
  forest: ['#10B981', '#059669'], // 포레스트
  cosmic: ['#8B5CF6', '#EC4899'], // 코스믹
  
  // 카드별 그라디언트
  stakingCard: ['#8B5CF6', '#6366F1'],
  paymentCard: ['#10B981', '#06B6D4'], 
  swapCard: ['#FF6B35', '#F59E0B'],
  historyCard: ['#EC4899', '#8B5CF6'],
  
  // 배경 그라디언트
  headerBg: ['#FF6B35', '#EC4899', '#8B5CF6'],
  cardBg: ['#FFFFFF', '#F8FAFC'],
};

// 고급 타이포그래피
export const typography = {
  // 헤드라인
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  
  // 바디
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  
  // 캡션 & 라벨
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  
  // 버튼
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  buttonSmall: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
};

// 스페이싱 시스템
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// 고급 그림자
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: vibrantColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

// 애니메이션 설정
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
  bounce: {
    tension: 300,
    friction: 8,
  },
};