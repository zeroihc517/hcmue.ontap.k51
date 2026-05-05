// questions.js
const examData = [
    // PHẦN I: Trắc nghiệm ABCD
    {
        id: 1,
        part: 1,
        question: "Cho hàm số \\(f(x)=\\dfrac{x-1}{x+1}\\)",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 2,
        part: 1,
        question: "Câu 2",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 3,
        part: 1,
        question: "Câu 3",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 4,
        part: 1,
        question: "Câu 4",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 5,
        part: 1,
        question: "Câu 5",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 6,
        part: 1,
        question: "Câu 6",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 7,
        part: 1,
        question: "Câu 7",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 8,
        part: 1,
        question: "Câu 8",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 9,
        part: 1,
        question: "Câu 9",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 10,
        part: 1,
        question: "Câu 10",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 11,
        part: 1,
        question: "Câu 11",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },
    {
        id: 12,
        part: 1,
        question: "Câu 12",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct: "A"
    },

    // PHẦN II: Đúng/Sai
    {
        id: 13,
        part: 2,
        question: "Câu 13",
        reading: "Một Studio chụp ảnh thiết lập hệ thống mạng để phục vụ công việc và khách hàng. Tại khu vực chỉnh sửa ảnh, các máy tính trạm được kết nối bằng dây cáp tập trung vào một thiết bị Switch để đảm bảo tốc độ truyền tải dữ liệu lớn, ổn định. Tại khu vực tiếp khách, Studio lắp đặt một Access Point (AP) kết nối vào Switch để phát Wi-Fi cho khách hàng xem ảnh trên máy tính bảng. Toàn bộ ảnh được lưu trữ tập trung trên một ổ cứng gắn mạng (NAS) dùng chung cho nội bộ. Để gửi ảnh cho khách và truy cập web, hệ thống mạng này kết nối với nhà cung cấp dịch vụ Internet thông qua một Router. Một số nhân viên kỹ thuật của Studio đưa ra các nhận định sau:",
        subQuestions: [
            { id: "a", text: "Ý hỏi thứ nhất", correct: "D" },
            { id: "b", text: "Ý hỏi thứ hai", correct: "S" },
            { id: "c", text: "Ý hỏi thứ ba", correct: "D" },
            { id: "d", text: "Ý hỏi thứ tư", correct: "S" }
        ]
    },
    {
        id: 14,
        part: 2,
        question: "Câu 14",
        reading: "Câu 14",
        subQuestions: [
            { id: "a", text: "Ý hỏi thứ nhất", correct: "D" },
            { id: "b", text: "Ý hỏi thứ hai", correct: "S" },
            { id: "c", text: "Ý hỏi thứ ba", correct: "D" },
            { id: "d", text: "Ý hỏi thứ tư", correct: "S" }
        ]
    },
    {
        id: 15,
        part: 2,
        question: "Câu 15",
        reading: "Câu 15",
        subQuestions: [
            { id: "a", text: "Ý hỏi thứ nhất", correct: "D" },
            { id: "b", text: "Ý hỏi thứ hai", correct: "S" },
            { id: "c", text: "Ý hỏi thứ ba", correct: "D" },
            { id: "d", text: "Ý hỏi thứ tư", correct: "S" }
        ]
    },
    {
        id: 16,
        part: 2,
        question: "Câu 16",
        reading: "Câu 16",
        subQuestions: [
            { id: "a", text: "Ý hỏi thứ nhất", correct: "D" },
            { id: "b", text: "Ý hỏi thứ hai", correct: "S" },
            { id: "c", text: "Ý hỏi thứ ba", correct: "D" },
            { id: "d", text: "Ý hỏi thứ tư", correct: "S" }
        ]
    },

    // PHẦN III: Trả lời ngắn
    {
        id: 17,
        part: 3,
        question: "Câu 17",
        correct: "10"
    },
    {
        id: 18,
        part: 3,
        question: "Câu 18?",
        correct: "10"
    },
    {
        id: 19,
        part: 3,
        question: "Câu 19?",
        correct: "10"
    },
    {
        id: 20,
        part: 3,
        question: "Câu 20?",
        correct: "10"
    },
    {
        id: 21,
        part: 3,
        question: "Câu 21?",
        correct: "10"
    },
    {
        id: 22,
        part: 3,
        question: "Câu 22?",
        correct: "10"
    },
];