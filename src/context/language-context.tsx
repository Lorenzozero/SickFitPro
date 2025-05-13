
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
      dashboard: 'Home',
      exercises: 'Exercises',
      workoutPlans: 'Workout Plans',
      calendar: 'Calendar',
      progress: 'Progress',
      diet: 'Diet', // Added Diet
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
      workoutsPlannedToday: 'Workouts Planned Today',
      workoutsThisWeek: 'Workouts This Week', // e.g., 3/5
      weightLifted: 'Total Weight Lifted', 
      currentWeight: 'Current Weight',
      quickActions: 'Quick Actions', // Will be removed from UI but key remains for now
      quickActionsDescription: 'Jump right into your fitness routine.', // Will be removed from UI
      logNewWorkout: 'Start Workout',
      todaysFocus: "Today's Focus",
      todaysFocusDescription: "What's on the agenda for today?",
      checkCalendarForWorkout: "Check your calendar for today's workout!",
      viewCalendarToSeeWorkout: "Your scheduled workout will appear here.",
      viewFullSchedule: 'View Full Schedule',
      dietAndHydrationTitle: "Diet & Hydration",
      dietAndHydrationDescription: "Track your nutrition and water intake.",
    },
    waterIntakeCard: {
      title: "Water Intake",
      description: "Stay hydrated! Your goal: {goal} L",
      currentIntakeLabel: "Current: {current} / {goal}",
      addWaterButton: "Add Water",
      resetWaterButton: "Reset Water",
      waterResetTitle: "Water Reset",
      waterResetDescription: "Your water intake for the day has been reset.",
    },
    macroTrackingCard: {
        title: "Macro Tracking",
        description: "Monitor your daily protein, carbs, and fat intake.",
        proteinLabel: "Protein",
        carbsLabel: "Carbs",
        fatLabel: "Fat",
        goalLabel: "Goal (g)",
        currentLabel: "Current (g)",
        setYourDailyGoals: "Set Your Daily Goals",
        logYourDailyIntake: "Log Your Daily Intake",
        saveGoalsButton: "Save Goals",
        saveIntakeButton: "Save Intake",
        goalsSavedTitle: "Macro Goals Saved",
        goalsSavedDescription: "Your daily macronutrient goals have been updated.",
        intakeSavedTitle: "Macro Intake Saved",
        intakeSavedDescription: "Your daily macronutrient intake has been recorded.",
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
    aiSplitForm: {
        cardTitle: "AI Fitness Advisor",
        cardDescription: "Get personalized training advice from our AI coach. Your recent training history will be automatically analyzed along with your goals.",
        trainingHistoryAutoCollectedInfo: "Your recent training history is automatically collected to provide personalized advice.",
        trainingGoalsLabel: "Training Goals",
        trainingGoalsPlaceholder: "e.g., Looking to gain muscle mass, improve strength in compound lifts, and increase overall endurance. Specifically want to grow my legs and shoulders.",
        trainingGoalsDescription: "What do you want to achieve with your training? (e.g., muscle gain, fat loss, strength increase)",
        trainingGoalsMinError: "Please describe your training goals (at least 10 characters).",
        getAISuggestionButton: "Get AI Advice",
        generatingSplitTitle: "Generating your advice...",
        generatingSplitDescription: "Our AI is thinking. This might take a moment.",
        yourSuggestedAdviceTitle: "Your AI Fitness Advice",
        suggestedKeyPointsLabel: "Key Suggestions:",
        detailedAnalysisLabel: "Detailed Analysis & Advice:",
        toastSuggestionReadyTitle: "Advice Ready!",
        toastSuggestionReadyDescription: "AI has generated training advice for you.",
        toastErrorTitle: "Error",
        toastErrorDescription: "Failed to get AI advice. Please try again.",
        errorFetchingHistory: "Could not automatically retrieve your training history. Please ensure you have some logged workouts.",
    },
    calendarPage: {
        title: "Workout Calendar",
        description: "Plan and track your weekly training schedule.",
        selectADate: "Select a Date",
        workoutsScheduledForThisDay: "Workouts scheduled for this day.",
        addWorkoutToDay: "Add Workout",
        noWorkoutsScheduled: "No workouts scheduled for this day.",
        selectDateToSeeWorkouts: "Select a date to see scheduled workouts.",
        dialogAddWorkoutTitle: "Add Workout to {dayOfWeek}",
        dialogAddWorkoutDescription: "Select a workout plan to schedule for this day of the week.",
        workoutPlanLabel: "Workout Plan",
        selectAPlanPlaceholder: "Select a plan",
        samplePlan1: "Full Body Blast",
        samplePlan2: "Upper Body Power",
        samplePlan3: "Leg Day Domination",
        samplePlan4: "Cardio Session",
        timeLabel: "Time", // Remains for potential future use, though UI hidden
        cancelButton: "Cancel",
        scheduleWorkoutButton: "Schedule Workout",
        loadingCalendar: "Loading calendar...",
        weeklyScheduleTitle: "Weekly Training Schedule",
        weeklyScheduleDescription: "Set up your typical training week. This schedule will repeat automatically.",
        days: {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
        },
        noWorkoutsForDayOfWeek: "No workouts scheduled for {dayOfWeek}.",
        addWorkoutTo: "Add to {dayOfWeek}",
        toastWorkoutScheduledTitle: "Workout Scheduled!",
        toastWorkoutScheduledDescriptionNoTime: "{planName} on {dayOfWeek}.",
        toastWorkoutRemovedTitle: "Workout Removed",
        errorSelectDayAndPlan: "Please select a day and a workout plan.",
        errorPlanNotFound: "Selected plan not found.",
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
        weeklyTrainingVolumeLabel: "Weekly Training Volume (kg)",
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
        uploadButtonLabel: "Upload",
        bodyMeasurementsCardTitle: "Body Measurements",
        bodyMeasurementsCardDescription: "Track your body measurements like weight, height, and muscle size over time.",
        addMeasurementButton: "Add Measurement",
        measurementDialogAddTitle: "Add New Measurement",
        measurementDialogEditTitle: "Edit Measurement",
        measurementDialogDescription: "Enter the details for your measurement.",
        formDateLabel: "Date",
        formMeasurementNameLabel: "Measurement Type",
        selectMeasurementNamePlaceholder: "Select measurement type",
        measurementNameBiceps: "Biceps",
        measurementNameChest: "Chest",
        measurementNameWaist: "Waist",
        measurementNameHips: "Hips",
        measurementNameThigh: "Thigh",
        measurementNameCalf: "Calf",
        measurementNameWeight: "Weight",
        measurementNameHeight: "Height",
        formValueLabel: "Value",
        formUnitLabel: "Unit",
        unitCM: "cm",
        unitIN: "in",
        unitKG: "kg",
        unitLBS: "lbs",
        formNotesLabel: "Notes",
        formNotesPlaceholder: "Enter any relevant notes...",
        saveMeasurementButton: "Save Measurement",
        tableHeaderDate: "Date",
        tableHeaderMeasurementName: "Measurement",
        tableHeaderValue: "Value",
        measurementReminderLabel: "Measurement Reminder",
        selectReminderFrequencyPlaceholder: "Select reminder frequency",
        reminderOff: "Off",
        reminderDaily: "Daily",
        reminderWeekly: "Weekly",
        reminderBiWeekly: "Bi-Weekly",
        reminderMonthly: "Monthly",
        measurementSaved: "Measurement Saved",
        measurementDeleted: "Measurement Deleted",
        noMeasurementsYet: "No measurements recorded yet. Add your first one!",
        formValidationAlert: "Please fill in date, measurement type, and value.",
        aiCoachCardTitle: "AI Fitness Coach",
        aiCoachCardDescription: "Get personalized advice and training plans. Your training data is automatically used to provide tailored suggestions.",
    },
    workoutPlansPage: {
        title: "Workout Plans", // Changed to "Workout Plans" for consistency, will be "Schede" in Italian
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
        exerciseNameLabel: "Exercise Name",
        setsLabel: "Sets",
        repsLabel: "Reps",
        addThisExerciseButton: "Add this Exercise",
        addedExercisesLabel: "Added Exercises:",
        noExercisesAddedYet: "No exercises added to this plan yet.",
        exerciseSelectionPlaceholder: "Add exercises to this plan using the form above.", // Updated placeholder
        addExerciseButton: "Add Exercise to Plan", // Button to add an exercise from inputs
        cancelButton: "Cancel",
        savePlanButton: "Save Plan",
        toastPlanUpdatedTitle: "Plan Updated",
        toastPlanUpdatedDescription: "\"{planName}\" has been updated.",
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
      logSetButton: "Log Set",
      planNotFound: "Workout plan not found.",
      planNotFoundDescription: "Please check the URL or go back to select a valid plan.",
      loadingWorkout: "Loading Workout...",
      loadingDescription: "Please wait while we fetch the plan details.",
      targetSetsLabel: "Target Sets",
      targetRepsLabel: "Target Reps",
      repsInputLabel: "Reps",
      weightInputLabel: "Weight (kg)",
      setColumnLabel: "Set",
      dateColumnLabel: "Date",
      repsColumnLabel: "Reps",
      weightColumnLabel: "Weight (kg)",
      toastSetLoggedTitle: "Set Logged",
      toastSetLoggedDescription: "Set for {exerciseName} recorded.",
      toastSetDeletedTitle: "Set Deleted",
      toastWorkoutFinishedTitle: "Workout Finished!",
      toastWorkoutFinishedDescription: "Great job completing your workout in {duration}!",
      overallProgressLabel: "Overall Workout Progress",
      setCompletionLabel: "Sets: {completed}/{total}",
      noGifAvailable: "No GIF available",
      exerciseDemoAlt: "exercise demonstration",
      nextExerciseButton: "Next Exercise",
      completeWorkoutButton: "Complete Workout",
      workoutCompleteTitle: "Workout Complete!",
      workoutCompleteDescription: "You've successfully completed the {planName} workout.",
      totalTimeLabel: "Total Time",
      backToDashboardButton: "Back to Home",
      confirmFinishTitle: "Finish Workout?",
      confirmFinishDescription: "Are you sure you want to mark this workout as complete?",
      confirmFinishButton: "Yes, Finish",
      noSetsLoggedYet: "No sets logged for this exercise yet.",
      sessionPBsLabel: "Session PBs",
      maxWeightLabel: "Max Weight",
      maxRepsLabel: "Max Reps",
      repsUnitLabel: "reps",
    },
    dietPage: { // Added Diet Page translations
        title: "Diet Tracking",
        description: "Manage your daily nutritional intake and hydration.",
        // ... other diet specific translations can be added here
    },
    toastErrorTitle: "Error",
  },
  it: {
    nav: {
      dashboard: 'Home', // Changed from "Cruscotto" to "Home"
      exercises: 'Esercizi',
      workoutPlans: 'Schede', // Changed from "Piani di Allenamento"
      calendar: 'Calendario',
      progress: 'Progressi',
      diet: 'Dieta', // Added Diet
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
      workoutsPlannedToday: 'Allenamenti Previsti Oggi',
      workoutsThisWeek: 'Allenamenti Settimanali', // es. 3/5
      weightLifted: 'Peso Totale Sollevato',
      currentWeight: 'Peso Attuale',
      quickActions: 'Azioni Rapide', // Will be removed from UI
      quickActionsDescription: 'Entra subito nella tua routine di fitness.', // Will be removed from UI
      logNewWorkout: 'Inizia Allenamento', // Changed from "Registra Nuovo Allenamento"
      todaysFocus: "Focus di Oggi",
      todaysFocusDescription: "Cosa c'è in programma per oggi?",
      checkCalendarForWorkout: "Controlla il calendario per l'allenamento di oggi!",
      viewCalendarToSeeWorkout: "Il tuo allenamento programmato apparirà qui.",
      viewFullSchedule: 'Visualizza Programma Completo',
      dietAndHydrationTitle: "Dieta e Idratazione",
      dietAndHydrationDescription: "Monitora la tua nutrizione e l'apporto idrico.",
    },
    waterIntakeCard: {
      title: "Apporto Idrico",
      description: "Rimani idratato! Il tuo obiettivo: {goal} L",
      currentIntakeLabel: "Attuale: {current} / {goal}",
      addWaterButton: "Aggiungi Acqua",
      resetWaterButton: "Resetta Acqua",
      waterResetTitle: "Apporto Idrico Azzerato",
      waterResetDescription: "Il tuo apporto idrico giornaliero è stato azzerato.",
    },
    macroTrackingCard: {
        title: "Monitoraggio Macro",
        description: "Monitora il tuo apporto giornaliero di proteine, carboidrati e grassi.",
        proteinLabel: "Proteine",
        carbsLabel: "Carboidrati",
        fatLabel: "Grassi",
        goalLabel: "Obiettivo (g)",
        currentLabel: "Attuale (g)",
        setYourDailyGoals: "Imposta i Tuoi Obiettivi Giornalieri",
        logYourDailyIntake: "Registra il Tuo Apporto Giornaliero",
        saveGoalsButton: "Salva Obiettivi",
        saveIntakeButton: "Salva Apporto",
        goalsSavedTitle: "Obiettivi Macro Salvati",
        goalsSavedDescription: "I tuoi obiettivi giornalieri di macronutrienti sono stati aggiornati.",
        intakeSavedTitle: "Apporto Macro Salvato",
        intakeSavedDescription: "Il tuo apporto giornaliero di macronutrienti è stato registrato.",
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
    aiSplitForm: {
        cardTitle: "Consulente Fitness AI",
        cardDescription: "Ottieni consigli di allenamento personalizzati dal nostro coach AI. Il tuo storico allenamenti recente verrà analizzato automaticamente insieme ai tuoi obiettivi.",
        trainingHistoryAutoCollectedInfo: "Il tuo storico allenamenti recente viene raccolto automaticamente per fornire consigli personalizzati.",
        trainingGoalsLabel: "Obiettivi di Allenamento",
        trainingGoalsPlaceholder: "es., Vorrei aumentare la massa muscolare, migliorare la forza nei composti e aumentare la resistenza generale. Voglio far crescere gambe e spalle.",
        trainingGoalsDescription: "Cosa vuoi ottenere con il tuo allenamento? (es. aumento massa, perdita grasso, aumento forza)",
        trainingGoalsMinError: "Descrivi i tuoi obiettivi di allenamento (almeno 10 caratteri).",
        getAISuggestionButton: "Ottieni Consigli AI",
        generatingSplitTitle: "Sto generando i tuoi consigli...",
        generatingSplitDescription: "La nostra AI sta elaborando. Potrebbe volerci un momento.",
        yourSuggestedAdviceTitle: "I Tuoi Consigli dal Coach AI",
        suggestedKeyPointsLabel: "Suggerimenti Chiave:",
        detailedAnalysisLabel: "Analisi Dettagliata e Consigli:",
        toastSuggestionReadyTitle: "Consigli Pronti!",
        toastSuggestionReadyDescription: "L'AI ha generato consigli di allenamento per te.",
        toastErrorTitle: "Errore",
        toastErrorDescription: "Impossibile ottenere i consigli AI. Riprova.",
        errorFetchingHistory: "Impossibile recuperare automaticamente il tuo storico allenamenti. Assicurati di avere degli allenamenti registrati.",
    },
    calendarPage: {
        title: "Calendario Allenamenti",
        description: "Pianifica e monitora il tuo programma di allenamento settimanale.",
        selectADate: "Seleziona una Data",
        workoutsScheduledForThisDay: "Allenamenti programmati per questo giorno.",
        addWorkoutToDay: "Aggiungi Allenamento",
        noWorkoutsScheduled: "Nessun allenamento programmato per questo giorno.",
        selectDateToSeeWorkouts: "Seleziona una data per vedere gli allenamenti programmati.",
        dialogAddWorkoutTitle: "Aggiungi Allenamento a {dayOfWeek}",
        dialogAddWorkoutDescription: "Seleziona una scheda di allenamento da programmare per questo giorno della settimana.",
        workoutPlanLabel: "Scheda Allenamento",
        selectAPlanPlaceholder: "Seleziona una scheda",
        samplePlan1: "Scheda Total Body",
        samplePlan2: "Scheda Parte Superiore",
        samplePlan3: "Scheda Gambe Intensa",
        samplePlan4: "Sessione Cardio",
        timeLabel: "Ora", // Rimane per uso futuro, UI nascosta
        cancelButton: "Annulla",
        scheduleWorkoutButton: "Programma Allenamento",
        loadingCalendar: "Caricamento calendario...",
        weeklyScheduleTitle: "Programma Allenamento Settimanale",
        weeklyScheduleDescription: "Imposta la tua settimana di allenamento tipo. Questo programma si ripeterà automaticamente.",
        days: {
          monday: "Lunedì",
          tuesday: "Martedì",
          wednesday: "Mercoledì",
          thursday: "Giovedì",
          friday: "Venerdì",
          saturday: "Sabato",
          sunday: "Domenica",
        },
        noWorkoutsForDayOfWeek: "Nessun allenamento programmato per {dayOfWeek}.",
        addWorkoutTo: "Aggiungi a {dayOfWeek}",
        toastWorkoutScheduledTitle: "Allenamento Programmato!",
        toastWorkoutScheduledDescriptionNoTime: "{planName} il {dayOfWeek}.",
        toastWorkoutRemovedTitle: "Allenamento Rimosso",
        errorSelectDayAndPlan: "Seleziona un giorno e una scheda di allenamento.",
        errorPlanNotFound: "Scheda selezionata non trovata.",
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
        weeklyTrainingVolumeLabel: "Volume Allenamento Settimanale (kg)",
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
        bodyMeasurementsCardTitle: "Misure Corporee",
        bodyMeasurementsCardDescription: "Traccia le tue misure corporee come peso, altezza e circonferenze muscolari nel tempo.",
        addMeasurementButton: "Aggiungi Misura",
        measurementDialogAddTitle: "Aggiungi Nuova Misura",
        measurementDialogEditTitle: "Modifica Misura",
        measurementDialogDescription: "Inserisci i dettagli per la tua misurazione.",
        formDateLabel: "Data",
        formMeasurementNameLabel: "Tipo Misurazione",
        selectMeasurementNamePlaceholder: "Seleziona tipo misurazione",
        measurementNameBiceps: "Bicipiti",
        measurementNameChest: "Petto",
        measurementNameWaist: "Vita",
        measurementNameHips: "Fianchi",
        measurementNameThigh: "Coscia",
        measurementNameCalf: "Polpaccio",
        measurementNameWeight: "Peso",
        measurementNameHeight: "Altezza",
        formValueLabel: "Valore",
        formUnitLabel: "Unità",
        unitCM: "cm",
        unitIN: "pollici",
        unitKG: "kg",
        unitLBS: "libbre",
        formNotesLabel: "Note",
        formNotesPlaceholder: "Inserisci eventuali note pertinenti...",
        saveMeasurementButton: "Salva Misura",
        tableHeaderDate: "Data",
        tableHeaderMeasurementName: "Misurazione",
        tableHeaderValue: "Valore",
        measurementReminderLabel: "Promemoria Misurazioni",
        selectReminderFrequencyPlaceholder: "Seleziona frequenza promemoria",
        reminderOff: "Spento",
        reminderDaily: "Giornaliero",
        reminderWeekly: "Settimanale",
        reminderBiWeekly: "Bisettimanale",
        reminderMonthly: "Mensile",
        measurementSaved: "Misura Salvata",
        measurementDeleted: "Misura Eliminata",
        noMeasurementsYet: "Nessuna misura registrata. Aggiungi la prima!",
        formValidationAlert: "Compila data, tipo misurazione e valore.",
        aiCoachCardTitle: "Coach Fitness AI",
        aiCoachCardDescription: "Ottieni consigli personalizzati e piani di allenamento. I tuoi dati di allenamento vengono usati automaticamente per fornire suggerimenti su misura.",
    },
     workoutPlansPage: {
        title: "Schede Allenamento", // Key "Piani di Allenamento" changed to "Schede"
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
        exerciseNameLabel: "Nome Esercizio",
        setsLabel: "Serie",
        repsLabel: "Ripetizioni",
        addThisExerciseButton: "Aggiungi Esercizio",
        addedExercisesLabel: "Esercizi Aggiunti:",
        noExercisesAddedYet: "Nessun esercizio aggiunto a questa scheda.",
        exerciseSelectionPlaceholder: "Aggiungi esercizi a questa scheda usando il modulo sopra.",
        addExerciseButton: "Aggiungi Esercizio alla Scheda",
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
      logSetButton: "Registra Serie",
      planNotFound: "Scheda di allenamento non trovata.",
      planNotFoundDescription: "Controlla l'URL o torna indietro per selezionare una scheda valida.",
      loadingWorkout: "Caricamento Allenamento...",
      loadingDescription: "Attendere prego, stiamo caricando i dettagli della scheda.",
      targetSetsLabel: "Serie Obiettivo",
      targetRepsLabel: "Ripetizioni Obiettivo",
      repsInputLabel: "Ripetizioni",
      weightInputLabel: "Peso (kg)",
      setColumnLabel: "Serie",
      dateColumnLabel: "Data",
      repsColumnLabel: "Ripetizioni",
      weightColumnLabel: "Peso (kg)",
      toastSetLoggedTitle: "Serie Registrata",
      toastSetLoggedDescription: "Serie per {exerciseName} registrata.",
      toastSetDeletedTitle: "Serie Eliminata",
      toastWorkoutFinishedTitle: "Allenamento Terminato!",
      toastWorkoutFinishedDescription: "Ottimo lavoro! Hai completato l'allenamento in {duration}!",
      overallProgressLabel: "Progresso Allenamento Complessivo",
      setCompletionLabel: "Serie: {completed}/{total}",
      noGifAvailable: "Nessun GIF disponibile",
      exerciseDemoAlt: "dimostrazione esercizio",
      nextExerciseButton: "Prossimo Esercizio",
      completeWorkoutButton: "Completa Allenamento",
      workoutCompleteTitle: "Allenamento Completato!",
      workoutCompleteDescription: "Hai completato con successo l'allenamento {planName}.",
      totalTimeLabel: "Tempo Totale",
      backToDashboardButton: "Torna alla Home",
      confirmFinishTitle: "Terminare Allenamento?",
      confirmFinishDescription: "Sei sicuro di voler contrassegnare questo allenamento come completato?",
      confirmFinishButton: "Sì, Termina",
      noSetsLoggedYet: "Nessuna serie registrata per questo esercizio.",
      sessionPBsLabel: "PB Sessione",
      maxWeightLabel: "Peso Max",
      maxRepsLabel: "Rip. Max",
      repsUnitLabel: "rip.",
    },
    dietPage: { // Added Diet Page translations
        title: "Monitoraggio Dieta",
        description: "Gestisci il tuo apporto nutrizionale giornaliero e l'idratazione.",
    },
    toastErrorTitle: "Errore",
  },
};


interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number | undefined>) => string;
  isClient: boolean;
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

    if (clientInitialLanguage !== language) {
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
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage;
      }
    } else {
      console.warn(`LanguageProvider: Attempted to set unsupported language "${newLanguage}"`);
    }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number | undefined>): string => {
    const currentLang = isClient ? language : DEFAULT_LANGUAGE; // Use state language if client, else default
    const keys = key.split('.');
    let result: any = translations[currentLang];

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to default language if key not found in current language
        if (currentLang !== DEFAULT_LANGUAGE) {
            let fallbackResult: any = translations[DEFAULT_LANGUAGE];
            for (const fk of keys) {
                fallbackResult = fallbackResult?.[fk];
                if (fallbackResult === undefined) {
                  // If still not found in default, return the key itself or a default from replacements
                  return replacements?.default?.toString() || key;
                }
            }
            result = fallbackResult; // Use the result from the default language
            break; // Exit loop as we found a fallback
        }
        // If not found in current (which might be default) or any fallback, return key or default
        return replacements?.default?.toString() || key;
      }
    }

    if (typeof result === 'string' && replacements) {
      // Make a copy of replacements to avoid modifying the original object
      const actualReplacements = { ...replacements };
      // Remove 'default' from replacements if it exists, as it's handled above
      delete actualReplacements.default;

      return Object.entries(actualReplacements).reduce((acc, [placeholder, value]) => {
        // Ensure value is string or number before trying to replace
        const replacementValue = (typeof value === 'string' || typeof value === 'number') ? String(value) : '';
        return acc.replace(new RegExp(`{${placeholder}}`, 'g'), replacementValue);
      }, result);
    }

    return typeof result === 'string' ? result : (replacements?.default?.toString() || key) ;
  }, [language, isClient]); // Depend on isClient


  useEffect(() => {
    if (isClient) { // Only run on client
      document.documentElement.lang = language;
    }
  }, [language, isClient]); // Depend on isClient

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isClient }}>
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
