# Hướng Dẫn Quản Lý Hàng Tồn Kho và Tính Giá Thành

## 1. Quản Lý Kho Hàng

### 1.1. Nhập Kho
```python
def nhap_kho(entity_model, warehouse, receipt_data):
    """
    Tạo phiếu nhập kho
    """
    # Tạo phiếu nhập kho
    receipt = WarehouseReceiptModel.objects.create(
        entity=entity_model,
        warehouse=warehouse,
        receipt_type=receipt_data['type'],
        reference=receipt_data['reference'],
        description=receipt_data['description']
    )
    
    # Thêm chi tiết hàng hóa
    for item in receipt_data['items']:
        WarehouseReceiptLineModel.objects.create(
            receipt=receipt,
            item=item['item'],
            quantity=item['quantity'],
            unit_cost=item['unit_cost'],
            lot_number=item.get('lot_number'),
            expiry_date=item.get('expiry_date')
        )
        
        # Cập nhật số lượng tồn kho
        update_stock_balance(
            entity_model,
            warehouse,
            item['item'],
            item['quantity'],
            'in'
        )
    
    # Tạo bút toán kế toán
    if receipt.receipt_type == 'purchase':
        create_purchase_entry(receipt)
    
    return receipt
```

### 1.2. Xuất Kho
```python
def xuat_kho(entity_model, warehouse, issue_data):
    """
    Tạo phiếu xuất kho
    """
    # Kiểm tra tồn kho
    for item in issue_data['items']:
        if not check_stock_available(
            entity_model,
            warehouse,
            item['item'],
            item['quantity']
        ):
            raise ValidationError(f'Không đủ số lượng tồn kho cho {item["item"]}')
    
    # Tạo phiếu xuất kho
    issue = WarehouseIssueModel.objects.create(
        entity=entity_model,
        warehouse=warehouse,
        issue_type=issue_data['type'],
        reference=issue_data['reference'],
        description=issue_data['description']
    )
    
    # Thêm chi tiết hàng hóa
    for item in issue_data['items']:
        # Áp dụng phương pháp tính giá xuất kho
        cost = calculate_issue_cost(
            entity_model,
            warehouse,
            item['item'],
            item['quantity'],
            issue_data['costing_method']
        )
        
        WarehouseIssueLineModel.objects.create(
            issue=issue,
            item=item['item'],
            quantity=item['quantity'],
            unit_cost=cost['unit_cost'],
            total_cost=cost['total_cost']
        )
        
        # Cập nhật số lượng tồn kho
        update_stock_balance(
            entity_model,
            warehouse,
            item['item'],
            item['quantity'],
            'out'
        )
    
    # Tạo bút toán kế toán
    if issue.issue_type == 'sale':
        create_sale_entry(issue)
    elif issue.issue_type == 'production':
        create_production_entry(issue)
    
    return issue
```

## 2. Phương Pháp Tính Giá

### 2.1. Bình Quân Gia Quyền
```python
def tinh_gia_binh_quan(entity_model, warehouse, item, as_of_date):
    """
    Tính giá bình quân gia quyền
    """
    # Lấy số dư đầu kỳ
    opening = get_opening_balance(entity_model, warehouse, item, as_of_date)
    
    # Lấy các giao dịch nhập trong kỳ
    receipts = WarehouseReceiptLineModel.objects.filter(
        receipt__entity=entity_model,
        receipt__warehouse=warehouse,
        item=item,
        receipt__date__lte=as_of_date
    )
    
    total_quantity = opening['quantity']
    total_value = opening['value']
    
    # Tính tổng số lượng và giá trị nhập
    for receipt in receipts:
        total_quantity += receipt.quantity
        total_value += receipt.quantity * receipt.unit_cost
    
    # Tính giá bình quân
    if total_quantity > 0:
        average_cost = total_value / total_quantity
    else:
        average_cost = Decimal('0')
    
    return {
        'unit_cost': average_cost,
        'total_quantity': total_quantity,
        'total_value': total_value
    }
```

