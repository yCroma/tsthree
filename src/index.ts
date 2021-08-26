import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GUI } from "dat.gui";

let init = null;
window.addEventListener("DOMContentLoaded", () => {
  init = new UpReFBX();
});

class UpReFBX {
  // property
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  AmbientLights: Array<THREE.AmbientLight>;
  DirectionalLights: Array<THREE.DirectionalLight>;
  clock: THREE.Clock;
  mixer: THREE.AnimationMixer;
  animations: Array<THREE.AnimationClip>;
  model: THREE.Group;
  skelton: THREE.SkeletonHelper;
  actions: Array<THREE.AnimationAction>;
  loader: FBXLoader;
  // for renderer
  container: any;
  // for dat
  panel: GUI;
  settings: Object;
  // for controls
  controls_target: THREE.Vector3;
  // for animate
  previousRAF: any;

  constructor() {
    this.init();
  }

  init(): void {
    // renderer
    this.container = document.getElementById("container");
    this.renderer = new THREE.WebGLRenderer();
    const width: number = 960;
    const height: number = 700;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();

    // camera
    const fov = 60;
    const aspect = width / height;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 30, 40);
    this.scene.add(this.camera);

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls_target = new THREE.Vector3(0, 0, 0);
    this.controls.target.set(
      this.controls_target.x,
      this.controls_target.y,
      this.controls_target.z
    );
    this.controls.update();

    // lights
    // AmbientLight
    this.AmbientLights = new Array();
    this.AmbientLights[0] = new THREE.AmbientLight(0xffffff, 4.0);
    this.scene.add(this.AmbientLights[0]);
    // DirectionalLight
    this.DirectionalLights = new Array();
    this.DirectionalLights[0] = new THREE.DirectionalLight(0xffffff, 2.0);
    this.DirectionalLights[0].position.set(20, 100, 10);
    this.scene.add(this.DirectionalLights[0]);

    // clock
    this.clock = new THREE.Clock();

    // dnd
    // fbx is loaded only dnd
    this.dnd();

