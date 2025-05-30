# Tài Liệu Hệ Thống Tài Khoản Django Ledger

## Giới Thiệu
Đây là tài liệu chi tiết về hệ thống tài khoản trong Django Ledger, được thiết kế theo chuẩn kế toán Việt Nam (TT200). 

## Cấu Trúc Tài Liệu

1. **[Cơ Chế Tạo Hệ Thống Tài Khoản](chart_of_accounts.md)**
   - Tổng quan
   - Cấu trúc hệ thống
   - Quy trình sử dụng
   - Best practices

2. **[Sơ Đồ & Mô Hình](diagrams/)**
   - [Cấu trúc tài khoản](diagrams/account_structure.md)
   - [Luồng API](diagrams/api_flow.md)

3. **[API Endpoints](api_endpoints.md)**
   - Danh sách API
   - Cấu trúc Request/Response
   - Xử lý lỗi
   - Bảo mật

## Bắt Đầu Sử Dụng

### 1. Cài Đặt
```bash
pip install django-ledger
```

### 2. Cấu Hình
Thêm vào settings.py:
```python
INSTALLED_APPS = [
    ...
    'django_ledger',
]
```

### 3. Tạo Entity và Chart of Accounts
```python
from django_ledger.models import EntityModel, ChartOfAccountModel

# Tạo entity
entity = EntityModel.objects.create(
    name='Công ty của tôi',
    admin=user_model
)

# Tạo chart of accounts
coa = ChartOfAccountModel.objects.create(
    name='Hệ thống tài khoản',
    entity=entity
)
```

## Hướng Dẫn Đóng Góp

1. **Báo Lỗi**
   - Tạo issue trên GitHub
   - Mô tả chi tiết vấn đề
   - Cung cấp các bước tái hiện

2. **Đóng Góp Code**
   - Fork repository
   - Tạo branch mới
   - Commit thay đổi
   - Tạo pull request

3. **Cải Thiện Tài Liệu**
   - Sửa lỗi chính tả
   - Thêm ví dụ
   - Cập nhật thông tin mới

## Hỗ Trợ

- **Email**: support@djangoledger.com
- **Discord**: [Link tham gia](https://discord.gg/djangoledger)
- **GitHub Issues**: [Tạo issue mới](https://github.com/djangoledger/issues)

## License

Django Ledger được phát hành dưới giấy phép GPLv3. Xem file [LICENSE](../../LICENSE) để biết thêm chi tiết.

## Tác Giả và Cộng Tác Viên

- **Miguel Sanda** - *Tác giả chính* - [GitHub](https://github.com/miguelsanda)
- Xem thêm danh sách [cộng tác viên](../../AUTHORS.md)

## Phiên Bản

Xem [CHANGELOG.md](../../CHANGELOG.md) để biết chi tiết các thay đổi trong từng phiên bản.
