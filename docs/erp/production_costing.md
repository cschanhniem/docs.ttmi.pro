# Hướng Dẫn Tính Giá Thành Sản Xuất

## 1. Thiết Lập Định Mức

### 1.1. Định Mức Nguyên Vật Liệu
```python
def thiet_lap_dinh_muc_nvl(entity_model, product, materials):
    """
    Thiết lập định mức nguyên vật liệu cho sản phẩm
    """
    # Tạo định mức gốc
    bom = BillOfMaterialModel.objects.create(
        entity=entity_model,
        product=product,
        effective_date=timezone.now()
    )
    
    # Thêm chi tiết nguyên vật liệu
    for material in materials:
        BOMLineModel.objects.create(
            bom=bom,
            material=material['material'],
            quantity=material['quantity'],
            unit=material['unit'],
            waste_rate=material.get('waste_rate', 0)
        )
    
    return bom

def cap_nhat_dinh_muc_nvl(bom, changes):
    """
    Cập nhật định mức nguyên vật liệu
    """
    # Tạo phiên bản mới
    new_bom = BillOfMaterialModel.objects.create(
        entity=bom.entity,
        product=bom.product,
        version=bom.version + 1,
        effective_date=timezone.now()
    )
    
    # Copy các dòng không thay đổi
    for line in bom.lines.exclude(material_id__in=[c['material'].id for c in changes]):
        BOMLineModel.objects.create(
            bom=new_bom,
            material=line.material,
            quantity=line.quantity,
            unit=line.unit,
            waste_rate=line.waste_rate
        )
    
    # Thêm/cập nhật các dòng thay đổi
    for change in changes:
        BOMLineModel.objects.create(
            bom=new_bom,
            material=change['material'],
            quantity=change['quantity'],
            unit=change['unit'],
            waste_rate=change.get('waste_rate', 0)
        )
    
    return new_bom
```

### 1.2. Định Mức Nhân Công
```python
def thiet_lap_dinh_muc_nhan_cong(entity_model, product, operations):
    """
    Thiết lập định mức nhân công cho sản phẩm
    """
    # Tạo định mức gốc
    labor = LaborStandardModel.objects.create(
        entity=entity_model,
        product=product,
        effective_date=timezone.now()
    )
    
    # Thêm chi tiết công đoạn
    for op in operations:
        LaborLineModel.objects.create(
            labor_standard=labor,
            operation=op['operation'],
            workers=op['workers'],
            hours=op['hours'],
            skill_level=op['skill_level'],
            piece_rate=op.get('piece_rate')
        )
    
    return labor
```

### 1.3. Định Mức Chi Phí Chung
```python
def thiet_lap_dinh_muc_chi_phi_chung(entity_model, product, overheads):
    """
    Thiết lập định mức chi phí sản xuất chung
    """
    # Tạo định mức gốc
    overhead = OverheadStandardModel.objects.create(
        entity=entity_model,
        product=product,
        effective_date=timezone.now()
    )
    
    # Thêm chi tiết chi phí
    for oh in overheads:
        OverheadLineModel.objects.create(
            overhead_standard=overhead,
            cost_type=oh['cost_type'],
            allocation_base=oh['allocation_base'],
            rate=oh['rate'],
            fixed_amount=oh.get('fixed_amount')
        )
    
    return overhead
```

## 2. Tính Giá Thành Đơn Hàng

### 2.1. Chi Phí Nguyên Vật Liệu Trực Tiếp
```python
def tinh_chi_phi_nvl(entity_model, production_order):
    """
    Tính chi phí nguyên vật liệu trực tiếp cho đơn hàng sản xuất
    """
    # Lấy định mức hiện hành
    bom = BillOfMaterialModel.objects.filter(
        entity=entity_model,
        product=production_order.product,
        effective_date__lte=production_order.start_date
    ).latest('effective_date')
    
    costs = []
    total_cost = Decimal('0')
    
    for line in bom.lines.all():
        # Tính số lượng cần dùng (bao gồm hao hụt)
        quantity_needed = (
            line.quantity * 
            production_order.quantity *
            (1 + line.waste_rate)
        )
        
        # Tính giá xuất kho theo phương pháp đã chọn
        issue_cost = calculate_issue_cost(
            entity_model,
            line.material,
            quantity_needed,
            production_order.costing_method
        )
        
        costs.append({
            'material': line.material,
            'quantity': quantity_needed,
            'unit_cost': issue_cost['unit_cost'],
            'total_cost': issue_cost['total_cost']
        })
        
        total_cost += issue_cost['total_cost']
    
    return {
        'details': costs,
        'total_cost': total_cost
    }
```

