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
        subtitle: 'Confusion Matrix, Precision/Recall/F1, ROC–AUC, Đánh đổi Bias–Variance, Hệ thống gợi ý & Transfer Learning.',
        tags: ['Confusion Matrix', 'Precision / Recall / F1', 'ROC & AUC', 'Bias-Variance Trade-off', 'RecSys & Transfer Learning'],
        theoryHtml: String.raw`
          <h3>1. Đánh giá Mô hình: Ma trận Nhầm lẫn, ROC–AUC &amp; Chỉ số Hồi quy</h3>
          <p>
            Với bài toán phân loại nhị phân (Dương $1$ / Âm $0$), chỉ số tổng thể <strong>Accuracy</strong> dễ gây hiểu nhầm khi dữ liệu mất cân bằng (ví dụ $99\%$ ca âm tính). Ta phân tích chi tiết bằng <strong>Ma trận nhầm lẫn (Confusion Matrix)</strong> gồm $4$ đại lượng: <strong>TP</strong> (True Positive), <strong>FP</strong> (False Positive — báo động giả), <strong>FN</strong> (False Negative — bỏ sót) và <strong>TN</strong> (True Negative).
          </p>
          <table>
            <thead>
              <tr><th>Thực tế \ Dự đoán</th><th>Dự đoán Dương ($\hat{y}=1$)</th><th>Dự đoán Âm ($\hat{y}=0$)</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Thực tế Dương ($y=1$)</strong></td><td><strong>TP</strong> (Đúng Dương)</td><td><strong>FN</strong> (Bỏ sót / Sai Âm)</td></tr>
              <tr><td><strong>Thực tế Âm ($y=0$)</strong></td><td><strong>FP</strong> (Báo giả / Sai Dương)</td><td><strong>TN</strong> (Đúng Âm)</td></tr>
            </tbody>
          </table>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}, \qquad \text{Precision} = \frac{TP}{TP + FP}, \qquad \text{Recall (TPR)} = \frac{TP}{TP + FN}$$
            $$\text{F1-Score} = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2TP}{2TP + FP + FN}, \qquad \text{FPR} = \frac{FP}{FP + TN}, \qquad \text{Specificity (TNR)} = \frac{TN}{TN + FP}$$
          </div>
          <ul>
            <li><strong>Đánh đổi Precision – Recall:</strong> Tăng ngưỡng phân loại $\tau$ giúp tăng <em>Precision</em> (ít báo giả FP) nhưng làm giảm <em>Recall</em> (dễ bỏ sót FN). Trong lọc thư rác ưu tiên <strong>Precision</strong> (tránh nhầm thư quan trọng); trong chẩn đoán bệnh hiểm nghèo ưu tiên <strong>Recall</strong> (tránh bỏ sót người bệnh).</li>
            <li><strong>Đường cong ROC &amp; AUC:</strong> Vẽ đồ thị $\text{TPR (Recall)}$ theo $\text{FPR}$ khi quét ngưỡng $\tau \in [0, 1]$. Diện tích dưới đường cong <strong>AUC $\in [0.5, 1]$</strong> đo xác suất mô hình xếp hạng một mẫu dương ngẫu nhiên cao hơn một mẫu âm ngẫu nhiên (không phụ thuộc ngưỡng $\tau$).</li>
            <li><strong>Đánh giá Hồi quy &amp; $K$-Fold Cross-Validation:</strong> Dùng $\text{MAE} = \frac{1}{N}\sum |y_i-\hat{y}_i|$, $\text{RMSE} = \sqrt{\frac{1}{N}\sum (y_i-\hat{y}_i)^2}$, $R^2 = 1 - \frac{\sum(y_i-\hat{y}_i)^2}{\sum(y_i-\bar{y})^2}$; và ước lượng sai số tổng quát bằng $K$-Fold CV: $\text{CV}_{(K)} = \frac{1}{K}\sum_{k=1}^K \text{Err}_k$.</li>
          </ul>

          <h3>2. Đánh đổi Độ chệch – Phương sai (Bias–Variance Trade-off)</h3>
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

          <h3>3. Hệ thống Gợi ý (Recommender Systems)</h3>
          <ul>
            <li><strong>Content-based Filtering (Lọc dựa trên nội dung):</strong> Biểu diễn mỗi sản phẩm/bài viết bởi vector đặc trưng nội dung $\mathbf{x}_i$ (TF-IDF mô tả, thể loại, nhãn kỹ thuật) và xây dựng hồ sơ sở thích người dùng $\mathbf{u}_u$ từ lịch sử họ đã thích. Gợi ý các mục chưa xem có độ tương đồng Cosine cao nhất:
              $$\text{sim}(\mathbf{u}_u, \mathbf{x}_i) = \frac{\mathbf{u}_u \cdot \mathbf{x}_i}{\|\mathbf{u}_u\|_2 \|\mathbf{x}_i\|_2}$$
              <em>Ưu điểm:</em> Gợi ý được ngay sản phẩm mới (không bị Item Cold-start). <em>Hạn chế:</em> Khó gợi ý đa dạng ngoài vùng sở thích quen thuộc.
            </li>
            <li><strong>Collaborative Filtering (Lọc cộng tác):</strong> Khai thác trí tuệ đám đông từ ma trận đánh giá thưa User–Item $R \in \mathbb{R}^{M \times N}$ mà không cần biết siêu dữ liệu sản phẩm:
              <ul>
                <li><strong>Neighborhood-based (User-based / Item-based CF):</strong> Chuẩn hóa trung bình đánh giá của từng người dùng ($\tilde{r}_{ui} = r_{ui} - \bar{r}_u$), tính độ tương đồng Cosine / Pearson $\text{sim}(u, v) = \frac{\sum_{i \in I_{uv}} \tilde{r}_{ui}\tilde{r}_{vi}}{\sqrt{\sum \tilde{r}_{ui}^2}\sqrt{\sum \tilde{r}_{vi}^2}}$ và dự đoán $\hat{r}_{ui} = \bar{r}_u + \frac{\sum_{v \in \mathcal{N}_k(u)} \text{sim}(u,v)\,\tilde{r}_{vi}}{\sum_{v \in \mathcal{N}_k(u)} |\text{sim}(u,v)|}$.</li>
                <li><strong>Matrix Factorization (SVD / Latent Factor Models):</strong> Xấp xỉ hạng thấp $R \approx P Q^T$ ($P \in \mathbb{R}^{M \times k}, Q \in \mathbb{R}^{N \times k}$), dự đoán $\hat{r}_{ui} = \mu + b_u + b_i + p_u^T q_i$ bằng SGD hoặc ALS.</li>
              </ul>
            </li>
          </ul>

          <h3>4. Học Chuyển giao (Transfer Learning)</h3>
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
          <div class="my-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-surface-900/70">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Các dạng bài tập &amp; Cách ra đề thường gặp</h4>
            <ul class="!mb-0 text-sm space-y-1">
              <li><strong>Dạng 1 — Tính chỉ số Confusion Matrix:</strong> Cho bộ $TP, FP, FN, TN$, tính Accuracy, Precision, Recall, F1-Score và phân tích mô hình mắc lỗi False Positive hay False Negative nhiều hơn.</li>
              <li><strong>Dạng 2 — Phân tích Overfitting / Underfitting qua bảng Epoch:</strong> Cho bảng Train Error vs Validation Error qua các Epoch, xác định thời điểm mô hình bắt đầu Overfitting và đề xuất biện pháp khắc phục.</li>
              <li><strong>Dạng 3 — Hệ thống gợi ý Collaborative Filtering:</strong> Cho các vector đánh giá đã quy tâm, tính Cosine Similarity và dự đoán điểm đánh giá khuyết.</li>
            </ul>
          </div>
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
          },
          {
            title: 'Bài tập 6.3: Tính Accuracy, Precision, Recall & F1-Score từ Confusion Matrix',
            problemHtml: String.raw`
              Một mô hình phân loại nhị phân kiểm thử trên $300$ mẫu thu được Confusion Matrix gồm: $TP = 80$, $FP = 20$, $FN = 10$, $TN = 190$.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Tính các chỉ số Accuracy, Precision, Recall, F1-Score và False Positive Rate (FPR).</li>
                <li>Nhận xét mô hình đang mắc lỗi <em>False Positive</em> hay <em>False Negative</em> nhiều hơn và đề xuất hướng điều chỉnh ngưỡng nếu cần ưu tiên giảm báo động giả.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>1. Tính các chỉ số đánh giá:</strong></p>
              <ul>
                <li>$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN} = \frac{80 + 190}{300} = \frac{270}{300} = \mathbf{90.00\%}$</li>
                <li>$\text{Precision} = \frac{TP}{TP + FP} = \frac{80}{80 + 20} = \frac{80}{100} = \mathbf{80.00\%}$</li>
                <li>$\text{Recall (TPR)} = \frac{TP}{TP + FN} = \frac{80}{80 + 10} = \frac{80}{90} \approx \mathbf{88.89\%}$</li>
                <li>$\text{F1-Score} = \frac{2 \times 0.80 \times 0.8889}{0.80 + 0.8889} = \frac{160}{190} \approx \mathbf{84.21\%}$</li>
                <li>$\text{FPR} = \frac{FP}{FP + TN} = \frac{20}{20 + 190} = \frac{20}{210} \approx \mathbf{9.52\%}$</li>
              </ul>
              <p><strong>2. Nhận xét:</strong> Số lượng <strong>False Positive ($FP = 20$)</strong> cao gấp đôi <strong>False Negative ($FN = 10$)</strong>, làm cho Precision ($80.00\%$) thấp hơn rõ rệt so với Recall ($88.89\%$). Nếu bài toán ưu tiên hạn chế báo động giả (cần Precision cao hơn), ta nên <strong>tăng ngưỡng quyết định $\tau$</strong> (ví dụ từ $0.5$ lên $0.65$).</p>
            `,
            verifyCode: String.raw`TP, FP, FN, TN = 80, 20, 10, 190

