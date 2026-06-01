export interface CategoriaInfo {
  capituloIbama: string;
  subcategorias: string[];
}

export const CATALOGO_MATERRA_ELO: Record<string, CategoriaInfo> = {
  "METAIS FERROSOS": {
    capituloIbama: "IBAMA 10, 12",
    subcategorias: [
      "Aço carbono",
      "Inox 304",
      "Inox 316",
      "Ferro fundido",
      "Sucata leve",
      "Sucata pesada",
      "Sucata mista",
      "Cavaco metálico",
      "Limalha",
      "Carepa",
      "Pó de aciaria",
      "Estruturas metálicas",
      "Latas de aço",
      "Arame e fios de aço",
      "Tambores metálicos vazios",
      "Perfis e chapas de aço",
      "Outro (descrever)"
    ]
  },
  "METAIS NÃO FERROSOS": {
    capituloIbama: "IBAMA 11, 12",
    subcategorias: [
      "Alumínio em latas",
      "Alumínio perfis",
      "Alumínio borra",
      "Cobre fio",
      "Cobre tubo",
      "Cobre encapado",
      "Latão",
      "Bronze",
      "Zinco",
      "Chumbo (baterias)",
      "Chumbo metálico",
      "Níquel",
      "Estanho",
      "Titânio",
      "Magnésio",
      "Antimônio",
      "Outro (descrever)"
    ]
  },
  "METAIS PRECIOSOS DE E-LIXO": {
    capituloIbama: "IBAMA 11, 16",
    subcategorias: [
      "Ouro",
      "Prata",
      "Paládio",
      "Platina",
      "Ródio",
      "Placas de circuito (com PMs)",
      "Outro (descrever)"
    ]
  },
  "CO-PRODUTOS DE SIDERURGIA": {
    capituloIbama: "IBAMA 10",
    subcategorias: [
      "Escória de alto-forno",
      "Escória LD",
      "Escória de aciaria elétrica",
      "Lama de alto-forno",
      "Pó de balão",
      "Pó de sinterização",
      "Refratário usado",
      "Lodo de refrigeração",
      "Carepa de laminação",
      "Outro (descrever)"
    ]
  },
  "PLÁSTICOS": {
    capituloIbama: "IBAMA 07, 15, 16, 20",
    subcategorias: [
      "PET",
      "PEAD",
      "PEBD",
      "PP",
      "PVC",
      "PS",
      "EPS (isopor)",
      "ABS",
      "Nylon",
      "Policarbonato (PC)",
      "PMMA (acrílico)",
      "PEX",
      "PUR (poliuretano)",
      "Plástico filme",
      "Big bags usados",
      "Bombonas plásticas vazias",
      "Embalagens plásticas",
      "Tampas",
      "Lonas",
      "Tubos e conexões",
      "Sucata plástica mista",
      "Pellets/granulado",
      "Brindes plásticos",
      "Cabos plásticos (encapados)",
      "Outro (descrever)"
    ]
  },
  "PAPEL E PAPELÃO": {
    capituloIbama: "IBAMA 03, 15, 19, 20",
    subcategorias: [
      "Papelão ondulado",
      "Papel branco/sulfite",
      "Papel misto",
      "Jornal",
      "Revista",
      "Aparas de papel",
      "Caixas",
      "Papel kraft",
      "Tubetes",
      "Papel cartão",
      "Embalagens longa vida",
      "Papel laminado",
      "Papel impregnado",
      "Outro (descrever)"
    ]
  },
  "VIDRO": {
    capituloIbama: "IBAMA 10, 15, 20",
    subcategorias: [
      "Vidro incolor",
      "Vidro âmbar",
      "Vidro verde",
      "Vidro azul",
      "Cacos de vidro",
      "Vidro plano",
      "Garrafas",
      "Frascos farmacêuticos",
      "Vidro de lâmpada",
      "Vidro misto",
      "Espelhos",
      "Outro (descrever)"
    ]
  },
  "MADEIRA": {
    capituloIbama: "IBAMA 03, 15, 17, 20",
    subcategorias: [
      "Pallets",
      "Madeira limpa",
      "Madeira tratada",
      "Serragem",
      "Cavaco de madeira",
      "Aparas de madeira",
      "Caixas de madeira",
      "MDF/aglomerado",
      "Compensado",
      "Toras pequenas",
      "Pó de lixamento",
      "Resíduo de movelaria",
      "Outro (descrever)"
    ]
  },
  "TÊXTEIS": {
    capituloIbama: "IBAMA 04, 15, 20",
    subcategorias: [
      "Retalhos de tecido",
      "Aparas têxteis",
      "Fios",
      "Uniformes/EPIs usados",
      "Estopa",
      "Carpetes",
      "Fibras sintéticas",
      "Algodão hidrofóbico",
      "Brins",
      "Lonas têxteis",
      "Fardos têxteis mistos",
      "Outro (descrever)"
    ]
  },
  "COURO": {
    capituloIbama: "IBAMA 04",
    subcategorias: [
      "Aparas de couro wet-blue",
      "Aparas de couro acabado",
      "Pó de lixamento de couro",
      "Carnaça",
      "Fleshing",
      "Serragem de couro",
      "Tripas",
      "Resíduos curtidos",
      "Outro (descrever)"
    ]
  },
  "BORRACHA E PNEUS": {
    capituloIbama: "IBAMA 07, 16",
    subcategorias: [
      "Borracha natural (aparas)",
      "Borracha sintética (aparas)",
      "Pó de retífica",
      "Pneus inservíveis inteiros",
      "Pneus picados",
      "Pó micronizado de pneu",
      "Banda de rodagem",
      "Câmaras de ar",
      "Correias usadas",
      "Mangueiras",
      "Solados",
      "Vedação de borracha",
      "EPDM",
      "Outro (descrever)"
    ]
  },
  "QUÍMICOS INORGÂNICOS": {
    capituloIbama: "IBAMA 06",
    subcategorias: [
      "Ácidos (sulfúrico, clorídrico, nítrico, fosfórico, fluorídrico)",
      "Bases (soda cáustica, hidróxido de cálcio, hidróxido de amônio)",
      "Sais inorgânicos",
      "Reagentes vencidos",
      "Catalisadores exaustos",
      "Pigmentos inorgânicos",
      "Cianeto",
      "Sulfetos",
      "Cloratos",
      "Outro (descrever)"
    ]
  },
  "QUÍMICOS ORGÂNICOS": {
    capituloIbama: "IBAMA 07, 14",
    subcategorias: [
      "Solventes halogenados",
      "Solventes não halogenados",
      "Resinas",
      "Glicóis",
      "Aminas",
      "Aldeídos",
      "Cetonas",
      "Álcoois técnicos",
      "Fenóis",
      "Plastificantes",
      "Adesivos químicos",
      "Outro (descrever)"
    ]
  },
  "TINTAS, VERNIZES, COLAS E SOLVENTES": {
    capituloIbama: "IBAMA 08, 14",
    subcategorias: [
      "Tintas base solvente",
      "Tintas base água",
      "Borras de tinta",
      "Vernizes",
      "Esmaltes vítreos",
      "Colas e adesivos",
      "Vedantes",
      "Tintas de impressão",
      "Pó de pintura (overspray)",
      "Solventes de limpeza usados",
      "Outro (descrever)"
    ]
  },
  "ÓLEOS E GRAXAS": {
    capituloIbama: "IBAMA 12, 13",
    subcategorias: [
      "Óleo lubrificante usado",
      "Óleo hidráulico",
      "Óleo de corte/usinagem",
      "Graxa",
      "Óleo dielétrico (transformador)",
      "Óleo isolante PCB",
      "Borra oleosa",
      "Emulsão oleosa (água/óleo)",
      "Óleo vegetal usado",
      "Sebo industrial",
      "Outro (descrever)"
    ]
  },
  "COMBUSTÍVEIS E DERIVADOS DE PETRÓLEO": {
    capituloIbama: "IBAMA 05, 13",
    subcategorias: [
      "Borra de tanque de combustível",
      "Gasolina contaminada",
      "Diesel contaminado",
      "Lodo de refinaria",
      "Asfalto/piche",
      "Catalisadores FCC",
      "Carvão ativado exausto",
      "Carbono coque",
      "Outro (descrever)"
    ]
  },
  "LODOS INDUSTRIAIS E DE ETE/ETA": {
    capituloIbama: "IBAMA 19",
    subcategorias: [
      "Lodo de ETE (efluente) desaguado",
      "Lodo de ETA (água)",
      "Lodo biológico",
      "Lodo de tinta",
      "Lodo de cabines de pintura",
      "Lodo galvânico",
      "Lodo de fosfatização",
      "Lodo de processo",
      "Lodo de prensa",
      "Borra de fosfato",
      "Lodo oleoso",
      "Lodo químico",
      "Outro (descrever)"
    ]
  },
  "TRATAMENTO DE SUPERFÍCIE METÁLICA E GALVANOPLASTIA": {
    capituloIbama: "IBAMA 11",
    subcategorias: [
      "Banhos exaustos de niquelagem",
      "Banhos de cromagem",
      "Banhos de zincagem",
      "Banhos de cobre",
      "Solução de decapagem",
      "Pó de jateamento",
      "Resíduo de fosfatização",
      "Outro (descrever)"
    ]
  },
  "INDÚSTRIA FOTOGRÁFICA E DE IMPRESSÃO": {
    capituloIbama: "IBAMA 08, 09",
    subcategorias: [
      "Banhos fotográficos",
      "Filmes radiográficos",
      "Soluções fixadoras",
      "Toner",
      "Cartuchos vazios",
      "Chapas offset",
      "Solventes de impressão",
      "Outro (descrever)"
    ]
  },
  "PROCESSOS TÉRMICOS — CINZAS E ESCÓRIAS": {
    capituloIbama: "IBAMA 10",
    subcategorias: [
      "Cinzas de caldeira a biomassa",
      "Cinzas de carvão mineral",
      "Cinzas leves (fly ash)",
      "Cinzas pesadas",
      "Escórias de fundição",
      "Refratários usados",
      "Pó de filtro de manga",
      "Outro (descrever)"
    ]
  },
  "ELETRÔNICOS E ELETROELETRÔNICOS (REEE)": {
    capituloIbama: "IBAMA 16, 20",
    subcategorias: [
      "Placas de circuito",
      "Computadores e notebooks",
      "Celulares",
      "Tablets",
      "Monitores LCD",
      "CRT",
      "Cabos e fios",
      "Carregadores e fontes",
      "HDs e mídias",
      "Cartuchos e toners",
      "Lâmpadas fluorescentes",
      "Lâmpadas LED",
      "Lâmpadas de mercúrio",
      "Eletrodomésticos (linha branca)",
      "Eletrônicos diversos",
      "Componentes (capacitores, resistores)",
      "Outro (descrever)"
    ]
  },
  "PILHAS E BATERIAS": {
    capituloIbama: "IBAMA 16",
    subcategorias: [
      "Pilhas alcalinas",
      "Pilhas zinco-carbono",
      "Baterias chumbo-ácido",
      "Baterias automotivas",
      "Baterias VRLA",
      "Baterias industriais",
      "Baterias Li-ion",
      "Baterias NiMH",
      "Baterias NiCd",
      "Baterias de notebook e celular",
      "Baterias estacionárias (no-break)",
      "Outro (descrever)"
    ]
  },
  "EMBALAGENS E EPIs": {
    capituloIbama: "IBAMA 15",
    subcategorias: [
      "Embalagens plásticas",
      "Embalagens metálicas",
      "Embalagens de papel",
      "Embalagens compostas",
      "Embalagens contaminadas Classe I",
      "Tambores metálicos vazios (com TLV)",
      "IBC",
      "EPIs usados (luvas, óculos, máscaras, botas)",
      "Filtros de óleo",
      "Filtros de ar",
      "Filtros de água",
      "Outro (descrever)"
    ]
  },
  "CONSTRUÇÃO CIVIL — RCC": {
    capituloIbama: "IBAMA 17",
    subcategorias: [
      "Classe A: concreto; argamassa; tijolo; telha cerâmica; pedra; areia; solo natural.",
      "Classe B: madeira; metal de obra; PVC; papelão de obra; vidro plano; gesso limpo.",
      "Classe C: gesso contaminado; lã de vidro/rocha; amianto/cimento-amianto.",
      "Classe D: tinta de obra; solo contaminado; resíduo perigoso de obra.",
      "Entulho misto",
      "Asfalto fresado",
      "Telhas de fibrocimento",
      "Drywall",
      "Outro (descrever)"
    ]
  },
  "MINERAÇÃO": {
    capituloIbama: "IBAMA 01",
    subcategorias: [
      "Estéril",
      "Rejeito de minério de ferro",
      "Bauxita (lama vermelha)",
      "Fosfato (rejeito)",
      "Potássio (rejeito)",
      "Pó de britagem",
      "Finos de calcário",
      "Lama de flotação",
      "Carvão mineral (rejeito)",
      "Areia de mineração",
      "Lodo de lavagem",
      "Outro (descrever)"
    ]
  },
  "RESÍDUOS DE SERVIÇOS DE SAÚDE — RSS": {
    capituloIbama: "IBAMA 18",
    subcategorias: [
      "Grupo A — biológico: culturas; peças anatômicas; bolsas de sangue; resíduos com risco biológico.",
      "Grupo B — químico: quimioterápicos; medicamentos vencidos; reagentes; solventes de laboratório; resíduos farmacêuticos.",
      "Grupo D — comum não contaminado: papel; plástico; restos de copa.",
      "Grupo E — perfurocortantes: agulhas; lâminas; ampolas quebradas; vidros pontiagudos.",
      "Outro (descrever)"
    ]
  },
  "RESÍDUOS DE LABORATÓRIO E PESQUISA": {
    capituloIbama: "IBAMA 06, 07, 09",
    subcategorias: [
      "Reagentes vencidos",
      "Soluções padrão",
      "Solventes residuais",
      "Vidraria contaminada",
      "Embalagens de reagente",
      "Material biológico tratado",
      "Outro (descrever)"
    ]
  },
  "AGRÍCOLAS VEGETAIS — PALHADAS, CASCAS E COPRODUTOS": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Cana — bagaço, palha, torta de filtro, vinhaça, melaço, cinza de caldeira.",
      "Soja — palha, casca, farelo, torta, borra, lecitina, resíduo de soja.",
      "Milho — palhada, sabugo, farelo, glúten feed, corn steep liquor, DDG, DDGS, WDG, óleo de milho, syrup.",
      "Algodão — caroço, casca, línter, torta, farelo, pó de descaroçadeira.",
      "Arroz — palha, casca, farelo, quirera, cinza de casca.",
      "Trigo, cevada, aveia — palha, farelo, resíduo de malte (bagaço cervejeiro).",
      "Sorgo, girassol, amendoim, canola, mamona — palhas, tortas, farelos.",
      "Dendê — cachos vazios (EFB), fibra, torta de palmiste (PKC), POME (efluente).",
      "Coco — fibra, pó, casca",
      "Citros — bagaço, polpa, casca",
      "Café — palha, polpa, casca, borra",
      "Cacau — casca, mucilagem",
      "Banana — engaço, pseudocaule",
      "Mandioca — manipueira, crueira, casca",
      "Outro (descrever)"
    ]
  },
  "PRODUÇÃO DE AÇÚCAR E ETANOL": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Bagaço",
      "Palha",
      "Torta de filtro",
      "Vinhaça",
      "Melaço",
      "Levedura de fermentação",
      "CO2 de fermentação",
      "Cinzas de bagaço",
      "Soro de melaço",
      "Outro (descrever)"
    ]
  },
  "PRODUÇÃO DE ETANOL DE MILHO": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "DDGS",
      "DDG",
      "WDG",
      "Óleo de milho",
      "Syrup",
      "Levedura",
      "CO2 de fermentação",
      "Cinzas de caldeira",
      "Outro (descrever)"
    ]
  },
  "PRODUÇÃO DE BIODIESEL": {
    capituloIbama: "IBAMA 02, 13",
    subcategorias: [
      "Glicerina bruta",
      "Borra de biodiesel",
      "Tortas oleaginosas (soja, algodão, girassol)",
      "Sabões de neutralização",
      "Catalisador exausto",
      "Outro (descrever)"
    ]
  },
  "AGROINDUSTRIAIS ANIMAIS": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Farinha de ossos",
      "Farinha de carne e ossos (MBM)",
      "Farinha de sangue",
      "Farinha de penas",
      "Farinha de peixe",
      "Farinha de vísceras",
      "Sebo bovino",
      "Banha suína",
      "Óleo de peixe",
      "Soro de leite",
      "Permeado",
      "Lacto-soro",
      "Casca de ovo moída",
      "Plumas e penas",
      "Cama de incubatório",
      "Outro (descrever)"
    ]
  },
  "PECUÁRIA E CONFINAMENTO": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Bovinos: esterco sólido; esterco líquido; urina; conteúdo ruminal; cama compost barn; chorume de silagem.",
      "Suínos: dejeto líquido; lodo de biodigestor; placenta; água de lavagem.",
      "Aves: cama de frango; cama de incubatório; ovos não eclodidos; penas; água de lavagem; mortalidade compostada.",
      "Outro (descrever)"
    ]
  },
  "ABATEDOURO E FRIGORÍFICO": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Sebo",
      "Ossos",
      "Sangue",
      "Vísceras",
      "Aparas de carne",
      "Conteúdo ruminal",
      "Resíduo de courinho",
      "Cascos e chifres",
      "Pena (aves)",
      "Garras",
      "Lodo de ETE de frigorífico",
      "Outro (descrever)"
    ]
  },
  "LATICÍNIOS": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Soro de leite líquido",
      "Soro em pó",
      "Permeado",
      "Lactose",
      "Cream",
      "Leitelho",
      "Lodo de ETE",
      "Embalagens longa vida",
      "Filme de envase",
      "Outro (descrever)"
    ]
  },
  "PESCA E AQUICULTURA": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Resíduo de filetagem",
      "Cabeças e ossos",
      "Vísceras de peixe",
      "Pele",
      "Escamas",
      "Carapaças de camarão",
      "Conchas",
      "Casca de mariscos",
      "Sangue de pescado",
      "Outro (descrever)"
    ]
  },
  "BEBIDAS": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Bagaço de uva (engaço, película, semente)",
      "Bagaço de malte",
      "Lúpulo usado",
      "Borra de fermenteção",
      "Tartarato",
      "Resíduo de filtração",
      "Garrafas e cacos",
      "Outro (descrever)"
    ]
  },
  "PANIFICAÇÃO E ALIMENTOS PROCESSADOS": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Farelos",
      "Pó de farinha",
      "Massa fora de spec",
      "Aparas de pão",
      "Óleos de fritura",
      "Borras de fritura",
      "Embalagens contaminadas com gordura",
      "Outro (descrever)"
    ]
  },
  "MICRONUTRIENTES PARA ORGANOMINERAL": {
    capituloIbama: "IBAMA 02",
    subcategorias: [
      "Sulfato de zinco",
      "Óxido de zinco",
      "Sulfato de cobre",
      "Óxido cúprico",
      "Sulfato de manganês",
      "Sulfato ferroso",
      "Quelatos EDTA",
      "Ácido bórico",
      "Borax",
      "Ulexita",
      "Molibdato de sódio",
      "Molibdato de amônio",
      "Pó de rocha (basalto, fonolito)",
      "Pó de aciaria",
      "Termofosfato",
      "Gesso agrícola",
      "Cinzas vegetais",
      "Outro (descrever)"
    ]
  },
  "FERTILIZANTES E CORRETIVOS RECICLADOS": {
    capituloIbama: "IBAMA 02, 10",
    subcategorias: [
      "Composto orgânico",
      "Composto urbano",
      "Organomineral granulado",
      "NPK reciclado",
      "Húmus industrial",
      "Vermicomposto",
      "Lodo de ETE classe A para uso agrícola",
      "Cinzas calcárias",
      "Calcário moído de resíduo",
      "Outro (descrever)"
    ]
  },
  "RESÍDUOS URBANOS — RSU": {
    capituloIbama: "IBAMA 20",
    subcategorias: [
      "Resíduo doméstico (compostável)",
      "Recicláveis secos",
      "Rejeito",
      "Resíduo de varrição",
      "Resíduo de poda urbana",
      "Resíduo de feira livre",
      "Outro (descrever)"
    ]
  },
  "RESÍDUOS PERIGOSOS DIVERSOS": {
    capituloIbama: "IBAMA 16, 18",
    subcategorias: [
      "Amianto livre",
      "Materiais com PCB",
      "Resíduos radioativos (somente até limite isento)",
      "Materiais contaminados com mercúrio",
      "Resíduos de cianeto",
      "Resíduos farmacêuticos não RSS",
      "Defensivos agrícolas vencidos",
      "Embalagens vazias de agrotóxicos (tríplice lavagem)",
      "Outro (descrever)"
    ]
  },
  "RESÍDUOS NÃO ESPECIFICADOS / OUTROS": {
    capituloIbama: "IBAMA 16",
    subcategorias: [
      "Resíduo não especificado",
      "EPI usado",
      "Material absorvente",
      "Filtros",
      "Catalisadores usados",
      "Resíduo Classe I diverso",
      "Resíduo Classe II diverso",
      "Outro (descrever)"
    ]
  }
};
