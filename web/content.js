// Editorial content for Bunai: everything a visitor reads that is not museum metadata.
// Kept apart from app.js so it can be fact-checked and rewritten without touching code.

export const CRAFTS = {
  "Painted & dyed cotton": {
    hi: "क़लमकारी", roman: "kalamkari",
    what: "Cotton drawn by hand with a bamboo pen (kalam), then dyed. The colour comes from chemistry, not paint: the artist draws with mordants, metal salts that make dye bite only where they touch.",
    look: "Flowing, drawn lines; reds and blues that sit inside the fibre; white grounds that were protected with wax.",
  },
  "Block print": {
    hi: "छपाई", roman: "chhapai",
    what: "Pattern stamped with carved wooden blocks, one block per colour. The same mordant-and-resist chemistry as painted cotton, made repeatable.",
    look: "Small motifs that repeat exactly; tiny misalignments where one block met the next.",
  },
  "Brocade & metal thread": {
    hi: "ज़री", roman: "zari",
    what: "Silk woven with extra pattern threads, often zari: a silk core wrapped in flattened silver or gilt-silver wire. The richest kind, kinkhab, was court cloth.",
    look: "Pattern that is part of the weave, not applied on top; a metallic glint, often tarnished grey with age.",
  },
  "Embroidery": {
    hi: "कढ़ाई", roman: "kadhai",
    what: "Pattern stitched onto finished cloth. Gujarat's professional embroiderers worked fine chain stitch with a hook; other traditions were household arts passed between women.",
    look: "Thread sitting proud of the surface; the reverse shows the stitches' path.",
  },
  "Kashmir shawl weave": {
    hi: "कानी", roman: "kani",
    what: "Twill tapestry woven from pashmina, the under-fleece of Himalayan goats. Each colour area is woven with its own small bobbin (kani); a complex shawl could take two weavers a year or more.",
    look: "Dense curling plant forms; the curved, tear-shaped buta that Europe renamed paisley.",
  },
  "Tie-dye & ikat": {
    hi: "बाँधनी", roman: "bandhani",
    what: "Resist by binding. In bandhani the cloth is pinched and tied before dyeing; in ikat the threads are tied and dyed before weaving, so the pattern exists before the cloth does.",
    look: "Bandhani: fields of small dots. Ikat: feathered, slightly blurred edges where dyed threads meet.",
  },
  "Carpet & pile": {
    hi: "क़ालीन", roman: "qaleen",
    what: "Knotted pile, a craft the Mughal court brought from Persia and its workshops in Lahore and Agra made their own.",
    look: "A cut-pile surface; naturalistic flowers on a red ground are a Mughal signature.",
  },
  "Velvet": {
    hi: "मख़मल", roman: "makhmal",
    what: "Silk woven with an extra warp that is looped and cut into pile. Used for tent panels, floor spreads and court furnishings.",
    look: "A deep surface that changes shade with the light.",
  },
  "Woven": {
    hi: "बुनाई", roman: "bunai",
    what: "Cloth whose character lies in the weave itself: muslins fine enough to earn names like 'woven air', striped silk-and-cotton mashru, checked cottons.",
    look: "Stripes, checks and textures made by the meeting of warp and weft.",
  },
  "Other": { hi: "", roman: "", what: "The museum record did not say enough for this piece to be sorted automatically.", look: "" },
};

