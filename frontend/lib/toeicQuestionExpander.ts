import { SampleQuestion, ExerciseCardData } from "@/app/admin/content/reading/types";
import { GrammarQuestionItem } from "@/app/admin/content/grammar/types";

// Ngân hàng câu hỏi ngữ pháp TOEIC Part 5 phong phú chuẩn ETS
const TOEIC_PART5_QUESTION_BANK: Array<{
  q: string;
  vi: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}> = [
  {
    q: "All passengers must present their boarding passes ------- entering the aircraft.",
    vi: "Tất cả hành khách phải xuất trình thẻ lên máy bay ------- khi bước vào máy bay.",
    options: ["before", "during", "while", "until"],
    correctIndex: 0,
    explanation: "Giới từ 'before' đi kèm với danh động từ (V-ing) 'entering' để chỉ hành động xảy ra trước.",
  },
  {
    q: "The marketing director announced that the new product launch would be ------- delayed until next quarter.",
    vi: "Giám đốc tiếp thị thông báo rằng việc ra mắt sản phẩm mới sẽ bị trì hoãn ------- cho đến quý sau.",
    options: ["temporarily", "temporary", "temporariness", "temporal"],
    correctIndex: 0,
    explanation: "Cần một trạng từ (adv) 'temporarily' để bổ nghĩa cho động từ phân từ 'delayed'.",
  },
  {
    q: "Mr. Henderson ------- the financial report before submitting it to the executive board yesterday.",
    vi: "Ông Henderson đã ------- báo cáo tài chính trước khi nộp cho ban điều hành vào ngày hôm qua.",
    options: ["reviewed", "reviews", "reviewing", "will review"],
    correctIndex: 0,
    explanation: "Hành động xảy ra trong quá khứ có dấu hiệu 'yesterday' nên động từ chia ở thì Quá khứ đơn 'reviewed'.",
  },
  {
    q: "Ms. Tanaka is responsible for ------- customer inquiries regarding the upcoming software update.",
    vi: "Bà Tanaka chịu trách nhiệm ------- các thắc mắc của khách hàng liên quan đến bản cập nhật phần mềm sắp tới.",
    options: ["handling", "handle", "handled", "handler"],
    correctIndex: 0,
    explanation: "Cụm 'responsible for' đi kèm với V-ing: 'responsible for handling'.",
  },
  {
    q: "The newly renovated conference room is equipped ------- state-of-the-art audiovisual technology.",
    vi: "Phòng hội nghị mới được tân trang lại được trang bị ------- công nghệ nghe nhìn hiện đại nhất.",
    options: ["with", "for", "at", "by"],
    correctIndex: 0,
    explanation: "Cấu trúc bị động đi với giới từ cố định: 'be equipped with' (được trang bị cái gì).",
  },
  {
    q: "Please confirm your attendance by replying to this email ------- Friday at 5:00 P.M.",
    vi: "Vui lòng xác nhận sự tham gia của bạn bằng cách trả lời email này ------- trước 5 giờ chiều thứ Sáu.",
    options: ["by", "on", "at", "to"],
    correctIndex: 0,
    explanation: "Giới từ 'by' chỉ thời hạn muộn nhất: 'by Friday at 5:00 P.M.' (trước hoặc chậm nhất vào thứ Sáu).",
  },
  {
    q: "Neither the project manager nor the team members ------- able to resolve the software bug.",
    vi: "Cả người quản lý dự án lẫn các thành viên trong nhóm đều không ------- giải quyết được lỗi phần mềm.",
    options: ["were", "was", "is", "has been"],
    correctIndex: 0,
    explanation: "Cấu trúc 'Neither S1 nor S2 + V': Động từ chia theo chủ ngữ gần nhất S2 'the team members' (số nhiều) -> 'were'.",
  },
  {
    q: "The CEO commended the engineering team for their ------- performance during the product launch.",
    vi: "Tổng giám đốc đã khen ngợi đội ngũ kỹ thuật vì thành tích ------- của họ trong đợt ra mắt sản phẩm.",
    options: ["outstanding", "outstand", "outstanded", "outstandingly"],
    correctIndex: 0,
    explanation: "Cần một tính từ (adj) 'outstanding' (xuất sắc) đứng trước danh từ 'performance' để bổ nghĩa.",
  },
  {
    q: "Employees who work overtime will receive additional ------- on their monthly paycheck.",
    vi: "Những nhân viên làm việc thêm giờ sẽ nhận được khoản ------- bổ sung trong kỳ lương hàng tháng.",
    options: ["compensation", "compensate", "compensated", "compensatory"],
    correctIndex: 0,
    explanation: "Cần một danh từ (noun) 'compensation' (tiền thù lao/bồi hoàn) đứng sau tính từ 'additional'.",
  },
  {
    q: "Unless the shipment arrives ------- tomorrow morning, we will have to reschedule the delivery.",
    vi: "Trừ khi lô hàng đến ------- sáng mai, chúng tôi sẽ phải sắp xếp lại lịch giao hàng.",
    options: ["by", "with", "during", "for"],
    correctIndex: 0,
    explanation: "'by tomorrow morning' mang nghĩa trước sáng mai để đảm bảo đúng tiến độ.",
  },
  {
    q: "The committee decided to ------- the proposal until further market research could be conducted.",
    vi: "Ủy ban đã quyết định ------- đề xuất cho đến khi nghiên cứu thị trường thêm có thể được tiến hành.",
    options: ["postpone", "postponed", "postponing", "postponement"],
    correctIndex: 0,
    explanation: "Cấu trúc 'decide to + V (nguyên mẫu)': 'decide to postpone'.",
  },
  {
    q: "The warranty covers any defects in materials or workmanship for a ------- of two years.",
    vi: "Bảo hành bao gồm mọi lỗi về vật liệu hoặc tay nghề chế tác trong một ------- là 2 năm.",
    options: ["period", "moment", "schedule", "season"],
    correctIndex: 0,
    explanation: "Cụm danh từ cố định: 'for a period of two years' (trong khoảng thời gian 2 năm).",
  },
  {
    q: "Participants in the seminar were asked to evaluate the speaker ------- the end of the session.",
    vi: "Những người tham gia hội thảo được yêu cầu đánh giá diễn giả ------- khi kết thúc phiên họp.",
    options: ["at", "on", "in", "with"],
    correctIndex: 0,
    explanation: "Cụm giới từ chỉ thời điểm: 'at the end of the session'.",
  },
  {
    q: "Due to inclement weather conditions, all domestic flights have been ------- canceled.",
    vi: "Do điều kiện thời tiết khắc nghiệt, tất cả các chuyến bay nội địa đã bị hủy -------.",
    options: ["officially", "official", "officials", "officialize"],
    correctIndex: 0,
    explanation: "Trạng từ 'officially' đứng giữa 'have been' và động từ phân từ 'canceled'.",
  },
  {
    q: "Mr. Patel is highly ------- as a candidate for the vacant regional director position.",
    vi: "Ông Patel được ------- đánh giá rất cao như một ứng viên cho vị trí giám đốc khu vực đang trống.",
    options: ["recommended", "recommend", "recommending", "recommendation"],
    correctIndex: 0,
    explanation: "Cấu trúc bị động 'is highly recommended' (được giới thiệu/đánh giá cao).",
  },
  {
    q: "The accounting department reminds all staff to keep their travel ------- for reimbursement.",
    vi: "Phòng kế toán nhắc nhở toàn thể nhân viên giữ lại các ------- công tác để được hoàn tiền.",
    options: ["receipts", "receives", "reception", "receptive"],
    correctIndex: 0,
    explanation: "Danh từ số nhiều 'travel receipts' (hóa đơn, biên lai công tác).",
  },
  {
    q: "The contract will become effective once it is ------- by both parties.",
    vi: "Hợp đồng sẽ có hiệu lực một khi nó được ------- bởi cả hai bên.",
    options: ["signed", "sign", "signing", "signature"],
    correctIndex: 0,
    explanation: "Cấu trúc bị động 'is + V3/ed': 'is signed by both parties'.",
  },
  {
    q: "Despite the economic downturn, the company's annual revenue increased ------- by 12 percent.",
    vi: "Mặc dù suy thoái kinh tế, doanh thu hàng năm của công ty đã tăng ------- tới 12 phần trăm.",
    options: ["substantially", "substantial", "substance", "substantiate"],
    correctIndex: 0,
    explanation: "Trạng từ 'substantially' (đáng kể) bổ nghĩa cho động từ 'increased'.",
  },
  {
    q: "Visitors must sign in at the front desk and wear a visitor ------- at all times.",
    vi: "Khách đến thăm phải đăng ký tại bàn lễ tân và đeo ------- khách mọi lúc.",
    options: ["badge", "letter", "note", "paper"],
    correctIndex: 0,
    explanation: "Cụm từ thông dụng: 'visitor badge' (thẻ đeo khách ra vào).",
  },
  {
    q: "The maintenance crew worked ------- through the night to restore electricity to the facility.",
    vi: "Đội bảo trì đã làm việc ------- suốt đêm để khôi phục nguồn điện cho cơ sở.",
    options: ["diligently", "diligent", "diligence", "diligentness"],
    correctIndex: 0,
    explanation: "Cần trạng từ (adv) 'diligently' (chăm chỉ, tận tụy) bổ nghĩa cho động từ 'worked'.",
  },
  {
    q: "If you have any questions regarding your invoice, please contact our billing department -------.",
    vi: "Nếu bạn có bất kỳ câu hỏi nào liên quan đến hóa đơn, vui lòng liên hệ phòng thanh toán của chúng tôi -------.",
    options: ["promptly", "prompt", "prompting", "promptness"],
    correctIndex: 0,
    explanation: "Trạng từ 'promptly' (ngay lập tức, kịp thời) đứng cuối câu bổ nghĩa cho 'contact'.",
  },
  {
    q: "The newly released smartphone features a camera that is ------- to that of its predecessor.",
    vi: "Chiếc điện thoại thông minh mới phát hành sở hữu camera ------- hơn so với phiên bản tiền nhiệm.",
    options: ["superior", "superiors", "superiority", "superiorly"],
    correctIndex: 0,
    explanation: "Tính từ so sánh đặc biệt đi với giới từ 'to': 'superior to' (vượt trội hơn so với).",
  },
  {
    q: "All employees are required to adhere strictly ------- the company's code of conduct.",
    vi: "Tất cả nhân viên được yêu cầu tuân thủ nghiêm ngặt ------- quy tắc ứng xử của công ty.",
    options: ["to", "with", "in", "at"],
    correctIndex: 0,
    explanation: "Động từ 'adhere' luôn đi kèm giới từ cố định 'to': 'adhere to' (tuân thủ theo).",
  },
  {
    q: "The workshop offers participants practical advice on how to negotiate ------- with international clients.",
    vi: "Hội thảo mang đến cho người tham dự những lời khuyên thực tế về cách đàm phán ------- với khách quốc tế.",
    options: ["effectively", "effective", "effectiveness", "effect"],
    correctIndex: 0,
    explanation: "Cần trạng từ 'effectively' (một cách hiệu quả) để bổ nghĩa cho động từ 'negotiate'.",
  },
  {
    q: "The quarterly report indicates that customer satisfaction has reached an all-time -------.",
    vi: "Báo cáo quý chỉ ra rằng mức độ hài lòng của khách hàng đã đạt mức ------- chưa từng có.",
    options: ["high", "highly", "height", "highness"],
    correctIndex: 0,
    explanation: "Thành ngữ cố định: 'reach an all-time high' (đạt mức cao kỷ lục).",
  },
  {
    q: "Before submitting your application, please ensure that all required documents are ------- attached.",
    vi: "Trước khi nộp hồ sơ, vui lòng đảm bảo rằng tất cả các tài liệu bắt buộc đã được đính kèm -------.",
    options: ["properly", "proper", "property", "properness"],
    correctIndex: 0,
    explanation: "Trạng từ 'properly' (đúng cách, chuẩn xác) bổ nghĩa cho động từ phân từ 'attached'.",
  },
  {
    q: "The new transit system is expected to significantly reduce commute times for suburban -------.",
    vi: "Hệ thống giao thông mới được kỳ vọng sẽ giúp giảm đáng kể thời gian di chuyển cho các cư dân -------.",
    options: ["residents", "reside", "residential", "residence"],
    correctIndex: 0,
    explanation: "Cần một danh từ chỉ người số nhiều: 'suburban residents' (cư dân ngoại ô).",
  },
  {
    q: "Neither the CEO nor the board members ------- in favor of expanding the office space this year.",
    vi: "Cả Tổng giám đốc lẫn các thành viên hội đồng quản trị đều không ------- ủng hộ việc mở rộng văn phòng năm nay.",
    options: ["were", "was", "is", "has been"],
    correctIndex: 0,
    explanation: "Cấu trúc 'Neither S1 nor S2': Động từ chia theo S2 'the board members' (số nhiều) -> 'were'.",
  },
  {
    q: "The airline apologized to passengers for the ------- caused by the unexpected mechanical delay.",
    vi: "Hãng hàng không đã gửi lời xin lỗi tới hành khách vì sự ------- do sự cố kỹ thuật bất ngờ gây ra.",
    options: ["inconvenience", "inconvenient", "inconveniently", "inconveniencing"],
    correctIndex: 0,
    explanation: "Cần danh từ 'inconvenience' (sự bất tiện) đứng sau mạo từ 'the'.",
  },
  {
    q: "To receive the early registration discount, attendees must register ------- March 15.",
    vi: "Để nhận được chiết khấu đăng ký sớm, người tham dự phải đăng ký ------- trước ngày 15 tháng 3.",
    options: ["by", "at", "during", "with"],
    correctIndex: 0,
    explanation: "Giới từ 'by' chỉ hạn chót: 'by March 15' (trước hoặc muộn nhất vào ngày 15 tháng 3).",
  },
];

