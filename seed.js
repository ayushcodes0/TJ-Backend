const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- FIX: The path should point directly to your models folder from the root ---
// It should not be in a 'src' directory unless your models folder is actually there.
const Option = require('./src/models/Option');

dotenv.config();

const DEFAULT_OPTIONS = [
  // Strategies
  { type: 'Strategy', name: 'Breakout' }, { type: 'Strategy', name: 'Reversal' },
  { type: 'Strategy', name: 'Scalping' }, { type: 'Strategy', name: 'Swing' },
  { type: 'Strategy', name: 'Range Bound' }, { type: 'Strategy', name: 'Momentum' },
  { type: 'Strategy', name: 'News Driven' }, { type: 'Strategy', name: 'Trend Continuation' },
  { type: 'Strategy', name: 'Intraday' }, { type: 'Strategy', name: 'Overnight' },
  { type: 'Strategy', name: 'Other' },
  // Outcomes
  { type: 'OutcomeSummary', name: 'Mistake' }, { type: 'OutcomeSummary', name: 'Followed Plan' },
  { type: 'OutcomeSummary', name: 'Partial Success' }, { type: 'OutcomeSummary', name: 'Full Success' },
  // Rules Followed
  { type: 'RulesFollowed', name: 'Followed risk management (1-2% risk)' },
  { type: 'RulesFollowed', name: 'Waited for entry confirmation' },
  { type: 'RulesFollowed', name: 'Traded in direction of higher timeframe trend' },
  { type: 'RulesFollowed', name: 'Had volume confirmation' },
  { type: 'RulesFollowed', name: 'Exercised patience before entry' },
  // Emotional States
  { type: 'EmotionalState', name: 'Calm' }, { type: 'EmotionalState', name: 'Frustrated' },
  { type: 'EmotionalState', name: 'Anxious' }, { type: 'EmotionalState', name: 'Overconfident' },
  { type: 'EmotionalState', name: 'Impatient' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // This logic correctly uses the 'Option' model to create the defaults.
    const operations = DEFAULT_OPTIONS.map(option => 
      Option.findOneAndUpdate(
        { user_id: null, type: option.type, name: option.name },
        { $setOnInsert: { user_id: null, type: option.type, name: option.name } },
        { upsert: true }
      )
    );

    await Promise.all(operations);

    console.log('Database has been successfully seeded with default options!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();
