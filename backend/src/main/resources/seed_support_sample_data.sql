-- Xoa du lieu mau cu neu co
DELETE FROM question_corrections WHERE report_id IN (SELECT id FROM support_reports WHERE ticket_code IN ('TK-RD50189', 'TK-LS10420', 'TK-UI90231', 'TK-AC40512', 'TK-RD70544'));
DELETE FROM support_reports WHERE ticket_code IN ('TK-RD50189', 'TK-LS10420', 'TK-UI90231', 'TK-AC40512', 'TK-RD70544');
DELETE FROM notifications WHERE reference_id IN ('TK-RD50189', 'TK-LS10420', 'TK-UI90231', 'TK-AC40512', 'TK-RD70544');

-- Chen 5 ticket phan hoi mau tu nhien, thuc te
INSERT INTO support_reports (id, ticket_code, reporter_id, category, title, description, source, question_ref, question_snapshot, related_content, priority, status, admin_reply, replied_at, created_at, updated_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'TK-RD50189', '56b87975-a9f1-42f9-a0f8-bfbe4f340260', 'QUESTION_ERROR', 
 'Câu 112 Part 5 hình như đáp án giải thích bị ngược giữa B và C ạ', 
 'Dạ em chào thầy cô, em đang làm bài luyện Part 5 câu 112 thì thấy hệ thống chấm đáp án B, nhưng phần lời giải chi tiết lại ghi là "C mới là đáp án đúng do có dấu hiệu since last month". Em chọn theo lời giải thì lại bị tính là sai. Thầy cô kiểm tra lại giúp em xem câu này chốt B hay C với ạ, em cảm ơn nhiều!', 
 'READING', 'RC-P5-Q112', 
 '{"part": "PART 5", "questionRef": "RC-P5-Q112", "questionText": "The factory replaced the old manufacturing equipment _______ had been causing delays in shipment.", "options": {"A": "who", "B": "whom", "C": "which", "D": "what"}, "correctAnswer": "B", "explanation": "Đang lưu đáp án B nhưng danh từ equipment là đồ vật nên phải dùng which.", "passage": null}'::jsonb, 
 'Part 5: Mệnh đề quan hệ & Đại từ', 'HIGH', 'PENDING', NULL, NULL, now() - INTERVAL '35 minutes', now() - INTERVAL '35 minutes'),

('22222222-2222-2222-2222-222222222222', 'TK-LS10420', '56b87975-a9f1-42f9-a0f8-bfbe4f340260', 'SYSTEM_BUG', 
 'Audio câu 3 Part 1 bị rè và ngắt đoạn ở giây thứ 8', 
 'Chào admin, em bật nghe câu số 3 bài nghe Part 1 trên máy tính thì đến giây thứ 8 là bị rè rè rồi đứng tiếng khoảng 2 giây, chỉ nghe được nửa câu đầu của phương án C và D. Em có thử đổi sang mạng 4G với cắm tai nghe khác rồi nhưng vẫn bị. Admin kiểm tra lại file audio giúp em với nhé!', 
 'LISTENING', 'LC-P1-Q003', 
 '{"part": "PART 1", "questionRef": "LC-P1-Q003", "questionText": "Look at the picture marked No. 3 in your test book.", "options": {"A": "She is typing on a computer.", "B": "She is organizing folders on the shelf.", "C": "She is presenting a report in the boardroom.", "D": "She is making a phone call."}, "correctAnswer": "A", "transcript": "(A) She is typing on a computer. (B) She is organizing folders on the shelf. (C) She is presenting a report. (D) She is making a phone call.", "audioUrl": "/api/media/audio/sample_p1_q3.mp3"}'::jsonb, 
 'Part 1: Hình ảnh nơi làm việc (Office Scenes)', 'URGENT', 'PENDING', NULL, NULL, now() - INTERVAL '20 minutes', now() - INTERVAL '20 minutes'),

