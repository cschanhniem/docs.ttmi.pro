# Sơ Đồ Luồng Dữ Liệu

## 1. Luồng Dữ Liệu Tổng Quan

```mermaid
flowchart TB
    subgraph Input
        A1[Chứng Từ Gốc]
        A2[File Import]
        A3[API]
    end
    
    subgraph Processing
        B1[Data Validation]
        B2[Data Transform]
        B3[Business Rules]
    end
    
    subgraph Storage
        C1[Transaction DB]
        C2[Document Storage]
        C3[Data Warehouse]
    end
    
    subgraph Output
        D1[Báo Cáo]
        D2[API Export]
        D3[File Export]
    end
    
    A1 & A2 & A3 --> B1 --> B2 --> B3
    B3 --> C1 & C2
    C1 --> C3
    C3 --> D1 & D2 & D3
```

## 2. Xử Lý Chứng Từ

```mermaid
flowchart LR
    subgraph Input_Processing
        A[Upload] --> B[OCR/Scanner]
        B --> C[Data Extraction]
        C --> D[Validation]
    end
    
    subgraph Document_Flow
        D --> E[Temporary Storage]
        E --> F{Valid?}
        F -->|Yes| G[Document Store]
        F -->|No| H[Error Queue]
        H --> I[Manual Review]
        I --> D
    end
```

## 3. ETL Báo Cáo

```mermaid
flowchart TB
    subgraph Extract
        A1[Transaction DB]
        A2[Document Store]
        A3[External Data]
    end
    
    subgraph Transform
        B1[Data Cleaning]
        B2[Data Mapping]
        B3[Aggregation]
    end
    
    subgraph Load
        C1[Data Warehouse]
        C2[Reporting Cubes]
        C3[Cache Layer]
    end
    
    A1 & A2 & A3 --> B1 --> B2 --> B3
    B3 --> C1 --> C2 --> C3
```

## 4. Luồng Dữ Liệu HĐDT

```mermaid
flowchart TB
    subgraph Invoice_Creation
        A1[Draft Invoice] --> A2[Validate]
        A2 --> A3[Sign]
    end
    
    subgraph Provider_Flow
        A3 --> B1[E-Invoice Service]
        B1 --> B2[Store]
        B1 --> B3[Tax Authority]
    end
    
    subgraph System_Flow
        B2 --> C1[Update Status]
        B3 --> C1
        C1 --> C2[Journal Entry]
        C1 --> C3[Reports]
    end
```

## 5. Luồng Dữ Liệu Ngân Hàng

```mermaid
flowchart TB
    subgraph Bank_Statement
        A1[Bank File] --> A2[Parser]
        A2 --> A3[Validation]
    end
    
    subgraph Reconciliation
        A3 --> B1[Match Rules]
        B1 --> B2{Matched?}
        B2 -->|Yes| B3[Auto Clear]
        B2 -->|No| B4[Manual Match]
    end
    
    subgraph Accounting
        B3 & B4 --> C1[Update Ledger]
        C1 --> C2[Bank Reports]
    end
```

## 6. Luồng Dữ Liệu Thuế

```mermaid
flowchart TB
    subgraph Data_Collection
        A1[Invoices] & A2[Bills] & A3[Expenses] --> B1[Tax Calculator]
    end
    
    subgraph Tax_Processing
        B1 --> B2[VAT Report]
        B1 --> B3[CIT Report]
    end
    
    subgraph Submission
        B2 & B3 --> C1[XML Generator]
        C1 --> C2[Digital Sign]
        C2 --> C3[Tax Portal]
    end
```

## 7. Luồng Dữ Liệu Sản Xuất

```mermaid
flowchart TB
    subgraph Production_Flow
        A1[Production Order] --> A2[Material Issue]
        A2 --> A3[Production Process]
        A3 --> A4[Quality Check]
        A4 --> A5[Finished Goods]
    end
    
    subgraph Costing_Flow
        A2 & A3 & A4 --> B1[Cost Collection]
        B1 --> B2[Cost Allocation]
        B2 --> B3[Unit Cost]
    end
    
    subgraph Accounting_Flow
        B3 --> C1[WIP Account]
        C1 --> C2[Finished Goods Account]
        C2 --> C3[Cost Reports]
    end
```

## 8. Luồng Dữ Liệu Lương

```mermaid
flowchart TB
    subgraph Input_Data
        A1[Attendance] & A2[Overtime] & A3[Leaves] --> B1[Payroll Process]
    end
    
    subgraph Calculation
        B1 --> B2[Basic Salary]
        B1 --> B3[Allowances]
        B1 --> B4[Deductions]
    end
    
    subgraph Output
        B2 & B3 & B4 --> C1[Net Salary]
        C1 --> C2[Bank Transfer]
        C1 --> C3[Accounting Entry]
        C1 --> C4[Tax Reports]
    end
```

## 9. Luồng Dữ Liệu Tài Sản

```mermaid
flowchart TB
    subgraph Asset_Life
        A1[Asset Purchase] --> A2[Asset Recognition]
        A2 --> A3[Depreciation]
        A3 --> A4[Disposal]
    end
    
    subgraph Value_Flow
        A2 --> B1[Asset Value]
        A3 --> B2[Accumulated Depreciation]
        A4 --> B3[Disposal Value]
    end
    
    subgraph Accounting_Flow
        B1 & B2 & B3 --> C1[GL Entries]
        C1 --> C2[Asset Reports]
        C1 --> C3[Financial Reports]
    end
```

## 10. Luồng Dữ Liệu Báo Cáo Tài Chính

```mermaid
flowchart TB
    subgraph Source_Data
        A1[GL Entries]
        A2[Sub-ledgers]
        A3[Adjustments]
    end
    
    subgraph Processing
        B1[Data Aggregation]
        B2[Currency Translation]
        B3[Eliminations]
    end
    
    subgraph Reports
        C1[Balance Sheet]
        C2[Income Statement]
        C3[Cash Flow]
        C4[Notes]
    end
    
    A1 & A2 & A3 --> B1 --> B2 --> B3
    B3 --> C1 & C2 & C3 --> C4
