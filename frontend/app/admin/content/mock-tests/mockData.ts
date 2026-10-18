import { TestItem, PracticeQuestion } from "./types";

export const SAMPLE_EXAM_QUESTIONS: PracticeQuestion[] = [
  {
    "id": 1,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q1.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "He's parking a truck.",
      "B": "He's lifting some furniture.",
      "C": "He's starting an engine.",
      "D": "He's driving a car."
    },
    "correctAnswer": "B",
    "transcript": "(A) He's parking a truck. (B) He's lifting some furniture. (C) He's starting an engine. (D) He's driving a car.",
    "translation": "(A) Anh ấy đang đỗ xe tải. (B) Anh ấy đang nâng/bê đồ nội thất. (C) Anh ấy đang nổ máy xe. (D) Anh ấy đang lái ô tô.",
    "explanation": "Trong bức ảnh, người đàn ông đang khom người bê/nhấc một chiếc ghế kim loại (đồ nội thất - furniture) vào thùng sau xe tải -> Phương án (B) 'He\\'s lifting some furniture' mô tả chính xác nhất hành động."
  },
  {
    "id": 2,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q2.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "Some curtains have been closed.",
      "B": "Some jackets have been laid on a chair.",
      "C": "Some people are gathered around a desk.",
      "D": "Someone is turning on a lamp."
    },
    "correctAnswer": "C",
    "transcript": "(A) Some curtains have been closed. (B) Some jackets have been laid on a chair. (C) Some people are gathered around a desk. (D) Someone is turning on a lamp.",
    "translation": "(A) Một số rèm cửa đã được kéo lại. (B) Một số áo khoác đã được để trên ghế. (C) Một số người đang tập trung xung quanh một chiếc bàn làm việc. (D) Có người đang bật đèn.",
    "explanation": "Bức ảnh thể hiện nhóm người đang đứng và ngồi vây quanh một chiếc bàn làm việc cổ điển -> Phương án (C) 'Some people are gathered around a desk' là đáp án đúng."
  },
  {
    "id": 3,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q3.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "One of the women is reaching into her bag.",
      "B": "The women are waiting in a line.",
      "C": "The man is leading a tour group.",
      "D": "The man is opening a cash register."
    },
    "correctAnswer": "B",
    "transcript": "(A) One of the women is reaching into her bag. (B) The women are waiting in a line. (C) The man is leading a tour group. (D) The man is opening a cash register.",
    "translation": "(A) Một trong những người phụ nữ đang với tay vào túi xách. (B) Những người phụ nữ đang đứng xếp hàng chờ đợi. (C) Người đàn ông đang dẫn dắt đoàn du lịch. (D) Người đàn ông đang mở ngăn kéo đựng tiền.",
    "explanation": "Ba người phụ nữ đang xếp hàng ngay ngắn trước quầy giao dịch dịch vụ -> Phương án (B) 'The women are waiting in a line' là đáp án chính xác."
  },
  {
    "id": 4,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q4.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "The man is bending over a bicycle.",
      "B": "A wheel has been propped against a stack of bricks.",
      "C": "The man is collecting some pieces of wood.",
      "D": "A handrail is being installed."
    },
    "correctAnswer": "A",
    "transcript": "(A) The man is bending over a bicycle. (B) A wheel has been propped against a stack of bricks. (C) The man is collecting some pieces of wood. (D) A handrail is being installed.",
    "translation": "(A) Người đàn ông đang cúi người qua chiếc xe đạp. (B) Một bánh xe đã được dựng vào chồng gạch. (C) Người đàn ông đang thu gom các mảnh gỗ. (D) Một tay vịn đang được lắp đặt.",
    "explanation": "Người đàn ông đang cúi gập người (bending over) để kiểm tra/sửa chữa xe đạp cạnh bậc thềm -> Phương án (A) mô tả đúng nhất."
  },
  {
    "id": 5,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q5.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "An armchair has been placed under a window.",
      "B": "Some reading materials have fallen on the floor.",
      "C": "Some flowers are being watered.",
      "D": "Some picture frames are hanging on a wall."
    },
    "correctAnswer": "D",
    "transcript": "(A) An armchair has been placed under a window. (B) Some reading materials have fallen on the floor. (C) Some flowers are being watered. (D) Some picture frames are hanging on a wall.",
    "translation": "(A) Một chiếc ghế bành được đặt dưới cửa sổ. (B) Một số tài liệu đọc bị rơi trên sàn. (C) Một số bông hoa đang được tưới nước. (D) Một số khung tranh/ảnh đang được treo trên tường.",
    "explanation": "Trên bức tường trắng có hàng 4 khung tranh treo ngay ngắn ('Some picture frames are hanging on a wall') -> Phương án (D) chính xác. (A sai vì không có cửa sổ phía trên ghế)."
  },
  {
    "id": 6,
    "part": "Part 1",
    "questionText": "Look at the photograph and choose the statement that best describes what you see.",
    "imageUrl": "/images/part1/test1/q6.png",
    "audioUrl": "/audio/part1/test1.mp3",
    "options": {
      "A": "She's adjusting the height of an umbrella.",
      "B": "She's inspecting the tires on a vending cart.",
      "C": "There's a mobile food stand on a walkway.",
      "D": "There are some cooking utensils on the ground."
    },
    "correctAnswer": "C",
    "transcript": "(A) She's adjusting the height of an umbrella. (B) She's inspecting the tires on a vending cart. (C) There's a mobile food stand on a walkway. (D) There are some cooking utensils on the ground.",
    "translation": "(A) Cô ấy đang điều chỉnh độ cao của chiếc ô. (B) Cô ấy đang kiểm tra lốp xe bán hàng. (C) Có một xe bán thức ăn di động trên vỉa hè/lối đi bộ. (D) Có một số dụng cụ nấu nướng trên mặt đất.",
    "explanation": "Chiếc xe đẩy bán đồ ăn đường phố có bánh xe ('mobile food stand') đang đỗ trên vỉa hè dành cho người đi bộ ('walkway') -> Phương án (C) là đáp án đúng."
  },
  {
    "id": 7,
    "part": "Part 2",
    "questionText": "When is the annual budget proposal scheduled to be submitted?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Yes, our team approved it yesterday.",
      "B": "By the end of business hours this Friday.",
      "C": "In the main boardroom on the fifth floor."
    },
    "correctAnswer": "B",
    "transcript": "Question: When is the annual budget proposal scheduled to be submitted? (A) Yes, our team approved it yesterday. (B) By the end of business hours this Friday. (C) In the main boardroom on the fifth floor.",
    "translation": "When is the annual budget proposal scheduled to be submitted?",
    "explanation": "Câu hỏi 'When' hỏi thời gian -> (B) nêu hạn chót thứ Sáu."
  },
  {
    "id": 8,
    "part": "Part 2",
    "questionText": "Why hasn't the overseas shipment from Tokyo arrived yet?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Severe weather conditions delayed international flights.",
      "B": "No, we only received forty cartons.",
      "C": "Mr. Sato is the chief logistics coordinator."
    },
    "correctAnswer": "A",
    "transcript": "Question: Why hasn't the overseas shipment from Tokyo arrived yet? (A) Severe weather conditions delayed international flights. (B) No, we only received forty cartons. (C) Mr. Sato is the chief logistics coordinator.",
    "translation": "Why hasn't the overseas shipment from Tokyo arrived yet?",
    "explanation": "Câu hỏi 'Why' hỏi lý do -> (A) giải thích thời tiết xấu làm chậm chuyến bay."
  },
  {
    "id": 9,
    "part": "Part 2",
    "questionText": "Who is in charge of organizing the client appreciation dinner?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "At the Grand Palace Riverside Restaurant.",
      "B": "About seventy-five corporate guests.",
      "C": "Ms. Henderson from the events department."
    },
    "correctAnswer": "C",
    "transcript": "Question: Who is in charge of organizing the client appreciation dinner? (A) At the Grand Palace Riverside Restaurant. (B) About seventy-five corporate guests. (C) Ms. Henderson from the events department.",
    "translation": "Who is in charge of organizing the client appreciation dinner?",
    "explanation": "Câu hỏi 'Who' hỏi người chịu trách nhiệm -> (C) nêu tên nhân sự tổ chức."
  },
  {
    "id": 10,
    "part": "Part 2",
    "questionText": "Where can I find the extra toner cartridges for the color printer?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "In the supply cabinet next to room 204.",
      "B": "I usually print two-sided copies.",
      "C": "Yes, it prints thirty pages per minute."
    },
    "correctAnswer": "A",
    "transcript": "Question: Where can I find the extra toner cartridges for the color printer? (A) In the supply cabinet next to room 204. (B) I usually print two-sided copies. (C) Yes, it prints thirty pages per minute.",
    "translation": "Where can I find the extra toner cartridges for the color printer?",
    "explanation": "Câu hỏi 'Where' hỏi nơi chốn -> (A) chỉ tủ đồ dùng cạnh phòng 204."
  },
  {
    "id": 11,
    "part": "Part 2",
    "questionText": "Would you like to review the presentation slides together or separately?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Yes, the projector is working well.",
      "B": "Let's go over them together after lunch.",
      "C": "The presentation lasted forty-five minutes."
    },
    "correctAnswer": "B",
    "transcript": "Question: Would you like to review the presentation slides together or separately? (A) Yes, the projector is working well. (B) Let's go over them together after lunch. (C) The presentation lasted forty-five minutes.",
    "translation": "Would you like to review the presentation slides together or separately?",
    "explanation": "Câu hỏi lựa chọn 'together or separately' -> (B) chọn xem cùng nhau sau bữa trưa."
  },
  {
    "id": 12,
    "part": "Part 2",
    "questionText": "Has the new security software been installed on all laptops?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "IT finished updating them this morning.",
      "B": "No, I haven't changed my password recently.",
      "C": "A three-year software license agreement."
    },
    "correctAnswer": "A",
    "transcript": "Question: Has the new security software been installed on all laptops? (A) IT finished updating them this morning. (B) No, I haven't changed my password recently. (C) A three-year software license agreement.",
    "translation": "Has the new security software been installed on all laptops?",
    "explanation": "Câu hỏi 'Has it been installed' -> (A) xác nhận phòng IT đã hoàn tất sáng nay."
  },
  {
    "id": 13,
    "part": "Part 2",
    "questionText": "How often does the express shuttle run to the downtown station?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "A single one-way ticket costs four dollars.",
      "B": "The train station was renovated last year.",
      "C": "Every fifteen minutes during peak rush hours."
    },
    "correctAnswer": "C",
    "transcript": "Question: How often does the express shuttle run to the downtown station? (A) A single one-way ticket costs four dollars. (B) The train station was renovated last year. (C) Every fifteen minutes during peak rush hours.",
    "translation": "How often does the express shuttle run to the downtown station?",
    "explanation": "Câu hỏi 'How often' hỏi tần suất -> (C) mỗi 15 phút."
  },
  {
    "id": 14,
    "part": "Part 2",
    "questionText": "Could you help me set up the audiovisual equipment in conference room B?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The conference was held in Chicago.",
      "B": "Sure, as soon as I finish sending this email.",
      "C": "Yes, room B is currently occupied."
    },
    "correctAnswer": "B",
    "transcript": "Question: Could you help me set up the audiovisual equipment in conference room B? (A) The conference was held in Chicago. (B) Sure, as soon as I finish sending this email. (C) Yes, room B is currently occupied.",
    "translation": "Could you help me set up the audiovisual equipment in conference room B?",
    "explanation": "Lời đề nghị giúp đỡ -> (B) đồng ý ngay sau khi gửi email."
  },
  {
    "id": 15,
    "part": "Part 2",
    "questionText": "Why did Ms. Patel postpone today's marketing strategy meeting?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "She had an urgent appointment with a client.",
      "B": "In the third-floor conference room.",
      "C": "Yes, the campaign was very successful."
    },
    "correctAnswer": "A",
    "transcript": "Question: Why did Ms. Patel postpone today's marketing strategy meeting? (A) She had an urgent appointment with a client. (B) In the third-floor conference room. (C) Yes, the campaign was very successful.",
    "translation": "Why did Ms. Patel postpone today's marketing strategy meeting?",
    "explanation": "Câu hỏi 'Why' hỏi lý do hoãn họp -> (A) do có hẹn gấp với khách hàng."
  },
  {
    "id": 16,
    "part": "Part 2",
    "questionText": "Which catering vendor did we choose for next week's seminar?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Over one hundred participants registered.",
      "B": "The seminar starts at nine in the morning.",
      "C": "Delicious Bites provided the best proposal."
    },
    "correctAnswer": "C",
    "transcript": "Question: Which catering vendor did we choose for next week's seminar? (A) Over one hundred participants registered. (B) The seminar starts at nine in the morning. (C) Delicious Bites provided the best proposal.",
    "translation": "Which catering vendor did we choose for next week's seminar?",
    "explanation": "Câu hỏi 'Which vendor' hỏi nhà cung cấp -> (C) Delicious Bites có đề xuất tốt nhất."
  },
  {
    "id": 17,
    "part": "Part 2",
    "questionText": "The quarterly sales report looks much better than expected, doesn't it?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "I reported the incident to security.",
      "B": "Yes, our export revenue increased by twelve percent.",
      "C": "No, sales tax is not included in the total."
    },
    "correctAnswer": "B",
    "transcript": "Question: The quarterly sales report looks much better than expected, doesn't it? (A) I reported the incident to security. (B) Yes, our export revenue increased by twelve percent. (C) No, sales tax is not included in the total.",
    "translation": "The quarterly sales report looks much better than expected, doesn't it?",
    "explanation": "Câu hỏi đuôi xác nhận doanh số tốt -> (B) xác nhận doanh thu xuất khẩu tăng 12%."
  },
  {
    "id": 18,
    "part": "Part 2",
    "questionText": "Are you flying to Chicago tomorrow morning or taking the train?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "I booked an early flight departing at seven.",
      "B": "The train ticket was quite inexpensive.",
      "C": "Chicago is located in Illinois."
    },
    "correctAnswer": "A",
    "transcript": "Question: Are you flying to Chicago tomorrow morning or taking the train? (A) I booked an early flight departing at seven. (B) The train ticket was quite inexpensive. (C) Chicago is located in Illinois.",
    "translation": "Are you flying to Chicago tomorrow morning or taking the train?",
    "explanation": "Câu hỏi lựa chọn phương tiện -> (A) đã đặt chuyến bay sớm lúc 7 giờ."
  },
  {
    "id": 19,
    "part": "Part 2",
    "questionText": "Where did you leave the signed purchase agreement from Davis Logistics?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Yes, Davis signed it yesterday afternoon.",
      "B": "Logistics costs have risen significantly.",
      "C": "It's on Mr. Clark's desk awaiting his review."
    },
    "correctAnswer": "C",
    "transcript": "Question: Where did you leave the signed purchase agreement from Davis Logistics? (A) Yes, Davis signed it yesterday afternoon. (B) Logistics costs have risen significantly. (C) It's on Mr. Clark's desk awaiting his review.",
    "translation": "Where did you leave the signed purchase agreement from Davis Logistics?",
    "explanation": "Câu hỏi 'Where' hỏi vị trí hợp đồng -> (C) trên bàn ông Clark."
  },
  {
    "id": 20,
    "part": "Part 2",
    "questionText": "Should we order additional office supplies now or wait until next month?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The office supply catalog is on the shelf.",
      "B": "We should wait until we receive the new discount catalog.",
      "C": "Yes, we need fifty boxes of paper clips."
    },
    "correctAnswer": "B",
    "transcript": "Question: Should we order additional office supplies now or wait until next month? (A) The office supply catalog is on the shelf. (B) We should wait until we receive the new discount catalog. (C) Yes, we need fifty boxes of paper clips.",
    "translation": "Should we order additional office supplies now or wait until next month?",
    "explanation": "Câu hỏi lựa chọn 'now or next month' -> (B) khuyên nên chờ nhận danh mục giảm giá mới."
  },
  {
    "id": 21,
    "part": "Part 2",
    "questionText": "Who authorized the expenditure for the refurbished office furniture?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The chief financial officer signed off on it.",
      "B": "The furniture was delivered last Tuesday.",
      "C": "About five thousand dollars in total."
    },
    "correctAnswer": "A",
    "transcript": "Question: Who authorized the expenditure for the refurbished office furniture? (A) The chief financial officer signed off on it. (B) The furniture was delivered last Tuesday. (C) About five thousand dollars in total.",
    "translation": "Who authorized the expenditure for the refurbished office furniture?",
    "explanation": "Câu hỏi 'Who authorized' -> (A) Giám đốc tài chính CFO đã phê duyệt."
  },
  {
    "id": 22,
    "part": "Part 2",
    "questionText": "Isn't the technical support hotline open twenty-four hours a day?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Yes, technicians are always available to help.",
      "B": "I called technical support twice yesterday.",
      "C": "Press number three for billing inquiries."
    },
    "correctAnswer": "A",
    "transcript": "Question: Isn't the technical support hotline open twenty-four hours a day? (A) Yes, technicians are always available to help. (B) I called technical support twice yesterday. (C) Press number three for billing inquiries.",
    "translation": "Isn't the technical support hotline open twenty-four hours a day?",
    "explanation": "Câu hỏi phủ định xác nhận hotline 24/7 -> (A) xác nhận kỹ thuật viên luôn trực."
  },
  {
    "id": 23,
    "part": "Part 2",
    "questionText": "How long will the renovation of the customer service center take?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Customer satisfaction ratings have improved.",
      "B": "Approximately three weeks if there are no delays.",
      "C": "The service center is on the ground floor."
    },
    "correctAnswer": "B",
    "transcript": "Question: How long will the renovation of the customer service center take? (A) Customer satisfaction ratings have improved. (B) Approximately three weeks if there are no delays. (C) The service center is on the ground floor.",
    "translation": "How long will the renovation of the customer service center take?",
    "explanation": "Câu hỏi 'How long' hỏi khoảng thời gian -> (B) khoảng 3 tuần."
  },
  {
    "id": 24,
    "part": "Part 2",
    "questionText": "Don't forget to submit your travel reimbursement form by 5 P.M.",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Thanks for the reminder; I'm filling it out now.",
      "B": "The business trip to Seattle was productive.",
      "C": "Reimbursement will be transferred to your account."
    },
    "correctAnswer": "A",
    "transcript": "Question: Don't forget to submit your travel reimbursement form by 5 P.M. (A) Thanks for the reminder; I'm filling it out now. (B) The business trip to Seattle was productive. (C) Reimbursement will be transferred to your account.",
    "translation": "Don't forget to submit your travel reimbursement form by 5 P.M.",
    "explanation": "Lời nhắc nhở nộp đơn hoàn tiền -> (A) cảm ơn vì đã nhắc và đang điền ngay."
  },
  {
    "id": 25,
    "part": "Part 2",
    "questionText": "Can you recommend a reliable graphic designer for our new product catalog?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The product catalog will be published next month.",
      "B": "We printed five thousand full-color copies.",
      "C": "You should contact Studio Apex; they did great work for us."
    },
    "correctAnswer": "C",
    "transcript": "Question: Can you recommend a reliable graphic designer for our new product catalog? (A) The product catalog will be published next month. (B) We printed five thousand full-color copies. (C) You should contact Studio Apex; they did great work for us.",
    "translation": "Can you recommend a reliable graphic designer for our new product catalog?",
    "explanation": "Hỏi gợi ý nhà thiết kế đồ họa -> (C) giới thiệu Studio Apex."
  },
  {
    "id": 26,
    "part": "Part 2",
    "questionText": "Why is the underground parking garage closed today?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "I parked my vehicle in visitor bay number 4.",
      "B": "They're resurfacing the concrete floor.",
      "C": "Yes, the parking fee is five dollars per hour."
    },
    "correctAnswer": "B",
    "transcript": "Question: Why is the underground parking garage closed today? (A) I parked my vehicle in visitor bay number 4. (B) They're resurfacing the concrete floor. (C) Yes, the parking fee is five dollars per hour.",
    "translation": "Why is the underground parking garage closed today?",
    "explanation": "Hỏi lý do bãi đỗ xe đóng cửa -> (B) đang sửa chữa/tráng lại mặt sàn bê tông."
  },
  {
    "id": 27,
    "part": "Part 2",
    "questionText": "You've worked with Mr. Tanaka on previous construction projects, haven't you?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "Yes, we collaborated on the harbor terminal expansion.",
      "B": "Mr. Tanaka joined the engineering department last week.",
      "C": "The construction project finished ahead of schedule."
    },
    "correctAnswer": "A",
    "transcript": "Question: You've worked with Mr. Tanaka on previous construction projects, haven't you? (A) Yes, we collaborated on the harbor terminal expansion. (B) Mr. Tanaka joined the engineering department last week. (C) The construction project finished ahead of schedule.",
    "translation": "You've worked with Mr. Tanaka on previous construction projects, haven't you?",
    "explanation": "Câu hỏi đuôi xác nhận từng làm việc chung -> (A) xác nhận đã hợp tác trong dự án bến cảng."
  },
  {
    "id": 28,
    "part": "Part 2",
    "questionText": "Where should I file the updated employee emergency contact records?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "In case of fire, use the emergency staircase.",
      "B": "Human resources keeps those in the secure archive room.",
      "C": "All employees must complete the contact form."
    },
    "correctAnswer": "B",
    "transcript": "Question: Where should I file the updated employee emergency contact records? (A) In case of fire, use the emergency staircase. (B) Human resources keeps those in the secure archive room. (C) All employees must complete the contact form.",
    "translation": "Where should I file the updated employee emergency contact records?",
    "explanation": "Hỏi nơi lưu hồ sơ liên lạc khẩn cấp -> (B) phòng nhân sự lưu trong kho lưu trữ bảo mật."
  },
  {
    "id": 29,
    "part": "Part 2",
    "questionText": "Would you mind reviewing the revised lease terms before we sign?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The lease agreement expires in December.",
      "B": "Not at all, send the draft to my email inbox.",
      "C": "We signed the contract two days ago."
    },
    "correctAnswer": "B",
    "transcript": "Question: Would you mind reviewing the revised lease terms before we sign? (A) The lease agreement expires in December. (B) Not at all, send the draft to my email inbox. (C) We signed the contract two days ago.",
    "translation": "Would you mind reviewing the revised lease terms before we sign?",
    "explanation": "Lời nhờ xem lại điều khoản thuê 'Would you mind' -> (B) sẵn lòng, hãy gửi bản thảo qua email."
  },
  {
    "id": 30,
    "part": "Part 2",
    "questionText": "How did the focus group react to our redesigned packaging concept?",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "They were enthusiastic about the eco-friendly materials.",
      "B": "We invited fifteen consumers from various age groups.",
      "C": "The packaging redesign cost ten thousand dollars."
    },
    "correctAnswer": "A",
    "transcript": "Question: How did the focus group react to our redesigned packaging concept? (A) They were enthusiastic about the eco-friendly materials. (B) We invited fifteen consumers from various age groups. (C) The packaging redesign cost ten thousand dollars.",
    "translation": "How did the focus group react to our redesigned packaging concept?",
    "explanation": "Hỏi phản hồi của nhóm người tiêu dùng -> (A) họ rất hào hứng với vật liệu thân thiện môi trường."
  },
  {
    "id": 31,
    "part": "Part 2",
    "questionText": "I thought the regional directors' conference was scheduled for Friday.",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "options": {
      "A": "The conference agenda will be emailed tomorrow.",
      "B": "Directors from eight regional offices attended.",
      "C": "It was moved up to Thursday because of travel conflicts."
    },
    "correctAnswer": "C",
    "transcript": "Question: I thought the regional directors' conference was scheduled for Friday. (A) The conference agenda will be emailed tomorrow. (B) Directors from eight regional offices attended. (C) It was moved up to Thursday because of travel conflicts.",
    "translation": "I thought the regional directors' conference was scheduled for Friday.",
    "explanation": "Câu trần thuật bày tỏ thắc mắc lịch hội nghị -> (C) giải thích đã đẩy sớm lên thứ Năm."
  },
  {
    "id": 32,
    "part": "Part 3",
    "groupTitle": "Questions 32–34 refer to the following conversation at a hotel front desk.",
    "groupId": "32–34",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "32. Where does the conversation most likely take place?",
    "options": {
      "A": "At an electronics retail store",
      "B": "In a corporate medical clinic",
      "C": "At an airport check-in counter",
      "D": "In a hotel reception lobby"
    },
    "correctAnswer": "D",
    "translation": "Where does the conversation most likely take place?",
    "explanation": "Người đàn ông hỏi về reservation phòng và chìa khóa phòng -> sảnh lễ tân khách sạn."
  },
  {
    "id": 33,
    "part": "Part 3",
    "groupTitle": "Questions 32–34 refer to the following conversation at a hotel front desk.",
    "groupId": "32–34",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "33. What problem does the woman mention?",
    "options": {
      "A": "The executive suite is not cleaned yet.",
      "B": "A credit card payment was declined.",
      "C": "The shuttle bus service has been cancelled.",
      "D": "The air conditioning unit is broken."
    },
    "correctAnswer": "A",
    "translation": "What problem does the woman mention?",
    "explanation": "Nhân viên báo phòng suite chưa dọn dẹp xong."
  },
  {
    "id": 34,
    "part": "Part 3",
    "groupTitle": "Questions 32–34 refer to the following conversation at a hotel front desk.",
    "groupId": "32–34",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "34. What does the woman offer to do for the man?",
    "options": {
      "A": "Issue a complimentary beverage voucher",
      "B": "Upgrade him to a penthouse room",
      "C": "Arrange a taxi to the conference center",
      "D": "Discount his breakfast buffet charges"
    },
    "correctAnswer": "A",
    "translation": "What does the woman offer to do for the man?",
    "explanation": "Nhân viên mời phiếu đồ uống miễn phí trong khi chờ."
  },
  {
    "id": 35,
    "part": "Part 3",
    "groupTitle": "Questions 35–37 refer to the following conversation about office supply procurement.",
    "groupId": "35–37",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "35. What item is the man asking about?",
    "options": {
      "A": "Replacement laptop chargers",
      "B": "Ergonomic desk chairs",
      "C": "Recycled printing paper cartons",
      "D": "Conference video monitors"
    },
    "correctAnswer": "C",
    "translation": "What item is the man asking about?",
    "explanation": "Người đàn ông hỏi về giấy in tái chế đã đặt."
  },
  {
    "id": 36,
    "part": "Part 3",
    "groupTitle": "Questions 35–37 refer to the following conversation about office supply procurement.",
    "groupId": "35–37",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "36. Why is the shipment delayed?",
    "options": {
      "A": "The warehouse experienced inventory shortages.",
      "B": "The delivery address was incorrect.",
      "C": "The supplier went out of business.",
      "D": "Severe snowstorms blocked roads."
    },
    "correctAnswer": "A",
    "translation": "Why is the shipment delayed?",
    "explanation": "Nhà kho bị thiếu hụt tồn kho tạm thời."
  },
  {
    "id": 37,
    "part": "Part 3",
    "groupTitle": "Questions 35–37 refer to the following conversation about office supply procurement.",
    "groupId": "35–37",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "37. When will the items arrive at the office?",
    "options": {
      "A": "Later this afternoon",
      "B": "Tomorrow morning by 10 A.M.",
      "C": "Next Monday",
      "D": "At the end of the month"
    },
    "correctAnswer": "B",
    "translation": "When will the items arrive at the office?",
    "explanation": "Hàng sẽ được giao trước 10 giờ sáng mai."
  },
  {
    "id": 38,
    "part": "Part 3",
    "groupTitle": "Questions 38–40 refer to the following conversation between software engineers.",
    "groupId": "38–40",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "38. What are the speakers discussing?",
    "options": {
      "A": "User reviews of a mobile app release",
      "B": "Hiring new software developers",
      "C": "Purchasing server hardware",
      "D": "Budget cuts in engineering"
    },
    "correctAnswer": "A",
    "translation": "What are the speakers discussing?",
    "explanation": "Thảo luận về đánh giá của người dùng đối với bản cập nhật ứng dụng di động."
  },
  {
    "id": 39,
    "part": "Part 3",
    "groupTitle": "Questions 38–40 refer to the following conversation between software engineers.",
    "groupId": "38–40",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "39. What complaint did several users report?",
    "options": {
      "A": "The subscription price is too high.",
      "B": "The search function operates slowly.",
      "C": "The app crashes upon opening.",
      "D": "Language translation is inaccurate."
    },
    "correctAnswer": "B",
    "translation": "What complaint did several users report?",
    "explanation": "Nhiều người phàn nàn tính năng tìm kiếm bị chậm."
  },
  {
    "id": 40,
    "part": "Part 3",
    "groupTitle": "Questions 38–40 refer to the following conversation between software engineers.",
    "groupId": "38–40",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "40. What will the man do this afternoon?",
    "options": {
      "A": "Submit a bug report to quality assurance",
      "B": "Optimize database query indexing",
      "C": "Contact customer support representatives",
      "D": "Publish an apology announcement"
    },
    "correctAnswer": "B",
    "translation": "What will the man do this afternoon?",
    "explanation": "Tối ưu hóa chỉ mục truy vấn cơ sở dữ liệu để tăng tốc tìm kiếm."
  },
  {
    "id": 41,
    "part": "Part 3",
    "groupTitle": "Questions 41–43 refer to the following conversation between business travelers.",
    "groupId": "41–43",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "41. Why are the speakers traveling to Singapore?",
    "options": {
      "A": "To attend an annual tech leadership summit",
      "B": "To inspect a manufacturing plant",
      "C": "To interview local job candidates",
      "D": "To open a regional retail branch"
    },
    "correctAnswer": "A",
    "translation": "Why are the speakers traveling to Singapore?",
    "explanation": "Tham dự hội nghị thượng đỉnh lãnh đạo công nghệ thường niên tại Singapore."
  },
  {
    "id": 42,
    "part": "Part 3",
    "groupTitle": "Questions 41–43 refer to the following conversation between business travelers.",
    "groupId": "41–43",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "42. What concern does the woman express?",
    "options": {
      "A": "Her passport will expire soon.",
      "B": "Direct flight tickets are sold out.",
      "C": "The hotel is far from the convention center.",
      "D": "The travel budget has been reduced."
    },
    "correctAnswer": "B",
    "translation": "What concern does the woman express?",
    "explanation": "Các vé bay thẳng của hãng hàng không đã hết chỗ."
  },
  {
    "id": 43,
    "part": "Part 3",
    "groupTitle": "Questions 41–43 refer to the following conversation between business travelers.",
    "groupId": "41–43",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "43. What does the man suggest doing?",
    "options": {
      "A": "Taking a connecting flight through Tokyo",
      "B": "Rescheduling the business trip",
      "C": "Contacting the corporate travel agency",
      "D": "Attending the event virtually via video"
    },
    "correctAnswer": "C",
    "translation": "What does the man suggest doing?",
    "explanation": "Liên hệ đại lý du lịch của công ty để giữ vé ưu tiên."
  },
  {
    "id": 44,
    "part": "Part 3",
    "groupTitle": "Questions 44–46 refer to the following conversation in a manufacturing plant.",
    "groupId": "44–46",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "44. What is the problem with machine line 4?",
    "options": {
      "A": "It ran out of packaging cardboard.",
      "B": "The hydraulic pressure sensor malfunctioned.",
      "C": "Electrical power was disconnected.",
      "D": "The cooling water supply was shut off."
    },
    "correctAnswer": "B",
    "translation": "What is the problem with machine line 4?",
    "explanation": "Cảm biến áp suất thủy lực gặp sự cố báo lỗi."
  },
  {
    "id": 45,
    "part": "Part 3",
    "groupTitle": "Questions 44–46 refer to the following conversation in a manufacturing plant.",
    "groupId": "44–46",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "45. How long has production been paused?",
    "options": {
      "A": "For twenty minutes",
      "B": "Since early yesterday",
      "C": "For nearly two hours",
      "D": "Since the morning shift started"
    },
    "correctAnswer": "C",
    "translation": "How long has production been paused?",
    "explanation": "Dây chuyền sản xuất đã phải tạm dừng gần hai tiếng."
  },
  {
    "id": 46,
    "part": "Part 3",
    "groupTitle": "Questions 44–46 refer to the following conversation in a manufacturing plant.",
    "groupId": "44–46",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "46. Who will the woman contact immediately?",
    "options": {
      "A": "The certified machine technician",
      "B": "The client's purchasing director",
      "C": "The factory safety inspector",
      "D": "The human resources manager"
    },
    "correctAnswer": "A",
    "translation": "Who will the woman contact immediately?",
    "explanation": "Liên hệ ngay kỹ thuật viên bảo trì máy móc có chứng chỉ."
  },
  {
    "id": 47,
    "part": "Part 3",
    "groupTitle": "Questions 47–49 refer to the following conversation in a human resources office.",
    "groupId": "47–49",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "47. What position are the speakers trying to fill?",
    "options": {
      "A": "Senior financial analyst",
      "B": "Chief executive officer",
      "C": "Junior marketing specialist",
      "D": "Payroll coordinator"
    },
    "correctAnswer": "A",
    "translation": "What position are the speakers trying to fill?",
    "explanation": "Đang tuyển dụng vị trí chuyên viên phân tích tài chính cấp cao."
  },
  {
    "id": 48,
    "part": "Part 3",
    "groupTitle": "Questions 47–49 refer to the following conversation in a human resources office.",
    "groupId": "47–49",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "48. Why does the woman favor Candidate A?",
    "options": {
      "A": "He has extensive corporate tax experience.",
      "B": "He lives within walking distance of the office.",
      "C": "He previously worked for a rival tech firm.",
      "D": "He requested a lower starting salary."
    },
    "correctAnswer": "A",
    "translation": "Why does the woman favor Candidate A?",
    "explanation": "Ứng viên có nhiều kinh nghiệm thực tế về thuế doanh nghiệp."
  },
  {
    "id": 49,
    "part": "Part 3",
    "groupTitle": "Questions 47–49 refer to the following conversation in a human resources office.",
    "groupId": "47–49",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "49. What is the next step in the hiring process?",
    "options": {
      "A": "Conduct a final round of panel interviews",
      "B": "Perform employment reference checks",
      "C": "Send an official offer letter",
      "D": "Post the job opening on social media"
    },
    "correctAnswer": "B",
    "translation": "What is the next step in the hiring process?",
    "explanation": "Tiến hành kiểm tra thông tin người tham chiếu (reference checks)."
  },
  {
    "id": 50,
    "part": "Part 3",
    "groupTitle": "Questions 50–52 refer to the following conversation in a corporate cafeteria.",
    "groupId": "50–52",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "50. What change is happening in the cafeteria next month?",
    "options": {
      "A": "Operating hours are being extended.",
      "B": "A complete kitchen renovation will begin.",
      "C": "The cafeteria is transitioning to cashless payment.",
      "D": "A new catering contractor will take over."
    },
    "correctAnswer": "B",
    "translation": "What change is happening in the cafeteria next month?",
    "explanation": "Khu vực bếp và căng tin sẽ bắt đầu được tu sửa toàn diện."
  },
  {
    "id": 51,
    "part": "Part 3",
    "groupTitle": "Questions 50–52 refer to the following conversation in a corporate cafeteria.",
    "groupId": "50–52",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "51. What feedback did employee surveys highlight?",
    "options": {
      "A": "A desire for more fresh vegetarian and organic meal options",
      "B": "Lower meal prices for interns",
      "C": "Faster checkout service lanes",
      "D": "More outdoor picnic seating"
    },
    "correctAnswer": "A",
    "translation": "What feedback did employee surveys highlight?",
    "explanation": "Nhân viên mong muốn có thêm thực đơn chay và hữu cơ lành mạnh."
  },
  {
    "id": 52,
    "part": "Part 3",
    "groupTitle": "Questions 50–52 refer to the following conversation in a corporate cafeteria.",
    "groupId": "50–52",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "52. Where can staff purchase lunch during the construction period?",
    "options": {
      "A": "At food trucks parked in the courtyard",
      "B": "In the executive dining room",
      "C": "At neighboring commercial restaurants",
      "D": "From automated vending kiosks"
    },
    "correctAnswer": "A",
    "translation": "Where can staff purchase lunch during the construction period?",
    "explanation": "Xe đồ ăn di động đậu ở sân trong sẽ phục vụ bữa trưa tạm thời."
  },
  {
    "id": 53,
    "part": "Part 3",
    "groupTitle": "Questions 53–55 refer to the following conversation at a commercial logistics hub.",
    "groupId": "53–55",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "53. What does the man need to expedite?",
    "options": {
      "A": "A freight shipment of medical supplies",
      "B": "A batch of company marketing brochures",
      "C": "Replacement parts for an air cargo plane",
      "D": "Furniture for the new branch office"
    },
    "correctAnswer": "A",
    "translation": "What does the man need to expedite?",
    "explanation": "Cần thúc đẩy nhanh chuyến hàng vận chuyển vật tư y tế khẩn cấp."
  },
  {
    "id": 54,
    "part": "Part 3",
    "groupTitle": "Questions 53–55 refer to the following conversation at a commercial logistics hub.",
    "groupId": "53–55",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "54. Why was the cargo held at customs?",
    "options": {
      "A": "A tariff inspection documentation was missing.",
      "B": "The shipment exceeded maximum weight limits.",
      "C": "Import duties had not been paid.",
      "D": "The cargo container was damaged."
    },
    "correctAnswer": "A",
    "translation": "Why was the cargo held at customs?",
    "explanation": "Thiếu giấy tờ khai báo hải quan quy định."
  },
  {
    "id": 55,
    "part": "Part 3",
    "groupTitle": "Questions 53–55 refer to the following conversation at a commercial logistics hub.",
    "groupId": "53–55",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "55. What will the woman provide to the customs office?",
    "options": {
      "A": "The stamped certificate of origin",
      "B": "An updated commercial invoice copy",
      "C": "The shipping insurance certificate",
      "D": "The client's import permit"
    },
    "correctAnswer": "B",
    "translation": "What will the woman provide to the customs office?",
    "explanation": "Cung cấp bản sao hóa đơn thương mại cập nhật để thông quan."
  },
  {
    "id": 56,
    "part": "Part 3",
    "groupTitle": "Questions 56–58 refer to the following conversation in a marketing agency.",
    "groupId": "56–58",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "56. What metric showed the highest improvement?",
    "options": {
      "A": "Customer click-through conversion rates",
      "B": "Social media follower growth",
      "C": "Video view duration",
      "D": "Email newsletter unsubscribe rate"
    },
    "correctAnswer": "A",
    "translation": "What metric showed the highest improvement?",
    "explanation": "Tỷ lệ chuyển đổi nhấp chuột của khách hàng tăng trưởng mạnh nhất."
  },
  {
    "id": 57,
    "part": "Part 3",
    "groupTitle": "Questions 56–58 refer to the following conversation in a marketing agency.",
    "groupId": "56–58",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "57. Which demographic group responded best?",
    "options": {
      "A": "Young professionals aged 25 to 35",
      "B": "College students in urban centers",
      "C": "Retired adults over 60",
      "D": "Corporate procurement managers"
    },
    "correctAnswer": "A",
    "translation": "Which demographic group responded best?",
    "explanation": "Nhóm chuyên gia trẻ tuổi từ 25 đến 35 phản hồi tích cực nhất."
  },
  {
    "id": 58,
    "part": "Part 3",
    "groupTitle": "Questions 56–58 refer to the following conversation in a marketing agency.",
    "groupId": "56–58",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "58. What will the team present at tomorrow's client meeting?",
    "options": {
      "A": "A breakdown of advertising expenditures and ROI",
      "B": "A newly designed company logo",
      "C": "A contract renewal proposal",
      "D": "A video commercial storyboard"
    },
    "correctAnswer": "A",
    "translation": "What will the team present at tomorrow's client meeting?",
    "explanation": "Trình bày chi tiết chi phí quảng cáo và hiệu suất hoàn vốn ROI."
  },
  {
    "id": 59,
    "part": "Part 3",
    "groupTitle": "Questions 59–61 refer to the following conversation about an anniversary event.",
    "groupId": "59–61",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "59. What milestone is the corporation celebrating?",
    "options": {
      "A": "The 20th anniversary of its founding",
      "B": "Surpassing one billion dollars in revenue",
      "C": "Opening its fiftieth branch office",
      "D": "Launching a revolutionary green product"
    },
    "correctAnswer": "A",
    "translation": "What milestone is the corporation celebrating?",
    "explanation": "Kỷ niệm 20 năm ngày thành lập tập đoàn."
  },
  {
    "id": 60,
    "part": "Part 3",
    "groupTitle": "Questions 59–61 refer to the following conversation about an anniversary event.",
    "groupId": "59–61",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "60. What venue has been reserved for the gala?",
    "options": {
      "A": "The Grand Waterfront Ballroom",
      "B": "The National History Museum",
      "C": "The company headquarters courtyard",
      "D": "An international cruise liner"
    },
    "correctAnswer": "A",
    "translation": "What venue has been reserved for the gala?",
    "explanation": "Đã đặt phòng tiệc lớn Grand Waterfront Ballroom."
  },
  {
    "id": 61,
    "part": "Part 3",
    "groupTitle": "Questions 59–61 refer to the following conversation about an anniversary event.",
    "groupId": "59–61",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "61. What task does the man assign to the woman?",
    "options": {
      "A": "Draft the invitations and confirm guest RSVPs",
      "B": "Order anniversary commemorative plaques",
      "C": "Select the musical entertainment band",
      "D": "Coordinate with the media reporters"
    },
    "correctAnswer": "A",
    "translation": "What task does the man assign to the woman?",
    "explanation": "Soạn thư mời và xác nhận phản hồi tham dự từ khách mời."
  },
  {
    "id": 62,
    "part": "Part 3",
    "groupTitle": "Questions 62–64 refer to the following conversation regarding workplace security.",
    "groupId": "62–64",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "62. What new policy will take effect next Monday?",
    "options": {
      "A": "Mandatory wearing of digital ID badges at all times",
      "B": "Daily temperature screening at entrances",
      "C": "Random bag inspections by security guards",
      "D": "Visitor pre-registration 24 hours in advance"
    },
    "correctAnswer": "A",
    "translation": "What new policy will take effect next Monday?",
    "explanation": "Bắt buộc đeo thẻ từ kỹ thuật số mới mọi lúc trong tòa nhà."
  },
  {
    "id": 63,
    "part": "Part 3",
    "groupTitle": "Questions 62–64 refer to the following conversation regarding workplace security.",
    "groupId": "62–64",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "63. What can employees do if they lose their badge?",
    "options": {
      "A": "Request a temporary pass at the security desk",
      "B": "Work from home until a new card is issued",
      "C": "Pay a twenty-dollar replacement penalty",
      "D": "Contact their direct department supervisor"
    },
    "correctAnswer": "A",
    "translation": "What can employees do if they lose their badge?",
    "explanation": "Nhận thẻ tạm thời tại quầy bảo vệ sảnh chính."
  },
  {
    "id": 64,
    "part": "Part 3",
    "groupTitle": "Questions 62–64 refer to the following conversation regarding workplace security.",
    "groupId": "62–64",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "64. Where will badge photographs be taken?",
    "options": {
      "A": "In conference room 3B between 9 and 12",
      "B": "At the human resources reception desk",
      "C": "By individual managers on their phones",
      "D": "At an outside professional photo studio"
    },
    "correctAnswer": "A",
    "translation": "Where will badge photographs be taken?",
    "explanation": "Chụp ảnh thẻ tại phòng họp 3B từ 9h đến 12h."
  },
  {
    "id": 65,
    "part": "Part 3",
    "groupTitle": "Questions 65–67 refer to the following conversation between retail buyers.",
    "groupId": "65–67",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "65. What kind of products is the buyer interested in?",
    "options": {
      "A": "Organic cotton sportswear and apparel",
      "B": "Handcrafted leather footwear",
      "C": "Recycled plastic sunglasses",
      "D": "Waterproof hiking backpacks"
    },
    "correctAnswer": "A",
    "translation": "What kind of products is the buyer interested in?",
    "explanation": "Quan tâm đến dòng trang phục thể thao làm từ sợi bông hữu cơ."
  },
  {
    "id": 66,
    "part": "Part 3",
    "groupTitle": "Questions 65–67 refer to the following conversation between retail buyers.",
    "groupId": "65–67",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "66. What discount did the supplier agree to provide?",
    "options": {
      "A": "A 15% discount on orders over 1,000 units",
      "B": "Free express shipping on all orders",
      "C": "Buy one get one free promotion",
      "D": "A 5% discount for upfront cash payments"
    },
    "correctAnswer": "A",
    "translation": "What discount did the supplier agree to provide?",
    "explanation": "Giảm 15% cho các đơn hàng bán buôn trên 1.000 sản phẩm."
  },
  {
    "id": 67,
    "part": "Part 3",
    "groupTitle": "Questions 65–67 refer to the following conversation between retail buyers.",
    "groupId": "65–67",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "67. When will the initial shipment be dispatched?",
    "options": {
      "A": "Within two business weeks",
      "B": "By the end of the current month",
      "C": "In early September before the autumn season",
      "D": "Immediately following receipt of the deposit"
    },
    "correctAnswer": "D",
    "translation": "When will the initial shipment be dispatched?",
    "explanation": "Hàng sẽ xuất kho ngay sau khi nhận được tiền đặt cọc."
  },
  {
    "id": 68,
    "part": "Part 3",
    "groupTitle": "Questions 68–70 refer to the following conversation at an architecture studio.",
    "groupId": "68–70",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "68. What is the primary topic of the meeting?",
    "options": {
      "A": "Architectural blueprints for the downtown branch",
      "B": "Interior paint colors for the lobby",
      "C": "Selecting landscaping plants for the rooftop",
      "D": "Installing solar roof panels"
    },
    "correctAnswer": "A",
    "translation": "What is the primary topic of the meeting?",
    "explanation": "Bản thiết kế kiến trúc cho chi nhánh văn phòng trung tâm mới."
  },
  {
    "id": 69,
    "part": "Part 3",
    "groupTitle": "Questions 68–70 refer to the following conversation at an architecture studio.",
    "groupId": "68–70",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "69. What modification did the client request?",
    "options": {
      "A": "Adding two soundproof meeting pods on floor 3",
      "B": "Expanding the executive corner office",
      "C": "Reducing the size of the underground garage",
      "D": "Replacing windows with tinted glass"
    },
    "correctAnswer": "A",
    "translation": "What modification did the client request?",
    "explanation": "Khách hàng yêu cầu bổ sung thêm 2 buồng họp cách âm ở tầng 3."
  },
  {
    "id": 70,
    "part": "Part 3",
    "groupTitle": "Questions 68–70 refer to the following conversation at an architecture studio.",
    "groupId": "68–70",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "70. When will the revised blueprints be submitted to the city council?",
    "options": {
      "A": "By next Friday afternoon",
      "B": "Early tomorrow morning",
      "C": "At the end of the fiscal quarter",
      "D": "After structural engineering approval"
    },
    "correctAnswer": "A",
    "translation": "When will the revised blueprints be submitted to the city council?",
    "explanation": "Nộp bản thiết kế đã sửa đổi lên hội đồng thành phố trước chiều thứ Sáu tới."
  },
  {
    "id": 71,
    "part": "Part 4",
    "groupTitle": "Questions 71–73 refer to the following corporate announcement.",
    "groupId": "71–73",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "71. Who is the speaker most likely addressing?",
    "options": {
      "A": "Factory assembly line workers",
      "B": "New corporate employees at orientation",
      "C": "Passengers on a guided tour bus",
      "D": "Store managers at a sales conference"
    },
    "correctAnswer": "B",
    "translation": "Who is the speaker most likely addressing?",
    "explanation": "Thông báo chào mừng nhân viên mới trong ngày định hướng công ty."
  },
  {
    "id": 72,
    "part": "Part 4",
    "groupTitle": "Questions 71–73 refer to the following corporate announcement.",
    "groupId": "71–73",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "72. What will happen at 11:30 A.M.?",
    "options": {
      "A": "A guided tour of corporate facilities",
      "B": "A catered lunch in the terrace dining hall",
      "C": "A presentation on health insurance benefits",
      "D": "A team photograph in the courtyard"
    },
    "correctAnswer": "A",
    "translation": "What will happen at 11:30 A.M.?",
    "explanation": "Chuyến tham quan hướng dẫn các cơ sở vật chất của công ty lúc 11:30."
  },
  {
    "id": 73,
    "part": "Part 4",
    "groupTitle": "Questions 71–73 refer to the following corporate announcement.",
    "groupId": "71–73",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "73. What are listeners reminded to bring tomorrow?",
    "options": {
      "A": "Signed tax forms and direct deposit info",
      "B": "Their original university diplomas",
      "C": "Two passport-sized photographs",
      "D": "Their personal laptop computers"
    },
    "correctAnswer": "A",
    "translation": "What are listeners reminded to bring tomorrow?",
    "explanation": "Nhắc nhở mang biểu mẫu thuế và thông tin chuyển khoản ngân hàng đã ký."
  },
  {
    "id": 74,
    "part": "Part 4",
    "groupTitle": "Questions 74–76 refer to the following airport public address announcement.",
    "groupId": "74–76",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "74. What flight is the announcement regarding?",
    "options": {
      "A": "Flight 482 to London Heathrow",
      "B": "Flight 105 to Tokyo Narita",
      "C": "Flight 720 to Frankfurt Airport",
      "D": "Flight 314 to Sydney Australia"
    },
    "correctAnswer": "A",
    "translation": "What flight is the announcement regarding?",
    "explanation": "Thông báo về chuyến bay 482 đi London Heathrow."
  },
  {
    "id": 75,
    "part": "Part 4",
    "groupTitle": "Questions 74–76 refer to the following airport public address announcement.",
    "groupId": "74–76",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "75. What change has been announced?",
    "options": {
      "A": "The departure gate moved from 12 to 24B",
      "B": "The flight has been cancelled due to fog",
      "C": "Passengers must re-check their carry-on bags",
      "D": "A complimentary meal voucher is offered"
    },
    "correctAnswer": "A",
    "translation": "What change has been announced?",
    "explanation": "Cửa khởi hành đã được chuyển từ cửa 12 sang cửa 24B."
  },
  {
    "id": 76,
    "part": "Part 4",
    "groupTitle": "Questions 74–76 refer to the following airport public address announcement.",
    "groupId": "74–76",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "76. Who will be invited to board first?",
    "options": {
      "A": "Passengers requiring special mobility assistance",
      "B": "Economy class travelers seated in rows 30-45",
      "C": "Frequent flyer silver card holders",
      "D": "Passengers traveling with musical instruments"
    },
    "correctAnswer": "A",
    "translation": "Who will be invited to board first?",
    "explanation": "Hành khách cần hỗ trợ di chuyển đặc biệt và gia đình có trẻ nhỏ."
  },
  {
    "id": 77,
    "part": "Part 4",
    "groupTitle": "Questions 77–79 refer to the following radio broadcast advertisement.",
    "groupId": "77–79",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "77. What event is being advertised?",
    "options": {
      "A": "The Metropolitan Tech and Gadget Expo",
      "B": "An international book and printing fair",
      "C": "A commercial real estate convention",
      "D": "An automotive innovation showcase"
    },
    "correctAnswer": "A",
    "translation": "What event is being advertised?",
    "explanation": "Hội chợ triển lãm công nghệ và thiết bị điện tử Metropolitan Tech Expo."
  },
  {
    "id": 78,
    "part": "Part 4",
    "groupTitle": "Questions 77–79 refer to the following radio broadcast advertisement.",
    "groupId": "77–79",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "78. What special discount is available for online ticket buyers?",
    "options": {
      "A": "A 25% discount off gate admission prices",
      "B": "Free parking at the convention center",
      "C": "A complimentary wireless charging pad",
      "D": "Free entry into the grand prize raffle"
    },
    "correctAnswer": "A",
    "translation": "What special discount is available for online ticket buyers?",
    "explanation": "Giảm giá 25% khi mua vé trực tuyến trước ngày khai mạc."
  },
  {
    "id": 79,
    "part": "Part 4",
    "groupTitle": "Questions 77–79 refer to the following radio broadcast advertisement.",
    "groupId": "77–79",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "79. According to the speaker, how can listeners purchase passes?",
    "options": {
      "A": "By visiting www.metro-techexpo.com",
      "B": "At participating electronic retail stores",
      "C": "By calling the telephone hotline number",
      "D": "At the door on the day of the event"
    },
    "correctAnswer": "A",
    "translation": "According to the speaker, how can listeners purchase passes?",
    "explanation": "Truy cập trang web www.metro-techexpo.com để đặt vé."
  },
  {
    "id": 80,
    "part": "Part 4",
    "groupTitle": "Questions 80–82 refer to the following telephone voicemail message.",
    "groupId": "80–82",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "80. Why is the speaker calling Mr. Jenkins?",
    "options": {
      "A": "To reschedule his dental appointment",
      "B": "To remind him about an outstanding invoice",
      "C": "To provide directions to the new clinic",
      "D": "To confirm receipt of insurance documents"
    },
    "correctAnswer": "A",
    "translation": "Why is the speaker calling Mr. Jenkins?",
    "explanation": "Gọi để thông báo đổi lịch hẹn khám nha khoa."
  },
  {
    "id": 81,
    "part": "Part 4",
    "groupTitle": "Questions 80–82 refer to the following telephone voicemail message.",
    "groupId": "80–82",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "81. Why is Dr. Martinez unavailable on Thursday?",
    "options": {
      "A": "She is attending an oral surgery conference in Boston.",
      "B": "The dental clinic is closed for maintenance.",
      "C": "She has taken an emergency personal leave.",
      "D": "All treatment rooms are fully booked."
    },
    "correctAnswer": "A",
    "translation": "Why is Dr. Martinez unavailable on Thursday?",
    "explanation": "Bác sĩ Martinez tham dự hội thảo phẫu thuật nha khoa tại Boston."
  },
  {
    "id": 82,
    "part": "Part 4",
    "groupTitle": "Questions 80–82 refer to the following telephone voicemail message.",
    "groupId": "80–82",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "82. What does the speaker request that Mr. Jenkins do?",
    "options": {
      "A": "Call back before 5 P.M. to select a new date",
      "B": "Send an email confirming his availability",
      "C": "Arrive fifteen minutes early on Friday",
      "D": "Download the patient registration app"
    },
    "correctAnswer": "A",
    "translation": "What does the speaker request that Mr. Jenkins do?",
    "explanation": "Yêu cầu gọi lại trước 5 giờ chiều để chọn thời gian mới phù hợp."
  },
  {
    "id": 83,
    "part": "Part 4",
    "groupTitle": "Questions 83–85 refer to the following museum tour introduction.",
    "groupId": "83–85",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "83. Where is the speaker giving the talk?",
    "options": {
      "A": "At the National Museum of Modern Art",
      "B": "In a university lecture hall",
      "C": "At a historic colonial castle",
      "D": "Inside a private sculpture studio"
    },
    "correctAnswer": "A",
    "translation": "Where is the speaker giving the talk?",
    "explanation": "Tại bảo tàng nghệ thuật hiện đại quốc gia."
  },
  {
    "id": 84,
    "part": "Part 4",
    "groupTitle": "Questions 83–85 refer to the following museum tour introduction.",
    "groupId": "83–85",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "84. What rule are visitors instructed to follow?",
    "options": {
      "A": "Flash photography is strictly prohibited inside galleries.",
      "B": "No food or drink may be consumed on the tour.",
      "C": "Children under twelve must hold hands with adults.",
      "D": "Mobile phones must be turned off completely."
    },
    "correctAnswer": "A",
    "translation": "What rule are visitors instructed to follow?",
    "explanation": "Nghiêm cấm chụp ảnh có đèn flash để bảo vệ tranh nghệ thuật."
  },
  {
    "id": 85,
    "part": "Part 4",
    "groupTitle": "Questions 83–85 refer to the following museum tour introduction.",
    "groupId": "83–85",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "85. What will happen at the conclusion of the tour?",
    "options": {
      "A": "A live demonstration by a master ceramic artist",
      "B": "A question and answer session in the garden café",
      "C": "A complimentary souvenir postcard gift",
      "D": "A documentary screening in the auditorium"
    },
    "correctAnswer": "A",
    "translation": "What will happen at the conclusion of the tour?",
    "explanation": "Buổi biểu diễn thực tế của nghệ nhân gốm sứ khi kết thúc tour."
  },
  {
    "id": 86,
    "part": "Part 4",
    "groupTitle": "Questions 86–88 refer to the following factory safety meeting speech.",
    "groupId": "86–88",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "86. What is the main topic of the manager's talk?",
    "options": {
      "A": "Workplace safety procedures around forklifts",
      "B": "New shift scheduling and overtime pay",
      "C": "Installing energy-saving LED lighting",
      "D": "Emergency fire evacuation drill results"
    },
    "correctAnswer": "A",
    "translation": "What is the main topic of the manager's talk?",
    "explanation": "Quy trình an toàn lao động khu vực xe nâng hàng trong nhà kho."
  },
  {
    "id": 87,
    "part": "Part 4",
    "groupTitle": "Questions 86–88 refer to the following factory safety meeting speech.",
    "groupId": "86–88",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "87. What piece of protective equipment is now mandatory?",
    "options": {
      "A": "High-visibility fluorescent reflective vests",
      "B": "Noise-cancelling ear protection headphones",
      "C": "Steel-toed waterproof work boots",
      "D": "Full-face clear plastic shields"
    },
    "correctAnswer": "A",
    "translation": "What piece of protective equipment is now mandatory?",
    "explanation": "Bắt buộc mặc áo phản quang phát sáng trong toàn bộ kho."
  },
  {
    "id": 88,
    "part": "Part 4",
    "groupTitle": "Questions 86–88 refer to the following factory safety meeting speech.",
    "groupId": "86–88",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "88. When will the random safety inspection take place?",
    "options": {
      "A": "Throughout the upcoming work week",
      "B": "Tomorrow morning during shift change",
      "C": "At the end of the current month",
      "D": "Immediately following this meeting"
    },
    "correctAnswer": "A",
    "translation": "When will the random safety inspection take place?",
    "explanation": "Kiểm tra an toàn đột xuất sẽ diễn ra trong tuần tới."
  },
  {
    "id": 89,
    "part": "Part 4",
    "groupTitle": "Questions 89–91 refer to the following radio traffic and weather report.",
    "groupId": "89–91",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "89. What is causing major traffic congestion on Highway 101?",
    "options": {
      "A": "An overturned commercial freight truck",
      "B": "Emergency bridge resurfacing roadwork",
      "C": "Flooding caused by overnight heavy rain",
      "D": "A fallen tree blocking three lanes"
    },
    "correctAnswer": "A",
    "translation": "What is causing major traffic congestion on Highway 101?",
    "explanation": "Xe tải chở hàng bị lật gây tắc nghẽn trên đường cao tốc 101."
  },
  {
    "id": 90,
    "part": "Part 4",
    "groupTitle": "Questions 89–91 refer to the following radio traffic and weather report.",
    "groupId": "89–91",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "90. What alternative route does the broadcaster recommend?",
    "options": {
      "A": "Taking the Bayview Parkway scenic detour",
      "B": "Boarding the rapid commuter ferry service",
      "C": "Using the Metro Blue subway line",
      "D": "Taking secondary county road 4"
    },
    "correctAnswer": "A",
    "translation": "What alternative route does the broadcaster recommend?",
    "explanation": "Khuyến nghị đi vòng qua tuyến đại lộ ven vịnh Bayview Parkway."
  },
  {
    "id": 91,
    "part": "Part 4",
    "groupTitle": "Questions 89–91 refer to the following radio traffic and weather report.",
    "groupId": "89–91",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "91. What weather conditions are forecasted for the afternoon?",
    "options": {
      "A": "Severe thunderstorms with strong wind gusts",
      "B": "Clear sunny skies and warm temperatures",
      "C": "Light scattered showers clearing by evening",
      "D": "Heavy fog rolling in from the coastline"
    },
    "correctAnswer": "A",
    "translation": "What weather conditions are forecasted for the afternoon?",
    "explanation": "Dự báo có giông bão mạnh kèm gió giật vào buổi chiều."
  },
  {
    "id": 92,
    "part": "Part 4",
    "groupTitle": "Questions 92–94 refer to the following conference speaker introduction.",
    "groupId": "92–94",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "92. Who is the guest speaker being introduced?",
    "options": {
      "A": "Dr. Elena Rostova, award-winning sustainable architect",
      "B": "Professor Mark Evans, urban planning historian",
      "C": "Sarah Jenkins, environmental journalist",
      "D": "David Chen, commercial building developer"
    },
    "correctAnswer": "A",
    "translation": "Who is the guest speaker being introduced?",
    "explanation": "Tiến sĩ Elena Rostova, kiến trúc sư đoạt giải về công trình bền vững."
  },
  {
    "id": 93,
    "part": "Part 4",
    "groupTitle": "Questions 92–94 refer to the following conference speaker introduction.",
    "groupId": "92–94",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "93. What project is Dr. Rostova most celebrated for?",
    "options": {
      "A": "The zero-carbon EcoTower in Copenhagen",
      "B": "The solar-powered high-speed railway station",
      "C": "The vertical forest residential complex in Milan",
      "D": "The floating convention pavilion in Rotterdam"
    },
    "correctAnswer": "A",
    "translation": "What project is Dr. Rostova most celebrated for?",
    "explanation": "Dự án tòa tháp không phát thải carbon EcoTower tại Copenhagen."
  },
  {
    "id": 94,
    "part": "Part 4",
    "groupTitle": "Questions 92–94 refer to the following conference speaker introduction.",
    "groupId": "92–94",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "94. What will take place immediately after her address?",
    "options": {
      "A": "An interactive audience Q&A panel session",
      "B": "A book signing for her recent publication",
      "C": "A networking buffet luncheon in the atrium",
      "D": "An award presentation by the city mayor"
    },
    "correctAnswer": "A",
    "translation": "What will take place immediately after her address?",
    "explanation": "Phiên hỏi đáp tương tác trực tiếp với khán giả hội trường."
  },
  {
    "id": 95,
    "part": "Part 4",
    "groupTitle": "Questions 95–97 refer to the following store public announcement.",
    "groupId": "95–97",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "95. Where is this announcement taking place?",
    "options": {
      "A": "At Bellevue Department Store",
      "B": "At an outlet mall food court",
      "C": "Inside a wholesale warehouse club",
      "D": "At an independent pharmacy"
    },
    "correctAnswer": "A",
    "translation": "Where is this announcement taking place?",
    "explanation": "Tại trung tâm bách hóa Bellevue Department Store."
  },
  {
    "id": 96,
    "part": "Part 4",
    "groupTitle": "Questions 95–97 refer to the following store public announcement.",
    "groupId": "95–97",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "96. What merchandise is discounted by up to 50%?",
    "options": {
      "A": "All winter outerwear and designer coats",
      "B": "Kitchen appliances and cookware sets",
      "C": "Fine jewelry and luxury wristwatches",
      "D": "Luggage sets and travel accessories"
    },
    "correctAnswer": "A",
    "translation": "What merchandise is discounted by up to 50%?",
    "explanation": "Toàn bộ áo khoác mùa đông và áo choàng thiết kế giảm giá tới 50%."
  },
  {
    "id": 97,
    "part": "Part 4",
    "groupTitle": "Questions 95–97 refer to the following store public announcement.",
    "groupId": "95–97",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "97. What bonus is offered to store loyalty cardholders?",
    "options": {
      "A": "An additional 10% discount at the cash register",
      "B": "Double rewards points on all purchases today",
      "C": "Free gift wrapping services on the 4th floor",
      "D": "A complimentary canvas shopping tote"
    },
    "correctAnswer": "A",
    "translation": "What bonus is offered to store loyalty cardholders?",
    "explanation": "Chủ thẻ thành viên được giảm thêm 10% tại quầy thu ngân."
  },
  {
    "id": 98,
    "part": "Part 4",
    "groupTitle": "Questions 98–100 refer to the following corporate retirement speech.",
    "groupId": "98–100",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "98. What milestone is the speaker commemorating?",
    "options": {
      "A": "His retirement after 35 years of service",
      "B": "The company's expansion into European markets",
      "C": "The successful merger with an international firm",
      "D": "The launch of an innovative aerospace division"
    },
    "correctAnswer": "A",
    "translation": "What milestone is the speaker commemorating?",
    "explanation": "Nghỉ hưu sau 35 năm cống hiến cho tập đoàn."
  },
  {
    "id": 99,
    "part": "Part 4",
    "groupTitle": "Questions 98–100 refer to the following corporate retirement speech.",
    "groupId": "98–100",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "99. Who will assume the role of Chief Executive Officer?",
    "options": {
      "A": "Ms. Clara Vance, former Chief Operating Officer",
      "B": "Mr. Robert Sterling, Senior Vice President of Sales",
      "C": "Dr. Kenji Sato, Head of Research & Development",
      "D": "An external executive recruited from Silicon Valley"
    },
    "correctAnswer": "A",
    "translation": "Who will assume the role of Chief Executive Officer?",
    "explanation": "Bà Clara Vance, cựu Giám đốc vận hành COO sẽ đảm nhiệm chức CEO."
  },
  {
    "id": 100,
    "part": "Part 4",
    "groupTitle": "Questions 98–100 refer to the following corporate retirement speech.",
    "groupId": "98–100",
    "groupTotal": 3,
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "questionText": "100. What does the speaker invite all attendees to do?",
    "options": {
      "A": "Join him for a celebratory toast in the banquet room",
      "B": "Watch a commemorative documentary film",
      "C": "Sign a farewell memory book in the lobby",
      "D": "Collect a personalized souvenir gift"
    },
    "correctAnswer": "A",
    "translation": "What does the speaker invite all attendees to do?",
    "explanation": "Mời toàn thể khách tham dự cùng nâng ly chúc mừng tại phòng tiệc."
  },
  {
    "id": 101,
    "part": "Part 5",
    "questionText": "The board must be given written notice of -------- to the retirement plan at least 30 days in advance.",
    "options": {
      "A": "revisions",
      "B": "revising",
      "C": "revised",
      "D": "revises"
    },
    "correctAnswer": "A",
    "translation": "The board must be given written notice of -------- to the retirement plan at least 30 days in advance.",
    "explanation": "Sau giới từ 'of' cần danh từ số nhiều 'revisions' (những sửa đổi)."
  },
  {
    "id": 102,
    "part": "Part 5",
    "questionText": "Upon the two founders' retirement, the foundation released a booklet describing ------- earliest projects.",
    "options": {
      "A": "they",
      "B": "them",
      "C": "their",
      "D": "themselves"
    },
    "correctAnswer": "C",
    "translation": "Upon the two founders' retirement, the foundation released a booklet describing ------- earliest projects.",
    "explanation": "Đứng trước cụm danh từ 'earliest projects' cần tính từ sở hữu 'their'."
  },
  {
    "id": 103,
    "part": "Part 5",
    "questionText": "The quarterly financial report was compiled ------- by the senior accounting associates.",
    "options": {
      "A": "accurate",
      "B": "accurately",
      "C": "accuracy",
      "D": "accurateness"
    },
    "correctAnswer": "B",
    "translation": "The quarterly financial report was compiled ------- by the senior accounting associates.",
    "explanation": "Bổ nghĩa cho động từ bị động 'was compiled' cần trạng từ 'accurately'."
  },
  {
    "id": 104,
    "part": "Part 5",
    "questionText": "Mr. Henderson will oversee the construction project ------- Ms. Lin returns from maternity leave.",
    "options": {
      "A": "until",
      "B": "during",
      "C": "despite",
      "D": "between"
    },
    "correctAnswer": "A",
    "translation": "Mr. Henderson will oversee the construction project ------- Ms. Lin returns from maternity leave.",
    "explanation": "Liên từ 'until' chỉ thời gian kéo dài cho đến khi một hành động khác xảy ra."
  },
  {
    "id": 105,
    "part": "Part 5",
    "questionText": "All laboratory visitors must obtain a security pass ------- entering the testing facility.",
    "options": {
      "A": "prior to",
      "B": "ahead",
      "C": "in front",
      "D": "previously"
    },
    "correctAnswer": "A",
    "translation": "All laboratory visitors must obtain a security pass ------- entering the testing facility.",
    "explanation": "Cụm giới từ 'prior to' (+ V-ing) mang nghĩa 'trước khi'."
  },
  {
    "id": 106,
    "part": "Part 5",
    "questionText": "The new ventilation system operates much more ------- than the previous installation.",
    "options": {
      "A": "efficient",
      "B": "efficiently",
      "C": "efficiency",
      "D": "efficiencies"
    },
    "correctAnswer": "B",
    "translation": "The new ventilation system operates much more ------- than the previous installation.",
    "explanation": "Bổ nghĩa cho động từ 'operates' trong cấu trúc so sánh hơn cần trạng từ 'efficiently'."
  },
  {
    "id": 107,
    "part": "Part 5",
    "questionText": "Hotel guests are reminded that check-out time is strictly ------- 11:00 A.M.",
    "options": {
      "A": "at",
      "B": "on",
      "C": "for",
      "D": "with"
    },
    "correctAnswer": "A",
    "translation": "Hotel guests are reminded that check-out time is strictly ------- 11:00 A.M.",
    "explanation": "Chỉ mốc giờ chính xác dùng giới từ 'at'."
  },
  {
    "id": 108,
    "part": "Part 5",
    "questionText": "The customer service hotline is available ------- day or night to assist international travelers.",
    "options": {
      "A": "either",
      "B": "neither",
      "C": "both",
      "D": "whether"
    },
    "correctAnswer": "A",
    "translation": "The customer service hotline is available ------- day or night to assist international travelers.",
    "explanation": "Cấu trúc 'either day or night' mang nghĩa ngày hoặc đêm (bất cứ lúc nào)."
  },
  {
    "id": 109,
    "part": "Part 5",
    "questionText": "Sales representatives are eligible for annual performance bonuses ------- they exceed their quotas.",
    "options": {
      "A": "if",
      "B": "so that",
      "C": "due to",
      "D": "rather than"
    },
    "correctAnswer": "A",
    "translation": "Sales representatives are eligible for annual performance bonuses ------- they exceed their quotas.",
    "explanation": "Liên từ điều kiện 'if' (nếu đạt vượt chỉ tiêu)."
  },
  {
    "id": 110,
    "part": "Part 5",
    "questionText": "The marketing director praised Ms. Alvarez for her ------- contributions to the product launch.",
    "options": {
      "A": "exceptional",
      "B": "exception",
      "C": "exceptionally",
      "D": "exceptions"
    },
    "correctAnswer": "A",
    "translation": "The marketing director praised Ms. Alvarez for her ------- contributions to the product launch.",
    "explanation": "Bổ nghĩa cho danh từ 'contributions' cần tính từ 'exceptional' (xuất sắc)."
  },
  {
    "id": 111,
    "part": "Part 5",
    "questionText": "Delivery fees are fully ------- if merchandise arrives in damaged condition.",
    "options": {
      "A": "refundable",
      "B": "refunding",
      "C": "refunded",
      "D": "refunds"
    },
    "correctAnswer": "A",
    "translation": "Delivery fees are fully ------- if merchandise arrives in damaged condition.",
    "explanation": "Sau 'are fully' cần tính từ 'refundable' (có thể hoàn lại tiền)."
  },
  {
    "id": 112,
    "part": "Part 5",
    "questionText": "The keynote speaker thanked the organizing committee for the ------- hospitality.",
    "options": {
      "A": "generous",
      "B": "generously",
      "C": "generosity",
      "D": "generousness"
    },
    "correctAnswer": "A",
    "translation": "The keynote speaker thanked the organizing committee for the ------- hospitality.",
    "explanation": "Bổ nghĩa cho danh từ 'hospitality' cần tính từ 'generous' (hào hiệp, chu đáo)."
  },
  {
    "id": 113,
    "part": "Part 5",
    "questionText": "Please ensure that all confidential documents are placed in the ------- shredding bins.",
    "options": {
      "A": "designate",
      "B": "designated",
      "C": "designation",
      "D": "designating"
    },
    "correctAnswer": "B",
    "translation": "Please ensure that all confidential documents are placed in the ------- shredding bins.",
    "explanation": "Phân từ 'designated' đóng vai trò tính từ (được chỉ định trước)."
  },
  {
    "id": 114,
    "part": "Part 5",
    "questionText": "The regional workshop was attended by delegates from ------- six corporate branch offices.",
    "options": {
      "A": "all",
      "B": "every",
      "C": "each",
      "D": "much"
    },
    "correctAnswer": "A",
    "translation": "The regional workshop was attended by delegates from ------- six corporate branch offices.",
    "explanation": "Đi với danh từ số nhiều 'six corporate branch offices' cần lượng từ 'all'."
  },
  {
    "id": 115,
    "part": "Part 5",
    "questionText": "Contractors must submit their competitive bids ------- the deadline of Friday afternoon.",
    "options": {
      "A": "before",
      "B": "between",
      "C": "among",
      "D": "except"
    },
    "correctAnswer": "A",
    "translation": "Contractors must submit their competitive bids ------- the deadline of Friday afternoon.",
    "explanation": "'before the deadline' mang nghĩa nộp trước hạn chót."
  },
  {
    "id": 116,
    "part": "Part 5",
    "questionText": "The airline guarantees that passengers will receive ------- compensation for delayed luggage.",
    "options": {
      "A": "appropriate",
      "B": "appropriately",
      "C": "appropriateness",
      "D": "appropriating"
    },
    "correctAnswer": "A",
    "translation": "The airline guarantees that passengers will receive ------- compensation for delayed luggage.",
    "explanation": "Đứng trước danh từ 'compensation' cần tính từ 'appropriate' (thích đáng)."
  },
  {
    "id": 117,
    "part": "Part 5",
    "questionText": "Mr. Yamamoto decided to accept the promotion ------- it required relocating to Singapore.",
    "options": {
      "A": "even though",
      "B": "in spite of",
      "C": "as well as",
      "D": "because of"
    },
    "correctAnswer": "A",
    "translation": "Mr. Yamamoto decided to accept the promotion ------- it required relocating to Singapore.",
    "explanation": "Mệnh đề nhượng bộ đi với liên từ 'even though' (+ mệnh đề S+V)."
  },
  {
    "id": 118,
    "part": "Part 5",
    "questionText": "The newly hired administrative assistant showed great ------- in organizing the client database.",
    "options": {
      "A": "initiative",
      "B": "initiate",
      "C": "initiator",
      "D": "initiated"
    },
    "correctAnswer": "A",
    "translation": "The newly hired administrative assistant showed great ------- in organizing the client database.",
    "explanation": "Cụm danh từ 'great initiative' mang nghĩa 'tinh thần chủ động cao'."
  },
  {
    "id": 119,
    "part": "Part 5",
    "questionText": "Passengers must remain seated with seatbelts fastened ------- the aircraft reaches the gate.",
    "options": {
      "A": "until",
      "B": "during",
      "C": "since",
      "D": "following"
    },
    "correctAnswer": "A",
    "translation": "Passengers must remain seated with seatbelts fastened ------- the aircraft reaches the gate.",
    "explanation": "'until the aircraft reaches the gate' (cho đến khi máy bay đến cửa)."
  },
  {
    "id": 120,
    "part": "Part 5",
    "questionText": "The warranty policy covers manufacturing defects but does not apply to normal -------.",
    "options": {
      "A": "wear and tear",
      "B": "worn and torn",
      "C": "wearing",
      "D": "wears"
    },
    "correctAnswer": "A",
    "translation": "The warranty policy covers manufacturing defects but does not apply to normal -------.",
    "explanation": "Thành ngữ thương mại 'normal wear and tear' (hao mòn tự nhiên theo thời gian)."
  },
  {
    "id": 121,
    "part": "Part 5",
    "questionText": "The research institute received a substantial ------- from the international science council.",
    "options": {
      "A": "grant",
      "B": "granted",
      "C": "granting",
      "D": "grantee"
    },
    "correctAnswer": "A",
    "translation": "The research institute received a substantial ------- from the international science council.",
    "explanation": "Sau tính từ 'substantial' cần danh từ 'grant' (khoản tài trợ nghiên cứu)."
  },
  {
    "id": 122,
    "part": "Part 5",
    "questionText": "Employees interested in the mentorship program must submit their applications ------- March 15.",
    "options": {
      "A": "by",
      "B": "on",
      "C": "at",
      "D": "with"
    },
    "correctAnswer": "A",
    "translation": "Employees interested in the mentorship program must submit their applications ------- March 15.",
    "explanation": "Chỉ hạn chót trước ngày cụ thể dùng giới từ 'by'."
  },
  {
    "id": 123,
    "part": "Part 5",
    "questionText": "The software installation guide was rewritten to make the instructions ------- to non-technical users.",
    "options": {
      "A": "accessible",
      "B": "accessibility",
      "C": "accessibly",
      "D": "access"
    },
    "correctAnswer": "A",
    "translation": "The software installation guide was rewritten to make the instructions ------- to non-technical users.",
    "explanation": "Cấu trúc 'make + O + adj' -> cần tính từ 'accessible' (dễ tiếp cận, dễ hiểu)."
  },
  {
    "id": 124,
    "part": "Part 5",
    "questionText": "Production at the automotive assembly line increased ------- after new robotic tools were introduced.",
    "options": {
      "A": "sharply",
      "B": "sharp",
      "C": "sharpen",
      "D": "sharpness"
    },
    "correctAnswer": "A",
    "translation": "Production at the automotive assembly line increased ------- after new robotic tools were introduced.",
    "explanation": "Bổ nghĩa cho động từ 'increased' cần trạng từ 'sharply' (tăng mạnh)."
  },
  {
    "id": 125,
    "part": "Part 5",
    "questionText": "Ms. Foster was chosen to lead the delegation because of her ------- background in international trade.",
    "options": {
      "A": "extensive",
      "B": "extent",
      "C": "extension",
      "D": "extensively"
    },
    "correctAnswer": "A",
    "translation": "Ms. Foster was chosen to lead the delegation because of her ------- background in international trade.",
    "explanation": "Bổ nghĩa cho danh từ 'background' cần tính từ 'extensive' (sâu rộng, dày dặn kinh nghiệm)."
  },
  {
    "id": 126,
    "part": "Part 5",
    "questionText": "Neither the design team ------- the engineering department approved the proposed vehicle blueprint.",
    "options": {
      "A": "nor",
      "B": "or",
      "C": "and",
      "D": "also"
    },
    "correctAnswer": "A",
    "translation": "Neither the design team ------- the engineering department approved the proposed vehicle blueprint.",
    "explanation": "Cặp liên từ tương quan 'Neither ... nor ...' (cả hai đều không)."
  },
  {
    "id": 127,
    "part": "Part 5",
    "questionText": "The restaurant chain prides itself on sourcing ingredients exclusively from ------- organic farms.",
    "options": {
      "A": "local",
      "B": "locally",
      "C": "locality",
      "D": "localize"
    },
    "correctAnswer": "A",
    "translation": "The restaurant chain prides itself on sourcing ingredients exclusively from ------- organic farms.",
    "explanation": "Đứng trước cụm danh từ 'organic farms' cần tính từ 'local' (địa phương)."
  },
  {
    "id": 128,
    "part": "Part 5",
    "questionText": "Customer satisfaction scores rose steadily ------- the implementation of the online chat feature.",
    "options": {
      "A": "following",
      "B": "followed",
      "C": "follows",
      "D": "follower"
    },
    "correctAnswer": "A",
    "translation": "Customer satisfaction scores rose steadily ------- the implementation of the online chat feature.",
    "explanation": "Giới từ 'following' mang nghĩa 'sau khi / theo sau'."
  },
  {
    "id": 129,
    "part": "Part 5",
    "questionText": "All maintenance staff must attend the quarterly safety briefing, ------- of job seniority.",
    "options": {
      "A": "regardless",
      "B": "regarding",
      "C": "regards",
      "D": "regard"
    },
    "correctAnswer": "A",
    "translation": "All maintenance staff must attend the quarterly safety briefing, ------- of job seniority.",
    "explanation": "Cụm giới từ cố định 'regardless of' (bất kể thâm niên công tác)."
  },
  {
    "id": 130,
    "part": "Part 5",
    "questionText": "The museum gift shop offers a ten percent discount to patrons who show their ------- membership cards.",
    "options": {
      "A": "valid",
      "B": "validate",
      "C": "validation",
      "D": "validly"
    },
    "correctAnswer": "A",
    "translation": "The museum gift shop offers a ten percent discount to patrons who show their ------- membership cards.",
    "explanation": "Bổ nghĩa cho danh từ 'membership cards' cần tính từ 'valid' (còn hiệu lực)."
  },
  {
    "id": 131,
    "part": "Part 6",
    "groupTitle": "Questions 131–134 refer to the following article.",
    "groupId": "131–134",
    "groupTotal": 4,
    "passage": "(March 8)—Clothing rental services, which let customers borrow outfits for a monthly fee instead of buying them, are currently enjoying a boom nationwide. The number of subscribers grew nearly 40% in the past year, and rental racks can now be found in a ------- (131) range of stores, from small boutiques to national department chains.\n\nA major reason for this trend is changing shopper ------- (132) shaped by concern about the waste created by fast fashion. According to Marina Delgado, spokesperson for the Garment Rental Council, the lower monthly fees and larger selection of newer services have helped ------- (133). Ms. Delgado believes that this part of the industry will only continue to grow. ------- (134)",
    "questionText": "131.",
    "options": {
      "A": "distant",
      "B": "wide",
      "C": "frequent",
      "D": "various"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 131 trong bài đọc Part 6.",
    "explanation": "Cụm từ cố định 'a wide range of' (một phạm vi rộng/đa dạng)."
  },
  {
    "id": 132,
    "part": "Part 6",
    "groupTitle": "Questions 131–134 refer to the following article.",
    "groupId": "131–134",
    "groupTotal": 4,
    "passage": "(March 8)—Clothing rental services, which let customers borrow outfits for a monthly fee instead of buying them, are currently enjoying a boom nationwide. The number of subscribers grew nearly 40% in the past year, and rental racks can now be found in a ------- (131) range of stores, from small boutiques to national department chains.\n\nA major reason for this trend is changing shopper ------- (132) shaped by concern about the waste created by fast fashion. According to Marina Delgado, spokesperson for the Garment Rental Council, the lower monthly fees and larger selection of newer services have helped ------- (133). Ms. Delgado believes that this part of the industry will only continue to grow. ------- (134)",
    "questionText": "132.",
    "options": {
      "A": "habits",
      "B": "receipts",
      "C": "currencies",
      "D": "refunds"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 132 trong bài đọc Part 6.",
    "explanation": "Shopper habits: thói quen của người mua sắm."
  },
  {
    "id": 133,
    "part": "Part 6",
    "groupTitle": "Questions 131–134 refer to the following article.",
    "groupId": "131–134",
    "groupTotal": 4,
    "passage": "(March 8)—Clothing rental services, which let customers borrow outfits for a monthly fee instead of buying them, are currently enjoying a boom nationwide. The number of subscribers grew nearly 40% in the past year, and rental racks can now be found in a ------- (131) range of stores, from small boutiques to national department chains.\n\nA major reason for this trend is changing shopper ------- (132) shaped by concern about the waste created by fast fashion. According to Marina Delgado, spokesperson for the Garment Rental Council, the lower monthly fees and larger selection of newer services have helped ------- (133). Ms. Delgado believes that this part of the industry will only continue to grow. ------- (134)",
    "questionText": "133.",
    "options": {
      "A": "tremendously",
      "B": "tremendous",
      "C": "tremble",
      "D": "tremor"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 133 trong bài đọc Part 6.",
    "explanation": "Trạng từ 'tremendously' bổ nghĩa cho động từ helped (đã giúp ích to lớn)."
  },
  {
    "id": 134,
    "part": "Part 6",
    "groupTitle": "Questions 131–134 refer to the following article.",
    "groupId": "131–134",
    "groupTotal": 4,
    "passage": "(March 8)—Clothing rental services, which let customers borrow outfits for a monthly fee instead of buying them, are currently enjoying a boom nationwide. The number of subscribers grew nearly 40% in the past year, and rental racks can now be found in a ------- (131) range of stores, from small boutiques to national department chains.\n\nA major reason for this trend is changing shopper ------- (132) shaped by concern about the waste created by fast fashion. According to Marina Delgado, spokesperson for the Garment Rental Council, the lower monthly fees and larger selection of newer services have helped ------- (133). Ms. Delgado believes that this part of the industry will only continue to grow. ------- (134)",
    "questionText": "134.",
    "options": {
      "A": "More retail chains are expected to launch rental platforms soon.",
      "B": "Garment manufacturing requires substantial electrical power.",
      "C": "Winter coats must be cleaned before summer storage.",
      "D": "The store opens daily at ten in the morning."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 134 trong bài đọc Part 6.",
    "explanation": "Câu liên kết dự báo xu hướng ngành tiếp tục mở rộng."
  },
  {
    "id": 135,
    "part": "Part 6",
    "groupTitle": "Questions 135–138 refer to the following internal company memo.",
    "groupId": "135–138",
    "groupTotal": 4,
    "passage": "MEMORANDUM\nTo: All Staff Members\nFrom: IT Department\nDate: September 12\nSubject: Implementation of the New Enterprise Intranet Portal\n\nOn Monday, October 1, we will officially ------- (135) our upgraded internal intranet system. This platform is designed to make project collaboration and document management significantly ------- (136).\n\nAll employees are required to complete a brief online video tutorial before the launch date. ------- (137). You can log in using your standard employee network credentials. Should you encounter any difficulty accessing the system, please contact the IT technical support team ------- (138).",
    "questionText": "135.",
    "options": {
      "A": "launch",
      "B": "launches",
      "C": "launched",
      "D": "launching"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 135 trong bài đọc Part 6.",
    "explanation": "Sau 'will officially' cần động từ nguyên mẫu 'launch'."
  },
  {
    "id": 136,
    "part": "Part 6",
    "groupTitle": "Questions 135–138 refer to the following internal company memo.",
    "groupId": "135–138",
    "groupTotal": 4,
    "passage": "MEMORANDUM\nTo: All Staff Members\nFrom: IT Department\nDate: September 12\nSubject: Implementation of the New Enterprise Intranet Portal\n\nOn Monday, October 1, we will officially ------- (135) our upgraded internal intranet system. This platform is designed to make project collaboration and document management significantly ------- (136).\n\nAll employees are required to complete a brief online video tutorial before the launch date. ------- (137). You can log in using your standard employee network credentials. Should you encounter any difficulty accessing the system, please contact the IT technical support team ------- (138).",
    "questionText": "136.",
    "options": {
      "A": "easier",
      "B": "easily",
      "C": "ease",
      "D": "easiest"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 136 trong bài đọc Part 6.",
    "explanation": "Cấu trúc 'make + O + adj' so sánh hơn: make it significantly easier."
  },
  {
    "id": 137,
    "part": "Part 6",
    "groupTitle": "Questions 135–138 refer to the following internal company memo.",
    "groupId": "135–138",
    "groupTotal": 4,
    "passage": "MEMORANDUM\nTo: All Staff Members\nFrom: IT Department\nDate: September 12\nSubject: Implementation of the New Enterprise Intranet Portal\n\nOn Monday, October 1, we will officially ------- (135) our upgraded internal intranet system. This platform is designed to make project collaboration and document management significantly ------- (136).\n\nAll employees are required to complete a brief online video tutorial before the launch date. ------- (137). You can log in using your standard employee network credentials. Should you encounter any difficulty accessing the system, please contact the IT technical support team ------- (138).",
    "questionText": "137.",
    "options": {
      "A": "The tutorial takes approximately twenty minutes to finish.",
      "B": "Our company headquarters was built twelve years ago.",
      "C": "Parking permits must be displayed on vehicle windshields.",
      "D": "Lunch will be provided in the cafeteria today."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 137 trong bài đọc Part 6.",
    "explanation": "Câu giải thích bổ sung về thời lượng khóa học video ngắn."
  },
  {
    "id": 138,
    "part": "Part 6",
    "groupTitle": "Questions 135–138 refer to the following internal company memo.",
    "groupId": "135–138",
    "groupTotal": 4,
    "passage": "MEMORANDUM\nTo: All Staff Members\nFrom: IT Department\nDate: September 12\nSubject: Implementation of the New Enterprise Intranet Portal\n\nOn Monday, October 1, we will officially ------- (135) our upgraded internal intranet system. This platform is designed to make project collaboration and document management significantly ------- (136).\n\nAll employees are required to complete a brief online video tutorial before the launch date. ------- (137). You can log in using your standard employee network credentials. Should you encounter any difficulty accessing the system, please contact the IT technical support team ------- (138).",
    "questionText": "138.",
    "options": {
      "A": "promptly",
      "B": "prompt",
      "C": "promptness",
      "D": "prompts"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 138 trong bài đọc Part 6.",
    "explanation": "Bổ nghĩa cho động từ contact cần trạng từ 'promptly' (ngay lập tức)."
  },
  {
    "id": 139,
    "part": "Part 6",
    "groupTitle": "Questions 139–142 refer to the following customer inquiry email.",
    "groupId": "139–142",
    "groupTotal": 4,
    "passage": "To: Customer Service <support@valencia-audio.com>\nFrom: David Miller <dmiller@innovatemail.com>\nDate: November 4\nSubject: Warranty Coverage for Model VX-400 Wireless Headphones\n\nDear Customer Service Team,\n\nI am writing to inquire about the warranty policy for my Valencia VX-400 headphones, which I ------- (139) six months ago from an authorized retail dealer in Chicago.\n\nRecently, the left earpiece has stopped producing sound ------- (140). I have tried resetting the Bluetooth connection, but the issue persists. According to your product documentation, all VX-series items carry a one-year warranty. ------- (141). Could you please inform me of the procedure for shipping the unit to your repair facility? I have attached a copy of my original sales receipt for your ------- (142).\n\nSincerely,\nDavid Miller",
    "questionText": "139.",
    "options": {
      "A": "purchased",
      "B": "purchase",
      "C": "purchasing",
      "D": "purchases"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 139 trong bài đọc Part 6.",
    "explanation": "Hành động mua đã xảy ra 6 tháng trước -> thì quá khứ đơn 'purchased'."
  },
  {
    "id": 140,
    "part": "Part 6",
    "groupTitle": "Questions 139–142 refer to the following customer inquiry email.",
    "groupId": "139–142",
    "groupTotal": 4,
    "passage": "To: Customer Service <support@valencia-audio.com>\nFrom: David Miller <dmiller@innovatemail.com>\nDate: November 4\nSubject: Warranty Coverage for Model VX-400 Wireless Headphones\n\nDear Customer Service Team,\n\nI am writing to inquire about the warranty policy for my Valencia VX-400 headphones, which I ------- (139) six months ago from an authorized retail dealer in Chicago.\n\nRecently, the left earpiece has stopped producing sound ------- (140). I have tried resetting the Bluetooth connection, but the issue persists. According to your product documentation, all VX-series items carry a one-year warranty. ------- (141). Could you please inform me of the procedure for shipping the unit to your repair facility? I have attached a copy of my original sales receipt for your ------- (142).\n\nSincerely,\nDavid Miller",
    "questionText": "140.",
    "options": {
      "A": "entirely",
      "B": "entire",
      "C": "entirety",
      "D": "entires"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 140 trong bài đọc Part 6.",
    "explanation": "Trạng từ 'entirely' bổ nghĩa cho stopped producing sound (hoàn toàn ngưng phát âm thanh)."
  },
  {
    "id": 141,
    "part": "Part 6",
    "groupTitle": "Questions 139–142 refer to the following customer inquiry email.",
    "groupId": "139–142",
    "groupTotal": 4,
    "passage": "To: Customer Service <support@valencia-audio.com>\nFrom: David Miller <dmiller@innovatemail.com>\nDate: November 4\nSubject: Warranty Coverage for Model VX-400 Wireless Headphones\n\nDear Customer Service Team,\n\nI am writing to inquire about the warranty policy for my Valencia VX-400 headphones, which I ------- (139) six months ago from an authorized retail dealer in Chicago.\n\nRecently, the left earpiece has stopped producing sound ------- (140). I have tried resetting the Bluetooth connection, but the issue persists. According to your product documentation, all VX-series items carry a one-year warranty. ------- (141). Could you please inform me of the procedure for shipping the unit to your repair facility? I have attached a copy of my original sales receipt for your ------- (142).\n\nSincerely,\nDavid Miller",
    "questionText": "141.",
    "options": {
      "A": "Therefore, I believe this repair should be covered free of charge.",
      "B": "The weather in Chicago has been colder than normal.",
      "C": "I would like to order additional headphone carrying cases.",
      "D": "My home address was changed two years ago."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 141 trong bài đọc Part 6.",
    "explanation": "Câu liên kết chỉ ra rằng sản phẩm còn hạn bảo hành nên cần được sửa miễn phí."
  },
  {
    "id": 142,
    "part": "Part 6",
    "groupTitle": "Questions 139–142 refer to the following customer inquiry email.",
    "groupId": "139–142",
    "groupTotal": 4,
    "passage": "To: Customer Service <support@valencia-audio.com>\nFrom: David Miller <dmiller@innovatemail.com>\nDate: November 4\nSubject: Warranty Coverage for Model VX-400 Wireless Headphones\n\nDear Customer Service Team,\n\nI am writing to inquire about the warranty policy for my Valencia VX-400 headphones, which I ------- (139) six months ago from an authorized retail dealer in Chicago.\n\nRecently, the left earpiece has stopped producing sound ------- (140). I have tried resetting the Bluetooth connection, but the issue persists. According to your product documentation, all VX-series items carry a one-year warranty. ------- (141). Could you please inform me of the procedure for shipping the unit to your repair facility? I have attached a copy of my original sales receipt for your ------- (142).\n\nSincerely,\nDavid Miller",
    "questionText": "142.",
    "options": {
      "A": "verification",
      "B": "verify",
      "C": "verifiable",
      "D": "verifies"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 142 trong bài đọc Part 6.",
    "explanation": "Sau 'for your' cần danh từ 'verification' (để quý công ty xác thực)."
  },
  {
    "id": 143,
    "part": "Part 6",
    "groupTitle": "Questions 143–146 refer to the following corporate press release.",
    "groupId": "143–146",
    "groupTotal": 4,
    "passage": "FOR IMMEDIATE RELEASE\nOakmont Motors Announces Expansion of Electric Vehicle Lineup\n\nDETROIT (February 15)—Oakmont Motors announced today that it will invest $800 million to expand its manufacturing facility in Michigan. The expansion will allow the automaker to ------- (143) production of its next-generation zero-emission commercial cargo vans.\n\nCompany CEO Brian Sterling stated that consumer demand for commercial electric fleets has been rising ------- (144) over the past two years. \"Our corporate clients are seeking ways to lower delivery costs and reduce their environmental footprint,\" Mr. Sterling remarked. ------- (145).\n\nConstruction on the new factory wing will commence in April, with vehicle deliveries scheduled to begin late next year. Oakmont Motors anticipates that this venture will create over 1,200 specialized manufacturing ------- (146) in the region.",
    "questionText": "143.",
    "options": {
      "A": "accelerate",
      "B": "accelerated",
      "C": "accelerating",
      "D": "acceleration"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 143 trong bài đọc Part 6.",
    "explanation": "Sau 'allow the automaker to' cần động từ nguyên mẫu 'accelerate' (đẩy nhanh tiến độ)."
  },
  {
    "id": 144,
    "part": "Part 6",
    "groupTitle": "Questions 143–146 refer to the following corporate press release.",
    "groupId": "143–146",
    "groupTotal": 4,
    "passage": "FOR IMMEDIATE RELEASE\nOakmont Motors Announces Expansion of Electric Vehicle Lineup\n\nDETROIT (February 15)—Oakmont Motors announced today that it will invest $800 million to expand its manufacturing facility in Michigan. The expansion will allow the automaker to ------- (143) production of its next-generation zero-emission commercial cargo vans.\n\nCompany CEO Brian Sterling stated that consumer demand for commercial electric fleets has been rising ------- (144) over the past two years. \"Our corporate clients are seeking ways to lower delivery costs and reduce their environmental footprint,\" Mr. Sterling remarked. ------- (145).\n\nConstruction on the new factory wing will commence in April, with vehicle deliveries scheduled to begin late next year. Oakmont Motors anticipates that this venture will create over 1,200 specialized manufacturing ------- (146) in the region.",
    "questionText": "144.",
    "options": {
      "A": "steadily",
      "B": "steady",
      "C": "steadiness",
      "D": "steadied"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 144 trong bài đọc Part 6.",
    "explanation": "Trạng từ 'steadily' bổ nghĩa cho rising (tăng trưởng đều đặn)."
  },
  {
    "id": 145,
    "part": "Part 6",
    "groupTitle": "Questions 143–146 refer to the following corporate press release.",
    "groupId": "143–146",
    "groupTotal": 4,
    "passage": "FOR IMMEDIATE RELEASE\nOakmont Motors Announces Expansion of Electric Vehicle Lineup\n\nDETROIT (February 15)—Oakmont Motors announced today that it will invest $800 million to expand its manufacturing facility in Michigan. The expansion will allow the automaker to ------- (143) production of its next-generation zero-emission commercial cargo vans.\n\nCompany CEO Brian Sterling stated that consumer demand for commercial electric fleets has been rising ------- (144) over the past two years. \"Our corporate clients are seeking ways to lower delivery costs and reduce their environmental footprint,\" Mr. Sterling remarked. ------- (145).\n\nConstruction on the new factory wing will commence in April, with vehicle deliveries scheduled to begin late next year. Oakmont Motors anticipates that this venture will create over 1,200 specialized manufacturing ------- (146) in the region.",
    "questionText": "145.",
    "options": {
      "A": "Our new electric vans will help them achieve both goals efficiently.",
      "B": "Gasoline prices in Michigan have remained relatively stable.",
      "C": "Most employees prefer to commute by public transit trains.",
      "D": "The company headquarters was founded in eighteen ninety."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 145 trong bài đọc Part 6.",
    "explanation": "Câu liên kết làm rõ cách các dòng xe điện mới giúp khách hàng đạt được hai mục tiêu trên."
  },
  {
    "id": 146,
    "part": "Part 6",
    "groupTitle": "Questions 143–146 refer to the following corporate press release.",
    "groupId": "143–146",
    "groupTotal": 4,
    "passage": "FOR IMMEDIATE RELEASE\nOakmont Motors Announces Expansion of Electric Vehicle Lineup\n\nDETROIT (February 15)—Oakmont Motors announced today that it will invest $800 million to expand its manufacturing facility in Michigan. The expansion will allow the automaker to ------- (143) production of its next-generation zero-emission commercial cargo vans.\n\nCompany CEO Brian Sterling stated that consumer demand for commercial electric fleets has been rising ------- (144) over the past two years. \"Our corporate clients are seeking ways to lower delivery costs and reduce their environmental footprint,\" Mr. Sterling remarked. ------- (145).\n\nConstruction on the new factory wing will commence in April, with vehicle deliveries scheduled to begin late next year. Oakmont Motors anticipates that this venture will create over 1,200 specialized manufacturing ------- (146) in the region.",
    "questionText": "146.",
    "options": {
      "A": "jobs",
      "B": "hobbies",
      "C": "vacations",
      "D": "tickets"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 146 trong bài đọc Part 6.",
    "explanation": "Manufacturing jobs: việc làm trong ngành sản xuất."
  },
  {
    "id": 147,
    "part": "Part 7",
    "groupTitle": "Questions 147–148 refer to the following notice.",
    "groupId": "147–148",
    "groupTotal": 2,
    "passage": "MEADOWLARK GARDEN CENTRES – HEAD OFFICE\nSTAFF TRAINING SESSION\nTopic: Choosing Stock for the Spring Season\nPresenter: Dana Okonkwo, Okonkwo Nursery Group\nDate: 14 March, 2:00 P.M.\nLocation: www.link-room.co.uk (Session Code: 447 210 665)\n\nAttendance is required for anyone who places orders with our growers. The session runs for ninety minutes and will not be recorded. Please e-mail any questions you would like Ms. Okonkwo to answer to training@meadowlark.co.uk by 10 March.",
    "evidence": "Attendance is required for anyone who places orders with our growers.",
    "questionText": "147. Who will most likely attend the session?",
    "options": {
      "A": "Delivery drivers",
      "B": "Shop-floor assistants",
      "C": "Growers from local nurseries",
      "D": "Employees who buy stock"
    },
    "correctAnswer": "D",
    "translation": "Câu hỏi 147 trong phần đọc hiểu Part 7.",
    "explanation": "Việc tham gia là bắt buộc cho bất kỳ ai đặt hàng với các nhà vườn -> Nhân viên mua hàng hóa."
  },
  {
    "id": 148,
    "part": "Part 7",
    "groupTitle": "Questions 147–148 refer to the following notice.",
    "groupId": "147–148",
    "groupTotal": 2,
    "passage": "MEADOWLARK GARDEN CENTRES – HEAD OFFICE\nSTAFF TRAINING SESSION\nTopic: Choosing Stock for the Spring Season\nPresenter: Dana Okonkwo, Okonkwo Nursery Group\nDate: 14 March, 2:00 P.M.\nLocation: www.link-room.co.uk (Session Code: 447 210 665)\n\nAttendance is required for anyone who places orders with our growers. The session runs for ninety minutes and will not be recorded. Please e-mail any questions you would like Ms. Okonkwo to answer to training@meadowlark.co.uk by 10 March.",
    "evidence": "Attendance is required for anyone who places orders with our growers.",
    "questionText": "148. What are employees asked to do before 10 March?",
    "options": {
      "A": "Send in questions for the presenter",
      "B": "Confirm their attendance with a manager",
      "C": "Register on the company website",
      "D": "Download the training booklet"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 148 trong phần đọc hiểu Part 7.",
    "explanation": "Gửi email câu hỏi trước ngày 10 tháng 3."
  },
  {
    "id": 149,
    "part": "Part 7",
    "groupTitle": "Questions 149–150 refer to the following confirmation email.",
    "groupId": "149–150",
    "groupTotal": 2,
    "passage": "To: Kevin Tran <ktran@apollotech.com>\nFrom: Reservations <booking@grandpalacehotel.com>\nDate: April 18\nSubject: Booking Confirmation #GP-94281\n\nDear Mr. Tran,\n\nThank you for choosing the Grand Palace Hotel. We are pleased to confirm your reservation for an Executive King Suite from May 3 to May 6 (3 nights).\n\nCheck-in time is 3:00 P.M. and check-out time is 11:00 A.M. Your booking includes complimentary high-speed Wi-Fi access and a daily breakfast buffet served in the Veranda Dining Room. If you require airport shuttle transportation, please notify us at least 24 hours prior to your arrival.\n\nSincerely,\nGuest Services Team",
    "questionText": "149. What type of room did Mr. Tran reserve?",
    "options": {
      "A": "A Standard Single Room",
      "B": "An Executive King Suite",
      "C": "A Deluxe Double Queen",
      "D": "A Penthouse Apartment"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 149 trong phần đọc hiểu Part 7.",
    "explanation": "Email xác nhận đặt phòng Executive King Suite."
  },
  {
    "id": 150,
    "part": "Part 7",
    "groupTitle": "Questions 149–150 refer to the following confirmation email.",
    "groupId": "149–150",
    "groupTotal": 2,
    "passage": "To: Kevin Tran <ktran@apollotech.com>\nFrom: Reservations <booking@grandpalacehotel.com>\nDate: April 18\nSubject: Booking Confirmation #GP-94281\n\nDear Mr. Tran,\n\nThank you for choosing the Grand Palace Hotel. We are pleased to confirm your reservation for an Executive King Suite from May 3 to May 6 (3 nights).\n\nCheck-in time is 3:00 P.M. and check-out time is 11:00 A.M. Your booking includes complimentary high-speed Wi-Fi access and a daily breakfast buffet served in the Veranda Dining Room. If you require airport shuttle transportation, please notify us at least 24 hours prior to your arrival.\n\nSincerely,\nGuest Services Team",
    "questionText": "150. What must Mr. Tran do 24 hours before arrival if he wants shuttle service?",
    "options": {
      "A": "Contact the hotel in advance",
      "B": "Pay an additional deposit online",
      "C": "Print his flight boarding pass",
      "D": "Download the hotel mobile app"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 150 trong phần đọc hiểu Part 7.",
    "explanation": "Thông báo cho khách sạn ít nhất 24 giờ trước khi đến."
  },
  {
    "id": 151,
    "part": "Part 7",
    "groupTitle": "Questions 151–152 refer to the following job advertisement.",
    "groupId": "151–152",
    "groupTotal": 2,
    "passage": "Apex Digital Marketing – Open Position: Senior Copywriter\nLocation: Seattle, WA (Hybrid: 3 days in office / 2 days remote)\n\nWe are seeking a talented Senior Copywriter to join our award-winning creative agency. In this role, you will develop compelling advertising content for international corporate clients across digital, print, and video platforms.\n\nQualifications:\n- Bachelor's degree in Communications, Journalism, or English\n- Minimum of 4 years of professional copywriting experience\n- Proven ability to manage multiple tight deadlines\n- Familiarity with SEO optimization tools is preferred\n\nTo apply, please email your resume and portfolio of writing samples to careers@apexdigital.com before June 30.",
    "questionText": "151. What is mentioned about the work arrangement?",
    "options": {
      "A": "It allows employees to work remotely two days per week.",
      "B": "It requires frequent international travel.",
      "C": "It is a temporary six-month contract.",
      "D": "Work shifts are conducted entirely at night."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 151 trong phần đọc hiểu Part 7.",
    "explanation": "Mô hình làm việc kết hợp: 3 ngày tại văn phòng / 2 ngày làm từ xa."
  },
  {
    "id": 152,
    "part": "Part 7",
    "groupTitle": "Questions 151–152 refer to the following job advertisement.",
    "groupId": "151–152",
    "groupTotal": 2,
    "passage": "Apex Digital Marketing – Open Position: Senior Copywriter\nLocation: Seattle, WA (Hybrid: 3 days in office / 2 days remote)\n\nWe are seeking a talented Senior Copywriter to join our award-winning creative agency. In this role, you will develop compelling advertising content for international corporate clients across digital, print, and video platforms.\n\nQualifications:\n- Bachelor's degree in Communications, Journalism, or English\n- Minimum of 4 years of professional copywriting experience\n- Proven ability to manage multiple tight deadlines\n- Familiarity with SEO optimization tools is preferred\n\nTo apply, please email your resume and portfolio of writing samples to careers@apexdigital.com before June 30.",
    "questionText": "152. What should applicants include with their resume?",
    "options": {
      "A": "A portfolio of writing samples",
      "B": "Three letters of recommendation",
      "C": "Official university transcripts",
      "D": "A passport photocopy"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 152 trong phần đọc hiểu Part 7.",
    "explanation": "Gửi kèm hồ sơ năng lực các bài viết mẫu (writing samples)."
  },
  {
    "id": 153,
    "part": "Part 7",
    "groupTitle": "Questions 153–155 refer to the following conference program schedule.",
    "groupId": "153–155",
    "groupTotal": 3,
    "passage": "ANNUAL LEADERSHIP & INNOVATION SUMMIT\nVenue: Hyatt Regency Convention Center, Denver\nDate: October 22\n\n8:30 A.M. – 9:00 A.M. | Registration & Welcome Coffee (Lobby Foyer)\n9:00 A.M. – 10:15 A.M. | Keynote Address: \"AI in Enterprise Decision Making\" by Dr. Aris Thorne (Grand Hall)\n10:30 A.M. – 12:00 P.M. | Concurrent Panel Sessions:\n  - Panel A: Cloud Data Security (Room 101)\n  - Panel B: Sustainable Supply Chain Networks (Room 102)\n12:00 P.M. – 1:30 P.M. | Networking Luncheon (Pavilion Restaurant)\n1:30 P.M. – 3:00 P.M. | Interactive Workshop: Agile Leadership in Times of Change (Room 205)\n3:15 P.M. – 4:00 P.M. | Closing Remarks & Networking Reception",
    "questionText": "153. Where will Dr. Aris Thorne deliver the keynote address?",
    "options": {
      "A": "In the Grand Hall",
      "B": "In Room 101",
      "C": "In the Pavilion Restaurant",
      "D": "In Room 205"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 153 trong phần đọc hiểu Part 7.",
    "explanation": "Bài diễn thuyết chính diễn ra tại Grand Hall lúc 9:00."
  },
  {
    "id": 154,
    "part": "Part 7",
    "groupTitle": "Questions 153–155 refer to the following conference program schedule.",
    "groupId": "153–155",
    "groupTotal": 3,
    "passage": "ANNUAL LEADERSHIP & INNOVATION SUMMIT\nVenue: Hyatt Regency Convention Center, Denver\nDate: October 22\n\n8:30 A.M. – 9:00 A.M. | Registration & Welcome Coffee (Lobby Foyer)\n9:00 A.M. – 10:15 A.M. | Keynote Address: \"AI in Enterprise Decision Making\" by Dr. Aris Thorne (Grand Hall)\n10:30 A.M. – 12:00 P.M. | Concurrent Panel Sessions:\n  - Panel A: Cloud Data Security (Room 101)\n  - Panel B: Sustainable Supply Chain Networks (Room 102)\n12:00 P.M. – 1:30 P.M. | Networking Luncheon (Pavilion Restaurant)\n1:30 P.M. – 3:00 P.M. | Interactive Workshop: Agile Leadership in Times of Change (Room 205)\n3:15 P.M. – 4:00 P.M. | Closing Remarks & Networking Reception",
    "questionText": "154. What topic is covered in Room 102?",
    "options": {
      "A": "Sustainable Supply Chain Networks",
      "B": "Cloud Data Security",
      "C": "AI in Enterprise Decision Making",
      "D": "Agile Leadership Workshop"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 154 trong phần đọc hiểu Part 7.",
    "explanation": "Phòng 102 thảo luận về chuỗi cung ứng bền vững."
  },
  {
    "id": 155,
    "part": "Part 7",
    "groupTitle": "Questions 153–155 refer to the following conference program schedule.",
    "groupId": "153–155",
    "groupTotal": 3,
    "passage": "ANNUAL LEADERSHIP & INNOVATION SUMMIT\nVenue: Hyatt Regency Convention Center, Denver\nDate: October 22\n\n8:30 A.M. – 9:00 A.M. | Registration & Welcome Coffee (Lobby Foyer)\n9:00 A.M. – 10:15 A.M. | Keynote Address: \"AI in Enterprise Decision Making\" by Dr. Aris Thorne (Grand Hall)\n10:30 A.M. – 12:00 P.M. | Concurrent Panel Sessions:\n  - Panel A: Cloud Data Security (Room 101)\n  - Panel B: Sustainable Supply Chain Networks (Room 102)\n12:00 P.M. – 1:30 P.M. | Networking Luncheon (Pavilion Restaurant)\n1:30 P.M. – 3:00 P.M. | Interactive Workshop: Agile Leadership in Times of Change (Room 205)\n3:15 P.M. – 4:00 P.M. | Closing Remarks & Networking Reception",
    "questionText": "155. How much time is allocated for the networking luncheon?",
    "options": {
      "A": "45 minutes",
      "B": "60 minutes",
      "C": "90 minutes",
      "D": "2 hours"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 155 trong phần đọc hiểu Part 7.",
    "explanation": "Bữa trưa giao lưu diễn ra từ 12:00 đến 1:30 (90 phút)."
  },
  {
    "id": 156,
    "part": "Part 7",
    "groupTitle": "Questions 156–157 refer to the following text message chain.",
    "groupId": "156–157",
    "groupTotal": 2,
    "passage": "[10:14 A.M.] Carlos Ortiz:\nHi Sarah, did the printed presentation booklets for the 11 A.M. client pitch arrive from the print shop yet?\n\n[10:16 A.M.] Sarah Chen:\nNot yet. The courier called five minutes ago saying there is heavy construction traffic on 4th Avenue. He estimated he would arrive by 10:35.\n\n[10:18 A.M.] Carlos Ortiz:\nThat's cutting it close. Just in case, could you load the PDF version onto the tablet in conference room A?\n\n[10:20 A.M.] Sarah Chen:\nI'm on it. I'll also ensure the large monitor display is tested and ready to mirror the tablet screen.",
    "questionText": "156. Why is the delivery courier delayed?",
    "options": {
      "A": "Road construction caused traffic delays.",
      "B": "The courier went to the wrong building.",
      "C": "The printing machinery broke down.",
      "D": "The delivery address was incomplete."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 156 trong phần đọc hiểu Part 7.",
    "explanation": "Tắc đường do công trình thi công trên đại lộ 4th Avenue."
  },
  {
    "id": 157,
    "part": "Part 7",
    "groupTitle": "Questions 156–157 refer to the following text message chain.",
    "groupId": "156–157",
    "groupTotal": 2,
    "passage": "[10:14 A.M.] Carlos Ortiz:\nHi Sarah, did the printed presentation booklets for the 11 A.M. client pitch arrive from the print shop yet?\n\n[10:16 A.M.] Sarah Chen:\nNot yet. The courier called five minutes ago saying there is heavy construction traffic on 4th Avenue. He estimated he would arrive by 10:35.\n\n[10:18 A.M.] Carlos Ortiz:\nThat's cutting it close. Just in case, could you load the PDF version onto the tablet in conference room A?\n\n[10:20 A.M.] Sarah Chen:\nI'm on it. I'll also ensure the large monitor display is tested and ready to mirror the tablet screen.",
    "questionText": "157. What does Ms. Chen mean when she writes 'I'm on it'?",
    "options": {
      "A": "She will immediately perform the requested task.",
      "B": "She is currently on the delivery van.",
      "C": "She disagree with the suggestion.",
      "D": "She has already left the building."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 157 trong phần đọc hiểu Part 7.",
    "explanation": "Thành ngữ 'I\\'m on it' mang nghĩa sẽ thực hiện nhiệm vụ ngay lập tức."
  },
  {
    "id": 158,
    "part": "Part 7",
    "groupTitle": "Questions 158–160 refer to the following press release.",
    "groupId": "158–160",
    "groupTotal": 3,
    "passage": "FOR IMMEDIATE RELEASE\nCentennial Financial Relocates Global Headquarters to Boston Waterfront\n\nBOSTON (August 5)—Centennial Financial Corporation today announced the completion of its corporate headquarters relocation to the newly developed Harborview Tower in Boston's Seaport District.\n\nThe state-of-the-art, 32-story building consolidates 2,500 employees who were previously scattered across four separate regional offices in Massachusetts. Designed with advanced energy-saving technology, the facility features floor-to-ceiling windows, smart LED illumination, and a rooftop solar farm capable of supplying 30 percent of the tower's daytime electricity.\n\n\"This move represents a transformative chapter for Centennial Financial,\" stated CEO Marcus Vance. \"Our new headquarters promotes teamwork while reducing our environmental footprint.\" The building also includes a subsidized employee dining hall, wellness center, and direct covered access to the MBTA Silver Line transit station.",
    "questionText": "158. What is the primary purpose of the press release?",
    "options": {
      "A": "To announce the relocation of corporate headquarters",
      "B": "To advertise available office space for lease",
      "C": "To report quarterly financial earnings",
      "D": "To announce the resignation of a corporate executive"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 158 trong phần đọc hiểu Part 7.",
    "explanation": "Thông báo hoàn tất việc chuyển trụ sở chính về Boston."
  },
  {
    "id": 159,
    "part": "Part 7",
    "groupTitle": "Questions 158–160 refer to the following press release.",
    "groupId": "158–160",
    "groupTotal": 3,
    "passage": "FOR IMMEDIATE RELEASE\nCentennial Financial Relocates Global Headquarters to Boston Waterfront\n\nBOSTON (August 5)—Centennial Financial Corporation today announced the completion of its corporate headquarters relocation to the newly developed Harborview Tower in Boston's Seaport District.\n\nThe state-of-the-art, 32-story building consolidates 2,500 employees who were previously scattered across four separate regional offices in Massachusetts. Designed with advanced energy-saving technology, the facility features floor-to-ceiling windows, smart LED illumination, and a rooftop solar farm capable of supplying 30 percent of the tower's daytime electricity.\n\n\"This move represents a transformative chapter for Centennial Financial,\" stated CEO Marcus Vance. \"Our new headquarters promotes teamwork while reducing our environmental footprint.\" The building also includes a subsidized employee dining hall, wellness center, and direct covered access to the MBTA Silver Line transit station.",
    "questionText": "159. What environmental feature is highlighted about Harborview Tower?",
    "options": {
      "A": "A rooftop solar farm supplying daytime electricity",
      "B": "A rainwater recycling purification plant",
      "C": "Geothermal heating beneath the parking garage",
      "D": "Walls constructed from recycled concrete"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 159 trong phần đọc hiểu Part 7.",
    "explanation": "Hệ thống điện mặt trời trên mái cung cấp 30% điện ban ngày."
  },
  {
    "id": 160,
    "part": "Part 7",
    "groupTitle": "Questions 158–160 refer to the following press release.",
    "groupId": "158–160",
    "groupTotal": 3,
    "passage": "FOR IMMEDIATE RELEASE\nCentennial Financial Relocates Global Headquarters to Boston Waterfront\n\nBOSTON (August 5)—Centennial Financial Corporation today announced the completion of its corporate headquarters relocation to the newly developed Harborview Tower in Boston's Seaport District.\n\nThe state-of-the-art, 32-story building consolidates 2,500 employees who were previously scattered across four separate regional offices in Massachusetts. Designed with advanced energy-saving technology, the facility features floor-to-ceiling windows, smart LED illumination, and a rooftop solar farm capable of supplying 30 percent of the tower's daytime electricity.\n\n\"This move represents a transformative chapter for Centennial Financial,\" stated CEO Marcus Vance. \"Our new headquarters promotes teamwork while reducing our environmental footprint.\" The building also includes a subsidized employee dining hall, wellness center, and direct covered access to the MBTA Silver Line transit station.",
    "questionText": "160. What amenity is directly accessible from the new building?",
    "options": {
      "A": "A public subway/transit station",
      "B": "An international cruise passenger terminal",
      "C": "A commercial airport shuttle runway",
      "D": "A private helicopter landing pad"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 160 trong phần đọc hiểu Part 7.",
    "explanation": "Lối đi trực tiếp có mái che đến trạm tàu MBTA Silver Line."
  },
  {
    "id": 161,
    "part": "Part 7",
    "groupTitle": "Questions 161–163 refer to the following magazine article.",
    "groupId": "161–163",
    "groupTotal": 3,
    "passage": "TECH DIGEST – REVIEW\nThe NovaSound 500: A New Benchmark in Noise-Cancelling Headphones\nBy Liam Gallagher\n\nIn the fiercely competitive audio market, manufacturer NovaTech has raised the bar with its latest wireless model, the NovaSound 500. Priced at $299, this headset features custom 40mm titanium drivers and an adaptive noise-cancelling algorithm that adjusts seamlessly to changing ambient sound levels.\n\nDuring our two-week laboratory test, the battery consistently lasted 38 hours on a single charge with active noise cancellation enabled—surpassing the manufacturer's claim of 35 hours. The memory-foam ear cushions provide remarkable comfort during prolonged flights. The only minor drawback is the bulkiness of the hard-shell storage case, which occupies considerable space in a travel backpack. Nonetheless, for frequent business travelers, the sound clarity and exceptional battery endurance make it well worth the investment.",
    "questionText": "161. What did laboratory tests reveal about the battery life?",
    "options": {
      "A": "It lasted longer than the manufacturer claimed.",
      "B": "It required five hours to recharge completely.",
      "C": "It degraded rapidly in cold weather.",
      "D": "It failed to reach twenty hours of playtime."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 161 trong phần đọc hiểu Part 7.",
    "explanation": "Pin kéo dài 38 giờ, vượt qua con số 35 giờ mà nhà sản xuất công bố."
  },
  {
    "id": 162,
    "part": "Part 7",
    "groupTitle": "Questions 161–163 refer to the following magazine article.",
    "groupId": "161–163",
    "groupTotal": 3,
    "passage": "TECH DIGEST – REVIEW\nThe NovaSound 500: A New Benchmark in Noise-Cancelling Headphones\nBy Liam Gallagher\n\nIn the fiercely competitive audio market, manufacturer NovaTech has raised the bar with its latest wireless model, the NovaSound 500. Priced at $299, this headset features custom 40mm titanium drivers and an adaptive noise-cancelling algorithm that adjusts seamlessly to changing ambient sound levels.\n\nDuring our two-week laboratory test, the battery consistently lasted 38 hours on a single charge with active noise cancellation enabled—surpassing the manufacturer's claim of 35 hours. The memory-foam ear cushions provide remarkable comfort during prolonged flights. The only minor drawback is the bulkiness of the hard-shell storage case, which occupies considerable space in a travel backpack. Nonetheless, for frequent business travelers, the sound clarity and exceptional battery endurance make it well worth the investment.",
    "questionText": "162. What criticism does the reviewer mention?",
    "options": {
      "A": "The protective carrying case is bulky.",
      "B": "The retail purchase price is excessive.",
      "C": "The Bluetooth pairing process is unreliable.",
      "D": "The ear cushions cause discomfort after one hour."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 162 trong phần đọc hiểu Part 7.",
    "explanation": "Hộp đựng bảo vệ hơi cồng kềnh, chiếm nhiều diện tích ba lô."
  },
  {
    "id": 163,
    "part": "Part 7",
    "groupTitle": "Questions 161–163 refer to the following magazine article.",
    "groupId": "161–163",
    "groupTotal": 3,
    "passage": "TECH DIGEST – REVIEW\nThe NovaSound 500: A New Benchmark in Noise-Cancelling Headphones\nBy Liam Gallagher\n\nIn the fiercely competitive audio market, manufacturer NovaTech has raised the bar with its latest wireless model, the NovaSound 500. Priced at $299, this headset features custom 40mm titanium drivers and an adaptive noise-cancelling algorithm that adjusts seamlessly to changing ambient sound levels.\n\nDuring our two-week laboratory test, the battery consistently lasted 38 hours on a single charge with active noise cancellation enabled—surpassing the manufacturer's claim of 35 hours. The memory-foam ear cushions provide remarkable comfort during prolonged flights. The only minor drawback is the bulkiness of the hard-shell storage case, which occupies considerable space in a travel backpack. Nonetheless, for frequent business travelers, the sound clarity and exceptional battery endurance make it well worth the investment.",
    "questionText": "163. Who is the product especially recommended for?",
    "options": {
      "A": "Frequent business travelers",
      "B": "Professional audio recording engineers",
      "C": "Competitive video gamers",
      "D": "Children studying foreign languages"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 163 trong phần đọc hiểu Part 7.",
    "explanation": "Đặc biệt khuyên dùng cho người thường xuyên đi công tác máy bay."
  },
  {
    "id": 164,
    "part": "Part 7",
    "groupTitle": "Questions 164–167 refer to the following corporate policy memo.",
    "groupId": "164–167",
    "groupTotal": 4,
    "passage": "VANGUARD TECHNOLOGIES – POLICY UPDATE\nMEMORANDUM\nTo: All Full-Time Associates\nFrom: Human Resources Department\nDate: September 5\nSubject: Flexible Remote Work Guidelines\n\nEffective October 1, Vanguard Technologies will introduce a modernized Flexible Work Policy. Associates in designated departments may elect to work remotely up to two days per week, subject to prior written approval from their department director.\n\nKey Guidelines:\n1. Core Collaboration Days: Tuesdays and Thursdays are designated as mandatory on-site days for all company personnel to facilitate face-to-face team meetings and project coordination.\n2. Home Office Security: Remote employees must utilize company-issued encrypted virtual private networks (VPNs) when accessing internal servers and confidential client data.\n3. Equipment Allowance: Full-time employees are eligible for a one-time reimbursement of up to $300 to purchase ergonomic home office supplies, such as monitors, keyboards, or desk chairs. Receipts must be submitted through the corporate expense portal within 60 days of purchase.",
    "questionText": "164. What is the maximum number of remote days permitted per week?",
    "options": {
      "A": "One day",
      "B": "Two days",
      "C": "Three days",
      "D": "Four days"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 164 trong phần đọc hiểu Part 7.",
    "explanation": "Chính sách cho phép làm việc từ xa tối đa 2 ngày mỗi tuần."
  },
  {
    "id": 165,
    "part": "Part 7",
    "groupTitle": "Questions 164–167 refer to the following corporate policy memo.",
    "groupId": "164–167",
    "groupTotal": 4,
    "passage": "VANGUARD TECHNOLOGIES – POLICY UPDATE\nMEMORANDUM\nTo: All Full-Time Associates\nFrom: Human Resources Department\nDate: September 5\nSubject: Flexible Remote Work Guidelines\n\nEffective October 1, Vanguard Technologies will introduce a modernized Flexible Work Policy. Associates in designated departments may elect to work remotely up to two days per week, subject to prior written approval from their department director.\n\nKey Guidelines:\n1. Core Collaboration Days: Tuesdays and Thursdays are designated as mandatory on-site days for all company personnel to facilitate face-to-face team meetings and project coordination.\n2. Home Office Security: Remote employees must utilize company-issued encrypted virtual private networks (VPNs) when accessing internal servers and confidential client data.\n3. Equipment Allowance: Full-time employees are eligible for a one-time reimbursement of up to $300 to purchase ergonomic home office supplies, such as monitors, keyboards, or desk chairs. Receipts must be submitted through the corporate expense portal within 60 days of purchase.",
    "questionText": "165. On which days must all staff be present at the office?",
    "options": {
      "A": "Mondays and Fridays",
      "B": "Tuesdays and Thursdays",
      "C": "Wednesdays only",
      "D": "Any two days of their choosing"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 165 trong phần đọc hiểu Part 7.",
    "explanation": "Thứ Ba và thứ Năm là các ngày bắt buộc có mặt tại văn phòng."
  },
  {
    "id": 166,
    "part": "Part 7",
    "groupTitle": "Questions 164–167 refer to the following corporate policy memo.",
    "groupId": "164–167",
    "groupTotal": 4,
    "passage": "VANGUARD TECHNOLOGIES – POLICY UPDATE\nMEMORANDUM\nTo: All Full-Time Associates\nFrom: Human Resources Department\nDate: September 5\nSubject: Flexible Remote Work Guidelines\n\nEffective October 1, Vanguard Technologies will introduce a modernized Flexible Work Policy. Associates in designated departments may elect to work remotely up to two days per week, subject to prior written approval from their department director.\n\nKey Guidelines:\n1. Core Collaboration Days: Tuesdays and Thursdays are designated as mandatory on-site days for all company personnel to facilitate face-to-face team meetings and project coordination.\n2. Home Office Security: Remote employees must utilize company-issued encrypted virtual private networks (VPNs) when accessing internal servers and confidential client data.\n3. Equipment Allowance: Full-time employees are eligible for a one-time reimbursement of up to $300 to purchase ergonomic home office supplies, such as monitors, keyboards, or desk chairs. Receipts must be submitted through the corporate expense portal within 60 days of purchase.",
    "questionText": "166. What must remote workers use to access internal servers?",
    "options": {
      "A": "Company-issued encrypted VPNs",
      "B": "Public browser proxy servers",
      "C": "Personal mobile hotspots",
      "D": "External cloud storage drives"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 166 trong phần đọc hiểu Part 7.",
    "explanation": "Phải sử dụng mạng riêng ảo mã hóa VPN do công ty cấp."
  },
  {
    "id": 167,
    "part": "Part 7",
    "groupTitle": "Questions 164–167 refer to the following corporate policy memo.",
    "groupId": "164–167",
    "groupTotal": 4,
    "passage": "VANGUARD TECHNOLOGIES – POLICY UPDATE\nMEMORANDUM\nTo: All Full-Time Associates\nFrom: Human Resources Department\nDate: September 5\nSubject: Flexible Remote Work Guidelines\n\nEffective October 1, Vanguard Technologies will introduce a modernized Flexible Work Policy. Associates in designated departments may elect to work remotely up to two days per week, subject to prior written approval from their department director.\n\nKey Guidelines:\n1. Core Collaboration Days: Tuesdays and Thursdays are designated as mandatory on-site days for all company personnel to facilitate face-to-face team meetings and project coordination.\n2. Home Office Security: Remote employees must utilize company-issued encrypted virtual private networks (VPNs) when accessing internal servers and confidential client data.\n3. Equipment Allowance: Full-time employees are eligible for a one-time reimbursement of up to $300 to purchase ergonomic home office supplies, such as monitors, keyboards, or desk chairs. Receipts must be submitted through the corporate expense portal within 60 days of purchase.",
    "questionText": "167. Within how many days must equipment receipts be submitted?",
    "options": {
      "A": "Within 30 days",
      "B": "Within 60 days",
      "C": "Within 90 days",
      "D": "By the end of the year"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 167 trong phần đọc hiểu Part 7.",
    "explanation": "Biên lai phải nộp qua cổng thanh toán trong vòng 60 ngày."
  },
  {
    "id": 168,
    "part": "Part 7",
    "groupTitle": "Questions 168–171 refer to the following financial earnings report.",
    "groupId": "168–171",
    "groupTotal": 4,
    "passage": "PACIFIC CARGO CORP. – THIRD-QUARTER FINANCIAL SUMMARY\nExecutive Briefing – October 28\n\nPacific Cargo Corp. delivered strong performance during the third quarter ending September 30. Total consolidated revenue reached $482 million, representing an 8.5% increase compared to the corresponding period last fiscal year.\n\nKey Highlights:\n- Ocean Freight Division: Generated $290 million, driven by strong container shipping demand along trans-Pacific maritime routes.\n- Air Express Division: Revenue rose 14% to $145 million, aided by corporate contracts in pharmaceutical and electronic component logistics.\n- Warehousing & Logistics: Revenue remained flat at $47 million due to ongoing warehouse consolidation projects in Southern California.\n\nOperating expenses rose by 4% to $398 million, primarily attributed to higher jet fuel costs and wage increases for commercial harbor forklift operators. Operating profit for the quarter stood at $84 million. Looking forward, management projects full-year revenue to surpass $1.9 billion.",
    "questionText": "168. How much total revenue was generated in the third quarter?",
    "options": {
      "A": "$398 million",
      "B": "$482 million",
      "C": "$145 million",
      "D": "$1.9 billion"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 168 trong phần đọc hiểu Part 7.",
    "explanation": "Tổng doanh thu quý 3 đạt 482 triệu USD."
  },
  {
    "id": 169,
    "part": "Part 7",
    "groupTitle": "Questions 168–171 refer to the following financial earnings report.",
    "groupId": "168–171",
    "groupTotal": 4,
    "passage": "PACIFIC CARGO CORP. – THIRD-QUARTER FINANCIAL SUMMARY\nExecutive Briefing – October 28\n\nPacific Cargo Corp. delivered strong performance during the third quarter ending September 30. Total consolidated revenue reached $482 million, representing an 8.5% increase compared to the corresponding period last fiscal year.\n\nKey Highlights:\n- Ocean Freight Division: Generated $290 million, driven by strong container shipping demand along trans-Pacific maritime routes.\n- Air Express Division: Revenue rose 14% to $145 million, aided by corporate contracts in pharmaceutical and electronic component logistics.\n- Warehousing & Logistics: Revenue remained flat at $47 million due to ongoing warehouse consolidation projects in Southern California.\n\nOperating expenses rose by 4% to $398 million, primarily attributed to higher jet fuel costs and wage increases for commercial harbor forklift operators. Operating profit for the quarter stood at $84 million. Looking forward, management projects full-year revenue to surpass $1.9 billion.",
    "questionText": "169. Which division experienced a 14% revenue increase?",
    "options": {
      "A": "Air Express Division",
      "B": "Ocean Freight Division",
      "C": "Warehousing & Logistics",
      "D": "Ground Trucking Fleet"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 169 trong phần đọc hiểu Part 7.",
    "explanation": "Bộ phận vận tải hàng không Air Express tăng trưởng 14%."
  },
  {
    "id": 170,
    "part": "Part 7",
    "groupTitle": "Questions 168–171 refer to the following financial earnings report.",
    "groupId": "168–171",
    "groupTotal": 4,
    "passage": "PACIFIC CARGO CORP. – THIRD-QUARTER FINANCIAL SUMMARY\nExecutive Briefing – October 28\n\nPacific Cargo Corp. delivered strong performance during the third quarter ending September 30. Total consolidated revenue reached $482 million, representing an 8.5% increase compared to the corresponding period last fiscal year.\n\nKey Highlights:\n- Ocean Freight Division: Generated $290 million, driven by strong container shipping demand along trans-Pacific maritime routes.\n- Air Express Division: Revenue rose 14% to $145 million, aided by corporate contracts in pharmaceutical and electronic component logistics.\n- Warehousing & Logistics: Revenue remained flat at $47 million due to ongoing warehouse consolidation projects in Southern California.\n\nOperating expenses rose by 4% to $398 million, primarily attributed to higher jet fuel costs and wage increases for commercial harbor forklift operators. Operating profit for the quarter stood at $84 million. Looking forward, management projects full-year revenue to surpass $1.9 billion.",
    "questionText": "170. What factor contributed to higher operating expenses?",
    "options": {
      "A": "Increased aviation fuel expenses",
      "B": "Construction of a new harbor terminal",
      "C": "Severe maritime customs fines",
      "D": "Legal expenses from a corporate merger"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 170 trong phần đọc hiểu Part 7.",
    "explanation": "Chi phí vận hành tăng do chi phí nhiên liệu máy bay tăng."
  },
  {
    "id": 171,
    "part": "Part 7",
    "groupTitle": "Questions 168–171 refer to the following financial earnings report.",
    "groupId": "168–171",
    "groupTotal": 4,
    "passage": "PACIFIC CARGO CORP. – THIRD-QUARTER FINANCIAL SUMMARY\nExecutive Briefing – October 28\n\nPacific Cargo Corp. delivered strong performance during the third quarter ending September 30. Total consolidated revenue reached $482 million, representing an 8.5% increase compared to the corresponding period last fiscal year.\n\nKey Highlights:\n- Ocean Freight Division: Generated $290 million, driven by strong container shipping demand along trans-Pacific maritime routes.\n- Air Express Division: Revenue rose 14% to $145 million, aided by corporate contracts in pharmaceutical and electronic component logistics.\n- Warehousing & Logistics: Revenue remained flat at $47 million due to ongoing warehouse consolidation projects in Southern California.\n\nOperating expenses rose by 4% to $398 million, primarily attributed to higher jet fuel costs and wage increases for commercial harbor forklift operators. Operating profit for the quarter stood at $84 million. Looking forward, management projects full-year revenue to surpass $1.9 billion.",
    "questionText": "171. What is the full-year revenue forecast?",
    "options": {
      "A": "To exceed $1.9 billion",
      "B": "To match last year's $1.2 billion",
      "C": "Approximately $840 million",
      "D": "Between $500 and $600 million"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 171 trong phần đọc hiểu Part 7.",
    "explanation": "Dự báo doanh thu cả năm vượt 1,9 tỷ USD."
  },
  {
    "id": 172,
    "part": "Part 7",
    "groupTitle": "Questions 172–175 refer to the following customer feedback survey summary.",
    "groupId": "172–175",
    "groupTotal": 4,
    "passage": "SOLARIS AIRWAYS – IN-FLIGHT SERVICE EVALUATION REPORT\nCompiled by Quality Assurance Department | August 14\n\nDuring the month of July, Solaris Airways surveyed 3,800 passengers across 45 international long-haul routes to gauge satisfaction regarding our redesigned cabin interiors and in-flight dining options.\n\nSurvey Results (Scale 1 to 5):\n1. Cabin Cleanliness & Comfort: 4.8 / 5.0 (96% positive)\n   Passengers praised the ergonomic memory-foam seats and enhanced legroom in Premium Economy.\n2. In-Flight Entertainment System: 4.6 / 5.0 (92% positive)\n   The selection of international cinema releases and high-definition touchscreens received widespread commendation.\n3. Meal Selection & Quality: 3.4 / 5.0 (68% positive)\n   While breakfast offerings were well-received, numerous travelers noted that dinner entrée portions were small and lacked vegetarian variety.\n4. Cabin Crew Attentiveness: 4.7 / 5.0 (94% positive)\n\nRecommendations for Action:\nIn response to passenger comments, the executive catering team will partner with chef Marc Dubois in September to overhaul dinner menus, increasing hot entrée portion sizes by 20% and introducing two certified vegan gourmet options.",
    "questionText": "172. Which service category received the lowest customer rating?",
    "options": {
      "A": "Meal Selection & Quality",
      "B": "Cabin Cleanliness & Comfort",
      "C": "In-Flight Entertainment System",
      "D": "Cabin Crew Attentiveness"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 172 trong phần đọc hiểu Part 7.",
    "explanation": "Chất lượng và lựa chọn đồ ăn nhận điểm thấp nhất (3.4 / 5.0)."
  },
  {
    "id": 173,
    "part": "Part 7",
    "groupTitle": "Questions 172–175 refer to the following customer feedback survey summary.",
    "groupId": "172–175",
    "groupTotal": 4,
    "passage": "SOLARIS AIRWAYS – IN-FLIGHT SERVICE EVALUATION REPORT\nCompiled by Quality Assurance Department | August 14\n\nDuring the month of July, Solaris Airways surveyed 3,800 passengers across 45 international long-haul routes to gauge satisfaction regarding our redesigned cabin interiors and in-flight dining options.\n\nSurvey Results (Scale 1 to 5):\n1. Cabin Cleanliness & Comfort: 4.8 / 5.0 (96% positive)\n   Passengers praised the ergonomic memory-foam seats and enhanced legroom in Premium Economy.\n2. In-Flight Entertainment System: 4.6 / 5.0 (92% positive)\n   The selection of international cinema releases and high-definition touchscreens received widespread commendation.\n3. Meal Selection & Quality: 3.4 / 5.0 (68% positive)\n   While breakfast offerings were well-received, numerous travelers noted that dinner entrée portions were small and lacked vegetarian variety.\n4. Cabin Crew Attentiveness: 4.7 / 5.0 (94% positive)\n\nRecommendations for Action:\nIn response to passenger comments, the executive catering team will partner with chef Marc Dubois in September to overhaul dinner menus, increasing hot entrée portion sizes by 20% and introducing two certified vegan gourmet options.",
    "questionText": "173. What was a common criticism regarding dinner meals?",
    "options": {
      "A": "Portion sizes were too small.",
      "B": "Meals were served cold.",
      "C": "Food was overly spicy.",
      "D": "Beverages were not included."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 173 trong phần đọc hiểu Part 7.",
    "explanation": "Khách hàng phàn nàn khẩu phần ăn bữa tối bị nhỏ."
  },
  {
    "id": 174,
    "part": "Part 7",
    "groupTitle": "Questions 172–175 refer to the following customer feedback survey summary.",
    "groupId": "172–175",
    "groupTotal": 4,
    "passage": "SOLARIS AIRWAYS – IN-FLIGHT SERVICE EVALUATION REPORT\nCompiled by Quality Assurance Department | August 14\n\nDuring the month of July, Solaris Airways surveyed 3,800 passengers across 45 international long-haul routes to gauge satisfaction regarding our redesigned cabin interiors and in-flight dining options.\n\nSurvey Results (Scale 1 to 5):\n1. Cabin Cleanliness & Comfort: 4.8 / 5.0 (96% positive)\n   Passengers praised the ergonomic memory-foam seats and enhanced legroom in Premium Economy.\n2. In-Flight Entertainment System: 4.6 / 5.0 (92% positive)\n   The selection of international cinema releases and high-definition touchscreens received widespread commendation.\n3. Meal Selection & Quality: 3.4 / 5.0 (68% positive)\n   While breakfast offerings were well-received, numerous travelers noted that dinner entrée portions were small and lacked vegetarian variety.\n4. Cabin Crew Attentiveness: 4.7 / 5.0 (94% positive)\n\nRecommendations for Action:\nIn response to passenger comments, the executive catering team will partner with chef Marc Dubois in September to overhaul dinner menus, increasing hot entrée portion sizes by 20% and introducing two certified vegan gourmet options.",
    "questionText": "174. What change will take effect in September?",
    "options": {
      "A": "Dinner menus will be revamped with larger portions.",
      "B": "In-flight Wi-Fi will become free for all passengers.",
      "C": "Cabin seats will be replaced with leather upholstery.",
      "D": "Flight tickets will include two checked bags."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 174 trong phần đọc hiểu Part 7.",
    "explanation": "Thực đơn bữa tối sẽ được cải tổ với khẩu phần tăng 20%."
  },
  {
    "id": 175,
    "part": "Part 7",
    "groupTitle": "Questions 172–175 refer to the following customer feedback survey summary.",
    "groupId": "172–175",
    "groupTotal": 4,
    "passage": "SOLARIS AIRWAYS – IN-FLIGHT SERVICE EVALUATION REPORT\nCompiled by Quality Assurance Department | August 14\n\nDuring the month of July, Solaris Airways surveyed 3,800 passengers across 45 international long-haul routes to gauge satisfaction regarding our redesigned cabin interiors and in-flight dining options.\n\nSurvey Results (Scale 1 to 5):\n1. Cabin Cleanliness & Comfort: 4.8 / 5.0 (96% positive)\n   Passengers praised the ergonomic memory-foam seats and enhanced legroom in Premium Economy.\n2. In-Flight Entertainment System: 4.6 / 5.0 (92% positive)\n   The selection of international cinema releases and high-definition touchscreens received widespread commendation.\n3. Meal Selection & Quality: 3.4 / 5.0 (68% positive)\n   While breakfast offerings were well-received, numerous travelers noted that dinner entrée portions were small and lacked vegetarian variety.\n4. Cabin Crew Attentiveness: 4.7 / 5.0 (94% positive)\n\nRecommendations for Action:\nIn response to passenger comments, the executive catering team will partner with chef Marc Dubois in September to overhaul dinner menus, increasing hot entrée portion sizes by 20% and introducing two certified vegan gourmet options.",
    "questionText": "175. How many passengers participated in the July survey?",
    "options": {
      "A": "45",
      "B": "1,200",
      "C": "3,800",
      "D": "5,000"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 175 trong phần đọc hiểu Part 7.",
    "explanation": "Có 3.800 hành khách tham gia khảo sát."
  },
  {
    "id": 176,
    "part": "Part 7",
    "groupTitle": "Questions 176–180 refer to the following conference program and email.",
    "groupId": "176–180",
    "groupTotal": 5,
    "passage": "GLOBAL RENEWABLE ENERGY SYMPOSIUM\nCopenhagen International Exhibition Center | June 15–16\n\nSchedule of Featured Workshops (June 15):\nRoom A (10:00 A.M.) – Offshore Wind Turbine Engineering (Presenter: Hans Moller)\nRoom B (10:00 A.M.) – Commercial Solar Storage Integration (Presenter: Dr. Priya Sen)\nRoom C (1:30 P.M.) – Hydrogen Fuel Infrastructure (Presenter: Claire Dubois)\nRoom D (3:30 P.M.) – Carbon Capture Policies & Incentives (Presenter: Arthur Hayes)\n\n*Note: Pre-registration is mandatory for Room C due to limited safety demonstration seating.\n\n---\n\nTo: Symposium Registration <info@copenhagen-energy.org>\nFrom: Liam Campbell <lcampbell@scotpower.co.uk>\nDate: June 2\nSubject: Workshop Registration Request\n\nDear Symposium Coordinators,\n\nI have already registered for general admission to the Global Renewable Energy Symposium for both days (Registration ID: #GRE-5082).\n\nI am writing specifically to request a seat in Ms. Claire Dubois' afternoon session on Hydrogen Fuel Infrastructure, as my firm is currently developing a hydrogen fueling hub near Edinburgh. In addition, I will be attending Dr. Priya Sen's morning lecture on commercial solar storage.\n\nCould you please confirm if there is still space available in Room C?\n\nBest regards,\nLiam Campbell\nSenior Project Engineer, ScotPower Ltd.",
    "questionText": "176. Which workshop requires mandatory pre-registration?",
    "options": {
      "A": "Offshore Wind Turbine Engineering",
      "B": "Hydrogen Fuel Infrastructure",
      "C": "Commercial Solar Storage Integration",
      "D": "Carbon Capture Policies & Incentives"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 176 trong phần đọc hiểu Part 7.",
    "explanation": "Hội thảo Hydrogen Fuel Infrastructure tại Room C yêu cầu đăng ký trước."
  },
  {
    "id": 177,
    "part": "Part 7",
    "groupTitle": "Questions 176–180 refer to the following conference program and email.",
    "groupId": "176–180",
    "groupTotal": 5,
    "passage": "GLOBAL RENEWABLE ENERGY SYMPOSIUM\nCopenhagen International Exhibition Center | June 15–16\n\nSchedule of Featured Workshops (June 15):\nRoom A (10:00 A.M.) – Offshore Wind Turbine Engineering (Presenter: Hans Moller)\nRoom B (10:00 A.M.) – Commercial Solar Storage Integration (Presenter: Dr. Priya Sen)\nRoom C (1:30 P.M.) – Hydrogen Fuel Infrastructure (Presenter: Claire Dubois)\nRoom D (3:30 P.M.) – Carbon Capture Policies & Incentives (Presenter: Arthur Hayes)\n\n*Note: Pre-registration is mandatory for Room C due to limited safety demonstration seating.\n\n---\n\nTo: Symposium Registration <info@copenhagen-energy.org>\nFrom: Liam Campbell <lcampbell@scotpower.co.uk>\nDate: June 2\nSubject: Workshop Registration Request\n\nDear Symposium Coordinators,\n\nI have already registered for general admission to the Global Renewable Energy Symposium for both days (Registration ID: #GRE-5082).\n\nI am writing specifically to request a seat in Ms. Claire Dubois' afternoon session on Hydrogen Fuel Infrastructure, as my firm is currently developing a hydrogen fueling hub near Edinburgh. In addition, I will be attending Dr. Priya Sen's morning lecture on commercial solar storage.\n\nCould you please confirm if there is still space available in Room C?\n\nBest regards,\nLiam Campbell\nSenior Project Engineer, ScotPower Ltd.",
    "questionText": "177. Who will deliver the presentation on commercial solar storage?",
    "options": {
      "A": "Hans Moller",
      "B": "Dr. Priya Sen",
      "C": "Claire Dubois",
      "D": "Arthur Hayes"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 177 trong phần đọc hiểu Part 7.",
    "explanation": "Tiến sĩ Priya Sen thuyết trình về pin lưu trữ năng lượng mặt trời."
  },
  {
    "id": 178,
    "part": "Part 7",
    "groupTitle": "Questions 176–180 refer to the following conference program and email.",
    "groupId": "176–180",
    "groupTotal": 5,
    "passage": "GLOBAL RENEWABLE ENERGY SYMPOSIUM\nCopenhagen International Exhibition Center | June 15–16\n\nSchedule of Featured Workshops (June 15):\nRoom A (10:00 A.M.) – Offshore Wind Turbine Engineering (Presenter: Hans Moller)\nRoom B (10:00 A.M.) – Commercial Solar Storage Integration (Presenter: Dr. Priya Sen)\nRoom C (1:30 P.M.) – Hydrogen Fuel Infrastructure (Presenter: Claire Dubois)\nRoom D (3:30 P.M.) – Carbon Capture Policies & Incentives (Presenter: Arthur Hayes)\n\n*Note: Pre-registration is mandatory for Room C due to limited safety demonstration seating.\n\n---\n\nTo: Symposium Registration <info@copenhagen-energy.org>\nFrom: Liam Campbell <lcampbell@scotpower.co.uk>\nDate: June 2\nSubject: Workshop Registration Request\n\nDear Symposium Coordinators,\n\nI have already registered for general admission to the Global Renewable Energy Symposium for both days (Registration ID: #GRE-5082).\n\nI am writing specifically to request a seat in Ms. Claire Dubois' afternoon session on Hydrogen Fuel Infrastructure, as my firm is currently developing a hydrogen fueling hub near Edinburgh. In addition, I will be attending Dr. Priya Sen's morning lecture on commercial solar storage.\n\nCould you please confirm if there is still space available in Room C?\n\nBest regards,\nLiam Campbell\nSenior Project Engineer, ScotPower Ltd.",
    "questionText": "178. What is the purpose of Mr. Campbell's email?",
    "options": {
      "A": "To request a seat in a specific workshop",
      "B": "To cancel his symposium attendance",
      "C": "To apply as a guest speaker",
      "D": "To ask for an exhibition booth refund"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 178 trong phần đọc hiểu Part 7.",
    "explanation": "Xin đăng ký một chỗ ngồi trong hội thảo của cô Claire Dubois."
  },
  {
    "id": 179,
    "part": "Part 7",
    "groupTitle": "Questions 176–180 refer to the following conference program and email.",
    "groupId": "176–180",
    "groupTotal": 5,
    "passage": "GLOBAL RENEWABLE ENERGY SYMPOSIUM\nCopenhagen International Exhibition Center | June 15–16\n\nSchedule of Featured Workshops (June 15):\nRoom A (10:00 A.M.) – Offshore Wind Turbine Engineering (Presenter: Hans Moller)\nRoom B (10:00 A.M.) – Commercial Solar Storage Integration (Presenter: Dr. Priya Sen)\nRoom C (1:30 P.M.) – Hydrogen Fuel Infrastructure (Presenter: Claire Dubois)\nRoom D (3:30 P.M.) – Carbon Capture Policies & Incentives (Presenter: Arthur Hayes)\n\n*Note: Pre-registration is mandatory for Room C due to limited safety demonstration seating.\n\n---\n\nTo: Symposium Registration <info@copenhagen-energy.org>\nFrom: Liam Campbell <lcampbell@scotpower.co.uk>\nDate: June 2\nSubject: Workshop Registration Request\n\nDear Symposium Coordinators,\n\nI have already registered for general admission to the Global Renewable Energy Symposium for both days (Registration ID: #GRE-5082).\n\nI am writing specifically to request a seat in Ms. Claire Dubois' afternoon session on Hydrogen Fuel Infrastructure, as my firm is currently developing a hydrogen fueling hub near Edinburgh. In addition, I will be attending Dr. Priya Sen's morning lecture on commercial solar storage.\n\nCould you please confirm if there is still space available in Room C?\n\nBest regards,\nLiam Campbell\nSenior Project Engineer, ScotPower Ltd.",
    "questionText": "179. In which room will Mr. Campbell attend a session at 10:00 A.M.?",
    "options": {
      "A": "Room A",
      "B": "Room B",
      "C": "Room C",
      "D": "Room D"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 179 trong phần đọc hiểu Part 7.",
    "explanation": "Anh ấy tham dự bài giảng của Dr. Priya Sen lúc 10h sáng ở Room B."
  },
  {
    "id": 180,
    "part": "Part 7",
    "groupTitle": "Questions 176–180 refer to the following conference program and email.",
    "groupId": "176–180",
    "groupTotal": 5,
    "passage": "GLOBAL RENEWABLE ENERGY SYMPOSIUM\nCopenhagen International Exhibition Center | June 15–16\n\nSchedule of Featured Workshops (June 15):\nRoom A (10:00 A.M.) – Offshore Wind Turbine Engineering (Presenter: Hans Moller)\nRoom B (10:00 A.M.) – Commercial Solar Storage Integration (Presenter: Dr. Priya Sen)\nRoom C (1:30 P.M.) – Hydrogen Fuel Infrastructure (Presenter: Claire Dubois)\nRoom D (3:30 P.M.) – Carbon Capture Policies & Incentives (Presenter: Arthur Hayes)\n\n*Note: Pre-registration is mandatory for Room C due to limited safety demonstration seating.\n\n---\n\nTo: Symposium Registration <info@copenhagen-energy.org>\nFrom: Liam Campbell <lcampbell@scotpower.co.uk>\nDate: June 2\nSubject: Workshop Registration Request\n\nDear Symposium Coordinators,\n\nI have already registered for general admission to the Global Renewable Energy Symposium for both days (Registration ID: #GRE-5082).\n\nI am writing specifically to request a seat in Ms. Claire Dubois' afternoon session on Hydrogen Fuel Infrastructure, as my firm is currently developing a hydrogen fueling hub near Edinburgh. In addition, I will be attending Dr. Priya Sen's morning lecture on commercial solar storage.\n\nCould you please confirm if there is still space available in Room C?\n\nBest regards,\nLiam Campbell\nSenior Project Engineer, ScotPower Ltd.",
    "questionText": "180. What is ScotPower Ltd. currently developing near Edinburgh?",
    "options": {
      "A": "A commercial solar panel manufacturing plant",
      "B": "An offshore wind farm substation",
      "C": "A hydrogen fueling infrastructure hub",
      "D": "A hydroelectric power station"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 180 trong phần đọc hiểu Part 7.",
    "explanation": "Công ty đang phát triển một trạm tiếp nhiên liệu hydro gần Edinburgh."
  },
  {
    "id": 181,
    "part": "Part 7",
    "groupTitle": "Questions 181–185 refer to the following proposal and purchase order.",
    "groupId": "181–185",
    "groupTotal": 5,
    "passage": "APEX OFFICE SOLUTIONS – PRICE QUOTATION\nQuote Reference: #Q-77412 | Date: May 10\nClient: Horizon Publishing Corp.\n\nItem 1: Model ErgoMax Mesh Task Chairs (Item #C-400) | Unit Price: $220 | Quantity: 25 | Total: $5,500\nItem 2: Electric Height-Adjustable Standing Desks (Item #D-850) | Unit Price: $450 | Quantity: 20 | Total: $9,000\nItem 3: Under-Desk Mobile Steel Pedestal Drawers (Item #P-120) | Unit Price: $110 | Quantity: 20 | Total: $2,200\n\nSpecial Promotion: Orders exceeding $15,000 qualify for a 10% volume discount on furniture items, plus free threshold delivery within the tri-state area.\nDelivery Estimate: 10 business days from purchase order confirmation.\n\n---\n\nHORIZON PUBLISHING CORP. – OFFICIAL PURCHASE ORDER\nPO Number: #HP-3088 | Date: May 12\nTo: Apex Office Solutions\n\nShipping Address: Horizon Publishing, 450 Madison Ave, Floor 8, New York, NY\nBilling Contact: Accounts Payable <ap@horizonpub.com>\n\nPurchased Items:\n- 25 x ErgoMax Mesh Task Chairs (#C-400) @ $220 = $5,500\n- 20 x Electric Height-Adjustable Desks (#D-850) @ $450 = $9,000\n- 20 x Mobile Pedestal Drawers (#P-120) @ $110 = $2,200\n\nSubtotal: $16,700\nVolume Discount (10%): -$1,670\nDelivery Charges: $0.00 (Promotion Applied)\nTOTAL PAYABLE: $15,030\nAuthorized by: Rachel Simmons, Director of Operations",
    "questionText": "181. What discount threshold was established in the quotation?",
    "options": {
      "A": "Orders over $5,000",
      "B": "Orders over $10,000",
      "C": "Orders over $15,000",
      "D": "Orders over $20,000"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 181 trong phần đọc hiểu Part 7.",
    "explanation": "Đơn hàng trên 15.000 USD được giảm 10%."
  },
  {
    "id": 182,
    "part": "Part 7",
    "groupTitle": "Questions 181–185 refer to the following proposal and purchase order.",
    "groupId": "181–185",
    "groupTotal": 5,
    "passage": "APEX OFFICE SOLUTIONS – PRICE QUOTATION\nQuote Reference: #Q-77412 | Date: May 10\nClient: Horizon Publishing Corp.\n\nItem 1: Model ErgoMax Mesh Task Chairs (Item #C-400) | Unit Price: $220 | Quantity: 25 | Total: $5,500\nItem 2: Electric Height-Adjustable Standing Desks (Item #D-850) | Unit Price: $450 | Quantity: 20 | Total: $9,000\nItem 3: Under-Desk Mobile Steel Pedestal Drawers (Item #P-120) | Unit Price: $110 | Quantity: 20 | Total: $2,200\n\nSpecial Promotion: Orders exceeding $15,000 qualify for a 10% volume discount on furniture items, plus free threshold delivery within the tri-state area.\nDelivery Estimate: 10 business days from purchase order confirmation.\n\n---\n\nHORIZON PUBLISHING CORP. – OFFICIAL PURCHASE ORDER\nPO Number: #HP-3088 | Date: May 12\nTo: Apex Office Solutions\n\nShipping Address: Horizon Publishing, 450 Madison Ave, Floor 8, New York, NY\nBilling Contact: Accounts Payable <ap@horizonpub.com>\n\nPurchased Items:\n- 25 x ErgoMax Mesh Task Chairs (#C-400) @ $220 = $5,500\n- 20 x Electric Height-Adjustable Desks (#D-850) @ $450 = $9,000\n- 20 x Mobile Pedestal Drawers (#P-120) @ $110 = $2,200\n\nSubtotal: $16,700\nVolume Discount (10%): -$1,670\nDelivery Charges: $0.00 (Promotion Applied)\nTOTAL PAYABLE: $15,030\nAuthorized by: Rachel Simmons, Director of Operations",
    "questionText": "182. How many standing desks did Horizon Publishing order?",
    "options": {
      "A": "10",
      "B": "20",
      "C": "25",
      "D": "40"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 182 trong phần đọc hiểu Part 7.",
    "explanation": "Đặt mua 20 bàn đứng điều chỉnh độ cao."
  },
  {
    "id": 183,
    "part": "Part 7",
    "groupTitle": "Questions 181–185 refer to the following proposal and purchase order.",
    "groupId": "181–185",
    "groupTotal": 5,
    "passage": "APEX OFFICE SOLUTIONS – PRICE QUOTATION\nQuote Reference: #Q-77412 | Date: May 10\nClient: Horizon Publishing Corp.\n\nItem 1: Model ErgoMax Mesh Task Chairs (Item #C-400) | Unit Price: $220 | Quantity: 25 | Total: $5,500\nItem 2: Electric Height-Adjustable Standing Desks (Item #D-850) | Unit Price: $450 | Quantity: 20 | Total: $9,000\nItem 3: Under-Desk Mobile Steel Pedestal Drawers (Item #P-120) | Unit Price: $110 | Quantity: 20 | Total: $2,200\n\nSpecial Promotion: Orders exceeding $15,000 qualify for a 10% volume discount on furniture items, plus free threshold delivery within the tri-state area.\nDelivery Estimate: 10 business days from purchase order confirmation.\n\n---\n\nHORIZON PUBLISHING CORP. – OFFICIAL PURCHASE ORDER\nPO Number: #HP-3088 | Date: May 12\nTo: Apex Office Solutions\n\nShipping Address: Horizon Publishing, 450 Madison Ave, Floor 8, New York, NY\nBilling Contact: Accounts Payable <ap@horizonpub.com>\n\nPurchased Items:\n- 25 x ErgoMax Mesh Task Chairs (#C-400) @ $220 = $5,500\n- 20 x Electric Height-Adjustable Desks (#D-850) @ $450 = $9,000\n- 20 x Mobile Pedestal Drawers (#P-120) @ $110 = $2,200\n\nSubtotal: $16,700\nVolume Discount (10%): -$1,670\nDelivery Charges: $0.00 (Promotion Applied)\nTOTAL PAYABLE: $15,030\nAuthorized by: Rachel Simmons, Director of Operations",
    "questionText": "183. Why were delivery charges waived on the purchase order?",
    "options": {
      "A": "The total order value exceeded the promotional threshold.",
      "B": "Horizon Publishing picked up the furniture from the warehouse.",
      "C": "Delivery was delayed past ten business days.",
      "D": "The delivery address was within two blocks."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 183 trong phần đọc hiểu Part 7.",
    "explanation": "Đơn hàng trên 15.000 USD nên được miễn phí vận chuyển theo ưu đãi."
  },
  {
    "id": 184,
    "part": "Part 7",
    "groupTitle": "Questions 181–185 refer to the following proposal and purchase order.",
    "groupId": "181–185",
    "groupTotal": 5,
    "passage": "APEX OFFICE SOLUTIONS – PRICE QUOTATION\nQuote Reference: #Q-77412 | Date: May 10\nClient: Horizon Publishing Corp.\n\nItem 1: Model ErgoMax Mesh Task Chairs (Item #C-400) | Unit Price: $220 | Quantity: 25 | Total: $5,500\nItem 2: Electric Height-Adjustable Standing Desks (Item #D-850) | Unit Price: $450 | Quantity: 20 | Total: $9,000\nItem 3: Under-Desk Mobile Steel Pedestal Drawers (Item #P-120) | Unit Price: $110 | Quantity: 20 | Total: $2,200\n\nSpecial Promotion: Orders exceeding $15,000 qualify for a 10% volume discount on furniture items, plus free threshold delivery within the tri-state area.\nDelivery Estimate: 10 business days from purchase order confirmation.\n\n---\n\nHORIZON PUBLISHING CORP. – OFFICIAL PURCHASE ORDER\nPO Number: #HP-3088 | Date: May 12\nTo: Apex Office Solutions\n\nShipping Address: Horizon Publishing, 450 Madison Ave, Floor 8, New York, NY\nBilling Contact: Accounts Payable <ap@horizonpub.com>\n\nPurchased Items:\n- 25 x ErgoMax Mesh Task Chairs (#C-400) @ $220 = $5,500\n- 20 x Electric Height-Adjustable Desks (#D-850) @ $450 = $9,000\n- 20 x Mobile Pedestal Drawers (#P-120) @ $110 = $2,200\n\nSubtotal: $16,700\nVolume Discount (10%): -$1,670\nDelivery Charges: $0.00 (Promotion Applied)\nTOTAL PAYABLE: $15,030\nAuthorized by: Rachel Simmons, Director of Operations",
    "questionText": "184. What is the final total payable amount?",
    "options": {
      "A": "$16,700",
      "B": "$15,500",
      "C": "$15,030",
      "D": "$14,500"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 184 trong phần đọc hiểu Part 7.",
    "explanation": "Tổng số tiền thanh toán cuối cùng là 15.030 USD."
  },
  {
    "id": 185,
    "part": "Part 7",
    "groupTitle": "Questions 181–185 refer to the following proposal and purchase order.",
    "groupId": "181–185",
    "groupTotal": 5,
    "passage": "APEX OFFICE SOLUTIONS – PRICE QUOTATION\nQuote Reference: #Q-77412 | Date: May 10\nClient: Horizon Publishing Corp.\n\nItem 1: Model ErgoMax Mesh Task Chairs (Item #C-400) | Unit Price: $220 | Quantity: 25 | Total: $5,500\nItem 2: Electric Height-Adjustable Standing Desks (Item #D-850) | Unit Price: $450 | Quantity: 20 | Total: $9,000\nItem 3: Under-Desk Mobile Steel Pedestal Drawers (Item #P-120) | Unit Price: $110 | Quantity: 20 | Total: $2,200\n\nSpecial Promotion: Orders exceeding $15,000 qualify for a 10% volume discount on furniture items, plus free threshold delivery within the tri-state area.\nDelivery Estimate: 10 business days from purchase order confirmation.\n\n---\n\nHORIZON PUBLISHING CORP. – OFFICIAL PURCHASE ORDER\nPO Number: #HP-3088 | Date: May 12\nTo: Apex Office Solutions\n\nShipping Address: Horizon Publishing, 450 Madison Ave, Floor 8, New York, NY\nBilling Contact: Accounts Payable <ap@horizonpub.com>\n\nPurchased Items:\n- 25 x ErgoMax Mesh Task Chairs (#C-400) @ $220 = $5,500\n- 20 x Electric Height-Adjustable Desks (#D-850) @ $450 = $9,000\n- 20 x Mobile Pedestal Drawers (#P-120) @ $110 = $2,200\n\nSubtotal: $16,700\nVolume Discount (10%): -$1,670\nDelivery Charges: $0.00 (Promotion Applied)\nTOTAL PAYABLE: $15,030\nAuthorized by: Rachel Simmons, Director of Operations",
    "questionText": "185. Who authorized the official purchase order?",
    "options": {
      "A": "Kevin Tran",
      "B": "Rachel Simmons",
      "C": "Liam Campbell",
      "D": "Arthur Hayes"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 185 trong phần đọc hiểu Part 7.",
    "explanation": "Được phê duyệt bởi Rachel Simmons, Giám đốc Vận hành."
  },
  {
    "id": 186,
    "part": "Part 7",
    "groupTitle": "Questions 186–190 refer to the following property listing, lease agreement, and email.",
    "groupId": "186–190",
    "groupTotal": 5,
    "passage": "BEACON COMMERCIAL REALTY – AVAILABLE LISTINGS\nProperty Reference: #B-204\nLocation: 120 Franklin Street, Suite 400, Chicago, IL\nSize: 3,200 sq. ft. | Monthly Rent: $6,400 ($2.00/sq. ft.)\nFeatures: 6 private executive offices, open floor layout for 15 workstations, fiber-optic internet connection, kitchen breakroom, 4 reserved underground parking stalls.\n\n---\n\nCOMMERCIAL LEASE SUMMARY (EXCERPT)\nTenant: Apex Logic Software Inc. | Landlord: Franklin Properties LLC\nLeased Premises: 120 Franklin Street, Suite 400\nLease Term: 24 Months (Commencing July 1)\nSecurity Deposit: $12,800 (Equivalent to two months' rent)\nUtilities: Tenant is responsible for electricity and suite janitorial services. Water, heating, and trash disposal are included in base rent.\n\n---\n\nTo: Mark Reynolds <mreynolds@franklinprop.com>\nFrom: Jessica Wu <jwu@apexlogic.com>\nDate: July 15\nSubject: Parking Stall Inquiry & Key Fob Request\n\nDear Mr. Reynolds,\n\nWe successfully moved into Suite 400 two weeks ago and our staff is very pleased with the office space.\n\nI am writing regarding the reserved parking spaces stipulated in our lease agreement. Currently, our security key fobs only permit access for 2 vehicles in the underground garage, but our agreement provides for 4 reserved stalls. Could your facilities management team please issue two additional encoded parking fobs at your earliest convenience?\n\nSincerely,\nJessica Wu, Office Manager, Apex Logic Software Inc.",
    "questionText": "186. How much is the monthly rent for Suite 400?",
    "options": {
      "A": "$3,200",
      "B": "$4,800",
      "C": "$6,400",
      "D": "$12,800"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 186 trong phần đọc hiểu Part 7.",
    "explanation": "Giá thuê hàng tháng là 6.400 USD."
  },
  {
    "id": 187,
    "part": "Part 7",
    "groupTitle": "Questions 186–190 refer to the following property listing, lease agreement, and email.",
    "groupId": "186–190",
    "groupTotal": 5,
    "passage": "BEACON COMMERCIAL REALTY – AVAILABLE LISTINGS\nProperty Reference: #B-204\nLocation: 120 Franklin Street, Suite 400, Chicago, IL\nSize: 3,200 sq. ft. | Monthly Rent: $6,400 ($2.00/sq. ft.)\nFeatures: 6 private executive offices, open floor layout for 15 workstations, fiber-optic internet connection, kitchen breakroom, 4 reserved underground parking stalls.\n\n---\n\nCOMMERCIAL LEASE SUMMARY (EXCERPT)\nTenant: Apex Logic Software Inc. | Landlord: Franklin Properties LLC\nLeased Premises: 120 Franklin Street, Suite 400\nLease Term: 24 Months (Commencing July 1)\nSecurity Deposit: $12,800 (Equivalent to two months' rent)\nUtilities: Tenant is responsible for electricity and suite janitorial services. Water, heating, and trash disposal are included in base rent.\n\n---\n\nTo: Mark Reynolds <mreynolds@franklinprop.com>\nFrom: Jessica Wu <jwu@apexlogic.com>\nDate: July 15\nSubject: Parking Stall Inquiry & Key Fob Request\n\nDear Mr. Reynolds,\n\nWe successfully moved into Suite 400 two weeks ago and our staff is very pleased with the office space.\n\nI am writing regarding the reserved parking spaces stipulated in our lease agreement. Currently, our security key fobs only permit access for 2 vehicles in the underground garage, but our agreement provides for 4 reserved stalls. Could your facilities management team please issue two additional encoded parking fobs at your earliest convenience?\n\nSincerely,\nJessica Wu, Office Manager, Apex Logic Software Inc.",
    "questionText": "187. What utility is included in the base rent?",
    "options": {
      "A": "Electricity",
      "B": "Water",
      "C": "Janitorial cleaning",
      "D": "Fiber-optic internet"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 187 trong phần đọc hiểu Part 7.",
    "explanation": "Tiền nước, sưởi và rác được bao gồm trong giá thuê cơ bản."
  },
  {
    "id": 188,
    "part": "Part 7",
    "groupTitle": "Questions 186–190 refer to the following property listing, lease agreement, and email.",
    "groupId": "186–190",
    "groupTotal": 5,
    "passage": "BEACON COMMERCIAL REALTY – AVAILABLE LISTINGS\nProperty Reference: #B-204\nLocation: 120 Franklin Street, Suite 400, Chicago, IL\nSize: 3,200 sq. ft. | Monthly Rent: $6,400 ($2.00/sq. ft.)\nFeatures: 6 private executive offices, open floor layout for 15 workstations, fiber-optic internet connection, kitchen breakroom, 4 reserved underground parking stalls.\n\n---\n\nCOMMERCIAL LEASE SUMMARY (EXCERPT)\nTenant: Apex Logic Software Inc. | Landlord: Franklin Properties LLC\nLeased Premises: 120 Franklin Street, Suite 400\nLease Term: 24 Months (Commencing July 1)\nSecurity Deposit: $12,800 (Equivalent to two months' rent)\nUtilities: Tenant is responsible for electricity and suite janitorial services. Water, heating, and trash disposal are included in base rent.\n\n---\n\nTo: Mark Reynolds <mreynolds@franklinprop.com>\nFrom: Jessica Wu <jwu@apexlogic.com>\nDate: July 15\nSubject: Parking Stall Inquiry & Key Fob Request\n\nDear Mr. Reynolds,\n\nWe successfully moved into Suite 400 two weeks ago and our staff is very pleased with the office space.\n\nI am writing regarding the reserved parking spaces stipulated in our lease agreement. Currently, our security key fobs only permit access for 2 vehicles in the underground garage, but our agreement provides for 4 reserved stalls. Could your facilities management team please issue two additional encoded parking fobs at your earliest convenience?\n\nSincerely,\nJessica Wu, Office Manager, Apex Logic Software Inc.",
    "questionText": "188. What was the amount paid as a security deposit?",
    "options": {
      "A": "$6,400",
      "B": "$9,600",
      "C": "$12,800",
      "D": "$15,000"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 188 trong phần đọc hiểu Part 7.",
    "explanation": "Tiền đặt cọc bảo đảm là 12.800 USD (bằng 2 tháng tiền thuê)."
  },
  {
    "id": 189,
    "part": "Part 7",
    "groupTitle": "Questions 186–190 refer to the following property listing, lease agreement, and email.",
    "groupId": "186–190",
    "groupTotal": 5,
    "passage": "BEACON COMMERCIAL REALTY – AVAILABLE LISTINGS\nProperty Reference: #B-204\nLocation: 120 Franklin Street, Suite 400, Chicago, IL\nSize: 3,200 sq. ft. | Monthly Rent: $6,400 ($2.00/sq. ft.)\nFeatures: 6 private executive offices, open floor layout for 15 workstations, fiber-optic internet connection, kitchen breakroom, 4 reserved underground parking stalls.\n\n---\n\nCOMMERCIAL LEASE SUMMARY (EXCERPT)\nTenant: Apex Logic Software Inc. | Landlord: Franklin Properties LLC\nLeased Premises: 120 Franklin Street, Suite 400\nLease Term: 24 Months (Commencing July 1)\nSecurity Deposit: $12,800 (Equivalent to two months' rent)\nUtilities: Tenant is responsible for electricity and suite janitorial services. Water, heating, and trash disposal are included in base rent.\n\n---\n\nTo: Mark Reynolds <mreynolds@franklinprop.com>\nFrom: Jessica Wu <jwu@apexlogic.com>\nDate: July 15\nSubject: Parking Stall Inquiry & Key Fob Request\n\nDear Mr. Reynolds,\n\nWe successfully moved into Suite 400 two weeks ago and our staff is very pleased with the office space.\n\nI am writing regarding the reserved parking spaces stipulated in our lease agreement. Currently, our security key fobs only permit access for 2 vehicles in the underground garage, but our agreement provides for 4 reserved stalls. Could your facilities management team please issue two additional encoded parking fobs at your earliest convenience?\n\nSincerely,\nJessica Wu, Office Manager, Apex Logic Software Inc.",
    "questionText": "189. When did Apex Logic Software move into the building?",
    "options": {
      "A": "Around July 1",
      "B": "On May 10",
      "C": "On August 15",
      "D": "In June"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 189 trong phần đọc hiểu Part 7.",
    "explanation": "Hợp đồng bắt đầu từ 1/7 và chuyển vào 2 tuần trước ngày 15/7."
  },
  {
    "id": 190,
    "part": "Part 7",
    "groupTitle": "Questions 186–190 refer to the following property listing, lease agreement, and email.",
    "groupId": "186–190",
    "groupTotal": 5,
    "passage": "BEACON COMMERCIAL REALTY – AVAILABLE LISTINGS\nProperty Reference: #B-204\nLocation: 120 Franklin Street, Suite 400, Chicago, IL\nSize: 3,200 sq. ft. | Monthly Rent: $6,400 ($2.00/sq. ft.)\nFeatures: 6 private executive offices, open floor layout for 15 workstations, fiber-optic internet connection, kitchen breakroom, 4 reserved underground parking stalls.\n\n---\n\nCOMMERCIAL LEASE SUMMARY (EXCERPT)\nTenant: Apex Logic Software Inc. | Landlord: Franklin Properties LLC\nLeased Premises: 120 Franklin Street, Suite 400\nLease Term: 24 Months (Commencing July 1)\nSecurity Deposit: $12,800 (Equivalent to two months' rent)\nUtilities: Tenant is responsible for electricity and suite janitorial services. Water, heating, and trash disposal are included in base rent.\n\n---\n\nTo: Mark Reynolds <mreynolds@franklinprop.com>\nFrom: Jessica Wu <jwu@apexlogic.com>\nDate: July 15\nSubject: Parking Stall Inquiry & Key Fob Request\n\nDear Mr. Reynolds,\n\nWe successfully moved into Suite 400 two weeks ago and our staff is very pleased with the office space.\n\nI am writing regarding the reserved parking spaces stipulated in our lease agreement. Currently, our security key fobs only permit access for 2 vehicles in the underground garage, but our agreement provides for 4 reserved stalls. Could your facilities management team please issue two additional encoded parking fobs at your earliest convenience?\n\nSincerely,\nJessica Wu, Office Manager, Apex Logic Software Inc.",
    "questionText": "190. Why is Ms. Wu contacting Mr. Reynolds?",
    "options": {
      "A": "To request two additional garage access key fobs",
      "B": "To report a broken heating unit in Suite 400",
      "C": "To renegotiate the monthly lease rate",
      "D": "To terminate the rental contract early"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 190 trong phần đọc hiểu Part 7.",
    "explanation": "Yêu cầu cấp thêm 2 thẻ từ đỗ xe tầng hầm còn thiếu."
  },
  {
    "id": 191,
    "part": "Part 7",
    "groupTitle": "Questions 191–195 refer to the following event flyer, registration form, and catering invoice.",
    "groupId": "191–195",
    "groupTotal": 5,
    "passage": "PACIFIC NORTHWEST TECH NETWORK – ANNUAL NETWORKING GALA\nDate: Friday, November 17 | Time: 6:30 P.M. – 10:00 P.M.\nLocation: Portland Maritime Museum, Riverview Pavilion\nTicket Options:\n- Individual Member Ticket: $65\n- Non-Member Ticket: $85\n- Corporate Table (Reserved seating for 8 guests): $480\n\nEnjoy an evening of executive networking, live acoustic jazz, and an exquisite dinner buffet catered by Premier Gourmet Catering.\n\n---\n\nONLINE REGISTRATION CONFIRMATION\nRegistration Date: October 20 | Order #REG-8821\nRegistrant: Daniel Brooks\nCompany: Cascade Software Solutions\nPackage Purchased: Corporate Table (8 Guests) @ $480\nDietary Requests: 2 guests require gluten-free meals; 1 guest requires a vegetarian meal.\nPayment Status: Paid in Full via Corporate Visa ending in 4108\n\n---\n\nPREMIER GOURMET CATERING – EVENT INVOICE\nInvoice #PGC-4091 | Date: November 18\nBilled To: Pacific Northwest Tech Network\nEvent: Annual Gala (November 17) | Location: Portland Maritime Museum\n\nCharges:\n- Standard Gourmet Dinner Buffet (120 attendees @ $45.00): $5,400\n- Special Dietary Custom Entrées (8 gluten-free & vegan @ $50.00): $400\n- Beverage & Bar Service Package (Flat fee): $1,200\n- Service Staff & Setup Charges: $600\nTotal Event Invoiced: $7,600\nPayment Terms: Net 30 Days",
    "questionText": "191. Where was the Annual Networking Gala held?",
    "options": {
      "A": "At the Portland Maritime Museum",
      "B": "In the Grand Waterfront Ballroom",
      "C": "At the Seattle Convention Center",
      "D": "At Cascade Software headquarters"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 191 trong phần đọc hiểu Part 7.",
    "explanation": "Địa điểm tổ chức tại Portland Maritime Museum."
  },
  {
    "id": 192,
    "part": "Part 7",
    "groupTitle": "Questions 191–195 refer to the following event flyer, registration form, and catering invoice.",
    "groupId": "191–195",
    "groupTotal": 5,
    "passage": "PACIFIC NORTHWEST TECH NETWORK – ANNUAL NETWORKING GALA\nDate: Friday, November 17 | Time: 6:30 P.M. – 10:00 P.M.\nLocation: Portland Maritime Museum, Riverview Pavilion\nTicket Options:\n- Individual Member Ticket: $65\n- Non-Member Ticket: $85\n- Corporate Table (Reserved seating for 8 guests): $480\n\nEnjoy an evening of executive networking, live acoustic jazz, and an exquisite dinner buffet catered by Premier Gourmet Catering.\n\n---\n\nONLINE REGISTRATION CONFIRMATION\nRegistration Date: October 20 | Order #REG-8821\nRegistrant: Daniel Brooks\nCompany: Cascade Software Solutions\nPackage Purchased: Corporate Table (8 Guests) @ $480\nDietary Requests: 2 guests require gluten-free meals; 1 guest requires a vegetarian meal.\nPayment Status: Paid in Full via Corporate Visa ending in 4108\n\n---\n\nPREMIER GOURMET CATERING – EVENT INVOICE\nInvoice #PGC-4091 | Date: November 18\nBilled To: Pacific Northwest Tech Network\nEvent: Annual Gala (November 17) | Location: Portland Maritime Museum\n\nCharges:\n- Standard Gourmet Dinner Buffet (120 attendees @ $45.00): $5,400\n- Special Dietary Custom Entrées (8 gluten-free & vegan @ $50.00): $400\n- Beverage & Bar Service Package (Flat fee): $1,200\n- Service Staff & Setup Charges: $600\nTotal Event Invoiced: $7,600\nPayment Terms: Net 30 Days",
    "questionText": "192. Which ticket package did Mr. Brooks purchase?",
    "options": {
      "A": "Individual Member Ticket",
      "B": "Non-Member Ticket",
      "C": "Corporate Table for 8 guests",
      "D": "VIP Sponsor Package"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 192 trong phần đọc hiểu Part 7.",
    "explanation": "Mua gói bàn doanh nghiệp Corporate Table dành cho 8 khách."
  },
  {
    "id": 193,
    "part": "Part 7",
    "groupTitle": "Questions 191–195 refer to the following event flyer, registration form, and catering invoice.",
    "groupId": "191–195",
    "groupTotal": 5,
    "passage": "PACIFIC NORTHWEST TECH NETWORK – ANNUAL NETWORKING GALA\nDate: Friday, November 17 | Time: 6:30 P.M. – 10:00 P.M.\nLocation: Portland Maritime Museum, Riverview Pavilion\nTicket Options:\n- Individual Member Ticket: $65\n- Non-Member Ticket: $85\n- Corporate Table (Reserved seating for 8 guests): $480\n\nEnjoy an evening of executive networking, live acoustic jazz, and an exquisite dinner buffet catered by Premier Gourmet Catering.\n\n---\n\nONLINE REGISTRATION CONFIRMATION\nRegistration Date: October 20 | Order #REG-8821\nRegistrant: Daniel Brooks\nCompany: Cascade Software Solutions\nPackage Purchased: Corporate Table (8 Guests) @ $480\nDietary Requests: 2 guests require gluten-free meals; 1 guest requires a vegetarian meal.\nPayment Status: Paid in Full via Corporate Visa ending in 4108\n\n---\n\nPREMIER GOURMET CATERING – EVENT INVOICE\nInvoice #PGC-4091 | Date: November 18\nBilled To: Pacific Northwest Tech Network\nEvent: Annual Gala (November 17) | Location: Portland Maritime Museum\n\nCharges:\n- Standard Gourmet Dinner Buffet (120 attendees @ $45.00): $5,400\n- Special Dietary Custom Entrées (8 gluten-free & vegan @ $50.00): $400\n- Beverage & Bar Service Package (Flat fee): $1,200\n- Service Staff & Setup Charges: $600\nTotal Event Invoiced: $7,600\nPayment Terms: Net 30 Days",
    "questionText": "193. How much did Mr. Brooks pay for his table?",
    "options": {
      "A": "$65",
      "B": "$85",
      "C": "$480",
      "D": "$600"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 193 trong phần đọc hiểu Part 7.",
    "explanation": "Chi phí gói bàn doanh nghiệp là 480 USD."
  },
  {
    "id": 194,
    "part": "Part 7",
    "groupTitle": "Questions 191–195 refer to the following event flyer, registration form, and catering invoice.",
    "groupId": "191–195",
    "groupTotal": 5,
    "passage": "PACIFIC NORTHWEST TECH NETWORK – ANNUAL NETWORKING GALA\nDate: Friday, November 17 | Time: 6:30 P.M. – 10:00 P.M.\nLocation: Portland Maritime Museum, Riverview Pavilion\nTicket Options:\n- Individual Member Ticket: $65\n- Non-Member Ticket: $85\n- Corporate Table (Reserved seating for 8 guests): $480\n\nEnjoy an evening of executive networking, live acoustic jazz, and an exquisite dinner buffet catered by Premier Gourmet Catering.\n\n---\n\nONLINE REGISTRATION CONFIRMATION\nRegistration Date: October 20 | Order #REG-8821\nRegistrant: Daniel Brooks\nCompany: Cascade Software Solutions\nPackage Purchased: Corporate Table (8 Guests) @ $480\nDietary Requests: 2 guests require gluten-free meals; 1 guest requires a vegetarian meal.\nPayment Status: Paid in Full via Corporate Visa ending in 4108\n\n---\n\nPREMIER GOURMET CATERING – EVENT INVOICE\nInvoice #PGC-4091 | Date: November 18\nBilled To: Pacific Northwest Tech Network\nEvent: Annual Gala (November 17) | Location: Portland Maritime Museum\n\nCharges:\n- Standard Gourmet Dinner Buffet (120 attendees @ $45.00): $5,400\n- Special Dietary Custom Entrées (8 gluten-free & vegan @ $50.00): $400\n- Beverage & Bar Service Package (Flat fee): $1,200\n- Service Staff & Setup Charges: $600\nTotal Event Invoiced: $7,600\nPayment Terms: Net 30 Days",
    "questionText": "194. According to the invoice, how many standard buffet meals were served?",
    "options": {
      "A": "45",
      "B": "80",
      "C": "120",
      "D": "200"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 194 trong phần đọc hiểu Part 7.",
    "explanation": "Phục vụ 120 suất ăn buffet tiêu chuẩn."
  },
  {
    "id": 195,
    "part": "Part 7",
    "groupTitle": "Questions 191–195 refer to the following event flyer, registration form, and catering invoice.",
    "groupId": "191–195",
    "groupTotal": 5,
    "passage": "PACIFIC NORTHWEST TECH NETWORK – ANNUAL NETWORKING GALA\nDate: Friday, November 17 | Time: 6:30 P.M. – 10:00 P.M.\nLocation: Portland Maritime Museum, Riverview Pavilion\nTicket Options:\n- Individual Member Ticket: $65\n- Non-Member Ticket: $85\n- Corporate Table (Reserved seating for 8 guests): $480\n\nEnjoy an evening of executive networking, live acoustic jazz, and an exquisite dinner buffet catered by Premier Gourmet Catering.\n\n---\n\nONLINE REGISTRATION CONFIRMATION\nRegistration Date: October 20 | Order #REG-8821\nRegistrant: Daniel Brooks\nCompany: Cascade Software Solutions\nPackage Purchased: Corporate Table (8 Guests) @ $480\nDietary Requests: 2 guests require gluten-free meals; 1 guest requires a vegetarian meal.\nPayment Status: Paid in Full via Corporate Visa ending in 4108\n\n---\n\nPREMIER GOURMET CATERING – EVENT INVOICE\nInvoice #PGC-4091 | Date: November 18\nBilled To: Pacific Northwest Tech Network\nEvent: Annual Gala (November 17) | Location: Portland Maritime Museum\n\nCharges:\n- Standard Gourmet Dinner Buffet (120 attendees @ $45.00): $5,400\n- Special Dietary Custom Entrées (8 gluten-free & vegan @ $50.00): $400\n- Beverage & Bar Service Package (Flat fee): $1,200\n- Service Staff & Setup Charges: $600\nTotal Event Invoiced: $7,600\nPayment Terms: Net 30 Days",
    "questionText": "195. What special dietary requests did Mr. Brooks' party include?",
    "options": {
      "A": "Gluten-free and vegetarian options",
      "B": "Nut-free and dairy-free options",
      "C": "Halal and low-sodium options",
      "D": "Kosher dinner selections"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 195 trong phần đọc hiểu Part 7.",
    "explanation": "Yêu cầu 2 suất không chứa gluten và 1 suất ăn chay."
  },
  {
    "id": 196,
    "part": "Part 7",
    "groupTitle": "Questions 196–200 refer to the following recall notice, support log, and voucher email.",
    "groupId": "196–200",
    "groupTotal": 5,
    "passage": "VOLUNTARY SAFETY RECALL NOTICE\nIssued by: Aeroflow Home Appliances\nDate: January 10\nProduct: Aeroflow PureAir 300 Dehumidifiers (Serial numbers starting with AF-300-XX)\nHazard: A component in the internal electrical heating coil may overheat in rare instances, creating a potential fire hazard.\n\nRemedy: Consumers should immediately unplug the unit and discontinue use. Visit www.aeroflow-recall.com to register for a free replacement unit or a full cash refund of the $180 purchase price.\n\n---\n\nCUSTOMER SUPPORT INTERACTION LOG\nDate: January 14 | Case #CAS-77309\nCustomer: Amanda Foster | Phone: (555) 019-2834\nProduct: Aeroflow PureAir 300 (Serial #AF-300-8812)\nNotes: Customer called regarding the recall notice. She reported that her dehumidifier has been operating normally without overheating. She elected to receive a free replacement unit rather than a refund. Representative initiated replacement shipment order #REP-9921 and offered a $30 accessory voucher for the inconvenience.\n\n---\n\nTo: Amanda Foster <afoster@brightmail.com>\nFrom: Aeroflow Customer Care <support@aeroflow.com>\nDate: January 15\nSubject: Your Replacement Dehumidifier Order #REP-9921\n\nDear Ms. Foster,\n\nYour replacement unit (Model PureAir 350 Deluxe) has been dispatched via FedEx Express (Tracking #FX-8849-0128). Expected delivery is Friday, January 19.\n\nPlease use the enclosed prepaid return shipping label to send your old AF-300 unit back to our recycling center. As a token of our appreciation for your loyalty, please find below your promotional code for $30 off any air filter replacement on our online store:\n\nPromotional Code: AERO-LOYAL-30 (Expires December 31)\n\nSincerely,\nAeroflow Care Team",
    "questionText": "196. Why was the Aeroflow PureAir 300 recalled?",
    "options": {
      "A": "The heating coil may overheat.",
      "B": "The water tank leaks frequently.",
      "C": "The digital display malfunctions.",
      "D": "The air filter emits an odor."
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 196 trong phần đọc hiểu Part 7.",
    "explanation": "Cuộn sấy điện bên trong có nguy cơ quá nhiệt gây chập cháy."
  },
  {
    "id": 197,
    "part": "Part 7",
    "groupTitle": "Questions 196–200 refer to the following recall notice, support log, and voucher email.",
    "groupId": "196–200",
    "groupTotal": 5,
    "passage": "VOLUNTARY SAFETY RECALL NOTICE\nIssued by: Aeroflow Home Appliances\nDate: January 10\nProduct: Aeroflow PureAir 300 Dehumidifiers (Serial numbers starting with AF-300-XX)\nHazard: A component in the internal electrical heating coil may overheat in rare instances, creating a potential fire hazard.\n\nRemedy: Consumers should immediately unplug the unit and discontinue use. Visit www.aeroflow-recall.com to register for a free replacement unit or a full cash refund of the $180 purchase price.\n\n---\n\nCUSTOMER SUPPORT INTERACTION LOG\nDate: January 14 | Case #CAS-77309\nCustomer: Amanda Foster | Phone: (555) 019-2834\nProduct: Aeroflow PureAir 300 (Serial #AF-300-8812)\nNotes: Customer called regarding the recall notice. She reported that her dehumidifier has been operating normally without overheating. She elected to receive a free replacement unit rather than a refund. Representative initiated replacement shipment order #REP-9921 and offered a $30 accessory voucher for the inconvenience.\n\n---\n\nTo: Amanda Foster <afoster@brightmail.com>\nFrom: Aeroflow Customer Care <support@aeroflow.com>\nDate: January 15\nSubject: Your Replacement Dehumidifier Order #REP-9921\n\nDear Ms. Foster,\n\nYour replacement unit (Model PureAir 350 Deluxe) has been dispatched via FedEx Express (Tracking #FX-8849-0128). Expected delivery is Friday, January 19.\n\nPlease use the enclosed prepaid return shipping label to send your old AF-300 unit back to our recycling center. As a token of our appreciation for your loyalty, please find below your promotional code for $30 off any air filter replacement on our online store:\n\nPromotional Code: AERO-LOYAL-30 (Expires December 31)\n\nSincerely,\nAeroflow Care Team",
    "questionText": "197. What option did Ms. Foster choose in response to the recall?",
    "options": {
      "A": "A free replacement dehumidifier unit",
      "B": "A full cash refund of $180",
      "C": "A free repair kit by mail",
      "D": "An exchange for an air purifier"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 197 trong phần đọc hiểu Part 7.",
    "explanation": "Khách hàng chọn nhận máy mới thay thế miễn phí."
  },
  {
    "id": 198,
    "part": "Part 7",
    "groupTitle": "Questions 196–200 refer to the following recall notice, support log, and voucher email.",
    "groupId": "196–200",
    "groupTotal": 5,
    "passage": "VOLUNTARY SAFETY RECALL NOTICE\nIssued by: Aeroflow Home Appliances\nDate: January 10\nProduct: Aeroflow PureAir 300 Dehumidifiers (Serial numbers starting with AF-300-XX)\nHazard: A component in the internal electrical heating coil may overheat in rare instances, creating a potential fire hazard.\n\nRemedy: Consumers should immediately unplug the unit and discontinue use. Visit www.aeroflow-recall.com to register for a free replacement unit or a full cash refund of the $180 purchase price.\n\n---\n\nCUSTOMER SUPPORT INTERACTION LOG\nDate: January 14 | Case #CAS-77309\nCustomer: Amanda Foster | Phone: (555) 019-2834\nProduct: Aeroflow PureAir 300 (Serial #AF-300-8812)\nNotes: Customer called regarding the recall notice. She reported that her dehumidifier has been operating normally without overheating. She elected to receive a free replacement unit rather than a refund. Representative initiated replacement shipment order #REP-9921 and offered a $30 accessory voucher for the inconvenience.\n\n---\n\nTo: Amanda Foster <afoster@brightmail.com>\nFrom: Aeroflow Customer Care <support@aeroflow.com>\nDate: January 15\nSubject: Your Replacement Dehumidifier Order #REP-9921\n\nDear Ms. Foster,\n\nYour replacement unit (Model PureAir 350 Deluxe) has been dispatched via FedEx Express (Tracking #FX-8849-0128). Expected delivery is Friday, January 19.\n\nPlease use the enclosed prepaid return shipping label to send your old AF-300 unit back to our recycling center. As a token of our appreciation for your loyalty, please find below your promotional code for $30 off any air filter replacement on our online store:\n\nPromotional Code: AERO-LOYAL-30 (Expires December 31)\n\nSincerely,\nAeroflow Care Team",
    "questionText": "198. Which model is being shipped as the replacement?",
    "options": {
      "A": "PureAir 300",
      "B": "PureAir 350 Deluxe",
      "C": "PureAir 500 Max",
      "D": "PureAir Eco"
    },
    "correctAnswer": "B",
    "translation": "Câu hỏi 198 trong phần đọc hiểu Part 7.",
    "explanation": "Mẫu máy thay thế gửi đi là Model PureAir 350 Deluxe."
  },
  {
    "id": 199,
    "part": "Part 7",
    "groupTitle": "Questions 196–200 refer to the following recall notice, support log, and voucher email.",
    "groupId": "196–200",
    "groupTotal": 5,
    "passage": "VOLUNTARY SAFETY RECALL NOTICE\nIssued by: Aeroflow Home Appliances\nDate: January 10\nProduct: Aeroflow PureAir 300 Dehumidifiers (Serial numbers starting with AF-300-XX)\nHazard: A component in the internal electrical heating coil may overheat in rare instances, creating a potential fire hazard.\n\nRemedy: Consumers should immediately unplug the unit and discontinue use. Visit www.aeroflow-recall.com to register for a free replacement unit or a full cash refund of the $180 purchase price.\n\n---\n\nCUSTOMER SUPPORT INTERACTION LOG\nDate: January 14 | Case #CAS-77309\nCustomer: Amanda Foster | Phone: (555) 019-2834\nProduct: Aeroflow PureAir 300 (Serial #AF-300-8812)\nNotes: Customer called regarding the recall notice. She reported that her dehumidifier has been operating normally without overheating. She elected to receive a free replacement unit rather than a refund. Representative initiated replacement shipment order #REP-9921 and offered a $30 accessory voucher for the inconvenience.\n\n---\n\nTo: Amanda Foster <afoster@brightmail.com>\nFrom: Aeroflow Customer Care <support@aeroflow.com>\nDate: January 15\nSubject: Your Replacement Dehumidifier Order #REP-9921\n\nDear Ms. Foster,\n\nYour replacement unit (Model PureAir 350 Deluxe) has been dispatched via FedEx Express (Tracking #FX-8849-0128). Expected delivery is Friday, January 19.\n\nPlease use the enclosed prepaid return shipping label to send your old AF-300 unit back to our recycling center. As a token of our appreciation for your loyalty, please find below your promotional code for $30 off any air filter replacement on our online store:\n\nPromotional Code: AERO-LOYAL-30 (Expires December 31)\n\nSincerely,\nAeroflow Care Team",
    "questionText": "199. When is Ms. Foster's package expected to arrive?",
    "options": {
      "A": "January 10",
      "B": "January 14",
      "C": "January 19",
      "D": "December 31"
    },
    "correctAnswer": "C",
    "translation": "Câu hỏi 199 trong phần đọc hiểu Part 7.",
    "explanation": "Dự kiến giao hàng vào thứ Sáu, ngày 19 tháng 1."
  },
  {
    "id": 200,
    "part": "Part 7",
    "groupTitle": "Questions 196–200 refer to the following recall notice, support log, and voucher email.",
    "groupId": "196–200",
    "groupTotal": 5,
    "passage": "VOLUNTARY SAFETY RECALL NOTICE\nIssued by: Aeroflow Home Appliances\nDate: January 10\nProduct: Aeroflow PureAir 300 Dehumidifiers (Serial numbers starting with AF-300-XX)\nHazard: A component in the internal electrical heating coil may overheat in rare instances, creating a potential fire hazard.\n\nRemedy: Consumers should immediately unplug the unit and discontinue use. Visit www.aeroflow-recall.com to register for a free replacement unit or a full cash refund of the $180 purchase price.\n\n---\n\nCUSTOMER SUPPORT INTERACTION LOG\nDate: January 14 | Case #CAS-77309\nCustomer: Amanda Foster | Phone: (555) 019-2834\nProduct: Aeroflow PureAir 300 (Serial #AF-300-8812)\nNotes: Customer called regarding the recall notice. She reported that her dehumidifier has been operating normally without overheating. She elected to receive a free replacement unit rather than a refund. Representative initiated replacement shipment order #REP-9921 and offered a $30 accessory voucher for the inconvenience.\n\n---\n\nTo: Amanda Foster <afoster@brightmail.com>\nFrom: Aeroflow Customer Care <support@aeroflow.com>\nDate: January 15\nSubject: Your Replacement Dehumidifier Order #REP-9921\n\nDear Ms. Foster,\n\nYour replacement unit (Model PureAir 350 Deluxe) has been dispatched via FedEx Express (Tracking #FX-8849-0128). Expected delivery is Friday, January 19.\n\nPlease use the enclosed prepaid return shipping label to send your old AF-300 unit back to our recycling center. As a token of our appreciation for your loyalty, please find below your promotional code for $30 off any air filter replacement on our online store:\n\nPromotional Code: AERO-LOYAL-30 (Expires December 31)\n\nSincerely,\nAeroflow Care Team",
    "questionText": "200. What promotional benefit was provided in the email?",
    "options": {
      "A": "A $30 coupon for replacement air filters",
      "B": "Free shipping on all future orders for one year",
      "C": "A complimentary five-year extended warranty",
      "D": "An invitation to a focus group"
    },
    "correctAnswer": "A",
    "translation": "Câu hỏi 200 trong phần đọc hiểu Part 7.",
    "explanation": "Mã giảm giá 30 USD cho phụ kiện màng lọc không khí."
  }
];

export const INITIAL_TESTS_VOL1: TestItem[] = [
  {
    id: 1,
    volId: "vol1",
    title: "Test 1",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "reimbursement", ipa: "/ˌriːɪmˈbɜːrsmənt/", pos: "n", meaning: "Khoản hoàn tiền công tác, bồi hoàn chi phí", example: "Submit receipts to claim meal reimbursement." },
      { word: "complimentary", ipa: "/ˌkɑːmplɪˈmentri/", pos: "adj", meaning: "Miễn phí, tặng kèm", example: "Guests receive complimentary shuttle transportation." },
      { word: "delegate", ipa: "/ˈdelɪɡət/", pos: "n/v", meaning: "Đại biểu, người đại diện / Ủy quyền giao việc", example: "The conference welcomed over 300 international delegates." },
      { word: "itinerary", ipa: "/aɪˈtɪnəreri/", pos: "n", meaning: "Lịch trình chi tiết chuyến đi", example: "Check your flight itinerary prior to departure." },
      { word: "substantial", ipa: "/səbˈstænʃl/", pos: "adj", meaning: "Đáng kể, to lớn", example: "The firm saw a substantial increase in quarterly profit." },
    ],
  },
  {
    id: 2,
    volId: "vol1",
    title: "Test 2",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "feasibility", ipa: "/ˌfiːzəˈbɪləti/", pos: "n", meaning: "Tính khả thi của dự án", example: "Engineers conducted a feasibility study on solar power." },
      { word: "mandatory", ipa: "/ˈmændətɔːri/", pos: "adj", meaning: "Bắt buộc, theo quy định", example: "Attendance at the safety orientation is mandatory." },
      { word: "preliminary", ipa: "/prɪˈlɪmɪneri/", pos: "adj", meaning: "Sơ bộ, ban đầu", example: "Preliminary findings show strong market demand." },
      { word: "fluctuate", ipa: "/ˈflʌktʃueɪt/", pos: "v", meaning: "Dao động, biến động thất thường", example: "Currency exchange rates fluctuate constantly." },
    ],
  },
  {
    id: 3,
    volId: "vol1",
    title: "Test 3",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "consensus", ipa: "/kənˈsensəs/", pos: "n", meaning: "Sự đồng thuận chung của tập thể", example: "The committee reached a consensus on the budget." },
      { word: "prospective", ipa: "/prəˈspektɪv/", pos: "adj", meaning: "Tiềm năng, có triển vọng tương lai", example: "We sent catalogs to prospective corporate buyers." },
      { word: "expedite", ipa: "/ˈekspədaɪt/", pos: "v", meaning: "Xúc tiến nhanh, đẩy nhanh tiến độ", example: "Please pay an express fee to expedite shipping." },
    ],
  },
  {
    id: 4,
    volId: "vol1",
    title: "Test 4",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "accommodate", ipa: "/əˈkɑːmədeɪt/", pos: "v", meaning: "Đáp ứng nhu cầu, chứa đủ người", example: "The banquet hall accommodates up to 500 guests." },
      { word: "stipulation", ipa: "/ˌstɪpjuˈleɪʃn/", pos: "n", meaning: "Điều khoản bắt buộc trong hợp đồng", example: "The contract contains a strict warranty stipulation." },
    ],
  },
  {
    id: 5,
    volId: "vol1",
    title: "Test 5",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "adjacent", ipa: "/əˈdʒeɪsnt/", pos: "adj", meaning: "Kế bên, liền kề sát cạnh", example: "The parking lot is adjacent to Terminal 2." },
      { word: "lucrative", ipa: "/ˈluːkrətɪv/", pos: "adj", meaning: "Sinh lời lớn, béo bở", example: "Securing the government contract proved lucrative." },
    ],
  },
  {
    id: 6,
    volId: "vol1",
    title: "Test 6",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "discrepancy", ipa: "/dɪˈskrepənsi/", pos: "n", meaning: "Sự sai lệch, không khớp số liệu", example: "Auditors noted a discrepancy in travel invoices." },
      { word: "facilitate", ipa: "/fəˈsɪlɪteɪt/", pos: "v", meaning: "Tạo điều kiện thuận lợi, hỗ trợ", example: "Modern tools facilitate seamless communication." },
    ],
  },
  {
    id: 7,
    volId: "vol1",
    title: "Test 7",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "contingency", ipa: "/kənˈtɪndʒənsi/", pos: "n", meaning: "Phương án dự phòng rủi ro", example: "Establish a contingency plan in case of shipment delays." },
      { word: "rigorous", ipa: "/ˈrɪɡərəs/", pos: "adj", meaning: "Nghiêm ngặt, khắt khe", example: "The candidate passed rigorous technical evaluations." },
    ],
  },
  {
    id: 8,
    volId: "vol1",
    title: "Test 8",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "tenative", ipa: "/ˈtentətɪv/", pos: "adj", meaning: "Dự kiến, tạm thời chưa chốt", example: "We set a tentative project launch date for May 15." },
      { word: "unprecedented", ipa: "/ʌnˈpresɪdentɪd/", pos: "adj", meaning: "Chưa từng có tiền lệ", example: "The product release enjoyed unprecedented demand." },
    ],
  },
  {
    id: 9,
    volId: "vol1",
    title: "Test 9",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "apparel", ipa: "/əˈpærəl/", pos: "n", meaning: "Trang phục, quần áo thương mại", example: "The boutique imports designer apparel from Milan." },
      { word: "endorse", ipa: "/ɪnˈdɔːrs/", pos: "v", meaning: "Tán thành, ủng hộ, quảng bá", example: "Celebrity athletes officially endorse the sportswear line." },
    ],
  },
  {
    id: 10,
    volId: "vol1",
    title: "Test 10",
    difficulty: "Khó",
    score: null,
    listeningScore: null,
    readingScore: null,
    status: "Chưa luyện tập",
    completedAt: null,
    historyAttempts: [],
    keyVocab: [
      { word: "lucrative", ipa: "/ˈluːkrətɪv/", pos: "adj", meaning: "Sinh lợi cao, mang lại nhiều tiền", example: "A lucrative sponsorship contract was signed." },
      { word: "reputable", ipa: "/ˈrepjətəbl/", pos: "adj", meaning: "Có uy tín lớn, đáng tin cậy", example: "Always source spare parts from reputable suppliers." },
    ],
  },
];

export const INITIAL_TESTS_VOL2: TestItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  volId: "vol2",
  title: `Test ${i + 1}`,
  difficulty: "Khó",
  score: null,
  listeningScore: null,
  readingScore: null,
  status: "Chưa luyện tập",
  completedAt: null,
  historyAttempts: [],
  keyVocab: [
    { word: "solicit", ipa: "/səˈlɪsɪt/", pos: "v", meaning: "Kêu gọi, khẩn khoản xin ý kiến đóng góp", example: "We solicit feedback from all attendees." },
    { word: "subsidiary", ipa: "/səbˈsɪdieri/", pos: "n", meaning: "Công ty con trực thuộc tập đoàn", example: "The Tokyo branch is our newest subsidiary." },
  ],
}));
