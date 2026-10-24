/** Split CSS lists without splitting commas inside color/gradient functions. */
export function cssLayers(value = '') {
  const layers: string[] = []
  let depth = 0, start = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') depth--
    else if (value[i] === ',' && depth === 0) { layers.push(value.slice(start, i).trim()); start = i + 1 }
  }
  layers.push(value.slice(start).trim())
  return layers.filter(layer => layer && layer !== 'none')
}

/** A material owns one outer shadow. Inset lighting contributes to its single border. */
export function materialShadows(variables: Readonly<Record<string, string>>, size: 'sm' | 'md' | 'lg') {
  const sized = cssLayers(variables[`--oria-shadow-${size}`])
  const highlight = cssLayers(variables['--oria-shadow-highlight'])
  const inner = cssLayers(variables['--oria-shadow-inner'])
  const edges = highlight.length ? highlight : inner.length ? inner : sized.filter(layer => /\binset\b/.test(layer))
  // Highlight tokens already describe the rim. Keep hard offset shadows (e.g. Brutalism),
  // but omit the alternate one-pixel rim supplied by some floating shadow presets.
  const outer = sized.filter(layer => !/\binset\b/.test(layer) && !(edges.length && /^-?[01](?:px)?\s+-?[01](?:px)?\s+0(?:px)?\s+0(?:px)?\s/.test(layer)))
  const light = edges[0]?.match(/^(?:inset\s+)?(?:[-+]?[\d.]+(?:[a-z]+|%)?\s+){2,4}(.+)$/)?.[1]
  return { outer: [...new Set(outer)].join(', ') || 'none', border: light || variables['--oria-color-border'] }
}
