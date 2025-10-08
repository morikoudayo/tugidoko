# FirebaseUserProvider テスト解説

このディレクトリには `FirebaseUserProvider` コンポーネントのテストファイルが含まれています。

## テストファイルの概要

### テスト対象
- `FirebaseUserProvider`: Firebase認証状態を管理するContext Provider
- Firebase認証の初期化、ローディング状態、ユーザー状態の管理をテスト

## テスト構造の詳細解説

### 1. モック設定

#### Chakra UI のモック

**Progress構造の説明**：
- `Progress.Root`: プログレスバー全体のコンテナ
- `Progress.Track`: プログレスバーの背景トラック（灰色の部分）
- `Progress.Range`: 実際の進捗を示すバー（色付きの部分）

**実際の使用例**：
```javascript
// FirebaseUserProvider.tsx での実際の使用
<Progress.Root maxW="240px" value={null}>
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
```

**テストでのモック戦略**：

```javascript
vi.mock('@chakra-ui/react', () => ({
  Progress: {
    Root: () => <div role="progressbar" />,
    Track: () => <div />,
    Range: () => <div />,
  },
}))
```

- `Root`のみ`role="progressbar"`が重要（テストで要素を特定するため）
- `Track`と`Range`は見た目だけの要素なので簡素化
- テストでは「プログレスバーが表示される」ことだけ確認できればよい

**なぜ`Center`要素のモック化が必要なのか**：

1. **FirebaseUserProviderが実際に`Center`を使用している**
```javascript
// src/context/FirebaseUser/FirebaseUserProvider.tsx
if (loading) {
  return (
    <Center h='100vh'>  // ← ここで Center を使用
      <Progress.Root maxW="240px" value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Center>
  )
}
```

2. **`vi.mock`は部分的なモックではなく完全置換**
```javascript
// これは @chakra-ui/react 全体を置き換える
vi.mock('@chakra-ui/react', () => ({
  Progress: { ... }  // Progressだけ定義
}))

// 結果：Center は undefined になる
// FirebaseUserProvider で <Center> を使うとエラー
```

3. **使用されているコンポーネントは全て定義が必要**
```javascript
// 正しいモック：実際に使用されているコンポーネントを全て定義
vi.mock('@chakra-ui/react', () => ({
  Center: ({ children }) => <div>{children}</div>,    // ← 必要！
  Progress: {
    Root: () => <div role="progressbar" />,
    Track: () => <div />,
    Range: () => <div />,
  },
}))
```

4. **部分モックという選択肢もある**
```javascript
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,              // 元のコンポーネントをそのまま使用
    Progress: {             // Progressだけモック
      Root: () => <div role="progressbar" />,
      Track: () => <div />,
      Range: () => <div />,
    },
  }
})
```

**結論**: `vi.mock`は完全置換なので、FirebaseUserProviderで使用される全てのChakra UIコンポーネント（`Center`と`Progress`）をモック化する必要がある。テストの独立性を保つため、外部ライブラリに依存しない完全モックが適切。

#### Firebase 認証のモック
```javascript
vi.mock('@/context/FirebaseUser/firebase', () => ({
  firebaseAuth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
}))
```
- 実際のFirebaseを使わずテスト用の偽物に置き換え
- `onAuthStateChanged`をモック関数（テストごとに置き換えられる関数）に置き換えることで結果を制御できるように。

### 2. テスト用コンポーネント

```javascript
const TestComponent = () => {
  const firebaseUser = useContext(FirebaseUserContext)
  return (
    <div>
      {firebaseUser ? (
        <div data-testid="user-logged-in">User: {firebaseUser.uid}</div>
      ) : (
        <div data-testid="user-logged-out">No user</div>
      )}
    </div>
  )
}
```
- FirebaseUserContextの値を可視化するためのコンポーネント
- `data-testid`属性でテスト時の要素特定を容易にする

## 各テストケースの詳細

### テストケース1: 初期状態でローディング画面を表示

```javascript
mockOnAuthStateChanged.mockImplementation(() => () => {})
```

**なぜこの書き方で認証状態が確定しない状況を模擬できるのか：**

1. `loading`の初期値は`true`
2. `onAuthStateChanged`のコールバックが呼ばれた時だけ`setLoading(false)`が実行される
3. `mockImplementation(() => () => {})`は：
   - `onAuthStateChanged`を呼び出す
   - でもコールバック関数を一度も実行しない
   - アンサブスクライブ用の空関数`() => {}`を返すだけ
4. 結果：`setLoading(false)`が呼ばれず、ローディング画面が表示され続ける

