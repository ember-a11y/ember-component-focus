import Ember from 'ember';
import $ from 'jquery';

const run = Ember.run,
      RSVP = Ember.RSVP;

const FOCUSABLE_TAGS = ['a', 'button', 'input', 'option', 'select', 'textarea'];

export default Ember.Service.extend({
  _afterRenderResolver: null,
  _afterRenderPromise: null,
  _nextToFocus: null,

  focusComponent(component, child) {
    var el = findElToFocus(component, child),
        origTabIndex = el.getAttribute('tabindex');

    if (origTabIndex === undefined && !isDefaultFocusable(el)) {
      el.setAttribute('tabindex', -1);
      $(el).one('blur', () => el.removeAttribute('tabindex'));
    }

    el.focus();
    return el;
  },

  focusComponentAfterRender(component, child) {
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
