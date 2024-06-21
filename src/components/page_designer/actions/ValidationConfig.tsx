import { render } from "solid-js/web";

import { createSignal, createMemo, For,  } from "solid-js";

interface ValidationProps {
  rules: string;
}

const ValidationConfigComponent = (props) => {
    const [rules, setRules] = createSignal(props.rules);

    const parsedRules = createMemo(() => {
      return rules().split('|').map((rule) => {
        const [ruleName, ...ruleValues] = rule.includes(':') ? rule.split(':') : [rule, 'true'];
        return { ruleName, ruleValues };
      });
    });
  
    const handleRuleChange = (index: number, subIndex: number, value: string) => {
      const updatedRules = parsedRules().map((rule, i) => {
        if (i === index) {
          const updatedRuleValues = rule.ruleValues.map((val, j) => {
            if (j === subIndex) {
              return value;
            }
            return val;
          });
          return { ...rule, ruleValues: updatedRuleValues };
        }
        return rule;
      });
      setRules(updatedRules.map(rule => `${rule.ruleName}:${rule.ruleValues.join(':')}`).join('|'));
    };
  
    return (
      <div>
        <For each={parsedRules()}>
          {(rule, index) => (
            <div>
              <label>{rule.ruleName}:</label>
              {rule.ruleName === 'required' || rule.ruleName === 'email' ? (
                <input
                  type="checkbox"
                  checked={rule.ruleValues[0] === 'true'}
                  onChange={(e) => handleRuleChange(index(), 0, (e.target as HTMLInputElement).checked ? 'true' : 'false')}
                />
              ) : (
                <For each={rule.ruleValues}>
                  {(value, subIndex) => (
                    <div>
                      <input
                        type="text"
                        value={value}
                        onInput={(e) => handleRuleChange(index(), subIndex(), (e.target as HTMLInputElement).value)}
                      />
                    </div>
                  )}
                </For>
              )}
            </div>
          )}
        </For>
      </div>
    );
  };

function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    <div>
      <h1>Form Validation Configuration</h1>
      <ValidationComponent rules="required:true|email:true|minLength:5|maxLength:10|regex:^\\d{3}-\\d{2}-\\d{4}$:SSN format required,regex:^[A-Za-z]+$:Letters only" />
    </div>
  );
}

render(() => <Counter />, document.getElementById("app")!);
