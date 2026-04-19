# 🔧 Derin Chat UI — Refactor Raporu

**Tarih:** 2026-04-19  
**Scope:** Kritik DX / i18n düzeltmeleri (2 sorun, 5 dosya)

---

## 📋 Yapılan Değişiklikler

### Fix 1 — Türkçe Hard-Code String'lerin i18n'e Bağlanması

#### Sorun
Widget içinde çeşitli UI metinleri `config.ui.texts` üzerinden değil, doğrudan Türkçe sabit string olarak yazılmıştı. Bu durum:
- npm paketi olan bir SDK için ciddi bir i18n ihlali
- Türkçe olmayan kullanıcılar için kötü UX
- `texts` config'inin o bölümlerde işlevsiz kalması

#### Etkilenen Dosyalar & Değişiklikler

**`src/components/Message.tsx`**

| Satır | Eski | Yeni |
|---|---|---|
| 96, 98 | `'Kopyalandı!'` | `config.ui?.texts?.copied \|\| 'Copied!'` |
| 102 | `'Metni Kopyala'` | `config.ui?.texts?.copy \|\| 'Copy'` |
| 264 | `>İptal<` | `>{config.ui?.texts?.cancel \|\| 'Cancel'}<` |
| 265 | `>Kaydet<` | `>{config.ui?.texts?.save \|\| 'Save'}<` |

**`src/components/ChatWindow.tsx`**

| Satır | Eski | Yeni |
|---|---|---|
| 85 | `` `Dosya boyutu ${maxSize}MB'dan küçük olmalıdır.` `` | `texts.fileSizeError.replace('{maxSize}', ...)` |
| 106 | `'Görsel yüklenirken hata oluştu.'` | `texts?.imageLoadError \|\| 'Failed to load image.'` |
| 140 | `<p>Dosyayı buraya bırakın</p>` | `<p>{texts?.dropFile \|\| 'Drop file here'}</p>` |
| 197 | `'Mesajınızı yazın...'` | `'Type your message...'` (default değer güncellendi) |

---

### Fix 2 — `config.events.*` ile `config.onX` Tutarsızlığının Giderilmesi

#### Sorun
`ChatConfig`'te iki farklı callback pattern'i vardı:
- `config.onMessageSent`, `config.onError`, `config.onFeedback` → flat (doğru)
- `config.events.onVoiceStart`, `config.events.onVisibilityChange` → iç içe (tutarsız)

Bu durum DX açısından şaşkınlık yaratıyor:
```typescript
// Hangi convention? ❌
DerinChat.init({
  onMessageSent: () => {},     // ✅ flat
  events: {
    onVoiceStart: () => {},    // ❌ iç içe — neden?
  }
});
```

#### Uygulanan Çözüm: Flat Callback + Geriye Dönük Uyumluluk

Yeni API ile tüm callback'ler `config.onX` formatında:

```typescript
DerinChat.init({
  onMessageSent:      (msg) => {},
  onVoiceStart:       () => {},      // ✅ artık flat
  onVoiceEnd:         () => {},      // ✅ artık flat
  onVisibilityChange: (hidden) => {}, // ✅ artık flat
  onUserTyping:       () => {},      // ✅ artık flat
});
```

`events.*` alanı `@deprecated` olarak işaretlendi ve kod içinde fallback ile destekleniyor:

```typescript
// ChatWidget.tsx — örnek pattern
const cb = config.onVisibilityChange ?? config.events?.onVisibilityChange;
cb?.(document.hidden);
```

> Bu sayede **mevcut kullananlar için breaking change yok.** `events.*` kullananlar hiçbir şeyi değiştirmeden çalışmaya devam eder.

#### Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/types/index.ts` | `onUserTyping`, `onVisibilityChange`, `onVoiceStart`, `onVoiceEnd` flat callback olarak eklendi. `events` block `@deprecated` işaretlendi. |
| `src/components/ChatWidget.tsx` | `config.events?.onVisibilityChange` → `config.onVisibilityChange ?? config.events?.onVisibilityChange` |
| `src/components/Message.tsx` | `config.events?.onVoiceStart/End` → `config.onVoiceStart/End ?? config.events?.onVoiceStart/End` |
| `src/components/ChatWindow.tsx` | `config.events?.onUserTyping` → `config.onUserTyping ?? config.events?.onUserTyping` |

---

### Fix 3 — Yeni i18n Key'leri `types/index.ts` ve `constants/defaults.ts`'e Eklendi

**`ui.texts` arayüzüne eklenen yeni alanlar:**

```typescript
// src/types/index.ts
texts?: {
  // ... mevcut alanlar ...

  // Yeni — Edit actions
  cancel?: string;          // default: 'Cancel'
  save?: string;            // default: 'Save'

  // Yeni — File / Drag-drop
  dropFile?: string;        // default: 'Drop file here'
  fileSizeError?: string;   // default: 'File must be smaller than {maxSize}MB'
  imageLoadError?: string;  // default: 'Failed to load image'
}
```

