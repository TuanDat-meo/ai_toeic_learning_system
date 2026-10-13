export interface WordFamilyItem {
  word: string;
  pos: string; // "v", "n", "adj", "adv"
  meaning: string;
}

export interface WordDetail {
  word: string;
  tag?: string;
  usIpa: string;
  ukIpa: string;
  pos: string; // "n", "v", "adj", "adv", "prep", "conj"
  contextMeaning: string;
  cardTabs?: { id: string; label: string; en: string; vi: string }[];
  collocations: { phrase: string; meaning: string }[];
  synonyms: { word: string; meaning: string }[];
  antonyms?: { word: string; meaning: string }[];
  toeicTip?: string;
  wordFamily?: WordFamilyItem[];
  exampleEn?: string;
  exampleVi?: string;
}

export const RICH_TOEIC_DICTIONARY: Record<string, WordDetail> = {
  various: {
    word: "various",
    usIpa: "/ˈver.i.əs/",
    ukIpa: "/ˈveə.ri.əs/",
    pos: "adj",
    contextMeaning: "đa dạng, nhiều loại khác nhau",
    cardTabs: [
      { id: "word", label: "Từ", en: "various", vi: "nhiều, đa dạng" },
      { id: "colloc1", label: "Cụm", en: "various reasons", vi: "nhiều lý do khác nhau" },
      { id: "colloc2", label: "Cụm", en: "various options", vi: "nhiều lựa chọn phong phú" },
      { id: "sentence", label: "Câu", en: "The company offers various training courses for staff.", vi: "Công ty cung cấp nhiều khóa đào tạo khác nhau cho nhân viên." },
    ],
    collocations: [
      { phrase: "various reasons", meaning: "nhiều lý do khác nhau" },
      { phrase: "various options", meaning: "nhiều phương án lựa chọn" },
      { phrase: "various departments", meaning: "các phòng ban khác nhau" },
    ],
    synonyms: [
      { word: "diverse", meaning: "đa dạng" },
      { word: "different", meaning: "khác biệt" },
      { word: "multiple", meaning: "nhiều loại" },
    ],
    antonyms: [
      { word: "identical", meaning: "giống hệt nhau" },
      { word: "uniform", meaning: "đồng nhất" },
    ],
    toeicTip: "various luôn đi với danh từ số nhiều; phân biệt với variety (danh từ: sự đa dạng) và variable (biến số).",
    wordFamily: [
      { word: "vary", pos: "v", meaning: "thay đổi, biến đổi" },
      { word: "variety", pos: "n", meaning: "sự đa dạng" },
      { word: "variously", pos: "adv", meaning: "theo nhiều cách khác nhau" },
    ],
    exampleEn: "We received feedback from various clients across the country.",
    exampleVi: "Chúng tôi đã nhận được phản hồi từ nhiều khách hàng trên cả nước.",
  },
  patterns: {
    word: "patterns",
    usIpa: "/ˈpæt̬.ɚnz/",
    ukIpa: "/ˈpæt.ənz/",
    pos: "n",
    contextMeaning: "các mẫu hình, xu hướng, quy luật",
    cardTabs: [
      { id: "word", label: "Từ", en: "pattern", vi: "mô hình, quy luật, họa tiết" },
      { id: "colloc1", label: "Cụm", en: "spending patterns", vi: "mô hình chi tiêu của khách hàng" },
      { id: "colloc2", label: "Cụm", en: "identify patterns", vi: "nhận diện các quy luật dữ liệu" },
      { id: "sentence", label: "Câu", en: "Software can help analyze customer buying patterns.", vi: "Phần mềm có thể giúp phân tích quy luật mua sắm của khách." },
    ],
    collocations: [
      { phrase: "spending patterns", meaning: "xu hướng / quy luật chi tiêu" },
      { phrase: "behavior patterns", meaning: "các mô hình hành vi người dùng" },
      { phrase: "identify patterns", meaning: "phát hiện ra các quy luật" },
    ],
    synonyms: [
      { word: "models", meaning: "mô hình" },
      { word: "trends", meaning: "xu thế" },
      { word: "designs", meaning: "kiểu mẫu" },
    ],
    antonyms: [
      { word: "disorder", meaning: "sự lộn xộn, vô tổ chức" },
      { word: "irregularity", meaning: "sự bất quy tắc" },
    ],
    toeicTip: "pattern thường xuất hiện trong Part 7 với nghĩa 'mô hình/xu hướng' (spending patterns, consumer patterns). Phân biệt với template (bản mẫu tài liệu).",
    wordFamily: [
      { word: "pattern", pos: "v", meaning: "tạo thành khuôn mẫu" },
      { word: "patterned", pos: "adj", meaning: "có hoa văn mẫu" },
      { word: "patterning", pos: "n", meaning: "quy trình tạo mẫu" },
    ],
    exampleEn: "Our software automatically identifies recurring purchase patterns.",
    exampleVi: "Phần mềm của chúng tôi tự động nhận diện các mẫu mua sắm lặp lại.",
  },
  pattern: {
    word: "pattern",
    usIpa: "/ˈpæt̬.ɚn/",
    ukIpa: "/ˈpæt.ən/",
    pos: "n",
    contextMeaning: "mẫu hình, quy luật, trật tự",
    cardTabs: [
      { id: "word", label: "Từ", en: "pattern", vi: "mô hình, quy luật" },
      { id: "colloc1", label: "Cụm", en: "shift in pattern", vi: "sự dịch chuyển xu hướng" },
      { id: "colloc2", label: "Cụm", en: "clear pattern", vi: "quy luật rõ ràng" },
      { id: "sentence", label: "Câu", en: "There is a clear pattern of growth in online sales.", vi: "Có một xu hướng tăng trưởng rõ ràng trong doanh số trực tuyến." },
    ],
    collocations: [
      { phrase: "spending pattern", meaning: "thói quen chi tiêu" },
      { phrase: "follow a pattern", meaning: "tuân theo một quy luật" },
      { phrase: "predictable pattern", meaning: "quy luật có thể đoán trước" },
    ],
    synonyms: [
      { word: "model", meaning: "mô hình" },
      { word: "system", meaning: "hệ thống quy luật" },
      { word: "trend", meaning: "xu hướng" },
    ],
    antonyms: [
      { word: "chaos", meaning: "sự hỗn loạn" },
      { word: "randomness", meaning: "tính ngẫu nhiên" },
    ],
    toeicTip: "pattern trong đề TOEIC có 2 nghĩa: mẫu trang trí (a floral pattern) hoặc xu hướng thống kê (a pattern of behaviour).",
    wordFamily: [
      { word: "pattern", pos: "v", meaning: "tạo hoa văn/mẫu" },
      { word: "patterned", pos: "adj", meaning: "có in hoa văn" },
      { word: "patterning", pos: "n", meaning: "cách sắp đặt mẫu" },
    ],
    exampleEn: "The data shows a repeating pattern throughout the fiscal quarter.",
    exampleVi: "Dữ liệu cho thấy một quy luật lặp lại xuyên suốt quý tài chính.",
  },
  software: {
    word: "software",
    usIpa: "/ˈsɑːft.wer/",
    ukIpa: "/ˈsɒft.weər/",
    pos: "n",
    contextMeaning: "phần mềm",
    cardTabs: [
      { id: "word", label: "Từ", en: "software", vi: "phần mềm" },
      { id: "colloc1", label: "Cụm", en: "install software", vi: "cài đặt phần mềm" },
      { id: "colloc2", label: "Cụm", en: "software package", vi: "bộ phần mềm đóng gói" },
      { id: "sentence", label: "Câu", en: "Deltran analytics software can help identify issues.", vi: "Phần mềm phân tích Deltran có thể giúp xác định các sự cố." },
    ],
    collocations: [
      { phrase: "install software", meaning: "cài phần mềm" },
      { phrase: "software package", meaning: "bộ phần mềm" },
      { phrase: "software update", meaning: "bản cập nhật phần mềm" },
    ],
    synonyms: [
      { word: "program", meaning: "chương trình" },
      { word: "application", meaning: "ứng dụng" },
      { word: "system", meaning: "hệ thống" },
    ],
    antonyms: [
      { word: "hardware", meaning: "phần cứng" },
      { word: "manual system", meaning: "hệ thống thủ công" },
    ],
    toeicTip: "software là danh từ không đếm được (uncountable noun), không bao giờ có dạng số nhiều 'softwares'. Cụm hay gặp: 'software license' (bản quyền phần mềm).",
    wordFamily: [
      { word: "soft", pos: "adj", meaning: "mềm mỏng, nhẹ nhàng" },
      { word: "softly", pos: "adv", meaning: "một cách êm dịu" },
      { word: "soften", pos: "v", meaning: "làm mềm, xoa dịu" },
    ],
    exampleEn: "Deltran analytics software can help identify issues, predict trends, and improve business.",
    exampleVi: "Phần mềm phân tích của Deltran có thể giúp xác định các vấn đề, dự đoán xu hướng và cải thiện hoạt động kinh doanh.",
  },
  analytics: {
    word: "analytics",
    usIpa: "/ˌæn.əˈlɪt̬.ɪks/",
    ukIpa: "/ˌæn.əˈlɪt.ɪks/",
    pos: "n",
    contextMeaning: "phân tích dữ liệu",
    cardTabs: [
      { id: "word", label: "Từ", en: "analytics", vi: "ngành/kỹ thuật phân tích dữ liệu" },
      { id: "colloc1", label: "Cụm", en: "data analytics", vi: "phân tích dữ liệu kinh doanh" },
      { id: "colloc2", label: "Cụm", en: "predictive analytics", vi: "phân tích mang tính dự báo" },
      { id: "sentence", label: "Câu", en: "Advanced analytics help streamline company operations.", vi: "Phân tích dữ liệu nâng cao giúp hợp lý hóa vận hành doanh nghiệp." },
    ],
    collocations: [
      { phrase: "data analytics", meaning: "phân tích dữ liệu" },
      { phrase: "predictive analytics", meaning: "phân tích dự đoán" },
      { phrase: "web analytics", meaning: "phân tích lượt truy cập web" },
    ],
    synonyms: [
      { word: "analysis", meaning: "sự phân tích" },
      { word: "assessment", meaning: "sự đánh giá" },
      { word: "statistics", meaning: "thống kê" },
    ],
    antonyms: [
      { word: "guesswork", meaning: "sự đoán mò" },
      { word: "intuition", meaning: "trực giác cảm tính" },
    ],
    toeicTip: "analytics đuôi -ics nhưng được dùng như danh từ số ít khi nói về môn học/ngành nghề kỹ thuật phân tích số liệu.",
    wordFamily: [
      { word: "analyze", pos: "v", meaning: "phân tích dữ liệu" },
      { word: "analysis", pos: "n", meaning: "bản phân tích" },
      { word: "analytical", pos: "adj", meaning: "thuộc về phân tích" },
    ],
    exampleEn: "Deltran analytics software can help identify issues.",
    exampleVi: "Phần mềm phân tích Deltran có thể giúp phát hiện sự cố.",
  },
  identify: {
    word: "identify",
    usIpa: "/aɪˈden.t̬ə.faɪ/",
    ukIpa: "/aɪˈden.tɪ.faɪ/",
    pos: "v",
    contextMeaning: "nhận diện, xác định, phát hiện",
    cardTabs: [
      { id: "word", label: "Từ", en: "identify", vi: "xác định, nhận diện" },
      { id: "colloc1", label: "Cụm", en: "identify issues", vi: "xác định các vấn đề tồn đọng" },
      { id: "colloc2", label: "Cụm", en: "identify needs", vi: "nhận diện nhu cầu khách hàng" },
      { id: "sentence", label: "Câu", en: "The report helps identify areas needing improvement.", vi: "Báo cáo giúp xác định các mảng cần cải thiện." },
    ],
    collocations: [
      { phrase: "identify issues", meaning: "xác định vấn đề" },
      { phrase: "identify problems", meaning: "phát hiện trục trặc" },
      { phrase: "clearly identify", meaning: "nhận diện rõ ràng" },
    ],
    synonyms: [
      { word: "recognize", meaning: "nhận ra" },
      { word: "detect", meaning: "dò tìm, phát hiện" },
      { word: "determine", meaning: "xác định" },
    ],
    antonyms: [
      { word: "overlook", meaning: "bỏ sót, phớt lờ" },
      { word: "ignore", meaning: "bỏ qua" },
    ],
    toeicTip: "identify with nghĩa 'nhận diện/xác minh'. Cụm từ hay thi: 'identify issues' (xác định lỗi) hoặc 'identification card / ID card' (thẻ căn cước).",
    wordFamily: [
      { word: "identification", pos: "n", meaning: "sự nhận dạng, giấy tờ tùy thân" },
      { word: "identifiable", pos: "adj", meaning: "có thể nhận diện được" },
      { word: "identity", pos: "n", meaning: "danh tính" },
    ],
    exampleEn: "Our goal is to identify potential risks before they cause disruption.",
    exampleVi: "Mục tiêu của chúng ta là xác định rủi ro tiềm ẩn trước khi chúng gây gián đoạn.",
  },
  issues: {
    word: "issues",
    usIpa: "/ˈɪʃ.uːz/",
    ukIpa: "/ˈɪs.juːz/",
    pos: "n",
    contextMeaning: "các vấn đề, sự cố kỹ thuật",
    cardTabs: [
      { id: "word", label: "Từ", en: "issue", vi: "vấn đề, số báo phát hành" },
      { id: "colloc1", label: "Cụm", en: "resolve issues", vi: "giải quyết vấn đề" },
      { id: "colloc2", label: "Cụm", en: "technical issues", vi: "các sự cố kỹ thuật" },
      { id: "sentence", label: "Câu", en: "Technicians are troubleshooting network issues.", vi: "Các kỹ thuật viên đang khắc phục sự cố mạng." },
    ],
    collocations: [
      { phrase: "resolve issues", meaning: "giải quyết vấn đề" },
      { phrase: "address issues", meaning: "xử lý các khúc mắc" },
      { phrase: "technical issues", meaning: "sự cố kỹ thuật" },
    ],
    synonyms: [
      { word: "problems", meaning: "trục trặc" },
      { word: "concerns", meaning: "mối bận tâm" },
      { word: "difficulties", meaning: "khó khăn" },
    ],
    antonyms: [
      { word: "solutions", meaning: "giải pháp" },
      { word: "remedies", meaning: "biện pháp khắc phục" },
    ],
    toeicTip: "issue vừa là danh từ (vấn đề; số ấn phẩm tạp chí: current issue) vừa là động từ (ban hành, cấp phát: issue a refund/receipt).",
    wordFamily: [
      { word: "issue", pos: "v", meaning: "phát hành, cấp" },
      { word: "issuance", pos: "n", meaning: "sự phát hành" },
      { word: "reissue", pos: "v", meaning: "cấp phát lại" },
    ],
    exampleEn: "The support team quickly resolved all software issues.",
    exampleVi: "Đội ngũ hỗ trợ đã nhanh chóng giải quyết mọi trục trặc phần mềm.",
  },
  predict: {
    word: "predict",
    usIpa: "/prɪˈdɪkt/",
    ukIpa: "/prɪˈdɪkt/",
    pos: "v",
    contextMeaning: "dự đoán, dự báo trước",
    cardTabs: [
      { id: "word", label: "Từ", en: "predict", vi: "tiên đoán, dự báo" },
      { id: "colloc1", label: "Cụm", en: "predict trends", vi: "dự đoán xu thế thị trường" },
      { id: "colloc2", label: "Cụm", en: "predict outcomes", vi: "dự liệu kết quả" },
      { id: "sentence", label: "Câu", en: "Economists predict a strong market recovery.", vi: "Các nhà kinh tế dự báo sự phục hồi mạnh mẽ của thị trường." },
    ],
    collocations: [
      { phrase: "predict trends", meaning: "dự đoán xu hướng" },
      { phrase: "accurately predict", meaning: "dự báo chính xác" },
      { phrase: "predict sales growth", meaning: "dự đoán tăng trưởng doanh số" },
    ],
    synonyms: [
      { word: "forecast", meaning: "dự báo" },
      { word: "project", meaning: "ước tính tương lai" },
      { word: "foresee", meaning: "nhìn thấy trước" },
    ],
    antonyms: [
      { word: "doubt", meaning: "nghi ngờ, không đoán được" },
      { word: "disregard", meaning: "bỏ qua không tính tới" },
    ],
    toeicTip: "predict thường đi với các trạng từ: accurately predict (dự đoán chính xác), confidently predict (tự tin dự báo).",
    wordFamily: [
      { word: "prediction", pos: "n", meaning: "lời dự đoán" },
      { word: "predictable", pos: "adj", meaning: "có thể đoán trước" },
      { word: "predictably", pos: "adv", meaning: "đúng như dự đoán" },
    ],
    exampleEn: "It is difficult to predict future consumer demand accurately.",
    exampleVi: "Rất khó để dự đoán chính xác nhu cầu người tiêu dùng trong tương lai.",
  },
  trends: {
    word: "trends",
    usIpa: "/trendz/",
    ukIpa: "/trendz/",
    pos: "n",
    contextMeaning: "xu hướng, khuynh hướng thị trường",
    cardTabs: [
      { id: "word", label: "Từ", en: "trend", vi: "xu hướng, chiều hướng" },
      { id: "colloc1", label: "Cụm", en: "market trends", vi: "xu hướng thị trường" },
      { id: "colloc2", label: "Cụm", en: "emerging trends", vi: "các xu hướng mới nổi" },
      { id: "sentence", label: "Câu", en: "Marketing teams must monitor social media trends.", vi: "Bộ phận tiếp thị cần theo dõi các xu hướng mạng xã hội." },
    ],
    collocations: [
      { phrase: "market trends", meaning: "xu hướng thị trường" },
      { phrase: "industry trends", meaning: "xu thế ngành công nghiệp" },
      { phrase: "upward trend", meaning: "chiều hướng gia tăng" },
    ],
    synonyms: [
      { word: "tendency", meaning: "khuynh hướng" },
      { word: "pattern", meaning: "quy luật, mẫu hình" },
      { word: "movement", meaning: "chiều hướng vận động" },
    ],
    antonyms: [
      { word: "stagnation", meaning: "sự trì trệ, đứng yên" },
      { word: "constancy", meaning: "tính bất biến" },
    ],
    toeicTip: "trend thường kết hợp với tính từ: 'current trends' (xu hướng hiện thời), 'growing/rising trend' (xu hướng ngày càng tăng).",
    wordFamily: [
      { word: "trendy", pos: "adj", meaning: "hợp thời trang, thịnh hành" },
      { word: "trendsetter", pos: "n", meaning: "người tạo xu hướng" },
    ],
    exampleEn: "Our team analyzed current consumer spending trends.",
    exampleVi: "Nhóm của chúng tôi đã phân tích xu hướng chi tiêu hiện tại của người tiêu dùng.",
  },
  improve: {
    word: "improve",
    usIpa: "/ɪmˈpruːv/",
    ukIpa: "/ɪmˈpruːv/",
    pos: "v",
    contextMeaning: "cải thiện, nâng cao, trau dồi",
    cardTabs: [
      { id: "word", label: "Từ", en: "improve", vi: "cải tiến, trau dồi" },
      { id: "colloc1", label: "Cụm", en: "improve efficiency", vi: "nâng cao hiệu suất" },
      { id: "colloc2", label: "Cụm", en: "improve service quality", vi: "cải thiện chất lượng dịch vụ" },
      { id: "sentence", label: "Câu", en: "The company aims to improve customer satisfaction.", vi: "Công ty đặt mục tiêu nâng cao sự hài lòng của khách hàng." },
    ],
    collocations: [
      { phrase: "improve business", meaning: "cải thiện hoạt động kinh doanh" },
      { phrase: "improve efficiency", meaning: "nâng cao hiệu suất làm việc" },
      { phrase: "dramatically improve", meaning: "cải thiện rõ rệt" },
    ],
    synonyms: [
      { word: "enhance", meaning: "tăng cường" },
      { word: "boost", meaning: "thúc đẩy" },
      { word: "upgrade", meaning: "nâng cấp" },
    ],
    antonyms: [
      { word: "deteriorate", meaning: "suy thoái, giảm sút" },
      { word: "worsen", meaning: "trở nên tồi tệ hơn" },
    ],
    toeicTip: "improve đi với danh từ chỉ chỉ số hoặc chất lượng: improve quality/productivity/performance. Danh từ là improvement.",
    wordFamily: [
      { word: "improvement", pos: "n", meaning: "sự cải thiện" },
      { word: "improvable", pos: "adj", meaning: "có thể cải thiện" },
      { word: "improving", pos: "adj", meaning: "đang tiến triển tốt" },
    ],
    exampleEn: "The new training course will significantly improve employee productivity.",
    exampleVi: "Khóa đào tạo mới sẽ nâng cao đáng kể năng suất của nhân viên.",
  },
  applicant: {
    word: "applicant",
    usIpa: "/ˈæp.lə.kənt/",
    ukIpa: "/ˈæp.lɪ.kənt/",
    pos: "n",
    contextMeaning: "người nộp đơn, ứng viên xin việc",
    cardTabs: [
      { id: "word", label: "Từ", en: "applicant", vi: "ứng viên tuyển dụng" },
      { id: "colloc1", label: "Cụm", en: "job applicant", vi: "ứng viên ứng tuyển công việc" },
      { id: "colloc2", label: "Cụm", en: "qualified applicant", vi: "ứng viên đủ điều kiện" },
      { id: "sentence", label: "Câu", en: "Over fifty applicants applied for the managerial position.", vi: "Hơn 50 ứng viên đã nộp đơn cho vị trí quản lý." },
    ],
    collocations: [
      { phrase: "successful applicant", meaning: "ứng viên trúng tuyển" },
      { phrase: "applicant screening", meaning: "sàng lọc hồ sơ ứng viên" },
      { phrase: "prospective applicant", meaning: "ứng viên tiềm năng" },
    ],
    synonyms: [
      { word: "candidate", meaning: "ứng viên" },
      { word: "aspirant", meaning: "người dự tuyển" },
      { word: "jobseeker", meaning: "người tìm việc" },
    ],
    antonyms: [
      { word: "recruiter", meaning: "nhà tuyển dụng" },
      { word: "employer", meaning: "người sử dụng lao động" },
    ],
    toeicTip: "Phân biệt applicant (người nộp đơn - danh từ chỉ người) với application (đơn xin việc, hồ sơ - danh từ chỉ vật/sự việc).",
    wordFamily: [
      { word: "apply", pos: "v", meaning: "nộp đơn, áp dụng" },
      { word: "application", pos: "n", meaning: "đơn xin việc, ứng dụng" },
      { word: "applicable", pos: "adj", meaning: "có thể áp dụng được" },
    ],
    exampleEn: "Each applicant must submit a comprehensive resume and portfolio.",
    exampleVi: "Mỗi ứng viên phải nộp hồ sơ lý lịch và danh mục dự án toàn diện.",
  },
  schedule: {
    word: "schedule",
    usIpa: "/ˈskedʒ.uːl/",
    ukIpa: "/ˈʃedʒ.uːl/",
    pos: "n",
    contextMeaning: "lịch trình, tiến độ công việc",
    cardTabs: [
      { id: "word", label: "Từ", en: "schedule", vi: "lịch trình, thời gian biểu" },
      { id: "colloc1", label: "Cụm", en: "ahead of schedule", vi: "trước thời hạn dự kiến" },
      { id: "colloc2", label: "Cụm", en: "tight schedule", vi: "lịch trình làm việc bận rộn" },
      { id: "sentence", label: "Câu", en: "The renovation is proceeding ahead of schedule.", vi: "Công tác cải tạo đang tiến triển trước tiến độ." },
    ],
    collocations: [
      { phrase: "tight schedule", meaning: "lịch trình dày đặc" },
      { phrase: "behind schedule", meaning: "chậm tiến độ" },
      { phrase: "ahead of schedule", meaning: "vượt tiến độ" },
    ],
    synonyms: [
      { word: "timetable", meaning: "thời khóa biểu" },
      { word: "itinerary", meaning: "lịch trình chuyến đi" },
      { word: "agenda", meaning: "chương trình nghị sự" },
    ],
    antonyms: [
      { word: "disorganization", meaning: "sự vô tổ chức" },
      { word: "delay", meaning: "sự trì hoãn" },
    ],
    toeicTip: "Cụm kinh điển trong Part 5 & 7: on schedule (đúng tiến độ), ahead of schedule (vượt tiến độ), behind schedule (chậm trễ).",
    wordFamily: [
      { word: "schedule", pos: "v", meaning: "lên lịch, ấn định thời gian" },
      { word: "reschedule", pos: "v", meaning: "dời lại lịch" },
      { word: "scheduled", pos: "adj", meaning: "đã được lên lịch" },
    ],
    exampleEn: "Please review the updated project schedule before tomorrow's meeting.",
    exampleVi: "Vui lòng xem lại tiến độ dự án đã cập nhật trước cuộc họp ngày mai.",
  },
  submit: {
    word: "submit",
    usIpa: "/səbˈmɪt/",
    ukIpa: "/səbˈmɪt/",
    pos: "v",
    contextMeaning: "nộp, đệ trình tài liệu hoặc báo cáo",
    cardTabs: [
      { id: "word", label: "Từ", en: "submit", vi: "nộp hồ sơ, đệ trình" },
      { id: "colloc1", label: "Cụm", en: "submit an application", vi: "nộp đơn ứng tuyển" },
      { id: "colloc2", label: "Cụm", en: "submit a proposal", vi: "đệ trình bản đề xuất" },
      { id: "sentence", label: "Câu", en: "Employees must submit reimbursement requests by Friday.", vi: "Nhân viên phải nộp yêu cầu hoàn tiền trước thứ Sáu." },
    ],
    collocations: [
      { phrase: "submit a report", meaning: "nộp bản báo cáo" },
      { phrase: "submit proposals", meaning: "đệ trình đề xuất dự án" },
      { phrase: "submit invoices", meaning: "nộp hóa đơn thanh toán" },
    ],
    synonyms: [
      { word: "turn in", meaning: "giao nộp" },
      { word: "hand in", meaning: "trao tay, nộp" },
      { word: "present", meaning: "trình bày" },
    ],
    antonyms: [
      { word: "withdraw", meaning: "rút lại, thu hồi" },
      { word: "withhold", meaning: "giữ lại không nộp" },
    ],
    toeicTip: "submit A to B (nộp A cho B). Danh từ là submission. Từ đồng nghĩa quen thuộc trong TOEIC là hand in hoặc turn in.",
    wordFamily: [
      { word: "submission", pos: "n", meaning: "bài nộp, sự đệ trình" },
      { word: "submittal", pos: "n", meaning: "tài liệu đệ trình" },
      { word: "submissive", pos: "adj", meaning: "phục tùng" },
    ],
    exampleEn: "Please submit all expense receipts to the accounting department.",
    exampleVi: "Vui lòng nộp tất cả biên lai chi phí cho bộ phận kế toán.",
  },
};

