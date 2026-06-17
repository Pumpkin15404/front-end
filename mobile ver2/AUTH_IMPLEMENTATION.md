# Auth & Session — Checklist triển khai

Tài liệu này map trực tiếp các yêu cầu issue với code đã implement trong nhánh auth này.

## Yêu cầu cần đạt (Checklist)

- [x] **Đăng nhập thành công → Dashboard**  
  `LoginScreen` gọi `authService.login()` rồi `navigation.replace('Dashboard')`.

- [x] **Tắt app mở lại giữ phiên, không giật lag**  
  `SplashScreen` đọc token từ Secure Storage **trước khi** chọn route. Chỉ navigate **một lần** tới `Dashboard` hoặc `Login`.

- [x] **Logout / Token hết hạn (401) → xóa token + về Login**  
  `authService.logout()` và `authService.handleSessionExpired()` xóa Secure Storage + reset Zustand, rồi `navigateToLogin()` kèm thông báo.

- [x] **Loading khi gọi API + lỗi thân thiện**  
  Nút Đăng nhập có spinner + disabled. Hiển thị lỗi sai tài khoản / mất mạng rõ ràng.

- [x] **Refresh Token tự động (nâng cao)**  
  `apiClient` interceptor: gặp 401 → gọi `/auth/refresh` (hoặc mock refresh) → retry request.

- [x] **Validate client-side**  
  Email format + mật khẩu tối thiểu 6 ký tự ngay tại input.

- [x] **SSL Pinning (placeholder)**  
  `src/config/sslPinning.ts` — bật sau `expo prebuild` với native module.

---

## Luồng Splash Screen (không chớp nháy)

```
Mở app → Splash
         ↓
   Đọc AccessToken + RefreshToken (SecureStore)
         ↓
   Token còn hạn? ──Yes──→ Dashboard
         │
         No (hết hạn)
         ↓
   RefreshToken còn? ──Yes──→ Gọi refresh âm thầm ──OK──→ Dashboard
         │                              │
         No                            Fail
         ↓                              ↓
       Login                          Login
```

**File:** `src/screens/SplashScreen.tsx`, `src/services/authService.ts`

---

## Token Lifecycle & Interceptor

| Thành phần | File |
|---|---|
| Lưu token bảo mật | `src/services/secureStorage.ts` |
| Login / Logout / Refresh | `src/services/authService.ts` |
| Interceptor 401 + retry | `src/services/apiClient.ts` |
| State phiên (Zustand) | `src/state_management/authStore.ts` |
| Decode JWT / check expiry | `src/utils/jwt.ts` |

Khi API trả **401** giữa phiên làm việc:
1. Thử refresh access token (chỉ 1 request refresh đồng thời).
2. Nếu refresh thành công → retry API ban đầu.
3. Nếu thất bại → xóa token, reset state, Alert *"Phiên đăng nhập đã hết hạn..."*, về Login.

---

## Logout — xóa sạch dấu vết

`authService.logout()` thực hiện:
1. Gọi `POST /auth/logout` (best-effort).
2. `SecureStore.deleteItemAsync` cho access + refresh token.
3. `resetAuthStore()` — xóa user, token, flags trong Zustand.
4. `navigationRef.reset` về Login (không back được Dashboard).

---

## API Backend cần có

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken? }` |
| POST | `/auth/logout` | — | 204 |

JWT payload nên có: `sub`, `email`, `exp` (và tùy chọn `name`).

---

## Test nhanh (Mock Auth — không cần Backend)

Khi `EXPO_PUBLIC_ENABLE_MOCK_AUTH=true` (mặc định dev):

| Email | Mật khẩu |
|-------|-----------|
| `demo@moneyhabits.app` | `demo123` |

**Kịch bản test:**

1. Đăng nhập mock → vào Dashboard.
2. Tắt app, mở lại → Splash → thẳng Dashboard (không qua Login).
3. Bấm **Đăng xuất** → về Login, back không thấy dữ liệu cũ.
4. Bật airplane mode → bấm Đăng nhập → thông báo mất mạng.
5. Nhập email sai format → lỗi ngay tại ô input.

---

## Cấu trúc file mới / cập nhật

```text
src/
├── config/
│   └── sslPinning.ts          # SSL Pinning placeholder
├── navigation/
│   ├── AppNavigator.tsx       # Splash | Login | Dashboard
│   └── navigationRef.ts       # Global navigation cho 401/logout
├── screens/
│   ├── SplashScreen.tsx       # Bootstrap session
│   ├── LoginScreen.tsx        # Form + validate + loading
│   └── DashboardScreen.tsx    # Màn chính + logout
├── services/
│   ├── apiClient.ts           # Fetch + 401 interceptor
│   ├── authService.ts         # Login/logout/refresh/restore
│   └── secureStorage.ts       # expo-secure-store
├── state_management/
│   └── authStore.ts           # Zustand auth state
└── utils/
    ├── jwt.ts
    ├── validation.ts
    ├── network.ts
    └── mockAuth.ts            # Demo credentials (dev)
```

---

## Chạy thử

```bash
cd mobile
npm install
npm start
```

Dependencies mới: `expo-secure-store`, `@react-native-community/netinfo`.
