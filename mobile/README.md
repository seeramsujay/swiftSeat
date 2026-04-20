# SwiftSeat Mobile (User App)

This is the mobile-native implementation of the SwiftSeat User Experience, built with **Expo** and **React Native**.

## Design Philosophy: The Kinetic Oasis
Following the "Velocity Slate" design system:
- **Atmospheric Navigator:** Dark, calm colors (#10141a) to reduce sensory overload.
- **Glassmorphism:** All overlays and cards utilize deep backdrop blurs (20px) for tactile depth.
- **No-Line Rule:** No thin borders. Tonal layering and negative space create boundaries.
- **Accessibility:** High-contrast typography (Inter) optimized for high-glare stadium lighting.

## Core Features
- **AI Concierge:** Polished chat interface for smart stadium assistance.
- **Live Stadium Map:** Real-time crowd density visualization (Mocked SVG) and PALO routing results.
- **Orders & Vouchers:** Digital ticket management and concession status tracking.
- **Google Wallet Integration:** (Planned) Push tickets and vouchers to device wallet.

## How to Run
1.  Navigate to `mobile/` directory.
2.  Run `npx expo start`.
3.  Scan the QR code with the **Expo Go** app on your iOS or Android device.
4.  (Optional) Press `w` to run in web browser.

## Tech Stack
- **Framework:** Expo SDK 50+
- **Styling:** React Native StyleSheet (Vanilla)
- **Icons:** Lucide-React-Native
- **Navigation:** React Navigation (Tabs)
- **Visuals:** Expo Blur (Glassmorphism)
