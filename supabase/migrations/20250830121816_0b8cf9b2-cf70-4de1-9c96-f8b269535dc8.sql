-- Call the seed function to populate ecological data
SELECT net.http_post(
    url := 'https://mtprgclvusugyeesmapv.supabase.co/functions/v1/seed-ecological-data',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cHJnY2x2dXN1Z3llZXNtYXB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQxMDk5NywiZXhwIjoyMDcxOTg2OTk3fQ.AL-qPNl1rGa1gt-EfALeRbK6POo3OgLJQe_dLXLMgk0"}'::jsonb,
    body := '{}'::jsonb
) as request_id;