import type {Locale} from '@/i18n/config'
import type {DemoView} from './demo'

export const workspaceGuide = {
  'zh-CN': {
    map: '沿连线查看本机端口、SSH 主机和远端服务。用缩放控件查看端点，在线路卡片上启停转发。',
    forwards: '按名称或端口筛选转发规则。核对两端地址，点击启动或停止，连接图会同步更新。',
    services: '按主机浏览服务与常用命令。勾选一项服务，可以看到其他主机下的同一服务同步选中。',
    hosts: '用主机名、地址或标签筛选 SSH 主机，查看登录用户与认证方式，也可以按标签分组。',
    logs: '按主机查看转发日志，筛选规则名称即可找到对应的状态、时间和重试记录。',
  },
  en: {
    map: 'Follow the lines from local ports to SSH hosts and remote services. Zoom in to inspect an endpoint or start a forward on its card.',
    forwards: 'Filter rules by name or port. Check both endpoints, then start or stop a forward. The map reflects the change.',
    services: 'Browse services and commands by host. Select a shared service to select it across all its hosts.',
    hosts: 'Search hosts by name, address or tag. Inspect the login and authentication method, or group hosts by tag.',
    logs: 'Browse forwarding events by host. Filter by rule name to find its status, timestamp and retry count.',
  },
  'zh-TW': {
    map: '沿連線查看本機連接埠、SSH 主機與遠端服務。縮放檢視端點，在規則卡片上啟停轉送。',
    forwards: '依名稱或連接埠篩選規則。核對兩端位址後啟動或停止轉送，連線圖會同步更新。',
    services: '依主機瀏覽服務與常用指令。勾選共用服務時，其他主機下的相同服務也會同步選取。',
    hosts: '依名稱、位址或標籤搜尋 SSH 主機，查看登入帳號與驗證方式，或依標籤分組。',
    logs: '依主機查看轉送記錄，以規則名稱篩選狀態、時間與重試次數。',
  },
  ja: {
    map: '接続線でローカルポートと SSH ホスト、サービスの関係を確認。拡大して接続先を調べ、カードから転送を開始できます。',
    forwards: '名前やポートでルールを絞り込み、両端を確認して転送を開始・停止します。変更はマップにも反映されます。',
    services: 'ホスト別にサービスとコマンドを表示。共有サービスにチェックを入れると、他のホストでも同じサービスが選択されます。',
    hosts: '名前、アドレス、タグで SSH ホストを検索。ログイン名と認証方法を確認し、タグ別にグループ化できます。',
    logs: 'ホスト別に転送ログを表示。ルール名で絞り込むと、状態、時刻、再試行回数を確認できます。',
  },
  ko: {
    map: '연결선을 따라 로컬 포트, SSH 호스트, 서비스를 확인하세요. 확대해 끝점을 살펴보고 카드에서 포워딩을 시작할 수 있습니다.',
    forwards: '이름이나 포트로 규칙을 찾고 양쪽 주소를 확인하세요. 포워딩을 시작하거나 중지하면 연결도에도 반영됩니다.',
    services: '호스트별 서비스와 명령을 확인하세요. 공유 서비스를 선택하면 다른 호스트의 같은 서비스도 선택됩니다.',
    hosts: '이름, 주소 또는 태그로 SSH 호스트를 찾고 로그인 계정과 인증 방식을 확인하세요. 태그별로 묶을 수도 있습니다.',
    logs: '호스트별 포워딩 로그를 확인하세요. 규칙 이름으로 상태와 시각, 재시도 횟수를 찾을 수 있습니다.',
  },
  de: {
    map: 'Folge den Linien von lokalen Ports zu SSH-Hosts und Diensten. Zoome zu einem Endpunkt oder starte eine Weiterleitung direkt auf der Karte.',
    forwards: 'Filtere Regeln nach Namen oder Port. Prüfe beide Endpunkte und starte oder stoppe eine Weiterleitung. Die Karte zeigt den neuen Zustand.',
    services: 'Sieh dir Dienste und Befehle je Host an. Wähle einen gemeinsamen Dienst aus, um ihn auf allen zugehörigen Hosts zu markieren.',
    hosts: 'Suche SSH-Hosts nach Namen, Adresse oder Tag. Prüfe Anmeldung und Authentifizierung oder gruppiere Hosts nach Tags.',
    logs: 'Sieh dir Ereignisse je Host an. Filtere nach Regelnamen, um Status, Zeitpunkt und Wiederholungen zu finden.',
  },
  fr: {
    map: 'Suivez les lignes entre ports locaux, hôtes SSH et services. Zoomez sur un point de connexion ou lancez une redirection depuis sa fiche.',
    forwards: 'Filtrez les règles par nom ou par port. Vérifiez les deux adresses, puis lancez ou arrêtez la redirection. La carte se met à jour.',
    services: 'Parcourez les services et leurs commandes par hôte. Cochez un service partagé pour le sélectionner sur tous ses hôtes.',
    hosts: 'Recherchez les hôtes SSH par nom, adresse ou étiquette. Consultez le compte et le mode d’authentification, ou regroupez les hôtes par étiquette.',
    logs: 'Consultez les événements par hôte. Filtrez par nom de règle pour retrouver l’état, l’heure et le nombre de tentatives.',
  },
  ru: {
    map: 'Проследите путь от локальных портов к SSH-хостам и сервисам. Увеличьте карту для просмотра адреса или запустите перенаправление с карточки.',
    forwards: 'Найдите правило по имени или порту. Проверьте оба адреса и запустите или остановите перенаправление. Карта отразит изменение.',
    services: 'Просматривайте сервисы и команды по хостам. Отметьте общий сервис, и он будет выбран на всех связанных хостах.',
    hosts: 'Ищите SSH-хосты по имени, адресу или метке. Проверьте пользователя и способ аутентификации или сгруппируйте хосты по меткам.',
    logs: 'Просматривайте события по хостам. Фильтр по имени правила поможет найти состояние, время и число повторных попыток.',
  },
} satisfies Record<Locale, Record<DemoView, string>>
