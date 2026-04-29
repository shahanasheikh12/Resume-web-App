import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oipyucxdhvkrojauryqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcHl1Y3hkaHZrcm9qYXVyeXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTYzOTcsImV4cCI6MjA5MzA5MjM5N30.yod9eq9FlbX8DvPnWipN6H3hEaSwxo8KTDvJYuz5Ws4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
