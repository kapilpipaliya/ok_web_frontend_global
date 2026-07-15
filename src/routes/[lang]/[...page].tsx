import { useParams } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { useGraph } from "~/lib/graph/context/UseGraph";
import {
  findPageMatchByUrl,
  matchUrlPattern,
} from "~/lib/graph/get/sync/entity/findPageByUrl";
import type { Vertex } from "~/lib/graph/type/vertex";
import { isSupportedLanguageCode } from "~/lib/i18n/supportedLanguageCodes";
import { PublicPageAdminFloatingButton } from "~/pages/PublicPageAdminFloatingButton";

const normalizePagePath = (path: string) => {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
};

export default function PageHandler() {
  const params = useParams();
  const [graph] = useGraph();

  const pagePath = createMemo(() => {
    const lang = params.lang;
    const page = params.page;

    if (isSupportedLanguageCode(lang)) {
      return normalizePagePath(page ?? "");
    }

    const combined = [lang, page].filter(Boolean).join("/");
    return normalizePagePath(combined);
  });

  // Resolve the page, supporting dynamic ":param" url patterns such as
  // /users/:parent/:id/:withHtmlExtension.
  const pageMatch = createMemo(() => findPageMatchByUrl(graph, pagePath()));

  // Use the matched page's url pattern (stable across param values) as the
  // cache key so navigating between concrete urls of the same dynamic page
  // reuses its metadata instead of refetching.
  const pageUrl = createMemo(() => pageMatch()?.pattern ?? pagePath());

  // Resolve dynamic ":param" values lazily via a function. Because it runs when
  // the consumer calls it (at render time), the page metaVertex / graph is
  // already populated — so params are correct during SSR too, when the client
  // graph is empty as this route first runs.
  // should use on Page Vertex fns or props functions.
  const pageContext = createMemo(() => ({
    getParams: (metaVertex?: Vertex): Record<string, string> => {
      const pattern = metaVertex?.P?.url;
      if (typeof pattern === "string" && pattern.includes(":")) {
        return matchUrlPattern(pattern, pagePath()) ?? {};
      }
      return findPageMatchByUrl(graph, pagePath())?.params ?? {};
    },
    url: pagePath(),
  }));

  return (
    <>
      <PublicPageAdminFloatingButton
        pageKey={() => pageMatch()?.vertex?.P?.key}
      />

      <Show when={pagePath()}>
        <PageViewWrapper
          context={pageContext()}
          formMetaId={pageMatch()?.vertex?.id}
          pageVertexName={"Page"}
          // pageKeyName={params.pageName}
          url={pageUrl()}
        />
      </Show>
    </>
  );
}
