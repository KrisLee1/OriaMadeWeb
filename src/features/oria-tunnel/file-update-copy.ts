// OriaTunnel v0.2.0, published source f8ccbe7701c7b7666ed17eb07d74babbc3866aae. GPL-3.0-only.
import type {Locale} from '@/i18n/config'

type FileUpdateCopy={eyebrow:string;title:string;status:string;intro:string;demoNotice:string;currentDownload:string;highlights:string[];changes:string[]}
export const fileUpdateCopy={
  "en": {
    "eyebrow": "FILES IN YOUR SSH WORKSPACE",
    "title": "File transfers",
    "status": "Available now",
    "intro": "Browse, transfer, preview and edit files alongside your tunnels and terminals.",
    "demoNotice": "Interactive preview · sample files and progress only. Edits stay in this page; no files are read or transferred.",
    "currentDownload": "Current download",
    "highlights": [
      "Browse and transfer",
      "A queue that stays with you",
      "Preview and edit",
      "A flexible workspace",
      "Drag and drop between hosts"
    ],
    "changes": [
      "Browse local and remote folders side by side. Select files to upload, download or transfer between hosts.",
      "Track, pause, resume or cancel transfers. Expand a batch to see its files.",
      "Open a file to preview it. Edit a text file and save it back to its original location.",
      "Choose columns, rows or a split layout. Drag the dividers to resize the file panes and queue.",
      "Drag files or folders between the two panes to upload or download. You can also drop files from your system file manager into the remote pane."
    ]
  },
  "zh-CN": {
    "eyebrow": "SSH 工作区中的文件",
    "title": "文件传输",
    "status": "正式发布",
    "intro": "浏览、传输、预览与编辑文件，与隧道和终端一起工作。",
    "demoNotice": "交互预览 · 仅使用示例文件与进度。编辑只保留在当前页面，不读取或传输真实文件。",
    "currentDownload": "当前可下载版本",
    "highlights": [
      "浏览与传输文件",
      "持续在后台的传输队列",
      "预览与文本编辑",
      "灵活的工作面板",
      "跨主机拖放"
    ],
    "changes": [
      "并排浏览本机与远端目录。选中文件即可上传、下载或传到另一台主机。",
      "在队列中查看进度，暂停、继续或取消传输。展开批次可查看各个文件。",
      "打开文件即可预览。文本文件可直接编辑并保存到原位置。",
      "在布局菜单切换三栏、上下或分区排列。拖动分隔线调整文件区和队列的大小。",
      "把文件或文件夹拖到另一侧目录，即可上传或下载。也可以从访达或文件资源管理器直接拖入远端目录。"
    ]
  },
  "zh-TW": {
    "eyebrow": "SSH 工作區中的檔案",
    "title": "檔案傳輸",
    "status": "正式發行",
    "intro": "瀏覽、傳輸、預覽與編輯檔案，與通道和終端機一起工作。",
    "demoNotice": "互動預覽 · 僅使用範例檔案與進度。編輯只保留於目前頁面，不讀取或傳輸真實檔案。",
    "currentDownload": "目前可下載版本",
    "highlights": [
      "瀏覽與傳輸檔案",
      "背景傳輸佇列",
      "預覽與文字編輯",
      "彈性的工作面板",
      "跨主機拖放"
    ],
    "changes": [
      "並排瀏覽本機與遠端目錄。選取檔案即可上傳、下載或傳到另一台主機。",
      "在佇列查看進度，暫停、繼續或取消傳輸。展開批次可查看個別檔案。",
      "開啟檔案即可預覽，文字檔可直接編輯並儲存至原位置。",
      "從版面選單切換三欄、上下或分區排列，拖曳分隔線即可調整檔案區與佇列大小。",
      "將檔案或資料夾拖到另一側目錄即可上傳或下載。也可從 Finder 或檔案總管直接拖入遠端目錄。"
    ]
  },
  "ja": {
    "eyebrow": "SSH ワークスペースのファイル",
    "title": "ファイル転送",
    "status": "リリース済み",
    "intro": "トンネルやターミナルと並べて、ファイルの閲覧、転送、プレビュー、編集。",
    "demoNotice": "操作できるプレビュー · サンプルファイルと進捗のみ。編集はこのページ内に留まり、実際のファイルの読み取りや転送は行いません。",
    "currentDownload": "現在のダウンロード",
    "highlights": [
      "ファイルの閲覧と転送",
      "バックグラウンド転送キュー",
      "プレビューとテキスト編集",
      "柔軟なワークパネル",
      "ドラッグでホスト間転送"
    ],
    "changes": [
      "ローカルとリモートのフォルダを並べて表示。ファイルを選んでアップロード、ダウンロード、ホスト間転送ができます。",
      "進捗の確認、一時停止、再開、キャンセルができます。バッチを開くと個別のファイルを確認できます。",
      "ファイルを開いてプレビューし、テキストはその場で編集して元の場所に保存できます。",
      "列・行・分割表示を選び、境界をドラッグしてファイル領域とキューの大きさを調整します。",
      "ファイルやフォルダを反対側のディレクトリへドラッグして転送します。Finder やエクスプローラーからリモート側へ直接ドロップすることもできます。"
    ]
  },
  "ko": {
    "eyebrow": "SSH 작업 공간의 파일",
    "title": "파일 전송",
    "status": "정식 출시",
    "intro": "터널과 터미널 옆에서 파일 탐색, 전송, 미리보기와 편집까지.",
    "demoNotice": "대화형 미리보기 · 예제 파일과 진행률만 사용합니다. 편집은 현재 페이지에만 유지되며 실제 파일을 읽거나 전송하지 않습니다.",
    "currentDownload": "현재 다운로드 버전",
    "highlights": [
      "파일 탐색과 전송",
      "백그라운드 전송 대기열",
      "미리보기와 텍스트 편집",
      "유연한 작업 패널",
      "호스트 간 드래그 전송"
    ],
    "changes": [
      "로컬과 원격 폴더를 나란히 보고 파일을 선택해 업로드하거나 다운로드하세요. 호스트 간 전송도 가능합니다.",
      "진행 상황을 확인하고 전송을 일시 정지하거나 재개 또는 취소하세요. 묶음을 펼치면 개별 파일이 보입니다.",
      "파일을 열어 미리 보세요. 텍스트 파일은 바로 편집해 원래 위치에 저장할 수 있습니다.",
      "열, 행 또는 분할 보기를 선택하세요. 구분선을 드래그해 파일 영역과 대기열 크기를 바꿀 수 있습니다.",
      "파일이나 폴더를 반대쪽 디렉터리로 끌어 업로드하거나 다운로드하세요. Finder나 파일 탐색기에서 원격 폴더로 바로 끌어다 놓을 수도 있습니다."
    ]
  },
  "de": {
    "eyebrow": "DATEIEN IM SSH-ARBEITSBEREICH",
    "title": "Dateiübertragung",
    "status": "Veröffentlicht",
    "intro": "Dateien neben Tunneln und Terminals durchsuchen, übertragen, ansehen und bearbeiten.",
    "demoNotice": "Interaktive Vorschau · nur Beispieldateien und Fortschrittswerte. Änderungen bleiben auf dieser Seite; echte Dateien werden weder gelesen noch übertragen.",
    "currentDownload": "Aktueller Download",
    "highlights": [
      "Dateien durchsuchen und übertragen",
      "Übertragungen im Hintergrund",
      "Vorschau und Textbearbeitung",
      "Flexible Arbeitsbereiche",
      "Per Drag-and-drop übertragen"
    ],
    "changes": [
      "Lokale und entfernte Ordner nebeneinander durchsuchen und Dateien zum Übertragen auswählen.",
      "Übertragungen verfolgen, pausieren, fortsetzen oder abbrechen. Ein Paket aufklappen, um seine Dateien zu sehen.",
      "Dateien zur Vorschau öffnen. Textdateien direkt bearbeiten und am ursprünglichen Ort speichern.",
      "Spalten, Zeilen oder geteilte Ansicht wählen. Trennlinien ziehen, um Dateibereiche und Warteschlange anzupassen.",
      "Ziehe Dateien oder Ordner zum Hoch- oder Herunterladen in den anderen Bereich. Dateien aus dem Dateimanager kannst du direkt im entfernten Ordner ablegen."
    ]
  },
  "fr": {
    "eyebrow": "LES FICHIERS DANS VOTRE ESPACE SSH",
    "title": "Transfert de fichiers",
    "status": "Disponible",
    "intro": "Parcourez, transférez, prévisualisez et modifiez les fichiers à côté des tunnels et terminaux.",
    "demoNotice": "Aperçu interactif · fichiers et progression fictifs. Les modifications restent dans cette page ; aucun fichier réel n’est lu ou transféré.",
    "currentDownload": "Téléchargement actuel",
    "highlights": [
      "Parcourir et transférer",
      "Une file en arrière-plan",
      "Aperçu et édition de texte",
      "Un espace flexible",
      "Glisser-déposer entre hôtes"
    ],
    "changes": [
      "Parcourez les dossiers locaux et distants côte à côte. Sélectionnez les fichiers à envoyer, télécharger ou transférer entre hôtes.",
      "Suivez, suspendez, reprenez ou annulez un transfert. Dépliez un lot pour voir ses fichiers.",
      "Ouvrez un fichier pour le prévisualiser. Modifiez les fichiers texte et enregistrez-les à leur emplacement initial.",
      "Choisissez les colonnes, les lignes ou la vue divisée. Faites glisser les séparateurs pour redimensionner les volets et la file.",
      "Faites glisser un fichier ou un dossier vers l’autre volet pour le transférer. Vous pouvez aussi déposer des fichiers du Finder ou de l’Explorateur dans le volet distant."
    ]
  },
  "ru": {
    "eyebrow": "ФАЙЛЫ В РАБОЧЕМ ПРОСТРАНСТВЕ SSH",
    "title": "Передача файлов",
    "status": "Выпущено",
    "intro": "Просматривайте, передавайте и редактируйте файлы рядом с туннелями и терминалами.",
    "demoNotice": "Интерактивный просмотр · только примеры файлов и прогресса. Изменения остаются на этой странице; реальные файлы не читаются и не передаются.",
    "currentDownload": "Текущая загрузка",
    "highlights": [
      "Просмотр и передача файлов",
      "Фоновая очередь передач",
      "Просмотр и редактирование текста",
      "Гибкое рабочее пространство",
      "Передача перетаскиванием"
    ],
    "changes": [
      "Просматривайте локальные и удалённые папки рядом. Выберите файлы для загрузки, скачивания или передачи между узлами.",
      "Следите за ходом передач, приостанавливайте, возобновляйте или отменяйте их. Раскройте пакет, чтобы увидеть файлы.",
      "Откройте файл для просмотра. Текстовые файлы можно редактировать и сохранять на прежнее место.",
      "Выберите столбцы, строки или разделённый вид. Перетаскивайте разделители для изменения размеров панелей и очереди.",
      "Перетащите файлы или папки в соседнюю панель для отправки или скачивания. Можно также перетащить файлы из системного файлового менеджера в удалённую папку."
    ]
  }
} satisfies Record<Locale,FileUpdateCopy>
