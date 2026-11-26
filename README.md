# ML Interactive Lab — Học Máy Cơ bản & Ứng dụng (EE3169)

> **Demo trực tuyến (GitHub Pages):** https://hdung274520.github.io/HCMUT-AnIntroductiontoMachineLearningandApplication/

Ứng dụng web học tập tương tác dành cho học phần **Nhập môn Máy học và Ứng dụng (EE3169 — Đại học Bách khoa TP.HCM / HCMUT)**. Dự án kết hợp tài liệu lý thuyết có công thức KaTeX, **mô phỏng trực quan tương tác bằng HTML5 Canvas**, bài tập mẫu kèm lời giải chi tiết từng bước và trình thực thi **Python trực tiếp trên trình duyệt (Pyodide WebAssembly)** — hoàn toàn tĩnh, không cần cài đặt backend hay môi trường Python cục bộ.

---

## Tính năng nổi bật

- **Lý thuyết tương tác (Interactive Theory):**
  - Trình bày 6 module lý thuyết cốt lõi với công thức toán học sắc nét bằng **KaTeX**.
  - **Mục lục nhảy nhanh** theo đề mục và các thẻ **Kiểm tra nhanh hiểu bài** ngay trong bài đọc.
  - **6 mô phỏng trực quan tương tác HTML5 Canvas** (mỗi module 1 phòng thí nghiệm nhỏ) cho phép kéo tham số, click thêm điểm dữ liệu, từng bước quan sát thuật toán hoạt động theo thời gian thực.
- **Bài tập mẫu & Kiểm chứng 1 chạm:**
  - Mỗi module có các bài toán tính tay từng bước kèm nút **Xem lời giải từng bước** và **Chạy code kiểm chứng →** để mở ngay mã Python tương ứng và tự động thực thi kiểm tra kết quả.
- **Trắc nghiệm củng cố kiến thức:**
  - Chấm điểm tức thì, hiển thị giải thích chi tiết từng câu, theo dõi tiến độ và hỗ trợ làm lại theo module.
- **Python Playground trên trình duyệt (Pyodide WASM):**
  - Biên tập mã nguồn Python với **CodeMirror 5** (highlight cú pháp, thụt lề 4 dấu cách, phím tắt `Ctrl+Enter`).
  - Nạp sẵn **NumPy, Pandas, Scikit-Learn, Matplotlib** và tự động chụp biểu đồ `plt.show()` thành ảnh PNG độ phân giải cao (hỗ trợ phóng to toàn màn hình và tải về).
- **Không gian làm việc linh hoạt:**
  - 3 chế độ hiển thị: **Lý thuyết**, **Playground**, và **Song song (2 cột)** có thanh kéo thay đổi kích thước.
  - Hỗ trợ **Dark / Light Mode**, tìm kiếm nhanh bài học/thuật toán trên thanh bên và thiết kế responsive cho cả desktop lẫn mobile.

---

## Lộ trình 6 Module học phần

| STT | Module | Nội dung Lý thuyết | Mô phỏng tương tác Lý thuyết | Bài tập mẫu & Python Labs |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **Tổng quan & Cơ sở Toán học ML** | AI–ML–DL, Linear Algebra & SVD, Gradient & Hessian, MLE/MAP, Gradient Descent | Mô phỏng quỹ đạo **Gradient Descent 2D** trên đường đồng mức, chọn điểm xuất phát và quan sát hội tụ/phân kỳ theo $\eta$ | BT 1.1 (Gradient & Hessian), BT 1.2 (SVD & Hiệp phương sai), Lab 1.1–1.2 |
| **02** | **Mô hình Tuyến tính** | Linear Regression (Normal Equation, Ridge $L_2$, Lasso $L_1$), Logistic Regression (Sigmoid, BCE, IRLS), Softmax đa lớp | Tab 1: **Linear & Ridge $L_2$** (click thêm điểm/ngoại lai); Tab 2: **Logistic & Sigmoid** (kéo $w_1, w_2, b$) | BT 2.1 (Normal Equation), BT 2.2 (Sigmoid & BCE), Lab 2.1–2.2 |
| **03** | **Phân loại Xác suất & Ranh giới** | Naive Bayes (Gaussian, Multinomial, Bernoulli), Laplace Smoothing, Hard/Soft-Margin SVM, Kernel Trick | Phòng thí nghiệm **SVM SMO**: đổi Kernel (`Linear` / `RBF`), kéo $C$ và $\gamma$, quan sát Support Vectors | BT 3.1 (Spam NB + Laplace), BT 3.2 (Hard-Margin SVM), Lab 3.1–3.2 |
| **04** | **Mạng Nơ-ron & Học sâu** | Perceptron & XOR, MLP & Backpropagation, BatchNorm/Dropout, CNN (`Conv2D`, `MaxPool`), ResNet, R-CNN & YOLO | Tab 1: **Hàm kích hoạt & Vanishing Gradient** qua $L$ tầng; Tab 2: **Conv2D $6\times 6$** tương tác từng pixel | BT 4.1 (XOR bằng Step & ReLU), BT 4.2 (Shape & Params CNN), Lab 4.1–4.2 |
| **05** | **Học không giám sát & Giảm chiều** | K-Means (WCSS, K-Means++, Elbow, Silhouette), GMM & EM, PCA, Truncated SVD, LDA (Fisher) | Tab 1: **K-Means từng bước** (Assign / Update / K-Means++); Tab 2: **Xoay trục chiếu PCA 2D** tối đa hóa phương sai | BT 5.1 (K-Means & WCSS), BT 5.2 (Trị riêng PCA), Lab 5.1–5.2 |
| **06** | **Đánh giá Mô hình & Chủ đề nâng cao** | Đánh đổi Bias–Variance, Recommender Systems (Content-based & Collaborative Filtering), Transfer Learning | Thí nghiệm **Bias–Variance** với hồi quy đa thức (vẽ bóng mờ đa lần lấy mẫu, điều chỉnh bậc $d, \sigma, N, \lambda$) | BT 6.1 (Chẩn đoán Bias–Variance), BT 6.2 (User-based CF), Lab 6.1–6.2 |

