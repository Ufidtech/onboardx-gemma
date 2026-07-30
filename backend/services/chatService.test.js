const test = require("node:test");
const assert = require("node:assert/strict");
const { createChatService } = require("./chatService");

function mockAiClientDirectResponse(text) {
    return {
        interactions: {
            create: () => Promise.resolve({ text })
        }
    };
}

test("executes Gemma's native function call and returns the result to the interaction", async () => {
    const requests = [];
    const aiClient = {
        interactions: {
            create: async (request) => {
                requests.push(request);
                if (requests.length === 1) {
                    return {
                        id: "interaction-tool-1",
                        status: "requires_action",
                        steps: [{
                            type: "function_call",
                            id: "call-1",
                            name: "check_mentor_capacity",
                            arguments: {
                                track: "Digital Marketing",
                                level: "intermediate",
                                reasoning: "The user wants to improve an existing campaign."
                            }
                        }]
                    };
                }

                return { text: "A mentor is available to guide your digital marketing growth." };
            }
        }
    };
    const tool = { type: "function", name: "check_mentor_capacity", parameters: {} };
    const svc = createChatService({
        aiClient,
        modelName: "gemma-test",
        strictGeminiApi: false,
        checkMentorCapacityTool: tool
    });

    const result = await svc.generateReply(
        "I already run campaigns and want to improve my marketing analytics",
        "native-tool-session"
    );

    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].tools, [tool]);
    assert.equal(requests[1].previous_interaction_id, "interaction-tool-1");
    assert.equal(requests[1].input[0].type, "function_result");
    assert.equal(requests[1].input[0].call_id, "call-1");
    assert.equal(requests[1].input[0].result.track, "Digital Marketing");
    assert.equal(result.payload.track, "Digital Marketing");
    assert.equal(result.payload.level, "intermediate");
    assert.equal(result.payload.decision.decidedBy, "gemma_tool_call");
    assert.equal(result.payload.decision.reasoning, "The user wants to improve an existing campaign.");
    assert.equal(result.payload.reason, "tool_call_success_response");
});

test("a follow-up question with no track keyword still reuses the session's established match", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse("Here's what a frontend dev does..."),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const sessionId = "test-session-1";

    const first = await svc.generateReply("I want to learn frontend, total beginner", sessionId);
    assert.equal(first.payload.track, "Frontend");
    assert.ok(first.payload.mentorLink || first.payload.starterPackUrl);

    // Follow-up with zero track keywords - should still carry the same
    // mentor link / curriculum, not drop them.
    const second = await svc.generateReply("what does a frontend dev do", sessionId);
    assert.equal(second.payload.track, "Frontend");
    assert.equal(second.payload.starterPackUrl, first.payload.starterPackUrl);
    assert.equal(second.payload.statusMessage, "Using your current Frontend match.");
    if (first.payload.mentorLink) {
        assert.equal(second.payload.mentorLink, first.payload.mentorLink);
    }
});

test("a completely unrelated follow-up with no session yet returns no grounded data", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse("Hi there, how can I help?"),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("hello", "test-session-2");
    assert.equal(result.payload.track, undefined);
    assert.equal(result.payload.starterPackUrl, undefined);
});

test("pivoting to a different track mid-conversation updates the session, not stacks onto the old one", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse("Sure, let's talk backend."),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const sessionId = "test-session-3";

    const first = await svc.generateReply("I want frontend", sessionId);
    assert.equal(first.payload.track, "Frontend");

    const second = await svc.generateReply("actually let's do backend instead", sessionId);
    assert.equal(second.payload.track, "Backend");
});

test("different sessionIds never share state", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse("Sure!"),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    await svc.generateReply("I want frontend", "session-a");
    const other = await svc.generateReply("what does that mean", "session-b");

    // session-b never established a track, so it should have nothing to reuse.
    assert.equal(other.payload.track, undefined);
});

test("omitting sessionId entirely still works statelessly (backwards compatible)", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse("Here you go."),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("I want to learn cybersecurity");
    assert.equal(result.payload.track, "Cybersecurity");
});

test("strips literal markdown bold/italic syntax from Gemma's reply text", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "That's great! You can learn **Cloud Computing** from **Priya**. She has *2 seats* available."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("I want to learn cloud computing", "md-test-session");
    assert.ok(!result.payload.reply.includes("**"), "reply must not contain literal ** markdown");
    assert.ok(!result.payload.reply.includes("*2 seats*"), "reply must not contain literal * markdown");
    assert.ok(result.payload.reply.includes("Cloud Computing"));
    assert.ok(result.payload.reply.includes("Priya"));
});