### 2.2. Nhập Trước Xuất Trước (FIFO)
```python
def tinh_gia_fifo(entity_model, warehouse, item, quantity):
    """
    Tính giá xuất kho theo phương pháp FIFO
    """
    # Lấy các lô hàng còn tồn theo thứ tự nhập kho
    stock_lots = StockLotModel.objects.filter(
        entity=entity_model,
        warehouse=warehouse,
        item=item,
        remaining_quantity__gt=0
    ).order_by('receipt_date')
    
    remaining_quantity = quantity
    total_cost = Decimal('0')
    lots_used = []
    
    for lot in stock_lots:
        if remaining_quantity <= 0:
            break
            
        quantity_from_lot = min(
            remaining_quantity,
            lot.remaining_quantity
        )
        
        total_cost += quantity_from_lot * lot.unit_cost
        remaining_quantity -= quantity_from_lot
        
        lots_used.append({
            'lot': lot,
            'quantity': quantity_from_lot,
            'unit_cost': lot.unit_cost,
            'total_cost': quantity_from_lot * lot.unit_cost
        })
    
    if remaining_quantity > 0:
        raise ValidationError('Không đủ số lượng tồn kho')
        
    return {
        'unit_cost': total_cost / quantity,
        'total_cost': total_cost,
        'lots': lots_used
    }
```

### 2.3. Nhập Sau Xuất Trước (LIFO)
```python
def tinh_gia_lifo(entity_model, warehouse, item, quantity):
    """
    Tính giá xuất kho theo phương pháp LIFO
    """
    # Lấy các lô hàng còn tồn theo thứ tự nhập kho (mới nhất trước)
    stock_lots = StockLotModel.objects.filter(
        entity=entity_model,
        warehouse=warehouse,
        item=item,
        remaining_quantity__gt=0
    ).order_by('-receipt_date')
    
    remaining_quantity = quantity
    total_cost = Decimal('0')
    lots_used = []
    
    for lot in stock_lots:
        if remaining_quantity <= 0:
            break
            
        quantity_from_lot = min(
            remaining_quantity,
            lot.remaining_quantity
        )
        
        total_cost += quantity_from_lot * lot.unit_cost
        remaining_quantity -= quantity_from_lot
        
        lots_used.append({
            'lot': lot,
            'quantity': quantity_from_lot,
            'unit_cost': lot.unit_cost,
            'total_cost': quantity_from_lot * lot.unit_cost
        })
    
    if remaining_quantity > 0:
        raise ValidationError('Không đủ số lượng tồn kho')
        
    return {
        'unit_cost': total_cost / quantity,
        'total_cost': total_cost,
        'lots': lots_used
    }
```

## 3. Tính Giá Thành Sản Phẩm

### 3.1. Chi Phí Nguyên Vật Liệu Trực Tiếp
```python
def tinh_chi_phi_nvl(entity_model, product, quantity):
    """
    Tính chi phí nguyên vật liệu trực tiếp
    """
    # Lấy định mức nguyên vật liệu
    bom = BillOfMaterialModel.objects.get(
        entity=entity_model,
        product=product
    )
    
    total_cost = Decimal('0')
    material_costs = []
    
    for material in bom.materials.all():
        quantity_needed = material.quantity_per_unit * quantity
        
        # Tính giá xuất kho nguyên vật liệu
        cost = calculate_issue_cost(
            entity_model,
            material.warehouse,
            material.item,
            quantity_needed,
            'average'  # Hoặc 'fifo', 'lifo'
        )
        
        material_costs.append({
            'material': material.item,
            'quantity': quantity_needed,
            'unit_cost': cost['unit_cost'],
            'total_cost': cost['total_cost']
        })
        
        total_cost += cost['total_cost']
    
    return {
        'details': material_costs,
        'total_cost': total_cost,
        'unit_cost': total_cost / quantity
    }
```

### 3.2. Chi Phí Nhân Công Trực Tiếp
```python
def tinh_chi_phi_nhan_cong(entity_model, product, quantity, period):
    """
    Tính chi phí nhân công trực tiếp
    """
    # Lấy định mức nhân công
    labor = LaborStandardModel.objects.get(
        entity=entity_model,
        product=product
    )
    
    total_hours = labor.hours_per_unit * quantity
    
    # Lấy chi phí nhân công thực tế
    labor_costs = LaborCostModel.objects.filter(
        entity=entity_model,
        product=product,
        date__range=period
    )
    
    actual_cost = sum(cost.amount for cost in labor_costs)
    
    return {
        'standard_hours': total_hours,
        'actual_cost': actual_cost,
        'unit_cost': actual_cost / quantity
    }
```

