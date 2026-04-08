# ComfortablePandATS
[![License](https://img.shields.io/github/license/comfortable-panda/ComfortablePandATS?color=orange)](https://github.com/comfortable-panda/ComfortablePandATS/blob/master/LICENSE)
[![Release](https://img.shields.io/github/v/release/comfortable-panda/ComfortablePandATS?include_prereleases)](https://github.com/comfortable-panda/ComfortablePandATS/releases)
[![CodeQL](https://github.com/comfortable-panda/ComfortablePandATS/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/comfortable-panda/ComfortablePandATS/actions/workflows/codeql-analysis.yml)  

PandAを快適にするブラウザ拡張機能です．

## Readme
[English](https://github.com/comfortable-panda/ComfortablePandATS/blob/master/README_en.md) | Japanese

## Comfortable Sakai
Comfortable PandAをその他のSakai LMSでも動作するように改良し，Sakai Communityへコントリビュートするプロジェクトです.
京都大学のレポジトリで開発しています．  
[Comfortable-Sakai](https://github.com/kyoto-u/comfortable-sakai)


# ダウンロードリンク
- [Google Chrome](https://chrome.google.com/webstore/detail/comfortable-panda/cecjhdkagakhonnmddjgncmdldmppnoe)
- [Firefox](https://tinaxd.github.io/comfortable-panda-firefox-updates/index.html)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/njbljhcmnodocldppoiejkcmcebpmljc)
- [Safari](https://apps.apple.com/jp/app/comfortable-panda/id1572408187?mt=12)

# 手動でのインストール方法
1. [ここ](https://github.com/comfortable-panda/ComfortablePandATS/releases/tag/v3.5.2) から最新の`Comfortable-PandA.zip`をダウンロードします．
2. `Comfortable-PandA.zip`を展開します． 
3. Chromeで `chrome://extensions/` を開きます.
4. 右上の**デベロッパー　モード**を有効化してください.
5. 左上の**パッケージ化されていない拡張機能を読み込む**ボタンをクリックします.
6. 展開したフォルダーを選択し，インストールします.

# 使い方
1. ダウンロードリンクから，拡張機能をブラウザにインストールします．
1. PandAにログインします．
1. PandAの右上に☰ボタンが追加されていたら導入成功です．

# 機能紹介
## タブの色付け
課題やクイズの締め切り期日に応じて講義タブが色付けされます．
- ![#f03c15](https://via.placeholder.com/15/e85555/000000?text=+)
  締め切り24時間以内
- ![#f03c15](https://via.placeholder.com/15/d7aa57/000000?text=+)
  締め切り5日以内
- ![#f03c15](https://via.placeholder.com/15/62b665/000000?text=+)
  締め切り14日以内

## 新規課題通知
前回アクセス時から新たに追加された課題があった場合，講義タブの左上に赤丸の通知バッジを表示します．
通知バッジが表示されているサイトを開くと通知バッジは消えます．

## miniPandA
右上の☰を押すとminiPandAが開きます.
公開されている課題とクイズの一覧が表示されます．
また，メモ機能を使うことでminiPandA上に課題メモを追加することができます．


## キャッシュ機能
PandAへの負荷を軽減するために課題・クイズ取得にキャッシュ機能を導入しています．
デフォルトのキャッシュ間隔は以下のとおりです．
- 課題取得---2分間
- クイズ取得---10分間  
キャッシュ時間は設定から変更することができます


# Screenshot
![](https://user-images.githubusercontent.com/41512077/140854635-974aee4b-fea3-4051-8956-ac696d1648ec.png)

# 更新履歴
- 2020/05/20 v0.9.0 Prototype release
- 2020/05/21 v1.0.0 一般公開
- 2020/05/22 v1.0.1 小さなバグを修正。
- 2020/05/26 v1.0.2 通知バッジに関するバグを修正。
- 2020/06/10 v1.1.0 全ての課題を表示するサイドメニューを追加。
- 2020/06/11 v1.1.3 小さなバグを修正。
- 2020/06/13 v1.2.0 課題チェックボタンを追加。
- 2020/06/23 v1.3.0 クイズ・試験タブを追加。
- 2020/06/24 v1.3.1 バグを修正。
- 2020/06/30 v1.4.0 カスタムToDo機能を追加。
- 2020/08/16 v1.4.1 冗長な行を削除。
- 2020/08/17 v1.5.0 relax PandA と更新中インジケーターを追加。
- 2020/10/02 v1.5.2 通知バッジがリセットされるバグを修正。
- 2020/10/25 v1.6.0 キャッシュを使用するようになった。
- 2020/10/28 v1.6.1 Storage アクセスを非同期化。
- 2020/12/22 v1.7.0 締め切り順に課題がソートされるようになった。
- 2021/03/28 v2.0.0 Sakai 21 のサポート
- 2021/04/10 v2.1.0 エラー修正。
- 2021/04/13 v3.0.0 Typescript で一から作り直し。
- 2021/04/13 v3.0.4 バグ修正。
- 2021/04/13 v3.1.0 バグ修正。
- 2021/05/05 v3.2.0 SubPandA 実装。
- 2021/05/15 v3.3.0 クイズを取得可能にした。
- 2021/05/16 v3.4.0 設定画面を追加。
- 2021/05/16 v3.4.1 小さなバグを修正。
- 2021/05/16 v3.4.3 小さなバグを修正。
- 2021/05/17 v3.5.0 カラーユニバーサルデザインに対応
- 2021/05/17 v3.5.2 締切が14日以上の課題も色付けするように
- 2021/12/22 v4.0.0 [Comfortable-Sakai](https://github.com/kyoto-u/comfortable-sakai) を移植。
- 2022/3/27 v4.1.0 [Comfortable-Sakai](https://github.com/kyoto-u/comfortable-sakai) の変更分を取り込み。
英語対応、その他内部処理の改善

# コンパイル方法
- 1.初回実行時
```bash
npm install
```
を実行して、依存関係をインストールしてください

- 2.ChromeとFirefox版をまとめてコンパイルする場合
```bash
npm run build:all
```
- 2.Chrome版をコンパイルする場合
```bash
npm run build:chrome
```
- 2.Firefox版をコンパイルする場合
```bash
npm run build:firefox
```
を本レポジトリのルートディレクトリで実行してください

# テスト実行方法
```bash
npm run test
```


# License
Apache-2.0 License


## Manifestについて
- Chromium
- - manifest.json
- Firefox
- - manifest-v2.json
- - manifest-firefox.json