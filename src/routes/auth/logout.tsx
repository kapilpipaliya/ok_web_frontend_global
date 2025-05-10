import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { useGraph } from "~/lib/graph/GraphContext";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export default function Logout() {
  const navigate = useNavigate();
  const [graph, setGraph] = useGraph();

  onMount(async () => {
    try {
      // Create a minimum 2-second delay
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2000));

      // Execute API call and minimum delay in parallel
      await Promise.all([postAPI(API.auth.logOutUrl, {}), minimumDelay]);

      // Delete member vertex from the graph
      deleteVertex(0, "member", graph, setGraph);

      // Navigate to login page with replaced history
      navigate(API.urls.admin.login, { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if there's an error, navigate to login
      navigate(API.urls.admin.login, { replace: true });
    }
  });

  // Return a nicer looking loading component
  return (
    <As
      as="div"
      css={css`
        min-height: 100vh;
        background-color: \${args.theme.var.color.base_20};
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <As
        as="div"
        css={css`
          background-color: \${args.theme.var.color.base_10};
          padding: 32px;
          border-radius: 8px;
          box-shadow: 1px 2px 3px \${args.theme.var.color.primary};
          text-align: center;
        `}
      >
        <As
          as="h2"
          css={css`
            margin-bottom: 16px;
            color: \${args.theme.var.color.base};
          `}
        >
          Logging out...
        </As>
        <As
          as="div"
          css={[
            css`
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid \${args.theme.var.color.base_30};
            border-radius: 50%;
            border-top-color: \${args.theme.var.color.primary};
            animation: spinner 1s ease-in-out infinite;
          `,
            `@keyframes spinner {
              to {transform: rotate(360deg);}
            }`,
          ]}
        />
      </As>
    </As>
  );
}
/*
    props.onClose();

    await showLoadingToast({
      loadMessage: "Logging Out...",
      onSuccess: (value) => {
        if (value?.message != null) {
          navigate(API.urls.admin.login);
        }
      },
      promise: postAPI(API.auth.logOutUrl, {}),
      successMessage: "Log Out Successfully",
    });

    deleteVertex(0, "member", graph, setGraph);
*/
