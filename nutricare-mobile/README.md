# NutriCare Mobile App

AI-Powered Nutrition Assistant for Android & iOS

## Features

- **User Authentication**: Secure login and registration
- **Daily Nutrition Tracking**: Track calories, protein, carbs, and fats
- **Meal Management**: Add, view, and delete meals by meal type (breakfast, lunch, dinner, snacks)
- **Food Search**: Search from a comprehensive food database
- **AI Food Analysis**: Scan food with camera and get AI-powered nutrition analysis
- **Goal Tracking**: Set and track daily nutrition goals
- **User Profile**: Manage personal information and preferences

## Tech Stack

- **Framework**: React Native 0.73.2
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Storage**:
  - AsyncStorage for general data
  - EncryptedStorage for sensitive data
- **HTTP Client**: Axios
- **UI Components**: Custom components with React Native Linear Gradient
- **Form Handling**: React Hook Form
- **Date Utilities**: date-fns

## Project Structure

```
nutricare-mobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── NutrientBar.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── NutritionNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Main app screens
│   │   └── nutrition/     # Nutrition tracking screens
│   ├── services/          # API services
│   │   ├── api.config.ts
│   │   ├── auth.service.ts
│   │   ├── nutrition.service.ts
│   │   └── user.service.ts
│   ├── store/             # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── nutritionSlice.ts
│   │   ├── hooks.ts
│   │   └── index.ts
│   ├── types/             # TypeScript types
│   ├── theme/             # Theme configuration
│   └── utils/             # Utility functions
├── App.tsx                # Root component
├── index.js              # Entry point
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment setup
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS pods (macOS only):
```bash
cd ios && pod install && cd ..
```

3. Configure environment:
Update the API base URL in `src/services/api.config.ts` to point to your backend server.

### Running the App

Start Metro bundler:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS (macOS only):
```bash
npm run ios
```

## API Integration

The app expects a backend API with the following endpoints:

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/auth/refresh`

### User
- GET `/api/users/profile`
- PUT `/api/users/profile`
- PUT `/api/users/goals`

### Nutrition
- GET `/api/foods/search`
- GET `/api/foods/:id`
- GET `/api/foods/barcode/:barcode`
- POST `/api/meals`
- GET `/api/meals/daily`
- DELETE `/api/meals/:id`

### AI Analysis
- POST `/api/ai/analyze-food`
- GET `/api/ai/recommendations`

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace NutriCare.xcworkspace -scheme NutriCare -configuration Release
```

## Features to Implement

- [ ] Barcode scanning for food items
- [ ] Charts and analytics for nutrition trends
- [ ] Meal planning and recommendations
- [ ] Water intake tracking
- [ ] Exercise tracking
- [ ] Social features (share meals, challenges)
- [ ] Offline mode support
- [ ] Multi-language support

## License

Copyright © 2026 NutriCare
