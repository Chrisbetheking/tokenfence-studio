# TokenFence Studio


**语言：** [English](README.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <img src="./docs/images/banner.png" alt="TokenFence Studio" width="100%">
</p>


**语言：** [English](README.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <strong>闈㈠悜澶ц瑷€妯″瀷鐨勬湰鍦颁紭鍏?Prompt 瀹夊叏銆佹枃妗ｆ櫤鑳藉鐞嗕笌澶氭ā鍨嬬紪鎺掑伐浣滃彴</strong>
</p>


**语言：** [English](README.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <a href="./README.md">English</a> | <strong>涓�?/strong>
</p>

---

## 椤圭洰绠€浠?
TokenFence Studio 鏄竴涓潰鍚戝ぇ璇█妯″瀷锛圠LM锛夌殑鏈湴浼樺厛瀹夊叏缂栨帓宸ヤ綔鍙帮紝鎻愪�?Prompt 瀹夊叏鎵弿銆佹枃妗ｆ櫤鑳藉鐞嗐€佹ā鍨嬬煩闃靛姣斿拰涓婁笅鏂囧寘绠＄悊绛夊姛鑳姐�?
## 涓轰粈涔堝仛杩欎釜椤圭洰

闅忕�?LLM 鍦ㄤ紒涓氱幆澧冧腑鐨勫箍娉涘簲鐢紝瀵规彁绀鸿瘝瀹夊叏銆佹暟鎹殣绉佸拰澶氭ā鍨嬬鐞嗙殑闇€姹傛棩鐩婂闀裤€俆okenFence Studio 鏃ㄥ湪鎻愪緵涓€涓紑婧愮殑銆佹湰鍦颁紭鍏堢殑瑙ｅ喅鏂规銆?
## 鏍稿績鍔熻兘

- **Prompt Guard**锛氭彁绀鸿瘝瀹夊叏鎵弿銆佽劚鏁忓鐞嗐€侀闄╄瘎�?- **Document Pipeline**锛氭枃妗ｈВ鏋愩€丱CR 鏀寔銆佹櫤鑳藉垎�?- **Model Matrix**锛氬妯″瀷鍝嶅簲瀵规瘮銆佸欢�?鎴愭湰璇勪及
- **Provider Settings**锛氭敮鎸佸叏鐞冦€佷腑鍥藉尯銆佽矾鐢卞拰鏈湴妯″瀷鎻愪緵�?- **Archive**锛氬彲鎼滅储鐨勫巻鍙茶褰曘€侀闄╄繃�?- **Agent Context Pack**锛氫笂涓嬫枃鍖呯鐞嗗師�?
## 骞冲彴鏀寔

| 骞冲�?| 鐘舵�?| 璇存�?|
|---|---|---|
| Web | 鍙�?| 瀹屾�?Next.js 宸ヤ綔鍙?|
| Android | 鍙�?| Expo React Native Mobile Lite銆侫PK 鍙�?GitHub Releases 涓嬭�?|
| Windows Desktop | 瀹為獙鎬?| Tauri 灏佽�?|
| macOS Desktop | 瀹為獙鎬?| Tauri 灏佽�?|
| iOS | 浠呮簮鐮?| 鐢ㄦ埛闇€鑷绛惧�?|


---

## 下载 (v0.5.24)

### Android Mobile Lite

**推荐 APK：** [TokenFence-Mobile-Lite-Android-v0.5.24-internal-release.apk](https://github.com/Chrisbetheking/tokenfence-studio/releases/download/v0.5.24/TokenFence-Mobile-Lite-Android-v0.5.24-internal-release.apk)

- internal release APK，无需 Metro 开发服务器即可运行
- 已在 Android 模拟器完成安装和启动测试
- 不是 Google Play production-signed build

### Windows 桌面端 (Experimental)

**推荐：** [tokenfence-studio-windows-v0.5.24-i686-unsigned.exe](https://github.com/Chrisbetheking/tokenfence-studio/releases/download/v0.5.24/tokenfence-studio-windows-v0.5.24-i686-unsigned.exe)

- unsigned experimental i686 portable exe
- 已完成本地 smoke test 并成功启动
- x64 构建等待 toolchain 支持

安装包： [MSI](https://github.com/Chrisbetheking/tokenfence-studio/releases/download/v0.5.24/TokenFence-Studio-Windows-v0.5.24-i686-unsigned.msi) | [Setup.exe](https://github.com/Chrisbetheking/tokenfence-studio/releases/download/v0.5.24/TokenFence-Studio-Windows-v0.5.24-i686-unsigned-setup.exe)


## 蹇€熷紑濮?
### Web 宸ヤ綔鍙?
\\\ash
cd apps/web
npm install
npm run dev
\\\

鎵撳�?http://localhost:3000�?
### Android Mobile Lite

\\\ash
cd apps/android
npm install
npm run start
\\\

浣跨�?Expo Go 鎵弿浜岀淮鐮侊紝鎴栬繛鎺?Android 璁惧�?妯℃嫙鍣ㄣ€?
### 妗岄潰搴旂敤

闇€�?Rust �?Tauri CLI銆傝瑙?[docs/RELEASES.md](./docs/RELEASES.md)�?
### API 瀵嗛�?

鍦ㄨ缃腑閰嶇�?API 瀵嗛挜銆傛敮鎸佺殑鎻愪緵鍟嗗寘鎷?OpenAI銆丄nthropic Claude銆丟oogle Gemini銆丏eepSeek銆侀樋閲屼簯/閫氫箟鍗冮棶銆佺櫨搴﹀崈甯嗐€並imi/Moonshot銆佹櫤璋?GLM銆丮iniMax銆丼iliconFlow 绛夈�?
## 椤圭洰缁撴�?

\\\
apps/
  web/          Next.js web 宸ヤ綔鍙?  android/      Expo React Native Android Mobile Lite
  desktop/      Tauri 妗岄潰灏佽 (Windows + macOS)
packages/
  shared/       璺ㄥ钩鍙板叡�?TypeScript 閫昏�?
.github/
  workflows/    CI/CD
\\\

## 褰撳墠鐘舵€?
### 宸插畬鎴?
- 鍝嶅簲寮?Web 宸ヤ綔鍙帮紙Chat銆丟uard銆丏ocument Pipeline銆丮odel Matrix銆丳rovider Settings銆丄rchive銆丄gent Packs�?- Android Mobile Lite 搴旂敤锛堟彁绀鸿瘝鎵弿銆佹ā鍨嬭矾鐢便€佹湰鍦板瓨妗ｏ�?
- Tauri 妗岄潰灏佽锛堝疄楠屾€э�?
- 澶氭彁渚涘晢璁剧疆锛堝叏鐞冦€佷腑鍥藉尯銆佽矾鐢卞拰鏈湴妯″瀷锛?- Agent Context Pack 鍘熷�?
- 鍏变�?TypeScript 閫昏緫鍖?(packages/shared)
- GitHub Releases CI/CD 宸ヤ綔娴?
### 瀹為獙鎬?杩涜涓?
- 妗岄潰瀛樺偍璺緞閫夋�?
- 鏂囦欢绫诲瀷妯″瀷璺敱瑙勫�?
- 妗岄潰闈欐€佹覆鏌撳櫒鎵撳寘

### 璁″垝�?
- MCP 闆嗘�?
- 楂樼�?OCR 娴佹按绾?- 妗岄潰鑷姩鏇存�?

## 鍙戝竷璇存槑

- **v0.5.24 �ǵ�ǰ�ȶ��汾 �� �������� Android APK������ Metro�� �?- **Android APK** 鍙�?GitHub Releases 涓嬭浇锛�?.3.11 璧凤�?
- **Windows/macOS** 妗岄潰瀹夎鍖呬粛澶勪簬瀹為獙闃舵
- **iOS** 浠呮彁渚涙簮鐮佸拰鑷鍚嶆瀯寤鸿矾�?
璇﹁�?[docs/RELEASES.md](./docs/RELEASES.md)�?
## 鍚庣画璁″垝

- [ ] 妗岄潰瀹夎鍖呭畬�?- [ ] MCP 闆嗘�?
- [ ] 绉诲姩绔�?- [ ] 澶氳瑷€鏀寔鏀硅繘

## 浣滆�?
TokenFence Studio �?**Chrisbetheking** 鍒涘缓骞剁淮鎶ゃ�?
## 璁稿彲璇?
鏈」鐩噰鐢?MIT 璁稿彲璇併€傝�?[LICENSE](./LICENSE)�
