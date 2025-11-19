# Naive UI 迁移说明

## 概述

本项目已从 Element Plus 迁移到 Naive UI。

## 更新内容

### 1. 依赖变更

**已移除：**
- `element-plus`
- `@element-plus/icons-vue`

**已添加：**
- `naive-ui` - 主要 UI 组件库
- `@vicons/ionicons5` - 图标库

### 2. 配置文件更新

#### `src/main.ts`
- 移除了 Element Plus 的导入和配置
- 简化了应用初始化流程

#### `src/utils/naive.ts` (新建)
创建了 Naive UI 的 discrete API 工具文件，可以在任何地方使用：
- `message` - 消息提示
- `notification` - 通知
- `dialog` - 对话框
- `loadingBar` - 加载条

### 3. 组件映射

| Element Plus | Naive UI | 说明 |
|-------------|----------|------|
| ElCard | NCard | 卡片组件 |
| ElButton | NButton | 按钮组件 |
| ElTable | NDataTable | 数据表格 |
| ElTag | NTag | 标签组件 |
| ElDialog | NModal | 对话框组件 |
| ElForm | NForm | 表单组件 |
| ElInput | NInput | 输入框组件 |
| ElInputNumber | NInputNumber | 数字输入框 |
| ElSelect | NSelect | 选择器组件 |
| ElDescriptions | NDescriptions | 描述列表 |
| ElEmpty | NEmpty | 空状态 |
| ElRow/ElCol | NGrid/NGridItem | 栅格布局 |
| ElContainer/ElHeader/ElMain | NLayout/NLayoutHeader/NLayoutContent | 布局容器 |
| ElMenu/ElMenuItem | NMenu | 菜单组件 |

### 4. API 变更

#### 消息提示
```typescript
// Element Plus
import { ElMessage } from 'element-plus';
ElMessage.success('成功');

// Naive UI
import { message } from '@/utils/naive';
message.success('成功');
```

#### 对话框确认
```typescript
// Element Plus
import { ElMessageBox } from 'element-plus';
await ElMessageBox.confirm('确定删除吗？');

// Naive UI
import { dialog } from '@/utils/naive';
dialog.warning({
  title: '提示',
  content: '确定删除吗？',
  positiveText: '确定',
  negativeText: '取消',
  onPositiveClick: () => { /* 确认操作 */ }
});
```

#### 数据表格
```tsx
// Element Plus - 使用列组件
<ElTable data={data}>
  <ElTableColumn prop="name" label="名称" />
</ElTable>

// Naive UI - 使用配置对象
const columns = [
  { title: '名称', key: 'name' }
];
<NDataTable columns={columns} data={data} />
```

### 5. 已更新的文件

**核心文件：**
- `src/main.ts` - 应用入口
- `src/App.tsx` - 应用主组件
- `src/utils/naive.ts` - Discrete API 配置

**页面组件：**
- `src/pages/Dashboard.tsx` - 仪表盘
- `src/pages/Devices.tsx` - 设备管理
- `src/pages/RealTimeData.tsx` - 实时数据
- `src/pages/Settings.tsx` - 系统设置

**通用组件：**
- `src/components/DeviceCard.tsx` - 设备卡片
- `src/components/ModuleStatus.tsx` - 模块状态

## 运行项目

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

## 注意事项

1. **样式调整**：Naive UI 的默认样式可能与 Element Plus 不同，某些自定义 CSS 可能需要调整。

2. **响应式布局**：Naive UI 的 Grid 系统使用 `cols` 属性而不是 `span`。

3. **类型支持**：Naive UI 提供了完整的 TypeScript 类型支持，建议充分利用。

4. **主题定制**：如需定制主题，可以使用 `NConfigProvider` 组件。

## 资源链接

- [Naive UI 官方文档](https://www.naiveui.com/zh-CN/os-theme)
- [Naive UI GitHub](https://github.com/tusen-ai/naive-ui)
- [Discrete API 文档](https://www.naiveui.com/zh-CN/os-theme/components/discrete)

