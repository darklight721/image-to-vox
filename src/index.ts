import type { Image, Color, Options } from './types'
import generateModels from './generateModels'
import generateVox from './generateVox'

export default function imageToVox(
  image: Image,
  colorMap: Color[],
  options: Options
) {
  const models = generateModels(image, colorMap, options)
  return generateVox(models, colorMap)
}
