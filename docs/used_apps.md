Avto-deploy prosesini izləmək və istifadə etdiyimiz bütün xidmətləri tək-tək yoxlamaq üçün aşağıdakı tam siyahını və linkləri təqdim edirəm. Hər biri üçün hara girib nəyə baxacaqsan:

1. Frontend Auto-Deploy (Cloudflare Pages)
Kodlar GitHub-a push edilən kimi Cloudflare avtomatik yükləyib saytı təzələyir.

Link: dash.cloudflare.com
Hara baxmalı: Sol menyudan Workers & Pages seç > Siyahıdan vitelo layihəsinə kliklə > Deployments tabında ən sonuncu "Building" və ya "Success" yazısını (logunu) görəcəksən.
2. Backend Server & Hosting (DigitalOcean)
Python, FastAPI və AI əməliyyatlarının işlədiyi arxa plan serverimiz.

Link: cloud.digitalocean.com
Hara baxmalı: Droplets bölməsinə daxil ol. Orada 209.38.213.29 IP ünvanlı (Ubuntu) serverimizi görəcəksən. (Serverin içinə girib terminaldan kodlara baxmaq üçün isə ssh root@209.38.213.29 edirik).
3. Məlumat Bazası / Database (Neon.tech)
İstifadəçilərin məlumatları, CV qeydləri və 1-899 aralığındakı kredit məlumatları burada saxlanılır.

Link: console.neon.tech
Hara baxmalı: vitelo və ya yaratdığın layihəyə daxil ol > Tables bölməsinə kliklə və bazadakı bütün istifadəçi (users), cv-lər (cv_generations) və ödəniş (transactions) məlumatlarına cədvəl şəklində baxa bilərsən.
4. Sürətli Keş yaddaşı / Redis (Upstash)
Sistemə çox yüklənmə olmasın deyə Rate Limiting (1 dəqiqədə maksimum N sorğu) qaydaları burada saxlanılır.

Link: console.upstash.com
Hara baxmalı: Redis bölməsində yaranmış bazanıza baxın, istifadə olunan RAM (Adətən çox cüzi olur) və saniyədə neçə əməliyyat (Ops) edildiyini görəcəksən.
5. Ödəniş Sistemi / Billing (Lemon Squeezy)
İstifadəçilər $3, $5.99 və s. ödəniş etdikdə real pullar bura gəlir və bizə webhook atıb bildirir.

Link: app.lemonsqueezy.com
Hara baxmalı: Orders bölməsinə baxıb ödəniş qəbzlərini (Kimin nədən nə qədər ödədiyini), webhook aktivliklərini Settings > Webhooks bölməsində yoxlaya bilərsən.
6. Süni İntellekt (Google AI Studio - Gemini)
CV-lərin pulsuz yazılması, Tərcümə edilməsi, ATS (Açar sözlərin artırılması) burada gedir.

Link: aistudio.google.com
Hara baxmalı: Sol tərəfdəki API Keys səhifəsində, və sənə verilmiş 1.5 Flash istifadə (tokens) statistikasının yuxarısında aylıq limit səviyyələrinə (quotalara) baxa bilərsən. (Hazırda Gemini 1.5 Flash pulsuz istifadə olunur).