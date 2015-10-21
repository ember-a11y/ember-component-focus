import Ember from 'ember';

export default Ember.Mixin.create({
  componentFocusManager: Ember.inject.service('component-focus/focus-manager'),
  focusNode: null,

  focus(child = this.get('focusNode')) {
    this.get('componentFocusManager').focusComponent(this, child);
  },

  focusAfterRender(child = this.get('focusNode')) {
    this.get('componentFocusManager').focusComponentAfterRender(this, child);
  }
});
