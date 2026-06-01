export function statusLabel(status) {
  const labels = {
    ongoing: "Đang cập nhật",
    completed: "Hoàn thành",
    coming_soon: "Sắp ra mắt",
  };

  return labels[status] || "Đang cập nhật";
}

export function listTitle(type) {
  const labels = {
    "truyen-moi": "Truyện mới",
    "sap-ra-mat": "Sắp ra mắt",
    "dang-phat-hanh": "Đang phát hành",
    "hoan-thanh": "Hoàn thành",
  };

  return labels[type] || "Danh sách truyện";
}

export function formatRelativeDate(value) {
  if (!value) return "Mới cập nhật";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Mới cập nhật";

  const diff = Date.now() - timestamp;
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));

  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần trước`;

  return new Intl.DateTimeFormat("vi-VN").format(new Date(timestamp));
}

export function chapterLabel(chapter) {
  if (!chapter?.chapter_name) return "Chap mới";

  return chapter.chapter_title
    ? `Chap ${chapter.chapter_name} - ${chapter.chapter_title}`
    : `Chap ${chapter.chapter_name}`;
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
