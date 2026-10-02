# 인프라 신규 설정 가이드 — MongoDB Atlas · Cloudflare · Vercel

세브니헤어 사이트를 **고객 계정**으로 새로 세팅하는 순서. 위에서부터 차례로 진행한다.
값(비밀번호·키)은 이 문서나 저장소에 적지 않는다 — Vercel 환경 변수와 로컬 `.env.local` 에만 넣는다.

| 단계 | 필요한 것 | 결과물 (환경 변수) |
|---|---|---|
| 1. MongoDB Atlas | 이메일 계정 | `MONGODB_URI` |
| 2. Cloudflare R2 (이미지 저장소) | Cloudflare 계정 + 결제수단 등록 | `R2_*` 5개 |
| 3. 도메인 (선택) | 도메인 | `NEXT_PUBLIC_SITE_URL` |
| 4. 관리자 로그인 | — | `ADMIN_PASSWORD` · `ADMIN_SECRET` |
| 5. 네이버 지도 | 네이버 클라우드 플랫폼 계정 + 결제수단 | `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` |
| 6. Vercel | 위 값들 | 재배포 |

> 지금 사이트는 `MONGODB_URI` 가 없어도 동작한다 (코드에 들어 있는 기본 콘텐츠로 그린다).
> R2 는 관리자 화면의 이미지 업로드에 쓴다. 설정 전에는 이미지 주소 붙여넣기로 대신할 수 있다.

---

## 1. MongoDB Atlas

### 1-1. 계정과 프로젝트

1. https://cloud.mongodb.com 가입 (고객 이메일)
2. Organization 이름: `sevenyhair` → Project 이름: `sevenyhair`

### 1-2. 클러스터 만들기

1. **Create** → **M0 (Free)**
2. Provider **AWS**, Region **Seoul (ap-northeast-2)** — 목록에 없으면 Tokyo (ap-northeast-1)
   - Vercel 함수가 서울(`icn1`)에서 돌기 때문에 가까울수록 빠르다
3. Cluster 이름: `sevenyhair` (아무거나 상관없다)

### 1-3. DB 사용자

**Security → Database Access → Add New Database User**

- Authentication: Password
- Username: `seveny-app`
- Password: **Autogenerate** 권장. 직접 정한다면 **영문·숫자만** (특수문자는 URI 에서 인코딩이 필요해 실수가 잦다)
- Built-in Role: **Read and write to any database**
  (더 좁히려면 Specific Privileges → `readWrite` @ `seveny`)

### 1-4. 접속 허용 IP

**Security → Network Access → Add IP Address → `0.0.0.0/0` (Allow access from anywhere)**

Vercel 함수는 고정 IP 가 없어서 이렇게 열어야 한다. 대신 1-3 의 비밀번호를 충분히 길게 둔다.

### 1-5. 연결 문자열

**Database → Connect → Drivers** 에서 복사한다.

```
mongodb+srv://seveny-app:<비밀번호>@sevenyhair.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=sevenyhair
```

- `<비밀번호>` 를 실제 값으로 바꾼다
- **URI 에 DB 이름을 붙이지 않아도 된다.** DB 이름은 코드에 `seveny` 로 고정돼 있다 (`src/lib/mongodb.ts`)
- 이 값이 `MONGODB_URI`

### 1-6. 첫 데이터 넣기

로컬 `.env.local` 의 `MONGODB_URI` 를 새 값으로 바꾸고:

```bash
npm run seed
```

`seveny` DB 에 `shop · pages · services · testimonials · staff · instagram` 컬렉션이 생긴다.
Atlas **Browse Collections** 에서 확인. 다시 덮어쓰려면 `npm run seed -- --force`.

### 주의

- **M0 는 오래 안 쓰면 자동 일시정지(Paused)** 된다. 그 상태에서는 접속이 타임아웃만 난다 →
  Atlas 에서 **Resume**. 사이트는 DB 가 죽어도 기본 콘텐츠로 그려지고, Vercel 로그에 `[db]` 줄이 남는다.
- 운영이 안정되면 M10 이상(유료)으로 올리면 일시정지가 없다.

---

