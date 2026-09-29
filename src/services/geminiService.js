/**
 * KeepAI - Gemini AI Service & Offline Smart Engine
 * Provides AI capabilities with live Google Gemini API and an intelligent fallback
 * for seamless portfolio demoing even without an API key.
 */

const GEMINI_MODEL = "gemini-1.5-flash";

async function callGemini(prompt, apiKey, systemInstruction = "") {
  if (!apiKey || apiKey.trim() === "") {
    return null; // Will trigger intelligent mock fallback
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: (systemInstruction ? systemInstruction + "\n\n" : "") + prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn("Gemini API call failed, falling back to smart engine:", errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

/**
 * Summarize note content
 */
export async function summarizeContent(title, content, apiKey) {
  const prompt = `Summarize the following note concisely in 2-3 clear sentences with key takeaways:\n\nTitle: ${title}\nContent:\n${content}`;
  
  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey, "You are a concise executive assistant.");
      if (result) return result;
    } catch (e) {
      console.warn("Using offline summarizer fallback", e);
    }
  }

  // Intelligent local fallback
  const lines = content.split("\n").filter(l => l.trim().length > 0);
  const firstFew = lines.slice(0, 3).join(" ");
  return `📌 Key Summary: ${firstFew ? firstFew.slice(0, 180) + "..." : "Note focuses on " + (title || "core concepts")}.\n\n• Actionable takeaways identified.\n• Keep updated for future review.`;
}

/**
 * Extract action items as checklist items from unformatted note text
 */
export async function extractActionItems(content, apiKey) {
  const prompt = `Read the following text and extract all actionable tasks/to-dos. Return ONLY a JSON array of strings, e.g. ["Task 1", "Task 2"]. No markdown formatting, just raw JSON.\n\nText:\n${content}`;
  
  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey, "You are a task extraction engine. Return only JSON array.");
      if (result) {
        const clean = result.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            text: String(item).trim(),
            completed: false
          }));
        }
      }
    } catch (e) {
      console.warn("Using offline checklist extractor fallback", e);
    }
  }

  // Smart local extractor
  const sentences = content
    .split(/[\n.!?•\-*]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && !/^(the|and|or|in|at)$/i.test(s));

  const actionKeywords = /need to|must|should|todo|create|build|review|prepare|write|fix|call|send|test|deploy|read|schedule|complete|update/i;
  let items = sentences.filter(s => actionKeywords.test(s));

  if (items.length === 0) {
    items = sentences.slice(0, 4);
  }

  return items.slice(0, 6).map((text, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    text: text.replace(/^[-*•\d.]+\s*/, ""),
    completed: false
  }));
}

/**
 * Rewrite note into desired tone
 */
export async function rewriteTone(content, tone, apiKey) {
  const tonePrompts = {
    professional: "Rewrite this content to be polished, formal, and workplace-ready:",
    concise: "Condense this content into the most impactful, brief, direct version:",
    bullets: "Organize this content into clean, structured bullet points:",
    executive: "Rewrite this as a high-level Executive Briefing with 'Context', 'Key Points', and 'Next Steps':"
  };

  const instruction = tonePrompts[tone] || tonePrompts.professional;
  const prompt = `${instruction}\n\n"${content}"`;

  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey);
      if (result) return result;
    } catch (e) {
      console.warn("Using offline tone rewriter fallback", e);
    }
  }

  // Local fallback
  if (tone === "bullets") {
    return content.split("\n").filter(l => l.trim()).map(l => `• ${l.trim()}`).join("\n");
  }
  if (tone === "concise") {
    return content.split("\n").slice(0, 2).join(" ") + " (Key priorities aligned).";
  }
  if (tone === "executive") {
    return `📋 EXECUTIVE BRIEFING\n━━━━━━━━━━━━━━━━━━━━\n🎯 Objective: Align on core objectives and deliverables.\n\nKey Insights:\n${content}\n\n✅ Next Step: Execute according to milestone timeline.`;
  }
  return `Dear Team,\n\nI would like to highlight the following key updates:\n\n${content}\n\nPlease let me know if any adjustments are needed.\n\nBest regards.`;
}

/**
 * AI Auto-Tag generator
 */
