import { QueryObject } from './types'

// credit: forked from https://github.com/akiran/json2mq

const camel2hyphen = (str: string) =>
  str
    .replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase()
    })
    .toLowerCase()

const isDimension = function (feature: string) {
  const re = /[height|width]$/
  return re.test(feature)
}

const obj2mq = function (obj: QueryObject) {
  let mq = ''
  //  @ts-ignore
  const features: string[] = Object.keys(obj)
  features.forEach(function (f, i) {
    let value: number | string | boolean | Function | undefined = obj[f]
    if (typeof value === 'function' || f.startsWith('_')) {
      return
    }
    const feature = camel2hyphen(f)
    // Add px to dimension features
    if (isDimension(feature) && typeof value === 'number') {
      value = value.toString(10) + 'px'
    }
    if (value === true) {
      mq += feature
    } else if (value === false) {
      mq += 'not ' + feature
    } else {
      mq += '(' + feature + ': ' + value + ')'
    }
    if (i < features.length - 1) {
      mq += ' and '
    }
  })
  return mq
}

export const json2mq = function (query: QueryObject | QueryObject[]) {
  let mq = ''
  if (typeof query === 'string') {
    return query
  }

  // Handling array of media queries
  if (Array.isArray(query)) {
    query.forEach(function (q, index) {
      mq += obj2mq(q)
      if (index < query.length - 1) {
        mq += ', '
      }
    })
    return mq
  }

  // Handling single media query
  return obj2mq(query)
}