// Traditional colour vocabulary. `dye` is the classic source of the shade in Indian dyeing,
// not a claim about what a particular museum piece was dyed with.
export const DYES = [
  { key: "neel", hi: "नील", en: "indigo", rgb: [47, 74, 122], dye: "Indigo leaves, fermented in a vat. The cloth comes out green and turns blue in the air." },
  { key: "aasmani", hi: "आसमानी", en: "sky blue", rgb: [127, 166, 201], dye: "A short dip in a weak indigo vat." },
  { key: "firozi", hi: "फ़िरोज़ी", en: "turquoise", rgb: [47, 156, 156], dye: "Named for turquoise stone. Indigo with a touch of yellow." },
  { key: "laal", hi: "लाल", en: "madder red", rgb: [168, 50, 45], dye: "Madder or chay root over an alum mordant. The red that made Indian cotton famous." },
  { key: "rani", hi: "रानी", en: "queen's pink", rgb: [194, 24, 91], dye: "Lac, a resin made by insects, or safflower petals." },
  { key: "gulabi", hi: "गुलाबी", en: "rose", rgb: [217, 138, 154], dye: "Safflower. Beautiful and quick to fade." },
  { key: "kesari", hi: "केसरी", en: "saffron", rgb: [224, 129, 42], dye: "Rarely true saffron. Usually safflower or flame-of-the-forest blossom." },
  { key: "haldi", hi: "हल्दी", en: "turmeric", rgb: [224, 177, 46], dye: "Turmeric or pomegranate rind. Yellows are the first colours a cloth loses." },
  { key: "mehendi", hi: "मेहंदी", en: "henna green", rgb: [107, 122, 58], dye: "Yellow over indigo. There was no single green dye." },
  { key: "totai", hi: "तोतई", en: "parrot green", rgb: [63, 154, 74], dye: "Indigo overdyed with turmeric." },
  { key: "baingani", hi: "बैंगनी", en: "aubergine", rgb: [90, 53, 102], dye: "Indigo over madder or lac." },
  { key: "katthai", hi: "कत्थई", en: "catechu brown", rgb: [107, 63, 42], dye: "Cutch, from the heartwood of the acacia." },
  { key: "badami", hi: "बादामी", en: "almond", rgb: [201, 165, 123], dye: "Undyed or tannin-treated cotton, darkened by age." },
  { key: "sunehra", hi: "सुनहरा", en: "gold", rgb: [184, 144, 47], dye: "Not a dye: gilt-silver wire wound round silk." },
  { key: "surmai", hi: "सुरमई", en: "kohl grey", rgb: [92, 100, 112], dye: "Weak iron black, or silver thread that has tarnished." },
  { key: "kala", hi: "काला", en: "black", rgb: [30, 26, 26], dye: "Iron and tannin. It slowly eats the fibre, which is why black outlines are often the first thing lost." },
  { key: "safed", hi: "सफ़ेद", en: "white", rgb: [232, 226, 212], dye: "Cotton bleached in sun and dung, or protected from the dye with wax." },
];

// Words that turn up in museum titles. Matched against title + materials.
export const GLOSSARY = [
  [/palampore/i, "Palampore", "A large painted cotton bed cover or hanging, from palang-posh, 'bed cover'. Made on the Coromandel Coast for export, usually with a flowering tree."],
  [/chintz/i, "Chintz", "From the Hindi chheent, 'spotted' or 'sprinkled'. Europe's name for Indian painted and printed cotton."],
  [/kalamkari/i, "Kalamkari", "'Pen work': cotton drawn freehand with a bamboo pen before dyeing."],
  [/patolu|patola/i, "Patola", "Double ikat silk from Patan in Gujarat: warp and weft are both tie-dyed before weaving. Treasured as heirlooms as far away as Indonesia."],
  [/\bikat\b/i, "Ikat", "Threads are bound and dyed before weaving, so the pattern is in the yarn."],
  [/mashru/i, "Mashru", "'Permitted': silk warp over cotton weft, so that cotton, not silk, touches the skin. Woven for Muslim men, for whom pure silk was discouraged."],
  [/himru/i, "Himru", "A Deccan brocade of silk and cotton, a more affordable cousin of kinkhab."],
  [/patka|sash/i, "Patka", "A long court sash tied at the waist, its patterned ends hanging in front."],
  [/rumal/i, "Rumal", "A square cloth: kerchief, cover or wrapper for a gift."],
  [/boteh|buta|paisley/i, "Buta", "The curved flowering-plant motif of Kashmir shawls. Europe calls it paisley, after the Scottish town that wove imitations."],
  [/shawl/i, "Shawl", "From the Persian shal. In Kashmir it meant a length of fine goat-hair cloth before it meant a garment."],
  [/sari|saree/i, "Sari", "An unstitched length of cloth, usually five to nine yards, draped rather than tailored."],
  [/mordant/i, "Mordant", "A metal salt, usually alum or iron, that bonds dye to cotton. Where the mordant goes, the colour stays."],
  [/resist/i, "Resist", "Wax, mud or paste applied to keep dye out. The pattern is whatever stayed dry."],
  [/muslin/i, "Muslin", "Very fine plain cotton, above all from Bengal, spun from thread too delicate for any machine of its day."],
  [/metal|gold|silver|gilt/i, "Zari", "Thread of silver or gilt-silver wire wound round a silk core."],
  [/tent|qanat/i, "Tent hanging", "The Mughal court travelled as a city of cloth. Its tents were lined with printed, embroidered or velvet panels."],
  [/fragment/i, "Why a fragment?", "Many old textiles reached museums in pieces. Some were found that way, and dealers sometimes cut a cloth up to sell it to several collections."],
];

export const EVENTS = [
  [1498, "Da Gama reaches Calicut"],
  [1600, "East India Company chartered"],
  [1700, "England bans printed calico"],
  [1757, "Battle of Plassey"],
  [1851, "Great Exhibition, London"],
  [1905, "Swadeshi movement"],
];

