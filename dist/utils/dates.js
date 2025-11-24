function pad(num) {
    return num < 10 ? "0" + num : String(num);
}
export function formatDate(date) {
    if (!date)
        return "";
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
}
export function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
export function addDays(date, days) {
    const d = date instanceof Date ? date : new Date(date);
    return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}
export function isDue(nextReview, referenceDate = new Date()) {
    if (!nextReview)
        return false;
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);
    const next = nextReview instanceof Date ? nextReview : new Date(nextReview);
    const n = new Date(next);
    n.setHours(0, 0, 0, 0);
    return n <= today;
}
export function calculateNextReview(frontmatter = {}, referenceDate = new Date()) {
    if (!frontmatter)
        return null;
    if (frontmatter.next_review) {
        return new Date(frontmatter.next_review);
    }
    const interval = typeof frontmatter.review_interval === "number"
        ? frontmatter.review_interval
        : parseInt(frontmatter.review_interval || 0, 10) || 0;
    const base = frontmatter.last_reviewed
        ? new Date(frontmatter.last_reviewed)
        : referenceDate;
    if (!base || !interval)
        return null;
    return addDays(base, interval);
}
