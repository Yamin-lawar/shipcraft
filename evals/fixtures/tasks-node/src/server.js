const { createApp } = require('./app');
const { scheduleDigest } = require('./jobs/digest');

const { app, db } = createApp();
scheduleDigest(db, (email, open) => console.log(`digest to ${email}: ${open} open tasks`));
app.listen(process.env.PORT || 3000, () => console.log('tasks-node listening'));
