import type { Model, Color } from './types'

const CHUNK_HEADER_SIZE = 12
const SIZE_CHUNK_SIZE = 12
const INT_SIZE = 4
const RGBA_CHUNK_SIZE = 1024 // 4 * 256
const MAIN_TRANSFORM_CHUNK_SIZE = 28
const GROUP_CHUNK_SIZE = 12
const TRANSFORM_CHUNK_SIZE = 38
const SHAPE_CHUNK_SIZE = 20

function getModelPosition(model: Model) {
  return `${model.x} ${model.y} ${model.z}`
}

function countMainChildrenSize(models: Model[]) {
  return models.reduce(
    (total, model) =>
      total +
      // size chunk
      CHUNK_HEADER_SIZE +
      SIZE_CHUNK_SIZE +
      // xyzi chunk
      CHUNK_HEADER_SIZE +
      INT_SIZE +
      model.cells.length * 4 +
      // transform chunk
      CHUNK_HEADER_SIZE +
      TRANSFORM_CHUNK_SIZE +
      getModelPosition(model).length +
      // shape chunk
      CHUNK_HEADER_SIZE +
      SHAPE_CHUNK_SIZE,
    // palette chunk
    CHUNK_HEADER_SIZE +
      RGBA_CHUNK_SIZE +
      // main transform chunk
      CHUNK_HEADER_SIZE +
      MAIN_TRANSFORM_CHUNK_SIZE +
      // group chunk
      CHUNK_HEADER_SIZE +
      GROUP_CHUNK_SIZE +
      models.length * INT_SIZE
  )
}

class Buffer {
  buffer: ArrayBuffer
  byteOffset: number
  textEncoder: TextEncoder

  constructor(size: number) {
    this.buffer = new ArrayBuffer(size)
    this.byteOffset = 0
    this.textEncoder = new TextEncoder()
  }

  writeInt(...args: number[]) {
    const view = new Uint32Array(this.buffer, this.byteOffset, args.length)
    view.set(args)
    this.byteOffset += view.byteLength
  }

  writeString(args: string) {
    const view = new Uint8Array(this.buffer, this.byteOffset, args.length)
    this.textEncoder.encodeInto(args, view)
    this.byteOffset += view.byteLength
  }
}

export default function generateVox(models: Model[], colorMap: Color[]) {
  console.log(models, colorMap)
  return 'Nothing yet'
}