test("strips the mentor's raw link from prose when it's already shown in the dedicated link box", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "You can reach out to her here (https://wa.me/fake101) and get started."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("I want to learn cloud computing", "link-test-session");
    assert.ok(result.payload.mentorLink, "expected a real mentorLink to be present");
    assert.ok(
        !result.payload.reply.includes(result.payload.mentorLink),
        "reply text must not repeat the exact same URL already shown in the mentor link box"
    );
    assert.ok(!result.payload.reply.includes("()"), "reply must not leave empty URL parentheses");
});

test("strips the raw starter-pack URL from prose when the download card is shown", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "I've matched you with Emeka. Access your starter pack at /api/resources/starter-pack?track=IT+Support&level=beginner to get started."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("I want to learn IT support", "pack-link-test-session");
    assert.ok(result.payload.starterPackUrl, "expected a starterPackUrl to be present");
    assert.ok(
        !result.payload.reply.includes(result.payload.starterPackUrl),
        "reply text must not repeat the URL already shown in the starter-pack card"
    );
    assert.ok(!result.payload.reply.includes("at to"), "reply must not contain a dangling preposition");
    assert.ok(result.payload.reply.includes("Access your starter pack to get started."));
});

test("streaming replies clean structured links without falling back", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "Your starter pack is at /api/resources/starter-pack?track=Backend&level=beginner to get started."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const deltas = [];
    const result = await svc.streamReply(
        "I want to learn backend",
        "stream-link-test-session",
        (delta) => deltas.push(delta)
    );

    assert.equal(result.source, "gemini");
    assert.notEqual(result.reason, "gemma_request_failed");
    assert.ok(result.starterPackUrl);
    assert.ok(!result.reply.includes(result.starterPackUrl));
    assert.ok(!result.reply.includes("at to"));
    assert.ok(deltas.length > 0);
});

test("does not ask for a track when a grounded match is already attached", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "No problem at all. Please tap on any of the tracks listed below to explore a different learning path."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.streamReply(
        "I want to learn digital marketing",
        "contradictory-match-session",
        () => {}
    );

    assert.equal(result.track, "Digital Marketing");
    assert.ok(result.mentor || result.starterPackUrl);
    assert.ok(!result.reply.toLowerCase().includes("tap"));
    assert.ok(!result.reply.toLowerCase().includes("tracks listed below"));
    assert.ok(result.reply.includes("Digital Marketing"));
});

test("removes markdown link syntax and dangling connectors from grounded prose", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "Connect via https://wa.me/fake202 and use your [beginner starter pack](/api/resources/starter-pack?track=Backend&level=beginner)."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply(
        "I want to learn backend",
        "markdown-link-cleanup-session"
    );

    assert.ok(!result.payload.reply.includes("["));
    assert.ok(!result.payload.reply.includes("]("));
    assert.ok(!result.payload.reply.includes("via and"));
    assert.ok(result.payload.reply.includes("beginner starter pack"));
});

test("preserves sentence punctuation after removing a duplicate URL", async () => {
    const svc = createChatService({
        aiClient: mockAiClientDirectResponse(
            "Open your pack here /api/resources/starter-pack?track=Backend&level=beginner. You can start today."
        ),
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply(
        "I want to learn backend",
        "punctuation-cleanup-session"
    );

    assert.ok(result.payload.reply.includes("here. You"));
});

test("greetings and contributor requests bypass Gemma and mentor matching", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "This should not be called." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const greeting = await svc.generateReply("hello", "intent-greeting-session");
    const contributor = await svc.generateReply(
        "I want to mentor others and share my experience",
        "intent-contributor-session"
    );

    assert.equal(requestCount, 0);
    assert.equal(greeting.payload.reason, "greeting_shortcut");
    assert.equal(contributor.payload.intent, "contributor");
    assert.equal(greeting.payload.track, undefined);
    assert.equal(contributor.payload.track, undefined);
    assert.equal(greeting.payload.trackOptions, undefined);
    assert.equal(contributor.payload.trackOptions, undefined);
    assert.equal(contributor.payload.statusMessage, "Contributor guidance ready.");
});

test("punctuated greetings and thanks still use direct replies", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "This should not be called." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const greeting = await svc.generateReply("Hi!", "punctuated-greeting-session");
    const thanks = await svc.generateReply("Thank you!", "punctuated-thanks-session");

    assert.equal(requestCount, 0);
    assert.equal(greeting.payload.intent, "greeting");
    assert.equal(thanks.payload.intent, "thanks");
});

test("first-person offers to mentor use contributor guidance without track options", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "This should not be called." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });

    const result = await svc.generateReply("I want to mentor", "mentor-offer-session");

    assert.equal(requestCount, 0);
    assert.equal(result.payload.intent, "contributor");
    assert.equal(result.payload.reason, "contributor_shortcut");
    assert.equal(result.payload.trackOptions, undefined);
});

