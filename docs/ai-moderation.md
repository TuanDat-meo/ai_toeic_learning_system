# Kiểm duyệt nội dung AI

## User story và phạm vi

**Là quản trị viên**, tôi muốn xem xét nội dung do AI tạo đang chờ duyệt, chấp nhận nội dung đạt yêu cầu hoặc từ chối nội dung không phù hợp, đồng thời xem lại các quyết định trước đó.

Trong phạm vi:

- Danh sách nội dung AI theo trạng thái chờ duyệt, đã duyệt, đã từ chối hoặc tất cả.
- Xem payload JSON cùng loại nội dung, loại tương tác AI, model và thời điểm tạo.
- ADMIN xác nhận trước khi duyệt hoặc từ chối; mỗi mục chỉ được quyết định một lần.
- Lưu quyết định/người duyệt/thời điểm, xử lý cạnh tranh bằng cập nhật nguyên tử và ghi audit không chứa payload.

Ngoài phạm vi: gọi model để tự đánh giá nội dung, sửa payload, lý do từ chối, hoàn tác quyết định, publish nội dung ra kho học tập và producer sinh nội dung AI. Hiện backend chưa có dịch vụ sinh AI ghi vào `ai_generated_content`; queue sẽ rỗng cho tới khi một producer tích hợp vào bảng hiện hữu.

## Quyền truy cập

- Chỉ `ADMIN` được gọi API `/api/admin/ai-review/**`; backend bảo vệ route bằng Spring Security.
- Thay đổi dùng session và CSRF token theo client hiện hữu.
- Mọi quyết định thành công ghi audit `APPROVE_AI_CONTENT` hoặc `REJECT_AI_CONTENT`; audit chỉ lưu thông tin hành động, không ghi prompt hay payload.
- `TEACHER`, `STUDENT` và khách không có quyền đọc hay quyết định.

## Data model và trạng thái

Dùng bảng `ai_generated_content` và liên kết tới `ai_interactions` tạo bởi migration `V14__create_ai.sql`.

| `validation_status` trong DB | Trạng thái API/UI | Ý nghĩa |
| --- | --- | --- |
| `PENDING` | `PENDING` | Chưa có quyết định; được đưa vào queue chờ duyệt |
| `PASSED` | `APPROVED` | ADMIN đã duyệt |
| `REJECTED` | `REJECTED` | ADMIN đã từ chối |

`reviewed_by`, `reviewed_at` lưu người và thời điểm quyết định. Migration `V38__index_ai_generated_content_review_queue.sql` thêm partial index cho queue đang chờ.

## API contract

- `GET /api/admin/ai-review?status=PENDING&limit=50` — trả `{ items, counts }`; status nhận `PENDING`, `APPROVED`, `REJECTED`, `ALL`, limit được chặn trong khoảng 1–100. Counts là số lượng toàn queue, không phụ thuộc filter/limit.
- `POST /api/admin/ai-review/{id}/approve` — chuyển `PENDING` thành `PASSED`.
- `POST /api/admin/ai-review/{id}/reject` — chuyển `PENDING` thành `REJECTED`.
- Quyết định chỉ cập nhật nếu trạng thái hiện còn `PENDING`; nội dung không tồn tại trả `404`, quyết định đồng thời/đã xử lý trả `409`.
- Payload phản hồi chỉ chứa nội dung AI và metadata cần cho duyệt; không trả prompt tương tác.

## UI states và acceptance criteria

1. Trang mở queue `PENDING`, hiển thị số lượng chờ/đã duyệt/từ chối từ API; không dùng số liệu mock.
2. Admin xem payload JSON, loại nội dung, model và thời điểm tạo; có tab lọc theo trạng thái.
3. Đang tải có loading state; queue rỗng có empty state; lỗi tải có thông báo và nút thử lại.
4. Duyệt/từ chối yêu cầu xác nhận; lỗi mutation được hiển thị và item không bị xóa khỏi trạng thái hiện tại như thể thành công.
5. Quyết định thành công biến mất khỏi queue chờ, xuất hiện ở bộ lọc trạng thái tương ứng, lưu người/thời điểm và ghi audit.
6. Hai admin quyết định cùng một item chỉ có một request thành công; request còn lại nhận `409` và dữ liệu không bị ghi đè.
7. Item đã quyết định không thể quyết định lại qua API; item không tồn tại trả lỗi `404`.
8. Người không phải ADMIN không thể gọi API dù bỏ qua UI.
9. Không có bản ghi `ai_generated_content` thì UI báo queue trống; không hiển thị nội dung hay metrics giả.

## Dependency và trạng thái tích hợp

- Schema `ai_generated_content` đã có từ V14; feature này thêm API, xử lý quyết định, audit, index queue và UI quản trị.
- Chưa có backend generator gọi AI hoặc ghi `ai_generated_content`, vì vậy luồng quyết định dùng được ngay khi có bản ghi nhưng bước đưa output AI vào queue còn cần tích hợp tại producer.
- Cấu hình `aiModerationEnabled` tại [system-settings.md](./system-settings.md) hiện được lưu nhưng chưa được producer tiêu thụ.
