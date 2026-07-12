import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Resolves the signed-in Supabase user to our User row (creating it on
// first visit), or redirects to /sign-in. All logbook queries are scoped by
// the returned user's id — that, not RLS, is the privacy boundary, since
// Prisma connects with a role that bypasses Supabase RLS anyway.
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/sign-in");
  }

  return prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });
});
