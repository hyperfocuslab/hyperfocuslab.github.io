export const LANGS = ['ko', 'en', 'ja', 'zh-Hant'] as const;
export type Lang = (typeof LANGS)[number];
export type Page = 'home' | 'peakly' | 'privacy' | 'terms' | 'support';

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

const PREFIX: Record<Lang, string> = { ko: '', en: '/en', ja: '/ja', 'zh-Hant': '/zh-Hant' };
// The root home is English. Peakly documents keep PREFIX: the apps and stores link to those URLs.
const HOME: Record<Lang, string> = { ko: '/ko/', en: '/', ja: '/ja/', 'zh-Hant': '/zh-Hant/' };
// The old flat file names exist only for the languages the previous site had.
const SUFFIX: Partial<Record<Lang, string>> = { ko: '', en: '-en', ja: '-ja' };

// Hyperfocus Lab is the company; Peakly is a product under it, and its
// policies and support pages live under /peakly/.
export function href(page: Page, lang: Lang): string {
  if (page === 'home') return HOME[lang];
  // Peakly is introduced on the home page; /peakly/ itself redirects there.
  if (page === 'peakly') return `${HOME[lang]}#products`;
  return `${PREFIX[lang]}/peakly/${page}/`;
}

// File names the previous Peakly site used (/privacy-en.html). They are kept
// as redirects so old store and in-app links can be pointed here later.
export function legacySlugs(): { slug: string; to: string }[] {
  const legacyLangs = LANGS.filter((lang) => SUFFIX[lang] !== undefined);
  const docs = (['privacy', 'terms', 'support'] as const).flatMap((doc) =>
    legacyLangs.map((lang) => ({ slug: `${doc}${SUFFIX[lang]}`, to: href(doc, lang) })),
  );
  return [...docs, { slug: 'index-en', to: href('home', 'en') }, { slug: 'index-ja', to: href('home', 'ja') }];
}

export const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語', 'zh-Hant': '繁體中文' };
// Short code shown in the header switch.
export const LANG_CODE: Record<Lang, string> = { ko: 'KO', en: 'EN', ja: 'JA', 'zh-Hant': 'ZH' };

