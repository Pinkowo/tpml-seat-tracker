# 圖書館座位追蹤器 - UI/UX 設計文件

基於 **Town Pass 設計系統** (台北市城市通) 的 Mobile First 設計規範。

---

## 📁 設計檔案結構

本目錄包含完整的 UI/UX 設計產出:

- `design-tokens.css` - Town Pass 色彩系統與設計變數
- `components.md` - Mobile First UI 元件規格
- `index.html` - 設計系統總覽頁面 (待更新)
- `README.md` - 本文件
- `SUMMARY.md` - 設計產出總結

---

## 🎨 設計概覽

### 設計系統來源

本專案採用 [Town Pass 開源設計系統](https://www.figma.com/community/file/1435823849677824862)，這是台北市政府城市通應用程式使用的官方設計系統，專為政府服務應用程式打造。

### 設計原則

1. **Mobile First** - 優先為行動裝置設計
2. **政府服務風格** - 專業、可信賴、易用
3. **無障礙優先** - 符合 WCAG 2.1 AA 標準
4. **觸控友善** - 最小觸控目標 44x44px

---

## 🎨 色彩系統

### 主要品牌色 (Primary Color)

Town Pass 青藍色系，用於主要互動元素：

- **Primary/500** `#5AB4C5` - 主要品牌色
- **Primary/400** `#71C5D5` - 淺色變化
- **Primary/600** `#468D9B` - 深色變化

### 次要品牌色 (Secondary Color)

Town Pass 金黃色系，用於強調和次要按鈕：

- **Secondary/500** `#F5BA4B` - 次要品牌色
- **Secondary/400** `#F0C87C` - 淺色變化
- **Secondary/600** `#E7A43C` - 深色變化

### 座位狀態色彩

根據 Town Pass 語意化顏色系統定義：

- 🟢 **有空位**: `#76A732` (Green/500)
- ⚫ **座位已滿**: `#ADB8BE` (Grey/300)
- ⚪ **無資料**: `#FFFFFF` (White) + 邊框 `#91A0A8` (Grey/400)

### 語意化顏色

- **警告 (Alarm)**: `#D45251` (Red/500)
- **提醒 (Reminder)**: `#FD853A` (Orange/500)
- **禁用 (Disable)**: `#E3E7E9` (Grey/100)

### 文字顏色

- **主要文字**: `#30383D` (Grey/800)
- **次要文字**: `#475259` (Grey/700)
- **說明文字**: `#91A0A8` (Grey/400)

---

## 📝 字體系統

### 字體家族

```css
"PingFang SC", "Microsoft JhengHei", "微軟正黑體",
-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

優先使用 PingFang SC (蘋果繁體中文字體)，適合政府服務應用程式的清晰易讀性。

### 字型尺寸規範

| 用途 | 尺寸 | 字重 | 行高 | 使用場景 |
|------|------|------|------|----------|
| **H1 標題** | 36px | Semibold (600) | 48px | 頁面主標題 |
| **H2 標題** | 24px | Semibold (600) | 32px | 區塊標題 |
| **內文** | 14px | Regular (400) | 20px | 一般文字內容 |
| **內文粗體** | 14px | Semibold (600) | 20px | 強調文字 |
| **大數字** | 48px | Bold (700) | 1 | 座位數顯示 |

---

## 📱 介面組成 (Mobile First)

### 主畫面結構

#### 1. 地圖區域
- **MapLibre GL JS** 地圖底層
- **圖書館標記點** (40x40px 圓形)
  - 有空位: 綠色 `#76A732`
  - 座位已滿: 灰色 `#ADB8BE`
  - 無資料: 白色 + 灰框
- **點擊標記**: 展開底部滑動面板顯示圖書館資訊

#### 2. 頂部搜尋列 (固定)
- **搜尋輸入框**: 圓角 24px，背景 `#F1F3F4`
- **篩選按鈕**: 48x48px 圓形，主色 `#5AB4C5`
- **Safe Area**: 適配 iOS 瀏海屏

#### 3. 底部滑動面板 (Bottom Sheet)

**三種狀態**:
- **收合** (120px): 顯示圖例和提示
- **展開** (80vh): 顯示圖書館列表
- **隱藏**: 查看詳細資訊時

**手勢操作**:
- 點擊手柄: 切換展開/收合
- 上滑/下滑: 展開/收合面板
- 拖曳: 跟隨手指移動

#### 4. 圖書館卡片

每張卡片包含:
- **圖書館名稱** (H2 標題)
- **距離標籤** (km)
- **座位資訊**
  - 大字顯示目前座位數
  - 總座位數
  - 狀態標籤 (有空位/已滿)
- **地址** (簡短顯示)

#### 5. 詳細資訊頁面

從底部全螢幕滑入，包含:
- **彩色頂部區塊** (主色 `#5AB4C5`)
  - 返回按鈕
  - 圖書館名稱
- **座位資訊卡片** (浮起效果)
  - 超大字體顯示座位數 (48px)
  - 狀態標籤
- **資訊列表**
  - 📍 地址 + 開啟導航按鈕
  - 📞 電話 (可點擊撥號)
  - 🕒 開放時間
  - 📏 距離

---

## 🎯 互動流程

### 主要使用流程

```
使用者開啟 App
   ↓
載入地圖與圖書館標記點
   ↓
【選項 A】點擊地圖標記
   ↓
底部面板自動展開，顯示該圖書館資訊
   ↓
點擊卡片 → 查看完整詳細資訊

【選項 B】向上滑動底部面板
   ↓
瀏覽完整圖書館列表 (依距離或座位數排序)
   ↓
點擊卡片 → 查看完整詳細資訊

【選項 C】使用頂部搜尋
   ↓
輸入關鍵字搜尋圖書館
   ↓
選擇搜尋結果 → 查看完整詳細資訊
```

### 互動狀態

**按鈕**:
- Normal: 預設樣式
- Active: `scale(0.96)` + 顏色變深
- Disabled: 灰色背景 + 灰色文字

**卡片**:
- Normal: 白色背景 + 淡陰影
- Active: 淺灰背景 `#F1F3F4` + `scale(0.98)`

**地圖標記**:
- Normal: 40x40px
- Active: `scale(1.2)` + 陰影加深

---

## 📏 間距與尺寸規範

### 間距系統 (4px 基準)

| 名稱 | 數值 | 使用場景 |
|------|------|----------|
| **xs** | 4px | 微小間距 |
| **sm** | 8px | 元素內間距 |
| **md** | 16px | 標準間距 |
| **lg** | 24px | 區塊間距 |
| **xl** | 32px | 大區塊間距 |
| **2xl** | 48px | 頁面區塊間距 |

### 圓角規範

| 名稱 | 數值 | 使用場景 |
|------|------|----------|
| **sm** | 4px | 小元件 |
| **md** | 8px | 一般元件 |
| **lg** | 12px | 按鈕 |
| **xl** | 16px | 卡片 |
| **2xl** | 24px | 搜尋框、Bottom Sheet |
| **full** | 9999px | 圓形按鈕、標記點 |

### 陰影系統

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);      /* 輕微提升 */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);    /* 卡片 */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);  /* 浮起元素 */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);  /* 模態視窗 */
```

---

## 📱 響應式斷點

```css
/* Mobile (預設) */
< 768px

