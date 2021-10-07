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

function writePaletteChunk(buffer: Buffer, colorMap: Color[]) {
  writeChunkHeader(buffer, 'RGBA', RGBA_CHUNK_SIZE)

  const chunk = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    RGBA_CHUNK_SIZE
  )

  colorMap.forEach((color, index) => {
    const chunkIndex = index * 4

    chunk[chunkIndex] = color.r
    chunk[chunkIndex + 1] = color.g
    chunk[chunkIndex + 2] = color.b
    chunk[chunkIndex + 3] = color.a
  })

  buffer.byteOffset += chunk.byteLength
}

function writeMainTransformChunk(buffer: Buffer) {
  writeChunkHeader(buffer, 'nTRN', MAIN_TRANSFORM_CHUNK_SIZE)
  buffer.writeInt(
    0 /* id of nTRN */,
    0 /* attr size */,
    1 /* id of nGRP */,
    -1 /* reserved id */,
    0 /* layer id */,
    1 /* num of frames */,
    0 /* frame content */
  )
}

function writeGroupChunk(buffer: Buffer, models: Model[]) {
  writeChunkHeader(buffer, 'nGRP', GROUP_CHUNK_SIZE + models.length * INT_SIZE)
  buffer.writeInt(
    1 /* id of nGRP */,
    0 /* attr size */,
    models.length /* num of models */
  )

  models.forEach((_, index) => buffer.writeInt(2 * index + 2 /* id of nTRN */))
}

function writeTransformChunk(buffer: Buffer, model: Model, index: number) {
  const position = getModelPosition(model)

  writeChunkHeader(buffer, 'nTRN', TRANSFORM_CHUNK_SIZE + position.length)
  buffer
    .writeInt(
      2 * index + 2 /* id of nTRN */,
      0 /* attr size */,
      2 * index + 3 /* id of nSHP */,
      -1 /* reserved id */,
      -1 /* layer id */,
      1 /* num of frames */,
      1 /* num of key-value pairs */,
      2 /* _t size */
    )
    .writeString('_t')
    .writeInt(position.length)
    .writeString(position)
}

function writeShapeChunk(buffer: Buffer, index: number) {
  writeChunkHeader(buffer, 'nSHP', SHAPE_CHUNK_SIZE)
  buffer.writeInt(
    2 * index + 3 /* id of nSHP */,
    0 /* attr size */,
    1 /* num of models */,
    index /* model id */,
    0 /* num of key-value pairs */
  )
}

export default function generateVox(models: Model[], colorMap: Color[]) {
  const childrenSize = countMainChildrenSize(models)
  const buffer = new Buffer(childrenSize + 4 /* 'VOX ' */ + INT_SIZE)

  buffer.writeString('VOX ').writeInt(150)

  writeChunkHeader(buffer, 'MAIN', 0, childrenSize)

  models.forEach(model => {
    writeSizeChunk(buffer, model)
    writeModelChunk(buffer, model)
  })

  writePaletteChunk(buffer, colorMap)

  writeMainTransformChunk(buffer)
  writeGroupChunk(buffer, models)

  models.forEach((model, index) => {
    writeTransformChunk(buffer, model, index)
    writeShapeChunk(buffer, index)
  })

  return buffer.toBlob()
}
