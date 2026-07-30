let allBankQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
    handlePartChange();
    loadExamSuggestions();
    loadBankList();
    
    document.getElementById('question-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestion();
    });
});

function handlePartChange() {
    const part = document.getElementById('part-select').value;
    document.querySelectorAll('.part-fields').forEach(el => el.style.display = 'none');
    document.getElementById(`inputs-part-${part}`).style.display = 'block';
    renderPreview();
}

// Bổ sung nút bấm thêm Đợt thi mới thông qua Prompt nhanh
function addNewExamPrompt() {
    const newExam = prompt("Nhập tên Đợt Thi / Kỳ Thi mới:");
    if (newExam && newExam.trim() !== "") {
        const input = document.getElementById('q-exam-name');
        input.value = newExam.trim();
        
        // Thêm vào danh sách gợi ý
        const datalist = document.getElementById('exam-suggestions');
        datalist.innerHTML += `<option value="${newExam.trim()}">`;
    }
}

function loadExamSuggestions() {
    fetch(`${GOOGLE_SCRIPT_URL}?action=getExamList`)
        .then(res => res.json())
        .then(exams => {
            const datalist = document.getElementById('exam-suggestions');
            const filterSelect = document.getElementById('filter-admin-exam');
            datalist.innerHTML = '';
            
            // Xóa hết ngoại trừ option mặc định
            filterSelect.innerHTML = '<option value="">-- Tất cả đợt thi --</option>';
            
            exams.forEach(ex => {
                if (ex) {
                    datalist.innerHTML += `<option value="${ex}">`;
                    filterSelect.innerHTML += `<option value="${ex}">${ex}</option>`;
                }
            });
        })
        .catch(err => console.error("Lỗi lấy danh sách đợt thi:", err));
}

function renderPreview() {
    const part = document.getElementById('part-select').value;
    const content = document.getElementById('q-content').value || "Nội dung câu hỏi sẽ hiển thị ở đây...";
   const rawImgUrl = document.getElementById('q-image').value;
const imgUrl = convertDriveUrl(rawImgUrl);
    const previewBox = document.getElementById('preview-box');

    let imgHtml = imgUrl ? `<img src="${imgUrl}" alt="Ảnh xem trước" style="max-width:100%; margin:10px 0;">` : '';

    if (part === '1') {
        const optA = document.getElementById('opt-a').value || "Lựa chọn A";
        const optB = document.getElementById('opt-b').value || "Lựa chọn B";
        const optC = document.getElementById('opt-c').value || "Lựa chọn C";
        const optD = document.getElementById('opt-d').value || "Lựa chọn D";

        previewBox.innerHTML = `
            <p><strong>Câu hỏi mẫu:</strong> ${content}</p>
            ${imgHtml}
            <div class="options">
                <label><input type="radio" disabled> A. ${optA}</label>
                <label><input type="radio" disabled> B. ${optB}</label>
                <label><input type="radio" disabled> C. ${optC}</label>
                <label><input type="radio" disabled> D. ${optD}</label>
            </div>
        `;
    } else if (part === '2') {
        const textA = document.getElementById('tf-a').value || "Ý khẳng định a";
        const textB = document.getElementById('tf-b').value || "Ý khẳng định b";
        const textC = document.getElementById('tf-c').value || "Ý khẳng định c";
        const textD = document.getElementById('tf-d').value || "Ý khẳng định d";

        previewBox.innerHTML = `
            <p><strong>Đề bài/Ngữ liệu:</strong> ${content}</p>
            ${imgHtml}
            <table class="tf-table">
                <tr><th>Lệnh/Ý hỏi</th><th>Đúng</th><th>Sai</th></tr>
                <tr><td>a) ${textA}</td><td><input type="radio" disabled></td><td><input type="radio" disabled></td></tr>
                <tr><td>b) ${textB}</td><td><input type="radio" disabled></td><td><input type="radio" disabled></td></tr>
                <tr><td>c) ${textC}</td><td><input type="radio" disabled></td><td><input type="radio" disabled></td></tr>
                <tr><td>d) ${textD}</td><td><input type="radio" disabled></td><td><input type="radio" disabled></td></tr>
            </table>
        `;
    } else if (part === '3') {
        previewBox.innerHTML = `
            <p><strong>Câu hỏi:</strong> ${content}</p>
            ${imgHtml}
            <input type="text" class="short-answer-input" placeholder="Nhập đáp án..." disabled>
        `;
    }

    if (window.MathJax) {
        window.MathJax.typesetPromise([previewBox]).catch((err) => console.log(err));
    }
}

// LẤY DANH SÁCH CÂU HỎI TRONG BANK
function loadBankList() {
    const loading = document.getElementById('bank-list-loading');
    const container = document.getElementById('bank-list-container');
    const filterSelect = document.getElementById('filter-admin-exam');
    const filterExam = filterSelect ? filterSelect.value : "";

    if (loading) loading.style.display = 'block';
    if (container) container.innerHTML = '';

    fetch(`${GOOGLE_SCRIPT_URL}?action=getAllBank&examName=${encodeURIComponent(filterExam)}`)
        .then(res => res.json())
        .then(data => {
            allBankQuestions = data;
            renderBankList();
        })
        .catch(err => console.error("Lỗi lấy danh sách bank:", err))
        .finally(() => {
            if (loading) loading.style.display = 'none';
        });
}

