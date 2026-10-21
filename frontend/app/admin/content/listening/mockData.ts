import { DictationQuestion, DictationCardData, LevelCategoryCardData } from "./types";
import {
  ETS_2024_PART1_QUESTIONS,
  ETS_2024_DICTATION_CARDS,
  ETS_2024_PART1_LEVELS,
} from "./ets2024Part1Data";
import {
  ETS_2024_PART2_QUESTIONS,
  ETS_2024_PART2_LEVELS,
  ETS_2024_PART2_CATEGORIES,
  ETS_2024_PART2_DICTATION_CARDS,
} from "./ets2024Part2Data";
import {
  ETS_2024_PART3_QUESTIONS,
  ETS_2024_PART3_LEVELS,
  ETS_2024_PART3_CATEGORIES,
  ETS_2024_PART3_DICTATION_CARDS,
} from "./ets2024Part3Data";
import {
  ETS_2024_PART4_QUESTIONS,
  ETS_2024_PART4_LEVELS,
  ETS_2024_PART4_CATEGORIES,
  ETS_2024_PART4_DICTATION_CARDS,
} from "./ets2024Part4Data";

export const SAMPLE_DICTATION_QUESTIONS: DictationQuestion[] = [
  {
    "id": 1,
    "part": "Part 1",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q1.mp3",
    "imageUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q1.jpg",
    "fullTranscript": "She's eating in a picnic area.",
    "vietnameseTranslation": "Cô ấy đang ăn ở một khu dã ngoại.",
    "options": {
      "A": "She's eating in a picnic area.",
      "B": "She's waiting in line at a food truck.",
      "C": "She's wiping off a bench.",
      "D": "She's throwing away a plate."
    },
    "optionTranslations": {
      "A": "Cô ấy đang ăn ở một khu dã ngoại.",
      "B": "Cô ấy đang xếp hàng chờ ở xe bán đồ ăn.",
      "C": "Cô ấy đang lau ghế.",
      "D": "Cô ấy đang ném đi một cái đĩa."
    },
    "correctAnswer": "A",
    "explanation": "Người phụ nữ đang ngồi ăn đồ ăn tại bàn đá dã ngoại ngoài trời.",
    "trapNote": "Bẫy danh từ liên quan: Nhắc đến thức ăn dễ nghĩ tới 'food truck' (xe bán thức ăn) hoặc 'throwing away' (vứt rác) nhưng tranh không có.",
    "vocabList": [
      {
        "word": "picnic area",
        "pos": "n",
        "level": "A2",
        "ipa": "/ˈpɪknɪk ˈeəriə/",
        "meaning": "khu dã ngoại"
      },
      {
        "word": "wipe off",
        "pos": "v",
        "level": "B1",
        "ipa": "/waɪp ɔːf/",
        "meaning": "lau chùi sạch"
      },
      {
        "word": "bench",
        "pos": "n",
        "level": "A2",
        "ipa": "/bentʃ/",
        "meaning": "băng ghế dài"
      }
    ]
  },
  {
    "id": 2,
    "part": "Part 1",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q2.mp3",
    "imageUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q2.jpg",
    "fullTranscript": "The man is standing in the snow beside a car.",
    "vietnameseTranslation": "Người đàn ông đang đứng trong tuyết bên cạnh một chiếc ô tô.",
    "options": {
      "A": "The man is brushing snow off the roof of a car.",
      "B": "The man is standing in the snow beside a car.",
      "C": "The man is shoveling a driveway.",
      "D": "The man is putting on a winter coat."
    },
    "optionTranslations": {
      "A": "Người đàn ông đang phủi tuyết khỏi nóc ô tô.",
      "B": "Người đàn ông đang đứng trong tuyết bên cạnh một chiếc ô tô.",
      "C": "Người đàn ông đang xúc tuyết trên đường lái xe vào nhà.",
      "D": "Người đàn ông đang mặc áo khoác mùa đông."
    },
    "correctAnswer": "B",
    "explanation": "Người đàn ông đang đứng cạnh xe, tay nắm cửa, xung quanh và trên xe phủ tuyết.",
    "trapNote": "Bẫy hành động chưa xảy ra: Không cầm xẻng xúc tuyết (shoveling) hay quét tuyết nóc xe.",
    "vocabList": [
      {
        "word": "brush off",
        "pos": "v",
        "level": "B1",
        "ipa": "/brʌʃ ɔːf/",
        "meaning": "phủi đi, quét sạch"
      },
      {
        "word": "shovel",
        "pos": "v",
        "level": "B2",
        "ipa": "/ˈʃʌvl/",
        "meaning": "xúc tuyết"
      },
      {
        "word": "driveway",
        "pos": "n",
        "level": "B1",
        "ipa": "/ˈdraɪvweɪ/",
        "meaning": "lối đi cho xe"
      }
    ]
  },
  {
    "id": 3,
    "part": "Part 2",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q7.mp3",
    "question": "How old is this building?",
    "fullTranscript": "How old is this building? (A) To ship some materials. (B) About 10 years old. (C) Company offices I think.",
    "vietnameseTranslation": "Tòa nhà này bao nhiêu tuổi? (A) Để vận chuyển một số vật liệu. (B) Khoảng 10 tuổi. (C) Tôi nghĩ là văn phòng công ty.",
    "options": {
      "A": "To ship some materials.",
      "B": "About 10 years old.",
      "C": "Company offices I think."
    },
    "optionTranslations": {
      "A": "Để vận chuyển một số vật liệu.",
      "B": "Khoảng 10 tuổi.",
      "C": "Tôi nghĩ là văn phòng công ty."
    },
    "correctAnswer": "B",
    "explanation": "Câu hỏi lý do hoặc cách thức (How). Phương án (B) 'About 10 years old.' giải thích nguyên nhân hoặc hướng xử lý phù hợp.",
    "trapNote": "Bẫy từ vựng cùng trường nghĩa nhưng trả lời lạc đề câu hỏi.",
    "vocabList": [
      {
        "word": "schedule",
        "pos": "v",
        "level": "B1",
        "ipa": "/ˈʃedjuːl/",
        "meaning": "lên lịch, sắp xếp"
      },
      {
        "word": "confirm",
        "pos": "v",
        "level": "B1",
        "ipa": "/kənˈfɜːm/",
        "meaning": "xác nhận"
      }
    ]
  },
  {
    "id": 4,
    "part": "Part 2",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q8.mp3",
    "question": "Can you come to my jazz performance tonight?",
    "fullTranscript": "Can you come to my jazz performance tonight? (A) I'm sorry I was late for the meeting. (B) Mostly just local musicians. (C) Sure I'll be there.",
    "vietnameseTranslation": "Bạn có thể đến buổi biểu diễn nhạc jazz của tôi tối nay được không? (A) Tôi xin lỗi vì đã đến trễ cuộc họp. (B) Chủ yếu chỉ là nhạc sĩ địa phương. (C) Chắc chắn tôi sẽ ở đó.",
    "options": {
      "A": "I'm sorry I was late for the meeting.",
      "B": "Mostly just local musicians.",
      "C": "Sure I'll be there."
    },
    "optionTranslations": {
      "A": "Tôi xin lỗi vì đã đến muộn cuộc họp.",
      "B": "Chủ yếu chỉ là nhạc sĩ địa phương.",
      "C": "Chắc chắn tôi sẽ ở đó."
    },
    "correctAnswer": "C",
    "explanation": "Câu hỏi nghi vấn trợ động từ. Phương án (C) 'Sure I'll be there.' đưa ra phản hồi đồng ý, từ chối hoặc xác nhận thông tin chuẩn xác.",
    "trapNote": "Bẫy lệch thì hoặc bẫy nhầm đại từ nhân xưng (he/she/they).",
    "vocabList": [
      {
        "word": "schedule",
        "pos": "v",
        "level": "B1",
        "ipa": "/ˈʃedjuːl/",
        "meaning": "lên lịch, sắp xếp"
      },
      {
        "word": "confirm",
        "pos": "v",
        "level": "B1",
        "ipa": "/kənˈfɜːm/",
        "meaning": "xác nhận"
      }
    ]
  },
  {
    "id": 5,
    "part": "Part 3",
    "question": "What eventdoesthe womanmention?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q32_34.mp3",
    "fullTranscript": "Thank you so much for organizing the annual company picnic jingle everybody seemed to enjoy it well we deserved it after working so hard this year I agree the food was great by the way especially the peach pie you made would you mind sharing the recipe it was delicious I found the recipe online I'll send you a link to the webpage there's a really helpful video that walks you through all the steps I recommend you watch it first all right thanks",
    "vietnameseTranslation": "Cảm ơn bạn rất nhiều vì đã tổ chức buổi dã ngoại công ty hàng năm, mọi người dường như rất thích nó, chúng tôi xứng đáng được như vậy sau khi đã làm việc rất chăm chỉ trong năm nay. Tôi đồng ý rằng đồ ăn rất tuyệt, đặc biệt là món bánh đào bạn làm, bạn có phiền khi chia sẻ công thức nó rất ngon. Tôi đã tìm thấy công thức trên mạng. Tôi sẽ gửi cho bạn một liên kết đến trang web, có một video thực sự hữu ích hướng dẫn bạn qua tất cả các bước. Tôi khuyên bạn nên xem nó trước, cảm ơn.",
    "options": {
      "A": "Ajobfair",
      "B": "A cooking class",
      "C": "A fund-raiser",
      "D": "A company picnic"
    },
    "optionTranslations": {
      "A": "hội chợ việc làm",
      "B": "Lớp học nấu ăn",
      "C": "Người gây quỹ",
      "D": "Một chuyến dã ngoại của công ty"
    },
    "correctAnswer": "D",
    "explanation": "Từ nội dung đối thoại, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (D) 'A company picnic' (Chuyến dã ngoại của công ty).",
    "vocabList": [
      {
        "word": "recommend",
        "pos": "v",
        "level": "B1",
        "ipa": "/ˌrekəˈmend/",
        "meaning": "khuyên, đề xuất"
      }
    ]
  },
  {
    "id": 6,
    "part": "Part 3",
    "question": "Whatdoes the womanask for?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q32_34.mp3",
    "fullTranscript": "Thank you so much for organizing the annual company picnic jingle everybody seemed to enjoy it well we deserved it after working so hard this year I agree the food was great by the way especially the peach pie you made would you mind sharing the recipe it was delicious I found the recipe online I'll send you a link to the webpage there's a really helpful video that walks you through all the steps I recommend you watch it first all right thanks",
    "vietnameseTranslation": "Cảm ơn bạn rất nhiều vì đã tổ chức buổi dã ngoại công ty hàng năm, mọi người dường như rất thích nó, chúng tôi xứng đáng được như vậy sau khi đã làm việc rất chăm chỉ trong năm nay. Tôi đồng ý rằng đồ ăn rất tuyệt, đặc biệt là món bánh đào bạn làm, bạn có phiền khi chia sẻ công thức nó rất ngon. Tôi đã tìm thấy công thức trên mạng. Tôi sẽ gửi cho bạn một liên kết đến trang web, có một video thực sự hữu ích hướng dẫn bạn qua tất cả các bước. Tôi khuyên bạn nên xem nó trước, cảm ơn.",
    "options": {
      "A": "Aguest list",
      "B": "A dessert recipe",
      "C": "A business card",
      "D": "A promotional code"
    },
    "optionTranslations": {
      "A": "Danh sách khách mời",
      "B": "Một công thức món tráng miệng",
      "C": "Một danh thiếp",
      "D": "Mã khuyến mại"
    },
    "correctAnswer": "B",
    "explanation": "Từ nội dung đối thoại, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (B) 'A dessert recipe' (Một công thức món tráng miệng).",
    "vocabList": [
      {
        "word": "recommend",
        "pos": "v",
        "level": "B1",
        "ipa": "/ˌrekəˈmend/",
        "meaning": "khuyên, đề xuất"
      }
    ]
  },
  {
    "id": 7,
    "part": "Part 3",
    "question": "Whatdoes the manrecommend doing?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q32_34.mp3",
    "fullTranscript": "Thank you so much for organizing the annual company picnic jingle everybody seemed to enjoy it well we deserved it after working so hard this year I agree the food was great by the way especially the peach pie you made would you mind sharing the recipe it was delicious I found the recipe online I'll send you a link to the webpage there's a really helpful video that walks you through all the steps I recommend you watch it first all right thanks",
    "vietnameseTranslation": "Cảm ơn bạn rất nhiều vì đã tổ chức buổi dã ngoại công ty hàng năm, mọi người dường như rất thích nó, chúng tôi xứng đáng được như vậy sau khi đã làm việc rất chăm chỉ trong năm nay. Tôi đồng ý rằng đồ ăn rất tuyệt, đặc biệt là món bánh đào bạn làm, bạn có phiền khi chia sẻ công thức nó rất ngon. Tôi đã tìm thấy công thức trên mạng. Tôi sẽ gửi cho bạn một liên kết đến trang web, có một video thực sự hữu ích hướng dẫn bạn qua tất cả các bước. Tôi khuyên bạn nên xem nó trước, cảm ơn.",
    "options": {
      "A": "Returning some merchandise",
      "B": "Watching a video",
      "C": "Creating an account",
      "D": "Reading a review"
    },
    "optionTranslations": {
      "A": "Trả lại một số hàng hóa",
      "B": "Đang xem video",
      "C": "Tạo tài khoản",
      "D": "Đọc đánh giá"
    },
    "correctAnswer": "B",
    "explanation": "Từ nội dung đối thoại, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (B) 'Watching a video' (Xem video).",
    "vocabList": [
      {
        "word": "recommend",
        "pos": "v",
        "level": "B1",
        "ipa": "/ˌrekəˈmend/",
        "meaning": "khuyên, đề xuất"
      },
      {
        "word": "merchandise",
        "pos": "n",
        "level": "B2",
        "ipa": "/ˈmɜːrtʃəndaɪs/",
        "meaning": "hàng hóa thương mại"
      }
    ]
  },
  {
    "id": 8,
    "part": "Part 4",
    "question": "Whohas recordedthemessage?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q71_73.mp3",
    "fullTranscript": "You have reached the information line for the cranberry Apartments management office on Monday April 12th maintenance work will begin to repay the entire parking area adjacent to our buildings main entrance all cranberry residents should move buildings main entrance all cranberry residents should move their vehicles from their designated parking spots before 8:00 a.m. on Monday any Vehicles still in its spot after 8:00 a.m. will be towed at the owner's expense a map of alternate parking sites was mailed to residents last week and is also posted in the building Lobby",
    "vietnameseTranslation": "Bạn đã đến đường dây thông tin của văn phòng quản lý Căn hộ cranberry vào Thứ Hai, ngày 12 tháng 4, công việc bảo trì sẽ bắt đầu hoàn trả toàn bộ khu vực đậu xe gần lối vào chính của tòa nhà của chúng tôi. Tất cả cư dân cranberry nên di chuyển lối vào chính của tòa nhà. Tất cả cư dân cranberry nên di chuyển phương tiện của mình khỏi điểm đậu xe được chỉ định trước 8 giờ sáng Thứ Hai. Bất kỳ phương tiện nào vẫn ở vị trí đó sau 8 giờ sáng sẽ được kéo bằng chi phí của chủ sở hữu. Bản đồ các địa điểm đỗ xe thay thế đã được gửi cho cư dân vào tuần trước và cũng sẽ được đăng tại sảnh tòa nhà",
    "options": {
      "A": "Acitymayor'soffice",
      "B": "Amaintenance department",
      "C": "An automobile dealership",
      "D": "A building management office"
    },
    "optionTranslations": {
      "A": "Văn phòng của thị trưởng thành phố",
      "B": "Bộ phận bảo trì",
      "C": "Một đại lý ô tô",
      "D": "Văn phòng quản lý tòa nhà"
    },
    "correctAnswer": "D",
    "explanation": "Từ nội dung bài nói, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (D) 'A building management office' (Một văn phòng quản lý tòa nhà).",
    "vocabList": [
      {
        "word": "maintenance",
        "pos": "n",
        "level": "B2",
        "ipa": "/ˈmeɪntənəns/",
        "meaning": "sự bảo trì, bảo dưỡng"
      }
    ]
  },
  {
    "id": 9,
    "part": "Part 4",
    "question": "What are the listeners asked to do?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q71_73.mp3",
    "fullTranscript": "You have reached the information line for the cranberry Apartments management office on Monday April 12th maintenance work will begin to repay the entire parking area adjacent to our buildings main entrance all cranberry residents should move buildings main entrance all cranberry residents should move their vehicles from their designated parking spots before 8:00 a.m. on Monday any Vehicles still in its spot after 8:00 a.m. will be towed at the owner's expense a map of alternate parking sites was mailed to residents last week and is also posted in the building Lobby",
    "vietnameseTranslation": "Bạn đã đến đường dây thông tin của văn phòng quản lý Căn hộ cranberry vào Thứ Hai, ngày 12 tháng 4, công việc bảo trì sẽ bắt đầu hoàn trả toàn bộ khu vực đậu xe gần lối vào chính của tòa nhà của chúng tôi. Tất cả cư dân cranberry nên di chuyển lối vào chính của tòa nhà. Tất cả cư dân cranberry nên di chuyển phương tiện của mình khỏi điểm đậu xe được chỉ định trước 8 giờ sáng Thứ Hai. Bất kỳ phương tiện nào vẫn ở vị trí đó sau 8 giờ sáng sẽ được kéo bằng chi phí của chủ sở hữu. Bản đồ các địa điểm đỗ xe thay thế đã được gửi cho cư dân vào tuần trước và cũng sẽ được đăng tại sảnh tòa nhà",
    "options": {
      "A": "Move their vehicies",
      "B": "Pay their parking fines",
      "C": "Use an alternate entrance",
      "D": "Participate in a meeting"
    },
    "optionTranslations": {
      "A": "Di chuyển phương tiện của họ",
      "B": "Trả tiền phạt đỗ xe",
      "C": "Sử dụng một lối vào thay thế",
      "D": "Tham gia cuộc họp"
    },
    "correctAnswer": "A",
    "explanation": "Từ nội dung bài nói, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (A) 'Move their vehicies' (Di chuyển phương tiện của họ).",
    "vocabList": [
      {
        "word": "maintenance",
        "pos": "n",
        "level": "B2",
        "ipa": "/ˈmeɪntənəns/",
        "meaning": "sự bảo trì, bảo dưỡng"
      }
    ]
  },
  {
    "id": 10,
    "part": "Part 4",
    "question": "What does the speaker say was mailed last week?",
    "audioUrl": "/api/media/ETS 2024/Audio_Cat_Tung_Cau/Test_01/q71_73.mp3",
    "fullTranscript": "You have reached the information line for the cranberry Apartments management office on Monday April 12th maintenance work will begin to repay the entire parking area adjacent to our buildings main entrance all cranberry residents should move buildings main entrance all cranberry residents should move their vehicles from their designated parking spots before 8:00 a.m. on Monday any Vehicles still in its spot after 8:00 a.m. will be towed at the owner's expense a map of alternate parking sites was mailed to residents last week and is also posted in the building Lobby",
    "vietnameseTranslation": "Bạn đã đến đường dây thông tin của văn phòng quản lý Căn hộ cranberry vào Thứ Hai, ngày 12 tháng 4, công việc bảo trì sẽ bắt đầu hoàn trả toàn bộ khu vực đậu xe gần lối vào chính của tòa nhà của chúng tôi. Tất cả cư dân cranberry nên di chuyển lối vào chính của tòa nhà. Tất cả cư dân cranberry nên di chuyển phương tiện của mình khỏi điểm đậu xe được chỉ định trước 8 giờ sáng Thứ Hai. Bất kỳ phương tiện nào vẫn ở vị trí đó sau 8 giờ sáng sẽ được kéo bằng chi phí của chủ sở hữu. Bản đồ các địa điểm đỗ xe thay thế đã được gửi cho cư dân vào tuần trước và cũng sẽ được đăng tại sảnh tòa nhà",
    "options": {
      "A": "Anelectionballot",
      "B": "A maintenance plan",
      "C": "A map",
      "D": "A coupon"
    },
    "optionTranslations": {
      "A": "Một lá phiếu bầu cử",
      "B": "Kế hoạch bảo trì",
      "C": "Một bản đồ",
      "D": "Một phiếu giảm giá"
    },
    "correctAnswer": "C",
    "explanation": "Từ nội dung bài nói, người nói đề cập trực tiếp đến thông tin liên quan đến phương án (C) 'A map' (Một bản đồ).",
    "vocabList": [
      {
        "word": "maintenance",
        "pos": "n",
        "level": "B2",
        "ipa": "/ˈmeɪntənəns/",
        "meaning": "sự bảo trì, bảo dưỡng"
      }
    ]
  }
];

