/* eslint camelcase: [0] */
/* eslint no-unused-vars: [0] */
/**
 * Based on Johan Karlsson's blog post:
 * https://codepen.io/DonKarlssonSan/post/particles-in-simplex-noise-flow-field
 */
import Victor from 'victor';
import { Noise } from 'noisejs';
import util from '@/lib/util';

const int = Math.trunc;
const print = s => console.log(`[Flow] ${s}`);

const { rand, withinRect } = util;

Victor.prototype.setAngle = function (angle) {
  const length = this.length();
  this.x = Math.cos(angle) * length;
  this.y = Math.sin(angle) * length;
};

Victor.prototype.setLength = function (length) {
  const angle = this.angle();
  this.x = Math.cos(angle) * length;
  this.y = Math.sin(angle) * length;
};

let noise; // Perlin noise instance.

/**
 * @private
 * @param {Object} [o]
 * @param {Object} [o.ctx] Canvas context
 * @param {number} [o.index] Index for the instance stored in "particles".
 * @param {number} [o.width] Canvas width
 * @param {number} [o.height] Canvas height
 * @returns {Object}
 */
const createParticle = ({ ctx, index, width, height }) => {
  const size = 3;
  const pos = new Victor(rand(0, width), rand(0, height));
  const vel = new Victor(rand(-1, 1), rand(-1, 1));
  
  return {
    pos,
    update: (v) => {
      if (v) {
        vel.add(v);
      }
      pos.add(vel);
      if (vel.length() > 2) {
        vel.setLength(2);
      }
      if (pos.x > width) {
        pos.x = 0;
      } else if (pos.x < -size) {
        pos.x = width - 1;
      }
      if (pos.y > height) {
        pos.y = 0;
      } else if (pos.y < -size) {
        pos.y = height - 1;
      }
    },
    draw: () => {
      ctx.fillRect(pos.x, pos.y, size, size);
    }
  };
};

/**
 * @public
 * @param {Object} [canvas]
 * @returns {Object}
 */
export default function factory (canvas) {
  const ctx = canvas && canvas.getContext('2d');

  const size = 15;

  let width = 0;
  let height = 0;
  let cols = 1;
  let rows = 1;
  let zin = 0;

  let particles = [];
  let field = [];

  // --------------------------
  // Reset
  // --------------------------

  const resetParticles = (num) => {
    particles.length = 0;
    zin = 0;
    for (let index = 0; index < num; index++) {
      particles.push(
        createParticle({ ctx, index, width, height })
      );
    }
  };

  const resetField = () => {
    field = new Array(cols);
    for (let x = 0; x < cols; x++) {
      field[x] = new Array(rows);
      for (let y = 0; y < rows; y++) {
        field[x][y] = new Victor(0, 0);
      }
    }
  };

  /**
   * @protected
   * @param {Object} [o]
   * @param {number} [o.num] Number of partcles.
   * @param {number} [o.width] Canvas width
   * @param {number} [o.height] Canvas height
   */
  const reset = ({ num, width: w, height: h }) => {
    print('+++++++ reset()');
    noise = new Noise(Math.random());
    width = canvas.width = w;
    height = canvas.height = h;
    ctx.strokeStyle = 'hsla(0, 0%, 100%, 1)';
    ctx.fillStyle = 'hsla(0, 0%, 100%, 1)';
    cols = Math.round(width / size) + 1;
    rows = Math.round(height / size) + 1;
    resetParticles(num);
    resetField();
  };

  // --------------------------
  // Update
  // --------------------------

  // Needs perlin noise to set new "angle" for each in the field.
  const angleZoom = n => n/20;
  const getPerlinAngle = (x, y, zin) => (
    noise.simplex3(angleZoom(x), angleZoom(y), zin) * Math.PI * 2
  );

  // Needs perlin noise to set new "length" for each in the field.
  const distOffset = 40000;
  const disZoom = n => n/40 + distOffset;
  const getPerlinDist = (x, y, zin) => (
    noise.simplex3(disZoom(x), disZoom(y), zin) * 0.5
  );

  const updateField = () => {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const p = field[x][y];
        p.setAngle(getPerlinAngle(x, y, zin));
        p.setLength(getPerlinDist(x, y, zin));
      }
    }
  };

  const updateParticles = () => {
    const rect = { x: 0, y: 0, width: cols, height: rows };
    particles.forEach(p => {
      const copy = p.pos.clone().divide({ x: size, y: size });
      let v;
      if (withinRect(copy, rect)) {
        v = field[int(copy.x)][int(copy.y)];
      }
      p.update(v);
    });
    zin += 0.001;
  };

  /**
   * @protected
   */
  const update = () => {
    updateField();
    updateParticles();
  };

  // --------------------------
  // Draw
  // --------------------------

  const drawField = () => {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px0 = x * size;
        const py0 = y * size;
        const px1 = px0 + field[x][y].x * size * 2;
        const py1 = py0 + field[x][y].y * size * 2;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px1, py1);
        ctx.stroke();
      }
    }
  };

  const drawParticles = () => {
    particles.forEach(p => p.draw());
  };

  /**
   * @protected
   */
  const draw = ({ bg }) => {
    if (!ctx) throw new Error('No context for flows.');
    if (bg) {
      ctx.putImageData(bg, 0, 0);
    }
    drawField();
    drawParticles();
  };

  return {
    reset,
    update,
    draw
  };
}
