const checkMentorCapacityTool = {
  type: "function",
  name: "check_mentor_capacity",
  description:
    "Checks mentor availability for a learning track. YOU (the model) must first decide which track and experience level fit the user's message, then call this tool with your decision. If the track is full, the result may include an 'alternative' mentor in a different track with real open capacity.",
  parameters: {
    type: "object",
    properties: {
      track: {
        type: "string",
        enum: [
          "Frontend",
          "Backend",
          "Project Management",
          "Cloud Computing",
          "Data Analytics",
          "AI / Machine Learning",
          "Android / Mobile Development",
          "UI/UX Design",
          "Cybersecurity",
          "DevOps / SRE",
          "IT Support",
          "Digital Marketing"
        ],
        description:
          "The single learning track you have classified the user into, based on their message."
      },
      level: {
        type: "string",
        enum: ["beginner", "intermediate"],
        description:
          "The experience level you inferred for the user from their message. Default to 'beginner' when unclear."
      },
      reasoning: {
        type: "string",
        description:
          "One concise sentence explaining WHY you chose this track and level from the user's message. This is your decision trace."
      }
    },
    required: ["track"]
  }
};

module.exports = { checkMentorCapacityTool };