export const ui = {
  ko: {
    appName: '피클리',
    nav: { contact: '문의', language: '언어 선택', main: '주요 메뉴' },
    docs: { privacy: '개인정보처리방침', terms: '서비스 이용약관', support: '고객지원' },
    footer: { products: '제품', language: '언어', legal: '© Hyperfocus Lab · 대표 이예준' },
    home: {
      title: '피클리 | ADHD 복약 기록 앱',
      description: '복용 시각을 기록하면 하루 동안의 예상 약효 곡선을 그려 줍니다. 기분과 목표, 할 일도 같은 앱에서 기록합니다. iPhone · iPad · Android.',
      products: {
        title: '제품',
        facts: [
          ['플랫폼', 'iPhone · iPad · Android'],
          ['언어', '한국어 · English · 日本語'],
        ],
        more: '피클리 페이지로',
      },
      peakly: {
        tagline: 'ADHD 복약 기록 앱',
        lead: '약 먹은 시각을 기록하면 지금 약효가 오르는 중인지, 가장 강한 때인지, 줄어드는 중인지 보여줍니다. 목표와 루틴, 할 일도 함께 관리할 수 있습니다.',
        sections: [
          {
            tab: '복약',
            intro: '복용 시각을 기록하면 하루 동안의 약효 변화가 그려집니다.',
            rows: [
              { shot: 'chart', label: '예상 약효 곡선', title: '지금 약효가 어디쯤인지.', body: '콘서타와 메디키넷의 알려진 약효 변화를 바탕으로 시간대별 예상 약효를 그립니다. 지금 약효가 오르는 중인지, 가장 강한 때인지, 줄어드는 중인지 알 수 있고, 단계별 시간은 내 몸에 맞게 조정할 수 있습니다. Apple Watch를 쓰면 심박수와 움직임이 곡선 아래에 시간대별로 함께 표시됩니다.', alt: '콘서타 예상 약효 곡선과 그 아래 심박수, 움직임 그래프가 있는 피클리 복약 화면', note: '예상 곡선은 참고용이며 의학적 판단을 대신하지 않습니다.' },
              { shot: 'mood', label: '기분 체크인', title: '기분은 한 번 탭으로, 메모는 한 줄로.', body: '다섯 가지 표정 중 하나를 누르면 그 시각의 기분이 기록됩니다. 하루에 몇 번이든 남길 수 있고, 남긴 기분은 약효 곡선 아래에 기록한 시각에 맞춰 표시됩니다. 표정 아래 칸에 한 줄 메모도 적을 수 있습니다.', alt: '다섯 가지 표정과 메모 줄이 있는 기분 카드, 그 아래 약효 곡선과 기분 기록 띠가 있는 피클리 복약 화면' },
              { shot: 'lock', label: '다이나믹 아일랜드·잠금 화면', title: '남은 약효 시간이 늘 화면 위에.', body: 'iPhone은 다이나믹 아일랜드와 잠금 화면, Apple Watch 스마트 스택에, Android는 알림 영역에 남은 약효 시간이 계속 떠 있습니다. 약효가 오를 때, 최대 농도 구간에 들어설 때, 끝나갈 때는 알림으로 알려줍니다. 위젯과 잠금 화면에서 약 이름과 이미지를 숨길 수도 있습니다.', alt: '다이나믹 아일랜드와 잠금 화면에 콘서타 36mg 메인 피크와 남은 시간이 표시된 iPhone' },
              { shot: 'report', label: 'PDF 리포트', title: '진료 때 보여줄 기록을 PDF로.', body: '기간을 고르면 두 장짜리 복약 리포트가 PDF로 만들어집니다. 복용 기록, 이전 기간과 비교한 컨디션 변화, 하루 중 약효 흐름, 일별 메모, 진료 때 물어볼 질문이 들어갑니다.', alt: '복용 기록과 컨디션 변화가 정리된 PDF 리포트 첫 장 미리보기' },
            ],
          },
          {
            tab: '목표',
            intro: '큰 목표에 기한을 정하고, 오늘 할 일로 나눕니다.',
            rows: [
              { shot: 'goals', label: '전체 목표', title: '목표는 진행률로, 기다리는 날은 D-Day로.', body: '자격증, 다이어트, 포트폴리오처럼 큰 목표에 날짜를 붙이면 진행률과 남은 기간이 함께 보입니다. 여행, 시험일, 기념일처럼 날짜가 정해진 일은 D-Day로 띄워 둡니다.', alt: 'D-Day와 목표별 진행률이 있는 전체 목표 화면' },
              { shot: 'goals-today', label: '오늘의 목표', title: '목표를 오늘 할 일로 나눠서.', body: '큰 목표를 오늘 할 작은 일로 나누고 하나씩 체크합니다. 매일의 작은 일이 쌓여 큰 목표를 완성합니다.', alt: '오늘의 목표 진행률과 작은 실천 목록' },
            ],
          },
          {
            tab: '할 일',
            intro: '매일 하는 일과 마감이 있는 일을 나눠서.',
            rows: [
              { shot: 'routines', label: '매일 루틴', title: '정한 시간에 할 일, 아무 때나 할 일.', body: '기상이나 산책처럼 시간이 정해진 일은 시간별 루틴으로, 스트레칭처럼 하루 중 아무 때나 하면 되는 일은 언제나 루틴으로 나눕니다. 지난 7일과 이번 달에 하지 못한 횟수도 보여줍니다.', alt: '시간별 루틴과 언제나 루틴이 있는 매일 루틴 화면' },
              { shot: 'todo', label: '해야 할 일', title: '마감이 가까운 일부터.', body: '마감이 있는 일을 오늘까지, 이번 주, 그 이후로 나눠 보여줍니다. 무엇부터 할지 바로 알 수 있습니다.', alt: '남은 시간별로 나뉜 해야 할 일 목록' },
            ],
          },
          {
            tab: '기록',
            intro: '지나간 날과 그날의 기분을 남겨 둡니다.',
            rows: [
              { shot: 'calendar', label: '캘린더', title: '지난 날을 한눈에.', body: '날짜마다 복약, 목표, 할 일 기록을 점으로 보여줍니다. 날짜를 누르면 그날 먹은 약과 끝낸 목표·할 일을 볼 수 있고, 지난 기록은 검색으로 찾을 수 있습니다. 그날의 기분과 메모를 남겨 두면 진료 때 그동안 어땠는지 설명하는 데 도움이 됩니다.', alt: '복약, 목표, 할 일이 점으로 표시된 캘린더' },
            ],
          },
          {
            tab: '설정',
            intro: '언어와 화면, 백업까지 내게 맞게.',
            rows: [
              { shot: 'settings', label: '내 방식대로', title: '언어와 화면을 내게 맞게.', body: '한국어, 영어, 일본어를 지원하고 다크·라이트 모드와 글꼴을 고를 수 있습니다. 목표 취침·기상 시간을 정해 두면 약효가 잠자리까지 이어질지 미리 알려줍니다.', alt: '언어, 디스플레이 모드, 글꼴, 목표 취침·기상 시간이 있는 설정 화면' },
              { shot: 'backup', label: '백업·복구', title: '폰을 바꿔도 기록은 그대로.', body: '복약 기록과 건강 데이터는 외부 서버로 보내지 않고, 기기와 내 iCloud(Android는 Google Drive)에만 저장됩니다. 자동으로 백업하고, 필요할 때 지금 바로 백업하거나 파일로 내보낼 수 있습니다.', alt: 'iCloud 백업, 지금 백업, 데이터 내보내기와 가져오기가 있는 백업·복구 화면' },
            ],
          },
          {
            tab: '위젯',
            intro: '홈 화면과 잠금 화면에서 바로.',
            rows: [
              { shot: 'widgets', label: '홈 화면 위젯', title: '앱을 열지 않아도.', body: '약효 상태, 목표 D-Day, 목표별 진행률, 매일 루틴, 해야 할 일, 컨디션, 캘린더를 홈 화면과 잠금 화면 위젯으로 둘 수 있습니다.', alt: '약효 곡선 위젯과 목표 D-Day 위젯이 있는 iPhone 홈 화면' },
            ],
          },
        ],
        featuresTitle: '그 밖의 기능',
        features: [
          { title: 'Apple Watch 연동', platforms: ['iOS'], body: 'Apple Watch가 기록한 심박수, 움직임, 수면, 운동을 건강 앱에서 가져와 함께 보여줍니다. 남은 약효 시간은 워치 스마트 스택에도 표시됩니다.' },
          { title: '단계별 알림', platforms: ['iOS', 'Android'], body: '약효가 오르기 시작할 때, 피크에 들어설 때, 줄어들기 시작할 때 알려줍니다. 항목별로 켜고 끌 수 있습니다.' },
          { title: '심박수 반응', platforms: ['iOS'], body: '복용 후 심박수를 평소와 비교하고, 심박수가 오른 이유가 약효인지 활동 영향인지 추정합니다.' },
          { title: '직접 추가하는 약', platforms: ['iOS', 'Android'], body: '지원 목록에 없는 약 종류와 이미지도 직접 추가하여 기록을 남길 수 있습니다.' },
          { title: '제어 센터에서 복용 기록', platforms: ['iOS'], body: '앱을 열지 않고도 제어 센터나 잠금 화면 버튼으로 복용을 기록할 수 있습니다.' },
          { title: 'iPad 지원', platforms: ['iPadOS'], body: 'iPad에서도 같은 Apple 계정의 iPhone과 기록이 동기화됩니다.' },
        ],
        closing: { title: '오늘 먹은 약부터 기록해 보세요.' },
      },
    },
  },
  en: {
    appName: 'Peakly',
    nav: { contact: 'Contact', language: 'Language', main: 'Main' },
    docs: { privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Support' },
    footer: { products: 'Products', language: 'Language', legal: '© Hyperfocus Lab · Representative: Yejun Lee' },
    home: {
      title: 'Peakly | ADHD medication tracker',
      description: "Log when you take your medication and Peakly draws the day's estimated effect curve. Mood, goals, and to-dos are in the same app. iPhone, iPad, Android.",
      products: {
        title: 'Products',
        facts: [
          ['Platforms', 'iPhone · iPad · Android'],
          ['Languages', '한국어 · English · 日本語'],
        ],
        more: 'Go to Peakly',
      },
      peakly: {
        tagline: 'ADHD medication tracker',
        lead: 'Log when you take your medication, and Peakly shows whether it is rising, at its strongest, or wearing off. Goals, routines, and to-dos are in the same app.',
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
              { shot: 'goals-today', label: 'Today\'s goals', title: 'Turn a goal into today\'s tasks.', body: 'Split a big goal into small things to do today and check them off one by one. Small daily steps add up to the big goal.', alt: 'Today\'s Goals with progress and small actions' },
            ],
          },
          {
            tab: 'Tasks',
            intro: 'Daily habits and deadlines, kept apart.',
            rows: [
              { shot: 'routines', label: 'Daily routines', title: 'Things for a set time, and anytime.', body: 'Things with a set time, like waking up or a walk, go into timed routines. Things you can do anytime, like stretching, go into anytime routines. Peakly also shows how many you missed in the last 7 days and this month.', alt: 'Daily Routine screen with timed and anytime routines' },
              { shot: 'todo', label: 'To-dos', title: 'Closest deadline first.', body: 'Tasks with deadlines are grouped into today, this week, and later, so you can see what to do first.', alt: 'Task list grouped by time left' },
            ],
          },
          {
            tab: 'History',
            intro: 'Past days, and how each one felt.',
            rows: [
              { shot: 'calendar', label: 'Calendar', title: 'Your past days at a glance.', body: 'Each date shows dots for your doses, goals, and tasks. Tap a day to see the medication you took and the goals and tasks you finished, or search to find older records. Your mood and notes for the day help you explain how things have been at your appointment.', alt: 'Calendar with dots for doses, goals, and tasks' },
            ],
          },
          {
            tab: 'Settings',
            intro: 'Language, look, and backups, your way.',
            rows: [
              { shot: 'settings', label: 'Make it yours', title: 'Language and look, your way.', body: 'Peakly is available in Korean, English, and Japanese, with dark and light modes and font options. Set your target bedtime and wake time, and Peakly warns you if the effect may last into the night.', alt: 'Settings screen with language, display mode, font, and target bedtime and wake time' },
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
          { title: 'Heart-rate response', platforms: ['iOS'], body: 'Compares your heart rate after a dose with your usual, and estimates whether a rise reflects the medication\'s effect or the effect of activity.' },
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
    footer: { products: 'プロダクト', language: '言語', legal: '© Hyperfocus Lab · 代表 Yejun Lee' },
    home: {
      title: 'ピークリー | ADHDの服薬記録アプリ',
      description: '服用時刻を記録すると、1日の作用の予測グラフを表示します。気分や目標、タスクも同じアプリで記録できます。iPhone・iPad・Android対応。',
      products: {
        title: 'プロダクト',
        facts: [
          ['対応OS', 'iPhone · iPad · Android'],
          ['言語', '한국어 · English · 日本語'],
        ],
        more: 'ピークリーのページへ',
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
              { shot: 'goals-today', label: '今日の目標', title: '目標を今日やることに分けて。', body: '大きな目標を今日やる小さなことに分けて、ひとつずつチェックします。毎日の小さな積み重ねが大きな目標につながります。', alt: '今日の目標の進捗率と小さな実践の一覧' },
            ],
          },
          {
            tab: 'タスク',
            intro: '毎日のことと締め切りのあることを分けて。',
            rows: [
              { shot: 'routines', label: '毎日のルーティン', title: '決まった時間のこと、いつでもいいこと。', body: '起床や散歩のように時間が決まっていることは時間別ルーティンに、ストレッチのように一日のうちいつでもいいことはいつでもルーティンに分けます。直近7日と今月にできなかった回数も表示します。', alt: '時間別ルーティンといつでもルーティンが並ぶ毎日のルーティン画面' },
              { shot: 'todo', label: 'やること', title: '締め切りが近いものから。', body: '締め切りのあることを、今日まで・今週・それ以降に分けて表示します。何から始めればいいかがすぐわかります。', alt: '残り時間ごとに分かれたタスク一覧' },
            ],
          },
          {
            tab: '記録',
            intro: '過ぎた日と、その日の気分を残します。',
            rows: [
              { shot: 'calendar', label: 'カレンダー', title: '過ぎた日々を、ひと目で。', body: '日付ごとに服薬・目標・タスクの記録を点で表示します。日付をタップすると、その日に飲んだ薬と終えた目標・タスクを確認でき、過去の記録は検索で探せます。その日の気分とメモを残しておけば、診察で最近の様子を伝えやすくなります。', alt: '服薬・目標・タスクが点で示されたカレンダー' },
            ],
          },
          {
            tab: '設定',
            intro: '言語も画面もバックアップも、自分に合わせて。',
            rows: [
              { shot: 'settings', label: '自分に合わせて', title: '言語も画面も、自分に合わせて。', body: '韓国語、英語、日本語で使えます。ダーク・ライトモードとフォントも選べます。目標の就寝・起床時間を決めておくと、作用が寝る時間まで続きそうなときに事前にお知らせします。', alt: '言語、ディスプレイモード、フォント、目標の就寝・起床時間がある設定画面' },
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
    footer: { products: '產品', language: '語言', legal: '© Hyperfocus Lab · 代表 Yejun Lee' },
    home: {
      title: 'Peakly | ADHD 服藥紀錄 App',
      description: '記錄服藥時間，Peakly 就會畫出一天中的預估藥效曲線。心情、目標與待辦事項也能在同一個 App 裡記錄。支援 iPhone、iPad、Android。',
      products: {
        title: '產品',
        facts: [
          ['平台', 'iPhone · iPad · Android'],
          ['語言', '한국어 · English · 日本語 · 繁體中文'],
        ],
        more: '前往 Peakly 頁面',
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
              { shot: 'goals-today', label: '今日目標', title: '把目標拆成今天要做的事。', body: '把大目標拆成今天要做的小事，逐項勾選。每天的小步驟累積起來，就能完成大目標。', alt: '顯示進度與小行動清單的今日目標畫面' },
            ],
          },
          {
            tab: '待辦',
            intro: '每天要做的事與有截止日的事，分開管理。',
            rows: [
              { shot: 'routines', label: '每日例行事項', title: '有固定時間的事，與隨時都能做的事。', body: '起床、散步這類有固定時間的事，歸在定時例行事項；伸展這類一天中隨時做都可以的事，歸在隨時例行事項。也會顯示過去 7 天與本月沒完成的次數。', alt: '有定時例行事項與隨時例行事項的每日例行事項畫面' },
              { shot: 'todo', label: '待辦事項', title: '截止日最近的先做。', body: '有截止日的事會分成今天、本週與之後，讓你一眼看出該先做什麼。', alt: '依剩餘時間分組的待辦事項清單' },
            ],
          },
          {
            tab: '紀錄',
            intro: '留下過去的日子，以及每一天的心情。',
            rows: [
              { shot: 'calendar', label: '行事曆', title: '過去的日子一眼看完。', body: '每個日期都會用圓點標示服藥、目標與待辦的紀錄。點選日期，就能看到當天服用的藥物，以及完成的目標與待辦事項，也能搜尋更早的紀錄。留下當天的心情與備註，看診時更容易說明這段時間的狀況。', alt: '以圓點標示服藥、目標與待辦的行事曆' },
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
