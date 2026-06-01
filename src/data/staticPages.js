export const staticPages = {
  about: {
    eyebrow: "VỀ DỰ ÁN",
    title: "TÂM SEN phiên bản VueJS",
    description:
      "Bản chuyển đổi này giữ lại tinh thần giao diện cũ nhưng tổ chức lại theo component, router và dữ liệu động từ OTruyen API.",
    sections: [
      {
        title: "Đã chuyển đổi gì",
        body:
          "Trang chủ truyện tranh, trang tìm kiếm, trang chi tiết truyện, danh sách theo thể loại và trình đọc chap đều đã chạy bằng Vue 3 cùng dữ liệu thật từ API.",
      },
      {
        title: "Lợi ích kỹ thuật",
        body:
          "Project giờ có service layer riêng, route rõ ràng, state cục bộ dễ bảo trì và không còn phụ thuộc vào HTML tĩnh lặp lại ở nhiều trang.",
      },
      {
        title: "Hướng mở rộng",
        body:
          "Bạn có thể tiếp tục nối đăng nhập thật, lưu lịch sử đọc, bookmark, hoặc tách store sang Pinia nếu muốn phát triển thành ứng dụng hoàn chỉnh.",
      },
    ],
  },
  terms: {
    eyebrow: "ĐIỀU KHOẢN",
    title: "Điều khoản sử dụng",
    description:
      "Nội dung trang này đang được giữ ở mức mô phỏng để hoàn tất bước chuyển sang Vue trước, sau đó có thể thay bằng nội dung pháp lý chính thức.",
    sections: [
      {
        title: "Tài khoản",
        body:
          "Người dùng chịu trách nhiệm với thông tin truy cập và các hoạt động phát sinh từ tài khoản của mình.",
      },
      {
        title: "Nội dung",
        body:
          "Dữ liệu truyện đang được đọc từ OTruyen API nên cần kiểm tra lại phạm vi sử dụng nếu triển khai thương mại.",
      },
      {
        title: "Dịch vụ",
        body:
          "Các tính năng hiện tại thiên về demo frontend và tích hợp API, chưa bao gồm thanh toán hoặc quản lý hội viên thực tế.",
      },
    ],
  },
  privacy: {
    eyebrow: "RIÊNG TƯ",
    title: "Chính sách riêng tư",
    description:
      "Phiên bản hiện tại chưa gửi dữ liệu cá nhân lên backend riêng. Chủ yếu chỉ đọc dữ liệu công khai từ API và lưu theme ở localStorage.",
    sections: [
      {
        title: "Dữ liệu cục bộ",
        body:
          "Theme sáng tối được lưu trong trình duyệt để giữ trải nghiệm người dùng giữa các lần truy cập.",
      },
      {
        title: "Tìm kiếm",
        body:
          "Từ khóa tìm kiếm được đưa lên URL để chia sẻ và tải lại trang dễ dàng hơn.",
      },
    ],
  },
  faq: {
    eyebrow: "HỎI ĐÁP",
    title: "Câu hỏi thường gặp",
    description: "Một số trả lời nhanh cho phiên bản Vue tích hợp OTruyen API.",
    sections: [
      {
        title: "Dữ liệu truyện lấy từ đâu",
        body:
          "Danh sách, chi tiết và tìm kiếm truyện lấy từ OTruyen API; ảnh chap lấy từ chapter API nằm trong trường chapter_api_data.",
      },
      {
        title: "Có đọc chap trực tiếp được không",
        body:
          "Có. Route đọc chap sẽ tải dữ liệu ảnh từ chapter API và dựng reader trong ứng dụng.",
      },
      {
        title: "Có thể mở rộng thêm module khác không",
        body:
          "Có. Nên tách tiếp sang Pinia, thêm lazy loading ảnh, virtual list và cache nếu muốn scale lớn hơn.",
      },
    ],
  },
  profile: {
    eyebrow: "TÀI KHOẢN",
    title: "Hồ sơ của tôi",
    description:
      "Trang hồ sơ hiện là placeholder sau khi chuyển sang Vue. Bạn có thể nối tiếp với backend đăng nhập thật sau.",
    sections: [
      {
        title: "Gợi ý tiếp theo",
        body:
          "Thêm token auth, hồ sơ người dùng, lịch sử đọc, danh sách theo dõi và bình luận cá nhân.",
      },
    ],
  },
  library: {
    eyebrow: "THƯ VIỆN",
    title: "Thư viện của tôi",
    description:
      "Trang này đang chờ dữ liệu người dùng thật. Về mặt kiến trúc, nó đã sẵn sàng để đọc từ localStorage hoặc backend.",
    sections: [
      {
        title: "Có thể triển khai",
        body:
          "Danh sách truyện đã xem, yêu thích, chap đang đọc dở và lịch sử tìm kiếm gần đây.",
      },
    ],
  },
  pricing: {
    eyebrow: "GÓI CƯỚC",
    title: "Gói dịch vụ",
    description:
      "Hiện chưa có logic thanh toán thật. Trang này chủ yếu giữ chỗ trong router sau khi project được chuyển sang SPA.",
    sections: [
      {
        title: "Bước tiếp theo",
        body:
          "Nếu cần, mình có thể giúp bạn dựng tiếp trang pricing thật bằng Vue component và form checkout.",
      },
    ],
  },
  login: {
    eyebrow: "XÁC THỰC",
    title: "Đăng nhập",
    description:
      "Trang đăng nhập hiện là placeholder. Có thể nối tiếp với Firebase, Supabase hoặc backend Node/PHP tùy stack bạn muốn.",
    sections: [{ title: "Trạng thái", body: "Chưa kết nối backend xác thực." }],
  },
  register: {
    eyebrow: "XÁC THỰC",
    title: "Đăng ký",
    description: "Trang đăng ký hiện là placeholder sau khi chuyển sang Vue.",
    sections: [{ title: "Trạng thái", body: "Chưa kết nối backend xác thực." }],
  },
  audio: {
    eyebrow: "SÁCH NÓI",
    title: "Audio Books",
    description:
      "OTruyen API chỉ phục vụ mảng truyện tranh, nên trang audio hiện được giữ như route tĩnh để không phá vỡ điều hướng cũ.",
    sections: [
      {
        title: "Ghi chú",
        body:
          "Nếu muốn, mình có thể tách nhánh audio sang API riêng hoặc build catalog nội bộ cho phần sách nói.",
      },
    ],
  },
  ebooks: {
    eyebrow: "SÁCH ĐIỆN TỬ",
    title: "Ebooks",
    description: "Trang ebooks đang là route tĩnh vì API hiện tại tập trung vào truyện tranh.",
    sections: [
      {
        title: "Gợi ý",
        body:
          "Có thể tái sử dụng cùng layout này để nối API sách điện tử khác về sau.",
      },
    ],
  },
};
