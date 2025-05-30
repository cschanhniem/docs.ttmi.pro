# Hướng Dẫn Quản Lý Tiền Lương và Bảo Hiểm Xã Hội

## 1. Thiết Lập Cấu Hình Lương

### 1.1. Cấu Hình Bảo Hiểm
```python
def cau_hinh_bao_hiem(entity_model, year):
    """
    Cấu hình các khoản bảo hiểm theo năm
    """
    # Thiết lập mức lương cơ sở
    luong_co_so = Decimal('1800000')  # VND, 2024
    
    # Thiết lập tỷ lệ đóng BHXH
    ty_le_bhxh = {
        'company': Decimal('0.175'),  # Công ty đóng 17.5%
        'employee': Decimal('0.08')   # Người lao động đóng 8%
    }
    
    # Thiết lập tỷ lệ đóng BHYT
    ty_le_bhyt = {
        'company': Decimal('0.03'),   # Công ty đóng 3%
        'employee': Decimal('0.015')  # Người lao động đóng 1.5%
    }
    
    # Thiết lập tỷ lệ đóng BHTN
    ty_le_bhtn = {
        'company': Decimal('0.01'),   # Công ty đóng 1%
        'employee': Decimal('0.01')   # Người lao động đóng 1%
    }
    
    InsuranceConfigModel.objects.create(
        entity=entity_model,
        year=year,
        base_salary=luong_co_so,
        si_company_rate=ty_le_bhxh['company'],
        si_employee_rate=ty_le_bhxh['employee'],
        hi_company_rate=ty_le_bhyt['company'],
        hi_employee_rate=ty_le_bhyt['employee'],
        ui_company_rate=ty_le_bhtn['company'],
        ui_employee_rate=ty_le_bhtn['employee']
    )
```

### 1.2. Cấu Hình Thuế TNCN
```python
def cau_hinh_thue_tncn(entity_model, year):
    """
    Cấu hình thuế thu nhập cá nhân
    """
    # Thiết lập các mức giảm trừ
    giam_tru = {
        'ban_than': Decimal('11000000'),  # Giảm trừ bản thân
        'phu_thuoc': Decimal('4400000')   # Giảm trừ người phụ thuộc
    }
    
    # Thiết lập biểu thuế lũy tiến
    bac_thue = [
        {
            'tu': Decimal('0'),
            'den': Decimal('5000000'),
            'ty_le': Decimal('0.05')
        },
        {
            'tu': Decimal('5000000'),
            'den': Decimal('10000000'),
            'ty_le': Decimal('0.1')
        },
        {
            'tu': Decimal('10000000'),
            'den': Decimal('18000000'),
            'ty_le': Decimal('0.15')
        },
        {
            'tu': Decimal('18000000'),
            'den': Decimal('32000000'),
            'ty_le': Decimal('0.2')
        },
        {
            'tu': Decimal('32000000'),
            'den': Decimal('52000000'),
            'ty_le': Decimal('0.25')
        },
        {
            'tu': Decimal('52000000'),
            'den': Decimal('80000000'),
            'ty_le': Decimal('0.3')
        },
        {
            'tu': Decimal('80000000'),
            'den': None,
            'ty_le': Decimal('0.35')
        }
    ]
    
    TaxConfigModel.objects.create(
        entity=entity_model,
        year=year,
        personal_deduction=giam_tru['ban_than'],
        dependent_deduction=giam_tru['phu_thuoc'],
        tax_brackets=bac_thue
    )
```

## 2. Tính Lương

### 2.1. Tính Lương Cơ Bản
```python
def tinh_luong_co_ban(entity_model, employee, period):
    """
    Tính lương cơ bản theo công thức:
    Lương = Lương cơ bản * Hệ số * Ngày công thực tế / Ngày công chuẩn
    """
    # Lấy thông tin lương
    salary_info = SalaryInfoModel.objects.get(
        entity=entity_model,
        employee=employee
    )
    
    # Lấy ngày công
    timesheet = TimesheetModel.objects.get(
        entity=entity_model,
        employee=employee,
        period=period
    )
    
    # Tính lương
    luong = (
        salary_info.base_salary *
        salary_info.coefficient *
        timesheet.actual_days /
        timesheet.standard_days
    )
    
    return {
        'base_salary': salary_info.base_salary,
        'coefficient': salary_info.coefficient,
        'actual_days': timesheet.actual_days,
        'standard_days': timesheet.standard_days,
        'salary': luong
    }
```

