# Derin Chat UI Shadow DOM Isolation

Bu dokuman, Derin Chat UI projesinde Shadow DOM izolasyonunun nerede ve nasil yapildigini aciklar.

## Kisa Ozet

Derin Chat UI, host uygulamanin CSS'i ile widget CSS'inin birbirine karismamasi icin widget'i normal DOM yerine Shadow DOM icine render eder.

Temel akis:

1. SDK `DerinChat.init(config)` ile baslatilir.
2. Her chat instance icin bir host element olusturulur.
3. Host element uzerinde `attachShadow({ mode: 'open' })` ile Shadow DOM acilir.
4. Widget stilleri `main.scss?inline` ile string olarak alinir.
5. Tarayici destekliyorsa stiller paylasimli `CSSStyleSheet` olarak `shadow.adoptedStyleSheets` icine eklenir.
6. Destek yoksa fallback olarak Shadow DOM icine nonce destekli bir `<style>` etiketi eklenir.
7. Preact chat widget'i Shadow DOM icine render edilir.

Bu yapi sayesinde:

- Host sitenin global CSS'i chat widget'i kolayca bozamaz.
- Chat widget'in `.message`, `.chat-window`, `.send-btn` gibi class'lari host siteye sizmaz.
- Developer'in ayri bir CSS dosyasi import etmesine gerek kalmaz.

## Ana Uygulama Noktasi

Shadow DOM izolasyonunun ana uygulandigi dosya:

- `src/index.ts`

Bu dosya paket/SDK giris noktasi gibi calisir. Production kullanimda `DerinChat.init()` buradan gelir.

### 1. Stiller Inline Import Ediliyor

Dosya:

- `src/index.ts`

Kod:

```ts
import styles from './styles/main.scss?inline';
```

Burada `main.scss` normal global CSS olarak import edilmiyor. Vite'in `?inline` ozelligiyle derlenmis CSS string olarak aliniyor. Bu string daha sonra Shadow DOM icine yerlestiriliyor.

Ilgili stil kaynagi:

- `src/styles/main.scss`

Bu dosya widget'in ana stil dosyasidir ve component stillerini toplar:

```scss
@use './components/message.scss';
@use './components/quick-replies.scss';
@use './components/typing-indicator.scss';
@use './components/file-upload.scss';
@use './components/error-toast.scss';
@use './components/connection-status.scss';
@use './components/unread-badge.scss';
@use './animations.scss';
```

## Host Element Olusturma

Dosya:

- `src/index.ts`

Kod:

```ts
let host = document.getElementById(hostId);

if (!host) {
  host = document.createElement('div');
  host.id = hostId;
  host.dataset.derinChatInstance = instanceId;
  mountTarget.appendChild(host);
}
```

Bu kisim sayfa icinde widget'in yerlestirilecegi ana DOM elementini olusturur.

Host id mantigi:

```ts
private static createHostId(instanceId: string): string {
  return instanceId === 'default' ? 'derin-chat-host' : `derin-chat-host-${instanceId}`;
}
```

Yani:

- Default instance: `#derin-chat-host`
- Named instance: `#derin-chat-host-support`
- Baska instance: `#derin-chat-host-sales`

Bu multi-instance desteginin de temelidir.

## Shadow Root Olusturma

Dosya:

- `src/index.ts`

Kod:

```ts
let shadow = host.shadowRoot;
if (!shadow) {
  shadow = host.attachShadow({ mode: 'open' });
}
```

Bu kisim asil Shadow DOM izolasyonunu baslatir.

`mode: 'open'` kullanildigi icin browser console veya test kodlari `host.shadowRoot` uzerinden Shadow DOM'a erisebilir. Bu, debug ve test icin kullanislidir.

## Stilleri Shadow DOM Icine Ekleme

Dosya:

- `src/index.ts`

Modern tarayicilarda once constructable stylesheet yolu denenir:

```ts
const sheet = getSharedStyleSheet();
if (!shadow.adoptedStyleSheets.includes(sheet)) {
  shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
}
```

Bu yolda CSS bir kez parse edilir ve multi-instance kullanimda ayni `CSSStyleSheet` paylasilir.

Fallback olarak eski `<style>` yontemi korunur:

```ts
const styleTag = document.createElement('style');
styleTag.setAttribute('data-derin-chat-style', '');
styleTag.nonce = nonce;
styleTag.textContent = styles;
shadow.appendChild(styleTag);
```

