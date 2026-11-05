import {locales} from './config'

export const LANGUAGE_STORAGE_KEY = 'oria-made-language'

// Runs in <head> before React starts. Explicit locale URLs always win; the
// unprefixed entry uses the saved choice, then the browser's ordered languages.
// Keep this self-contained so the same script can be exercised without a DOM.
export const languageBootstrap = `(()=>{
 const supported=${JSON.stringify(locales)};
 const key=${JSON.stringify(LANGUAGE_STORAGE_KEY)};
 const prefix=location.pathname.split('/')[1];
 if(supported.includes(prefix))return;
 let saved;
 try{saved=localStorage.getItem(key)}catch{}
 let locale=supported.includes(saved)?saved:null;
 if(!locale){
  const languages=navigator.languages?.length?navigator.languages:[navigator.language];
  for(const language of languages){
   if(typeof language!=='string')continue;
   const tag=language.toLowerCase().replaceAll('_','-');
   if(tag==='zh'||tag.startsWith('zh-')){
    locale=tag.includes('-hant')||(!tag.includes('-hans')&&/-(tw|hk|mo)(-|$)/.test(tag))?'zh-TW':'zh-CN';
   }else{
    locale=supported.find(code=>code.toLowerCase()===tag)||supported.find(code=>code===tag.split('-')[0]);
   }
   if(locale)break;
  }
 }
 if(!locale||locale==='en')return;
 location.replace('/'+locale+(location.pathname==='/'?'':location.pathname)+location.search+location.hash);
})();`
