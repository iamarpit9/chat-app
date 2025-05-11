export function formatLastSeen(timestamp) {
  if (!timestamp) return "recently";

  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
}