## 2. Cloudflare R2 (이미지 저장소)

### 2-1. R2 켜기

1. https://dash.cloudflare.com 가입 (고객 이메일)
2. 왼쪽 **R2 Object Storage** → **Purchase R2 Plan** (무료 한도 10GB/월 저장, 요청 수 무료 구간 있음 —
   결제수단 등록만 필요하고 한도 안에선 청구되지 않는다)
3. 오른쪽에 보이는 **Account ID** 를 적어 둔다 → `R2_ACCOUNT_ID`

### 2-2. 버킷

**Create bucket**

- 이름: `sevenyhair`
- Location: Automatic (또는 Asia-Pacific 힌트)
- Storage class: Standard

→ `R2_BUCKET_NAME=sevenyhair`

### 2-3. 공개 주소

사이트에서 이미지를 보여주려면 공개 읽기 주소가 필요하다. 둘 중 하나.

| 방법 | 설정 | `R2_PUBLIC_BASE_URL` |
|---|---|---|
| **A. r2.dev (바로 됨)** | 버킷 → Settings → **Public Development URL → Allow** | `https://pub-xxxxxxxx.r2.dev` |
| **B. 내 도메인 (권장, 3단계 이후)** | 버킷 → Settings → **Custom Domains → Connect Domain** → `img.도메인` | `https://img.도메인` |

r2.dev 는 Cloudflare 가 "개발용" 이라고 표시하고 속도 제한이 있다. 도메인이 생기면 B 로 바꾼다.
끝에 `/` 를 붙이지 않는다.

### 2-4. API 토큰 (서버가 업로드할 때 쓰는 키)

**R2 → Manage R2 API Tokens → Create API Token**

- Token name: `sevenyhair-app`
- Permissions: **Object Read & Write**
- Specify bucket(s): **`sevenyhair` 만**
- TTL: Forever

만들면 **한 번만** 보여준다 — 바로 복사한다.

| 화면 항목 | 환경 변수 |
|---|---|
| Access Key ID | `R2_ACCESS_KEY_ID` |
| Secret Access Key | `R2_SECRET_ACCESS_KEY` |

> 이 토큰으로는 CORS 를 설정할 수 없다 (`AccessDenied`). CORS 는 대시보드에서 넣는다.

### 2-5. CORS (브라우저에서 R2 로 직접 올릴 때만)

관리자 이미지 업로드는 브라우저가 R2 로 **직접** 올린다(사전 서명 URL). 그래서 **반드시 필요하다.**
버킷 → Settings → **CORS Policy → Add**:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3040", "https://www.sevenyhair.com", "https://sevenyhair.com"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 3. 도메인 (선택) — Cloudflare DNS + Vercel

도메인을 Cloudflare 에서 사거나, 다른 곳에서 산 도메인의 네임서버를 Cloudflare 로 옮긴 경우.

1. **Vercel** → 프로젝트 → Settings → **Domains → Add** → `도메인` 과 `www.도메인`
2. Vercel 화면에 나오는 레코드를 **Cloudflare → DNS → Records** 에 그대로 넣는다
   - 보통 `@` → **A** 레코드, `www` → **CNAME** 레코드 (값은 Vercel 화면에 표시된 것을 쓴다)
   - **Proxy status 는 "DNS only"(회색 구름)** 로 둔다. 주황 구름(프록시)이면 Vercel 인증서 발급·리다이렉트가 꼬인다
3. Vercel 에서 Valid Configuration 이 뜨면 끝
4. `NEXT_PUBLIC_SITE_URL=https://도메인` (sitemap · 공유 이미지 · canonical 주소가 이 값을 쓴다)

---

## 4. 관리자 로그인 (/admin)

1. 비밀번호를 정한다 — 12자 이상, 다른 곳에서 쓰지 않는 것
2. 서명용 비밀값을 만든다 (32바이트 무작위):
   ```bash
   node -e "console.log(require(crypto).randomBytes(32).toString(hex))"
   ```
3. Vercel 에 `ADMIN_PASSWORD` · `ADMIN_SECRET` 으로 넣고 재배포 → `https://도메인/admin`

