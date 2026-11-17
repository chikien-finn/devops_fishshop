// Danh mục dữ liệu hành chính 63 Tỉnh/Thành phố Việt Nam phân theo 3 miền
export const VIETNAM_PROVINCES = [
  // --- MIỀN TRUNG ---
  {
    id: 'da-nang',
    name: 'Thành phố Đà Nẵng',
    region: 'central',
    districts: [
      {
        id: 'hai-chau',
        name: 'Quận Hải Châu',
        wards: [
          'Phường Thạch Thang',
          'Phường Hải Châu 1',
          'Phường Hải Châu 2',
          'Phường Thuận Phước',
          'Phường Thanh Bình',
          'Phường Phước Ninh',
          'Phường Nam Dương',
          'Phường Bình Hiên',
          'Phường Bình Thuận',
          'Phường Hòa Cường Bắc',
          'Phường Hòa Cường Nam',
          'Phường Hòa Thuận Đông',
          'Phường Hòa Thuận Tây',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Nguyễn Văn Linh',
          'Đường Bạch Đằng',
          'Đường Trần Phú',
          'Đường Lê Duẩn',
          'Đường 2 Tháng 9',
          'Đường Hùng Vương',
          'Đường Phan Châu Trinh',
          'Đường Hoàng Diệu',
          'Đường Trưng Nữ Vương',
          'Đường 3 Tháng 2',
        ],
      },
      {
        id: 'thanh-khe',
        name: 'Quận Thanh Khê',
        wards: [
          'Phường Vĩnh Trung',
          'Phường Tân Chính',
          'Phường Thạc Gián',
          'Phường Chính Gián',
          'Phường Tam Thuận',
          'Phường Xuân Hà',
          'Phường An Khê',
          'Phường Thanh Khê Đông',
          'Phường Thanh Khê Tây',
          'Phường Hòa Khê',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Điện Biên Phủ',
          'Đường Nguyễn Tất Thành',
          'Đường Hà Huy Tập',
          'Đường Dũng Sĩ Thanh Khê',
          'Đường Trần Cao Vân',
        ],
      },
      {
        id: 'son-tra',
        name: 'Quận Sơn Trà',
        wards: [
          'Phường An Hải Bắc',
          'Phường An Hải Tây',
          'Phường An Hải Đông',
          'Phường Phước Mỹ',
          'Phường Mân Thái',
          'Phường Thọ Quang',
          'Phường Nại Hiên Đông',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Võ Nguyên Giáp',
          'Đường Phạm Văn Đồng',
          'Đường Ngô Quyền',
          'Đường Trần Hưng Đạo',
          'Đường Hoàng Sa',
        ],
      },
      {
        id: 'ngu-hanh-son',
        name: 'Quận Ngũ Hành Sơn',
        wards: [
          'Phường Mỹ An',
          'Phường Khuê Mỹ',
          'Phường Hòa Quý',
          'Phường Hòa Hải',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Lê Văn Hiến',
          'Đường Võ Chí Công',
          'Đường Trường Sa',
          'Đường Nam Kỳ Khởi Nghĩa',
        ],
      },
      {
        id: 'cam-le',
        name: 'Quận Cẩm Lệ',
        wards: [
          'Phường Khuê Trung',
          'Phường Hòa Thọ Đông',
          'Phường Hòa Thọ Tây',
          'Phường Hòa An',
          'Phường Hòa Phát',
          'Phường Hòa Xuân',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Cách Mạng Tháng 8',
          'Đường Nguyễn Hữu Thọ',
          'Đường Lê Đại Hành',
          'Đường Văn Tiến Dũng',
        ],
      },
      {
        id: 'lien-chieu',
        name: 'Quận Liên Chiểu',
        wards: [
          'Phường Hòa Minh',
          'Phường Hòa Khánh Nam',
          'Phường Hòa Khánh Bắc',
          'Phường Hòa Hiệp Nam',
          'Phường Hòa Hiệp Bắc',
        ],
        streets: [
          'Tuyến đường trung tâm phường',
          'Đường Tôn Đức Thắng',
          'Đường Nguyễn Lương Bằng',
          'Đường Hoàng Thị Loan',
        ],
      },
      {
        id: 'hoa-vang',
        name: 'Huyện Hòa Vang',
        wards: [
          'Xã Hòa Châu',
          'Xã Hòa Phước',
          'Xã Hòa Khương',
          'Xã Hòa Nhơn',
          'Xã Hòa Phong',
          'Xã Hòa Tiến',
          'Xã Hòa Sơn',
          'Xã Hòa Liên',
          'Xã Hòa Ninh',
          'Xã Hòa Bắc',
          'Xã Hòa Phú',
        ],
        streets: [
          'Tuyến đường trung tâm xã',
          'Quốc lộ 14B',
          'Quốc lộ 1A',
          'Đường ĐT 605',
        ],
      },
    ],
  },
  {
    id: 'quang-nam',
    name: 'Tỉnh Quảng Nam',
    region: 'central',
    districts: [
      {
        id: 'hoi-an',
        name: 'Thành phố Hội An',
        wards: ['Phường Minh An', 'Phường Cẩm Phô', 'Phường Sơn Phong', 'Phường Cẩm Nam', 'Phường Cẩm Châu', 'Phường Cửa Đại', 'Xã Cẩm Hà', 'Xã Cẩm Thanh'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Trần Hưng Đạo', 'Đường Cửa Đại', 'Đường Hai Bà Trưng', 'Đường Lý Thường Kiệt'],
      },
      {
        id: 'tam-ky',
        name: 'Thành phố Tam Kỳ',
        wards: ['Phường An Mỹ', 'Phường An Xuân', 'Phường Phước Hòa', 'Phường Tân Thạnh', 'Phường Hòa Thuận', 'Xã Tam Ngọc'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Hùng Vương', 'Đường Phan Châu Trinh', 'Đường Trần Cao Vân'],
      },
      {
        id: 'dien-ban',
        name: 'Thị xã Điện Bàn',
        wards: ['Phường Vĩnh Điện', 'Phường Điện Ngọc', 'Phường Điện Nam Trung', 'Phường Điện Nam Bắc', 'Xã Điện Phương'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Trần Nhân Tông', 'Đường DT 607'],
      },
      {
        id: 'duy-xuyen',
        name: 'Huyện Duy Xuyên',
        wards: ['Thị trấn Nam Phước', 'Xã Duy Trinh', 'Xã Duy Châu', 'Xã Duy Hòa', 'Xã Duy Sơn'],
        streets: ['Tuyến đường trung tâm xã/thị trấn', 'Quốc lộ 14H', 'Đường Hùng Vương'],
      },
    ],
  },
  {
    id: 'thua-thien-hue',
    name: 'Tỉnh Thừa Thiên Huế',
    region: 'central',
    districts: [
      {
        id: 'tp-hue',
        name: 'Thành phố Huế',
        wards: ['Phường Vĩnh Ninh', 'Phường Phú Nhuận', 'Phường Thuận Thành', 'Phường Phú Hội', 'Phường Phước Vĩnh', 'Phường An Cựu', 'Phường Hương Sơ'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lê Lợi', 'Đường Hùng Vương', 'Đường Nguyễn Huệ', 'Đường Đống Đa', 'Đường Trần Hưng Đạo'],
      },
      {
        id: 'huong-thuy',
        name: 'Thị xã Hương Thủy',
        wards: ['Phường Phú Bài', 'Phường Thủy Châu', 'Phường Thủy Lương', 'Xã Thủy Phù'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Nguyễn Tất Thành', 'Quốc lộ 1A'],
      },
      {
        id: 'huong-tra',
        name: 'Thị xã Hương Trà',
        wards: ['Phường Tứ Hạ', 'Phường Hương Văn', 'Phường Hương Vân', 'Xã Hương Toàn'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Cách Mạng Tháng 8'],
      },
    ],
  },
  {
    id: 'quang-ngai',
    name: 'Tỉnh Quảng Ngãi',
    region: 'central',
    districts: [
      {
        id: 'tp-quang-ngai',
        name: 'Thành phố Quảng Ngãi',
        wards: ['Phường Trần Phú', 'Phường Lê Hồng Phong', 'Phường Quảng Phú', 'Phường Chánh Lộ', 'Phường Nghĩa Chánh'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Quang Trung', 'Đường Hùng Vương', 'Đường Phan Đình Phùng'],
      },
      {
        id: 'duc-pho',
        name: 'Thị xã Đức Phổ',
        wards: ['Phường Nguyễn Nghiêm', 'Phường Phổ Thạnh', 'Phường Phổ Ninh'],
        streets: ['Tuyến đường trung tâm phường', 'Quốc lộ 1A'],
      },
    ],
  },
  {
    id: 'binh-dinh',
    name: 'Tỉnh Bình Định',
    region: 'central',
    districts: [
      {
        id: 'quy-nhon',
        name: 'Thành phố Quy Nhơn',
        wards: ['Phường Lê Lợi', 'Phường Trần Phú', 'Phường Nguyễn Văn Cừ', 'Phường Ngô Mây', 'Phường Ghềnh Ráng'],
        streets: ['Tuyến đường trung tâm phường', 'Đường An Dương Vương', 'Đường Nguyễn Tất Thành', 'Đường Xuân Diệu'],
      },
      {
        id: 'an-nhon',
        name: 'Thị xã An Nhơn',
        wards: ['Phường Bình Định', 'Phường Đập Đá', 'Xã Nhơn Hưng'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Quang Trung'],
      },
    ],
  },
  {
    id: 'khanh-hoa',
    name: 'Tỉnh Khánh Hòa',
    region: 'central',
    districts: [
      {
        id: 'nha-trang',
        name: 'Thành phố Nha Trang',
        wards: ['Phường Lộc Thọ', 'Phường Tân Lập', 'Phường Phước Hải', 'Phường Vĩnh Hải', 'Phường Vĩnh Hòa'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Phú', 'Đường 2 Tháng 4', 'Đường Lê Thánh Tôn', 'Đường Hùng Vương'],
      },
      {
        id: 'cam-ranh',
        name: 'Thành phố Cam Ranh',
        wards: ['Phường Cam Lộc', 'Phường Cam Phú', 'Phường Ba Ngòi'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Tất Thành', 'Đường Hùng Vương'],
      },
    ],
  },
  {
    id: 'phu-yen',
    name: 'Tỉnh Phú Yên',
    region: 'central',
    districts: [
      {
        id: 'tuy-hoa',
        name: 'Thành phố Tuy Hòa',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 7', 'Phường 9'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Hùng Vương', 'Đường Trần Hưng Đạo', 'Đường Nguyễn Huệ'],
      },
    ],
  },
  {
    id: 'quang-binh',
    name: 'Tỉnh Quảng Bình',
    region: 'central',
    districts: [
      {
        id: 'dong-hoi',
        name: 'Thành phố Đồng Hới',
        wards: ['Phường Đồng Mỹ', 'Phường Hải Đình', 'Phường Bắc Lý', 'Phường Nam Lý'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Quang Trung', 'Đường Lý Thường Kiệt', 'Đường Trần Hưng Đạo'],
      },
    ],
  },
  {
    id: 'quang-tri',
    name: 'Tỉnh Quảng Trị',
    region: 'central',
    districts: [
      {
        id: 'dong-ha',
        name: 'Thành phố Đông Hà',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường Đông Lương'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Quốc Lộ 9', 'Đường Lê Duẩn'],
      },
    ],
  },
  {
    id: 'ha-tinh',
    name: 'Tỉnh Hà Tĩnh',
    region: 'central',
    districts: [
      {
        id: 'tp-ha-tinh',
        name: 'Thành phố Hà Tĩnh',
        wards: ['Phường Bắc Hà', 'Phường Nam Hà', 'Phường Trần Phú', 'Phường Hà Huy Tập'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Phan Đình Phùng', 'Đường Hà Huy Tập'],
      },
    ],
  },
  {
    id: 'nghe-an',
    name: 'Tỉnh Nghệ An',
    region: 'central',
    districts: [
      {
        id: 'tp-vinh',
        name: 'Thành phố Vinh',
        wards: ['Phường Lê Lợi', 'Phường Quang Trung', 'Phường Hưng Dũng', 'Phường Trường Thi', 'Phường Bến Thủy'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lê Nin', 'Đường Trường Thi', 'Đường Nguyễn Thị Minh Khai'],
      },
      {
        id: 'cua-lo',
        name: 'Thị xã Cửa Lò',
        wards: ['Phường Nghi Hương', 'Phường Nghi Thu', 'Phường Nghi Thủy'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Bình Minh', 'Đường Nguyễn Sinh Cung'],
      },
    ],
  },
  {
    id: 'thanh-hoa',
    name: 'Tỉnh Thanh Hóa',
    region: 'central',
    districts: [
      {
        id: 'tp-thanh-hoa',
        name: 'Thành phố Thanh Hóa',
        wards: ['Phường Ba Đình', 'Phường Điện Biên', 'Phường Lam Sơn', 'Phường Đông Vệ', 'Phường Tân Sơn'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Phú', 'Đường Quang Trung', 'Đường Lê Hoàn'],
      },
      {
        id: 'sam-son',
        name: 'Thành phố Sầm Sơn',
        wards: ['Phường Trường Sơn', 'Phường Bắc Sơn', 'Phường Trung Sơn'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Hồ Xuân Hương', 'Đường Nguyễn Du'],
      },
    ],
  },
  {
    id: 'dak-lak',
    name: 'Tỉnh Đắk Lắk',
    region: 'central',
    districts: [
      {
        id: 'buon-ma-thuot',
        name: 'Thành phố Buôn Ma Thuột',
        wards: ['Phường Tân An', 'Phường Tân Lợi', 'Phường Thắng Lợi', 'Phường Tự An', 'Phường Thành Công'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lê Duẩn', 'Đường Nguyễn Tất Thành', 'Đường Phan Chu Trinh'],
      },
    ],
  },
  {
    id: 'lam-dong',
    name: 'Tỉnh Lâm Đồng',
    region: 'central',
    districts: [
      {
        id: 'da-lat',
        name: 'Thành phố Đà Lạt',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 8', 'Phường 9', 'Phường 10'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Phú', 'Đường Nguyễn Thị Minh Khai', 'Đường Phan Đình Phùng'],
      },
    ],
  },

  // --- MIỀN BẮC ---
  {
    id: 'ha-noi',
    name: 'Thành phố Hà Nội',
    region: 'north',
    districts: [
      {
        id: 'hoan-kiem',
        name: 'Quận Hoàn Kiếm',
        wards: ['Phường Tràng Tiền', 'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Gai', 'Phường Cửa Nam', 'Phường Lý Thái Tổ', 'Phường Đồng Xuân'],
        streets: ['Tuyến đường trung tâm phường', 'Phố Tràng Tiền', 'Phố Đinh Tiên Hoàng', 'Phố Hàng Bài', 'Phố Bà Triệu', 'Phố Hàng Gai'],
      },
      {
        id: 'ba-dinh',
        name: 'Quận Ba Đình',
        wards: ['Phường Điện Biên', 'Phường Đội Cấn', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Giảng Võ', 'Phường Cống Vị', 'Phường Thành Công'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Kim Mã', 'Đường Liễu Giai', 'Đường Đội Cấn', 'Đường Giảng Võ'],
      },
      {
        id: 'dong-da',
        name: 'Quận Đống Đa',
        wards: ['Phường Cát Linh', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Kim Liên', 'Phường Văn Miếu', 'Phường Trung Liệt'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Lương Bằng', 'Đường Tây Sơn', 'Đường Xã Đàn', 'Đường Tôn Đức Thắng', 'Đường Láng'],
      },
      {
        id: 'cau-giay',
        name: 'Quận Cầu Giấy',
        wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Tân', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Cầu Giấy', 'Đường Xuân Thủy', 'Đường Duy Tân', 'Đường Trần Duy Hưng', 'Đường Nguyễn Phong Sắc'],
      },
      {
        id: 'hai-ba-trung',
        name: 'Quận Hai Bà Trưng',
        wards: ['Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Lê Đại Hành', 'Phường Minh Khai', 'Phường Phố Huế', 'Phường Vĩnh Tuy'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Phố Huế', 'Đường Bà Triệu', 'Đường Đại Cồ Việt', 'Đường Minh Khai'],
      },
      {
        id: 'thanh-xuan',
        name: 'Quận Thanh Xuân',
        wards: ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Nhân Chính', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Trãi', 'Đường Lê Văn Lương', 'Đường Khuất Duy Tiến'],
      },
      {
        id: 'tay-ho',
        name: 'Quận Tây Hồ',
        wards: ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Xuân La', 'Phường Yên Phụ'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lạc Long Quân', 'Đường Thụy Khuê', 'Đường Xuân Diệu', 'Đường Âu Cơ'],
      },
      {
        id: 'ha-dong',
        name: 'Quận Hà Đông',
        wards: ['Phường Hà Cầu', 'Phường La Khê', 'Phường Mộ Lao', 'Phường Nguyễn Trãi', 'Phường Quang Trung', 'Phường Vạn Phúc', 'Phường Văn Quán'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Quang Trung', 'Đường Trần Phú', 'Đường Tố Hữu'],
      },
      {
        id: 'nam-tu-liem',
        name: 'Quận Nam Từ Liêm',
        wards: ['Phường Cầu Diễn', 'Phường Mễ Trì', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Trung Văn', 'Phường Tây Mỗ'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lê Đức Thọ', 'Đường Phạm Hùng', 'Đường Mễ Trì'],
      },
    ],
  },
  {
    id: 'hai-phong',
    name: 'Thành phố Hải Phòng',
    region: 'north',
    districts: [
      {
        id: 'hong-bang',
        name: 'Quận Hồng Bàng',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Thượng Lý', 'Phường Quán Toan'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Điện Biên Phủ', 'Đường Đinh Tiên Hoàng', 'Đường Trần Hưng Đạo'],
      },
      {
        id: 'ngo-quyen',
        name: 'Quận Ngô Quyền',
        wards: ['Phường Cầu Đất', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Đông Khê'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lạch Tray', 'Đường Lê Hồng Phong', 'Đường Đà Nẵng'],
      },
      {
        id: 'le-chan',
        name: 'Quận Lê Chân',
        wards: ['Phường An Biên', 'Phường Cát Dài', 'Phường Niệm Nghĩa', 'Phường Vĩnh Niệm'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Tô Hiệu', 'Đường Trần Nguyên Hãn'],
      },
    ],
  },
  {
    id: 'quang-ninh',
    name: 'Tỉnh Quảng Ninh',
    region: 'north',
    districts: [
      {
        id: 'ha-long',
        name: 'Thành phố Hạ Long',
        wards: ['Phường Bạch Đằng', 'Phường Bãi Cháy', 'Phường Hòn Gai', 'Phường Cao Thắng', 'Phường Hồng Gai', 'Phường Tuần Châu'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Hạ Long', 'Đường Lê Thánh Tông', 'Đường Trần Hưng Đạo'],
      },
      {
        id: 'cam-pha',
        name: 'Thành phố Cẩm Phả',
        wards: ['Phường Cẩm Thành', 'Phường Cẩm Trung', 'Phường Cửa Ông'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Phú', 'Quốc lộ 18'],
      },
    ],
  },
  {
    id: 'bac-ninh',
    name: 'Tỉnh Bắc Ninh',
    region: 'north',
    districts: [
      {
        id: 'tp-bac-ninh',
        name: 'Thành phố Bắc Ninh',
        wards: ['Phường Đại Phúc', 'Phường Ninh Xá', 'Phường Suối Hoa', 'Phường Tiền An', 'Phường Vệ An'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Hưng Đạo', 'Đường Lý Thái Tổ', 'Đường Nguyễn Cao'],
      },
      {
        id: 'tu-son',
        name: 'Thành phố Từ Sơn',
        wards: ['Phường Đông Ngàn', 'Phường Đồng Kỵ', 'Phường Tân Hồng', 'Phường Trang Hạ'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Phú', 'Đường Lý Thánh Tông'],
      },
    ],
  },
  {
    id: 'hai-duong',
    name: 'Tỉnh Hải Dương',
    region: 'north',
    districts: [
      {
        id: 'tp-hai-duong',
        name: 'Thành phố Hải Dương',
        wards: ['Phường Lê Thanh Nghị', 'Phường Nguyễn Trãi', 'Phường Quang Trung', 'Phường Trần Phú'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Lương Bằng', 'Đường Hồng Quang'],
      },
    ],
  },
  {
    id: 'nam-dinh',
    name: 'Tỉnh Nam Định',
    region: 'north',
    districts: [
      {
        id: 'tp-nam-dinh',
        name: 'Thành phố Nam Định',
        wards: ['Phường Cửa Bắc', 'Phường Lộc Vượng', 'Phường Trần Tế Xương', 'Phường Vị Xuyên'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Hưng Đạo', 'Đường Hàng Thao'],
      },
    ],
  },
  {
    id: 'thai-nguyen',
    name: 'Tỉnh Thái Nguyên',
    region: 'north',
    districts: [
      {
        id: 'tp-thai-nguyen',
        name: 'Thành phố Thái Nguyên',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Phan Đình Phùng', 'Phường Quang Trung', 'Phường Tân Thịnh'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Lương Ngọc Quyến', 'Đường Hoàng Văn Thụ'],
      },
    ],
  },

  // --- MIỀN NAM ---
  {
    id: 'ho-chi-minh',
    name: 'Thành phố Hồ Chí Minh',
    region: 'south',
    districts: [
      {
        id: 'quan-1',
        name: 'Quận 1',
        wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Tân Định', 'Phường Phạm Ngũ Lão', 'Phường Cầu Ông Lãnh', 'Phường Nguyễn Cư Trinh', 'Phường Cô Giang'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Huệ', 'Đường Lê Lợi', 'Đường Đồng Khởi', 'Đường Hai Bà Trưng', 'Đường Pastuer', 'Đường Nam Kỳ Khởi Nghĩa', 'Đường Trần Hưng Đạo'],
      },
      {
        id: 'quan-3',
        name: 'Quận 3',
        wards: ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 9', 'Phường 11', 'Phường 14'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Cách Mạng Tháng 8', 'Đường Nam Kỳ Khởi Nghĩa', 'Đường Điện Biên Phủ', 'Đường Nguyễn Đình Chiểu'],
      },
      {
        id: 'quan-5',
        name: 'Quận 5',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 11', 'Phường 12', 'Phường 14'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Hưng Đạo', 'Đường Nguyễn Trãi', 'Đường Hồng Bàng', 'Đường An Dương Vương'],
      },
      {
        id: 'quan-7',
        name: 'Quận 7',
        wards: ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Hưng', 'Phường Phú Mỹ', 'Phường Phú Thuận'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Văn Linh', 'Đường Nguyễn Thị Thập', 'Đường Huỳnh Tấn Phát', 'Đường Nguyễn Lương Bằng'],
      },
      {
        id: 'quan-10',
        name: 'Quận 10',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 6', 'Phường 10', 'Phường 12', 'Phường 14', 'Phường 15'],
        streets: ['Tuyến đường trung tâm phường', 'Đường 3 Tháng 2', 'Đường Sư Vạn Hạnh', 'Đường Lý Thường Kiệt', 'Đường Thành Thái'],
      },
      {
        id: 'binh-thanh',
        name: 'Quận Bình Thạnh',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 11', 'Phường 15', 'Phường 19', 'Phường 25', 'Phường 26'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Điện Biên Phủ', 'Đường Xô Viết Nghệ Tĩnh', 'Đường Phan Đăng Lưu', 'Đường Bạch Đằng'],
      },
      {
        id: 'tan-binh',
        name: 'Quận Tân Bình',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 10', 'Phường 12', 'Phường 13', 'Phường 15'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Cộng Hòa', 'Đường Trường Chinh', 'Đường Hoàng Văn Thụ', 'Đường Lê Văn Sỹ'],
      },
      {
        id: 'go-vap',
        name: 'Quận Gò Vấp',
        wards: ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 8', 'Phường 10', 'Phường 11', 'Phường 16'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Quang Trung', 'Đường Phan Văn Trị', 'Đường Nguyễn Oanh'],
      },
      {
        id: 'thu-duc',
        name: 'Thành phố Thủ Đức',
        wards: ['Phường Thảo Điền', 'Phường An Phú', 'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Hiệp Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tam Bình'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Võ Nguyên Giáp (Xa Lộ Hà Nội)', 'Đường Đỗ Xuân Hợp', 'Đường Phạm Văn Đồng', 'Đường Lê Văn Việt'],
      },
    ],
  },
  {
    id: 'can-tho',
    name: 'Thành phố Cần Thơ',
    region: 'south',
    districts: [
      {
        id: 'ninh-kieu',
        name: 'Quận Ninh Kiều',
        wards: ['Phường Tân An', 'Phường An Cư', 'Phường An Khánh', 'Phường Hưng Lợi', 'Phường Xuân Khánh'],
        streets: ['Tuyến đường trung tâm phường', 'Đường 30 Tháng 4', 'Đường 3 Tháng 2', 'Đường Hòa Bình', 'Đường Hai Bà Trưng'],
      },
      {
        id: 'binh-thuy',
        name: 'Quận Bình Thủy',
        wards: ['Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Cách Mạng Tháng 8', 'Đường Lê Hồng Phong'],
      },
      {
        id: 'cai-rang',
        name: 'Quận Cái Răng',
        wards: ['Phường Lê Bình', 'Phường Ba Láng', 'Phường Hưng Phú'],
        streets: ['Tuyến đường trung tâm phường', 'Quốc lộ 1A', 'Đường Phạm Hùng'],
      },
    ],
  },
  {
    id: 'binh-duong',
    name: 'Tỉnh Bình Dương',
    region: 'south',
    districts: [
      {
        id: 'thu-dau-mot',
        name: 'Thành phố Thủ Dầu Một',
        wards: ['Phường Phú Hòa', 'Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Đại Lộ Bình Dương', 'Đường Yersin', 'Đường Cách Mạng Tháng 8'],
      },
      {
        id: 'thuan-an',
        name: 'Thành phố Thuận An',
        wards: ['Phường Lái Thiêu', 'Phường An Phú', 'Phường Thuận Giao', 'Phường Bình Hòa'],
        streets: ['Tuyến đường trung tâm phường', 'Đường ĐT 743', 'Đường Nguyễn Văn Tiết'],
      },
      {
        id: 'di-an',
        name: 'Thành phố Dĩ An',
        wards: ['Phường Dĩ An', 'Phường Đông Hòa', 'Phường Tân Đông Hiệp', 'Phường An Bình'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Hưng Đạo', 'Đường Nguyễn An Ninh'],
      },
    ],
  },
  {
    id: 'dong-nai',
    name: 'Tỉnh Đồng Nai',
    region: 'south',
    districts: [
      {
        id: 'bien-hoa',
        name: 'Thành phố Biên Hòa',
        wards: ['Phường Quyết Thắng', 'Phường Trung Dũng', 'Phường Thống Nhất', 'Phường Tân Phong', 'Phường Trảng Dài'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Đồng Khởi', 'Đường Nguyễn Ái Quốc', 'Đường Phạm Văn Thuận'],
      },
      {
        id: 'long-khanh',
        name: 'Thành phố Long Khánh',
        wards: ['Phường Xuân An', 'Phường Xuân Bình', 'Phường Xuân Trung'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Hùng Vương', 'Quốc lộ 1A'],
      },
    ],
  },
  {
    id: 'ba-ria-vung-tau',
    name: 'Tỉnh Bà Rịa - Vũng Tàu',
    region: 'south',
    districts: [
      {
        id: 'vung-tau',
        name: 'Thành phố Vũng Tàu',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 7', 'Phường Thắng Tam', 'Phường Thắng Nhì'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Thùy Vân', 'Đường Hạ Long', 'Đường Ba Cu', 'Đường Lê Hồng Phong'],
      },
      {
        id: 'ba-ria',
        name: 'Thành phố Bà Rịa',
        wards: ['Phường Phước Hưng', 'Phường Phước Hiệp', 'Phường Phước Trung'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Bạch Đằng', 'Đường Cách Mạng Tháng 8'],
      },
    ],
  },
  {
    id: 'long-an',
    name: 'Tỉnh Long An',
    region: 'south',
    districts: [
      {
        id: 'tan-an',
        name: 'Thành phố Tân An',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Hùng Vương', 'Đường Trương Định'],
      },
    ],
  },
  {
    id: 'tien-giang',
    name: 'Tỉnh Tiền Giang',
    region: 'south',
    districts: [
      {
        id: 'my-tho',
        name: 'Thành phố Mỹ Tho',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 7'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Ấp Bắc', 'Đường Lý Thường Kiệt'],
      },
    ],
  },
  {
    id: 'an-giang',
    name: 'Tỉnh An Giang',
    region: 'south',
    districts: [
      {
        id: 'long-xuyen',
        name: 'Thành phố Long Xuyên',
        wards: ['Phường Mỹ Long', 'Phường Mỹ Bình', 'Phường Mỹ Xuyên'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Trần Hưng Đạo', 'Đường Hà Hoàng Hổ'],
      },
    ],
  },
  {
    id: 'kien-giang',
    name: 'Tỉnh Kiên Giang',
    region: 'south',
    districts: [
      {
        id: 'rach-gia',
        name: 'Thành phố Rạch Giá',
        wards: ['Phường Vĩnh Thanh Vân', 'Phường Vĩnh Thanh', 'Phường Vĩnh Quang', 'Phường An Hòa'],
        streets: ['Tuyến đường trung tâm phường', 'Đường Nguyễn Trung Trực', 'Đường Trần Phú'],
      },
      {
        id: 'phu-quoc',
        name: 'Thành phố Phú Quốc',
        wards: ['Phường Dương Đông', 'Phường An Thới', 'Xã Cửa Cạn', 'Xã Gành Dầu'],
        streets: ['Tuyến đường trung tâm phường/xã', 'Đường Trần Hưng Đạo', 'Đường 30 Tháng 4'],
      },
    ],
  },
];

// Helper để parse chuỗi địa chỉ hiện có nếu có
export const parseAddressString = (addressStr = '') => {
  if (!addressStr || typeof addressStr !== 'string') return null;

  for (const province of VIETNAM_PROVINCES) {
    if (addressStr.toLowerCase().includes(province.name.toLowerCase())) {
      for (const district of province.districts) {
        if (addressStr.toLowerCase().includes(district.name.toLowerCase())) {
          for (const ward of district.wards) {
            if (addressStr.toLowerCase().includes(ward.toLowerCase())) {
              return {
                provinceId: province.id,
                districtId: district.id,
                wardName: ward,
                region: province.region,
              };
            }
          }
          return {
            provinceId: province.id,
            districtId: district.id,
            wardName: district.wards[0],
            region: province.region,
          };
        }
      }
      return {
        provinceId: province.id,
        districtId: province.districts[0]?.id,
        wardName: province.districts[0]?.wards[0],
        region: province.region,
      };
    }
  }
  return null;
};
