# Changelog: July 2024 - Week 2

## Cập nhật tài liệu Phân hệ Quản lý Mua hàng (09/07/2024)

### Tổng quan cập nhật
- Đã cập nhật 5 tài liệu thuộc phân hệ Mua hàng để đảm bảo chính xác với mã nguồn thực tế
- Đã hiệu chỉnh mô tả và định nghĩa thuật ngữ để tương thích với implementation hiện tại
- Đã bổ sung thêm thông tin kỹ thuật về các model và mối quan hệ giữa chúng

### Các tài liệu đã cập nhật
1. **PUR_001_Quản Lý Nhà Cung Cấp**
   - Cập nhật định nghĩa trường dữ liệu theo mô hình VendorModel thực tế
   - Bổ sung thông tin về cơ chế tạo mã nhà cung cấp tự động
   - Cập nhật thông tin về trạng thái active/hidden

2. **PUR_002_Quản Lý Đơn Mua Hàng**
   - Cập nhật định nghĩa trường dữ liệu theo mô hình DonMuaHangModel
   - Bổ sung thêm thông tin về quản lý thông tin giao hàng và thanh toán
   - Cập nhật mô tả các trường tính toán tự động như tổng tiền, tổng thuế

3. **PUR_003_Quản Lý Hóa Đơn Mua Vào**
   - Cập nhật thông tin về quản lý trạng thái hóa đơn (draft, review, approved, paid, void, canceled)
   - Bổ sung định nghĩa thuật ngữ về các trạng thái tài liệu
   - Cập nhật mô tả về tích hợp với hệ thống kế toán

4. **PUR_004_Quản Lý Giá Mua**
   - Bổ sung thông tin về quản lý phiên bản giá và lịch sử giá
   - Cập nhật về cơ chế chiết khấu theo số lượng

5. **PUR_005_Quản Lý Ràng Buộc Nhập**
   - Cập nhật hoàn toàn nội dung dựa trên mô hình AccountConstraintModel thực tế
   - Điều chỉnh mô tả từ quản lý ràng buộc nhập kho sang ràng buộc nhập liệu kế toán
   - Bổ sung thông tin về mối quan hệ với tài khoản kế toán

### Người thực hiện
- AI Assistant

### Công việc tiếp theo
- Tiếp tục rà soát chi tiết các biểu mẫu và quy trình liên quan
- Cập nhật mô hình dữ liệu ERD để đảm bảo phản ánh cấu trúc dữ liệu hiện tại