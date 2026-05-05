// --- 1. BIẾN TOÀN CỤC ---
let currentQuestionIndex = 1;
const userAnswers = {}; // Lưu trữ đáp án
const flaggedQuestions = new Set(); // Lưu danh sách câu hỏi đã gắn cờ
let currentZoom = 1.0; // Tỉ lệ zoom mặc định

// --- 2. HÀM HIỂN THỊ CÂU HỎI (RENDER) ---
function renderQuestion(index) {
    const container = document.getElementById('questions-container');
    const readingPanel = document.getElementById('side-reading-panel');
    const questionPanel = document.getElementById('main-question-panel');
    
    if (!container) return;
    container.innerHTML = ''; 

    // Kiểm tra trạng thái gắn cờ để thêm class CSS
    const isFlagged = flaggedQuestions.has(index) ? 'flagged' : '';

    // PHẦN 1: Trắc nghiệm ABCD (Câu 1 - 12)
    if (index <= 12) {
        readingPanel.style.display = 'none';
        questionPanel.classList.remove('split-width');
        questionPanel.classList.add('full-width');
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
    } 
    // PHẦN 2: Đúng / Sai (Câu 13 - 16)
    else if (index <= 16) {
        readingPanel.style.display = 'block';
        questionPanel.classList.remove('full-width');
        questionPanel.classList.add('split-width');
        container.innerHTML = `
            <div class="question-item true-false-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> Chọn Đúng hoặc Sai cho các ý sau (Phần II):</p>
                <table class="tf-table">
                    <tr><th>Lệnh/Ý hỏi</th><th>Đúng</th><th>Sai</th></tr>
                    ${['a', 'b', 'c', 'd'].map(sub => {
                        const val = userAnswers[`q${index}${sub}`];
                        return `
                        <tr>
                            <td>Ý ${sub}) Nội dung ý hỏi...</td>
                            <td><input type="radio" name="q${index}${sub}" value="D" ${val === 'D' ? 'checked' : ''}></td>
                            <td><input type="radio" name="q${index}${sub}" value="S" ${val === 'S' ? 'checked' : ''}></td>
                        </tr>`;
                    }).join('')}
                </table>
            </div>`;
    } 
    // PHẦN 3: Trả lời ngắn (Câu 17 - 22)
    else {
        readingPanel.style.display = 'none';
        questionPanel.classList.remove('split-width');
        questionPanel.classList.add('full-width');
        const savedValue = userAnswers[`q${index}`] || '';
        container.innerHTML = `
            <div class="question-item ${isFlagged}">
                <p><strong>Câu ${index}.</strong> Nhập câu trả lời ngắn của bạn (Phần III):</p>
                <input type="text" class="short-answer-input" name="q${index}" value="${savedValue}" placeholder="Nhập đáp án...">
            </div>`;
    }

    // Cập nhật màu nút Flag trên action-bar
    const btnFlag = document.getElementById('btn-flag');
    if (btnFlag) {
        btnFlag.style.backgroundColor = flaggedQuestions.has(index) ? "#facc15" : "";
    }

    updateActiveDot(index);
}

// --- 3. CẬP NHẬT GIAO DIỆN ---
function updateActiveDot(index) {
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    const currentDot = document.getElementById(`dot-${index}`);
    if (currentDot) currentDot.classList.add('active');
}

function updateAnswerCount() {
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const qNum = key.match(/\d+/)[0];
        answeredSet.add(qNum);
    });
    document.getElementById('answered-count').innerText = `${answeredSet.size}/22`;
}

// --- 4. HÀM GẮN CỜ ---
function toggleFlag() {
    const qNum = currentQuestionIndex;
    const dot = document.getElementById(`dot-${qNum}`);

    if (flaggedQuestions.has(qNum)) {
        flaggedQuestions.delete(qNum);
        if (dot) dot.classList.remove('flagged');
    } else {
        flaggedQuestions.add(qNum);
        if (dot) dot.classList.add('flagged');
    }

    renderQuestion(qNum); 
}

// --- 5. HÀM PHÓNG TO / NHỎ ---
function changeZoom(delta) {
    currentZoom += delta;
    if (currentZoom < 0.8) currentZoom = 0.8;
    if (currentZoom > 1.5) currentZoom = 1.5;
    
    // Áp dụng zoom vào container chính
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.style.fontSize = `${currentZoom}rem`;
    }
}

