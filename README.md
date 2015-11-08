# Ember Component Focus

This [ember-cli][ember-cli] addon provides a mixin for adding methods to your
Ember components that help you manage the currently focused element.

Proper focus management is essential for making dynamic single-page applications
accessible to screen readers and other assistive technologies. For example, if
you're writing a todo app, you might want to move focus from a creation form to
a new todo item when the user submits the form. This addon makes it easy to move
focus within a component by handling issues like setting `tabindex` on elements
that aren't focusable by default and removing `tabindex="-1"` on blur.

[ember-cli]: http://www.ember-cli.com/

## Installation

Run the following inside your Ember application to install this addon.

```bash
ember install ember-component-focus
```

Or you can install directly from npm:

```bash
npm install --save ember-component-focus
```

## Usage

To use the focus management methods in your component, you need to mix-in
the `focusable-component` mixin:

```javascript
// app/components/your-component.js
import Ember from 'ember';
import FocusableComponent from 'ember-component-focus/mixins/focusable-component';

export default Ember.Component.extend(FocusableComponent, {
  // Your component's definition...
});
```

The mixin adds one property and two methods to your component.

### focusNode Property

The `focusNode` property allows you to specify the selector of one of your
component's child elements that you want to receive focus when one of the
methods added by the mixin is invoked. It defaults to `null`, so override it in
your component's definition if you want to set a default element for focus.


### focus() Method

The `focus()` method sets focus on a child element immediately. The element to
focus defaults to the value of `focusNode`, but you can also pass in the child
element to focus or a string selector for the element to focus. If you don't
pass anything and `focusNode` is `null`, focus will move to the component's top
element (`component.element`). This method returns the element that ended up
receiving focus.

#### Example

```javascript
// When this component is first inserted into the DOM, it will set focus to its
// header element.
export default Ember.Component.extend(FocusableComponent, {
  focusNode: 'h1',

  // ...

  didInsertElement() {
    this.focus();
  },

  // ...
});
```

### focusAfterRender() method

This method works just like focus, accepting the same arguments, but it
schedules setting focus for after the next render cycle (using the [Ember Run
Loop's][run-loop] `afterRender` queue). This method is most useful for when you
want to move focus to a child element that is not yet rendered but will be after
the next render cycle. Simply pass it the selector of the element to be
rendered. It returns a promise that will be resolved with the element that ends
up receiving focus.

#### Example

```javascript
// This component will focus the element for a new todo after the model object
// for that todo has been saved and the element representing the todo has
rendered.
export default Ember.Component.extend(FocusableComponent, {
  actions: {
    addTodo() {
      let todoName = this.get('todoName');
      let todo = this.store.createRecord('Todo', {name: todoName});
      todo.save().then(() => this.focusAfterRender(`[data-id=todo-${todo.id}]`));
    }
  },

  // ...
});
```

[run-loop]: http://emberjs.com/api/classes/Ember.run.html
