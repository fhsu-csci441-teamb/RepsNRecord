import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const userId = process.argv[2] || 'lPDaCB1rsfQdUlmcvNfRHGx9C9T2';

if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

async function checkUserProgress() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('repsnrecord');
    const collection = db.collection('workoutdays');

    console.log(`\nChecking progress for user: ${userId.slice(0, 12)}...\n`);

    // Get all 2025 workouts
    const workouts = await collection.find({
      userId: userId,
      date: { $gte: '2025-01-01', $lt: '2026-01-01' }
    }).sort({ date: 1 }).toArray();

    console.log(`Total workouts in 2025: ${workouts.length}\n`);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = {};
    
    monthNames.forEach((month) => {
      monthlyCounts[month] = 0;
    });

    console.log('Processing each workout:');
    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const monthIndex = workoutDate.getUTCMonth();
      const monthName = monthNames[monthIndex];
      
      console.log(`  Date: ${workout.date} → Month Index: ${monthIndex} → ${monthName} (${workout.exerciseName})`);
      
      if (workoutDate.getUTCFullYear() === 2025) {
        monthlyCounts[monthName]++;
      }
    });

    console.log('\n=== Monthly Counts ===');
    monthNames.forEach((month) => {
      if (monthlyCounts[month] > 0) {
        console.log(`  ${month}: ${monthlyCounts[month]} workouts`);
      }
    });

    const bestMonth = Object.keys(monthlyCounts).reduce((max, month) => {
      return monthlyCounts[month] > monthlyCounts[max] ? month : max;
    }, 'Jan');

    console.log(`\n✓ Best Month: ${bestMonth} (${monthlyCounts[bestMonth]} workouts)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUserProgress();
