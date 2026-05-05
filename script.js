// --- 1. BIẾN TOÀN CỤC ---
let currentQuestionIndex = 1;
const userAnswers = {}; 
const flaggedQuestions = new Set(); 
let currentZoom = 1.0; 
let countdown;

const answerKey = {
    "q1": "A", "q2": "A", "q3": "A", "q4": "A", "q5": "A", "q6": "A",
    "q7": "A", "q8": "A", "q9": "A", "q10": "A", "q11": "A", "q12": "A",
    "q13a": "D", "q13b": "D", "q13c": "D", "q13d": "D",
    "q14a": "D", "q14b": "D", "q14c": "D", "q14d": "D",
    "q15a": "D", "q15b": "D", "q15c": "D", "q15d": "D",
    "q16a": "D", "q16b": "D", "q16c": "D", "q16d": "D",
    "q17": "10", "q18": "10", "q19": "10", "q20": "10", "q21": "10", "q22": "10"
};

// --- 2. HÀM CHUYỂN ĐỔI MÀN HÌNH ---
function showExamScreen(fullName, sbd) {
    const loginScreen = document.getElementById('login-screen');
    const examScreen = document.getElementById('exam-screen');

    if (loginScreen) {
        loginScreen.style.setProperty('display', 'none', 'important');
        loginScreen.classList.remove('active');
    }

    if (examScreen) {
        examScreen.style.setProperty('display', 'flex', 'important');
        examScreen.classList.add('active');
    }

    const now = new Date();
    const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    
    if(document.getElementById('display-fullname')) document.getElementById('display-fullname').innerText = fullName;
    if(document.getElementById('display-sbd')) document.getElementById('display-sbd').innerText = sbd;
    if(document.getElementById('display-date')) document.getElementById('display-date').innerText = currentDate;

    renderQuestion(1);
    startTimer(90 * 60);
}

// --- 3. HÀM HIỂN THỊ CÂU HỎI ---
function renderQuestion(index) {
    const container = document.getElementById('questions-container');
    const readingPanel = document.getElementById('side-reading-panel');
    const questionPanel = document.getElementById('main-question-panel');
    if (!container) return;

    container.innerHTML = '';
    const isFlagged = flaggedQuestions.has(index) ? 'flagged' : '';

    if (index <= 12) {
        if(readingPanel) readingPanel.style.display = 'none';
        if(questionPanel) questionPanel.className = 'full-width';
        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> Nội dung câu hỏi trắc nghiệm Phần I...</p>
                <div class="options">
                    ${['A', 'B', 'C', 'D'].map(opt => {
                        const isChecked = userAnswers[`q${index}`] === opt ? 'checked' : '';
                        return `<label><input type="radio" name="q${index}" value="${opt}" ${isChecked}> ${opt}. Phương án ${opt}</label>`;
                    }).join('')}
                </div>
            </div>`;
    } else if (index <= 16) {
        if(readingPanel) readingPanel.style.display = 'block';
        if(questionPanel) questionPanel.className = 'split-width';
        container.innerHTML = `
            <div class="question-item true-false-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> Chọn Đúng/Sai cho các ý sau:</p>
                <table class="tf-table">
                    <tr><th>Lệnh/Ý hỏi</th><th>Đúng</th><th>Sai</th></tr>
                    ${['a', 'b', 'c', 'd'].map(sub => {
                        const val = userAnswers[`q${index}${sub}`];
                        return `<tr>
                            <td>Ý ${sub}) Nội dung ý hỏi...</td>
                            <td><input type="radio" name="q${index}${sub}" value="D" ${val === 'D' ? 'checked' : ''}></td>
                            <td><input type="radio" name="q${index}${sub}" value="S" ${val === 'S' ? 'checked' : ''}></td>
                        </tr>`;
                    }).join('')}
                </table>
            </div>`;
    } else {
        if(readingPanel) readingPanel.style.display = 'none';
        if(questionPanel) questionPanel.className = 'full-width';
        const savedValue = userAnswers[`q${index}`] || '';
        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> Nhập câu trả lời ngắn (Phần III):</p>
                <input type="text" class="short-answer-input" name="q${index}" value="${savedValue}" placeholder="Nhập đáp án...">
            </div>`;
    }
    updateActiveDot(index);
}

// --- 4. HÀM TÍNH ĐIỂM (QUAN TRỌNG - PHẢI CÓ) ---
function calculateScore() {
    let totalScore = 0;

    // PHẦN I: Trắc nghiệm (12 câu, mỗi câu 0.25đ)
    for (let i = 1; i <= 12; i++) {
        if (userAnswers[`q${i}`] === answerKey[`q${i}`]) totalScore += 0.25;
    }

    // PHẦN II: Đúng Sai (4 câu)
    for (let i = 13; i <= 16; i++) {
        let correctSub = 0;
        ['a', 'b', 'c', 'd'].forEach(sub => {
            if (userAnswers[`q${i}${sub}`] === answerKey[`q${i}${sub}`]) correctSub++;
        });
        if (correctSub === 4) totalScore += 1.0;
        else if (correctSub === 3) totalScore += 0.5;
        else if (correctSub === 2) totalScore += 0.25;
        else if (correctSub === 1) totalScore += 0.1;
    }

    // PHẦN III: Trả lời ngắn (6 câu, mỗi câu 0.5đ)
    for (let i = 17; i <= 22; i++) {
        const userVal = (userAnswers[`q${i}`] || "").trim().toLowerCase();
        const correctVal = (answerKey[`q${i}`] || "").trim().toLowerCase();
        if (userVal === correctVal && correctVal !== "") totalScore += 0.5;
    }

    return totalScore.toFixed(2);
}

