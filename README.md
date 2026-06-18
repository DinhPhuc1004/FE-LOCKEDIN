# LockedIn Project

Dự án LockedIn bao gồm cả Frontend (Vite + React) và Backend (.NET Core API).

## Cấu trúc dự án

- `lockedin-frontend/`: Mã nguồn của ứng dụng Frontend (React, TypeScript, TailwindCSS, Vite).
- `lockedin-backend/`: Mã nguồn của ứng dụng Backend (.NET Core Web API, SQL Server DB Context).

## Hướng dẫn chạy dự án nhanh

### 1. Khởi động Backend
Di chuyển vào thư mục backend và chạy lệnh:
```bash
cd lockedin-backend
dotnet run --project LockedIn.Api --launch-profile http
```
API sẽ lắng nghe mặc định tại `http://localhost:5122`.

### 2. Khởi động Frontend
Di chuyển vào thư mục frontend và chạy lệnh:
```bash
cd lockedin-frontend
npm install
npm run dev
```
Giao diện sẽ chạy tại `http://localhost:5173`.
