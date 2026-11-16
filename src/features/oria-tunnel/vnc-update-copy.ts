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
        "title": "Two-way text clipboard",
        "description": "Paste local text into the remote desktop or bring text copied on the remote computer back to yours."
      },
      {
        "title": "Terminal and file transfers",
        "description": "Open an SSH terminal and upload or download files over SFTP in the same VNC window. Transfers already submitted continue after you close the window."
      }
    ],
    "demo": {
      "caption": "Scroll through this sample session to see file transfers and then the SSH terminal. You can also open either panel from the toolbar.",
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
        "title": "双向文本剪贴板",
        "description": "把本机文本粘贴到远端桌面，也能将远端复制的文本带回本机。"
      },
      {
        "title": "桌面内的终端与文件传输",
        "description": "在同一个 VNC 窗口打开 SSH 终端、用 SFTP 上传或下载文件。关闭桌面窗口后，已提交的传输继续运行。"
      }
    ],
    "demo": {
      "caption": "向下滚动，依次查看示例会话的文件传输和 SSH 终端。也可以从顶栏手动打开面板。",
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
        "title": "雙向文字剪貼簿",
        "description": "可將本機文字貼到遠端桌面，也可取回遠端複製的文字。"
      },
      {
        "title": "視窗內的終端機與檔案傳輸",
        "description": "在同一個 VNC 視窗開啟 SSH 終端機，以 SFTP 上傳或下載檔案。關閉桌面視窗後，已提交的傳輸會繼續執行。"
      }
    ],
    "demo": {
      "caption": "向下捲動，依序查看範例工作階段的檔案傳輸和 SSH 終端機。也可以從頂端工具列手動開啟面板。",
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
        "title": "双方向クリップボード",
        "description": "手元のテキストをリモートに貼り付けたり、リモートでコピーしたテキストを手元に戻したりできます。"
      },
      {
        "title": "端末とファイル転送",
        "description": "VNC ウィンドウ内で SSH 端末や SFTP によるアップロードとダウンロードを利用できます。開始した転送はウィンドウを閉じても続きます。"
      }
    ],
    "demo": {
      "caption": "サンプルを下にスクロールすると、ファイル転送と SSH 端末が順に開きます。ツールバーからも各パネルを開けます。",
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
        "title": "양방향 텍스트 클립보드",
        "description": "로컬 텍스트를 원격 데스크톱에 붙여넣거나 원격에서 복사한 텍스트를 가져올 수 있습니다."
      },
      {
        "title": "터미널과 파일 전송",
        "description": "같은 VNC 창에서 SSH 터미널을 열고 SFTP로 파일을 주고받을 수 있습니다. 창을 닫아도 이미 요청한 전송은 계속됩니다."
      }
    ],
    "demo": {
      "caption": "아래로 스크롤하면 예시 세션의 파일 전송 패널과 SSH 터미널이 차례로 열립니다. 도구 모음에서도 각 패널을 열 수 있습니다.",
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
        "title": "Text in der Zwischenablage",
        "description": "Fügen Sie lokalen Text auf dem entfernten Desktop ein oder übernehmen Sie dort kopierten Text auf Ihren Rechner."
      },
      {
        "title": "Terminal und Dateiübertragung",
        "description": "Öffnen Sie ein SSH-Terminal und übertragen Sie Dateien per SFTP im selben VNC-Fenster. Bereits beauftragte Übertragungen laufen nach dem Schließen des Fensters weiter."
      }
    ],
    "demo": {
      "caption": "Scrollen Sie in der Beispielsitzung nach unten, um zuerst die Dateiübertragung und dann das SSH-Terminal zu sehen. Beide lassen sich auch über die Symbolleiste öffnen.",
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
        "title": "Presse-papiers bidirectionnel",
        "description": "Collez du texte local sur le bureau distant ou récupérez le texte copié sur l’ordinateur distant."
      },
      {
        "title": "Terminal et transfert de fichiers",
        "description": "Ouvrez un terminal SSH et envoyez ou téléchargez des fichiers par SFTP dans la même fenêtre VNC. Les transferts déjà lancés continuent après sa fermeture."
      }
    ],
    "demo": {
      "caption": "Faites défiler cette session de démonstration pour voir le transfert de fichiers, puis le terminal SSH. Vous pouvez aussi les ouvrir depuis la barre d’outils.",
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
        "title": "Двусторонний буфер обмена",
        "description": "Вставляйте локальный текст на удалённом рабочем столе или переносите скопированный там текст на свой компьютер."
      },
      {
        "title": "Терминал и передача файлов",
        "description": "В окне VNC можно открыть SSH-терминал, отправить или скачать файлы по SFTP. Уже запущенные передачи продолжаются после закрытия окна."
      }
    ],
    "demo": {
      "caption": "Прокрутите пример сеанса вниз, чтобы увидеть сначала передачу файлов, а затем SSH-терминал. Обе панели можно открыть и с панели инструментов.",
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
    caption: string; desktop: string; fullscreen: string; fit: string; renderMode: string
    qualityMode: string; smoothMode: string; hideLocalCursor: string; openVnc: string
    sendCtrlAltDel: string; close: string; minimize: string; restore: string
  }
}>
