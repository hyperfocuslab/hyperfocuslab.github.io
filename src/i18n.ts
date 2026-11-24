export const LANGS = ['ko', 'en', 'ja', 'zh-Hant'] as const;
export type Lang = (typeof LANGS)[number];
export type Page = 'home' | 'peakly' | 'sheltie' | 'cockatoo' | 'harubox' | 'privacy' | 'terms' | 'support';

export const SITE = 'https://hyperfocuslab.app';
export const EMAIL = 'support@hyperfocuslab.app';
// Without a country or language the stores pick the visitor's region and language, so a
// Korean browser landed on the Korean listing from every page. Each page pins its own.
const APP_STORE_COUNTRY: Record<Lang, string> = { ko: 'kr/', ja: 'jp/', en: 'us/', 'zh-Hant': 'tw/' };
// Google Play interface language for the store link (hl).
const PLAY_HL: Record<Lang, string> = { ko: 'ko', en: 'en', ja: 'ja', 'zh-Hant': 'zh-TW' };
// Campaign tags so installs from this site show up per language in App Store Connect
// (Acquisition > Campaigns) and Play Console (Acquisition reports, UTM).
export function storeLinks(lang: Lang) {
  return {
    appStore: `https://apps.apple.com/${APP_STORE_COUNTRY[lang]}app/id6757836001?pt=128442127&ct=website-${lang}&mt=8`,
    googlePlay: `https://play.google.com/store/apps/details?id=com.peakly.android&hl=${PLAY_HL[lang]}&referrer=utm_source%3Dhyperfocuslab.app%26utm_medium%3Dwebsite%26utm_campaign%3Dwebsite-${lang}`,
  };
}

export function sheltieLinks(lang: Lang) {
  return {
    appStore: `https://apps.apple.com/${APP_STORE_COUNTRY[lang]}app/id6837271201?ct=website-${lang}&mt=8`,
    github: 'https://github.com/hyperfocuslab/sheltie',
    // Android is in closed testing: testers join the Google Group first, then opt in on Play.
    testerGroup: 'https://groups.google.com/g/sheltie-testers',
    testerOptIn: 'https://play.google.com/apps/testing/com.hyperfocuslab.sheltie',
    play: 'https://play.google.com/store/apps/details?id=com.hyperfocuslab.sheltie',
  };
}

// Cockatoo (AI English conversation app) is not on the App Store yet: the link is empty, and
// the product page draws the App Store button only when it has a value.
export function cockatooLinks(_lang: CockatooLang) {
  return { appStore: '' };
}

// Harubox is in App Store review: the link is empty until it is approved, and the product page
// draws the App Store button only when it has a value.
export function haruboxLinks(_lang: HaruboxLang) {
  return { appStore: '' };
}

const PREFIX: Record<Lang, string> = { ko: '', en: '/en', ja: '/ja', 'zh-Hant': '/zh-Hant' };
// The root home is English. Peakly documents keep PREFIX: the apps and stores link to those URLs.
const HOME: Record<Lang, string> = { ko: '/ko/', en: '/', ja: '/ja/', 'zh-Hant': '/zh-Hant/' };
// The old flat file names exist only for the languages the previous site had.
const SUFFIX: Partial<Record<Lang, string>> = { ko: '', en: '-en', ja: '-ja' };

// Hyperfocus Lab is the company; Peakly is a product under it, and its
// policies and support pages live under /peakly/.
export function href(page: Page, lang: Lang): string {
  if (page === 'home') return HOME[lang];
  // The home lists the products; each has its own page.
  if (page === 'peakly') return `${PREFIX[lang]}/peakly/`;
  if (page === 'cockatoo') return cockatooHref('product', lang);
  if (page === 'sheltie') return sheltieHref('product', lang);
  return `${PREFIX[lang]}/peakly/${page}/`;
}

// Sheltie (iPhone companion for coding agents) is the second product, with its own page.
// Its product, support and privacy pages exist in the four site languages, under /<prefix>/sheltie/.
export type Product = 'peakly' | 'sheltie' | 'cockatoo' | 'harubox';
export const SHELTIE_LANGS = ['ko', 'en', 'ja', 'zh-Hant'] as const;
export const SHELTIE_DOCS = ['support', 'privacy'] as const;
export function sheltieHref(doc: 'product' | (typeof SHELTIE_DOCS)[number], lang: Lang): string {
  return doc === 'product' ? `${PREFIX[lang]}/sheltie/` : `${PREFIX[lang]}/sheltie/${doc}/`;
}

// Cockatoo (AI English conversation app) is the third product: product, support and privacy pages
// in the same eight languages as Harubox (CockatooLang = HaruboxLang, so it shares Harubox's labels
// and UI strings). ko lives at /cockatoo/, the others at /<lang>/cockatoo/.
export type CockatooLang = HaruboxLang;
export const COCKATOO_DOCS = ['support', 'privacy'] as const;
export function cockatooHref(doc: 'product' | (typeof COCKATOO_DOCS)[number], lang: CockatooLang): string {
  const base = `${lang === 'ko' ? '' : `/${lang}`}/cockatoo/`;
  return doc === 'product' ? base : `${base}${doc}/`;
}
export function cockatooName(lang: CockatooLang): string {
  return lang === 'ko' ? '코카투' : 'Cockatoo';
}
// Product name shown in the header crumb, footer and document label of the non-Peakly products.
// Harubox and Cockatoo have per-language names: see haruboxName and cockatooName.
export const PRODUCT_NAME = { sheltie: 'Sheltie' } as const;

// Harubox (all-day recorder, the fourth product) has product, support and privacy pages in eight
// languages. The site's own Lang covers four of them, so Harubox has its own language type,
// labels, UI strings and href function. ko lives at /harubox/, the others at /<lang>/harubox/.
export const HARUBOX_LANGS = ['ko', 'en', 'ja', 'zh-Hant', 'de', 'es', 'fr', 'pt-BR'] as const;
export type HaruboxLang = (typeof HARUBOX_LANGS)[number];
export const HARUBOX_DOCS = ['support', 'privacy'] as const;
export type HaruboxDoc = (typeof HARUBOX_DOCS)[number];
export function haruboxHref(doc: 'product' | HaruboxDoc, lang: HaruboxLang): string {
  const base = `${lang === 'ko' ? '' : `/${lang}`}/harubox/`;
  return doc === 'product' ? base : `${base}${doc}/`;
}
export const HARUBOX_LANG_LABEL: Record<HaruboxLang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-Hant': '繁體中文',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  'pt-BR': 'Português (Brasil)',
};
export const COCKATOO_LANGS = HARUBOX_LANGS;
export const HARUBOX_LANG_CODE: Record<HaruboxLang, string> = { ko: 'KO', en: 'EN', ja: 'JA', 'zh-Hant': 'ZH', de: 'DE', es: 'ES', fr: 'FR', 'pt-BR': 'PT' };
export function haruboxName(lang: HaruboxLang): string {
  return lang === 'ko' ? '하루박스' : 'Harubox';
}
// The company home exists in ko, en, ja and zh-Hant; the other languages link to the English one.
export function haruboxHomeLang(lang: HaruboxLang): Lang {
  return (LANGS as readonly string[]).includes(lang) ? (lang as Lang) : 'en';
}
export const HARUBOX_UI: Record<HaruboxLang, { nav: { contact: string; language: string; main: string }; docs: { privacy: string; support: string }; legal: string }> = {
  ko: { nav: { contact: '문의', language: '언어 선택', main: '주요 메뉴' }, docs: { privacy: '개인정보처리방침', support: '고객지원' }, legal: '© Hyperfocus Lab' },
  en: { nav: { contact: 'Contact', language: 'Language', main: 'Main' }, docs: { privacy: 'Privacy Policy', support: 'Support' }, legal: '© Hyperfocus Lab' },
  ja: { nav: { contact: 'お問い合わせ', language: '言語', main: 'メインメニュー' }, docs: { privacy: 'プライバシーポリシー', support: 'サポート' }, legal: '© Hyperfocus Lab' },
  'zh-Hant': { nav: { contact: '聯絡我們', language: '選擇語言', main: '主要選單' }, docs: { privacy: '隱私權政策', support: '客戶支援' }, legal: '© Hyperfocus Lab' },
  de: { nav: { contact: 'Kontakt', language: 'Sprache', main: 'Hauptmenü' }, docs: { privacy: 'Datenschutzerklärung', support: 'Support' }, legal: '© Hyperfocus Lab' },
  es: { nav: { contact: 'Contacto', language: 'Idioma', main: 'Menú principal' }, docs: { privacy: 'Política de privacidad', support: 'Soporte' }, legal: '© Hyperfocus Lab' },
  fr: { nav: { contact: 'Contact', language: 'Langue', main: 'Menu principal' }, docs: { privacy: 'Politique de confidentialité', support: 'Assistance' }, legal: '© Hyperfocus Lab' },
  'pt-BR': { nav: { contact: 'Contato', language: 'Idioma', main: 'Menu principal' }, docs: { privacy: 'Política de Privacidade', support: 'Suporte' }, legal: '© Hyperfocus Lab' },
};

