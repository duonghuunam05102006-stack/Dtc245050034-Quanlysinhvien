/**
 * Comprehensive Database & Mock Records for HUST Student Management System
 * Đại học Bách Khoa Hà Nội (HUST)
 */

const DEFAULT_USERS = [
    {
        username: 'admin',
        password: '123',
        fullName: 'ThS. Trần Quang Minh',
        role: 'Quản trị viên',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        email: 'minh.tq@hust.edu.vn',
        department: 'Phòng Đào tạo Đại học Bách Khoa'
    },
    {
        username: 'teacher',
        password: '123',
        fullName: 'PGS. TS. Nguyễn Đức Anh',
        role: 'Giảng viên',
        teacherId: 'GV001',
        homeroomClass: 'IT1-01-K68',
        homeroomClassName: 'Khoa học Máy tính 01 - K68',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        email: 'anh.nd@hust.edu.vn',
        phone: '0912 345 678',
        department: 'Trường Công nghệ Thông tin & Truyền thông - HUST',
        teachingCourses: ['Kỹ thuật Lập trình Nâng cao', 'Cấu trúc dữ liệu & Giải thuật']
    },
    {
        username: 'student',
        password: '123',
        fullName: 'Nguyễn Văn An',
        role: 'Sinh viên',
        studentId: '20230001',
        class: 'IT1-01-K68',
        className: 'Khoa học Máy tính 01 - K68',
        major: 'Khoa học Máy tính (IT1)',
        faculty: 'Trường CNTT & TT - HUST',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        email: 'an.nv230001@sis.hust.edu.vn',
        phone: '0981 234 567',
        gpa: 8.45,
        gpa4: 3.52,
        drl: 88,
        creditsCompleted: 58,
        totalCredits: 156,
        tuitionDue: 0,
        tuitionStatus: 'Đã hoàn thành'
    }
];

// Danh Sách Giảng Viên Toàn Trường
const INITIAL_TEACHERS = [
    {
        id: 'GV001',
        fullName: 'PGS. TS. Nguyễn Đức Anh',
        email: 'anh.nd@hust.edu.vn',
        phone: '0912 345 678',
        department: 'Trường CNTT & TT',
        homeroomClass: 'IT1-01-K68',
        homeroomClassName: 'Khoa học Máy tính 01 - K68',
        teachingCourses: 'Kỹ thuật Lập trình Nâng cao, Cấu trúc dữ liệu',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'GV002',
        fullName: 'TS. Trần Thị Kim Oanh',
        email: 'oanh.ttk@hust.edu.vn',
        phone: '0978 112 233',
        department: 'Trường CNTT & TT',
        homeroomClass: 'IT2-02-K68',
        homeroomClassName: 'Kỹ thuật Phần mềm 02 - K68',
        teachingCourses: 'Công nghệ Phần mềm, Kiểm thử phần mềm',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'GV003',
        fullName: 'TS. Lê Hoàng Long',
        email: 'long.lh@hust.edu.vn',
        phone: '0904 556 677',
        department: 'Trường CNTT & TT',
        homeroomClass: 'IT-E6-01-K68',
        homeroomClassName: 'Hệ thống Thông tin 01 - K68',
        teachingCourses: 'Hệ Quản trị Cơ sở Dữ liệu, Phân tích HTTT',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'GV004',
        fullName: 'PGS. TS. Đỗ Hoàng Sơn',
        email: 'son.dh@hust.edu.vn',
        phone: '0989 998 877',
        department: 'Trường CNTT & TT',
        homeroomClass: 'IT-E10-01-K68',
        homeroomClassName: 'Trí tuệ Nhân tạo & DS 01 - K68',
        teachingCourses: 'Học máy, Khai phá dữ liệu lớn',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'GV005',
        fullName: 'PGS. TS. Phạm Văn Thành',
        email: 'thanh.pv@hust.edu.vn',
        phone: '0915 223 344',
        department: 'Trường Điện - Điện tử',
        homeroomClass: 'ET1-01-K68',
        homeroomClassName: 'Điện tử Viễn thông 01 - K68',
        teachingCourses: 'Xử lý tín hiệu số, Mạng truyền thông số',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
    }
];

