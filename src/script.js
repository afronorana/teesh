import "./style.css";
import "bootstrap";
import * as THREE from "three";

import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// console.log(GLTFExporter);

import { ObjectControls } from "./orbitcontrols";
import TextTexture from "@seregpie/three.text-texture";
import TextSprite from "@seregpie/three.text-sprite";
import Handlebars from "handlebars";
import { v4 as uuidv4 } from "uuid";

import Swal from "sweetalert2";
// import settingsTemplate from "./template/settings.handlebars";
// const layersTemplate = require("./template/layers.handlebars");
// const TextListTemplate = require("./template/TextList.handlebars");
import html2canvas from "html2canvas";

// import background from "./background.json";
import { vec3 } from "three/examples/jsm/nodes/shadernode/ShaderNode";
let loadingImg = document.getElementById("loadingImg");
let LoadingGif = document.getElementById("LoadingGif");
// loadingImg.setAttribute("src", serverurl + "assets/loading.gif");
let backgroundPreview = document.getElementById("backgroundPreview");
const settingLayoutUI = document.getElementById("settingsPanel");
let LayerPanelSettings = document.getElementById("LayerPanelSettings");

let imageElem = document.getElementById("image");
let tCtx = document.getElementById("textCanvas").getContext("2d");
// const addScene = document.getElementById("addScene");
// const removeScene = document.getElementById("removeScene");
// const ChooseFontSize = document.getElementById("ChooseFontSize");
// const ChooseFontFamily = document.getElementById("ChooseFontFamily");
// const ChooseFontColor = document.getElementById("ChooseFontColor");

let fontFamilyList = [
  "SixCaps-Regular",
  "Condiment-Regular",
  "Honey-Bear",
  "ROOSTER",
  "Bigdey",
];

const Montserratfont = new FontFace(
  "Montserrat-Regular",
  "url(./print_fonts/Montserrat/static/Montserrat-Regular.ttf)"
);
document.fonts
  .add(Montserratfont)
  .load("12px Montserrat-Regular", "text")
  .then((value) => {
    // console.log(value);
  });

const SixCapsfont = new FontFace( "SixCaps-Regular", "url(./print_fonts/SixCaps-Regular.ttf)" );
document.fonts
  .add(SixCapsfont)
  .load("12px SixCaps-Regular", "text")
  .then((value) => {
    // console.log(value);
  });

const Condimentfont = new FontFace(
  "Condiment-Regular",
  "url(./print_fonts/Condiment-Regular.ttf)"
);
document.fonts
  .add(Condimentfont)
  .load("12px Condiment-Regular", "text")
  .then((value) => {
    // console.log(value);
  });

Handlebars.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

let caster;
let selectedBg;
let selectedColor;
let selectedModel;
let objectControls;
let selectedDecalPosition = new THREE.Vector3();
let selectedDecal = null;
let selectedDecalImg = null;
let imageScale = 1;
let mapModels = new Map();

let fontScaleGlobal = 0.1;

let printSizeTxt = "";

let fontsize = { width: 0, height: 0 };

let selectedFontSize = 60;

let decalMesh = [];

let tshirtsColors = JSON.parse(tshirtsColorsList);
// let tshirtsColors = JSON.parse('{"background":[{"name":"pexels-photo","id":"pexels-photo","image":"./background/thumbnail/pexels-photo.jpeg","url":"./background/600/pexels-photo-1072179-600.jpeg","type":"image","color":""},{"name":"pexels-asad-photo-maldives","id":"pexels-asad-photo-maldives","image":"./background/thumbnail/pexels-asad-photo-maldives.jpeg","url":"./background/600/pexels-photo-457882-2-2.jpeg","type":"image","color":""},{"name":"pexels-marc-mueller","id":"pexels-marc-mueller","image":"./background/thumbnail/pexels-marc-mueller.jpg","url":"./background/600/pexels-marc-mueller-380768.jpg","type":"image","color":""},{"name":"pexels-shonejai","id":"pexels-shonejai","image":"./background/thumbnail/pexels-shonejai.jpg","url":"./background/600/pexels-shonejai.jpg","type":"image","color":""}]}');
console.log('tshirtsColors',tshirtsColors);

let screenshotImg;

selectedColor = tshirtsColors[0];

let updir = new THREE.Vector3(0, 1, 0);
let downdir = new THREE.Vector3(0, -1, 0);

let leftdir = new THREE.Vector3(-1, 0, 0);
let rightdir = new THREE.Vector3(1, 0, 0);

let frontdir = new THREE.Vector3(0, 0, 1);
let backdir = new THREE.Vector3(0, 0, -1);

const exporter = new GLTFExporter();

let decalImageMap = new Map();
let decalTextMap = new Map();

let lockImg = "./icons/lock.png";
let unlockImg = "./icons/unlock.png";

let bg = [];
let bgjson = JSON.parse(backgroundImageList);
bg = bgjson.background;
selectedBg = bg[0];
backgroundPreview.style.backgroundImage = "url(" + selectedBg.url + ")";
const state = {
  shadow: {
    blur: 3.5,
    darkness: 1,
    opacity: 1,
  },
  plane: {
    color: "#ffffff",
    opacity: 0.5,
  },
  showWireframe: true,
};

let renderer;

let meshParam = {
  slide: "slide",
  amblight: 1.5,
  image: {
    width: 600,
    height: 500,
  },
  scale: 1,
  rotation: 0,
  isNew: false,
  rotationEnable: true,
  uploadImage: false,
  upload: function () {
    fileupload();
  },
};

let width = 600;
let height = 600;

let fov = 35;
var mesh, decal;
var projector, raycaster, raycasterMesh;
var line;
const intersects = [];
var intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  rotation: new THREE.Vector3(),
};
var controls,
  renderHelpers = false;
var mouseVector = new THREE.Vector3();
var mouse = new THREE.Vector2();

const textureLoader = new THREE.TextureLoader();

let cskLogo = textureLoader.load(serverurl + "csk.png");
let decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  shininess: 30,
  map: cskLogo,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false,
});

let decals = [];
let mouseHelper;
const position = new THREE.Vector3();
const orientation = new THREE.Euler();
const size = new THREE.Vector3(1, 1, 1);

function degtorad(value) {
  return THREE.MathUtils.degToRad(value);
}

function radtodeg(value) {
  return THREE.MathUtils.radToDeg(value);
}

let rotationStep = degtorad(90);

// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();

const light = new THREE.HemisphereLight(0xfdf3c6, 0xeed5ae, meshParam.amblight); // soft white light
scene.add(light);

// const amblight = new THREE.AmbientLight(0xffffff, 500);
// scene.add(amblight);

raycaster = new THREE.Raycaster();

raycasterMesh = new THREE.Raycaster();

mouseHelper = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    map: cskLogo,

    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    wireframe: false,
  })
);
mouseHelper.visible = false;
const mouseHelperbox = new THREE.BoxHelper(mouseHelper, 0xffff00);

mouseHelper.renderOrder = -1;
mouseHelper.add(mouseHelperbox);
mouseHelper.scale.set(meshParam.scale, meshParam.scale, 0.1);
mouseHelper.rotation.set(0, 0, 0);
scene.add(mouseHelper);

/**
 * Sizes
 */
// const sizes = {
//   width: width,
//   height: height,
// };

const sizes = {
  width: window.innerWidth > 767 ? width : window.innerWidth,
  height: window.innerWidth > 767 ? height : window.innerHeight * 0.5,
};

