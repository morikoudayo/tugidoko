# AuthProvider テスト解説

このディレクトリには `AuthProvider` コンポーネントのテストファイルが含まれています。

## テストファイルの概要

### テスト対象
- `AuthProvider`: 認証状態とユーザー情報を管理するContext Provider
- ログイン・ログアウト機能、認証情報の永続化をテスト

## モック関数とモジュールモックの詳細解説

### 1. `vi.fn()` - モック関数の作成

**役割**: テスト用の偽物の関数を作成

```javascript
const mockFunction = vi.fn()
```

**基本的な使い方**:
```javascript
// 1. 単純なモック関数
const mockFn = vi.fn()
mockFn('hello')
expect(mockFn).toHaveBeenCalledWith('hello')  // 呼び出されたかチェック

// 2. 戻り値を設定
mockFn.mockReturnValue('test result')
console.log(mockFn())  // 'test result'

// 3. 実装を設定
mockFn.mockImplementation((x) => x * 2)
console.log(mockFn(5))  // 10
```

**AuthProvider.test.tsxでの使用例**:
```javascript
vi.mock('@/context/Auth/localStorage', () => ({
  loadUserCredentials: vi.fn(),     // モック関数を作成
  saveUserCredentials: vi.fn(),     // モック関数を作成  
  clearUserCredentials: vi.fn(),    // モック関数を作成
}))
```

### 2. `vi.mocked()` - TypeScript用のモック関数ヘルパー

**役割**: TypeScript用のモック関数の型安全なヘルパー

```javascript
vi.mocked(loadUserCredentials).mockResolvedValue({ id: '', pass: '' })
```

**これは以下と同じ意味**:
```javascript
loadUserCredentials.mockResolvedValue({ id: '', pass: '' })
```

**なぜ`vi.mocked`が必要？**

1. **TypeScriptの型エラー回避**
```typescript
// エラーが出る可能性
loadUserCredentials.mockResolvedValue(...)  // TypeScriptが「mockResolvedValueなんてないよ」と言う

// 型安全
vi.mocked(loadUserCredentials).mockResolvedValue(...)  // TypeScriptが正しく認識
```

2. **モック関数であることを明示**
```typescript
// この関数がモックされていることが明確
const mockFunction = vi.mocked(originalFunction)
mockFunction.mockReturnValue('test')
```

### 3. `vi.mock` vs `vi.doMock` - モック設定のタイミング

#### `vi.mock` - 静的モック

**実行タイミング**: ファイル読み込み時（最初に実行）

```javascript
// ファイルの冒頭で
vi.mock('@/context/Auth/localStorage', () => ({
  loadUserCredentials: vi.fn(),
  saveUserCredentials: vi.fn(),
}))
```

**特徴**:
- **ホイスティング**される（ファイルの先頭で実行される）
- 全てのテストで同じモックが使われる
- 一度設定すると変更が困難

#### `vi.doMock` - 動的モック

**実行タイミング**: その行が実際に実行された時

```javascript
// beforeEach内で
beforeEach(() => {
  vi.doMock('@/context/FirebaseUser/firebase', () => ({
    firebaseAuth: {
      onAuthStateChanged: mockOnAuthStateChanged,
    },
  }))
})
```

**特徴**:
- **実行時**にモックを設定
- テストごとに異なるモックを設定可能
- 動的に条件によってモックを変更可能

#### 使い分けの基準

- **`vi.mock`**: 全テストで同じモック関数を使い、テスト内で動作を変更
- **`vi.doMock`**: テストごとに全く違うモック関数を設定

**戻り値の複雑さは関係ない**！

### 4. `mockImplementation` vs モック設定の違い

#### `vi.doMock` と `mockImplementation` の役割の違い

**`vi.doMock`**: 「何をモック化するか」を決める（モジュール全体）
```javascript
vi.doMock('@/context/FirebaseUser/firebase', () => ({
  firebaseAuth: {
    onAuthStateChanged: mockOnAuthStateChanged,  // どの関数を使うか
  },
}))
```

**`mockImplementation`**: 「モック化したものがどう動くか」を決める（個別の関数）
```javascript
mockOnAuthStateChanged.mockImplementation((callback) => {
  setTimeout(() => callback(null), 0)  // 具体的な動作
  return () => {}
})
```

## テスト用ラッパーコンポーネント

```javascript
const createWrapper = (firebaseUser: any) => 
  ({ children }: { children: ReactNode }) => (
    <FirebaseUserContext.Provider value={firebaseUser}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseUserContext.Provider>
  )
```

**重要：実際のFirebaseには接続しない**

この`createWrapper`は**実際のFirebaseには一切接続せず**、完全にテスト用の仕組みです：

```javascript
// 実運用時
<FirebaseUserProvider>  // 実際のFirebaseに接続
  <AuthProvider>
    <App />
  </AuthProvider>
</FirebaseUserProvider>

// テスト時
<FirebaseUserContext.Provider value={mockUser}>  // 偽のユーザー情報を直接注入
  <AuthProvider>
    <TestComponent />
  </AuthProvider>
</FirebaseUserContext.Provider>
```

**動作原理**:
1. `FirebaseUserContext.Provider`に直接モックデータを渡す
2. `AuthProvider`内で`useContext(FirebaseUserContext)`すると、実際のFirebase認証ではなくモックデータが返される
3. Firebase認証プロセスを完全にバイパス

**メリット**:
- テストの独立性（ネットワーク不要）
- 高速実行
- 予測可能な結果（認証状態を自由に制御）

## まとめ

AuthProviderのテストでは以下の技術を活用：

1. **`vi.fn()`**: モック関数の作成
2. **`vi.mocked()`**: TypeScript型安全なモック操作
3. **`vi.mock()`**: 静的なモジュール全体のモック化
4. **動的import**: テスト実行時のモジュール取得
5. **createWrapper**: Firebase認証をバイパスしたContext制御

これらの技術により、外部依存関係を完全に制御し、認証機能の様々なシナリオを効率的にテストしている。