('33333333-3333-3333-3333-333333333333', 'TK-UI90231', '56b87975-a9f1-42f9-a0f8-bfbe4f340260', 'UI_FEEDBACK', 
 'Góp ý ghim đồng hồ đếm ngược cố định ở góc trên khi làm bài trên điện thoại', 
 'Chào ban quản trị, em hay tranh thủ làm đề thi thử trên điện thoại lúc rảnh. Khi cuộn màn hình xuống đọc đoạn văn dài ở Part 7 thì thanh đồng hồ thời gian bị trôi mất tiêu, em không biết mình còn bao nhiêu phút để căn giờ câu tiếp theo. Em góp ý là web nên ghim thanh thời gian nhỏ cố định ở mép trên khi cuộn trang ạ. Như vậy tụi em dễ căn nhịp làm bài hơn.', 
 'MOCK_TEST', NULL, NULL, 
 'Giao diện phòng thi thử TOEIC ETS Full Test', 'MEDIUM', 'IN_PROGRESS', 
 'Chào bạn Phi, cảm ơn bạn rất nhiều vì góp ý cực kỳ thực tế này nhé! Đội ngũ phát triển đã ghi nhận và đang bổ sung thanh Sticky Header hiển thị thời gian rút gọn khi cuộn trang trên mobile. Tính năng này sẽ có mặt trong bản cập nhật tuần này bạn nhé.', 
 now() - INTERVAL '1 hour', now() - INTERVAL '2 hours', now() - INTERVAL '1 hour'),

('44444444-4444-4444-4444-444444444444', 'TK-AC40512', '56b87975-a9f1-42f9-a0f8-bfbe4f340260', 'ACCOUNT_ISSUE', 
 'Em vừa quét QR chuyển khoản gói VIP 30 ngày, nhờ admin kích hoạt giúp em', 
 'Dạ em vừa chuyển khoản 99.000đ qua mã VietQR lúc 09:02 sáng nay, nội dung chuyển khoản là "TOEIC VIP 6451071059". Bên ngân hàng báo trừ tiền rồi nhưng tài khoản web của em vẫn hiện gói Free. Em có gửi kèm mã giao dịch MBBank trong thông tin. Nhờ admin kiểm tra kích hoạt sớm giúp em để kịp vào luyện đề sáng nay ạ!', 
 'OTHER', NULL, NULL, 
 'Gói học viên VIP TOEIC 30 ngày (Giao dịch SePay)', 'LOW', 'RESOLVED', 
 'Chào bạn, hệ thống đã đối soát thành công giao dịch ngân hàng của bạn (do lúc 9h phía ngân hàng xử lý chậm 2 phút nên webhook kích hoạt bị trễ một chút). Tài khoản của bạn đã được nâng cấp lên gói VIP thành công với đầy đủ quyền lợi luyện thi không giới hạn. Chúc bạn ôn luyện đạt target điểm số mong muốn nhé!', 
 now() - INTERVAL '30 minutes', now() - INTERVAL '3 hours', now() - INTERVAL '30 minutes'),

('55555555-5555-5555-5555-555555555555', 'TK-RD70544', '56b87975-a9f1-42f9-a0f8-bfbe4f340260', 'QUESTION_ERROR', 
 'Đoạn văn Part 7 bị thiếu dòng ngày tháng trên hóa đơn Invoice', 
 'Em chào ban biên tập, ở bài đọc kép câu 181-185, câu 182 hỏi về "Ngày thanh toán ghi trên hóa đơn" nhưng trong hình ảnh đoạn văn thứ 2 em chỉ thấy mã đơn hàng chứ bị mất dòng Date ở góc phải. Em phải đoán mò mới qua câu. Nhờ thầy cô cập nhật lại hình ảnh gốc rõ nét giúp chúng em với ạ.', 
 'READING', 'RC-P7-PASSAGE-04', 
 '{"part": "PART 7", "questionRef": "RC-P7-PASSAGE-04", "passage": "To: All Staff\nFrom: HR Department\nDate: October 15\nSubject: Annual Workshop\nPlease note that our annual seminar will take place in Conference Room B.", "questionText": "When is the seminar scheduled to take place?", "options": {"A": "On October 15", "B": "On November 20", "C": "On December 01", "D": "Next Monday"}, "correctAnswer": "A", "explanation": "Đoạn văn gốc bổ sung đầy đủ dòng Date: October 15."}'::jsonb, 
 'Part 7: Đề ETS 2024 Test 3 - Đoạn văn kép Email & Invoice', 'HIGH', 'RESOLVED', 
 'Chào bạn Phi, thầy cô bên tổ chuyên môn Reading đã kiểm tra và thấy ảnh scan cũ bị crop mất phần header góc phải. Thầy cô đã thay thế bằng ảnh scan chất lượng cao có đầy đủ thông tin Invoice Date rồi nhé. Cảm ơn tinh thần học tập rất cẩn thận của em!', 
 now() - INTERVAL '2 hours', now() - INTERVAL '5 hours', now() - INTERVAL '2 hours');
