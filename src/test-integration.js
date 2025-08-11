// Simple test script to verify API integration
import { 
  itineraryAPI, 
  staysAPI, 
  expensesAPI, 
  documentAPI 
} from './services/api';

const testTripId = 1; // Replace with a real trip ID for testing

const testIntegrations = async () => {
  console.log('Testing API integrations...');
  
  try {
    // Test itinerary API
    console.log('\n1. Testing itinerary APIs...');
    const itinerary = await itineraryAPI.getItinerary(testTripId);
    console.log('✓ Full itinerary fetch successful');
    
    const dayItinerary = await itineraryAPI.getItineraryByDay(testTripId, 1);
    console.log('✓ Day-specific itinerary fetch successful');
    
  } catch (error) {
    console.log('✗ Itinerary API error:', error.message);
  }

  try {
    // Test expenses API
    console.log('\n2. Testing expenses APIs...');
    const expenses = await expensesAPI.getExpenses(testTripId);
    console.log('✓ Expenses fetch successful');
    
    const summary = await expensesAPI.getExpensesSummary(testTripId);
    console.log('✓ Expenses summary fetch successful');
    
  } catch (error) {
    console.log('✗ Expenses API error:', error.message);
  }

  try {
    // Test documents API
    console.log('\n3. Testing documents APIs...');
    const documents = await documentAPI.getDocuments(testTripId);
    console.log('✓ Documents fetch successful');
    
  } catch (error) {
    console.log('✗ Documents API error:', error.message);
  }

  console.log('\nAPI integration test completed!');
};

export default testIntegrations;