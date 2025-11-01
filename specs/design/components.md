# UI 元件規格

本文件定義圖書館座位追蹤器的所有 UI 元件規格，基於 **Town Pass 設計系統** (台北市城市通)。

設計原則：**Mobile First**，遵循政府服務應用程式的設計規範。

---

## 📱 設計系統基礎

### 色彩使用原則

- **主要品牌色 (Primary)**: `#5AB4C5` - 用於主要按鈕、連結、重要互動元素
- **次要品牌色 (Secondary)**: `#F5BA4B` - 用於強調、次要按鈕
- **座位狀態色**:
  - 🟢 有空位: `#76A732` (Green/500)
  - ⚫ 座位已滿: `#ADB8BE` (Grey/300)
  - ⚪ 無資料: `#FFFFFF` (White) + 邊框 `#91A0A8` (Grey/400)
- **語意化顏色**:
  - 警告 (Alarm): `#D45251` (Red/500)
  - 提醒 (Reminder): `#FD853A` (Orange/500)
  - 禁用 (Disable): `#E3E7E9` (Grey/100)

### 字體規範

- **主要字體**: PingFang SC (繁體中文優先)
- **標題一 (H1)**: 36px / Semibold / Line-height 48px
- **標題二 (H2)**: 24px / Semibold / Line-height 32px
- **內文 (Body)**: 14px / Regular / Line-height 20px
- **內文粗體**: 14px / Semibold / Line-height 20px

---

## 🎯 地圖標記 (Map Marker)

地圖上顯示圖書館位置的標記點。

### 視覺規格

```
尺寸: 40x40px (Mobile 觸控友善尺寸)
Hover/Active 尺寸: 48x48px
圓角: 完全圓形 (border-radius: 50%)
陰影: 0 4px 12px rgba(0, 0, 0, 0.15)
```

### 三種狀態

#### 1. 有空位 (Available)
```css
.map-marker-available {
  width: 40px;
  height: 40px;
  background: var(--color-seat-available); /* #76A732 */
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(118, 167, 50, 0.3);
  border: 3px solid #FFFFFF;
  transition: all 250ms ease;
}

.map-marker-available:active {
  transform: scale(1.2);
  box-shadow: 0 6px 16px rgba(118, 167, 50, 0.4);
}
```

#### 2. 座位已滿 (Full)
```css
.map-marker-full {
  width: 40px;
  height: 40px;
  background: var(--color-seat-full); /* #ADB8BE */
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(173, 184, 190, 0.3);
  border: 3px solid #FFFFFF;
  transition: all 250ms ease;
}
```

#### 3. 無資料 (No Data)
```css
.map-marker-no-data {
  width: 40px;
  height: 40px;
  background: var(--color-seat-no-data); /* #FFFFFF */
  border: 4px solid var(--color-seat-no-data-border); /* #91A0A8 */
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(145, 160, 168, 0.3);
  transition: all 250ms ease;
}
```

### 互動行為

- **點擊**: 放大 1.2 倍，顯示底部資訊卡片
- **狀態**: 使用觸覺回饋 (Haptic Feedback)
- **無障礙**: `role="button"`, `aria-label="圖書館名稱，目前有 X 個空位"`

---

## 📋 圖書館卡片 (Library Card)

顯示圖書館資訊的卡片組件，用於列表頁面。

### Mobile 規格

```css
.library-card {
  background: var(--color-background-white);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(11, 13, 14, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 44px; /* 觸控目標 */
  transition: all 200ms ease;
}

.library-card:active {
  background: var(--color-grey-50);
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(11, 13, 14, 0.06);
}
```

### 卡片結構

```html
<div class="library-card">
  <div class="library-card-header">
    <h3 class="library-card-title">中山圖書館</h3>
    <div class="library-card-badge">0.8 km</div>
  </div>
  <div class="library-card-seats">
    <div class="seats-info">
      <span class="seats-available">45</span>
      <span class="seats-separator">/</span>
      <span class="seats-total">80</span>
      <span class="seats-label">個座位</span>
    </div>
    <div class="seats-status-badge available">有空位</div>
  </div>
  <div class="library-card-footer">
    <span class="library-card-address">台北市中山區中山北路二段...</span>
  </div>
</div>
```