// Cockatoo product page copy, one entry per Cockatoo language. Row titles match the App Store
// screenshot captions (english-pronunciation docs/store/<lang>.md). Screenshot rows are drawn only
// when public/assets/cockatoo/<lang>-<shot>.webp exists.
type CockatooRow = { shot: string; label: string; title: string; body: string; alt: string };
export const COCKATOO_PAGE: Record<CockatooLang, { title: string; tagline: string; lead: string; rows: CockatooRow[]; requirements: string }> = {
  ko: {
    title: '코카투 | AI 영어회화·발음 교정',
    tagline: '말하면 고쳐 주고, 다시 말해 익히기',
    lead: '영어로 말할 상대가 없고, 내 발음이 어디서 틀리는지 모를 때 쓰는 앱이에요. 버튼을 누른 채 영어로 말하면 AI가 답하고, 어색한 문장은 자연스럽게 고쳐 주고, 고친 문장을 따라 말하면 틀린 발음을 단어별로 짚어 줘요.',
    rows: [
      { shot: 'situations', label: '상황', title: '35개 상황에서 영어로 말해요', body: '카페 주문, 회사 스몰토크, 거래처 협상, 영어 면접, 입국 심사 같은 상황과 자유 대화. 버튼을 누르는 동안 말하고 떼면 바로 글로 받아써요.', alt: '상황 목록 화면' },
      { shot: 'chat', label: '대화', title: '어색한 문장은 바로 고쳐 줘요', body: '내 말 아래에 더 자연스러운 문장과 내 언어로 된 설명 한 줄이 붙어요. 모르는 말은 눌러서 내 언어로 해석을 봐요.', alt: '내 말 아래 고친 문장이 붙은 대화 화면' },
      { shot: 'speak', label: '따라 말하기', title: '틀린 발음을 단어별로 짚어요', body: '고친 문장을 따라 말하면 단어마다 발음을 판정해요. "this의 th를 d처럼 읽음"처럼 무엇이 틀렸는지 내 언어로 짚고, 다시 말해 통과하면 표시가 바뀌어요.', alt: '발음을 단어별로 짚은 따라 말하기 화면' },
      { shot: 'review', label: '복습', title: '고친 표현이 복습에 쌓여요', body: '고친 표현과 틀린 발음이 복습 목록에 쌓여요.', alt: '복습 목록 화면' },
      { shot: 'habit', label: '발음 버릇', title: '자주 틀리는 소리를 횟수로 봐요', body: '"발음 버릇"에서 th → d 12번처럼 자주 틀리는 소리를 횟수로 봐요.', alt: '발음 버릇 상세 화면' },
    ],
    requirements: 'Apple Intelligence를 지원하는 iPhone, iOS 27 이상. 설명과 해석은 iPhone 언어로 나와요.',
  },
  en: {
    title: 'Cockatoo | AI English Speaking and Pronunciation',
    tagline: 'Conversation & pronunciation',
    lead: 'For when you have no one to speak English with and can’t tell where your pronunciation goes wrong. Hold the button and speak English: the AI replies, rewrites awkward sentences into natural ones, and when you read the corrected sentence aloud it points out mispronounced words one by one.',
    rows: [
      { shot: 'situations', label: 'Situations', title: 'Speak English in 35 situations', body: 'Ordering coffee, small talk at work, negotiating with a client, a job interview, passport control and free conversation. Talk while you hold the button; let go and it becomes text.', alt: 'Situation list screen' },
      { shot: 'chat', label: 'Conversation', title: 'Awkward sentences, fixed on the spot', body: 'Under what you said: a more natural sentence and a one-line explanation.', alt: 'Conversation screen with a corrected sentence under the user’s message' },
      { shot: 'speak', label: 'Practice', title: 'Pronunciation checked word by word', body: 'Read the corrected sentence aloud and every word is scored. It names the problem, like “th in ‘this’ said as d”, and the mark changes once you get it right.', alt: 'Practice screen with mispronounced words marked' },
      { shot: 'review', label: 'Review', title: 'Corrections collect for review', body: 'Corrected phrases and mispronounced words collect in your review list.', alt: 'Review list screen' },
      { shot: 'habit', label: 'Pronunciation habits', title: 'See the sounds you miss most', body: '“Pronunciation habits” counts the sounds you miss most, such as th → d, 12 times.', alt: 'Pronunciation habit detail screen' },
    ],
    requirements: 'iPhone that supports Apple Intelligence, iOS 27 or later. Explanations follow your iPhone language.',
  },
  ja: {
    title: 'Cockatoo | AI英会話・発音矯正',
    tagline: '話すと添削、言い直して身につく',
    lead: '英語で話す相手がいない、自分の発音のどこが違うのかわからない。そんなときのためのアプリです。ボタンを押しながら英語で話すとAIが返事をし、不自然な文は自然な英語に添削。添削された文を読み上げると、間違えた発音を単語ごとに示します。',
    rows: [
      { shot: 'situations', label: '場面', title: '35の場面で英語を話す', body: 'カフェでの注文、職場の雑談、取引先との交渉、英語面接、入国審査などの場面とフリートーク。ボタンを押している間に話し、離すとすぐに文字になります。', alt: '場面一覧の画面' },
      { shot: 'chat', label: '会話', title: '不自然な文はその場で添削', body: '自分の発言の下に、より自然な文と日本語の説明が1行つきます。わからない表現はタップすると日本語訳が見られます。', alt: '発言の下に添削された文がついた会話画面' },
      { shot: 'speak', label: 'リピート練習', title: '発音を単語ごとにチェック', body: '添削された文を読み上げると、単語ごとに発音を判定します。「this の th が d になっている」のように何が違うのかを示し、言い直して合格すると表示が変わります。', alt: '発音を単語ごとに示したリピート練習の画面' },
      { shot: 'review', label: '復習', title: '添削された表現が復習にたまる', body: '添削された表現と間違えた発音が復習リストにたまります。', alt: '復習リストの画面' },
      { shot: 'habit', label: '発音のクセ', title: 'よく間違える音を回数で確認', body: '「発音のクセ」で、th → d が12回のように、よく間違える音を回数で確認できます。', alt: '発音のクセの詳細画面' },
    ],
    requirements: 'Apple Intelligenceに対応したiPhone、iOS 27以降。説明と翻訳はiPhoneの言語で表示されます。',
  },
  'zh-Hant': {
    title: 'Cockatoo | AI 英文口說・發音矯正',
    tagline: '開口說英文，句子修正、發音逐字檢查',
    lead: '沒有人可以練英文口說，也不知道自己的發音哪裡不對時，就用這個 App。按住按鈕用英文說話，AI 會回覆你，把不自然的句子改得更道地；跟著唸修正後的句子，會逐字指出唸錯的地方。',
    rows: [
      { shot: 'situations', label: '情境', title: '在 35 個情境用英文開口說', body: '點咖啡、職場閒聊、和客戶談判、英文面試、入境審查等情境，以及自由對話。按住按鈕說話，放開就轉成文字。', alt: '情境清單畫面' },
      { shot: 'chat', label: '對話', title: '不自然的句子，當場幫你改', body: '你說的話下面，會出現更自然的句子和一行中文說明。看不懂的地方點一下就能看中文翻譯。', alt: '使用者句子下方出現修正句的對話畫面' },
      { shot: 'speak', label: '跟讀', title: '逐字指出發音問題', body: '跟著唸修正後的句子，每個單字都會評分。像「this 的 th 唸成 d」這樣指出哪裡不對，重說通過後標示就會改變。', alt: '逐字標出發音問題的跟讀畫面' },
      { shot: 'review', label: '複習', title: '修正過的說法累積成複習', body: '修正過的說法和唸錯的發音會累積在複習清單。', alt: '複習清單畫面' },
      { shot: 'habit', label: '發音習慣', title: '用次數看最常唸錯的音', body: '在「發音習慣」用次數看你最常唸錯的音，例如 th → d 12 次。', alt: '發音習慣詳細畫面' },
    ],
    requirements: '支援 Apple Intelligence 的 iPhone，iOS 27 或以上版本。說明與翻譯會以 iPhone 的語言顯示。',
  },
  de: {
    title: 'Cockatoo | Englisch sprechen, Aussprache mit KI üben',
    tagline: 'Sätze & Aussprache mit KI üben',
    lead: 'Für alle, die niemanden zum Englischsprechen haben und nicht wissen, wo ihre Aussprache danebenliegt. Halte die Taste gedrückt und sprich Englisch: Die KI antwortet, macht holprige Sätze natürlich, und wenn du den verbesserten Satz vorliest, zeigt sie Wort für Wort, was du falsch aussprichst.',
    rows: [
      { shot: 'situations', label: 'Situationen', title: 'Englisch sprechen in 35 Situationen', body: 'Bestellung im Café, Smalltalk im Büro, Verhandlungen mit Kunden, Vorstellungsgespräch, Passkontrolle und freies Gespräch. Sprich, solange du die Taste hältst; lass los, und es steht als Text da.', alt: 'Liste der Situationen' },
      { shot: 'chat', label: 'Gespräch', title: 'Holprige Sätze sofort verbessert', body: 'Unter deinem Satz steht eine natürlichere Version mit einer Zeile Erklärung auf Deutsch. Tippe auf Unbekanntes für die deutsche Übersetzung.', alt: 'Gespräch mit verbessertem Satz unter der eigenen Nachricht' },
      { shot: 'speak', label: 'Nachsprechen', title: 'Aussprache Wort für Wort geprüft', body: 'Lies den verbesserten Satz vor, und jedes Wort wird bewertet. Die App sagt, was nicht gepasst hat, etwa „th in ‚this‘ wie d gesprochen“, und die Markierung wechselt, sobald es klappt.', alt: 'Nachsprechen-Bildschirm mit markierten Wörtern' },
      { shot: 'review', label: 'Wiederholen', title: 'Verbessertes landet im Wiederholen', body: 'Verbesserte Ausdrücke und falsch ausgesprochene Wörter landen in deiner Wiederholungsliste.', alt: 'Wiederholungsliste' },
      { shot: 'habit', label: 'Aussprache-Gewohnheiten', title: 'Sieh, welche Laute du oft verfehlst', body: 'Unter „Aussprache-Gewohnheiten“ siehst du, welche Laute du wie oft verfehlst, etwa th → d, 12-mal.', alt: 'Detailansicht einer Aussprachegewohnheit' },
    ],
    requirements: 'iPhone mit Apple Intelligence, iOS 27 oder neuer. Erklärungen erscheinen in der Sprache deines iPhone.',
  },
  es: {
    title: 'Cockatoo | Habla inglés con IA y corrige tu pronunciación',
    tagline: 'Corrige frases y pronunciación',
    lead: 'Para cuando no tienes con quién hablar inglés y no sabes en qué fallas al pronunciar. Mantén pulsado el botón y habla en inglés: la IA responde, convierte las frases raras en naturales y, cuando lees en voz alta la frase corregida, te marca palabra por palabra lo que pronunciaste mal.',
    rows: [
      { shot: 'situations', label: 'Situaciones', title: 'Habla inglés en 35 situaciones', body: 'Pedir en una cafetería, charlar en el trabajo, negociar con un cliente, una entrevista de trabajo, el control de inmigración y conversación libre. Habla mientras mantienes pulsado el botón; al soltarlo, aparece el texto.', alt: 'Pantalla con la lista de situaciones' },
      { shot: 'chat', label: 'Conversación', title: 'Tus frases, corregidas al momento', body: 'Debajo de lo que dices aparece una frase más natural con una explicación de una línea en español. Toca lo que no entiendas para ver la traducción.', alt: 'Conversación con una frase corregida debajo del mensaje' },
      { shot: 'speak', label: 'Repetir', title: 'Pronunciación revisada palabra por palabra', body: 'Lee en voz alta la frase corregida y se evalúa cada palabra. Te dice qué falló, como “la th de ‘this’ suena como d”, y la marca cambia cuando lo dices bien.', alt: 'Pantalla Repetir con palabras marcadas' },
      { shot: 'review', label: 'Repaso', title: 'Lo corregido se guarda para repasar', body: 'Las expresiones corregidas y las palabras mal pronunciadas se guardan en tu lista de repaso.', alt: 'Pantalla de la lista de repaso' },
      { shot: 'habit', label: 'Hábitos de pronunciación', title: 'Los sonidos que más fallas, contados', body: 'En “Hábitos de pronunciación” ves cuántas veces fallas cada sonido, por ejemplo th → d, 12 veces.', alt: 'Detalle de un hábito de pronunciación' },
    ],
    requirements: 'iPhone compatible con Apple Intelligence, iOS 27 o posterior. Las explicaciones salen en el idioma de tu iPhone.',
  },
  fr: {
    title: 'Cockatoo | Parler anglais avec l’IA et corriger sa prononciation',
    tagline: 'Corrigez votre prononciation',
    lead: 'Pour quand vous n’avez personne avec qui parler anglais et ne savez pas où votre prononciation coince. Maintenez le bouton et parlez anglais : l’IA répond, rend vos phrases plus naturelles, et quand vous lisez la phrase corrigée à voix haute, elle signale mot par mot ce qui est mal prononcé.',
    rows: [
      { shot: 'situations', label: 'Situations', title: 'Parlez anglais dans 35 situations', body: 'Commander au café, discuter entre collègues, négocier avec un client, un entretien d’embauche, le contrôle aux frontières et la conversation libre. Parlez en maintenant le bouton ; relâchez et le texte s’affiche.', alt: 'Écran de la liste des situations' },
      { shot: 'chat', label: 'Conversation', title: 'Vos phrases corrigées sur-le-champ', body: 'Sous ce que vous dites : une version plus naturelle et une ligne d’explication en français. Touchez ce que vous ne comprenez pas pour voir la traduction.', alt: 'Conversation avec une phrase corrigée sous le message' },
      { shot: 'speak', label: 'Répéter', title: 'Prononciation vérifiée mot par mot', body: 'Lisez la phrase corrigée à voix haute : chaque mot est évalué. L’app indique ce qui ne va pas, par exemple « le th de “this” prononcé comme un d », et le repère change quand c’est juste.', alt: 'Écran « Répéter » avec les mots signalés' },
      { shot: 'review', label: 'Révision', title: 'Les corrections s’ajoutent à la révision', body: 'Les tournures corrigées et les mots mal prononcés s’ajoutent à votre liste de révision.', alt: 'Écran de la liste de révision' },
      { shot: 'habit', label: 'Habitudes de prononciation', title: 'Les sons que vous ratez le plus, comptés', body: '« Habitudes de prononciation » compte les sons que vous ratez le plus, par exemple th → d, 12 fois.', alt: 'Détail d’une habitude de prononciation' },
    ],
    requirements: 'iPhone compatible avec Apple Intelligence, iOS 27 ou version ultérieure. Les explications s’affichent dans la langue de votre iPhone.',
  },
  'pt-BR': {
    title: 'Cockatoo | Fale inglês com IA e corrija a pronúncia',
    tagline: 'Corrige frases e pronúncia',
    lead: 'Para quando você não tem com quem falar inglês e não sabe onde está errando na pronúncia. Segure o botão e fale em inglês: a IA responde, deixa as frases estranhas mais naturais e, quando você lê a frase corrigida em voz alta, mostra palavra por palavra o que saiu errado.',
    rows: [
      { shot: 'situations', label: 'Situações', title: 'Fale inglês em 35 situações', body: 'Pedir num café, bater papo no trabalho, negociar com um cliente, entrevista de emprego, imigração no aeroporto e conversa livre. Fale enquanto segura o botão; ao soltar, vira texto.', alt: 'Tela com a lista de situações' },
      { shot: 'chat', label: 'Conversa', title: 'Suas frases corrigidas na hora', body: 'Embaixo do que você disse aparece uma frase mais natural com uma explicação de uma linha em português. Toque no que não entender para ver a tradução.', alt: 'Conversa com uma frase corrigida embaixo da mensagem' },
      { shot: 'speak', label: 'Repetir', title: 'Pronúncia conferida palavra por palavra', body: 'Leia a frase corrigida em voz alta e cada palavra é avaliada. Ele diz o que saiu errado, como “o th de ‘this’ saiu como d”, e a marcação muda quando você acerta.', alt: 'Tela Repetir com palavras marcadas' },
      { shot: 'review', label: 'Revisão', title: 'O que foi corrigido vira revisão', body: 'Expressões corrigidas e palavras pronunciadas errado vão para a sua lista de revisão.', alt: 'Tela da lista de revisão' },
      { shot: 'habit', label: 'Hábitos de pronúncia', title: 'Os sons que você mais erra, contados', body: 'Em “Hábitos de pronúncia” você vê quantas vezes erra cada som, por exemplo th → d, 12 vezes.', alt: 'Detalhe de um hábito de pronúncia' },
    ],
    requirements: 'iPhone compatível com a Apple Intelligence, iOS 27 ou posterior. As explicações aparecem no idioma do seu iPhone.',
  },
};

