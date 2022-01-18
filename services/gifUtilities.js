import { parseGIF, decompressFrames } from "gifuct-js";
import {
  buildImageFromND,
  upScaleGifFrameFromURI,
  buildNdarrayFromImage,
  getTopTags,
} from "./processingUtilities";
import { getPixelsFromInput } from "./imageUtilities";
import { runTagger } from "./onnxBackend";

async function frameAdd(frame, gif, height, width, delay) {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.src = await upScaleGifFrameFromURI(
      frame,
      height,
      width
    );
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      gif.addFrame(img, { delay: delay });
      resolve("Worked");
    };
  });
}
export async function doGif(inputURI, setTags, setUpscaleProgress) {
  return new Promise(async (resolve, reject) => {
    const extractFrames = require("./gifExtract.js");
    const results = await extractFrames({
      input: inputURI,
    });
    console.log(results)
    var promisedGif = await fetch(inputURI)
      .then((resp) => resp.arrayBuffer())
      .then((buff) => parseGIF(buff))
      .then((gif) => decompressFrames(gif, true));
    var GIF = require("./gif.js");
    var gif = new GIF({
      workers: 2,
      quality: 1,
      width: results.shape[1] * 2,
      height: results.shape[2] * 2,
    });

    const inputData = await getPixelsFromInput(
      buildImageFromND(
        results.data.slice(0 * results.stride[0], 1 * results.stride[0]),
        results.shape[2],
        results.shape[1],
      )
    );
    const tagInput = buildNdarrayFromImage(inputData);
    const tagOutput = await runTagger(tagInput);
    const tags = await getTopTags(tagOutput);
    setTags(tags);
    var i = 0;
    setUpscaleProgress([0, results.shape[0]]);
    for (var j = 0; j < results.shape[0]; j++) {
      var currentND = results.data.slice(
        j * results.stride[0],
        (j + 1) * results.stride[0]
      );
      setUpscaleProgress([i, results.shape[0]]);
      await frameAdd(currentND, gif, results.shape[2], results.shape[1], promisedGif[j].delay);
      i++;
    }

    gif.on("finished", function (blob) {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function () {
        resolve(reader.result);
      };
    });

    await gif.render();
  });
}