## モック適用のタイミングとインポートの重要性

### 問題：静的インポートとvi.doMockの競合

**間違ったパターン**:
```javascript
// ファイル上部でインポート
import { FirebaseUserProvider } from '@/context/FirebaseUser/FirebaseUserProvider'  // ← この時点で firebase.ts も読み込まれる

describe('FirebaseUserProvider', () => {
  beforeEach(() => {
    vi.doMock('@/context/FirebaseUser/firebase', () => ({...}))  // ← 遅すぎる！
  })
})
```

**問題の流れ**:
1. **ファイル読み込み時**: `FirebaseUserProvider`がインポートされる
2. **その時点で**: 実際の`firebase.ts`モジュールが読み込まれる（モック化されていない）
3. **`beforeEach`実行**: `vi.doMock`を設定（でも既にインポート済みなので無効）
4. **`render`実行**: 実際のFirebaseモジュールが使われる → `unsubscribe is not a function`エラー

### 解決策：動的インポートの使用

**正しいパターン**:
```javascript
// ファイル上部のインポートを削除
// import { FirebaseUserProvider } from '@/context/FirebaseUser/FirebaseUserProvider'  ← 削除

describe('FirebaseUserProvider', () => {
  let FirebaseUserProvider: any

  beforeEach(async () => {
    vi.doMock('@/context/FirebaseUser/firebase', () => ({
      firebaseAuth: {
        onAuthStateChanged: mockOnAuthStateChanged,
      },
    }));
    
    // モック設定後に動的インポート
    ({ FirebaseUserProvider } = await import('@/context/FirebaseUser/FirebaseUserProvider'))
  })

  it('テスト', () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {})
    
    render(
      <FirebaseUserProvider>
        <TestComponent />
      </FirebaseUserProvider>
    )
  })
})
```

**この方法の利点**:
1. **`beforeEach`でモック設定**
2. **その後に`FirebaseUserProvider`をインポート** → モック化された`firebase.ts`が使われる
3. **正しくモックが適用される**
4. **`unsubscribe is not a function`エラーが解決**

### 重要なポイント

- **`vi.doMock`は次回のインポート時に適用される**
- **既にインポート済みのモジュールには適用されない**
- **動的インポートによってモック適用のタイミングを制御できる**
- **`beforeEach`を`async`にすることで`await import()`が使用可能**

この理解により、モジュールモックの適用タイミングを正確に制御でき、テストが正しく動作するようになる。

### テストケース2 & 3: 認証状態変更のテスト

```javascript
mockOnAuthStateChanged.mockImplementation((callback) => {
  setTimeout(() => callback(null), 0)  // or callback(mockUser)
  return () => {}
})
```

**`mockImplementation`の記法解説：**
- `mockOnAuthStateChanged`が呼ばれた時の具体的な動作を定義
- 引数`callback`には`(user) => { setFirebaseUser(user); setLoading(false); }`が渡される
- `setTimeout(() => callback(null), 0)`でログアウト状態を通知するのは、実際のFirebaseが非同期で認証状態を変更する動作を模擬したいから
- `return () => {}`でアンサブスクライブ用の空関数を返す（エラー防止）

### テストケース4: クリーンアップ処理のテスト

```javascript
const mockUnsubscribe = vi.fn()
mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)
const { unmount } = render(...)
unmount()
expect(mockUnsubscribe).toHaveBeenCalled()
```

- メモリリーク防止のためのリスナー解除をテスト
- `unmount()`でコンポーネントをDOMから削除
- アンサブスクライブ関数が正しく呼ばれることを確認

## テスト関数の解説

### `it`関数
- **個別のテストケースを定義する関数**
- 第1引数：テストの説明（文字列）
- 第2引数：テストの内容（関数）
- `test()`と`it()`は同じ機能

### `waitFor`関数
- **非同期でのDOMの変更を待機する関数**
- React の状態更新は非同期なため必要
- 条件が満たされるまで繰り返しチェック
- デフォルトで1秒間待機、タイムアウト機能あり

**なぜ必要？**
```javascript
render(<Component />)  // 初回レンダリング
// 非同期処理...
// 状態更新 → 再レンダリング → DOM更新

await waitFor(() => {
  // DOM更新の完了を待ってからチェック
  expect(screen.getByTestId('user-logged-out')).toBeInTheDocument()
})
```

## まとめ

このテストは以下を包括的に検証：
- 初期ローディング状態の表示
- ログアウト状態の表示
- ログイン状態の表示
- メモリリーク防止のクリーンアップ処理

Firebase認証の状態管理が正しく動作することをモックを使って効率的にテストしている。