// Harubox product page copy, one entry per Harubox language. Text follows the App Store listing
// (malhaedum docs/store/<locale>.md). Screenshot rows are drawn only when
// public/assets/harubox/<lang>-<shot>.webp exists.
type HaruboxRow = { shot: string; label: string; title: string; body: string; alt: string };
export const HARUBOX_PAGE: Record<HaruboxLang, { title: string; tagline: string; lead: string; rows: HaruboxRow[]; requirements: string }> = {
  ko: {
    title: '하루박스 | 종일 녹음·받아쓰기·요약',
    tagline: '종일 녹음·받아쓰기·요약',
    lead: '아침에 녹음 켜 두고 폰은 주머니에. 퇴근길에 열어 보면 오늘 오간 말이 글로 정리돼 있어요. 회의든 수업이든 통화든 하루 종일 켜 둬도 안 끊기고, 받아쓰기랑 요약은 폰 안에서 끝나요.',
    rows: [
      { shot: 'record', label: '녹음', title: '화면을 꺼도 하루 종일 녹음해요', body: '녹음 버튼을 한 번 누르면 다른 앱을 써도 계속 녹음해요. 시간 한도가 없고, 전화나 알람에 끊기면 끝난 뒤 저절로 이어서 녹음해요. 녹음하면서 북마크와 메모도 남겨요.', alt: '녹음 중 화면' },
      { shot: 'conversation', label: '받아쓰기', title: '받아쓴 대화를 구간별로 봐요', body: '받아쓰기는 iPhone 안에서 해요. 구간마다 시간과 말한 사람이 나뉘어 보이고, 문장을 누르면 그 자리부터 다시 들어요.', alt: '구간별 시간과 화자가 나뉜 받아쓰기 화면' },
      { shot: 'summary', label: '요약', title: '요약과 할 일을 정리해요', body: '녹음마다 요약, 주제, 다음 할 일을 정리해요. 할 일은 미리알림에, 일정은 캘린더에 넣고, 넣기 전에 항목마다 확인해요.', alt: '요약과 할 일 화면' },
      { shot: 'speakers', label: '화자', title: '화자 이름을 바꾸고 합쳐요', body: '나뉜 화자에 실제 이름을 붙이고, 같은 사람이 둘로 나뉘었으면 합쳐요. 문장별로 고치는 것도 돼요.', alt: '화자 목록 화면' },
      { shot: 'list', label: '녹음 목록', title: '모든 녹음에서 검색해요', body: '모든 녹음에서 검색하고, 찾은 문장을 누르면 그 자리부터 들어요. 받아쓰기는 녹음이 끝나면 바로, 또는 충전 중일 때만 하도록 고를 수 있어요.', alt: '녹음 목록 화면' },
    ],
    requirements: '모든 기능이 무료예요. 시간 제한도 인앱 구매도 없어요. iOS 26 이상, 요약에는 Apple Intelligence가 필요해요. Apple Watch 녹음은 watchOS 26 이상.',
  },
  en: {
    title: 'Harubox | All-Day Recorder with On-Device Transcription',
    tagline: 'All-day recorder with on-device transcription',
    lead: 'Start recording in the morning and put your phone in your pocket. By the commute home, the day\'s conversations are already written down. Meeting, class or phone call, it runs all day without cutting out, and transcripts and summaries are made on the phone.',
    rows: [
      { shot: 'record', label: 'Recording', title: 'Keeps recording with the screen off', body: 'Tap record once and it keeps going while you use other apps. There is no time limit, and if a call or an alarm interrupts, it picks up again by itself. Add bookmarks and notes as you record.', alt: 'Recording screen' },
      { shot: 'conversation', label: 'Transcript', title: 'Read the conversation by segment', body: 'Transcription runs on your iPhone. Each segment shows its time and who spoke, and tapping a sentence plays from that spot.', alt: 'Transcript screen with time and speaker for each segment' },
      { shot: 'summary', label: 'Summary', title: 'Summary and to-dos for each recording', body: 'Each recording gets a summary, topics and next steps. To-dos go to Reminders and events to Calendar, and you confirm each item before it is added.', alt: 'Summary and to-dos screen' },
      { shot: 'speakers', label: 'Speakers', title: 'Rename and merge speakers', body: 'Give each speaker a real name, and merge two speakers that are the same person. You can also edit sentence by sentence.', alt: 'Speakers screen' },
      { shot: 'list', label: 'Recordings', title: 'Search across all recordings', body: 'Search every recording and tap a result to play from that spot. Transcribe right after recording, or only while charging.', alt: 'Recordings list screen' },
    ],
    requirements: 'Everything is free, with no time limits and no in-app purchases. Requires iOS 26 or later. Summaries need Apple Intelligence. Apple Watch recording needs watchOS 26 or later.',
  },
  ja: {
    title: 'Harubox | 終日録音・文字起こし・要約',
    tagline: '終日録音・文字起こし・要約',
    lead: '朝に録音を始めれば、止めるまで録り続けます。会議、講義、通話、一日まるごと。文字起こし、話者分離、要約はすべてiPhone内で処理し、録音時間の上限はありません。',
    rows: [
      { shot: 'record', label: '録音', title: '画面を消しても一日中録音', body: '録音ボタンを一度押せば、ほかのアプリを使っていても録音を続けます。時間制限はなく、電話やアラームで中断されても、終わると自動で再開します。録音しながらブックマークとメモも残せます。', alt: '録音中の画面' },
      { shot: 'conversation', label: '文字起こし', title: '会話を区間ごとに読める', body: '文字起こしはiPhone内で行います。区間ごとに時間と話者が分かれて表示され、文をタップするとその位置から再生します。', alt: '区間ごとに時間と話者が分かれた文字起こし画面' },
      { shot: 'summary', label: '要約', title: '要約とやることをまとめる', body: '録音ごとに、要約、話題、次にやることをまとめます。やることはリマインダーへ、予定はカレンダーへ入れ、追加する前に項目ごとに確認します。', alt: '要約とやることの画面' },
      { shot: 'speakers', label: '話者', title: '話者名の変更と統合', body: '分けられた話者に名前をつけ、同じ人が二人に分かれていれば統合します。文ごとの修正もできます。', alt: '話者の画面' },
      { shot: 'list', label: '録音一覧', title: 'すべての録音から検索', body: 'すべての録音から検索し、見つかった文をタップするとその位置から再生します。文字起こしは録音の直後か、充電中だけかを選べます。', alt: '録音一覧の画面' },
    ],
    requirements: 'すべて無料で、時間制限もアプリ内課金もありません。iOS 26以降が必要です。要約はApple Intelligenceをオンにした機種で使えます。Apple Watchでの録音はwatchOS 26以降。',
  },
  'zh-Hant': {
    title: 'Harubox | 整天錄音、逐字稿、摘要',
    tagline: '整天錄音、逐字稿、摘要',
    lead: '早上開始錄音，到你按停止為止都會持續錄。會議、上課、通話，或是一整天。逐字稿、講者辨識和摘要都在 iPhone 上完成，錄音時間沒有上限。',
    rows: [
      { shot: 'record', label: '錄音', title: '關掉螢幕也能整天錄音', body: '按一下錄音，使用其他 App 時也會繼續錄。沒有時間限制，被來電或鬧鈴打斷時，結束後會自動接著錄。錄音時也能加書籤和備註。', alt: '錄音中的畫面' },
      { shot: 'conversation', label: '逐字稿', title: '依區段閱讀對話', body: '逐字稿在 iPhone 上產生。每個區段都顯示時間和說話的人，點一下句子就從那裡開始播放。', alt: '依區段顯示時間與講者的逐字稿畫面' },
      { shot: 'summary', label: '摘要', title: '整理摘要與待辦', body: '每段錄音都會整理出摘要、主題和接下來要做的事。待辦加入「提醒事項」，行程加入「行事曆」，加入前會逐項請你確認。', alt: '摘要與待辦畫面' },
      { shot: 'speakers', label: '講者', title: '重新命名並合併講者', body: '替分開的講者取真實名字，同一個人被分成兩位時可以合併。也能逐句修改。', alt: '講者畫面' },
      { shot: 'list', label: '錄音列表', title: '在所有錄音中搜尋', body: '在所有錄音中搜尋，點一下結果就從那一句開始播放。逐字稿可選擇錄完立刻處理，或只在充電時處理。', alt: '錄音列表畫面' },
    ],
    requirements: '全部免費，沒有時間限制，也沒有 App 內購買。需要 iOS 26 以上。摘要需在開啟 Apple Intelligence 的裝置上使用。Apple Watch 錄音需要 watchOS 26 以上。',
  },
  de: {
    title: 'Harubox | Ganztägig aufnehmen mit Transkription auf dem iPhone',
    tagline: 'Transkription auf dem iPhone',
    lead: 'Morgens starten, abends stoppen: Harubox nimmt durch. Besprechungen, Vorlesungen, Telefonate oder ein ganzer Arbeitstag. Transkript, Sprechertrennung und Zusammenfassung laufen auf deinem iPhone, gratis und ohne Limit.',
    rows: [
      { shot: 'record', label: 'Aufnahme', title: 'Nimmt auch bei ausgeschaltetem Bildschirm auf', body: 'Einmal auf Aufnahme tippen, und es läuft weiter, auch in anderen Apps. Keine Zeitgrenze. Unterbricht ein Anruf oder ein Wecker, geht die Aufnahme danach von selbst weiter. Lesezeichen und Notizen setzt du während der Aufnahme.', alt: 'Aufnahmebildschirm' },
      { shot: 'conversation', label: 'Transkript', title: 'Das Gespräch Abschnitt für Abschnitt lesen', body: 'Das Transkript entsteht auf dem iPhone. Jeder Abschnitt zeigt Zeit und Sprecher, und ein Tipp auf einen Satz spielt ab dieser Stelle ab.', alt: 'Transkript mit Zeit und Sprecher pro Abschnitt' },
      { shot: 'summary', label: 'Zusammenfassung', title: 'Zusammenfassung und Aufgaben je Aufnahme', body: 'Zu jeder Aufnahme gibt es eine Zusammenfassung, Themen und nächste Schritte. Aufgaben gehen in Erinnerungen, Termine in den Kalender. Jeden Eintrag bestätigst du vorher.', alt: 'Bildschirm mit Zusammenfassung und Aufgaben' },
      { shot: 'speakers', label: 'Sprecher', title: 'Sprecher umbenennen und zusammenführen', body: 'Gib jedem Sprecher einen echten Namen und führe zwei Sprecher zusammen, die dieselbe Person sind. Auch Satz für Satz lässt sich bearbeiten.', alt: 'Sprecherbildschirm' },
      { shot: 'list', label: 'Aufnahmen', title: 'Suche über alle Aufnahmen', body: 'Durchsuche alle Aufnahmen und spiele ab einem Treffer ab. Transkribiert wird direkt nach der Aufnahme oder nur beim Laden.', alt: 'Aufnahmenliste' },
    ],
    requirements: 'Alles ist gratis, ohne Zeitlimit und ohne In-App-Käufe. Erfordert iOS 26 oder neuer. Zusammenfassungen brauchen ein Gerät mit aktivierter Apple Intelligence. Aufnahmen mit der Apple Watch brauchen watchOS 26 oder neuer.',
  },
  es: {
    title: 'Harubox | Grabadora todo el día con transcripción en tu iPhone',
    tagline: 'Transcripción en tu iPhone',
    lead: 'Empieza a grabar por la mañana y sigue hasta que la pares. Reuniones, clases, llamadas o una jornada entera. Transcripción, hablantes y resumen se hacen en tu iPhone, gratis y sin límites.',
    rows: [
      { shot: 'record', label: 'Grabación', title: 'Sigue grabando con la pantalla apagada', body: 'Pulsa grabar una vez y sigue mientras usas otras apps. Sin límite de tiempo. Si una llamada o una alarma la interrumpe, continúa sola al terminar. Añade marcadores y notas mientras grabas.', alt: 'Pantalla de grabación' },
      { shot: 'conversation', label: 'Transcripción', title: 'Lee la conversación por tramos', body: 'La transcripción se hace en tu iPhone. Cada tramo muestra la hora y quién habla, y al tocar una frase se reproduce desde ahí.', alt: 'Transcripción con hora y hablante por tramo' },
      { shot: 'summary', label: 'Resumen', title: 'Resumen y tareas de cada grabación', body: 'Cada grabación tiene resumen, temas y próximos pasos. Las tareas van a Recordatorios y los eventos a Calendario. Confirmas cada elemento antes de añadirlo.', alt: 'Pantalla de resumen y tareas' },
      { shot: 'speakers', label: 'Hablantes', title: 'Renombra y une hablantes', body: 'Ponle un nombre real a cada hablante y une los que son la misma persona. También puedes corregir frase por frase.', alt: 'Pantalla de hablantes' },
      { shot: 'list', label: 'Grabaciones', title: 'Busca en todas las grabaciones', body: 'Busca en todas las grabaciones y toca un resultado para reproducir desde ahí. Transcribe nada más grabar, o solo mientras carga.', alt: 'Lista de grabaciones' },
    ],
    requirements: 'Todo es gratis, sin límites de tiempo ni compras dentro de la app. Requiere iOS 26 o posterior. El resumen necesita un dispositivo con Apple Intelligence activada. Grabar con el Apple Watch requiere watchOS 26 o posterior.',
  },
  fr: {
    title: 'Harubox | Dictaphone illimité avec transcription sur l\'iPhone',
    tagline: 'Transcription sur l\'iPhone',
    lead: 'Lancez l\'enregistrement le matin, il continue jusqu\'à l\'arrêt. Réunions, cours, appels ou toute une journée de travail. Transcription, locuteurs et résumé se font sur votre iPhone, gratuitement et sans limite.',
    rows: [
      { shot: 'record', label: 'Enregistrement', title: 'Continue d\'enregistrer écran éteint', body: 'Appuyez une fois sur enregistrer, et il continue pendant que vous utilisez d\'autres apps. Pas de limite de durée. Si un appel ou une alarme l\'interrompt, il reprend seul ensuite. Ajoutez des repères et des notes pendant l\'enregistrement.', alt: 'Écran d\'enregistrement' },
      { shot: 'conversation', label: 'Transcription', title: 'Lisez la conversation par segment', body: 'La transcription se fait sur votre iPhone. Chaque segment affiche l\'heure et qui parle, et toucher une phrase lance la lecture à partir de là.', alt: 'Transcription avec heure et locuteur par segment' },
      { shot: 'summary', label: 'Résumé', title: 'Résumé et tâches pour chaque enregistrement', body: 'Chaque enregistrement reçoit un résumé, des sujets et les prochaines étapes. Les tâches vont dans Rappels, les événements dans Calendrier. Vous confirmez chaque élément avant l\'ajout.', alt: 'Écran du résumé et des tâches' },
      { shot: 'speakers', label: 'Locuteurs', title: 'Renommez et fusionnez les locuteurs', body: 'Donnez un vrai nom à chaque locuteur et fusionnez ceux qui sont la même personne. Vous pouvez aussi corriger phrase par phrase.', alt: 'Écran des locuteurs' },
      { shot: 'list', label: 'Enregistrements', title: 'Recherche dans tous les enregistrements', body: 'Recherchez dans tous les enregistrements et touchez un résultat pour lire à partir de là. Transcrivez juste après l\'enregistrement, ou seulement pendant la charge.', alt: 'Liste des enregistrements' },
    ],
    requirements: 'Tout est gratuit, sans limite de temps ni achat intégré. Nécessite iOS 26 ou plus récent. Le résumé demande un appareil avec Apple Intelligence activée. L\'enregistrement sur Apple Watch nécessite watchOS 26 ou plus récent.',
  },
  'pt-BR': {
    title: 'Harubox | Gravador o dia todo com transcrição no iPhone',
    tagline: 'Transcrição no seu iPhone',
    lead: 'Comece a gravar de manhã e ele segue até você parar. Reuniões, aulas, ligações ou um dia de trabalho inteiro. Transcrição, falantes e resumo rodam no seu iPhone, grátis e sem limites.',
    rows: [
      { shot: 'record', label: 'Gravação', title: 'Continua gravando com a tela apagada', body: 'Toque em gravar uma vez e ele segue enquanto você usa outros apps. Sem limite de tempo. Se uma ligação ou um alarme interromper, a gravação continua sozinha depois. Adicione marcadores e notas enquanto grava.', alt: 'Tela de gravação' },
      { shot: 'conversation', label: 'Transcrição', title: 'Leia a conversa por trechos', body: 'A transcrição é feita no seu iPhone. Cada trecho mostra o horário e quem falou, e tocar em uma frase reproduz a partir dali.', alt: 'Transcrição com horário e falante por trecho' },
      { shot: 'summary', label: 'Resumo', title: 'Resumo e tarefas de cada gravação', body: 'Cada gravação ganha resumo, tópicos e próximos passos. As tarefas vão para Lembretes e os eventos para Calendário. Você confirma cada item antes de adicionar.', alt: 'Tela de resumo e tarefas' },
      { shot: 'speakers', label: 'Falantes', title: 'Renomeie e junte falantes', body: 'Dê um nome real a cada falante e junte os que são a mesma pessoa. Também dá para corrigir frase por frase.', alt: 'Tela de falantes' },
      { shot: 'list', label: 'Gravações', title: 'Pesquise em todas as gravações', body: 'Pesquise em todas as gravações e toque em um resultado para ouvir a partir dali. Transcreva logo após gravar, ou só durante o carregamento.', alt: 'Lista de gravações' },
    ],
    requirements: 'Tudo é grátis, sem limite de tempo e sem compras no app. Requer iOS 26 ou posterior. O resumo precisa de um aparelho com Apple Intelligence ativada. Gravar com o Apple Watch requer watchOS 26 ou posterior.',
  },
};

