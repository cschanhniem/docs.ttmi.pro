# Các Ví Dụ Nghiệp Vụ Kế Toán Chi Tiết

## 1. Nghiệp Vụ Tiền Mặt và Ngân Hàng

### 1.1. Thu Tiền Từ Khách Hàng
```python
def thu_tien_khach_hang(entity_model, ledger_model, customer_id, amount: Decimal):
    """
    Thu tiền mặt từ khách hàng
    Nợ TK 111 - Tiền mặt
    Có TK 131 - Phải thu khách hàng
    """
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Thu tiền khách hàng'
    )
    
    # Ghi nợ TK 111
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='111',
        tx_type='debit',
        amount=amount
    )
    
    # Ghi có TK 131
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='131',
        tx_type='credit',
        amount=amount
    )
```

### 1.2. Chuyển Tiền Giữa Quỹ và Ngân Hàng
```python
def chuyen_tien_quy_ngan_hang(entity_model, ledger_model, amount: Decimal):
    """
    Chuyển tiền từ quỹ vào ngân hàng
    Nợ TK 112 - Tiền gửi ngân hàng
    Có TK 111 - Tiền mặt
    """
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Chuyển tiền vào ngân hàng'
    )
    
    # Ghi nợ TK 112
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='112',
        tx_type='debit',
        amount=amount
    )
    
    # Ghi có TK 111
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='111',
        tx_type='credit',
        amount=amount
    )
```

## 2. Nghiệp Vụ Mua Hàng và Công Nợ

### 2.1. Mua Hàng Trả Chậm
```python
def mua_hang_tra_cham(entity_model, ledger_model, items, vat_rate=0.1):
    """
    Mua hàng có VAT trả chậm
    Nợ TK 156 - Hàng hóa
    Nợ TK 133 - Thuế GTGT được khấu trừ
    Có TK 331 - Phải trả người bán
    """
    total_amount = sum(item['quantity'] * item['unit_cost'] for item in items)
    vat_amount = total_amount * vat_rate
    
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Mua hàng trả chậm'
    )
    
    # Ghi nợ TK 156
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='156',
        tx_type='debit',
        amount=total_amount
    )
    
    # Ghi nợ TK 133
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='1331',
        tx_type='debit',
        amount=vat_amount
    )
    
    # Ghi có TK 331
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='331',
        tx_type='credit',
        amount=total_amount + vat_amount
    )
```

### 2.2. Trả Tiền Cho Nhà Cung Cấp
```python
def tra_tien_nha_cung_cap(entity_model, ledger_model, vendor_id, amount: Decimal):
    """
    Trả tiền cho nhà cung cấp bằng chuyển khoản
    Nợ TK 331 - Phải trả người bán
    Có TK 112 - Tiền gửi ngân hàng
    """
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Trả tiền nhà cung cấp'
    )
    
    # Ghi nợ TK 331
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='331',
        tx_type='debit',
        amount=amount
    )
    
    # Ghi có TK 112
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='112',
        tx_type='credit',
        amount=amount
    )
```

## 3. Nghiệp Vụ Bán Hàng

### 3.1. Bán Hàng Thu Tiền Ngay
```python
def ban_hang_thu_tien_ngay(entity_model, ledger_model, items, vat_rate=0.1):
    """
    Bán hàng có VAT thu tiền ngay
    Nợ TK 111 - Tiền mặt
    Có TK 511 - Doanh thu bán hàng
    Có TK 3331 - Thuế GTGT phải nộp
    
    Đồng thời ghi nhận giá vốn:
    Nợ TK 632 - Giá vốn hàng bán
    Có TK 156 - Hàng hóa
    """
    total_amount = sum(item['quantity'] * item['unit_price'] for item in items)
    vat_amount = total_amount * vat_rate
    cost_amount = sum(item['quantity'] * item['unit_cost'] for item in items)
    
    # Bút toán bán hàng
    je1 = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Bán hàng thu tiền ngay'
    )
    
    # Ghi nợ TK 111
    TransactionModel.objects.create(
        journal_entry=je1,
        account_id='111',
        tx_type='debit',
        amount=total_amount + vat_amount
    )
    
    # Ghi có TK 511
    TransactionModel.objects.create(
        journal_entry=je1,
        account_id='5111',
        tx_type='credit',
        amount=total_amount
    )
    
    # Ghi có TK 3331
    TransactionModel.objects.create(
        journal_entry=je1,
        account_id='33311',
        tx_type='credit',
        amount=vat_amount
    )
    
    # Bút toán giá vốn
    je2 = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Ghi nhận giá vốn'
    )
    
    # Ghi nợ TK 632
    TransactionModel.objects.create(
        journal_entry=je2,
        account_id='632',
        tx_type='debit',
        amount=cost_amount
    )
    
    # Ghi có TK 156
    TransactionModel.objects.create(
        journal_entry=je2,
        account_id='156',
        tx_type='credit',
        amount=cost_amount
    )
```

