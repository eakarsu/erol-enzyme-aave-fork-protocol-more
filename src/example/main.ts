import { assertMutationQuarantined } from "../safety/execution";

/** Historical live example retained only as an explicit quarantine marker. */
export function createFundTest(): never {
  return assertMutationQuarantined("Enzyme fund creation example");
}
