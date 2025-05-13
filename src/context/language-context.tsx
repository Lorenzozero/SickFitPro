// src/context/language-context.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Language = 'en' | 'it';
const DEFAULT_LANGUAGE: Language = 'en';
const LANGUAGE_STORAGE_KEY = 'app-language';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      exercises: 'Exercises',
      workoutPlans: 'Workout Plans',
      calendar: 'Calendar',
      aiSplitSuggester: 'AI Split Suggester',
      progress: 'Progress',
      settings: 'Settings',
    },
    userDropdown: {
      myAccount: 'My Account',
      settings: 'Settings',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      logout: 'Log out',
    },
    header: {
      toggleTheme: 'Toggle theme',
    },
    dashboard: {
      welcomeTitle: 'Welcome to SickFit Pro!',
      welcomeDescription: "Your journey to peak fitness starts here. Let's get to work.",
      activeWorkouts: 'Active Workouts',
      workoutsThisWeek: 'Workouts This Week',
      weightLifted: 'Weight Lifted (kg)',
      streak: 'Streak',
      quickActions: 'Quick Actions',
      quickActionsDescription: 'Jump right into your fitness routine.',
      logNewWorkout: 'Start New Workout',
      manageExercises: 'Manage Exercises',
      getAISplitSuggestion: 'Get AI Split Suggestion',
      todaysFocus: "Today's Focus",
      todaysFocusDescription: "What's on the agenda for today?",
      sampleWorkout: 'Leg Day',
      sampleWorkoutDetails: '5 exercises, 1 hour',
      viewFullSchedule: 'View Full Schedule',
    },
    settingsPage: {
      title: 'Settings',
      description: 'Customize your SickFit Pro experience.',
      localization: 'Localization',
      localizationDescription: 'Choose your preferred language for the app.',
      language: 'Language',
      selectLanguage: 'Select language',
      english: 'English (US)',
      italian: 'Italiano (Italian)',
      spanish: 'Español (Spanish)',
      french: 'Français (French)',
      selectedLanguageIs: 'Selected language',
      notifications: 'Notifications',
      notificationsDescription: 'Manage your notification preferences.',
      workoutReminders: 'Workout Reminders',
      progressUpdates: 'Progress Updates',
      newFeatureAnnouncements: 'New Feature Announcements',
      appearance: 'Appearance',
      appearanceDescription: 'Customize the look and feel of the app.',
      theme: 'Theme',
      selectTheme: 'Select theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      systemTheme: 'System',
      currentThemePreference: 'Current preference',
      systemIsApplying: 'System is currently applying',
      saveChanges: 'Save Changes',
      settingsSaved: 'Settings Saved',
      preferencesUpdated: 'Your preferences have been updated.',
    },
    aiSplitPage: {
        title: "AI Training Split Suggester",
        description: "Get a personalized training split recommendation from our AI coach.",
    },
    aiSplitForm: {
        cardTitle: "AI Training Split Suggester",
        cardDescription: "Let our AI craft a personalized training split based on your history and goals. Provide as much detail as possible for the best results.",
        trainingHistoryLabel: "Training History",
        trainingHistoryPlaceholder: "e.g., Been lifting for 2 years, current split is PPL. Squat 100kg, Bench 80kg, Deadlift 120kg. Usually train 3-4 times a week...",
        trainingHistoryDescription: "Describe your past and current training, including exercises, frequency, weights, etc.",
        trainingHistoryMinError: "Please provide detailed training history (at least 50 characters).",
        trainingGoalsLabel: "Training Goals",
        trainingGoalsPlaceholder: "e.g., Looking to gain muscle mass, improve strength in compound lifts, and increase overall endurance. Specifically want to grow my legs and shoulders.",
        trainingGoalsDescription: "What do you want to achieve with your training? (e.g., muscle gain, fat loss, strength increase)",
        trainingGoalsMinError: "Please describe your training goals (at least 10 characters).",
        getAISuggestionButton: "Get AI Suggestion",
        generatingSplitTitle: "Generating your split...",
        generatingSplitDescription: "Our AI is thinking. This might take a moment.",
        yourSuggestedSplitTitle: "Your AI-Suggested Training Split",
        suggestedSplitLabel: "Suggested Split:",
        reasoningLabel: "Reasoning:",
        toastSuggestionReadyTitle: "Suggestion Ready!",
        toastSuggestionReadyDescription: "AI has generated a training split for you.",
        toastErrorTitle: "Error",
        toastErrorDescription: "Failed to get AI suggestion. Please try again.",
    },
    calendarPage: {
        title: "Workout Calendar",
        description: "Plan and track your training schedule.",
        selectADate: "Select a Date",
        workoutsScheduledForThisDay: "Workouts scheduled for this day.",
        addWorkoutToDay: "Add Workout to Day",
        noWorkoutsScheduled: "No workouts scheduled for this day. Enjoy your rest or add one!",
        selectDateToSeeWorkouts: "Select a date to see scheduled workouts.",
        dialogAddWorkoutTitle: "Add Workout to", // Date will be appended
        dialogAddWorkoutDescription: "Select a workout plan to schedule for this day.",
        workoutPlanLabel: "Workout Plan",
        selectAPlanPlaceholder: "Select a plan",
        samplePlan1: "Full Body Blast",
        samplePlan2: "Upper Body Power",
        samplePlan3: "Leg Day Domination",
        samplePlan4: "Cardio Session",
        timeLabel: "Time",
        cancelButton: "Cancel",
        scheduleWorkoutButton: "Schedule Workout",
    },
    exercisesPage: {
        title: "Custom Exercises",
        description: "Manage your personalized exercise library.",
        addNewExerciseButton: "Add New Exercise",
        yourExercisesCardTitle: "Your Exercises",
        tableHeaderName: "Name",
        tableHeaderMuscleGroup: "Muscle Group",
        tableHeaderType: "Type",
        tableHeaderActions: "Actions",
        dialogAddTitle: "Add New Exercise",
        dialogAddDescription: "Fill in the details for your new exercise.",
        dialogEditTitle: "Edit Exercise",
        dialogEditDescription: "Update the details of your exercise.",
        formNameLabel: "Name",
        formDescriptionLabel: "Description",
        formMuscleGroupLabel: "Muscle Group",
        selectMuscleGroupPlaceholder: "Select muscle group",
        muscleGroupChest: "Chest",
        muscleGroupBack: "Back",
        muscleGroupLegs: "Legs",
        muscleGroupShoulders: "Shoulders",
        muscleGroupBiceps: "Biceps",
        muscleGroupTriceps: "Triceps",
        muscleGroupAbs: "Abs",
        muscleGroupCardio: "Cardio",
        muscleGroupOther: "Other",
        formTypeLabel: "Type",
        selectExerciseTypePlaceholder: "Select exercise type",
        typeStrength: "Strength",
        typeCardio: "Cardio",
        typeFlexibility: "Flexibility",
        typePlyometrics: "Plyometrics",
        typeOther: "Other",
        cancelButton: "Cancel",
        saveExerciseButton: "Save Exercise",
    },
    progressPage: {
        title: "Progress Tracking",
        description: "Visualize your fitness journey and celebrate your achievements.",
        performanceMetricsCardTitle: "Performance Metrics",
        performanceMetricsCardDescription: "Track your key lifts and measurements over time.",
        benchPressLabel: "Bench Press (kg)",
        squatLabel: "Squat (kg)",
        bodyCompositionCardTitle: "Body Composition",
        bodyCompositionCardDescription: "Monitor changes in weight, body fat, etc.",
        weightLabel: "Weight (kg)",
        photoComparisonCardTitle: "Photo Comparison",
        photoComparisonCardDescription: "Visually track your transformation. Upload 'before' and 'after' photos.",
        beforePhotoLabel: "Before Photo",
        afterPhotoLabel: "After Photo",
        noPhotoUploaded: "No photo uploaded",
        clickToUpload: "Click to upload",
        uploadButtonLabel: "Upload", // Will be combined with Before/After Photo
    },
    workoutPlansPage: {
        title: "Workout Plans",
        description: "Create, manage, and share your training schedules.",
        createNewPlanButton: "Create New Plan",
        exercisesLabel: "Exercises",
        estDurationLabel: "Est. Duration",
        startButton: "Start",
        dialogEditTitle: "Edit Workout Plan",
        dialogEditDescription: "Update the details of your workout plan.",
        dialogCreateTitle: "Create New Workout Plan",
        dialogCreateDescription: "Design your new workout plan.",
        planNameLabel: "Plan Name",
        descriptionLabel: "Description",
        exerciseSelectionPlaceholder: "Exercise selection and set/rep details would go here.",
        addExerciseButton: "Add Exercise",
        cancelButton: "Cancel",
        savePlanButton: "Save Plan",
        toastPlanUpdatedTitle: "Plan Updated",
        toastPlanUpdatedDescription: "\"{planName}\" has been updated.", // {planName} is a placeholder
        toastPlanCreatedTitle: "Plan Created",
        toastPlanCreatedDescription: "\"{planName}\" has been created.",
        toastPlanDeletedTitle: "Plan Deleted",
        toastPlanDeletedDescription: "\"{planName}\" has been deleted.",
        toastLinkCopiedTitle: "Link Copied!",
        toastLinkCopiedDescription: "Workout plan link copied to clipboard."
    },
     startWorkoutPage: {
      title: "Start New Workout",
      description: "Choose a plan to start or begin an ad-hoc session.",
      selectPlanTitle: "Select a Plan",
      startAdHocButton: "Start Ad-hoc Workout",
      noPlansAvailable: "No workout plans available. Create one first!",
      startPlanButton: "Start Plan",
    },
    activeWorkoutPage: {
      title: "Active Workout: {planName}",
      description: "Track your sets, reps, and weights for this session.",
      finishWorkoutButton: "Finish Workout",
      exerciseLabel: "Exercise",
      setsLabel: "Sets",
      repsLabel: "Reps",
      weightLabel: "Weight (kg)",
      logSetButton: "Log Set",
      planNotFound: "Workout plan not found.",
    }
  },
  it: {
    nav: {
      dashboard: 'Home',
      exercises: 'Esercizi',
      workoutPlans: 'Schede Allenamento',
      calendar: 'Calendario',
      aiSplitSuggester: 'Suggeritore Split AI',
      progress: 'Progressi',
      settings: 'Impostazioni',
    },
    userDropdown: {
      myAccount: 'Il Mio Account',
      settings: 'Impostazioni',
      theme: 'Tema',
      light: 'Chiaro',
      dark: 'Scuro',
      system: 'Sistema',
      logout: 'Esci',
    },
    header: {
      toggleTheme: 'Cambia tema',
    },
    dashboard: {
      welcomeTitle: 'Benvenuto in SickFit Pro!',
      welcomeDescription: 'Il tuo viaggio verso la forma fisica ottimale inizia qui. Mettiamoci al lavoro.',
      activeWorkouts: 'Allenamenti Attivi',
      workoutsThisWeek: 'Allenamenti Settimanali',
      weightLifted: 'Peso Sollevato (kg)',
      streak: 'Serie Positiva',
      quickActions: 'Azioni Rapide',
      quickActionsDescription: 'Entra subito nella tua routine di fitness.',
      logNewWorkout: 'Inizia Allenamento',
      manageExercises: 'Gestisci Esercizi',
      getAISplitSuggestion: 'Ottieni Suggerimento Split AI',
      todaysFocus: "Focus di Oggi",
      todaysFocusDescription: "Cosa c'è in programma per oggi?",
      sampleWorkout: 'Giorno Gambe',
      sampleWorkoutDetails: '5 esercizi, 1 ora',
      viewFullSchedule: 'Visualizza Programma Completo',
    },
    settingsPage: {
      title: 'Impostazioni',
      description: 'Personalizza la tua esperienza SickFit Pro.',
      localization: 'Localizzazione',
      localizationDescription: "Scegli la lingua preferita per l'app.",
      language: 'Lingua',
      selectLanguage: 'Seleziona lingua',
      english: 'English (US)',
      italian: 'Italiano (Italian)',
      spanish: 'Español (Spanish)',
      french: 'Français (French)',
      selectedLanguageIs: 'Lingua selezionata',
      notifications: 'Notifiche',
      notificationsDescription: 'Gestisci le preferenze di notifica.',
      workoutReminders: 'Promemoria Allenamenti',
      progressUpdates: 'Aggiornamenti Progressi',
      newFeatureAnnouncements: 'Annunci Nuove Funzionalità',
      appearance: 'Aspetto',
      appearanceDescription: "Personalizza l'aspetto dell'app.",
      theme: 'Tema',
      selectTheme: 'Seleziona tema',
      lightTheme: 'Chiaro',
      darkTheme: 'Scuro',
      systemTheme: 'Sistema',
      currentThemePreference: 'Preferenza attuale',
      systemIsApplying: 'Il sistema sta applicando',
      saveChanges: 'Salva Modifiche',
      settingsSaved: 'Impostazioni Salvate',
      preferencesUpdated: 'Le tue preferenze sono state aggiornate.',
    },
    aiSplitPage: {
        title: "Suggeritore Split Allenamento AI",
        description: "Ottieni una raccomandazione personalizzata per lo split di allenamento dal nostro coach AI.",
    },
    aiSplitForm: {
        cardTitle: "Suggeritore Split Allenamento AI",
        cardDescription: "Lascia che la nostra AI crei uno split di allenamento personalizzato basato sulla tua storia e sui tuoi obiettivi. Fornisci più dettagli possibili per i migliori risultati.",
        trainingHistoryLabel: "Storico Allenamenti",
        trainingHistoryPlaceholder: "es., Mi alleno da 2 anni, split attuale PPL. Squat 100kg, Panca 80kg, Stacco 120kg. Mi alleno 3-4 volte a settimana...",
        trainingHistoryDescription: "Descrivi i tuoi allenamenti passati e attuali, inclusi esercizi, frequenza, pesi, ecc.",
        trainingHistoryMinError: "Fornisci uno storico allenamenti dettagliato (almeno 50 caratteri).",
        trainingGoalsLabel: "Obiettivi di Allenamento",
        trainingGoalsPlaceholder: "es., Vorrei aumentare la massa muscolare, migliorare la forza nei composti e aumentare la resistenza generale. Voglio far crescere gambe e spalle.",
        trainingGoalsDescription: "Cosa vuoi ottenere con il tuo allenamento? (es. aumento massa, perdita grasso, aumento forza)",
        trainingGoalsMinError: "Descrivi i tuoi obiettivi di allenamento (almeno 10 caratteri).",
        getAISuggestionButton: "Ottieni Suggerimento AI",
        generatingSplitTitle: "Sto generando il tuo split...",
        generatingSplitDescription: "La nostra AI sta elaborando. Potrebbe volerci un momento.",
        yourSuggestedSplitTitle: "Il Tuo Split di Allenamento Suggerito dall'AI",
        suggestedSplitLabel: "Split Suggerito:",
        reasoningLabel: "Motivazione:",
        toastSuggestionReadyTitle: "Suggerimento Pronto!",
        toastSuggestionReadyDescription: "L'AI ha generato uno split di allenamento per te.",
        toastErrorTitle: "Errore",
        toastErrorDescription: "Impossibile ottenere il suggerimento AI. Riprova.",
    },
    calendarPage: {
        title: "Calendario Allenamenti",
        description: "Pianifica e monitora il tuo programma di allenamento.",
        selectADate: "Seleziona una Data",
        workoutsScheduledForThisDay: "Allenamenti programmati per questo giorno.",
        addWorkoutToDay: "Aggiungi Allenamento al Giorno",
        noWorkoutsScheduled: "Nessun allenamento programmato. Goditi il riposo o aggiungine uno!",
        selectDateToSeeWorkouts: "Seleziona una data per vedere gli allenamenti programmati.",
        dialogAddWorkoutTitle: "Aggiungi Allenamento al", // Date will be appended
        dialogAddWorkoutDescription: "Seleziona una scheda di allenamento da programmare per questo giorno.",
        workoutPlanLabel: "Scheda Allenamento",
        selectAPlanPlaceholder: "Seleziona una scheda",
        samplePlan1: "Scheda Total Body",
        samplePlan2: "Scheda Parte Superiore",
        samplePlan3: "Scheda Gambe Intensa",
        samplePlan4: "Sessione Cardio",
        timeLabel: "Ora",
        cancelButton: "Annulla",
        scheduleWorkoutButton: "Programma Allenamento",
    },
    exercisesPage: {
        title: "Esercizi Personalizzati",
        description: "Gestisci la tua libreria di esercizi personalizzati.",
        addNewExerciseButton: "Aggiungi Nuovo Esercizio",
        yourExercisesCardTitle: "I Tuoi Esercizi",
        tableHeaderName: "Nome",
        tableHeaderMuscleGroup: "Gruppo Muscolare",
        tableHeaderType: "Tipo",
        tableHeaderActions: "Azioni",
        dialogAddTitle: "Aggiungi Nuovo Esercizio",
        dialogAddDescription: "Inserisci i dettagli per il tuo nuovo esercizio.",
        dialogEditTitle: "Modifica Esercizio",
        dialogEditDescription: "Aggiorna i dettagli del tuo esercizio.",
        formNameLabel: "Nome",
        formDescriptionLabel: "Descrizione",
        formMuscleGroupLabel: "Gruppo Muscolare",
        selectMuscleGroupPlaceholder: "Seleziona gruppo muscolare",
        muscleGroupChest: "Petto",
        muscleGroupBack: "Schiena",
        muscleGroupLegs: "Gambe",
        muscleGroupShoulders: "Spalle",
        muscleGroupBiceps: "Bicipiti",
        muscleGroupTriceps: "Tricipiti",
        muscleGroupAbs: "Addominali",
        muscleGroupCardio: "Cardio",
        muscleGroupOther: "Altro",
        formTypeLabel: "Tipo",
        selectExerciseTypePlaceholder: "Seleziona tipo di esercizio",
        typeStrength: "Forza",
        typeCardio: "Cardio",
        typeFlexibility: "Flessibilità",
        typePlyometrics: "Pliometria",
        typeOther: "Altro",
        cancelButton: "Annulla",
        saveExerciseButton: "Salva Esercizio",
    },
    progressPage: {
        title: "Monitoraggio Progressi",
        description: "Visualizza il tuo percorso di fitness e celebra i tuoi traguardi.",
        performanceMetricsCardTitle: "Metriche di Performance",
        performanceMetricsCardDescription: "Traccia i tuoi sollevamenti chiave e misurazioni nel tempo.",
        benchPressLabel: "Panca Piana (kg)",
        squatLabel: "Squat (kg)",
        bodyCompositionCardTitle: "Composizione Corporea",
        bodyCompositionCardDescription: "Monitora i cambiamenti di peso, grasso corporeo, ecc.",
        weightLabel: "Peso (kg)",
        photoComparisonCardTitle: "Confronto Foto",
        photoComparisonCardDescription: "Traccia visivamente la tua trasformazione. Carica foto 'prima' e 'dopo'.",
        beforePhotoLabel: "Foto Prima",
        afterPhotoLabel: "Foto Dopo",
        noPhotoUploaded: "Nessuna foto caricata",
        clickToUpload: "Clicca per caricare",
        uploadButtonLabel: "Carica",
    },
     workoutPlansPage: {
        title: "Schede di Allenamento",
        description: "Crea, gestisci e condividi i tuoi programmi di allenamento.",
        createNewPlanButton: "Crea Nuova Scheda",
        exercisesLabel: "Esercizi",
        estDurationLabel: "Durata Stimata",
        startButton: "Inizia",
        dialogEditTitle: "Modifica Scheda Allenamento",
        dialogEditDescription: "Aggiorna i dettagli della tua scheda di allenamento.",
        dialogCreateTitle: "Crea Nuova Scheda Allenamento",
        dialogCreateDescription: "Progetta la tua nuova scheda di allenamento.",
        planNameLabel: "Nome Scheda",
        descriptionLabel: "Descrizione",
        exerciseSelectionPlaceholder: "La selezione degli esercizi e i dettagli di serie/ripetizioni andrebbero qui.",
        addExerciseButton: "Aggiungi Esercizio",
        cancelButton: "Annulla",
        savePlanButton: "Salva Scheda",
        toastPlanUpdatedTitle: "Scheda Aggiornata",
        toastPlanUpdatedDescription: "La scheda \"{planName}\" è stata aggiornata.",
        toastPlanCreatedTitle: "Scheda Creata",
        toastPlanCreatedDescription: "La scheda \"{planName}\" è stata creata.",
        toastPlanDeletedTitle: "Scheda Eliminata",
        toastPlanDeletedDescription: "La scheda \"{planName}\" è stata eliminata.",
        toastLinkCopiedTitle: "Link Copiato!",
        toastLinkCopiedDescription: "Link della scheda di allenamento copiato negli appunti."
    },
    startWorkoutPage: {
      title: "Inizia Nuovo Allenamento",
      description: "Scegli una scheda da iniziare o avvia una sessione libera.",
      selectPlanTitle: "Seleziona una Scheda",
      startAdHocButton: "Inizia Allenamento Libero",
      noPlansAvailable: "Nessuna scheda di allenamento disponibile. Creane una prima!",
      startPlanButton: "Inizia Scheda",
    },
    activeWorkoutPage: {
      title: "Allenamento Attivo: {planName}",
      description: "Traccia serie, ripetizioni e pesi per questa sessione.",
      finishWorkoutButton: "Termina Allenamento",
      exerciseLabel: "Esercizio",
      setsLabel: "Serie",
      repsLabel: "Ripetizioni",
      weightLabel: "Peso (kg)",
      logSetButton: "Registra Serie",
      planNotFound: "Scheda di allenamento non trovata.",
    }
  },
};


interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let clientInitialLanguage = DEFAULT_LANGUAGE;
    try {
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (storedLanguage && translations[storedLanguage]) {
        clientInitialLanguage = storedLanguage;
      } else {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
      }
    } catch (e) {
      console.warn('LanguageProvider: Failed to access localStorage. Using default language.', e);
    }
    
    if (clientInitialLanguage !== language) { // `language` here is defaultLanguage from useState
      setLanguageState(clientInitialLanguage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const setLanguage = useCallback((newLanguage: Language) => {
    if (translations[newLanguage]) {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      } catch (e) {
         console.warn('LanguageProvider: Failed to save language to localStorage.', e);
      }
      setLanguageState(newLanguage);
    } else {
      console.warn(`LanguageProvider: Attempted to set unsupported language "${newLanguage}"`);
    }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    if (!isClient) { // Don't translate on server or before hydration
        // Attempt to get the key from default language for SSR consistency if needed, or just return key
        const keys = key.split('.');
        let defaultResult: any = translations[DEFAULT_LANGUAGE];
        for (const k of keys) {
            defaultResult = defaultResult?.[k];
            if (defaultResult === undefined) return key;
        }
        if (typeof defaultResult === 'string' && replacements) {
          return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
            return acc.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
          }, defaultResult);
        }
        return typeof defaultResult === 'string' ? defaultResult : key;
    }

    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations[DEFAULT_LANGUAGE];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) {
                return key; 
            }
        }
        result = fallbackResult;
        break; 
      }
    }
    
    if (typeof result === 'string' && replacements) {
      return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
        return acc.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      }, result);
    }

    return typeof result === 'string' ? result : key;
  }, [language, isClient]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