window.addEventListener("resize", () => {
  // Update sizes
  // sizes.width = width;
  // sizes.height = height;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  fov,
  sizes.width / sizes.height,
  1,
  10000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 160;
scene.add(camera);

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

manager.onLoad = function () {
  LoadingGif.classList.add("hide");
  console.log("Loading complete!");
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

manager.onError = function (url) {
  console.log("There was an error loading " + url);
};

let tShirtmaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#", selectedColor.value),
  side: THREE.DoubleSide,
});

const box = new THREE.Box3();

const loader = new GLTFLoader(manager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(serverurl + "draco/");
loader.setDRACOLoader(dracoLoader);

function loadGlbModelUrl(url) {
  loader.load(
    // resource URL
    url,
    // called when the resource is loaded
    function (gltf) {
      mesh = gltf.scene;
      let boxs = box.setFromObject(mesh);
      let sizeV = new THREE.Vector3();
      boxs.getSize(sizeV);

      let sizeX = selectedModel.scale / sizeV.x;

      mesh.traverse((object) => {
        if (object.isMesh) {
          if (object.name.includes("pZone")) {
            decalMesh.push(object);
          }

          if (selectedModel.type) {
            if (selectedModel.material.includes(object.name)) {
              object.material.color = new THREE.Color(
                "#" + selectedColor.value
              );
              object.material.side = 2;
              object.material.needsUpdate = true;
              object.castShadow = true;
            }
          } else {
            object.material.color = new THREE.Color("#" + selectedColor.value);
            object.material.side = 2;
            object.material.needsUpdate = true;
            object.castShadow = true;
          }
        }
      });

      mesh.scale.set(sizeX, sizeX, sizeX);
      mesh.position.set(0, 0, 0);

      scene.add(mesh);

      sizeV = new THREE.Vector3();
      boxs = box.setFromObject(mesh);
      boxs.getSize(sizeV);
      mesh.boundingSize = sizeV;

      updateBoundingBox();

      objectControls.setObjectToMove(mesh);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {}
  );
}

function updateBoundingBox() {
  if (decalMesh.length > 0) {
    decalMesh.forEach((value) => {
      let boxChild = box.setFromObject(value);

      let sizeV1 = new THREE.Vector3();
      let posV1 = new THREE.Vector3();
      boxChild.getSize(sizeV1);
      boxChild.getCenter(posV1);
      value.boundingSize = sizeV1;
    });
    // console.log(decalMesh);
  }
}

modelList = JSON.parse(modelList);
let modelsArray = modelList.models;
selectedModel = modelsArray[0];
loadGlbModelUrl(modelsArray[0].url);

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});

renderer.shadowMap.enabled = true;
renderer.shadowMapAutoUpdate = true;
renderer.physicallycorrectlights = false;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.soft
renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let rect = renderer.domElement.getBoundingClientRect();

objectControls = new ObjectControls(camera, renderer.domElement);
objectControls.setRotationSpeed(0.1);
objectControls.setRotationSpeedTouchDevices(0.1);
objectControls.setDistance(80, 160); // sets the min - max distance able to zoom
objectControls.setZoomSpeed(2);

let x, y;

// window.addEventListener("resize", onWindowResize);

let moved = meshParam.rotationEnable;
let offsetY = 0;
let drag = false;
const delta = 6;
let startX;
let startY;

// controls.addEventListener("mousemove", function () {
//   moved = true;
// });

// window.addEventListener("touchstart", onPointerDown, false);
// window.addEventListener("touchmove", onPointerMove, false);
// window.addEventListener("touchend", onPointerUp, false);

// window.addEventListener("dblclick", (event) => {
//   if (moved === false) {
//     if (intersection.intersects && meshParam.uploadImage) shoot();
//   }
// });

// window.addEventListener("pointerdown", onPointerDown);

// window.addEventListener("pointerup", onPointerUp);

// window.addEventListener("pointermove", onPointerMove);

// function onPointerDown(event) {
//   startX = event.pageX;
//   startY = event.pageY;
//   drag = false;
//   moved = meshParam.rotationEnable;

//   if (decals.length > 0) {
//     let intersects1 = [];
//     mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
//     mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
//     raycasterMesh.setFromCamera(mouse, camera);
//     raycasterMesh.intersectObjects(decals, false, intersects1);
//     if (intersects1.length > 0) {
//       selectedDecal = intersects1[0].object;

//       meshParam.rotationEnable = false;
//       intersects1.length = 0;
//     } else {
//       // console.log(intersection.intersects);
//       if (intersection.intersects) {
//         if (decals.length > 1) {
//           // intersection.intersects = true;
//           meshParam.rotationEnable = false;
//           meshParam.isNew = false;
//         } else {
//           // intersection.intersects = false;
//           meshParam.rotationEnable = false;
//           selectedDecal = null;
//         }
//       } else {
//         selectedDecal = null;
//         meshParam.rotationEnable = true;
//         intersection.intersects = false;
//         // mouseHelper.visible = false;
//         // shoot();
//       }
//     }
//   }

//   if (selectedDecal) {
//     let sScale = selectedDecal.properties.scale.clone();
//     mouseHelper.pid = selectedDecal.uuid;
//     mouseHelper.position.copy(selectedDecal.properties.position);
//     mouseHelper.rotation.set(
//       selectedDecal.properties.orientation.x,
//       selectedDecal.properties.orientation.y,
//       selectedDecal.properties.rotation
//     );
//     mouseHelper.properties = selectedDecal.properties;
//     mouseHelper.texture = selectedDecal.texture;
//     mouseHelper.properties.scale = selectedDecal.properties.scale.clone();
//     mouseHelper.properties.rotation = selectedDecal.properties.rotation
//       ? selectedDecal.properties.rotation
//       : null;
//     mouseHelper.material.map = selectedDecal.texture;
//     mouseHelper.material.needsUpdate = true;
//     mouseHelper.name = selectedDecal.name;

//     if (selectedDecal.name == "Text") {
//       selectedDecal.texture.redraw();
//     }
//     mouseHelper.scale.set(sScale.x, sScale.y, 0.1);

//     // console.log(mouseHelper);
//     // removeDecals(selectedDecal.name);
//     // selectedDecal = null;
//     mouseHelper.visible = true;
//     // mouseHelper.map.material.wireframe = true;
//     meshParam.rotationEnable = false;
//     meshParam.uploadImage = true;
//     meshParam.slide = "mouse";
//     selectedDecal.visible = false;
//     // RotationCheckBoxChange();
//     // moved = false;
//     // moved = meshParam.rotationEnable;
//     objectControls.disableHorizontalRotation();
//   } else {
//     if (moved) {
//       meshParam.rotationEnable = true;
//       // RotationCheckBoxChange();
//       objectControls.enableHorizontalRotation();
//     }
//   }
// }

// function onPointerUp(event) {
//   const diffX = Math.abs(event.pageX - startX);
//   const diffY = Math.abs(event.pageY - startY);

//   drag = false;
//   if (moved === false) {
//     if (meshParam.uploadImage) {
//       if (meshParam.slide == "mouse") {
//         checkIntersection(event.clientX, event.clientY);
//       }
//     }

//     if (meshParam.uploadImage) shoot();
//   }
// }

// function onPointerMove(event) {
//   drag = true;
//   // console.log(drag ? "drag" : "click");
//   // console.log(event);
//   if (event.isPrimary) {
//     if (meshParam.uploadImage) {
//       if (meshParam.slide == "mouse") {
//         checkIntersection(event.clientX, event.clientY);
//       }
//     }

//   }
// }

renderer.domElement.addEventListener("pointerdown", onPointerDown, false);

renderer.domElement.addEventListener("pointerup", onPointerUp, false);

renderer.domElement.addEventListener("pointermove", onPointerMove, false);

function updateMousePosition(event) {
  mouse.x = ((event.clientX - rect.left) / sizes.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / sizes.height) * 2 + 1;
}

function onPointerDown(event) {
  updateMousePosition(event);

  renderer.domElement.setPointerCapture(event.pointerId);
  event = event.changedTouches !== undefined ? event.changedTouches[0] : event;

  drag = false;
  moved = meshParam.rotationEnable;

  if (decals.length > 0) {
    let intersects1 = [];
    mouse.x = ((event.clientX - rect.left) / sizes.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / sizes.height) * 2 + 1;
    // console.log("decals :", decals);
    let Removedecals = decals.filter(
      (value) => value.properties.lock === false
    );

    // console.log("Removedecals :", Removedecals);

    raycasterMesh.setFromCamera(mouse, camera);
    raycasterMesh.intersectObjects(Removedecals, false, intersects1);
    if (intersects1.length > 0) {
      selectedDecal = intersects1[0].object;
      // console.log("selected");
      let sScale = selectedDecal.properties.scale.clone();
      mouseHelper.pid = selectedDecal.uuid;
      mouseHelper.position.copy(selectedDecal.properties.position);
      mouseHelper.rotation.set(
        selectedDecal.properties.orientation.x,
        selectedDecal.properties.orientation.y,
        selectedDecal.properties.rotation
      );
      mouseHelper.properties = selectedDecal.properties;
      mouseHelper.texture = selectedDecal.texture;
      mouseHelper.properties.scale = selectedDecal.properties.scale.clone();
      mouseHelper.properties.rotation = selectedDecal.properties.rotation
        ? selectedDecal.properties.rotation
        : null;
      mouseHelper.material.map = selectedDecal.texture;
      mouseHelper.material.needsUpdate = true;
      mouseHelper.name = selectedDecal.name;

      if (selectedDecal.name == "Text") {
        selectedDecal.texture.redraw();
      }
      mouseHelper.scale.set(sScale.x, sScale.y, 0.1);

      // console.log(mouseHelper);
      // removeDecals(selectedDecal.name);
      // selectedDecal = null;
      mouseHelper.visible = true;
      // mouseHelper.map.material.wireframe = true;
      meshParam.rotationEnable = false;
      meshParam.uploadImage = true;
      meshParam.slide = "mouse";
      selectedDecal.visible = false;
      // RotationCheckBoxChange();
      // moved = false;
      // moved = meshParam.rotationEnable;
      objectControls.disableHorizontalRotation();
      meshParam.rotationEnable = false;
      intersects1.length = 0;
    } else {
      // console.log("unselect 2");
      // console.log(intersection.intersects);
      if (intersection.intersects) {
        // console.log("unselect 3");
        if (decals.length > 1) {
          // console.log("unselect 4");
          // intersection.intersects = true;
          meshParam.rotationEnable = false;
          // meshParam.uploadImage = true;
          meshParam.isNew = false;
          selectedDecal = null;
        } else {
          // console.log("unselect 5");
          // intersection.intersects = false;
          meshParam.rotationEnable = false;
          selectedDecal = null;
        }
      } else {
        // console.log("unselect 6");
        selectedDecal = null;
        meshParam.rotationEnable = true;
        intersection.intersects = false;
        objectControls.enableHorizontalRotation();
        // mouseHelper.visible = false;
        // shoot();
      }
    }
  }
}

function onPointerUp(event) {
  updateMousePosition(event);
  renderer.domElement.releasePointerCapture(event.pointerId);
  drag = false;
  if (moved === false) {
    // if (meshParam.uploadImage) {
    //   if (meshParam.slide == "mouse") {
    //     checkIntersection(event.clientX, event.clientY);
    //   }
    // }

    if (meshParam.uploadImage) {
      shoot();
      objectControls.enableHorizontalRotation();
    }
  }
}

function onPointerMove(event) {
  updateMousePosition(event);
  drag = true;
  if (event.isPrimary) {
    if (meshParam.uploadImage) {
      if (meshParam.slide == "mouse") {
        checkIntersection(event.clientX, event.clientY);
      }
    }
  }
}

let scale = 1;
document.addEventListener("keydown", async (e) => {
  e = e || window.event;
  if (e.keyCode === 38) {
    // console.log(selectedDecal);
    if (selectedDecal) {
      if (selectedDecal.name == "image") {
        let scaleV = selectedDecal.properties.scale.x;
        let imageS = selectedDecal.properties.imageScale;
        scaleV = scaleV + scale;
        mouseHelper.scale.set(scaleV, scaleV * imageS, 0.1);
        mouseHelper.properties.scale = mouseHelper.scale;
        // mouseHelper.properties.imageScale = imageS;
        meshParam.scale = scaleV;
      }
    } else {
      if (mouseHelper.name == "image") {
        let scaleV = mouseHelper.scale.x;
        scaleV = scaleV + scale;
        mouseHelper.scale.set(scaleV, scaleV * imageScale, 0.1);
        mouseHelper.properties.scale = mouseHelper.scale;
        // mouseHelper.properties.imageScale = imageScale;
        meshParam.scale = scaleV;
      }
    }
  } else if (e.keyCode === 40) {
    if (selectedDecal) {
      if (selectedDecal.name == "image") {
        let scaleV = selectedDecal.properties.scale.x;
        let imageS = selectedDecal.properties.imageScale;
        scaleV = scaleV - scale;
        mouseHelper.scale.set(scaleV, scaleV * imageS, 0.1);
        mouseHelper.properties.scale = mouseHelper.scale.clone();
        // mouseHelper.properties.imageScale = imageScale;
        meshParam.scale = scaleV;
      }
    } else {
      if (mouseHelper.name == "image") {
        let scaleV = mouseHelper.scale.x;
        scaleV = scaleV - scale;
        mouseHelper.scale.set(scaleV, scaleV * imageScale, 0.1);
        mouseHelper.properties.scale = mouseHelper.scale;
        // mouseHelper.properties.imageScale = imageScale;
        meshParam.scale = scaleV;
      }
    }
  } else if (e.keyCode === 37) {
    if (selectedDecal) {
      mouseHelper.rotateZ(-rotationStep);
      mouseHelper.properties.orientation = mouseHelper.rotation;
      mouseHelper.properties.rotation = mouseHelper.rotation.z;
    } else {
      mouseHelper.rotateZ(-rotationStep);
      mouseHelper.properties.orientation = mouseHelper.rotation;
      mouseHelper.properties.rotation = mouseHelper.rotation.z;
    }
  } else if (e.keyCode === 39) {
    if (selectedDecal) {
      mouseHelper.rotateZ(+rotationStep);
      mouseHelper.properties.orientation = mouseHelper.rotation;
      mouseHelper.properties.rotation = mouseHelper.rotation.z;
    } else {
      mouseHelper.rotateZ(+rotationStep);
      mouseHelper.properties.orientation = mouseHelper.rotation;
      mouseHelper.properties.rotation = mouseHelper.rotation.z;
    }
    console.log("right arrow pressed");
  } else if (e.keyCode == 68) {
    // await exportGltf();
  }
});

async function exportGltf() {
  await exporter.parse(
    scene,
    function (result) {
      console.log(result);
      saveArrayBuffer(JSON.stringify(result), "scene.glb");
    },
    { binary: true }
  );
}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
}

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // URL.revokeObjectURL( url ); breaks Firefox...
}

