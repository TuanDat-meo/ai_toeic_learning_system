package com.toeic.ai.toeic_api.chat;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class BuiltInAssistantEngine {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public static String normalize(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return DIACRITICS_PATTERN.matcher(normalized).replaceAll("").toLowerCase(Locale.ROOT).trim();
    }

    public static String generateReply(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "Xin chào bạn! Mình là Trợ lý AI của Hệ thống TOEIC AI. Bạn cần hỗ trợ về tính năng học tập trên web, cách luyện thi TOEIC hay các câu hỏi kiến thức đời sống (sức khỏe, học tập, bóng đá, tài chính...)? Cứ nhắn cho mình nhé!";
        }

        String norm = normalize(prompt);

        // 1. Giao diện Sáng / Tối (Dark mode / Light mode)
        if (containsAny(norm, "che do toi", "dark mode", "giao dien toi", "mau den", "mau trang", "che do sang", "sang toi", "chinh sang")) {
            return """
                    🌓 **Hướng dẫn sử dụng Chế độ Sáng / Tối (Dark / Light Mode):**
                    
                    1. **Cách chuyển đổi:**
                       - Nhấp vào biểu tượng **Mặt trăng / Mặt trời** trên thanh điều hướng góc trên màn hình (hoặc trong menu tài khoản cá nhân).
                       - Giao diện sẽ lập tức chuyển đổi mượt mà giữa tone Trắng thanh lịch (Light) và tone Đen xanh hiện đại (Dark).
                    
                    2. **Lợi ích:**
                       - **Chế độ Tối (Dark Mode):** Giảm mỏi mắt khi học vào ban đêm hoặc trong phòng tối, tiết kiệm pin cho màn hình OLED.
                       - Tất cả thẻ bài học, đề thi thử, từ vựng và khung chat đều được tinh chỉnh độ tương phản sắc nét, chữ sáng rõ ràng giúp bạn dễ đọc nhất!
                    """;
        }

        // 2. Chức năng Luyện Đọc (Reading - Part 5, 6, 7)
        if (containsAny(norm, "luyen doc", "reading", "part 5", "part 6", "part 7", "tra tu", "so tu", "dien tu", "doc hieu")) {
            return """
                    📖 **Hướng dẫn vận hành Chức năng Luyện Đọc (Reading):**
                    
                    Phân hệ Luyện Đọc được thiết kế chuẩn cấu trúc ETS với 3 phần trọng tâm:
                    - **Part 5 (Điền từ vào câu):** 30 câu hỏi trắc nghiệm ngữ pháp và từ vựng thông dụng trong môi trường công sở.
                    - **Part 6 (Điền từ vào đoạn văn):** 16 câu hỏi rèn luyện kỹ năng liên kết câu và nắm bắt ngữ cảnh.
                    - **Part 7 (Đọc hiểu văn bản):** 54 câu hỏi bao gồm đoạn đơn, đoạn đôi và đoạn ba (Email, thông báo, bài báo, hóa đơn).
                    
                    🎯 **Các tính năng thông minh khi luyện đọc:**
                    1. **Bộ lọc thông minh:** Bạn có thể lọc đề theo năm ETS (2022, 2023, 2024) hoặc theo cấp độ mục tiêu (Cơ bản 350+, Trung cấp 500+, Nâng cao 650+, Chuyên gia 800+).
                    2. **Tra từ điển tức thì:** Đang đọc bài mà gặp từ mới? Hãy **nhấp đúp chuột** vào từ đó, hệ thống sẽ hiển thị nghĩa tiếng Việt, phiên âm IPA, từ loại và phát âm chuẩn.
                    3. **Lưu vào Sổ từ vựng:** Bấm biểu tượng dấu cộng `(+)` cạnh từ điển để đưa ngay từ mới vào sổ tay ôn tập SRS.
                    4. **Làm lại câu sai:** Sau khi nộp bài, hệ thống hiển thị giải thích chi tiết từng câu. Bạn có thể bấm biểu tượng xoay vòng để làm lại ngay các câu làm sai để ghi nhớ sâu!
                    """;
        }

        // 3. Chức năng Luyện Nghe (Listening & Chép chính tả Dictation)
        if (containsAny(norm, "luyen nghe", "listening", "chep chinh ta", "dictation", "part 1", "part 2", "part 3", "part 4", "toc do nghe")) {
            return """
                    🎧 **Hướng dẫn vận hành Chức năng Luyện Nghe (Listening & Dictation):**
                    
                    Hệ thống cung cấp đầy đủ 4 phần thi Listening cùng phương pháp luyện chép chính tả độc quyền:
                    - **Part 1 (Mô tả tranh ảnh):** Rèn luyện quan sát hành động nhân vật và vị trí đồ vật.
                    - **Part 2 (Hỏi & Đáp):** Luyện phản xạ câu hỏi Wh-questions, Yes/No và câu trả lời gián tiếp.
                    - **Part 3 (Hội thoại ngắn):** Luyện nghe đoạn đối thoại 2-3 người trong công việc.
                    - **Part 4 (Bài nói ngắn):** Nghe thông báo sân bay, tin nhắn thoại, bản tin thời tiết.
                    
                    ✍️ **Phương pháp Luyện Nghe Chép Chính Tả (Dictation):**
                    1. Chọn bài nghe theo chủ đề. Bấm nghe từng câu ngắn được cắt tự động.
                    2. Gõ lại chính xác những gì bạn nghe được vào ô nhập liệu.
                    3. Bấm **Kiểm tra**: Hệ thống sẽ tô màu xanh các từ đúng và đỏ các từ thiếu/sai, chỉ ra hiện tượng nuốt âm, nối âm (linking sounds).
                    4. **Điều chỉnh linh hoạt:** Có nút tăng giảm tốc độ (0.75x, 1.0x, 1.25x), phím cách (Space) để Play/Pause và nút nghe lại từng câu 5 giây.
                    5. Có sẵn **Transcript song ngữ Anh - Việt** để bạn đối chiếu sau khi hoàn thành.
                    """;
        }

        // 4. Chức năng Từ Vựng & Game Center
        if (containsAny(norm, "tu vung", "vocab", "flashcard", "game", "tro choi", "srs", "lap lai ngat quang", "ghep the", "dua top")) {
            return """
                    🗂️ **Hướng dẫn vận hành Kho Từ Vựng & Game Center:**
                    
                    1. **Học Flashcards với thuật toán SRS (Spaced Repetition):**
                       - Thẻ từ vựng hiển thị từ vựng, phiên âm IPA, ví dụ minh họa và phát âm audio chuẩn bản xứ.
                       - Thuật toán lặp lại ngắt quãng tự động tính toán thời gian bạn sắp quên một từ để nhắc bạn ôn lại (1 ngày, 3 ngày, 7 ngày, 30 ngày), giúp chuyển từ vựng vào trí nhớ dài hạn.
                    
                    2. **Game Center 5 chế độ tương tác:**
                       - **Ghép thẻ (Card Match):** Ghép cặp từ vựng tiếng Anh với nghĩa tiếng Việt tương ứng thật nhanh.
                       - **Trắc nghiệm phản xạ:** Chọn đáp án đúng trong 4 lựa chọn dưới áp lực thời gian.
                       - **Gõ từ nhanh (Speed Typing):** Nghe phát âm và gõ chính xác mặt chữ.
                       - **Điền khuyết ngữ cảnh:** Điền từ vựng phù hợp vào câu văn TOEIC thực tế.
                       - **Đua Top Bảng Xếp Hạng:** Tích lũy điểm kinh nghiệm (XP) qua từng ván game để leo hạng học viên xuất sắc toàn hệ thống.
                    
                    3. **Sổ từ cá nhân:** Tự do tạo bộ từ riêng theo chủ đề công việc, xuất khẩu file ôn tập tiện lợi.
                    """;
        }

        // 5. Chức năng Ngữ Pháp (Grammar)
        if (containsAny(norm, "ngu phap", "grammar", "thi dong tu", "menh de", "cau bi dong", "cau dieu kien", "lien tu", "gioi tu")) {
            return """
                    📚 **Hướng dẫn vận hành Chuyên đề Ngữ Pháp (Grammar):**
                    
                    Hệ thống tích hợp trọn bộ hơn 20 chuyên đề ngữ pháp TOEIC then chốt:
                    - **Các thì quan trọng:** Hiện tại đơn, Hiện tại tiếp diễn, Hiện tại hoàn thành, Quá khứ đơn, Tương lai đơn...
                    - **Cấu trúc câu nâng cao:** Mệnh đề quan hệ (Relative Clauses), Rút gọn mệnh đề, Câu bị động (Passive Voice), Câu điều kiện (If clauses), Thể giả định (Subjunctive).
                    - **Từ loại & Cụm từ:** Danh từ đếm được/không đếm được, Tính từ & Trạng từ, V-ing & To-V, Giới từ chỉ nơi chốn/thời gian, Liên từ tương quan (Either...or, Neither...nor, Not only...but also).
                    
                    💡 **Cách học hiệu quả:**
                    - Đọc phần **Lý thuyết tóm tắt** với sơ đồ bảng biểu trực quan.
                    - Bấm sang tab **Bài tập vận dụng**: Làm các câu hỏi trích từ đề thi thật có giải thích ngữ pháp chi tiết từng bước.
                    """;
        }

        // 6. Chức năng Thi Thử Mock Test (Full Test 120 phút)
        if (containsAny(norm, "thi thu", "mock test", "full test", "de thi", "cham diem", "wpm", "120 phut", "200 cau")) {
            return """
                    🎯 **Hướng dẫn vận hành Phòng Thi Thử (Mock Tests):**
                    
                    1. **Chuẩn format đề thi ETS:**
                       - Mỗi đề thi gồm đúng 200 câu hỏi (100 câu Listening - 45 phút, 100 câu Reading - 75 phút) với tổng thời gian làm bài 120 phút.
                       - Có đồng hồ đếm ngược thời gian thực, bảng điều hướng 200 câu hỏi dễ dàng chuyển câu và đánh dấu câu phân vân để xem lại.
                    
                    2. **Phân tích kết quả sau thi với AI:**
                       - Điểm số tự động quy đổi theo thang điểm TOEIC quốc tế (10 - 990 điểm).
                       - **Đo tốc độ làm bài (WPM - Words Per Minute):** Giúp bạn biết mình đọc nhanh hay chậm ở Part 7.
                       - **Radar phân tích điểm mạnh - điểm yếu:** Chỉ rõ bạn sai nhiều ở dạng câu hỏi nào (chi tiết, suy luận, từ vựng hay ngữ pháp) để đề xuất bài luyện tập khắc phục ngay lập tức!
                    """;
        }

        // 7. Gói học, Nâng cấp VIP & Thanh toán VietQR
        if (containsAny(norm, "goi hoc", "vip", "thanh toan", "nang cap", "chuyen khoan", "vietqr", "hoc phi", "mo khoa")) {
            return """
                    💳 **Hướng dẫn Nâng cấp Gói VIP & Thanh toán tự động VietQR:**
                    
                    1. **Quyền lợi gói VIP:**
                       - Mở khóa không giới hạn toàn bộ kho đề Full Test ETS 2022 - 2024.
                       - Luyện nghe chép chính tả và tra cứu từ điển không giới hạn.
                       - Không giới hạn số lượt hỏi đáp cùng Trợ lý AI và phân tích điểm yếu chuyên sâu.
                    
                    2. **Quy trình thanh toán tự động 24/7:**
                       - Bấm nút **Nâng cấp** màu cam trên góc phải màn hình.
                       - Chọn gói học phù hợp (3 tháng, 6 tháng hoặc Trọn đời).
                       - Màn hình xuất hiện mã **VietQR** cùng Số tiền và Nội dung chuyển khoản chính xác.
                       - Bạn mở ứng dụng ngân hàng bất kỳ (Vietcombank, MBBank, Techcombank...), quét mã QR và xác nhận chuyển tiền.
                       - **Kích hoạt tức thì:** Hệ thống tự động kiểm tra giao dịch và nâng cấp tài khoản của bạn ngay trong 30 giây mà không cần chụp ảnh biên lai gửi admin!
                    """;
        }

        // 8. Tổng quan Dashboard, Streak & Mục tiêu
        if (containsAny(norm, "tong quan", "dashboard", "streak", "muc tieu", "tien do", "trang chu")) {
            return """
                    📊 **Hướng dẫn sử dụng Trang Tổng Quan (Dashboard):**
                    
                    - **Chuỗi học tập (Streak):** Mỗi ngày bạn hoàn thành ít nhất 1 bài học hoặc 10 câu trắc nghiệm, ngọn lửa Streak sẽ tăng lên 1 ngày. Duy trì Streak liên tục giúp xây dựng thói quen kiên trì.
                    - **Mục tiêu điểm số:** Bạn có thể thiết lập mục tiêu (ví dụ 650 TOEIC trong 3 tháng). Hệ thống sẽ vẽ biểu đồ dự báo và tính toán số bài học bạn cần hoàn thành mỗi tuần.
                    - **Biểu đồ thời lượng:** Theo dõi thời gian bạn đã dành cho Nghe, Đọc, Từ vựng và Ngữ pháp trong tuần để cân bằng lộ trình học tập.
                    """;
        }

        // 9. Cách vận hành tổng quát hệ thống
        if (containsAny(norm, "van hanh", "huong dan", "chuc nang", "cach dung", "he thong", "lam sao de hoc", "bat dau tu dau")) {
            return """
                    🌟 **Tổng quan Vận hành Hệ thống Học & Luyện Thi TOEIC AI:**
                    
                    Hệ thống được xây dựng toàn diện với 6 trụ cột chính giúp bạn bứt phá band điểm:
                    1. 🎧 **Nghe (Listening):** Luyện 4 Parts chuẩn ETS + Tính năng Luyện nghe chép chính tả (Dictation) có chỉnh tốc độ & transcript song ngữ.
                    2. 📖 **Đọc (Reading):** Luyện Part 5, 6, 7 với bộ lọc thông minh, tính năng nhấp đúp tra từ điển tức thì và làm lại câu sai.
                    3. 🗂️ **Từ vựng (Vocabulary):** Học thẻ Flashcard thuật toán lặp lại ngắt quãng SRS + Game Center 5 chế độ đua top.
                    4. 📚 **Ngữ pháp (Grammar):** Tổng hợp 20+ chuyên đề trọng điểm kèm bài tập thực hành sát đề thi.
                    5. 🎯 **Thi thử (Mock Tests):** Đề thi Full Test 200 câu 120 phút, tự động bấm giờ, chấm điểm và phân tích WPM tốc độ làm bài.
                    6. ✨ **Trợ lý AI (Chính là mình!):** Luôn đồng hành 24/7 để giải đáp thắc mắc, hướng dẫn thao tác trên web và trả lời mọi câu hỏi kiến thức!
                    
                    👉 Bạn muốn mình hướng dẫn chi tiết mục nào ở trên, cứ nhắn cho mình nhé!
                    """;
        }

        // 10. Lĩnh vực Sức khỏe & Thuốc men (Health & Medicine)
        if (containsAny(norm, "suc khoe", "thuoc", "benh", "paracetamol", "panadol", "ibuprofen", "uong thuoc", "cam cum", "dau dau", "dau bung", "sot", "ho", "dinh duong", "met moi", "vitamin", "khang sinh", "ngu")) {
            return """
                    🩺 **Tư vấn Kiến thức Sức khỏe & Dược phẩm:**
                    
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
        if (containsAny(norm, "hoc tap", "tren truong", "dai hoc", "thi cu", "on thi", "phuong phap hoc", "pomodoro", "feynman", "quan ly thoi gian", "tap trung", "luoi", "mat tap trung", "tin chi", "bai tap")) {
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
        if (containsAny(norm, "bong da", "the thao", "ngoai hang anh", "premier league", "champions league", "c1", "world cup", "euro", "messi", "ronaldo", "real madrid", "manchester", "mu", "arsenal", "chelsea", "barca", "viet vi", "cau thu", "ban thang")) {
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

        // 13. Tài chính & Kinh tế (Finance & Economics)
        if (containsAny(norm, "tai chinh", "kinh te", "tien te", "dau tu", "tiet kiem", "lam phat", "lai suat", "chung khoan", "co phieu", "50/30/20", "ngan sach", "gdp")) {
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

        // 14. Chào hỏi thân thiện
        if (containsAny(norm, "chao", "hello", "hi", "xin chao", "hey", "ban la ai", "ten gi")) {
            return """
                    👋 **Xin chào bạn!**
                    
                    Mình là **Trợ lý Toàn Năng TOEIC AI**. Mình có thể hỗ trợ bạn mọi điều:
                    1. 🎯 **Hướng dẫn mọi chức năng trên web:** Luyện đọc Part 5-7, tra từ điển, luyện nghe chép chính tả (Dictation), thẻ từ vựng SRS, game đua top, thi thử Full Test 120 phút, kích hoạt VIP VietQR, chế độ sáng/tối...
                    2. 📚 **Giải đáp kiến thức TOEIC:** Giải thích câu hỏi ngữ pháp, từ vựng, mẹo tránh bẫy đề thi.
                    3. 🌍 **Kiến thức tổng hợp ngoài đời sống:** Sức khỏe, thuốc men an toàn, phương pháp học tập trên trường, bóng đá & thể thao, tài chính cá nhân, kinh tế...
                    
                    Bạn đang quan tâm đến điều gì, hãy nhắn ngay cho mình nhé!
                    """;
        }

        // 15. Default intelligent comprehensive answer
        return """
                Xin chào bạn! Mình đã nhận được câu hỏi:
                > *"%s"*
                
                Dưới đây là câu trả lời và hướng dẫn chi tiết dành cho bạn:
                
                - **Về hệ thống học TOEIC AI:** Bạn có thể dễ dàng truy cập các mục trên thanh điều hướng để luyện tập: **Đọc (Reading Part 5-7)**, **Nghe (Listening & Chép chính tả)**, **Từ vựng (Flashcard & Game)**, **Ngữ pháp**, hoặc vào **Thi thử** để làm bài test 120 phút chuẩn ETS có phân tích WPM.
                - **Về các câu hỏi kiến thức đời sống (Sức khỏe, học tập, bóng đá, tài chính, công việc):** Mình luôn sẵn sàng giải thích chi tiết, chính xác từng câu hỏi cụ thể của bạn.
                
                👉 Bạn có thể chia sẻ cụ thể hơn câu hỏi hoặc bài tập bạn đang quan tâm để mình giải đáp từng bước chính xác nhất nhé!
                """.formatted(prompt.trim());
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
