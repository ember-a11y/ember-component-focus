import Ember from 'ember';
import FocusableComponentMixin from 'ember-component-focus/mixins/focusable-component';
import sinon from 'sinon';
import { module, test } from 'qunit';

var manager,
    subject;

module('Unit | Mixin | focusable component', {
  beforeEach() {
    subject = Ember.Object.extend(FocusableComponentMixin).create();

    manager = {
      focusComponent: sinon.spy(),
      focusComponentAfterRender: sinon.spy()
    };

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
});
