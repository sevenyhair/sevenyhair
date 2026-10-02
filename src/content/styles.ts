/**
 * 네이버 플레이스 "스타일 정보" (업체 등록, 26개 · 2026-10-02 수집).
 * title/category 는 네이버 원문(한글), titleEn 은 영어 표기가 필요할 때 쓴다.
 * gender 는 원문 값에 "남성…" 제목을 m 으로 바로잡았다.
 */
export type Style = {
  num: string;
  title: string;
  category: string;
  titleEn: string;
  gender: "f" | "m";
  images: { src: string; w: number; h: number }[];
  order: number;
};

export const styles: Style[] = [
  {
    "num": "17754333",
    "title": "핑크바이올렛 투톤",
    "category": "투톤",
    "titleEn": "Pink-violet two-tone",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/00E5FB81-0F75-40F4-86BE-9401733FE150-97854f87.jpg",
        "w": 1440,
        "h": 1552
      }
    ],
    "order": 1
  },
  {
    "num": "17754334",
    "title": "S컬펌",
    "category": "S컬펌 · 디지털펌",
    "titleEn": "S-curl perm",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_5608-4575a1b8.jpg",
        "w": 1170,
        "h": 1844
      }
    ],
    "order": 2
  },
  {
    "num": "17754335",
    "title": "플라워펌",
    "category": "물결펌(플라워펌) · 히피펌(젤리펌)",
    "titleEn": "Flower perm",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/ABE6EB64-3F50-47A2-A48B-414936F22F84-553b26ea.jpg",
        "w": 2697,
        "h": 3371
      }
    ],
    "order": 3
  },
  {
    "num": "1233663",
    "title": "매직셋팅",
    "category": "매직셋팅 · C컬펌",
    "titleEn": "Magic setting",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/XGSIrRTCgxqWxbY2EhV1VR_v_jpeg-37f70550.jpg",
        "w": 900,
        "h": 1124
      }
    ],
    "order": 4
  },
  {
    "num": "17754336",
    "title": "다양한 컬러염색",
    "category": "투톤 · 탈색",
    "titleEn": "Creative color",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/1F1B9A8E-36D3-4CC3-9050-C809A1EFBB61-c8c7d98d.jpg",
        "w": 1440,
        "h": 1637
      }
    ],
    "order": 5
  },
  {
    "num": "17754337",
    "title": "오렌지 브라운 투톤",
    "category": "오렌지브라운 · 투톤",
    "titleEn": "Orange-brown two-tone",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/C45E7053-1342-47D6-B6D0-5517B784F6E6-6dc77fa2.jpg",
        "w": 1440,
        "h": 1631
      }
    ],
    "order": 6
  },
  {
    "num": "1453462",
    "title": "레드그라데이션",
    "category": "레드바이올렛 · 옴브레(그라데이션)",
    "titleEn": "Red gradation",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/ZichiAqNDeXqFAtP11EZrDLr_jpeg-67e1bb39.jpg",
        "w": 1440,
        "h": 1725
      },
      {
        "src": "https://img.sevenyhair.com/site/iok1A1Jsg7iJTzW7td2Zr4rc_jpeg-921355dd.jpg",
        "w": 1440,
        "h": 1735
      }
    ],
    "order": 7
  },
  {
    "num": "17754338",
    "title": "바이올렛 투톤",
    "category": "투톤 · 애쉬바이올렛",
    "titleEn": "Violet two-tone",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/FF079501-8C07-4DB7-9BA8-1095AD92E65D-9d29170c.jpg",
        "w": 2535,
        "h": 2706
      }
    ],
    "order": 8
  },
  {
    "num": "17754339",
    "title": "애쉬그레이",
    "category": "애쉬그레이 · 탈색",
    "titleEn": "Ash grey",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/14CBA5EB-06B7-4E38-9F11-F10D7F5372A5-0375e617.jpg",
        "w": 1440,
        "h": 1531
      },
      {
        "src": "https://img.sevenyhair.com/site/0A9360E5-80B7-4443-9CBD-26081776E41A-d150d612.jpg",
        "w": 1440,
        "h": 1526
      }
    ],
    "order": 9
  },
  {
    "num": "1142544",
    "title": "블론드",
    "category": "탈색 · 블론드",
    "titleEn": "Blonde",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/_1SJpvWO1wpkvIBM2I4WTUrc_jpeg-ec0d2fea.jpg",
        "w": 900,
        "h": 1024
      }
    ],
    "order": 10
  },
  {
    "num": "1233665",
    "title": "카키브라운",
    "category": "애쉬카키브라운 · 카키브라운",
    "titleEn": "Khaki brown",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/etqKESBt0CLR4LfzdIwV1Eil_jpeg-c535e99e.jpg",
        "w": 1440,
        "h": 1440
      }
    ],
    "order": 11
  },
  {
    "num": "1142557",
    "title": "매트브라운",
    "category": "매트브라운 · 밀크브라운",
    "titleEn": "Matte brown",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/j8DwJ3cOc8nrRLgUCfC5q4s4_jpeg-7c5bf719.jpg",
        "w": 1024,
        "h": 1280
      }
    ],
    "order": 12
  },
  {
    "num": "17754343",
    "title": "허쉬컷",
    "category": "허쉬컷",
    "titleEn": "Hush cut",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_8888-69abc57c.jpg",
        "w": 1170,
        "h": 1391
      }
    ],
    "order": 13
  },
  {
    "num": "17754344",
    "title": "보브컷",
    "category": "보브컷",
    "titleEn": "Bob cut",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/A7DB0736-5956-4321-888A-0B95A6BD0EBA-04aefe71.jpg",
        "w": 1440,
        "h": 1529
      }
    ],
    "order": 14
  },
  {
    "num": "17754345",
    "title": "히피펌",
    "category": "히피펌(젤리펌) · 디지털펌",
    "titleEn": "Hippie perm",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/EB055098-E424-4E87-BCA0-3515786958C2-bdfbe62f.jpg",
        "w": 1440,
        "h": 1440
      }
    ],
    "order": 15
  },
  {
    "num": "100169452",
    "title": "히피해피",
    "category": "히피펌(젤리펌) · 일자컷",
    "titleEn": "Hippie happy",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_9631-aa7482d3.jpg",
        "w": 1170,
        "h": 1316
      }
    ],
    "order": 16
  },
  {
    "num": "100169397",
    "title": "짜파게티 히피펌",
    "category": "히피펌(젤리펌) · 구름펌",
    "titleEn": "Noodle hippie perm",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_9496-609e7893.jpg",
        "w": 2426,
        "h": 3689
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_9495-6d8a7106.jpg",
        "w": 3024,
        "h": 4032
      }
    ],
    "order": 17
  },
  {
    "num": "100169398",
    "title": "라면 히피",
    "category": "히피펌(젤리펌) · 구름펌",
    "titleEn": "Ramen hippie",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_9621-992c03f3.jpg",
        "w": 953,
        "h": 1537
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_9618-4d08df9a.jpg",
        "w": 2067,
        "h": 3362
      }
    ],
    "order": 18
  },
  {
    "num": "1233666",
    "title": "신데렐라 클리닉",
    "category": "클리닉",
    "titleEn": "Cinderella clinic",
    "gender": "f",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/ZiDEC2UwZrYk7ToSjgRvd3sx_jpeg-6c4517a3.jpg",
        "w": 1536,
        "h": 2048
      }
    ],
    "order": 19
  },
  {
    "num": "17781921",
    "title": "남성 리프컷 / 펌",
    "category": "남성 커트 · 펌",
    "titleEn": "Men’s leaf cut / perm",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_7517-4dd98c69.jpg",
        "w": 1170,
        "h": 1704
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_7518-bfebe82a.jpg",
        "w": 1170,
        "h": 1814
      }
    ],
    "order": 20
  },
  {
    "num": "17781920",
    "title": "남성 시스루컷 / 펌",
    "category": "남성 커트 · 펌",
    "titleEn": "Men’s see-through cut / perm",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_6983-810c7b58.jpg",
        "w": 1170,
        "h": 1539
      }
    ],
    "order": 21
  },
  {
    "num": "17781922",
    "title": "남성 드랍컷 / 펌",
    "category": "다운펌",
    "titleEn": "Men’s drop cut / perm",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_6239-df5bf618.jpg",
        "w": 1130,
        "h": 1525
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_6237-fccd1f40.jpg",
        "w": 1130,
        "h": 1605
      }
    ],
    "order": 22
  },
  {
    "num": "100169450",
    "title": "나의오렌지나무",
    "category": "레드오렌지 · 탈색",
    "titleEn": "Orange tree",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_5643-5d30e51f.jpg",
        "w": 1836,
        "h": 2448
      }
    ],
    "order": 23
  },
  {
    "num": "100169451",
    "title": "탈색 그리고 용달블루와 딥다크블루",
    "category": "탈색 · 애쉬블루",
    "titleEn": "Blues, light & deep",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_3435-d73a4b17.jpg",
        "w": 1534,
        "h": 2448
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_3429-8220b7c9.jpg",
        "w": 2623,
        "h": 4029
      },
      {
        "src": "https://img.sevenyhair.com/site/IMG_4901-d4563b73.jpg",
        "w": 1836,
        "h": 2448
      }
    ],
    "order": 24
  },
  {
    "num": "100169453",
    "title": "다운펌과 댄디 그 사이",
    "category": "시스루펌 · 다운펌",
    "titleEn": "Between down perm & dandy",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_4394-20886a0a.jpg",
        "w": 1280,
        "h": 2158
      }
    ],
    "order": 25
  },
  {
    "num": "100169454",
    "title": "남자 시스루루루~히피",
    "category": "스핀스왈로펌 · 스왈로펌",
    "titleEn": "See-through hippie",
    "gender": "m",
    "images": [
      {
        "src": "https://img.sevenyhair.com/site/IMG_9632-10fbb207.jpg",
        "w": 1170,
        "h": 1207
      }
    ],
    "order": 26
  }
];
