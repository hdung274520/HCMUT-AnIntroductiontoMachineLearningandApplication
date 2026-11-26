/**
 * Dữ liệu Học tập — MODULE 1: TỔNG QUAN & CƠ SỞ TOÁN HỌC MACHINE LEARNING
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 1: TỔNG QUAN & CƠ SỞ TOÁN HỌC MACHINE LEARNING
      // ========================================================================
      {
        id: 'module-1',
        shortLabel: 'M1 • Toán ML',
        badge: 'MODULE 01 / 06',
        title: 'Tổng quan & Cơ sở Toán học Machine Learning',
        subtitle: 'Hệ sinh thái AI–ML–DL, các nhánh học máy, Đại số tuyến tính, Giải tích ma trận, Xác suất & Tối ưu hóa Gradient Descent.',
        tags: ['AI / ML / DL', 'Linear Algebra & SVD', 'Gradient & Hessian', 'MLE / MAP', 'Gradient Descent'],
        theoryHtml: String.raw`
          <h3>1. Mối quan hệ AI – ML – DL & Các phương pháp Học máy</h3>
          <p>
            <strong>Trí tuệ nhân tạo (Artificial Intelligence - AI)</strong> là lĩnh vực rộng nhất nhằm xây dựng các hệ thống có khả năng suy luận và hành động thông minh. <strong>Máy học (Machine Learning - ML)</strong> là tập con cốt lõi của AI, nơi máy tính tự động học quy luật $f: \mathcal{X} \to \mathcal{Y}$ từ dữ liệu $\mathcal{D}$ thay vì lập trình luật cứng. <strong>Học sâu (Deep Learning - DL)</strong> là nhánh hiện đại của ML sử dụng mạng nơ-ron nhiều tầng ẩn để tự động trích xuất đặc trưng phân cấp từ dữ liệu thô (ảnh, âm thanh, văn bản).
          </p>
          <ul>
            <li><strong>Học có giám sát (Supervised Learning):</strong> Huấn luyện từ tập dữ liệu có nhãn $\mathcal{D} = \{(x_i, y_i)\}_{i=1}^N$. Gồm <em>Hồi quy (Regression)</em> khi $y_i \in \mathbb{R}$ (dự đoán giá nhà, nhiệt độ) và <em>Phân loại (Classification)</em> khi $y_i \in \{1, \dots, C\}$ (lọc spam, nhận dạng chữ số).</li>
            <li><strong>Học không giám sát (Unsupervised Learning):</strong> Chỉ có dữ liệu đầu vào $\{x_i\}_{i=1}^N$ không nhãn, hướng tới khám phá cấu trúc ẩn như <em>Phân cụm (Clustering: K-Means, GMM)</em> và <em>Giảm chiều dữ liệu (PCA, SVD)</em>.</li>
            <li><strong>Học củng cố (Reinforcement Learning - RL):</strong> Tác tử (Agent) tương tác tuần tự với môi trường qua trạng thái $s_t$, chọn hành động $a_t \sim \pi(a \mid s_t)$ và nhận phần thưởng $r_t$ nhằm cực đại hóa tổng phần thưởng chiết khấu kỳ vọng $\mathbb{E}\left[\sum_{t=0}^{\infty} \gamma^t r_t\right]$ với $\gamma \in (0, 1)$.</li>
          </ul>

          <h3>2. Đại số Tuyến tính: Chuẩn Vector, SVD &amp; Nền tảng PCA</h3>
          <p>Mỗi mẫu dữ liệu gồm $d$ đặc trưng được biểu diễn bởi vector cột $x \in \mathbb{R}^d$; toàn bộ $N$ mẫu tạo thành ma trận dữ liệu $X \in \mathbb{R}^{N \times d}$.</p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$\|w\|_1 = \sum_{i=1}^d |w_i|, \qquad \|w\|_2 = \sqrt{\sum_{i=1}^d w_i^2}, \qquad \|w\|_\infty = \max_{1 \le i \le d} |w_i|, \qquad \|x\|_p = \left(\sum_{j=1}^d |x_j|^p\right)^{1/p}$$
            $$x^T y = \sum_{j=1}^d x_j y_j = \|x\|_2 \|y\|_2 \cos\theta$$
          </div>
          <ul>
            <li><strong>Trị riêng & Vector riêng (Eigenvalues & Eigenvectors):</strong> Với ma trận vuông $A \in \mathbb{R}^{d \times d}$, cặp $(\lambda, v)$ thỏa mãn $A v = \lambda v$ ($v \neq 0$) cho biết hướng bất biến $v$ và hệ số co giãn $\lambda$. Nếu $A$ đối xứng thực ($A = A^T$), các vector riêng trực giao từng đôi: $A = Q \Lambda Q^T$.</li>
            <li><strong>Phân rã giá trị kỳ dị (Singular Value Decomposition - SVD):</strong> Mọi ma trận bất kỳ $X \in \mathbb{R}^{N \times d}$ đều phân rã được thành tích ba ma trận:</li>
          </ul>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$X = U \Sigma V^T, \quad U \in \mathbb{R}^{N \times N}\text{ trực giao}, \; \Sigma \in \mathbb{R}^{N \times d}\text{ đường chéo } (\sigma_1 \ge \sigma_2 \ge \dots \ge 0), \; V \in \mathbb{R}^{d \times d}\text{ trực giao}$$
          </div>
          <p>
            <strong>Liên hệ trực tiếp với PCA:</strong> Khi dữ liệu đã chuẩn hóa tâm $\tilde{X} = X - \mathbf{1}\mu^T = U \Sigma V^T$, ma trận hiệp phương sai thực nghiệm là $S = \frac{1}{N}\tilde{X}^T \tilde{X} = V \left(\frac{\Sigma^T \Sigma}{N}\right) V^T$. Như vậy các cột của $V$ (vector kỳ dị phải) chính là các <em>thành phần chính (Principal Components)</em>!
          </p>

          <h3>3. Giải tích Ma trận: Gradient, Hessian & Quy tắc Chain Rule</h3>
          <ul>
            <li><strong>Vector đạo hàm riêng (Gradient):</strong> $\nabla_w f(w) = \left[\frac{\partial f}{\partial w_1}, \dots, \frac{\partial f}{\partial w_d}\right]^T \in \mathbb{R}^d$ luôn chỉ hướng <em>tăng nhanh nhất</em> của hàm $f$ tại điểm $w$. Các hằng đẳng thức giải tích vector quan trọng:
              $$\nabla_w (a^T w) = a, \qquad \nabla_w (w^T A w) = (A + A^T)w, \qquad \nabla_w \|Xw - y\|_2^2 = 2 X^T (Xw - y)$$
            </li>
            <li><strong>Ma trận đạo hàm bậc hai (Hessian) &amp; Phân loại điểm dừng:</strong> $H(w) = \nabla^2_w f(w) \in \mathbb{R}^{d \times d}$ với phần tử $H_{ij} = \frac{\partial^2 f}{\partial w_i \partial w_j}$.
              <ul>
                <li>Nếu $H(w) \succeq 0$ (bán xác định dương, mọi trị riêng $\lambda_i \ge 0$) với mọi $w$, hàm $f(w)$ là <strong>hàm lồi (Convex)</strong> — mọi cực tiểu cục bộ đồng thời là cực tiểu toàn cục!</li>
                <li>Tại điểm dừng $\nabla f(w^*) = 0$ (xét trường hợp $2$ biến theo tiêu chuẩn Sylvester với $\Delta_1 = H_{11}, \Delta_2 = \det H$): nếu $H(w^*) \succ 0$ ($\Delta_1 &gt; 0, \det H &gt; 0$) $\Rightarrow$ <strong>cực tiểu cục bộ</strong>; nếu $H(w^*) \prec 0$ ($\Delta_1 &lt; 0, \det H &gt; 0$) $\Rightarrow$ <strong>cực đại cục bộ</strong>; nếu $\det H &lt; 0$ (trị riêng trái dấu) $\Rightarrow$ <strong>điểm yên ngựa (Saddle point)</strong>.</li>
              </ul>
            </li>
            <li><strong>Quy tắc dây chuyền (Chain Rule):</strong> Nếu $\mathcal{L} = g(z)$ và $z = h(w)$ thì $\frac{\partial \mathcal{L}}{\partial w} = \left(\frac{\partial z}{\partial w}\right)^T \frac{\partial \mathcal{L}}{\partial z}$. Đây là trụ cột toán học của thuật toán <em>Backpropagation</em> trong mạng nơ-ron sâu.</li>
          </ul>

          <h3>4. Xác suất Thống kê & Tối ưu hóa Gradient Descent</h3>
          <p>
            Trong góc nhìn xác suất, huấn luyện mô hình tương đương tìm bộ tham số $\theta$ giải bài toán <strong>Ước lượng hợp lý cực đại (MLE)</strong> hoặc <strong>Hậu nghiệm cực đại (MAP)</strong>:
          </p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$\hat{\theta}_{\text{MLE}} = \arg\max_{\theta} \sum_{i=1}^N \log P(y_i \mid x_i; \theta), \qquad \hat{\theta}_{\text{MAP}} = \arg\max_{\theta} \left[\sum_{i=1}^N \log P(y_i \mid x_i; \theta) + \log P(\theta)\right]$$
          </div>
          <p>
            Để cực tiểu hóa hàm mất mát khả vi $\mathcal{L}(w)$, thuật toán <strong>Gradient Descent (GD)</strong> cập nhật lặp ngược chiều Gradient với tốc độ học (Learning rate) $\alpha &gt; 0$ (còn ký hiệu là $\eta$):
          </p>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$w^{(t+1)} := w^{(t)} - \alpha \nabla_w \mathcal{L}\big(w^{(t)}\big) \quad \Longleftrightarrow \quad w^{(t+1)} := w^{(t)} - \eta \nabla_w \mathcal{L}\big(w^{(t)}\big)$$
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Lưu ý thực hành: Nếu $\eta$ quá nhỏ, thuật toán hội tụ rất chậm; nếu $\eta$ quá lớn ($\eta > \frac{2}{\lambda_{\max}(H)}$ với hàm bậc hai), chuỗi lặp sẽ dao động mạnh và phân kỳ ra vô cùng.
          </p>
          <div class="my-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-surface-900/70">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Các dạng bài tập &amp; Cách ra đề thường gặp</h4>
            <ul class="!mb-0 text-sm space-y-1">
              <li><strong>Dạng 1 — Tìm điểm dừng &amp; Xét cực trị bằng Hessian:</strong> Cho hàm đa biến $f(x, y)$, giải $\nabla f = 0$ rồi kiểm tra dấu $\Delta_1 = f_{xx}$ và $\det(H)$ để kết luận cực tiểu cục bộ, cực đại hay điểm yên ngựa.</li>
              <li><strong>Dạng 2 — Cập nhật thủ công Gradient Descent:</strong> Cho hàm mất mát $J(w)$, điểm khởi tạo $w^{(0)}$ và learning rate $\alpha$ (hoặc $\eta$), tính tay $w^{(1)}, w^{(2)}$ và giá trị loss tương ứng.</li>
              <li><strong>Dạng 3 — Quy tâm dữ liệu, Hiệp phương sai &amp; SVD:</strong> Cho ma trận dữ liệu $X$, tính $\tilde{X}$, ma trận hiệp phương sai $S$ và tìm hướng thành phần chính đầu tiên.</li>
            </ul>
          </div>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-1"></div>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="2">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Giả sử hàm bậc hai lồi có trị riêng lớn nhất của ma trận Hessian là $\lambda_{\max}(H) = 5$. Giá trị tốc độ học $\eta$ nào sau đây sẽ làm thuật toán Gradient Descent bị <strong>phân kỳ</strong>?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. $\eta = 0.15$</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. $\eta = 0.35$</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. $\eta = 0.50$</button>
            </div>
            <div class="qc-explain hidden">Ngưỡng ổn định của hàm bậc hai là $\eta_{\max} = \frac{2}{\lambda_{\max}(H)} = \frac{2}{5} = 0.40$. Chọn $\eta = 0.50 > 0.40$ sẽ khiến sai số khuếch đại qua từng bước và phân kỳ ra vô cùng.</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>
        `,
        exercises: [
          {
            title: 'Bài tập 1.1: Tính Gradient, xét tính lồi qua Hessian & cập nhật Gradient Descent',
            problemHtml: String.raw`
              Cho hàm mất mát hai biến $f(w_1, w_2) = 2w_1^2 + w_2^2 + 2w_1 w_2 - 6w_1 - 4w_2 + 5$.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Tìm vector đạo hàm $\nabla f(w)$ và ma trận Hessian $H(w)$. Hàm $f$ có phải hàm lồi chặt không?</li>
                <li>Tìm điểm cực tiểu toàn cục $w^*$ bằng giải tích ($\nabla f(w^*) = 0$).</li>
                <li>Xuất phát từ $w^{(0)} = [0, 0]^T$ với tốc độ học $\eta = 0.2$, tính $w^{(1)}$ và $w^{(2)}$.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Gradient & Hessian:</strong></p>
              $$\nabla f(w) = \begin{bmatrix} \frac{\partial f}{\partial w_1} \\ \frac{\partial f}{\partial w_2} \end{bmatrix} = \begin{bmatrix} 4w_1 + 2w_2 - 6 \\ 2w_1 + 2w_2 - 4 \end{bmatrix}, \qquad H = \begin{bmatrix} 4 & 2 \\ 2 & 2 \end{bmatrix}$$
              <p>Xét các định thức con chính của $H$: $\Delta_1 = 4 > 0$ và $\det(H) = 4 \times 2 - 2^2 = 4 > 0$ (tiêu chuẩn Sylvester). Do đó $H \succ 0$ (xác định dương), suy ra $f(w)$ là <strong>hàm lồi chặt</strong>.</p>
              <p><strong>Bước 2 — Cực tiểu toàn cục:</strong> Giải hệ $4w_1 + 2w_2 = 6$ và $2w_1 + 2w_2 = 4$: trừ vế theo vế được $2w_1 = 2 \Rightarrow w_1^* = 1 \Rightarrow w_2^* = 1$. Giá trị nhỏ nhất $f(1, 1) = 0$.</p>
              <p><strong>Bước 3 — Hai vòng lặp Gradient Descent ($\eta = 0.2$):</strong> (Lưu ý có thể viết $f(w_1,w_2) = (w_1 - 1)^2 + (w_1 + w_2 - 2)^2$)</p>
              <ul>
                <li>Tại $w^{(0)} = [0, 0]^T$: $\nabla f(w^{(0)}) = [-6, -4]^T \Rightarrow w^{(1)} = \begin{bmatrix}0\\0\end{bmatrix} - 0.2\begin{bmatrix}-6\\-4\end{bmatrix} = \begin{bmatrix}1.2\\0.8\end{bmatrix}$, $f(w^{(1)}) = 0.2^2 + 0^2 = \mathbf{0.04}$.</li>
                <li>Tại $w^{(1)} = [1.2, 0.8]^T$: $\nabla f(w^{(1)}) = [0.4, 0]^T \Rightarrow w^{(2)} = \begin{bmatrix}1.2\\0.8\end{bmatrix} - 0.2\begin{bmatrix}0.4\\0\end{bmatrix} = \begin{bmatrix}1.12\\0.80\end{bmatrix}$, $f(w^{(2)}) = 0.12^2 + (-0.08)^2 = \mathbf{0.0208}$.</li>
              </ul>
            `,
            verifyCode: String.raw`import numpy as np

# Kiểm chứng Bài tập 1.1 bằng NumPy
def f(w):
    w1, w2 = w[0], w[1]
    return 2*w1**2 + w2**2 + 2*w1*w2 - 6*w1 - 4*w2 + 5

def grad_f(w):
    w1, w2 = w[0], w[1]
    return np.array([4*w1 + 2*w2 - 6, 2*w1 + 2*w2 - 4], dtype=float)

H = np.array([[4.0, 2.0], [2.0, 2.0]])
eigvals = np.linalg.eigvals(H)
print("Ma trận Hessian H:\n", H)
print("Trị riêng của H:", np.round(eigvals, 4), "-> Xác định dương (Hàm lồi chặt)")

w = np.array([0.0, 0.0])
lr = 0.2
print(f"\nKhởi tạo w^(0) = {w}, f(w^(0)) = {f(w):.4f}")
for step in range(1, 15):
    w = w - lr * grad_f(w)
    if step <= 3 or step == 14:
        print(f"Bước {step:2d}: w = [{w[0]:.4f}, {w[1]:.4f}], Loss f(w) = {f(w):.6f}")`
          },
          {
            title: 'Bài tập 1.2: Phân rã SVD & Ma trận Hiệp phương sai',
            problemHtml: String.raw`
              Cho ma trận dữ liệu gồm $N=3$ điểm trong không gian $\mathbb{R}^2$:
              $$X = \begin{bmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{bmatrix}$$
              Hãy chuẩn hóa tâm dữ liệu $\tilde{X} = X - \mathbf{1}\mu^T$, tính ma trận hiệp phương sai $S = \frac{1}{N}\tilde{X}^T\tilde{X}$ và tìm hướng thành phần chính thứ nhất.
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1:</strong> Vector trung bình mẫu $\mu = \frac{1}{3}[1+3+5, \; 2+4+6]^T = [3, 4]^T$. Dữ liệu quy tâm:</p>
              $$\tilde{X} = \begin{bmatrix} -2 & -2 \\ 0 & 0 \\ 2 & 2 \end{bmatrix}$$
              <p><strong>Bước 2:</strong> Ma trận hiệp phương sai:</p>
              $$S = \frac{1}{3} \begin{bmatrix} -2 & 0 & 2 \\ -2 & 0 & 2 \end{bmatrix} \begin{bmatrix} -2 & -2 \\ 0 & 0 \\ 2 & 2 \end{bmatrix} = \frac{1}{3}\begin{bmatrix} 8 & 8 \\ 8 & 8 \end{bmatrix}$$
              <p><strong>Bước 3:</strong> Hai trị riêng của $S$ là $\lambda_1 = \frac{16}{3}$ và $\lambda_2 = 0$. Vector riêng đơn vị ứng với $\lambda_1$ (sai khác dấu $\pm 1$) là $v_1 = \pm\left[\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{2}}\right]^T \approx \pm[0.7071, 0.7071]^T$, giữ trọn $100\%$ phương sai dữ liệu!</p>
            `,
            verifyCode: String.raw`import numpy as np

X = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
X_centered = X - X.mean(axis=0)
S = (X_centered.T @ X_centered) / len(X)
U, s_vals, Vt = np.linalg.svd(X_centered, full_matrices=False)

print("Dữ liệu quy tâm X_tilde:\n", X_centered)
print("\nMa trận hiệp phương sai S:\n", np.round(S, 4))
print("\nGiá trị kỳ dị Sigma:", np.round(s_vals, 4))
print("Thành phần chính thứ nhất v1:", np.round(Vt[0], 4))`
          },
          {
            title: 'Bài tập 1.3: Tìm điểm dừng & Phân loại Cực tiểu cục bộ / Yên ngựa bằng Ma trận Hessian',
            problemHtml: String.raw`
              Cho hàm hai biến $f(x, y) = x^3 - 3x + y^2 - 4y + 5$.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Tìm tất cả các điểm dừng thỏa mãn $\nabla f(x, y) = \mathbf{0}$.</li>
                <li>Tính ma trận Hessian $H(x, y)$ và áp dụng tiêu chuẩn Sylvester để kết luận điểm nào là <strong>cực tiểu cục bộ</strong>, điểm nào là <strong>điểm yên ngựa (Saddle point)</strong>.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Tìm điểm dừng:</strong></p>
              $$\nabla f(x, y) = \begin{bmatrix} \frac{\partial f}{\partial x} \\ \frac{\partial f}{\partial y} \end{bmatrix} = \begin{bmatrix} 3x^2 - 3 \\ 2y - 4 \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix} \implies \begin{cases} x = \pm 1 \\ y = 2 \end{cases}$$
              <p>Vậy có $2$ điểm dừng: $P_1(1, 2)$ và $P_2(-1, 2)$.</p>
              <p><strong>Bước 2 — Ma trận Hessian &amp; Phân loại điểm dừng:</strong></p>
              $$H(x, y) = \begin{bmatrix} \frac{\partial^2 f}{\partial x^2} & \frac{\partial^2 f}{\partial x \partial y} \\ \frac{\partial^2 f}{\partial y \partial x} & \frac{\partial^2 f}{\partial y^2} \end{bmatrix} = \begin{bmatrix} 6x & 0 \\ 0 & 2 \end{bmatrix}$$
              <ul>
                <li>Tại $P_1(1, 2)$: $H(1, 2) = \begin{bmatrix} 6 & 0 \\ 0 & 2 \end{bmatrix}$. Có $\Delta_1 = 6 &gt; 0$ và $\det(H) = 12 &gt; 0$ (hai trị riêng $\lambda_1 = 6, \lambda_2 = 2$ đều dương) $\implies$ $H \succ 0$, vậy $P_1(1, 2)$ là <strong>cực tiểu cục bộ</strong> với $f(1, 2) = -1$.</li>
                <li>Tại $P_2(-1, 2)$: $H(-1, 2) = \begin{bmatrix} -6 & 0 \\ 0 & 2 \end{bmatrix}$. Có $\det(H) = -12 &lt; 0$ (hai trị riêng $\lambda_1 = -6, \lambda_2 = 2$ trái dấu) $\implies$ $P_2(-1, 2)$ là <strong>điểm yên ngựa</strong> với $f(-1, 2) = 3$.</li>
              </ul>
            `,
            verifyCode: String.raw`import numpy as np

def f(x, y):
    return x**3 - 3*x + y**2 - 4*y + 5

def hessian(x, y):
    return np.array([[6.0*x, 0.0], [0.0, 2.0]])

for name, (x, y) in [("P1", (1.0, 2.0)), ("P2", (-1.0, 2.0))]:
    H = hessian(x, y)
    eigs = np.linalg.eigvals(H)
    detH = np.linalg.det(H)
    kind = "Cực tiểu cục bộ" if np.all(eigs > 0) else ("Cực đại cục bộ" if np.all(eigs < 0) else "Điểm yên ngựa (Saddle point)")
    print(f"{name}({x:+.0f}, {y:+.0f}): f={f(x,y):+.1f} | eig(H)={eigs} | det(H)={detH:+.1f} => {kind}")`
          }
        ],
        quiz: [
          {
            q: 'Trong thuật toán Gradient Descent, vector đạo hàm riêng ∇f(w) tại điểm w mang ý nghĩa hình học nào?',
            options: [
              'Chỉ hướng tăng nhanh nhất của hàm số f tại điểm w',
              'Chỉ hướng giảm nhanh nhất của hàm số f tại điểm w',
              'Luôn vuông góc với vector trọng số w',
              'Luôn trỏ thẳng về gốc tọa độ O'
            ],
            answer: 0,
            explain: 'Vector Gradient ∇f(w) luôn chỉ hướng tăng cực đại của hàm số; vì vậy để cực tiểu hóa hàm mất mát, ta phải bước ngược chiều Gradient: w := w - η∇f(w).'
          },
          {
            q: 'Điều kiện đủ về ma trận Hessian H(w) để hàm mục tiêu hai lần khả vi f(w) là hàm lồi trên toàn không gian R^d là gì?',
            options: [
              'Mọi phần tử trên đường chéo của H(w) đều âm',
              'H(w) là ma trận bán xác định dương (mọi trị riêng λ_i ≥ 0) với mọi w',
              'Định thức det(H(w)) luôn bằng 0',
              'Vết của ma trận tr(H(w)) bằng 1'
            ],
            answer: 1,
            explain: 'Một hàm hai lần khả vi là hàm lồi khi và chỉ khi ma trận Hessian H(w) bán xác định dương (H(w) ⪰ 0) tại mọi điểm trên miền xác định.'
          },
          {
            q: 'Trong phân rã SVD của ma trận dữ liệu đã quy tâm X_tilde = U Σ V^T, các cột của ma trận V tương ứng với đại lượng nào?',
            options: [
              'Nhãn phân loại của từng mẫu dữ liệu',
              'Các vector riêng của ma trận hiệp phương sai (các trục thành phần chính PCA)',
              'Các sai số nhiễu Gaussian của phép đo',
              'Tốc độ học tối ưu của Gradient Descent'
            ],
            answer: 1,
            explain: 'Vì X_tilde^T X_tilde = V Σ^2 V^T nên các cột của V chính là hệ vector riêng trực chuẩn của ma trận hiệp phương sai mẫu, tức các trục Principal Components.'
          }
        ],
        labs: [
          {
            title: 'Lab 1.1: Nhân Ma trận, SVD & Kiểm chứng Đạo hàm Gradient',
            code: String.raw`# ==============================================================================
# MODULE 1 - LAB 1.1: ĐẠI SỐ TUYẾN TÍNH (MA TRẬN, SVD) & ĐẠO HÀM GRADIENT
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

# 1. Phép nhân ma trận & Phân rã giá trị kỳ dị (SVD)
A = np.array([[3.0, 1.0, 1.0],
              [-1.0, 3.0, 1.0],
              [2.0, 4.0, 2.0],
              [1.0, 2.0, 1.0]])
B = np.array([[2.0, 0.5],
              [1.0, -1.0],
              [0.0, 3.0]])

C = A @ B  # Tích ma trận A (4x3) nhân B (3x2) -> C (4x2)
U, singular_values, Vt = np.linalg.svd(A, full_matrices=False)

print("=== 1. ĐẠI SỐ TUYẾN TÍNH & PHÂN RÃ SVD ===")
print(f"Kích thước A: {A.shape}, B: {B.shape} -> Tích C = A @ B có kích thước: {C.shape}")
print("Ma trận C = A @ B:\n", C)
print("Các giá trị kỳ dị (Singular values) của A:", np.round(singular_values, 4))
print("Sai số khôi phục ||A - U @ diag(S) @ Vt||_F =", f"{np.linalg.norm(A - U @ np.diag(singular_values) @ Vt):.2e}")

# 2. Tính Đạo hàm Gradient giải tích vs Xấp xỉ sai phân hữu hạn (Gradient Check)
# Xét hàm mục tiêu f(w) = 0.5 * w^T @ Q @ w - b^T @ w + exp(0.2 * w1)
Q = np.array([[4.0, 1.2], [1.2, 2.5]])
b = np.array([3.0, -1.5])

def loss_fn(w):
    return 0.5 * float(w.T @ Q @ w) - float(b.T @ w) + np.exp(0.2 * w[0])

def analytic_grad(w):
    grad = Q @ w - b
    grad[0] += 0.2 * np.exp(0.2 * w[0])
    return grad

def numerical_grad(fn, w, eps=1e-6):
    grad_approx = np.zeros_like(w)
    for i in range(len(w)):
        w_plus, w_minus = w.copy(), w.copy()
        w_plus[i] += eps
        w_minus[i] -= eps
        grad_approx[i] = (fn(w_plus) - fn(w_minus)) / (2 * eps)
    return grad_approx

w_test = np.array([1.5, -0.8])
g_exact = analytic_grad(w_test)
g_num = numerical_grad(loss_fn, w_test)
rel_error = np.linalg.norm(g_exact - g_num) / (np.linalg.norm(g_exact) + np.linalg.norm(g_num))

print("\n=== 2. KIỂM CHỨNG ĐẠO HÀM GRADIENT (NUMERICAL GRADIENT CHECK) ===")
print("Tại điểm w =", w_test)
print("Gradient giải tích  :", np.round(g_exact, 6))
print("Gradient sai phân số:", np.round(g_num, 6))
print(f"Sai số tương đối    : {rel_error:.2e} (Chuẩn xác < 1e-7!)")

# 3. Mô phỏng Gradient Descent tối ưu hàm loss_fn(w) và vẽ quỹ đạo hội tụ
w_curr = np.array([-2.2, 2.6])
lr = 0.18
trajectory = [w_curr.copy()]
losses = [loss_fn(w_curr)]

for _ in range(28):
    w_curr = w_curr - lr * analytic_grad(w_curr)
    trajectory.append(w_curr.copy())
    losses.append(loss_fn(w_curr))

trajectory = np.array(trajectory)
print(f"\n=== 3. TỐI ƯU GRADIENT DESCENT (lr = {lr}) ===")
print(f"Điểm hội tụ sau 28 vòng lặp: w* = [{w_curr[0]:.4f}, {w_curr[1]:.4f}], Loss = {losses[-1]:.5f}")

# Trực quan hóa đường đồng mức (Contour) + Quỹ đạo Gradient Descent
fig, axes = plt.subplots(1, 2, figsize=(11, 4.4))
w1_grid = np.linspace(-2.6, 2.6, 120)
w2_grid = np.linspace(-2.5, 3.0, 120)
W1, W2 = np.meshgrid(w1_grid, w2_grid)
Z = 0.5 * (Q[0,0]*W1**2 + 2*Q[0,1]*W1*W2 + Q[1,1]*W2**2) - (b[0]*W1 + b[1]*W2) + np.exp(0.2*W1)

cs = axes[0].contour(W1, W2, Z, levels=20, cmap='viridis')
axes[0].clabel(cs, inline=True, fontsize=7)
axes[0].plot(trajectory[:, 0], trajectory[:, 1], 'o-', color='#ef4444', markersize=4, linewidth=1.8, label='Quỹ đạo GD')
axes[0].scatter(trajectory[0, 0], trajectory[0, 1], color='#f59e0b', s=80, zorder=5, label='Khởi tạo w(0)')
axes[0].scatter(trajectory[-1, 0], trajectory[-1, 1], color='#10b981', s=90, marker='*', zorder=6, label='Điểm hội tụ w*')
axes[0].set_title('Đường đồng mức & Quỹ đạo Gradient Descent')
axes[0].set_xlabel('Tham số w1')
axes[0].set_ylabel('Tham số w2')
axes[0].legend(fontsize=8)
axes[0].grid(alpha=0.25)

axes[1].plot(losses, 's-', color='#4f46e5', markersize=4, linewidth=2)
axes[1].set_title('Giá trị Hàm mất mát f(w) qua các vòng lặp')
axes[1].set_xlabel('Vòng lặp (Iteration)')
axes[1].set_ylabel('Loss f(w)')
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 1.2: Khảo sát Tốc độ học (Learning Rate) trong Gradient Descent',
            code: String.raw`# ==============================================================================
# MODULE 1 - LAB 1.2: ẢNH HƯỞNG CỦA LEARNING RATE TRONG GRADIENT DESCENT
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt

# Hàm mục tiêu lồi f(w) = (w - 2)^2 + 1  => Đạo hàm f'(w) = 2*(w - 2), cực tiểu tại w* = 2
def f(w):
    return (w - 2.0)**2 + 1.0

def df(w):
    return 2.0 * (w - 2.0)

learning_rates = [0.05, 0.35, 0.92]
titles = ['η = 0.05 (Hội tụ chậm)', 'η = 0.35 (Tốc độ tối ưu)', 'η = 0.92 (Dao động mạnh quanh đáy)']
colors = ['#0ea5e9', '#10b981', '#f97316']

w_plot = np.linspace(-2.5, 6.5, 250)
fig, axes = plt.subplots(1, 3, figsize=(12, 3.9), sharey=True)

for ax, lr, title, color in zip(axes, learning_rates, titles, colors):
    w = -2.0
    history = [w]
    for _ in range(12):
        w = w - lr * df(w)
        history.append(w)
    history = np.array(history)
    print(f"{title:34s} -> Sau 12 bước: w = {history[-1]:.5f}, f(w) = {f(history[-1]):.5f}")

    ax.plot(w_plot, f(w_plot), color='#334155', linewidth=2, label='f(w) = (w-2)² + 1')
    ax.plot(history, f(history), 'o--', color=color, markersize=5, linewidth=1.5, label='Các bước cập nhật')
    ax.scatter([2.0], [1.0], color='#ef4444', s=80, zorder=5, marker='*', label='Cực tiểu w*=2')
    ax.set_title(title, fontsize=10, fontweight='bold')
    ax.set_xlabel('w')
    ax.grid(alpha=0.3)
    ax.legend(fontsize=8)

axes[0].set_ylabel('Giá trị f(w)')
plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 1.3: Gradient Descent tìm cực tiểu hàm f(x) = x² + 5 sin(x)',
            code: String.raw`# ==============================================================================
# MODULE 1 - LAB 1.3: GRADIENT DESCENT TÌM CỰC TIỂU HÀM f(x) = x^2 + 5*sin(x)
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt

def f(x):
    return x**2 + 5.0 * np.sin(x)

def df(x):
    return 2.0 * x + 5.0 * np.cos(x)

def run_gd(x0, alpha=0.08, steps=40):
    xs = [x0]
    x = x0
    for _ in range(steps):
        x = x - alpha * df(x)
        xs.append(x)
    return np.array(xs)

# Thử nghiệm với 2 điểm khởi tạo khác nhau trên hàm phi lồi f(x) = x^2 + 5*sin(x)
traj_right = run_gd(x0=5.0,  alpha=0.08, steps=40)
traj_left  = run_gd(x0=-4.5, alpha=0.08, steps=40)

print("=== GRADIENT DESCENT TRÊN HÀM f(x) = x^2 + 5*sin(x) (alpha = 0.08) ===")
print(f"Xuất phát x^(0) = +5.0 -> Sau 40 bước: x* = {traj_right[-1]:+.4f}, f(x*) = {f(traj_right[-1]):+.4f}")
print(f"Xuất phát x^(0) = -4.5 -> Sau 40 bước: x* = {traj_left[-1]:+.4f}, f(x*) = {f(traj_left[-1]):+.4f}")

x_grid = np.linspace(-5.5, 5.5, 400)
fig, ax = plt.subplots(figsize=(8.8, 4.3))
ax.plot(x_grid, f(x_grid), color='#334155', linewidth=2.2, label='f(x) = x² + 5 sin(x)')
ax.plot(traj_right, f(traj_right), 'o--', color='#f59e0b', markersize=4.5, linewidth=1.4, label='Xuất phát x₀ = +5.0 (qua vùng uốn sóng)')
ax.plot(traj_left, f(traj_left), 's-', color='#10b981', markersize=4.5, linewidth=1.6, label='Xuất phát x₀ = -4.5 (xuống dốc mượt)')
ax.scatter([traj_left[-1]], [f(traj_left[-1])], color='#ef4444', s=110, marker='*', zorder=6, label=f'Cực tiểu x* ≈ {traj_left[-1]:.3f}')
ax.set_title('Gradient Descent tìm cực tiểu hàm phi lồi f(x) = x² + 5 sin(x)')
ax.set_xlabel('x')
ax.set_ylabel('f(x)')
ax.legend(fontsize=8.5)
ax.grid(alpha=0.3)
plt.tight_layout()
plt.show()`
          }
        ]
      }
);
