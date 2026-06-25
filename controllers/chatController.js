const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `Bạn là trợ lý AI thông minh của DatSan.vn - nền tảng đặt sân bóng đá trực tuyến hàng đầu Việt Nam.

Thông tin về DatSan.vn:
- Người dùng tìm kiếm và đặt sân bóng đá trực tuyến, thanh toán bằng chuyển khoản (upload ảnh bill)
- Các loại sân: sân 5 người (5-a-side), sân 7 người (7-a-side), sân 11 người (11-a-side)
- Mỗi slot đặt sân kéo dài 1.5 giờ, khung giờ từ 06:00 đến 23:00
- Quy trình đặt sân: Vào /fields → Chọn sân → Chọn ngày & khung giờ → Upload ảnh bill chuyển khoản → Chờ admin/chủ sân duyệt
- Trạng thái đơn: pending (chờ duyệt), confirmed (đã duyệt), rejected (từ chối), cancelled (đã hủy)
- Người dùng chỉ có thể hủy đơn khi ở trạng thái pending (tại trang /history)
- Sau khi đặt thành công, hệ thống gửi email xác nhận kèm Booking Code (dạng DS-YYYYMMDD-XXXX)
- Đăng ký tài khoản tại /auth/register, đăng nhập tại /auth/login
- Xem lịch sử đặt sân tại /history
- Mỗi sân có thể có dịch vụ đi kèm như nước uống, thiết bị thể thao (chọn thêm khi checkout)
- Liên hệ hỗ trợ: support@datsan.vn hoặc 0901 234 567 (6:00–22:00 hàng ngày)

Hướng dẫn trả lời:
- Dùng tiếng Việt, thân thiện, ngắn gọn (2-4 câu)
- Khi nhắc đến trang, hãy đề cập đường dẫn (VD: "vào trang /fields")
- Không bịa đặt giá tiền hay địa điểm cụ thể
- Nếu không biết, hướng dẫn liên hệ support@datsan.vn`;

// Simple in-memory rate limit: max 20 requests per IP per minute
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 phút
  const maxRequests = 20;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  const entry = rateLimitMap.get(ip);
  if (now - entry.start > windowMs) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= maxRequests;
}

// Cleanup rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.start > 2 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ================================
// POST /api/chat
// ================================
const sendMessage = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, error: 'Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ 1 phút!' });
    }

    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống!' });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ success: false, error: 'Tin nhắn quá dài (tối đa 500 ký tự)!' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY chưa được cấu hình!');
      return res.status(503).json({ success: false, error: 'Dịch vụ AI tạm thời không khả dụng.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(message.trim());
    const reply = result.response.text();

    return res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau!',
    });
  }
};

module.exports = { sendMessage };