export async function generateAutoTags(title, content, apiKey) {
  const prompt = `Analyze this note and suggest 2-4 short, relevant lowercase hashtags without '#', e.g. ["interview", "react", "career"]. Return ONLY JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;

  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey);
      if (result) {
        const clean = result.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed)) return parsed.map(t => t.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
      }
    } catch (e) {
      console.warn("Using offline tag generator fallback", e);
    }
  }

  // Intelligent local tag detection
  const text = `${title} ${content}`.toLowerCase();
  const candidates = [];
  if (text.includes("interview") || text.includes("job") || text.includes("career") || text.includes("resume")) candidates.push("career", "interview");
  if (text.includes("react") || text.includes("frontend") || text.includes("javascript") || text.includes("css")) candidates.push("frontend", "react");
  if (text.includes("project") || text.includes("deadline") || text.includes("client")) candidates.push("projects");
  if (text.includes("meeting") || text.includes("standup") || text.includes("team")) candidates.push("meeting");
  if (text.includes("idea") || text.includes("brainstorm") || text.includes("feature")) candidates.push("ideas");
  if (text.includes("todo") || text.includes("task") || text.includes("urgent")) candidates.push("urgent");
  if (candidates.length === 0) candidates.push("general", "notes");

  return [...new Set(candidates)].slice(0, 3);
}

/**
 * Career & Job Preparation Note Generator
 * Converts a Job Title + Job Description into a complete interview prep note
 */
export async function generateCareerPrep(jobTitle, jobDescription, apiKey) {
  const prompt = `You are a Senior Engineering Hiring Manager and Career Coach.
Create a comprehensive, high-impact Interview Prep Guide for the role of "${jobTitle}" based on this job description:
"""${jobDescription}"""

Structure the response clearly with:
1. 🎯 Top 4 Core Competencies & Skills Required
2. 💡 3 Most Likely Technical / Domain Questions & Model Answers
3. ⭐ 2 Behavioral Questions (STAR Method: Situation, Task, Action, Result)
4. 📋 5-Step Action Checklist to ace the interview.

Keep the formatting clean, modern, and directly actionable.`;

  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey, "You are an elite career coach and tech hiring manager.");
      if (result) return result;
    } catch (e) {
      console.warn("Using offline career prep fallback", e);
    }
  }

  // Intelligent role-aware career prep generator
  const isAiRole = /ai|ml|machine learning|llm|deep learning|data/i.test(`${jobTitle} ${jobDescription}`);
  const isFrontendRole = /front|react|vue|web|ui|ux|angular|javascript|typescript/i.test(`${jobTitle} ${jobDescription}`);

  let skills = [
    "• Technical Mastery: End-to-end architecture, clean component design, test coverage",
    "• Production Reliability: Performance profiling, error boundaries, CI/CD pipelines",
    "• System Thinking: Scalability trade-offs, state management, latency reduction",
    "• Collaborative Ownership: Agile sprints, cross-functional code reviews, technical roadmaps"
  ];

  let technicalQA = [
    "• Q: 'How do you optimize asynchronous network calls and API state in modern apps?'\n  → Talking Point: Stale-while-revalidate caching, optimistic UI updates, debounced searches, and resilient offline fallbacks.",
    "• Q: 'How do you structure complex component hierarchies for maintainability?'\n  → Talking Point: Separation of concerns, custom business logic hooks, modular atomic styling, and Context state colocation."
  ];

  if (isAiRole) {
    skills = [
      "• LLM Orchestration: Prompt engineering, few-shot conditioning, structured JSON parsing, streaming tokens",
      "• Production Latency: Client-side fallbacks, token budget optimization, caching vector embeddings",
      "• AI Reliability: Hallucination mitigation, output validation schemas, rate-limiting & exponential backoff",
      "• Full-Stack Integration: Seamlessly tying model APIs with responsive React frontends and local storage"
    ];
    technicalQA = [
      "• Q: 'How do you handle streaming responses and rate limits with LLM APIs in a frontend client?'\n  → Talking Point: Consume server-sent event (SSE) streams chunk-by-chunk with reader loops, provide responsive partial renders, and handle 429 errors with graceful local fallback responses.",
      "• Q: 'How do you guarantee reliable structured outputs (like JSON arrays) from generative models?'\n  → Talking Point: Strict system instructions, JSON schema enforcement, regex sanitization of code fences, and defensive JSON.parse wrappers with local fallback recovery."
    ];
  } else if (isFrontendRole) {
    skills = [
      "• React 18 Mastery: Concurrent rendering, custom hooks, context colocation, memory leak prevention",
      "• Modern Tooling: Vite build pipeline optimization, ES modules, tree shaking, bundle analysis",
      "• Design System & UX: CSS Variables, responsive masonry grids, dark mode color tokens, micro-interactions",
      "• Web Vitals & Accessibility: WCAG compliance, keyboard navigation (Esc/Enter shortcuts), sub-second TTI"
    ];
    technicalQA = [
      "• Q: 'Why choose Vite over Create-React-App for enterprise frontends?'\n  → Talking Point: Vite leverages native browser ES modules during dev for instant HMR without rebuilding bundle graphs, uses lightning-fast Rollup for production, and avoids legacy Webpack/OpenSSL vulnerabilities.",
      "• Q: 'How do you eliminate layout shifts and overlapping in dynamic card grids?'\n  → Talking Point: Replace legacy float layouts with CSS multi-column masonry or CSS Grid, using break-inside: avoid for cards of varying heights."
    ];
  }

  return `🎯 INTERVIEW PREP CHEAT SHEET: ${jobTitle.toUpperCase()}
--------------------------------------------------

1. 🔑 Core Competencies to Emphasize:
${skills.join("\n")}

2. 💡 Anticipated Technical Questions & Talking Points:
${technicalQA.join("\n\n")}

3. ⭐ Behavioral Strategy (STAR Framework):
• Situation: Faced a critical production deadline where legacy tooling failed in modern environments.
• Task: Modernize build architecture and integrate client AI capabilities without breaking user data.
• Action: Architected a modular React 18 + Vite system, integrated dual-engine Google Gemini API with smart offline fallback, and added Web Speech voice transcription.
• Result: Shipped ahead of deadline with 10x faster build times, zero regressions, and received top stakeholder reviews.

4. 📋 5-Step Final Prep Checklist:
[ ] Rehearse 2-minute elevator pitch highlighting AI and React 18 architecture
[ ] Review talking points for STAR behavioral story above
[ ] Prepare 3 thoughtful questions for the engineering interviewer
[ ] Verify live demo links, GitHub portfolio, and README documentation
[ ] Review target company's recent product launches and tech stack`;
}

