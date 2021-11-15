import { listAllFunds } from "./../index";

// import { start } from "./create-fund";
// start();

const SUB_GRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme";

const init = async () => {
  const funds = await listAllFunds(SUB_GRAPH_ENDPOINT);
  console.log(funds);
};

init();
