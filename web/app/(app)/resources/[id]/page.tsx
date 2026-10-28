import { getResource, listSkills, listTeams } from "@/lib/api";
import { PageHead } from "@/components/ui";
import { notFound } from "next/navigation";
import { EditResourceForm } from "./form";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resourceId = Number(id);
  const [resource, teams, skills] = await Promise.all([getResource(resourceId), listTeams(), listSkills()]).catch(
    () => [null, [], []] as const,
  );
  if (!resource) notFound();

  return (
    <>
      <PageHead title="Modifier la ressource" subtitle={resource.name} />
      <EditResourceForm resource={resource} teams={teams} skills={skills} />
    </>
  );
}
