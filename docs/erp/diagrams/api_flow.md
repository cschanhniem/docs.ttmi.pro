# Sơ Đồ Luồng API

## 1. Luồng Xác Thực

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant D as Database
    participant T as Token Service
    
    C->>A: POST /api/auth/login/
    A->>D: Kiểm tra thông tin đăng nhập
    D-->>A: Xác nhận người dùng
    A->>T: Tạo token
    T-->>A: Token
    A-->>C: Token + User info

    Note over C,A: Gửi token trong header
```

## 2. Luồng Ghi Sổ

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant V as Validator
    participant S as Service
    participant D as Database
    
    C->>A: POST /api/journal-entries/
    A->>V: Validate dữ liệu
    V-->>A: Kết quả validate
    
    alt Dữ liệu hợp lệ
        A->>S: Xử lý nghiệp vụ
        S->>D: Lưu bút toán
        D-->>S: Xác nhận
        S-->>A: Kết quả thành công
        A-->>C: 201 Created
    else Dữ liệu không hợp lệ
        A-->>C: 400 Bad Request
    end
```

## 3. Luồng Báo Cáo

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Service
    participant D as Database
    participant R as Report Generator
    
    C->>A: GET /api/reports/balance-sheet
    A->>S: Yêu cầu dữ liệu
    S->>D: Query dữ liệu
    D-->>S: Dữ liệu thô
    S->>R: Tạo báo cáo
    R-->>S: Báo cáo đã định dạng
    S-->>A: Báo cáo
    A-->>C: 200 OK + Data
```

## 4. Luồng Tải File

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant U as Upload Service
    participant F as File Storage
    participant D as Database
    
    C->>A: POST /api/documents/upload/
    A->>U: Xử lý file
    U->>F: Lưu file
    F-->>U: File URL
    U->>D: Lưu metadata
    D-->>U: Xác nhận
    U-->>A: Thông tin file
    A-->>C: 201 Created
```

## 5. Luồng Phê Duyệt

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Service
    participant D as Database
    participant N as Notification Service
    
    C->>A: POST /api/approvals/
    A->>S: Kiểm tra quyền
    S->>D: Cập nhật trạng thái
    D-->>S: Xác nhận
    S->>N: Gửi thông báo
    N-->>S: Đã gửi
    S-->>A: Kết quả
    A-->>C: 200 OK
```

## 6. Luồng Kết Chuyển

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Service
    participant D as Database
    
    C->>A: POST /api/closing-entries/
    A->>S: Bắt đầu kết chuyển
    
    loop Từng tài khoản
        S->>D: Tính số dư
        D-->>S: Số dư
        S->>D: Tạo bút toán kết chuyển
        D-->>S: Xác nhận
    end
    
    S->>D: Cập nhật kỳ kế toán
    D-->>S: Hoàn tất
    S-->>A: Kết quả
    A-->>C: 200 OK
```

## 7. Xử Lý Lỗi

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Service
    participant D as Database
    
    C->>A: Request
    
    alt Lỗi xác thực
        A-->>C: 401 Unauthorized
    else Lỗi quyền truy cập
        A-->>C: 403 Forbidden
    else Lỗi dữ liệu
        A->>S: Xử lý
        S->>D: Query
        D-->>S: Lỗi SQL
        S-->>A: Báo lỗi
        A-->>C: 400 Bad Request
    else Lỗi hệ thống
        A-->>C: 500 Internal Error
    end
```

## 8. Định Dạng Response

```mermaid
graph TD
    A[API Response] --> B[Thành công]
    A --> C[Lỗi]
    
    B --> B1[data: Object/Array]
    B --> B2[metadata: Object]
    B --> B3[message: String]
    
    C --> C1[error_code: String]
    C --> C2[error_message: String]
    C --> C3[details: Object]
