import { assertMutationQuarantined } from "./safety/execution";

/** Account funding is deliberately unavailable in this reference fork. */
export function getSomeEth(): never {
  return assertMutationQuarantined("account funding");
}
