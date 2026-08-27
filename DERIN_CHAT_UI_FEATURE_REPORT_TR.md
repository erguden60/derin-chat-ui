# Derin Chat UI Ozellik Raporu

Bu rapor, `derin-chat-ui` paketinin mevcut kaynak kodu ve dokumantasyonu incelenerek hazirlanmistir. Amac, urunun kullaniciya sundugu kabiliyetleri, entegrasyon alanlarini ve teknik guvencelerini tek yerde toplamaktir.

## 1. Genel Urun Ozeti

Derin Chat UI, web sitelerine ve web uygulamalarina gomulebilen, uretim kullanimi hedefleyen bir AI sohbet widget SDK'sidir. Paket; React, Next.js, Vue, Angular ve vanilla HTML gibi farkli ortamlarda calisacak sekilde framework-agnostic bir API sunar.

Temel konumlandirma:

- Gomulebilir AI sohbet arayuzu
- Shadow DOM ile stil izolasyonu
- TypeScript destekli SDK
- HTTP, SSE streaming ve WebSocket baglanti modlari
- Dosya ekleri, markdown, hizli yanitlar, ses girisi/cikisi ve oturum kaliciligi
- Coklu widget instance destegi

Mevcut paket versiyonu: `1.0.13`

## 2. Kurulum ve Entegrasyon Ozellikleri

Derin Chat UI, npm paketi olarak dagitilir ve farkli paket yoneticileriyle kurulabilir:

- `npm install derin-chat-ui`
- `yarn add derin-chat-ui`
- `pnpm add derin-chat-ui`

Desteklenen entegrasyon yollari:

- React ve Next.js client component kullanimi
- Vue `onMounted` / `onUnmounted` entegrasyonu
- Angular component yasam dongusuyle kurulum
- Vanilla HTML icin UMD bundle
- CDN uzerinden `window.DerinChat.init(...)` kullanimi

SDK, Preact'i dagitim ciktisina dahil eder. Bu nedenle paket tuketicisinin ayrica `preact` kurmasi gerekmez. Stil dosyasi import etmek de gerekmez; stiller widget'in Shadow DOM kokune enjekte edilir.

## 3. Public SDK API

Paket, basit ve sabit bir public API sunar:

- `DerinChat.init(config)`: Widget'i baslatir.
- `DerinChat.destroy(instanceId?)`: Aktif instance'i DOM'dan kaldirir.
- `DerinChat.isActive(instanceId?)`: Belirli bir instance'in calisip calismadigini kontrol eder.
- `DerinChat.clearHistory(instanceId?)`: Kalici mesaj gecmisini temizler ve aktif widget'i bilgilendirir.
- `DerinChat.loadMessages(messages, instanceId?)`: Dis kaynaktan gelen mesaj gecmisini widget'a yukler.

`instanceId` kullanimi sayesinde ayni sayfada birden fazla bagimsiz widget calistirilabilir.

## 4. Arayuz ve Tema Ozellikleri

Widget arayuzu su ozellestirmeleri destekler:

- Sag alt veya sol alt konumlandirma
- `normal`, `compact`, `full-screen` layout secenekleri
- `light`, `dark`, `auto` tema modlari
- Sistem koyu/acik tema degisimini dinleme
- Ozellestirilebilir ana renk, header rengi, arka plan, mesaj balonu renkleri ve input renkleri
- Kontrast kontrolu ile okunabilir metin rengi secimi
- Ozel font ailesi
- Logo ve agent avatar destegi
- Z-index ayari
- Yerellestirilebilir metinler
- Hos geldin ekrani metinleri ve ipuclari
- Klavye kisayollari: `Esc` ile kapatma, `Ctrl/Cmd + K` ile ac/kapat
- Disariya tiklayinca kapatma davranisi
- Input acildiginda otomatik odak yonetimi

## 5. Mesajlasma Ozellikleri

Mesaj katmani yalnizca duz metin gostermez; zengin sohbet deneyimi sunar:

