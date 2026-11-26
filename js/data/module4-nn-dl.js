/**
 * Dữ liệu Học tập — MODULE 4: MẠNG NƠ-RON NHÂN TẠO & HỌC SÂU (NEURAL NETWORKS & DEEP LEARNING)
 * Bao gồm: Lý thuyết (HTML + KaTeX), Bài tập mẫu có lời giải, Trắc nghiệm & Code mẫu Python.
 * Tự động đăng ký vào mảng toàn cục window.COURSE_MODULES.
 */
window.COURSE_MODULES = window.COURSE_MODULES || [];
window.COURSE_MODULES.push(
// ========================================================================
      // MODULE 4: MẠNG NƠ-RON NHÂN TẠO & HỌC SÂU (NEURAL NETWORKS & DEEP LEARNING)
      // ========================================================================
      {
        id: 'module-4',
        shortLabel: 'M4 • NN & CNN',
        badge: 'MODULE 04 / 06',
        title: 'Mạng Nơ-ron Nhân tạo & Học sâu (MLP, DNN & CNN)',
        subtitle: 'Perceptron & bài toán XOR, MLP & Backpropagation, BatchNorm/Dropout, Kiến trúc CNN (AlexNet, ResNet) & Object Detection (YOLO, R-CNN).',
        tags: ['Perceptron & XOR', 'MLP & Backprop', 'BatchNorm & Dropout', 'CNN Conv/Pooling', 'ResNet / YOLO / R-CNN'],
        theoryHtml: String.raw`
          <h3>1. Perceptron, PLA & Giới hạn với Bài toán XOR</h3>
          <p>
            <strong>Perceptron</strong> là mô hình đơn nơ-ron tuyến tính $\hat{y} = \text{sign}(w^T x + b)$. Thuật toán học <strong>PLA (Perceptron Learning Algorithm)</strong> cập nhật $w \leftarrow w + \eta y_i x_i$ mỗi khi gặp điểm bị phân loại sai ($y_i(w^T x_i + b) \le 0$). Định lý hội tụ Perceptron đảm bảo PLA dừng sau hữu hạn bước <em>khi và chỉ khi dữ liệu tách biệt tuyến tính</em>.
          </p>
          <p>
            <strong>Giới hạn XOR (Chứng minh đại số):</strong> Cổng logic XOR có $(0,0)\to 0, (1,1)\to 0$ nhưng $(0,1)\to 1, (1,0)\to 1$. Nếu một Perceptron đơn tầng $w_1 x_1 + w_2 x_2 + b$ phân loại đúng cả $4$ điểm thì phải thỏa đồng thời:
          </p>
          <div class="math-card bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            $$(0,0): \; b &lt; 0, \qquad (0,1): \; w_2 + b \ge 0, \qquad (1,0): \; w_1 + b \ge 0 \implies w_1 + w_2 + 2b \ge 0 \implies w_1 + w_2 + b \ge -b &gt; 0$$
          </div>
          <p>
            Điều này <strong>mâu thuẫn trực tiếp</strong> với điều kiện của $(1,1)$ là $w_1 + w_2 + b &lt; 0$! Khắc phục giới hạn này đòi hỏi xếp chồng nhiều tầng ẩn có hàm kích hoạt phi tuyến — hình thành <strong>Multi-Layer Perceptron (MLP)</strong>.
          </p>

          <h3>2. Mạng Đa tầng (MLP), Hàm Kích hoạt &amp; Lan truyền Ngược (Backpropagation)</h3>
          <ul>
            <li><strong>Các hàm kích hoạt (Activation Functions) &amp; Đạo hàm:</strong>
              <ul>
                <li><strong>Sigmoid:</strong> $\sigma(z) = \frac{1}{1+e^{-z}} \in (0,1)$, đạo hàm $\sigma'(z) = \sigma(z)(1-\sigma(z)) \le 0.25$ nên khi nhân chuỗi qua nhiều tầng gây <em>Triệt tiêu đạo hàm (Vanishing Gradient)</em>.</li>
                <li><strong>Tanh:</strong> $\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}} \in (-1, 1)$, $\tanh'(z) = 1 - \tanh^2(z)$, đối xứng quanh $0$ giúp hội tụ tốt hơn Sigmoid nhưng vẫn bão hòa ở hai đầu.</li>
                <li><strong>ReLU &amp; Leaky ReLU:</strong> $\text{ReLU}(z) = \max(0, z)$ có $\text{ReLU}'(z) = \mathbb{I}(z &gt; 0)$ giải quyết hiệu quả Vanishing Gradient; $\text{Leaky ReLU}(z) = \max(\alpha z, z)$ ($\alpha \approx 0.01$) khắc phục tình trạng <em>Dying ReLU</em>.</li>
                <li><strong>Softmax:</strong> Đặt ở tầng cuối cùng cho bài toán phân loại đa lớp.</li>
              </ul>
            </li>
            <li><strong>Lan truyền tiến (Forward) &amp; Lan truyền ngược (Backpropagation) tổng quát:</strong> Với mỗi tầng $l \in \{1, \dots, L\}$, hàm kích hoạt $f$ và hàm mất mát bất kỳ $C$:</li>
          </ul>
          <div class="math-card bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
            $$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}, \qquad a^{[l]} = f^{[l]}\big(z^{[l]}\big)$$
            $$\delta^{[L]} = \nabla_{a^{[L]}} C \odot f'^{[L]}\big(z^{[L]}\big), \qquad \delta^{[l]} = \Big((W^{[l+1]})^T \delta^{[l+1]}\Big) \odot f'^{[l]}\big(z^{[l]}\big), \qquad \frac{\partial C}{\partial W^{[l]}} = \delta^{[l]} (a^{[l-1]})^T, \qquad \frac{\partial C}{\partial b^{[l]}} = \delta^{[l]}$$
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Trường hợp riêng với hàm mất mát Cross-Entropy trung bình trên mini-batch $N$ mẫu kết hợp Sigmoid/Softmax ở tầng cuối, $\delta^{[L]}$ rút gọn đẹp thành $\hat{Y} - Y$ và gradient theo $W^{[l]}$ chia thêm cho $N$.
          </p>

          <h3>3. Huấn luyện Mạng Sâu (DNN) &amp; Mạng Tích chập (CNN)</h3>
          <ul>
            <li><strong>Batch Normalization &amp; Dropout:</strong>
              <ul>
                <li><strong>BatchNorm:</strong> Chuẩn hóa đầu ra từng mini-batch $\hat{z} = \frac{z - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$ rồi dịch-co $y = \gamma \hat{z} + \beta$, giúp ổn định phân phối kích hoạt, cho phép dùng learning rate lớn hơn và giảm phụ thuộc vào khởi tạo trọng số.</li>
                <li><strong>Dropout:</strong> Ngẫu nhiên tắt một tỷ lệ $p$ nơ-ron trong lúc huấn luyện, buộc mạng học các biểu diễn dư thừa bền vững (tương đương trung bình hóa tổ hợp rất nhiều mạng con), chống Overfitting mạnh mẽ.</li>
              </ul>
            </li>
            <li><strong>Kiến trúc CNN (Convolutional Neural Networks):</strong> Bộ lọc kích thước $k_h \times k_w$ trượt với bước nhảy <strong>Stride $s$</strong> và đệm viền <strong>Padding $p$</strong>, theo sau bởi <strong>Pooling</strong>:</li>
          </ul>
          <div class="math-card bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            $$H_{\text{out}} = \left\lfloor \frac{H_{\text{in}} + 2p - k_h}{s} \right\rfloor + 1, \quad W_{\text{out}} = \left\lfloor \frac{W_{\text{in}} + 2p - k_w}{s} \right\rfloor + 1, \qquad \text{Params}_{\text{Conv}} = (k_w \times k_h \times C_{\text{in}} + 1) \times C_{\text{out}}$$
          </div>
          <ul>
            <li><strong>Các cột mốc kiến trúc CNN &amp; Phát hiện vật thể (Object Detection):</strong>
              <ul>
                <li><strong>AlexNet (2012):</strong> Tiên phong dùng ReLU, Dropout và huấn luyện GPU trên ImageNet, mở ra bùng nổ Deep Learning.</li>
                <li><strong>ResNet (2015):</strong> Giới thiệu <strong>Kết nối tắt (Skip / Residual Connection)</strong> $H(x) = \mathcal{F}(x) + x$, khi đạo hàm ngược $\frac{\partial \mathcal{L}}{\partial x} = \frac{\partial \mathcal{L}}{\partial H}\left(\frac{\partial \mathcal{F}}{\partial x} + I\right)$ luôn giữ thành phần đơn vị $I$ bảo toàn gradient qua hơn 100 tầng.</li>
                <li><strong>Họ R-CNN (R-CNN, Fast R-CNN, Faster R-CNN):</strong> Kiến trúc <em>2 giai đoạn (Two-stage)</em> — đề xuất vùng ứng viên (Region Proposals / RPN) trước rồi phân loại và tinh chỉnh tọa độ Bounding Box, ưu thế độ chính xác cao.</li>
                <li><strong>YOLO (You Only Look Once):</strong> Kiến trúc <em>1 giai đoạn (One-stage)</em> — chia ảnh thành lưới $S \times S$ và dự đoán đồng thời tọa độ hộp giới hạn $(x, y, w, h)$ cùng xác suất lớp trong một lần đọc ảnh duy nhất, đạt tốc độ xử lý thời gian thực (real-time FPS cao).</li>
              </ul>
            </li>
          </ul>
          <div class="my-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-surface-900/70">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Các dạng bài tập &amp; Cách ra đề thường gặp</h4>
            <ul class="!mb-0 text-sm space-y-1">
              <li><strong>Dạng 1 — Lan truyền tiến MLP 2 tầng:</strong> Cho $W^{[1]}, b^{[1]}, W^{[2]}, b^{[2]}$ và đầu vào $x$, tính lần lượt $z^{[1]}, a^{[1]}, z^{[2]}, a^{[2]}$ với ReLU / Sigmoid.</li>
              <li><strong>Dạng 2 — Giải bài toán XOR bằng MLP:</strong> Thiết kế trọng số 2 tầng ẩn (Step hoặc ReLU) để tách dữ liệu XOR phi tuyến.</li>
              <li><strong>Dạng 3 — Kích thước Feature Map &amp; Tham số CNN:</strong> Cho ảnh đầu vào đi qua chuỗi các tầng Conv2D ($k, p, s, C_{\text{out}}$) và MaxPool, tính kích thước tensor ra và tổng tham số huấn luyện.</li>
            </ul>
          </div>
          <div class="interactive-lab-mount my-6" data-interactive-lab="module-4"></div>
          <div class="theory-quick-check my-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20" data-answer="1">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span>⚡ Kiểm tra nhanh hiểu bài</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white !mb-2.5">Tầng Conv2D có $8$ bộ lọc $3 \times 3$ ($P=0, S=1$, có bias) nhận ảnh RGB đầu vào kích thước $16 \times 16 \times 3$. Kích thước đầu ra và tổng số tham số của tầng là bao nhiêu?</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-qc-opt="0" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">A. $16 \times 16 \times 8$ và $80$ tham số</button>
              <button type="button" data-qc-opt="1" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">B. $14 \times 14 \times 8$ và $224$ tham số</button>
              <button type="button" data-qc-opt="2" class="qc-opt-btn px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-850 text-xs font-medium cursor-pointer transition">C. $14 \times 14 \times 3$ và $216$ tham số</button>
            </div>
            <div class="qc-explain hidden">Chiều cao/rộng: $\lfloor(16 - 3 + 0)/1\rfloor + 1 = 14$, số kênh ra bằng số bộ lọc $C_{\text{out}} = 8$. Tổng tham số $= (3 \times 3 \times 3 + 1) \times 8 = 28 \times 8 = 224$.</div>
            <div class="qc-feedback hidden mt-2.5 p-2.5 rounded-lg text-xs leading-relaxed"></div>
          </div>
        `,
        exercises: [
          {
            title: 'Bài tập 4.1: Giải bài toán XOR bằng mạng MLP 2 tầng',
            problemHtml: String.raw`
              Cho mạng MLP gồm 2 đầu vào $(x_1, x_2) \in \{0,1\}^2$, tầng ẩn gồm 2 nơ-ron dùng <strong>hàm kích hoạt bước nhảy (Step function)</strong> $g(z) = \mathbb{I}(z \ge 0)$ biểu diễn cổng OR và NAND, ghép vào nơ-ron đầu ra.
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Hãy chỉ ra bộ trọng số giải chính xác bài toán XOR: $x_1 \oplus x_2 = (x_1 \lor x_2) \land \neg(x_1 \land x_2)$.</li>
                <li><em>Mở rộng:</em> Nếu thay hàm bước nhảy bằng hàm kích hoạt <strong>ReLU</strong> $\max(0, z)$ ở tầng ẩn, thiết kế một bộ trọng số thay thế biểu diễn chính xác phép XOR.</li>
              </ol>
            `,
            solutionHtml: String.raw`
              <p><strong>1. Với hàm kích hoạt bước nhảy $g(z) = \mathbb{I}(z \ge 0)$ (cổng OR &amp; NAND):</strong></p>
              <ul>
                <li>Nơ-ron ẩn $h_1$ (cổng OR): $h_1 = g(x_1 + x_2 - 0.5)$. Cho $h_1 = 1$ khi ít nhất một biến bằng $1$.</li>
                <li>Nơ-ron ẩn $h_2$ (cổng NAND): $h_2 = g(-x_1 - x_2 + 1.5)$. Cho $h_2 = 0$ chỉ khi cả hai biến bằng $1$.</li>
                <li>Nơ-ron ra $\hat{y}$ (cổng AND của $h_1, h_2$): $\hat{y} = g(h_1 + h_2 - 1.5)$.</li>
              </ul>
              <p>Kiểm tra cả 4 mẫu: $(0,0)\to h=(0,1)\to 0$; $(0,1)\to h=(1,1)\to 1$; $(1,0)\to h=(1,1)\to 1$; $(1,1)\to h=(1,0)\to 0$. Trong không gian ẩn $(h_1, h_2)$, dữ liệu đã trở thành khả tách tuyến tính!</p>
              <p><strong>2. Mở rộng với hàm kích hoạt $\text{ReLU}(z) = \max(0, z)$:</strong></p>
              <p><em>Lưu ý:</em> Không thể giữ nguyên trọng số trên cho ReLU vì $\text{ReLU}$ không bị chặn về $\{0,1\}$. Một nghiệm chuẩn dùng ReLU là:</p>
              $$h_1 = \text{ReLU}(x_1 + x_2), \qquad h_2 = \text{ReLU}(x_1 + x_2 - 1), \qquad \hat{y} = h_1 - 2h_2$$
              <p>Kiểm tra: $(0,0)\to 0 - 0 = 0$; $(0,1)\text{ và }(1,0)\to 1 - 0 = 1$; $(1,1)\to 2 - 2(1) = 0$.</p>
            `,
            verifyCode: String.raw`import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y_xor = np.array([0, 1, 1, 0])

print("=== CÁCH 1: MẠNG STEP FUNCTION (CỔNG OR + NAND) ===")
step = lambda z: (z >= 0).astype(int)
h1 = step(X[:, 0] + X[:, 1] - 0.5)        # Cổng OR
h2 = step(-X[:, 0] - X[:, 1] + 1.5)       # Cổng NAND
y_pred_step = step(h1 + h2 - 1.5)         # Cổng AND(h1, h2)

for x_i, h_i, yp, yt in zip(X, np.c_[h1, h2], y_pred_step, y_xor):
    print(f"Input {x_i.astype(int)} -> h_step={h_i} -> Dự đoán = {yp} (Thực: {yt})")

print("\n=== CÁCH 2: MẠNG RELU HIỆN ĐẠI ===")
relu = lambda z: np.maximum(0.0, z)
r1 = relu(X[:, 0] + X[:, 1])
r2 = relu(X[:, 0] + X[:, 1] - 1.0)
y_pred_relu = (r1 - 2.0 * r2).astype(int)

for x_i, r_i, yp, yt in zip(X, np.c_[r1, r2], y_pred_relu, y_xor):
    print(f"Input {x_i.astype(int)} -> h_relu={r_i.astype(int)} -> Dự đoán = {yp} (Thực: {yt})")`
          },
          {
            title: 'Bài tập 4.2: Tính Kích thước Feature Map & Số lượng Tham số chuỗi tầng CNN',
            problemHtml: String.raw`
              Ảnh màu RGB kích thước $32 \times 32 \times 3$ đi tuần tự qua 4 tầng:
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li><strong>Tầng Conv1:</strong> $32$ bộ lọc kích thước $3 \times 3$, Padding $P = 1$, Stride $S = 1$ (có dùng bias).</li>
                <li><strong>Tầng MaxPool1:</strong> cửa sổ $2 \times 2$, Stride $S = 2$, Padding $P = 0$.</li>
                <li><strong>Tầng Conv2:</strong> $32$ bộ lọc kích thước $3 \times 3$, Padding $P = 1$, Stride $S = 1$ (có dùng bias).</li>
                <li><strong>Tầng MaxPool2:</strong> cửa sổ $2 \times 2$, Stride $S = 2$, Padding $P = 0$.</li>
              </ol>
              Tính kích thước Tensor đầu ra sau mỗi tầng và tổng số tham số huấn luyện của toàn bộ mạng trích xuất trên.
            `,
            solutionHtml: String.raw`
              <p><strong>1. Sau tầng Conv1:</strong></p>
              $$H_1 = W_1 = \left\lfloor \frac{32 - 3 + 2(1)}{1} \right\rfloor + 1 = 32 \implies \text{Kích thước: } 32 \times 32 \times 32$$
              <p>Số tham số Conv1: $(3 \times 3 \times 3 + 1) \times 32 = 28 \times 32 = \mathbf{896}$ tham số.</p>
              <p><strong>2. Sau tầng MaxPool1:</strong> $H_2 = \left\lfloor \frac{32 - 2}{2} \right\rfloor + 1 = 16 \implies \mathbf{16 \times 16 \times 32}$ ($0$ tham số).</p>
              <p><strong>3. Sau tầng Conv2:</strong> $H_3 = \left\lfloor \frac{16 - 3 + 2(1)}{1} \right\rfloor + 1 = 16 \implies \mathbf{16 \times 16 \times 32}$.</p>
              <p>Số tham số Conv2 (lúc này $C_{\text{in}} = 32$): $(3 \times 3 \times 32 + 1) \times 32 = 289 \times 32 = \mathbf{9,248}$ tham số.</p>
              <p><strong>4. Sau tầng MaxPool2:</strong> $H_4 = \left\lfloor \frac{16 - 2}{2} \right\rfloor + 1 = 8 \implies \mathbf{8 \times 8 \times 32}$ ($0$ tham số).</p>
              <p><strong>Tổng số tham số toàn khối:</strong> $896 + 0 + 9,248 + 0 = \mathbf{10,144}$ tham số.</p>
            `,
            verifyCode: String.raw`def conv_out_dim(h_in, k, p, s):
    return (h_in - k + 2 * p) // s + 1

H1 = conv_out_dim(32, k=3, p=1, s=1)
p_conv1 = (3 * 3 * 3 + 1) * 32
H2 = conv_out_dim(H1, k=2, p=0, s=2)
H3 = conv_out_dim(H2, k=3, p=1, s=1)
p_conv2 = (3 * 3 * 32 + 1) * 32
H4 = conv_out_dim(H3, k=2, p=0, s=2)

print(f"Sau Conv1    : {H1} x {H1} x 32 | Tham số = {p_conv1}")
print(f"Sau MaxPool1 : {H2} x {H2} x 32 | Tham số = 0")
print(f"Sau Conv2    : {H3} x {H3} x 32 | Tham số = {p_conv2}")
print(f"Sau MaxPool2 : {H4} x {H4} x 32 | Tham số = 0")
print(f"Tổng tham số : {p_conv1 + p_conv2}")`
          },
          {
            title: 'Bài tập 4.3: Lan truyền tiến (Forward Pass) qua Mạng MLP 2 tầng',
            problemHtml: String.raw`
              Cho mạng MLP 2 tầng với đầu vào $x = \begin{bmatrix} 1 \\ 2 \end{bmatrix}$. Tầng ẩn dùng hàm kích hoạt $\text{ReLU}(z) = \max(0, z)$ và tầng đầu ra dùng hàm $\text{Sigmoid}$ $\sigma(z) = \frac{1}{1+e^{-z}}$:
              $$W^{[1]} = \begin{bmatrix} 0.5 & -0.5 \\ 1.0 & 0.5 \end{bmatrix}, \quad b^{[1]} = \begin{bmatrix} 0.2 \\ -1.0 \end{bmatrix}, \qquad W^{[2]} = \begin{bmatrix} 1.0 & 0.8 \end{bmatrix}, \quad b^{[2]} = -0.2$$
              Hãy tính lần lượt $z^{[1]}, a^{[1]}, z^{[2]}$ và đầu ra dự đoán $\hat{y} = a^{[2]}$.
            `,
            solutionHtml: String.raw`
              <p><strong>Bước 1 — Tầng ẩn $l = 1$ (ReLU):</strong></p>
              $$z^{[1]} = W^{[1]}x + b^{[1]} = \begin{bmatrix} 0.5(1) - 0.5(2) + 0.2 \\ 1.0(1) + 0.5(2) - 1.0 \end{bmatrix} = \begin{bmatrix} -0.3 \\ 1.0 \end{bmatrix}$$
              $$a^{[1]} = \text{ReLU}(z^{[1]}) = \begin{bmatrix} \max(0, -0.3) \\ \max(0, 1.0) \end{bmatrix} = \begin{bmatrix} 0.0 \\ 1.0 \end{bmatrix}$$
              <p><strong>Bước 2 — Tầng đầu ra $l = 2$ (Sigmoid):</strong></p>
              $$z^{[2]} = W^{[2]}a^{[1]} + b^{[2]} = 1.0(0.0) + 0.8(1.0) - 0.2 = 0.6$$
              $$\hat{y} = a^{[2]} = \sigma(0.6) = \frac{1}{1 + e^{-0.6}} \approx \mathbf{0.6457}$$
            `,
            verifyCode: String.raw`import numpy as np

x = np.array([1.0, 2.0])
W1 = np.array([[0.5, -0.5], [1.0, 0.5]])
b1 = np.array([0.2, -1.0])
W2 = np.array([[1.0, 0.8]])
b2 = np.array([-0.2])

z1 = W1 @ x + b1
a1 = np.maximum(0.0, z1)
z2 = float((W2 @ a1 + b2)[0])
a2 = 1.0 / (1.0 + np.exp(-z2))

print("z^[1] =", z1)
print("a^[1] (ReLU) =", a1)
print(f"z^[2] = {z2:.4f} -> y_hat = sigma(z^[2]) = {a2:.4f}")`
          }
        ],
        quiz: [
          {
            q: 'Cải tiến cốt lõi nào giúp kiến trúc ResNet huấn luyện thành công mạng sâu hàng trăm tầng mà không bị suy thoái đạo hàm?',
            options: [
              'Thay toàn bộ phép nhân ma trận bằng thuật toán K-Means',
              'Sử dụng kết nối tắt (Skip / Residual Connection) y = F(x) + x cho phép gradient truyền thẳng qua khối dư',
              'Chỉ sử dụng hàm kích hoạt bước nhảy nhị phân',
              'Xóa bỏ hoàn toàn các tầng tích chập'
            ],
            answer: 1,
            explain: 'Nhờ nhánh cộng trực tiếp +x, đạo hàm ∂y/∂x = ∂F(x)/∂x + I luôn có thành phần đơn vị I bảo toàn tín hiệu lỗi truyền ngược về các tầng đầu.'
          },
          {
            q: 'Sự khác biệt kiến trúc chính giữa YOLO và họ mô hình R-CNN trong bài toán Phát hiện vật thể (Object Detection) là gì?',
            options: [
              'YOLO là mô hình 1 giai đoạn dự đoán trực tiếp hộp giới hạn và lớp trong 1 lượt lan truyền (nhanh thời gian thực), còn R-CNN tách thành 2 giai đoạn (đề xuất vùng + phân loại)',
              'YOLO không dùng mạng CNN còn R-CNN chỉ dùng Naive Bayes',
              'YOLO chỉ nhận đầu vào là văn bản',
              'R-CNN không thể dự đoán tọa độ hộp giới hạn'
            ],
            answer: 0,
            explain: 'YOLO quy bài toán phát hiện vật thể về một bài toán hồi quy duy nhất từ pixel ảnh sang tọa độ hộp + xác suất lớp, tối ưu vượt trội về tốc độ khung hình (FPS).'
          },
          {
            q: 'Trong quá trình suy luận kiểm thử (Inference / Test time), kỹ thuật Dropout hoạt động như thế nào?',
            options: [
              'Tiếp tục xóa ngẫu nhiên 50% nơ-ron mỗi lần dự đoán',
              'Giữ nguyên toàn bộ mạng nơ-ron hoạt động đầy đủ (không tắt nơ-ron, với trọng số đã được cân chỉnh tỷ lệ)',
              'Tăng gấp đôi số tầng ẩn',
              'Đặt mọi trọng số bằng 0'
            ],
            answer: 1,
            explain: 'Dropout chỉ tắt ngẫu nhiên nơ-ron trong pha Training để chống đồng thích nghi. Ở pha Test (Inverted Dropout), toàn bộ nơ-ron đều được bật để cho dự đoán ổn định nhất.'
          }
        ],
        labs: [
          {
            title: 'Lab 4.1: Xây dựng mạng MLP phân loại chữ số viết tay (Digits MNIST)',
            code: String.raw`# ==============================================================================
# MODULE 4 - LAB 4.1: MẠNG NƠ-RON ĐA TẦNG (MLP) PHÂN LOẠI CHỮ SỐ VIẾT TAY
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

# 1. Tải tập dữ liệu chữ số viết tay (1,797 ảnh grayscale 8x8 -> 64 đặc trưng pixel, 10 lớp 0..9)
digits = load_digits()
X_train, X_test, y_train, y_test, img_train, img_test = train_test_split(
    digits.data, digits.target, digits.images, test_size=0.22, random_state=42, stratify=digits.target
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# 2. Xây dựng mạng MLP 2 tầng ẩn (64 -> 64 -> 32 -> 10) dùng hàm kích hoạt ReLU + tối ưu Adam
mlp = MLPClassifier(
    hidden_layer_sizes=(64, 32),
    activation='relu',
    solver='adam',
    alpha=1e-3,           # L2 Regularization chống Overfitting
    learning_rate_init=0.005,
    max_iter=90,
    random_state=42
)
mlp.fit(X_train_sc, y_train)

y_pred = mlp.predict(X_test_sc)
y_prob = mlp.predict_proba(X_test_sc)
acc = accuracy_score(y_test, y_pred)

print("=== KẾT QUẢ HUẤN LUYỆN MẠNG NƠ-RON ĐA TẦNG (MLP) ===")
print(f"Kiến trúc mạng     : Input(64) -> Dense(64, ReLU) -> Dense(32, ReLU) -> Softmax(10)")
print(f"Số Epoch hội tụ    : {mlp.n_iter_} vòng lặp | Loss cuối: {mlp.loss_:.5f}")
print(f"Độ chính xác (Test): {acc * 100:.2f}% ({np.sum(y_pred == y_test)}/{len(y_test)} mẫu đúng)")

# 3. Trực quan hóa đường cong Loss hội tụ & Kết quả nhận dạng chữ số viết tay
fig = plt.figure(figsize=(11.5, 4.4))
gs = fig.add_gridspec(2, 5, width_ratios=[1.9, 1, 1, 1, 1])

ax_loss = fig.add_subplot(gs[:, 0])
ax_loss.plot(mlp.loss_curve_, color='#4f46e5', linewidth=2.2)
ax_loss.set_title('Đường cong Cross-Entropy Loss\n(Backpropagation + Adam)')
ax_loss.set_xlabel('Epoch')
ax_loss.set_ylabel('Training Loss')
ax_loss.grid(alpha=0.3)

# Hiển thị 8 ảnh chữ số kiểm thử kèm xác suất dự đoán
for idx in range(8):
    r, c = idx // 4, (idx % 4) + 1
    ax = fig.add_subplot(gs[r, c])
    ax.imshow(img_test[idx], cmap='gray_r')
    conf = y_prob[idx, y_pred[idx]] * 100
    is_ok = (y_pred[idx] == y_test[idx])
    title_color = '#059669' if is_ok else '#dc2626'
    ax.set_title(f"Đoán: {y_pred[idx]} ({conf:.0f}%)\nThực: {y_test[idx]}", fontsize=8.5, color=title_color, fontweight='bold')
    ax.axis('off')

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 4.2: Trích xuất Đặc trưng Ảnh bằng CNN (Conv2D + ReLU + MaxPool)',
            code: String.raw`# ==============================================================================
# MODULE 4 - LAB 4.2: MÔ PHỎNG TẦNG TÍCH CHẬP CNN (CONV2D + RELU + MAX POOLING)
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits

# 1. Cài đặt trực tiếp phép Tích chập 2D (Padding, Stride), ReLU & Max Pooling bằng NumPy
def conv2d(image, kernel, padding=1, stride=1):
    padded = np.pad(image, pad_width=padding, mode='constant', constant_values=0.0)
    kh, kw = kernel.shape
    h_out = (padded.shape[0] - kh) // stride + 1
    w_out = (padded.shape[1] - kw) // stride + 1
    out = np.zeros((h_out, w_out))
    for i in range(h_out):
        for j in range(w_out):
            patch = padded[i*stride : i*stride + kh, j*stride : j*stride + kw]
            out[i, j] = np.sum(patch * kernel)
    return out

def relu(feature_map):
    return np.maximum(0.0, feature_map)

def max_pool2d(feature_map, pool_size=2, stride=2):
    h, w = feature_map.shape
    h_out = (h - pool_size) // stride + 1
    w_out = (w - pool_size) // stride + 1
    out = np.zeros((h_out, w_out))
    for i in range(h_out):
        for j in range(w_out):
            out[i, j] = np.max(feature_map[i*stride : i*stride+pool_size, j*stride : j*stride+pool_size])
    return out

# Tạo ảnh chữ số độ phân giải 16x16 (nội suy từ mẫu chữ số "8" trong tập Digits)
digits = load_digits()
sample_digit = digits.images[8]  # Chữ số 8
img_16 = np.kron(sample_digit, np.ones((2, 2))) / 16.0

# 2. Định nghĩa 3 bộ lọc tích chập (Kernels 3x3) kinh điển trong tầng đầu của CNN
kernels = {
    'Dò cạnh đứng (Sobel-X)': np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=float),
    'Dò cạnh ngang (Sobel-Y)': np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=float),
    'Phát hiện đường nét (Laplacian)': np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], dtype=float)
}

