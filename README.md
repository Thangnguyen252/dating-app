# Demo Dating App

Clique83 là một ứng dụng hẹn hò hiện đại, tập trung vào trải nghiệm người dùng mượt mà và tính năng kết nối thông minh dựa trên thời gian rảnh.

Demo: https://dating-app-eta-one.vercel.app

Tech Stack: Next.js 16 (App Router), Tailwind CSS, TypeScript

---

## 1. Tổ chức hệ thống (System Organization)

Dự án được tổ chức theo mô hình Modular Components trong Next.js để dễ dàng mở rộng:

- `/app`: Chứa các route chính và layout toàn cục.
- `/components`: Chia nhỏ các thành phần giao diện (DiscoveryFeed, MatchesSidebar, Messages, v.v.) để dễ bảo trì và tái sử dụng.
- `/hooks`: Chứa các logic tùy chỉnh, tiêu biểu là `useLocalStorage` để quản lý trạng thái dữ liệu đồng nhất toàn app.
- `/lib`: Chứa các cấu hình bên thứ ba (Uploadthing) để lưu ảnh.
- `/types`: Định nghĩa chặt chẽ các interface (UserProfile, AppDatabase) để đảm bảo bộ khung cho dữ liệu.

---

## 2. Các chức năng chính
**Nhà tuyển dụng vui lòng tạo ít nhất 2 profile nam-nữ để test thử. Vì lưu bằng LocalStorage nên database không có sẵn khi deploy.**

### 2.1 Đăng nhập - đăng xuất

Cho phép người dùng nhập Email. Hệ thống tự động kiểm tra email đã có trong LocalStorage chưa, nếu chưa thì tạo Profile mới.

### 2.2 Tạo profile

Người dùng nhập tên, thông tin, sở thích, vị trí, ảnh,...

### 2.3 Lướt (quẹt)

Lấy idea từ đa số các app hẹn hò hiện đại: người dùng xem danh sách các profile hiện có, quẹt trái/phải để dislike/like. Hai người like nhau sẽ được coi là Match.

### 2.4 Nhắn tin

2 users sau khi match có thể nhắn tin cho nhau.

### 2.5 Đặt lịch rảnh

Mỗi user có thể chọn tối đa 4 lịch rảnh trong 3 tuần kế tiếp. Nếu 2 users đã match nhau có trùng lịch rảnh, hệ thống sẽ thông báo và tiến hành xếp lịch hẹn.



---

## 3. Lưu trữ dữ liệu (Data Storage)

### State & Persistence

Dự án hiện tại sử dụng Local Storage để lưu trữ toàn bộ dữ liệu người dùng, tin nhắn và trạng thái thích. Điều này giúp ứng dụng hoạt động ngay lập tức mà không cần cấu hình backend phức tạp.

### Images

Hình ảnh người dùng được lưu trữ trên cloud thông qua Uploadthing, đảm bảo tốc độ tải ảnh nhanh và chất lượng cao.

---

## 4. Logic

### 4.1 Logic Matching

Hệ thống Matching hoạt động dựa trên nguyên tắc "Mutual Like" (Thích lẫn nhau).

Khi User A bấm nút "Like" User B, luồng dữ liệu sẽ đi qua các bước kiểm tra sau:

**Bước 1 - Ghi nhận hành động:**  
Mã định danh (ID) của User B được thêm vào mảng likes của User A.

**Bước 2 - Đối chiếu dữ liệu chéo:**  
Ngay lập tức, thuật toán truy xuất vào mảng likes của User B để tìm kiếm ID của User A.

**Bước 3 - Phân nhánh kết quả:**

- **Trường hợp 1 (Chưa tương hỗ):**  
Nếu ID của User A không tồn tại trong danh sách likes của User B. Hệ thống ghi nhận đây là hành động đơn phương. Thông tin này được dùng để tính toán "Pending Likes" (Lượt thích chờ duyệt) hiển thị cho User B xem có bao nhiêu người đang thích họ.

- **Trường hợp 2 (Tương hỗ - Match):**  
Nếu ID của User A đã có sẵn trong danh sách likes của User B. Điều kiện kết nối được thỏa mãn.

---

### 4.2 Logic tìm lịch rảnh trùng (Availability Matching)

Mỗi tài khoản chỉ được phép thiết lập tối đa 4 khoảng thời gian rảnh, giới hạn trong vòng 21 ngày (3 tuần) kể từ thời điểm hiện tại.

**Bước 1 - Trích xuất dữ liệu:**  
Truy xuất mảng `availabilities` của User A và User B từ cơ sở dữ liệu.

**Bước 2 - Lọc theo ngày (date):**  
Thuật toán sẽ duyệt qua hai mảng dữ liệu. Chỉ những phần tử có thông số `date` hoàn toàn giống nhau (cùng ngày, tháng, năm) mới được đưa vào bước tính toán tiếp theo.

**Bước 3 - Tính khoảng giao nhau:**  

Trên cùng một ngày đã xác định, thuật toán tính toán mốc thời gian chung dựa trên giờ bắt đầu và kết thúc:

- **Mốc bắt đầu chung:**  
Được xác định bằng cách lấy mốc thời gian lớn hơn (muộn hơn) giữa hai giá trị `startTime` của A và B.  
(Ví dụ: A bắt đầu lúc 18:00, B bắt đầu lúc 19:00 → Mốc bắt đầu chung là 19:00).

- **Mốc kết thúc chung:**  
Được xác định bằng cách lấy mốc thời gian nhỏ hơn (sớm hơn) giữa hai giá trị `endTime` của A và B.  
(Ví dụ: A kết thúc lúc 22:00, B kết thúc lúc 21:00 → Mốc kết thúc chung là 21:00).

**Bước 4 - Kiểm tra tính hợp lệ:**  
Khoảng thời gian từ "Mốc bắt đầu chung" đến "Mốc kết thúc chung" được xác nhận là "Lịch rảnh trùng" nếu mốc bắt đầu diễn ra trước mốc kết thúc.  
(19:00 đến 21:00 là một khoảng thời gian hợp lệ). Khoảng thời gian này sau đó sẽ được xuất ra màn hình giao diện.

---

### 4.3 Thuật toán hiển thị hồ sơ

Để quyết định thứ tự hiển thị hồ sơ của mỗi user, ta sẽ dùng hệ thống tính điểm giữa 2 users với nhau. Đặt tên biến là `MatchingPoint`.

Ban đầu điểm matching (`MatchingPoint`) của 2 users = 0. Điểm này sẽ tự động khởi tạo giữa 2 người nếu là 2 giới tính khác nhau. Ai có điểm cao hơn sẽ ưu tiên hiển thị đầu trong danh sách quẹt.

**Lưu ý: điểm MatchingPoint là điểm ẩn, tuy nhiên để dễ dàng test case và cho nhà tuyển dụng dễ theo dõi, em cho nó hiển thị trên profile (dễ dàng xem thuật toán hoạt động).**

Điểm MatchingPoint sẽ tăng giảm tùy theo vị trí - sở thích - độ tuổi - điểm elo cá nhân của từng người, theo quy tắc em tự viết như sau:

---

#### 1. Độ ưu tiên – điểm cá nhân

Mỗi tài khoản khi tạo sẽ có 1 điểm ẩn là: `elo = 0`.

Nếu người dùng được người khác like sẽ cộng 1 elo.

Nếu 2 user có điểm elo chỉ chênh lệch bé hơn hoặc bằng 4 (`|elo1 - elo2| <= 4`) thì sẽ cộng 10 điểm MatchingPoint.

---

#### 2. Sở thích

Cứ 2 người có sở thích chung thì sẽ cộng 10 điểm MatchingPoint / sở thích.  
Tối đa 40 điểm MatchingPoint.

Không giống sở thích chung không bị trừ.

---

#### 3. Vị trí

Nếu 2 người có vị trí giống nhau sẽ cộng 15 điểm MatchingPoint.

---

#### 4. Độ tuổi

2 người có khoảng cách độ tuổi chênh lệch bé hơn hoặc bằng 4 (`|tuổi B – tuổi A| <= 4`) sẽ được cộng 15 điểm MatchingPoint. Không thì bỏ qua.

---

#### 5. Cơ chế Đã like thì ưu tiên

Nếu có một trong 2 người đã like người còn lại thì tự cộng 15 điểm MatchingPoint.

---

### Ví dụ

2 người nam và nữ:

- Người nữ có 2 likes, nam có 10 likes (không ai like lẫn nhau).
- Hai người có chung 2 sở thích.
- Chung vị trí.
- Người nam 20 tuổi, người nữ 18 tuổi.
- Không ai đã like nhau.

Thì MatchingPoint giữa 2 người là: 50 điểm.

---

## 5. Cải thiện (nếu có)

Vì thời gian ngắn nên em dự tính chỉ dùng LocalStorage, cũng như giao diện chưa thể đáp ứng Responsive trên đa thiết bị (mobile).

Ngoài ra cũng nên phát triển thêm nhiều tính năng hơn cho người dùng, như filter bộ lọc theo độ tuổi, khoảng cách, hoặc một số tính năng premium để người dùng trả phí như Gọi điện, video, ẩn danh,...

---

## 6. Tính năng đề xuất thêm

### Distance Filtering

Tích hợp Google Maps API để hiển thị và lọc người dùng trong bán kính cụ thể (ví dụ: chỉ tìm người trong phạm vi 5km). Dành cho các users không muốn yêu xa.

### Video Intro

Cho phép người dùng upload một đoạn video ngắn 5-10 giây. Sẽ dễ match hơn và đáng tin hơn so với ảnh

### Ẩn danh

Cho phép người dùng chặn một số tài khoản và hạn chế xuất hiện trên một số tài khoản nhất định. Một số tài khoản có dấu hiệu lừa đảo hoặc scam có thể chặn, hoặc đơn giản là người dùng không muốn tài khoản đó xuất hiện trên feed

### Comment

Người dùng có thể comment trên bức ảnh của profile mà họ vừa lướt (chưa cần match). 
