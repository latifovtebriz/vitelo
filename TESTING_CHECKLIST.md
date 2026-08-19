# 🧪 Vitelo — Hərtərəfli Test və Keyfiyyət Yoxlanışı (QA Master Checklist)

> **Məqsəd**: Tətbiqin bütün modullarını, düymələrini, AI alqoritmlərini və baza inteqrasiyalarını 0-dan addım-addım test etmək, xətaları aradan qaldırmaq və hər iki AI modelinin sinxron izləməsini təmin etmək.

---

## 📊 Test İcmalı və Status Göstəricisi

| Modul | Task Aralığı | Cəmi Task | Status |
|---|---|---|---|
| **1. Autentifikasiya və İstifadəçi Profili** | Task 1 – 6 | 6 Task | ⏳ Gözləmədə |
| **2. Landing Page və Çoxdillilik** | Task 7 – 11 | 5 Task | ⏳ Gözləmədə |
| **3. CV Builder və İnteraktiv Studio** | Task 12 – 20 | 9 Task | ⏳ Gözləmədə |
| **4. AI Cover Letter Studio** | Task 21 – 24 | 4 Task | ⏳ Gözləmədə |
| **5. Dərin ATS Diaqnostika Mərkəzi** | Task 25 – 28 | 4 Task | ⏳ Gözləmədə |
| **6. Vakansiyalar və Kanban Tracker** | Task 29 – 33 | 5 Task | ⏳ Gözləmədə |
| **7. AI Mock Interview Təlimçisi** | Task 34 – 37 | 4 Task | ⏳ Gözləmədə |
| **8. Maaş Analizatoru və Karyera Mərkəzi** | Task 38 – 41 | 4 Task | ⏳ Gözləmədə |
| **9. Qiymətlər, Ödəniş və Kredit Balansı** | Task 42 – 45 | 4 Task | ⏳ Gözləmədə |
| **10. Canlı Telemetriya və Log İnspektoru** | Task 46 – 48 | 3 Task | ⏳ Gözləmədə |

---

## 🔐 Modul 1: Autentifikasiya və İstifadəçi Profili

- [ ] **Task 1: Yeni İstifadəçi Qeydiyyatı (`/register`)**
  - **Addım**: Qeydiyyat formuna yeni ad, email və şifrə daxil edib "Create Account" düyməsini sıxın.
  - **Gözlənilən Nəticə**: İstifadəçi uğurla qeydiyyatdan keçir, JWT token `localStorage`-a yazılır və birbaşa `/dashboard`-a yönləndirilir. Baza `users` cədvəlində yeni sətir yaranır.
  - **Log Yoxlanışı**: `app_logs` cədvəlində `ui_button_click` və `auth_register` qeydi yaranmalıdır.

- [ ] **Task 2: Mövcud Hesaba Giriş (`/login`)**
  - **Addım**: Qeydiyyatdan keçmiş email və şifrə ilə daxil olun.
  - **Gözlənilən Nəticə**: Uğurlu giriş bildirişi gəlir və `/dashboard` açılır. Səhv şifrə yazıldıqda aydın xəta mesajı göstərilir.

- [ ] **Task 3: Şifrənin Unudulması Sorğusu (`/forgot-password`)**
  - **Addım**: Qeydiyyatlı emaili daxil edib "Send Reset Link" düyməsini sıxın.
  - **Gözlənilən Nəticə**: Şifrə sıfırlama sorğusunun qəbul olunduğu haqda bildiriş çıxır.

- [ ] **Task 4: Şifrənin Yenilənməsi (`/reset-password?token=...`)**
  - **Addım**: Reset tokeni ilə səhifəyə daxil olub yeni şifrə təyin edin.
  - **Gözlənilən Nəticə**: Şifrə bazada uğurla yenilənir və istifadəçi yeni şifrə ilə login ola bilir.

- [ ] **Task 5: Profil Məlumatlarının Redaktəsi (`/account`)**
  - **Addım**: Ad, hədəf vəzifə və telefon nömrəsini dəyişib "Save Changes" düyməsini sıxın.
  - **Gözlənilən Nəticə**: Yenilənmiş məlumatlar səhifəni yenilədikdə (F5) də saxlanılır.

