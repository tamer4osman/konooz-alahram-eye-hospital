export interface PatientProfile {
  id: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodGroup: string;
  cityAr: string;
  cityEn: string;
  insuranceProviderId: string;
  insuranceProviderName: string;
  insurancePolicyNo: string;
  allergiesAr: string[];
  allergiesEn: string[];
  chronicConditionsAr: string[];
  chronicConditionsEn: string[];
  emergencyContact: {
    name: string;
    relationAr: string;
    relationEn: string;
    phone: string;
  };
  securitySettings?: {
    passwordLastChanged: string;
    twoFactorEnabled: boolean;
    lastLoginTimestamp: string;
  };
  refractiveData: {
    odSphere: string;
    odCyl: string;
    odAxis: string;
    osSphere: string;
    osCyl: string;
    osAxis: string;
    lastChecked: string;
  };
  communicationPreferences: {
    emailNotifications: boolean;
    whatsappAlerts: boolean;
    appointmentReminders: boolean;
    eyeDropScheduleAlerts: boolean;
    postOpCareGuides: boolean;
    queueTurnAlerts: boolean;
    newsletterSubscribed: boolean;
    newsletterTopics: string[];
  };
  appointments: Array<{
    id: string;
    ticketNumber: string;
    doctorNameAr: string;
    doctorNameEn: string;
    specialtyAr: string;
    specialtyEn: string;
    date: string;
    time: string;
    status: 'confirmed' | 'completed' | 'in_queue' | 'scheduled';
    room: string;
    instructionsAr?: string;
    instructionsEn?: string;
  }>;
  prescriptions: Array<{
    id: string;
    date: string;
    doctorAr: string;
    doctorEn: string;
    diagnosisAr: string;
    diagnosisEn: string;
    medications: Array<{
      name: string;
      dosageAr: string;
      dosageEn: string;
      frequencyAr: string;
      frequencyEn: string;
      targetEye: 'OD' | 'OS' | 'Both';
      durationAr: string;
      durationEn: string;
    }>;
  }>;
  notificationHistory: Array<{
    id: string;
    channel: 'whatsapp' | 'email';
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    timestamp: string;
    status: 'delivered' | 'sent' | 'read';
  }>;
}


export interface NewsletterTopic {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  frequencyAr: string;
  frequencyEn: string;
}

export interface NewsletterIssue {
  id: string;
  date: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  readTimeAr: string;
  readTimeEn: string;
  summaryAr: string;
  summaryEn: string;
}
