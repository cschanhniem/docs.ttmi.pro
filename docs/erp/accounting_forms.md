# Hướng Dẫn Mẫu Biểu và Sổ Sách Kế Toán Theo TT200

## 1. Chứng Từ Kế Toán

### 1.1. Phiếu Thu (Mẫu 01-TT)
```python
def tao_phieu_thu(entity_model, data):
    """
    Tạo phiếu thu tiền mặt
    """
    phieu_thu = {
        'so_chung_tu': generate_document_number('PT'),
        'ngay_chung_tu': data['ngay_chung_tu'],
        'doi_tuong_nop': data['doi_tuong_nop'],
        'dia_chi': data['dia_chi'],
        'ly_do_nop': data['ly_do_nop'],
        'so_tien': data['so_tien'],
        'bang_chu': convert_number_to_words(data['so_tien']),
        'kem_theo': data.get('kem_theo', ''),
        'but_toan': [
            {
                'tai_khoan_no': '111',
                'tai_khoan_co': data['tai_khoan_doi_ung'],
                'so_tien': data['so_tien']
            }
        ]
    }
    
    # Tạo bút toán
    je = create_journal_entry(entity_model, phieu_thu['but_toan'])
    
    # Lưu chứng từ
    save_document(entity_model, 'phieu_thu', phieu_thu, je.uuid)
    
    return phieu_thu
```

### 1.2. Phiếu Chi (Mẫu 02-TT)
```python
def tao_phieu_chi(entity_model, data):
    """
    Tạo phiếu chi tiền mặt
    """
    phieu_chi = {
        'so_chung_tu': generate_document_number('PC'),
        'ngay_chung_tu': data['ngay_chung_tu'],
        'nguoi_nhan': data['nguoi_nhan'],
        'dia_chi': data['dia_chi'],
        'ly_do_chi': data['ly_do_chi'],
        'so_tien': data['so_tien'],
        'bang_chu': convert_number_to_words(data['so_tien']),
        'kem_theo': data.get('kem_theo', ''),
        'but_toan': [
            {
                'tai_khoan_no': data['tai_khoan_doi_ung'],
                'tai_khoan_co': '111',
                'so_tien': data['so_tien']
            }
        ]
    }
    
    # Tạo bút toán
    je = create_journal_entry(entity_model, phieu_chi['but_toan'])
    
    # Lưu chứng từ
    save_document(entity_model, 'phieu_chi', phieu_chi, je.uuid)
    
    return phieu_chi
```

## 2. Sổ Kế Toán Chi Tiết

### 2.1. Sổ Quỹ Tiền Mặt (Mẫu S07-DN)
```python
def in_so_quy_tien_mat(entity_model, start_date, end_date):
    """
    In sổ quỹ tiền mặt
    """
    # Lấy số dư đầu kỳ
    so_du_dk = get_opening_balance(entity_model, '111', start_date)
    
    # Lấy các giao dịch trong kỳ
    transactions = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id='111',
        journal_entry__date__range=[start_date, end_date]
    ).order_by('journal_entry__date', 'journal_entry__id')
    
    entries = []
    total_debit = Decimal('0')
    total_credit = Decimal('0')
    balance = so_du_dk
    
    for tx in transactions:
        if tx.tx_type == 'debit':
            balance += tx.amount
            total_debit += tx.amount
        else:
            balance -= tx.amount
            total_credit += tx.amount
            
        entries.append({
            'ngay_chung_tu': tx.journal_entry.date,
            'so_chung_tu': tx.journal_entry.je_number,
            'dien_giai': tx.journal_entry.description,
            'thu': tx.amount if tx.tx_type == 'debit' else 0,
            'chi': tx.amount if tx.tx_type == 'credit' else 0,
            'ton': balance
        })
    
    return {
        'so_du_dau_ky': so_du_dk,
        'entries': entries,
        'tong_thu': total_debit,
        'tong_chi': total_credit,
        'so_du_cuoi_ky': balance
    }
```

