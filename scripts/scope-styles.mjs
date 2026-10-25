import fs from 'node:fs'
import postcss from 'postcss'
function scope(text,prefix) {
 const ast=postcss.parse(text)
 ast.walkAtRules(rule=>{if(['import','theme','custom-variant','source'].includes(rule.name))rule.remove()})
 ast.walkRules(rule=>{
  let p=rule.parent;while(p){if(p.type==='atrule'&&p.name.includes('keyframes'))return;p=p.parent}
  rule.selectors=rule.selectors.map(selector=>{
   // Match type selectors only: `.st-body` and `[data-panel="body"]`
   // contain the word body but are not document roots.
   const rootType = /(^|[\s>+~,(])(?:html|body)(?=[\s.#:\[>+~),]|$)/g
   if(selector.includes(':root') || rootType.test(selector)) {
    rootType.lastIndex = 0
    if(selector === 'html.st-snapping') return 'html.st-snapping:has(.oria-tab-runtime)'
    return selector.replace(/:root/g,prefix).replace(rootType,(_,before)=>before+prefix)
   }
   if(selector.startsWith('[data-material=')) return `${prefix}${selector}, ${prefix} ${selector}`
   if(selector.startsWith('.dark'))return selector.replace(/^\.dark/,prefix+'.dark')
   return `${prefix} ${selector}`
  })
 })
 return ast.toString()
}
const theme='src/features/oria-theme/'
fs.writeFileSync(theme+'migrated.css',scope(fs.readFileSync(theme+'source.css','utf8')+'\n'+fs.readFileSync(theme+'showcase.css','utf8'),'.oria-theme')+'\n.oria-theme .editor-panel{top:var(--oria-header-height);height:calc(100dvh - var(--oria-header-height))}\n')
const tab='src/features/oria-tab/'
let base=fs.readFileSync(tab+'base-source.css','utf8'),website=fs.readFileSync(tab+'website-source.css','utf8')
// The upstream first theme bridge may use a multiline body; find its color declarations.
const bridges=[...base.matchAll(/:root\[data-material="theme"\]\s*\{[^}]*\}/g)].map(m=>m[0])
website=website.replace('/* @preview-scope */',bridges.map(b=>b.replace(':root[data-material="theme"]','[data-preview-scope][data-material="theme"]')).join('\n'))
let all=scope(base+'\n'+fs.readFileSync(tab+'aide-source.css','utf8')+'\n'+website,'.oria-tab-runtime')
all+='\n.oria-tab-runtime{min-width:0;color:var(--oria-color-fg);--background:var(--oria-color-bg);--foreground:var(--oria-color-fg);--card:var(--oria-color-surface);--popover:var(--oria-color-overlay);--primary:var(--oria-color-primary);--primary-foreground:var(--oria-color-primary-fg);--secondary:var(--oria-color-secondary);--muted:var(--oria-color-muted);--muted-foreground:var(--oria-color-muted-fg);--accent:var(--oria-color-accent);--border:var(--oria-color-border);--ring:var(--oria-color-ring);--interface-opacity:1}\n'
all+='\n#oria-tab-progress{position:fixed;z-index:35;top:calc(var(--oria-header-height) + 16px);left:50%;transform:translateX(-50%)}\n.oria-tab-runtime .cinema-rail{position:relative;max-width:calc(100vw - 24px)}\n.oria-tab-runtime .st-sticky{overflow:clip}\n.oria-tab-runtime .st{overflow:hidden}\n'
fs.writeFileSync(tab+'migrated.css',all)
