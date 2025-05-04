export const isUrl = (url: string): boolean => {
  return /^(https?:\/\/|file:\/\/|data:image\/)/.test(url);
}