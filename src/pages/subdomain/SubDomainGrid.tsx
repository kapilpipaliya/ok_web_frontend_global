import type { CellContext } from "@tanstack/solid-table";

import type { DataGridStore } from "~/features/grid/DataGridContext";
import type { Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";

import { AddSubDomainForm } from "./AddSubDomainForm";

interface SubDomain {
  domain: string;
  key: string;
  name: string;
  recentActivities: Vertex<{
    action: string;
    details: string;
    timestamp: string;
  }>[];
}

export const SubDomainGrid = () => {
  const getTableData = async () => {
    const data = await getAPI(API.subdomain.listUrl);
    return {
      graph: {
        edges: {},
        vertexes: {},
      },
      result: data.subdomains.map((subdomain: Vertex<SubDomain>) => ({
        ...subdomain,
        P: {
          ...subdomain.P,
          activity:
            subdomain.P.recentActivities?.length > 0
              ? `${subdomain.P.recentActivities[0].P.action}`
              : "No activity",
          recentActivities: subdomain.P.recentActivities,
        },
      })),
    };
  };

  const getSubdomainUrl = (key: string) => {
    return `${API.auth.prepareAutoLoginUrl}?subdomain=${key}`;
  };

  const getDomainUrl = (domain: string) => {
    return `${API.auth.prepareAutoLoginUrl}?domain=${domain}`;
  };

  const SubDomain: IFormMetaData = {
    attributes: [
      {
        cell: (info: CellContext<any, unknown>) => {
          return (
            <a
              class="color:primary text-decoration:none hover:text-decoration:underline"
              href={getSubdomainUrl(info.row.original.P.key)}
              rel="noreferrer"
              target="_blank"
            >
              {info.row.original.P.key}
            </a>
          );
        },
        componentName: "Text",
        displayName: "Name",
        key: "key",
      },
      {
        cell: (info: CellContext<any, unknown>) => {
          return (
            <a
              class="color:primary text-decoration:none hover:text-decoration:underline"
              href={getDomainUrl(info.row.original.P.domain)}
              rel="noreferrer"
              target="_blank"
            >
              {info.row.original.P.domain}
            </a>
          );
        },
        componentName: "Text",
        displayName: "Domain",
        key: "domain",
      },
      {
        componentName: "Text",
        displayName: "Latest Activity",
        key: "activity",
      },
    ],
    key: "subdomains",
    title: "Subdomains",
  };

  let gridStore: DataGridStore;

  return (
    <DataGrid
      CustomAddNewButton={() => (
        <AddSubDomainForm
          onSuccess={() => {
            gridStore?.[0].fetchTableData();
          }}
        />
      )}
      formSchema={SubDomain}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="subdomains"
    />
  );
};
