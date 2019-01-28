/* eslint camelcase: [0] */
/* eslint no-unused-vars: [1] */
import { Noise } from 'noisejs';

const print = s => console.log(`[Terrain] ${s}`);

let noise; // Perlin noise instance.

/**
 * https://forum.unity.com/threads/help-with-understanding-perlin-noise-and-implementing-modifiers.177009/
 * @private
 */
const fractalNoise = (width, height) => {
  const octaves = 8;
  const frq = 100.0;
  const amp = 1.0;
  const data = new Array(width);
  for (let x = 0; x < width; x++) {
    data[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      let noi = 0.0;
      let gain = 1.0;
      for (let i = 0; i < octaves; i++) {
        noi += noise.simplex2(x * gain / frq, y * gain / frq) * amp / gain;
        gain *= 2.0;
      }
      data[x][y] = noi;
    }
  }
  return data;
};

/**
 * @public
 * @param {Object} [canvas]
 * @returns {Object}
 */
export default function factory (canvas) {
  const ctx = canvas && canvas.getContext('2d');
  const size = 2;

  let width = 0;
  let height = 0;
  let cols = 1;
  let rows = 1;
  let terrain = [];
  let imageData;

  /**
   * @protected
   */
  const getImageData = () => imageData;

  /**
   * @protected
   */
  const reset = ({ width: w, height: h }) => {
    print('+++++++ reset()');
    if (!ctx) {
      throw new Error('No context for terrains.');
    }
    noise = new Noise(Math.random());
    width = canvas.width = w;
    height = canvas.height = h;
    cols = Math.round(width / size) + 1;
    rows = Math.round(height / size) + 1;
    ctx.strokeStyle = 'hsla(0, 0%, 100%, 1)';

    terrain.length = 0;
    terrain = fractalNoise(cols, rows);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const t = terrain[x][y];
        let color;
        // land (with grass)
        if (t > 0.95) {
          color = 'hsla(83, 33%, 23%, 1)';
        }
        else if (t > 0.9) {
          color = 'hsla(83, 33%, 25%, 1)';
        }
        else if (t > 0.8) {
          color = 'hsla(83, 33%, 29%, 1)';
        }
        else if (t > 0.7) {
          color = 'hsla(83, 22%, 34%, 1)';
        }
        // land
        else if (t > 0.6) {
          color = 'hsla(72, 7%, 40%, 1)';
        }
        else if (t > 0.5) {
          color = 'hsla(73, 11%, 44%, 1)';
        }
        else if (t > 0.4) {
          color = 'hsla(73, 11%, 53%, 1)';
        }
        else if (t > 0.35) {
          color = 'hsla(173, 8%, 40%, 1)';
        }
        else if (t > 0.3) {
          color = 'hsla(173, 8%, 32%, 1)';
        }
        // ocean
        else if (t > 0.2) {
          color = 'hsla(210, 68%, 29%, 1)';
        }
        else if (t > 0) {
          color = 'hsla(237, 68%, 34%, 1)';
        }
        else if (t > -0.1) {
          color = 'hsla(237, 63%, 29%, 1)';
        }
        else {
          color = 'hsla(237, 68%, 26%, 1)';
        }
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size); 
      }
    }
    imageData = ctx.getImageData(0, 0, width, height);

    return imageData;
  };

  return {
    getImageData,
    reset
  }
}