## 4. Nghiệp Vụ Lương và Bảo Hiểm

### 4.1. Tính Lương và Trích Bảo Hiểm
```python
def tinh_luong_va_bao_hiem(entity_model, ledger_model, salary_data):
    """
    Tính lương và trích bảo hiểm
    """
    total_salary = sum(emp['gross_salary'] for emp in salary_data)
    insurance_amount = total_salary * Decimal('0.215')  # 21.5% BHXH+BHYT+BHTN
    
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Tính lương và trích bảo hiểm tháng'
    )
    
    # Ghi nợ TK 642 - Chi phí lương
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='6421',
        tx_type='debit',
        amount=total_salary + insurance_amount
    )
    
    # Ghi có TK 334 - Phải trả người lao động
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='334',
        tx_type='credit',
        amount=total_salary
    )
    
    # Ghi có TK 338 - Phải trả bảo hiểm
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='3383',
        tx_type='credit',
        amount=insurance_amount
    )
```

## 5. Nghiệp Vụ Tài Sản Cố Định

### 5.1. Mua Sắm TSCĐ
```python
def mua_tscd(entity_model, ledger_model, asset_data):
    """
    Mua tài sản cố định
    """
    asset_cost = Decimal(str(asset_data['cost']))
    vat_amount = asset_cost * Decimal('0.1')
    
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description=f"Mua TSCĐ: {asset_data['name']}"
    )
    
    # Ghi nợ TK 211 - TSCĐ
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='211',
        tx_type='debit',
        amount=asset_cost
    )
    
    # Ghi nợ TK 133 - Thuế GTGT
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='1332',
        tx_type='debit',
        amount=vat_amount
    )
    
    # Ghi có TK 112 - Tiền gửi ngân hàng
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='112',
        tx_type='credit',
        amount=asset_cost + vat_amount
    )
```

### 5.2. Trích Khấu Hao TSCĐ
```python
def trich_khau_hao(entity_model, ledger_model, asset_id, amount: Decimal):
    """
    Trích khấu hao TSCĐ hàng tháng
    """
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Trích khấu hao TSCĐ'
    )
    
    # Ghi nợ TK 642 - Chi phí khấu hao
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='6424',
        tx_type='debit',
        amount=amount
    )
    
    # Ghi có TK 214 - Hao mòn TSCĐ
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='2141',
        tx_type='credit',
        amount=amount
    )
```

## 6. Kết Chuyển Cuối Kỳ

### 6.1. Kết Chuyển Doanh Thu
```python
def ket_chuyen_doanh_thu(entity_model, ledger_model):
    """
    Kết chuyển doanh thu vào XĐKQKD
    """
    # Lấy tổng doanh thu
    revenue = TransactionModel.objects.filter(
        journal_entry__ledger=ledger_model,
        account_id__startswith='511'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Kết chuyển doanh thu'
    )
    
    # Ghi nợ TK 511
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='511',
        tx_type='debit',
        amount=revenue
    )
    
    # Ghi có TK 911
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='911',
        tx_type='credit',
        amount=revenue
    )
```

