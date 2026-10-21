import { PracticeQuestion, VocabListItem, normalizeToeicPart } from "@/app/admin/content/mock-tests/types";

/**
 * Ngân hàng từ điển mẫu câu và cụm từ TOEIC thông dụng
 */
const SENTENCE_TRANSLATIONS: Record<string, string> = {
  // Part 1 mẫu câu thường gặp
  "a vehicle is entering the garage.": "Một phương tiện đang đi vào ga-ra.",
  "a vehicle is entering the garage": "Một phương tiện đang đi vào ga-ra.",
  "people are standing in an elevator.": "Mọi người đang đứng trong thang máy.",
  "people are standing in an elevator": "Mọi người đang đứng trong thang máy.",
  "some boxes are being unloaded.": "Một số thùng hàng đang được dỡ xuống.",
  "some boxes are being unloaded": "Một số thùng hàng đang được dỡ xuống.",
  "a man is adjusting his eyeglasses while reading.": "Một người đàn ông đang điều chỉnh kính mắt trong khi đọc.",
  "a man is adjusting his eyeglasses while reading": "Một người đàn ông đang điều chỉnh kính mắt trong khi đọc.",
  "a barista is wiping down a counter.": "Một nhân viên pha chế đang lau mặt quầy.",
  "a barista is wiping down a counter": "Một nhân viên pha chế đang lau mặt quầy.",
  "customers are queuing up in front of an entrance.": "Khách hàng đang xếp hàng trước lối vào.",
  "customers are queuing up in front of an entrance": "Khách hàng đang xếp hàng trước lối vào.",
  "she's eating in a picnic area.": "Cô ấy đang ăn ở một khu vực dã ngoại.",
  "she's waiting in line at a food truck.": "Cô ấy đang xếp hàng tại một xe bán đồ ăn.",
  "she's wiping off a bench.": "Cô ấy đang lau sạch một chiếc ghế dài.",
  "she's throwing away a plate.": "Cô ấy đang vứt một chiếc đĩa đi.",
  "the man is standing in the snow beside a car.": "Người đàn ông đang đứng trong tuyết bên cạnh ô tô.",
  "the man is brushing snow off the roof of a car.": "Người đàn ông đang quét tuyết trên nóc ô tô.",
  "the man is shoveling a driveway.": "Người đàn ông đang xúc tuyết ở lối xe chạy.",
  "the man is putting on a winter coat.": "Người đàn ông đang mặc một chiếc áo khoác mùa đông.",
  "two of the people are having a conversation.": "Hai người trong số họ đang trò chuyện với nhau.",
  "some workers are hanging art in a gallery.": "Một số công nhân đang treo tranh nghệ thuật trong phòng triển lãm.",
  "one of the men is rearranging cushions on a sofa.": "Một người đàn ông đang sắp xếp lại gối đệm trên ghế sô-pha.",
  "one of the men is painting a picture.": "Một người đàn ông đang vẽ một bức tranh.",
  "clothing is being displayed under a tent.": "Quần áo đang được trưng bày bên dưới một chiếc lều bạt.",
  "vehicles are entering a parking garage.": "Các phương tiện đang đi vào nhà để xe.",
  "clothes hangers are scattered on the ground.": "Các móc treo quần áo nằm rải rác trên mặt đất.",
  "empty racks are lined up next to a building.": "Các giá treo trống được xếp thành hàng cạnh một tòa nhà.",
  "he's parking a truck.": "Anh ấy đang đỗ một chiếc xe tải.",
  "he's lifting some furniture.": "Anh ấy đang nâng một số đồ nội thất.",
  "he's starting an engine.": "Anh ấy đang khởi động một động cơ.",
  "he's driving a car.": "Anh ấy đang lái xe ô tô.",
  "some curtains have been closed.": "Một số tấm rèm cửa đã được kéo đóng lại.",
  "some jackets have been laid on a chair.": "Một số chiếc áo khoác đã được đặt trên ghế.",
  "some people are gathered around a desk.": "Một số người đang tụ tập xung quanh một chiếc bàn làm việc.",
  "someone is turning on a lamp.": "Ai đó đang bật một chiếc đèn.",
  "a woman is standing near a desk.": "Một người phụ nữ đang đứng gần bàn làm việc.",
  "a woman is typing on a keyboard.": "Một người phụ nữ đang gõ bàn phím máy tính.",
  "a woman is looking at a computer screen.": "Một người phụ nữ đang nhìn vào màn hình máy tính.",
  "a woman is talking on the telephone.": "Một người phụ nữ đang nói chuyện qua điện thoại.",
  "shelves are stocked with supplies.": "Các kệ hàng chứa đầy các vật dụng hàng hóa.",
  "items are arranged on display shelves.": "Các mặt hàng được sắp xếp ngăn nắp trên kệ trưng bày.",
  "chairs are stacked in a corner.": "Những chiếc ghế được xếp chồng gọn trong góc phòng.",
  "a pedestrian is crossing the street.": "Một người đi bộ đang băng qua đường.",
  "bicycles are parked along the sidewalk.": "Xe đạp được dựng đỗ dọc theo vỉa hè.",
  "a waiter is serving food to diners.": "Người phục vụ đang mang món ăn đến cho thực khách.",

  // Part 3 & 4 Options thông dụng
  "a room is not available.": "Một căn phòng hiện không còn trống.",
  "a window will not open.": "Một cánh cửa sổ không mở được.",
  "a projector is not working.": "Một chiếc máy chiếu đang bị hỏng / không hoạt động.",
  "the weather has changed suddenly.": "Thời tiết đã thay đổi một cách đột ngột.",
  "she placed an order.": "Cô ấy đã đặt một đơn hàng.",
  "she scheduled an event.": "Cô ấy đã lên lịch cho một sự kiện.",
  "she called a manager.": "Cô ấy đã gọi điện cho người quản lý.",
  "she painted some rooms.": "Cô ấy đã sơn một số căn phòng.",
  "camping gear": "Dụng cụ cắm trại dã ngoại",
  "household items": "Đồ dùng sinh hoạt gia đình",
  "office equipment": "Thiết bị văn phòng",
  "automobile accessories": "Phụ kiện ô tô",
  "manufacturing": "Sản xuất / Chế tạo",
  "hiring": "Tuyển dụng nhân sự",
  "political": "Thuộc về chính trị",
  "sporting": "Thuộc về thể thao",
  "has": "có (chia số ít thì hiện tại)",
  "had": "đã có (quá khứ)",
  "have": "có (nguyên thể / số nhiều)",
  "having": "đang có / việc có (dạng V-ing)",
  "regional": "thuộc khu vực, địa phương",
  "regionally": "theo từng vùng miền, theo khu vực",
  "region": "khu vực, vùng miền",
  "regions": "các khu vực, các vùng miền",
};