function checkIntersection(x, y) {
  if (mesh === undefined) return;
  mouse.x = ((x - rect.left) / sizes.width) * 2 - 1;
  mouse.y = -((y - rect.top) / sizes.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  raycaster.intersectObject(decalMesh[0], false, intersects);

  if (intersects.length > 0) {
    const p = intersects[0].point;
    mouseHelper.position.copy(p);
    intersection.point.copy(p);
    const n = intersects[0].face.normal.clone();
    n.transformDirection(mesh.matrixWorld);
    n.multiplyScalar(10);
    n.add(intersects[0].point);

    intersection.normal.copy(intersects[0].face.normal);
    intersection.rotation = n;

    mouseHelper.lookAt(n);
    if (mouseHelper.properties.rotation) {
      mouseHelper.rotation.set(
        mouseHelper.rotation.x,
        mouseHelper.rotation.y,
        mouseHelper.properties.rotation
      );
    }
    if (drag) {
      intersection.intersects = true;
    } else {
      intersection.intersects = false;
    }

    intersects.length = 0;
  } else {
    intersection.intersects = false;
  }
}

function decalPlace(Mainmesh, pos, rot, size, options) {
  let dMaterial = new THREE.MeshPhongMaterial({
    specular: 0x444444,
    shininess: 30,
    map: options.texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    wireframe: false,
    side: THREE.DoubleSide,
  });

  let m = new THREE.Mesh(
    new DecalGeometry(Mainmesh, pos, rot, size),
    dMaterial
  );
  // const box = new THREE.BoxHelper(m, 0xffff00);
  // m.add(box);
  m.name = options.name;
  m.texture = options.texture;
  let properties = {
    scale: size,
    position: pos,
    orientation: rot,
  };
  if (options.name == "Text") {
    properties.fontSize = options.properties.fontSize;
    properties.text = options.properties.text;
    properties.color = options.properties.color;
    properties.fontFamily = options.properties.fontFamily;
    properties.uuid = options.properties.uuid;
    properties.lock = options.properties.lock;
  } else {
    properties.imageScale = options.properties.imageScale;
    properties.imagesrc = options.properties.imagesrc;
    properties.uuid = options.properties.uuid;
    properties.lock = options.properties.lock;
  }

  if (options.properties.rotation) {
    properties.rotation = options.properties.rotation;
  }

  // console.log("properties :", properties.position);

  m.properties = properties;

  m.mainMesh = Mainmesh;
  m.renderOrder = decals.length; // give decals a fixed render order

  scene.add(m);
  decals.push(m);
  let imageMap = {};
  if (options.name == "image") {
    if (decalImageMap.has(properties.uuid)) {
      imageMap = decalImageMap.get(properties.uuid);
      imageMap.decalid = m.uuid;
    }
  } else {
    if (decalTextMap.has(properties.uuid)) {
      imageMap = decalTextMap.get(properties.uuid);
      imageMap.decalid = m.uuid;
    }
  }

  DecalMapDuplicate();

  m = null;
  objectControls.setObjectToMove([mesh, ...decals]);
  loadLayersUI();
}

function DecalMapDuplicate() {
  decalImageMap.forEach(function (item, key, mapObj) {
    if (!item.decalid) {
      decalImageMap.delete(key);
    }
  });

  decalTextMap.forEach(function (item, key, mapObj) {
    if (!item.decalid) {
      decalTextMap.delete(key);
    }
  });
}

function shoot() {
  // console.log("Shoot");
  meshParam.slide = "slide";
  position.copy(intersection.point);
  orientation.copy(mouseHelper.rotation);
  removeDecals(mouseHelper.pid);
  if (mouseHelper.properties) {
    size.set(
      mouseHelper.properties.scale.x,
      mouseHelper.properties.scale.y,
      mouseHelper.properties.scale.x
    );
    if (mouseHelper.properties.rotation) {
      orientation.set(
        orientation.x,
        orientation.y,
        mouseHelper.properties.rotation
      );
    }
  } else {
    size.set(meshParam.scale, meshParam.scale * imageScale, meshParam.scale);
  }

  decalPlace(
    decalMesh[0],
    position.clone(),
    orientation,
    size.clone(),
    mouseHelper
  );

  if (mouseHelper.name == "image") {
    let widthP = Math.round(size.x);
    let heightP = Math.round(size.y);
    printSizeTxt =
      "Print size : " + widthP + " cm (L) x " + heightP + " cm (H)";
    // console.log(printSizeTxt);
  }

  meshParam.uploadImage = false;
  mouseHelper.visible = false;
  selectedDecal = null;
  meshParam.isNew = false;

  selectDecalThumbActive();
  addPrintSizeText();
}

function removeDecals(id) {
  decals.forEach(function (d) {
    if (d.uuid == id) {
      scene.remove(d);
    }
  });
  const filteredPeople = decals.filter((item) => item.uuid !== id);
  decals = filteredPeople;
}

function removeAllDecals() {
  decals.forEach(function (d) {
    scene.remove(d);
  });
  decalImageMap.clear();
  decalTextMap.clear();
  decals.length = 0;
  selectedDecal = null;
}

function gettextTexture(text, size, color, fontFamily) {
  // console.log(text);
  let textLine = text.split("\\n");
  // console.log(textLine);
  return new TextTexture({
    alignment: "center",
    color: color,
    fontFamily: fontFamily,
    fontSize: size,
    text: textLine.join("\n"),
    padding: 0,
  });
}

function uploadText(text, size, color, fontFamily, parentId) {
  document.fonts.load("12px " + fontFamily).then((value) => {
    let texture = gettextTexture(text, size, color, fontFamily);
    // texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    meshParam.scale = 10;
    imageScale = texture.height / texture.width;
    // imageScale = imageScale > 1 ? 0.5 : imageScale;
    let scaleI = new THREE.Vector3(texture.width, texture.height, 0.1);
    // let scaleVs = size / texture.width;
    scaleI.multiplyScalar(fontScaleGlobal);

    // removeDecals("Text");
    let Dematerial = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      wireframe: false,
    });
    mouseHelper.material = Dematerial;
    mouseHelper.name = "Text";
    mouseHelper.texture = texture;
    mouseHelper.properties = {
      text,
      fontSize: size,
      color,
      fontFamily: texture.fontFamily,
    };
    let imageUUID = uuidv4();
    decalTextMap.set(imageUUID, {
      texture,
      properties: mouseHelper.properties,
      type: "text",
      uId: parentId,
    });
    mouseHelper.material.needsUpdate = true;
    mouseHelper.texture = texture;
    // decalMaterial.map = texture; // Make sure this is the texture.
    // decalMaterial.needsUpdate = true;
    texture.redraw();
    meshParam.uploadImage = false;
    meshParam.slide = "mouse";
    meshParam.rotationEnable = false;
    mouseHelper.visible = true;
    mouseHelper.position.set(mouse.x, mouse.y, mouse.z);
    mouseHelper.scale.copy(scaleI);
    mouseHelper.rotation.set(0, 0, 0);
    // mouseHelper.scale.setY(meshParam.scale * imageScale);
    mouseHelper.properties.scale = mouseHelper.scale;
    mouseHelper.properties.rotation = null;
    mouseHelper.properties.uuid = imageUUID;
    mouseHelper.properties.lock = false;
    meshParam.isNew = true;
    let scaleN = new THREE.Vector3(scaleI.x, scaleI.y, scaleI.x);
    let boundingSize = decalMesh[0].boundingSize;
    mouseHelper.position.set(mouse.x, mouse.y, boundingSize.z / 2);
    appendHiddenFields(parentId, imageUUID);
    decalPlace(
      decalMesh[0],
      mouseHelper.position.clone(),
      mouseHelper.rotation.clone(),
      scaleN.clone(),
      mouseHelper
    );
    mouseHelper.visible = false;
  });
}

