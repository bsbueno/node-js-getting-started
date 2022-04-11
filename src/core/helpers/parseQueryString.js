import { parse } from 'qs'

export default query => parse(query, { allowDots: true, ignoreQueryPrefix: true })
