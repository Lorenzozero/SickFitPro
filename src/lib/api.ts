export const updateUserProfile = async (field: string, value: string) => {
  // Implementazione dell'aggiornamento del profilo utente
};

export const updateUserPreferences = async (key: string, value: boolean) => {
  // Implementazione dell'aggiornamento delle preferenze utente
};

export const getUserDataFromDB = async () => {
  // Implementation to fetch user data from database
  return {
    notificationsEnabled: false,
    name: '',
    email: '',
    profilePicture: '',
    currentWeight: ''
  };
};