// --- ETS 2023 DICTATION CARDS (9 TESTS x 4 PARTS = 36 CARDS) ---
export const ETS_2023_DICTATION_CARDS: DictationCardData[] = [];
for (let t = 1; t <= 9; t++) {
  const tPad = String(t).padStart(2, "0");
  const parts = [
    { part: "Part 1" as const, total: 6, qIdxs: [0, 1], audio: `/api/media/ETS 2023/Audio_Cat_Tung_Cau/Test_${tPad}/q1.mp3` },
    { part: "Part 2" as const, total: 25, qIdxs: [2, 3], audio: `/api/media/ETS 2023/Audio_Cat_Tung_Cau/Test_${tPad}/q7.mp3` },
    { part: "Part 3" as const, total: 39, qIdxs: [4, 5, 6], audio: `/api/media/ETS 2023/Audio_Cat_Tung_Cau/Test_${tPad}/q32_34.mp3` },
    { part: "Part 4" as const, total: 30, qIdxs: [7, 8, 9], audio: `/api/media/ETS 2023/Audio_Cat_Tung_Cau/Test_${tPad}/q71_73.mp3` },
  ];
  for (const p of parts) {
    ETS_2023_DICTATION_CARDS.push({
      id: `ets2023-t${t}-p${p.part.replace("Part ", "")}`,
      testNumber: t,
      part: p.part,
      year: "2023",
      totalQuestions: p.total,
      completedQuestions: 0,
      status: "Chưa bắt đầu",
      notesCount: 0,
      vocabItems: [
        { word: "agenda", ipa: "/əˈdʒendə/", meaning: "Chương trình nghị sự buổi họp", example: "Review the agenda beforehand." },
        { word: "delegate", ipa: "/ˈdelɪɡət/", meaning: "Đại biểu tham dự", example: "Welcoming 500 delegates." },
      ],
      questions: p.qIdxs.map((idx) => {
        const base = SAMPLE_DICTATION_QUESTIONS[idx] || SAMPLE_DICTATION_QUESTIONS[0];
        return {
          ...base,
          audioUrl: p.audio,
        };
      }),
    });
  }
}

