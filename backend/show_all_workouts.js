import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function showAllWorkouts() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('repsnrecord');
    const collection = db.collection('workoutdays');

    const allWorkouts = await collection.find({}).sort({ date: -1 }).limit(20).toArray();

    console.log(`\nShowing last 20 workouts:\n`);

    allWorkouts.forEach((w, i) => {
      console.log(`${i + 1}. Date: ${w.date} | Exercise: ${w.exerciseName} | User: ${w.userId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

showAllWorkouts();
