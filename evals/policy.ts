import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import { getWebSearch } from "@/lib/search";
import { scanForContactInfo } from "@/server/policy/pii";
import type { EvalCase, EvalSet } from "./types";

/** PII / no-scrape policy: people data is archetypes + public info only. */
export const policyEval: EvalSet = {
  name: "pii-no-scrape",
  threshold: 1,
  async run(): Promise<EvalCase[]> {
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories });

    const contacts = await services.mapContacts({
      profileId: "demo-profile",
      jobId: "job-northwind-fe",
    });
    const research = await services.researchCompany({
      company: "Northwind",
      jobId: "job-northwind-fe",
    });
    const search = await getWebSearch().search("Northwind company news");

    return [
      {
        name: "map_contacts returns no contact info",
        passed: scanForContactInfo(contacts).length === 0,
      },
      {
        name: "map_contacts returns archetypes only (no named private people)",
        passed: contacts.targets.every((t) => t.namedPerson === undefined),
      },
      {
        name: "research_company returns no contact info",
        passed: scanForContactInfo(research).length === 0,
      },
      {
        name: "web search results carry no contact info",
        passed: scanForContactInfo(search).length === 0,
      },
    ];
  },
};
