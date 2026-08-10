
ALTER TABLE public.page_headers 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ne TEXT;

UPDATE hero_content 
SET 
  title_ne = 'नेपालको भविष्यलाई सशक्त बनाउँदै',
  highlight_ne = 'एक बालबालिकामा',
  description_ne = 'ग्रामीण नेपालमा, धेरै बालबालिकाहरूका लागि गुणस्तरीय शिक्षा पहुँच योग्य छैन। तपाईंको प्रायोजनले सम्भावना र अवसरको बीचमा अन्तर घटाउँछ।',
  cta_primary_text_ne = 'बालबालिकाहरू हेर्नुहोस्',
  cta_secondary_text_ne = 'दान गर्नुहोस्',
  statistics_ne = '[
    {"value": "१९७७", "label": "स्थापना भएको"},
    {"value": "४९+", "label": "वर्षहरूको सेवा"},
    {"value": "१००%", "label": "निःशुल्क शिक्षा"},
    {"value": "२५०+", "label": "समर्थित बालबालिका"}
  ]'::jsonb
WHERE title IS NOT NULL;


UPDATE page_headers 
SET 
  title_ne = CASE 
    WHEN page_slug = 'about' THEN 'हाम्रो बारेमा'
    WHEN page_slug = 'students' THEN 'हाम्रा विद्यार्थीहरू'
    WHEN page_slug = 'donate' THEN 'दान गर्नुहोस्'
    WHEN page_slug = 'sponsor' THEN 'प्रायोजन गर्नुहोस्'
    WHEN page_slug = 'gallery' THEN 'ग्यालरी'
    WHEN page_slug = 'news' THEN 'समाचार'
    WHEN page_slug = 'contact' THEN 'सम्पर्क गर्नुहोस्'
    ELSE title
  END,
  subtitle_ne = CASE 
    WHEN page_slug = 'about' THEN 'बुद्ध एकेडेमीको यात्रा र उद्देश्य जान्नुहोस्'
    WHEN page_slug = 'students' THEN 'प्रायोजन गर्न तयार विद्यार्थीहरू हेर्नुहोस्'
    WHEN page_slug = 'donate' THEN 'शिक्षा र समुदायका लागि तपाईंको योगदान'
    WHEN page_slug = 'sponsor' THEN 'एक बालबालिकाको जीवन परिवर्तन गर्नुहोस्'
    WHEN page_slug = 'gallery' THEN 'हाम्रो यात्राका क्षणहरू'
    WHEN page_slug = 'news' THEN 'नवीनतम् अद्यावधिकहरू र कथाहरू'
    WHEN page_slug = 'contact' THEN 'हामीसँग सम्पर्कमा रहनुहोस्'
    ELSE subtitle
  END
WHERE page_slug IN ('about', 'students', 'donate', 'sponsor', 'gallery', 'news', 'contact');

UPDATE sponsorship_content 
SET 
  hero_title_ne = 'एक बालबालिकालाई प्रायोजन गर्नुहोस्',
  hero_subtitle_ne = 'तपाईंको प्रायोजनले एक बालबालिकालाई शिक्षा, पौष्टिक भोजन र उज्यालो दिन्छ।',
  section_title_ne = 'प्रायोजन कसरी काम गर्छ',
  section_description_ne = 'सरल चरणहरूमा एक बालबालिकालाई प्रायोजन गर्नुहोस्',
  cta_title_ne = 'आजै सुरु गर्नुहोस्',
  cta_description_ne = 'तपाईंको प्रायोजनले तुरुन्तै प्रभाव पार्छ।',
  cta_button_text_ne = 'एक बालबालिकालाई प्रायोजन गर्नुहोस्',
  steps_ne = '[
    {"num": "१", "title": "बालबालिका छनोट गर्नुहोस्", "desc": "हाम्रा विद्यार्थी प्रोफाइलहरू हेर्नुहोस् र तपाईंले समर्थन गर्न चाहनुहुने बालबालिका छनोट गर्नुहोस्।"},
    {"num": "२", "title": "प्रायोजन राशि छनोट गर्नुहोस्", "desc": "मासिक वा वार्षिक प्रायोजन योजना छनोट गर्नुहोस् जुन तपाईंको बजेटमा उपयुक्त छ।"},
    {"num": "३", "title": "दान गर्नुहोस्", "desc": "सुरक्षित भुक्तानी प्रक्रिया मार्फत तपाईंको प्रायोजन गर्नुहोस्।"},
    {"num": "४", "title": "अद्यावधिकहरू प्राप्त गर्नुहोस्", "desc": "तपाईंले प्रायोजन गरेको बालबालिकाको प्रगति बारे नियमित अद्यावधिकहरू प्राप्त गर्नुहोस्।"},
    {"num": "५", "title": "जडान बनाउनुहोस्", "desc": "तपाईंको प्रायोजित बालबालिकासँग पत्र वा इमेल मार्फत सम्पर्कमा रहनुहोस्।"},
    {"num": "६", "title": "प्रभाव हेर्नुहोस्", "desc": "तपाईंको सहयोगले बालबालिकाको जीवनमा कस्तो सकारात्मक परिवर्तन ल्याएको छ हेर्नुहोस्।"}
  ]'::jsonb,
  benefits_ne = '[
    {"text": "शिक्षामा पहुँच"},
    {"text": "पौष्टिक भोजन"},
    {"text": "स्वास्थ्य सेवा"},
    {"text": "सामग्री समर्थन"},
    {"text": "मार्गदर्शन"}
  ]'::jsonb
