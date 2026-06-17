# Hello World Mobile

Ứng dụng React Native (Expo) cross-platform — **Android** và **iOS** — với nền tảng production-ready: routing, state management, theme, API layer và cấu trúc thư mục mở rộng.

## Tech stack

| Hạng mục | Công nghệ |
| -------- | --------- |
| Framework | React Native + [Expo SDK 52](https://expo.dev) |
| Navigation | React Navigation (Native Stack) |
| Safe area / gestures | react-native-safe-area-context, react-native-gesture-handler |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Theme | Material-inspired light/dark palette |
| Env | `app.config.ts` + `EXPO_PUBLIC_*` |

## Cấu trúc thư mục

```text
src/
├── assets/           # Icon, splash, images
├── components/       # UI tái sử dụng (HelloWorldCard, PrimaryButton)
├── config/           # Environment / constants
├── navigation/       # AppNavigator, route types
├── screens/          # SplashScreen, HomeScreen
├── services/         # API client + domain services
├── state_management/ # Zustand stores
├── theme/            # Colors, typography
└── utils/            # Responsive helpers
```

## Yêu cầu môi trường

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) hoặc yarn
- **Android**: Android Studio + emulator (API 34+ khuyến nghị)
- **iOS** (chỉ macOS): Xcode + Simulator
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (tùy chọn, `npx expo` đủ dùng)

## Cài đặt

```bash
cd mobile
npm install
cp .env.example .env   # tùy chọn — chỉnh API URL / môi trường
```

## Chạy ứng dụng

### Development (Expo Go — nhanh nhất)

```bash
npm start
```

Quét QR bằng Expo Go trên thiết bị, hoặc nhấn `a` (Android emulator) / `i` (iOS simulator trên Mac).

### Native build (emulator / simulator)

Sinh thư mục `android/` và `ios/` (lần đầu):

```bash
npm run prebuild
```

**Android emulator:**

```bash
npm run android
```

**iOS simulator (macOS):**

```bash
npm run ios
```

## Luồng màn hình

1. **SplashScreen** — hiển thị ~1.5s rồi chuyển sang Home  
2. **HomeScreen** — hiển thị **Hello World**, nút đổi theme sáng/tối  

## Biến môi trường

| Biến | Mô tả |
| ---- | ----- |
| `EXPO_PUBLIC_API_BASE_URL` | Base URL API |
| `EXPO_PUBLIC_APP_ENV` | `development` \| `staging` \| `production` |

## Liên quan

- Issue: [#103 Frontend — Khởi tạo Project & Cấu trúc Thư mục](https://github.com/QuangRua/CNAPP_MoneyHabits/issues/4)
- Repository: [QuangRua/CNAPP_MoneyHabits](https://github.com/QuangRua/CNAPP_MoneyHabits)

## Kiểm tra TypeScript

```bash
npm run lint
```

## Mở rộng tiếp theo

- Thêm tab/stack trong `src/navigation/`
- Gọi API thật qua `src/services/apiClient.ts`
- Thêm store Zustand trong `src/state_management/`
- Tách feature modules (`src/features/...`) khi dự án lớn hơn

## License

Private — dự án học tập / khởi tạo.
