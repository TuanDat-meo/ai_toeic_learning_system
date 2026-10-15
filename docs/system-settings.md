# Cấu hình hệ thống

## User story và phạm vi

**Là quản trị viên**, tôi muốn quản lý cấu hình chung và tùy chọn vận hành để giá trị mặc định nhất quán giữa các phiên làm việc và các quản trị viên.

Trong phạm vi:

- Tên hệ thống và email hỗ trợ.
- Thời lượng học mặc định cho học viên chưa có thời lượng trong hồ sơ onboarding; thay đổi không ghi đè các hồ sơ đã có giá trị.
- Giờ nhắc học mặc định và ba lựa chọn theo dõi sự kiện quản trị.
- Lưu cấu hình PostgreSQL, ghi audit, ngăn ghi đè khi có quản trị viên cập nhật đồng thời.

Ngoài phạm vi: thông tin bí mật/credential, cấu hình hạ tầng, đo CPU/RAM/uptime, backup/restore và gửi email/push. Các tùy chọn theo dõi sự kiện và giờ nhắc hiện chỉ được lưu; hệ thống chưa có worker/kênh gửi thông báo tự động.

## Quyền truy cập

- `ADMIN`: được đọc và cập nhật qua `GET`/`PUT /api/admin/settings`.
- `STUDENT`, `TEACHER`, khách chưa đăng nhập: không được đọc hoặc cập nhật API cấu hình.
- Backend áp dụng quyền cho toàn bộ `/api/admin/**`; UI cũng nằm trong admin shell/role guard. Không dựa riêng vào việc ẩn giao diện.
- Mỗi lần cập nhật thành công ghi `UPDATE / SYSTEM_SETTINGS` vào `audit_logs`. Không ghi giá trị cấu hình vào nội dung audit.

## Validation và edge cases

| Trường | Quy tắc |
| --- | --- |
| `systemName` | Bắt buộc, tối đa 80 ký tự; được trim trước khi lưu |
| `supportEmail` | Bắt buộc, email hợp lệ, tối đa 254 ký tự |
| `dailyStudyMinutes` | Một trong `15`, `30`, `45`, `60`, `90`; đồng nhất với các lựa chọn onboarding |
| `reminderTime` | Bắt buộc, định dạng 24 giờ `HH:mm` |
| `notifications` | Bắt buộc; cả ba trường boolean đều phải có |
| `expectedVersion` | Số nguyên không âm, lấy từ lần đọc gần nhất |

- Cấu hình mặc định được seed bằng migration; thiếu bản ghi sau migration được coi là lỗi hệ thống, không trả cấu hình giả.
- Nếu API trả `404` do chưa có bản ghi singleton, UI hiển thị empty state có hướng dẫn chạy migration và nút tải lại.
- Cập nhật dùng optimistic locking. Version cũ trả `409 Conflict`, giữ nguyên dữ liệu và cho phép tải cấu hình mới nhất.
- Lỗi mạng, hết phiên, không đủ quyền và phản hồi không hợp lệ được hiển thị thay vì báo lưu thành công.
- Reset chỉ đưa biểu mẫu về giá trị mặc định; dữ liệu chỉ đổi sau khi người dùng xác nhận bằng nút lưu.

## Data model và API contract

Migration `V36__create_system_settings.sql` tạo singleton `system_settings`, có constraint miền giá trị, version, thời điểm cập nhật và admin cập nhật cuối.

`GET /api/admin/settings` trả `systemName`, `supportEmail`, `dailyStudyMinutes`, `reminderTime`, `notifications`, `version`, `updatedAt`; trả `404` nếu migration chưa tạo cấu hình.

`PUT /api/admin/settings` nhận các trường cấu hình trên, bỏ metadata phản hồi và thêm `expectedVersion`. Trả cấu hình đã lưu cùng version mới. Request ghi dùng session cookie và CSRF token theo client hiện hữu.

## Acceptance criteria

1. ADMIN mở trang thấy trạng thái loading, sau đó dữ liệu bền vững từ API; lỗi tải có thông báo và nút thử lại.
2. ADMIN cập nhật các trường hợp lệ, lưu, tải lại trang hoặc phiên khác vẫn thấy cùng cấu hình.
3. Lưu thành công tăng version, cập nhật `updatedAt`, ghi một audit event; audit không chứa email/tên cấu hình.
4. Dữ liệu sai bị từ chối ở frontend lẫn backend và lỗi API được hiển thị; không báo thành công giả.
5. STUDENT/TEACHER/khách không đọc/ghi được cấu hình; backend trả `403` cho người dùng có phiên nhưng không phải ADMIN và `401` khi chưa xác thực.
6. Hai admin cùng sửa một version: chỉ request đầu tiên thành công; request sau nhận `409` và có thể tải dữ liệu mới nhất.
7. Thời lượng cấu hình mới được dùng làm mặc định khi trạng thái onboarding chưa có thời lượng; giá trị đã chọn/lưu của học viên không bị ghi đè.
8. Reset mặc định chỉ thay draft cho đến khi nhấn lưu. Trạng thái chưa khởi tạo/không hợp lệ không bị thay bằng dữ liệu giả.

## Dependency và trạng thái tích hợp

- Onboarding dùng cùng tập thời lượng `15/30/45/60/90` ở frontend và backend.
- `notifications` là lựa chọn cấu hình được lưu, chưa nối tới hệ thống phát thông báo; `reminderTime` chưa được worker sử dụng.
- UI cài đặt trong admin được bảo vệ bởi role guard hiện có; API dùng matcher `/api/admin/**` hiện tại.
