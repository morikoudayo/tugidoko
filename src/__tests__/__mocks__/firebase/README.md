# Firebase モックファイル解説

このディレクトリには Firebase SDK のモックファイルが含まれています。

## `app.ts` - Firebase アプリ初期化のモック

`__mocks__/firebase/app.ts`は**Firebase SDK の`firebase/app`モジュールをモック化**する時に使用されます。

### 使用される場面

#### 1. **Firebase初期化のテスト**

```javascript
// テスト対象のコード
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "real-api-key",
  authDomain: "myapp.firebaseapp.com",
  // ...
}

const app = initializeApp(firebaseConfig)
```

```javascript
// テストコード
vi.mock('firebase/app')  // __mocks__/firebase/app.ts が使われる

// initializeApp は実際のFirebaseではなくモックを返す
expect(initializeApp).toHaveBeenCalledWith(firebaseConfig)
```

#### 2. **Firebase設定の検証**

```javascript
// コンポーネントのテスト
const FirebaseInit = () => {
  const app = initializeApp(config)
  return <div>Firebase initialized: {app.name}</div>
}

// テスト
vi.mock('firebase/app')
render(<FirebaseInit />)
expect(screen.getByText('Firebase initialized: [DEFAULT]')).toBeInTheDocument()
```

#### 3. **統合テストでのFirebase初期化モック**

```javascript
// アプリ全体のテスト
vi.mock('firebase/app')  
vi.mock('firebase/auth')
vi.mock('firebase/firestore')

// 実際のFirebaseサービスに接続せずにアプリをテスト
render(<App />)
```

## 現在のプロジェクトでは**使用されていない理由**

### 1. **Firebase初期化を直接テストしていない**
- `initializeApp`自体をテストする必要がない
- 既に初期化されたFirebaseサービスのみをモック

### 2. **Context レベルでのモック**
```javascript
// このプロジェクトのアプローチ
// Firebase の結果（認証状態）だけをモック
<FirebaseUserContext.Provider value={mockUser}>
```

### 3. **高レベルなテスト戦略**
- Firebase初期化の詳細より、認証状態の管理をテスト
- 実装の詳細ではなく、ユーザーから見た挙動をテスト

## 使用例（もし必要なら）

```javascript
// Firebase初期化のテストが必要な場合
import { initializeApp } from 'firebase/app'

vi.mock('firebase/app')

it('Firebase app を正しい設定で初期化する', () => {
  const config = { apiKey: 'test', projectId: 'test' }
  const app = initializeApp(config)
  
  expect(initializeApp).toHaveBeenCalledWith(config)
  expect(app.name).toBe('[DEFAULT]')
})
```

## まとめ

`__mocks__/firebase/app.ts`は：
- **Firebase SDK の初期化をモック化**する時に使用
- **現在のプロジェクトでは不要**（高レベルなテスト戦略のため）
- **もし削除しても問題ない**未使用ファイル

このプロジェクトは「Firebase初期化の詳細」ではなく「認証状態の管理」に焦点を当てたテスト戦略を採用しているということです。