Bu kisim widget CSS'ini Shadow DOM icine ekler.

Onemli detay:

- `adoptedStyleSheets` destekleniyorsa `<style>` kullanilmaz.
- Multi-instance'da ayni `CSSStyleSheet` cache uzerinden paylasilir.
- Fallback `<style>` icin `data-derin-chat-style` marker'i kullanilir.
- Eski temizleme artik sadece Derin Chat'in kendi bastigi style tag'i uzerinden yapilir.
- `config.nonce` verilirse fallback `<style>` uzerine nonce basilir.
- Adopted stylesheet yolunda nonce gerekmez, cunku inline `<style>` tag'i olusturulmaz.

## Widget'i Shadow DOM Icine Render Etme

Dosya:

- `src/index.ts`

Kod:

```ts
render(
  h(ErrorBoundary, { onError: config.onError, children: h(ChatWidget, { config: fullConfig }) }),
  shadow as unknown as Element
);
```

Burada `ChatWidget` normal `document.body` icine degil, dogrudan `shadow` root icine render edilir.

Bu nedenle widget'in DOM agaci ve style agaci host uygulamadan izole olur.

## Temizlik / Destroy Akisi

Dosya:

- `src/index.ts`

Kod:

```ts
if (host && host.shadowRoot) {
  render(null, host.shadowRoot as unknown as Element);
  host.remove();
}
```

`DerinChat.destroy(instanceId)` cagrildiginda:

1. Shadow DOM icindeki Preact app unmount edilir.
2. Host element DOM'dan kaldirilir.
3. Instance kaydi temizlenir.

## Dev Ortamindaki Benzer Uygulama

Dosya:

- `src/main.tsx`

Bu dosyada da benzer Shadow DOM kurulumu bulunur. Genellikle local demo/dev ortami icin kullanilir.

Oradaki akis da aynidir:

1. `main.scss?inline` import edilir.
2. `derin-chat-host` olusturulur.
3. `attachShadow({ mode: 'open' })` cagrilir.
4. Stil etiketi Shadow DOM'a eklenir.
5. `ChatWidget` shadow root icine render edilir.

Production SDK tarafinda ana kaynak yine `src/index.ts` dosyasidir.

## CSP Nonce Destegi

Dosya:

- `src/types/index.ts`
- `src/index.ts`

`ChatConfig` icine opsiyonel `nonce?: string` alani eklenmistir:

```ts
export interface ChatConfig {
  instanceId?: string;
  target?: string | HTMLElement;
  nonce?: string;
}
```

Bu alan sadece fallback `<style>` yolunda kullanilir:

```ts
if (nonce) {
  styleTag.nonce = nonce;
}
```

Bu, Content Security Policy kullanan host uygulamalarda inline style injection icin uyumluluk saglar. Modern `adoptedStyleSheets` yolunda nonce gerekli degildir.

## AdoptedStyleSheets Production Iyilestirmesi

Dosya:

- `src/index.ts`

Eklenen yardimci yapi:

```ts
let sharedStyleSheet: CSSStyleSheet | null = null;

function getSharedStyleSheet(): CSSStyleSheet {
  if (!sharedStyleSheet) {
    sharedStyleSheet = new CSSStyleSheet();
    sharedStyleSheet.replaceSync(styles);
  }

  return sharedStyleSheet;
}
```

Bu sayede birden fazla chat instance'i acildiginda CSS her seferinde yeniden parse edilmez. Tarayici destekliyorsa tum instance'lar ayni constructable stylesheet'i kullanir.

## Shadow DOM Uyumlu Event Kullanimi

Shadow DOM icinde event target davranisi normal DOM'dan farkli olabilir. Bu yuzden disari tiklama gibi kontrollerde `composedPath()` kullanilmis.

### Chat Disina Tiklama

Dosya:

- `src/components/ChatWidget.tsx`

Kod mantigi:

```ts
const path = e.composedPath();
const clickedInsideWidget = path.some((el) => el === widgetRef.current);
```

Bu, tiklamanin Shadow DOM icindeki widget'tan gelip gelmedigini daha guvenilir anlamaya yarar.

### File Upload Menusu Disina Tiklama

Dosya:

- `src/components/FileUpload.tsx`