const INITIAL_STUDENTS = [
    {
        id: 1,
        studentId: '20230001',
        fullName: 'Nguyễn Văn An',
        gender: 'Nam',
        dob: '2005-05-15',
        class: 'IT1-01-K68',
        major: 'Khoa học Máy tính (IT1)',
        status: 'Đang học',
        gpa: 8.45,
        gpa4: 3.52,
        drl: 88,
        academicWarning: 'Bình thường',
        scholarship: 'Học bổng Loại B (Khuyến khích)',
        scholarshipStatus: 'Đã phê duyệt',
        email: 'an.nv230001@sis.hust.edu.vn',
        phone: '0981 234 567',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
        address: 'Hai Bà Trưng, Hà Nội',
        credits: 58,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 4, letter: 'A' },
            'Đại số tuyến tính': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 10, gk: 9.0, ck: 9.2, total: 9.2, credits: 3, letter: 'A+' },
            'Lập trình Hướng đối tượng': { cc: 9.5, gk: 8.5, ck: 8.8, total: 8.8, credits: 3, letter: 'A' },
            'Kiến trúc Máy tính': { cc: 8.0, gk: 7.5, ck: 7.8, total: 7.8, credits: 3, letter: 'B' },
            'Tiếng Anh chuyên ngành': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' }
        }
    },
    {
        id: 2,
        studentId: '20230002',
        fullName: 'Trần Thị Bích',
        gender: 'Nữ',
        dob: '2005-08-22',
        class: 'KTPM 02 - K68',
        major: 'Kỹ thuật Phần mềm (IT2)',
        status: 'Đang học',
        gpa: 9.12,
        gpa4: 3.86,
        drl: 94,
        academicWarning: 'Bình thường',
        scholarship: 'Học bổng Loại A (Xuất sắc)',
        scholarshipStatus: 'Đã phê duyệt',
        email: 'bich.tt230002@sis.hust.edu.vn',
        phone: '0978 345 678',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        address: 'Cầu Giấy, Hà Nội',
        credits: 62,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 9.5, gk: 9.0, ck: 9.0, total: 9.0, credits: 4, letter: 'A+' },
            'Đại số tuyến tính': { cc: 10, gk: 9.5, ck: 9.5, total: 9.5, credits: 3, letter: 'A+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 9.0, gk: 9.0, ck: 9.0, total: 9.0, credits: 3, letter: 'A' },
            'Lập trình Hướng đối tượng': { cc: 10, gk: 9.5, ck: 9.5, total: 9.5, credits: 3, letter: 'A+' },
            'Kiến trúc Máy tính': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Tiếng Anh chuyên ngành': { cc: 9.5, gk: 9.2, ck: 9.2, total: 9.2, credits: 3, letter: 'A+' }
        }
    },
    {
        id: 3,
        studentId: '20230003',
        fullName: 'Lê Văn Cường',
        gender: 'Nam',
        dob: '2005-01-10',
        class: 'HTTT 01 - K68',
        major: 'Hệ thống Thông tin (IT-E6)',
        status: 'Đang học',
        gpa: 7.89,
        gpa4: 3.25,
        drl: 82,
        academicWarning: 'Bình thường',
        scholarship: 'Không',
        scholarshipStatus: 'Không đủ điều kiện',
        email: 'cuong.lv230003@sis.hust.edu.vn',
        phone: '0912 456 789',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        address: 'Bắc Ninh',
        credits: 56,
        tuition: { total: 19200000, paid: 19200000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 8.0, gk: 7.5, ck: 7.5, total: 7.5, credits: 4, letter: 'B' },
            'Đại số tuyến tính': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 8.0, gk: 7.8, ck: 7.8, total: 7.8, credits: 3, letter: 'B' },
            'Lập trình Hướng đối tượng': { cc: 8.5, gk: 8.2, ck: 8.2, total: 8.2, credits: 3, letter: 'B+' },
            'Kiến trúc Máy tính': { cc: 8.0, gk: 7.6, ck: 7.6, total: 7.6, credits: 3, letter: 'B' },
            'Tiếng Anh chuyên ngành': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' }
        }
    },
    {
        id: 4,
        studentId: '20230004',
        fullName: 'Phạm Thị Dung',
        gender: 'Nữ',
        dob: '2005-11-30',
        class: 'AI 01 - K68',
        major: 'Khoa học Dữ liệu & Trí tuệ Nhân tạo (IT-E10)',
        status: 'Tạm nghỉ',
        gpa: 5.45,
        gpa4: 1.85,
        drl: 58,
        academicWarning: 'Cảnh báo mức 1 (CPA < 2.0)',
        scholarship: 'Không',
        scholarshipStatus: 'Không',
        email: 'dung.pt230004@sis.hust.edu.vn',
        phone: '0934 567 890',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
        address: 'Hải Phòng',
        credits: 38,
        tuition: { total: 22000000, paid: 11000000, status: 'Nợ 11,000,000 đ' },
        subjects: {
            'Giải tích 1': { cc: 6.0, gk: 5.0, ck: 5.0, total: 5.0, credits: 4, letter: 'D' },
            'Đại số tuyến tính': { cc: 6.5, gk: 5.5, ck: 5.5, total: 5.5, credits: 3, letter: 'D+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 6.0, gk: 5.0, ck: 5.0, total: 5.0, credits: 3, letter: 'D' },
            'Lập trình Hướng đối tượng': { cc: 7.0, gk: 6.0, ck: 6.0, total: 6.0, credits: 3, letter: 'C' },
            'Kiến trúc Máy tính': { cc: 6.0, gk: 5.2, ck: 5.2, total: 5.2, credits: 3, letter: 'D' },
            'Tiếng Anh chuyên ngành': { cc: 7.0, gk: 6.0, ck: 6.0, total: 6.0, credits: 3, letter: 'C' }
        }
    },
    {
        id: 5,
        studentId: '20230005',
        fullName: 'Hoàng Minh Đức',
        gender: 'Nam',
        dob: '2005-03-05',
        class: 'DTVT 01 - K68',
        major: 'Kỹ thuật Điện tử - Viễn thông (ET1)',
        status: 'Đang học',
        gpa: 8.76,
        gpa4: 3.65,
        drl: 90,
        scholarship: 'Học bổng Loại B (Khuyến khích)',
        scholarshipStatus: 'Đã phê duyệt',
        academicWarning: 'Bình thường',
        email: 'duc.hm230005@sis.hust.edu.vn',
        phone: '0965 678 901',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
        address: 'Hà Nội',
        credits: 60,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 9.0, gk: 9.0, ck: 9.0, total: 9.0, credits: 4, letter: 'A' },
            'Đại số tuyến tính': { cc: 9.0, gk: 8.8, ck: 8.8, total: 8.8, credits: 3, letter: 'A' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 8.5, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Lập trình Hướng đối tượng': { cc: 9.0, gk: 8.8, ck: 8.8, total: 8.8, credits: 3, letter: 'A' },
            'Kiến trúc Máy tính': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Tiếng Anh chuyên ngành': { cc: 9.2, gk: 8.9, ck: 8.9, total: 8.9, credits: 3, letter: 'A' }
        }
    },
    {
        id: 6,
        studentId: '20230006',
        fullName: 'Vũ Thảo Hương',
        gender: 'Nữ',
        dob: '2005-07-19',
        class: 'KTPM 02 - K68',
        major: 'Kỹ thuật Phần mềm (IT2)',
        status: 'Đang học',
        gpa: 9.35,
        gpa4: 3.92,
        drl: 96,
        scholarship: 'Học bổng Loại A (Xuất sắc)',
        scholarshipStatus: 'Đã phê duyệt',
        academicWarning: 'Bình thường',
        email: 'huong.vt230006@sis.hust.edu.vn',
        phone: '0971 889 912',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        address: 'Vĩnh Phúc',
        credits: 64,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 10, gk: 9.8, ck: 9.8, total: 9.8, credits: 4, letter: 'A+' },
            'Đại số tuyến tính': { cc: 10, gk: 9.5, ck: 9.5, total: 9.5, credits: 3, letter: 'A+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 9.5, gk: 9.2, ck: 9.2, total: 9.2, credits: 3, letter: 'A+' },
            'Lập trình Hướng đối tượng': { cc: 10, gk: 9.5, ck: 9.5, total: 9.5, credits: 3, letter: 'A+' },
            'Kiến trúc Máy tính': { cc: 9.5, gk: 9.0, ck: 9.0, total: 9.0, credits: 3, letter: 'A' },
            'Tiếng Anh chuyên ngành': { cc: 9.8, gk: 9.5, ck: 9.5, total: 9.5, credits: 3, letter: 'A+' }
        }
    },
    {
        id: 7,
        studentId: '20230007',
        fullName: 'Đỗ Quốc Khánh',
        gender: 'Nam',
        dob: '2005-09-12',
        class: 'IT1-01-K68',
        major: 'Khoa học Máy tính (IT1)',
        status: 'Đang học',
        gpa: 8.05,
        gpa4: 3.32,
        drl: 84,
        scholarship: 'Học bổng Doanh nghiệp Viettel',
        scholarshipStatus: 'Chờ xét duyệt',
        academicWarning: 'Bình thường',
        email: 'khanh.dq230007@sis.hust.edu.vn',
        phone: '0983 456 123',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
        address: 'Hải Dương',
        credits: 58,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 4, letter: 'B+' },
            'Đại số tuyến tính': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 8.0, gk: 7.8, ck: 7.8, total: 7.8, credits: 3, letter: 'B' },
            'Lập trình Hướng đối tượng': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Kiến trúc Máy tính': { cc: 8.0, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Tiếng Anh chuyên ngành': { cc: 8.5, gk: 8.2, ck: 8.2, total: 8.2, credits: 3, letter: 'B+' }
        }
    },
    {
        id: 8,
        studentId: '20230008',
        fullName: 'Mai Phương Linh',
        gender: 'Nữ',
        dob: '2005-12-04',
        class: 'AI 01 - K68',
        major: 'Khoa học Dữ liệu & Trí tuệ Nhân tạo (IT-E10)',
        status: 'Bảo lưu',
        gpa: 6.85,
        gpa4: 2.70,
        drl: 75,
        scholarship: 'Không',
        scholarshipStatus: 'Không',
        academicWarning: 'Bình thường',
        email: 'linh.mp230008@sis.hust.edu.vn',
        phone: '0945 123 789',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        address: 'Hà Nội',
        credits: 46,
        tuition: { total: 22000000, paid: 22000000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 7.5, gk: 7.0, ck: 7.0, total: 7.0, credits: 4, letter: 'B' },
            'Đại số tuyến tính': { cc: 7.5, gk: 6.8, ck: 6.8, total: 6.8, credits: 3, letter: 'C+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 7.0, gk: 6.5, ck: 6.5, total: 6.5, credits: 3, letter: 'C+' },
            'Lập trình Hướng đối tượng': { cc: 7.5, gk: 7.0, ck: 7.0, total: 7.0, credits: 3, letter: 'B' },
            'Kiến trúc Máy tính': { cc: 7.0, gk: 6.8, ck: 6.8, total: 6.8, credits: 3, letter: 'C+' },
            'Tiếng Anh chuyên ngành': { cc: 8.0, gk: 7.2, ck: 7.2, total: 7.2, credits: 3, letter: 'B' }
        }
    },
    {
        id: 9,
        studentId: '20230009',
        fullName: 'Lê Tuấn Anh',
        gender: 'Nam',
        dob: '2005-04-18',
        class: 'IT1-01-K68',
        major: 'Khoa học Máy tính (IT1)',
        status: 'Đang học',
        gpa: 8.65,
        gpa4: 3.60,
        drl: 92,
        academicWarning: 'Bình thường',
        scholarship: 'Học bổng Loại B (Khuyến khích)',
        scholarshipStatus: 'Đã phê duyệt',
        email: 'anh.lt230009@sis.hust.edu.vn',
        phone: '0984 112 233',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        address: 'Hà Nội',
        credits: 58,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 4, letter: 'A' },
            'Đại số tuyến tính': { cc: 9.0, gk: 9.0, ck: 9.0, total: 9.0, credits: 3, letter: 'A+' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 9.5, gk: 9.0, ck: 9.0, total: 9.0, credits: 3, letter: 'A+' },
            'Lập trình Hướng đối tượng': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Kiến trúc Máy tính': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Tiếng Anh chuyên ngành': { cc: 9.0, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' }
        }
    },
    {
        id: 10,
        studentId: '20230010',
        fullName: 'Trần Minh Hoàng',
        gender: 'Nam',
        dob: '2005-10-25',
        class: 'IT1-01-K68',
        major: 'Khoa học Máy tính (IT1)',
        status: 'Đang học',
        gpa: 8.20,
        gpa4: 3.35,
        drl: 86,
        academicWarning: 'Bình thường',
        scholarship: 'Học bổng Doanh nghiệp FPT',
        scholarshipStatus: 'Đã phê duyệt',
        email: 'hoang.tm230010@sis.hust.edu.vn',
        phone: '0979 556 677',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        address: 'Thái Nguyên',
        credits: 58,
        tuition: { total: 18500000, paid: 18500000, status: 'Đã đóng' },
        subjects: {
            'Giải tích 1': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 4, letter: 'B+' },
            'Đại số tuyến tính': { cc: 8.5, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Cấu trúc dữ liệu & Thuật toán': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Lập trình Hướng đối tượng': { cc: 8.5, gk: 8.5, ck: 8.5, total: 8.5, credits: 3, letter: 'A' },
            'Kiến trúc Máy tính': { cc: 8.0, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' },
            'Tiếng Anh chuyên ngành': { cc: 8.5, gk: 8.0, ck: 8.0, total: 8.0, credits: 3, letter: 'B+' }
        }
    }
];

