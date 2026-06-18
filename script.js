// --- 1. BIẾN TOÀN CỤC & CẤU HÌNH API ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4AgHlkzQjVnQ1tjJ2hkdZS3Xa3_bU8Ym2pAEiYWDZoSRlFcHjSlk7UUOh8OoJo6AaiA/exec";
let examData = [];
let currentQuestionIndex = 1;
const userAnswers = {}; 
const flaggedQuestions = new Set(); 
let currentZoom = 1.0; 
let countdown;

// --- 2. KHỞI TẠO HỆ THỐNG TRÊN GITHUB PAGES ---
document.addEventListener('DOMContentLoaded', () => {
    // Gọi API để lấy đề thi từ Google Sheets
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            examData = data;
            document.getElementById('init-loading').classList.remove('active');
            document.getElementById('login-screen').classList.add('active');
            initSystem();
        })
        .catch(error => {
            console.error("Lỗi tải đề:", error);
            alert("Không thể kết nối đến ngân hàng câu hỏi. Vui lòng thử tải lại trang!");
        });
});

function initSystem() {
    // Xử lý Form đăng nhập
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('login-fullname').value.trim();
        const sbd = document.getElementById('login-sbd').value.trim();
        localStorage.setItem('currentUser', JSON.stringify({fullName, sbd}));
        showExamScreen(fullName, sbd);
    });

    // Khởi tạo Navigation Dots
    const navDots = document.getElementById('navDots');
    for (let i = 1; i <= 22; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.id = `dot-${i}`;
        dot.innerText = i;
        dot.onclick = () => { currentQuestionIndex = i; renderQuestion(i); };
        navDots.appendChild(dot);
    }

    // Lắng nghe sự kiện chọn đáp án
    const container = document.getElementById('questions-container');
    container.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            userAnswers[e.target.name] = e.target.value;
            localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            document.getElementById(`dot-${e.target.name.match(/\d+/)[0]}`).classList.add('done');
            updateAnswerCount();
        }
    });
    container.addEventListener('input', (e) => {
        if (e.target.type === 'text') {
            userAnswers[e.target.name] = e.target.value;
            localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            const dot = document.getElementById(`dot-${e.target.name.match(/\d+/)[0]}`);
            e.target.value.trim() !== "" ? dot.classList.add('done') : dot.classList.remove('done');
            updateAnswerCount();
        }
    });

    // Phục hồi phiên làm bài nếu lỡ F5
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const savedAnswers = JSON.parse(localStorage.getItem('userAnswers'));
    if (savedAnswers) Object.assign(userAnswers, savedAnswers);
    if (savedUser) {
        showExamScreen(savedUser.fullName, savedUser.sbd);
        setTimeout(() => {
            Object.keys(userAnswers).forEach(key => {
                const qNum = key.match(/\d+/)[0];
                const dot = document.getElementById(`dot-${qNum}`);
                if (dot) dot.classList.add('done');
            });
            updateAnswerCount();
        }, 100);
    }
}

// --- 3. LOGIC HIỂN THỊ UI ---
function showExamScreen(fullName, sbd) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('exam-screen').classList.add('active');

    const now = new Date();
    document.getElementById('display-fullname').innerText = fullName;
    document.getElementById('display-sbd').innerText = sbd;
    document.getElementById('display-date').innerText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    renderQuestion(1);
    startTimer(90 * 60);
}

