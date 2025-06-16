// Firebase Security Rules Testing Examples
// Family Management App - Comprehensive Test Suite

const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

// Test configuration
const projectId = 'family-hub-test';
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: require('fs').readFileSync('./firestore.rules', 'utf8'),
  },
});

// Test data setup
const familyId = 'test-family-123';
const parentId = 'parent-user-456';
const childId = 'child-user-789';
const outsiderId = 'outsider-user-999';

// Helper function to get authenticated context
function getAuthenticatedContext(uid, customClaims = {}) {
  return testEnv.authenticatedContext(uid, customClaims);
}

function getUnauthenticatedContext() {
  return testEnv.unauthenticatedContext();
}

// ============================================
// AUTHENTICATION TESTS
// ============================================

describe('Authentication Tests', () => {
  test('Unauthenticated users cannot access any family data', async () => {
    const unauthedDb = getUnauthenticatedContext().firestore();
    
    await assertFails(unauthedDb.collection('families').doc(familyId).get());
    await assertFails(unauthedDb.collection('families').doc(familyId).collection('tasks').get());
    await assertFails(unauthedDb.collection('families').doc(familyId).collection('budget').get());
  });
});

// ============================================
// FAMILY ISOLATION TESTS
// ============================================

describe('Family Isolation Tests', () => {
  beforeEach(async () => {
    // Setup test family with members
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    
    // Create family
    await adminDb.collection('families').doc(familyId).set({
      name: 'Test Family',
      createdBy: parentId,
      createdAt: new Date()
    });
    
    // Add family members
    await adminDb.collection('families').doc(familyId).collection('members').doc(parentId).set({
      name: 'Parent User',
      email: 'parent@test.com',
      role: 'parent',
      joinedAt: new Date()
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(childId).set({
      name: 'Child User',
      email: 'child@test.com',
      role: 'child',
      joinedAt: new Date()
    });
  });

  test('Family members can access their family data', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(parentDb.collection('families').doc(familyId).get());
    await assertSucceeds(childDb.collection('families').doc(familyId).get());
  });

  test('Non-family members cannot access family data', async () => {
    const outsiderDb = getAuthenticatedContext(outsiderId).firestore();
    
    await assertFails(outsiderDb.collection('families').doc(familyId).get());
    await assertFails(outsiderDb.collection('families').doc(familyId).collection('tasks').get());
  });

  test('Users cannot access other families data', async () => {
    const otherFamilyId = 'other-family-456';
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertFails(parentDb.collection('families').doc(otherFamilyId).get());
    await assertFails(parentDb.collection('families').doc(otherFamilyId).collection('tasks').get());
  });
});

// ============================================
// ROLE-BASED ACCESS CONTROL TESTS
// ============================================

describe('Role-Based Access Control Tests', () => {
  beforeEach(async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    
    // Setup family with different roles
    await adminDb.collection('families').doc(familyId).set({
      name: 'Test Family',
      createdBy: parentId,
      createdAt: new Date()
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(parentId).set({
      name: 'Parent User',
      email: 'parent@test.com',
      role: 'parent',
      joinedAt: new Date()
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(childId).set({
      name: 'Child User',
      email: 'child@test.com',
      role: 'child',
      joinedAt: new Date()
    });
  });

  test('Parents can edit family settings', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).update({
        name: 'Updated Family Name'
      })
    );
  });

  test('Children cannot edit family settings', async () => {
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertFails(
      childDb.collection('families').doc(familyId).update({
        name: 'Updated Family Name'
      })
    );
  });

  test('Parents can manage child profiles', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('members').doc(childId).update({
        allowances: 10
      })
    );
  });

  test('Children cannot manage other member profiles', async () => {
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertFails(
      childDb.collection('families').doc(familyId).collection('members').doc(parentId).update({
        name: 'Hacked Parent'
      })
    );
  });

  test('Children can update their own profile', async () => {
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(
      childDb.collection('families').doc(familyId).collection('members').doc(childId).update({
        name: 'Updated Child Name',
        email: 'child@test.com',
        role: 'child',
        joinedAt: new Date()
      })
    );
  });
});

// ============================================
// CHILD SAFETY TESTS
// ============================================

