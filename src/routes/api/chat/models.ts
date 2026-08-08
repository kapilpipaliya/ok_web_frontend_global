// Interface for model tree node
interface ModelNode {
  id: string;
  label: string;
  children?: ModelNode[];
}

// Interface for OpenRouter API response
interface OpenRouterModelsResponse {
  data: Array<{
    id?: string;
    name?: string;
  }>;
}

// Cache for models data with timestamp
let modelsCache: {
  data: ModelNode;
  timestamp: number;
} | null = null;

/**
 * Builds a tree structure from models data grouped by provider
 */
function buildModelsTree(data: OpenRouterModelsResponse): ModelNode {
  // Create root node
  const tree: ModelNode = {
    id: "models",
    label: "Models",
    children: [],
  };

  // Map to group models by provider (id prefix before "/")
  const groupMap: Record<string, ModelNode[]> = {};

  // Process each model in the data
  if (data.data && Array.isArray(data.data)) {
    for (const item of data.data) {
      const modelId = item.id || "";
      if (!modelId) {
        continue;
      }

      const slashIndex = modelId.indexOf("/");
      const group =
        slashIndex > 0 ? modelId.slice(0, slashIndex) : "Other";
      const modelLabel = item.name || modelId;

      if (!groupMap[group]) {
        groupMap[group] = [];
      }

      // Check if model already exists in this group
      let exists = false;
      for (const m of groupMap[group]) {
        if (m.id === modelId) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        groupMap[group].push({
          id: modelId,
          label: modelLabel,
        });
      }
    }
  }

  // Add groups to tree (sorted by label for stable UI)
  const groupNames = Object.keys(groupMap).sort((a, b) =>
    a.localeCompare(b),
  );
  for (const groupName of groupNames) {
    const models = groupMap[groupName].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
    if (models.length > 0) {
      tree.children?.push({
        id: `group-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
        label: groupName,
        children: models,
      });
    }
  }

  return tree;
}

// GET endpoint to fetch model options tree
export const GET = async () => {
  try {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check if cache exists and is less than a day old
    if (modelsCache && now - modelsCache.timestamp < ONE_DAY) {
      return new Response(JSON.stringify(modelsCache.data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=86400", // 1 day in seconds
        },
      });
    }

    // Fetch new data from OpenRouter public models API
    const response = await fetch("https://openrouter.ai/api/v1/models");

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const rawData = (await response.json()) as OpenRouterModelsResponse;
    const treeData = buildModelsTree(rawData);

    // Update cache
    modelsCache = {
      data: treeData,
      timestamp: now,
    };

    return new Response(JSON.stringify(treeData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=86400", // 1 day in seconds
      },
    });
  } catch (error) {
    console.error("Error fetching models tree:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch models data",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