- [ ] **Task 6: Təhlükəsiz Çıxış (Logout)**
  - **Addım**: Navbar və ya profil menyusundan "Log Out" düyməsini sıxın.
  - **Gözlənilən Nəticə**: Token silinir, istifadəçi Landing səhifəsinə yönləndirilir və qorunan səhifələrə (`/dashboard`, `/generate`) giriş bloklanır.

---

## 🌐 Modul 2: Landing Page və Çoxdillilik

- [ ] **Task 7: Çoxdillilik Dəyişdiricisi (AZ / EN / TR)**
  - **Addım**: Navbar-dakı bayraq menyusundan dili ardıcıl olaraq Azərbaycan 🇦🇿, English 🇬🇧 və Türkçe 🇹🇷 seçin.
  - **Gözlənilən Nəticə**: Bütün başlıqlar, düymələr və təsvirlər dərhal seçilən dilə keçir, səhifə yeniləndikdə seçilmiş dil yadda qalır.

- [ ] **Task 8: 10-Saniyəlik Canlı ATS Skaner Vidceti**
  - **Addım**: Ana səhifədəki "Live ATS Resume Scanner" vidcetinə nümunə CV mətni yapışdırıb və ya fayl seçib "Scan Resume Now" sıxın.
  - **Gözlənilən Nəticə**: 10 saniyə ərzində animasiyalı ATS balı və çatışmayan açar sözlər göstərilir.

- [ ] **Task 9: Şablonlar Qalereyası (`/templates`)**
  - **Addım**: Şablonlar səhifəsinə keçib Modern, Minimalist, Executive, Creative və Technical şablonlarının önizləməsinə baxın.
  - **Gözlənilən Nəticə**: Hər şablon üçün "Use This Template" düyməsi CV Studio-nu həmin şablonla açır.

- [ ] **Task 10: Hazır Nümunələr Bölməsi (`/examples`)**
  - **Addım**: Proqramçı, Maliyyəçi, Marketoloq və s. peşə nümunələrinə daxil olun.
  - **Gözlənilən Nəticə**: Nümunə təcrübə bəndləri və bacarıqlar açılır, "Copy to My CV" funksiyası işləyir.

- [ ] **Task 11: Qiymət Paketləri və FAQ Bölməsi**
  - **Addım**: Ana səhifədə qiymət kartlarını və FAQ sual-cavab bloklarını klikləyib yoxlayın.
  - **Gözlənilən Nəticə**: Bütün FAQ akkordeonları problemsiz açılıb-bağlanır.

---

## 🎨 Modul 3: CV Builder və İnteraktiv Studio (`/generate`)

- [ ] **Task 12: Şəxsi Məlumatlar Bölməsi (Step 1)**
  - **Addım**: Ad, Email, Telefon, Şəhər, LinkedIn, GitHub və Professional Summary daxil edin.
  - **Gözlənilən Nəticə**: Məlumatlar real vaxtda sağdakı A4 önizləmə kətanına əks olunur.

- [ ] **Task 13: İş Təcrübəsi və Google XYZ Formulu (Step 2)**
  - **Addım**: Şirkət adı, vəzifə, tarixlər və təcrübə bəndləri daxil edin. "Enhance with AI (XYZ Formula)" düyməsini sıxın.
  - **Gözlənilən Nəticə**: AI sadə cümləni rəqəm və faizlərlə zənginləşdirilmiş güclü nəticə cümləsinə çevirir.

- [ ] **Task 14: Təhsil və Sertifikatlar (Step 3)**
  - **Addım**: Universitet, dərəcə, buraxılış ili və sertifikat əlavə edin.
  - **Gözlənilən Nəticə**: Əlavə olunan hər sətir dərhal sağ tərəfdəki sənədə düşür.

- [ ] **Task 15: Kateqoriyalı Bacarıqlar (Step 4)**
  - **Addım**: Dillər/Freymvorklar, DevOps/Cloud, Verilənlər Bazaları, Soft Skills üzrə təklif olunan teqləri klikləyərək seçin və ya yenisini yazın.
  - **Gözlənilən Nəticə**: Teqlər səliqəli şəkildə qruplaşır və canlı CV-də görünür.

- [ ] **Task 16: Çoxdilli Dillər Bölməsi (Step 5)**
  - **Addım**: Azərbaycan (Native), English (Professional) və s. əlavə edin.
  - **Gözlənilən Nəticə**: Səviyyələri ilə birlikdə sənədə əlavə olunur.