    // animate
    this.animate();
  }

  animate(): void {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }
      // t の単位はms(example: 現実 0.016s, 出力 16)
      // よって、0.001倍してmsに変換する必要がある
      let deltaTime = (t - this.previousRAF) * 0.001;
      if (this.mixer) this.mixer.update(deltaTime);
      //if (this.actions) console.log("time: ", this.actions[0]);
      //if (this.animations) console.log(this.animations[0]);
      //if (this.actions) console.log("time: ", this.actions[0].time);
      if (this.panel) this.settings = this.settings;
      //if (this.panel) console.log(this.settings);
      if (this.panel) this.panel.updateDisplay();
      this.animate();
      this.renderer.render(this.scene, this.camera);
      this.previousRAF = t;
    });
  }

  dnd(): void {
    // TODO: 2回目以降のuploadの対策をする
    this.container.addEventListener("dragover", (e: any) => {
      // ブラウザのデフォルトの挙動が優先されるのを回避するために必要
      e.preventDefault();
    });
    this.container.addEventListener("dragenter", (e: any) => {
      // 入ったことを通知するCSSを追加
      console.log("dragenter");
    });
    this.container.addEventListener("dragleave", (e: any) => {
      // 出たことを通知するCSSを追加
      console.log("dragleave");
    });
    this.container.addEventListener("drop", (e: any) => {
      // ブラウザのデフォルトの挙動が優先されるのを回避するために必要
      e.stopPropagation();
      e.preventDefault();
      const files = e.dataTransfer.files;
      const file = files.length === 1 && files[0];
      const url = window.URL.createObjectURL(file);
      // load animation
      this.loadfbx(url);
      // urlを解放する
      window.URL.revokeObjectURL(url);
    });
  }

  loadfbx(url: any) {
    // load
    this.loader = new FBXLoader();
    this.loader.load(url, (model) => {
      this.model = model;
      this.model.visible = true;
      this.skelton = new THREE.SkeletonHelper(model);
      this.skelton.visible = false;
      this.mixer = new THREE.AnimationMixer(model);
      this.animations = this.model.animations;
      // 初期化しないとエラーするから必要
      this.actions = [];
      this.actions[0] = this.mixer.clipAction(this.animations[0]);
      this.actions[0].play();
      this.scene.add(model);
      this.scene.add(this.skelton);
      /**
       * loaderの中でdatを読み込むことによって、
       * modelとmixerもベースオブジェクトとして渡すことができる
       * よって、datは必ずこの位置で読み込まないといけない
       */
      this.dat();
    });
  }

  dat(this: any): any {
    // デフォルトでブラウザの右上に配置する挙動をさせない
    this.panel = new GUI({ autoPlace: false });
    // キャンバスへ追加
    this.container.appendChild(this.panel.domElement);

    // folders
    // camera
    const camera: GUI = this.panel.addFolder("Camera");
    const camera_position: GUI = camera.addFolder("position");
    const camera_move: GUI = camera.addFolder("move");
    // lights
    const lights = this.panel.addFolder("Lights");
    const AmbientLights = lights.addFolder("AmbientLights");
    const DirectionalLights = lights.addFolder("DirectionalLights");
    // model
    const model: GUI = this.panel.addFolder("Model");
    const scale: GUI = model.addFolder("scale");
    const visible: GUI = model.addFolder("visible");
    const controler: GUI = model.addFolder("controler");

    console.log("model: ", this.model);
    console.log("action: ", this.actions[0]);
    // dat.guiが読み込めるのはprimitive型のみ
    // objectを読み込ませるとエラーが出るので要注意
    this.settings = {
      camera: {
        lookAt: {
          x: this.controls.target.x,
          y: this.controls.target.y,
          z: this.controls.target.z,
        },
        position: {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        },
        move: {
          step: 3,
          reset: moveReset.bind(this),
          forward: moveForward.bind(this),
          backword: moveBackword.bind(this),
          up: moveUp.bind(this),
          down: moveDown.bind(this),
          right: moveRight.bind(this),
          left: moveLeft.bind(this),
        },
      },
      model: {
        scale: {
          curretscale: 1,
          step: 1,
          reset: scaleReset.bind(this),
          up: scaleUp.bind(this),
          down: scaleDown.bind(this),
        },
        visible: {
          model: true,
          skelton: false,
        },
        controler: {
          time: this.actions[0].time,
          pause: modelPause.bind(this),
        },
      },
    };

    // params
    // camera
    camera_position
      .add(this.settings.camera.position, "x", -500, 500, 1)
      .onChange(moveCameraX.bind(this));
    camera_position
      .add(this.settings.camera.position, "y", -500, 500, 1)
      .onChange(moveCameraY.bind(this));
    camera_position
      .add(this.settings.camera.position, "z", -500, 500, 1)
      .onChange(moveCameraZ.bind(this))
      .listen();
    camera_move.add(this.settings.camera.move, "step");
    camera_move.add(this.settings.camera.move, "reset");
    camera_move.add(this.settings.camera.move, "forward");
    camera_move.add(this.settings.camera.move, "backword");
    camera_move.add(this.settings.camera.move, "up");
    camera_move.add(this.settings.camera.move, "down");
    camera_move.add(this.settings.camera.move, "right");
    camera_move.add(this.settings.camera.move, "left");
    // lights
    // lightsは配列で定義すれば、フォルダの管理はどうにかなる
    // helper

    // model
    scale.add(this.settings.model.scale, "step");
    scale.add(this.settings.model.scale, "reset");
    scale.add(this.settings.model.scale, "up");
    scale.add(this.settings.model.scale, "down");
    visible
      .add(this.settings.model.visible, "model")
      .onChange(showModel.bind(this));
    visible
      .add(this.settings.model.visible, "skelton")
      .onChange(showSkelton.bind(this));
    controler
      .add(this.actions[0], "time", 0, this.animations[0].duration, 0.001)
      .listen();
    controler.add(this.settings.model.controler, "pause");

    // folder status
    // camera
    camera.close();
    camera_position.close();
    camera_move.open();
    // model
    model.open();
    scale.close();
    visible.close();
    controler.open();

    // moveCamera
    function moveCameraX(this: any, value: number): void {
      this.camera.position.set(
        value,
        this.camera.position.y,
        this.camera.position.z
      );
      this.camera.lookAt(this.controls.target);
    }
    function moveCameraY(this: any, value: number): void {
      this.camera.position.set(
        this.camera.position.x,
        value,
        this.camera.position.z
      );
      this.camera.lookAt(this.controls.target);
    }
    function moveCameraZ(this: any, value: number): void {
      this.camera.position.set(
        this.camera.position.x,
        this.camera.position.y,
        value
      );
      this.camera.lookAt(this.controls.target);
    }
    function moveReset(this: any): void {
      this.camera.position.set(
        this.settings.camera.position.x,
        this.settings.camera.position.y,
        this.settings.camera.position.z
      );
    }
    function moveForward(this: any): void {
      this.camera.position.z -= this.settings.camera.move.step;
    }
    function moveBackword(this: any): void {
      this.camera.position.z += this.settings.camera.move.step;
    }
    function moveUp(this: any): void {
      this.camera.position.y += this.settings.camera.move.step;
    }
    function moveDown(this: any): void {
      this.camera.position.y -= this.settings.camera.move.step;
    }
    function moveRight(this: any): void {
      this.camera.position.x += this.settings.camera.move.step;
    }
    function moveLeft(this: any): void {
      this.camera.position.x -= this.settings.camera.move.step;
    }

    // model
    function scaleReset(this: any): void {
      this.model.scale.setScalar(1);
      this.settings.model.scale.curretscale = 1;
    }
    function scaleUp(this: any): void {
      this.settings.model.scale.curretscale += this.settings.model.scale.step;
      this.model.scale.setScalar(this.settings.model.scale.curretscale);
    }
    function scaleDown(this: any): void {
      this.settings.model.scale.curretscale -= this.settings.model.scale.step;
      this.model.scale.setScalar(this.settings.model.scale.curretscale);
    }
    function showModel(this: any, visiblity: boolean): void {
      this.model.visible = visiblity;
    }
    function showSkelton(this: any, visiblity: boolean): void {
      this.skelton.visible = visiblity;
    }
    function modelPause(this: any): void {
      // clipAction.pausedはbooleanを返す
      // これをtoggleすることによって、pauseを切り替えてる
      this.actions[0].paused = !this.actions[0].paused;
    }

    this.style();
  }

  style(): void {
    // panelをabsoluteにするために、containerをrelativeにする
    this.container.style.position = "relative";
    // contaierに対し、絶対値で配置
    this.panel.domElement.style.position = "absolute";
    this.panel.domElement.style.top = "2px";
    this.panel.domElement.style.right = "2px";
  }
}
