import { DataGrid } from "~/components/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { IFormMetaData } from "~/lib/meta/FormMetadataType";

interface SubDomain {
  domain: string;
  latestActivity?: {
    action: string;
    details: string;
  };
  name: string;
}

export const SubDomainGrid = () => {
  const getTableData = async () => {
    const data = await getAPI(API.getSubDomainsUrl);
    return {
      graph: {
        edges: {},
        vertexes: {}
      },
      result: data.subdomains.map((subdomain: SubDomain) => ({
        id: subdomain.name,
        P: {
          ...subdomain,
          activity: subdomain.latestActivity ? 
            `${subdomain.latestActivity.action} - ${subdomain.latestActivity.details}` : 
            'No activity'
        }
      }))
    };
  };

  const SubDomain: IFormMetaData = {
    attributes: [
      {
        componentName: "Text",
        displayName: "Name",
        key: "key",
      },
      {
        componentName: "Text",
        displayName: "Domain",
        key: "domain", 
      },
      {
        componentName: "Text",
        displayName: "Latest Activity",
        key: "activity",
      }
    ],
    key: "subdomains",
    title: "Subdomains"
  };
  return (
    <DataGrid
      formSchema={SubDomain}
      getTableData={getTableData}
      isShowPagination={true}
      tableId="subdomains"
    />
  );
}; 