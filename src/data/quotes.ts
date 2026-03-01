export type Quote = {
    text: string;
    author?: string;
    date?: string;
    source?: string;
    tags?: string[];
};

export const quotes: Quote[] = [
    {
        text: "I was a skeptic, I became a nihilist, now I'm an absurdist.",
        author: "Drew",
        date: "2025-11-20",
        tags: ["philosophy", "absurdism", "personal"]
    },
    {
        text: "Security isn't about saying no — it's about enabling innovation with confidence.",
        author: "Drew",
        date: "2026-01-15",
        tags: ["security", "philosophy", "leadership"]
    },
    {
        text: "The best agent is the one that knows when to ask for help.",
        author: "Drew",
        date: "2026-02-10",
        tags: ["ai", "agents", "engineering"]
    },
    {
        text: "Context is the difference between automation and intelligence.",
        author: "Drew",
        date: "2026-02-28",
        tags: ["ai", "context-engineering", "philosophy"]
    }
];