// Guided tours (qisse). A step's `match` picks pieces: craft / region are exact labels, q is a regex over the
// museum text, y0 / y1 a year range, dye a key from DYES (piece has that colour in its palette).
export const STORIES = [
  {
    id: "before-the-ships", hi: "समंदर पार", roman: "samundar paar",
    title: "Cloth before the ships",
    blurb: "A thousand years ago Gujarat was already dressing the other shore of the ocean.",
    steps: [
      { title: "The survivors", layout: "galaxy", match: { y1: 1500 },
        text: "Begin with the survivors. Every piece now lit was made before 1500, the youngest of them in the years Kabir sat weaving in Varanasi, and no European ship had yet rounded the Cape. They are scraps, most no bigger than a hand. They are also among the oldest patterned cloth India has left." },
      { title: "Kept by the desert", match: { q: "egypt|fustat" },
        text: "None of these was found in India. Their records place them in Egypt, most at Fustat, the old city beneath Cairo, where Gujarati cotton was traded for centuries. They were dug up for dealers in the 1920s, not carefully excavated, so their dates are uncertain: laboratory tests put pieces like them anywhere from about 1000 to the 1400s. The monsoon rots cloth. The desert kept what the homeland could not." },
      { title: "The printer and the dyer", match: { y1: 1500, craft: ["Block print", "Painted & dyed cotton"] },
        text: "Two trades made them, and both are still worked in Gujarat and Rajasthan: the chhipa, who prints, and the rangrez, who dyes. Blue from the indigo vat. Red and brown from madder root. The pattern stamped in resist paste and mordant, so the cloth takes colour only where the maker allows." },
      { title: "What the museums wanted", layout: "time", match: {},
        text: "Now stand back and see the whole collection by date. For centuries, almost nothing. Then two great towers in the 1700s and 1800s. India did not suddenly weave more. Those are the years Europe and America arrived to buy, to take, and to collect." },
    ],
  },
  {
    id: "chintz", hi: "छींट", roman: "chheent",
    title: "The cotton Europe tried to ban",
    blurb: "Drawn with a bamboo pen on the Coromandel Coast, and wanted so badly that two kingdoms outlawed it.",
    steps: [
      { title: "A pen, not a press", layout: "galaxy", match: { q: "chintz|kalamkari|painted" },
        text: "The tool is a kalam: a sliver of bamboo with a wad of wool or cloth tied round it to hold the dye. The cloth is first soaked in buffalo milk and myrobalan so the line will not bleed. Then the painter draws, brushes on mordant where red must come, waxes whatever should stay white, and sends it to the dye bath. And again for the next colour. Weeks for a single cloth." },
      { title: "The tree that grows on every bed", match: { q: "palampore|bed ?cover|coverlet|hanging" },
        text: "The masterpiece was the palampore, a bed cover with one great flowering tree rising from a rocky mound, every branch bearing a different blossom. It is a tree that never grew anywhere: part Indian, part Persian, part Chinese, part English embroidery, because the painters were pleasing customers on three continents at once." },
      { title: "Brighter with every wash", match: { craft: ["Painted & dyed cotton"], y0: 1650, y1: 1800 },
        text: "Europe had never seen colour that survived water. Its own printed cloth ran; Indian chintz came out of the wash brighter. The craze was so complete that France banned it in 1686. England banned importing it in 1700 and wearing it in 1721, to protect its own weavers, some of whom had attacked women in the street for dressing in it. People wore it anyway." },
      { title: "A different cloth for every shore", match: { region: ["Made for export"] },
        text: "The same workshops painted for everyone. Flowering trees for Amsterdam and London. Fierce geometric cloths for the courts of Indonesia, where they became sacred heirlooms. Fine-patterned lengths for the Thai court. The makers never saw those countries. They knew them by what each one would pay for." },
    ],
  },
  {
    id: "paisley", hi: "बूटा", roman: "buta",
    title: "The buta that became paisley",
    blurb: "A flowering plant from a Kashmiri loom, now named after a town in Scotland.",
    steps: [
      { title: "Wool from the roof of the world", layout: "galaxy", match: { q: "shawl" },
        text: "It begins on the Tibetan plateau, with a goat that grows a winter under-fleece finer than any sheep's. The fleece, pashm, came down to Kashmir, where women spun it and men wove it in twill tapestry, each patch of colour worked with its own small bobbin, the kani. A great shawl could keep two weavers at one loom for a year or more." },
      { title: "One flower, bending", match: { craft: ["Kashmir shawl weave"] },
        text: "Look for the buta. In the oldest shawls it is a single flowering plant, upright, with roots. Over two centuries it leans, its tip curls over, its body fills with smaller flowers, until nothing of the plant remains but a curved teardrop packed with pattern." },
      { title: "Paris wants one", layout: "time", match: { q: "shawl" },
        text: "By 1800 a Kashmir shawl was the most desirable thing a woman in Paris or London could own. The mills of Europe set out to copy it, and one Scottish weaving town copied so many that the buta took its name. The world now calls a Kashmiri flower by the name of Paisley." },
      { title: "The loom falls silent", match: { q: "shawl", y0: 1850 },
        text: "The last shawls are the most dazzling, pattern from edge to edge. Then, in the 1870s, the trade collapsed. War in France closed the richest market, and fashion moved on. Machine-woven copies took much of what was left. Then the famine of 1877 to 1879 scattered the weavers and killed many of them." },
    ],
  },
  {
    id: "gold", hi: "ज़री", roman: "zari",
    title: "Gold you can wear",
    blurb: "Silver beaten flat, wound round silk, and woven into the cloth of kings.",
    steps: [
      { title: "Thread made of metal", layout: "galaxy", match: { craft: ["Brocade & metal thread"] },
        text: "Zari is real metal. Silver is drawn into wire, often gilded, hammered flat as a ribbon and wound round a core of silk. Woven in beside the coloured threads it makes cloth that is half jewellery. Time has turned much of this gold to grey, but tilt your head and imagine it by lamplight." },
      { title: "A robe is a sentence", match: { q: "sash|patka|court|coat|robe" },
        text: "In a Mughal or Rajput court, cloth spoke. A ruler honoured a man by giving him a robe or a sash from the royal stores, and every courtier could read the gift: this silk, this much gold, this far in favour. To be handed the wrong cloth was to be told where you stood." },
      { title: "The permitted cloth", match: { q: "mashru|himru" },
        text: "Mashru means 'permitted'. Many Muslim men would not wear pure silk against the skin, so the weavers found an answer: a satin with a silk face and a cotton back. Silk for the world to see, cotton for the body. A rule of faith became one of India's boldest striped fabrics." },
      { title: "From the court to the wedding", match: { q: "sari|saree" },
        text: "The courts are gone. The loom is not. The sari carried silk and zari out of the palace and into every family that could save for one. Varanasi, Kanchipuram and Paithan still weave them, and a bride's sari is still chosen with the seriousness once given to a robe of honour." },
    ],
  },
  {
    id: "palette", hi: "रंग", roman: "rang",
    title: "A palette from roots and leaves",
    blurb: "Every colour here was grown, dug up, or coaxed from an insect.",
    steps: [
      { title: "Neel", layout: "colour", match: { dye: "neel" },
        text: "Indigo is a leaf, fermented in a vat until the liquor turns yellow-green. Lift the cloth out and it turns blue before your eyes as the air touches it. The Greeks named the colour indikon, 'the Indian thing', and the name has never left it. Of all the colours here, this is the one that time has barely touched." },
      { title: "Laal", match: { dye: "laal" },
        text: "The red is a root: madder, or the finer chay that grew in the river deltas of the south. It will not hold on cotton without alum, painted exactly where red is wanted. Europe's dyers spent much of the 1700s trying to get a red this bright and this fast onto cotton. The method they finally learned reached them through the Ottoman lands, and they named it Turkey red." },
      { title: "The green that went missing", match: { dye: "mehendi" },
        text: "There was no green dye. Green was yellow laid over blue, and the yellows, turmeric and pomegranate rind, are the first to fade. So across three hundred years the leaves on many a chintz have quietly turned blue. It was never the painter's choice. It is the light of all the rooms the cloth has hung in." },
      { title: "The black that eats itself", match: { y1: 1600 },
        text: "Black is iron and tannin, the chemistry of old ink, and it is slowly corrosive. It eats the very thread it colours. These are the oldest pieces in the collection. Look closely at their dark outlines: in many places the line has become a row of tiny holes." },
    ],
  },
  {
    id: "karigar", hi: "कारीगर", roman: "karigar",
    title: "The hands with no names",
    blurb: "Every piece here records who gave it to a museum. Almost none records who made it.",
    steps: [
      { title: "Read the last line", layout: "galaxy", match: {},
        text: "Open any piece and read the small print at the bottom. It tells you whose gift it was, or whose fund paid for it. It almost never tells you who made it. The spinner, the dyer, the printer, the weaver, the embroiderer of nearly every cloth here went unrecorded." },
      { title: "Many hands, one cloth", match: { craft: ["Painted & dyed cotton", "Kashmir shawl weave", "Embroidery"] },
        text: "And it was never one person. A chintz passed from the washer to the painter to the dyer and back, many times. A shawl needed a spinner, a dyer, a pattern-drawer, a caller who chanted the colours aloud, and the weavers who followed his voice. Whole neighbourhoods are folded into each of these." },
      { title: "What they left", match: {},
        text: "What survives of them is the work itself. So look slowly. A wavering line where a pen was lifted. A flower one petal short. A weaver's small private change to the pattern. That is as close to a signature as most of them were ever allowed." },
    ],
  },
];

