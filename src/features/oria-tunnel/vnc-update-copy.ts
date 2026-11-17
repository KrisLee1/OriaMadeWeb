// Adapted from the v0.3.0 READMEs, USAGE and viewer UI translations, d42168586b83817f763c9ad165b36194da883117 (GPL-3.0-only).
import type {Locale} from '@/i18n/config'

export const vncVersion = 'v0.3.0'
export const vncUpdateCopy = {
  "en": {
    "status": "Available now",
    "title": "VNC remote desktop",
    "intro": "Start a local SSH forward to your VNC server, then open the listening rule in the built-in viewer. Use your keyboard and mouse, zoom in or go full screen. You can also open a reachable vnc:// address directly. Mac Screen Sharing supports connections with a VNC password.",
    "details": [
      {
        "title": "Remote desktop",
        "description": "Zoom or fit the remote desktop to the window. Open full screen for more room."
      },
      {
        "title": "Two-way text clipboard",
        "description": "Copy and paste text between desktops with Ctrl+C and Ctrl+V, or ⌘C and ⌘V on macOS."
      },
      {
        "title": "SFTP",
        "description": "Upload and download files over SFTP from the viewer. Submitted transfers continue when the window closes."
      },
      {
        "title": "SSH",
        "description": "Open an SSH session on the right while keeping the remote desktop in view."
      }
    ],
    "demo": {
      "desktop": "Remote desktop",
      "fullscreen": "Full screen",
      "fit": "Fit to window",
      "renderMode": "Display mode",
      "qualityMode": "Quality mode",
      "smoothMode": "Smooth mode",
      "hideLocalCursor": "Hide local cursor",
      "openVnc": "Open VNC",
      "sendCtrlAltDel": "Send <keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys>",
      "close": "Close window",
      "minimize": "Minimize",
      "restore": "Restore"
    }
  },
  "zh-CN": {
    "status": "正式发布",
    "title": "VNC 远程桌面",
    "intro": "启动通往 VNC 服务的 SSH 本地转发。规则进入监听后，点「打开服务」即可用键盘和鼠标操作远端桌面，支持缩放和全屏。也可以直接打开本机可达的 vnc:// 地址。连接 Mac 屏幕共享时，可使用经典 VNC 密码。",
    "details": [
      {
        "title": "远程桌面",
        "description": "缩放远端画面，或让桌面适应窗口。需要更多空间时可以切换全屏。"
      },
      {
        "title": "双向文本剪贴板",
        "description": "在本机和远端之间用 Ctrl+C、Ctrl+V 复制粘贴文本。macOS 使用 ⌘C、⌘V。"
      },
      {
        "title": "SFTP",
        "description": "从查看器打开 SFTP 面板，上传或下载文件。关闭 VNC 窗口后，已提交的传输仍会继续。"
      },
      {
        "title": "SSH",
        "description": "在 VNC 窗口右侧打开 SSH 终端，查看远端桌面的同时运行命令。"
      }
    ],
    "demo": {
      "desktop": "远程桌面",
      "fullscreen": "全屏",
      "fit": "适应窗口",
      "renderMode": "显示模式",
      "qualityMode": "画质模式",
      "smoothMode": "流畅模式",
      "hideLocalCursor": "隐藏本机光标",
      "openVnc": "打开 VNC",
      "sendCtrlAltDel": "发送 <keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys>",
      "close": "关闭窗口",
      "minimize": "最小化",
      "restore": "还原"
    }
  },
  "zh-TW": {
    "status": "正式發行",
    "title": "VNC 遠端桌面",
    "intro": "啟動連往 VNC 服務的 SSH 本機轉送。規則開始監聽後，點選「開啟服務」即可用鍵盤和滑鼠操作遠端桌面，並縮放或切換全螢幕。也可以直接開啟本機可連線的 vnc:// 位址。連線至 Mac 螢幕共享時，可使用傳統 VNC 密碼。",
    "details": [
      {
        "title": "遠端桌面",
        "description": "縮放遠端畫面，或讓桌面符合視窗大小。也可以切換全螢幕。"
      },
      {
        "title": "雙向文字剪貼簿",
        "description": "用 Ctrl+C、Ctrl+V 在本機與遠端間複製貼上文字。macOS 使用 ⌘C、⌘V。"
      },
      {
        "title": "SFTP",
        "description": "從檢視器開啟 SFTP 面板，上傳或下載檔案。關閉 VNC 視窗後，已提交的傳輸會繼續執行。"
      },
      {
        "title": "SSH",
        "description": "在 VNC 視窗右側開啟 SSH 終端機，同時查看遠端桌面及執行指令。"
      }
    ],
    "demo": {
      "desktop": "遠端桌面",
      "fullscreen": "全螢幕",
      "fit": "適應視窗",
      "renderMode": "顯示模式",
      "qualityMode": "畫質模式",
      "smoothMode": "流暢模式",
      "hideLocalCursor": "隱藏本機游標",
      "openVnc": "開啟 VNC",
      "sendCtrlAltDel": "傳送 <keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys>",
      "close": "關閉視窗",
      "minimize": "最小化",
      "restore": "還原"
    }
  },
  "ja": {
    "status": "リリース済み",
    "title": "VNC リモートデスクトップ",
    "intro": "VNC サーバーへの SSH ローカル転送を開始し、待ち受け中のルールから内蔵ビューアを開きます。キーボードとマウスで操作でき、ズームや全画面表示も利用できます。手元から到達可能な vnc:// アドレスも直接開けます。Mac の画面共有には VNC パスワードで接続できます。",
    "details": [
      {
        "title": "リモートデスクトップ",
        "description": "リモート画面を拡大・縮小したり、ウィンドウに合わせたり、全画面で表示したりできます。"
      },
      {
        "title": "双方向クリップボード",
        "description": "Ctrl+C、Ctrl+V でローカルとリモート間のテキストをコピー・貼り付けできます。macOS では ⌘C、⌘V を使います。"
      },
      {
        "title": "SFTP",
        "description": "VNC ウィンドウから SFTP でファイルを転送できます。開始した転送はウィンドウを閉じても続きます。"
      },
      {
        "title": "SSH",
        "description": "右側に SSH ターミナルを開き、リモート画面を見ながらコマンドを実行できます。"
      }
    ],
    "demo": {
      "desktop": "リモートデスクトップ",
      "fullscreen": "全画面表示",
      "fit": "ウィンドウに合わせる",
      "renderMode": "表示モード",
      "qualityMode": "画質優先",
      "smoothMode": "滑らかさ優先",
      "hideLocalCursor": "ローカルカーソルを隠す",
      "openVnc": "VNC を開く",
      "sendCtrlAltDel": "<keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys> を送信",
      "close": "ウィンドウを閉じる",
      "minimize": "最小化",
      "restore": "元に戻す"
    }
  },
  "ko": {
    "status": "정식 출시",
    "title": "VNC 원격 데스크톱",
    "intro": "VNC 서버로 연결되는 SSH 로컬 포워딩을 시작하고 수신 대기 중인 규칙에서 내장 뷰어를 여세요. 키보드와 마우스로 조작하고 화면을 확대하거나 전체 화면으로 볼 수 있습니다. 이 컴퓨터에서 접근할 수 있는 vnc:// 주소도 직접 열 수 있습니다. VNC 암호로 Mac 화면 공유에 연결할 수 있습니다.",
    "details": [
      {
        "title": "원격 데스크톱",
        "description": "원격 화면을 확대하거나 창 크기에 맞추고 전체 화면으로 전환할 수 있습니다."
      },
      {
        "title": "양방향 텍스트 클립보드",
        "description": "Ctrl+C와 Ctrl+V로 로컬과 원격 간에 텍스트를 복사하고 붙여 넣으세요. macOS에서는 ⌘C와 ⌘V를 사용합니다."
      },
      {
        "title": "SFTP",
        "description": "VNC 창에서 SFTP로 파일을 주고받으세요. 시작한 전송은 창을 닫아도 계속됩니다."
      },
      {
        "title": "SSH",
        "description": "오른쪽에 SSH 터미널을 열어 원격 화면을 보면서 명령을 실행하세요."
      }
    ],
    "demo": {
      "desktop": "원격 데스크톱",
      "fullscreen": "전체 화면",
      "fit": "창에 맞춤",
      "renderMode": "표시 모드",
      "qualityMode": "화질 우선",
      "smoothMode": "부드러움 우선",
      "hideLocalCursor": "로컬 커서 숨기기",
      "openVnc": "VNC 열기",
      "sendCtrlAltDel": "<keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys> 보내기",
      "close": "창 닫기",
      "minimize": "최소화",
      "restore": "복원"
    }
  },
  "de": {
    "status": "Veröffentlicht",
    "title": "VNC-Remotedesktop",
    "intro": "Starten Sie eine lokale SSH-Weiterleitung zum VNC-Server und öffnen Sie den integrierten Viewer über die lauschende Regel. Nutzen Sie Tastatur und Maus, Zoom und Vollbild. Lokal erreichbare vnc://-Adressen lassen sich auch direkt öffnen. Die Mac-Bildschirmfreigabe lässt sich mit einem VNC-Passwort öffnen.",
    "details": [
      {
        "title": "Remotedesktop",
        "description": "Den entfernten Desktop zoomen, ans Fenster anpassen oder im Vollbild anzeigen."
      },
      {
        "title": "Text in der Zwischenablage",
        "description": "Text mit Strg+C und Strg+V zwischen den Desktops übertragen, unter macOS mit ⌘C und ⌘V."
      },
      {
        "title": "SFTP",
        "description": "Dateien im Viewer per SFTP übertragen. Gestartete Übertragungen laufen nach dem Schließen des Fensters weiter."
      },
      {
        "title": "SSH",
        "description": "Das SSH-Terminal rechts öffnen und den entfernten Desktop im Blick behalten."
      }
    ],
    "demo": {
      "desktop": "Remotedesktop",
      "fullscreen": "Vollbild",
      "fit": "An Fenster anpassen",
      "renderMode": "Anzeigemodus",
      "qualityMode": "Qualitätsmodus",
      "smoothMode": "Flüssige Darstellung",
      "hideLocalCursor": "Lokalen Mauszeiger ausblenden",
      "openVnc": "VNC öffnen",
      "sendCtrlAltDel": "<keys><cap>Strg</cap>+<cap>Alt</cap>+<cap>Entf</cap></keys> senden",
      "close": "Fenster schließen",
      "minimize": "Minimieren",
      "restore": "Wiederherstellen"
    }
  },
  "fr": {
    "status": "Disponible",
    "title": "Bureau distant VNC",
    "intro": "Démarrez une redirection SSH locale vers le serveur VNC, puis ouvrez le client intégré depuis la règle en écoute. Pilotez le bureau au clavier et à la souris, zoomez ou passez en plein écran. Vous pouvez aussi ouvrir directement une adresse vnc:// accessible depuis votre ordinateur. Le partage d’écran du Mac est accessible avec un mot de passe VNC.",
    "details": [
      {
        "title": "Bureau distant",
        "description": "Zoomez sur le bureau distant, ajustez-le à la fenêtre ou passez en plein écran."
      },
      {
        "title": "Presse-papiers bidirectionnel",
        "description": "Copiez et collez du texte entre les bureaux avec Ctrl+C et Ctrl+V, ou ⌘C et ⌘V sur macOS."
      },
      {
        "title": "SFTP",
        "description": "Transférez des fichiers par SFTP dans la fenêtre VNC. Les transferts lancés continuent après sa fermeture."
      },
      {
        "title": "SSH",
        "description": "Ouvrez le terminal SSH à droite pour saisir des commandes tout en gardant le bureau à l’écran."
      }
    ],
    "demo": {
      "desktop": "Bureau distant",
      "fullscreen": "Plein écran",
      "fit": "Adapter à la fenêtre",
      "renderMode": "Mode d’affichage",
      "qualityMode": "Priorité à la qualité",
      "smoothMode": "Priorité à la fluidité",
      "hideLocalCursor": "Masquer le pointeur local",
      "openVnc": "Ouvrir VNC",
      "sendCtrlAltDel": "Envoyer <keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Suppr</cap></keys>",
      "close": "Fermer la fenêtre",
      "minimize": "Réduire",
      "restore": "Restaurer"
    }
  },
  "ru": {
    "status": "Выпущено",
    "title": "Удалённый рабочий стол VNC",
    "intro": "Запустите локальный проброс SSH к серверу VNC и откройте встроенный клиент из активного правила. Управляйте рабочим столом с помощью мыши и клавиатуры, меняйте масштаб или перейдите в полноэкранный режим. Доступный с вашего компьютера адрес vnc:// можно открыть напрямую. К общему экрану Mac можно подключиться с паролем VNC.",
    "details": [
      {
        "title": "Удалённый рабочий стол",
        "description": "Меняйте масштаб удалённого рабочего стола, подгоняйте его под размер окна или включайте полноэкранный режим."
      },
      {
        "title": "Двусторонний буфер обмена",
        "description": "Копируйте и вставляйте текст между рабочими столами через Ctrl+C и Ctrl+V, в macOS — через ⌘C и ⌘V."
      },
      {
        "title": "SFTP",
        "description": "Передавайте файлы по SFTP из окна VNC. Начатые передачи продолжатся после закрытия окна."
      },
      {
        "title": "SSH",
        "description": "Откройте терминал SSH справа и выполняйте команды, не теряя из виду удалённый рабочий стол."
      }
    ],
    "demo": {
      "desktop": "Удалённый рабочий стол",
      "fullscreen": "Полный экран",
      "fit": "По размеру окна",
      "renderMode": "Режим отображения",
      "qualityMode": "Приоритет качества",
      "smoothMode": "Приоритет плавности",
      "hideLocalCursor": "Скрывать локальный курсор",
      "openVnc": "Открыть VNC",
      "sendCtrlAltDel": "Отправить <keys><cap>Ctrl</cap>+<cap>Alt</cap>+<cap>Del</cap></keys>",
      "close": "Закрыть окно",
      "minimize": "Свернуть",
      "restore": "Восстановить"
    }
  }
} satisfies Record<Locale, {
  status: string
  title: string
  intro: string
  details: {title: string; description: string}[]
  demo: {
    desktop: string; fullscreen: string; fit: string; renderMode: string
    qualityMode: string; smoothMode: string; hideLocalCursor: string; openVnc: string
    sendCtrlAltDel: string; close: string; minimize: string; restore: string
  }
}>
