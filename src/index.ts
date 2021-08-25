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
  AmbientLights: THREE.AmbientLight[];
  DirectionalLights: THREE.DirectionalLight[];
  clock: THREE.Clock;
  mixer: THREE.AnimationMixer;
  model: THREE.Group;
  skelton: THREE.SkeletonHelper;
  actions: THREE.AnimationAction[];
  loader: FBXLoader;
  // for renderer
  container: any;
  // for dat
  panel: GUI;
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

  animate(): any {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }
      // t の単位はms(example: 現実 0.016s, 出力 16)
      // よって、0.001倍してmsに変換する必要がある
      let deltaTime = (t - this.previousRAF) * 0.001;
      if (this.mixer) this.mixer.update(deltaTime);
      this.animate();
      this.renderer.render(this.scene, this.camera);
      this.previousRAF = t;
    });
  }

  dnd(): void {
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
      // 初期化しないとエラーするから必要
      this.actions = new Array();
      this.actions[0] = this.mixer.clipAction(model.animations[0]);
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

    console.log("model: ", this.model);
    // dat.guiが読み込めるのはprimitive型のみ
    // objectを読み込ませるとエラーが出るので要注意
    const settings = {
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
      },
    };
    console.log("setting: ", settings);

    // params
    // camera
    camera_position
      .add(settings.camera.position, "x", -500, 500, 1)
      .onChange(moveCameraX.bind(this));
    camera_position
      .add(settings.camera.position, "y", -500, 500, 1)
      .onChange(moveCameraY.bind(this));
    camera_position
      .add(settings.camera.position, "z", -500, 500, 1)
      .onChange(moveCameraZ.bind(this))
      .listen();
    camera_move.add(settings.camera.move, "step");
    camera_move.add(settings.camera.move, "reset");
    camera_move.add(settings.camera.move, "forward");
    camera_move.add(settings.camera.move, "backword");
    camera_move.add(settings.camera.move, "up");
    camera_move.add(settings.camera.move, "down");
    camera_move.add(settings.camera.move, "right");
    camera_move.add(settings.camera.move, "left");
    // lights
    // lightsは配列で定義すれば、フォルダの管理はどうにかなる
    // helper

    // model
    scale.add(settings.model.scale, "step");
    scale.add(settings.model.scale, "reset");
    scale.add(settings.model.scale, "up");
    scale.add(settings.model.scale, "down");
    visible
      .add(settings.model.visible, "model")
      .onChange(showModel.bind(this));
    visible
      .add(settings.model.visible, "skelton")
      .onChange(showSkelton.bind(this));

    // folder status
    // camera
    camera.open();
    camera_position.close();
    camera_move.open();
    // model
    model.open();
    scale.open();
    visible.open();

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
        settings.camera.position.x,
        settings.camera.position.y,
        settings.camera.position.z
      );
    }
    function moveForward(this: any): void {
      this.camera.position.z -= settings.camera.move.step;
    }
    function moveBackword(this: any): void {
      this.camera.position.z += settings.camera.move.step;
    }
    function moveUp(this: any): void {
      this.camera.position.y += settings.camera.move.step;
    }
    function moveDown(this: any): void {
      this.camera.position.y -= settings.camera.move.step;
    }
    function moveRight(this: any): void {
      this.camera.position.x += settings.camera.move.step;
    }
    function moveLeft(this: any): void {
      this.camera.position.x -= settings.camera.move.step;
    }

    // model
    function scaleReset(this: any): void {
      this.model.scale.setScalar(1);
      settings.model.scale.curretscale = 1;
    }
    function scaleUp(this: any): void {
      settings.model.scale.curretscale += settings.model.scale.step;
      this.model.scale.setScalar(settings.model.scale.curretscale);
    }
    function scaleDown(this: any): void {
      settings.model.scale.curretscale -= settings.model.scale.step;
      this.model.scale.setScalar(settings.model.scale.curretscale);
    }
    function showModel(this: any, visiblity: boolean): void {
      this.model.visible = visiblity;
    }
    function showSkelton(this: any, visiblity: boolean): void {
      this.skelton.visible = visiblity;
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

function oldinit() {
  // renderer
  const container: any = document.getElementById("container");
  const renderer = new THREE.WebGLRenderer();
  const width = 960;
  const height = 500;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // scene
  const scene = new THREE.Scene();

  // camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(0, 0, 500);
  scene.add(camera);
  // controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // light
  // AmbientLight
  const AmbientLight = new THREE.AmbientLight(0xffffff, 4.0);
  //scene.add(AmbientLight);
  // DirectionalLight
  const DirectionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
  DirectionalLight.position.set(20, 100, 10);
  scene.add(DirectionalLight);

  // model
  const loader = new FBXLoader();
  let mixer: THREE.AnimationMixer;
  let defaultAction: THREE.AnimationAction;
  loader.load("./test.fbx", (model) => {
    console.log("model: ", model);
    model.scale.setScalar(10);
    mixer = new THREE.AnimationMixer(model);
    //console.log("mixer: ", mixer);
    console.log("Animations: ", model.animations);
    defaultAction = mixer.clipAction(model.animations[0]);
    console.log("defaultAction: ", defaultAction);
    defaultAction.play();
    scene.add(model);

    animate();
  });

  const clock = new THREE.Clock();
  function animate() {
    //mixer.update(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // drag and drop
  container.addEventListener("dragover", (e: any) => {
    // デフォルトの挙動を止めないとブラウザの処理が優先されるため必要
    e.preventDefault();
  });
  container.addEventListener("dragenter", (e: any) => {
    // 入ったことを通知するCSSを追加
  });
  container.addEventListener("dragleave", (e: any) => {
    // 出たことを通知するCSSを追加
  });
  container.addEventListener("drop", (e: any) => {
    // ?
    e.stopPropagation();
    e.preventDefault();
    console.log("event: ", e);
    const Uploadedfiles = e.dataTransfer.files;
    const Uploadedfile: any = Uploadedfiles.length === 1 && Uploadedfiles[0];
    console.log("upload file: ", Uploadedfile);
    const UploadedURL = window.URL.createObjectURL(Uploadedfile);
    window.URL.revokeObjectURL(Uploadedfile);
  });
}
