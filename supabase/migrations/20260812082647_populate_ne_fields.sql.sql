-- Populate Nepali translations for section_content table
-- This ensures the About and Sponsorship sections display correctly in Nepali

UPDATE public.section_content
SET 
  title_ne = 'बुद्ध एकेडेमीको बारेमा',
  description_ne = 'सन् १९७७ मा स्थापना भएको बुद्ध एकेडेमी काठमाडौं, नेपालस्थित एक गैरनाफामूलक आवासीय विद्यालय हो, जसले विपन्न बालबालिकालाई निःशुल्क शिक्षा प्रदान गर्दै आएको छ।',
  content_ne = '{
    "title": "बुद्ध एकेडेमीको बारेमा",
    "description": "सन् १९७७ मा स्थापना भएको बुद्ध एकेडेमी काठमाडौं, नेपालस्थित एक गैरनाफामूलक आवासीय विद्यालय हो, जसले विपन्न बालबालिकालाई निःशुल्क शिक्षा प्रदान गर्दै आएको छ।",
    "milestones": [
      {"year": "1977", "event": "१२ जना विद्यार्थीबाट स्थापना"},
      {"year": "1990s", "event": "छात्रावास विस्तार कार्यक्रम"},
      {"year": "2010s", "event": "कम्प्युटर प्रयोगशाला स्थापना"},
      {"year": "Today", "event": "हरेक वर्ष सयौं विद्यार्थीलाई शिक्षा"}
    ]
  }'::jsonb
WHERE section_key = 'about_preview'
  AND (title_ne IS NULL OR title_ne = '');

UPDATE public.section_content
SET 
  title_ne = 'प्रायोजन कसरी काम गर्छ',
  description_ne = 'एक बालबालिकाको जीवन परिवर्तन गर्ने तपाईंको यात्रा यहाँबाट सुरु हुन्छ।',
  content_ne = '{
    "title": "प्रायोजन कसरी काम गर्छ",
    "description": "एक बालबालिकाको जीवन परिवर्तन गर्ने तपाईंको यात्रा यहाँबाट सुरु हुन्छ।",
    "steps": [
      {"title": "प्रोफाइलहरू हेर्नुहोस्", "desc": "प्रायोजनको प्रतीक्षामा रहेका बालबालिकाहरू हेर्नुहोस्"},
      {"title": "एक बालबालिका छनोट गर्नुहोस्", "desc": "प्रायोजन गर्न विद्यार्थी चयन गर्नुहोस्"},
      {"title": "आफ्नो प्रतिबद्धता जनाउनुहोस्", "desc": "दान फाराम सुरक्षित रूपमा पूरा गर्नुहोस्"},
      {"title": "हामी जोड्छौं", "desc": "तपाईंलाई तपाईंले प्रायोजन गरेको बालबालिकासँग जोड्नेछौं"},
      {"title": "नियमित जानकारी प्राप्त गर्नुहोस्", "desc": "प्रगति प्रतिवेदन र तस्बिरहरू प्राप्त गर्नुहोस्"},
      {"title": "सम्बन्ध निर्माण गर्नुहोस्", "desc": "पत्र तथा सन्देश आदानप्रदान गर्नुहोस्"},
      {"title": "प्रभाव हेर्नुहोस्", "desc": "तपाईंको योगदानले ल्याएको परिवर्तन हेर्नुहोस्"},
      {"title": "समुदायमा सामेल हुनुहोस्", "desc": "अन्य प्रायोजकहरूसँग जोडिनुहोस्"}
    ]
  }'::jsonb
WHERE section_key = 'sponsorship_steps'
  AND (title_ne IS NULL OR title_ne = '');

-- Also populate welcome section Nepali content
UPDATE public.section_content
SET 
  title_ne = 'बुद्ध एकेडेमीमा स्वागत छ',
  content_ne = '{
    "title": "बुद्ध एकेडेमीमा स्वागत छ",
    "content": "सन् १९७७ देखि, बुद्ध एकेडेमीले काठमाडौं, नेपालका विपन्न बालबालिकालाई निःशुल्क, गुणस्तरीय शिक्षा प्रदान गर्दै आएको छ। हामी विश्वास गर्छौं कि हरेक बालबालिकाले सिक्न, बढ्न, र राम्रो भविष्य बनाउने अवसर पाउनु पर्छ।"
  }'::jsonb
WHERE section_key = 'welcome'
  AND (title_ne IS NULL OR title_ne = '');

-- Populate stats section Nepali content
UPDATE public.section_content
SET 
  title_ne = 'हाम्रो प्रभावका तथ्याङ्कहरू',
  content_ne = '{
    "title": "हाम्रो प्रभावका तथ्याङ्कहरू"
  }'::jsonb
WHERE section_key = 'stats'
  AND (title_ne IS NULL OR title_ne = '');

-- Populate featured_students section Nepali content
UPDATE public.section_content
SET 
  title_ne = 'प्रायोजनको प्रतीक्षामा रहेका बालबालिकाहरू',
  description_ne = 'प्रायोजनको प्रतीक्षामा रहेका केही बालबालिकाहरूसँग भेट गर्नुहोस्। तपाईंको सहयोगले उनीहरूको जीवन सधैंको लागि परिवर्तन गर्न सक्छ।',
  content_ne = '{
    "title": "प्रायोजनको प्रतीक्षामा रहेका बालबालिकाहरू"
  }'::jsonb
WHERE section_key = 'featured_students'
  AND (title_ne IS NULL OR title_ne = '');

-- Populate testimonials section Nepali content
UPDATE public.section_content
SET 
  title_ne = 'हाम्रा समर्थकहरूले के भन्छन्',
  content_ne = '{
    "title": "हाम्रा समर्थकहरूले के भन्छन्"
  }'::jsonb
WHERE section_key = 'testimonials'
  AND (title_ne IS NULL OR title_ne = '');

-- Populate donation_cta section Nepali content
UPDATE public.section_content
SET 
  title_ne = 'आजै परिवर्तन ल्याउनुहोस्',
  description_ne = 'हरेक योगदानले नेपालका बालबालिकालाई आशा र अवसर प्रदान गर्दछ।',
  content_ne = '{
    "title": "आजै परिवर्तन ल्याउनुहोस्",
    "description": "हरेक योगदानले नेपालका बालबालिकालाई आशा र अवसर प्रदान गर्दछ।",
    "button_text": "दान गर्नुहोस्",
    "button_link": "/donate"
  }'::jsonb
WHERE section_key = 'donation_cta'
  AND (title_ne IS NULL OR title_ne = '');
