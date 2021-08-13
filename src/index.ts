import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";
import { ThreeParams } from "./ThreeParams";

window.addEventListener("DOMContentLoaded", () => {
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer();
  // レンダラーのサイズを設定
  renderer.setSize(800, 600);
  // canvasをbodyに追加
  document.body.appendChild(renderer.domElement);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
  console.log("camera", camera);
  camera.position.set(0, 400, 500);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 300, 0);

  // モデルをロード
  const fbxLoader = new FBXLoader();
  fbxLoader.load("./test.fbx", (object) => {
    console.log("object", object);
    object.scale.set(30, 30, 30);
    scene.add(object);
  });

  // 平行光源を生成
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  // ヘルパーを追加
  const AxesHelper = new THREE.AxesHelper(1000);
  AxesHelper.visible = false;
  scene.add(AxesHelper);

  const ThreeParamsStore: ThreeParams = {};

  init("container");
  function init(elementId: string) {
    const container = document.getElementById(elementId);
  }

  function createPanel() {}

  function animate() {
    requestAnimationFrame(animate);
  }

  /*
  // dat.gui
  const gui: GUI = new GUI();

  // ----- camera -----
  const CamaraFolder: GUI = gui.addFolder("Camera");
  CamaraFolder.open();
  // TODO: FOVを追加
  const CameraParams: Object = {
    "position x": camera.position.x,
    "position y": camera.position.y,
    "position z": camera.position.z,
  };
  CamaraFolder.add(CameraParams, "position x", -5000, +5000, 1).onChange(
    setCameraPositionX
  );
  function setCameraPositionX(position: number) {
    camera.position.x = position;
  }

  CamaraFolder.add(CameraParams, "position y", -5000, +5000, 1).onChange(
    setCameraPositionY
  );
  function setCameraPositionY(position: number) {
    camera.position.y = position;
  }
  CamaraFolder.add(CameraParams, "position z", -5000, 5000, 1).onChange(
    setCameraPositionZ
  );
  function setCameraPositionZ(position: number) {
    camera.position.z = position;
  }
  // ----- controls -----
  const ControlFolder = gui.addFolder("Control");
  ControlFolder.open();
  console.log("ThreeParamsStore: ", ThreeParamsStore.Control);
  const ControlParams: Object = {
    "target x": controls.target.x,
    "target y": controls.target.y,
    "target z": controls.target.z,
  };

  // ----- light -----
  const LightFolder: GUI = gui.addFolder("Light");
  const LightFolderParam: Object = {
    Light1: "Hello",
    addLight: "AddLight",
    help: "test",
  };

  LightFolder.add(LightFolderParam, "Light1", "adder");

  // ----- helper -----
  const HelperFolder: GUI = gui.addFolder("Helpers");
  const HelperParams: Object = {
    "show Axes": false,
  };
  HelperFolder.add(HelperParams, "show Axes").onChange(showAxes);
  function showAxes(visiblity: boolean) {
    AxesHelper.visible = visiblity;
  }
  */

  const tick = (): void => {
    requestAnimationFrame(tick);

    // 描画
    renderer.render(scene, camera);
  };
  tick();

  console.log("Hello Three.js");
});
