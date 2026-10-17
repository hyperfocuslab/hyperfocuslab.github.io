export const LANGS = ['ko', 'en', 'ja'] as const;
export type Lang = (typeof LANGS)[number];
export type Page = 'home' | 'peakly' | 'privacy' | 'terms' | 'support';

export const SITE = 'https://hyperfocuslab.app';
export const EMAIL = 'support@hyperfocuslab.app';
export const STORE = {
  appStore: 'https://apps.apple.com/app/id6757836001',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.peakly.android',
};

const PREFIX: Record<Lang, string> = { ko: '', en: '/en', ja: '/ja' };
const SUFFIX: Record<Lang, string> = { ko: '', en: '-en', ja: '-ja' };

// Hyperfocus Lab is the company; Peakly is a product under it, and its
// policies and support pages live under /peakly/.
export function href(page: Page, lang: Lang): string {
  if (page === 'home') return `${PREFIX[lang]}/`;
  if (page === 'peakly') return `${PREFIX[lang]}/peakly/`;
  return `${PREFIX[lang]}/peakly/${page}/`;
}

// File names the previous Peakly site used (/privacy-en.html). They are kept
// as redirects so old store and in-app links can be pointed here later.
export function legacySlugs(): { slug: string; to: string }[] {
  const docs = (['privacy', 'terms', 'support'] as const).flatMap((doc) =>
    LANGS.map((lang) => ({ slug: `${doc}${SUFFIX[lang]}`, to: href(doc, lang) })),
  );
  return [...docs, { slug: 'index-en', to: href('peakly', 'en') }, { slug: 'index-ja', to: href('peakly', 'ja') }];
}

export const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語' };

