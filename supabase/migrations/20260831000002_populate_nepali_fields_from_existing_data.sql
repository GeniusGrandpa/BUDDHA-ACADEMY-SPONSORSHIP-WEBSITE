
DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'students' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE students SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'news' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE news SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'gallery_items' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE gallery_items SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'hero_content' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE hero_content SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'donation_content' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE donation_content SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


DO $$
DECLARE
  translation_record RECORD;
BEGIN
  FOR translation_record IN 
    SELECT entity_id, field, value 
    FROM content_translations 
    WHERE entity_type = 'sponsorship_content' AND language = 'ne'
  LOOP
    EXECUTE format('UPDATE sponsorship_content SET %I_ne = $1 WHERE id = $2', translation_record.field)
    USING translation_record.value, translation_record.entity_id;
  END LOOP;
END $$;


UPDATE students 
SET 
  name_ne = COALESCE(NULLIF(TRIM(name_ne), ''), name),
  bio_ne = COALESCE(NULLIF(TRIM(bio_ne), ''), bio),
  family_background_ne = COALESCE(NULLIF(TRIM(family_background_ne), ''), family_background),
  dream_career_ne = COALESCE(NULLIF(TRIM(dream_career_ne), ''), dream_career),
  education_goals_ne = COALESCE(NULLIF(TRIM(education_goals_ne), ''), education_goals),
  hobbies_ne = CASE WHEN hobbies_ne IS NULL OR array_length(hobbies_ne, 1) IS NULL THEN hobbies ELSE hobbies_ne END,
  achievements_ne = CASE WHEN achievements_ne IS NULL OR array_length(achievements_ne, 1) IS NULL THEN achievements ELSE achievements_ne END;


UPDATE news 
SET 
  title_ne = COALESCE(NULLIF(TRIM(title_ne), ''), title),
  excerpt_ne = COALESCE(NULLIF(TRIM(excerpt_ne), ''), excerpt),
  content_ne = COALESCE(NULLIF(TRIM(content_ne), ''), content);


UPDATE gallery_items 
SET 
  title_ne = COALESCE(NULLIF(TRIM(title_ne), ''), title),
  caption_ne = COALESCE(NULLIF(TRIM(caption_ne), ''), caption),
  author_ne = COALESCE(NULLIF(TRIM(author_ne), ''), author);


UPDATE hero_content 
SET 
  title_ne = COALESCE(NULLIF(TRIM(title_ne), ''), title),
  highlight_ne = COALESCE(NULLIF(TRIM(highlight_ne), ''), highlight),
  description_ne = COALESCE(NULLIF(TRIM(description_ne), ''), description),
  cta_primary_text_ne = COALESCE(NULLIF(TRIM(cta_primary_text_ne), ''), cta_primary_text),
  cta_secondary_text_ne = COALESCE(NULLIF(TRIM(cta_secondary_text_ne), ''), cta_secondary_text);


UPDATE page_headers 
SET 
  title_ne = COALESCE(NULLIF(TRIM(title_ne), ''), title),
  subtitle_ne = COALESCE(NULLIF(TRIM(subtitle_ne), ''), subtitle);


UPDATE footer_content 
SET 
  description_ne = COALESCE(NULLIF(TRIM(description_ne), ''), description),
  copyright_text_ne = COALESCE(NULLIF(TRIM(copyright_text_ne), ''), copyright_text),
  nonprofit_text_ne = COALESCE(NULLIF(TRIM(nonprofit_text_ne), ''), nonprofit_text);


UPDATE site_settings 
SET 
  site_name_ne = COALESCE(NULLIF(TRIM(site_name_ne), ''), site_name),
  site_tagline_ne = COALESCE(NULLIF(TRIM(site_tagline_ne), ''), tagline);
