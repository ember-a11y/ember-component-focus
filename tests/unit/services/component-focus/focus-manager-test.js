import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

var component,
    focusSpy,
    inputEl,
    service,
    spanEl;

moduleFor('service:component-focus/focus-manager', 'Unit | Service | component focus/focus manager', {
  beforeEach() {
    service = this.subject();

    inputEl = document.createElement('input');
    focusSpy = sinon.spy(inputEl, 'focus');
    spanEl = document.createElement('span');
    [inputEl, spanEl].forEach((el) => document.body.appendChild(el));

    component = {};
  },

  afterEach() {
    [inputEl, spanEl].forEach((el) => document.body.removeChild(el));
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

  assert.throws(() => service.focusComponent(component, '#foo'));
});
