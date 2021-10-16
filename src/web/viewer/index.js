/* eslint-disable no-new, no-param-reassign */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { reaction } from 'mobx';

import DebugPanel from './DebugPanel.js';
import PortraitBackdrop from './PortraitBackdrop.js';
import SceneState from './SceneState.js';
import { RADIANS_TO_DEGREES } from './utils.js';

const query = new URLSearchParams(document.location.search);
const model = query.get('model') || 'models/creeps/roshan/roshan.vmdl';

// Holds portrait camera position/rotation, lights, whether to animate etc.
const state = new SceneState(query);

// Holds portrait backdrop texture (if any)
const backdrop = new PortraitBackdrop();

const clock = new THREE.Clock();
let animations = [];
let mixer = null;

const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;

// Holds a controllable main camera as well as a portrait camera
const cameras = {
  main: new THREE.PerspectiveCamera(
    27, aspect, 0.1, 2000,
  ),
  portrait: new THREE.PerspectiveCamera(
    state.camera.fov, aspect, state.camera.near, state.camera.far,
  ),
};
cameras.portrait.rotation.order = 'YXZ';
scene.add(cameras.main);
scene.add(cameras.portrait);

// Default to controllable camera
let camera = cameras.main;
camera.position.set(12, 12, 12);

// TODO: Proper ambient lighting according to Valve's engine
const ambient = new THREE.HemisphereLight();
scene.add(ambient);

const spotlight = new THREE.SpotLight();
const spotlightTarget = spotlight.target;
spotlightTarget.rotation.order = 'YXZ';
spotlight.castShadow = true;
scene.add(spotlight);
scene.add(spotlightTarget);

const gridHelper = new THREE.GridHelper(30, 10);
scene.add(gridHelper);

const spotlightHelper = new THREE.CameraHelper(spotlight.shadow.camera);
scene.add(spotlightHelper);

const axesHelper = new THREE.AxesHelper(10000);
scene.add(axesHelper);

const cameraHelper = new THREE.CameraHelper(cameras.portrait);
scene.add(cameraHelper);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
if (query.get('background') !== 'transparent') {
  renderer.setClearColor(query.get('background') || 'black');
}
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const canvas = renderer.domElement;
document.body.appendChild(renderer.domElement);

renderer.setAnimationLoop(() => {
  if (mixer) {
    mixer.update(state.model.animate ? clock.getDelta() : undefined);
  }
  if (state.helpers.spotlight) {
    spotlightHelper.update();
  }
  if (state.helpers.camera) {
    cameraHelper.update();
  }
  renderer.render(scene, camera);
});
renderer.render(scene, camera);

const controls = new OrbitControls(cameras.main, canvas);
controls.update();

window.addEventListener('resize', () => {
  const { innerWidth: width, innerHeight: height } = window;
  cameras.main.aspect = width / height;
  cameras.main.updateProjectionMatrix();
  cameras.portrait.aspect = width / height;
  cameras.portrait.updateProjectionMatrix();
  renderer.setSize(width, height);
}, false);

reaction(() => state.model.animation, (name) => {
  const clip = animations.find((a) => a.name === name);
  const action = mixer.clipAction(clip);
  if (action) {
    mixer.stopAllAction();
    action.play();
  }
});

reaction(() => state.model.animate, () => {
  mixer.setTime(0);
});

reaction(() => state.model.portrait, (portrait) => {
  if (portrait) {
    camera = cameras.portrait;
    controls.enabled = false;
    scene.background = backdrop;
  } else {
    camera = cameras.main;
    controls.enabled = true;
    scene.background = null;
  }
});

reaction(() => [
  state.camera.position.normalized,
  state.camera.rotation.normalized,
], ([position, rotation]) => {
  cameras.portrait.position.set(...position);
  cameras.portrait.rotation.set(...rotation);
});

reaction(() => [
  state.camera.fov, state.camera.far, state.camera.near,
], ([fov, far, near]) => {
  cameras.portrait.fov = fov;
  cameras.portrait.far = far;
  cameras.portrait.near = near;
  cameras.portrait.updateProjectionMatrix();
});

reaction(() => [
  state.lights.ambient.visible,
  state.lights.ambient.color.value,
], ([visible, color]) => {
  ambient.visible = visible;
  ambient.color.set(color);
}, { fireImmediately: true });

