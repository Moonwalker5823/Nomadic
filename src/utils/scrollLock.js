/**
 * Reference-counted body scroll lock.
 *
 * The nav menu and the lightbox can both want the page frozen. A plain
 * add/remove of a class lets whichever closes first unlock the page while
 * the other is still open, so we count holders and only release at zero.
 */

let holders = 0

export function lockScroll() {
  holders++
  if (holders === 1) document.body.classList.add('no-scroll')
}

export function unlockScroll() {
  holders = Math.max(0, holders - 1)
  if (holders === 0) document.body.classList.remove('no-scroll')
}
