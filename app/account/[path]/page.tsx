import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <UserProfile />
    </div>
  );
}