- Kullanici, bot, agent ve system mesaj tipleri
- Mesaj zaman damgalari
- Bot ve agent mesajlari
- Agent adi, avatar ve online bilgisi
- Hizli yanit butonlari
- Mesaj aksiyonlari
- Gorsel mesaj destegi
- Dosya mesaj kartlari
- Yaziliyor/yukleniyor durumu
- Streaming mesajlarda parca parca metin guncelleme
- Kullanici mesajini duzenleme
- Duzenlenen mesajdan sonraki gecmisi kirpip yaniti yeniden tetikleme
- Bot mesajini yeniden uretme
- Mesaj kopyalama
- Kod blogu kopyalama
- Olumlu/olumsuz geri bildirim
- Sohbet gecmisini temizleme
- Uretimi durdurma

## 6. Markdown ve Kod Gosterimi

Markdown ozelligi aktifken mesajlar zengin bicimde render edilir:

- Basliklar
- Kalin ve italik metin
- Inline code
- Kod bloklari
- Temel syntax renklendirme
- Kod blogu dili etiketi
- Kod blogu kopyalama butonu
- Guvenli link protokolleri: `http`, `https`, `mailto`
- HTML kacirma ile XSS riskini azaltma

## 7. Baglanti Modlari

Derin Chat UI farkli backend mimarilerine uyum saglar.

### HTTP

Varsayilan modda `apiUrl` adresine `POST` istegi gonderilir. Payload icinde mesaj, kullanici bilgisi, oturum id'si, gecmis ve varsa dosya bilgisi yer alir.

### SSE / HTTP Streaming

`connection.stream` aktif edildiginde streaming yanitlar desteklenir. Desteklenen ornek formatlar:

- `data: {"reply":"..."}`
- `data: {"text":"..."}`
- OpenAI benzeri `choices[0].delta.content`
- `data: [DONE]`

Streaming sirasinda bos bot balonu olusturulur, token/metin geldikce mesaj guncellenir ve tamamlandiginda streaming durumu kapatilir.

### WebSocket

WebSocket modu su ozellikleri icerir:

- `wss://` endpoint ile canli baglanti
- Protokol destegi
- Otomatik yeniden baglanma
- Maksimum reconnect denemesi
- Reconnect interval ayari
- Heartbeat/ping-pong mekanizmasi
- Offline iken mesaj kuyruga alma
- Reconnect basarili oldugunda kuyrugu bosaltma
- Baglanti durum event'leri

### Auto Mode

`connection.mode: 'auto'` kullanildiginda WebSocket uygunsa kullanilir. WebSocket basarisiz veya kopuk durumdaysa HTTP fallback devreye girer.

### Mock / UI-Only Mode

Backend olmadan arayuz test etmek icin mock modu vardir:

- `mock: true` ile otomatik sahte yanit
- Ozel mock handler ile senaryo bazli yanit
- Mock handler'a kullanici, gecmis ve dosya baglami gonderme
- Backend ve mock yoksa UI-only bilgilendirme yaniti

## 8. Dosya ve Ek Sistemi

Yeni `attachments` sistemi ve geriye donuk `features.fileUpload` / `ui.fileUpload` yolu desteklenir.

Desteklenen ek kabiliyetleri:

- Gorsel yukleme
- PDF yukleme
- Dokuman yukleme
- Ozel attachment type tanimlama
- Max dosya boyutu limiti
- Accept/MIME filtreleri
- Gorseller icin preview
- PDF ve dokumanlar icin dosya karti
- Drag-and-drop dosya birakma
- Dosya boyutu hata mesaji
- Gorsel okuma hata mesaji
- Ozel attachment trigger renderer
- Ozel menu item renderer
- Ozel preview renderer

Dosya gonderiminde backend'e dosya adi, MIME tipi, boyut ve base64/data URL bilgisi iletilir.

## 9. Ses Ozellikleri

Widget browser-native ses API'lerini kullanir.

Ses girisi:

- Mikrofon ile Speech-to-Text
- Dil ayari
- Ses sonucunu input metnine ekleme
- Ses hata callback'i

Ses cikisi:

