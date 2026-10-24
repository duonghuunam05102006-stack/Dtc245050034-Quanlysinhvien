# 🎓 Hệ Thống Quản Lý Sinh Viên ICTU (Student Management System)

> Giao diện hiện đại, trực quan, trau chuốt vượt trội lấy cảm hứng từ nhận diện thương hiệu Trường Đại học Công nghệ Thông tin và Truyền thông (ICTU - Thái Nguyên).

---

## 🌟 Điểm nổi bật & Tính năng cao cấp

### 1. Màn hình Đăng nhập / Đăng ký (Login & Register Screen)
- **Thiết kế Glassmorphism & 3D Lighting:** Nền khuôn viên trường đại học kết hợp hiệu ứng kính mờ (frosted glass), ánh hào quang (blue aura glow) và đồ họa 3D sách mở cùng mũ cử nhân tượng trưng tri thức ICTU.
- **Biểu tượng & Slogan ICTU:** Slogan nhận diện thương hiệu *"Tri thức • Sáng tạo • Vươn xa"* & *"Cùng ICTU Kiến tạo tương lai!"*.
- **3 thẻ giá trị nổi bật:**
  1. *Quản lý sinh viên nhanh chóng, chính xác*
  2. *Theo dõi kết quả học tập trực quan, dễ dàng*
  3. *Bảo mật an toàn dữ liệu tuyệt đối*
- **Đăng nhập nhanh (1-Click Demo Accounts):**
  - **Admin (Quản trị viên):** `admin` / `123`
  - **Giảng viên:** `teacher` / `123`
  - **Sinh viên:** `student` / `123`
- **Hỗ trợ đầy đủ:** Đăng nhập, Đăng ký mới, Đăng nhập với Google & Microsoft, Ghi nhớ tài khoản, Quên mật khẩu.

---

### 2. Màn hình Bảng Điều Khiển (Admin Dashboard)
- **Thanh điều hướng Sidebar (Navy Blue Gradient):**
  - Logo ICTU & biểu tượng học thuật sang trọng.
  - Các mục điều hướng: *Trang chủ, Danh sách sinh viên, Điểm số, Lớp học, Báo cáo, Cài đặt*.
  - Huy hiệu số lượng sinh viên thời gian thực.
  - Slogan chân trang: *"Kiến tạo tri thức - Vững bước tương lai"*.
- **Thanh công cụ đỉnh (Top Header):**
  - Tìm kiếm toàn cục tức thì (`Ctrl + K`).
  - Đồng hồ điện tử hiển thị thứ, ngày tháng và thời gian thực tiếng Việt (`Thứ Bảy, 24/10/2026 - HH:mm:ss`).
  - Nút chuyển đổi nhanh chế độ Sáng / Tối (**Dark Mode & Light Mode**).
  - Chuông thông báo với danh sách thông báo nổi thời gian thực.
  - Hồ sơ quản trị viên và menu đăng xuất nhanh.
- **4 Thẻ Chỉ Số Thông Minh (Stat Metric Cards):**
  - *Tổng số sinh viên:* 1,248 (+12% so với tháng trước) + Biểu đồ sóng Sparkline.
  - *Sinh viên mới:* 248 (+18% so với tháng trước) + Sparkline xanh lục.
  - *Tỷ lệ đỗ:* 92.5% (+2.3% so với kỳ trước) + Sparkline tím.
  - *Lớp học active:* 32 (+3% so với tháng trước) + Sparkline cam.
- **2 Biểu đồ Tương tác Chuyên sâu (Interactive Charts):**
  - *Biểu đồ cột kép:* Kết quả học tập theo học kỳ (Toán cao cấp, Lập trình OOP, CSDL, Mạng máy tính, Tiếng Anh) với bộ chọn học kỳ (HK1-2025, HK2-2024, HK1-2024) hiển thị Điểm TB và Tỷ lệ đạt (%).
  - *Biểu đồ tròn Donut:* Phân bố sinh viên theo chuyên ngành K23 (K23CNTT, K23KTPM, K23HTTT, K23TT, Khác) với tâm đếm 1,248 SV và chú thích màu sắc tỷ lệ phần trăm.
- **Bảng dữ liệu Quản lý Sinh viên Hoàn chỉnh (CRUD Table):**
  - Tìm kiếm theo tên, mã SV, lớp theo thời gian thực (Live Search).
  - Bộ lọc nhiều tiêu chí: Theo Lớp, Theo Trạng thái (*Đang học, Tạm nghỉ, Bảo lưu*).
  - Sắp xếp GPA tăng dần / giảm dần.
  - Phân trang mượt mà (Pagination).
  - **Thao tác nhanh trên từng sinh viên:**
    - 👁️ **Xem chi tiết:** Thẻ sinh viên, điểm số từng môn, số tín chỉ, thông tin liên hệ.
    - ✏️ **Chỉnh sửa:** Cập nhật họ tên, điểm số, trạng thái, lớp học, số điện thoại.
    - 🗑️ **Xóa sinh viên:** Hộp thoại xác nhận an toàn.
  - **Thêm sinh viên mới:** Form modal nhập liệu đầy đủ với mã SV tự động sinh.
  - **Xuất dữ liệu:** Xuất danh sách sinh viên ra tệp Excel (CSV) chuẩn Unicode có dấu tiếng Việt.
  - **Lưu trữ cục bộ (LocalStorage):** Mọi thao tác thêm, sửa, xóa đều được lưu bền vững trên trình duyệt, có nút khôi phục dữ liệu mẫu ban đầu bất kỳ lúc nào.
- **Hiệu ứng âm thanh tương tác (Web Audio Synthesizer):** Phản hồi âm thanh nhẹ nhàng tinh tế khi click, thông báo thành công hoặc xóa (không phụ thuộc file âm thanh ngoài).

---

## 🚀 Cách chạy dự án

### Cách 1: Chạy trực tiếp (Không cần cài đặt gì thêm)
Chỉ cần nhấp đúp vào tệp **`index.html`** hoặc kéo vào trình duyệt Chrome/Edge/Firefox để mở và sử dụng ngay lập tức!

### Cách 2: Chạy qua Server nội bộ (Khuyến nghị)
1. Nhấp đúp vào tệp **`start.bat`** (Windows)
2. Hệ thống sẽ tự động bật máy chủ Node.js và mở trình duyệt tại địa chỉ:  
   👉 **`http://localhost:3000`**

*(Hoặc mở cửa sổ dòng lệnh tại thư mục này và gõ: `node server.js`)*

---

## 📁 Cấu trúc thư mục

```
quản lí sinh viên/
├── index.html          # File giao diện chính tích hợp toàn bộ hệ thống
├── css/
│   └── style.css       # Hiệu ứng Glassmorphism, animations, dark mode
├── js/
│   ├── data.js         # Dữ liệu mẫu sinh viên, lớp học, học phần, biểu đồ
│   └── app.js          # Xử lý sự kiện, CRUD, biểu đồ, âm thanh, tìm kiếm
├── server.js           # Máy chủ HTTP Node.js chuẩn zero-dependency
├── start.bat           # Phím tắt khởi động 1-click trên Windows
└── README.md           # Hướng dẫn chi tiết
```