### 2.2. Tính Phụ Cấp
```python
def tinh_phu_cap(entity_model, employee, period):
    """
    Tính các khoản phụ cấp
    """
    allowances = AllowanceModel.objects.filter(
        entity=entity_model,
        employee=employee,
        period=period
    )
    
    # Tính từng loại phụ cấp
    total = Decimal('0')
    details = []
    
    for allowance in allowances:
        if allowance.type == 'responsibility':
            # Phụ cấp trách nhiệm
            amount = allowance.base_amount * allowance.coefficient
        elif allowance.type == 'position':
            # Phụ cấp chức vụ
            amount = allowance.base_amount
        elif allowance.type == 'toxic':
            # Phụ cấp độc hại
            amount = allowance.base_amount * allowance.worked_days
        else:
            amount = allowance.amount
            
        details.append({
            'type': allowance.type,
            'amount': amount
        })
        total += amount
    
    return {
        'details': details,
        'total': total
    }
```

### 2.3. Tính Bảo Hiểm
```python
def tinh_bao_hiem(entity_model, employee, salary):
    """
    Tính các khoản bảo hiểm phải đóng
    """
    # Lấy cấu hình bảo hiểm
    config = InsuranceConfigModel.objects.get(
        entity=entity_model,
        year=salary.period.year
    )
    
    # Tính mức đóng bảo hiểm
    salary_for_insurance = min(
        salary.total_salary,
        config.base_salary * 20  # Mức trần = 20 lần lương cơ sở
    )
    
    # BHXH
    bhxh = {
        'company': salary_for_insurance * config.si_company_rate,
        'employee': salary_for_insurance * config.si_employee_rate
    }
    
    # BHYT
    bhyt = {
        'company': salary_for_insurance * config.hi_company_rate,
        'employee': salary_for_insurance * config.hi_employee_rate
    }
    
    # BHTN
    bhtn = {
        'company': salary_for_insurance * config.ui_company_rate,
        'employee': salary_for_insurance * config.ui_employee_rate
    }
    
    return {
        'salary_for_insurance': salary_for_insurance,
        'social_insurance': bhxh,
        'health_insurance': bhyt,
        'unemployment_insurance': bhtn,
        'total_company': (
            bhxh['company'] + bhyt['company'] + bhtn['company']
        ),
        'total_employee': (
            bhxh['employee'] + bhyt['employee'] + bhtn['employee']
        )
    }
```

### 2.4. Tính Thuế TNCN
```python
def tinh_thue_tncn(entity_model, employee, salary, insurance):
    """
    Tính thuế thu nhập cá nhân
    """
    # Lấy cấu hình thuế
    config = TaxConfigModel.objects.get(
        entity=entity_model,
        year=salary.period.year
    )
    
    # Tính thu nhập tính thuế
    thu_nhap = salary.total_salary
    
    # Trừ các khoản giảm trừ
    giam_tru = Decimal('0')
    
    # 1. Giảm trừ bản thân
    giam_tru += config.personal_deduction
    
    # 2. Giảm trừ người phụ thuộc
    so_nguoi_phu_thuoc = DependentModel.objects.filter(
        employee=employee,
        status='active'
    ).count()
    giam_tru += config.dependent_deduction * so_nguoi_phu_thuoc
    
    # 3. Bảo hiểm bắt buộc
    giam_tru += insurance['total_employee']
    
    # Tính thu nhập tính thuế
    thu_nhap_tinh_thue = max(thu_nhap - giam_tru, 0)
    
    # Áp dụng biểu thuế lũy tiến
    thue = Decimal('0')
    thu_nhap_con_lai = thu_nhap_tinh_thue
    
    for bac in config.tax_brackets:
        if thu_nhap_con_lai <= 0:
            break
            
        if bac['den'] is None:
            muc_chiu_thue = thu_nhap_con_lai
        else:
            muc_chiu_thue = min(
                thu_nhap_con_lai,
                bac['den'] - bac['tu']
            )
            
        thue += muc_chiu_thue * bac['ty_le']
        thu_nhap_con_lai -= muc_chiu_thue
    
    return {
        'total_income': thu_nhap,
        'deductions': giam_tru,
        'taxable_income': thu_nhap_tinh_thue,
        'tax_amount': thue
    }
```

