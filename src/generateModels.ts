import { Image, Color, Size, ZColor, Options, Model } from './types'

const MAX_MODEL_SIZE = 256

function toIndex(...args: number[]) {
  return args.join(',')
}

function indexColorMap(colorMap: Color[]): { [key: string]: number } {
  return colorMap.reduce(
    (obj, color, index) => ({
      ...obj,
      [toIndex(color.r, color.g, color.b, color.a)]: index
    }),
    {}
  )
}

function getMultiplier(image: Image, size: Size = 'original') {
  if (size === 'original') return 1

  const longerSide = Math.max(image.width, image.height)
  return Math.floor(longerSide / (MAX_MODEL_SIZE * size)) + 1
}

function getZColor(
  zColor: ZColor = 'single'
): (colorIndex: number, z: number) => number {
  if (zColor === 'layered') return (_, z) => z + 1
  return colorIndex => colorIndex + 1
}

export default function generateModels(
  image: Image,
  colorMap: Color[],
  options: Options
) {
  const multiplier = getMultiplier(image, options.size)
  const zColor = getZColor(options.zColor)

  const indexedColorMap = indexColorMap(colorMap)
  const modelZ = Math.floor(colorMap.length / 2)
  const models: Model[] = []

  for (let y = 0; y < image.height; y += multiplier) {
    const dataY = image.width * y
    const realY = y / multiplier
    const modelY = Math.floor(realY / MAX_MODEL_SIZE)
    const cellY = MAX_MODEL_SIZE - 1 - (realY % MAX_MODEL_SIZE)

    for (let x = 0; x < image.width; x += multiplier) {
      const index = (dataY + x) * 4
      const colorIndex =
        indexedColorMap[
          toIndex(
            image.data[index]!,
            image.data[index + 1]!,
            image.data[index + 2]!,
            image.data[index + 3]!
          )
        ]

      if (colorIndex !== undefined) {
        const realX = x / multiplier
        const modelX = Math.floor(realX / MAX_MODEL_SIZE)
        const cellX = realX % MAX_MODEL_SIZE
        let model = models[modelY + modelX]

        if (!model) {
          model = {
            x: modelX * MAX_MODEL_SIZE,
            y: MAX_MODEL_SIZE - 1 - modelY * MAX_MODEL_SIZE,
            z: modelZ,
            width: MAX_MODEL_SIZE,
            height: MAX_MODEL_SIZE,
            depth: colorMap.length,
            cells: []
          }
          models[modelY + modelX] = model
        }

        for (let z = 0; z <= colorIndex; z += 1)
          model.cells.push({ x: cellX, y: cellY, z, i: zColor(colorIndex, z) })
      }
    }
  }

  return models
}