reaction(() => [
  state.lights.spotlight.visible,
  state.lights.spotlight.color.value,
  state.lights.spotlight.position.normalized,
  state.lights.spotlight.rotation.normalized,
  state.lights.spotlight.scale,
], ([visible, color, position, rotation]) => {
  spotlight.visible = visible;
  spotlight.color.set(color);
  spotlight.position.set(...position);

  // Unfortunately, most lights in THREE cannot be rotated directly. So, instead,
  // manually apply the given normalized rotation to the light's target and move it
  // slightly away from the source. If the light's target is added to the scene,
  // the light will automatically keep looking at the target.
  spotlightTarget.position.copy(spotlight.position);
  spotlightTarget.rotation.set(...rotation);
  spotlightTarget.translateZ(-1);
}, { fireImmediately: true });

reaction(() => state.lights.spotlight.fov, (fov) => {
  // Unfortunately, the shadow camera's field of view cannot be set directly,
  // so instead we alter the light's angle to result in the requested fov.
  // See: https://github.com/mrdoob/three.js/blob/master/src/lights/SpotLightShadow.js#L23
  spotlight.angle = fov / (RADIANS_TO_DEGREES * 2 * spotlight.shadow.focus);
});

reaction(() => [
  state.helpers.axes,
  state.helpers.grid,
  state.helpers.spotlight && state.lights.spotlight.visible,
  state.helpers.camera,
], ([showAxesHelper, showGridHelper, showSpotlightHelper, showCameraHelper]) => {
  axesHelper.visible = showAxesHelper;
  gridHelper.visible = showGridHelper;
  spotlightHelper.visible = showSpotlightHelper;
  cameraHelper.visible = showCameraHelper;
}, { fireImmediately: true });

(async () => {
  // Load binary glTF version of requested model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(`${model}.glb`);
  scene.add(gltf.scene);

  // Exported models occasionally include multiple LoD variations or gear. This
  // is unfortunately not exposed in the glTF format exported by VRF, so we do
  // our best to find the correct primary mesh and hide the rest, for now.
  let primary = null;

  // Primary mesh specified using URL param
  if (query.has('primaryMesh')) {
    primary = scene.getObjectByName(query.get('primaryMesh'));
  }

  // Find first SkinnedMesh as primary mesh
  if (!primary) {
    primary = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  }

  // Assume first child is primary mesh
  if (!primary) {
    [primary] = gltf.scene.children;
  }

  for (const child of gltf.scene.children) {
    child.visible = false;
  }
  primary.visible = true;
  primary.traverseAncestors((ancestor) => {
    ancestor.visible = true;
  });

  // Disable frustrum culling on the primary mesh
  primary.frustumCulled = false;

  // Allow shadow casting
  if (primary.material) {
    primary.castShadow = true;
    primary.receiveShadow = true;
    primary.material.needsUpdate = true;
  }

  // Prepare animations (if any)
  animations = gltf.animations;
  if (animations.length) {
    mixer = new THREE.AnimationMixer(gltf.scene);

    const clip = (
      animations.find((a) => a.name.includes('portrait'))
      || animations.find((a) => a.name === 'idle')
      || animations.find((a) => a.name.includes('idle'))
      || animations.find((a) => a.name.includes('capture'))
    ) || animations[0];
    state.model.animation = clip.name;
  }

  // Attempt loading portrait definition (camera angles, lights etc.)
  const portrait = query.get('portrait') || model;
  const response = await fetch(`portraits/${portrait}.json`);
  if (response.ok) {
    const definition = await response.json();
    await state.loadPortraitDefinition(definition);
    await backdrop.loadPortraitDefinition(definition);

    // Override material (if any)
    const material = query.get('material');
    if (material && primary.material) {
      primary.material.map.image = await new THREE.ImageLoader().loadAsync(
        `${material}.png`,
      );
      primary.material.map.needsUpdate = true;
    }

    // Enter portrait mode when requested to do so
    state.model.portrait = query.has('portrait');
  }

  if (query.has('debug')) {
    new DebugPanel(state, animations);
  }

  setTimeout(() => {
    document.dispatchEvent(new Event('model-viewer:ready'));
  }, 250);
})();