// --- ETS 2022 DICTATION CARDS (10 TESTS x 4 PARTS = 40 CARDS) ---
export const ETS_2022_DICTATION_CARDS: DictationCardData[] = [];
for (let t = 1; t <= 10; t++) {
  const tPad = String(t).padStart(2, "0");
  const parts = [
    { part: "Part 1" as const, total: 6, qIdxs: [0, 1], audio: `/api/media/ETS 2022/Audio_Cat_Tung_Cau/Test_${tPad}/q1.mp3`, image: `/api/media/ETS 2022/Audio_Cat_Tung_Cau/Test_${tPad}/q1.jpg` },
    { part: "Part 2" as const, total: 25, qIdxs: [2, 3], audio: `/api/media/ETS 2022/Audio_Cat_Tung_Cau/Test_${tPad}/q7.mp3` },
    { part: "Part 3" as const, total: 39, qIdxs: [4, 5, 6], audio: `/api/media/ETS 2022/Audio_Cat_Tung_Cau/Test_${tPad}/q32_34.mp3` },
    { part: "Part 4" as const, total: 30, qIdxs: [7, 8, 9], audio: `/api/media/ETS 2022/Audio_Cat_Tung_Cau/Test_${tPad}/q71_73.mp3` },
  ];
  for (const p of parts) {
    ETS_2022_DICTATION_CARDS.push({
      id: `ets2022-t${t}-p${p.part.replace("Part ", "")}`,
      testNumber: t,
      part: p.part,
      year: "2022",
      totalQuestions: p.total,
      completedQuestions: 0,
      status: "Chưa bắt đầu",
      notesCount: 0,
      vocabItems: [
        { word: "reimbursement", ipa: "/ˌriːɪmˈbɜːrsmənt/", meaning: "Khoản hoàn tiền công tác phí", example: "Submit receipts for reimbursement." },
        { word: "itinerary", ipa: "/aɪˈtɪnəreri/", meaning: "Lịch trình công tác chi tiết", example: "Check your flight itinerary." },
      ],
      questions: p.qIdxs.map((idx) => {
        const base = SAMPLE_DICTATION_QUESTIONS[idx] || SAMPLE_DICTATION_QUESTIONS[0];
        return {
          ...base,
          audioUrl: p.audio,
          imageUrl: p.image || base.imageUrl,
        };
      }),
    });
  }
}

