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
  animation_speed: number;
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

    // animation_speed
    this.animation_speed = 1;

    // dnd
    // fbx is loaded only dnd
    // and load panel
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
      let deltaTime = (t - this.previousRAF) * 0.001 * this.animation_speed;
      if (this.mixer) this.mixer.update(deltaTime);
      if (this.settings) {
        // なぜか動くから修正しないといけない
        const index = this.settings.clips.folder.current_index;
        const clips = this.settings.clips.folder.clips;
        const start = clips[index].start;
        const end = clips[index].end;
        const time = this.actions[0].time;
        if (time < start) this.actions[0].time = start;
        // endを超えたら、リスタートすれば良い
        if (time > end) this.actions[0].time = start;
      }
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
    // clips
    const clips: GUI = this.panel.addFolder("Clips");
    const clip_folder: GUI = clips.addFolder("folder");

    console.log("model: ", this.model);
    console.log("action: ", this.actions[0]);
    // dat.guiが読み込めるのはprimitive型のみ
    // objectを読み込ませるとエラーが出るので要注意
    // three外で利用するデータを保存するオブジェクト
    // 例) 操作関連の関数
    this.settings = {
      camera: {
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
      clips: {
        play: modelPlay.bind(this),
        pause: modelPause.bind(this),
        speed: 1,
        clipstart: 0,
        clipend: this.animations[0].duration,
        addclip: AddClip.bind(this),
        folder: {
          index: ["default", "clip1"],
          current_index: "default",
          clips: {
            default: {
              start: 0,
              end: this.animations[0].duration,
            },
            clip1: {
              start: 0.094,
              end: 0.93,
            },
          },
        },
      },
    };

    // three.jsに関するobjectの再利用する初期値を置いておく
    // propertyはオブジェクト内に関するもの
    const property = {
      camera: {
        position: {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        },
      },
    };
    Object.freeze(property);
    // paramsは操作するための値を提供するためのオブジェクト
    const params = {};

    // params
    // camera
    camera_position
      .add(this.camera.position, "x", -500, 500, 1)
      .onChange((value: number) => {
        this.camera.position.x = value;
        this.camera.lookAt(this.controls.target);
      });
    camera_position
      .add(this.camera.position, "y", -500, 500, 1)
      .onChange((value: number) => {
        this.camera.position.y = value;
        this.camera.lookAt(this.controls.target);
      });
    camera_position
      .add(this.camera.position, "z", -500, 500, 1)
      .onChange((value: number) => {
        this.camera.position.z = value;
        this.camera.lookAt(this.controls.target);
      });
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
    // datGUIは、premitiveな型しか渡せない
    // objectの処理をしたい場合は、プログラム側から参照しないといけない
    clip_folder
      .add(
        this.settings.clips.folder,
        "current_index",
        this.settings.clips.folder.index
      )
      .name("index")
      .onChange((value: any) =>
        console.log(this.settings.clips.folder.clips[value])
      );
    clips
      .add(this.actions[0], "time", 0, this.animations[0].duration, 0.001)
      .listen();
    clips.add(this.settings.clips, "play");
    clips.add(this.settings.clips, "pause");
    // ファイル名を"speed"にするために意図的にpropertyを追加している
    clips
      .add(this.settings.clips, "speed", 0, 2, 0.001)
      .onChange((value: number) => (this.animation_speed = value));
    clips.add(this.settings.clips, "clipstart").step(0.001);
    clips.add(this.settings.clips, "clipend").step(0.001);
    clips.add(this.settings.clips, "addclip");

    // folder status
    // camera
    camera.close();
    camera_position.close();
    camera_move.open();
    // model
    model.close();
    scale.close();
    visible.close();
    // clips
    clips.open();
    clip_folder.open();

    function moveReset(this: any): void {
      this.camera.position.set(
        property.camera.position.x,
        property.camera.position.y,
        property.camera.position.z
      );
      this.camera.lookAt(this.controls.target);
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
    function modelPlay(this: any): void {
      this.actions[0].paused = false;
    }
    function modelPause(this: any): void {
      // clipAction.pausedはbooleanを返す
      // これをtoggleすることによって、pauseを切り替えてる
      this.actions[0].paused = !this.actions[0].paused;
    }
    function AddClip(this: any): void {
      // 新しい値をsettingに追加
      const start = this.settings.clips.clipstart;
      const end = this.settings.clips.clipend;
      const clip = {
        start: start,
        end: end,
      };
      const index = this.settings.clips.folder.index;
      const index_length = this.settings.clips.folder.index.length;
      const clips = this.settings.clips.folder.clips;
      index.push(`clip${index_length}`);
      clips[`clip${index_length}`] = clip;
      // controllerを再作成することによって、擬似的にプロパティを変える
      // controllerの削除
      clip_folder.remove(clip_folder.__controllers[0]);
      // controllerの作成
      clip_folder
        .add(
          this.settings.clips.folder,
          "current_index",
          this.settings.clips.folder.index
        )
        .name("index");
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
