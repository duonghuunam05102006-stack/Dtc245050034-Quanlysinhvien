-- =========================================================================
-- HỆ THỐNG QUẢN LÝ SINH VIÊN BÁCH KHOA (HUST SIS)
-- ĐỀ 2: HỆ THỐNG QUẢN LÝ SINH VIÊN (CRUD SINH VIÊN, LỚP, ĐIỂM SỐ)
-- CƠ SỞ DỮ LIỆU: MySQL / phpMyAdmin 
-- Phân quyền 3 vai trò: Admin (toàn trường), Giảng viên chủ nhiệm, Sinh viên
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `quan_ly_sinh_vien`;
CREATE DATABASE `quan_ly_sinh_vien` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quan_ly_sinh_vien`;

-- -------------------------------------------------------------------------
-- 1. BẢNG KHOA / VIỆN (khoa_vien)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `khoa_vien`;
CREATE TABLE `khoa_vien` (
    `ma_khoa` VARCHAR(20) NOT NULL PRIMARY KEY,
    `ten_khoa` VARCHAR(150) NOT NULL,
    `van_phong` VARCHAR(100) DEFAULT NULL,
    `so_dien_thoai` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `khoa_vien` (`ma_khoa`, `ten_khoa`, `van_phong`, `so_dien_thoai`, `email`) VALUES
('CNTT-TT', 'Trường Công nghệ Thông tin & Truyền thông', 'Nhà B1 - Tầng 4', '024 3869 2463', 'soict@hust.edu.vn'),
('DIEN-DT', 'Trường Điện - Điện tử', 'Nhà C1 - Tầng 3', '024 3869 6233', 'seee@hust.edu.vn'),
('CO-KHI', 'Trường Cơ khí', 'Nhà D9 - Tầng 2', '024 3869 2222', 'sme@hust.edu.vn'),
('TOAN-TIN', 'Khoa Toán - Tin', 'Nhà D3 - Tầng 1', '024 3869 3333', 'sami@hust.edu.vn');

-- -------------------------------------------------------------------------
-- 2. BẢNG GIẢNG VIÊN (giang_vien)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `giang_vien`;
CREATE TABLE `giang_vien` (
    `ma_gv` VARCHAR(20) NOT NULL PRIMARY KEY,
    `ho_ten` VARCHAR(100) NOT NULL,
    `hoc_vi` VARCHAR(50) DEFAULT 'ThS',
    `ma_khoa` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `so_dien_thoai` VARCHAR(20) DEFAULT NULL,
    `mon_giang_day` VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (`ma_khoa`) REFERENCES `khoa_vien`(`ma_khoa`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `giang_vien` (`ma_gv`, `ho_ten`, `hoc_vi`, `ma_khoa`, `email`, `so_dien_thoai`, `mon_giang_day`) VALUES
('GV001', 'PGS. TS. Nguyễn Đức Anh', 'Phó Giáo sư', 'CNTT-TT', 'anh.nd@hust.edu.vn', '0912 345 678', 'Kỹ thuật Lập trình Nâng cao, Cấu trúc dữ liệu'),
('GV002', 'TS. Trần Thị Kim Oanh', 'Tiến sĩ', 'CNTT-TT', 'oanh.ttk@hust.edu.vn', '0978 112 233', 'Công nghệ Phần mềm, Kiểm thử phần mềm'),
('GV003', 'TS. Lê Hoàng Long', 'Tiến sĩ', 'CNTT-TT', 'long.lh@hust.edu.vn', '0904 556 677', 'Hệ Quản trị CSDL, Thiết kế HTTT'),
('GV004', 'PGS. TS. Đỗ Hoàng Sơn', 'Phó Giáo sư', 'CNTT-TT', 'son.dh@hust.edu.vn', '0989 998 877', 'Học máy, Trí tuệ nhân tạo nâng cao'),
('GV005', 'PGS. TS. Phạm Văn Thành', 'Phó Giáo sư', 'DIEN-DT', 'thanh.pv@hust.edu.vn', '0915 223 344', 'Xử lý tín hiệu số, Mạng truyền thông số'),
('GV006', 'PGS. TS. Trần Văn Nam', 'Phó Giáo sư', 'CNTT-TT', 'nam.tv@hust.edu.vn', '0918 776 554', 'Kỹ thuật Lập trình Nâng cao'),
('GV007', 'TS. Nguyễn Thị Mai', 'Tiến sĩ', 'CNTT-TT', 'mai.nt@hust.edu.vn', '0982 334 455', 'Hệ Quản trị Cơ sở Dữ liệu'),
('GV008', 'ThS. Nguyễn Văn Hải', 'Thạc sĩ', 'CNTT-TT', 'hai.nv@hust.edu.vn', '0903 667 788', 'Thực hành Lập trình OOP'),
('GV009', 'ThS. Lê Quang Huy', 'Thạc sĩ', 'CNTT-TT', 'huy.lq@hust.edu.vn', '0914 889 900', 'Phát triển Ứng dụng Web');

-- -------------------------------------------------------------------------
-- 3. BẢNG LỚP HỌC (lop_hoc) - Có Cố vấn / Chủ nhiệm
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `lop_hoc`;
CREATE TABLE `lop_hoc` (
    `ma_lop` VARCHAR(30) NOT NULL PRIMARY KEY,
    `ten_lop` VARCHAR(150) NOT NULL,
    `ma_khoa` VARCHAR(20) NOT NULL,
    `ma_gv_chu_nhiem` VARCHAR(20) DEFAULT NULL,
    `lop_truong` VARCHAR(100) DEFAULT NULL,
    `phong_sinh_hoat` VARCHAR(50) DEFAULT NULL,
    `si_so` INT DEFAULT 0,
    FOREIGN KEY (`ma_khoa`) REFERENCES `khoa_vien`(`ma_khoa`) ON UPDATE CASCADE,
    FOREIGN KEY (`ma_gv_chu_nhiem`) REFERENCES `giang_vien`(`ma_gv`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lop_hoc` (`ma_lop`, `ten_lop`, `ma_khoa`, `ma_gv_chu_nhiem`, `lop_truong`, `phong_sinh_hoat`, `si_so`) VALUES