// Where the claims in the stories were checked (November 2026). Indian institutions and scholars first;
// museum catalogues for facts about particular objects; peer-reviewed work for chemistry and for British legal history.
export const SOURCES = [
  { topic: "Kashmir shawls: kani weaving, the talim, pashm", items: [
    ["MAP Academy, Bengaluru — Kani Weaving", "https://mapacademy.io/article/kani-weaving/"],
    ["MAP Academy — Talim", "https://mapacademy.io/glossary/talim/"],
    ["Sahapedia — Sozni and Kani work on Pashmina", "https://www.sahapedia.org/essence-kashmiri-craftsmanship-sozni-and-kani-work-pashmina"],
    ["Development Commissioner (Handicrafts), Government of India — Kani Shawl", "https://handicrafts.nic.in/crafts/All_Crafts/Craft_Categories/Textile/Other_Textiles_Based/Kani_Shawl/KaniWebPage.html"],
  ] },
  { topic: "The end of the shawl trade", note: "The famine's effect on weavers rests mainly on British-era accounts (Younghusband; the 1911 Britannica) and later Kashmiri journalism. Treat the detail with care.", items: [
    ["Kashmir Life — Kashmir 1877", "https://kashmirlife.net/kashmir-1877-vol-13-issue-36-280995/"],
    ["Cooper Hewitt — Kashmir to Paisley", "https://www.cooperhewitt.org/2016/07/29/kashmir-to-paisley/"],
  ] },
  { topic: "Kalamkari and chintz: the pen, the milk and myrobalan, the mordants", items: [
    ["Development Commissioner (Handicrafts), Government of India — Machilipatnam Kalamkari", "https://handicrafts.nic.in/crafts/All_Crafts/Craft_Categories/Textile/Other_Textiles_Based/Machilipatnam_Kalamkari/MachilipatnamKalamkariWebPage.html"],
    ["MAP Academy — Palampore", "https://mapacademy.io/article/palampore/"],
    ["Alka Raman, Winterthur — Charting Chintz: Making the Fabric", "https://www.winterthur.org/charting-chintz-making-the-fabric/"],
  ] },
  { topic: "The bans on Indian cotton in France and England", items: [
    ["Abigail Swingen, Journal of British Studies (2024) — Calico Madams and South Sea Cheats", "https://www.cambridge.org/core/journals/journal-of-british-studies/article/calico-madams-and-south-sea-cheats-global-trade-finance-and-popular-protest-in-early-hanoverian-england/A42541469AC2D07D56DB379D6B34EFAA"],
  ] },
  { topic: "Cloth found in Egypt", items: [
    ["Ashmolean Museum, Newberry Collection — radiocarbon-dated Gujarati fragment", "https://jameelcentre.ashmolean.org/collection/7/10236/10296/10745"],
    ["The Met — Indian Block-Printed Textiles: Past and Present", "https://www.metmuseum.org/perspectives/indian-block-printed-textiles"],
  ] },
  { topic: "Printers and dyers: the chhipa and the rangrez", items: [
    ["D'source, IIT Bombay — Block Printing, Sanganer", "https://dsource.in/resource/block-printing-sanganer/people-and-place"],
    ["MAP Academy — Jajam", "https://mapacademy.io/article/jajam/"],
  ] },
  { topic: "Zari, brocade and mashru", items: [
    ["Sahapedia — Woven Embroidery: The Brocades of Banaras", "https://www.sahapedia.org/woven-embroidery-the-brocades-of-banaras"],
    ["Development Commissioner (Handicrafts), Government of India — Surat Zari Craft", "https://handicrafts.nic.in/crafts/All_Crafts/Craft_Categories/Textile/Embroidery/Surat_Zari_Craft/SuratZariWebPage.html"],
    ["V&A — Mashru (catalogue entry)", "https://collections.vam.ac.uk/item/O475542/mashru"],
  ] },
  { topic: "Cloth made for Indonesia and Thailand", items: [
    ["National Museum of Asian Art, Smithsonian — Patola made for Indonesia", "https://asia.si.edu/explore-art-culture/collections/search/edanmdm:fsg_F2025.1.2/"],
    ["V&A — Ceremonial cloth (catalogue entry)", "https://collections.vam.ac.uk/item/O17103/ceremonial-cloth-unknown/"],
  ] },
  { topic: "Dyes: fading greens and the black that destroys fibre", items: [
    ["Wilson, Carr and Hacke, Chemistry Central Journal (2012) — iron-tannate dyed textiles", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3495704/"],
  ] },
  { topic: "Kabir's song of the cloth", items: [
    ["People's Archive of Rural India — Kabir and the fraying fabric of Dindori's weavers", "https://ruralindiaonline.org/article/kabir-and-the-fraying-fabric-of-dindori-weavers"],
  ] },
];

// Hindi text of the stories, in the same order as STORIES[].steps. Drafted alongside the English;
// it should be read by a fluent Hindi editor before publication.
export const HINDI = {
  "before-the-ships": [
    ["जो बच गए", "शुरुआत उनसे कीजिए जो बच गए। यहाँ चमकता हर टुकड़ा सन 1500 से पहले का है; इनमें सबसे नए उन बरसों के हैं जब कबीर बनारस में करघे पर बैठते थे, और तब तक कोई यूरोपीय जहाज़ अफ़्रीका का चक्कर काटकर यहाँ नहीं पहुँचा था। ज़्यादातर हथेली-भर की कतरनें हैं। फिर भी ये भारत के सबसे पुराने बचे हुए छपे-रँगे कपड़ों में गिनी जाती हैं।"],
    ["रेगिस्तान ने सँभाला", "इनमें से कोई भारत में नहीं मिला। इनके अभिलेख इन्हें मिस्र का बताते हैं, ज़्यादातर फ़ुस्तात का, जो काहिरा के नीचे दबा पुराना शहर है और जहाँ सदियों तक गुजरात का सूती कपड़ा बिकता रहा। 1920 के दशक में इन्हें सौदागरों के लिए खोदकर निकाला गया, विधिवत खुदाई नहीं हुई, इसलिए इनकी तारीख़ें पक्की नहीं हैं: प्रयोगशाला की जाँच ऐसे टुकड़ों को लगभग सन 1000 से 1400 के दशकों के बीच रखती है। बरसात कपड़े को गला देती है। जो वतन न बचा सका, वह रेगिस्तान ने बचा लिया।"],
    ["छीपा और रंगरेज़", "इन्हें दो पेशों ने बनाया, और दोनों आज भी गुजरात और राजस्थान में ज़िंदा हैं: छीपा, जो छापता है, और रंगरेज़, जो रँगता है। नील के माट से नीला। मजीठ की जड़ से लाल और भूरा। नमूना दाबू और फिटकरी से छापा जाता है, ताकि कपड़ा वहीं रंग पकड़े जहाँ कारीगर चाहे।"],
    ["संग्रहालयों ने क्या चाहा", "अब पीछे हटकर पूरा संग्रह तारीख़ के हिसाब से देखिए। सदियों तक लगभग कुछ नहीं। फिर 1700 और 1800 के दशकों में दो ऊँची मीनारें। भारत ने अचानक ज़्यादा बुनना शुरू नहीं किया था। ये वे बरस हैं जब यूरोप और अमेरिका ख़रीदने, ले जाने और जमा करने आए।"],
  ],
  chintz: [
    ["क़लम से, ठप्पे से नहीं", "औज़ार है क़लम: बाँस की एक खपच्ची, जिस पर रंग थामने के लिए ऊन या कपड़े की गद्दी बँधी होती है। पहले कपड़े को भैंस के दूध और हरड़ में भिगोया जाता है ताकि रेखा फैले नहीं। फिर चित्रकार रेखाएँ खींचता है, जहाँ लाल चाहिए वहाँ फिटकरी लगाता है, जो सफ़ेद रहना है उस पर मोम चढ़ाता है, और कपड़ा रँगाई में जाता है। अगले रंग के लिए फिर वही सब। एक कपड़े में हफ़्ते लग जाते थे।"],
    ["हर पलंग पर उगा पेड़", "इस कला का शिखर था पलंगपोश: पलंग की चादर, जिस पर पथरीले टीले से उठता एक विशाल फूलदार पेड़, और हर डाल पर अलग फूल। ऐसा पेड़ कहीं नहीं उगा: कुछ भारतीय, कुछ ईरानी, कुछ चीनी, कुछ अंग्रेज़ी कढ़ाई जैसा, क्योंकि चित्रकार एक साथ तीन महाद्वीपों के ग्राहकों को ख़ुश कर रहे थे।"],
    ["हर धुलाई में और चटख", "यूरोप ने ऐसा रंग कभी नहीं देखा था जो पानी झेल जाए। उसका अपना छपा कपड़ा धुलते ही बह जाता था; भारतीय छींट धुलकर और निखरती थी। दीवानगी ऐसी थी कि फ़्रांस ने 1686 में इस पर रोक लगा दी। इंग्लैंड ने 1700 में इसका आयात और 1721 में इसे पहनना बंद किया, अपने बुनकरों को बचाने के लिए, जिनमें से कुछ ने इसे पहनने वाली औरतों पर सड़क पर हमले भी किए थे। लोगों ने फिर भी पहनी।"],
    ["हर किनारे के लिए अलग कपड़ा", "वही कारख़ाने सबके लिए रँगते थे। एम्स्टर्डम और लंदन के लिए फूलदार पेड़। इंडोनेशिया के दरबारों के लिए तीखे ज्यामितीय नमूने, जो वहाँ पुरखों की पवित्र धरोहर बन गए। थाई दरबार के लिए महीन नमूनों के थान। बनाने वालों ने वे देश कभी नहीं देखे। वे उन्हें बस इतना जानते थे कि कौन किस चीज़ का दाम देगा।"],
  ],
  paisley: [
    ["दुनिया की छत से आई ऊन", "कहानी तिब्बत के पठार से शुरू होती है, उस बकरी से जिसकी जाड़े की भीतरी ऊन किसी भी भेड़ से महीन होती है। यही ऊन, पश्म, कश्मीर पहुँचती थी, जहाँ औरतें उसे कातती थीं और मर्द उसे बुनते थे; रंग का हर टुकड़ा अपनी अलग छोटी तीली, कानी, से बुना जाता था। एक बढ़िया शॉल पर दो बुनकर साल भर या उससे भी ज़्यादा एक ही करघे पर लगे रहते थे।"],
    ["एक फूल, झुकता हुआ", "बूटे को ढूँढ़िए। सबसे पुरानी शॉलों में वह जड़ों समेत सीधा खड़ा एक फूलदार पौधा है। दो सदियों में वह झुकता है, उसकी नोक मुड़ जाती है, उसका बदन छोटे फूलों से भर जाता है, और आख़िर में पौधे का कुछ नहीं बचता, बस नमूनों से ठसाठस एक मुड़ी हुई बूँद।"],
    ["पेरिस को भी चाहिए", "सन 1800 तक कश्मीरी शॉल पेरिस और लंदन की औरतों की सबसे बड़ी चाह बन चुकी थी। यूरोप की मिलें इसकी नक़ल में जुट गईं, और स्कॉटलैंड के एक बुनकर क़स्बे ने इतनी नक़लें बनाईं कि बूटे को उसी का नाम मिल गया। आज दुनिया कश्मीर के इस फूल को पेज़्ली कहती है।"],
    ["करघा ख़ामोश हो गया", "आख़िरी शॉलें सबसे चकाचौंध हैं, किनारे से किनारे तक नमूना। फिर 1870 के दशक में यह व्यापार ढह गया। फ़्रांस की जंग ने सबसे अमीर बाज़ार बंद कर दिया, और फ़ैशन आगे बढ़ गया। जो बचा था उसका बड़ा हिस्सा मशीन की नक़लें ले गईं। फिर 1877 से 1879 के अकाल ने बुनकरों को बिखेर दिया और बहुतों की जान ले ली।"],
  ],
  gold: [
    ["धातु का धागा", "ज़री असली धातु है। चाँदी का तार खींचा जाता है, अक्सर उस पर सोने का पानी चढ़ता है, उसे पीटकर फीते जैसा चपटा किया जाता है और रेशम के धागे पर लपेटा जाता है। रंगीन धागों के साथ बुनकर यह ऐसा कपड़ा बनाती है जो आधा गहना है। वक़्त ने इस सोने का बहुत-सा हिस्सा धूसर कर दिया है, पर ज़रा सिर झुकाकर इसे दीये की रोशनी में सोचिए।"],
    ["ख़िलअत एक पूरा वाक्य है", "मुग़ल या राजपूत दरबार में कपड़ा बोलता था। बादशाह किसी को शाही तोशाख़ाने से जामा या पटका देकर इज़्ज़त बख़्शता था, और हर दरबारी उस तोहफ़े को पढ़ लेता था: यह रेशम, इतना सोना, इतनी मेहरबानी। ग़लत कपड़ा मिलना यह बता दिए जाने जैसा था कि आपकी जगह कहाँ है।"],
    ["जायज़ कपड़ा", "मशरू का मतलब है 'जायज़'। बहुत-से मुसलमान मर्द ख़ालिस रेशम को बदन से लगाकर नहीं पहनते थे, तो बुनकरों ने रास्ता निकाला: ऐसी साटन जिसका चेहरा रेशम का और पीठ सूत की। दुनिया के देखने को रेशम, बदन के लिए सूत। आस्था का एक नियम भारत के सबसे शोख़ धारीदार कपड़ों में से एक बन गया।"],
    ["दरबार से शादी तक", "दरबार नहीं रहे। करघा अब भी है। साड़ी रेशम और ज़री को महल से निकालकर हर उस घर तक ले गई जो एक साड़ी के लिए पैसे जोड़ सकता था। बनारस, कांचीपुरम और पैठण आज भी इन्हें बुनते हैं, और दुल्हन की साड़ी आज भी उतनी ही संजीदगी से चुनी जाती है जितनी कभी ख़िलअत।"],
  ],
  palette: [
    ["नील", "नील एक पत्ती है, जिसे माट में तब तक सड़ाया जाता है जब तक घोल पीला-हरा न हो जाए। कपड़ा बाहर निकालिए, और हवा लगते ही वह आँखों के सामने नीला हो जाता है। यूनानियों ने इस रंग को 'इंडिकोन' कहा, यानी 'भारत की चीज़', और यह नाम फिर कभी इससे अलग नहीं हुआ। यहाँ के सारे रंगों में वक़्त ने इसी को सबसे कम छुआ है।"],
    ["लाल", "लाल एक जड़ है: मजीठ, या उससे उम्दा 'छाय' की जड़, जो दक्खिन के नदी-मुहानों में उगती थी। फिटकरी के बिना यह सूत पर टिकता नहीं, और फिटकरी ठीक वहीं लगती है जहाँ लाल चाहिए। यूरोप के रंगरेज़ 1700 के दशकों का बड़ा हिस्सा सूत पर ऐसा चटख और पक्का लाल पाने की कोशिश में लगे रहे। जो तरीक़ा आख़िर उनके हाथ आया, वह उस्मानी इलाक़ों से होकर पहुँचा, और उन्होंने उसे 'टर्की रेड' नाम दिया।"],
    ["खोया हुआ हरा", "हरा कोई रंग था ही नहीं। हरा बनता था नीले पर पीला चढ़ाकर, और पीले रंग, हल्दी और अनार का छिलका, सबसे पहले उड़ते हैं। तो तीन सौ बरसों में बहुत-सी छींटों की पत्तियाँ चुपचाप नीली हो गई हैं। यह चित्रकार की मर्ज़ी नहीं थी। यह उन तमाम कमरों की रोशनी है जिनमें यह कपड़ा टँगा रहा।"],
    ["ख़ुद को खा जाने वाला काला", "काला लोहे और कसैले रस (टैनिन) से बनता है, पुरानी स्याही वाला ही रसायन, और यह धीरे-धीरे गलाता है। जिस धागे को रँगता है उसी को खा जाता है। ये संग्रह के सबसे पुराने टुकड़े हैं। इनकी गहरी रेखाओं को ध्यान से देखिए: कई जगह रेखा नन्हे छेदों की क़तार बन चुकी है।"],
  ],
  karigar: [
    ["आख़िरी पंक्ति पढ़िए", "कोई भी टुकड़ा खोलिए और सबसे नीचे की बारीक पंक्ति पढ़िए। वह बताती है कि यह किसका दान था, या किसके कोष से ख़रीदा गया। वह लगभग कभी नहीं बताती कि इसे बनाया किसने। यहाँ के क़रीब-क़रीब हर कपड़े के कातने वाले, रँगने वाले, छापने वाले, बुनने वाले और काढ़ने वाले का नाम कहीं दर्ज नहीं।"],
    ["कई हाथ, एक कपड़ा", "और यह कभी एक इंसान का काम नहीं था। एक छींट धोबी से चित्रकार, चित्रकार से रंगरेज़ के पास जाती और लौटती, कई-कई बार। एक शॉल को कातने वाली चाहिए थी, रंगरेज़, नक़्शा बनाने वाला, रंगों को ऊँची आवाज़ में पढ़ने वाला, और वे बुनकर जो उसकी आवाज़ के पीछे चलते थे। इनमें से हर कपड़े में पूरे-पूरे मोहल्ले तह किए हुए हैं।"],
    ["वे क्या छोड़ गए", "उनका जो बचा है, वह उनका काम ही है। तो धीरे-धीरे देखिए। जहाँ क़लम उठी, वहाँ काँपती हुई रेखा। एक पंखुड़ी कम वाला फूल। नमूने में बुनकर का अपना छोटा-सा, चुपचाप किया हुआ बदलाव। उनमें से ज़्यादातर को इससे ज़्यादा दस्तख़त की इजाज़त कभी मिली ही नहीं।"],
  ],
};

// Landing page: six pieces per craft, chosen by eye from the record-labelled pieces (by id, so re-running the pipeline cannot shuffle them).
export const LANDING = {
  "Block print": ["ch_chndm_1962-175-6", "aic_212379", "ch_chndm_1902-1-975", "ch_chndm_1962-175-10", "cma_128896", "ch_chndm_1962-175-12"],
  "Kashmir shawl weave": ["aic_12370", "cma_107842", "aic_236226", "cma_164834", "ch_chndm_1958-148-5-b", "cma_107880"],
  "Painted & dyed cotton": ["met_446817", "met_447946", "met_457711", "met_448495", "aic_236225", "met_237872"],
  "Brocade & metal thread": ["cma_107863", "cma_108093", "cma_108090", "cma_108076", "cma_130761", "cma_108057"],
  "Embroidery": ["ch_chndm_1945-39-11-a", "aic_135607", "aic_88461", "met_446663", "ch_chndm_1945-39-11-b", "ch_chndm_1967-85-12"],
};
