// ===== 100 QUESTIONS DATA (Beginner 2: Units 7A, 7B, 8A, 8B, 9A, 9B) =====

const BEGINNER2_MCQ = [
  // Unit 7A: this, that, these, those | Common objects 2 | Prices
  {num:1,unit:'7A',topic:'this/that/these/those',q:'Complete: "I like _______ plant." (pointing to a plant near you)',a:'this',b:'that',c:'these',d:'those',ans:'A'},
  {num:2,unit:'7A',topic:'this/that/these/those',q:'Complete: "Oh, look at _______ chairs over there. They\'re really nice."',a:'this',b:'that',c:'these',d:'those',ans:'D'},
  {num:3,unit:'7A',topic:'this/that/these/those',q:'Which word is used for a singular object far from the speaker?',a:'this',b:'that',c:'these',d:'those',ans:'B'},
  {num:4,unit:'7A',topic:'this/that/these/those',q:'Which word is used for plural objects near the speaker?',a:'this',b:'that',c:'these',d:'those',ans:'C'},
  {num:5,unit:'7A',topic:'this/that/these/those',q:'"_______ plates are beautiful!" (pointing to plates far away)',a:'This',b:'That',c:'These',d:'Those',ans:'D'},
  {num:6,unit:'7A',topic:'this/that/these/those',q:'"Look at _______ speaker! That\'s so cool." (pointing to a speaker far away)',a:'this',b:'that',c:'these',d:'those',ans:'B'},
  {num:7,unit:'7A',topic:'Common objects',q:'Which of these is NOT sold at The Sunday Flea Market?',a:'clocks',b:'guitars',c:'new phones',d:'suitcases',ans:'C'},
  {num:8,unit:'7A',topic:'Common objects',q:'What does a "flea market" mainly sell?',a:'new electronics',b:'old and second-hand things',c:'only food',d:'only clothes',ans:'B'},
  {num:9,unit:'7A',topic:'Prices',q:'How do you correctly say "£3.80" in English?',a:'three pound eighty',b:'three pounds and eighty',c:'three pounds eighty',d:'three and eighty pounds',ans:'C'},
  {num:10,unit:'7A',topic:'Prices',q:'How do you say "€25" correctly?',a:'twenty-five of euros',b:'twenty-five euro',c:'euros twenty-five',d:'twenty-five euros',ans:'D'},
  {num:11,unit:'7A',topic:'Shopping',q:'What does Mega Home Store sell?',a:'old books and magazines',b:'beds, pillows, tables, chairs and lamps',c:'only food',d:'guitars and clocks',ans:'B'},
  {num:12,unit:'7A',topic:'Shopping',q:'What time does Books & Co. open?',a:'8 am',b:'6 am',c:'9 am',d:'10 am',ans:'C'},
  {num:13,unit:'7A',topic:'this/that/these/those',q:'"_______ lamp is nice – it\'s a great colour!" (holding a lamp near you)',a:'This',b:'That',c:'These',d:'Those',ans:'A'},
  {num:14,unit:'7A',topic:'Sounds/Spelling',q:'Which word has the /b/ sound?',a:'plate',b:'guitar',c:'bag',d:'cup',ans:'C'},

  // Unit 7B: Possessive \'s | Revision of adverbs | Clothes | Colours
  {num:15,unit:'7B',topic:"Possessive 's",q:'"Is this Greg\'s T-shirt?" means:',a:'The T-shirt belongs to Greg',b:'Greg is a T-shirt',c:'Greg bought a T-shirt for someone',d:'The T-shirt is new',ans:'A'},
  {num:16,unit:'7B',topic:"Possessive 's",q:'"They\'re Kate\'s jeans." What does "Kate\'s" mean?',a:'Kate is jeans',b:'The jeans belong to Kate',c:'Kate likes jeans',d:'Kate sells jeans',ans:'B'},
  {num:17,unit:'7B',topic:'Adverbs of frequency',q:'Which adverb means "100% of the time"?',a:'sometimes',b:'often',c:'usually',d:'always',ans:'D'},
  {num:18,unit:'7B',topic:'Adverbs of frequency',q:'"She wears a skirt (never)." The correct sentence is:',a:'She never wears a skirt.',b:'She wears never a skirt.',c:'Never she wears a skirt.',d:'She wears a skirt never.',ans:'A'},
  {num:19,unit:'7B',topic:'Adverbs of frequency',q:'"Fran wears a dress (often)." The correct sentence is:',a:'Often Fran wears a dress.',b:'Fran wears often a dress.',c:'Fran often wears a dress.',d:'Fran wears a dress often.',ans:'C'},
  {num:20,unit:'7B',topic:'Clothes',q:'Which item of clothing is NOT mentioned in Unit 7B?',a:'jacket',b:'trousers',c:'hat',d:'blouse',ans:'C'},
  {num:21,unit:'7B',topic:'Clothes',q:'Tom Ford often wears a _______ shirt.',a:'black',b:'blue',c:'white',d:'red',ans:'C'},
  {num:22,unit:'7B',topic:'Clothes',q:'Carolina Herrera usually wears a black _______ and a white blouse.',a:'dress',b:'coat',c:'T-shirt',d:'skirt',ans:'D'},
  {num:23,unit:'7B',topic:'Colours',q:'What does "dark blue" mean?',a:'a light shade of blue',b:'a strong deep shade of blue',c:'no blue at all',d:'a mix of blue and red',ans:'B'},
  {num:24,unit:'7B',topic:'Colours',q:'Michael Kors often wears:',a:'a white shirt and grey trousers',b:'a black T-shirt, black trousers and a black jacket',c:'colourful clothes',d:'a blue suit',ans:'B'},
  {num:25,unit:'7B',topic:"Possessive 's",q:'"Who\'s Giuseppe?" "He\'s Kate\'s _______."',a:'friend',b:'husband',c:'brother',d:'father',ans:'B'},
  {num:26,unit:'7B',topic:'Sounds/Spelling',q:'Which word has the /ʃ/ sound (like "shirt")?',a:'jacket',b:'German',c:'fashion',d:'language',ans:'C'},
  {num:27,unit:'7B',topic:'Sounds/Spelling',q:'Which word has the /dʒ/ sound (like "jacket")?',a:'sugar',b:'shirt',c:'fashion',d:'large',ans:'D'},

  // Unit 8A: Past simple: be | Past time expressions
  {num:28,unit:'8A',topic:'Past simple: be',q:'Complete: "I _______ in New York three days ago."',a:'am',b:'was',c:'were',d:'be',ans:'B'},
  {num:29,unit:'8A',topic:'Past simple: be',q:'Complete: "We _______ in Munich on Wednesday."',a:'was',b:'am',c:'were',d:'is',ans:'C'},
  {num:30,unit:'8A',topic:'Past simple: be',q:'"_______ you at work yesterday?" Complete with the correct form.',a:'Was',b:'Were',c:'Are',d:'Is',ans:'B'},
  {num:31,unit:'8A',topic:'Past simple: be negative',q:'"It _______ a holiday for me." (negative)',a:"wasn't",b:"weren't",c:"isn't",d:"didn't",ans:'A'},
  {num:32,unit:'8A',topic:'Past simple: be negative',q:'"We _______ at the party last night." (negative)',a:"wasn't",b:"weren't",c:"didn't",d:"aren't",ans:'B'},
  {num:33,unit:'8A',topic:'Past simple: be',q:'Which sentence is correct?',a:'She were in Dublin.',b:'They was at home.',c:'He was at a meeting.',d:'I were in London.',ans:'C'},
  {num:34,unit:'8A',topic:'Past time expressions',q:'Which expression means "the day before today"?',a:'last week',b:'two days ago',c:'yesterday',d:'this morning',ans:'C'},
  {num:35,unit:'8A',topic:'Past time expressions',q:'"Two weeks _______" – complete the expression.',a:'before',b:'ago',c:'past',d:'last',ans:'B'},
  {num:36,unit:'8A',topic:'Past time expressions',q:'Which is NOT a past time expression?',a:'yesterday',b:'last week',c:'tomorrow',d:'two years ago',ans:'C'},
  {num:37,unit:'8A',topic:'Events',q:"What is Cara's job?",a:'doctor',b:'musician',c:'photographer',d:'teacher',ans:'C'},
  {num:38,unit:'8A',topic:'Events',q:"What is Antonio Marotto's job?",a:'photographer',b:'team doctor',c:'musician',d:'coach',ans:'B'},
  {num:39,unit:'8A',topic:'Events',q:'Ava was on tour with her _______.',a:'football team',b:'band',c:'photography group',d:'family',ans:'B'},
  {num:40,unit:'8A',topic:'Past simple: be',q:'"About 1,000 people _______ at our concert."',a:'was',b:'is',c:'were',d:'are',ans:'C'},
  {num:41,unit:'8A',topic:'Adjectives',q:'Match: "The meeting was _______." Which adjective is used in the text?',a:'boring',b:'interesting',c:'exciting',d:'fun',ans:'B'},

  // Unit 8B: Past simple: positive | Free time activities | Animals
  {num:42,unit:'8B',topic:'Past simple: positive',q:'"He _______ a bear in the garden." Choose the correct past simple form.',a:'see',b:'sees',c:'saw',d:'seen',ans:'C'},
  {num:43,unit:'8B',topic:'Past simple: positive',q:'"She _______ into her living room and _______ TV."',a:'go / watch',b:'went / watched',c:'goes / watches',d:'going / watching',ans:'B'},
  {num:44,unit:'8B',topic:'Past simple: positive',q:'"The bear _______ around the garden."',a:'walk',b:'walks',c:'walked',d:'walking',ans:'C'},
  {num:45,unit:'8B',topic:'Past simple: positive',q:'"They _______ to catch the deer."',a:'come',b:'comes',c:'came',d:'coming',ans:'C'},
  {num:46,unit:'8B',topic:'Past simple: positive',q:'"The woman _______ the police."',a:'call',b:'calls',c:'called',d:'calling',ans:'C'},
  {num:47,unit:'8B',topic:'Animals',q:'Where is Andrew Singer from?',a:'South Africa',b:'Indiana',c:'Utah',d:'England',ans:'C'},
  {num:48,unit:'8B',topic:'Animals',q:'What animal did Ben Kruger see on the rugby field?',a:'a bear',b:'a deer',c:'a hippo',d:'a snake',ans:'C'},
  {num:49,unit:'8B',topic:'Animals',q:"How many deer were in the woman's flat?",a:'one',b:'two',c:'three',d:'four',ans:'C'},
  {num:50,unit:'8B',topic:'Past simple: positive',q:'"The hippos _______ some grass and then _______ away."',a:'eat / go',b:'ate / went',c:'eats / goes',d:'eating / going',ans:'B'},
  {num:51,unit:'8B',topic:'Past simple: positive',q:'"He _______ something strange in the garden."',a:'hear',b:'hears',c:'heard',d:'hearing',ans:'C'},
  {num:52,unit:'8B',topic:'Reading comprehension',q:'Why did Andrew think the bear came to his garden?',a:'It was lost.',b:'It was hungry.',c:'It was cold.',d:'It wanted to play.',ans:'B'},

  // Unit 9A: Past simple: negative | Transport | Travel
  {num:53,unit:'9A',topic:'Past simple: negative',q:'"We _______ go to big cities." Complete with the negative past simple.',a:"don't",b:"doesn't",c:"didn't",d:"wasn't",ans:'C'},
  {num:54,unit:'9A',topic:'Past simple: negative',q:'"We _______ stay in a hotel." (negative)',a:"don't",b:"didn't",c:"doesn't",d:"weren't",ans:'B'},
  {num:55,unit:'9A',topic:'Past simple: negative',q:'The past simple negative is formed with: subject + _______ + base verb.',a:"don't",b:"doesn't",c:"didn't",d:"wasn't",ans:'C'},
  {num:56,unit:'9A',topic:'Past simple: negative',q:'"We _______ have a car." (negative past)',a:"don't",b:"didn't",c:"doesn't",d:"haven't",ans:'B'},
  {num:57,unit:'9A',topic:'Past simple: negative',q:'Which sentence is correct?',a:"I didn't stayed in a hotel.",b:"I didn't stay in a hotel.",c:"I didn't stays in a hotel.",d:'I not stay in a hotel.',ans:'B'},
  {num:58,unit:'9A',topic:'Transport',q:'Which is NOT a form of transport mentioned in Unit 9A?',a:'bus',b:'train',c:'helicopter',d:'tram',ans:'C'},
  {num:59,unit:'9A',topic:'Transport',q:"How much does it cost to stay at Steve's Place in Melbourne?",a:'$4 a night',b:'$15 a night',c:'$30 a night',d:'$50 a night',ans:'B'},
  {num:60,unit:'9A',topic:'Transport',q:"Youssef's Place is in which city?",a:'Melbourne',b:'Cumaral',c:'Marrakesh',d:'New York',ans:'C'},
  {num:61,unit:'9A',topic:'Travel',q:'What does "Garden Camping" offer?',a:'luxury hotels',b:"camping in people's gardens",c:'bus tours',d:'train journeys',ans:'B'},
  {num:62,unit:'9A',topic:'Sounds/Spelling',q:'The letter "a" in "taxi" has which sound?',a:'/ɑː/',b:'/eɪ/',c:'/a/',d:'/ɒ/',ans:'C'},

  // Unit 9B: Past simple: questions | The seasons | The weather
  {num:63,unit:'9B',topic:'Past simple: questions',q:'"_______ you at work yesterday?"',a:'Did',b:'Do',c:'Were',d:'Are',ans:'C'},
  {num:64,unit:'9B',topic:'Past simple: questions',q:'"How _______ you get there?"',a:'do',b:'did',c:'was',d:'were',ans:'B'},
  {num:65,unit:'9B',topic:'Past simple: questions',q:'"_______ you enjoy it there?" "Yes, I did."',a:'Do',b:'Are',c:'Did',d:'Were',ans:'C'},
  {num:66,unit:'9B',topic:'Past simple: questions',q:'Which question is grammatically correct?',a:'Where did you went?',b:'Where did you go?',c:'Where you did go?',d:'Where do you went?',ans:'B'},
  {num:67,unit:'9B',topic:'Seasons',q:'Which season comes after summer?',a:'spring',b:'winter',c:'autumn',d:'summer',ans:'C'},
  {num:68,unit:'9B',topic:'Weather',q:'The weather in New York in December was:',a:'hot and sunny',b:'cold and windy',c:'warm and dry',d:'cool and rainy',ans:'B'},
  {num:69,unit:'9B',topic:'Weather',q:'"It was very cold and _______. Everyone stayed inside."',a:'sunny',b:'hot',c:'snowy',d:'windy',ans:'C'},
  {num:70,unit:'9B',topic:'Weather',q:'The Ortega family went to New York from:',a:'Madrid',b:'London',c:'Tenerife',d:'Barcelona',ans:'C'}
];

