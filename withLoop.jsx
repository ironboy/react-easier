import React from 'react';

export default SubComponent => {
  return function WithLoop(p) {
    let p2 = { ...p };
    delete p2.loop;
    delete p2.loopKey;
    return (p.loop || [{ ...p }]).map((x, i) =>
      <React.Fragment key={x[p.loopKey] || i}>
        <SubComponent key={x[p.loopKey] || i} {...{ ...p2, ...x }} />
      </React.Fragment>);
  }
}