/**
 * Test script to verify SQLite transaction fixes
 * This script tests the corrected transaction patterns to ensure
 * no unhandled promise rejections occur
 */

import {
  RecentExperimentsService,
  ExperimentMetadata,
} from '../services/recentExperimentsService';

// Test the fixed getRecentExperiments method
export async function testRecentExperimentsTransactions() {

  try {
    // Test recording an activity first
    const testMetadata: ExperimentMetadata = {
      experimentId: Date.now(), // Use number as required by interface
      experimentName: 'Test Experiment',
      fieldExperimentName: 'Test Field',
      projectKey: 'TEST-001',
      cropName: 'Test Crop',
      season: 'Test Season',
      year: '2024',
      experimentType: 'field',
    };

    await RecentExperimentsService.recordActivity(
      testMetadata,
      'data_recorded',
      'test-org-url',
    );

    // Test fetching recent experiments
    const experiments = await RecentExperimentsService.getRecentExperiments(
      5,
      'test-org-url',
    );

    // Test cleanup
    await RecentExperimentsService.cleanupOldActivities(30);

    return true;
  } catch (error) {
    return false;
  }
}

// Simple error logging function
export const logTransactionErrors = () => {

  // Simple promise rejection logging
  const originalConsoleError = console.error;
    const message = args.join(' ');
    if (
      message.includes('InvalidStateError') ||
      message.includes('transaction is already finalized')
    ) {
    }
    originalConsoleError.apply(console, args);
  };
};
