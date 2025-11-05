/**
 * Test script to verify migrated Supabase routes work correctly
 * 
 * Tests the 4 migrated routes:
 * - customers.js
 * - team-members.js (→ salespersons)
 * - services.js
 * - appointments.js
 */

const API_BASE = 'http://localhost:8000/api';

async function testRoute(name, method, endpoint, body = null) {
  console.log(`\n🧪 Testing ${method} ${endpoint}`);
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data).substring(0, 200));
      return data;
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`);
      console.log(`   Error:`, data);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR -`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Testing Migrated Supabase Routes                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Test 1: Customers
  console.log('\n📋 1. CUSTOMERS');
  await testRoute('List Customers', 'GET', '/customers');
  
  const newCustomer = await testRoute('Create Customer', 'POST', '/customers', {
    first_name: 'Test',
    last_name: 'Customer',
    email: `test${Date.now()}@example.com`,
    phone: '555-1234'
  });

  if (newCustomer) {
    await testRoute('Get Customer', 'GET', `/customers/${newCustomer.id}`);
    await testRoute('Update Customer', 'PUT', `/customers/${newCustomer.id}`, {
      first_name: 'Updated',
      last_name: 'Customer',
      email: newCustomer.email,
      phone: '555-5678'
    });
    await testRoute('Delete Customer', 'DELETE', `/customers/${newCustomer.id}`);
  }

  // Test 2: Team Members (Salespersons)
  console.log('\n👥 2. TEAM MEMBERS (Salespersons)');
  await testRoute('List Team Members', 'GET', '/team-members');
  await testRoute('List Active Members', 'GET', '/team-members/active');

  const newMember = await testRoute('Create Team Member', 'POST', '/team-members', {
    first_name: 'Sales',
    last_name: 'Person',
    email: `sales${Date.now()}@example.com`,
    role: 'salesperson',
    color: 'bg-blue-500'
  });

  if (newMember) {
    await testRoute('Get Team Member', 'GET', `/team-members/${newMember.id}`);
    await testRoute('Toggle Active', 'POST', `/team-members/${newMember.id}/toggle_active`);
    await testRoute('Delete Team Member', 'DELETE', `/team-members/${newMember.id}`);
  }

  // Test 3: Services
  console.log('\n🛠️ 3. SERVICES');
  await testRoute('List Services', 'GET', '/services');
  await testRoute('List Active Services', 'GET', '/services/active');

  const newService = await testRoute('Create Service', 'POST', '/services', {
    name: 'Test Service',
    description: 'A test service',
    duration: '60 mins',
    price: '99.99',
    category: 'consulting'
  });

  if (newService) {
    await testRoute('Get Service', 'GET', `/services/${newService.id}`);
    await testRoute('Toggle Enabled', 'POST', `/services/${newService.id}/toggle_enabled`);
    await testRoute('Delete Service', 'DELETE', `/services/${newService.id}`);
  }

  // Test 4: Appointments
  console.log('\n📅 4. APPOINTMENTS');
  await testRoute('List Appointments', 'GET', '/appointments');
  await testRoute('Appointment Stats', 'GET', '/appointments/stats');
  await testRoute('Upcoming Appointments', 'GET', '/appointments/upcoming');
  await testRoute('Today\'s Appointments', 'GET', '/appointments/today');

  // Note: Creating appointment requires valid customer_id, so we'll skip create/update/delete for now
  console.log('\n⚠️  Skipping appointment create/update/delete (requires existing customer_id)');

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Test Suite Complete!                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

// Run tests
runTests().catch(console.error);
