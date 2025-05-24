# Email Mass Sender - Hướng dẫn triển khai

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy chủ của bạn đã cài đặt:

- Docker và Docker Compose (phiên bản mới nhất)
- Git
- Ít nhất 2GB RAM và 1 CPU core
- Hệ điều hành: Ubuntu 20.04 hoặc mới hơn

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/tronghm88/email-mass-sender.git
cd email-mass-sender
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc với các biến môi trường sau:

```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=email_sender

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secure_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# Admin Email (email này sẽ được cấp quyền admin)
ADMIN_EMAIL=your_admin_email@gmail.com
```

**Lưu ý:** Thay `your-domain.com` bằng tên miền thực tế của bạn.

### 3. Cấu hình Google API

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo dự án mới
3. Vào "APIs & Services" > "Credentials"
4. Tạo OAuth 2.0 Client ID
5. Cấu hình màn hình đồng ý với các quyền sau:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Thêm URL callback: `https://your-domain.com/api/auth/google/callback`
7. Thêm URL callback cho development: `http://localhost:3000/api/auth/google/callback`
8. Sao chép Client ID và Client Secret vào file `.env`

**Quan trọng:** Đảm bảo đã publish ứng dụng trong OAuth consent screen để người dùng có thể đăng nhập mà không gặp cảnh báo.

## Triển khai lên server

### 1. Cấu hình Nginx

Tạo file cấu hình Nginx cho ứng dụng:

```bash
sudo nano /etc/nginx/sites-available/email-sender.conf
```

Thêm nội dung sau (thay thế your-domain.com bằng tên miền thực tế):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/email-sender.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Cấu hình SSL với Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Khởi chạy ứng dụng với Docker Compose

```bash
# Build tất cả container
docker-compose build

# Khởi chạy tất cả service
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả service
docker-compose down
```

### 4. Kiểm tra trạng thái các container

```bash
docker-compose ps
```

Đảm bảo tất cả container đều trong trạng thái "Up".

## Bảo trì và quản lý

### 1. Cập nhật ứng dụng

```bash
# Pull code mới
git pull

# Rebuild và restart các container
docker-compose down
docker-compose build
docker-compose up -d
```

### 2. Sao lưu dữ liệu

```bash
# Sao lưu database
docker exec email-sender-postgres pg_dump -U postgres email_sender > backup_$(date +%Y%m%d).sql

# Sao lưu file .env
cp .env .env.backup_$(date +%Y%m%d)
```

### 3. Khôi phục dữ liệu

```bash
# Khôi phục database
cat backup_file.sql | docker exec -i email-sender-postgres psql -U postgres email_sender
```

## Xử lý sự cố

### Các vấn đề thường gặp

1. **Lỗi kết nối Database**
   - Kiểm tra PostgreSQL có đang chạy không: `docker-compose ps`
   - Xác minh thông tin đăng nhập database trong `.env`
   - Đảm bảo migrations đã được chạy

2. **Lỗi kết nối Redis**
   - Kiểm tra Redis có đang chạy không: `docker-compose ps`
   - Xác minh cài đặt kết nối Redis trong `.env`

3. **Lỗi xác thực OAuth**
   - Kiểm tra lại thông tin Google API credentials
   - Đảm bảo redirect URIs được cấu hình chính xác
   - Đảm bảo các scopes cần thiết đã được bật trong Google Cloud Console

4. **Worker không xử lý jobs**
   - Kiểm tra kết nối Redis
   - Xem logs để tìm lỗi: `docker-compose logs worker-service`
   - Kiểm tra cấu hình queue trong BullMQ

### Kiểm tra logs

```bash
# Xem logs của tất cả services
docker-compose logs

# Xem logs của service cụ thể
docker-compose logs api-service
docker-compose logs worker-service
docker-compose logs web-app

# Theo dõi logs realtime
docker-compose logs -f worker-service
```

## Tối ưu hóa hiệu suất

1. **Tăng số lượng worker**
   - Chỉnh sửa cấu hình trong worker-service để tăng số lượng worker xử lý song song

2. **Giám sát tài nguyên**
   - Sử dụng `docker stats` để theo dõi mức sử dụng CPU/RAM
   - Nâng cấp tài nguyên server nếu cần thiết

3. **Tối ưu database**
   - Thêm indexes cho các truy vấn thường xuyên
   - Cấu hình PostgreSQL cho hiệu suất tốt hơn

## Liên hệ hỗ trợ

Nếu bạn gặp vấn đề không thể tự giải quyết, vui lòng liên hệ:

- Email: support@email-mass-sender.com
- Telegram: @email_mass_sender_support
- Email sending metrics
- System resource usage
