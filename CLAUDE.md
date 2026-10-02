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
| `src/content/defaults.ts`, `pages.ts` | 기본 콘텐츠 = 시드 원본. 페이지마다 히어로 + 블록 목록(`sections`), 공통 블록 `sharedBlocks` |
| `src/content/blocks.ts` | 블록 종류 13개 (이름·설명·그룹·새 블록 기본값) · 사이트 페이지 목록 |
| `src/components/blocks/` | `SitePage`(페이지별 히어로 + 블록 + 푸터) · `PageBlocks`(블록 렌더러). 공개 6개 라우트와 `/preview` 가 같이 쓴다 |
| `src/components/admin/blocks/` | 관리자 페이지 메뉴 = 히어로 · 블록(추가·끌어서 순서·숨기기) · 연결 목록 편집 · SEO 탭 |
| `src/content/photos.ts`, `styles.ts` | 네이버 플레이스 업체 사진 22장 · 스타일 26개 (링크) |
| `src/content/instagram.ts` | 인스타 게시물 코드 24개 (초기 피드) |
| `src/app/api/ig/[code]` | 인스타 이미지 프록시 — CDN 이 CORP same-origin 이라 직접 링크 불가 |
| `src/components/Logo.tsx` | SEV/ENY/HAIR. 로고 (인라인 SVG, S 가 테두리에 잘림) |
| `src/lib/queries.ts` | DB 먼저, 실패·빈 값이면 기본 콘텐츠 (실패는 `[db]` 로그) |
| `src/app/(site)/` | 공개 페이지 (라우트 그룹 — 사이트 CSS·장식은 여기 레이아웃에만) |
| `src/app/admin/` | 관리자. `(panel)` 은 로그인 후 화면, `login` 은 밖. 메뉴는 페이지별(`pages/[slug]`) + 공통(매장 정보 · 커스텀 페이지 · 미디어). 옛 메뉴 주소는 해당 블록으로 redirect |
| `src/middleware.ts` · `src/lib/admin/session.ts` | `/admin` · `/api/admin` 보호. 토큰 = payload(iat·exp) + HMAC (Web Crypto) |
| `src/lib/admin/actions.ts` | 모든 저장(서버 액션). 시작마다 `requireAdmin()` |
| `src/lib/r2.ts` · `api/admin/upload/sign` | R2 사전 서명 직접 업로드 (체크섬 WHEN_REQUIRED · 리사이즈 후 크기로 서명) |
| `src/components/NaverMap.tsx` | 네이버 지도 (NCP `ncpKeyId`) — Contact 의 Location |

## 규칙

- **페이지 = 히어로(모양 고정) + 블록 목록.** 블록은 지금 사이트에 있던 구역만 쓴다 (새 디자인 블록 없음).
  - 내용 블록: 내용이 블록 안에. 공통 블록(values · cta): 내용 한 벌(`blocks` 컬렉션), 어느 페이지에서 고쳐도 전부 반영.
  - 목록 연결 블록(가격표 · 후기 · 인스타 · 스타일북 · 원장): 내용은 각 컬렉션, 블록은 자리·제목만.
  - 섹션은 통째로 저장한다 (필드를 골라 담지 않는다 — 새 필드가 저장 때 사라짐). `savePageBlocks` 가 key 중복·종류만 검사.
  - 옛 구조 DB 문서(`version` 없음)는 `upgradePage` 가 읽을 때 변환한다. 관리자에서 저장하면 version 2.
  - 블록 마크업은 바꾸기 전 페이지 코드 그대로. 바꾸면 운영과 섹션 클래스 순서·이미지 수·본문을 비교한다.

- **사이트 CSS 는 `(site)/layout.tsx` 에서만 불러온다.** 루트에 두면 h1·p·a 기본 스타일이 관리자 화면을 망가뜨린다.
- 관리자 화면은 Tailwind + `admin.css`(`.admin-root` 안에서만 초기화). 아이콘은 lucide-react — 브랜드 아이콘(Instagram)은 없어서 `Icons.tsx` 것을 쓴다.
- 매장 정보(`getShop`)는 DB 값 위에 기본값을 깔아 반환한다 — 나중에 추가한 필드(map 등)가 옛 DB 문서에 없어도 동작.
- 관리자 저장은 운영 DB 에 바로 쓴다. 로컬에서 시험할 땐 비공개 커스텀 페이지처럼 사이트에 안 보이는 것으로 하고 지운다.

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