// File names the previous Peakly site used (/privacy-en.html). They are kept
// as redirects so old store and in-app links can be pointed here later.
export function legacySlugs(): { slug: string; to: string }[] {
  const legacyLangs = LANGS.filter((lang) => SUFFIX[lang] !== undefined);
  const docs = (['privacy', 'terms', 'support'] as const).flatMap((doc) =>
    legacyLangs.map((lang) => ({ slug: `${doc}${SUFFIX[lang]}`, to: href(doc, lang) })),
  );
  return [...docs, { slug: 'index-en', to: href('home', 'en') }, { slug: 'index-ja', to: href('home', 'ja') }];
}

// DEAD DISTRICT is served from its own repository's Pages site (hyperfocuslab/dead-district); dead-district.hyperfocuslab.app redirects here.
export const GAME_URL = '/dead-district/';

export const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語', 'zh-Hant': '繁體中文' };
// Short code shown in the header switch.
export const LANG_CODE: Record<Lang, string> = { ko: 'KO', en: 'EN', ja: 'JA', 'zh-Hant': 'ZH' };

export const ui = {
  ko: {
    appName: '피클리',
    nav: { contact: '문의', language: '언어 선택', main: '주요 메뉴' },
    docs: { privacy: '개인정보처리방침', terms: '서비스 이용약관', support: '고객지원' },
    footer: { products: '제품', language: '언어', legal: '© Hyperfocus Lab' },
    home: {
      title: 'Hyperfocus Lab | 피클리 · Sheltie · 코카투 · 하루박스',
      description: '피클리는 복용 시각을 기록하면 하루 동안의 예상 약효 곡선을 그려 주는 ADHD 복약 기록 앱이에요. Sheltie는 PC의 코딩 에이전트가 멈추면 폰 잠금화면에서 바로 허용하는 앱, 코카투는 영어로 말하면 문장을 고쳐 주고 발음을 단어별로 짚어 주는 앱, 하루박스는 하루 종일 녹음하고 받아쓰기와 요약을 iPhone 안에서 하는 앱이에요.',
      company: 'Hyperfocus Lab은 자체 소프트웨어 제품을 만들고 운영하는 스튜디오예요.',
      more: '자세히 보기 →',
      peaklyTitle: '피클리 | ADHD 복약 기록 앱',
      peaklyDescription: '복용 시각을 기록하면 하루 동안의 예상 약효 곡선을 그려 줘요. 기분과 목표, 할 일도 같은 앱에 기록해요. iPhone · iPad · Android.',
      products: {
        title: '제품',
        facts: [
          ['플랫폼', 'iPhone · iPad · Android'],
          ['언어', '한국어 · English · 日本語 · 繁體中文'],
        ],
        more: '피클리 페이지로',
      },
      sheltie: {
        title: 'Sheltie | 코딩 에이전트 승인 앱',
        tagline: '코딩 에이전트 승인 앱',
        lead: 'PC에서 돌리는 코딩 에이전트가 권한이나 질문에서 멈추면 iPhone으로 알림이 와요. 잠금화면에서 바로 허용하거나 거부하고, 앱에서는 대화를 읽거나 새 작업을 시작해요. Android 앱은 비공개 테스트 중이에요. 무료고, PC 쪽 서버는 오픈소스예요.',
        // Home card only (ko): the detail page keeps the lead above.
        cardLead: 'Claude Code나 Codex 돌려 놓고 자리 비웠다가, "이 파일 만들어도 될까요?" 하나에 20분째 멈춰 있던 적 있죠. 에이전트가 멈추면 바로 폰으로 알림이 와요. 잠금화면에서 허용만 누르면 다시 돌아가요. 다음에 에이전트 돌려 놓고 자리 비울 때 써 보세요.',
        cardNote: '무료예요. PC 쪽 서버는 오픈소스고, Android는 비공개 테스트 중이에요.',
        rows: [
            { shot: 'notif', label: '알림', title: '앱을 열지 않고 답해요', body: '알림을 길게 누르면 허용, 이 세션 동안 허용, 거부가 나와요. 답을 보내기 직전에 터미널 메뉴가 그대로인지 한 번 더 확인하고요.', alt: '알림을 길게 눌러 나온 허용·거부 메뉴' },
            { shot: 'lock', label: '잠금화면', title: '기다리는 에이전트가 잠금화면에 보여요', body: 'Live Activity로 지금 몇 개가 멈춰 있고 각각 뭘 기다리는지 보여 줘요. 다이나믹 아일랜드에도 떠요.', alt: '잠금화면의 Live Activity와 알림' },
            { shot: 'approve', label: '승인', title: '뭘 허용하는지 보고 눌러요', body: '만들 파일 내용이나 실행할 명령이 카드로 나오고, 터미널에 뜬 선택지가 그대로 버튼이 돼요.', alt: '파일 생성 승인 카드' },
            { shot: 'list', label: '목록', title: '여러 PC를 한 목록에서', body: 'PC별, 폴더별로 모든 세션을 한 목록에서 봐요. 멈춘 에이전트가 맨 위에 오고, 뭘 기다리는지와 몇 분째인지도 같이 나와요.', alt: 'MacBook과 Mac mini의 에이전트 세션 목록' },
            { shot: 'question', label: '질문', title: '선택지를 고르거나 직접 적어요', body: '에이전트가 묻는 질문, 계획 승인, 질문 여러 개를 한 번에 묻는 화면도 카드로 답해요.', alt: '질문 선택지 카드' },
            { shot: 'term', label: '터미널', title: 'PC 터미널을 실시간으로', body: '터미널 화면을 그대로 보면서 숫자, 화살표, 엔터 키를 보내요. 카드로 안 나오는 메뉴도 여기서 답하면 돼요.', alt: '실시간 터미널 화면과 키 버튼' },
            { shot: 'files', label: '파일', title: 'PC 폴더를 폰에서 열어요', body: '에이전트가 일하는 폴더의 파일과 하위 폴더를 크기, 수정 시각과 같이 봐요.', alt: 'PC 폴더의 파일 목록' },
            { shot: 'chat', label: '대화', title: '폰에서 이어서 일해요', body: '지금까지 대화를 읽고 메시지를 보내요. 파일이나 사진을 붙여 보낼 수 있고, 폴더를 골라 새 에이전트를 띄울 수도 있어요.', alt: '대화 화면의 파일·사진 첨부 메뉴' },
            { shot: 'usage', label: '사용량', title: '한도와 비용을 PC별로', body: 'Claude Code의 5시간·주간 한도와 초기화까지 남은 시간, 날짜별·모델별 비용을 봐요.', alt: '사용 한도와 일별 비용 그래프' },
        ],
        agentsLabel: '지원 에이전트',
        agents: 'Claude Code · Codex · Gemini CLI · Qwen Code · OpenCode · Grok · GitHub Copilot CLI · Cursor Agent · Amp',
        requirements: 'Claude Code나 Codex를 돌리는 Mac이나 Windows PC, 그리고 Tailscale만 있으면 돼요. 승인과 질문 답은 평소 쓰던 터미널에서 그대로 돼요. 실시간 터미널, 폰에서 메시지 보내기와 새 작업 시작, 다른 에이전트는 herdr-core로 돌릴 때 쓸 수 있어요. 설치는 명령 한 줄 붙여 넣고 QR 찍으면 끝나요.',
        android: {
          button: 'Android 테스트 참여',
          label: 'Android 비공개 테스트',
          steps: ['구글 그룹 가입', '테스트 참여', 'Google Play에서 설치'],
          note: '그룹에 먼저 가입해야 테스트 참여 링크가 열려요. 가입한 이메일은 개발자만 봐요. 정식 출시까지는 테스터 12명이 14일 동안 앱을 깔아 둬야 하고요.',
        },
      },
      soon: '지금 App Store 심사 중이에요.',
      cockatoo: {
        tagline: '말하면 고쳐 주고, 다시 말해 익히기',
        lead: '영어로 말해 보면 더 자연스러운 문장으로 고쳐 줘요. 그 문장을 따라 말하면 어느 발음이 틀렸는지 단어마다 짚어 주고요. 카페 주문부터 영어 면접까지 35개 상황 중 하나 골라 말해 보세요.',
      },
      harubox: {
        tagline: '종일 녹음·받아쓰기·요약',
        lead: '아침에 녹음 켜 두고 폰은 주머니에. 퇴근길에 열어 보면 오늘 오간 말이 글로 정리돼 있어요. 회의든 수업이든 통화든 하루 종일 켜 둬도 안 끊기고, 받아쓰기랑 요약은 폰 안에서 끝나요. 내일 아침, 녹음 켜고 하루를 보내 보세요.',
      },
      game: {
        tagline: '브라우저 좀비 슈터',
        lead: '폐허가 된 도시에서 연구물질을 챙겨 헬기까지 가는 3인칭 슈팅 게임이에요. 소총부터 도끼, 화염병까지 쓸 수 있는데, 총을 쏘면 그 소리에 좀비가 몰려와요. 탈출하면 처치 수로 온라인 랭킹에 오르고요. 설치 없이 지금 PC나 폰 브라우저에서 한 판 해 보세요.',
        play: '바로 플레이 ↗',
        alt: 'DEAD DISTRICT 게임 화면: 비 오는 폐허 거리에서 소총을 든 플레이어와 좀비들',
      },
      peakly: {
        tagline: 'ADHD 복약 기록 앱',
        lead: '약 먹은 시각을 기록하면 지금 약효가 오르는 중인지, 가장 강할 때인지, 줄어드는 중인지 보여 줘요. 목표와 루틴, 할 일도 같이 챙길 수 있어요.',
        // Home card only (ko): the Peakly page keeps the lead above.
        cardLead: '약 먹은 시각만 남기면 돼요. 지금 약효가 오르는 중인지, 가장 강할 때인지, 빠지는 중인지 곡선으로 보여 줘요. 목표랑 루틴, 할 일도 같은 앱에서 챙겨요. 오늘 약 먹을 때 시각부터 남겨 보세요.',
        sections: [
          {
            tab: '복약',
            intro: '복용 시각을 기록하면 하루 동안 약효가 어떻게 변하는지 그려져요.',
            rows: [
              { shot: 'chart', label: '예상 약효 곡선', title: '지금 약효가 어디쯤인지.', body: '콘서타와 메디키넷의 알려진 약효 변화를 바탕으로 시간대별 예상 약효를 그려요. 지금 약효가 오르는 중인지, 가장 강할 때인지, 줄어드는 중인지 알 수 있고, 단계별 시간은 내 몸에 맞게 고칠 수 있어요. Apple Watch를 쓰면 곡선 아래에 심박수와 움직임도 시간대별로 나와요.', alt: '콘서타 예상 약효 곡선과 그 아래 심박수, 움직임 그래프가 있는 피클리 복약 화면', note: '예상 곡선은 참고용이에요. 의학적 판단을 대신하지 않아요.' },
              { shot: 'mood', label: '기분 체크인', title: '기분은 한 번 탭으로, 메모는 한 줄로.', body: '다섯 가지 표정 중 하나를 누르면 그 시각의 기분이 남아요. 하루에 몇 번이든 남길 수 있고, 남긴 기분은 약효 곡선 아래 그 시각 자리에 표시돼요. 표정 아래 칸에 한 줄 메모도 적을 수 있어요.', alt: '다섯 가지 표정과 메모 줄이 있는 기분 카드, 그 아래 약효 곡선과 기분 기록 띠가 있는 피클리 복약 화면' },
              { shot: 'lock', label: '다이나믹 아일랜드·잠금 화면', title: '남은 약효 시간이 늘 화면 위에.', body: 'iPhone은 다이나믹 아일랜드와 잠금 화면, Apple Watch 스마트 스택에, Android는 알림 영역에 남은 약효 시간이 계속 떠 있어요. 약효가 오를 때, 최대 농도 구간에 들어설 때, 끝나갈 때는 알림이 와요. 위젯과 잠금 화면에서 약 이름과 이미지를 숨길 수도 있어요.', alt: '다이나믹 아일랜드와 잠금 화면에 콘서타 36mg 메인 피크와 남은 시간이 표시된 iPhone' },
              { shot: 'report', label: 'PDF 리포트', title: '진료 때 보여줄 기록을 PDF로.', body: '기간을 고르면 두 장짜리 복약 리포트가 PDF로 나와요. 복용 기록, 이전 기간과 비교한 컨디션 변화, 하루 중 약효 흐름, 일별 메모, 진료 때 물어볼 질문이 들어가요.', alt: '복용 기록과 컨디션 변화가 정리된 PDF 리포트 첫 장 미리보기' },
            ],
          },
          {
            tab: '목표',
            intro: '큰 목표에 기한을 정하고, 오늘 할 일로 나눠요.',
            rows: [
              { shot: 'goals', label: '전체 목표', title: '목표는 진행률로, 기다리는 날은 D-Day로.', body: '자격증, 다이어트, 포트폴리오처럼 큰 목표에 날짜를 붙이면 진행률과 남은 기간이 같이 보여요. 여행, 시험일, 기념일처럼 날짜가 정해진 일은 D-Day로 띄워 둬요.', alt: 'D-Day와 목표별 진행률이 있는 전체 목표 화면' },
              { shot: 'goals-today', label: '오늘의 목표', title: '목표를 오늘 할 일로 나눠서.', body: '큰 목표를 오늘 할 작은 일로 나누고 하나씩 체크해요.', alt: '오늘의 목표 진행률과 작은 실천 목록' },
            ],
          },
          {
            tab: '할 일',
            intro: '매일 하는 일과 마감이 있는 일을 나눠서.',
            rows: [
              { shot: 'routines', label: '매일 루틴', title: '정한 시간에 할 일, 아무 때나 할 일.', body: '기상이나 산책처럼 시간이 정해진 일은 시간별 루틴으로, 스트레칭처럼 하루 중 아무 때나 하면 되는 일은 언제나 루틴으로 나눠요. 지난 7일과 이번 달에 못 한 횟수도 보여 줘요.', alt: '시간별 루틴과 언제나 루틴이 있는 매일 루틴 화면' },
              { shot: 'todo', label: '해야 할 일', title: '마감이 가까운 일부터.', body: '마감이 있는 일을 오늘까지, 이번 주, 그 이후로 나눠서 보여 줘요.', alt: '남은 시간별로 나뉜 해야 할 일 목록' },
            ],
          },
          {
            tab: '기록',
            intro: '지나간 날과 그날 기분을 남겨 둬요.',
            rows: [
              { shot: 'calendar', label: '캘린더', title: '지난 날을 한눈에.', body: '날짜마다 복약, 목표, 할 일 기록이 점으로 찍혀요. 날짜를 누르면 그날 먹은 약과 끝낸 목표·할 일이 나오고, 지난 기록은 검색으로 찾을 수 있어요. 그날 기분과 메모를 남겨 두면 진료 때 그동안 어땠는지 설명하기 쉬워요.', alt: '복약, 목표, 할 일이 점으로 표시된 캘린더' },
            ],
          },
          {
            tab: '설정',
            intro: '언어와 화면, 백업까지 내게 맞게.',
            rows: [
              { shot: 'settings', label: '내 방식대로', title: '언어와 화면을 내게 맞게.', body: '한국어, 영어, 일본어, 중국어(번체)를 지원하고 다크·라이트 모드와 글꼴도 고를 수 있어요. 목표 취침·기상 시간을 정해 두면 약효가 잠잘 때까지 남을지 미리 알려 줘요.', alt: '언어, 디스플레이 모드, 글꼴, 목표 취침·기상 시간이 있는 설정 화면' },
              { shot: 'backup', label: '백업·복구', title: '폰을 바꿔도 기록은 그대로.', body: '복약 기록과 건강 데이터는 외부 서버로 보내지 않고, 기기와 내 iCloud(Android는 Google Drive)에만 저장돼요. 자동으로 백업되고, 필요하면 바로 백업하거나 파일로 내보낼 수도 있어요.', alt: 'iCloud 백업, 지금 백업, 데이터 내보내기와 가져오기가 있는 백업·복구 화면' },
            ],
          },
          {
            tab: '위젯',
            intro: '홈 화면과 잠금 화면에서 바로.',
            rows: [
              { shot: 'widgets', label: '홈 화면 위젯', title: '앱을 열지 않아도.', body: '약효 상태, 목표 D-Day, 목표별 진행률, 매일 루틴, 해야 할 일, 컨디션, 캘린더를 홈 화면과 잠금 화면 위젯으로 둘 수 있어요.', alt: '약효 곡선 위젯과 목표 D-Day 위젯이 있는 iPhone 홈 화면' },
            ],
          },
        ],
        featuresTitle: '그 밖의 기능',
        features: [
          { title: 'Apple Watch 연동', platforms: ['iOS'], body: 'Apple Watch가 기록한 심박수, 움직임, 수면, 운동을 건강 앱에서 가져와 같이 보여 줘요. 남은 약효 시간은 워치 스마트 스택에도 떠요.' },
          { title: '단계별 알림', platforms: ['iOS', 'Android'], body: '약효가 오르기 시작할 때, 피크에 들어설 때, 줄어들기 시작할 때 알려 줘요. 항목별로 켜고 끌 수 있어요.' },
          { title: '심박수 반응', platforms: ['iOS'], body: '복용 후 심박수를 평소와 비교하고, 심박수가 오른 이유가 약효인지 활동 때문인지 추정해요.' },
          { title: '직접 추가하는 약', platforms: ['iOS', 'Android'], body: '지원 목록에 없는 약 종류와 이미지도 직접 추가해서 기록할 수 있어요.' },
          { title: '제어 센터에서 복용 기록', platforms: ['iOS'], body: '앱을 열지 않고도 제어 센터나 잠금 화면 버튼으로 복용을 기록할 수 있어요.' },
          { title: 'iPad 지원', platforms: ['iPadOS'], body: 'iPad에서도 같은 Apple 계정의 iPhone과 기록이 동기화돼요.' },
        ],
        closing: { title: '오늘 먹은 약부터 기록해 보세요.' },
      },
    },
  },
  en: {
    appName: 'Peakly',
    nav: { contact: 'Contact', language: 'Language', main: 'Main' },
    docs: { privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Support' },
    footer: { products: 'Products', language: 'Language', legal: '© Hyperfocus Lab' },
    home: {
      title: 'Hyperfocus Lab | Peakly · Sheltie · Cockatoo · Harubox',
      description: "Peakly is an ADHD medication tracker that draws the day's estimated effect curve from your dose times. Sheltie lets you approve coding agents on your computer from your phone's Lock Screen. Cockatoo corrects the English you speak and checks your pronunciation word by word. Harubox records all day and transcribes and summarizes on your iPhone.",
      company: 'Hyperfocus Lab is a studio that builds and runs its own software products.',
      more: 'Learn more →',
      peaklyTitle: 'Peakly | ADHD medication tracker',
      peaklyDescription: "Log when you take your medication and Peakly draws the day's estimated effect curve. Mood, goals, and to-dos are in the same app. iPhone, iPad, Android.",
      products: {
        title: 'Products',
        facts: [
          ['Platforms', 'iPhone · iPad · Android'],
          ['Languages', '한국어 · English · 日本語 · 繁體中文'],
        ],
        more: 'Go to Peakly',
      },
      sheltie: {
        title: 'Sheltie | Approve coding agents from your phone',
        tagline: 'Approve coding agents from your phone',
        lead: 'When a coding agent on your computer stops for a permission or a question, your phone gets a notification. Allow or deny right from the Lock Screen, read the conversation, and start new tasks from the app. The Android app is in closed testing. Free, with an open-source server.',
        // Home card only (en): the Sheltie page keeps the lead above.
        cardLead: 'You leave Claude Code or Codex running, step away, and come back to find it stuck for 20 minutes on "Can I create this file?" With Sheltie, your phone buzzes the moment an agent stops. Tap Allow on the Lock Screen and it gets back to work. Try it the next time you leave an agent running.',
        cardNote: 'It\'s free, and the server on your computer is open source. Android is in closed testing.',
        rows: [
            { shot: 'notif', label: 'Notifications', title: 'Answer without opening the app', body: 'Long-press the notification for Allow, Allow for this session, or Deny. Right before answering, Sheltie checks the terminal menu hasn\'t changed.', alt: 'Allow and deny menu on a long-pressed notification' },
            { shot: 'lock', label: 'Lock Screen', title: 'Stuck agents on your Lock Screen', body: 'A Live Activity shows how many agents are stuck and what they\'re waiting for. It also sits in the Dynamic Island.', alt: 'Live Activity and notification on the Lock Screen' },
            { shot: 'approve', label: 'Approvals', title: 'See what you\'re allowing', body: 'The card shows the file it will write or the command it will run, with the same choices the terminal offers as buttons.', alt: 'Approval card for creating a file' },
            { shot: 'list', label: 'List', title: 'All your computers in one list', body: 'Every session from every computer and folder in one list. Stuck agents come first, with what they\'re waiting for and for how long.', alt: 'Agent sessions on a MacBook and a Mac mini' },
            { shot: 'question', label: 'Questions', title: 'Pick an option or type your own', body: 'Answer agent questions, plan approvals, and multi-question forms as cards.', alt: 'Question card with options' },
            { shot: 'term', label: 'Terminal', title: 'Your terminal, live', body: 'Watch the terminal as it runs and send number, arrow, and Enter keys. Menus that don\'t fit a card can be answered here.', alt: 'Live terminal with key buttons' },
            { shot: 'files', label: 'Files', title: 'Browse your computer\'s folders', body: 'See the files and subfolders where your agent works, with sizes and modified times.', alt: 'File list of a folder on the computer' },
            { shot: 'chat', label: 'Conversation', title: 'Keep working from your phone', body: 'Read the conversation so far and send messages. Attach files or photos, or pick a folder to start a new agent.', alt: 'Attach menu for files and photos in a conversation' },
            { shot: 'usage', label: 'Usage', title: 'Limits and cost per computer', body: 'Claude Code\'s 5-hour and weekly limits with time until reset, plus cost by day and by model.', alt: 'Usage limits and daily cost chart' },
        ],
        agentsLabel: 'Supported agents',
        agents: 'Claude Code · Codex · Gemini CLI · Qwen Code · OpenCode · Grok · GitHub Copilot CLI · Cursor Agent · Amp',
        requirements: 'A Mac or Windows PC running Claude Code or Codex, plus Tailscale. Approvals and questions work from any terminal; the live terminal, sending messages, new tasks from your phone and the other agents need herdr-core. Setup is one command on the computer and a QR scan.',
        android: {
          button: 'Join the Android test',
          label: 'Android closed test',
          steps: ['Join the Google Group', 'Opt in to the test', 'Install from Google Play'],
          note: 'Join the group first, or the opt-in link will not open. Only the developer sees member emails. A public release needs 12 testers keeping the app installed for 14 days.',
        },
      },
      soon: 'In App Store review now.',
      cockatoo: {
        tagline: 'Conversation & pronunciation',
        lead: 'Say something in English and it hands back a more natural way to say it. Read that sentence aloud and it shows which words you mispronounced, one by one. Pick one of 35 situations, from ordering coffee to a job interview, and start talking.',
      },
      harubox: {
        tagline: 'All-day recorder with on-device transcription',
        lead: 'Start recording in the morning and put your phone in your pocket. By the commute home, the day\'s conversations are already written down. Meeting, class or phone call, it runs all day without cutting out, and transcripts and summaries are made on the phone. Turn it on tomorrow morning and go about your day.',
      },
      game: {
        tagline: 'Browser zombie shooter',
        lead: 'A third-person shooter in a ruined city: grab the sample and make it to the helicopter. You have everything from rifles to axes and molotovs, but every shot pulls in more zombies. Escape and your kill count goes on the online leaderboard. Nothing to install, so play a round in your PC or phone browser right now.',
        play: 'Play now ↗',
        alt: 'DEAD DISTRICT gameplay: a player with a rifle and zombies on a ruined street',
      },
      peakly: {
        tagline: 'ADHD medication tracker',
        lead: 'Log when you take your medication, and Peakly shows whether it is rising, at its strongest, or wearing off. Goals, routines, and to-dos are in the same app.',
        // Home card only (en): the Peakly page keeps the lead above.
        cardLead: 'All it asks for is the time you took your pill. A curve shows whether it\'s kicking in, at its strongest, or wearing off. Goals, routines and to-dos live in the same app. Start by logging today\'s dose.',
        sections: [
          {
            tab: 'Medication',
            intro: 'Log your dose time and see how the effect changes through the day.',
            rows: [
              { shot: 'chart', label: 'Estimated effect curve', title: 'Know where your medication is.', body: 'Based on the known effect profiles of Concerta and Medikinet, Peakly draws your estimated effect by time of day. See whether it is rising, at its strongest, or wearing off, and adjust each phase\'s timing to fit how your body responds. With Apple Watch, heart rate and movement appear under the curve by time of day.', alt: 'Peakly medication screen with the expected Concerta curve above heart rate and movement graphs', note: 'Curves are estimates for reference and do not replace medical advice.' },
              { shot: 'mood', label: 'Mood check-in', title: 'One tap for your mood, one line for a note.', body: 'Tap one of five faces to log how you feel at that moment. Log as often as you like; each mood appears under the effect curve at the time you logged it. You can add a one-line note right below the faces.', alt: 'Peakly medication screen with a mood card of five faces and a note line, above the effect curve and a mood log strip' },
              { shot: 'lock', label: 'Dynamic Island and Lock Screen', title: 'Time left, always on screen.', body: 'The time your medication has left stays in the Dynamic Island, on the Lock Screen, and in the Apple Watch Smart Stack, and in the notification shade on Android. Notifications tell you when it starts rising, when the peak window begins, and when it is wearing off. You can also hide medication names and images on widgets and the Lock Screen.', alt: 'iPhone Dynamic Island and Lock Screen showing Concerta 36mg at its main peak with the time left' },
              { shot: 'report', label: 'PDF report', title: 'Your records as a PDF for your doctor.', body: 'Pick a period and Peakly makes a two-page medication report as a PDF. It includes your dose records, how your condition changed from the previous period, how the effect ran through the day, daily notes, and questions to ask at the visit.', alt: 'Preview of the first page of the PDF report with dose records and condition changes' },
            ],
          },
          {
            tab: 'Goals',
            intro: 'Give big goals a deadline, then split them into today\'s tasks.',
            rows: [
              { shot: 'goals', label: 'All goals', title: 'Goals as progress, waiting days as D-Days.', body: 'Give a big goal like a certification, a diet, or a portfolio a date, and you see its progress and the time left together. Things with a fixed date, like a trip, an exam day, or an anniversary, sit on screen as D-Days.', alt: 'All Goals screen with D-Days and progress per goal' },
              { shot: 'goals-today', label: 'Today\'s goals', title: 'Turn a goal into today\'s tasks.', body: 'Split a big goal into small things to do today and check them off one by one.', alt: 'Today\'s Goals with progress and small actions' },
            ],
          },
          {
            tab: 'Tasks',
            intro: 'Daily habits and deadlines, kept apart.',
            rows: [
              { shot: 'routines', label: 'Daily routines', title: 'Things for a set time, and anytime.', body: 'Things with a set time, like waking up or a walk, go into timed routines. Things you can do anytime, like stretching, go into anytime routines. Peakly also shows how many you missed in the last 7 days and this month.', alt: 'Daily Routine screen with timed and anytime routines' },
              { shot: 'todo', label: 'To-dos', title: 'Closest deadline first.', body: 'Tasks with deadlines are grouped into today, this week, and later.', alt: 'Task list grouped by time left' },
            ],
          },
          {
            tab: 'History',
            intro: 'Past days, and how each one felt.',
            rows: [
              { shot: 'calendar', label: 'Calendar', title: 'Every past day on one calendar.', body: 'Each date shows dots for your doses, goals, and tasks. Tap a day to see the medication you took and the goals and tasks you finished, or search to find older records. Your mood and notes for the day help you explain how things have been at your appointment.', alt: 'Calendar with dots for doses, goals, and tasks' },
            ],
          },
          {
            tab: 'Settings',
            intro: 'Language, theme, fonts and backups.',
            rows: [
              { shot: 'settings', label: 'Language and display', title: 'Pick your language, theme and font.', body: 'Peakly is available in Korean, English, Japanese, and Traditional Chinese, with dark and light modes and font options. Set your target bedtime and wake time, and Peakly warns you if the effect may last into the night.', alt: 'Settings screen with language, display mode, font, and target bedtime and wake time' },
              { shot: 'backup', label: 'Backup and restore', title: 'New phone, same records.', body: 'Your dose records and health data never go to an outside server. They are stored only on your device and in your own iCloud (Google Drive on Android). Backups run automatically, and you can also back up now or export a file.', alt: 'Backup screen with iCloud backup, back up now, and data export and import' },
            ],
          },
          {
            tab: 'Widgets',
            intro: 'Right on your Home Screen and Lock Screen.',
            rows: [
              { shot: 'widgets', label: 'Home Screen widgets', title: 'Without opening the app.', body: 'Put your medication status, goal D-Days, goal progress, daily routines, tasks, condition, and calendar on your Home Screen and Lock Screen.', alt: 'iPhone Home Screen with a medication curve widget and a goal D-Day widget' },
            ],
          },
        ],
        featuresTitle: 'More in Peakly',
        features: [
          { title: 'Apple Watch', platforms: ['iOS'], body: 'Heart rate, movement, sleep, and workouts recorded by Apple Watch come in through Apple Health and show up alongside your medication. The time left is also shown in the watch Smart Stack.' },
          { title: 'Phase notifications', platforms: ['iOS', 'Android'], body: 'Get notified when the effect starts rising, when it reaches its peak, and when it starts wearing off. Turn each one on or off.' },
          { title: 'Heart-rate response', platforms: ['iOS'], body: 'Compares your heart rate after a dose with your usual, and estimates whether a rise comes from the medication or from activity.' },
          { title: 'Your own medications', platforms: ['iOS', 'Android'], body: 'Add medications that aren\'t on the supported list, with your own photo, and keep logging them.' },
          { title: 'Log from Control Center', platforms: ['iOS'], body: 'Log a dose from Control Center or a Lock Screen button without opening the app.' },
          { title: 'iPad support', platforms: ['iPadOS'], body: 'On iPad, records sync with your iPhone on the same Apple Account.' },
        ],
        closing: { title: "Start with today's dose." },
      },
    },
  },
  ja: {
    appName: 'ピークリー',
    nav: { contact: 'お問い合わせ', language: '言語', main: 'メインメニュー' },
    docs: { privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート' },
    footer: { products: 'プロダクト', language: '言語', legal: '© Hyperfocus Lab' },
    home: {
      title: 'Hyperfocus Lab | ピークリー · Sheltie · Cockatoo · Harubox',
      description: 'ピークリーは服用時刻から1日の作用の予測グラフを描くADHDの服薬記録アプリです。SheltieはPCのコーディングエージェントが承認待ちになるとロック画面から許可できるアプリ、Cockatooは話した英語を添削し発音を単語ごとに示すアプリ、Haruboxは一日中録音して文字起こしと要約をiPhone内で行うアプリです。',
      company: 'Hyperfocus Labは、自社のソフトウェアプロダクトを開発・運営するスタジオです。',
      more: '詳しく見る →',
      peaklyTitle: 'ピークリー | ADHDの服薬記録アプリ',
      peaklyDescription: '服用時刻を記録すると、1日の作用の予測グラフを表示します。気分や目標、タスクも同じアプリで記録できます。iPhone・iPad・Android対応。',
      products: {
        title: 'プロダクト',
        facts: [
          ['対応OS', 'iPhone · iPad · Android'],
          ['言語', '한국어 · English · 日本語 · 繁體中文'],
        ],
        more: 'ピークリーのページへ',
      },
      sheltie: {
        title: 'Sheltie | コーディングエージェント承認アプリ',
        tagline: 'コーディングエージェント承認アプリ',
        lead: 'PCで動かしているコーディングエージェントが権限の確認や質問で止まると、iPhoneに通知が届きます。ロック画面からそのまま許可・拒否し、アプリで会話を読んで新しい作業を始められます。Android版はクローズドテスト中です。無料で、PC側のサーバーはオープンソースです。',
        rows: [
            { shot: 'notif', label: '通知', title: 'アプリを開かずに答える', body: '通知を長押しすると、許可・このセッション中は許可・拒否が出ます。答える直前に、ターミナルのメニューが変わっていないかもう一度確かめます。', alt: '長押しした通知の許可・拒否メニュー' },
            { shot: 'lock', label: 'ロック画面', title: '待機中の数をロック画面に', body: 'ライブアクティビティが、いま待機中のエージェントの数と、それぞれが何を待っているかを表示します。Dynamic Islandにも出ます。', alt: 'ロック画面のライブアクティビティと通知' },
            { shot: 'approve', label: '承認', title: '何を許可するか見てから押す', body: '作成するファイルの内容や実行するコマンドをカードで表示し、ターミナルに出た選択肢をそのままボタンにします。', alt: 'ファイル作成の承認カード' },
            { shot: 'list', label: '一覧', title: '複数のPCを1つの一覧に', body: 'PCごと、フォルダごとに、すべてのセッションを1つの一覧で見られます。待機中のエージェントが一番上に来て、何を待っているか、何分たったかも表示されます。', alt: 'MacBookとMac miniのエージェントセッション一覧' },
            { shot: 'question', label: '質問', title: '選択肢を選ぶか、自分で入力する', body: 'エージェントからの質問、プランの承認、複数の質問をまとめて聞く画面にも、カードで答えられます。', alt: '質問の選択肢カード' },
            { shot: 'term', label: 'ターミナル', title: 'PCのターミナルをリアルタイムで', body: 'ターミナル画面をそのまま見ながら、数字・矢印・Enterキーを送れます。カードで答えられないメニューにも、ここから答えます。', alt: 'リアルタイムのターミナル画面とキーボタン' },
            { shot: 'files', label: 'ファイル', title: 'PCのフォルダをスマートフォンで開く', body: 'エージェントが作業しているフォルダのファイルとサブフォルダを、サイズと更新日時つきで見られます。', alt: 'PCのフォルダのファイル一覧' },
            { shot: 'chat', label: '会話', title: 'スマートフォンから作業を続ける', body: 'これまでの会話を読み、メッセージを送れます。ファイルや写真を添付したり、フォルダを選んで新しいエージェントを起動したりもできます。', alt: '会話画面のファイル・写真添付メニュー' },
            { shot: 'usage', label: '使用量', title: '上限とコストをPCごとに', body: 'Claude Codeの5時間・週間の使用上限とリセットまでの時間、日別・モデル別のコストを確認できます。', alt: '使用上限と日別コストのグラフ' },
        ],
        agentsLabel: '対応エージェント',
        agents: 'Claude Code · Codex · Gemini CLI · Qwen Code · OpenCode · Grok · GitHub Copilot CLI · Cursor Agent · Amp',
        requirements: 'Claude CodeかCodexを動かしているMacまたはWindows PCと、Tailscaleがあれば使えます。承認と質問への回答は、いつものターミナルのままで動きます。リアルタイムのターミナル、メッセージ送信、スマートフォンからの新しい作業、ほかのエージェントにはherdr-coreが必要です。セットアップは、PCにコマンドを1行貼り付けてQRコードを読み取るだけです。',
        android: {
          button: 'Androidテストに参加',
          label: 'Androidクローズドテスト',
          steps: ['Googleグループに参加', 'テストに参加', 'Google Playからインストール'],
          note: '先にグループに参加しないと、テスト参加のリンクが開きません。メールアドレスは開発者だけが見られます。正式公開には、テスター12人が14日間アプリを入れたままにしておく必要があります。',
        },
      },
      soon: 'App Store 審査中',
      cockatoo: {
        tagline: '話すと添削、言い直して身につく',
        lead: 'AIと英語で会話すると、不自然な文は自然な英語に添削され、添削された文を読み上げると間違えた発音を単語ごとに示します。35の場面で練習できます。',
      },
      harubox: {
        tagline: '終日録音・文字起こし・要約',
        lead: '録音ボタンを一度押せば、画面を消しても録音を続けます。文字起こし、話者分離、要約はiPhone内で処理し、録音時間の上限はありません。',
      },
      game: {
        tagline: 'PCブラウザのゾンビシューター',
        lead: '廃墟になった街区でゾンビをかわしながら脱出地点を目指す三人称シューティングです。ライフル・ショットガン・ピストル・斧、火炎瓶とパイプ爆弾を使い、銃声はゾンビを呼び寄せます。インストール不要でブラウザで動きます。キーボードとマウスが必要です。',
        play: '今すぐプレイ ↗',
        alt: 'DEAD DISTRICTのゲーム画面：廃墟の通りでライフルを構えるプレイヤーとゾンビ',
      },
      peakly: {
        tagline: 'ADHDの服薬記録アプリ',
        lead: '薬を飲んだ時刻を記録すると、いま作用が上がっている途中か、いちばん強い時間か、弱まってきているかを表示します。目標やルーティン、タスクも同じアプリで管理できます。',
        sections: [
          {
            tab: '服薬',
            intro: '服用時刻を記録すると、一日の作用の変化が描かれます。',
            rows: [
              { shot: 'chart', label: '予測グラフ', title: 'いま、作用はどのあたりか。', body: 'コンサータとメディキネットの一般的な作用の変化をもとに、時間ごとの作用の予測を描きます。いま作用が上がっている途中か、いちばん強い時間か、弱まってきているかがわかり、各段階の時間は自分の体に合わせて調整できます。Apple Watchを使うと、心拍数と動きが曲線の下に時間ごとに表示されます。', alt: 'コンサータの予想曲線と心拍数・動きのグラフが並ぶピークリーの服薬画面', note: '予測グラフは参考値であり、医療上の判断に代わるものではありません。' },
              { shot: 'mood', label: '気分チェックイン', title: '気分はワンタップで、メモはひとことで。', body: '5つの表情のどれかをタップすると、その時刻の気分が記録されます。一日に何回でも残せて、記録した気分は作用グラフの下、記録した時刻の位置に表示されます。表情の下にはひとことメモも書けます。', alt: '5つの表情とメモ欄がある気分カードと、その下に作用グラフと気分の記録の帯があるピークリーの服薬画面' },
              { shot: 'lock', label: 'Dynamic Island・ロック画面', title: '作用の残り時間を、いつも画面に。', body: 'iPhoneではDynamic Island、ロック画面、Apple Watchのスマートスタックに、Androidでは通知エリアに、作用の残り時間が表示され続けます。作用が上がり始めたとき、ピークの時間帯に入ったとき、切れかけたときは通知でお知らせします。ウィジェットやロック画面で薬の名前と画像を隠すこともできます。', alt: 'Dynamic Islandとロック画面に、コンサータ36mgのメインピークと残り時間を表示したiPhone' },
              { shot: 'report', label: 'PDFレポート', title: '診察で見せる記録を、PDFで。', body: '期間を選ぶと、2ページの服薬レポートがPDFになります。服薬記録、前の期間と比べたコンディションの変化、一日の作用の流れ、日ごとのメモ、診察で聞きたいことが入ります。', alt: '服薬記録とコンディションの変化をまとめたPDFレポート1ページ目のプレビュー' },
            ],
          },
          {
            tab: '目標',
            intro: '大きな目標に期限を決めて、今日やることに分けます。',
            rows: [
              { shot: 'goals', label: '全体の目標', title: '目標は進捗で、待つ日はD-Dayで。', body: '資格、ダイエット、ポートフォリオのような大きな目標に日付をつけると、進捗率と残り期間が一緒に見えます。旅行、試験日、記念日のように日付が決まっていることは、D-Dayとして表示しておけます。', alt: 'D-Dayと目標ごとの進捗率が並ぶ全体の目標画面' },
              { shot: 'goals-today', label: '今日の目標', title: '目標を今日やることに分けて。', body: '大きな目標を今日やる小さなことに分けて、ひとつずつチェックします。', alt: '今日の目標の進捗率と小さな実践の一覧' },
            ],
          },
          {
            tab: 'タスク',
            intro: '毎日のことと締め切りのあることを分けて。',
            rows: [
              { shot: 'routines', label: '毎日のルーティン', title: '決まった時間のこと、いつでもいいこと。', body: '起床や散歩のように時間が決まっていることは時間別ルーティンに、ストレッチのように一日のうちいつでもいいことはいつでもルーティンに分けます。直近7日と今月にできなかった回数も表示します。', alt: '時間別ルーティンといつでもルーティンが並ぶ毎日のルーティン画面' },
              { shot: 'todo', label: 'やること', title: '締め切りが近いものから。', body: '締め切りのあることを、今日まで・今週・それ以降に分けて表示します。', alt: '残り時間ごとに分かれたタスク一覧' },
            ],
          },
          {
            tab: '記録',
            intro: '過ぎた日と、その日の気分を残します。',
            rows: [
              { shot: 'calendar', label: 'カレンダー', title: '過ぎた日々を、カレンダーで振り返る。', body: '日付ごとに服薬・目標・タスクの記録を点で表示します。日付をタップすると、その日に飲んだ薬と終えた目標・タスクを確認でき、過去の記録は検索で探せます。その日の気分とメモを残しておけば、診察で最近の様子を伝えやすくなります。', alt: '服薬・目標・タスクが点で示されたカレンダー' },
            ],
          },
          {
            tab: '設定',
            intro: '言語も画面もバックアップも、自分に合わせて。',
            rows: [
              { shot: 'settings', label: '自分に合わせて', title: '言語も画面も、自分に合わせて。', body: '韓国語、英語、日本語、繁体字中国語で使えます。ダーク・ライトモードとフォントも選べます。目標の就寝・起床時間を決めておくと、作用が寝る時間まで続きそうなときに事前にお知らせします。', alt: '言語、ディスプレイモード、フォント、目標の就寝・起床時間がある設定画面' },
              { shot: 'backup', label: 'バックアップ・復元', title: '機種を変えても、記録はそのまま。', body: '服薬記録と健康データは外部のサーバーには送らず、端末と自分のiCloud（AndroidはGoogleドライブ）にだけ保存されます。自動でバックアップし、必要なときは今すぐバックアップしたりファイルに書き出したりできます。', alt: 'iCloudバックアップ、今すぐバックアップ、データの書き出しと読み込みがあるバックアップ画面' },
            ],
          },
          {
            tab: 'ウィジェット',
            intro: 'ホーム画面とロック画面で、すぐに。',
            rows: [
              { shot: 'widgets', label: 'ホーム画面ウィジェット', title: 'アプリを開かなくても。', body: '薬の状態、目標のD-Day、目標別の進捗、毎日のルーティン、やること、体調、カレンダーをホーム画面とロック画面のウィジェットに置けます。', alt: '薬効グラフのウィジェットと目標D-Dayのウィジェットがあるホーム画面' },
            ],
          },
        ],
        featuresTitle: 'そのほかの機能',
        features: [
          { title: 'Apple Watch連携', platforms: ['iOS'], body: 'Apple Watchが記録した心拍数、動き、睡眠、ワークアウトをヘルスケアから取り込んで一緒に表示します。残り時間はウォッチのスマートスタックにも表示されます。' },
          { title: '段階ごとの通知', platforms: ['iOS', 'Android'], body: '作用が上がりはじめたとき、ピークに入ったとき、弱まりはじめたときにお知らせします。項目ごとにオン・オフできます。' },
          { title: '心拍数の反応', platforms: ['iOS'], body: '服薬後の心拍数をふだんと比べ、心拍数の上昇が薬の作用か活動の影響かを推定します。' },
          { title: '自分で追加する薬', platforms: ['iOS', 'Android'], body: '対応リストにない薬も、種類と写真を自分で追加して記録できます。' },
          { title: 'コントロールセンターから記録', platforms: ['iOS'], body: 'アプリを開かずに、コントロールセンターやロック画面のボタンから服用を記録できます。' },
          { title: 'iPad対応', platforms: ['iPadOS'], body: 'iPadでも、同じApple AccountのiPhoneと記録が同期されます。' },
        ],
        closing: { title: '今日飲んだ薬から記録してみましょう。' },
      },
    },
  },
  'zh-Hant': {
    appName: 'Peakly',
    nav: { contact: '聯絡我們', language: '選擇語言', main: '主要選單' },
    docs: { privacy: '隱私權政策', terms: '服務條款', support: '客戶支援' },
    footer: { products: '產品', language: '語言', legal: '© Hyperfocus Lab' },
    home: {
      title: 'Hyperfocus Lab | Peakly · Sheltie · Cockatoo · Harubox',
      description: 'Peakly 是 ADHD 服藥紀錄 App，依服藥時間畫出一天的預估藥效曲線。Sheltie 讓你在手機鎖定畫面核准電腦上的程式代理；Cockatoo 修正你說的英文並逐字檢查發音；Harubox 整天錄音，在 iPhone 上產生逐字稿與摘要。',
      company: 'Hyperfocus Lab 是一間開發並營運自家軟體產品的工作室。',
      more: '了解更多 →',
      peaklyTitle: 'Peakly | ADHD 服藥紀錄 App',
      peaklyDescription: '記錄服藥時間，Peakly 就會畫出一天中的預估藥效曲線。心情、目標與待辦事項也能在同一個 App 裡記錄。支援 iPhone、iPad、Android。',
      products: {
        title: '產品',
        facts: [
          ['平台', 'iPhone · iPad · Android'],
          ['語言', '한국어 · English · 日本語 · 繁體中文'],
        ],
        more: '前往 Peakly 頁面',
      },
      sheltie: {
        title: 'Sheltie | 程式代理核准 App',
        tagline: '程式代理核准 App',
        lead: '電腦上執行的程式代理因權限或提問而停下時，iPhone 會收到通知。在鎖定畫面直接允許或拒絕，也能在 App 裡閱讀對話、開始新工作。Android 版正在封閉測試。免費，電腦端伺服器為開放原始碼。',
        rows: [
            { shot: 'notif', label: '通知', title: '不用開啟 App 就能回覆', body: '長按通知會出現「允許」、「本次工作階段允許」和「拒絕」。回覆前會再確認一次終端機選單有沒有變。', alt: '長按通知後出現的允許與拒絕選單' },
            { shot: 'lock', label: '鎖定畫面', title: '等待中的數量，鎖定畫面就看得到', body: '即時動態會顯示目前有幾個代理在等你回覆、各自在等什麼。動態島上也看得到。', alt: '鎖定畫面上的即時動態與通知' },
            { shot: 'approve', label: '核准', title: '看清楚要允許什麼再按', body: '以卡片顯示要建立的檔案內容或要執行的指令，並把終端機上的選項直接做成按鈕。', alt: '建立檔案的核准卡片' },
            { shot: 'list', label: '清單', title: '多台電腦，一份清單', body: '依電腦、依資料夾，在同一份清單查看所有工作階段。等待中的代理排在最上面，也會顯示在等什麼、已經等了幾分鐘。', alt: 'MacBook 與 Mac mini 的代理工作階段清單' },
            { shot: 'question', label: '提問', title: '選一個選項，或自己輸入', body: '代理提出的問題、計畫核准，以及一次問多個問題的畫面，都能用卡片回答。', alt: '提問選項卡片' },
            { shot: 'term', label: '終端機', title: '即時查看電腦的終端機', body: '直接看終端機畫面，並送出數字、方向鍵與 Enter 鍵。卡片處理不了的選單，也能在這裡回答。', alt: '即時終端機畫面與按鍵按鈕' },
            { shot: 'files', label: '檔案', title: '用手機打開電腦裡的資料夾', body: '查看代理工作中資料夾裡的檔案與子資料夾，以及大小和修改時間。', alt: '電腦資料夾的檔案清單' },
            { shot: 'chat', label: '對話', title: '在手機上繼續工作', body: '閱讀目前為止的對話並傳送訊息。可以附加檔案或照片，也能選擇資料夾啟動新的代理。', alt: '對話畫面的檔案與照片附加選單' },
            { shot: 'usage', label: '用量', title: '每台電腦的上限與費用', body: '查看 Claude Code 的 5 小時與每週用量上限、距離重置的時間，以及依日期、依模型的費用。', alt: '用量上限與每日費用圖表' },
        ],
        agentsLabel: '支援的代理',
        agents: 'Claude Code · Codex · Gemini CLI · Qwen Code · OpenCode · Grok · GitHub Copilot CLI · Cursor Agent · Amp',
        requirements: '只要有執行 Claude Code 或 Codex 的 Mac 或 Windows PC，再加上 Tailscale 就能使用。核准與回答問題可直接在原本的終端機運作；即時終端機、傳送訊息、從手機開始新工作，以及其他代理，都需要 herdr-core。設定只要在電腦貼上一行指令，再掃描 QR 碼。',
        android: {
          button: '參加 Android 測試',
          label: 'Android 封閉測試',
          steps: ['加入 Google 群組', '加入測試', '從 Google Play 安裝'],
          note: '要先加入群組，加入測試的連結才會打開。群組成員的電子郵件只有開發者看得到。正式上架前，需要 12 位測試人員把 App 保留安裝 14 天。',
        },
      },
      soon: 'App Store 審核中',
      cockatoo: {
        tagline: '開口說英文，句子修正、發音逐字檢查',
        lead: '用英文和 AI 對話，不自然的句子會改得更道地；跟著唸修正後的句子，會逐字指出唸錯的地方。35 種情境可練習。',
      },
      harubox: {
        tagline: '整天錄音、逐字稿、摘要',
        lead: '按一下錄音鈕，關掉螢幕也會持續錄音。逐字稿、講者辨識和摘要都在 iPhone 上完成，錄音時間沒有上限。',
      },
      game: {
        tagline: '電腦瀏覽器殭屍射擊遊戲',
        lead: '在成為廢墟的城市街區躲開殭屍、前往撤離點的第三人稱射擊遊戲。可使用步槍、霰彈槍、手槍、斧頭，以及汽油彈和管狀炸彈，槍聲會引來殭屍。無需安裝，直接在瀏覽器執行，需要鍵盤和滑鼠。',
        play: '立即遊玩 ↗',
        alt: 'DEAD DISTRICT 遊戲畫面：廢墟街道上持步槍的玩家與殭屍',
      },
      peakly: {
        tagline: 'ADHD 服藥紀錄 App',
        lead: '記錄服藥時間，就能看到藥效現在是正在上升、最強，還是正在減弱。目標、例行事項與待辦事項也能在同一個 App 裡管理。',
        sections: [
          {
            tab: '服藥',
            intro: '記錄服藥時間，就能看到一整天的藥效變化。',
            rows: [
              { shot: 'chart', label: '預估藥效曲線', title: '隨時掌握藥效走到哪裡。', body: '依據 Concerta 與 Medikinet 已知的藥效變化，畫出一天中各時段的預估藥效。你可以看出藥效是正在上升、最強，還是正在減弱，也能依自己身體的反應調整各階段的時間。搭配 Apple Watch 使用時，心率與活動量會依時段顯示在曲線下方。', alt: 'Peakly 服藥畫面，Concerta 預估藥效曲線下方有心率與活動量圖表', note: '曲線為預估值，僅供參考，不能取代醫療建議。' },
              { shot: 'mood', label: '心情簽到', title: '心情點一下，備註寫一行。', body: '從五種表情中點選一個，就能記錄當下的心情。一天可以記錄多次，記下的心情會依記錄時間顯示在藥效曲線下方。表情下方的欄位也可以寫一行備註。', alt: 'Peakly 服藥畫面，心情卡片有五種表情與備註欄，下方是藥效曲線與心情記錄列' },
              { shot: 'lock', label: '動態島與鎖定畫面', title: '剩餘藥效時間，隨時在畫面上。', body: '剩餘的藥效時間會持續顯示在 iPhone 的動態島與鎖定畫面、Apple Watch 的智慧型疊放，Android 則顯示在通知欄。藥效開始上升、進入高峰時段、即將減弱時，都會以通知提醒你。你也可以在小工具與鎖定畫面上隱藏藥物名稱與圖片。', alt: 'iPhone 動態島與鎖定畫面顯示 Concerta 36mg 處於主要高峰與剩餘時間' },
              { shot: 'report', label: 'PDF 報告', title: '看診時要給醫師看的紀錄，直接產生 PDF。', body: '選擇期間後，會產生兩頁的服藥報告 PDF。內容包含服藥紀錄、與前一段期間相比的狀態變化、一天中的藥效變化、每日備註，以及看診時想詢問的問題。', alt: '整理了服藥紀錄與狀態變化的 PDF 報告第一頁預覽' },
            ],
          },
          {
            tab: '目標',
            intro: '替大目標訂下期限，再拆成今天要做的事。',
            rows: [
              { shot: 'goals', label: '全部目標', title: '目標看進度，期待的日子看 D-Day。', body: '替證照、減重、作品集這類大目標訂下日期，就能同時看到進度與剩餘時間。旅行、考試日、紀念日這類日期固定的事，則以 D-Day 顯示在畫面上。', alt: '顯示 D-Day 與各目標進度的全部目標畫面' },
              { shot: 'goals-today', label: '今日目標', title: '把目標拆成今天要做的事。', body: '把大目標拆成今天要做的小事，逐項勾選。', alt: '顯示進度與小行動清單的今日目標畫面' },
            ],
          },
          {
            tab: '待辦',
            intro: '每天要做的事與有截止日的事，分開管理。',
            rows: [
              { shot: 'routines', label: '每日例行事項', title: '有固定時間的事，與隨時都能做的事。', body: '起床、散步這類有固定時間的事，歸在定時例行事項；伸展這類一天中隨時做都可以的事，歸在隨時例行事項。也會顯示過去 7 天與本月沒完成的次數。', alt: '有定時例行事項與隨時例行事項的每日例行事項畫面' },
              { shot: 'todo', label: '待辦事項', title: '截止日最近的先做。', body: '有截止日的事會分成今天、本週與之後。', alt: '依剩餘時間分組的待辦事項清單' },
            ],
          },
          {
            tab: '紀錄',
            intro: '留下過去的日子，以及每一天的心情。',
            rows: [
              { shot: 'calendar', label: '行事曆', title: '過去的日子，在行事曆上回顧。', body: '每個日期都會用圓點標示服藥、目標與待辦的紀錄。點選日期，就能看到當天服用的藥物，以及完成的目標與待辦事項，也能搜尋更早的紀錄。留下當天的心情與備註，看診時更容易說明這段時間的狀況。', alt: '以圓點標示服藥、目標與待辦的行事曆' },
            ],
          },
          {
            tab: '設定',
            intro: '語言、外觀與備份，都能依自己的方式調整。',
            rows: [
              { shot: 'settings', label: '依你的方式使用', title: '語言與外觀，由你決定。', body: 'Peakly 支援韓文、英文、日文與繁體中文，並提供深色與淺色模式，也能選擇字型。設定目標就寢與起床時間後，若藥效可能延續到睡前，Peakly 會事先提醒你。', alt: '有語言、顯示模式、字型與目標就寢、起床時間的設定畫面' },
              { shot: 'backup', label: '備份與還原', title: '換了手機，紀錄也都在。', body: '你的服藥紀錄與健康資料不會傳送到外部伺服器，只會儲存在你的裝置與你自己的 iCloud（Android 則為 Google 雲端硬碟）。App 會自動備份，你也可以隨時立即備份，或匯出成檔案。', alt: '有 iCloud 備份、立即備份、資料匯出與匯入的備份與還原畫面' },
            ],
          },
          {
            tab: '小工具',
            intro: '主畫面與鎖定畫面上就能看。',
            rows: [
              { shot: 'widgets', label: '主畫面小工具', title: '不用開啟 App。', body: '服藥狀態、目標 D-Day、目標進度、每日例行事項、待辦事項、狀態與行事曆，都可以放在主畫面與鎖定畫面的小工具上。', alt: '有藥效曲線小工具與目標 D-Day 小工具的 iPhone 主畫面' },
            ],
          },
        ],
        featuresTitle: 'Peakly 的其他功能',
        features: [
          { title: 'Apple Watch', platforms: ['iOS'], body: 'Apple Watch 記錄的心率、活動量、睡眠與運動，會透過「健康」App 匯入，並與服藥紀錄一起顯示。剩餘藥效時間也會顯示在手錶的智慧型疊放。' },
          { title: '階段通知', platforms: ['iOS', 'Android'], body: '藥效開始上升、進入高峰、開始減弱時都會通知你。每一項都可以個別開啟或關閉。' },
          { title: '心率反應', platforms: ['iOS'], body: '將服藥後的心率與你平時的心率相比，並推估心率上升是來自藥效，還是活動的影響。' },
          { title: '自訂藥物', platforms: ['iOS', 'Android'], body: '不在支援清單裡的藥物，也能自行新增並附上自己的照片，持續記錄。' },
          { title: '從控制中心記錄服藥', platforms: ['iOS'], body: '不用開啟 App，從控制中心或鎖定畫面按鈕就能記錄服藥。' },
          { title: '支援 iPad', platforms: ['iPadOS'], body: '在 iPad 上，紀錄會與使用同一個 Apple 帳號的 iPhone 同步。' },
        ],
        closing: { title: '從今天吃的藥開始記錄吧。' },
      },
    },
  },
} as const;
