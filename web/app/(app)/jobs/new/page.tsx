import { listCustomers, listLocations, listSkills } from "@/lib/api";
import { PageHead } from "@/components/ui";
import { NewJobForm } from "./form";

export default async function NewJobPage() {
  const [customers, locations, skills] = await Promise.all([listCustomers(), listLocations(), listSkills()]);
  return (
    <>
      <PageHead
        title="Nouvelle intervention"
        subtitle="Crée une intervention en brouillon, à affecter ensuite depuis le dispatch"
      />
      <NewJobForm customers={customers} locations={locations} skills={skills} />
    </>
  );
}
