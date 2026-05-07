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
        reading: "a",
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
        question: "Xét tính đúng sai của các mệnh đề sau:",
        reading: "Trong không gian với hệ trục tọa độ \\(Oxy\\), hai trạm phát sóng di động được đặt lần lượt tại hai vị trí \\(A(0;-2;0)\\) và \\(B(3;4;5)\\) (đơn vị: km). Vùng phủ sóng của trạm A là một hình cầu có tâm \\(I_1(1;-1;3)\\), bán kính \\(R_1=2\\), còn phủ sóng của trạm B là một hình cầu có phương trình \\(x^2+y^2+z^2-2x-6z+7=0\\). Hai vùng phủ sóng này giao nhau tạo thành một đường tròn nằm trên mặt phẳng \\((P)\\). Hai thiết bị giám sát M và N hoạt động trong khu vực giao nhau này và luôn duy trì khoảng cách giữa chúng là 1 km. Gọi \\((P)\\) là giao tuyến của hai mặt cầu \\((S_1)\\), \\((S_2)\\). Gọi \\(C(a_1,b_1,c_1)\\) và \\(D(a_2,b_2,c_2)\\) lần lượt là hình chiếu của A và B lên mặt phẳng \\((P)\\)",
        subQuestions: [
            { id: "a", text: "Mặt phẳng \\((P)\\) có phương trình là \\(y=0\\)", correct: "D" },
            { id: "b", text: "\\(a_1+b_1+c_1+a_2+b_2+c_2=9\\)", correct: "S" },
            { id: "c", text: "BD = 4", correct: "D" },
            { id: "d", text: "Tổng khoảng cách nhỏ nhất từ trạm phát sóng A đến thiết bị M và từ trạm phát sóng B đến thiết bị N nằm trong khoảng \\( \\left ( \\dfrac{37}{5}; \\dfrac{38}{5} \\right ) \\)", correct: "S" }
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
        question: "Trong không gian với hệ trục tọa độ \\(Oxy\\), xét một vùng phòng thủ hình cầu \\( (S): x^2+y^2+z^2=49 \\) và một hành lang bay an toàn được giới hạn bởi hai mặt phẳng song song \\( (P_1): x+y+z=5 \\) và mặt phẳng \\( (P_2): x+y+z=-5 \\). Một máy bay trinh sát bắt đầu xâm nhập khu vực từ điểm \\( M_0(6;0;0) \\) và bay theo đường thẳng \\( \\Delta \\) có vectơ chỉ phương \\(\\vec{u}=(-1;1;1)\\). Tính chiều dài doạn đường bay của máy bay nằm hoàn toàn trong phần giao của hành lang bay an toàn và vùng phòng thủ hình cầu",
        correct: "10"
    },
    {
        id: 18,
        part: 3,
        question: "Có một tờ giấy hình parabol có chiều cao bằng 60cm. Ta tiến hành gấp tờ giấy theo một đường nằm ngang song song với cạnh AB. Hãy tính giá trị nhỏ nhất của phần diện tích còn lại sau khi gấp so với diện tích ban đầu của tờ giấy <i>(Không làm tròn kết quả của các phép tính trung gian, chỉ làm tròn kết quả của phép tính cuối cùng đến hàng phần trăm)</i> ",
	image: "anhcau18.png",
        correct: "0,62"
    },
    {
        id: 19,
        part: 3,
        question: "Trên mặt phẳng tọa độ \\(Oxy\\), một chất điểm đang ở gốc \\(O(0;0)\\). Nếu chất điểm di chuyển trên trục hoành hoặc trục tung thì vận tốc của chất điểm là \\(1 \\text{ } m/s\\). Nếu chất điểm rời khỏi hai trục tọa độ thì vận tốc của chất điểm là \\(0,28 \\text{ } m/s\\). Gọi H là miền tập hợp tất cả các điểm mà chất điểm có thể đến được trong vòng 5 giây kể từ khi bắt đầu di chuyển. Tính diện tích của miền H theo đơn vị mét vuông <i>(Không làm tròn kết quả của các phép tính trung gian, chỉ làm tròn kết quả của phép tính cuối cùng đến hàng phần mười)</i>",
        correct: "22,6"
    },
    {
        id: 20,
        part: 3,
        question: "Trong không gian \\(Oxyz\\), cho hình lập phương \\(ABCD.A'B'C'D'\\) có tọa độ các đỉnh là \\(A(0;0;0), A'(0;0;4), B(4;0;0); D(0;4;0)\\). Gọi \\((S)\\) là mặt cầu có tâm là \\(I(2;2;2)\\) và bán kính bằng 2. Chọn ngẫu nhiên một điểm có tọa độ nguyên thuộc khối lập phương \\(ABCD.A'B'C'D'\\). Gọi \\(a\\) là xác suất để điểm được chọn thuộc khối cầu \\((S)\\). Tính \\(1000a\\)",
        correct: "264"
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
        question: "Từ tập \\(A= \\left \\{ 1; 2; ...; 49; 50 \\right \\} \\) gồm 50 số tự nhiên liên tiếp, cần chọn ra 21 số phân biệt để gắn vào 21 ô vuông đơn vị như hình vẽ. Gọi \\(T\\) là số cách chọn số sao cho mọi số ở hàng trên luôn nhỏ hơn mọi số ở hàng dưới, mọi số bên trái luôn nhỏ hơn mọi số bên phải cùng hàng, đồng thời các số thuộc các ô A, B, C, D, E, F theo thứ tự lập thành cấp số cộng. Tính \\( \\dfrac{T}{211969}\\) ",
	image: "anhcau22.png",
        correct: "1350"
    },
];