// Available Courses for Registration
const AVAILABLE_COURSES = [
    {
        id: 'IT3040',
        name: 'Kỹ thuật Lập trình Nâng cao',
        credits: 3,
        classRoom: 'D9-401',
        day: 'Thứ Hai',
        period: 'Tiết 1-3 (06:45 - 09:15)',
        schedule: 'Thứ Hai (Tiết 1-3)',
        lecturer: 'PGS. TS. Trần Văn Nam',
        seatsAvailable: 8,
        maxSeats: 60,
        tuition: 1650000,
        selected: true,
        category: 'Cơ sở ngành'
    },
    {
        id: 'IT3160',
        name: 'Hệ Quản trị Cơ sở Dữ liệu',
        credits: 3,
        classRoom: 'B1-204',
        day: 'Thứ Ba',
        period: 'Tiết 4-6 (09:30 - 11:55)',
        schedule: 'Thứ Ba (Tiết 4-6)',
        lecturer: 'TS. Nguyễn Thị Mai',
        seatsAvailable: 15,
        maxSeats: 60,
        tuition: 1650000,
        selected: true,
        category: 'Cốt lõi'
    },
    {
        id: 'IT4010',
        name: 'Trí tuệ Nhân tạo Ứng dụng',
        credits: 3,
        classRoom: 'C7-302',
        day: 'Thứ Tư',
        period: 'Tiết 7-9 (13:00 - 15:30)',
        schedule: 'Thứ Tư (Tiết 7-9)',
        lecturer: 'TS. Đỗ Hoàng Sơn',
        seatsAvailable: 5,
        maxSeats: 50,
        tuition: 1650000,
        selected: false,
        category: 'Chuyên ngành'
    },
    {
        id: 'IT4142',
        name: 'Phát triển Ứng dụng Web Hiện đại',
        credits: 3,
        classRoom: 'D3-501',
        day: 'Thứ Năm',
        period: 'Tiết 1-3 (06:45 - 09:15)',
        schedule: 'Thứ Năm (Tiết 1-3)',
        lecturer: 'ThS. Lê Quang Huy',
        seatsAvailable: 12,
        maxSeats: 55,
        tuition: 1650000,
        selected: true,
        category: 'Chuyên ngành'
    },
    {
        id: 'ET2100',
        name: 'Mạng Máy tính & Viễn thông',
        credits: 3,
        classRoom: 'C1-105',
        day: 'Thứ Sáu',
        period: 'Tiết 4-6 (09:30 - 11:55)',
        schedule: 'Thứ Sáu (Tiết 4-6)',
        lecturer: 'PGS. TS. Phạm Thanh Bình',
        seatsAvailable: 20,
        maxSeats: 65,
        tuition: 1650000,
        selected: false,
        category: 'Cơ sở ngành'
    },
    {
        id: 'IT4220',
        name: 'An toàn & Bảo mật Thông tin',
        credits: 3,
        classRoom: 'B1-302',
        day: 'Thứ Bảy',
        period: 'Tiết 1-3 (06:45 - 09:15)',
        schedule: 'Thứ Bảy (Tiết 1-3)',
        lecturer: 'TS. Vũ Minh Quân',
        seatsAvailable: 14,
        maxSeats: 50,
        tuition: 1650000,
        selected: false,
        category: 'Chuyên ngành'
    },
    {
        id: 'EM1010',
        name: 'Khởi nghiệp Công nghệ số',
        credits: 2,
        classRoom: 'D8-201',
        day: 'Thứ Bảy',
        period: 'Tiết 4-5 (09:30 - 11:10)',
        schedule: 'Thứ Bảy (Tiết 4-5)',
        lecturer: 'ThS. Vũ Ngọc Hân',
        seatsAvailable: 25,
        maxSeats: 80,
        tuition: 1100000,
        selected: false,
        category: 'Tự chọn'
    }
];

