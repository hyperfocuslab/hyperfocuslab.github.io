# hyperfocuslab.cloud

GitHub Pages에 바로 올릴 수 있도록 정리한 정적 사이트 파일입니다.

포함 파일:

- `index.html`: 새 랜딩 페이지
- `privacy.html`: 현재 라이브 개인정보처리방침 사본
- `terms.html`: 현재 라이브 서비스 이용약관 사본
- `support.html`: 한국어 고객지원 페이지
- `support-en.html`: 영어 고객지원 페이지
- `support-ja.html`: 일본어 고객지원 페이지
- `assets/support.css`: 고객지원 페이지 공통 스타일
- `app-ads.txt`: AdMob 검증 파일
- `CNAME`: 커스텀 도메인 설정
- `.nojekyll`: GitHub Pages 정적 파일 처리 보장
- `assets/peakly-logo.png`: Peakly 로고

배포 메모:

1. GitHub Pages 원본 저장소 루트에 이 파일들을 복사합니다.
2. 기존 `privacy.html`, `terms.html`를 유지하고 싶다면 이 폴더의 파일로 교체해도 됩니다.
3. 커밋 후 Pages가 재배포되면 `https://hyperfocuslab.cloud/`에서 반영됩니다.

## 다국어 페이지

- 한국어 홈페이지: `index.html` (`/`)
- 영어 홈페이지: `index-en.html`
- 일본어 홈페이지: `index-ja.html`
- 각 언어의 지원·개인정보처리방침·이용약관 페이지로 연결합니다.
- 영어·일본어 앱 화면은 Peakly 1.5.3 출시용 캡처를 사용합니다.
- 개인정보처리방침·이용약관은 Peakly 저장소의 `AppStoreAssets/Release-1.5.3/legal` 번역본을 사용합니다.
- 공통 홈페이지 스타일·동작: `assets/site.css`, `assets/site.js`
- 약관 페이지 공통 스타일: `assets/legal.css`

다운로드 배지 원본:

- Apple: https://toolbox.marketingtools.apple.com/ja-jp/app-store/us/app/408709785 의 배지 언어 선택 도구
- Google: https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png
- Google: https://play.google.com/intl/en_us/badges/static/images/badges/ja_badge_web_generic.png