accuracy = (TP + TN) / (TP + FP + FN + TN)
precision = TP / (TP + FP)
recall = TP / (TP + FN)
f1 = 2 * precision * recall / (precision + recall)
fpr = FP / (FP + TN)

print(f"Accuracy  = {accuracy*100:.2f}%")
print(f"Precision = {precision*100:.2f}%")
print(f"Recall    = {recall*100:.2f}%")
print(f"F1-Score  = {f1*100:.2f}%")
print(f"FPR       = {fpr*100:.2f}%")
print(f"Nhận xét  : FP ({FP}) > FN ({FN}) -> Precision thấp hơn Recall.")`
          },
          {
            title: 'Bài tập 6.4: Phân tích bảng Train vs Validation Error qua các Epoch',
            problemHtml: String.raw`
              Theo dõi quá trình huấn luyện một mạng nơ-ron qua 30 Epoch, ta ghi nhận bảng sai số sau:
              <table class="my-2">
                <thead><tr><th>Epoch</th><th>1</th><th>5</th><th>10</th><th>15</th><th>20</th><th>25</th><th>30</th></tr></thead>
                <tbody>
                  <tr><td><strong>Train Error (%)</strong></td><td>38.0</td><td>19.5</td><td>10.2</td><td>5.8</td><td>2.6</td><td>1.4</td><td>0.9</td></tr>
                  <tr><td><strong>Val Error (%)</strong></td><td>39.2</td><td>20.8</td><td>12.1</td><td>8.2</td><td>10.5</td><td>14.8</td><td>19.4</td></tr>
                </tbody>
              </table>
              Xác định giai đoạn Underfitting, thời điểm tối ưu, thời điểm bắt đầu bị <strong>Overfitting</strong> và đề xuất $3$ phương pháp xử lý.
            `,
            solutionHtml: String.raw`
              <ul>
                <li><strong>Epoch 1–10 (Underfitting ban đầu):</strong> Cả Train Error ($38.0\% \to 10.2\%$) và Val Error ($39.2\% \to 12.1\%$) đều còn cao và cùng giảm nhanh $\implies$ mô hình đang học đặc trưng tốt dần.</li>
                <li><strong>Epoch 15 (Điểm tối ưu — Sweet Spot):</strong> Validation Error đạt giá trị thấp nhất ($8.2\%$), độ chênh lệch Train–Val chỉ $2.4\%$.</li>
                <li><strong>Từ sau Epoch 15 (Epoch 20–30 — Bắt đầu Overfitting):</strong> Train Error tiếp tục giảm sâu về $0.9\%$, nhưng Validation Error đảo chiều tăng vọt từ $8.2\% \to 10.5\% \to 19.4\%$ (khoảng cách vênh tới $18.5\%$) do mạng bắt đầu học thuộc nhiễu tập huấn luyện.</li>
                <li><strong>Phương pháp xử lý:</strong> (1) Áp dụng <strong>Early Stopping</strong> lưu checkpoint tốt nhất tại Epoch 15; (2) Thêm <strong>Regularization</strong> (Dropout, $L_2$ Weight Decay); (3) Bổ sung dữ liệu hoặc dùng <strong>Data Augmentation</strong>.</li>
              </ul>
            `,
            verifyCode: String.raw`epochs    = [1, 5, 10, 15, 20, 25, 30]
