import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Droplets,
  Sparkles,
  ArrowRight,
  Search,
  Phone,
  MessageCircle,
  CheckCircle2,
  X,
  Eye,
  ShieldCheck,
  Fish,
  Flame,
  Wrench,
  Ruler,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả Mẫu Hồ' },
  { id: 'thuysinh', label: 'Thủy Sinh Tự Nhiên' },
  { id: 'biotope', label: 'Hồ Biotop Tự Nhiên' },
  { id: 'marine', label: 'Cá Biển San Hô' },
  { id: 'monster', label: 'Cá Rồng & Koi' },
  { id: 'mini', label: 'Bể Để Bàn Mini' },
];

const TANK_MODELS = [
  {
    id: 'iwagumi',
    title: 'Hồ Thủy Sinh Iwagumi Tối Giản',
    category: 'thuysinh',
    categoryLabel: 'Thủy Sinh Tự Nhiên',
    badge: 'Bán Chạy Nhất',
    badgeColor: '#0284c7',
    size: '60x40x40 cm (Kính siêu trong 8mm)',
    image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=800&auto=format&fit=crop&q=80',
    style: 'Nhật Bản - Đá Seiryu & Thảm Trân Châu Ngọc Trai',
    water: 'Nước ngọt (pH 6.2 - 6.8, TDS 120-160)',
    fishSuggest: 'Cá Neon Vua, Tép Red Cherry, Cá Chuột Panda, Ốc Nerita',
    fishLink: '/products?search=Neon',
    priceEstimate: '3.500.000đ - 5.800.000đ',
    desc: 'Bố cục đá tự nhiên Iwagumi kết hợp thảm trân châu ngọc trai xanh mướt, lọc thùng êm ái, rất hợp đặt phòng khách hoặc bàn làm việc sang trọng.',
    equipment: [
      'Bể kính siêu trong 8 ly mài vi tính, dán dấu keo thẩm mỹ',
      'Đèn LED WRGB 60cm quang phổ chuyên dụng cho cây thảm',
      'Lọc thùng SunSun/Atman DF-1300 + 2L vật liệu lọc Matrix vi sinh',
      'Bình khí CO2 nhôm van điện Mufan tích hợp đếm giọt hẹn giờ',
      'Hardscape đá Da Voi / Seiryu tự nhiên + Phân nền Controsoil Nhật Bản',
    ],
    maintenance: 'Thay nước 30% mỗi tuần một lần, châm vi sinh định kỳ và tỉa thảm trân châu sau mỗi 3 - 4 tuần.',
    warranty: 'Bảo hành dán keo hồ kính 24 tháng. Hỗ trợ cân bằng hệ vi sinh trong 30 ngày đầu.',
  },
  {
    id: 'nature-bonsai',
    title: 'Hồ Thủy Sinh Rừng Rậm Lũa Bonsai',
    category: 'thuysinh',
    categoryLabel: 'Thủy Sinh Tự Nhiên',
    badge: 'Được Yêu Thích',
    badgeColor: '#16a34a',
    size: '90x45x45 cm (Kính siêu trong 10mm)',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
    style: 'Nature Aquarium - Cổ Thụ Bonsai & Rêu Weeping',
    water: 'Nước ngọt mát (24 - 27°C, pH 6.5 - 7.0)',
    fishSuggest: 'Cá Sóc Đầu Đỏ, Cá Tam Giác, Cá Phượng Hoàng Lam, Tép Yamato',
    fishLink: '/ca-phuong-hoang',
    priceEstimate: '7.500.000đ - 12.000.000đ',
    desc: 'Tuyệt phẩm bố cục cây cổ thụ bonsai tán rêu xanh mướt giữa dòng suối sỏi trắng tự nhiên, tạo cảm giác thư thái và mát mắt cho cả căn phòng.',
    equipment: [
      'Bể kính siêu trong 10 ly đúc giấu keo góc vuông 90 độ',
      'Cụm Bonsai lũa Sa Tùng chế tác thủ công tán rêu Weeping/Mini Taiwan',
      'Đèn Chihiros WRGB2 Slim 90cm điều khiển qua App Smartphone',
      'Lọc thùng Atman AT-3338S + 4L vật liệu lọc sinh học cao cấp',
      'Hệ thống CO2 bình thép 3L van điện tự ngắt ban đêm',
    ],
    maintenance: 'Tỉa tán rêu định kỳ 3 tuần/lần, vệ sinh lọc thùng mỗi 2 tháng và kiểm tra nồng độ CO2.',
    warranty: 'Bảo hành rò rỉ hồ kính 24 tháng. Bảo hành sống cho cụm cây thủy sinh 45 ngày.',
  },
  {
    id: 'dutch-style',
    title: 'Hồ Thủy Sinh Hà Lan (Dutch Style) Đa Sắc',
    category: 'thuysinh',
    categoryLabel: 'Thủy Sinh Tự Nhiên',
    badge: 'Đẳng Cấp Nghệ Thuật',
    badgeColor: '#9333ea',
    size: '120x50x50 cm (Kính siêu trong 12mm)',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    style: 'Hà Lan (Dutch) - Luống Cây Cắt Cắm Rực Rỡ Đỏ Xanh',
    water: 'Nước ngọt giàu dinh dưỡng (pH 6.2 - 6.6, Chiller 24°C)',
    fishSuggest: 'Cá Cầu Vồng Thạch Mỹ Nhân, Cá Trâm, Cá Neon Đen, Tép Amano',
    fishLink: '/products?search=Cầu+Vồng',
    priceEstimate: '14.000.000đ - 22.000.000đ',
    desc: 'Khu vườn dưới nước rực rỡ sắc màu với các luống cây thủy sinh đỏ, cam, xanh đan xen nghệ thuật, phối hợp hệ thống làm mát Chiller chuyên nghiệp.',
    equipment: [
      'Bể kính siêu trong 12 ly chịu áp lực cao, bo góc cạnh CNC thẩm mỹ',
      'Chân tủ gỗ Sồi tự nhiên phủ Melamine chống ẩm cao cấp',
      'Máy làm mát nước Chiller Hailea 1/2 HP giữ ổn định 24-25°C',
      'Đèn đôi Chihiros Vivid 2 Full quang phổ kích đỏ ngọn cây',
      'Bộ đôi lọc thùng Eheim Professionel + Bộ trộn CO2 cánh quạt hòa tan 100%',
    ],
    maintenance: 'Cắt tỉa tạo tầng tán hàng tuần, châm phân nước đa lượng - vi lượng mỗi ngày theo liều lượng chuẩn.',
    warranty: 'Bảo hành thiết bị 12 tháng, bảo hành hồ kính 36 tháng tận nơi tại Đà Nẵng.',
  },
  {
    id: 'paludarium-waterfall',
    title: 'Bể Bán Cạn Paludarium Thác Nước Rêu Rừng',
    category: 'thuysinh',
    categoryLabel: 'Thủy Sinh Tự Nhiên',
    badge: 'Mới Lạ Độc Đáo',
    badgeColor: '#0d9488',
    size: '80x45x70 cm (Bể kính vát nghệ thuật)',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80',
    style: 'Bán cạn Nhiệt Đới - Thác nước, Sương mù & Rêu ẩm',
    water: 'Phần nước ngọt tuần hoàn (pH 6.5 - 7.0)',
    fishSuggest: 'Cá Cánh Buồm Dạ Quang, Cua Ma Cà Rồng, Cá Chuột Pygmy, Ếch Phi Tiêu',
    fishLink: '/products?category=fish',
    priceEstimate: '6.800.000đ - 11.500.000đ',
    desc: 'Mô phỏng vách núi rừng nhiệt đới với thác nước róc rách, sương khói mờ ảo và thảm thực vật dương xỉ, phong lan mini và rêu bán cạn tự nhiên.',
    equipment: [
      'Bể kính vát nghệ thuật mặt tiền thấp ngắm trọn không gian',
      'Bộ máy tạo sương siêu âm tạo khói mờ ảo kèm quạt đối lưu không khí',
      'Bơm chìm mini tuần hoàn tạo thác nước chảy liên tục qua vách đá',
      'Đèn LED Full Spectrum mô phỏng ánh sáng tán rừng cho cây cạn phát triển',
      'Vách dán đá tổ ong / đá dung nham tự nhiên giữ ẩm tuyệt hảo',
    ],
    maintenance: 'Bật hệ thống phun ẩm tự động 2-3 lần/ngày, bổ sung nước bốc hơi định kỳ.',
    warranty: 'Bảo hành thiết bị điện tử 12 tháng, bảo hành rêu và cây bám rễ 30 ngày.',
  },
  {
    id: 'nano-cube',
    title: 'Hồ Nano Cube Để Bàn Làm Việc Siêu Tinh Tế',
    category: 'mini',
    categoryLabel: 'Bể Để Bàn Mini',
    badge: 'Nhỏ Gọn Tiện Lợi',
    badgeColor: '#f59e0b',
    size: '30x30x30 cm (Kính đúc bo góc)',
    image: 'https://images.unsplash.com/photo-1497671954146-59a89ff626ff?w=800&auto=format&fit=crop&q=80',
    style: 'Tối giản Hiện đại - Đá Tự Nhiên & Cây Dễ Chăm',
    water: 'Nước ngọt (pH 6.5 - 7.2)',
    fishSuggest: 'Tép Vàng Đài Loan, Cá Bảy Màu Guppy thuần chủng, Cá Trâm Boraras',
    fishLink: '/tep',
    priceEstimate: '1.200.000đ - 2.200.000đ',
    desc: 'Kích thước nhỏ gọn lý tưởng cho bàn làm việc công sở, quầy lễ tân hoặc kệ sách. Cây phát triển chậm, dễ chăm sóc mà không cần bình CO2 phức tạp.',
    equipment: [
      'Bể kính đúc bo góc siêu trong 5 ly chống xước nhẹ',
      'Đèn LED kẹp thủy sinh 12W tiết kiệm điện ánh sáng trắng ngả vàng ấm',
      'Lọc thác treo siêu êm tích hợp hút váng mặt nước tiện lợi',
      'Nền thủy sinh nén Controsoil kết hợp sỏi suối tự nhiên',
      'Cây cắm thủy sinh khỏe: Ráy Nana, Tiêu Thảo, Dương Xỉ Java',
    ],
    maintenance: 'Thay 1 ca nước nhỏ mỗi tuần, không cần thiết bị chăm sóc cầu kỳ.',
    warranty: 'Bảo hành hồ kính và lọc thác 12 tháng.',
  },
  {
    id: 'biotope-amazon',
    title: 'Hồ Biotop Sông Amazon Nước Đen (Cá Dĩa & Thần Tiên)',
    category: 'biotope',
    categoryLabel: 'Hồ Biotop Tự Nhiên',
    badge: 'Chuẩn Tự Nhiên',
    badgeColor: '#ea580c',
    size: '120x50x50 cm (Kính siêu trong 12mm)',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80',
    style: 'Biotop Rio Negro - Lũa Rừng, Cát Vàng & Lá Bàng Rừng',
    water: 'Nước ngọt ấm (28 - 30°C, pH 5.8 - 6.5)',
    fishSuggest: 'Cá Dĩa Đỏ Heckel, Cá Thần Tiên Manacapuru, Cá Chuột Sterbai',
    fishLink: '/ca-dia',
    priceEstimate: '8.500.000đ - 15.000.000đ',
    desc: 'Mô phỏng nguyên bản lòng sông Rio Negro xứ Amazon. Nước ngả màu trà tự nhiên giàu tannin giúp cá Dĩa và Thần Tiên căng màu rực rỡ, đề kháng cực cao.',
    equipment: [
      'Bể kính siêu trong 12 ly dán keo đen giấu thẩm mỹ chịu lực',
      'Chân sắt hộp sơn tĩnh điện bọc gỗ chống mục ẩm cao cấp',
      'Lũa Đỗ Quyên rừng nguyên bản tạo nhánh chìm lãng mạn',
      'Hệ lọc tràn sinh học kết hợp sưởi điện tử Eheim duy trì nhiệt độ 29°C',
      'Đèn LED chuyên dụng tạo hiệu ứng luồng sáng rọi xuyên khe lũa',
    ],
    maintenance: 'Bổ sung lá bàng rừng khô định kỳ, thay nước ấm 20-30% mỗi tuần.',
    warranty: 'Bảo hành hồ kính 24 tháng, cam kết cá khỏe thích nghi môi trường ngay lập tức.',
  },
  {
    id: 'biotope-stream',
    title: 'Hồ Biotop Khe Suối Đá Cuội Đông Dương',
    category: 'biotope',
    categoryLabel: 'Hồ Biotop Tự Nhiên',
    badge: 'Suối Tự Nhiên',
    badgeColor: '#0284c7',
    size: '100x40x40 cm (Thiết kế luồng chảy mạnh)',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    style: 'Khe Suối Thượng Nguồn - Cuội Sông & Luồng Chảy Năng Động',
    water: 'Nước ngọt mát giàu Oxy (pH 6.8 - 7.5, DO cao)',
    fishSuggest: 'Cá Tỳ Bà Bướm Hút Kính, Cá Kìm Lục Bảo, Cá Lòng Tong Suối, Cá Heo Nước Ngọt',
    fishLink: '/ca-chuot',
    priceEstimate: '5.500.000đ - 9.000.000đ',
    desc: 'Tái hiện sinh cảnh suối nguồn trong vắt với luồng nước tuần hoàn mát rượi, cá thích bơi ngược dòng và bám vào các phiến cuội nhẵn mịn.',
    equipment: [
      'Bể kính 10 ly siêu trong mài bóng',
      'Máy tạo sóng / luồng chảy đối lưu êm ái mô phỏng dòng suối tự nhiên',
      'Hệ lọc vách tràn công suất lớn giúp nước luôn trong vắt và giàu oxy hòa tan',
      'Cuội sông tự nhiên phân loại theo kích cỡ từ lớn đến sỏi mịn',
      'Đèn rọi Spotlight ánh sáng nắng tự nhiên tạo vệt sóng lung linh dưới đáy',
    ],
    maintenance: 'Thay nước 25% mỗi tuần, định kỳ vệ sinh bông lọc cơ học để duy trì dòng chảy mạnh.',
    warranty: 'Bảo hành hồ kính 24 tháng, bảo hành thiết bị bơm luồng 12 tháng.',
  },
  {
    id: 'biotope-malawi',
    title: 'Hồ Biotop Châu Phi - Rạn Đá Hồ Malawi (Cá Ali)',
    category: 'biotope',
    categoryLabel: 'Hồ Biotop Tự Nhiên',
    badge: 'Rực Rỡ Sắc Màu',
    badgeColor: '#3b82f6',
    size: '120x50x60 cm (Kính 12mm cường lực đáy)',
    image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&auto=format&fit=crop&q=80',
    style: 'Rạn Đá Hang Hốc Thủy Vực Châu Phi Kiềm Cao',
    water: 'Nước ngọt kiềm cứng (pH 7.8 - 8.6, gH cao)',
    fishSuggest: 'Cá Ali Thái Xanh Hoàng Gia, Ali Vàng Nắng, Ali Sao, Ali Mặt Ngựa',
    fishLink: '/products?search=Ali',
    priceEstimate: '9.000.000đ - 16.500.000đ',
    desc: 'Được mệnh danh là "rạn san hô nước ngọt" nhờ màu sắc rực rỡ từ đàn cá Ali Thái bơi lội qua các khe hang đá vôi kỳ vĩ.',
    equipment: [
      'Bể kính 12 ly đáy kép cường lực chống nứt khi xếp đá nặng',
      'Bố cục đá tai mèo / đá vôi tự nhiên tạo nhiều hang hốc cho cá trú ngụ',
      'Cát san hô mịn làm nền giúp đệm pH tự nhiên luôn trên 8.0',
      'Hệ lọc tràn dưới Sump dung tích 80L xử lý triệt để chất thải hữu cơ',
      'Đèn LED Marine Blue kết hợp trắng làm tôn vảy óng ánh của đàn Ali',
    ],
    maintenance: 'Hút phân đáy định kỳ 1 tuần/lần, duy trì độ kiềm pH bằng cát san hô.',
    warranty: 'Bảo hành dán keo hồ 36 tháng. Hỗ trợ kỹ thuật nuôi cá Ali trọn đời.',
  },
  {
    id: 'marine-reef-master',
    title: 'Hồ Cá Biển San Hô Công Nghệ Sump Đáy',
    category: 'marine',
    categoryLabel: 'Cá Biển San Hô',
    badge: 'Đẳng Cấp Đại Dương',
    badgeColor: '#0284c7',
    size: '90x50x50 cm + Bể Lọc Sump Đáy 70L',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80',
    style: 'Nước mặn Reef - Đá Sống Tự Nhiên & San Hô Mềm Rực Rỡ',
    water: 'Nước mặn (Độ mặn 1.023 - 1.025, pH 8.1 - 8.4, Nhiệt độ 25°C)',
    fishSuggest: 'Cá Hề Nemo Ocellaris, Cá Tang Xanh Dory, Tôm Bác Sĩ, Hải Quỳ Bánh Bao',
    fishLink: '/products?subCategory=ca-bien',
    priceEstimate: '15.000.000đ - 26.000.000đ',
    desc: 'Mang đại dương thu nhỏ vào ngôi nhà của bạn với san hô mềm chuyển động theo làn sóng và cặp cá hề Nemo bơi lội trong hải quỳ phát quang.',
    equipment: [
      'Bể kính siêu trong 10 ly mài bóng công nghệ cao kèm hộp Overflow chống ồn',
      'Bể lọc Sump đáy 4 buồng xử lý nước chuyên dụng cho bể biển',
      'Máy tách bọt Protein Skimmer Reef Octo đánh sạch tạp chất hữu cơ hòa tan',
      'Đèn LED chuyên dụng San hô Coral Spectrum hỗ trợ quang hợp cho tảo cộng sinh',
      'Máy tạo sóng thông minh giả lập thủy triều biển tự nhiên',
      'Muối biển Blue Treasure chuẩn quốc tế và thùng đá sống vi sinh đã cycle',
    ],
    maintenance: 'Đo độ mặn và bù nước ngọt RO tự động, châm Canxi và Magie theo tuần.',
    warranty: 'Bảo hành hệ thống lọc 12 tháng, bảo hành rò rỉ hồ kính 24 tháng, tặng gói test nước miễn phí 3 tháng.',
  },
  {
    id: 'nano-marine',
    title: 'Hồ Nano Marine Nước Mặn All-In-One Để Bàn',
    category: 'marine',
    categoryLabel: 'Cá Biển San Hô',
    badge: 'Mini Nước Mặn',
    badgeColor: '#06b6d4',
    size: '40x40x40 cm (Tích hợp lọc vách 3 ngăn)',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80',
    style: 'Nano Reef - All-In-One Gọn Gàng & Hiện Đại',
    water: 'Nước mặn biển (Độ mặn 1.024, Nhiệt độ 25-27°C)',
    fishSuggest: 'Cặp Cá Hề Nemo Đen Picasso, Tép Bác Sĩ Biển, Cua Nhện Biển',
    fishLink: '/products?subCategory=ca-bien',
    priceEstimate: '4.500.000đ - 7.500.000đ',
    desc: 'Giải pháp hồ cá biển mini thông minh với hệ lọc tích hợp sẵn phía sau, không tốn diện tích, cực kỳ thích hợp cho các bạn trẻ mới tiếp cận cá biển.',
    equipment: [
      'Bể kính đúc siêu trong tích hợp buồng lọc vách All-In-One thẩm mỹ',
      'Đèn LED kẹp quang phổ xanh kích màu san hô huỳnh quang ban đêm',
      'Bơm tuần hoàn siêu êm kèm đầu thổi mỏ vịt khuấy luồng sóng mặt',
      'Skimmer mini gắn vách đánh bọt hiệu quả',
      'Bút đo độ mặn quang học điện tử chính xác',
    ],
    maintenance: 'Thay 5 lít nước biển định kỳ mỗi tuần, bổ sung nước cất chống bay hơi.',
    warranty: 'Bảo hành máy bơm và hồ kính 12 tháng.',
  },
  {
    id: 'dragon-tank',
    title: 'Hồ Cá Rồng Huyết Long / Kim Long Hút Tài Lộc',
    category: 'monster',
    categoryLabel: 'Cá Rồng & Koi',
    badge: 'Phong Thủy Đẳng Cấp',
    badgeColor: '#dc2626',
    size: '180x68x81 cm (Kính cường lực 15mm mài xiết bóng)',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    style: 'Bể Thủy Quái Phong Thủy - Tranh 3D Đáy Rỗng Dễ Dọn Vệ Sinh',
    water: 'Nước ngọt ấm (pH 6.8 - 7.4, 29 - 31°C)',
    fishSuggest: 'Cá Rồng Huyết Long VIP, Cá Rồng Kim Long Bối, Cá Sam Motoro, Cá Hổ Indo',
    fishLink: '/products?subCategory=ca-rong',
    priceEstimate: '25.000.000đ - 45.000.000đ',
    desc: 'Hồ kính đại cỡ chuẩn phong thủy đón tài lộc cho phòng khách biệt thự và văn phòng lãnh đạo. Hệ lọc tràn dưới Sump 5 ngăn xử lý lượng thức ăn lớn của cá săn mồi.',
    equipment: [
      'Bể kính cường lực 15 ly chịu lực cao mài xiết bóng viền chống trầy',
      'Hệ khung sắt mạ kẽm bọc gỗ Sồi tự nhiên sơn màu theo phong thủy gia chủ',
      'Bể lọc tràn dưới Sump 5 ngăn: Hạt Kaldnes động, thanh sứ Momotaro, bùi nhùi Jmat',
      'Đèn Tanning chuyên dụng kích đỏ vảy cá rồng không làm đỏ nước hồ',
      'Hệ thống cấp thoát nước thông minh tự động thay nước (Auto Water Change)',
    ],
    maintenance: 'Hệ thống tự động thay nước định kỳ hàng ngày, giặt bông lọc ngăn đầu mỗi tuần.',
    warranty: 'Bảo hành bể kính 36 tháng, chân tủ gỗ 5 năm. Bảo trì trọn gói miễn phí 6 tháng.',
  },
  {
    id: 'goldfish-tank',
    title: 'Hồ Bể Kính Nuôi Cá Vàng Ranchu & Oranda Thủy Tộc',
    category: 'monster',
    categoryLabel: 'Cá Rồng & Koi',
    badge: 'Dễ Thương & May Mắn',
    badgeColor: '#f97316',
    size: '80x50x45 cm (Kính siêu trong bo góc tròn)',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    style: 'Cá Vàng Thư Giãn - Cát Thạch Anh Trắng Tinh & Đá Cuội',
    water: 'Nước ngọt mát (pH 7.2 - 7.8, Nước giàu vi sinh & oxy)',
    fishSuggest: 'Cá Vàng Ranchu Bò Sữa, Cá Vàng Oranda Đầu Lân Khủng, Cá Vàng Ryukin',
    fishLink: '/products?subCategory=ca-vang',
    priceEstimate: '3.800.000đ - 6.500.000đ',
    desc: 'Không gian sống bồng bềnh cho những chú cá vàng Ranchu tròn xoe ngộ nghĩnh. Hệ thống lọc oxy tạo dòng chảy êm nhẹ giúp cá bơi lội thảnh thơi mà không bị mệt vây.',
    equipment: [
      'Bể kính đúc siêu trong bo góc mặt tiền ngắm cá đa góc nhìn',
      'Hệ lọc tràn trên 4 tầng kết hợp sủi đĩa oxy mịn tạo môi trường nước trong veo',
      'Vật liệu lọc gốm Ceramic và san hô vụn giữ độ kiềm chuẩn cho cá vàng',
      'Đèn LED vàng trắng kích màu đỏ cam tự nhiên cho vảy cá',
      'Lớp cát thạch anh trắng tinh nhập khẩu chống dính bẩn',
    ],
    maintenance: 'Thay 30% nước mỗi tuần, vệ sinh ngăn bông lọc tràn trên dễ dàng không ướt tay.',
    warranty: 'Bảo hành hồ kính 24 tháng, tặng gói men vi sinh dạng bột nuôi dưỡng vi sinh có lợi.',
  },
  {
    id: 'koi-mini-danang',
    title: 'Hồ Kính Kết Hợp Lọc Tràn Koi Đà Nẵng Ban Công / Sân Vườn',
    category: 'monster',
    categoryLabel: 'Cá Rồng & Koi',
    badge: 'Biệt Thự & Ban Công',
    badgeColor: '#0284c7',
    size: '160x70x70 cm (Kính 15mm gia cố khung inox 304)',
    image: 'https://images.unsplash.com/photo-1516683037151-9a17603a8dc7?w=800&auto=format&fit=crop&q=80',
    style: 'Ngoài trời / Ban công chống thấm - Ngắm cá mặt bên sang trọng',
    water: 'Nước ngọt giàu oxy (pH 7.0 - 7.5, Oxy dồi dào)',
    fishSuggest: 'Cá Koi Kohaku Nhật Bản, Cá Koi Showa Tam Hoa, Cá Koi Bướm Vây Dài',
    fishLink: '/products?subCategory=ca-koi',
    priceEstimate: '16.000.000đ - 28.000.000đ',
    desc: 'Giải pháp ngắm cá Koi tuyệt đẹp từ góc nhìn ngang thay vì chỉ nhìn từ trên xuống như hồ xi măng truyền thống, tối ưu cho ban công nhà phố và biệt thự sân vườn.',
    equipment: [
      'Kính cường lực 15 ly mặt tiền gia cố khung thép không gỉ Inox 304',
      'Hệ thống lọc Drum tuần hoàn kết hợp giàn mưa Baki Shower giải phóng độc tố nhanh',
      'Đèn UV diệt tảo xanh ngoài trời công suất cao giữ nước trong vắt quanh năm',
      'Bơm tiết kiệm điện Periha vận hành bền bỉ 24/7',
      'Vòi sục khí oxy công nghiệp công suất lớn cho cá Koi hô hấp khỏe mạnh',
    ],
    maintenance: 'Xả cặn đáy lọc định kỳ qua van xả một chạm, thay lõi đèn UV sau 1 năm sử dụng.',
    warranty: 'Bảo hành chống thấm và kết cấu kính 36 tháng. Hỗ trợ cách ly phòng bệnh cho cá Koi mới.',
  },
  {
    id: 'dragon-stone-moss',
    title: 'Hồ Thủy Sinh Bố Cục Rêu & Lũa Rồng (Dragon Wood)',
    category: 'thuysinh',
    categoryLabel: 'Thủy Sinh Tự Nhiên',
    badge: 'Bình Dân & Dễ Chơi',
    badgeColor: '#059669',
    size: '60x30x36 cm (Bể chuẩn ADA tỷ lệ vàng)',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80',
    style: 'Bố cục Vách Đá & Lũa Gai bọc Rêu Fissidens',
    water: 'Nước ngọt (pH 6.5 - 7.0, 25-28°C)',
    fishSuggest: 'Cá Tam Giác Chuột, Tép Su Đỏ, Cá Bảy Màu Rồng Xanh, Ốc Ăn Ốc Helio',
    fishLink: '/products?category=fish',
    priceEstimate: '2.900.000đ - 4.500.000đ',
    desc: 'Dòng hồ thủy sinh quốc dân cho người mới bắt đầu. Sự kết hợp giữa đá Da Voi góc cạnh và lũa bọc rêu Fissidens xanh mát, ít tốn công chăm bón.',
    equipment: [
      'Bể kính đúc siêu trong 6 ly mài vát vi tính',
      'Đèn LED rọi Flat Nano chỉnh màu 3 chế độ sáng',
      'Lọc thác HBL-802 tích hợp lọc váng mặt nước + Sứ lọc Matrix cao cấp',
      'Cốt nền hữu cơ lót đáy + Phân nền Gex xanh Nhật Bản không tan bùn',
      'Cây cắm: Rêu Fissidens lá nước, Tiêu Thảo Nâu, Ráy Nana Petite',
    ],
    maintenance: 'Thay 1/3 nước mỗi tuần, châm bổ sung 1 nắp phân nước dưỡng rêu mỗi lần thay nước.',
    warranty: 'Bảo hành hồ kính 18 tháng.',
  },
  {
    id: 'shrimp-nano-paradise',
    title: 'Hồ Nano Nuôi Tép Cảnh Thủy Sinh Mini',
    category: 'mini',
    categoryLabel: 'Bể Để Bàn Mini',
    badge: 'Chuyên Dòng Tép',
    badgeColor: '#10b981',
    size: '45x30x30 cm (Kính siêu trong 6mm)',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    style: 'Thiên Đường Tép Cảnh - Thảm Rêu & Ống Trú Ẩn Gốm Sứ',
    water: 'Nước ngọt mát (pH 6.0 - 6.5, TDS 100 - 130, gH 4-5)',
    fishSuggest: 'Tép Màu Pure Red Line, Tép Blue Dream, Tép Ong Đen, Cá Trâm Bơi Đàn',
    fishLink: '/tep',
    priceEstimate: '2.400.000đ - 3.800.000đ',
    desc: 'Hồ nuôi tép cảnh chuyên sâu được kiểm soát TDS và khoáng chất tối ưu giúp tép lột vỏ dễ dàng, sinh sản nhanh và ôm trứng liên tục.',
    equipment: [
      'Bể kính siêu trong 6 ly chuẩn tỷ lệ nuôi tép sinh sản',
      'Lọc vi sinh bio đôi kết hợp lọc thác có lưới chắn tép con chuyên dụng',
      'Phân nền Benibachi chuyên dụng giữ pH ổn định cho dòng tép',
      'Lũa Cholla xương rồng tự nhiên tạo màng vi sinh làm thức ăn dặm cho tép',
      'Bút đo TDS điện tử cầm tay kiểm soát chất lượng nước',
    ],
    maintenance: 'Châm khoáng gH định kỳ, cho tép ăn lá dâu tằm luộc hoặc thức ăn chuyên dụng.',
    warranty: 'Bảo hành hồ kính 18 tháng, tặng 1 chai khoáng tép cao cấp.',
  },
];