export const ui = {
  ko: {
    appName: '피클리',
    nav: { contact: '문의', support: '고객지원', language: '언어 선택', main: '주요 메뉴' },
    docs: { privacy: '개인정보처리방침', terms: '서비스 이용약관', support: '고객지원' },
    footer: { products: '제품', language: '언어', legal: '© 2026 Hyperfocus Lab · 대표 이예준' },
    home: {
      title: 'Hyperfocus Lab | 소프트웨어 스튜디오',
      description: 'Hyperfocus Lab은 자체 소프트웨어 제품을 만들고 운영하는 스튜디오입니다. 지금은 피클리를 운영합니다.',
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
              { shot: 'chart', label: '예상 약효 곡선', title: '지금 약효가 어디쯤인지.', body: '콘서타와 메디키넷의 알려진 약효 변화를 바탕으로 시간대별 예상 약효를 그립니다. 지금 약효가 오르는 중인지, 가장 강한 때인지, 줄어드는 중인지 알 수 있고, 단계별 시간은 내 몸에 맞게 조정할 수 있습니다. Apple Watch를 쓰면 심박수와 움직임이 곡선 아래에 시간대별로 함께 표시됩니다.', alt: '콘서타 예상 약효 곡선과 그 아래 심박수, 움직임 그래프가 있는 피클리 복약 화면' },
              { shot: 'mood', label: '기분 체크인', title: '기분은 한 번 탭으로, 메모는 그 아래에.', body: '다섯 가지 표정 중 하나를 누르면 그 시각의 기분이 기록됩니다. 하루에 몇 번이든 남길 수 있고, 남긴 기분은 약효 곡선 아래에 기록한 시각에 맞춰 표시됩니다. 표정 아래 칸에 한 줄 메모도 적을 수 있습니다.', alt: '다섯 가지 표정과 메모 줄이 있는 기분 카드, 그 아래 약효 곡선과 기분 기록 띠가 있는 피클리 복약 화면' },
              { shot: 'lock', label: '다이나믹 아일랜드·잠금 화면', title: '남은 약효 시간이 늘 화면 위에.', body: 'iPhone은 다이나믹 아일랜드와 잠금 화면, Apple Watch 스마트 스택에, Android는 알림 영역에 남은 약효 시간이 계속 떠 있습니다. 약효가 오를 때, 최대 농도 구간에 들어설 때, 끝나갈 때는 알림으로 알려줍니다.', alt: '다이나믹 아일랜드와 잠금 화면에 콘서타 36mg 메인 피크와 남은 시간이 표시된 iPhone' },
              { shot: 'report', label: 'PDF 리포트', title: '진료 때 보여줄 기록을 PDF로.', body: '기간을 고르면 "지난 N일, 이렇게 지냈어요" 리포트가 두 장짜리 PDF로 만들어집니다. 복용 기록, 이전 기간과 비교한 컨디션 변화, 하루 중 약효 흐름, 일별 메모, 진료 때 물어볼 질문이 들어갑니다.', alt: '복용 기록과 컨디션 변화가 정리된 PDF 리포트 첫 장 미리보기' },
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
              { shot: 'backup', label: '백업·복구', title: '폰을 바꿔도 기록은 그대로.', body: '복약 기록과 건강 데이터는 외부 서버로 보내지 않고, 기기와 내 iCloud에만 저장됩니다. 자동으로 백업하고, 필요할 때 지금 바로 백업하거나 파일로 내보낼 수 있습니다.', alt: 'iCloud 백업, 지금 백업, 데이터 내보내기와 가져오기가 있는 백업·복구 화면' },
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
        data: {
          label: '데이터',
          title: '기록은 내 기기에.',
          items: [
            { title: '내 iCloud에 백업', body: '본인 iCloud에 자동으로 백업하고, 같은 Apple 계정의 iPhone·iPad끼리 동기화합니다. Android는 Google Drive에 백업합니다.' },
            { title: '약 이름 숨기기', body: '위젯, 잠금 화면, 다이나믹 아일랜드에 약 이름과 이미지가 보이지 않게 할 수 있습니다.' },
          ],
        },
        featuresTitle: '그 밖의 기능',
        features: [
          { title: 'Apple Watch 연동', platforms: ['iOS'], body: 'Apple Watch가 기록한 심박수, 움직임, 수면, 운동을 건강 앱에서 가져와 약효 곡선 아래와 컨디션 요약에 보여줍니다. 남은 약효 시간은 워치 스마트 스택에도 표시됩니다.' },
          { title: '단계별 알림', platforms: ['iOS', 'Android'], body: '약효가 오르기 시작할 때, 피크에 들어설 때, 줄어들기 시작할 때 알려줍니다. 콘서타는 2차 상승도 알려주며, 항목별로 켜고 끌 수 있습니다.' },
          { title: '심박수 반응', platforms: ['iOS'], body: '복용 후 심박수를 평소와 비교하고, 심박수가 튄 원인이 약효인지 활동 영향인지 추정합니다.' },
          { title: '직접 추가하는 약', platforms: ['iOS', 'Android'], body: '목록에 없는 약도 이름, 용량, 사진을 직접 넣어 기록할 수 있습니다. 곡선은 지원하는 약만 나옵니다.' },
        ],
        notes: [
          '일부 기능은 피클리 Pro에서 쓸 수 있습니다.',
          '예상 곡선은 참고용이며 의학적 판단을 대신하지 않습니다.',
        ],
      },
    },
  },
  en: {
    appName: 'Peakly',
    nav: { contact: 'Contact', support: 'Support', language: 'Language', main: 'Main' },
    docs: { privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Support' },
    footer: { products: 'Products', language: 'Language', legal: '© 2026 Hyperfocus Lab · Representative: Yejun Lee' },
    home: {
      title: 'Hyperfocus Lab | Software studio',
      description: 'Hyperfocus Lab is a studio that builds and runs its own software products. Today we run Peakly.',
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
              { shot: 'chart', label: 'Estimated effect curve', title: 'Know where your medication is.', body: 'Based on the known effect profiles of Concerta and Medikinet, Peakly draws your estimated effect by time of day. See whether it is rising, at its strongest, or wearing off, and adjust each phase\'s timing to fit how your body responds. With Apple Watch, heart rate and movement appear under the curve by time of day.', alt: 'Peakly medication screen with the expected Concerta curve above heart rate and movement graphs' },
              { shot: 'mood', label: 'Mood check-in', title: 'One tap for your mood, a note right below.', body: 'Tap one of five faces to log how you feel at that moment. Log as often as you like; each mood appears under the effect curve at the time you logged it. You can add a one-line note right below the faces.', alt: 'Peakly medication screen with a mood card of five faces and a note line, above the effect curve and a mood log strip' },
              { shot: 'lock', label: 'Dynamic Island and Lock Screen', title: 'Time left, always on screen.', body: 'The time your medication has left stays in the Dynamic Island, on the Lock Screen, and in the Apple Watch Smart Stack, and in the notification shade on Android. Notifications tell you when it starts rising, when the peak window begins, and when it is wearing off.', alt: 'iPhone Dynamic Island and Lock Screen showing Concerta 36mg at its main peak with the time left' },
              { shot: 'report', label: 'PDF report', title: 'Your records as a PDF for your doctor.', body: 'Pick a period and Peakly makes a two-page PDF, "How the last N days went." It includes your dose records, how your condition changed from the previous period, how the effect ran through the day, daily notes, and questions to ask at the visit.', alt: 'Preview of the first page of the PDF report with dose records and condition changes' },
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
              { shot: 'backup', label: 'Backup and restore', title: 'New phone, same records.', body: 'Your dose records and health data never go to an outside server. They are stored only on your device and in your own iCloud. Backups run automatically, and you can also back up now or export a file.', alt: 'Backup screen with iCloud backup, back up now, and data export and import' },
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
        data: {
          label: 'Data',
          title: 'Your records stay on your device.',
          items: [
            { title: 'Backed up to your iCloud', body: 'Back up automatically to your own iCloud and sync between iPhone and iPad on the same Apple Account. Android backs up to Google Drive.' },
            { title: 'Hide medication names', body: 'Keep medication names and images out of widgets, the Lock Screen, and the Dynamic Island.' },
          ],
        },
        featuresTitle: 'More in Peakly',
        features: [
          { title: 'Apple Watch', platforms: ['iOS'], body: 'Heart rate, movement, sleep, and workouts recorded by Apple Watch come in through Apple Health and appear under the effect curve and in your condition summary. The time left is also shown in the watch Smart Stack.' },
          { title: 'Phase notifications', platforms: ['iOS', 'Android'], body: 'Get notified when the effect starts rising, when it reaches its peak, and when it starts wearing off. For Concerta you also hear about the second rise. Turn each one on or off.' },
          { title: 'Heart-rate response', platforms: ['iOS'], body: 'Compares your heart rate after a dose with your usual, and estimates whether a spike reflects the medication\'s effect or the effect of activity.' },
          { title: 'Your own medications', platforms: ['iOS', 'Android'], body: 'Log medications that are not on the list with your own name, dose, and photo. Curves are available for supported medications only.' },
        ],
        notes: [
          'Some features require Peakly Pro.',
          'Curves are estimates for reference and do not replace medical advice.',
        ],
      },
    },
  },
  ja: {
    appName: 'ピークリー',
    nav: { contact: 'お問い合わせ', support: 'サポート', language: '言語', main: 'メインメニュー' },
    docs: { privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート' },
    footer: { products: 'プロダクト', language: '言語', legal: '© 2026 Hyperfocus Lab · 代表 Yejun Lee' },
    home: {
      title: 'Hyperfocus Lab | ソフトウェアスタジオ',
      description: 'Hyperfocus Labは、自社のソフトウェア製品をつくり、運営するスタジオです。現在はピークリーを運営しています。',
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
              { shot: 'chart', label: '予測グラフ', title: 'いま、作用はどのあたりか。', body: 'コンサータとメディキネットの一般的な作用の変化をもとに、時間ごとの作用の予測を描きます。いま作用が上がっている途中か、いちばん強い時間か、弱まってきているかがわかり、各段階の時間は自分の体に合わせて調整できます。Apple Watchを使うと、心拍数と動きが曲線の下に時間ごとに表示されます。', alt: 'コンサータの予想曲線と心拍数・動きのグラフが並ぶピークリーの服薬画面' },
              { shot: 'mood', label: '気分チェックイン', title: '気分はワンタップで、メモはそのすぐ下に。', body: '5つの表情のどれかをタップすると、その時刻の気分が記録されます。一日に何回でも残せて、記録した気分は作用グラフの下、記録した時刻の位置に表示されます。表情の下にはひとことメモも書けます。', alt: '5つの表情とメモ欄がある気分カードと、その下に作用グラフと気分の記録の帯があるピークリーの服薬画面' },
              { shot: 'lock', label: 'Dynamic Island・ロック画面', title: '作用の残り時間を、いつも画面に。', body: 'iPhoneではDynamic Island、ロック画面、Apple Watchのスマートスタックに、Androidでは通知エリアに、作用の残り時間が表示され続けます。作用が上がり始めたとき、ピークの時間帯に入ったとき、切れかけたときは通知でお知らせします。', alt: 'Dynamic Islandとロック画面に、コンサータ36mgのメインピークと残り時間を表示したiPhone' },
              { shot: 'report', label: 'PDFレポート', title: '診察で見せる記録を、PDFで。', body: '期間を選ぶと、「直近N日間、こんなふうに過ごしました」というレポートが2ページのPDFになります。服薬記録、前の期間と比べたコンディションの変化、一日の作用の流れ、日ごとのメモ、診察で聞きたいことが入ります。', alt: '服薬記録とコンディションの変化をまとめたPDFレポート1ページ目のプレビュー' },
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
              { shot: 'backup', label: 'バックアップ・復元', title: '機種を変えても、記録はそのまま。', body: '服薬記録と健康データは外部のサーバーには送らず、端末と自分のiCloudにだけ保存されます。自動でバックアップし、必要なときは今すぐバックアップしたりファイルに書き出したりできます。', alt: 'iCloudバックアップ、今すぐバックアップ、データの書き出しと読み込みがあるバックアップ画面' },
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
        data: {
          label: 'データ',
          title: '記録は自分の端末に。',
          items: [
            { title: '自分のiCloudにバックアップ', body: '自分のiCloudに自動でバックアップし、同じApple AccountのiPhone・iPad間で同期します。AndroidはGoogleドライブにバックアップします。' },
            { title: '薬の名前を隠す', body: 'ウィジェット、ロック画面、Dynamic Islandに薬の名前と画像を表示しないようにできます。' },
          ],
        },
        featuresTitle: 'そのほかの機能',
        features: [
          { title: 'Apple Watch連携', platforms: ['iOS'], body: 'Apple Watchが記録した心拍数、動き、睡眠、ワークアウトをヘルスケアから取り込み、作用グラフの下とコンディションのまとめに表示します。残り時間はウォッチのスマートスタックにも表示されます。' },
          { title: '段階ごとの通知', platforms: ['iOS', 'Android'], body: '作用が上がりはじめたとき、ピークに入ったとき、弱まりはじめたときにお知らせします。コンサータは2回目の上昇もお知らせし、項目ごとにオン・オフできます。' },
          { title: '心拍数の反応', platforms: ['iOS'], body: '服薬後の心拍数をふだんと比べ、心拍数の上昇が薬の作用か活動の影響かを推定します。' },
          { title: '自分で追加する薬', platforms: ['iOS', 'Android'], body: 'リストにない薬も、名前・用量・写真を自分で入れて記録できます。グラフは対応している薬のみです。' },
        ],
        notes: [
          '一部の機能はPeakly Proで利用できます。',
          '予測グラフは参考値であり、医療上の判断に代わるものではありません。',
        ],
      },
    },
  },
} as const;
