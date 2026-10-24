/**
 * YouTube URL parser and embed helper
 */

export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  // Regex supporting: standard watch?v=, youtu.be/, /embed/, /v/, /shorts/, and query params
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  return match && match[1].length === 11 ? match[1] : null;
}

export function isValidYouTubeUrl(url?: string | null): boolean {
  return extractYouTubeId(url) !== null;
}

export function getYouTubeEmbedUrl(url?: string | null, autoplay = true): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    ...(autoplay ? { autoplay: '1' } : {}),
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
