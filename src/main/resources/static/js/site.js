(function () {
    "use strict";

    // Supported languages
    const LANGS = {
        en: "English",
        zu: "isiZulu",
        xh: "isiXhosa",
        st: "Sesotho",
        nso: "Sepedi",
        af: "Afrikaans"
    };

    // Core interface translations
    const TEXT = {
        "Skip to main content": ["Yeqela kokuqukethwe okuyinhloko", "Tsiba uye kumxholo ophambili", "Tlola ho dikahare tsa sehlooho", "Slaan oor na hoofinhoud", "Phonela godimo ga go sego motheo"],
        "Language": ["Ulimi", "Ulwimi", "Puo", "Taal", "Polelo"],
        "Main navigation": ["Ukuzulazula okuyinhloko", "Ulawulo oluphambili", "Tsamaiso e kgolo", "Hoofnavigasie", "Boeletši wa motheo"],
        "Marks": ["Amamaki", "Amanqaku", "Matshwao", "Punte", "Mabaka"],
        "Results": ["Imiphumela", "Iziphumo", "Diphetho", "Uitslae", "Dipoelo"],
        "Funding": ["Funding", "Inkxaso-mali", "Tshehetso ya ditjhelete", "Befondsing", "Kgothetšo ya madi"],
        "Reminders": ["Izikhumbuzi", "Izikhumbuzo", "Dikgopotso", "Herinneringe", "Dikgopolo"],
        "Budget": ["Isabelomali", "Uhlahlo-lwabiwo mali", "Tekanyetso ya ditjhelete", "Begroting", "Tekanyetso ya madi"],
        "Study Plan": ["Uhlelo lokufunda", "Isicwangciso sokufunda", "Moralo wa ho ithuta", "Studieplan", "Lenaneo la go ithuta"],
        "Checklist": ["Uhlu lokuhlola", "Uluhlu lokukhangela", "Lenane la tlhahlobo", "Kontrolelys", "Peo ya go hlahloba"],
        "Sign up": ["Bhalisa", "Bhalisa", "Ingolise", "Registreer", "Ingwadišiwa"],
        "Log in": ["Ngena", "Ngena", "Kena", "Meld aan", "Tsena"],
        "Ukhanyiso account": ["I-akhawunti ye-Ukhanyiso", "Iakhawunti ye-Ukhanyiso", "Akhaonto ya Ukhanyiso", "Ukhanyiso-rekening", "Akaonto ya Ukhanyiso"],
        "Create your Ukhanyiso account": ["Dala i-akhawunti yakho ye-Ukhanyiso", "Yenza iakhawunti yakho ye-Ukhanyiso", "Theha akhaonto ya hao ya Ukhanyiso", "Skep jou Ukhanyiso-rekening", "Hlagafša akaonto ya gago ya Ukhanyiso"],
        "Username": ["Igama lomsebenzisi", "Igama lomsebenzisi", "Lebitso la mosebedisi", "Gebruikersnaam", "Leina la mošomi"],
        "Password": ["Iphasiwedi", "Igama lokugqitha", "Phasewete", "Wagwoord", "Lentšuphetšo"],
        "Confirm password": ["Qinisekisa iphasiwedi", "Qinisekisa igama lokugqitha", "Netefatsa phasewete", "Bevestig wagwoord", "Netefatša lentšuphetšo"],
        "Fictional account": ["I-akhawunti eqanjiwe", "Iakhawunti eyintsomi", "Akhaonto ya boiqapelo", "Fiktiewe rekening", "Akaonto ya bohlatse"],
        "Create a fictional account": ["Dala i-akhawunti eqanjiwe", "Yenza iakhawunti eyintsomi", "Theha akhaonto ya boiqapelo", "Skep 'n fiktiewe rekening", "Hlagafša akaonto ya bohlatse"],
        "Fictional username": ["Igama lomsebenzisi eliqanjiwe", "Igama lomsebenzisi eliyintsomi", "Lebitso la mosebedisi la boiqapelo", "Fiktiewe gebruikersnaam", "Leina la mošomi la bohlatse"],
        "Made-up password": ["Iphasiwedi eqanjiwe", "Igama lokugqitha eliyintsomi", "Phasewete ya boiqapelo", "Fiktiewe wagwoord", "Lentšuphetšo la bohlatse"],
        "Confirm made-up password": ["Qinisekisa iphasiwedi eqanjiwe", "Qinisekisa igama lokugqitha eliyintsomi", "Netefatsa phasewete ya boiqapelo", "Bevestig fiktiewe wagwoord", "Netefatša lentšuphetšo la bohlatse"],
        "Privacy notice (POPIA)": ["Isaziso sobumfihlo (POPIA)", "Isaziso sabucala (POPIA)", "Tsebiso ya sephiri (POPIA)", "Privaatheidskennisgewing (POPIA)", "Kgathišo ya bohlatse (POPIA)"],
        "Marks are sent to the server to calculate course matches, but are not saved. Use fictional data only—never enter real identity, contact, financial details, or personal documents.": ["Amamaki athunyelwa kuseva ukuze kubalwe izifundo ezihambisanayo, kodwa awagcinwa. Sebenzisa imininingwane eqanjiwe kuphela—ungafaki imininingwane kamazisi, yokuxhumana, yezezimali, noma imibhalo yangempela.", "Amanqaku athunyelwa kwiseva ukuze kubalwe izifundo ezihambelanayo, kodwa awagcinwa. Sebenzisa iinkcukacha eziyintsomi kuphela—ungafaki iinkcukacha zesazisi, zoqhagamshelwano, zezemali okanye amaxwebhu okwenyani.", "Matshwao a romelwa seva ho bala dithuto tse tshwanang, empa ha a bolokwe. Sebedisa dintlha tsa boiqapelo feela—o se ke wa kenya dintlha tsa nnete tsa boitsebiso, tsa puisano, tsa ditjhelete kapa ditokomane.", "Punte word na die bediener gestuur om kursuspassings te bereken, maar word nie gestoor nie. Gebruik slegs fiktiewe data—moet nooit regte identiteits-, kontak- of finansiële besonderhede of dokumente invoer nie.", "Mabaka a thoromišetšwa sebediša gore ba alafše dithuto tše di lego, eupša ga se bolokwe. Šomišetša tsebo ya bohlatse feela—o se ke wa tsenya tsebo ya bohlatse ya bobedi, ya go bolela, ya madi, goba ditokomane."],
        "Ukhanyiso is a prototype, not an official university, TVET, NSFAS, or bursary application service. Confirm requirements with the relevant institution.": ["I-Ukhanyiso iyisibonelo sohlelo, akuyona isevisi esemthethweni yasenyuvesi, ye-TVET, ye-NSFAS, noma yezicelo zemifundaze. Qinisekisa izidingo esikhungweni esifanele.", "I-Ukhanyiso yiprototype, ayiyonkonzo esemthethweni yeyunivesithi, ye-TVET, ye-NSFAS okanye yezicelo zeebhasari. Qinisekisa iimfuno kwiziko elifanelekileyo.", "Ukhanyiso ke mohlala wa tshebediso, ha se tshebeletso ya semmuso ya yunivesithi, TVET, NSFAS kapa dikopo tsa dibasari. Netefatsa ditlhoko setheong se amehang.", "Ukhanyiso is 'n prototipe, nie 'n amptelike universiteit-, TVET-, NSFAS- of beursaansoekdiens nie. Bevestig vereistes by die betrokke instelling.", "Ukhanyiso ke mohlala wa prothetape, e sego direlo tša yunivesithi, TVET, NSFAS goba tša dikopelo tša dibasari tša semmušo. Netefatša ditlhoko le lefase la tirišo."],
        "Before public release, the project must publish its contact details, purposes for using information, retention periods, and how people can exercise their privacy rights.": ["Ngaphambi kokukhishwa emphakathini, iphrojekthi kufanele ishicilele imininingwane yokuxhumana, izizathu zokusebenzisa ulwazi, isikhathi sokulugcina, nokuthi abantu bangawasebenzisa kanjani amalungelo abo obumfihlo.", "Ngaphambi kokukhutshwa esidlangalaleni, iprojekthi kufuneka ipapashe iinkcukacha zoqhagamshelwano, izizathu zokusebenzisa ulwazi, ixesha lokulugcina, nendlela abantu abanokusebenzisa ngayo amalungelo abo abucala.", "Pele projeke e lokollwa phatlalatsa, e lokela ho phatlalatsa dintlha tsa puisano, mabaka a ho sebedisa tlhahisoleseding, nako ya ho e boloka, le kamoo batho ba ka sebedisang ditokelo tsa bona tsa sephiri.", "Voor openbare vrystelling moet die projek sy kontakbesonderhede, doeleindes vir die gebruik van inligting, bewaringstydperke en hoe mense hul privaatheidsregte kan uitoefen, publiseer.", "Pele ga go emiswa ga setjhaba, projekteng e swanetše go phatlalatsa ditaba tsa go ikgokaganya, ditaba tsa go dirisa tshedimosetso, dinako tsa go boloka, le kamano batho ba ka dirisang ditokelo tsa bona tsa boinotši."],
        "Marks stay in this browser tab and are sent only to calculate course matches.": ["Amamaki ahlala kule thebhu yesiphequluli futhi athunyelwa kuphela ukubala izifundo ezihambisanayo.", "Amanqaku ahlala kule thebhu yesikhangeli kwaye athunyelwa kuphela ukubala izifundo ezihambelanayo.", "Matshwao a sala tabeng ena ya sebadi mme a romelwa feela ho bala dithuto tse tshwanang.", "Punte bly in hierdie blaaieroortjie en word slegs gestuur om kursuspassings te bereken.", "Mabaka a dula thebeng ya seyewelele se gomme a thoromišwa go bala feela dithuto tše di sepeletsanang."],
        "Explore": ["Hlola", "Phonononga", "Fuputsa", "Verken", "Lekuteka"],
        "From APS to graduation": ["Kusukela ku-APS kuye ekuthwesweni iziqu", "Ukusuka kwi-APS ukuya kuthweso-zidanga", "Ho tloha ho APS ho isa kabo ya mangolo", "Van APS tot graduering", "Go tloha APS go ya go dikgwetlho"],
        "Check courses that fit your marks": ["Bheka izifundo ezihambisana namamaki akho", "Jonga izifundo ezihambelana namanqaku akho", "Sheba dithuto tse tsamaellanang le matshwao a hao", "Kyk watter kursusse by jou punte pas", "Hlahloba dithuto tše di tshwana le mabaka a gago"],
        "Enter your matric subject marks to see courses that meet their published minimum requirements.": ["Faka amamaki ezifundo zakho zikamatikuletsheni ukuze ubone izifundo ezihlangabezana nezidingo zazo ezishicilelwe.", "Faka amanqaku ezifundo zakho zematriki ukuze ubone izifundo ezihlangabezana neemfuno ezipapashiweyo.", "Kenya matshwao a dithuto tsa hao tsa matriki ho bona dithuto tse fihlellang ditlhoko tse phatlaladitsweng.", "Voer jou matriekvakpunte in om kursusse te sien wat aan hul gepubliseerde minimumvereistes voldoen.", "Kenya mabaka a gagwe a go sego gore boleletše dithuto tše di fihletšang ditlhoko tša bona tša go seke."],
        "Where are you now?": ["Ukuliphi ibanga manje?", "Ukweliphi inqanaba ngoku?", "O boemong bofe hona jwale?", "Waar is jy nou?", "Na o gona go kae gona?"],
        "I'm in Grade 11 (I'll use my latest school report marks)": ["NgiseBangeni le-11 (ngizosebenzisa amamaki akamuva asembikweni wesikole)", "NdikwiBanga le-11 (ndiza kusebenzisa amanqaku am akutshanje esikolo)", "Ke Kereiting ya 11 (ke tla sebedisa matshwao a morao a tlaleho ya sekolo)", "Ek is in Graad 11 (ek gebruik my jongste skoolrapportpunte)", "Ke Madingwa a 11 (ke tla diriša mabaka a mathomo a sekolo)"],
        "I'm in Grade 12 and have June exam marks": ["NgiseBangeni le-12 futhi nginamamaki ezivivinyo zikaJuni", "NdikwiBanga le-12 kwaye ndinamanqaku eemviwo zikaJuni", "Ke Kereiting ya 12 mme ke na le matshwao a ditlhahlobo tsa Phupjane", "Ek is in Graad 12 en het Junie-eksamenpunte", "Ke Madingwa a 12 gomme ke na le mabaka a a tlhahlog ya sego"],
        "I'm in Grade 12 and have trial/preliminary exam marks": ["NgiseBangeni le-12 futhi nginamamaki ezivivinyo zokuzilolonga", "NdikwiBanga le-12 kwaye ndinamanqaku eemviwo zovavanyo", "Ke Kereiting ya 12 mme ke na le matshwao a ditlhahlobo tsa boitokisetso", "Ek is in Graad 12 en het proef-/voorlopige eksamenpunte", "Ke Madingwa a 12 gomme ke na le mabaka a a tshweri/preliminary"],
        "I've finished matric and have my final results": ["Ngiphothule umatikuletsheni futhi nginemiphumela yokugcina", "Ndiyigqibile imatriki kwaye ndineziphumo zokugqibela", "Ke qetile matriki mme ke na le diphetho tsa makgaolakgang", "Ek het matriek voltooi en het my finale uitslae", "Ke mmatotsi matriki ke na le tšhupetso ya bofelo"],
        "Enter your latest Grade 11 marks to explore courses and funding while you plan ahead.": ["Faka amamaki akho akamuva eBanga le-11 ukuze uhlole izifundo noxhaso lwezimali usahlela ikusasa.", "Faka amanqaku akho akutshanje eBanga le-11 ukuze uphonononge izifundo nenkxaso-mali ngoxa usacwangcisa.", "Kenya matshwao a morao a Kereiti ya 11 ho fuputsa dithuto le tshehetso ha o ntse o rera bokamoso.", "Voer jou jongste Graad 11-punte in om kursusse en befondsing te verken terwyl jy vooruit beplan.", "Kenya mabaka a Madingwa a 11 a bofelo go feleleletša dithuto le funding go akaretsa."],
        "Enter your Grade 12 June exam marks to explore possible courses and funding.": ["Faka amamaki ezivivinyo zikaJuni eBanga le-12 ukuze uhlole izifundo noxhaso lwezimali olungase lube khona.", "Faka amanqaku eemviwo zikaJuni eBanga le-12 ukuze uphonononge izifundo nenkxaso-mali enokwenzeka.", "Kenya matshwao a ditlhahlobo tsa Phupjane tsa Kereiti ya 12 ho fuputsa dithuto le tshehetso e ka kgonehang.", "Voer jou Graad 12 Junie-eksamenpunte in om moontlike kursusse en befondsing te verken.", "Kenya mabaka a Madingwa a 12 go balediwa dithuto le funding e ka se go tšweleleng."],
        "Enter your Grade 12 trial or preliminary exam marks to explore possible courses and funding.": ["Faka amamaki ezivivinyo zokuzilolonga noma zokuqala eBanga le-12 ukuze uhlole izifundo noxhaso lwezimali olungase lube khona.", "Faka amanqaku eemviwo zovavanyo okanye zokuqala eBanga le-12 ukuze uphonononge izifundo nenkxaso-mali enokwenzeka.", "Kenya matshwao a ditlhahlobo tsa boitokisetso tsa Kereiti ya 12 ho fuputsa dithuto le tshehetso e ka kgonehang.", "Voer jou Graad 12-proef- of voorlopige eksamenpunte in om moontlike kursusse en befondsing te verken.", "Kenya mabaka a Madingwa a 12 a tlhahlog ya sego goba ya mathomo go balediwa dithuto le funding e ka se go tšweleleng."],
        "Enter your final matric (NSC) marks to see courses that meet their published minimum requirements.": ["Faka amamaki akho okugcina kamatikuletsheni (NSC) ukuze ubone izifundo ezihlangabezana nezidingo ezishicilelwe.", "Faka amanqaku akho okugqibela ematriki (NSC) ukuze ubone izifundo ezihlangabezana neemfuno ezipapashiweyo.", "Kenya matshwao a hao a makgaolakgang a matriki (NSC) ho bona dithuto tse fihlellang ditlhoko tse phatlaladitsweng.", "Voer jou finale matriek- (NSC-) punte in om kursusse te sien wat aan hul gepubliseerde minimumvereistes voldoen.", "Kenya mabaka a matriki wa go sego (NSC) go bona dithuto tše di fihletšang ditlhoko tša bona tša go seke."],
        "These are early planning estimates. Your Grade 12 subjects and final matric marks may change your options.": ["Lezi yizilinganiso zokuqala zokuhlela. Izifundo zakho zeBanga le-12 namamaki okugcina angashintsha ongakukhetha.", "Olu luqikelelo lokuqala lokucwangcisa. Izifundo zakho zeBanga le-12 namanqaku okugqibela zinokutshintsha iindlela zakho.", "Tsena ke dikakanyo tsa pele tsa moralo. Dithuto tsa hao tsa Kereiti ya 12 le matshwao a makgaolakgang di ka fetola dikgetho tsa hao.", "Dit is vroeë beplanningsberamings. Jou Graad 12-vakke en finale matriekpunte kan jou opsies verander.", "Dipalo tše ke tša mathomo tša go akanya. Dithuto tša Madingwa a 12 le mabaka a bofelo a ka fetola tšhupetso ya gago."],
        "June marks are provisional estimates. Update your marks after later exams and again when your final results are released.": ["Amamaki kaJuni ayizilinganiso zesikhashana. Buyekeza amamaki akho ngemva kwezivivinyo ezilandelayo nangesikhathi kuphuma imiphumela yokugcina.", "Amanqaku kaJuni luqikelelo lwethutyana. Hlaziya amanqaku akho emva kweemviwo ezilandelayo naxa kukhutshwa iziphumo zokugqibela.", "Matshwao a Phupjane ke dikakanyo tsa nakwana. Ntlafatsa matshwao ka mora ditlhahlobo tse latelang le ha diphetho tsa makgaolakgang di lokollwa.", "Junie-punte is voorlopige ramings. Werk jou punte ná latere eksamens by en weer wanneer jou finale uitslae bekend gemaak word.", "Mabaka a June ke dipalo tša mathomo. Ntlafatša mabaka a gago ka moragelwi a dibopego le go gape ge dipelo tša bofelo di emišwa."],
        "Trial/preliminary marks are provisional estimates. Update your marks when your final matric results are released.": ["Amamaki ezivivinyo zokuzilolonga ayizilinganiso zesikhashana. Buyekeza amamaki akho lapho kuphuma imiphumela yokugcina kamatikuletsheni.", "Amanqaku ovavanyo luqikelelo lwethutyana. Hlaziya amanqaku akho xa kukhutshwa iziphumo zokugqibela zematriki.", "Matshwao a boitokisetso ke dikakanyo tsa nakwana. Ntlafatsa matshwao ha diphetho tsa makgaolakgang tsa matriki di lokollwa.", "Proef-/voorlopige punte is ramings. Werk jou punte by wanneer jou finale matriekuitslae bekend gemaak word.", "Mabaka a tlhahlog/preliminary ke dipalo tša mathomo. Ntlafatša mabaka a gago ge dipelo tša bofelo tša matriki di emišwa."],
        "Type the marks from your results statement. Never enter your exam number or ID number here.": ["Faka amamaki avela esitatimendeni semiphumela yakho. Ungalokothi ufake inombolo yokuhlolwa noma kamazisi.", "Faka amanqaku akwisitatimenti seziphumo zakho. Ungaze ufake inombolo yoviwo okanye yesazisi apha.", "Ngola matshwao a leng setatementeng sa diphetho. O se ke wa kenya nomoro ya tlhahlobo kapa ya ID mona.", "Tik die punte van jou uitslagestaat in. Moet nooit jou eksamennommer of ID-nommer hier invoer nie.", "Thwala mabaka go tšwa setatamenteng sa dipoelo tša gago. O se ke wa tsenya palo ya go hlahloba goba ya bobedi."],
        "Subject": ["Isifundo", "Isifundo", "Thuto", "Vak", "Thuto"],
        "Choose subject": ["Khetha isifundo", "Khetha isifundo", "Kgetha thuto", "Kies vak", "Kgetha thuto"],
        "Mark (%)": ["Imaki (%)", "Inqaku (%)", "Letshwao (%)", "Punt (%)", "Mabaka (%)"],
        "Add a subject": ["Engeza isifundo", "Yongeza isifundo", "Eketsa thuto", "Voeg 'n vak by", "Oketsa thuto"],
        "See matching courses": ["Bona izifundo ezihambisanayo", "Jonga izifundo ezihambelanayo", "Sheba dithuto tse tshwanang", "Sien kursusse wat pas", "Sheba dithuto tše di tshwana"],
        "Show my options": ["Bonisa engingakukhetha", "Bonisa iindlela zam", "Bontsha dikgetho tsa ka", "Wys my opsies", "Laetsa tšhupetso ya ka"],
        "Remove": ["Susa", "Susa", "Tlosa", "Verwyder", "Tloša"],
        "Your course matches": ["Izifundo ezihambisana namamaki akho", "Izifundo ezihambelana namanqaku akho", "Dithuto tse tsamaellanang le matshwao a hao", "Kursusse wat by jou punte pas", "Dithuto tše di tshwanetšego le mabaka a gago"],
        "Courses to explore": ["Izifundo ongazihlola", "Izifundo onokuziphonononga", "Dithuto tseo o ka di fuputsang", "Kursusse om te verken", "Dithuto tšeo o ka di lekola"],
        "How to read likelihood labels": ["Indlela yokufunda amalebula wamathuba", "Indlela yokufunda iilebhile zamathuba", "Mokgwa wa ho bala matshwao a monyetla", "Hoe om die waarskynlikheidsetikette te lees", "Kamano wa go bala ditlaleletšo tsa tšhepho"],
        "Likely": ["Kungenzeka kakhulu", "Kunokwenzeka kakhulu", "Ho ka etsahala", "Waarskynlik", "E tla etsahala"],
        "Possible": ["Kungenzeka", "Kunokwenzeka", "Ho a kgoneha", "Moontlik", "E ka tšweletša"],
        "Unlikely": ["Akunakwenzeka kakhulu", "Akunakwenzeka kakhulu", "Ha ho kgonehe haholo", "Onwaarskynlik", "Ha ho kgonehe"],
        "Meets listed minimum": ["Ihlangabezana nobuncane obubaliwe", "Ihlangabezana nobuncinane obudwelisiweyo", "E fihlella bonyane bo thathamisitsweng", "Voldoen aan die vermelde minimum", "E fihletša bonyane bjo bethatamišitšwe"],
        "Near miss": ["Isondele ekufinyeleleni", "Isondele ekufikeleleni", "E haufi le ho fihlella", "Amper daar", "Go lehaufi"],
        "Applications closed": ["Izicelo zivaliwe", "Izicelo zivaliwe", "Dikopo di kwetswe", "Aansoeke gesluit", "Dikopelo di tswaletšwe"],
        "Closing soon": ["Kuzovalwa maduze", "Ivala kungekudala", "E kwalwa haufinyane", "Sluit binnekort", "Bolediwa ka kuditšo"],
        "Applications open": ["Izicelo zivuliwe", "Izicelo zivuliwe", "Dikopo di butswe", "Aansoeke oop", "Dikopelo di bolediwe"],
        "Back to edit your marks": ["Buyela uyohlela amamaki akho", "Buyela ukuze uhlele amanqaku akho", "Kgutlela ho lokisa matshwao a hao", "Terug om jou punte te wysig", "Mora wa go bolela mabaka a gago"],
        "Next step: explore funding": ["Isinyathelo esilandelayo: hlola uxhaso lwezimali", "Inyathelo elilandelayo: phonononga inkxaso-mali", "Mohato o latelang: fuputsa tshehetso ya ditjhelete", "Volgende stap: verken befondsing", "Mohato wa o latelang: lekola funding"],
        "Explore funding and documents": ["Hlola uxhaso nezincwadi", "Phonononga inkxaso-mali namaxwebhu", "Fuputsa tshehetso le ditokomane", "Verken befondsing en dokumente", "Lekola funding le ditokomane"],
        "Bursaries and funding": ["Imifundaze noxhaso lwezimali", "Iibhasari nenkxaso-mali", "Dibasari le tshehetso ya ditjhelete", "Beurse en befondsing", "Dibasari le funding"],
        "Application reminders": ["Izikhumbuzi zezicelo", "Izikhumbuzo zezicelo", "Dikgopotso tsa dikopo", "Aansoekherinneringe", "Dikopole tša dikopelo"],
        "Add a reminder": ["Engeza isikhumbuzi", "Yongeza isikhumbuzo", "Eketsa kgopotso", "Voeg 'n herinnering by", "Oketsa kgopolo"],
        "Add to my calendar": ["Engeza ekhalendeni yami", "Yongeza kwikhalenda yam", "Eketsa khalendareng ya ka", "Voeg by my kalender", "Oketsa kalendareng ya ka"],
        "Upcoming funding deadlines": ["Izinsuku zokugcina zoxhaso ezizayo", "Imihla yokuvala yenkxaso-mali ezayo", "Matsatsi a tlang a ho kwalwa ha dikopo tsa tshehetso", "Komende befondsingspertye", "Nako ya go tšwa ya funding"],
        "My reminders": ["Izikhumbuzi zami", "Izikhumbuzo zam", "Dikgopotso tsa ka", "My herinneringe", "Dikgopolo tša ka"],
        "Export calendar": ["Khipha ikhalenda", "Thumela ikhalenda", "Ntsha khalendara", "Voer kalender uit", "Export kalendara"],
        "Keep your funding and plan your money": ["Gcina uxhaso lwakho futhi uhlele imali yakho", "Gcina inkxaso-mali yakho uze ucwangcise imali yakho", "Boloka tshehetso ya hao mme o rere tjhelete ya hao", "Behou jou befondsing en beplan jou geld", "Boloka funding ya gago gomme o hlama madi a gago"],
        "Your funding": ["Uxhaso lwakho", "Inkxaso-mali yakho", "Tshehetso ya hao", "Jou befondsing", "Funding ya gago"],
        "Your first month": ["Inyanga yakho yokuqala", "Inyanga yakho yokuqala", "Kgwedi ya hao ya pele", "Jou eerste maand", "Kgwedi ya gago ya pele"],
        "Your monthly costs (R)": ["Izindleko zakho zanyanga zonke (R)", "Iindleko zakho zenyanga (R)", "Ditshenyehelo tsa hao tsa kgwedi (R)", "Jou maandelikse koste (R)", "Ditshenyehelo tša gago tša kgwedi (R)"],
        "Check my plan": ["Hlola uhlelo lwami", "Jonga isicwangciso sam", "Sheba moralo wa ka", "Kontroleer my plan", "Lekola mohlami wa ka"],
        "My application checklist": ["Uhlu lwami lokuhlola izicelo", "Uluhlu lwam lokukhangela izicelo", "Lenane la ka la tlhahlobo ya dikopo", "My aansoek-kontrolelys", "Peo ya go hlahloba ya go sego"],
        "Log out": ["Phuma", "Phuma", "Tswa", "Teken uit", "Tšwa"],
        "Account": ["I-akhawunti", "Iakhawunti", "Akhaonto", "Rekening", "Akaonto"],
        "Profile": ["Iphrofayela", "Iprofayile", "Boemo", "Profiel", "Sebopego"],
        "Certified ID or birth certificate": ["Ikhophi eqinisekisiwe kamazisi noma isitifiketi sokuzalwa", "Ikopi eqinisekisiweyo yesazisi okanye isatifikethi sokuzalwa", "Khopi e netefaditsweng ya ID kapa setifikeiti sa tswalo", "Gesertifiseerde ID of geboortesertifikaat", "Setifikeiti sa bobedi goba sa go tswetšwa"],
        "Latest school results": ["Imiphumela yakamuva yesikole", "Iziphumo zamva nje zesikolo", "Diphetho tsa morao tsa sekolo", "Jongste skooluitslae", "Dipoelo tša bofelo tša sekolo"],
        "Proof of home address": ["Ubufakazi bekheli lasekhaya", "Ubungqina bedilesi yasekhaya", "Bopaki ba aterese ya lapeng", "Bewys van huisadres", "Bontšha ga gae"],
        "Certified copy of parent/guardian ID": ["Ikhophi eqinisekisiwe kamazisi womzali noma womnakekeli", "Ikopi eqinisekisiweyo yesazisi somzali okanye somgcini", "Khopi e netefaditsweng ya ID ya motswadi kapa mohlokomedi", "Gesertifiseerde afskrif van ouer/voog se ID", "Setifikeiti sa go tswetswe pele sa motswadi"],
        "Proof of household income (pay slip, pension slip, or affidavit)": ["Ubufakazi bemali engenayo yasekhaya (isiliphu somholo, ses pension, noma isifungo esibhaliwe)", "Ubungqina bomvuzo wekhaya (isiliphu somvuzo, sepenshini, okanye ingxelo efungelweyo)", "Bopaki ba lekeno la lelapa (setlankana sa moputso, sa penshene kapa afidafiti)", "Bewys van huishoudelike inkomste (betaalstrokie, pensioenstrokie of beëdigde verklaring)", "Kgatho ya ditaba tsa lelapa (paya o go gola, o go gola la sego)"],
        "Please fill in all required fields.": ["Gcwalisa zonke izikhala ezidingekayo.", "Nceda ugcwalise zonke iindawo ezifunekayo.", "Ka kopo tlatsa dikgeo tsohle tse hlokehang.", "Vul asseblief al die vereiste velde in.", "Tsenya dipotso tše di sego ka moka."],
        "Please choose a subject from the list.": ["Khetha isifundo ohlwini.", "Nceda ukhethe isifundo kuluhlu.", "Ka kopo kgetha thuto lenaneng.", "Kies asseblief 'n vak uit die lys.", "Kgetha thuto go tšwa tšhathong."],
        "Each subject can only be added once.": ["Isifundo ngasinye singafakwa kanye kuphela.", "Isifundo ngasinye singongezwa kube kanye kuphela.", "Thuto ka nngwe e ka eketswa hang feela.", "Elke vak kan net een keer bygevoeg word.", "Thuto e sego e ka oketšwa nngwe feela."],
        "Marks must be between 0 and 100.": ["Amamaki kufanele abe phakathi kuka-0 no-100.", "Amanqaku kufuneka abe phakathi ko-0 ne-100.", "Matshwao a lokela ho ba pakeng tsa 0 le 100.", "Punte moet tussen 0 en 100 wees.", "Mabaka a swanetše go ba magareng ga 0 le 100."],
        "Some of these subjects can't be taken together.": ["Ezinye zalezi zifundo azikwazi ukufundwa ndawonye.", "Ezinye zezi zifundo azinakufundwa kunye.", "Tse ding tsa dithuto tsena di ke ke tsa nkuwa mmoho.", "Sommige van hierdie vakke kan nie saam geneem word nie.", "Dithuto tše dingwe di ka se dšomišwe mmogo."],
        "Something went wrong. Please try again.": ["Kukhona okungahambanga kahle. Zama futhi.", "Kukho okungahambanga kakuhle. Zama kwakhona.", "Ho na le phoso e etsahetseng. Ka kopo leka hape.", "Iets het verkeerd geloop. Probeer asseblief weer.", "Go diragetše selo. Leka gape."],
        "We could not complete your request. Please try again.": ["Asikwazanga ukuqedela isicelo sakho. Zama futhi.", "Asikwazanga ukugqiba isicelo sakho. Zama kwakhona.", "Ha rea kgona ho phethela kopo ya hao. Ka kopo leka hape.", "Ons kon nie jou versoek voltooi nie. Probeer asseblief weer.", "Re ka se phethela kopo ya gago. Leka gape."],
        "We could not log you out. Please try again.": ["Asikwazanga ukuphuma. Zama futhi.", "Asikwazanga ukuphuma. Zama kwakhona.", "Ha rea kgona ho tswa. Ka kopo leka hape.", "Ons kon nie jou af te meld nie. Probeer asseblief weer.", "Re ka se go tloša. Leka gape."],
        "Language changed for this page, but your browser could not save the preference.": ["Ulimi lushintshiwe kuleli khasi, kodwa isiphequluli sakho asikwazanga ukugcina okukhethiwe.", "Ulwimi lutshintshiwe kweli phepha, kodwa isikhangeli sakho asikwazanga kugcina okukhethiweyo.", "Puo e fetotswe leqepheng lena, empa sebediswa sa hao sa kholomo ha se a kgona ho boloka kgetho.", "Taal is op hierdie bladsy verander, maar jou blaaier kon die voorkeur nie stoor nie.", "Polelo e šomifšwa letlakeleng le, eupša seyewelele sa gago ga se beakanya tshirinyo."],
        "We could not load your account details. Please refresh the page.": ["Asikwazanga ukulayisha imininingwane ye-akhawunti yakho. Vuselela ikhasi.", "Asikwazanga kulayisha iinkcukacha zeakhawunti yakho. Zama kwakhona ngeendlu.", "Ha rea kgona ho jarolla lintlha tsa akhaonto ya hao. Ntjhafatsa leqephe.", "Kon nie jou rekeningbesonderhede laai nie. Laai die bladsy weer.", "Re ka se kgona go hlahla tsebo ya akaonto ya gago. Ntšha letlakela."],

        "Enter your monthly funding and the number of funded months.": ["Faka uxhaso lwakho lwanyanga nenani lezinyanga ezixhasiwe.", "Faka inkxaso-mali yakho ngenyanga nenani leenyanga ezinxhasiweyo.", "Kenyetsa tshehetso ya hao ya kgwedi le palo ya dikgwedi tse tshehetsweng.", "Voer jou maandelikse befondsing en die aantal gefinansierde maande in.", "Kenya mabaka a kgwedi a go akanya le palo ya dikgwedi."],


        "✕ Close": ["✕ Vala", "✕ Vala", "✕ Kwa", "✕ Sluit", "✕ Tswalela"],
        "You are here:": ["Uphilapha:", "Ukulapha:", "O teng mo:", "Jy is hier:", "O gona mo:"],
        "Need an account? Sign up": ["Udinga i-akhawunti? Bhalisa", "Ufuna iakhawunti? Bhalisa", "O hloka akhaonto? Ingolise", "Het n rekening nodig? Registreer", "O hloka akaonto? Ingodiše"],

        // Shared chrome
        "Sign out": ["Phuma", "Phuma", "Tswa", "Teken uit", "Tšwa"],
        "☰ Menu": ["☰ Imenyu", "☰ Imenyu", "☰ Menyu", "☰ Kieslys", "☰ Menu"],
        "← Back": ["← Emuva", "← Emva", "← Morao", "← Terug", "← Morago"],
        "Dashboard": ["Idashebodi", "Idashebodi", "Dashiboro", "Dashbord", "Deshboroto"],

        // Index page
        "Your higher education journey": ["Uhambo lwakho lwezemfundo ephakeme", "Uhambo lakho lwezemfundo ephakamileyo", "Leeto la hao la thuto e phahameng", "Jou hoër onderwysreis", "Leeto la gago la thuto ya godimo"],
        "Student Dashboard": ["Idashebodi yomfundi", "Idashebodi yomfundi", "Dashiboro ya moithuti", "Studentedashbord", "Deshboroto ya moithuti"],
        "Welcome to Ukhanyiso. Keep your marks, course options, funding tasks and study plans in one place.": ["Wamukelekile ku-Ukhanyiso. Gcina amamaki akho, izinketho zezifundo, imisebenzi yoxhaso nezinhlelo zokufunda endaweni eyodwa.", "Wamkelekile kwi-Ukhanyiso. Gcina amanqaku akho, iinketho zezifundo, imisebenzi yenkxaso-mali neezicwangciso zokufunda kwindawo enye.", "Amohauwa ho Ukhanyiso. Boloka matshwao a hao, dikgetho tsa dithuto, mesebetsi ya tshehetso le meralo ya ho ithuta sebakeng se le seng.", "Welkom by Ukhanyiso. Hou jou punte, kursusopsies, befondsingstake en studieplanne op een plek.", "Amohelwa Ukhanyiso. Boloka mabaka a gago, dikgetho tsa dithuto, mesebetsi ya funding le meralo ya go ithuta sebaka se le seng."],
        "Start here": ["Qala lapha", "Qala apha", "Qala mona", "Begin hier", "Qala mo"],
        "Build your next step": ["Akha isinyathelo sakho esilandelayo", "Yakha inyathelo lakho elilandelayo", "Aha mohato o latelang wa hao", "Bou jou volgende stap", "Hlagafša mohato wa gago wa latelago"],
        "Add your marks to explore course options, then use your checklist and reminders to keep applications moving.": ["Faka amamaki akho ukuze uhlole izinketho zezifundo, bese usebenzisa uhlu lwakho lokuhlola nezikhumbuzi ukuze izicelo ziye phambili.", "Faka amanqaku akho ukuze uphonononge iinketho zezifundo, emva koko usebenzise uluhlu lwakho lokukhangela neezikhumbuzo ukuze iikopo zihambe phambili.", "Kenyetsa matshwao a hao ho fuputsa dikgetho tsa dithuto, ebe o sebedisa lenane la hao la tlhahlobo le dikgopotso ho tsoela pele le dikopo.", "Voer jou punte in om kursusopsies te verken, en gebruik jou kontrolelys en herinneringe om aansoeke aan die gang te hou.", "Oketsa mabaka a gago go lekola dikgetho tsa dithuto, gomme o šomiše thwi ya go hlahloba le dikgopolo gore dikopelo di tšwele pele."],
        "Enter or update my marks": ["Faka noma buyekeza amamaki ami", "Faka okanye uhlaziye amanqaku am", "Kenyetsa kapa ntlafatsa matshwao a ka", "Voer of werk my punte by", "Kenya goba hlafatša mabaka a ka"],
        "Your Profile": ["Iphrofayela yakho", "Iprofayile yakho", "Boemo ba hao", "Jou profiel", "Sebopego sa gago"],
        "Review your account and see which reminders are saved in this browser.": ["Bheka i-akhawunti yakho futhi ubone izikhumbuzi ezigcinwe kulesi siphequluli.", "Jonga iakhawunti yakho kwaye ubone eezikhumbuzo ezigciniweyo kulo mkhangeli.", "Sheba akhaonto ya hao mme o bone dikgopotso tse bolokilweng sebedisweng sena.", "Bekyk jou rekening en sien watter herinneringe in hierdie blaaier gestoor is.", "Lekola akaonto ya gago gomme o bone dikgopolo tšeo di bolokilwe seyewelele se."],
        "View Profile": ["Bheka iphrofayela", "Jonga iprofayile", "Sheba boemo", "Bekyk profiel", "Sheba sebopego"],
        "Your workspace": ["Isikhala sakho somsebenzi", "Isithuba sakho somsebenzi", "Sebaka sa hao sa mosebetsi", "Jou werkruimte", "Sebaka sa gago sa mosebetsi"],
        "Student Tools": ["Amathuluzi omfundi", "Izixhobo zomfundi", "Ditlhoaele tsa moithuti", "Studentehulpmiddels", "Ditlhoholo tsa moithuti"],
        "Choose a tool below, or use the Menu button at the top to navigate to another section.": ["Khetha ithuluzi elingezansi, noma sebenzisa inkinobho yemenyu esezantsi ukuze uhamba kwelinye icala.", "Khetha isixhomo ngezantsi, okanye sebenzisa iqhosha lemenyu phezulu ukuze uye kwicandelo elinye.", "Kgetha sesebediswa se ka tlase, kapa sebedisa konopo ya menyu ka hodimo ho ya karolong e nngwe.", "Kies 'n hulpmiddel hieronder, of gebruik die kieslys-knoppie bo-aan om na 'n ander afdeling te gaan.", "Kgetha ditlhoholo tla mo, goba šomiša konopo ya Menu godimo go ya karolong e nngwe."],
        "Enter your subject marks and explore courses that may fit the published entry requirements.": ["Faka amamaki ezifundo zakho bese uhlole izifundo ezihambisana nezidingo zokungenisa ezishicilelwe.", "Faka amanqaku ezifundo zakho kwaye uphonononge iifundo ezihambelana neemfuno zokungenisa ezipapashiweyo.", "Kenyetsa matshwao a dithuto tsa hao mme o fuputse dithuto tse ka fihlellang ditlhoko tsa kena tse phatlaladitsweng.", "Voer jou vakpunte in en verken kursusse wat by die gepubliseerde toelatingsvereistes kan pas.", "Kenya mabaka a gagwe gomme o lekola dithuto tše di ka fihletšang ditlhoko tša go tsena."],
        "Open Marks": ["Vula Amamaki", "Vula Amanqaku", "Bula Matshwao", "Maak Punte oop", "Bula Mabaka"],
        "Course Results": ["Imiphumela yezifundo", "Iziphumo zezifundo", "Diphetho tsa dithuto", "Kursusuitslae", "Dipoelo tsa dithuto"],
        "Review course matches based on the marks you entered. Confirm all requirements with the institution.": ["Bheka izifundo ezihambisana namamaki owafake. Qinisekisa zonke izidingo ngomhlangano ofanele.", "Jonga iifundo ezihambelanayo ngokweamanqaku owafakileyo. Qinisekisa onke iimfuno nomzikel.", "Sheba dithuto tse tshwanang le matshwao ao a kentseng. Netefatsa ditlhoko tsohle le setheong.", "Bekyk kursuspassings gebaseer op die punte wat jy ingevul het. Bevestig alle vereistes by die instansie.", "Lekola dithuto tše di tshwana go ya ka mabaka a gago a tsentšwego. Netefatša ditlhoko ka moka le lefase."],
        "View Results": ["Bheka imiphumela", "Jonga iziphumo", "Sheba diphetho", "Bekyk uitslae", "Sheba dipoelo"],
        "Funding Opportunities": ["Amathuba oxhaso lwezimali", "Amathuba enkxaso-mali", "Manyetla a tshehetso ya ditjhelete", "Befondsingsgeleenthede", "Ditlhošo tša Funding"],
        "Explore bursaries and funding information, and check application requirements with official providers.": ["Hlola imifundaze nemininingwane yoxhaso, bese uhlole izidingo zezicelo nabahlinzeki abasemthethweni.", "Phonononga iibhasari nolwazi lwenkxaso-mali, kwaye ukhangela iimfuno zezicelo nababoneleli abasemthethweni.", "Fuputsa dibasari le tsebo ya tshehetso, mme o hlahlobe ditlhoko tsa dikopo le baabi ba semmuso.", "Verken beurse en befondsingsinligting, en bevestig aansoekvereistes by amptelike verskaffers.", "Lekola dibasari le tsebo ya funding, gomme o hlahlobe ditlhoko tsa dikopelo le balekane ba semmušo."],
        "Open Reminders": ["Vula Izikhumbuzi", "Vula Iizikhumbuzo", "Bula Dikgopotso", "Maak Herinneringe oop", "Bula Dikgopolo"],
        "Keep track of application deadlines and the next actions you need to complete.": ["Landela izinsuku zokugcina zezicelo kanye neskhashana elandelayo okufanele uyesiqedele.", "Landela imihla yokuvala yeezicelo kunye nenyathelo elilandelayo okufuneka uliqede.", "Laola matsatsi a ho felloa ke nako a dikopo le mohato o latelang oo o hlokang ho o qetela.", "Hou aansoeksluitingsdatums en die volgende stappe wat jy moet voltooi in die oog.", "Lekola matsatsi a kopelo le mohato wa o latelang o swanetšego go phetha."],
        "Financial Plan": ["Uhlelo lwezimali", "Ucwangciso-mali", "Moralo wa ditjhelete", "Finansiële plan", "Mohlami wa Madi"],
        "Estimate your monthly expenses and plan for the period before your first funding payout.": ["Linganisa izindleko zakho zanyanga zonke futhi uhlele isikhathi ngaphambi kokukhokhwa kokuqala koxhaso.", "Zingca iindleko zakho zemali ngenyanga kwaye ucwangcise ixesha ngaphambi kwentlawulo yakho yokuqala yenkxaso-mali.", "Ana tshenyehelo tsa hao tsa kgwedi mme o rere nakopele ha pele ha tefello ya hao ya pele ya tshehetso.", "Skat jou maandelikse uitgawes en beplan vir die tydperk voor jou eerste befondsingsuitbetaling.", "Ana ditshenyehelo tša gago tša kgwedi le mohlami wa nako pele ga tefelo ya gago ya pele ya funding."],
        "Plan My Finances": ["Hlela izimali zami", "Cwangcisa imali yam", "Rera tjhelete ya ka", "Beplan my finansies", "Hlama Madi a Ka"],
        "Application Checklist": ["Uhlu lokuhlola izicelo", "Uluhlu lokukhangela iizicelo", "Lenane la tlhahlobo ya dikopo", "Aansoekkontrolelys", "Peo ya go hlahloba ya dikopelo"],
        "Organise your application tasks and identify what still needs your attention.": ["Hlela imisebenzi yakho yezicelo bese ubona okusesadinga ukunakwa kwakho.", "Cwangcisa imisebenzi yakho yezicelo kwaye uchonge okusenokufuna ingqalelo yakho.", "Hlophiswa mesebetsi ya hao ya dikopo mme o tsebe se se setsa hloka ts'okelo ya hao.", "Organiseer jou aansoektake en identifiseer wat nog jou aandag verg.", "Hlophisa mesebetsi ya dikopelo ya gago gomme o tsebe se se setsa go tlhoka kgopolo ya gago."],
        "Open Checklist": ["Vula Uhlu lokuhlola", "Vula Uluhlu lokukhangela", "Bula Lenane la tlhahlobo", "Maak Kontrolelys oop", "Bula Peo ya go hlahloba"],
        "Plan your future with confidence": ["Hlela ikusasa lakho ngokuqinisekile", "Cwangcisa ikusasa lakho ngokholo", "Rera bokamoso ba hao ka boitlhalo", "Beplan jou toekoms met vertroue", "Hlama bokamoso bja gago ka boitlhalo"],
        "Ukhanyiso helps students organise their higher education journey. It is a planning tool, not an official university, TVET college, NSFAS or bursary application service. Always confirm deadlines and requirements with the relevant organisation. Use fictional information while testing.": ["I-Ukhanyiso isize abafundi bahlele uhambo lwabo lwezemfundo ephakeme. Iyithuluzi lokuhlela, hhayi insiza esemthethweni yenyuvesi, ikolishi le-TVET, i-NSFAS noma isevisi yezicelo zemifundaze. Njalo qinisekisa izinsuku zokugcina nezidingo ngomhlangano ofanele. Sebenzisa imininingwane eqanjiwe ngesikhathi sivivinya.", "I-Ukhanyiso inceda abafundi ukuba bahlele uhambo lwabo lwezemfundo ephakamileyo. Lulutyalo-mqatho wolawulo, alunakuzakha iinkonzo esemthethweni zeyunivesithi, ikolashi ye-TVET, i-NSFAS okanye iinkonzo zezicelo zeebhasari. Ungalibali ukuqinisekisa iimihla yokugqibela neemfuno kwi-bhunga elichanenekileyo. Sebenzisa iinkcukacha ezingayonyaniyo xa uvavanya.", "Ukhanyiso o thusa baithuti ho hlophisa leeto la bona la thuto e phahameng. Ke sesebediswa sa moralo, ha se tshebeletso ya semmuso ya yunivesithi, kolese ya TVET, NSFAS kapa tshebeletso ya dikopo tsa dibasari. Kamehla netefatsa matshwao a ho felloa ke nako le ditlhoko le mokgatlo o amehang. Sebedisa tsebo ya boiqapelo ha o leka.", "Ukhanyiso help studente om hul hoëronderwysreis te organiseer. Dit is 'n beplanningshulpmiddel, nie 'n amptelike universiteits-, TVET-kollege-, NSFAS- of beursaansoekdiens nie. Bevestig altyd sluitingsdatums en vereistes by die betrokke organisasie. Gebruik fiktiewe inligting tydens toetsing.", "Ukhanyiso o thuša baithuti go hlophisa leeto la bona la thuto ya godimo. Ke sesebediswa sa mohlami, e sego direlo tša yunivesithi ya semmušo, kolese ya TVET, NSFAS goba tša dikopelo tša dibasari. Kamehla netefatša matsatsi a kopelo le ditlhoko le lefase la tirišo. Šomiša tsebo ya bohlatse ge o lekola."],

        // Marks page (start.html)
        "Marks, courses and funding": ["Amamaki, izifundo noxhaso", "Amanqaku, iifundo nenkxaso-mali", "Matshwao, dithuto le tshehetso", "Punte, kursusse en befondsing", "Mabaka, dithuto le funding"],
        "See your courses and bursaries in one go": ["Bona izifundo zakho nomxhaso ngesikhathi esisodwa", "Jonga iifundo zakho neebhasari ngesi khanya sinye", "Sheba dithuto tsa hao le dibasari ka nako e le nngwe", "Sien jou kursusse en beurse in een keer", "Sheba dithuto le dibasari ka nako e nngwe"],
        "Add a subject and enter its mark. The form starts blank; use fictional marks only. We send marks only for this course-matching request and do not save them to your account.": ["Engeza isifundo bese ufake imaki yalo. Ifomu linqala lingenalutho; sebenzisa amamaki eqanjiwe kuphela. Sithumela amamaki nalesi sicelo sokuhambisana kwezifundo kuphela futhi siyawagcina ku-akhawunti yakho.", "Yongeza isifundo kwaye ufake inqaku layo. Ifomu iqala licitshe; sebenzisa amanqaku ayimfihlo kuphela. Sithumela amanqaku ngelesi sicelo sokuhambelana kweefundo kuphela kwaye asigcini ngeakhawunti yakho.", "Eketsa thuto mme o keneletsa letshwao la yona. Fomo e qala e se na letho; sebedisa matshwao a boiqapelo feela. Re romela matshwao bakeng sa kopo ena ya ho tshwahanetsa dithuto mme ha re a ba boloka akhaonting ya hao.", "Voeg 'n vak by en voer die punt in. Die vorm begin leeg; gebruik slegs fiktiewe punte. Ons stuur punte slegs vir hierdie kursuspassingsversoek en stoor dit nie in jou rekening nie.", "Oketsa thuto gomme o tsenya mabaka a yona. Sehlogo se thoma o se na selo; šomiša mabaka a bohlatse feela. Re thoromiša mabaka bakeng sa kopelo yeo ya go sepeletšana ga dithuto feela gomme re a boloka."],
        "Courses that fit your marks": ["Izifundo ezihambisana namamaki akho", "Iifundo ezihambelana namanqaku akho", "Dithuto tse tshwanang le matshwao a hao", "Kursusse wat by jou punte pas", "Dithuto tše di tshwana le mabaka a gago"],
        "See every course detail, then update your marks to compare options": ["Bona imininingwane yazo zonke izifundo, bese ubuyekeza amamaki akho ukuze uthelekise izinketho", "Jonga iinkcukacha zonke zesifundo, emva koko uhlaziye amanqaku akho ukuze uthelekise iinketho", "Sheba lintlha tsohle tsa thuto, ebe o ntlafatsa matshwao a hao ho bapisa dikgetho", "Sien elke kursusdetail en werk jou punte by om opsies te vergelyk", "Sheba tsebo ya thuto nngwe le nngwe, gomme o hlafatša mabaka a gago go bapala dikgetho"],
        "Bursaries to look at": ["Imifundaze yokubheka", "Iibhasari zokujonga", "Dibasari tsa ho sheba", "Beurse om na te kyk", "Dibasari tsa go sheba"],
        "See funding and documents": ["Bona uxhaso nemibhalo", "Jonga inkxaso-mali neemaxwebhu", "Sheba tshehetso le ditokomane", "Sien befondsing en dokumente", "Sheba funding le ditokomane"],
        "Set application reminders": ["Hlela izikhumbuzi zezicelo", "Misa iizikhumbuzo zezicelo", "Kgetha dikgopotso tsa dikopo", "Stel aansoekherinneringe in", "Beakanya dikgopole tsa dikopelo"],
        "Plan your budget": ["Hlela isabelomali sakho", "Cwangcisa uhlahlo-lwabiwo mali lwakho", "Rera tekanyetso ya hao", "Beplan jou begroting", "Hlama tekanyetso ya gago"],
        "Create an account": ["Dala i-akhawunti", "Yenza iakhawunti", "Theha akhaonto", "Skep 'n rekening", "Hlagafša akaonto"],
        "Use fictional marks only. Marks are used for this matching request and are kept in this browser tab only to show your results. Guides only; meeting a minimum does not promise a place or funding. Always confirm with the institution or funder.": ["Sebenzisa amamaki eqanjiwe kuphela. Amamaki asetshenziselwa lesi sicelo sokuhambisana futhi agcinwa kule thebhu yesiphequluli kuphela ukuze kukhonjiswa imiphumela yakho. Izinqamuleli kuphela; ukufika esiphakameni asithembisi isikhundla noma uxhaso. Njalo qinisekisa ngesikhungo noma nomxhasi.", "Sebenzisa amanqaku ayimfihlo kuphela. Amanqaku asetyenziselwa le sicelo sokuhambelana kwaye agcinwa kule thebhu yesikhangeli kuphela ukuze kubonakalise iziphumo zakho. Iinkcukachisi kuphela; ukufikelela kwisiphakamene akatsho indawo okanye inkxaso-mali. Ungalibali ukuqinisekisa nomzikel okanye nomxhasi.", "Sebedisa matshwao a boiqapelo feela. Matshwao a sebediswa bakeng sa kopo ena ya ho tshwahanetsa mme a bolokwa tabeng ena ya sebadi feela ho bontsha diphetho tsa hao. Ditataiso feela; ho fihlella bofella bo tlasena ha bo tsosetse sebaka kapa tshehetso. Kamehla netefatsa le setheong kapa moabi.", "Gebruik slegs fiktiewe punte. Punte word vir hierdie passingsversoek gebruik en word slegs in hierdie blaaieroortjie gehou om jou uitslae te wys. Slegs riglyne; om 'n minimum te haal belowe nie 'n plek of befondsing nie. Bevestig altyd by die instansie of befondser.", "Šomiša mabaka a bohlatse feela. Mabaka a šomišwa bakeng sa kopelo yeo ya go sepeletšana gomme a bolokwa thebeng ya seyewelele feela gore go bonagatše dipoelo tša gago. Ditshepeso feela; go fihletša bonyane ga se go tshepo sebakeng goba funding. Kamehla netefatša le lefase goba mohatloli."],

        // Results page
        "These results compare your marks with each course's published minimum requirements.": ["Le miphumela iqathanisa amamaki akho nezidingo eziyisisekelo ezishicilelwe zesifundo ngasinye.", "La miphumo yathelekisa amanqaku akho neemfuno eziyisisekelo ezipapashiweyo zesifundo ngasinye.", "Diphetho tsena bapisa matshwao a hao le ditlhoko tse phatlaladitsweng tsa bofella bo tlasena tsa thuto ka nngwe.", "Hierdie uitslae vergelyk jou punte met elke kursus se gepubliseerde minimumvereistes.", "Dipalo tše di bapala mabaka a gago le ditlhoko tša bonyane tša thuto e nngwe le e nngwe."],
        "Likely:": ["Kungenzeka kakhulu:", "Kunokwenzeka kakhulu:", "Ho ka etsahala:", "Waarskynlik:", "E tla etsahala:"],
        "Possible:": ["Kungenzeka:", "Kunokwenzeka:", "Ho a kgoneha:", "Moontlik:", "E ka tšweletša:"],
        "Unlikely:": ["Akunakwenzeka kakhulu:", "Akunakwenzeka kakhulu:", "Ha ho kgonehe haholo:", "Onwaarskynlik:", "Ha ho kgonehe:"],
        "you meet the checked requirements and are at least 3 APS points above the minimum.": ["uhlangabezana nezidingo ezihlolwayo futhi ungaphezulu nge-3 amaphuzu e-APS ngaphezu okuncane.", "uhlangabezana neemfuno ezicocwayo kwaye ungaphezulu nge-3 amanqaku e-APS ngaphezu kwencinci.", "o fihlella ditlhoko tse hlahlobiloeng mme o ka hodimo ka matshwao a 3 a APS ka hodimo ga bofella bo tlasena.", "jy voldoen aan die nagesiene vereistes en is ten minste 3 APS-punte bo die minimum.", "o fihletša ditlhoko tša bofelo le ho letsa matshwao a 3 a APS ka godimo ga bofella."],
        "you meet the checked requirements but are less than 3 APS points above the minimum.": ["uhlangabezana nezidingo ezihlolwayo kodwa ungaphansi kwezingu-3 zamaphuzu e-APS ngaphezu okuncane.", "uhlangabezana neemfuno ezicocwayo kodwa ungaphantsi kwe-3 amanqaku e-APS ngaphezu kwencinci.", "o fihlella ditlhoko tse hlahlobiloeng empa o ka tlasa ka matshwao a 3 a APS ka hodimo ga bofella bo tlasena.", "jy voldoen aan die nagesiene vereistes maar is minder as 3 APS-punte bo die minimum.", "o fihletša ditlhoko tša bofelo empa o ka tlasa ka matshwao a 3 a APS ka godimo ga bofella."],
        "one or more requirements are not met. Near-miss cards explain the gap and next steps.": ["esinye noma ngaphezulu kwezidingo asihlangazelwanga. Amakhadi asondele ekufinyeleleni achaza umehluko neminyathelo elandelayo.", "enye okanye ngaphezulu kweemfuno azofikelelwanga. Iikhadi ezesondele ekufikeleleni zicacisa umahluko nanyathelo elilandelayo.", "e nngwe kapa tse ding tsa ditlhoko ha di fihlellwa. Dikarata tse haufi le ho fihlella di hlalosa sebopeho le mahato a latelang.", "een of meer vereistes word nie gehaal nie. Amper-daar-kaarte verduidelik die gaping en volgende stappe.", "selo goba tše dingwe tsa ditlhoko ga di fihletšwa. Dikarata tše haufi di hlalosago sebopeho le mahato a latelang."],
        "These labels are guides, not admission promises. Confirm requirements with the institution.": ["Le mibhalo yiziwikiwe kuphela, hhayi izithembiso zokwamukelwa. Qinisekisa izidingo ngomhlangano.", "La mibhalo yiyiinkcukachisi kuphela, hayo isthembiso yokwamkelwa. Qinisekisa iimfuno nomzikel.", "Dilebule ke ditataiso feela, ha se tshepiso ya kamohetso. Netefatsa ditlhoko le setheong.", "Hierdie etikette is riglyne, nie toelatingsbeloftes nie. Bevestig vereistes by die instansie.", "Ditlaleletšo tše ke tšwa tšebo, e sego ditlhwa tsa go amogelwa. Netefatša ditlhoko le lefase."],
        "Review bursaries and the documents they ask for. You can return to your course matches at any time.": ["Bheka imifundaze nemibhalo edingayo. Ungabuyela emuva kuzifundo ezihambisana namamaki akho noma nini.", "Jonga iibhasari neemaxwebhu abazicelayo. Ungabuyela kwiifundo ezihambelanayo nangaliphi ixesha.", "Sheba dibasari le ditokomane tseo li di hlokang. O ka kgutlela dithutong tse tshwanang le matshwao a hao ka nako efe kapa efe.", "Bekyk beurse en die dokumente wat hulle vra. Jy kan enige tyd na jou kursuspassings terugkeer.", "Sheba dibasari le ditokomane tšeo a di hopolago. O ka boelwa dithuto tše di tshwana le mabaka a gago nako le nako."],
        "Labels are a guide only. Always confirm with the institution before applying.": ["Amalebula ayiziwikiwe kuphela. Njalo qinisekisa ngomhlangano ngaphambi kwenkomba.", "Iilebhile ziyiinkcukachisi kuphela. Ungalibali ukuqinisekisa nomzikel ngaphambi kokusenza.", "Dilebule ke ditataiso feela. Kamehla netefatsa le setheong pele o etsa kopo.", "Etikette is slegs 'n riglyn. Bevestig altyd by die instansie voordat jy aansoek doen.", "Ditlaleletšo ke tšwa tšea feela. Kamehla netefatša le lefase pele ga kopelo."],

        // Funding page
        "Check closing dates and tick off the documents you need to gather.": ["Hlola izinsuku zokugcina bese uphawula imibhalo okudinga uziqoqonge.", "Khangela iimihla yokuvala kwaye uphawule eemaxwebhu okufuneka uziqokelele.", "Sheba matsatsi a ho kwala mme o tshwara ditokomane tseo o hlokang ho di bohelisa.", "Kyk sluitingsdatums na en vink die dokumente af wat jy moet bymekaar.", "Sheba matsatsi a go tswa gomme o thibele ditokomane tšeo o swanetšego go di bolela."],
        "Next step: prepare an application": ["Isinyathelo esilandelayo: lungiselela isicelo", "Inyathelo elilandelayo: lungisa isicelo", "Mohato o latelang: lokisetsa kopo", "Volgende stap: berei 'n aansoek voor", "Mohato wa o latelang: rulaganya kopelo"],
        "Use the checklist to review the documents to prepare before applying. Only use fictional data in this app.": ["Sebenzisa uhlu lokuhlola ukuze uhlole imibhalo okufanele ilungiselelwe ngaphambi kwenkomba. Sebenzisa imininingwane eqanjiwe kuphela kulesi sicelo.", "Sebenzisa uluhlu lokukhangela ukuze jonge eemaxwebhu ekufuneka ulungiselele ngaphambi kokudibanisa. Sebenzisa iinkcukacha ezingayonyaniyo kuphela kwi-app.", "Sebedisa lenane la tlhahlobo ho sheba ditokomane tseo o tla di lokisetsa pele o etsa kopo. Sebedisa tsebo ya boiqapelo feela apping ena.", "Gebruik die kontrolelys om die dokumente wat voor die aansoek voorberei moet word te hersien. Gebruik slegs fiktiewe data in hierdie app.", "Šomiša thwi ya go hlahloba go sheba ditokomane tšeo di swanetšego go beakwa pele ga kopelo. Šomiša tsebo ya bohlatse feela sedingwe se."],
        "Open the checklist": ["Vula uhlu lokuhlola", "Vula uluhlu lokukhangela", "Bula lenane la tlhahlobo", "Maak die kontrolelys oop", "Bula thwi ya go hlahloba"],
        "Document checklist ticks are saved in this browser only and are not linked to your account.": ["Amamaki ohlwini lwemibhalo ayagcinwa kulesi siphequluli kuphela futhi awaxhunyaniswa ne-akhawunti yakho.", "Amamaki oluhlwini lwamaxwebhu ayagcinwa kulo mkhangeli kuphela kwaye awaxhunyaniswa neakhawunti yakho.", "Maswana a lenane la ditokomane a bolokwa sebedisweng sena feela mme ha a amahelelanwa le akhaonto ya hao.", "Kontrolelys-vinkies vir dokumente word slegs in hierdie blaaier gestoor en is nie aan jou rekening gekoppel nie.", "Thwi ya ditokomane di bolokwa seyewelele se feela gomme ga di amahelelana le akaonto ya gago."],
        "Funding details may change; confirm requirements and dates with the funder before applying.": ["Imininingwane yoxhaso ingashintsha; qinisekisa izidingo nomhla ngaphambi kwenkomba.", "Iinkcukacha zenkxaso-mali zinokutshintsha; qinisekisa iimfuno neemihla ngaphambi kokusenza.", "Lintlha tsa tshehetso di ka fetoha; netefatsa ditlhoko le matsatsi pele o etsa kopo.", "Befondsingsbesonderhede kan verander; bevestig vereistes en datums by die befondser voordat jy aansoek doen.", "Ditaba tša funding di ka fetoga; netefatša ditlhoko le matsatsi le mohatloli pele ga kopelo."],

        // Calendar page
        "Keep on track": ["Hlala emgqameni", "Hlala emgaqeni", "Tsamaisetsa pele tsela", "Bly op koers", "Dula mo tsela"],
        "Plan dates for applications and next steps. Reminders stay in this browser until you export them.": ["Hlela amohlala wezinsuku zezicelo neminyathelo elandelayo. Izikhumbuzi zihlala kulesi siphequluli kuze uzivumele.", "Cwangcisa iimihla zezicelo nanyathelo elilandelayo. Iizikhumbuzo zihihlala kulo mkhangeli de uzithumele ngaphandle.", "Rera matsatsi a dikopo le mahato a latelang. Dikgopotso di lula sebedisweng sena ho fihla o di romella.", "Beplan datums vir aansoeke en volgende stappe. Herinneringe bly in hierdie blaaier totdat jy hulle uitvoer.", "Hlama matsatsi a dikopelo le mahato a latelago. Dikgopolo di dula seyewelele se go fihla o di rometša."],
        "Calendar": ["Ikhalenda", "Ikhalenda", "Khalendara", "Kalender", "Kalendara"],
        "What would you like to remember?": ["Ufuna ukukhumbula ini?", "Ufuna ukukhumbula ntoni?", "O batla ho gopola sefe?", "Wat wil jy onthou?", "O batla go gopola eng?"],
        "Prepare application documents": ["Lungiselela imibhalo yezicelo", "Lungisa iimaxwebhu ezicelo", "Lokisetsa ditokomane tsa kopo", "Berei aansoekdokumente voor", "Rulaganya ditokomane tsa kopelo"],
        "Check application status": ["Hlola isimo sesicelo", "Jonga imeko yesicelo", "Sheba boemo ba kopo", "Kyk aansoekstatus na", "Hlahloba boemo bja kopelo"],
        "Review course requirements": ["Bheka izidingo zezifundo", "Jonga iimfuno zesifundo", "Sheba ditlhoko tsa thuto", "Hersien kursusvereistes", "Lekola ditlhoko tsa thuto"],
        "Contact the funding office": ["Xhumana nehhovisi loxhaso", "Dibana neofisi yenkxaso-mali", "Ikonnecte leofisi ya tshehetso", "Kontak die befondsingskantoor", "Ikgokaganya le ofisi ya funding"],
        "Reminder date": ["Umhla wesikhumbuzi", "Umhla weskhangso", "Letsatsi la kgopotso", "Herinneringsdatum", "Letšatši la kgopolo"],
        "Add a closing date to your calendar. Always confirm deadlines on the official funder website.": ["Engeza umhla wokugcina kukhalenda yakho. Njalo qinisekisa izinsuku zokugcina kusayithi esemthethweni somxhasi.", "Yongeza umhla wokuvala kwi khalenda yakho. Ungalibali ukuqinisekisa iimihla yokuvala kwi-website esemthethweni yomboneleli.", "Eketsa letaletsatsi la ho kwala khalendareng ya hao. Kamehla netefatsa matshwao a ho felloa ke nako websaeteng ya semmuso ya moabi.", "Voeg 'n sluitingsdatum by jou kalender. Bevestig altyd sperdatums op die amptelike befondserwebwerf.", "Oketsa letšatši la go tswa kalendareng ya gago. Kamehla netefatša matsatsi a kopelo websaeteng ya semmušo ya mohatloli."],
        "Loading funding deadlines…": ["Ilayisha izinsuku zokugcina zoxhaso…", "Iyalayisha iimihla yokuvala yenkxaso-mali…", "E ya laolla matsatsi a ho felloa ke nako a tshehetso…", "Laai befondsingssperdatums…", "Go feta funding deadlines…"],
        "Export downloads an .ics file that you can import into Google Calendar, Apple Calendar, or Outlook. Notifications depend on that calendar app.": ["Ukukhipha kulanda ifayela le-.ics ongalithumela ku-Google Calendar, Apple Calendar, noma i-Outlook. Izaziso zithembela ku-app yekhalenda.", "Ukuthumela ngaphandle kikhohliwa ifayile ye-.ics ongayenza kwi-Google Calendar, i-Apple Calendar, okanye i-Outlook. Iisaziso zixhomekeke kwi-app yekhalenda.", "Ho ntsha ha jarolla faele ya .ics eo o ka e kenya Google Calendar, Apple Calendar, kapa Outlook. Ditsebiso di itshetlehile apping eo ya khalendara.", "Uitvoer laai 'n .ics-lêer af wat jy in Google Calendar, Apple Calendar of Outlook kan invoer. Kennisgewings hang af van daardie kalender-app.", "Kgatiso e akaretša faele ya .ics eo o ka e kenya Google Calendar, Apple Calendar, goba Outlook. Ditsebiso di itshetlehile apping ya kalendara eo."],
        "Privacy: reminders are stored only in this browser on this device. They are not linked to a learner identity or sent to Ukhanyiso. Use generic reminder choices; do not put personal details in calendar entries.": ["Obumfihlo: izikhumbuzi zigcinwa kulesi siphequluli kuphela kule divayisi. Azixhunyaniswa nomazisi wemfundi futhi azithunyelwa ku-Ukhanyiso. Sebenzisa izinketho zezikhumbuzi ezivamile; ungafaki imininingwane yangokwemvelo kuma-okhwe khalenda.", "Ubucwali: iizikhumbuzo zigcinwa kulo mkhangeli kuphela kule iveyile. Azixhunyaniswa ngesazisi sofundo kwaye azithunyelwa kwi-Ukhanyiso. Sebenzisa iinketho zezikhumbuzo eziqhelekileyo; musa ukufaka iinkcukacha zangasese kwiindawo zekhalenda.", "Boinoni: dikgopotso di bolokwa sebedisweng sena feela sethaleng sena. Ha di amahelelanwa le boitshepho ba moithuti kapa di romellwa Ukhanyiso. Sebedisa dikgetho tsa kgopotso tse akaretsang; o se ke wa kenya dintlha tsa boikemelo hang tsakhalendareng.", "Privaatheid: herinneringe word slegs in hierdie blaaier op hierdie toestel gestoor. Hulle is nie aan 'n leerder-identiteit gekoppel of na Ukhanyiso gestuur nie. Gebruik generiese herinneringskeuses; moenie persoonlike besonderhede in kalenderinskrywings plaas nie.", "Boinotši: dikgopolo di bolokwa seyewelele se sethaleng se. Ga di amahelelana le boitshepho bja moithuti goba di thoromišwa Ukhanyiso. Šomiša dikgetho tsa kgopolo tša akaretsang; o se ke wa tsenya ditaba tsa boikemelo tsakalendareng."],
        "Sun": ["Son", "Cwa", "Tš", "So", "Lam"],
        "Mon": ["Mso", "Vul", "Ma", "Ma", "Tlaba"],
        "Tue": ["Sin", "Chw", "La", "Di", "Laba"],
        "Wed": ["Ler", "Cul", "La", "Wo", "Laba"],
        "Thu": ["Ne", "Ciw", "La", "Do", "Labone"],
        "Fri": ["Ngu", "Coy", "La", "Vr", "Lahlabola"],
        "Sat": ["Mgu", "Cul", "Mo", "Sa", "Mokibelo"],

        // Plan page
        "Stay funded": ["Hlala uxhasiwe", "Hlala unenkxaso-mali", "Dula o tshehetswe", "Bly gefinansieer", "Dula o šomišwa"],
        "Your Financial Plan": ["Uhlelo lwakho lwezimali", "Ucwangciso-mali lwakho", "Moralo wa hao wa ditjhelete", "Jou finansiële plan", "Mohlami wa gago wa Madi"],
        "Plan your monthly funding, living costs and the money you need before your first payout. Use fictional figures only. Calculations run in this browser; your entries are not sent to the server or saved.": ["Hlela uxhaso lwakho lwanyanga zonke, izindleko zokuphila nemali oyidingayo ngaphambi kokukhokhwa kwakho kokuqala. Sebenzisa izinombolo eqanjiwe kuphela. Ukubala kwenze kulesi siphequluli; okufakiwe akuthunyelwa kuseva futhi akugcinwa.", "Cwangcisa inkxaso-mali yakho ngenyanga, iindleko zokuphila kunye nemali oyifunayo ngaphambi kwentlawulo yakho yokuqala. Sebenzisa amanani ayimfihlo kuphela. Iibhalo zenzeka kulo mkhangeli; iiyentso zakho azithunyelwa kwiseva okanye zagcinwa.", "Rera tshehetso ya hao ya kgwedi le kgwedi, ditshenyehelo tsa ho phela le tjhelete eo o e hlokang pele ha tefello ya hao ya pele. Sebedisa dinomoro tsa boiqapelo feela. Pego di etseha sebedisweng sena; tsa hao tsa kena ha di romellwe seva kapa di bolokwa.", "Beplan jou maandelikse befondsing, lewenskoste en die geld wat jy nodig het voor jou eerste uitbetaling. Gebruik slegs fiktiewe syfers. Berekeninge loop in hierdie blaaier; jou invoer word nie na die bediener gestuur of gestoor nie.", "Hlama madi a gago a kgwedi, ditshenyehelo tša go phela le madi o a hlokago pele ga tefelo ya gago ya pele. Šomiša dipalo tša bohlatse feela. Dipalo di dira seyewelele se; tšhupetso ya gago ga e thoromišwa goba e bolokwa."],
        "Funding you receive each month (R)": ["Uxhaso olutholayo unyanga nomnyanga (R)", "Inkxaso-mali oyifumenayo ngenyanga (R)", "Tshehetso eo o e amohelang kgwedi le kgwedi (R)", "Befondsing wat jy elke maand ontvang (R)", "Funding o e amohelang kgwedi le kgwedi (R)"],
        "Months funded this year": ["Amanyanga axhasiwe ngakulo nyaka", "Iinyanga ezinxhasiweyo ngakulo nyaka", "Dikgwedi tse tshehetsweng selemong sena", "Maande gefinansieer vanjaar", "Dikgwedi tše di funding selemong se"],
        "Average you must keep to renew (%)": ["Isilinganiso okufanele usigcine ukuze uphinde uxhaswe (%)", "Isiqingatha okufuneka usigcine ukuze uphinde uxhaswe (%)", "Karolelano eo o lokelang ho e boloka ho ntlafatsa (%)", "Gemiddelde wat jy moet behou om te hernu (%)", "Karolelano o swanetše go boloka go ntšha (%)"],
        "Your current average (%)": ["Isilinganiso sakho samanje (%)", "Isiqingatha sakho sangoku (%)", "Karolelano ya hao ya hona joale (%)", "Jou huidige gemiddelde (%)", "Karolelano ya gago ya go šoma (%)"],
        "What your bursary is worth for the year (R)": ["Inani lezifundo zakho zonyaka (R)", "Inani le-bursary yakho ngonyaka (R)", "Boholo ba dibasari ya hao ka selemo (R)", "Wat jou beursie vir die jaar werd is (R)", "Dibasari ya gago e leka eng selemong (R)"],
        "Start-up costs before funding arrives (R): registration, deposit, books and travel": ["Izindleko zokuqala ngaphambi kokufika koxhaso (R): ukubhalisa, idiphozithi, izincwadi kanye nokuhamba", "Iindleko zokuqala ngaphambi kokufika kwenkxaso-mali (R): kubhaliswa, idipozithi, iincwadi kunye nohamba", "Litshenyehelo tsa ho qala pele ha tshehetso e fihla (R): ngoliso, tefelo, buka le ho tsamaea", "Opstartkoste voordat befondsing aankom (R): registrasie, deposito, boeke en reis", "Ditshenyehelo tša mathomo pele ga funding e fihla (R): ngwalollo, tefelo, dibuka le leeto"],
        "Weeks until your first payout": ["Amaviki kuze ukhokhwe kokuqala", "Iiveki de entlawulo yakho yokuqala", "Dibeke ho fihlela tefello ya hao ya pele", "Weke tot jou eerste uitbetaling", "Dibeke go fihla tefelo ya gago ya pele"],
        "Accommodation": ["Indawo yokuhlala", "Indawo yokuhlala", "Bolulo", "Verblyf", "Bolelo"],
        "Food": ["Ukudla", "Ukutya", "Lijo", "Kos", "Kgogo"],
        "Transport": ["Ezokuhamba", "Ezothutho", "Palamente", "Vervoer", "Sepalamaragelwi"],
        "Data and airtime": ["Idatha nomkhomaze e-wethi", "Idatha kunye ne-airtime", "Data le airtime", "Data en lugtyd", "Data le sego"],
        "Other expenses": ["Ezinye izindleko", "Ezinye iindleko", "Litshenyehelo tse ling", "Ander uitgawes", "Ditshenyehelo tše dingwe"],
        "Calculate my financial plan": ["Bala uhlelo lwami lwezimali", "Bala ucwangciso-mali yam", "Pego ya moralo wa ditjhelete ya ka", "Bereken my finansiële plan", "Bala mohlami wa madi wa ka"],
        "This is a planning aid, not financial advice. Renewal rules differ between funders, so confirm your requirements with your funding provider. Use fictional figures only. This page does not send or save your entries.": ["Lesi yithuluzi lokuhlela, hhayi iseluleko sezimali. Imithetho yokuvuselela iyehluka phakathi koma-bukeli, ngakho qinisekisa izidingo zakho ngomhlinzeki woxhaso. Sebenzisa izinombolo eqanjiwe kuphela. Le page ayithumeli noma ayigcini okufakiwe.", "Lolu lutyalo-mqatho lolawulo, hayi iseluleko sezimali. Imithetho yokuvuselela iyahluka phakathi kweziboneleli, ngakho qinisekisa iimfuno zakho kumboneleli wenkxaso-mali. Sebenzisa amanani ayimfihlo kuphela. Le iphepha alithumeli okanye ayigcini iiyentso zakho.", "Ena ke sesebediswa sa moralo, ha se keletso ya ditjhelete. Melaetana ya ho ntshafatsa e fapana pakeng tsa baabi, kahoo netefatsa ditlhoko tsa hao le mohambi wa tshehetso ya hao. Sebedisa dinomoro tsa boiqapelo feela. Leqephe lena ha le romelle kapa le boloke tsa kena.", "Dit is 'n beplanningshulp, nie finansiële advies nie. Hernuwingreëls verskil tussen fondse, so bevestig jou vereistes by jou befondsingsverskaffer. Gebruik slegs fiktiewe syfers. Hierdie bladsy stuur nie of stoor nie jou invoer.", "Se ke sesebediswa sa mohlami, e sego mohlalawetši wa madi. Melaetana ya boikgogomuso e fapana magareng ga bofelo, kahoo netefatša ditlhoko tša gago le moatlelela wa funding ya gago. Šomiša dipalo tša bohlatse feela. Letlakela le ga le thoromišwe goba le bolokwe."],

        // Checklist page
        "Your account": ["I-akhawunti yakho", "Iakhawunti yakho", "Akhaonto ya hao", "Jou rekening", "Akaonto ya gago"],
        "Tick each step as you finish it. Progress is saved to your account. Use sample information only; do not enter real personal details or documents.": ["Phawula isinyathelo ngasinye ngendlela oqeda ngayo. Intuthuko igcinwa ku-akhawunti yakho. Sebenzisa imininingwane yesibonelo kuphela; ungafaki imininingwane yangempela yangokwemvelo noma imibhalo.", "Phawula inyathelo ngalinye xa uligqibile. Inkqubela igcinwa kwiakhawunti yakho. Sebenzisa iinkcukacha zesampulu kuphela; ungafaki iinkcukacha zangasese zangokwenyani okanye amaxwebhu.", "Tshwa mohato ka o mong ha o o qetile. Tsoelo-pele e bolokwa akhaonting ya hao. Sebedisa tsebo ya mohlala feela; o se ke wa kenya dintlha tsa nnete tsa boitsebiso kapa ditokomane.", "Vink elke stap af soos wat jy dit voltooi. Vordering word in jou rekening gestoor. Gebruik slegs voorbeeldinligting; moenie werklike persoonlike besonderhede of dokumente invoer nie.", "Tshwaraganya mohato o mongwe le o mongwe ge o o phethile. Tsoelo-pele e bolokwa akaontong ya gago. Šomiša tsebo ya mohlala feela; o se ke wa tsenya ditaba tsa bohlatse tša nnete goba ditokomane."],

        // Account page
        "About you": ["Mayelana nawe", "Mayelana nawe", "Mabapi le wena", "Oor jou", "Ka wena"],
        "First name, surname and email are required. They are used to personalise your reminders and checklist. They stay in your account on this app's database and are never sold or shared.": ["Igama lokuqala, isibongo kanye nangekheli le-imeyili kuyadingeka. Asetshenziselwa ukwenza izikhumbuzi zakho kanye nohlu lwakho lokuhlola lwengqondo. Agcina ku-akhawunti yakho kusizindalwazi salesi sicelo futhi awadayiswa noma awabelwa naye.", "Igama lokuqala, isibongo kunye nedilesi ye-imeyili ziyafuneka. Zisetyenziselwa ukwenza iizikhumbuzo zakho kunye nohlobo lwakho lokukhangela zizigqibo. Zihlala kwiakhawunti yakho kwi-database yale app kwaye azithengwa okanye zawabelwana nazo.", "Lebitso la pele, fane le aterese ya imeyili di hloka. Di sebediswa ho etsa dikgopotso tsa hao le lenane la hao la tlhahlobo ho mamarelana. Di lula akhaonting ya hao database ya app ena mme ha di boleiswa kapa di abelanwa.", "Voornaam, van en e-pos is vereis. Hulle word gebruik om jou herinneringe en kontrolelys te personaliseer. Hulle bly in jou rekening in hierdie app se databasis en word nooit verkoop of gedeel nie.", "Leina la mathomo, fa le imeyili a hloka. A šomišwa go etsa dikgopolo tša gago le thwi ya go hlahloba ya gago. A dula akaontong ya gago database ya sedingwe se gomme ga se thekwa goba ga a pegiwa."],
        "Your account uses your email address. Please complete all of the details below to continue. Ukhanyiso never asks for an ID or exam number.": ["I-akhawunti yakho isebenzisa ikheli lakho le-imeyili. Sicela ugcwalise wonke imininingwane ngenzansi ukuze uqhubeke. I-Ukhanyiso ayisoze icela inombolo kamazisi noma yokuhlolwa.", "Iakhawunti yakho isebenzisa idilesi yakho ye-imeyili. Nceda uzeledise onke iinkcukacha ngezantsi ukuze uqhubeke. I-Ukhanyiso ayisoze icele inombolo yesazisi okanye yoviwo.", "Akhaonto ya hao e sebedisa aterese ya hao ya imeyili. Ka kopo qetella dintlha tsohle tse ka tlase ho tsoela pele. Ukhanyiso ha e kake e kopa nomoro ya ID kapa ya tlhahlobo.", "Jou rekening gebruik jou e-posadres. Vul asseblief al die besonderhede hieronder in om voort te gaan. Ukhanyiso vra nooit 'n ID- of eksamennommer nie.", "Akaonto ya gago e šomiša aterese ya imeyili ya gago. Ka kgopolo phetha tsa botihokwa tša tla la mo go tsoelago pele. Ukhanyiso ga se a tsopa bobedi goba palo ya go hlahloba."],
        "First name": ["Igama lokuqala", "Igama lokuqala", "Lebitso la pele", "Voornaam", "Leina la pele"],
        "Surname": ["Isibongo", "Isibongo", "Fane", "Van", "Fane"],
        "Email for reminders": ["I-imeyili yezikhumbuzi", "I-imeyili yeezikhumbuzo", "Imeyili ya dikgopotso", "E-pos vir herinneringe", "Imeyili ya dikgopolo"],
        "Used only if you ask for reminder emails. Ukhanyiso does not send marketing mail.": ["Kusetshenziswa kuphela uma ucela ii-imeyili zezikhumbuzi. I-Ukhanyiso ayithumeli imeyili yokumaketha.", "Isetyenziswa kuphela ukuba ucele ii-imeyile zezikhumbuzo. I-Ukhanyiso ayithumeli imeyile yentengiso.", "E sebediswa feela ha o kopa imeyili ya dikgopotso. Ukhanyiso ha e romele imeyili ya papatso.", "Word slegs gebruik as jy herinnering-e-posse aanvra. Ukhanyiso stuur geen bemarkingspos nie.", "E šomišwa feela ge o kopanya imeyili ya dikgopolo. Ukhanyiso ga se thoromele imeyili ya go gola."],
        "WhatsApp number (optional)": ["Inombolo ye-WhatsApp (yokukhetha)", "Inombolo ye-WhatsApp (ongayikhetha)", "Nomoro ya WhatsApp (boikhethelo)", "WhatsApp-nommer (opsioneel)", "Palo ya WhatsApp (boikhethelo)"],
        "Digits only, a leading + is fine. Only fill this in if you want WhatsApp reminders.": ["Izinombolo kuphela, i-plusi eqalayo iyakhululeka. Gcwalisa lokhu kuphela uma ufuna izikhumbuzi ze-WhatsApp.", "Amanani kuphela, i-plusi eqalayo iyakulunga. Zalisa le nto kuphela ukuba ufuna iizikhumbuzo ze-WhatsApp.", "Dinomoro feela, tse hlakang tsa plus di lokile. Kenya sena feela ha o batla dikgopotso tsa WhatsApp.", "Slegs syfers, 'n voorvoegsel + is goed. Vul dit slegs in as jy WhatsApp-herinneringe wil hê.", "Dinomoro feela, tše hlakang tsa plus di lokile. Kenya se feela ge o batla dikgopole tša WhatsApp."],
        "Send me WhatsApp reminders about my application dates": ["Thumela izikhumbuzi ze-WhatsApp mayelana nemihla yami yezicelo", "Thumela iizikhumbuzo ze-WhatsApp ngemihla yam yezicelo", "Nthomelle dikgopotso tsa WhatsApp ka matsatsi a ka a dikopo", "Stuur my WhatsApp-herinneringe oor my aansoekdatums", "Mphiše dikgopole tša WhatsApp ka matsatsi a dikopelo tša ka"],
        "Completely your choice. Tick this box and add your number above if you want a WhatsApp message when a reminder date is close. Leave it unticked and we will never message you.": ["Kukhetha kwakho ngokuphelele. Phawula lebhokisi bese wengeza inombolo yakho ngenzansi uma ufuna umyalezo we-WhatsApp lapho umhla wesikhumbuzi usuqondile. Yishiye ungaphawulile futhi ngeke sikuthumele umyalezo.", "Ngokupheleleyo ukhetho lwakho. Khangela le bhokisi kwaye wongeze inombolo yakho ngezantsi ukuba ufuna umyalezo we-WhatsApp xa umhla wesikhumbuzi sisondele. Yishiye ungakhangelwanga kwaye asizukuthumela umyalezo.", "Ka ho feletseng kgetho ya hao. Tshwa lebokose lena mme o eketsa nomoro ya hao ka tlase ha o batla molaetsa wa WhatsApp ha letsatsi la kgopotso le haufi. E tlogele e sa tshwailoa mme re tla o romeletsa molaetsa ka ho se ho feela.", "Heeltemal jou keuse. Vink hierdie boks af en voeg jou nommer hieronder by as jy 'n WhatsApp-boodskap wil hê wanneer 'n herinneringsdatum naby is. Laat dit leeg en ons sal jou nooit boodskappe stuur nie.", "Ka motheo ke kgetho ya gago. Tshwara lebokose le gomme o oketsa nomoro ya gago tla ge o batla molaetsa wa WhatsApp ge letšatši la kgopolo le haufi. E tlogela e se tshwailoa gomme re ka se o romeletsa molaetsa."],
        "Save profile": ["Gcina iphrofayela", "Gcina iprofayile", "Boloka boemo", "Stoor profiel", "Boloka sebopego"],
        "Reminders on this device": ["Izikhumbuzi kule divayisi", "Iizikhumbuzo kule siveli", "Dikgopotso sethaleng sena", "Herinneringe op hierdie toestel", "Dikgopolo sethaleng se"],
        "Checking this browser…": ["Ihlola lesi siphequluli…", "Iyakhangela lo mkhangeli…", "E hlahloba sebediswa sena…", "Hierdie blaaier word nagegaan…", "Hlahloba seyewelele se…"],
        "Manage reminders": ["Lawula izikhumbuzi", "Lawula iizikhumbuzo", "Laola dikgopotso", "Bestuur herinneringe", "Hlophisa dikgopolo"],
        "Reminders are saved in this browser only. They are not linked to your account or sent to Ukhanyiso.": ["Izikhumbuzi zigcinwa kulesi siphequluli kuphela. Azixhunyaniswa ne-akhawunti yakho noma azithunyelwa ku-Ukhanyiso.", "Iizikhumbuzo zigcinwa kulo mkhangeli kuphela. Azixhunyaniswa neakhawunti yakho okanye azithunyelwa kwi-Ukhanyiso.", "Dikgopotso di bolokwa sebedisweng sena feela. Ha di amahelelanwa le akhaonto ya hao kapa di romellwa Ukhanyiso.", "Herinneringe word slegs in hierdie blaaier gestoor. Hulle is nie aan jou rekening gekoppel of na Ukhanyiso gestuur nie.", "Dikgopolo di bolokwa seyewelele se feela. Ga di amahelelana le akaonto ya gago goba di thoromišwa Ukhanyiso."],
        "Continue your study journey": ["Qhubeka nohambo lwakho lwezemfundo", "Qhubeka nohambo lwakho lwezemfundo", "Tsoela-pele le leeto la hao la thuto", "Gaan voort met jou studiereis", "Tšwela pele leeto la gago la thuto"],
        "Enter or update marks": ["Faka noma buyekeza amamaki", "Faka okanye uhlaziye amanqaku", "Kenyetsa kapa ntlafatsa matshwao", "Voer of werk punte by", "Kenya goba hlafatša mabaka"],
        "Review course results": ["Bheka imiphumela yezifundo", "Jonga iziphumo zezifundo", "Sheba diphetho tsa dithuto", "Bekyk kursusuitslae", "Lekola dipoelo tsa dithuto"],
        "Check funding information and sources": ["Hlola imininingwane nemithombo yoxhaso", "Khangela iinkcukacha kunye neemvelaphi zenkxaso-mali", "Hlahloba tsebo le mehlodi ya tshehetso", "Kyk befondsingsinligting en bronne na", "Hlahloba tsebo le mehlodi ya funding"],
        "Review your application checklist": ["Bheka uhlu lwakho lokuhlola izicelo", "Jonga uluhlu lwakho lokukhangela iizicelo", "Sheba lenane la hao la tlhahlobo ya dikopo", "Hersien jou aansoekkontrolelys", "Lekola thwi ya gago ya go hlahloba ya dikopelo"],
        "Open the financial planner": ["Vula umhlinzeki wezimali", "Vula umcwangcisi wemali", "Bula morero wa ditjhelete", "Maak die finansiële beplanner oop", "Bula mohlami wa madi"],

        // Login page
        "Email": ["I-imeyili", "I-imeyili", "Imeyili", "E-pos", "Imeyili"],
        "Enter the email and password you used when you signed up. Do not enter an ID or exam number.": ["Faka i-imeyili nephasiwedi osayisebenzisa lokhu ubhalisa. Ungafaki inombolo kamazisi noma yokuhlolwa.", "Faka i-imeyili nephasiwedi owazisebenzisileyo xa ubhalisa. Ungafaki inombolo yesazisi okanye yoviwo.", "Kenyetsa imeyili le phasewete oo o di sebedisitseng ha o ingolisa. O se ke wa kenya nomoro ya ID kapa ya tlhahlobo.", "Voer die e-pos en wagwoord in wat jy gebruik het toe jy geregistreer het. Moenie 'n ID- of eksamennommer invoer nie.", "Kenya imeyili le lentšuphetšo o di šomišitšego ge o ingodišiwa. O se ke wa tsenya bobedi goba palo ya go hlahloba."],
        "Do not enter an ID or exam number.": ["Ungafaki inombolo kamazisi noma yokuhlolwa.", "Ungafaki inombolo yesazisi okanye yoviwo.", "O se ke wa kenya nomoro ya ID kapa ya tlhahlobo.", "Moenie 'n ID- of eksamennommer invoer nie.", "O se ke wa tsenya bobedi goba palo ya go hlahloba."],
        "Use at least 12 characters.": ["Sebenzisa okungenani izimpawdu-12.", "Sebenzisa ubuncinane iintlobo-12.", "Sebedisa bonyane ditlhaka tse 12.", "Gebruik ten minste 12 karakters.", "Šomiša bonyane ditlhaka tše 12."],

        // Signup page
        "Sign up with your email address and a unique password. You will add your personal details on the next page. Do not reuse a password from another account. Do not enter an ID or exam number.": ["Bhalisa ngekheli lakho le-imeyili nephasiwedi eyingqayizivele. Uzofaka imininingwane yakho yangokwemvelo ekinini elilandelana. Ungaphinde usebenzise iphasiwedi enye ye-akhawunti enye. Ungafaki inombolo kamazisi noma yokuhlolwa.", "Bhalisa ngedilesi yakho ye-imeyili nephasiwedi eyahlukileyo. Uza kufaka iinkcukacha zakho zangasese kwiphepha elilandelayo. Ungaphinde usebenzise iphasiwedi yeakhawunti enye. Ungafaki inombolo yesazisi okanye yoviwo.", "Ingolisa ka aterese ya hao ya imeyili le phasewete e ikgethang. O tla kena dintlha tsa hao tsa boikemelo leqepheng le latelang. O se ke wa sebedisa phasewete ya akhaonto e nngwe. O se ke wa kenya nomoro ya ID kapa ya tlhahlobo.", "Registreer met jou e-posadres en 'n unieke wagwoord. Jy sal jou persoonlike besonderhede op die volgende bladsy byvoeg. Gebruik nie 'n wagwoord van 'n ander rekening weer nie. Moenie 'n ID- of eksamennommer invoer nie.", "Ingodišiwa ka aterese ya imeyili ya gago le lentšupetšo ya tsa gabotse. O tla oketsa ditaba tsa gago tsa bohlatse letlakeleng la go latelago. O se ke wa šomiša lentšupetšo ya akaonto e nngwe. O se ke wa tsenya bobedi goba palo ya go hlahloba."],
        "Your email is your username. You will log in with it, and it is also used if you need to reset your password.": ["I-imeyili yakho yigama lakho lomsebenzisi. Uzongena ngayo, futhi iyasetyenziswa noma ufuna ukusetha kabusha iphasiwedi yakho.", "I-imeyili yakho yigama lakho lomsebenzisi. Uza kungena ngayo, kwaye isetyenziswa xa ufuna ukuseta kwakhona iphasiwedi yakho.", "Imeyili ya hao ke lebitso la hao la mosebedisi. O tla kena ka yona, mme e sebediswa hape ha o hloka ho reset phasewete ya hao.", "Jou e-pos is jou gebruikersnaam. Jy sal daarmee aanteken, en dit word ook gebruik as jy jou wagwoord moet hersit.", "Imeyili ya gago ke leina la mošomi wa gago. O tla log in ka yona, gomme e šomišwa hape ge o hloka go hlagofša lentšupetšo ya gago."],
        "Use 12–128 characters. A unique passphrase is okay; no special symbol is required. Do not reuse another account’s password.": ["Sebenzisa izimpawdu ezingu-12–128. Umusho wokudlula ongahleli ungangiwe; akudingekile isimbukisi esikhethekile. Ungaphinde usebenzise iphasiwedi ye-akhawunti enye.", "Sebenzisa iintlobo ezili-12–128. Umyalezo ongahleli ongahleli ulungile; asikho isimbukisi esikhethekileyo esifunekayo. Ungaphinde usebenzise iphasiwedi yeakhawunti enye.", "Sebedisa ditlhaka tse 12–128. Mokgwa o ikgethang wa ho feta o lokile; ha ho tshwailo e khethehileng e hlokahalang. O se ke wa sebedisa phasewete ya akhaonto e nngwe.", "Gebruik 12–128 karakters. 'n Unieke wagsin is ok; geen spesiale simbool is nodig nie. Gebruik nie 'n ander rekening se wagwoord weer nie.", "Šomiša ditlhaka tše 12–128. Mokgwa wa go feta wa tsa gabotse o lokile; ga se go tshwana sa go sepelela go hloka. O se ke wa šomiša lentšupetšo ya akaonto e nngwe."],
        "Create account": ["Dala i-akhawunti", "Yenza iakhawunti", "Theha akhaonto", "Skep rekening", "Hlagafša akaonto"],
        "Locally, your account and checklist progress are saved in a database file on this computer; hosted accounts persist only when the app is configured with a persistent database. Do not enter an ID or exam number.": ["Endaweni, i-akhawunti yakho kanye nentuthuko yohlu lokuhlola kugcinwa kufayela ledatabase kukhompiyutha; i-akhawunti ezihlanganiswe kuseva zigcina kuphela uma uhlelo lolawulo loluphawu lulungiselele idatabase ephithizayo. Ungafaki inombolo kamazisi noma yokuhlolwa.", "Endaweni, iakhawunti yakho kunye nenkqubela yoluhlu lokukhangela kugcinwa kwi-file ye-database kwikhompyuter; ii-akhawunti ezikhuselweyo zigcina kuphela xa i-app ilungiselelwe idatabase exhomesheleyo. Ungafaki inombolo yesazisi okanye yoviwo.", "Ka lehae, akhaonto ya hao le tsoelo-pele ya lenane la tlhahlobo di bolokwa faeleng ya database khomphuteng ena; diakhaonto tse bolokiloeng di lula feela ha app e lokisetswa le database e tsamaisang. O se ke wa kenya nomoro ya ID kapa ya tlhahlobo.", "Lokaal word jou rekening en kontrolelys-vordering in 'n databasislêer op hierdie rekenaar gestoor; gehuisvese rekeninge bly slegs bewaar as die app met 'n volhoubare databasis opgestel is. Moenie 'n ID- of eksamennommer invoer nie.", "Sefelingo, akaonto ya gago le tsoelo-pele ya thwi ya go hlahloba di bolokwa faeleng ya database khomphuteng ye; diakaonto tše bolokiloeng di lula feela ge sedingwa se beakanyetšwe le database ya go tšwelela. O se ke wa tsenya bobedi goba palo ya go hlahloba."],

        // Study plan page
        "Make time for learning": ["Thola isikhathi sokufunda", "Thatha ixesha lokufunda", "Fana nako ea ho ithuta", "Maak tyd vir leer", "Beakanya nako ya go ithuta"],
        "Build a simple weekly plan around your subjects, available time, and confidence.": ["Akha uhlelo lwevikhi elilula ngokwezifundo zakho, isikhathi esitholakalayo, nokuzethemba.", "Yakha isicwangciso seveki elula ngokwezifundo zakho, ixesha elikhoyo, nokuzithemba.", "Aha moralo oa beke o bonolo ho pota dithuto tsa hao, nako e teng, le boitlhalo.", "Bou 'n eenvoudige weeklikse plan rondom jou vakke, beskikbare tyd en selfvertroue.", "Hlama mohlami wa beke o bonolo go pota dithuto tša gago, nako e le teng, le boitlhalo."],
        "Your grade": ["Ibanga lakho", "Ibanga lakho", "Kereiti ya hao", "Jou graad", "Madingwa a gago"],
        "Choose your grade": ["Khetha ibanga lakho", "Khetha ibanga lakho", "Kgetha kereiti ya hao", "Kies jou graad", "Kgetha madingwa a gago"],
        "Your subjects": ["Izifundo zakho", "Izifundo zakho", "Dithuto tsa hao", "Jou vakke", "Dithuto tša gago"],
        "Add each subject and choose how confident you feel. Topic is optional.": ["Engeza isifundo ngasinye bese ukhetha ukuzethemba kwakho. Isihloko siyakhetha.", "Yongeza isifundo ngalinye kwaye ukhethe indlela ozithemba ngayo ngalo. Isihloko siyakhetheka.", "Eketsa thuto ka nngwe mme o kgethe hoo o ikarabela ka eona. Sehlooho ke boikhethelo.", "Voeg elke vak by en kies hoe seker jy voel. Onderwerp is opsioneel.", "Oketsa thuto e nngwe le e nngwe gomme o kgethe hoo o ikarabela ka eona. Sehlooho ke boikhethelo."],
        "Confidence": ["Ukuzethemba", "Ukuzithemba", "Boitlhalo", "Selfvertroue", "Boitlhalo"],
        "A difficult topic (optional)": ["Isihloko esinzima (yokukhetha)", "Isihloko esinzima (ongayikhetha)", "Sehlooho se thata (boikhethelo)", "'n Moeilike onderwerp (opsioneel)", "Sehlooho se thata (boikhethelo)"],
        "Add subject": ["Engeza isifundo", "Yongeza isifundo", "Eketsa thuto", "Voeg vak by", "Oketsa thuto"],
        "When you are available": ["Ngenkathi ukhona", "Xa ukhona", "Ha o teng", "Wanneer jy beskikbaar is", "Ge o le teng"],
        "For each study day, enter your school or class hours and a study window that does not overlap. Times are editable to fit your own timetable.": ["Ngalosuku lokufunda, faka amahora akho esikole noma ikilasi kanye nesikhathi sokufunda esingadidi. Amahora angashintshwa ukuze afanele noluhle lwakho lwamahora.", "Ngalosuku lokufunda, faka amahora akho esikole okanye iklasi kunye noluhlu lweewindi zokufunda ezingahlanganisi. Iiawohe zingatshintshwa ukuze zifanele noluhlobo lwakho lweawohe.", "Ka letsatsi lehla ho ithuta, kenyetsa dihora tsa hao tsa sekolo kapa tsa kelle le window ya ho ithuta e sa hlanganeng le e nngwe. Metsotso e ka lokisoa ho lekana lenane la hao la nako.", "Voer vir elke studiedag jou skool- of klasure in en 'n studievenster wat nie oorvleuel nie. Tye kan aangepas word by jou eie rooster.", "Bakeng sa letšatši le lengwe le le lengwe la go ithuta, kenya dihora tša gago tša sekolo goba tša kelešo le lefase la go ithuta leo le sa hlanganwago. Nako e ka hlafatšwa go fihlelela lenaneo la gago la nako."],
        "Generate weekly timetable": ["Yenza uhlelo lwevikhi", "Yenza isicwangciso seveki", "Hlahisa lenane la beke", "Genereer weeklikse rooster", "Hlagafša lenane la beke"],
        "Your weekly timetable": ["Uhlelo lwakho lwevikhi", "Isicwangciso sakho seveki", "Lenane la hao la beke", "Jou weeklikse rooster", "Lenane la gago la beke"],
        "Add sessions to my calendar": ["Engeza amaseshoni ekhalendeni yami", "Yongeza iiseshoni kwikhalenda yam", "Eketsa li-sessions khalendareng ya ka", "Voeg sessies by my kalender", "Oketsa disesene kalendareng ya ka"],
        "Study blocks are scheduled only inside your chosen study window, outside the school/class hours you entered. A short break separates longer study periods. The planner may use fewer minutes when the remaining time cannot fit another short session and break.": ["Amabhulokhi okufunda ahlelwa kuphela phakathi kwinani lakho lokufunda, ngaphandle kwamahora esikole/ikilasi owafake. Isikhathi esifushane sokuqhelelana siphazamisa izikhathi ezinde zokufunda. Umhlinzeki ungasebenzisa amaminithi ambalwa lapho isikhathi esisele singafaneli iseshoni esifushane nesikhathi sokuqhelelana.", "Amazantsi okufunda acwangciswa kuphela ngaphakathi kwindawo yakho yokufunda, ngaphandle kweeyure zesikole/iklasi ozifakileyo. Ixesha elifutshane lokuphumla liyahlula iinkqubo ezinde zokufunda. Umcwangcisi unokusebenzisa imizuzwana encinci xa ixesha eliseleyo alifanelekanga isiqendu esifutshane kunye nokuqhelela.", "Dibloke tsa ho ithuta di reroang ka hare feela window ya hao ya ho ithuta, ka ntle le dihora tsa sekolo/kelle tseo o di kentseng. Khutsofiso e khutsane e arola linako tse kholo tsa ho ithuta. Moqapi a ka sebedisa metsotso e nyane ha nako e setseng e sa kgone ho mamarela sesene se khutsane le khutsofiso.", "Studieblokke word slegs binne jou gekose studievenster geskeduleer, buite die skool-/klasure wat jy ingevul het. 'n Kort pouse skei langer studieperiodes. Die beplanner kan minder minute gebruik wanneer die oorblywende tyd nie nog 'n kort sessie en pouse kan pas nie.", "Dibloke tsa go ithuta di beakanyetšwa ka hare feela lefase la go ithuta leo o le kgethilego, ka ntle ga dihora tša sekolo/kelešo tšeo o di tsentšwego. Khutšo ya kana e arola dinako tše teletše tša go ithuta. Mothlami a ka šomiša metsotso ye menyane ge nako ya go setšetšo e ka se phethagatše sesene se sa bohloki goba khutšo."],
        "Study links": ["Izixhumanisi zokufunda", "Iinkqubo zokufunda", "Ditsela tsa ho ithuta", "Studielenke", "Ditsela tsa go ithuta"],
        "Export adds the next occurrence of each selected study day; it does not create a repeating series. Calendar alerts are controlled by your calendar app. Enable alerts there if you want notifications. Ukhanyiso does not send notifications while this page is closed.": ["Ukukhipha kungeza isikhathi esilandelayo sosuku ngalunye lokufunda olukhethiwe; akwakhi iziqubu eziphindaphindiwe. Izaziso zekhalenda zalawulwa uhlelo lokusebenza lwekhalenda. Vulela izaziso lapho uma ufuna ukwaziswa. I-Ukhanyiso ayithumeli izaziso ngenkathi le page ivaliwe.", "Ukuthumela ngaphandle kongeza ngelinye ixesha lesi sondo ngasinye sokufunda esikhethiweyo; alidali uchungechunge oluphindaphindiweyo. Iisaziso zekhalenda zilawulwa li-app yekhalenda yakho. Yenza iisaziso khona ukuba ufuna ukwaziswa. I-Ukhanyiso ayithumeli iisaziso ngelixa le phepha livaliwe.", "Ho ntsha ha eketsa tlhahlobo e latelang ea letsatsi lehla ho ithuta le leng le le kgethilweng; ha le thehe letoto la ho pheta-pheta. Ditsebiso tsa khalendara la laoloa ke app ya khalendara ya hao. Kgothaletsa ditsebiso moo ha o batla ditsebiso. Ukhanyiso ha e romele ditsebiso ha leqephe lena le tswaletse.", "Uitvoer voeg die volgende voorkoms van elke gekose studiedag by; dit skep nie 'n herhalende reeks nie. Kalenderwaarskuwings word deur jou kalender-app beheer. Skakel waarskuwings daar in as jy kennisgewings wil hê. Ukhanyiso stuur nie kennisgewings terwyl hierdie bladsy toe is nie.", "Kgatiso e oketsa tšhupetso e latelago ya letšatši le lengwe le le lengwe la go ithuta leo o le kgethilego; ga se go aga letoto la go pheta-pheta. Ditsebiso tša kalendara la taoloa ke app ya kalendara ya gago. Kgothaletsa ditsebiso moo ge o batla ditsebiso. Ukhanyiso ga e romele ditsebiso ge letlakela le tswetšwe."],
        "Privacy: your grade, subjects, confidence, topics, and timetable stay in this browser on this device. They are not sent to Ukhanyiso. Do not enter personal information.": ["Obumfihlo: ibanga lakho, izifundo, ukuzethemba, izihloko, kanye nohlelo lwakho lwamahora kuhlala kulesi siphequluli kule divayisi. Awathunyelwa ku-Ukhanyiso. Ungafaki imininingwane yangokwemvelo.", "Ubucwali: ibanga lakho, iifundo, ukuzithemba, iisihloko, kunye nesicwangciso sakho seeyure kuhlala kulo mkhangeli kule siveli. Azithunyelwa kwi-Ukhanyiso. Musa ukufaka iinkcukacha zangasese.", "Boinoni: kereiti ya hao, dithuto, boitlhalo, dihlooho, le lenane la hao la nako di lula sebedisweng sena sethaleng sena. Ha di romelloe Ukhanyiso. O se ke wa kenya tsebo ya boikemelo.", "Privaatheid: jou graad, vakke, selfvertroue, onderwerpe en rooster bly in hierdie blaaier op hierdie toestel. Hulle word nie na Ukhanyiso gestuur nie. Moenie persoonlike inligting invoer nie.", "Boinotši: madingwa a gago, dithuto, boitlhalo, dihlooho le lenaneo la gago la nako di dula seyewelele se sethaleng se. Ga di thoromišwa Ukhanyiso. O se ke wa tsenya tsebo ya boikemelo."],

        // Dynamic status and button strings from page scripts
        "Added": ["Kwengeziwe", "Yongeziwe", "E kentswe", "Bygevoeg", "Byeetswa"],
        "Checking…": ["Iyahlolwa…", "Iyakhangela…", "E hlahloba…", "Word nagegaan…", "Go hlahloba…"],
        "Saving…": ["Iyagcinwa…", "Iyagcinwa…", "E boloka…", "Word gestoor…", "Go boloka…"],
        "Sending…": ["Iyathunyelwa…", "Iyathunyelwa…", "E romella…", "Word gestuur…", "Go romela…"],
        "Add at least one reminder before exporting your calendar.": ["Engeza okungenani isikhumbuzi esisodwa ngaphambi kokukhipha ikhalenda yakho.", "Yongeza okungenani isikhumbuzo esinye ngaphambi kokuthumela ikhalenda yakho.", "Eketsa bonyane kgopotso e le nngwe pele o ntsha khalendara ya hao.", "Voeg ten minste een herinnering by voordat jy jou kalender uitvoer.", "Oketsa kgopolo e nngwe pele o kgatisa kalendara ya gago."],
        "Add at least one subject before checking your options.": ["Engeza okungenani isifundo esisodwa ngaphambi kokuhlola izinketho zakho.", "Yongeza okungenani isifundo esinye ngaphambi kokujonga iinketho zakho.", "Eketsa bonyane thuto e le nngwe pele o hlahloba dikgetho tsa hao.", "Voeg ten minste een vak by voordat jy jou opsies nagaan.", "Oketsa thuto e nngwe pele o hlahloba dikgetho tša gago."],
        "Calendar export failed. Please try again.": ["Ukukhipha ikhalenda kuhlehlile. Zama futhi.", "Ukuthumela ikhalenda kuyalahlekile. Zama kwakhona.", "Ho ntsha khalendara ho hlolehile. Ka kopo leka hape.", "Kalenuitvoer het misluk. Probeer asseblief weer.", "Kgatiso ya kalendara e hloletšwe. Leka gape."],
        "Calendar file downloaded. Import it into your calendar app to receive notifications.": ["Ifayela lekhalenda ilandiwe. Yiyingeze ku-app yekhalenda yakho ukuze uthole izaziso.", "Ifayile yekhalenda ilayishiwe. Iyise kwi-app yekhalenda yakho ukuze ufumane iisaziso.", "Faele ya khalendara e jarollotsoe. E kenye apping ya khalendara ya hao ho fumana ditsebiso.", "Kalenderlêer afgelaai. Voer dit in jou kalender-app in om kennisgewings te ontvang.", "Faele ya kalendara e jarollotšwe. E kenya apping ya kalendara ya gago gore o fumane ditsebiso."],
        "Checklist progress saved to your account.": ["Intuthuko yohlu lokuhlola igcinwe ku-akhawunti yakho.", "Inkqubela yoluhlu lokukhangela igcinwe kwiakhawunti yakho.", "Tsoelo-pele ya lenane la tlhahlobo e boloketse akhaonting ya hao.", "Kontrolelys-vordering in jou rekening gestoor.", "Tsoelo-pele ya thwi ya go hlahloba e bolokwa akaontong ya gago."],
        "Choose a valid date today or later.": ["Khetha umhla osebenzayo namuhla noma kamuva.", "Khetha umhla usebenzayo namhlanje okanye emva kwaloo.", "Kgetha letsatsi le tla sebelisa kajeno kapa ka morao.", "Kies 'n geldige datum vandag of later.", "Kgetha letšatši le le hlahlomago go thuta goba ka morago."],
        "Could not load your account. Refresh the page and try again.": ["Ayikwazanga ukulayisha i-akhawunti yakho. Vuselela ikhasi bese uzama futhi.", "Ayikwazanga ukulayisha iakhawunti yakho. Zama kwakhona ngeendlu.", "E hlolehile ho layesha akhaonto ya hao. Ntjhafatsa leqephe mme o leke hape.", "Kon jou rekening nie laai nie. Laai die bladsy weer en probeer weer.", "Re ka se kgona go hlahla akaonto ya gago. Ntšha letlakela le leka gape."],
        "Document checklist updated in this browser.": ["Uhlu lokuhlola lwemibhalo lubuyekezwe kulesi siphequluli.", "Uluhlu lokukhangela amaxwebhu luhlatywe kulo mkhangeli.", "Lenane la tlhahlobo la ditokomane le ntlafaditswe sebedisweng sena.", "Dokumentkontrolelys in hierdie blaaier bygewerk.", "Thwi ya ditokomane di hlafaditšwe seyewelele se."],
        "Enter a funded period between 1 and 12 months.": ["Faka isikhathi esixhasiwe esiphakathi kwezinyanga eziyi-1 neziyi-12.", "Faka ixesha elinxhasiweyo eliphakathi kweenyanga ezi-1 nezi-12.", "Kenyetsa nako e tshehetsweang pakeng tsa dikgwedi tse 1 le tse 12.", "Voer 'n gefinansierde periode van 1 tot 12 maande in.", "Kenya nako e funding go magareng ga 1 le 12 dikgwedi."],
        "Enter a subject name.": ["Faka igama lesifundo.", "Faka igama lesifundo.", "Kenyetsa lebitso la thuto.", "Voer 'n vaknaam in.", "Kenya leina la thuto."],
        "Enter monthly funding and funded months to calculate your plan.": ["Faka uxhaso lwezinyanga nezinyanga ezixhasiwe ukuze ubale uhlelo lwakho.", "Faka inkxaso-mali ngenyanga iinyanga ezinxhasiweyo ukubala isicwangciso sakho.", "Kenyetsa tshehetso ya kgwedi le dikgwedi tse tshehetsweng ho bala moralo wa hao.", "Voer maandelikse befondsing en gefinansierde maande in om jou plan te bereken.", "Kenya mabaka a kgwedi a funding le dikgwedi tše di funding go bala mohlami wa gago."],
        "Fill in the required fields. Names take letters, spaces, hyphens and apostrophes; the number takes digits only.": ["Gcwalisa izinkambu ezidingekayo. Amagama athatha amagama, izikhala, iziphindezi kanye nezimpawdu; inombolo ithatha izinombolo kuphela.", "Zalisa iindawo ezifunekayo. Amagama athatsha onobumba, iindawo, iihyphens nee-apostropha; inombolo ithatha amanani kuphela.", "Tlatsa libaka tse hlokahalang. Mabitso a nka ditlhaka, libaka, di-hiphense le li-apostrophe; nomoro e nka dinomoro feela.", "Vul die vereiste velde in. Namen neem letters, spasies, koppeltekens en apostrofs; die nommer neem slegs syfers.", "Tsenya dipotšo tše hlokago. Maina a galela ditlhaka, maele, go hwetša le ditlhalosa; palo e galela dipalo feela."],
        "Funding deadline added to your local calendar.": ["Umhla wokugcina woxhaso wengezwe kukhalenda yakho yendawo.", "Umhla wokuvala wenkxaso-mali wongezwe kwi khalenda yakho yendawo.", "Letshwao la ho felloa ke nako la tshehetso le kentswe khalendareng ya hao ya lehae.", "Befondsingsperdatum by jou plaaslike kalender gevoeg.", "Kopelo ya go tswa e oketswe kalendareng ya gago ya go tswa lefelo."],
        "Generate a timetable before exporting your calendar.": ["Yenza uhlelo lwezinsuku ngaphambi kokukhipha ikhalenda yakho.", "Yenza isicwangciso seewi ngaphambi kokuthumela ikhalenda yakho.", "Hlahisa lenane la nako pele o ntsha khalendara ya hao.", "Genereer 'n rooster voordat jy jou kalender uitvoer.", "Hlagafša lenane la nako pele o kgatisa kalendara ya gago."],
        "If that email is linked to an account, a one-time reset code has been sent.": ["Uma leyo imeyili ixhunyaniswe ne-akhawunti, ikhodi yokusetha kabusha kanyeze ithunyelwe.", "Ukuba leyo imeyili ixhunyaniswe neakhawunti, ikhowudi yokuseta kwakhona ngexesha elinye ithunyelwe.", "Ha imeyili eo e amahelelanwa le akhaonto, khauta ya ho reset ya nako e le nngwe e romelloe.", "Als daardie e-pos aan 'n rekening gekoppel is, is 'n eenmalige herstelkode gestuur.", "Ge imeyili ya amahelelanwa le akaonto, khoutu ya go hlagofša ya nako e nngwe e rometšwe."],
        "Loading bursaries…": ["Ilayisha imifundaze…", "Iyalayisha iibhasari…", "E jarolla dibasari…", "Laai beurse…", "Go feta dibasari…"],
        "Loading funding information…": ["Ilayisha imininingwane yoxhaso…", "Iyalayisha iinkcukacha zenkxaso-mali…", "E jarolla tsebo ya tshehetso…", "Laai befondsingsinligting…", "Go feta tsebo ya funding…"],
        "Loading your checklist…": ["Ilayisha uhlu lwakho lokuhlola…", "Iyalayisha uluhlu lwakho lokukhangela…", "E jarolla lenane la hao la tlhahlobo…", "Laai jou kontrolelys…", "Go feta thwi ya gago ya go hlahloba…"],
        "No reminders were available to export.": ["Azikho izikhumbuzi ezitholakalayo ukuzikhipha.", "Azisi zikhumbuzo ezikhoyo zokuthunyelwa.", "Ha ho dikgopotso tse teng tsa ho ntshwa.", "Geen herinneringe was beskikbaar om uit te voer nie.", "Ga go na dikgopolo tša go kgatiswa."],
        "Plan recalculated from the figures entered. These estimates are a planning aid, not financial advice.": ["Uhlelo lubalwe kabusha kusuka kuzinombolo ezifakiwe. Lezi zilinganiso zithuluzi lokuhlela, hhayi iseluleko sezimali.", "Isicwangciso sabalwa kwakhona kumanani afakiweyo. La linganiso lulutyalo-mqatho lokuhlela, hayi iseluleko sezimali.", "Moralo o baloa hape ho tloha dinomorong tsa kena. Tsena ke dikakanyo tsa moralo, ha se keletso ya ditjhelete.", "Plan her bereken vanaf die ingevoerde syfers. Hierdie raminge is 'n beplanningshulp, nie finansiële advies nie.", "Mohlami o baloa hape go tšwa dipalong tše tsentšwego. Dipalo tše ke tšwa tšwa tšebo, e sego mohlalawetši wa madi."],
        "Please complete the required details to continue.": ["Sicela ugcwalizele imininingwane edingekayo ukuze uqhubeke.", "Nceda uzeledise iinkcukacha ezifunekayo ukuze uqhubeke.", "Ka kopo qetella dintlha tse hlokahalang ho tsoela pele.", "Vul asseblief die vereiste besonderhede in om voort te gaan.", "Ka kgopolo phetha ditaba tše hlokago go tsoela pele."],
        "Profile saved.": ["Iphrofayela igciniwe.", "Iprofayile igciniwe.", "Boemo ba bolokiloe.", "Profiel gestoor.", "Sebopego se bolokilwe."],
        "Reminder removed.": ["Isikhumbuzi susiwe.", "Isikhumbuzo susiwe.", "Kgopotso e tlositswe.", "Herinnering verwyder.", "Kgopolo e tlošilwe."],
        "Reminder saved only in this browser.": ["Isikhumbuzi sigciniwe kulesi siphequluli kuphela.", "Isikhumbuzo sigciniwe kulo mkhangeli kuphela.", "Kgopotso e bolokiloe sebedisweng sena feela.", "Herinnering slegs in hierdie blaaier gestoor.", "Kgopolo e bolokwa seyewelele se feela."],
        "Reminders for ": ["Izikhumbuzi ze- ", "Iizikhumbuzo ze- ", "Dikgopotso tsa ", "Herinneringe vir ", "Dikgopolo bakeng sa"],
        "Saved study data could not be read. You can make a new plan in this browser.": ["Idatha yokufunda egciniwe ayikwazanga ukufundwa. Ungenza uhlelo olusha kulesi siphequluli.", "Idatha yokufunda eyagciniweyo ayikwazanga ukufundwa. Unokwenza isicwangciso sitsha kulo mkhangeli.", "Tsebo ya ho ithuta e bolokiloeng e ke ke ya baloa. O ka etsa moralo o mocha sebedisweng sena.", "Gestoorde studiedata kon nie gelees word nie. Jy kan 'n nuwe plan in hierdie blaaier maak.", "Tsebo ya go ithuta ya bolokwa ga e ka baloa. O ka etsa mohlami wa mocha seyewelele se."],
        "Study plan changes saved in this browser.": ["Ushintsho lwehlelo lokufunda lugcinwe kulesi siphequluli.", "Ushintsho lwesicwangciso sokufunda lugcinwe kulo mkhangeli.", "Metabo ya moralo wa ho ithuta e bolokiloe sebedisweng sena.", "Studieplanwysigings in hierdie blaaier gestoor.", "Metabo ya mohlami wa go ithuta e bolokwa seyewelele se."],
        "Study sessions and chosen study-day reminders were exported. Enable alerts in your calendar app if needed; Ukhanyiso does not notify you while closed.": ["Amaseshoni okufunda nezikhumbuzi zosuku lokufunda okukhethiwe kukhishwe. Vulela izaziso ku-app yekhalenda uma kudingeka; i-Ukhanyiso ayikwazisi ngenkathi ivaliwe.", "Iiseshoni zokufunda neezikhumbuzo zosuku lokufunda ezikhethiweyo zathunyelwa. Yenza iisaziso kwi-app yekhalenda ukuba kufuneka; i-Ukhanyiso ayikwazisi xa ivaliwe.", "Li-sessions tsa ho ithuta le dikgopotso tsa letsatsi la ho ithuta tse kgethilweng di ntshitswe. Kgothaletsa ditsebiso apping ya khalendara ha ho hlokahala; Ukhanyiso ha e tsebise ha e tswetse.", "Studiesessies en gekose studiedag-herinneringe is uitgevoer. Skakel waarskuwings in jou kalender-app in indien nodig; Ukhanyiso stuur nie kennis terwyl dit toe is nie.", "Sesene tša go ithuta le dikgopole tsa letšatši la go ithuta tše di kgethilweng di kgatiswe. Kgothaletsa ditsebiso apping ya kalendara ge go hloka; Ukhanyiso ga e tsebise ge e tswetšwe."],
        "That funding deadline is already in your local calendar.": ["Lowo mkhawulo woxhaso usengakhalendeni yakho yendawo.", "Lowo mda wenkxaso-mali usekwikhalenda yakho yendawo.", "Nako eo ya ho felloa ke nako ea tshehetso e se khalendareng ya hao ya lehae.", "Daardie befondsingsperdatum is al in jou plaaslike kalender.", "Nako ya go tswa ya funding e ka tšwasegwa kalendareng ya gago ya lefelo."],
        "That reminder is already saved for this date.": ["Leso sikhumbuzi sesigciniwe ngalomhla.", "Eso sikhumbuzo sesigciniwe ngale mihla.", "Kgopotso eo e bolokiloe ka letsatsi lena.", "Daardie herinnering is al vir hierdie datum gestoor.", "Kgopolo ya wana bolokilwe bakeng sa letšatši le."],
        "That subject has already been added.": ["Leso sifundo sesengeziwe.", "Eso sifundo sesongezwa.", "Thuto eo e kentswe kajeno.", "Daardie vak is al bygevoeg.", "Thuto e okeditše."],
        "This browser could not load saved document checklist ticks.": ["Lesi siphequluli asikwazanga ukulayisha amamaki ohlwini lwemibhalo egciniwe.", "Lo mkhangeli akwazanga kulayisha amamaki oluhlwini lwamaxwebhu agciniweyo.", "Sesebediswa sena ha se a kgona ho jarolla maswana a lenane la ditokomane a bolokiloeng.", "Hierdie blaaier kon gestoorde dokumentkontrolelys-vinkies nie laai nie.", "Seyewelele se ga se ka hlahla thwi ya ditokomane tše bolokilwego."],
        "This browser could not read saved reminders. You can still export reminders while this page is open.": ["Lesi siphequluli asikwazanga ukufunda izikhumbuzi ezigciniwe. Usengakwazi ukukhipha izikhumbuzi ngenkathi le khasi livulekile.", "Lo mkhangeli akwazanga kufunda iizikhumbuzo ezigciniweyo. Usenokuthumela iizikhumbuzo ngelixa le phepha livalulekile.", "Sesebediswa sena ha se a kgona ho bala dikgopotso tse bolokiloeng. O ka ntsha dikgopotso ha leqephe lena le bulehile.", "Hierdie blaaier kon gestoorde herinneringe nie lees nie. Jy kan steeds herinneringe uitvoer terwyl hierdie bladsy oop is.", "Seyewelele se ga se ka bala dikgopole tše bolokilwego. O ka tšwela pele o kgatisa dikgopole ge letlakela le bulegile."],
        "This browser could not read the local reminders.": ["Lesi siphequluli asikwazanga ukufunda izikhumbuzi zendawo.", "Lo mkhangeli akwazanga kufunda iizikhumbuzo zendawo.", "Sesebediswa sena ha se a kgona ho bala dikgopotso tsa lehae.", "Hierdie blaaier kon plaaslike herinneringe nie lees nie.", "Seyewelele se ga se ka bala dikgopole tša lefelo."],
        "This browser could not save that document checklist change.": ["Lesi siphequluli asikwazanga ukugcina lesoshintsho loluhlu lwemibhalo.", "Lo mkhangeli akwazanga kugcina latshintsho loluhlu lwamaxwebhu.", "Sesebediswa sena ha se a kgona ho boloka phetoho eo ya lenane la ditokomane.", "Hierdie blaaier kon daardie dokumentkontrolelyswysiging nie stoor nie.", "Seyewelele se ga se ka boloka phetogo ya thwi ya ditokomane."],
        "This browser could not save your reminder. Check local storage settings or export your calendar.": ["Lesi siphequluli asikwazanga ukugcina isikhumbuzi sakho. Hlola izilungiselelo zokugcina zendawo noma ukhipha ikhalenda yakho.", "Lo mkhangeli akwazanga kugcina isikhumbuzo sakho. Khangela iindawo zokugcina zendawo okanye uthumele ikhalenda yakho.", "Sesebediswa sena ha se a kgona ho boloka kgopotso ya hao. Hlahloba disetho tsa polokelo ea lehae kapa o ntshe khalendara ya hao.", "Hierdie blaaier kon jou herinnering nie stoor nie. Kontroleer plaaslike bergingsinstellings of voer jou kalender uit.", "Seyewelele se ga se ka boloka kgopolo ya gago. Hlahloba disetho tša polokelo goba o kgatisa kalendara ya gago."],
        "This browser could not save your study plan. Check its storage settings.": ["Lesi siphequluli asikwazanga ukugcina uhlelo lwakho lokufunda. Hlola izilungiselelo zokugcina.", "Lo mkhangeli akwazanga kugcina isicwangciso sakho sokufunda. Khangela iindawo zokugcina.", "Sesebediswa sena ha se a kgona ho boloka moralo wa hao wa ho ithuta. Hlahloba disetho tsa polokelo.", "Hierdie blaaier kon jou studieplan nie stoor nie. Kontroleer die bergingsinstellings.", "Seyewelele se ga se ka boloka mohlami wa go ithuta wa gago. Hlahloba disetho tša polokelo."],
        "Too many tries. Please wait a minute.": ["Uzame kakhulu. Lindeka umzuzu.", "Wazama kakhulu. Lindela umzuzu.", "O leka haholo. Tsamaisa metsotso.", "Te veel pogings. Wacht een minuut.", "Oketsa tsoma. Tsamaya metsotso e le nngwe."],
        "We could not load funding information. Your course matches are available; try the Funding page again later.": ["Asikwazanga ukulayisha imininingwane yoxhaso. Izifundo ezihambisana namamaki akho zitholakala; zama ikhasi lezimali ngemuva kwesikhathi.", "Asikwazanga kulayisha iinkcukacha zenkxaso-mali. Iifundo ezihambelanayo ziyafumaneka; zama iphepha lenkxaso-mali emva kwexesha.", "Ha rea kgona ho jarolla tsebo ya tshehetso. Dithuto tse tshwanang le matshwao a hao di teng; leka leqephe la tshehetso hamorao.", "Kon befondsingsinligting nie laai nie. Jou kursuspassings is beskikbaar; probeer die Befondsing-bladsy later weer.", "Re ka se kgona go feta tsebo ya funding. Dithuto tše di tshwana le mabaka a gago di le teng; leka letlakela la funding ka morago."],
        "We could not reach the account service. Please try again.": ["Asifikwanga kwenkonzo ye-akhawunti. Zama futhi.", "Asifikwanga kwinzika yeakhawunti. Zama kwakhona.", "Ha rea fihla tšebeletsong ya akhaonto. Ka kopo leka hape.", "Kon nie die rekeningdiens bereik nie. Probeer asseblief weer.", "Re ka se fihla direlong tša akaonto. Leka gape."],
        "We could not save your profile. Please try again.": ["Asikwazanga ukugcina iphrofayela yakho. Zama futhi.", "Asikwazanga kugcina iprofayile yakho. Zama kwakhona.", "Ha re a kgona ho boloka boemo ba hao. Ka kopo leka hape.", "Kon jou profiel nie stoor nie. Probeer asseblief weer.", "Re ka se boloka sebopego sa gago. Leka gape."],
        "Your matches are shown here, but this browser could not save the full results for the Results page.": ["Izifundo zakho ezihambisanayo zikhombiswe lapha, kodwa lesi siphequluli asikwazanga ukugcina imiphumela ephelele yokukhasa leziphumo.", "Iifundo zakho ezihambelanayo zibonisiwe apha, kodwa lo mkhangeli akwazanga kugcina iziphumo zipheleleyo zephepha leziphumo.", "Dithuto tsa hao tse tshwanang di bontshitswe mona, empa sesebediswa sena ha se a kgona ho boloka diphetho tse felletseng tsa leqephe la diphetho.", "Jouw passings word hier getoon, maar hierdie blaaier kon nie die volledige uitslae vir die Uitslae-bladsy stoor nie.", "Dithuto tša gago tše di tshwana di bonagatše mo, eupša seyewelele se ga se ka boloka dipoelo tše phethilwego bakeng sa letlakela la dipoelo."],
        "Showing all subjects A to Z. Type 3 or more letters to search.": ["Kukhonjiswa zonke izifundo A kuya ku-Z. Bhala odinga wonke umugqa ongakona kwezi-3.", "Kuboniswa zonke iifundo ukusuka ku-A ukuya ku-Z. Bhala odinga onke iiwungelo ezi-3.", "Ho bontshoa dithuto tsohle A ho isa ho Z. Ngola ditlhaka tse 3 ho fihlela ho batla.", "Alle vakke van A tot Z word getoon. Tik 3 of meer letters om te soek.", "Go bontšha dithuto ka moka A go ya go Z. Thwala ditlhaka tše 3 goba tše botswi go seka."],
        "Showing suggestions. Press Down or Up to view more, then Enter to choose.": ["Kukhonjiswa iziphakamiso. Cindezela Phansi noma Phezulu ukuze ubone okwengeziwe, bese ucindezela Enter ukuze ukhethe.", "Kuboniswa iincebo. Cofa Phantsi okanye Phezulu ukuze ubone okunye, emva koko cofa Enter ukuze ukhethe.", "Ho bontshoa litšebeletso. tobetsa Tlasa kapa Hodimo ho sheba ho eketsehileng, ebe tobetsa Enter ho kgetha.", "Voorstelle word getoon. Druk Onder of Bo om meer te sien, druk dan Enter om te kies.", "Ditlhaloswa di bontšha. Tobetsa Tlaša goba Hodimo go sheba tše go tšwelela, gomme tobetsa Enter go kgetha."],
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
        const english = canonicalText.get(value.trim())
            || canonicalText.get(value.replace(/\s+/g, " ").trim());

        if (!english || target === "en") {
            return english || value;
        }

        const leading = value.match(/^\s*/)[0];
        const trailing = value.match(/\s*$/)[0];
        const index = ["zu", "xh", "st", "af", "nso"].indexOf(target);

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

    // Menu sections: each entry links to a page and shows its related pages as sub-links.
    const MENU_SECTIONS = [
        { label: "Dashboard", href: "/index.html", children: [
            { label: "Open Marks", href: "/start.html" },
            { label: "View Results", href: "/results.html" },
            { label: "Open Checklist", href: "/checklist.html" }
        ] },
        { label: "Marks", href: "/start.html", children: [
            { label: "View Results", href: "/results.html" },
            { label: "Study Plan", href: "/study.html" },
            { label: "Application Checklist", href: "/checklist.html" }
        ] },
        { label: "Results", href: "/results.html", children: [
            { label: "Open Marks", href: "/start.html" },
            { label: "Funding Opportunities", href: "/funding.html" },
            { label: "Open Reminders", href: "/calendar.html" }
        ] },
        { label: "Funding", href: "/funding.html", children: [
            { label: "Open Checklist", href: "/checklist.html" },
            { label: "Open Reminders", href: "/calendar.html" },
            { label: "Plan My Finances", href: "/plan.html" }
        ] },
        { label: "Reminders", href: "/calendar.html", children: [
            { label: "Funding Opportunities", href: "/funding.html" },
            { label: "Application Checklist", href: "/checklist.html" },
            { label: "Study Plan", href: "/study.html" }
        ] },
        { label: "Financial Plan", href: "/plan.html", children: [
            { label: "Funding Opportunities", href: "/funding.html" },
            { label: "Open Reminders", href: "/calendar.html" },
            { label: "Open Marks", href: "/start.html" }
        ] },
        { label: "Checklist", href: "/checklist.html", children: [
            { label: "Funding Opportunities", href: "/funding.html" },
            { label: "Open Reminders", href: "/calendar.html" },
            { label: "Open Marks", href: "/start.html" }
        ] },
        { label: "Study Plan", href: "/study.html", children: [
            { label: "Open Marks", href: "/start.html" },
            { label: "Open Reminders", href: "/calendar.html" },
            { label: "Open Checklist", href: "/checklist.html" }
        ] },
        { label: "Profile", href: "/account.html", children: [
            { label: "Manage reminders", href: "/calendar.html" },
            { label: "Open Marks", href: "/start.html" },
            { label: "Open Checklist", href: "/checklist.html" }
        ] }
    ];

    // Builds the shared header (brand, menu button, back button, grouped menu, language) on every page.
    function buildUnifiedHeader(nav) {
        const pagePath = location.pathname.replace(/\/$/, "") || "/index.html";
        const current = MENU_SECTIONS.find(s => s.href === pagePath) || null;

        const header = document.createElement("header");
        header.className = "app-header";

        const bar = document.createElement("div");
        bar.className = "app-header-bar";

        const brand = document.createElement("a");
        brand.className = "nav-brand";
        brand.href = "/index.html";
        brand.textContent = "Ukhanyiso";

        const actions = document.createElement("div");
        actions.className = "top-actions";

        const back = document.createElement("a");
        back.className = "nav-back";
        back.href = "#";
        back.textContent = t("← Back");
        back.setAttribute("aria-label", "Go to the previous page");
        back.addEventListener("click", event => {
            event.preventDefault();
            if (history.length > 1) history.back();
            else location.assign("/index.html");
        });

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.id = "menu-toggle";
        toggle.className = "menu-toggle";
        toggle.setAttribute("aria-controls", "main-menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = t("☰ Menu");

        const signOut = document.getElementById("sign-out");
        if (signOut) actions.appendChild(signOut);
        actions.append(back, toggle);

        bar.append(brand, actions);

        const menu = document.createElement("nav");
        menu.id = "main-menu";
        menu.setAttribute("aria-label", "Main navigation");
        menu.hidden = true;

        const here = document.createElement("p");
        here.className = "menu-here";
        here.textContent = t("You are here:") + " " + t(current ? current.label : "Dashboard");
        menu.appendChild(here);

        const grid = document.createElement("div");
        grid.className = "menu-grid";

        MENU_SECTIONS.forEach(section => {
            const cell = document.createElement("div");
            cell.className = "menu-section" + (current === section ? " is-current" : "");
            const head = document.createElement("a");
            head.href = section.href;
            head.textContent = t(section.label);
            if (current === section) head.setAttribute("aria-current", "page");
            cell.appendChild(head);
            const sub = document.createElement("div");
            sub.className = "menu-sub";
            section.children.forEach(child => {
                const link = document.createElement("a");
                link.href = child.href;
                link.textContent = t(child.label);
                sub.appendChild(link);
            });
            cell.appendChild(sub);
            grid.appendChild(cell);
        });
        menu.appendChild(grid);
        // Dimmed backdrop behind the slide-in menu drawer.
        const scrim = document.createElement("div");
        scrim.className = "menu-scrim";
        scrim.hidden = true;
        scrim.addEventListener("click", () => setMenuOpen(false));

        const toolbar = document.createElement("div");
        toolbar.className = "site-toolbar";
        const label = document.createElement("label");
        label.htmlFor = "lang";
        label.textContent = t("Language");
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
                say(t("Language changed for this page, but your browser could not save the preference."));
            }
        });
        toolbar.append(label, select);

        header.append(bar, menu, toolbar, scrim);
        nav.replaceWith(header);
        return { toggle, menu, scrim };
    }

    // On legacy pages without a unified header, wrap the plain nav as the menu.
    // This must run BEFORE the legacy language toolbar so only one selector exists.
    let menuToggle = document.getElementById("menu-toggle");
    let menu = document.getElementById("main-menu");
    let menuScrim = null;
    if (!menu && !menuToggle) {
        const legacyNav = document.querySelector('nav[aria-label="Main navigation"], main ~ nav, body > nav');
        if (legacyNav) {
            const built = buildUnifiedHeader(legacyNav);
            menuToggle = built.toggle;
            menu = built.menu;
            menuScrim = built.scrim;
        }
    }

    // Language selector: only for legacy pages that did not get the unified header.
    const nav = [...document.querySelectorAll("nav")].find(n => n.id !== "main-menu");

    if (nav && !document.querySelector("header.app-header")) {
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
                say(t("Language changed for this page, but your browser could not save the preference."));
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
            if (record.type === "characterData" && record.target.nodeType === Node.TEXT_NODE) {
                const translated = translate(record.target.nodeValue, lang);

                if (translated !== record.target.nodeValue) {
                    record.target.nodeValue = translated;
                }
                return;
            }

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

    const navigation = menu;

    // Mobile menu toggle.
    if (menuToggle && menu) {
        const setMenuOpen = isOpen => {
            menu.hidden = !isOpen;
            if (menuScrim) menuScrim.hidden = !isOpen;
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? t("✕ Close") : t("☰ Menu");
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
        menu.addEventListener("click", event => {
            if (event.target.closest("a")) setMenuOpen(false);
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
                                    && profile.contactEmail)) {
                                location.assign("/account.html");
                            }
                        })
                        .catch(() => { });
                }

                if (profileLink) {
                    profileLink.textContent = t("Profile");
                    profileLink.title = t("Signed in as ") + user.username;
                }

                // Signed-in learners get a Study Plan link that logged-out
                // visitors never see.
                if (!navigation.querySelector('a[href="/study.html"]')) {
                    const studyPlan = document.createElement("a");
                    studyPlan.href = "/study.html";
                    studyPlan.className = "auth-study-plan";
                    studyPlan.textContent = t("Study Plan");
                    if (location.pathname === "/study.html") {
                        studyPlan.setAttribute("aria-current", "page");
                    }
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
                        say(t("We could not log you out. Please try again."));
                        signOutButton.disabled = false;
                    }
                });
            })
            .catch(() => {
                say(t("We could not load your account details. Please refresh the page."));
            });
    }
})();