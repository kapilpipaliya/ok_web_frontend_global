import { useParams } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
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

  const pageVertex = createMemo(() => {
    return findVertexByLabelAndUniqueId(graph, "Page", "url", pagePath());
  });

  return (
    <>
      <PublicPageAdminFloatingButton
        pageKey={() => pageVertex()?.P?.key}
      />

      <Show when={pagePath()}>
        <PageViewWrapper
          formMetaId={pageVertex()?.id}
          pageVertexName={"Page"}
          // pageKeyName={params.pageName}
          url={pagePath()}
        />
      </Show>
    </>
  );
}
