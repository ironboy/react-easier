# react-easier

React-easier is number of extra hooks that makes React easier to use when it comes to lists, states (in and across components), forms and fetching data.

**Note:** Continuously tested with [Vite](https://vitejs.dev) as a React development framework, not with [CRA](https://create-react-app.dev) (Create React App). Why? Because CRA is growing old and tired.

**Note:** In the documentation we'll call your top-level component **App** (you might have named it differently).

## All the hooks
You will probably not need to import all the hooks from **react-easier** at once, but if you do (and for reference) here they are

```js
import {
  useAutoKeys,
  useStates,
  useFetch,
  useDebug,
  useOnMount,
  useOnCleanup
} from 'react-easier';
```

## lists: useAutoKey
React [requires you to set a key for each jsx element / item in a list](https://beta.reactjs.org/learn/rendering-lists#keeping-list-items-in-order-with-key). And for good reason: This makes the rendering of lists faster and more efficient.

The hook **useAutoKeys** automatically sets this key, so you *don't have to*. Only call it once for a complete application, at the top of your **App** component:

```js
import {useAutoKeys} from 'react-easier';
// In the App component:
useAutoKeys();
```

### customize
These are the default arguments values used if you call **useAutoKeys** with no arguments.

You can adjust them if you want to. 

```js
useAutoKeys(
  possibleKeys = ['_id', 'id', /.*Id$/, /.*_id$/], 
  useIndexIfNoMatchingKey = true
);
```

*Note:* 
* The default setting matches if an item has one of the properties **_id** (MongoDB etc.), **id**, **someTableId** or **some_table_id** (SQL et al.).
* As long as the primary id column comes before any foreign key columns, you'll be fine with the default settings.

### Example 1

#### Vanilla React, without useAutoKeys

``` jsx
export default function App() {

  let people = [
    { userId: 1, name: 'Anna' },
    { userId: 2, name: 'Boris' },
    { userId: 5, name: 'Cecilia' },
    { userId: 8, name: 'David' }
  ];

  return (
    <div className="App">
      {people.map(({userId, name}) => 
        // p elements have keys that we manually set to userId
        <p key={userId}>{name}</p>
      )}
    </div>
  )
}
```

#### React with useAutoKeys

``` jsx
import {useAutoKeys} from 'react-easier';

export default function App() {

  useAutoKeys(); // once for the whole application

  let people = [
    { userId: 1, name: 'Anna' },
    { userId: 2, name: 'Boris' },
    { userId: 5, name: 'Cecilia' },
    { userId: 8, name: 'David' }
  ];

  return (
    <div className="App">
      {people.map(({name}) => 
        // p elements will automatically get keys based on userId
        <p>{name}</p> 
      )}
    </div>
  )
}
```

**Note:** Although what you save in less boiler-plate code per list might seem like a *small* win, not having to think about *keys* at all simply make things easier!

## state: useStates - for states in *one* component

When you work with state variables in vanilla React, you can choose between having each variable  (primitive value) declared via the **useState** hook, or just use **useState** once per component where you need states, but let it hold a complete object with several properties (values). The latter solution looks something like this:

### React, without useStates - "vanilla" useState hook

```jsx
import { useState } from 'react';

export default function Component() {

  // a state variable consisting of an object
  const [state, setState] = useState({
    counter1: 1,
    counter2: 'I'
  });

  // a setter for individual properties in the state
  const set = (key, value) => setState({ ...s, [key]: value });

  return <>
    <h2>Component</h2>
    <button onClick={() => set('counter1', state.counter1 + 1)}>
      Counter: {state.counter1}
    </button>
    <button onClick={() => set('counter2', state.counter2 + 'I')}>
      Another counter: {state.counter2}
    </button>
  </>;
}
```

### React with useStates

The react-easier hook **useStates** is similar to  **useState**, but omits the need for a separate setter. Instead you just assign new values to properties:

```jsx
import { useStates } from 'react-easier';

export default function Component() {

  // a state variable consisting of an object
  const s = useStates({
    counter1: 1,
    counter2: 'I'
  });

  return <>
    <h2>Component</h2>
    <button onClick={() => s.counter1++}>
      Counter: {s.counter1}
    </button>
    <button onClick={() => s.counter2 += 'I'}>
      Another counter: {s.counter2}
    </button>
  </>;
}
```

So, **useStates** is a bit opionated: 
* The syntax used is based on the assumption that it is more natural for developers to directly assign a new value to a property/variable, than to use setters.
* Does this mean that we leave the behind the idea of *immutability*? No, behind the scenes each change creates a new object and stores as the new state (i.e. the useStates 'engine' follows the principles of immutability).
* From your end thing are simple: You just assign new values to properties in the state, and React reacts and rerenders the view.

### Automatic console logs of the state and state changes
You can get detailed automatic debugging/logging of each state change that occurs when using **useStates**. Simply call **useDebug()** once 

Calling the hook **useDebug** turns the logging on. Only call it once for a complete application, at the top of your **App** component:

```js
import {useDebug} from 'react-easier';
// In the App component:
useDebug();
```


### Manual console logs of the state
When you *console.log* a state kept by **useStates** (or any object or array from that state) you will see that it is actually a javascript proxy object, to *console.log* the 'raw' object - simply add '._' after it:

```js
console.log(s._);
console.log(s.someObject._);
console.log(s.someArray._);
```

## state: useStates - for states across components
When you want to share states across components in vanilla React you can use **createContext** in combination with **useContext** and **useState**... It actually involves a fair amount of boiler plate code to set this up correctly in Vanilla React... So don't bother! With **useStates** it becomes simple to share a state across components.

### In the topmost component where you need the state

You declare the initial values of the state in the topmost component where you need the state.

You also declare a *namespace* (that can beany string you want):

```js
import {useStates} from 'react-easier';

export default function MyComponent(){

  const m = useStates('main', {
    greeting: 'Hello',
    regForm: {
      email: '',
      password: ''
    }
  });

}
```

You can now reach this state from any other sub component, by refering to the same namespace:

```js
import {useStates} from 'react-easier';

export default function SubComponent(){

  const m = useStates('main');

  // Console log the state
  console.log(m._);

  // Make a change to the state
  m.greeting = 'Hi there!';

}
```

It's really this simple! 😃

## Connecting state variables to a form
The React documentation calls this concept *controlled components*. It might seem to be a strange name until you realize that in this case they count html elements as components. A controlled component is 'two-way-bound' to a state. When the user makes a change to the value of the input element the state changes. And the state controls the value of the input element...

### Vanilla React

```jsx
import {useState} from 'react';


export default function MyComponent {

  let [firstName, setFirstName = useState('');

  return <>
    <form>
      <input type="text" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)}>
    </form>
  </>;
}
```

#### React with useStates

The same thing can be accomplished with less code with **useStates** from react-easier:


```jsx
import {useStates} from 'react-easier';


export default function MyComponent {

  let s = useStates({firstName: ''});

  return <>
    <form>
      <input type="text" {...s.bind('firstName')}>
    </form>
  </>;
}
```

**Note:** You can also bind input elements to sub-objects in the state:

```jsx
return <><input type="email" {...s.regForm.bind('email')}></>
```

The *bind method* of **useStates** works fine with any type of input element *except multi-choice selects*.


#### How to use with selects
```jsx
return <><select {...s.bind('favoriteColor')}>
  <option>Red</option>
  <option>Green</option>
  <option>Blue</option>
</select></>
```

#### How to use with radio buttons
Provide one value per radio button as a second argument.
```jsx
return <>
  <label>Red<input type="radio" {...s.bind('favoriteColor', 'Red')} /></label>
  <label>Green<input type="radio" {...s.bind('favoriteColor', 'Green')} /></label>
  <label>Blue<input type="radio" {...s.bind('favoriteColor', 'Blue')} /></label>
</>
```

#### How to use with checkboxes
Provide the value when the box is checked as a second argument and the value when the box is is unchecked as a third argument.

```jsx
return <>
   <label>Are you cool?<input type="checkbox" {...s.bind('isCool', true, false)}></input></label>
</>
```

## Fetching data with useFetch
Using Vanilla React, with no libraries, you will probably resort to calling **fetch** inside a useEffect (and inside a anonymous async function inside useEffect for that matter). Further more the fetch will be done twice if you are running in React StrictMode, as you should during development. This is... inconvenient.

So **react-easier** provides the hook **useFetch** to simplify things (and only load the data once in StrictMode):

```jsx
import {useStates, useFetch} from 'react-easier';

export default function MyComponent(){

  const s = useStates('main', {
    people: useFetch('/api/people'), // json
    intro: useFetch('/intro.txt', 'text') // text
  });

}
```

The hook **useFetch** does an async fetch of data (by default json data, but you can choose to fetch text if you want to).

The initial value of **s.people** and **s.intro** in the example above will be an empty array. This plays nicely with jsx. As soon as the data is fetched your array will fill up. In the case of '/api/people' with an array of objects from your REST api. In the case of intro.txt with a single element with the text from the file.

It's really this simple! 😃

### useOnMount
For clearity in your code you can use **useOnMount**(function) instead of **useEffect**(function, []). Another advantage of this is that you can provide an async function if you want to.

```js
import {useOnMount} from 'react-easier';

export default MyComponent {

  useOnMount(async () => {
    // do stuff on mount of the component
    // can be an async function if you want to
  })

  return null; /* or some jsx */

}
```

### useOnMount
For clearity in your code you can use **useOnCleanup**(function) instead of **useEffect**(() => function, []).  Another advantage of this is that you can provide an async function if you want to.

```js
import {useOnCleanup} from 'react-easier';

export default MyComponent {

  useOnCleanup(async () => {
    // do stuff on unmount of your component
    // can be an async function if you want to
  })

  return null; /* or some jsx */

}
```

## Have fun and be productive!
Have fun and be productive with **react-easier**. It has saved me (the author, [ironboy](https://github.com/ironboy)) a lot of lines of code in React-based projects, and have increased the readability of the code my dev teams output. Hopefully it will do the same for you!