# Hướng Dẫn Báo Cáo Tài Chính và Thuế

## 1. Các Loại Báo Cáo Tài Chính

### 1.1. Bảng Cân Đối Kế Toán (Mẫu B01-DN)
```python
from django_ledger.io.io_generator import BalanceSheetGenerator

def xuat_bang_can_doi_ke_toan(entity_model, report_date):
    """
    Xuất bảng cân đối kế toán theo mẫu B01-DN
    """
    generator = BalanceSheetGenerator(
        entity_slug=entity_model.slug,
        to_date=report_date
    )
    
    data = generator.get_balance_sheet_data()
    
    return {
        'tai_san': {
            'tai_san_ngan_han': {
                'tien': data.get_account_balance(['111', '112']),
                'dau_tu_tc_ngan_han': data.get_account_balance(['121', '128']),
                'phai_thu': data.get_account_balance(['131', '136', '138']),
                'hang_ton_kho': data.get_account_balance(['151', '152', '153', '155', '156']),
            },
            'tai_san_dai_han': {
                'tai_san_co_dinh': data.get_account_balance(['211', '213']) - 
                                 data.get_account_balance(['214']),
                'bat_dong_san_dau_tu': data.get_account_balance(['217']),
                'tai_san_do_dang': data.get_account_balance(['241']),
            }
        },
        'nguon_von': {
            'no_phai_tra': {
                'no_ngan_han': data.get_account_balance(['311', '331', '333', '334']),
                'no_dai_han': data.get_account_balance(['341', '343']),
            },
            'von_chu_so_huu': {
                'von_gop': data.get_account_balance(['411']),
                'loi_nhuan_chua_phan_phoi': data.get_account_balance(['421']),
            }
        }
    }
```

### 1.2. Báo Cáo Kết Quả Kinh Doanh (Mẫu B02-DN)
```python
from django_ledger.io.io_generator import IncomeStatementGenerator

def xuat_bao_cao_kqkd(entity_model, start_date, end_date):
    """
    Xuất báo cáo kết quả kinh doanh theo mẫu B02-DN
    """
    generator = IncomeStatementGenerator(
        entity_slug=entity_model.slug,
        from_date=start_date,
        to_date=end_date
    )
    
    data = generator.get_income_statement_data()
    
    return {
        'doanh_thu': {
            'doanh_thu_ban_hang': data.get_account_balance(['511']),
            'cac_khoan_giam_tru': data.get_account_balance(['521']),
            'doanh_thu_thuan': data.get_account_balance(['511']) - 
                              data.get_account_balance(['521'])
        },
        'chi_phi': {
            'gia_von_hang_ban': data.get_account_balance(['632']),
            'chi_phi_ban_hang': data.get_account_balance(['641']),
            'chi_phi_quan_ly': data.get_account_balance(['642'])
        },
        'loi_nhuan': {
            'loi_nhuan_gop': data.get_gross_profit(),
            'loi_nhuan_truoc_thue': data.get_earnings_before_tax(),
            'loi_nhuan_sau_thue': data.get_net_income()
        }
    }
```

### 1.3. Báo Cáo Lưu Chuyển Tiền Tệ (Mẫu B03-DN)
```python
from django_ledger.io.io_generator import CashFlowStatementGenerator

def xuat_bao_cao_lctt(entity_model, start_date, end_date):
    """
    Xuất báo cáo lưu chuyển tiền tệ theo mẫu B03-DN
    """
    generator = CashFlowStatementGenerator(
        entity_slug=entity_model.slug,
        from_date=start_date,
        to_date=end_date
    )
    
    data = generator.get_cash_flow_statement()
    
    return {
        'lctt_hoat_dong_kinh_doanh': {
            'thu_tu_ban_hang': data.get_cash_receipts_from_customers(),
            'chi_tra_nguoi_ban': data.get_payments_to_suppliers(),
            'chi_tra_nguoi_lao_dong': data.get_payments_to_employees(),
            'thue_tndn_da_nop': data.get_income_tax_paid()
        },
        'lctt_hoat_dong_dau_tu': {
            'chi_mua_sam_tscd': data.get_capital_expenditures(),
            'thu_tu_thanh_ly_tscd': data.get_proceeds_from_asset_sales()
        },
        'lctt_hoat_dong_tai_chinh': {
            'thu_tu_di_vay': data.get_proceeds_from_borrowings(),
            'tra_no_goc_vay': data.get_debt_principal_payments()
        }
    }
```

## 2. Báo Cáo Thuế