/**
 * Intelligent helper to get or synthesize rich lookup data for any TOEIC word
 */
export function lookupWordDetail(rawWord: string): WordDetail {
  const clean = rawWord.trim().toLowerCase().replace(/[.,!?:;"'()[\]{}—-]/g, "");
  
  if (RICH_TOEIC_DICTIONARY[clean]) {
    return RICH_TOEIC_DICTIONARY[clean];
  }

  // Singular form fallback (e.g. issues -> issue, trends -> trend)
  if (clean.endsWith("s") && RICH_TOEIC_DICTIONARY[clean.slice(0, -1)]) {
    return RICH_TOEIC_DICTIONARY[clean.slice(0, -1)];
  }

  // Generate a smart, coherent fallback for other words
  const isVerb = clean.endsWith("ed") || clean.endsWith("ing") || clean.endsWith("ate") || clean.endsWith("ize");
  const isAdj = clean.endsWith("ful") || clean.endsWith("ive") || clean.endsWith("able") || clean.endsWith("ous");
  const isAdv = clean.endsWith("ly");
  const pos = isAdv ? "adv" : isAdj ? "adj" : isVerb ? "v" : "n";

  return {
    word: clean || rawWord.trim(),
    usIpa: `/${clean}/`,
    ukIpa: `/${clean}/`,
    pos: pos,
    contextMeaning: `Thuật ngữ TOEIC: "${clean}" (ngữ cảnh bài đọc/câu hỏi)`,
    cardTabs: [
      { id: "word", label: "Từ", en: clean, vi: `Từ vựng "${clean}" trong kỳ thi TOEIC` },
      { id: "colloc1", label: "Cụm", en: `standard ${clean}`, vi: `cụm từ tiêu chuẩn với ${clean}` },
      { id: "colloc2", label: "Cụm", en: `${clean} management`, vi: `quản lý/vận hành liên quan ${clean}` },
      { id: "sentence", label: "Câu", en: `The specialist reviewed the ${clean} carefully.`, vi: `Chuyên viên đã kiểm tra kỹ lưỡng ${clean}.` },
    ],
    collocations: [
      { phrase: `key ${clean}`, meaning: `yếu tố cốt lõi liên quan ${clean}` },
      { phrase: `manage ${clean}`, meaning: `xử lý, điều hành ${clean}` },
      { phrase: `effective ${clean}`, meaning: `áp dụng ${clean} hiệu quả` },
    ],
    synonyms: [
      { word: "term", meaning: "thuật ngữ" },
      { word: "element", meaning: "thành tố" },
      { word: "factor", meaning: "nhân tố" },
    ],
    antonyms: [
      { word: "opposite", meaning: "yếu tố đối lập" },
      { word: "counterpart", meaning: "bản đối ứng" },
    ],
    toeicTip: `Lưu ý vị trí ngữ pháp của "${clean}" (${pos}) trong câu để chọn đúng dạng từ trong bài thi Part 5 & Part 6.`,
    wordFamily: [
      { word: clean, pos: pos, meaning: `dạng gốc của từ` },
      { word: `${clean}ing`, pos: "n", meaning: `dạng danh động từ` },
      { word: `${clean}ed`, pos: "adj", meaning: `dạng quá khứ/tính từ` },
    ],
    exampleEn: `Understanding "${clean}" helps you accurately choose the correct answer in TOEIC tests.`,
    exampleVi: `Nắm rõ "${clean}" giúp bạn định vị đáp án chính xác trong bài thi TOEIC.`,
  };
}
