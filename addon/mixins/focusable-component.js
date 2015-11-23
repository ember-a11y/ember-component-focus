/* Copyright 2015 LinkedIn Corp. Licensed under the Apache License, Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import Ember from 'ember';

export default Ember.Mixin.create({
  /**
   * Reference to the Focus Manager service.
   * @property componentFocusManager
   * @type Object
   */
  componentFocusManager: Ember.inject.service('component-focus/focus-manager'),
  /**
   * Selector string indicating the element to be focused when focus() or
   * focusAfterRender() are called on the component.
   * @property focusNode
   * @type String
   */
  focusNode: null,

  /**
   * Moves focus to the indicated element immediately.
   * @method focus
   * @param {HTMLElement|String} [child=this.focusNode] A child element, or a
   *                             string selector for the element, to receive focus.
   *                             If not passed and the component has no focusNode,
   *                             component.element will be focused.
   * @return {HTMLElement} The element that received focus.
   */
  focus(child = this.get('focusNode')) {
    return this.get('componentFocusManager').focusComponent(this, child);
  },

  /**
   * Moves focus to the indicated element after the next render cycle.
   * This is useful when the element to be focused is not yet rendered.
   * @method focusAfterRender
   * @param {HTMLElement|String} [child=this.focusNode] A child element, or a
   *                             string selector for the element, to receive focus.
   *                             If not passed and the component has no focusNode,
   *                             component.element will be focused.
   * @return {Object} A promise that will be resolved with the element that
   *                  received focus.
   */
  focusAfterRender(child = this.get('focusNode')) {
    return this.get('componentFocusManager').focusComponentAfterRender(this, child);
  }
});