// Student Weekly Timetable (Chi tiết: Tiết nào, Hôm nào, Phòng nào, Thầy cô nào dạy)
const STUDENT_TIMETABLE = [
    { day: 'Thứ Hai', period: 'Tiết 1 - 3', time: '06:45 - 09:15', room: 'D9-401', course: 'Kỹ thuật Lập trình Nâng cao', code: 'IT3040', credits: 3, teacher: 'PGS. TS. Trần Văn Nam', badge: 'bg-red-100 text-red-800' },
    { day: 'Thứ Ba', period: 'Tiết 4 - 6', time: '09:30 - 11:55', room: 'B1-204', course: 'Hệ Quản trị Cơ sở Dữ liệu', code: 'IT3160', credits: 3, teacher: 'TS. Nguyễn Thị Mai', badge: 'bg-blue-100 text-blue-800' },
    { day: 'Thứ Tư', period: 'Tiết 7 - 9', time: '13:00 - 15:30', room: 'C7-302', course: 'Thực hành Lập trình OOP', code: 'IT3100', credits: 3, teacher: 'ThS. Nguyễn Văn Hải', badge: 'bg-purple-100 text-purple-800' },
    { day: 'Thứ Năm', period: 'Tiết 1 - 3', time: '06:45 - 09:15', room: 'D3-501', course: 'Phát triển Ứng dụng Web', code: 'IT4142', credits: 3, teacher: 'ThS. Lê Quang Huy', badge: 'bg-amber-100 text-amber-800' },
    { day: 'Thứ Sáu', period: 'Tiết 4 - 6', time: '09:30 - 11:55', room: 'C1-105', course: 'Tiếng Anh Khoa học Công nghệ', code: 'FL2020', credits: 2, teacher: 'ThS. Emily Roberts', badge: 'bg-emerald-100 text-emerald-800' },
    { day: 'Thứ Bảy', period: 'Tiết 7 - 10', time: '13:00 - 16:30', room: 'Sân Vận Động HUST', course: 'Giáo dục Thể chất 3 (Bóng rổ)', code: 'PE2030', credits: 1, teacher: 'ThS. Đặng Hùng Cường', badge: 'bg-orange-100 text-orange-800' }
];

