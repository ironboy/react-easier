# react-easier
**react-easier** adds React tools in the form of 

* hooks, 
* HOC:s (Higher Order Components) 
* and Components.

Together they make using React a lot easier when it comes to:
* creating *global stores* (via context)

* creating *local reactive state variables* 
* writing Vue-like loops for components.
* writing Vue-like **If-ElseIf-Else**-clauses 
* and doing easy **binds** of input fields to both global stores and local state variables.

**Note:** Great care has been taken for the library to work together with React Dev Tools in a good way!

## Example/demo
This example shows off all the different exports from **react-easier**:

* withContext
* withLoop
* useStates
* useNamedContext
* If, ElseIf, Else

### Loops
You create components that are easy to loop by wrapping your components in the **HOC** *withLoop*.

In the example we use this like:
```jsx
<Person loop={g.persons} />
```

This will set the key for each Person in the loop to the index number of *g.persons*.

If you have data fetched from a database you probably have id:s of each person - in that case you would specify a **loopKey** (probably **id** for SQL-databases and **_id** for MongoDB):

```jsx
<Person loop={g.persons} loopKey="_id">
```

### How to install
The demo is built with React Vite, but the same code works equally well with Create-React-App.

1. [Download this demo example](https://github.com/ironboy/react-easier/raw/main/demo-react-easier.zip).
2. Unzip
3. Run **npm install**
4. Run **npm run dev** to start.


### src/App.jsx

```jsx
import React from 'react';
import { withContext, useStates, useNamedContext, If, Else } from 'react-easier';
import Person from './Person.jsx';

// Export the component with a named context
export default withContext(
  'global',
  {
    hiGreeting: 'Hi',
    byeGreeting: 'Bye',
    sayHi: true,
    persons: []
  },
  App
);

function App() {

  // States (from context and local)
  const g = useNamedContext('global');
  const s = useStates({
    count: 0,
    name: '',
    age: ''
  });

  // Add a person
  function addPerson(e) {
    e.preventDefault();
    g.persons = [...g.persons, { name: s.name, age: +s.age }];
    s.name = '';
    s.age = '';
  }

  return (
    <div className="App">

      <div>
        <h3>A button<br />that<br />wants to be<br />clicked</h3>
        <button onClick={e => s.count++}>
          I've been clicked<br />{s.count} times
      </button>
      </div>

      <div>
        <h3>Greetings</h3>
        <label>
          How to say Hi:
        <input {...g.bind('hiGreeting')} type="text" />
        </label>
        <label>
          How to say Bye:
        <input {...g.bind('byeGreeting')} type="text" />
        </label>
        <p>Greeting to use:</p>
        <label>
          <input {...g.bind('sayHi', true)} type="radio"></input>
        "{g.hiGreeting}"
      </label>
        <label>
          <input {...g.bind('sayHi', false)} type="radio"></input>
        "{g.byeGreeting}""
      </label>
      </div>

      <div>
        <form onSubmit={addPerson}>
          <h3>Add a person</h3>
          <input {...s.bind('name')} type="text" placeholder="Name" />
          <input {...s.bind('age')} type="number" min="0" max="120" placeholder="Age" />
          <input type="submit" value="Add"></input>
        </form>
      </div>

      <div className="persons">
        <h3>Persons</h3>
        <If c={g.persons.length}>
          <Person loop={g.persons} />
          <Else>
            No persons created yet...
          </Else>
        </If>
      </div>

    </div>
  );
};
```

### src/Person.jsx

```jsx
import React from 'react';
import { withLoop, useNamedContext, If, ElseIf, Else, } from 'react-easier';

export default withLoop(Person);

function Person(props) {

  let { name, age } = props;
  let g = useNamedContext('global');

  return (
    <div className="Person">
      <h4>{name}</h4>
      <p>{name} is {age} years old. That's
        <If c={age < 30}> young
          <ElseIf c={age < 50}> rather young</ElseIf>
          <ElseIf c={age < 70}> not so old</ElseIf>
          <Else> old</Else>
        </If>
      .</p>
      <p><i>
        <If c={g.sayHi}>
          {g.hiGreeting}! I'm {name} and I'm {age} years old!
          <Else>{g.byeGreeting}! from {name}...</Else>
        </If>
      </i></p>
    </div>
  );
}
```

