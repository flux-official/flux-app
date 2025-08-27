export interface MerchantScenario {
  id: string;
  name: string;
  product: string;
  amount: string;
  preferredToken: 'MTK1' | 'MTK2' | 'MTK3';
  preferredChainId: number; // 상점이 선호하는 체인
  logo: string;
  category: string;
  description?: string;
  location?: string;
}

export const MERCHANT_SCENARIOS: MerchantScenario[] = [
  {
    id: 'starbucks_gangnam',
    name: '스타벅스 강남점',
    product: '아이스 아메리카노',
    amount: '4500',
    preferredToken: 'MTK1',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '☕',
    category: '카페',
    description: '시원한 아이스 아메리카노 한 잔',
    location: '강남역 2번 출구'
  },
  {
    id: 'gs25_yeoksam',
    name: 'GS25 역삼점',
    product: '말보로 담배',
    amount: '4500',
    preferredToken: 'MTK2',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '🏪',
    category: '편의점',
    description: '말보로 골드 1갑',
    location: '역삼역 근처'
  },
  {
    id: 'mcdonalds_sinchon',
    name: '맥도날드 신촌점',
    product: '빅맥 세트',
    amount: '7900',
    preferredToken: 'MTK3',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🍔',
    category: '패스트푸드',
    description: '빅맥 세트 (감자튀김 + 콜라)',
    location: '신촌역 1번 출구'
  },
  {
    id: 'oliveyoung_hongdae',
    name: '올리브영 홍대점',
    product: '립밤 + 핸드크림',
    amount: '12000',
    preferredToken: 'MTK1',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '💄',
    category: '화장품',
    description: '니베아 립밤 + 바세린 핸드크림',
    location: '홍대입구역 9번 출구'
  },
  {
    id: 'kyobo_gwanghwamun',
    name: '교보문고 광화문점',
    product: '개발서적 2권',
    amount: '45000',
    preferredToken: 'MTK2',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오  
    logo: '📚',
    category: '서점',
    description: 'Clean Code + 리팩토링 2판',
    location: '광화문역 지하 연결통로'
  },
  {
    id: 'cgv_gangnam',
    name: 'CGV 강남점',
    product: '영화티켓 2매',
    amount: '32000',
    preferredToken: 'MTK3',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '🎬',
    category: '영화관',
    description: '일반관 2D 영화 티켓 2매',
    location: '강남역 지하쇼핑센터'
  },
  {
    id: 'lotte_myeongdong',
    name: '롯데백화점 명동점',
    product: '향수 + 선물포장',
    amount: '89000',
    preferredToken: 'MTK1',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🛍️',
    category: '백화점',
    description: '샤넬 No.5 미니어처 + 선물포장',
    location: '명동역 지하 연결'
  },
  {
    id: 'dominos_gangbuk',
    name: '도미노피자 강북점',
    product: '피자 2판 세트',
    amount: '35900',
    preferredToken: 'MTK2',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '🍕',
    category: '피자',
    description: '불고기 피자 + 페퍼로니 피자',
    location: '강북구 수유동'
  },
  {
    id: 'emart_jamsil',
    name: '이마트 잠실점',
    product: '생필품 장보기',
    amount: '67500',
    preferredToken: 'MTK3',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🛒',
    category: '마트',
    description: '세제 + 화장지 + 생수 + 라면',
    location: '잠실역 지하 연결'
  },
  {
    id: 'kakao_taxi',
    name: '카카오택시',
    product: '택시비',
    amount: '8200',
    preferredToken: 'MTK1',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '🚖',
    category: '교통',
    description: '강남역 → 홍대입구역',
    location: '앱 결제'
  },
  {
    id: 'subway_hongdae',
    name: '서브웨이 홍대점',
    product: '써브웨이 세트',
    amount: '9800',
    preferredToken: 'MTK2',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🥪',
    category: '샌드위치',
    description: 'BLT 15cm + 쿠키 + 음료',
    location: '홍대입구역 2번 출구'
  },
  {
    id: 'daiso_sinchon',
    name: '다이소 신촌점',
    product: '생활용품 모음',
    amount: '15000',
    preferredToken: 'MTK3',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '🏪',
    category: '생활용품',
    description: '노트 + 펜 + 파일 + 접착테이프',
    location: '신촌역 지하 연결'
  },
  {
    id: 'paris_baguette',
    name: '파리바게뜨 역삼점',
    product: '케이크 + 음료',
    amount: '18500',
    preferredToken: 'MTK1',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🥐',
    category: '베이커리',
    description: '딸기 쇼트케이크 + 아이스 라떼',
    location: '역삼역 1번 출구'
  },
  {
    id: 'uniqlo_myeongdong',
    name: '유니클로 명동점',
    product: '기본 티셔츠 3장',
    amount: '29700',
    preferredToken: 'MTK2',
    preferredChainId: 11155111, // ETH - 동일체인 시나리오
    logo: '👕',
    category: '의류',
    description: 'UT 크루넥 반팔 티셔츠 3장',
    location: '명동역 6번 출구'
  },
  {
    id: 'gong_cha',
    name: '공차 강남점',
    product: '밀크티 + 토핑',
    amount: '6500',
    preferredToken: 'MTK3',
    preferredChainId: 1001, // KAIA - 크로스체인 시나리오
    logo: '🧋',
    category: '음료',
    description: '타로 밀크티 + 펄 토핑',
    location: '강남역 11번 출구'
  }
];

export const getRandomMerchant = (): MerchantScenario => {
  const randomIndex = Math.floor(Math.random() * MERCHANT_SCENARIOS.length);
  return MERCHANT_SCENARIOS[randomIndex];
};

export const getMerchantsByCategory = (category: string): MerchantScenario[] => {
  return MERCHANT_SCENARIOS.filter(merchant => merchant.category === category);
};

export const getMerchantsByToken = (token: 'MTK1' | 'MTK2' | 'MTK3'): MerchantScenario[] => {
  return MERCHANT_SCENARIOS.filter(merchant => merchant.preferredToken === token);
};