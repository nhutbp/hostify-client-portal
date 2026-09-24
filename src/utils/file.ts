export const MAX_IMAGE_SIZE = 2 * 1024 * 1024

export async function toBase64File(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  return dataUrl.split(',')[1] ?? ''
}
