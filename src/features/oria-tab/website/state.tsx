import {createContext,useContext,useMemo,useState,type ReactNode} from 'react'
import {useOriaTheme} from '@oriatheme/react'
import {initialState,reduceState,type AppState,type Action} from '../shared/lib/model'
import type {Locale} from '@/i18n/config'
type Context={runtime:import('@oriatheme/runtime-dom').OriaThemeRuntime;state:AppState;ready:boolean;act:(action:Action)=>Promise<boolean>;notice:null;notify:(text:string,error?:boolean)=>void;previewSettings:()=>number;clearPreview:()=>void}
const Context=createContext<Context|null>(null)
export function WebsiteStateProvider({children,locale}:{children:ReactNode;locale:Locale}) {
 const {snapshot,runtime}=useOriaTheme(); const [local,setLocal]=useState(initialState)
 const state=useMemo(()=>({...local,settings:{...local.settings,hdIcons:false,language:locale,themeId:snapshot.preference.activeThemeId,theme:snapshot.preference.appearance},customThemes:[...snapshot.customThemes]}),[local,locale,snapshot])
 const value:Context={runtime,state,ready:true,act:async action=>{if(action.type!=='theme.material' && !(action.type==='settings' && Object.keys(action.patch).every(key=>['themeColor','customColor'].includes(key))))return false;setLocal(s=>reduceState(s,action));return true},notice:null,notify:()=>{},previewSettings:()=>0,clearPreview:()=>{}}
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useApp(){const value=useContext(Context);if(!value)throw Error('WebsiteStateProvider missing');return value}