/**
 * Đảm bảo mảng câu hỏi của bài đọc luôn có ĐẦY ĐỦ số lượng câu như hiển thị bên ngoài (ví dụ 30 câu).
 */
export function expandReadingQuestions(card: ExerciseCardData): SampleQuestion[] {
  const existing = card.sampleQuestions || [];
  const targetCount = card.totalQuestions || 30;

  if (existing.length >= targetCount) {
    return existing;
  }

  const result: SampleQuestion[] = [...existing];
  let questionNumCounter = 101;
  if (card.category === "part6") questionNumCounter = 131;
  else if (card.category === "part7") questionNumCounter = 147;

  let bankIndex = 0;
  while (result.length < targetCount) {
    const qNum = String(questionNumCounter + result.length);
    const bankItem = TOEIC_PART5_QUESTION_BANK[bankIndex % TOEIC_PART5_QUESTION_BANK.length];
    bankIndex++;

    result.push({
      questionNum: qNum,
      question: bankItem.q,
      bilingual: bankItem.vi,
      options: bankItem.options,
      correctIndex: bankItem.correctIndex,
      explanation: bankItem.explanation,
      vocabList: [
        { word: bankItem.options[bankItem.correctIndex], ipa: "/ˈpræktɪs/", meaning: "Đáp án chuẩn xác", example: { en: bankItem.q, vi: bankItem.vi } }
      ]
    });
  }

  return result;
}

