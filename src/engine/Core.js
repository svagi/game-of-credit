/**
 * Copyright 2015 Jan Svager
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law || agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES || CONDITIONS OF ANY KIND, either express || implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule gameEngine
 **/

/* global THREE */
import { createMeshes } from "./Meshes";
import { getKeyFromCode } from "../utils/Helpers";
import { createPacker } from "../utils/Packer";
import Event from "../constants/EventTypes";

/**
 * Game engine factory
 * @param props {Object}
 * @return {Object} with public methods and properties
 */
export function createEngine(props) {

  const {
    emitter,
    socket,
    // canvas
    canvasWidth = 0,
    canvasHeight = 0,
    // player
    speed = 20,
    initialPosition = [0, 0, 0],
    initialRotation = [0, 0, 0],
    } = props;

  const aspect = canvasWidth / canvasHeight;
  const velocity = new THREE.Vector3();
  const rayCaster = new THREE.Raycaster();
  const rayDirections = {
    down: new THREE.Vector3(0, -1, 0),
    front: new THREE.Vector3(0, 0, -1)
  };
  const intersects = [];
  const collision = {
    down: true,
    front: false,
    back: false,
    left: false,
    right: false
  };
  const rotationAngle = Math.PI / 4;
  const rotationAxe = new THREE.Vector3(0, 1, 0);
  const defaultHeight = 20;

  const renderer = new THREE.WebGLRenderer(props.renderer);
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();

  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
  const cameraPitch = camera;
  const cameraYaw = new THREE.Object3D();

  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);

  const meshes = createMeshes(props.textures, props.models);

  const packer = createPacker([
    {type: "Float32Array", count: 5},
    {type: "Uint8Array", count: 1}
  ]);

  const sendPacket = (data) =>
    socket.emit(packer.pack(data));

  var delta = 0.0;
  var deltaSpeed;
  var idx = 0;
  var mouseX = 0;
  var mouseY = 0;
  var keys = {
    W: false,
    A: false,
    S: false,
    D: false,
    SPACE: false
  };
  var isJumping = false;
  var direction;
  var height;

  // EVENTS
  emitter.addListener(Event.CLICK, () => {
    console.log("click");
  });
  emitter.addListener(Event.MOUSE_MOVE, e => {
    mouseX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    mouseY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    cameraYaw.rotation.y -= mouseX * 0.002;
    cameraPitch.rotation.x -= mouseY * 0.002;
    cameraPitch.rotation.x = Math.max(
      -Math.PI / 2, Math.min(Math.PI / 2, cameraPitch.rotation.x)
    );

  });
  emitter.addListener(Event.KEY_DOWN, ({ keyCode }) => {
    const key = getKeyFromCode(keyCode);
    keys[key] = keys.hasOwnProperty(key);
  });

  emitter.addListener(Event.KEY_UP, ({ keyCode }) => {
    const key = getKeyFromCode(keyCode);
    keys[key] = !keys.hasOwnProperty(key);
  });

  // INITIALIZATION

  // Renderer
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.shadowMapEnabled = true;

  // no warnings
  // renderer.context.getProgramInfoLog = function () { return '' };

  // Camera
  cameraYaw.add(cameraPitch);
  cameraYaw.position.set(...initialPosition);
  cameraYaw.position.y += defaultHeight;
  cameraYaw.rotation.set(...initialRotation);
  scene.add(cameraYaw);

  // Lights
  directionalLight.position.set(-520, 520, 1000);
  directionalLight.castShadow = true;
  directionalLight.shadowCameraLeft = -720;
  directionalLight.shadowCameraRight = 700;
  directionalLight.shadowCameraBottom = -300;
  directionalLight.shadowCameraNear = 550;
  directionalLight.shadowCameraFar = 185;
  scene.add(ambientLight);
  scene.add(directionalLight);

  // Meshes
  meshes.items.forEach(mesh => scene.add(mesh));

  // public
  return {

    aspect: aspect,
    info: renderer.info,

    render() {
      delta = clock.getDelta();
      deltaSpeed = speed * delta;

      // Gravity
      velocity.y -= 9.823 * delta;

      // y intersect
      rayCaster.far = 1000; // avoid skyBox
      rayCaster.set(cameraYaw.position, rayDirections.down);
      collision.down = rayCaster.intersectObjects(meshes.items)[0];
      height = height ? cameraYaw.position.y - collision.down.distance + defaultHeight : defaultHeight;

      // xz intersects
      rayCaster.far = speed;
      for (idx = 0, direction = rayDirections.front.clone(); idx < 8; idx++) {
        direction.applyAxisAngle(rotationAxe, idx === 0 ? cameraYaw.rotation.y : rotationAngle);
        rayCaster.set(cameraYaw.position, direction);
        intersects[idx] = !!rayCaster.intersectObjects(meshes.items)[0];
      }
      collision.front = intersects[7] || intersects[0] || intersects[1];
      collision.back = intersects[3] || intersects[4] || intersects[5];
      collision.left = intersects[5] || intersects[6] || intersects[7];
      collision.right = intersects[1] || intersects[2] || intersects[3];

      // Player move
      if (keys.W && !collision.front) {
        velocity.z -= deltaSpeed;
      }
      if (keys.S && !collision.back) {
        velocity.z += deltaSpeed;
      }
      if (keys.A && !collision.left) {
        velocity.x -= deltaSpeed;
      }
      if (keys.D && !collision.right) {
        velocity.x += deltaSpeed;
      }
      if (keys.SPACE && !isJumping) {
        velocity.y += 3.0;
        isJumping = true;
      }

      cameraYaw.translateX(velocity.x);
      cameraYaw.translateY(velocity.y);
      cameraYaw.translateZ(velocity.z);

      // Ground check
      if (cameraYaw.position.y < height) {
        velocity.y = 0.0;
        cameraYaw.position.y = height;
        isJumping = false;
      }

      velocity.x -= velocity.x * deltaSpeed;
      velocity.z -= velocity.z * deltaSpeed;

      meshes.update(delta);
      renderer.render(scene, camera);
    },
    animate(callback) {
      const animationFrame = () => {
        if (callback()) return;
        this.render();
        sendPacket([
          cameraYaw.position.x,
          cameraYaw.position.y,
          cameraYaw.position.z,
          cameraYaw.rotation.x,
          cameraYaw.rotation.y,
          1
        ]);
        requestAnimationFrame(animationFrame);
      };
      requestAnimationFrame(animationFrame);
    },
    resize(size) {
      camera.aspect = size.canvasWidth / size.canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(size.canvasWidth, size.canvasHeight);
    }
  };
}
