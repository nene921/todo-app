# TODO アプリ

シンプルで使いやすいTODO管理アプリケーションです。

## 機能

- ✅ TODOの追加（タイトルと説明）
- ✅ TODOの完了/未完了の切り替え
- ✅ TODOの削除
- ✅ フィルター機能（すべて/未完了/完了済み）
- ✅ SQLiteデータベースで永続化
- ✅ レスポンシブデザイン

## 技術スタック

- **バックエンド**: Flask (Python 3.8+)
- **フロントエンド**: HTML, CSS, JavaScript
- **データベース**: SQLite

## セットアップ

1. 依存関係のインストール:
```bash
pip install -r requirements.txt
```

2. アプリケーションの起動:
```bash
python app.py
```

3. ブラウザでアクセス:
```
http://localhost:5000
```

## プロジェクト構造

```
todo-app/
├── app.py              # Flaskアプリケーション（メインファイル）
├── requirements.txt    # Pythonパッケージ依存関係
├── todos.db           # SQLiteデータベース（自動生成）
├── static/
│   ├── style.css      # スタイルシート
│   └── app.js         # フロントエンドJavaScript
└── templates/
    └── index.html     # HTMLテンプレート
```

## API エンドポイント

- `GET /api/todos` - すべてのTODOを取得
- `POST /api/todos` - 新しいTODOを作成
- `PUT /api/todos/<id>` - TODOを更新
- `DELETE /api/todos/<id>` - TODOを削除

## 使い方

1. **TODOの追加**: タイトル（必須）と説明（オプション）を入力して「追加」ボタンをクリック
2. **完了の切り替え**: チェックボックスをクリックして完了/未完了を切り替え
3. **TODOの削除**: 「削除」ボタンをクリック
4. **フィルタリング**: 「すべて」「未完了」「完了済み」ボタンで表示を切り替え
