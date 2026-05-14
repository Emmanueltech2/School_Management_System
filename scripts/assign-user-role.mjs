import { createClient } from "@supabase/supabase-js";

const [, , emailArg, roleNameArg, schoolIdArg] = process.argv;
const email = emailArg?.trim().toLowerCase();
const roleName = roleNameArg?.trim();
const schoolId = schoolIdArg?.trim() || null;

if (!email || !roleName) {
  console.error("Usage: npm run assign:user-role -- user@example.com role_name [school_id]");
  process.exit(1);
}

if (roleName !== "super_admin" && !schoolId) {
  console.error("school_id is required for school-scoped roles.");
  process.exit(1);
}

if (roleName === "super_admin" && schoolId) {
  console.error("super_admin must be platform-scoped. Do not provide school_id.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

let page = 1;
let user = null;

while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: 100
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  user = data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;

  if (user || data.users.length < 100) {
    break;
  }

  page += 1;
}

if (!user) {
  console.error(`No auth user found for ${email}.`);
  process.exit(1);
}

const { data: role, error: roleError } = await supabase
  .from("roles")
  .select("id, name")
  .eq("name", roleName)
  .single();

if (roleError || !role) {
  console.error(roleError?.message ?? `No role found for ${roleName}. Apply the RBAC migration first.`);
  process.exit(1);
}

let existingQuery = supabase
  .from("user_roles")
  .select("id")
  .eq("user_id", user.id)
  .eq("role_id", role.id);

existingQuery = schoolId ? existingQuery.eq("school_id", schoolId) : existingQuery.is("school_id", null);

const { data: existing, error: existingError } = await existingQuery.maybeSingle();

if (existingError) {
  console.error(existingError.message);
  process.exit(1);
}

if (existing?.id) {
  const { error: updateError } = await supabase
    .from("user_roles")
    .update({ is_active: true })
    .eq("id", existing.id);

  if (updateError) {
    console.error(updateError.message);
    process.exit(1);
  }

  console.log(
    `Activated existing ${roleName} role for ${email}${schoolId ? ` at school ${schoolId}` : " at platform scope"}.`
  );
  process.exit(0);
}

const { error: assignError } = await supabase.from("user_roles").insert({
  user_id: user.id,
  school_id: schoolId,
  role_id: role.id,
  is_active: true
});

if (assignError) {
  console.error(assignError.message);
  process.exit(1);
}

console.log(
  `Assigned ${roleName} to ${email}${schoolId ? ` for school ${schoolId}` : " at platform scope"}.`
);
