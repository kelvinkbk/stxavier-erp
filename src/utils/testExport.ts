// Test utility for user export functionality
// Run this to test if the export works without errors

import { AdvancedUserService } from '../services/advancedUserService';
import { LocalStorageService } from '../services/localStorage';

export const testUserExport = async () => {
  console.log('🧪 Testing User Export Functionality...');
  
  try {
    // Test basic export
    console.log('📊 Testing basic export...');
    const exportResult = await AdvancedUserService.exportUsersAdvanced();
    
    console.log('✅ Export successful!');
    console.log('📁 CSV length:', exportResult.csv.length);
    console.log('📄 JSON length:', exportResult.json.length);
    
    // Test if CSV has proper headers
    const csvLines = exportResult.csv.split('\n');
    console.log('📋 CSV Headers:', csvLines[0]);
    console.log('📊 CSV Rows:', csvLines.length - 1);
    
    // Test JSON structure
    const jsonData = JSON.parse(exportResult.json);
    console.log('📊 JSON Users Count:', jsonData.totalUsers);
    console.log('📅 Export Date:', jsonData.exportDate);
    
    // Test with filter
    console.log('🔍 Testing filtered export...');
    const filteredResult = await AdvancedUserService.exportUsersAdvanced({
      role: 'student'
    });
    
    const filteredJson = JSON.parse(filteredResult.json);
    console.log('👥 Filtered Users Count:', filteredJson.totalUsers);
    
    console.log('✅ All export tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Export test failed:', error);
    return false;
  }
};

export const testDateHandling = () => {
  console.log('📅 Testing Date Handling...');
  
  // Test various date formats
  const testDates = [
    new Date(),
    '2024-01-01T00:00:00.000Z',
    '2024-01-01',
    1704067200000, // timestamp
    null,
    undefined
  ];
  
  testDates.forEach((dateValue, index) => {
    try {
      const parsed = LocalStorageService.safeParseDate(dateValue);
      console.log(`Test ${index + 1}:`, dateValue, '→', parsed.toISOString());
    } catch (error) {
      console.error(`Test ${index + 1} failed:`, dateValue, error);
    }
  });
};
