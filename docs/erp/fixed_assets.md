# Hướng Dẫn Quản Lý Tài Sản Cố Định và Khấu Hao

## 1. Quản Lý Tài Sản Cố Định

### 1.1. Ghi Nhận TSCĐ
```python
def ghi_nhan_tscd(entity_model, asset_data):
    """
    Ghi nhận tài sản cố định mới
    """
    # Kiểm tra điều kiện ghi nhận TSCĐ
    if asset_data['gia_tri'] < Decimal('30000000'):  # 30 triệu VND
        raise ValidationError('Giá trị không đủ điều kiện ghi nhận TSCĐ')
        
    if asset_data['thoi_gian_su_dung'] < 12:  # 12 tháng
        raise ValidationError('Thời gian sử dụng không đủ điều kiện ghi nhận TSCĐ')
    
    # Tạo tài sản cố định
    asset = FixedAssetModel.objects.create(
        entity=entity_model,
        code=generate_asset_code(asset_data['loai_tai_san']),
        name=asset_data['ten'],
        category=asset_data['loai_tai_san'],
        purchase_date=asset_data['ngay_mua'],
        in_use_date=asset_data['ngay_su_dung'],
        original_value=asset_data['gia_tri'],
        useful_life=asset_data['thoi_gian_su_dung'],
        depreciation_method=asset_data['phuong_phap_khau_hao'],
        department=asset_data['bo_phan_su_dung'],
        description=asset_data.get('mo_ta', '')
    )
    
    # Tạo bút toán ghi nhận TSCĐ
    if asset_data['nguon_hinh_thanh'] == 'mua_sam':
        create_purchase_entry(asset)
    elif asset_data['nguon_hinh_thanh'] == 'xay_dung':
        create_construction_entry(asset)
    elif asset_data['nguon_hinh_thanh'] == 'duoc_tang':
        create_donation_entry(asset)
    
    return asset
```

### 1.2. Tính Khấu Hao
```python
def tinh_khau_hao_thang(entity_model, asset, period):
    """
    Tính khấu hao TSCĐ theo tháng
    """
    # Kiểm tra điều kiện tính khấu hao
    if asset.status != 'in_use':
        return None
        
    if asset.depreciation_method == 'straight_line':
        # Phương pháp đường thẳng
        khau_hao = asset.original_value / (asset.useful_life * 12)
    elif asset.depreciation_method == 'declining_balance':
        # Phương pháp số dư giảm dần
        ty_le = Decimal('2') / (asset.useful_life * 12)  # Tỷ lệ khấu hao nhân đôi
        gia_tri_con_lai = get_remaining_value(asset, period['from_date'])
        khau_hao = gia_tri_con_lai * ty_le
    elif asset.depreciation_method == 'sum_of_years':
        # Phương pháp tổng số năm
        remaining_months = get_remaining_months(asset, period['from_date'])
        total_months = asset.useful_life * 12
        khau_hao = (
            asset.original_value * 
            (remaining_months * 2) /
            (total_months * (total_months + 1))
        )
    
    # Tạo bản ghi khấu hao
    depreciation = DepreciationModel.objects.create(
        entity=entity_model,
        asset=asset,
        period=period,
        amount=khau_hao,
        accumulated=get_accumulated_depreciation(asset, period['to_date']) + khau_hao,
        remaining_value=get_remaining_value(asset, period['to_date']) - khau_hao
    )
    
    # Tạo bút toán khấu hao
    create_depreciation_entry(depreciation)
    
    return depreciation
```

### 1.3. Điều Chỉnh TSCĐ
```python
def dieu_chinh_tscd(entity_model, asset, adjustment_data):
    """
    Điều chỉnh thông tin TSCĐ
    """
    # Lưu thông tin điều chỉnh
    adjustment = AssetAdjustmentModel.objects.create(
        entity=entity_model,
        asset=asset,
        adjustment_type=adjustment_data['loai_dieu_chinh'],
        adjustment_date=adjustment_data['ngay_dieu_chinh'],
        original_value=asset.original_value,
        new_value=adjustment_data.get('gia_tri_moi'),
        original_life=asset.useful_life,
        new_life=adjustment_data.get('thoi_gian_moi'),
        reason=adjustment_data['ly_do']
    )
    
    # Cập nhật thông tin TSCĐ
    if adjustment.adjustment_type == 'increase_value':
        # Tăng nguyên giá
        asset.original_value = adjustment.new_value
    elif adjustment.adjustment_type == 'decrease_value':
        # Giảm nguyên giá
        asset.original_value = adjustment.new_value
    elif adjustment.adjustment_type == 'extend_life':
        # Tăng thời gian sử dụng
        asset.useful_life = adjustment.new_life
    
    asset.save()
    
    # Tạo bút toán điều chỉnh
    create_adjustment_entry(adjustment)
    
    return adjustment
```