function appendHiddenFields(parentId, uuid) {
  let Uid = "TextB" + parentId;
  if (document.getElementById(Uid)) {
    document.getElementById(Uid).remove();
  }

  const nodeUl = document.createElement("input");
  nodeUl.type = "hidden";
  nodeUl.classList.add("textDecalMap");
  nodeUl.id = Uid;
  nodeUl.value = uuid;
  document.getElementById(parentId).appendChild(nodeUl);
}

function uploadDesign(file) {
  var image = new Image();

  image.onload = function () {
    console.log("Width : ", this.width);
    console.log("Height : ", this.height);
    imageScale = this.height / this.width;
    // let boxG = new THREE.BoxGeometry(this.width * 0.1, this.height * 0.1);
    meshParam.scale = 10;
    selectedDecalImg = image.src;
    // removeDecals("image");
    var texture = new THREE.TextureLoader().load(image.src);
    let Dematerial = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      wireframe: false,
    });
    let imageUUID = uuidv4();
    decalImageMap.set(imageUUID, { image, src: image.src, type: "image" });
    // mouseDecalHelper.material.map = Dematerial;
    mouseHelper.name = "image";

    mouseHelper.texture = texture;

    mouseHelper.properties = {};
    mouseHelper.material = Dematerial;
    mouseHelper.material.needsUpdate = true;

    // decalMaterial.map = texture; // Make sure this is the texture.
    // decalMaterial.needsUpdate = true;
    meshParam.uploadImage = false;
    meshParam.slide = "mouse";
    meshParam.rotationEnable = false;
    mouseHelper.visible = true;
    mouseHelper.position.set(mouse.x, mouse.y, mouse.z);
    mouseHelper.scale.set(meshParam.scale, meshParam.scale * imageScale, 0.01);
    mouseHelper.rotation.set(0, 0, 0);
    mouseHelper.properties.scale = mouseHelper.scale;
    mouseHelper.properties.imageScale = imageScale;
    mouseHelper.properties.imagesrc = image.src;
    mouseHelper.properties.uuid = imageUUID;
    mouseHelper.properties.lock = false;
    mouseHelper.properties.rotation = null;
    meshParam.isNew = true;
    let scaleN = new THREE.Vector3(
      meshParam.scale,
      meshParam.scale * imageScale,
      meshParam.scale
    );
    let boundingSize = decalMesh[0].boundingSize;
    mouseHelper.position.set(mouse.x, mouse.y, boundingSize.z / 2);
    decalPlace(
      decalMesh[0],
      mouseHelper.position.clone(),
      mouseHelper.rotation.clone(),
      scaleN.clone(),
      mouseHelper
    );
    mouseHelper.visible = false;
    meshParam.uploadImage = false;
    selectDecalThumbActive();
    addPrintSizeText();
  };

  // I believe .src needs to be assigned after .onload has been declared
  image.src = file;
}

