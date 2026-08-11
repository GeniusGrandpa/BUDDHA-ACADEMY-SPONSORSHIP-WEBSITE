UPDATE students
SET bio_ne = 'नमस्ते, म राम हुँ।',
    name_ne = 'राम'
WHERE id = 'a21ee791-3753-44c7-a63f-3684e86f308b'
  AND (bio_ne IS NULL OR bio_ne = bio);

UPDATE students
SET bio_ne = 'नमस्ते, म श्याम हुँ।',
    name_ne = 'श्याम'
WHERE id = '36460e6c-14f0-42b4-93d2-9e17aa68965b'
  AND (bio_ne IS NULL OR bio_ne = bio);
