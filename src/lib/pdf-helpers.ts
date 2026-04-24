export const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = url
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject(new Error('Failed to get canvas context'))
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = (e) => reject(e)
    })
}