- Bot mesajini sesli okuma
- Dil koduna gore ses secimi
- `voiceName` ile belirli ses arama
- Uygun dil bulunamazsa tarayici varsayilan sesine dusme
- Okumayi baslatma/durdurma
- `onVoiceStart` ve `onVoiceEnd` event'leri

## 10. Oturum, Kalicilik ve Okunmamis Sayaci

Davranis ayarlari ile oturum yonetimi kontrol edilir:

- Mesaj gecmisini `localStorage` icinde saklama
- Acik/kapali pencere durumunu saklama
- Okunmamis mesaj sayisini saklama
- Kalici `sessionId` uretme ve saklama
- `persistSessionId: false` ile her sayfa yuklemede yeni oturum
- Instance bazli storage key'leri
- Maksimum mesaj sayisi limiti
- Chat kapaliyken gelen bot/agent mesajlari icin okunmamis sayaci
- Chat acildiginda okunmamis sayacini sifirlama
- Okunmamis badge rengi, pozisyonu, maksimum sayisi ve animasyon ayarlari

## 11. Event Hook'lari ve Gelistirici Genisletmeleri

SDK, host uygulamanin sohbet akisina entegre olmasi icin cok sayida callback sunar:

- `onBeforeMessageSend`
- `onMessageSent`
- `onMessageReceived`
- `onChatOpened`
- `onChatClosed`
- `onError`
- `onConnectionChange`
- `onReconnecting`
- `onReconnected`
- `onUnreadCountChange`
- `onMessageCopy`
- `onMessageEdit`
- `onRegenerate`
- `onFeedback`
- `onChatClear`
- `onVoiceError`
- `onVoiceStart`
- `onVoiceEnd`
- `onUserTyping`
- `onVisibilityChange`

Gelistirici ayrica `renderCustomMessage` ile mesaj render davranisini ozellestirebilir. Bu renderer VDOM benzeri degerler veya `{ html: string }` formatinda HTML donebilir.

## 12. Backend Sozlesmesi ve Veri Esleme

Varsayilan backend yaniti:

```json
{ "reply": "Hello! How can I help?" }
```

Tam yanit su alanlari destekler:

- `reply`
- `image`
- `quickReplies`
- `actions`
- `agent`
- `type`
- `timestamp`

Backend farkli alan adlari kullaniyorsa `messageFormat` ile esleme yapilabilir:

- `textField`
- `imageField`
- `quickRepliesField`
- `actionsField`
- `agentField`
- `typeField`

HTTP request tarafinda sunlar gonderilir:

- `message`
- `sessionId`
- `user`
- `history`
- `file`
- Streaming icin `stream: true`

Kullanici nesnesi icinde `id`, `name`, `avatar`, `metadata` ve backend dogrulamasi icin `hash` alani desteklenir.

## 13. Guvenlik ve Izolasyon

Uygulamada one cikan guvenlik ve izolasyon noktalar:

- Shadow DOM ile host uygulama CSS'inden izolasyon
- Constructable stylesheet destegi
- Fallback style tag icin CSP `nonce`
- SSR/browser guard
- Markdown icinde HTML escape
- Linklerde protokol sinirlama
- API key icin Bearer header destegi
- Gizli server-side key'lerin frontend'e koyulmamasi gerektigine dair dokumantasyon uyarisi
- Hata durumlarini `onError` ve system mesajlariyla yonetme

## 14. Performans ve Dayaniklilik

Kod tabaninda uretim kullanimini destekleyen dayaniklilik parcalari bulunur:

- HTTP timeout
- Retry mekanizmasi
- Exponential backoff
- AbortController ile yanit uretimini durdurma
- Rate limiting: dakikada maksimum mesaj ve cooldown
- WebSocket reconnect backoff
- Heartbeat
- Message queue
- Maksimum mesaj sayisi ile state buyumesini sinirlama
- Bundle formatlari: ESM, CJS, UMD
- `sideEffects: false` ile tree-shaking uyumlulugu

## 15. Dokumantasyon ve Gelistirme Deneyimi

