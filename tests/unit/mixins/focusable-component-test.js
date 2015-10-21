import Ember from 'ember';
import FocusableComponentMixin from 'ember-component-focus/mixins/focusable-component';
import { module, test } from 'qunit';

module('Unit | Mixin | focusable component');

// Replace this with your real tests.
test('it works', function(assert) {
  var FocusableComponentObject = Ember.Object.extend(FocusableComponentMixin);
  var subject = FocusableComponentObject.create();
  assert.ok(subject);
});
