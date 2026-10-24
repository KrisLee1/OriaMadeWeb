import { createContext, useContext } from 'react'
// Expensive icon discovery starts after the first entry has settled. Glass is
// prepared independently so the material is visible during the entry itself.
export const PopupReadyContext = createContext(true)
export const usePopupReady = () => useContext(PopupReadyContext)
