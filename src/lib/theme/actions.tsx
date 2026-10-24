"use client";
import {createContext,useContext,useRef,type ReactNode,type RefObject} from 'react'
import {useOriaTheme} from '@oriatheme/react'
import type {AppearanceMode} from '@oriatheme/core'
import type {ThemeChangeOptions} from '@oriatheme/runtime-dom'
export type ThemeActionGuard={theme:(id:string,options?:ThemeChangeOptions)=>void;appearance:(mode:AppearanceMode,options?:ThemeChangeOptions)=>void}
const Context=createContext<RefObject<ThemeActionGuard|null>|null>(null)
export function ThemeActionProvider({children}:{children:ReactNode}){const guard=useRef<ThemeActionGuard|null>(null);return <Context value={guard}>{children}</Context>}
export function useThemeActionGuard(){const guard=useContext(Context);if(!guard)throw Error('ThemeActionProvider missing');return guard}
export function useThemeActions(){const {setTheme,setAppearance}=useOriaTheme();const guard=useThemeActionGuard();return {setTheme:(id:string,options?:ThemeChangeOptions)=>{return guard.current?guard.current.theme(id,options):setTheme(id,options)},setAppearance:(mode:AppearanceMode,options?:ThemeChangeOptions)=>guard.current?guard.current.appearance(mode,options):setAppearance(mode,options)}}