train_err = [38.0, 19.5, 10.2, 5.8, 2.6, 1.4, 0.9]
val_err   = [39.2, 20.8, 12.1, 8.2, 10.5, 14.8, 19.4]

best_idx = min(range(len(val_err)), key=lambda i: val_err[i])
print(f"Điểm dừng Early Stopping tối ưu: Epoch {epochs[best_idx]} (Val Error thấp nhất = {val_err[best_idx]:.1f}%)")
print("\nPhân tích từng mốc:")
for e, tr, val in zip(epochs, train_err, val_err):
    gap = val - tr
    tag = "TỐI ƯU" if e == epochs[best_idx] else ("OVERFITTING (Val tăng)" if e > epochs[best_idx] else "Đang hội tụ")
    print(f"Epoch {e:2d}: Train={tr:4.1f}% | Val={val:4.1f}% | Gap={gap:+5.1f}% -> {tag}")`
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
          },
          {
            q: 'Trong bài toán sàng lọc ung thư (dữ liệu chỉ có 2% bệnh nhân dương tính, bỏ sót ca bệnh rất nguy hiểm), chỉ số nào phản ánh trực tiếp khả năng KHÔNG bỏ sót bệnh nhân dương tính?',
            options: [
              'Accuracy',
              'Recall (Sensitivity = TP / (TP + FN))',
              'False Positive Rate',
              'Specificity'
            ],
            answer: 1,
            explain: 'Recall = TP / (TP + FN) đo tỷ lệ bệnh nhân dương tính thực sự được phát hiện đúng. Nếu muốn tối thiểu hóa số ca bỏ sót (FN), ta phải ưu tiên Recall cao (và dùng thêm F1 / PR-AUC thay vì Accuracy).'
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
          },
          {
            title: 'Lab 6.3: Confusion Matrix, F1-Score & Đường cong ROC / AUC',
            code: String.raw`# ==============================================================================
