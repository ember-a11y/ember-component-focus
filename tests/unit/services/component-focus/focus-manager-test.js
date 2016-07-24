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
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember;

var component,
    focusComponentSpy,
    focusSpy,
    inputEl,
    runSpy,
    service,
    spanEl;

moduleFor('service:component-focus/focus-manager', 'Unit | Service | component focus/focus manager', {
  beforeEach() {
    service = this.subject();
    focusComponentSpy = sinon.spy(service, 'focusComponent');
    runSpy = sinon.spy(run, 'scheduleOnce');

    inputEl = document.createElement('input');
    focusSpy = sinon.spy(inputEl, 'focus');
    spanEl = document.createElement('span');
    [inputEl, spanEl].forEach((el) => document.body.appendChild(el));

    component = {};
  },

  afterEach() {
    [inputEl, spanEl].forEach((el) => document.body.removeChild(el));
    focusComponentSpy.restore();
    runSpy.restore();
  }
});

test('focusComponent() calls focus() on the passed child', function(assert) {
  assert.expect(1);
  service.focusComponent(component, inputEl);
  assert.ok(focusSpy.calledOnce);
});

test('focusComponent() calls focus() on component element if no child passed', function(assert) {
  assert.expect(1);
  component.element = inputEl;
  service.focusComponent(component);
  assert.ok(focusSpy.calledOnce);
});

test('focusComponent() searches for element in component when given a string for child', function(assert) {
  assert.expect(2);
  component.element = {
    querySelector: sinon.spy(function() {
      return inputEl;
    })
  };

  service.focusComponent(component, '#foo');
  assert.ok(component.element.querySelector.calledWith('#foo'));
  assert.ok(focusSpy.calledOnce);
});

test('focusComponent() sets tabindex to -1 on child that is not focusable', function(assert) {
  assert.expect(2);
  focusSpy = sinon.spy(spanEl, 'focus');

  service.focusComponent(component, spanEl);
  assert.equal(spanEl.getAttribute('tabindex'), '-1');
  assert.ok(focusSpy.calledOnce);
});

test('focusComponent() will register the child to be reset on blur if it sets tabindex', function(assert) {
  assert.expect(2);

  service.focusComponent(component, spanEl);
  assert.equal(spanEl.getAttribute('tabindex'), '-1');
  spanEl.blur();
  assert.notOk(spanEl.hasAttribute('tabindex'));
});

test('focusComponent() can focus on a new element when another element has focus first', function(assert) {
  assert.expect(2);

  // create element to focus on first
  var focusEl = document.createElement('button');
  document.body.appendChild(focusEl);
  focusEl.focus();
  assert.equal(document.activeElement, focusEl, 'A new element could not be focused on');

  service.focusComponent(component, spanEl);
  assert.equal(document.activeElement, spanEl, 'The focus component did not focus properly');
});

test('focusComponent() does not change tabindex on a child that already has it', function(assert) {
  assert.expect(1);
  spanEl.setAttribute('tabindex', 0);

  service.focusComponent(component, spanEl);
  assert.equal(spanEl.getAttribute('tabindex'), '0');
});

test('focusComponent() does not set tabindex on a default focusable child', function(assert) {
  assert.expect(1);

  service.focusComponent(component, inputEl);
  assert.notOk(inputEl.hasAttribute('tabindex'));
});

test('focusComponent() picks first element when passed an array/array-like child', function(assert) {
  assert.expect(1);

  service.focusComponent(component, [inputEl]);
  assert.ok(focusSpy.calledOnce);
});

test('focusComponent() throws an error if selector for child is not found', function(assert) {
  assert.expect(1);
  component.element = {
    querySelector() {
      return null;
    }
  };

  assert.throws(
    () => service.focusComponent(component, '#foo'),
    /No child element found for selector '#foo'/
  );
});

test('focusComponentAfterRender() calls focusComponent() after next render', function(assert) {
  assert.expect(3);
  run(() => service.focusComponentAfterRender(component, inputEl));

  assert.ok(runSpy.calledWith('afterRender'));
  assert.ok(focusComponentSpy.calledOnce);
  assert.ok(focusComponentSpy.calledWith(component, inputEl));
});

test('focusComponentAfterRender() returns a promise that is resolved with the focused el', function(assert) {
  assert.expect(1);
  let returnPromise;

  component.element = inputEl;
  run(() => returnPromise = service.focusComponentAfterRender(component));

  return returnPromise
    .then((focusedEl) => assert.equal(focusedEl, inputEl));
});

test('focusComponentAfterRender() only calls focusComponent() for the last request', function(assert) {
  assert.expect(2);
  run(() => {
    service.focusComponentAfterRender(component, inputEl);
    service.focusComponentAfterRender(component, spanEl);
  });

  assert.ok(focusComponentSpy.calledOnce);
  assert.ok(focusComponentSpy.calledWith(component, spanEl));
});