### 1.4. Thanh Lý TSCĐ
```python
def thanh_ly_tscd(entity_model, asset, disposal_data):
    """
    Thanh lý TSCĐ
    """
    # Tính khấu hao đến ngày thanh lý
    tinh_khau_hao_den_ngay(
        entity_model,
        asset,
        disposal_data['ngay_thanh_ly']
    )
    
    # Lưu thông tin thanh lý
    disposal = AssetDisposalModel.objects.create(
        entity=entity_model,
        asset=asset,
        disposal_date=disposal_data['ngay_thanh_ly'],
        disposal_method=disposal_data['hinh_thuc_thanh_ly'],
        disposal_value=disposal_data['gia_tri_thanh_ly'],
        reason=disposal_data['ly_do']
    )
    
    # Cập nhật trạng thái TSCĐ
    asset.status = 'disposed'
    asset.disposal_date = disposal_data['ngay_thanh_ly']
    asset.save()
    
    # Tạo bút toán thanh lý
    create_disposal_entry(disposal)
    
    return disposal
```

## 2. Sổ Theo Dõi TSCĐ

### 2.1. Thẻ TSCĐ
```python
def in_the_tscd(entity_model, asset):
    """
    In thẻ TSCĐ theo mẫu
    """
    # Lấy thông tin cơ bản
    asset_info = {
        'ma_tai_san': asset.code,
        'ten_tai_san': asset.name,
        'loai_tai_san': asset.category,
        'bo_phan_su_dung': asset.department,
        'ngay_ghi_tang': asset.in_use_date,
        'nguyen_gia': asset.original_value,
        'thoi_gian_su_dung': asset.useful_life,
        'gia_tri_con_lai': get_remaining_value(asset)
    }
    
    # Lấy lịch sử khấu hao
    depreciation_history = DepreciationModel.objects.filter(
        entity=entity_model,
        asset=asset
    ).order_by('period__from_date')
    
    # Lấy lịch sử điều chỉnh
    adjustment_history = AssetAdjustmentModel.objects.filter(
        entity=entity_model,
        asset=asset
    ).order_by('adjustment_date')
    
    # Lấy thông tin sửa chữa, bảo trì
    maintenance_history = MaintenanceModel.objects.filter(
        entity=entity_model,
        asset=asset
    ).order_by('date')
    
    return {
        'thong_tin_co_ban': asset_info,
        'lich_su_khau_hao': [
            {
                'ky': d.period,
                'khau_hao': d.amount,
                'luy_ke': d.accumulated,
                'gia_tri_con_lai': d.remaining_value
            }
            for d in depreciation_history
        ],
        'lich_su_dieu_chinh': [
            {
                'ngay': a.adjustment_date,
                'loai': a.adjustment_type,
                'gia_tri_cu': a.original_value,
                'gia_tri_moi': a.new_value,
                'ly_do': a.reason
            }
            for a in adjustment_history
        ],
        'lich_su_bao_tri': [
            {
                'ngay': m.date,
                'noi_dung': m.description,
                'chi_phi': m.cost
            }
            for m in maintenance_history
        ]
    }
```

### 2.2. Sổ TSCĐ
```python
def in_so_tscd(entity_model, period):
    """
    In sổ TSCĐ theo kỳ
    """
    assets = FixedAssetModel.objects.filter(
        entity=entity_model,
        in_use_date__lte=period['to_date']
    ).exclude(
        disposal_date__lt=period['from_date']
    )
    
    entries = []
    totals = {
        'nguyen_gia': Decimal('0'),
        'khau_hao': Decimal('0'),
        'gia_tri_con_lai': Decimal('0')
    }
    
    for asset in assets:
        # Tính khấu hao trong kỳ
        khau_hao = DepreciationModel.objects.filter(
            entity=entity_model,
            asset=asset,
            period__from_date__range=[
                period['from_date'],
                period['to_date']
            ]
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Tính giá trị còn lại
        gia_tri_con_lai = get_remaining_value(
            asset,
            period['to_date']
        )
        
        entries.append({
            'ma_tai_san': asset.code,
            'ten_tai_san': asset.name,
            'ngay_ghi_tang': asset.in_use_date,
            'nguyen_gia': asset.original_value,
            'khau_hao_ky': khau_hao,
            'khau_hao_luy_ke': asset.original_value - gia_tri_con_lai,
            'gia_tri_con_lai': gia_tri_con_lai
        })
        
        # Cập nhật tổng
        totals['nguyen_gia'] += asset.original_value
        totals['khau_hao'] += khau_hao
        totals['gia_tri_con_lai'] += gia_tri_con_lai
    
    return {
        'ky_bao_cao': period,
        'chi_tiet': entries,
        'tong_cong': totals
    }
```

