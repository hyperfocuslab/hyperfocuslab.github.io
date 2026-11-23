# hyperfocuslab.app

Hyperfocus Lab 회사 홈페이지. Astro로 만들고 `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 GitHub Pages로 배포한다. 도메인은 `public/CNAME`.

## 제품 페이지

| 제품 | 경로 | 언어 |
|---|---|---|
| 피클리(Peakly) | `/peakly/`, `/<lang>/peakly/` (+ support, privacy, terms) | ko · en · ja · zh-Hant |
| Sheltie | `/sheltie/`, `/<lang>/sheltie/` (+ support, privacy) | ko · en · ja · zh-Hant |
| 코카투(Cockatoo) | `/cockatoo/`, `/<lang>/cockatoo/` (+ support, privacy) | ko · en · ja · zh-Hant · de · es · fr · pt-BR |
| 하루박스(Harubox) | `/harubox/`, `/<lang>/harubox/` (+ support, privacy) | ko · en · ja · zh-Hant · de · es · fr · pt-BR |
| DEAD DISTRICT | `/dead-district/` (`hyperfocuslab/dead-district` 저장소의 Pages) | |

홈은 `/`(영어), `/ko/`, `/ja/`, `/zh-Hant/`.

## 파일

- `src/i18n.ts`: 홈과 제품 페이지 문구, 스토어 링크
- `src/data/docs/`: 고객지원·개인정보 처리방침·약관 본문(`<문서>.<언어>.html`)과 제목(`.json`)
- `public/assets/`: 앱 캡처, 아이콘, 링크 미리보기 카드(`og-*.png`)
- `public/app-ads.txt`: AdMob 검증 파일
- `DESIGN.md`: 사이트 디자인 결정

## 명령

```sh
npm install
npm run dev
npm run build
```
