# Rendererについて
このレンダラーはアップローダーでもあります。ドラッグ&ドロップで3Dモデルをアップロードした際は、objectURLを生成します。複数回のアップロードには要対応

# フローチャート

```mermaid
flowchart LR
<<<<<<< HEAD
    id10{対象のCanvasのidが決まっているか?}
    id11[指定のidのCanvasに対して描画される]
    id20{idがfbxerというCanvasを用意しているか?}
    id21[描画中止]
    id10 --> |Yes| id11
    id10 --> |No| id20
    id20 --> |No| id21
    id20 --> |Yes| id11
=======
    id1[init]
    id2[animate]
    id1 --> |canvasの初期化| id3{3DモデルのURLがある}
    id3 --> |Yes| id41[URLから3Dモデルを取得] --> id2
    id3 --> |No| id42[アップローダーよりURLを作成] --> id2
>>>>>>> 788f84cb1f464c3f7d93e1c376519ff9f82864b6
```

# クラス図

canvas 関連のクラス図。この図を見れば、変数などの流れがわかるはず

```mermaid
classDiagram
class Root{
<<<<<<< HEAD
  -THREE Clock
  -init()
}

class ThreeParamStore{
  <<interface>>
  THREE¥.Clock Clock
}
=======
  -String hello
  -init()
}
>>>>>>> 788f84cb1f464c3f7d93e1c376519ff9f82864b6
```