### 2.3. Báo Cáo Tăng Giảm TSCĐ
```python
def bao_cao_tang_giam_tscd(entity_model, period):
    """
    Báo cáo tăng giảm TSCĐ theo kỳ
    """
    # Số đầu kỳ
    so_dau_ky = {
        'so_luong': FixedAssetModel.objects.filter(
            entity=entity_model,
            in_use_date__lt=period['from_date']
        ).exclude(
            disposal_date__lt=period['from_date']
        ).count(),
        'nguyen_gia': get_total_original_value(
            entity_model,
            period['from_date']
        ),
        'gia_tri_con_lai': get_total_remaining_value(
            entity_model,
            period['from_date']
        )
    }
    
    # Tăng trong kỳ
    tang_trong_ky = {
        'so_luong': FixedAssetModel.objects.filter(
            entity=entity_model,
            in_use_date__range=[
                period['from_date'],
                period['to_date']
            ]
        ).count(),
        'nguyen_gia': get_total_increase_value(
            entity_model,
            period['from_date'],
            period['to_date']
        )
    }
    
    # Giảm trong kỳ
    giam_trong_ky = {
        'so_luong': FixedAssetModel.objects.filter(
            entity=entity_model,
            disposal_date__range=[
                period['from_date'],
                period['to_date']
            ]
        ).count(),
        'nguyen_gia': get_total_decrease_value(
            entity_model,
            period['from_date'],
            period['to_date']
        )
    }
    
    # Số cuối kỳ
    so_cuoi_ky = {
        'so_luong': so_dau_ky['so_luong'] + 
                    tang_trong_ky['so_luong'] - 
                    giam_trong_ky['so_luong'],
        'nguyen_gia': so_dau_ky['nguyen_gia'] + 
                      tang_trong_ky['nguyen_gia'] - 
                      giam_trong_ky['nguyen_gia'],
        'gia_tri_con_lai': get_total_remaining_value(
            entity_model,
            period['to_date']
        )
    }
    
    return {
        'so_dau_ky': so_dau_ky,
        'tang_trong_ky': tang_trong_ky,
        'giam_trong_ky': giam_trong_ky,
        'so_cuoi_ky': so_cuoi_ky
    }
```

## 3. Bút Toán Kế Toán

### 3.1. Bút Toán Ghi Nhận
```python
def create_purchase_entry(asset):
    """
    Tạo bút toán ghi nhận TSCĐ mua sắm mới
    """
    je = JournalEntryModel.objects.create(
        entity=asset.entity,
        date=asset.in_use_date,
        description=f'Ghi nhận TSCĐ {asset.name}'
    )
    
    # Ghi nợ TK 211 - TSCĐ hữu hình
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='211',
        tx_type='debit',
        amount=asset.original_value
    )
    
    # Ghi có TK 331 - Phải trả người bán (nếu chưa trả tiền)
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='331',
        tx_type='credit',
        amount=asset.original_value
    )
```

### 3.2. Bút Toán Khấu Hao
```python
def create_depreciation_entry(depreciation):
    """
    Tạo bút toán trích khấu hao TSCĐ
    """
    je = JournalEntryModel.objects.create(
        entity=depreciation.entity,
        date=depreciation.period.to_date,
        description=f'Trích khấu hao TSCĐ {depreciation.asset.name}'
    )
    
    # Ghi nợ TK 642 - Chi phí QLDN
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='642',
        tx_type='debit',
        amount=depreciation.amount
    )
    
    # Ghi có TK 214 - Hao mòn TSCĐ
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='214',
        tx_type='credit',
        amount=depreciation.amount
    )
```

### 3.3. Bút Toán Thanh Lý
```python
def create_disposal_entry(disposal):
    """
    Tạo bút toán thanh lý TSCĐ
    """
    je = JournalEntryModel.objects.create(
        entity=disposal.entity,
        date=disposal.disposal_date,
        description=f'Thanh lý TSCĐ {disposal.asset.name}'
    )
    
    # 1. Ghi giảm nguyên giá
    # Ghi nợ TK 214 - Hao mòn TSCĐ
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='214',
        tx_type='debit',
        amount=get_accumulated_depreciation(disposal.asset)
    )
    
    # Ghi nợ TK 811 - Chi phí khác (phần còn lại)
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='811',
        tx_type='debit',
        amount=get_remaining_value(disposal.asset)
    )
    
    # Ghi có TK 211 - TSCĐ
    TransactionModel.objects.create(
        journal_entry=je,
        account_id='211',
        tx_type='credit',
        amount=disposal.asset.original_value
    )
    
    # 2. Ghi nhận thu nhập thanh lý (nếu có)
    if disposal.disposal_value > 0:
        # Ghi nợ TK 111/112/131
        TransactionModel.objects.create(
            journal_entry=je,
            account_id='111',
            tx_type='debit',
            amount=disposal.disposal_value
        )
        
        # Ghi có TK 711 - Thu nhập khác
        TransactionModel.objects.create(
            journal_entry=je,
            account_id='711',
            tx_type='credit',
            amount=disposal.disposal_value
        )
