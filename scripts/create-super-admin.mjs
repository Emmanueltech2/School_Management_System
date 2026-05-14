import { createClient } from "@supabase/supabase-js";

const [, , emailArg, nameArg, passwordArg] = process.argv;
const email = emailArg?.trim().toLowerCase();
const fullName = nameArg?.trim();
const password = passwordArg;

if (!email || !fullName || !password) {
  console.error('Usage: npm run create:super-admin -- admin@example.com "Full Name" "StrongPassword123"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
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

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
    role: "super_admin"
  }
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

const userId = data.user?.id;

if (!userId) {
  console.error("Supabase did not return a user id.");
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

console.log(`Created super admin ${email}.`);