// Teacher Weekly Teaching Schedule (Lịch giảng dạy & sinh hoạt lớp chủ nhiệm của Thầy cô)
const TEACHER_SCHEDULE = [
    { day: 'Thứ Hai', period: 'Tiết 4 - 6', time: '09:30 - 11:55', room: 'B1-302', course: 'Cấu trúc dữ liệu & Thuật toán', code: 'IT3011', class: 'IT1-01-K68', className: 'Khoa học Máy tính 01 - K68', studentsCount: 45 },
    { day: 'Thứ Tư', period: 'Tiết 1 - 3', time: '06:45 - 09:15', room: 'D9-401', course: 'Kỹ thuật Lập trình Nâng cao', code: 'IT3040', class: 'IT1-01-K68', className: 'Khoa học Máy tính 01 - K68', studentsCount: 45 },
    { day: 'Thứ Sáu', period: 'Tiết 7 - 9', time: '13:00 - 15:30', room: 'Lab 402 - B1', course: 'Thực hành Lập trình Chuyên sâu', code: 'IT3900', class: 'IT1-01-K68', className: 'Khoa học Máy tính 01 - K68', studentsCount: 45 },
    { day: 'Thứ Bảy', period: 'Tiết 1 - 3', time: '07:30 - 09:30', room: 'P.402 - Nhà B1', course: 'Sinh hoạt Lớp Chủ nhiệm định kỳ', code: 'SH-CN', class: 'IT1-01-K68', className: 'Khoa học Máy tính 01 - K68', studentsCount: 45 }
];