### 2.2. Sổ Kế Toán Chi Tiết Vật Tư (S12-DN)
```python
def in_so_chi_tiet_vat_tu(entity_model, material_code, start_date, end_date):
    """
    In sổ chi tiết vật tư, hàng hóa
    """
    # Lấy số dư đầu kỳ
    so_du_dk = get_inventory_opening_balance(
        entity_model,
        material_code,
        start_date
    )
    
    # Lấy các giao dịch trong kỳ
    transactions = InventoryTransactionModel.objects.filter(
        entity=entity_model,
        material_code=material_code,
        date__range=[start_date, end_date]
    ).order_by('date')
    
    entries = []
    total_in = Decimal('0')
    total_out = Decimal('0')
    quantity = so_du_dk['quantity']
    value = so_du_dk['value']
    
    for tx in transactions:
        if tx.transaction_type == 'in':
            quantity += tx.quantity
            value += tx.value
            total_in += tx.quantity
        else:
            quantity -= tx.quantity
            value -= tx.value
            total_out += tx.quantity
            
        entries.append({
            'ngay_chung_tu': tx.date,
            'so_chung_tu': tx.document_number,
            'dien_giai': tx.description,
            'nhap_so_luong': tx.quantity if tx.transaction_type == 'in' else 0,
            'nhap_don_gia': tx.unit_price if tx.transaction_type == 'in' else 0,
            'nhap_thanh_tien': tx.value if tx.transaction_type == 'in' else 0,
            'xuat_so_luong': tx.quantity if tx.transaction_type == 'out' else 0,
            'xuat_don_gia': tx.unit_price if tx.transaction_type == 'out' else 0,
            'xuat_thanh_tien': tx.value if tx.transaction_type == 'out' else 0,
            'ton_so_luong': quantity,
            'ton_thanh_tien': value
        })
    
    return {
        'so_du_dau_ky': so_du_dk,
        'entries': entries,
        'tong_nhap': {'so_luong': total_in},
        'tong_xuat': {'so_luong': total_out},
        'ton_cuoi_ky': {
            'so_luong': quantity,
            'gia_tri': value
        }
    }
```

## 3. Sổ Kế Toán Tổng Hợp

### 3.1. Sổ Nhật Ký Chung (Mẫu S01-DN)
```python
def in_so_nhat_ky_chung(entity_model, start_date, end_date):
    """
    In sổ nhật ký chung
    """
    entries = JournalEntryModel.objects.filter(
        ledger__entity=entity_model,
        date__range=[start_date, end_date]
    ).prefetch_related('transactionmodel_set')
    
    so_nhat_ky = []
    page = 1
    total_debit = Decimal('0')
    total_credit = Decimal('0')
    
    for je in entries:
        transactions = je.transactionmodel_set.all()
        
        for tx in transactions:
            if tx.tx_type == 'debit':
                total_debit += tx.amount
            else:
                total_credit += tx.amount
                
            so_nhat_ky.append({
                'ngay_chung_tu': je.date,
                'so_chung_tu': je.je_number,
                'dien_giai': je.description,
                'tai_khoan_no': tx.account_id if tx.tx_type == 'debit' else '',
                'tai_khoan_co': tx.account_id if tx.tx_type == 'credit' else '',
                'so_tien': tx.amount,
                'trang_so': page
            })
            
        if len(so_nhat_ky) >= 30:  # 30 dòng mỗi trang
            page += 1
    
    return {
        'entries': so_nhat_ky,
        'tong_phat_sinh': {
            'no': total_debit,
            'co': total_credit
        },
        'so_trang': page
    }
```

### 3.2. Sổ Cái (Mẫu S02-DN)
```python
def in_so_cai(entity_model, account_id, start_date, end_date):
    """
    In sổ cái các tài khoản
    """
    # Lấy số dư đầu kỳ
    so_du_dk = get_opening_balance(entity_model, account_id, start_date)
    
    # Lấy các phát sinh trong kỳ
    transactions = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id=account_id,
        journal_entry__date__range=[start_date, end_date]
    ).order_by('journal_entry__date', 'journal_entry__id')
    
    entries = []
    total_debit = Decimal('0')
    total_credit = Decimal('0')
    balance = so_du_dk
    
    for tx in transactions:
        if tx.tx_type == 'debit':
            balance += tx.amount
            total_debit += tx.amount
        else:
            balance -= tx.amount
            total_credit += tx.amount
            
        entries.append({
            'ngay_chung_tu': tx.journal_entry.date,
            'so_chung_tu': tx.journal_entry.je_number,
            'dien_giai': tx.journal_entry.description,
            'tai_khoan_doi_ung': get_corresponding_account(tx),
            'phat_sinh_no': tx.amount if tx.tx_type == 'debit' else 0,
            'phat_sinh_co': tx.amount if tx.tx_type == 'credit' else 0,
            'so_du': balance
        })
    
    return {
        'so_du_dau_ky': so_du_dk,
        'entries': entries,
        'tong_phat_sinh': {
            'no': total_debit,
            'co': total_credit
        },
        'so_du_cuoi_ky': balance
    }
```

## 4. Thuyết Minh Báo Cáo Tài Chính

