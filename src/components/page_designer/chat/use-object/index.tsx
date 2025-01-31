import { experimental_useObject as useObject } from '@ai-sdk/solid';
import { notificationSchema } from '../../../../routes/api/use-object/schema';
import { For, Show } from 'solid-js';

export function UseObject() {
  const { submit, isLoading, object, stop, error } = useObject({
    api: '/api/use-object',
    schema: notificationSchema,
  });

  return (
    <div class="display:flex flex-direction:column align-items:center min-height:100vh padding:16px margin:16px">
      <button
        class="padding:16px|8px margin-top:16px color:white background:rgb(59,130,246) border-radius:6px disabled:background:rgb(191,219,254)"
        onClick={async () => {
          submit('Messages during finals week.');
        }}
        disabled={isLoading()}
      >
        Generate notifications
      </button>

      <Show when={error()}>
        {error => (
          <div class="margin-top:16px color:rgb(239,68,68)">
            An error occurred. {error()?.message}
          </div>
        )}
      </Show>

      <Show when={isLoading()}>
        <div class="margin-top:16px color:rgb(107,114,128)">
          <div>Loading...</div>
          <button
            type="button"
            class="padding:16px|8px margin-top:16px color:rgb(59,130,246) border:1px|solid|rgb(59,130,246) border-radius:6px"
            onClick={() => stop()}
          >
            STOP
          </button>
        </div>
      </Show>

      <div class="display:flex flex-direction:column gap:16px margin-top:16px">
        <For each={object()?.notifications}>
          {(notification, index) => (
            <div
              class="display:flex align-items:start gap:16px padding:16px background:rgb(243,244,246) border-radius:6px dark:background:rgb(31,41,55)"
              data-index={index()}
            >
              <div class="flex:1 space-y:4px">
                <div class="display:flex align-items:center justify-content:space-between">
                  <p class="font-weight:500 dark:color:white">
                    {notification?.name}
                  </p>
                  <p class="font-size:14px color:rgb(107,114,128) dark:color:rgb(156,163,175)">
                    {notification?.minutesAgo}
                    {notification?.minutesAgo != null ? ' minutes ago' : ''}
                  </p>
                </div>
                <p class="color:rgb(55,65,81) dark:color:rgb(209,213,219)">
                  {notification?.message}
                </p>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