### 2.2. Chi Phí Nhân Công Trực Tiếp
```python
def tinh_chi_phi_nhan_cong(entity_model, production_order):
    """
    Tính chi phí nhân công trực tiếp cho đơn hàng sản xuất
    """
    # Lấy định mức hiện hành
    labor = LaborStandardModel.objects.filter(
        entity=entity_model,
        product=production_order.product,
        effective_date__lte=production_order.start_date
    ).latest('effective_date')
    
    costs = []
    total_cost = Decimal('0')
    
    for line in labor.lines.all():
        if line.piece_rate:
            # Tính theo sản phẩm
            labor_cost = (
                line.piece_rate *
                production_order.quantity
            )
        else:
            # Tính theo giờ công
            labor_cost = (
                line.hours *
                production_order.quantity *
                line.workers *
                get_labor_rate(line.skill_level)
            )
            
        costs.append({
            'operation': line.operation,
            'workers': line.workers,
            'hours': line.hours * production_order.quantity,
            'cost': labor_cost
        })
        
        total_cost += labor_cost
    
    return {
        'details': costs,
        'total_cost': total_cost
    }
```

### 2.3. Chi Phí Sản Xuất Chung
```python
def tinh_chi_phi_chung(entity_model, production_order):
    """
    Tính chi phí sản xuất chung cho đơn hàng sản xuất
    """
    # Lấy định mức hiện hành
    overhead = OverheadStandardModel.objects.filter(
        entity=entity_model,
        product=production_order.product,
        effective_date__lte=production_order.start_date
    ).latest('effective_date')
    
    costs = []
    total_cost = Decimal('0')
    
    for line in overhead.lines.all():
        if line.fixed_amount:
            # Chi phí cố định
            overhead_cost = (
                line.fixed_amount *
                production_order.quantity /
                get_planned_production(entity_model, production_order.period)
            )
        else:
            # Chi phí biến đổi
            base_amount = get_allocation_base_amount(
                entity_model,
                line.allocation_base,
                production_order
            )
            overhead_cost = base_amount * line.rate
            
        costs.append({
            'cost_type': line.cost_type,
            'base_amount': base_amount if not line.fixed_amount else None,
            'rate': line.rate if not line.fixed_amount else None,
            'cost': overhead_cost
        })
        
        total_cost += overhead_cost
    
    return {
        'details': costs,
        'total_cost': total_cost
    }
```

## 3. Tính Giá Thành Thực Tế

### 3.1. Tổng Hợp Chi Phí Phát Sinh
```python
def tong_hop_chi_phi_phat_sinh(entity_model, production_order):
    """
    Tổng hợp chi phí thực tế phát sinh cho đơn hàng
    """
    # Chi phí NVL
    nvl_costs = MaterialIssueModel.objects.filter(
        entity=entity_model,
        production_order=production_order
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Chi phí nhân công
    nc_costs = LaborCostModel.objects.filter(
        entity=entity_model,
        production_order=production_order
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Chi phí sản xuất chung
    sxc_costs = OverheadCostModel.objects.filter(
        entity=entity_model,
        production_order=production_order
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    return {
        'nvl': nvl_costs,
        'nhan_cong': nc_costs,
        'san_xuat_chung': sxc_costs,
        'tong_cong': nvl_costs + nc_costs + sxc_costs
    }
```

### 3.2. Phân Bổ Chi Phí Chung
```python
def phan_bo_chi_phi_chung(entity_model, period):
    """
    Phân bổ chi phí sản xuất chung cho các đơn hàng
    """
    # Lấy tất cả đơn hàng trong kỳ
    orders = ProductionOrderModel.objects.filter(
        entity=entity_model,
        period=period
    )
    
    # Lấy tổng chi phí chung phát sinh
    total_overhead = OverheadCostModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Tính tổng số lượng sản xuất
    total_quantity = sum(order.quantity for order in orders)
    
    allocations = []
    for order in orders:
        # Phân bổ theo sản lượng
        allocated = (
            total_overhead *
            order.quantity /
            total_quantity
        )
        
        allocations.append({
            'order': order,
            'amount': allocated
        })
        
        # Ghi nhận chi phí được phân bổ
        OverheadAllocationModel.objects.create(
            entity=entity_model,
            production_order=order,
            period=period,
            amount=allocated
        )
    
    return allocations
```

### 3.3. Tính Giá Thành Đơn Vị
```python
def tinh_gia_thanh_don_vi(entity_model, production_order):
    """
    Tính giá thành đơn vị sản phẩm
    """
    # Lấy tổng chi phí
    costs = tong_hop_chi_phi_phat_sinh(entity_model, production_order)
    
    # Lấy sản lượng hoàn thành
    finished_quantity = get_finished_quantity(production_order)
    
    if finished_quantity > 0:
        unit_cost = costs['tong_cong'] / finished_quantity
    else:
        unit_cost = Decimal('0')
    
    return {
        'tong_chi_phi': costs['tong_cong'],
        'san_luong': finished_quantity,
        'gia_thanh_don_vi': unit_cost,
        'chi_tiet': {
            'nvl': costs['nvl'] / finished_quantity if finished_quantity > 0 else 0,
            'nhan_cong': costs['nhan_cong'] / finished_quantity if finished_quantity > 0 else 0,
            'san_xuat_chung': costs['san_xuat_chung'] / finished_quantity if finished_quantity > 0 else 0
        }
    }
```

## 4. Báo Cáo Giá Thành