---

## Cấu trúc thư mục

```text
Web/
├── index.html                    # Giao diện chính 3 vùng (Rail + Sidebar + Workspace)
├── README.md                     # Tài liệu hướng dẫn dự án
├── css/
│   └── styles.css                # Tùy biến CodeMirror, KaTeX, bảng học thuật & component tương tác
└── js/
    ├── config/
    │   └── tailwind-config.js    # Cấu hình bảng màu Dark/Light & font (IBM Plex Sans, JetBrains Mono)
    ├── core/
    │   ├── editor.js             # Wrapper CodeMirror 5 (Python mode, Tab 4 spaces, Ctrl+Enter)
    │   └── pyodide-runner.js     # Động cơ Pyodide v0.26.4 WASM & hook thu thập ảnh Matplotlib
    ├── data/
    │   ├── module1-math.js       # Dữ liệu Module 1
    │   ├── module2-linear.js     # Dữ liệu Module 2
    │   ├── module3-prob-svm.js   # Dữ liệu Module 3
    │   ├── module4-nn-dl.js      # Dữ liệu Module 4
    │   ├── module5-unsupervised.js # Dữ liệu Module 5
    │   └── module6-advanced.js   # Dữ liệu Module 6
    └── ui/
        ├── app.js                # Bộ điều khiển UI chính, routing module/subtab, quiz & runner
        ├── resizer.js            # Thanh kéo thay đổi độ rộng 2 cột và chiều cao Editor/Output
        └── theory-interactive.js # Mục lục nhanh, quick-check & 6 trình mô phỏng Canvas tương tác
```

---

## Hướng dẫn chạy cục bộ

> **Lưu ý:** Nên phục vụ dự án qua một HTTP server cục bộ (thay vì mở trực tiếp qua `file://`) để trình duyệt nạp WebAssembly của **Pyodide** ổn định và không gặp hạn chế bảo mật CORS.

### Cách 1: Dùng Python (khuyên dùng)

```bash
cd "Web"
python3 -m http.server 8000
```

Sau đó mở trình duyệt tại: `http://localhost:8000`

### Cách 2: Dùng Node.js

```bash
cd "Web"
npx serve .
```

### Cách 3: Dùng VS Code Live Server

Mở thư mục `Web/` trong VS Code, nhấp chuột phải vào `index.html` và chọn **Open with Live Server**.

---

## Phím tắt & Thao tác nhanh

- **`Ctrl + Enter`** (hoặc **`Cmd + Enter`** trên macOS): Thực thi mã Python trong Playground.
- **`Esc`**: Đóng cửa sổ phóng to biểu đồ Matplotlib hoặc đóng ngăn kéo menu trên mobile.
- **Nhấp đúp thanh chia cột** (ở chế độ *Song song 2 cột*): Đặt lại tỷ lệ 50% / 50%.
- **Phím mũi tên `←` / `→`** (khi focus vào thanh chia cột): Điều chỉnh độ rộng hai cột bằng bàn phím.

---

## Công nghệ sử dụng

- **Giao diện & Styling:** HTML5, [Tailwind CSS CDN](https://tailwindcss.com/), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **Hiển thị Toán học:** [KaTeX v0.16.11](https://katex.org/)
- **Trình biên tập & Thực thi Python:** [CodeMirror v5.65.18](https://codemirror.net/5/) & [Pyodide v0.26.4](https://pyodide.org/) (NumPy, Pandas, Scikit-Learn, Matplotlib chạy hoàn toàn phía client qua WebAssembly)
- **Trực quan hóa Lý thuyết:** HTML5 Canvas API thuần (HiDPI, hỗ trợ Dark/Light mode)
