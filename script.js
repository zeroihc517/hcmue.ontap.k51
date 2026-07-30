let examData = [];
let currentQuestionIndex = 1;
const userAnswers = {}; 
const flaggedQuestions = new Set(); 
let currentZoom = 1.0; 
let countdown;
let violationCount = 0;
let isExamActive = false;

// HÀM CHUYỂN LINK GOOGLE DRIVE THÀNH LINK ẢNH TRỰC TIẾP
function convertDriveUrl(url) {
    if (!url) return "";
    const driveMatch = url.trim().match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url.trim();
}

function extractImage(text) {
    let imgUrl = "";
    let cleanText = text || "";
    const imgRegex = /\[img\](.*?)\[\/img\]/i;
    const match = cleanText.toString().match(imgRegex);
    if (match) {
        imgUrl = convertDriveUrl(match[1]);
        cleanText = cleanText.toString().replace(imgRegex, '').trim();
    }
    return { cleanText, imgUrl };
}

// --- 1. KHỞI TẠO HỆ THỐNG ---
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${GOOGLE_SCRIPT_URL}?action=getExamList`)
        .then(res => res.json())
        .then(exams => {
            const select = document.getElementById('login-exam-select');
            if (select) {
                select.innerHTML = '';
                if (!exams || exams.length === 0) {
                    select.innerHTML = '<option value="Kỳ thi tốt nghiệp THPT 2026">Kỳ thi tốt nghiệp THPT 2026</option>';
                } else {
                    exams.forEach(ex => {
                        select.innerHTML += `<option value="${ex}">${ex}</option>`;
                    });
                }
            }
        })
        .catch(err => console.error("Lỗi tải danh sách đợt thi:", err));

    document.getElementById('init-loading').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    initSystem();
    setupFullscreenAndAntiCheat();
});

function initSystem() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
        document.getElementById('login-fullname').value = savedUser.name || savedUser.fullName || '';
        document.getElementById('login-sbd').value = savedUser.mssv || savedUser.sbd || '';
    }

    const loginForm = document.getElementById('login-form');
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const fullName = document.getElementById('login-fullname').value.trim();
        const sbd = document.getElementById('login-sbd').value.trim();
        const selectedExam = document.getElementById('login-exam-select').value;
        
        localStorage.setItem('currentUser', JSON.stringify({
            name: fullName, fullName: fullName, mssv: sbd, sbd: sbd, examName: selectedExam
        }));

        // KÍCH HOẠT FULL SCREEN
        requestFullscreenMode();

        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('init-loading').classList.add('active');

        loadExamDataAndStart(selectedExam, fullName, sbd);
    };

    const container = document.getElementById('questions-container');
    container.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            userAnswers[e.target.name] = e.target.value;
            localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            const match = e.target.name.match(/\d+/);
            if (match) {
                const dot = document.getElementById(`dot-${match[0]}`);
                if (dot) dot.classList.add('done');
            }
            updateAnswerCount();
        }
    });

    container.addEventListener('input', (e) => {
        if (e.target.type === 'text') {
            userAnswers[e.target.name] = e.target.value;
            localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            const match = e.target.name.match(/\d+/);
            if (match) {
                const dot = document.getElementById(`dot-${match[0]}`);
                if (dot) {
                    e.target.value.trim() !== "" ? dot.classList.add('done') : dot.classList.remove('done');
                }
            }
            updateAnswerCount();
        }
    });

    // PHỤC HỒI PHIÊN LÀM BÀI NẾU F5
    const savedAnswers = JSON.parse(localStorage.getItem('userAnswers'));
    const examTimeLeft = localStorage.getItem('examTimeLeft');
    
    if (savedUser && (examTimeLeft !== null || savedAnswers !== null)) {
        if (savedAnswers) Object.assign(userAnswers, savedAnswers);
        
        const userName = savedUser.name || savedUser.fullName;
        const userSbd = savedUser.mssv || savedUser.sbd;
        const userExam = savedUser.examName || "Kỳ thi tốt nghiệp THPT 2026";
        
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('init-loading').classList.add('active');
        
        loadExamDataAndStart(userExam, userName, userSbd);
    }
}

function loadExamDataAndStart(selectedExam, fullName, sbd) {
    fetch(`${GOOGLE_SCRIPT_URL}?examName=${encodeURIComponent(selectedExam)}`)
        .then(res => res.json())
        .then(data => {
            examData = data;
            document.getElementById('init-loading').classList.remove('active');
            showExamScreen(fullName, sbd);
            buildNavDots();
            
            Object.keys(userAnswers).forEach(key => {
                const match = key.match(/\d+/);
                if (match) {
                    const dot = document.getElementById(`dot-${match[0]}`);
                    if (dot) dot.classList.add('done');
                }
            });
            updateAnswerCount();
            isExamActive = true;
        })
        .catch(err => {
            console.error("Lỗi tải đề thi:", err);
            alert("Lỗi tải đề thi. Vui lòng kiểm tra lại kết nối mạng!");
        });
}

function buildNavDots() {
    const navDots = document.getElementById('navDots');
    if (!navDots) return;
    navDots.innerHTML = '';
    
    for (let i = 1; i <= examData.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.id = `dot-${i}`;
        dot.innerText = i;
        dot.onclick = () => { currentQuestionIndex = i; renderQuestion(i); };
        navDots.appendChild(dot);
    }
}

// --- 2. QUẢN LÝ FULL SCREEN & CHỐNG GIAN LẬN ---
function requestFullscreenMode() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.log(err));
    } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
}

function setupFullscreenAndAntiCheat() {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isExamActive) {
            triggerViolationWarning();
        }
    });
}

function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!isFullscreen && isExamActive) {
        triggerViolationWarning();
    }
}

function triggerViolationWarning() {
    violationCount++;
    document.getElementById('violation-count').innerText = violationCount;
    document.getElementById('warning-modal').classList.add('active');
}

function forceFullscreenAndResume() {
    requestFullscreenMode();
    document.getElementById('warning-modal').classList.remove('active');
}

// --- 3. ĐỒNG HỒ & GIAO DIỆN ---
function showExamScreen(fullName, sbd) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('exam-screen').classList.add('active');

    const now = new Date();
    document.getElementById('display-fullname').innerText = fullName;
    document.getElementById('display-sbd').innerText = sbd;
    document.getElementById('display-date').innerText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    renderQuestion(1);
    startTimer(90 * 60); // 90 Phút
}

function startTimer(duration) {
    const savedTime = localStorage.getItem('examTimeLeft');
    let timeLeft = (savedTime !== null) ? parseInt(savedTime) : duration;
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
            alert("Đã hết thời gian 90 phút làm bài! Hệ thống tự động thu bài.");
            executeSubmission(); 
        }
        timeLeft--;
    }, 1000);
}

function renderQuestion(index) {
    const container = document.getElementById('questions-container');
    const readingPanel = document.getElementById('side-reading-panel');
    const questionPanel = document.getElementById('main-question-panel');
    const titlePanel = document.getElementById('panel-title');

    const qData = examData.find(q => q.id === index);
    if (!qData) return;

    const isFlagged = flaggedQuestions.has(index) ? 'flagged' : '';
    const imgUrl = convertDriveUrl(qData.image);
    const imgHtml = imgUrl ? `<img src="${imgUrl}" alt="Hình ảnh câu hỏi">` : '';

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

// --- 4. HÀM ĐIỀU HƯỚNG & MODAL NỘP BÀI ---
function toggleFlag() {
    const dot = document.getElementById(`dot-${currentQuestionIndex}`);
    if (flaggedQuestions.has(currentQuestionIndex)) {
        flaggedQuestions.delete(currentQuestionIndex);
        if (dot) dot.classList.remove('flagged');
    } else {
        flaggedQuestions.add(currentQuestionIndex);
        if (dot) dot.classList.add('flagged');
    }
    renderQuestion(currentQuestionIndex);
}

function nextQuestion() { if (currentQuestionIndex < examData.length) { currentQuestionIndex++; renderQuestion(currentQuestionIndex); } }
function prevQuestion() { if (currentQuestionIndex > 1) { currentQuestionIndex--; renderQuestion(currentQuestionIndex); } }

function changeZoom(delta) {
    currentZoom += delta;
    if (currentZoom < 0.8) currentZoom = 0.8;
    if (currentZoom > 1.5) currentZoom = 1.5;
    document.getElementById('main-container').style.setProperty('font-size', `${currentZoom}rem`, 'important');
}

function updateActiveDot(index) {
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    const currentDot = document.getElementById(`dot-${index}`);
    if (currentDot) currentDot.classList.add('active');
}

function updateAnswerCount() {
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const match = key.match(/\d+/);
        if (match) answeredSet.add(match[0]);
    });
    document.getElementById('answered-count').innerText = `${answeredSet.size}/${examData.length}`;
}

function confirmSubmit() {
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const match = key.match(/\d+/);
        if (match) answeredSet.add(match[0]);
    });
    
    document.getElementById('confirm-answered-count').innerText = `${answeredSet.size}/${examData.length}`;
    document.getElementById('confirm-time-left').innerText = document.getElementById('timer').innerText;
    document.getElementById('confirm-modal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
}

// --- 5. TÍNH ĐIỂM VÀ NỘP BÀI ---
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
            let userVal = (userAnswers[`q${q.id}`] || "").toString().trim().toLowerCase();
            let correctVal = q.correct.toString().trim().toLowerCase();

            let userNumStr = userVal.replace(/,/g, '.');
            let correctNumStr = correctVal.replace(/,/g, '.');

            if (!isNaN(userNumStr) && !isNaN(correctNumStr) && userNumStr !== "" && correctNumStr !== "") {
                if (parseFloat(userNumStr) === parseFloat(correctNumStr)) {
                    totalScore += 0.5;
                }
            } else {
                if (userVal === correctVal) {
                    totalScore += 0.5;
                }
            }
        }
    });
    return totalScore.toFixed(2);
}

function executeSubmission() {
    isExamActive = false;
    closeConfirmModal();
    
    if (countdown) clearInterval(countdown);
    
    const finalScore = calculateScore();
    const answeredSet = new Set();
    Object.keys(userAnswers).forEach(key => {
        const match = key.match(/\d+/);
        if (match) answeredSet.add(match[0]);
    });
    const soCauDaLam = `${answeredSet.size}/${examData.length}`;

    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const studentName = savedUser ? (savedUser.name || savedUser.fullName) : "Ẩn danh";
    const studentMSSV = savedUser ? (savedUser.mssv || savedUser.sbd) : "000";
    const selectedExam = savedUser ? (savedUser.examName) : "Kỳ thi tốt nghiệp THPT 2026";

    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }

    document.getElementById('exam-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('res-done').innerText = soCauDaLam;
    document.getElementById('res-score').innerText = `${finalScore}/10`;

    localStorage.removeItem('userAnswers');
    localStorage.removeItem('examTimeLeft');

const payload = {
        username: studentMSSV,
        studentName: studentName,
        examName: selectedExam,
        score: `${finalScore}/10`,
        extraData: `${soCauDaLam} (Vi phạm: ${violationCount} lần)`,
        
        // SỬA LẠI DÒNG DƯỚI ĐÂY: Lưu thành một Object chứa cả đề bài thực tế
        userAnswersText: JSON.stringify({ 
            answers: userAnswers, 
            questions: examData 
        })
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" } 
    }).catch(err => console.error("Lỗi đồng bộ bài làm:", err));
}

function finishExam() {
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('examTimeLeft');
    
    for (let prop in userAnswers) delete userAnswers[prop];
    flaggedQuestions.clear();
    currentQuestionIndex = 1;
    violationCount = 0;
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
    
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('done', 'active', 'flagged'));
    document.getElementById('answered-count').innerText = "0/22";

    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    
    initSystem(); 
    window.scrollTo(0, 0);
}