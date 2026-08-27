# Derin Chat UI 1.1.0 Paket Durumu ve Kalan Adimlar

Analiz tarihi: 2026-08-21

Bu rapor, mevcut kaynak kod, paket ayarlari, release dokumanlari ve dogrulama komutlari incelenerek hazirlanmistir.

## Mevcut Durum

- Paket adi: `derin-chat-ui`
- Mevcut `package.json` surumu: `1.0.13`
- Hedeflenen sonraki minor release: `1.1.0`
- Paket tipi: ESM module, ESM/CJS/UMD library build
- Public export yuzeyi: ana entry `.` ve `./umd`
- Preact dagitim modeli: Preact bundle icine aliniyor, consumer tarafinda ekstra Preact kurulumu gerekmiyor.

## Calisma Agaci Durumu

Repo temiz degil. Iki ayri degisiklik katmani var:

1. Staged degisiklikler:
   - Runtime SDK kaynaklari
   - Yeni UI Lab ve docs sayfalari
   - Yeni testler
   - README / README.github / devdocs / changelog / release checklist
   - 1.0.13 release manifest
   - Eski demo dosyalarinin kaldirilmasi

2. Unstaged degisiklikler:
   - `dev.html`
   - `index.html`
   - `src/pages/DocsPage.tsx`
   - `src/pages/LandingPage.tsx`
   - `src/pages/UiLabPage.tsx`
   - `src/pages/pages.css`

3. Untracked dosya:
   - `DERIN_CHAT_UI_FEATURE_REPORT_TR.md`

Bu nedenle 1.1.0 oncesi ilk karar: staged ve unstaged degisikliklerin hangileri release kapsaminda kalacak, hangileri ayrilacak?

## Dogrulama Sonuclari

Calistirilan komutlar:

```bash
npm run test
npm run build
npm --cache /tmp/derin-npm-cache pack --dry-run --ignore-scripts
npm run lint
```

Sonuclar:

- Test: basarili
- Test dosyasi: 15 passed
- Test sayisi: 142 passed
- Build: basarili
- Lint: basarili
- Pack dry-run: basarili
- Pack dosya sayisi: 47
- Paket boyutu: 139.7 KB
- Unpacked size: 521.4 KB

Build ciktisi:

| Format | File | Raw | Gzip |
|---|---|---:|---:|
| ESM | `dist/index.js` | 155.29 KB | 37.93 KB |
| CJS | `dist/index.cjs` | 122.53 KB | 33.57 KB |
| UMD | `dist/index.umd.js` | 122.70 KB | 33.64 KB |

Not: Bu rakamlar dokumanlardaki mevcut `v1.0.13` bundle tablosundan farkli. 1.1.0 dokumanlari bu yeni rakamlarla guncellenmeli.

## Kaynak Kod Analizi

### Paket girisi

`src/index.ts` public SDK entry olarak calisiyor:

- `DerinChat.init`
- `DerinChat.destroy`
- `DerinChat.clearHistory`
- `DerinChat.loadMessages`
- `DerinChat.isActive`

Shadow DOM kurulumu, style injection, CSP `nonce`, multi-instance host olusturma ve SSR guard burada yonetiliyor.

### Tip yuzeyi

`src/types/index.ts`, `api.ts`, `connection.ts` ve `message.ts` public API tiplerini tasiyor:

- `ChatConfig`
- `Message`
- `ApiRequest`
- `ApiResponse`
- `ConnectionConfig`
- `WebSocketConfig`
- `AttachmentTypeConfig`
- `FileAttachment`
- `UnreadBadgeConfig`

Generated `dist/index.d.ts` public entry icinde Preact tipi sizmiyor. `dist/components/*.d.ts` icinde Preact referanslari var, fakat package exports normal consumer icin bu internal path'leri public entry yapmiyor.

### Runtime ozellikleri

Kaynak kod su release degerini destekliyor:

- HTTP mesajlasma
- SSE streaming
- WebSocket
- Auto fallback
- Mock mode
- UI-only fallback
- Dosya ekleri ve attachment menu
- Drag-drop dosya birakma
- Markdown ve kod blogu kopyalama
- Mesaj duzenleme
- Regenerate
- Feedback
- Voice input/output
- Session persistence
- Instance-scoped localStorage
- Unread badge
- Connection banner ve reconnect aksiyonu
- Custom message renderer
- Event hook'lari

### Dayaniklilik

Kodda su korumalar var:

- HTTP timeout
- Retry
- AbortController
- Client-side rate limit
- WebSocket reconnect
- Heartbeat
- Offline message queue
- Config validation
- Prototype pollution korumali deep merge
- Markdown HTML escape
- Link protocol allowlist
- CSP nonce fallback

## 1.1.0 Icin Kalan Ana Adimlar

### 1. Release kapsamini netlestir

`RELEASE_CHECKLIST.md`, mevcut calismanin 1.1.0 olmasini su durumda oneriyor:

- UI Lab yayin kapsaminda kabul edilecekse
- Docs split yayin kapsaminda kabul edilecekse
- Public type exports yayin kapsaminda kabul edilecekse
- Attachment API dokumantasyonu yayin kapsaminda kabul edilecekse
- Widget UI polish minor release olarak konumlanacaksa

Bu paket artik patch gibi degil, minor release gibi duruyor.

### 2. Versiyonlari 1.1.0'a guncelle

Guncellenecek yerler:

