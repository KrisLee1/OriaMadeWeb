// Product behavior from OriaTunnel 7c24929, docs/USAGE.md (GPL-3.0-only).
import type {Locale} from '@/i18n/config'

export const terminalVersion = 'v0.4.0'
export const terminalUpdateCopy = {
  'zh-CN': {
    status: '正式版', title: '智能终端',
    shells: '支持 Bash 和 Zsh，Windows 本地终端默认使用 PowerShell。',
    intro: '从主目录打开本地 shell，或连接已保存的 SSH 主机。在同一面板中切换最多八个独立会话。',
    features: [
      {title: '命令补全', description: '按 → 接受行尾建议，Tab 查看补全候选，↑ 调出命令历史。'},
      {title: '目录切换', description: '点击路径返回上级目录，或点击当前目录选择子目录。切换时保留草稿。'},
      {title: '命令库', description: '输入命令后按 ↓ 添加关键词并保存。输入关键词即可找回命令。'},
      {title: '多行输入', description: 'Shift + Enter 换行，点击任意位置继续编辑，Enter 执行整段命令。'},
      {title: '折叠长命令和输出', description: '点击路径旁的箭头折叠或展开命令块。较早的长输出会收为可滚动预览。'},
      {title: '复制内容', description: '从命令旁的「…」复制命令、输出或两者。「复制全部」会保留提示符。'},
    ],
    sample: '示例数据。可试用 ls、pwd 和 cd。输入 files 可调出 ls -1；输入命令后按 ↓ 可添加关键词并保存。'
  },
  'zh-TW': {
    status: '正式版', title: '智慧終端機',
    shells: '支援 Bash 和 Zsh，Windows 本機終端機預設使用 PowerShell。',
    intro: '從個人目錄開啟本機 shell，或連線至已儲存的 SSH 主機。在同一面板中切換最多八個獨立工作階段。',
    features: [
      {title: '指令補全', description: '按 → 接受行尾建議，Tab 查看補完候選，↑ 開啟指令記錄。'},
      {title: '切換目錄', description: '按路徑可回到上層，按目前資料夾可選擇子目錄。切換時保留草稿。'},
      {title: '指令庫', description: '輸入指令後按 ↓ 加入關鍵字並儲存。輸入關鍵字即可找回指令。'},
      {title: '多行輸入', description: 'Shift + Enter 換行，點選任意位置繼續編輯，Enter 執行整段指令。'},
      {title: '摺疊長指令與輸出', description: '按路徑旁的箭頭收合或展開指令區塊。較早的長輸出會收為可捲動的預覽。'},
      {title: '複製內容', description: '從指令旁的「…」複製指令、輸出或兩者。「全部複製」會保留提示字元。'},
    ],
    sample: '範例資料。可試用 ls、pwd 和 cd。輸入 files 可叫出 ls -1，輸入指令後按 ↓ 可加入關鍵字並儲存。'
  },
  en: {
    status: 'Stable release', title: 'Smart terminal',
    shells: 'Bash and Zsh are supported. The local terminal uses PowerShell by default on Windows.',
    intro: 'Open a local shell in your home directory or connect to a saved SSH host. Switch between up to eight independent sessions in one panel.',
    features: [
      {title: 'Command completion', description: 'Press → to accept a suggestion, Tab to list completions, or ↑ to browse history.'},
      {title: 'Directory navigation', description: 'Click a parent in the path to go back, or the current folder to choose a child. Your draft stays in place.'},
      {title: 'Command library', description: 'Press ↓ to save a command with keywords. Type a keyword to recall it.'},
      {title: 'Multiline input', description: 'Use Shift + Enter for a new line. Click anywhere to edit and press Enter to run the whole command.'},
      {title: 'Fold long commands and output', description: 'Click the arrow beside a path to fold or expand its command. Older long outputs become scrollable previews.'},
      {title: 'Copy command and output', description: 'Use the … menu to copy the command, the output, or both. Copy all includes the prompt.'},
    ],
    sample: 'Sample data. Try ls, pwd or cd. Type files to recall ls -1, or press ↓ after typing a command to save it.'
  },
  de: {
    status: 'Stabile Version', title: 'Intelligentes Terminal',
    shells: 'Bash und Zsh werden unterstützt. Unter Windows startet das lokale Terminal standardmäßig mit PowerShell.',
    intro: 'Öffnen Sie eine lokale Shell im Home-Verzeichnis oder verbinden Sie sich mit einem gespeicherten SSH-Host. Wechseln Sie in einem Panel zwischen bis zu acht unabhängigen Sitzungen.',
    features: [
      {title: 'Befehlsvervollständigung', description: 'Mit → einen Vorschlag übernehmen, mit Tab die Vorschlagsliste und mit ↑ den Verlauf öffnen.'},
      {title: 'Verzeichniswechsel', description: 'Im Pfad einen übergeordneten Ordner wählen oder im aktuellen Ordner einen Unterordner öffnen. Die Eingabe bleibt erhalten.'},
      {title: 'Befehlsbibliothek', description: 'Mit ↓ einen Befehl mit Stichwörtern speichern. Ein Stichwort eingeben, um ihn abzurufen.'},
      {title: 'Mehrzeilige Eingabe', description: 'Mit Umschalt + Enter eine neue Zeile einfügen. Zum Bearbeiten in den Text klicken, mit Enter alles ausführen.'},
      {title: 'Lange Befehle und Ausgaben einklappen', description: 'Der Pfeil am Pfad klappt den Befehl ein oder aus. Lange frühere Ausgaben bleiben in einer scrollbaren Vorschau lesbar.'},
      {title: 'Befehl und Ausgabe kopieren', description: 'Im Menü … Befehl, Ausgabe oder beides kopieren. Beim Kopieren des gesamten Blocks bleibt der Prompt erhalten.'},
    ],
    sample: 'Beispieldaten. Probieren Sie ls, pwd oder cd aus. Geben Sie files ein, um ls -1 abzurufen. Mit ↓ speichern Sie einen eingegebenen Befehl.'
  },
  fr: {
    status: 'Version stable', title: 'Terminal intelligent',
    shells: 'Bash et Zsh sont pris en charge. Sous Windows, le terminal local ouvre PowerShell par défaut.',
    intro: 'Ouvrez un shell local dans votre dossier personnel ou connectez-vous à un hôte SSH enregistré. Un même panneau accueille jusqu’à huit sessions indépendantes.',
    features: [
      {title: 'Complétion des commandes', description: 'Appuyez sur → pour accepter une suggestion, Tab pour voir les propositions, ↑ pour parcourir l’historique.'},
      {title: 'Navigation par dossier', description: 'Cliquez sur un dossier parent pour remonter ou sur le dossier courant pour choisir un sous-dossier. Votre saisie est conservée.'},
      {title: 'Bibliothèque de commandes', description: 'Appuyez sur ↓ pour enregistrer une commande avec des mots-clés. Saisissez un mot-clé pour la retrouver.'},
      {title: 'Saisie multiligne', description: 'Maj + Entrée ajoute une ligne. Cliquez dans le texte pour le modifier, puis appuyez sur Entrée pour tout exécuter.'},
      {title: 'Replier les commandes et les sorties longues', description: 'La flèche près du chemin replie ou déplie la commande. Les longues sorties précédentes restent consultables dans un aperçu défilant.'},
      {title: 'Copier la commande et la sortie', description: 'Dans le menu …, copiez la commande, la sortie ou les deux. La copie complète inclut l’invite.'},
    ],
    sample: 'Données de démonstration. Essayez ls, pwd ou cd. Saisissez files pour retrouver ls -1, ou appuyez sur ↓ après une commande pour l’enregistrer.'
  },
  ja: {
    status: '正式版', title: 'スマートターミナル',
    shells: 'Bash と Zsh に対応し、Windows のローカルターミナルでは既定で PowerShell を使用します。',
    intro: 'ホームディレクトリでローカルシェルを開いたり、登録済みの SSH ホストに接続したりできます。1 つのパネルで最大 8 つの独立したセッションを切り替えられます。',
    features: [
      {title: 'コマンド補完', description: '→ で候補を確定し、Tab で補完候補、↑ で履歴を開きます。'},
      {title: 'ディレクトリ移動', description: 'パスの親フォルダをクリックして戻るか、現在のフォルダをクリックして子フォルダを選びます。入力中の内容は保持されます。'},
      {title: 'コマンドライブラリ', description: '入力後に ↓ を押してキーワード付きで保存。キーワードを入力するとコマンドを呼び出せます。'},
      {title: '複数行の入力', description: 'Shift + Enter で改行します。クリックした位置で編集し、Enter でまとめて実行できます。'},
      {title: '長いコマンドと出力の折りたたみ', description: 'パス横の矢印でコマンドを折りたたんだり展開したりできます。過去の長い出力はスクロールして確認できます。'},
      {title: 'コマンドと出力のコピー', description: '… メニューからコマンド、出力、または両方をコピーします。すべてコピーするとプロンプトも含まれます。'},
    ],
    sample: 'サンプルデータで ls、pwd、cd を試せます。files と入力すると ls -1 が候補に表示されます。コマンドの入力後に ↓ を押すと保存できます。'
  },
  ko: {
    status: '정식 버전', title: '스마트 터미널',
    shells: 'Bash와 Zsh를 지원하며 Windows 로컬 터미널에서는 기본적으로 PowerShell을 사용합니다.',
    intro: '홈 디렉터리에서 로컬 셸을 열거나 저장된 SSH 호스트에 연결하세요. 한 패널에서 최대 8개의 독립 세션을 전환할 수 있습니다.',
    features: [
      {title: '명령 자동 완성', description: '→로 제안을 적용하고 Tab으로 완성 후보를, ↑로 명령 기록을 엽니다.'},
      {title: '디렉터리 이동', description: '경로에서 상위 폴더를 클릭해 돌아가거나 현재 폴더를 클릭해 하위 폴더를 선택하세요. 입력 중인 내용은 유지됩니다.'},
      {title: '명령 라이브러리', description: '명령을 입력한 뒤 ↓를 눌러 키워드와 함께 저장하세요. 키워드로 명령을 다시 불러올 수 있습니다.'},
      {title: '여러 줄 입력', description: 'Shift + Enter로 줄을 바꿉니다. 원하는 곳을 클릭해 편집하고 Enter로 전체 명령을 실행하세요.'},
      {title: '긴 명령과 출력 접기', description: '경로 옆 화살표로 명령을 접거나 펼칩니다. 이전의 긴 출력은 스크롤 가능한 미리보기로 표시됩니다.'},
      {title: '명령과 출력 복사', description: '… 메뉴에서 명령, 출력 또는 둘 다 복사합니다. 모두 복사하면 프롬프트도 포함됩니다.'},
    ],
    sample: '예시 데이터로 ls, pwd, cd를 사용해 보세요. files를 입력하면 ls -1이 후보로 표시됩니다. 명령을 입력한 뒤 ↓를 누르면 저장할 수 있습니다.'
  },
  ru: {
    status: 'Стабильный выпуск', title: 'Умный терминал',
    shells: 'Поддерживаются Bash и Zsh. В Windows локальный терминал по умолчанию открывает PowerShell.',
    intro: 'Откройте локальную оболочку в домашнем каталоге или подключитесь к сохранённому SSH-хосту. В одной панели можно переключаться между восемью независимыми сеансами.',
    features: [
      {title: 'Дополнение команд', description: 'Нажмите →, чтобы принять подсказку, Tab для списка вариантов, ↑ для истории команд.'},
      {title: 'Переход между каталогами', description: 'Щёлкните родительский каталог в пути или выберите вложенный каталог в текущей папке. Черновик сохранится.'},
      {title: 'Библиотека команд', description: 'Нажмите ↓, чтобы сохранить команду с ключевыми словами. Введите ключевое слово для поиска команды.'},
      {title: 'Многострочный ввод', description: 'Shift + Enter добавляет строку. Щёлкните в тексте для редактирования и нажмите Enter для выполнения всей команды.'},
      {title: 'Сворачивание длинных команд и вывода', description: 'Стрелка рядом с путём сворачивает и раскрывает команду. Длинный вывод предыдущих команд можно прокручивать.'},
      {title: 'Копирование команды и вывода', description: 'В меню … скопируйте команду, вывод или оба сразу. Полная копия включает приглашение оболочки.'},
    ],
    sample: 'Данные для примера. Попробуйте ls, pwd или cd. Введите files, чтобы найти ls -1, или нажмите ↓ после ввода команды, чтобы сохранить её.'
  }
} satisfies Record<Locale, {status: string; title: string; intro: string; features: {title: string; description: string}[]; shells: string; sample: string}>