function updateTextDecals(Mapid, parentId) {
  let decalMapDetails = decalTextMap.get(Mapid);
  let text = document.getElementById("TextInput_" + parentId).value;
  let fontFamily = document.getElementById(
    "ChooseFontFamily_" + parentId
  ).value;
  let color = "#000000";
  let size = parseFloat(
    document.getElementById("ChooseFontSize_" + parentId).value
  );
  // let size = parseFloat(this.value);
  let selectedTextDecals = decals.filter(
    (value) => value.uuid === decalMapDetails.decalid
  );
  // let text = selectedTextDecals[0].properties.text;
  // let color = selectedTextDecals[0].properties.color;
  // let fontFamily = selectedTextDecals[0].properties.fontFamily;
  let texture = gettextTexture(text, size, color, fontFamily);
  let scaleV = texture.height / texture.width;
  let position = selectedTextDecals[0].properties.position.clone();
  let rot = selectedTextDecals[0].properties.orientation.clone();
  let imageUUID = selectedTextDecals[0].properties.uuid;

  if (selectedTextDecals[0].properties.rotation) {
    rot.set(rot.x, rot.y, selectedTextDecals[0].properties.rotation);
  }
  meshParam.isNew = false;

  removeDecals(selectedTextDecals[0].uuid);
  let sizeP = new THREE.Vector3(texture.width, texture.height, texture.width);
  sizeP.multiplyScalar(fontScaleGlobal);

  let properties = {
    name: "Text",
    text,
    fontSize: size,
    color,
    fontFamily: texture.fontFamily,
    scale: sizeP,
    position: position,
    orientation: rot,
    texture: texture,
    rotation: selectedTextDecals[0].properties.rotation,
    uuid: imageUUID,
    lock: selectedTextDecals[0].properties.lock,
  };

  let options = {
    name: "Text",
    properties: properties,
    texture: texture,
  };

  texture.redraw();
  decalPlace(decalMesh[0], position.clone(), rot, sizeP.clone(), options);
  texture.redraw();
}

// loadLayersUI();
loadSettingsUI();

function loadLayersUI() {
  removeControlsDecals();
}

function loadSettingsUI() {
  let decalImage = decals.filter((value) => value.type === "image");
  // var html = settingsTemplate({
  //   background: bg,
  //   colors: tshirtsColors,
  //   rotation: meshParam.rotationEnable,
  //   scale: meshParam.scale / 10,
  //   serverurl: serverurl,
  //   rot: 0,
  //   models: modelsArray,
  //   selectmodel: selectedModel.id,
  //   images: decalImage,
  // });
  // settingLayoutUI.innerHTML = html;
  screenshotClick();
  uploadDesignBtnClick();
  rotationEnableClick();
  colorPickerClick();
  backgroundClickFunction();
  activeBG();
  RotationCheckBoxChange();
  ScaleClickChangeEvent();
  selectDecalThumbActive();
  decalRemoveBtnclick();
  addPrintSizeText();
  modelSelectionEnable();
  modelSellectionActive();
  loadLayersUI();
  // removeControlsDecals();
  TextAddToSceneList();
  TextBoxEnterClick();
  TextRemoveButtonAction();
  selectTextDecals();
}

function TextRemoveButtonAction() {
  Array.from(document.querySelectorAll(".textrotatebtn")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("click", function () {});
    e.addEventListener("click", (e) => {
      // let flags = e.target.getAttribute("data-flags");
      let parentid = e.target.getAttribute("data-id");
      if (parentid) {
        let mapid = document.getElementById("TextB" + parentid).value;
        decalRotationFunction(mapid, "text");
      }
    });
  });
  Array.from(document.querySelectorAll(".removeTextDesignbtn")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("click", function () {});
    e.addEventListener("click", (e) => {
      let flags = e.target.getAttribute("data-flags");
      let parentid = e.target.getAttribute("data-id");
      let mapidele = document.getElementById("TextB" + parentid);
      if (mapidele) {
        let mapid = mapidele.value;
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            if (flags == "yes") {
              if (decalTextMap.get(mapid)) {
                decalRemoveFunction(mapid, "text");
              }

              document.getElementById(parentid).remove();
              selectTextDecals();
            } else {
              if (decalTextMap.get(mapid)) {
                decalRemoveFunction(mapid, "text");
              }

              document.getElementById("TextB" + parentid).value = "";
              document.getElementById("TextInput_" + parentid).value = "";
              selectTextDecals();
            }
          }
        });
      } else {
        document.getElementById(parentid).remove();
        selectTextDecals();
      }
    });
  });
  Array.from(document.querySelectorAll(".ChooseFontSize")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("change", function () {});
    e.addEventListener("change", (e) => {
      // let flags = e.target.getAttribute("data-flags");
      let parentid = e.target.getAttribute("data-id");
      let mapid = document.getElementById("TextB" + parentid).value;
      updateTextDecals(mapid, parentid);
    });
  });
  Array.from(document.querySelectorAll(".ChooseFontFamily")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("change", function () {});
    e.addEventListener("change", (e) => {
      let parentid = e.target.getAttribute("data-id");
      let mapid = document.getElementById("TextB" + parentid).value;
      updateTextDecals(mapid, parentid);
    });
  });
}

function TextAddToSceneList() {
  Array.from(document.querySelectorAll(".addTextBtn")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("click", function () {});
    e.addEventListener("click", (e) => {
      let Uid = Date.now();
      // var html = TextListTemplate({
      //   id: Uid,
      //   text: "",
      //   add: false,
      //   flags: "yes",
      // });
      const nodeUl = document.createElement("ul");
      nodeUl.classList.add("textlayoutul");
      nodeUl.id = Uid;
      // nodeUl.innerHTML = html;
      let TextListLayout = document.getElementById("TextListLayout");
      TextListLayout.appendChild(nodeUl);
      TextRemoveButtonAction();
      TextBoxEnterClick();
    });
  });
}

function TextBoxEnterClick() {
  Array.from(document.querySelectorAll(".textInput")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("keydown", function () {});
    e.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // console.log("Enter");
        let parentId = e.target.getAttribute("data-id");
        let text = e.target.value;
        let fontFamily = document.getElementById(
          "ChooseFontFamily_" + parentId
        ).value;
        let fontColor = "#000000";
        let size = parseFloat(
          document.getElementById("ChooseFontSize_" + parentId).value
        );
        let Uid = "TextB" + parentId;
        let decalMapEle = document.getElementById(Uid);
        if (!decalMapEle) {
          uploadText(text, size, fontColor, fontFamily, parentId);
        } else {
          let mapid = decalMapEle.value;
          updateTextDecals(mapid, parentId);
        }
      }
    });
  });
}