export default function TankModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalModel, setActiveModalModel] = useState(null);

  const filteredModels = useMemo(() => {
    return TANK_MODELS.filter((model) => {
      const matchCategory =
        selectedCategory === 'all' || model.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        model.title.toLowerCase().includes(term) ||
        model.style.toLowerCase().includes(term) ||
        model.fishSuggest.toLowerCase().includes(term) ||
        model.size.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0.5rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'linear-gradient(135deg, #ffffff 60%, #f0f9ff 100%)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, borderRadius: '9999px', marginBottom: '0.6rem' }}>
              <Sparkles size={14} />
              <span>DỊCH VỤ THIẾT KẾ & THI CÔNG TRỌN GÓI AQUACRAFT</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
              Bộ Sưu Tập Mẫu Hồ Cá Thủy Sinh & Hồ Biotop AquaCraft
            </h1>
            <p style={{ color: '#475569', fontSize: '0.98rem', margin: 0, maxWidth: '820px', lineHeight: 1.6 }}>
              Tham khảo các mẫu hồ cá cảnh nước ngọt, hồ Biotop sông suối tự nhiên, hồ cá biển san hô và hồ kính cá Koi được thiết kế, thi công trọn gói theo yêu cầu tại Đà Nẵng & toàn quốc.
            </p>
          </div>

          {/* Quick contact box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="tel:0332127582"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0369a1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0284c7';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Phone size={17} />
              <span>Hotline: 0332127582</span>
            </a>

            <a
              href="https://zalo.me/0332127582"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1.5px solid #0284c7',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <MessageCircle size={17} />
              <span>Chat Zalo Tư Vấn</span>
            </a>
          </div>
        </div>

        {/* Highlight features bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Kính siêu trong 100%, giấu keo mài bóng CNC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
            <ShieldCheck size={16} color="#0284c7" />
            <span>Bảo hành kết cấu hồ kính 24 - 36 tháng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
            <Droplets size={16} color="#0284c7" />
            <span>Cam kết nước trong vắt sau 72h hoàn thiện</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
            <Wrench size={16} color="#eab308" />
            <span>Khảo sát không gian và dựng 3D tận nhà</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? TANK_MODELS.length
                  : TANK_MODELS.filter((m) => m.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={17}
              color="#94a3b8"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Tìm theo phong cách, kích thước, cá nuôi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter status */}
        <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            Đang hiển thị <strong>{filteredModels.length}</strong> mẫu hồ hồ cá cảnh
            {searchTerm && ` phù hợp với từ khóa "${searchTerm}"`}
          </span>
          {(selectedCategory !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 3. Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredModels.map((model) => (
          <div
            key={model.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#bae6fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {/* Image container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '220px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
              }}
              onClick={() => setActiveModalModel(model)}
            >
              <img
                src={model.image}
                alt={model.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/banner_farm.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />

              {/* Badges on image */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    backgroundColor: model.badgeColor || '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Flame size={12} />
                  <span>{model.badge}</span>
                </span>

                <span
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#f8fafc',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {model.categoryLabel}
                </span>
              </div>

              {/* View detail button on image hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalModel(model);
                }}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <Eye size={13} color="#0284c7" />
                <span>Xem chi tiết</span>
              </button>
            </div>

            {/* Card Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                {/* Size pill */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', backgroundColor: '#eff6ff', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', marginBottom: '0.6rem' }}>
                  <Ruler size={13} />
                  <span>{model.size}</span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '0 0 0.5rem',
                    lineHeight: 1.4,
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveModalModel(model)}
                >
                  {model.title}
                </h2>

                {/* Short desc */}
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: '0 0 0.85rem' }}>
                  {model.desc}
                </p>

                {/* Specs Box */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    fontSize: '0.84rem',
                    color: '#334155',
                    backgroundColor: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>Phong cách:</strong> {model.style}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Droplets size={14} color="#0284c7" />
                    <span><strong style={{ color: '#0f172a' }}>Thông số:</strong> {model.water}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <Fish size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span><strong style={{ color: '#0f172a' }}>Gợi ý cá:</strong> {model.fishSuggest}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action footer */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DỰ TOÁN TRỌN GÓI</div>
                  <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.05rem' }}>
                    {model.priceEstimate}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setActiveModalModel(model)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  >
                    <Layers size={13} color="#0284c7" />
                    <span>Thiết bị</span>
                  </button>

                  <Link
                    to={model.fishLink || '/products?category=fish'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0284c7';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#e0f2fe';
                      e.currentTarget.style.color = '#0284c7';
                    }}
                  >
                    <span>Chọn cá</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '3rem 1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px dashed #cbd5e1',
          }}
        >
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '1rem' }}>
            Không tìm thấy mẫu hồ cá nào phù hợp với bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Xem lại tất cả mẫu hồ
          </button>
        </div>
      )}

      {/* 4. Bottom Consultation & Custom Build Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginTop: '1rem',
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.25) 0%, transparent 40%)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ maxWidth: '750px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Dịch Vụ Thi Công Theo Không Gian Riêng
            </span>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.5rem 0', color: '#ffffff' }}>
              Bạn Cần Thiết Kế Hồ Cá Theo Kích Thước & Phong Thủy Riêng?
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              AquaCraft nhận thiết kế 3D, gia công kính siêu trong và lắp đặt hồ thủy sinh, hồ cá biển, hồ cá rồng và hồ kính cá Koi trọn gói tận nơi tại Đà Nẵng, Quảng Nam và các tỉnh miền Trung. Bảo hành vi sinh và hỗ trợ chăm sóc trọn đời!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
            <a
              href="tel:0332127582"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Phone size={18} />
              <span>0332127582 (Gọi ngay)</span>
            </a>

            <a
              href="https://zalo.me/0332127582"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <MessageCircle size={18} />
              <span>Gửi kích thước qua Zalo</span>
            </a>
          </div>
        </div>

        {/* 4 Steps Process */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>BƯỚC 1</span>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Khảo sát & Tư vấn 1-1</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đo đạc vị trí đặt hồ, phong thủy & dòng cá gia chủ muốn nuôi.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>BƯỚC 2</span>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Lên Phối Cảnh 3D & Báo Giá</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Xem trước bố cục đá, lũa, cây và chọn cấu hình thiết bị lọc, đèn.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>BƯỚC 3</span>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Thi Công & Setup Vi Sinh</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lắp đặt trong 1 - 2 ngày, châm men vi sinh tạo nước trong vắt.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>BƯỚC 4</span>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Thả Cá & Chăm Sóc Định Kỳ</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bảo hành kết cấu 24 tháng, hỗ trợ kiểm tra nước và bệnh cá miễn phí.</span>
          </div>
        </div>
      </div>

      {/* 5. Detail Modal */}
      {activeModalModel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setActiveModalModel(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalModel(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <X size={20} color="#0f172a" />
            </button>

            {/* Modal Image Header */}
            <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: '#0f172a' }}>
              <img
                src={activeModalModel.image}
                alt={activeModalModel.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/banner_farm.jpg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem',
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
                  color: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ backgroundColor: activeModalModel.badgeColor || '#0284c7', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    {activeModalModel.badge}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#bae6fd' }}>{activeModalModel.categoryLabel}</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {activeModalModel.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Quick specs overview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>KÍCH THƯỚC BỂ</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginTop: '2px' }}>
                    {activeModalModel.size}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DỰ TOÁN CHI PHÍ</div>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.1rem', marginTop: '2px' }}>
                    {activeModalModel.priceEstimate}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>MÔI TRƯỜNG NƯỚC</div>
                  <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.9rem', marginTop: '2px' }}>
                    {activeModalModel.water}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PHONG CÁCH</div>
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem', marginTop: '2px' }}>
                    {activeModalModel.style}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Giới thiệu ý tưởng thiết kế
                </h4>
                <p style={{ color: '#475569', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
                  {activeModalModel.desc}
                </p>
              </div>

              {/* Equipment list */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Wrench size={17} color="#0284c7" />
                  <span>Danh mục thiết bị & vật tư trọn gói bao gồm:</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeModalModel.equipment.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        fontSize: '0.9rem',
                        color: '#334155',
                        backgroundColor: '#ffffff',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fish suggestion & Maintenance */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    <Fish size={16} />
                    <span>Gợi ý cá & sinh vật cảnh:</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5 }}>
                    {activeModalModel.fishSuggest}
                  </p>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    <ShieldCheck size={16} />
                    <span>Cam kết bảo hành & chăm sóc:</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                    {activeModalModel.warranty}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href="tel:0332127582"
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Phone size={16} />
                    <span>Gọi 0332127582</span>
                  </a>

                  <a
                    href="https://zalo.me/0332127582"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0284c7',
                      border: '1.5px solid #0284c7',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Chat Zalo Báo Giá</span>
                  </a>
                </div>

                <Link
                  to={activeModalModel.fishLink || '/products?category=fish'}
                  onClick={() => setActiveModalModel(null)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Khám phá cá cho hồ này</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