- [ ] **Task 17: AI ilə CV Generasiyası və Real-Time Preview (Step 6)**
  - **Addım**: "AI is Crafting ATS Resume..." düyməsini sıxın.
  - **Gözlənilən Nəticə**: Sistem heç bir xəta bildirişi çıxarmadan saniyələr içində canlı kətana keçir, ATS balını hesablayır və redaktə imkanı verir.

- [ ] **Task 18: Dizayn Fərdiləşdirməsi (Rəng, Şrift, Şablon)**
  - **Addım**: Canlı kətanda rəng palitrasını (Mavi, Zümrüd, Qara, Qızılı), şrifti (Inter, Roboto, Merriweather) və şablon tipini dəyişin.
  - **Gözlənilən Nəticə**: Sənədin görünüşü dərhal və qüsursuz şəkildə yenilənir.

- [ ] **Task 19: Job Match Drawer (Vakansiya Uyğunlaşdırma Çəkməcəsi)**
  - **Addım**: "Match against Target Job Description" düyməsini sıxıb vakansiya mətni yapışdırın.
  - **Gözlənilən Nəticə**: CV ilə vakansiya arasındakı açar söz uyğunluq faizi çıxır və çatışmayan terminlər göstərilir.

- [ ] **Task 20: PDF İxracı və QR-kodlu Web CV Paylaşımı**
  - **Addım**: "Download PDF" və "Share Web CV" düymələrini yoxlayın.
  - **Gözlənilən Nəticə**: Su nişanlı və ya təmiz PDF problemsiz yüklənir, `/p/:id` ünvanında ictimai QR-kodlu veb səhifə yaranır.

---

## ✉️ Modul 4: AI Cover Letter Studio (`/cover-letter/create`)

- [ ] **Task 21: Məlumatların Daxil Edilməsi**
  - **Addım**: Şirkət adı, vəzifə, vakansiya təsviri və ton növünü (Professional, Confident, Modern) seçin.
  - **Gözlənilən Nəticə**: Form parametrləri düzgün qeydə alınır.

- [ ] **Task 22: AI ilə Cover Letter Generasiyası**
  - **Addım**: "Generate Cover Letter with AI" düyməsini sıxın.
  - **Gözlənilən Nəticə**: 3-4 saniyə ərzində şirkətə və vəzifəyə tam uyğunlaşdırılmış, orfoqrafik cəhətdən qüsursuz mətn generasiya olunur.

- [ ] **Task 23: Canlı Redaktə və Saxlama**
  - **Addım**: Generasiya olunmuş mətndə dəyişikliklər edib "Save Changes" sıxın.
  - **Gözlənilən Nəticə**: Mətn bazada yenilənir və `/documents` arxivinə əlavə olunur.

- [ ] **Task 24: PDF / DOCX İxracı**
  - **Addım**: "Download as PDF" və "Copy Text" düymələrini yoxlayın.
  - **Gözlənilən Nəticə**: Fayl formatlanmış şəkildə kompüterə yüklənir və buferə kopyalanır.

---

## 🎯 Modul 5: Dərin ATS Diaqnostika Mərkəzi (`/checker`)

- [ ] **Task 25: Mövcud CV-nin və ya Xam Mətnin Skan Edilməsi**
  - **Addım**: İstifadəçinin mövcud CV-sini seçin və ya mətni yapışdıraraq "Run Deep ATS Audit" sıxın.
  - **Gözlənilən Nəticə**: 100 ballıq ümumi nəticə və 4 alt metrika (Action Verbs, Metrics, Keywords, Formatting) göstərilir.

- [ ] **Task 26: Açar Söz Çatışmazlığı Analizi (Keyword Gap)**
  - **Addım**: Hədəf vakansiya tələbləri ilə CV açar sözlərini müqayisə edin.
  - **Gözlənilən Nəticə**: Mövcud və çatışmayan texnologiyaların dəqiq siyahısı təqdim olunur.

- [ ] **Task 27: Fəaliyyət Felləri və Kəmiyyət Təklifləri**
  - **Addım**: Zəif bəndlərin üzərinə klikləyib "AI Suggested Fix" bölməsinə baxın.
  - **Gözlənilən Nəticə**: Zəif cümlənin yerinə tövsiyə olunan güclü cümlə variantı və "Copy Fix" düyməsi işləyir.