- `package.json`
- `package-lock.json`
- `README.md`
- `README.github.md`
- `devdocs.md`
- `src/pages/DocsPage.tsx`
- `CHANGELOG.md`
- `RELEASE_CHECKLIST.md`

Bulunan eski referanslar:

- `derin-chat-ui@1.0.13`
- `Current stable: v1.0.13`
- `Current package version: 1.0.13`
- `Current v1.0.13 build`

### 3. Changelog'a 1.1.0 bolumu ekle

Mevcut `CHANGELOG.md` icinde `[Unreleased]` bos. 1.1.0 icin yeni bolum acilmali:

```md
## [1.1.0] - 2026-08-21
```

Onerilen basliklar:

- Added: UI Lab, docs site, attachment customization, expanded type exports
- Improved: Shadow DOM style injection, widget polish, markdown/code block UI, connection UX
- Fixed: docs alignment, type declaration consumer safety, validation coverage
- Testing: 142 passing tests, build, lint, pack dry-run

### 4. Bundle size tablolarini yenile

Yeni build rakamlari:

- ESM: 155.29 KB raw, 37.93 KB gzip
- CJS: 122.53 KB raw, 33.57 KB gzip
- UMD: 122.70 KB raw, 33.64 KB gzip

Eski dokuman rakamlari 153.29 / 121.09 / 121.26 KB civarinda kaldigi icin guncellenmeli.

### 5. Working tree temizligi yap

Yayin oncesi su kararlar verilmeli:

- `index.html` degisiklikleri release kapsaminda mi?
- `src/pages/*` ustundeki unstaged degisiklikler commit'e dahil mi?
- `DERIN_CHAT_UI_FEATURE_REPORT_TR.md` repository-only dokuman olarak tutulacak mi?
- `RELEASE_MANIFEST_1.0.13.md` 1.1.0 icin yeni manifest ile degistirilecek mi, yoksa tarihsel dosya olarak kalacak mi?

1.1.0 icin yeni bir `RELEASE_MANIFEST_1.1.0.md` olusturulmasi daha temiz olur.

### 6. Manuel UI Lab QA yap

Otomatik testler geciyor ama UI Lab gorsel olarak kontrol edilmeli:

- Welcome
- Conversation
- Long
- Markdown
- Media
- Agent
- Light/dark/auto theme
- Normal/compact/full-screen layout
- Desktop/mobile viewport
- Dashboard/docs/marketing/hostile host surface
- File menu ve preview
- Voice input/output
- Connection states
- Error toast
- Message edit mode
- Code block rendering

### 7. Clean consumer smoke testleri tekrarla

Release checklist bunlari bekliyor:

- Temiz TypeScript projesine lokal `.tgz` install
- Preact kurmadan type import testi
- ESM import smoke test
- CJS require smoke test
- UMD browser smoke test
- Yayindan once `npm pack --dry-run`

Bu tur smoke testleri mevcut raporda “expected current status” olarak yazili, fakat 1.1.0 versiyon bump ve son docs degisikliklerinden sonra tekrar calistirilmalilar.

### 8. npm package icerigini onayla

Pack dry-run su anda dogru ana dosyalari iceriyor:

- `dist`
- `README.md`
- `README.github.md`
- `devdocs.md`
- `CHANGELOG.md`
- `RELEASE_CHECKLIST.md`
- `LICENSE`
- `package.json`

Repository-only kalmasi beklenen dosyalar npm paketine girmiyor:

- `src/**`
- `public/**`
- `dev.html`
- `index.html`
- `src/pages/**`
- test dosyalari
- release manifest
- attachment/shadow implementation notes

### 9. Git release hazirligi

Yayin oncesi:

- Alakasiz taslak degisiklikleri ayir
- 1.1.0 dosyalarini stage et
- Test/build/lint/pack ciktilarini son kez al
- Commit olustur
- Tag olustur: `v1.1.0`

### 10. Publish sonrasi kontroller

Yayin sonrasi:

- npm paket sayfasi README render kontrolu
- Published package clean install
- CDN UMD URL kontrolu: `https://unpkg.com/derin-chat-ui@1.1.0/dist/index.umd.js`
- GitHub release olusturma
- Changelog highlight ekleme

## Blokerler

Su anda teknik bloker gorunmuyor:

- Test geciyor
- Build geciyor
- Lint geciyor
- Pack dry-run geciyor

Release blokerleri daha cok surec ve temizlik tarafinda:

- Repo temiz degil.
- Versiyon hala `1.0.13`.
- Dokumanlarda CDN ve bundle bilgileri hala `1.0.13`.
- `[Unreleased]` changelog bos.
- 1.1.0 manifest yok.
- Manuel UI Lab QA henuz bu analiz icinde yapilmadi.

## Onerilen Siralama

1. Release kapsamini `1.1.0` olarak kesinlestir.
2. Unstaged docs/UI Lab/index degisikliklerini inceleyip dahil et veya ayir.
3. `package.json` ve `package-lock.json` surumunu `1.1.0` yap.
4. README, README.github, devdocs ve DocsPage CDN orneklerini `1.1.0` yap.
5. Bundle size tablolarini son build rakamlariyla guncelle.
6. `CHANGELOG.md` icinde `1.1.0 - 2026-08-21` bolumu yaz.
7. `RELEASE_MANIFEST_1.1.0.md` ekle.
8. UI Lab manuel QA yap.
9. `npm run test`, `npm run lint`, `npm run build`, `npm pack --dry-run` tekrar calistir.
10. Clean consumer smoke testlerini tamamla.
11. Commit, tag ve publish adimlarina gec.
