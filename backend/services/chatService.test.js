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
            "You can reach out to her directly via WhatsApp to get started: https://wa.me/fake101"
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