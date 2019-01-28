<template>
  <v-app>
    <v-container id="container" class="p-0 bg">
      <v-layout column justify-start align-center wrap>
        <v-layout column justify-start align-center wrap>
          <v-flex xs12>
            <div id="canvasContainer" style="position:relative;">
              <canvas id="canvas" />
              <canvas id="canvasTerrain" />
            </div>
            <div>
              <a href="https://github.com/minagawah/perlin-noise-worldmap" target="_blank">
                SOURCE
              </a>
            </div>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-container>
  </v-app>
</template>

<style lang="stylus">
/* Override Vuetify's max-width for container */
.bg
  background-color: black
  max-width: 2048px

#canvas, #canvasTerrain
  position: absolute
  top: 0px
  left: 0px

#canvas
  z-index: 200

#canvasTerrain
  z-index: 100
</style>

<script>
/* eslint camelcase: [0] */
/* eslint no-unused-vars: [1] */
import util from '@/lib/util';
import createTerrain from './Terrain';
import createFlows from './Flows';

const { clamp, debounce } = util;

const print = s => console.log(`[App] ${s}`);

let canvas;
let canvasTerr;

let flo;
let ter;
let terrainImage;

let dt = 1;
let lt = 0;
let et = 0;
let tick = 0;

const requestAnimFrame = function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (a) { window.setTimeout(a, 1E3/60) }
}();

const getCanvasSize = () => {
  const maxWidth = 920;
  const body = document.body;
  const cont = document.getElementById('container');
  const { width: fullWidth, height: fullHeight } = (body && body.getBoundingClientRect()) || {};
  const { y: heightUsed } = (cont && cont.getBoundingClientRect()) || {};
  const availHeight = (fullHeight - heightUsed) * 0.9;
  const width = (fullWidth > maxWidth) ? maxWidth : fullWidth;
  const height = availHeight;
  return { width, height };
};

const reset = () => {
  const { width, height } = getCanvasSize();
  print('+++++++ reset()');
  print(`${width}x${height}`);
  canvas.width = width;
  canvas.height = height;

  const num = width * height / 900;
  flo.reset({ num, width, height });
  terrainImage = ter.reset({ width, height });

  const cc = document.getElementById('canvasContainer');
  if (cc) {
    cc.style.width = `${width}px`;
    cc.style.height = `${height}px`;
  }

  lt = Date.now();
  dt = 1;
  et = 0;
  tick = 0;
};

let suspend = false;
let inProcess = false;

const step = () => {
  if (inProcess || suspend) {
    return;
  }
  inProcess = true;
  requestAnimFrame(step);

  flo.update();
  flo.draw({ bg: terrainImage });

  let now = Date.now();
  dt = clamp((now - lt) / (1000 / 60), 0.001, 10);
  lt = now;
  et += dt;
  tick++;

  inProcess = false;
};

const init = () => {
  print('+++++++ init()');
  canvas = document.getElementById('canvas');
  canvasTerr = document.getElementById('canvasTerrain');
  flo = createFlows(canvas);
  ter = createTerrain(canvasTerr);
  window.addEventListener('resize', debounce(reset, 400), false);
  window.addEventListener('click', reset, false);
  reset();
  step();
};

export default {
  name: 'App',
  mounted () {
    init();
  }
}
</script>
