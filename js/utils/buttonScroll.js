/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// Cross browser support for current position
function currentYPosition() {
  // Firefox, Chrome, Opera, Safari
  if (self.pageYOffset) return self.pageYOffset;
  // Internet Explorer 6 - standards mode
  // eslint-disable-next-line max-len
  if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop;
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

// determines position of destination element that we'd like to scroll to
function elmYPosition(eID) {
  const elm = document.getElementById(eID);
  let y = elm.offsetTop;
  let node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  } return y;
}

// core scrolling function
function smoothScroll(eID) {
  const startY = currentYPosition();
  const stopY = elmYPosition(eID);
  const distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY); return;
  }
  let speed = Math.round(distance / 100);
  if (speed >= 20) speed = 20;
  const step = Math.round(distance / 25);
  let leapY = stopY > startY ? startY + step : startY - step;
  let timer = 10;
  if (stopY > startY) {
    for (let i = startY; i < stopY; i += step) {
      // eslint-disable-next-line no-implied-eval
      setTimeout(window.scrollTo.bind(null, 0, leapY), timer * speed);
      // eslint-disable-next-line no-plusplus
      leapY += step; if (leapY > stopY) leapY = stopY; timer++;
    } return;
  }
  for (let i = startY; i > stopY; i -= step) {
    // eslint-disable-next-line no-implied-eval
    setTimeout(window.scrollTo.bind(null, 0, leapY), timer * speed);
    // eslint-disable-next-line no-plusplus
    leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
  }
  // eslint-disable-next-line consistent-return
  return false;
}
