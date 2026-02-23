# import and export
ImportDeclaration
import { foo } from 'foo'; （importSpecifier）
import  foo from 'foo'; (importDefaultSpecifier)
import * as foo from 'foo'; (importNamespaceSpecifier)

```js
interface ImportDeclaration {
  type: "ImportDeclaration";
  specifiers: ImportSpecifier[] | ImportDefaultSpecifier[] | ImportNamespaceSpecifier[];
  source: Literal;           // 模块源路径
  withClause?: ImportAttribute[] | null;  // 实验性：with 子句
}
```
| Specifier 类型 | 对应语法 | AST 字段 |
|---------------|---------|---------|
| `ImportDefaultSpecifier` | `import foo from "./mod"` | `local` |
| `ImportNamespaceSpecifier` | `import * as utils from "./mod"` | `local` |
| `ImportSpecifier` | `import { foo, bar as baz } from "./mod"` | `local`, `imported` |



| 导入类型 | 语法示例 | Specifier 类型 | specifiers 内容 |
|---------|---------|---------------|----------------|
| 默认导入 | `import foo from "./mod"` | `ImportDefaultSpecifier` | 1 个 |
| 命名导入 | `import { foo } from "./mod"` | `ImportSpecifier` | 1+ 个 |
| 命名空间导入 | `import * as foo from "./mod"` | `ImportNamespaceSpecifier` | 1 个 |
| 默认 + 命名 | `import foo, { bar } from "./mod"` | 混合 | 2+ 个 |
| 默认 + 命名空间 | `import foo, * as bar from "./mod"` | 混合 | 2 个 |
| 副作用导入 | `import "./mod"` | 无 | 空数组 `[]` |

## 副作用导入
```js
// ===== counter.js =====
console.log("counter 模块加载了！");  // ← 顶层代码，导入时执行

let count = 0;
export function increment() { count++; }
export function getCount() { return count; }

// ===== main.js =====
import "./counter";        // 副作用导入 - 会打印 "counter 模块加载了！"
import * as c from "./counter";  // 命名空间导入 - 也会打印（但只执行一次）
```
以这个为例，main.js只会打印但是无法调用increment()和getCount()方法但是 命名空间导入是可以调用这些函数。

副作用导入的作用：**仅执行模块的顶层代码**
场景: Polyfill、CSS、全局注册、初始化逻辑
模块会执行几次？	只执行一次（ES 模块单例）
| 问题 | 说明 |
|------|------|
| 模块只执行一次 | 即使多次 `import "./mod"`，模块代码只执行一次（ES 模块单例） |
| 不能访问 export | 无法使用模块导出的任何内容 |
| Tree-shaking 影响 | 副作用导入通常会被 bundler 保留（需配置 `sideEffects`） |
| 顺序敏感 | 多个副作用导入按书写顺序执行 |


# export 
exportAllDeclaration
## exportNamedDeclaration


定义如下：
```js
interface ExportNamedDeclaration {
  type: "ExportNamedDeclaration";
  declaration?: Declaration | null;     // 可选：直接声明并导出（如 export const x = 1）
  specifiers: ExportSpecifier[];        // 导出的标识符列表（如 { a, b as c }）
  source?: Literal | null;              // 模块源路径（仅用于 re-export，如 from './foo'）
  withClause?: ImportAttribute[] | null; // 新增的 with 子句（如 with { type: "json" }）
}
```
直接声明导出
export const x = 1;
导出列表
export { a, b as c}
有source的就是重导出:
export  { a, b as c} from './foo'

> declaration 和 specifiers + source 是互斥的。也就是说：

> 如果有 declaration（比如 export function f() {}），则 specifiers 应为空数组，source 为 null。
> 如果是重导出（re-export），如 export { foo } from './bar'，则 declaration 为 null，而 specifiers 和 source 有值。
## exportDefaultDeclaration
不支持重导出
```js
interface ExportDefaultDeclaration {
  type: "ExportDefaultDeclaration";
  declaration: FunctionDeclaration | ClassDeclaration | Expression;
}
```
export default function foo() {}
export default class Bar {}
export default 42;
export default (x => x * 2);
## exportAllDeclaration
```js
interface ExportAllDeclaration {
  type: "ExportAllDeclaration";
  source: Literal;           // 模块源路径
  exported?: Identifier | null;  // ES2020+：可选的命名空间别名（如 export * as utils）
  withClause?: ImportAttribute[] | null;  // 实验性：with 子句
}
```
> export * 不能 导出默认导出（default export），只能导出命名导出（named exports）。

exportAllDeclaration 和 exportNamedDeclaration (有source的)都有re-export功能,re-export相当于ImportDeclaration。