### 4.1. Thuyết Minh Tài Sản Cố Định (Mẫu B09-DN)
```python
def thuyet_minh_tscd(entity_model, report_date):
    """
    Thuyết minh tăng giảm TSCĐ
    """
    return {
        'nguyen_gia': {
            'so_dau_nam': get_fixed_assets_cost(entity_model, start_of_year(report_date)),
            'tang_trong_ky': get_fixed_assets_additions(entity_model, report_date),
            'giam_trong_ky': get_fixed_assets_disposals(entity_model, report_date),
            'so_cuoi_ky': get_fixed_assets_cost(entity_model, report_date)
        },
        'hao_mon': {
            'so_dau_nam': get_accumulated_depreciation(entity_model, start_of_year(report_date)),
            'khau_hao': get_depreciation_expense(entity_model, report_date),
            'giam_khac': get_depreciation_disposals(entity_model, report_date),
            'so_cuoi_ky': get_accumulated_depreciation(entity_model, report_date)
        },
        'gia_tri_con_lai': {
            'so_dau_nam': get_net_book_value(entity_model, start_of_year(report_date)),
            'so_cuoi_ky': get_net_book_value(entity_model, report_date)
        }
    }
```

### 4.2. Thuyết Minh Vay và Nợ (Mẫu B09-DN)
```python
def thuyet_minh_vay_no(entity_model, report_date):
    """
    Thuyết minh các khoản vay
    """
    return {
        'vay_ngan_han': {
            'so_dau_nam': get_loan_balance(entity_model, 'short_term', start_of_year(report_date)),
            'tang_trong_ky': get_loan_additions(entity_model, 'short_term', report_date),
            'giam_trong_ky': get_loan_payments(entity_model, 'short_term', report_date),
            'so_cuoi_ky': get_loan_balance(entity_model, 'short_term', report_date)
        },
        'vay_dai_han': {
            'so_dau_nam': get_loan_balance(entity_model, 'long_term', start_of_year(report_date)),
            'tang_trong_ky': get_loan_additions(entity_model, 'long_term', report_date),
            'giam_trong_ky': get_loan_payments(entity_model, 'long_term', report_date),
            'so_cuoi_ky': get_loan_balance(entity_model, 'long_term', report_date)
        }
    }
```

## 5. Xuất Báo Cáo

### 5.1. Xuất File Excel
```python
def xuat_bao_cao_excel(report_type, data):
    """
    Xuất báo cáo ra file Excel theo mẫu
    """
    import openpyxl
    from openpyxl.styles import Alignment, Font, Border, Side
    
    # Tải template tương ứng
    wb = openpyxl.load_workbook(f'templates/{report_type}.xlsx')
    ws = wb.active
    
    # Điền dữ liệu vào template
    fill_template(ws, data)
    
    # Định dạng báo cáo
    format_report(ws)
    
    # Lưu file
    output = BytesIO()
    wb.save(output)
    return output.getvalue()
```

### 5.2. Xuất File PDF
```python
def xuat_bao_cao_pdf(report_type, data):
    """
    Xuất báo cáo ra file PDF theo mẫu
    """
    from weasyprint import HTML, CSS
    
    # Tạo HTML từ template
    template = get_template(f'reports/{report_type}.html')
    html_string = template.render(data)
    
    # Tạo PDF
    html = HTML(string=html_string)
    css = CSS(string='''
        @page {
            size: A4;
            margin: 2cm;
        }
        .header {
            text-align: center;
            font-weight: bold;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table td, .table th {
            border: 1px solid black;
            padding: 5px;
        }
    ''')
    
    return html.write_pdf(stylesheets=[css])
```

## 6. Tiện Ích Hỗ Trợ

### 6.1. Tạo Số Chứng Từ
```python
def generate_document_number(prefix, entity_model=None):
    """
    Tạo số chứng từ tự động
    """
    if entity_model:
        last_number = get_last_document_number(entity_model, prefix)
        next_number = int(last_number[len(prefix):]) + 1 if last_number else 1
    else:
        next_number = 1
        
    return f"{prefix}{next_number:06d}"
```

### 6.2. Chuyển Số Thành Chữ
```python
def convert_number_to_words(number):
    """
    Chuyển số thành chữ tiếng Việt
    """
    units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
    thousands = ["", "nghìn", "triệu", "tỷ"]
    
    def read_group(n):
        hundreds = n // 100
        tens = (n % 100) // 10
        ones = n % 10
        
        result = []
        if hundreds:
            result.extend([units[hundreds], "trăm"])
        if tens:
            if tens == 1:
                result.append("mười")
            else:
                result.extend([units[tens], "mươi"])
        if ones:
            result.append(units[ones])
            
        return " ".join(result)
    
    if number == 0:
        return "không"
        
    groups = []
    num = abs(number)
    while num:
        groups.append(num % 1000)
        num //= 1000
        
    result = []
    for i, group in enumerate(groups):
        if group:
            result.insert(0, read_group(group))
            if i < len(thousands):
                result.insert(1, thousands[i])
                
    return " ".join(result) + " đồng"
