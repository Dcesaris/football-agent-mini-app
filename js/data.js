/* ============================================================
   Palco 90 — Protótipo (clone de Palco 90: Soccer Manager)
   js/data.js — dados estáticos: mundo, nomes, estilos, formações,
   roles, desafios.
   ============================================================ */
"use strict";

const D = {

  /* ---------- Paleta (tema original) ---------- */
  theme: {
    bg: "#07110d", panel: "#0d1c16", panel2: "#12231c",
    text: "#f4f8f1", muted: "#b4c0b2", green: "#7bdb8f",
    gold: "#f0c56a", blue: "#7bb7ff", red: "#ef7b72", line: "rgba(226,246,224,.14)"
  },

  /* ---------- Países / ligas (mundo fictício) ---------- */
  // divisões: 8 clubes cada. Europa: campeão 1ª+2º -> Champions, 3º-4º -> Europa, Copa continental via copa (v1: 5º-6º)
  countries: [
    { id: "his", name: "Hispania",    divisions: 4, eu: [1,2], eu2: [3,4], style: "Potência grande com rota europeia ampla." },
    { id: "alb", name: "Albion",      divisions: 4, eu: [1,2], eu2: [3,4], style: "A liga mais rica e profunda." },
    { id: "etr", name: "Etruria",     divisions: 3, eu: [1],   eu2: [2],   style: "Tradição forte e terceira profissional." },
    { id: "pru", name: "Prusia",      divisions: 3, eu: [1],   eu2: [2],   style: "Competitiva, física e com três níveis." },
    { id: "gal", name: "Galia",       divisions: 3, eu: [1],   eu2: [2],   style: "Bom nível médio e terceira divisão." },
    { id: "lus", name: "Lusitania",   divisions: 2, eu: [1],   eu2: [],    style: "Liga menor com vagas europeias." },
    { id: "bat", name: "Batavia",     divisions: 2, eu: [1],   eu2: [],    style: "A rota neerlandesa do mundo Palco 90." },
    { id: "ana", name: "Anatolia",    divisions: 2, eu: [1],   eu2: [],    style: "Coeficiente médio-baixo e clubes duros." },
    { id: "hel", name: "Helade",      divisions: 2, eu: [1],   eu2: [],    style: "Nova liga grega, abaixo das grandes." },
    { id: "esc", name: "Escandia",    divisions: 2, eu: [1],   eu2: [],    style: "Nova liga nórdica com coeficiente contido." }
  ],

  /* ---------- Cidades (nomes fictícios por país) ---------- */
  cities: {
    his: ["Almeda","Bordon","Cáspeda","Dureno","Eslova","Farela","Giranda","Humera","Ibarza","Jaldés","Karpa","Lucena","Mirava","Nariego","Ondara"],
    alb: ["Ashfield","Brantham","Caldmere","Dunwich","Eastford","Fallow","Greenmoor","Haltwick","Ironby","Kingsley","Lowbridge","Marlow","Northgate","Oxwell","Pember"],
    etr: ["Arena","Brento","Cisano","Durazzo","Estevio","Fosso","Granata","Imeria","Lunato","Mentore","Novara","Ossino","Palena","Quirino","Rovello"],
    pru: ["Alstadt","Brandau","Cossel","Dreiberg","Elstede","Falken","Grendorf","Hallen","Ilsburg","Jaren","Kesseln","Lindenau","Miesbach","Nordheim","Osterfeld"],
    gal: ["Ambrie","Bellecourt","Châton","Dornac","Épernay","Fontaine","Gironne","Hautclair","Ivonne","Julliac","Landres","Mennecy","Noyan","Orliac","Puyfort"],
    lus: ["Alvarenga","Beira-mar","Carcavelos","Douro","Ericeira","Faro-lez","Gaviera","Ílhavo","Juncal","Lavradio","Mértola","Nazaré-do-mar","Óbidos","Palmela","Quarteira"],
    bat: ["Almere","Brederode","Culemborg","Deventer","Eemnes","Flevo","Gouda","Hoorn","IJssel","Joure","Katwijk","Lisse","Meppel","Nijkerk","Oudewater"],
    ana: ["Ankara-yolu","Beypazar","Cayhan","Derinkuyu","Eregli","Fethi","Golbasi","Havza","Islahiye","Kadirli","Lapseki","Manavgat","Nazilli","Ordu-koy","Pamukkale"],
    hel: ["Aegira","Beroia","Chalkida","Drama","Egio","Florina","Galaxidi","Hydra","Ioannina","Kastoria","Larissa","Metsovo","Nafpaktos","Olympos","Patras"],
    esc: ["Arvika","Bergslagen","Dalby","Eksjo","Falkoping","Gavle","Harnosand","Iggesund","Jokkmokk","Kalmar","Lulea","Mora","Nassjo","Ornskoldsvik","Pitea"]
  },

  /* ---------- Sufixos de clubes por país ---------- */
  clubSuffix: {
    his: ["CF","UD","Atlético","Deportivo","Racing","Real","Sporting","Unión"],
    alb: ["FC","United","Town","Rovers","Athletic","City","Wanderers","Albion"],
    etr: ["Calcio","FC","SS","Virtus","Roma","Juventus-like","Atletico","Racing"],
    pru: ["FC","SV","Borussia","VfB","Eintracht","Union","Hertha-like","Sport"],
    gal: ["FC","AS","Racing","Stade","Olympique","Union","Sporting","Ajaccio-like"],
    lus: ["FC","SC","CD","UD","Vitória","Belenenses-like","Sporting","Académica-like"],
    bat: ["FC","Sparta-like","Vitesse-like","PSV-like","Ajax-like","AZ-like","RKC-like","NEC-like"],
    ana: ["SK","FK","GS-like","BJ-like","TR-like","TS-like","AS-like","Konya-like"],
    hel: ["FC","PAOK-like","AEK-like","Olympiacos-like","Aris-like","Panathinaikos-like","OFI-like","Larissa-like"],
    esc: ["FF","BK","AIK-like","Hammarby-like","Göteborg-like","Malmö-like","Norrköping-like","Elfsborg-like"]
  },

  /* ---------- Nomes de jogadores ---------- */
  firstNames: {
    his: ["Álvaro","Bruno","Carlos","David","Emilio","Fabián","Gonzalo","Iker","Javier","Luis","Marcos","Nicolás","Óscar","Pablo","Raúl","Sergio","Tomás","Víctor","Xabier","Yago"],
    alb: ["Aaron","Ben","Callum","Daniel","Edward","Freddie","George","Harry","Isaac","Jack","Kyle","Lewis","Marcus","Nathan","Oliver","Peter","Ryan","Samuel","Thomas","William"],
    etr: ["Alberto","Bernardo","Ciro","Dario","Enzo","Fabio","Gianni","Luca","Marco","Nino","Paolo","Renzo","Silvio","Tonio","Umberto","Vito","Aldo","Bruno","Cesare","Domenico"],
    pru: ["Andreas","Bernd","Christian","Dieter","Erik","Frank","Gerd","Hans","Jürgen","Klaus","Lars","Manfred","Niklas","Oliver","Peter","Ralf","Stefan","Thomas","Uwe","Volker"],
    gal: ["Antoine","Baptiste","Clément","Damien","Étienne","François","Grégoire","Hugo","Julien","Léon","Maxime","Nicolas","Olivier","Pierre","Quentin","Rémi","Simon","Théo","Victor","Yann"],
    lus: ["Afonso","Bernardo","Cristiano-like","Duarte","Eduardo","Fábio","Gonçalo","Henrique","Ivo","João","Lourenço","Miguel","Nuno","Pedro","Rafael","Salvador","Tiago","Vasco","Xavier","Zé"],
    bat: ["Bas","Cornelis","Daan","Erik","Femke","Gerrit","Hendrik","Ivo","Jan","Kees","Lars","Maarten","Niels","Oscar","Pieter","Quirijn","Rutger","Sander","Theo","Willem"],
    ana: ["Ahmet","Burak","Cem","Deniz","Emre","Fikret","Gökhan","Hakan","İbrahim","Kerem","Mehmet","Nihat","Onur","Özgür","Serkan","Tolga","Umut","Volkan","Yusuf","Zafer"],
    hel: ["Alexandros","Basilis","Christos","Dimitris","Efthimis","Fotis","Georgios","Hlias","Ioannis","Kostas","Lefteris","Manolis","Nikos","Orestis","Panagiotis","Sotiris","Theodoros","Vasilis","Yannis","Zisis"],
    esc: ["Anders","Björn","Carl","Daniel","Erik","Fredrik","Gustav","Henrik","Isak","Johan","Karl","Lars","Magnus","Niklas","Oskar","Per","Rolf","Sten","Tobias","Ulf"]
  },
  lastNames: {
    his: ["Alonso","Benítez","Castro","Domínguez","Escobar","Fernández","García","Herrera","Iglesias","Jiménez","López","Martínez","Navarro","Ortega","Pérez","Ramos","Sánchez","Torres","Vega","Zapata"],
    alb: ["Anderson","Bennett","Clarke","Dawson","Edwards","Foster","Gray","Harris","Jones","Knight","Lloyd","Marshall","Nelson","Owens","Parker","Reed","Smith","Turner","Walker","Young"],
    etr: ["Allegri","Bianchi","Conti","De Rossi","Esposito","Ferrari","Gallo","Iannucci","Leone","Marchetti","Neri","Orlando","Pellegrini","Ricci","Sartori","Totti-like","Villa","Zanetti","Barbieri","Costa"],
    pru: ["Auer","Bauer","Cramer","Drescher","Ebert","Fischer","Gruber","Hoffmann","Jäger","Keller","Lange","Meyer","Neumann","Peters","Richter","Schmidt","Traub","Vogel","Weber","Zimmermann"],
    gal: ["Aubry","Bernard","Caron","Delacroix","Etienne-like","Fabre","Girard","Huet","Jacquet","Lefèvre","Martin","Nicolas-like","Pascal","Renaud","Simon-like","Tessier","Vasseur","Aubert","Blanc","Charpentier"],
    lus: ["Almeida","Barros","Cardoso","Dias","Esteves","Ferreira","Gomes","Henriques","Inácio","Jesus","Lopes","Machado","Nogueira","Oliveira","Pinto","Ribeiro","Santos","Teixeira","Vieira","Xavier-like"],
    bat: ["Bakker","De Boer","Eijk","Faber","Groot","Hendriks","Jansen","Koopman","Lammers","Molen","Nijhof","Oosterhuis","Peeters","Rijnders","Smit","Timmermans","Visser","Willems","Zwart","Bosch"],
    ana: ["Aydın","Baran","Çelik","Demir","Erdoğan","Fidan","Güneş","Hakan-like","Ilgaz","Kaplan","Kurt","Mert","Nalbant","Öztürk","Polat","Şahin","Toprak","Yılmaz","Zorlu","Akçay"],
    hel: ["Alexakis","Bakas","Christou","Dimitriou","Economou","Fotakis","Georgiou","Hatzis","Ioannidis","Katsaros","Lambros","Mavros","Nikolaidis","Oikonomou","Papadopoulos","Rigas","Sotiriou","Theodorou","Vlachos","Zervas"],
    esc: ["Andersson","Bergström","Carlsson","Dahl","Ekström","Forsberg","Gustafsson","Holm","Isaksson","Jonsson","Karlsson","Lindberg","Magnusson","Nilsson","Olsson","Pettersson","Rosén","Sandberg","Törnqvist","Wallin"]
  },

  /* ---------- Posições ---------- */
  posFull: { POR: "Goleiro", DEF: "Zagueiro", LAT: "Lateral", PIV: "Pivô", MC: "Meia", MP: "Meia-ponta", EXT: "Extremo", ATA: "Atacante" },

  /* ---------- Roles por posição ---------- */
  roles: {
    POR: [
      { code: "POR", name: "Goleiro clássico", desc: "Parada e presença na área." },
      { code: "PIES", name: "Goleiro com os pés", desc: "Saída limpa e bola longa." }
    ],
    DEF: [
      { code: "MAR", name: "Marcador", desc: "Ganha duelos e não perde ninguém." },
      { code: "COR", name: "Corretor", desc: "Cobre espaços e lê o jogo." },
      { code: "SAL", name: "Zagueiro de saída", desc: "Inicia a construção desde trás." }
    ],
    LAT: [
      { code: "DEF", name: "Lateral defensivo", desc: "Protege o corredor." },
      { code: "PRO", name: "Lateral profundo", desc: "Ganha metros por fora." },
      { code: "INV", name: "Lateral invertido", desc: "Constrói por dentro." }
    ],
    PIV: [
      { code: "PIV", name: "Pivô", desc: "Sustenta e quebra jogadas." },
      { code: "ORG", name: "Organizador", desc: "Dita o ritmo com passe." },
      { code: "BOX", name: "Box-to-box", desc: "Percurso e chegada na área." }
    ],
    MC: [
      { code: "ORG", name: "Organizador", desc: "Controla o passe." },
      { code: "BOX", name: "Box-to-box", desc: "Faz o meio e a área." }
    ],
    MP: [
      { code: "MP", name: "Meia-ponta", desc: "Cria entre linhas." },
      { code: "INT", name: "Interior", desc: "Entra por dentro com drible e tiro." }
    ],
    EXT: [
      { code: "DES", name: "Desborde", desc: "Ataca por fora em velocidade." },
      { code: "INT", name: "Interior", desc: "Corta para dentro." },
      { code: "TRA", name: "Trabalhador", desc: "Ajuda atrás e pressiona." }
    ],
    ATA: [
      { code: "REF", name: "Referência", desc: "Prende a defesa e finaliza." },
      { code: "MOV", name: "Móvel", desc: "Ataca espaços em velocidade." },
      { code: "PRE", name: "Pressionante", desc: "Defende lá em cima." },
      { code: "REM", name: "Rematador", desc: "Vive da área." }
    ]
  },

  /* ---------- Atributos ---------- */
  attrs: [
    { key: "def",  label: "Defesa" },
    { key: "pase", label: "Passe" },
    { key: "regate", label: "Drible" },
    { key: "velo", label: "Velocidade" },
    { key: "tiro", label: "Chute" },
    { key: "cabe", label: "Cabeceio" },
    { key: "fisi", label: "Físico" },
    { key: "visi", label: "Visão" }
  ],

  /* ---------- 11 estilos de jogo ---------- */
  // pesos: zona (def/mid/atk) e atributos-chave
  styles: {
    EQUI: { name: "Equilibrado", desc: "Não força o jogo para nenhum lado. Bom com plantel misto.", tags: ["regularidade","plantel misto"], zone: [1,1,1], w: {def:.5,pase:.5,regate:.5,velo:.5,tiro:.5,cabe:.5,fisi:.5,visi:.5} },
    POSSE: { name: "Posse", desc: "Domina a bola com passe e paciência. Converte melhor se o meio sabe jogar.", tags: ["passe","controlo"], zone: [.8,1.3,1], w: {def:.4,pase:1.4,regate:.7,velo:.3,tiro:.5,cabe:.3,fisi:.6,visi:1.2} },
    DIRETO: { name: "Jogo direto", desc: "Avança rápido e ataca espaços. Combina com atacantes velozes.", tags: ["passe longo","velocidade"], zone: [.9,.8,1.3], w: {def:.5,pase:.9,regate:.4,velo:1.3,tiro:.7,cabe:.7,fisi:.8,visi:.5} },
    BANDAS: { name: "Pelas alas", desc: "Carrega o jogo para laterais e extremos. Precisa de cruzamento.", tags: ["alas","cruzamentos"], zone: [.9,1,1.2], w: {def:.5,pase:.7,regate:1.1,velo:1.3,tiro:.4,cabe:1, fisi:.6,visi:.5} },
    CONTRA: { name: "Contra-ataque", desc: "Defende baixo e castiga quando o rival se parte.", tags: ["bloco baixo","transição"], zone: [1.3,.7,1.1], w: {def:1.1,pase:.6,regate:.6,velo:1.4,tiro:.8,cabe:.6,fisi:.9,visi:.7} },
    TIKI: { name: "Tiki-taka", desc: "Versão extrema da posse. Técnica e paciência; sem passe, fica estéril.", tags: ["passe","calma"], zone: [.8,1.5,.9], w: {def:.4,pase:1.6,regate:.8,velo:.2,tiro:.4,cabe:.2,fisi:.5,visi:1.4} },
    DRIBLE: { name: "Drible", desc: "Valoriza quem ganha duelos. Menos coletivo, mais individual.", tags: ["drible","talento"], zone: [.9,.9,1.3], w: {def:.4,pase:.6,regate:1.6,velo:1.1,tiro:.7,cabe:.4,fisi:.6,visi:.6} },
    REMATE: { name: "Remate", desc: "Aumenta o volume de chutes. Precisa de bons finalizadores.", tags: ["remate","volume"], zone: [.9,.8,1.3], w: {def:.4,pase:.5,regate:.5,velo:.5,tiro:1.6,cabe:1, fisi:.7,visi:.4} },
    CATENACCIO: { name: "Catenaccio", desc: "Fecha espaços, baixa o ritmo e sobrevive.", tags: ["defesa","ordem"], zone: [1.6,.8,.6], w: {def:1.6,pase:.5,regate:.3,velo:.4,tiro:.5,cabe:.8,fisi:1.2,visi:.6} },
    TOTAL: { name: "Futebol total", desc: "Versatilidade e resistência. Todos trocam de função.", tags: ["polivalência","fundo"], zone: [1.1,1.1,1.1], w: {def:.9,pase:.9,regate:.8,velo:.8,tiro:.8,cabe:.7,fisi:1.1,visi:.9} },
    PRESS: { name: "Pressão alta", desc: "Rouba lá em cima e acelera. A conta vem em energia e lesões.", tags: ["energia","físico"], zone: [1.2,1.1,1], w: {def:1.1,pase:.6,regate:.6,velo:1.2,tiro:.5,cabe:.5,fisi:1.5,visi:.6} }
  },
  styleKeys: ["EQUI","POSSE","DIRETO","BANDAS","CONTRA","TIKI","DRIBLE","REMATE","CATENACCIO","TOTAL","PRESS"],

  /* ---------- 7 formações (zonas do onze) ---------- */
  // slots: POR, DEF xN, LAT xN, PIV/MC, MC, MP/EXT, ATA — com peso por zona
  formations: {
    "4-4-2":   { slots: ["POR","DEF","DEF","LAT","LAT","PIV","MC","EXT","EXT","ATA","ATA"], meta: "Equilíbrio clássico", desc: "Duas linhas compactas e dois atacantes. Fácil de montar." },
    "4-3-3":   { slots: ["POR","DEF","DEF","LAT","LAT","PIV","MC","MC","EXT","ATA","EXT"], meta: "Amplitude e ataque", desc: "Abre o campo com extremos. Pede laterais atentos." },
    "4-2-3-1": { slots: ["POR","DEF","DEF","LAT","LAT","PIV","PIV","EXT","MP","EXT","ATA"], meta: "Controlo entre linhas", desc: "Duplo pivô protege, três meias conectam." },
    "4-1-4-1": { slots: ["POR","DEF","DEF","LAT","LAT","PIV","MC","MC","EXT","EXT","ATA"], meta: "Meio forte", desc: "Reforça o centro e reduz riscos." },
    "3-5-2":   { slots: ["POR","DEF","DEF","DEF","LAT","PIV","MC","MC","MP","ATA","ATA"], meta: "Superioridade central", desc: "Muita presença no meio e dois atacantes." },
    "3-4-3":   { slots: ["POR","DEF","DEF","DEF","MC","MC","LAT","LAT","EXT","ATA","EXT"], meta: "Risco alto", desc: "Três atrás e três na frente. Exigente." },
    "5-3-2":   { slots: ["POR","DEF","DEF","DEF","LAT","LAT","PIV","MC","MC","ATA","ATA"], meta: "Defesa e transição", desc: "Bloco seguro com saída pelos corredores." }
  },

  /* ---------- Mentalidades ---------- */
  mentalities: {
    DEF: { name: "Defensiva", zone: [1.25, .9, .75], desc: "Bloco baixo: reforça a defesa, cede o meio e poupa energia." },
    EQU: { name: "Equilibrada", zone: [1,1,1], desc: "Sem penalizações nem bônus." },
    OFE: { name: "Ofensiva", zone: [.85, 1.05, 1.25], desc: "Sobe a linha e arrisca mais." }
  },

  /* ---------- Pressão ---------- */
  presses: {
    ALTA: { name: "Alta", energy: 1.6, def: .9, atk: 1.15, cards: 1.5, desc: "Rouba lá em cima; gasta muita energia e traz cartões." },
    MED:  { name: "Média", energy: 1.1, def: 1, atk: 1, cards: 1.1, desc: "Padrão, sem bônus nem penalizações." },
    BAIXA: { name: "Baixa", energy: .8, def: 1.12, atk: .9, cards: .9, desc: "Bloqueio baixo: economiza energia, cede espaço." }
  },

  /* ---------- Instalações ---------- */
  facilities: {
    training:  { name: "Campo de treino", icon: "🏋️", desc: "Acelera o desenvolvimento dos jovens.", levels: [0, 1200000, 4000000, 9000000], dev: [.2, .35, .5, .7] },
    clinic:    { name: "Clínica médica", icon: "🏥", desc: "Reduz a duração e frequência de lesões.", levels: [0, 1000000, 3200000, 7500000], rec: [8, 11, 14, 18] },
    cantera:   { name: "Cantera", icon: "🌱", desc: "Mais e melhores jovens a 15 de julho.", levels: [0, 800000, 2600000, 6000000], youth: [1, 1.5, 2, 2.5] },
    stadium:   { name: "Estádio", icon: "🏟️", desc: "Capacidade e bilheteria.", levels: [0, 0, 0, 0], seats: [10000, 15000, 25000, 45000] },
    shop:      { name: "Loja", icon: "🏪", desc: "Merchandising mensal.", levels: [0, 400000, 1200000, 2800000], mch: [.05, .1, .18, .3] }
  },
  facilityKeys: ["training","clinic","cantera","stadium","shop"],
  upgradeDays: 14,
  upgradeCost: { training: 1200000, clinic: 1000000, cantera: 800000, stadium: 2000000, shop: 400000 },

  /* ---------- Staff ---------- */
  staff: {
    coach:    { name: "Treinador", icon: "🧠", desc: "Melhora o desenvolvimento juvenil.", lvl: [1,2,3], dev: [0, .1, .2, .3] },
    doctor:   { name: "Médico", icon: "🩺", desc: "Reduz lesões.", lvl: [1,2,3], inj: [1, .8, .65, .5] },
    scout:    { name: "Ojeador", icon: "🔭", desc: "Melhora o mercado e o relatório de potencial.", lvl: [1,2,3], quality: [.9, 1, 1.15, 1.3] },
    youthDir: { name: "Diretor de cantera", icon: "🎓", desc: "Aumenta potencial dos jovens.", lvl: [1,2,3], pot: [0, 2, 4, 6] }
  },
  staffKeys: ["coach","doctor","scout","youthDir"],
  staffSalary: [50000, 120000, 280000, 600000],

  /* ---------- Promessas à diretiva ---------- */
  promises: {
    POS4:  { name: "Ficar nos 4 primeiros", tier: "prudent", adv: 800000,  bonus: 1200000, check: "pos", n: 4 },
    POS6:  { name: "Ficar nos 6 primeiros", tier: "prudent", adv: 500000,  bonus: 800000,  check: "pos", n: 6 },
    TIT:   { name: "Ser campeão",          tier: "ambitious", adv: 2500000, bonus: 4000000, check: "pos", n: 1 },
    JUV:   { name: "Juventude: 3 jogadores ≤21 no plantel", tier: "mid", adv: 1500000, bonus: 2000000, check: "youth", n: 3 },
    GOL:   { name: "Artilharia: jogador no top 3 da liga", tier: "mid", adv: 1500000, bonus: 2200000, check: "goals", n: 3 }
  },
  promiseKeys: ["POS4","POS6","TIT","JUV","GOL"],

  /* ---------- Desafios (10) — regras aproximadas do jogo original ---------- */
  challenges: {
    NONE: { name: "Carreira normal", desc: "Sem regras especiais.", startCash: 20000000, flag: null },
    HAMBRE: { name: "Cinturão de Fome", desc: "Economia de sobrevivência: patrocinadores pagam metade, bilheteria e loja rendem menos, caixa mínimo.", startCash: 2000000, flag: "hambre" },
    CANTERA: { name: "A Cantera Manda", desc: "Mercado fechado: nada de compras, agentes livres ou empréstimos. A academia produz mais jovens.", startCash: 15000000, flag: "cantera" },
    SANGRE: { name: "Sangria de Talento", desc: "Nenhum jogador com média maior que a do seu melhor onze aceita assinar. Só fichar igual ou pior.", startCash: 20000000, flag: "sangre" },
    FRAGIL: { name: "Frágiles", desc: "Lesões chegam 2x mais e duram mais. Nem clínica nem médico seguram.", startCash: 20000000, flag: "fragil" },
    BIBERON: { name: "A Quinta do Biberão", desc: "Apostar na juventude: 3 jogadores com 21 anos ou menos no plantel ao fim da época.", startCash: 20000000, flag: "biberon" },
    ASILO: { name: "O Asilo", desc: "Plantel de veteranos: jogadores gerados com idade avançada e físico limitado.", startCash: 25000000, flag: "asilo" },
    IDOLO: { name: "Maldição do Ídolo", desc: "O seu melhor jogador está sempre insatisfeito: moral permanentemente baixa.", startCash: 20000000, flag: "idolo" },
    JUNTA: { name: "A Junta Implacável", desc: "A confiança da diretiva cai 2x mais rápido com derrotas e promessas falhadas.", startCash: 22000000, flag: "junta" },
    GUERRA: { name: "Plantel de Guerra", desc: "Energia gasta 2x, cartões e lesões aumentam. Rotação constante.", startCash: 25000000, flag: "guerra" },
    APEST: { name: "O Apestado", desc: "Todo o plantel começa descontente e pede transferência com frequência.", startCash: 20000000, flag: "apest" }
  },
  challengeKeys: ["NONE","HAMBRE","CANTERA","SANGRE","FRAGIL","BIBERON","ASILO","IDOLO","JUNTA","GUERRA","APEST"],

  /* ---------- Economia ---------- */
  econ: {
    ticketBase: 12, ticketMin: 3, ticketMax: 40,
    attendanceBase: 8500, // lotação base (capacidade x aficción)
    tvByDiv: [18000000, 8000000, 3500000, 1500000],
    sponsorShirt: [600000, 1200000, 2200000, 4000000], // por mês
    sponsorStadium: [300000, 700000, 1400000, 2500000],
    boardMonthsNegative: 4,
    debtLimit: 8000000,
    bankruptMonthLimit: 4,
    moraleMin: 5, moraleMax: 100,
    energyDrainStarters: 16, energyDrainBench: 5,
    energyRecoverDay: 9,
    friendlyGain: 900000,
    promoteContractWage: 30000,
    sellFee: .9
  },

  /* ---------- Comentários de partida ---------- */
  cmt: {
    goal: [
      "!GOOOL! {p} marca para o {c}!",
      "!Golaço de {p} de fora da área!",
      "!GOOOL! {p} aparece no segundo poste e não perdoa!",
      "!Gol de cabeça de {p} após cruzamento!",
      "!GOOOL! {p} finaliza de primeira, defesa batida!",
      "!Golaço de falta direta de {p}!"
    ],
    save: [
      "Grande defesa do goleiro em chute de {p}!",
      "{p} arrisca de longe e o goleiro espalma!",
      "Defesa em dois tempos: {p} cabeceia e o goleiro agarra!",
      "{p} aparece livre, mas o goleiro fecha o ângulo!"
    ],
    chance: [
      "Cruzamento de {p} procurando o remate na área...",
      "Contra-ataque rápido: {p} avança em velocidade!",
      "{p} conduz pela direita e tenta o drible...",
      "Bola longa de {p} nas costas da defesa!",
      "{p} arma o chute de fora da área...",
      "Centro na área e {p} tenta o cabeceio, sai por cima!"
    ],
    miss: [
      "Remate de {p} que sai pela linha de fundo!",
      "{p} finaliza por cima do gol!",
      "Chute fraco de {p}, goleiro segura sem susto!",
      "{p} para na trave! Quase o gol!",
      "Cabeceio de {p} passa raspando a trave!"
    ],
    yellow: ["Cartão amarelo para {p} por entrada dura.", "Entrada forte de {p}: cartão amarelo!"],
    red: ["!Expulsão direta! {p} deixa a equipe com 10!", "Segundo amarelo para {p}: expulsão!"],
    injury: ["{p} sente a coxa e precisa sair...", "Falta dura em {p}: vai de maca!"],
    sub: ["Troca no {c}: sai {a}, entra {b}.", "Técnico mexe: {b} entra no lugar de {a}."]
  },

  /* ---------- Tipos de notícia (ícones) ---------- */
  newsIcons: {
    match: "⚽", goal: "🎯", injury: "🩹", board: "🏢", press: "📰", finance: "💰",
    sponsor: "🤝", market: "🔄", youth: "🌱", tour: "✈️", cup: "🏆", derby: "🔥",
    staff: "🧠", warning: "⚠️", success: "✅", fired: "🚪", trophy: "🏆", europa: "🌍"
  }
};