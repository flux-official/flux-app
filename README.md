# Flux Wallet App

Modern cross-chain stablecoin wallet built with React Native and Expo, featuring multi-theme UI and seamless DeFi integration.

## 🌟 Features

### 🎨 Multi-Theme Experience
- **4 Distinct Themes**: Deep Ocean, Crypto Purple, Neo Finance, and Sophisticated Dark
- **Dynamic Theme Switching**: Real-time theme changes without restart
- **Responsive Design**: Optimized for all screen sizes
- **Color Palette System**: Comprehensive color gradients for each theme

### 💰 Wallet Management
- **Multi-Chain Support**: Kaia Mainnet (8217), Kaia Testnet (1001), Ethereum Mainnet (1), Sepolia Testnet (11155111)
- **Secure Storage**: Expo SecureStore for private keys and sensitive data
- **Real-Time Balances**: Live token balance updates across all supported chains
- **Transaction History**: Complete transaction tracking and status monitoring

### 🔄 DeFi Integration
- **Token Swapping**: Seamless token exchanges via Flux Protocol
- **Cross-Chain Bridge**: Transfer tokens between Ethereum and Kaia networks
- **Staking Services**: Stake tokens and earn rewards with real-time APY tracking
- **Payment Processing**: Merchant payments with optimal routing

### 📱 User Experience
- **QR Code Integration**: Easy wallet import/export and payment scanning
- **Biometric Security**: Touch/Face ID support for secure access
- **Offline Mode**: View balances and transaction history without internet
- **Multi-Language**: Localization support (Korean/English)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio
- Expo Go app on your mobile device (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/flux-official/flux-app.git
cd flux-app

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Expo Go (scan QR code)
npm start
```

## 🏗️ Architecture

### Project Structure
```
src/
├── infrastructure/          # State Management & Storage
│   └── stores/             # Zustand stores
│       ├── walletStore.ts  # Wallet state management
│       └── themeStore.ts   # Theme state management
│
├── presentation/           # UI Layer
│   ├── components/         # Reusable UI components
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── Home/          # Multi-theme home screens
│   │   ├── Payment/       # Payment processing
│   │   ├── Staking/       # Staking management
│   │   ├── Swap/          # Token swapping
│   │   ├── Wallet/        # Wallet management
│   │   └── Profile/       # User profile
│   └── theme/             # Theme definitions
│
├── services/              # Business Logic Layer
│   ├── api/               # API integrations
│   ├── blockchain/        # Web3 providers
│   └── wallet/            # Wallet management
│
└── shared/                # Shared Resources
    ├── constants/         # App constants
    ├── types/            # TypeScript definitions
    └── utils/            # Utility functions
```

### Key Technologies

#### Frontend Framework
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build service
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Navigation library

#### State Management
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **AsyncStorage**: Persistent local storage

#### Blockchain Integration
- **ethers.js**: Ethereum library for Web3 interactions
- **Expo SecureStore**: Secure private key storage
- **Web3Provider**: Multi-chain provider management

#### UI/UX
- **React Native Paper**: Material Design components
- **Linear Gradient**: Beautiful gradient backgrounds
- **Lottie**: High-quality animations
- **Vector Icons**: Comprehensive icon library
- **QR Code**: QR code generation and scanning

## 🎨 Theme System

### Available Themes

#### 1. Deep Ocean Theme (Default)
- Deep blue and teal color palette
- Ocean-inspired gradients
- Calming and professional aesthetic
- Default theme for new users

#### 2. Crypto Purple Theme  
- Purple and violet color scheme
- Crypto-focused design elements
- High-tech futuristic feel
- Popular among DeFi users

#### 3. Neo Finance Theme
- Modern financial styling
- Clean corporate colors
- Business-oriented design
- Professional trading interface

#### 4. Sophisticated Dark Theme
- Dark mode optimized
- High contrast elements
- Premium black and gold accents
- Elegant night-time usage

### Theme Implementation

```typescript
// Theme switching
const { currentTheme, setTheme } = useThemeStore();

// Available theme IDs
const themeIds = ['deepOcean', 'cryptoPurple', 'neoFinance', 'sophisticatedDark'];

// Dynamic theme application
const theme = colorThemes.find(t => t.id === themeId);
```

## 💼 Core Features

### Wallet Management
- **Import/Export**: Mnemonic phrase and private key support
- **Multi-Wallet**: Manage multiple wallet accounts
- **Security**: Biometric authentication and secure storage
- **Backup**: Encrypted backup and recovery options

### Token Operations
- **Balance Tracking**: Real-time balance updates
- **Token Support**: MTK1, MTK2, MTK3 (extensible)
- **Chain Support**: Ethereum Sepolia, Kaia Testnet
- **Transaction History**: Complete transaction logs

### DeFi Integration
- **Staking**: Stake tokens in various pools with APY display
- **Swapping**: Token-to-token exchanges with price impact
- **Bridging**: Cross-chain asset transfers
- **Yield Farming**: Participate in liquidity mining (coming soon)

### Payment System
- **Merchant Payments**: Pay merchants using various tokens
- **Payment Requests**: Generate and scan payment QR codes  
- **Transaction Status**: Real-time payment tracking
- **Receipt Management**: Digital receipt storage

## 🔧 Configuration

### Environment Setup

Create `.env` file:
```bash
# API Configuration (Auto-detected in development)
# Production API URL
API_BASE_URL=https://your-production-api.com

# Network RPC URLs (defined in constants)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

# API Keys (Store securely)
INFURA_API_KEY=YOUR_INFURA_API_KEY
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
```

### API Configuration

The app automatically detects the development server:
- **Development**: Auto-detects host IP from Expo
- **Android Emulator**: Uses `10.0.2.2:3000/api`
- **iOS Simulator**: Uses detected host IP
- **Production**: Uses configured API_BASE_URL

### Network Configuration

Supported networks are configured in `src/shared/constants/chains.ts`:

```typescript
export const KAIA_MAINNET: Chain = {
  id: 8217,
  name: 'Kaia Mainnet',
  symbol: 'KAIA',
  rpcUrl: 'https://public-en.node.kaia.io',
  explorerUrl: 'https://kaiascan.io',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 }
};

