/* eslint-disable no-param-reassign */
// eslint-disable-next-line func-names
(function () {
  // const version = '2.4.2';

  /**
   * Internet Explorer fix
   * @returns {*}
   */
  function getCurrentScriptIE() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  }
  // window.sessionStorage.setItem('x_domain_url', `${window.location.origin}/`);

  let currentScript = document.currentScript || getCurrentScriptIE();

  if (typeof (currentScript) === 'function') currentScript = currentScript();

  const target = currentScript.getAttribute('target');
  const width = currentScript.getAttribute('width');
  const height = currentScript.getAttribute('height');
  const className = currentScript.getAttribute('class');
  //   const style = currentScript.getAttribute('style');
  const id = currentScript.getAttribute('iframe-id');

  let iFrame = null;

  const uriWhiteList = [
    'country',
    'category',
    'location',
    'brand',
    'city',
    'near',
    'selected',
  ];

  let hostName = '';

  /**
   * Gets the base url of the included tag
   * @returns {string}
  */
  function getBaseUrl() {
    let url = currentScript.getAttribute('src');
    const swEvent = currentScript.getAttribute('data-event') || 'shoppingweek';
    hostName = url.replace('/integration.js', '');
    hostName = hostName.split('?').shift();
    url = url.replace('integration.js', '');
    return url;
  }

  /**
   * Generates the iframe with the application
   * @param url
  */
  function addIframe(url) {
    const style = ' ';
    iFrame = document.createElement('IFRAME');

    iFrame.setAttribute('src', url);
    iFrame.setAttribute('id', id);
    iFrame.setAttribute('name', id);
    iFrame.setAttribute('scrolling', 'no');

    if (width) { iFrame.setAttribute('width', width); }
    if (height) { iFrame.setAttribute('height', height); }
    if (className) { iFrame.setAttribute('class', className); }
    if (style) { iFrame.setAttribute('style', style); }

    document.getElementById(target).appendChild(iFrame);
  }

  /**
   * Redas a Query Variable
   * @param variable
   * @returns {*}
  */
  function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === variable) {
        result.push(pair[1]);
      }
    }
    return result;
  }

  function checkConsent(consentGranted, activeGroups) {
    consentGranted = consentGranted || false;
    activeGroups = activeGroups || ['MANDATORY'];

    // eslint-disable-next-line no-prototype-builtins
    if (window.hasOwnProperty('cnConsent')) {
      activeGroups = window.cnConsent.getActiveGroups();
    }

    const message = { params: { consent: false, activeGroups }, action: 'consent-checked' };

    // sends the configured message
    iFrame.contentWindow.postMessage(
      message,
      '*',
    );
  }

  /**
   * Initiates the application
  */
  function init() {
    let src = getBaseUrl();
    let supplement = '?';
    let param = '';
    let add = '';

    if (src.indexOf('?') >= 0) supplement = '&';

    uriWhiteList.forEach((uriParam) => {
      param = getQueryVariable(uriParam);
      if (!param.length) return;
      if (param.length === 1) add = `&${uriParam}=${param[0]}`;
      else add = param.join(`&${uriParam}=`);

      supplement += add;
    });

    src = `${src + supplement}`;

    window.addEventListener('consent:change', () => {
      checkConsent();
    });
    // $(iFrame).on('load',checkConsent);
    addIframe(src);
  }

  /**
   * Reads the post messages
   * @param event
  */
  function catchShopMessage(event) {
    // Only react on messages from our target domain
    // eslint-disable-next-line no-useless-escape
    if (hostName.indexOf(event.origin.replace(/^(http(s)?\:)/igm, '')) < 0) return;

    if (typeof event.data !== 'number') {
      // eslint-disable-next-line no-undef
      $(`iframe[id="${id}"]`).height(event.data.height);
    }
  }

  /**
   * Register postMessage callback method
  */
  window.addEventListener('message', catchShopMessage, false);
  init();
}());
