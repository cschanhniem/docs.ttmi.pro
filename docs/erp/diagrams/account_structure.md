# Sơ Đồ Cấu Trúc Tài Khoản

## 1. Cấu Trúc Hệ Thống Tài Khoản

```mermaid
graph TD
    A[Hệ Thống Tài Khoản] --> B[Tài Sản]
    A --> C[Nợ Phải Trả]
    A --> D[Vốn Chủ Sở Hữu]
    A --> E[Doanh Thu]
    A --> F[Chi Phí]

    B --> B1[Tiền và Tương Đương Tiền]
    B --> B2[Phải Thu]
    B --> B3[Hàng Tồn Kho]
    B --> B4[TSCĐ]
    
    C --> C1[Phải Trả Người Bán]
    C --> C2[Vay và Nợ]
    C --> C3[Thuế và Các Khoản Phải Nộp]
    
    D --> D1[Vốn Góp]
    D --> D2[Thặng Dư Vốn]
    D --> D3[Lợi Nhuận Chưa Phân Phối]
    
    E --> E1[Doanh Thu Bán Hàng]
    E --> E2[Doanh Thu Tài Chính]
    E --> E3[Thu Nhập Khác]
    
    F --> F1[Giá Vốn Hàng Bán]
    F --> F2[Chi Phí Bán Hàng]
    F --> F3[Chi Phí Quản Lý]
```

## 2. Phân Loại Tài Khoản

```mermaid
graph LR
    A[Tài Khoản] --> B[TK Tổng Hợp]
    A --> C[TK Chi Tiết]
    
    B --> B1[TK Cấp 1]
    B1 --> B2[TK Cấp 2]
    B2 --> B3[TK Cấp 3]
    
    C --> C1[TK Theo Đối Tượng]
    C --> C2[TK Theo Khoản Mục]
```

## 3. Quan Hệ Số Dư

```mermaid
graph TD
    A[Loại Tài Khoản] --> B[TK Dư Nợ]
    A --> C[TK Dư Có]
    A --> D[TK Lưỡng Tính]
    
    B --> B1[Tài Sản]
    B --> B2[Chi Phí]
    
    C --> C1[Nguồn Vốn]
    C --> C2[Doanh Thu]
    
    D --> D1[Phải Thu]
    D --> D2[Phải Trả]
```

## 4. Cấu Trúc Mã Tài Khoản

```mermaid
graph TD
    A[Mã TK] --> B[Cấp 1: X]
    B --> C[Cấp 2: XX]
    C --> D[Cấp 3: XXX]
    D --> E[Cấp 4: XXXX]
    
    B1[1: Tài Sản] --> B11[11: Tiền]
    B11 --> B111[111: Tiền Mặt]
    B111 --> B1111[1111: Tiền VND]
```

## 5. Luồng Ghi Sổ

```mermaid
graph TB
    A[Chứng Từ Gốc] --> B[Nhật Ký Chung]
    B --> C[Sổ Cái]
    C --> D1[Báo Cáo Tài Chính]
    C --> D2[Báo Cáo Thuế]
    
    B --> E[Sổ Chi Tiết]
    E --> F1[Báo Cáo Chi Tiết]
    E --> F2[Đối Chiếu Công Nợ]
```

## 6. Quy Trình Khóa Sổ

```mermaid
graph TB
    A[Đầu Kỳ] --> B[Ghi Sổ Hàng Ngày]
    B --> C[Khóa Sổ Tạm]
    C --> D[Bút Toán Điều Chỉnh]
    D --> E[Khóa Sổ Cuối Kỳ]
    E --> F[Lập Báo Cáo]
    F --> G[Bút Toán Kết Chuyển]
    G --> H[Mở Sổ Kỳ Mới]
