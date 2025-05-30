# API Endpoints cho Quản Lý Tài Khoản

## 1. Chart of Accounts (COA)

### 1.1. Tạo mới Chart of Accounts
```http
POST /api/entity/{entity_slug}/coa/create/
```

**Headers:**
- Authorization: Bearer {token}
- Content-Type: application/json

**Request Body:**
```json
{
    "name": "Hệ thống tài khoản mới",
    "description": "Mô tả hệ thống tài khoản"
}
```

**Response:**
```json
{
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Hệ thống tài khoản mới",
    "slug": "coa-abc-123456789",
    "active": true,
    "created_at": "2024-04-04T15:08:39Z"
}
```

### 1.2. Danh sách Chart of Accounts
```http
GET /api/entity/{entity_slug}/coa/list/
```

**Query Parameters:**
- page: Số trang (default: 1)
- page_size: Số item mỗi trang (default: 20)
- active: Lọc theo trạng thái (true/false)

### 1.3. Chi tiết Chart of Accounts
```http
GET /api/entity/{entity_slug}/coa/{coa_slug}/
```

## 2. Quản lý Tài khoản

### 2.1. Tạo mới Tài khoản
```http
POST /api/entity/{entity_slug}/coa/{coa_slug}/accounts/create/
```

**Request Body:**
```json
{
    "code": "1111",
    "name": "Tiền mặt VND",
    "role": "ASSET_CA_CASH",
    "balance_type": "debit",
    "parent": "111",
    "active": true
}
```

### 2.2. Cập nhật Tài khoản
```http
PUT /api/entity/{entity_slug}/coa/{coa_slug}/accounts/{account_pk}/update/
```

**Request Body:**
```json
{
    "name": "Tiền mặt VND - Updated",
    "active": false
}
```

### 2.3. Danh sách Tài khoản
```http
GET /api/entity/{entity_slug}/coa/{coa_slug}/accounts/list/
```

**Query Parameters:**
- role: Lọc theo role
- active: Lọc theo trạng thái
- parent: Lọc theo tài khoản cha
- search: Tìm kiếm theo tên hoặc mã

### 2.4. Chi tiết Tài khoản
```http
GET /api/entity/{entity_slug}/coa/{coa_slug}/accounts/{account_pk}/
```

## 3. Các Thao Tác Đặc Biệt

### 3.1. Đánh dấu COA là mặc định
```http
POST /api/entity/{entity_slug}/coa/{coa_slug}/mark-as-default/
```

### 3.2. Kích hoạt/Vô hiệu hóa COA
```http
POST /api/entity/{entity_slug}/coa/{coa_slug}/toggle-active/
```

### 3.3. Import Tài khoản từ file
```http
POST /api/entity/{entity_slug}/coa/{coa_slug}/import/
```
**Content-Type:** multipart/form-data

**Form Data:**
- file: File Excel/CSV chứa danh sách tài khoản

## 4. Mã Lỗi và Xử Lý

### 4.1. Mã Lỗi Chung
- 400: Dữ liệu không hợp lệ
- 401: Chưa xác thực
- 403: Không có quyền
- 404: Không tìm thấy tài nguyên
- 409: Xung đột dữ liệu
- 500: Lỗi hệ thống

### 4.2. Mã Lỗi Riêng
```json
{
    "COA_001": "Mã tài khoản đã tồn tại",
    "COA_002": "Role không hợp lệ cho loại tài khoản",
    "COA_003": "Tài khoản cha không tồn tại",
    "COA_004": "Không thể xóa tài khoản có giao dịch",
    "COA_005": "Không thể vô hiệu hóa COA mặc định"
}
```

## 5. Rate Limiting

- Giới hạn 1000 request/giờ cho mỗi user
- Giới hạn 100 request/phút cho các endpoint tạo/sửa
- Giới hạn 5 request/phút cho import tài khoản

**Headers trả về:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1712234919
```

## 6. Bảo Mật

### 6.1. Authentication
- Sử dụng JWT Token
- Token có hiệu lực 24 giờ
- Refresh token có hiệu lực 7 ngày

### 6.2. Authorization
- Admin: Full access
- Manager: Create, Read, Update
- User: Read only

### 6.3. Data Validation
- Mã tài khoản: 3-10 ký tự số
- Tên tài khoản: 5-100 ký tự
- Role: Phải nằm trong danh sách cho phép
- Balance type: debit/credit

## 7. Pagination Response Format
```json
{
    "count": 100,
    "next": "http://api.domain.com/accounts/?page=2",
    "previous": null,
    "results": [
        {
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "code": "1111",
            "name": "Tiền mặt VND"
            // ...
        }
    ]
}
