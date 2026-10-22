const OFFICIAL = ["Afrikaans", "English", "isiNdebele", "isiXhosa", "isiZulu", "Sepedi",
    "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga"];

const OTHER_LANGUAGES = [
    "Arabic Second Additional Language", "French Second Additional Language",
    "German Home Language", "German Second Additional Language",
    "Gujarati Home Language", "Gujarati First Additional Language", "Gujarati Second Additional Language",
    "Hebrew Second Additional Language",
    "Hindi Home Language", "Hindi First Additional Language", "Hindi Second Additional Language",
    "Italian Second Additional Language", "Latin Second Additional Language",
    "Portuguese Home Language", "Portuguese First Additional Language", "Portuguese Second Additional Language",
    "Spanish Second Additional Language",
    "Tamil Home Language", "Tamil First Additional Language", "Tamil Second Additional Language",
    "Telegu Home Language", "Telegu First Additional Language", "Telegu Second Additional Language",
    "Urdu Home Language", "Urdu First Additional Language", "Urdu Second Additional Language",
    "Modern Greek Second Additional Language"
];

const SUBJECTS = [
    ...OFFICIAL.map(l => l + " Home Language"),
    ...OFFICIAL.map(l => l + " First Additional Language"),
    ...OFFICIAL.map(l => l + " Second Additional Language"),
    ...OTHER_LANGUAGES,
    "South African Sign Language Home Language",
    "Mathematics", "Mathematical Literacy", "Technical Mathematics",
    "Physical Sciences", "Technical Sciences", "Life Sciences",
    "Agricultural Sciences", "Agricultural Technology", "Agricultural Management Practices",
    "Geography", "History", "Religion Studies",
    "Accounting", "Business Studies", "Economics",
    "Information Technology", "Computer Applications Technology",
    "Engineering Graphics and Design", "Civil Technology",
    "Electrical Technology", "Mechanical Technology",
    "Consumer Studies", "Hospitality Studies", "Tourism",
    "Dramatic Arts", "Visual Arts", "Music", "Dance Studies", "Design",
    "Equine Studies", "Maritime Economics", "Nautical Science", "Sport and Exercise Science",
    "Life Orientation"
];

const CONFLICTS = [
    ["Mathematics", "Mathematical Literacy"],
    ["Computer Applications Technology", "Information Technology"],
    ["Consumer Studies", "Hospitality Studies"]
];
const LANG_GROUPS = [
    ["isiXhosa", "isiZulu", "siSwati", "isiNdebele"],
    ["Sepedi", "Sesotho", "Setswana"]
];
const languageOf = s => s.replace(/ (Home|First Additional|Second Additional) Language$/, "");

function validateCombos(rows) {
    const chosen = rows.map(r => r.subject).filter(Boolean);
    const errors = [];
    if (CONFLICTS.some(([a, b]) => chosen.includes(a) && chosen.includes(b)))
        errors.push("Some of these subjects can't be taken together.");
    const langs = chosen.filter(s => / Language$/.test(s)).map(languageOf);
    if (new Set(langs).size !== langs.length)
        errors.push("A language can only be added once, at one level.");
    if (LANG_GROUPS.some(g => langs.filter(l => g.includes(l)).length > 1))
        errors.push("Some of these languages can't be taken together.");
    return errors;
}

function validateMarks(rows) {
    const errors = [];
    const seen = new Set();
    rows.forEach(({ subject, mark }) => {
        if (subject === "" || mark === "") { errors.push("Please fill in all required fields."); return; }
        if (!SUBJECTS.includes(subject)) errors.push("Please choose a subject from the list.");
        else if (seen.has(subject)) errors.push("Each subject can only be added once.");
        seen.add(subject);
        const n = Number(mark);
        if (!Number.isInteger(n) || n < 0 || n > 100) errors.push("Marks must be between 0 and 100.");
    });
    return [...new Set(errors)];
}