// Sample component with different HTML elements and class styles
// This is for testing the migration script

export function TestComponent() {
  return (
    <div class="p:10 grid gap:20">
      <h1 class="color:base-50 font-weight:500 font:24">This is a heading</h1>
      <span class="color:primary-60 font:16">This is a span with color</span>
      <button class="bg:primary-50 fg:base-5 p:8|16 r:4 cursor:pointer border:none">
        Click me
      </button>
      <input class="border:1px|solid|base w:100% p:7 r:6" placeholder="Enter text" />
      <div class="grid grid-template-cols:200px|400px ai:center gap:8">
        <label class="font-weight:500">Label:</label>
        <textarea class="border:1px|solid|base-20 r:4 p:8"></textarea>
      </div>
      <a class="color:primary text-decoration:none" href="#">This is a link</a>
      <ul class="list-style:none p:0">
        <li class="mb:4 border-bottom:1px|solid|base-10 pb:2">Item 1</li>
        <li class="mb:4 border-bottom:1px|solid|base-10 pb:2">Item 2</li>
      </ul>
      <div class="flex jc:space-between ai:center">
        <div class="w:48%">Left</div>
        <div class="w:48%">Right</div>
      </div>
      <div class="flex ai:center gap:12">
        <img class="w:64 h:64 r:32 object-fit:cover" src="/placeholder.jpg" alt="Profile" />
        <div class="flex flex-direction:column">
          <span class="font-weight:bold">User Name</span>
          <span class="color:base-60">user@example.com</span>
        </div>
      </div>
    </div>
  );
}

export function TestDynamicClasses() {
  const isActive = true;
  const count = 5;
  
  return (
    <div>
      <div class={`p:10 ${isActive ? 'bg:primary-50' : 'bg:base-10'}`}>
        Dynamic class with template literal
      </div>
      <div class={`flex ${count > 3 ? 'jc:flex-end' : 'jc:flex-start'}`}>
        Dynamic className with template literal
      </div>
      <button class="bg:primary-50 fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8">
        Save
      </button>
      <div class="position:fixed top:0 left:0 w:100% h:100% bg:base-10 opacity:0.5"></div>
      <div class="border:1px|solid|base-20 r:4 p:0 position:fixed top:50% left:50% transform:translate(-50%,-50%) bg:base-5">
        Modal content
      </div>
      <div class="display:flex p:16 gap:6 border-top:1px|solid|base-20 bg:base-5">
        Footer content
      </div>
    </div>
  );
}

export function TestBorderStyles() {
  return (
    <div>
      <div class="border:1px|solid|primary-30">Primary border</div>
      <div class="bl:2px|solid|#37c">Left border with specific color</div>
      <div class="bl:none">No left border</div>
      <div class="br:1px|dashed|error">Dashed right border with error color</div>
      <div class="box-shadow:0|2px|5px|rgba(0,0,0,0.5)">Box with shadow</div>
      <div class="transition:all|0.3s">Transition element</div>
      <div class="transform:rotate(45deg)">Transformed element</div>
    </div>
  );
}

export function TestGridStyles() {
  return (
    <div>
      <div class="grid grid-cols:3 gap:16">
        <div>Column 1</div>
        <div>Column 2</div>
        <div>Column 3</div>
      </div>
      
      <div class="grid grid-template-cols:1fr|2fr|1fr gap:24">
        <div>Flexible column 1</div>
        <div>Flexible column 2</div>
        <div>Flexible column 3</div>
      </div>
      
      <div class="grid grid-template-cols:repeat(auto-fill,minmax(200px,1fr)) gap:16">
        Responsive grid
      </div>
    </div>
  );
} 