const BEGINNER2_ARTICLE = [
  // Unit 7A
  {num:1,unit:'7A',q:'"There\'s also _______ good cafe with drinks."',a:'a',b:'an',c:'the',ans:'A'},
  {num:2,unit:'7A',q:'"They sell _______ lot of old things."',a:'a',b:'an',c:'the',ans:'A'},
  {num:3,unit:'7A',q:'"This is _______ place for you."',a:'a',b:'an',c:'the',ans:'C'},
  {num:4,unit:'7A',q:'"_______ great place to buy things for your home."',a:'A',b:'An',c:'The',ans:'A'},
  {num:5,unit:'7A',q:'"_______ interesting bookshop."',a:'A',b:'An',c:'The',ans:'B'},

  // Unit 7B
  {num:6,unit:'7B',q:'"He often wears _______ white shirt."',a:'a',b:'an',c:'the',ans:'A'},
  {num:7,unit:'7B',q:'"She usually wears _______ black skirt."',a:'a',b:'an',c:'the',ans:'A'},
  {num:8,unit:'7B',q:'"Tom Ford makes beautiful clothes for _______ men and for _______ women."',a:'- / -',b:'the / the',c:'a / a',ans:'A'},
  {num:9,unit:'7B',q:'"He wears _______ black T-shirt."',a:'a',b:'an',c:'the',ans:'A'},
  {num:10,unit:'7B',q:'"Look at _______ picture of Tom Ford."',a:'a',b:'an',c:'the',ans:'C'},

  // Unit 8A
  {num:11,unit:'8A',q:'"I was at _______ meeting about newspaper photography."',a:'a',b:'an',c:'the',ans:'A'},
  {num:12,unit:'8A',q:'"I\'m _______ photographer."',a:'a',b:'an',c:'the',ans:'A'},
  {num:13,unit:'8A',q:'"I\'m _______ doctor for our team."',a:'a',b:'an',c:'the',ans:'C'},
  {num:14,unit:'8A',q:'"It was _______ exciting night."',a:'a',b:'an',c:'the',ans:'B'},
  {num:15,unit:'8A',q:'"Saturday was _______ best night."',a:'a',b:'an',c:'the',ans:'C'},

  // Unit 8B
  {num:16,unit:'8B',q:'"He saw _______ bear in the garden."',a:'a',b:'an',c:'the',ans:'A'},
  {num:17,unit:'8B',q:'"_______ bear walked around _______ garden."',a:'A / a',b:'The / the',c:'A / the',ans:'B'},
  {num:18,unit:'8B',q:'"She had _______ ground floor flat with _______ garden."',a:'a / a',b:'the / the',c:'an / a',ans:'A'},
  {num:19,unit:'8B',q:'"It was _______ hippopotamus."',a:'a',b:'an',c:'the',ans:'A'},
  {num:20,unit:'8B',q:'"_______ woman called _______ police."',a:'A / a',b:'The / the',c:'A / the',ans:'B'},

  // Unit 9A
  {num:21,unit:'9A',q:'"We stayed with _______ family."',a:'a',b:'an',c:'the',ans:'A'},
  {num:22,unit:'9A',q:'"We camped in _______ garden."',a:'a',b:'an',c:'the',ans:'A'},
  {num:23,unit:'9A',q:'"Modern house with _______ big garden on _______ lake."',a:'a / a',b:'the / the',c:'a / the',ans:'A'},
  {num:24,unit:'9A',q:'"Get _______ bus to Jolimont Station."',a:'a',b:'an',c:'the',ans:'A'},
  {num:25,unit:'9A',q:'"Take _______ taxi or drive _______ car."',a:'a / a',b:'the / a',c:'a / the',ans:'A'},

  // Unit 9B
  {num:26,unit:'9B',q:'"We went to _______ big New Year\'s Eve party."',a:'a',b:'an',c:'the',ans:'A'},
  {num:27,unit:'9B',q:'"It has _______ lot of big shops."',a:'a',b:'an',c:'the',ans:'A'},
  {num:28,unit:'9B',q:'"_______ weather is cold and windy in December."',a:'A',b:'An',c:'The',ans:'C'},
  {num:29,unit:'9B',q:'"Everyone stayed inside and watched _______ film."',a:'a',b:'an',c:'the',ans:'A'},
  {num:30,unit:'9B',q:'"I had _______ great time."',a:'a',b:'an',c:'the',ans:'A'}
];

const LEVELS = [
  { id: 'beginner1', name: 'Beginner 1', desc: 'Basics of English – alphabet, greetings, simple present', icon: '🌱', color: '#27ae60', locked: true },
  { id: 'beginner2', name: 'Beginner 2', desc: 'Grammar & Vocabulary – Units 7-9: demonstratives, clothes, past simple', icon: '📘', color: '#2e75b6', locked: false, questionsCount: 100 },
  { id: 'elementary1', name: 'Elementary 1', desc: 'Expanding grammar – comparatives, modals, present continuous', icon: '📗', color: '#8e44ad', locked: true },
  { id: 'elementary2', name: 'Elementary 2', desc: 'Intermediate grammar – future tenses, conditionals', icon: '📙', color: '#e67e22', locked: true },
  { id: 'preintermediate', name: 'Pre-Intermediate', desc: 'Complex structures – passive voice, reported speech', icon: '📕', color: '#e74c3c', locked: true },
  { id: 'intermediate', name: 'Intermediate', desc: 'Advanced topics – idioms, phrasal verbs, essay writing', icon: '🎓', color: '#2c3e50', locked: true }
];