WHERE hero_title IS NOT NULL;

UPDATE donation_content 
SET 
  hero_title_ne = 'दान गर्नुहोस्',
  hero_subtitle_ne = 'तपाईंको दानले नेपालका बालबालिकाहरूलाई शिक्षा र आशा प्रदान गर्छ।',
  currency_label_ne = 'सबै रकम नेपाली रुपैयाँ (NPR) मा',
  impact_cards_ne = '[
    {"amount": 500, "label": "विद्यालय सामग्री", "description": "एक बालबालिकाको वार्षिक सामग्री"},
    {"amount": 1000, "label": "पौष्टिक भोजन", "description": "मासिक भोजन समर्थन"},
    {"amount": 2500, "label": "शिक्षा छात्रवृत्ति", "description": "एक बालबालिकाको शिक्षा खर्च"},
    {"amount": 5000, "label": "पूर्ण प्रायोजन", "description": "एक बालबालिकाको पूर्ण वार्षिक समर्थन"}
  ]'::jsonb,
  process_steps_ne = '[
    {"title": "रकम छनोट गर्नुहोस्", "desc": "तपाईंको बजेट अनुसार दान रकम छनोट गर्नुहोस्"},
    {"title": "बालबालिका छनोट गर्नुहोस्", "desc": "वैकल्पिक रूपमा एक विशिष्ट बालबालिकालाई समर्थन गर्नुहोस्"},
    {"title": "भुक्तानी गर्नुहोस्", "desc": "सुरक्षित भुक्तानी विधि मार्फत दान गर्नुहोस्"},
    {"title": "रसिद प्राप्त गर्नुहोस्", "desc": "तपाईंको दानको पुष्टिकरण प्राप्त गर्नुहोस्"}
  ]'::jsonb
WHERE hero_title IS NOT NULL;


ALTER TABLE public.footer_content 
ADD COLUMN IF NOT EXISTS description_ne TEXT,
ADD COLUMN IF NOT EXISTS quick_links_ne JSONB DEFAULT '[]'::jsonb;

UPDATE footer_content 
SET 
  description_ne = 'बुद्ध एकेडेमी नेपालका बालबालिकाहरूलाई गुणस्तरीय शिक्षा, पौष्टिक भोजन, र उज्यालो दिने एक गैर-नाफामुली संस्था हो।',
  quick_links_ne = '[
    {"label": "हाम्रो बारेमा", "url": "/about"},
    {"label": "विद्यार्थीहरू", "url": "/students"},
    {"label": "प्रायोजन", "url": "/sponsor"},
    {"label": "दान", "url": "/donate"},
    {"label": "समाचार", "url": "/news"},
    {"label": "सम्पर्क", "url": "/contact"}
  ]'::jsonb
WHERE description IS NOT NULL;

UPDATE site_settings 
SET 
  site_name_ne = 'बुद्ध एकेडेमी',
  site_tagline_ne = 'शिक्षा, दया, र उज्यालो'
WHERE site_name IS NOT NULL;
