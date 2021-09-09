# 注意
このリポジトリでは、marmaid.jsを用いて設計図の管理を行います。github上やVScode上での表示を可能にするために以下のextensionや拡張機能をインストールすることを必要とします。ご注意ください。

- VScode
  - [Markdown Preview Marmaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts<br/>prevail...
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```