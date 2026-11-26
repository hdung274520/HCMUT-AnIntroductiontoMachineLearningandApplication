/**
 * Dữ liệu Học tập — MODULE 2: MÔ HÌNH TUYẾN TÍNH (LINEAR MODELS)
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 2: MÔ HÌNH TUYẾN TÍNH (LINEAR MODELS)
      // ========================================================================
      {
        id: 'module-2',
        shortLabel: 'M2 • Tuyến tính',
        badge: 'MODULE 02 / 06',
        title: 'Mô hình Tuyến tính (Linear, Logistic & Softmax)',
        subtitle: 'Linear Regression (MSE, Normal Equation, Lasso L1 & Ridge L2), Logistic Regression (Sigmoid, BCE, IRLS) & Softmax đa lớp.',
        tags: ['Linear Regression', 'Lasso L1 / Ridge L2', 'Logistic & Sigmoid', 'Newton-Raphson IRLS', 'Softmax'],
        theoryHtml: String.raw`
          <h3>1. Hồi quy Tuyến tính (Linear Regression) & Chính quy hóa</h3>
          <p>
            Với đầu vào mở rộng $x_i = [1, x_{i1}, \dots, x_{id}]^T \in \mathbb{R}^{d+1}$ (đã gộp hệ số chệch bias $w_0$), mô hình dự đoán đầu ra liên tục $\hat{y}_i = w^T x_i$. Hàm mất mát <strong>Trung bình bình phương sai số (MSE)</strong> trên toàn bộ tập huấn luyện $X \in \mathbb{R}^{N \times (d+1)}$ là:
          </p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$\mathcal{L}_{\text{MSE}}(w) = \frac{1}{2N} \|X w - y\|_2^2 = \frac{1}{2N}\sum_{i=1}^N (w^T x_i - y_i)^2$$
          </div>
          <ul>
            <li><strong>Nghiệm đóng (Normal Equation):</strong> Cho đạo hàm $\nabla_w \mathcal{L}(w) = \frac{1}{N}X^T(Xw - y) = 0$, khi $X^T X$ khả nghịch ta thu được nghiệm chính xác:
              $$w^* = (X^T X)^{-1} X^T y$$
              Nếu số chiều $d$ rất lớn ($d > 10^4$), phép nghịch đảo tốn $O(d^3)$ nên thực tế ưu tiên dùng <strong>Gradient Descent</strong>: $w \leftarrow w - \frac{\eta}{N}X^T(Xw - y)$.
            </li>
            <li><strong>Chống Quá khớp (Overfitting) bằng Regularization:</strong> Khi mô hình đa thức bậc cao hoặc đa cộng tuyến khiến $\|w\|$ phình to, ta cộng thêm thành phần phạt độ lớn trọng số (không phạt hệ số chệch $w_0$):
              <ul>
                <li><strong>Ridge Regression ($L_2$):</strong> $\mathcal{L}_{\text{Ridge}}(w) = \frac{1}{2N}\|Xw - y\|_2^2 + \frac{\lambda}{2}\|w_{1:d}\|_2^2 \implies w^*_{\text{Ridge}} = (X^T X + N\lambda \tilde{I})^{-1}X^T y$ (với $\tilde{I} = \text{diag}(0, 1, \dots, 1)$ để không phạt hệ số chệch $w_0$). Luôn khả nghịch với mọi $\lambda > 0$ và co đều các trọng số về gần $0$.</li>
                <li><strong>Lasso Regression ($L_1$):</strong> $\mathcal{L}_{\text{Lasso}}(w) = \frac{1}{2N}\|Xw - y\|_2^2 + \lambda \|w\|_1$. Do hình học quả cầu chuẩn $L_1$ có các đỉnh nhọn trên trục tọa độ, Lasso ép nhiều trọng số dư thừa <strong>bằng đúng $0$</strong> (nghiệm thưa — tự động chọn lọc đặc trưng <em>Feature Selection</em>).</li>
              </ul>
            </li>
          </ul>

          <h3>2. Hồi quy Logistic (Logistic Regression) cho Phân loại Nhị phân</h3>
          <p>
            Để mô hình hóa xác suất hậu nghiệm $P(y=1 \mid x)$ nằm trong khoảng $(0, 1)$, ta nén tổ hợp tuyến tính $z = w^T x$ qua <strong>Hàm Sigmoid (Logistic)</strong>:
          </p>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}, \qquad \text{đạo hàm: } \sigma'(z) = \sigma(z)\big(1 - \sigma(z)\big)$$
          </div>
          <ul>
            <li><strong>MLE & Binary Cross-Entropy (BCE) Loss:</strong> Giả sử $y_i \mid x_i \sim \text{Bernoulli}(\hat{y}_i)$, cực đại hóa hàm hợp lý tương đương cực tiểu hóa hàm mất mát đối log-likelihood:
              $$\mathcal{L}_{\text{BCE}}(w) = -\frac{1}{N}\sum_{i=1}^N \Big[y_i \log \hat{y}_i + (1 - y_i)\log(1 - \hat{y}_i)\Big], \qquad \nabla_w \mathcal{L}(w) = \frac{1}{N} X^T (\hat{y} - y)$$
            </li>
            <li><strong>Phương pháp Newton-Raphson / IRLS (Iteratively Reweighted Least Squares):</strong> Tận dụng ma trận Hessian $H = \frac{1}{N} X^T R X$ với $R = \text{diag}\big(\hat{y}_i(1-\hat{y}_i)\big)$ xác định dương để hội tụ bậc hai cực nhanh chỉ sau vài vòng lặp:
              $$w^{(t+1)} = w^{(t)} - H^{-1}\nabla \mathcal{L}(w^{(t)}) = w^{(t)} - (X^T R X)^{-1} X^T (\hat{y} - y)$$
            </li>
            <li><strong>Biên quyết định (Decision Boundary):</strong> Dự đoán lớp $1$ khi $\hat{y} \ge 0.5 \iff w^T x + b \ge 0$, tạo thành siêu phẳng tuyến tính chia đôi không gian đặc trưng.</li>
          </ul>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-2"></div>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="0">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Khi tập dữ liệu có nhiều đặc trưng nhiễu dư thừa và cần mô hình tự động triệt tiêu các trọng số vô ích về đúng $0$ (Feature Selection), bạn nên chọn phương pháp điều chuẩn nào?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. Lasso Regression ($L_1$)</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. Ridge Regression ($L_2$)</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. OLS không điều chuẩn</button>
            </div>
            <div class="qc-explain hidden">Quả cầu chuẩn $L_1$ ($\|w\|_1 \le t$) có các đỉnh nhọn nằm ngay trên trục tọa độ nên nghiệm tối ưu thường tiếp xúc tại trục, ép các trọng số không quan trọng về đúng $0$. Trong khi đó Ridge ($L_2$) chỉ co đều trọng số lại gần $0$.</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>

          <h3>3. Hồi quy Softmax (Softmax Regression — Phân loại Đa lớp)</h3>
          <p>Mở rộng Logistic Regression cho $C \ge 3$ lớp loại trừ nhau. Với mỗi lớp $k \in \{1, \dots, C\}$, điểm số tuyến tính là $z_k = w_k^T x$. <strong>Hàm Softmax</strong> chuyển vector điểm số $z \in \mathbb{R}^C$ thành phân phối xác suất chuẩn hóa:</p>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$P(y = k \mid x) = \hat{y}_k = \frac{e^{z_k}}{\sum_{j=1}^C e^{z_j}}, \qquad \mathcal{L}_{\text{CE}}(W) = -\frac{1}{N}\sum_{i=1}^N \sum_{k=1}^C y_{ik} \log \hat{y}_{ik}$$
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Mẹo tính toán ổn định số học (Numerical Stability): Luôn trừ đi $z_{\max} = \max_j z_j$ trên cả tử và mẫu trước khi lấy hàm mũ $e^{z_k - z_{\max}}$ để tránh lỗi tràn số thực (overflow).
          </p>
        `,
        exercises: [
          {
            title: 'Bài tập 2.1: Giải Normal Equation cho Bài toán Dự đoán Giá nhà',
            problemHtml: String.raw`
              Cho dữ liệu 3 căn hộ với diện tích $x$ (chục $\text{m}^2$) và giá bán $y$ (tỷ đồng): $(3, 1.5), (5, 2.6), (7, 3.4)$.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Lập ma trận thiết kế $X$ (có cột hệ số chặn $1$) và giải phương trình chuẩn $w^* = (X^T X)^{-1}X^T y$.</li>
                <li>Dự đoán giá căn hộ diện tích $60\text{ m}^2$ ($x = 6$) và tính sai số MSE trên tập huấn luyện.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1:</strong> Đặt $X = \begin{bmatrix} 1 & 3 \\ 1 & 5 \\ 1 & 7 \end{bmatrix}, \; y = \begin{bmatrix} 1.5 \\ 2.6 \\ 3.4 \end{bmatrix}$. Ta tính:</p>
              $$X^T X = \begin{bmatrix} 3 & 15 \\ 15 & 83 \end{bmatrix}, \quad \det(X^T X) = 3 \times 83 - 15^2 = 24, \quad X^T y = \begin{bmatrix} 7.5 \\ 41.3 \end{bmatrix}$$
              $$w^* = \frac{1}{24}\begin{bmatrix} 83 & -15 \\ -15 & 3 \end{bmatrix}\begin{bmatrix} 7.5 \\ 41.3 \end{bmatrix} = \frac{1}{24}\begin{bmatrix} 3.0 \\ 11.4 \end{bmatrix} = \begin{bmatrix} 0.125 \\ 0.475 \end{bmatrix}$$
              <p>Phương trình hồi quy tuyến tính là $\hat{y} = 0.475x + 0.125$ (tỷ đồng).</p>
              <p><strong>Bước 2:</strong> Với căn hộ $60\text{ m}^2$ ($x=6$): $\hat{y}(6) = 0.475 \times 6 + 0.125 = 2.975$ tỷ đồng. Trên tập huấn luyện, giá trị dự đoán là $\hat{y} = [1.55, 2.50, 3.45]^T$, phần dư $y - \hat{y} = [-0.05, +0.10, -0.05]^T$, nên sai số bình phương trung bình $\text{MSE} = \frac{1}{3}\big((-0.05)^2 + 0.10^2 + (-0.05)^2\big) = \frac{0.015}{3} = \mathbf{0.005}$ (lưu ý nếu tính theo hàm mục tiêu $\mathcal{L}_{\text{MSE}} = \frac{1}{2N}\|Xw-y\|_2^2$ thì giá trị là $0.0025$).</p>
            `,
            verifyCode: String.raw`import numpy as np

X = np.array([[1.0, 3.0], [1.0, 5.0], [1.0, 7.0]])
y = np.array([1.5, 2.6, 3.4])

w_star = np.linalg.inv(X.T @ X) @ (X.T @ y)
y_pred_60 = w_star[0] + w_star[1] * 6.0
mse = np.mean((X @ w_star - y) ** 2)

print(f"Nghiệm Normal Equation: w0 (bias) = {w_star[0]:.4f}, w1 (slope) = {w_star[1]:.4f}")
print(f"Dự đoán giá nhà 60m2 (x=6): {y_pred_60:.4f} tỷ đồng")
print(f"MSE trên tập huấn luyện   : {mse:.6f}")`
          },
          {
            title: 'Bài tập 2.2: Tính Sigmoid, BCE Loss & Biên quyết định Logistic Regression',
            problemHtml: String.raw`
              Mô hình Logistic Regression dự đoán sinh viên Đỗ ($y=1$) hay Trượt ($y=0$) dựa trên $x_1$ (giờ tự học/ngày) và $x_2$ (điểm chuyên cần thang 10) có trọng số $w = [0.8, 0.5]^T$ và $b = -5.2$.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Viết phương trình đường biên quyết định (Decision Boundary) tại ngưỡng $0.5$.</li>
                <li>Sinh viên A có $x = [4, 7]^T$ và thực tế Đỗ ($y=1$). Tính xác suất dự đoán $\hat{y}$ và giá trị tổn thất Binary Cross-Entropy của mẫu này.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>1. Biên quyết định:</strong> Đường biên quyết định ứng với ngưỡng $\hat{y} = 0.5 \iff z = 0 \iff 0.8x_1 + 0.5x_2 - 5.2 = 0 \iff x_2 = -1.6x_1 + 10.4$ (mô hình dự đoán Đỗ khi $\hat{y} \ge 0.5 \iff 0.8x_1 + 0.5x_2 - 5.2 \ge 0$).</p>
              <p><strong>2. Dự đoán &amp; BCE Loss cho sinh viên A ($x_1=4, x_2=7, y=1$):</strong></p>
              $$z = 0.8(4) + 0.5(7) - 5.2 = 3.2 + 3.5 - 5.2 = 1.5$$
              $$\hat{y} = \sigma(1.5) = \frac{1}{1 + e^{-1.5}} \approx 0.8176 \quad (\text{Dự đoán: Đỗ với độ tự tin } 81.76\%)$$
              $$\ell_{\text{BCE}}(y=1, \hat{y}) = -\ln(0.8176) \approx 0.2014$$
            `,
            verifyCode: String.raw`import numpy as np

w = np.array([0.8, 0.5])
b = -5.2
x_A = np.array([4.0, 7.0])
y_A = 1.0

z = float(w @ x_A + b)
y_hat = 1.0 / (1.0 + np.exp(-z))
bce_loss = -(y_A * np.log(y_hat) + (1 - y_A) * np.log(1 - y_hat))

print(f"Điểm tuyến tính z = {z:.4f}")
print(f"Xác suất Đỗ P(y=1|x) = {y_hat:.4f} ({y_hat*100:.2f}%)")
print(f"Binary Cross-Entropy Loss = {bce_loss:.4f}")`
          }
        ],
        quiz: [
          {
            q: 'Đặc điểm nổi bật nhất giúp Lasso Regression (chuẩn phạt L1) khác biệt so với Ridge Regression (chuẩn phạt L2) là gì?',
            options: [
              'Luôn cho nghiệm đóng tường minh chỉ bằng phép nhân ma trận',
              'Có khả năng ép các trọng số kém quan trọng về đúng bằng 0, tạo nghiệm thưa giúp chọn lọc đặc trưng',
              'Không cần sử dụng siêu tham số điều chuẩn λ',
              'Chỉ áp dụng được cho bài toán phân loại ảnh'
            ],
            answer: 1,
            explain: 'Chuẩn L1 có mặt đẳng trị hình thoi với các góc nhọn nằm trên trục tọa độ, nên tiếp điểm với đường đồng mức MSE thường rơi đúng vào trục, triệt tiêu các trọng số dư thừa về 0.'
          },
          {
            q: 'Vì sao không nên dùng hàm mất mát MSE kết hợp trực tiếp với hàm Sigmoid trong Logistic Regression?',
            options: [
              'Vì hàm Sigmoid không khả vi tại z = 0',
              'Vì hàm hợp MSE(σ(w^T x)) trở thành hàm phi lồi (non-convex) với nhiều cực tiểu cục bộ và bị bão hòa đạo hàm',
              'Vì MSE luôn cho giá trị âm',
              'Vì Sigmoid trả về giá trị lớn hơn 100'
            ],
            answer: 1,
            explain: 'Khi ghép MSE với hàm phi tuyến Sigmoid, hàm mục tiêu mất tính lồi. Ngược lại, Binary Cross-Entropy đi từ MLE giữ nguyên tính lồi chặt và có đạo hàm gọn X^T(ŷ - y).'
          },
          {
            q: 'Trong Softmax Regression với C lớp, tổng các xác suất đầu ra P(y = k | x) từ k = 1 đến C luôn bằng bao nhiêu?',
            options: ['0', '0.5', '1', 'C'],
            answer: 2,
            explain: 'Mẫu số của hàm Softmax chuẩn hóa tổng các hàm mũ trên toàn bộ C lớp nên vector xác suất đầu ra luôn có các phần tử dương và tổng bằng đúng 1.'
          }
        ],
        labs: [
          {
            title: 'Lab 2.1: Dự đoán Giá nhà (Linear, Ridge L2 & Lasso L1 Regression)',
            code: String.raw`# ==============================================================================
# MODULE 2 - LAB 2.1: DỰ ĐOÁN GIÁ NHÀ VỚI LINEAR, RIDGE (L2) & LASSO (L1)
# ==============================================================================
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, r2_score

np.random.seed(42)

# 1. Tạo dữ liệu thực tế mô phỏng 180 căn hộ (kèm 2 đặc trưng nhiễu dư thừa để kiểm tra Lasso!)
n_samples = 180
dien_tich = np.random.uniform(35, 160, n_samples)          # m2 (quan trọng mạnh)
so_phong = np.round(dien_tich / 32 + np.random.normal(0, 0.4, n_samples)).clip(1, 6)
kc_trung_tam = np.random.uniform(1.0, 18.0, n_samples)     # km (tác động âm)
tuoi_nha = np.random.uniform(0, 25, n_samples)             # năm (tác động âm nhẹ)
nhieu_1 = np.random.normal(0, 10, n_samples)               # Đặc trưng nhiễu không liên quan
nhieu_2 = np.random.uniform(-5, 5, n_samples)              # Đặc trưng nhiễu không liên quan

# Giá nhà thực tế (tỷ VNĐ)
gia_nha = (0.055 * dien_tich + 0.35 * so_phong - 0.16 * kc_trung_tam
           - 0.04 * tuoi_nha + 0.8 + np.random.normal(0, 0.32, n_samples))

feature_names = ['Diện tích (m²)', 'Số phòng ngủ', 'Cách TT (km)', 'Tuổi nhà', 'Nhiễu 1', 'Nhiễu 2']
df = pd.DataFrame(np.column_stack([dien_tich, so_phong, kc_trung_tam, tuoi_nha, nhieu_1, nhieu_2]),
                  columns=feature_names)

X_train, X_test, y_train, y_test = train_test_split(df.values, gia_nha, test_size=0.25, random_state=42)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# 2. Giải bằng Normal Equation (NumPy thuần) vs Scikit-Learn Models
X_b = np.c_[np.ones(len(X_train_sc)), X_train_sc]
w_normal = np.linalg.pinv(X_b.T @ X_b) @ (X_b.T @ y_train)

models = {
    'Linear (OLS)': LinearRegression(),
    'Ridge (L2, α=8.0)': Ridge(alpha=8.0),
    'Lasso (L1, α=0.12)': Lasso(alpha=0.12, random_state=42)
}

print("=== KẾT QUẢ DỰ ĐOÁN GIÁ NHÀ (ĐƠN VỊ: TỶ VNĐ) ===")
print(f"Hệ số chệch (Intercept) từ Normal Equation: {w_normal[0]:.4f}\n")

coef_records = {}
for name, model in models.items():
    model.fit(X_train_sc, y_train)
    preds = model.predict(X_test_sc)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    coef_records[name] = model.coef_
    print(f"{name:20s} | Test RMSE = {rmse:.4f} tỷ | R² = {r2:.4f}")

print("\nSo sánh trọng số học được (chú ý Lasso triệt tiêu Nhiễu 1 & Nhiễu 2 về đúng 0):")
coef_df = pd.DataFrame(coef_records, index=feature_names).round(4)
print(coef_df)

# 3. Trực quan hóa Dự đoán vs Thực tế & Trọng số L1/L2
fig, axes = plt.subplots(1, 2, figsize=(11.2, 4.3))

best_preds = models['Lasso (L1, α=0.12)'].predict(X_test_sc)
axes[0].scatter(y_test, best_preds, color='#4f46e5', alpha=0.75, edgecolors='white', s=55)
lims = [min(y_test.min(), best_preds.min()) - 0.3, max(y_test.max(), best_preds.max()) + 0.3]
axes[0].plot(lims, lims, '--', color='#ef4444', linewidth=1.8, label='Dự đoán hoàn hảo (y = ŷ)')
axes[0].set_title('Giá nhà Thực tế vs Dự đoán (Tập Test)')
axes[0].set_xlabel('Giá thực tế (Tỷ VNĐ)')
axes[0].set_ylabel('Giá dự đoán (Tỷ VNĐ)')
axes[0].legend(fontsize=8)
axes[0].grid(alpha=0.3)

x_pos = np.arange(len(feature_names))
width = 0.26
axes[1].bar(x_pos - width, coef_records['Linear (OLS)'], width, label='OLS', color='#64748b')
axes[1].bar(x_pos, coef_records['Ridge (L2, α=8.0)'], width, label='Ridge (L2)', color='#0ea5e9')
axes[1].bar(x_pos + width, coef_records['Lasso (L1, α=0.12)'], width, label='Lasso (L1)', color='#10b981')
axes[1].axhline(0, color='black', linewidth=0.8)
axes[1].set_xticks(x_pos)
axes[1].set_xticklabels(feature_names, rotation=22, ha='right', fontsize=8)
axes[1].set_title('Trọng số Đặc trưng: Lasso tự động loại bỏ nhiễu')
axes[1].set_ylabel('Giá trị trọng số (sau chuẩn hóa)')
axes[1].legend(fontsize=8)
axes[1].grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 2.2: Dự đoán Kết quả thi & Lọc điểm (Logistic & Softmax Regression)',
            code: String.raw`# ==============================================================================
# MODULE 2 - LAB 2.2: DỰ ĐOÁN KẾT QUẢ THI (LOGISTIC & SOFTMAX REGRESSION)
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

np.random.seed(7)

# 1. Tạo dữ liệu 160 sinh viên: [Giờ tự học/tuần, Điểm bài tập quá trình]
n = 160
gio_hoc = np.random.uniform(1.0, 14.0, n)
diem_qt = np.random.uniform(2.5, 9.8, n)
X = np.column_stack([gio_hoc, diem_qt])

# Điểm tổng kết ẩn quyết định kết quả thi
score_latent = 0.65 * gio_hoc + 0.9 * diem_qt - 9.2 + np.random.normal(0, 1.1, n)
y_binary = (score_latent >= 0).astype(int)  # 0: Trượt, 1: Đỗ

# Phân loại 3 mức học lực cho Softmax Regression: 0: Cần cố gắng, 1: Đạt/Khá, 2: Xuất sắc
y_multi = np.digitize(score_latent, bins=[-1.2, 2.2])

# 2. Huấn luyện Logistic Regression (Nhị phân) & Softmax Regression (Đa lớp)
clf_bin = LogisticRegression()
clf_bin.fit(X, y_binary)

clf_soft = LogisticRegression(C=1.5, max_iter=500)
clf_soft.fit(X, y_multi)

print("=== 1. LOGISTIC REGRESSION (DỰ ĐOÁN ĐỖ / TRƯỢT) ===")
w1, w2 = clf_bin.coef_[0]
b = clf_bin.intercept_[0]
print(f"Phương trình biên quyết định: {w1:.3f}*Giờ_học + {w2:.3f}*Điểm_QT + ({b:.3f}) = 0")
print(f"Độ chính xác phân loại Đỗ/Trượt: {accuracy_score(y_binary, clf_bin.predict(X))*100:.2f}%")

# Dự đoán thử cho 2 sinh viên mới
sv_moi = np.array([[3.5, 4.5], [9.0, 8.0]])
probs = clf_bin.predict_proba(sv_moi)[:, 1]
for i, (gh, qt) in enumerate(sv_moi):
    ket_qua = "ĐỖ" if probs[i] >= 0.5 else "TRƯỢT"
    print(f" -> SV {i+1} ({gh}h/tuần, ĐQT {qt}): Xác suất Đỗ = {probs[i]*100:.1f}% => {ket_qua}")

print("\n=== 2. SOFTMAX REGRESSION (XẾP LOẠI 3 MỨC HỌC LỰC) ===")
print(classification_report(y_multi, clf_soft.predict(X),
                            target_names=['Cần cố gắng', 'Đạt / Khá', 'Xuất sắc']))

# 3. Trực quan hóa Biên quyết định (Decision Boundary) cho cả 2 mô hình
xx, yy = np.meshgrid(np.linspace(0.5, 14.5, 220), np.linspace(2.0, 10.2, 220))
grid = np.c_[xx.ravel(), yy.ravel()]

fig, axes = plt.subplots(1, 2, figsize=(11.2, 4.4))

# Biểu đồ trái: Xác suất Sigmoid & Đường ranh giới P=0.5
prob_grid = clf_bin.predict_proba(grid)[:, 1].reshape(xx.shape)
cf1 = axes[0].contourf(xx, yy, prob_grid, levels=20, cmap='RdYlGn', alpha=0.35)
axes[0].contour(xx, yy, prob_grid, levels=[0.5], colors='#0f172a', linewidths=2.2)
axes[0].scatter(X[y_binary==0, 0], X[y_binary==0, 1], c='#ef4444', edgecolors='k', s=38, label='Trượt (0)')
axes[0].scatter(X[y_binary==1, 0], X[y_binary==1, 1], c='#10b981', edgecolors='k', s=38, marker='^', label='Đỗ (1)')
axes[0].set_title('Logistic Regression: Biên quyết định P(Đỗ)=0.5')
axes[0].set_xlabel('Giờ tự học mỗi tuần')
axes[0].set_ylabel('Điểm quá trình')
axes[0].legend(loc='lower right', fontsize=8)

# Biểu đồ phải: Miền phân vùng đa lớp Softmax Regression
pred_multi = clf_soft.predict(grid).reshape(xx.shape)
axes[1].contourf(xx, yy, pred_multi, levels=[-0.5, 0.5, 1.5, 2.5],
                 colors=['#fecaca', '#bfdbfe', '#bbf7d0'], alpha=0.65)
colors_map = ['#dc2626', '#2563eb', '#16a34a']
labels_map = ['Cần cố gắng', 'Đạt / Khá', 'Xuất sắc']
for cls_idx in range(3):
    mask = (y_multi == cls_idx)
    axes[1].scatter(X[mask, 0], X[mask, 1], c=colors_map[cls_idx], edgecolors='k', s=38, label=labels_map[cls_idx])
axes[1].set_title('Softmax Regression: Phân vùng 3 lớp học lực')
axes[1].set_xlabel('Giờ tự học mỗi tuần')
axes[1].set_ylabel('Điểm quá trình')
axes[1].legend(loc='lower right', fontsize=8)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
