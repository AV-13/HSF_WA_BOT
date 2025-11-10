-- Policies RLS pour permettre l'accès avec la service_role key
-- La service_role key bypass automatiquement le RLS, mais pour plus de sécurité
-- nous définissons aussi des policies pour l'anon key

-- Policies pour conversations
create policy "Service role has full access to conversations"
  on conversations
  for all
  using (true)
  with check (true);

-- Policies pour messages
create policy "Service role has full access to messages"
  on messages
  for all
  using (true)
  with check (true);