/**
 * Từ điển tra cứu từ vựng cốt lõi TOEIC kèm đầy đủ phiên âm, từ loại, nghĩa và ví dụ
 */
const TOEIC_VOCAB_DICT: Record<string, VocabListItem> = {
  "adjust": {
    word: "adjust",
    pos: "v.",
    cefrLevel: "B1",
    ipa: "/əˈdʒʌst/",
    meaning: "điều chỉnh, chỉnh lại cho phù hợp",
    example: { en: "The technician adjusted the settings on the machine.", vi: "Kỹ thuật viên đã điều chỉnh các thông số trên máy móc." }
  },
  "eyeglasses": {
    word: "eyeglasses",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/ˈaɪɡlæsɪz/",
    meaning: "kính mắt, kính đeo",
    example: { en: "He wears eyeglasses when working on the computer.", vi: "Anh ấy đeo kính mắt khi làm việc trên máy tính." }
  },
  "vehicle": {
    word: "vehicle",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈviːəkl/",
    meaning: "xe cộ, phương tiện giao thông",
    example: { en: "All company vehicles must be parked in designated areas.", vi: "Tất cả các phương tiện của công ty phải được đỗ đúng khu vực quy định." }
  },
  "garage": {
    word: "garage",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/ˈɡærɑːʒ/",
    meaning: "nhà để xe, ga-ra",
    example: { en: "The underground garage has spaces for 200 cars.", vi: "Ga-ra tầng hầm có chỗ đỗ cho 200 ô tô." }
  },
  "elevator": {
    word: "elevator",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/ˈelɪveɪtər/",
    meaning: "thang máy",
    example: { en: "The elevator is temporarily out of service for routine maintenance.", vi: "Thang máy tạm thời ngừng hoạt động để bảo dưỡng định kỳ." }
  },
  "unload": {
    word: "unload",
    pos: "v.",
    cefrLevel: "B1",
    ipa: "/ˌʌnˈləʊd/",
    meaning: "bốc dỡ hàng hóa",
    example: { en: "The crew unloaded the delivery crates at the loading dock.", vi: "Đội nhân công đã bốc dỡ các thùng giao hàng tại bến bốc dỡ." }
  },
  "barista": {
    word: "barista",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/bəˈriːstə/",
    meaning: "nhân viên pha chế cà phê",
    example: { en: "The barista prepared a fresh espresso for the customer.", vi: "Nhân viên pha chế đã chuẩn bị một ly espresso tươi ngon cho khách hàng." }
  },
  "counter": {
    word: "counter",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/ˈkaʊntər/",
    meaning: "quầy thanh toán, mặt quầy",
    example: { en: "Please place your completed order forms on the counter.", vi: "Vui lòng đặt các phiếu đặt hàng đã hoàn thành lên quầy." }
  },
  "queue": {
    word: "queue",
    pos: "v. / n.",
    cefrLevel: "B1",
    ipa: "/kjuː/",
    meaning: "xếp hàng; hàng người xếp hàng",
    example: { en: "Customers queued patiently outside the store before opening.", vi: "Khách hàng kiên nhẫn xếp hàng bên ngoài cửa hàng trước giờ mở cửa." }
  },
  "entrance": {
    word: "entrance",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/ˈentrəns/",
    meaning: "lối vào, cổng vào",
    example: { en: "The main entrance is located on Fourth Avenue.", vi: "Cổng vào chính nằm trên Đại lộ số Bốn." }
  },
  "projector": {
    word: "projector",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/prəˈdʒektər/",
    meaning: "máy chiếu",
    example: { en: "The speaker connected his laptop to the digital projector.", vi: "Diễn giả đã kết nối máy tính xách tay của mình với máy chiếu kỹ thuật số." }
  },
  "available": {
    word: "available",
    pos: "adj.",
    cefrLevel: "B1",
    ipa: "/əˈveɪləbl/",
    meaning: "có sẵn, còn trống (phòng, lịch hẹn)",
    example: { en: "The conference room is available from 2:00 PM to 4:00 PM.", vi: "Phòng họp còn trống từ 2 giờ chiều đến 4 giờ chiều." }
  },
  "equipment": {
    word: "equipment",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ɪˈkwɪpmənt/",
    meaning: "trang thiết bị, máy móc dụng cụ",
    example: { en: "The laboratory is equipped with state-of-the-art testing equipment.", vi: "Phòng thí nghiệm được trang bị thiết bị kiểm tra tối tân." }
  },
  "accessory": {
    word: "accessory",
    pos: "n.",
    cefrLevel: "B2",
    ipa: "/əkˈsesəri/",
    meaning: "phụ kiện, đồ phụ tùng",
    example: { en: "The shop sells mobile phones and car accessories.", vi: "Cửa hàng bán điện thoại di động và các phụ kiện xe hơi." }
  },
  "manufacture": {
    word: "manufacture",
    pos: "v. / n.",
    cefrLevel: "B2",
    ipa: "/ˌmænjuˈfæktʃər/",
    meaning: "sản xuất, chế tạo công nghiệp",
    example: { en: "The firm manufactures precision optical instruments.", vi: "Doanh nghiệp sản xuất các dụng cụ quang học chính xác." }
  },
  "hiring": {
    word: "hiring",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈhaɪərɪŋ/",
    meaning: "việc tuyển dụng nhân sự",
    example: { en: "The company announced a freeze on hiring for the next quarter.", vi: "Công ty thông báo tạm ngừng việc tuyển dụng nhân sự trong quý tới." }
  },
  "regional": {
    word: "regional",
    pos: "adj.",
    cefrLevel: "B2",
    ipa: "/ˈriːdʒənl/",
    meaning: "thuộc khu vực, mang tính vùng miền",
    example: { en: "She was appointed as the new regional sales director.", vi: "Bà ấy đã được bổ nhiệm làm tân giám đốc bán hàng khu vực." }
  },
  "spreadsheet": {
    word: "spreadsheet",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈspredʃiːt/",
    meaning: "bảng tính dữ liệu (Excel, Sheets)",
    example: { en: "Please enter the monthly expense data into the budget spreadsheet.", vi: "Vui lòng nhập số liệu chi phí hàng tháng vào bảng tính ngân sách." }
  },
  "upgrade": {
    word: "upgrade",
    pos: "v. / n.",
    cefrLevel: "B1",
    ipa: "/ʌpˈɡreɪd/",
    meaning: "nâng cấp phần mềm/hệ thống",
    example: { en: "We need to upgrade our accounting software by next month.", vi: "Chúng ta cần nâng cấp phần mềm kế toán trước tháng tới." }
  },
  "conference": {
    word: "conference",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈkɒnfərəns/",
    meaning: "hội nghị, cuộc họp lớn",
    example: { en: "Over 500 delegates attended the annual leadership conference.", vi: "Hơn 500 đại biểu đã tham dự hội nghị lãnh đạo thường niên." }
  },
  "department": {
    word: "department",
    pos: "n.",
    cefrLevel: "A2",
    ipa: "/dɪˈpɑːtmənt/",
    meaning: "phòng ban, bộ phận công ty",
    example: { en: "The marketing department is preparing the summer product campaign.", vi: "Phòng marketing đang chuẩn bị chiến dịch sản phẩm mùa hè." }
  },
  "presentation": {
    word: "presentation",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˌpreznˈteɪʃn/",
    meaning: "bài thuyết trình, phần trình bày",
    example: { en: "Her presentation impressed all the corporate executives.", vi: "Bài thuyết trình của cô ấy đã gây ấn tượng với toàn bộ ban điều hành công ty." }
  },
  "schedule": {
    word: "schedule",
    pos: "v. / n.",
    cefrLevel: "B1",
    ipa: "/ˈskedʒuːl/",
    meaning: "lên lịch trình; thời khóa biểu",
    example: { en: "The project is currently running ahead of schedule.", vi: "Dự án hiện đang tiến triển nhanh hơn lịch trình dự kiến." }
  },
  "maintenance": {
    word: "maintenance",
    pos: "n.",
    cefrLevel: "B2",
    ipa: "/ˈmeɪntənəns/",
    meaning: "việc bảo trì, bảo dưỡng",
    example: { en: "Routine maintenance of the cooling system is scheduled for Sunday.", vi: "Việc bảo dưỡng định kỳ hệ thống làm mát được xếp lịch vào Chủ nhật." }
  },
  "discount": {
    word: "discount",
    pos: "n. / v.",
    cefrLevel: "A2",
    ipa: "/ˈdɪskaʊnt/",
    meaning: "chiết khấu, giảm giá",
    example: { en: "Corporate clients receive a 15% discount on bulk purchases.", vi: "Khách hàng doanh nghiệp được hưởng chiết khấu 15% cho các đơn mua số lượng lớn." }
  },
  "confirmation": {
    word: "confirmation",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˌkɒnfəˈmeɪʃn/",
    meaning: "sự xác nhận",
    example: { en: "You will receive an email confirmation once the payment is processed.", vi: "Bạn sẽ nhận được email xác nhận ngay khi thanh toán được xử lý." }
  },
  "supplier": {
    word: "supplier",
    pos: "n.",
    cefrLevel: "B2",
    ipa: "/səˈplaɪər/",
    meaning: "nhà cung cấp",
    example: { en: "We negotiate bulk terms with our raw materials supplier.", vi: "Chúng tôi đàm phán các điều khoản khối lượng với nhà cung cấp nguyên vật liệu." }
  },
  "contract": {
    word: "contract",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈkɒntrækt/",
    meaning: "hợp đồng giao kết",
    example: { en: "Both parties signed a two-year service contract yesterday.", vi: "Cả hai bên đã ký hợp đồng dịch vụ thời hạn hai năm vào ngày hôm qua." }
  },
  "deadline": {
    word: "deadline",
    pos: "n.",
    cefrLevel: "B1",
    ipa: "/ˈdedlaɪn/",
    meaning: "hạn chót hoàn thành",
    example: { en: "The editorial team worked late to meet the printing deadline.", vi: "Đội ngũ biên tập đã làm thêm muộn để kịp hạn chót in ấn." }
  },
  "inventory": {
    word: "inventory",
    pos: "n.",
    cefrLevel: "B2",
    ipa: "/ˈɪnvəntri/",
    meaning: "hàng tồn kho, bản kiểm kê hàng hóa",
    example: { en: "The warehouse conducts an annual inventory check in December.", vi: "Nhà kho thực hiện kiểm kê hàng tồn kho thường niên vào tháng Mười Hai." }
  }
};

