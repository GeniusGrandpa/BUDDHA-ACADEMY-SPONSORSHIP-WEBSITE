UPDATE homepage_sections
SET content_ne = '{
  "description": "बुद्ध एकेडेमी बोर्डिंग स्कूलले काठमाडौं, नेपालका आवश्यकतामा परेका बालबालिकालाई निःशुल्क गुणस्तरीय शिक्षा, पौष्टिक भोजन र सुरक्षित बासस्थान प्रदान गर्दछ।",
  "cta_primary": {"link": "/sponsor", "text": "बालबालिका प्रायोजन गर्नुहोस्"},
  "cta_secondary": {"link": "/donate", "text": "दान गर्नुहोस्"}
}'::jsonb
WHERE section_key = 'hero' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);

UPDATE homepage_sections
SET content_ne = '{
  "items": [
    {"label": "विश्वसनीय सेवा", "value": "सन् १९७७ देखि"},
    {"label": "सेवाका वर्षहरू", "value": "४९+"},
    {"label": "निःशुल्क शिक्षा", "value": "१००%"},
    {"label": "सहयोग भएका बालबालिका", "value": "२५०+"}
  ]
}'::jsonb
WHERE section_key = 'stats' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);

UPDATE homepage_sections
SET content_ne = '{
  "stats": [
    {"label": "सेवाका वर्षहरू", "value": "४९+"},
    {"label": "शिक्षित बालबालिका", "value": "२०००+"},
    {"label": "सक्रिय प्रायोजनहरू", "value": "२५०+"},
    {"label": "निःशुल्क शिक्षा", "value": "१००%"}
  ]
}'::jsonb
WHERE section_key = 'impact_stats' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);

UPDATE homepage_sections
SET content_ne = '{
  "description": "बुद्ध एकेडेमीको स्थापना १९७७ मा भएको थियो, काठमाडौं, नेपालमा रहेको एउटा गैर-नाफामूलक बोर्डिंग स्कूल हो जसले आवश्यकतामा परेका बालबालिकालाई निःशुल्क गुणस्तरीय शिक्षा प्रदान गर्न समर्पित छ। १२ विद्यार्थीबाट सुरु भएको यो संस्था अब हजारौं बालबालिकालाई शिक्षा दिइसकेको छ।",
  "milestones": [
    {"event": "१२ जना विद्यार्थीबाट स्थापना", "year": "1977"},
    {"event": "स्थायी क्याम्पस स्थापना", "year": "1995"},
    {"event": "अन्तर्राष्ट्रिय प्रायोजन सुरु", "year": "2015"},
    {"event": "प्रत्येक वर्ष सयौं विद्यार्थीलाई शिक्षा", "year": "2026"}
  ]
}'::jsonb
WHERE section_key = 'about_preview' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);

UPDATE homepage_sections
SET content_ne = '{
  "steps": [
    {"desc": "प्रायोजनका लागि विद्यार्थीहरूको प्रोफाइल हेर्नुहोस्", "title": "प्रोफाइलहरू हेर्नुहोस्"},
    {"desc": "प्रायोजन गर्न एउटा बालबालिका छान्नुहोस्", "title": "बालबालिका छान्नुहोस्"},
    {"desc": "प्रायोजन फारम सुरक्षित रूपमा भर्नुहोस्", "title": "प्रतिज्ञा गर्नुहोस्"},
    {"desc": "प्रगति प्रतिवेदन र तस्बिरहरू प्राप्त गर्नुहोस्", "title": "अपडेटहरू प्राप्त गर्नुहोस्"}
  ]
}'::jsonb
WHERE section_key = 'sponsorship_steps' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);

UPDATE homepage_sections
SET content_ne = '{
  "allocation": [
    {"name": "विद्यार्थी शिक्षा र कल्याण", "percentage": 70},
    {"name": "शिक्षक र कर्मचारी", "percentage": 20},
    {"name": "सुविधा र सञ्चालन", "percentage": 10}
  ],
  "description": "हामी प्रत्येक दानको प्रयोगमा पूर्ण पारदर्शिता राख्छौं। हाम्रो बाँडफाँड मोडेलले हरेक बालबालिकाका लागि अधिकतम प्रभाव सुनिश्चित गर्दछ।"
}'::jsonb
WHERE section_key = 'transparency_highlight' AND (content_ne IS NULL OR content_ne = '{}'::jsonb);