- [ ] **Task 28: 1-Kliklə CV-yə Tətbiq Etmə**
  - **Addım**: Düzəliş təklifini təsdiq edin.
  - **Gözlənilən Nəticə**: Düzəliş birbaşa əsas CV sənədinə tətbiq olunur və ATS balı artır.

---

## 💼 Modul 6: Vakansiyalar və Kanban Tracker (`/jobs`, `/tracker`)

- [ ] **Task 29: Vakansiyalar Bazası və Filtrləmə (`/jobs`)**
  - **Addım**: Axtarış sətirində peşə adı yazın, Remote, Maaş və Təcrübə filtrlərini tətbiq edin.
  - **Gözlənilən Nəticə**: Filtrlərə uyğun vakansiyalar sürətlə sıralanır.

- [ ] **Task 30: 1-Kliklə Kanban Tracker-ə Əlavə Etmə**
  - **Addım**: Hər hansı vakansiyanın üzərində "Save to Tracker" və ya "Apply" düyməsini sıxın.
  - **Gözlənilən Nəticə**: Vakansiya birbaşa `/tracker` lövhəsinin "Applied" sütununa düşür.

- [ ] **Task 31: Kanban Lövhəsində Kartların Daşınması (`/tracker`)**
  - **Addım**: Kartı "Wishlist" -> "Applied" -> "Interviewing" -> "Offer" sütunlarına sürükləyib buraxın (Drag & Drop).
  - **Gözlənilən Nəticə**: Kartın yeni mərhələsi dərhal bazaya yazılır və səhifə yeniləndikdə yerində qalır.

- [ ] **Task 32: Müraciət Detalları, Qeydlər və Maaş Təklifi**
  - **Addım**: Hər hansı müraciət kartını açıb müsahibə tarixi, qeydlər və təklif olunan məbləği qeyd edin.
  - **Gözlənilən Nəticə**: Bütün qeydlər kartın daxilində saxlanılır.

- [ ] **Task 33: URL ilə Vakansiya Mətninin Skrap Olunması**
  - **Addım**: Xarici vakansiya linkini (LinkedIn/Indeed/Jobsearch) daxil edib "Scrape & Auto-Fill" sıxın.
  - **Gözlənilən Nəticə**: Şirkət adı, tələblər və maaş avtomatik kart formuna doldurulur.

---

## 🎤 Modul 7: AI Mock Interview Təlimçisi (`/interview-prep`)

- [ ] **Task 34: Müsahibə Sessiyasının Yaradılması**
  - **Addım**: Hədəf vəzifə (məs: Senior Python Engineer) və səviyyə (Senior) seçib "Start AI Interview" sıxın.
  - **Gözlənilən Nəticə**: 5 ədəd real texniki və davranış yönümlü (Behavioral/STAR) sual generasiya olunur.

- [ ] **Task 35: Səsli və ya Mətnlə Cavablandırma**
  - **Addım**: Mikrofon düyməsini sıxaraq və ya mətni yazaraq suala cavab verin.
  - **Gözlənilən Nəticə**: Cavab saniyələr içində qeydə alınır.

- [ ] **Task 36: STAR Metodu üzrə AI Qiymətləndirməsi**
  - **Addım**: "Submit Answer & Grade" düyməsini sıxın.
  - **Gözlənilən Nəticə**: AI cavabı Situation, Task, Action, Result üzrə təhlil edir, 100 üzərindən bal verir və ideal nümunə cavab variantını göstərir.

- [ ] **Task 37: Sessiya Yekun Hesabatı**
  - **Addım**: Bütün sualları tamamlayın.
  - **Gözlənilən Nəticə**: Ümumi müsahibə hazırlıq balı və güclü/zəif tərəflərin xülasəsi çıxır.

---

## 📈 Modul 8: Maaş Analizatoru və Karyera Mərkəzi (`/salary`, `/learning`)

- [ ] **Task 38: Maaş Benchmark Kalkulyatoru (`/salary`)**
  - **Addım**: Peşə (məs: DevOps), şəhər və təcrübə ilini seçib "Calculate Market Salary" sıxın.
  - **Gözlənilən Nəticə**: 25-ci persentil, Median və 75-ci persentil maaş qrafiki göstərilir.