/**
 * Dịch một phương án TOEIC hoặc câu tiếng Anh sang tiếng Việt tự nhiên
 */
export function translateToeicOption(text: string): string {
  if (!text) return "";
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase().replace(/[.]+$/, "");

  // 1. Khớp chính xác câu đã biết
  if (SENTENCE_TRANSLATIONS[lower]) {
    return SENTENCE_TRANSLATIONS[lower];
  }
  if (SENTENCE_TRANSLATIONS[lower + "."]) {
    return SENTENCE_TRANSLATIONS[lower + "."];
  }

  // 2. Dịch theo từ vựng đơn lẻ nếu là 1 từ hoặc 2 từ
  if (TOEIC_VOCAB_DICT[lower]) {
    return TOEIC_VOCAB_DICT[lower].meaning;
  }

  // 3. Quy tắc ngữ pháp / mẫu câu TOEIC phổ biến
  // Part 1 mẫu hành động hiện tại tiếp diễn
  if (/^a man is /i.test(cleaned)) {
    const action = cleaned.replace(/^a man is /i, "").trim().replace(/[.]+$/, "");
    return `Một người đàn ông đang ${translateActionPhrase(action)}.`;
  }
  if (/^a woman is /i.test(cleaned)) {
    const action = cleaned.replace(/^a woman is /i, "").trim().replace(/[.]+$/, "");
    return `Một người phụ nữ đang ${translateActionPhrase(action)}.`;
  }
  if (/^some people are /i.test(cleaned) || /^people are /i.test(cleaned)) {
    const action = cleaned.replace(/^(some people are|people are) /i, "").trim().replace(/[.]+$/, "");
    return `Mọi người đang ${translateActionPhrase(action)}.`;
  }
  if (/^he('s| is) /i.test(cleaned)) {
    const action = cleaned.replace(/^he('s| is) /i, "").trim().replace(/[.]+$/, "");
    return `Anh ấy đang ${translateActionPhrase(action)}.`;
  }
  if (/^she('s| is) /i.test(cleaned)) {
    const action = cleaned.replace(/^she('s| is) /i, "").trim().replace(/[.]+$/, "");
    return `Cô ấy đang ${translateActionPhrase(action)}.`;
  }
  if (/^they('re| are) /i.test(cleaned)) {
    const action = cleaned.replace(/^they('re| are) /i, "").trim().replace(/[.]+$/, "");
    return `Họ đang ${translateActionPhrase(action)}.`;
  }
  if (/^some (\w+) are being /i.test(cleaned)) {
    return `Một số vật dụng đang được xử lý trong bối cảnh.`;
  }

  // Part 2 mẫu câu hỏi / đáp
  if (/^yes,/i.test(cleaned) || /^yes /i.test(cleaned)) {
    return `Vâng, ${cleaned.replace(/^yes[, ]*/i, "")}`;
  }
  if (/^no,/i.test(cleaned) || /^no /i.test(cleaned)) {
    return `Không, ${cleaned.replace(/^no[, ]*/i, "")}`;
  }
  if (/^sure,/i.test(cleaned) || /^sure /i.test(cleaned)) {
    return `Chắc chắn rồi, ${cleaned.replace(/^sure[, ]*/i, "")}`;
  }

  // Mẫu câu hỏi Part 3/4/7
  if (/^what did /i.test(cleaned)) return `Người trong bài đã làm gì?`;
  if (/^what will /i.test(cleaned)) return `Người trong bài dự định sẽ làm gì tiếp theo?`;
  if (/^where does /i.test(cleaned)) return `Sự việc diễn ra ở địa điểm nào?`;
  if (/^who most likely /i.test(cleaned)) return `Người nói rất có thể là ai?`;
  if (/^why is /i.test(cleaned)) return `Tại sao sự việc lại diễn ra?`;

  return cleaned;
}

function translateActionPhrase(phrase: string): string {
  const p = phrase.toLowerCase();
  if (p.includes("adjusting his eyeglasses")) return "điều chỉnh kính mắt khi đọc";
  if (p.includes("entering the garage")) return "đi vào nhà để xe";
  if (p.includes("standing in an elevator")) return "đứng trong thang máy";
  if (p.includes("unloaded")) return "được dỡ hàng xuống";
  if (p.includes("wiping down") || p.includes("wiping off")) return "lau sạch bề mặt";
  if (p.includes("queuing up") || p.includes("waiting in line")) return "xếp hàng chờ đợi";
  if (p.includes("eating")) return "dùng bữa / ăn uống";
  if (p.includes("standing in the snow")) return "đứng trong tuyết";
  if (p.includes("brushing snow")) return "quét tuyết";
  if (p.includes("shoveling")) return "xúc tuyết dọn lối đi";
  if (p.includes("putting on")) return "mặc / đeo vào";
  if (p.includes("taking off")) return "cởi / tháo ra";
  if (p.includes("having a conversation")) return "trò chuyện cùng nhau";
  if (p.includes("hanging art")) return "treo tranh nghệ thuật";
  if (p.includes("rearranging")) return "sắp xếp lại đồ đạc";
  if (p.includes("painting a picture")) return "vẽ một bức tranh";
  if (p.includes("displayed")) return "được trưng bày";
  if (p.includes("typing on a keyboard")) return "gõ bàn phím";
  if (p.includes("looking at")) return "nhìn chăm chú vào";
  if (p.includes("talking on the phone")) return "nói chuyện điện thoại";
  if (p.includes("walking")) return "đi bộ";
  if (p.includes("sitting")) return "ngồi";
  if (p.includes("holding")) return "cầm nắm đồ vật";
  if (p.includes("carrying")) return "mang vác đồ vật";
  if (p.includes("drinking")) return "uống nước";
  if (p.includes("reading")) return "đọc tài liệu";
  if (p.includes("pointing at")) return "chỉ tay vào";
  return phrase;
}

/**
 * Trích xuất hoặc làm giàu danh sách từ vựng cho câu hỏi
 */
export function getEnrichedVocabList(q: PracticeQuestion): VocabListItem[] {
  if (q.vocabList && Array.isArray(q.vocabList) && q.vocabList.length >= 2) {
    return q.vocabList;
  }

  // Quét từ vựng cốt lõi từ câu hỏi và các phương án
  const combinedText = [
    q.questionText || "",
    ...Object.values(q.options || {}),
    q.passage || "",
  ].join(" ").toLowerCase();

  const found: VocabListItem[] = [];
  const words = Object.keys(TOEIC_VOCAB_DICT);

  for (const w of words) {
    const regex = new RegExp(`\\b${w}\\b`, "i");
    if (regex.test(combinedText)) {
      found.push(TOEIC_VOCAB_DICT[w]);
      if (found.length >= 4) break;
    }
  }

  // Nếu tìm được < 2 từ, bổ sung các từ vựng tiêu biểu cho Part này
  const qPart = normalizeToeicPart(q.part);
  if (found.length < 2) {
    if (qPart === "Part 1") {
      if (!found.some(v => v.word === "adjust")) found.push(TOEIC_VOCAB_DICT["adjust"]);
      if (!found.some(v => v.word === "vehicle")) found.push(TOEIC_VOCAB_DICT["vehicle"]);
      if (!found.some(v => v.word === "unload")) found.push(TOEIC_VOCAB_DICT["unload"]);
    } else if (qPart === "Part 2" || qPart === "Part 3" || qPart === "Part 4") {
      if (!found.some(v => v.word === "projector")) found.push(TOEIC_VOCAB_DICT["projector"]);
      if (!found.some(v => v.word === "available")) found.push(TOEIC_VOCAB_DICT["available"]);
      if (!found.some(v => v.word === "schedule")) found.push(TOEIC_VOCAB_DICT["schedule"]);
    } else {
      if (!found.some(v => v.word === "regional")) found.push(TOEIC_VOCAB_DICT["regional"]);
      if (!found.some(v => v.word === "equipment")) found.push(TOEIC_VOCAB_DICT["equipment"]);
      if (!found.some(v => v.word === "contract")) found.push(TOEIC_VOCAB_DICT["contract"]);
    }
  }

  return found.slice(0, 4);
}

/**
 * Sinh Mẹo & Bẫy đề thi đặc trưng cho từng phần TOEIC
 */
export function getEnrichedTrapNote(q: PracticeQuestion): string {
  if (q.trapNote && q.trapNote.trim()) return q.trapNote.trim();
  if (q.note && q.note.trim()) return q.note.trim();

  const qPart = normalizeToeicPart(q.part);

  if (qPart === "Part 1") {
    return "Bẫy hành động đang diễn ra (is being V-ed) đối với đồ vật không có người tác động; bẫy từ gần âm hoặc bẫy vật thể có thật trong phòng nhưng không đúng hành động miêu tả.";
  }
  if (qPart === "Part 2") {
    return "Bẫy lặp lại từ khóa (Same-sounding words) xuất hiện ở câu hỏi nhưng mang nghĩa khác; bẫy trả lời Yes/No cho câu hỏi Wh-question; chú ý câu trả lời gián tiếp hoặc tránh né trực diện.";
  }
  if (qPart === "Part 3" || qPart === "Part 4") {
    return "Bẫy thông tin gây nhiễu trước khi nhân vật đổi ý; bẫy chọn từ khóa nghe thấy đầu tiên nhưng sai chủ thể (người nam hay người nữ) hoặc sai thì quá khứ/tương lai.";
  }
  if (qPart === "Part 5") {
    return "Bẫy cấu trúc từ loại (Noun / Adjective / Adverb / Verb); bẫy thì động từ và sự hòa hợp giữa chủ ngữ số ít/số nhiều; bẫy phân biệt giữa Giới từ (đi với N/V-ing) và Liên từ (đi với mệnh đề S+V).";
  }
  if (qPart === "Part 6") {
    return "Bẫy chọn liên từ chuyển ý (However, Therefore, Furthermore, In addition); bẫy chọn câu hoàn chỉnh điền vào đoạn văn đòi hỏi phải hiểu logic câu trước và câu sau.";
  }
  if (qPart === "Part 7") {
    return "Bẫy từ đồng nghĩa (Paraphrasing); bẫy câu hỏi phủ định (NOT / TRUE); bẫy suy diễn quá mức ngoài phạm vi bài đọc cung cấp; chú ý thông tin bổ sung ở chân trang hoặc ghi chú hoa thị (*).";
  }

  return "Chú ý đọc kỹ từ khóa và loại trừ các phương án gây nhiễu trước khi chọn đáp án cuối cùng.";
}

/**
 * Hàm trung tâm làm giàu toàn diện cho một câu hỏi TOEIC
 */
export function enrichPracticeQuestion(q: PracticeQuestion): PracticeQuestion {
  if (!q) return q;

  const qPart = normalizeToeicPart(q.part);
  const options = q.options || {};
  const optionKeys = Object.keys(options);

  // 1. Dịch câu hỏi chuẩn
  let questionEn = q.questionText || "";
  let questionVi = q.translation || "";
  const existingOptTrans: Record<string, string> = { ...(q.optionTranslations || q.optionGlosses || {}) };

  // Xử lý trích xuất từ bilingualPassage hoặc translation nếu có dạng (A) ... (B) ...
  const source = q.bilingualPassage || q.translation || "";
  if (source && source.includes("(A)")) {
    const parts = source.split(/(?:\(([A-D])\)|(?:^|\s)([A-D])[\.:\)])/i);
    for (let i = 1; i < parts.length; i += 3) {
      const key = (parts[i] || parts[i + 1] || "").toUpperCase();
      const val = parts[i + 2]?.trim();
      if (key && val && !existingOptTrans[key]) {
        existingOptTrans[key] = val.replace(/[;,\.]+$/, "").trim();
      }
    }
  }

  if (qPart === "Part 1") {
    // Với Part 1: Câu hỏi chuẩn luôn là nhìn hình và chọn câu mô tả đúng nhất
    questionEn = "Look at the photograph and choose the statement that best describes what you see.";
    
    // Nếu q.translation cũ đang chứa câu dịch của đáp án đúng (ví dụ: "Một người đàn ông đang điều chỉnh...")
    // thì ta lưu câu đó vào phương án đúng, và đặt bản dịch câu hỏi thành câu dịch chuẩn!
    if (q.translation && !q.translation.toLowerCase().includes("nhìn vào") && !q.translation.toLowerCase().includes("bức ảnh")) {
      if (q.correctAnswer && !existingOptTrans[q.correctAnswer]) {
        existingOptTrans[q.correctAnswer] = q.translation;
      }
    }
    questionVi = "Nhìn vào bức ảnh và chọn câu miêu tả đúng nhất những gì bạn thấy trong hình.";
  } else if (qPart === "Part 2") {
    // Với Part 2: Tách câu hỏi ra khỏi các đáp án nếu bị dính trong passage
    if (!questionEn || questionEn.toLowerCase().includes("mark your answer") || questionEn.toLowerCase().includes("listen to the question")) {
      if (q.passage) {
        const parts = q.passage.split(/(?:\([A-D]\)|(?:^|\s)[A-D][\.:\)])/i);
        if (parts[0]?.trim()) questionEn = parts[0].trim();
      }
    }
    if (!questionVi && q.bilingualPassage) {
      const parts = q.bilingualPassage.split(/(?:\([A-D]\)|(?:^|\s)[A-D][\.:\)])/i);
      if (parts[0]?.trim()) questionVi = parts[0].trim();
    }
  }

  // 2. Dịch tất cả các phương án chọn lựa A, B, C, D
  optionKeys.forEach((key) => {
    if (qPart === "Part 2" && key === "D") return;
    if (!existingOptTrans[key] || existingOptTrans[key].trim() === "" || existingOptTrans[key].trim() === ".") {
      const optVal = options[key] || "";
      if (optVal && optVal !== ".") {
        existingOptTrans[key] = translateToeicOption(optVal);
      }
    }
  });

  // 3. Từ vựng trọng tâm cần học (bảo đảm luôn có 2-4 từ phong phú)
  const vocabList = getEnrichedVocabList(q);

  // 4. Mẹo & Bẫy trong câu
  const trapNote = getEnrichedTrapNote(q);

  // 5. Giải thích chi tiết
  let explanation = q.explanation || "";
  if (!explanation || explanation.includes("Hành động và bối cảnh trong câu")) {
    const correctVal = options[q.correctAnswer] || "";
    const correctVi = existingOptTrans[q.correctAnswer] || "";
    if (qPart === "Part 1") {
      explanation = `Hành động và sự vật trong phương án (${q.correctAnswer}): '${correctVal}' (${correctVi}) miêu tả hoàn toàn chính xác những gì quan sát được trong bức ảnh câu ${q.questionNum || 1}. Các phương án còn lại là bẫy về hành động không xảy ra hoặc vật thể không xuất hiện trong hình.`;
    } else if (qPart === "Part 2") {
      explanation = `Phương án (${q.correctAnswer}): '${correctVal}' (${correctVi}) là câu phản hồi hợp lý và tự nhiên nhất cho câu hỏi.`;
    } else if (qPart === "Part 5") {
      explanation = `Căn cứ vào cấu trúc ngữ pháp và vị trí chỗ trống trong câu, phương án chính xác là (${q.correctAnswer}): '${correctVal}' (${correctVi}).`;
    } else {
      explanation = `Thông tin trong bài đọc/bài nghe trực tiếp tương ứng với phương án (${q.correctAnswer}): '${correctVal}' (${correctVi}).`;
    }
  }

  return {
    ...q,
    questionText: questionEn,
    translation: questionVi,
    optionTranslations: existingOptTrans,
    optionGlosses: existingOptTrans,
    vocabList,
    trapNote,
    explanation,
  };
}