function renderQuestion(index) {
    const container = document.getElementById('questions-container');
    const readingPanel = document.getElementById('side-reading-panel');
    const questionPanel = document.getElementById('main-question-panel');
    const titlePanel = document.getElementById('panel-title');

    const qData = examData.find(q => q.id === index);
    if (!qData) return;

    const isFlagged = flaggedQuestions.has(index) ? 'flagged' : '';
    const imgHtml = qData.image ? `<img src="${qData.image}" alt="Hình ảnh câu hỏi">` : '';

    if (qData.part === 1) {
        readingPanel.style.display = 'none';
        questionPanel.className = 'question-panel full-width';
        titlePanel.innerText = "PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn";
        
        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> ${qData.question}</p>
                ${imgHtml}
                <div class="options">
                    ${['A', 'B', 'C', 'D'].map((opt, i) => {
                        const isChecked = userAnswers[`q${index}`] === opt ? 'checked' : '';
                        return `<label><input type="radio" name="q${index}" value="${opt}" ${isChecked}> ${opt}. ${qData.options[i]}</label>`;
                    }).join('')}
                </div>
            </div>`;
    } else if (qData.part === 2) {
        readingPanel.style.display = 'block';
        document.getElementById('shared-reading-content').innerHTML = qData.reading + imgHtml;
        questionPanel.className = 'question-panel split-width';
        titlePanel.innerText = "PHẦN II. Câu trắc nghiệm đúng sai";

        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> ${qData.question}</p>
                <table class="tf-table">
                    <tr><th>Lệnh/Ý hỏi</th><th>Đúng</th><th>Sai</th></tr>
                    ${qData.subQuestions.map(sub => {
                        const val = userAnswers[`q${index}${sub.id}`];
                        return `<tr>
                            <td>${sub.id}) ${sub.text}</td>
                            <td><input type="radio" name="q${index}${sub.id}" value="D" ${val === 'D' ? 'checked' : ''}></td>
                            <td><input type="radio" name="q${index}${sub.id}" value="S" ${val === 'S' ? 'checked' : ''}></td>
                        </tr>`;
                    }).join('')}
                </table>
            </div>`;
    } else {
        readingPanel.style.display = 'none';
        questionPanel.className = 'question-panel full-width';
        titlePanel.innerText = "PHẦN III. Câu trắc nghiệm trả lời ngắn";
        
        const savedValue = userAnswers[`q${index}`] || '';
        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> ${qData.question}</p>
                ${imgHtml} 
                <input type="text" class="short-answer-input" name="q${index}" value="${savedValue}" placeholder="Nhập đáp án...">
            </div>`;
    }

    if (window.MathJax) setTimeout(() => window.MathJax.typesetPromise(), 50);
    updateActiveDot(index);
}

// --- 4. HÀM ĐIỀU HƯỚNG & ZOOM ---
function toggleFlag() {
    const dot = document.getElementById(`dot-${currentQuestionIndex}`);
    if (flaggedQuestions.has(currentQuestionIndex)) {
        flaggedQuestions.delete(currentQuestionIndex);
        dot.classList.remove('flagged');
    } else {
        flaggedQuestions.add(currentQuestionIndex);
        dot.classList.add('flagged');
    }
    renderQuestion(currentQuestionIndex);
}

function nextQuestion() { if (currentQuestionIndex < 22) { currentQuestionIndex++; renderQuestion(currentQuestionIndex); } }
function prevQuestion() { if (currentQuestionIndex > 1) { currentQuestionIndex--; renderQuestion(currentQuestionIndex); } }

function changeZoom(delta) {
    currentZoom += delta;
    if (currentZoom < 0.8) currentZoom = 0.8;
    if (currentZoom > 1.5) currentZoom = 1.5;
    document.getElementById('main-container').style.setProperty('font-size', `${currentZoom}rem`, 'important');
}

function updateActiveDot(index) {
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    document.getElementById(`dot-${index}`).classList.add('active');
}

function updateAnswerCount() {
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => answeredSet.add(key.match(/\d+/)[0]));
    document.getElementById('answered-count').innerText = `${answeredSet.size}/22`;
}

// --- 5. TÍNH ĐIỂM VÀ NỘP BÀI THI ---
function calculateScore() {
    let totalScore = 0;
    examData.forEach(q => {
        if (q.part === 1) {
            if (userAnswers[`q${q.id}`] === q.correct) totalScore += 0.25;
        } else if (q.part === 2) {
            let correctSub = 0;
            q.subQuestions.forEach(sub => {
                if (userAnswers[`q${q.id}${sub.id}`] === sub.correct) correctSub++;
            });
            if (correctSub === 4) totalScore += 1.0;
            else if (correctSub === 3) totalScore += 0.5;
            else if (correctSub === 2) totalScore += 0.25;
            else if (correctSub === 1) totalScore += 0.1;
        } else if (q.part === 3) {
            const userVal = (userAnswers[`q${q.id}`] || "").trim().toLowerCase();
            const correctVal = q.correct.toLowerCase();
            if (userVal === correctVal) totalScore += 0.5;
        }
    });
    return totalScore.toFixed(2);
}

function startTimer(duration) {
    const savedTime = localStorage.getItem('examTimeLeft');
    let timeLeft = savedTime ? parseInt(savedTime) : duration;
    const timerElement = document.getElementById('timer');
    
    if (countdown) clearInterval(countdown);
    
    countdown = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerElement.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        
        localStorage.setItem('examTimeLeft', timeLeft);

        if (timeLeft <= 0) { 
            clearInterval(countdown); 
            localStorage.removeItem('examTimeLeft');
            alert("Đã hết thời gian làm bài! Hệ thống tự động thu bài.");
            executeSubmission(); 
        }
        timeLeft--;
    }, 1000);
}

function confirmSubmit() { if (confirm("Bạn có chắc chắn muốn nộp bài?")) executeSubmission(); }

function executeSubmission() {
    if (countdown) clearInterval(countdown);
    document.getElementById('exam-screen').classList.remove('active');
    
    const finalScore = calculateScore();
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => answeredSet.add(key.match(/\d+/)[0]));
    const soCauDaLam = `${answeredSet.size}/22`;

    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const payload = {
        username: savedUser ? savedUser.sbd : "000",
        studentName: savedUser ? savedUser.fullName : "Ẩn danh",
        examName: "Kỳ thi tốt nghiệp THPT 2026",
        score: `${finalScore}/10`,
        extraData: soCauDaLam,
        userAnswersText: JSON.stringify(userAnswers)
    };

    // Đẩy dữ liệu bằng fetch theo cấu trúc API mới
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" } 
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById('result-screen').classList.add('active');
        document.getElementById('res-done').innerText = soCauDaLam;
        document.getElementById('res-score').innerText = `${finalScore}/10`;
        localStorage.removeItem('userAnswers');
        localStorage.removeItem('examTimeLeft');
    })
    .catch(error => {
        console.error("Lỗi nộp bài:", error);
        alert("Đã xảy ra lỗi khi lưu kết quả lên máy chủ. Bạn vui lòng báo với giáo viên kiểm tra lại mạng!");
    });
}

// Hàm chuẩn SPA: Trở về màn hình đăng nhập lập tức, không reload trang
function finishExam() {
    localStorage.clear();
    for (let prop in userAnswers) delete userAnswers[prop];
    flaggedQuestions.clear();
    currentQuestionIndex = 1;
    document.getElementById('login-form').reset();
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('done', 'active', 'flagged'));
    document.getElementById('answered-count').innerText = "0/22";

    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    window.scrollTo(0, 0);
}