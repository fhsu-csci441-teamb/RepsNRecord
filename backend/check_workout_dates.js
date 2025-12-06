import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

async function checkWorkoutDates() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('repsnrecord');
    const collection = db.collection('workoutdays');

    // Get all workouts for December 2025
    const december2025Workouts = await collection.find({
      date: { $gte: '2025-12-01', $lt: '2026-01-01' }
    }).toArray();

    console.log('\n=== December 2025 Workouts ===');
    console.log(`Found ${december2025Workouts.length} workouts in December 2025\n`);

    december2025Workouts.forEach((workout, index) => {
      console.log(`Workout ${index + 1}:`);
      console.log(`  Date: ${workout.date}`);
      console.log(`  Exercise: ${workout.exerciseName || 'N/A'}`);
      console.log(`  UserId: ${workout.userId?.slice(0, 12)}...`);
      
      // Parse the date to check what month it's in
      const workoutDate = new Date(workout.date);
      console.log(`  Parsed Date: ${workoutDate.toISOString()}`);
      console.log(`  UTC Month: ${workoutDate.getUTCMonth()} (${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][workoutDate.getUTCMonth()]})`);
      console.log(`  UTC Year: ${workoutDate.getUTCFullYear()}`);
      console.log('');
    });

    // Get all workouts for 2025 grouped by month
    console.log('\n=== 2025 Monthly Breakdown ===');
    const all2025 = await collection.find({
      date: { $gte: '2025-01-01', $lt: '2026-01-01' }
    }).toArray();

    const monthCounts = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    all2025.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const monthName = monthNames[workoutDate.getUTCMonth()];
      monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
    });

    monthNames.forEach((month) => {
      const count = monthCounts[month] || 0;
      if (count > 0) {
        console.log(`  ${month}: ${count} workouts`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkWorkoutDates();