## 3. Quy Trình Tính Lương

### 3.1. Chốt Công
```python
def chot_cong(entity_model, period):
    """
    Chốt bảng chấm công tháng
    """
    employees = EmployeeModel.objects.filter(
        entity=entity_model,
        status='active'
    )
    
    for employee in employees:
        # Lấy dữ liệu chấm công
        attendances = AttendanceModel.objects.filter(
            entity=entity_model,
            employee=employee,
            date__range=period.date_range
        )
        
        # Tổng hợp ngày công
        total_days = Decimal('0')
        details = []
        
        for att in attendances:
            if att.type == 'full':
                days = Decimal('1')
            elif att.type == 'half':
                days = Decimal('0.5')
            elif att.type == 'overtime':
                days = att.hours / 8  # 8 giờ = 1 ngày công
            else:
                days = Decimal('0')
                
            details.append({
                'date': att.date,
                'type': att.type,
                'days': days
            })
            total_days += days
        
        # Lưu bảng công
        TimesheetModel.objects.create(
            entity=entity_model,
            employee=employee,
            period=period,
            actual_days=total_days,
            standard_days=period.working_days,
            details=details
        )
```

### 3.2. Tính Lương Tháng
```python
def tinh_luong_thang(entity_model, period):
    """
    Tính lương tháng cho toàn bộ nhân viên
    """
    employees = EmployeeModel.objects.filter(
        entity=entity_model,
        status='active'
    )
    
    payrolls = []
    for employee in employees:
        # 1. Tính lương cơ bản
        luong_co_ban = tinh_luong_co_ban(
            entity_model,
            employee,
            period
        )
        
        # 2. Tính phụ cấp
        phu_cap = tinh_phu_cap(
            entity_model,
            employee,
            period
        )
        
        # 3. Tổng thu nhập
        tong_thu_nhap = luong_co_ban['salary'] + phu_cap['total']
        
        # 4. Tính bảo hiểm
        bao_hiem = tinh_bao_hiem(
            entity_model,
            employee,
            tong_thu_nhap
        )
        
        # 5. Tính thuế TNCN
        thue = tinh_thue_tncn(
            entity_model,
            employee,
            tong_thu_nhap,
            bao_hiem
        )
        
        # 6. Tính lương thực nhận
        thuc_nhan = (
            tong_thu_nhap -
            bao_hiem['total_employee'] -
            thue['tax_amount']
        )
        
        # Lưu bảng lương
        payroll = PayrollModel.objects.create(
            entity=entity_model,
            employee=employee,
            period=period,
            base_salary=luong_co_ban['salary'],
            allowances=phu_cap['total'],
            total_income=tong_thu_nhap,
            social_insurance=bao_hiem['social_insurance']['employee'],
            health_insurance=bao_hiem['health_insurance']['employee'],
            unemployment_insurance=bao_hiem['unemployment_insurance']['employee'],
            tax_amount=thue['tax_amount'],
            net_salary=thuc_nhan
        )
        
        payrolls.append(payroll)
    
    return payrolls
```

### 3.3. Phê Duyệt Lương
```python
def phe_duyet_luong(entity_model, period, approver):
    """
    Phê duyệt bảng lương tháng
    """
    payrolls = PayrollModel.objects.filter(
        entity=entity_model,
        period=period
    )
    
    # Kiểm tra thẩm quyền
    if not has_payroll_approval_authority(approver):
        raise ValidationError('Không có quyền phê duyệt lương')
    
    # Tạo bản ghi phê duyệt
    approval = PayrollApprovalModel.objects.create(
        entity=entity_model,
        period=period,
        approver=approver,
        total_amount=sum(p.net_salary for p in payrolls)
    )
    
    # Cập nhật trạng thái bảng lương
    payrolls.update(
        status='approved',
        approved_by=approver,
        approved_at=timezone.now()
    )
    
    return approval
```

## 4. Báo Cáo Lương