function modelSellectionActive() {
  let modelSelection = document.getElementById("modelSelection");
  // modelSelection.options[selectedModel.id].setAttribute("selected", "true");
  modelSelection.value = selectedModel.id;
}

function modelSelectionEnable() {
  Array.from(document.querySelectorAll("#modelSelection")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.

    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("change", function () {});
    e.addEventListener("change", (e) => {
      let Did = e.target.value;
      let modelselect = modelsArray.filter((x) => x.id === Did);
      selectedModel = modelselect[0];
      decalMesh.length = 0;
      if (mesh) {
        scene.remove(mesh);
      }
      mesh = null;
      // removeAllDecals();
      selectedDecalImg = null;
      selectDecalThumbActive();
      addPrintSizeText();
      loadGlbModelUrl(selectedModel.url);
    });
  });
}

function decalRemoveBtnclick() {
  Array.from(document.querySelectorAll(".removeDesignbtn")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.

    e.onclick = ""; // this is to avoid an event call.
    e.removeEventListener("click", function () {});
    e.addEventListener("click", (e) => {
      if (decals.length > 0) {
        let decalimageinput = document.querySelector(
          ".decalimageinput:checked"
        );
        if (decalimageinput) {
          Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
          }).then((result) => {
            if (result.isConfirmed) {
              decalRemoveFunction(decalimageinput.value, "image");
            }
          });
        } else {
          Swal.fire({
            title: "Please select image",
            text: "Please select image",
            icon: "warning",
          });
        }
      }
    });
  });
}

function selectTextDecals() {
  let TextListLayout = document.getElementById("TextListLayout");
  TextListLayout.innerHTML = "";
  if (decalTextMap.size > 0) {
    let i = 0;
    let add = false;
    let flags = "no";
    decalTextMap.forEach((value, key) => {
      if (i == 0) {
        add = true;
        flags = "yes";
      } else {
        add = false;
        flags = "no";
      }
      let decalProperties = decals.filter(
        (value1) => value1.uuid === value.decalid
      );

      let properties = decalProperties[0].properties;
      let Uid = Date.now();
      // var html = TextListTemplate({
      //   id: key,
      //   text: properties.text,
      //   add: add,
      //   flags: flags,
      // });
      const nodeUl = document.createElement("ul");
      nodeUl.classList.add("textlayoutul");
      nodeUl.id = key;
      // nodeUl.innerHTML = html;

      TextListLayout.appendChild(nodeUl);
      // appendHiddenFields(key, key);
      Uid = "TextB" + key;

      const nodeUl1 = document.createElement("input");
      nodeUl1.type = "hidden";
      nodeUl1.classList.add("textDecalMap");
      nodeUl1.id = Uid;
      nodeUl1.value = key;
      document.getElementById(key).appendChild(nodeUl1);

      document.getElementById("ChooseFontSize_" + key).value =
        properties.fontSize;

      document.getElementById("ChooseFontFamily_" + key).value =
        properties.fontFamily;

      i++;
    });
  } else {
    let Uid = Date.now();
    // var html = TextListTemplate({
    //   id: Uid,
    //   text: "",
    //   add: true,
    //   flags: "yes",
    // });
    const nodeUl = document.createElement("ul");
    nodeUl.classList.add("textlayoutul");
    nodeUl.id = Uid;
    // nodeUl.innerHTML = html;
    let TextListLayout = document.getElementById("TextListLayout");
    TextListLayout.appendChild(nodeUl);
    // TextRemoveButtonAction();
    // TextBoxEnterClick();
    // TextAddToSceneList();
  }
  TextRemoveButtonAction();
  TextBoxEnterClick();
  TextAddToSceneList();
}

function selectDecalThumbActive() {
  const decalThumbList = document.querySelector("#previewimagelist");
  if (decalImageMap.size > 0) {
    decalThumbList.innerHTML = "";
    let i = 0;
    let selected;
    decalImageMap.forEach((value, key) => {
      selected = false;
      if (i == 0) {
        selected = true;
      }
      let decalSp = decals.filter((value1) => value1.uuid === value.decalid);

      let properties = decalSp[0].properties;

      var li = document.createElement("li");

      var inputele = document.createElement("input");
      inputele.type = "radio";
      inputele.name = "decalimage";
      inputele.value = key;
      inputele.classList.add("decalimageinput");
      if (selected) {
        inputele.setAttribute("checked", "true");
      }

      li.appendChild(inputele);
      var imageEle = document.createElement("img");
      imageEle.src = value.src;

      li.appendChild(imageEle);
      let lockSpanEle = document.createElement("span");
      lockSpanEle.classList.add("locksettingLayout");
      let lockEle = document.createElement("img");
      lockEle.src = properties.lock ? lockImg : unlockImg;
      lockEle.classList.add("locksettings");
      lockSpanEle.appendChild(lockEle);
      lockSpanEle.setAttribute("data-uuid", value.decalid);
      lockSpanEle.setAttribute("data-id", key);
      li.appendChild(lockSpanEle);

      li.setAttribute("data-uuid", value.decalid);
      li.setAttribute("data-id", key);
      // li.innerHTML = "text"; // assigning text to li using array value.
      li.setAttribute("style", "display: block;"); // remove the bullets.

      lockSpanEle.addEventListener("click", function (e) {
        const parentElement = e.target.parentElement;
        let decalid = parentElement.getAttribute("data-uuid");
        let imageid = parentElement.getAttribute("data-id");
        let decalMapDetails = decalImageMap.get(imageid);
        let decalM = decals.filter(
          (value) => value.uuid === decalMapDetails.decalid
        );

        if (decalM.length > 0) {
          decalM[0].properties.lock = decalM[0].properties.lock ? false : true;
          selectDecalThumbActive();
        }
      });

      inputele.addEventListener("click", function (e) {
        const parentElement = e.target.parentElement;

        let decalid = parentElement.getAttribute("data-uuid");
        let imageid = parentElement.getAttribute("data-id");
        let decalMapDetails = decalImageMap.get(imageid);
        let decalM = decals.filter(
          (value) => value.uuid === decalMapDetails.decalid
        );
        if (decalM.length > 0) {
          decalM[0].renderOrder = 10;
        } else {
          let decalSR = decals.filter(
            (value) => value.uuid !== decalMapDetails.decalid
          );
          decalSR.forEach((value) => {
            value.renderOrder = 1;
          });
        }
        addPrintSizeText();
        document.querySelectorAll("#previewimagelist");
        // camera.lookAt(decalS[0].properties.position.clone());
        // camera.rotation.copy(decalS[0].properties.orientation.clone());
        removeControlsDecals();
      });

      decalThumbList.appendChild(li); // append li to ul.
      i++;
    });
    removeControlsDecals();
    // for (let i = 0; i <= decalImageMap.size - 1; i++) {

    // }
  } else {
    // decalThumb.setAttribute("src", "");
    decalThumbList.innerHTML = "";
    removeControlsDecals();
  }
}

function removeControlsDecals() {
  let decalimageinput = document.querySelector(".decalimageinput:checked");

  if (decalimageinput) {
    if (decalimageinput.value) {
      Array.from(document.querySelectorAll(".decalshow")).forEach((e) => {
        e.classList.add("visible");
      });
    } else {
      Array.from(document.querySelectorAll(".decalshow")).forEach((e) => {
        e.classList.remove("visible");
      });
    }
  } else {
    Array.from(document.querySelectorAll(".decalshow")).forEach((e) => {
      e.classList.remove("visible");
    });
  }
}

