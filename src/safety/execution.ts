export class ExecutionQuarantinedError extends Error {
  readonly code = "EXECUTION_QUARANTINED";

  constructor(operation: string) {
    super(
      `${operation} is disabled: this historical fork is paper-only until provenance, licensing, chain support, and an independent security review are complete.`
    );
    this.name = "ExecutionQuarantinedError";
  }
}

/** Fail closed before a signer, nonce, approval, or transaction is used. */
export function assertMutationQuarantined(operation: string): never {
  throw new ExecutionQuarantinedError(operation);
}
