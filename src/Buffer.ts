export default class Buffer {
  buffer: ArrayBuffer
  byteOffset: number
  textEncoder: TextEncoder

  constructor(size: number) {
    this.buffer = new ArrayBuffer(size)
    this.byteOffset = 0
    this.textEncoder = new TextEncoder()
  }

  writeInt(...args: number[]) {
    // not using Uint32Array() here because byteOffset may not be multiple of 4
    const view = new DataView(
      this.buffer,
      this.byteOffset,
      args.length * Uint32Array.BYTES_PER_ELEMENT
    )

    args.forEach((arg, index) =>
      view.setUint32(index * Uint32Array.BYTES_PER_ELEMENT, arg, true)
    )

    this.byteOffset += view.byteLength

    return this
  }

  writeString(args: string) {
    const view = new Uint8Array(this.buffer, this.byteOffset, args.length)
    this.textEncoder.encodeInto(args, view)
    this.byteOffset += view.byteLength

    return this
  }

  toBlob() {
    return new Blob([this.buffer])
  }
}
