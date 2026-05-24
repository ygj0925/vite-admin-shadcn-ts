const AVATAR_UNKNOWN = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e5e7eb"/><circle cx="50" cy="38" r="18" fill="#9ca3af"/><path d="M50 60c-22 0-40 10-40 22v18h80V82c0-12-18-22-40-22z" fill="#9ca3af"/></svg>'
)
const AVATAR_MALE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#dbeafe"/><circle cx="50" cy="38" r="18" fill="#3b82f6"/><path d="M50 60c-22 0-40 10-40 22v18h80V82c0-12-18-22-40-22z" fill="#3b82f6"/></svg>'
)
const AVATAR_FEMALE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fce7f3"/><circle cx="50" cy="38" r="18" fill="#ec4899"/><path d="M50 60c-22 0-40 10-40 22v18h80V82c0-12-18-22-40-22z" fill="#ec4899"/></svg>'
)

export function getAvatar(avatar?: string, gender?: number): string {
  if (avatar) return avatar
  if (gender === 1) return AVATAR_MALE
  if (gender === 2) return AVATAR_FEMALE
  return AVATAR_UNKNOWN
}
