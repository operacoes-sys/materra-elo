export const WHATSAPP_NUM = '5562999104815'

export const CATALOGO_RESIDUOS: Record<string, string[]> = {
  'Metais': ['Sucata de ferro', 'Sucata de alumínio', 'Cobre', 'Inox', 'Latão', 'Chumbo', 'Outros'],
  'Plásticos': ['PET', 'PEAD', 'PVC', 'PEBD', 'PP', 'PS', 'Outros'],
  'Papel/Papelão': ['Papelão ondulado', 'Papel branco', 'Aparas de papel', 'Outros'],
  'Vidro': ['Vidro plano', 'Garrafas de vidro', 'Vidro quebrado', 'Outros'],
  'Madeira': ['Paletes de madeira', 'Serragem', 'Sobras de madeira', 'Outros'],
  'Orgânicos': ['Resíduos alimentares', 'Resíduos de poda/jardinagem', 'Lodo de esgoto', 'Outros'],
  'Óleos e graxas': ['Óleo de cozinha usado', 'Óleo lubrificante usado (OLUC)', 'Borra oleosa', 'Outros'],
  'Químicos': ['Solventes usados', 'Tintas e vernizes', 'Ácidos/Bases', 'Outros'],
  'Eletrônicos': ['Computadores/Monitores', 'Eletrodomésticos', 'Placas de circuito', 'Outros'],
  'Têxteis': ['Aparas de tecido', 'Retalhos', 'Fios de algodão', 'Outros'],
  'Borracha': ['Pneus inservíveis', 'Raspas de borracha', 'Borracha sintética', 'Outros'],
  'Construção civil': ['Entulho/RCD', 'Gesso', 'Madeira de obra', 'Outros'],
  'Lodos': ['Lodo de ETE (Estação de Tratamento de Efluentes)', 'Lodo de ETA', 'Outros'],
  'Fertilizante/organomineral': ['Adubo orgânico', 'Cinzas vegetais', 'Calcário', 'Outros'],
  'Outros': ['Outros resíduos não listados']
}

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export const TRATAMENTOS_PREVISTOS = [
  'Reciclagem', 'Rerrefino', 'Coprocessamento', 'Blendagem para coprocessamento', 
  'Incineração', 'Aterro Classe I', 'Aterro Classe II', 'Compostagem', 
  'Reutilização', 'Recuperação energética', 'Tratamento térmico', 
  'Tratamento biológico', 'Descontaminação', 'Outros'
]

export const ACONDICIONAMENTOS = [
  'Granel', 'Tambor', 'Bombona', 'Big bag', 'Caixa', 'Caixa de papelão',
  'Container', 'Caçamba aberta', 'Caçamba fechada', 'Cilindro', 'Fardo', 
  'Pallets', 'Saco plástico', 'Outros'
]