describe('Child Safety Tests', () => {
  beforeEach(async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    
    // Setup family with budget data
    await adminDb.collection('families').doc(familyId).set({
      name: 'Test Family',
      createdBy: parentId
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(parentId).set({
      name: 'Parent User',
      role: 'parent',
      joinedAt: new Date()
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(childId).set({
      name: 'Child User',
      role: 'child',
      joinedAt: new Date()
    });
    
    // Add sensitive budget data
    await adminDb.collection('families').doc(familyId).collection('budget').doc('expenses').set({
      category: 'Monthly Expenses',
      amount: 5000,
      currency: 'USD'
    });
  });

  test('Children cannot read budget information', async () => {
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertFails(
      childDb.collection('families').doc(familyId).collection('budget').get()
    );
    
    await assertFails(
      childDb.collection('families').doc(familyId).collection('budget').doc('expenses').get()
    );
  });

  test('Children cannot write budget information', async () => {
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertFails(
      childDb.collection('families').doc(familyId).collection('budget').doc('new-expense').set({
        category: 'Toys',
        amount: 100
      })
    );
  });

  test('Parents can access budget information', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('budget').get()
    );
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('budget').doc('expenses').get()
    );
  });

  test('Parents can manage budget information', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('budget').doc('new-category').set({
        category: 'Groceries',
        amount: 800,
        currency: 'USD'
      })
    );
  });
});

// ============================================
// COLLABORATION FEATURES TESTS
// ============================================

describe('Family Collaboration Tests', () => {
  beforeEach(async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    
    await adminDb.collection('families').doc(familyId).set({
      name: 'Test Family',
      createdBy: parentId
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(parentId).set({
      name: 'Parent User',
      role: 'parent',
      joinedAt: new Date()
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(childId).set({
      name: 'Child User',
      role: 'child',
      joinedAt: new Date()
    });
  });

  test('All family members can create tasks', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('tasks').add({
        title: 'Clean kitchen',
        assignedTo: childId,
        createdBy: parentId,
        createdAt: new Date()
      })
    );
    
    await assertSucceeds(
      childDb.collection('families').doc(familyId).collection('tasks').add({
        title: 'Homework',
        assignedTo: childId,
        createdBy: childId,
        createdAt: new Date()
      })
    );
  });

  test('All family members can read tasks', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('tasks').get()
    );
    
    await assertSucceeds(
      childDb.collection('families').doc(familyId).collection('tasks').get()
    );
  });

  test('Family members can contribute to grocery lists', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('grocery').add({
        name: 'Weekly Shopping',
        items: ['milk', 'bread', 'eggs'],
        createdBy: parentId
      })
    );
    
    await assertSucceeds(
      childDb.collection('families').doc(familyId).collection('grocery').add({
        name: 'Snack List',
        items: ['cookies', 'juice'],
        createdBy: childId
      })
    );
  });

  test('Family members can create calendar events', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    const childDb = getAuthenticatedContext(childId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('calendar').add({
        title: 'Family Dinner',
        date: new Date(),
        createdBy: parentId
      })
    );
    
    await assertSucceeds(
      childDb.collection('families').doc(familyId).collection('calendar').add({
        title: 'School Play',
        date: new Date(),
        createdBy: childId
      })
    );
  });
});

// ============================================
// DATA VALIDATION TESTS
// ============================================

describe('Data Validation Tests', () => {
  beforeEach(async () => {
    const adminDb = testEnv.withSecurityRulesDisabled().firestore();
    
    await adminDb.collection('families').doc(familyId).set({
      name: 'Test Family',
      createdBy: parentId
    });
    
    await adminDb.collection('families').doc(familyId).collection('members').doc(parentId).set({
      name: 'Parent User',
      role: 'parent',
      joinedAt: new Date()
    });
  });

  test('Valid member data is accepted', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    await assertSucceeds(
      parentDb.collection('families').doc(familyId).collection('members').doc('new-member').set({
        name: 'New Family Member',
        email: 'new@test.com',
        role: 'child',
        joinedAt: new Date()
      })
    );
  });

  test('Invalid member data is rejected', async () => {
    const parentDb = getAuthenticatedContext(parentId).firestore();
    
    // Missing required fields
    await assertFails(
      parentDb.collection('families').doc(familyId).collection('members').doc('invalid-member').set({
        name: 'Invalid Member'
        // Missing email, role, joinedAt
      })
    );
    
    // Invalid role
    await assertFails(
      parentDb.collection('families').doc(familyId).collection('members').doc('invalid-role').set({
        name: 'Invalid Role',
        email: 'invalid@test.com',
        role: 'invalid_role', // Not in allowed roles
        joinedAt: new Date()
      })
    );
  });
});

// ============================================
// CLEANUP
// ============================================

afterAll(async () => {
  await testEnv.cleanup();
});

// Export test suite for CI/CD pipeline
module.exports = {
  testEnv,
  getAuthenticatedContext,
  getUnauthenticatedContext,
  familyId,
  parentId,
  childId,
  outsiderId
};