- [ ] **Task 39: AI Maaş Danışıqları Skripti (Negotiation Pitch)**
  - **Addım**: "Generate Counter-Offer Script" düyməsini sıxın.
  - **Gözlənilən Nəticə**: HR və rəhbərliklə maaş artımı danışıqları üçün peşəkar hazır arqument və məktub mətni təqdim olunur.

- [ ] **Task 40: Karyera Yol Xəritəsi və Bacarıq İzləmə (`/learning`)**
  - **Addım**: Seçilmiş peşə üzrə addım-addım tələb olunan bacarıqlar siyahısını açın.
  - **Gözlənilən Nəticə**: Öyrənilmiş bacarıqları işarələdikdə ümumi faiz göstəricisi dinamik artır.

- [ ] **Task 41: 5-Addımlı İş Axtarış Metodu (`/method`)**
  - **Addım**: Karyera strategiyası modulunu oxuyub mərhələləri tamamlanmış qeyd edin.
  - **Gözlənilən Nəticə**: Tərəqqi istifadəçi profilində yadda saxlanılır.

---

## 💎 Modul 9: Qiymətlər, Ödəniş və Kredit Balansı (`/pricing`, `/account`)

- [ ] **Task 42: Paket Seçimi və Checkout Yönləndirməsi (`/pricing`)**
  - **Addım**: Basic ($4.99), Pro ($7.99) və ya Ultimate ($12.99) paketində "Upgrade Now" düyməsini sıxın.
  - **Gözlənilən Nəticə**: LemonSqueezy təhlükəsiz ödəniş pəncərəsi açılır.

- [ ] **Task 43: Webhook ilə Kreditlərin Balansa Oturması**
  - **Addım**: Test ödənişi tamamlandıqda webhook emalını yoxlayın.
  - **Gözlənilən Nəticə**: İstifadəçinin `users.credits` sayı artır, `/account` səhifəsində dərhal görünür.

- [ ] **Task 44: Faktura və Əməliyyat Tarixçəsi (`/account`)**
  - **Addım**: Hesab səhifəsində "Transaction History" cədvəlinə baxın.
  - **Gözlənilən Nəticə**: Ödənilən məbləğ, tarix və əlavə olunan kredit sayı şəffaf göstərilir.

- [ ] **Task 45: Kreditlə Sənəd Kilidinin Açılması (Unlock)**
  - **Addım**: Su nişanlı CV-ni 1 kredit istifadə edərək limitsiz yükləməyə açın.
  - **Gözlənilən Nəticə**: Balansdan 1 kredit çıxılır, sənəd "Unlocked" statusuna keçir.

---

## 🪵 Modul 10: Canlı Telemetriya və Log İnspektoru (`/logs`)

- [ ] **Task 46: Birbaşa Supabase `app_logs` Axını**
  - **Addım**: Saytda istənilən düyməni sıxıb Supabase SQL Editor-da `SELECT * FROM app_logs ORDER BY created_at DESC LIMIT 5;` sorğusunu icra edin.
  - **Gözlənilən Nəticə**: Klik əməliyyatı 100ms içində bazaya yazılır.

- [ ] **Task 47: Canlı Log Paneli İnspektoru (`/logs`)**
  - **Addım**: `/logs` səhifəsini açıb canlı 3 saniyəlik yenilənməni izləyin.
  - **Gözlənilən Nəticə**: Bütün `ACTION`, `ERROR`, `WARN` logları rəngli kartlar şəklində dərhal görünür.

- [ ] **Task 48: Xəta Detallarının Açılması və Filtrləmə**
  - **Addım**: Hər hansı qırmızı `ERROR` logunun üzərinə klikləyərək JSON payload-u açın.
  - **Gözlənilən Nəticə**: Xətanın dəqiq baş verdiyi səhifə, komponent və səbəb aydın oxunur.

---

## 🎯 Test Protokolu:
Hər bir taskı ardıcıl olaraq icra edib yoxlayacağıq. Hər hansı xəta çıxdıqda dərhal kodda düzəliş edib `[x]` ilə tamamlayacağıq və GitHub-a push edəcəyik!
