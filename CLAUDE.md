# seveny hair

헤어샵 seveny hair 웹사이트. 지금은 Webflow 사이트 "Laurence. das Haarlokal"
(https://laurence-dashaarlokal.webflow.io/) 의 디자인·움직임을 클론한 단계다.
콘텐츠는 이후 네이버 플레이스(https://m.place.naver.com/hairshop/1767344271/home) 자료로 바꾼다.

저장소: https://github.com/sevenyhair/sevenyhair (고객 계정, 2026-10-02 이관. 이전 2xteam/seveny-hair 는 보관용)
인프라(MongoDB Atlas · Cloudflare R2 · 도메인 · Vercel) 신규 설정 순서 → `docs/setup-infra.md`

배경 지식은 옵시디언 볼트 `C:\Dev\my-obsidian-vault` 의 `10-Projects/Seveny Hair.md` 에 있다.
스택과 패턴은 Ignite(`C:\Dev\ignite`) 를 따른다. MyJane 패밀리와 회원·세션을 공유하지 않는다.

## 실행

```bash
npm run dev      # http://localhost:3040
npm run seed     # 기본 콘텐츠를 DB 에 넣기 (--force 로 덮어쓰기)
npm run ig -- list | add <url> [title] | pin <code> | hide <code> | remove <code>
```

## 구조

| 경로 | 내용 |
|---|---|
| `src/app/globals.css` | 원본 Webflow CSS 를 클래스 단위로 옮긴 것 (공통·홈) |
| `src/app/subpages.css` | 하위 페이지 CSS |
| `src/components/Preloader.tsx` | 흰 덮개가 왼→오로 걷히는 인트로 (IX2 a-2/a-3) |
| `src/components/SiteNav.tsx` | 좌측 내비·누운 타이틀·전체화면 메뉴 (a-10/a-31), ≤991 상단바 |
| `src/components/ScrollEffects.tsx` | 스크롤 등장(a-4/5/6/8/9) · 떠 있는 이미지 패럴랙스(a-12, smoothing 50) |
| `src/content/defaults.ts`, `pages.ts` | 기본 콘텐츠(영어) = 시드 원본 |
| `src/content/photos.ts`, `styles.ts` | 네이버 플레이스 업체 사진 22장 · 스타일 26개 (링크) |
| `src/content/instagram.ts` | 인스타 게시물 코드 24개 (초기 피드) |
| `src/app/api/ig/[code]` | 인스타 이미지 프록시 — CDN 이 CORP same-origin 이라 직접 링크 불가 |
| `src/components/Logo.tsx` | SEV/ENY/HAIR. 로고 (인라인 SVG, S 가 테두리에 잘림) |
| `src/lib/queries.ts` | DB 먼저, 실패·빈 값이면 기본 콘텐츠 (실패는 `[db]` 로그) |

## 규칙

- **DB 이름은 코드 상수 `seveny`** (`src/lib/mongodb.ts`). 환경 변수로 받지 않는다.
- `MONGODB_URI` 는 고객의 새 Atlas 로 옮기는 중이다 (`docs/setup-infra.md`). 로컬 `.env.local` 은 아직 myjane 클러스터 값일 수 있다.
- 움직임 수치(지속시간·지연·이동거리·easing)는 원본 IX2 데이터에서 그대로 가져왔다.
  바꿀 때는 각 컴포넌트 주석의 원본 값과 비교한다.
- 사진은 네이버 플레이스(pstatic) 원본을 링크한다. 리뷰(고객) 사진은 쓰지 않는다. R2 이전은 `photos.ts` 만 바꾸면 된다.
- UI 문구는 영어. 단 메뉴 버튼의 "Menü" 는 디자인 포인트라 남긴다.
- 인스타 피드는 수동 등록만 한다 (`npm run ig`). 자동 수집 코드는 2026-10-02 결정으로 지웠다.
- 후기는 개별 리뷰 문장이 아니라 네이버 리뷰 키워드 집계다 (가짜 후기 금지).
- 폰트: futura-pt → Jost, bodoni-urw → Bodoni Moda, p22-cezanne-pro → Pinyon Script (무료 대체).
- mongoose 모델에 제네릭 타입 인자를 주지 않는다 — tsc 가 메모리 부족으로 죽는다.
