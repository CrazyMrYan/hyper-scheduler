/**
 * 验证任务 ID 是否为非空字符串。
 * @param id 待验证的 ID
 * @throws Error 如果 ID 无效
 */
export function validateId(id: string): void {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Task ID must be a non-empty string.');
  }
}