// --- 6. KHỞI TẠO HỆ THỐNG KHI TRANG TẢI XONG ---
document.addEventListener('DOMContentLoaded', () => {
function showExamScreen(fullName, sbd) {
        const now = new Date();
        const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

        document.getElementById('display-fullname').innerText = fullName;
        document.getElementById('display-sbd').innerText = sbd;
        document.getElementById('display-date').innerText = currentDate;

        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('exam-screen').classList.add('active');
        document.getElementById('exam-screen').style.display = 'flex';

        renderQuestion(1);
    }
    // A. Bộ đếm thời gian
    let timeLeft = 90* 60 + 00;
  
const timerElement = document.getElementById('timer');
    const countdown = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
if (timeLeft <= 0) {
        clearInterval(countdown);
        autoSubmit(); // Gọi hàm nộp bài tự động thay vì chỉ alert
    }
    timeLeft--;
    }, 1000);
const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const savedAnswers = JSON.parse(localStorage.getItem('userAnswers'));

    if (savedAnswers) {
        Object.assign(userAnswers, JSON.parse(localStorage.getItem('userAnswers')));
    }

    // Nếu đã có thông tin đăng nhập, vào thẳng phòng thi
    if (savedUser) {
        showExamScreen(savedUser.fullName, savedUser.sbd);
        // Cập nhật lại trạng thái các câu đã làm trên thanh điều hướng (dots)
        Object.keys(userAnswers).forEach(key => {
            const qNum = key.match(/\d+/)[0];
            const dot = document.getElementById(`dot-${qNum}`);
            if (dot) dot.classList.add('done');
        });
        updateAnswerCount();
	}
    // --- 3. XỬ LÝ ĐĂNG NHẬP MỚI ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const fullName = document.getElementById('login-fullname').value;
            const sbd = document.getElementById('login-sbd').value;

            // Lưu trạng thái đăng nhập
            localStorage.setItem('currentUser', JSON.stringify({fullName, sbd}));
            showExamScreen(fullName, sbd);
        });
    }
    // B. Tạo các nút điều hướng (dot)
    const navDots = document.getElementById('navDots');
    if (navDots) {
        for (let i = 1; i <= 22; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.id = `dot-${i}`;
            dot.innerText = i;
            if (i === 1) dot.classList.add('active');

            dot.addEventListener('click', () => {
                currentQuestionIndex = i;
                renderQuestion(i);
            });
            navDots.appendChild(dot);
        }
    }

    // C. Xử lý Đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const fullName = document.getElementById('login-fullname').value;
            const sbd = document.getElementById('login-sbd').value;
            const now = new Date();
            const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

            document.getElementById('display-fullname').innerText = fullName;
            document.getElementById('display-sbd').innerText = sbd;
            document.getElementById('display-date').innerText = currentDate;

            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('exam-screen').classList.add('active');
            document.getElementById('exam-screen').style.display = 'flex';

            renderQuestion(1); 
        });
    }

    // D. Lắng nghe thay đổi đáp án
    const questionsContainer = document.getElementById('questions-container');
    if (questionsContainer) {
        questionsContainer.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                // Trong phần addEventListener cho 'change' và 'input'
userAnswers[e.target.name] = e.target.value;
localStorage.setItem('userAnswers', JSON.stringify(userAnswers)); // Thêm dòng này
            
            const qNum = e.target.name.match(/\d+/)[0];
            document.getElementById(`dot-${qNum}`).classList.add('done');
            updateAnswerCount();
            }
        });

        questionsContainer.addEventListener('input', (e) => {
            if (e.target.type === 'text') {
                userAnswers[e.target.name] = e.target.value;
               localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            
            const qNum = e.target.name.match(/\d+/)[0];
            const dot = document.getElementById(`dot-${qNum}`);
                if (e.target.value.trim() !== "") {
                    dot.classList.add('done');
                } else {
                    dot.classList.remove('done');
                }
                updateAnswerCount();
            }
        });
    }


    // E. Nút Quay lại / Tiếp theo
    document.querySelector('.btn-primary').addEventListener('click', () => {
        if (currentQuestionIndex < 22) renderQuestion(++currentQuestionIndex);
    });

    document.querySelector('.btn-nav:not(.btn-primary):not(#btn-flag)').addEventListener('click', (e) => {
        // Chỉ chạy nếu là nút "Quay lại" (tránh nhầm với nút zoom)
        if (e.target.innerText.includes("Quay lại") && currentQuestionIndex > 1) {
            renderQuestion(--currentQuestionIndex);
        }
    });
});

// Đáp án và các hàm chấm điểm giữ nguyên như cũ...
const answerKey = {

    "q1": "A",

    "q2": "A",

    "q3": "A",

    "q4": "A",

    "q5": "A",

   "q6": "A",

    "q7": "A",

    "q8": "A",

    "q9": "A",

   "q10": "A",

    "q11": "A",

    "q12": "A",

    // ... các câu khác

    "q13a": "D",

    "q13b": "D",

    "q13c": "D",

    "q13d": "D",

    "q14a": "D",

    "q14b": "D",

    "q14c": "D",

    "q14d": "D",

    "q15a": "D",

    "q15b": "D",

    "q15c": "D",

    "q15d": "D",

    "q16a": "D",

    "q16b": "D",

    "q16c": "D",

    "q16d": "D",

    // ...

    "q17": "10",

    "q18": "10",

    "q19": "10",

    "q20": "10",

    "q21": "10",

    "q22": "10"

};