// Personal Exam Schedule (Lịch thi kết thúc học phần)
const EXAM_SCHEDULE = [
    { code: 'IT3040', name: 'Kỹ thuật Lập trình Nâng cao', date: '15/12/2026', time: '08:00 - 09:30', room: 'D9-201', sbd: '23001', type: 'Tự luận (90 phút)', status: 'Đủ điều kiện dự thi' },
    { code: 'IT3160', name: 'Hệ Quản trị Cơ sở Dữ liệu', date: '18/12/2026', time: '13:30 - 15:00', room: 'B1-105', sbd: '23001', type: 'Máy tính (90 phút)', status: 'Đủ điều kiện dự thi' },
    { code: 'IT4142', name: 'Phát triển Ứng dụng Web', date: '22/12/2026', time: '08:00 - 10:00', room: 'C7-402', sbd: '23001', type: 'Vấn đáp & Demo', status: 'Đủ điều kiện dự thi' },
    { code: 'FL2020', name: 'Tiếng Anh Khoa học CN', date: '25/12/2026', time: '10:15 - 11:45', room: 'D3-301', sbd: '23001', type: 'Trắc nghiệm máy tính', status: 'Đủ điều kiện dự thi' }
];

// Student Online Services Requests (Dịch vụ Một cửa sinh viên)
const STUDENT_REQUESTS = [
    { id: 'REQ-1042', title: 'Cấp Giấy xác nhận sinh viên (Vay vốn ngân hàng chính sách)', date: '20/10/2026', status: 'Đã ký duyệt', pickup: 'Nhận tại Bàn 1 - Tòa nhà C1' },
    { id: 'REQ-1043', title: 'Cấp Bảng điểm học tập chính thức có dấu đỏ', date: '22/10/2026', status: 'Đang xử lý', pickup: 'Dự kiến: 26/10/2026' }
];

