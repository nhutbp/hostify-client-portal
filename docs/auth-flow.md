# Auth Flow

Sơ đồ này mô tả đúng luồng auth hiện tại của source:
- `accessToken` sống ngắn hạn, lưu ở cookie và được hash trong DB
- `refreshToken` sống dài hơn, lưu ở cookie và DB
- SSR là nguồn sự thật, client chỉ hydrate từ server

## Sequence

```mermaid
sequenceDiagram
  participant U as User
  participant UI as SSR/UI
  participant A as auth.service.server
  participant C as cookies.server
  participant DB as Prisma DB

  U->>UI: Submit login/register/verify
  UI->>A: Call server action
  A->>DB: Create/lookup user
  A->>DB: Create session record
  Note over A,DB: accessToken = hash(sessionToken)\nrefreshToken stored as plain token
  A->>C: Set access cookie + refresh cookie
  A-->>UI: Return safe user

  U->>UI: SSR request
  UI->>A: getCurrentUserFromRequest()
  A->>C: Read access cookie
  A->>DB: Find session by hashed accessToken
  alt accessToken valid
    A-->>UI: Return user from session.user
  else accessToken missing/expired
    A->>C: Read refresh cookie
    A->>DB: Find session by refreshToken
    alt refreshToken valid
      A->>DB: Update only accessToken + accessTokenExpires
      A->>C: Reset access cookie
      A-->>UI: Return user from session.user
    else refreshToken invalid/expired
      A->>C: Clear auth cookies
      A-->>UI: null
    end
  end

  U->>UI: Logout
  UI->>A: logoutCurrentSession()
  A->>DB: Revoke matched session
  A->>C: Clear auth cookies
```

## State Flow

```mermaid
flowchart TD
  Start([Request arrives]) --> HasAccess{Access cookie?}
  HasAccess -- Yes --> HashAccess[Hash access token]
  HashAccess --> FindAccess[Find session by access_token]
  FindAccess --> AccessValid{Session valid?}
  AccessValid -- Yes --> ReturnUser[Return user]
  AccessValid -- No --> HasRefresh

  HasAccess -- No --> HasRefresh{Refresh cookie?}
  HasRefresh -- No --> Clear1[Clear auth cookies] --> Null1([Return null])
  HasRefresh -- Yes --> FindRefresh[Find session by refresh_token]
  FindRefresh --> RefreshValid{Session valid?}
  RefreshValid -- No --> Clear2[Clear auth cookies] --> Null2([Return null])
  RefreshValid -- Yes --> RotateAccess[Rotate access token only]
  RotateAccess --> SetAccess[Set new access cookie]
  SetAccess --> ReturnUser
```

## Notes

- `accessToken` đổi mỗi lần refresh access session, nhưng `deviceInfo` không đổi.
- `refreshToken` dùng để kéo dài phiên đăng nhập.
- `createSessionRecord()` tạo session mới cho mỗi lần đăng nhập/verify khác nhau.
- `updateSessionAccessToken()` chỉ update record hiện tại, không tạo session mới.
- Khi logout, session hiện tại bị revoke và cookies bị xóa.
