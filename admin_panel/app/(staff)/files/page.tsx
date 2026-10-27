import { Files } from "@/features/files";
export const metadata = {
  title: "Files",
  description:
    "Private files owned by your account, or accessible to administrators.",
};
export default function FilesPage() {
  return <Files />;
}