('IT1-01-K68', 'Khoa học Máy tính 01 - K68', 'CNTT-TT', 'GV001', 'Nguyễn Văn An', 'P.402 - Nhà B1', 340),
('IT2-02-K68', 'Kỹ thuật Phần mềm 02 - K68', 'CNTT-TT', 'GV002', 'Vũ Thảo Hương', 'P.305 - Nhà D9', 295),
('IT-E6-01-K68', 'Hệ thống Thông tin 01 - K68', 'CNTT-TT', 'GV003', 'Lê Văn Cường', 'P.201 - Nhà C7', 250),
('IT-E10-01-K68', 'Trí tuệ Nhân tạo & DS 01 - K68', 'CNTT-TT', 'GV004', 'Phạm Thị Dung', 'P.501 - Nhà D3', 210),
('ET1-01-K68', 'Điện tử Viễn thông 01 - K68', 'DIEN-DT', 'GV005', 'Hoàng Minh Đức', 'P.302 - Nhà C1', 220);

-- -------------------------------------------------------------------------
-- 4. BẢNG SINH VIÊN (sinh_vien)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `sinh_vien`;
CREATE TABLE `sinh_vien` (
    `ma_sv` VARCHAR(20) NOT NULL PRIMARY KEY,
    `ho_ten` VARCHAR(100) NOT NULL,
    `gioi_tinh` ENUM('Nam', 'Nữ') DEFAULT 'Nam',
    `ngay_sinh` DATE DEFAULT '2005-01-01',
    `ma_lop` VARCHAR(30) NOT NULL,
    `chuyen_nganh` VARCHAR(100) DEFAULT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `so_dien_thoai` VARCHAR(20) DEFAULT NULL,
    `dia_chi` VARCHAR(255) DEFAULT NULL,
    `gpa` DECIMAL(4,2) DEFAULT 0.00,
    `cpa_he_4` DECIMAL(3,2) DEFAULT 0.00,
    `drl` INT DEFAULT 80,
    `trang_thai` ENUM('Đang học', 'Tạm nghỉ', 'Bảo lưu', 'Đã tốt nghiệp') DEFAULT 'Đang học',
    `hoc_bong` VARCHAR(100) DEFAULT 'Không',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ma_lop`) REFERENCES `lop_hoc`(`ma_lop`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sinh_vien` (`ma_sv`, `ho_ten`, `gioi_tinh`, `ngay_sinh`, `ma_lop`, `chuyen_nganh`, `email`, `so_dien_thoai`, `dia_chi`, `gpa`, `cpa_he_4`, `drl`, `trang_thai`, `hoc_bong`) VALUES
('20230001', 'Nguyễn Văn An', 'Nam', '2005-05-15', 'IT1-01-K68', 'Khoa học Máy tính (IT1)', 'an.nv230001@sis.hust.edu.vn', '0981 234 567', 'Hai Bà Trưng, Hà Nội', 8.45, 3.52, 88, 'Đang học', 'Học bổng Loại B (Khuyến khích)'),
('20230002', 'Trần Thị Bích', 'Nữ', '2005-08-22', 'IT2-02-K68', 'Kỹ thuật Phần mềm (IT2)', 'bich.tt230002@sis.hust.edu.vn', '0978 345 678', 'Cầu Giấy, Hà Nội', 9.12, 3.86, 94, 'Đang học', 'Học bổng Loại A (Xuất sắc)'),
('20230003', 'Lê Văn Cường', 'Nam', '2005-01-10', 'IT-E6-01-K68', 'Hệ thống Thông tin (IT-E6)', 'cuong.lv230003@sis.hust.edu.vn', '0912 456 789', 'Bắc Ninh', 7.89, 3.25, 82, 'Đang học', 'Không'),
('20230004', 'Phạm Thị Dung', 'Nữ', '2005-11-30', 'IT-E10-01-K68', 'Khoa học Dữ liệu & AI (IT-E10)', 'dung.pt230004@sis.hust.edu.vn', '0934 567 890', 'Hải Phòng', 5.45, 1.85, 58, 'Tạm nghỉ', 'Không'),
('20230005', 'Hoàng Minh Đức', 'Nam', '2005-03-05', 'ET1-01-K68', 'Điện tử Viễn thông (ET1)', 'duc.hm230005@sis.hust.edu.vn', '0965 678 901', 'Hà Nội', 8.76, 3.65, 90, 'Đang học', 'Học bổng Loại B (Khuyến khích)'),
('20230006', 'Vũ Thảo Hương', 'Nữ', '2005-07-19', 'IT2-02-K68', 'Kỹ thuật Phần mềm (IT2)', 'huong.vt230006@sis.hust.edu.vn', '0971 889 912', 'Vĩnh Phúc', 9.35, 3.92, 96, 'Đang học', 'Học bổng Loại A (Xuất sắc)'),
('20230007', 'Đỗ Quốc Khánh', 'Nam', '2005-09-12', 'IT1-01-K68', 'Khoa học Máy tính (IT1)', 'khanh.dq230007@sis.hust.edu.vn', '0983 456 123', 'Hải Dương', 8.05, 3.32, 84, 'Đang học', 'Học bổng Doanh nghiệp'),
('20230008', 'Mai Phương Linh', 'Nữ', '2005-12-04', 'IT-E10-01-K68', 'Khoa học Dữ liệu & AI (IT-E10)', 'linh.mp230008@sis.hust.edu.vn', '0945 123 789', 'Hà Nội', 6.85, 2.70, 75, 'Bảo lưu', 'Không');

-- -------------------------------------------------------------------------
-- 5. BẢNG MÔN HỌC (mon_hoc)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `mon_hoc`;
CREATE TABLE `mon_hoc` (
    `ma_mon` VARCHAR(20) NOT NULL PRIMARY KEY,
    `ten_mon` VARCHAR(150) NOT NULL,
    `so_tin_chi` INT NOT NULL DEFAULT 3,
    `he_so_cc` DECIMAL(3,2) DEFAULT 0.10,
    `he_so_gk` DECIMAL(3,2) DEFAULT 0.30,
    `he_so_ck` DECIMAL(3,2) DEFAULT 0.60,
    `khoa_phu_trach` VARCHAR(20) DEFAULT 'CNTT-TT',
    FOREIGN KEY (`khoa_phu_trach`) REFERENCES `khoa_vien`(`ma_khoa`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mon_hoc` (`ma_mon`, `ten_mon`, `so_tin_chi`, `he_so_cc`, `he_so_gk`, `he_so_ck`, `khoa_phu_trach`) VALUES
('MI1110', 'Giải tích 1', 4, 0.10, 0.30, 0.60, 'TOAN-TIN'),
('MI1120', 'Đại số tuyến tính', 3, 0.10, 0.30, 0.60, 'TOAN-TIN'),
('IT3011', 'Cấu trúc dữ liệu & Thuật toán', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('IT3100', 'Lập trình Hướng đối tượng', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('IT3080', 'Kiến trúc Máy tính', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('IT3040', 'Kỹ thuật Lập trình Nâng cao', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('IT3160', 'Hệ Quản trị Cơ sở Dữ liệu', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('IT4142', 'Phát triển Ứng dụng Web', 3, 0.10, 0.30, 0.60, 'CNTT-TT'),
('FL2020', 'Tiếng Anh Khoa học Công nghệ', 2, 0.10, 0.30, 0.60, 'CNTT-TT'),
('PE2030', 'Giáo dục Thể chất 3 (Bóng rổ)', 1, 0.20, 0.30, 0.50, 'CNTT-TT');

-- -------------------------------------------------------------------------
-- 6. BẢNG ĐIỂM SỐ (diem_so)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `diem_so`;
CREATE TABLE `diem_so` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ma_sv` VARCHAR(20) NOT NULL,
    `ma_mon` VARCHAR(20) NOT NULL,
    `hoc_ky` VARCHAR(20) DEFAULT '20251',
    `diem_cc` DECIMAL(4,2) DEFAULT 0.00,
    `diem_gk` DECIMAL(4,2) DEFAULT 0.00,
    `diem_ck` DECIMAL(4,2) DEFAULT 0.00,
    `diem_tong_ket` DECIMAL(4,2) DEFAULT 0.00,
    `diem_chu` VARCHAR(5) DEFAULT 'F',
    `diem_he_4` DECIMAL(3,2) DEFAULT 0.00,
    `ket_qua` ENUM('Đạt', 'Học lại') DEFAULT 'Đạt',
    FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien`(`ma_sv`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`ma_mon`) REFERENCES `mon_hoc`(`ma_mon`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `diem_so` (`ma_sv`, `ma_mon`, `hoc_ky`, `diem_cc`, `diem_gk`, `diem_ck`, `diem_tong_ket`, `diem_chu`, `diem_he_4`, `ket_qua`) VALUES
('20230001', 'MI1110', '20251', 9.0, 8.5, 8.5, 8.55, 'A', 4.0, 'Đạt'),
('20230001', 'MI1120', '20251', 8.5, 8.0, 8.0, 8.05, 'B+', 3.5, 'Đạt'),
('20230001', 'IT3011', '20251', 10.0, 9.0, 9.2, 9.22, 'A+', 4.0, 'Đạt'),
('20230001', 'IT3100', '20251', 9.5, 8.5, 8.8, 8.78, 'A', 4.0, 'Đạt'),
('20230001', 'IT3080', '20251', 8.0, 7.5, 7.8, 7.73, 'B', 3.0, 'Đạt'),
('20230002', 'MI1110', '20251', 9.5, 9.0, 9.0, 9.05, 'A+', 4.0, 'Đạt'),
('20230002', 'MI1120', '20251', 10.0, 9.5, 9.5, 9.55, 'A+', 4.0, 'Đạt'),
('20230002', 'IT3011', '20251', 9.0, 9.0, 9.0, 9.00, 'A', 4.0, 'Đạt'),
('20230003', 'MI1110', '20251', 8.0, 7.5, 7.5, 7.55, 'B', 3.0, 'Đạt'),
('20230003', 'MI1120', '20251', 8.5, 8.0, 8.0, 8.05, 'B+', 3.5, 'Đạt'),
('20230004', 'MI1110', '20251', 6.0, 5.0, 5.0, 5.10, 'D', 1.0, 'Đạt'),
('20230004', 'IT3011', '20251', 6.0, 5.0, 5.0, 5.10, 'D', 1.0, 'Đạt');

-- -------------------------------------------------------------------------
-- 7. BẢNG THỜI KHÓA BIỂU (thoi_khoa_bieu) - Chi tiết: Tiết, Hôm, Phòng, Thầy cô
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `thoi_khoa_bieu`;
CREATE TABLE `thoi_khoa_bieu` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ma_mon` VARCHAR(20) NOT NULL,
    `ma_lop` VARCHAR(30) NOT NULL,
    `ma_gv` VARCHAR(20) NOT NULL,
    `thu` VARCHAR(20) NOT NULL,
    `tiet_hoc` VARCHAR(30) NOT NULL,
    `khung_gio` VARCHAR(50) NOT NULL,
    `phong_hoc` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`ma_mon`) REFERENCES `mon_hoc`(`ma_mon`) ON UPDATE CASCADE,
    FOREIGN KEY (`ma_lop`) REFERENCES `lop_hoc`(`ma_lop`) ON UPDATE CASCADE,
    FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien`(`ma_gv`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `thoi_khoa_bieu` (`ma_mon`, `ma_lop`, `ma_gv`, `thu`, `tiet_hoc`, `khung_gio`, `phong_hoc`) VALUES
('IT3040', 'IT1-01-K68', 'GV006', 'Thứ Hai', 'Tiết 1 - 3', '06:45 - 09:15', 'D9-401'),
('IT3160', 'IT1-01-K68', 'GV007', 'Thứ Ba', 'Tiết 4 - 6', '09:30 - 11:55', 'B1-204'),
('IT3100', 'IT1-01-K68', 'GV008', 'Thứ Tư', 'Tiết 7 - 9', '13:00 - 15:30', 'C7-302'),
('IT4142', 'IT1-01-K68', 'GV009', 'Thứ Năm', 'Tiết 1 - 3', '06:45 - 09:15', 'D3-501'),
('FL2020', 'IT1-01-K68', 'GV002', 'Thứ Sáu', 'Tiết 4 - 6', '09:30 - 11:55', 'C1-105'),
('PE2030', 'IT1-01-K68', 'GV001', 'Thứ Bảy', 'Tiết 7 - 10', '13:00 - 16:30', 'Sân Vận Động HUST');

-- -------------------------------------------------------------------------
-- 8. BẢNG TÀI KHOẢN NGƯỜI DÙNG (tai_khoan) - 3 Vai trò: Admin, Giảng viên, Sinh viên
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `tai_khoan`;
CREATE TABLE `tai_khoan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `vai_tro` ENUM('Quản trị viên', 'Giảng viên', 'Sinh viên') NOT NULL,
    `ma_lien_ket` VARCHAR(20) DEFAULT NULL, -- Mã GV hoặc Mã SV
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tai_khoan` (`username`, `password`, `ho_ten`, `email`, `vai_tro`, `ma_lien_ket`) VALUES
('admin', '123', 'ThS. Trần Quang Minh', 'minh.tq@hust.edu.vn', 'Quản trị viên', NULL),
('teacher', '123', 'PGS. TS. Nguyễn Đức Anh', 'anh.nd@hust.edu.vn', 'Giảng viên', 'GV001'),
('student', '123', 'Nguyễn Văn An', 'an.nv230001@sis.hust.edu.vn', 'Sinh viên', '20230001');

SET FOREIGN_KEY_CHECKS = 1;
-- KẾT THÚC CƠ SỞ DỮ LIỆU

