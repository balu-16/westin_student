import { render } from '../dist-server/entry-server.js'

const html = render('/')
if (!html.includes('Big dreams.') || !html.includes('Student login')) {
  throw new Error('Public homepage SSR output did not contain the expected public content')
}

const about = render('/about')
if (!about.includes('A college for the next chapter.')) {
  throw new Error('Public About route SSR output did not contain its page heading')
}

console.log('SSR smoke passed: / and /about render public HTML without private auth dependencies')
