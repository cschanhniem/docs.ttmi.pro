# Sơ Đồ Cấu Trúc Cơ Sở Dữ Liệu

## 1. Cấu Trúc Chung

```mermaid
erDiagram
    Entity ||--o{ Account : has
    Entity ||--o{ Ledger : has
    Entity ||--o{ FiscalYear : has
    
    Ledger ||--o{ JournalEntry : contains
    JournalEntry ||--o{ Transaction : contains
    
    Account }o--|| AccountType : belongs_to
    Account }o--|| AccountGroup : belongs_to
```

## 2. Kế Toán Tiền

```mermaid
erDiagram
    CashAccount ||--o{ CashTransaction : records
    CashTransaction }o--|| PaymentMethod : uses
    CashTransaction }o--|| Partner : involves
    
    BankAccount ||--o{ BankTransaction : records
    BankTransaction }o--|| BankReconciliation : reconciles
    BankStatement ||--o{ BankReconciliation : contains
```

## 3. Mua Hàng và Công Nợ

```mermaid
erDiagram
    Vendor ||--o{ Bill : issues
    Bill ||--o{ BillLine : contains
    Bill ||--o{ BillPayment : receives
    
    BillLine }o--|| Item : references
    BillLine }o--|| TaxRate : applies
    
    Bill }o--|| BillStatus : has
    Bill }o--|| PaymentTerm : uses
```

## 4. Bán Hàng và Thu Tiền

```mermaid
erDiagram
    Customer ||--o{ Invoice : receives
    Invoice ||--o{ InvoiceLine : contains
    Invoice ||--o{ InvoicePayment : receives
    
    InvoiceLine }o--|| Item : references
    InvoiceLine }o--|| TaxRate : applies
    
    Invoice }o--|| InvoiceStatus : has
    Invoice }o--|| PaymentTerm : uses
```

## 5. Kho Hàng

```mermaid
erDiagram
    Warehouse ||--o{ StockTransaction : contains
    Item ||--o{ StockTransaction : involves
    
    StockTransaction }o--|| TransactionType : has
    StockTransaction }o--|| StockLot : uses
    
    Item }o--|| ItemCategory : belongs_to
    Item }o--|| UnitOfMeasure : uses
```

## 6. Tài Sản Cố Định

```mermaid
erDiagram
    FixedAsset ||--o{ Depreciation : has
    FixedAsset ||--o{ AssetAdjustment : undergoes
    FixedAsset ||--o{ AssetDisposal : may_have
    
    FixedAsset }o--|| AssetCategory : belongs_to
    FixedAsset }o--|| Department : assigned_to
    FixedAsset }o--|| DepreciationMethod : uses
```

## 7. Sản Xuất

```mermaid
erDiagram
    Product ||--o{ BillOfMaterial : has
    BillOfMaterial ||--o{ BOMLine : contains
    BOMLine }o--|| Item : uses
    
    ProductionOrder ||--o{ ProductionLine : contains
    ProductionOrder }o--|| Product : produces
    ProductionOrder ||--o{ ProductionCost : incurs
```

## 8. Nhân Sự và Lương

```mermaid
erDiagram
    Employee ||--o{ Attendance : records
    Employee ||--o{ Payroll : receives
    Employee ||--o{ SalaryComponent : has
    
    Payroll ||--o{ PayrollItem : contains
    PayrollItem }o--|| PayrollItemType : categorizes
    
    Employee }o--|| Department : belongs_to
    Employee }o--|| Position : holds
```

## 9. Thuế

```mermaid
erDiagram
    TaxDeclaration ||--o{ TaxLine : contains
    TaxDeclaration }o--|| TaxPeriod : for
    TaxDeclaration }o--|| TaxType : has
    
    TaxPayment ||--o{ TaxLine : settles
    TaxLine }o--|| TaxRate : applies
```

## 10. Kế Toán Tổng Hợp

```mermaid
erDiagram
    JournalEntry ||--o{ Transaction : contains
    Transaction }o--|| Account : uses
    Transaction }o--|| Partner : involves
    
    Account }o--|| AccountType : categorized_by
    JournalEntry }o--|| JournalType : belongs_to
    JournalEntry }o--|| Period : posted_in
```

## 11. Phân Quyền

```mermaid
erDiagram
    User ||--o{ UserRole : has
    UserRole }o--|| Role : assigned
    Role ||--o{ Permission : contains
    
    Entity ||--o{ UserAccess : controls
    UserAccess }o--|| User : for
    UserAccess }o--|| AccessLevel : at
```

## 12. Báo Cáo và Audit

```mermaid
erDiagram
    Report ||--o{ ReportLine : contains
    Report }o--|| ReportTemplate : uses
    Report }o--|| Period : for
    
    AuditLog ||--o{ AuditDetail : contains
    AuditLog }o--|| User : by
    AuditLog }o--|| EntityType : on