/* Tablet */
768px - 1023px

/* Desktop */
≥ 1024px
```

### Mobile 佈局 (預設)
- 全螢幕地圖
- 頂部搜尋列
- 底部滑動面板
- 全螢幕詳細頁

### Tablet 佈局 (768px+)
- 底部面板最大寬度 480px
- 卡片間距增加
- 字體稍大

### Desktop 佈局 (1024px+)
- 側邊列表面板 (右上角固定)
- 底部資訊框 (取代滑動面板)
- 模態視窗詳細頁 (取代全螢幕)

---

## ♿ 無障礙設計

### WCAG 2.1 AA 標準

- ✅ 色彩對比 ≥ 4.5:1 (正常文字)
- ✅ 色彩對比 ≥ 3:1 (大字文字 18px+)
- ✅ 觸控目標 ≥ 44x44px
- ✅ 完整鍵盤操作支援
- ✅ ARIA 標籤與角色

### ARIA 實作範例

```html
<!-- 地圖標記 -->
<button
  role="button"
  aria-label="中山圖書館，目前有 45 個空位，距離 0.8 公里"
  tabindex="0"
>
</button>

<!-- 底部滑動面板 -->
<div
  role="dialog"
  aria-label="圖書館列表"
  aria-modal="false"
>
</div>
```

### 鍵盤操作

- `Tab`: 切換焦點
- `Enter` / `Space`: 啟動按鈕/卡片
- `Esc`: 關閉模態視窗/詳細頁
- `↑` / `↓`: 列表導航

---

## 🚀 效能考量

### 動畫效能

- **使用 CSS Transform**: 確保 GPU 加速
- **避免 Layout Thrashing**: 不改變 width/height
- **60fps 目標**: 所有動畫流暢

### 圖片優化

- 地圖標記使用 CSS 繪製 (無圖片)
- 圖示使用 Icon Font 或 SVG
- 必要圖片使用 WebP 格式

### 載入優化

- 地圖瓦片按需載入
- 圖書館列表虛擬滾動 (如超過 50 筆)
- Critical CSS 內聯

---

## 📋 元件庫清單

### 基礎元件
- ✅ Button (Primary, Secondary, Outline, Navigate)
- ✅ Input (Search)
- ✅ Badge (Status, Distance)
- ✅ Card (Library Card)

### 地圖元件
- ✅ Map Marker (Available, Full, No Data)
- ⏳ Legend (圖例)
- ⏳ Info Popup

### 容器元件
- ✅ Bottom Sheet (Collapsed, Expanded, Hidden)
- ✅ Detail Page (全螢幕)
- ✅ Search Bar (固定頂部)

### 排版元件
- ✅ Info List Item
- ✅ Section Header
- ⏳ Empty State

---

## 🎨 設計檔案使用方式

### 給設計師

1. 查看 `design-tokens.css` 了解完整色彩系統
2. 閱讀 `components.md` 取得元件規格
3. 使用 [Town Pass Figma](https://www.figma.com/community/file/1435823849677824862) 作為設計參考

### 給開發者

1. 引入 `design-tokens.css` 到專案
   ```html
   <link rel="stylesheet" href="specs/design/design-tokens.css">
   ```

2. 使用 CSS 變數
   ```css
   .my-button {
     background: var(--color-primary-500);
     border-radius: var(--radius-lg);
     padding: var(--spacing-md);
   }
   ```

3. 參考 `components.md` 實作 UI 元件

---

## 📝 設計決策記錄

### 為什麼選擇 Town Pass 設計系統？

1. **政府官方認證**: 台北市政府使用的設計系統，符合政府服務規範
2. **繁體中文優化**: 專為繁體中文使用者設計
3. **行動優先**: 完整的 Mobile App 設計規範
4. **開源免費**: Figma Community 可自由取用

### 為什麼使用青藍色 (#5AB4C5) 作為主色？

- 符合 Town Pass 品牌識別
- 與圖書館相關的知識、學習主題契合
- 與綠色座位狀態形成良好視覺對比
- 符合無障礙色彩對比標準

### 為什麼座位狀態使用這些顏色？

1. **綠色 (#76A732)**: Town Pass 的成功色，代表「可用」、「通過」
2. **灰色 (#ADB8BE)**: 中性色，清楚表達「不可用」但不會過於負面
3. **白色 + 灰框**: 明確區分「未知狀態」與「已知狀態」

---

## 🔄 版本記錄

### v2.0 - 2025-11-01 (當前版本)
- ✅ 完全採用 Town Pass 設計系統
- ✅ 重新設計為 Mobile First
- ✅ 更新所有色彩變數
- ✅ 重寫元件規格
- ✅ 新增完整無障礙規範

### v1.0 - 2025-10-XX
- 原始設計版本
- 使用自訂色彩系統
- 桌面優先設計

---

## 🔗 相關連結

- [Town Pass 設計系統 (Figma)](https://www.figma.com/community/file/1435823849677824862)
- [功能規格](../001-library-seat-tracker/spec.md)
- [實作計劃](../001-library-seat-tracker/plan.md)
- [任務清單](../001-library-seat-tracker/tasks.md)

---

**設計系統**: Town Pass (台北市城市通)
**設計版本**: v2.0
**更新日期**: 2025-11-01
**設計師**: AI Assistant (Claude Code)
