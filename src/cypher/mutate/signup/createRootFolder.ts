import type { Session, Transaction } from "neo4j-driver";

import { getDefaultTheme } from "~/pages/admin_layout/getDefaultTheme";

export async function createRootFolder(
  tx: Session | Transaction,
): Promise<void> {
  const query = `
    MERGE (:Folder {key: 'Root'})
    MERGE (:Comp {key: 'Root'})
    MERGE (:Comp {key: 'ArkUI'})
    MERGE (globalSetting:GlobalSetting {key: 'Default'})
    MERGE (theme:Theme {key: 'Default'})
    SET theme.data = $theme
    MERGE (globalSetting)-[:GlobalSettingTheme]->(theme)
  `;

  const params = {
    theme: getDefaultTheme(),
  };

  try {
    await tx.run(query, params);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}