print("=== ĐƯỜNG ỐNG TRÍCH XUẤT ĐẶC TRƯNG CNN (INPUT 16x16) ===")
fig, axes = plt.subplots(3, 4, figsize=(11.2, 7.2))

for row, (k_name, kernel) in enumerate(kernels.items()):
    conv_map = conv2d(img_16, kernel, padding=1, stride=1)
    relu_map = relu(conv_map)
    pool_map = max_pool2d(relu_map, pool_size=2, stride=2)

    print(f"Bộ lọc [{k_name:30s}] -> Conv: {conv_map.shape} -> ReLU: {relu_map.shape} -> MaxPool: {pool_map.shape}")

    axes[row, 0].imshow(img_16, cmap='gray_r')
    axes[row, 0].set_title(f'Ảnh gốc (16x16)\n[{k_name.split("(")[0].strip()}]', fontsize=8.5)
    axes[row, 1].imshow(conv_map, cmap='coolwarm')
    axes[row, 1].set_title(f'Conv2D 3x3 (P=1, S=1)\nShape: {conv_map.shape}', fontsize=8.5)
    axes[row, 2].imshow(relu_map, cmap='magma')
    axes[row, 2].set_title(f'Kích hoạt ReLU max(0,z)\nShape: {relu_map.shape}', fontsize=8.5)
    axes[row, 3].imshow(pool_map, cmap='magma')
    axes[row, 3].set_title(f'MaxPool 2x2 (S=2)\nShape: {pool_map.shape}', fontsize=8.5)

    for col in range(4):
        axes[row, col].axis('off')

