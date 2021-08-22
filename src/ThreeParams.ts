import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface ThreeParams {
  /**
   * カメラとシーンはレンダリングに必要なため、必ず宣言する.
   */

  /**
   * カメラは単体のみを扱う.
   * 複数扱いたい場合は、Camara[] で宣言すること
   */
  Cameras?: Camera | undefined;
  /**
   * プロトタイプでは, コントローラーの切り替えはサポートしない.
   */
  Control?: Control | undefined;
  Lights?: Light[] | undefined;
  Model?: Model;
}

type Camera = THREE.PerspectiveCamera | THREE.StereoCamera;
type Control = OrbitControls;
type Light = THREE.AmbientLight;
type Model = THREE.Group;
