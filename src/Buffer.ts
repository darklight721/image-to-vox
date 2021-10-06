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
    const view = new Uint32Array(this.buffer, this.byteOffset, args.length)
    view.set(args)
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
