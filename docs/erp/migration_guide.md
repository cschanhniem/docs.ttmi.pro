# Hướng Dẫn Chuyển Đổi Từ Các Hệ Thống Kế Toán Khác

## 1. Chuẩn Bị Dữ Liệu

### 1.1. Dữ Liệu Cần Chuẩn Bị
- Danh mục tài khoản hiện tại
- Số dư đầu kỳ các tài khoản
- Lịch sử giao dịch (nếu cần)
- Danh sách đối tác (khách hàng, nhà cung cấp)

### 1.2. Định Dạng File Import
```csv
code,name,parent,role,balance_type,opening_balance
111,Tiền mặt,,ASSET_CA_CASH,debit,1000000
1111,Tiền mặt VND,111,ASSET_CA_CASH,debit,800000
1112,Tiền USD,111,ASSET_CA_CASH,debit,200000
```

## 2. Các Bước Chuyển Đổi

### 2.1. Import Hệ Thống Tài Khoản
```python
from django_ledger.models import ChartOfAccountModel
from django_ledger.io.roles import ASSET_CA_CASH

def import_accounts(entity, file_path):
    coa = ChartOfAccountModel.objects.create(
        name='Hệ thống tài khoản import',
        entity=entity
    )
    
    # Đọc file CSV và import
    import pandas as pd
    df = pd.read_csv(file_path)
    
    for _, row in df.iterrows():
        coa.create_account(
            code=row['code'],
            name=row['name'],
            role=row['role'],
            balance_type=row['balance_type'],
            parent=row['parent'] if pd.notna(row['parent']) else None
        )
```

### 2.2. Import Số Dư Ban Đầu
```python
from django_ledger.models import JournalEntryModel, TransactionModel
from decimal import Decimal

def import_opening_balances(entity, ledger, data):
    je = JournalEntryModel.objects.create(
        ledger=ledger,
        description='Số dư đầu kỳ'
    )
    
    for account_data in data:
        TransactionModel.objects.create(
            journal_entry=je,
            account_id=account_data['account_id'],
            tx_type=account_data['tx_type'],
            amount=Decimal(account_data['amount'])
        )
```

## 3. Xử Lý Các Trường Hợp Đặc Biệt

### 3.1. Tài Khoản Không Khớp
```python
def map_account_codes(old_system_code):
    mapping = {
        '1111': '1111',  # Tiền mặt VND
        '1121': '1121',  # Tiền gửi VND
        '131': '131',    # Phải thu
        # Thêm các mapping khác
    }
    return mapping.get(old_system_code)
```

### 3.2. Xử Lý Sai Lệch
```python
def validate_trial_balance(ledger):
    """Kiểm tra cân đối"""
    debit_sum = TransactionModel.objects.filter(
        journal_entry__ledger=ledger,
        tx_type='debit'
    ).aggregate(Sum('amount'))
    
    credit_sum = TransactionModel.objects.filter(
        journal_entry__ledger=ledger,
        tx_type='credit'
    ).aggregate(Sum('amount'))
    
    return debit_sum == credit_sum
```

## 4. Kiểm Tra Và Xác Nhận

### 4.1. Báo Cáo Kiểm Tra
```python
def generate_migration_report(entity):
    return {
        'total_accounts': AccountModel.objects.filter(
            coa_model__entity=entity
        ).count(),
        'total_transactions': TransactionModel.objects.filter(
            journal_entry__ledger__entity=entity
        ).count(),
        'balance_sheet': get_balance_sheet(entity),
        'trial_balance': get_trial_balance(entity)
    }
```

### 4.2. Các Chỉ Tiêu Cần Kiểm Tra
- Tổng tài sản = Tổng nguồn vốn
- Số dư các tài khoản tiền
- Công nợ khách hàng và nhà cung cấp
- Thuế và các khoản phải nộp nhà nước

## 5. Quy Trình Chuyển Đổi

### 5.1. Trước Chuyển Đổi
1. Backup dữ liệu hệ thống cũ
2. Kiểm tra cân đối số liệu
3. Chuẩn bị file mapping

### 5.2. Trong Chuyển Đổi
1. Import hệ thống tài khoản
2. Import số dư ban đầu
3. Kiểm tra từng bước

### 5.3. Sau Chuyển Đổi
1. Đối chiếu số liệu
2. Chạy song song 1 tháng
3. Đánh giá và điều chỉnh

## 6. Xử Lý Sự Cố

### 6.1. Lỗi Import
```python
def handle_import_error(error, data):
    """
    Ghi log và xử lý lỗi import
    """
    logging.error(f"Import error: {error}")
    logging.error(f"Problem data: {data}")
    
    if isinstance(error, DuplicateAccountError):
        # Xử lý trùng mã tài khoản
        return handle_duplicate_account(data)
    elif isinstance(error, InvalidBalanceError):
        # Xử lý sai số dư
        return handle_invalid_balance(data)
    return None
```

### 6.2. Khôi Phục Dữ Liệu
```python
def rollback_migration(entity, timestamp):
    """
    Khôi phục dữ liệu về thời điểm trước khi import
    """
    AccountModel.objects.filter(
        coa_model__entity=entity,
        created_at__gt=timestamp
    ).delete()
    
    JournalEntryModel.objects.filter(
        ledger__entity=entity,
        created_at__gt=timestamp
    ).delete()
```

## 7. Tài Liệu Tham Khảo

1. [Thông tư 200/2014/TT-BTC](https://thuvienphapluat.vn/van-ban/Ke-toan-Kiem-toan/Thong-tu-200-2014-TT-BTC-huong-dan-Che-do-ke-toan-Doanh-nghiep-263599.aspx)
2. [Django Ledger Documentation](https://django-ledger.readthedocs.io/)
3. [Python Pandas Documentation](https://pandas.pydata.org/docs/)

## 8. Phụ Lục

### 8.1. Mẫu File Import
- [Tải mẫu file Excel](templates/import_template.xlsx)
- [Tải mẫu file CSV](templates/import_template.csv)

### 8.2. Script Hỗ Trợ
- [Script chuyển đổi từ Misa](scripts/misa_converter.py)
- [Script chuyển đổi từ Fast](scripts/fast_converter.py)
- [Script kiểm tra số liệu](scripts/data_validator.py)