function confirmSubmit() {
    if (confirm("Bạn có chắc chắn muốn nộp bài?")) {
        // 1. Dừng bộ đếm thời gian
        // Lưu ý: Biến countdown cần được khai báo toàn cục để hàm này có thể truy cập
        if (typeof countdown !== 'undefined') clearInterval(countdown);

        // 2. Ẩn màn hình làm bài
        const examScreen = document.getElementById('exam-screen');
        examScreen.classList.remove('active');
        examScreen.style.display = 'none';

        // 3. Hiện màn hình kết quả
        const resultScreen = document.getElementById('result-screen');
        resultScreen.classList.add('active');
        resultScreen.style.display = 'flex';

        // 4. Tính điểm
        const finalScore = calculateScore();
        
        // Đếm số câu thực tế đã trả lời (không đếm trùng ý a,b,c,d)
        const answeredSet = new Set();
        Object.keys(userAnswers).forEach(key => {
            const qNum = key.match(/\d+/)[0];
            answeredSet.add(qNum);
        });

        document.getElementById('res-done').innerText = `${answeredSet.size}/22`;
        document.getElementById('res-score').innerText = `${finalScore}/10`;
        
        window.scrollTo(0, 0);
    }
}

function calculateScore() {
    let totalScore = 0;

    // PHẦN I: Trắc nghiệm (12 câu, mỗi câu 0.25đ)[cite: 2]
    for (let i = 1; i <= 12; i++) {
        if (userAnswers[`q${i}`] === answerKey[`q${i}`]) {
            totalScore += 0.25;
        }
    }

    // PHẦN II: Đúng Sai (4 câu, tối đa 1đ/câu)[cite: 2]
    for (let i = 13; i <= 16; i++) {
        let correctSub = 0;
        ['a', 'b', 'c', 'd'].forEach(sub => {
            if (userAnswers[`q${i}${sub}`] === answerKey[`q${i}${sub}`]) {
                correctSub++;
            }
        });
        if (correctSub === 4) totalScore += 1.0;
        else if (correctSub === 3) totalScore += 0.5;
        else if (correctSub === 2) totalScore += 0.25;
        else if (correctSub === 1) totalScore += 0.1;
    }

    // PHẦN III: Trả lời ngắn (6 câu, mỗi câu 0.5đ)[cite: 2]
    for (let i = 17; i <= 22; i++) {
        const userVal = (userAnswers[`q${i}`] || "").trim().toLowerCase();
        const correctVal = (answerKey[`q${i}`] || "").toLowerCase();
        if (userVal === correctVal && correctVal !== "") {
            totalScore += 0.5;
        }
    }

    return totalScore.toFixed(2); 
}
// Hàm nộp bài tự động khi hết giờ
function autoSubmit() {
    alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài của bạn.");
    executeSubmission();
}



// Hàm thực hiện các thủ tục nộp bài và tính điểm[cite: 2]
function executeSubmission() {
    // 1. Dừng bộ đếm thời gian
    if (typeof countdown !== 'undefined') clearInterval(countdown);

    // 2. Chuyển màn hình
    document.getElementById('exam-screen').classList.remove('active');
    document.getElementById('exam-screen').style.display = 'none';
    
    const resultScreen = document.getElementById('result-screen');
    resultScreen.classList.add('active');
    resultScreen.style.display = 'flex';

    // 3. Tính và hiển thị điểm[cite: 2]
    const finalScore = calculateScore();
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const qNum = key.match(/\d+/)[0];
        answeredSet.add(qNum);
    });

    document.getElementById('res-done').innerText = `${answeredSet.size}/22`;
    document.getElementById('res-score').innerText = `${finalScore}/10`;
    
    window.scrollTo(0, 0);
}
// Chống nhấn lộn F5 hoặc thoát trang vô ý
window.onbeforeunload = function() {
    return "Dữ liệu bài làm của bạn sẽ bị mất nếu không được lưu. Bạn có chắc muốn thoát?";
};

// Xóa dữ liệu trong kho sau khi đã nộp bài thành công
function clearStorage() {
    localStorage.removeItem('userAnswers');
}
// Thêm hàm này vào script.js
function finishExam() {
    // Xóa sạch toàn bộ dữ liệu trong kho lưu trữ của trình duyệt
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('currentUser');
    
    // Tải lại trang để về màn hình đăng nhập
    location.reload();
}
