Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

Object.prototype.find = function(path) {
  path = path.split('.');
  let obj = this;
  for (let i = 0; i < path.length ; i++){
      obj = obj[path[i]];
  };
  return obj;
};

String.prototype.containsOneOf = function(array) {
    return array.some(s => this.includes(s));
};

function elementIdentifier(elm){
  return elm.localName + (elm.id ? '#' + elm.id : '') + (elm.className && elm.className.split ? '.' + elm.className.trim().split(' ').join('.') : '');
}

function getContext(url) {
  const contexts = [
    // Order is important
    {key: 'chat', identifier: `/popout/${STREAMER}/chat`}, //was key:popout, but Twitch changed /chat to this
    //{key: 'chat', identifier: `/${STREAMER}/chat`},
    {key: 'stream', identifier: `/${STREAMER}`},
  ];

  let targetUrl = url ? url : window.location.pathname;

  return (contexts.find(c => {
    return targetUrl.includes(c.identifier)
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
