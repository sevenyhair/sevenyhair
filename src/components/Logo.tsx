/**
 * SEVENY 로고 — 원본 "LAU/REN/CE." 로고처럼 테두리 안에 글자를 쌓되, 두 줄(SEV / ENY)로 줄여
 * 정사각에 가까운 형태로 만들었다. 글자는 가운데 정렬.
 *
 * 포인트: S 에서 N 쪽으로 내려가는 가는 대각선 띠가 글자를 도려낸다.
 * 지나가는 길에 E 의 오른쪽 위가 살짝 잘린다. 흰색으로 덧칠하지 않고 mask 로 비워서,
 * 어두운 사진 위의 흰 로고(hero)에서도 같은 모양이 된다. 테두리는 자르지 않는다.
 *
 * 인라인 SVG 라서 페이지 웹폰트(Bodoni Moda)를 그대로 쓴다. textLength 로 줄 너비를 고정한다.
 * 글꼴은 이름으로 직접 쓴다 — var(--font-bodoni) 는 사이트 CSS 에만 있어서, 관리자 화면에선 font-family 전체가
 * 무효가 되고 관리자 글꼴로 그려졌다. 웹폰트 링크는 루트 레이아웃에 있어 양쪽 다 받는다.
 *
 * variant
 *  - "mark" : 내비·로딩용 검정 로고
 *  - "hero" : 히어로용 흰 로고 + 아래 테두리를 가로지르는 손글씨 "hair salon"
 */
type Props = {
  variant?: "mark" | "hero";
  className?: string;
  title?: string;
  /** 한 화면에 같은 로고가 여러 번 있을 때 mask id 가 겹치지 않게 (숨겨진 쪽 mask 를 참조하면 글자가 안 잘린다) */
  idSuffix?: string;
};

// 대각선 띠: S 왼쪽 위 → N 왼쪽 아래. N 의 굵은 대각선과 방향이 비슷해서, 끝점을 오른쪽(74)에 두면
// 그 획이 통째로 지워진다 → 62 로 두어 N 의 왼쪽 아래만 살짝 자른다 (2026-10-02)
const BAND = { x1: 13, y1: 4, x2: 62, y2: 112, width: 4 };

export default function Logo({ variant = "mark", className, title = "SEVENY", idSuffix = "" }: Props) {
  const hero = variant === "hero";
  const color = hero ? "#fff" : "#111";
  const maskId = (hero ? "logo-band-hero" : "logo-band-mark") + idSuffix;
  const H = hero ? 134 : 120;

  return (
    <svg className={className} viewBox={`0 0 120 ${H}`} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height={H}>
          <rect x="0" y="0" width="120" height={H} fill="#fff" />
          <line
            x1={BAND.x1}
            y1={BAND.y1}
            x2={BAND.x2}
            y2={BAND.y2}
            stroke="#000"
            strokeWidth={BAND.width}
            strokeLinecap="butt"
          />
        </mask>
      </defs>

      {hero ? (
        // 아래 테두리 가운데를 비워 손글씨가 선을 가로지르게 한다
        <path d="M30 116.5 H5.5 V5.5 H114.5 V116.5 H90" fill="none" stroke={color} strokeWidth="3" />
      ) : (
        <rect x="5.5" y="5.5" width="109" height="111" fill="none" stroke={color} strokeWidth="3" />
      )}

      <g
        mask={`url(#${maskId})`}
        fill={color}
        textAnchor="middle"
        style={{ fontFamily: "'Bodoni Moda', Didot, serif", fontWeight: 400 }}
      >
        <text x="60" y="56" fontSize="48" textLength="86" lengthAdjust="spacingAndGlyphs">
          SEV
        </text>
        <text x="60" y="102" fontSize="48" textLength="86" lengthAdjust="spacingAndGlyphs">
          ENY
        </text>
      </g>

      {hero && (
        <text
          x="60"
          y="127"
          textAnchor="middle"
          fill={color}
          fontSize="21"
          style={{ fontFamily: "'Pinyon Script', cursive" }}
        >
          hair salon
        </text>
      )}
    </svg>
  );
}