plt.tight_layout()
plt.show()`
          },
          {
            title: 'Lab 4.3: Huấn luyện mạng MLP giải bài toán XOR (Backprop bằng NumPy)',
            code: String.raw`# ==============================================================================
# MODULE 4 - LAB 4.3: HUẤN LUYỆN MẠNG MLP GIẢI BÀI TOÁN XOR BẰNG BACKPROPAGATION
# ==============================================================================
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -20, 20)))

# Kiến trúc MLP: 2 -> 4 (Tanh) -> 1 (Sigmoid)
W1 = np.random.randn(2, 4) * 0.9
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.9
b2 = np.zeros((1, 1))

lr = 0.45
losses = []

for epoch in range(1800):
    # Forward Pass
    z1 = X @ W1 + b1
    a1 = np.tanh(z1)
    z2 = a1 @ W2 + b2
    y_hat = sigmoid(z2)

    # Binary Cross-Entropy Loss
    loss = -np.mean(y * np.log(y_hat + 1e-8) + (1 - y) * np.log(1 - y_hat + 1e-8))
    losses.append(loss)

    # Backpropagation
    dz2 = (y_hat - y) / len(X)
    dW2 = a1.T @ dz2
    db2 = np.sum(dz2, axis=0, keepdims=True)
    da1 = dz2 @ W2.T
    dz1 = da1 * (1.0 - a1 ** 2)
    dW1 = X.T @ dz1
    db1 = np.sum(dz1, axis=0, keepdims=True)

    W2 -= lr * dW2
    b2 -= lr * db2
    W1 -= lr * dW1
    b1 -= lr * db1