### 3.3. Chi Phí Sản Xuất Chung
```python
def tinh_chi_phi_san_xuat_chung(entity_model, product, quantity, period):
    """
    Tính chi phí sản xuất chung
    """
    # Lấy các chi phí sản xuất chung
    overhead_costs = OverheadCostModel.objects.filter(
        entity=entity_model,
        date__range=period
    )
    
    # Phân bổ chi phí
    total_production = get_total_production(entity_model, period)
    allocation_base = quantity / total_production
    
    costs = {
        'khau_hao': Decimal('0'),
        'dien_nuoc': Decimal('0'),
        'van_hanh': Decimal('0'),
        'khac': Decimal('0')
    }
    
    for cost in overhead_costs:
        allocated_cost = cost.amount * allocation_base
        costs[cost.cost_type] += allocated_cost
    
    return {
        'details': costs,
        'total_cost': sum(costs.values()),
        'unit_cost': sum(costs.values()) / quantity
    }
```

## 4. Báo Cáo Kho Hàng

### 4.1. Thẻ Kho
```python
def in_the_kho(entity_model, warehouse, item, period):
    """
    In thẻ kho theo vật tư
    """
    # Lấy số dư đầu kỳ
    opening = get_opening_balance(
        entity_model,
        warehouse,
        item,
        period['from_date']
    )
    
    # Lấy các giao dịch trong kỳ
    transactions = StockTransactionModel.objects.filter(
        entity=entity_model,
        warehouse=warehouse,
        item=item,
        date__range=[period['from_date'], period['to_date']]
    ).order_by('date')
    
    entries = []
    balance = {
        'quantity': opening['quantity'],
        'value': opening['value']
    }
    
    for tx in transactions:
        if tx.transaction_type == 'in':
            balance['quantity'] += tx.quantity
            balance['value'] += tx.total_cost
        else:
            balance['quantity'] -= tx.quantity
            balance['value'] -= tx.total_cost
            
        entries.append({
            'date': tx.date,
            'document': tx.document_number,
            'description': tx.description,
            'in_quantity': tx.quantity if tx.transaction_type == 'in' else 0,
            'in_value': tx.total_cost if tx.transaction_type == 'in' else 0,
            'out_quantity': tx.quantity if tx.transaction_type == 'out' else 0,
            'out_value': tx.total_cost if tx.transaction_type == 'out' else 0,
            'balance_quantity': balance['quantity'],
            'balance_value': balance['value']
        })
    
    return {
        'opening': opening,
        'entries': entries,
        'closing': balance
    }
```

### 4.2. Báo Cáo Tồn Kho
```python
def bao_cao_ton_kho(entity_model, warehouse, as_of_date):
    """
    Báo cáo tồn kho tổng hợp
    """
    items = ItemModel.objects.filter(entity=entity_model)
    report = []
    
    for item in items:
        stock = get_stock_balance(
            entity_model,
            warehouse,
            item,
            as_of_date
        )
        
        if stock['quantity'] > 0:
            report.append({
                'item': item,
                'quantity': stock['quantity'],
                'unit_cost': stock['value'] / stock['quantity'],
                'total_value': stock['value']
            })
    
    return report
```

### 4.3. Phân Tích ABC
```python
def phan_tich_abc(entity_model, warehouse, period):
    """
    Phân tích ABC hàng tồn kho
    """
    # Tính giá trị sử dụng trong kỳ
    items = ItemModel.objects.filter(entity=entity_model)
    usage_values = []
    
    for item in items:
        # Lấy số lượng xuất kho trong kỳ
        issues = WarehouseIssueLineModel.objects.filter(
            issue__entity=entity_model,
            issue__warehouse=warehouse,
            item=item,
            issue__date__range=[period['from_date'], period['to_date']]
        )
        
        total_quantity = sum(issue.quantity for issue in issues)
        total_value = sum(issue.total_cost for issue in issues)
        
        if total_value > 0:
            usage_values.append({
                'item': item,
                'usage_value': total_value
            })
    
    # Sắp xếp theo giá trị giảm dần
    usage_values.sort(
        key=lambda x: x['usage_value'],
        reverse=True
    )
    
    # Tính tổng giá trị
    total_value = sum(item['usage_value'] for item in usage_values)
    
    # Phân loại ABC
    cumulative = Decimal('0')
    for item in usage_values:
        cumulative += item['usage_value']
        percentage = cumulative / total_value * 100
        
        if percentage <= 80:
            item['category'] = 'A'
        elif percentage <= 95:
            item['category'] = 'B'
        else:
            item['category'] = 'C'
    
    return {
        'items': usage_values,
        'summary': {
            'A': len([i for i in usage_values if i['category'] == 'A']),
            'B': len([i for i in usage_values if i['category'] == 'B']),
            'C': len([i for i in usage_values if i['category'] == 'C'])
        }
    }
