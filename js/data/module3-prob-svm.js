/**
 * Dữ liệu Học tập — MODULE 3: MÔ HÌNH PHÂN LOẠI XÁC SUẤT & RANH GIỚI (NAIVE BAYES & SVM)
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 3: MÔ HÌNH PHÂN LOẠI XÁC SUẤT & RANH GIỚI (NAIVE BAYES & SVM)
      // ========================================================================
      {
        id: 'module-3',
        shortLabel: 'M3 • NB & SVM',
        badge: 'MODULE 03 / 06',
        title: 'Mô hình Phân loại Xác suất & Ranh giới (Naive Bayes & SVM)',
        subtitle: 'Định lý Bayes, Gaussian/Multinomial/Bernoulli NB, Laplace Smoothing, Maximum Margin SVM, Soft-Margin & Kernel Trick.',
        tags: ['Naive Bayes', 'Laplace Smoothing', 'Hard / Soft-Margin SVM', 'Slack Variable & C', 'RBF / Poly Kernel'],
        theoryHtml: String.raw`
          <h3>1. Bộ phân loại Naive Bayes & Kỹ thuật Làm trơn Laplace</h3>
          <p>
            Dựa trên <strong>Định lý Bayes</strong>, xác suất mẫu đặc trưng $x = [x_1, \dots, x_d]^T$ thuộc lớp $c \in \mathcal{C}$ là $P(y=c \mid x) \propto P(y=c) P(x \mid y=c)$. Để tránh ước lượng phân phối đồng thời chiều cao bất khả thi, Naive Bayes đưa ra <strong>giả định độc lập có điều kiện</strong> giữa các đặc trưng khi biết nhãn lớp:
          </p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$\hat{y} = \arg\max_{c \in \mathcal{C}} P(y=c) \prod_{j=1}^d P(x_j \mid y=c) = \arg\max_{c \in \mathcal{C}} \left[\log P(y=c) + \sum_{j=1}^d \log P(x_j \mid y=c)\right]$$
          </div>
          <ul>
            <li><strong>Gaussian Naive Bayes:</strong> Dùng cho dữ liệu số thực liên tục, giả sử $x_j \mid y=c \sim \mathcal{N}(\mu_{cj}, \sigma_{cj}^2)$.</li>
            <li><strong>Multinomial Naive Bayes:</strong> Mô hình hóa số lần xuất hiện từ (tần suất từ Bag-of-Words) trong văn bản / lọc Email Spam.</li>
            <li><strong>Bernoulli Naive Bayes:</strong> Mỗi đặc trưng là biến nhị phân $x_j \in \{0, 1\}$ biểu thị một từ khóa có mặt hay vắng mặt trong email (tính cả xác suất từ không xuất hiện $1 - p_{cj}$).</li>
            <li><strong>Làm trơn Laplace (Additive Smoothing):</strong> Nếu một từ $w_k$ trong email kiểm thử chưa từng xuất hiện ở lớp $c$ lúc huấn luyện ($N_{ck} = 0$), tích xác suất sẽ sập về $0$. Ta cộng thêm hệ số làm trơn $\alpha > 0$ ($\alpha = 1$ là Laplace smoothing, $|V|$ là kích thước từ điển):</li>
          </ul>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$P(w_k \mid y=c) = \frac{N_{ck} + \alpha}{\sum_{v=1}^{|V|} N_{cv} + \alpha |V|}$$
          </div>

          <h3>2. Support Vector Machine (SVM): Lề cực đại & Soft-Margin</h3>
          <p>
            Với bài toán nhị phân $y_i \in \{-1, +1\}$, SVM tìm siêu phẳng $w^T x + b = 0$ sao cho tổng khoảng cách giữa hai siêu phẳng biên song song $w^T x + b = \pm 1$ đi qua các điểm gần nhất của hai lớp — gọi là <strong>Độ rộng lề (Margin)</strong> $\gamma = \frac{2}{\|w\|_2}$ (mỗi phía cách siêu phẳng phân cách $\frac{1}{\|w\|_2}$) — đạt giá trị lớn nhất. Những điểm dữ liệu nằm ngay trên hai biên $y_i(w^T x_i + b) = 1$ được gọi là các <strong>Support Vectors</strong>.
          </p>
          <ul>
            <li><strong>Hard-Margin SVM</strong> (khi dữ liệu tách biệt tuyến tính tuyệt đối, không nhiễu):
              $$\min_{w, b} \frac{1}{2}\|w\|_2^2 \quad \text{thỏa mãn} \quad y_i(w^T x_i + b) \ge 1, \; \forall i = 1,\dots,N$$
            </li>
            <li><strong>Soft-Margin SVM</strong> (dữ liệu thực tế có nhiễu chồng lấn): Bổ sung biến bù <strong>Slack variable</strong> $\xi_i \ge 0$ cho phép vi phạm lề có kiểm soát qua tham số điều chuẩn $C > 0$:</li>
          </ul>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$\min_{w, b, \xi} \frac{1}{2}\|w\|_2^2 + C \sum_{i=1}^N \xi_i \quad \text{s.t.} \quad y_i(w^T x_i + b) \ge 1 - \xi_i, \; \xi_i \ge 0$$
          </div>
          <p>
            <strong>Ý nghĩa tham số $C$:</strong> Bài toán trên tương đương tối ưu hàm <em>Hinge Loss</em> $\max(0, 1 - y_i(w^T x_i + b))$. Khi $C$ rất lớn, mô hình phạt lỗi cực nặng $\rightarrow$ lề hẹp, dễ <em>Overfitting</em>; khi $C$ nhỏ, mô hình ưu tiên lề rộng mượt mà hơn và chấp nhận một vài điểm ngoại lai.
          </p>

          <h3>3. Bài toán Đối ngẫu & Thủ thuật Nhân (Kernel Trick)</h3>
          <p>
            Chuyển sang bài toán đối ngẫu Lagrange theo nhân tử $\alpha_i$, hàm quyết định chỉ phụ thuộc vào tích vô hướng giữa các điểm dữ liệu: $f(x) = \text{sign}\left(\sum_{i \in \mathcal{SV}} \alpha_i y_i K(x_i, x) + b\right)$. Khi dữ liệu phi tuyến không tách được ở không gian gốc, <strong>Kernel Trick</strong> tính trực tiếp tích vô hướng $K(x_i, x_j) = \phi(x_i)^T \phi(x_j)$ trong không gian đặc trưng chiều rất cao (thậm chí vô hạn chiều với RBF) mà không cần tính $\phi(x)$:
          </p>
          <ul>
            <li><strong>Linear Kernel:</strong> $K(x_i, x_j) = x_i^T x_j$ (nhanh, hiệu quả cho dữ liệu văn bản nhiều chiều).</li>
            <li><strong>Polynomial Kernel:</strong> $K(x_i, x_j) = (\gamma x_i^T x_j + r)^d$ (biên quyết định đa thức bậc $d$).</li>
            <li><strong>RBF / Gaussian Kernel:</strong> $K(x_i, x_j) = \exp\big(-\gamma \|x_i - x_j\|_2^2\big)$ (phổ biến nhất cho dữ liệu phi tuyến phức tạp; $\gamma$ lớn tạo biên bao chặt quanh từng điểm, $\gamma$ nhỏ tạo biên trơn rộng).</li>
          </ul>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-3"></div>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="1">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Khi dùng SVM nhân RBF và tăng đồng thời cả $C$ lẫn $\gamma$ lên rất lớn, mô hình có xu hướng thay đổi như thế nào?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. Biên trở nên mượt hơn, dễ Underfitting</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. Biên uốn lượn bao chặt từng điểm train, dễ Overfitting</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. Tự chuyển thành siêu phẳng tuyến tính</button>
            </div>
            <div class="qc-explain hidden">$\gamma$ lớn thu hẹp bán kính ảnh hưởng của mỗi Support Vector thành các "đảo" bao sát từng điểm, còn $C$ lớn phạt nặng mọi lỗi trên tập train — cả hai đều đẩy độ phức tạp lên cao và dễ gây Overfitting.</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>
        `,
        exercises: [
          {
            title: 'Bài tập 3.1: Lọc Email Spam bằng Multinomial Naive Bayes + Laplace Smoothing',
            problemHtml: String.raw`
              Cho tập huấn luyện gồm $4$ email (2 Spam, 2 Ham) trên từ điển $|V| = 5$ từ khóa <code>{free, win, money, project, meeting}</code>:
              <ul class="mt-1">
                <li><strong>Spam ($y=1$):</strong> tổng cộng $8$ từ xuất hiện: <code>free</code> (3), <code>win</code> (2), <code>money</code> (2), <code>project</code> (0), <code>meeting</code> (1).</li>
                <li><strong>Ham ($y=0$):</strong> tổng cộng $7$ từ xuất hiện: <code>free</code> (0), <code>win</code> (0), <code>money</code> (1), <code>project</code> (3), <code>meeting</code> (3).</li>
              </ul>
              Áp dụng Laplace Smoothing ($\alpha = 1$), hãy phân loại email mới $E = \text{"free project"}$.
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Xác suất tiên nghiệm:</strong> $P(\text{Spam}) = \frac{2}{4} = 0.5, \; P(\text{Ham}) = 0.5$.</p>
              <p><strong>Bước 2 — Xác suất từ có điều kiện với $\alpha=1, |V|=5$:</strong></p>
              <ul>
                <li>Lớp Spam (mẫu số $8 + 1 \times 5 = 13$): $P(\text{free}\mid\text{Spam}) = \frac{3+1}{13} = \frac{4}{13}$, $P(\text{project}\mid\text{Spam}) = \frac{0+1}{13} = \frac{1}{13}$.</li>
                <li>Lớp Ham (mẫu số $7 + 1 \times 5 = 12$): $P(\text{free}\mid\text{Ham}) = \frac{0+1}{12} = \frac{1}{12}$, $P(\text{project}\mid\text{Ham}) = \frac{3+1}{12} = \frac{4}{12}$.</li>
              </ul>
              <p><strong>Bước 3 — So sánh điểm hậu nghiệm:</strong></p>
              $$S(\text{Spam}) = 0.5 \times \frac{4}{13} \times \frac{1}{13} = \frac{2}{169} \approx 0.01183, \qquad S(\text{Ham}) = 0.5 \times \frac{1}{12} \times \frac{4}{12} = \frac{2}{144} \approx 0.01389$$
              <p>Vì $S(\text{Ham}) > S(\text{Spam})$ (xác suất chuẩn hóa $P(\text{Ham}\mid E) \approx 54.0\%$), email được phân loại là <strong>Ham (Hợp lệ)</strong>. Nếu không có Laplace smoothing, cả hai nhánh đều bị nhân với $0$!</p>
            `,
            verifyCode: String.raw`# Kiểm chứng Bài tập 3.1: Multinomial Naive Bayes với Laplace Smoothing (alpha = 1)
V = 5
alpha = 1.0
spam_counts = {'free': 3, 'win': 2, 'money': 2, 'project': 0, 'meeting': 1}
ham_counts  = {'free': 0, 'win': 0, 'money': 1, 'project': 3, 'meeting': 3}

total_spam = sum(spam_counts.values())
total_ham = sum(ham_counts.values())

email = ['free', 'project']
score_spam = 0.5
score_ham = 0.5
for w in email:
    score_spam *= (spam_counts[w] + alpha) / (total_spam + alpha * V)
    score_ham  *= (ham_counts[w] + alpha) / (total_ham + alpha * V)

prob_spam = score_spam / (score_spam + score_ham)
print(f"Điểm chưa chuẩn hóa -> Spam: {score_spam:.5f} | Ham: {score_ham:.5f}")
print(f"Xác suất hậu nghiệm -> P(Spam|E) = {prob_spam:.4f}, P(Ham|E) = {1-prob_spam:.4f}")
print("Kết luận:", "SPAM" if prob_spam > 0.5 else "HAM (Email thường)")`
          },
          {
            title: 'Bài tập 3.2: Xác định Siêu phẳng cực đại lề & Độ rộng Margin của SVM',
            problemHtml: String.raw`
              Trong không gian $\mathbb{R}^2$, lớp âm ($y=-1$) có điểm $A(1, 1)$ và lớp dương ($y=+1$) có điểm $B(3, 3), C(4, 3)$. Tìm phương trình siêu phẳng Hard-Margin SVM tối ưu, các Support Vectors và độ rộng lề $\gamma$.
            `,
            solutionHtml: String.raw`
              <p>Hai điểm gần nhau nhất khác lớp là $A(1,1)$ và $B(3,3)$ (khoảng cách Euclid $d(A,B) = \sqrt{(3-1)^2 + (3-1)^2} = 2\sqrt{2}$).</p>
              <p>Vector pháp tuyến cùng phương $\overrightarrow{AB} = [2, 2]^T$. Đặt $w = [a, a]^T$, trung điểm $M(2, 2)$ nằm trên siêu phẳng nên $2a + 2a + b = 0 \Rightarrow b = -4a$.</p>
              <p>Điều kiện biên chuẩn hóa tại $B(3, 3)$: $w^T x_B + b = 1 \implies 3a + 3a - 4a = 1 \implies a = 0.5, \; b = -2$.</p>
              <ul>
                <li><strong>Siêu phẳng tối ưu:</strong> $0.5x_1 + 0.5x_2 - 2 = 0 \iff x_1 + x_2 - 4 = 0$.</li>
                <li>Kiểm tra $C(4,3)$: $0.5(4) + 0.5(3) - 2 = 1.5 > 1$ (nằm ngoài biên). Vậy hai Support Vectors là $A(1,1)$ và $B(3,3)$.</li>
                <li><strong>Độ rộng lề cực đại:</strong> $\gamma = \frac{2}{\|w\|_2} = \frac{2}{\sqrt{0.5^2 + 0.5^2}} = \frac{2}{\sqrt{0.5}} = 2\sqrt{2} \approx 2.8284$.</li>
              </ul>
            `,
            verifyCode: String.raw`import numpy as np
from sklearn.svm import SVC

X = np.array([[1.0, 1.0], [3.0, 3.0], [4.0, 3.0]])
y = np.array([-1, 1, 1])

clf = SVC(kernel='linear', C=1e3)
clf.fit(X, y)
w = clf.coef_[0]
b = clf.intercept_[0]
margin = 2.0 / np.linalg.norm(w)

print("Trọng số w =", np.round(w, 4), ", b =", np.round(b, 4))
print("Các Support Vectors:\n", clf.support_vectors_)
print(f"Độ rộng Margin = {margin:.4f} (2*sqrt(2) = {2*np.sqrt(2):.4f})")`
          }
        ],
        quiz: [
          {
            q: 'Mục đích cốt lõi của kỹ thuật Laplace Smoothing trong Multinomial Naive Bayes là gì?',
            options: [
              'Tăng tốc độ nhân ma trận trên GPU',
              'Ngăn xác suất hậu nghiệm bị triệt tiêu về 0 khi gặp từ vựng mới chưa từng xuất hiện ở một lớp trong tập huấn luyện',
              'Giảm số chiều của ảnh màu RGB',
              'Biến mô hình tuyến tính thành mạng tích chập sâu'
            ],
            answer: 1,
            explain: 'Do Naive Bayes nhân các xác suất thành phần P(w_k|c), chỉ cần một từ mới có tần suất bằng 0 sẽ kéo cả tích về 0. Cộng thêm α > 0 khắc phục triệt để vấn đề này.'
          },
          {
            q: 'Trong Soft-Margin SVM, khi ta tăng siêu tham số C lên rất lớn (C → ∞), hành vi của mô hình thay đổi như thế nào?',
            options: [
              'Độ rộng lề tăng lên tối đa và bỏ qua toàn bộ dữ liệu huấn luyện',
              'Mô hình phạt rất nặng các điểm vi phạm lề, thu hẹp Margin để phân loại đúng tối đa tập train (dễ Overfitting hơn)',
              'Số lượng lớp phân loại tự động tăng gấp đôi',
              'Hàm Kernel RBF tự chuyển thành hàm bậc nhất'
            ],
            answer: 1,
            explain: 'Tham số C nhân trực tiếp với tổng biến bù Σξ_i. C càng lớn thì chi phí vi phạm lề càng đắt, buộc SVM co hẹp lề để ép ξ_i → 0 (tiệm cận Hard-Margin SVM).'
          },
          {
            q: 'Những điểm dữ liệu nào thực sự quyết định vị trí của siêu phẳng phân cách trong thuật toán SVM?',
            options: [
              'Tất cả các điểm nằm xa biên phân cách nhất',
              'Trọng tâm trung bình cộng của mỗi lớp',
              'Chỉ các Support Vectors (các điểm nằm trên biên hoặc vi phạm vào trong vùng lề, có α_i > 0)',
              'Các điểm có giá trị đặc trưng bằng 0'
            ],
            answer: 2,
            explain: 'Theo điều kiện bù KKT, chỉ những điểm nằm ngay trên lề hoặc vi phạm lề mới có nhân tử đối ngẫu α_i > 0. Dịch chuyển các điểm ở xa ngoài lề không làm đổi siêu phẳng.'
          }
        ],
        labs: [
          {
            title: 'Lab 3.1: Bộ lọc Email Spam thực tế (Multinomial Naive Bayes)',
            code: String.raw`# ==============================================================================
# MODULE 3 - LAB 3.1: BÀI TOÁN LỌC EMAIL SPAM BẰNG MULTINOMIAL NAIVE BAYES
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import confusion_matrix, accuracy_score

# 1. Tập dữ liệu Email mẫu (0 = Ham / Email công việc & học tập, 1 = Spam / Quảng cáo lừa đảo)
emails = [
    "win free prize money click link claim bonus now",
    "urgent winner lottery cash prize claim free gift card",
    "get cheap loan fast approval free credit bonus offer",
    "exclusive casino free spins win cash prize tonight",
    "congratulations claim your free iphone gift voucher link",
    "earn fast money online work from home bonus cash",
    "limited offer buy cheap watches discount click now",
    "urgent verify bank account password click security link",
    "free viagra discount pharmacy cheap pills offer online",
    "winner selected claim instant cash reward free today",
    "hi team meeting tomorrow morning discuss ml project slides",
    "please review lecture notes linear regression homework deadline",
    "attached python report dataset analysis for client meeting",
    "professor updated exam schedule room assignment next week",
    "can we schedule code review for naive bayes module today",
    "project milestone update quarterly engineering roadmap document",
    "lunch tomorrow at campus cafeteria after lab session",
    "thanks for sending feedback on research paper draft",
    "git repository updated please pull latest commit before testing",
    "weekly lab meeting agenda machine learning model evaluation"
]
labels = np.array([1]*10 + [0]*10)

# Chia tập huấn luyện (16 email) và kiểm thử + email mới
train_idx = [0,1,2,3,4,5,6,7, 10,11,12,13,14,15,16,17]
test_idx  = [8,9, 18,19]

vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform([emails[i] for i in train_idx])
y_train = labels[train_idx]

# Huấn luyện Multinomial Naive Bayes với Laplace Smoothing (alpha = 1.0)
nb_clf = MultinomialNB(alpha=1.0)
nb_clf.fit(X_train, y_train)

# 2. Kiểm thử trên các email hoàn toàn mới
new_inbox = [
    "Congratulations! Click link now to claim free cash prize",
    "Hi Nam, please review our Python machine learning project code before tomorrow meeting",
    "Urgent offer: get free bonus gift voucher and cheap loan today",
    "Professor shared homework assignment and exam schedule notes"
]
X_new = vectorizer.transform(new_inbox)
probs_spam = nb_clf.predict_proba(X_new)[:, 1]

print("=== KẾT QUẢ BỘ LỌC EMAIL SPAM (MULTINOMIAL NAIVE BAYES, α=1.0) ===")
for text, p_spam in zip(new_inbox, probs_spam):
    tag = "[SPAM]" if p_spam >= 0.5 else "[HAM ]"
    print(f"{tag} (P_spam = {p_spam*100:5.1f}%) | \"{text[:62]}...\"")

# Tìm các từ khóa có tỷ số Log-Likelihood nghiêng về Spam vs Ham mạnh nhất
vocab = np.array(vectorizer.get_feature_names_out())
log_ratio = nb_clf.feature_log_prob_[1] - nb_clf.feature_log_prob_[0]
top_spam_idx = np.argsort(log_ratio)[-7:]
top_ham_idx = np.argsort(log_ratio)[:7]

# 3. Vẽ biểu đồ Top từ khóa đặc trưng Spam vs Ham
fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))

axes[0].barh(vocab[top_spam_idx], log_ratio[top_spam_idx], color='#ef4444')
axes[0].set_title('Top từ khóa chỉ báo SPAM mạnh nhất\nlog P(w|Spam) - log P(w|Ham)')
axes[0].set_xlabel('Log-Likelihood Ratio')
axes[0].grid(axis='x', alpha=0.3)

axes[1].barh(vocab[top_ham_idx], -log_ratio[top_ham_idx], color='#10b981')
axes[1].set_title('Top từ khóa chỉ báo HAM (Hợp lệ) mạnh nhất\nlog P(w|Ham) - log P(w|Spam)')
axes[1].set_xlabel('Log-Likelihood Ratio')
axes[1].grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 3.2: Phân loại Chữ số viết tay & Trực quan hóa Kernel SVM',
            code: String.raw`# ==============================================================================
# MODULE 3 - LAB 3.2: PHÂN LOẠI ẢNH CHỮ SỐ & SO SÁNH KERNEL TRICK TRONG SVM
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits, make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# PHẦN A: Phân loại ảnh chữ số viết tay 8x8 (10 lớp 0..9) bằng RBF SVM
digits = load_digits()
X_tr, X_te, y_tr, y_te, img_tr, img_te = train_test_split(
    digits.data, digits.target, digits.images, test_size=0.25, random_state=42, stratify=digits.target
)

scaler = StandardScaler()
X_tr_sc = scaler.fit_transform(X_tr)
X_te_sc = scaler.transform(X_te)

for kernel_name in ['linear', 'poly', 'rbf']:
    clf = SVC(kernel=kernel_name, C=3.0, gamma='scale')
    clf.fit(X_tr_sc, y_tr)
    acc = accuracy_score(y_te, clf.predict(X_te_sc))
    print(f"SVM ({kernel_name:6s} kernel) trên tập ảnh chữ số -> Độ chính xác Test: {acc*100:.2f}% | Số Support Vectors: {len(clf.support_)}")

# PHẦN B: Trực quan hóa Kernel Trick trên tập dữ liệu phi tuyến Make-Moons 2D
X_m, y_m = make_moons(n_samples=160, noise=0.2, random_state=42)
svm_configs = [
    ('Linear SVM (C=1)', SVC(kernel='linear', C=1.0)),
    ('Polynomial SVM (bậc 3)', SVC(kernel='poly', degree=3, coef0=1, C=2.0)),
    ('RBF Kernel SVM (C=3, γ=1.2)', SVC(kernel='rbf', C=3.0, gamma=1.2))
]

xx, yy = np.meshgrid(np.linspace(-1.6, 2.6, 200), np.linspace(-1.1, 1.6, 200))
fig, axes = plt.subplots(1, 3, figsize=(12, 3.8))

for ax, (title, model) in zip(axes, svm_configs):
    model.fit(X_m, y_m)
    Z = model.decision_function(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    acc_m = accuracy_score(y_m, model.predict(X_m))

    ax.contourf(xx, yy, Z > 0, alpha=0.25, cmap='coolwarm')
    # Vẽ biên quyết định f(x)=0 (nét liền) và hai biên lề f(x)=±1 (nét đứt)
    ax.contour(xx, yy, Z, levels=[-1, 0, 1], colors=['#475569', '#0f172a', '#475569'],
               linestyles=['--', '-', '--'], linewidths=[1.1, 2.0, 1.1])
    ax.scatter(X_m[:, 0], X_m[:, 1], c=y_m, cmap='coolwarm', s=28, edgecolors='k')
    # Khoanh tròn các Support Vectors
    ax.scatter(model.support_vectors_[:, 0], model.support_vectors_[:, 1],
               s=85, facecolors='none', edgecolors='#f59e0b', linewidths=1.4, label=f'SV ({len(model.support_)})')
    ax.set_title(f"{title}\nAcc: {acc_m*100:.1f}%", fontsize=9.5, fontweight='bold')
    ax.legend(loc='lower left', fontsize=7.5)
    ax.grid(alpha=0.2)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
