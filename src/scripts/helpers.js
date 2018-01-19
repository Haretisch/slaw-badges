function elementIdentifier(elm){
  return elm.localName + (elm.id ? '#' + elm.id : '') + (elm.className && elm.className.split ? '.' + elm.className.trim().split(' ').join('.') : '');
}

function getContext() {
  const contexts = [
    // Order is important
    {key: 'popout', identifier: `/popout/${STREAMER}/chat`},
    {key: 'chat', identifier: `/${STREAMER}/chat`},
    {key: 'stream', identifier: `/${STREAMER}`},
  ];

  return (contexts.find(c => {
    return window.location.pathname.includes(c.identifier)
  }) || {key: null}).key;
}

function formatNumber(n) {
  return n.toLocaleString('en-GB');
}

function getSystem() {
  //Should allow this app to be mostly crossbrowser. Chrome, Opera and Edge (apparently) user chrome, Firefox uses browser
  return chrome || browser;
}

function storageAvailable(type) {
  try {
    var storage = window[type],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}