**`DEFAULT_TEXTS`'e eklenen varsayılanlar:**

```typescript
// src/constants/defaults.ts
export const DEFAULT_TEXTS = {
  // ... mevcut ...
  cancel: 'Cancel',
  save: 'Save',
  dropFile: 'Drop file here',
  fileSizeError: 'File must be smaller than {maxSize}MB.',
  imageLoadError: 'Failed to load image.',
};
```

> `fileSizeError` içinde `{maxSize}` placeholder'ı, runtime'da `.replace('{maxSize}', String(maxSize))` ile doldurulur.

---

## 🗂 Değiştirilen Dosyalar (Özet)

| Dosya | Değişiklik Tipi | Satır Farkı |
|---|---|---|
| `src/types/index.ts` | i18n key ekleme + flat callback | +16 |
| `src/constants/defaults.ts` | Varsayılan string ekleme | +7 |
| `src/components/Message.tsx` | TR → i18n, voice callback flat | ~10 satır değişti |
| `src/components/ChatWindow.tsx` | TR → i18n, userTyping flat | ~8 satır değişti |
| `src/components/ChatWidget.tsx` | visibilityChange flat | ~3 satır değişti |

---

## ✅ Breaking Change Durumu

**Hiç breaking change yok.** Tüm değişiklikler:
- Eski `events.*` callback'leri hâlâ çalışıyor (fallback ile)
- Yeni flat callback'ler ek seçenek olarak sunuluyor
- Türkçe default'lar İngilizce'ye çevrildi — bu sadece `texts` config geçilmeyen kullanıcıları etkiler (zaten geçmiyorsa widget default language'a döner)

---

## 🔜 Kalan Öneriler

- [x] ~~JS hover hack → CSS `:hover`~~ ✅ Fix 3
- [x] ~~WebSocket modunda `isLoading` indicatoru~~ ✅ Fix 4
- [x] ~~`sessionId` request body'e eklenmeli~~ ✅ Fix 5
- [ ] `useMessageSender.ts`'i parçala (5 mode → ayrı handler dosyaları)
- [ ] Mesaj listesi için virtual scroll ekle
- [ ] aria role'larını tamamla

---

## Fix 3 — JS Hover Hack → Pure CSS

### Sorun
`Message.tsx`'te user mesajının araç butonları hover'da görünmesi için `ref` callback içinde `addEventListener` kullanılıyordu. Her render'da yeni listener ekleniyor → **memory leak riski** + Shadow DOM uyumsuzluğu.

### Çözüm

**`Message.tsx`** — `ref` kaldırıldı, sade class eklendi:
```tsx
// ✅ Yeni
<div class={`message-tools${isUser ? ' user-tools' : ''}`}>
```

**`message.scss`** — CSS `:hover` kuralı eklendi:
```scss
.message-tools.user-tools {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.message-wrapper:hover .user-tools {
  opacity: 1;
}
```

---

## Fix 4 — WebSocket Modunda `isLoading` Indicator

### Sorun
WS modunda mesaj gönderildikten hemen sonra `isLoading=false` yapılıyordu. Bot cevabı gelmeden loading biter, kullanıcı beklenip beklenmediğini anlayamıyor.

### Çözüm

`useChatState.ts`'te ayrı `isWsLoading` state eklendi:

```typescript
const [isWsLoading, setIsWsLoading] = useState(false);

// WS mesajı gönderilince loading başlat
onWsSend: () => setIsWsLoading(true),

// Bot cevabı gelince loading bitir (onMessage'da)
onMessage: (data) => {
  setIsWsLoading(false);  // ← buraya taşındı
  addMessage(parseApiResponse(data, config));
},

// Birleşik loading
const isLoading = isHttpLoading || isWsLoading;
```

---

## Fix 5 — `sessionId` Tüm Request'lere Eklendi

### Sorun
`localStorage`'da `sessionId` vardı ama hiçbir HTTP/WS isteğine eklenmiyordu. Sunucu her mesajı bağımsız bir istek olarak görüyor, multi-turn context kaybediliyordu.

### Çözüm

**`useChatState.ts`** — sessionId yüklenir veya oluşturulur ve persist edilir:
```typescript
const sessionId = (() => {
  const existing = loadSessionId(instanceId);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  saveSessionId(newId, instanceId);
  return newId;
})();
```

**`useMessageSender.ts`** — sessionId tüm modlara eklendi:
```typescript
// HTTP (standard & streaming)
{ message: text, sessionId, user: {...}, history: [...] }

// WebSocket
{ type: 'message', data: { text, sessionId, user: {...}, timestamp } }
```