function addPrintSizeText() {
  let printSizeTxtEle = document.querySelector("#printSizeTxt");
  if (decals.length > 0) {
    let decalimageinput = document.querySelector(".decalimageinput:checked");
    if (decalimageinput) {
      decalimageinput = decalimageinput.value;
      let decalMapDetails = decalImageMap.get(decalimageinput);
      let decalM = decals.filter(
        (value) => value.uuid === decalMapDetails.decalid
      );
      let selectedD = decalM[0];

      if (selectedD) {
        let widthP = Math.round(selectedD.properties.scale.x);
        let heightP = Math.round(selectedD.properties.scale.y);
        printSizeTxt =
          "Print size : " + widthP + " cm (L) x " + heightP + " cm (H)";
        // console.log(printSizeTxt);
        printSizeTxtEle.innerHTML = printSizeTxt;
      } else {
        printSizeTxtEle.innerHTML = "";
        removeControlsDecals();
      }
    }
  } else {
    printSizeTxtEle.innerHTML = "";
    removeControlsDecals();
  }
}

function decalRemoveFunction(decalimageinput, maptype) {
  let decalMapDetails = decalImageMap.get(decalimageinput);
  if (maptype == "text") {
    decalMapDetails = decalTextMap.get(decalimageinput);
  }
  let decalM = decals.filter((value) => value.uuid === decalMapDetails.decalid);
  let selectedDecalMesh = decalM[0];
  if (selectedDecalMesh) {
    removeDecals(selectedDecalMesh.uuid);
    mouseHelper.visible = false;

    meshParam.rotationEnable = true;
    // objectControls.enableHorizontalRotation();
    selectedDecalImg = null;
    // RotationCheckBoxChange();
    decalImageMap.delete(decalimageinput);
    decalTextMap.delete(decalimageinput);
    selectDecalThumbActive();
    printSizeTxt = "";
    addPrintSizeText();
    Swal.fire({
      title: "Removed!",
      text: "Your design has been removed.",
      icon: "success",
    });
  }
}

function decalScaleFunction(decalimageinput, scaletype, maptype) {
  let decalMapDetails = decalImageMap.get(decalimageinput);
  if (maptype == "text") {
    decalMapDetails = decalTextMap.get(decalimageinput);
  }
  let decalM = decals.filter((value) => value.uuid === decalMapDetails.decalid);
  let selectedDecalMesh = decalM[0];
  if (selectedDecalMesh) {
    // console.log(selectedDecalMesh);
    selectedDecalMesh.visible = true;
    let sScale = selectedDecalMesh.properties.scale.clone();
    mouseHelper.pid = selectedDecalMesh.uuid;
    mouseHelper.position.copy(selectedDecalMesh.properties.position);
    // console.log(selectedDecalMesh.properties.position);
    mouseHelper.rotation.set(
      selectedDecalMesh.properties.orientation.x,
      selectedDecalMesh.properties.orientation.y,
      selectedDecalMesh.properties.rotation
        ? selectedDecalMesh.properties.rotation
        : 0
    );
    mouseHelper.properties = selectedDecalMesh.properties;
    mouseHelper.texture = selectedDecalMesh.texture;
    mouseHelper.properties.scale = selectedDecalMesh.properties.scale.clone();
    mouseHelper.properties.rotation = selectedDecalMesh.properties.rotation
      ? selectedDecalMesh.properties.rotation
      : null;
    mouseHelper.material.map = selectedDecalMesh.texture;
    mouseHelper.material.needsUpdate = true;
    mouseHelper.name = selectedDecalMesh.name;

    if (selectedDecalMesh.name == "Text") {
      selectedDecalMesh.texture.redraw();
    }
    mouseHelper.scale.set(sScale.x, sScale.y, 0.1);

    // meshParam.rotationEnable = false;
    meshParam.uploadImage = false;
    meshParam.slide = "mouse";
    mouseHelper.visible = true;
    meshParam.rotationEnable = false;

    let scaleV = selectedDecalMesh.properties.scale.x;
    let imageS = selectedDecalMesh.properties.imageScale;
    let scale = 1;
    if (scaletype == "up") {
      scaleV = scaleV + scale;
    } else {
      scaleV = scaleV - scale;
    }

    mouseHelper.scale.set(scaleV, scaleV * imageS, 0.1);
    mouseHelper.properties.scale = mouseHelper.scale.clone();
    let lScaleV = new THREE.Vector3(scaleV, scaleV * imageS, scaleV);
    // selectedDecalMesh.scale.copy(lScaleV);
    meshParam.scale = scaleV;
    // let gem = new DecalGeometry(
    //   decalMesh[0],
    //   selectedDecalMesh.properties.position.clone(),
    //   selectedDecalMesh.properties.orientation.clone(),
    //   lScaleV.clone()
    // );
    removeDecals(selectedDecalMesh.uuid);
    // selectedDecalMesh.geometry.dispose();
    // selectedDecalMesh.geometry = gem;
    // selectedDecalMesh.geometry.neesdUpdate = true;
    // console.log(selectedDecalMesh.properties.position.clone());
    decalPlace(
      decalMesh[0],
      selectedDecalMesh.properties.position.clone(),
      selectedDecalMesh.properties.orientation.clone(),
      lScaleV.clone(),
      mouseHelper
    );
    mouseHelper.visible = false;
    addPrintSizeText();
  }
}

function decalRotationFunction(decalimageinput, maptype) {
  let decalMapDetails = decalImageMap.get(decalimageinput);
  if (maptype == "text") {
    decalMapDetails = decalTextMap.get(decalimageinput);
  }
  let decalM = decals.filter((value) => value.uuid === decalMapDetails.decalid);
  let selectedDecalMesh = decalM[0];
  if (selectedDecalMesh) {
    selectedDecalMesh.visible = false;
    let sScale = selectedDecalMesh.properties.scale.clone();
    mouseHelper.pid = selectedDecalMesh.uuid;
    mouseHelper.position.copy(selectedDecalMesh.properties.position);
    // mouseHelper.rotation.set(
    //   selectedDecalMesh.properties.orientation.x,
    //   selectedDecalMesh.properties.orientation.y,
    //   selectedDecalMesh.properties.orientation.z
    // );
    mouseHelper.properties = selectedDecalMesh.properties;
    mouseHelper.texture = selectedDecalMesh.texture;
    mouseHelper.properties.scale = selectedDecalMesh.properties.scale.clone();
    mouseHelper.properties.rotation = selectedDecalMesh.properties.rotation
      ? selectedDecalMesh.properties.rotation
      : null;
    mouseHelper.material.map = selectedDecalMesh.texture;
    mouseHelper.material.needsUpdate = true;
    mouseHelper.name = selectedDecalMesh.name;

    if (selectedDecalMesh.name == "Text") {
      selectedDecalMesh.texture.redraw();
    }
    mouseHelper.scale.set(sScale.x, sScale.y, 0.1);

    // meshParam.rotationEnable = false;
    meshParam.uploadImage = false;
    meshParam.slide = "mouse";
    mouseHelper.visible = true;
    meshParam.rotationEnable = false;

    mouseHelper.rotateZ(-rotationStep);
    mouseHelper.properties.orientation = mouseHelper.rotation;
    mouseHelper.properties.rotation = mouseHelper.rotation.z;
    // console.log(mouseHelper.rotation.z);
    removeDecals(selectedDecalMesh.uuid);
    decalPlace(
      decalMesh[0],
      mouseHelper.properties.position.clone(),
      mouseHelper.properties.orientation.clone(),
      sScale.clone(),
      mouseHelper
    );
    mouseHelper.visible = false;
  }
}

function RotationCheckBoxChange() {
  Array.from(document.querySelectorAll(".rotatebtn")).forEach((e) => {
    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("click", (e) => {
      if (decals.length > 0) {
        let decalimageinput = document.querySelector(
          ".decalimageinput:checked"
        ).value;
        decalRotationFunction(decalimageinput, "image");
      }
    });
  });
}

