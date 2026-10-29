import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@supabase/supabase-js';

// Original Tailwind styling function
export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Supabase Database Connection
const supabaseUrl = 'https://mgolzolmhfqsjziuuauq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nb2x6b2xtaGZxc2p6aXV1YXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDc3NjUsImV4cCI6MjEwNzgyMzc2NX0.vjYe2I5X6cmVuLy7R5q4ibIi_MDi-xurympVa8ikhMY';

export const supabase = createClient(supabaseUrl, supabaseKey);