(function () {
    "use strict";

    // Supported languages
    const LANGS = {
        en: "English",
        zu: "isiZulu",
        xh: "isiXhosa",
        st: "Sesotho",
        af: "Afrikaans"
    };

    // Core interface translations
    const TEXT = {
        "Skip to main content": ["Yeqela kokuqukethwe okuyinhloko", "Tsiba uye kumxholo ophambili", "Tlola ho dikahare tsa sehlooho", "Slaan oor na hoofinhoud"],
        "Language": ["Ulimi", "Ulwimi", "Puo", "Taal"],
        "Main navigation": ["Ukuzulazula okuyinhloko", "Ulawulo oluphambili", "Tsamaiso e kgolo", "Hoofnavigasie"],
        "Marks": ["Amamaki", "Amanqaku", "Matshwao", "Punte"],
        "Results": ["Imiphumela", "Iziphumo", "Diphetho", "Uitslae"],
        "Funding": ["Uxhaso lwezimali", "Inkxaso-mali", "Tshehetso ya ditjhelete", "Befondsing"],
        "Reminders": ["Izikhumbuzi", "Izikhumbuzo", "Dikgopotso", "Herinneringe"],
        "Budget": ["Isabelomali", "Uhlahlo-lwabiwo mali", "Tekanyetso ya ditjhelete", "Begroting"],
        "Study Plan": ["Uhlelo lokufunda", "Isicwangciso sokufunda", "Moralo wa ho ithuta", "Studieplan"],
        "Checklist": ["Uhlu lokuhlola", "Uluhlu lokukhangela", "Lenane la tlhahlobo", "Kontrolelys"],
        "Sign up": ["Bhalisa", "Bhalisa", "Ingolise", "Registreer"],
        "Log in": ["Ngena", "Ngena", "Kena", "Meld aan"],
        "Ukhanyiso account": ["I-akhawunti ye-Ukhanyiso", "Iakhawunti ye-Ukhanyiso", "Akhaonto ya Ukhanyiso", "Ukhanyiso-rekening"],
        "Create your Ukhanyiso account": ["Dala i-akhawunti yakho ye-Ukhanyiso", "Yenza iakhawunti yakho ye-Ukhanyiso", "Theha akhaonto ya hao ya Ukhanyiso", "Skep jou Ukhanyiso-rekening"],
        "Username": ["Igama lomsebenzisi", "Igama lomsebenzisi", "Lebitso la mosebedisi", "Gebruikersnaam"],
        "Password": ["Iphasiwedi", "Igama lokugqitha", "Phasewete", "Wagwoord"],
        "Confirm password": ["Qinisekisa iphasiwedi", "Qinisekisa igama lokugqitha", "Netefatsa phasewete", "Bevestig wagwoord"],
        "Fictional account": ["I-akhawunti eqanjiwe", "Iakhawunti eyintsomi", "Akhaonto ya boiqapelo", "Fiktiewe rekening"],
        "Create a fictional account": ["Dala i-akhawunti eqanjiwe", "Yenza iakhawunti eyintsomi", "Theha akhaonto ya boiqapelo", "Skep 'n fiktiewe rekening"],
        "Fictional username": ["Igama lomsebenzisi eliqanjiwe", "Igama lomsebenzisi eliyintsomi", "Lebitso la mosebedisi la boiqapelo", "Fiktiewe gebruikersnaam"],
        "Made-up password": ["Iphasiwedi eqanjiwe", "Igama lokugqitha eliyintsomi", "Phasewete ya boiqapelo", "Fiktiewe wagwoord"],
        "Confirm made-up password": ["Qinisekisa iphasiwedi eqanjiwe", "Qinisekisa igama lokugqitha eliyintsomi", "Netefatsa phasewete ya boiqapelo", "Bevestig fiktiewe wagwoord"],
        "Privacy notice (POPIA)": ["Isaziso sobumfihlo (POPIA)", "Isaziso sabucala (POPIA)", "Tsebiso ya sephiri (POPIA)", "Privaatheidskennisgewing (POPIA)"],
        "Marks are sent to the server to calculate course matches, but are not saved. Use fictional data only—never enter real identity, contact, financial details, or personal documents.": ["Amamaki athunyelwa kuseva ukuze kubalwe izifundo ezihambisanayo, kodwa awagcinwa. Sebenzisa imininingwane eqanjiwe kuphela—ungafaki imininingwane kamazisi, yokuxhumana, yezezimali, noma imibhalo yangempela.", "Amanqaku athunyelwa kwiseva ukuze kubalwe izifundo ezihambelanayo, kodwa awagcinwa. Sebenzisa iinkcukacha eziyintsomi kuphela—ungafaki iinkcukacha zesazisi, zoqhagamshelwano, zezemali okanye amaxwebhu okwenyani.", "Matshwao a romelwa seva ho bala dithuto tse tshwanang, empa ha a bolokwe. Sebedisa dintlha tsa boiqapelo feela—o se ke wa kenya dintlha tsa nnete tsa boitsebiso, tsa puisano, tsa ditjhelete kapa ditokomane.", "Punte word na die bediener gestuur om kursuspassings te bereken, maar word nie gestoor nie. Gebruik slegs fiktiewe data—moet nooit regte identiteits-, kontak- of finansiële besonderhede of dokumente invoer nie."],
        "Ukhanyiso is a prototype, not an official university, TVET, NSFAS, or bursary application service. Confirm requirements with the relevant institution.": ["I-Ukhanyiso iyisibonelo sohlelo, akuyona isevisi esemthethweni yasenyuvesi, ye-TVET, ye-NSFAS, noma yezicelo zemifundaze. Qinisekisa izidingo esikhungweni esifanele.", "I-Ukhanyiso yiprototype, ayiyonkonzo esemthethweni yeyunivesithi, ye-TVET, ye-NSFAS okanye yezicelo zeebhasari. Qinisekisa iimfuno kwiziko elifanelekileyo.", "Ukhanyiso ke mohlala wa tshebediso, ha se tshebeletso ya semmuso ya yunivesithi, TVET, NSFAS kapa dikopo tsa dibasari. Netefatsa ditlhoko setheong se amehang.", "Ukhanyiso is 'n prototipe, nie 'n amptelike universiteit-, TVET-, NSFAS- of beursaansoekdiens nie. Bevestig vereistes by die betrokke instelling."],
        "Before public release, the project must publish its contact details, purposes for using information, retention periods, and how people can exercise their privacy rights.": ["Ngaphambi kokukhishwa emphakathini, iphrojekthi kufanele ishicilele imininingwane yokuxhumana, izizathu zokusebenzisa ulwazi, isikhathi sokulugcina, nokuthi abantu bangawasebenzisa kanjani amalungelo abo obumfihlo.", "Ngaphambi kokukhutshwa esidlangalaleni, iprojekthi kufuneka ipapashe iinkcukacha zoqhagamshelwano, izizathu zokusebenzisa ulwazi, ixesha lokulugcina, nendlela abantu abanokusebenzisa ngayo amalungelo abo abucala.", "Pele projeke e lokollwa phatlalatsa, e lokela ho phatlalatsa dintlha tsa puisano, mabaka a ho sebedisa tlhahisoleseding, nako ya ho e boloka, le kamoo batho ba ka sebedisang ditokelo tsa bona tsa sephiri.", "Voor openbare vrystelling moet die projek sy kontakbesonderhede, doeleindes vir die gebruik van inligting, bewaringstydperke en hoe mense hul privaatheidsregte kan uitoefen, publiseer."],
        "Marks stay in this browser tab and are sent only to calculate course matches.": ["Amamaki ahlala kule thebhu yesiphequluli futhi athunyelwa kuphela ukubala izifundo ezihambisanayo.", "Amanqaku ahlala kule thebhu yesikhangeli kwaye athunyelwa kuphela ukubala izifundo ezihambelanayo.", "Matshwao a sala tabeng ena ya sebadi mme a romelwa feela ho bala dithuto tse tshwanang.", "Punte bly in hierdie blaaieroortjie en word slegs gestuur om kursuspassings te bereken."],
        "Explore": ["Hlola", "Phonononga", "Fuputsa", "Verken"],
        "From APS to graduation": ["Kusukela ku-APS kuye ekuthwesweni iziqu", "Ukusuka kwi-APS ukuya kuthweso-zidanga", "Ho tloha ho APS ho isa kabo ya mangolo", "Van APS tot graduering"],
        "Check courses that fit your marks": ["Bheka izifundo ezihambisana namamaki akho", "Jonga izifundo ezihambelana namanqaku akho", "Sheba dithuto tse tsamaellanang le matshwao a hao", "Kyk watter kursusse by jou punte pas"],
        "Enter your matric subject marks to see courses that meet their published minimum requirements.": ["Faka amamaki ezifundo zakho zikamatikuletsheni ukuze ubone izifundo ezihlangabezana nezidingo zazo ezishicilelwe.", "Faka amanqaku ezifundo zakho zematriki ukuze ubone izifundo ezihlangabezana neemfuno ezipapashiweyo.", "Kenya matshwao a dithuto tsa hao tsa matriki ho bona dithuto tse fihlellang ditlhoko tse phatlaladitsweng.", "Voer jou matriekvakpunte in om kursusse te sien wat aan hul gepubliseerde minimumvereistes voldoen."],
        "Where are you now?": ["Ukuliphi ibanga manje?", "Ukweliphi inqanaba ngoku?", "O boemong bofe hona jwale?", "Waar is jy nou?"],
        "I'm in Grade 11 (I'll use my latest school report marks)": ["NgiseBangeni le-11 (ngizosebenzisa amamaki akamuva asembikweni wesikole)", "NdikwiBanga le-11 (ndiza kusebenzisa amanqaku am akutshanje esikolo)", "Ke Kereiting ya 11 (ke tla sebedisa matshwao a morao a tlaleho ya sekolo)", "Ek is in Graad 11 (ek gebruik my jongste skoolrapportpunte)"],
        "I'm in Grade 12 and have June exam marks": ["NgiseBangeni le-12 futhi nginamamaki ezivivinyo zikaJuni", "NdikwiBanga le-12 kwaye ndinamanqaku eemviwo zikaJuni", "Ke Kereiting ya 12 mme ke na le matshwao a ditlhahlobo tsa Phupjane", "Ek is in Graad 12 en het Junie-eksamenpunte"],
        "I'm in Grade 12 and have trial/preliminary exam marks": ["NgiseBangeni le-12 futhi nginamamaki ezivivinyo zokuzilolonga", "NdikwiBanga le-12 kwaye ndinamanqaku eemviwo zovavanyo", "Ke Kereiting ya 12 mme ke na le matshwao a ditlhahlobo tsa boitokisetso", "Ek is in Graad 12 en het proef-/voorlopige eksamenpunte"],
        "I've finished matric and have my final results": ["Ngiphothule umatikuletsheni futhi nginemiphumela yokugcina", "Ndiyigqibile imatriki kwaye ndineziphumo zokugqibela", "Ke qetile matriki mme ke na le diphetho tsa makgaolakgang", "Ek het matriek voltooi en het my finale uitslae"],
        "Enter your latest Grade 11 marks to explore courses and funding while you plan ahead.": ["Faka amamaki akho akamuva eBanga le-11 ukuze uhlole izifundo noxhaso lwezimali usahlela ikusasa.", "Faka amanqaku akho akutshanje eBanga le-11 ukuze uphonononge izifundo nenkxaso-mali ngoxa usacwangcisa.", "Kenya matshwao a morao a Kereiti ya 11 ho fuputsa dithuto le tshehetso ha o ntse o rera bokamoso.", "Voer jou jongste Graad 11-punte in om kursusse en befondsing te verken terwyl jy vooruit beplan."],
        "Enter your Grade 12 June exam marks to explore possible courses and funding.": ["Faka amamaki ezivivinyo zikaJuni eBanga le-12 ukuze uhlole izifundo noxhaso lwezimali olungase lube khona.", "Faka amanqaku eemviwo zikaJuni eBanga le-12 ukuze uphonononge izifundo nenkxaso-mali enokwenzeka.", "Kenya matshwao a ditlhahlobo tsa Phupjane tsa Kereiti ya 12 ho fuputsa dithuto le tshehetso e ka kgonehang.", "Voer jou Graad 12 Junie-eksamenpunte in om moontlike kursusse en befondsing te verken."],
        "Enter your Grade 12 trial or preliminary exam marks to explore possible courses and funding.": ["Faka amamaki ezivivinyo zokuzilolonga noma zokuqala eBanga le-12 ukuze uhlole izifundo noxhaso lwezimali olungase lube khona.", "Faka amanqaku eemviwo zovavanyo okanye zokuqala eBanga le-12 ukuze uphonononge izifundo nenkxaso-mali enokwenzeka.", "Kenya matshwao a ditlhahlobo tsa boitokisetso tsa Kereiti ya 12 ho fuputsa dithuto le tshehetso e ka kgonehang.", "Voer jou Graad 12-proef- of voorlopige eksamenpunte in om moontlike kursusse en befondsing te verken."],
        "Enter your final matric (NSC) marks to see courses that meet their published minimum requirements.": ["Faka amamaki akho okugcina kamatikuletsheni (NSC) ukuze ubone izifundo ezihlangabezana nezidingo ezishicilelwe.", "Faka amanqaku akho okugqibela ematriki (NSC) ukuze ubone izifundo ezihlangabezana neemfuno ezipapashiweyo.", "Kenya matshwao a hao a makgaolakgang a matriki (NSC) ho bona dithuto tse fihlellang ditlhoko tse phatlaladitsweng.", "Voer jou finale matriek- (NSC-) punte in om kursusse te sien wat aan hul gepubliseerde minimumvereistes voldoen."],
        "These are early planning estimates. Your Grade 12 subjects and final matric marks may change your options.": ["Lezi yizilinganiso zokuqala zokuhlela. Izifundo zakho zeBanga le-12 namamaki okugcina angashintsha ongakukhetha.", "Olu luqikelelo lokuqala lokucwangcisa. Izifundo zakho zeBanga le-12 namanqaku okugqibela zinokutshintsha iindlela zakho.", "Tsena ke dikakanyo tsa pele tsa moralo. Dithuto tsa hao tsa Kereiti ya 12 le matshwao a makgaolakgang di ka fetola dikgetho tsa hao.", "Dit is vroeë beplanningsberamings. Jou Graad 12-vakke en finale matriekpunte kan jou opsies verander."],
        "June marks are provisional estimates. Update your marks after later exams and again when your final results are released.": ["Amamaki kaJuni ayizilinganiso zesikhashana. Buyekeza amamaki akho ngemva kwezivivinyo ezilandelayo nangesikhathi kuphuma imiphumela yokugcina.", "Amanqaku kaJuni luqikelelo lwethutyana. Hlaziya amanqaku akho emva kweemviwo ezilandelayo naxa kukhutshwa iziphumo zokugqibela.", "Matshwao a Phupjane ke dikakanyo tsa nakwana. Ntlafatsa matshwao ka mora ditlhahlobo tse latelang le ha diphetho tsa makgaolakgang di lokollwa.", "Junie-punte is voorlopige ramings. Werk jou punte ná latere eksamens by en weer wanneer jou finale uitslae bekend gemaak word."],
        "Trial/preliminary marks are provisional estimates. Update your marks when your final matric results are released.": ["Amamaki ezivivinyo zokuzilolonga ayizilinganiso zesikhashana. Buyekeza amamaki akho lapho kuphuma imiphumela yokugcina kamatikuletsheni.", "Amanqaku ovavanyo luqikelelo lwethutyana. Hlaziya amanqaku akho xa kukhutshwa iziphumo zokugqibela zematriki.", "Matshwao a boitokisetso ke dikakanyo tsa nakwana. Ntlafatsa matshwao ha diphetho tsa makgaolakgang tsa matriki di lokollwa.", "Proef-/voorlopige punte is ramings. Werk jou punte by wanneer jou finale matriekuitslae bekend gemaak word."],
        "Type the marks from your results statement. Never enter your exam number or ID number here.": ["Faka amamaki avela esitatimendeni semiphumela yakho. Ungalokothi ufake inombolo yokuhlolwa noma kamazisi.", "Faka amanqaku akwisitatimenti seziphumo zakho. Ungaze ufake inombolo yoviwo okanye yesazisi apha.", "Ngola matshwao a leng setatementeng sa diphetho. O se ke wa kenya nomoro ya tlhahlobo kapa ya ID mona.", "Tik die punte van jou uitslagestaat in. Moet nooit jou eksamennommer of ID-nommer hier invoer nie."],
        "Subject": ["Isifundo", "Isifundo", "Thuto", "Vak"],
        "Choose subject": ["Khetha isifundo", "Khetha isifundo", "Kgetha thuto", "Kies vak"],
        "Mark (%)": ["Imaki (%)", "Inqaku (%)", "Letshwao (%)", "Punt (%)"],
        "Add a subject": ["Engeza isifundo", "Yongeza isifundo", "Eketsa thuto", "Voeg 'n vak by"],
        "See matching courses": ["Bona izifundo ezihambisanayo", "Jonga izifundo ezihambelanayo", "Sheba dithuto tse tshwanang", "Sien kursusse wat pas"],
        "Show my options": ["Bonisa engingakukhetha", "Bonisa iindlela zam", "Bontsha dikgetho tsa ka", "Wys my opsies"],
        "Remove": ["Susa", "Susa", "Tlosa", "Verwyder"],
        "Your course matches": ["Izifundo ezihambisana namamaki akho", "Izifundo ezihambelana namanqaku akho", "Dithuto tse tsamaellanang le matshwao a hao", "Kursusse wat by jou punte pas"],
        "Courses to explore": ["Izifundo ongazihlola", "Izifundo onokuziphonononga", "Dithuto tseo o ka di fuputsang", "Kursusse om te verken"],
        "How to read likelihood labels": ["Indlela yokufunda amalebula wamathuba", "Indlela yokufunda iilebhile zamathuba", "Mokgwa wa ho bala matshwao a monyetla", "Hoe om die waarskynlikheidsetikette te lees"],
        "Likely": ["Kungenzeka kakhulu", "Kunokwenzeka kakhulu", "Ho ka etsahala", "Waarskynlik"],
        "Possible": ["Kungenzeka", "Kunokwenzeka", "Ho a kgoneha", "Moontlik"],
        "Unlikely": ["Akunakwenzeka kakhulu", "Akunakwenzeka kakhulu", "Ha ho kgonehe haholo", "Onwaarskynlik"],
        "Meets listed minimum": ["Ihlangabezana nobuncane obubaliwe", "Ihlangabezana nobuncinane obudwelisiweyo", "E fihlella bonyane bo thathamisitsweng", "Voldoen aan die vermelde minimum"],
        "Near miss": ["Isondele ekufinyeleleni", "Isondele ekufikeleleni", "E haufi le ho fihlella", "Amper daar"],
        "Applications closed": ["Izicelo zivaliwe", "Izicelo zivaliwe", "Dikopo di kwetswe", "Aansoeke gesluit"],
        "Closing soon": ["Kuzovalwa maduze", "Ivala kungekudala", "E kwalwa haufinyane", "Sluit binnekort"],
        "Applications open": ["Izicelo zivuliwe", "Izicelo zivuliwe", "Dikopo di butswe", "Aansoeke oop"],
        "Back to edit your marks": ["Buyela uyohlela amamaki akho", "Buyela ukuze uhlele amanqaku akho", "Kgutlela ho lokisa matshwao a hao", "Terug om jou punte te wysig"],
        "Next step: explore funding": ["Isinyathelo esilandelayo: hlola uxhaso lwezimali", "Inyathelo elilandelayo: phonononga inkxaso-mali", "Mohato o latelang: fuputsa tshehetso ya ditjhelete", "Volgende stap: verken befondsing"],
        "Explore funding and documents": ["Hlola uxhaso nezincwadi", "Phonononga inkxaso-mali namaxwebhu", "Fuputsa tshehetso le ditokomane", "Verken befondsing en dokumente"],
        "Bursaries and funding": ["Imifundaze noxhaso lwezimali", "Iibhasari nenkxaso-mali", "Dibasari le tshehetso ya ditjhelete", "Beurse en befondsing"],
        "Application reminders": ["Izikhumbuzi zezicelo", "Izikhumbuzo zezicelo", "Dikgopotso tsa dikopo", "Aansoekherinneringe"],
        "Add a reminder": ["Engeza isikhumbuzi", "Yongeza isikhumbuzo", "Eketsa kgopotso", "Voeg 'n herinnering by"],
        "Add to my calendar": ["Engeza ekhalendeni yami", "Yongeza kwikhalenda yam", "Eketsa khalendareng ya ka", "Voeg by my kalender"],
        "Upcoming funding deadlines": ["Izinsuku zokugcina zoxhaso ezizayo", "Imihla yokuvala yenkxaso-mali ezayo", "Matsatsi a tlang a ho kwalwa ha dikopo tsa tshehetso", "Komende befondsingspertye"],
        "My reminders": ["Izikhumbuzi zami", "Izikhumbuzo zam", "Dikgopotso tsa ka", "My herinneringe"],
        "Export calendar": ["Khipha ikhalenda", "Thumela ikhalenda", "Ntsha khalendara", "Voer kalender uit"],
        "Keep your funding and plan your money": ["Gcina uxhaso lwakho futhi uhlele imali yakho", "Gcina inkxaso-mali yakho uze ucwangcise imali yakho", "Boloka tshehetso ya hao mme o rere tjhelete ya hao", "Behou jou befondsing en beplan jou geld"],
        "Your funding": ["Uxhaso lwakho", "Inkxaso-mali yakho", "Tshehetso ya hao", "Jou befondsing"],
        "Your first month": ["Inyanga yakho yokuqala", "Inyanga yakho yokuqala", "Kgwedi ya hao ya pele", "Jou eerste maand"],
        "Your monthly costs (R)": ["Izindleko zakho zanyanga zonke (R)", "Iindleko zakho zenyanga (R)", "Ditshenyehelo tsa hao tsa kgwedi (R)", "Jou maandelikse koste (R)"],
        "Check my plan": ["Hlola uhlelo lwami", "Jonga isicwangciso sam", "Sheba moralo wa ka", "Kontroleer my plan"],
        "My application checklist": ["Uhlu lwami lokuhlola izicelo", "Uluhlu lwam lokukhangela izicelo", "Lenane la ka la tlhahlobo ya dikopo", "My aansoek-kontrolelys"],
        "Log out": ["Phuma", "Phuma", "Tswa", "Teken uit"],
        "Account": ["I-akhawunti", "Iakhawunti", "Akhaonto", "Rekening"],
        "Profile": ["Iphrofayela", "Iprofayile", "Boemo", "Profiel"],
        "Certified ID or birth certificate": ["Ikhophi eqinisekisiwe kamazisi noma isitifiketi sokuzalwa", "Ikopi eqinisekisiweyo yesazisi okanye isatifikethi sokuzalwa", "Khopi e netefaditsweng ya ID kapa setifikeiti sa tswalo", "Gesertifiseerde ID of geboortesertifikaat"],
        "Latest school results": ["Imiphumela yakamuva yesikole", "Iziphumo zamva nje zesikolo", "Diphetho tsa morao tsa sekolo", "Jongste skooluitslae"],
        "Proof of home address": ["Ubufakazi bekheli lasekhaya", "Ubungqina bedilesi yasekhaya", "Bopaki ba aterese ya lapeng", "Bewys van huisadres"],
        "Certified copy of parent/guardian ID": ["Ikhophi eqinisekisiwe kamazisi womzali noma womnakekeli", "Ikopi eqinisekisiweyo yesazisi somzali okanye somgcini", "Khopi e netefaditsweng ya ID ya motswadi kapa mohlokomedi", "Gesertifiseerde afskrif van ouer/voog se ID"],
        "Proof of household income (pay slip, pension slip, or affidavit)": ["Ubufakazi bemali engenayo yasekhaya (isiliphu somholo, ses pension, noma isifungo esibhaliwe)", "Ubungqina bomvuzo wekhaya (isiliphu somvuzo, sepenshini, okanye ingxelo efungelweyo)", "Bopaki ba lekeno la lelapa (setlankana sa moputso, sa penshene kapa afidafiti)", "Bewys van huishoudelike inkomste (betaalstrokie, pensioenstrokie of beëdigde verklaring)"],
        "Please fill in all required fields.": ["Gcwalisa zonke izikhala ezidingekayo.", "Nceda ugcwalise zonke iindawo ezifunekayo.", "Ka kopo tlatsa dikgeo tsohle tse hlokehang.", "Vul asseblief al die vereiste velde in."],
        "Please choose a subject from the list.": ["Khetha isifundo ohlwini.", "Nceda ukhethe isifundo kuluhlu.", "Ka kopo kgetha thuto lenaneng.", "Kies asseblief 'n vak uit die lys."],
        "Each subject can only be added once.": ["Isifundo ngasinye singafakwa kanye kuphela.", "Isifundo ngasinye singongezwa kube kanye kuphela.", "Thuto ka nngwe e ka eketswa hang feela.", "Elke vak kan net een keer bygevoeg word."],
        "Marks must be between 0 and 100.": ["Amamaki kufanele abe phakathi kuka-0 no-100.", "Amanqaku kufuneka abe phakathi ko-0 ne-100.", "Matshwao a lokela ho ba pakeng tsa 0 le 100.", "Punte moet tussen 0 en 100 wees."],
        "Some of these subjects can't be taken together.": ["Ezinye zalezi zifundo azikwazi ukufundwa ndawonye.", "Ezinye zezi zifundo azinakufundwa kunye.", "Tse ding tsa dithuto tsena di ke ke tsa nkuwa mmoho.", "Sommige van hierdie vakke kan nie saam geneem word nie."],
        "Something went wrong. Please try again.": ["Kukhona okungahambanga kahle. Zama futhi.", "Kukho okungahambanga kakuhle. Zama kwakhona.", "Ho na le phoso e etsahetseng. Ka kopo leka hape.", "Iets het verkeerd geloop. Probeer asseblief weer."],
        "We could not complete your request. Please try again.": ["Asikwazanga ukuqedela isicelo sakho. Zama futhi.", "Asikwazanga ukugqiba isicelo sakho. Zama kwakhona.", "Ha rea kgona ho phethela kopo ya hao. Ka kopo leka hape.", "Ons kon nie jou versoek voltooi nie. Probeer asseblief weer."]
    };

    let lang = "en";

    try {
        lang = localStorage.getItem("ukhanyiso-lang") || "en";
    } catch (error) {
        lang = "en";
    }

    if (!Object.prototype.hasOwnProperty.call(LANGS, lang)) {
        lang = "en";
    }

    const canonicalText = new Map();

    Object.keys(TEXT).forEach(english => {
        canonicalText.set(english, english);
        TEXT[english].forEach(translation => {
            canonicalText.set(translation, english);
        });
    });

    function translate(value, target) {
        const english = canonicalText.get(value.trim());

        if (!english || target === "en") {
            return english || value;
        }

        const leading = value.match(/^\s*/)[0];
        const trailing = value.match(/\s*$/)[0];
        const index = ["zu", "xh", "st", "af"].indexOf(target);

        if (index < 0 || !TEXT[english] || !TEXT[english][index]) {
            return value;
        }

        return leading + TEXT[english][index] + trailing;
    }

    function t(key, vars) {
        const englishKey = canonicalText.get(key) || key;
        let value = translate(englishKey, lang);

        Object.keys(vars || {}).forEach(name => {
            value = value.replace("{" + name + "}", vars[name]);
        });

        return value;
    }

    function translateTree(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;

        while ((node = walker.nextNode())) {
            const parent = node.parentElement;

            if (!parent || parent.closest("script, style, noscript")) {
                continue;
            }

            const translated = translate(node.nodeValue, lang);

            if (translated !== node.nodeValue) {
                node.nodeValue = translated;
            }
        }

        if (root.nodeType === Node.ELEMENT_NODE) {
            const elements = [root].concat(Array.from(root.querySelectorAll("*")));

            elements.forEach(element => {
                ["aria-label", "placeholder", "title"].forEach(attribute => {
                    const value = element.getAttribute(attribute);

                    if (value) {
                        const translated = translate(value, lang);

                        if (translated !== value) {
                            element.setAttribute(attribute, translated);
                        }
                    }
                });
            });
        }
    }

    function applyLanguage(nextLang) {
        lang = Object.prototype.hasOwnProperty.call(LANGS, nextLang)
            ? nextLang
            : "en";

        document.documentElement.lang = lang;
        translateTree(document.body);

        const label = document.querySelector('label[for="lang"]');

        if (label) {
            label.textContent = t("Language") + " ";
        }

        const skip = document.querySelector(".skip");

        if (skip) {
            skip.textContent = t("Skip to main content");
        }
    }

    function say(message) {
        const status = document.getElementById("status");

        if (status) {
            status.textContent = message;
        }
    }

    function listen(message) {
        if (!("speechSynthesis" in window)) {
            say("Speech is not supported by this browser.");
            return false;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;

        window.speechSynthesis.speak(utterance);
        return true;
    }

    window.Site = {
        t: t,
        say: say,
        listen: listen,
        lang: () => lang
    };

    // Add accessible skip link styling.
    const style = document.createElement("style");

    style.textContent =
        ".skip{position:absolute;left:-999px}" +
        ".skip:focus{left:0;top:0;padding:.5rem;background:#fff;z-index:9999}";

    document.head.appendChild(style);

    // Add skip link.
    const skip = document.createElement("a");

    skip.className = "skip";
    skip.href = "#main";
    skip.textContent = t("Skip to main content");

    document.body.prepend(skip);

    // Provide a main landmark and live status region.
    const main = document.querySelector("main");

    if (main) {
        main.id = main.id || "main";
        main.tabIndex = -1;

        if (!document.getElementById("status")) {
            const status = document.createElement("p");

            status.id = "status";
            status.className = "form-note";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");

            main.prepend(status);
        }
    }

    // Add language selector next to the navigation.
    const nav = document.querySelector("nav");

    if (nav) {
        const toolbar = document.createElement("div");
        toolbar.className = "site-toolbar";

        const label = document.createElement("label");
        label.htmlFor = "lang";
        label.textContent = t("Language") + " ";

        const select = document.createElement("select");
        select.id = "lang";
        select.name = "lang";
        select.setAttribute("aria-label", "Language");

        Object.keys(LANGS).forEach(code => {
            const option = document.createElement("option");

            option.value = code;
            option.textContent = LANGS[code];
            option.selected = code === lang;

            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            applyLanguage(select.value);

            try {
                localStorage.setItem("ukhanyiso-lang", lang);
            } catch (error) {
                say("Language changed for this page, but your browser could not save the preference.");
            }
        });

        toolbar.append(label, select);
        nav.insertAdjacentElement("afterend", toolbar);
    }

    applyLanguage(lang);

    const languageSelect = document.getElementById("lang");

    if (languageSelect) {
        languageSelect.value = lang;
    }

    // Translate text added dynamically by the page.
    const observer = new MutationObserver(records => {
        records.forEach(record => {
            record.addedNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const translated = translate(node.nodeValue, lang);

                    if (translated !== node.nodeValue) {
                        node.nodeValue = translated;
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    translateTree(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
    });

    // Authentication pages should not trigger account navigation checks.
    const authPage =
        location.pathname === "/login.html" ||
        location.pathname === "/signup.html";

    const profileLink = document.querySelector(".profile-link");
    const signOutButton = document.getElementById("sign-out");
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("main-menu");
    const navigation = menu || document.querySelector('nav[aria-label="Main navigation"]');

    // Mobile menu toggle.
    if (menuToggle && menu) {
        const setMenuOpen = isOpen => {
            menu.hidden = !isOpen;
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "← Back" : "☰ Menu";
        };

        setMenuOpen(!menu.hidden);
        menuToggle.addEventListener("click", () => {
            setMenuOpen(menu.hidden);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !menu.hidden) {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });
    }

    // Check the logged-in user and configure sign-out.
    if (!authPage && navigation) {
        fetch("/api/auth/me", {
            credentials: "same-origin"
        })
            .then(response => {
                return response.ok ? response.json() : null;
            })
            .then(user => {
                if (!user) {
                    if (profileLink) {
                        profileLink.textContent = t("Profile");
                    }

                    if (signOutButton) {
                        signOutButton.hidden = true;
                    }
                    return;
                }

                // Everyone must complete their profile before using the rest of the site.
                if (location.pathname !== "/account.html") {
                    fetch("/api/auth/profile", { credentials: "same-origin" })
                        .then(response => (response.ok ? response.json() : null))
                        .then(profile => {
                            if (profile && !(profile.firstName && profile.surname
                                    && profile.contactEmail && profile.whatsapp)) {
                                location.assign("/account.html");
                            }
                        })
                        .catch(() => { });
                }

                if (profileLink) {
                    profileLink.textContent = t("Profile");
                    profileLink.title = "Signed in as " + user.username;
                }

                if (navigation && !navigation.querySelector('a[href="/study.html"]')) {
                    const studyPlan = document.createElement("a");
                    studyPlan.href = "/study.html";
                    studyPlan.textContent = t("Study Plan");
                    const checklistLink = navigation.querySelector('a[href="/checklist.html"]');
                    if (checklistLink) {
                        navigation.insertBefore(studyPlan, checklistLink);
                    } else {
                        navigation.appendChild(studyPlan);
                    }
                }

                if (!signOutButton) {
                    return;
                }
                signOutButton.hidden = false;

                signOutButton.addEventListener("click", async () => {
                    signOutButton.disabled = true;

                    try {
                        const headers = {};

                        if (user.csrfToken) {
                            headers["X-CSRF-Token"] = user.csrfToken;
                        }

                        const result = await fetch("/api/auth/logout", {
                            method: "POST",
                            credentials: "same-origin",
                            headers: headers
                        });

                        if (!result.ok) {
                            throw new Error("Could not log out.");
                        }

                        [
                            "ukhanyiso-marks",
                            "ukhanyiso-results",
                            "ukhanyiso-showing-all-courses",
                            "ukhanyiso-stage",
                            "ukhanyiso-showcase"
                        ].forEach(key => {
                            sessionStorage.removeItem(key);
                        });

                        location.assign("/login.html");
                    } catch (error) {
                        say("We could not log you out. Please try again.");
                        signOutButton.disabled = false;
                    }
                });
            })
            .catch(() => {
                say("We could not load your account details. Please refresh the page.");
            });
    }
})();