import { createClient } from "@supabase/supabase-js";

const [, , emailArg, passwordArg] = process.argv;
const email = emailArg?.trim().toLowerCase();
const password = passwordArg;

if (!email || !password) {
  console.error('Usage: npm run set:user-password -- user@example.com "StrongPassword123"');
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

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true
});

if (updateError) {
  console.error(updateError.message);
  process.exit(1);
}

console.log(`Password updated for ${email}.`);
