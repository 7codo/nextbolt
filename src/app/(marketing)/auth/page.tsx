import { Metadata } from "next";
import AuthCard from "./_components/auth-card";
import { auth } from "@/lib/config/auth";

export const metadata: Metadata = {
  title: "WriteGeniusEmail | Authentication",
};

const AuthPage = async () => {
  const session = await auth();

  return (
    <section className="grid grid-cols-2 gap-6 mt-16">
      <div className="">{JSON.stringify(session)}</div>
      <aside className="flex flex-col items-center justify-center gap-y-3">
        <AuthCard />
      </aside>
    </section>
  );
};

export default AuthPage;
