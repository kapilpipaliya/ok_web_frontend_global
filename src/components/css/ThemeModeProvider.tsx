import {
  createContext,
  useContext,
  onCleanup,
  createEffect,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";
import ThemeMode from "theme-mode";

// Creating context for ThemeMode
const ThemeModeContext = createContext({});

// Custom hook to use ThemeMode context
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
      throw new Error("useThemeMode must be used within a ThemeModeProvider");
    }
  return context;
}

export function ThemeModeProvider(props) {
  const [themeMode, setThemeMode] = createSignal(
    new ThemeMode(props, props.host)
  );
  const [proxyThemeMode, setProxyThemeMode] = createStore(
    createProxy(themeMode())
  );

  function createProxy(themeMode) {
    return new Proxy(themeMode, {
      set: (target, prop, value) => {
        const newProxy = createProxy(themeMode);
        setProxyThemeMode(newProxy);
        return Reflect.set(target, prop, value);
      },
    });
  }

  // Effect for initializing and cleaning up the theme mode
//   createEffect(() => {
//     const currentThemeMode = proxyThemeMode;
//     currentThemeMode.init();
//     currentThemeMode.host?.addEventListener(
//       "themeModeChange",
//       onThemeModeChange,
//       { passive: true }
//     );

//     onCleanup(() => {
//       currentThemeMode.destroy();
//       currentThemeMode.host?.removeEventListener(
//         "themeModeChange",
//         onThemeModeChange
//       );
//     });
//   });
createEffect(() => {
  // Initialize theme mode
  themeMode().init();

  // Assuming the host is a part of the themeMode object and doesn't need to be stored in a SolidJS store
//   const host = themeMode().host;
//   if (host) {
//     const handleThemeModeChange = () => {
//       // If you need to update something in the store in response to this event,
//       // you would call setProxyThemeMode or another store setter function here.
//       console.log("Theme mode changed");
//       // This is just an example. Replace it with actual logic as needed.
//     };

//     host.addEventListener("themeModeChange", handleThemeModeChange, {
//       passive: true,
//     });

//     onCleanup(() => {
//       host.removeEventListener("themeModeChange", handleThemeModeChange);
//     });
//   }
});


  // Handler for theme mode change
  const onThemeModeChange = () => {
    setProxyThemeMode(createProxy(themeMode()));
  };

  return (
    <ThemeModeContext.Provider value={proxyThemeMode}>
      {props.children}
    </ThemeModeContext.Provider>
  );
}
