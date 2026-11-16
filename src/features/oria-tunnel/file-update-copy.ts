// OriaTunnel v0.2.0, published source f8ccbe7701c7b7666ed17eb07d74babbc3866aae. GPL-3.0-only.
import type {Locale} from '@/i18n/config'

export const fileReleaseVersion = 'v0.2.0'
export const fileReleaseId = 'release-' + fileReleaseVersion.replaceAll('.', '-')
export const fileReleaseUrl = 'https://github.com/KrisLee1/OriaTunnel/releases/tag/' + fileReleaseVersion

type FileUpdateCopy={eyebrow:string;title:string;status:string;intro:string;demoNotice:string;currentDownload:string;highlights:string[];changes:string[]}
export const fileUpdateCopy={
  "en": {
    "eyebrow": "FILES IN YOUR SSH WORKSPACE",
    "title": "Your files. On either side of SSH.",
    "status": "Available now",
    "intro": "Browse, transfer, preview and edit files alongside your tunnels and terminals.",
    "demoNotice": "Interactive preview · sample files and progress only. Edits stay in this page; no files are read or transferred.",
    "currentDownload": "Current download",
    "highlights": [
      "Browse and transfer",
      "A queue that stays with you",
      "Preview and edit",
      "A flexible workspace",
      "At home on macOS"
    ],
    "changes": [
      "Browse local and SSH files with list or icon views, search, sorting, multi-selection and drag and drop. Upload, download or copy between hosts.",
      "Track progress, speed and remaining time. Pause, resume, retry or cancel, and resolve name conflicts. Host-to-host copies prefer direct transfer, with streaming through your computer when needed.",
      "Preview code, images, SVG and Markdown, including formulas and diagrams. Save text to your computer or an SSH host, preserving encoding and line endings while detecting external changes.",
      "Files and SSH terminals share dockable, resizable work panels. Choose automatic or manual three-pane layouts, inspect batches and follow transfers on the connection map.",
      "Mounted volumes, hidden files, POSIX permissions, the native Trash and Finder shortcuts. Text saves preserve permissions, ACLs and extended attributes. Fixes macOS browser launching. Chrome, Edge and Firefox retain isolated profiles and SOCKS5 proxy settings."
    ]
  },
  "zh-CN": {
    "eyebrow": "SSH 工作区中的文件",
    "title": "SSH 两端，文件近在手边。",
    "status": "正式发布",
    "intro": "浏览、传输、预览与编辑文件，与隧道和终端一起工作。",
    "demoNotice": "交互预览 · 仅使用示例文件与进度。编辑只保留在当前页面，不读取或传输真实文件。",
    "currentDownload": "当前可下载版本",
    "highlights": [
      "浏览与传输文件",
      "持续在后台的传输队列",
      "预览与文本编辑",
      "灵活的工作面板",
      "更贴合 macOS"
    ],
    "changes": [
      "浏览本机和 SSH 主机文件，上传、下载及主机间传输。支持列表与图标视图、搜索、排序、多选、拖放和文件管理。",
      "查看进度、速度与剩余时间，暂停、继续、重试、取消并处理同名冲突。主机间优先直传，条件不满足时经本机流式中转。",
      "预览代码、图片、SVG、Markdown、公式与图表。文本可保存至本机或 SSH 主机，保留编码和换行，并检测外部修改。",
      "文件与 SSH 终端共用可停靠、缩放的工作面板，自动或手动选择三栏布局，查看批次明细与连接图传输状态。",
      "支持挂载卷、隐藏文件、POSIX 权限、原生废纸篓和 Finder 快捷键。文本保存保留权限、ACL 与扩展属性。 修复 macOS 代理浏览器启动兼容问题。Chrome、Edge 与 Firefox 继续使用独立配置和 SOCKS5 代理。"
    ]
  },
  "zh-TW": {
    "eyebrow": "SSH 工作區中的檔案",
    "title": "SSH 兩端，檔案近在手邊。",
    "status": "正式發行",
    "intro": "瀏覽、傳輸、預覽與編輯檔案，與通道和終端機一起工作。",
    "demoNotice": "互動預覽 · 僅使用範例檔案與進度。編輯只保留於目前頁面，不讀取或傳輸真實檔案。",
    "currentDownload": "目前可下載版本",
    "highlights": [
      "瀏覽與傳輸檔案",
      "背景傳輸佇列",
      "預覽與文字編輯",
      "彈性的工作面板",
      "更貼近 macOS"
    ],
    "changes": [
      "瀏覽本機與 SSH 主機檔案，上傳、下載及主機間傳輸。支援清單與圖示檢視、搜尋、排序、多選、拖放與檔案管理。",
      "查看進度、速度與剩餘時間，暫停、繼續、重試、取消並處理同名衝突。主機間優先直傳，條件不足時經本機串流中轉。",
      "預覽程式碼、圖片、SVG、Markdown、公式與圖表。文字可儲存至本機或 SSH 主機，保留編碼與換行並偵測外部修改。",
      "檔案與 SSH 終端機共用可停靠、調整大小的工作面板，自動或手動選擇三欄配置，查看批次明細與連線圖傳輸狀態。",
      "支援掛載卷、隱藏檔案、POSIX 權限、原生垃圾桶與 Finder 快速鍵。儲存文字保留權限、ACL 與延伸屬性。 修正 macOS 代理瀏覽器啟動相容問題。Chrome、Edge 與 Firefox 繼續使用獨立設定與 SOCKS5 代理。"
    ]
  },
  "ja": {
    "eyebrow": "SSH ワークスペースのファイル",
    "title": "SSH の両側のファイルを、手元に。",
    "status": "リリース済み",
    "intro": "トンネルやターミナルと並べて、ファイルの閲覧、転送、プレビュー、編集。",
    "demoNotice": "操作できるプレビュー · サンプルファイルと進捗のみ。編集はこのページ内に留まり、実際のファイルの読み取りや転送は行いません。",
    "currentDownload": "現在のダウンロード",
    "highlights": [
      "ファイルの閲覧と転送",
      "バックグラウンド転送キュー",
      "プレビューとテキスト編集",
      "柔軟なワークパネル",
      "macOS に自然な操作"
    ],
    "changes": [
      "ローカルと SSH ホストのファイルを閲覧し、アップロード、ダウンロード、ホスト間転送。リスト・アイコン表示、検索、並べ替え、複数選択、ドラッグ＆ドロップに対応。",
      "進捗、速度、残り時間を確認。一時停止、再開、再試行、キャンセル、同名競合の処理に対応。ホスト間は直接転送を優先し、必要に応じてローカル経由でストリーミング中継。",
      "コード、画像、SVG、Markdown、数式、図をプレビュー。文字コードと改行を保ち、外部変更を検出してローカルや SSH ホストにテキストを保存。",
      "ファイルと SSH ターミナルでドッキング・サイズ変更可能なパネルを共有。自動・手動の3ペイン配置、バッチの詳細、接続図上の転送状態を表示。",
      "マウント済みボリューム、隠しファイル、POSIX 権限、ネイティブのゴミ箱、Finder ショートカットに対応。保存時は権限、ACL、拡張属性を保持。 macOS のプロキシブラウザー起動を修正。Chrome、Edge、Firefox は独立したプロファイルと SOCKS5 プロキシを引き続き使用。"
    ]
  },
  "ko": {
    "eyebrow": "SSH 작업 공간의 파일",
    "title": "SSH 양쪽의 파일을 손쉽게.",
    "status": "정식 출시",
    "intro": "터널과 터미널 옆에서 파일 탐색, 전송, 미리보기와 편집까지.",
    "demoNotice": "대화형 미리보기 · 예제 파일과 진행률만 사용합니다. 편집은 현재 페이지에만 유지되며 실제 파일을 읽거나 전송하지 않습니다.",
    "currentDownload": "현재 다운로드 버전",
    "highlights": [
      "파일 탐색과 전송",
      "백그라운드 전송 대기열",
      "미리보기와 텍스트 편집",
      "유연한 작업 패널",
      "macOS에 맞는 사용 경험"
    ],
    "changes": [
      "로컬과 SSH 호스트의 파일을 탐색하고 업로드, 다운로드, 호스트 간 전송을 수행합니다. 목록·아이콘 보기, 검색, 정렬, 다중 선택과 드래그 앤 드롭을 지원합니다.",
      "진행률, 속도와 남은 시간을 확인하고 일시 중지, 재개, 재시도, 취소 및 이름 충돌 처리를 수행합니다. 호스트 간 직접 전송을 우선하며 필요하면 로컬에서 스트리밍 중계합니다.",
      "코드, 이미지, SVG, Markdown, 수식과 다이어그램을 미리 봅니다. 인코딩과 줄바꿈을 유지하고 외부 변경을 감지하며 로컬 또는 SSH 호스트에 텍스트를 저장합니다.",
      "파일과 SSH 터미널이 도킹 및 크기 조절 가능한 패널을 공유합니다. 자동·수동 3개 패널 배치, 일괄 작업 상세와 연결 맵의 전송 상태를 제공합니다.",
      "마운트된 볼륨, 숨김 파일, POSIX 권한, 기본 휴지통과 Finder 단축키를 지원합니다. 텍스트 저장 시 권한, ACL과 확장 속성을 보존합니다. macOS 프록시 브라우저 실행 호환성을 수정했습니다. Chrome, Edge, Firefox는 독립 프로필과 SOCKS5 프록시를 계속 사용합니다."
    ]
  },
  "de": {
    "eyebrow": "DATEIEN IM SSH-ARBEITSBEREICH",
    "title": "Ihre Dateien. Auf beiden Seiten von SSH.",
    "status": "Veröffentlicht",
    "intro": "Dateien neben Tunneln und Terminals durchsuchen, übertragen, ansehen und bearbeiten.",
    "demoNotice": "Interaktive Vorschau · nur Beispieldateien und Fortschrittswerte. Änderungen bleiben auf dieser Seite; echte Dateien werden weder gelesen noch übertragen.",
    "currentDownload": "Aktueller Download",
    "highlights": [
      "Dateien durchsuchen und übertragen",
      "Übertragungen im Hintergrund",
      "Vorschau und Textbearbeitung",
      "Flexible Arbeitsbereiche",
      "Vertraut auf macOS"
    ],
    "changes": [
      "Lokale und SSH-Dateien durchsuchen, hochladen, herunterladen und zwischen Hosts übertragen. Mit Listen- und Symbolansicht, Suche, Sortierung, Mehrfachauswahl und Drag-and-drop.",
      "Fortschritt, Geschwindigkeit und Restzeit verfolgen. Pausieren, fortsetzen, erneut versuchen, abbrechen und Namenskonflikte lösen. Zwischen Hosts bevorzugt direkt, sonst als Stream über Ihren Computer.",
      "Code, Bilder, SVG, Markdown, Formeln und Diagramme ansehen. Texte lokal oder auf SSH-Hosts speichern, Kodierung und Zeilenenden bewahren und externe Änderungen erkennen.",
      "Dateien und SSH-Terminals teilen andockbare, skalierbare Panels. Automatische oder manuelle Drei-Panel-Layouts, Stapeldetails und Übertragungsstatus in der Verbindungsübersicht.",
      "Eingehängte Volumes, versteckte Dateien, POSIX-Rechte, nativer Papierkorb und Finder-Tastenkürzel. Textspeicherung bewahrt Rechte, ACLs und erweiterte Attribute. Behebt Browser-Startprobleme unter macOS. Chrome, Edge und Firefox verwenden weiterhin getrennte Profile und SOCKS5-Proxys."
    ]
  },
  "fr": {
    "eyebrow": "LES FICHIERS DANS VOTRE ESPACE SSH",
    "title": "Vos fichiers, des deux côtés de SSH.",
    "status": "Disponible",
    "intro": "Parcourez, transférez, prévisualisez et modifiez les fichiers à côté des tunnels et terminaux.",
    "demoNotice": "Aperçu interactif · fichiers et progression fictifs. Les modifications restent dans cette page ; aucun fichier réel n’est lu ou transféré.",
    "currentDownload": "Téléchargement actuel",
    "highlights": [
      "Parcourir et transférer",
      "Une file en arrière-plan",
      "Aperçu et édition de texte",
      "Un espace flexible",
      "À l’aise sur macOS"
    ],
    "changes": [
      "Parcourez les fichiers locaux et SSH, envoyez, téléchargez ou copiez entre hôtes. Vues liste et icônes, recherche, tri, sélection multiple et glisser-déposer.",
      "Suivez progression, vitesse et temps restant. Pause, reprise, nouvelle tentative, annulation et résolution des conflits de noms. Transfert direct entre hôtes si possible, sinon relais en flux via votre ordinateur.",
      "Prévisualisez code, images, SVG, Markdown, formules et diagrammes. Enregistrez le texte localement ou sur un hôte SSH en conservant encodage et fins de ligne, avec détection des modifications externes.",
      "Fichiers et terminaux SSH partagent des panneaux ancrables et redimensionnables. Agencements à trois volets automatiques ou manuels, détails des lots et état sur la carte des connexions.",
      "Volumes montés, fichiers cachés, permissions POSIX, corbeille native et raccourcis Finder. L’enregistrement conserve permissions, ACL et attributs étendus. Corrige le lancement des navigateurs proxy sur macOS. Chrome, Edge et Firefox conservent leurs profils isolés et le proxy SOCKS5."
    ]
  },
  "ru": {
    "eyebrow": "ФАЙЛЫ В РАБОЧЕМ ПРОСТРАНСТВЕ SSH",
    "title": "Ваши файлы по обе стороны SSH.",
    "status": "Выпущено",
    "intro": "Просматривайте, передавайте и редактируйте файлы рядом с туннелями и терминалами.",
    "demoNotice": "Интерактивный просмотр · только примеры файлов и прогресса. Изменения остаются на этой странице; реальные файлы не читаются и не передаются.",
    "currentDownload": "Текущая загрузка",
    "highlights": [
      "Просмотр и передача файлов",
      "Фоновая очередь передач",
      "Просмотр и редактирование текста",
      "Гибкое рабочее пространство",
      "Удобство macOS"
    ],
    "changes": [
      "Просматривайте локальные файлы и файлы SSH-хостов, загружайте и копируйте между хостами. Списки и значки, поиск, сортировка, множественный выбор и перетаскивание.",
      "Следите за прогрессом, скоростью и оставшимся временем. Пауза, продолжение, повтор, отмена и разрешение конфликтов имён. Между хостами — напрямую, при необходимости потоковый ретранслятор на вашем компьютере.",
      "Просмотр кода, изображений, SVG, Markdown, формул и диаграмм. Сохранение текста локально или на SSH-хосте с сохранением кодировки и переводов строк и обнаружением внешних изменений.",
      "Файлы и SSH-терминалы используют общие закрепляемые панели с изменяемым размером. Автоматическая или ручная компоновка трёх панелей, детали пакетов и состояние передач на карте соединений.",
      "Подключённые тома, скрытые файлы, права POSIX, системная Корзина и сочетания Finder. Сохранение текста сохраняет права, ACL и расширенные атрибуты. Исправлен запуск прокси-браузеров на macOS. Chrome, Edge и Firefox по-прежнему используют отдельные профили и SOCKS5-прокси."
    ]
  }
} satisfies Record<Locale,FileUpdateCopy>