### 座位資訊樣式

```css
.seats-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 18px;
}

.seats-available {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-seat-available); /* 有空位時為綠色 */
}

.seats-available.full {
  color: var(--color-seat-full); /* 已滿時為灰色 */
}

.seats-total {
  font-size: 18px;
  color: var(--color-text-description);
}

.seats-status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.seats-status-badge.available {
  background: rgba(118, 167, 50, 0.1);
  color: var(--color-seat-available);
}

.seats-status-badge.full {
  background: var(--color-grey-100);
  color: var(--color-text-description);
}
```

---

## 📄 詳細資訊頁面 (Detail Page)

全螢幕顯示圖書館的詳細資訊，從底部向上滑入。

### 頁面結構

```html
<div class="detail-page">
  <!-- 頂部色塊 -->
  <div class="detail-header">
    <button class="detail-back-btn">
      <icon name="arrow-left" />
    </button>
    <h1 class="detail-title">中山圖書館</h1>
  </div>

  <!-- 座位資訊卡片 -->
  <div class="detail-seats-card">
    <div class="detail-seats-large">
      <span class="seats-current">45</span>
      <span class="seats-divider">/</span>
      <span class="seats-max">80</span>
    </div>
    <p class="detail-seats-label">目前可用座位</p>
    <div class="detail-seats-badge available">有空位</div>
  </div>

  <!-- 資訊列表 -->
  <div class="detail-info-list">
    <div class="detail-info-item">
      <icon name="map-pin" />
      <div class="detail-info-content">
        <label>地址</label>
        <p>台北市中山區中山北路二段 48 巷 7 號</p>
        <button class="btn-navigate">開啟導航</button>
      </div>
    </div>

    <div class="detail-info-item">
      <icon name="phone" />
      <div class="detail-info-content">
        <label>電話</label>
        <a href="tel:02-2523-0784">02-2523-0784</a>
      </div>
    </div>

    <div class="detail-info-item">
      <icon name="clock" />
      <div class="detail-info-content">
        <label>開放時間</label>
        <p>週一至週五 09:00 - 21:00<br>週六、日 09:00 - 17:00</p>
      </div>
    </div>
  </div>
</div>
```

### 樣式規範

```css
.detail-header {
  background: var(--color-primary-500);
  padding: var(--safe-area-inset-top) 20px 32px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}

.detail-back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
}

.detail-seats-card {
  margin: -24px 20px 24px;
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(11, 13, 14, 0.1);
  text-align: center;
}

.detail-seats-large {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 12px;
}

.seats-current {
  color: var(--color-seat-available);
}

.seats-max {
  color: var(--color-text-description);
}

.detail-info-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--color-grey-100);
}

.detail-info-item icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary-500);
  flex-shrink: 0;
}

.detail-info-content label {
  display: block;
  font-size: 12px;
  color: var(--color-text-description);
  margin-bottom: 4px;
}

.detail-info-content p,
.detail-info-content a {
  font-size: 16px;
  color: var(--color-text-primary);
  line-height: 1.5;
}
```

---

## 🔘 按鈕元件 (Button)

遵循 Town Pass 按鈕規範。

### Primary Button (主要按鈕)

```css
.btn-primary {
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:active {
  background: var(--color-primary-600);
  transform: scale(0.96);
}

.btn-primary:disabled {
  background: var(--color-disable);
  color: var(--color-text-description);
  cursor: not-allowed;
}
```

### Secondary Button (次要按鈕)

```css
.btn-secondary {
  background: var(--color-secondary-500);
  color: var(--color-grey-950);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  transition: all 200ms ease;
}

.btn-secondary:active {
  background: var(--color-secondary-600);
}
```

### Outline Button (外框按鈕)

```css
.btn-outline {
  background: transparent;
  color: var(--color-primary-500);
  border: 2px solid var(--color-primary-500);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  transition: all 200ms ease;
}

.btn-outline:active {
  background: rgba(90, 180, 197, 0.1);
}
```