print("=== KẾT QUẢ MẠNG MLP HỌC CỔNG XOR SAU 1,800 EPOCHS ===")
for xi, yi, yp in zip(X, y.ravel(), y_hat.ravel()):
    print(f"Input {xi.astype(int)} -> Dự đoán P(XOR=1) = {yp:.4f} (Nhãn {int(yp >= 0.5)}) | Thực tế = {int(yi)}")

# Trực quan hóa đường cong Loss & Biên quyết định phi tuyến giải XOR
xx, yy = np.meshgrid(np.linspace(-0.3, 1.3, 180), np.linspace(-0.3, 1.3, 180))
grid = np.c_[xx.ravel(), yy.ravel()]
grid_pred = sigmoid(np.tanh(grid @ W1 + b1) @ W2 + b2).reshape(xx.shape)

fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))
axes[0].plot(losses, color='#4f46e5', linewidth=2)
axes[0].set_title('Đường cong BCE Loss (MLP 2-4-1)')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Binary Cross-Entropy')
axes[0].grid(alpha=0.3)

axes[1].contourf(xx, yy, grid_pred, levels=20, cmap='RdYlGn', alpha=0.6)
axes[1].contour(xx, yy, grid_pred, levels=[0.5], colors='#0f172a', linewidths=2)
axes[1].scatter(X[y.ravel()==0, 0], X[y.ravel()==0, 1], c='#ef4444', s=120, edgecolors='k', label='Lớp 0: (0,0), (1,1)')
axes[1].scatter(X[y.ravel()==1, 0], X[y.ravel()==1, 1], c='#10b981', s=120, marker='^', edgecolors='k', label='Lớp 1: (0,1), (1,0)')
axes[1].set_title('Biên quyết định Phi tuyến giải bài toán XOR')
axes[1].set_xlabel('x1')
axes[1].set_ylabel('x2')
axes[1].legend(fontsize=8)
axes[1].grid(alpha=0.25)

plt.tight_layout()
plt.show()`
          }
        ]
      }
);
