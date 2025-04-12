export default function timeAgo(dateString) {
  const now = new Date();
  const givenDate = new Date(dateString);
  const diffMs = now - givenDate;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 7) {
    return givenDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (days >= 1) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (hours >= 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (minutes >= 1) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}
