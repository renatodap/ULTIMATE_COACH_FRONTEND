/**
 * English Translations
 *
 * SINGLE SOURCE OF TRUTH for all English text in the app.
 * Never hardcode strings in components!
 */

export const en = {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    appName: 'ULTIMATE COACH',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    apply: 'Apply',
    retry: 'Retry',
    viewAll: 'View All',
    learnMore: 'Learn More',
  },

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  auth: {
    // Login
    login: 'Log In',
    loginTitle: 'WELCOME BACK',
    loginSubtitle: 'Log in to your account',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    loginButton: 'LOG IN',
    loggingIn: 'Logging in...',

    // Signup
    signup: 'Sign Up',
    signupTitle: 'START YOUR JOURNEY',
    signupSubtitle: 'Create your free account',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    alreadyHaveAccount: 'Already have an account?',
    signupButton: 'CREATE ACCOUNT',
    signingUp: 'Creating account...',

    // Social Auth
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    orDivider: 'OR',

    // Logout
    logout: 'Log Out',
    logoutConfirm: 'Are you sure you want to log out?',

    // Errors
    invalidCredentials: 'Invalid email or password',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 6 characters',
    accountExists: 'An account with this email already exists',
    signupFailed: 'Failed to create account. Please try again.',
    loginFailed: 'Failed to log in. Please try again.',
  },

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    nutrition: 'Nutrition',
    activities: 'Activities',
    coach: 'AI Coach',
    profile: 'Profile',
    settings: 'Settings',
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    title: 'DASHBOARD',
    greeting: 'Hello, {{name}}!',
    todaysSummary: "Today's Summary",
    caloriesConsumed: 'Calories Consumed',
    caloriesBurned: 'Calories Burned',
    proteinIntake: 'Protein Intake',
    workoutsCompleted: 'Workouts Completed',
    quickActions: 'Quick Actions',
    logMeal: 'Log Meal',
    logActivity: 'Log Activity',
    chatWithCoach: 'Chat with AI Coach',
    viewProgress: 'View Progress',
  },

  // ============================================================================
  // NUTRITION
  // ============================================================================
  nutrition: {
    title: 'NUTRITION',
    searchFoods: 'Search foods...',
    recentMeals: 'Recent Meals',
    logMeal: 'Log Meal',
    mealLogged: 'Meal logged successfully',
    deleteMeal: 'Delete Meal',
    deleteMealConfirm: 'Are you sure you want to delete this meal?',

    // Macros
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    fiber: 'Fiber',
    sugar: 'Sugar',

    // Meal types
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',

    // Servings
    serving: 'Serving',
    servings: 'Servings',
    grams: 'g',
    ounces: 'oz',
    cups: 'cups',
    tablespoons: 'tbsp',
    teaspoons: 'tsp',
  },

  // ============================================================================
  // ACTIVITIES
  // ============================================================================
  activities: {
    title: 'ACTIVITIES',
    logActivity: 'Log Activity',
    recentActivities: 'Recent Activities',
    activityLogged: 'Activity logged successfully',
    deleteActivity: 'Delete Activity',
    deleteActivityConfirm: 'Are you sure you want to delete this activity?',

    // Activity types
    strength: 'Strength Training',
    cardio: 'Cardio',
    sports: 'Sports',
    flexibility: 'Flexibility',
    other: 'Other',

    // Metrics
    duration: 'Duration',
    distance: 'Distance',
    caloriesBurned: 'Calories Burned',
    sets: 'Sets',
    reps: 'Reps',
    weight: 'Weight',
    minutes: 'minutes',
    kilometers: 'km',
    miles: 'miles',
  },

  // ============================================================================
  // AI COACH
  // ============================================================================
  coach: {
    title: 'AI COACH',
    newConversation: 'New Conversation',
    typeMessage: 'Type your message...',
    sendMessage: 'Send',
    thinking: 'Coach is thinking...',
    suggestedPrompts: 'Suggested Prompts',
    emptyState: "Start a conversation with your AI coach! Ask anything about nutrition, fitness, or wellness.",

    // Suggestions
    suggestion1: 'What should I eat for breakfast?',
    suggestion2: 'Create a workout plan for me',
    suggestion3: 'Help me track my progress',
    suggestion4: 'Give me nutrition advice',
  },

  // ============================================================================
  // PROFILE
  // ============================================================================
  profile: {
    title: 'PROFILE',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    goals: 'Goals',
    preferences: 'Preferences',

    // Fields
    fullName: 'Full Name',
    email: 'Email',
    age: 'Age',
    height: 'Height',
    weight: 'Weight',
    goalWeight: 'Goal Weight',
    activityLevel: 'Activity Level',

    // Activity levels
    sedentary: 'Sedentary',
    lightlyActive: 'Lightly Active',
    moderatelyActive: 'Moderately Active',
    veryActive: 'Very Active',
    extremelyActive: 'Extremely Active',

    // Goals
    loseWeight: 'Lose Weight',
    maintainWeight: 'Maintain Weight',
    gainMuscle: 'Gain Muscle',
    improveHealth: 'Improve Health',
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    title: 'SETTINGS',

    // Sections
    account: 'Account',
    notifications: 'Notifications',
    privacy: 'Privacy',
    appearance: 'Appearance',
    language: 'Language',
    about: 'About',

    // Account
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account',
    deleteAccountWarning: 'This action cannot be undone.',

    // Notifications
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    mealReminders: 'Meal Reminders',
    workoutReminders: 'Workout Reminders',

    // Appearance
    darkMode: 'Dark Mode',
    systemDefault: 'System Default',

    // About
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactSupport: 'Contact Support',
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    stepIndicator: 'Step {{current}} of {{total}}',

    // Step 1
    step1Title: 'WELCOME TO ULTIMATE COACH',
    step1Subtitle: "Let's personalize your experience",
    primaryGoal: 'What is your primary goal?',
    loseWeight: 'Lose Weight',
    buildMuscle: 'Build Muscle',
    maintain: 'Maintain Weight',
    improvePerformance: 'Improve Performance',
    experienceLevel: 'Fitness Experience Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    workoutFrequency: 'Workouts per week',

    // Step 2
    step2Title: 'PHYSICAL STATS',
    step2Subtitle: 'For accurate calorie calculations',
    unitSystem: 'Preferred Units',
    metric: 'Metric',
    imperial: 'Imperial',
    age: 'Age',
    biologicalSex: 'Biological Sex',
    male: 'Male',
    female: 'Female',
    height: 'Height',
    currentWeight: 'Current Weight',
    goalWeight: 'Goal Weight',

    // Step 3
    step3Title: 'ACTIVITY LEVEL',
    step3Subtitle: 'How active are you?',
    sedentary: 'Sedentary',
    sedentaryDesc: 'Desk job, little exercise',
    lightlyActive: 'Lightly Active',
    lightlyActiveDesc: 'Light exercise 1-3 days/week',
    moderatelyActive: 'Moderately Active',
    moderatelyActiveDesc: 'Moderate exercise 3-5 days/week',
    veryActive: 'Very Active',
    veryActiveDesc: 'Hard exercise 6-7 days/week',
    extremelyActive: 'Extremely Active',
    extremelyActiveDesc: 'Athlete or physical job',

    // Step 4
    step4Title: 'DIETARY PROFILE',
    step4Subtitle: 'Your food preferences',
    dietaryPreference: 'Dietary Preference',
    none: 'No Restrictions',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian',
    keto: 'Keto',
    paleo: 'Paleo',
    foodAllergies: 'Food Allergies',
    foodsToAvoid: 'Foods to Avoid',
    mealsPerDay: 'Meals Per Day',

    // Step 5
    step5Title: 'LIFESTYLE',
    step5Subtitle: 'Just a few more questions',
    sleepHours: 'Hours of Sleep',
    stressLevel: 'Stress Level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    cooksRegularly: 'Do you cook?',
    yes: 'Yes',
    sometimes: 'Sometimes',
    rarely: 'Rarely',

    // Step 6
    step6Title: 'YOUR TARGETS',
    step6Subtitle: 'Calculated just for you',
    calculating: 'Calculating...',
    bmr: 'BMR',
    tdee: 'TDEE',
    dailyCalories: 'Daily Calories',
    dailyProtein: 'Protein',
    dailyCarbs: 'Carbs',
    dailyFats: 'Fats',
    autoAdjust: 'Targets auto-adjust when you update your profile',
    complete: 'Complete Onboarding',

    // Navigation
    back: 'Back',
    next: 'Next',
  },

  // ============================================================================
  // ERRORS
  // ============================================================================
  errors: {
    // Generic
    somethingWentWrong: 'Something went wrong',
    pleaseTryAgain: 'Please try again',
    networkError: 'Network error. Check your internet connection.',

    // Specific
    profileNotFound: 'Profile not found',
    mealNotFound: 'Meal not found',
    activityNotFound: 'Activity not found',
    conversationNotFound: 'Conversation not found',

    // Validation
    requiredField: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidNumber: 'Must be a valid number',
    tooShort: 'Too short',
    tooLong: 'Too long',
  },

  // ============================================================================
  // SUCCESS MESSAGES
  // ============================================================================
  success: {
    profileUpdated: 'Profile updated successfully',
    mealLogged: 'Meal logged successfully',
    mealDeleted: 'Meal deleted successfully',
    activityLogged: 'Activity logged successfully',
    activityDeleted: 'Activity deleted successfully',
    settingsSaved: 'Settings saved successfully',
    onboardingCompleted: 'Welcome to ULTIMATE COACH!',
  },
} as const

export type TranslationKey = typeof en

export default en
