# Derin Chat UI Guvenlik, Kullanislik ve README Tutarlilik Denetimi

Analiz tarihi: 2026-08-21

## Ozet

Paket runtime dagitimi acisindan guvenli ve kullanilabilir bir seviyede gorunuyor. Ana paket consumer tarafina runtime dependency tasimiyor; `npm audit --omit=dev` sonucu temiz. Test, build, lint ve pack kontrolleri daha once basarili calisti.

Ancak 1.1.0 oncesi duzeltilmesi gereken bazi tutarlilik ve gelistirme-guvenligi riskleri var:

- Dev dependency audit sonucu ciddi uyarilar veriyor.
- README backend response `actions` alanini gosteriyor, kod parse ediyor, fakat UI action button/link render etmiyor.
- Quick reply tiklamasinda eski state closure nedeniyle secilen yanitin otomatik gonderimi riskli.
- WebSocket connecting/reconnecting sirasinda gonderilen mesajlar loading durumunu uzun sure kilitleyebilir.
- README bundle size ve surum referanslari mevcut build/surum hedefiyle guncel degil.

## Guvenlik Durumu

### Runtime paket

Calistirilan komut:

```bash
npm audit --omit=dev
```

Sonuc:

```text
found 0 vulnerabilities
```

`npm ls --omit=dev --depth=0` sonucu runtime dependency bos:

```text
derin-chat-ui@1.0.13
└── (empty)
```

Bu iyi bir sinyal: npm kullanicilari paketi kurdugunda ek runtime dependency zinciri tasinmiyor.

### Dev dependency audit

Calistirilan komut:

```bash
npm audit
```

Sonuc:

```text
27 vulnerabilities (2 low, 7 moderate, 16 high, 2 critical)
```

One cikan paketler:

- `vitest` / `@vitest/ui`: critical
- `vite`: high
- `happy-dom`: high
- `@babel/core`: arbitrary file read
- `postcss`: high
- `ws`: high
- `lodash`, `minimatch`, `brace-expansion`, `picomatch`, `nanoid`, `js-yaml`, `yaml`

Yorum:

Bu uyarilar runtime kullanicilarina dogrudan gitmiyor, cunku paket runtime dependency yayinlamiyor. Fakat maintainer makinesi, CI, local dev server ve test ortami icin onemli. 1.1.0 oncesi `npm audit fix` veya kontrollu dependency update denenmeli.

## Kod Guvenligi

Guculu taraflar:

- Shadow DOM style isolation mevcut.
- CSP `nonce` fallback style tag icin destekleniyor.
- SSR/browser guard var.
- Config validation URL, layout, theme, attachment ve max message gibi alanlari kontrol ediyor.
- Markdown parser HTML kaciriyor.
- Markdown linkleri yalnizca `http`, `https`, `mailto` protokollerine izin veriyor.
- `apiKey` frontend config icinde kullanildiginda warning basiliyor.
- Client rate limit var ve dokuman bunu server-side rate limit yerine koymuyor.
- `user.hash` sadece backend dogrulamasi icin forward ediliyor; browser icinde dogrulama iddiasi yok.

Riskler:

- `renderCustomMessage` `{ html: string }` kabul ediyor. Bu ozellik guclu ama bilerek guvensiz HTML render yolu aciyor. README/devdocs bunun sadece trusted content ile kullanilmasi gerektigini daha sert soylemeli.
- Markdown parser guvenli basliyor, fakat custom HTML renderer bu korumayi bypass eder.
- Dosya ekleri base64 olarak frontend'den backend'e gonderiliyor. Server tarafinda MIME/type/size tekrar dogrulanmali.

## Kullanislik Durumu

Guculu taraflar:

- Kurulum basit: tek `DerinChat.init(config)`.
- React, Next.js, Vue, Angular ve vanilla HTML ornekleri var.
- No CSS import modeli iyi.
- TypeScript public entry temiz.
- Mock mode ve UI-only fallback gelistirme deneyimini kolaylastiriyor.
- UI Lab paket konfigurasyonunu denemek icin guclu.
- Attachment API modern ve genisletilebilir.
- Session persistence, unread badge ve multi-instance pratik.
- HTTP, SSE, WebSocket ve auto fallback urunu farkli backendlere uyumlu kiliyor.

Kullanislik riskleri:

1. Quick reply otomatik gonderim riski

`src/hooks/useChatState.ts` icinde:

```ts
setInputValue(reply);
setTimeout(() => handleSend(), 100);
```

`handleSend` eski render closure'indaki `inputValue` degerini okuyabilir. Sonuc olarak quick reply bazen input'a yazilir ama otomatik gonderilmeyebilir.

2. WebSocket loading kilitlenmesi

WebSocket veya auto mode sirasinda mesaj `wsSend` ile gonderilirse `onWsSend` loading'i aciyor. Bu loading yalnizca WebSocket `onMessage` geldiginde kapaniyor. Baglanti connecting/reconnecting durumunda mesaj kuyruga alinip cevap gelmezse input uzun sure disabled kalabilir.

3. Action button/link renderer eksik

Backend response icinde `actions` dokumante ediliyor ve parser bunu mesaja ekliyor. Ancak `Message.tsx` icinde `message.actions` icin UI render yok. Bu nedenle README'deki full response ornegi kullaniciya gorunur action UI vaadi gibi algilanabilir, ama su an sadece data parse ediliyor.

4. Voice destegi browser'a bagimli

Voice input/output faydali, fakat Web Speech API her tarayicida ayni degil. README bunu belirtmeli; ozellikle Safari/Firefox/desktop Linux davranislari degisebilir.

## README Ile Tutarlilik

### Tutarlı vaatler

README'de vaat edilen su maddeler kodda karsilik buluyor:

- Shadow DOM style isolation
- Preact'in bundle icinde dagitilmasi
- CSS import gerekmemesi
- TypeScript public exports
- HTTP POST backend contract
- SSE streaming
- WebSocket
- Auto fallback
- Mock mode
- Session persistence
- Multi-instance mounting
- Attachment API
- Markdown rendering
- Quick replies
- Voice controls
- Public API methods
- `messageFormat` field mapping

### Kismen tutarli veya duzeltilmeli vaatler

1. `actions` response alani

README full response icinde `actions` gosteriyor. Kod parse ediyor ama render etmiyor. README bunu "parsed but no default UI yet" diye belirtmeli veya action renderer eklenmeli.

2. Bundle size

README `v1.0.13` bundle rakamlarini gosteriyor. Mevcut build rakamlari farkli:

| Format | README | Mevcut build |
|---|---:|---:|
| ESM raw | 153.29 KB | 155.29 KB |
| ESM gzip | 37.54 KB | 37.93 KB |
| CJS raw | 121.09 KB | 122.53 KB |
| CJS gzip | 33.23 KB | 33.57 KB |
| UMD raw | 121.26 KB | 122.70 KB |
| UMD gzip | 33.30 KB | 33.64 KB |

3. Surum referanslari

README, README.github, devdocs ve docs page hala `1.0.13` referanslari tasiyor. 1.1.0 oncesi guncellenmeli.

4. "Secure by default"

Genel olarak hakli, fakat devdocs/README custom HTML renderer icin daha net sorumluluk siniri koymali.

5. "Framework-agnostic"

React/Next/Vue/Angular/vanilla ornekleri guclu. README.github Svelte de gosteriyor; bu mantiken calisir cunku SDK framework-agnostic, fakat repo icinde Svelte'e ozel test yok.

## Guvenilirlik Puani

Subjektif teknik degerlendirme:

- Runtime paket guvenligi: 8/10
- Dev/CI dependency guvenligi: 5/10
- API tasarimi ve kullanislik: 8/10
- README tutarliligi: 7/10
- Release hazirligi: 7/10

1.1.0 oncesi quick reply, action renderer/README notu, dev dependency audit ve surum/bundle dokumanlari toparlanirsa paket cok daha guvenilir gorunur.

## Onerilen Oncelik Sirasi

1. Dev dependency audit uyarilarini kontrollu update ile azalt.
2. Quick reply otomatik gonderim bug riskini testle ve duzelt.
3. `actions` icin ya UI renderer ekle ya README'ye "parsed only" notu koy.
4. WebSocket loading timeout/fallback davranisini iyilestir.
5. `renderCustomMessage({ html })` icin trusted HTML uyarisi ekle.
6. 1.1.0 surum ve CDN referanslarini guncelle.
7. Bundle size tablolarini yeni build ile guncelle.
8. UI Lab manuel QA yap.
