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

var manager,
    subject;

module('Unit | Mixin | focusable component', {
  beforeEach() {
    subject = EmberObject.extend(FocusableComponentMixin).create();

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

    subject.set('componentFocusManager', manager);
  }
});

['focus', 'focusAfterRender'].forEach(function(method) {
  var managerMethod = method.replace('focus', 'focusComponent');

  test(`${method}() calls manager with itself and null by default`, function(assert) {
    assert.expect(2);
    subject[method]();

    assert.ok(manager[managerMethod].calledOnce);
    assert.ok(manager[managerMethod].calledWith(subject, null));
  });

  test(`${method}() calls manager with itself and value of focusNode`, function(assert) {
    assert.expect(1);
    subject.set('focusNode', 'foo');
    subject[method]();

    assert.ok(manager[managerMethod].calledWith(subject, 'foo'));
  });

  test(`${method}() calls manager with itself and passed child`, function(assert) {
    assert.expect(1);
    subject[method]('bar');

    assert.ok(manager[managerMethod].calledWith(subject, 'bar'));
  });

  test(`${method}() returns the return value of the manager call`, function(assert) {
    assert.expect();
    assert.equal(subject[method](), manager[managerMethod].returnVal);
  });
});
