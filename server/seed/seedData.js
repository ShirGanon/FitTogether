// Run with: npm run seed (from the server/ directory)
// Clears existing data and inserts realistic demo data.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const FitnessGroup = require('../models/FitnessGroup');
const Post = require('../models/Post');
const Message = require('../models/Message');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear everything
  await Promise.all([
    User.deleteMany({}),
    FitnessGroup.deleteMany({}),
    Post.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password1!', 10);

  const users = await User.insertMany([
    {
      username: 'alice_runs',
      password: passwordHash,
      fullName: 'Alice Cohen',
      email: 'alice@fittogether.dev',
      bio: 'Marathon runner chasing my next PR.',
      fitnessLevel: 'advanced',
      preferredWorkoutTypes: ['Running', 'Yoga'],
      location: 'Tel Aviv',
    },
    {
      username: 'bob_lifts',
      password: passwordHash,
      fullName: 'Bob Levy',
      email: 'bob@fittogether.dev',
      bio: 'Powerlifter and weekend hiker.',
      fitnessLevel: 'intermediate',
      preferredWorkoutTypes: ['Weightlifting', 'Hiking'],
      location: 'Jerusalem',
    },
    {
      username: 'carla_yoga',
      password: passwordHash,
      fullName: 'Carla Mizrahi',
      email: 'carla@fittogether.dev',
      bio: 'Certified yoga instructor. Breathe first.',
      fitnessLevel: 'advanced',
      preferredWorkoutTypes: ['Yoga'],
      location: 'Haifa',
    },
    {
      username: 'dan_cyclist',
      password: passwordHash,
      fullName: 'Dan Shapiro',
      email: 'dan@fittogether.dev',
      bio: 'Road cycling every morning before work.',
      fitnessLevel: 'intermediate',
      preferredWorkoutTypes: ['Cycling'],
      location: 'Tel Aviv',
    },
    {
      username: 'emma_swim',
      password: passwordHash,
      fullName: 'Emma Katz',
      email: 'emma@fittogether.dev',
      bio: 'Competitive swimmer, open water enthusiast.',
      fitnessLevel: 'advanced',
      preferredWorkoutTypes: ['Swimming'],
      location: 'Netanya',
    },
    {
      username: 'frank_crossfit',
      password: passwordHash,
      fullName: 'Frank Barr',
      email: 'frank@fittogether.dev',
      bio: 'CrossFit box owner. Let\'s get those gains.',
      fitnessLevel: 'advanced',
      preferredWorkoutTypes: ['CrossFit'],
      location: 'Raanana',
    },
    {
      username: 'gal_beginner',
      password: passwordHash,
      fullName: 'Gal Peretz',
      email: 'gal@fittogether.dev',
      bio: 'Just started my fitness journey. Any tips welcome!',
      fitnessLevel: 'beginner',
      preferredWorkoutTypes: ['Running', 'Home Workout'],
      location: 'Beer Sheva',
    },
    {
      username: 'hana_trail',
      password: passwordHash,
      fullName: 'Hana Friedman',
      email: 'hana@fittogether.dev',
      bio: 'Trail runner and nature lover.',
      fitnessLevel: 'intermediate',
      preferredWorkoutTypes: ['Running', 'Hiking'],
      location: 'Modi\'in',
    },
    {
      username: 'ilan_gym',
      password: passwordHash,
      fullName: 'Ilan Ohayon',
      email: 'ilan@fittogether.dev',
      bio: 'Gym 5 days a week. Nutrition is key.',
      fitnessLevel: 'intermediate',
      preferredWorkoutTypes: ['Gym', 'Running'],
      location: 'Petah Tikva',
    },
    {
      username: 'julia_home',
      password: passwordHash,
      fullName: 'Julia Stern',
      email: 'julia@fittogether.dev',
      bio: 'Home workout champion. No excuses.',
      fitnessLevel: 'beginner',
      preferredWorkoutTypes: ['Home Workout', 'Yoga'],
      location: 'Rishon LeZion',
    },
    {
      username: 'kobi_soccer',
      password: passwordHash,
      fullName: 'Kobi Dahan',
      email: 'kobi@fittogether.dev',
      bio: 'Football fanatic and gym rat.',
      fitnessLevel: 'intermediate',
      preferredWorkoutTypes: ['Soccer', 'Gym'],
      location: 'Ashdod',
    },
  ]);
  console.log(`Created ${users.length} users`);

  // Convenience map by username
  const u = {};
  for (const user of users) u[user.username] = user;

  // Add some friend connections
  u['alice_runs'].friends = [u['bob_lifts']._id, u['hana_trail']._id, u['dan_cyclist']._id];
  u['bob_lifts'].friends = [u['alice_runs']._id, u['ilan_gym']._id];
  u['hana_trail'].friends = [u['alice_runs']._id, u['gal_beginner']._id];
  u['dan_cyclist'].friends = [u['alice_runs']._id, u['emma_swim']._id];
  u['gal_beginner'].friends = [u['julia_home']._id, u['hana_trail']._id];
  u['julia_home'].friends = [u['gal_beginner']._id, u['carla_yoga']._id];
  u['carla_yoga'].friends = [u['julia_home']._id];
  u['frank_crossfit'].friends = [u['ilan_gym']._id, u['kobi_soccer']._id];

  await Promise.all(Object.values(u).map((user) => user.save()));

  // ── Groups ─────────────────────────────────────────────────────────────
  const groups = await FitnessGroup.insertMany([
    {
      name: 'Tel Aviv Runners',
      description: 'Morning runs along the promenade. All paces welcome.',
      workoutType: 'Running',
      location: 'Tel Aviv',
      difficultyLevel: 'intermediate',
      isPrivate: false,
      managerId: u['alice_runs']._id,
      members: [
        u['alice_runs']._id,
        u['hana_trail']._id,
        u['gal_beginner']._id,
        u['dan_cyclist']._id,
        u['ilan_gym']._id,
      ],
      pendingRequests: [],
    },
    {
      name: 'Iron Temple Gym',
      description: 'Serious lifting, serious results. Intermediate and above.',
      workoutType: 'Gym',
      location: 'Jerusalem',
      difficultyLevel: 'intermediate',
      isPrivate: false,
      managerId: u['bob_lifts']._id,
      members: [
        u['bob_lifts']._id,
        u['ilan_gym']._id,
        u['frank_crossfit']._id,
        u['kobi_soccer']._id,
      ],
      pendingRequests: [],
    },
    {
      name: 'Sunrise Yoga Haifa',
      description: 'Daily sunrise yoga sessions on Mount Carmel.',
      workoutType: 'Yoga',
      location: 'Haifa',
      difficultyLevel: 'beginner',
      isPrivate: false,
      managerId: u['carla_yoga']._id,
      members: [
        u['carla_yoga']._id,
        u['julia_home']._id,
        u['hana_trail']._id,
        u['emma_swim']._id,
      ],
      pendingRequests: [],
    },
    {
      name: 'Coastal Cyclists',
      description: 'Weekend rides along the Mediterranean coast.',
      workoutType: 'Cycling',
      location: 'Netanya',
      difficultyLevel: 'intermediate',
      isPrivate: false,
      managerId: u['dan_cyclist']._id,
      members: [
        u['dan_cyclist']._id,
        u['emma_swim']._id,
        u['alice_runs']._id,
      ],
      pendingRequests: [],
    },
    {
      name: 'Elite CrossFit Raanana',
      description: 'Advanced CrossFit programming. Invite-only.',
      workoutType: 'CrossFit',
      location: 'Raanana',
      difficultyLevel: 'advanced',
      isPrivate: true,
      managerId: u['frank_crossfit']._id,
      members: [
        u['frank_crossfit']._id,
        u['bob_lifts']._id,
        u['ilan_gym']._id,
      ],
      pendingRequests: [
        u['kobi_soccer']._id,
        u['hana_trail']._id,
      ],
    },
    {
      name: 'Open Water Swimmers',
      description: 'Sea swimming from Netanya to Herzliya. Weekly meetups.',
      workoutType: 'Swimming',
      location: 'Netanya',
      difficultyLevel: 'advanced',
      isPrivate: false,
      managerId: u['emma_swim']._id,
      members: [
        u['emma_swim']._id,
        u['dan_cyclist']._id,
        u['carla_yoga']._id,
      ],
      pendingRequests: [],
    },
    {
      name: 'Home Workout Warriors',
      description: 'No gym? No problem. Bodyweight and home equipment sessions.',
      workoutType: 'Home Workout',
      location: 'Israel',
      difficultyLevel: 'beginner',
      isPrivate: false,
      managerId: u['julia_home']._id,
      members: [
        u['julia_home']._id,
        u['gal_beginner']._id,
        u['hana_trail']._id,
        u['kobi_soccer']._id,
      ],
      pendingRequests: [],
    },
  ]);
  console.log(`Created ${groups.length} groups`);

  const g = {};
  for (const group of groups) g[group.name] = group;

  // ── Posts ──────────────────────────────────────────────────────────────
  const postData = [
    // Tel Aviv Runners
    { authorId: u['alice_runs']._id, groupId: g['Tel Aviv Runners']._id, content: 'Great 10K this morning! Who is joining Saturday\'s long run?', postType: 'Event', workoutType: 'Running', difficultyLevel: 'intermediate', location: 'Tel Aviv' },
    { authorId: u['hana_trail']._id, groupId: g['Tel Aviv Runners']._id, content: 'Tip: run the first 5K slower than you think you need to. Your second half will thank you.', postType: 'Tip', workoutType: 'Running', difficultyLevel: 'beginner', location: 'Tel Aviv' },
    { authorId: u['gal_beginner']._id, groupId: g['Tel Aviv Runners']._id, content: 'I just ran my first 3K without stopping! Any advice for building up to 5K?', postType: 'Question', workoutType: 'Running', difficultyLevel: 'beginner', location: 'Beer Sheva' },
    { authorId: u['alice_runs']._id, groupId: g['Tel Aviv Runners']._id, content: 'Week 8 of marathon training done. Down to 3:55 pace for my long run!', postType: 'Progress Update', workoutType: 'Running', difficultyLevel: 'advanced', location: 'Tel Aviv' },
    { authorId: u['dan_cyclist']._id, groupId: g['Tel Aviv Runners']._id, content: 'Cross-training idea: cycling on recovery days keeps the aerobic base without the impact.', postType: 'Tip', workoutType: 'Running', difficultyLevel: 'intermediate', location: 'Tel Aviv' },
    { authorId: u['ilan_gym']._id, groupId: g['Tel Aviv Runners']._id, content: 'Anyone use strength training alongside their running plan? How do you schedule it?', postType: 'Question', workoutType: 'Running', difficultyLevel: 'intermediate', location: 'Petah Tikva' },
    { authorId: u['hana_trail']._id, groupId: g['Tel Aviv Runners']._id, content: 'Looking for a running partner for Tuesday mornings around the Yarkon park.', postType: 'Looking for Partner', workoutType: 'Running', difficultyLevel: 'intermediate', location: 'Tel Aviv' },
    { authorId: u['alice_runs']._id, groupId: g['Tel Aviv Runners']._id, content: '5K race this Sunday in Ramat Gan park! Entry is free — who\'s in?', postType: 'Event', workoutType: 'Running', difficultyLevel: 'beginner', location: 'Ramat Gan' },

    // Iron Temple Gym
    { authorId: u['bob_lifts']._id, groupId: g['Iron Temple Gym']._id, content: 'New personal best: 140 kg squat today. Six months of consistent programming pays off!', postType: 'Progress Update', workoutType: 'Gym', difficultyLevel: 'advanced', location: 'Jerusalem' },
    { authorId: u['ilan_gym']._id, groupId: g['Iron Temple Gym']._id, content: 'Best rep range for hypertrophy: 8-12 or 5x5? I\'ve been doing both and not sure which to prioritise.', postType: 'Question', workoutType: 'Gym', difficultyLevel: 'intermediate', location: 'Petah Tikva' },
    { authorId: u['frank_crossfit']._id, groupId: g['Iron Temple Gym']._id, content: 'Tip: don\'t neglect mobility work. 10 minutes after every session saves your joints long-term.', postType: 'Tip', workoutType: 'Gym', difficultyLevel: 'intermediate', location: 'Raanana' },
    { authorId: u['kobi_soccer']._id, groupId: g['Iron Temple Gym']._id, content: 'Anyone want to spot each other on Thursday evening at the Jerusalem branch?', postType: 'Looking for Partner', workoutType: 'Gym', difficultyLevel: 'intermediate', location: 'Jerusalem' },
    { authorId: u['bob_lifts']._id, groupId: g['Iron Temple Gym']._id, content: 'My 12-week strength program — feel free to adapt it. Pull day: deadlift 5x3, row 4x8, curl 3x12.', postType: 'Workout Plan', workoutType: 'Gym', difficultyLevel: 'advanced', location: 'Jerusalem' },
    { authorId: u['ilan_gym']._id, groupId: g['Iron Temple Gym']._id, content: 'Hit 100 kg bench for the first time! Took two years but it\'s done.', postType: 'Progress Update', workoutType: 'Gym', difficultyLevel: 'advanced', location: 'Petah Tikva' },
    { authorId: u['frank_crossfit']._id, groupId: g['Iron Temple Gym']._id, content: 'Power clean workshop this Friday at 18:00. Limited spots — reply here to reserve.', postType: 'Event', workoutType: 'Gym', difficultyLevel: 'advanced', location: 'Raanana' },

    // Sunrise Yoga Haifa
    { authorId: u['carla_yoga']._id, groupId: g['Sunrise Yoga Haifa']._id, content: 'This week we\'re focusing on hip openers. See you at 06:00 on the Carmel ridge!', postType: 'Event', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Haifa' },
    { authorId: u['julia_home']._id, groupId: g['Sunrise Yoga Haifa']._id, content: 'What mat do you recommend for outdoor sessions? Mine slips on dewy grass.', postType: 'Question', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Rishon LeZion' },
    { authorId: u['carla_yoga']._id, groupId: g['Sunrise Yoga Haifa']._id, content: 'Tip: keep a yoga journal. Even 2 lines after each session shows your progress over months.', postType: 'Tip', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Haifa' },
    { authorId: u['hana_trail']._id, groupId: g['Sunrise Yoga Haifa']._id, content: 'Adding yoga twice a week has completely fixed my tight hip flexors from running.', postType: 'Progress Update', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Modi\'in' },
    { authorId: u['emma_swim']._id, groupId: g['Sunrise Yoga Haifa']._id, content: 'Does anyone use yoga as active recovery after hard swim sessions? Curious about the combo.', postType: 'Question', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Netanya' },
    { authorId: u['carla_yoga']._id, groupId: g['Sunrise Yoga Haifa']._id, content: '30-day morning yoga challenge starts Monday. 20 minutes every day. Who\'s joining?', postType: 'Event', workoutType: 'Yoga', difficultyLevel: 'beginner', location: 'Haifa' },

    // Coastal Cyclists
    { authorId: u['dan_cyclist']._id, groupId: g['Coastal Cyclists']._id, content: 'Saturday ride: Netanya → Herzliya along the coastal path. 45 km, 07:00 start.', postType: 'Event', workoutType: 'Cycling', difficultyLevel: 'intermediate', location: 'Netanya' },
    { authorId: u['emma_swim']._id, groupId: g['Coastal Cyclists']._id, content: 'Best tyre pressure for coastal roads? I keep getting flats on the sandy sections.', postType: 'Question', workoutType: 'Cycling', difficultyLevel: 'intermediate', location: 'Netanya' },
    { authorId: u['alice_runs']._id, groupId: g['Coastal Cyclists']._id, content: 'Cycling is my favourite active recovery — no impact and you still get the cardio.', postType: 'Tip', workoutType: 'Cycling', difficultyLevel: 'beginner', location: 'Tel Aviv' },
    { authorId: u['dan_cyclist']._id, groupId: g['Coastal Cyclists']._id, content: 'New monthly record: 800 km in April. Legs are done but I\'m happy!', postType: 'Progress Update', workoutType: 'Cycling', difficultyLevel: 'advanced', location: 'Tel Aviv' },
    { authorId: u['dan_cyclist']._id, groupId: g['Coastal Cyclists']._id, content: 'Looking for someone to share training rides on Wednesday mornings — 25-30 km, conversational pace.', postType: 'Looking for Partner', workoutType: 'Cycling', difficultyLevel: 'intermediate', location: 'Tel Aviv' },

    // Elite CrossFit Raanana (private)
    { authorId: u['frank_crossfit']._id, groupId: g['Elite CrossFit Raanana']._id, content: 'WOD for Thursday: 21-15-9 thrusters (43 kg) + pull-ups. Post times below.', postType: 'Workout Plan', workoutType: 'CrossFit', difficultyLevel: 'advanced', location: 'Raanana' },
    { authorId: u['bob_lifts']._id, groupId: g['Elite CrossFit Raanana']._id, content: 'Finished in 8:42. The thrusters are my weakness — any drills to improve the squat-to-press transition?', postType: 'Question', workoutType: 'CrossFit', difficultyLevel: 'advanced', location: 'Jerusalem' },
    { authorId: u['ilan_gym']._id, groupId: g['Elite CrossFit Raanana']._id, content: 'Tip from the comp last weekend: chalk your hands before every set, not just when they feel slippy.', postType: 'Tip', workoutType: 'CrossFit', difficultyLevel: 'advanced', location: 'Petah Tikva' },
    { authorId: u['frank_crossfit']._id, groupId: g['Elite CrossFit Raanana']._id, content: 'Benchmark week next week: Fran, Grace, and Helen. Log your scores so we can track progress.', postType: 'Event', workoutType: 'CrossFit', difficultyLevel: 'advanced', location: 'Raanana' },
    { authorId: u['bob_lifts']._id, groupId: g['Elite CrossFit Raanana']._id, content: 'New Fran time: 4:11. Down from 5:30 six months ago!', postType: 'Progress Update', workoutType: 'CrossFit', difficultyLevel: 'advanced', location: 'Jerusalem' },

    // Open Water Swimmers
    { authorId: u['emma_swim']._id, groupId: g['Open Water Swimmers']._id, content: 'Sunday sea swim at 07:30 from Netanya pier. Water is 22°C — perfect conditions.', postType: 'Event', workoutType: 'Swimming', difficultyLevel: 'advanced', location: 'Netanya' },
    { authorId: u['dan_cyclist']._id, groupId: g['Open Water Swimmers']._id, content: 'How do you navigate in open water without a lane line? I keep drifting off course.', postType: 'Question', workoutType: 'Swimming', difficultyLevel: 'intermediate', location: 'Tel Aviv' },
    { authorId: u['emma_swim']._id, groupId: g['Open Water Swimmers']._id, content: 'Tip: sight every 8-10 strokes — pick a fixed landmark on the shore, not a buoy that moves.', postType: 'Tip', workoutType: 'Swimming', difficultyLevel: 'intermediate', location: 'Netanya' },
    { authorId: u['carla_yoga']._id, groupId: g['Open Water Swimmers']._id, content: 'Breathing exercises from yoga have genuinely improved my swim rhythm. Recommend trying.', postType: 'Tip', workoutType: 'Swimming', difficultyLevel: 'beginner', location: 'Haifa' },
    { authorId: u['emma_swim']._id, groupId: g['Open Water Swimmers']._id, content: 'Completed a 5 km race in Kinneret! 1:22:45 — beating my goal by 7 minutes.', postType: 'Progress Update', workoutType: 'Swimming', difficultyLevel: 'advanced', location: 'Tiberias' },

    // Home Workout Warriors
    { authorId: u['julia_home']._id, groupId: g['Home Workout Warriors']._id, content: '30-minute full-body circuit: 10 push-ups, 15 squats, 20 mountain climbers × 4 rounds. No equipment needed.', postType: 'Workout Plan', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Israel' },
    { authorId: u['gal_beginner']._id, groupId: g['Home Workout Warriors']._id, content: 'I did my first 30 push-ups in a row today. Six weeks ago I could barely do 5!', postType: 'Progress Update', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Beer Sheva' },
    { authorId: u['julia_home']._id, groupId: g['Home Workout Warriors']._id, content: 'Best resistance band set for home use? Looking for one under ₪150.', postType: 'Question', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Rishon LeZion' },
    { authorId: u['hana_trail']._id, groupId: g['Home Workout Warriors']._id, content: 'Tip: keep your workout gear visible — shoes by the door, mat rolled out. Removes the friction.', postType: 'Tip', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Modi\'in' },
    { authorId: u['kobi_soccer']._id, groupId: g['Home Workout Warriors']._id, content: 'Anyone want to do a virtual workout together over video call? Keeps me accountable.', postType: 'Looking for Partner', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Ashdod' },
    { authorId: u['julia_home']._id, groupId: g['Home Workout Warriors']._id, content: 'Weekly challenge: plank every day. 30 seconds Monday, add 10 seconds each day. Post your Friday time!', postType: 'Event', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Israel' },
    { authorId: u['gal_beginner']._id, groupId: g['Home Workout Warriors']._id, content: 'What\'s the best way to stay motivated when you don\'t feel like working out?', postType: 'Question', workoutType: 'Home Workout', difficultyLevel: 'beginner', location: 'Beer Sheva' },
  ];

  const posts = await Post.insertMany(postData);
  console.log(`Created ${posts.length} posts`);

  // ── Messages ───────────────────────────────────────────────────────────
  const messages = await Message.insertMany([
    // Alice ↔ Hana (training chat)
    { senderId: u['alice_runs']._id, receiverId: u['hana_trail']._id, content: 'Hey! Are you doing the Saturday long run?', isRead: true },
    { senderId: u['hana_trail']._id, receiverId: u['alice_runs']._id, content: 'Yes! Planning to do 18 km. You?', isRead: true },
    { senderId: u['alice_runs']._id, receiverId: u['hana_trail']._id, content: 'Same. Want to run together? I\'ll be at the Yarkon entrance at 07:00.', isRead: true },
    { senderId: u['hana_trail']._id, receiverId: u['alice_runs']._id, content: 'Perfect, see you there!', isRead: true },

    // Bob ↔ Ilan (lifting talk)
    { senderId: u['bob_lifts']._id, receiverId: u['ilan_gym']._id, content: 'What program are you running right now?', isRead: true },
    { senderId: u['ilan_gym']._id, receiverId: u['bob_lifts']._id, content: 'nSuns 5/3/1. Really liking the volume.', isRead: true },
    { senderId: u['bob_lifts']._id, receiverId: u['ilan_gym']._id, content: 'Nice. I\'m finishing week 3 of GZCLP. Bench went up 10 kg already.', isRead: true },
    { senderId: u['ilan_gym']._id, receiverId: u['bob_lifts']._id, content: 'That\'s a big jump! Are you eating enough?', isRead: false },

    // Carla ↔ Julia (yoga coordination)
    { senderId: u['carla_yoga']._id, receiverId: u['julia_home']._id, content: 'Julia, can you help me lead the beginner session on Sunday?', isRead: true },
    { senderId: u['julia_home']._id, receiverId: u['carla_yoga']._id, content: 'Of course! What time and which poses?', isRead: true },
    { senderId: u['carla_yoga']._id, receiverId: u['julia_home']._id, content: 'Let\'s start with cat-cow, downward dog, warrior I and II. 07:30 on the Carmel.', isRead: true },
    { senderId: u['julia_home']._id, receiverId: u['carla_yoga']._id, content: 'I\'ll be there. Should I bring extra mats?', isRead: false },

    // Dan ↔ Emma (swim + cycle combo)
    { senderId: u['dan_cyclist']._id, receiverId: u['emma_swim']._id, content: 'How was the open water session yesterday?', isRead: true },
    { senderId: u['emma_swim']._id, receiverId: u['dan_cyclist']._id, content: 'Amazing! Water was glassy. You should join next week.', isRead: true },
    { senderId: u['dan_cyclist']._id, receiverId: u['emma_swim']._id, content: 'I might! Will I survive without a wetsuit?', isRead: true },
    { senderId: u['emma_swim']._id, receiverId: u['dan_cyclist']._id, content: 'At 22°C? Totally fine. Bring a tow float just in case.', isRead: false },

    // Frank ↔ Bob (CrossFit logistics)
    { senderId: u['frank_crossfit']._id, receiverId: u['bob_lifts']._id, content: 'Box is open extra early on Friday — 05:30 if you want to beat the heat.', isRead: true },
    { senderId: u['bob_lifts']._id, receiverId: u['frank_crossfit']._id, content: 'Tempting but that might kill me. 06:30?', isRead: true },
    { senderId: u['frank_crossfit']._id, receiverId: u['bob_lifts']._id, content: 'Deal. WOD is heavy so get a good sleep.', isRead: true },
    { senderId: u['bob_lifts']._id, receiverId: u['frank_crossfit']._id, content: 'Always do. See you Friday!', isRead: true },

    // Gal ↔ Julia (beginner support)
    { senderId: u['gal_beginner']._id, receiverId: u['julia_home']._id, content: 'Julia your workout plan is perfect for me. Thank you!', isRead: true },
    { senderId: u['julia_home']._id, receiverId: u['gal_beginner']._id, content: 'So glad! How did the first week go?', isRead: true },
    { senderId: u['gal_beginner']._id, receiverId: u['julia_home']._id, content: 'Hard but I did all 4 sessions. Legs were very sore!', isRead: true },
    { senderId: u['julia_home']._id, receiverId: u['gal_beginner']._id, content: 'That soreness is progress! Rest day tomorrow and you\'ll be fine.', isRead: false },
  ]);
  console.log(`Created ${messages.length} messages`);

  console.log('\n✅ Seed complete!');
  console.log('   All users have password: Password1!');
  console.log(`   ${users.length} users | ${groups.length} groups | ${posts.length} posts | ${messages.length} messages`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
