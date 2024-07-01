import ReactDOM from "react-dom";

// @ts-expect-error - untyped output file
import JsxParser from "../dist/umd/react-jsx-parser.min";

ReactDOM.render(
  <JsxParser
    autoCloseVoidElements
    jsx={`
			<img src="http://placekitten.com/300/5000">{[1].map(x=>x)}
			<div className="foo">bar</div>
		`}
    onError={console.error}
    showWarnings
  />,
  document.querySelector("#root"),
);