/**
 * "Ask My Notes" - Semantic Query Assistant across all user notes
 */
export async function askNotes(query, notes, apiKey) {
  // Format user notes into context
  const nonTrashedNotes = notes.filter(n => !n.isTrashed);
  const contextNotes = nonTrashedNotes.map((n, i) => {
    const checkItems = n.checklistItems?.map(ci => `[${ci.completed ? "x" : " "}] ${ci.text}`).join(", ");
    return `Note #${i + 1} [${n.title || "Untitled"}]: ${n.content || ""} ${checkItems ? "(Tasks: " + checkItems + ")" : ""} (Tags: ${n.tags?.join(", ") || "none"})`;
  }).join("\n\n");

  const prompt = `You are KeepAI's knowledge base assistant. Answer the user's question based strictly on their saved notes below.
If the notes contain relevant information, synthesize a clear, helpful answer citing the note titles.
If the notes don't contain the answer, politely mention that and offer a general helpful answer based on productivity best practices.

User Question: "${query}"

User's Notes:
${contextNotes || "No notes saved yet."}`;

  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey, "You are a personal second-brain assistant.");
      if (result) return result;
    } catch (e) {
      console.warn("Using offline askNotes fallback", e);
    }
  }

  // Local semantic search & answer fallback
  const qLower = query.toLowerCase();
  const matchedNotes = nonTrashedNotes.filter(n => {
    const text = `${n.title} ${n.content} ${(n.tags || []).join(" ")}`.toLowerCase();
    return qLower.split(" ").some(word => word.length > 2 && text.includes(word));
  });

  if (matchedNotes.length > 0) {
    const topMatches = matchedNotes.slice(0, 3);
    const bullets = topMatches.map(m => `• **${m.title || "Untitled"}**: ${m.content ? m.content.slice(0, 100) + "..." : "Contains tasks"}`).join("\n");
    return `🔍 Found **${matchedNotes.length}** note(s) related to "${query}":\n\n${bullets}\n\n💡 Tip: You can open any of these notes directly from your board to view or edit full details!`;
  }

  return `I scanned through all your **${nonTrashedNotes.length}** notes. No direct match was found for "${query}".\n\n💡 You can create a new note using the top bar or use the Career Hub to generate interview prep notes!`;
}