Repo icinde urunun tanitimi, entegrasyonu ve test edilmesi icin ek sayfalar bulunur:

- Landing page
- Docs page
- UI Lab
- React/Next rehberi
- README ve GitHub README
- Developer docs
- Changelog
- Release checklist
- Attachment system notlari
- Shadow DOM izolasyon dokumani

UI Lab; senaryo, tema, layout, baglanti modu, dosya, markdown, media, agent ve QA durumlarini denemeye yarayan gelistirme arayuzu olarak konumlanir.

## 16. Test Kapsami

Repo test dosyalarina gore su alanlarda otomatik testler bulunur:

- Widget launcher
- Chat header
- Message component
- File upload
- Voice input
- Chat state
- Message sender
- WebSocket hook
- Persistence hook
- Messages hook
- Markdown parser
- Validator
- Public index API
- Event davranislari

Test altyapisi `vitest`, `@testing-library/preact` ve `happy-dom` uzerine kuruludur.

## 17. Ticari ve Urun Degeri

Derin Chat UI'nin urun degeri su basliklarda toplanabilir:

- Hizli entegrasyon: tek `init` cagrisi ile kullanima baslar.
- Farkli backend tiplerine uyum: HTTP, SSE, WebSocket, auto fallback.
- Tasarim guvenligi: Shadow DOM sayesinde host uygulama stilleriyle catismaz.
- Kurumsal ozellestirme: tema, renk, metin, logo, renderer ve event hook'lari.
- AI deneyimi: streaming, markdown, kod bloklari, ses, hizli yanitlar.
- Destek senaryolari: agent bilgisi, okunmamis sayaci, feedback, regenerate, edit.
- Gelistirme kolayligi: mock mode, UI Lab ve TypeScript tipleri.
- Operasyonel dayaniklilik: retry, reconnect, timeout, rate limit ve session persistence.

## 18. Kisa Ozellik Listesi

- Gomulebilir sohbet widget'i
- Framework-agnostic SDK
- React, Next.js, Vue, Angular, Vanilla HTML destegi
- Shadow DOM stil izolasyonu
- ESM, CJS ve UMD bundle
- TypeScript tipleri
- Coklu instance
- Ozel mount target
- Light/dark/auto tema
- Responsive layout modlari
- Renk, font, logo ve metin ozellestirme
- HTTP API
- SSE streaming
- WebSocket
- Auto fallback
- Mock mode
- UI-only mode
- Session ID
- LocalStorage kaliciligi
- Mesaj gecmisi
- Okunmamis badge
- Hizli yanitlar
- Markdown
- Kod blogu ve kod kopyalama
- Gorsel mesajlar
- Dosya ekleri
- Drag-and-drop
- Ozel attachment renderer'lari
- Ses girisi
- Sesli okuma
- Mesaj kopyalama
- Mesaj duzenleme
- Regenerate
- Feedback
- Sohbet temizleme
- Stop generating
- Baglanti banner'lari
- Reconnect aksiyonu
- Event callback'leri
- Custom message renderer
- API response field mapping
- CSP nonce destegi
- SSR guard
- Retry, timeout ve rate limit

## 19. Kaynak Kanitlari

Bu raporda kullanilan baslica kaynak dosyalar:

- `README.md`
- `package.json`
- `src/index.ts`
- `src/types/index.ts`
- `src/types/api.ts`
- `src/types/connection.ts`
- `src/types/message.ts`
- `src/constants/defaults.ts`
- `src/hooks/useChatState.ts`
- `src/hooks/useMessageSender.ts`
- `src/hooks/useWebSocket.ts`
- `src/utils/api.ts`
- `src/utils/websocket.ts`
- `src/utils/markdown.ts`
- `src/components/ChatWidget.tsx`
- `src/components/ChatWindow.tsx`
- `src/components/ChatInput.tsx`
- `src/components/Message.tsx`
- `src/components/FileUpload.tsx`
- `src/components/ChatHeader.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/DocsPage.tsx`
- `src/pages/UiLabPage.tsx`