export const KAIA_TESTNET: Chain = {
  id: 1001,
  name: 'Kaia Testnet', 
  symbol: 'KAIA',
  rpcUrl: 'https://public-en-kairos.node.kaia.io',
  explorerUrl: 'https://kairos.kaiascan.io',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 }
};

export const SEPOLIA_TESTNET: Chain = {
  id: 11155111,
  name: 'Sepolia Testnet',
  symbol: 'ETH',
  rpcUrl: process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'fallback_url',
  explorerUrl: 'https://sepolia.etherscan.io',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
};
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests (coming soon)
npm run test

# E2E tests (coming soon)  
npm run test:e2e

# Type checking
npx tsc --noEmit

# Linting
npx eslint src/
```

### Manual Testing
- Wallet creation and import functionality
- Token balance display across chains
- Theme switching functionality
- Payment QR code generation/scanning
- Staking operations
- Cross-chain bridge transactions
- Transaction history accuracy

## 📱 Deployment

### Development Build
```bash
# Preview build
expo build:preview

# Development client
expo install expo-dev-client
expo start --dev-client
```

### Production Build
```bash
# Android APK
expo build:android -t apk

# iOS IPA  
expo build:ios -t archive

# Web deployment
expo build:web
npm run deploy
```

### Distribution
```bash
# Expo App Store
expo submit --platform ios

# Google Play Store
expo submit --platform android

# Over-the-Air Updates
expo publish
```

## 🔒 Security

### Best Practices
- **Private Key Storage**: Uses Expo SecureStore with hardware encryption
- **Network Requests**: All API calls use HTTPS with certificate pinning
- **Input Validation**: Comprehensive validation for all user inputs
- **Secure Defaults**: Security-first configuration out of the box

### Security Features
- **Biometric Authentication**: Touch/Face ID for app access
- **Auto-Lock**: Automatic app locking after inactivity
- **Screenshot Protection**: Prevents screenshots in secure screens
- **Network Security**: Certificate pinning and request validation

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code style
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- **ESLint**: Automated code linting
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Structured commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **Backend API**: [flux-be](https://github.com/flux-official/flux-be)
- **Smart Contracts**: Private repository with Flux protocol implementation
- **Documentation**: Coming soon

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/flux-official/flux-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/flux-official/flux-app/discussions)
- **Email**: support@flux-official.com


---

**Built with ❤️ for the Kaia Hackathon**