# MODULE 6 - LAB 6.3: ĐÁNH GIÁ PHÂN LOẠI (CONFUSION MATRIX, F1 & ROC / AUC)
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc

# 1. Tạo tập dữ liệu phân loại nhị phân mất cân bằng (25% lớp dương, 75% lớp âm)
X, y = make_classification(
    n_samples=600, n_features=12, n_informative=6, n_redundant=3,
    weights=[0.75, 0.25], flip_y=0.06, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=42)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# 2. So sánh Logistic Regression vs SVM RBF (probability=True)
clf_lr  = LogisticRegression(random_state=42).fit(X_train_sc, y_train)
clf_svm = SVC(kernel='rbf', C=2.0, probability=True, random_state=42).fit(X_train_sc, y_train)

y_pred_svm = clf_svm.predict(X_test_sc)
cm = confusion_matrix(y_test, y_pred_svm)

print("=== BÁO CÁO PHÂN LOẠI TRÊN TẬP TEST (RBF SVM) ===")
print(classification_report(y_test, y_pred_svm, target_names=['Âm tính (0)', 'Dương tính (1)']))

# 3. Vẽ Confusion Matrix Heatmap & Đường cong ROC / AUC
prob_lr  = clf_lr.predict_proba(X_test_sc)[:, 1]
prob_svm = clf_svm.predict_proba(X_test_sc)[:, 1]

fpr_lr,  tpr_lr,  _ = roc_curve(y_test, prob_lr)
fpr_svm, tpr_svm, _ = roc_curve(y_test, prob_svm)
auc_lr  = auc(fpr_lr, tpr_lr)
auc_svm = auc(fpr_svm, tpr_svm)

print(f"ROC AUC Score -> Logistic Regression: {auc_lr:.4f} | RBF SVM: {auc_svm:.4f}")

fig, axes = plt.subplots(1, 2, figsize=(11.2, 4.3))

# Heatmap Confusion Matrix
im = axes[0].imshow(cm, cmap='Blues')
axes[0].set_title('Confusion Matrix (RBF SVM)')
axes[0].set_xticks([0, 1])
axes[0].set_yticks([0, 1])
axes[0].set_xticklabels(['Đoán Âm (0)', 'Đoán Dương (1)'])
axes[0].set_yticklabels(['Thực Âm (0)', 'Thực Dương (1)'])
labels_cm = [['TN', 'FP'], ['FN', 'TP']]
for i in range(2):
    for j in range(2):
        axes[0].text(j, i, f"{labels_cm[i][j]}\n{cm[i, j]}", ha='center', va='center',
                     color='white' if cm[i, j] > cm.max()/2 else '#0f172a', fontsize=11, fontweight='bold')

# ROC Curve
axes[1].plot(fpr_svm, tpr_svm, color='#10b981', linewidth=2.4, label=f'RBF SVM (AUC = {auc_svm:.3f})')
axes[1].plot(fpr_lr, tpr_lr, color='#4f46e5', linewidth=2.0, label=f'Logistic Reg (AUC = {auc_lr:.3f})')
axes[1].plot([0, 1], [0, 1], '--', color='#64748b', linewidth=1.4, label='Ngẫu nhiên (AUC = 0.500)')
axes[1].set_title('Đường cong ROC & Diện tích AUC')
axes[1].set_xlabel('False Positive Rate (FPR)')
axes[1].set_ylabel('True Positive Rate (Recall / TPR)')
axes[1].legend(loc='lower right', fontsize=8.5)
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
