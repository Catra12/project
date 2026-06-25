const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import Models
const User = require('./models/User');
const Field = require('./models/Field');
const Service = require('./models/Service');
const TimeSlot = require('./models/TimeSlot');
const Booking = require('./models/Booking');
const BookingService = require('./models/BookingService');

// Helper to format date as local YYYY-MM-DD
function toLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate random booking code
function generateMockBookingCode(date) {
  const ymd = toLocalDateString(date).replace(/-/g, '');
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `DS-${ymd}-${rand}`;
}

const seedDatabase = async () => {
  try {
    // 1. Connect to Database
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_design_final';
    console.log(`Connecting to database: ${uri}...`);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.');

    // 2. Clear existing collections
    console.log('Cleaning old data...');
    await BookingService.deleteMany({});
    await Booking.deleteMany({});
    await TimeSlot.deleteMany({});
    await Service.deleteMany({});
    await Field.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Wiped all existing documents from collections.');

    // 3. Create Users
    console.log('Creating users (admin, owners, and customers)...');
    
    // We will save users one by one to ensure the pre('save') hash password hook runs correctly
    const rawUsers = [
      {
        name: 'Quản trị viên',
        email: 'admin@gmail.com',
        password: 'password123',
        phone: '0987654321',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Nguyễn Văn Toàn (Chủ sân Hà Nội)',
        email: 'owner1@gmail.com',
        password: 'password123',
        phone: '0912345678',
        role: 'field_owner',
        commissionRate: 5,
        isActive: true,
        bankInfo: {
          bankName: 'Vietcombank',
          accountNumber: '1029384756',
          accountName: 'NGUYEN VAN TOAN',
        },
      },
      {
        name: 'Trần Thị Mai (Chủ sân TP.HCM)',
        email: 'owner2@gmail.com',
        password: 'password123',
        phone: '0988888888',
        role: 'field_owner',
        commissionRate: 6,
        isActive: true,
        bankInfo: {
          bankName: 'Techcombank',
          accountNumber: '1903456789',
          accountName: 'TRAN THI MAI',
        },
      },
      {
        name: 'Lê Hoàng Tùng',
        email: 'user1@gmail.com',
        password: 'password123',
        phone: '0312345678',
        role: 'user',
        isActive: true,
      },
      {
        name: 'Phạm Minh Đức',
        email: 'user2@gmail.com',
        password: 'password123',
        phone: '0345678901',
        role: 'user',
        isActive: true,
      },
      {
        name: 'Nguyễn Thị Lan',
        email: 'user3@gmail.com',
        password: 'password123',
        phone: '0398765432',
        role: 'user',
        isActive: true,
      },
    ];

    const users = [];
    for (const u of rawUsers) {
      const newUser = new User(u);
      await newUser.save();
      users.push(newUser);
      console.log(`- Created user: ${u.email} (${u.role})`);
    }

    const adminUser = users.find(u => u.role === 'admin');
    const ownerHN = users.find(u => u.email === 'owner1@gmail.com');
    const ownerHCM = users.find(u => u.email === 'owner2@gmail.com');
    const customer1 = users.find(u => u.email === 'user1@gmail.com');
    const customer2 = users.find(u => u.email === 'user2@gmail.com');
    const customer3 = users.find(u => u.email === 'user3@gmail.com');

    // 4. Create Fields
    console.log('Creating football fields...');
    const rawFields = [
      // Hanoi Fields (Owner: ownerHN)
      {
        name: 'Sân bóng Hàng Đẫy',
        address: 'Số 9 Trịnh Hoài Đức',
        city: 'Hà Nội',
        district: 'Đống Đa',
        type: '11-a-side',
        pricePerSlot: 1500000,
        images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800'],
        description: 'Sân bóng cỏ tự nhiên chất lượng quốc tế, có hệ thống đèn chiếu sáng hiện đại, bãi đỗ xe rộng rãi và khu căng tin phục vụ giải khát.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Bãi đỗ xe', 'Căng tin', 'Wifi miễn phí', 'Phòng thay đồ', 'Đèn chiếu sáng'],
        owner: ownerHN._id,
        fieldCode: 'HD11',
      },
      {
        name: 'Sân bóng Mỹ Đình',
        address: 'Đường Lê Đức Thọ',
        city: 'Hà Nội',
        district: 'Nam Từ Liêm',
        type: '11-a-side',
        pricePerSlot: 2000000,
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800'],
        description: 'Sân cỏ chất lượng cao nhất, thích hợp cho các trận đấu giao hữu chuyên nghiệp, sự kiện công ty lớn.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Bãi đỗ xe ô tô', 'Khán đài', 'Hệ thống đèn LED', 'Phòng tắm nước nóng'],
        owner: ownerHN._id,
        fieldCode: 'MD11',
      },
      {
        name: 'Sân cỏ nhân tạo Thượng Đình',
        address: 'Ngõ 129 Nguyễn Trãi',
        city: 'Hà Nội',
        district: 'Thanh Xuân',
        type: '7-a-side',
        pricePerSlot: 800000,
        images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800'],
        description: 'Sân bóng 7 người lý tưởng cho dân phủi Hà Nội, cỏ mềm, độ nảy tốt, nằm ở khu vực giao thông thuận lợi.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Bãi đỗ xe máy', 'Căng tin', 'Đèn chiếu sáng'],
        owner: ownerHN._id,
        fieldCode: 'TD07',
      },
      {
        name: 'Sân bóng Bách Khoa',
        address: 'Số 1 Đại Cồ Việt',
        city: 'Hà Nội',
        district: 'Hai Bà Trưng',
        type: '5-a-side',
        pricePerSlot: 500000,
        images: ['https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?q=80&w=800'],
        description: 'Sân 5 người mặt cỏ nhân tạo chất lượng tốt nằm ngay trong khuôn viên Đại Học Bách Khoa Hà Nội, phục vụ sinh viên và giới văn phòng lân cận.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Căng tin', 'Thuê đồ đá bóng', 'Đèn chiếu sáng'],
        owner: ownerHN._id,
        fieldCode: 'BK05',
      },
      // HCM Fields (Owner: ownerHCM)
      {
        name: 'Sân bóng Bình Thạnh',
        address: '12 Điện Biên Phủ',
        city: 'Hồ Chí Minh',
        district: 'Bình Thạnh',
        type: '7-a-side',
        pricePerSlot: 900000,
        images: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800'],
        description: 'Sân 7 người mặt cỏ dày, êm ái, bọc cao su chuẩn. Đội ngũ phục vụ chuyên nghiệp nhiệt tình.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Bãi đỗ xe', 'Wifi', 'Đèn chiếu sáng', 'Nước uống miễn phí'],
        owner: ownerHCM._id,
        fieldCode: 'BT07',
      },
      {
        name: 'Sân bóng Hoa Lư',
        address: 'Số 2 Đinh Tiên Hoàng',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        type: '5-a-side',
        pricePerSlot: 600000,
        images: ['https://images.unsplash.com/photo-1568194157720-8eae79a37812?q=80&w=800'],
        description: 'Nằm ở vị trí đắc địa trung tâm Quận 1, hệ thống sân 5 người chất lượng cao, thoáng đãng, cơ sở vật chất đầy đủ.',
        status: 'active',
        approvalStatus: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        submittedByOwner: true,
        facilities: ['Trung tâm thể thao', 'Khán đài', 'Đèn chiếu sáng tiêu chuẩn'],
        owner: ownerHCM._id,
        fieldCode: 'HL05',
      },
    ];

    const fields = await Field.create(rawFields);
    console.log(`✅ Created ${fields.length} soccer fields.`);

    // 5. Create Services for each field
    console.log('Creating services for each soccer field...');
    const services = [];
    const serviceTemplates = [
      { name: 'Nước suối Aquafina 500ml', price: 10000, unit: 'chai', category: 'beverage', description: 'Nước lọc tinh khiết ướp lạnh' },
      { name: 'Nước tăng lực Sting dâu', price: 15000, unit: 'lon', category: 'beverage', description: 'Nước tăng lực ướp lạnh giải khát nhanh' },
      { name: 'Nước điện giải Pocari Sweat', price: 20000, unit: 'chai', category: 'beverage', description: 'Bù nước và muối khoáng khi vận động' },
      { name: 'Thuê bộ áo Bib chia đội', price: 20000, unit: 'bộ/trận', category: 'rental', description: 'Bộ áo lưới phân biệt đội hình (10 cái)' },
      { name: 'Thuê giày đá bóng', price: 40000, unit: 'đôi/trận', category: 'rental', description: 'Giày cỏ nhân tạo đầy đủ size từ 39-44' },
      { name: 'Mì ly xúc xích ăn liền', price: 25000, unit: 'bát', category: 'food', description: 'Nạp năng lượng sau trận đấu' },
    ];

    for (const field of fields) {
      for (const t of serviceTemplates) {
        const newSvc = await Service.create({
          field: field._id,
          name: t.name,
          price: t.price,
          unit: t.unit,
          category: t.category,
          description: t.description,
          isActive: true,
        });
        services.push(newSvc);
      }
    }
    console.log(`✅ Created ${services.length} services in total.`);

    // 6. Generate Time Slots
    console.log('Generating time slots for each field for a 5-day span (yesterday, today, and next 3 days)...');
    
    const dates = [];
    for (let i = -1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const allSlots = [];
    for (const field of fields) {
      for (const date of dates) {
        const slots = await TimeSlot.generateSlotsForDate(field._id, date);
        allSlots.push(...slots);
      }
    }
    console.log(`✅ Generated ${allSlots.length} time slots.`);

    // 7. Create Bookings (Yesterday, Today, and Tomorrow)
    console.log('Seeding bookings & booking services...');

    // Select a few slots to book
    // Slots structure generated by static is: 06:00, 07:30, 09:00, 10:50 (10:30), 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00
    // Let's filter slot objects from the DB since generateSlotsForDate inserted them and returned them.
    // Fetch slots from DB to have actual mongoose docs
    const dbSlots = await TimeSlot.find({});

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(0, 0, 0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(0, 0, 0, 0);

    const bookingsToCreate = [];

    // Helper to calculate total pricing & commissions
    const buildBookingData = async (customer, field, slot, date, status, paymentImage = null, rejectedReason = null) => {
      const basePrice = field.pricePerSlot;
      
      // Select 1-2 random services of this field
      const fieldServices = services.filter(s => s.field.toString() === field._id.toString());
      const selectedServices = [];
      let servicesTotal = 0;
      
      if (fieldServices.length > 0) {
        // Pick 1 to 2 services
        const numServices = Math.floor(Math.random() * 2) + 1;
        const shuffled = fieldServices.sort(() => 0.5 - Math.random());
        const chosen = shuffled.slice(0, numServices);

        for (const svc of chosen) {
          const qty = Math.floor(Math.random() * 3) + 1; // qty 1 to 3
          servicesTotal += svc.price * qty;
          selectedServices.push({
            service: svc._id,
            name: svc.name,
            price: svc.price,
            quantity: qty,
            subtotal: svc.price * qty,
          });
        }
      }

      const finalTotal = basePrice + servicesTotal;
      const ownerUser = users.find(u => u._id.toString() === field.owner.toString());
      const commissionRate = ownerUser?.commissionRate || 5;
      const commissionAmount = Math.round(finalTotal * (commissionRate / 100));
      const ownerRevenue = finalTotal - commissionAmount;

      return {
        bookingData: {
          user: customer._id,
          field: field._id,
          timeSlot: slot._id,
          date: date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalPrice: finalTotal,
          basePrice,
          servicesTotal,
          finalTotal,
          paymentImage: paymentImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400',
          status,
          rejectedReason,
          approvedBy: status === 'confirmed' || status === 'rejected' ? adminUser._id : null,
          approvedAt: status === 'confirmed' || status === 'rejected' ? new Date(date) : null,
          commissionAmount,
          ownerRevenue,
          isRevenueCalculated: status === 'confirmed',
          bookingCode: generateMockBookingCode(date),
        },
        services: selectedServices,
      };
    };

    // Booking #1: Yesterday, Confirmed (Sân Hàng Đẫy - customer1)
    const slotY1 = dbSlots.find(s => s.field.toString() === fields[0]._id.toString() && toLocalDateString(s.date) === toLocalDateString(yesterdayDate) && s.startTime === '18:00');
    if (slotY1) {
      const bData = await buildBookingData(customer1, fields[0], slotY1, yesterdayDate, 'confirmed');
      bookingsToCreate.push({ ...bData, slotRef: slotY1, slotStatus: 'booked' });
    }

    // Booking #2: Yesterday, Confirmed (Sân Bình Thạnh - customer2)
    const slotY2 = dbSlots.find(s => s.field.toString() === fields[4]._id.toString() && toLocalDateString(s.date) === toLocalDateString(yesterdayDate) && s.startTime === '19:30');
    if (slotY2) {
      const bData = await buildBookingData(customer2, fields[4], slotY2, yesterdayDate, 'confirmed');
      bookingsToCreate.push({ ...bData, slotRef: slotY2, slotStatus: 'booked' });
    }

    // Booking #3: Today, Confirmed (Sân Mỹ Đình - customer3)
    const slotT1 = dbSlots.find(s => s.field.toString() === fields[1]._id.toString() && toLocalDateString(s.date) === toLocalDateString(todayDate) && s.startTime === '16:30');
    if (slotT1) {
      const bData = await buildBookingData(customer3, fields[1], slotT1, todayDate, 'confirmed');
      bookingsToCreate.push({ ...bData, slotRef: slotT1, slotStatus: 'booked' });
    }

    // Booking #4: Today, Pending (Sân Thượng Đình - customer1)
    const slotT2 = dbSlots.find(s => s.field.toString() === fields[2]._id.toString() && toLocalDateString(s.date) === toLocalDateString(todayDate) && s.startTime === '19:30');
    if (slotT2) {
      const bData = await buildBookingData(customer1, fields[2], slotT2, todayDate, 'pending');
      bookingsToCreate.push({ ...bData, slotRef: slotT2, slotStatus: 'pending' });
    }

    // Booking #5: Today, Rejected (Sân Bách Khoa - customer2)
    const slotT3 = dbSlots.find(s => s.field.toString() === fields[3]._id.toString() && toLocalDateString(s.date) === toLocalDateString(todayDate) && s.startTime === '15:00');
    if (slotT3) {
      const bData = await buildBookingData(customer2, fields[3], slotT3, todayDate, 'rejected', null, 'Ảnh bill mờ, không khớp số tiền giao dịch.');
      bookingsToCreate.push({ ...bData, slotRef: slotT3, slotStatus: 'available' });
    }

    // Booking #6: Today, Cancelled (Sân Hoa Lư - customer3)
    const slotT4 = dbSlots.find(s => s.field.toString() === fields[5]._id.toString() && toLocalDateString(s.date) === toLocalDateString(todayDate) && s.startTime === '18:00');
    if (slotT4) {
      const bData = await buildBookingData(customer3, fields[5], slotT4, todayDate, 'cancelled', null, 'Người dùng tự hủy đơn');
      bookingsToCreate.push({ ...bData, slotRef: slotT4, slotStatus: 'available' });
    }

    // Booking #7: Tomorrow, Confirmed (Sân Hàng Đẫy - customer2)
    const slotTm1 = dbSlots.find(s => s.field.toString() === fields[0]._id.toString() && toLocalDateString(s.date) === toLocalDateString(tomorrowDate) && s.startTime === '19:30');
    if (slotTm1) {
      const bData = await buildBookingData(customer2, fields[0], slotTm1, tomorrowDate, 'confirmed');
      bookingsToCreate.push({ ...bData, slotRef: slotTm1, slotStatus: 'booked' });
    }

    // Booking #8: Tomorrow, Pending (Sân Bình Thạnh - customer3)
    const slotTm2 = dbSlots.find(s => s.field.toString() === fields[4]._id.toString() && toLocalDateString(s.date) === toLocalDateString(tomorrowDate) && s.startTime === '18:00');
    if (slotTm2) {
      const bData = await buildBookingData(customer3, fields[4], slotTm2, tomorrowDate, 'pending');
      bookingsToCreate.push({ ...bData, slotRef: slotTm2, slotStatus: 'pending' });
    }

    // Actually write the bookings and bookingServices to DB and update slot status
    for (const b of bookingsToCreate) {
      const bookingDoc = await Booking.create(b.bookingData);
      
      // Update Slot
      await TimeSlot.findByIdAndUpdate(b.slotRef._id, {
        status: b.slotStatus,
        bookedBy: b.slotStatus !== 'available' ? b.bookingData.user : null,
      });

      // Create BookingServices
      if (b.services.length > 0) {
        const servicesData = b.services.map(s => ({
          booking: bookingDoc._id,
          service: s.service,
          name: s.name,
          price: s.price,
          quantity: s.quantity,
          subtotal: s.subtotal,
        }));
        await BookingService.insertMany(servicesData);
      }

      console.log(`- Created booking ${bookingDoc.bookingCode}: status=${bookingDoc.status}, field=${b.bookingData.field.name || 'Field'}`);
    }

    console.log('✅ Created bookings.');
    console.log('\n=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    console.log('Here are credentials you can use to login:');
    console.log('1. Admin:');
    console.log('   - Email: admin@gmail.com');
    console.log('   - Password: password123');
    console.log('2. Field Owner (Hanoi Fields):');
    console.log('   - Email: owner1@gmail.com');
    console.log('   - Password: password123');
    console.log('3. Field Owner (TP.HCM Fields):');
    console.log('   - Email: owner2@gmail.com');
    console.log('   - Password: password123');
    console.log('4. Standard Customers:');
    console.log('   - Email: user1@gmail.com / user2@gmail.com / user3@gmail.com');
    console.log('   - Password: password123');
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Mongoose connection closed.');
    process.exit(0);
  }
};

seedDatabase();
