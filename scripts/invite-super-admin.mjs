import { createClient } from "@supabase/supabase-js";

const [, , emailArg, ...nameParts] = process.argv;
const fullName = nameParts.join(" ").trim() || "Super Admin";
const email = emailArg?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run invite:super-admin -- admin@example.com \"Full Name\"");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const redirectTo = `${siteUrl}/auth/confirm?type=invite&next=/auth/callback`;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
  data: {
    full_name: fullName,
    role: "super_admin"
  },
  redirectTo
});

if (inviteError) {
  console.error(inviteError.message);
  process.exit(1);
}

const userId = invite.user?.id;

if (!userId) {
  console.error("Supabase did not return an invited user id.");
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  school_id: null,
  full_name: fullName,
  role: "super_admin",
  is_active: true
});

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

const { data: role } = await supabase
  .from("roles")
  .select("id")
  .eq("name", "super_admin")
  .maybeSingle();

if (role?.id) {
  await supabase.from("user_roles").insert({
    user_id: userId,
    school_id: null,
    role_id: role.id,
    is_active: true
  });
}

console.log(`Super admin invitation sent to ${email}.`);
