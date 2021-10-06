import type { Model, Color } from './types'
import Buffer from './Buffer'

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

function writeChunkHeader(
  buffer: Buffer,
  id: string,
  contentSize = 0,
  childrenSize = 0
) {
  buffer.writeString(id).writeInt(contentSize, childrenSize)
}

function writeSizeChunk(buffer: Buffer, model: Model) {
  writeChunkHeader(buffer, 'SIZE', SIZE_CHUNK_SIZE)
  buffer.writeInt(model.width, model.height, model.depth)
}

function writeModelChunk(buffer: Buffer, model: Model) {
  writeChunkHeader(buffer, 'XYZI', model.cells.length * 4 + INT_SIZE)
  buffer.writeInt(model.cells.length)

  const chunk = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    model.cells.length * 4
  )

  model.cells.forEach((cell, index) => {
    const chunkIndex = index * 4

    chunk[chunkIndex] = cell.x
    chunk[chunkIndex + 1] = cell.y
    chunk[chunkIndex + 2] = cell.z
    chunk[chunkIndex + 3] = cell.i
  })

  buffer.byteOffset += chunk.byteLength
}

export default function generateVox(models: Model[], colorMap: Color[]) {
  console.log(models, colorMap)
  const size = countMainChildrenSize(models)
  const buffer = new Buffer(size)

  return buffer.toBlob()
}