function renderBankList() {
    const container = document.getElementById('bank-list-container');
    container.innerHTML = '';

    if (allBankQuestions.length === 0) {
        container.innerHTML = '<div style="color:#64748b; font-size:0.9rem;">Chưa có câu hỏi nào trong đợt thi này.</div>';
        return;
    }

    allBankQuestions.forEach((q, index) => {
        const item = document.createElement('div');
        item.style.cssText = "background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;";
        item.innerHTML = `
            <div style="font-size:0.88rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;">
                <span style="background:#e0e7ff; color:#3730a3; font-weight:bold; padding:2px 6px; border-radius:4px;">${q.examName ? q.examName : 'Chung'} | P${q.part}-Bộ ${q.setNum}</span> 
                <strong>${q.content}</strong>
            </div>
            <button onclick="prepareEditQuestion(${index})" style="background:#3b82f6; color:white; border:none; padding:4px 10px; border-radius:4px; font-weight:bold; font-size:0.8rem; cursor:pointer;">✏️ Sửa</button>
        `;
        container.appendChild(item);
    });
}

// ĐỔ DỮ LIỆU CÂU HỎI VÀO FORM ĐỂ CHỈNH SỬA
function prepareEditQuestion(index) {
    const q = allBankQuestions[index];
    if (!q) return;

    document.getElementById('edit-row-index').value = q.rowIndex;
    document.getElementById('q-exam-name').value = q.examName || '';
    document.getElementById('part-select').value = q.part;
    document.getElementById('set-num').value = q.setNum;
    document.getElementById('q-content').value = q.content;
    document.getElementById('q-image').value = q.imageUrl || '';

    document.getElementById('form-title').innerText = `✏️ Cập Nhật Câu Hỏi (Dòng ${q.rowIndex})`;
    document.getElementById('btn-cancel-edit').style.display = 'inline-block';
    document.getElementById('btn-submit').innerText = "🔄 Cập Nhật Câu Hỏi";
    document.getElementById('btn-submit').style.background = '#3b82f6';

    handlePartChange();

    if (q.part == 1) {
        document.getElementById('opt-a').value = q.optA;
        document.getElementById('opt-b').value = q.optB;
        document.getElementById('opt-c').value = q.optC;
        document.getElementById('opt-d').value = q.optD;
        document.getElementById('correct-p1').value = q.correct || 'A';
    } else if (q.part == 2) {
        document.getElementById('tf-a').value = q.optA;
        document.getElementById('tf-b').value = q.optB;
        document.getElementById('tf-c').value = q.optC;
        document.getElementById('tf-d').value = q.optD;

        let tfAns = (q.correct || "D,D,D,D").split(',');
        document.getElementById('tf-ans-a').value = tfAns[0] || 'D';
        document.getElementById('tf-ans-b').value = tfAns[1] || 'D';
        document.getElementById('tf-ans-c').value = tfAns[2] || 'D';
        document.getElementById('tf-ans-d').value = tfAns[3] || 'D';
    } else if (q.part == 3) {
        document.getElementById('correct-p3').value = q.correct;
    }

    renderPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormToCreate() {
    document.getElementById('edit-row-index').value = '';
    document.getElementById('form-title').innerText = "✏️ Thêm Câu Hỏi Mới";
    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('btn-submit').innerText = "💾 Lưu Vào Ngân Hàng Câu Hỏi";
    document.getElementById('btn-submit').style.background = '#10b981';

    document.getElementById('question-form').reset();
    handlePartChange();
    renderPreview();
}

function saveQuestion() {
    const btnSubmit = document.getElementById('btn-submit');
    const rowIndex = document.getElementById('edit-row-index').value;
    const isEditing = rowIndex !== "";

    const part = document.getElementById('part-select').value;
    const setNum = document.getElementById('set-num').value;
    const content = document.getElementById('q-content').value;
    const imageUrl = document.getElementById('q-image').value;

    let payload = {
        action: isEditing ? "updateQuestion" : "addQuestion",
        rowIndex: isEditing ? parseInt(rowIndex) : null,
        examName: document.getElementById('q-exam-name').value.trim(),
        part: parseInt(part),
        setNum: parseInt(setNum),
        content: content,
        imageUrl: imageUrl
    };

    if (part === '1') {
        payload.optA = document.getElementById('opt-a').value;
        payload.optB = document.getElementById('opt-b').value;
        payload.optC = document.getElementById('opt-c').value;
        payload.optD = document.getElementById('opt-d').value;
        payload.correct = document.getElementById('correct-p1').value;
    } else if (part === '2') {
        payload.optA = document.getElementById('tf-a').value;
        payload.optB = document.getElementById('tf-b').value;
        payload.optC = document.getElementById('tf-c').value;
        payload.optD = document.getElementById('tf-d').value;
        
        const ansA = document.getElementById('tf-ans-a').value;
        const ansB = document.getElementById('tf-ans-b').value;
        const ansC = document.getElementById('tf-ans-c').value;
        const ansD = document.getElementById('tf-ans-d').value;
        payload.correct = `${ansA},${ansB},${ansC},${ansD}`;
    } else if (part === '3') {
        payload.correct = document.getElementById('correct-p3').value;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = isEditing ? "⏳ Đang cập nhật câu hỏi..." : "⏳ Đang lưu câu hỏi...";

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(res => res.json())
    .then(data => {
        alert(isEditing ? "🎉 Đã cập nhật câu hỏi thành công!" : "🎉 Đã lưu câu hỏi thành công vào Ngân hàng!");
        resetFormToCreate();
        loadExamSuggestions();
        loadBankList();
    })
    .catch(err => {
        console.error(err);
        alert("❌ Lỗi khi gửi dữ liệu. Vui lòng kiểm tra lại đường truyền!");
    })
    .finally(() => {
        btnSubmit.disabled = false;
    });
}