// Classes Metadata
const INITIAL_CLASSES = [
    {
        id: 'KHMT-01',
        name: 'Khoa học Máy tính 01 - K68',
        code: 'IT1-01-K68',
        faculty: 'Trường Công nghệ Thông tin & Truyền thông',
        totalStudents: 340,
        advisor: 'PGS. TS. Nguyễn Đức Anh',
        president: 'Nguyễn Văn An',
        room: 'P.402 - Nhà B1',
        emailAdvisor: 'anh.nd@hust.edu.vn',
        phoneAdvisor: '0912 345 678'
    },
    {
        id: 'KTPM-02',
        name: 'Kỹ thuật Phần mềm 02 - K68',
        code: 'IT2-02-K68',
        faculty: 'Trường Công nghệ Thông tin & Truyền thông',
        totalStudents: 295,
        advisor: 'TS. Trần Thị Kim Oanh',
        president: 'Vũ Thảo Hương',
        room: 'P.305 - Nhà D9',
        emailAdvisor: 'oanh.ttk@hust.edu.vn',
        phoneAdvisor: '0978 112 233'
    },
    {
        id: 'HTTT-01',
        name: 'Hệ thống Thông tin 01 - K68',
        code: 'IT-E6-01-K68',
        faculty: 'Trường Công nghệ Thông tin & Truyền thông',
        totalStudents: 250,
        advisor: 'TS. Lê Hoàng Long',
        president: 'Lê Văn Cường',
        room: 'P.201 - Nhà C7',
        emailAdvisor: 'long.lh@hust.edu.vn',
        phoneAdvisor: '0904 556 677'
    },
    {
        id: 'AI-01',
        name: 'Trí tuệ Nhân tạo & DS 01 - K68',
        code: 'IT-E10-01-K68',
        faculty: 'Trường Công nghệ Thông tin & Truyền thông',
        totalStudents: 210,
        advisor: 'PGS. TS. Đỗ Hoàng Sơn',
        president: 'Phạm Thị Dung',
        room: 'P.501 - Nhà D3',
        emailAdvisor: 'son.dh@hust.edu.vn',
        phoneAdvisor: '0989 998 877'
    },
    {
        id: 'DTVT-01',
        name: 'Điện tử Viễn thông 01 - K68',
        code: 'ET1-01-K68',
        faculty: 'Trường Điện - Điện tử',
        totalStudents: 220,
        advisor: 'PGS. TS. Phạm Văn Thành',
        president: 'Hoàng Minh Đức',
        room: 'P.302 - Nhà C1',
        emailAdvisor: 'thanh.pv@hust.edu.vn',
        phoneAdvisor: '0915 223 344'
    }
];

