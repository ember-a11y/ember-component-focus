import Ember from 'ember';

const { run, RSVP } = Ember;

const FOCUSABLE_TAGS = ['a', 'button', 'input', 'option', 'select', 'textarea'];

export default Ember.Service.extend({
  _afterRenderResolver: null,
  _afterRenderPromise: null,
  _blurListener: null,
  _nextToFocus: null,
  _nextToReset: null,

  focusComponent(component, child = null) {
    let el = findElToFocus(component, child);

    if (!el.hasAttribute('tabindex') && !isDefaultFocusable(el)) {
      el.setAttribute('tabindex', -1);
      this.set('_nextToReset', el);
    }

    el.focus();
    return el;
  },

  focusComponentAfterRender(component, child = null) {
    var afterRenderPromise = this.get('_afterRenderPromise');

    this.set('_nextToFocus', {component, child});

    if (!afterRenderPromise) {
      afterRenderPromise = new RSVP.Promise(resolve => {
        this.set('_afterRenderResolver', resolve);
      });
      this.set('_afterRenderPromise', afterRenderPromise);
    }

    run.scheduleOnce('afterRender', this, '_afterRenderCallback');
    return afterRenderPromise;
  },

  init() {
    // Don't try to attach events in server side environments.
    if (typeof document === 'undefined') {
      return;
    }

    let blurListener = this._handleBlur.bind(this);
    document.body.addEventListener('blur', blurListener, true);
    this.set('_blurListener', blurListener);
  },

  willDestroy() {
    let blurListener = this.get('_blurListener');

    if (blurListener) {
      document.body.removeEventListener('blur', blurListener, true);
    }
  },

  _afterRenderCallback() {
    var resolver = this.get('_afterRenderResolver'),
        {component, child} = this.get('_nextToFocus');

    var focusedEl = this.focusComponent(component, child);

    this.set('_nextToFocus', null);
    this.set('_afterRenderPromise', null);
    this.set('_afterRenderResolver', null);

    if (typeof resolver === 'function') {
      resolver(focusedEl);
    }
  },

  _handleBlur() {
    let elToReset = this.get('_nextToReset');
    if (elToReset) {
      elToReset.removeAttribute('tabindex');
      this.set('_nextToReset', null);
    }
  }
});

function findElToFocus(component, child) {
  if (!child) {
    return component.element;
  }

  let isChildString = (typeof child === 'string');
  if (!isChildString && child.hasOwnProperty('length')) {
    // Child is probably a jQuery object, so unwrap it.
    child = child[0];
  }

  if (isChildString) {
    let childEl = component.element.querySelector(child);
    if (!childEl) {
      throw new Error(`No child element found for selector '${child}'`);
    }
    return childEl;
  }

  return child;
}

function isDefaultFocusable(el) {
  var tagName = el.tagName.toLowerCase();
  return FOCUSABLE_TAGS.indexOf(tagName) > -1;
}
