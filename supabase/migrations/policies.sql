-- =======================================================
-- REGRAS DE SEGURANÇA (RLS) - CAMPER TRACK
-- Copie e cole este código no SQL Editor do seu Supabase
-- =======================================================

-- 1. Habilitar RLS nas tabelas
ALTER TABLE track_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_viagem ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'track_points' (Rotas e Checkpoints)
DROP POLICY IF EXISTS "Leitura pública de pontos confirmados" ON track_points;
CREATE POLICY "Leitura pública de pontos confirmados" 
ON track_points FOR SELECT 
USING (is_confirmed = true);

DROP POLICY IF EXISTS "Inserção restrita ao Admin" ON track_points;
CREATE POLICY "Inserção restrita ao Admin" 
ON track_points FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização restrita ao Admin" ON track_points;
CREATE POLICY "Atualização restrita ao Admin" 
ON track_points FOR UPDATE 
TO authenticated 
USING (true);

-- 3. Políticas para 'perfil_viagem' (Configurações e Carro)
DROP POLICY IF EXISTS "Leitura pública do perfil" ON perfil_viagem;
CREATE POLICY "Leitura pública do perfil" 
ON perfil_viagem FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Atualização restrita ao Admin" ON perfil_viagem;
CREATE POLICY "Atualização restrita ao Admin" 
ON perfil_viagem FOR UPDATE 
TO authenticated 
USING (true);

-- 4. TRAVA DE SEGURANÇA: Impedir exclusão do Admin/Perfil
DROP POLICY IF EXISTS "Ninguém pode deletar o perfil do admin" ON perfil_viagem;
CREATE POLICY "Ninguém pode deletar o perfil do admin" 
ON perfil_viagem FOR DELETE 
TO authenticated 
USING (false);
