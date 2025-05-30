# Sơ Đồ Quy Trình Nghiệp Vụ

## 1. Quy Trình Mua Hàng

```mermaid
graph TD
    A[Yêu Cầu Mua Hàng] --> B[Phê Duyệt YC]
    B --> C[Đặt Hàng]
    C --> D[Nhận Hàng]
    D --> E[Kiểm Tra]
    
    E -->|Đạt| F[Nhập Kho]
    E -->|Không Đạt| G[Trả Hàng]
    
    F --> H[Nhận Hóa Đơn]
    H --> I[Hạch Toán]
    I --> J[Thanh Toán]
```

## 2. Quy Trình Bán Hàng

```mermaid
graph TD
    A[Đơn Đặt Hàng] --> B[Kiểm Tra Tồn Kho]
    B -->|Đủ hàng| C[Xác Nhận Đơn]
    B -->|Thiếu hàng| D[Thông Báo KH]
    
    C --> E[Xuất Kho]
    E --> F[Giao Hàng]
    F --> G[Xuất Hóa Đơn]
    G --> H[Hạch Toán]
    H --> I[Thu Tiền]
```

## 3. Quy Trình Sản Xuất

```mermaid
graph TD
    A[Kế Hoạch SX] --> B[Dự Trù NVL]
    B --> C[Mua NVL]
    C --> D[Nhập Kho NVL]
    
    D --> E[Sản Xuất]
    E --> F[QC Sản Phẩm]
    F -->|Đạt| G[Nhập Kho TP]
    F -->|Không Đạt| H[Phế Phẩm]
    
    G --> I[Tính Giá Thành]
```

## 4. Quy Trình Quản Lý Tiền

```mermaid
graph TD
    A[Thu Tiền] --> B[Ghi Nhận Thu]
    B --> C[Gửi Ngân Hàng]
    
    D[Chi Tiền] --> E[Duyệt Chi]
    E --> F[Ghi Nhận Chi]
    
    G[Đối Chiếu NH] --> H[Xử Lý Chênh Lệch]
    H --> I[Điều Chỉnh Sổ Sách]
```

## 5. Quy Trình Khấu Hao

```mermaid
graph TD
    A[Ghi Nhận TSCĐ] --> B[Thiết Lập KH]
    B --> C[Tính KH Hàng Tháng]
    C --> D[Hạch Toán KH]
    D --> E[Điều Chỉnh Nếu Cần]
```

## 6. Quy Trình Tính Lương

```mermaid
graph TD
    A[Chấm Công] --> B[Tổng Hợp Công]
    B --> C[Tính Lương]
    C --> D[Tính BHXH]
    D --> E[Tính Thuế TNCN]
    E --> F[Lập Bảng Lương]
    F --> G[Duyệt Lương]
    G --> H[Chi Lương]
```

## 7. Quy Trình Kế Toán Thuế

```mermaid
graph TD
    A[Ghi Nhận Phát Sinh] --> B[Tính Thuế GTGT]
    A --> C[Tính Thuế TNDN]
    
    B --> D[Kê Khai GTGT]
    C --> E[Kê Khai TNDN]
    
    D --> F[Nộp Thuế]
    E --> F
```

## 8. Quy Trình Đóng Sổ

```mermaid
graph TD
    A[Kiểm Tra Số Liệu] --> B[Bút Toán Điều Chỉnh]
    B --> C[Khóa Sổ Phụ]
    C --> D[Kết Chuyển Số Dư]
    D --> E[Lập BCTC]
    E --> F[Phê Duyệt]
    F --> G[Mở Sổ Kỳ Mới]
```

## 9. Quy Trình Báo Cáo

```mermaid
graph TD
    A[Thu Thập Số Liệu] --> B[Kiểm Tra ĐC]
    B --> C[Lập Báo Cáo]
    C --> D[Soát Xét]
    D -->|OK| E[Trình Duyệt]
    D -->|Cần sửa| B
    E --> F[Phát Hành]
```

## 10. Quy Trình Kiểm Soát

```mermaid
graph TD
    A[Thiết Lập KSN] --> B[Thực Hiện KSN]
    B --> C[Phát Hiện Sai Sót]
    C --> D[Điều Chỉnh]
    D --> E[Báo Cáo]
    E --> F[Cập Nhật QT]
