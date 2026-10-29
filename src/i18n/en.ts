const en = {
  appName: 'Car Maintenance',
  common: {
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading…',
    error: 'Something went wrong',
  },
  auth: {
    signInTitle: 'Sign in',
    signUpTitle: 'Create account',
    name: 'Full name',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    noAccount: "Don't have an account? Create one",
    haveAccount: 'Already have an account? Sign in',
    signOut: 'Sign out',
    continueWithGoogle: 'Continue with Gmail',
    or: 'or',
    googleMissing: 'Gmail sign-in is not configured yet. Add the Google client ids to the .env file.',
    missingFields: 'Please fill in all fields.',
    passwordTooShort: 'Password must be at least 6 characters.',
    invalidCredentials: 'Email or password is incorrect.',
    emailInUse: 'This email is already registered.',
    firebaseMissing:
      'Firebase is not configured yet. Add your Firebase keys to the .env file and restart the app.',
  },
  home: {
    title: 'My cars',
    greeting: 'Hello, {{name}}',
    empty: 'No cars yet. Add your first car to start tracking its maintenance.',
    addCar: 'Add car',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    restartTitle: 'Restart needed',
    restartBody: 'Close and reopen the app to apply the new layout direction.',
    account: 'Account',
  },
};

export default en;
export type Translations = typeof en;
