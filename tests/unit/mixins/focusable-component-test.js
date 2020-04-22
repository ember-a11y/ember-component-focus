/* Copyright 2015 LinkedIn Corp. Licensed under the Apache License, Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import EmberObject from '@ember/object';
import FocusableComponentMixin from 'ember-component-focus/mixins/focusable-component';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | focusable component', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = EmberObject.extend(FocusableComponentMixin).create();
    let manager = {}
    manager = {
      focusComponent: sinon.spy(function() {
        return manager.focusComponent.returnVal;
      }),
      focusComponentAfterRender: sinon.spy(function() {
        return manager.focusComponentAfterRender.returnVal;
      })
    };
    manager.focusComponent.returnVal = 'foo';
    manager.focusComponentAfterRender.returnVal = 'bar';
    this.manager = manager;
    this.subject.set('componentFocusManager', manager);
  });

  ['focus', 'focusAfterRender'].forEach(function(method) {
    let managerMethod = method.replace('focus', 'focusComponent');

    test(`${method}() calls manager with itself and null by default`, async function(assert) {
      let { subject, manager } = this;
      assert.expect(2);
      subject[method]();

      assert.ok(manager[managerMethod].calledOnce);
      assert.ok(manager[managerMethod].calledWith(subject, null));
    });

    test(`${method}() calls manager with itself and value of focusNode`, async function(assert) {
      let { subject, manager } = this;
      assert.expect(1);
      subject.set('focusNode', 'foo');
      subject[method]();

      assert.ok(manager[managerMethod].calledWith(subject, 'foo'));
    });

    test(`${method}() calls manager with itself and passed child`, async function(assert) {
      let { subject, manager } = this;
      assert.expect(1);
      subject[method]('bar');

      assert.ok(manager[managerMethod].calledWith(subject, 'bar'));
    });

    test(`${method}() returns the return value of the manager call`, async function(assert) {
      let { subject, manager } = this;
      assert.expect();
      assert.equal(subject[method](), manager[managerMethod].returnVal);
    });
  });
});