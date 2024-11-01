import phonemask from './phonemask/phonemask'
import ripple from '@qpokychuk/ripple'

import '../scss/index.scss'


window.addEventListener('DOMContentLoaded', () => loadHandler())

function loadHandler() {
  ripple.init()
  phonemask.init('[type="tel"]')

  ripple.attach('.btn')
  ripple.attach('.waved')
  ripple.deAttach('.btn-text')

  scrollHandler()
  document.addEventListener('toggleopen', toggleOpenHandler)
  document.addEventListener('toggleclose', toggleCloseHandler)
}

window.addEventListener('scroll', scrollHandler)

function scrollHandler() {
  document.body.classList.toggle('scroll-top', window.scrollY == 0)
}

const menusIds = ['lk-menu', 'menu', 'catalog-filter']

function toggleOpenHandler(e: Event) {
  const event = e as CustomEvent

  if (menusIds.includes(event.detail.target.id)) {
    document.body.classList.add('menu-opened')
  }
}

function toggleCloseHandler(e: Event) {
  const event = e as CustomEvent

  if (menusIds.includes(event.detail.target.id)) {
    document.body.classList.remove('menu-opened')
  }
}

