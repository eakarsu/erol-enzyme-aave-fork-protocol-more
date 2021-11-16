"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../index");
// import { start } from "./create-fund";
// start();
const SUB_GRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme";
const init = async () => {
    const funds = await (0, index_1.listAllFunds)(SUB_GRAPH_ENDPOINT);
    console.log(funds);
};
init();
