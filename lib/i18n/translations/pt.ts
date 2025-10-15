/**
 * Portuguese (Brazil) Translations
 *
 * Traduções em Português para o aplicativo SHARPENED
 */

export const pt = {
  // ============================================================================
  // COMUM
  // ============================================================================
  common: {
    appName: 'SHARPENED',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Concluído',
    close: 'Fechar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    clear: 'Limpar',
    apply: 'Aplicar',
    retry: 'Tentar Novamente',
    viewAll: 'Ver Tudo',
    learnMore: 'Saiba Mais',
  },

  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================
  auth: {
    login: 'Entrar',
    loginTitle: 'BEM-VINDO DE VOLTA',
    loginSubtitle: 'Entre na sua conta',
    email: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Digite sua senha',
    forgotPassword: 'Esqueceu a senha?',
    dontHaveAccount: 'Não tem uma conta?',
    loginButton: 'ENTRAR',
    loggingIn: 'Entrando...',

    signup: 'Cadastrar',
    signupTitle: 'COMECE SUA JORNADA',
    signupSubtitle: 'Crie sua conta gratuita',
    fullName: 'Nome Completo',
    fullNamePlaceholder: 'João Silva',
    alreadyHaveAccount: 'Já tem uma conta?',
    signupButton: 'CRIAR CONTA',
    signingUp: 'Criando conta...',

    continueWithGoogle: 'Continuar com Google',
    continueWithApple: 'Continuar com Apple',
    orDivider: 'OU',

    logout: 'Sair',
    logoutConfirm: 'Tem certeza que deseja sair?',

    invalidCredentials: 'E-mail ou senha inválidos',
    emailRequired: 'E-mail é obrigatório',
    passwordRequired: 'Senha é obrigatória',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    accountExists: 'Já existe uma conta com este e-mail',
    signupFailed: 'Falha ao criar conta. Tente novamente.',
    loginFailed: 'Falha ao entrar. Tente novamente.',
  },

  // ============================================================================
  // NAVEGAÇÃO
  // ============================================================================
  nav: {
    home: 'Início',
    dashboard: 'Painel',
    nutrition: 'Nutrição',
    activities: 'Atividades',
    coach: 'Coach IA',
    profile: 'Perfil',
    settings: 'Configurações',
  },

  // ============================================================================
  // NUTRIÇÃO
  // ============================================================================
  nutrition: {
    title: 'Rastreador de Nutrição',
    pageTitle: 'RASTREADOR DE NUTRIÇÃO',
    searchFoods: 'Buscar alimentos...',
    recentMeals: 'Refeições Recentes',
    logMeal: 'Registrar Refeição',
    logNewMeal: 'Registrar Nova Refeição',
    mealLogged: 'Refeição registrada com sucesso',
    deleteMeal: 'Excluir Refeição',
    deleteMealConfirm: 'Tem certeza que deseja excluir esta refeição?',

    // Página de registro
    quickMeals: 'Refeições Rápidas',
    recentFoods: 'Alimentos Recentes',
    buildingMeal: 'Montando Refeição',
    saveAsQuickMeal: 'Salvar como Refeição Rápida',
    noFoodsFound: 'Nenhum alimento encontrado',
    total: 'Total',
    logging: 'Registrando...',
    addToMeal: 'Adicionar à Refeição',
    unit: 'Unidade',
    quantity: 'Quantidade',
    servingSize: 'Tamanho da Porção',
    nutrition: 'Nutrição',
    invalidInput: 'Entrada inválida',

    // Modal de refeição rápida
    saveQuickMealTitle: 'Salvar como Refeição Rápida',
    quickMealName: 'Nome',
    quickMealNamePlaceholder: 'ex: Shake Matinal de Proteína',
    quickMealDescription: 'Descrição (opcional)',
    quickMealDescriptionPlaceholder: 'ex: Combustível pré-treino',
    saving: 'Salvando...',

    // Resumo diário
    dailyCalorieGoal: 'Meta Diária de Calorias',
    caloriesPerDay: 'calorias/dia',
    remaining: 'restantes',
    over: 'acima',
    todaysMeals: 'Refeições de Hoje',
    meal: 'refeição',
    meals: 'refeições',
    noMealsLogged: 'Nenhuma Refeição Registrada',
    startTracking: 'Comece a rastrear sua nutrição registrando sua primeira refeição',

    // Tipos de composição de alimentos
    composedMeal: 'Refeição composta',
    branded: 'Marca registrada',

    // Unidades
    calPerHundredG: 'cal por 100g',

    // Macros
    calories: 'Calorias',
    protein: 'Proteína',
    carbs: 'Carboidratos',
    fats: 'Gorduras',
    fiber: 'Fibras',
    sugar: 'Açúcar',

    // Tipos de refeição
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
    other: 'Outro',

    // Porções
    serving: 'Porção',
    servings: 'Porções',
    grams: 'Gramas',
    gramsShort: 'g',
    ounces: 'oz',
    cups: 'xícaras',
    tablespoons: 'colheres de sopa',
    teaspoons: 'colheres de chá',

    // Itens
    item: 'item',
    items: 'itens',

    // Ações
    backToNutrition: 'Voltar para nutrição',

    // Erros
    failedToLogQuickMeal: 'Falha ao registrar refeição rápida. Tente novamente.',
    failedToAddItem: 'Falha ao adicionar item à refeição',
    failedToUpdateItem: 'Falha ao atualizar item',
    pleaseAddOneItem: 'Por favor, adicione pelo menos um alimento',
    pleaseProvideName: 'Por favor, forneça um nome para sua refeição rápida',
    failedToSaveQuickMeal: 'Falha ao salvar refeição rápida. Tente novamente.',
    failedToLogMeal: 'Falha ao registrar refeição. Tente novamente.',
    failedToLoadData: 'Falha ao carregar dados de nutrição',
    failedToDeleteMeal: 'Falha ao excluir refeição. Tente novamente.',
    unableToLoadData: 'Não Foi Possível Carregar Dados',
    tryAgain: 'Tentar Novamente',

    // Sucesso
    quickMealSaved: 'Refeição rápida salva com sucesso!',

    // Carregamento
    verifyingAuth: 'Verificando autenticação...',
    loadingNutritionData: 'Carregando dados de nutrição...',
  },

  // ============================================================================
  // ATIVIDADES
  // ============================================================================
  activities: {
    title: 'Rastreador de Atividades',
    pageTitle: 'RASTREADOR DE ATIVIDADES',
    log: '+ Registrar',
    logActivity: 'Registrar Atividade',
    recentActivities: 'Atividades Recentes',
    activityLogged: 'Atividade registrada com sucesso',
    deleteActivity: 'Excluir Atividade',
    deleteActivityConfirm: 'Excluir esta atividade? Esta ação não pode ser desfeita.',

    // Tipos de atividade
    strength: 'Treinamento de Força',
    cardio: 'Cardio',
    sports: 'Esportes',
    flexibility: 'Flexibilidade',
    other: 'Outro',

    // Cabeçalhos de data
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',

    // Visões
    recent: 'Recentes',
    thisWeek: 'Esta Semana',
    prevWeek: 'Semana Anterior',
    nextWeek: 'Próxima Semana',

    // Métricas
    duration: 'Duração',
    distance: 'Distância',
    caloriesBurned: 'Calorias Queimadas',
    sets: 'Séries',
    reps: 'Repetições',
    weight: 'Peso',
    minutes: 'minutos',
    kilometers: 'km',
    miles: 'milhas',

    // Estado vazio
    noActivitiesLogged: 'Nenhuma Atividade Ainda',
    startLogging: 'Registre sua primeira atividade para começar a rastrear seu progresso fitness!',

    // Erros
    failedToLoad: 'Falha ao carregar atividades. Tente novamente.',
    failedToDelete: 'Falha ao excluir atividade. Tente novamente.',

    // Carregamento
    loadingActivities: 'Carregando atividades...',
  },

  // ============================================================================
  // PERFIL
  // ============================================================================
  profile: {
    title: 'Perfil',
    pageTitle: 'PERFIL',
    editProfile: 'Editar Perfil',
    personalInfo: 'Informações Pessoais',
    goals: 'Objetivos',
    preferences: 'Preferências',
    backToDashboard: 'Voltar ao painel',
    signOut: 'Sair',
    welcomeBack: 'Bem-vindo de volta',

    // Seções
    basicInfo: 'Informações Básicas',
    physicalStats: 'Estatísticas Físicas',
    goalsTraining: 'Objetivos e Treino',
    nutritionPlan: 'Plano Nutricional',
    dietaryPreferences: 'Preferências Alimentares',
    lifestyle: 'Estilo de Vida',
    consultation: 'Consulta',

    // Campos
    fullName: 'Nome Completo',
    name: 'Nome',
    email: 'E-mail',
    memberSince: 'Membro Desde',
    onboardingCompleted: 'Integração Completa',
    age: 'Idade',
    sex: 'Sexo',
    height: 'Altura',
    weight: 'Peso',
    currentWeight: 'Peso Atual',
    goalWeight: 'Peso Meta',
    activityLevel: 'Nível de Atividade',
    primaryGoal: 'Objetivo Principal',
    experienceLevel: 'Nível de Experiência',
    workoutFrequency: 'Frequência de Treino',
    estimatedTDEE: 'TDEE Estimado',
    macrosLastCalculated: 'Macros Calculados em',
    dietaryPreference: 'Preferência Alimentar',
    foodAllergies: 'Alergias Alimentares',
    foodsToAvoid: 'Alimentos a Evitar',
    mealsPerDay: 'Refeições por Dia',
    cooksRegularly: 'Cozinha Regularmente',
    sleepHours: 'Horas de Sono',
    stressLevel: 'Nível de Estresse',
    language: 'Idioma',
    unitSystem: 'Sistema de Unidades',
    timezone: 'Fuso Horário',

    // Valores
    years: 'anos',
    timesPerWeek: 'x por semana',
    cal: 'cal',
    hoursPerNight: 'horas/noite',
    yes: 'Sim',
    no: 'Não',
    none: 'Nenhum',
    notSet: 'Não definido',
    unknown: 'Desconhecido',

    // Níveis de atividade
    sedentary: 'Sedentário',
    lightlyActive: 'Levemente Ativo',
    moderatelyActive: 'Moderadamente Ativo',
    veryActive: 'Muito Ativo',
    extremelyActive: 'Extremamente Ativo',

    // Objetivos
    loseWeight: 'Perder Peso',
    maintainWeight: 'Manter Peso',
    gainMuscle: 'Ganhar Músculo',
    buildMuscle: 'Construir Músculo',
    improveHealth: 'Melhorar Saúde',
    improvePerformance: 'Melhorar Performance',

    // Níveis de experiência
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',

    // Sexo biológico
    male: 'Masculino',
    female: 'Feminino',

    // Preferências alimentares
    noRestrictions: 'Sem Restrições',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    pescatarian: 'Pescetariano',
    keto: 'Cetogênica',
    paleo: 'Paleo',

    // Níveis de estresse
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',

    // Sistemas de unidades
    metric: 'Métrico (kg, cm)',
    imperial: 'Imperial (lbs, in)',

    // Consulta
    consultationCompleted: 'Consulta Completa',
    completedOn: 'Completa em',
    youHaveCompleted: 'Você completou uma consulta',

    // Plano nutricional
    dailyCalorieGoal: 'Meta Diária de Calorias',
    caloriesPerDay: 'calorias/dia',

    // Erros
    unableToLoad: 'Não Foi Possível Carregar Perfil',
    failedToLoad: 'Falha ao carregar perfil',
    tryAgain: 'Tentar Novamente',

    // Sucesso
    profileUpdated: 'Perfil atualizado com sucesso!',

    // Carregamento
    loadingProfile: 'Carregando seu perfil...',
  },

  // ============================================================================
  // INTEGRAÇÃO (ONBOARDING)
  // ============================================================================
  onboarding: {
    stepIndicator: 'Passo {{current}} de {{total}}',

    step1Title: 'BEM-VINDO AO SHARPENED',
    step1Subtitle: 'Vamos personalizar sua experiência',
    primaryGoal: 'Qual é seu objetivo principal?',
    loseWeight: 'Perder Peso',
    buildMuscle: 'Ganhar Músculo',
    maintain: 'Manter Peso',
    improvePerformance: 'Melhorar Performance',
    experienceLevel: 'Nível de Experiência Fitness',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    workoutFrequency: 'Treinos por semana',

    step2Title: 'ESTATÍSTICAS FÍSICAS',
    step2Subtitle: 'Para cálculos precisos de calorias',
    unitSystem: 'Unidades Preferidas',
    metric: 'Métrico',
    imperial: 'Imperial',
    age: 'Idade',
    biologicalSex: 'Sexo Biológico',
    male: 'Masculino',
    female: 'Feminino',
    height: 'Altura',
    currentWeight: 'Peso Atual',
    goalWeight: 'Peso Meta',

    step3Title: 'NÍVEL DE ATIVIDADE',
    step3Subtitle: 'Quão ativo você é?',
    sedentary: 'Sedentário',
    sedentaryDesc: 'Trabalho de escritório, pouco exercício',
    lightlyActive: 'Levemente Ativo',
    lightlyActiveDesc: 'Exercício leve 1-3 dias/semana',
    moderatelyActive: 'Moderadamente Ativo',
    moderatelyActiveDesc: 'Exercício moderado 3-5 dias/semana',
    veryActive: 'Muito Ativo',
    veryActiveDesc: 'Exercício intenso 6-7 dias/semana',
    extremelyActive: 'Extremamente Ativo',
    extremelyActiveDesc: 'Atleta ou trabalho físico',

    step4Title: 'PERFIL ALIMENTAR',
    step4Subtitle: 'Suas preferências alimentares',
    dietaryPreference: 'Preferência Alimentar',
    none: 'Sem Restrições',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    pescatarian: 'Pescetariano',
    keto: 'Cetogênica',
    paleo: 'Paleo',
    foodAllergies: 'Alergias Alimentares',
    foodsToAvoid: 'Alimentos a Evitar',
    mealsPerDay: 'Refeições por Dia',

    step5Title: 'ESTILO DE VIDA',
    step5Subtitle: 'Apenas mais algumas perguntas',
    sleepHours: 'Horas de Sono',
    stressLevel: 'Nível de Estresse',
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',
    cooksRegularly: 'Você cozinha?',
    yes: 'Sim',
    sometimes: 'Às vezes',
    rarely: 'Raramente',

    step6Title: 'SUAS METAS',
    step6Subtitle: 'Calculado apenas para você',
    calculating: 'Calculando...',
    bmr: 'TMB',
    tdee: 'TDEE',
    dailyCalories: 'Calorias Diárias',
    dailyProtein: 'Proteína',
    dailyCarbs: 'Carboidratos',
    dailyFats: 'Gorduras',
    autoAdjust: 'As metas se ajustam automaticamente quando você atualiza seu perfil',
    complete: 'Completar Integração',

    back: 'Voltar',
    next: 'Próximo',
  },

  // ============================================================================
  // ERROS
  // ============================================================================
  errors: {
    somethingWentWrong: 'Algo deu errado',
    pleaseTryAgain: 'Por favor, tente novamente',
    networkError: 'Erro de rede. Verifique sua conexão com a internet.',

    profileNotFound: 'Perfil não encontrado',
    mealNotFound: 'Refeição não encontrada',
    activityNotFound: 'Atividade não encontrada',
    conversationNotFound: 'Conversa não encontrada',

    requiredField: 'Este campo é obrigatório',
    invalidEmail: 'Endereço de e-mail inválido',
    invalidNumber: 'Deve ser um número válido',
    tooShort: 'Muito curto',
    tooLong: 'Muito longo',
  },

  // ============================================================================
  // MENSAGENS DE SUCESSO
  // ============================================================================
  success: {
    profileUpdated: 'Perfil atualizado com sucesso',
    mealLogged: 'Refeição registrada com sucesso',
    mealDeleted: 'Refeição excluída com sucesso',
    activityLogged: 'Atividade registrada com sucesso',
    activityDeleted: 'Atividade excluída com sucesso',
    settingsSaved: 'Configurações salvas com sucesso',
    onboardingCompleted: 'Bem-vindo ao SHARPENED!',
  },
} as const

export default pt