### 4.1. Bảng Lương Chi Tiết
```python
def bao_cao_luong_chi_tiet(entity_model, period):
    """
    Xuất bảng lương chi tiết theo tháng
    """
    payrolls = PayrollModel.objects.filter(
        entity=entity_model,
        period=period
    ).select_related('employee')
    
    report = []
    totals = {
        'base_salary': Decimal('0'),
        'allowances': Decimal('0'),
        'total_income': Decimal('0'),
        'insurances': Decimal('0'),
        'tax': Decimal('0'),
        'net_salary': Decimal('0')
    }
    
    for payroll in payrolls:
        row = {
            'employee': {
                'code': payroll.employee.code,
                'name': payroll.employee.name,
                'department': payroll.employee.department.name
            },
            'salary': {
                'base': payroll.base_salary,
                'allowances': payroll.allowances,
                'total': payroll.total_income
            },
            'deductions': {
                'social_insurance': payroll.social_insurance,
                'health_insurance': payroll.health_insurance,
                'unemployment_insurance': payroll.unemployment_insurance,
                'tax': payroll.tax_amount
            },
            'net_salary': payroll.net_salary
        }
        
        report.append(row)
        
        # Cập nhật tổng
        totals['base_salary'] += payroll.base_salary
        totals['allowances'] += payroll.allowances
        totals['total_income'] += payroll.total_income
        totals['insurances'] += (
            payroll.social_insurance +
            payroll.health_insurance +
            payroll.unemployment_insurance
        )
        totals['tax'] += payroll.tax_amount
        totals['net_salary'] += payroll.net_salary
    
    return {
        'details': report,
        'totals': totals
    }
```

### 4.2. Báo Cáo Thuế TNCN
```python
def bao_cao_thue_tncn(entity_model, period):
    """
    Xuất báo cáo thuế TNCN theo mẫu 05-BK-TNCN
    """
    payrolls = PayrollModel.objects.filter(
        entity=entity_model,
        period=period
    ).select_related('employee')
    
    report = []
    for payroll in payrolls:
        # Lấy thông tin giảm trừ
        giam_tru = get_tax_deductions(
            entity_model,
            payroll.employee,
            period
        )
        
        row = {
            'stt': len(report) + 1,
            'ma_so_thue': payroll.employee.tax_code,
            'ho_ten': payroll.employee.name,
            'thu_nhap': payroll.total_income,
            'giam_tru': {
                'bhbb': giam_tru['insurance'],
                'ban_than': giam_tru['personal'],
                'phu_thuoc': giam_tru['dependent'],
                'tong': sum(giam_tru.values())
            },
            'thu_nhap_tinh_thue': payroll.total_income - sum(giam_tru.values()),
            'thue_da_khau_tru': payroll.tax_amount
        }
        
        report.append(row)
    
    return report
```

### 4.3. Báo Cáo Bảo Hiểm
```python
def bao_cao_bao_hiem(entity_model, period):
    """
    Xuất báo cáo đóng BHXH, BHYT, BHTN
    """
    payrolls = PayrollModel.objects.filter(
        entity=entity_model,
        period=period
    ).select_related('employee')
    
    report = []
    total_company = Decimal('0')
    total_employee = Decimal('0')
    
    for payroll in payrolls:
        insurance = get_insurance_details(
            entity_model,
            payroll.employee,
            period
        )
        
        row = {
            'employee': {
                'code': payroll.employee.code,
                'name': payroll.employee.name,
                'social_insurance_code': payroll.employee.si_code
            },
            'salary_for_insurance': insurance['salary_for_insurance'],
            'social_insurance': {
                'company': insurance['social_insurance']['company'],
                'employee': insurance['social_insurance']['employee']
            },
            'health_insurance': {
                'company': insurance['health_insurance']['company'],
                'employee': insurance['health_insurance']['employee']
            },
            'unemployment_insurance': {
                'company': insurance['unemployment_insurance']['company'],
                'employee': insurance['unemployment_insurance']['employee']
            }
        }
        
        report.append(row)
        
        # Cập nhật tổng
        total_company += insurance['total_company']
        total_employee += insurance['total_employee']
    
    return {
        'details': report,
        'summary': {
            'total_company': total_company,
            'total_employee': total_employee,
            'total': total_company + total_employee
        }
    }
