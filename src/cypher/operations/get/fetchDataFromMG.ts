import type { Session } from "neo4j-driver";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Edge, Vertex } from "~/lib/graph/graph";
import { evalExpressionAsync } from "~/lib/expression_eval";
import type { ContextType } from "../../types/ContextType";
import type { NestedExpression } from "../../types/NestedExpression";
import { getDBSessionForSubdomain } from "../../session/getSessionForSubdomain";

export async function fetchDataFromMG(
  // ... existing implementation ...
) 