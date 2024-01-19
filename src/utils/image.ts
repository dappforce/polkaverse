import Compressor from 'compressorjs'

export function resizeImage(file: File | Blob): Promise<File | Blob> | File | Blob {
  if (file.size < 1024 * 1024) return file

  return new Promise(resolve => {
    new Compressor(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      success: file => {
        resolve(file as File)
      },
    })
  })
}