test("an informational track question does not expose or run the mentor tool", async () => {
    const requests = [];
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async (request) => {
                    requests.push(request);
                    return { text: "Frontend focuses on the user-facing part of an application." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: { name: "check_mentor_capacity" }
    });

    const result = await svc.generateReply(
        "What does a frontend mentor do?",
        "informational-track-session"
    );

    assert.equal(requests.length, 1);
    assert.equal(requests[0].tools, undefined);
    assert.equal(result.payload.track, undefined);
    assert.equal(result.payload.reason, "compose_no_context");
    assert.equal(result.payload.statusMessage, "Response ready.");
});

test("a clear track request still enables matching and grounds a result", async () => {
    const requests = [];
    const tool = { name: "check_mentor_capacity" };
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async (request) => {
                    requests.push(request);
                    return { text: "I found a grounded option for you." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: tool
    });

    const result = await svc.generateReply(
        "I want to learn backend",
        "explicit-track-session"
    );

    assert.deepEqual(requests[0].tools, [tool]);
    assert.equal(result.payload.track, "Backend");
    assert.equal(result.payload.intent, "learner");
    assert.equal(result.payload.decision.decidedBy, "inference_fallback");
});

test("thanks after a match reuses session context without another model call", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "Your learning match is ready." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });
    const sessionId = "contextual-thanks-session";

    const match = await svc.generateReply("I want to learn cloud computing", sessionId);
    const thanks = await svc.generateReply("thank you", sessionId);

    assert.equal(requestCount, 1);
    assert.equal(thanks.payload.track, match.payload.track);
    assert.equal(thanks.payload.starterPackUrl, match.payload.starterPackUrl);
    assert.equal(thanks.payload.reason, "thanks_with_match_shortcut");
    assert.match(thanks.payload.reply, /Cloud Computing/);
    assert.equal(thanks.payload.statusMessage, "Current match ready.");
});

test("a vague follow-up asks about the active match without checking capacity again", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "Your match is ready." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });
    const sessionId = "contextual-vague-session";

    await svc.generateReply("I want to learn data analytics", sessionId);
    const followUp = await svc.generateReply("okay", sessionId);

    assert.equal(requestCount, 1);
    assert.equal(followUp.payload.track, "Data Analytics");
    assert.equal(followUp.payload.reason, "vague_message_with_match_shortcut");
    assert.match(followUp.payload.reply, /Data Analytics/);
});

test("contributor mode takes priority over an older match for vague follow-ups", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    return { text: "Your cybersecurity match is ready." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });
    const sessionId = "contributor-over-old-match-session";

    await svc.generateReply("I want to learn cybersecurity", sessionId);
    await svc.generateReply("I want to mentor", sessionId);
    const vague = await svc.generateReply("how", sessionId);
    const thanks = await svc.generateReply("thanks", sessionId);

    assert.equal(requestCount, 1);
    assert.equal(vague.payload.intent, "contributor");
    assert.equal(vague.payload.reason, "vague_message_with_contributor_context_shortcut");
    assert.equal(vague.payload.track, undefined);
    assert.equal(vague.payload.mentor, undefined);
    assert.equal(vague.payload.trackOptions, undefined);
    assert.match(vague.payload.reply, /How would you like to contribute/);
    assert.equal(thanks.payload.intent, "contributor");
    assert.equal(thanks.payload.reason, "thanks_with_contributor_context_shortcut");
    assert.equal(thanks.payload.track, undefined);
});

test("a fallback reply preserves the active session match", async () => {
    let requestCount = 0;
    const svc = createChatService({
        aiClient: {
            interactions: {
                create: async () => {
                    requestCount += 1;
                    if (requestCount > 1) {
                        throw new Error("simulated follow-up failure");
                    }
                    return { text: "Your backend learning match is ready." };
                }
            }
        },
        modelName: "x",
        strictGeminiApi: false,
        checkMentorCapacityTool: {}
    });
    const sessionId = "grounded-fallback-session";

    const match = await svc.generateReply("I want to learn backend", sessionId);
    const fallback = await svc.generateReply("What should I do next?", sessionId);

    assert.equal(fallback.payload.source, "fallback");
    assert.equal(fallback.payload.reason, "gemma_request_failed");
    assert.equal(fallback.payload.track, match.payload.track);
    assert.equal(fallback.payload.starterPackUrl, match.payload.starterPackUrl);
    assert.equal(
        fallback.payload.statusMessage,
        match.payload.status === "success"
            ? "Using your current Backend match."
            : "Using your current Backend learning plan."
    );
});