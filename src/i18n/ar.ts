import type { Translations } from './en';

const ar: Translations = {
  appName: 'صيانة السيارات',
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جارٍ التحميل…',
    error: 'حدث خطأ ما',
  },
  auth: {
    signInTitle: 'تسجيل الدخول',
    signUpTitle: 'إنشاء حساب',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'دخول',
    signUp: 'إنشاء الحساب',
    noAccount: 'ليس لديك حساب؟ أنشئ حسابًا',
    haveAccount: 'لديك حساب بالفعل؟ سجّل الدخول',
    signOut: 'تسجيل الخروج',
    continueWithGoogle: 'الدخول بحساب Gmail',
    or: 'أو',
    googleMissing: 'لم يتم إعداد الدخول بحساب Gmail بعد. أضف معرّفات Google في ملف ‎.env.',
    missingFields: 'من فضلك املأ جميع الحقول.',
    passwordTooShort: 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    emailInUse: 'هذا البريد الإلكتروني مسجّل بالفعل.',
    firebaseMissing:
      'لم يتم إعداد Firebase بعد. أضف مفاتيح Firebase في ملف ‎.env ثم أعد تشغيل التطبيق.',
  },
  home: {
    title: 'سياراتي',
    greeting: 'مرحبًا، {{name}}',
    empty: 'لا توجد سيارات بعد. أضف سيارتك الأولى لبدء متابعة صيانتها.',
    addCar: 'إضافة سيارة',
  },
  settings: {
    title: 'الإعدادات',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    restartTitle: 'يلزم إعادة التشغيل',
    restartBody: 'أغلق التطبيق وافتحه مرة أخرى لتطبيق اتجاه الكتابة الجديد.',
    account: 'الحساب',
  },
};

export default ar;