const SEMESTER_PERFORMANCE = {
    'hk1_2025': {
        name: 'Học kỳ 1 - Năm học 2025-2026',
        labels: ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán', 'Lập trình OOP', 'Kiến trúc Máy tính'],
        gpaScores: [7.8, 8.2, 8.6, 8.4, 7.9],
        passRates: [88, 92, 94, 91, 87]
    },
    'hk2_2024': {
        name: 'Học kỳ 2 - Năm học 2024-2025',
        labels: ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán', 'Lập trình OOP', 'Kiến trúc Máy tính'],
        gpaScores: [7.5, 7.9, 8.1, 8.0, 7.6],
        passRates: [85, 89, 90, 88, 84]
    },
    'hk1_2024': {
        name: 'Học kỳ 1 - Năm học 2024-2025',
        labels: ['Giải tích 1', 'Đại số tuyến tính', 'Cấu trúc dữ liệu & Thuật toán', 'Lập trình OOP', 'Kiến trúc Máy tính'],
        gpaScores: [7.2, 7.6, 7.8, 7.7, 7.3],
        passRates: [82, 86, 88, 85, 80]
    }
};

const CLASS_DISTRIBUTION = [
    { label: 'KHMT (IT1)',   count: 340, percentage: '25.8%', color: '#B91C1C' },
    { label: 'KTPM (IT2)',   count: 295, percentage: '22.4%', color: '#2563EB' },
    { label: 'HTTT (IT-E6)', count: 250, percentage: '19.0%', color: '#10B981' },
    { label: 'AI (IT-E10)',  count: 210, percentage: '16.0%', color: '#8B5CF6' },
    { label: 'Ngành khác',   count: 220, percentage: '16.8%', color: '#F59E0B' }
];

const NOTIFICATIONS = [
    {
        id: 1,
        title: 'Thông báo xét cấp học bổng KKHT Kỳ 1',
        desc: 'Đại học Bách Khoa Hà Nội công bố danh sách sinh viên K68 đạt học bổng loại A và B.',
        time: '15 phút trước',
        unread: true,
        type: 'scholarship'
    },
    {
        id: 2,
        title: 'Mở cổng đăng ký học phần đợt 2',
        desc: 'Sinh viên hoàn thành đăng ký học phần tự chọn trước 24h00 ngày 30/10.',
        time: '2 giờ trước',
        unread: true,
        type: 'course'
    },
    {
        id: 3,
        title: 'Lịch thi kết thúc học phần đợt 1',
        desc: 'Phòng Đào tạo đã xếp phòng thi và số báo danh chính thức cho sinh viên.',
        time: 'Hôm qua',
        unread: false,
        type: 'exam'
    }
];
