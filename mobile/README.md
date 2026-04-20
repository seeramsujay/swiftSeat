# SwiftSeat Mobile (User App) 📱

Implementation of the SwiftSeat UX using **Expo** and **React Native**.

## ✨ Features
- **Gemini-First Concierge**: Voice and text assistant for stadium navigation and food ordering.
- **Dynamic Heatmap**: Live crowd density visualization on the stadium map.
- **Voucher Wallet**: Digital concession vouchers and ticket management.
- **Atmospheric Palette**: Dark mode optimized for stadium glare.

## 🏗️ Technical Architecture
- **State Management**: React Hooks + Custom `useStadiumData` stream.
- **Glassmorphism**: Native blurs using `expo-blur`.
- **Navigation**: Tab-based navigation with animated spring interactions.
- **CI/CD**: Automatic APK builds via GitHub Actions and EAS Build CLI.

## 🚀 Installation & Build
```bash
# To run locally with Expo Go
npm install
npx expo start

# To build APK manually
npx eas build --platform android --profile preview --local
```

## 📦 Releases
Built APKs are automatically generated on tag push (`v*`) and available in the **[Releases](https://github.com/seeramsujay/swiftSeat/releases)** section.
