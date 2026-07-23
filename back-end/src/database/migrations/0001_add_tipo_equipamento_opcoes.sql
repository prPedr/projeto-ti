ALTER TABLE opcoes_predefinidas
ADD COLUMN tipo_equipamento TEXT
CHECK (tipo_equipamento IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR_CAMERA'));

-- Dados existentes foram todos cadastrados antes dessa feature existir,
-- quando só se pensava em notebooks/desktops — retroativamente marcados
-- como COMPUTADOR pra não ficarem "órfãos" (sem tipo, invisíveis nas
-- telas novas que filtram por tipo_equipamento).
UPDATE opcoes_predefinidas
SET tipo_equipamento = 'COMPUTADOR'
WHERE tipo_equipamento IS NULL;
