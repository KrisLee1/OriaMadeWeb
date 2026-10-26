import type {Locale} from '@/i18n/config'
export const demoScenarios=['mixed','stopped','connecting','authenticating','verifying-host','listening','reconnecting','failed','authenticationError','configurationError','networkError','dnsError','timeoutError','bindError','forwardError','hostKeyError','commandError'] as const
export type DemoScenario=typeof demoScenarios[number]
export type DemoStatus=Exclude<DemoScenario,'mixed'>
export function scenarioStatuses(scenario:DemoScenario):DemoStatus[]{return scenario==='mixed'?['listening','stopped','connecting','failed','reconnecting','authenticating']:Array.from({length:6},()=>scenario)}
export function isDemoForwardActive(status:DemoStatus){return ['listening','connecting','authenticating','verifying-host','reconnecting'].includes(status)}
export function toggleDemoForward(statuses:DemoStatus[],index:number):DemoStatus[]{return statuses.map((status,rule)=>rule===index?(isDemoForwardActive(status)?'stopped':'listening'):status)}
/** Same state and color contract as the app's connection-visual.ts. */
export function demoConnectionVisual(status:DemoStatus,color:string){const state=status==='listening'?'connected':['connecting','authenticating','verifying-host','reconnecting'].includes(status)?'connecting':'stopped';return {state,color:state==='stopped'?'var(--oria-color-muted-fg)':color}}
const copy={
 en:{label:'State preview',note:'Simulated states · no server connections',mixed:'Mixed states',pause:'Pause motion',resume:'Resume motion'},
 'zh-CN':{label:'状态演示',note:'官网模拟 · 不建立真实连接',mixed:'混合状态',pause:'暂停动态',resume:'继续动态'},
 'zh-TW':{label:'狀態示範',note:'官網模擬 · 不建立真實連線',mixed:'混合狀態',pause:'暫停動態',resume:'繼續動態'},
 ja:{label:'状態プレビュー',note:'シミュレーション · サーバーには接続しません',mixed:'複数の状態',pause:'動きを停止',resume:'動きを再開'},
 ko:{label:'상태 미리보기',note:'시뮬레이션 · 실제 서버에 연결하지 않음',mixed:'여러 상태',pause:'움직임 일시 정지',resume:'움직임 재개'},
 de:{label:'Statusvorschau',note:'Simulation · keine Serververbindungen',mixed:'Gemischte Zustände',pause:'Bewegung pausieren',resume:'Bewegung fortsetzen'},
 fr:{label:'Aperçu des états',note:'Simulation · aucune connexion aux serveurs',mixed:'États variés',pause:'Mettre en pause',resume:'Reprendre les animations'},
 ru:{label:'Просмотр состояний',note:'Симуляция · без подключения к серверам',mixed:'Разные состояния',pause:'Приостановить анимацию',resume:'Продолжить анимацию'},
}
export function getSimulationCopy(locale:Locale){return copy[locale]}

export function activeDemoCount(statuses:DemoStatus[]){return statuses.filter(isDemoForwardActive).length}
