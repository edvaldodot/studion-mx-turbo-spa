/**
 * Return a filename without extension.
 * @param {string} filename
 * @returns {string}
 */
export function normalizeFilename (filename) {
  if (!filename.includes('.')) return filename

  const lastIndex = filename.lastIndexOf('.')
  return filename.substring(0, lastIndex)
}
