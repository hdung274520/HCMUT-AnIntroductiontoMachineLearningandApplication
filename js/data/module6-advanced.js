/**
 * Dữ liệu Học tập — MODULE 6: ĐÁNH GIÁ MÔ HÌNH & CHỦ ĐỀ NÂNG CAO
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 6: ĐÁNH GIÁ MÔ HÌNH & CHỦ ĐỀ NÂNG CAO
      // ========================================================================
      {
        id: 'module-6',
        shortLabel: 'M6 • Nâng cao',
        badge: 'MODULE 06 / 06',
        title: 'Đánh giá Mô hình & Chủ đề Nâng cao',
        subtitle: 'Đánh đổi Bias–Variance, Hệ thống gợi ý (Content-based & Collaborative Filtering) và Học chuyển giao (Transfer Learning).',
        tags: ['Bias-Variance Trade-off', 'Underfitting / Overfitting', 'Content-based RecSys', 'Collaborative Filtering', 'Transfer Learning'],
        theoryHtml: String.raw`
          <h3>1. Đánh đổi Độ chệch – Phương sai (Bias–Variance Trade-off)</h3>
          <p>
            Giả sử dữ liệu sinh từ quy luật thực $y = f(x) + \epsilon$ với nhiễu $\mathbb{E}[\epsilon]=0, \text{Var}(\epsilon)=\sigma_\epsilon^2$. Kỳ vọng sai số dự đoán bình phương của mô hình $\hat{f}_{\mathcal{D}}(x)$ khi lấy trung bình trên các tập huấn luyện $\mathcal{D}$ phân rã thành 3 thành phần:
          </p>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$\mathbb{E}_{\mathcal{D}, \epsilon}\Big[\big(y - \hat{f}_{\mathcal{D}}(x)\big)^2\Big] = \underbrace{\Big(\mathbb{E}_{\mathcal{D}}[\hat{f}_{\mathcal{D}}(x)] - f(x)\Big)^2}_{\text{Bias}^2 \text{ (Độ chệch bình phương)}} + \underbrace{\mathbb{E}_{\mathcal{D}}\Big[\big(\hat{f}_{\mathcal{D}}(x) - \mathbb{E}_{\mathcal{D}}[\hat{f}_{\mathcal{D}}(x)]\big)^2\Big]}_{\text{Variance (Phương sai)}} + \underbrace{\sigma_\epsilon^2}_{\text{Sai số tối thiểu}}$$
          </div>
          <ul>
            <li><strong>High Bias — Underfitting (Chưa khớp):</strong> Mô hình quá đơn giản (ví dụ dùng đường thẳng bậc $1$ khớp hàm hình sin), dẫn đến cả <em>Train Error và Validation Error đều cao</em>. Khắc phục: tăng độ phức tạp mô hình, bổ sung đặc trưng phi tuyến, giảm hệ số điều chuẩn $\lambda$.</li>
            <li><strong>High Variance — Overfitting (Quá khớp):</strong> Mô hình quá phức tạp (đa thức bậc quá cao, mạng sâu không điều chuẩn trên ít dữ liệu), học thuộc lòng cả nhiễu nên <em>Train Error cực thấp nhưng Validation Error vọt rất cao</em>. Khắc phục: thu thập thêm dữ liệu, Regularization ($L_1, L_2$, Dropout), Early Stopping, dùng $K$-Fold Cross-Validation để chọn siêu tham số tại điểm cân bằng tối ưu.</li>
          </ul>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-6"></div>

          <h3>2. Hệ thống Gợi ý (Recommender Systems)</h3>
          <ul>
            <li><strong>Content-based Filtering (Lọc dựa trên nội dung):</strong> Biểu diễn mỗi sản phẩm/bài viết bởi vector đặc trưng nội dung $\mathbf{x}_i$ (TF-IDF mô tả, thể loại, nhãn kỹ thuật) và xây dựng hồ sơ sở thích người dùng $\mathbf{u}_u$ từ lịch sử họ đã thích. Gợi ý các mục chưa xem có độ tương đồng Cosine cao nhất:
              $$\text{sim}(\mathbf{u}_u, \mathbf{x}_i) = \frac{\mathbf{u}_u \cdot \mathbf{x}_i}{\|\mathbf{u}_u\|_2 \|\mathbf{x}_i\|_2}$$
              <em>Ưu điểm:</em> Gợi ý được ngay sản phẩm mới (không bị Item Cold-start). <em>Hạn chế:</em> Khó gợi ý đa dạng ngoài vùng sở thích quen thuộc.
            </li>
            <li><strong>Collaborative Filtering (Lọc cộng tác):</strong> Khai thác trí tuệ đám đông từ ma trận đánh giá thưa User–Item $R \in \mathbb{R}^{M \times N}$ mà không cần biết siêu dữ liệu sản phẩm:
              <ul>
                <li><strong>Neighborhood-based (User-based / Item-based CF):</strong> Chuẩn hóa trung bình đánh giá của từng người dùng và dự đoán ô khuyết dựa trên trung bình có trọng số tương đồng Pearson / Cosine của $k$ láng giềng gần nhất.</li>
                <li><strong>Matrix Factorization (SVD / Latent Factor Models):</strong> Xấp xỉ hạng thấp $R \approx P Q^T$ ($P \in \mathbb{R}^{M \times k}, Q \in \mathbb{R}^{N \times k}$), dự đoán $\hat{r}_{ui} = \mu + b_u + b_i + p_u^T q_i$ bằng SGD hoặc ALS.</li>
              </ul>
            </li>
          </ul>

          <h3>3. Học Chuyển giao (Transfer Learning)</h3>
          <p>
            Thay vì huấn luyện mạng nơ-ron sâu hàng triệu tham số từ đầu (<em>from scratch</em>) trên tập dữ liệu đích nhỏ dễ gây Overfitting nặng, <strong>Transfer Learning</strong> tái sử dụng trọng số từ mô hình nguồn đã tiền huấn luyện trên kho dữ liệu khổng lồ (như ResNet/ViT trên ImageNet hoặc BERT/GPT trên văn bản lớn):
          </p>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$\text{Backbone tiền huấn luyện } f_{\theta_{\text{source}}}(x) \xrightarrow{\text{Chuyển giao tri thức}} \text{Classifier mới } g_{\phi}\big(f_{\theta}(x)\big)$$
          </div>
          <ul>
            <li><strong>Feature Extraction (Trích xuất đặc trưng):</strong> <em>Đóng băng (Freeze)</em> toàn bộ trọng số các tầng tích chập gốc $\theta_{\text{source}}$ (vốn đã học tốt cạnh, góc, hình khối tổng quát), chỉ huấn luyện tầng phân loại cuối $\phi$. Cực nhanh và an toàn khi tập dữ liệu đích rất nhỏ.</li>
            <li><strong>Fine-tuning (Tinh chỉnh):</strong> Mở khóa (<em>Unfreeze</em>) các tầng sâu phía cuối (hoặc toàn mạng) và cập nhật đồng thời với <strong>tốc độ học rất nhỏ</strong> ($\eta \approx 10^{-5} \div 10^{-4}$) để tinh chỉnh đặc trưng cấp cao thích ứng với miền dữ liệu chuyên biệt (ví dụ ảnh X-quang y tế) mà không phá hủy tri thức nền (<em>Catastrophic Forgetting</em>).</li>
          </ul>
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Mẹo thực tế: Nếu dữ liệu đích nhỏ nhưng <em>khác miền</em> so với ảnh tự nhiên (ví dụ ảnh vệ tinh, X-quang), có thể giữ nguyên vài tầng đầu trích xuất cạnh/vân và chỉ Fine-tune các khối sâu cuối cùng.
          </p>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="0">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Bạn có chỉ $250$ ảnh chó và mèo (rất giống miền dữ liệu ImageNet). Cách dùng Transfer Learning nào an toàn và ít bị Overfitting nhất?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. Feature Extraction (đóng băng backbone, chỉ train classifier head)</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. Mở khóa toàn bộ ResNet và train với $\eta = 0.05$</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. Khởi tạo ngẫu nhiên toàn bộ mạng từ đầu</button>
            </div>
            <div class="qc-explain hidden">Với tập đích rất nhỏ ($250$ ảnh) và cùng miền với ImageNet, đóng băng các tầng trích xuất đặc trưng gốc tránh Overfitting và tránh làm hỏng trọng số tiền huấn luyện (Catastrophic Forgetting).</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>
        `,
        exercises: [
          {
            title: 'Bài tập 6.1: Chẩn đoán Bias – Variance từ Sai số Huấn luyện & Kiểm định',
            problemHtml: String.raw`
              Trong bài toán nhận dạng ảnh y khoa (sai số tối ưu của bác sĩ chuyên gia là $\approx 2\%$), ba mô hình thu được kết quả sau:
              <ul class="mt-1">
                <li><strong>Mô hình A:</strong> Train Error = $18.5\%$, Validation Error = $19.2\%$.</li>
                <li><strong>Mô hình B:</strong> Train Error = $1.8\%$, Validation Error = $14.6\%$.</li>
                <li><strong>Mô hình C:</strong> Train Error = $2.4\%$, Validation Error = $3.1\%$.</li>
              </ul>
              Hãy chẩn đoán trạng thái từng mô hình theo Bias–Variance và đề xuất giải pháp cải thiện cho A và B.
            `,
            solutionHtml: String.raw`
              <ul>
                <li><strong>Mô hình A — High Bias (Underfitting):</strong> Sai số huấn luyện ($18.5\%$) cao vượt xa mức chuyên gia ($2\%$), khoảng cách Train–Val rất nhỏ ($0.7\%$). <em>Giải pháp:</em> Tăng dung lượng mạng (sâu hơn/nhiều nơ-ron hơn), huấn luyện thêm epoch, hoặc dùng Transfer Learning thay vì mô hình nông.</li>
                <li><strong>Mô hình B — High Variance (Overfitting):</strong> Train Error đạt $1.8\%$ rất thấp nhưng Validation Error vọt lên $14.6\%$ (độ vênh $12.8\%$). <em>Giải pháp:</em> Tăng cường dữ liệu (Data Augmentation), thêm Dropout / L2 Weight Decay, hoặc đóng băng bớt các tầng đầu.</li>
                <li><strong>Mô hình C — Cân bằng tối ưu (Good Fit):</strong> Cả Train Error và Validation Error đều sát ngưỡng tối ưu Bayes, khái quát hóa tốt!</li>
              </ul>
            `,
            verifyCode: String.raw`models = [
    ("Mô hình A", 18.5, 19.2),
    ("Mô hình B",  1.8, 14.6),
    ("Mô hình C",  2.4,  3.1)
]
human_level = 2.0

for name, tr_err, val_err in models:
    avoidable_bias = max(0.0, tr_err - human_level)
    variance_gap = val_err - tr_err
    if avoidable_bias > 5.0:
        status = "HIGH BIAS (Underfitting)"
    elif variance_gap > 5.0:
        status = "HIGH VARIANCE (Overfitting)"
    else:
        status = "CÂN BẰNG TỐI ƯU (Well-generalized)"
    print(f"{name}: Bias khả giảm ≈ {avoidable_bias:4.1f}% | Chênh lệch Variance ≈ {variance_gap:4.1f}% => {status}")`
          },
          {
            title: 'Bài tập 6.2: Dự đoán điểm đánh giá sản phẩm bằng User-based Collaborative Filtering',
            problemHtml: String.raw`
              Cho vector độ lệch đánh giá đã trừ trung bình người dùng (Centered Ratings, trích trên 4 sản phẩm đang xét trong một danh mục lớn hơn) của người dùng mục tiêu $U_1 = [2, -2, 1, \text{?}]$ và hai người dùng láng giềng $U_2 = [2, -1, 2, 1.5]$, $U_3 = [-2, 2, -1, -1.8]$. Tính độ tương đồng Cosine trên 3 sản phẩm chung và dự đoán điểm độ lệch tại sản phẩm thứ $4$ cho $U_1$.
            `,
            solutionHtml: String.raw`
              <p>Xét 3 sản phẩm đầu đã biết chung: $u_1 = [2, -2, 1]$, $\|u_1\|_2 = \sqrt{4+4+1} = 3$.</p>
              <ul>
                <li>Với $U_2$ ($u_2 = [2,-1,2], \|u_2\|_2 = 3$): $\text{sim}(U_1, U_2) = \frac{2(2) + (-2)(-1) + 1(2)}{3 \times 3} = \frac{8}{9} \approx +0.8889$ (rất tương đồng).</li>
                <li>Với $U_3$ ($u_3 = [-2,2,-1], \|u_3\|_2 = 3$): $\text{sim}(U_1, U_3) = \frac{-4 - 4 - 1}{9} = -1.0$ (gu hoàn toàn trái ngược).</li>
              </ul>
              <p>Nếu tổng hợp có trọng số tuyệt đối theo cả tương đồng âm/dương:
              $$\hat{r}_{1,4} = \frac{\frac{8}{9} \times 1.5 + (-1) \times (-1.8)}{\left|\frac{8}{9}\right| + |-1|} = \frac{\frac{4}{3} + 1.8}{\frac{17}{9}} = \frac{141}{85} \approx +1.6588$$
              (Hoặc nếu chỉ lọc láng giềng cùng gu $s > 0$: $\hat{r}_{1,4} = +1.5$). Độ lệch dương cao cho thấy $U_1$ sẽ rất thích sản phẩm thứ 4!</p>
            `,
            verifyCode: String.raw`import numpy as np

u1 = np.array([2.0, -2.0, 1.0])
u2, r2_item4 = np.array([2.0, -1.0, 2.0]), 1.5
u3, r3_item4 = np.array([-2.0, 2.0, -1.0]), -1.8

sim12 = float(u1 @ u2) / (np.linalg.norm(u1) * np.linalg.norm(u2))
sim13 = float(u1 @ u3) / (np.linalg.norm(u1) * np.linalg.norm(u3))
pred_dev = (sim12 * r2_item4 + sim13 * r3_item4) / (abs(sim12) + abs(sim13))

print(f"Cosine Similarity(U1, U2) = {sim12:+.4f}")
print(f"Cosine Similarity(U1, U3) = {sim13:+.4f}")
print(f"Dự đoán độ lệch điểm sản phẩm 4 của U1: {pred_dev:+.4f} (Nên gợi ý!)")`
          }
        ],
        quiz: [
          {
            q: 'Khi tăng bậc của mô hình hồi quy đa thức từ bậc 1 lên bậc 15 trên một tập huấn luyện nhỏ có nhiễu, đại lượng nào dưới đây tăng mạnh gây ra Overfitting?',
            options: [
              'Bias^2 (Độ chệch bình phương)',
              'Variance (Phương sai của mô hình giữa các tập mẫu huấn luyện)',
              'Kích thước tập dữ liệu kiểm thử',
              'Hệ số điều chuẩn Ridge'
            ],
            answer: 1,
            explain: 'Khi độ phức tạp mô hình tăng cao, Bias giảm mạnh nhưng mô hình uốn lượn nhạy cảm theo từng điểm nhiễu của tập huấn luyện, khiến Variance tăng vọt.'
          },
          {
            q: 'Khi tập dữ liệu đích rất nhỏ (chỉ vài trăm ảnh) nhưng có tính chất gần giống tập dữ liệu nguồn ImageNet, chiến lược Transfer Learning nào phù hợp và an toàn nhất?',
            options: [
              'Khởi tạo ngẫu nhiên toàn bộ ResNet-50 và huấn luyện từ đầu với learning rate lớn',
              'Feature Extraction: Đóng băng (freeze) các tầng trích xuất đặc trưng của mạng tiền huấn luyện và chỉ huấn luyện tầng phân loại tuyến tính ở cuối',
              'Xóa bỏ tất cả các tầng tích chập đầu tiên',
              'Chỉ dùng thuật toán K-Means'
            ],
            answer: 1,
            explain: 'Với dữ liệu đích ít và cùng miền tự nhiên, đóng băng Backbone giữ nguyên các bộ trích xuất đặc trưng chất lượng cao và tránh Overfitting khi số tham số cần học chỉ còn ở tầng cuối.'
          },
          {
            q: 'Hệ thống gợi ý Content-based Filtering khác với Collaborative Filtering ở điểm căn bản nào?',
            options: [
              'Content-based dựa trên đặc trưng mô tả sản phẩm và hồ sơ riêng của từng người dùng, trong khi Collaborative Filtering khai thác ma trận hành vi đánh giá chéo giữa nhiều người dùng và sản phẩm',
              'Content-based không thể gợi ý sản phẩm mới chưa có ai mua',
              'Collaborative Filtering bắt buộc phải đọc nội dung hình ảnh sản phẩm',
              'Cả hai thuật toán đều không dùng tích vô hướng hoặc Cosine Similarity'
            ],
            answer: 0,
            explain: 'Content-based khớp đặc trưng nội dung item với lịch sử của chính user đó; Collaborative Filtering tìm mẫu tương đồng hành vi giữa cộng đồng users và items.'
          }
        ],
        labs: [
          {
            title: 'Lab 6.1: Thực nghiệm Đánh đổi Bias vs Variance theo Độ phức tạp Mô hình',
            code: String.raw`# ==============================================================================
# MODULE 6 - LAB 6.1: ĐÁNH GIÁ ĐỘ PHỨC TẠP MÔ HÌNH & PHÂN RÃ BIAS - VARIANCE
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error

np.random.seed(42)

# Hàm quy luật thực sự f(x) = sin(1.5 * pi * x)
def true_fn(x):
    return np.sin(1.5 * np.pi * x)

x_eval = np.linspace(0, 1, 120)
y_true_eval = true_fn(x_eval)
noise_std = 0.25

# 1. Mô phỏng Monte Carlo trên 60 tập huấn luyện độc lập (mỗi tập 22 điểm) để đo thực tế Bias² & Variance!
degrees = list(range(1, 11))
n_trials = 60
n_train = 22

bias_sq_list, var_list, train_err_list, val_err_list = [], [], [], []
sample_curves = {1: [], 3: [], 10: []}

for deg in degrees:
    preds_matrix = np.zeros((n_trials, len(x_eval)))
    tr_mses, val_mses = [], []

    for t in range(n_trials):
        x_tr = np.sort(np.random.uniform(0, 1, n_train))
        y_tr = true_fn(x_tr) + np.random.normal(0, noise_std, n_train)
        x_val = np.random.uniform(0, 1, 80)
        y_val = true_fn(x_val) + np.random.normal(0, noise_std, 80)

        model = make_pipeline(PolynomialFeatures(deg), LinearRegression())
        model.fit(x_tr[:, None], y_tr)

        preds_eval = model.predict(x_eval[:, None])
        preds_matrix[t] = np.clip(preds_eval, -3.0, 3.0)
        tr_mses.append(mean_squared_error(y_tr, model.predict(x_tr[:, None])))
        val_mses.append(np.clip(mean_squared_error(y_val, model.predict(x_val[:, None])), 0, 2.0))

        if deg in sample_curves and t < 8:
            sample_curves[deg].append(preds_matrix[t])

    mean_pred = preds_matrix.mean(axis=0)
    bias_sq = np.mean((mean_pred - y_true_eval) ** 2)
    variance = np.mean(np.var(preds_matrix, axis=0))

    bias_sq_list.append(bias_sq)
    var_list.append(variance)
    train_err_list.append(np.mean(tr_mses))
    val_err_list.append(np.mean(val_mses))

print("=== BẢNG PHÂN TÍCH ĐỘ PHỨC TẠP ĐA THỨC (BIAS² vs VARIANCE) ===")
for idx in [0, 1, 2, 3, 6, 9]:
    d = degrees[idx]
    print(f"Bậc {d:2d} | Bias² = {bias_sq_list[idx]:.4f} | Variance = {var_list[idx]:.4f} | Train MSE = {train_err_list[idx]:.4f} | Val MSE = {val_err_list[idx]:.4f}")

best_deg = degrees[int(np.argmin(val_err_list))]
print(f"\n=> Độ phức tạp cân bằng tối ưu: Đa thức bậc {best_deg} (Validation MSE thấp nhất!)")

# 2. Trực quan hóa: (Trái) Bậc 1 Underfit vs Bậc 3 Optimal vs Bậc 10 Overfit, (Phải) Đường cong Bias-Variance
fig, axes = plt.subplots(1, 2, figsize=(11.6, 4.4))

for curve in sample_curves[1]:
    axes[0].plot(x_eval, curve, color='#ef4444', alpha=0.22, linewidth=1)
for curve in sample_curves[3]:
    axes[0].plot(x_eval, curve, color='#10b981', alpha=0.35, linewidth=1.3)
for curve in sample_curves[10][:4]:
    axes[0].plot(x_eval, curve, color='#f59e0b', alpha=0.28, linestyle='--', linewidth=1)

axes[0].plot(x_eval, y_true_eval, color='#0f172a', linewidth=2.5, label='Hàm gốc f(x) = sin(1.5πx)')
axes[0].plot([], [], color='#ef4444', label='Bậc 1: High Bias (Underfit)')
axes[0].plot([], [], color='#10b981', label='Bậc 3: Cân bằng tối ưu')
axes[0].plot([], [], color='#f59e0b', linestyle='--', label='Bậc 10: High Variance (Overfit)')
axes[0].set_ylim(-1.8, 1.8)
axes[0].set_title('Sự biến động mô hình qua các tập huấn luyện')
axes[0].set_xlabel('x')
axes[0].set_ylabel('y')
axes[0].legend(fontsize=7.8, loc='lower left')
axes[0].grid(alpha=0.3)

axes[1].plot(degrees, bias_sq_list, 'o-', color='#2563eb', linewidth=2, label='Bias² (Độ chệch²)')
axes[1].plot(degrees, var_list, 's-', color='#f97316', linewidth=2, label='Variance (Phương sai)')
axes[1].plot(degrees, train_err_list, '^--', color='#64748b', linewidth=1.6, label='Train MSE')
axes[1].plot(degrees, np.array(bias_sq_list) + np.array(var_list) + noise_std**2, 'd-', color='#dc2626', linewidth=2.2, label='Tổng sai số kỳ vọng')
axes[1].axvline(best_deg, color='#10b981', linestyle=':', linewidth=2, label=f'Điểm tối ưu (Bậc {best_deg})')
axes[1].set_ylim(0, 0.75)
axes[1].set_title('Đường cong Đánh đổi Bias – Variance')
axes[1].set_xlabel('Độ phức tạp mô hình (Bậc đa thức d)')
axes[1].set_ylabel('Mean Squared Error')
axes[1].legend(fontsize=7.8)
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 6.2: Hệ thống Gợi ý Sản phẩm (Content + CF) & Transfer Learning',
            code: String.raw`# ==============================================================================
# MODULE 6 - LAB 6.2: HỆ THỐNG GỢI Ý SẢN PHẨM & MINH HỌA TRANSFER LEARNING
# ==============================================================================
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

np.random.seed(42)

# ==============================================================================
# PHẦN 1: HỆ THỐNG GỢI Ý SẢN PHẨM CÔNG NGHỆ (CONTENT-BASED + COLLABORATIVE SVD)
# ==============================================================================
items = [
    ("SP01: Laptop AI GPU RTX",        "laptop gpu nvidia deep learning python cuda ram"),
    ("SP02: MacBook Air M3",           "laptop apple mỏng nhẹ pin lâu lập trình web văn phòng"),
    ("SP03: Bàn phím Cơ Wireless",     "phụ kiện bàn phím cơ gõ code bluetooth lập trình"),
    ("SP04: Màn hình 4K Đồ họa",       "màn hình 4k ips thiết kế lập trình phụ kiện"),
    ("SP05: Sách Toán Machine Learning","sách toán đại số giải tích python machine learning"),
    ("SP06: Khóa học Deep Learning",   "khóa học python neural network gpu deep learning")
]
item_titles = [it[0] for it in items]
item_tags   = [it[1] for it in items]

# 1A. Content-Based Filtering bằng TF-IDF + Cosine Similarity
tfidf = TfidfVectorizer()
item_vecs = tfidf.fit_transform(item_tags)
content_sim = cosine_similarity(item_vecs)

liked_idx = 0  # Giả sử người dùng vừa xem/mua "SP01: Laptop AI GPU RTX"
sim_scores = list(enumerate(content_sim[liked_idx]))
sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:4]

print("=== 1A. CONTENT-BASED FILTERING (TF-IDF + COSINE SIMILARITY) ===")
print(f"Người dùng quan tâm: [{item_titles[liked_idx]}]")
for idx, sc in sim_scores:
    print(f" -> Gợi ý tương tự : {item_titles[idx]:32s} | Độ tương đồng Cosine = {sc:.4f}")

# 1B. Collaborative Filtering bằng Matrix Factorization (SVD trên ma trận User-Item)
# Ma trận đánh giá 5 người dùng x 6 sản phẩm (0 = chưa đánh giá)
R = np.array([
    [5.0, 3.0, 4.0, 0.0, 5.0, 0.0],  # User 0 (cần gợi ý SP04 vs SP06!)
    [5.0, 2.0, 0.0, 3.0, 5.0, 5.0],  # User 1 (gu AI/ML rất giống User 0)
    [2.0, 5.0, 4.0, 5.0, 2.0, 1.0],  # User 2 (gu văn phòng / thiết kế)
    [4.0, 2.0, 3.0, 3.0, 4.0, 5.0],  # User 3 (gu AI/ML)
    [1.0, 5.0, 4.0, 5.0, 1.0, 2.0],  # User 4 (gu văn phòng)
])

# Điền trung bình từng User cho ô trống rồi phân rã hạng thấp k=2 bằng SVD
R_filled = R.copy()
user_means = np.zeros(R.shape[0])
for u in range(R.shape[0]):
    rated = R[u] > 0
    user_means[u] = R[u, rated].mean()
    R_filled[u, ~rated] = user_means[u]

R_centered = R_filled - user_means[:, None]
U, s, Vt = np.linalg.svd(R_centered, full_matrices=False)
k = 2
R_pred = (U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]) + user_means[:, None]
R_pred = np.clip(R_pred, 1.0, 5.0)

print("\n=== 1B. COLLABORATIVE FILTERING (SVD MATRIX FACTORIZATION, k=2) ===")
for item_id in np.where(R[0] == 0)[0]:
    print(f"Dự đoán điểm của User 0 cho [{item_titles[item_id]}]: {R_pred[0, item_id]:.2f} / 5.0 sao")

# ==============================================================================
# PHẦN 2: MÔ PHỎNG TRANSFER LEARNING (PRETRAINED BACKBONE vs TRAIN FROM SCRATCH)
# ==============================================================================
# Nguồn (Source Task): Huấn luyện mạng Backbone trên 8 lớp chữ số 0..7 (nhiều dữ liệu)
# Đích (Target Task) : Phân loại chữ số 8 vs 9 chỉ với N_small mẫu gán nhãn cực ít!
digits = load_digits()
X_all = digits.data / 16.0
y_all = digits.target

src_mask = y_all <= 7
backbone = MLPClassifier(hidden_layer_sizes=(64, 32), activation='relu', max_iter=70, random_state=42)
backbone.fit(X_all[src_mask], y_all[src_mask])

# Hàm trích xuất đặc trưng tầng ẩn đã đóng băng (Frozen Feature Extractor)
def extract_frozen_features(X_in, net):
    h1 = np.maximum(0, X_in @ net.coefs_[0] + net.intercepts_[0])
    h2 = np.maximum(0, h1 @ net.coefs_[1] + net.intercepts_[1])
    return h2  # Vector đặc trưng 32 chiều giàu thông tin cạnh/nét chữ!

tgt_mask = y_all >= 8
X_tgt, y_tgt = X_all[tgt_mask], (y_all[tgt_mask] == 9).astype(int)

sample_sizes = [6, 10, 16, 24, 40, 60]
acc_scratch, acc_transfer = [], []

for n_few in sample_sizes:
    # Chia chỉ n_few mẫu train, phần còn lại (>250 mẫu) làm tập Test
    X_tr_f, y_tr_f = X_tgt[:n_few], y_tgt[:n_few]
    X_te_f, y_te_f = X_tgt[80:], y_tgt[80:]

    # Cách 1: Huấn luyện mạng mới từ đầu (From Scratch) trên dữ liệu ít
    scratch_net = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=80, random_state=42)
    scratch_net.fit(X_tr_f, y_tr_f)
    acc_scratch.append(accuracy_score(y_te_f, scratch_net.predict(X_te_f)) * 100)

    # Cách 2: Transfer Learning (Frozen Backbone + Classifier Head nhẹ)
    feat_tr = extract_frozen_features(X_tr_f, backbone)
    feat_te = extract_frozen_features(X_te_f, backbone)
    head_clf = LogisticRegression(C=2.0).fit(feat_tr, y_tr_f)
    acc_transfer.append(accuracy_score(y_te_f, head_clf.predict(feat_te)) * 100)

print("\n=== 2. TRANSFER LEARNING TRÊN TẬP ĐÍCH ÍT DỮ LIỆU (PHÂN LOẠI SỐ 8 vs 9) ===")
print(f"Chỉ với 10 mẫu huấn luyện -> Train từ đầu: {acc_scratch[1]:.1f}% | Transfer Learning: {acc_transfer[1]:.1f}%!")

# Trực quan hóa Ma trận dự đoán Collaborative Filtering & Hiệu quả Transfer Learning
fig, axes = plt.subplots(1, 2, figsize=(11.5, 4.2))

im = axes[0].imshow(R_pred, cmap='YlGnBu', aspect='auto', vmin=1, vmax=5)
axes[0].set_title('Ma trận Dự đoán Điểm CF (SVD)\n(Ô dấu * là điểm khuyết được dự đoán)')
axes[0].set_xticks(range(6))
axes[0].set_xticklabels([f'SP0{i+1}' for i in range(6)], fontsize=8.5)
axes[0].set_yticks(range(5))
axes[0].set_yticklabels([f'User {u}' for u in range(5)], fontsize=8.5)
for u in range(5):
    for j in range(6):
        mark = '*' if R[u, j] == 0 else ''
        axes[0].text(j, u, f"{R_pred[u, j]:.1f}{mark}", ha='center', va='center',
                     color='white' if R_pred[u, j] > 3.4 else '#0f172a', fontsize=8, fontweight='bold')
fig.colorbar(im, ax=axes[0], fraction=0.046)

axes[1].plot(sample_sizes, acc_transfer, 'o-', color='#10b981', linewidth=2.3, markersize=6, label='Transfer Learning (Frozen Backbone)')
axes[1].plot(sample_sizes, acc_scratch, 's--', color='#ef4444', linewidth=2.0, markersize=5, label='Huấn luyện từ đầu (From Scratch)')
axes[1].set_title('Hiệu quả Transfer Learning khi ít dữ liệu gán nhãn')
axes[1].set_xlabel('Số lượng mẫu huấn luyện ở tác vụ đích')
axes[1].set_ylabel('Độ chính xác Test (%)')
axes[1].set_ylim(50, 102)
axes[1].legend(fontsize=8)
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
