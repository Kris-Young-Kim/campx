import { SignIn, SignUp } from "@clerk/nextjs";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {path === "sign-in" ? <SignIn /> : <SignUp />}
    </main>
  );
}
