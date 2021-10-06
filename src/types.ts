export interface Image {
  width: number
  height: number
  data: number[]
}

export interface Color {
  r: number
  g: number
  b: number
  a: number
}

export type Size = 'original' | number
export type ZColor = 'single' | 'layered'

export interface Options {
  size?: Size
  zColor?: ZColor
}

interface Cell {
  x: number
  y: number
  z: number
  i: number
}

export interface Model {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  cells: Cell[]
}
