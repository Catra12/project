const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

function h(text, level) {
  const levels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
  return new Paragraph({ text, heading: levels[level] || HeadingLevel.HEADING_1 });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 26, bold: opts.bold, italic: opts.italic })],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 26 })],
  });
}

function makeTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    shading: { type: ShadingType.SOLID, color: '1a56db', fill: '1a56db' },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: 'Times New Roman', size: 24, bold: true, color: 'FFFFFF' })] })],
  }));

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: 'Times New Roman', size: 24 })] })],
    })),
  }));

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: headerCells }), ...dataRows] });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 26 } },
    },
  },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
    children: [
      // BÌA
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC', font: 'Times New Roman', size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'KHOA CÔNG NGHỆ THÔNG TIN', font: 'Times New Roman', size: 28, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: 'ĐỀ CƯƠNG ĐỒ ÁN MÔN HỌC', font: 'Times New Roman', size: 40, bold: true, color: '1a56db' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'Môn học: Thiết Kế Web', font: 'Times New Roman', size: 30, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Tên đề tài:', font: 'Times New Roman', size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ TRỰC TUYẾN', font: 'Times New Roman', size: 34, bold: true, color: '1a56db' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Nhóm thực hiện: ....................................................', font: 'Times New Roman', size: 26 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'MSSV: ....................................................................', font: 'Times New Roman', size: 26 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Lớp: .......................................................................', font: 'Times New Roman', size: 26 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Giảng viên hướng dẫn: .............................................', font: 'Times New Roman', size: 26 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: 'TP. Hồ Chí Minh, tháng 5 năm 2026', font: 'Times New Roman', size: 26, italic: true })] }),

      // NỘI DUNG
      h('1. GIỚI THIỆU ĐỀ TÀI', 1),
      h('1.1. Lý do chọn đề tài', 2),
      p('Hiện nay, việc đặt sân bóng đá vẫn còn khá thủ công — người chơi phải gọi điện hỏi giờ trống, chủ sân phải ghi tay vào sổ, dễ xảy ra tình trạng đặt trùng lịch. Điều đó gây bất tiện cho cả hai phía.'),
      p('Vì vậy, nhóm quyết định xây dựng một ứng dụng web đơn giản giúp người chơi có thể xem lịch và đặt sân trực tuyến, còn chủ sân và quản trị viên có thể quản lý đơn đặt dễ dàng hơn.'),

      h('1.2. Mục tiêu đề tài', 2),
      bullet('Xây dựng được một ứng dụng web hoàn chỉnh có thể chạy được trên máy tính cá nhân.'),
      bullet('Người dùng có thể đăng ký, đăng nhập, xem danh sách sân và đặt sân theo giờ.'),
      bullet('Chủ sân có thể quản lý sân và xem đơn đặt của sân mình.'),
      bullet('Admin có thể duyệt hoặc từ chối đơn đặt, quản lý người dùng và sân bóng.'),
      bullet('Áp dụng được các kiến thức đã học về HTML/CSS, JavaScript, Node.js và cơ sở dữ liệu.'),

      h('1.3. Phạm vi thực hiện', 2),
      p('Đề tài tập trung vào phần web (giao diện trình duyệt) và các chức năng cốt lõi của hệ thống đặt sân. Ứng dụng mobile, tích hợp cổng thanh toán tự động và chatbot AI chưa được đưa vào phạm vi đề tài này.'),

      h('2. PHÂN TÍCH YÊU CẦU', 1),
      h('2.1. Đối tượng sử dụng', 2),
      p('Hệ thống có 3 loại người dùng với quyền hạn khác nhau:'),
      makeTable(
        ['Vai trò', 'Mô tả'],
        [
          ['Người dùng (User)', 'Đăng ký tài khoản, tìm sân và đặt sân theo giờ'],
          ['Chủ sân (Field Owner)', 'Quản lý sân của mình, xem lịch đặt và doanh thu'],
          ['Quản trị viên (Admin)', 'Quản lý toàn bộ hệ thống, duyệt đơn, duyệt sân'],
        ]
      ),

      h('2.2. Yêu cầu chức năng', 2),
      h('Phía người dùng (User):', 3),
      bullet('Đăng ký và đăng nhập tài khoản'),
      bullet('Xem danh sách sân bóng, lọc theo loại sân (5 người, 7 người, 11 người)'),
      bullet('Xem chi tiết sân: thông tin, hình ảnh, giá thuê, lịch khung giờ trống'),
      bullet('Chọn khung giờ và đặt sân, có thể chọn thêm dịch vụ đi kèm (nước uống, dụng cụ...)'),
      bullet('Upload ảnh bill chuyển khoản để xác nhận thanh toán'),
      bullet('Xem lịch sử đặt sân và trạng thái đơn (chờ duyệt, đã duyệt, bị từ chối)'),
      bullet('Hủy đơn đặt khi đơn còn đang chờ duyệt'),
      bullet('Cập nhật thông tin cá nhân'),

      h('Phía chủ sân (Field Owner):', 3),
      bullet('Thêm mới và chỉnh sửa thông tin sân của mình'),
      bullet('Quản lý dịch vụ đi kèm (thêm/sửa/xóa)'),
      bullet('Xem danh sách đơn đặt và lịch sân theo tuần'),
      bullet('Cài đặt thông tin ngân hàng và mã QR để nhận tiền'),
      bullet('Nhận thông báo khi có đơn đặt mới'),

      h('Phía quản trị viên (Admin):', 3),
      bullet('Xem tổng quan hệ thống: số đơn hôm nay, doanh thu, số sân đang hoạt động'),
      bullet('Duyệt hoặc từ chối đơn đặt sân kèm lý do'),
      bullet('Quản lý danh sách sân: thêm, sửa, đổi trạng thái'),
      bullet('Duyệt sân do chủ sân đăng ký'),
      bullet('Quản lý người dùng: xem danh sách, khóa tài khoản'),
      bullet('Xem lịch sân theo tuần dưới dạng bảng'),

      h('2.3. Yêu cầu phi chức năng', 2),
      bullet('Giao diện hiển thị được trên trình duyệt Chrome/Edge'),
      bullet('Không để xảy ra tình trạng 2 người đặt cùng 1 khung giờ (tránh double booking)'),
      bullet('Thông tin mật khẩu phải được mã hóa trước khi lưu vào cơ sở dữ liệu'),

      h('3. THIẾT KẾ HỆ THỐNG', 1),
      h('3.1. Công nghệ sử dụng', 2),
      makeTable(
        ['Thành phần', 'Công nghệ'],
        [
          ['Backend (máy chủ)', 'Node.js + Express.js'],
          ['Template (Giao diện)', 'EJS (Embedded JavaScript Templates)'],
          ['Cơ sở dữ liệu', 'MongoDB (thông qua thư viện Mongoose)'],
          ['Lưu trữ ảnh', 'Cloudinary (lưu ảnh sân và bill thanh toán)'],
          ['Session / Đăng nhập', 'express-session + connect-mongo'],
          ['Mã hóa mật khẩu', 'bcryptjs'],
          ['Gửi email thông báo', 'Nodemailer'],
          ['Upload file', 'Multer'],
          ['Chạy thử (dev)', 'Nodemon'],
        ]
      ),

      h('3.2. Cấu trúc thư mục dự án', 2),
      p('Dự án được tổ chức theo mô hình MVC (Model – View – Controller):'),
      bullet('app.js — File khởi động server chính'),
      bullet('config/ — Cấu hình kết nối database, session, cloudinary'),
      bullet('controllers/ — Xử lý logic của từng chức năng'),
      bullet('models/ — Định nghĩa cấu trúc dữ liệu (MongoDB Schema)'),
      bullet('routes/ — Định tuyến các URL của ứng dụng'),
      bullet('views/ — Giao diện EJS (admin, owner, bookings, fields, auth)'),
      bullet('middlewares/ — Kiểm tra quyền, upload file, chống double booking'),
      bullet('public/ — File CSS, JS tĩnh phục vụ giao diện'),
      bullet('utils/ — Các hàm tiện ích (gửi email, sinh mã đặt sân...)'),

      h('3.3. Các Model dữ liệu chính', 2),
      h('User (Người dùng)', 3),
      bullet('Họ tên, email, mật khẩu (đã mã hóa bằng bcrypt), số điện thoại'),
      bullet('Vai trò: user / field_owner / admin'),
      bullet('Thông tin ngân hàng và mã QR (dành cho chủ sân)'),
      bullet('Trạng thái tài khoản: đang hoạt động / bị khóa'),

      h('Field (Sân bóng)', 3),
      bullet('Tên sân, địa chỉ, thành phố, quận/huyện'),
      bullet('Loại sân: 5 người (5-a-side) / 7 người / 11 người'),
      bullet('Giá thuê mỗi slot, hình ảnh, tiện ích đi kèm'),
      bullet('Trạng thái: đang hoạt động / bảo trì'),
      bullet('Trạng thái duyệt: chờ duyệt / đã duyệt / bị từ chối'),

      h('TimeSlot (Khung giờ)', 3),
      bullet('Gắn với sân cụ thể và ngày cụ thể'),
      bullet('Giờ bắt đầu và kết thúc — mỗi slot dài 1.5 tiếng, từ 06:00 đến 23:00'),
      bullet('Trạng thái: còn trống / đang giữ chỗ / đã đặt'),

      h('Booking (Đơn đặt sân)', 3),
      bullet('Gắn với người dùng, sân, và khung giờ đã chọn'),
      bullet('Ngày đặt, giờ bắt đầu, giờ kết thúc'),
      bullet('Giá sân + giá dịch vụ = tổng tiền thanh toán'),
      bullet('Ảnh bill chuyển khoản (lưu trên Cloudinary)'),
      bullet('Mã đơn tự sinh (dạng: DS-YYYYMMDD-XXXX)'),
      bullet('Trạng thái: chờ duyệt / đã xác nhận / bị từ chối / đã hủy'),

      h('Service (Dịch vụ đi kèm)', 3),
      bullet('Tên dịch vụ, giá, đơn vị tính'),
      bullet('Phân loại: đồ uống / thiết bị / thực phẩm / khác'),
      bullet('Gắn với từng sân cụ thể, do chủ sân tự thêm'),

      h('4. MÔ TẢ CHỨC NĂNG CHI TIẾT', 1),
      h('4.1. Luồng đặt sân', 2),
      p('Các bước người dùng thực hiện khi đặt sân:'),
      bullet('Bước 1: Đăng nhập vào hệ thống'),
      bullet('Bước 2: Vào trang danh sách sân, tìm và chọn sân muốn đặt'),
      bullet('Bước 3: Xem lịch khung giờ còn trống, chọn ngày và giờ phù hợp'),
      bullet('Bước 4: Chuyển sang trang thanh toán — xem tóm tắt thông tin, chọn thêm dịch vụ nếu muốn'),
      bullet('Bước 5: Chuyển khoản và upload ảnh bill xác nhận'),
      bullet('Bước 6: Hệ thống tạo đơn với trạng thái "chờ duyệt", gửi email xác nhận'),
      bullet('Bước 7: Admin xem bill và duyệt hoặc từ chối — người dùng nhận email kết quả'),
      p('Lưu ý: Để tránh đặt trùng lịch, hệ thống sẽ khóa slot ngay khi bắt đầu quá trình thanh toán. Nếu sau 15 phút không hoàn thành, slot sẽ tự động được nhả ra.'),

      h('4.2. Giao diện quản trị (Admin)', 2),
      bullet('Dashboard: Hiển thị số liệu tổng quan (số đơn hôm nay, doanh thu tuần, tỉ lệ đặt sân). Có biểu đồ theo dõi xu hướng đặt sân theo ngày/tuần.'),
      bullet('Quản lý đơn: Xem danh sách đơn, lọc theo trạng thái và sân, duyệt hoặc từ chối kèm lý do.'),
      bullet('Quản lý sân: Xem, thêm, sửa thông tin sân; duyệt sân do chủ sân gửi lên.'),
      bullet('Quản lý người dùng: Xem danh sách tài khoản, thay đổi trạng thái tài khoản.'),
      bullet('Lịch sân: Xem lịch đặt sân theo tuần dưới dạng bảng.'),

      h('4.3. Giao diện chủ sân (Field Owner)', 2),
      bullet('Dashboard: Thống kê đơn và doanh thu của sân mình theo tuần/tháng.'),
      bullet('Quản lý sân: Thêm mới, chỉnh sửa thông tin sân, upload ảnh lên Cloudinary.'),
      bullet('Dịch vụ: Thêm/sửa/xóa các dịch vụ đi kèm của sân (nước uống, thuê dụng cụ...).'),
      bullet('Đơn đặt: Xem và tra cứu các đơn đặt sân của mình theo trạng thái.'),
      bullet('Lịch sân: Xem lịch đặt theo tuần.'),
      bullet('Cài đặt: Cập nhật thông tin ngân hàng và upload mã QR nhận tiền.'),

      h('5. PHÂN CÔNG CÔNG VIỆC', 1),
      makeTable(
        ['Thành viên', 'Công việc đảm nhận'],
        [
          ['[Tên thành viên 1]', 'Thiết kế giao diện, viết views EJS, CSS'],
          ['[Tên thành viên 2]', 'Xây dựng backend: controllers, routes, models'],
          ['[Cả nhóm]', 'Tích hợp, kiểm tra chức năng, viết báo cáo'],
        ]
      ),

      h('6. KẾ HOẠCH THỰC HIỆN', 1),
      makeTable(
        ['Thời gian', 'Nội dung công việc'],
        [
          ['Tuần 1 – 2', 'Phân tích yêu cầu, thiết kế database, dựng cấu trúc project'],
          ['Tuần 3 – 4', 'Xây dựng chức năng xác thực (đăng ký, đăng nhập, phân quyền)'],
          ['Tuần 5 – 6', 'Xây dựng chức năng xem sân và đặt sân (booking flow)'],
          ['Tuần 7 – 8', 'Xây dựng giao diện admin và chủ sân'],
          ['Tuần 9 – 10', 'Tích hợp Cloudinary, gửi email, hoàn thiện giao diện'],
          ['Tuần 11 – 12', 'Kiểm tra, sửa lỗi, viết báo cáo, chuẩn bị demo'],
        ]
      ),

      h('7. KẾT QUẢ ĐẠT ĐƯỢC', 1),
      p('Sau khi hoàn thành đề tài, nhóm đã xây dựng được ứng dụng web với các chức năng:'),
      bullet('Đăng ký / đăng nhập với phân quyền 3 loại tài khoản (user, field_owner, admin)'),
      bullet('Xem và tìm kiếm sân bóng theo loại sân'),
      bullet('Đặt sân theo khung giờ, có chọn thêm dịch vụ đi kèm'),
      bullet('Upload ảnh bill xác nhận thanh toán lên Cloudinary'),
      bullet('Admin duyệt / từ chối đơn, hệ thống gửi email thông báo tự động'),
      bullet('Chủ sân quản lý sân, dịch vụ và xem doanh thu'),
      bullet('Xem lịch sử đặt sân, hủy đơn khi đơn còn chờ duyệt'),
      bullet('Admin dashboard với biểu đồ thống kê và lịch sân theo tuần'),
      bullet('Tự động tránh đặt trùng lịch (giữ slot và nhả slot sau 15 phút)'),
      bullet('Gửi email xác nhận sau khi đặt sân và sau khi admin duyệt/từ chối'),

      h('8. HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN', 1),
      h('8.1. Hạn chế hiện tại', 2),
      bullet('Chưa tích hợp cổng thanh toán tự động — người dùng vẫn phải chuyển khoản tay và upload bill'),
      bullet('Chưa có ứng dụng mobile (chỉ hỗ trợ trình duyệt)'),
      bullet('Chưa có tính năng đánh giá và bình luận sân'),
      bullet('Tìm kiếm sân còn đơn giản, chưa hỗ trợ lọc theo vị trí bản đồ'),

      h('8.2. Hướng phát triển tiếp theo', 2),
      bullet('Tích hợp thanh toán tự động qua VNPay hoặc Momo'),
      bullet('Thêm tính năng đánh giá sân sau khi sử dụng'),
      bullet('Tìm kiếm sân gần vị trí người dùng bằng bản đồ'),
      bullet('Nhóm đang tìm hiểu thêm về chatbot hỗ trợ gợi ý sân phù hợp'),

      h('9. KẾT LUẬN', 1),
      p('Qua quá trình thực hiện đề tài, nhóm đã học được cách tổ chức một dự án web theo mô hình MVC, làm việc với MongoDB và Node.js, xây dựng hệ thống phân quyền nhiều vai trò, và giải quyết một số vấn đề thực tế như tránh đặt trùng lịch hay xử lý upload file lên cloud.'),
      p('Đây là lần đầu nhóm xây dựng một ứng dụng web tương đối đầy đủ từ đầu đến cuối, nên còn nhiều chỗ chưa được tối ưu. Tuy nhiên, nhóm đã cố gắng để ứng dụng có thể chạy được và đáp ứng đủ yêu cầu đề ra ban đầu.'),

      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: 'TP. Hồ Chí Minh, tháng 5 năm 2026', font: 'Times New Roman', size: 26, italic: true })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 200 }, children: [new TextRun({ text: 'Nhóm thực hiện', font: 'Times New Roman', size: 26, bold: true })] }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = path.join(__dirname, 'De_Cuong_Do_An_Web.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Xuất file Word thành công:', outPath);
});