### 6.2. Kết Chuyển Chi Phí
```python
def ket_chuyen_chi_phi(entity_model, ledger_model):
    """
    Kết chuyển các chi phí vào XĐKQKD
    """
    # Lấy tổng chi phí
    expenses = TransactionModel.objects.filter(
        journal_entry__ledger=ledger_model,
        account_id__startswith='6'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    je = JournalEntryModel.objects.create(
        ledger=ledger_model,
        description='Kết chuyển chi phí'
    )
    
    # Ghi nợ TK 911
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='911',
        tx_type='debit',
        amount=expenses
    )
    
    # Ghi có TK 6xx
    for expense_account in ['632', '641', '642']:
        amount = TransactionModel.objects.filter(
            journal_entry__ledger=ledger_model,
            account_id__startswith=expense_account
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        if amount > 0:
            TransactionModel.objects.create(
                journal_entry=je,
                account_id=expense_account,
                tx_type='credit',
                amount=amount
            )
```

## 7. Báo Cáo Chi Tiết

### 7.1. Sổ Chi Tiết Công Nợ
```python
def so_chi_tiet_cong_no(entity_model, account_id, partner_id, start_date, end_date):
    """
    Xuất sổ chi tiết công nợ theo đối tác
    """
    transactions = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id=account_id,
        partner_id=partner_id,
        journal_entry__date__range=[start_date, end_date]
    ).order_by('journal_entry__date')
    
    opening_balance = get_opening_balance(
        entity_model, 
        account_id,
        partner_id,
        start_date
    )
    
    return {
        'opening_balance': opening_balance,
        'transactions': transactions,
        'closing_balance': calculate_closing_balance(
            opening_balance,
            transactions
        )
    }
```

### 7.2. Báo Cáo Tuổi Nợ
```python
def bao_cao_tuoi_no(entity_model, account_id, as_of_date):
    """
    Phân tích tuổi nợ của khách hàng/nhà cung cấp
    """
    return {
        'current': get_debt_by_age(entity_model, account_id, 0, 30),
        '30_60': get_debt_by_age(entity_model, account_id, 30, 60),
        '60_90': get_debt_by_age(entity_model, account_id, 60, 90),
        'over_90': get_debt_by_age(entity_model, account_id, 90, None)
    }
```

## 8. Các Công Cụ Hỗ Trợ

### 8.1. Tạo Bút Toán Tự Động
```python
class AutomaticJournalEntry:
    """
    Lớp hỗ trợ tạo bút toán tự động
    """
    def __init__(self, entity_model, ledger_model):
        self.entity = entity_model
        self.ledger = ledger_model
        self.entries = []
    
    def add_debit(self, account_id, amount, description=None):
        self.entries.append({
            'account_id': account_id,
            'tx_type': 'debit',
            'amount': amount,
            'description': description
        })
    
    def add_credit(self, account_id, amount, description=None):
        self.entries.append({
            'account_id': account_id,
            'tx_type': 'credit',
            'amount': amount,
            'description': description
        })
    
    def validate(self):
        debit_sum = sum(e['amount'] for e in self.entries 
                       if e['tx_type'] == 'debit')
        credit_sum = sum(e['amount'] for e in self.entries 
                        if e['tx_type'] == 'credit')
        return abs(debit_sum - credit_sum) < Decimal('0.02')
    
    def post(self, description):
        if not self.validate():
            raise ValueError("Bút toán không cân đối")
            
        je = JournalEntryModel.objects.create(
            ledger=self.ledger,
            description=description
        )
        
        for entry in self.entries:
            TransactionModel.objects.create(
                journal_entry=je,
                account_id=entry['account_id'],
                tx_type=entry['tx_type'],
                amount=entry['amount'],
                description=entry['description']
            )
        
        return je
```

### 8.2. Tính Toán Số Dư
```python
def tinh_so_du(entity_model, account_id, start_date, end_date):
    """
    Tính số dư tài khoản theo kỳ
    """
    opening_balance = get_opening_balance(
        entity_model,
        account_id,
        start_date
    )
    
    transactions = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id=account_id,
        journal_entry__date__range=[start_date, end_date]
    )
    
    debit_sum = transactions.filter(
        tx_type='debit'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    credit_sum = transactions.filter(
        tx_type='credit'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return {
        'opening_balance': opening_balance,
        'debit_total': debit_sum,
        'credit_total': credit_sum,
        'closing_balance': opening_balance + debit_sum - credit_sum
    }
