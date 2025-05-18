// Sample component after migration with different HTML elements and CSS-in-JS styles
// This shows the expected output of the migration script

import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function TestComponent() {
  return (
    <As as="div" css={css`
      padding: 10px;
      display: grid;
      gap: 20px;
    `}>
      <As as="h1" css={css`
        color: #1e293b;
        font-weight: 500;
        font-size: 24px;
      `}>This is a heading</As>
      <As as="span" css={css`
        color: #3b82f6;
        font-size: 16px;
      `}>This is a span with color</As>
      <As as="button" css={css`
        background-color: #3b82f6;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        border: none;
      `}>
        Click me
      </As>
      <As as="input" css={css`
        border: 1px solid #1e293b;
        width: 100%;
        padding: 7px;
        border-radius: 6px;
      `} placeholder="Enter text" />
      <As as="div" css={css`
        display: grid;
        grid-template-columns: 200px 400px;
        align-items: center;
        gap: 8px;
      `}>
        <As as="label" css={css`
          font-weight: 500;
        `}>Label:</As>
        <As as="textarea" css={css`
          border: 1px solid #1e293b;
          border-radius: 4px;
          padding: 8px;
        `}></As>
      </As>
      <As as="a" css={css`
        color: #3b82f6;
        text-decoration: none;
      `} href="#">This is a link</As>
      <As as="ul" css={css`
        list-style: none;
        padding: 0;
      `}>
        <As as="li" css={css`
          margin-bottom: 4px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 2px;
        `}>Item 1</As>
        <As as="li" css={css`
          margin-bottom: 4px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 2px;
        `}>Item 2</As>
      </As>
      <As as="div" css={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
      `}>
        <As as="div" css={css`
          width: 48%;
        `}>Left</As>
        <As as="div" css={css`
          width: 48%;
        `}>Right</As>
      </As>
      <As as="div" css={css`
        display: flex;
        align-items: center;
        gap: 12px;
      `}>
        <As as="img" css={css`
          width: 64px;
          height: 64px;
          border-radius: 32px;
          object-fit: cover;
        `} src="/placeholder.jpg" alt="Profile" />
        <As as="div" css={css`
          display: flex;
          flex-direction: column;
        `}>
          <As as="span" css={css`
            font-weight: bold;
          `}>User Name</As>
          <As as="span" css={css`
            color: #1e293b;
          `}>user@example.com</As>
        </As>
      </As>
    </As>
  );
}

export function TestDynamicClasses() {
  const isActive = true;
  const count = 5;
  
  return (
    <As as="div">
      {/* TODO: Manually convert this dynamic class */}
      <div class={`p:10 ${isActive ? 'bg:primary-50;' : 'bg:base-10;'}`}>
        Dynamic class with template literal
      </div>
      {/* TODO: Manually convert this dynamic class */}
      <div class={`flex ${count > 3 ? 'jc:flex-end;' : 'jc:flex-start;'}`}>
        Dynamic className with template literal
      </div>
      <As as="button" css={css`
        background-color: #3b82f6;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        border: none;
        margin-right: 8px;
      `}>
        Save
      </As>
      <As as="div" css={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #1e293b;
        opacity: 0.5;
      `}></As>
      <As as="div" css={css`
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: 0;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
      `}>
        Modal content
      </As>
      <As as="div" css={css`
        display: flex;
        padding: 16px;
        gap: 6px;
        border-top: 1px solid #1e293b;
        background-color: #fff;
      `}>
        Footer content
      </As>
    </As>
  );
}

export function TestBorderStyles() {
  return (
    <As as="div">
      <As as="div" css={css`
        border: 1px solid #3b82f6;
      `}>Primary border</As>
      <As as="div" css={css`
        border-left: 2px solid #37c;
      `}>Left border with specific color</As>
      <As as="div" css={css`
        border-left: none;
      `}>No left border</As>
      <As as="div" css={css`
        border-right: 1px dashed #ef4444;
      `}>Dashed right border with error color</As>
      <As as="div" css={css`
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
      `}>Box with shadow</As>
      <As as="div" css={css`
        transition: all 0.3s;
      `}>Transition element</As>
      <As as="div" css={css`
        transform: rotate(45deg);
      `}>Transformed element</As>
    </As>
  );
}

export function TestGridStyles() {
  return (
    <As as="div">
      <As as="div" css={css`
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      `}>
        <As as="div">Column 1</As>
        <As as="div">Column 2</As>
        <As as="div">Column 3</As>
      </As>
      
      <As as="div" css={css`
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        gap: 24px;
      `}>
        <As as="div">Flexible column 1</As>
        <As as="div">Flexible column 2</As>
        <As as="div">Flexible column 3</As>
      </As>
      
      <As as="div" css={css`
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
        gap: 16px;
      `}>
        Responsive grid
      </As>
    </As>
  );
} 