### 導航按鈕 (Navigate Button)

```css
.btn-navigate {
  width: 100%;
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  transition: all 200ms ease;
}

.btn-navigate::before {
  content: "📍";
  font-size: 20px;
}

.btn-navigate:active {
  background: var(--color-primary-600);
  transform: scale(0.98);
}
```

---

## 📱 底部滑動面板 (Bottom Sheet)

Mobile 專用的滑動面板，用於顯示圖書館列表。

### 規格

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 24px rgba(11, 13, 14, 0.12);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  padding-bottom: var(--safe-area-inset-bottom);
}

/* 收合狀態 */
.bottom-sheet.collapsed {
  transform: translateY(calc(100% - 120px));
}

/* 展開狀態 */
.bottom-sheet.expanded {
  transform: translateY(0);
  max-height: 80vh;
}

/* 完全隱藏 */
.bottom-sheet.hidden {
  transform: translateY(100%);
}
```

### 手柄 (Handle)

```css
.bottom-sheet-handle {
  width: 48px;
  height: 4px;
  background: var(--color-grey-300);
  border-radius: 2px;
  margin: 12px auto;
  cursor: grab;
}

.bottom-sheet-handle:active {
  cursor: grabbing;
  background: var(--color-grey-400);
}
```

### 內容區域

```css
.bottom-sheet-content {
  padding: 0 20px 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
  -webkit-overflow-scrolling: touch;
}
```

---

## 🔍 搜尋列 (Search Bar)

Mobile 頂部搜尋列。

```css
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: var(--safe-area-inset-top) 16px 12px;
  box-shadow: 0 2px 8px rgba(11, 13, 14, 0.08);
  z-index: 100;
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  background: var(--color-grey-50);
  border: none;
  border-radius: 24px;
  padding: 12px 20px;
  font-size: 16px;
  min-height: 48px;
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px var(--color-primary-500);
}

.filter-btn {
  width: 48px;
  height: 48px;
  background: var(--color-primary-500);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.filter-btn:active {
  background: var(--color-primary-600);
  transform: scale(0.92);
}
```

---

## ♿ 無障礙規範

### 觸控目標

- **最小尺寸**: 44x44px (Town Pass 規範)
- **推薦尺寸**: 48x48px
- **間距**: 元素間至少 8px 間距

### ARIA 標籤

```html
<!-- 地圖標記 -->
<button
  class="map-marker-available"
  role="button"
  aria-label="中山圖書館，目前有 45 個空位，距離 0.8 公里"
  tabindex="0"
>
</button>

<!-- 圖書館卡片 -->
<article
  class="library-card"
  role="article"
  aria-labelledby="library-name-1"
>
  <h3 id="library-name-1">中山圖書館</h3>
</article>

<!-- 底部滑動面板 -->
<div
  class="bottom-sheet"
  role="dialog"
  aria-label="圖書館列表"
  aria-modal="false"
>
</div>
```

### 顏色對比

所有文字顏色符合 **WCAG 2.1 AA** 標準:
- 正常文字: 最少 4.5:1
- 大字文字 (18px+): 最少 3:1

---

## 📐 響應式設計

### Mobile First

```css
/* Mobile (預設) */
.library-card {
  padding: 20px;
  font-size: 16px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .library-card {
    padding: 24px;
  }

  .bottom-sheet {
    max-width: 480px;
    margin: 0 auto;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  /* Desktop 使用不同的佈局，見 Desktop 規格 */
}
```

---

## 🎨 設計原則總結

1. **Mobile First**: 所有組件優先為 Mobile 設計
2. **觸控友善**: 最小觸控目標 44x44px
3. **視覺層級清晰**: 使用 Town Pass 色彩系統
4. **流暢動畫**: 使用 CSS transform 確保 60fps
5. **無障礙優先**: 完整的 ARIA 支援和鍵盤操作
6. **政府服務風格**: 專業、可信賴、易用

---

**設計系統來源**: [Town Pass Design System (Figma Community)](https://www.figma.com/community/file/1435823849677824862)

**更新日期**: 2025-11-01
