# image-to-vox

### Install

```
npm install image-to-vox
```

### Usage

```js
import imageToVox from 'image-to-vox'

const voxBlob = imageToVox(image, colorMap)
```

### API

`imageToVox(image, colorMap, options?): Blob`

where:

`image` is an object containing:

- `width: number`
- `height: number`
- `data: number[]`

`colorMap` is an array of object containing:

- `r: number`
- `g: number`
- `b: number`
- `a: number`

`options` is an object containing:

- `size?: 'original' | number` (Default value: `original`)
- `zColor?: 'single | layered'` (Default value: `single`)
