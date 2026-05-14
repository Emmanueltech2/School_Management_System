import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run delete:user -- user@example.com");
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

const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

if (deleteError) {
  console.error(deleteError.message);
  process.exit(1);
}

console.log(`Deleted auth user and profile for ${email}.`);
