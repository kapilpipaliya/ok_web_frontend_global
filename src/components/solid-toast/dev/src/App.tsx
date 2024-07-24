import { type Component, createEffect, createSignal, onCleanup } from 'solid-js';

import toast, { Toaster } from '../../src';

const makePromise = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const toss = Math.random();
      if (toss > 0.5) resolve('Successful!');
      reject('Something went wrong!');
    }, 2000);
  });
};

const App: Component = () => {
  const popBlank = () => toast('Blank Toast');
  const popSuccess = () => toast.success('Success!', { duration: Number.POSITIVE_INFINITY });
  const popError = () => toast.error('Error!', { duration: Number.POSITIVE_INFINITY });
  const popLoading = () => toast.loading('Loading...');
  const popPromise = () =>
    toast.promise(makePromise(), {
      error: (err) => <span class="promise-txt">{err}</span>,
      loading: <span class="promise-txt">Loading Promise</span>,
      success: (msg) => <span class="promise-txt">{msg}</span>,
    });
  const popCustom = () =>
    toast.success('Add Custom Styles', {
      className: 'border-2 border-orange-800',
      duration: Number.POSITIVE_INFINITY,
      iconTheme: {
        primary: '#ea580c',
        secondary: '#ffedd5',
      },
      style: {
        background: '#ffedd5',
        color: '#c2410c',
      },
    });
  const popTimer = () =>
    toast.custom(
      (t) => {
        const [life, setLife] = createSignal(100);

        createEffect(() => {
          if (t.paused) return;
          const interval = setInterval(() => {
            console.log(t.paused);
            setLife((l) => l - 0.5);
          }, 10);

          onCleanup(() => clearInterval(interval));
        });

        return (
          <div class="bg-pink-100 shadow-md px-4 py-3 overflow-hidden relative text-pink-700 rounded">
            <div class="bg-pink-200 h-full absolute top-0 left-0" style={{ width: `${life()}%` }}></div>
            <span class="relative">Timer In The Background</span>
          </div>
        );
      },
      {
        duration: 2000,
        unmountDelay: 1000,
      }
    );

  const [toggle, setToggle] = createSignal(false);

  const closeAll = () => toast.dismiss();
  return (
    <div class="px-6">
      <Toaster
        position="top-center"
        toastOptions={{
          iconTheme: toggle()
            ? {
                primary: '#ea580c',
                secondary: '#ffedd5',
              }
            : {
                primary: '#5858ff',
                secondary: '#ffedd5',
              },
        }}
      />
      <button onClick={() => setToggle((t) => !t)}>Toggle Theme</button>
      <h1>Solid Toast Examples</h1>
      <div
        style={{
          'align-items': 'flex-start',
          display: 'flex',
          'flex-direction': 'column',
          gap: '0.5rem',
        }}
      >
        <button class={'blank'} onClick={popBlank}>
          Blank Toast
        </button>
        <button class={'success'} onClick={popSuccess}>
          Success Toast
        </button>
        <button class={'error'} onClick={popError}>
          Error Toast
        </button>
        <button class={'loading'} onClick={popLoading}>
          Loading Toast
        </button>
        <button class={'promise'} onClick={popPromise}>
          Promise Toast
        </button>
        <button class={'custom'} onClick={popCustom}>
          Custom Styles
        </button>
        <button class={'timer'} onClick={popTimer}>
          Toast Timer
        </button>
        <button class={'close'} onClick={closeAll}>
          Close all toasts
        </button>
      </div>
    </div>
  );
};

export default App;
