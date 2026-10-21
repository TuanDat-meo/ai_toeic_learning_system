import { GrammarTopicItem } from "./types";

export const INITIAL_GRAMMAR_TOPICS: GrammarTopicItem[] = [
  {
    "id": "cd-01",
    "code": "CD_01",
    "titleVi": "Chuyên đề 01: Phát Âm",
    "titleEn": "Pronunciation",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Chuyên đề phát âm luôn chiếm từ 2-4 câu trong đề thi THPT Quốc Gia và là nền tảng cốt lõi trong phần thi Nghe TOEIC (Part 1, 2, 3, 4). Nắm chắc quy tắc phát âm giúp thí sinh lấy trọn điểm ngữ âm và nâng cao phản xạ nghe hiểu.",
    "formula": "### 1. Hệ thống âm trong tiếng Anh (IPA)\nTiếng Anh gồm 44 âm cơ bản (20 nguyên âm và 24 phụ âm):\n- **Nguyên âm đơn ngắn (7 âm):** /ɪ/, /e/, /æ/, /ɒ/, /ʊ/, /ʌ/, /ə/.\n- **Nguyên âm đơn dài (5 âm):** /iː/, /uː/, /ɑː/, /ɔː/, /ɜː/. (Có dấu hai chấm biểu thị độ dài).\n- **Nguyên âm đôi (8 âm):** /eɪ/, /aɪ/, /ɔɪ/, /aʊ/, /əʊ/, /ɪə/, /eə/, /ʊə/.\n- **Phụ âm vô thanh (Voiceless):** /p/, /t/, /k/, /f/, /θ/, /s/, /ʃ/, /tʃ/.\n- **Phụ âm hữu thanh (Voiced):** /b/, /d/, /ɡ/, /v/, /ð/, /z/, /ʒ/, /dʒ/, /m/, /n/, /ŋ/, /h/, /l/, /r/, /w/, /j/.\n\n### 2. Quy tắc phát âm đuôi -S / -ES:\n- **Phát âm là /s/:** Khi tận cùng từ bằng các phụ âm vô thanh: /p/, /t/, /k/, /f/, /θ/ (Mẹo nhớ: *Thời phong kiến phương tây*).\n  *Ví dụ:* stops /stɒps/, books /bʊks/, cats /kæts/, laughs /lɑːfs/, months /mʌnθs/.\n- **Phát âm là /ɪz/:** Khi tận cùng từ bằng các âm xì/gió: /s/, /z/, /ʃ/, /ʒ/, /tʃ/, /dʒ/ (thường tận cùng là s, ss, ch, sh, x, z, ge, ce).\n  *Ví dụ:* watches /ˈwɒtʃɪz/, misses /ˈmɪsɪz/, boxes /ˈbɒksɪz/, changes /ˈtʃeɪndʒɪz/.\n- **Phát âm là /z/:** Các trường hợp còn lại (nguyên âm và phụ âm hữu thanh).\n  *Ví dụ:* plays /pleɪz/, cleans /kliːnz/, loves /lʌvz/.\n\n### 3. Quy tắc phát âm đuôi -ED:\n- **Phát âm là /ɪd/:** Khi động từ tận cùng bằng âm /t/ hoặc /d/ (Mẹo nhớ: *Tiền đô*).\n  *Ví dụ:* wanted /ˈwɒntɪd/, decided /dɪˈsaɪdɪd/.\n- **Phát âm là /t/:** Khi động từ tận cùng bằng các phụ âm vô thanh: /p/, /k/, /f/, /s/, /ʃ/, /tʃ/, /θ/ (Mẹo nhớ: *Chính phủ pháp không sợ thổi cơm*).\n  *Ví dụ:* stopped /stɒpt/, looked /lʊkt/, laughed /lɑːft/, washed /wɒʃt/, watched /wɒtʃt/.\n- **Phát âm là /d/:** Các trường hợp còn lại (nguyên âm và phụ âm hữu thanh).\n  *Ví dụ:* played /pleɪd/, lived /lɪvd/, opened /ˈəʊpənd/.\n- **Lưu ý ngoại lệ (Tính từ có đuôi -ed phát âm là /ɪd/):** naked /ˈneɪkɪd/, wicked /ˈwɪkɪd/, learned /ˈlɜːnɪd/, blessed /ˈblesɪd/, crooked /ˈkrʊkɪd/, sacred /ˈseɪkrɪd/.",
    "signalWords": [
      "- Dạng bài tập gạch chân chữ cái tận cùng (-ed, -s, -es): Quan sát ngay âm phát ra trước đuôi gạch chân.\n- Dạng bài gạch chân nguyên âm đơn/đôi (ea, oo, ou, a, i, u): Nhận diện nhóm từ có cách đọc đặc biệt (vd: head /e/ vs please /iː/; food /uː/ vs foot /ʊ/).\n- Nhận diện các chữ cái câm thường bẫy trong đề:\n  * Âm /b/ câm: climb /klaɪm/, debt /det/, doubt /daʊt/, subtle /ˈsʌtl/.\n  * Âm /k/ câm: know /nəʊ/, knee /niː/, knife /naɪf/, knight /naɪt/.\n  * Âm /p/ câm: receipt /rɪˈsiːt/, psychology /saɪˈkɒlədʒi/.\n  * Âm /h/ câm: hour /ˈaʊə/, honest /ˈɒnɪst/, heir /eə/."
    ],
    "traps": [
      "- **Bẫy tính từ đuôi -ed:** Nhầm các tính từ 'naked', 'wicked', 'crooked', 'blessed' phát âm là /t/ theo quy tắc động từ thường, nhưng thực tế chúng luôn phát âm là /ɪd/.\n- **Bẫy chữ cái gh, ph:** Chữ cái 'gh' trong 'cough', 'laugh', 'rough' đọc là âm /f/ (vô thanh), nên thêm -ed đọc là /t/, thêm -s đọc là /s/. Ngược lại 'gh' trong 'plough', 'through' là âm câm.\n- **Bẫy âm /h/:** Từ 'vehicle' /ˈviːɪkl/ có âm 'h' câm, không đọc là /h/."
    ],
    "examples": [
      {
        "sentence": "The quality supervisor inspected all manufactured components and decided to approve the delivery.",
        "translation": "Người giám sát chất lượng đã kiểm tra tất cả linh kiện được sản xuất và quyết định phê duyệt việc giao hàng.",
        "analysis": "inspected /t/ (tận cùng /k/ vô thanh) • decided /ɪd/ (tận cùng /d/ 'tiền đô') • approved /d/ (nguyên âm/hữu thanh)."
      },
      {
        "sentence": "The lead accountant checks every invoice, calculates quarterly expenses, and organizes all client receipts.",
        "translation": "Kế toán trưởng kiểm tra từng hóa đơn, tính toán chi phí hàng quý và sắp xếp tất cả biên lai của khách hàng.",
        "analysis": "checks /s/ (tận cùng /k/ 'phong kiến') • calculates /s/ (tận cùng /t/) • organizes /ɪz/ (âm gió /z/ tận cùng ce, ge, s, x)."
      },
      {
        "sentence": "1. **Mẹo đuôi -ed:** Thuộc lòng 2 câu thần chú:\n   - \"Tiền đô\" (/t/, /d/) -> đọc là /ɪd/ (wanted, decided).\n   - \"Chính phủ pháp không sợ thổi cơm\" (/tʃ/, /p/, /f/, /k/, /s/, /θ/) -> đọc là /t/ (stopped, looked, laughed, washed).\n   - Còn lại -> đọc là /d/ (played, lived, opened).\n2. **Mẹo đuôi -s/es:**\n   - \"Thời phong kiến phương tây\" (/θ/, /p/, /k/, /f/, /t/) -> đọc là /s/ (stops, books, cats).\n   - Âm gió tận cùng (s, x, ch, sh, ce, ge) -> đọc là /ɪz/ (watches, misses, boxes, changes).\n   - Còn lại -> đọc là /z/ (plays, loves).\n3. **Bẫy âm câm TOEIC kinh điển:**\n   - climb /klaɪm/, debt /det/, doubt /daʊt/ (âm 'b' câm).\n   - receipt /rɪˈsiːt/ (âm 'p' câm), honest /ˈɒnɪst/, hour /ˈaʊə/ (âm 'h' câm).",
        "translation": "Bộ thần chú nhận diện nhanh cách phát âm đuôi -ed và -s/es chuẩn ETS.",
        "analysis": "Áp dụng chiến thuật loại trừ: Trong 4 phương án, chọn 3 từ chắc chắn nhất để suy ra từ khác nhóm còn lại."
      }
    ],
    "questions": [
      {
        "id": "q-1-1",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. invited  B. visited  C. needed  D. worked",
        "options": {
          "A": "invited",
          "B": "visited",
          "C": "needed",
          "D": "worked"
        },
        "correctAnswer": "D",
        "explanation": "Áp dụng quy tắc phát âm đuôi -ed: invited (/t/ + ed -> /ɪd/), visited (/t/ + ed -> /ɪd/), needed (/d/ + ed -> /ɪd/). Riêng worked có âm cuối là /k/ (vô thanh) nên phát âm là /t/. Do đó chọn D. Dễ nhầm lẫn nếu không nhìn vào âm kết thúc trước khi thêm -ed.",
        "trapNote": "Dễ nhầm lẫn nếu không nhìn vào âm kết thúc trước khi thêm -ed.",
        "translation": "Chọn từ có đuôi -ed phát âm khác với 3 từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-2",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. books  B. cats  C. maps  D. dogs",
        "options": {
          "A": "books",
          "B": "cats",
          "C": "maps",
          "D": "dogs"
        },
        "correctAnswer": "D",
        "explanation": "Áp dụng thần chú 'Thời phong kiến phương tây': books (/k/), cats (/t/), maps (/p/) đều tận cùng bằng phụ âm vô thanh nên đuôi -s phát âm là /s/. Dog kết thúc bằng âm hữu thanh /ɡ/ nên đuôi -s phát âm là /z/. Chọn D. Phải xác định âm kết thúc của từ gốc chứ không chỉ nhìn mặt chữ.",
        "trapNote": "Phải xác định âm kết thúc của từ gốc chứ không chỉ nhìn mặt chữ.",
        "translation": "Chọn từ có đuôi -s phát âm khác với 3 từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-3",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. see  B. free  C. meet  D. bread",
        "options": {
          "A": "see",
          "B": "free",
          "C": "meet",
          "D": "bread"
        },
        "correctAnswer": "D",
        "explanation": "see /siː/, free /friː/, meet /miːt/ đều là âm /iː/. Riêng bread phát âm là /bred/ (âm /e/). Chọn D. Chữ 'ea' thường phát âm là /iː/ nhưng trong 'bread', 'head', 'heavy', 'dead' lại là /e/.",
        "trapNote": "Chữ 'ea' thường phát âm là /iː/ nhưng trong 'bread', 'head', 'heavy', 'dead' lại là /e/.",
        "translation": "Chọn từ có nguyên âm 'ee'/'ea' phát âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-4",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. laughed  B. washed  C. missed  D. planned",
        "options": {
          "A": "laughed",
          "B": "washed",
          "C": "missed",
          "D": "planned"
        },
        "correctAnswer": "D",
        "explanation": "'laugh' kết thúc bằng âm /f/ (vô thanh) -> laughed đọc là /lɑːft/. 'wash' kết thúc bằng âm /ʃ/ -> washed đọc là /wɒʃt/. 'miss' kết thúc bằng âm /s/ -> missed đọc là /mɪst/. 'plan' kết thúc bằng âm /n/ (hữu thanh) -> planned đọc là /plænd/. Chọn D. Dễ nhầm chữ cái 'gh' trong 'laugh' là âm câm, nhưng thực tế phát âm là /f/.",
        "trapNote": "Dễ nhầm chữ cái 'gh' trong 'laugh' là âm câm, nhưng thực tế phát âm là /f/.",
        "translation": "Chọn từ có cách phát âm đuôi -ed khác với các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-5",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. watches  B. washes  C. misses  D. leaves",
        "options": {
          "A": "watches",
          "B": "washes",
          "C": "misses",
          "D": "leaves"
        },
        "correctAnswer": "D",
        "explanation": "watches (/tʃ/ + es -> /ɪz/), washes (/ʃ/ + es -> /ɪz/), misses (/s/ + es -> /ɪz/). Riêng leave tận cùng là âm hữu thanh /v/ nên leaves đọc là /liːvz/ (âm /z/). Chọn D. Nhiều bạn cứ thấy đuôi viết là '-es' là tưởng đọc là /ɪz/ hết, phải nhìn âm gốc trước 'es'.",
        "trapNote": "Nhiều bạn cứ thấy đuôi viết là '-es' là tưởng đọc là /ɪz/ hết, phải nhìn âm gốc trước 'es'.",
        "translation": "Chọn từ có đuôi -es phát âm khác với các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-6",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. hour  B. house  C. horse  D. heavy",
        "options": {
          "A": "hour",
          "B": "house",
          "C": "horse",
          "D": "heavy"
        },
        "correctAnswer": "A",
        "explanation": "'hour' là từ có chữ 'h' câm phát âm là /ˈaʊə/ (bắt đầu bằng nguyên âm). Ba từ house /haʊs/, horse /hɔːs/, heavy /ˈhevi/ đều phát âm rõ phụ âm /h/. Chọn A. Nhớ các từ 'h' câm phổ biến: hour, honest, honor, heir, vehicle.",
        "trapNote": "Nhớ các từ 'h' câm phổ biến: hour, honest, honor, heir, vehicle.",
        "translation": "Chọn từ có chữ cái 'h' phát âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-7",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. think  B. thank  C. thin  D. this",
        "options": {
          "A": "think",
          "B": "thank",
          "C": "thin",
          "D": "this"
        },
        "correctAnswer": "D",
        "explanation": "think, thank, thin đều là âm vô thanh /θ/ (thổi hơi qua kẽ răng không rung dây thanh). 'this' là đại từ chỉ định phát âm là âm hữu thanh /ð/ (rung thanh quản). Chọn D. Hầu hết các đại từ, mạo từ bắt đầu bằng 'th' (this, that, these, those, the, they, there) đều đọc là /ð/.",
        "trapNote": "Hầu hết các đại từ, mạo từ bắt đầu bằng 'th' (this, that, these, those, the, they, there) đều đọc là /ð/.",
        "translation": "Chọn từ có phần tử 'th' phát âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-8",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. debt  B. doubt  C. climb  D. timber",
        "options": {
          "A": "debt",
          "B": "doubt",
          "C": "climb",
          "D": "timber"
        },
        "correctAnswer": "D",
        "explanation": "Trong tiếng Anh, 'b' đứng trước 't' (debt, doubt, subtle) hoặc đứng sau 'm' ở cuối từ (climb, comb, bomb, tomb) là âm câm. Trong 'timber', 'b' nằm giữa hai âm tiết nên phát âm bình thường là /ˈtɪmbə/. Chọn D. Học sinh hay phát âm sai từ 'debt' thành /dept/ và 'climb' thành /klaɪmb/.",
        "trapNote": "Học sinh hay phát âm sai từ 'debt' thành /dept/ và 'climb' thành /klaɪmb/.",
        "translation": "Chọn từ có chữ cái 'b' phát âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-9",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. naked  B. sacred  C. wicked  D. booked",
        "options": {
          "A": "naked",
          "B": "sacred",
          "C": "wicked",
          "D": "booked"
        },
        "correctAnswer": "D",
        "explanation": "Đây là bẫy kinh điển trong đề thi THPT QG và TOEIC: 'naked' /ˈneɪkɪd/, 'sacred' /ˈseɪkrɪd/, 'wicked' /ˈwɪkɪd/ là các tính từ ngoại lệ có đuôi -ed luôn phát âm là /ɪd/. 'booked' là động từ thêm -ed bình thường sau âm /k/ nên phát âm là /bʊkt/ (/t/). Chọn D. Bẫy nhìn thấy chữ 'k' tưởng cả 4 từ đều phát âm là /t/ theo quy tắc động từ thông thường.",
        "trapNote": "Bẫy nhìn thấy chữ 'k' tưởng cả 4 từ đều phát âm là /t/ theo quy tắc động từ thông thường.",
        "translation": "Chọn từ có đuôi -ed phát âm khác với các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-1-10",
        "part": "PART_5",
        "questionText": "Chọn từ có phần gạch chân phát âm khác với các từ còn lại: A. breath  B. smooth  C. without  D. breathe",
        "options": {
          "A": "breath",
          "B": "smooth",
          "C": "without",
          "D": "breathe"
        },
        "correctAnswer": "A",
        "explanation": "Danh từ breath phát âm là /breθ/ (âm vô thanh /θ/). Động từ breathe tận cùng có 'e' phát âm là /briːð/ (âm hữu thanh /ð/). smooth /smuːð/ và without /wɪˈðaʊt/ đều phát âm là /ð/. Do đó chọn A. Rất nhiều thí sinh nhầm lẫn giữa danh từ 'breath' (/θ/) và động từ 'breathe' (/ð/).",
        "trapNote": "Rất nhiều thí sinh nhầm lẫn giữa danh từ 'breath' (/θ/) và động từ 'breathe' (/ð/).",
        "translation": "Chọn từ có phần 'th' phát âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-02",
    "code": "CD_02",
    "titleVi": "Chuyên đề 02: Trọng Âm",
    "titleEn": "Word Stress",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Trọng âm là linh hồn của phát âm tiếng Anh. Đề thi luôn có 2 câu trọng âm (1 câu từ 2 âm tiết và 1 câu từ 3 âm tiết). Nắm chắc quy tắc trọng âm giúp bạn đạt điểm tối đa và nhận diện chuẩn xác từ vựng trong bài thi TOEIC Listening.",
    "formula": "### 1. Quy tắc trọng âm của từ có 2 âm tiết:\n- **Đa số Danh từ và Tính từ:** Trọng âm rơi vào **âm tiết 1**.\n  *Ví dụ:* `table /ˈteɪbl/`, `monkey /ˈmʌŋki/`, `happy /ˈhæpi/`, `clever /ˈklevə/`.\n- **Đa số Động từ và Giới từ:** Trọng âm rơi vào **âm tiết 2**.\n  *Ví dụ:* `begin /bɪˈɡɪn/`, `enjoy /ɪnˈdʒɔɪ/`, `relax /rɪˈlæks/`, `between /bɪˈtwiːn/`.\n- **Ngoại lệ quan trọng:**\n  * Động từ có âm thứ 2 là nguyên âm ngắn /ə/ hoặc /ɪ/: trọng âm rơi vào âm 1: `enter /ˈentə/`, `listen /ˈlɪsn/`, `open /ˈəʊpən/`, `happen /ˈhæpən/`.\n  * Danh từ/Tính từ có âm 1 là /ə/: trọng âm rơi vào âm 2: `advice /ədˈvaɪs/`, `machine /məˈʃiːn/`, `asleep /əˈsliːp/`.\n\n### 2. Quy tắc trọng âm theo hậu tố (Suffixes):\n- **Hậu tố nhận chính trọng âm:** `-ee` (employee), `-eer` (engineer), `-ese` (Vietnamese), `-ique` (unique), `-esque` (picturesque).\n- **Hậu tố làm trọng âm rơi vào âm tiết NGAY TRƯỚC NÓ:**\n  * `-tion`, `-sion`: nation, decision, production.\n  * `-ic`, `-ical`: economic, historic, political.\n  * `-ity`, `-ety`: ability, society, activity.\n  * `-logy`, `-graphy`: biology, photography.\n  * `-ial`, `-ual`, `-ious`, `-eous`: potential, mutual, delicious, courageous.\n- **Hậu tố làm trọng âm dịch chuyển về âm tiết THỨ 3 TỪ CUỐI LÊN:**\n  * `-ate`: communicate, calculate, educate.\n  * `-ize` / `-ise`: organize, recognize.\n  * `-y` (tận cùng bằng phụ âm + y trong từ 3 âm tiết): economy, industry.\n- **Hậu tố KHÔNG làm thay đổi trọng âm của từ gốc:**\n  * `-ful`, `-less`, `-ness`, `-ment`, `-er`, `-or`, `-ly`, `-able`, `-ish`, `-ship`.\n  * *Ví dụ:* `careful /ˈkeəfl/` (từ care), `happiness /ˈhæpinəs/` (từ happy).",
    "signalWords": [
      "- Đếm số âm tiết của 4 từ trong đề bài (thường chia thành 1 câu 2 âm tiết và 1 câu 3 âm tiết).\n- Nhìn đuôi hậu tố trước: nếu thấy đuôi `-tion, -ic, -ity, -logy` -> đếm lùi 1 âm.\n- Nhìn đuôi `-ee, -eer, -ese` -> đánh thẳng vào chính nó.\n- Nếu là từ 2 âm tiết: xác định từ loại (Danh/Tính nhấn âm 1, Động nhấn âm 2)."
    ],
    "traps": [
      "- **Bẫy động từ kết thúc bằng nguyên âm ngắn:** `listen`, `happen`, `open`, `enter` mặc dù là động từ nhưng trọng âm rơi vào âm 1 vì âm 2 là âm yếu /ə/ hoặc /n/.\n- **Bẫy từ vừa là Danh vừa là Động:** `record` (N: /ˈrekɔːd/ - đĩa hát, V: /rɪˈkɔːd/ - ghi âm), `present` (N: /ˈpreznt/ - món quà, V: /prɪˈzent/ - thuyết trình)."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú từ 2 âm tiết:** *Danh - Tính nhấn 1, Động nhấn 2*.\n2. **Quy tắc nguyên âm yếu /ə/:** Trọng âm KHÔNG BAO GIỜ rơi vào âm /ə/. Nếu âm 1 là /ə/ (như about, alone, asleep) -> trọng âm chắc chắn rơi vào âm 2!\n3. **Mẹo hậu tố đếm lùi:**\n   - Đuôi `-ic, -tion, -sion, -ity`: Trọng âm rơi vào âm sát nách nó.\n   - Đuôi `-ate, -ize, -y`: Trọng âm cách đuôi 1 âm (âm thứ 3 từ phải sang).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-2-1",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. student  B. doctor  C. teacher  D. relax",
        "options": {
          "A": "student",
          "B": "doctor",
          "C": "teacher",
          "D": "relax"
        },
        "correctAnswer": "D",
        "explanation": "Áp dụng quy tắc trọng âm từ 2 âm tiết: Danh từ nhấn âm 1 (student /ˈstjuːdnt/, doctor /ˈdɒktə/, teacher /ˈtiːtʃə/). Động từ nhấn âm 2 (relax /rɪˈlæks/). Chọn D. Quy tắc cơ bản, chú ý không đọc lướt.",
        "trapNote": "Quy tắc cơ bản, chú ý không đọc lướt.",
        "translation": "Chọn từ có vị trí trọng âm khác với 3 từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-2",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. happy  B. clever  C. polite  D. busy",
        "options": {
          "A": "happy",
          "B": "clever",
          "C": "polite",
          "D": "busy"
        },
        "correctAnswer": "C",
        "explanation": "Đa số tính từ 2 âm tiết nhấn âm 1 (happy /ˈhæpi/, clever /ˈklevə/, busy /ˈbɪzi/). 'polite' có âm thứ nhất là /pə/ (nguyên âm yếu /ə/) nên trọng âm rơi vào âm tiết thứ 2 /pəˈlaɪt/. Chọn C. Âm /ə/ không bao giờ nhận trọng âm.",
        "trapNote": "Âm /ə/ không bao giờ nhận trọng âm.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-3",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. decision  B. attraction  C. tradition  D. difficult",
        "options": {
          "A": "decision",
          "B": "attraction",
          "C": "tradition",
          "D": "difficult"
        },
        "correctAnswer": "D",
        "explanation": "Các từ tận cùng bằng đuôi '-tion/-sion' có trọng âm rơi vào âm ngay trước nó: decision (âm 2), attraction (âm 2), tradition (âm 2). 'difficult' là tính từ 3 âm tiết nhấn âm 1 (/ˈdɪfɪkəlt/). Chọn D. Nhận biết ngay đuôi -tion/-sion để làm bài trong 3 giây.",
        "trapNote": "Nhận biết ngay đuôi -tion/-sion để làm bài trong 3 giây.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-4",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. listen  B. open  C. happen  D. enjoy",
        "options": {
          "A": "listen",
          "B": "open",
          "C": "happen",
          "D": "enjoy"
        },
        "correctAnswer": "D",
        "explanation": "Động từ 'enjoy' có âm thứ hai là nguyên âm đôi /ɔɪ/ nhận trọng âm 2 (/ɪnˈdʒɔɪ/). Ba động từ listen, open, happen đều có âm thứ hai là âm /ə/ hoặc /n/ yếu nên trọng âm rơi vào âm 1: listen /ˈlɪsn/, open /ˈəʊpən/, happen /ˈhæpən/. Chọn D. Bẫy động từ 2 âm tiết: nhiều học sinh nghĩ động từ luôn nhấn âm 2.",
        "trapNote": "Bẫy động từ 2 âm tiết: nhiều học sinh nghĩ động từ luôn nhấn âm 2.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-5",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. economic  B. electronic  C. scientific  D. politics",
        "options": {
          "A": "economic",
          "B": "electronic",
          "C": "scientific",
          "D": "politics"
        },
        "correctAnswer": "D",
        "explanation": "Theo quy tắc, từ có đuôi '-ic' trọng âm rơi vào âm liền trước: eco'nomic (âm 3), elec'tronic (âm 3), scien'tific (âm 3). Riêng 'politics' là danh từ ngoại lệ có trọng âm rơi vào âm tiết 1 /ˈpɒlətɪks/. Chọn D. Bẫy ngoại lệ kinh điển: 'politics', 'arabic', 'catholic' tận cùng là -ic nhưng nhấn âm 1.",
        "trapNote": "Bẫy ngoại lệ kinh điển: 'politics', 'arabic', 'catholic' tận cùng là -ic nhưng nhấn âm 1.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-6",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. volunteer  B. engineer  C. Vietnamese  D. comfortable",
        "options": {
          "A": "volunteer",
          "B": "engineer",
          "C": "Vietnamese",
          "D": "comfortable"
        },
        "correctAnswer": "D",
        "explanation": "Hậu tố '-eer' và '-ese' nhận chính trọng âm: volun'teer (âm 3), engi'neer (âm 3), Vietna'mese (âm 3). Từ 'comfortable' có gốc comfort /ˈkʌmfət/ thêm hậu tố -able không đổi trọng âm nên nhấn âm 1 /ˈkʌmftəbl/. Chọn D. Từ 'comfortable' đọc là 3 âm tiết /ˈkʌmftəbl/, không đọc là 4 âm tiết.",
        "trapNote": "Từ 'comfortable' đọc là 3 âm tiết /ˈkʌmftəbl/, không đọc là 4 âm tiết.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-7",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. photography  B. geography  C. biology  D. photograph",
        "options": {
          "A": "photography",
          "B": "geography",
          "C": "biology",
          "D": "photograph"
        },
        "correctAnswer": "D",
        "explanation": "Hậu tố '-graphy' và '-logy' làm trọng âm rơi vào âm tiết ngay trước nó (âm 2): pho'tography, ge'ography, bi'ology. Ngược lại, danh từ 'photograph' có trọng âm rơi vào âm 1 /ˈfəʊtəɡrɑːf/. Chọn D. Dễ nhầm giữa 'photograph' (âm 1) và 'photography' (âm 2), 'photographic' (âm 3).",
        "trapNote": "Dễ nhầm giữa 'photograph' (âm 1) và 'photography' (âm 2), 'photographic' (âm 3).",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-8",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. calculate  B. communicate  C. demonstrate  D. decorate",
        "options": {
          "A": "calculate",
          "B": "communicate",
          "C": "demonstrate",
          "D": "decorate"
        },
        "correctAnswer": "B",
        "explanation": "Hậu tố '-ate' làm trọng âm rơi vào âm tiết thứ 3 từ cuối lên: 'calculate (3 âm tiết -> âm 1), 'demonstrate (3 âm tiết -> âm 1), 'decorate (3 âm tiết -> âm 1). 'communicate' có 4 âm tiết (com-mu-ni-cate) -> đếm từ cuối lên: cate (1), ni (2), mu (3) -> rơi vào âm 2 /kəˈmjuːnɪkeɪt/. Chọn B. Phải đếm tổng số âm tiết của từ trước khi áp dụng quy tắc đếm ngược 3 âm.",
        "trapNote": "Phải đếm tổng số âm tiết của từ trước khi áp dụng quy tắc đếm ngược 3 âm.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-9",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. certificate  B. immediate  C. appreciate  D. duplicate (adj)",
        "options": {
          "A": "certificate",
          "B": "immediate",
          "C": "appreciate",
          "D": "duplicate (adj)"
        },
        "correctAnswer": "D",
        "explanation": "certificate (4 âm tiết: cer-tif-i-cate -> nhấn âm 2 /səˈtɪfɪkət/). immediate (4 âm tiết: im-me-di-ate -> nhấn âm 2 /ɪˈmiːdiət/). appreciate (4 âm tiết: ap-pre-ci-ate -> nhấn âm 2 /əˈpriːʃieɪt/). duplicate (3 âm tiết: du-pli-cate -> đếm lùi 3 âm rơi vào âm 1 /ˈdjuːplɪkət/). Chọn D. Các từ đuôi -ate phiên âm là /ət/ khi là Danh từ/Tính từ, nhưng quy tắc trọng âm vẫn đếm từ cuối lên 3 âm.",
        "trapNote": "Các từ đuôi -ate phiên âm là /ət/ khi là Danh từ/Tính từ, nhưng quy tắc trọng âm vẫn đếm từ cuối lên 3 âm.",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-2-10",
        "part": "PART_5",
        "questionText": "Chọn từ có vị trí trọng âm khác với các từ còn lại: A. record (n)  B. contrast (n)  C. object (v)  D. desert (n)",
        "options": {
          "A": "record (n)",
          "B": "contrast (n)",
          "C": "object (v)",
          "D": "desert (n)"
        },
        "correctAnswer": "C",
        "explanation": "Trong tiếng Anh, một nhóm từ 2 âm tiết nếu là Danh từ thì nhấn âm 1, nếu là Động từ thì nhấn âm 2: 'record' (n) -> /ˈrekɔːd/ (âm 1); 'contrast' (n) -> /ˈkɒntrɑːst/ (âm 1); 'desert' (n) -> /ˈdezət/ (âm 1). 'object' (v) mang nghĩa phản đối -> /əbˈdʒekt/ (nhấn âm 2). Chọn C. Bẫy từ đa năng Danh/Động: object (n: vật thể - âm 1; v: phản đối - âm 2); desert (n: sa mạc - âm 1; v: ruồng bỏ - âm 2).",
        "trapNote": "Bẫy từ đa năng Danh/Động: object (n: vật thể - âm 1; v: phản đối - âm 2); desert (n: sa mạc - âm 1; v: ruồng bỏ - âm 2).",
        "translation": "Chọn từ có vị trí trọng âm khác các từ còn lại.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-03",
    "code": "CD_03",
    "titleVi": "Chuyên đề 03: Thì Động Từ",
    "titleEn": "Verb Tenses",
    "part": "Part 5 & 6",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Thì động từ là trụ cột quan trọng nhất trong tiếng Anh, chiếm 3-5 câu trong đề thi THPT QG và xuyên suốt 100 câu Reading TOEIC (Part 5, 6, 7). Nắm vững 12 thì giúp bạn chọn chuẩn dạng động từ trong chớp mắt.",
    "formula": "### 1. Bảng tổng hợp 12 thì cơ bản trong Tiếng Anh:\n\n#### Nhóm Hiện Tại (Present):\n- **Hiện tại đơn (Present Simple):** `S + V(s/es)` / `S + do/does + not + V`\n  * Dùng cho: Thói quen, sự thật hiển nhiên, lịch trình tàu xe/máy bay.\n  * Dấu hiệu: always, usually, often, sometimes, every day/week, rarely.\n- **Hiện tại tiếp diễn (Present Continuous):** `S + am/is/are + V-ing`\n  * Dùng cho: Hành động đang xảy ra tại thời điểm nói, kế hoạch tương lai gần.\n  * Dấu hiệu: now, right now, at the moment, at present, Look!, Listen!.\n- **Hiện tại hoàn thành (Present Perfect):** `S + have/has + V3/ed`\n  * Dùng cho: Hành động xảy ra trong quá khứ kéo dài đến hiện tại, trải nghiệm (ever/never), vừa mới xảy ra (just).\n  * Dấu hiệu: since, for, already, yet, just, ever, never, recently, so far, up to now.\n- **Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous):** `S + have/has been + V-ing`\n  * Nhấn mạnh tính liên tục của hành động bắt đầu từ quá khứ và vẫn đang tiếp diễn.\n\n#### Nhóm Quá Khứ (Past):\n- **Quá khứ đơn (Past Simple):** `S + V2/ed` / `S + did not + V`\n  * Dùng cho: Hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ có thời gian xác định.\n  * Dấu hiệu: yesterday, ago, last week/year, in 1990, in the past.\n- **Quá khứ tiếp diễn (Past Continuous):** `S + was/were + V-ing`\n  * Dùng cho: Hành động đang diễn ra tại một thời điểm xác định trong quá khứ, hoặc một hành động đang xảy ra thì hành động khác cắt ngang.\n  * Dấu hiệu: at 8 p.m yesterday, at this time last year, while, when.\n- **Quá khứ hoàn thành (Past Perfect):** `S + had + V3/ed`\n  * Dùng cho: Hành động xảy ra và hoàn thành TRƯỚC một hành động khác hoặc một mốc thời gian trong quá khứ.\n  * Dấu hiệu: before, after, by the time, as soon as, prior to.\n- **Quá khứ hoàn thành tiếp diễn:** `S + had been + V-ing`\n\n#### Nhóm Tương Lai (Future):\n- **Tương lai đơn (Future Simple):** `S + will + V-bare` (Dự đoán không căn cứ, quyết định ngay lúc nói, lời hứa).\n- **Tương lai gần (Near Future):** `S + am/is/are going to + V-bare` (Dự định có kế hoạch từ trước, dự đoán có căn cứ hiện tại).\n- **Tương lai tiếp diễn (Future Continuous):** `S + will be + V-ing` (Đang diễn ra tại một thời điểm tương lai: at 9 a.m tomorrow).\n- **Tương lai hoàn thành (Future Perfect):** `S + will have + V3/ed` (Sẽ hoàn thành trước một mốc tương lai: by next month, by tomorrow).",
    "signalWords": [
      "- **Mốc thời gian:**\n  * Có 'yesterday', 'ago', 'last...' -> Chia Quá Khứ Đơn (V2/ed).\n  * Có 'tomorrow', 'next...', 'in + năm tương lai' -> Chia Tương Lai (will V).\n  * Có 'since + mốc', 'for + khoảng', 'so far', 'recently' -> Chia Hiện Tại Hoàn Thành (have/has V3).\n  * Có 'By the time + QKĐ' -> Mệnh đề chính chia Quá Khứ Hoàn Thành (had V3).\n  * Có 'By the time + HTĐ' -> Mệnh đề chính chia Tương Lai Hoàn Thành (will have V3).\n- **Động từ trạng thái (Stative verbs):** know, believe, understand, love, hate, want, need KHÔNG dùng ở dạng tiếp diễn (-ing)."
    ],
    "traps": [
      "- **Bẫy thì trong mệnh đề thời gian tương lai:** Sau các liên từ When, As soon as, Until, While, By the time, KHÔNG BAO GIỜ dùng 'will'. Phải dùng thì hiện tại đơn để diễn tả tương lai!\n  *Sai:* When he will arrive, I will call you.\n  *Đúng:* When he **arrives**, I will call you.\n- **Bẫy động từ trạng thái:** 'I am knowing him' là sai, phải dùng 'I know him'."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo trục thời gian:**\n   - Hành động xảy ra trước Quá khứ -> Dùng Quá khứ hoàn thành (`had + V3`).\n   - Cắt ngang trong quá khứ: Đang xảy ra dài (`was/were V-ing`), cắt ngang ngắn (`V2/ed`).\n2. **Quy tắc vàng với SINCE:**\n   `S + have/has + V3/ed + SINCE + S + V2/ed (hoặc mốc thời gian QK)`\n3. **Mẹo BY THE TIME:**\n   - `By the time + V(hiện tại) -> will have + V3`\n   - `By the time + V(quá khứ) -> had + V3`",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-3-1",
        "part": "PART_5",
        "questionText": "Mary usually _____ to school by bicycle every morning.\nA. goes\nB. is going\nC. went\nD. has gone",
        "options": {
          "A": "goes",
          "B": "is going",
          "C": "went",
          "D": "has gone"
        },
        "correctAnswer": "A",
        "explanation": "'usually' và 'every morning' diễn tả thói quen lặp đi lặp lại ở hiện tại -> Dùng thì Hiện tại đơn. Chủ ngữ 'Mary' là ngôi thứ 3 số ít nên động từ 'go' thêm 'es' thành 'goes'. Chọn A. Dễ chọn nhầm 'is going' nếu không chú ý 'usually'.",
        "trapNote": "Dễ chọn nhầm 'is going' nếu không chú ý 'usually'.",
        "translation": "Mary thường _____ đến trường bằng xe đạp mỗi buổi sáng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-2",
        "part": "PART_5",
        "questionText": "They _____ a new car two days ago.\nA. buy\nB. bought\nC. will buy\nD. have bought",
        "options": {
          "A": "buy",
          "B": "bought",
          "C": "will buy",
          "D": "have bought"
        },
        "correctAnswer": "B",
        "explanation": "'ago' là dấu hiệu nhận biết đặc trưng của thì Quá khứ đơn -> Động từ chia ở dạng V2/ed. Động từ bất quy tắc của 'buy' là 'bought'. Chọn B. Không dùng hiện tại hoàn thành khi đã có mốc thời gian xác định kết thúc trong quá khứ.",
        "trapNote": "Không dùng hiện tại hoàn thành khi đã có mốc thời gian xác định kết thúc trong quá khứ.",
        "translation": "Họ _____ một chiếc xe hơi mới hai ngày trước.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-3",
        "part": "PART_5",
        "questionText": "Look! The children _____ football on the playground.\nA. play\nB. played\nC. are playing\nD. have played",
        "options": {
          "A": "play",
          "B": "played",
          "C": "are playing",
          "D": "have played"
        },
        "correctAnswer": "C",
        "explanation": "'Look!' là câu hiệu lệnh báo hiệu hành động đang diễn ra ngay lúc nói -> Dùng thì Hiện tại tiếp diễn (am/is/are + V-ing). Chủ ngữ 'The children' là danh từ số nhiều -> dùng 'are playing'. Chọn C. 'children' là số nhiều của 'child', tránh dùng nhầm 'is playing'.",
        "trapNote": "'children' là số nhiều của 'child', tránh dùng nhầm 'is playing'.",
        "translation": "Nhìn kìa! Lũ trẻ _____ đá bóng trên sân chơi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-4",
        "part": "PART_5",
        "questionText": "Mr. David _____ for this multinational corporation since 2018.\nA. works\nB. is working\nC. worked\nD. has worked",
        "options": {
          "A": "works",
          "B": "is working",
          "C": "worked",
          "D": "has worked"
        },
        "correctAnswer": "D",
        "explanation": "'since + mốc thời gian quá khứ' là dấu hiệu nhận biết của thì Hiện tại hoàn thành, diễn tả hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại. Chủ ngữ 'Mr. David' số ít -> dùng 'has worked'. Chọn D. Thấy năm 2018 trong quá khứ dễ vội vàng chọn 'worked', nhưng có chữ 'since' phía trước nên phải là HTHT.",
        "trapNote": "Thấy năm 2018 trong quá khứ dễ vội vàng chọn 'worked', nhưng có chữ 'since' phía trước nên phải là HTHT.",
        "translation": "Ông David _____ cho tập đoàn đa quốc gia này từ năm 2018.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-5",
        "part": "PART_5",
        "questionText": "While my mother was cooking dinner, my father _____ the newspaper.\nA. read\nB. was reading\nC. has read\nD. is reading",
        "options": {
          "A": "read",
          "B": "was reading",
          "C": "has read",
          "D": "is reading"
        },
        "correctAnswer": "B",
        "explanation": "Khi hai hành động diễn ra song song cùng một lúc trong quá khứ, cả hai mệnh đề đều chia thì Quá khứ tiếp diễn (`was/were + V-ing`). Chủ ngữ 'my father' số ít -> 'was reading'. Chọn B. Phân biệt với trường hợp một hành động đang diễn ra (QKTD) thì một hành động khác xen vào (QKĐ). Ở đây nấu ăn và đọc báo là 2 hành động song song độc lập.",
        "trapNote": "Phân biệt với trường hợp một hành động đang diễn ra (QKTD) thì một hành động khác xen vào (QKĐ). Ở đây nấu ăn và đọc báo là 2 hành động song song độc lập.",
        "translation": "Trong khi mẹ tôi đang nấu bữa tối thì bố tôi _____ báo.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-6",
        "part": "PART_5",
        "questionText": "At 8 o'clock tomorrow evening, we _____ our final exam party.\nA. will celebrate\nB. are celebrating\nC. will be celebrating\nD. celebrate",
        "options": {
          "A": "will celebrate",
          "B": "are celebrating",
          "C": "will be celebrating",
          "D": "celebrate"
        },
        "correctAnswer": "C",
        "explanation": "Một mốc thời gian cụ thể (giờ giấc) đi kèm với thời gian trong tương lai báo hiệu một hành động sẽ đang diễn ra tại thời điểm đó -> Dùng thì Tương lai tiếp diễn (`will be + V-ing`). Chọn C. Nếu chỉ có 'tomorrow' thì chia Tương lai đơn, nhưng có giờ cụ thể 'at 8 o'clock tomorrow' thì phải chia Tương lai tiếp diễn.",
        "trapNote": "Nếu chỉ có 'tomorrow' thì chia Tương lai đơn, nhưng có giờ cụ thể 'at 8 o'clock tomorrow' thì phải chia Tương lai tiếp diễn.",
        "translation": "Vào lúc 8 giờ tối mai, chúng tôi _____ bữa tiệc kết thúc kỳ thi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-7",
        "part": "PART_5",
        "questionText": "When we arrived at the cinema, the movie _____.\nA. already started\nB. had already started\nC. was starting\nD. has already started",
        "options": {
          "A": "already started",
          "B": "had already started",
          "C": "was starting",
          "D": "has already started"
        },
        "correctAnswer": "B",
        "explanation": "Hành động bộ phim bắt đầu xảy ra trước hành động chúng tôi đến rạp chiếu phim (arrived là quá khứ đơn). Hành động xảy ra trước một hành động khác trong quá khứ phải chia thì Quá khứ hoàn thành (`had + V3/ed`). Chọn B. Không chia Hiện tại hoàn thành 'has already started' vì ngữ cảnh toàn câu đang ở quá khứ 'arrived'.",
        "trapNote": "Không chia Hiện tại hoàn thành 'has already started' vì ngữ cảnh toàn câu đang ở quá khứ 'arrived'.",
        "translation": "Khi chúng tôi đến rạp chiếu phim, bộ phim _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-8",
        "part": "PART_5",
        "questionText": "By the end of this year, Professor Johnson _____ at this university for 30 years.\nA. will teach\nB. will have taught\nC. is teaching\nD. has taught",
        "options": {
          "A": "will teach",
          "B": "will have taught",
          "C": "is teaching",
          "D": "has taught"
        },
        "correctAnswer": "B",
        "explanation": "'By + mốc thời gian tương lai' là dấu hiệu nhận biết đặc trưng của thì Tương lai hoàn thành (`will have + V3/ed`), diễn tả hành động sẽ hoàn tất tính đến một thời điểm trong tương lai. Chọn B. Nhớ công thức: By + quá khứ -> Had V3; By + tương lai -> Will have V3.",
        "trapNote": "Nhớ công thức: By + quá khứ -> Had V3; By + tương lai -> Will have V3.",
        "translation": "Tính đến cuối năm nay, Giáo sư Johnson _____ tại trường đại học này được 30 năm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-9",
        "part": "PART_5",
        "questionText": "I will give you a call as soon as I _____ the airport tomorrow.\nA. will reach\nB. reach\nC. reached\nD. am reaching",
        "options": {
          "A": "will reach",
          "B": "reach",
          "C": "reached",
          "D": "am reaching"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy kinh điển: Trong mệnh đề trạng ngữ chỉ thời gian (bắt đầu bằng When, As soon as, Until, By the time, Before, After), KHÔNG ĐƯỢC dùng thì tương lai (will). Dù có từ 'tomorrow', mệnh đề này bắt buộc phải chia ở thì Hiện tại đơn để diễn tả tương lai. Chủ ngữ 'I' đi với động từ nguyên thể 'reach'. Chọn B. Bẫy thấy chữ 'tomorrow' và vội vã chọn 'will reach'. Tuyệt đối không dùng 'will' ngay sau As soon as.",
        "trapNote": "Bẫy thấy chữ 'tomorrow' và vội vã chọn 'will reach'. Tuyệt đối không dùng 'will' ngay sau As soon as.",
        "translation": "Tôi sẽ gọi cho bạn ngay sau khi tôi _____ sân bay vào ngày mai.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-3-10",
        "part": "PART_5",
        "questionText": "This is the third time that Peter _____ his car keys this month.\nA. lost\nB. has lost\nC. is losing\nD. had lost",
        "options": {
          "A": "lost",
          "B": "has lost",
          "C": "is losing",
          "D": "had lost"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc quy tắc: 'It/This is the first / second / third... time + S + have/has + V3/ed'. Vì mệnh đề trước chia 'is' (hiện tại) nên mệnh đề sau phải dùng Hiện tại hoàn thành 'has lost'. (Nếu là 'It was the third time' thì mới dùng Quá khứ hoàn thành 'had lost'). Chọn B. Dễ nhầm chọn Quá khứ đơn 'lost' vì nghĩ việc làm mất chìa khóa đã xảy ra rồi.",
        "trapNote": "Dễ nhầm chọn Quá khứ đơn 'lost' vì nghĩ việc làm mất chìa khóa đã xảy ra rồi.",
        "translation": "Đây là lần thứ ba Peter _____ chìa khóa xe hơi trong tháng này.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-04",
    "code": "CD_04",
    "titleVi": "Chuyên đề 04: Sự Phối Hợp Thì",
    "titleEn": "Sequence of Tenses",
    "part": "Part 5 & 6",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Sự phối hợp thì (Sequence of Tenses) là quy tắc kết hợp các thì trong câu phức có mệnh đề chính và mệnh đề phụ. Nắm chắc chuyên đề này giúp thí sinh giải quyết 100% các câu hỏi kết hợp thì với liên từ thời gian (When, While, Since, Until, As soon as, By the time).",
    "formula": "### 1. Nguyên tắc chung về phối hợp thì:\n- **Nguyên tắc đồng thời gian:**\n  * Mệnh đề chính ở thì **Hiện tại** -> Mệnh đề phụ thường ở các thì **Hiện tại** hoặc **Tương lai**.\n  * Mệnh đề chính ở thì **Quá khứ** -> Mệnh đề phụ bắt buộc phải lùi về các thì **Quá khứ**.\n\n### 2. Các cấu trúc phối hợp thì với liên từ thời gian kinh điển:\n\n#### A. Với WHEN:\n1. Hành động đang xảy ra thì hành động khác cắt ngang trong quá khứ:\n   `When + S + V2/ed, S + was/were + V-ing`\n   *Ví dụ:* When I came, she was sleeping.\n2. Hai hành động liên tiếp nhau trong quá khứ:\n   `When + S + V2/ed, S + V2/ed`\n   *Ví dụ:* When the bell rang, the students left the room.\n3. Hành động đã hoàn thành trước khi hành động khác xảy ra trong quá khứ:\n   `When + S + V2/ed, S + had + V3/ed`\n   *Ví dụ:* When we arrived, the train had left.\n4. Hành động trong tương lai:\n   `When + S + V(hiện tại đơn), S + will + V`\n\n#### B. Với WHILE:\n- Hai hành động xảy ra song song đồng thời:\n  `While + S + was/were + V-ing, S + was/were + V-ing`\n  *Ví dụ:* While I was studying, my brother was playing games.\n\n#### C. Với AS SOON AS:\n- Hành động liên tiếp trong quá khứ:\n  `As soon as + S + V2/ed, S + V2/ed`\n- Hành động liên tiếp trong tương lai:\n  `As soon as + S + V(hiện tại đơn/hoàn thành), S + will + V`\n\n#### D. Với BY THE TIME:\n- Trong quá khứ:\n  `By the time + S + V2/ed, S + had + V3/ed`\n- Trong tương lai:\n  `By the time + S + V(hiện tại đơn), S + will have + V3/ed`\n\n#### E. Với SINCE:\n  `S + have/has + V3/ed + SINCE + S + V2/ed`\n\n#### F. Với UNTIL / TILL:\n  `S + will not + V + UNTIL + S + V(hiện tại đơn)` (Sẽ không làm gì cho đến khi...)",
    "signalWords": [
      "- Quan sát liên từ thời gian nối hai mệnh đề: `when`, `while`, `as soon as`, `by the time`, `since`, `until`, `before`, `after`.\n- Nhìn thì của mệnh đề đã cho sẵn:\n  * Nếu mệnh đề đã cho chia thì **Quá khứ** (came, arrived, was cooking) -> mệnh đề cần điền chắc chắn là một thì **Quá khứ** (loại ngay các đáp án hiện tại và tương lai: is, has, will).\n  * Nếu mệnh đề đã cho chia thì **Tương lai** (will call, will go) -> mệnh đề sau liên từ thời gian chia thì **Hiện tại đơn**."
    ],
    "traps": [
      "- **Bẫy dùng thì Tương lai sau liên từ chỉ thời gian:** Tuyệt đối không chọn 'will V' ngay sau when, as soon as, by the time, until, before, after.\n- **Bẫy đảo vị trí của By the time và Since:** Lưu ý mệnh đề đi liền ngay sau By the time luôn là mốc (QKĐ hoặc HTĐ), mệnh đề hoàn thành nằm ở vế còn lại."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo loại trừ siêu nhanh:**\n   - Đề bài cho 1 vế là Quá khứ -> Gạch ngay lập tức các đáp án có `will`, `is/are`, `have/has`.\n   - Đề bài có `Since` -> Trước Since là `have/has V3`, sau Since là `V2/ed`.\n   - Đề bài có `By the time + QKĐ` -> Vế còn lại chắc chắn là `had + V3`.\n   - Đề bài có `By the time + HTĐ` -> Vế còn lại chắc chắn là `will have + V3`.\n2. **Quy tắc cắt ngang vs Song song:**\n   - Cắt ngang: Hành động ngắn chia QKĐ, hành động dài chia QKTD.\n   - Song song (While): Cả 2 hành động cùng chia QKTD.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-4-1",
        "part": "PART_5",
        "questionText": "When the phone rang, Linda _____ a bath.\nA. is taking\nB. was taking\nC. takes\nD. will take",
        "options": {
          "A": "is taking",
          "B": "was taking",
          "C": "takes",
          "D": "will take"
        },
        "correctAnswer": "B",
        "explanation": "Hành động tắm đang diễn ra thì chuông điện thoại reo cắt ngang trong quá khứ. Hành động đang diễn ra chia Quá khứ tiếp diễn (`was/were + V-ing`). Chủ ngữ 'Linda' số ít -> 'was taking'. Chọn B. Loại ngay các phương án A, C, D vì 'rang' đã xác định thời gian quá khứ.",
        "trapNote": "Loại ngay các phương án A, C, D vì 'rang' đã xác định thời gian quá khứ.",
        "translation": "Khi điện thoại reo, Linda _____ tắm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-2",
        "part": "PART_5",
        "questionText": "We haven't seen each other since we _____ school.\nA. leave\nB. left\nC. have left\nD. had left",
        "options": {
          "A": "leave",
          "B": "left",
          "C": "have left",
          "D": "had left"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng công thức phối hợp thì kinh điển với SINCE: `S + have/has + V3/ed + since + S + V2/ed`. Sau 'since' là mốc thời gian bắt đầu hành động nên chia thì Quá khứ đơn 'left'. Chọn B. Nhiều bạn thấy 'since' liền chia cả hai vế ở Hiện tại hoàn thành là sai quy tắc.",
        "trapNote": "Nhiều bạn thấy 'since' liền chia cả hai vế ở Hiện tại hoàn thành là sai quy tắc.",
        "translation": "Chúng tôi đã không gặp nhau kể từ khi chúng tôi _____ trường.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-3",
        "part": "PART_5",
        "questionText": "I will wait here until she _____ back.\nA. comes\nB. will come\nC. came\nD. is coming",
        "options": {
          "A": "comes",
          "B": "will come",
          "C": "came",
          "D": "is coming"
        },
        "correctAnswer": "A",
        "explanation": "Sau liên từ chỉ thời gian 'until' không bao giờ dùng 'will'. Để phối hợp với thì tương lai đơn ở mệnh đề chính, mệnh đề phụ sau 'until' phải chia thì Hiện tại đơn. Chủ ngữ 'she' số ít -> 'comes'. Chọn A. Bẫy chọn 'will come' vì nghĩ hành động quay về chưa xảy ra.",
        "trapNote": "Bẫy chọn 'will come' vì nghĩ hành động quay về chưa xảy ra.",
        "translation": "Tôi sẽ đợi ở đây cho đến khi cô ấy _____ trở lại.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-4",
        "part": "PART_5",
        "questionText": "By the time we got to the party, all the guests _____ home.\nA. went\nB. have gone\nC. had gone\nD. were going",
        "options": {
          "A": "went",
          "B": "have gone",
          "C": "had gone",
          "D": "were going"
        },
        "correctAnswer": "C",
        "explanation": "Quy tắc phối hợp thì với By the time trong quá khứ: `By the time + S + V2/ed, S + had + V3/ed`. Hành động khách về xảy ra và hoàn tất trước lúc chúng tôi đến -> dùng Quá khứ hoàn thành 'had gone'. Chọn C. Loại ngay 'have gone' vì vế trước là 'got' (quá khứ).",
        "trapNote": "Loại ngay 'have gone' vì vế trước là 'got' (quá khứ).",
        "translation": "Vào thời điểm chúng tôi đến bữa tiệc, tất cả khách mời _____ về nhà.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-5",
        "part": "PART_5",
        "questionText": "While Jane _____ the piano, her sister was singing along.\nA. played\nB. was playing\nC. is playing\nD. has played",
        "options": {
          "A": "played",
          "B": "was playing",
          "C": "is playing",
          "D": "has played"
        },
        "correctAnswer": "B",
        "explanation": "Hai hành động chơi đàn và hát diễn ra song song cùng lúc trong quá khứ -> cả hai vế đều chia Quá khứ tiếp diễn. Chủ ngữ 'Jane' số ít -> 'was playing'. Chọn B. Tránh dùng Hiện tại tiếp diễn 'is playing' vì vế sau là 'was singing' (quá khứ).",
        "trapNote": "Tránh dùng Hiện tại tiếp diễn 'is playing' vì vế sau là 'was singing' (quá khứ).",
        "translation": "Trong khi Jane _____ đàn dương cầm thì em gái cô ấy đang hát theo.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-6",
        "part": "PART_5",
        "questionText": "As soon as the teacher entered the classroom, the students _____ talking.\nA. stop\nB. stopped\nC. had stopped\nD. will stop",
        "options": {
          "A": "stop",
          "B": "stopped",
          "C": "had stopped",
          "D": "will stop"
        },
        "correctAnswer": "B",
        "explanation": "'As soon as' diễn tả hai hành động xảy ra liền kề nhau ngay lập tức trong quá khứ (hành động này vừa dứt thì hành động kia tiếp nối ngay) -> Cả hai vế đều chia thì Quá khứ đơn (entered ... stopped). Chọn B. Không chia Quá khứ hoàn thành 'had stopped' vì hai hành động diễn ra nối tiếp chứ không có khoảng cách thời gian dài trước sau.",
        "trapNote": "Không chia Quá khứ hoàn thành 'had stopped' vì hai hành động diễn ra nối tiếp chứ không có khoảng cách thời gian dài trước sau.",
        "translation": "Ngay khi giáo viên bước vào lớp học, các học sinh _____ nói chuyện.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-7",
        "part": "PART_5",
        "questionText": "By the time the manager arrives next Monday, we _____ all the sales reports.\nA. finish\nB. will finish\nC. will have finished\nD. have finished",
        "options": {
          "A": "finish",
          "B": "will finish",
          "C": "will have finished",
          "D": "have finished"
        },
        "correctAnswer": "C",
        "explanation": "Quy tắc phối hợp thì với By the time trong tương lai: `By the time + S + V(hiện tại đơn), S + will have + V3/ed`. Hành động hoàn thành báo cáo sẽ hoàn tất trước khi giám đốc đến vào thứ Hai tới -> Dùng Tương lai hoàn thành. Chọn C. Phân biệt rạch ròi: By the time + V-qk -> Had V3; By the time + V-ht -> Will have V3.",
        "trapNote": "Phân biệt rạch ròi: By the time + V-qk -> Had V3; By the time + V-ht -> Will have V3.",
        "translation": "Trước khi người quản lý đến vào thứ Hai tới, chúng tôi _____ tất cả các báo cáo doanh số.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-8",
        "part": "PART_5",
        "questionText": "He told me that he _____ in London for ten years before moving to Paris.\nA. lived\nB. has lived\nC. had lived\nD. was living",
        "options": {
          "A": "lived",
          "B": "has lived",
          "C": "had lived",
          "D": "was living"
        },
        "correctAnswer": "C",
        "explanation": "Hành động sống ở Luân Đôn xảy ra và kéo dài 10 năm trước khi chuyển đến Paris trong quá khứ. Hành động xảy ra trước một mốc quá khứ khác phải chia thì Quá khứ hoàn thành (`had + V3/ed`). Chọn C. Mệnh đề chính là 'told' (quá khứ) nên loại ngay đáp án 'has lived'.",
        "trapNote": "Mệnh đề chính là 'told' (quá khứ) nên loại ngay đáp án 'has lived'.",
        "translation": "Anh ấy nói với tôi rằng anh ấy _____ ở Luân Đôn 10 năm trước khi chuyển sang Pa-ri.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-9",
        "part": "PART_5",
        "questionText": "Hardly had the match begun _____ it started to rain heavily.\nA. when\nB. than\nC. then\nD. after",
        "options": {
          "A": "when",
          "B": "than",
          "C": "then",
          "D": "after"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc tương quan phối hợp thì đảo ngữ: `Hardly / Scarcely + had + S + V3/ed + WHEN + S + V2/ed` (Vừa mới... thì...). Khác với `No sooner + had + S + V3/ed + THAN + S + V2/ed`. Vì câu bắt đầu bằng 'Hardly' nên từ nối bắt buộc là 'when'. Chọn A. Bẫy nhầm lẫn giữa cặp 'Hardly... when' và 'No sooner... than'.",
        "trapNote": "Bẫy nhầm lẫn giữa cặp 'Hardly... when' và 'No sooner... than'.",
        "translation": "Trận đấu vừa mới bắt đầu thì trời đổ mưa xối xả.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-4-10",
        "part": "PART_5",
        "questionText": "The scientist discovered that water _____ at 100 degrees Celsius.\nA. boiled\nB. boils\nC. was boiling\nD. had boiled",
        "options": {
          "A": "boiled",
          "B": "boils",
          "C": "was boiling",
          "D": "had boiled"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy lùi thì ngoại lệ kinh điển: Thông thường khi mệnh đề chính ở quá khứ ('discovered'), mệnh đề phụ phải lùi thì về quá khứ. TUY NHIÊN, nếu mệnh đề phụ diễn tả một chân lý, định luật tự nhiên hoặc sự thật hiển nhiên thì BẮT BUỘC giữ nguyên thì Hiện tại đơn, không được lùi thì. Nước sôi ở 100 độ C là chân lý muôn đời -> dùng 'boils'. Chọn B. Bẫy máy móc lùi thì theo 'discovered' mà chọn 'boiled' là mất điểm oan.",
        "trapNote": "Bẫy máy móc lùi thì theo 'discovered' mà chọn 'boiled' là mất điểm oan.",
        "translation": "Nhà khoa học đã phát hiện ra rằng nước _____ ở 100 độ C.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-05",
    "code": "CD_05",
    "titleVi": "Chuyên đề 05: Sự Hòa Hợp Giữa Chủ Ngữ Và Động Từ",
    "titleEn": "Subject - Verb Agreement",
    "part": "Part 5 & 6",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Sự hòa hợp giữa Chủ ngữ và Động từ là chuyên đề xuất hiện với tần suất cực cao (chiếm 2-4 câu trong đề thi THPT QG và ít nhất 5 câu trong Part 5 & 6 TOEIC). Quy tắc cốt lõi: Chủ ngữ số ít đi với động từ số ít, chủ ngữ số nhiều đi với động từ số nhiều, đi kèm hàng loạt cấu trúc bẫy đặc biệt.",
    "formula": "### 1. Quy tắc cơ bản:\n- Chủ ngữ số ít / Danh từ không đếm được -> Động từ chia **SỐ ÍT** (is, was, has, V-s/es).\n- Chủ ngữ số nhiều -> Động từ chia **SỐ NHIỀU** (are, were, have, V-bare).\n\n### 2. Các quy tắc đặc biệt bắt buộc chia ĐỘNG TỪ SỐ ÍT:\n1. **Đại từ bất định:** `Everyone, everybody, someone, somebody, anyone, anybody, no one, nobody, everything, something, anything, nothing` -> Chia **ĐỘNG TỪ SỐ ÍT**.\n   *Ví dụ:* Everyone *is* ready.\n2. **Cụm 'Each of / Every of / Neither of / Either of + N(số nhiều)':** -> Chia **ĐỘNG TỪ SỐ ÍT**.\n   *Ví dụ:* Each of the students *has* a textbook.\n3. **Danh động từ (V-ing) hoặc Mệnh đề danh từ làm chủ ngữ:** -> Chia **ĐỘNG TỪ SỐ ÍT**.\n   *Ví dụ:* Swimming *is* good for your health.\n4. **Khoảng cách, Thời gian, Tiền bạc, Đo lường:** -> Chia **ĐỘNG TỪ SỐ ÍT**.\n   *Ví dụ:* Ten miles *is* a long distance. Five hundred dollars *is* too expensive.\n5. **Tên môn học, bệnh tật, quốc gia tận cùng bằng 's':** -> Chia **ĐỘNG TỪ SỐ ÍT**.\n   * Môn học: physics, mathematics, economics, politics.\n   * Bệnh tật: measles (sởi), mumps (quai bị), rabies (dại).\n   * Tin tức: news.\n\n### 3. Các quy tắc chia theo Chủ ngữ 1 hoặc Chủ ngữ 2:\n- **Chia theo CHỦ NGỮ 1 (S1):** Khi 2 chủ ngữ nối với nhau bởi:\n  `with, along with, together with, as well as, accompanied by, in addition to`\n  `S1 + as well as / together with + S2 + V (chia theo S1)`\n  *Ví dụ:* The manager, as well as his employees, *is* attending the meeting.\n- **Chia theo CHỦ NGỮ 2 (S2 - Chủ ngữ gần động từ nhất):** Khi 2 chủ ngữ nối với nhau bởi:\n  `Either S1 or S2 + V (chia theo S2)`\n  `Neither S1 nor S2 + V (chia theo S2)`\n  `Not only S1 but also S2 + V (chia theo S2)`\n  *Ví dụ:* Neither the teacher nor the students *were* present.\n\n### 4. Phân biệt A number of vs The number of:\n- `A number of + N(số nhiều) + V (SỐ NHIỀU)` (= Many, mang nghĩa 'nhiều').\n  *Ví dụ:* A number of books *were* stolen.\n- `The number of + N(số nhiều) + V (SỐ ÍT)` (Mang nghĩa 'Số lượng...').\n  *Ví dụ:* The number of students *is* increasing.",
    "signalWords": [
      "- Tìm chủ ngữ thực sự của câu (loại bỏ các thành phần bổ ngữ, mệnh đề quan hệ chen giữa).\n- Nhìn liên từ nối:\n  * Thấy `as well as, along with, together with` -> Khoanh ngay chủ ngữ thứ nhất (S1).\n  * Thấy `either... or, neither... nor, not only... but also` -> Khoanh ngay chủ ngữ thứ hai sát động từ (S2).\n- Thấy đại từ bất định (`every-`, `some-`, `any-`, `no-`) -> Luôn chọn động từ số ít.\n- Thấy `The number of` -> Chọn động từ số ít; thấy `A number of` -> Chọn động từ số nhiều."
    ],
    "traps": [
      "- **Bẫy danh từ gần động từ:** Nhìn nhầm danh từ trong cụm giới từ chen giữa (vd: 'of these apples' có 'apples' số nhiều nhưng chủ ngữ thực sự là 'The quality' số ít).\n- **Bẫy The + Tính từ:** 'The rich' (người giàu nói chung), 'The poor' (người nghèo nói chung) luôn chia **ĐỘNG TỪ SỐ NHIỀU**."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú A number / The number:**\n   - *A number* -> **Ăn nhiều** (chia số nhiều).\n   - *The number* -> **Thèm ít** (chia số ít).\n2. **Thần chú cặp tương quan (Either...or, Neither...nor):** *Gần ai chia theo người nấy* (chia theo S2 ngay sát động từ).\n3. **Mẹo gạch bỏ râu ria:** Bỏ cụm giới từ chen giữa chủ ngữ và động từ:\n   *Ví dụ:* \"The quality [of these apples] **is** good.\" (Chủ ngữ là The quality chứ không phải apples!).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-5-1",
        "part": "PART_5",
        "questionText": "Everyone in the room _____ listening attentively to the lecture.\nA. is\nB. are\nC. were\nD. have been",
        "options": {
          "A": "is",
          "B": "are",
          "C": "were",
          "D": "have been"
        },
        "correctAnswer": "A",
        "explanation": "Theo quy tắc ngữ pháp, đại từ bất định 'Everyone' luôn đi với động từ số ít. Trong 4 đáp án chỉ có 'is' là động từ số ít. Chọn A. Dễ nghĩ 'mọi người' là số nhiều rồi chọn 'are' hoặc 'were'.",
        "trapNote": "Dễ nghĩ 'mọi người' là số nhiều rồi chọn 'are' hoặc 'were'.",
        "translation": "Mọi người trong phòng _____ chăm chú lắng nghe bài giảng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-2",
        "part": "PART_5",
        "questionText": "Physics _____ my favorite subject when I was at high school.\nA. were\nB. was\nC. are\nD. have been",
        "options": {
          "A": "were",
          "B": "was",
          "C": "are",
          "D": "have been"
        },
        "correctAnswer": "B",
        "explanation": "'Physics' là tên môn học tận cùng bằng chữ 's' nhưng luôn là danh từ số ít. Kết hợp với ngữ cảnh quá khứ 'when I was' -> Dùng 'was'. Chọn B. Bẫy thấy chữ 's' tận cùng tưởng danh từ số nhiều.",
        "trapNote": "Bẫy thấy chữ 's' tận cùng tưởng danh từ số nhiều.",
        "translation": "Vật lý _____ môn học yêu thích của tôi khi tôi còn học cấp ba.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-3",
        "part": "PART_5",
        "questionText": "Fifty kilometers _____ a long distance to travel by bicycle.\nA. is\nB. are\nC. were\nD. be",
        "options": {
          "A": "is",
          "B": "are",
          "C": "were",
          "D": "be"
        },
        "correctAnswer": "A",
        "explanation": "Khoảng cách (kilometers, miles), tiền bạc (dollars), thời gian (hours, minutes) được coi là một thể thống nhất nên luôn đi với động từ số ít 'is'. Chọn A. Dễ bị lừa bởi 'kilometers' có chữ 's' ở đuôi.",
        "trapNote": "Dễ bị lừa bởi 'kilometers' có chữ 's' ở đuôi.",
        "translation": "Năm mươi cây số _____ một quãng đường dài để đi bằng xe đạp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-4",
        "part": "PART_5",
        "questionText": "The manager, along with his assistants, _____ arriving on the next flight.\nA. is\nB. are\nC. were\nD. have been",
        "options": {
          "A": "is",
          "B": "are",
          "C": "were",
          "D": "have been"
        },
        "correctAnswer": "A",
        "explanation": "Khi hai chủ ngữ nối với nhau bởi 'along with', 'as well as', 'together with', động từ chia theo chủ ngữ thứ nhất (S1). S1 ở đây là 'The manager' (số ít) -> Động từ chia số ít 'is'. Chọn A. Bẫy nhìn thấy 'assistants' số nhiều ngay sát chỗ trống mà chọn 'are'.",
        "trapNote": "Bẫy nhìn thấy 'assistants' số nhiều ngay sát chỗ trống mà chọn 'are'.",
        "translation": "Người quản lý cùng với các trợ lý của mình _____ sẽ đến trong chuyến bay tiếp theo.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-5",
        "part": "PART_5",
        "questionText": "Neither the teacher nor the students _____ satisfied with the exam results.\nA. was\nB. were\nC. is\nD. has been",
        "options": {
          "A": "was",
          "B": "were",
          "C": "is",
          "D": "has been"
        },
        "correctAnswer": "B",
        "explanation": "Với cấu trúc 'Neither S1 nor S2', động từ chia theo chủ ngữ thứ hai (S2 - chủ ngữ gần động từ nhất). Ở đây S2 là 'the students' (danh từ số nhiều) -> Động từ chia số nhiều ở quá khứ là 'were'. Chọn B. Khác với 'along with', cấu trúc 'neither... nor' chia theo chủ ngữ S2 đứng sau.",
        "trapNote": "Khác với 'along with', cấu trúc 'neither... nor' chia theo chủ ngữ S2 đứng sau.",
        "translation": "Cả giáo viên lẫn các học sinh đều không _____ hài lòng với kết quả bài thi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-6",
        "part": "PART_5",
        "questionText": "The quality of these new smartphones _____ significantly improved.\nA. has\nB. have\nC. are\nD. were",
        "options": {
          "A": "has",
          "B": "have",
          "C": "are",
          "D": "were"
        },
        "correctAnswer": "A",
        "explanation": "Loại bỏ cụm giới từ 'of these new smartphones', chủ ngữ cốt lõi của câu là 'The quality' (danh từ số ít không đếm được). Do đó động từ phải chia ở dạng số ít 'has'. Chọn A. Học sinh nhìn vào từ 'smartphones' đứng ngay trước chỗ trống và nhầm tưởng chủ ngữ số nhiều.",
        "trapNote": "Học sinh nhìn vào từ 'smartphones' đứng ngay trước chỗ trống và nhầm tưởng chủ ngữ số nhiều.",
        "translation": "Chất lượng của những chiếc điện thoại thông minh mới này _____ được cải thiện đáng kể.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-7",
        "part": "PART_5",
        "questionText": "A number of applicants _____ already submitted their resumes for the position.\nA. has\nB. have\nC. is\nD. was",
        "options": {
          "A": "has",
          "B": "have",
          "C": "is",
          "D": "was"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng thần chú: 'A number of' mang nghĩa là 'Nhiều' (nhiều thì ăn nhiều) -> đi với ĐỘNG TỪ SỐ NHIỀU. Ở đây kết hợp với 'already submitted' (hoàn thành) -> dùng 'have'. Chọn B. Phân biệt với 'The number of' đi với động từ số ít.",
        "trapNote": "Phân biệt với 'The number of' đi với động từ số ít.",
        "translation": "Nhiều ứng viên _____ nộp hồ sơ xin việc cho vị trí này rồi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-8",
        "part": "PART_5",
        "questionText": "The number of endangered species _____ steadily over the last decade.\nA. has increased\nB. have increased\nC. are increasing\nD. increase",
        "options": {
          "A": "has increased",
          "B": "have increased",
          "C": "are increasing",
          "D": "increase"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc 'The number of + N(số nhiều)' mang nghĩa 'Số lượng của...' là một con số xác định -> ĐỘNG TỪ CHIA SỐ ÍT. Kết hợp với 'over the last decade' (Hiện tại hoàn thành) -> dùng 'has increased'. Chọn A. Bẫy lẫn lộn giữa 'The number of' (chia số ít) và 'A number of' (chia số nhiều).",
        "trapNote": "Bẫy lẫn lộn giữa 'The number of' (chia số ít) và 'A number of' (chia số nhiều).",
        "translation": "Số lượng các loài có nguy cơ tuyệt chủng _____ đều đặn trong thập kỷ qua.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-9",
        "part": "PART_5",
        "questionText": "The rich _____ not always happier than the poor, as wealth does not guarantee contentment.\nA. is\nB. was\nC. are\nD. has been",
        "options": {
          "A": "is",
          "B": "are",
          "C": "was",
          "D": "has been"
        },
        "correctAnswer": "B",
        "explanation": "Khi 'The' kết hợp với một tính từ (The rich, The poor, The blind, The elderly) sẽ biến thành danh từ tập hợp chỉ một tầng lớp người trong xã hội ở dạng SỐ NHIỀU -> Động từ bắt buộc chia ở dạng SỐ NHIỀU ('are'). Chọn B. Bẫy thấy 'rich' không có 's' nên tưởng số ít và chọn 'is'.",
        "trapNote": "Bẫy thấy 'rich' không có 's' nên tưởng số ít và chọn 'is'.",
        "translation": "Người giàu _____ không phải lúc nào cũng hạnh phúc hơn người nghèo, vì sự giàu có không đảm bảo sự mãn nguyện.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-5-10",
        "part": "PART_5",
        "questionText": "Each of the participants who _____ the workshop will receive a certificate.\nA. attends\nB. attend\nC. is attending\nD. was attended",
        "options": {
          "A": "attends",
          "B": "attend",
          "C": "is attending",
          "D": "was attended"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy cực kỳ tinh vi: Đại từ quan hệ 'who' thay thế cho danh từ đứng ngay trước nó là 'the participants' (số nhiều), nên động từ trong mệnh đề quan hệ phải chia số nhiều theo 'participants' -> dùng 'attend' (nguyên thể). Động từ chính của câu là 'will receive' đã đi với chủ ngữ 'Each'. Chọn B. Bẫy thấy 'Each of' ở đầu câu liền chia 'attends' số ít. Chú ý 'who' bổ nghĩa cho 'participants' chứ không bổ nghĩa cho 'Each'.",
        "trapNote": "Bẫy thấy 'Each of' ở đầu câu liền chia 'attends' số ít. Chú ý 'who' bổ nghĩa cho 'participants' chứ không bổ nghĩa cho 'Each'.",
        "translation": "Mỗi người trong số các học viên, những người mà _____ hội thảo, sẽ nhận được giấy chứng nhận.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-06",
    "code": "CD_06",
    "titleVi": "Chuyên đề 06: Động Từ Khuyết Thiếu",
    "titleEn": "Modal Verbs",
    "part": "Part 5 & 6",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Động từ khuyết thiếu (Modal Verbs) diễn tả khả năng, sự cho phép, nghĩa vụ, sự bắt buộc, lời khuyên và phỏng đoán. Trong đề thi THPT QG và TOEIC, các câu hỏi về Modal Verbs ở hiện tại và dạng hoàn thành (Modal Perfect: must have V3, should have V3) luôn xuất hiện đều đặn trong bài viết lại câu và chọn đáp án đúng.",
    "formula": "### 1. Đặc điểm chung của Động từ khuyết thiếu:\n- Luôn theo sau bởi động từ nguyên mẫu không 'to': `Modal Verb + V-bare`.\n- Không chia theo ngôi số ít (không thêm s/es), không có dạng V-ing hay V-ed.\n\n### 2. Các Động từ khuyết thiếu thường gặp:\n- **CAN / COULD:** Diễn tả khả năng ở hiện tại/quá khứ (`can` = hiện tại, `could` = quá khứ), xin phép hoặc yêu cầu lịch sự (`Could you please...?`).\n- **MAY / MIGHT:** Diễn tả khả năng có thể xảy ra nhưng không chắc chắn (khoảng 30-50%). `Might` có mức độ chắc chắn thấp hơn `May`.\n- **MUST / HAVE TO:**\n  * `Must`: Bắt buộc mang tính chủ quan (người nói tự cảm thấy cần thiết) hoặc quy định nghiêm ngặt. Phủ định `Mustn't` = CẤM.\n  * `Have to`: Bắt buộc mang tính khách quan (luật pháp, nội quy công ty, hoàn cảnh ép buộc). Phủ định `Don't have to / Needn't` = KHÔNG CẦN THIẾT.\n- **SHOULD / OUGHT TO:** Diễn tả lời khuyên, sự nên làm (= Had better).\n\n### 3. Động từ khuyết thiếu hoàn thành (Modal Perfect - Phỏng đoán trong quá khứ):\n- **MUST HAVE + V3/ed:** Chắc hẳn là đã (suy đoán chắc chắn 90% dựa trên bằng chứng quá khứ).\n  *Ví dụ:* The grass is wet. It *must have rained* last night.\n- **CAN'T / COULDN'T HAVE + V3/ed:** Chắc hẳn là đã không thể (suy đoán không thể xảy ra dựa trên bằng chứng quá khứ).\n  *Ví dụ:* He was with me all day. He *can't have stolen* your wallet.\n- **MAY / MIGHT HAVE + V3/ed:** Có lẽ là đã (suy đoán không chắc chắn trong quá khứ).\n- **SHOULD HAVE + V3/ed:** Lẽ ra nên làm gì trong quá khứ (nhưng thực tế đã không làm - bày tỏ sự tiếc nuối/trách móc).\n  *Ví dụ:* You *should have studied* harder for the exam. (Thực tế bạn đã không học chăm).\n- **NEEDN'T HAVE + V3/ed:** Lẽ ra không cần làm (nhưng thực tế đã làm rồi, gây lãng phí công sức).",
    "signalWords": [
      "- Dấu hiệu câu phỏng đoán: Nhìn ngữ cảnh hiện tại hay quá khứ.\n  * Có bằng chứng rõ ràng trong quá khứ -> Dùng `Must have V3` (chắc chắn có) hoặc `Can't have V3` (chắc chắn không).\n  * Diễn tả sự tiếc nuối, trách cứ trong quá khứ -> Dùng `Should have V3`.\n- Dấu hiệu từ cấm đoán: \"You are not allowed to...\", \"It is forbidden/prohibited...\" -> Dùng `MUSTN'T`.\n- Dấu hiệu không bắt buộc: \"It is not necessary...\", \"You don't need to...\" -> Dùng `NEEDN'T / DON'T HAVE TO`."
    ],
    "traps": [
      "- **Bẫy phủ định của Must:** Phủ định của `Must` (bắt buộc) khi viết lại câu không bắt buộc KHÔNG PHẢI là `Mustn't`, mà phải dùng `Don't have to` hoặc `Needn't`.\n- **Bẫy nhầm lẫn giữa Needn't have V3 và Didn't need to V:**\n  * `Needn't have V3`: Đã làm rồi (thừa thãi).\n  * `Didn't need to V`: Biết là không cần nên đã KHÔNG làm."
    ],
    "examples": [
      {
        "sentence": "1. **Phân biệt Mustn't vs Don't have to:**\n   - `Mustn't` = **CẤM** (tuyệt đối không được làm, vi phạm sẽ bị phạt).\n   - `Don't have to` = **KHÔNG CẦN** (tùy ý, làm cũng được không làm cũng không sao).\n2. **Thần chú Modal Perfect:**\n   - *Must have V3* = Chắc như đinh đóng cột (có vết tích/chứng cứ).\n   - *Should have V3* = Lẽ ra nên làm (tiếc nuối vì đã không làm).\n   - *Needn't have V3* = Làm thừa thãi (đã làm việc không cần thiết).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-6-1",
        "part": "PART_5",
        "questionText": "You _____ stop your vehicle when the traffic light turns red.\nA. must\nB. may\nC. can\nD. ought",
        "options": {
          "A": "must",
          "B": "may",
          "C": "can",
          "D": "ought"
        },
        "correctAnswer": "A",
        "explanation": "Dừng xe khi đèn đỏ là quy định bắt buộc của luật pháp -> Dùng 'must'. 'Ought' phải có 'to' nên loại. Chọn A. Ought luôn đi kèm 'to' (ought to V), ở đây không có 'to' nên loại ngay D.",
        "trapNote": "Ought luôn đi kèm 'to' (ought to V), ở đây không có 'to' nên loại ngay D.",
        "translation": "Bạn _____ dừng phương tiện lại khi đèn giao thông chuyển sang màu đỏ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-2",
        "part": "PART_5",
        "questionText": "You _____ smoke in the hospital. It is strictly prohibited.\nA. needn't\nB. shouldn't\nC. mustn't\nD. don't have to",
        "options": {
          "A": "needn't",
          "B": "shouldn't",
          "C": "mustn't",
          "D": "don't have to"
        },
        "correctAnswer": "C",
        "explanation": "Khi có từ khóa 'prohibited' (bị cấm) hoặc 'not allowed' (không được phép), ta dùng 'mustn't' để chỉ sự cấm đoán. Chọn C. Không chọn 'needn't' hay 'don't have to' vì chúng chỉ mang nghĩa 'không cần'.",
        "trapNote": "Không chọn 'needn't' hay 'don't have to' vì chúng chỉ mang nghĩa 'không cần'.",
        "translation": "Bạn _____ hút thuốc trong bệnh viện. Điều đó bị nghiêm cấm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-3",
        "part": "PART_5",
        "questionText": "Tomorrow is Sunday, so I _____ get up early.\nA. mustn't\nB. don't have to\nC. can't\nD. shouldn't",
        "options": {
          "A": "mustn't",
          "B": "don't have to",
          "C": "can't",
          "D": "shouldn't"
        },
        "correctAnswer": "B",
        "explanation": "Chủ nhật được nghỉ nên việc dậy sớm là không bắt buộc (thích dậy sớm hay muộn tùy ý) -> Dùng 'don't have to' (không cần thiết). Không thể dùng 'mustn't' vì không ai cấm bạn dậy sớm vào Chủ nhật. Chọn B. Dễ nhầm giữa 'mustn't' (cấm) và 'don't have to' (không bắt buộc).",
        "trapNote": "Dễ nhầm giữa 'mustn't' (cấm) và 'don't have to' (không bắt buộc).",
        "translation": "Ngày mai là Chủ nhật, vì vậy tôi _____ phải dậy sớm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-4",
        "part": "PART_5",
        "questionText": "The lights are still on in his office. He _____ working late tonight.\nA. must be\nB. can be\nC. should be\nD. will be",
        "options": {
          "A": "must be",
          "B": "can be",
          "C": "should be",
          "D": "will be"
        },
        "correctAnswer": "A",
        "explanation": "Có bằng chứng rõ ràng ở hiện tại để suy đoán một điều gần như chắc chắn xảy ra -> Dùng 'must be + V-ing' (chắc hẳn là đang làm gì). Chọn A. Phỏng đoán có căn cứ ở hiện tại dùng 'must', không dùng 'will' hay 'can'.",
        "trapNote": "Phỏng đoán có căn cứ ở hiện tại dùng 'must', không dùng 'will' hay 'can'.",
        "translation": "Đèn trong văn phòng anh ấy vẫn sáng. Anh ấy _____ đang làm việc muộn tối nay.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-5",
        "part": "PART_5",
        "questionText": "Take an umbrella with you. It _____ rain this afternoon, according to the forecast.\nA. must\nB. should\nC. might\nD. would",
        "options": {
          "A": "must",
          "B": "should",
          "C": "might",
          "D": "would"
        },
        "correctAnswer": "C",
        "explanation": "Thời tiết là khả năng có thể xảy ra nhưng không chắc chắn 100% -> Dùng 'might' hoặc 'may' để diễn tả khả năng không chắc chắn ở tương lai. Chọn C. Không dùng 'must' vì không ai dám chắc chắn 100% trời sẽ mưa.",
        "trapNote": "Không dùng 'must' vì không ai dám chắc chắn 100% trời sẽ mưa.",
        "translation": "Hãy mang theo ô đi. Trời _____ mưa chiều nay, theo dự báo thời tiết.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-6",
        "part": "PART_5",
        "questionText": "You _____ pay attention to the safety instructions before operating the machinery.\nA. ought\nB. had better\nC. would rather\nD. might",
        "options": {
          "A": "ought",
          "B": "had better",
          "C": "would rather",
          "D": "might"
        },
        "correctAnswer": "B",
        "explanation": "'Had better + V-bare' mang nghĩa 'tốt hơn hết là nên làm gì' để đưa ra lời khuyên khẩn thiết. 'Ought' thiếu 'to' (phải là ought to). 'Would rather' diễn tả sự ưa thích hơn. Do đó chọn B. Dễ nhầm 'ought' với 'had better' nếu không để ý 'ought' bắt buộc phải có 'to'.",
        "trapNote": "Dễ nhầm 'ought' với 'had better' nếu không để ý 'ought' bắt buộc phải có 'to'.",
        "translation": "Bạn _____ chú ý đến các hướng dẫn an toàn trước khi vận hành máy móc.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-7",
        "part": "PART_5",
        "questionText": "The ground is completely wet. It _____ heavily last night.\nA. must rain\nB. must have rained\nC. can have rained\nD. should have rained",
        "options": {
          "A": "must rain",
          "B": "must have rained",
          "C": "can have rained",
          "D": "should have rained"
        },
        "correctAnswer": "B",
        "explanation": "Phỏng đoán một hành động chắc chắn đã xảy ra trong quá khứ dựa trên bằng chứng cụ thể rõ ràng ở hiện tại -> Dùng `Must have + V3/ed`. Chọn B. Không chọn A vì 'last night' là thời gian trong quá khứ.",
        "trapNote": "Không chọn A vì 'last night' là thời gian trong quá khứ.",
        "translation": "Mặt đất ướt sũng. Đêm qua trời _____ mưa rất to.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-8",
        "part": "PART_5",
        "questionText": "I saw Jack in London yesterday afternoon, so he _____ the crime in New York at that time.\nA. mustn't commit\nB. can't have committed\nC. shouldn't have committed\nD. couldn't commit",
        "options": {
          "A": "mustn't commit",
          "B": "can't have committed",
          "C": "shouldn't have committed",
          "D": "couldn't commit"
        },
        "correctAnswer": "B",
        "explanation": "Suy đoán chắc chắn một việc KHÔNG THỂ xảy ra trong quá khứ vì có bằng chứng xác thực -> Dùng `Can't have + V3/ed` (hoặc `Couldn't have + V3/ed`). Chọn B. Tuyệt đối không dùng 'mustn't have V3' vì trong tiếng Anh không tồn tại cấu trúc này cho phỏng đoán phủ định.",
        "trapNote": "Tuyệt đối không dùng 'mustn't have V3' vì trong tiếng Anh không tồn tại cấu trúc này cho phỏng đoán phủ định.",
        "translation": "Hôm qua tôi vừa thấy Jack ở Luân Đôn, nên anh ấy _____ phạm tội ở Niu Oóc vào thời điểm đó.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-9",
        "part": "PART_5",
        "questionText": "You failed the final exam because you didn't revise properly. You _____ harder.\nA. must have studied\nB. should have studied\nC. needn't have studied\nD. might have studied",
        "options": {
          "A": "must have studied",
          "B": "should have studied",
          "C": "needn't have studied",
          "D": "might have studied"
        },
        "correctAnswer": "B",
        "explanation": "Diễn tả một việc lẽ ra NÊN làm trong quá khứ nhưng trên thực tế đã KHÔNG làm (bày tỏ sự hối tiếc hoặc khiển trách) -> Dùng `Should have + V3/ed`. Chọn B. Dễ nhầm với 'must have studied' (chắc hẳn đã học), nhưng vế trước nói rõ bạn bị trượt vì không ôn bài nên không thể là 'must have' được.",
        "trapNote": "Dễ nhầm với 'must have studied' (chắc hẳn đã học), nhưng vế trước nói rõ bạn bị trượt vì không ôn bài nên không thể là 'must have' được.",
        "translation": "Bạn bị trượt kỳ thi tốt nghiệp vì bạn không ôn tập cẩn thận. Lẽ ra bạn _____ chăm chỉ hơn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-6-10",
        "part": "PART_5",
        "questionText": "We bought way too much food for the party; half of it was thrown away. We _____ so much.\nA. needn't have bought\nB. didn't need to buy\nC. shouldn't buy\nD. mustn't have bought",
        "options": {
          "A": "needn't have bought",
          "B": "didn't need to buy",
          "C": "shouldn't buy",
          "D": "mustn't have bought"
        },
        "correctAnswer": "A",
        "explanation": "Phân biệt tinh tế: `Needn't have + V3/ed` dùng khi một hành động ĐÃ THỰC HIỆN trong quá khứ nhưng thực tế điều đó là KHÔNG CẦN THIẾT (gây lãng phí). Ngược lại `Didn't need to V` nghĩa là biết không cần nên ĐÃ KHÔNG LÀM. Ở đây họ đã mua thừa và vứt đi -> Chọn A. Bẫy siêu kinh điển phân biệt giữa 'needn't have V3' và 'didn't need to V'.",
        "trapNote": "Bẫy siêu kinh điển phân biệt giữa 'needn't have V3' và 'didn't need to V'.",
        "translation": "Chúng tôi đã mua quá nhiều đồ ăn cho bữa tiệc; một nửa trong số đó bị vứt bỏ. Lẽ ra chúng tôi _____ nhiều như vậy.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-07",
    "code": "CD_07",
    "titleVi": "Chuyên đề 07: Cụm Động Từ",
    "titleEn": "Phrasal Verbs",
    "part": "Part 6 & 7",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Cụm động từ (Phrasal Verbs = Verb + Preposition/Adverb) là chuyên đề cực kỳ quan trọng và phân loại thí sinh trong đề thi THPT QG và TOEIC. Nắm chắc các cụm động từ thường gặp giúp bạn ăn trọn 2-4 câu từ vựng ngữ pháp hóc búa.",
    "formula": "### 1. Bản chất của Cụm động từ:\nCụm động từ bao gồm một động từ kết hợp với một hoặc hai tiểu từ (giới từ hoặc phó từ). Nghĩa của cụm động từ thường hoàn toàn khác biệt so với nghĩa gốc của động từ đứng riêng lẻ.\n\n### 2. Các cụm động từ trọng điểm hay thi nhất:\n- **Nhóm LOOK:**\n  * `Look after`: Chăm sóc (= take care of).\n  * `Look for`: Tìm kiếm (= search for).\n  * `Look forward to + V-ing`: Mong chờ, trông đợi.\n  * `Look up`: Tra cứu (từ điển, thông tin) / Ngước nhìn lên.\n  * `Look down on`: Coi thường / Khinh miệt.\n  * `Look up to`: Kính trọng, ngưỡng mộ (= respect).\n  * `Look into`: Điều tra, nghiên cứu kỹ (= investigate).\n- **Nhóm TAKE:**\n  * `Take off`: Cất cánh (máy bay) / Cởi ra (quần áo, giày dép) / Thành công nhanh chóng.\n  * `Take care of`: Chăm sóc (= look after).\n  * `Take after`: Giống ai (về ngoại hình hoặc tính cách = resemble).\n  * `Take over`: Tiếp quản, đảm nhiệm.\n  * `Take up`: Bắt đầu một sở thích, thói quen / Chiếm (không gian, thời gian).\n- **Nhóm GIVE:**\n  * `Give up`: Từ bỏ, bỏ cuộc (= quit, stop).\n  * `Give in`: Nhượng bộ, đầu hàng.\n  * `Give off`: Tỏa ra, phát ra (mùi hương, khí thải, nhiệt).\n  * `Give away`: Tặng miễn phí / Tiết lộ bí mật.\n- **Nhóm PUT:**\n  * `Put off`: Trì hoãn (= postpone, delay).\n  * `Put out`: Dập tắt (ngọn lửa, thuốc lá = extinguish).\n  * `Put up with`: Chịu đựng (= tolerate).\n  * `Put on`: Mặc vào, đội vào / Tăng (cân).\n- **Nhóm TURN:**\n  * `Turn on / Turn off`: Bật / Tắt.\n  * `Turn up`: Xuất hiện, đến (= arrive) / Tăng âm lượng.\n  * `Turn down`: Từ chối (= reject, refuse) / Giảm âm lượng.\n  * `Turn into`: Biến đổi thành.\n- **Nhóm GO:**\n  * `Go on`: Tiếp tục (= continue).\n  * `Go off`: Reo (chuông báo thức) / Nổ (bom) / Thiu thối (thức ăn).\n  * `Go through`: Trải qua (giai đoạn khó khăn).\n- **Nhóm KHÁC:**\n  * `Run out of`: Hết, cạn kiệt.\n  * `Bring about`: Gây ra, mang lại (= cause).\n  * `Call off`: Hủy bỏ (= cancel).\n  * `Carry out`: Tiến hành, thực hiện (nghiên cứu, kế hoạch).",
    "signalWords": [
      "- Nhìn động từ đứng trước: Xác định các giới từ thường đi kèm (`look + after / up / forward to`).\n- Nhìn ngữ cảnh tân ngữ phía sau:\n  * Thấy tân ngữ là 'alarm' (chuông) hoặc 'bomb' (bom) -> Chọn `go off`.\n  * Thấy tân ngữ là 'fire' (lửa) hoặc 'cigarette' (thuốc lá) -> Chọn `put out`.\n  * Thấy tân ngữ là 'plane' (máy bay) -> Chọn `take off`.\n  * Thấy 'dictionary' (từ điển) -> Chọn `look up`.\n  * Thấy 'offer / invitation' (lời mời/đề nghị) bị từ chối -> Chọn `turn down`."
    ],
    "traps": [
      "- **Bẫy Look forward to + V-bare:** Nhiều bạn thấy chữ 'to' liền chọn V-bare, nhưng 'to' ở đây là giới từ nên BẮT BUỘC theo sau là **V-ing** (`look forward to meeting you`).\n- **Bẫy Go off:** 'Go off' có nhiều nghĩa: chuông reo, bom nổ, thức ăn thiu thối. Cần đọc kỹ ngữ cảnh."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo ghi nhớ theo cặp đối lập:**\n   - `Turn on` (bật) >< `Turn off` (tắt)\n   - `Put on` (mặc vào) >< `Take off` (cởi ra)\n   - `Look up to` (kính trọng) >< `Look down on` (coi thường)\n2. **Cụm 3 từ đặc biệt đi với V-ing:**\n   - `Look forward to + V-ing` (rất hay gặp trong TOEIC email cuối thư).\n3. **Mẹo phân biệt Call off vs Put off:**\n   - `Call off` = **Cancel** (HỦY HẲN không làm nữa).\n   - `Put off` = **Postpone** (HOÃN LẠI dời sang ngày khác).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-7-1",
        "part": "PART_5",
        "questionText": "Remember to _____ the lights before leaving the classroom.\nA. turn on\nB. turn off\nC. turn up\nD. turn down",
        "options": {
          "A": "turn on",
          "B": "turn off",
          "C": "turn up",
          "D": "turn down"
        },
        "correctAnswer": "B",
        "explanation": "Trước khi rời khỏi phòng thì hành động hợp lý và tiết kiệm điện là 'tắt đèn' -> 'turn off the lights'. Chọn B. Phân biệt 'turn on' (bật) và 'turn off' (tắt).",
        "trapNote": "Phân biệt 'turn on' (bật) và 'turn off' (tắt).",
        "translation": "Hãy nhớ _____ đèn trước khi rời khỏi lớp học.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-2",
        "part": "PART_5",
        "questionText": "Can you please _____ my cat while I am on vacation?\nA. look after\nB. look for\nC. look at\nD. look up",
        "options": {
          "A": "look after",
          "B": "look for",
          "C": "look at",
          "D": "look up"
        },
        "correctAnswer": "A",
        "explanation": "Khi đi vắng cần nhờ người khác trông nom, chăm sóc thú cưng -> Dùng cụm 'look after' (= take care of). Chọn A. 'Look for' là đi tìm vật bị mất, ở đây con mèo không bị mất mà cần chăm sóc.",
        "trapNote": "'Look for' là đi tìm vật bị mất, ở đây con mèo không bị mất mà cần chăm sóc.",
        "translation": "Bạn có thể _____ con mèo của tôi trong khi tôi đi nghỉ mát được không?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-3",
        "part": "PART_5",
        "questionText": "If you don't know the meaning of this word, you can _____ in the dictionary.\nA. look it up\nB. look after it\nC. look it for\nD. look at it",
        "options": {
          "A": "look it up",
          "B": "look after it",
          "C": "look it for",
          "D": "look at it"
        },
        "correctAnswer": "A",
        "explanation": "Tra cứu thông tin hoặc từ vựng trong sách/từ điển dùng cụm 'look up'. Khi tân ngữ là đại từ 'it', đại từ bắt buộc phải đứng giữa động từ và phó từ: 'look it up'. Chọn A. Đại từ 'it, them' bắt buộc đứng giữa cụm động từ tách rời: 'look it up', không nói 'look up it'.",
        "trapNote": "Đại từ 'it, them' bắt buộc đứng giữa cụm động từ tách rời: 'look it up', không nói 'look up it'.",
        "translation": "Nếu bạn không biết nghĩa của từ này, bạn có thể _____ trong từ điển.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-4",
        "part": "PART_5",
        "questionText": "The flight was delayed, so the plane couldn't _____ on schedule.\nA. take over\nB. take off\nC. take after\nD. take up",
        "options": {
          "A": "take over",
          "B": "take off",
          "C": "take after",
          "D": "take up"
        },
        "correctAnswer": "B",
        "explanation": "Đối với máy bay, hành động rời mặt đất bay lên bầu trời là 'take off' (cất cánh). Chọn B. 'Take after' nghĩa là giống bố mẹ về tính cách/ngoại hình, không dùng cho máy bay.",
        "trapNote": "'Take after' nghĩa là giống bố mẹ về tính cách/ngoại hình, không dùng cho máy bay.",
        "translation": "Chuyến bay đã bị hoãn, vì vậy máy bay không thể _____ đúng lịch trình.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-5",
        "part": "PART_5",
        "questionText": "The outdoor concert was _____ because of the torrential rain.\nA. put off\nB. called off\nC. turned down\nD. given away",
        "options": {
          "A": "put off",
          "B": "called off",
          "C": "turned down",
          "D": "given away"
        },
        "correctAnswer": "B",
        "explanation": "'Call off' mang nghĩa hủy bỏ hoàn toàn một sự kiện (= cancel). Trong các đề thi chuẩn, hủy sự kiện do thiên tai/mưa bão dùng 'call off'. Chọn B. Phân biệt 'call off' (hủy bỏ = cancel) và 'put off' (hoãn lại dời lịch = postpone).",
        "trapNote": "Phân biệt 'call off' (hủy bỏ = cancel) và 'put off' (hoãn lại dời lịch = postpone).",
        "translation": "Buổi hòa nhạc ngoài trời đã bị _____ vì cơn mưa xối xả.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-6",
        "part": "PART_5",
        "questionText": "My morning alarm clock usually _____ at 6:00 AM every weekday.\nA. goes off\nB. goes on\nC. goes out\nD. goes through",
        "options": {
          "A": "goes off",
          "B": "goes on",
          "C": "goes out",
          "D": "goes through"
        },
        "correctAnswer": "A",
        "explanation": "Cụm động từ 'go off' khi đi với chuông báo thức, súng hoặc bom mang nghĩa là 'reo chuông / phát nổ'. Chọn A. 'Go on' là tiếp tục, không dùng cho chuông báo thức.",
        "trapNote": "'Go on' là tiếp tục, không dùng cho chuông báo thức.",
        "translation": "Đồng hồ báo thức buổi sáng của tôi thường _____ lúc 6:00 sáng mỗi ngày trong tuần.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-7",
        "part": "PART_5",
        "questionText": "She received a great job offer from Microsoft, but she had to _____ it because of family reasons.\nA. turn down\nB. turn off\nC. turn up\nD. turn into",
        "options": {
          "A": "turn down",
          "B": "turn off",
          "C": "turn up",
          "D": "turn into"
        },
        "correctAnswer": "A",
        "explanation": "Từ chối một lời đề nghị, lời mời làm việc dùng cụm động từ 'turn down' (= refuse, reject). Chọn A. 'Turn down' ngoài nghĩa giảm âm lượng còn mang nghĩa rất phổ biến là 'từ chối'.",
        "trapNote": "'Turn down' ngoài nghĩa giảm âm lượng còn mang nghĩa rất phổ biến là 'từ chối'.",
        "translation": "Cô ấy nhận được lời mời làm việc tuyệt vời từ Microsoft, nhưng cô ấy phải _____ nó vì lý do gia đình.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-8",
        "part": "PART_5",
        "questionText": "I really _____ seeing you and discussing the new project at the upcoming conference.\nA. look forward to\nB. look up to\nC. look down on\nD. look into",
        "options": {
          "A": "look forward to",
          "B": "look up to",
          "C": "look down on",
          "D": "look into"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc 'look forward to + V-ing' nghĩa là háo hức mong đợi điều gì trong tương lai. Chọn A. 'Look up to' là kính trọng người lớn/người có chuyên môn, không đi với 'seeing you' trong ngữ cảnh này.",
        "trapNote": "'Look up to' là kính trọng người lớn/người có chuyên môn, không đi với 'seeing you' trong ngữ cảnh này.",
        "translation": "Tôi thực sự _____ được gặp bạn và thảo luận về dự án mới tại hội nghị sắp tới.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-9",
        "part": "PART_5",
        "questionText": "I can no longer _____ his rude and selfish behavior; I am going to end this friendship.\nA. put up with\nB. come up with\nC. keep up with\nD. catch up with",
        "options": {
          "A": "put up with",
          "B": "come up with",
          "C": "keep up with",
          "D": "catch up with"
        },
        "correctAnswer": "A",
        "explanation": "Đối diện với hành vi xấu của người khác đến mức không thể tiếp tục chấp nhận -> dùng cụm 'put up with' (= tolerate, chịu đựng). 'Come up with' là nghĩ ra ý tưởng. 'Keep up with' là theo kịp tốc độ. Chọn A. Bốn cụm động từ 3 từ có đuôi '-up with' rất dễ gây hoa mắt nếu không nắm chắc nghĩa gốc.",
        "trapNote": "Bốn cụm động từ 3 từ có đuôi '-up with' rất dễ gây hoa mắt nếu không nắm chắc nghĩa gốc.",
        "translation": "Tôi không thể _____ hành vi thô lỗ và ích kỷ của anh ta được nữa; tôi sẽ chấm dứt tình bạn này.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-7-10",
        "part": "PART_5",
        "questionText": "The scientific committee decided to _____ a comprehensive survey to evaluate the environmental impact.\nA. carry on\nB. carry out\nC. carry away\nD. carry through",
        "options": {
          "A": "carry on",
          "B": "carry out",
          "C": "carry away",
          "D": "carry through"
        },
        "correctAnswer": "B",
        "explanation": "Cụm 'carry out' chuyên đi với các từ: survey (khảo sát), research (nghiên cứu), experiment (thí nghiệm), investigation (điều tra) với nghĩa là 'tiến hành, thực hiện' (= conduct). Chọn B. 'Carry on' là tiếp tục làm gì đó (= keep on V-ing), không dùng với tân ngữ survey/research.",
        "trapNote": "'Carry on' là tiếp tục làm gì đó (= keep on V-ing), không dùng với tân ngữ survey/research.",
        "translation": "Ủy ban khoa học đã quyết định _____ một cuộc khảo sát toàn diện để đánh giá tác động môi trường.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-08",
    "code": "CD_08",
    "titleVi": "Chuyên đề 08: Thức Giả Định",
    "titleEn": "The Subjunctive Mood",
    "part": "Part 6 & 7",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Thức giả định (Subjunctive Mood / Câu cầu khiến giả định) là cấu trúc ngữ pháp trang trọng, xuất hiện liên tục trong đề thi THPT QG và phần Reading TOEIC (văn bản công văn, thông báo nội bộ, hợp đồng). Điểm mấu chốt là động từ ở mệnh đề 'that' luôn ở dạng NGUYÊN THỂ KHÔNG TO (V-bare).",
    "formula": "### 1. Thức giả định với Động từ:\nKhi các động từ chỉ yêu cầu, đề nghị, khuyên nhủ, bắt buộc đứng ở mệnh đề chính:\n`S1 + Verb + that + S2 + (should) + V-bare`\n- **Các động từ bắt buộc nhớ:**\n  * `suggest, recommend` (đề nghị)\n  * `demand, require, request` (yêu cầu)\n  * `insist` (khăng khăng, đòi hỏi)\n  * `order, command` (ra lệnh)\n  * `advise, propose` (khuyên bảo, đề xuất)\n- **Đặc điểm sống còn:** Dù chủ ngữ S2 là số ít (he, she, it, Peter), động từ theo sau VẪN GIỮ NGUYÊN MẪU KHÔNG CHIA, KHÔNG THÊM S/ES!\n  *Ví dụ:* The doctor suggested that he *take* (không phải takes) a rest.\n- **Dạng phủ định:** `that + S2 + (should) + NOT + V-bare` (không mượn do/does/did).\n- **Dạng bị động:** `that + S2 + (should) + BE + V3/ed`.\n  *Ví dụ:* She insisted that the report *be submitted* on time.\n\n### 2. Thức giả định với Tính từ (Cấu trúc giả định giả):\n`It is / was + Adjective + that + S + (should) + V-bare`\n- **Các tính từ quan trọng:**\n  * `important, essential, necessary, vital, crucial` (quan trọng, thiết yếu)\n  * `urgent, imperative` (khẩn cấp, cấp bách)\n  * `mandatory, compulsory` (bắt buộc)\n  * `advisable, recommended` (nên làm)\n  *Ví dụ:* It is essential that every student *wear* uniform.\n\n### 3. Thức giả định với IT'S TIME / IT'S HIGH TIME:\n- `It's time / It's high time + S + V2/ed` (Đã đến lúc ai đó phải làm gì - mang hàm ý muộn màng).\n  *Ví dụ:* It is high time you *went* to bed. (Đã đến lúc bạn phải đi ngủ rồi).\n- So sánh: `It's time (for sb) to V` (Đến giờ làm gì - trung tính).\n\n### 4. Thức giả định với WOULD RATHER (2 chủ ngữ):\n- Trái với hiện tại: `S1 + would rather that + S2 + V2/ed` (giả định ở hiện tại).\n  *Ví dụ:* I would rather you *stayed* home today.\n- Trái với quá khứ: `S1 + would rather that + S2 + had + V3/ed` (giả định ở quá khứ).",
    "signalWords": [
      "- Nhìn thấy các động từ: `suggest, recommend, demand, insist, require, order + that`.\n- Nhìn thấy cấu trúc: `It is necessary / important / essential / vital / imperative + that`.\n- Nhìn thấy: `It's high time / It's time + S...` -> tìm ngay động từ dạng quá khứ đơn (`V2/ed`).\n- Nhìn thấy: `S1 + would rather that + S2...` -> tìm ngay `V2/ed` (hiện tại) hoặc `had V3` (quá khứ)."
    ],
    "traps": [
      "- **Bẫy thêm -s/es:** Đề thi cố tình cho S2 là danh từ số ít (John, the manager, she) để bẫy thí sinh chia V-s/es. Nhớ: Thức giả định luôn là **V-bare**.\n- **Bẫy thì của 'It is high time':** Sau 'It is high time + S', động từ phải lùi về thì **Quá khứ đơn (V2/ed)** chứ không dùng thì hiện tại đơn."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo V-bare bất tử:**\n   - Cứ thấy `suggest that`, `insist that`, `It is essential that` -> Đáp án chắc chắn là **ĐỘNG TỪ NGUYÊN THỂ** (V-bare) hoặc **be + V3/ed** (nếu bị động). Bỏ qua hoàn toàn chủ ngữ số ít hay số nhiều!\n2. **Mẹo phủ định không mượn trợ động từ:**\n   - Dạng phủ định là `not + V-bare`, tuyệt đối không chọn `doesn't V` hay `didn't V`.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-8-1",
        "part": "PART_5",
        "questionText": "The doctor recommended that Peter _____ more fresh vegetables and fruits.\nA. eats\nB. eat\nC. ate\nD. eating",
        "options": {
          "A": "eats",
          "B": "eat",
          "C": "ate",
          "D": "eating"
        },
        "correctAnswer": "B",
        "explanation": "Theo quy tắc thức giả định: `S + recommend + that + S + V-bare`. Dù chủ ngữ 'Peter' là ngôi thứ ba số ít, động từ theo sau bắt buộc phải ở dạng nguyên thể không chia -> chọn 'eat'. Chọn B. Bẫy thấy 'Peter' số ít liền chọn 'eats' (thêm s).",
        "trapNote": "Bẫy thấy 'Peter' số ít liền chọn 'eats' (thêm s).",
        "translation": "Bác sĩ khuyến nghị rằng Peter _____ nhiều rau quả tươi hơn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-2",
        "part": "PART_5",
        "questionText": "It is essential that every applicant _____ the application form by Friday.\nA. submits\nB. submit\nC. submitted\nD. submitting",
        "options": {
          "A": "submits",
          "B": "submit",
          "C": "submitted",
          "D": "submitting"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc: `It is essential that + S + (should) + V-bare`. Động từ giữ nguyên mẫu không chia là 'submit'. Chọn B. Chủ ngữ 'every applicant' là số ít nhưng do có 'essential that' nên động từ không thêm 's'.",
        "trapNote": "Chủ ngữ 'every applicant' là số ít nhưng do có 'essential that' nên động từ không thêm 's'.",
        "translation": "Điều thiết yếu là mọi ứng viên _____ đơn ứng tuyển trước thứ Sáu.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-3",
        "part": "PART_5",
        "questionText": "It is high time you _____ looking for a steady job.\nA. start\nB. started\nC. starting\nD. have started",
        "options": {
          "A": "start",
          "B": "started",
          "C": "starting",
          "D": "have started"
        },
        "correctAnswer": "B",
        "explanation": "Công thức cố định: `It is high time / It's time + S + V2/ed` (diễn tả hành động lẽ ra đã phải làm từ trước). Động từ lùi về thì Quá khứ đơn 'started'. Chọn B. Dễ chọn hiện tại đơn 'start' vì nghĩ câu nói ở thời điểm hiện tại.",
        "trapNote": "Dễ chọn hiện tại đơn 'start' vì nghĩ câu nói ở thời điểm hiện tại.",
        "translation": "Đã đến lúc bạn _____ tìm kiếm một công việc ổn định rồi đấy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-4",
        "part": "PART_5",
        "questionText": "The manager insisted that the confidential documents _____ strictly protected.\nA. are\nB. be\nC. were\nD. being",
        "options": {
          "A": "are",
          "B": "be",
          "C": "were",
          "D": "being"
        },
        "correctAnswer": "B",
        "explanation": "Thức giả định ở thể bị động: `S + insist + that + S + (should) + BE + V3/ed`. Trợ động từ 'to be' phải ở dạng nguyên mẫu không chia là 'be'. Chọn B. Học sinh thường chia theo chủ ngữ số nhiều 'documents' thành 'are' hoặc 'were'.",
        "trapNote": "Học sinh thường chia theo chủ ngữ số nhiều 'documents' thành 'are' hoặc 'were'.",
        "translation": "Người quản lý khăng khăng đòi hỏi các tài liệu mật _____ được bảo mật nghiêm ngặt.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-5",
        "part": "PART_5",
        "questionText": "The board requested that the director _____ a public statement about the incident.\nA. make\nB. makes\nC. made\nD. to make",
        "options": {
          "A": "make",
          "B": "makes",
          "C": "made",
          "D": "to make"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc: `S + request + that + S + V-bare`. Động từ nguyên thể là 'make'. Chọn A. Dễ nhầm cấu trúc `request sb to V` với `request that + S + V-bare`.",
        "trapNote": "Dễ nhầm cấu trúc `request sb to V` với `request that + S + V-bare`.",
        "translation": "Hội đồng quản trị yêu cầu giám đốc _____ một tuyên bố công khai về sự việc.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-6",
        "part": "PART_5",
        "questionText": "It is imperative that this patient _____ immediate medical attention.\nA. receives\nB. receive\nC. received\nD. receiving",
        "options": {
          "A": "receives",
          "B": "receive",
          "C": "received",
          "D": "receiving"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc: `It is imperative that + S + V-bare`. Động từ nguyên thể giữ nguyên là 'receive'. Chọn B. 'Patient' là danh từ số ít nhưng động từ không được chia 'receives'.",
        "trapNote": "'Patient' là danh từ số ít nhưng động từ không được chia 'receives'.",
        "translation": "Điều cấp bách là bệnh nhân này _____ sự chăm sóc y tế ngay lập tức.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-7",
        "part": "PART_5",
        "questionText": "The committee demanded that the policy _____ without delay.\nA. be revised\nB. is revised\nC. was revised\nD. revise",
        "options": {
          "A": "be revised",
          "B": "is revised",
          "C": "was revised",
          "D": "revise"
        },
        "correctAnswer": "A",
        "explanation": "Chính sách không thể tự sửa đổi mà phải 'được sửa đổi' -> Thể bị động giả định: `demand that + S + BE + V3/ed`. Chọn 'be revised'. Chọn A. Vừa phải nhận biết thức giả định, vừa phải xác định thể bị động.",
        "trapNote": "Vừa phải nhận biết thức giả định, vừa phải xác định thể bị động.",
        "translation": "Ủy ban yêu cầu chính sách này _____ không chậm trễ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-8",
        "part": "PART_5",
        "questionText": "The teacher suggested that Mary _____ computer games until her homework is finished.\nA. not play\nB. doesn't play\nC. didn't play\nD. plays not",
        "options": {
          "A": "not play",
          "B": "doesn't play",
          "C": "didn't play",
          "D": "plays not"
        },
        "correctAnswer": "A",
        "explanation": "Trong thức giả định, thể phủ định được cấu tạo trực tiếp bằng: `not + V-bare`, TUYỆT ĐỐI KHÔNG mượn trợ động từ (không dùng doesn't / didn't). Do đó đáp án chuẩn xác là 'not play'. Chọn A. Bẫy thí sinh có thói quen mượn trợ động từ 'doesn't play' cho chủ ngữ Mary.",
        "trapNote": "Bẫy thí sinh có thói quen mượn trợ động từ 'doesn't play' cho chủ ngữ Mary.",
        "translation": "Giáo viên đề nghị Mary _____ trò chơi điện tử cho đến khi bài tập về nhà được hoàn thành.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-9",
        "part": "PART_5",
        "questionText": "I would rather you _____ all your money on that expensive luxury car yesterday.\nA. didn't spend\nB. hadn't spent\nC. not spend\nD. don't spend",
        "options": {
          "A": "didn't spend",
          "B": "hadn't spent",
          "C": "not spend",
          "D": "don't spend"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc `S1 + would rather that + S2`: Nếu giả định trái ngược với quá khứ (có 'yesterday'), động từ phải lùi về thì Quá khứ hoàn thành (`had + V3/ed` hoặc `hadn't + V3/ed`). Chọn B. Nếu không có 'yesterday' thì dùng 'didn't spend' (trái với hiện tại). Vì có 'yesterday' nên bắt buộc phải dùng 'hadn't spent' (trái với quá khứ).",
        "trapNote": "Nếu không có 'yesterday' thì dùng 'didn't spend' (trái với hiện tại). Vì có 'yesterday' nên bắt buộc phải dùng 'hadn't spent' (trái với quá khứ).",
        "translation": "Tôi thà rằng bạn _____ toàn bộ tiền vào chiếc xe sang trọng đắt đỏ đó vào ngày hôm qua.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-8-10",
        "part": "PART_5",
        "questionText": "He insists that he _____ innocent of all the charges brought against him.\nA. be\nB. is\nC. were\nD. should be",
        "options": {
          "A": "be",
          "B": "is",
          "C": "were",
          "D": "should be"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy ngữ nghĩa cực kỳ tinh quái: Khi 'insist' mang nghĩa 'đòi hỏi/yêu cầu ai làm gì' thì mới dùng giả định (V-bare). Nhưng ở đây 'insist' mang nghĩa 'khăng khăng khẳng định một sự thật' (tôi vô tội) thì động từ chia thì bình thường theo thì hiện tại: 'he is innocent'. Chọn B. Cực kỳ nhiều học sinh cứ thấy chữ 'insist that' là nhắm mắt chọn 'be' mà không đọc hiểu nghĩa câu.",
        "trapNote": "Cực kỳ nhiều học sinh cứ thấy chữ 'insist that' là nhắm mắt chọn 'be' mà không đọc hiểu nghĩa câu.",
        "translation": "Anh ta khăng khăng khẳng định rằng mình _____ vô tội trước mọi cáo buộc chống lại anh ta.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-09",
    "code": "CD_09",
    "titleVi": "Chuyên đề 09: Danh Động Từ Và Động Từ Nguyên Mẫu",
    "titleEn": "Gerunds and Infinitives",
    "part": "Part 5 & 6",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Chuyên đề Gerunds (V-ing) and Infinitives (To-V / V-bare) kiểm tra việc lựa chọn dạng đúng của động từ đi kèm phía sau. Đây là dạng bài xuất hiện bắt buộc từ 2-3 câu trong Part 5 TOEIC và đề thi THPT QG.",
    "formula": "### 1. Danh động từ (Gerund - V-ing):\n- **Đóng vai trò làm Chủ ngữ hoặc Tân ngữ trong câu:**\n  * *Ví dụ:* `Swimming is my passion.` / `I enjoy swimming.`\n- **Luôn đứng sau Giới từ:** `in, on, at, about, for, of, with, without, before, after...`\n  * *Ví dụ:* Thank you for *helping* me.\n- **Theo sau các Động từ chuyên đi với V-ing:**\n  * `admit, avoid, appreciate, consider, delay, deny, discuss, dislike, enjoy, finish, imagine, keep, mind, postpone, practice, quit, recommend, resist, risk, suggest`.\n- **Theo sau các Cụm từ cố định đặc biệt:**\n  * `can't help / can't stand / can't bear + V-ing` (không thể nhịn được / không thể chịu đựng được).\n  * `it's no use / it's no good + V-ing` (vô ích khi làm gì).\n  * `be worth + V-ing` (đáng để làm gì).\n  * `busy + V-ing` (bận rộn làm gì).\n  * `spend / waste + time/money + V-ing`.\n\n### 2. Động từ nguyên mẫu có 'To' (To-Infinitive):\n- **Chỉ mục đích hành động:** `I study hard to pass the exam.`\n- **Sau Tính từ diễn tả cảm xúc / tính chất:** `S + be + Adj + to-V` (happy, glad, easy, difficult, surprised).\n- **Theo sau các Động từ chuyên đi với To-V:**\n  * `afford, agree, appear, arrange, decide, demand, fail, hesitate, hope, learn, manage, offer, plan, prepare, promise, refuse, seem, tend, threaten, want, wish`.\n- **Cấu trúc: `Verb + Object + To-V`:**\n  * `allow, enable, encourage, expect, invite, order, remind, teach, tell, warn sb to V`.\n\n### 3. Động từ nguyên mẫu không 'To' (Bare Infinitive - V-bare):\n- Sau Động từ khuyết thiếu: `can, could, may, might, must, should + V-bare`.\n- Sau động từ sai bảo, nhờ vả: `make sb do sth` (bắt ai làm gì), `let sb do sth` (cho phép ai làm gì).\n- Sau động từ tri giác (nhìn thấy/nghe thấy toàn bộ hành động): `see, hear, watch, notice + O + V-bare`.\n\n### 4. Các Động từ đi được với cả V-ING và TO-V nhưng ĐỔI NGHĨA:\n- **REMEMBER / FORGET / REGRET:**\n  * `+ TO-V`: Nhớ / quên / tiếc phải làm việc gì (ở hiện tại hoặc tương lai).\n  * `+ V-ING`: Nhớ / quên / hối tiếc đã làm việc gì (trong quá khứ).\n- **STOP:**\n  * `Stop + TO-V`: Dừng lại để làm việc khác.\n  * `Stop + V-ING`: Dừng hẳn, bỏ hẳn việc đang làm.\n- **TRY:**\n  * `Try + TO-V`: Cố gắng, nỗ lực làm gì.\n  * `Try + V-ING`: Thử làm việc gì xem hiệu quả ra sao.\n- **NEED:**\n  * `Chủ động:` `S(người) + need + to-V`\n  * `Bị động:` `S(vật) + need + V-ing` (= need to be V3).\n    *Ví dụ:* My car needs *washing* (= needs to be washed).",
    "signalWords": [
      "- Nhìn ngay động từ đứng liền trước chỗ trống (thuộc nhóm đi với V-ing hay To-V).\n- Nếu đứng sau giới từ (in, on, at, by, without, instead of) -> Chọn ngay **V-ing**.\n- Nếu câu có các từ: `remember, forget, regret, stop, try` -> Dịch nghĩa xem hành động đã xảy ra (quá khứ -> V-ing) hay chuẩn bị làm (tương lai -> To-V).\n- Nếu chủ ngữ là vật đi với `need` -> Chọn **V-ing** (bị động)."
    ],
    "traps": [
      "- **Bẫy chữ TO là giới từ:** Bình thường sau 'to' là V-bare, nhưng trong các cụm sau 'to' là giới từ nên theo sau là **V-ing**:\n  * `look forward to + V-ing`\n  * `be/get used to + V-ing`\n  * `object to + V-ing` (phản đối)\n  * `in addition to + V-ing`\n- **Bẫy Need với đồ vật:** 'The grass needs to cut' là SAI, phải dùng 'The grass needs **cutting**' hoặc 'needs to be cut'."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo nhớ nhóm V-ing:**\n   - Các từ liên quan đến sự kết thúc hoặc trì hoãn: `finish, stop, postpone, delay, quit, avoid` -> Đi với **V-ing**.\n2. **Mẹo Remember/Forget:**\n   - **Đã làm rồi** (quá khứ) -> **V-ing**.\n   - **Chưa làm / Nhớ phải làm** (tương lai) -> **To-V**.\n3. **Mẹo Make / Let:**\n   - `Make / Let + O + V-bare` (không 'to', không 'ing').\n   - Nhưng khi bị động: `be made + TO-V` (bị bắt làm gì thì phải có 'to').",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-9-1",
        "part": "PART_5",
        "questionText": "He decided _____ a new laptop for his online studies.\nA. buy\nB. to buy\nC. buying\nD. bought",
        "options": {
          "A": "buy",
          "B": "to buy",
          "C": "buying",
          "D": "bought"
        },
        "correctAnswer": "B",
        "explanation": "Động từ 'decide' luôn đi kèm với động từ nguyên mẫu có 'to' (`decide + to-V`). Do đó chọn 'to buy'. Chọn B. Ghi nhớ các động từ chỉ kế hoạch/quyết định: decide, plan, hope, want + to-V.",
        "trapNote": "Ghi nhớ các động từ chỉ kế hoạch/quyết định: decide, plan, hope, want + to-V.",
        "translation": "Anh ấy đã quyết định _____ một chiếc máy tính xách tay mới cho việc học trực tuyến.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-2",
        "part": "PART_5",
        "questionText": "She enjoys _____ books in her free time.\nA. read\nB. to read\nC. reading\nD. to reading",
        "options": {
          "A": "read",
          "B": "to read",
          "C": "reading",
          "D": "to reading"
        },
        "correctAnswer": "C",
        "explanation": "Theo sau động từ 'enjoy' bắt buộc phải là danh động từ V-ing (`enjoy + V-ing`). Chọn 'reading'. Chọn C. Không dùng 'to read' sau 'enjoy'.",
        "trapNote": "Không dùng 'to read' sau 'enjoy'.",
        "translation": "Cô ấy thích _____ sách vào thời gian rảnh rỗi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-3",
        "part": "PART_5",
        "questionText": "Thank you for _____ me with my homework yesterday.\nA. help\nB. to help\nC. helping\nD. helped",
        "options": {
          "A": "help",
          "B": "to help",
          "C": "helping",
          "D": "helped"
        },
        "correctAnswer": "C",
        "explanation": "Quy tắc vàng: Sau tất cả các giới từ (for, in, on, at, about, with, without...), động từ luôn ở dạng V-ing. Chọn C. Dù có từ 'yesterday' thì sau giới từ 'for' vẫn bắt buộc chia V-ing.",
        "trapNote": "Dù có từ 'yesterday' thì sau giới từ 'for' vẫn bắt buộc chia V-ing.",
        "translation": "Cảm ơn bạn vì đã _____ tôi làm bài tập về nhà ngày hôm qua.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-4",
        "part": "PART_5",
        "questionText": "The strict teacher made all the students _____ the essay twice.\nA. rewrite\nB. to rewrite\nC. rewriting\nD. rewrote",
        "options": {
          "A": "rewrite",
          "B": "to rewrite",
          "C": "rewriting",
          "D": "rewrote"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc sai khiến ở dạng chủ động: `make + someone + V-bare` (bắt/khiến ai phải làm gì). Động từ đi theo là nguyên thể không to 'rewrite'. Chọn A. Dễ nhầm với cấu trúc bị động 'be made to V' (có to). Ở đây câu mang nghĩa chủ động nên dùng V-bare.",
        "trapNote": "Dễ nhầm với cấu trúc bị động 'be made to V' (có to). Ở đây câu mang nghĩa chủ động nên dùng V-bare.",
        "translation": "Người giáo viên nghiêm khắc đã bắt tất cả học sinh _____ lại bài luận hai lần.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-5",
        "part": "PART_5",
        "questionText": "Don't forget _____ off the oven before you leave the kitchen.\nA. turn\nB. to turn\nC. turning\nD. turned",
        "options": {
          "A": "turn",
          "B": "to turn",
          "C": "turning",
          "D": "turned"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc: `Forget + To-V` = Quên/nhớ phải làm việc gì (chưa làm, lời nhắc nhở). `Forget + V-ing` = Quên là đã từng làm gì trong quá khứ. Ở đây lò nướng chưa tắt, là lời nhắc nhở phải tắt -> dùng 'to turn'. Chọn B. Phân biệt 'forget to V' (nhắc việc phải làm) và 'forget V-ing' (quên việc đã làm trong quá khứ).",
        "trapNote": "Phân biệt 'forget to V' (nhắc việc phải làm) và 'forget V-ing' (quên việc đã làm trong quá khứ).",
        "translation": "Đừng quên _____ lò nướng trước khi bạn rời khỏi bếp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-6",
        "part": "PART_5",
        "questionText": "I clearly remember _____ the front door this morning; I definitely locked it.\nA. lock\nB. to lock\nC. locking\nD. locked",
        "options": {
          "A": "lock",
          "B": "to lock",
          "C": "locking",
          "D": "locked"
        },
        "correctAnswer": "C",
        "explanation": "Quy tắc: `Remember + V-ing` = Nhớ một việc ĐÃ LÀM trong quá khứ. Người nói khẳng định mình đã làm việc này rồi nên dùng 'locking'. Chọn C. Nếu là câu nhắc 'Remember to lock the door' thì mới dùng 'to lock'.",
        "trapNote": "Nếu là câu nhắc 'Remember to lock the door' thì mới dùng 'to lock'.",
        "translation": "Tôi nhớ rất rõ là _____ cửa trước sáng nay rồi; tôi chắc chắn đã khóa nó.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-7",
        "part": "PART_5",
        "questionText": "After walking for three hours under the scorching sun, we stopped _____ some water.\nA. drink\nB. to drink\nC. drinking\nD. drank",
        "options": {
          "A": "drink",
          "B": "to drink",
          "C": "drinking",
          "D": "drank"
        },
        "correctAnswer": "B",
        "explanation": "Phân biệt: `Stop + to-V` = Dừng việc đang làm lại ĐỂ LÀM việc khác. `Stop + V-ing` = Bỏ hẳn việc đang làm (vd: stop smoking). Ở đây họ dừng đi bộ để uống nước -> Dùng 'to drink'. Chọn B. Nhiều bạn cứ mặc định 'stop' luôn đi với 'V-ing' là rơi vào bẫy điểm liệt.",
        "trapNote": "Nhiều bạn cứ mặc định 'stop' luôn đi với 'V-ing' là rơi vào bẫy điểm liệt.",
        "translation": "Sau khi đi bộ ba tiếng đồng hồ dưới trời nắng gắt, chúng tôi đã dừng lại _____ một chút nước.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-8",
        "part": "PART_5",
        "questionText": "The grass in our front yard is getting too high; it needs _____ immediately.\nA. to cut\nB. cutting\nC. cut\nD. to be cutting",
        "options": {
          "A": "to cut",
          "B": "cutting",
          "C": "cut",
          "D": "to be cutting"
        },
        "correctAnswer": "B",
        "explanation": "Khi chủ ngữ là vật, cấu trúc mang nghĩa bị động với 'need' là: `S(vật) + need + V-ing` (hoặc `need to be V3`). Do đó 'needs cutting' mang nghĩa 'cần được cắt'. Chọn B. Bẫy thấy 'need' liền chọn 'to cut', nhưng cỏ không thể tự cắt nó được.",
        "trapNote": "Bẫy thấy 'need' liền chọn 'to cut', nhưng cỏ không thể tự cắt nó được.",
        "translation": "Cỏ ở sân trước của chúng tôi đang mọc cao quá; nó cần _____ ngay lập tức.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-9",
        "part": "PART_5",
        "questionText": "The criminal was made _____ where he had hidden the stolen jewelry.\nA. confess\nB. to confess\nC. confessing\nD. confessed",
        "options": {
          "A": "confess",
          "B": "to confess",
          "C": "confessing",
          "D": "confessed"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc biến đổi chủ động sang bị động của động từ 'make': Ở chủ động là `make sb + V-bare`, NHƯNG khi chuyển sang thể bị động bắt buộc phải phục hồi 'to': `be made + TO-V` (bị bắt/ép phải làm gì). Do đó chọn 'to confess'. Chọn B. Học sinh học vẹt 'make đi với V-bare' sẽ chọn ngay A và bị mất điểm.",
        "trapNote": "Học sinh học vẹt 'make đi với V-bare' sẽ chọn ngay A và bị mất điểm.",
        "translation": "Tên tội phạm đã bị bắt _____ nơi hắn đã giấu số trang sức trộm được.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-9-10",
        "part": "PART_5",
        "questionText": "Many local residents object to _____ a new waste incinerator near the residential area.\nA. build\nB. building\nC. have built\nD. be built",
        "options": {
          "A": "build",
          "B": "building",
          "C": "have built",
          "D": "be built"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy chữ 'TO' kinh điển: Trong cụm 'object to', từ 'to' là giới từ chứ không phải to-infinitive. Theo sau giới từ luôn là V-ing: `object to + V-ing` (phản đối việc gì). Do đó phải chọn 'building'. Chọn B. Cứ thấy 'to' là vội vàng chọn 'build' nguyên thể là sai lầm phổ biến nhất.",
        "trapNote": "Cứ thấy 'to' là vội vàng chọn 'build' nguyên thể là sai lầm phổ biến nhất.",
        "translation": "Nhiều cư dân địa phương phản đối _____ một lò đốt rác mới gần khu dân cư.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-10",
    "code": "CD_10",
    "titleVi": "Chuyên đề 10: Câu Hỏi Đuôi",
    "titleEn": "Tag Questions",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Câu hỏi đuôi (Tag Questions) luôn xuất hiện 1 câu chắc chắn trong đề thi THPT QG và là trọng tâm giao tiếp trong TOEIC Listening Part 2. Nguyên tắc cơ bản: Vế trước khẳng định, đuôi phủ định và ngược lại, đi kèm các trường hợp ngoại lệ đặc biệt.",
    "formula": "### 1. Nguyên tắc cốt lõi:\n- **Khẳng định -> Phủ định:**\n  `Statement (+), negative tag (-)?`\n  *Ví dụ:* You are a student, *aren't you*?\n- **Phủ định -> Khẳng định:**\n  `Statement (-), positive tag (+)?`\n  *Ví dụ:* She didn't come, *did she*?\n- **Quy tắc về Trợ động từ và Đại từ:**\n  * Trợ động từ ở đuôi phải cùng thì với động từ ở mệnh đề trước (`do/does/did/have/has/will/can...`).\n  * Chủ ngữ ở đuôi luôn là **Đại từ nhân xưng** (`I, you, he, she, it, we, they`).\n\n### 2. Các trường hợp ngoại lệ ĐẶC BIỆT cần ghi nhớ:\n1. **Chủ ngữ là I AM:**\n   `I am..., AREN'T I?` (Tuyệt đối không dùng amn't I).\n   *Nhưng:* `I am not..., AM I?`\n2. **Câu rủ rê với LET'S:**\n   `Let's go, SHALL WE?`\n   *So sánh:* `Let us / Let me + V, WILL YOU?`\n3. **Câu mệnh lệnh (Imperative):**\n   - Mệnh lệnh khẳng định: `Open the door, WILL YOU / WON'T YOU?`\n   - Mệnh lệnh phủ định: `Don't be late, WILL YOU?`\n4. **Mệnh đề có từ BÁN PHỦ ĐỊNH (Hardly, Seldom, Rarely, Scarcely, Never, Little, Few):**\n   -> Coi vế trước là PHỦ ĐỊNH, đuôi phải ở dạng **KHẲNG ĐỊNH (+)**!\n   *Ví dụ:* She *seldom* eats meat, *does she*?\n5. **Chủ ngữ là Đại từ bất định chỉ NGƯỜI:**\n   `Everyone, everybody, someone, nobody, no one, anyone...`\n   -> Đại từ ở đuôi thay thế bằng **THEY**!\n   *Lưu ý:* `Nobody, no one` mang nghĩa phủ định -> đuôi là **KHẲNG ĐỊNH**!\n   *Ví dụ:* Nobody called, *did they*?\n6. **Chủ ngữ là Đại từ bất định chỉ VẬT:**\n   `Everything, something, anything, nothing`\n   -> Đại từ ở đuôi thay thế bằng **IT**!\n   *Ví dụ:* Nothing happened, *did it*?\n7. **Cấu trúc với 'I think, believe, suppose that + Clause':**\n   - Chủ ngữ là 'I': Câu hỏi đuôi chia theo **mệnh đề sau 'that'**!\n   - Nếu mệnh đề 'I think' có phủ định ('I don't think that...'): Chuyển tính phủ định sang đuôi (đuôi dạng **KHẲNG ĐỊNH**)!\n   *Ví dụ:* I don't think he will pass, *will he*?\n   - Chủ ngữ không phải 'I' (He thinks, She believes): Chia theo **mệnh đề chính đầu câu**!",
    "signalWords": [
      "- Nhìn động từ chính hoặc trợ động từ ở vế trước:\n  * Động từ to be (`is/are/was/were`) -> Dùng lại to be.\n  * Động từ thường (`goes, played`) -> Mượn trợ động từ `do/does/did`.\n  * Động từ hoàn thành (`have/has + V3`) -> Dùng `have/has`.\n- Quét nhanh các từ bán phủ định: `never, seldom, rarely, hardly, few, little`. Nếu có -> Đuôi bắt buộc KHẲNG ĐỊNH.\n- Nhìn chủ ngữ: `Nobody/Everyone` -> Đuôi là `they`; `Nothing/Everything` -> Đuôi là `it`."
    ],
    "traps": [
      "- **Bẫy Nobody / No one:** 'Nobody likes him' có 'likes' thêm 's' (số ít), nhưng vì 'Nobody' biến thành 'they' ở đuôi, nên trợ động từ phải chia theo 'they' -> `do they?` (không dùng 'does they').\n- **Bẫy viết tắt 'd:**\n  * `'d rather` = would rather -> đuôi là `wouldn't`.\n  * `'d better` = had better -> đuôi là `hadn't`."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo dấu trừ nhân dấu cộng:**\n   - Trước (+) -> Đuôi (-).\n   - Trước (-) -> Đuôi (+).\n2. **Thần chú I AM:** *I am đi với Aren't I*.\n3. **Thần chú LET'S:** *Let's đi với Shall we*.\n4. **Mẹo I don't think:**\n   - Dấu phủ định nằm ở chữ \"don't\" -> Đuôi biến thành KHẲNG ĐỊNH theo vế sau!",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-10-1",
        "part": "PART_5",
        "questionText": "Your brother works at a multinational technology company, _____?\nA. doesn't he\nB. does he\nC. isn't he\nD. is he",
        "options": {
          "A": "doesn't he",
          "B": "does he",
          "C": "isn't he",
          "D": "is he"
        },
        "correctAnswer": "A",
        "explanation": "Vế trước là câu khẳng định thì hiện tại đơn với động từ thường 'works' -> Đuôi phải ở dạng phủ định mượn trợ động từ 'does' -> 'doesn't he?'. Chọn A. Không dùng 'isn't he' vì câu dùng động từ thường 'works', không có to be.",
        "trapNote": "Không dùng 'isn't he' vì câu dùng động từ thường 'works', không có to be.",
        "translation": "Anh trai của bạn làm việc tại một công ty công nghệ đa quốc gia, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-2",
        "part": "PART_5",
        "questionText": "She didn't attend the annual shareholders' meeting yesterday, _____?\nA. did she\nB. didn't she\nC. was she\nD. wasn't she",
        "options": {
          "A": "did she",
          "B": "didn't she",
          "C": "was she",
          "D": "wasn't she"
        },
        "correctAnswer": "A",
        "explanation": "Vế trước là phủ định 'didn't' -> Đuôi phải là khẳng định 'did she?'. Chọn A. Trước phủ định thì sau khẳng định, tránh lặp lại phủ định 'didn't she'.",
        "trapNote": "Trước phủ định thì sau khẳng định, tránh lặp lại phủ định 'didn't she'.",
        "translation": "Cô ấy đã không tham dự cuộc họp cổ đông thường niên ngày hôm qua, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-3",
        "part": "PART_5",
        "questionText": "I am responsible for organizing this promotional event, _____?\nA. amn't I\nB. aren't I\nC. am I\nD. don't I",
        "options": {
          "A": "amn't I",
          "B": "aren't I",
          "C": "am I",
          "D": "don't I"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc ngoại lệ kinh điển: Khi mệnh đề trước là 'I am', câu hỏi đuôi phủ định bắt buộc phải là 'aren't I?'. Trong tiếng Anh chuẩn không có từ 'amn't I'. Chọn B. Học sinh máy móc ghép 'am' với 'not' thành 'amn't I' là sai hoàn toàn.",
        "trapNote": "Học sinh máy móc ghép 'am' với 'not' thành 'amn't I' là sai hoàn toàn.",
        "translation": "Tôi chịu trách nhiệm tổ chức sự kiện quảng bá này, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-4",
        "part": "PART_5",
        "questionText": "Let's take a break and have a cup of coffee, _____?\nA. shall we\nB. will you\nC. do we\nD. won't you",
        "options": {
          "A": "shall we",
          "B": "will you",
          "C": "do we",
          "D": "won't you"
        },
        "correctAnswer": "A",
        "explanation": "Khi câu bắt đầu bằng 'Let's' (gợi ý/rủ rê cùng làm gì), câu hỏi đuôi luôn cố định là 'shall we?'. Chọn A. Phân biệt 'Let's' (shall we) với câu mệnh lệnh xin phép 'Let us / Let me' (will you).",
        "trapNote": "Phân biệt 'Let's' (shall we) với câu mệnh lệnh xin phép 'Let us / Let me' (will you).",
        "translation": "Chúng ta hãy nghỉ giải lao và uống một tách cà phê nhé, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-5",
        "part": "PART_5",
        "questionText": "Don't forget to submit your quarterly financial report by 5 PM, _____?\nA. do you\nB. don't you\nC. will you\nD. won't you",
        "options": {
          "A": "do you",
          "B": "don't you",
          "C": "will you",
          "D": "won't you"
        },
        "correctAnswer": "C",
        "explanation": "Đối với câu mệnh lệnh phủ định bắt đầu bằng 'Don't + V', câu hỏi đuôi luôn luôn là 'will you?'. Chọn C. Dễ nhầm chọn 'do you' do thấy chữ 'Don't' ở đầu câu.",
        "trapNote": "Dễ nhầm chọn 'do you' do thấy chữ 'Don't' ở đầu câu.",
        "translation": "Đừng quên nộp báo cáo tài chính quý trước 5 giờ chiều, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-6",
        "part": "PART_5",
        "questionText": "Everything in this boutique is handmade, _____?\nA. isn't it\nB. is it\nC. aren't they\nD. are they",
        "options": {
          "A": "isn't it",
          "B": "is it",
          "C": "aren't they",
          "D": "are they"
        },
        "correctAnswer": "A",
        "explanation": "Khi chủ ngữ là đại từ chỉ vật 'Everything, something, anything, nothing', đại từ thay thế ở câu hỏi đuôi là 'it'. Vế trước là khẳng định 'is' -> đuôi là phủ định 'isn't it?'. Chọn A. Đại từ chỉ người (everyone) dùng 'they', nhưng đại từ chỉ vật (everything) dùng 'it'.",
        "trapNote": "Đại từ chỉ người (everyone) dùng 'they', nhưng đại từ chỉ vật (everything) dùng 'it'.",
        "translation": "Mọi thứ trong cửa hàng thời trang này đều được làm thủ công, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-7",
        "part": "PART_5",
        "questionText": "He seldom goes out on weekday evenings, _____?\nA. doesn't he\nB. does he\nC. isn't he\nD. is he",
        "options": {
          "A": "doesn't he",
          "B": "does he",
          "C": "isn't he",
          "D": "is he"
        },
        "correctAnswer": "B",
        "explanation": "Khi mệnh đề trước chứa từ bán phủ định (seldom, rarely, hardly, scarcely, never), câu đó được coi là mang nghĩa PHỦ ĐỊNH -> Đuôi bắt buộc phải ở dạng KHẲNG ĐỊNH. Động từ 'goes' ở thì hiện tại đơn -> mượn 'does he?'. Chọn B. Bẫy thấy 'goes' là câu khẳng định nên vội vàng chọn 'doesn't he' mà quên mất chữ 'seldom'.",
        "trapNote": "Bẫy thấy 'goes' là câu khẳng định nên vội vàng chọn 'doesn't he' mà quên mất chữ 'seldom'.",
        "translation": "Anh ấy hiếm khi ra ngoài vào các buổi tối trong tuần, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-8",
        "part": "PART_5",
        "questionText": "Nobody volunteered to clean up the laboratory after the experiment, _____?\nA. did they\nB. didn't they\nC. did he\nD. didn't he",
        "options": {
          "A": "did they",
          "B": "didn't they",
          "C": "did he",
          "D": "didn't he"
        },
        "correctAnswer": "A",
        "explanation": "Khi chủ ngữ là 'Nobody / No one': 1) Mang nghĩa phủ định nên đuôi phải là KHẲNG ĐỊNH. 2) Đại từ thay thế ở đuôi là 'they'. Động từ 'volunteered' ở quá khứ đơn -> trợ động từ 'did'. Kết hợp lại ta được: 'did they?'. Chọn A. Tuyệt đối không chọn 'didn't they' vì 'Nobody' đã mang nghĩa phủ định rồi.",
        "trapNote": "Tuyệt đối không chọn 'didn't they' vì 'Nobody' đã mang nghĩa phủ định rồi.",
        "translation": "Không có ai tình nguyện dọn dẹp phòng thí nghiệm sau buổi thực hành, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-9",
        "part": "PART_5",
        "questionText": "I don't think that the new marketing campaign will succeed, _____?\nA. do I\nB. don't I\nC. will it\nD. won't it",
        "options": {
          "A": "do I",
          "B": "don't I",
          "C": "will it",
          "D": "won't it"
        },
        "correctAnswer": "C",
        "explanation": "Quy tắc với 'I think / believe / suppose that': Câu hỏi đuôi chia theo mệnh đề phụ phía sau. Chủ ngữ 'the new marketing campaign' = 'it', động từ là 'will'. Vì ở mệnh đề chính có chữ phủ định 'don't think', tính phủ định này được chuyển sang câu hỏi đuôi -> đuôi phải ở dạng KHẲNG ĐỊNH: 'will it?'. Chọn C. Bẫy 1: Chia theo 'I don't think' thành 'do I'. Bẫy 2: Chia vế sau là 'won't it' vì không nhận ra chữ 'don't' ở vế trước.",
        "trapNote": "Bẫy 1: Chia theo 'I don't think' thành 'do I'. Bẫy 2: Chia vế sau là 'won't it' vì không nhận ra chữ 'don't' ở vế trước.",
        "translation": "Tôi không nghĩ rằng chiến dịch tiếp thị mới sẽ thành công, _____?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-10-10",
        "part": "PART_5",
        "questionText": "You'd better consult an expert before making a final investment decision, _____?\nA. wouldn't you\nB. hadn't you\nC. didn't you\nD. shouldn't you",
        "options": {
          "A": "wouldn't you",
          "B": "hadn't you",
          "C": "didn't you",
          "D": "shouldn't you"
        },
        "correctAnswer": "B",
        "explanation": "Phân tích chữ viết tắt `'d`: Cụm 'You'd better' là viết tắt của 'You HAD better'. Vì trợ động từ là 'had' nên câu hỏi đuôi phủ định phải là 'hadn't you?'. (Nếu là 'You'd rather' thì mới là 'wouldn't you?'). Chọn B. Bẫy cực phổ biến nhầm `'d better` thành `would` nên chọn nhầm `wouldn't you`.",
        "trapNote": "Bẫy cực phổ biến nhầm `'d better` thành `would` nên chọn nhầm `wouldn't you`.",
        "translation": "Tốt hơn hết bạn nên tham khảo ý kiến chuyên gia trước khi đưa ra quyết định đầu tư cuối cùng, _____?",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-11",
    "code": "CD_11",
    "titleVi": "Chuyên đề 11: Câu So Sánh",
    "titleEn": "Comparisons",
    "part": "Part 5 & 6",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Câu so sánh là một trong những dạng ngữ pháp cốt lõi xuất hiện trong mọi đề thi tiếng Anh (từ THPT QG đến TOEIC, IELTS). Các cấu trúc so sánh bằng, so sánh hơn, so sánh nhất, so sánh kép (The more... the more...) và so sánh bội số đòi hỏi thí sinh phải phân biệt rạch ròi giữa tính từ/trạng từ ngắn và dài.",
    "formula": "### 1. Phân loại Tính từ / Trạng từ Ngắn và Dài:\n- **Ngắn (Short):** Có 1 âm tiết (`tall, fast, hot, cold`) hoặc 2 âm tiết nhưng tận cùng là `-y, -le, -ow, -er, -et` (`happy, simple, narrow, clever, quiet`).\n- **Dài (Long):** Có từ 2 âm tiết trở lên (`expensive, modern, carefully, fluently`).\n\n### 2. Các dạng so sánh cơ bản:\n- **So sánh bằng (Equality):**\n  `S1 + V + as + Adj/Adv + as + S2`\n  *Phủ định:* `S1 + V-not + as/so + Adj/Adv + as + S2`\n  *Ví dụ:* He runs *as fast as* John. / She is not *as tall as* her mother.\n- **So sánh hơn (Comparative):**\n  * Ngắn: `S1 + V + Adj/Adv-ER + THAN + S2` (taller than, faster than).\n  * Dài: `S1 + V + MORE + Adj/Adv + THAN + S2` (more expensive than).\n  * Từ nhấn mạnh trong so sánh hơn: `much, far, a lot, slightly, a bit` (vd: *much better*, *far more expensive*).\n- **So sánh nhất (Superlative):**\n  * Ngắn: `S + V + THE + Adj/Adv-EST + (in/of/among...)` (the tallest).\n  * Dài: `S + V + THE MOST + Adj/Adv + (in/of/among...)` (the most beautiful).\n\n### 3. Các dạng so sánh đặc biệt (Thường xuyên thi):\n- **So sánh càng... thì càng (Double Comparative - So sánh kép):**\n  `THE + So sánh hơn 1 + S1 + V1, THE + So sánh hơn 2 + S2 + V2`\n  *Ví dụ:* *The harder* you study, *the better* results you will get.\n  *Ví dụ:* *The more* you practice, *the more confident* you become.\n- **So sánh càng ngày càng (Cùng 1 đối tượng):**\n  * Ngắn: `Adj-er and Adj-er` (hotter and hotter, bigger and bigger).\n  * Dài: `More and more + Adj` (more and more beautiful).\n- **So sánh bội số (Gấp mấy lần):**\n  `S + V + multiple (half, twice, three times...) + AS + Adj/Adv + AS + O`\n  *Ví dụ:* This house is *three times as large as* that one.\n\n### 4. Bảng tính từ / trạng từ bất quy tắc:\n- `good / well` -> `better` -> `the best`\n- `bad / badly` -> `worse` -> `the worst`\n- `many / much` -> `more` -> `the most`\n- `little` -> `less` -> `the least`\n- `far` -> `farther / further` -> `the farthest / furthest` (further dùng cho thông tin sâu hơn, farther dùng cho khoảng cách vật lý).",
    "signalWords": [
      "- Thấy chữ `than` -> chắc chắn là **So sánh hơn** (`Adj-er` hoặc `more Adj`).\n- Thấy chữ `the` đứng trước chỗ trống kèm phạm vi `of all / in the world / in my class` -> chắc chắn là **So sánh nhất** (`the -est` hoặc `the most`).\n- Thấy hai vế bắt đầu bằng `The... The...` -> chắc chắn là **So sánh kép** (`The + comparative..., the + comparative...`).\n- Thấy từ chỉ lần (`twice, three times`) -> chắc chắn cấu trúc `as... as`."
    ],
    "traps": [
      "- **Bẫy dùng Very với so sánh hơn:** Rất nhiều thí sinh chọn 'very better' hay 'very more expensive'. Nhớ: 'very' chỉ đi với tính từ nguyên thể, đi với so sánh hơn phải là **much** hoặc **far**.\n- **Bẫy thiếu THE trong so sánh kép:** Thí sinh hay quên từ 'The' ở vế thứ hai."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo so sánh kép \"Hai The\":**\n   - Đằng trước có `The + so sánh hơn` -> Đằng sau chắc chắn cũng phải bắt đầu bằng `The + so sánh hơn`.\n2. **Mẹo từ nhấn mạnh:**\n   - Để nhấn mạnh so sánh hơn, đề thi thường dùng `much` hoặc `far` đứng trước (`much taller`, `far more intelligent`). Tuyệt đối không dùng `very` trước so sánh hơn!\n3. **Mẹo đuôi -y:**\n   - Các từ 2 âm tiết đuôi `-y` như `happy, easy, heavy, lucky` được coi là TÍNH TỪ NGẮN -> đổi thành `-ier` (`happier`, `easier`), không dùng `more happy`.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-11-1",
        "part": "PART_5",
        "questionText": "This luxury apartment is much _____ than the one we rented last year.\nA. large\nB. larger\nC. largest\nD. more large",
        "options": {
          "A": "large",
          "B": "larger",
          "C": "largest",
          "D": "more large"
        },
        "correctAnswer": "B",
        "explanation": "'large' là tính từ ngắn 1 âm tiết, khi so sánh hơn thêm đuôi '-r' thành 'larger' (đi cùng 'than'). Chọn B. Tính từ ngắn 1 âm tiết không dùng 'more large'.",
        "trapNote": "Tính từ ngắn 1 âm tiết không dùng 'more large'.",
        "translation": "Căn hộ sang trọng này _____ hơn nhiều so với căn chúng tôi thuê năm ngoái.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-2",
        "part": "PART_5",
        "questionText": "Mount Everest is the _____ mountain peak in the world.\nA. high\nB. higher\nC. highest\nD. most high",
        "options": {
          "A": "high",
          "B": "higher",
          "C": "highest",
          "D": "most high"
        },
        "correctAnswer": "C",
        "explanation": "'the' kết hợp với phạm vi lớn nhất 'in the world' đòi hỏi cấu trúc so sánh nhất. 'high' là tính từ ngắn -> thêm đuôi '-est' thành 'highest'. Chọn C. So sánh nhất của tính từ ngắn dùng đuôi '-est', không dùng 'most high'.",
        "trapNote": "So sánh nhất của tính từ ngắn dùng đuôi '-est', không dùng 'most high'.",
        "translation": "Đỉnh núi Everest là đỉnh núi _____ trên thế giới.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-3",
        "part": "PART_5",
        "questionText": "My new smartphone is not as _____ as my brother's.\nA. expensive\nB. more expensive\nC. most expensive\nD. expensively",
        "options": {
          "A": "expensive",
          "B": "more expensive",
          "C": "most expensive",
          "D": "expensively"
        },
        "correctAnswer": "A",
        "explanation": "Trong cấu trúc so sánh bằng (as... as), tính từ hoặc trạng từ ở giữa luôn ở dạng NGUYÊN THỂ (không thêm đuôi, không thêm more). Vì động từ là to be 'is' nên dùng tính từ 'expensive'. Chọn A. Nhiều bạn quen tay cho 'more expensive' vào giữa 'as... as' là sai cấu trúc.",
        "trapNote": "Nhiều bạn quen tay cho 'more expensive' vào giữa 'as... as' là sai cấu trúc.",
        "translation": "Điện thoại thông minh mới của tôi không _____ bằng của anh trai tôi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-4",
        "part": "PART_5",
        "questionText": "Traveling by airplane is far _____ than traveling by train.\nA. fast\nB. faster\nC. fastest\nD. more fast",
        "options": {
          "A": "fast",
          "B": "faster",
          "C": "fastest",
          "D": "more fast"
        },
        "correctAnswer": "B",
        "explanation": "'far' đứng trước để nhấn mạnh mức độ chênh lệch trong câu so sánh hơn. 'fast' là tính từ ngắn -> 'faster than'. Cụm 'far faster than' = nhanh hơn rất nhiều. Chọn B. Từ 'far' ở đây không mang nghĩa là 'xa xôi' mà là từ bổ nghĩa mang nghĩa 'hơn nhiều'.",
        "trapNote": "Từ 'far' ở đây không mang nghĩa là 'xa xôi' mà là từ bổ nghĩa mang nghĩa 'hơn nhiều'.",
        "translation": "Đi du lịch bằng máy bay _____ hơn nhiều so với đi bằng tàu hỏa.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-5",
        "part": "PART_5",
        "questionText": "The weather is becoming _____ as summer approaches.\nA. hotter and hotter\nB. more hot and more hot\nC. hottest and hottest\nD. more and more hot",
        "options": {
          "A": "hotter and hotter",
          "B": "more hot and more hot",
          "C": "hottest and hottest",
          "D": "more and more hot"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc so sánh lũy tiến (càng ngày càng) đối với tính từ ngắn: `Adj-er and Adj-er`. 'hot' gấp đôi phụ âm 't' thành 'hotter and hotter'. Chọn A. Chỉ dùng 'more and more' cho tính từ dài (vd: more and more beautiful). Tính từ ngắn phải dùng 'hotter and hotter'.",
        "trapNote": "Chỉ dùng 'more and more' cho tính từ dài (vd: more and more beautiful). Tính từ ngắn phải dùng 'hotter and hotter'.",
        "translation": "Thời tiết đang trở nên _____ khi mùa hè đến gần.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-6",
        "part": "PART_5",
        "questionText": "She speaks English much more _____ than her colleagues.\nA. fluent\nB. fluently\nC. fluenter\nD. most fluently",
        "options": {
          "A": "fluent",
          "B": "fluently",
          "C": "fluenter",
          "D": "most fluently"
        },
        "correctAnswer": "B",
        "explanation": "Bổ nghĩa cho động từ thường 'speaks' bắt buộc phải là TRẠNG TỪ (fluently). Vì fluently là trạng từ dài (có đuôi -ly) nên so sánh hơn là 'more fluently'. Chọn B. Dễ chọn nhầm tính từ 'fluent' nếu không để ý động từ phía trước là động từ thường 'speaks'.",
        "trapNote": "Dễ chọn nhầm tính từ 'fluent' nếu không để ý động từ phía trước là động từ thường 'speaks'.",
        "translation": "Cô ấy nói tiếng Anh _____ hơn nhiều so với các đồng nghiệp của mình.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-7",
        "part": "PART_5",
        "questionText": "The more you practice speaking English, _____ you will become.\nA. the more confident\nB. more confident\nC. the most confident\nD. the confidenter",
        "options": {
          "A": "the more confident",
          "B": "more confident",
          "C": "the most confident",
          "D": "the confidenter"
        },
        "correctAnswer": "A",
        "explanation": "Công thức so sánh kép (Double Comparative): `THE + comparative 1, THE + comparative 2`. Vế thứ hai bắt buộc phải có mạo từ 'The' đi kèm với dạng so sánh hơn của tính từ dài confident là 'the more confident'. Chọn A. Bẫy thiếu 'The' ở phương án B là lỗi sai phổ biến nhất.",
        "trapNote": "Bẫy thiếu 'The' ở phương án B là lỗi sai phổ biến nhất.",
        "translation": "Bạn càng luyện nói tiếng Anh nhiều, bạn sẽ càng trở nên _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-8",
        "part": "PART_5",
        "questionText": "The new warehouse is _____ as the old one located downtown.\nA. twice as large\nB. twice larger\nC. as large twice\nD. two times larger",
        "options": {
          "A": "twice as large",
          "B": "twice larger",
          "C": "as large twice",
          "D": "two times larger"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc so sánh bội số chuẩn trong tiếng Anh: `S + V + multiple (half / twice / three times...) + AS + Adj/Adv + AS + O`. Đứng trước 'as the old one' là 'twice as large'. Chọn A. Thói quen dịch tiếng Việt 'gấp đôi lớn hơn' khiến học sinh hay chọn nhầm 'twice larger'.",
        "trapNote": "Thói quen dịch tiếng Việt 'gấp đôi lớn hơn' khiến học sinh hay chọn nhầm 'twice larger'.",
        "translation": "Nhà kho mới rộng gấp _____ so với nhà kho cũ ở trung tâm thành phố.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-9",
        "part": "PART_5",
        "questionText": "Of the two candidates interviewed this morning, Mr. Anderson is definitely _____.\nA. the most suitable\nB. the more suitable\nC. more suitable\nD. suitable",
        "options": {
          "A": "the most suitable",
          "B": "the more suitable",
          "C": "more suitable",
          "D": "suitable"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy kinh điển: Khi so sánh trong phạm vi CHỈ CÓ 2 ĐỐI TƯỢNG ('Of the two...'), ta KHÔNG ĐƯỢC dùng so sánh nhất (-est / most). Bắt buộc phải dùng cấu trúc: `THE + so sánh hơn` (The more suitable) để chỉ người/vật nổi trội hơn trong số 2 đối tượng. Chọn B. Học sinh cứ thấy 'Of all / Of the...' là tự động chọn so sánh nhất 'the most suitable' và bị mất điểm.",
        "trapNote": "Học sinh cứ thấy 'Of all / Of the...' là tự động chọn so sánh nhất 'the most suitable' và bị mất điểm.",
        "translation": "Trong số hai ứng viên được phỏng vấn sáng nay, ông Anderson chắc chắn là người _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-11-10",
        "part": "PART_5",
        "questionText": "For _____ information regarding the conference schedule, please contact our support desk.\nA. farther\nB. further\nC. furthest\nD. farthest",
        "options": {
          "A": "farther",
          "B": "further",
          "C": "furthest",
          "D": "farthest"
        },
        "correctAnswer": "B",
        "explanation": "Phân biệt tinh tế giữa 'farther' và 'further': 'Farther' chỉ dùng cho khoảng cách địa lý cụ thể đo đạc được (vd: 5 km farther). 'Further' mang nghĩa là 'thêm nữa, sâu hơn' dùng cho các khái niệm trừu tượng (further information, further education, further details). Do đó chọn 'further'. Chọn B. Cụm 'further information' xuất hiện liên tục trong bài đọc TOEIC Part 7.",
        "trapNote": "Cụm 'further information' xuất hiện liên tục trong bài đọc TOEIC Part 7.",
        "translation": "Để biết _____ thông tin về lịch trình hội nghị, vui lòng liên hệ với bàn hỗ trợ của chúng tôi.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-12",
    "code": "CD_12",
    "titleVi": "Chuyên đề 12: Trật Tự Của Tính Từ",
    "titleEn": "Order of Adjectives",
    "part": "Part 5",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Khi có nhiều hơn một tính từ cùng đứng trước bổ nghĩa cho một danh từ, các tính từ bắt buộc phải tuân theo một trật tự cố định. Trong đề thi THPT QG, đây là câu hỏi 'cho điểm' nếu học sinh nắm chắc thần chú kinh điển OpSASCOMP.",
    "formula": "### 1. Quy tắc thần chú OpSASCOMP:\nThứ tự các tính từ đứng trước danh từ tuân thủ theo trật tự 8 yếu tố:\n1. **Op (Opinion - Ý kiến/Đánh giá chủ quan):** đẹp, xấu, tuyệt vời, ngon, đắt, rẻ...\n   *Ví dụ:* `beautiful, wonderful, lovely, terrible, nice, delicious, expensive`.\n2. **S (Size - Kích thước/Kích cỡ):** to, nhỏ, dài, ngắn, cao, thấp...\n   *Ví dụ:* `big, small, huge, tiny, long, short, tall`.\n3. **A (Age - Độ tuổi/Thời gian):** mới, cũ, già, trẻ, cổ...\n   *Ví dụ:* `new, old, young, modern, ancient`.\n4. **S (Shape - Hình dáng):** tròn, vuông, tam giác, dẹt...\n   *Ví dụ:* `round, square, triangular, rectangular, flat`.\n5. **C (Color - Màu sắc):** đen, trắng, đỏ, vàng, xanh...\n   *Ví dụ:* `black, white, red, yellow, blue, green`.\n6. **O (Origin - Nguồn gốc/Xuất xứ):** Việt Nam, Nhật Bản, Mỹ, châu Âu...\n   *Ví dụ:* `Vietnamese, Japanese, American, European`.\n7. **M (Material - Chất liệu):** gỗ, kim loại, da, lụa, nhựa, len...\n   *Ví dụ:* `wooden, leather, silk, plastic, wool, cotton`.\n8. **P (Purpose - Mục đích/Công dụng):** dùng để làm gì (thường kết thúc bằng V-ing hoặc danh từ làm tính từ).\n   *Ví dụ:* `sleeping (bag), running (shoes), dining (table), wedding (dress)`.\n\n### 2. Vị trí trong cụm danh từ đầy đủ:\n`Mạo từ / Chỉ định từ + Op - S - A - S - C - O - M - P + DANH TỪ CHÍNH`\n*Ví dụ:* `a beautiful (Op) small (S) new (A) round (S) brown (C) Italian (O) wooden (M) dining (P) table (Noun)`.",
    "signalWords": [
      "- Nhìn 4 đáp án: Thấy 4 lựa chọn chỉ đảo vị trí của cùng 3 hoặc 4 tính từ đứng trước một danh từ.\n- Phân loại ngay từng tính từ trong đề bài vào 8 chữ cái của thần chú `Op - S - A - S - C - O - M - P`:\n  * Có từ chỉ cảm xúc (beautiful, nice) -> xếp đầu (Op).\n  * Có từ chỉ chất liệu (wooden, leather) -> xếp sát danh từ (M).\n  * Có từ chỉ quốc gia (Japanese, Vietnamese) -> xếp trước chất liệu (O)."
    ],
    "traps": [
      "- **Bẫy nhầm giữa Size (Kích thước) và Shape (Hình dáng):** Cả hai đều bắt đầu bằng chữ S. Nhớ: **Size đứng trước (S1), Shape đứng sau (S2)**. Kích thước (big/small) nói trước hình dáng (round/square).\n- **Bẫy tính từ chỉ công dụng (-ing):** Từ như 'sleeping' trong 'sleeping bag' là tính từ chỉ mục đích (Purpose), phải đứng sát sạt danh từ 'bag'."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú bất hủ:**\n   **Op - S - A - S - C - O - M - P**\n   *(Ông Sáu Ăn Súp Cua Ở Móng Cái)*\n2. **Mẹo làm bài trong 5 giây:**\n   - Bước 1: Tìm tính từ chỉ **Chất liệu (M)** hoặc **Nguồn gốc (O)** -> Nó phải đứng sát danh từ chính nhất ở cuối cụm. Loại ngay các đáp án để chất liệu lên đầu!\n   - Bước 2: Tìm tính từ chỉ **Ý kiến (Op)** (beautiful, lovely) -> Nó phải đứng đầu tiên ngay sau mạo từ.\n   - Kết hợp đầu - cuối là ra ngay đáp án đúng mà không cần xếp cả 3 từ!",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-12-1",
        "part": "PART_5",
        "questionText": "My father bought a _____ table for our newly renovated dining room.\nA. wooden big\nB. big wooden\nC. wooden a big\nD. big a wooden",
        "options": {
          "A": "wooden big",
          "B": "big wooden",
          "C": "wooden a big",
          "D": "big a wooden"
        },
        "correctAnswer": "B",
        "explanation": "Theo quy tắc OpSASCOMP: Size (S) đứng trước Material (M) -> 'big' (Size) đứng trước 'wooden' (Material) -> 'big wooden table'. Chọn B. Chất liệu (wooden) luôn đứng sát danh từ chính.",
        "trapNote": "Chất liệu (wooden) luôn đứng sát danh từ chính.",
        "translation": "Bố tôi đã mua một chiếc bàn _____ cho phòng ăn mới cải tạo của chúng tôi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-2",
        "part": "PART_5",
        "questionText": "She was wearing a _____ dress at the graduation ceremony.\nA. red beautiful\nB. beautiful red\nC. beautiful a red\nD. red a beautiful",
        "options": {
          "A": "red beautiful",
          "B": "beautiful red",
          "C": "beautiful a red",
          "D": "red a beautiful"
        },
        "correctAnswer": "B",
        "explanation": "Theo OpSASCOMP: Opinion (Op) đứng trước Color (C) -> 'beautiful' đứng trước 'red' -> 'beautiful red dress'. Chọn B. Ý kiến khen/chê (beautiful, lovely) luôn đứng đầu cụm tính từ.",
        "trapNote": "Ý kiến khen/chê (beautiful, lovely) luôn đứng đầu cụm tính từ.",
        "translation": "Cô ấy đang mặc một chiếc váy _____ tại buổi lễ tốt nghiệp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-3",
        "part": "PART_5",
        "questionText": "Tom gave his girlfriend a _____ ring on her 20th birthday.\nA. gold shiny\nB. shiny gold\nC. a shiny gold\nD. shiny a gold",
        "options": {
          "A": "gold shiny",
          "B": "shiny gold",
          "C": "a shiny gold",
          "D": "shiny a gold"
        },
        "correctAnswer": "B",
        "explanation": "Opinion (shiny) đứng trước Material (gold) -> 'shiny gold ring'. Chú ý đề bài đã có sẵn mạo từ 'a' trước chỗ trống nên chỉ cần điền 'shiny gold'. Chọn B. Để ý kỹ mạo từ 'a' đã có sẵn trên đề bài.",
        "trapNote": "Để ý kỹ mạo từ 'a' đã có sẵn trên đề bài.",
        "translation": "Tom đã tặng bạn gái một chiếc nhẫn _____ vào ngày sinh nhật thứ 20 của cô ấy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-4",
        "part": "PART_5",
        "questionText": "My grandmother keeps her jewelry in an _____ box.\nA. old wooden small\nB. small old wooden\nC. wooden small old\nD. old small wooden",
        "options": {
          "A": "old wooden small",
          "B": "small old wooden",
          "C": "wooden small old",
          "D": "old small wooden"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng OpSASCOMP: Size (small) -> Age (old) -> Material (wooden). Vậy thứ tự chuẩn là 'small old wooden'. Chọn B. Dễ nhầm giữa Age (old) và Size (small). Nhớ: Size (S) luôn đi trước Age (A).",
        "trapNote": "Dễ nhầm giữa Age (old) và Size (small). Nhớ: Size (S) luôn đi trước Age (A).",
        "translation": "Bà tôi cất giữ đồ trang sức của mình trong một chiếc hộp _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-5",
        "part": "PART_5",
        "questionText": "He has just bought a _____ sports car.\nA. modern German fast\nB. fast modern German\nC. German fast modern\nD. fast German modern",
        "options": {
          "A": "modern German fast",
          "B": "fast modern German",
          "C": "German fast modern",
          "D": "fast German modern"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng OpSASCOMP: Opinion (fast) -> Age (modern) -> Origin (German). Thứ tự chuẩn là 'fast modern German'. Chọn B. Xuất xứ quốc gia (German, Japanese, Vietnamese) luôn đứng sau tuổi tác.",
        "trapNote": "Xuất xứ quốc gia (German, Japanese, Vietnamese) luôn đứng sau tuổi tác.",
        "translation": "Anh ấy vừa mới mua một chiếc xe thể thao _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-6",
        "part": "PART_5",
        "questionText": "She bought a _____ handbag during her summer trip to Milan.\nA. black Italian leather\nB. leather Italian black\nC. Italian black leather\nD. black leather Italian",
        "options": {
          "A": "black Italian leather",
          "B": "leather Italian black",
          "C": "Italian black leather",
          "D": "black leather Italian"
        },
        "correctAnswer": "A",
        "explanation": "Áp dụng OpSASCOMP: Color (C: black) -> Origin (O: Italian) -> Material (M: leather). Thứ tự đúng là 'black Italian leather'. Chọn A. Chất liệu (leather) phải đứng sát nhất với danh từ chính 'handbag'.",
        "trapNote": "Chất liệu (leather) phải đứng sát nhất với danh từ chính 'handbag'.",
        "translation": "Cô ấy đã mua một chiếc túi xách _____ trong chuyến du lịch mùa hè tới Milan.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-7",
        "part": "PART_5",
        "questionText": "At the museum, we admired a _____ vase from the 16th century.\nA. blue ancient porcelain beautiful\nB. beautiful ancient blue porcelain\nC. ancient beautiful blue porcelain\nD. beautiful blue ancient porcelain",
        "options": {
          "A": "blue ancient porcelain beautiful",
          "B": "beautiful ancient blue porcelain",
          "C": "ancient beautiful blue porcelain",
          "D": "beautiful blue ancient porcelain"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng OpSASCOMP: Opinion (beautiful) đứng đầu; Material (porcelain) đứng cuối sát 'vase'. Ở giữa: Age (ancient) đứng trước Color (blue). Ta có trật tự hoàn chỉnh: 'beautiful ancient blue porcelain'. Chọn B. Loại ngay các đáp án không có 'beautiful' đứng đầu hoặc không có 'porcelain' đứng cuối.",
        "trapNote": "Loại ngay các đáp án không có 'beautiful' đứng đầu hoặc không có 'porcelain' đứng cuối.",
        "translation": "Tại viện bảo tàng, chúng tôi đã chiêm ngưỡng một chiếc bình hoa _____ từ thế kỷ 16.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-8",
        "part": "PART_5",
        "questionText": "She sat at a _____ desk in the study corner.\nA. wooden brown square small\nB. small square brown wooden\nC. square small brown wooden\nD. brown small square wooden",
        "options": {
          "A": "wooden brown square small",
          "B": "small square brown wooden",
          "C": "square small brown wooden",
          "D": "brown small square wooden"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy phân biệt Size (S1) và Shape (S2): Kích thước (Size) đứng trước Hình dáng (Shape). Thứ tự chuẩn: Size (small) -> Shape (square) -> Color (brown) -> Material (wooden). Chọn B. Dễ nhầm lẫn vị trí giữa 'small' (kích cỡ) và 'square' (hình dáng). Luôn nhớ S1 = Size trước S2 = Shape.",
        "trapNote": "Dễ nhầm lẫn vị trí giữa 'small' (kích cỡ) và 'square' (hình dáng). Luôn nhớ S1 = Size trước S2 = Shape.",
        "translation": "Cô ấy ngồi tại một chiếc bàn học _____ ở góc phòng học.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-9",
        "part": "PART_5",
        "questionText": "For the camping trip, he brought along a _____ sleeping bag.\nA. warm new green rectangular\nB. new warm rectangular green\nC. warm new rectangular green\nD. rectangular warm green new",
        "options": {
          "A": "warm new green rectangular",
          "B": "new warm rectangular green",
          "C": "warm new rectangular green",
          "D": "rectangular warm green new"
        },
        "correctAnswer": "C",
        "explanation": "Phân tích theo OpSASCOMP: 1) Opinion = warm; 2) Age = new; 3) Shape = rectangular; 4) Color = green; 5) Purpose = sleeping. Thứ tự ghép lại: 'warm new rectangular green sleeping bag'. Chọn C. 'Sleeping' trong 'sleeping bag' là tính từ mục đích (Purpose), phải đứng cố định sát danh từ 'bag'.",
        "trapNote": "'Sleeping' trong 'sleeping bag' là tính từ mục đích (Purpose), phải đứng cố định sát danh từ 'bag'.",
        "translation": "Cho chuyến cắm trại, anh ấy đã mang theo một chiếc túi ngủ _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-12-10",
        "part": "PART_5",
        "questionText": "The bride looked breathtaking in a _____ wedding dress designed by a famous French couturier.\nA. silk gorgeous white vintage\nB. gorgeous vintage white silk\nC. white gorgeous vintage silk\nD. gorgeous silk white vintage",
        "options": {
          "A": "silk gorgeous white vintage",
          "B": "gorgeous vintage white silk",
          "C": "white gorgeous vintage silk",
          "D": "gorgeous silk white vintage"
        },
        "correctAnswer": "B",
        "explanation": "Theo chuẩn OpSASCOMP: 1) Opinion = gorgeous (đứng đầu); 2) Age = vintage; 3) Color = white; 4) Material = silk (đứng cuối trước wedding). Chuỗi đúng: 'gorgeous vintage white silk'. Chọn B. 'vintage' là tính từ chỉ độ tuổi (Age: cổ xưa, kiểu cổ), 'wedding' là tính từ chỉ mục đích (Purpose).",
        "trapNote": "'vintage' là tính từ chỉ độ tuổi (Age: cổ xưa, kiểu cổ), 'wedding' là tính từ chỉ mục đích (Purpose).",
        "translation": "Cô dâu trông lộng lẫy trong chiếc váy cưới _____ được thiết kế bởi nhà mốt nổi tiếng người Pháp.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-13",
    "code": "CD_13",
    "titleVi": "Chuyên đề 13: Mạo Từ",
    "titleEn": "Articles",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Mạo từ (A, An, The và Zero Article) là chuyên đề cơ bản nhưng ẩn chứa nhiều bẫy ngoại lệ nhất trong ngữ pháp tiếng Anh. Đề thi THPT QG và TOEIC thường xuyên kiểm tra việc sử dụng mạo từ trước danh từ số ít/số nhiều, danh từ duy nhất, nhạc cụ, địa danh và các cụm cố định.",
    "formula": "### 1. Mạo từ bất định: A / AN\n- Dùng trước danh từ đếm được số ít, được nhắc đến lần đầu tiên (người nghe chưa biết rõ là ai/cái gì).\n- **Phân biệt A vs AN:** Dựa vào **ÂM ĐẦU TIÊN PHÁT RA** chứ không dựa vào chữ cái viết!\n  * **AN:** Đi trước từ bắt đầu bằng một **NGUYÊN ÂM** (/ə/, /ɪ/, /e/, /æ/, /ɒ/, /ʌ/, /uː/...):\n    * `an apple, an egg, an orange, an umbrella`.\n    * Chữ 'h' câm: `an hour, an honest man, an honor, an heir`.\n  * **A:** Đi trước từ bắt đầu bằng một **PHỤ ÂM**:\n    * `a book, a cat, a dog`.\n    * Chữ viết là nguyên âm (u, e) nhưng phát âm là bán phụ âm /j/: `a university /juːnɪˈvɜːsəti/, a uniform, a European country, a one-way street /wʌn/`.\n\n### 2. Mạo từ xác định: THE\nDùng trước danh từ mà cả người nói và người nghe đều biết rõ đối tượng đó là gì:\n- Đối tượng được nhắc đến lần thứ hai: `I saw a dog. The dog was barking.`\n- Vật thể duy nhất trong vũ trụ: `the Sun, the Moon, the Earth, the sky`.\n- Đứng trước So sánh nhất và Số thứ tự: `the best, the tallest, the first, the second`.\n- Đứng trước tên Nhạc cụ (khi chơi nhạc): `play the piano, play the guitar`.\n- Đứng trước tên Đại dương, sông ngòi, dãy núi, quần đảo: `the Pacific Ocean, the Amazon River, the Alps, the Philippines`.\n- Đứng trước tên quốc gia có dạng số nhiều hoặc chứa 'Republic, Kingdom, States': `the USA, the UK, the Netherlands`.\n- `The + Tính từ` -> Chỉ một tập thể người: `the rich, the poor, the elderly`.\n\n### 3. Không dùng mạo từ (Zero Article - Ø):\n- Trước danh từ số nhiều hoặc danh từ không đếm được nói chung (chung chung):\n  * `Cats are lovely animals.` (Mèo nói chung).\n  * `Water is essential for life.` (Nước nói chung).\n- Trước tên môn thể thao: `play football, play tennis` (không dùng the).\n- Trước tên bữa ăn: `have breakfast, have lunch, have dinner` (trừ khi có tính từ: *have a delicious dinner*).\n- Trước tên môn học, ngôn ngữ: `learn English, study mathematics`.\n- Trước tên lục địa, quốc gia, thành phố số ít: `Asia, Vietnam, Paris, London`.\n- Trước các địa điểm như `bed, hospital, school, church, prison` khi đi đúng mục đích chính:\n  * `He went to prison` (đi tù - làm tù nhân).\n  * `He went to the prison to visit a friend` (đến nhà tù với tư cách khách thăm).",
    "signalWords": [
      "- Nhìn chữ cái đầu tiên: Nếu là 'u, h' -> kiểm tra phát âm (/juː/ dùng 'a'; 'h' câm dùng 'an').\n- Nhìn từ đứng sau:\n  * Thấy nhạc cụ (piano, violin, guitar) + play -> Điền ngay **THE**.\n  * Thấy môn thể thao (football, basketball) + play -> Điền **Ø (Không mạo từ)**.\n  * Thấy số thứ tự (first, second, third) hoặc so sánh nhất (most, -est) -> Điền **THE**.\n  * Thấy danh từ số nhiều nói chung chung -> Điền **Ø**."
    ],
    "traps": [
      "- **Bẫy University:** Nhiều học sinh thấy chữ 'u' là nguyên âm nên chọn 'an university' -> SAI! Vì 'u' ở đây đọc là phụ âm /j/ nên phải dùng **a university**.\n- **Bẫy Hospital / School:** Phân biệt đi đúng mục đích (không mạo từ) và đi để thăm viếng (có THE)."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo phát âm U và H:**\n   - Đọc là \"Diêu\" (/juː/) như *university, uniform, unique* -> Dùng **A**.\n   - 'H' không phát âm (câm) như *hour, honest, honor* -> Dùng **AN**.\n2. **Mẹo Nhạc cụ vs Thể thao:**\n   - **Chơi nhạc cụ thì CÓ THE** (`play the guitar`).\n   - **Chơi thể thao thì KHÔNG THE** (`play football`).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-13-1",
        "part": "PART_5",
        "questionText": "My younger sister wants to study at _____ university in the United Kingdom.\nA. a\nB. an\nC. the\nD. Ø",
        "options": {
          "A": "a",
          "B": "an",
          "C": "the",
          "D": "Ø"
        },
        "correctAnswer": "A",
        "explanation": "Từ 'university' phát âm là /ˌjuːnɪˈvɜːsəti/ (bắt đầu bằng bán phụ âm /j/). Vì bắt đầu bằng phụ âm nên mạo từ bất định đi kèm phải là 'a' chứ không phải 'an'. Chọn A. Bẫy thấy chữ 'u' tưởng là nguyên âm nên vội chọn 'an'.",
        "trapNote": "Bẫy thấy chữ 'u' tưởng là nguyên âm nên vội chọn 'an'.",
        "translation": "Em gái tôi muốn học tại _____ trường đại học ở Vương quốc Anh.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-2",
        "part": "PART_5",
        "questionText": "We have been waiting for the bus for _____ hour in the freezing cold.\nA. a\nB. an\nC. the\nD. Ø",
        "options": {
          "A": "a",
          "B": "an",
          "C": "the",
          "D": "Ø"
        },
        "correctAnswer": "B",
        "explanation": "'hour' có chữ cái đầu 'h' là âm câm, phát âm là /ˈaʊə(r)/ (bắt đầu bằng nguyên âm /aʊ/). Do đó mạo từ bất định bắt buộc là 'an'. Chọn B. Nhớ các từ 'h' câm: an hour, an honest person, an honor.",
        "trapNote": "Nhớ các từ 'h' câm: an hour, an honest person, an honor.",
        "translation": "Chúng tôi đã chờ xe buýt suốt _____ tiếng đồng hồ trong giá lạnh.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-3",
        "part": "PART_5",
        "questionText": "My son loves playing _____ piano, while my daughter enjoys playing _____ tennis.\nA. the / the\nB. the / Ø\nC. Ø / the\nD. Ø / Ø",
        "options": {
          "A": "the / the",
          "B": "the / Ø",
          "C": "Ø / the",
          "D": "Ø / Ø"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc kinh điển: Đi với nhạc cụ phải có mạo từ 'the' (`play the piano`); đi với môn thể thao thì KHÔNG dùng mạo từ (`play tennis`). Đáp án là 'the / Ø'. Chọn B. Nhớ thần chú: 'Chơi đàn có The, chơi bóng không The'.",
        "trapNote": "Nhớ thần chú: 'Chơi đàn có The, chơi bóng không The'.",
        "translation": "Con trai tôi thích chơi _____ đàn piano, trong khi con gái tôi thích chơi _____ quần vợt.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-4",
        "part": "PART_5",
        "questionText": "_____ Earth revolves around _____ Sun once every 365 days.\nA. The / a\nB. An / the\nC. The / the\nD. Ø / the",
        "options": {
          "A": "The / a",
          "B": "An / the",
          "C": "The / the",
          "D": "Ø / the"
        },
        "correctAnswer": "C",
        "explanation": "Đối với các vật thể duy nhất, độc nhất vô nhị trong tự nhiên/vũ trụ (the Sun, the Moon, the Earth, the sky), ta bắt buộc phải dùng mạo từ xác định 'The'. Cả 2 vị trí đều điền 'The'. Chọn C. Không bao giờ dùng 'a Sun' hay 'an Earth'.",
        "trapNote": "Không bao giờ dùng 'a Sun' hay 'an Earth'.",
        "translation": "_____ Trái Đất quay xung quanh _____ Mặt Trời một lần mỗi 365 ngày.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-5",
        "part": "PART_5",
        "questionText": "Neil Armstrong was _____ first man to walk on the moon.\nA. a\nB. an\nC. the\nD. Ø",
        "options": {
          "A": "a",
          "B": "an",
          "C": "the",
          "D": "Ø"
        },
        "correctAnswer": "C",
        "explanation": "Trước các số thứ tự (first, second, third, next, last) luôn dùng mạo từ xác định 'The' (`the first man`). Chọn C. Dễ nhầm với số đếm (one, two, three không dùng the).",
        "trapNote": "Dễ nhầm với số đếm (one, two, three không dùng the).",
        "translation": "Neil Armstrong là người đàn ông _____ tiên đi bộ trên mặt trăng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-6",
        "part": "PART_5",
        "questionText": "_____ lions are wild animals that live in pride.\nA. A\nB. An\nC. The\nD. Ø",
        "options": {
          "A": "A",
          "B": "An",
          "C": "The",
          "D": "Ø"
        },
        "correctAnswer": "D",
        "explanation": "Khi nói về một loài động vật hoặc đồ vật nói chung ở dạng danh từ số nhiều ('lions'), ta KHÔNG dùng mạo từ (Zero article). Chọn D. Nhiều học sinh hay quen tay điền 'The lions' dù câu đang nói về loài sư tử nói chung.",
        "trapNote": "Nhiều học sinh hay quen tay điền 'The lions' dù câu đang nói về loài sư tử nói chung.",
        "translation": "_____ sư tử là loài động vật hoang dã sống theo bầy đàn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-7",
        "part": "PART_5",
        "questionText": "Last summer, our family spent a wonderful holiday exploring _____ Pacific Ocean and visiting _____ Philippines.\nA. the / the\nB. the / Ø\nC. Ø / the\nD. Ø / Ø",
        "options": {
          "A": "the / the",
          "B": "the / Ø",
          "C": "Ø / the",
          "D": "Ø / Ø"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc địa danh: 1) Tên các đại dương, biển, sông luôn có 'The' (the Pacific Ocean, the Red Sea). 2) Tên quốc gia tận cùng là số nhiều (s) hoặc quần đảo luôn có 'The' (the Philippines, the Netherlands, the United States). Cả hai vị trí đều dùng 'The'. Chọn A. Các quốc gia số ít như Vietnam, Japan, France không dùng The, nhưng The Philippines có 's' nên bắt buộc có The.",
        "trapNote": "Các quốc gia số ít như Vietnam, Japan, France không dùng The, nhưng The Philippines có 's' nên bắt buộc có The.",
        "translation": "Mùa hè năm ngoái, gia đình chúng tôi đã trải qua kỳ nghỉ tuyệt vời khám phá _____ Thái Bình Dương và thăm _____ Phi-líp-pin.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-8",
        "part": "PART_5",
        "questionText": "We usually have _____ breakfast at 7 AM, but today we had _____ delicious breakfast at a fancy bistro.\nA. Ø / a\nB. a / a\nC. the / a\nD. Ø / Ø",
        "options": {
          "A": "Ø / a",
          "B": "a / a",
          "C": "the / a",
          "D": "Ø / Ø"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc với tên bữa ăn (breakfast, lunch, dinner): Thông thường KHÔNG dùng mạo từ (`have breakfast`). NHƯNG khi có tính từ đứng trước miêu tả bữa ăn (delicious, heavy, big), bắt buộc phải dùng mạo từ bất định 'a' (`have a delicious breakfast`). Đáp án là 'Ø / a'. Chọn A. Học sinh thường nhớ vẹt 'bữa ăn không có mạo từ' mà quên ngoại lệ khi có tính từ đứng trước.",
        "trapNote": "Học sinh thường nhớ vẹt 'bữa ăn không có mạo từ' mà quên ngoại lệ khi có tính từ đứng trước.",
        "translation": "Chúng tôi thường ăn _____ bữa sáng lúc 7 giờ sáng, nhưng hôm nay chúng tôi đã ăn _____ bữa sáng ngon miệng tại một quán rượu sang trọng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-9",
        "part": "PART_5",
        "questionText": "The injured pedestrian was rushed to _____ hospital, while his brother went to _____ hospital to bring him clean clothes.\nA. Ø / the\nB. the / Ø\nC. the / the\nD. Ø / Ø",
        "options": {
          "A": "Ø / the",
          "B": "the / Ø",
          "C": "the / the",
          "D": "Ø / Ø"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc địa điểm công cộng (hospital, school, prison, church, bed): Đến đúng mục đích chính của nơi đó (người bệnh nhập viện cấp cứu) -> KHÔNG dùng mạo từ (`to hospital`). Đến với mục đích khác ngoài chức năng chính (người nhà đến thăm, mang đồ) -> BẮT BUỘC có mạo từ 'the' (`to the hospital`). Chọn A. Bẫy ngữ nghĩa cực kỳ tinh tế, phải đọc hết cả 2 vế để xác định mục đích của từng nhân vật.",
        "trapNote": "Bẫy ngữ nghĩa cực kỳ tinh tế, phải đọc hết cả 2 vế để xác định mục đích của từng nhân vật.",
        "translation": "Người đi bộ bị thương được đưa gấp đến _____ bệnh viện, trong khi anh trai anh ấy đến _____ bệnh viện để mang quần áo sạch cho anh ấy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-13-10",
        "part": "PART_5",
        "questionText": "He was elected _____ President of the student council for the second consecutive year.\nA. a\nB. the\nC. an\nD. Ø",
        "options": {
          "A": "a",
          "B": "the",
          "C": "an",
          "D": "Ø"
        },
        "correctAnswer": "D",
        "explanation": "Quy tắc đặc biệt với các chức danh/vị trí duy nhất: Sau các động từ bổ nhiệm, bầu cử như `elect, appoint, make, declare` đi kèm chức danh duy nhất trong tổ chức (President, Chairman, Captain), ta KHÔNG dùng mạo từ (Zero article). Do đó 'elected President'. Chọn D. Học sinh thường nghĩ 'President' là duy nhất nên vội vàng chọn 'the President'. Sau động từ 'elect' thì KHÔNG dùng 'the'.",
        "trapNote": "Học sinh thường nghĩ 'President' là duy nhất nên vội vàng chọn 'the President'. Sau động từ 'elect' thì KHÔNG dùng 'the'.",
        "translation": "Anh ấy đã được bầu làm _____ Chủ tịch hội sinh viên năm thứ hai liên tiếp.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-14",
    "code": "CD_14",
    "titleVi": "Chuyên đề 14: Cấu Tạo Từ",
    "titleEn": "Word Formation",
    "part": "Part 5",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Cấu tạo từ (Word Formation / Word Forms) là dạng câu hỏi chiếm tỉ trọng cao nhất trong phần Ngữ pháp TOEIC Part 5 (từ 8-12 câu) và xuất hiện cố định trong đề thi THPT QG. Bí quyết để làm đúng 100% dạng bài này trong 5 giây là xác định vị trí ngữ pháp của chỗ trống (cần Danh từ, Động từ, Tính từ hay Trạng từ) thông qua các từ đứng trước và sau nó.",
    "formula": "### 1. Vị trí ngữ pháp của DANH TỪ (Noun):\n- Làm Chủ ngữ đứng đầu câu: `[Noun] + Verb...`\n- Đứng sau Mạo từ (`a, an, the`), Chỉ định từ (`this, that, these, those`), Từ chỉ số lượng (`many, some, few`).\n- Đứng sau Tính từ sở hữu: `my, your, his, her, its, our, their`.\n- Đứng sau Giới từ: `in, on, at, with, about + [Noun]`.\n- Đứng sau Tính từ: `Adj + [Noun]`.\n- **Hậu tố nhận biết Danh từ:** `-tion, -sion, -ment, -ance, -ence, -ity, -ness, -ship, -er, -or, -ant, -ee, -ism`.\n\n### 2. Vị trí ngữ pháp của TÍNH TỪ (Adjective):\n- Đứng trước Danh từ bổ nghĩa: `[Adj] + Noun` (vd: an *important* meeting).\n- Đứng sau Động từ 'To be': `S + be + [Adj]` (vd: She is *happy*).\n- Đứng sau Linking Verbs (Động từ nối): `seem, look, feel, taste, smell, sound, become, get + [Adj]`.\n- Trong cấu trúc đặc biệt: `make / keep / find + Object + [Adj]` (vd: keep it *clean*).\n- **Hậu tố nhận biết Tính từ:** `-ful, -less, -able, -ible, -ive, -ous, -ic, -al, -ish, -ary, -ed, -ing`.\n\n### 3. Vị trí ngữ pháp của TRẠNG TỪ (Adverb):\n- Đứng đầu câu ngăn cách bởi dấu phẩy: `[Adv], S + V...` (vd: *Fortunately*, we passed).\n- Bổ nghĩa cho Động từ thường (đứng trước hoặc đứng sau động từ/tân ngữ): `S + [Adv] + V` hoặc `S + V + O + [Adv]`.\n- Đứng trước Tính từ để bổ nghĩa: `[Adv] + Adj` (vd: *extremely* important).\n- Đứng giữa trợ động từ và động từ chính: `have + [Adv] + V3` hoặc `be + [Adv] + V-ing/V3`.\n- **Hậu tố nhận biết Trạng từ:** Đa số tận cùng là `-ly` (`carefully, quickly, successfully`). Mẹo: `Tính từ + ly = Trạng từ`.\n\n### 4. Vị trí ngữ pháp của ĐỘNG TỪ (Verb):\n- Đứng sau Chủ ngữ để tạo thành câu hoàn chỉnh: `S + [Verb] + O`.\n- Đứng sau Động từ khuyết thiếu: `can, could, should, will + [V-bare]`.\n- **Hậu tố nhận biết Động từ:** `-ize / -ise` (organize), `-en` (widen, shorten), `-ate` (calculate), `-ify` (simplify).\n\n### 5. Tiền tố mang nghĩa PHỦ ĐỊNH / TRÁI NGƯỢC:\n- `un-`: unhappy, uncomfortable.\n- `dis-`: disagree, dishonest, disappear.\n- `im-` (trước p, m): impossible, impolite, immature.\n- `in-`: incorrect, independent.\n- `ir-` (trước r): irregular, irresponsible.\n- `il-` (trước l): illegal, illiterate.\n- `mis-` (sai lầm): misunderstand, mislead.",
    "signalWords": [
      "- Nhìn từ đứng NGAY TRƯỚC và NGAY SAU chỗ trống:\n  * Trước là `Mạo từ / Tính từ sở hữu / Giới từ` và sau là Giới từ hoặc Dấu chấm -> Cần **DANH TỪ**.\n  * Trước là `Mạo từ` và sau là `Danh từ` -> Cần **TÍNH TỪ** đứng giữa.\n  * Trước là `Động từ thường` -> Cần **TRẠNG TỪ** bổ nghĩa.\n  * Trước là `Trợ động từ (have/is)` và sau là `Động từ chính (V3/V-ing)` -> Cần **TRẠNG TỪ** chen giữa.\n  * Đầu câu có dấu phẩy `,` -> Cần **TRẠNG TỪ**."
    ],
    "traps": [
      "- **Bẫy cụm Danh từ ghép:** Đôi khi đứng trước danh từ không phải là tính từ mà là một danh từ khác để tạo thành danh từ ghép (vd: `sales representative`, `safety regulation`).\n- **Bẫy tính từ đuôi -ly:** Một số từ tận cùng là `-ly` nhưng là TÍNH TỪ: `friendly, costly, lovely, timely, daily, monthly`."
    ],
    "examples": [
      {
        "sentence": "1. **Quy tắc kẹp bánh mì kinh điển:**\n   - `Mạo từ / TTSH + [TÍNH TỪ] + DANH TỪ`.\n   - `Be / Have + [TRẠNG TỪ] + V3 / V-ed`.\n2. **Mẹo bóc đuôi -ly:**\n   - Muốn tìm Tính từ nhanh trong 4 đáp án: Nhìn đáp án có đuôi `-ly` (Trạng từ), bỏ đuôi `-ly` đi sẽ ra ngay Tính từ!\n     *(Ví dụ: 'successfully' bỏ -ly -> 'successful' là Tính từ)*.\n3. **Mẹo chọn Danh từ chỉ người vs chỉ vật:**\n   - Đuôi `-er, -or, -ant, -ee` là Danh từ chỉ NGƯỜI (applicant, employee, actor).\n   - Đuôi `-tion, -ment, -ance` là Danh từ chỉ VẬT / SỰ VIỆC (application, employment, action).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-14-1",
        "part": "PART_5",
        "questionText": "The company has achieved significant _____ in reducing manufacturing costs.\nA. succeed\nB. success\nC. successful\nD. successfully",
        "options": {
          "A": "succeed",
          "B": "success",
          "C": "successful",
          "D": "successfully"
        },
        "correctAnswer": "B",
        "explanation": "Sau một tính từ ('significant') bắt buộc phải là một DANH TỪ. 'success' là danh từ có nghĩa là sự thành công. Chọn B. 'succeed' là động từ, 'successful' là tính từ. Cần xác định đúng đuôi danh từ.",
        "trapNote": "'succeed' là động từ, 'successful' là tính từ. Cần xác định đúng đuôi danh từ.",
        "translation": "Công ty đã đạt được _____ đáng kể trong việc cắt giảm chi phí sản xuất.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-2",
        "part": "PART_5",
        "questionText": "She completed the comprehensive financial report very _____.\nA. quick\nB. quickly\nC. quickness\nD. quicker",
        "options": {
          "A": "quick",
          "B": "quickly",
          "C": "quickness",
          "D": "quicker"
        },
        "correctAnswer": "B",
        "explanation": "Bổ nghĩa cho động từ hành động đã có tân ngữ hoàn chỉnh 'completed the report' cần một TRẠNG TỪ chỉ cách thức (đuôi -ly). Do đó chọn 'quickly'. Chọn B. Nhiều bạn thấy 'very' liền vội vàng chọn tính từ 'quick', nhưng 'very' có thể bổ nghĩa cho cả tính từ lẫn trạng từ.",
        "trapNote": "Nhiều bạn thấy 'very' liền vội vàng chọn tính từ 'quick', nhưng 'very' có thể bổ nghĩa cho cả tính từ lẫn trạng từ.",
        "translation": "Cô ấy đã hoàn thành bản báo cáo tài chính toàn diện rất _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-3",
        "part": "PART_5",
        "questionText": "Our new air conditioning system is extremely _____ and energy-saving.\nA. economy\nB. economic\nC. economical\nD. economically",
        "options": {
          "A": "economy",
          "B": "economic",
          "C": "economical",
          "D": "economically"
        },
        "correctAnswer": "C",
        "explanation": "Vị trí sau 'is extremely' cần một TÍNH TỪ. Phân biệt 2 tính từ: 'economic' (thuộc về nền kinh tế, vd: economic crisis), còn 'economical' (tiết kiệm tiền bạc/nhiên liệu). Đi cùng 'energy-saving' phải là 'economical'. Chọn C. Bẫy lẫn lộn giữa hai tính từ 'economic' và 'economical'.",
        "trapNote": "Bẫy lẫn lộn giữa hai tính từ 'economic' và 'economical'.",
        "translation": "Hệ thống điều hòa không khí mới của chúng tôi vô cùng _____ và tiết kiệm năng lượng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-4",
        "part": "PART_5",
        "questionText": "_____, the storm changed its direction before reaching the mainland.\nA. Fortune\nB. Fortunate\nC. Fortunately\nD. Unfortunate",
        "options": {
          "A": "Fortune",
          "B": "Fortunate",
          "C": "Fortunately",
          "D": "Unfortunate"
        },
        "correctAnswer": "C",
        "explanation": "Đứng ở đầu câu ngăn cách bằng dấu phẩy bổ nghĩa cho toàn bộ câu phía sau bắt buộc phải là một TRẠNG TỪ (Sentence Adverb). 'Fortunately' mang nghĩa may mắn thay. Chọn C. Vị trí kinh điển trong đề thi: Đứng đầu câu có dấu phẩy -> 99% chọn Trạng từ đuôi -ly.",
        "trapNote": "Vị trí kinh điển trong đề thi: Đứng đầu câu có dấu phẩy -> 99% chọn Trạng từ đuôi -ly.",
        "translation": "_____, cơn bão đã đổi hướng trước khi đổ bộ vào đất liền.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-5",
        "part": "PART_5",
        "questionText": "The newly hired engineers have _____ implemented the new software system.\nA. success\nB. successful\nC. successfully\nD. succeed",
        "options": {
          "A": "success",
          "B": "successful",
          "C": "successfully",
          "D": "succeed"
        },
        "correctAnswer": "C",
        "explanation": "Áp dụng quy tắc kẹp bánh mì: Đứng giữa trợ động từ (have/has/had) và động từ chính (V3/ed) bắt buộc phải là một TRẠNG TỪ (Adverb) để bổ nghĩa cho hành động. Do đó chọn 'successfully'. Chọn C. Vị trí kẹp giữa 'Have ... V3' xuất hiện liên tục trong Part 5 TOEIC.",
        "trapNote": "Vị trí kẹp giữa 'Have ... V3' xuất hiện liên tục trong Part 5 TOEIC.",
        "translation": "Các kỹ sư mới được tuyển dụng đã triển khai _____ hệ thống phần mềm mới.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-6",
        "part": "PART_5",
        "questionText": "Due to poor health, he was forced to announce his early _____ from professional sports.\nA. retire\nB. retirement\nC. retired\nD. retiring",
        "options": {
          "A": "retire",
          "B": "retirement",
          "C": "retired",
          "D": "retiring"
        },
        "correctAnswer": "B",
        "explanation": "Sau tính từ sở hữu và tính từ (`his early + _____`) bắt buộc phải là một DANH TỪ. Danh từ có đuôi '-ment' là 'retirement'. Chọn B. Xác định nhanh hậu tố danh từ: -ment, -tion, -ness, -ity.",
        "trapNote": "Xác định nhanh hậu tố danh từ: -ment, -tion, -ness, -ity.",
        "translation": "Do sức khỏe yếu, anh ấy buộc phải tuyên bố sự _____ sớm khỏi thể thao chuyên nghiệp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-7",
        "part": "PART_5",
        "questionText": "Over 500 qualified _____ have submitted their documents for the management training program.\nA. apply\nB. application\nC. applicants\nD. applicable",
        "options": {
          "A": "apply",
          "B": "application",
          "C": "applicants",
          "D": "applicable"
        },
        "correctAnswer": "C",
        "explanation": "Vị trí chủ ngữ cần danh từ số nhiều. Phân biệt danh từ chỉ vật 'application' (đơn từ) và danh từ chỉ người 'applicants' (người nộp đơn). Chỉ có con người mới có thể 'nộp hồ sơ của họ' (`submitted their documents`) -> Chọn danh từ chỉ người số nhiều 'applicants'. Chọn C. Bẫy phân biệt danh từ chỉ người đuôi '-ant' và danh từ chỉ vật đuôi '-tion'.",
        "trapNote": "Bẫy phân biệt danh từ chỉ người đuôi '-ant' và danh từ chỉ vật đuôi '-tion'.",
        "translation": "Hơn 500 _____ đủ điều kiện đã nộp hồ sơ cho chương trình đào tạo quản lý.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-8",
        "part": "PART_5",
        "questionText": "Regular exercise and a balanced diet are _____ for maintaining long-term physical health.\nA. benefit\nB. beneficial\nC. beneficially\nD. beneficiary",
        "options": {
          "A": "benefit",
          "B": "beneficial",
          "C": "beneficially",
          "D": "beneficiary"
        },
        "correctAnswer": "B",
        "explanation": "Sau to be 'are' cần một TÍNH TỪ đóng vai trò vị ngữ. Cấu trúc: `be beneficial to/for sth` (có lợi cho cái gì). Chọn tính từ đuôi '-ial' là 'beneficial'. Chọn B. 'beneficiary' là danh từ chỉ người thụ hưởng (bảo hiểm/di chúc), không phải tính từ.",
        "trapNote": "'beneficiary' là danh từ chỉ người thụ hưởng (bảo hiểm/di chúc), không phải tính từ.",
        "translation": "Tập thể dục thường xuyên và chế độ ăn cân bằng rất _____ cho việc duy trì sức khỏe thể chất lâu dài.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-9",
        "part": "PART_5",
        "questionText": "The instructions provided in the user manual were so _____ that several customers assembled the product incorrectly.\nA. clear\nB. clearly\nC. misleading\nD. misled",
        "options": {
          "A": "clear",
          "B": "clearly",
          "C": "misleading",
          "D": "misled"
        },
        "correctAnswer": "C",
        "explanation": "Sau 'were so' cần một TÍNH TỪ. Ngữ cảnh khách hàng làm sai chứng tỏ bản hướng dẫn 'gây hiểu lầm, sai lệch'. Tính từ chỉ bản chất của tài liệu/hướng dẫn mang tính chủ động là 'misleading' (tiền tố mis- nghĩa là sai). Chọn C. Vừa phải chọn đúng từ loại tính từ, vừa phải hiểu nghĩa và tiền tố phủ định 'mis-'.",
        "trapNote": "Vừa phải chọn đúng từ loại tính từ, vừa phải hiểu nghĩa và tiền tố phủ định 'mis-'.",
        "translation": "Các hướng dẫn được cung cấp trong sổ tay quá _____ đến nỗi mà vài khách hàng đã lắp ráp sản phẩm sai cách.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-14-10",
        "part": "PART_5",
        "questionText": "The marketing director is looking for an energetic _____ to lead the regional advertising team.\nA. represent\nB. representation\nC. representative\nD. representational",
        "options": {
          "A": "represent",
          "B": "representation",
          "C": "representative",
          "D": "representational"
        },
        "correctAnswer": "C",
        "explanation": "Bẫy hậu tố kinh điển trong TOEIC: Từ 'representative' có đuôi '-ive' thường là tính từ, nhưng nó lại là một DANH TỪ ĐẶC BIỆT CHỈ NGƯỜI có nghĩa là 'người đại diện' (sales representative). Để dẫn dắt một đội nhóm thì bắt buộc phải là con người -> Chọn 'representative'. Chọn C. Học sinh thấy đuôi '-ive' tưởng là tính từ nên loại bỏ, chọn nhầm 'representation' chỉ sự việc.",
        "trapNote": "Học sinh thấy đuôi '-ive' tưởng là tính từ nên loại bỏ, chọn nhầm 'representation' chỉ sự việc.",
        "translation": "Giám đốc tiếp thị đang tìm kiếm một _____ đầy năng lượng để dẫn dắt đội ngũ quảng cáo khu vực.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-15",
    "code": "CD_15",
    "titleVi": "Chuyên đề 15: Từ Chỉ Số Lượng",
    "titleEn": "Expressions of Quantity",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Từ chỉ số lượng (Quantifiers) như some, any, much, many, few, little, each, every, all, both, neither... là chuyên đề ngữ pháp then chốt. Nắm chắc chuyên đề này giúp thí sinh không bị mất điểm trong các câu hỏi chọn lượng từ phù hợp với danh từ đếm được và không đếm được.",
    "formula": "### 1. Phân loại Danh từ Đếm được và Không đếm được:\n- **Danh từ đếm được số nhiều (Countable Plural Nouns):** Có dạng số nhiều (thêm s/es): `books, students, apples, cars`.\n- **Danh từ không đếm được (Uncountable Nouns):** Luôn ở dạng số ít, không thêm s/es: `water, money, information, advice, news, furniture, equipment, traffic, luggage, knowledge`.\n\n### 2. Các cặp lượng từ cơ bản:\n- **SOME vs ANY:**\n  * `Some`: Dùng trong câu KHẲNG ĐỊNH và câu LỜI MỜI / YÊU CẦU lịch sự (`Would you like some coffee?`).\n  * `Any`: Dùng trong câu PHỦ ĐỊNH và NGHI VẤN (`Do you have any questions?` / `I don't have any money.`).\n- **MANY vs MUCH:**\n  * `Many + Danh từ đếm được số nhiều` (many books, many people).\n  * `Much + Danh từ không đếm được` (much water, much time, much money).\n- **A LOT OF / LOTS OF:** Đi được với CẢ HAI loại danh từ (dùng phổ biến trong câu khẳng định).\n\n### 3. Cặp phân loại thí sinh kinh điển: FEW vs LITTLE\n- **Đi với Danh từ ĐẾM ĐƯỢC số nhiều:**\n  * `Few`: Rất ít, hầu như không có (mang hàm ý tiêu cực, thiếu thốn).\n  * `A few`: Một vài, một ít (đủ để dùng, mang hàm ý tích cực).\n- **Đi với Danh từ KHÔNG ĐẾM ĐƯỢC:**\n  * `Little`: Rất ít, hầu như không có (mang hàm ý tiêu cực, không đủ).\n  * `A little`: Một chút, một ít (đủ để dùng, mang hàm ý tích cực).\n\n### 4. EACH vs EVERY:\n- `Each + Danh từ số ít + Động từ số ít` (nhấn mạnh từng cá thể riêng biệt trong nhóm từ 2 trở lên).\n- `Every + Danh từ số ít + Động từ số ít` (nhấn mạnh tất cả mọi thành viên như một tập thể trong nhóm từ 3 trở lên).\n\n### 5. BOTH, EITHER, NEITHER, ALL, NONE:\n- Dùng cho nhóm **2 đối tượng**:\n  * `Both A and B`: Cả hai (đi với động từ số nhiều).\n  * `Either A or B`: Hoặc cái này hoặc cái kia (chia theo B).\n  * `Neither A nor B`: Cả hai đều không (chia theo B).\n- Dùng cho nhóm **TỪ 3 ĐỐI TƯỢNG TRỞ LÊN**:\n  * `All`: Tất cả (đi với danh từ số nhiều).\n  * `None of + N`: Không ai / không cái nào trong số đó.",
    "signalWords": [
      "- Nhìn ngay danh từ đứng SAU lượng từ:\n  * Nếu danh từ có đuôi '-s/-es' (đếm được số nhiều) -> Dùng `many, few, a few, several, both`.\n  * Nếu danh từ là danh từ không đếm được (money, information, water, time) -> Dùng `much, little, a little`.\n  * Nếu danh từ là số ít không có 's' -> Dùng `each, every, either, neither`.\n- Đọc sắc thái câu:\n  * Mang nghĩa tích cực (còn đủ dùng) -> Chọn `a few` hoặc `a little`.\n  * Mang nghĩa tiêu cực (thiếu thốn, không đủ, hầu như không có) -> Chọn `few` hoặc `little`."
    ],
    "traps": [
      "- **Bẫy danh từ không đếm được trong tiếng Anh:** Các từ sau trong tiếng Việt đếm được nhưng trong tiếng Anh là KHÔNG ĐẾM ĐƯỢC: `advice, information, furniture, equipment, luggage, homework, news`. Tuyệt đối không dùng many/few trước các từ này.\n- **Bẫy Every of:** Tiếng Anh KHÔNG CÓ 'Every of'. Chỉ có **Each of** hoặc **Every one of**."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú chữ A:**\n   - **Có 'A' là còn** (A few / A little = còn một ít, đủ dùng).\n   - **Không 'A' là không** (Few / Little = hầu như không có, thiếu thốn).\n2. **Mẹo loại trừ siêu tốc:**\n   - Thấy danh từ không đếm được (`information, advice, furniture`) -> Gạch ngay các đáp án `many, few, a few, several`!\n3. **Mẹo Would you like:**\n   - Dù là câu hỏi có dấu hỏi chấm `?`, nếu là lời mời `Would you like...` thì BẮT BUỘC dùng **SOME**, không dùng Any!",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-15-1",
        "part": "PART_5",
        "questionText": "How _____ money did you spend on that designer handbag?\nA. many\nB. much\nC. few\nD. little",
        "options": {
          "A": "many",
          "B": "much",
          "C": "few",
          "D": "little"
        },
        "correctAnswer": "B",
        "explanation": "'money' là danh từ không đếm được. Câu hỏi hỏi số lượng với danh từ không đếm được là 'How much'. Chọn B. Nhiều người đếm được tờ tiền (bills, dollars) nhưng từ 'money' trong tiếng Anh là danh từ không đếm được.",
        "trapNote": "Nhiều người đếm được tờ tiền (bills, dollars) nhưng từ 'money' trong tiếng Anh là danh từ không đếm được.",
        "translation": "Bạn đã chi bao nhiêu _____ tiền cho chiếc túi xách hàng hiệu đó?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-2",
        "part": "PART_5",
        "questionText": "There are _____ interesting books on the shelf that you might enjoy reading.\nA. much\nB. many\nC. little\nD. a little",
        "options": {
          "A": "much",
          "B": "many",
          "C": "little",
          "D": "a little"
        },
        "correctAnswer": "B",
        "explanation": "'books' là danh từ đếm được số nhiều. Trong 4 đáp án chỉ có 'many' đi với danh từ đếm được số nhiều. Chọn B. Loại ngay much, little, a little vì chúng chỉ đi với danh từ không đếm được.",
        "trapNote": "Loại ngay much, little, a little vì chúng chỉ đi với danh từ không đếm được.",
        "translation": "Có _____ cuốn sách thú vị trên giá sách mà bạn có thể thích đọc.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-3",
        "part": "PART_5",
        "questionText": "Would you like _____ milk in your afternoon tea?\nA. any\nB. some\nC. few\nD. many",
        "options": {
          "A": "any",
          "B": "some",
          "C": "few",
          "D": "many"
        },
        "correctAnswer": "B",
        "explanation": "Ngoại lệ quan trọng: Mặc dù là câu hỏi nghi vấn, nhưng khi câu mang tính chất lời mời mọc, đề nghị lịch sự (`Would you like...`), ta BẮT BUỘC dùng 'some' thay vì 'any'. Chọn B. Bẫy thấy dấu hỏi chấm '?' liền chọn ngay 'any' là mất điểm oan.",
        "trapNote": "Bẫy thấy dấu hỏi chấm '?' liền chọn ngay 'any' là mất điểm oan.",
        "translation": "Bạn có muốn thêm _____ sữa vào tách trà chiều của mình không?",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-4",
        "part": "PART_5",
        "questionText": "He has lived in this city for over a year, but he has _____ friends and often feels lonely.\nA. a few\nB. few\nC. a little\nD. little",
        "options": {
          "A": "a few",
          "B": "few",
          "C": "a little",
          "D": "little"
        },
        "correctAnswer": "B",
        "explanation": "'friends' là danh từ đếm được số nhiều -> loại 'little' và 'a little'. Vì vế sau nói anh ấy 'cô đơn' chứng tỏ anh ấy 'hầu như không có bạn' (mang hàm ý tiêu cực thiếu thốn) -> Dùng 'few' (không có chữ A). Chọn B. Nếu vế sau nói anh ấy vui vẻ vì có người đi chơi cùng thì mới chọn 'a few'.",
        "trapNote": "Nếu vế sau nói anh ấy vui vẻ vì có người đi chơi cùng thì mới chọn 'a few'.",
        "translation": "Anh ấy đã sống ở thành phố này hơn một năm, nhưng anh ấy có _____ bạn bè và thường cảm thấy cô đơn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-5",
        "part": "PART_5",
        "questionText": "Don't worry, we still have _____ time left before our flight boards; we can grab a coffee.\nA. little\nB. a little\nC. few\nD. a few",
        "options": {
          "A": "little",
          "B": "a little",
          "C": "few",
          "D": "a few"
        },
        "correctAnswer": "B",
        "explanation": "'time' (thời gian) là danh từ không đếm được -> loại 'few' và 'a few'. Ngữ cảnh trấn an 'đừng lo, vẫn kịp uống cà phê' mang tính tích cực (vẫn còn đủ thời gian) -> Dùng 'a little'. Chọn B. Phân biệt 'little' (sắp muộn giờ, không kịp) và 'a little' (vẫn còn kịp).",
        "trapNote": "Phân biệt 'little' (sắp muộn giờ, không kịp) và 'a little' (vẫn còn kịp).",
        "translation": "Đừng lo, chúng ta vẫn còn _____ thời gian trước khi chuyến bay lên máy bay; chúng ta có thể uống một tách cà phê.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-6",
        "part": "PART_5",
        "questionText": "_____ student in this advanced class is required to give a five-minute presentation.\nA. Every\nB. All\nC. Many\nD. Several",
        "options": {
          "A": "Every",
          "B": "All",
          "C": "Many",
          "D": "Several"
        },
        "correctAnswer": "A",
        "explanation": "Danh từ 'student' ở dạng số ít và động từ chia 'is'. Trong 4 đáp án, 'All', 'Many', 'Several' đều bắt buộc đi với danh từ số nhiều ('students'). Chỉ có 'Every' đi với danh từ đếm được số ít. Chọn A. Dễ chọn 'All' vì dịch nghĩa 'tất cả học sinh', nhưng 'All' bắt buộc phải là 'All students are...'.",
        "trapNote": "Dễ chọn 'All' vì dịch nghĩa 'tất cả học sinh', nhưng 'All' bắt buộc phải là 'All students are...'.",
        "translation": "_____ học sinh trong lớp nâng cao này đều được yêu cầu thực hiện một bài thuyết trình 5 phút.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-7",
        "part": "PART_5",
        "questionText": "The consultant provided us with valuable _____ on how to optimize our marketing strategy.\nA. an advice\nB. advices\nC. advice\nD. many advices",
        "options": {
          "A": "an advice",
          "B": "advices",
          "C": "advice",
          "D": "many advices"
        },
        "correctAnswer": "C",
        "explanation": "Trong tiếng Anh, 'advice' là danh từ KHÔNG ĐẾM ĐƯỢC tuyệt đối. Do đó, nó không bao giờ có đuôi 's' ('advices' là sai), không đi với mạo từ 'an' ('an advice' là sai), và không đi với 'many'. Từ đúng ngữ pháp duy nhất là 'advice' (hoặc 'a piece of advice'). Chọn C. Bẫy dịch từ tiếng Việt: người Việt hay nói 'một lời khuyên, nhiều lời khuyên' nên rất dễ chọn 'an advice' hoặc 'advices'.",
        "trapNote": "Bẫy dịch từ tiếng Việt: người Việt hay nói 'một lời khuyên, nhiều lời khuyên' nên rất dễ chọn 'an advice' hoặc 'advices'.",
        "translation": "Chuyên gia tư vấn đã cung cấp cho chúng tôi _____ quý báu về cách tối ưu hóa chiến lược tiếp thị.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-8",
        "part": "PART_5",
        "questionText": "I tried on two pairs of formal leather shoes, but _____ of them fitted me comfortably.\nA. both\nB. either\nC. neither\nD. none",
        "options": {
          "A": "both",
          "B": "either",
          "C": "neither",
          "D": "none"
        },
        "correctAnswer": "C",
        "explanation": "Khi nói về 2 đối tượng: Dùng 'both' (cả hai), 'either' (1 trong 2), 'neither' (cả hai đều không). Liên từ 'but' biểu thị kết quả phủ định (thử 2 đôi nhưng không vừa đôi nào). 'None' chỉ dùng cho nhóm từ 3 đối tượng trở lên. Do đó cho 2 đối tượng mang nghĩa phủ định phải dùng 'neither of them'. Chọn C. Bẫy dùng 'none' cho 2 đối tượng. Nhớ: 2 đối tượng dùng 'neither', 3 trở lên mới dùng 'none'.",
        "trapNote": "Bẫy dùng 'none' cho 2 đối tượng. Nhớ: 2 đối tượng dùng 'neither', 3 trở lên mới dùng 'none'.",
        "translation": "Tôi đã thử hai đôi giày da trang trọng, nhưng _____ đôi nào trong số chúng vừa vặn thoải mái.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-9",
        "part": "PART_5",
        "questionText": "_____ candidates passed the preliminary round; only two applicants were selected for the interview.\nA. Hardly any\nB. Almost\nC. A great deal of\nD. Most of",
        "options": {
          "A": "Hardly any",
          "B": "Almost",
          "C": "A great deal of",
          "D": "Most of"
        },
        "correctAnswer": "A",
        "explanation": "'A great deal of' chỉ đi với danh từ không đếm được -> loại C. 'Almost' là trạng từ không đứng trực tiếp trước danh từ (phải là 'almost all candidates') -> loại B. 'Most of' phải đi với mạo từ xác định ('most of the candidates') -> loại D. 'Hardly any + N(số nhiều)' mang nghĩa 'hầu như không có ai' hoàn toàn chính xác về ngữ pháp và ngữ nghĩa. Chọn A. Bẫy dùng 'almost candidates' (sai ngữ pháp, phải là almost all) và 'most of candidates' (thiếu the).",
        "trapNote": "Bẫy dùng 'almost candidates' (sai ngữ pháp, phải là almost all) và 'most of candidates' (thiếu the).",
        "translation": "_____ ứng viên vượt qua được vòng sơ loại; chỉ có hai người được chọn vào phỏng vấn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-15-10",
        "part": "PART_5",
        "questionText": "A large amount of modern office _____ was purchased to equip the newly constructed headquarters.\nA. furniture\nB. furnitures\nC. machine\nD. equipment tools",
        "options": {
          "A": "furniture",
          "B": "furnitures",
          "C": "machine",
          "D": "equipment tools"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc: `A large amount of + Danh từ KHÔNG ĐẾM ĐƯỢC`. Trong các lựa chọn, 'furniture' (đồ nội thất) là danh từ không đếm được (không bao giờ có 's'). 'machine' là danh từ đếm được (nếu dùng amount phải là a large number of machines). Do đó chọn 'furniture'. Chọn A. Phân biệt: `An amount of + N(không đếm được)` vs `A number of + N(đếm được số nhiều)`.",
        "trapNote": "Phân biệt: `An amount of + N(không đếm được)` vs `A number of + N(đếm được số nhiều)`.",
        "translation": "Một lượng lớn đồ nội thất văn phòng hiện đại _____ đã được mua để trang bị cho trụ sở mới xây dựng.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-16",
    "code": "CD_16",
    "titleVi": "Chuyên đề 16: Giới Từ",
    "titleEn": "Prepositions",
    "part": "Part 5",
    "targetScore": "350_500",
    "status": "PUBLISHED",
    "summary": "Giới từ (Prepositions) là mảng ngữ pháp quen thuộc nhưng vô cùng phong phú và dễ gây nhầm lẫn. Trong đề thi THPT QG và TOEIC, các câu hỏi về giới từ thời gian, nơi chốn và đặc biệt là các cụm Cố định (Tính từ/Động từ + Giới từ) xuất hiện với tần suất liên tục từ 3-5 câu.",
    "formula": "### 1. Giới từ chỉ Thời gian:\n- **AT:** Dùng cho thời điểm chính xác, giờ giấc, dịp lễ:\n  * `at 6 o'clock, at noon, at midnight, at night, at the weekend, at Christmas`.\n- **ON:** Dùng cho ngày trong tuần, ngày tháng cụ thể, ngày lễ có từ 'Day':\n  * `on Monday, on May 5th, on Christmas Day, on my birthday, on weekday mornings`.\n- **IN:** Dùng cho khoảng thời gian dài (tháng, năm, mùa, thế kỷ, buổi trong ngày):\n  * `in May, in 2026, in summer, in the 21st century, in the morning/afternoon/evening`.\n- **Giới từ thời gian khác:** `for` (+ khoảng thời gian), `since` (+ mốc thời gian), `during` (+ danh từ sự kiện), `by` (trước một mốc thời gian), `until/till` (cho đến khi).\n\n### 2. Giới từ chỉ Nơi chốn:\n- **AT:** Tại một điểm cụ thể, địa chỉ nhà có số, địa điểm công cộng:\n  * `at home, at school, at the airport, at 120 Main Street`.\n- **ON:** Trên bề mặt, tầng nhà, tên đường phố (không có số nhà), phương tiện công cộng lớn:\n  * `on the table, on the wall, on the second floor, on Oxford Street, on the bus/train/plane` (nhưng: *in a car/taxi*).\n- **IN:** Trong không gian 3 chiều khép kín, trong thành phố, quốc gia, lục địa:\n  * `in the room, in the box, in Hanoi, in Vietnam, in Asia`.\n- **Phân biệt BETWEEN vs AMONG:**\n  * `Between`: Giữa **2 người / 2 vật** (`between you and me`).\n  * `Among`: Giữa **từ 3 người / 3 vật trở lên** (`among the crowd`).\n\n### 3. Các cụm Tính từ + Giới từ hay thi nhất:\n- `proud of`: tự hào về\n- `good at / bad at`: giỏi / dốt về cái gì\n- `interested in`: quan tâm, thích thú\n- `fond of / keen on`: yêu thích\n- `famous for`: nổi tiếng về (= well-known for)\n- `responsible for`: chịu trách nhiệm về (= in charge of)\n- `satisfied with`: hài lòng với (= pleased with)\n- `aware of`: có nhận thức, ý thức về\n- `afraid of / scared of`: sợ hãi\n- `different from`: khác biệt với\n\n### 4. Các cụm Động từ / Danh từ + Giới từ thường gặp:\n- `depend on / rely on`: phụ thuộc vào\n- `succeed in + V-ing`: thành công trong việc gì\n- `congratulate sb on sth`: chúc mừng ai về cái gì\n- `apologize to sb for sth`: xin lỗi ai vì điều gì\n- `prevent / stop sb from + V-ing`: ngăn chặn ai làm gì",
    "signalWords": [
      "- Nhìn từ đứng NGAY TRƯỚC chỗ trống:\n  * Nếu là Tính từ (`proud, good, interested, responsible, famous`) -> Nhớ ngay giới từ đi kèm cố định.\n  * Nếu là Động từ (`depend, congratulate, apologize, prevent, suffer`) -> Nhớ ngay giới từ tương ứng.\n- Nhìn từ đứng NGAY SAU chỗ trống:\n  * Giờ giấc (`6 PM`) -> `at`.\n  * Thứ/ngày (`Monday, July 10th`) -> `on`.\n  * Tháng/năm (`July, 2026`) -> `in`.\n  * Địa chỉ có số nhà (`15 Le Loi St.`) -> `at`; chỉ có tên đường (`Le Loi St.`) -> `on`."
    ],
    "traps": [
      "- **Bẫy Ngày và Tháng:** Nếu chỉ có tháng ('in July') thì dùng IN. Nhưng nếu có ngày đi kèm ('on July 10th') thì BẮT BUỘC dùng **ON**.\n- **Bẫy Street:** 'on Oxford Street' (dùng ON), nhưng 'at 221B Oxford Street' có số nhà cụ thể thì phải dùng **AT**."
    ],
    "examples": [
      {
        "sentence": "1. **Hình phễu thời gian & nơi chốn (Kim tự tháp In - On - At):**\n   - Đỉnh nhọn nhỏ nhất (Cụ thể nhất: giờ giấc, số nhà) -> **AT**.\n   - Thân giữa (Vừa phải: ngày, thứ, tên đường phố) -> **ON**.\n   - Đáy rộng nhất (Rộng lớn: tháng, năm, mùa, thế kỷ, quốc gia, thành phố) -> **IN**.\n2. **Thần chú phương tiện:**\n   - Đứng lên đi lại được (bus, train, plane, ship) -> dùng **ON** (`on the bus`).\n   - Phải chui vào ngồi gập người (car, taxi) -> dùng **IN** (`in a taxi`).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-16-1",
        "part": "PART_5",
        "questionText": "The annual shareholders' meeting will commence promptly _____ 9:00 AM.\nA. in\nB. on\nC. at\nD. to",
        "options": {
          "A": "in",
          "B": "on",
          "C": "at",
          "D": "to"
        },
        "correctAnswer": "C",
        "explanation": "Đi trước giờ giấc cụ thể trong ngày bắt buộc dùng giới từ 'at'. Chọn C. Quy tắc cơ bản, không nhầm với in/on.",
        "trapNote": "Quy tắc cơ bản, không nhầm với in/on.",
        "translation": "Cuộc họp cổ đông thường niên sẽ bắt đầu chính xác vào lúc _____ 9:00 sáng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-2",
        "part": "PART_5",
        "questionText": "The newly elected board of directors will convene _____ Monday morning.\nA. in\nB. on\nC. at\nD. by",
        "options": {
          "A": "in",
          "B": "on",
          "C": "at",
          "D": "by"
        },
        "correctAnswer": "B",
        "explanation": "Dù có từ 'morning' (bình thường dùng in the morning), nhưng do có thứ trong tuần 'Monday' đứng trước nên theo quy tắc ưu tiên cho ngày, bắt buộc phải dùng giới từ 'on'. Chọn B. Nhiều bạn chỉ nhìn chữ 'morning' mà vội vàng chọn 'in' là mắc bẫy.",
        "trapNote": "Nhiều bạn chỉ nhìn chữ 'morning' mà vội vàng chọn 'in' là mắc bẫy.",
        "translation": "Hội đồng quản trị mới được bầu sẽ họp vào _____ sáng thứ Hai.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-3",
        "part": "PART_5",
        "questionText": "Our parents are extremely proud _____ our academic achievements this semester.\nA. about\nB. of\nC. with\nD. for",
        "options": {
          "A": "about",
          "B": "of",
          "C": "with",
          "D": "for"
        },
        "correctAnswer": "B",
        "explanation": "Cụm tính từ cố định: `proud of sth/sb` (tự hào về ai/cái gì). Chọn B. Dịch từ tiếng Việt 'tự hào về' khiến học sinh hay chọn nhầm 'proud about'.",
        "trapNote": "Dịch từ tiếng Việt 'tự hào về' khiến học sinh hay chọn nhầm 'proud about'.",
        "translation": "Bố mẹ chúng tôi vô cùng tự hào _____ những thành tích học tập của chúng tôi trong học kỳ này.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-4",
        "part": "PART_5",
        "questionText": "The company headquarters is located _____ 158 Broadway Street, New York.\nA. on\nB. in\nC. at\nD. from",
        "options": {
          "A": "on",
          "B": "in",
          "C": "at",
          "D": "from"
        },
        "correctAnswer": "C",
        "explanation": "Nếu chỉ có tên đường (Broadway Street) thì dùng giới từ 'on'. Nhưng khi có SỐ NHÀ CỤ THỂ ('158 Broadway Street') thì bắt buộc dùng giới từ 'at'. Chọn C. Bẫy thấy chữ 'Street' là vội chọn 'on' mà bỏ qua số nhà 158 phía trước.",
        "trapNote": "Bẫy thấy chữ 'Street' là vội chọn 'on' mà bỏ qua số nhà 158 phía trước.",
        "translation": "Trụ sở chính của công ty tọa lạc _____ số 158 phố Broadway, Niu Oóc.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-5",
        "part": "PART_5",
        "questionText": "The final decision will strictly depend _____ the outcome of the market research.\nA. in\nB. on\nC. with\nD. to",
        "options": {
          "A": "in",
          "B": "on",
          "C": "with",
          "D": "to"
        },
        "correctAnswer": "B",
        "explanation": "Cụm động từ cố định: `depend on / upon sth` (phụ thuộc vào cái gì = rely on). Chọn B. Dễ nhầm sang giới từ 'in' hoặc 'to'.",
        "trapNote": "Dễ nhầm sang giới từ 'in' hoặc 'to'.",
        "translation": "Quyết định cuối cùng sẽ hoàn toàn phụ thuộc _____ kết quả của cuộc nghiên cứu thị trường.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-6",
        "part": "PART_5",
        "questionText": "The secret code was shared only _____ the three senior directors of the corporation.\nA. between\nB. among\nC. in\nD. with",
        "options": {
          "A": "between",
          "B": "among",
          "C": "in",
          "D": "with"
        },
        "correctAnswer": "B",
        "explanation": "Phân biệt giữa Between và Among: 'Between' dùng cho 2 người/vật; 'Among' dùng cho một nhóm từ 3 người/vật trở lên. Ở đây có 3 giám đốc ('three senior directors') -> Dùng 'among'. Chọn B. Nhiều bạn cứ dịch 'ở giữa' là chọn ngay 'between' mà không đếm số lượng đối tượng.",
        "trapNote": "Nhiều bạn cứ dịch 'ở giữa' là chọn ngay 'between' mà không đếm số lượng đối tượng.",
        "translation": "Mã bí mật chỉ được chia sẻ _____ ba giám đốc cấp cao của tập đoàn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-7",
        "part": "PART_5",
        "questionText": "The security guards managed to prevent the protesters _____ entering the restricted government building.\nA. from\nB. to\nC. with\nD. against",
        "options": {
          "A": "from",
          "B": "to",
          "C": "with",
          "D": "against"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc cố định: `prevent / stop / discourage sb FROM + V-ing` (ngăn chặn ai làm việc gì). Chọn A. Dễ nhầm với cấu trúc 'warn sb against V-ing' hoặc 'forbid sb to V'.",
        "trapNote": "Dễ nhầm với cấu trúc 'warn sb against V-ing' hoặc 'forbid sb to V'.",
        "translation": "Các nhân viên an ninh đã ngăn chặn được những người biểu tình _____ đi vào tòa nhà chính phủ bị hạn chế.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-8",
        "part": "PART_5",
        "questionText": "The CEO congratulated all department heads _____ their outstanding contributions to the successful merger.\nA. for\nB. on\nC. about\nD. with",
        "options": {
          "A": "for",
          "B": "on",
          "C": "about",
          "D": "with"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc kinh điển: `congratulate sb ON sth / V-ing` (chúc mừng ai vì điều gì). Mặc dù tiếng Việt nói 'chúc mừng vì' khiến học sinh hay chọn 'for', nhưng giới từ bắt buộc trong tiếng Anh là 'on'. Chọn B. Bẫy dịch nghĩa tiếng Việt chọn 'congratulate for' là sai ngữ pháp tiếng Anh.",
        "trapNote": "Bẫy dịch nghĩa tiếng Việt chọn 'congratulate for' là sai ngữ pháp tiếng Anh.",
        "translation": "Tổng giám đốc đã chúc mừng tất cả các trưởng bộ phận _____ những đóng góp xuất sắc của họ cho vụ sáp nhập thành công.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-9",
        "part": "PART_5",
        "questionText": "The new employee was accused of negligence, but she insisted that she acted _____ good faith.\nA. in\nB. with\nC. on\nD. at",
        "options": {
          "A": "in",
          "B": "with",
          "C": "on",
          "D": "at"
        },
        "correctAnswer": "A",
        "explanation": "Cụm giới từ cố định (Prepositional Idiom): `in good faith` là một thuật ngữ pháp lý và kinh doanh có nghĩa là 'với thiện chí, ngay tình, không có ác ý'. Giới từ chuẩn xác là 'in'. Chọn A. Nhiều người dịch nghĩa 'với thiện chí' và chọn nhầm 'with good faith'.",
        "trapNote": "Nhiều người dịch nghĩa 'với thiện chí' và chọn nhầm 'with good faith'.",
        "translation": "Nhân viên mới bị cáo buộc sơ suất, nhưng cô ấy khăng khăng rằng mình đã hành động _____ thiện chí.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-16-10",
        "part": "PART_5",
        "questionText": "Due to unforeseen logistical difficulties, the shipment of semiconductors is currently _____ transit.\nA. in\nB. at\nC. on\nD. under",
        "options": {
          "A": "in",
          "B": "at",
          "C": "on",
          "D": "under"
        },
        "correctAnswer": "A",
        "explanation": "Cụm cố định trong ngành logistics / thương mại quốc tế: `in transit` (đang trên đường vận chuyển, đang quá cảnh). Do đó chọn giới từ 'in'. Chọn A. Dễ nhầm với 'on the way' nên chọn 'on transit' (sai cấu trúc).",
        "trapNote": "Dễ nhầm với 'on the way' nên chọn 'on transit' (sai cấu trúc).",
        "translation": "Do những khó khăn hậu cần bất khả kháng, lô hàng chất bán dẫn hiện đang _____ quá trình vận chuyển.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-17",
    "code": "CD_17",
    "titleVi": "Chuyên đề 17: Liên Từ",
    "titleEn": "Conjunctions",
    "part": "Part 6 & 7",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Liên từ (Conjunctions) là xương sống kết nối các mệnh đề và câu văn. Trong đề thi THPT QG và TOEIC, các câu hỏi phân biệt giữa 'Liên từ + Mệnh đề' vs 'Giới từ + Cụm danh từ' (như Although vs Despite, Because vs Because of) chiếm từ 3-5 câu ăn điểm trực tiếp.",
    "formula": "### 1. Phân loại Liên từ trong Tiếng Anh:\n\n#### A. Liên từ kết hợp (Coordinating Conjunctions - FANBOYS):\nDùng để nối các từ, cụm từ hoặc mệnh đề độc lập tương đương nhau:\n- **F**or: vì (giải thích lý do).\n- **A**nd: và (bổ sung).\n- **N**or: cũng không.\n- **B**ut: nhưng (tương phản).\n- **O**r: hoặc (lựa chọn).\n- **Y**et: tuy nhiên, nhưng.\n- **S**o: vì vậy, cho nên (kết quả).\n\n#### B. Liên từ tương quan (Correlative Conjunctions):\nLuôn đi thành từng cặp song song:\n- `Both... and...`: Cả... và...\n- `Either... or...`: Hoặc... hoặc...\n- `Neither... nor...`: Cả hai đều không...\n- `Not only... but also...`: Không những... mà còn...\n- `Whether... or...`: Liệu... hay...\n\n#### C. Liên từ phụ thuộc (Subordinating Conjunctions):\nĐứng đầu mệnh đề phụ để nối với mệnh đề chính:\n- **Chỉ nguyên nhân:** `Because, Since, As, Now that + MỆNH ĐỀ (S + V)`\n- **Chỉ sự nhượng bộ, tương phản:** `Although, Even though, Though + MỆNH ĐỀ (S + V)`\n- **Chỉ mục đích:** `So that, In order that + MỆNH ĐỀ (S + can/could/will + V)`\n- **Chỉ kết quả:** `So + Adj/Adv + THAT + Clause` / `Such + (a/an) + Adj + N + THAT + Clause`\n- **Chỉ thời gian:** `When, While, Before, After, As soon as, Until, Since + Clause`\n\n### 2. Cặp biến đổi sống còn: LIÊN TỪ vs GIỚI TỪ:\n| Nhóm Nghĩa | LIÊN TỪ (+ Mệnh đề: S + V) | GIỚI TỪ (+ Cụm danh từ / V-ing) |\n|:---|:---|:---|\n| **Mặc dù / Dù cho** | `Although / Even though / Though` | `Despite / In spite of` |\n| **Bởi vì** | `Because / Since / As / Now that` | `Because of / Due to / Owing to` |\n| **Để mà (mục đích)** | `So that / In order that` | `In order to / So as to + V-bare` |",
    "signalWords": [
      "- Nhìn ngay thành phần đứng SAU chỗ trống:\n  * Nếu là một **MỆNH ĐỀ hoàn chỉnh có cả Chủ ngữ và Động từ chia thì (S + V)**:\n    -> Chọn `Although`, `Even though`, `Because`, `Since`.\n    -> Gạch ngay `Despite`, `In spite of`, `Because of`, `Due to`!\n  * Nếu chỉ là một **Cụm danh từ (Noun Phrase) hoặc V-ing** (không có động từ chia thì):\n    -> Chọn `Despite`, `In spite of`, `Because of`, `Due to`.\n    -> Gạch ngay `Although`, `Because`!"
    ],
    "traps": [
      "- **Bẫy Despite of:** Trong tiếng Anh chỉ có `Despite` (không có of) hoặc `In spite OF`. 'Despite of' là một lỗi ngụy tạo rất hay bẫy thí sinh.\n- **Bẫy vừa dùng Although vừa dùng But:** Tuyệt đối không bao giờ dùng 'Although... but...' trong cùng một câu tiếng Anh. Đã có Although thì không có But!"
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo 3 giây phân biệt:**\n   - Sau chỗ trống có ĐỘNG TỪ CHIA THÌ -> Chọn chữ ngắn/không có 'of': `Because`, `Although`.\n   - Sau chỗ trống KHÔNG CÓ động từ chia thì -> Chọn chữ có 'of' hoặc 'Despite': `Because of`, `Despite`.\n2. **Quy tắc dấu phẩy với trạng từ liên kết:**\n   - `However / Therefore` thường đứng giữa hai dấu phẩy hoặc đứng đầu câu có dấu phẩy: `However, S + V` hoặc `; however,`.\n   - `Although / Because` KHÔNG BAO GIỜ có dấu phẩy ngay sau nó!",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-17-1",
        "part": "PART_5",
        "questionText": "We couldn't go on a picnic _____ it was raining heavily outside.\nA. because\nB. because of\nC. although\nD. despite",
        "options": {
          "A": "because",
          "B": "because of",
          "C": "although",
          "D": "despite"
        },
        "correctAnswer": "A",
        "explanation": "Về nghĩa: Trời mưa là nguyên nhân khiến không đi dã ngoại được -> Loại C, D (mặc dù). Về cấu trúc: Phía sau là mệnh đề 'it was raining' (S + V) nên dùng liên từ 'because' thay vì 'because of'. Chọn A. Loại 'because of' vì sau nó chỉ được đi với Noun/V-ing.",
        "trapNote": "Loại 'because of' vì sau nó chỉ được đi với Noun/V-ing.",
        "translation": "Chúng tôi không thể đi dã ngoại _____ trời đang mưa rất to ở ngoài.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-2",
        "part": "PART_5",
        "questionText": "_____ the heavy traffic during rush hour, we arrived at the airport on time.\nA. Although\nB. Even though\nC. In spite of\nD. Because",
        "options": {
          "A": "Although",
          "B": "Even though",
          "C": "In spite of",
          "D": "Because"
        },
        "correctAnswer": "C",
        "explanation": "Hai vế mang nghĩa tương phản nhượng bộ (tắc đường mà vẫn kịp giờ) -> Loại D. Phía sau là cụm danh từ 'the heavy traffic' -> Loại A, B (chỉ đi với mệnh đề). Chọn 'In spite of'. Chọn C. Không nhầm cụm danh từ dài có giới từ chen giữa với một mệnh đề.",
        "trapNote": "Không nhầm cụm danh từ dài có giới từ chen giữa với một mệnh đề.",
        "translation": "_____ tình trạng giao thông đông đúc vào giờ cao điểm, chúng tôi vẫn đến sân bay đúng giờ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-3",
        "part": "PART_5",
        "questionText": "You can pay for the purchase _____ in cash or by credit card.\nA. neither\nB. either\nC. both\nD. not only",
        "options": {
          "A": "neither",
          "B": "either",
          "C": "both",
          "D": "not only"
        },
        "correctAnswer": "B",
        "explanation": "Cặp liên từ tương quan cố định: `Either... or...` (hoặc cái này hoặc cái kia). Chọn B. Nhớ chính xác các cặp: Either... or; Neither... nor; Both... and.",
        "trapNote": "Nhớ chính xác các cặp: Either... or; Neither... nor; Both... and.",
        "translation": "Bạn có thể thanh toán đơn mua hàng _____ bằng tiền mặt hoặc bằng thẻ tín dụng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-4",
        "part": "PART_5",
        "questionText": "_____ he was extremely exhausted after a long working day, he stayed up late to help his son with math.\nA. Despite\nB. Although\nC. Because\nD. In spite of",
        "options": {
          "A": "Despite",
          "B": "Although",
          "C": "Because",
          "D": "In spite of"
        },
        "correctAnswer": "B",
        "explanation": "Quan hệ tương phản nhượng bộ: rất mệt nhưng vẫn thức khuya giúp con. Sau chỗ trống là mệnh đề có chủ ngữ 'he' và động từ 'was' -> Chọn liên từ 'Although'. Chọn B. Loại ngay A và D vì Despite/In spite of không thể đi với mệnh đề 'he was...'.",
        "trapNote": "Loại ngay A và D vì Despite/In spite of không thể đi với mệnh đề 'he was...'.",
        "translation": "_____ anh ấy vô cùng kiệt sức sau một ngày làm việc dài, anh ấy vẫn thức khuya để giúp con trai học toán.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-5",
        "part": "PART_5",
        "questionText": "He turned off his mobile phone _____ he wouldn't be disturbed during the important client presentation.\nA. in order to\nB. so that\nC. because of\nD. despite",
        "options": {
          "A": "in order to",
          "B": "so that",
          "C": "because of",
          "D": "despite"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc chỉ mục đích: `so that / in order that + S + can/could/would + V`. 'In order to' phải đi với V-bare. Do phía sau là một mệnh đề 'he wouldn't...' nên bắt buộc dùng 'so that'. Chọn B. Dễ nhầm giữa 'in order to + V' và 'so that + Clause'.",
        "trapNote": "Dễ nhầm giữa 'in order to + V' và 'so that + Clause'.",
        "translation": "Anh ấy đã tắt điện thoại di động _____ anh ấy không bị làm phiền trong suốt buổi thuyết trình quan trọng với khách hàng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-6",
        "part": "PART_5",
        "questionText": "The outdoor music festival was cancelled _____ the sudden severe blizzard.\nA. because\nB. because of\nC. although\nD. in spite of",
        "options": {
          "A": "because",
          "B": "because of",
          "C": "although",
          "D": "in spite of"
        },
        "correctAnswer": "B",
        "explanation": "Bão tuyết là nguyên nhân dẫn đến hủy lễ hội -> Chọn nhóm chỉ nguyên nhân. Phía sau là cụm danh từ 'the sudden severe blizzard' (không có động từ) -> Dùng 'because of'. Chọn B. Không có động từ chia thì ở vế sau nên không thể chọn 'because'.",
        "trapNote": "Không có động từ chia thì ở vế sau nên không thể chọn 'because'.",
        "translation": "Lễ hội âm nhạc ngoài trời đã bị hủy bỏ _____ trận bão tuyết dữ dội bất ngờ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-7",
        "part": "PART_5",
        "questionText": "The proposal was well-researched and cost-effective. _____, the committee rejected it due to budget constraints.\nA. However\nB. Therefore\nC. Although\nD. Besides",
        "options": {
          "A": "However",
          "B": "Therefore",
          "C": "Although",
          "D": "Besides"
        },
        "correctAnswer": "A",
        "explanation": "Hai câu có nghĩa đối lập (đề xuất tốt nhưng lại bị bác bỏ). Đứng ở đầu câu ngăn cách với mệnh đề bằng dấu phẩy để nối 2 câu tương phản -> Dùng trạng từ liên kết 'However'. 'Although' không bao giờ đứng đầu câu có dấu phẩy ngay sau nó. Chọn A. Bẫy ngữ pháp: 'Although, the committee...' là sai hoàn toàn.",
        "trapNote": "Bẫy ngữ pháp: 'Although, the committee...' là sai hoàn toàn.",
        "translation": "Bản đề xuất được nghiên cứu kỹ lưỡng và tiết kiệm chi phí. _____, ủy ban đã bác bỏ nó do hạn chế về ngân sách.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-8",
        "part": "PART_5",
        "questionText": "The lecture was _____ boring that nearly half of the students fell asleep.\nA. so\nB. such\nC. too\nD. very",
        "options": {
          "A": "so",
          "B": "such",
          "C": "too",
          "D": "very"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc chỉ kết quả: `S + be + SO + Adj + THAT + Clause` (quá... đến nỗi mà...). Vì sau chỗ trống chỉ có một tính từ 'boring' nên dùng 'so'. (Nếu là 'such a boring lecture' thì mới dùng 'such'). Chọn A. Phân biệt: `So + Adj + that` vs `Such + (a/an) + Adj + N + that`.",
        "trapNote": "Phân biệt: `So + Adj + that` vs `Such + (a/an) + Adj + N + that`.",
        "translation": "Bài giảng _____ buồn ngủ đến nỗi mà gần một nửa số sinh viên đã ngủ gật.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-9",
        "part": "PART_5",
        "questionText": "_____ experienced he is in international business, he still found the negotiation challenging.\nA. Although\nB. However\nC. Despite\nD. No matter",
        "options": {
          "A": "Although",
          "B": "However",
          "C": "Despite",
          "D": "No matter"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc nhượng bộ nâng cao với đảo tính từ: `However + Adj/Adv + S + V, S + V` (= `No matter how + Adj/Adv + S + V`). Dù cho có giàu kinh nghiệm đến đâu đi chăng nữa. 'Although' phải là 'Although he is experienced' (không đảo tính từ). Do đó chọn 'However'. Chọn B. Bẫy kinh điển: 'However' ở đây không phải là trạng từ nối có dấu phẩy, mà là liên từ nhượng bộ đi liền với tính từ.",
        "trapNote": "Bẫy kinh điển: 'However' ở đây không phải là trạng từ nối có dấu phẩy, mà là liên từ nhượng bộ đi liền với tính từ.",
        "translation": "Dù anh ấy có giàu kinh nghiệm trong kinh doanh quốc tế đến đâu, anh ấy vẫn thấy cuộc đàm phán đầy thử thách.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-17-10",
        "part": "PART_5",
        "questionText": "The company decided to hire him _____ his lack of direct experience in the telecommunications sector.\nA. despite of\nB. notwithstanding\nC. although\nD. because of",
        "options": {
          "A": "despite of",
          "B": "notwithstanding",
          "C": "although",
          "D": "because of"
        },
        "correctAnswer": "B",
        "explanation": "Về nghĩa: Hai vế tương phản nhượng bộ -> Loại D. 'despite of' là cụm ngụy tạo sai ngữ pháp (chỉ có despite) -> Loại A. 'although' chỉ đi với mệnh đề có S + V -> Loại C. 'Notwithstanding' là giới từ trang trọng (= despite / in spite of) đi kèm cụm danh từ 'his lack of experience'. Chọn B. Học sinh thường bị lừa bởi 'despite of' hoặc không biết từ vựng nâng cao 'notwithstanding'.",
        "trapNote": "Học sinh thường bị lừa bởi 'despite of' hoặc không biết từ vựng nâng cao 'notwithstanding'.",
        "translation": "Công ty đã quyết định tuyển dụng anh ấy _____ sự thiếu kinh nghiệm trực tiếp của anh ấy trong ngành viễn thông.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-18",
    "code": "CD_18",
    "titleVi": "Chuyên đề 18: Câu Bị Động",
    "titleEn": "Passive Voice",
    "part": "Part 5 & 6",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Câu bị động (Passive Voice) là chuyên đề ngữ pháp bắt buộc xuất hiện trong mọi đề thi tiếng Anh (chiếm 3-5 câu trong đề thi THPT QG và ít nhất 6 câu trong TOEIC Part 5 & 6). Thí sinh cần nắm vững quy tắc chuyển đổi bị động cho các thì, thể truyền khiến (nhờ vả) và bị động với động từ chỉ ý kiến (bị động kép).",
    "formula": "### 1. Cấu trúc câu bị động tổng quát:\n`Chủ động:` `S + Verb + Object`\n`Bị động:`  `S (tân ngữ cũ) + BE + V3/ed + (BY + Object cũ)`\n\n### 2. Bảng bị động các thì cơ bản:\n- **Hiện tại đơn:** `am / is / are + V3/ed`\n- **Hiện tại tiếp diễn:** `am / is / are + BEING + V3/ed`\n- **Hiện tại hoàn thành:** `have / has + BEEN + V3/ed`\n- **Quá khứ đơn:** `was / were + V3/ed`\n- **Quá khứ tiếp diễn:** `was / were + BEING + V3/ed`\n- **Quá khứ hoàn thành:** `had + BEEN + V3/ed`\n- **Tương lai đơn:** `will + BE + V3/ed`\n- **Động từ khuyết thiếu (Modal):** `modal (can, must, should...) + BE + V3/ed`\n- **Động từ khuyết thiếu hoàn thành:** `modal + have + BEEN + V3/ed`\n\n### 3. Các dạng bị động ĐẶC BIỆT:\n#### A. Thể nhờ vả / Sai khiến (Causative Form):\n- Với **HAVE**:\n  * Chủ động: `S + have + someone + V-bare` (nhờ ai làm gì).\n  * Bị động: `S + have + SOMETHING + V3/ed` (có cái gì được làm bởi ai).\n    *Ví dụ:* I had the mechanic repair my car -> I had my car *repaired*.\n- Với **GET**:\n  * Chủ động: `S + get + someone + TO-V`.\n  * Bị động: `S + get + SOMETHING + V3/ed`.\n    *Ví dụ:* I got my hair *cut* yesterday.\n\n#### B. Bị động với động từ chỉ ý kiến / Tường thuật (Bị động kép):\nKhi câu chủ động có dạng: `People say / think / believe / report that + S2 + V2`\n- **Cách 1 (Chủ ngữ giả 'It'):**\n  `It + is / was + said / believed / reported + that + S2 + V2...`\n- **Cách 2 (Đưa S2 lên làm chủ ngữ):**\n  `S2 + is/are/was/were + said / believed + TO-V` (nếu cùng thì với mệnh đề chính).\n  `S2 + is/are/was/were + said / believed + TO HAVE V3/ed` (nếu xảy ra trước thì của mệnh đề chính).\n  *Ví dụ:* People say that he is rich -> He is said *to be* rich.\n  *Ví dụ:* People say that he stole the car -> He is said *to have stolen* the car.\n\n#### C. Bị động của động từ giác quan (see, hear, watch):\n- Chủ động: `S + see + O + V-bare`\n- Bị động: `S + be seen + TO-V` (bắt buộc thêm 'to').",
    "signalWords": [
      "- Nhìn chủ ngữ của câu: Nếu chủ ngữ là VẬT (the report, the road, the building, letters) -> 90% câu mang nghĩa **BỊ ĐỘNG** (phải có dạng `be + V3/ed`).\n- Nhìn phía sau chỗ trống: Nếu không có tân ngữ trực tiếp (O) nhận tác động mà có giới từ (`by, in, on, at, with`) -> Chia **BỊ ĐỘNG**.\n- Thấy cấu trúc `have / get + vật + _____` -> Điền ngay **V3/ed**."
    ],
    "traps": [
      "- **Bẫy nội động từ (Intransitive verbs):** Các nội động từ như `happen, occur, take place, arrive, die, appear, disappear` KHÔNG BAO GIỜ chia ở thể bị động! (Ví dụ: 'The accident was happened' là SAI hoàn toàn).\n- **Bẫy quên chữ 'BEING' trong tiếp diễn:** Bị động của thì tiếp diễn bắt buộc phải có chữ 'being' (`is being renovated`)."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo nhận diện bị động:**\n   - Câu bị động BẮT BUỘC phải có 2 thành phần: **Động từ TO BE** và **Động từ V3/ED** (`BE + V3`). Thiếu một trong hai là SAI!\n2. **Thần chú thể nhờ vả:**\n   - *HAVE ai làm gì* -> V-bare (`have sb V`).\n   - *GET ai làm gì* -> TO-V (`get sb to V`).\n   - *HAVE / GET vật* -> V3/ed (`have/get sth V3`).\n3. **Mẹo to-V vs to have V3 trong bị động kép:**\n   - Hai vế cùng thì (Hiện tại - Hiện tại) -> dùng `to V`.\n   - Vế sau lùi thì hơn vế trước (Hiện tại - Quá khứ) -> dùng `to have V3`.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-18-1",
        "part": "PART_5",
        "questionText": "This famous novel _____ by Ernest Hemingway in 1952.\nA. wrote\nB. was written\nC. is written\nD. has written",
        "options": {
          "A": "wrote",
          "B": "was written",
          "C": "is written",
          "D": "has written"
        },
        "correctAnswer": "B",
        "explanation": "Cuốn sách không thể tự viết ra nó mà 'được viết' -> Câu bị động. Thời gian xác định trong quá khứ 'in 1952' -> Bị động thì Quá khứ đơn: `was/were + V3/ed`. Chủ ngữ số ít dùng 'was written'. Chọn B. Loại ngay các đáp án chủ động A và D.",
        "trapNote": "Loại ngay các đáp án chủ động A và D.",
        "translation": "Cuốn tiểu thuyết nổi tiếng này _____ bởi Ernest Hemingway vào năm 1952.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-2",
        "part": "PART_5",
        "questionText": "All the meeting rooms _____ thoroughly before the executive conference tomorrow.\nA. will clean\nB. will be cleaned\nC. are cleaning\nD. have cleaned",
        "options": {
          "A": "will clean",
          "B": "will be cleaned",
          "C": "are cleaning",
          "D": "have cleaned"
        },
        "correctAnswer": "B",
        "explanation": "Phòng họp phải 'được dọn dẹp' bởi con người -> Bị động thì Tương lai đơn: `will + be + V3/ed`. Chọn 'will be cleaned'. Chọn B. Ba đáp án còn lại A, C, D đều ở thể chủ động.",
        "trapNote": "Ba đáp án còn lại A, C, D đều ở thể chủ động.",
        "translation": "Tất cả các phòng họp _____ kỹ lưỡng trước hội nghị ban điều hành vào ngày mai.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-3",
        "part": "PART_5",
        "questionText": "English _____ as an official language in more than 50 countries around the globe.\nA. speaks\nB. is spoken\nC. is speaking\nD. spoke",
        "options": {
          "A": "speaks",
          "B": "is spoken",
          "C": "is speaking",
          "D": "spoke"
        },
        "correctAnswer": "B",
        "explanation": "Ngôn ngữ tiếng Anh phải 'được người ta nói' -> Bị động thì Hiện tại đơn: `is/are + V3/ed`. English số ít -> 'is spoken'. Chọn B. Dễ nhầm với câu chủ động nếu dịch thoáng.",
        "trapNote": "Dễ nhầm với câu chủ động nếu dịch thoáng.",
        "translation": "Tiếng Anh _____ như một ngôn ngữ chính thức tại hơn 50 quốc gia trên toàn cầu.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-4",
        "part": "PART_5",
        "questionText": "Please be patient. The historic bridge is currently _____ to ensure public safety.\nA. repaired\nB. being repaired\nC. repairing\nD. been repaired",
        "options": {
          "A": "repaired",
          "B": "being repaired",
          "C": "repairing",
          "D": "been repaired"
        },
        "correctAnswer": "B",
        "explanation": "Cây cầu đang trong quá trình được sửa chữa -> Bị động thì Hiện tại tiếp diễn: `is + being + V3/ed`. Chọn 'being repaired'. Chọn B. Bị động tiếp diễn bắt buộc phải có 'BEING', nếu chọn 'repaired' thì câu sẽ biến thành hiện tại đơn.",
        "trapNote": "Bị động tiếp diễn bắt buộc phải có 'BEING', nếu chọn 'repaired' thì câu sẽ biến thành hiện tại đơn.",
        "translation": "Xin vui lòng kiên nhẫn. Cây cầu lịch sử hiện đang _____ để đảm bảo an toàn công cộng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-5",
        "part": "PART_5",
        "questionText": "I need to go to the garage to have my brakes _____ before the long road trip.\nA. check\nB. checked\nC. checking\nD. to check",
        "options": {
          "A": "check",
          "B": "checked",
          "C": "checking",
          "D": "to check"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc thể nhờ vả bị động: `have + something (vật) + V3/ed` (có cái gì được ai đó làm giúp). 'my brakes' (bộ phanh xe) là đồ vật nên động từ điền vào phải là V3/ed 'checked'. Chọn B. Học sinh nhớ vẹt 'have đi với V-bare' sẽ chọn nhầm A, chỉ có 'have ai đó (người)' mới đi với V-bare.",
        "trapNote": "Học sinh nhớ vẹt 'have đi với V-bare' sẽ chọn nhầm A, chỉ có 'have ai đó (người)' mới đi với V-bare.",
        "translation": "Tôi cần đến gara để nhờ người ta _____ bộ phanh trước chuyến đi đường dài.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-6",
        "part": "PART_5",
        "questionText": "The unexpected power outage _____ while we were conducting the online seminar.\nA. was occurred\nB. occurred\nC. was occurring\nD. has occurred",
        "options": {
          "A": "was occurred",
          "B": "occurred",
          "C": "was occurring",
          "D": "has occurred"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy nội động từ kinh điển: Các động từ `occur, happen, take place` (xảy ra) là nội động từ, bản thân nó đã mang nghĩa tự thân xảy ra, TUYỆT ĐỐI KHÔNG BAO GIỜ CHIA BỊ ĐỘNG. Do đó 'was occurred' là sai ngữ pháp. Hành động mất điện cắt ngang hành động đang hội thảo -> chia Quá khứ đơn chủ động 'occurred'. Chọn B. Rất nhiều thí sinh nghĩ 'mất điện bị xảy ra' nên chọn bị động 'was occurred'.",
        "trapNote": "Rất nhiều thí sinh nghĩ 'mất điện bị xảy ra' nên chọn bị động 'was occurred'.",
        "translation": "Sự cố mất điện bất ngờ _____ trong khi chúng tôi đang tiến hành hội thảo trực tuyến.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-7",
        "part": "PART_5",
        "questionText": "It is widely believed that the CEO _____ the company to unprecedented profitability.\nA. led\nB. was led\nC. has led\nD. leading",
        "options": {
          "A": "led",
          "B": "was led",
          "C": "has led",
          "D": "leading"
        },
        "correctAnswer": "C",
        "explanation": "Mệnh đề sau 'that' là mệnh đề độc lập bình thường. Chủ ngữ là người 'the CEO' tác động lên tân ngữ 'the company' (chủ động dẫn dắt công ty) -> Dùng thể chủ động. Diễn tả thành tựu kéo dài từ quá khứ đến nay -> Dùng Hiện tại hoàn thành 'has led'. Chọn C. Đừng nhầm lẫn tưởng mệnh đề sau 'that' cũng phải chia bị động. Chỉ có vế trước 'It is believed' là bị động.",
        "trapNote": "Đừng nhầm lẫn tưởng mệnh đề sau 'that' cũng phải chia bị động. Chỉ có vế trước 'It is believed' là bị động.",
        "translation": "Nhiều người tin rằng vị Tổng giám đốc _____ công ty đạt tới mức lợi nhuận chưa từng có.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-8",
        "part": "PART_5",
        "questionText": "The legendary football player is reported _____ from professional sports last night.\nA. to retire\nB. to have retired\nC. retiring\nD. retired",
        "options": {
          "A": "to retire",
          "B": "to have retired",
          "C": "retiring",
          "D": "retired"
        },
        "correctAnswer": "B",
        "explanation": "Bị động kép khi đưa S2 lên đầu: Mệnh đề chính ở Hiện tại đơn ('is reported') nhưng hành động giải nghệ xảy ra trong Quá khứ ('last night' - trước hiện tại). Khi hành động phía sau xảy ra trước hành động phía trước, ta bắt buộc dùng `TO HAVE + V3/ed`. Do đó chọn 'to have retired'. Chọn B. Nếu không có 'last night' mà hai hành động cùng xảy ra ở hiện tại thì mới chọn 'to retire'.",
        "trapNote": "Nếu không có 'last night' mà hai hành động cùng xảy ra ở hiện tại thì mới chọn 'to retire'.",
        "translation": "Cầu thủ bóng đá huyền thoại được đưa tin là _____ khỏi thể thao chuyên nghiệp vào đêm qua.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-9",
        "part": "PART_5",
        "questionText": "The suspicious man was seen _____ the jewelry store through the broken rear window.\nA. enter\nB. to enter\nC. entered\nD. to have entered",
        "options": {
          "A": "enter",
          "B": "to enter",
          "C": "entered",
          "D": "to have entered"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc bị động với động từ tri giác (see, hear, notice): Ở thể chủ động dùng V-bare (`I saw him enter`), nhưng khi chuyển sang thể BỊ ĐỘNG bắt buộc phải khôi phục lại 'TO': `be seen + TO-V`. Do đó chọn 'to enter'. Chọn B. Học sinh quen thói quen 'see đi với V-bare' nên chọn A và bị mất điểm.",
        "trapNote": "Học sinh quen thói quen 'see đi với V-bare' nên chọn A và bị mất điểm.",
        "translation": "Người đàn ông khả nghi bị nhìn thấy _____ vào cửa hàng trang sức qua cửa sổ sau bị vỡ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-18-10",
        "part": "PART_5",
        "questionText": "The precious confidential files _____ by the end of yesterday, as instructed by the director.\nA. should have archived\nB. should have been archived\nC. must be archived\nD. were archiving",
        "options": {
          "A": "should have archived",
          "B": "should have been archived",
          "C": "must be archived",
          "D": "were archiving"
        },
        "correctAnswer": "B",
        "explanation": "Hành động lẽ ra NÊN ĐƯỢC LÀM trong quá khứ nhưng thực tế chưa làm -> Cấu trúc bị động của Modal Perfect: `should have + BEEN + V3/ed`. Chọn B. Phải kết hợp cả 3 yếu tố: Modal verb + Hoàn thành (yesterday) + Bị động (files được lưu trữ).",
        "trapNote": "Phải kết hợp cả 3 yếu tố: Modal verb + Hoàn thành (yesterday) + Bị động (files được lưu trữ).",
        "translation": "Các tài liệu mật quý giá _____ trước cuối ngày hôm qua, theo chỉ thị của giám đốc.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-19",
    "code": "CD_19",
    "titleVi": "Chuyên đề 19: Câu Điều Kiện",
    "titleEn": "Conditional Sentences",
    "part": "Part 6 & 7",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Câu điều kiện (If Sentences) là một trong những chuyên đề xuất hiện 100% trong đề thi THPT QG và TOEIC. Thí sinh cần làm chủ 4 loại câu điều kiện (Type 0, 1, 2, 3), câu điều kiện hỗn hợp (Mixed Conditionals), các cấu trúc biến thể (Unless, But for, In case) và kỹ thuật đảo ngữ câu điều kiện.",
    "formula": "### 1. Bảng 4 loại câu điều kiện chuẩn:\n- **Loại 0 (Zero Conditional):** Sự thật hiển nhiên, chân lý khoa học.\n  `IF + S + V(hiện tại đơn), S + V(hiện tại đơn)`\n  *Ví dụ:* If you heat ice, it *melts*.\n- **Loại 1 (First Conditional):** Có thật, có thể xảy ra ở hiện tại hoặc tương lai.\n  `IF + S + V(hiện tại đơn), S + will / can / may + V-bare`\n  *Ví dụ:* If it *rains* tomorrow, we *will cancel* the picnic.\n- **Loại 2 (Second Conditional):** Giả định KHÔNG CÓ THẬT ở HIỆN TẠI (trái ngược với hiện tại).\n  `IF + S + V2/ed (to be luôn dùng WERE cho mọi ngôi), S + would / could / might + V-bare`\n  *Ví dụ:* If I *were* you, I *would accept* that offer.\n  *Ví dụ:* If I *had* money now, I *would buy* that car.\n- **Loại 3 (Third Conditional):** Giả định KHÔNG CÓ THẬT ở QUÁ KHỨ (trái ngược với quá khứ).\n  `IF + S + had + V3/ed, S + would / could / might + HAVE + V3/ed`\n  *Ví dụ:* If she *had studied* harder, she *would have passed* the exam.\n\n### 2. Câu điều kiện hỗn hợp (Mixed Conditionals - Hay thi điểm 9, 10):\n- **Trộn Loại 3 và Loại 2 (Quá khứ ảnh hưởng đến Hiện tại):**\n  `IF + S + had + V3/ed (quá khứ), S + would + V-bare (hiện tại - thường có 'now / today')`\n  *Ví dụ:* If I *had caught* the train yesterday, I *would be* at home *now*.\n\n### 3. Các cấu trúc thay thế IF:\n- `Unless = If... not` (Trừ khi):\n  *Ví dụ:* *Unless* you study hard, you will fail (= If you don't study...).\n- `But for / Without + Noun / V-ing`: Nếu không vì, nếu không có.\n  * Đi với Loại 2: `But for your help, I would fail.`\n  * Đi với Loại 3: `But for your help, I would have failed.`\n- `Provided that / As long as`: Miễn là.\n\n### 4. ĐẢO NGỮ CÂU ĐIỀU KIỆN (Bỏ 'If'):\n- **Đảo ngữ Loại 1:** `SHOULD + S + V-bare, S + will + V`\n  *Ví dụ:* *Should it rain*, we will cancel the trip.\n- **Đảo ngữ Loại 2:**\n  * Với to be: `WERE + S + (to V), S + would + V`\n  * Với động từ thường: `WERE + S + TO-V, S + would + V`\n  *Ví dụ:* *Were I* rich, I would travel the world. / *Were he to know* the truth, he would be mad.\n- **Đảo ngữ Loại 3:** `HAD + S + V3/ed, S + would have + V3/ed`\n  *Ví dụ:* *Had I known* your number, I would have called you.",
    "signalWords": [
      "- Nhìn vế có sẵn (mệnh đề If hoặc mệnh đề chính):\n  * Thấy vế chính có `will + V` -> Vế If chia thì **Hiện tại đơn** (Loại 1).\n  * Thấy vế chính có `would + V` -> Vế If chia thì **Quá khứ đơn / were** (Loại 2).\n  * Thấy vế chính có `would have + V3` -> Vế If chia **had + V3** (Loại 3).\n- Thấy các từ đảo ngữ đứng đầu câu: `Should`, `Were`, `Had` kèm dấu phẩy -> Chắc chắn là đảo ngữ câu điều kiện."
    ],
    "traps": [
      "- **Bẫy phủ định sau Unless:** 'Unless' bản thân nó đã mang nghĩa phủ định (= If not), nên mệnh đề đi liền sau Unless KHÔNG ĐƯỢC dùng phủ định (`don't / doesn't / didn't`).\n- **Bẫy dùng Will trong mệnh đề If:** Tuyệt đối không dùng 'If you will come'."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo Were cho mọi ngôi:**\n   - Trong câu điều kiện loại 2, dù chủ ngữ là số ít (`I, he, she, it`), to be chuẩn ngữ pháp thi cử LUÔN LUÔN là **WERE** (`If I were you`).\n2. **Mẹo nhận biết điều kiện hỗn hợp:**\n   - Nếu vế If có dấu hiệu quá khứ (yesterday, last night) mà vế chính có chữ **NOW, TODAY** -> Chắc chắn là hỗn hợp: Vế If dùng `had V3`, vế chính dùng `would + V-bare`!\n3. **Mẹo đảo ngữ không bao giờ có IF:**\n   - Đã đảo `Had I known...` thì TUYỆT ĐỐI không còn chữ `If` ở đầu câu.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-19-1",
        "part": "PART_5",
        "questionText": "If you _____ hard, you will easily pass the university entrance examination.\nA. study\nB. studied\nC. had studied\nD. will study",
        "options": {
          "A": "study",
          "B": "studied",
          "C": "had studied",
          "D": "will study"
        },
        "correctAnswer": "A",
        "explanation": "Căn cứ vào mệnh đề chính có 'will pass', đây là câu điều kiện loại 1 (có thể xảy ra ở tương lai). Mệnh đề IF chia ở thì Hiện tại đơn: chủ ngữ 'you' đi với động từ nguyên thể 'study'. Chọn A. Không được dùng 'will' trong mệnh đề chứa IF.",
        "trapNote": "Không được dùng 'will' trong mệnh đề chứa IF.",
        "translation": "Nếu bạn _____ chăm chỉ, bạn sẽ dễ dàng vượt qua kỳ thi tuyển sinh đại học.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-2",
        "part": "PART_5",
        "questionText": "If I had a lot of money right now, I _____ a luxury yacht.\nA. will buy\nB. would buy\nC. bought\nD. would have bought",
        "options": {
          "A": "will buy",
          "B": "would buy",
          "C": "bought",
          "D": "would have bought"
        },
        "correctAnswer": "B",
        "explanation": "Câu điều kiện loại 2 (giả định trái ngược với thực tế ở hiện tại): `If + S + V2/ed, S + would + V-bare`. Do đó mệnh đề chính dùng 'would buy'. Chọn B. Loại 2 dùng 'would buy', không dùng 'would have bought' (loại 3).",
        "trapNote": "Loại 2 dùng 'would buy', không dùng 'would have bought' (loại 3).",
        "translation": "Nếu bây giờ tôi có thật nhiều tiền, tôi _____ một chiếc du thuyền sang trọng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-3",
        "part": "PART_5",
        "questionText": "If she had arrived at the train station earlier yesterday, she _____ the train.\nA. wouldn't miss\nB. wouldn't have missed\nC. won't miss\nD. didn't miss",
        "options": {
          "A": "wouldn't miss",
          "B": "wouldn't have missed",
          "C": "won't miss",
          "D": "didn't miss"
        },
        "correctAnswer": "B",
        "explanation": "Câu điều kiện loại 3 (giả định trái ngược với quá khứ): `If + S + had + V3/ed, S + would/could + have + V3/ed`. Vế chính phải là 'wouldn't have missed'. Chọn B. Nhận biết chính xác dấu hiệu 'yesterday' và 'had arrived' để chọn công thức loại 3.",
        "trapNote": "Nhận biết chính xác dấu hiệu 'yesterday' và 'had arrived' để chọn công thức loại 3.",
        "translation": "Nếu hôm qua cô ấy đến ga tàu sớm hơn, cô ấy _____ chuyến tàu.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-4",
        "part": "PART_5",
        "questionText": "If I _____ you, I would take the doctor's advice and quit smoking immediately.\nA. am\nB. was\nC. were\nD. had been",
        "options": {
          "A": "am",
          "B": "was",
          "C": "were",
          "D": "had been"
        },
        "correctAnswer": "C",
        "explanation": "Trong câu điều kiện loại 2, động từ 'to be' được chia là 'WERE' cho tất cả các ngôi (kể cả I, he, she, it) theo chuẩn ngữ pháp học thuật. 'If I were you' là thành ngữ cố định. Chọn C. Dù văn nói đôi khi dùng 'was', trong đề thi chuẩn luôn luôn đáp án đúng là 'were'.",
        "trapNote": "Dù văn nói đôi khi dùng 'was', trong đề thi chuẩn luôn luôn đáp án đúng là 'were'.",
        "translation": "Nếu tôi là bạn, tôi sẽ nghe theo lời khuyên của bác sĩ và bỏ thuốc lá ngay lập tức.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-5",
        "part": "PART_5",
        "questionText": "_____ you wear a warm coat, you will catch a bad cold in this freezing weather.\nA. If\nB. Unless\nC. Provided\nD. As long as",
        "options": {
          "A": "If",
          "B": "Unless",
          "C": "Provided",
          "D": "As long as"
        },
        "correctAnswer": "B",
        "explanation": "'Unless' mang nghĩa là 'Trừ khi' (= If... not). Dịch nghĩa: 'Trừ khi bạn mặc áo ấm, nếu không bạn sẽ bị cảm lạnh'. Nếu dùng 'If' thì nghĩa câu sẽ phi lý ('Nếu mặc ấm bạn sẽ bị cảm'). Chọn B. Phải dịch hiểu nghĩa logic của câu điều kiện để chọn giữa If và Unless.",
        "trapNote": "Phải dịch hiểu nghĩa logic của câu điều kiện để chọn giữa If và Unless.",
        "translation": "_____ bạn mặc áo khoác ấm, bạn sẽ bị cảm lạnh nặng trong thời tiết băng giá này.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-6",
        "part": "PART_5",
        "questionText": "_____ any questions arise regarding the contract, please contact our legal department.\nA. Should\nB. Were\nC. Had\nD. Do",
        "options": {
          "A": "Should",
          "B": "Were",
          "C": "Had",
          "D": "Do"
        },
        "correctAnswer": "A",
        "explanation": "Đảo ngữ câu điều kiện loại 1: `Should + S + V-bare, (S + will V / Imperative)`. Thay thế cho 'If any questions arise'. Dùng 'Should'. Chọn A. Dễ nhầm với câu hỏi, nhưng cuối câu có dấu chấm '.' chứ không phải dấu hỏi.",
        "trapNote": "Dễ nhầm với câu hỏi, nhưng cuối câu có dấu chấm '.' chứ không phải dấu hỏi.",
        "translation": "_____ có bất kỳ câu hỏi nào phát sinh liên quan đến hợp đồng, vui lòng liên hệ phòng pháp chế.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-7",
        "part": "PART_5",
        "questionText": "_____ for your timely financial assistance, our startup company would have gone bankrupt.\nA. But\nB. If\nC. Without\nD. Had",
        "options": {
          "A": "But",
          "B": "If",
          "C": "Without",
          "D": "Had"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc cố định: `But for + Noun phrase` = `Without + Noun phrase` = `If it hadn't been for...` (Nếu không có/nếu không nhờ vào). Vì sau chỗ trống đã có từ 'for' nên chỉ có thể chọn 'But'. Chọn A. Học sinh thấy chữ 'without' là từ quen thuộc liền chọn nhầm mà không để ý đề bài đã có chữ 'for' (Without không đi với for).",
        "trapNote": "Học sinh thấy chữ 'without' là từ quen thuộc liền chọn nhầm mà không để ý đề bài đã có chữ 'for' (Without không đi với for).",
        "translation": "Nếu không _____ sự hỗ trợ tài chính kịp thời của bạn, công ty khởi nghiệp của chúng tôi đã bị phá sản rồi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-8",
        "part": "PART_5",
        "questionText": "_____ he listened to his parents' advice, he wouldn't be in such a difficult situation right now.\nA. Had\nB. Were\nC. If\nD. Should",
        "options": {
          "A": "Had",
          "B": "Were",
          "C": "If",
          "D": "Should"
        },
        "correctAnswer": "A",
        "explanation": "Đảo ngữ câu điều kiện loại 3 (ở đây vế sau là hỗn hợp có 'right now'): `HAD + S + V3/ed, S + would + V-bare`. Nếu dùng 'If' thì câu phải là 'If he had listened' (ở đây không có 'had' sau 'he'). Do đó bắt buộc là đảo ngữ với 'Had'. Chọn A. Bẫy chọn 'If' mà không nhìn thấy thiếu trợ động từ 'had' sau 'he'.",
        "trapNote": "Bẫy chọn 'If' mà không nhìn thấy thiếu trợ động từ 'had' sau 'he'.",
        "translation": "Giá như anh ấy _____ nghe theo lời khuyên của cha mẹ, thì bây giờ anh ấy đã không rơi vào tình cảnh khó khăn như vậy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-9",
        "part": "PART_5",
        "questionText": "If I had accepted that overseas job offer last month, I _____ in Singapore now.\nA. would live\nB. would have lived\nC. will live\nD. lived",
        "options": {
          "A": "would live",
          "B": "would have lived",
          "C": "will live",
          "D": "lived"
        },
        "correctAnswer": "A",
        "explanation": "Bẫy câu điều kiện HỖN HỢP (Mixed Conditional Type 3 + 2): Giả định hành động trái với quá khứ ('last month' -> had accepted), nhưng kết quả lại ảnh hưởng đến HIỆN TẠI ('now'). Do có chữ 'now' ở vế chính nên mệnh đề chính bắt buộc phải dùng cấu trúc Loại 2: `would + V-bare` ('would live'). Chọn A. Học sinh cứ thấy 'had accepted' là máy móc chọn 'would have lived' mà bỏ qua chữ 'now' ở cuối câu.",
        "trapNote": "Học sinh cứ thấy 'had accepted' là máy móc chọn 'would have lived' mà bỏ qua chữ 'now' ở cuối câu.",
        "translation": "Nếu tháng trước tôi chấp nhận lời mời làm việc ở nước ngoài đó, thì bây giờ tôi _____ ở Xin-ga-po.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-19-10",
        "part": "PART_5",
        "questionText": "_____ the board of directors to approve the budget, the construction of the new research facility would begin next month.\nA. Were\nB. Should\nC. Had\nD. If",
        "options": {
          "A": "Were",
          "B": "Should",
          "C": "Had",
          "D": "If"
        },
        "correctAnswer": "A",
        "explanation": "Đảo ngữ câu điều kiện loại 2 với động từ thường: `WERE + S + TO-V, S + would + V-bare`. Căn cứ vào 'would begin' (loại 2) và cấu trúc 'to approve', từ đứng đầu đảo ngữ bắt buộc là 'Were'. Chọn A. Nhiều bạn chỉ biết đảo ngữ loại 2 với to be 'Were I rich', không biết cấu trúc đảo ngữ với động từ thường là 'Were S to-V'.",
        "trapNote": "Nhiều bạn chỉ biết đảo ngữ loại 2 với to be 'Were I rich', không biết cấu trúc đảo ngữ với động từ thường là 'Were S to-V'.",
        "translation": "Nếu hội đồng quản trị _____ phê duyệt ngân sách, việc xây dựng cơ sở nghiên cứu mới sẽ bắt đầu vào tháng tới.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-20",
    "code": "CD_20",
    "titleVi": "Chuyên đề 20: Câu Tường Thuật",
    "titleEn": "Reported Speech",
    "part": "Part 5 & 6",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Câu tường thuật (Reported Speech / Gián tiếp) là dạng câu biến đổi lời nói trực tiếp sang gián tiếp. Đề thi THPT QG luôn có 1 câu cố định ở phần Viết lại câu đồng nghĩa. Ba quy tắc vàng bắt buộc phải nhớ: Lùi một thì, Đổi đại từ nhân xưng, và Chuyển đổi trạng từ thời gian / nơi chốn.",
    "formula": "### 1. Ba nguyên tắc chuyển đổi từ Trực tiếp sang Gián tiếp:\nKhi động từ tường thuật ở quá khứ (`said, told, asked`), ta bắt buộc:\n1. **LÙI THÌ (Tenses backshift):**\n   - Hiện tại đơn -> Quá khứ đơn (`V/V-s` -> `V2/ed`)\n   - Hiện tại tiếp diễn -> Quá khứ tiếp diễn (`am/is/are V-ing` -> `was/were V-ing`)\n   - Hiện tại hoàn thành -> Quá khứ hoàn thành (`have/has V3` -> `had V3`)\n   - Quá khứ đơn -> Quá khứ hoàn thành (`V2/ed` -> `had V3`)\n   - Tương lai đơn -> Tương lai trong quá khứ (`will` -> `would`, `can` -> `could`, `may` -> `might`, `must` -> `had to`)\n2. **ĐỔI ĐẠI TỪ NHÂN XƯƠNG & TÍNH TỪ SỞ HỮU:**\n   - Phù hợp với chủ ngữ và tân ngữ của mệnh đề chính (`I` -> `he/she`, `my` -> `his/her`, `we` -> `they`).\n3. **CHUYỂN ĐỔI TRẠNG TỪ THỜI GIAN & NƠI CHỐN:**\n   - `now` -> `then`\n   - `today` -> `that day`\n   - `yesterday` -> `the day before / the previous day`\n   - `tomorrow` -> `the next day / the following day`\n   - `ago` -> `before`\n   - `this / these` -> `that / those`\n   - `here` -> `there`\n\n### 2. Các dạng câu tường thuật:\n- **Câu trần thuật (Statements):**\n  `S + said (that) + S + V(lùi thì)` / `S + told + O + (that) + S + V(lùi thì)`\n- **Câu hỏi Yes / No:**\n  `S + asked + (O) + IF / WHETHER + S + V(lùi thì)`\n  *Lưu ý:* Bỏ trợ động từ do/does/did, đảo trật tự về dạng khẳng định (không đảo ngữ)!\n- **Câu hỏi Wh-questions:**\n  `S + asked + (O) + WH-WORD + S + V(lùi thì)`\n- **Câu mệnh lệnh, yêu cầu, lời khuyên:**\n  * `tell / order sb TO-V` (bảo ai làm gì)\n  * `ask / request sb TO-V` (yêu cầu ai làm gì)\n  * `advise sb TO-V` (khuyên ai làm gì)\n  * `remind sb TO-V` (nhắc nhở ai làm gì)\n  * `warn sb NOT TO-V` (cảnh báo ai không được làm gì)\n- **Câu cảm thán, xin lỗi, cảm ơn, buộc tội:**\n  * `apologize to sb for V-ing` (xin lỗi)\n  * `thank sb for V-ing` (cảm ơn)\n  * `accuse sb of V-ing` (buộc tội ai)\n  * `congratulate sb on V-ing` (chúc mừng ai)\n  * `suggest + V-ing` (gợi ý cùng làm gì)\n\n### 3. Trường hợp KHÔNG lùi thì:\n- Động từ tường thuật ở HIỆN TẠI (`says, tells`): Giữ nguyên thì.\n- Lời nói diễn tả một **Chân lý khoa học / Sự thật hiển nhiên**: Giữ nguyên thì hiện tại đơn.\n  *Ví dụ:* The teacher said that the Earth *orbits* the Sun.",
    "signalWords": [
      "- Nhìn động từ tường thuật: `said, told, asked, wondered, inquired`.\n- Nhìn trạng từ chuyển đổi trong câu:\n  * Thấy `the day before / previous day` -> Động từ phải lùi về **Quá khứ hoàn thành (had V3)**.\n  * Thấy `the following day / next day` -> Động từ phải là **would + V-bare**.\n  * Thấy câu hỏi gián tiếp có `if / whether` hoặc `Wh-word` -> Trật tự từ phải là **S + V** (không được đảo trợ động từ lên trước S)."
    ],
    "traps": [
      "- **Bẫy giữ nguyên đảo ngữ trong câu hỏi:** 'He asked me where did I live' là SAI. Phải là 'He asked me where I **lived**'.\n- **Bẫy quên đổi trạng từ thời gian:** Lùi thì nhưng quên đổi 'yesterday' thành 'the day before'."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo loại trừ câu hỏi gián tiếp:**\n   - Trong câu hỏi gián tiếp (`asked if... / asked what...`), câu đã biến thành câu trần thuật -> KHÔNG CÒN DẤU HỎI CHẤM `?` và KHÔNG CÒN ĐẢO NGỮ. Gạch ngay các đáp án có `did he`, `was she`, `will they`!\n2. **Mẹo Said vs Told:**\n   - `Said to + O` hoặc `Said that` (không nói said him).\n   - `Told + O + that` (bắt buộc có tân ngữ người đứng liền sau: told me, told him).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-20-1",
        "part": "PART_5",
        "questionText": "Peter told me that he _____ for that software firm for three years.\nA. works\nB. is working\nC. had worked\nD. will work",
        "options": {
          "A": "works",
          "B": "is working",
          "C": "had worked",
          "D": "will work"
        },
        "correctAnswer": "C",
        "explanation": "Theo quy tắc câu gián tiếp, khi động từ tường thuật ở quá khứ ('told'), thì Hiện tại hoàn thành trong câu trực tiếp (`have worked`) bắt buộc phải lùi một thì về Quá khứ hoàn thành (`had worked`). Chọn C. Loại ngay các đáp án A, B, D vì chưa lùi thì.",
        "trapNote": "Loại ngay các đáp án A, B, D vì chưa lùi thì.",
        "translation": "Peter nói với tôi rằng anh ấy _____ cho công ty phần mềm đó được 3 năm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-2",
        "part": "PART_5",
        "questionText": "\"I will call you tomorrow,\" John said to Mary.\n-> John told Mary that he _____ her _____.\nA. will call / tomorrow\nB. would call / the following day\nC. would call / tomorrow\nD. called / the day before",
        "options": {
          "A": "will call / tomorrow",
          "B": "would call / the following day",
          "C": "would call / tomorrow",
          "D": "called / the day before"
        },
        "correctAnswer": "B",
        "explanation": "Áp dụng quy tắc lùi thì: 'will call' lùi thành 'would call'. Đổi trạng từ chỉ thời gian: 'tomorrow' đổi thành 'the following day' (hoặc 'the next day'). Chọn B. Bẫy lùi thì 'would call' nhưng quên đổi 'tomorrow' ở phương án C.",
        "trapNote": "Bẫy lùi thì 'would call' nhưng quên đổi 'tomorrow' ở phương án C.",
        "translation": "\"Tôi sẽ gọi cho bạn vào ngày mai,\" John nói với Mary.\n-> John nói với Mary rằng anh ấy _____ cô ấy _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-3",
        "part": "PART_5",
        "questionText": "The doctor advised my father _____ up late at night.\nA. not stay\nB. to not stay\nC. not to stay\nD. didn't stay",
        "options": {
          "A": "not stay",
          "B": "to not stay",
          "C": "not to stay",
          "D": "didn't stay"
        },
        "correctAnswer": "C",
        "explanation": "Cấu trúc tường thuật lời khuyên: `advise sb (not) TO-V`. Dạng phủ định là 'not to V'. Chọn 'not to stay'. Chọn C. 'Not' luôn đứng trước 'to' (not to V), không viết 'to not stay'.",
        "trapNote": "'Not' luôn đứng trước 'to' (not to V), không viết 'to not stay'.",
        "translation": "Bác sĩ khuyên bố tôi _____ thức khuya vào ban đêm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-4",
        "part": "PART_5",
        "questionText": "\"Do you like classical music?\" she asked me.\n-> She asked me _____ classical music.\nA. if I liked\nB. if did I like\nC. whether I like\nD. that I liked",
        "options": {
          "A": "if I liked",
          "B": "if did I like",
          "C": "whether I like",
          "D": "that I liked"
        },
        "correctAnswer": "A",
        "explanation": "Tường thuật câu hỏi Yes/No: Dùng từ nối 'if' hoặc 'whether'. Bỏ trợ động từ 'do', chuyển trật tự từ về dạng khẳng định (S + V) và lùi thì: 'you' đổi thành 'I', 'like' lùi thì thành 'liked'. Ta có: 'if I liked'. Chọn A. Bẫy giữ nguyên đảo ngữ 'if did I like' của phương án B.",
        "trapNote": "Bẫy giữ nguyên đảo ngữ 'if did I like' của phương án B.",
        "translation": "\"Bạn có thích nhạc cổ điển không?\" cô ấy hỏi tôi.\n-> Cô ấy hỏi tôi _____ nhạc cổ điển.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-5",
        "part": "PART_5",
        "questionText": "The interviewer asked the candidate where he _____ his bachelor's degree.\nA. has obtained\nB. had obtained\nC. did obtain\nD. obtains",
        "options": {
          "A": "has obtained",
          "B": "had obtained",
          "C": "did obtain",
          "D": "obtains"
        },
        "correctAnswer": "B",
        "explanation": "Việc nhận bằng cử nhân đã diễn ra và hoàn tất trong quá khứ trước thời điểm phỏng vấn. Khi tường thuật với 'asked', thì Quá khứ đơn lùi về Quá khứ hoàn thành (`had + V3/ed`). Trật tự từ là khẳng định 'he had obtained'. Chọn B. Loại C vì trong câu hỏi gián tiếp không mượn trợ động từ đảo ngữ 'did'.",
        "trapNote": "Loại C vì trong câu hỏi gián tiếp không mượn trợ động từ đảo ngữ 'did'.",
        "translation": "Người phỏng vấn hỏi ứng viên nơi anh ấy _____ bằng cử nhân.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-6",
        "part": "PART_5",
        "questionText": "The police officer warned the speeding driver _____ so fast on the icy road.\nA. not driving\nB. to not drive\nC. not to drive\nD. don't drive",
        "options": {
          "A": "not driving",
          "B": "to not drive",
          "C": "not to drive",
          "D": "don't drive"
        },
        "correctAnswer": "C",
        "explanation": "Cấu trúc tường thuật cảnh báo: `warn sb NOT TO-V` (cảnh báo ai không được làm gì). Chọn 'not to drive'. Chọn C. Không dùng 'don't drive' trong câu tường thuật gián tiếp.",
        "trapNote": "Không dùng 'don't drive' trong câu tường thuật gián tiếp.",
        "translation": "Viên cảnh sát cảnh báo tài xế chạy quá tốc độ _____ quá nhanh trên con đường đóng băng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-7",
        "part": "PART_5",
        "questionText": "\"I am terribly sorry for breaking your favorite ceramic cup,\" said Mark.\n-> Mark apologized to me _____ my favorite ceramic cup.\nA. for breaking\nB. to break\nC. about breaking\nD. that he broke",
        "options": {
          "A": "for breaking",
          "B": "to break",
          "C": "about breaking",
          "D": "that he broke"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc tường thuật câu xin lỗi đặc biệt: `apologize to sb FOR + V-ing` (xin lỗi ai vì đã làm gì). Chọn 'for breaking'. Chọn A. Nhớ giới từ đi kèm với apologize luôn là 'for'.",
        "trapNote": "Nhớ giới từ đi kèm với apologize luôn là 'for'.",
        "translation": "\"Tôi vô cùng xin lỗi vì đã làm vỡ chiếc cốc gốm yêu thích của bạn,\" Mark nói.\n-> Mark đã xin lỗi tôi _____ chiếc cốc gốm yêu thích của tôi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-8",
        "part": "PART_5",
        "questionText": "\"You stole the company's financial records!\" the manager shouted at him.\n-> The manager accused him _____ the company's financial records.\nA. for stealing\nB. of stealing\nC. about stealing\nD. to steal",
        "options": {
          "A": "for stealing",
          "B": "of stealing",
          "C": "about stealing",
          "D": "to steal"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc tường thuật lời buộc tội: `accuse sb OF + V-ing` (buộc tội ai vì đã làm gì). Giới từ đi với accuse là 'of'. Chọn B. Dễ nhầm với 'blame sb for V-ing' (đổ lỗi cho ai). Với 'accuse' bắt buộc phải dùng giới từ 'of'.",
        "trapNote": "Dễ nhầm với 'blame sb for V-ing' (đổ lỗi cho ai). Với 'accuse' bắt buộc phải dùng giới từ 'of'.",
        "translation": "\"Anh đã đánh cắp hồ sơ tài chính của công ty!\" người quản lý hét vào mặt anh ta.\n-> Người quản lý buộc tội anh ta _____ hồ sơ tài chính của công ty.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-9",
        "part": "PART_5",
        "questionText": "The geography professor explained that the Earth _____ around the Sun once every 365.25 days.\nA. rotated\nB. rotates\nC. had rotated\nD. was rotating",
        "options": {
          "A": "rotated",
          "B": "rotates",
          "C": "had rotated",
          "D": "was rotating"
        },
        "correctAnswer": "B",
        "explanation": "Ngoại lệ vàng của câu tường thuật: Dù động từ tường thuật ở quá khứ ('explained'), nhưng nếu mệnh đề được tường thuật diễn tả một CHÂN LÝ KHOA HỌC hoặc SỰ THẬT HIỂN NHIÊN thì BẮT BUỘC GIỮ NGUYÊN THÌ HIỆN TẠI ĐƠN, TUYỆT ĐỐI KHÔNG ĐƯỢC LÙI THÌ. Trái Đất quay quanh Mặt Trời là định luật vũ trụ -> Dùng 'rotates'. Chọn B. Bẫy lùi thì máy móc theo 'explained' thành 'rotated' là mất điểm điểm 10.",
        "trapNote": "Bẫy lùi thì máy móc theo 'explained' thành 'rotated' là mất điểm điểm 10.",
        "translation": "Giáo sư địa lý giải thích rằng Trái Đất _____ quanh Mặt Trời một lần mỗi 365,25 ngày.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-20-10",
        "part": "PART_5",
        "questionText": "\"Why don't we organize a fundraising charity concert this weekend?\" said Sarah.\n-> Sarah suggested _____ a fundraising charity concert that weekend.\nA. to organize\nB. organizing\nC. that they should organized\nD. organized",
        "options": {
          "A": "to organize",
          "B": "organizing",
          "C": "that they should organized",
          "D": "organized"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc tường thuật lời gợi ý cùng tham gia: `suggest + V-ING` (hoặc `suggest that S + (should) + V-bare`). 'suggest' tuyệt đối không đi với 'to-V' -> loại A. Đáp án C sai vì sau 'should' động từ phải nguyên thể không chia (không có -ed). Do đó đáp án chuẩn xác duy nhất là 'organizing'. Chọn B. Tuyệt đối không chọn 'suggest to organize'.",
        "trapNote": "Tuyệt đối không chọn 'suggest to organize'.",
        "translation": "\"Tại sao chúng ta không tổ chức một buổi hòa nhạc từ thiện gây quỹ vào cuối tuần này nhỉ?\" Sarah nói.\n-> Sarah gợi ý _____ một buổi hòa nhạc từ thiện gây quỹ vào cuối tuần đó.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-21",
    "code": "CD_21",
    "titleVi": "Chuyên đề 21: Đảo Ngữ",
    "titleEn": "Inversions",
    "part": "Part 6 & 7",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Đảo ngữ (Inversion) là biện pháp tu từ đảo trợ động từ hoặc động từ lên trước chủ ngữ nhằm mục đích nhấn mạnh ý nghĩa câu. Đây là dạng câu hỏi phân loại điểm 9-10 trong đề thi THPT Quốc Gia và thường xuất hiện trong phần đọc hiểu trang trọng của TOEIC/IELTS.",
    "formula": "### 1. Bản chất của Đảo ngữ:\nĐảo ngữ là việc đưa **TRỢ ĐỘNG TỪ** (hoặc Modal verb / To be) lên đứng trước **CHỦ NGỮ**:\n`Phó từ / Cụm từ đảo ngữ + TRỢ ĐỘNG TỪ (do/does/did/have/is/can) + S + V-bare`\n\n### 2. Các cấu trúc đảo ngữ kinh điển hay thi nhất:\n#### A. Đảo ngữ với Phó từ phủ định hoặc bán phủ định:\n`Never / Rarely / Seldom / Scarcely / Little / Hardly + TRỢ ĐỘNG TỪ + S + V`\n*Ví dụ:* *Never have I seen* such a breathtaking sunset.\n*Ví dụ:* *Little did he know* about the surprise party.\n\n#### B. Đảo ngữ \"Vừa mới... thì đã...\":\n- `NO SOONER + had + S + V3/ed + THAN + S + V2/ed`\n- `HARDLY / SCARCELY + had + S + V3/ed + WHEN + S + V2/ed`\n*Ví dụ:* *No sooner had we arrived* at the station *than* the train departed.\n\n#### C. Đảo ngữ với NOT ONLY... BUT ALSO:\n`NOT ONLY + Trợ động từ + S + V, BUT + S + ALSO + V`\n*Ví dụ:* *Not only is he* intelligent, *but he is also* exceptionally hardworking.\n\n#### D. Đảo ngữ với ONLY:\n- `Only when + Clause / Only after + Clause / Only by + V-ing + TRỢ ĐỘNG TỪ + S + V`\n*Lưu ý cốt tử:* Đảo ngữ ở **MỆNH ĐỀ CHÍNH PHÍA SAU**, không đảo ngữ ở mệnh đề ngay sau Only!\n*Ví dụ:* Only after finishing all his homework *did he go* to bed.\n- `Only then / Only once / Only later + Trợ động từ + S + V`\n\n#### E. Đảo ngữ với SO... THAT và SUCH... THAT:\n- `SO + Adj + BE + S + THAT + Clause`\n- `SO + Adv + Trợ động từ + S + V + THAT + Clause`\n  *Ví dụ:* *So beautiful was the girl that* everyone turned to look at her.\n- `SUCH + BE + (a/an) + Noun + THAT + Clause`\n  *Ví dụ:* *Such was the force of the wind that* trees were uprooted.\n\n#### F. Đảo ngữ với Cụm giới từ chỉ nơi chốn / Phương hướng:\nKhi đảo cụm giới từ chỉ địa điểm lên đầu câu, đảo **NGUYÊN CẢ ĐỘNG TỪ CHÍNH** lên trước chủ ngữ (không mượn trợ động từ do/does/did):\n`Cụm giới từ + V(chính) + Chủ ngữ (Danh từ)`\n*Ví dụ:* *On the top of the hill stands* a magnificent ancient castle.\n*Ví dụ:* *Here comes* the bus! (Nhưng nếu S là đại từ: *Here it comes*).",
    "signalWords": [
      "- Thấy đầu câu có các từ: `Never, Rarely, Seldom, Hardly, No sooner, Not only, Only after, Only when, Under no circumstances`.\n- Nhìn vị trí sau các từ này: Trống chỗ trợ động từ hoặc đảo vị trí -> Chắc chắn là cấu trúc **ĐẢO NGỮ**.\n- Nhìn liên từ đi kèm:\n  * Thấy `than` phía sau -> Chọn `No sooner`.\n  * Thấy `when` phía sau -> Chọn `Hardly / Scarcely`.\n  * Thấy `that` phía sau -> Chọn `So + Adj + be...` hoặc `Such + be...`."
    ],
    "traps": [
      "- **Bẫy đảo nhầm mệnh đề của ONLY:** Nhiều bạn đảo ngay mệnh đề sau Only when ('Only when did I arrive...' là SAI). Phải là 'Only when I arrived **did I realize**...'.\n- **Bẫy No sooner đi với when:** Nhầm lẫn từ nối giữa No sooner than và Hardly when."
    ],
    "examples": [
      {
        "sentence": "1. **Cặp bài trùng No sooner than - Hardly when:**\n   - *No sooner* đi với **THAN**.\n   - *Hardly / Scarcely* đi với **WHEN**.\n2. **Mẹo đảo ngữ Only:**\n   - Sau `Only after / Only when / Only if`, mệnh đề liền kề đi bình thường, **mệnh đề thứ hai mới bị đảo**!\n3. **Mẹo loại trừ nhanh:**\n   - Đầu câu có phó từ phủ định -> Loại ngay các đáp án chưa đảo ngữ (dạng S + V). Bắt buộc phải là `Auxiliary + S + V`!",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-21-1",
        "part": "PART_5",
        "questionText": "Never _____ such a spectacular firework display in my entire life.\nA. I have seen\nB. have I seen\nC. I saw\nD. did I saw",
        "options": {
          "A": "I have seen",
          "B": "have I seen",
          "C": "I saw",
          "D": "did I saw"
        },
        "correctAnswer": "B",
        "explanation": "Khi phó từ phủ định 'Never' đứng đầu câu, ta bắt buộc phải đảo trợ động từ lên trước chủ ngữ: `Never + have/has + S + V3/ed`. 'have I seen' là dạng đảo ngữ chuẩn xác. Chọn B. Loại ngay A và C vì chưa đảo ngữ. Loại D vì sau 'did' động từ phải nguyên thể (không dùng saw).",
        "trapNote": "Loại ngay A và C vì chưa đảo ngữ. Loại D vì sau 'did' động từ phải nguyên thể (không dùng saw).",
        "translation": "Chưa bao giờ _____ một màn trình diễn pháo hoa ngoạn mục như vậy trong cả cuộc đời tôi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-2",
        "part": "PART_5",
        "questionText": "Seldom _____ out alone late at night due to safety concerns.\nA. she goes\nB. does she go\nC. she does go\nD. goes she",
        "options": {
          "A": "she goes",
          "B": "does she go",
          "C": "she does go",
          "D": "goes she"
        },
        "correctAnswer": "B",
        "explanation": "Với động từ thường thì hiện tại đơn 'goes', khi đảo ngữ với 'Seldom' ta phải mượn trợ động từ 'does' đưa lên trước chủ ngữ 'she': `Seldom + does + she + go`. Chọn B. Không được đảo trực tiếp động từ thường lên trước chủ ngữ như phương án D.",
        "trapNote": "Không được đảo trực tiếp động từ thường lên trước chủ ngữ như phương án D.",
        "translation": "Hiếm khi _____ ra ngoài một mình vào đêm muộn do lo ngại về an toàn.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-3",
        "part": "PART_5",
        "questionText": "No sooner had the plane taken off _____ it encountered severe turbulence.\nA. when\nB. than\nC. that\nD. then",
        "options": {
          "A": "when",
          "B": "than",
          "C": "that",
          "D": "then"
        },
        "correctAnswer": "B",
        "explanation": "Cặp liên từ đảo ngữ cố định: `No sooner had... THAN...` (Vừa mới... thì...). Từ nối bắt buộc đi với 'No sooner' là 'than'. Chọn B. Dễ nhầm với 'when' (when đi với Hardly / Scarcely).",
        "trapNote": "Dễ nhầm với 'when' (when đi với Hardly / Scarcely).",
        "translation": "Máy bay vừa mới cất cánh _____ nó đã gặp phải vùng nhiễu động không khí dữ dội.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-4",
        "part": "PART_5",
        "questionText": "Hardly _____ the office when the telephone started ringing incessantly.\nA. had he entered\nB. he had entered\nC. did he enter\nD. entered he",
        "options": {
          "A": "had he entered",
          "B": "he had entered",
          "C": "did he enter",
          "D": "entered he"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc đảo ngữ: `Hardly + had + S + V3/ed + when + S + V2/ed`. Đảo trợ động từ 'had' lên trước chủ ngữ 'he': 'had he entered'. Chọn A. Loại ngay B vì chưa đảo ngữ.",
        "trapNote": "Loại ngay B vì chưa đảo ngữ.",
        "translation": "Anh ấy vừa mới bước vào văn phòng thì điện thoại bắt đầu reo liên hồi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-5",
        "part": "PART_5",
        "questionText": "Not only _____ fluent in three foreign languages, but she is also a talented pianist.\nA. she is\nB. is she\nC. does she\nD. she does",
        "options": {
          "A": "she is",
          "B": "is she",
          "C": "does she",
          "D": "she does"
        },
        "correctAnswer": "B",
        "explanation": "Đảo ngữ với 'Not only': `Not only + To be / Trợ động từ + S + ..., but S also...`. Vì 'fluent' là tính từ nên đi với to be 'is'. Đảo 'is' lên trước 'she' -> 'is she'. Chọn B. Không mượn 'does' vì 'fluent' là tính từ, bắt buộc dùng to be.",
        "trapNote": "Không mượn 'does' vì 'fluent' là tính từ, bắt buộc dùng to be.",
        "translation": "Không những cô ấy thông thạo ba ngoại ngữ, mà cô ấy còn là một nghệ sĩ dương cầm tài năng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-6",
        "part": "PART_5",
        "questionText": "Under no circumstances _____ confidential client information without prior written approval.\nA. should employees disclose\nB. employees should disclose\nC. employees disclose\nD. should disclose employees",
        "options": {
          "A": "should employees disclose",
          "B": "employees should disclose",
          "C": "employees disclose",
          "D": "should disclose employees"
        },
        "correctAnswer": "A",
        "explanation": "Khi cụm 'Under no circumstances' đứng đầu câu, câu bắt buộc phải đảo ngữ: `Under no circumstances + modal verb / auxiliary + S + V-bare`. Đảo 'should' lên trước 'employees': 'should employees disclose'. Chọn A. Cụm 'Under no circumstances' rất hay xuất hiện trong TOEIC Part 5 & 6.",
        "trapNote": "Cụm 'Under no circumstances' rất hay xuất hiện trong TOEIC Part 5 & 6.",
        "translation": "Dưới bất kỳ hoàn cảnh nào nhân viên cũng không được tiết lộ thông tin mật của khách hàng nếu không có chấp thuận trước bằng văn bản.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-7",
        "part": "PART_5",
        "questionText": "Only after the audit was fully completed _____ the extent of the financial discrepancy.\nA. the board realized\nB. did the board realize\nC. had the board realized\nD. was the board realized",
        "options": {
          "A": "the board realized",
          "B": "did the board realize",
          "C": "had the board realized",
          "D": "was the board realized"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc đảo ngữ với Only: `Only after + Clause, AUXILIARY + S + V-bare`. Mệnh đề sau Only giữ trật tự bình thường, đảo ngữ ở MỆNH ĐỀ CHÍNH phía sau. Hành động nhận ra ở quá khứ đơn -> mượn trợ động từ 'did' -> 'did the board realize'. Chọn B. Nhiều bạn đảo ngữ nhầm ở mệnh đề ngay sau Only after hoặc quên không đảo ở mệnh đề chính.",
        "trapNote": "Nhiều bạn đảo ngữ nhầm ở mệnh đề ngay sau Only after hoặc quên không đảo ở mệnh đề chính.",
        "translation": "Chỉ sau khi cuộc kiểm toán hoàn tất đầy đủ, ban giám đốc mới nhận ra mức độ sai lệch tài chính.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-8",
        "part": "PART_5",
        "questionText": "So intense _____ that several athletes suffered from severe dehydration during the marathon.\nA. the summer heat was\nB. was the summer heat\nC. the summer heat is\nD. is the summer heat",
        "options": {
          "A": "the summer heat was",
          "B": "was the summer heat",
          "C": "the summer heat is",
          "D": "is the summer heat"
        },
        "correctAnswer": "B",
        "explanation": "Đảo ngữ với SO: `SO + Adj + BE + S + THAT + Clause`. Căn cứ vào vế sau chia thì quá khứ 'suffered', động từ to be phải ở quá khứ là 'was'. Đảo 'was' lên trước chủ ngữ 'the summer heat' -> 'was the summer heat'. Chọn B. Loại D vì dùng 'is' sai thì với 'suffered' ở vế sau.",
        "trapNote": "Loại D vì dùng 'is' sai thì với 'suffered' ở vế sau.",
        "translation": "Cái nóng mùa hè dữ dội đến nỗi mà vài vận động viên đã bị mất nước nghiêm trọng trong cuộc chạy ma-ra-tông.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-9",
        "part": "PART_5",
        "questionText": "At the edge of the ancient forest _____ that had been abandoned for centuries.\nA. stood a ruined castle\nB. did a ruined castle stand\nC. a ruined castle stood\nD. was standing a ruined castle",
        "options": {
          "A": "stood a ruined castle",
          "B": "did a ruined castle stand",
          "C": "a ruined castle stood",
          "D": "was standing a ruined castle"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc đảo ngữ toàn bộ (Full Inversion) với cụm giới từ chỉ nơi chốn: Khi cụm giới từ chỉ địa điểm đứng đầu câu và chủ ngữ là một DANH TỪ (a ruined castle), ta ĐẢO NGUYÊN CẢ ĐỘNG TỪ CHÍNH lên trước chủ ngữ, TUYỆT ĐỐI KHÔNG mượn trợ động từ do/does/did! Cấu trúc: `Prep phrase + Main Verb + Noun`. Do đó: 'stood a ruined castle'. Chọn A. Bẫy máy móc mượn trợ động từ 'did... stand' ở phương án B là lỗi sai của hơn 80% học sinh khá giỏi.",
        "trapNote": "Bẫy máy móc mượn trợ động từ 'did... stand' ở phương án B là lỗi sai của hơn 80% học sinh khá giỏi.",
        "translation": "Ở rìa khu rừng cổ kính sừng sững một tòa lâu đài đổ nát đã bị bỏ hoang hàng thế kỷ.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-21-10",
        "part": "PART_5",
        "questionText": "Such _____ that the local authorities had to evacuate thousands of residents immediately.\nA. the flood was severe\nB. was the severity of the flood\nC. severe the flood was\nD. the severity of the flood was",
        "options": {
          "A": "the flood was severe",
          "B": "was the severity of the flood",
          "C": "severe the flood was",
          "D": "the severity of the flood was"
        },
        "correctAnswer": "B",
        "explanation": "Đảo ngữ với SUCH: `SUCH + BE + CỤM DANH TỪ + THAT + Clause`. Đảo to be 'was' lên trước cụm danh từ 'the severity of the flood' (mức độ nghiêm trọng của trận lũ). Trật tự đúng: 'was the severity of the flood'. Chọn B. Dễ nhầm cấu trúc của 'So + Adj + be + S' và 'Such + be + Noun'.",
        "trapNote": "Dễ nhầm cấu trúc của 'So + Adj + be + S' và 'Such + be + Noun'.",
        "translation": "Mức độ nghiêm trọng của trận lũ lụt lớn đến nỗi chính quyền địa phương phải sơ tán hàng nghìn người dân ngay lập tức.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-22",
    "code": "CD_22",
    "titleVi": "Chuyên đề 22: Mệnh Đề Quan Hệ",
    "titleEn": "Relative Clauses",
    "part": "Part 6 & 7",
    "targetScore": "500_750",
    "status": "PUBLISHED",
    "summary": "Mệnh đề quan hệ (Relative Clauses) là một trong những chuyên đề xuất hiện với tần số 100% trong đề thi THPT QG và TOEIC. Thí sinh cần làm chủ đại từ quan hệ (Who, Whom, Which, That, Whose), trạng từ quan hệ (Where, When, Why), phân biệt mệnh đề xác định/không xác định và kỹ thuật Rút gọn mệnh đề quan hệ (V-ing, V3/ed, To-V).",
    "formula": "### 1. Các Đại từ quan hệ (Relative Pronouns):\n- **WHO:** Thay thế cho danh từ chỉ NGƯỜI, làm Chủ ngữ hoặc Tân ngữ trong mệnh đề quan hệ (`... N(người) + WHO + Verb / Clause`).\n- **WHOM:** Thay thế cho danh từ chỉ NGƯỜI, làm Tân ngữ (`... N(người) + WHOM + S + V`). Đứng được sau giới từ (`to whom, with whom`).\n- **WHICH:** Thay thế cho danh từ chỉ VẬT, làm Chủ ngữ hoặc Tân ngữ (`... N(vật) + WHICH + Verb / Clause`). Đứng được sau giới từ (`in which, on which`).\n- **THAT:** Thay thế cho cả NGƯỜI và VẬT trong Mệnh đề quan hệ XÁC ĐỊNH.\n  * *Bắt buộc dùng THAT:* Sau đại từ bất định (`everything, nothing, all, little`), sau so sánh nhất (`the best, the most`), sau `the only, the first`.\n  * *TUYỆT ĐỐI KHÔNG dùng THAT:* Trong mệnh đề có dấu phẩy (không xác định) và ngay sau giới từ!\n- **WHOSE:** Chỉ sở hữu cho người hoặc vật (`... Noun + WHOSE + Noun + Verb...`).\n\n### 2. Các Trạng từ quan hệ (Relative Adverbs):\n- **WHERE:** Thay thế cho trạng từ nơi chốn (= in / at / on which).\n  * *Ví dụ:* The hotel *where* we stayed (= in which we stayed).\n  * *Lưu ý:* Nếu mệnh đề sau có giới từ ở cuối, dùng `which` chứ không dùng `where` (*the house which I live in*).\n- **WHEN:** Thay thế cho trạng từ thời gian (= in / on / at which).\n- **WHY:** Thay thế cho lý do (= for which), thường đứng sau 'the reason'.\n\n### 3. Phân biệt Mệnh đề Xác định vs Không xác định:\n- **Xác định (Defining):** Không có dấu phẩy, thông tin bắt buộc phải có để xác định danh từ. Được dùng 'that'.\n- **Không xác định (Non-defining):** CÓ DẤU PHẨY `, ... ,`. Dùng khi danh từ đã rõ ràng (tên riêng, có this/that/my). KHÔNG ĐƯỢC DÙNG 'THAT', không được lược bỏ đại từ quan hệ.\n  * Cả mệnh đề đứng trước được thay thế bằng `, which + V` (dấu phẩy + which bổ nghĩa cho cả câu trước).\n\n### 4. RÚT GỌN MỆNH ĐỀ QUAN HỆ (Trọng tâm đề thi):\n1. **Rút gọn thành V-ING (Dạng CHỦ ĐỘNG):**\n   * *Gốc:* The man *who is standing* there is my uncle.\n   * *Rút gọn:* The man *standing* there is my uncle.\n2. **Rút gọn thành V3/ED (Dạng BỊ ĐỘNG):**\n   * *Gốc:* The books *which were written* by him are bestsellers.\n   * *Rút gọn:* The books *written* by him are bestsellers.\n3. **Rút gọn thành TO-V (Sau the first, the second, the only, the last, so sánh nhất):**\n   * *Gốc:* Neil Armstrong was the first man *who walked* on the moon.\n   * *Rút gọn:* Neil Armstrong was the first man *to walk* on the moon.",
    "signalWords": [
      "- Nhìn từ đứng NGAY TRƯỚC chỗ trống:\n  * Là người hay vật? Có sở hữu danh từ phía sau không (`whose + N`)?\n  * Có dấu phẩy `,` hoặc giới từ phía trước không? Nếu có -> GẠCH NGAY đáp án `THAT`!\n- Nhìn cấu trúc rút gọn:\n  * Nếu câu đã có động từ chính chia thì, chỗ trống nằm trong cụm danh từ:\n    -> Chủ động chọn **V-ing**.\n    -> Bị động chọn **V3/ed**.\n    -> Có 'the first / only / last / best' chọn **To-V**."
    ],
    "traps": [
      "- **Bẫy Where vs Which khi có giới từ:** 'The city where I visited' là SAI, vì 'visit' là ngoại động từ cần tân ngữ -> phải là 'The city **which** I visited'.\n- **Bẫy lược bỏ đại từ trong câu có dấu phẩy:** Chỉ được lược bỏ đại từ quan hệ làm tân ngữ trong mệnh đề xác định (không dấu phẩy)."
    ],
    "examples": [
      {
        "sentence": "1. **Mẹo cấm kỵ với THAT:**\n   - *Thấy dấu phẩy `,` hoặc giới từ (in, at, with)* -> **GẠCH NGAY THAT**!\n2. **Mẹo phân biệt Which vs Where:**\n   - Sau chỗ trống thiếu tân ngữ/chủ ngữ (động từ đứng ngay sau) -> Chọn **WHICH**.\n   - Sau chỗ trống là một câu hoàn chỉnh đầy đủ S + V + O -> Chọn **WHERE**.\n3. **Thần chú Whose:**\n   - `Danh từ 1 + WHOSE + Danh từ 2` (Danh từ 2 không bao giờ có a/an/the).",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-22-1",
        "part": "PART_5",
        "questionText": "The candidate _____ scored the highest mark in the entrance exam was awarded a scholarship.\nA. which\nB. who\nC. whom\nD. whose",
        "options": {
          "A": "which",
          "B": "who",
          "C": "whom",
          "D": "whose"
        },
        "correctAnswer": "B",
        "explanation": "'The candidate' là danh từ chỉ người. Vị trí cần điền đóng vai trò làm CHỦ NGỮ cho động từ 'scored' -> Dùng đại từ quan hệ 'who'. Chọn B. 'Whom' chỉ làm tân ngữ, không thể làm chủ ngữ cho động từ 'scored'.",
        "trapNote": "'Whom' chỉ làm tân ngữ, không thể làm chủ ngữ cho động từ 'scored'.",
        "translation": "Ứng viên _____ đạt điểm cao nhất trong kỳ thi tuyển sinh đã được trao học bổng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-2",
        "part": "PART_5",
        "questionText": "The laptop _____ I purchased online last week has already malfunctioned.\nA. who\nB. which\nC. whom\nD. whose",
        "options": {
          "A": "who",
          "B": "which",
          "C": "whom",
          "D": "whose"
        },
        "correctAnswer": "B",
        "explanation": "'The laptop' là danh từ chỉ vật. Đại từ quan hệ thay thế cho vật làm tân ngữ cho 'purchased' là 'which' (hoặc 'that'). Trong các đáp án chỉ có 'which'. Chọn B. Loại ngay các đại từ chỉ người who, whom, whose.",
        "trapNote": "Loại ngay các đại từ chỉ người who, whom, whose.",
        "translation": "Chiếc máy tính xách tay _____ tôi mua trực tuyến tuần trước đã bị trục trặc rồi.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-3",
        "part": "PART_5",
        "questionText": "Professor Miller, _____ has published numerous scientific papers, will lead the research team.\nA. that\nB. who\nC. whom\nD. which",
        "options": {
          "A": "that",
          "B": "who",
          "C": "whom",
          "D": "which"
        },
        "correctAnswer": "B",
        "explanation": "Đây là mệnh đề quan hệ không xác định (có dấu phẩy). 'Professor Miller' là người, làm chủ ngữ cho 'has published'. Tuyệt đối KHÔNG DÙNG 'that' sau dấu phẩy -> Bắt buộc dùng 'who'. Chọn B. Bẫy cấm kỵ: Tuyệt đối không bao giờ chọn 'that' khi có dấu phẩy đứng trước.",
        "trapNote": "Bẫy cấm kỵ: Tuyệt đối không bao giờ chọn 'that' khi có dấu phẩy đứng trước.",
        "translation": "Giáo sư Miller, người _____ đã công bố nhiều bài báo khoa học, sẽ dẫn dắt nhóm nghiên cứu.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-4",
        "part": "PART_5",
        "questionText": "The woman _____ car was severely damaged in the accident is talking to the police.\nA. who\nB. whom\nC. whose\nD. that",
        "options": {
          "A": "who",
          "B": "whom",
          "C": "whose",
          "D": "that"
        },
        "correctAnswer": "C",
        "explanation": "Mối quan hệ sở hữu: Chiếc xe hơi của người phụ nữ (`her car` = `whose car`). Đại từ quan hệ chỉ sở hữu là 'whose'. Chọn C. Dấu hiệu nhận biết: sau 'whose' luôn là một danh từ trơ trọi không có a/an/the.",
        "trapNote": "Dấu hiệu nhận biết: sau 'whose' luôn là một danh từ trơ trọi không có a/an/the.",
        "translation": "Người phụ nữ _____ xe hơi bị hư hỏng nặng trong vụ tai nạn đang nói chuyện với cảnh sát.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-5",
        "part": "PART_5",
        "questionText": "This is the senior accountant with _____ I collaborated on the annual financial audit.\nA. who\nB. whom\nC. that\nD. which",
        "options": {
          "A": "who",
          "B": "whom",
          "C": "that",
          "D": "which"
        },
        "correctAnswer": "B",
        "explanation": "Quy tắc ngữ pháp chuẩn: Sau giới từ chỉ người ('with, to, for, about...'), ta BẮT BUỘC dùng 'whom', không dùng 'who' và tuyệt đối không dùng 'that'. Do đó 'with whom'. Chọn B. Bẫy cấm kỵ thứ 2 của THAT: 'with that' là sai hoàn toàn.",
        "trapNote": "Bẫy cấm kỵ thứ 2 của THAT: 'with that' là sai hoàn toàn.",
        "translation": "Đây là kế toán viên cấp cao, người mà cùng với người đó _____ tôi đã cộng tác trong cuộc kiểm toán tài chính hàng năm.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-6",
        "part": "PART_5",
        "questionText": "He passed the prestigious bar exam on his very first attempt, _____ surprised all his mentors.\nA. who\nB. that\nC. which\nD. what",
        "options": {
          "A": "who",
          "B": "that",
          "C": "which",
          "D": "what"
        },
        "correctAnswer": "C",
        "explanation": "Khi đại từ quan hệ thay thế cho CẢ MỘT MỆNH ĐỀ ĐỨNG TRƯỚC (việc anh ấy đỗ kỳ thi), ta BẮT BUỘC dùng `, which + V` (dấu phẩy + which mang nghĩa là 'điều này'). Tuyệt đối không dùng 'that' hay 'what'. Chọn C. Cực kỳ nhiều học sinh chọn nhầm 'that' hoặc 'what' khi dịch câu mang nghĩa 'điều mà'.",
        "trapNote": "Cực kỳ nhiều học sinh chọn nhầm 'that' hoặc 'what' khi dịch câu mang nghĩa 'điều mà'.",
        "translation": "Anh ấy đã đỗ kỳ thi luật sư danh giá ngay lần thi đầu tiên, điều này _____ làm kinh ngạc tất cả những người thầy của anh ấy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-7",
        "part": "PART_5",
        "questionText": "The representatives attending the international symposium were given detailed brochures _____ the company's newest innovations.\nA. describe\nB. describing\nC. described\nD. to be described",
        "options": {
          "A": "describe",
          "B": "describing",
          "C": "described",
          "D": "to be described"
        },
        "correctAnswer": "B",
        "explanation": "Rút gọn mệnh đề quan hệ dạng CHỦ ĐỘNG: Câu gốc là 'brochures which describe the company's innovations'. Khi rút gọn mệnh đề chủ động, ta bỏ đại từ quan hệ và biến động từ thành dạng V-ING -> 'describing'. Chọn B. Loại A vì câu không thể có 2 động từ chính cùng chia thì. Loại C vì brochures chủ động miêu tả chứ không bị miêu tả.",
        "trapNote": "Loại A vì câu không thể có 2 động từ chính cùng chia thì. Loại C vì brochures chủ động miêu tả chứ không bị miêu tả.",
        "translation": "Các đại biểu tham dự hội nghị quốc tế đã được phát tài liệu giới thiệu chi tiết _____ những cải tiến mới nhất của công ty.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-8",
        "part": "PART_5",
        "questionText": "The valuable archaeological artifacts _____ in the ancient tomb will be exhibited at the national museum.\nA. discovering\nB. discovered\nC. were discovered\nD. discover",
        "options": {
          "A": "discovering",
          "B": "discovered",
          "C": "were discovered",
          "D": "discover"
        },
        "correctAnswer": "B",
        "explanation": "Rút gọn mệnh đề quan hệ dạng BỊ ĐỘNG: Câu gốc là 'The artifacts which were discovered in the ancient tomb'. Rút gọn bị động bằng cách bỏ 'which were', giữ lại quá khứ phân từ V3/ed là 'discovered'. Chọn B. Bẫy chọn 'were discovered' ở phương án C sẽ khiến câu có 2 vị ngữ chính mà không có liên từ nối.",
        "trapNote": "Bẫy chọn 'were discovered' ở phương án C sẽ khiến câu có 2 vị ngữ chính mà không có liên từ nối.",
        "translation": "Các hiện vật khảo cổ có giá trị _____ trong ngôi mộ cổ sẽ được trưng bày tại bảo tàng quốc gia.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-9",
        "part": "PART_5",
        "questionText": "Dr. Sarah Jenkins was the only female scientist _____ the prestigious Nobel Prize in Chemistry that year.\nA. to receive\nB. receiving\nC. received\nD. who receive",
        "options": {
          "A": "to receive",
          "B": "receiving",
          "C": "received",
          "D": "who receive"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc rút gọn mệnh đề quan hệ đặc biệt: Khi danh từ đi liền trước có các từ hạn định đặc biệt: `the first, the second, the last, the only` hoặc `so sánh nhất (the most/est)`, mệnh đề quan hệ bắt buộc phải rút gọn bằng dạng **TO-INFINITIVE (To-V)**. Câu gốc: 'who received' -> Rút gọn thành 'to receive'. Chọn A. Học sinh quen thói quen rút gọn chủ động bằng V-ing sẽ chọn nhầm 'receiving'. Nhớ: Có 'The only' thì phải dùng To-V.",
        "trapNote": "Học sinh quen thói quen rút gọn chủ động bằng V-ing sẽ chọn nhầm 'receiving'. Nhớ: Có 'The only' thì phải dùng To-V.",
        "translation": "Tiến sĩ Sarah Jenkins là nhà khoa học nữ duy nhất _____ giải Nobel Hóa học danh giá vào năm đó.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-22-10",
        "part": "PART_5",
        "questionText": "Paris is a fascinating historical city _____ I have visited three times over the past decade.\nA. where\nB. which\nC. in that\nD. when",
        "options": {
          "A": "where",
          "B": "which",
          "C": "in that",
          "D": "when"
        },
        "correctAnswer": "B",
        "explanation": "Bẫy siêu kinh điển giữa Where và Which: Mặc dù 'city' là nơi chốn, nhưng động từ phía sau là 'visit' - một NGOẠI ĐỘNG TỪ cần tân ngữ trực tiếp (visit somewhere, không có giới từ in/at). Do mệnh đề sau thiếu tân ngữ trực tiếp, đại từ quan hệ thay thế tân ngữ phải là 'which' (hoặc that). Nếu câu là 'where I lived' (live in) thì mới dùng Where. Chọn B. Hơn 90% học sinh cứ thấy tên thành phố, đất nước là tự động chọn 'where' mà không phân tích động từ phía sau.",
        "trapNote": "Hơn 90% học sinh cứ thấy tên thành phố, đất nước là tự động chọn 'where' mà không phân tích động từ phía sau.",
        "translation": "Pa-ri là một thành phố lịch sử đầy quyến rũ _____ tôi đã từng ghé thăm ba lần trong thập kỷ qua.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-23",
    "code": "CD_23",
    "titleVi": "Chuyên đề 23: Thành Ngữ",
    "titleEn": "Idioms",
    "part": "Part 7",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Thành ngữ (Idioms) là nét tinh hoa của ngôn ngữ tiếng Anh, mang nghĩa bóng hoàn toàn khác với nghĩa đen của từng từ cấu thành. Trong đề thi THPT Quốc Gia, câu hỏi thành ngữ luôn là câu phân loại điểm 9 và 10, đồng thời là chìa khóa để đạt điểm tối đa trong phần nghe hiểu TOEIC và giao tiếp tự nhiên.",
    "formula": "### 1. Bản chất của Thành ngữ (Idiom):\nThành ngữ là một cụm từ cố định mà ý nghĩa tổng thể không thể suy ra từ nghĩa đen của từng từ riêng lẻ. Thí sinh bắt buộc phải ghi nhớ cả cụm và ngữ cảnh sử dụng.\n\n### 2. Các Thành ngữ trọng điểm hay thi nhất trong đề thi:\n- **A piece of cake:** Dễ như ăn kẹo, cực kỳ dễ dàng (= very easy).\n- **Cost an arm and a leg:** Vô cùng đắt đỏ, tốn kém (= very expensive).\n- **Once in a blue moon:** Hiếm khi, năm thì mười họa (= very rarely, seldom).\n- **Under the weather:** Cảm thấy mệt mỏi, không được khỏe (= feel slightly ill/sick).\n- **Break a leg:** Chúc may mắn (dùng trước buổi biểu diễn, thi cử = good luck).\n- **Bite the bullet:** Cắn răng chịu đựng, dũng cảm đối mặt với điều khó khăn (= face a difficult situation with courage).\n- **Burn the midnight oil:** Thức khuya cày cuốc học tập / làm việc (= stay up late working or studying).\n- **Hit the books:** Bắt đầu học tập chăm chỉ (= start studying hard).\n- **Spill the beans:** Tiết lộ bí mật, làm lộ chuyện (= reveal a secret).\n- **Call it a day:** Dừng lại, kết thúc một ngày làm việc (= stop working for the day).\n- **See eye to eye with sb:** Hoàn toàn đồng tình, cùng chung quan điểm với ai (= agree with someone).\n- **Face the music:** Chấp nhận hình phạt / đối mặt với hậu quả do mình gây ra (= accept unpleasant consequences).\n- **Hit the nail on the head:** Nói trúng phóc, hoàn toàn chính xác (= be completely accurate).\n- **At the eleventh hour:** Vào phút chót, ngay trước khi quá muộn (= at the last possible moment).\n- **Raining cats and dogs:** Mưa như trút nước, mưa xối xả (= raining very heavily).",
    "signalWords": [
      "- Nhìn 4 đáp án: Đều là các danh từ chỉ bộ phận cơ thể (`arm and leg, eye, ear`), con vật (`cats and dogs, blue moon`) hoặc hành động cụ thể (`burn, hit, bite`).\n- Phân tích ngữ cảnh câu đề bài:\n  * Ngữ cảnh kỳ thi dễ dàng -> `a piece of cake`.\n  * Ngữ cảnh giá cả quá đắt -> `cost an arm and a leg`.\n  * Ngữ cảnh thức đêm ôn thi -> `burn the midnight oil`.\n  * Ngữ cảnh chúc may mắn -> `break a leg`.\n  * Ngữ cảnh bị ốm/mệt mỏi -> `under the weather`."
    ],
    "traps": [
      "- **Bẫy dịch nghĩa đen:** Dịch 'break a leg' là bẻ gãy chân -> SAI! Đây là lời chúc may mắn trong văn hóa Anh - Mỹ.\n- **Bẫy sai giới từ trong thành ngữ:** Thành ngữ là cụm từ CỐ ĐỊNH, không được thay thế từ (ví dụ: 'at the eleventh hour', không nói 'in the eleventh hour')."
    ],
    "examples": [
      {
        "sentence": "1. **Học thành ngữ theo nhóm chủ đề:**\n   - **Chủ đề sức khỏe:** `under the weather` (ốm), `as fit as a fiddle` (khỏe như vâm).\n   - **Chủ đề tiền bạc:** `cost an arm and a leg` (đắt đỏ), `make ends meet` (xoay xở kiếm sống).\n   - **Chủ đề học tập/công việc:** `burn the midnight oil` (thức khuya học), `call it a day` (nghỉ tay).\n2. **Mẹo ngữ cảnh:**\n   - Đọc kỹ câu trước hoặc câu sau chỗ trống để tìm từ đồng nghĩa (very easy, very expensive, agree, rarely) để suy ra thành ngữ tương ứng.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-23-1",
        "part": "PART_5",
        "questionText": "Don't worry about the final examination; as long as you revise thoroughly, it will be a piece of _____.\nA. cake\nB. candy\nC. bread\nD. cheese",
        "options": {
          "A": "cake",
          "B": "candy",
          "C": "bread",
          "D": "cheese"
        },
        "correctAnswer": "A",
        "explanation": "Thành ngữ cố định diễn tả việc gì đó cực kỳ dễ dàng là: `a piece of cake` (= very easy). Chọn A. Dù tiếng Việt hay nói 'dễ như ăn kẹo', nhưng tiếng Anh dùng 'cake' chứ không dùng 'candy'.",
        "trapNote": "Dù tiếng Việt hay nói 'dễ như ăn kẹo', nhưng tiếng Anh dùng 'cake' chứ không dùng 'candy'.",
        "translation": "Đừng lo lắng về kỳ thi cuối kỳ; miễn là bạn ôn tập cẩn thận, nó sẽ dễ như _____.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-2",
        "part": "PART_5",
        "questionText": "Before Mary went on stage for her theatrical debut, her friends shouted, \"_____ a leg!\"\nA. Break\nB. Cut\nC. Shake\nD. Bend",
        "options": {
          "A": "Break",
          "B": "Cut",
          "C": "Shake",
          "D": "Bend"
        },
        "correctAnswer": "A",
        "explanation": "Trong giới nghệ thuật sân khấu và thi cử, thành ngữ chúc ai đó may mắn thành công là: `Break a leg!` (= Good luck!). Chọn A. Không hiểu theo nghĩa đen là gãy chân.",
        "trapNote": "Không hiểu theo nghĩa đen là gãy chân.",
        "translation": "Trước khi Mary bước lên sân khấu cho buổi ra mắt kịch nghệ của mình, bạn bè cô ấy đã hét lên: \"_____ may mắn nhé!\"",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-3",
        "part": "PART_5",
        "questionText": "I feel a bit under the _____ today, so I think I will stay in bed and rest.\nA. cloud\nB. weather\nC. rain\nD. storm",
        "options": {
          "A": "cloud",
          "B": "weather",
          "C": "rain",
          "D": "storm"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ diễn tả cảm giác người hơi khó chịu, mệt mỏi, sắp bị ốm nhẹ: `under the weather` (= slightly ill/unwell). Chọn B. Thành ngữ cố định dùng 'weather', không dùng rain hay cloud.",
        "trapNote": "Thành ngữ cố định dùng 'weather', không dùng rain hay cloud.",
        "translation": "Hôm nay tôi cảm thấy hơi khó ở trong người (hơi mệt mỏi) _____, vì vậy tôi nghĩ tôi sẽ nằm nghỉ trên giường.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-4",
        "part": "PART_5",
        "questionText": "Buying that top-tier flagship smartphone really cost him an arm and a _____.\nA. finger\nB. leg\nC. foot\nD. toe",
        "options": {
          "A": "finger",
          "B": "leg",
          "C": "foot",
          "D": "toe"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ chỉ cái gì đó vô cùng đắt tiền, tốn kém: `cost an arm and a leg` (= extremely expensive). Chọn B. Cặp từ cố định của thành ngữ là 'arm and leg', không thay thế bằng các bộ phận khác.",
        "trapNote": "Cặp từ cố định của thành ngữ là 'arm and leg', không thay thế bằng các bộ phận khác.",
        "translation": "Mua chiếc điện thoại thông minh cao cấp hàng đầu đó thực sự đã ngốn của anh ấy một khoản tiền khổng lồ (vô cùng đắt đỏ).",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-5",
        "part": "PART_5",
        "questionText": "Because of his hectic work schedule, he only visits his grandparents once in a _____ moon.\nA. red\nB. blue\nC. full\nD. bright",
        "options": {
          "A": "red",
          "B": "blue",
          "C": "full",
          "D": "bright"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ chỉ tần suất cực kỳ hiếm khi xảy ra: `once in a blue moon` (= very rarely / seldom). Chọn B. Dù trăng rằm là 'full moon', nhưng thành ngữ chỉ sự hiếm hoi bắt buộc dùng 'blue moon'.",
        "trapNote": "Dù trăng rằm là 'full moon', nhưng thành ngữ chỉ sự hiếm hoi bắt buộc dùng 'blue moon'.",
        "translation": "Vì lịch làm việc bận rộn, anh ấy chỉ về thăm ông bà năm thì mười họa một lần.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-6",
        "part": "PART_5",
        "questionText": "The university entrance exam is coming up next week, so it's time to hit the _____.\nA. road\nB. books\nC. roof\nD. sack",
        "options": {
          "A": "road",
          "B": "books",
          "C": "roof",
          "D": "sack"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ bắt đầu học tập chăm chỉ, ôn luyện nghiêm túc là: `hit the books` (= start studying hard). Chọn B. Phân biệt: `hit the books` (học bài) vs `hit the sack` (đi ngủ) vs `hit the road` (lên đường).",
        "trapNote": "Phân biệt: `hit the books` (học bài) vs `hit the sack` (đi ngủ) vs `hit the road` (lên đường).",
        "translation": "Kỳ thi đại học sắp diễn ra vào tuần tới rồi, vì vậy đã đến lúc phải lao vào vùi đầu học bài.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-7",
        "part": "PART_5",
        "questionText": "To complete the medical dissertation before the deadline, she had to burn the _____ oil for weeks.\nA. midnight\nB. evening\nC. morning\nD. night",
        "options": {
          "A": "midnight",
          "B": "evening",
          "C": "morning",
          "D": "night"
        },
        "correctAnswer": "A",
        "explanation": "Thành ngữ diễn tả việc thức rất khuya để học tập hoặc làm việc cật lực: `burn the midnight oil` (bắt nguồn từ việc đốt đèn dầu thâu đêm ngày xưa). Chọn A. Dễ nhầm thành 'burn the night oil', từ đúng chuẩn là 'midnight'.",
        "trapNote": "Dễ nhầm thành 'burn the night oil', từ đúng chuẩn là 'midnight'.",
        "translation": "Để hoàn thành luận án y khoa trước hạn chót, cô ấy đã phải thức khuya miệt mài làm việc suốt nhiều tuần.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-8",
        "part": "PART_5",
        "questionText": "We have been negotiating for eight straight hours without reaching an agreement; let's call it a _____ and resume tomorrow.\nA. time\nB. day\nC. night\nD. moment",
        "options": {
          "A": "time",
          "B": "day",
          "C": "night",
          "D": "moment"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ quyết định dừng làm việc trong ngày (nghỉ tay về nhà): `call it a day` (= stop working for the day). Chọn B. Dù đàm phán đến tối muộn thì thành ngữ cố định vẫn là 'call it a day', không dùng 'call it a night'.",
        "trapNote": "Dù đàm phán đến tối muộn thì thành ngữ cố định vẫn là 'call it a day', không dùng 'call it a night'.",
        "translation": "Chúng ta đã đàm phán suốt tám tiếng liên tục mà không đạt được thỏa thuận; chúng ta hãy dừng lại hôm nay và tiếp tục vào ngày mai.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-9",
        "part": "PART_5",
        "questionText": "Although we are close business partners, we rarely see _____ to eye on marketing strategies.\nA. ear\nB. eye\nC. face\nD. hand",
        "options": {
          "A": "ear",
          "B": "eye",
          "C": "face",
          "D": "hand"
        },
        "correctAnswer": "B",
        "explanation": "Thành ngữ cố định diễn tả việc đồng ý, cùng chung góc nhìn và quan điểm với ai: `see eye to eye with sb (on sth)` (= agree with each other). Chọn B. Dễ nhầm với 'face to face' (mặt đối mặt), nhưng ở đây 'see eye to eye' mang nghĩa đồng tình.",
        "trapNote": "Dễ nhầm với 'face to face' (mặt đối mặt), nhưng ở đây 'see eye to eye' mang nghĩa đồng tình.",
        "translation": "Mặc dù chúng tôi là đối tác kinh doanh thân thiết, chúng tôi hiếm khi có cùng chung quan điểm về các chiến lược tiếp thị.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-23-10",
        "part": "PART_5",
        "questionText": "He tried to cover up the accounting fraud, but he eventually had to face the _____ when the government auditors arrived.\nA. music\nB. song\nC. sound\nD. noise",
        "options": {
          "A": "music",
          "B": "song",
          "C": "sound",
          "D": "noise"
        },
        "correctAnswer": "A",
        "explanation": "Thành ngữ diễn tả việc phải dũng cảm đối mặt và gánh chịu hình phạt, chỉ trích hoặc hậu quả khó chịu do hành vi sai trái của mình gây ra: `face the music` (= accept the unpleasant consequences of one's actions). Chọn A. Nghĩa đen là 'đối diện âm nhạc', nghĩa bóng là 'chịu trận/chấp nhận trừng phạt'.",
        "trapNote": "Nghĩa đen là 'đối diện âm nhạc', nghĩa bóng là 'chịu trận/chấp nhận trừng phạt'.",
        "translation": "Anh ta đã cố gắng che đậy vụ gian lận kế toán, nhưng cuối cùng anh ta phải chịu trận (chấp nhận hậu quả) khi các kiểm toán viên chính phủ đến.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-24",
    "code": "CD_24",
    "titleVi": "Chuyên đề 24: Cụm Từ Cố Định",
    "titleEn": "Collocations",
    "part": "Part 6 & 7",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Cụm từ cố định (Collocations) là sự kết hợp tự nhiên giữa các từ thường xuyên đi liền với nhau theo thói quen của người bản xứ. Trong bài thi THPT QG và TOEIC, các câu hỏi phân biệt giữa MAKE và DO, TAKE và PAY chiếm vị trí quyết định điểm số 8.5+.",
    "formula": "### 1. Phân biệt kinh điển: MAKE vs DO\n- **DO:** Thường dùng cho các hành động lao động chân tay, công việc hàng ngày, nhiệm vụ, hoặc hành động chung chung:\n  * `do homework / housework` (làm bài tập / việc nhà)\n  * `do business with sb` (làm ăn kinh doanh với ai)\n  * `do research / do an experiment` (nghiên cứu / làm thí nghiệm)\n  * `do harm / do good` (gây hại / mang lại lợi ích)\n  * `do someone a favor` (giúp đỡ ai một ân huệ)\n  * `do one's best` (cố gắng hết sức)\n- **MAKE:** Thường dùng cho việc sáng tạo, sản xuất ra cái mới, tác động tâm lý hoặc các quyết định:\n  * `make a decision` (ra quyết định)\n  * `make a mistake` (mắc lỗi)\n  * `make an effort / make an attempt` (nỗ lực, cố gắng)\n  * `make progress` (tiến bộ)\n  * `make a complaint` (khiếu nại)\n  * `make money / make a profit` (kiếm tiền / tạo ra lợi nhuận)\n  * `make an impression on sb` (tạo ấn tượng với ai)\n  * `make an appointment` (đặt lịch hẹn)\n\n### 2. Các Collocations với TAKE:\n- `take advantage of`: tận dụng, lợi dụng\n- `take part in`: tham gia (= participate in)\n- `take responsibility for`: chịu trách nhiệm về\n- `take into account / take into consideration`: cân nhắc, tính đến\n- `take care of`: chăm sóc\n- `take effect`: có hiệu lực (luật lệ, thuốc men)\n- `take pride in`: tự hào về (= be proud of)\n\n### 3. Các Collocations với PAY:\n- `pay attention to`: chú ý đến\n- `pay a visit to sb/somewhere`: ghé thăm ai/nơi nào\n- `pay a compliment to sb`: khen ngợi ai\n- `pay tribute to sb`: bày tỏ lòng tôn kính, tri ân\n\n### 4. Các Collocations phổ biến khác:\n- `catch a cold / catch fire`: bị cảm lạnh / bắt lửa\n- `catch sb's eye`: thu hút ánh nhìn của ai\n- `keep in touch with`: giữ liên lạc với\n- `lose one's temper`: mất bình tĩnh, nổi nóng\n- `bear/keep in mind`: ghi nhớ trong đầu\n- `come to an end`: đi đến hồi kết",
    "signalWords": [
      "- Nhìn ngay danh từ đứng SAU chỗ trống:\n  * Thấy `effort, decision, mistake, progress` -> Chọn động từ **MAKE**.\n  * Thấy `homework, business, research, favor, harm` -> Chọn động từ **DO**.\n  * Thấy `advantage, responsibility, pride, part` -> Chọn động từ **TAKE**.\n  * Thấy `attention, compliment, visit` -> Chọn động từ **PAY**."
    ],
    "traps": [
      "- **Bẫy dịch từ tiếng Việt:** Người Việt nói 'làm nghiên cứu' nên hay chọn 'make research' -> SAI! Tiếng Anh chuẩn phải là **DO research**.\n- **Bẫy Make business:** Nói 'làm ăn kinh doanh' học sinh hay chọn 'make business' -> SAI! Bắt buộc phải là **DO business**."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú Make vs Do:**\n   - *Tạo ra cái mới hoặc quyết định* -> **MAKE** (make decision, make money, make mistake).\n   - *Nhiệm vụ, nghiên cứu, việc nhà* -> **DO** (do homework, do research, do business).\n2. **Mẹo 4 'Thánh Collocations':**\n   - **Take** đi với `responsibility, advantage, part`.\n   - **Pay** đi với `attention, compliment, visit`.\n   - **Catch** đi với `cold, eye`.\n   - **Make** đi với `effort, appointment, progress`.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-24-1",
        "part": "PART_5",
        "questionText": "Students must _____ their homework diligently before coming to class.\nA. make\nB. do\nC. take\nD. give",
        "options": {
          "A": "make",
          "B": "do",
          "C": "take",
          "D": "give"
        },
        "correctAnswer": "B",
        "explanation": "Collocation cố định cơ bản: `do homework / do housework` (làm bài tập về nhà / việc nhà). Chọn B. Tuyệt đối không dùng 'make homework'.",
        "trapNote": "Tuyệt đối không dùng 'make homework'.",
        "translation": "Học sinh phải _____ bài tập về nhà một cách chăm chỉ trước khi đến lớp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-2",
        "part": "PART_5",
        "questionText": "He realized that he had _____ a serious mistake in the contract calculation.\nA. made\nB. done\nC. taken\nD. created",
        "options": {
          "A": "made",
          "B": "done",
          "C": "taken",
          "D": "created"
        },
        "correctAnswer": "A",
        "explanation": "Collocation cố định: `make a mistake` (phạm lỗi, mắc sai lầm). Ở dạng hoàn thành là 'made a mistake'. Chọn A. Người Việt hay nói 'làm sai' nên rất dễ nhầm sang 'done a mistake'.",
        "trapNote": "Người Việt hay nói 'làm sai' nên rất dễ nhầm sang 'done a mistake'.",
        "translation": "Anh ấy nhận ra rằng mình đã _____ một sai lầm nghiêm trọng trong việc tính toán hợp đồng.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-3",
        "part": "PART_5",
        "questionText": "Please _____ attention to the safety demonstrations provided by the flight attendants.\nA. give\nB. pay\nC. take\nD. make",
        "options": {
          "A": "give",
          "B": "pay",
          "C": "take",
          "D": "make"
        },
        "correctAnswer": "B",
        "explanation": "Collocation cố định vô cùng phổ biến: `pay attention to sth` (chú ý, tập trung lắng nghe cái gì). Chọn B. Dễ nhầm với 'take notice of'. Với 'attention' bắt buộc dùng động từ 'pay'.",
        "trapNote": "Dễ nhầm với 'take notice of'. Với 'attention' bắt buộc dùng động từ 'pay'.",
        "translation": "Xin vui lòng _____ sự chú ý đến các hướng dẫn an toàn được tiếp viên hàng không cung cấp.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-4",
        "part": "PART_5",
        "questionText": "The scientific team has _____ extensive research into renewable solar energy.\nA. conducted\nB. made\nC. produced\nD. fabricated",
        "options": {
          "A": "conducted",
          "B": "made",
          "C": "produced",
          "D": "fabricated"
        },
        "correctAnswer": "A",
        "explanation": "Đi với danh từ 'research' (nghiên cứu), các động từ chuẩn là: `do research` hoặc `conduct / carry out research` (tiến hành nghiên cứu). Tuyệt đối không dùng 'make research'. Do đó chọn 'conducted'. Chọn A. Bẫy dịch nghĩa 'làm nghiên cứu' chọn 'made' là mất điểm.",
        "trapNote": "Bẫy dịch nghĩa 'làm nghiên cứu' chọn 'made' là mất điểm.",
        "translation": "Đội ngũ khoa học đã _____ nghiên cứu sâu rộng về năng lượng mặt trời tái tạo.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-5",
        "part": "PART_5",
        "questionText": "You should _____ advantage of the complimentary internship to gain practical experience.\nA. take\nB. make\nC. get\nD. hold",
        "options": {
          "A": "take",
          "B": "make",
          "C": "get",
          "D": "hold"
        },
        "correctAnswer": "A",
        "explanation": "Collocation kinh điển trong đề thi: `take advantage of sth` (tận dụng, khai thác triệt để cơ hội). Chọn A. Không dùng 'make advantage of'.",
        "trapNote": "Không dùng 'make advantage of'.",
        "translation": "Bạn nên _____ lợi thế của kỳ thực tập miễn phí để tích lũy kinh nghiệm thực tế.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-6",
        "part": "PART_5",
        "questionText": "The board of directors is scheduled to _____ a final decision regarding the merger by Friday.\nA. do\nB. make\nC. take\nD. give",
        "options": {
          "A": "do",
          "B": "make",
          "C": "take",
          "D": "give"
        },
        "correctAnswer": "B",
        "explanation": "Collocation chuẩn xác: `make a decision` (đưa ra quyết định). Chọn B. Dù văn nói đôi khi dùng 'take a decision' (kiểu Anh - Anh), trong đề thi chuẩn quốc tế và THPT QG thì 'make a decision' là collocation tiêu chuẩn nhất.",
        "trapNote": "Dù văn nói đôi khi dùng 'take a decision' (kiểu Anh - Anh), trong đề thi chuẩn quốc tế và THPT QG thì 'make a decision' là collocation tiêu chuẩn nhất.",
        "translation": "Hội đồng quản trị dự kiến sẽ _____ một quyết định cuối cùng về việc sáp nhập trước thứ Sáu.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-7",
        "part": "PART_5",
        "questionText": "Our enterprise refuses to _____ business with companies that violate environmental regulations.\nA. make\nB. do\nC. take\nD. create",
        "options": {
          "A": "make",
          "B": "do",
          "C": "take",
          "D": "create"
        },
        "correctAnswer": "B",
        "explanation": "Collocation thương mại kinh điển: `do business with sb` (hợp tác làm ăn kinh doanh với ai). Tuyệt đối không dùng 'make business'. Chọn B. Bẫy người Việt nghĩ 'tạo ra việc kinh doanh' nên chọn 'make business'.",
        "trapNote": "Bẫy người Việt nghĩ 'tạo ra việc kinh doanh' nên chọn 'make business'.",
        "translation": "Doanh nghiệp của chúng tôi từ chối _____ làm ăn kinh doanh với các công ty vi phạm quy định môi trường.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-8",
        "part": "PART_5",
        "questionText": "The newly amended labor law will _____ effect starting from January 1st next year.\nA. take\nB. bring\nC. make\nD. do",
        "options": {
          "A": "take",
          "B": "bring",
          "C": "make",
          "D": "do"
        },
        "correctAnswer": "A",
        "explanation": "Collocation chuyên ngành pháp lý / hành chính: `take effect` (bắt đầu có hiệu lực, phát huy tác dụng). Động từ đi kèm là 'take'. Chọn A. Phân biệt: `take effect` (chủ động: có hiệu lực) vs `bring sth into effect` (làm cho cái gì có hiệu lực).",
        "trapNote": "Phân biệt: `take effect` (chủ động: có hiệu lực) vs `bring sth into effect` (làm cho cái gì có hiệu lực).",
        "translation": "Luật lao động mới sửa đổi sẽ _____ hiệu lực bắt đầu từ ngày 1 tháng 1 năm sau.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-9",
        "part": "PART_5",
        "questionText": "The company has made every _____ to resolve the customer complaints promptly and amicably.\nA. effort\nB. force\nC. energy\nD. trial",
        "options": {
          "A": "effort",
          "B": "force",
          "C": "energy",
          "D": "trial"
        },
        "correctAnswer": "A",
        "explanation": "Collocation nâng cao: `make every effort to V` = `make an attempt to V` (nỗ lực hết sức để làm gì). Danh từ chuẩn xác kết hợp với 'make' mang nghĩa nỗ lực là 'effort'. Chọn A. Không nói 'make every energy' hay 'make every force'.",
        "trapNote": "Không nói 'make every energy' hay 'make every force'.",
        "translation": "Công ty đã nỗ lực mọi _____ để giải quyết các khiếu nại của khách hàng một cách nhanh chóng và thân thiện.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-24-10",
        "part": "PART_5",
        "questionText": "Please _____ in mind that submission deadlines are strictly enforced by the committee.\nA. keep\nB. put\nC. hold\nD. take",
        "options": {
          "A": "keep",
          "B": "put",
          "C": "hold",
          "D": "take"
        },
        "correctAnswer": "A",
        "explanation": "Collocation cố định thông dụng trong văn phòng và học thuật: `keep in mind` (hoặc `bear in mind`) mang nghĩa là 'ghi nhớ kỹ, khắc cốt ghi tâm điều gì'. Trong 4 đáp án chỉ có 'keep'. Chọn A. Dễ nhầm với 'take into account' (nếu dùng take thì phải là take into account). Với 'in mind' thì chỉ dùng 'keep' hoặc 'bear'.",
        "trapNote": "Dễ nhầm với 'take into account' (nếu dùng take thì phải là take into account). Với 'in mind' thì chỉ dùng 'keep' hoặc 'bear'.",
        "translation": "Xin vui lòng _____ trong đầu (ghi nhớ) rằng các hạn chót nộp bài được hội đồng thực thi rất nghiêm ngặt.",
        "difficulty": "MEDIUM"
      }
    ]
  },
  {
    "id": "cd-25",
    "code": "CD_25",
    "titleVi": "Chuyên đề 25: Một Số Cấu Trúc Thông Dụng",
    "titleEn": "Common Sentence Structures",
    "part": "Part 5 & 6",
    "targetScore": "750_PLUS",
    "status": "PUBLISHED",
    "summary": "Chuyên đề Một số cấu trúc thông dụng tổng hợp các mẫu câu đặc trưng, xuất hiện liên tục trong bài tập Viết lại câu và Chọn đáp án đúng của kỳ thi THPT QG và TOEIC. Bao gồm: It takes time, Spend time, Used to vs Be used to, Would rather, Prefer... to, Too... to, Enough... to, So... that, Such... that.",
    "formula": "### 1. Cấu trúc TIÊU TỐN THỜI GIAN:\n- `It takes / took + sb + time + TO-V`: Mất của ai bao nhiêu thời gian để làm gì.\n  *Ví dụ:* It took me two hours *to finish* the assignment.\n- Biến đổi tương đương với SPEND:\n  `S + spend / spent + time + (on sth) / V-ING`\n  *Ví dụ:* I spent two hours *finishing* the assignment.\n\n### 2. Cấu trúc QUEN VỚI VIỆC GÌ (Used to):\n- **USED TO + V-bare:** Đã từng làm gì trong quá khứ (bây giờ không làm nữa - thói quen quá khứ).\n  *Ví dụ:* I *used to live* in London when I was young.\n- **BE / GET USED TO + V-ING / Noun:** Đã quen / dần quen với việc gì ở hiện tại.\n  *Ví dụ:* I *am used to getting up* early every morning.\n\n### 3. Cấu trúc THÍCH HƠN (Prefer & Would rather):\n- **PREFER:**\n  * `Prefer + V-ing + TO + V-ing`: Thích làm việc này hơn việc kia.\n    *Ví dụ:* I prefer *drinking* tea *to drinking* coffee.\n  * `Prefer + to-V + RATHER THAN + V-bare`.\n- **WOULD RATHER (1 chủ ngữ):**\n  * `S + would rather + V-bare + THAN + V-bare`: Thà làm gì hơn làm gì.\n    *Ví dụ:* I would rather *stay* home than *go* to the cinema.\n\n### 4. Cấu trúc QUÁ... ĐẾN NỖI KHÔNG THỂ (Too... to):\n- `S + be / V + TOO + Adj / Adv + (for sb) + TO-V`\n  *Ví dụ:* The coffee is *too hot for me to drink*. (Cà phê quá nóng đến mức tôi không thể uống).\n\n### 5. Cấu trúc ĐỦ... ĐỂ CÓ THỂ (Enough... to):\n- `S + be / V + Adj / Adv + ENOUGH + (for sb) + TO-V`\n- `S + have + ENOUGH + Noun + TO-V` (Tính từ đứng TRƯỚC enough, Danh từ đứng SAU enough).\n  *Ví dụ:* He is *tall enough* to reach the shelf. / I have *enough money* to buy this laptop.\n\n### 6. Cấu trúc QUÁ... ĐẾN NỖI MÀ (So... that & Such... that):\n- `S + be + SO + Adj + THAT + Clause`\n- `S + V + SO + Adv + THAT + Clause`\n- `S + V + SUCH + (a/an) + Adj + Noun + THAT + Clause`\n  *Ví dụ:* It was *such a cold day that* we stayed indoors.",
    "signalWords": [
      "- Thấy `It takes sb time...` -> Tìm ngay động từ dạng **TO-V**.\n- Thấy `spend time...` -> Tìm ngay động từ dạng **V-ING**.\n- Thấy `used to` -> Nhìn phía trước: nếu có `be/get` -> chọn **V-ing**; không có be/get -> chọn **V-bare**.\n- Thấy `prefer` -> Tìm giới từ **TO**; thấy `would rather` -> Tìm từ nối **THAN**.\n- Thấy `enough` -> Kiểm tra vị trí: Tính từ đứng TRƯỚC, Danh từ đứng SAU."
    ],
    "traps": [
      "- **Bẫy đặt sai vị trí của Enough:** Viết 'enough tall' là SAI! Bắt buộc phải là 'tall enough'.\n- **Bẫy Be used to V-bare:** Thấy chữ 'used to' là vội chọn V-bare mà không để ý phía trước có 'is/am/are'."
    ],
    "examples": [
      {
        "sentence": "1. **Thần chú vị trí ENOUGH:**\n   - *Tính đứng trước, Danh đứng sau* (`Adj + enough`, `enough + Noun`).\n2. **Thần chú Used to:**\n   - *Tay không bắt giặc (không be)* -> đi với **V-bare** (`used to V`).\n   - *Có Be, có Get làm nền* -> phải thêm đuôi **-ing** (`be used to V-ing`).\n3. **Mẹo Prefer vs Would rather:**\n   - **Prefer** đi với **TO**.\n   - **Would rather** đi với **THAN**.",
        "translation": "",
        "analysis": ""
      }
    ],
    "questions": [
      {
        "id": "q-25-1",
        "part": "PART_5",
        "questionText": "It took the technicians three hours _____ the air conditioning unit.\nA. repair\nB. to repair\nC. repairing\nD. repaired",
        "options": {
          "A": "repair",
          "B": "to repair",
          "C": "repairing",
          "D": "repaired"
        },
        "correctAnswer": "B",
        "explanation": "Công thức cố định: `It takes/took sb time + TO-V` (Mất của ai bao nhiêu thời gian để làm gì). Do đó chọn 'to repair'. Chọn B. Dễ nhầm với cấu trúc 'spend time V-ing'.",
        "trapNote": "Dễ nhầm với cấu trúc 'spend time V-ing'.",
        "translation": "Các kỹ thuật viên đã mất ba tiếng đồng hồ để _____ chiếc máy điều hòa không khí.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-2",
        "part": "PART_5",
        "questionText": "I spent the entire weekend _____ my bedroom and organizing my bookshelf.\nA. clean\nB. cleaning\nC. to clean\nD. cleaned",
        "options": {
          "A": "clean",
          "B": "cleaning",
          "C": "to clean",
          "D": "cleaned"
        },
        "correctAnswer": "B",
        "explanation": "Công thức: `S + spend + time + V-ING`. Đi cùng 'spent the weekend' là dạng V-ing 'cleaning'. Chọn B. Phân biệt rạch ròi: 'It takes to V' nhưng 'Spend time V-ing'.",
        "trapNote": "Phân biệt rạch ròi: 'It takes to V' nhưng 'Spend time V-ing'.",
        "translation": "Tôi đã dành toàn bộ kỳ nghỉ cuối tuần _____ phòng ngủ và sắp xếp lại giá sách của mình.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-3",
        "part": "PART_5",
        "questionText": "When my grandfather was young, he used to _____ ten kilometers to school every day.\nA. walk\nB. walking\nC. walked\nD. to walk",
        "options": {
          "A": "walk",
          "B": "walking",
          "C": "walked",
          "D": "to walk"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc thói quen trong quá khứ đã chấm dứt: `S + used to + V-bare`. Phía trước không có to be/get nên động từ giữ nguyên mẫu không 'to' là 'walk'. Chọn A. Không nhầm với 'be used to V-ing'.",
        "trapNote": "Không nhầm với 'be used to V-ing'.",
        "translation": "Khi ông tôi còn trẻ, ông đã từng _____ mười cây số đi bộ đến trường mỗi ngày.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-4",
        "part": "PART_5",
        "questionText": "Living in London, he is gradually getting used to _____ on the left side of the road.\nA. drive\nB. driving\nC. drove\nD. to drive",
        "options": {
          "A": "drive",
          "B": "driving",
          "C": "drove",
          "D": "to drive"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc quen với việc gì ở hiện tại: `be / get used to + V-ING`. Vì có 'getting used to' nên động từ theo sau bắt buộc là V-ing 'driving'. Chọn B. Bẫy thấy chữ 'used to' liền chọn 'drive' nguyên thể là sai lầm phổ biến.",
        "trapNote": "Bẫy thấy chữ 'used to' liền chọn 'drive' nguyên thể là sai lầm phổ biến.",
        "translation": "Sống ở Luân Đôn, anh ấy đang dần quen với việc _____ ở làn đường bên trái.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-5",
        "part": "PART_5",
        "questionText": "Most teenagers prefer watching movies online _____ going to the cinema.\nA. than\nB. to\nC. rather than\nD. instead",
        "options": {
          "A": "than",
          "B": "to",
          "C": "rather than",
          "D": "instead"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc so sánh sở thích: `prefer V-ing + TO + V-ing` (thích làm việc này hơn việc kia). Giới từ kết nối bắt buộc là 'to'. Chọn B. Bẫy chọn 'than' vì thói quen so sánh hơn trong tiếng Việt.",
        "trapNote": "Bẫy chọn 'than' vì thói quen so sánh hơn trong tiếng Việt.",
        "translation": "Hầu hết thanh thiếu niên thích xem phim trực tuyến hơn _____ đi đến rạp chiếu phim.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-6",
        "part": "PART_5",
        "questionText": "I would rather _____ at home tonight than go out in this stormy weather.\nA. stay\nB. staying\nC. to stay\nD. stayed",
        "options": {
          "A": "stay",
          "B": "staying",
          "C": "to stay",
          "D": "stayed"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc 'would rather' (cùng 1 chủ ngữ): `S + would rather + V-bare + than + V-bare`. Động từ theo sau là nguyên mẫu không to 'stay'. Chọn A. Không dùng 'to stay' hay 'staying' sau would rather.",
        "trapNote": "Không dùng 'to stay' hay 'staying' sau would rather.",
        "translation": "Tôi thà _____ ở nhà tối nay hơn là đi ra ngoài trong thời tiết bão bùng này.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-7",
        "part": "PART_5",
        "questionText": "The suitcase was _____ heavy for the frail elderly lady to lift onto the luggage rack.\nA. too\nB. so\nC. very\nD. enough",
        "options": {
          "A": "too",
          "B": "so",
          "C": "very",
          "D": "enough"
        },
        "correctAnswer": "A",
        "explanation": "Cấu trúc mang nghĩa phủ định (quá đến nỗi không thể làm gì): `S + be + TOO + Adj + (for sb) + TO-V`. Chọn 'too'. Chọn A. Nếu dùng 'so' thì phải là 'so heavy that she couldn't lift it'.",
        "trapNote": "Nếu dùng 'so' thì phải là 'so heavy that she couldn't lift it'.",
        "translation": "Chiếc vali _____ nặng đến nỗi bà cụ già yếu ớt không thể nhấc lên giá hành lý.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-8",
        "part": "PART_5",
        "questionText": "He is not _____ to qualify for the national basketball team.\nA. tall enough\nB. enough tall\nC. enough height\nD. so tall",
        "options": {
          "A": "tall enough",
          "B": "enough tall",
          "C": "enough height",
          "D": "so tall"
        },
        "correctAnswer": "A",
        "explanation": "Quy tắc vị trí của ENOUGH: Tính từ và trạng từ LUÔN ĐỨNG TRƯỚC ENOUGH (`Adj + enough + to-V`). Do đó trật tự đúng là 'tall enough'. Chọn A. Bẫy ngữ pháp siêu kinh điển: Học sinh thường ghép theo tiếng Việt 'đủ cao' thành 'enough tall'.",
        "trapNote": "Bẫy ngữ pháp siêu kinh điển: Học sinh thường ghép theo tiếng Việt 'đủ cao' thành 'enough tall'.",
        "translation": "Anh ấy không _____ để đủ tiêu chuẩn vào đội tuyển bóng rổ quốc gia.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-9",
        "part": "PART_5",
        "questionText": "It was _____ that nearly all flights departing from the airport were cancelled.\nA. so severe storm\nB. such severe storm\nC. such a severe storm\nD. a so severe storm",
        "options": {
          "A": "so severe storm",
          "B": "such severe storm",
          "C": "such a severe storm",
          "D": "a so severe storm"
        },
        "correctAnswer": "C",
        "explanation": "Cấu trúc với SUCH: `SUCH + (a/an) + Adj + Noun + THAT + Clause`. Vì 'storm' là danh từ đếm được số ít nên bắt buộc phải có mạo từ 'a' -> 'such a severe storm'. Chọn C. Loại B vì thiếu mạo từ 'a'. Nếu dùng 'so' thì phải là 'The storm was so severe that...'.",
        "trapNote": "Loại B vì thiếu mạo từ 'a'. Nếu dùng 'so' thì phải là 'The storm was so severe that...'.",
        "translation": "Đó là _____ đến nỗi gần như tất cả các chuyến bay cất cánh từ sân bay đều bị hủy.",
        "difficulty": "MEDIUM"
      },
      {
        "id": "q-25-10",
        "part": "PART_5",
        "questionText": "She would rather you _____ all the confidential files to the external auditor yesterday.\nA. didn't send\nB. hadn't sent\nC. not send\nD. wouldn't send",
        "options": {
          "A": "didn't send",
          "B": "hadn't sent",
          "C": "not send",
          "D": "wouldn't send"
        },
        "correctAnswer": "B",
        "explanation": "Cấu trúc Would rather 2 chủ ngữ ở quá khứ: `S1 + would rather that + S2 + had(n't) + V3/ed`. Vì có 'yesterday' (hành động đã xảy ra trong quá khứ) nên động từ bắt buộc lùi về Quá khứ hoàn thành 'hadn't sent'. Chọn B. Nếu không có 'yesterday' thì dùng 'didn't send'. Có 'yesterday' bắt buộc dùng 'hadn't sent'.",
        "trapNote": "Nếu không có 'yesterday' thì dùng 'didn't send'. Có 'yesterday' bắt buộc dùng 'hadn't sent'.",
        "translation": "Cô ấy thà rằng bạn _____ toàn bộ tài liệu mật cho kiểm toán viên bên ngoài vào ngày hôm qua.",
        "difficulty": "MEDIUM"
      }
    ]
  }
];
