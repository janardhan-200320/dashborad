import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oioynuvrmvomqtrbszew.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pb3ludXZybXZvbXF0cmJzemV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzQxMTQsImV4cCI6MjA3NzMxMDExNH0.g_01yuti2StGkPsTUfBLLt7aR7vfbxZJNBxuMwok5Kw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Test 1: Organizations
  console.log('1️⃣ Fetching Organizations...');
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, email, timezone, currency');
  
  if (orgError) {
    console.error('❌ Organizations Error:', orgError.message);
  } else {
    console.log(`✅ Found ${orgs.length} organizations:`);
    orgs.forEach(org => console.log(`   - ${org.name} (${org.id})`));
  }
  console.log('');

  // Test 2: Customers
  console.log('2️⃣ Fetching Customers...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email, organization_id');
  
  if (custError) {
    console.error('❌ Customers Error:', custError.message);
  } else {
    console.log(`✅ Found ${customers.length} customers:`);
    customers.forEach(c => console.log(`   - ${c.first_name} ${c.last_name} (${c.email})`));
  }
  console.log('');

  // Test 3: Salespersons
  console.log('3️⃣ Fetching Salespersons...');
  const { data: sales, error: salesError } = await supabase
    .from('salespersons')
    .select('id, first_name, last_name, email, organization_id');
  
  if (salesError) {
    console.error('❌ Salespersons Error:', salesError.message);
  } else {
    console.log(`✅ Found ${sales.length} salespersons:`);
    sales.forEach(s => console.log(`   - ${s.first_name} ${s.last_name} (${s.email})`));
  }
  console.log('');

  // Test 4: Services
  console.log('4️⃣ Fetching Services...');
  const { data: services, error: servError } = await supabase
    .from('services')
    .select('id, name, price, organization_id');
  
  if (servError) {
    console.error('❌ Services Error:', servError.message);
  } else {
    console.log(`✅ Found ${services.length} services:`);
    services.forEach(s => console.log(`   - ${s.name} ($${s.price})`));
  }
  console.log('');

  // Test 5: Appointments
  console.log('5️⃣ Fetching Appointments...');
  const { data: appts, error: apptError } = await supabase
    .from('appointments')
    .select('id, title, status, start_time, organization_id')
    .limit(5);
  
  if (apptError) {
    console.error('❌ Appointments Error:', apptError.message);
  } else {
    console.log(`✅ Found ${appts.length} appointments:`);
    appts.forEach(a => console.log(`   - ${a.title} (${a.status})`));
  }
  console.log('');

  // Test 6: Workflows
  console.log('6️⃣ Fetching Workflows...');
  const { data: workflows, error: workError } = await supabase
    .from('workflows')
    .select('id, name, is_active, organization_id');
  
  if (workError) {
    console.error('❌ Workflows Error:', workError.message);
  } else {
    console.log(`✅ Found ${workflows.length} workflows:`);
    workflows.forEach(w => console.log(`   - ${w.name} (Active: ${w.is_active})`));
  }
  console.log('');

  console.log('✅ Database check complete!');
}

testDatabase().catch(console.error);
