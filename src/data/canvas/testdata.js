// Mock data voor en gedicht
// src/data/testdata.js
export const poems = [
    {
        id: 123,
        title: "pionier",
        author: "reneoskam",
        lines: [
            "er zullen altijd mensen zijn",
            "die niet begrijpen wat jij doet",
            "ze zullen jou heel bijdehand",
            "vertellen hoe 'het moet'",
            "ze hebben heel veel commentaar",
            "maar zelf nooit een goed idee",
            "ze denken dat ze heel wat zijn",
            "dus ze bemoeien zich ermee",
            "het zal niet altijd makkelijk zijn",
            "het leven van een pionier",
            "maar jij houdt al je doelen",
            "heel scherp in het vizier",
            "jij weet zelf als geen ander",
            "jij bent lang zo gek nog niet",
            "en 't is een kwestie van geduld",
            "tot iedereen dat in jou ziet."
        ],

    },
    // eventueel meer gedichten
];

export function getPoemById(id) {
    return poems.find((p) => String(p.id) === String(id)) || null;
}
