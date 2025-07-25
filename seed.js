// seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const Strategy = require('./src/models/Strategy');
const OutcomeSummary = require('./src/models/OutcomeSummary');
const RulesFollowed = require('./src/models/RulesFollowed');
const EmotionalState = require('./src/models/EmotionalState');

// Default dropdown options
const defaultStrategies = [
  "Breakout", "Reversal", "Scalping", "Swing", "Range-Bound",
  "Momentum", "News-Driven", "Trend Continuation", "Intraday", "Overnight", "Other"
];
const defaultOutcomeSummaries = [
  "Mistake", "Followed Plan", "Partial Success", "Full Success"
];
const defaultRulesFollowed = [
  "Followed Risk Management (1-2% risk)",
  "Waited for entry confirmation",
  "Traded in direction of higher timeframe trend",
  "Had volume confirmation",
  "Avoided revenge trading",
  "Excercised patience before entry"
];
const defaultEmotionalStates = [
  "Calm", "Anxious", "Excited", "Confident", 
  "Frustrated", "Overconfident", "Neutral"
];

async function seedCollection(Model, values, labelField) {
  for (const value of values) {
    const query = { [labelField]: value, user_id: null, is_default: true };
    const exists = await Model.findOne(query);
    if (!exists) {
      await Model.create({ [labelField]: value, user_id: null, is_default: true });
      console.log(`Inserted: "${value}" into ${Model.collection.name}`);
    } else {
      console.log(`Already seeded: "${value}" in ${Model.collection.name}`);
    }
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await seedCollection(Strategy, defaultStrategies, 'name');
  await seedCollection(OutcomeSummary, defaultOutcomeSummaries, 'label');
  await seedCollection(RulesFollowed, defaultRulesFollowed, 'label');
  await seedCollection(EmotionalState, defaultEmotionalStates, 'label');
  console.log('Seeding complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
