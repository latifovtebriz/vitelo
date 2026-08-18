export type Language = 'az' | 'en' | 'tr';

export interface Translations {
  nav: {
    templates: string;
    examples: string;
    coverLetter: string;
    atsChecker: string;
    pricing: string;
    login: string;
    getStarted: string;
    dashboard: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustBadge: string;
    statCvs: string;
    statRating: string;
    statPass: string;
    statCountries: string;
  };
  scanner: {
    badge: string;
    title: string;
    subtitle: string;
    placeholder: string;
    sampleBtn: string;
    scanBtn: string;
    scanning: string;
    resultScore: string;
    resultTitle: string;
    fixPrompt: string;
    fixCta: string;
  };
  howItWorks: {
    tag: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  pricing: {
    tag: string;
    title: string;
    subtitle: string;
    payAsYouGo: string;
    basicTitle: string;
    basicPrice: string;
    basicDesc: string;
    basicLimit: string;
    basicFeatures: string[];
    basicCta: string;
    proTitle: string;
    proPrice: string;
    proDesc: string;
    proLimit: string;
    proFeatures: string[];
    proCta: string;
    ultimateTitle: string;
    ultimatePrice: string;
    ultimateDesc: string;
    ultimateLimit: string;
    ultimateFeatures: string[];
    ultimateCta: string;
  };
  footer: {
    tagline: string;
    product: string;
    features: string;
    support: string;
    rights: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  az: {
    nav: {
      templates: 'Şablonlar',
      examples: 'CV Nümunələri',
      coverLetter: 'Cover Letter',
      atsChecker: 'ATS Yoxlayıcı',
      pricing: 'Qiymətlər',
      login: 'Daxil Ol',
      getStarted: 'CV Yarat — Pulsuz',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'AI Əsaslı · 100% ATS Uyğun · Pulsuz Başla',
      titleStart: 'Süni İntellekt ilə',
      titleHighlight: 'Xəyalındakı İşi',
      titleEnd: 'Qazan',
      subtitle:
        'Məlumatlarını daxil et — Gemini AI saniyələr içində CV-ni yazsın, fəaliyyət felləri ilə zənginləşdirsin və 95%+ ATS uyğunluğuna çatdırsın. Bakıdan Londona 10,000+ namizəd tərəfindən bəyənilib.',
      ctaPrimary: 'Öz CV-ni Yarat — Pulsuz',
      ctaSecondary: 'CV Nümunələrinə Bax',
      trustBadge: '✓ Kart tələb olunmur · ✓ Ön baxış pulsuzdur · ✓ Saniyədə ATS balı',
      statCvs: 'Yaradılmış CV',
      statRating: 'İstifadəçi Reytinqi',
      statPass: 'ATS Keçid Faizi',
      statCountries: 'Ölkədə İstifadə',
    },
    scanner: {
      badge: '⚡ 10 Saniyəlik Sürətli ATS Diaqnostikası',
      title: 'Köhnə CV-nin ATS Balını İndi Öyrən',
      subtitle: 'CV mətnini aşağıya yapışdır və dərhal xətalarını gör — heç bir qeydiyyat tələb olunmur.',
      placeholder: 'Köhnə CV mətnini və ya iş təcrübəni bura yapışdır (məs: "3 ildir .NET üzrə işləyirəm, mikroservislər qurmuşam...")...',
      sampleBtn: 'Nümunə Mətn Qoy',
      scanBtn: 'CV-ni İndi Skan Et',
      scanning: 'Gemini AI Skan Edir...',
      resultScore: 'ATS Uyğunluq Balın',
      resultTitle: 'Əsas Diaqnostika Nəticələri:',
      fixPrompt: 'Bu balı 95%-ə qaldırmaq və bütün xətaları AI ilə düzəltmək istəyirsən?',
      fixCta: 'Bu CV-ni Studiyada 1-Kliklə Düzəlt',
    },
    howItWorks: {
      tag: 'Necə İşləyir?',
      title: 'Boş Səhifədən Peşəkar CV-yə 3 Addımda',
      subtitle: 'Heç bir dizayn biliyinə ehtiyac yoxdur. Bütün mürəkkəb prosesi Vitelo AI həll edir.',
      step1Title: 'Məlumatlarını Daxil Et',
      step1Desc: 'Təcrübə və bacarıqlarını istənilən dildə (Azərbaycan, Türk, Rus) qeyd et. 3 dəqiqə çəkir.',
      step2Title: 'AI Optimallaşdırsın',
      step2Desc: 'Gemini AI hər bir cümləni Google XYZ metriklərinə və beynəlxalq ATS standartlarına çevirir.',
      step3Title: 'Yüklə və Müraciət Et',
      step3Desc: 'Vektor HD PDF yüklə və ya şəxsi Web CV linkini dərhal HR menecerlərə göndər.',
    },
    pricing: {
      tag: 'Şəffaf və Əlçatan Qiymətlər',
      title: 'Karyerana Uyğun Planı Seç',
      subtitle: 'İlk CV-ni tam pulsuz hazırla. Yalnız rəsmi təmiz sənədi yükləməyə hazır olanda ödə.',
      payAsYouGo: 'Hər CV üçün cəmi $3.99 və ya paketlər',
      basicTitle: 'Basic Plan',
      basicPrice: '$4.99',
      basicDesc: 'Tək vakansiya üçün sürətli və effektiv CV hazırlayanlar üçün.',
      basicLimit: 'Max 3 CV + 3 Cover Letter',
      basicFeatures: [
        '3 ədəd ATS-optimizasiyalı CV',
        '3 ədəd fərdiləşdirilmiş Cover Letter',
        'Minimal & Clean CV Şablonları',
        'Filigransız HD PDF yükləmə',
        'Şəxsi Web CV Linki & QR Kod',
      ],
      basicCta: 'Basic Planı Seç',
      proTitle: 'Pro Plan',
      proPrice: '$7.99',
      proDesc: 'Aktiv iş axtaranlar və bir neçə şirkətə müraciət edənlər üçün.',
      proLimit: 'Max 5 CV + 5 Cover Letter',
      proFeatures: [
        '5 ədəd Peşəkar CV',
        '5 ədəd Fərdiləşdirilmiş Cover Letter',
        'Bütün Pro Şablonlar (Berlin, Zurich, London)',
        'Vakansiya Linki ilə 1-Kliklə CV Uyğunlaşdırma',
        'Dərin ATS Diaqnostikası & 1-Klik AI Düzəliş',
        'Prioritet Dəstək',
      ],
      proCta: 'Pro Plana Keç — Ən Populyar',
      ultimateTitle: 'Ultimate Karyera Paketi',
      ultimatePrice: '$12.99',
      ultimateDesc: 'Beynəlxalq və yüksək maaşlı vəzifələri hədəfləyənlər üçün tam dəstək.',
      ultimateLimit: 'Max 8 CV + 8 Cover Letter',
      ultimateFeatures: [
        '8 ədəd Tam Fərdiləşdirilmiş CV',
        '8 ədəd AI Cover Letter',
        'Bütün Şablonlar və Xüsusi Rəng Palitraları',
        'AI Çoxdilli CV Tərcüməçisi (AZ/EN/TR/DE/RU)',
        'AI LinkedIn Profil Optimizer Paketi',
        '5 Fərdiləşdirilmiş Müsahibə Sual-Cavabı',
        'Maaş Analizatoru və Danışıq Bələdçisi',
      ],
      ultimateCta: 'Ultimate Paketi Seç',
    },
    footer: {
      tagline: 'Minlərlə namizədin etibar etdiyi AI əsaslı ATS CV və Karyera platforması.',
      product: 'MƏHSUL',
      features: 'FUNKSİYALAR',
      support: 'DƏSTƏK & HÜQUQİ',
      rights: 'Bütün hüquqlar qorunur.',
    },
  },
  en: {
    nav: {
      templates: 'Templates',
      examples: 'CV Examples',
      coverLetter: 'Cover Letter',
      atsChecker: 'ATS Checker',
      pricing: 'Pricing',
      login: 'Log In',
      getStarted: 'Create CV — Free',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'AI-Powered · 100% ATS-Optimized · Free to Start',
      titleStart: 'Land Your Dream Job with',
      titleHighlight: 'AI Precision',
      titleEnd: 'Faster',
      subtitle:
        'Fill in your details — Gemini AI writes, translates, and ATS-optimizes your CV in seconds with quantifiable Google XYZ metrics. Trusted by 10,000+ job seekers worldwide.',
      ctaPrimary: 'Create My CV — Free',
      ctaSecondary: 'Browse CV Examples',
      trustBadge: '✓ No credit card required · ✓ Free preview · ✓ Instant ATS score',
      statCvs: 'CVs Created',
      statRating: 'Average Rating',
      statPass: 'ATS Pass Rate',
      statCountries: 'Countries Active',
    },
    scanner: {
      badge: '⚡ 10-Second Live ATS Scanner',
      title: 'Scan Your Existing Resume Instantly',
      subtitle: 'Paste your current resume or bullet points to see your instant ATS score & fixes — zero sign-up required.',
      placeholder: 'Paste your existing resume text or experience bullets here (e.g. "Software Engineer with 3 years building microservices in .NET and Docker...")...',
      sampleBtn: 'Insert Sample Text',
      scanBtn: 'Scan My Resume Now',
      scanning: 'Gemini AI is analyzing...',
      resultScore: 'Your Instant ATS Score',
      resultTitle: 'Core Diagnostic Findings:',
      fixPrompt: 'Want to boost this score to 95%+ and fix all bullet points automatically?',
      fixCta: 'Fix in Studio with 1-Click AI',
    },
    howItWorks: {
      tag: 'How It Works',
      title: 'From Blank Page to Job-Ready CV in 3 Steps',
      subtitle: 'No design or copywriting experience required. Vitelo handles the heavy lifting.',
      step1Title: 'Fill Your Details',
      step1Desc: 'Enter your experience and skills in any language. Takes under 3 minutes.',
      step2Title: 'AI Optimizes',
      step2Desc: 'Gemini AI rewrites everything into ATS-ready bullet points with power action verbs.',
      step3Title: 'Download & Apply',
      step3Desc: 'Download clean vector PDF or share your responsive Web CV link directly with recruiters.',
    },
    pricing: {
      tag: 'Simple & Transparent Pricing',
      title: 'Choose the Right Plan for Your Career',
      subtitle: 'Build your first CV free. Pay only when you are ready to download official documents.',
      payAsYouGo: 'Single CV unlock for $3.99 or choose a package',
      basicTitle: 'Basic Plan',
      basicPrice: '$4.99',
      basicDesc: 'For targeted applications needing a single standout CV.',
      basicLimit: 'Max 3 CVs + 3 Cover Letters',
      basicFeatures: [
        '3 ATS-Optimized Resumes',
        '3 Personalized Cover Letters',
        'Clean & Minimal Templates',
        'Clean HD PDF download without watermark',
        'Shareable Web CV Link & QR Code',
      ],
      basicCta: 'Get Basic Plan',
      proTitle: 'Pro Plan',
      proPrice: '$7.99',
      proDesc: 'For active job seekers applying across multiple companies.',
      proLimit: 'Max 5 CVs + 5 Cover Letters',
      proFeatures: [
        '5 Professional Resumes',
        '5 Custom Cover Letters',
        'All Pro Templates (Berlin, Zurich, London)',
        '1-Click Job URL Tailoring & Scraper',
        'Deep ATS Audit & 1-Click Fix',
        'Priority Support',
      ],
      proCta: 'Get Pro — Most Popular',
      ultimateTitle: 'Ultimate Career Pack',
      ultimatePrice: '$12.99',
      ultimateDesc: 'Full executive suite for high-growth and international roles.',
      ultimateLimit: 'Max 8 CVs + 8 Cover Letters',
      ultimateFeatures: [
        '8 Full-Featured Resumes',
        '8 Custom AI Cover Letters',
        'All Templates & Custom Color Palettes',
        'AI Multi-Language Translator (AZ/EN/TR/DE/RU)',
        'AI LinkedIn Profile Optimizer Pack',
        '5 Custom Interview Q&As',
        'Salary Analyzer & Negotiation Guide',
      ],
      ultimateCta: 'Get Ultimate Pack',
    },
    footer: {
      tagline: 'The AI-powered ATS resume builder and career acceleration platform.',
      product: 'PRODUCT',
      features: 'FEATURES',
      support: 'SUPPORT & LEGAL',
      rights: 'All rights reserved.',
    },
  },
  tr: {
    nav: {
      templates: 'Şablonlar',
      examples: 'CV Örnekleri',
      coverLetter: 'Ön Yazı',
      atsChecker: 'ATS Testi',
      pricing: 'Fiyatlar',
      login: 'Giriş Yap',
      getStarted: 'CV Oluştur — Ücretsiz',
      dashboard: 'Panel',
    },
    hero: {
      badge: 'Yapay Zeka Destekli · %100 ATS Uyumlu · Ücretsiz Başla',
      titleStart: 'Yapay Zeka ile',
      titleHighlight: 'Hayalindeki İşi',
      titleEnd: 'Kazan',
      subtitle:
        'Bilgilerini gir — Gemini AI saniyeler içinde CV’ni hazırlasın, güçlü eylem fiilleriyle donatsın ve %95+ ATS uyumluluğu sağlasın. 10.000+ profesyonel tarafından tercih edildi.',
      ctaPrimary: 'Ücretsiz CV Oluştur',
      ctaSecondary: 'CV Örneklerini İncele',
      trustBadge: '✓ Kredi kartı gerekmez · ✓ Ücretsiz önizleme · ✓ Anında ATS skoru',
      statCvs: 'Oluşturulan CV',
      statRating: 'Kullanıcı Puanı',
      statPass: 'ATS Geçiş Oranı',
      statCountries: 'Aktif Ülke',
    },
    scanner: {
      badge: '⚡ 10 Saniyelik Hızlı ATS Tarayıcı',
      title: 'Mevcut CV’nin ATS Skorunu Hemen Öğren',
      subtitle: 'Mevcut CV metnini aşağıya yapıştır ve anında eksiklerini gör — üyelik gerekmez.',
      placeholder: 'Mevcut CV metnini veya iş tecrübeni buraya yapıştır (ör: "3 yıldır .NET ve Docker ile mikroservisler geliştiriyorum...")...',
      sampleBtn: 'Örnek Metin Ekle',
      scanBtn: 'CV’mi Şimdi Tara',
      scanning: 'Gemini AI İnceliyor...',
      resultScore: 'ATS Uyumluluk Skorun',
      resultTitle: 'Temel Teşhis Sonuçları:',
      fixPrompt: 'Bu skoru %95’e çıkarıp tüm maddeleri yapay zeka ile düzeltmek ister misin?',
      fixCta: 'Stüdyoda 1-Tıkla Düzelt',
    },
    howItWorks: {
      tag: 'Nasıl Çalışır?',
      title: 'Boş Sayfadan Mükemmel CV’ye 3 Adımda',
      subtitle: 'Tasarım veya metin yazarlığı bilgisine gerek yok. Vitelo AI her şeyi halleder.',
      step1Title: 'Bilgilerini Gir',
      step1Desc: 'Deneyim ve yeteneklerini Türkçe veya herhangi bir dilde yaz. 3 dakika sürer.',
      step2Title: 'Yapay Zeka İyileştirsin',
      step2Desc: 'Gemini AI her cümleyi Google XYZ formülüne ve ATS standartlarına uyarlar.',
      step3Title: 'İndir ve Başvur',
      step3Desc: 'Yüksek kaliteli PDF indir veya dijital Web CV linkini doğrudan İK’ya gönder.',
    },
    pricing: {
      tag: 'Şeffaf Fiyatlandırma',
      title: 'Kariyerine Uygun Planı Seç',
      subtitle: 'İlk CV’ni tamamen ücretsiz hazırla. Sadece resmi temiz belgeyi indirmeye hazır olduğunda öde.',
      payAsYouGo: 'Tek CV $3.99 veya avantajlı paketler',
      basicTitle: 'Basic Plan',
      basicPrice: '$4.99',
      basicDesc: 'Tek bir pozisyona hızlı ve etkili başvuru yapmak isteyenler için.',
      basicLimit: 'Maksimum 3 CV + 3 Ön Yazı',
      basicFeatures: [
        '3 adet ATS uyumlu CV',
        '3 adet kişiselleştirilmiş Ön Yazı (Cover Letter)',
        'Sade & Minimal Şablonlar',
        'Filigransız HD PDF İndirme',
        'Paylaşılabilir Dijital Web CV & QR Kod',
      ],
      basicCta: 'Basic Planı Seç',
      proTitle: 'Pro Plan',
      proPrice: '$7.99',
      proDesc: 'Aktif iş arayan ve birden fazla pozisyona başvuranlar için.',
      proLimit: 'Maksimum 5 CV + 5 Ön Yazı',
      proFeatures: [
        '5 adet Profesyonel CV',
        '5 adet Özel Ön Yazı',
        'Tüm Pro Şablonlar (Berlin, Zürih, Londra)',
        'İlan Linki ile 1-Tıkla CV Uyarlama',
        'Derin ATS Denetimi & 1-Tık AI Düzeltme',
        'Öncelikli Destek',
      ],
      proCta: 'Pro Plana Geç — En Çok Tercih Edilen',
      ultimateTitle: 'Ultimate Kariyer Paketi',
      ultimatePrice: '$12.99',
      ultimateDesc: 'Uluslararası ve üst düzey pozisyonları hedefleyenler için tam paket.',
      ultimateLimit: 'Maksimum 8 CV + 8 Ön Yazı',
      ultimateFeatures: [
        '8 adet Tam Donanımlı CV',
        '8 adet Özel AI Ön Yazı',
        'Tüm Şablonlar ve Özel Renk Paletleri',
        'AI Çok Dilli CV Çevirmeni (AZ/EN/TR/DE/RU)',
        'AI LinkedIn Profil Optimizasyon Paketi',
        '5 Özel Mülakat Soru & Cevabı',
        'Maaş Analizi ve Pazarlık Rehberi',
      ],
      ultimateCta: 'Ultimate Paketi Seç',
    },
    footer: {
      tagline: 'Binlerce adayın güvendiği yapay zeka destekli ATS CV ve kariyer platformu.',
      product: 'ÜRÜN',
      features: 'ÖZELLİKLER',
      support: 'DESTEK & YASAL',
      rights: 'Tüm hakları saklıdır.',
    },
  },
};