function ScaleClickChangeEvent() {
  Array.from(document.querySelectorAll(".scalebtn")).forEach((e) => {
    // let scaletype = e.getAttribute("data-type");
    // e.dataset.scaletype = e.getAttribute("data-type");
    // console.log(e.getAttribute("data-type"));
    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("click", (e) => {
      let scaletype = e.target.getAttribute("data-type");
      // console.log(scaletype);
      if (decals.length > 0) {
        let decalimageinput = document.querySelector(
          ".decalimageinput:checked"
        ).value;
        // console.log("scaletype:", decalimageinput);
        decalScaleFunction(decalimageinput, scaletype, "image");
      }
    });
  });
}

function colorPickerClick() {
  Array.from(document.querySelectorAll(".colorclick")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.
    e.dataset.Did = e.getAttribute("data-id"); // gets the attribute value.

    e.dataset.Dcolor = e.getAttribute("data-color");
    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("click", function () {
      document.querySelector(".colorclick.active")
        ? document
            .querySelector(".colorclick.active")
            .classList.remove("active")
        : "";
      // let INITIAL_MTL1 = new THREE.MeshPhongMaterial( { color: new THREE.Color('#'+Math.floor(Math.random()*16777215).toString(16)), shininess: 10 } );
      this.classList.add("active");
      let Did = this.dataset.Did;
      let Dcolor = this.dataset.Dcolor;
      let bgselect = tshirtsColors.filter((x) => x.value === Did);
      selectedColor = bgselect[0];

      mesh.traverse((object) => {
        if (object.isMesh) {
          if (selectedModel.type) {
            if (selectedModel.material.includes(object.name)) {
              object.material.color = new THREE.Color(
                "#" + selectedColor.value
              );
              object.material.side = 2;
              object.material.needsUpdate = true;
              object.castShadow = true;
            }
          } else {
            object.material.color = new THREE.Color("#" + selectedColor.value);
            object.material.side = 2;
            object.material.needsUpdate = true;
            object.castShadow = true;
          }
        }
      });

      // mesh.material.color = new THREE.Color("#" + selectedColor.value);
      // mesh.material.needsUpdate = true;

      tShirtmaterial.map = null;
      tShirtmaterial.color = new THREE.Color("#" + selectedColor.value);
      tShirtmaterial.needsUpdate = true;
      // loadSettingsUI();
    });
  });
}

function rotationEnableClick() {
  // Array.from(document.querySelectorAll("#rotateMesh")).forEach((e) => {
  //   // Add a data-attribute to store the current onclickvalue.
  //   e.onclick = ""; // this is to avoid an event call.
  //   e.addEventListener("click", (e) => {
  //     rotateTshirt();
  //   });
  // });
}

function scaleRandeSlideEvent() {
  Array.from(document.querySelectorAll(".rangeslider")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.

    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("input", (e) => {
      const value = +e.target.value;
      const label = document.querySelector("#Scaletxt");

      label.value = value;
      if (decals.length > 0) {
        removeDecals();
        meshParam.uploadImage = false;
        meshParam.slide = "slide";
        mouseHelper.visible = true;
        let scaleV = mouseHelper.scale.x;
        scaleV = value * 10;
        mouseHelper.scale.set(scaleV, scaleV * imageScale, 0.1);
        meshParam.scale = scaleV;
        // objectControls.disableHorizontalRotation();
        const myTimeout = setTimeout(shoot, 1000);
      }
    });
  });
}

function uploadDesignBtnClick() {
  let uploadDesignbtn = document.querySelector("#uploadDesignbtn");
  // Add a data-attribute to store the current onclickvalue.

  uploadDesignbtn.onclick = ""; // this is to avoid an event call.
  uploadDesignbtn.removeEventListener("click", function () {});
  uploadDesignbtn.addEventListener(
    "click",
    function () {
      document.getElementById("myInput").click();
    },
    false
  );
  fileupload();
}
function downloadBase64File(contentType, base64Data, fileName) {
  const linkSource = `data:${contentType};base64,${base64Data}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
}
function screenshotClick() {
  Array.from(document.querySelectorAll("#takeScreenshot")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.

    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("click", function () {
      html2canvas(document.querySelector("#previewCanvas")).then(function (
        canvas
      ) {
        document.body.appendChild(canvas);
        var t = canvas.toDataURL().replace("data:image/png;base64,", "");
        downloadBase64File("image/png", t, "image");
      });
      // renderer.render(scene, camera);
      // const dataURL = renderer.domElement.toDataURL("image/png");

      // let a = document.createElement("a"); // Create a temporary anchor.
      // a.href = dataURL;
      // a.download = "screenshot.png";
      // a.click(); // Perform the navigation action to trigger the download.
    });
  });
}

function activeBG() {
  document.querySelector("#" + selectedBg.id).classList.add("active");
  document
    .querySelector("#Colors_" + selectedColor.value)
    .classList.add("active");
}

function loadBGTexture() {
  var image = new Image();

  image.onload = function () {
    scene.background = null;
    var texture = new THREE.TextureLoader().load(image.src);
    texture.repeat.set(1, 1);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // planmaterial.map = texture;
    // planmaterial.needsUpdate = true;
    scene.background = texture;
  };

  // I believe .src needs to be assigned after .onload has been declared
  image.src = selectedBg.url;
}

function backgroundClickFunction() {
  Array.from(document.querySelectorAll(".matclick")).forEach((e) => {
    // Add a data-attribute to store the current onclickvalue.
    e.dataset.Did = e.getAttribute("data-id"); // gets the attribute value.
    e.dataset.Durl = e.getAttribute("data-url");
    e.dataset.Dtype = e.getAttribute("data-type");
    e.dataset.Dcolor = e.getAttribute("data-color");
    e.onclick = ""; // this is to avoid an event call.
    e.addEventListener("click", function () {
      document.querySelector(".matclick.active")
        ? document.querySelector(".matclick.active").classList.remove("active")
        : "";
      // let INITIAL_MTL1 = new THREE.MeshPhongMaterial( { color: new THREE.Color('#'+Math.floor(Math.random()*16777215).toString(16)), shininess: 10 } );
      this.classList.add("active");
      let Did = this.dataset.Did;
      let Durl = this.dataset.Durl;

      let bgselect = bg.filter((x) => x.id === Did);
      selectedBg = bgselect[0];

      backgroundPreview.style.backgroundImage = "url(" + selectedBg.url + ")";
      // loadSettingsUI();
    });
  });
}

/* HDR */
function hdrimapLoader(path) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  let rgbeloader = new RGBELoader(manager);
  console.log('rgbeloader', rgbeloader);
  console.log('path', path);
  
  rgbeloader.load(path, (texture) => {
    // let hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquiRect);
    // pmremGenerator.compileCubemapShader();
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
  });

  // rgbeloader.load(path, (hdrEquiRect, textureData) => {
  //   let hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquiRect);
  //   pmremGenerator.compileCubemapShader();

  //   scene.environment = hdrCubeRenderTarget.texture;
  //   renderer.toneMapping = THREE.ACESFilmicToneMapping;
  //   renderer.toneMappingExposure = 1.8;
  // });
}

function EXRImgLoader(path) {
  new EXRLoader().load(path, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    // exrCubeRenderTarget = pscene.environment = texture;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
  });
}

// EXRImgLoader(serverurl + "hdr/105_hdrmaps_com_free_1K.exr");


hdrimapLoader(serverurl + "hdr/blocky_photo_studio_1k.hdr");


function fileupload() {
  var fileToRead = document.getElementById("myInput");
  fileToRead.removeEventListener("change", function () {});
  fileToRead.addEventListener(
    "change",
    function (event) {
      var files = fileToRead.files;
      if (files.length) {
        var reader = new FileReader();
        reader.onload = function (e) {
          uploadDesign(e.target.result);
          fileToRead.value = null;
        };
        reader.readAsDataURL(files[0]);
      }
    },
    false
  );
}

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  // Call tick again on the next frame

  camera.updateMatrixWorld();
  // csm.update();
  // csmHelper.update();
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
