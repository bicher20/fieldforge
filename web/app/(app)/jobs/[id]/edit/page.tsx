import { getJob, listCustomers, listLocations, listSkills } from "@/lib/api";
import { PageHead } from "@/components/ui";
import { notFound } from "next/navigation";
import { EditJobForm } from "./form";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobId = Number(id);
  const [job, customers, locations, skills] = await Promise.all([
    getJob(jobId),
    listCustomers(),
    listLocations(),
    listSkills(),
  ]).catch(() => [null, [], [], []] as const);
  if (!job) notFound();

  return (
    <>
      <PageHead title="Modifier l'intervention" subtitle={`#${String(job.id).padStart(4, "0")} · ${job.title}`} />
      <EditJobForm job={job} customers={customers} locations={locations} skills={skills} />
    </>
  );
}
