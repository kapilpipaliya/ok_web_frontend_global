import { EditorState } from '../../interfaces';
import { useEditor } from '../useEditor';

export function connectEditor<C>(collect?: (state: EditorState) => C) {
  return (WrappedComponent) => {
    return (props: any) => {
      const editor = () => collect ? useEditor(collect) : useEditor();
      // SolidJS props are not spread like in React, so you need to pass them down explicitly
      return <WrappedComponent {...editor()} {...props} />;
    };
  };
}