export const INITIAL_DICTATION_CARDS: DictationCardData[] = [
  ...ETS_2024_DICTATION_CARDS,
  ...ETS_2024_PART2_DICTATION_CARDS,
  ...ETS_2024_PART3_DICTATION_CARDS,
  ...ETS_2024_PART4_DICTATION_CARDS,
  ...ETS_2023_DICTATION_CARDS,
  ...ETS_2022_DICTATION_CARDS,
];

export const INITIAL_PART1_LEVELS: LevelCategoryCardData[] = ETS_2024_PART1_LEVELS;

export const INITIAL_PART1_CATEGORIES: LevelCategoryCardData[] = [
  {
    id: "p1-c1",
    part: "Part 1",
    type: "category",
    title: "Tranh một người",
    totalQuestions: 20,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tập trung tuyệt đối vào người trong ảnh: tay đang làm gì, mắt nhìn đâu, trang phục đang mặc (wearing vs putting on).",
    rules: ["Phân biệt 'wearing' (đang mặc trên người) và 'putting on' (đang xỏ tay vào mặc).", "Tập trung hành động cơ bản: holding, standing, inspecting, eating."],
    vocabBag: [{ word: "holding", ipa: "/ˈhoʊldɪŋ/", meaning: "Đang cầm, nắm đồ vật" }],
    questions: ETS_2024_PART1_QUESTIONS.filter(q => [101, 102, 201, 202, 204, 301, 401, 402, 501, 502, 601, 602, 701, 702, 801, 802, 901, 902, 1001, 1002].includes(q.id)),
  },
  {
    id: "p1-c2",
    part: "Part 1",
    type: "category",
    title: "Tranh nhiều người",
    totalQuestions: 15,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Tìm điểm chung của đám đông hoặc sự khác biệt nổi bật của 1 nhân vật trong nhóm.",
    rules: ["Nhận diện các đại từ: 'Some people', 'All of them', 'One of the men'.", "Chú ý tương tác: having a conversation, reviewing blueprints, seated around."],
    vocabBag: [{ word: "conversation", ipa: "/ˌkɑːnvərˈseɪʃn/", meaning: "Cuộc đối thoại" }],
    questions: ETS_2024_PART1_QUESTIONS.filter(q => [103, 106, 205, 302, 303, 305, 403, 503, 603, 703, 803, 903, 1003].includes(q.id)),
  },
  {
    id: "p1-c3",
    part: "Part 1",
    type: "category",
    title: "Tranh tả vật",
    totalQuestions: 15,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Đồ đạc nội thất, văn phòng, kệ hàng siêu thị, va li hành lý, dụng cụ làm việc.",
    rules: ["Chú ý vị trí sắp xếp: 'arranged on a table', 'placed on a rack', 'set on a desk'.", "Cẩn thận bẫy 'is being done' khi không có người trong ảnh."],
    vocabBag: [{ word: "arranged", ipa: "/əˈreɪndʒd/", meaning: "Được sắp đặt ngăn nắp" }],
    questions: ETS_2024_PART1_QUESTIONS.filter(q => [104, 105, 203, 206, 304, 404, 405, 504, 505, 604, 605, 704, 705, 804, 805, 904, 905, 1004, 1005].includes(q.id)),
  },
  {
    id: "p1-c4",
    part: "Part 1",
    type: "category",
    title: "Tranh tả cảnh / Ngoại cảnh",
    totalQuestions: 10,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    status: "Chưa luyện tập",
    theorySummary: "Không có người hoặc người rất nhỏ ở phía xa, tập trung vào đường phố, công viên, bến cảng, công trình.",
    rules: ["Loại ngay các đáp án có người làm chủ ngữ hoặc có chữ 'being'.", "Từ vựng cảnh vật: pavilion, clearing, pier, span across, avenue."],
    vocabBag: [{ word: "clearing", ipa: "/ˈklɪrɪŋ/", meaning: "Khoảng đất trống trong rừng" }],
    questions: ETS_2024_PART1_QUESTIONS.filter(q => [306, 406, 506, 606, 706, 806, 906, 1006].includes(q.id)),
  },
];

export const INITIAL_PART2_LEVELS: LevelCategoryCardData[] = ETS_2024_PART2_LEVELS;
export const INITIAL_PART2_CATEGORIES: LevelCategoryCardData[] = ETS_2024_PART2_CATEGORIES;
export const INITIAL_PART3_LEVELS: LevelCategoryCardData[] = ETS_2024_PART3_LEVELS;
export const INITIAL_PART3_CATEGORIES: LevelCategoryCardData[] = ETS_2024_PART3_CATEGORIES;
export const INITIAL_PART4_LEVELS: LevelCategoryCardData[] = ETS_2024_PART4_LEVELS;
export const INITIAL_PART4_CATEGORIES: LevelCategoryCardData[] = ETS_2024_PART4_CATEGORIES;