### 2.1. Tờ Khai Thuế GTGT (Mẫu 01/GTGT)
```python
def lap_to_khai_thue_gtgt(entity_model, period_month, period_year):
    """
    Lập tờ khai thuế GTGT theo tháng
    """
    # Tính thuế GTGT đầu ra
    thue_gtgt_dau_ra = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id='33311',
        journal_entry__date__month=period_month,
        journal_entry__date__year=period_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Tính thuế GTGT đầu vào được khấu trừ
    thue_gtgt_dau_vao = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id='1331',
        journal_entry__date__month=period_month,
        journal_entry__date__year=period_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return {
        'thue_gtgt_dau_ra': thue_gtgt_dau_ra,
        'thue_gtgt_dau_vao': thue_gtgt_dau_vao,
        'thue_gtgt_phai_nop': thue_gtgt_dau_ra - thue_gtgt_dau_vao
    }
```

### 2.2. Tờ Khai Thuế TNDN Tạm Tính (Mẫu 01A/TNDN)
```python
def lap_to_khai_thue_tndn_tam_tinh(entity_model, quarter, year):
    """
    Lập tờ khai thuế TNDN tạm tính theo quý
    """
    # Tính tổng doanh thu
    doanh_thu = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id__startswith='511',
        journal_entry__date__year=year,
        journal_entry__date__quarter=quarter
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Tính tổng chi phí
    chi_phi = TransactionModel.objects.filter(
        journal_entry__ledger__entity=entity_model,
        account_id__startswith='6',
        journal_entry__date__year=year,
        journal_entry__date__quarter=quarter
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    loi_nhuan = doanh_thu - chi_phi
    thue_suat = Decimal('0.20')  # 20%
    
    return {
        'tong_doanh_thu': doanh_thu,
        'tong_chi_phi': chi_phi,
        'loi_nhuan_truoc_thue': loi_nhuan,
        'thue_tndn_tam_tinh': loi_nhuan * thue_suat
    }
```

### 2.3. Tờ Khai Quyết Toán Thuế TNDN (Mẫu 03/TNDN)
```python
def lap_to_khai_quyet_toan_thue_tndn(entity_model, year):
    """
    Lập tờ khai quyết toán thuế TNDN năm
    """
    # Tính kết quả kinh doanh
    doanh_thu = get_annual_revenue(entity_model, year)
    chi_phi = get_annual_expenses(entity_model, year)
    loi_nhuan_ke_toan = doanh_thu - chi_phi
    
    # Xác định các khoản điều chỉnh
    dieu_chinh_tang = get_increasing_adjustments(entity_model, year)
    dieu_chinh_giam = get_decreasing_adjustments(entity_model, year)
    
    # Tính thu nhập chịu thuế
    thu_nhap_chiu_thue = loi_nhuan_ke_toan + dieu_chinh_tang - dieu_chinh_giam
    
    # Tính thuế TNDN
    thue_suat = Decimal('0.20')
    thue_tndn = thu_nhap_chiu_thue * thue_suat
    
    return {
        'ket_qua_kinh_doanh': {
            'doanh_thu': doanh_thu,
            'chi_phi': chi_phi,
            'loi_nhuan_ke_toan': loi_nhuan_ke_toan
        },
        'xac_dinh_thu_nhap_chiu_thue': {
            'loi_nhuan_ke_toan': loi_nhuan_ke_toan,
            'dieu_chinh_tang': dieu_chinh_tang,
            'dieu_chinh_giam': dieu_chinh_giam,
            'thu_nhap_chiu_thue': thu_nhap_chiu_thue
        },
        'tinh_thue_tndn': {
            'thu_nhap_chiu_thue': thu_nhap_chiu_thue,
            'thue_suat': thue_suat,
            'thue_tndn_phai_nop': thue_tndn
        }
    }
```

## 3. Báo Cáo Phân Tích

### 3.1. Phân Tích Tài Chính
```python
def phan_tich_tai_chinh(entity_model, report_date):
    """
    Phân tích các chỉ số tài chính cơ bản
    """
    calculator = FinancialRatioCalculator(
        entity_model=entity_model,
        report_date=report_date
    )
    
    return {
        'kha_nang_thanh_toan': {
            'ty_so_thanh_toan_hien_hanh': calculator.current_ratio(),
            'ty_so_thanh_toan_nhanh': calculator.quick_ratio()
        },
        'hieu_qua_hoat_dong': {
            'vong_quay_hang_ton_kho': calculator.inventory_turnover(),
            'ky_thu_tien_trung_binh': calculator.average_collection_period()
        },
        'kha_nang_sinh_loi': {
            'ty_suat_loi_nhuan_gop': calculator.gross_profit_margin(),
            'ty_suat_loi_nhuan_rong': calculator.net_profit_margin(),
            'ROE': calculator.return_on_equity(),
            'ROA': calculator.return_on_assets()
        }
    }
```