- 로그인은 7일 유지된다. **`ADMIN_SECRET` 을 바꾸면 모든 기기에서 로그아웃**된다 (비밀번호가 새었을 때 쓰는 방법)
- 둘 중 하나라도 비면 로그인 화면에 무엇이 빠졌는지 표시된다

---

## 5. 네이버 지도 — 네이버 클라우드 플랫폼(NCP)

> 네이버 **디벨로퍼스(developers.naver.com)가 아니다.** 지도 API 는 2020년부터 **네이버 클라우드 플랫폼** 으로 옮겨졌다.
> 코드는 신규 키 방식(`ncpKeyId`)을 쓴다.

1. https://www.ncloud.com 가입 → 콘솔 로그인 → **결제수단 등록** (무료 이용량이 있고, 그 안에서는 청구되지 않는다. 요금은 콘솔 Maps 요금 안내에서 확인)
2. 콘솔 → **Services → Application Services → Maps** → **Application 등록**
   - Application 이름: `sevenyhair`
   - Service 선택: **Dynamic Map** 체크 (지도 표시용. 나머지는 필요 없다)
   - **서비스 환경 등록 → Web 서비스 URL** 에 아래를 모두 넣는다 (여기 없는 주소에서는 지도가 인증 실패로 안 뜬다)
     ```
     https://www.sevenyhair.com
     https://sevenyhair.com
     http://localhost:3040
     ```
     Vercel 미리보기 주소(`*.vercel.app`)에서도 보려면 그 주소도 추가
3. 등록한 Application → **인증 정보** → **Client ID** 복사 → `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
4. Vercel 에 넣고 **재배포** (`NEXT_PUBLIC_` 값은 빌드 때 들어간다)

- 지도는 Contact 페이지 아래 **Location** 섹션에 나온다. 좌표·확대 수준은 **관리자 → 매장 정보 → 주소·지도** 에서 바꾼다
- 키가 없거나 인증에 실패하면 지도 대신 "네이버 지도에서 보기" 링크만 보인다 (사이트가 깨지지 않는다)

---

## 6. Vercel 환경 변수

**Vercel → 프로젝트 → Settings → Environment Variables** (Production · Preview 둘 다 체크)

| 이름 | 값 | 지금 필요? |
|---|---|---|
| `MONGODB_URI` | 1-5 | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://www.sevenyhair.com` | ✅ (sitemap · 공유 이미지 · canonical) |
| `ADMIN_PASSWORD` | 4 | ✅ 관리자 로그인 |
| `ADMIN_SECRET` | 4 | ✅ 관리자 로그인 |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 5 | 지도 |
| `R2_ACCOUNT_ID` | 2-1 | 관리자 이미지 업로드 |
| `R2_ACCESS_KEY_ID` | 2-4 | 〃 |
| `R2_SECRET_ACCESS_KEY` | 2-4 | 〃 |
| `R2_BUCKET_NAME` | `sevenyhair` | 〃 |
| `R2_PUBLIC_BASE_URL` | 2-3 | 〃 |

환경 변수를 바꾼 뒤에는 **Deployments → 최신 배포 → Redeploy** 해야 반영된다.

> 하나가 비면 나머지도 의심한다 — Ignite 이관 때 "데이터가 안 보인다"의 원인이
> 환경 변수가 통째로 비어 있던 것이었다.

---

## 7. 끝나고 확인

- [ ] Atlas Browse Collections 에 `seveny` DB 와 컬렉션 6개
- [ ] 운영 사이트 홈·Services 가 정상 (DB 에서 읽는다)
- [ ] Vercel → Logs 에 `[db]` 실패 줄이 없다
- [ ] (도메인) `https://도메인/sitemap.xml` 의 주소가 도메인으로 나온다
- [ ] (R2) 관리자 → 미디어 에서 이미지를 올려 보고, 그 주소가 열린다
- [ ] (R2 CORS) 업로드가 "R2 업로드 실패" 로 끝나면 2-5 의 CORS 에 `https://www.sevenyhair.com` 이 있는지
- [ ] `/admin` 로그인 → 대시보드 "설정 점검" 이 전부 초록색
- [ ] Contact 페이지 아래 지도가 뜬다