/**
 * Đảm bảo mảng câu hỏi của Chuyên đề Ngữ pháp luôn có ĐẦY ĐỦ 30 câu hỏi thực tế.
 */
export function expandGrammarQuestions(
  existingQuestions: GrammarQuestionItem[] = [],
  topicTitle = "Ngữ pháp",
  targetCount = 30
): GrammarQuestionItem[] {
  if (existingQuestions.length >= targetCount) {
    return existingQuestions;
  }

  const result: GrammarQuestionItem[] = [...existingQuestions];
  let bankIndex = 0;

  while (result.length < targetCount) {
    const idx = result.length + 1;
    const bankItem = TOEIC_PART5_QUESTION_BANK[bankIndex % TOEIC_PART5_QUESTION_BANK.length];
    bankIndex++;

    const optMap: { A: string; B: string; C: string; D: string } = {
      A: bankItem.options[0],
      B: bankItem.options[1],
      C: bankItem.options[2],
      D: bankItem.options[3],
    };

    const optKeys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
    const correctLetter = optKeys[bankItem.correctIndex] || "A";

    result.push({
      id: `q-gen-${idx}`,
      part: "PART_5",
      questionText: `Câu ${idx}: ${bankItem.q}`,
      options: optMap,
      correctAnswer: correctLetter,
      explanation: bankItem.explanation,
      trapNote: `Bẫy thường gặp trong câu hỏi ${topicTitle}: Chú ý cấu trúc câu và từ loại.`,
      translation: bankItem.vi,
      difficulty: idx > 20 ? "HARD" : idx > 10 ? "MEDIUM" : "EASY",
    });
  }

  return result;
}
