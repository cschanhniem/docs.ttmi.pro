# Sơ Đồ Trạng Thái và Quy Trình Làm Việc

## 1. Trạng Thái Chứng Từ

```mermaid
stateDiagram-v2
    [*] --> Draft: Tạo mới
    Draft --> Pending: Gửi duyệt
    Pending --> Approved: Phê duyệt
    Pending --> Rejected: Từ chối
    Rejected --> Draft: Chỉnh sửa
    Approved --> Posted: Ghi sổ
    Posted --> [*]
    
    Draft --> Cancelled: Hủy
    Pending --> Cancelled: Hủy
    Cancelled --> [*]
```

## 2. Quy Trình Phê Duyệt

```mermaid
stateDiagram-v2
    state "Kiểm Tra" as check
    state "Chờ Duyệt" as pending
    state "Phê Duyệt" as approve {
        [*] --> Level1
        Level1 --> Level2: Vượt hạn mức
        Level2 --> Level3: Vượt hạn mức
        Level1 --> [*]: Trong hạn mức
        Level2 --> [*]: Trong hạn mức
        Level3 --> [*]
    }

    [*] --> check
    check --> pending: Hợp lệ
    check --> Rejected: Không hợp lệ
    pending --> approve
    approve --> Completed
    Completed --> [*]
```

## 3. Quy Trình Xuất Hàng

```mermaid
stateDiagram-v2
    state "Kiểm Tra Tồn Kho" as check_stock {
        [*] --> Check
        Check --> Available
        Check --> NotAvailable
        Available --> [*]
        NotAvailable --> [*]
    }
    
    [*] --> OrderReceived
    OrderReceived --> check_stock
    check_stock --> PickingList: Đủ hàng
    check_stock --> Backorder: Thiếu hàng
    PickingList --> QC
    QC --> Packing
    Packing --> Shipping
    Shipping --> Delivered
    Delivered --> [*]
```

## 4. Quy Trình Sản Xuất

```mermaid
stateDiagram-v2
    state "Chuẩn Bị" as prep {
        [*] --> CheckMaterial
        CheckMaterial --> ReadyToProduce
        CheckMaterial --> WaitingMaterial
        WaitingMaterial --> CheckMaterial
    }
    
    [*] --> ProductionOrder
    ProductionOrder --> prep
    prep --> InProduction
    InProduction --> QC
    QC --> Finished: Đạt
    QC --> Rework: Không đạt
    Rework --> QC
    Finished --> [*]
```

## 5. Quy Trình Thanh Toán

```mermaid
stateDiagram-v2
    state "Kiểm Tra" as check {
        [*] --> ValidateAmount
        ValidateAmount --> ValidateAccount
        ValidateAccount --> [*]
    }
    
    [*] --> PaymentRequest
    PaymentRequest --> check
    check --> PendingApproval: Hợp lệ
    check --> Rejected: Không hợp lệ
    PendingApproval --> Approved
    Approved --> Processing
    Processing --> Completed
    Processing --> Failed
    Failed --> PaymentRequest
    Completed --> [*]
```

## 6. Quy Trình Khóa Sổ

```mermaid
stateDiagram-v2
    state "Kiểm Tra" as check {
        [*] --> CheckBalance
        CheckBalance --> CheckReconciliation
        CheckReconciliation --> [*]
    }
    
    [*] --> PeriodOpen
    PeriodOpen --> check
    check --> TemporaryClosed
    TemporaryClosed --> Adjusting
    Adjusting --> check
    TemporaryClosed --> PermanentClosed
    PermanentClosed --> [*]
```

## 7. Quy Trình Tài Sản

```mermaid
stateDiagram-v2
    [*] --> Purchased
    Purchased --> InUse: Ghi nhận
    InUse --> UnderMaintenance: Bảo trì
    UnderMaintenance --> InUse: Hoàn thành
    InUse --> Impaired: Suy giảm
    Impaired --> InUse: Phục hồi
    InUse --> ForSale: Quyết định bán
    ForSale --> Disposed: Thanh lý
    Disposed --> [*]
```

## 8. Quy Trình Tính Lương

```mermaid
stateDiagram-v2
    state "Tính Toán" as calc {
        [*] --> BasicSalary
        BasicSalary --> Allowances
        Allowances --> Deductions
        Deductions --> Tax
        Tax --> [*]
    }
    
    [*] --> TimesheetClosing
    TimesheetClosing --> calc
    calc --> PendingApproval
    PendingApproval --> Approved
    Approved --> PayrollProcessing
    PayrollProcessing --> Completed
    Completed --> [*]
```

## 9. Quy Trình Báo Cáo

```mermaid
stateDiagram-v2
    state "Chuẩn Bị" as prep {
        [*] --> DataCollection
        DataCollection --> DataValidation
        DataValidation --> [*]
    }
    
    [*] --> ReportRequested
    ReportRequested --> prep
    prep --> Generating
    Generating --> Review
    Review --> Approved
    Review --> Revision
    Revision --> prep
    Approved --> Published
    Published --> [*]
```

## 10. Quy Trình Kiểm Toán

```mermaid
stateDiagram-v2
    state "Kiểm Tra" as check {
        [*] --> DocumentCheck
        DocumentCheck --> BalanceCheck
        BalanceCheck --> ComplianceCheck
        ComplianceCheck --> [*]
    }
    
    [*] --> Planning
    Planning --> check
    check --> FindingsDraft
    FindingsDraft --> ManagementReview
    ManagementReview --> FinalReport
    FinalReport --> FollowUp
    FollowUp --> [*]
