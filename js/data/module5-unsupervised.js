/**
 * Dữ liệu Học tập — MODULE 5: HỌC KHÔNG GIÁM SÁT & GIẢM CHIỀU DỮ LIỆU
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 5: HỌC KHÔNG GIÁM SÁT & GIẢM CHIỀU DỮ LIỆU
      // ========================================================================
      {
        id: 'module-5',
        shortLabel: 'M5 • Cụm & PCA',
        badge: 'MODULE 05 / 06',
        title: 'Học không giám sát & Giảm chiều Dữ liệu',
        subtitle: 'Phân cụm K-Means (WCSS, K-Means++, Elbow, Silhouette), GMM & thuật toán EM; Giảm chiều Truncated SVD, PCA & LDA.',
        tags: ['K-Means & K-Means++', 'Elbow & Silhouette', 'GMM & EM Algorithm', 'PCA & Truncated SVD', "LDA (Fisher's Criterion)"],
        theoryHtml: String.raw`
          <h3>1. Phân cụm Dữ liệu: K-Means & Gaussian Mixture Model (GMM)</h3>
          <p>
            <strong>Thuật toán K-Means</strong> phân hoạch $N$ điểm dữ liệu không nhãn thành $K$ cụm rời nhau sao cho tổng bình phương khoảng cách nội cụm (<strong>WCSS / Inertia</strong>) nhỏ nhất:
          </p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$J_{\text{WCSS}} = \sum_{i=1}^N \sum_{k=1}^K r_{ik} \|x_i - \mu_k\|_2^2, \qquad r_{ik} = \begin{cases}1 & \text{nếu } k = \arg\min_j \|x_i - \mu_j\|_2^2 \\ 0 & \text{ngược lại}\end{cases}$$
          </div>
          <ul>
            <li><strong>Hai bước lặp:</strong> (1) <em>Assignment:</em> Cố định $\mu_k$, gán mỗi điểm vào tâm cụm gần nhất theo $r_{ik}$; (2) <em>Update:</em> Cập nhật lại tâm cụm bằng trung bình cộng các điểm thuộc cụm $C_k$:
              $$\mu_k = \frac{1}{|C_k|} \sum_{x \in C_k} x$$
            </li>
            <li><strong>K-Means++:</strong> Khởi tạo tâm cụm tuần tự với xác suất chọn tâm mới tỷ lệ thuận với bình phương khoảng cách ngắn nhất tới các tâm đã chọn $D(x)^2$, giúp hội tụ nhanh và tránh rơi vào cực tiểu cục bộ kém.</li>
            <li><strong>Chọn số cụm $K$ tối ưu:</strong>
              <ul>
                <li><strong>Elbow Method:</strong> Vẽ đồ thị WCSS theo $K$ và chọn điểm "khuỷu tay" nơi tốc độ giảm WCSS bắt đầu chững lại rõ rệt.</li>
                <li><strong>Hệ số Silhouette:</strong> Với mỗi điểm $i$, gọi $a(i)$ là khoảng cách trung bình tới các điểm cùng cụm và $b(i)$ là khoảng cách trung bình tới cụm lân cận gần nhất:
                  $$s(i) = \frac{b(i) - a(i)}{\max\{a(i), b(i)\}} \in [-1, 1] \quad (\text{càng gần } +1 \text{ cụm càng cô đặc và tách biệt tốt})$$
                </li>
              </ul>
            </li>
            <li><strong>Gaussian Mixture Model (GMM) &amp; Thuật toán EM:</strong> Mô hình hóa mật độ dữ liệu như tổ hợp $K$ phân phối chuẩn đa chiều:
              $$P(x) = \sum_{k=1}^K \pi_k \mathcal{N}(x \mid \mu_k, \Sigma_k), \qquad \mathcal{N}(x \mid \mu_k, \Sigma_k) = \frac{1}{(2\pi)^{d/2}|\Sigma_k|^{1/2}} \exp\left(-\frac{1}{2}(x-\mu_k)^T \Sigma_k^{-1}(x-\mu_k)\right)$$
              Tối ưu hàm Log-Likelihood $\ln P(X \mid \pi, \mu, \Sigma) = \sum_{i=1}^N \ln \left(\sum_{k=1}^K \pi_k \mathcal{N}(x_i \mid \mu_k, \Sigma_k)\right)$ bằng <strong>Expectation-Maximization (EM)</strong>:
              <ul>
                <li><strong>E-step (Trách nhiệm cụm):</strong> $\gamma_{ik} = \frac{\pi_k \mathcal{N}(x_i \mid \mu_k, \Sigma_k)}{\sum_{j=1}^K \pi_j \mathcal{N}(x_i \mid \mu_j, \Sigma_j)}$.</li>
                <li><strong>M-step (Cập nhật tham số có trọng số $\gamma_{ik}$, đặt $N_k = \sum_{i=1}^N \gamma_{ik}$):</strong>
                  $$\mu_k^{\text{new}} = \frac{1}{N_k}\sum_{i=1}^N \gamma_{ik} x_i, \qquad \Sigma_k^{\text{new}} = \frac{1}{N_k}\sum_{i=1}^N \gamma_{ik}(x_i - \mu_k^{\text{new}})(x_i - \mu_k^{\text{new}})^T, \qquad \pi_k^{\text{new}} = \frac{N_k}{N}$$
                </li>
              </ul>
            </li>
          </ul>

          <h3>2. Giảm chiều Dữ liệu: Truncated SVD, PCA &amp; LDA</h3>
          <ul>
            <li><strong>PCA (Principal Component Analysis — Không giám sát):</strong> Chiếu dữ liệu đã quy tâm $\tilde{X} \in \mathbb{R}^{N \times d}$ xuống không gian con $k$ chiều ($k \ll d$) qua ma trận trực chuẩn $W_k = [v_1, \dots, v_k] \in \mathbb{R}^{d \times k}$ sao cho <strong>phương sai sau khi chiếu đạt cực đại</strong> (tương đương sai số tái tạo nhỏ nhất). Giải phương trình trị riêng của ma trận hiệp phương sai $\Sigma = \frac{1}{N}\tilde{X}^T \tilde{X}$:
              $$\Sigma v_i = \lambda_i v_i \quad (\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_d \ge 0)$$
            </li>
          </ul>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$\text{Explained Variance Ratio}(k) = \frac{\sum_{j=1}^k \lambda_j}{\sum_{j=1}^d \lambda_j}, \qquad Z = \tilde{X} W_k \in \mathbb{R}^{N \times k}, \qquad \hat{X} = Z W_k^T + \mathbf{1}\mu^T$$
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Sai số tái tạo trung bình khi giữ $k$ thành phần chính bằng đúng tổng các trị riêng bị loại bỏ: $\frac{1}{N}\|X - \hat{X}\|_F^2 = \sum_{j=k+1}^d \lambda_j$.
          </p>
          <ul>
            <li><strong>Truncated SVD:</strong> Áp dụng trực tiếp $X \approx U_k \Sigma_k V_k^T$ mà <em>không cần quy tâm trừ trung bình</em> — đặc biệt hữu hiệu cho ma trận thưa kích thước lớn (như TF-IDF văn bản hoặc ma trận User-Item) vì giữ nguyên cấu trúc thưa.</li>
            <li><strong>LDA (Linear Discriminant Analysis — Có giám sát):</strong> Tận dụng nhãn lớp để tìm phép chiếu cực đại hóa <strong>Tiêu chuẩn Fisher</strong> dựa trên ma trận phân tán trong lớp $S_W$ và giữa các lớp $S_B$:
              $$S_W = \sum_{c=1}^C \sum_{x \in \mathcal{D}_c} (x - \mu_c)(x - \mu_c)^T, \qquad S_B = \sum_{c=1}^C N_c (\mu_c - \mu)(\mu_c - \mu)^T$$
            </li>
          </ul>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$J(W) = \frac{|W^T S_B W|}{|W^T S_W W|} \implies S_W^{-1} S_B v = \lambda v \quad (\text{số chiều tối đa sau giảm là } \min(d, C - 1))$$
          </div>
          <div class="my-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-surface-900/70">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Các dạng bài tập &amp; Cách ra đề thường gặp</h4>
            <ul class="!mb-0 text-sm space-y-1">
              <li><strong>Dạng 1 — Mô phỏng K-Means &amp; WCSS:</strong> Cho $4$–$6$ điểm 2D và tâm cụm ban đầu $\mu_1, \mu_2$, tính khoảng cách Euclid, gán cụm, cập nhật tâm mới và tính WCSS.</li>
              <li><strong>Dạng 2 — PCA 2D từ Ma trận Hiệp phương sai:</strong> Cho $\Sigma$ cỡ $2\times 2$, giải $\det(\Sigma - \lambda I) = 0$ tìm $\lambda_1, \lambda_2$, vector riêng $v_1$ và tỷ lệ phương sai giữ lại.</li>
              <li><strong>Dạng 3 — E-step trong GMM:</strong> Cho tham số $(\pi_k, \mu_k, \sigma_k^2)$ của $2$ cụm Gaussian, tính trách nhiệm gán cụm mềm $\gamma_{ik}$ cho một điểm $x_i$.</li>
            </ul>
          </div>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-5"></div>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="1">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Một tập dữ liệu có $d = 20$ đặc trưng và $C = 4$ lớp phân loại. Khi dùng thuật toán LDA, ta có thể giảm xuống tối đa bao nhiêu chiều?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. Tối đa 4 chiều ($C$)</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. Tối đa 3 chiều ($C - 1$)</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. Tối đa 19 chiều ($d - 1$)</button>
            </div>
            <div class="qc-explain hidden">Hạng của ma trận phân tán giữa các lớp $S_B$ bị chặn trên bởi $C - 1$ vì $C$ vector tâm lớp chỉ sinh ra tối đa một không gian con $C - 1$ chiều; do đó LDA giữ được tối đa $\min(d, C - 1) = 3$ trục phân biệt.</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>
        `,
        exercises: [
          {
            title: 'Bài tập 5.1: Thực hiện 1 vòng lặp K-Means & Tính WCSS',
            problemHtml: String.raw`
              Cho 4 điểm dữ liệu 2D: $x_1=(1,1), x_2=(2,1), x_3=(5,4), x_4=(6,5)$. Khởi tạo $K=2$ tâm cụm ban đầu $\mu_1^{(0)}=(1,1)$ và $\mu_2^{(0)}=(2,1)$. Thực hiện 1 vòng lặp K-Means đầy đủ và tính WCSS sau cập nhật.
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Gán cụm theo bình phương khoảng cách Euclid tới $\mu_1^{(0)}(1,1)$ và $\mu_2^{(0)}(2,1)$:</strong></p>
              <ul>
                <li>$x_1(1,1)$: $d_1^2 = 0 < d_2^2 = 1 \implies$ Cụm 1.</li>
                <li>$x_2(2,1)$: $d_1^2 = 1 > d_2^2 = 0 \implies$ Cụm 2.</li>
                <li>$x_3(5,4)$: $d_1^2 = 25 > d_2^2 = 18 \implies$ Cụm 2.</li>
                <li>$x_4(6,5)$: $d_1^2 = 41 > d_2^2 = 32 \implies$ Cụm 2.</li>
              </ul>
              <p><strong>Bước 2 — Cập nhật tâm cụm sau vòng lặp 1:</strong></p>
              $$\mu_1^{(1)} = (1, 1), \qquad \mu_2^{(1)} = \frac{(2,1)+(5,4)+(6,5)}{3} = \left(\frac{13}{3}, \frac{10}{3}\right) \approx (4.33, 3.33)$$
              <p><strong>Bước 3 — Tính $\text{WCSS}$ sau vòng lặp 1:</strong></p>
              <ul>
                <li>Cụm 1 $\{x_1(1,1)\}$ với $\mu_1^{(1)}=(1,1)$: $\text{SSE}_1 = 0$.</li>
                <li>Cụm 2 $\{x_2(2,1), x_3(5,4), x_4(6,5)\}$ với $\mu_2^{(1)}=\left(\frac{13}{3}, \frac{10}{3}\right)$:
                  $$\|x_2 - \mu_2^{(1)}\|_2^2 = \left(-\frac{7}{3}\right)^2 + \left(-\frac{7}{3}\right)^2 = \frac{98}{9}, \quad \|x_3 - \mu_2^{(1)}\|_2^2 = \frac{8}{9}, \quad \|x_4 - \mu_2^{(1)}\|_2^2 = \frac{50}{9}$$
                </li>
                <li>Tổng $\text{WCSS}^{(1)} = 0 + \frac{98 + 8 + 50}{9} = \frac{156}{9} = \frac{52}{3} \approx \mathbf{17.3333}$.</li>
              </ul>
              <p class="text-xs text-slate-500 dark:text-slate-400"><em>Mở rộng vòng lặp 2:</em> Ở vòng kế tiếp, $x_2(2,1)$ gần $\mu_1^{(1)}(1,1)$ ($d^2=1$) hơn $\mu_2^{(1)}$ ($d^2=\frac{98}{9}$), nên chuyển sang Cụm 1. Khi đó $\mu_1^{(2)}=(1.5, 1), \; \mu_2^{(2)}=(5.5, 4.5)$ và thuật toán hội tụ với $\text{WCSS}^{(2)} = 0.5 + 1.0 = \mathbf{1.5}$.</p>
            `,
            verifyCode: String.raw`import numpy as np

X = np.array([[1.0, 1.0], [2.0, 1.0], [5.0, 4.0], [6.0, 5.0]])
centroids = np.array([[1.0, 1.0], [2.0, 1.0]])

for it in range(1, 4):
    dists_sq = np.sum((X[:, None, :] - centroids[None, :, :])**2, axis=2)
    labels = np.argmin(dists_sq, axis=1)
    centroids = np.array([X[labels == k].mean(axis=0) for k in range(2)])
    wcss = sum(np.sum((X[labels == k] - centroids[k])**2) for k in range(2))
    print(f"Vòng {it}: Nhãn cụm = {labels}, Tâm μ1={np.round(centroids[0],2)}, μ2={np.round(centroids[1],2)} | WCSS = {wcss:.4f}")`
          },
          {
            title: 'Bài tập 5.2: Tính Trị riêng & Tỷ lệ phương sai giữ lại của PCA',
            problemHtml: String.raw`
              Giả sử tập dữ liệu 2 chiều sau khi quy tâm có ma trận hiệp phương sai $S = \begin{bmatrix} 5 & 2 \\ 2 & 2 \end{bmatrix}$. Tìm các trị riêng $\lambda_1, \lambda_2$, vector thành phần chính thứ nhất và tỷ lệ phương sai giữ lại khi nén xuống $1$ chiều.
            `,
            solutionHtml: String.raw`
              <p><strong>Phương trình đặc trưng:</strong> $\det(S - \lambda I) = (5-\lambda)(2-\lambda) - 4 = \lambda^2 - 7\lambda + 6 = 0 \implies \lambda_1 = 6, \; \lambda_2 = 1$.</p>
              <p><strong>Vector riêng đơn vị ứng với $\lambda_1 = 6$:</strong> $(S - 6I)v_1 = 0 \implies -v_{11} + 2v_{12} = 0 \implies v_1 = \pm\frac{1}{\sqrt{5}}[2, 1]^T \approx \pm[0.8944, 0.4472]^T$ (hai hướng ngược dấu $\pm v_1$ đều xác định cùng một trục thành phần chính).</p>
              <p><strong>Tỷ lệ phương sai giữ lại khi giảm xuống $k=1$ chiều:</strong> $\frac{\lambda_1}{\lambda_1 + \lambda_2} = \frac{6}{6 + 1} = \frac{6}{7} \approx 85.71\%$.</p>
            `,
            verifyCode: String.raw`import numpy as np

S = np.array([[5.0, 2.0], [2.0, 2.0]])
eigvals, eigvecs = np.linalg.eigh(S)
idx = np.argsort(eigvals)[::-1]
eigvals, eigvecs = eigvals[idx], eigvecs[:, idx]

# Chuẩn hóa hướng dấu (vector riêng v1 và -v1 xác định cùng một trục chính)
v1 = eigvecs[:, 0].copy()
if v1[0] < 0:
    v1 = -v1

print("Các trị riêng (λ1, λ2):", eigvals)
print("Thành phần chính thứ nhất v1 (±):", np.round(v1, 4))
print(f"Tỷ lệ phương sai giữ lại (k=1): {eigvals[0]/eigvals.sum()*100:.2f}%")`
          },
          {
            title: 'Bài tập 5.3: Tính Trách nhiệm cụm (E-step) trong Gaussian Mixture Model 1D',
            problemHtml: String.raw`
              Cho mô hình GMM $1$ chiều gồm $K = 2$ thành phần với trọng số tiên nghiệm bằng nhau $\pi_1 = \pi_2 = 0.5$:
              <ul class="mt-1">
                <li>Thành phần 1: $\mathcal{N}(\mu_1 = 2, \sigma_1^2 = 1)$</li>
                <li>Thành phần 2: $\mathcal{N}(\mu_2 = 5, \sigma_2^2 = 1)$</li>
              </ul>
              Thực hiện bước <strong>E-step</strong> để tính xác suất trách nhiệm $\gamma_{1}, \gamma_{2}$ cho điểm dữ liệu $x = 3$.
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Tính mật độ chuẩn 1D tại $x = 3$:</strong></p>
              $$\mathcal{N}(3 \mid 2, 1) = \frac{1}{\sqrt{2\pi}}e^{-\frac{(3-2)^2}{2}} = \frac{e^{-0.5}}{\sqrt{2\pi}} \approx 0.24197$$
              $$\mathcal{N}(3 \mid 5, 1) = \frac{1}{\sqrt{2\pi}}e^{-\frac{(3-5)^2}{2}} = \frac{e^{-2.0}}{\sqrt{2\pi}} \approx 0.05399$$
              <p><strong>Bước 2 — Tính xác suất trách nhiệm (Responsibilities):</strong> (Do $\pi_1 = \pi_2 = 0.5$ nên triệt tiêu)</p>
              $$\gamma_1 = \frac{0.5 \times 0.24197}{0.5 \times 0.24197 + 0.5 \times 0.05399} = \frac{e^{-0.5}}{e^{-0.5} + e^{-2.0}} = \frac{1}{1 + e^{-1.5}} \approx \mathbf{0.8176} \; (81.76\%)$$
              $$\gamma_2 = 1 - \gamma_1 \approx \mathbf{0.1824} \; (18.24\%)$$
              <p>Khác với K-Means gán cứng $x=3$ hoàn toàn về Cụm 1, GMM gán mềm theo tỷ lệ $81.76\%$ Cụm 1 và $18.24\%$ Cụm 2.</p>
            `,
            verifyCode: String.raw`import math

def norm_pdf(x, mu, var):
    return (1.0 / math.sqrt(2.0 * math.pi * var)) * math.exp(-((x - mu) ** 2) / (2.0 * var))

x = 3.0
pi1, mu1, var1 = 0.5, 2.0, 1.0
pi2, mu2, var2 = 0.5, 5.0, 1.0

w1 = pi1 * norm_pdf(x, mu1, var1)
w2 = pi2 * norm_pdf(x, mu2, var2)
gamma1 = w1 / (w1 + w2)
gamma2 = w2 / (w1 + w2)

print(f"N(3 | 2, 1) = {norm_pdf(x, mu1, var1):.5f}, N(3 | 5, 1) = {norm_pdf(x, mu2, var2):.5f}")
print(f"Trách nhiệm cụm (E-step): gamma_1 = {gamma1:.4f} ({gamma1*100:.2f}%), gamma_2 = {gamma2:.4f} ({gamma2*100:.2f}%)")`
          }
        ],
        quiz: [
          {
            q: 'Ưu điểm lớn nhất của mô hình trộn Gaussian (GMM) so với thuật toán K-Means truyền thống là gì?',
            options: [
              'Không cần chọn trước số cụm K',
              'Thực hiện phân cụm mềm theo xác suất và mô hình hóa được các cụm hình elip có kích thước, độ nghiêng hiệp phương sai khác nhau',
              'Không bao giờ cần lặp để hội tụ',
              'Chỉ hoạt động trên dữ liệu văn bản nhị phân'
            ],
            answer: 1,
            explain: 'K-Means dùng khoảng cách Euclid đẳng hướng nên mặc định chia cụm theo biên Voronoi hình cầu. GMM học ma trận hiệp phương sai Σ_k riêng cho từng cụm thông qua thuật toán EM.'
          },
          {
            q: 'Sự khác biệt cốt lõi giữa PCA và LDA khi giảm chiều dữ liệu là gì?',
            options: [
              'PCA là thuật toán không giám sát tối đa hóa phương sai tổng thể, còn LDA là thuật toán có giám sát tối đa hóa độ phân tách giữa các lớp nhãn',
              'PCA cần nhãn lớp còn LDA không cần nhãn',
              'LDA luôn tạo ra nhiều chiều hơn số chiều ban đầu',
              'PCA không sử dụng trị riêng và vector riêng'
            ],
            answer: 0,
            explain: 'PCA hoàn toàn bỏ qua nhãn y và chỉ giữ hướng có phương sai lớn nhất; LDA khai thác nhãn lớp để tối ưu tỷ số Fisher |W^T S_B W| / |W^T S_W W|.'
          },
          {
            q: 'Với bài toán phân loại gồm C = 3 lớp (ví dụ tập dữ liệu Hoa Iris có 4 đặc trưng), thuật toán LDA có thể chiếu dữ liệu xuống tối đa bao nhiêu chiều?',
            options: ['1 chiều', '2 chiều (C - 1)', '3 chiều', '4 chiều'],
            answer: 1,
            explain: 'Hạng của ma trận phân tán giữa các lớp S_B tối đa bằng C - 1 (do C tâm lớp nằm trên một siêu phẳng tối đa C - 1 chiều), nên với C = 3 thì số chiều LDA tối đa là 2.'
          }
        ],
        labs: [
          {
            title: 'Lab 5.1: Phân cụm Hoa Iris bằng K-Means, Elbow & Silhouette',
            code: String.raw`# ==============================================================================
# MODULE 5 - LAB 5.1: PHÂN CỤM TẬP DỮ LIỆU HOA IRIS (K-MEANS, ELBOW & SILHOUETTE)
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# 1. Tải dữ liệu Hoa Iris (150 mẫu, 4 đặc trưng cánh hoa & đài hoa) - ẩn nhãn khi phân cụm!
iris = load_iris()
X_raw = iris.data
X_sc = StandardScaler().fit_transform(X_raw)

# 2. Khảo sát K từ 2 đến 8 bằng Elbow Method (WCSS/Inertia) và Hệ số Silhouette
k_values = list(range(2, 9))
inertias = []
silhouettes = []

print("=== KHẢO SÁT SỐ CỤM K TRÊN TẬP DỮ LIỆU HOA IRIS ===")
for k in k_values:
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    cluster_labels = km.fit_predict(X_sc)
    inertias.append(km.inertia_)
    sil = silhouette_score(X_sc, cluster_labels)
    silhouettes.append(sil)
    print(f"K = {k} | WCSS (Inertia) = {km.inertia_:7.2f} | Silhouette Score = {sil:.4f}")

# Huấn luyện mô hình K-Means (K=3 tương ứng 3 loài hoa tự nhiên Setosa, Versicolor, Virginica)
km3 = KMeans(n_clusters=3, init='k-means++', n_init=10, random_state=42)
clusters = km3.fit_predict(X_raw)
centroids = km3.cluster_centers_

# 3. Trực quan hóa Biểu đồ Elbow + Silhouette và Kết quả phân cụm K-Means (K=3)
fig, axes = plt.subplots(1, 2, figsize=(11.4, 4.3))

ax1 = axes[0]
ax1_twin = ax1.twinx()
l1 = ax1.plot(k_values, inertias, 'o-', color='#4f46e5', linewidth=2, label='WCSS / Inertia (Elbow)')
l2 = ax1_twin.plot(k_values, silhouettes, 's--', color='#10b981', linewidth=2, label='Silhouette Score')
ax1.axvline(3, color='#f59e0b', linestyle=':', linewidth=1.6, label='Điểm gãy Elbow K=3')
ax1.set_title('Chọn K tối ưu: Elbow Method & Silhouette')
ax1.set_xlabel('Số cụm K')
ax1.set_ylabel('WCSS (Inertia)', color='#4f46e5')
ax1_twin.set_ylabel('Silhouette Score', color='#10b981')
lines = l1 + l2
ax1.legend(lines, [l.get_label() for l in lines], loc='center right', fontsize=8)
ax1.grid(alpha=0.25)

# Vẽ phân cụm theo Chiều dài cánh hoa (cột 2) & Chiều rộng cánh hoa (cột 3)
palette = ['#ef4444', '#0ea5e9', '#10b981']
for k in range(3):
    pts = X_raw[clusters == k]
    axes[1].scatter(pts[:, 2], pts[:, 3], c=palette[k], s=45, alpha=0.8, edgecolors='k', label=f'Cụm {k+1} ({len(pts)} mẫu)')
axes[1].scatter(centroids[:, 2], centroids[:, 3], c='#facc15', s=210, marker='*', edgecolors='black', linewidths=1.5, label='Tâm cụm (Centroids)')
axes[1].set_title('Kết quả Phân cụm K-Means++ (K=3) trên Hoa Iris')
axes[1].set_xlabel('Chiều dài cánh hoa - Petal Length (cm)')
axes[1].set_ylabel('Chiều rộng cánh hoa - Petal Width (cm)')
axes[1].legend(fontsize=8)
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 5.2: Giảm chiều & Trực quan hóa 2D bằng PCA, Truncated SVD & LDA',
            code: String.raw`# ==============================================================================
# MODULE 5 - LAB 5.2: GIẢM CHIỀU DỮ LIỆU 4D -> 2D BẰNG PCA, TRUNCATED SVD & LDA
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.mixture import GaussianMixture

iris = load_iris()
X = StandardScaler().fit_transform(iris.data)
y = iris.target
names = iris.target_names

# 1. Áp dụng PCA (Không giám sát), Truncated SVD và LDA (Có giám sát) từ 4 chiều -> 2 chiều
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

svd = TruncatedSVD(n_components=2, random_state=42)
X_svd = svd.fit_transform(iris.data)  # Trực tiếp trên ma trận gốc

lda = LinearDiscriminantAnalysis(n_components=2)
X_lda = lda.fit_transform(X, y)

# Kết hợp GMM (EM Algorithm) trên không gian PCA 2D
gmm = GaussianMixture(n_components=3, covariance_type='full', random_state=42)
gmm_labels = gmm.fit_predict(X_pca)

print("=== SO SÁNH CÁC PHƯƠNG PHÁP GIẢM CHIỀU (4D -> 2D) ===")
print(f"PCA Tỷ lệ phương sai giữ lại từng trục : {np.round(pca.explained_variance_ratio_*100, 2)}% (Tổng: {pca.explained_variance_ratio_.sum()*100:.2f}%)")
print(f"LDA Tỷ lệ phương sai phân biệt lớp     : {np.round(lda.explained_variance_ratio_*100, 2)}% (Tổng: {lda.explained_variance_ratio_.sum()*100:.2f}%)")
print(f"Truncated SVD phương sai giải thích    : {svd.explained_variance_ratio_.sum()*100:.2f}%")

# 2. Trực quan hóa so sánh không gian 2D của PCA vs LDA vs GMM Soft-Clustering
colors = ['#ef4444', '#2563eb', '#10b981']
fig, axes = plt.subplots(1, 3, figsize=(12.2, 4.0))

for cls_id, color, label in zip(range(3), colors, names):
    axes[0].scatter(X_pca[y == cls_id, 0], X_pca[y == cls_id, 1], c=color, s=36, edgecolors='k', alpha=0.85, label=label)
    axes[1].scatter(X_lda[y == cls_id, 0], X_lda[y == cls_id, 1], c=color, s=36, edgecolors='k', alpha=0.85, label=label)

axes[0].set_title(f"PCA 2D (Không giám sát)\nGiữ {pca.explained_variance_ratio_.sum()*100:.1f}% tổng phương sai", fontsize=9.5, fontweight='bold')
axes[0].set_xlabel('PC 1')
axes[0].set_ylabel('PC 2')
axes[0].legend(fontsize=8)
axes[0].grid(alpha=0.3)

axes[1].set_title("LDA 2D (Có giám sát - Fisher)\nTối đa hóa độ tách biệt 3 loài hoa", fontsize=9.5, fontweight='bold')
axes[1].set_xlabel('LD 1')
axes[1].set_ylabel('LD 2')
axes[1].legend(fontsize=8)
axes[1].grid(alpha=0.3)

# Vẽ xác suất phân cụm mềm GMM (EM) trên không gian PCA
xx, yy = np.meshgrid(np.linspace(X_pca[:,0].min()-0.6, X_pca[:,0].max()+0.6, 150),
                     np.linspace(X_pca[:,1].min()-0.6, X_pca[:,1].max()+0.6, 150))
zz = -gmm.score_samples(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
axes[2].contour(xx, yy, zz, levels=12, cmap='viridis', alpha=0.55)
axes[2].scatter(X_pca[:, 0], X_pca[:, 1], c=gmm_labels, cmap='Set1', s=36, edgecolors='k')
axes[2].scatter(gmm.means_[:, 0], gmm.means_[:, 1], c='#facc15', s=170, marker='*', edgecolors='k', label='Tâm GMM')
axes[2].set_title("GMM + EM Algorithm trên PCA 2D\n(Cụm Elip Hiệp phương sai đầy đủ)", fontsize=9.5, fontweight='bold')
axes[2].set_xlabel('PC 1')
axes[2].set_ylabel('PC 2')
axes[2].legend(fontsize=8)
axes[2].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
