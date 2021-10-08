import imageToVox from '../../lib'

const imageEl = document.querySelector('#image')
const colorMapEl = document.querySelector('#colorMap')

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')

const previewFile = el => e => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.addEventListener('load', () => {
    el.src = reader.result
  })

  reader.readAsDataURL(file)
}

document
  .querySelector('#imageInput')
  .addEventListener('change', previewFile(imageEl))

document
  .querySelector('#colorMapInput')
  .addEventListener('change', previewFile(colorMapEl))

document.querySelector('#generateVox').addEventListener('click', async () => {
  canvas.width = imageEl.naturalWidth
  canvas.height = imageEl.naturalHeight
  context.drawImage(imageEl, 0, 0)

  const image = context.getImageData(
    0,
    0,
    imageEl.naturalWidth,
    imageEl.naturalHeight
  )

  const colorMap = (await (await fetch(colorMapEl.src)).text())
    .split('\n')
    .slice(3, 258)
    .filter(line => line)
    .map(line => {
      const [, r, g, b, a] = line.split(',')
      return { r, g, b, a }
    })

  const blob = imageToVox(image, colorMap)

  const link = document.createElement('a')
  link.download = 'imageToVox.vox'
  link.href = URL.createObjectURL(blob)
  link.innerText = 'Download vox file'

  document.querySelector('#downloadContainer').appendChild(link)
})
