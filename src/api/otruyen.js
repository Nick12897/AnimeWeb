const API_BASE = "https://otruyenapi.com/v1/api";
const DEFAULT_PAGE = 1;

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const json = await response.json();
  if (json?.status && json.status !== "success") {
    throw new Error(json?.message || "API returned an error");
  }

  return json;
}

export function getImageUrl(path, base = "https://img.otruyenapi.com") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${base.replace(/\/$/, "")}/uploads/comics/${path.replace(/^\/+/, "")}`;
}

export async function fetchHome() {
  return requestJson(`${API_BASE}/home`);
}

export async function fetchCategories() {
  return requestJson(`${API_BASE}/the-loai`);
}

export async function fetchList(type, page = DEFAULT_PAGE) {
  return requestJson(`${API_BASE}/danh-sach/${type}?page=${page}`);
}

export async function fetchCategory(slug, page = DEFAULT_PAGE) {
  return requestJson(`${API_BASE}/the-loai/${slug}?page=${page}`);
}

export async function fetchComic(slug) {
  return requestJson(`${API_BASE}/truyen-tranh/${slug}`);
}

export async function searchComics(keyword, page = DEFAULT_PAGE) {
  return requestJson(
    `${API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`
  );
}

export async function fetchChapter(chapterApiUrl) {
  return requestJson(chapterApiUrl);
}
