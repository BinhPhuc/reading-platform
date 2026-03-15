const steps = [
  {
    icon: "📁",
    title: "Khám phá chủ đề",
    desc: "Bấm vào một thư mục chủ đề ở danh sách bên trái để mở rộng và xem danh sách sách thuộc chủ đề đó.",
  },
  {
    icon: "📖",
    title: "Mở sách để đọc",
    desc: "Bấm vào tên sách bất kỳ để bắt đầu đọc ngay trong trình duyệt — không cần tải về.",
  },
  {
    icon: "↩️",
    title: "Đổi sách dễ dàng",
    desc: "Bấm vào sách khác trong danh sách để chuyển sang đọc ngay, hoặc bấm nút quay lại để trở về trang này.",
  },
];

export default function WelcomeContent() {
  return (
    <div className="welcome-page">
      <div className="welcome-page-inner">
        <div className="welcome-page-header">
          <span className="welcome-page-icon">🌳</span>
          <div>
            <h2 className="welcome-page-title">Chào mừng đến Vườn Sách</h2>
            <p className="welcome-page-subtitle">
              Chọn sách từ danh mục bên trái để bắt đầu
            </p>
          </div>
        </div>

        <ul className="welcome-page-steps">
          {steps.map((s, i) => (
            <li key={i} className="welcome-page-step">
              <span className="step-icon">{s.icon}</span>
              <div>
                <strong className="step-title">{s.title}</strong>
                <p className="step-desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <blockquote className="hcm-quote hcm-quote--welcome">
          "Siêng xem sách và xem được nhiều sách là quý."
          <cite>— Hồ Chí Minh</cite>
        </blockquote>
      </div>
    </div>
  );
}