Benzer sekilde file upload menusu icin de `composedPath()` kullanilir. Bu, Shadow DOM icinde menu disina tiklama kontrolunu daha stabil yapar.

## Stil Dosyalarinin Izolasyondaki Rolu

Ana stil dosyasi:

- `src/styles/main.scss`

Component stil dosyalari:

- `src/styles/components/message.scss`
- `src/styles/components/quick-replies.scss`
- `src/styles/components/typing-indicator.scss`
- `src/styles/components/file-upload.scss`
- `src/styles/components/error-toast.scss`
- `src/styles/components/connection-status.scss`
- `src/styles/components/unread-badge.scss`
- `src/styles/animations.scss`

Bu dosyalar dogrudan host sayfaya global CSS olarak eklenmez. `src/styles/main.scss` tarafindan toplanir, `src/index.ts` icinde inline string olarak alinir ve Shadow DOM icine basilir.

## Dokumantasyonda Gectigi Yerler

Proje dokumantasyonunda Shadow DOM izolasyonundan bahsedilen dosyalar:

- `README.md`
- `devdocs.md`
- `src/pages/LandingPage.tsx`
- `src/pages/DocsPage.tsx`
- `src/demo/DemoControls.tsx`

Ozellikle `README.md` icinde bu fikir "Zero-CSS Architecture" olarak anlatilir:

- SDK ayri CSS import gerektirmez.
- Widget stilleri Shadow DOM icine enjekte edilir.
- Host app CSS'i widget'i bozmaz.
- Widget CSS'i host app'e sizmaz.

## Testlerde Shadow DOM Kullanimi

Testlerde Shadow DOM'a erisilen yerlerden biri:

- `src/events.test.ts`

Orada test kodu host elementini alip `host.shadowRoot` icinden textarea gibi widget elemanlarini sorgular. Bu da widget'in gercekten Shadow DOM icine render edildigini dogrulayan pratik bir kullanimdir.

## Projedeki Ilgili Dosya Haritasi

| Dosya | Rol |
| --- | --- |
| `src/index.ts` | Production SDK girisi. Host olusturma, Shadow DOM acma, stil inject etme, widget render etme burada. |
| `src/types/index.ts` | `ChatConfig.nonce` ile CSP nonce destegini tip seviyesinde acar. |
| `src/main.tsx` | Local/dev/demo icin benzer Shadow DOM kurulumu. |
| `src/styles/main.scss` | Tum widget stillerini toplayan ana SCSS dosyasi. |
| `src/styles/components/*.scss` | Component bazli stiller. Shadow DOM'a `main.scss` uzerinden girer. |
| `src/components/ChatWidget.tsx` | Shadow DOM uyumlu click outside davranisi icin `composedPath()` kullanir. |
| `src/components/FileUpload.tsx` | Shadow DOM uyumlu menu outside-click davranisi icin `composedPath()` kullanir. |
| `README.md` | Shadow DOM izolasyonu ve zero-CSS mimarisini kullaniciya anlatir. |
| `devdocs.md` | Runtime akista host, Shadow DOM ve style injection adimlarini dokumante eder. |

## Teknik Sonuc

Derin Chat UI'da Shadow DOM izolasyonu sadece CSS seviyesinde bir tercih degil, SDK mimarisinin merkezinde yer alir.

En kritik production akis sudur:

```ts
let shadow = host.shadowRoot;
if (!shadow) {
  shadow = host.attachShadow({ mode: 'open' });
}

applyShadowStyles(shadow, fullConfig.nonce);

render(
  h(ErrorBoundary, { onError: config.onError, children: h(ChatWidget, { config: fullConfig }) }),
  shadow as unknown as Element
);
```

`applyShadowStyles` modern tarayicilarda paylasimli `adoptedStyleSheets` yolunu, destek olmayan ortamlarda ise nonce destekli fallback `<style>` etiketini kullanir.

Bu parca sayesinde Derin Chat UI:

- Girdigi sayfaya minimum yan etki yapar.
- CSS cakismalarini azaltir.
- Framework bagimsiz embed deneyimi sunar.
- Developer'in ekstra CSS kurulumu yapmasina gerek birakmaz.
- Modern tarayicilarda paylasimli `adoptedStyleSheets` ile daha verimli calisir.
- CSP kullanan ortamlarda fallback style tag icin nonce destekler.
