// Test script to manually trigger dinner reminders
const testDinnerReminder = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/cron/meal-reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mealType: 'dinner'
      })
    });

    const result = await response.json();
    console.log('Dinner reminder result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testDinnerReminder();
