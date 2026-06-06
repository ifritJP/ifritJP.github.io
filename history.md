# 作業記録

## 2026-05-14

- 日時(ローカル): 2026-05-14 19:33:00+09:00
- 種別: 運用 / 操作
- 目的: 直近のコミットを取り消して状態を戻すため。
- 作業内容: `git reset --soft HEAD~1` を実行して、修正内容は維持したまま最新のコミット (`0a263c3d`) をキャンセル。
- 期待する結果: 直近のコミットが取り消され、ひとつ前のコミット `effc493f` が最新（HEAD）となること。変更内容のファイルはステージングされた状態（または手元）に残ること。
- 作業の結果: コミットが正常に取り消されたことを確認しました。

- 日時(ローカル): 2026-05-14 20:02:36+09:00
- 種別: 改善 (仕様変更)
- 目的: 中途半端に対応しているダークモードを取りやめ、サイト全体をライトモードで統一するため。
- 作業内容: リポジトリ内の CSS や HTML (Hugo のテンプレートなど) から、ダークモードに関連する記述 (`prefers-color-scheme: dark` や `data-theme="dark"`、`.dark` クラスなど) を検索して削除・修正する。
- 期待する結果: OS やブラウザのテーマ設定に関わらず、常にライトモードで表示されるようになること。
- 作業の結果: `blog2/static/css/modern.css` および生成済みの `blog2/public/css/modern.css` から `@media (prefers-color-scheme: dark)` ブロックを削除し、常にライトモードのスタイルが適用されるように修正しました。

## 2026-06-06

- 日時(ローカル): 2026-06-06 18:38:00+09:00
- 種別: 機能追加
- 目的: `shadowing_webui` プロジェクトを GitHub Pages の `study_lang/shadowing_webui` パスで公開するため
- 作業内容: `git submodule add` で `https://github.com/ifritJP/shadowing_webui.git` を `study_lang/shadowing_webui` として追加する
- 期待する結果: `.gitmodules` に submodule 設定が追記され、`study_lang/shadowing_webui/` にリポジトリがクローンされること。push 後に `https://ifritjp.github.io/study_lang/shadowing_webui/` でアクセス可能になること。
- 作業の結果: (作業中)