// --- 5. HÀM NỘP BÀI ---
function executeSubmission() {
    if (countdown) clearInterval(countdown);

    const examScreen = document.getElementById('exam-screen');
    if (examScreen) {
        examScreen.style.setProperty('display', 'none', 'important');
        examScreen.classList.remove('active');
    }

    const resultScreen = document.getElementById('result-screen');
    if (resultScreen) {
        resultScreen.style.setProperty('display', 'flex', 'important');
        resultScreen.classList.add('active');
    }

    const finalScore = calculateScore();
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const qNum = key.match(/\d+/)[0];
        answeredSet.add(qNum);
    });

    if (document.getElementById('res-done')) document.getElementById('res-done').innerText = `${answeredSet.size}/22`;
    if (document.getElementById('res-score')) document.getElementById('res-score').innerText = `${finalScore}/10`;

    window.scrollTo(0, 0);
    localStorage.removeItem('userAnswers');
}

function confirmSubmit() {
    if (confirm("Bạn có chắc chắn muốn nộp bài?")) {
        executeSubmission();
    }
}

function autoSubmit() {
    alert("Hết giờ làm bài! Hệ thống tự động nộp bài.");
    executeSubmission();
}

function finishExam() {
    localStorage.clear();
    location.reload();
}

// --- 6. KHỞI TẠO VÀ SỰ KIỆN ---
function startTimer(duration) {
    // Kiểm tra xem có thời gian đã lưu từ trước không
    const savedTime = localStorage.getItem('examTimeLeft');
    let timeLeft = savedTime ? parseInt(savedTime) : duration;
    
    const timerElement = document.getElementById('timer');
    if (countdown) clearInterval(countdown);
    
    countdown = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        
        if (timerElement) timerElement.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        
        // LƯU THỜI GIAN VÀO STORAGE MỖI GIÂY
        localStorage.setItem('examTimeLeft', timeLeft);

        if (timeLeft <= 0) { 
            clearInterval(countdown); 
            localStorage.removeItem('examTimeLeft'); // Xóa khi hết giờ
            autoSubmit(); 
        }
        timeLeft--;
    }, 1000);
}
// --- 3. HÀM ĐIỀU HƯỚNG & ZOOM (CÁC LỆNH BẠN CẦN) ---

// A. Lệnh Gắn cờ
function toggleFlag() {
    const dot = document.getElementById(`dot-${currentQuestionIndex}`);
    if (flaggedQuestions.has(currentQuestionIndex)) {
        flaggedQuestions.delete(currentQuestionIndex);
        if (dot) dot.classList.remove('flagged');
    } else {
        flaggedQuestions.add(currentQuestionIndex);
        if (dot) dot.classList.add('flagged');
    }
    renderQuestion(currentQuestionIndex); // Render lại để cập nhật màu câu hỏi
}

// B. Lệnh Tiếp theo
function nextQuestion() {
    if (currentQuestionIndex < 22) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
}

// C. Lệnh Quay lại
function prevQuestion() {
    if (currentQuestionIndex > 1) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
}

// D. Lệnh Phóng to / Thu nhỏ
function changeZoom(delta) {
    currentZoom += delta;
    if (currentZoom < 0.7) currentZoom = 0.7; // Giới hạn nhỏ nhất
    if (currentZoom > 1.5) currentZoom = 1.5; // Giới hạn lớn nhất
    
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        // Áp dụng zoom cho toàn bộ nội dung bài làm
        mainContainer.style.fontSize = `${currentZoom}rem`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('login-fullname').value;
            const sbd = document.getElementById('login-sbd').value;
            localStorage.setItem('currentUser', JSON.stringify({fullName, sbd}));
            showExamScreen(fullName, sbd);
        });
    }

    // Navigation Dots
    const navDots = document.getElementById('navDots');
    if (navDots) {
        for (let i = 1; i <= 22; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.id = `dot-${i}`;
            dot.innerText = i;
            dot.onclick = () => { currentQuestionIndex = i; renderQuestion(i); };
            navDots.appendChild(dot);
        }
    }

    // Load lại trạng thái
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

    // Lưu đáp án
    const container = document.getElementById('questions-container');
    if (container) {
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
    }
});

function updateActiveDot(index) {
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    const currentDot = document.getElementById(`dot-${index}`);
    if (currentDot) currentDot.classList.add('active');
}

function updateAnswerCount() {
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => answeredSet.add(key.match(/\d+/)[0]));
    if (document.getElementById('answered-count')) document.getElementById('answered-count').innerText = `${answeredSet.size}/22`;
}