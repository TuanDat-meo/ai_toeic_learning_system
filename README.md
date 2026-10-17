# HeThongHoTroHocToeic

Hệ thống hỗ trợ học TOEIC với giao diện học tập và quản trị, tài khoản người dùng, cùng cơ sở dữ liệu phục vụ nội dung và hoạt động học. Repository hiện có backend API cho xác thực, quản lý tài khoản và billing; một số màn hình nội dung, phân tích và recommendation vẫn là prototype dùng dữ liệu mẫu.

## Mục lục

- [Mục tiêu và trạng thái](#mục-tiêu-và-trạng-thái)
- [Đặc tả chức năng import nội dung](docs/content-import.md)
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
- Backend Spring Boot cho session đăng nhập, CSRF, hồ sơ người dùng, đổi mật khẩu, OTP khôi phục mật khẩu, quản lý tài khoản admin và nghiệp vụ gói học/giao dịch.
- Đăng nhập/đăng ký Google qua OAuth/OIDC khi cấu hình đủ Google Client ID và Secret.
- PostgreSQL với Flyway migrations cho người dùng và các nhóm dữ liệu nội dung, luyện tập, analytics, recommendation và AI.
- Các trang dashboard và admin cho nội dung, báo cáo, billing và recommendation.
- Luồng admin import, xem trước, validate, chuẩn hóa, phát hiện trùng và publish từ CSV/XLSX/JSON; đặc tả tại [docs/content-import.md](docs/content-import.md).
- Queue admin xem xét, duyệt hoặc từ chối nội dung AI đã được ghi vào bảng nội dung AI; đặc tả và giới hạn producer tại [docs/ai-moderation.md](docs/ai-moderation.md).
- Cấu hình hệ thống admin được lưu trong PostgreSQL, có kiểm soát quyền, optimistic locking và audit; đặc tả tại [docs/system-settings.md](docs/system-settings.md).
- Giao diện học viên xem gói hiện tại, gói đang phát hành và thanh toán VietQR; admin quản lý giao dịch và lượt đăng ký gói qua API.

### Prototype hoặc chưa hoàn thiện

- Các màn hình admin nội dung (ngoài luồng import mới), analytics, recommendation và hỗ trợ vẫn chủ yếu dùng mock data, state phía trình duyệt hoặc `localStorage`; billing plans, lượt đăng ký và giao dịch đã nối API. Dữ liệu đã publish qua import được lưu trong kho nội dung JSON nhưng chưa được các màn hình học tập hiện tại sử dụng; cần tích hợp ở bước tiếp theo.
- Có schema pgvector và biến mẫu `GEMINI_API_KEY`, nhưng không tìm thấy dịch vụ Gemini/RAG được nối trong backend hiện tại. Không xem các số liệu demo trên giao diện là dữ liệu thực.
- Chưa có frontend test script hoặc cấu hình coverage. Workflow triển khai VPS được mô tả trong `.github/workflows/deploy.yml`.

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
│   ├── workflows/               # CI và triển khai VPS qua SSH
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

Compose khai báo các dịch vụ PostgreSQL, backend và frontend. Database khởi tạo schema qua Flyway. Mặc định các cổng được ánh xạ là frontend `3000`, backend `8080`, PostgreSQL từ host `5433`. Các thư mục media lớn được bind mount read-only vào frontend; khi chạy local, mặc định chúng được đọc từ `frontend/public`.

Dừng dịch vụ mà không xóa volume database:

```bash
docker compose down
```

Volume `toeic_ai_learning_pgdata` là external; tạo volume trước lần chạy đầu như lệnh trên. Không dùng giá trị mẫu trong `.env.example` cho môi trường công khai.

### Lưu dữ liệu và media trên VPS

Thư mục gốc `data/` (khoảng 36 MB ở thời điểm kiểm tra) đã được Git bỏ qua, không được gửi cùng checkout production và không nằm trong Docker build context. Đây là dữ liệu nguồn/import; database production được lưu riêng trong volume `toeic_ai_learning_pgdata`. Chỉ import dữ liệu cần thiết vào database production qua chức năng/quy trình import hiện có. Giữ `data/` làm bản nguồn và sao lưu ra ổ đĩa riêng; không xóa dữ liệu nguồn chỉ vì đã deploy ứng dụng.

Media học tập trong `frontend/public` (audio, ảnh; khoảng 570 MB ở thời điểm kiểm tra) cũng không còn cần nằm trong Git hoặc frontend image:

1. Trước khi bỏ media khỏi Git, chép các thư mục `audio`, `ets_2024_lc`, `ets_2024_lc1`, `ets_lc1`, `ets_rc1`, `ets_transcript1` và `images` lên ổ đĩa của VPS dưới `/opt/toeic-media`, giữ nguyên cấu trúc và tên file.
2. Tạo thư mục đích một lần trên VPS:

   ```bash
   sudo mkdir -p /opt/toeic-media
   sudo chown -R <deploy-user>:<deploy-user> /opt/toeic-media
   ```

3. Từ PowerShell ở máy có bộ media gốc, đồng bộ các thư mục lên VPS (thay user và host thật):

   ```powershell
   ssh <deploy-user>@<vps-host> "mkdir -p /opt/toeic-media"
   scp -r frontend/public/audio frontend/public/ets_2024_lc frontend/public/ets_2024_lc1 frontend/public/ets_lc1 frontend/public/ets_rc1 frontend/public/ets_transcript1 frontend/public/images <deploy-user>@<vps-host>:/opt/toeic-media/
   ```

   Với lần cập nhật sau, dùng `rsync` từ máy có OpenSSH rsync hoặc công cụ đồng bộ tương đương để chỉ truyền file thay đổi.
4. Trong `.env` trên VPS, đặt `MEDIA_DIR=/opt/toeic-media`. Compose mount từng thư mục vào đúng đường dẫn `/app/public/...` ở chế độ chỉ đọc, nên các URL media hiện tại không cần thay đổi. Các file vẫn được phục vụ bởi frontend trên cùng VPS; không phát sinh phí lưu trữ dịch vụ bên thứ ba. Đảm bảo user chạy Docker có quyền đọc các file.
5. Kiểm tra một URL audio và một URL ảnh trực tiếp sau deploy. Đừng xóa bản media gốc khỏi máy cho đến khi xác nhận VPS đủ file và ứng dụng phát/tải được.

`frontend/.dockerignore` bỏ các thư mục media khỏi build context, còn `.gitignore` ngăn thêm media vào Git. Trong thay đổi hiện tại, 808 file media đã được bỏ khỏi Git index nhưng vẫn được giữ nguyên trên ổ đĩa làm bản nguồn để upload; 7 file tĩnh nhỏ ở gốc `public` vẫn được theo dõi. Các mục xóa đang ở trạng thái staged; giữ chúng trong commit triển khai để clone mới không tải lại media. Lịch sử Git cũ vẫn có thể chứa blob, vì vậy không rewrite lịch sử nếu không phối hợp với mọi người dùng repo. Chỉ deploy sau khi bộ media đã có mặt trên VPS.

Bind mount trên dùng thư mục `frontend/public` khi chạy local, vì vậy môi trường phát triển hiện tại giữ nguyên. Nếu môi trường mới chưa có media, cần tải media về đúng thư mục trước khi khởi động Compose.

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
| `VIETQR_BANK_CODE`, `VIETQR_ACCOUNT_NUMBER`, `VIETQR_ACCOUNT_NAME` | Backend | Tài khoản nhận tiền để tạo mã VietQR theo số tiền và nội dung của đơn hàng. |
| `SEPAY_WEBHOOK_TOKEN` | Backend | Token xác thực webhook SePay; cấu hình cùng giá trị trong mục xác thực webhook của SePay. |
| `FRONTEND_URL` | Backend | URL frontend nhận kết quả OAuth; mặc định trong source là localhost. |
| `SESSION_COOKIE_SAME_SITE`, `SESSION_COOKIE_SECURE` | Backend | Cấu hình cookie phiên. Khi frontend và API ở hai site khác nhau, dùng `none` và `true` trên HTTPS; nếu cùng site có thể giữ `lax`. |
| `NEXT_PUBLIC_API_URL` | Frontend build | Base URL backend được đóng vào bundle frontend. |
| `GEMINI_API_KEY`, `JWT_SECRET`, `JWT_EXPIRATION` | Mẫu `.env` | Có trong template nhưng chưa được ứng dụng hiện tại đọc để thực hiện Gemini hoặc JWT auth. |

### Thanh toán VietQR và SePay

Để bật thanh toán, cấu hình mã ngân hàng (BIN hoặc mã ngân hàng VietQR chấp nhận), số tài khoản và tên chủ tài khoản trong `.env`. Tạo token webhook trong SePay và đặt cùng giá trị cho `SEPAY_WEBHOOK_TOKEN`; cấu hình URL webhook là `https://<domain-api>/api/webhooks/sepay` và header xác thực `Authorization: Apikey <token>`. Backend phải truy cập được công khai qua HTTPS để SePay gửi biến động số dư.

Đơn hàng được tạo ở trạng thái chờ với giá lấy từ gói đang phát hành. QR VietQR chứa số tiền chính xác và mã tham chiếu riêng; frontend tự xin QR mới sau 2 phút. Mã đã hết thời gian hiển thị vẫn có thể được thanh toán nếu người học đã quét/lưu mã cũ, và webhook vẫn đối chiếu giao dịch theo tham chiếu + số tiền để tránh mất khoản chuyển khoản. Gói chỉ được kích hoạt khi SePay gửi giao dịch tiền vào khớp; trang admin tiếp tục hỗ trợ đối soát/xác nhận thủ công. Khi trang thanh toán đang mở, trạng thái được kiểm tra định kỳ và học viên nhận thông báo thành công ngay khi webhook xác nhận đơn.

Để QR thanh toán thực tế hoạt động, phải cấu hình đúng ngân hàng hỗ trợ VietQR, số tài khoản nhận, tên chủ tài khoản và `SEPAY_WEBHOOK_TOKEN` trong môi trường backend; URL webhook SePay phải truy cập được qua HTTPS. Nếu thiếu một trong các cấu hình này, checkout trả thông báo chưa sẵn sàng thay vì tạo QR thanh toán giả.
Yêu cầu chưa thể xử lý. Vui lòng thử lại.
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

`ci.yml` chỉ chạy kiểm tra, không publish image. Quy trình deploy VPS được mô tả bên dưới. Branch protection, số review bắt buộc và quyền merge không được định nghĩa trong repository; cần kiểm tra riêng trong cài đặt GitHub của dự án.

### Deploy production lên VPS bằng Docker Compose

`.github/workflows/deploy.yml` triển khai sau khi workflow `CI` hoàn tất thành công trên `main`; cũng có thể chạy thủ công từ branch `main`. Workflow kết nối VPS qua SSH, xác nhận checkout server sạch và đúng commit, chạy `docker compose up -d --build`, sau đó kiểm tra frontend và trạng thái ba container.

#### Chuẩn bị VPS một lần

1. Cài Git, Docker Engine, Docker Compose v2 và `curl`. Tạo user deploy không dùng root, cho phép user chạy Docker, và chỉ mở SSH/HTTP/HTTPS trên firewall.
2. Clone repository vào một thư mục ổn định bằng shallow clone để tránh tải lịch sử cũ từng chứa media, ví dụ `git clone --depth 1 --branch main <repository-url> /opt/toeic-app`. Tạo deploy key chỉ đọc cho VPS để `git fetch` có thể lấy repository nếu repo private.
3. Tạo `/opt/toeic-app/.env` từ `.env.example`; thay toàn bộ giá trị mẫu bằng cấu hình production. Nếu volume PostgreSQL đã được khởi tạo, đổi `DB_PASSWORD` trong `.env` **không tự đổi mật khẩu của role trong database**. Trước khi thay credential, đăng nhập vào PostgreSQL bằng credential hiện tại, chạy `\password postgres` trong `psql`, rồi cập nhật `DB_PASSWORD` trong `.env` thành cùng mật khẩu mới. Đặt tối thiểu:

   ```dotenv
   DB_PASSWORD=<mật-khẩu-database-mạnh>
   JWT_SECRET=<chuỗi-ngẫu-nhiên-dài-và-riêng>
   NEXT_PUBLIC_API_URL=https://api.example.com
   CORS_ALLOWED_ORIGINS=https://app.example.com
   FRONTEND_URL=https://app.example.com
   SESSION_COOKIE_SECURE=true
   POSTGRES_PORT_BIND=127.0.0.1:5433:5432
   BACKEND_PORT_BIND=127.0.0.1:8080:8080
   FRONTEND_PORT_BIND=127.0.0.1:3000:3000
   ```

   Thay `app.example.com` và `api.example.com` bằng domain thực tế. Cấu hình reverse proxy có HTTPS chuyển tiếp frontend đến `127.0.0.1:3000` và API đến `127.0.0.1:8080`. Không để `.env` trong Git. Tạo volume database một lần:

   ```bash
   docker volume create toeic_ai_learning_pgdata
   ```

4. Cấu hình domain, HTTPS, email/OAuth và thông tin VietQR/SePay production phù hợp. `NEXT_PUBLIC_API_URL` được nhúng khi build frontend, vì vậy phải đặt URL API production đúng trước lần deploy đầu.

#### Cấu hình GitHub Actions

Tạo GitHub Environment tên `production` và thêm các **environment secrets** sau:

| Secret | Nội dung |
| --- | --- |
| `VPS_HOST` | IP hoặc hostname của VPS |
| `VPS_USER` | User SSH dùng để deploy |
| `VPS_SSH_PRIVATE_KEY` | Private key CI dùng để SSH đến VPS |
| `VPS_KNOWN_HOSTS` | Dòng known-hosts của VPS, xác minh fingerprint trước khi lưu |
| `VPS_APP_DIR` | Thư mục clone repo trên VPS, ví dụ `/opt/toeic-app` |

Public key tương ứng với `VPS_SSH_PRIVATE_KEY` phải nằm trong `~/.ssh/authorized_keys` của user deploy. Tách riêng key này khỏi deploy key mà VPS dùng để đọc repository. Workflow không tắt xác minh host key.

Sau khi CI xanh trên `main`, deploy tự chạy. Có thể chạy lại qua **Actions → Deploy production → Run workflow**, chọn `main`. Nếu máy chủ báo checkout có thay đổi cục bộ, workflow sẽ dừng thay vì ghi đè; cần xử lý thay đổi đó trên VPS trước khi deploy tiếp.

Compose hiện lấy credential database từ `.env` thay vì mật khẩu cố định trong file và cho phép giới hạn cổng publish theo cấu hình. Các giá trị `*_PORT_BIND` trong `.env.example` chỉ bind loopback; giữ nguyên cấu hình này khi chạy production sau reverse proxy.

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
