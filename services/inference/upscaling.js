import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import { runSuperRes } from '../onnxBackend'
import { buildImageFromND, buildNdarrayFromImageOutput } from '../processingUtilities'

/**
 * Upscales image pixel data using the super resolution model. The image is split
 *   into chunks of size chunkSize to avoid running out of memory on the WASM side.
 *
 * @param {ndarray} inputData Image data as pixels in a ndarray
 * @param {Number} upscaleFactor How many times to repeat the super resolution
 * @returns Upscaled image as URI
 */
export async function multiUpscale(imageArray, upscaleFactor) {
  let outArr = imageArray
  console.time('Upscaling')
  for (let s = 0; s < upscaleFactor; s += 1) {
    outArr = await upscaleFrame(outArr)
  }
  console.timeEnd('Upscaling')

  // Reshape network output into a normal image
  let outImgH = outArr.shape[2]
  let outImgW = outArr.shape[3]
  const outImg = buildNdarrayFromImageOutput(outArr, outImgH, outImgW)
  const outURI = buildImageFromND(outImg, outImgH, outImgW)
  return outURI
}

async function upscaleFrame(imageArray) {
  const CHUNK_SIZE = 512
  const PAD_SIZE = 32

  let inImgH = imageArray.shape[2]
  let inImgW = imageArray.shape[3]
  let outImgH = inImgH * 2
  let outImgW = inImgW * 2
  const nChunksH = Math.ceil(inImgH / CHUNK_SIZE)
  const nChunksW = Math.ceil(inImgW / CHUNK_SIZE)
  const chunkH = Math.floor(inImgH / nChunksH)
  const chunkW = Math.floor(inImgW / nChunksW)

  console.debug(`Upscaling ${inImgH}x${inImgW} -> ${outImgH}x${outImgW}`)
  console.debug(`Chunk size: ${chunkH}x${chunkW}`)
  console.debug(`Number of chunks: ${nChunksH}x${nChunksW}`)

  // Split the image in chunks and run super resolution on each chunk
  // Time execution
  let outArr = ndarray(new Uint8Array(3 * outImgH * outImgW), [1, 3, outImgH, outImgW])
  for (let i = 0; i < nChunksH; i += 1) {
    for (let j = 0; j < nChunksW; j += 1) {
      const x = j * chunkW
      const y = i * chunkH

      // Compute chunk bounds including padding
      const yStart = Math.max(0, y - PAD_SIZE)
      const inH = yStart + chunkH + PAD_SIZE * 2 > inImgH ? inImgH - yStart : chunkH + PAD_SIZE * 2
      const outH = 2 * (Math.min(inImgH, y + chunkH) - y)
      const xStart = Math.max(0, x - PAD_SIZE)
      const inW = xStart + chunkW + PAD_SIZE * 2 > inImgW ? inImgW - xStart : chunkW + PAD_SIZE * 2
      const outW = 2 * (Math.min(inImgW, x + chunkW) - x)

      // Create sliced and copy
      console.debug(`Chunk ${i}x${j}  (${xStart}, ${yStart})  (${inW}, ${inH}) -> (${outW}, ${outH})`)
      const inSlice = imageArray.lo(0, 0, yStart, xStart).hi(1, 3, inH, inW)
      const subArr = ndarray(new Uint8Array(inH * inW * 3), inSlice.shape)
      ops.assign(subArr, inSlice)

      // Run the super resolution model on the chunk, copy the result into the combined array
      const chunkData = await runSuperRes(subArr)
      const chunkArr = ndarray(chunkData.data, chunkData.dims)
      const chunkSlice = chunkArr.lo(0, 0, (y - yStart) * 2, (x - xStart) * 2).hi(1, 3, outH, outW)
      const outSlice = outArr.lo(0, 0, y * 2, x * 2).hi(1, 3, outH, outW)
      ops.assign(outSlice, chunkSlice)
    }
  }
  imageArray = outArr

  return outArr
}
