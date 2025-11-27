-- Ganti :email dan :hash sebelum eksekusi
UPDATE users
SET password = ':hash', updatedAt = NOW()
WHERE email = ':email';

/*
Example:
UPDATE users
SET password = '$2a$10$...'
WHERE email = 'mamat.admin@graky.com';
*/
