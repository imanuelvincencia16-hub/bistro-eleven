const src = (slug, query) =>
  !slug ? "" : /^(https?:|data:)/i.test(slug) ? slug : `https://images.unsplash.com/photo-${slug}?${query}`;

export const pic = (slug, w, h) => src(slug, `w=${w}&h=${h}&fit=crop&q=80&auto=format`);

export const fullPic = slug => src(slug, "w=1600&q=85&auto=format");

export const CARD = [640, 480];
export const WIDE = [1200, 720];
export const BANNER = [900, 600];

export const cardPic = slug => pic(slug, ...CARD);
export const widePic = slug => pic(slug, ...WIDE);
export const thumbPic = slug => pic(slug, 168, 148);

const SCATTER = [[600, 800], [700, 700], [640, 800], [1000, 625], [1000, 625]];
export const scatterPic = (slug, i) => {
  const [w, h] = SCATTER[i] || SCATTER[SCATTER.length - 1];
  return pic(slug, w, h);
};

const A = {
  s1: ["1476224203421-9ac39bcb3327", "1578172397201-efaa902004a3", "1786502870203-6fa112102b43"],
  s2: ["1512621776951-a57141f2eefd", "1547496502-affa22d38842", "1543339308-43e59d6b73a6"],
  s3: ["1540189549336-e6e99c3679fe", "1498048615146-6a435b1e65a4", "1625536059909-84924b9899ea"],
  s4: ["1547592166-23ac45744acd", "1643786661490-966f1877effa", "1613744013720-4f505ce31735"],
  s5: ["1621996346565-e3dbc646d9a9", "1709984110217-57d7d18e5299", "1636425730695-febe95eda12e"],
  m1: ["1504674900247-0877df9cc836", "1588168333986-5078d3ae3976", "1600891964092-4316c288032e"],
  m2: ["1519708227418-c8fd9a32b7a2", "1539136788836-5699e78bfc75", "1580476262798-bddd9f4b7369"],
  m3: ["1568901346375-23c9450c58cd", "1572802419224-296b0aeee0d9", "1586190848861-99aa4a171e90"],
  m4: ["1551782450-a2132b4ba21d", "1644882725268-30f1cd6c36ca", "1655463485347-f3dd84fead5b"],
  m5: ["1414235077428-338989a2e8c0", "1663530761401-15eefb544889", "1643879397174-4f10ac503566"],
  p1: ["1565299624946-b28f40a0ae38", "1652952561151-97e82f26c336", "1597715469889-dd75fe4a1765"],
  p2: ["1473093295043-cdd812d0e601", "1598866594230-a7c12756260f", "1612966893103-790e549a2ab1"],
  p3: ["1553621042-f6e147245754", "1724116382185-e36a6b5e4e52", "1630151317550-db97d275ce2d"],
  d1: ["1578985545062-69928b1d9587", "1517427294546-5aa121f68e8a", "1700448293876-07dca826c161"],
  d2: ["1565958011703-44f9829ba187", "1557925923-33b27f891f88", "1615735487485-e52b9af610c1"],
  d3: ["1488477181946-6428a0291777", "1622622008494-60c9e6b41996", "1613505411792-208b15f862b0"],
  d4: ["1551024601-bec78aea704b", "1646615077267-97c6088b74d9", "1626094309830-abbb0c99da4a"],
  d5: ["1563729784474-d77dbb933a9e", "1603532553059-3facb851d937", "1713759980319-8199058cef6b"],
  b1: ["1509440159596-0249088772ff", "1559811814-e2c57b5e69df", "1590301157172-7ba48dd1c2b2"],
  b2: ["1555507036-ab1f4038808a", "1623334044303-241021148842", "1691480162735-9b91238080f6"],
  k1: ["1442512595331-e89e73853f31", "1495862433577-132cf20d7902", "1587955245893-389f2215c6eb"],
  k2: ["1509042239860-f550ce710b93", "1593443320739-77f74939d0da", "1507133750040-4a8f57021571"],
  k3: ["1495474472287-4d71bcdd2085", "1664192578370-0cd2b291c4cd", "1664192579012-1e98c2ddd779"],
  k4: ["1497534446932-c925b458314e", "1650092071863-b47da0c0065b", "1622921230612-4fc42e43f9e4"]
};

export const ANGLES = A;

export const AMBIENCE = {
  bar: "1543007630-9710e4a00a20",
  room: "1517248135467-4c7edcad34c4",
  service: "1414235077428-338989a2e8c0",
  brew: "1442512595331-e89e73853f31",
  bake: "1509440159596-0249088772ff"
};

export const GALLERY = [
  { slug: AMBIENCE.bar, cap: "The amber bar, 21:40", cap_id: "Bar kekuningan, 21.40" },
  { slug: AMBIENCE.room, cap: "Eleven seats and a long counter", cap_id: "Sebelas kursi dan bar yang panjang" },
  { slug: AMBIENCE.service, cap: "Service, second sitting", cap_id: "Layanan, giliran duduk kedua" },
  { slug: AMBIENCE.brew, cap: "Morning brew before doors", cap_id: "Seduhan pagi sebelum pintu dibuka" },
  { slug: AMBIENCE.bake, cap: "Bake at six, sharp", cap_id: "Panggang pukul enam tepat" }
];