### 4.1. Thẻ Tính Giá Thành
```python
def in_the_gia_thanh(entity_model, production_order):
    """
    In thẻ tính giá thành theo đơn hàng
    """
    # Thông tin cơ bản
    basic_info = {
        'ma_don_hang': production_order.code,
        'san_pham': production_order.product.name,
        'so_luong': production_order.quantity,
        'ngay_bat_dau': production_order.start_date,
        'ngay_ket_thuc': production_order.end_date
    }
    
    # Chi phí định mức
    dinh_muc = {
        'nvl': tinh_chi_phi_nvl(entity_model, production_order),
        'nhan_cong': tinh_chi_phi_nhan_cong(entity_model, production_order),
        'san_xuat_chung': tinh_chi_phi_chung(entity_model, production_order)
    }
    
    # Chi phí thực tế
    thuc_te = tong_hop_chi_phi_phat_sinh(entity_model, production_order)
    
    # Tính chênh lệch
    chenh_lech = {
        'nvl': thuc_te['nvl'] - dinh_muc['nvl']['total_cost'],
        'nhan_cong': thuc_te['nhan_cong'] - dinh_muc['nhan_cong']['total_cost'],
        'san_xuat_chung': thuc_te['san_xuat_chung'] - dinh_muc['san_xuat_chung']['total_cost']
    }
    
    return {
        'thong_tin': basic_info,
        'dinh_muc': dinh_muc,
        'thuc_te': thuc_te,
        'chenh_lech': chenh_lech
    }
```

### 4.2. Báo Cáo Tổng Hợp Giá Thành
```python
def bao_cao_tong_hop_gia_thanh(entity_model, period):
    """
    Báo cáo tổng hợp giá thành theo kỳ
    """
    orders = ProductionOrderModel.objects.filter(
        entity=entity_model,
        period=period
    )
    
    details = []
    totals = {
        'dinh_muc': Decimal('0'),
        'thuc_te': Decimal('0'),
        'chenh_lech': Decimal('0')
    }
    
    for order in orders:
        # Tính chi phí định mức
        dinh_muc = (
            tinh_chi_phi_nvl(entity_model, order)['total_cost'] +
            tinh_chi_phi_nhan_cong(entity_model, order)['total_cost'] +
            tinh_chi_phi_chung(entity_model, order)['total_cost']
        )
        
        # Tính chi phí thực tế
        thuc_te = tong_hop_chi_phi_phat_sinh(
            entity_model,
            order
        )['tong_cong']
        
        # Tính chênh lệch
        chenh_lech = thuc_te - dinh_muc
        
        details.append({
            'don_hang': order,
            'dinh_muc': dinh_muc,
            'thuc_te': thuc_te,
            'chenh_lech': chenh_lech
        })
        
        # Cập nhật tổng
        totals['dinh_muc'] += dinh_muc
        totals['thuc_te'] += thuc_te
        totals['chenh_lech'] += chenh_lech
    
    return {
        'chi_tiet': details,
        'tong_cong': totals
    }
```

### 4.3. Phân Tích Chi Phí
```python
def phan_tich_chi_phi(entity_model, period):
    """
    Phân tích cơ cấu chi phí sản xuất
    """
    # Lấy tổng chi phí thực tế
    costs = MaterialIssueModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(nvl=Sum('amount'))['nvl'] or 0
    
    costs += LaborCostModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(nc=Sum('amount'))['nc'] or 0
    
    costs += OverheadCostModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(sxc=Sum('amount'))['sxc'] or 0
    
    # Phân tích theo yếu tố
    chi_phi_nvl = MaterialIssueModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(
        total=Sum('amount'),
        quantity=Sum('quantity')
    )
    
    chi_phi_nc = LaborCostModel.objects.filter(
        entity=entity_model,
        period=period
    ).aggregate(
        total=Sum('amount'),
        hours=Sum('hours')
    )
    
    chi_phi_sxc = OverheadCostModel.objects.filter(
        entity=entity_model,
        period=period
    ).values('cost_type').annotate(
        total=Sum('amount')
    )
    
    return {
        'co_cau': {
            'nvl': chi_phi_nvl['total'] / costs if costs > 0 else 0,
            'nhan_cong': chi_phi_nc['total'] / costs if costs > 0 else 0,
            'san_xuat_chung': sum(c['total'] for c in chi_phi_sxc) / costs if costs > 0 else 0
        },
        'chi_tiet': {
            'nvl': {
                'tong_tien': chi_phi_nvl['total'],
                'so_luong': chi_phi_nvl['quantity'],
                'don_gia_binh_quan': (
                    chi_phi_nvl['total'] / chi_phi_nvl['quantity']
                    if chi_phi_nvl['quantity']
                    else 0
                )
            },
            'nhan_cong': {
                'tong_tien': chi_phi_nc['total'],
                'gio_cong': chi_phi_nc['hours'],
                'don_gia_binh_quan': (
                    chi_phi_nc['total'] / chi_phi_nc['hours']
                    if chi_phi_nc['hours']
                    else 0
                )
            },
            'san_xuat_chung': [
                {
                    'loai': cost['cost_type'],
                    'so_tien': cost['total']
                }
                for cost in chi_phi_sxc
            ]
        }
    }
