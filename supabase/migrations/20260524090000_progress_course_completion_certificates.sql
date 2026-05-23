create unique index if not exists progress_student_subject_unique
on public.progress (student_id, subject);

create policy "Students insert own progress" on public.progress
  for insert to authenticated with check (auth.uid() = student_id);

create policy "Students update own progress" on public.progress
  for update to authenticated using (auth.uid() = student_id);
