/* Copyright 2015 LinkedIn Corp. Licensed under the Apache License, Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import Service from '@ember/service';

const FOCUSABLE_TAGS = ['a', 'button', 'input', 'option', 'select', 'textarea'];

export default Service.extend({
  _afterRenderResolver: null,
  _afterRenderPromise: null,
  _blurListener: null,
  _nextToFocus: null,
  _nextToReset: null,

  focusComponent(component, child = null) {
    let el = findElToFocus(component, child);
    let isFocusable = el.hasAttribute('tabindex') || isDefaultFocusable(el);

    if (!isFocusable) {
      el.setAttribute('tabindex', -1);
    }

    el.focus();

    // Done after `el.focus()` to prevent the `blur` handler from triggering
    // too early.
    if (!isFocusable) {
      this.set('_nextToReset', el);
    }

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
    this._super(...arguments)
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
