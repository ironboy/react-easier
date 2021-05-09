export const ElseIf = props => props.children;

export const Else = props => props.children;

export const If = props => {
  let _elseIf = [props.children.find(x => [ElseIf, Else].includes(x.type) && (x.props.c || x.type === Else) && !props.c)];
  let _if = props.children.filter(x => ![ElseIf, Else].includes(x.type));
  return (props.c ? _if : _elseIf) || null;
}