### 3.2. Phân Tích Chi Phí
```python
def phan_tich_chi_phi(entity_model, start_date, end_date):
    """
    Phân tích cơ cấu chi phí
    """
    total_expenses = get_total_expenses(entity_model, start_date, end_date)
    
    return {
        'chi_phi_san_xuat': {
            'nguyen_lieu': get_expense_percentage('621', total_expenses),
            'nhan_cong': get_expense_percentage('622', total_expenses),
            'san_xuat_chung': get_expense_percentage('627', total_expenses)
        },
        'chi_phi_ban_hang': {
            'nhan_vien': get_expense_percentage('6411', total_expenses),
            'vat_lieu': get_expense_percentage('6412', total_expenses),
            'dich_vu_mua_ngoai': get_expense_percentage('6417', total_expenses)
        },
        'chi_phi_quan_ly': {
            'nhan_vien': get_expense_percentage('6421', total_expenses),
            'khau_hao': get_expense_percentage('6424', total_expenses),
            'dich_vu': get_expense_percentage('6427', total_expenses)
        }
    }
```

## 4. Xuất Báo Cáo

### 4.1. Xuất Excel
```python
def xuat_bao_cao_excel(entity_model, report_type, start_date, end_date):
    """
    Xuất báo cáo ra file Excel
    """
    import pandas as pd
    
    if report_type == 'balance_sheet':
        data = xuat_bang_can_doi_ke_toan(entity_model, end_date)
    elif report_type == 'income_statement':
        data = xuat_bao_cao_kqkd(entity_model, start_date, end_date)
    elif report_type == 'cash_flow':
        data = xuat_bao_cao_lctt(entity_model, start_date, end_date)
        
    df = pd.DataFrame(data)
    return df.to_excel()

# API Endpoint
"""
GET /api/entity/{entity_slug}/reports/excel/
Parameters:
- report_type: string
- from_date: YYYY-MM-DD
- to_date: YYYY-MM-DD
"""
```

### 4.2. Xuất PDF
```python
def xuat_bao_cao_pdf(entity_model, report_type, template_name, context):
    """
    Xuất báo cáo ra file PDF sử dụng template
    """
    from django.template.loader import render_to_string
    from weasyprint import HTML
    
    # Render template
    html_string = render_to_string(template_name, context)
    
    # Tạo PDF
    html = HTML(string=html_string)
    pdf = html.write_pdf()
    
    return pdf

# API Endpoint
"""
GET /api/entity/{entity_slug}/reports/pdf/
Parameters:
- report_type: string
- from_date: YYYY-MM-DD
- to_date: YYYY-MM-DD
"""
```

## 5. Hệ Thống Cảnh Báo

### 5.1. Cảnh Báo Thuế
```python
def canh_bao_thue(entity_model):
    """
    Kiểm tra và cảnh báo các vấn đề về thuế
    """
    warnings = []
    
    # Kiểm tra thuế GTGT
    vat_balance = get_vat_balance(entity_model)
    if vat_balance > 0:
        warnings.append({
            'type': 'VAT_DUE',
            'message': f'Có {vat_balance:,.2f} VND thuế GTGT cần nộp',
            'deadline': get_vat_deadline()
        })
    
    # Kiểm tra thuế TNDN
    cit_balance = get_cit_balance(entity_model)
    if cit_balance > 0:
        warnings.append({
            'type': 'CIT_DUE',
            'message': f'Có {cit_balance:,.2f} VND thuế TNDN cần nộp',
            'deadline': get_cit_deadline()
        })
    
    return warnings
```

### 5.2. Cảnh Báo Tài Chính
```python
def canh_bao_tai_chinh(entity_model):
    """
    Kiểm tra và cảnh báo các vấn đề về tài chính
    """
    warnings = []
    
    # Kiểm tra tỷ lệ thanh toán
    current_ratio = calculate_current_ratio(entity_model)
    if current_ratio < 1:
        warnings.append({
            'type': 'LOW_LIQUIDITY',
            'message': 'Tỷ lệ thanh toán thấp',
            'value': current_ratio
        })
    
    # Kiểm tra công nợ quá hạn
    overdue_receivables = get_overdue_receivables(entity_model)
    if overdue_receivables:
        warnings.append({
            'type': 'OVERDUE_RECEIVABLES',
            'message': 'Có công nợ quá hạn cần thu hồi',
            'items': overdue_receivables
        })
    
    return warnings
