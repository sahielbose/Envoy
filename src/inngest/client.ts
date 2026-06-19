import { Inngest } from "inngest";

/** The Inngest client. Dev/mock needs no keys; Phase 20 wires Inngest Cloud. */
export const inngest = new Inngest({ id: "envoy" });
