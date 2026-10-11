# HeThongHoTroHocToeic

Hệ thống hỗ trợ học TOEIC với giao diện học tập và quản trị, tài khoản người dùng, cùng cơ sở dữ liệu phục vụ nội dung và hoạt động học. Repository hiện có backend API cho xác thực và quản lý tài khoản; nhiều màn hình nội dung, phân tích và thương mại vẫn là prototype dùng dữ liệu mẫu.

## Mục lục

- [Mục tiêu và trạng thái](#mục-tiêu-và-trạng-thái)
- [Công nghệ](#công-nghệ)
- [Cấu trúc repository](#cấu-trúc-repository)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt và chạy bằng Docker Compose](#cài-đặt-và-chạy-bằng-docker-compose)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Kiểm tra, lint, build và coverage](#kiểm-tra-lint-build-và-coverage)
- [CI/CD và Pull Request](#cicd-và-pull-request)
- [Quy ước Git và code review](#quy-ước-git-và-code-review)
- [Đóng góp và roadmap](#đóng-góp-và-roadmap)

## Mục tiêu và trạng thái

Mục tiêu là hỗ trợ học viên tổ chức việc học TOEIC, quản lý nội dung học và tiến tới cá nhân hóa lộ trình dựa trên kết quả luyện tập.

### Đã có trong repository

- Giao diện marketing, đăng ký, đăng nhập, quên và đặt lại mật khẩu.
- Backend Spring Boot cho session đăng nhập, CSRF, hồ sơ người dùng, đổi mật khẩu, OTP khôi phục mật khẩu và quản lý tài khoản admin.
- Đăng nhập/đăng ký Google qua OAuth/OIDC khi cấu hình đủ Google Client ID và Secret.
- PostgreSQL với Flyway migrations cho người dùng và các nhóm dữ liệu nội dung, luyện tập, analytics, recommendation và AI.
- Các trang dashboard và admin cho nội dung, báo cáo, billing và recommendation.

### Prototype hoặc chưa hoàn thiện

- Các màn hình admin về nội dung học, analytics, recommendation, billing và hỗ trợ hiện chủ yếu dùng mock data, state phía trình duyệt hoặc `localStorage`; backend chưa có API tương ứng cho các nghiệp vụ đó.
- Có schema pgvector và biến mẫu `GEMINI_API_KEY`, nhưng không tìm thấy dịch vụ Gemini/RAG được nối trong backend hiện tại. Không xem các số liệu demo trên giao diện là dữ liệu thực.
- Chưa có frontend test script, cấu hình coverage, hoặc workflow triển khai tự động.

## Công nghệ

| Thành phần | Công nghệ trong cấu hình |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, ESLint 9 |
| Backend | Java 25, Spring Boot 4.1, Spring Security, Spring MVC, Spring Data JPA, Bean Validation, Spring Mail |
| Database | PostgreSQL 16; image `pgvector/pgvector:pg16`; Flyway migrations |
| AI | Gemini được nêu trong cấu hình mẫu và nội dung prototype; tích hợp runtime chưa được triển khai trong backend hiện tại |
| Build/triển khai | Maven Wrapper, npm, Docker, Docker Compose |
| CI | GitHub Actions: Gitleaks, chính sách branch/commit, frontend lint/build, backend Maven verify |

## Cấu trúc repository

```text
.
├── .github/
│   ├── workflows/ci.yml         # Kiểm tra tự động trên GitHub Actions
│   └── scripts/                 # Quy tắc branch và commit
├── backend/
│   ├── src/main/java/...        # API auth, user, security và cấu hình
│   ├── src/main/resources/      # application.properties, Flyway migrations
│   ├── src/test/java/           # Unit test và Spring context test
│   ├── Dockerfile
│   ├── mvnw, mvnw.cmd
│   └── pom.xml
├── frontend/
│   ├── app/                     # Route marketing, auth, dashboard, admin
│   ├── components/              # UI auth, marketing, dashboard, admin
│   ├── lib/api/                 # Client gọi API và prototype local
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── postman/                     # Postman collection
├── .env.example                 # Mẫu biến môi trường, không chứa cấu hình triển khai
└── docker-compose.yml           # PostgreSQL, backend, frontend
```

## Yêu cầu môi trường

Để chạy toàn hệ thống bằng Docker:

- Docker Desktop hoặc Docker Engine có Docker Compose v2.
- Git.

Để chạy từng phần ngoài Docker:

- Node.js 22 và npm cho frontend.
- JDK 25 cho backend; có thể dùng Maven Wrapper đi kèm, không cần cài Maven riêng.
- PostgreSQL 16 có extension `vector` nếu chạy backend độc lập. Khi chạy bằng Compose, database dùng image pgvector và migrations chạy lúc backend khởi động.

## Cài đặt và chạy bằng Docker Compose

Từ thư mục gốc:

```bash
cp .env.example .env
docker volume create toeic_ai_learning_pgdata
```

Trên PowerShell, lệnh sao chép tương đương là:

```powershell
Copy-Item .env.example .env
```

Điền các biến cần thiết trong `.env` theo [bảng cấu hình](#cấu-hình-biến-môi-trường). Có thể đặt `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` và `BOOTSTRAP_ADMIN_NAME` để backend tạo admin ban đầu. Bootstrap chỉ tạo tài khoản khi đủ cả ba giá trị và không ghi đè email đã có.

Khởi chạy:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Compose khai báo các dịch vụ PostgreSQL, backend và frontend. Database khởi tạo schema qua Flyway. Mặc định các cổng được ánh xạ là frontend `3000`, backend `8080`, PostgreSQL từ host `5433`.

Dừng dịch vụ mà không xóa volume database:

```bash
docker compose down
```

Volume `toeic_ai_learning_pgdata` là external; tạo volume trước lần chạy đầu như lệnh trên. Không dùng tài khoản/mật khẩu mẫu cho môi trường công khai. Các giá trị mật khẩu database đang được khai báo trực tiếp trong Compose nên cần được thay bằng quản lý secret phù hợp trước khi triển khai production.

### Chạy frontend/backend riêng

Frontend, từ `frontend/`:

```bash
npm ci
npm run dev
```

Backend, từ `backend/` (cần PostgreSQL đang chạy và biến kết nối phù hợp):

```bash
./mvnw spring-boot:run
```

Trên Windows PowerShell dùng `.\mvnw.cmd spring-boot:run`. Frontend đọc `NEXT_PUBLIC_API_URL`; backend đọc cấu hình database, mail và CORS từ biến môi trường, có giá trị mặc định trong `application.properties`.

## Cấu hình biến môi trường

`.env.example` là danh sách tham khảo. Không commit `.env`, OAuth Client Secret, mật khẩu, hoặc API key thật. Một số biến được đọc trực tiếp trong code nhưng không nằm sẵn trong `.env.example`.

| Biến | Thành phần | Mục đích |
| --- | --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Backend | Kết nối PostgreSQL; URL nội bộ Compose dùng service `postgres`. Compose hiện khai báo riêng credential datasource/database, vì vậy chỉ đổi các biến này trong `.env` chưa thay credential đang dùng bởi Compose. |
| `CORS_ALLOWED_ORIGINS` | Backend | Danh sách origin frontend được phép gửi request có credentials. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`, `MAIL_SMTP_STARTTLS`, `MAIL_FROM` | Backend | SMTP gửi OTP khôi phục mật khẩu. |
| `PASSWORD_RESET_TOKEN_TTL` | Backend | Thời hạn OTP; dạng Duration, ví dụ `PT2M`. |
| `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME` | Backend | Tùy chọn tạo admin ban đầu. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Backend | Bật Google OAuth khi cả hai biến được cấu hình. |
| `FRONTEND_URL` | Backend | URL frontend nhận kết quả OAuth; mặc định trong source là localhost. |
| `SESSION_COOKIE_SAME_SITE`, `SESSION_COOKIE_SECURE` | Backend | Cấu hình cookie phiên. Khi frontend và API ở hai site khác nhau, dùng `none` và `true` trên HTTPS; nếu cùng site có thể giữ `lax`. |
| `NEXT_PUBLIC_API_URL` | Frontend build | Base URL backend được đóng vào bundle frontend. |
| `GEMINI_API_KEY`, `JWT_SECRET`, `JWT_EXPIRATION` | Mẫu `.env` | Có trong template nhưng chưa được ứng dụng hiện tại đọc để thực hiện Gemini hoặc JWT auth. |

### Google OAuth trên môi trường triển khai

Đăng ký OAuth Client loại Web trong Google Cloud Console. Authorized redirect URI phải trỏ tới **backend public**, theo mẫu:

```text
https://<domain-api>/login/oauth2/code/google
```

Đặt `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong secret store của backend; đặt `FRONTEND_URL` và `NEXT_PUBLIC_API_URL` theo domain public thực tế. Origin frontend phải nằm trong `CORS_ALLOWED_ORIGINS`. Sau khi đổi `NEXT_PUBLIC_API_URL`, cần build lại frontend. Không đưa Client Secret vào biến `NEXT_PUBLIC_*`.

Backend được cấu hình đọc forwarded headers để `{baseUrl}` tạo callback theo domain HTTPS công khai. Proxy/load balancer cần chuyển tiếp `Forwarded` hoặc `X-Forwarded-*` chính xác. Nếu frontend và API khác site (không chỉ khác subdomain), cấu hình `SESSION_COOKIE_SAME_SITE=none` và `SESSION_COOKIE_SECURE=true`; nếu cùng site, giữ `lax` thường phù hợp. Chỉ bật xử lý forwarded headers khi backend chỉ nhận traffic qua proxy tin cậy.

## Kiểm tra, lint, build và coverage

### Frontend

Từ `frontend/`:

```bash
npm ci
npm run lint
npm run build
```

`package.json` hiện không khai báo `test` hoặc `coverage` script. Không có frontend unit/E2E test runner được cấu hình trong repository.

### Backend

Từ `backend/`:

```bash
./mvnw test
./mvnw verify
```

Trên Windows PowerShell:

```powershell
.\mvnw.cmd test
.\mvnw.cmd verify
```

Các test hiện có gồm validation test cho request auth và Spring application context test. Context test cần database đúng cấu hình; workflow CI chạy PostgreSQL pgvector 16 làm service. `verify` là lệnh backend dùng trong CI.

`pom.xml` chưa cấu hình JaCoCo hoặc plugin coverage khác, vì vậy repository hiện chưa có lệnh đo coverage chuẩn. Không có frontend test/coverage command để báo cáo.

## CI/CD và Pull Request

`.github/workflows/ci.yml` chạy khi push lên `main`/`develop`, khi mở hoặc cập nhật Pull Request đích đến hai branch đó, hoặc khi chạy thủ công. Workflow có các job:

1. **Secret scan:** Gitleaks quét lịch sử Git.
2. **Branch and commit policy:** kiểm tra branch flow và commit message.
3. **Frontend checks:** Node.js 22, `npm ci`, `npm run lint`, `npm run build`.
4. **Backend tests:** Java 25, PostgreSQL pgvector 16, Maven Wrapper `verify`.

Workflow hiện là CI, không build/publish image hoặc deploy ứng dụng. Branch protection, số review bắt buộc và quyền merge không được định nghĩa trong repository; cần kiểm tra riêng trong cài đặt GitHub của dự án.

## Quy ước Git và code review

### Branch

Script CI chấp nhận các branch:

- `main`, `develop`
- `feature/<name>`, `defect/<name>`, `chore/<name>`

PR từ `feature/*`, `defect/*`, `chore/*` phải nhắm vào `develop`; chỉ `develop` được mở PR vào `main`.

### Commit message

Định dạng được script kiểm tra:

```text
<type>: <description>
```

`type` chỉ gồm `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Tổng độ dài tối đa 100 ký tự; description không rỗng, không có khoảng trắng đầu và không kết thúc bằng dấu chấm. Script yêu cầu nội dung in được ASCII và từ chối một số mô tả chung chung.

### Pull Request và review

Tạo PR theo đúng branch flow ở trên. Mô tả mục đích, thay đổi, cấu hình/migration liên quan và cách kiểm tra; đính kèm ảnh nếu thay đổi giao diện. Trước khi merge, chạy các kiểm tra áp dụng và xem kết quả CI. Repository không có PR template hoặc quy tắc bắt buộc approval; nhóm nên review thay đổi, đặc biệt là xác thực, migration và secrets, trước khi merge.

## Đóng góp và roadmap

1. Tạo branch theo quy ước từ `develop`.
2. Thay đổi trong phạm vi nhỏ; không commit `.env`, secrets, build output hoặc dữ liệu người học.
3. Chạy lint/build frontend hoặc Maven verify backend tùy phần được sửa.
4. Tạo PR vào `develop`, mô tả kiểm tra đã chạy và xử lý phản hồi review.
5. Chỉ tạo PR `develop` → `main` theo quy trình phát hành của nhóm.

Roadmap dựa trên code hiện tại:

- **Đang có:** authentication, OTP email, Google OAuth tùy cấu hình, quản lý tài khoản admin, schema dữ liệu học tập và các giao diện quản trị/học tập.
- **Cần hoàn thiện:** nối các trang prototype với API và dữ liệu thật; hoàn thiện nghiệp vụ nội dung, luyện tập, analytics, learning path và recommendation ở backend.
- **Dự kiến:** tích hợp Gemini/RAG thực tế, kiểm thử frontend và coverage, cùng quy trình build/deploy tự động. Các mục này chưa được cấu hình hoàn chỉnh trong repository.

Chưa có file `LICENSE`; quyền sử dụng và phân phối cần được xác nhận với chủ sở hữu repository.
