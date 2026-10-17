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
    nav: { products: '제품', contact: '문의', support: '고객지원', language: '언어 선택', main: '주요 메뉴' },
    docs: { privacy: '개인정보처리방침', terms: '서비스 이용약관', support: '고객지원' },
    footer: { products: '제품', company: '회사', language: '언어', contact: '문의하기', legal: '© 2026 Hyperfocus Lab · 대표 이예준 · 대한민국 서울' },
    home: {
      title: 'Hyperfocus Lab | 소프트웨어 스튜디오',
      description: 'Hyperfocus Lab은 자체 소프트웨어 제품을 만들고 운영하는 스튜디오입니다. 지금은 Peakly를 운영합니다.',
      eyebrow: 'Software studio · Seoul',
      lead: '자체 소프트웨어 제품을 만들고 운영하는 스튜디오입니다.',
      products: {
        title: '제품',
        facts: [
          ['플랫폼', 'iPhone · iPad · Android'],
          ['언어', '한국어 · English · 日本語'],
        ],
        more: 'Peakly 페이지로',
      },
      peakly: {
        tagline: 'ADHD 복약 기록 앱',
        lead: '약을 먹은 시간만 기록하면, 지금 약효가 어느 단계인지 보여줍니다. 루틴과 할 일도 같은 앱에서 챙깁니다.',
        privacy: '복약 기록과 건강 데이터는 외부 서버로 보내지 않습니다. 기기와 내 iCloud(Android는 Google Drive)에만 저장됩니다.',
        sections: [
          {
            tab: '복약',
            intro: '약을 먹은 시간 하나로 약효의 흐름을 봅니다.',
            rows: [
              { shot: 'chart', label: '예상 약효 곡선', title: '지금 약효가 어디쯤인지.', body: '콘서타와 메디키넷의 참고 곡선으로 시간대별 예상 약효를 그립니다. 오르는 중인지, 피크인지, 끝나가는지 바로 보이고, 피크 구간은 내 몸에 맞게 직접 옮길 수 있습니다. 곡선 아래에는 Apple Watch가 잰 심박수와 움직임이 같은 시간축으로 붙습니다.', alt: '콘서타 예상 약효 곡선과 그 아래 심박수, 움직임 그래프가 있는 Peakly 복약 화면' },
              { shot: 'mood', label: '기분 체크인', title: '기분은 한 번 탭으로, 메모는 그 옆에.', body: '복약 탭에서 다섯 가지 표정 중 하나를 누르면 그 시각의 기분이 기록됩니다. 하루에 몇 번이든 남길 수 있고, 약효 곡선 아래 띠에는 그날 남긴 기분이 시간 순서대로 색 점으로 찍힙니다. 한 줄 메모도 같은 카드에서 바로 적습니다.', alt: '다섯 가지 표정과 메모 줄이 있는 기분 카드, 그 아래 약효 곡선과 기분 기록 띠가 있는 Peakly 복약 화면' },
              { shot: 'lock', label: '다이나믹 아일랜드·잠금 화면', title: '남은 약효 시간이 늘 화면 위에.', body: 'iPhone은 다이나믹 아일랜드와 잠금 화면, Apple Watch 스마트 스택에, Android는 알림 영역에 남은 약효 시간이 계속 떠 있습니다. 약효가 오를 때, 최대 농도 구간에 들어설 때, 끝나갈 때는 알림으로 알려줍니다.', alt: '다이나믹 아일랜드와 잠금 화면에 콘서타 36mg 메인 피크와 남은 시간이 표시된 iPhone' },
              { shot: 'report', pdf: true, label: 'PDF 리포트', title: '진료 때 보여줄 기록을 PDF로.', body: '기간을 고르면 "지난 N일, 이렇게 지냈어요" 리포트가 두 장짜리 PDF로 만들어집니다. 복용 기록, 이전 기간과 비교한 몸 상태 변화, 하루 중 약효 흐름, 기분 메모와 진료 때 물어볼 질문을 담습니다. 진료실에서 화면을 넘기지 않고 그대로 보여주면 됩니다.', alt: '기간을 고르는 PDF 리포트 생성 화면과, 복용 기록과 몸 상태 변화가 정리된 리포트 첫 장' },
            ],
          },
          {
            tab: '목표',
            intro: '큰 목표는 날짜로, 오늘 할 몫은 작게.',
            rows: [
              { shot: 'goals', label: '전체 목표', title: '목표는 진행률로, 기다리는 날은 D-Day로.', body: '자격증, 다이어트, 포트폴리오처럼 큰 목표에 날짜를 붙이면 진행률과 남은 기간이 함께 보입니다. 여행, 시험일, 기념일처럼 날짜가 정해진 일은 D-Day로 띄워 둡니다.', alt: 'D-Day와 목표별 진행률이 있는 전체 목표 화면' },
              { shot: 'goals-today', label: '오늘의 목표', title: '큰 목표를 오늘 몫으로.', body: '목표를 오늘 할 작은 일로 나누고, 체크한 만큼 오늘 진행 상황이 채워집니다.', alt: '오늘의 목표 진행률과 작은 실천 목록' },
            ],
          },
          {
            tab: '할 일',
            intro: '매일 하는 일과 마감이 있는 일을 나눠서.',
            rows: [
              { shot: 'routines', label: '매일 루틴', title: '정한 시간에 할 일, 아무 때나 할 일.', body: '기상이나 산책처럼 시간이 정해진 일은 시간별 루틴으로, 스트레칭처럼 하루 중 언제든 하면 되는 일은 언제나 루틴으로 나눕니다. 최근 7일과 이번 달에 몇 번 놓쳤는지도 셉니다.', alt: '시간별 루틴과 언제나 루틴이 있는 매일 루틴 화면' },
              { shot: 'todo', label: '해야 할 일', title: '마감이 가까운 일부터.', body: '마감이 있는 일은 남은 시간별로 나눠 보여줍니다. 오늘까지, 이번 주, 그 뒤로 정리되어 무엇부터 할지 고민할 필요가 없습니다.', alt: '남은 시간별로 나뉜 해야 할 일 목록' },
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
              { shot: 'settings', label: '내 방식대로', title: '언어, 화면, 시간까지 내게 맞게.', body: '한국어, 영어, 일본어를 지원하고, 다크·라이트 모드와 색상 테마를 고를 수 있습니다. 목표 취침·기상 시간을 정해 두면 약효가 잠자리까지 이어질지 미리 알려줍니다.', alt: '언어, 디스플레이 모드, 색상 테마, 목표 취침·기상 시간이 있는 설정 화면' },
              { shot: 'backup', label: '백업·복구', title: '폰을 바꿔도 기록은 그대로.', body: '복약 기록과 건강 데이터는 외부 서버로 보내지 않고, 기기와 내 iCloud에만 저장됩니다. 자동으로 백업하고, 필요할 때 지금 바로 백업하거나 파일로 내보낼 수 있습니다. 복구할 때는 지금 기록과 다른 항목만 골라서 되살립니다.', alt: 'iCloud 백업, 지금 백업, 데이터 내보내기와 가져오기가 있는 백업·복구 화면' },
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
            { title: '외부 서버로 보내지 않습니다', body: '복약 기록과 건강 데이터는 기기와 내 iCloud에 저장하고, 외부 서버로 보내지 않습니다.' },
            { title: '내 iCloud에 백업', body: '본인 iCloud에 자동으로 백업하고, 같은 Apple 계정의 iPhone·iPad끼리 동기화합니다. Android는 Google Drive에 백업합니다. (Pro)' },
            { title: '약 이름 숨기기', body: '위젯, 잠금 화면, 다이나믹 아일랜드에 약 이름과 이미지가 보이지 않게 할 수 있습니다. (Pro)' },
          ],
        },
        featuresTitle: '그 밖의 기능',
        features: [
          { title: 'Apple Watch 연동', platforms: ['iOS'], body: 'Apple Watch가 기록한 심박수, 움직임, 수면, 운동을 건강 앱에서 가져와 복약 기록 옆에 보여줍니다. 남은 약효 시간은 워치 스마트 스택에도 뜹니다.' },
          { title: '단계별 알림', platforms: ['iOS', 'Android'], body: '1차 피크, 최대 농도 구간 진입, 최대 농도 도달, 작용 종료 구간마다 알려줍니다. 항목별로 켜고 끌 수 있습니다. (Pro)' },
          { title: '심박수 반응', platforms: ['iOS'], body: '복용 후 심박수를 평소와 비교하고, 심박수가 튄 원인이 약인지 활동인지 추정합니다.' },
          { title: '약효 위젯', platforms: ['iOS'], body: '지금 단계를 홈 화면, 잠금 화면, 다이나믹 아일랜드에 보여줍니다.' },
          { title: '취침 시간 경고', platforms: ['iOS', 'Android'], body: '약을 먹기 전에, 약효가 목표 취침 시간 이후까지 이어질 수 있으면 미리 알려줍니다.' },
          { title: '직접 추가하는 약', platforms: ['iOS', 'Android'], body: '목록에 없는 약도 이름과 용량으로 기록합니다. 곡선은 지원하는 약만 나옵니다.' },
        ],
        notes: [
          '일부 국가에서는 애더럴 XR과 바이반스 곡선도 지원합니다.',
          '일부 기능은 Peakly Pro에서 쓸 수 있습니다.',
          '예상 곡선은 참고용이며 의학적 판단을 대신하지 않습니다.',
        ],
      },
      contact: {
        title: '문의',
        body: '제휴, 언론, 그 밖의 문의는 이메일로 보내 주세요.',
      },
    },
  },
  en: {
    nav: { products: 'Products', contact: 'Contact', support: 'Support', language: 'Language', main: 'Main' },
    docs: { privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Support' },
    footer: { products: 'Products', company: 'Company', language: 'Language', contact: 'Contact', legal: '© 2026 Hyperfocus Lab · Representative: Yejun Lee · Seoul, South Korea' },
    home: {
      title: 'Hyperfocus Lab | Software studio',
      description: 'Hyperfocus Lab is a studio that builds and runs its own software products. Today we run Peakly.',
      eyebrow: 'Software studio · Seoul',
      lead: 'A studio that builds and runs its own software products.',
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
        lead: 'Log when you take your medication, and Peakly shows which phase it is in right now. Your routines and to-dos live in the same app.',
        privacy: 'Your dose records and health data never go to an outside server. They are stored only on your device and in your own iCloud (Google Drive on Android).',
        sections: [
          {
            tab: 'Medication',
            intro: 'One logged dose time shows how your medication flows through the day.',
            rows: [
              { shot: 'chart', label: 'Estimated effect curve', title: 'Know where your medication is.', body: 'Reference curves for Concerta and Medikinet show your estimated effect through the day. See at a glance whether it is rising, peaking, or wearing off, and move the peak window to match how you feel. Heart rate and movement from Apple Watch sit right below on the same timeline.', alt: 'Peakly medication screen with the expected Concerta curve above heart rate and movement graphs' },
              { shot: 'mood', label: 'Mood check-in', title: 'One tap for your mood, a note beside it.', body: 'On the Medication tab, tap one of five faces to log how you feel right now. Log as often as you like during the day; the strip under the effect curve places each mood as a colored dot in time order. A one-line note goes in the same card.', alt: 'Peakly medication screen with a mood card of five faces and a note line, above the effect curve and a mood log strip' },
              { shot: 'lock', label: 'Dynamic Island and Lock Screen', title: 'Time left, always on screen.', body: 'The time your medication has left stays in the Dynamic Island, on the Lock Screen, and in the Apple Watch Smart Stack, and in the notification shade on Android. Notifications tell you when it starts rising, when the peak window begins, and when it is wearing off.', alt: 'iPhone Dynamic Island and Lock Screen showing Concerta 36mg at its main peak with the time left' },
              { shot: 'report', pdf: true, label: 'PDF report', title: 'Your records as a PDF for your doctor.', body: 'Pick a period and Peakly makes a two-page PDF, "How the last N days went." It covers your dose records, body changes compared with the previous period, how the effect ran through the day, your mood notes, and questions to ask at the visit. Show it as is instead of scrolling through your phone.', alt: 'PDF report screen for choosing a period, next to the first page of the report with dose records and body changes' },
            ],
          },
          {
            tab: 'Goals',
            intro: 'Big goals get a date. Today\'s share stays small.',
            rows: [
              { shot: 'goals', label: 'All goals', title: 'Goals as progress, waiting days as D-Days.', body: 'Give a big goal like a certification, a diet, or a portfolio a date, and you see its progress and the time left together. Things with a fixed date, like a trip, an exam day, or an anniversary, sit on screen as D-Days.', alt: 'All Goals screen with D-Days and progress per goal' },
              { shot: 'goals-today', label: 'Today\'s goals', title: 'Big goals, broken into today.', body: 'Split a goal into small things to do today. Each one you check fills in today\'s progress.', alt: 'Today\'s Goals with progress and small actions' },
            ],
          },
          {
            tab: 'Tasks',
            intro: 'Daily habits and deadlines, kept apart.',
            rows: [
              { shot: 'routines', label: 'Daily routines', title: 'Things for a set time, and anytime.', body: 'Things with a set time, like waking up or a walk, go into timed routines. Things you can do whenever, like stretching, go into anytime routines. Peakly also counts how many times you missed each one in the last 7 days and this month.', alt: 'Daily Routine screen with timed and anytime routines' },
              { shot: 'todo', label: 'To-dos', title: 'Closest deadline first.', body: 'Tasks with deadlines are grouped by how much time is left: today, this week, and later. No need to decide what to start with.', alt: 'Task list grouped by time left' },
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
              { shot: 'settings', label: 'Make it yours', title: 'Language, look, and your own schedule.', body: 'Peakly is available in Korean, English, and Japanese, with dark and light modes and color themes. Set your target bedtime and wake time, and Peakly warns you if the effect may last into the night.', alt: 'Settings screen with language, display mode, color theme, and target bedtime and wake time' },
              { shot: 'backup', label: 'Backup and restore', title: 'New phone, same records.', body: 'Your dose records and health data never go to an outside server. They are stored only on your device and in your own iCloud. Backups run automatically, and you can also back up now or export a file. When you restore, you choose only the records that differ from what you have.', alt: 'Backup screen with iCloud backup, back up now, and data export and import' },
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
            { title: 'Nothing sent to outside servers', body: 'Medication records and health data are stored on your device and in your own iCloud, and are never sent to an outside server.' },
            { title: 'Backed up to your iCloud', body: 'Back up automatically to your own iCloud and sync between iPhone and iPad on the same Apple Account. Android backs up to Google Drive. (Pro)' },
            { title: 'Hide medication names', body: 'Keep medication names and images out of widgets, the Lock Screen, and the Dynamic Island. (Pro)' },
          ],
        },
        featuresTitle: 'More in Peakly',
        features: [
          { title: 'Apple Watch', platforms: ['iOS'], body: 'Heart rate, movement, sleep, and workouts recorded by Apple Watch come in through Apple Health and appear beside your doses. The time left also shows in the watch Smart Stack.' },
          { title: 'Phase notifications', platforms: ['iOS', 'Android'], body: 'Get notified at the first peak, when the peak window begins, when the peak is reached, and when the effect is ending. Turn each one on or off. (Pro)' },
          { title: 'Heart-rate response', platforms: ['iOS'], body: 'Compares your heart rate after a dose with your usual, and estimates whether a spike came from medication or activity.' },
          { title: 'Medication widgets', platforms: ['iOS'], body: 'Your current phase on the Home Screen, Lock Screen, and Dynamic Island.' },
          { title: 'Bedtime warning', platforms: ['iOS', 'Android'], body: 'Before you take a dose, Peakly warns you if the effect may last past your target bedtime.' },
          { title: 'Your own medications', platforms: ['iOS', 'Android'], body: 'Log medications that are not on the list by name and dose. Curves are available for supported medications only.' },
        ],
        notes: [
          'In some countries, Peakly also includes curves for Adderall XR and Vyvanse.',
          'Some features require Peakly Pro.',
          'Curves are estimates for reference and do not replace medical advice.',
        ],
      },
      contact: {
        title: 'Contact',
        body: 'For partnerships, press, and other inquiries, email us.',
      },
    },
  },
  ja: {
    nav: { products: 'プロダクト', contact: 'お問い合わせ', support: 'サポート', language: '言語', main: 'メインメニュー' },
    docs: { privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート' },
    footer: { products: 'プロダクト', company: '会社', language: '言語', contact: 'お問い合わせ', legal: '© 2026 Hyperfocus Lab · 代表 Yejun Lee · 韓国 ソウル' },
    home: {
      title: 'Hyperfocus Lab | ソフトウェアスタジオ',
      description: 'Hyperfocus Labは、自社のソフトウェア製品をつくり、運営するスタジオです。現在はピークリーを運営しています。',
      eyebrow: 'Software studio · Seoul',
      lead: '自社のソフトウェア製品をつくり、運営するスタジオです。',
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
        lead: '薬を飲んだ時刻を記録するだけで、いま薬の作用がどの段階かを表示します。ルーティンやタスクも同じアプリで管理できます。',
        privacy: '服薬記録と健康データは外部のサーバーには送りません。端末と自分のiCloud（AndroidはGoogleドライブ）にだけ保存されます。',
        sections: [
          {
            tab: '服薬',
            intro: '飲んだ時刻ひとつで、作用の流れがわかります。',
            rows: [
              { shot: 'chart', label: '予測グラフ', title: 'いま、作用はどのあたりか。', body: 'コンサータとメディキネットの参考曲線で、時間ごとの作用の予測を描きます。上がっている途中か、ピークか、切れかけているかがひと目でわかり、ピークの時間帯は自分の感覚に合わせて動かせます。曲線の下には、Apple Watchが計測した心拍数と動きが同じ時間軸で並びます。', alt: 'コンサータの予想曲線と心拍数・動きのグラフが並ぶPeaklyの服薬画面' },
              { shot: 'mood', label: '気分チェックイン', title: '気分はワンタップで、メモはその隣に。', body: '服薬タブで5つの表情のどれかをタップすると、その時刻の気分が記録されます。一日に何回でも残せて、作用グラフの下の帯には、その日に記録した気分が時間順に色の点で並びます。ひとことメモも同じカードにそのまま書けます。', alt: '5つの表情とメモ欄がある気分カードと、その下に作用グラフと気分の記録の帯があるPeaklyの服薬画面' },
              { shot: 'lock', label: 'Dynamic Island・ロック画面', title: '作用の残り時間を、いつも画面に。', body: 'iPhoneではDynamic Island、ロック画面、Apple Watchのスマートスタックに、Androidでは通知エリアに、作用の残り時間が表示され続けます。作用が上がり始めたとき、ピークの時間帯に入ったとき、切れかけたときは通知でお知らせします。', alt: 'Dynamic Islandとロック画面に、コンサータ36mgのメインピークと残り時間を表示したiPhone' },
              { shot: 'report', pdf: true, label: 'PDFレポート', title: '診察で見せる記録を、PDFで。', body: '期間を選ぶと、「直近N日間、こんなふうに過ごしました」というレポートが2ページのPDFになります。服薬記録、前の期間と比べた体の変化、一日の作用の流れ、気分のメモ、診察で聞きたいことを載せます。診察室でスマホをスクロールせず、そのまま見せられます。', alt: '期間を選ぶPDFレポート作成画面と、服薬記録と体の変化がまとまったレポートの1ページ目' },
            ],
          },
          {
            tab: '目標',
            intro: '大きな目標は日付で、今日の分は小さく。',
            rows: [
              { shot: 'goals', label: '全体の目標', title: '目標は進捗で、待つ日はD-Dayで。', body: '資格、ダイエット、ポートフォリオのような大きな目標に日付をつけると、進捗率と残り期間が一緒に見えます。旅行、試験日、記念日のように日付が決まっていることは、D-Dayとして表示しておけます。', alt: 'D-Dayと目標ごとの進捗率が並ぶ全体の目標画面' },
              { shot: 'goals-today', label: '今日の目標', title: '大きな目標を、今日の一歩に。', body: '目標を今日やる小さなことに分けると、チェックした分だけ今日の進み具合が埋まっていきます。', alt: '今日の目標の進捗率と小さな実践の一覧' },
            ],
          },
          {
            tab: 'タスク',
            intro: '毎日のことと締め切りのあることを分けて。',
            rows: [
              { shot: 'routines', label: '毎日のルーティン', title: '決まった時間のこと、いつでもいいこと。', body: '起床や散歩のように時間が決まっていることは時間別ルーティンに、ストレッチのように一日のうちいつでもいいことはいつでもルーティンに分けます。直近7日と今月に何回できなかったかも数えます。', alt: '時間別ルーティンといつでもルーティンが並ぶ毎日のルーティン画面' },
              { shot: 'todo', label: 'やること', title: '締め切りが近いものから。', body: '締め切りのあることは、今日まで・今週・それ以降と残り時間ごとに分けて表示します。何から始めるか迷いません。', alt: '残り時間ごとに分かれたタスク一覧' },
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
              { shot: 'settings', label: '自分に合わせて', title: '言語も画面も時間も、自分仕様に。', body: '韓国語、英語、日本語で使えます。ダーク・ライトモードと色テーマも選べます。目標の就寝・起床時間を決めておくと、作用が寝る時間まで続きそうなときに事前にお知らせします。', alt: '言語、ディスプレイモード、色テーマ、目標の就寝・起床時間がある設定画面' },
              { shot: 'backup', label: 'バックアップ・復元', title: '機種を変えても、記録はそのまま。', body: '服薬記録と健康データは外部のサーバーには送らず、端末と自分のiCloudにだけ保存されます。自動でバックアップし、必要なときは今すぐバックアップしたりファイルに書き出したりできます。復元するときは、今の記録と違う項目だけを選んで戻せます。', alt: 'iCloudバックアップ、今すぐバックアップ、データの書き出しと読み込みがあるバックアップ画面' },
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
            { title: '外部のサーバーに送りません', body: '服薬記録と健康データは端末と自分のiCloudに保存し、外部のサーバーには送りません。' },
            { title: '自分のiCloudにバックアップ', body: '自分のiCloudに自動でバックアップし、同じApple アカウントのiPhone・iPad間で同期します。AndroidはGoogleドライブにバックアップします。(Pro)' },
            { title: '薬の名前を隠す', body: 'ウィジェット、ロック画面、Dynamic Islandに薬の名前と画像を表示しないようにできます。(Pro)' },
          ],
        },
        featuresTitle: 'そのほかの機能',
        features: [
          { title: 'Apple Watch連携', platforms: ['iOS'], body: 'Apple Watchが記録した心拍数、動き、睡眠、ワークアウトをヘルスケアから取り込み、服薬記録の隣に表示します。残り時間はウォッチのスマートスタックにも表示されます。' },
          { title: '段階ごとの通知', platforms: ['iOS', 'Android'], body: '最初のピーク、ピーク時間帯の開始、ピーク到達、作用終了の時間帯ごとにお知らせします。項目ごとにオン・オフできます。(Pro)' },
          { title: '心拍数の反応', platforms: ['iOS'], body: '服薬後の心拍数をふだんと比べ、心拍数の上昇が薬によるものか活動によるものかを推定します。' },
          { title: '服薬ウィジェット', platforms: ['iOS'], body: 'いまの段階をホーム画面、ロック画面、Dynamic Islandに表示します。' },
          { title: '就寝時間の警告', platforms: ['iOS', 'Android'], body: '服薬の前に、作用が目標の就寝時間を過ぎても続きそうな場合はお知らせします。' },
          { title: '自分で追加する薬', platforms: ['iOS', 'Android'], body: 'リストにない薬も、名前と用量で記録できます。グラフは対応している薬のみです。' },
        ],
        notes: [
          '一部の国では、アデロールXRとビバンセのグラフにも対応しています。',
          '一部の機能はPeakly Proで利用できます。',
          '予測グラフは参考値であり、医療上の判断に代わるものではありません。',
        ],
      },
      contact: {
        title: 'お問い合わせ',
        body: '提携、取材、その他のお問い合わせはメールでお送りください。',
      },
    },
  },
} as const;
