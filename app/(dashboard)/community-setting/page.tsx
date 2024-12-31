import CommunitySettings from "@/components/community-setting";
import { getSystemConfigAndVotes } from "@/lib/actions/community-setting.action";

export default async function CommunitySettingsPage() {
  const initialData = await getSystemConfigAndVotes();
  
  return (
    <CommunitySettings initialData={initialData} />
  );
}