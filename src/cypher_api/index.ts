import { Elysia, t } from "elysia";
import { getDriver } from "./lib/dbs";
import { importAllCSV } from "./pages/BackupRestore";
import { getGraph } from "./lib/graph";

// const app = new Elysia().get("/loadData/:port", async() => {

//   query: t.Object({
//     name: t.String()
//   }),
//     params: t.Object({
//       id: t.Numeric()
//     })
//   return "Hello Elysia1lldd";
// }).listen(3100);
const app = new Elysia();

app
  .get(
    "/loadData/:port",
    async ({ params }) => {
      const port = parseInt(params.port, 10);

      if (isNaN(port)) {
        return "Invalid port"; // Early return on invalid port
      }

      try {
        const [graph, setGraph] = getGraph();
        const driver = getDriver(params.port, `bolt://0.0.0.0:${params.port}`);

        console.log("Importing all CSV data...");
        await importAllCSV({ driver }, graph, setGraph);
        console.log("Data import completed successfully.");

        return {
          message: "Data imported successfully",
          port: port,
        };
      } catch (error) {
        console.error("Error during data import:", error);
        return {
          error: "Data import failed",
          port: port,
        };
      }
    },
    {
      params: t.Object({
        port: t.String(),
      }),
    },
  )
  .listen(3100);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`);
