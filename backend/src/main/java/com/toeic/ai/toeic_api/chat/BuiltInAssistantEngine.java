package com.toeic.ai.toeic_api.chat;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class BuiltInAssistantEngine {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\s]");
    private static final Pattern MULTI_SPACES = Pattern.compile("\\s+");

    public static String normalize(String text) {
        if (text == null) return "";
        // 1. Explicitly replace Vietnamese stroke letters D/d
        String s = text.replace('đ', 'd').replace('Đ', 'D');
        // 2. Decompose diacritics
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        // 3. Strip combining marks and convert to lowercase
        String clean = DIACRITICS_PATTERN.matcher(normalized).replaceAll("").toLowerCase(Locale.ROOT);
        // 4. Strip emojis and non-alphanumeric symbols to spaces
        String alphaNumOnly = NON_ALPHANUMERIC.matcher(clean).replaceAll(" ");
        // 5. Condense multiple spaces and trim
        return MULTI_SPACES.matcher(alphaNumOnly).replaceAll(" ").trim();
    }

    /**
     * Determines whether the user prompt can be handled immediately by the built-in knowledge base
     * with high confidence (< 10ms response time).
     */
    public static boolean canHandleImmediately(String prompt) {
        if (prompt == null || prompt.isBlank()) return true;
        String norm = normalize(prompt);

        return containsAny(norm,
                // Quick Starters
                "huong dan luyen nghe chep chinh ta",
                "cach luyen doc part 5",
                "huong dan thi thu full test 120 phut",
                "suc khoe", "dung thuoc",
                "luat viet vi",
                "50 30 20", "503020",
                // Chế độ sáng / tối
                "che do toi", "dark mode", "giao dien toi", "mau den", "mau trang", "che do sang", "sang toi", "chinh sang", "bat che do toi",
                // Luyện Đọc & Tra từ
                "luyen doc", "lam bai luyen doc", "lam bai doc", "reading", "part 5", "part 6", "part 7", "tra tu", "so tu", "dien tu", "doc hieu", "nhap dup", "tra tu dien", "so tay cau sai", "huong dan doc", "cach lam bai doc",
                // Luyện Nghe & Dictation
                "luyen nghe", "listening", "chep chinh ta", "dictation", "part 1", "part 2", "part 3", "part 4", "toc do nghe", "shadowing", "nuot am", "noi am", "audio",
                // Từ vựng & Game
                "tu vung", "vocab", "flashcard", "game", "tro choi", "srs", "lap lai ngat quang", "ghep the", "dua top", "so tu ca nhan", "bang xep hang",
                // Ngữ pháp & Thì động từ
                "ngu phap", "grammar", "thi dong tu", "hien tai hoan thanh", "qua khu don", "hien tai don", "tuong lai don", "menh de quan he", "cau bi dong", "cau dieu kien", "lien tu", "gioi tu", "dao ngu", "although", "despite", "because",
                // Thi thử Mock Test
                "thi thu", "mock test", "full test", "de thi", "cham diem", "wpm", "120 phut", "200 cau", "dong ho dem nguoc",
                // Gói VIP & Thanh toán
                "goi hoc", "vip", "thanh toan", "nang cap", "chuyen khoan", "vietqr", "hoc phi", "mo khoa", "qr code",
                // Tổng quan & Streak
                "tong quan", "dashboard", "streak", "muc tieu", "tien do", "chuoi ngay hoc", "bieu do", "trang chu",
                // Mẹo thi & Lộ trình
                "meo thi", "bi quyet", "chien thuoc", "tips", "kinh nghiem thi", "lo trinh", "mat goc", "nang diem", "tang diem", "500 len 750", "450", "500", "650", "750", "800", "900",
                // Sức khỏe & Thuốc
                "paracetamol", "panadol", "efferalgan", "ibuprofen", "oresol", "cam cum", "dau dau", "dau bung", "sot", "dinh duong", "vitamin", "ngu du", "met moi", "uong thuoc",
                // Phương pháp học
                "hoc tap", "tren truong", "pomodoro", "feynman", "active recall", "quan ly thoi gian", "tap trung", "tin chi", "phuong phap hoc", "dai hoc", "thi cu", "on thi",
                // Bóng đá & Thể thao
                "bong da", "the thao", "ngoai hang anh", "premier league", "champions league", "c1", "world cup", "euro", "messi", "ronaldo", "real madrid", "mu", "arsenal", "viet vi", "offside", "var",
                // Tài chính & Kinh tế
                "tai chinh", "kinh te", "tiet kiem", "lam phat", "lai suat", "quy khan cap", "dau tu", "tien te", "ngan sach", "gdp",
                // Chào hỏi & giới thiệu
                "chao", "hello", "hi", "xin chao", "hey", "ban la ai", "ten gi", "tro ly", "ai toan nang", "giup gi"
        );
    }

    public static String generateReply(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "Xin chào bạn! Mình là Trợ lý AI của Hệ thống TOEIC AI. Bạn cần hỗ trợ về tính năng học tập trên web, cách luyện thi TOEIC hay các câu hỏi kiến thức đời sống (sức khỏe, học tập, bóng đá, tài chính...)? Cứ nhắn cho mình nhé!";
        }

        String norm = normalize(prompt);

        // 1. Giao diện Sáng / Tối (Dark mode / Light mode)
        if (containsAny(norm, "che do toi", "dark mode", "giao dien toi", "mau den", "mau trang", "che do sang", "sang toi", "chinh sang", "bat che do toi")) {
            return """
                    🌓 **Hướng dẫn sử dụng Chế độ Sáng / Tối (Dark / Light Mode):**
                    
                    1. **Cách chuyển đổi tức thì:**
                       - Nhấp vào biểu tượng **Mặt trăng / Mặt trời** trên thanh điều hướng góc trên màn hình (hoặc bấm vào menu ảnh đại diện cá nhân ở góc phải).
                       - Giao diện sẽ lập tức chuyển đổi mượt mà giữa tone Trắng thanh lịch (Light) và tone Đen xanh hiện đại (Dark).
                    
                    2. **Lợi ích nổi bật:**
                       - **Chế độ Tối (Dark Mode):** Giảm mỏi mắt khi học vào ban đêm, tiết kiệm pin cho màn hình OLED.
                       - Toàn bộ thẻ bài đọc, bài nghe, khung luyện thi và khung chat AI đều được tối ưu hóa độ tương phản sắc nét, chữ sáng rõ ràng trên nền tối giúp bạn tập trung học lâu mà không mỏi mắt!
                    """;
        }

        // 2. Chức năng Luyện Nghe (Listening & Chép chính tả Dictation)
        if (containsAny(norm, "chep chinh ta", "dictation", "luyen nghe", "listening", "part 1", "part 2", "part 3", "part 4", "toc do nghe", "shadowing", "nuot am", "noi am", "audio")) {
            return """
                    🎧 **Hướng dẫn vận hành Chức năng Luyện Nghe & Chép Chính Tả (Dictation):**
                    
                    Hệ thống cung cấp trọn bộ 4 phần thi Listening chuẩn ETS cùng phương pháp luyện chép chính tả độc quyền:
                    - **Part 1 (Mô tả tranh ảnh):** Quan sát hành động nhân vật (V-ing), vị trí đồ vật và bẫy thì bị động (`being + V3`).
                    - **Part 2 (Hỏi & Đáp):** Luyện phản xạ câu hỏi Wh-questions, Yes/No, câu hỏi đuôi và bẫy câu trả lời gián tiếp.
                    - **Part 3 (Hội thoại ngắn):** Luyện nghe đoạn đối thoại 2-3 người trong môi trường công sở.
                    - **Part 4 (Bài nói ngắn):** Luyện nghe thông báo sân bay, tin nhắn thoại, bản tin giao thông.
                    
                    ✍️ **Phương pháp Luyện Nghe Chép Chính Tả (Dictation) 4 Bước:**
                    1. **Nghe lần 1:** Nghe toàn bộ câu ngắn để nắm ý tổng quát và ngữ cảnh.
                    2. **Gõ lại:** Nghe lại và gõ chính xác từng từ bạn nghe được vào ô nhập liệu.
                    3. **Bấm Kiểm tra:** Hệ thống sẽ tô **màu xanh lá** cho các từ đúng và **màu đỏ** cho các từ sai hoặc thiếu, đồng thời chỉ ra hiện tượng nuốt âm, nối âm (*linking sounds*).
                    4. **Công cụ hỗ trợ thông minh:**
                       - Nút điều chỉnh tốc độ nghe: **0.75x (chậm)**, **1.0x (chuẩn)**, **1.25x (nhanh)**.
                       - Phím tắt **Space (phím cách)** để Play/Pause và nút tua lại 5 giây.
                       - Transcript song ngữ Anh - Việt hiển thị đầy đủ giải thích từ vựng sau khi hoàn thành bài.
                    """;
        }

        // 3. Chức năng Luyện Đọc (Reading - Part 5, 6, 7) & Tra từ điển
        if (containsAny(norm, "luyen doc", "lam bai luyen doc", "lam bai doc", "reading", "part 5", "part 6", "part 7", "tra tu", "so tu", "dien tu", "doc hieu", "nhap dup", "tra tu dien", "so tay cau sai", "huong dan doc", "cach lam bai doc")) {
            return """
                    📖 **Hướng dẫn Làm Bài Luyện Đọc TOEIC (Reading Part 5, 6, 7) Chuẩn Điểm Cao:**
                    
                    Chào bạn! Để bứt phá điểm số phần Luyện Đọc (100 câu trắc nghiệm trong 75 phút), bạn hãy áp dụng chiến lược và phương pháp sau:
                    
                    ⏱️ **1. Phân bổ thời gian làm bài (Tổng 75 phút):**
                    - **Part 5 (30 câu):** Tối đa **10 – 12 phút** (trung bình 20–25 giây/câu).
                    - **Part 6 (16 câu):** Tối đa **8 – 10 phút** (khoảng 30 giây/câu).
                    - **Part 7 (54 câu):** Dành trọn **50 – 55 phút** (khoảng 50–60 giây/câu). Tuyệt đối không để Part 5-6 chiếm quá 25 phút kẻo không kịp làm Part 7.
                    
                    🎯 **2. Chiến thuật làm bài từng phần:**
                    - **Part 5 (Điền từ vào câu đơn):**
                      * *Liếc nhanh 4 đáp án trước:*
                        + Nếu 4 đáp án chung gốc từ (chỉ khác đuôi danh/động/tính/trạng) ➔ Đây là câu hỏi **ngữ pháp**. Nhìn từ đứng trước và sau chỗ trống để xác định từ loại, không cần dịch cả câu.
                        + Nếu 4 đáp án khác nghĩa hoàn toàn ➔ Đây là câu hỏi **từ vựng**. Dịch nhanh từ khóa chính xung quanh chỗ trống để chọn từ hợp ngữ cảnh.
                    - **Part 6 (Điền từ vào đoạn văn):**
                      * Đọc lướt câu trước và sau chỗ trống để nắm mạch văn.
                      * Với câu hỏi điền cả câu văn, chú ý liên từ kết nối (*However, Therefore, In addition, Consequently*) và đại từ chỉ định (*this, these, such...*).
                    - **Part 7 (Đọc hiểu đoạn đơn, đôi, ba):**
                      * **Kỹ thuật Skimming & Scanning:** Đọc câu hỏi và gạch chân từ khóa (tên riêng, thời gian, con số, sự kiện) trước khi đọc bài, sau đó quét ngược lên văn bản để định vị thông tin.
                      * **Cảnh giác Paraphrasing:** Từ khóa trong câu hỏi thường được thay thế bằng từ đồng nghĩa trong bài đọc (ví dụ: *renovate* ➔ *repair/remodel*), tránh tìm từ giống y đúc.
                    
                    🛠️ **3. Tận dụng 4 trợ thủ thông minh trên web khi luyện đọc:**
                    1. **Bộ lọc thông minh:** Bạn có thể chọn đề thi theo năm ETS (2022, 2023, 2024) hoặc theo cấp độ mục tiêu (350+, 500+, 650+, 800+).
                    2. **Tra từ điển tức thì:** Gặp từ mới trong bài đọc? Bạn chỉ cần **nhấp đúp chuột (double-click)** vào từ đó, hệ thống sẽ hiện popup nghĩa tiếng Việt, phiên âm IPA, từ loại và phát âm chuẩn.
                    3. **Lưu vào Sổ từ vựng (+):** Bấm biểu tượng dấu cộng `(+)` cạnh từ điển để thêm ngay vào Sổ từ vựng cá nhân và ôn luyện với Flashcard SRS.
                    4. **Làm lại câu sai (Mistake Notebook):** Sau khi nộp bài, bấm **Xem giải thích** để hiểu tường tận ngữ pháp, và bấm nút **Làm lại câu sai** để khắc phục ngay những câu chưa đúng!
                    
                    Chúc bạn luyện đọc thật hiệu quả và bứt phá điểm số nhé! 🚀
                    """;
        }

        // 4. Chức năng Từ Vựng & Game Center
        if (containsAny(norm, "tu vung", "vocab", "flashcard", "game", "tro choi", "srs", "lap lai ngat quang", "ghep the", "dua top", "so tu ca nhan", "bang xep hang")) {
            return """
                    🗂️ **Hướng dẫn vận hành Kho Từ Vựng & Game Center:**
                    
                    1. **Học Flashcards với thuật toán SRS (Spaced Repetition):**
                       - Thẻ từ vựng hiển thị từ vựng, phiên âm IPA, ví dụ minh họa và audio phát âm chuẩn bản xứ.
                       - Thuật toán lặp lại ngắt quãng tự động tính toán thời điểm bạn sắp quên từ để nhắc bạn ôn lại theo các chu kỳ: **1 ngày -> 3 ngày -> 7 ngày -> 30 ngày**, giúp chuyển từ vựng vào trí nhớ dài hạn.
                    
                    2. **Game Center với 5 chế độ tương tác:**
                       - **Ghép thẻ (Card Match):** Ghép cặp từ vựng tiếng Anh với nghĩa tiếng Việt tương ứng thật nhanh.
                       - **Trắc nghiệm phản xạ:** Chọn đáp án đúng trong 4 lựa chọn dưới áp lực thời gian đếm ngược.
                       - **Gõ từ nhanh (Speed Typing):** Nghe phát âm và gõ lại chính xác mặt chữ.
                       - **Điền khuyết ngữ cảnh:** Điền từ vựng phù hợp vào chỗ trống trong câu văn TOEIC thực tế.
                       - **Đua Top Bảng Xếp Hạng:** Tích lũy điểm kinh nghiệm (XP) qua từng ván game để leo hạng học viên xuất sắc toàn hệ thống.
                    
                    3. **Sổ từ cá nhân:** Tự do tạo bộ từ theo chủ đề công việc, chuyên ngành và xuất file ôn tập tiện lợi.
                    """;
        }

        // 5. Ngữ pháp & Phân biệt các thì (Grammar)
        if (containsAny(norm, "hien tai hoan thanh", "qua khu don", "hien tai don", "tuong lai don", "ngu phap", "grammar", "thi dong tu", "menh de quan he", "cau bi dong", "cau dieu kien", "lien tu", "gioi tu", "dao ngu", "although", "despite", "because")) {
            return """
                    📚 **Hướng dẫn & Phân biệt Ngữ Pháp Trọng Điểm TOEIC:**
                    
                    1. **Phân biệt Thì Hiện Tại Hoàn Thành (Present Perfect) vs. Quá Khứ Đơn (Past Simple):**
                       - **Quá khứ đơn (`S + V2/ed`):** Diễn tả hành động ĐÃ CHẤM DỨT hoàn toàn trong quá khứ tại thời điểm xác định. Dấu hiệu: `yesterday`, `ago`, `last week/month`, `in 2023`.
                       - **Hiện tại hoàn thành (`S + have/has + V3/ed`):** Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại hoặc kết quả còn ảnh hưởng ở hiện tại. Dấu hiệu: `since`, `for`, `already`, `yet`, `recently`, `just`.
                    
                    2. **Các chuyên đề then chốt khác:**
                       - **Mệnh đề quan hệ rút gọn:** Dùng `V-ing` cho câu chủ động (*The man standing there...*), dùng `V3/ed` cho câu bị động (*The goods ordered yesterday...*).
                       - **Cặp Liên từ vs. Giới từ:**
                         - `Although / Even though / Though` (+ S + V) đối chiếu với `Despite / In spite of` (+ Cụm danh từ / V-ing).
                         - `Because / Since / As` (+ S + V) đối chiếu với `Because of / Due to` (+ Cụm danh từ / V-ing).
                    
                    💡 Bạn có thể vào mục **Ngữ pháp** trên thanh điều hướng để xem lý thuyết chi tiết và làm bài tập trắc nghiệm có giải thích từng câu!
                    """;
        }

        // 6. Chức năng Thi Thử Mock Test (Full Test 120 phút)
        if (containsAny(norm, "thi thu", "mock test", "full test", "de thi", "cham diem", "wpm", "120 phut", "200 cau", "dong ho dem nguoc")) {
            return """
                    🎯 **Hướng dẫn vận hành Phòng Thi Thử (Mock Tests):**
                    
                    1. **Chuẩn format đề thi ETS quốc tế:**
                       - Mỗi đề thi gồm đúng **200 câu hỏi** (100 câu Listening - 45 phút, 100 câu Reading - 75 phút) với tổng thời gian làm bài **120 phút**.
                       - Đồng hồ đếm ngược thời gian thực, bảng điều hướng 200 câu hỏi dễ dàng chuyển câu và tính năng đánh dấu câu phân vân để xem lại trước khi nộp bài.
                    
                    2. **Chiến thuật phân bổ thời gian phòng thi:**
                       - **Listening (45 phút):** Tập trung tuyệt đối, tranh thủ đọc trước 3 câu hỏi Part 3 & 4 khi băng đọc phần hướng dẫn.
                       - **Reading (75 phút):** 
                         - Part 5 (30 câu): Giải quyết nhanh trong **10 - 12 phút** (20-25s/câu).
                         - Part 6 (16 câu): Làm trong **8 - 10 phút**.
                         - Part 7 (54 câu): Dành trọn **52 - 55 phút** để đọc kỹ đoạn đôi và đoạn ba.
                    
                    3. **Phân tích kết quả chuyên sâu sau thi với AI:**
                       - Điểm số tự động quy đổi theo thang điểm TOEIC quốc tế (10 - 990 điểm).
                       - **Đo tốc độ làm bài (WPM - Words Per Minute):** Giúp bạn biết tốc độ đọc thực tế để điều chỉnh nhịp làm bài Part 7.
                       - **Radar phân tích điểm mạnh - điểm yếu:** Chỉ rõ bạn sai nhiều ở dạng câu nào để đề xuất bài luyện tập khắc phục ngay lập tức!
                    """;
        }

        // 7. Gói học, Nâng cấp VIP & Thanh toán VietQR
        if (containsAny(norm, "goi hoc", "vip", "thanh toan", "nang cap", "chuyen khoan", "vietqr", "hoc phi", "mo khoa", "qr code")) {
            return """
                    💳 **Hướng dẫn Nâng cấp Gói VIP & Thanh toán tự động VietQR:**
                    
                    1. **Quyền lợi vượt trội của gói VIP:**
                       - Mở khóa không giới hạn toàn bộ kho đề Full Test ETS 2022 - 2024.
                       - Luyện nghe chép chính tả và tra cứu từ điển không giới hạn lượt.
                       - Không giới hạn số lượt hỏi đáp cùng Trợ lý AI và phân tích điểm yếu chuyên sâu.
                    
                    2. **Quy trình thanh toán tự động 24/7 qua VietQR:**
                       - Bấm nút **Nâng cấp** màu cam trên góc phải màn hình.
                       - Chọn gói học phù hợp (3 tháng, 6 tháng hoặc Trọn đời).
                       - Màn hình xuất hiện mã **VietQR** cùng Số tiền và Nội dung chuyển khoản chính xác.
                       - Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MBBank, Techcombank...), quét mã QR và xác nhận chuyển tiền.
                       - **Kích hoạt tức thì trong 30 giây:** Hệ thống tự động kiểm tra giao dịch và nâng cấp tài khoản của bạn ngay lập tức mà không cần chụp ảnh biên lai gửi admin!
                    """;
        }

        // 8. Tổng quan Dashboard, Streak & Mục tiêu
        if (containsAny(norm, "tong quan", "dashboard", "streak", "muc tieu", "tien do", "chuoi ngay hoc", "bieu do", "trang chu")) {
            return """
                    📊 **Hướng dẫn sử dụng Trang Tổng Quan (Dashboard):**
                    
                    - **Chuỗi học tập (Streak):** Mỗi ngày bạn hoàn thành ít nhất 1 bài học hoặc 10 câu trắc nghiệm, ngọn lửa Streak sẽ tăng lên 1 ngày. Duy trì Streak liên tục giúp xây dựng thói quen kiên trì mỗi ngày.
                    - **Mục tiêu điểm số:** Bạn có thể thiết lập mục tiêu (ví dụ 650 TOEIC trong 3 tháng). Hệ thống sẽ vẽ biểu đồ dự báo và tính toán số bài học bạn cần hoàn thành mỗi tuần.
                    - **Biểu đồ thời lượng:** Theo dõi thời gian bạn đã dành cho Nghe, Đọc, Từ vựng và Ngữ pháp trong tuần để cân bằng lộ trình học tập.
                    """;
        }

        // 9. Mẹo thi & Lộ trình bứt phá điểm số TOEIC (450, 650, 800+, nâng điểm 500 lên 750)
        if (containsAny(norm, "meo thi", "bi quyet", "chien thuoc", "tips", "kinh nghiem thi", "lo trinh", "mat goc", "nang diem", "tang diem", "500 len 750", "450", "500", "650", "750", "800", "900")) {
            return """
                    🚀 **Lộ trình Bứt Phá Điểm Số & Mẹo Làm Bài TOEIC Hiệu Quả:**
                    
                    1. **Lộ trình nâng điểm từ 500 lên 750+:**
                       - **Giai đoạn 1 (Tuần 1 - 3): Khắc phục Listening Part 3 & 4:**
                         - Chuyển từ nghe hiểu chung chung sang kỹ năng bắt từ khóa (*Keywords*) và nhận diện hiện tượng Paraphrase (từ đồng nghĩa trong câu hỏi và audio).
                         - Luyện tập phương pháp **Chép chính tả (Dictation)** 30 phút mỗi ngày trên web để triệt tiêu hiện tượng nuốt âm và nối âm.
                       - **Giai đoạn 2 (Tuần 4 - 6): Tối ưu tốc độ Reading Part 5 & 6:**
                         - Part 5 làm trong tối đa 10-12 phút (khoảng 20s/câu). Phân biệt chắc chắn từ loại (Danh/Động/Tính/Trạng) và các thì hay thi.
                       - **Giai đoạn 3 (Tuần 7 - 8): Chinh phục Reading Part 7:**
                         - Áp dụng kỹ thuật Skimming (đọc lướt tiêu đề) và Scanning (quét tìm ngày tháng, tên riêng, số tiền).
                         - Luyện làm quen với đoạn kép (Double) và đoạn ba (Triple passages).
                    
                    2. **3 Mẹo thi cực kỳ đắt giá:**
                       - **Part 2:** Loại ngay đáp án có từ phát âm giống hoặc lặp lại y nguyên từ trong câu hỏi (bẫy *same sound*).
                       - **Part 3 & 4:** Tuyệt đối đọc trước 3 câu hỏi trước khi audio phát.
                       - **Part 7:** Luôn đọc câu hỏi trước để định hướng thông tin cần tìm.
                    """;
        }

        // 10. Lĩnh vực Sức khỏe & Thuốc men khi ôn thi (Health & Medicine)
        if (containsAny(norm, "suc khoe", "thuoc", "paracetamol", "panadol", "efferalgan", "ibuprofen", "oresol", "cam cum", "dau dau", "dau bung", "sot", "dinh duong", "vitamin", "ngu du", "met moi", "uong thuoc")) {
            return """
                    🩺 **Tư vấn Kiến thức Sức khỏe & Dược phẩm An toàn:**
                    
                    1. **Thông tin về các nhóm thuốc thông dụng:**
                       - **Paracetamol (Panadol, Efferalgan):** Thuốc hạ sốt, giảm đau thông dụng nhất. Liều dùng thông thường ở người lớn là 500mg - 1000mg/lần, mỗi lần cách nhau tối thiểu 4 - 6 tiếng, không quá 3g (3000mg) mỗi ngày để tránh gây độc cho gan.
                       - **Ibuprofen:** Thuốc giảm đau, kháng viêm không steroid (NSAID), thường dùng cho đau răng, đau cơ, đau khớp, đau bụng kinh. Nên uống **sau khi ăn no** để tránh kích ứng dạ dày.
                       - **Oresol (ORS):** Bù nước và chất điện giải khi bị sốt cao, tiêu chảy hoặc vận động nhiều. Cần pha đúng tỷ lệ nước ghi trên bao bì (không pha quá đặc hoặc quá loãng).
                       - **Vitamin C & Kẽm:** Hỗ trợ tăng cường hệ miễn dịch, nên uống vào ban ngày (buổi sáng hoặc trưa sau ăn), tránh uống ban đêm vì có thể gây khó ngủ hoặc cặn sỏi thận.
                    
                    2. **Chăm sóc sức khỏe trong mùa ôn thi:**
                       - **Giấc ngủ:** Ngủ đủ 7 - 8 tiếng mỗi ngày. Não bộ xử lý và củng cố trí nhớ dài hạn vào ban đêm; thức khuya triền miên sẽ làm suy giảm trí nhớ và phản xạ đọc đề.
                       - **Dinh dưỡng & Nước uống:** Uống đủ 1.5 - 2 lít nước mỗi ngày. Bổ sung thực phẩm giàu Omega-3 (cá hồi, quả óc chó), trứng, chuối và rau xanh để não bộ hoạt động tối ưu.
                       - **Giải tỏa căng thẳng:** Thực hiện bài tập hít thở sâu 4-7-8 hoặc vận động nhẹ 15 phút giữa các ca học.
                    
                    ⚠️ **Khuyến cáo y tế an toàn:**
                    Thông tin trên mang tính chất tham khảo kiến thức khoa học. Nếu bạn có triệu chứng bệnh kéo dài hoặc cần sử dụng thuốc kê đơn / kháng sinh, hãy luôn tham khảo ý kiến trực tiếp của bác sĩ hoặc dược sĩ chuyên môn nhé!
                    """;
        }

        // 11. Học tập trên trường & Phương pháp học (School & Study methods)
        if (containsAny(norm, "hoc tap", "tren truong", "pomodoro", "feynman", "active recall", "quan ly thoi gian", "tap trung", "tin chi", "phuong phap hoc", "dai hoc", "thi cu", "on thi")) {
            return """
                    🎓 **Phương pháp Học tập Hiệu quả & Cân bằng Thi cử trên Trường:**
                    
                    1. **3 Kỹ thuật học tập đỉnh cao được khoa học chứng minh:**
                       - 🍅 **Kỹ thuật Pomodoro:** Học tập trung tối đa trong 25 phút (tắt toàn bộ thông báo điện thoại), sau đó nghỉ 5 phút. Lặp lại 4 chu kỳ rồi nghỉ dài 15-20 phút. Giúp não bộ không bị kiệt sức.
                       - 🧠 **Kỹ thuật Feynman:** Sau khi học một định lý hoặc quy tắc ngữ pháp, hãy thử diễn giải lại điều đó cho một đứa trẻ 10 tuổi hiểu bằng ngôn ngữ bình dân nhất. Nếu bạn vấp ở đâu, đó chính là lỗ hổng kiến thức cần đọc lại.
                       - 🔄 **Active Recall (Chủ động truy hồi):** Thay vì đọc lại sách thụ động, hãy gấp sách lại và tự viết ra giấy những gì mình vừa nhớ, hoặc làm bài tập trắc nghiệm ngay lập tức.
                    
                    2. **Cách cân bằng giữa việc học trên trường và luyện TOEIC:**
                       - **Nguyên tắc khung giờ cố định:** Dành một khung giờ vàng cố định trong ngày (ví dụ 20h00 - 21h30 tối) chỉ dành riêng cho việc luyện TOEIC.
                       - **Tận dụng thời gian chết:** Nghe các bài Listening Part 1, Part 2 hoặc ôn 10 từ vựng trên ứng dụng trong lúc đi xe bus, chờ đợi hoặc trước khi đi ngủ.
                       - **Ôn thi theo tín chỉ:** Lập danh sách ưu tiên theo ma trận Eisenhower (việc quan trọng & khẩn cấp làm trước), tránh nước đến chân mới nhảy.
                    """;
        }

        // 12. Bóng đá & Thể thao (Football & Sports)
        if (containsAny(norm, "bong da", "the thao", "ngoai hang anh", "premier league", "champions league", "c1", "world cup", "euro", "messi", "ronaldo", "real madrid", "mu", "arsenal", "viet vi", "offside", "var")) {
            return """
                    ⚽ **Kiến thức Bóng đá & Thể thao Đỉnh cao:**
                    
                    1. **Các giải đấu bóng đá hấp dẫn nhất hành tinh:**
                       - **Premier League (Ngoại hạng Anh):** Giải đấu khắc nghiệt và kịch tính nhất thế giới với tốc độ cao, tranh đua nghẹt thở giữa các ông lớn như Manchester City, Arsenal, Liverpool, Manchester United, Chelsea...
                       - **UEFA Champions League (Cúp C1 châu Âu):** Đấu trường danh giá nhất cấp câu lạc bộ châu Âu, nơi quy tụ những siêu sao hàng đầu và Real Madrid đang giữ kỷ lục vô địch nhiều lần nhất.
                       - **FIFA World Cup & UEFA Euro:** Những ngày hội bóng đá lớn nhất hành tinh cấp đội tuyển quốc gia.
                    
                    2. **Chiến thuật & Luật bóng đá cốt lõi:**
                       - **Luật việt vị (Offside):** Một cầu thủ bị coi là việt vị nếu ở thời điểm bóng được đồng đội chuyền tới, cầu thủ đó đứng gần đường biên ngang khung thành đối phương hơn cả quả bóng và cầu thủ phòng ngự áp chót của đối phương (thường là hậu vệ cuối cùng trước thủ môn), đồng thời tham gia trực tiếp vào tình huống bóng.
                       - **Chiến thuật Gegenpressing:** Lối chơi gây áp lực tầm cao cực mạnh ngay khi vừa mất bóng nhằm đoạt lại bóng trong vòng vài giây ở phần sân đối phương (nổi tiếng qua huấn luyện viên Jürgen Klopp).
                    
                    3. **Lợi ích của thể thao:** Rèn luyện bóng đá hoặc chạy bộ 30 phút mỗi ngày giúp tăng cường tuần hoàn máu lên não, giải phóng endorphin giúp bạn học tập hưng phấn và ghi nhớ bài tốt hơn rất nhiều!
                    """;
        }

        // 13. Lĩnh vực Ăn uống, Ẩm thực & Đói bụng (Food, Hunger & Nutrition)
        if (containsAny(norm, "doi bung", "doi qua", "doi", "an gi", "an uong", "mon an", "an sang", "an trua", "an toi", "an dem", "an vat", "am thuc", "thuc don", "dinh duong", "them an", "nau an", "an ngon", "quan an", "uong gi", "tra sua", "cafe", "ca phe")) {
            return """
                    🍲 **Gợi ý Ăn uống & Thực đơn Nạp Năng lượng:**
                    
                    Đói bụng rồi thì phải nạp năng lượng ngay để bảo vệ dạ dày và giữ cho não bộ tỉnh táo bạn nhé! Dưới đây là những gợi ý tuyệt vời tùy theo hoàn cảnh của bạn:
                    
                    🥪 **1. Cần ăn nhanh, gọn, lẹ (Không mất công chế biến):**
                    - **Bánh mì Việt Nam:** Bánh mì thịt chả, pate hoặc bánh mì ốp la kèm dưa chuột. Vừa giòn ngon, đủ đạm, lại cực kỳ tiện lợi.
                    - **Mì gói "nâng cấp":** Nấu một gói mì tôm, thả thêm 1 quả trứng chần, vài cọng hành/rau xanh hoặc lát xúc xích, vừa ấm bụng vừa đỡ cảm giác xót ruột.
                    - **Sữa chua & Chuối / Trái cây tươi:** Giải pháp nạp đường tự nhiên lành mạnh, giúp giảm đói tức thì mà không gây nặng bụng.
                    - **Bánh ngọt, bánh quy hoặc ngũ cốc yến mạch:** Pha cùng một ly sữa tươi ấm, rất tiện nếu bạn đang ngồi tại bàn học hoặc văn phòng.
                    
                    🍜 **2. Bữa ăn chính thơm ngon, no lâu (Đặt đồ ăn hoặc ra quán):**
                    - **Bún chả / Bún bò Huế / Bún riêu cua:** Nước dùng đậm đà, thơm lừng, nhiều topping thịt, chả, rau sống tươi mát.
                    - **Phở bò / Phở gà truyền thống:** Nước dùng trong thanh, ấm bụng, nhiều dưỡng chất giúp hồi phục thể lực nhanh chóng.
                    - **Cơm tấm sườn bì chả / Cơm gà xối mỡ:** Chắc bụng, no lâu cho một buổi chiều hoặc tối cần nhiều sức lực.
                    - **Bánh cuốn nóng / Mì Quảng / Hủ tiếu Nam Vang:** Dễ ăn, hương vị hài hòa, rất thích hợp đổi bữa.
                    
                    🧠 **3. Mẹo ăn uống "bổ não" cho người đang học tập & ôn thi:**
                    - **Ăn đêm khi học bài:** Nếu đói sau 22h, hãy tránh đồ chiên rán nhiều dầu mỡ vì sẽ gây khó tiêu, mất ngủ. Nên chọn 1 quả chuối chín, 1 ly sữa ấm hoặc một nắm hạt (hạnh nhân, óc chó, hạt điều).
                    - **Bổ sung nước:** Não bộ chiếm 80% là nước, khi đói hoặc mệt, hãy thử uống trước một cốc nước ấm, bạn sẽ thấy cơ thể dễ chịu hơn nhiều.
                    
                    Mau đi nạp năng lượng thơm ngon rồi tiếp tục ngày mới bạn nhé! Chúc bạn ăn thật ngon miệng! 😋✨
                    """;
        }

        // 14. Lĩnh vực Chính trị & Pháp luật (Politics & Law)
        if (containsAny(norm, "chinh tri", "phap luat", "hien phap", "quoc hoi", "chinh phu", "toa an", "nha nuoc", "quyen cong dan", "phap quyen", "asean", "lien hop quoc", "ngoai giao", "bau cu", "luat phap", "toa an nhan dan")) {
            return """
                    ⚖️ **Kiến thức Chính trị, Pháp luật & Thể chế:**
                    
                    1. **Cơ cấu tổ chức bộ máy Nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam:**
                       - **Quốc hội:** Cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất, thực hiện quyền lập hiến, quyền lập pháp và quyết định các vấn đề quan trọng của đất nước.
                       - **Chủ tịch nước:** Người đứng đầu Nhà nước, thay mặt nước Cộng hòa xã hội chủ nghĩa Việt Nam về đối nội và đối ngoại.
                       - **Chính phủ:** Cơ quan hành chính nhà nước cao nhất, thực hiện quyền hành pháp, là cơ quan chấp hành của Quốc hội (đứng đầu là Thủ tướng Chính phủ).
                       - **Tòa án nhân dân & Viện kiểm sát nhân dân:** Các cơ quan thực hiện quyền tư pháp, bảo vệ công lý, quyền con người và pháp chế xã hội chủ nghĩa.
                    
                    2. **Nguyên tắc Nhà nước Pháp quyền & Thượng tôn Pháp luật:**
                       - "Sống và làm việc theo Hiến pháp và pháp luật" là kim chỉ nam cho mọi công dân và tổ chức.
                       - Mọi công dân đều bình đẳng trước pháp luật, được bảo hộ về tính mạng, danh dự, tài sản và các quyền cơ bản.
                    
                    3. **Hội nhập Quốc tế & Đối ngoại:**
                       - Việt Nam thực hiện đường lối đối ngoại độc lập, tự chủ, hòa bình, hữu nghị, hợp tác và phát triển; là bạn, là đối tác tin cậy và là thành viên tích cực, có trách nhiệm trong cộng đồng quốc tế.
                       - Đóng vai trò nòng cốt trong Hiệp hội các quốc gia Đông Nam Á (**ASEAN**), thành viên tích cực của Liên Hợp Quốc (**UN**), APEC, WTO...
                    """;
        }

        // 15. Lĩnh vực Giáo dục, Đại học & Nghề nghiệp (Education & Careers)
        if (containsAny(norm, "giao duc", "dai hoc", "chon nganh", "nganh hoc", "hoc bong", "du hoc", "tin chi", "hoc phi", "tuyen sinh", "cao dang", "ra truong", "xin viec", "ky nang mem", "cv")) {
            return """
                    🎓 **Kiến thức Giáo dục, Định hướng Ngành học & Kỹ năng Phát triển:**
                    
                    1. **Phương pháp Định hướng Chọn ngành theo mô hình IKIGAI:**
                       - Giao thoa giữa 4 yếu tố cốt lõi:
                         + **Điều bạn đam mê yêu thích:** Bạn có hứng thú tìm tòi nó mỗi ngày không?
                         + **Điều bạn có thế mạnh (Sở trường):** Khả năng tư duy logic, ngôn ngữ hay giao tiếp xã hội?
                         + **Điều xã hội đang có nhu cầu tuyển dụng:** Xu hướng công nghệ, chuyển đổi số, thương mại quốc tế, y tế, logistics...
                         + **Điều tạo ra thu nhập tốt:** Mức lương và cơ hội thăng tiến bền vững trong 5-10 năm tới.
                    
                    2. **Bí quyết học đại học theo học chế Tín chỉ:**
                       - Đăng ký lượng tín chỉ vừa sức (15 - 18 tín chỉ/kỳ), tránh đăng ký quá tải dẫn đến rớt môn hoặc kéo tụt GPA.
                       - Đọc trước đề cương môn học (*Syllabus*) và tài liệu tham khảo trước khi lên giảng đường để chủ động đặt câu hỏi cho giảng viên.
                    
                    3. **Chiến lược săn Học bổng & Nâng cao Hồ sơ xin việc (CV):**
                       - Duy trì GPA từ 8.0/10 hoặc 3.2/4.0 trở lên.
                       - Sở hữu chứng chỉ ngoại ngữ chuẩn quốc tế (**TOEIC 750+** hoặc **IELTS 6.5+**) là tấm vé thông hành cực lớn vào các tập đoàn đa quốc gia.
                       - Tham gia câu lạc bộ, dự án thực tế hoặc nghiên cứu khoa học để tích lũy kỹ năng mềm: làm việc nhóm, tư duy phản biện và giải quyết vấn đề.
                    """;
        }

        // 16. Lĩnh vực Đời sống, Tâm lý & Giải tỏa Căng thẳng (Life, Psychology & Stress Relief)
        if (containsAny(norm, "doi song", "tam ly", "stress", "cang thang", "met moi", "mat ngu", "buon", "ap luc", "burnout", "can bang", "tram cam", "lo lang", "dong luc", "thoi quen", "atomic habits", "giac ngu")) {
            return """
                    🌿 **Chăm sóc Tinh thần, Tâm lý & Cân bằng Cuộc sống:**
                    
                    1. **5 Bước xoa dịu căng thẳng (Stress Relief) cấp tốc:**
                       - **Kỹ thuật thở sâu 4-7-8:** Hít vào bằng mũi trong 4 giây, giữ hơi trong 7 giây, và thở ra từ từ bằng miệng trong 8 giây. Thực hiện 4 chu kỳ giúp nhịp tim ổn định và xua tan âu lo tức thì.
                       - **Vận động cơ thể nhẹ:** Đứng dậy vươn vai, đi dạo 10-15 phút ngoài trời để não bộ giải phóng chất dẫn truyền thần kinh dopamine và endorphin.
                       - **Viết nhật ký xả cảm xúc (Brain Dump):** Viết tất cả những điều đang khiến bạn bận tâm ra một tờ giấy, bạn sẽ thấy tâm trí nhẹ nhõm hơn rất nhiều.
                    
                    2. **Vượt qua áp lực đồng trang lứa (Peer Pressure) & Kiệt sức (Burnout):**
                       - Đừng so sánh hành trình của mình với kết quả hào nhoáng của người khác trên mạng xã hội. Mỗi người có một múi giờ trưởng thành khác nhau.
                       - Khi quá tải, hãy cho phép bản thân nghỉ ngơi hoàn toàn một ngày (nghe nhạc nhẹ, đọc sách, ngủ đủ giấc) để tái tạo năng lượng sáng tạo.
                    
                    3. **Xây dựng Thói quen Tích cực (Atomic Habits):**
                       - Bắt đầu từ những việc siêu nhỏ (chỉ cần 2 phút mỗi ngày: đọc 2 trang sách, học 5 từ vựng mới, uống 1 ly nước khi vừa thức dậy).
                       - Tiến bộ 1% mỗi ngày sẽ giúp bạn tốt hơn gấp 37 lần sau một năm!
                    """;
        }

        // 17. Lĩnh vực Thi cử & Mẹo làm bài Tổng quát (Exams & Test Taking)
        if (containsAny(norm, "thi cu", "phong thi", "on thi", "tam ly phong thi", "thi tot nghiep", "thi thpt", "meo lam bai", "trac nghiem", "nuoc rut", "chuan bi thi", "giam run")) {
            return """
                    📝 **Bí quyết Ôn thi Hiệu quả & Mẹo Làm Bài Thi Đỉnh cao:**
                    
                    1. **Chuẩn bị vững chắc trước ngày thi:**
                       - **Đêm trước thi:** Tuyệt đối không thức thâu đêm để nhồi nhét kiến thức. Não bộ mệt mỏi sẽ làm giảm 40% khả năng tư duy và phản xạ trong phòng thi. Hãy ngủ sớm trước 23h.
                       - **Chuẩn bị đồ dùng:** Soạn sẵn CCCD/CMND, thẻ dự thi, bút chì 2B (2-3 chiếc đã chuốt sẵn), gôm tẩy mềm, đồng hồ đeo tay cơ để tự canh giờ.
                    
                    2. **Tâm lý phòng thi & Mẹo làm bài trắc nghiệm:**
                       - **Nguyên tắc "Dễ trước - Khó sau":** Lướt qua toàn bộ đề, làm ngay những câu bạn chắc chắn 100% để lấy trọn điểm và tạo đà tự tin.
                       - **Kỹ thuật loại trừ đáp án:** Với những câu phân vân, hãy tìm các đáp án quá cực đoan (chứa *always, never, completely*...) hoặc có lỗi logic để loại bỏ trước, tăng xác suất chọn đúng lên 50%.
                       - **Kiểm soát thời gian:** Luôn chừa ra 5 - 10 phút cuối giờ để kiểm tra lại phiếu trả lời, đảm bảo không tô lệch dòng và **tuyệt đối không bỏ trống bất kỳ câu nào**.
                    """;
        }

        // 18. Tài chính & Kinh tế (Finance & Economics)
        if (containsAny(norm, "tai chinh", "kinh te", "tiet kiem", "lam phat", "lai suat", "50 30 20", "503020", "quy khan cap", "dau tu", "tien te", "ngan sach", "gdp")) {
            return """
                    💰 **Kiến thức Tài chính Cá nhân & Kinh tế Học Thực tiễn:**
                    
                    1. **Quy tắc Quản lý Chi tiêu 50 / 30 / 20 cho sinh viên & người đi làm:**
                       - **50% cho Nhu cầu thiết yếu (Needs):** Tiền thuê nhà, ăn uống cơ bản, điện nước, xăng xe đi lại, học phí bắt buộc.
                       - **30% cho Mong muốn cá nhân (Wants):** Cafe bạn bè, mua sắm giải trí, xem phim, du lịch.
                       - **20% cho Tiết kiệm & Tương lai (Savings & Investment):** Quỹ khẩn cấp, tài khoản tiết kiệm, đầu tư học tập phát triển bản thân.
                    
                    2. **Các khái niệm kinh tế cốt lõi:**
                       - **Lãi suất kép (Compound Interest):** Được Albert Einstein ví như kỳ quan thứ 8 của thế giới. Lợi nhuận sinh ra từ gốc cộng dồn với lãi của các kỳ trước, giúp tài sản tăng trưởng theo cấp số nhân theo thời gian dài.
                       - **Lạm phát (Inflation):** Sự gia tăng mức giá chung của hàng hóa và dịch vụ theo thời gian, làm suy giảm sức mua của đồng tiền. Do đó, tiền để im một chỗ sẽ mất giá, cần phải có kế hoạch tiết kiệm hoặc đầu tư sinh lời.
                       - **Quỹ khẩn cấp (Emergency Fund):** Khoản tiền tương đương 3 - 6 tháng chi phí sinh hoạt tối thiểu, gửi ngân hàng kỳ hạn ngắn để sẵn sàng ứng phó khi có rủi ro như ốm đau, đổi việc.
                    """;
        }

        // 19. Chào hỏi thân thiện & Giới thiệu
        if (containsAny(norm, "chao", "hello", "hi", "xin chao", "hey", "ban la ai", "ten gi", "tro ly", "ai toan nang", "giup gi")) {
            return """
                    👋 **Xin chào bạn!**
                    
                    Mình là **Trợ lý Toàn Năng TOEIC AI**. Mình luôn sẵn sàng hỗ trợ bạn 24/7 với kho kiến thức toàn diện:
                    1. 🎯 **Hướng dẫn mọi tính năng trên web:** Luyện đọc Part 5-7, tra từ điển nhấp đúp, luyện nghe chép chính tả (Dictation), thẻ từ vựng SRS, game đua top, thi thử Full Test 120 phút, kích hoạt VIP VietQR, chế độ sáng/tối...
                    2. 📚 **Chinh phục tiếng Anh & TOEIC:** Giải thích câu hỏi ngữ pháp, từ vựng, mẹo tránh bẫy đề thi và lộ trình tăng band điểm.
                    3. 🌍 **Mọi lĩnh vực đời sống:** Ăn uống ngon miệng, sức khỏe, học tập, thi cử, kinh tế, chính trị, giáo dục, tâm lý, thể thao...
                    
                    Bạn đang quan tâm đến điều gì, hãy nhắn ngay cho mình nhé!
                    """;
        }

        // 20. Smart Contextual Synthesis for Any Custom Question
        return synthesizeCustomResponse(prompt.trim(), norm);
    }

    private static String synthesizeCustomResponse(String prompt, String norm) {
        StringBuilder sb = new StringBuilder();
        sb.append("✨ **Giải đáp Chi tiết từ Trợ lý Toàn Năng AI:**\n\n");
        sb.append("Chào bạn! Về câu hỏi / chia sẻ của bạn: *\"").append(prompt).append("\"*\n\n");

        if (containsAny(norm, "tieng anh", "english", "dich", "nghia la gi", "nghia gi", "cau nay", "tu nay")) {
            sb.append("🔍 **Phân tích Ngôn ngữ & Từ vựng:**\n");
            sb.append("- Nếu bạn cần tra nghĩa hoặc dịch câu, hãy chú ý cấu trúc ngữ cảnh của câu để xác định từ loại (Danh từ, Động từ, Tính từ hay Trạng từ).\n");
            sb.append("- Trên hệ thống TOEIC AI, bạn có thể **nhấp đúp chuột vào bất kỳ từ nào** trong bài đọc để xem nghĩa tiếng Việt, phiên âm IPA và phát âm audio chuẩn ngay lập tức!\n\n");
        } else if (containsAny(norm, "thi", "de thi", "ets", "diem", "cau hoi", "dap an", "part")) {
            sb.append("🎯 **Lời khuyên Luyện thi liên quan:**\n");
            sb.append("- Hãy chú ý phân tích kỹ câu hỏi, tìm từ khóa then chốt (*keywords*) và loại trừ các đáp án bẫy gây nhiễu.\n");
            sb.append("- Sau khi làm xong bài, đừng quên vào mục **Làm lại câu sai** để xem giải thích chi tiết từng câu và khắc phục lỗ hổng kiến thức nhé.\n\n");
        } else {
            sb.append("💡 **Gợi ý & Góc nhìn Thực tiễn:**\n");
            sb.append("- Mình luôn sẵn sàng đồng hành cùng bạn để giải đáp chi tiết ở mọi góc độ: từ kiến thức học tập, thi cử, định hướng nghề nghiệp cho đến các chủ đề đời sống, ăn uống, sức khỏe hay kinh tế - xã hội.\n");
            sb.append("- Nếu bạn cần làm rõ hoặc thảo luận sâu hơn về chủ đề này, bạn cứ tự nhiên chia sẻ thêm chi tiết (ví dụ: bối cảnh cụ thể, mục tiêu hoặc vướng mắc bạn đang gặp phải) để mình hỗ trợ bạn tường tận nhất nhé!\n\n");
        }

        sb.append("Chúc bạn luôn tràn đầy năng lượng và có những trải nghiệm học tập thật tuyệt vời! 🚀");
        return sb.toString();
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) {
                return true;
            }
        }
        return false;
    }
}
